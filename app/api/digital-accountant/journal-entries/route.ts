/**
 * HERA Digital Accountant - Journal Entry Management API
 * 
 * Handles AI-assisted journal entry creation and management
 * Following Purchase Order API patterns exactly
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

// TypeScript interfaces
interface JournalEntryCreateRequest {
  organizationId: string;
  description: string;
  entryDate?: string;
  entries: {
    accountCode: string;
    accountName?: string;
    debit?: number;
    credit?: number;
    description?: string;
    costCenter?: string;
    project?: string;
  }[];
  metadata?: {
    sourceDocument?: string;
    sourceTransaction?: string;
    aiGenerated?: boolean;
    confidenceScore?: number;
  };
  autoPost?: boolean;
}

interface JournalEntryResponse {
  id: string;
  journalNumber: string;
  description: string;
  entryDate: string;
  status: string;
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;
  entries: any[];
  aiMetadata?: {
    generated: boolean;
    confidenceScore: number;
    suggestions?: string[];
  };
  createdAt: string;
  postedAt?: string;
}

// GET /api/digital-accountant/journal-entries
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const status = searchParams.get('status');
    const aiGenerated = searchParams.get('aiGenerated');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    if (!organizationId || organizationId === 'null' || organizationId === 'undefined') {
      return NextResponse.json(
        { error: 'Valid organizationId is required', success: false },
        { status: 400 }
      );
    }

    console.log('📚 Fetching journal entries for organization:', organizationId);

    // Build query
    let query = supabase
      .from('universal_transactions')
      .select(`
        *,
        transaction_data,
        ai_classification
      `, { count: 'exact' })
      .eq('organization_id', organizationId)
      .in('transaction_type', ['journal_entry', 'ai_journal_entry'])
      .order('transaction_date', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status) {
      query = query.eq('transaction_status', status);
    }

    if (aiGenerated === 'true') {
      query = query.eq('ai_generated', true);
    } else if (aiGenerated === 'false') {
      query = query.eq('ai_generated', false);
    }

    const { data: journalEntries, error, count } = await query;

    if (error) {
      console.error('❌ Error fetching journal entries:', error);
      return NextResponse.json(
        { error: 'Failed to fetch journal entries', success: false },
        { status: 500 }
      );
    }

    // Transform journal entries
    const transformedEntries = (journalEntries || []).map(je => {
      const transactionData = je.transaction_data || {};
      const aiClassification = je.ai_classification || {};
      const entries = transactionData.entries || [];

      // Calculate totals
      const totalDebits = entries.reduce((sum: number, entry: any) => sum + (entry.debit || 0), 0);
      const totalCredits = entries.reduce((sum: number, entry: any) => sum + (entry.credit || 0), 0);

      return {
        id: je.id,
        journalNumber: je.transaction_number,
        description: je.description || '',
        entryDate: je.transaction_date,
        status: je.transaction_status,
        totalDebits: totalDebits,
        totalCredits: totalCredits,
        isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
        entryCount: entries.length,
        entries: entries,
        aiMetadata: je.ai_generated ? {
          generated: true,
          confidenceScore: aiClassification.confidence_score || 0,
          analysisId: aiClassification.analysis_id,
          suggestions: aiClassification.suggestions || []
        } : null,
        sourceDocument: transactionData.source_document,
        sourceTransaction: transactionData.source_transaction,
        createdAt: je.created_at,
        postedAt: je.posting_date,
        createdBy: je.created_by
      };
    });

    console.log(`✅ Found ${transformedEntries.length} journal entries`);

    return NextResponse.json({
      data: transformedEntries,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      success: true
    });

  } catch (error) {
    console.error('❌ Journal entries GET error:', error);
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

// POST /api/digital-accountant/journal-entries
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body: JournalEntryCreateRequest = await request.json();

    console.log('📝 Creating journal entry:', JSON.stringify(body, null, 2));

    // Validate request
    if (!body.organizationId || !body.description || !body.entries?.length) {
      return NextResponse.json(
        { 
          error: 'Missing required fields: organizationId, description, entries',
          success: false
        },
        { status: 400 }
      );
    }

    // Validate entries balance
    const totalDebits = body.entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
    const totalCredits = body.entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
    const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

    if (!isBalanced) {
      return NextResponse.json(
        { 
          error: `Journal entry is not balanced. Debits: ${totalDebits.toFixed(2)}, Credits: ${totalCredits.toFixed(2)}`,
          success: false
        },
        { status: 400 }
      );
    }

    // Generate journal number
    const timestamp = Date.now();
    const journalNumber = `JE-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${timestamp.toString().slice(-6)}`;

    console.log('📋 Generated journal number:', journalNumber);

    // If AI-generated, calculate confidence score
    let aiConfidence = 0;
    if (body.metadata?.aiGenerated) {
      // Simple confidence calculation based on account matching
      const validAccounts = body.entries.filter(e => e.accountCode && e.accountCode.length >= 7);
      aiConfidence = validAccounts.length / body.entries.length;
    }

    // Prepare transaction data
    const transactionData = {
      organization_id: body.organizationId,
      transaction_type: body.metadata?.aiGenerated ? 'ai_journal_entry' : 'journal_entry',
      transaction_number: journalNumber,
      transaction_date: body.entryDate || new Date().toISOString().split('T')[0],
      total_amount: totalDebits, // Use total debits as the amount
      currency: 'USD',
      description: body.description,
      transaction_status: body.autoPost && (!body.metadata?.aiGenerated || aiConfidence >= 0.95) ? 'posted' : 'draft',
      ai_generated: body.metadata?.aiGenerated || false,
      transaction_data: {
        entries: body.entries.map(entry => ({
          account_code: entry.accountCode,
          account_name: entry.accountName || '',
          debit: entry.debit || 0,
          credit: entry.credit || 0,
          description: entry.description || '',
          cost_center: entry.costCenter,
          project: entry.project
        })),
        source_document: body.metadata?.sourceDocument,
        source_transaction: body.metadata?.sourceTransaction,
        total_debits: totalDebits,
        total_credits: totalCredits,
        is_balanced: isBalanced
      }
    };

    // Add AI classification if applicable
    if (body.metadata?.aiGenerated) {
      transactionData['ai_classification'] = {
        confidence_score: body.metadata.confidenceScore || aiConfidence,
        analysis_method: 'ai_assisted_creation',
        suggestions: [
          'Review account mappings',
          'Verify amounts match source documents',
          'Check cost center allocations'
        ]
      };
    }

    // Create the journal entry
    const { data: journalEntry, error: createError } = await supabase
      .from('universal_transactions')
      .insert(transactionData)
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating journal entry:', createError);
      return NextResponse.json(
        { 
          error: 'Failed to create journal entry',
          details: createError,
          success: false
        },
        { status: 500 }
      );
    }

    console.log('✅ Journal entry created successfully:', journalEntry.id);

    // If source document provided, create relationship
    if (body.metadata?.sourceDocument) {
      await supabase
        .from('core_relationships')
        .insert({
          organization_id: body.organizationId,
          relationship_type: 'document_to_journal',
          relationship_name: 'Source document for journal entry',
          parent_entity_id: body.metadata.sourceDocument,
          child_entity_id: journalEntry.id,
          is_active: true,
          created_by: 'system_journal_creation'
        });
    }

    // Call database function for additional processing if needed
    if (body.autoPost && journalEntry.transaction_status === 'posted') {
      const { data: postResult } = await supabase
        .rpc('create_balanced_journal_entry', {
          p_organization_id: body.organizationId,
          p_journal_entry_id: journalEntry.id,
          p_post_immediately: true
        });

      console.log('📮 Journal entry posted:', postResult);
    }

    // Log the creation
    await supabase
      .from('core_events')
      .insert({
        organization_id: body.organizationId,
        event_type: 'journal_entry_created',
        entity_id: journalEntry.id,
        event_data: {
          journal_number: journalNumber,
          ai_generated: body.metadata?.aiGenerated || false,
          auto_posted: journalEntry.transaction_status === 'posted',
          total_amount: totalDebits,
          entry_count: body.entries.length
        },
        created_at: new Date().toISOString()
      });

    const response: JournalEntryResponse = {
      id: journalEntry.id,
      journalNumber: journalNumber,
      description: body.description,
      entryDate: journalEntry.transaction_date,
      status: journalEntry.transaction_status,
      totalDebits: totalDebits,
      totalCredits: totalCredits,
      isBalanced: isBalanced,
      entries: body.entries,
      aiMetadata: body.metadata?.aiGenerated ? {
        generated: true,
        confidenceScore: aiConfidence,
        suggestions: ['Review before posting', 'Verify account mappings']
      } : undefined,
      createdAt: journalEntry.created_at,
      postedAt: journalEntry.transaction_status === 'posted' ? journalEntry.created_at : undefined
    };

    return NextResponse.json({
      data: response,
      success: true,
      message: `Journal entry created successfully${journalEntry.transaction_status === 'posted' ? ' and posted' : ''}`
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Journal entry POST error:', error);
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