/**
 * HERA Universal - Cash Market Receipts API Routes
 * 
 * Next.js 15 App Router API Route Handler
 * Uses HERA's universal architecture:
 * - core_entities: Receipt documents
 * - core_dynamic_data: Receipt metadata (image URL, AI data, etc.)
 * - core_relationships: Receipt-transaction relationships
 * - universal_transactions: Financial impact tracking
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

// TypeScript interfaces
interface ReceiptRequest {
  organizationId: string;
  filename: string;
  imageUrl: string;
  uploadedBy: string;
  aiProcessingData?: {
    vendor?: string;
    amount?: number;
    date?: string;
    items?: string[];
    confidence?: number;
    extractedText?: string;
  };
  processingStatus?: 'processing' | 'completed' | 'error' | 'needs_review';
  vendorId?: string;
  transactionId?: string;
  notes?: string;
}

interface ReceiptFilters {
  organizationId: string;
  status?: string;
  vendorId?: string;
  dateFrom?: string;
  dateTo?: string;
  hasTransaction?: boolean;
  limit?: number;
  offset?: number;
}

// GET /api/cash-market/receipts
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    
    const filters: ReceiptFilters = {
      organizationId: searchParams.get('organizationId') || '',
      status: searchParams.get('status') || undefined,
      vendorId: searchParams.get('vendorId') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      hasTransaction: searchParams.get('hasTransaction') === 'true' || undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0')
    };
    
    if (!filters.organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    // Get receipt entities
    let query = supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', filters.organizationId)
      .eq('entity_type', 'cash_market_receipt')
      .order('created_at', { ascending: false });

    // Apply date filters
    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    // Apply pagination
    query = query.range(filters.offset, filters.offset + filters.limit - 1);

    const { data: entities, error } = await query;

    if (error) {
      console.error('Error fetching receipts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch receipts' },
        { status: 500 }
      );
    }

    // Get dynamic data for all receipts
    let dynamicData: any[] = [];
    const entityIds = entities?.map(e => e.id) || [];
    
    if (entityIds.length > 0) {
      const { data: dynamicDataResult } = await supabase
        .from('core_dynamic_data')
        .select('entity_id, field_name, field_value, field_type')
        .in('entity_id', entityIds);
      
      dynamicData = dynamicDataResult || [];
    }

    // Group dynamic data by entity_id
    const dynamicDataMap = dynamicData.reduce((acc, item) => {
      if (!acc[item.entity_id]) {
        acc[item.entity_id] = {};
      }
      
      let value = item.field_value;
      if (item.field_type === 'json' && value) {
        try {
          value = JSON.parse(value);
        } catch {
          // Keep as string if parse fails
        }
      } else if (item.field_type === 'number' && value) {
        value = parseFloat(value);
      }
      
      acc[item.entity_id][item.field_name] = value;
      return acc;
    }, {} as Record<string, Record<string, any>>);

    // Get vendor information for receipts that have vendorId
    const vendorIds = [...new Set(
      Object.values(dynamicDataMap)
        .map(data => data.vendorId)
        .filter(Boolean)
    )] as string[];

    let vendors: Record<string, any> = {};
    if (vendorIds.length > 0) {
      const { data: vendorEntities } = await supabase
        .from('core_entities')
        .select('id, entity_name, entity_code')
        .eq('organization_id', filters.organizationId)
        .eq('entity_type', 'cash_market_vendor')
        .in('id', vendorIds);

      vendors = (vendorEntities || []).reduce((acc, vendor) => {
        acc[vendor.id] = vendor;
        return acc;
      }, {} as Record<string, any>);
    }

    // Get transaction relationships
    const { data: relationships } = entityIds.length > 0 ? await supabase
      .from('core_relationships')
      .select('parent_entity_id, child_entity_id, relationship_type')
      .eq('organization_id', filters.organizationId)
      .eq('relationship_type', 'transaction_receipt')
      .in('child_entity_id', entityIds) : { data: [] };

    const transactionMap = (relationships || []).reduce((acc, rel) => {
      acc[rel.child_entity_id] = rel.parent_entity_id;
      return acc;
    }, {} as Record<string, string>);

    // Enrich receipts with all data
    const enrichedReceipts = (entities || []).map(entity => {
      const receiptData = dynamicDataMap[entity.id] || {};
      const vendorId = receiptData.vendorId;
      const transactionId = transactionMap[entity.id];
      
      return {
        id: entity.id,
        filename: receiptData.filename || entity.entity_name,
        code: entity.entity_code,
        imageUrl: receiptData.imageUrl || '',
        uploadedBy: receiptData.uploadedBy || '',
        processingStatus: receiptData.processingStatus || 'processing',
        aiProcessingData: receiptData.aiProcessingData || {},
        vendor: vendorId && vendors[vendorId] ? {
          id: vendorId,
          name: vendors[vendorId].entity_name,
          code: vendors[vendorId].entity_code
        } : null,
        transactionId: transactionId || null,
        hasTransaction: !!transactionId,
        notes: receiptData.notes || '',
        confidence: receiptData.aiProcessingData?.confidence || 0,
        extractedAmount: receiptData.aiProcessingData?.amount || 0,
        extractedVendor: receiptData.aiProcessingData?.vendor || '',
        isActive: entity.is_active,
        createdAt: entity.created_at,
        updatedAt: entity.updated_at,
        ...receiptData
      };
    });

    // Apply additional filters that need parsed data
    let filteredReceipts = enrichedReceipts;
    
    if (filters.status) {
      filteredReceipts = filteredReceipts.filter(r => r.processingStatus === filters.status);
    }
    
    if (filters.vendorId) {
      filteredReceipts = filteredReceipts.filter(r => r.vendor?.id === filters.vendorId);
    }
    
    if (filters.hasTransaction !== undefined) {
      filteredReceipts = filteredReceipts.filter(r => r.hasTransaction === filters.hasTransaction);
    }

    // Generate summary statistics
    const summary = {
      total: filteredReceipts.length,
      byStatus: filteredReceipts.reduce((acc, r) => {
        acc[r.processingStatus] = (acc[r.processingStatus] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      withTransactions: filteredReceipts.filter(r => r.hasTransaction).length,
      withoutTransactions: filteredReceipts.filter(r => !r.hasTransaction).length,
      averageConfidence: filteredReceipts.length > 0 
        ? filteredReceipts.reduce((sum, r) => sum + (r.confidence || 0), 0) / filteredReceipts.length 
        : 0,
      totalExtractedAmount: filteredReceipts.reduce((sum, r) => sum + (r.extractedAmount || 0), 0),
      topVendors: Object.values(
        filteredReceipts.reduce((acc, r) => {
          if (r.vendor) {
            if (!acc[r.vendor.id]) {
              acc[r.vendor.id] = {
                vendorId: r.vendor.id,
                vendorName: r.vendor.name,
                receiptCount: 0,
                totalAmount: 0
              };
            }
            acc[r.vendor.id].receiptCount++;
            acc[r.vendor.id].totalAmount += r.extractedAmount || 0;
          }
          return acc;
        }, {} as Record<string, any>)
      ).sort((a, b) => b.receiptCount - a.receiptCount).slice(0, 5)
    };

    return NextResponse.json({
      data: filteredReceipts,
      summary,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        hasMore: filteredReceipts.length === filters.limit
      }
    });

  } catch (error) {
    console.error('Cash market receipts GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/cash-market/receipts
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body: ReceiptRequest = await request.json();

    // Validate required fields
    if (!body.organizationId || !body.filename || !body.imageUrl || !body.uploadedBy) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, filename, imageUrl, uploadedBy' },
        { status: 400 }
      );
    }

    // Generate receipt code
    const receiptCode = `RCP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const receiptId = crypto.randomUUID();

    // Create receipt entity
    const { data: entity, error: entityError } = await supabase
      .from('core_entities')
      .insert({
        id: receiptId,
        organization_id: body.organizationId,
        entity_type: 'cash_market_receipt',
        entity_name: body.filename,
        entity_code: receiptCode,
        is_active: true
      })
      .select()
      .single();

    if (entityError) {
      console.error('Error creating receipt entity:', entityError);
      return NextResponse.json(
        { error: 'Failed to create receipt' },
        { status: 500 }
      );
    }

    // Create dynamic data fields
    const dynamicFields = [
      { field_name: 'filename', field_value: body.filename, field_type: 'text' },
      { field_name: 'imageUrl', field_value: body.imageUrl, field_type: 'text' },
      { field_name: 'uploadedBy', field_value: body.uploadedBy, field_type: 'text' },
      { field_name: 'processingStatus', field_value: body.processingStatus || 'processing', field_type: 'text' },
      { field_name: 'aiProcessingData', field_value: JSON.stringify(body.aiProcessingData || {}), field_type: 'json' },
      { field_name: 'notes', field_value: body.notes || '', field_type: 'text' }
    ];

    // Add vendor ID if provided
    if (body.vendorId) {
      dynamicFields.push({
        field_name: 'vendorId',
        field_value: body.vendorId,
        field_type: 'text'
      });
    }

    const fieldsToInsert = dynamicFields.map(field => ({
      entity_id: receiptId,
      ...field
    }));

    const { error: dynamicError } = await supabase
      .from('core_dynamic_data')
      .insert(fieldsToInsert);

    if (dynamicError) {
      console.error('Error creating receipt dynamic data:', dynamicError);
      // Clean up entity if dynamic data fails
      await supabase.from('core_entities').delete().eq('id', receiptId);
      return NextResponse.json(
        { error: 'Failed to create receipt data' },
        { status: 500 }
      );
    }

    // Create relationship with transaction if provided
    if (body.transactionId) {
      const { error: relationshipError } = await supabase
        .from('core_relationships')
        .insert({
          organization_id: body.organizationId,
          relationship_type: 'transaction_receipt',
          relationship_name: 'Transaction Receipt',
          parent_entity_id: body.transactionId,
          child_entity_id: receiptId,
          relationship_data: JSON.stringify({
            receiptCode: receiptCode,
            filename: body.filename,
            attachmentType: 'receipt'
          }),
          is_active: true
        });

      if (relationshipError) {
        console.error('Error creating receipt-transaction relationship:', relationshipError);
      }
    }

    // Create relationship with vendor if provided
    if (body.vendorId) {
      const { error: vendorRelationshipError } = await supabase
        .from('core_relationships')
        .insert({
          organization_id: body.organizationId,
          relationship_type: 'vendor_receipt',
          relationship_name: 'Vendor Receipt',
          parent_entity_id: body.vendorId,
          child_entity_id: receiptId,
          relationship_data: JSON.stringify({
            receiptCode: receiptCode,
            filename: body.filename,
            processingStatus: body.processingStatus || 'processing'
          }),
          is_active: true
        });

      if (vendorRelationshipError) {
        console.error('Error creating vendor-receipt relationship:', vendorRelationshipError);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: receiptId,
        code: receiptCode,
        filename: body.filename,
        processingStatus: body.processingStatus || 'processing',
        aiConfidence: body.aiProcessingData?.confidence || 0
      },
      message: 'Receipt created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Cash market receipts POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}