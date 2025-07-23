/**
 * HERA Universal - Organization-Specific GL Intelligence API
 * 
 * Phase 3: Advanced organization-isolated GL intelligence
 * Learns from each organization's unique patterns and provides context-aware insights
 * Uses HERA's 5-table universal architecture with deep business context analysis
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

interface OrganizationProfile {
  organizationId: string;
  businessType: string;
  industry: string;
  size: 'small' | 'medium' | 'large';
  monthlyRevenue: number;
  transactionVolume: number;
  accountingMaturity: 'basic' | 'intermediate' | 'advanced';
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  uniquePatterns: {
    preferredAccounts: string[];
    transactionTiming: string[];
    averageAmounts: Record<string, number>;
    seasonality: Record<string, number>;
  };
}

interface BusinessContextInsight {
  category: 'efficiency' | 'compliance' | 'growth' | 'risk_management' | 'cost_optimization';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  businessImpact: string;
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  metrics: {
    current: number;
    target: number;
    improvement: string;
  };
  confidence: number;
}

interface IndustryBenchmark {
  metric: string;
  organizationValue: number;
  industryAverage: number;
  percentile: number;
  interpretation: 'excellent' | 'good' | 'average' | 'below_average' | 'needs_attention';
  recommendation: string;
}

// GET /api/finance/gl-accounts/organization-intelligence
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const analysisType = searchParams.get('analysisType') || 'comprehensive'; // profile, insights, benchmarks, comprehensive
    const timeframe = parseInt(searchParams.get('timeframe') || '90'); // days
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    console.log('🏢 Analyzing organization-specific GL intelligence:', organizationId);

    // CORE PATTERN: Get organization details
    const { data: organization, error: orgError } = await supabase
      .from('core_organizations')
      .select('*')
      .eq('id', organizationId)
      .single();

    if (orgError) {
      console.error('❌ Organization query error:', orgError);
      // Continue without organization data for now
    }

    console.log('📊 Organization data:', organization);

    // CORE PATTERN: Get all GL accounts for this organization
    const { data: accounts } = await supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId) // SACRED
      .eq('entity_type', 'chart_of_account')
      .eq('is_active', true);

    // CORE PATTERN: Get account metadata
    const accountIds = accounts?.map(a => a.id) || [];
    const { data: accountMetadata } = await supabase
      .from('core_dynamic_data')
      .select('entity_id, field_name, field_value')
      .in('entity_id', accountIds);

    // CORE PATTERN: Get transaction history
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframe);

    const { data: transactions } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', organizationId) // SACRED
      .gte('transaction_date', startDate.toISOString().split('T')[0])
      .in('transaction_type', ['journal_entry', 'ai_journal_entry', 'purchase_order'])
      .order('transaction_date', { ascending: false });

    // Calculate shared metrics used across all analysis types
    const accountUsage = new Map<string, { frequency: number; totalAmount: number }>();
    const transactionVolume = transactions?.length || 0;
    const totalAccounts = accounts?.length || 0;
    
    for (const tx of transactions || []) {
      const entries = tx.transaction_data?.entries || [];
      for (const entry of entries) {
        if (!accountUsage.has(entry.account_code)) {
          accountUsage.set(entry.account_code, { frequency: 0, totalAmount: 0 });
        }
        const usage = accountUsage.get(entry.account_code)!;
        usage.frequency++;
        usage.totalAmount += (entry.debit || 0) + (entry.credit || 0);
      }
    }

    const analysis = {
      organizationProfile: {} as OrganizationProfile,
      businessInsights: [] as BusinessContextInsight[],
      industryBenchmarks: [] as IndustryBenchmark[],
      summary: {
        intelligenceLevel: 0,
        dataQuality: 0,
        recommendationCount: 0,
        riskScore: 0,
        opportunityScore: 0
      }
    };

    // 1. BUILD ORGANIZATION PROFILE
    if (analysisType === 'profile' || analysisType === 'comprehensive') {
      
      // Calculate business metrics
      const totalRevenue = (transactions || [])
        .filter(tx => {
          const entries = tx.transaction_data?.entries || [];
          return entries.some((entry: any) => entry.account_code?.startsWith('4')); // Revenue accounts
        })
        .reduce((sum, tx) => {
          const entries = tx.transaction_data?.entries || [];
          const revenueEntry = entries.find((entry: any) => entry.account_code?.startsWith('4'));
          return sum + (revenueEntry?.credit || 0);
        }, 0);

      const monthlyRevenue = totalRevenue / (timeframe / 30);

      // Determine business size
      let businessSize: 'small' | 'medium' | 'large' = 'small';
      if (monthlyRevenue > 50000) businessSize = 'medium';
      if (monthlyRevenue > 200000) businessSize = 'large';

      // Determine accounting maturity
      let accountingMaturity: 'basic' | 'intermediate' | 'advanced' = 'basic';
      if (accounts && accounts.length > 15) accountingMaturity = 'intermediate';
      if (accounts && accounts.length > 30) accountingMaturity = 'advanced';

      // Analyze unique patterns (accountUsage already calculated above)

      // Get preferred accounts (top 5 by frequency)
      const preferredAccounts = Array.from(accountUsage.entries())
        .sort(([,a], [,b]) => b.frequency - a.frequency)
        .slice(0, 5)
        .map(([code]) => code);

      // Calculate average amounts per account type
      const averageAmounts: Record<string, number> = {};
      for (const [accountCode, usage] of accountUsage.entries()) {
        averageAmounts[accountCode] = usage.totalAmount / usage.frequency;
      }

      analysis.organizationProfile = {
        organizationId,
        businessType: organization.industry || 'restaurant',
        industry: organization.industry || 'food_service',
        size: businessSize,
        monthlyRevenue,
        transactionVolume,
        accountingMaturity,
        riskProfile: monthlyRevenue < 20000 ? 'conservative' : monthlyRevenue > 100000 ? 'aggressive' : 'moderate',
        uniquePatterns: {
          preferredAccounts,
          transactionTiming: [], // Could analyze by day of week/month
          averageAmounts,
          seasonality: {} // Could analyze seasonal patterns
        }
      };
    }

    // 2. GENERATE BUSINESS CONTEXT INSIGHTS
    if (analysisType === 'insights' || analysisType === 'comprehensive') {
      
      // Insight 1: Account Utilization Efficiency
      const totalAccounts = accounts?.length || 0;
      const activeAccounts = Array.from(accountUsage.keys()).length;
      const utilizationRate = totalAccounts > 0 ? activeAccounts / totalAccounts : 0;
      
      if (utilizationRate < 0.7) {
        analysis.businessInsights.push({
          category: 'efficiency',
          priority: 'medium',
          title: 'Low Chart of Accounts Utilization',
          description: `Only ${Math.round(utilizationRate * 100)}% of your GL accounts are being used`,
          businessImpact: 'Unused accounts create confusion and make reporting less efficient',
          recommendations: {
            immediate: ['Review unused accounts and consider deactivating them'],
            shortTerm: ['Consolidate similar accounts to simplify your chart'],
            longTerm: ['Implement account usage monitoring and regular cleanup processes']
          },
          metrics: {
            current: utilizationRate,
            target: 0.8,
            improvement: `${Math.round((0.8 - utilizationRate) * 100)}% improvement needed`
          },
          confidence: 0.9
        });
      }

      // Insight 2: Cash Flow Pattern Analysis
      const cashAccount = accountUsage.get('1001000');
      if (cashAccount && analysis.organizationProfile.monthlyRevenue > 0) {
        const cashTurnoverRatio = cashAccount.totalAmount / analysis.organizationProfile.monthlyRevenue;
        
        if (cashTurnoverRatio > 3) {
          analysis.businessInsights.push({
            category: 'risk_management',
            priority: 'high',
            title: 'High Cash Flow Volatility Detected',
            description: `Cash account turnover is ${cashTurnoverRatio.toFixed(1)}x monthly revenue`,
            businessImpact: 'High cash volatility can indicate cash flow management issues',
            recommendations: {
              immediate: ['Implement daily cash flow monitoring'],
              shortTerm: ['Create cash flow forecasting models'],
              longTerm: ['Consider establishing a cash reserve fund']
            },
            metrics: {
              current: cashTurnoverRatio,
              target: 2.0,
              improvement: 'Reduce cash volatility by improving receivables collection'
            },
            confidence: 0.8
          });
        }
      }

      // Insight 3: Revenue Diversification
      const revenueAccounts = Array.from(accountUsage.entries())
        .filter(([code]) => code.startsWith('4'));
      
      if (revenueAccounts.length === 1 && analysis.organizationProfile.size !== 'small') {
        analysis.businessInsights.push({
          category: 'growth',
          priority: 'medium',
          title: 'Single Revenue Stream Risk',
          description: 'All revenue is concentrated in one account',
          businessImpact: 'Lack of revenue diversification increases business risk',
          recommendations: {
            immediate: ['Create separate revenue accounts for different service types'],
            shortTerm: ['Analyze revenue by service category or customer type'],
            longTerm: ['Develop multiple revenue streams to reduce dependency risk']
          },
          metrics: {
            current: 1,
            target: 3,
            improvement: 'Add 2 additional revenue categories for better tracking'
          },
          confidence: 0.85
        });
      }

      // Insight 4: Expense Management Maturity
      const expenseAccounts = Array.from(accountUsage.entries())
        .filter(([code]) => code.startsWith('5') || code.startsWith('6'));
      
      const avgExpenseAmount = expenseAccounts.reduce((sum, [, usage]) => 
        sum + (usage.totalAmount / usage.frequency), 0) / expenseAccounts.length;

      if (avgExpenseAmount > analysis.organizationProfile.monthlyRevenue * 0.1) {
        analysis.businessInsights.push({
          category: 'cost_optimization',
          priority: 'high',
          title: 'High Average Expense Transaction Size',
          description: `Average expense transaction is ${((avgExpenseAmount / analysis.organizationProfile.monthlyRevenue) * 100).toFixed(1)}% of monthly revenue`,
          businessImpact: 'Large expense transactions may indicate lack of expense controls',
          recommendations: {
            immediate: ['Implement approval workflows for large expenses'],
            shortTerm: ['Set up expense budgets and monitoring'],
            longTerm: ['Create expense categories with spending limits']
          },
          metrics: {
            current: avgExpenseAmount,
            target: analysis.organizationProfile.monthlyRevenue * 0.05,
            improvement: 'Reduce average expense size through better controls'
          },
          confidence: 0.75
        });
      }
    }

    // 3. INDUSTRY BENCHMARKS (Simulated for Phase 3)
    if (analysisType === 'benchmarks' || analysisType === 'comprehensive') {
      
      // Calculate revenue for benchmarking (may not have profile built)
      const totalRevenue = (transactions || [])
        .filter(tx => {
          const entries = tx.transaction_data?.entries || [];
          return entries.some((entry: any) => entry.account_code?.startsWith('4')); // Revenue accounts
        })
        .reduce((sum, tx) => {
          const entries = tx.transaction_data?.entries || [];
          const revenueEntry = entries.find((entry: any) => entry.account_code?.startsWith('4'));
          return sum + (revenueEntry?.credit || 0);
        }, 0);

      const monthlyRevenue = totalRevenue / (timeframe / 30);
      
      // Revenue per Transaction Benchmark
      const avgRevenuePerTx = monthlyRevenue / (transactionVolume || 1);
      const industryAvgRevenuePerTx = 450; // Simulated restaurant industry average
      
      analysis.industryBenchmarks.push({
        metric: 'Average Revenue per Transaction',
        organizationValue: parseFloat(avgRevenuePerTx.toFixed(2)),
        industryAverage: parseFloat(industryAvgRevenuePerTx.toFixed(2)),
        percentile: avgRevenuePerTx > industryAvgRevenuePerTx ? 75 : 25,
        interpretation: avgRevenuePerTx > industryAvgRevenuePerTx * 1.2 ? 'excellent' :
                       avgRevenuePerTx > industryAvgRevenuePerTx ? 'good' :
                       avgRevenuePerTx > industryAvgRevenuePerTx * 0.8 ? 'average' : 'below_average',
        recommendation: avgRevenuePerTx < industryAvgRevenuePerTx 
          ? 'Focus on increasing average transaction value through upselling'
          : 'Strong performance - maintain current pricing strategy'
      });

      // Account Complexity Benchmark
      const accountComplexity = totalAccounts;
      const industryAvgAccounts = 25;
      
      analysis.industryBenchmarks.push({
        metric: 'Chart of Accounts Complexity',
        organizationValue: accountComplexity,
        industryAverage: industryAvgAccounts,
        percentile: accountComplexity > industryAvgAccounts ? 75 : 25,
        interpretation: accountComplexity > industryAvgAccounts * 1.5 ? 'needs_attention' :
                       accountComplexity > industryAvgAccounts ? 'good' :
                       accountComplexity < industryAvgAccounts * 0.5 ? 'below_average' : 'excellent',
        recommendation: accountComplexity > industryAvgAccounts * 1.5 
          ? 'Consider simplifying your chart of accounts for better management'
          : accountComplexity < industryAvgAccounts * 0.5
          ? 'Your chart may be too simple - consider adding detail for better insights'
          : 'Good balance of detail and simplicity'
      });
    }

    // Calculate summary metrics
    analysis.summary = {
      intelligenceLevel: Math.min(
        (analysis.businessInsights.length * 0.2) +
        (analysis.industryBenchmarks.length * 0.1) +
        (transactionVolume / 100) +
        (totalAccounts / 50), 
        1.0
      ),
      dataQuality: transactionVolume > 10 ? Math.min(transactionVolume / 50, 1.0) : 0.3,
      recommendationCount: analysis.businessInsights.reduce((sum, insight) => 
        sum + insight.recommendations.immediate.length + 
        insight.recommendations.shortTerm.length + 
        insight.recommendations.longTerm.length, 0),
      riskScore: analysis.businessInsights.filter(i => i.category === 'risk_management').length / 5,
      opportunityScore: analysis.businessInsights.filter(i => i.category === 'growth' || i.category === 'efficiency').length / 5
    };

    console.log('✅ Organization-specific intelligence generated successfully');

    return NextResponse.json({
      data: analysisType === 'comprehensive' ? analysis : {
        organizationProfile: analysisType === 'profile' ? analysis.organizationProfile : undefined,
        businessInsights: analysisType === 'insights' ? analysis.businessInsights : undefined,
        industryBenchmarks: analysisType === 'benchmarks' ? analysis.industryBenchmarks : undefined,
        summary: analysis.summary
      },
      metadata: {
        organizationId,
        analysisType,
        timeframeDays: timeframe,
        businessType: organization.industry || 'restaurant',
        generatedAt: new Date().toISOString(),
        phaseLevel: 3,
        capabilities: [
          'Organization-specific pattern learning',
          'Business context analysis',
          'Industry benchmarking',
          'Risk and opportunity scoring',
          'Accounting maturity assessment',
          'Multi-tier recommendations'
        ]
      },
      success: true
    });

  } catch (error) {
    console.error('❌ Organization intelligence error:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : String(error));
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}