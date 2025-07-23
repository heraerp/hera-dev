/**
 * HERA Universal - AI-Powered GL Account Suggestions API
 * 
 * Phase 3: Context-aware account suggestions using business intelligence
 * Suggests account codes based on organization patterns, industry standards, and AI analysis
 * Uses HERA's 5-table universal architecture with advanced business context
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

interface AccountSuggestion {
  suggestedCode: string;
  suggestedName: string;
  accountType: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'COST_OF_SALES' | 
                'DIRECT_EXPENSE' | 'INDIRECT_EXPENSE' | 'TAX_EXPENSE' | 'EXTRAORDINARY_EXPENSE';
  confidence: number;
  reasoning: string;
  basedOn: 'organization_pattern' | 'industry_standard' | 'ai_analysis' | 'transaction_history';
  priority: 'essential' | 'recommended' | 'optional';
  businessJustification: string;
  implementationNotes: string[];
  relatedAccounts: string[];
  expectedUsage: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    averageAmount: number;
    direction: 'debit' | 'credit' | 'both';
  };
}

interface ContextualRecommendation {
  context: string;
  description: string;
  missingAccounts: AccountSuggestion[];
  optimizationOpportunities: {
    action: string;
    impact: string;
    effort: 'low' | 'medium' | 'high';
    timeframe: 'immediate' | 'short_term' | 'long_term';
  }[];
  businessImpact: string;
}

// GET /api/finance/gl-accounts/ai-suggestions
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const suggestionType = searchParams.get('suggestionType') || 'comprehensive'; // missing, optimization, industry, comprehensive
    const businessContext = searchParams.get('businessContext'); // e.g., "expanding catering services"
    const accountType = searchParams.get('accountType'); // Filter by specific account type
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    console.log('🤖 Generating AI-powered account suggestions:', organizationId);

    // CORE PATTERN: Get organization profile
    const { data: organization } = await supabase
      .from('core_organizations')
      .select('*')
      .eq('id', organizationId)
      .single();

    // CORE PATTERN: Get existing accounts
    const { data: existingAccounts } = await supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId) // SACRED
      .eq('entity_type', 'chart_of_account')
      .eq('is_active', true);

    const existingCodes = new Set(existingAccounts?.map(acc => acc.entity_code) || []);

    // CORE PATTERN: Get recent transactions for pattern analysis
    const { data: transactions } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', organizationId) // SACRED
      .gte('transaction_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('transaction_date', { ascending: false })
      .limit(100);

    const analysis = {
      suggestions: [] as AccountSuggestion[],
      contextualRecommendations: [] as ContextualRecommendation[],
      summary: {
        totalSuggestions: 0,
        essentialAccounts: 0,
        recommendedAccounts: 0,
        businessImpact: 'medium'
      }
    };

    // Industry-specific account templates for restaurants
    const restaurantAccountTemplates = [
      {
        code: '1005000',
        name: 'Kitchen Equipment',
        type: 'ASSET',
        priority: 'essential',
        context: 'Essential for tracking capital assets',
        usage: { frequency: 'monthly', averageAmount: 5000, direction: 'debit' }
      },
      {
        code: '1006000',
        name: 'Furniture & Fixtures',
        type: 'ASSET',
        priority: 'recommended',
        context: 'Important for asset management and depreciation',
        usage: { frequency: 'monthly', averageAmount: 2000, direction: 'debit' }
      },
      {
        code: '2003000',
        name: 'Sales Tax Payable',
        type: 'LIABILITY',
        priority: 'essential',
        context: 'Required for tax compliance',
        usage: { frequency: 'monthly', averageAmount: 500, direction: 'credit' }
      },
      {
        code: '4002000',
        name: 'Beverage Sales Revenue',
        type: 'REVENUE',
        priority: 'recommended',
        context: 'Separate tracking for beverage sales improves analysis',
        usage: { frequency: 'daily', averageAmount: 300, direction: 'credit' }
      },
      {
        code: '4003000',
        name: 'Catering Revenue',
        type: 'REVENUE',
        priority: 'optional',
        context: 'Important if offering catering services',
        usage: { frequency: 'weekly', averageAmount: 1200, direction: 'credit' }
      },
      {
        code: '4004000',
        name: 'Delivery Service Revenue',
        type: 'REVENUE',
        priority: 'recommended',
        context: 'Essential for delivery-based revenue tracking',
        usage: { frequency: 'daily', averageAmount: 150, direction: 'credit' }
      },
      {
        code: '5002000',
        name: 'Beverage Cost',
        type: 'COST_OF_SALES',
        priority: 'recommended',
        context: 'Separate beverage costs for better margin analysis',
        usage: { frequency: 'weekly', averageAmount: 200, direction: 'debit' }
      },
      {
        code: '6001000',
        name: 'Kitchen Staff Wages',
        type: 'DIRECT_EXPENSE',
        priority: 'essential',
        context: 'Direct labor costs for kitchen operations',
        usage: { frequency: 'weekly', averageAmount: 2500, direction: 'debit' }
      },
      {
        code: '6002000',
        name: 'Server Wages & Tips',
        type: 'DIRECT_EXPENSE',
        priority: 'essential',
        context: 'Service staff labor costs',
        usage: { frequency: 'weekly', averageAmount: 1800, direction: 'debit' }
      },
      {
        code: '6003000',
        name: 'Utilities - Kitchen',
        type: 'DIRECT_EXPENSE',
        priority: 'recommended',
        context: 'Kitchen-specific utility tracking',
        usage: { frequency: 'monthly', averageAmount: 800, direction: 'debit' }
      },
      {
        code: '7001000',
        name: 'Marketing & Advertising',
        type: 'INDIRECT_EXPENSE',
        priority: 'recommended',
        context: 'Customer acquisition and retention costs',
        usage: { frequency: 'monthly', averageAmount: 1000, direction: 'debit' }
      },
      {
        code: '7002000',
        name: 'Insurance',
        type: 'INDIRECT_EXPENSE',
        priority: 'essential',
        context: 'Business insurance requirements',
        usage: { frequency: 'monthly', averageAmount: 400, direction: 'debit' }
      },
      {
        code: '7005000',
        name: 'Delivery Platform Fees',
        type: 'INDIRECT_EXPENSE',
        priority: 'recommended',
        context: 'Third-party delivery service costs',
        usage: { frequency: 'daily', averageAmount: 45, direction: 'debit' }
      }
    ];

    // 1. IDENTIFY MISSING ESSENTIAL ACCOUNTS
    if (suggestionType === 'missing' || suggestionType === 'comprehensive') {
      
      for (const template of restaurantAccountTemplates) {
        if (!existingCodes.has(template.code) && 
            (!accountType || template.type === accountType)) {
          
          let confidence = 0.8;
          let basedOn: AccountSuggestion['basedOn'] = 'industry_standard';
          
          // Boost confidence based on business context
          if (businessContext?.toLowerCase().includes('catering') && template.code === '4003000') {
            confidence = 0.95;
            basedOn = 'ai_analysis';
          }
          
          if (businessContext?.toLowerCase().includes('delivery') && template.code === '4004000') {
            confidence = 0.95;
            basedOn = 'ai_analysis';
          }

          // Check if similar patterns exist in transactions
          const hasRelatedTransactions = transactions?.some(tx => {
            const description = tx.transaction_data?.description?.toLowerCase() || '';
            return template.name.toLowerCase().split(' ').some(word => 
              description.includes(word) && word.length > 3
            );
          });

          if (hasRelatedTransactions) {
            confidence += 0.1;
            basedOn = 'transaction_history';
          }

          analysis.suggestions.push({
            suggestedCode: template.code,
            suggestedName: template.name,
            accountType: template.type as AccountSuggestion['accountType'],
            confidence,
            reasoning: `Industry standard account for ${organization?.industry || 'restaurant'} businesses`,
            basedOn,
            priority: template.priority as AccountSuggestion['priority'],
            businessJustification: template.context,
            implementationNotes: [
              'Set up appropriate opening balance if applicable',
              'Configure any necessary approval workflows',
              'Train staff on proper account usage'
            ],
            relatedAccounts: getRelatedAccounts(template.code, restaurantAccountTemplates),
            expectedUsage: template.usage as AccountSuggestion['expectedUsage']
          });
        }
      }
    }

    // 2. ANALYZE ORGANIZATION-SPECIFIC PATTERNS
    if (suggestionType === 'optimization' || suggestionType === 'comprehensive') {
      
      // Analyze transaction patterns for custom account suggestions
      const accountActivity = new Map<string, number>();
      const descriptionPatterns = new Map<string, number>();
      
      for (const tx of transactions || []) {
        const entries = tx.transaction_data?.entries || [];
        const description = tx.transaction_data?.description?.toLowerCase() || '';
        
        // Count account usage
        for (const entry of entries) {
          accountActivity.set(entry.account_code, (accountActivity.get(entry.account_code) || 0) + 1);
        }
        
        // Analyze description patterns
        const words = description.split(' ').filter(word => word.length > 3);
        for (const word of words) {
          descriptionPatterns.set(word, (descriptionPatterns.get(word) || 0) + 1);
        }
      }

      // Suggest sub-accounts for highly used accounts
      const highVolumeAccounts = Array.from(accountActivity.entries())
        .filter(([, count]) => count > 10)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);

      for (const [accountCode, usage] of highVolumeAccounts) {
        const existingAccount = existingAccounts?.find(acc => acc.entity_code === accountCode);
        if (existingAccount) {
          
          // Suggest sub-account based on usage patterns
          const baseCode = parseInt(accountCode);
          const subAccountCode = (baseCode + 100).toString();
          
          if (!existingCodes.has(subAccountCode)) {
            analysis.suggestions.push({
              suggestedCode: subAccountCode,
              suggestedName: `${existingAccount.entity_name} - Detailed`,
              accountType: getAccountTypeFromCode(subAccountCode),
              confidence: 0.75,
              reasoning: `High transaction volume (${usage} transactions) suggests need for detailed tracking`,
              basedOn: 'organization_pattern',
              priority: 'recommended',
              businessJustification: 'Better expense categorization and reporting granularity',
              implementationNotes: [
                'Transfer some transactions from parent account',
                'Set up rules for when to use detailed account',
                'Update chart of accounts documentation'
              ],
              relatedAccounts: [accountCode],
              expectedUsage: {
                frequency: usage > 30 ? 'daily' : usage > 10 ? 'weekly' : 'monthly',
                averageAmount: 500, // Estimated
                direction: accountCode.startsWith('1') || accountCode.startsWith('5') || accountCode.startsWith('6') ? 'debit' : 'credit'
              }
            });
          }
        }
      }

      // Suggest accounts based on description patterns
      const commonPatterns = Array.from(descriptionPatterns.entries())
        .filter(([word, count]) => count > 3 && !['payment', 'invoice', 'transaction'].includes(word))
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);

      for (const [pattern, frequency] of commonPatterns) {
        if (pattern.includes('tip') && !existingCodes.has('6002100')) {
          analysis.suggestions.push({
            suggestedCode: '6002100',
            suggestedName: 'Tips Payable',
            accountType: 'LIABILITY',
            confidence: 0.85,
            reasoning: `Frequent tip-related transactions (${frequency} occurrences) suggest need for tip tracking`,
            basedOn: 'transaction_history',
            priority: 'recommended',
            businessJustification: 'Proper tip accounting for compliance and staff management',
            implementationNotes: [
              'Track tips received and distributed',
              'Ensure compliance with tip reporting requirements',
              'Integrate with payroll processing'
            ],
            relatedAccounts: ['6002000'],
            expectedUsage: {
              frequency: 'daily',
              averageAmount: 150,
              direction: 'credit'
            }
          });
        }
      }
    }

    // 3. CONTEXTUAL RECOMMENDATIONS
    if (suggestionType === 'comprehensive') {
      
      // Revenue diversification recommendation
      const revenueAccounts = existingAccounts?.filter(acc => acc.entity_code.startsWith('4')) || [];
      
      if (revenueAccounts.length === 1) {
        analysis.contextualRecommendations.push({
          context: 'Revenue Diversification',
          description: 'Single revenue account limits business insights and growth tracking',
          missingAccounts: analysis.suggestions.filter(s => s.accountType === 'REVENUE'),
          optimizationOpportunities: [
            {
              action: 'Create separate revenue accounts by service type',
              impact: 'Better revenue analysis and pricing decisions',
              effort: 'low',
              timeframe: 'immediate'
            },
            {
              action: 'Track customer segments separately',
              impact: 'Identify most profitable customer types',
              effort: 'medium',
              timeframe: 'short_term'
            }
          ],
          businessImpact: 'Improved revenue insights can increase profitability by 5-15%'
        });
      }

      // Cost management recommendation
      const expenseAccounts = existingAccounts?.filter(acc => 
        acc.entity_code.startsWith('5') || acc.entity_code.startsWith('6')) || [];
      
      if (expenseAccounts.length < 5) {
        analysis.contextualRecommendations.push({
          context: 'Cost Management Enhancement',
          description: 'Limited expense categorization reduces cost control capabilities',
          missingAccounts: analysis.suggestions.filter(s => 
            s.accountType === 'COST_OF_SALES' || s.accountType === 'DIRECT_EXPENSE'),
          optimizationOpportunities: [
            {
              action: 'Implement detailed expense tracking',
              impact: 'Identify cost reduction opportunities',
              effort: 'medium',
              timeframe: 'short_term'
            },
            {
              action: 'Set up expense budgets and alerts',
              impact: 'Prevent cost overruns and improve margins',
              effort: 'high',
              timeframe: 'long_term'
            }
          ],
          businessImpact: 'Better cost management can improve margins by 3-8%'
        });
      }
    }

    // Calculate summary
    analysis.summary = {
      totalSuggestions: analysis.suggestions.length,
      essentialAccounts: analysis.suggestions.filter(s => s.priority === 'essential').length,
      recommendedAccounts: analysis.suggestions.filter(s => s.priority === 'recommended').length,
      businessImpact: analysis.suggestions.length > 10 ? 'high' : analysis.suggestions.length > 5 ? 'medium' : 'low'
    };

    console.log('✅ AI-powered account suggestions generated successfully');

    return NextResponse.json({
      data: {
        suggestions: analysis.suggestions,
        contextualRecommendations: analysis.contextualRecommendations,
        summary: analysis.summary
      },
      metadata: {
        organizationId,
        suggestionType,
        businessContext,
        accountType,
        existingAccountsCount: existingAccounts?.length || 0,
        generatedAt: new Date().toISOString(),
        phaseLevel: 3,
        capabilities: [
          'Industry-standard account suggestions',
          'Organization pattern analysis',
          'Transaction history insights',
          'Business context awareness',
          'Priority-based recommendations',
          'Implementation guidance'
        ]
      },
      success: true
    });

  } catch (error) {
    console.error('❌ AI suggestions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
function getRelatedAccounts(accountCode: string, templates: any[]): string[] {
  const accountType = accountCode.substring(0, 1);
  return templates
    .filter(t => t.code.substring(0, 1) === accountType && t.code !== accountCode)
    .map(t => t.code)
    .slice(0, 3);
}

function getAccountTypeFromCode(accountCode: string): AccountSuggestion['accountType'] {
  const firstDigit = accountCode.substring(0, 1);
  switch (firstDigit) {
    case '1': return 'ASSET';
    case '2': return 'LIABILITY';
    case '3': return 'EQUITY';
    case '4': return 'REVENUE';
    case '5': return 'COST_OF_SALES';
    case '6': return 'DIRECT_EXPENSE';
    case '7': return 'INDIRECT_EXPENSE';
    case '8': return 'TAX_EXPENSE';
    case '9': return 'EXTRAORDINARY_EXPENSE';
    default: return 'ASSET';
  }
}