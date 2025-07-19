/**
 * Temporary endpoint to add supplier names to existing POs
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
    
    // Supplier names mapping
    const supplierNames: Record<string, string> = {
      'sup-001': 'Fresh Valley Produce',
      'sup-002': 'Premium Meat Co',
      'sup-003': 'Industrial Kitchen Supply',
      'sup-004': 'Daily Essentials Supply',
      'sup-005': 'Quick Office Supplies'
    };
    
    // Get all POs
    const { data: pos, error: fetchError } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', '00000000-0000-0000-0000-000000000001')
      .eq('transaction_type', 'purchase_order');

    if (fetchError) {
      return NextResponse.json({ error: 'Failed to fetch POs' }, { status: 500 });
    }

    // Update each PO with supplier name
    let updated = 0;
    for (const po of (pos || [])) {
      const metadata = po.procurement_metadata || {};
      const supplierId = metadata.supplier_id;
      const supplierName = supplierNames[supplierId] || 'Unknown Supplier';
      
      // Update metadata with supplier name
      const updatedMetadata = {
        ...metadata,
        supplier_name: supplierName
      };

      const { error: updateError } = await supabase
        .from('universal_transactions')
        .update({ 
          procurement_metadata: updatedMetadata
        })
        .eq('id', po.id);

      if (!updateError) {
        updated++;
        console.log(`✅ Updated PO ${po.transaction_number} with supplier: ${supplierName}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Updated ${updated} POs with supplier names`
    });
  } catch (error) {
    console.error('Fix supplier names error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}