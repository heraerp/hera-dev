/**
 * Script to update existing POs with correct workflow_status
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
);

async function updatePOWorkflowStatus() {
  try {
    // Get all POs for the demo organization
    const { data: pos, error: fetchError } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', '00000000-0000-0000-0000-000000000001')
      .eq('transaction_type', 'purchase_order');

    if (fetchError) {
      console.error('Error fetching POs:', fetchError);
      return;
    }

    console.log(`Found ${pos.length} POs to update`);

    // Update each PO with correct workflow_status
    for (const po of pos) {
      const amount = po.total_amount;
      let workflowStatus = 'pending_approval';
      
      if (amount <= 100) {
        workflowStatus = 'auto_approved';
      }

      // Only update if workflow_status is not already set correctly
      if (po.workflow_status !== workflowStatus) {
        const { error: updateError } = await supabase
          .from('universal_transactions')
          .update({ 
            workflow_status: workflowStatus,
            transaction_status: 'active'
          })
          .eq('id', po.id);

        if (updateError) {
          console.error(`Error updating PO ${po.transaction_number}:`, updateError);
        } else {
          console.log(`✅ Updated PO ${po.transaction_number} - Amount: $${amount} - Status: ${workflowStatus}`);
        }
      }
    }

    console.log('Update complete!');
  } catch (error) {
    console.error('Script error:', error);
  }
}

updatePOWorkflowStatus();