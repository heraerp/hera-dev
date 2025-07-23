/**
 * HERA Universal - GL Accounts API
 * 
 * Next.js 15 App Router API Route Handler
 * Uses HERA's 5-table universal architecture:
 * - core_entities: GL account records (entity_type = 'gl_account')
 * - core_dynamic_data: Account metadata (balances, types, settings)
 * - core_relationships: Account relationships and patterns
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

interface GLAccountRequest {
  organizationId: string;
  accountCode: string;
  accountName: string;
  accountType: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'COST_OF_SALES' | 
               'DIRECT_EXPENSE' | 'INDIRECT_EXPENSE' | 'TAX_EXPENSE' | 'EXTRAORDINARY_EXPENSE';
  parentAccount?: string;
  isActive?: boolean;
  allowPosting?: boolean;
  description?: string;
  openingBalance?: number;
  budgetAmount?: number;
}

interface GLAccountResponse {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  isActive: boolean;
  allowPosting: boolean;
  currentBalance: number;
  lastUsed: string | null;
  usageCount: number;
  ytdActivity: number;
  createdAt: string;
}

// GET /api/finance/gl-accounts
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const accountType = searchParams.get('accountType');
    const activeOnly = searchParams.get('activeOnly') === 'true';
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    console.log('📚 Fetching GL accounts for organization:', organizationId);

    // CORE PATTERN: Query core_entities first
    let entitiesQuery = supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId) // SACRED
      .eq('entity_type', 'chart_of_account')
      .order('entity_code', { ascending: true });

    if (activeOnly) {
      entitiesQuery = entitiesQuery.eq('is_active', true);
    }

    const { data: entities, error } = await entitiesQuery;

    if (error) {
      console.error('❌ Error fetching GL accounts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch GL accounts' },
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
    const enrichedAccounts = (entities || []).map(entity => {
      const metadata = dynamicDataMap[entity.id] || {};
      
      return {
        id: entity.id,
        accountCode: entity.entity_code,
        accountName: entity.entity_name,
        accountType: metadata.account_type || 'ASSET',
        isActive: entity.is_active,
        allowPosting: metadata.allow_posting === 'true',
        currentBalance: parseFloat(metadata.current_balance || '0'),
        lastUsed: metadata.last_used_date || null,
        usageCount: parseInt(metadata.usage_count || '0'),
        ytdActivity: parseFloat(metadata.ytd_activity || '0'),
        description: metadata.description || '',
        openingBalance: parseFloat(metadata.opening_balance || '0'),
        budgetAmount: parseFloat(metadata.budget_amount || '0'),
        createdAt: entity.created_at,
        updatedAt: entity.updated_at
      };
    });

    // Filter by account type if specified
    const filteredAccounts = accountType 
      ? enrichedAccounts.filter(acc => acc.accountType === accountType)
      : enrichedAccounts;

    console.log(`✅ Found ${filteredAccounts.length} GL accounts`);

    return NextResponse.json({
      data: filteredAccounts,
      summary: {
        total: filteredAccounts.length,
        active: filteredAccounts.filter(a => a.isActive).length,
        byType: filteredAccounts.reduce((acc, account) => {
          acc[account.accountType] = (acc[account.accountType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      }
    });

  } catch (error) {
    console.error('❌ GL accounts GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/finance/gl-accounts
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body: GLAccountRequest = await request.json();

    console.log('📝 Creating GL account:', body.accountCode, body.accountName);
    console.log('📝 Request body:', JSON.stringify(body, null, 2));

    // Validate request
    if (!body.organizationId || !body.accountCode || !body.accountName || !body.accountType) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, accountCode, accountName, accountType' },
        { status: 400 }
      );
    }

    // Check if account code already exists for this organization
    const { data: existingAccount } = await supabase
      .from('core_entities')
      .select('id')
      .eq('organization_id', body.organizationId) // SACRED
      .eq('entity_type', 'chart_of_account')
      .eq('entity_code', body.accountCode)
      .single();

    if (existingAccount) {
      return NextResponse.json(
        { error: `GL account ${body.accountCode} already exists` },
        { status: 409 }
      );
    }

    const entityId = crypto.randomUUID();

    // CORE PATTERN: Create entity record
    const { data: entity, error: entityError } = await supabase
      .from('core_entities')
      .insert({
        id: entityId,
        organization_id: body.organizationId, // SACRED
        entity_type: 'chart_of_account',
        entity_name: body.accountName,
        entity_code: body.accountCode,
        is_active: body.isActive !== false // Default to true
      })
      .select()
      .single();

    if (entityError) {
      console.error('❌ Error creating GL account entity:', entityError);
      console.error('❌ Entity error details:', JSON.stringify(entityError, null, 2));
      return NextResponse.json(
        { error: 'Failed to create GL account', details: entityError },
        { status: 500 }
      );
    }

    // CORE PATTERN: Create dynamic data fields
    const dynamicFields = [
      {
        entity_id: entityId,
        field_name: 'account_type',
        field_value: body.accountType,
        field_type: 'text'
      },
      {
        entity_id: entityId,
        field_name: 'allow_posting',
        field_value: (body.allowPosting !== false).toString(),
        field_type: 'boolean'
      },
      {
        entity_id: entityId,
        field_name: 'current_balance',
        field_value: (body.openingBalance || 0).toString(),
        field_type: 'number'
      },
      {
        entity_id: entityId,
        field_name: 'opening_balance',
        field_value: (body.openingBalance || 0).toString(),
        field_type: 'number'
      },
      {
        entity_id: entityId,
        field_name: 'ytd_activity',
        field_value: '0',
        field_type: 'number'
      },
      {
        entity_id: entityId,
        field_name: 'usage_count',
        field_value: '0',
        field_type: 'number'
      }
    ];

    // Add optional fields
    if (body.description) {
      dynamicFields.push({
        entity_id: entityId,
        field_name: 'description',
        field_value: body.description,
        field_type: 'text'
      });
    }

    if (body.budgetAmount) {
      dynamicFields.push({
        entity_id: entityId,
        field_name: 'budget_amount',
        field_value: body.budgetAmount.toString(),
        field_type: 'number'
      });
    }

    if (body.parentAccount) {
      dynamicFields.push({
        entity_id: entityId,
        field_name: 'parent_account',
        field_value: body.parentAccount,
        field_type: 'text'
      });
    }

    const { error: dynamicError } = await supabase
      .from('core_dynamic_data')
      .insert(dynamicFields);

    if (dynamicError) {
      console.error('❌ Error creating GL account metadata:', dynamicError);
      // Try to clean up the entity
      await supabase
        .from('core_entities')
        .delete()
        .eq('id', entityId);
      
      return NextResponse.json(
        { error: 'Failed to create GL account metadata' },
        { status: 500 }
      );
    }

    console.log('✅ GL account created successfully:', entityId);

    const response: GLAccountResponse = {
      id: entityId,
      accountCode: body.accountCode,
      accountName: body.accountName,
      accountType: body.accountType,
      isActive: body.isActive !== false,
      allowPosting: body.allowPosting !== false,
      currentBalance: body.openingBalance || 0,
      lastUsed: null,
      usageCount: 0,
      ytdActivity: 0,
      createdAt: entity.created_at
    };

    return NextResponse.json({
      success: true,
      data: response,
      message: 'GL account created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ GL account POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}