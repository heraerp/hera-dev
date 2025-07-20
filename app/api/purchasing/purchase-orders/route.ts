/**
 * HERA Universal - Purchase Order API Routes
 * 
 * Next.js 15 App Router API Route Handler
 * Handles GET and POST operations for purchase orders
 * 
 * Uses HERA's 5-table universal architecture:
 * - core_entities: Purchase order records
 * - core_dynamic_data: Custom PO fields
 * - universal_transactions: Financial tracking
 * - core_relationships: PO-supplier relationships
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { UniversalCrudService } from '@/lib/services/universalCrudService';
import { UniversalTransactionService } from '@/lib/services/universalTransactionService';

// Admin client for testing purposes
const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

// TypeScript interfaces
interface PurchaseOrderItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  totalPrice?: number;
}

interface PurchaseOrderRequest {
  organizationId: string;
  supplierId: string;
  items: PurchaseOrderItem[];
  deliveryDate?: string;
  notes?: string;
  requestedBy?: string;
}

interface ApprovalConfig {
  custom_auto_approve_under?: string;
  tier_1_threshold?: string;
  tier_2_threshold?: string;
  tier_1_approver_user_id?: string;
  tier_2_approver_user_id?: string;
  tier_3_approver_user_id?: string;
}

// GET /api/purchasing/purchase-orders
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient(); // Use admin client for demo
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const status = searchParams.get('status');
    const supplierId = searchParams.get('supplierId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '0'); // 0 means no limit
    const offset = limit > 0 ? (page - 1) * limit : 0;

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    // Get purchase orders from universal_transactions
    let query = supabase
      .from('universal_transactions')
      .select(`
        *,
        procurement_metadata,
        transaction_data
      `, { count: 'exact' })
      .eq('organization_id', organizationId)
      .eq('transaction_type', 'purchase_order')
      .order('transaction_date', { ascending: false });

    // Only apply pagination if limit is specified and > 0
    if (limit > 0) {
      query = query.range(offset, offset + limit - 1);
    }

    // Apply filters
    if (status) {
      query = query.eq('workflow_status', status);
    }

    if (supplierId) {
      query = query.contains('procurement_metadata', { supplier_id: supplierId });
    }

    // For receiving, only show approved/auto_approved POs that are not fully received
    const forReceiving = searchParams.get('forReceiving');
    if (forReceiving === 'true') {
      query = query.in('workflow_status', ['approved', 'auto_approved']);
    }

    const { data: transactions, error, count } = await query;

    if (error) {
      console.error('Error fetching purchase orders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch purchase orders' },
        { status: 500 }
      );
    }

    // Enrich with supplier and item details
    const enrichedPOs = await Promise.all(
      (transactions || []).map(async (transaction) => {
        const metadata = transaction.procurement_metadata as any || {};
        
        // Get supplier details
        let supplier = null;
        if (metadata.supplier_id) {
          const { data: supplierEntity } = await supabase
            .from('core_entities')
            .select('*')
            .eq('id', metadata.supplier_id)
            .eq('entity_type', 'supplier')
            .single();

          if (supplierEntity) {
            // Get supplier dynamic data
            const { data: dynamicData } = await supabase
              .from('core_dynamic_data')
              .select('field_name, field_value')
              .eq('entity_id', supplierEntity.id);

            const supplierFields = (dynamicData || []).reduce((acc, field) => {
              acc[field.field_name] = field.field_value;
              return acc;
            }, {} as Record<string, any>);

            supplier = {
              ...supplierEntity,
              ...supplierFields
            };
          }
        }

        return {
          id: transaction.id,
          poNumber: transaction.transaction_number,
          date: transaction.transaction_date,
          totalAmount: transaction.total_amount,
          currency: transaction.currency,
          status: transaction.workflow_status || transaction.transaction_status,
          supplier,
          supplierId: metadata.supplier_id, // Include the original supplier ID from metadata
          supplierName: supplier?.entity_name || supplier?.name || 'Unknown Supplier',
          items: metadata.items || [],
          requestedBy: metadata.requested_by,
          approvalTier: metadata.approval_tier,
          approvedBy: metadata.approved_by,
          requestedDeliveryDate: metadata.delivery_date,
          notes: metadata.notes,
          requiresApproval: transaction.requires_approval,
          createdAt: transaction.created_at,
          updatedAt: transaction.updated_at
        };
      })
    );

    return NextResponse.json({
      data: enrichedPOs,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Purchase order GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/purchasing/purchase-orders
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient(); // Use admin client for demo
    const body: PurchaseOrderRequest = await request.json();

    console.log('Creating purchase order with data:', JSON.stringify(body, null, 2));

    // Validate request
    if (!body.organizationId || !body.supplierId || !body.items?.length) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, supplierId, items' },
        { status: 400 }
      );
    }

    // Calculate total amount
    const totalAmount = body.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);

    console.log('Calculated total amount:', totalAmount);

    // Simple approval logic - avoid complex queries for now
    const autoApproveThreshold = 100; // As per Mario's Restaurant approval matrix

    // Generate simple PO number
    const timestamp = Date.now();
    const poNumber = `PO-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${timestamp.toString().slice(-6)}`;

    console.log('Generated PO number:', poNumber);

    // Create the purchase order transaction with metadata
    const transactionData = {
      organization_id: body.organizationId,
      transaction_type: 'purchase_order',
      transaction_number: poNumber,
      transaction_date: new Date().toISOString().split('T')[0],
      total_amount: totalAmount,
      currency: 'USD',
      transaction_status: 'active',
      workflow_status: totalAmount <= autoApproveThreshold ? 'auto_approved' : 'pending_approval',
      procurement_metadata: {
        supplier_id: body.supplierId,
        supplier_name: body.supplierName,
        items: body.items || [],
        delivery_date: body.requestedDeliveryDate,
        notes: body.notes,
        created_via: 'ui_form'
      }
    };

    console.log('About to insert transaction:', JSON.stringify(transactionData, null, 2));

    const { data: transaction, error: transactionError } = await supabase
      .from('universal_transactions')
      .insert(transactionData)
      .select()
      .single();

    if (transactionError) {
      console.error('Error creating purchase order:', transactionError);
      return NextResponse.json(
        { 
          error: 'Failed to create purchase order',
          details: transactionError
        },
        { status: 500 }
      );
    }

    console.log('Transaction created successfully:', transaction);

    // Skip relationship creation for now to avoid additional complexity

    console.log(`✅ PO created: ${poNumber}, Status: ${transaction.transaction_status}, Total: $${totalAmount}`);

    return NextResponse.json({
      success: true,
      data: {
        id: transaction.id,
        poNumber,
        status: transaction.transaction_status,
        totalAmount,
        message: `Purchase order created successfully (total: $${totalAmount})`
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Purchase order POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/purchasing/purchase-orders
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Purchase order ID is required' },
        { status: 400 }
      );
    }

    console.log('Updating purchase order:', id, 'with data:', updateData);

    // If updating items, recalculate total
    if (updateData.items) {
      const totalAmount = updateData.items.reduce((sum: number, item: any) => {
        return sum + (item.quantity * item.unitPrice);
      }, 0);
      updateData.totalAmount = totalAmount;
    }

    // Update the purchase order
    const updateFields: any = {};
    
    if (updateData.totalAmount !== undefined) {
      updateFields.total_amount = updateData.totalAmount;
    }
    
    if (updateData.status) {
      updateFields.transaction_status = updateData.status;
    }

    // Store additional data in procurement_metadata
    if (updateData.items || updateData.notes || updateData.requestedDeliveryDate || updateData.supplierId) {
      const { data: existingTransaction } = await supabase
        .from('universal_transactions')
        .select('procurement_metadata')
        .eq('id', id)
        .single();

      const existingMetadata = existingTransaction?.procurement_metadata || {};
      
      const newMetadata = {
        ...existingMetadata,
        ...(updateData.items && { items: updateData.items }),
        ...(updateData.notes !== undefined && { notes: updateData.notes }),
        ...(updateData.requestedDeliveryDate !== undefined && { delivery_date: updateData.requestedDeliveryDate }),
        ...(updateData.supplierId && { supplier_id: updateData.supplierId })
      };

      updateFields.procurement_metadata = newMetadata;
    }

    const { data: transaction, error } = await supabase
      .from('universal_transactions')
      .update(updateFields)
      .eq('id', id)
      .eq('transaction_type', 'purchase_order')
      .select()
      .single();

    if (error) {
      console.error('Error updating purchase order:', error);
      return NextResponse.json(
        { error: 'Failed to update purchase order' },
        { status: 500 }
      );
    }

    console.log('✅ PO updated:', transaction.transaction_number);

    return NextResponse.json({
      success: true,
      data: transaction,
      message: 'Purchase order updated successfully'
    });

  } catch (error) {
    console.error('Purchase order PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/purchasing/purchase-orders
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Purchase order ID is required' },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    // Delete the purchase order
    const { error } = await supabase
      .from('universal_transactions')
      .delete()
      .eq('id', id)
      .eq('transaction_type', 'purchase_order');

    if (error) {
      console.error('Error deleting purchase order:', error);
      return NextResponse.json(
        { error: 'Failed to delete purchase order' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Purchase order deleted successfully'
    });

  } catch (error) {
    console.error('Purchase order DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}