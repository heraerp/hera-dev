/**
 * HERA Universal - Individual Cash Market Transaction API Routes
 * 
 * Next.js 15 App Router API Route Handler
 * Handles GET, PUT, DELETE for individual transactions
 * Uses universal_transactions with organization isolation
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

// GET /api/cash-market/transactions/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    // Get transaction with organization isolation
    const { data: transaction, error: transactionError } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('id', params.id)
      .eq('organization_id', organizationId)
      .eq('transaction_type', 'cash_market_purchase')
      .single();

    if (transactionError || !transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Parse transaction data
    let transactionData = {};
    try {
      transactionData = typeof transaction.transaction_data === 'string' 
        ? JSON.parse(transaction.transaction_data) 
        : transaction.transaction_data || {};
    } catch (error) {
      console.error('Error parsing transaction data:', error);
    }

    // Get vendor information
    const vendorId = (transactionData as any)?.vendorId;
    let vendor = null;
    if (vendorId) {
      const { data: vendorData } = await supabase
        .from('core_entities')
        .select('id, entity_name, entity_code')
        .eq('id', vendorId)
        .eq('organization_id', organizationId)
        .eq('entity_type', 'cash_market_vendor')
        .single();
      
      if (vendorData) {
        // Get vendor dynamic data
        const { data: vendorDynamicData } = await supabase
          .from('core_dynamic_data')
          .select('field_name, field_value')
          .eq('entity_id', vendorId);

        const vendorFields = (vendorDynamicData || []).reduce((acc, item) => {
          acc[item.field_name] = item.field_value;
          return acc;
        }, {} as Record<string, any>);

        vendor = {
          id: vendorData.id,
          name: vendorData.entity_name,
          code: vendorData.entity_code,
          ...vendorFields
        };
      }
    }

    // Get receipt information if linked
    const receiptId = (transactionData as any)?.receiptId;
    let receipt = null;
    if (receiptId) {
      const { data: receiptData } = await supabase
        .from('core_entities')
        .select('id, entity_name, entity_code')
        .eq('id', receiptId)
        .eq('organization_id', organizationId)
        .eq('entity_type', 'cash_market_receipt')
        .single();
      
      if (receiptData) {
        const { data: receiptDynamicData } = await supabase
          .from('core_dynamic_data')
          .select('field_name, field_value')
          .eq('entity_id', receiptId);

        const receiptFields = (receiptDynamicData || []).reduce((acc, item) => {
          acc[item.field_name] = item.field_value;
          return acc;
        }, {} as Record<string, any>);

        receipt = {
          id: receiptData.id,
          name: receiptData.entity_name,
          ...receiptFields
        };
      }
    }

    // Get all relationships for this transaction
    const { data: relationships } = await supabase
      .from('core_relationships')
      .select('*')
      .eq('organization_id', organizationId)
      .or(`parent_entity_id.eq.${params.id},child_entity_id.eq.${params.id}`)
      .eq('is_active', true);

    return NextResponse.json({
      data: {
        id: transaction.id,
        transactionNumber: transaction.transaction_number,
        date: transaction.transaction_date,
        type: transaction.transaction_subtype || 'expense',
        amount: transaction.total_amount,
        currency: transaction.currency || 'USD',
        status: transaction.transaction_status,
        workflowStatus: transaction.workflow_status,
        requiresApproval: transaction.requires_approval,
        isFinancial: transaction.is_financial,
        postingStatus: transaction.posting_status,
        vendor,
        receipt,
        relationships: relationships || [],
        createdAt: transaction.created_at,
        updatedAt: transaction.updated_at,
        ...transactionData
      }
    });

  } catch (error) {
    console.error('Transaction GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/cash-market/transactions/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { organizationId, ...updateFields } = body;
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    // Verify transaction exists and belongs to organization
    const { data: transaction, error: transactionError } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('id', params.id)
      .eq('organization_id', organizationId)
      .eq('transaction_type', 'cash_market_purchase')
      .single();

    if (transactionError || !transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Parse existing transaction data
    let existingData = {};
    try {
      existingData = typeof transaction.transaction_data === 'string' 
        ? JSON.parse(transaction.transaction_data) 
        : transaction.transaction_data || {};
    } catch (error) {
      console.error('Error parsing existing transaction data:', error);
    }

    // Prepare updates
    const updates: any = {
      updated_at: new Date().toISOString()
    };

    // Update universal_transactions fields
    if (updateFields.amount !== undefined) {
      updates.total_amount = updateFields.amount;
    }
    if (updateFields.currency !== undefined) {
      updates.currency = updateFields.currency;
    }
    if (updateFields.status !== undefined) {
      updates.transaction_status = updateFields.status;
    }
    if (updateFields.workflowStatus !== undefined) {
      updates.workflow_status = updateFields.workflowStatus;
    }
    if (updateFields.type !== undefined) {
      updates.transaction_subtype = updateFields.type;
    }

    // Update transaction_data with new fields
    const updatedTransactionData = {
      ...existingData,
      ...Object.fromEntries(
        Object.entries(updateFields).filter(([key]) => 
          !['amount', 'currency', 'status', 'workflowStatus', 'type', 'organizationId'].includes(key)
        )
      ),
      lastModified: new Date().toISOString()
    };

    updates.transaction_data = JSON.stringify(updatedTransactionData);

    // Apply updates
    const { error: updateError } = await supabase
      .from('universal_transactions')
      .update(updates)
      .eq('id', params.id);

    if (updateError) {
      console.error('Error updating transaction:', updateError);
      return NextResponse.json(
        { error: 'Failed to update transaction' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Transaction updated successfully',
      data: { 
        id: params.id, 
        status: updateFields.status || transaction.transaction_status,
        amount: updateFields.amount || transaction.total_amount
      }
    });

  } catch (error) {
    console.error('Transaction PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/cash-market/transactions/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    // Verify transaction exists and belongs to organization
    const { data: transaction, error: transactionError } = await supabase
      .from('universal_transactions')
      .select('transaction_status, posting_status')
      .eq('id', params.id)
      .eq('organization_id', organizationId)
      .eq('transaction_type', 'cash_market_purchase')
      .single();

    if (transactionError || !transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Check if transaction can be deleted
    if (transaction.posting_status === 'posted' || transaction.transaction_status === 'approved') {
      return NextResponse.json(
        { error: 'Cannot delete posted or approved transactions' },
        { status: 400 }
      );
    }

    // Delete relationships first
    await supabase
      .from('core_relationships')
      .delete()
      .or(`parent_entity_id.eq.${params.id},child_entity_id.eq.${params.id}`)
      .eq('organization_id', organizationId);

    // Delete the transaction
    const { error: deleteError } = await supabase
      .from('universal_transactions')
      .delete()
      .eq('id', params.id)
      .eq('organization_id', organizationId);

    if (deleteError) {
      console.error('Error deleting transaction:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete transaction' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Transaction deleted successfully'
    });

  } catch (error) {
    console.error('Transaction DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}