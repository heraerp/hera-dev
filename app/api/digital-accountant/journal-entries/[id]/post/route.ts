/**
 * HERA Digital Accountant - Journal Entry Posting API
 * 
 * Handles posting of draft journal entries to the general ledger
 * Following Purchase Order API patterns
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Admin client for bypassing RLS during development
const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

interface PostingRequest {
  postingDate?: string;
  postingPeriod?: string;
  approvedBy: string;
  postingNotes?: string;
  forcePost?: boolean; // Override validation warnings
}

// PUT /api/digital-accountant/journal-entries/[id]/post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getAdminClient();
    const { id: journalId } = await params;
    const body: PostingRequest = await request.json();

    if (!journalId) {
      return NextResponse.json(
        { error: 'Journal entry ID is required', success: false },
        { status: 400 }
      );
    }

    if (!body.approvedBy) {
      return NextResponse.json(
        { error: 'approvedBy is required for posting', success: false },
        { status: 400 }
      );
    }

    console.log('📮 Posting journal entry:', journalId, body);

    // Get journal entry details
    const { data: journalEntry, error: fetchError } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('id', journalId)
      .in('transaction_type', ['journal_entry', 'ai_journal_entry'])
      .single();

    if (fetchError || !journalEntry) {
      return NextResponse.json(
        { error: 'Journal entry not found', success: false },
        { status: 404 }
      );
    }

    // Check if already posted
    if (journalEntry.transaction_status === 'posted') {
      return NextResponse.json(
        { error: 'Journal entry is already posted', success: false },
        { status: 400 }
      );
    }

    // Validate journal entry balance
    const transactionData = journalEntry.transaction_data || {};
    const entries = transactionData.entries || [];
    const totalDebits = entries.reduce((sum: number, entry: any) => sum + (entry.debit || 0), 0);
    const totalCredits = entries.reduce((sum: number, entry: any) => sum + (entry.credit || 0), 0);
    const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

    if (!isBalanced && !body.forcePost) {
      return NextResponse.json(
        { 
          error: `Journal entry is not balanced. Debits: ${totalDebits.toFixed(2)}, Credits: ${totalCredits.toFixed(2)}. Use forcePost to override.`,
          success: false,
          validationError: {
            type: 'unbalanced',
            debits: totalDebits,
            credits: totalCredits,
            difference: Math.abs(totalDebits - totalCredits)
          }
        },
        { status: 400 }
      );
    }

    // Validate all accounts exist
    const accountCodes = entries.map((e: any) => e.account_code).filter(Boolean);
    const { data: accounts, error: accountError } = await supabase
      .from('core_entities')
      .select('id, entity_code, entity_name')
      .eq('organization_id', journalEntry.organization_id)
      .eq('entity_type', 'chart_account')
      .in('entity_code', accountCodes);

    if (accountError || !accounts || accounts.length !== accountCodes.length) {
      const missingAccounts = accountCodes.filter(
        code => !accounts?.some(acc => acc.entity_code === code)
      );

      if (!body.forcePost) {
        return NextResponse.json(
          { 
            error: 'Invalid account codes detected',
            success: false,
            validationError: {
              type: 'invalid_accounts',
              missingAccounts: missingAccounts
            }
          },
          { status: 400 }
        );
      }
    }

    // Determine posting period
    const postingDate = body.postingDate || new Date().toISOString().split('T')[0];
    const postingPeriod = body.postingPeriod || `${new Date(postingDate).getFullYear()}-${String(new Date(postingDate).getMonth() + 1).padStart(2, '0')}`;

    // Update journal entry to posted status
    const updateData = {
      transaction_status: 'posted',
      posting_status: 'posted',
      posted_at: new Date().toISOString(),
      posting_date: postingDate,
      posting_period: postingPeriod,
      posted_by: body.approvedBy,
      updated_at: new Date().toISOString()
    };

    const { data: updatedJournal, error: updateError } = await supabase
      .from('universal_transactions')
      .update(updateData)
      .eq('id', journalId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error posting journal entry:', updateError);
      return NextResponse.json(
        { 
          error: 'Failed to post journal entry',
          details: updateError,
          success: false
        },
        { status: 500 }
      );
    }

    console.log('✅ Journal entry posted successfully');

    // Create posting audit trail
    await supabase
      .from('core_events')
      .insert({
        organization_id: journalEntry.organization_id,
        event_type: 'journal_entry_posted',
        entity_id: journalId,
        event_data: {
          journal_number: journalEntry.transaction_number,
          posting_date: postingDate,
          posting_period: postingPeriod,
          posted_by: body.approvedBy,
          posting_notes: body.postingNotes,
          force_posted: body.forcePost || false,
          validation_warnings: !isBalanced ? ['Unbalanced entry'] : [],
          entries_count: entries.length,
          total_amount: totalDebits
        },
        created_at: new Date().toISOString()
      });

    // If AI-generated, update AI learning data
    if (journalEntry.ai_generated) {
      await supabase
        .from('core_metadata')
        .insert({
          organization_id: journalEntry.organization_id,
          entity_type: 'ai_learning',
          entity_id: journalId,
          metadata_type: 'journal_posting_feedback',
          metadata_key: 'posting_success',
          metadata_value: {
            posted_successfully: true,
            confidence_score: journalEntry.ai_classification?.confidence_score || 0,
            manual_corrections: [],
            posting_time: new Date().toISOString()
          },
          ai_generated: true
        });
    }

    return NextResponse.json({
      success: true,
      message: 'Journal entry posted successfully',
      data: {
        journalId: journalId,
        journalNumber: updatedJournal.transaction_number,
        postingDate: postingDate,
        postingPeriod: postingPeriod,
        postedBy: body.approvedBy,
        status: 'posted',
        totalDebits: totalDebits,
        totalCredits: totalCredits,
        isBalanced: isBalanced
      }
    });

  } catch (error) {
    console.error('❌ Journal posting error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    );
  }
}