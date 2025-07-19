/**
 * HERA Universal - Individual Supplier API Routes
 * 
 * Next.js 15 App Router API Route Handler
 * Handles GET, PUT, DELETE operations for individual suppliers
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Admin client for testing purposes
const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/purchasing/suppliers/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = getAdminClient(); // Use admin client for demo
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Supplier ID is required' },
        { status: 400 }
      );
    }

    // Get supplier details
    const { data: supplier, error } = await supabase
      .from('core_entities')
      .select('*')
      .eq('id', id)
      .eq('entity_type', 'supplier')
      .single();

    if (error || !supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    // Get dynamic data
    const { data: dynamicData } = await supabase
      .from('core_dynamic_data')
      .select('field_name, field_value')
      .eq('entity_id', id);

    const supplierFields = (dynamicData || []).reduce((acc, field) => {
      acc[field.field_name] = field.field_value;
      return acc;
    }, {} as Record<string, any>);

    // Get recent purchase orders
    const { data: recentPOs } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', supplier.organization_id)
      .eq('transaction_type', 'purchase_order')
      .contains('procurement_metadata', { supplier_id: id })
      .order('created_at', { ascending: false })
      .limit(10);

    // Calculate performance metrics
    const totalOrders = recentPOs?.length || 0;
    const totalAmount = recentPOs?.reduce((sum, po) => sum + po.total_amount, 0) || 0;
    const completedOrders = recentPOs?.filter(po => po.workflow_status === 'completed').length || 0;
    const avgOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0;

    const enrichedSupplier = {
      id: supplier.id,
      name: supplier.entity_name,
      code: supplier.entity_code,
      isActive: supplier.is_active,
      createdAt: supplier.created_at,
      updatedAt: supplier.updated_at,
      ...supplierFields,
      recentOrders: recentPOs || [],
      metrics: {
        totalOrders,
        totalAmount,
        completedOrders,
        avgOrderValue,
        completionRate: totalOrders > 0 ? (completedOrders / totalOrders * 100) : 0,
        lastOrderDate: recentPOs?.[0]?.created_at
      }
    };

    return NextResponse.json({ data: enrichedSupplier });

  } catch (error) {
    console.error('Supplier GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/purchasing/suppliers/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = getAdminClient(); // Use admin client for demo
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Supplier ID is required' },
        { status: 400 }
      );
    }

    // Check if supplier exists
    const { data: supplier, error: fetchError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('id', id)
      .eq('entity_type', 'supplier')
      .single();

    if (fetchError || !supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    // Update main entity if name changed
    if (body.name && body.name !== supplier.entity_name) {
      const { error: nameUpdateError } = await supabase
        .from('core_entities')
        .update({
          entity_name: body.name,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (nameUpdateError) {
        console.error('Error updating supplier name:', nameUpdateError);
        return NextResponse.json(
          { error: 'Failed to update supplier name' },
          { status: 500 }
        );
      }
    }

    // Update dynamic fields
    const dynamicUpdates = ['email', 'phone', 'address', 'contact_person', 'category', 'payment_terms', 'notes'];
    
    for (const field of dynamicUpdates) {
      if (body[field] !== undefined) {
        // Check if field exists
        const { data: existingField } = await supabase
          .from('core_dynamic_data')
          .select('id')
          .eq('entity_id', id)
          .eq('field_name', field)
          .single();

        if (existingField) {
          // Update existing field
          await supabase
            .from('core_dynamic_data')
            .update({
              field_value: String(body[field]),
              updated_at: new Date().toISOString()
            })
            .eq('entity_id', id)
            .eq('field_name', field);
        } else {
          // Create new field
          await supabase
            .from('core_dynamic_data')
            .insert({
              entity_id: id,
              field_name: field,
              field_value: String(body[field]),
              field_type: 'text'
            });
        }
      }
    }

    // Handle status updates
    if (body.isActive !== undefined) {
      await supabase
        .from('core_entities')
        .update({
          is_active: body.isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
    }

    return NextResponse.json({
      success: true,
      message: 'Supplier updated successfully'
    });

  } catch (error) {
    console.error('Supplier PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/purchasing/suppliers/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = getAdminClient(); // Use admin client for demo
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    if (!id) {
      return NextResponse.json(
        { error: 'Supplier ID is required' },
        { status: 400 }
      );
    }

    // Check if supplier exists
    const { data: supplier, error: fetchError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('id', id)
      .eq('entity_type', 'supplier')
      .single();

    if (fetchError || !supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    // Check for existing purchase orders
    const { data: existingPOs, count } = await supabase
      .from('universal_transactions')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', supplier.organization_id)
      .eq('transaction_type', 'purchase_order')
      .contains('procurement_metadata', { supplier_id: id });

    if (count && count > 0 && !force) {
      return NextResponse.json(
        { 
          error: 'Cannot delete supplier with existing purchase orders',
          relatedRecords: count,
          suggestion: 'Deactivate supplier instead or use force=true parameter'
        },
        { status: 400 }
      );
    }

    if (force) {
      // Soft delete - deactivate supplier
      const { error: deactivateError } = await supabase
        .from('core_entities')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (deactivateError) {
        console.error('Error deactivating supplier:', deactivateError);
        return NextResponse.json(
          { error: 'Failed to deactivate supplier' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Supplier deactivated successfully (soft delete due to existing records)'
      });
    } else {
      // Hard delete - remove all records
      // Delete dynamic data first
      await supabase
        .from('core_dynamic_data')
        .delete()
        .eq('entity_id', id);

      // Delete relationships
      await supabase
        .from('core_relationships')
        .delete()
        .or(`parent_entity_id.eq.${id},child_entity_id.eq.${id}`);

      // Delete entity
      const { error: deleteError } = await supabase
        .from('core_entities')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error deleting supplier:', deleteError);
        return NextResponse.json(
          { error: 'Failed to delete supplier' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Supplier deleted successfully'
      });
    }

  } catch (error) {
    console.error('Supplier DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}