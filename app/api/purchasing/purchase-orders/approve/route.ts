/**
 * HERA Universal - Purchase Order Approval Actions API
 * 
 * Next.js 15 App Router API Route Handler
 * Handles approve/reject actions for purchase orders
 * 
 * Route: PUT /api/purchasing/purchase-orders/approve
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

interface ApprovalRequest {
  poId: string;
  action: 'approve' | 'reject';
  userId: string;
  userRole?: string;
  comments?: string;
  organizationId: string;
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient(); // Use admin client for demo
    const body: ApprovalRequest = await request.json();

    // Validate request
    if (!body.poId || !body.action || !body.userId || !body.organizationId) {
      return NextResponse.json(
        { error: 'Missing required fields: poId, action, userId, organizationId' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(body.action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be approve or reject' },
        { status: 400 }
      );
    }

    // Get the purchase order
    const { data: currentPO, error: fetchError } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('id', body.poId)
      .eq('transaction_type', 'purchase_order')
      .eq('organization_id', body.organizationId)
      .single();

    if (fetchError || !currentPO) {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      );
    }

    // Check if PO is in a state that allows approval
    if (currentPO.workflow_status !== 'pending_approval') {
      return NextResponse.json(
        { error: `Cannot ${body.action} purchase order with status: ${currentPO.workflow_status}` },
        { status: 400 }
      );
    }

    const metadata = currentPO.procurement_metadata as any || {};
    
    // Get approval workflow configuration
    const { data: workflowConfig } = await supabase
      .from('core_entities')
      .select(`
        *,
        core_dynamic_data!inner(field_name, field_value)
      `)
      .eq('organization_id', body.organizationId)
      .eq('entity_type', 'purchase_workflow_deployment')
      .single();

    if (!workflowConfig) {
      return NextResponse.json(
        { error: 'No approval workflow configured' },
        { status: 404 }
      );
    }

    // Extract approval configuration
    const dynamicData = workflowConfig.core_dynamic_data as any[];
    const approvalConfig = dynamicData.reduce((acc, field) => {
      acc[field.field_name] = field.field_value;
      return acc;
    }, {} as Record<string, any>);

    // Verify user has permission to approve this tier
    const requiredTier = metadata.approval_tier || 1;
    let hasPermission = false;

    // Check by specific user assignment
    if ((requiredTier === 1 && approvalConfig.tier_1_approver_user_id === body.userId) ||
        (requiredTier === 2 && approvalConfig.tier_2_approver_user_id === body.userId) ||
        (requiredTier === 3 && approvalConfig.tier_3_approver_user_id === body.userId)) {
      hasPermission = true;
    }

    // Check by role (fallback)
    if (!hasPermission && body.userRole) {
      if ((requiredTier === 1 && body.userRole === 'manager' && !approvalConfig.tier_1_approver_user_id) ||
          (requiredTier === 2 && body.userRole === 'director' && !approvalConfig.tier_2_approver_user_id) ||
          (requiredTier === 3 && body.userRole === 'owner' && !approvalConfig.tier_3_approver_user_id)) {
        hasPermission = true;
      }
    }

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'User does not have permission to approve this purchase order' },
        { status: 403 }
      );
    }

    const approvalTimestamp = new Date().toISOString();
    
    // Update the purchase order based on action
    let newStatus: string;
    let newMetadata: any;
    
    if (body.action === 'approve') {
      newStatus = 'approved';
      newMetadata = {
        ...metadata,
        approved_by: body.userId,
        approval_date: approvalTimestamp,
        approval_comments: body.comments
      };
    } else {
      newStatus = 'rejected';
      newMetadata = {
        ...metadata,
        rejected_by: body.userId,
        rejection_date: approvalTimestamp,
        rejection_comments: body.comments
      };
    }

    // Update the transaction
    const { data: updatedPO, error: updateError } = await supabase
      .from('universal_transactions')
      .update({
        workflow_status: newStatus,
        transaction_status: newStatus,
        procurement_metadata: newMetadata,
        updated_at: approvalTimestamp
      })
      .eq('id', body.poId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating purchase order:', updateError);
      return NextResponse.json(
        { error: 'Failed to update purchase order' },
        { status: 500 }
      );
    }

    // Log the approval/rejection action
    await supabase
      .from('core_relationships')
      .insert({
        organization_id: body.organizationId,
        relationship_type: 'approval_action',
        parent_entity_id: body.poId,
        child_entity_id: body.poId,
        relationship_data: {
          action: body.action,
          performed_by: body.userId,
          timestamp: approvalTimestamp,
          comments: body.comments,
          approval_tier: requiredTier,
          po_number: currentPO.transaction_number,
          total_amount: currentPO.total_amount
        }
      });

    // If approved, trigger downstream processes
    if (body.action === 'approve') {
      // This could trigger inventory updates, supplier notifications, etc.
      console.log('🎉 Purchase Order Approved:', {
        poNumber: currentPO.transaction_number,
        amount: currentPO.total_amount,
        approvedBy: body.userId
      });
      
      // In a real system, you might:
      // - Send email to supplier
      // - Update expected inventory levels
      // - Create accounting entries
      // - Update budgets
    } else {
      console.log('❌ Purchase Order Rejected:', {
        poNumber: currentPO.transaction_number,
        amount: currentPO.total_amount,
        rejectedBy: body.userId,
        reason: body.comments
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedPO.id,
        poNumber: updatedPO.transaction_number,
        status: newStatus,
        totalAmount: updatedPO.total_amount,
        actionPerformedBy: body.userId,
        timestamp: approvalTimestamp
      },
      message: `Purchase order ${body.action}d successfully`
    });

  } catch (error) {
    console.error('Approval action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}