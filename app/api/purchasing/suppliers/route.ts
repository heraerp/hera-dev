/**
 * HERA Universal - Suppliers API Routes
 * 
 * Next.js 15 App Router API Route Handler
 * Handles GET and POST operations for suppliers
 * 
 * Uses HERA's universal architecture:
 * - core_entities: Supplier records
 * - core_dynamic_data: Custom supplier fields
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { UniversalCrudService } from '@/lib/services/universalCrudService';

// Admin client for testing purposes
const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

interface SupplierRequest {
  organizationId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  category?: string;
  paymentTerms?: string;
  notes?: string;
}

// GET /api/purchasing/suppliers
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient(); // Use admin client for demo
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const category = searchParams.get('category');
    const active = searchParams.get('active');
    const search = searchParams.get('search');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    // Get suppliers from core_entities
    let query = supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'supplier')
      .order('entity_name', { ascending: true });

    // Apply filters
    if (active !== null) {
      query = query.eq('is_active', active === 'true');
    }

    const { data: suppliers, error } = await query;

    if (error) {
      console.error('Error fetching suppliers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch suppliers' },
        { status: 500 }
      );
    }

    // Get dynamic data for all suppliers
    const supplierIds = suppliers?.map(s => s.id) || [];
    let dynamicData: any[] = [];
    
    if (supplierIds.length > 0) {
      const { data: dynamicDataResult } = await supabase
        .from('core_dynamic_data')
        .select('entity_id, field_name, field_value')
        .in('entity_id', supplierIds);
      
      dynamicData = dynamicDataResult || [];
    }

    // Group dynamic data by entity_id
    const dynamicDataMap = dynamicData.reduce((acc, item) => {
      if (!acc[item.entity_id]) {
        acc[item.entity_id] = {};
      }
      acc[item.entity_id][item.field_name] = item.field_value;
      return acc;
    }, {} as Record<string, Record<string, any>>);

    // Combine suppliers with their dynamic data
    let enrichedSuppliers = (suppliers || []).map(supplier => ({
      id: supplier.id,
      name: supplier.entity_name,
      code: supplier.entity_code,
      isActive: supplier.is_active,
      createdAt: supplier.created_at,
      updatedAt: supplier.updated_at,
      ...dynamicDataMap[supplier.id]
    }));

    // Apply additional filters
    if (category) {
      enrichedSuppliers = enrichedSuppliers.filter(s => s.category === category);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      enrichedSuppliers = enrichedSuppliers.filter(s => 
        s.name.toLowerCase().includes(searchLower) ||
        s.email?.toLowerCase().includes(searchLower) ||
        s.contactPerson?.toLowerCase().includes(searchLower)
      );
    }

    // Get performance metrics for each supplier
    const suppliersWithMetrics = await Promise.all(
      enrichedSuppliers.map(async (supplier) => {
        // Get purchase order count and total amount
        const { data: poMetrics } = await supabase
          .from('universal_transactions')
          .select('total_amount, workflow_status')
          .eq('organization_id', organizationId)
          .eq('transaction_type', 'purchase_order')
          .contains('procurement_metadata', { supplier_id: supplier.id });

        const totalOrders = poMetrics?.length || 0;
        const totalAmount = poMetrics?.reduce((sum, po) => sum + po.total_amount, 0) || 0;
        const completedOrders = poMetrics?.filter(po => po.workflow_status === 'completed').length || 0;

        return {
          ...supplier,
          metrics: {
            totalOrders,
            totalAmount,
            completedOrders,
            completionRate: totalOrders > 0 ? (completedOrders / totalOrders * 100) : 0
          }
        };
      })
    );

    return NextResponse.json({
      data: suppliersWithMetrics,
      summary: {
        total: suppliersWithMetrics.length,
        active: suppliersWithMetrics.filter(s => s.isActive).length,
        categories: [...new Set(suppliersWithMetrics.map(s => s.category).filter(Boolean))]
      }
    });

  } catch (error) {
    console.error('Suppliers GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/purchasing/suppliers
export async function POST(request: NextRequest) {
  try {
    const body: SupplierRequest = await request.json();

    // Validate request
    if (!body.organizationId || !body.name) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, name' },
        { status: 400 }
      );
    }

    // Prepare dynamic fields
    const dynamicFields: Record<string, any> = {};
    
    if (body.email) dynamicFields.email = body.email;
    if (body.phone) dynamicFields.phone = body.phone;
    if (body.address) dynamicFields.address = body.address;
    if (body.contactPerson) dynamicFields.contact_person = body.contactPerson;
    if (body.category) dynamicFields.category = body.category;
    if (body.paymentTerms) dynamicFields.payment_terms = body.paymentTerms;
    if (body.notes) dynamicFields.notes = body.notes;

    // Add default fields
    dynamicFields.supplier_status = 'active';
    dynamicFields.created_date = new Date().toISOString();

    // Create supplier using Universal CRUD Service
    const result = await UniversalCrudService.createEntity(
      {
        name: body.name,
        organizationId: body.organizationId,
        fields: dynamicFields
      },
      'supplier'
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create supplier' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: result.data,
        name: body.name,
        ...dynamicFields
      },
      message: 'Supplier created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Supplier POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}