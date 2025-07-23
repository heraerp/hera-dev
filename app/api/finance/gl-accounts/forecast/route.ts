/**
 * HERA Universal - GL Account Balance Forecasting API
 * 
 * Phase 2: Predictive balance forecasting using transaction patterns
 * Provides intelligent balance predictions and optimization recommendations
 * Uses HERA's 5-table universal architecture
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

interface BalanceForecast {
  accountCode: string;
  accountName: string;
  currentBalance: number;
  forecasts: {
    timeframe: '7_days' | '30_days' | '90_days';
    predictedBalance: number;
    confidence: number;
    factors: string[];
    scenarios: {
      optimistic: number;
      realistic: number;
      pessimistic: number;
    };
  }[];
  trends: {
    direction: 'increasing' | 'decreasing' | 'stable' | 'volatile';
    velocity: number; // $ per day
    acceleration: number; // change in velocity
  };
  recommendations: {
    priority: 'low' | 'medium' | 'high';
    type: 'optimization' | 'risk_mitigation' | 'opportunity';
    message: string;
    action: string;
  }[];
}

interface CashFlowOptimization {
  timePeriod: string;
  totalInflow: number;
  totalOutflow: number;
  netCashFlow: number;
  riskFactors: string[];
  optimizationOpportunities: {
    category: string;
    potentialSavings: number;
    implementation: string;
    timeline: string;
  }[];
  alerts: {
    type: 'cash_shortage' | 'excess_cash' | 'unusual_pattern';
    severity: 'low' | 'medium' | 'high';
    message: string;
    suggestedAction: string;
  }[];
}

// GET /api/finance/gl-accounts/forecast
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const accountCode = searchParams.get('accountCode');
    const forecastType = searchParams.get('forecastType') || 'balance'; // balance, cash_flow, optimization
    const timeframes = searchParams.get('timeframes')?.split(',') || ['7_days', '30_days', '90_days'];
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    console.log('📈 Generating balance forecasts for organization:', organizationId);

    // CORE PATTERN: Get accounts with their current balances
    let accountsQuery = supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId) // SACRED
      .eq('entity_type', 'chart_of_account')
      .eq('is_active', true);

    if (accountCode) {
      accountsQuery = accountsQuery.eq('entity_code', accountCode);
    }

    const { data: accounts } = await accountsQuery;
    const accountIds = accounts?.map(a => a.id) || [];

    // CORE PATTERN: Get dynamic data (current balances, etc.)
    const { data: dynamicData } = await supabase
      .from('core_dynamic_data')
      .select('entity_id, field_name, field_value')
      .in('entity_id', accountIds);

    // Group dynamic data by account
    const accountMetadata = (dynamicData || []).reduce((acc, item) => {
      if (!acc[item.entity_id]) acc[item.entity_id] = {};
      acc[item.entity_id][item.field_name] = item.field_value;
      return acc;
    }, {} as Record<string, Record<string, any>>);

    // CORE PATTERN: Get historical transactions (last 90 days for trend analysis)
    const { data: transactions } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', organizationId) // SACRED
      .gte('transaction_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .in('transaction_type', ['journal_entry', 'ai_journal_entry'])
      .order('transaction_date', { ascending: true });

    const forecasts: BalanceForecast[] = [];
    const cashFlowData: CashFlowOptimization[] = [];

    // Analyze each account
    for (const account of accounts || []) {
      const metadata = accountMetadata[account.id] || {};
      const currentBalance = parseFloat(metadata.current_balance || '0');
      
      // Get transactions affecting this account
      const accountTransactions = (transactions || []).filter(tx => {
        const entries = tx.transaction_data?.entries || [];
        return entries.some((entry: any) => entry.account_code === account.entity_code);
      });

      if (accountTransactions.length === 0) continue;

      // Calculate daily balance changes
      const dailyChanges: { date: string; change: number }[] = [];
      
      for (const tx of accountTransactions) {
        const entries = tx.transaction_data?.entries || [];
        const accountEntry = entries.find((entry: any) => entry.account_code === account.entity_code);
        
        if (accountEntry) {
          const change = (accountEntry.debit || 0) - (accountEntry.credit || 0);
          dailyChanges.push({
            date: tx.transaction_date,
            change
          });
        }
      }

      // Calculate trends
      if (dailyChanges.length >= 2) {
        const recent = dailyChanges.slice(-7); // Last 7 transactions
        const older = dailyChanges.slice(0, -7); // Earlier transactions
        
        const recentAvg = recent.reduce((sum, d) => sum + d.change, 0) / recent.length;
        const olderAvg = older.length > 0 ? older.reduce((sum, d) => sum + d.change, 0) / older.length : 0;
        
        const velocity = recentAvg;
        const acceleration = recentAvg - olderAvg;
        
        let direction: 'increasing' | 'decreasing' | 'stable' | 'volatile' = 'stable';
        if (Math.abs(velocity) < 10) direction = 'stable';
        else if (velocity > 0) direction = 'increasing';
        else direction = 'decreasing';
        
        // Check for volatility
        const variance = recent.reduce((sum, d) => sum + Math.pow(d.change - recentAvg, 2), 0) / recent.length;
        if (Math.sqrt(variance) > Math.abs(recentAvg) * 2) direction = 'volatile';

        // Generate forecasts for each timeframe
        const accountForecasts = timeframes.map(timeframe => {
          const days = timeframe === '7_days' ? 7 : timeframe === '30_days' ? 30 : 90;
          
          // Base prediction using velocity
          const basePrediction = currentBalance + (velocity * days);
          
          // Apply acceleration factor for longer timeframes
          const accelerationEffect = timeframe === '90_days' ? acceleration * days * 0.1 : 0;
          const predictedBalance = basePrediction + accelerationEffect;
          
          // Calculate confidence based on data quality
          const dataQuality = Math.min(accountTransactions.length / 10, 1);
          const trendStability = direction === 'stable' ? 0.9 : direction === 'volatile' ? 0.3 : 0.7;
          const confidence = dataQuality * trendStability;
          
          // Generate scenarios
          const volatilityFactor = Math.sqrt(variance) || Math.abs(velocity) * 0.2;
          
          return {
            timeframe: timeframe as '7_days' | '30_days' | '90_days',
            predictedBalance,
            confidence,
            factors: [
              `Current velocity: $${velocity.toFixed(2)}/day`,
              `Trend: ${direction}`,
              `Based on ${accountTransactions.length} transactions`,
              direction === 'volatile' ? 'High volatility detected' : 'Stable pattern'
            ],
            scenarios: {
              optimistic: predictedBalance + volatilityFactor,
              realistic: predictedBalance,
              pessimistic: predictedBalance - volatilityFactor
            }
          };
        });

        // Generate recommendations
        const recommendations = [];
        
        if (account.entity_code.startsWith('1') && direction === 'decreasing' && velocity < -100) {
          recommendations.push({
            priority: 'high' as const,
            type: 'risk_mitigation' as const,
            message: 'Asset account showing declining balance trend',
            action: 'Review cash flow and consider additional revenue sources'
          });
        }
        
        if (account.entity_code.startsWith('2') && direction === 'increasing' && velocity > 100) {
          recommendations.push({
            priority: 'medium' as const,
            type: 'risk_mitigation' as const,
            message: 'Liability account growing rapidly',
            action: 'Plan for debt reduction or refinancing options'
          });
        }
        
        if (direction === 'volatile') {
          recommendations.push({
            priority: 'medium' as const,
            type: 'optimization' as const,
            message: 'Account showing high volatility',
            action: 'Investigate irregular transactions and consider smoothing strategies'
          });
        }

        if (currentBalance > 10000 && direction === 'stable' && Math.abs(velocity) < 10) {
          recommendations.push({
            priority: 'low' as const,
            type: 'opportunity' as const,
            message: 'Stable account with significant balance',
            action: 'Consider investment opportunities or interest-bearing accounts'
          });
        }

        forecasts.push({
          accountCode: account.entity_code,
          accountName: account.entity_name,
          currentBalance,
          forecasts: accountForecasts,
          trends: {
            direction,
            velocity,
            acceleration
          },
          recommendations
        });
      }
    }

    // Cash Flow Optimization Analysis
    if (forecastType === 'cash_flow' || forecastType === 'optimization') {
      const cashAccount = forecasts.find(f => f.accountCode === '1001000');
      
      if (cashAccount) {
        const optimization: CashFlowOptimization = {
          timePeriod: '30 days',
          totalInflow: 0,
          totalOutflow: 0,
          netCashFlow: cashAccount.trends.velocity * 30,
          riskFactors: [],
          optimizationOpportunities: [],
          alerts: []
        };

        // Calculate inflows and outflows
        const revenueAccounts = forecasts.filter(f => f.accountCode.startsWith('4'));
        const expenseAccounts = forecasts.filter(f => f.accountCode.startsWith('5') || f.accountCode.startsWith('6'));

        optimization.totalInflow = revenueAccounts.reduce((sum, acc) => sum + Math.abs(acc.trends.velocity * 30), 0);
        optimization.totalOutflow = expenseAccounts.reduce((sum, acc) => sum + Math.abs(acc.trends.velocity * 30), 0);

        // Risk factors
        if (optimization.netCashFlow < -1000) {
          optimization.riskFactors.push('Negative cash flow trend');
          optimization.alerts.push({
            type: 'cash_shortage',
            severity: 'high',
            message: 'Cash flow trending negative',
            suggestedAction: 'Review expenses and accelerate collections'
          });
        }

        // Optimization opportunities
        const highExpenseAccounts = expenseAccounts.filter(acc => acc.trends.velocity > 200);
        for (const account of highExpenseAccounts) {
          optimization.optimizationOpportunities.push({
            category: account.accountName,
            potentialSavings: account.trends.velocity * 0.1 * 30,
            implementation: 'Review and negotiate better terms',
            timeline: '30-60 days'
          });
        }

        cashFlowData.push(optimization);
      }
    }

    console.log('✅ Balance forecasts generated successfully');

    return NextResponse.json({
      data: {
        balanceForecasts: forecastType === 'balance' || forecastType === 'optimization' ? forecasts : undefined,
        cashFlowOptimization: forecastType === 'cash_flow' || forecastType === 'optimization' ? cashFlowData : undefined
      },
      metadata: {
        forecastType,
        timeframes,
        accountsAnalyzed: forecasts.length,
        generatedAt: new Date().toISOString(),
        phaseLevel: 2,
        capabilities: [
          'Balance trend analysis',
          'Multi-timeframe forecasting', 
          'Scenario planning (optimistic/realistic/pessimistic)',
          'Cash flow optimization',
          'Risk factor identification',
          'Automated recommendations'
        ]
      },
      success: true
    });

  } catch (error) {
    console.error('❌ Balance forecast error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}