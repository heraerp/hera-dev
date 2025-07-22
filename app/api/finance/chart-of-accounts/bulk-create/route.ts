/**
 * HERA Universal - Bulk Chart of Accounts Creation
 * 
 * Create multiple GL accounts at once from AI-generated or user-provided data
 * Supports batch processing with rollback on errors
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

interface BulkAccountRequest {
  organizationId: string;
  accounts: Array<{
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
    priority?: 'essential' | 'recommended' | 'optional';
  }>;
  validateOnly?: boolean; // If true, only validate without creating
}

interface BulkCreationResult {
  success: boolean;
  totalRequested: number;
  created: number;
  skipped: number;
  failed: number;
  results: Array<{
    accountCode: string;
    accountName: string;
    status: 'created' | 'skipped' | 'failed';
    reason?: string;
    entityId?: string;
  }>;
  errors: Array<{
    accountCode: string;
    error: string;
  }>;
}

// Validate individual account
const validateAccount = (account: any, index: number): string[] => {
  const errors: string[] = [];
  const prefix = `Account ${index + 1} (${account.accountCode || 'unknown'})`;

  if (!account.accountName?.trim()) {
    errors.push(`${prefix}: Account name is required`);
  } else if (account.accountName.length < 3) {
    errors.push(`${prefix}: Account name must be at least 3 characters`);
  }

  if (!account.accountCode?.trim()) {
    errors.push(`${prefix}: Account code is required`);
  } else if (!/^\d{7}$/.test(account.accountCode)) {
    errors.push(`${prefix}: Account code must be exactly 7 digits`);
  }

  const validAccountTypes = [
    'ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'COST_OF_SALES',
    'DIRECT_EXPENSE', 'INDIRECT_EXPENSE', 'TAX_EXPENSE', 'EXTRAORDINARY_EXPENSE'
  ];
  if (!validAccountTypes.includes(account.accountType)) {
    errors.push(`${prefix}: Invalid account type`);
  }

  if (!account.description?.trim()) {
    errors.push(`${prefix}: Description is required`);
  }

  if (!account.currency) {
    errors.push(`${prefix}: Currency is required`);
  }

  if (typeof account.isActive !== 'boolean') {
    errors.push(`${prefix}: isActive must be boolean`);
  }

  if (typeof account.allowPosting !== 'boolean') {
    errors.push(`${prefix}: allowPosting must be boolean`);
  }

  return errors;
};

// Check for duplicate account codes in the database
const checkExistingAccounts = async (supabase: any, organizationId: string, accountCodes: string[]) => {
  const { data: existingAccounts, error } = await supabase
    .from('core_entities')
    .select('entity_code')
    .eq('organization_id', organizationId)
    .eq('entity_type', 'chart_of_account')
    .in('entity_code', accountCodes);

  if (error) {
    throw new Error(`Failed to check existing accounts: ${error.message}`);
  }

  return new Set(existingAccounts?.map(acc => acc.entity_code) || []);
};

// Create single account
const createSingleAccount = async (supabase: any, organizationId: string, account: any) => {
  const entityId = crypto.randomUUID();

  // Create entity record
  const { data: entity, error: entityError } = await supabase
    .from('core_entities')
    .insert({
      id: entityId,
      organization_id: organizationId,
      entity_type: 'chart_of_account',
      entity_name: account.accountName,
      entity_code: account.accountCode,
      is_active: account.isActive
    })
    .select()
    .single();

  if (entityError) {
    throw new Error(`Failed to create entity: ${entityError.message}`);
  }

  // Create dynamic data fields
  const dynamicFields = [
    { entity_id: entityId, field_name: 'account_type', field_value: account.accountType, field_type: 'text' },
    { entity_id: entityId, field_name: 'description', field_value: account.description, field_type: 'text' },
    { entity_id: entityId, field_name: 'allow_posting', field_value: account.allowPosting.toString(), field_type: 'boolean' },
    { entity_id: entityId, field_name: 'currency', field_value: account.currency, field_type: 'text' },
    { entity_id: entityId, field_name: 'opening_balance', field_value: account.openingBalance.toString(), field_type: 'decimal' },
    { entity_id: entityId, field_name: 'current_balance', field_value: account.openingBalance.toString(), field_type: 'decimal' },
    { entity_id: entityId, field_name: 'tax_deductible', field_value: account.taxDeductible.toString(), field_type: 'boolean' },
    { entity_id: entityId, field_name: 'notes', field_value: account.notes || '', field_type: 'text' },
    { entity_id: entityId, field_name: 'risk_level', field_value: 'LOW', field_type: 'text' },
    { entity_id: entityId, field_name: 'level', field_value: '0', field_type: 'number' }
  ];

  // Add optional fields
  if (account.parentAccount) {
    dynamicFields.push({
      entity_id: entityId,
      field_name: 'parent_account',
      field_value: account.parentAccount,
      field_type: 'text'
    });
  }

  if (account.budgetAmount !== undefined) {
    dynamicFields.push({
      entity_id: entityId,
      field_name: 'budget_amount',
      field_value: account.budgetAmount.toString(),
      field_type: 'decimal'
    });
  }

  if (account.priority) {
    dynamicFields.push({
      entity_id: entityId,
      field_name: 'ai_priority',
      field_value: account.priority,
      field_type: 'text'
    });
  }

  const { error: dynamicError } = await supabase
    .from('core_dynamic_data')
    .insert(dynamicFields);

  if (dynamicError) {
    // Clean up entity if dynamic data failed
    await supabase
      .from('core_entities')
      .delete()
      .eq('id', entityId);
    
    throw new Error(`Failed to create account details: ${dynamicError.message}`);
  }

  return entityId;
};

// POST /api/finance/chart-of-accounts/bulk-create
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body: BulkAccountRequest = await request.json();

    console.log('📊 Bulk COA Creation Request:', {
      organizationId: body.organizationId,
      accountCount: body.accounts?.length || 0,
      validateOnly: body.validateOnly
    });

    // Validate request
    if (!body.organizationId || !body.accounts || !Array.isArray(body.accounts)) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, accounts (array)' },
        { status: 400 }
      );
    }

    if (body.accounts.length === 0) {
      return NextResponse.json(
        { error: 'No accounts provided for creation' },
        { status: 400 }
      );
    }

    if (body.accounts.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 accounts can be created at once' },
        { status: 400 }
      );
    }

    const result: BulkCreationResult = {
      success: false,
      totalRequested: body.accounts.length,
      created: 0,
      skipped: 0,
      failed: 0,
      results: [],
      errors: []
    };

    // Step 1: Validate all accounts
    const validationErrors: string[] = [];
    body.accounts.forEach((account, index) => {
      const accountErrors = validateAccount(account, index);
      validationErrors.push(...accountErrors);
    });

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          validationErrors,
          summary: `${validationErrors.length} validation errors found`
        },
        { status: 400 }
      );
    }

    // Step 2: Check for duplicate codes within the request
    const requestCodes = body.accounts.map(acc => acc.accountCode);
    const uniqueCodes = new Set(requestCodes);
    if (uniqueCodes.size !== requestCodes.length) {
      const duplicates = requestCodes.filter((code, index) => 
        requestCodes.indexOf(code) !== index
      );
      return NextResponse.json(
        { 
          error: 'Duplicate account codes in request',
          duplicates: [...new Set(duplicates)]
        },
        { status: 400 }
      );
    }

    // Step 3: Check for existing accounts in database
    const existingCodes = await checkExistingAccounts(supabase, body.organizationId, requestCodes);

    // If validation only, return validation results
    if (body.validateOnly) {
      const conflicts = requestCodes.filter(code => existingCodes.has(code));
      
      return NextResponse.json({
        success: true,
        validation: {
          totalAccounts: body.accounts.length,
          validAccounts: body.accounts.length - conflicts.length,
          conflicts: conflicts.length,
          conflictingCodes: conflicts,
          ready: conflicts.length === 0
        },
        message: conflicts.length === 0 
          ? 'All accounts validated successfully' 
          : `${conflicts.length} account codes already exist`
      });
    }

    // Step 4: Create accounts (skip existing ones)
    for (const account of body.accounts) {
      try {
        if (existingCodes.has(account.accountCode)) {
          result.results.push({
            accountCode: account.accountCode,
            accountName: account.accountName,
            status: 'skipped',
            reason: 'Account code already exists'
          });
          result.skipped++;
        } else {
          const entityId = await createSingleAccount(supabase, body.organizationId, account);
          result.results.push({
            accountCode: account.accountCode,
            accountName: account.accountName,
            status: 'created',
            entityId
          });
          result.created++;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.results.push({
          accountCode: account.accountCode,
          accountName: account.accountName,
          status: 'failed',
          reason: errorMessage
        });
        result.errors.push({
          accountCode: account.accountCode,
          error: errorMessage
        });
        result.failed++;
      }
    }

    result.success = result.created > 0;

    console.log('✅ Bulk COA Creation Summary:', {
      total: result.totalRequested,
      created: result.created,
      skipped: result.skipped,
      failed: result.failed
    });

    return NextResponse.json({
      success: result.success,
      data: result,
      message: `Bulk creation completed: ${result.created} created, ${result.skipped} skipped, ${result.failed} failed`
    }, { status: result.success ? 201 : 207 }); // 207 Multi-Status for partial success

  } catch (error) {
    console.error('❌ Bulk COA Creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error during bulk creation' },
      { status: 500 }
    );
  }
}