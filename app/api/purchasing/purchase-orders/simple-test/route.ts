/**
 * Simple Purchase Order Test Route
 * For testing the basic functionality without complex business logic
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
    const body = await request.json();
    
    console.log('Creating simple PO with data:', body);

    // Generate simple PO number
    const poNumber = `PO-${Date.now()}`;
    
    // Calculate total
    const total = body.items?.reduce((sum: number, item: any) => 
      sum + (item.quantity * item.unitPrice), 0) || 0;

    // Create minimal transaction record
    const transactionData = {
      organization_id: body.organizationId,
      transaction_type: 'purchase_order',
      transaction_number: poNumber,
      transaction_date: new Date().toISOString().split('T')[0],
      total_amount: total,
      currency: 'USD',
      transaction_status: total < 75 ? 'auto_approved' : 'pending_approval'
    };

    console.log('Inserting transaction:', transactionData);

    const { data: transaction, error } = await supabase
      .from('universal_transactions')
      .insert(transactionData)
      .select()
      .single();

    if (error) {
      console.error('Transaction error:', error);
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: transaction.id,
        poNumber,
        total,
        status: transaction.transaction_status
      }
    });

  } catch (error) {
    console.error('Simple PO error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}