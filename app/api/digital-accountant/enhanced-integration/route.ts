/**
 * HERA Digital Accountant - Enhanced Chart of Accounts Integration
 * 
 * Bridges Digital Accountant AI with the new 9-category Chart of Accounts structure
 * Provides intelligent account mapping, receipt-to-account classification, and journal automation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

interface IntelligentMappingRequest {
  organizationId: string;
  documentType: 'receipt' | 'invoice' | 'expense' | 'purchase_order';
  aiResults: {
    vendor?: string;
    description: string;
    amount: number;
    category?: string;
    items?: Array<{
      description: string;
      amount: number;
      quantity?: number;
    }>;
  };
  confidence?: number;
}

interface AccountMappingResponse {
  primaryAccount: {
    code: string;
    name: string;
    type: string;
    category: string;
    confidence: number;
  };
  alternativeAccounts: Array<{
    code: string;
    name: string;
    confidence: number;
    reason: string;
  }>;
  journalEntries: Array<{
    accountCode: string;
    accountName: string;
    debit?: number;
    credit?: number;
    description: string;
  }>;
  aiReasoning: string[];
  businessRules: string[];
}

// GET /api/digital-accountant/enhanced-integration
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const action = searchParams.get('action');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required', success: false },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    switch (action) {
      case 'account-structure':
        return await getAccountStructure(supabase, organizationId);
      
      case 'mapping-patterns':
        return await getMappingPatterns(supabase, organizationId);
      
      case 'ai-suggestions':
        return await getAISuggestions(supabase, organizationId);
      
      default:
        return NextResponse.json({
          integration: 'Digital Accountant <-> Chart of Accounts Enhanced Integration',
          version: '2.0.0',
          capabilities: [
            'Intelligent account mapping using 9-category structure',
            'Receipt-to-account classification',
            'Restaurant industry-specific business rules',
            'AI-powered journal entry generation',
            'Cost of Sales vs Expense categorization',
            'Tax expense automatic detection'
          ],
          endpoints: {
            'GET ?action=account-structure': 'Get available account structure',
            'GET ?action=mapping-patterns': 'Get learned mapping patterns',
            'GET ?action=ai-suggestions': 'Get AI account suggestions',
            'POST': 'Create intelligent account mapping',
            'PUT': 'Update mapping rules and patterns'
          },
          success: true
        });
    }

  } catch (error) {
    console.error('❌ Enhanced integration GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}

// POST /api/digital-accountant/enhanced-integration
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body: IntelligentMappingRequest = await request.json();

    console.log('🧠 Enhanced integration: Intelligent account mapping requested', body);

    if (!body.organizationId || !body.aiResults) {
      return NextResponse.json(
        { error: 'organizationId and aiResults are required', success: false },
        { status: 400 }
      );
    }

    // Step 1: Get organization's chart of accounts structure
    const accountStructure = await getOrganizationAccounts(supabase, body.organizationId);

    // Step 2: Perform intelligent mapping based on 9-category structure
    const mappingResult = await performIntelligentMapping(
      body.aiResults, 
      body.documentType, 
      accountStructure,
      body.confidence || 0.8
    );

    // Step 3: Generate journal entries
    const journalEntries = await generateEnhancedJournalEntries(
      body.aiResults,
      mappingResult.primaryAccount,
      body.organizationId
    );

    // Step 4: Create AI learning record
    await recordMappingPattern(supabase, body.organizationId, {
      vendor: body.aiResults.vendor,
      category: body.aiResults.category,
      mappedAccount: mappingResult.primaryAccount,
      confidence: mappingResult.primaryAccount.confidence,
      documentType: body.documentType
    });

    const response: AccountMappingResponse = {
      primaryAccount: mappingResult.primaryAccount,
      alternativeAccounts: mappingResult.alternativeAccounts,
      journalEntries: journalEntries,
      aiReasoning: mappingResult.reasoning,
      businessRules: mappingResult.businessRules
    };

    return NextResponse.json({
      data: response,
      success: true,
      message: 'Intelligent account mapping completed successfully'
    });

  } catch (error) {
    console.error('❌ Enhanced integration POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}

// Helper Functions

async function getAccountStructure(supabase: any, organizationId: string) {
  // Get the 9-category structure
  const { data: accounts } = await supabase
    .from('core_entities')
    .select(`
      id,
      entity_code,
      entity_name,
      core_dynamic_data!inner(field_name, field_value)
    `)
    .eq('organization_id', organizationId)
    .eq('entity_type', 'chart_of_account')
    .eq('is_active', true);

  // Organize by account type
  const structure = {
    ASSET: [],
    LIABILITY: [],
    EQUITY: [],
    REVENUE: [],
    COST_OF_SALES: [],
    DIRECT_EXPENSE: [],
    INDIRECT_EXPENSE: [],
    TAX_EXPENSE: [],
    EXTRAORDINARY_EXPENSE: []
  };

  accounts?.forEach(account => {
    const accountType = account.core_dynamic_data.find(
      (d: any) => d.field_name === 'account_type'
    )?.field_value;
    
    if (accountType && structure[accountType as keyof typeof structure]) {
      structure[accountType as keyof typeof structure].push({
        code: account.entity_code,
        name: account.entity_name,
        id: account.id
      });
    }
  });

  return NextResponse.json({
    data: {
      structure,
      totalAccounts: accounts?.length || 0,
      categories: Object.keys(structure).length
    },
    success: true
  });
}

async function getMappingPatterns(supabase: any, organizationId: string) {
  // Get learned mapping patterns
  const { data: patterns } = await supabase
    .from('core_entities')
    .select(`
      entity_name,
      core_dynamic_data(field_name, field_value)
    `)
    .eq('organization_id', organizationId)
    .eq('entity_type', 'ai_mapping_pattern')
    .eq('is_active', true);

  return NextResponse.json({
    data: {
      patterns: patterns || [],
      totalPatterns: patterns?.length || 0
    },
    success: true
  });
}

async function getAISuggestions(supabase: any, organizationId: string) {
  // Get AI-powered account suggestions
  const suggestions = [
    {
      type: 'VENDOR_MAPPING',
      title: 'Map Fresh Valley Farms to Cost of Sales',
      description: 'Vendor consistently provides raw materials for food preparation',
      confidence: 94,
      suggestedAccount: '5001000',
      accountName: 'Food Materials - Vegetables'
    },
    {
      type: 'EXPENSE_CATEGORIZATION',
      title: 'Separate Delivery vs Marketing Expenses',
      description: 'UberEats fees should be Direct Expense, not Marketing',
      confidence: 88,
      suggestedAccount: '6007000',
      accountName: 'Delivery Platform Fees'
    },
    {
      type: 'TAX_OPTIMIZATION',
      title: 'Create GST Input Credit Account',
      description: 'Separate GST input credits for better tax reporting',
      confidence: 92,
      suggestedAccount: '1000010',
      accountName: 'GST Input Tax Credit'
    }
  ];

  return NextResponse.json({
    data: {
      suggestions,
      totalSuggestions: suggestions.length
    },
    success: true
  });
}

async function getOrganizationAccounts(supabase: any, organizationId: string) {
  const { data: accounts } = await supabase
    .from('core_entities')
    .select(`
      id,
      entity_code,
      entity_name,
      core_dynamic_data(field_name, field_value)
    `)
    .eq('organization_id', organizationId)
    .eq('entity_type', 'chart_of_account')
    .eq('is_active', true);

  return accounts?.map((account: any) => {
    const dynamicData = account.core_dynamic_data.reduce((acc: any, item: any) => {
      acc[item.field_name] = item.field_value;
      return acc;
    }, {});

    return {
      id: account.id,
      code: account.entity_code,
      name: account.entity_name,
      type: dynamicData.account_type || 'EXPENSE',
      postingAllowed: dynamicData.posting_allowed === 'true',
      balance: parseFloat(dynamicData.current_balance || '0')
    };
  }) || [];
}

async function performIntelligentMapping(
  aiResults: any,
  documentType: string,
  accounts: any[],
  baseConfidence: number
) {
  const reasoning: string[] = [];
  const businessRules: string[] = [];

  // Restaurant industry business rules
  const restaurantRules = {
    vendors: {
      'fresh valley farms': { type: 'COST_OF_SALES', subtype: 'vegetables', confidence: 0.95 },
      'premium meats': { type: 'COST_OF_SALES', subtype: 'meat', confidence: 0.95 },
      'dairy fresh': { type: 'COST_OF_SALES', subtype: 'dairy', confidence: 0.95 },
      'electricity board': { type: 'DIRECT_EXPENSE', subtype: 'utilities', confidence: 0.90 },
      'gas supplier': { type: 'DIRECT_EXPENSE', subtype: 'utilities', confidence: 0.90 },
      'zomato': { type: 'DIRECT_EXPENSE', subtype: 'platform_fees', confidence: 0.85 },
      'swiggy': { type: 'DIRECT_EXPENSE', subtype: 'platform_fees', confidence: 0.85 },
      'google ads': { type: 'INDIRECT_EXPENSE', subtype: 'marketing', confidence: 0.90 },
      'insurance company': { type: 'INDIRECT_EXPENSE', subtype: 'insurance', confidence: 0.90 }
    },
    keywords: {
      'vegetables': { type: 'COST_OF_SALES', account: '5001000', confidence: 0.90 },
      'spices': { type: 'COST_OF_SALES', account: '5002000', confidence: 0.90 },
      'meat': { type: 'COST_OF_SALES', account: '5005000', confidence: 0.90 },
      'dairy': { type: 'COST_OF_SALES', account: '5006000', confidence: 0.90 },
      'rent': { type: 'DIRECT_EXPENSE', account: '6003000', confidence: 0.95 },
      'salary': { type: 'DIRECT_EXPENSE', account: '6001000', confidence: 0.95 },
      'wages': { type: 'DIRECT_EXPENSE', account: '6002000', confidence: 0.95 },
      'electricity': { type: 'DIRECT_EXPENSE', account: '6004000', confidence: 0.90 },
      'gas': { type: 'DIRECT_EXPENSE', account: '6005000', confidence: 0.90 },
      'marketing': { type: 'INDIRECT_EXPENSE', account: '7001000', confidence: 0.85 },
      'advertising': { type: 'INDIRECT_EXPENSE', account: '7001000', confidence: 0.85 },
      'insurance': { type: 'INDIRECT_EXPENSE', account: '7002000', confidence: 0.85 },
      'tax': { type: 'TAX_EXPENSE', account: '8001000', confidence: 0.95 },
      'legal': { type: 'EXTRAORDINARY_EXPENSE', account: '9001000', confidence: 0.80 }
    }
  };

  let mappedAccount: any = null;
  let confidence = baseConfidence;

  // Step 1: Vendor-based mapping
  if (aiResults.vendor) {
    const vendorKey = aiResults.vendor.toLowerCase();
    const vendorRule = restaurantRules.vendors[vendorKey];
    
    if (vendorRule) {
      const accountsOfType = accounts.filter(a => a.type === vendorRule.type);
      if (accountsOfType.length > 0) {
        mappedAccount = accountsOfType[0];
        confidence = vendorRule.confidence;
        reasoning.push(`Vendor "${aiResults.vendor}" is known ${vendorRule.type} supplier`);
        businessRules.push(`Restaurant Rule: ${vendorRule.type} vendors map to range ${getAccountRange(vendorRule.type)}`);
      }
    }
  }

  // Step 2: Keyword-based mapping if vendor mapping didn't work
  if (!mappedAccount && aiResults.description) {
    const description = aiResults.description.toLowerCase();
    
    for (const [keyword, rule] of Object.entries(restaurantRules.keywords)) {
      if (description.includes(keyword)) {
        const account = accounts.find(a => a.code === rule.account);
        if (account) {
          mappedAccount = account;
          confidence = rule.confidence;
          reasoning.push(`Description contains "${keyword}" indicating ${rule.type}`);
          businessRules.push(`Keyword Rule: "${keyword}" maps to ${rule.type}`);
          break;
        }
      }
    }
  }

  // Step 3: Category-based fallback
  if (!mappedAccount && aiResults.category) {
    const category = aiResults.category.toLowerCase();
    
    if (category.includes('food') || category.includes('ingredient')) {
      const costOfSalesAccounts = accounts.filter(a => a.type === 'COST_OF_SALES');
      if (costOfSalesAccounts.length > 0) {
        mappedAccount = costOfSalesAccounts[0];
        confidence = 0.75;
        reasoning.push(`Category "${aiResults.category}" indicates food-related expense`);
        businessRules.push('Food categories default to Cost of Sales');
      }
    }
  }

  // Step 4: Default mapping
  if (!mappedAccount) {
    const directExpenseAccounts = accounts.filter(a => a.type === 'DIRECT_EXPENSE');
    if (directExpenseAccounts.length > 0) {
      mappedAccount = directExpenseAccounts[0];
      confidence = 0.60;
      reasoning.push('No specific rule matched, using default Direct Expense account');
      businessRules.push('Fallback Rule: Unknown expenses default to Direct Expense');
    }
  }

  // Generate alternatives
  const alternativeAccounts = accounts
    .filter(a => a.id !== mappedAccount?.id && a.postingAllowed)
    .slice(0, 3)
    .map(account => ({
      code: account.code,
      name: account.name,
      confidence: confidence - 0.1,
      reason: `Alternative ${account.type} account`
    }));

  return {
    primaryAccount: {
      code: mappedAccount?.code || '6000000',
      name: mappedAccount?.name || 'General Expense',
      type: mappedAccount?.type || 'DIRECT_EXPENSE',
      category: getAccountCategory(mappedAccount?.type || 'DIRECT_EXPENSE'),
      confidence: confidence
    },
    alternativeAccounts,
    reasoning,
    businessRules
  };
}

async function generateEnhancedJournalEntries(
  aiResults: any,
  primaryAccount: any,
  organizationId: string
) {
  const entries = [];
  const amount = aiResults.amount || 0;

  // Debit entry (Expense/Asset)
  entries.push({
    accountCode: primaryAccount.code,
    accountName: primaryAccount.name,
    debit: amount,
    description: aiResults.description || 'AI Generated Entry'
  });

  // Credit entry (typically Accounts Payable for invoices/receipts)
  entries.push({
    accountCode: '2000001', // Accounts Payable
    accountName: 'Accounts Payable - Trade',
    credit: amount,
    description: `Payment due: ${aiResults.vendor || 'Vendor'}`
  });

  return entries;
}

async function recordMappingPattern(supabase: any, organizationId: string, pattern: any) {
  const patternId = crypto.randomUUID();
  
  // Create mapping pattern entity
  const { data: entity } = await supabase
    .from('core_entities')
    .insert({
      id: patternId,
      organization_id: organizationId,
      entity_type: 'ai_mapping_pattern',
      entity_name: `Mapping: ${pattern.vendor} -> ${pattern.mappedAccount.name}`,
      entity_code: `MAP-${Date.now()}`,
      is_active: true
    })
    .select()
    .single();

  // Add pattern details
  if (entity) {
    await supabase
      .from('core_dynamic_data')
      .insert([
        { entity_id: patternId, field_name: 'vendor', field_value: pattern.vendor || '', field_type: 'text' },
        { entity_id: patternId, field_name: 'category', field_value: pattern.category || '', field_type: 'text' },
        { entity_id: patternId, field_name: 'mapped_account_code', field_value: pattern.mappedAccount.code, field_type: 'text' },
        { entity_id: patternId, field_name: 'confidence', field_value: pattern.confidence.toString(), field_type: 'decimal' },
        { entity_id: patternId, field_name: 'document_type', field_value: pattern.documentType, field_type: 'text' }
      ]);
  }

  return patternId;
}

function getAccountRange(accountType: string): string {
  const ranges = {
    'ASSET': '1000000-1999999',
    'LIABILITY': '2000000-2999999',
    'EQUITY': '3000000-3999999',
    'REVENUE': '4000000-4999999',
    'COST_OF_SALES': '5000000-5999999',
    'DIRECT_EXPENSE': '6000000-6999999',
    'INDIRECT_EXPENSE': '7000000-7999999',
    'TAX_EXPENSE': '8000000-8999999',
    'EXTRAORDINARY_EXPENSE': '9000000-9999999'
  };
  return ranges[accountType as keyof typeof ranges] || '6000000-6999999';
}

function getAccountCategory(accountType: string): string {
  const categories = {
    'ASSET': 'Assets',
    'LIABILITY': 'Liabilities',
    'EQUITY': 'Equity',
    'REVENUE': 'Revenue',
    'COST_OF_SALES': 'Cost of Sales',
    'DIRECT_EXPENSE': 'Direct Expenses',
    'INDIRECT_EXPENSE': 'Indirect Expenses',
    'TAX_EXPENSE': 'Tax Expenses',
    'EXTRAORDINARY_EXPENSE': 'Extraordinary Expenses'
  };
  return categories[accountType as keyof typeof categories] || 'Direct Expenses';
}