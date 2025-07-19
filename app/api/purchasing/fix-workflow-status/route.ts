/**
 * Temporary endpoint to fix workflow status for existing POs
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    
    // Get all POs for the demo organization
    const { data: pos, error: fetchError } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', '00000000-0000-0000-0000-000000000001')
      .eq('transaction_type', 'purchase_order');

    if (fetchError) {
      console.error('Error fetching POs:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch POs' }, { status: 500 });
    }

    console.log(`Found ${pos?.length || 0} POs to update`);

    // Update each PO with correct workflow_status
    let updated = 0;
    for (const po of (pos || [])) {
      const amount = po.total_amount;
      let workflowStatus = 'pending_approval';
      
      if (amount <= 100) {
        workflowStatus = 'auto_approved';
      }

      // Update workflow_status
      const { error: updateError } = await supabase
        .from('universal_transactions')
        .update({ 
          workflow_status: workflowStatus,
          transaction_status: 'active'
        })
        .eq('id', po.id);

      if (!updateError) {
        updated++;
        console.log(`✅ Updated PO ${po.transaction_number} - Amount: $${amount} - Status: ${workflowStatus}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Updated ${updated} POs with correct workflow status`,
      details: pos?.map(po => ({
        poNumber: po.transaction_number,
        amount: po.total_amount,
        newStatus: po.total_amount <= 100 ? 'auto_approved' : 'pending_approval'
      }))
    });
  } catch (error) {
    console.error('Fix workflow status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}