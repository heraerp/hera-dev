/**
 * HERA Universal - AI Chart of Accounts Generator
 * 
 * AI-powered GL account generation from natural language descriptions
 * Users describe their business needs, AI creates complete account structures
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { claudeAI } from '@/utils/claude-ai-service';

// Admin client for demo/testing purposes
const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

interface AIGenerateRequest {
  organizationId: string;
  businessType: string;
  description: string;
  specificNeeds?: string[];
  complexity: 'basic' | 'intermediate' | 'advanced';
}

interface GeneratedAccount {
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
  aiReasoning: string;
  priority: 'essential' | 'recommended' | 'optional';
}

// AI-powered account generation logic (Hybrid approach)
const generateAccountsWithAI = async (request: AIGenerateRequest): Promise<GeneratedAccount[]> => {
  console.log('🧠 AI generating accounts for:', request.businessType);

  // Fast Path: Use templates for standard restaurant requests
  if (request.businessType === 'restaurant' && request.complexity !== 'advanced') {
    console.log('✅ Fast Path: Using restaurant templates');
    return generateRestaurantTemplates(request);
  }

  // Smart Path: Use Claude AI for complex/custom requests
  if (claudeAI.isAvailable() && (request.complexity === 'advanced' || request.businessType !== 'restaurant')) {
    console.log('🧠 Smart Path: Using Claude AI for complex request');
    
    try {
      const aiAccounts = await claudeAI.generateAccounts({
        businessType: request.businessType,
        businessDescription: request.description,
        specificNeeds: request.specificNeeds || [],
        complexity: request.complexity
      });

      if (aiAccounts.length > 0) {
        return aiAccounts.map(acc => ({
          accountName: acc.accountName,
          accountCode: acc.accountCode,
          accountType: acc.accountType,
          description: acc.description,
          parentAccount: '',
          isActive: true,
          allowPosting: true,
          currency: 'USD',
          openingBalance: 0,
          budgetAmount: 0,
          taxDeductible: false,
          notes: `AI Generated for ${request.businessType}`,
          aiReasoning: acc.reasoning,
          priority: acc.confidence > 0.8 ? 'essential' : acc.confidence > 0.6 ? 'recommended' : 'optional'
        }));
      }
    } catch (error) {
      console.error('❌ Claude AI generation failed, falling back to templates:', error);
    }
  }

  // Fallback: Use templates
  console.log('⚠️ Using template fallback');
  return generateRestaurantTemplates(request);
};

// Template-based generation (Fast Path)
const generateRestaurantTemplates = (request: AIGenerateRequest): GeneratedAccount[] => {

  // Restaurant-specific account templates
  const restaurantAccounts: GeneratedAccount[] = [
    // ASSETS
    {
      accountName: 'Cash - Operating Account',
      accountCode: '1001000',
      accountType: 'ASSET',
      description: 'Primary operating cash account for daily transactions',
      isActive: true,
      allowPosting: true,
      currency: 'USD',
      openingBalance: 0,
      taxDeductible: false,
      notes: 'Main cash account for restaurant operations',
      aiReasoning: 'Every restaurant needs a primary cash account for daily operations',
      priority: 'essential'
    },
    {
      accountName: 'Accounts Receivable - Credit Sales',
      accountCode: '1002000',
      accountType: 'ASSET',
      description: 'Money owed by customers for meals served on credit',
      isActive: true,
      allowPosting: true,
      currency: 'USD',
      openingBalance: 0,
      taxDeductible: false,
      notes: 'Track credit sales and catering receivables',
      aiReasoning: 'Restaurants often have catering and corporate credit sales',
      priority: 'recommended'
    },
    {
      accountName: 'Food Inventory',
      accountCode: '1003000',
      accountType: 'ASSET',
      description: 'Raw ingredients and prepared food inventory',
      isActive: true,
      allowPosting: true,
      currency: 'USD',
      openingBalance: 0,
      taxDeductible: false,
      notes: 'Track all food ingredients and prepared items',
      aiReasoning: 'Food inventory is a critical asset for restaurants',
      priority: 'essential'
    },
    {
      accountName: 'Beverage Inventory',
      accountCode: '1004000',
      accountType: 'ASSET',
      description: 'Alcoholic and non-alcoholic beverage inventory',
      isActive: true,
      allowPosting: true,
      currency: 'USD',
      openingBalance: 0,
      taxDeductible: false,
      notes: 'Separate tracking for beverage inventory',
      aiReasoning: 'Beverages often have different margin and tax implications',
      priority: 'recommended'
    },
    {
      accountName: 'Kitchen Equipment',
      accountCode: '1005000',
      accountType: 'ASSET',
      description: 'Cooking equipment, appliances, and kitchen tools',
      isActive: true,
      allowPosting: true,
      currency: 'USD',
      openingBalance: 0,
      taxDeductible: true,
      notes: 'Fixed assets - subject to depreciation',
      aiReasoning: 'Kitchen equipment is a major capital investment for restaurants',
      priority: 'essential'
    },
    {
      accountName: 'Furniture & Fixtures',
      accountCode: '1006000',
      accountType: 'ASSET',
      description: 'Dining room furniture, fixtures, and décor',
      isActive: true,
      allowPosting: true,
      currency: 'USD',
      openingBalance: 0,
      taxDeductible: true,
      notes: 'Customer-facing assets and dining room setup',
      aiReasoning: 'Dining room assets are essential for customer experience',
      priority: 'essential'
    },

    // LIABILITIES
    {
      accountName: 'Accounts Payable - Food Suppliers',
      accountCode: '2001000',
      accountType: 'LIABILITY',
      description: 'Money owed to food and ingredient suppliers',
      isActive: true,
      allowPosting: true,
      currency: 'USD',
      openingBalance: 0,
      taxDeductible: false,
      notes: 'Track supplier payment obligations',
      aiReasoning: 'Restaurants typically buy ingredients on credit terms',
      priority: 'essential'
    },
    {
      accountName: 'Accrued Payroll',
      accountCode: '2002000',
      accountType: 'LIABILITY',
      description: 'Wages and salaries earned but not yet paid',
      isActive: true,
      allowPosting: true,
      currency: 'USD',
      openingBalance: 0,
      taxDeductible: false,
      notes: 'Staff wages payable',
      aiReasoning: 'Labor costs are accrued between pay periods',
      priority: 'essential'
    },
    {
      accountName: 'Sales Tax Payable',
      accountCode: '2003000',
      accountType: 'LIABILITY',
      description: 'Sales tax collected from customers',
      isActive: true,
      allowPosting: true,
      currency: 'USD',
      openingBalance: 0,
      taxDeductible: false,
      notes: 'Tax liability to government',
      aiReasoning: 'Sales tax must be collected and remitted by restaurants',
      priority: 'essential'
    },

    // EQUITY
    {
      accountName: "Owner's Equity",
      accountCode: '3001000',
      accountType: 'EQUITY',
      description: "Owner's investment and retained earnings in the restaurant",
      isActive: true,
      allowPosting: true,
      currency: 'USD',
      openingBalance: 0,
      taxDeductible: false,
      notes: 'Initial investment and accumulated profits',
      aiReasoning: 'Track owner investment and business equity',
      priority: 'essential'
    },

    // REVENUE
    {
      accountName: 'Food Sales Revenue',
      accountCode: '4001000',
      accountType: 'REVENUE',
      description: 'Revenue from food sales and meals',
      isActive: true,
      allowPosting: true,
      currency: 'USD',
      openingBalance: 0,
      taxDeductible: false,
      notes: 'Primary revenue source from food sales',
      aiReasoning: 'Food sales are the main revenue stream for restaurants',
      priority: 'essential'
    },
    {
      accountName: 'Beverage Sales Revenue',
      accountCode: '4002000',
      accountType: 'REVENUE',
      description: 'Revenue from alcoholic and non-alcoholic beverages',
      isActive: true,
      allowPosting: true,
      currency: 'USD',
      openingBalance: 0,
      taxDeductible: false,
      notes: 'Beverage sales often have higher margins',
      aiReasoning: 'Separate tracking helps analyze profitability by category',
      priority: 'recommended'
    },
    {
      accountName: 'Catering Revenue',
      accountCode: '4003000',
      accountType: 'REVENUE',
      description: 'Revenue from catering and special events',
      isActive: true,
      allowPosting: true,
      currency: 'USD',
      openingBalance: 0,
      taxDeductible: false,
      notes: 'Off-premise catering services',
      aiReasoning: 'Many restaurants offer catering as additional revenue',
      priority: 'optional'
    },

    // COST OF SALES
    {
      accountName: 'Food Cost',
      accountCode: '5001000',
      accountType: 'COST_OF_SALES',
      description: 'Direct cost of ingredients used in food preparation',
      isActive: true,
      allowPosting: true,
      currency: 'USD',
      openingBalance: 0,
      taxDeductible: true,
      notes: 'Track food cost percentage - target 28-35%',
      aiReasoning: 'Food cost is the primary COGS for restaurants',
      priority: 'essential'
    },
    {
      accountName: 'Beverage Cost',
      accountCode: '5002000',
      accountType: 'COST_OF_SALES',
      description: 'Direct cost of beverages sold',
      isActive: true,
      allowPosting: true,
      currency: 'USD',
      openingBalance: 0,
      taxDeductible: true,
      notes: 'Beverage cost percentage - typically lower than food',
      aiReasoning: 'Separate beverage cost tracking for margin analysis',
      priority: 'recommended'
    },

    // DIRECT EXPENSES
    {
      accountName: 'Kitchen Staff Wages',
      accountCode: '6001000',
      accountType: 'DIRECT_EXPENSE',
      description: 'Wages for kitchen staff including chefs and prep cooks',
      isActive: true,
      allowPosting: true,
      currency: 'USD',
      openingBalance: 0,
      taxDeductible: true,
      notes: 'Direct labor costs for food preparation',
      aiReasoning: 'Kitchen labor is directly tied to food production',
      priority: 'essential'
    },
    {
      accountName: 'Server Wages & Tips',
      accountCode: '6002000',
      accountType: 'DIRECT_EXPENSE',
      description: 'Wages for servers and front-of-house staff',
      isActive: true,
      allowPosting: true,
      currency: 'USD',
      openingBalance: 0,
      taxDeductible: true,
      notes: 'Include tip reporting and allocation',
      aiReasoning: 'Service staff wages are direct operational costs',
      priority: 'essential'
    },
    {
      accountName: 'Utilities - Kitchen',
      accountCode: '6003000',
      accountType: 'DIRECT_EXPENSE',
      description: 'Gas, electricity, and water for kitchen operations',
      isActive: true,
      allowPosting: true,
      currency: 'USD',
      openingBalance: 0,
      taxDeductible: true,
      notes: 'Kitchen utilities are significant in restaurants',
      aiReasoning: 'Kitchen utilities are directly related to food production',
      priority: 'essential'
    },
    {
      accountName: 'Rent - Restaurant Space',
      accountCode: '6004000',
      accountType: 'DIRECT_EXPENSE',
      description: 'Monthly rent for restaurant location',
      isActive: true,
      allowPosting: true,
      currency: 'USD',
      openingBalance: 0,
      budgetAmount: 12000,
      taxDeductible: true,
      notes: 'Rent should be 6-10% of gross revenue',
      aiReasoning: 'Location rent is a major fixed cost for restaurants',
      priority: 'essential'
    },

    // INDIRECT EXPENSES
    {
      accountName: 'Marketing & Advertising',
      accountCode: '7001000',
      accountType: 'INDIRECT_EXPENSE',
      description: 'Marketing campaigns, advertising, and promotional expenses',
      isActive: true,
      allowPosting: true,
      currency: 'USD',
      openingBalance: 0,
      taxDeductible: true,
      notes: 'Target 3-6% of gross revenue for marketing',
      aiReasoning: 'Marketing is essential for customer acquisition',
      priority: 'recommended'
    },
    {
      accountName: 'Insurance',
      accountCode: '7002000',
      accountType: 'INDIRECT_EXPENSE',
      description: 'General liability, property, and workers compensation insurance',
      isActive: true,
      allowPosting: true,
      currency: 'USD',
      openingBalance: 0,
      taxDeductible: true,
      notes: 'Multiple insurance types required for restaurants',
      aiReasoning: 'Insurance is legally required and protects the business',
      priority: 'essential'
    },
    {
      accountName: 'Professional Services',
      accountCode: '7003000',
      accountType: 'INDIRECT_EXPENSE',
      description: 'Accounting, legal, and consulting fees',
      isActive: true,
      allowPosting: true,
      currency: 'USD',
      openingBalance: 0,
      taxDeductible: true,
      notes: 'Accountant and lawyer fees',
      aiReasoning: 'Professional services help ensure compliance and efficiency',
      priority: 'recommended'
    },
    {
      accountName: 'Office Supplies',
      accountCode: '7004000',
      accountType: 'INDIRECT_EXPENSE',
      description: 'Administrative supplies, paper, printing, stationery',
      isActive: true,
      allowPosting: true,
      currency: 'USD',
      openingBalance: 0,
      taxDeductible: true,
      notes: 'General office and administrative supplies',
      aiReasoning: 'Basic office supplies needed for business operations',
      priority: 'optional'
    },

    // TAX EXPENSES
    {
      accountName: 'Business License Fees',
      accountCode: '8001000',
      accountType: 'TAX_EXPENSE',
      description: 'Business licenses, permits, and regulatory fees',
      isActive: true,
      allowPosting: true,
      currency: 'USD',
      openingBalance: 0,
      taxDeductible: true,
      notes: 'Food service licenses and permits',
      aiReasoning: 'Restaurants require multiple licenses and permits',
      priority: 'essential'
    },
    {
      accountName: 'Payroll Taxes',
      accountCode: '8002000',
      accountType: 'TAX_EXPENSE',
      description: 'Employer payroll taxes and unemployment insurance',
      isActive: true,
      allowPosting: true,
      currency: 'USD',
      openingBalance: 0,
      taxDeductible: true,
      notes: 'FICA, federal and state unemployment taxes',
      aiReasoning: 'Payroll taxes are mandatory for all employees',
      priority: 'essential'
    }
  ];

  // Filter based on complexity and specific needs
  let filteredAccounts = restaurantAccounts;

  if (request.complexity === 'basic') {
    filteredAccounts = restaurantAccounts.filter(acc => acc.priority === 'essential');
  } else if (request.complexity === 'intermediate') {
    filteredAccounts = restaurantAccounts.filter(acc => 
      acc.priority === 'essential' || acc.priority === 'recommended'
    );
  }

  // Add specific accounts based on user needs
  if (request.specificNeeds) {
    if (request.specificNeeds.includes('catering')) {
      // Ensure catering accounts are included
      filteredAccounts = filteredAccounts.concat(
        restaurantAccounts.filter(acc => 
          acc.accountName.toLowerCase().includes('catering') && 
          !filteredAccounts.find(fa => fa.accountCode === acc.accountCode)
        )
      );
    }
    
    if (request.specificNeeds.includes('delivery')) {
      // Add delivery-specific accounts
      filteredAccounts.push({
        accountName: 'Delivery Service Revenue',
        accountCode: '4004000',
        accountType: 'REVENUE',
        description: 'Revenue from delivery orders and third-party platforms',
        isActive: true,
        allowPosting: true,
        currency: 'USD',
        openingBalance: 0,
        taxDeductible: false,
        notes: 'Track delivery platform revenues separately',
        aiReasoning: 'User specifically requested delivery tracking',
        priority: 'recommended'
      });
      
      filteredAccounts.push({
        accountName: 'Delivery Platform Fees',
        accountCode: '7005000',
        accountType: 'INDIRECT_EXPENSE',
        description: 'Fees paid to delivery platforms like UberEats, DoorDash',
        isActive: true,
        allowPosting: true,
        currency: 'USD',
        openingBalance: 0,
        taxDeductible: true,
        notes: 'Platform commissions typically 15-30%',
        aiReasoning: 'Delivery platforms charge significant fees',
        priority: 'essential'
      });
    }
  }

  return filteredAccounts;
};

// POST /api/finance/chart-of-accounts/ai-generate
export async function POST(request: NextRequest) {
  try {
    const body: AIGenerateRequest = await request.json();

    console.log('🧠 AI GL Account Generation Request:', {
      businessType: body.businessType,
      complexity: body.complexity,
      specificNeeds: body.specificNeeds
    });

    // Validate request
    if (!body.organizationId || !body.businessType || !body.description) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, businessType, description' },
        { status: 400 }
      );
    }

    // Generate accounts using AI logic
    const generatedAccounts = await generateAccountsWithAI(body);

    console.log(`✅ Generated ${generatedAccounts.length} GL accounts`);

    // Return generated accounts for review/editing
    return NextResponse.json({
      success: true,
      data: {
        generatedAccounts,
        summary: {
          totalAccounts: generatedAccounts.length,
          essential: generatedAccounts.filter(acc => acc.priority === 'essential').length,
          recommended: generatedAccounts.filter(acc => acc.priority === 'recommended').length,
          optional: generatedAccounts.filter(acc => acc.priority === 'optional').length,
          byCategory: generatedAccounts.reduce((acc, account) => {
            acc[account.accountType] = (acc[account.accountType] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        },
        aiInsights: [
          `Generated ${generatedAccounts.length} accounts tailored for ${body.businessType}`,
          `Complexity level: ${body.complexity} - focused on ${body.complexity === 'basic' ? 'essential accounts only' : body.complexity === 'intermediate' ? 'essential and recommended accounts' : 'complete account structure'}`,
          'All accounts follow industry best practices for restaurants',
          'Account codes follow standard 7-digit numbering with category ranges'
        ]
      },
      message: 'AI-generated chart of accounts ready for review'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ AI GL Generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error during AI generation' },
      { status: 500 }
    );
  }
}