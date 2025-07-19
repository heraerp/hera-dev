/**
 * HERA Universal - Individual Purchase Order API Routes
 * 
 * Next.js 15 App Router API Route Handler
 * Handles GET, PUT, DELETE operations for individual purchase orders
 * 
 * Routes:
 * - GET /api/purchasing/purchase-orders/[id] - Get PO details
 * - PUT /api/purchasing/purchase-orders/[id] - Update PO
 * - DELETE /api/purchasing/purchase-orders/[id] - Cancel PO
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

// GET /api/purchasing/purchase-orders/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = getAdminClient(); // Use admin client for demo
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Purchase order ID is required' },
        { status: 400 }
      );
    }

    // Get purchase order details
    const { data: transaction, error } = await supabase
      .from('universal_transactions')
      .select(`
        *,
        procurement_metadata,
        transaction_data
      `)
      .eq('id', id)
      .eq('transaction_type', 'purchase_order')
      .single();

    if (error || !transaction) {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      );
    }

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

    // Get approval history if exists
    const { data: approvalHistory } = await supabase
      .from('core_relationships')
      .select('*')
      .eq('child_entity_id', id)
      .eq('relationship_type', 'approval_action')
      .order('created_at', { ascending: false });

    // Get related documents (invoices, receipts)
    const { data: relatedDocs } = await supabase
      .from('core_relationships')
      .select('*')
      .eq('parent_entity_id', id)
      .in('relationship_type', ['po_invoice', 'po_receipt']);

    const enrichedPO = {
      id: transaction.id,
      poNumber: transaction.transaction_number,
      date: transaction.transaction_date,
      totalAmount: transaction.total_amount,
      currency: transaction.currency,
      status: transaction.workflow_status || transaction.transaction_status,
      supplier,
      items: metadata.items || [],
      requestedBy: metadata.requested_by,
      approvalTier: metadata.approval_tier,
      approvalConfig: metadata.approval_config,
      approvedBy: metadata.approved_by,
      approvalDate: metadata.approval_date,
      deliveryDate: metadata.delivery_date,
      notes: metadata.notes,
      requiresApproval: transaction.requires_approval,
      approvalHistory: approvalHistory || [],
      relatedDocuments: relatedDocs || [],
      createdAt: transaction.created_at,
      updatedAt: transaction.updated_at,
      postingStatus: transaction.posting_status,
      postedAt: transaction.posted_at
    };

    return NextResponse.json({ data: enrichedPO });

  } catch (error) {
    console.error('Purchase order GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/purchasing/purchase-orders/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = getAdminClient(); // Use admin client for demo
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Purchase order ID is required' },
        { status: 400 }
      );
    }

    // Get current PO
    const { data: currentPO, error: fetchError } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('id', id)
      .eq('transaction_type', 'purchase_order')
      .single();

    if (fetchError || !currentPO) {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      );
    }

    // Check if PO can be updated
    const lockedStatuses = ['approved', 'completed', 'cancelled', 'posted'];
    if (lockedStatuses.includes(currentPO.workflow_status)) {
      return NextResponse.json(
        { error: `Cannot update purchase order with status: ${currentPO.workflow_status}` },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Handle status updates
    if (body.status) {
      updateData.workflow_status = body.status;
      
      // If approving, update metadata
      if (body.status === 'approved' && body.approvedBy) {
        updateData.procurement_metadata = {
          ...currentPO.procurement_metadata,
          approved_by: body.approvedBy,
          approval_date: new Date().toISOString()
        };
      }
    }

    // Handle delivery date update
    if (body.deliveryDate) {
      updateData.procurement_metadata = {
        ...currentPO.procurement_metadata,
        delivery_date: body.deliveryDate
      };
    }

    // Handle notes update
    if (body.notes !== undefined) {
      updateData.procurement_metadata = {
        ...currentPO.procurement_metadata,
        notes: body.notes
      };
    }

    // Handle items update (only if not approved)
    if (body.items && currentPO.workflow_status === 'draft') {
      const totalAmount = body.items.reduce((sum: number, item: any) => {
        return sum + (item.quantity * item.unitPrice);
      }, 0);

      updateData.total_amount = totalAmount;
      updateData.procurement_metadata = {
        ...currentPO.procurement_metadata,
        items: body.items
      };
    }

    // Update the purchase order
    const { data: updatedPO, error: updateError } = await supabase
      .from('universal_transactions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating purchase order:', updateError);
      return NextResponse.json(
        { error: 'Failed to update purchase order' },
        { status: 500 }
      );
    }

    // Log status change if applicable
    if (body.status && body.status !== currentPO.workflow_status) {
      await supabase
        .from('core_relationships')
        .insert({
          organization_id: currentPO.organization_id,
          relationship_type: 'status_change',
          parent_entity_id: id,
          child_entity_id: id,
          relationship_data: {
            from_status: currentPO.workflow_status,
            to_status: body.status,
            changed_by: body.changedBy,
            reason: body.reason
          }
        });
    }

    return NextResponse.json({
      success: true,
      data: updatedPO,
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

// DELETE /api/purchasing/purchase-orders/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = getAdminClient(); // Use admin client for demo
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const reason = searchParams.get('reason');
    const cancelledBy = searchParams.get('cancelledBy');

    if (!id) {
      return NextResponse.json(
        { error: 'Purchase order ID is required' },
        { status: 400 }
      );
    }

    // Get current PO
    const { data: currentPO, error: fetchError } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('id', id)
      .eq('transaction_type', 'purchase_order')
      .single();

    if (fetchError || !currentPO) {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      );
    }

    // Check if PO can be cancelled
    const nonCancellableStatuses = ['completed', 'posted', 'cancelled'];
    if (nonCancellableStatuses.includes(currentPO.workflow_status)) {
      return NextResponse.json(
        { error: `Cannot cancel purchase order with status: ${currentPO.workflow_status}` },
        { status: 400 }
      );
    }

    // Update PO status to cancelled
    const { data: cancelledPO, error: updateError } = await supabase
      .from('universal_transactions')
      .update({
        workflow_status: 'cancelled',
        transaction_status: 'cancelled',
        updated_at: new Date().toISOString(),
        procurement_metadata: {
          ...currentPO.procurement_metadata,
          cancelled_by: cancelledBy,
          cancellation_date: new Date().toISOString(),
          cancellation_reason: reason
        }
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error cancelling purchase order:', updateError);
      return NextResponse.json(
        { error: 'Failed to cancel purchase order' },
        { status: 500 }
      );
    }

    // Log cancellation
    await supabase
      .from('core_relationships')
      .insert({
        organization_id: currentPO.organization_id,
        relationship_type: 'cancellation',
        parent_entity_id: id,
        child_entity_id: id,
        relationship_data: {
          cancelled_by: cancelledBy,
          reason: reason,
          original_status: currentPO.workflow_status
        }
      });

    return NextResponse.json({
      success: true,
      message: 'Purchase order cancelled successfully',
      data: {
        id: cancelledPO.id,
        poNumber: cancelledPO.transaction_number,
        status: 'cancelled'
      }
    });

  } catch (error) {
    console.error('Purchase order DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}