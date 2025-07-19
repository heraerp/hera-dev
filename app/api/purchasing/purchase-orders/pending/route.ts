/**
 * HERA Universal - Pending Purchase Order Approvals API
 * 
 * Next.js 15 App Router API Route Handler
 * Gets all purchase orders pending approval for a specific user
 * 
 * Route: GET /api/purchasing/purchase-orders/pending
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

export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient(); // Use admin client for demo
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const userId = searchParams.get('userId');
    const userRole = searchParams.get('userRole');

    if (!organizationId || !userId) {
      return NextResponse.json(
        { error: 'organizationId and userId are required' },
        { status: 400 }
      );
    }

    // Get organization's approval workflow configuration
    const { data: workflowConfig } = await supabase
      .from('core_entities')
      .select(`
        *,
        core_dynamic_data!inner(field_name, field_value)
      `)
      .eq('organization_id', organizationId)
      .eq('entity_type', 'purchase_workflow_deployment')
      .single();

    if (!workflowConfig) {
      return NextResponse.json(
        { error: 'No approval workflow configured for this organization' },
        { status: 404 }
      );
    }

    // Extract approval configuration
    const dynamicData = workflowConfig.core_dynamic_data as any[];
    const approvalConfig = dynamicData.reduce((acc, field) => {
      acc[field.field_name] = field.field_value;
      return acc;
    }, {} as Record<string, any>);

    // Determine which approval tiers this user can approve
    const canApproveTiers: number[] = [];
    
    if (approvalConfig.tier_1_approver_user_id === userId) {
      canApproveTiers.push(1);
    }
    if (approvalConfig.tier_2_approver_user_id === userId) {
      canApproveTiers.push(2);
    }
    if (approvalConfig.tier_3_approver_user_id === userId) {
      canApproveTiers.push(3);
    }

    // Also check by role (fallback if specific user not assigned)
    if (userRole) {
      if (userRole === 'manager' && !approvalConfig.tier_1_approver_user_id) {
        canApproveTiers.push(1);
      }
      if (userRole === 'director' && !approvalConfig.tier_2_approver_user_id) {
        canApproveTiers.push(2);
      }
      if (userRole === 'owner' && !approvalConfig.tier_3_approver_user_id) {
        canApproveTiers.push(3);
      }
    }

    if (canApproveTiers.length === 0) {
      return NextResponse.json({
        data: [],
        message: 'User has no approval permissions'
      });
    }

    // Get pending purchase orders that this user can approve
    const { data: pendingPOs, error } = await supabase
      .from('universal_transactions')
      .select(`
        *,
        procurement_metadata,
        transaction_data
      `)
      .eq('organization_id', organizationId)
      .eq('transaction_type', 'purchase_order')
      .eq('workflow_status', 'pending_approval')
      .eq('requires_approval', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending approvals:', error);
      return NextResponse.json(
        { error: 'Failed to fetch pending approvals' },
        { status: 500 }
      );
    }

    // Filter POs based on approval tier
    const filteredPOs = (pendingPOs || []).filter(po => {
      const metadata = po.procurement_metadata as any || {};
      return canApproveTiers.includes(metadata.approval_tier || 0);
    });

    // Enrich with supplier details
    const enrichedPOs = await Promise.all(
      filteredPOs.map(async (transaction) => {
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

        // Calculate days pending
        const daysPending = Math.floor(
          (new Date().getTime() - new Date(transaction.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          id: transaction.id,
          poNumber: transaction.transaction_number,
          date: transaction.transaction_date,
          totalAmount: transaction.total_amount,
          currency: transaction.currency,
          status: transaction.workflow_status,
          supplier,
          items: metadata.items || [],
          requestedBy: metadata.requested_by,
          approvalTier: metadata.approval_tier,
          deliveryDate: metadata.delivery_date,
          notes: metadata.notes,
          daysPending,
          urgency: daysPending > 3 ? 'high' : daysPending > 1 ? 'medium' : 'low',
          requiredApprovalLevel: metadata.approval_tier === 1 ? 'Manager' : 
                                 metadata.approval_tier === 2 ? 'Director' : 'Owner',
          createdAt: transaction.created_at
        };
      })
    );

    // Sort by urgency and amount
    enrichedPOs.sort((a, b) => {
      if (a.urgency !== b.urgency) {
        const urgencyOrder = { high: 0, medium: 1, low: 2 };
        return urgencyOrder[a.urgency as keyof typeof urgencyOrder] - 
               urgencyOrder[b.urgency as keyof typeof urgencyOrder];
      }
      return b.totalAmount - a.totalAmount;
    });

    return NextResponse.json({
      data: enrichedPOs,
      summary: {
        total: enrichedPOs.length,
        highUrgency: enrichedPOs.filter(po => po.urgency === 'high').length,
        totalValue: enrichedPOs.reduce((sum, po) => sum + po.totalAmount, 0),
        approvalTiers: canApproveTiers
      }
    });

  } catch (error) {
    console.error('Pending approvals GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}