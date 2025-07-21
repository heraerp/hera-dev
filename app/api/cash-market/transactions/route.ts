/**
 * HERA Universal - Cash Market Transactions API Routes
 * 
 * Next.js 15 App Router API Route Handler
 * Uses HERA's universal architecture:
 * - universal_transactions: All cash market transactions
 * - core_entities: Link to vendors and receipts
 * - core_relationships: Transaction-vendor relationships
 * - core_dynamic_data: Transaction metadata
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

// TypeScript interfaces
interface CashTransactionRequest {
  organizationId: string;
  vendorId: string;
  receiptId?: string;
  type: 'expense' | 'replenishment' | 'advance';
  amount: number;
  currency?: string;
  description: string;
  category: string;
  location?: string;
  items?: Array<{
    item: string;
    quantity: string;
    unitPrice: number;
    totalPrice: number;
  }>;
  submittedBy: string;
  aiConfidence?: number;
  receiptImageUrl?: string;
  notes?: string;
}

interface TransactionFilters {
  organizationId: string;
  vendorId?: string;
  type?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

// GET /api/cash-market/transactions
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    
    const filters: TransactionFilters = {
      organizationId: searchParams.get('organizationId') || '',
      vendorId: searchParams.get('vendorId') || undefined,
      type: searchParams.get('type') || undefined,
      status: searchParams.get('status') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      category: searchParams.get('category') || undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0')
    };
    
    if (!filters.organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    // Build query for universal_transactions
    let query = supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', filters.organizationId)
      .eq('transaction_type', 'cash_market_purchase')
      .order('transaction_date', { ascending: false });

    // Apply filters
    if (filters.type) {
      query = query.eq('transaction_subtype', filters.type);
    }
    
    if (filters.status) {
      query = query.eq('transaction_status', filters.status);
    }
    
    if (filters.dateFrom) {
      query = query.gte('transaction_date', filters.dateFrom);
    }
    
    if (filters.dateTo) {
      query = query.lte('transaction_date', filters.dateTo);
    }

    // Apply pagination
    query = query.range(filters.offset, filters.offset + filters.limit - 1);

    const { data: transactions, error } = await query;

    if (error) {
      console.error('Error fetching transactions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      );
    }

    // Get vendor information for transactions
    const vendorIds = [...new Set(transactions?.map(t => {
      try {
        const data = typeof t.transaction_data === 'string' ? JSON.parse(t.transaction_data) : t.transaction_data;
        return data?.vendorId;
      } catch {
        return null;
      }
    }).filter(Boolean))] as string[];

    let vendors: Record<string, any> = {};
    if (vendorIds.length > 0) {
      const { data: vendorEntities } = await supabase
        .from('core_entities')
        .select('id, entity_name, entity_code')
        .eq('organization_id', filters.organizationId)
        .eq('entity_type', 'cash_market_vendor')
        .in('id', vendorIds);

      vendors = (vendorEntities || []).reduce((acc, vendor) => {
        acc[vendor.id] = vendor;
        return acc;
      }, {} as Record<string, any>);
    }

    // Enrich transactions with vendor data and parse procurement_metadata
    const enrichedTransactions = (transactions || []).map(transaction => {
      let transactionData = {};
      let vendorInfo = {};
      
      try {
        // Parse procurement_metadata instead of transaction_data
        transactionData = typeof transaction.procurement_metadata === 'string' 
          ? JSON.parse(transaction.procurement_metadata) 
          : transaction.procurement_metadata || {};
        
        const vendorId = (transactionData as any)?.vendor_id;
        if (vendorId && vendors[vendorId]) {
          vendorInfo = {
            vendorId,
            vendorName: vendors[vendorId].entity_name,
            vendorCode: vendors[vendorId].entity_code
          };
        }
      } catch (error) {
        console.error('Error parsing transaction data:', error);
      }

      return {
        id: transaction.id,
        transactionNumber: transaction.transaction_number,
        date: transaction.transaction_date,
        type: transaction.transaction_subtype || 'expense',
        amount: transaction.total_amount,
        currency: transaction.currency || 'USD',
        status: transaction.transaction_status || 'pending',
        workflowStatus: transaction.workflow_status,
        description: (transactionData as any)?.description || '',
        category: (transactionData as any)?.category || '',
        location: (transactionData as any)?.location || '',
        items: (transactionData as any)?.items || [],
        submittedBy: (transactionData as any)?.submitted_by || '',
        aiConfidence: (transactionData as any)?.ai_confidence || 0,
        receiptImageUrl: (transactionData as any)?.receipt_image_url || '',
        notes: (transactionData as any)?.notes || '',
        vendor: vendorInfo,
        isFinancial: transaction.is_financial,
        requiresApproval: transaction.requires_approval,
        createdAt: transaction.created_at,
        updatedAt: transaction.updated_at,
        ...transactionData
      };
    });

    // Apply additional filters that need parsed data
    let filteredTransactions = enrichedTransactions;
    
    if (filters.vendorId) {
      filteredTransactions = filteredTransactions.filter(t => 
        (t.vendor as any)?.vendorId === filters.vendorId
      );
    }
    
    if (filters.category) {
      filteredTransactions = filteredTransactions.filter(t => 
        t.category?.toLowerCase().includes(filters.category!.toLowerCase())
      );
    }

    // Generate summary statistics
    const summary = {
      total: filteredTransactions.length,
      totalAmount: filteredTransactions.reduce((sum, t) => sum + (t.amount || 0), 0),
      byStatus: filteredTransactions.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byType: filteredTransactions.reduce((acc, t) => {
        acc[t.type] = (acc[t.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byCategory: filteredTransactions.reduce((acc, t) => {
        const cat = t.category || 'Uncategorized';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      averageAmount: filteredTransactions.length > 0 
        ? filteredTransactions.reduce((sum, t) => sum + (t.amount || 0), 0) / filteredTransactions.length 
        : 0,
      topVendors: Object.values(
        filteredTransactions.reduce((acc, t) => {
          const vendor = t.vendor as any;
          if (vendor?.vendorId) {
            if (!acc[vendor.vendorId]) {
              acc[vendor.vendorId] = {
                vendorId: vendor.vendorId,
                vendorName: vendor.vendorName,
                totalTransactions: 0,
                totalAmount: 0
              };
            }
            acc[vendor.vendorId].totalTransactions++;
            acc[vendor.vendorId].totalAmount += t.amount || 0;
          }
          return acc;
        }, {} as Record<string, any>)
      ).sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 5)
    };

    return NextResponse.json({
      data: filteredTransactions,
      summary,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        hasMore: filteredTransactions.length === filters.limit
      }
    });

  } catch (error) {
    console.error('Cash market transactions GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/cash-market/transactions
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body: CashTransactionRequest = await request.json();

    // Validate required fields
    if (!body.organizationId || !body.vendorId || !body.amount || !body.description) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, vendorId, amount, description' },
        { status: 400 }
      );
    }

    // Verify vendor exists
    const { data: vendor, error: vendorError } = await supabase
      .from('core_entities')
      .select('id, entity_name')
      .eq('id', body.vendorId)
      .eq('organization_id', body.organizationId)
      .eq('entity_type', 'cash_market_vendor')
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 400 }
      );
    }

    // Generate transaction number
    const transactionNumber = `CM-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Prepare transaction data
    const transactionData = {
      vendorId: body.vendorId,
      vendorName: vendor.entity_name,
      receiptId: body.receiptId,
      description: body.description,
      category: body.category,
      location: body.location,
      items: body.items || [],
      submittedBy: body.submittedBy,
      aiConfidence: body.aiConfidence || 0,
      receiptImageUrl: body.receiptImageUrl,
      notes: body.notes || '',
      timestamp: new Date().toISOString()
    };

    // Determine workflow status based on amount and AI confidence
    let workflowStatus = 'pending_review';
    let requiresApproval = true;
    
    if (body.amount < 50 && (body.aiConfidence || 0) > 0.85) {
      workflowStatus = 'auto_approved';
      requiresApproval = false;
    } else if (body.amount < 100 && (body.aiConfidence || 0) > 0.90) {
      workflowStatus = 'auto_approved';
      requiresApproval = false;
    }

    // Create transaction in universal_transactions using the same pattern as purchase orders
    const transactionDataForDB = {
      organization_id: body.organizationId,
      transaction_type: 'cash_market_purchase',
      transaction_number: transactionNumber,
      transaction_date: new Date().toISOString().split('T')[0],
      total_amount: body.amount,
      currency: body.currency || 'USD',
      transaction_status: workflowStatus === 'auto_approved' ? 'approved' : 'pending',
      workflow_status: workflowStatus,
      procurement_metadata: {
        vendor_id: body.vendorId,
        vendor_name: vendor.entity_name,
        receipt_id: body.receiptId,
        transaction_type: body.type || 'expense',
        description: body.description,
        category: body.category,
        location: body.location,
        items: body.items || [],
        submitted_by: body.submittedBy,
        ai_confidence: body.aiConfidence || 0,
        receipt_image_url: body.receiptImageUrl,
        notes: body.notes || '',
        created_via: 'cash_market_api',
        timestamp: new Date().toISOString()
      }
    };

    console.log('About to insert cash market transaction:', JSON.stringify(transactionDataForDB, null, 2));

    const { data: transaction, error: transactionError } = await supabase
      .from('universal_transactions')
      .insert(transactionDataForDB)
      .select()
      .single();

    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      return NextResponse.json(
        { error: 'Failed to create transaction' },
        { status: 500 }
      );
    }

    // Create relationship between vendor and transaction
    const { error: relationshipError } = await supabase
      .from('core_relationships')
      .insert({
        organization_id: body.organizationId,
        relationship_type: 'vendor_transaction',
        relationship_name: 'Cash Market Purchase',
        parent_entity_id: body.vendorId,
        child_entity_id: transaction.id,
        relationship_data: JSON.stringify({
          transactionNumber: transactionNumber,
          amount: body.amount,
          date: new Date().toISOString()
        }),
        is_active: true
      });

    if (relationshipError) {
      console.error('Error creating vendor-transaction relationship:', relationshipError);
    }

    // If receipt is provided, create relationship
    if (body.receiptId) {
      await supabase
        .from('core_relationships')
        .insert({
          organization_id: body.organizationId,
          relationship_type: 'transaction_receipt',
          relationship_name: 'Transaction Receipt',
          parent_entity_id: transaction.id,
          child_entity_id: body.receiptId,
          relationship_data: JSON.stringify({
            transactionNumber: transactionNumber,
            attachmentType: 'receipt'
          }),
          is_active: true
        });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: transaction.id,
        transactionNumber: transactionNumber,
        amount: body.amount,
        status: transaction.transaction_status,
        workflowStatus: workflowStatus,
        requiresApproval: requiresApproval,
        vendorName: vendor.entity_name
      },
      message: `Cash market transaction created successfully${workflowStatus === 'auto_approved' ? ' and auto-approved' : ''}`
    }, { status: 201 });

  } catch (error) {
    console.error('Cash market transactions POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}