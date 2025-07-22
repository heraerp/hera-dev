/**
 * HERA Universal - Chart of Accounts API Routes
 * 
 * Next.js 15 App Router API Route Handler
 * Uses HERA's 5-table universal architecture with 9-category structure:
 * ASSET, LIABILITY, EQUITY, REVENUE, COST_OF_SALES, 
 * DIRECT_EXPENSE, INDIRECT_EXPENSE, TAX_EXPENSE, EXTRAORDINARY_EXPENSE
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
interface ChartOfAccountRequest {
  organizationId: string;
  accountName: string;
  accountCode: string;
  accountType: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'COST_OF_SALES' | 
               'DIRECT_EXPENSE' | 'INDIRECT_EXPENSE' | 'TAX_EXPENSE' | 'EXTRAORDINARY_EXPENSE';
  description: string;
  parentAccount?: string;
  isActive: boolean;
  allowPosting: boolean;
  currency: string;
  openingBalance: number;
  budgetAmount?: number;
  taxDeductible: boolean;
  notes: string;
}

// GET /api/finance/chart-of-accounts
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId') || 'demo-org-id';
    
    console.log('🔍 Fetching Chart of Accounts for organization:', organizationId);

    // CORE PATTERN: Query core_entities first
    const { data: entities, error } = await supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'chart_of_account')
      .order('entity_code', { ascending: true });

    if (error) {
      console.error('❌ Error fetching entities:', error);
      return NextResponse.json(
        { error: 'Failed to fetch chart of accounts' },
        { status: 500 }
      );
    }

    // CORE PATTERN: Get dynamic data if entities exist
    let dynamicData: any[] = [];
    const entityIds = entities?.map(e => e.id) || [];
    
    if (entityIds.length > 0) {
      const { data: dynamicDataResult } = await supabase
        .from('core_dynamic_data')
        .select('entity_id, field_name, field_value')
        .in('entity_id', entityIds);
      
      dynamicData = dynamicDataResult || [];
    }

    // CORE PATTERN: Group dynamic data by entity_id
    const dynamicDataMap = dynamicData.reduce((acc, item) => {
      if (!acc[item.entity_id]) {
        acc[item.entity_id] = {};
      }
      acc[item.entity_id][item.field_name] = item.field_value;
      return acc;
    }, {} as Record<string, Record<string, any>>);

    // CORE PATTERN: Combine entities with dynamic data
    const accounts = (entities || []).map(entity => {
      const dynamicFields = dynamicDataMap[entity.id] || {};
      
      return {
        id: entity.id,
        accountCode: entity.entity_code,
        accountName: entity.entity_name,
        accountType: dynamicFields.account_type || 'ASSET',
        description: dynamicFields.description || '',
        parentAccount: dynamicFields.parent_account || '',
        isActive: entity.is_active,
        allowPosting: dynamicFields.allow_posting === 'true',
        currency: dynamicFields.currency || 'USD',
        balance: parseFloat(dynamicFields.current_balance || '0'),
        openingBalance: parseFloat(dynamicFields.opening_balance || '0'),
        budgetAmount: dynamicFields.budget_amount ? parseFloat(dynamicFields.budget_amount) : undefined,
        taxDeductible: dynamicFields.tax_deductible === 'true',
        notes: dynamicFields.notes || '',
        riskLevel: dynamicFields.risk_level || 'LOW',
        level: parseInt(dynamicFields.level || '0'),
        createdAt: entity.created_at,
        updatedAt: entity.updated_at,
        // Mock data for additional fields expected by the frontend
        complianceFlags: [],
        monthlyActivity: [],
        aiSuggestions: []
      };
    });

    console.log('✅ Retrieved', accounts.length, 'chart of accounts');

    return NextResponse.json({
      success: true,
      accounts: accounts,
      summary: {
        total: accounts.length,
        active: accounts.filter(a => a.isActive).length,
        byType: accounts.reduce((acc, account) => {
          acc[account.accountType] = (acc[account.accountType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      }
    });

  } catch (error) {
    console.error('❌ Chart of Accounts GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/finance/chart-of-accounts
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body: ChartOfAccountRequest = await request.json();

    console.log('📝 Creating new Chart of Account:', {
      name: body.accountName,
      code: body.accountCode,
      type: body.accountType
    });

    // Validate request
    if (!body.organizationId || !body.accountName || !body.accountCode || !body.accountType) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, accountName, accountCode, accountType' },
        { status: 400 }
      );
    }

    // Validate account code format (7 digits)
    if (!/^\d{7}$/.test(body.accountCode)) {
      return NextResponse.json(
        { error: 'Account code must be exactly 7 digits' },
        { status: 400 }
      );
    }

    // Validate account type
    const validAccountTypes = [
      'ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'COST_OF_SALES',
      'DIRECT_EXPENSE', 'INDIRECT_EXPENSE', 'TAX_EXPENSE', 'EXTRAORDINARY_EXPENSE'
    ];
    if (!validAccountTypes.includes(body.accountType)) {
      return NextResponse.json(
        { error: 'Invalid account type' },
        { status: 400 }
      );
    }

    // Check if account code already exists
    const { data: existingAccount } = await supabase
      .from('core_entities')
      .select('id')
      .eq('organization_id', body.organizationId)
      .eq('entity_type', 'chart_of_account')
      .eq('entity_code', body.accountCode)
      .single();

    if (existingAccount) {
      return NextResponse.json(
        { error: 'Account code already exists' },
        { status: 409 }
      );
    }

    const entityId = crypto.randomUUID();

    // CORE PATTERN: Create entity record
    const { data: entity, error: entityError } = await supabase
      .from('core_entities')
      .insert({
        id: entityId,
        organization_id: body.organizationId,
        entity_type: 'chart_of_account',
        entity_name: body.accountName,
        entity_code: body.accountCode,
        is_active: body.isActive
      })
      .select()
      .single();

    if (entityError) {
      console.error('❌ Error creating entity:', entityError);
      return NextResponse.json(
        { error: 'Failed to create chart of account entity' },
        { status: 500 }
      );
    }

    // CORE PATTERN: Create dynamic data fields
    const dynamicFields = [
      { entity_id: entityId, field_name: 'account_type', field_value: body.accountType, field_type: 'text' },
      { entity_id: entityId, field_name: 'description', field_value: body.description, field_type: 'text' },
      { entity_id: entityId, field_name: 'allow_posting', field_value: body.allowPosting.toString(), field_type: 'boolean' },
      { entity_id: entityId, field_name: 'currency', field_value: body.currency, field_type: 'text' },
      { entity_id: entityId, field_name: 'opening_balance', field_value: body.openingBalance.toString(), field_type: 'decimal' },
      { entity_id: entityId, field_name: 'current_balance', field_value: body.openingBalance.toString(), field_type: 'decimal' },
      { entity_id: entityId, field_name: 'tax_deductible', field_value: body.taxDeductible.toString(), field_type: 'boolean' },
      { entity_id: entityId, field_name: 'notes', field_value: body.notes || '', field_type: 'text' },
      { entity_id: entityId, field_name: 'risk_level', field_value: 'LOW', field_type: 'text' },
      { entity_id: entityId, field_name: 'level', field_value: '0', field_type: 'number' }
    ];

    // Add optional fields
    if (body.parentAccount) {
      dynamicFields.push({
        entity_id: entityId,
        field_name: 'parent_account',
        field_value: body.parentAccount,
        field_type: 'text'
      });
    }

    if (body.budgetAmount !== undefined) {
      dynamicFields.push({
        entity_id: entityId,
        field_name: 'budget_amount',
        field_value: body.budgetAmount.toString(),
        field_type: 'decimal'
      });
    }

    const { error: dynamicError } = await supabase
      .from('core_dynamic_data')
      .insert(dynamicFields);

    if (dynamicError) {
      console.error('❌ Error creating dynamic data:', dynamicError);
      // Clean up entity if dynamic data failed
      await supabase
        .from('core_entities')
        .delete()
        .eq('id', entityId);
      
      return NextResponse.json(
        { error: 'Failed to create chart of account details' },
        { status: 500 }
      );
    }

    // Get account category info for response
    const categoryInfo = getAccountCategoryInfo(body.accountType);

    console.log('✅ Chart of Account created successfully:', {
      id: entityId,
      code: body.accountCode,
      name: body.accountName,
      type: body.accountType
    });

    return NextResponse.json({
      success: true,
      data: {
        id: entityId,
        accountCode: body.accountCode,
        accountName: body.accountName,
        accountType: body.accountType,
        description: body.description,
        isActive: body.isActive,
        balance: body.openingBalance,
        currency: body.currency,
        category: categoryInfo
      },
      message: 'Chart of Account created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Chart of Accounts POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get account category information
function getAccountCategoryInfo(accountType: string) {
  const categories = {
    'ASSET': {
      name: 'Asset',
      description: 'Resources owned by the business',
      codeRange: '1000000-1999999'
    },
    'LIABILITY': {
      name: 'Liability',
      description: 'Debts and obligations owed to creditors',
      codeRange: '2000000-2999999'
    },
    'EQUITY': {
      name: 'Equity',
      description: 'Owner\'s stake in the business',
      codeRange: '3000000-3999999'
    },
    'REVENUE': {
      name: 'Revenue',
      description: 'Income generated from business operations',
      codeRange: '4000000-4999999'
    },
    'COST_OF_SALES': {
      name: 'Cost of Sales',
      description: 'Direct costs to produce goods or services',
      codeRange: '5000000-5999999'
    },
    'DIRECT_EXPENSE': {
      name: 'Direct Expense',
      description: 'Operating expenses directly tied to business',
      codeRange: '6000000-6999999'
    },
    'INDIRECT_EXPENSE': {
      name: 'Indirect Expense',
      description: 'General business expenses',
      codeRange: '7000000-7999999'
    },
    'TAX_EXPENSE': {
      name: 'Tax Expense',
      description: 'Tax-related expenses and obligations',
      codeRange: '8000000-8999999'
    },
    'EXTRAORDINARY_EXPENSE': {
      name: 'Extraordinary Expense',
      description: 'Unusual or infrequent business expenses',
      codeRange: '9000000-9999999'
    }
  };

  return categories[accountType as keyof typeof categories] || {
    name: 'Unknown',
    description: 'Unknown account type',
    codeRange: '0000000-9999999'
  };
}