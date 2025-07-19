/**
 * HERA Universal - Goods Receipt API
 * 
 * Mario's Restaurant Goods Receipt & Quality Control System
 * Handles delivery processing, quality inspection, and inventory updates
 * 
 * Quality Control Features:
 * - Temperature compliance checking
 * - Visual inspection results
 * - Damage assessment
 * - Partial delivery handling
 * - Supplier performance tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Admin client for demo/testing purposes
const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

interface GoodsReceiptRequest {
  organizationId: string;
  poId: string;
  receivedBy: string;
  receivedByName: string;
  deliveryDate: string;
  deliveryStatus: 'complete' | 'partial' | 'damaged' | 'rejected';
  qualityStatus: 'approved' | 'rejected' | 'conditional';
  items: ReceiptItem[];
  qualityInspection: QualityInspection;
  notes?: string;
}

interface ReceiptItem {
  itemName: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unitPrice: number;
  unit: string;
  condition: 'good' | 'damaged' | 'expired' | 'rejected';
  qualityNotes?: string;
}

interface QualityInspection {
  temperatureCheck: 'passed' | 'failed' | 'not_applicable';
  packagingCondition: 'good' | 'damaged' | 'poor';
  visualInspection: 'passed' | 'failed' | 'conditional';
  freshness: 'excellent' | 'good' | 'acceptable' | 'poor' | 'rejected';
  overallRating: number; // 1-5 scale
  inspectorNotes: string;
  inspectorName: string;
  inspectionDate: string;
}

// POST /api/purchasing/goods-receipt
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body: GoodsReceiptRequest = await request.json();

    console.log('Processing goods receipt:', JSON.stringify(body, null, 2));

    // Validate request
    if (!body.organizationId || !body.poId || !body.receivedBy || !body.items?.length) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, poId, receivedBy, items' },
        { status: 400 }
      );
    }

    // Get the original PO
    const { data: po, error: poError } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('id', body.poId)
      .eq('organization_id', body.organizationId)
      .eq('transaction_type', 'purchase_order')
      .single();

    if (poError || !po) {
      console.error('PO not found:', poError);
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      );
    }

    // Check PO is approved
    if (po.workflow_status !== 'approved') {
      return NextResponse.json(
        { error: 'Cannot create goods receipt for non-approved purchase order' },
        { status: 400 }
      );
    }

    // Generate goods receipt number
    const grNumber = `GR-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const grId = crypto.randomUUID();

    // Calculate totals and variances
    const originalItems = po.procurement_metadata?.items || [];
    const totalReceived = body.items.reduce((sum, item) => sum + (item.receivedQuantity * item.unitPrice), 0);
    const totalOrdered = originalItems.reduce((sum: any, item: any) => sum + (item.quantity * item.unitPrice), 0);
    const variance = totalReceived - totalOrdered;

    // Create goods receipt transaction
    const goodsReceiptData = {
      id: grId,
      organization_id: body.organizationId,
      transaction_type: 'goods_receipt',
      transaction_subtype: 'delivery_receipt',
      transaction_number: grNumber,
      transaction_date: body.deliveryDate,
      total_amount: totalReceived,
      currency: po.currency || 'USD',
      transaction_status: body.qualityStatus,
      workflow_status: body.deliveryStatus,
      procurement_metadata: {
        po_id: body.poId,
        po_number: po.transaction_number,
        supplier_id: po.procurement_metadata?.supplier_id,
        received_by: body.receivedBy,
        received_by_name: body.receivedByName,
        delivery_status: body.deliveryStatus,
        quality_status: body.qualityStatus,
        items: body.items,
        quality_inspection: body.qualityInspection,
        variance_amount: variance,
        variance_percentage: totalOrdered > 0 ? ((variance / totalOrdered) * 100) : 0,
        receipt_notes: body.notes,
        created_via: 'ui_form'
      }
    };

    const { data: goodsReceipt, error: grError } = await supabase
      .from('universal_transactions')
      .insert(goodsReceiptData)
      .select()
      .single();

    if (grError) {
      console.error('Error creating goods receipt:', grError);
      return NextResponse.json(
        { error: 'Failed to create goods receipt' },
        { status: 500 }
      );
    }

    // Create relationship between PO and Goods Receipt
    await supabase
      .from('core_relationships')
      .insert({
        organization_id: body.organizationId,
        relationship_type: 'po_goods_receipt',
        relationship_name: 'Purchase Order has Goods Receipt',
        parent_entity_id: body.poId,
        child_entity_id: grId,
        relationship_data: {
          delivery_status: body.deliveryStatus,
          quality_status: body.qualityStatus,
          variance_amount: variance,
          received_date: body.deliveryDate
        },
        is_active: true,
        created_by: body.receivedBy
      });

    // Update inventory levels for received items
    await Promise.all(
      body.items.map(async (item) => {
        if (item.condition === 'good' && item.receivedQuantity > 0) {
          // Create inventory adjustment transaction
          await supabase
            .from('universal_transactions')
            .insert({
              organization_id: body.organizationId,
              transaction_type: 'stock_movement',
              transaction_subtype: 'goods_receipt',
              transaction_number: `ADJ-${grNumber}-${item.itemName.replace(/\s+/g, '').toUpperCase()}`,
              transaction_date: body.deliveryDate,
              total_amount: 0,
              currency: 'USD',
              procurement_metadata: {
                item_name: item.itemName,
                adjustment_type: 'increase',
                quantity_changed: item.receivedQuantity,
                reason: `Goods receipt from PO ${po.transaction_number}`,
                quality_status: item.condition,
                gr_number: grNumber,
                gr_id: grId
              }
            });
        }
      })
    );

    // Update PO status to indicate receipt processing
    const poUpdateData: any = {
      updated_at: new Date().toISOString()
    };

    let poMetadata = po.procurement_metadata || {};
    poMetadata = {
      ...poMetadata,
      goods_receipt_status: body.deliveryStatus,
      goods_receipt_date: body.deliveryDate,
      goods_receipt_number: grNumber,
      quality_check_status: body.qualityStatus,
      variance_amount: variance
    };

    if (body.deliveryStatus === 'complete' && body.qualityStatus === 'approved') {
      poUpdateData.workflow_status = 'received';
      poUpdateData.transaction_status = 'completed';
    } else if (body.deliveryStatus === 'partial') {
      poUpdateData.workflow_status = 'partially_received';
    } else if (body.qualityStatus === 'rejected') {
      poUpdateData.workflow_status = 'rejected_delivery';
    }

    poUpdateData.procurement_metadata = poMetadata;

    await supabase
      .from('universal_transactions')
      .update(poUpdateData)
      .eq('id', body.poId);

    console.log(`✅ Goods Receipt ${grNumber} created for PO ${po.transaction_number}`);

    return NextResponse.json({
      success: true,
      data: {
        grId: grId,
        grNumber: grNumber,
        poNumber: po.transaction_number,
        deliveryStatus: body.deliveryStatus,
        qualityStatus: body.qualityStatus,
        totalReceived: totalReceived,
        variance: variance,
        qualityRating: body.qualityInspection.overallRating
      },
      message: 'Goods receipt processed successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Goods receipt error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/purchasing/goods-receipt - Get goods receipts
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const poId = searchParams.get('poId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('transaction_type', 'goods_receipt')
      .order('transaction_date', { ascending: false });

    // Apply filters
    if (poId) {
      query = query.contains('procurement_metadata', { po_id: poId });
    }

    if (status) {
      query = query.eq('workflow_status', status);
    }

    if (startDate) {
      query = query.gte('transaction_date', startDate);
    }

    if (endDate) {
      query = query.lte('transaction_date', endDate);
    }

    const { data: receipts, error } = await query;

    if (error) {
      console.error('Error fetching goods receipts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch goods receipts' },
        { status: 500 }
      );
    }

    // Enrich with quality and performance data
    const enrichedReceipts = (receipts || []).map(receipt => {
      const metadata = receipt.procurement_metadata || {};
      
      return {
        id: receipt.id,
        grNumber: receipt.transaction_number,
        date: receipt.transaction_date,
        poNumber: metadata.po_number,
        poId: metadata.po_id,
        supplierId: metadata.supplier_id,
        receivedBy: metadata.received_by_name,
        deliveryStatus: metadata.delivery_status,
        qualityStatus: metadata.quality_status,
        totalAmount: receipt.total_amount,
        variance: metadata.variance_amount,
        variancePercentage: metadata.variance_percentage,
        items: metadata.items || [],
        qualityInspection: metadata.quality_inspection || {},
        notes: metadata.receipt_notes,
        createdAt: receipt.created_at,
        updatedAt: receipt.updated_at
      };
    });

    // Calculate summary statistics
    const summary = {
      total: enrichedReceipts.length,
      complete: enrichedReceipts.filter(r => r.deliveryStatus === 'complete').length,
      partial: enrichedReceipts.filter(r => r.deliveryStatus === 'partial').length,
      damaged: enrichedReceipts.filter(r => r.deliveryStatus === 'damaged').length,
      qualityApproved: enrichedReceipts.filter(r => r.qualityStatus === 'approved').length,
      qualityRejected: enrichedReceipts.filter(r => r.qualityStatus === 'rejected').length,
      totalValue: enrichedReceipts.reduce((sum, r) => sum + r.totalAmount, 0),
      averageQualityRating: enrichedReceipts.length > 0 
        ? enrichedReceipts
            .filter(r => r.qualityInspection?.overallRating)
            .reduce((sum, r) => sum + (r.qualityInspection?.overallRating || 0), 0) / 
          enrichedReceipts.filter(r => r.qualityInspection?.overallRating).length
        : 0
    };

    return NextResponse.json({
      data: enrichedReceipts,
      summary
    });

  } catch (error) {
    console.error('Get goods receipts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}