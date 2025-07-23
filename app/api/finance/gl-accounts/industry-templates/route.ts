/**
 * HERA Universal - Industry-Specific Chart of Accounts Templates API
 * 
 * Phase 3: Pre-built industry templates with intelligent customization
 * Provides complete chart of accounts templates for different industries
 * Uses HERA's 5-table universal architecture with industry intelligence
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

interface IndustryTemplate {
  templateId: string;
  industryType: string;
  industryName: string;
  description: string;
  businessTypes: string[];
  accounts: TemplateAccount[];
  features: {
    totalAccounts: number;
    essentialAccounts: number;
    industrySpecific: number;
    complianceReady: boolean;
    taxReporting: boolean;
  };
  customizations: {
    businessSizeOptions: ('small' | 'medium' | 'large')[];
    regionalCompliance: string[];
    additionalModules: string[];
  };
}

interface TemplateAccount {
  accountCode: string;
  accountName: string;
  accountType: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'COST_OF_SALES' | 
                'DIRECT_EXPENSE' | 'INDIRECT_EXPENSE' | 'TAX_EXPENSE' | 'EXTRAORDINARY_EXPENSE';
  category: 'essential' | 'recommended' | 'optional' | 'industry_specific';
  description: string;
  businessJustification: string;
  expectedUsage: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
    direction: 'debit' | 'credit' | 'both';
    averageAmount: number;
  };
  complianceNotes?: string;
  parentAccount?: string;
  childAccounts?: string[];
}

interface TemplateDeployment {
  organizationId: string;
  templateId: string;
  deploymentOptions: {
    businessSize: 'small' | 'medium' | 'large';
    includeOptional: boolean;
    includeIndustrySpecific: boolean;
    customizations: Record<string, any>;
  };
  results: {
    accountsCreated: number;
    accountsSkipped: number;
    warnings: string[];
    recommendations: string[];
  };
}

// Industry template definitions
const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
  {
    templateId: 'restaurant_full_service',
    industryType: 'restaurant',
    industryName: 'Full-Service Restaurant',
    description: 'Comprehensive chart of accounts for sit-down restaurants with bar service',
    businessTypes: ['full_service_restaurant', 'casual_dining', 'fine_dining', 'bar_restaurant'],
    features: {
      totalAccounts: 35,
      essentialAccounts: 20,
      industrySpecific: 15,
      complianceReady: true,
      taxReporting: true
    },
    customizations: {
      businessSizeOptions: ['small', 'medium', 'large'],
      regionalCompliance: ['US_GAAP', 'IFRS'],
      additionalModules: ['liquor_license', 'catering', 'delivery']
    },
    accounts: [
      // Assets (1000000-1999999)
      {
        accountCode: '1001000',
        accountName: 'Cash - Operating Account',
        accountType: 'ASSET',
        category: 'essential',
        description: 'Primary operating cash account for daily transactions',
        businessJustification: 'Essential for all business operations and cash flow management',
        expectedUsage: { frequency: 'daily', direction: 'both', averageAmount: 2000 }
      },
      {
        accountCode: '1002000',
        accountName: 'Accounts Receivable - Credit Sales',
        accountType: 'ASSET',
        category: 'recommended',
        description: 'Outstanding amounts from credit card and corporate sales',
        businessJustification: 'Important for businesses with significant credit transactions',
        expectedUsage: { frequency: 'daily', direction: 'debit', averageAmount: 1500 }
      },
      {
        accountCode: '1003000',
        accountName: 'Food Inventory',
        accountType: 'ASSET',
        category: 'essential',
        description: 'Current food inventory on hand',
        businessJustification: 'Critical for food cost management and COGS calculation',
        expectedUsage: { frequency: 'weekly', direction: 'debit', averageAmount: 5000 }
      },
      {
        accountCode: '1004000',
        accountName: 'Beverage Inventory',
        accountType: 'ASSET',
        category: 'recommended',
        description: 'Alcoholic and non-alcoholic beverage inventory',
        businessJustification: 'Important for establishments serving beverages',
        expectedUsage: { frequency: 'weekly', direction: 'debit', averageAmount: 2000 }
      },
      {
        accountCode: '1005000',
        accountName: 'Kitchen Equipment',
        accountType: 'ASSET',
        category: 'essential',
        description: 'Cooking equipment, appliances, and kitchen tools',
        businessJustification: 'Major capital assets requiring depreciation tracking',
        expectedUsage: { frequency: 'monthly', direction: 'debit', averageAmount: 15000 }
      },
      {
        accountCode: '1006000',
        accountName: 'Furniture & Fixtures',
        accountType: 'ASSET',
        category: 'essential',
        description: 'Dining room furniture, fixtures, and decorative items',
        businessJustification: 'Depreciable assets affecting customer experience',
        expectedUsage: { frequency: 'monthly', direction: 'debit', averageAmount: 8000 }
      },
      
      // Liabilities (2000000-2999999)
      {
        accountCode: '2001000',
        accountName: 'Accounts Payable - Food Suppliers',
        accountType: 'LIABILITY',
        category: 'essential',
        description: 'Outstanding invoices from food suppliers',
        businessJustification: 'Essential for managing food supplier relationships',
        expectedUsage: { frequency: 'daily', direction: 'credit', averageAmount: 3000 }
      },
      {
        accountCode: '2002000',
        accountName: 'Accrued Payroll',
        accountType: 'LIABILITY',
        category: 'essential',
        description: 'Unpaid wages and benefits',
        businessJustification: 'Required for accurate labor cost accounting',
        expectedUsage: { frequency: 'weekly', direction: 'credit', averageAmount: 5000 }
      },
      {
        accountCode: '2003000',
        accountName: 'Sales Tax Payable',
        accountType: 'LIABILITY',
        category: 'essential',
        description: 'Sales tax collected but not yet remitted',
        businessJustification: 'Legal requirement for tax compliance',
        expectedUsage: { frequency: 'daily', direction: 'credit', averageAmount: 800 },
        complianceNotes: 'Must be remitted according to state/local requirements'
      },
      
      // Equity (3000000-3999999)
      {
        accountCode: '3001000',
        accountName: 'Owner\'s Equity',
        accountType: 'EQUITY',
        category: 'essential',
        description: 'Owner\'s investment and retained earnings',
        businessJustification: 'Required for balance sheet and ownership tracking',
        expectedUsage: { frequency: 'monthly', direction: 'credit', averageAmount: 50000 }
      },
      
      // Revenue (4000000-4999999)
      {
        accountCode: '4001000',
        accountName: 'Food Sales Revenue',
        accountType: 'REVENUE',
        category: 'essential',
        description: 'Revenue from food sales',
        businessJustification: 'Primary revenue source requiring detailed tracking',
        expectedUsage: { frequency: 'daily', direction: 'credit', averageAmount: 1800 }
      },
      {
        accountCode: '4002000',
        accountName: 'Beverage Sales Revenue',
        accountType: 'REVENUE',
        category: 'recommended',
        description: 'Revenue from alcoholic and non-alcoholic beverages',
        businessJustification: 'Higher margin category deserving separate tracking',
        expectedUsage: { frequency: 'daily', direction: 'credit', averageAmount: 600 }
      },
      {
        accountCode: '4003000',
        accountName: 'Catering Revenue',
        accountType: 'REVENUE',
        category: 'optional',
        description: 'Revenue from catering services',
        businessJustification: 'Important for businesses offering catering',
        expectedUsage: { frequency: 'weekly', direction: 'credit', averageAmount: 2500 }
      },
      {
        accountCode: '4004000',
        accountName: 'Delivery Service Revenue',
        accountType: 'REVENUE',
        category: 'industry_specific',
        description: 'Revenue from delivery services',
        businessJustification: 'Critical for delivery-focused operations',
        expectedUsage: { frequency: 'daily', direction: 'credit', averageAmount: 400 }
      },
      
      // Cost of Sales (5000000-5999999)
      {
        accountCode: '5001000',
        accountName: 'Food Cost',
        accountType: 'COST_OF_SALES',
        category: 'essential',
        description: 'Direct cost of food sold',
        businessJustification: 'Essential for gross margin calculation',
        expectedUsage: { frequency: 'daily', direction: 'debit', averageAmount: 600 }
      },
      {
        accountCode: '5002000',
        accountName: 'Beverage Cost',
        accountType: 'COST_OF_SALES',
        category: 'recommended',
        description: 'Direct cost of beverages sold',
        businessJustification: 'Important for beverage margin analysis',
        expectedUsage: { frequency: 'daily', direction: 'debit', averageAmount: 180 }
      },
      
      // Direct Expenses (6000000-6999999)
      {
        accountCode: '6001000',
        accountName: 'Kitchen Staff Wages',
        accountType: 'DIRECT_EXPENSE',
        category: 'essential',
        description: 'Wages for kitchen and food preparation staff',
        businessJustification: 'Direct labor costs for food production',
        expectedUsage: { frequency: 'weekly', direction: 'debit', averageAmount: 3500 }
      },
      {
        accountCode: '6002000',
        accountName: 'Server Wages & Tips',
        accountType: 'DIRECT_EXPENSE',
        category: 'essential',
        description: 'Wages and tip distributions for service staff',
        businessJustification: 'Direct service labor costs',
        expectedUsage: { frequency: 'weekly', direction: 'debit', averageAmount: 2800 }
      },
      {
        accountCode: '6003000',
        accountName: 'Utilities - Kitchen',
        accountType: 'DIRECT_EXPENSE',
        category: 'recommended',
        description: 'Gas, electric, and water for kitchen operations',
        businessJustification: 'Direct operational costs for food production',
        expectedUsage: { frequency: 'monthly', direction: 'debit', averageAmount: 1200 }
      },
      {
        accountCode: '6004000',
        accountName: 'Rent - Restaurant Space',
        accountType: 'DIRECT_EXPENSE',
        category: 'essential',
        description: 'Monthly rent for restaurant location',
        businessJustification: 'Primary facility cost for operations',
        expectedUsage: { frequency: 'monthly', direction: 'debit', averageAmount: 8000 }
      },
      
      // Indirect Expenses (7000000-7999999)
      {
        accountCode: '7001000',
        accountName: 'Marketing & Advertising',
        accountType: 'INDIRECT_EXPENSE',
        category: 'recommended',
        description: 'Marketing campaigns and advertising expenses',
        businessJustification: 'Customer acquisition and retention costs',
        expectedUsage: { frequency: 'monthly', direction: 'debit', averageAmount: 1500 }
      },
      {
        accountCode: '7002000',
        accountName: 'Insurance',
        accountType: 'INDIRECT_EXPENSE',
        category: 'essential',
        description: 'Business insurance premiums',
        businessJustification: 'Required business protection and compliance',
        expectedUsage: { frequency: 'monthly', direction: 'debit', averageAmount: 800 }
      },
      {
        accountCode: '7003000',
        accountName: 'Professional Services',
        accountType: 'INDIRECT_EXPENSE',
        category: 'recommended',
        description: 'Accounting, legal, and consulting fees',
        businessJustification: 'Expert services for business management',
        expectedUsage: { frequency: 'monthly', direction: 'debit', averageAmount: 1200 }
      },
      {
        accountCode: '7004000',
        accountName: 'Office Supplies',
        accountType: 'INDIRECT_EXPENSE',
        category: 'optional',
        description: 'Administrative supplies and materials',
        businessJustification: 'General administrative expenses',
        expectedUsage: { frequency: 'monthly', direction: 'debit', averageAmount: 300 }
      },
      {
        accountCode: '7005000',
        accountName: 'Delivery Platform Fees',
        accountType: 'INDIRECT_EXPENSE',
        category: 'industry_specific',
        description: 'Fees paid to third-party delivery platforms',
        businessJustification: 'Modern restaurant delivery channel costs',
        expectedUsage: { frequency: 'daily', direction: 'debit', averageAmount: 150 }
      },
      
      // Tax Expenses (8000000-8999999)
      {
        accountCode: '8001000',
        accountName: 'Business License Fees',
        accountType: 'TAX_EXPENSE',
        category: 'essential',
        description: 'Business licenses and permits',
        businessJustification: 'Legal compliance requirements',
        expectedUsage: { frequency: 'annually', direction: 'debit', averageAmount: 2000 }
      },
      {
        accountCode: '8002000',
        accountName: 'Payroll Taxes',
        accountType: 'TAX_EXPENSE',
        category: 'essential',
        description: 'Employer portion of payroll taxes',
        businessJustification: 'Required employer tax obligations',
        expectedUsage: { frequency: 'weekly', direction: 'debit', averageAmount: 800 }
      }
    ]
  }
];

// GET /api/finance/gl-accounts/industry-templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const industryType = searchParams.get('industryType');
    const templateId = searchParams.get('templateId');
    const businessSize = searchParams.get('businessSize');
    const includeDetails = searchParams.get('includeDetails') === 'true';
    
    console.log('🏭 Fetching industry templates');

    let templates = INDUSTRY_TEMPLATES;

    // Filter by industry type
    if (industryType) {
      templates = templates.filter(t => t.industryType === industryType);
    }

    // Get specific template
    if (templateId) {
      templates = templates.filter(t => t.templateId === templateId);
    }

    // Customize for business size
    if (businessSize && includeDetails) {
      templates = templates.map(template => ({
        ...template,
        accounts: template.accounts.filter(account => {
          if (businessSize === 'small') {
            return ['essential', 'recommended'].includes(account.category);
          } else if (businessSize === 'medium') {
            return ['essential', 'recommended', 'industry_specific'].includes(account.category);
          } else {
            return true; // Include all for large businesses
          }
        })
      }));
    }

    // Remove account details if not requested
    if (!includeDetails) {
      templates = templates.map(template => ({
        ...template,
        accounts: [] // Remove account details for list view
      }));
    }

    console.log('✅ Industry templates retrieved successfully');

    return NextResponse.json({
      data: {
        templates,
        totalTemplates: templates.length,
        industries: [...new Set(templates.map(t => t.industryType))]
      },
      metadata: {
        industryType,
        templateId,
        businessSize,
        includeDetails,
        generatedAt: new Date().toISOString(),
        phaseLevel: 3,
        capabilities: [
          'Industry-specific templates',
          'Business size customization',
          'Compliance-ready accounts',
          'Usage guidance included',
          'Scalable implementations'
        ]
      },
      success: true
    });

  } catch (error) {
    console.error('❌ Industry templates error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/finance/gl-accounts/industry-templates
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { organizationId, templateId, deploymentOptions } = body;

    if (!organizationId || !templateId) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, templateId' },
        { status: 400 }
      );
    }

    console.log('🚀 Deploying industry template:', templateId, 'to organization:', organizationId);

    // Find the template
    const template = INDUSTRY_TEMPLATES.find(t => t.templateId === templateId);
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Get existing accounts to avoid duplicates
    const { data: existingAccounts } = await supabase
      .from('core_entities')
      .select('entity_code')
      .eq('organization_id', organizationId) // SACRED
      .eq('entity_type', 'chart_of_account');

    const existingCodes = new Set(existingAccounts?.map(acc => acc.entity_code) || []);

    const deployment: TemplateDeployment = {
      organizationId,
      templateId,
      deploymentOptions,
      results: {
        accountsCreated: 0,
        accountsSkipped: 0,
        warnings: [],
        recommendations: []
      }
    };

    // Filter accounts based on deployment options
    let accountsToCreate = template.accounts;

    if (deploymentOptions?.businessSize === 'small') {
      accountsToCreate = accountsToCreate.filter(acc => 
        ['essential', 'recommended'].includes(acc.category));
    } else if (deploymentOptions?.businessSize === 'medium') {
      accountsToCreate = accountsToCreate.filter(acc => 
        ['essential', 'recommended', 'industry_specific'].includes(acc.category));
    }

    if (!deploymentOptions?.includeOptional) {
      accountsToCreate = accountsToCreate.filter(acc => acc.category !== 'optional');
    }

    if (!deploymentOptions?.includeIndustrySpecific) {
      accountsToCreate = accountsToCreate.filter(acc => acc.category !== 'industry_specific');
    }

    // Create accounts
    for (const account of accountsToCreate) {
      if (existingCodes.has(account.accountCode)) {
        deployment.results.accountsSkipped++;
        deployment.results.warnings.push(`Account ${account.accountCode} already exists`);
        continue;
      }

      try {
        // CORE PATTERN: Create entity
        const entityId = crypto.randomUUID();
        
        const { error: entityError } = await supabase
          .from('core_entities')
          .insert({
            id: entityId,
            organization_id: organizationId, // SACRED
            entity_type: 'chart_of_account',
            entity_name: account.accountName,
            entity_code: account.accountCode,
            is_active: true
          });

        if (entityError) {
          deployment.results.warnings.push(`Failed to create ${account.accountCode}: ${entityError.message}`);
          continue;
        }

        // CORE PATTERN: Create dynamic data
        const dynamicFields = [
          {
            entity_id: entityId,
            field_name: 'account_type',
            field_value: account.accountType,
            field_type: 'text'
          },
          {
            entity_id: entityId,
            field_name: 'category',
            field_value: account.category,
            field_type: 'text'
          },
          {
            entity_id: entityId,
            field_name: 'description',
            field_value: account.description,
            field_type: 'text'
          },
          {
            entity_id: entityId,
            field_name: 'business_justification',
            field_value: account.businessJustification,
            field_type: 'text'
          },
          {
            entity_id: entityId,
            field_name: 'expected_frequency',
            field_value: account.expectedUsage.frequency,
            field_type: 'text'
          },
          {
            entity_id: entityId,
            field_name: 'expected_direction',
            field_value: account.expectedUsage.direction,
            field_type: 'text'
          },
          {
            entity_id: entityId,
            field_name: 'expected_amount',
            field_value: account.expectedUsage.averageAmount.toString(),
            field_type: 'number'
          },
          {
            entity_id: entityId,
            field_name: 'current_balance',
            field_value: '0',
            field_type: 'number'
          },
          {
            entity_id: entityId,
            field_name: 'usage_count',
            field_value: '0',
            field_type: 'number'
          },
          {
            entity_id: entityId,
            field_name: 'allow_posting',
            field_value: 'true',
            field_type: 'boolean'
          }
        ];

        if (account.complianceNotes) {
          dynamicFields.push({
            entity_id: entityId,
            field_name: 'compliance_notes',
            field_value: account.complianceNotes,
            field_type: 'text'
          });
        }

        const { error: dynamicError } = await supabase
          .from('core_dynamic_data')
          .insert(dynamicFields);

        if (dynamicError) {
          deployment.results.warnings.push(`Failed to add metadata for ${account.accountCode}: ${dynamicError.message}`);
        }

        deployment.results.accountsCreated++;

      } catch (error) {
        deployment.results.warnings.push(`Error creating ${account.accountCode}: ${error}`);
      }
    }

    // Add recommendations
    deployment.results.recommendations = [
      'Review account opening balances and adjust as needed',
      'Set up approval workflows for expense accounts',
      'Train staff on proper account usage',
      'Schedule regular account reconciliation',
      'Consider integrating with payroll and POS systems'
    ];

    if (deployment.results.accountsCreated > 0) {
      deployment.results.recommendations.push(
        `Successfully created ${deployment.results.accountsCreated} accounts from ${template.industryName} template`
      );
    }

    console.log('✅ Industry template deployed successfully');

    return NextResponse.json({
      success: true,
      data: deployment,
      message: `Industry template deployed: ${deployment.results.accountsCreated} accounts created, ${deployment.results.accountsSkipped} skipped`
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Template deployment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}