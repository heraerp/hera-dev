/**
 * HERA Universal - Real-Time GL Intelligence API
 * 
 * Phase 4: Real-time monitoring, automated alerts, and proactive intelligence
 * Provides continuous monitoring with immediate alerts and autonomous recommendations
 * Uses HERA's 5-table universal architecture with real-time processing
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

interface RealTimeAlert {
  alertId: string;
  alertType: 'cash_flow' | 'anomaly' | 'compliance' | 'budget' | 'trend' | 'risk';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  triggeredBy: {
    accountCode?: string;
    transactionId?: string;
    pattern?: string;
    threshold?: number;
    currentValue?: number;
  };
  businessImpact: {
    financial: number; // Estimated dollar impact
    operational: 'critical' | 'high' | 'medium' | 'low';
    urgency: 'immediate' | 'today' | 'this_week' | 'this_month';
  };
  recommendations: {
    immediate: string[];
    automated: string[]; // Actions the system can take automatically
    preventive: string[];
  };
  metadata: {
    confidence: number;
    dataPoints: number;
    lastUpdated: string;
    relatedAlerts: string[];
  };
}

interface RealTimeMetrics {
  organizationId: string;
  timestamp: string;
  cashFlow: {
    currentBalance: number;
    dailyChange: number;
    weeklyTrend: 'positive' | 'negative' | 'stable';
    projectedBalance7Days: number;
    burnRate: number; // Daily cash burn
    daysOfCashLeft: number;
  };
  transactionHealth: {
    totalTransactions24h: number;
    averageAmount24h: number;
    anomalyScore: number; // 0-1, higher = more anomalous
    patternDeviations: number;
    suspiciousTransactions: string[];
  };
  accountHealth: {
    totalAccounts: number;
    activeAccounts: number;
    imbalancedAccounts: string[];
    overdueReconciliations: string[];
    budgetVariances: Array<{
      accountCode: string;
      budgeted: number;
      actual: number;
      variance: number;
      variancePercent: number;
    }>;
  };
  riskFactors: {
    overall: number; // 0-100 risk score
    cashFlowRisk: number;
    complianceRisk: number;
    operationalRisk: number;
    trendingUp: boolean;
  };
}

interface IntelligentRecommendation {
  recommendationId: string;
  type: 'optimization' | 'risk_mitigation' | 'growth_opportunity' | 'compliance' | 'efficiency';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expectedBenefit: {
    financial: number;
    timeframe: 'immediate' | 'short_term' | 'long_term';
    confidence: number;
  };
  implementation: {
    effort: 'low' | 'medium' | 'high';
    resources: string[];
    timeline: string;
    steps: string[];
  };
  aiAnalysis: {
    basedOn: string[];
    patterns: string[];
    confidence: number;
    learningSource: 'organization' | 'industry' | 'market';
  };
}

// GET /api/finance/gl-accounts/real-time-intelligence
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const monitoringType = searchParams.get('monitoringType') || 'comprehensive'; // alerts, metrics, recommendations, comprehensive
    const alertSeverity = searchParams.get('alertSeverity'); // Filter alerts by severity
    const realTimeWindow = parseInt(searchParams.get('realTimeWindow') || '24'); // Hours for real-time analysis
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    console.log('⚡ Generating real-time GL intelligence for organization:', organizationId);

    // CORE PATTERN: Get current account balances
    const { data: accounts } = await supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId) // SACRED
      .eq('entity_type', 'chart_of_account')
      .eq('is_active', true);

    const accountIds = accounts?.map(a => a.id) || [];

    // CORE PATTERN: Get current balances from dynamic data
    const { data: balanceData } = await supabase
      .from('core_dynamic_data')
      .select('entity_id, field_name, field_value')
      .in('entity_id', accountIds)
      .eq('field_name', 'current_balance');

    // CORE PATTERN: Get recent transactions for real-time analysis
    const recentCutoff = new Date();
    recentCutoff.setHours(recentCutoff.getHours() - realTimeWindow);

    const { data: recentTransactions } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', organizationId) // SACRED
      .gte('created_at', recentCutoff.toISOString())
      .in('transaction_type', ['journal_entry', 'ai_journal_entry', 'purchase_order'])
      .order('created_at', { ascending: false });

    // CORE PATTERN: Get historical data for trend analysis
    const historicalCutoff = new Date();
    historicalCutoff.setDate(historicalCutoff.getDate() - 30);

    const { data: historicalTransactions } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', organizationId) // SACRED
      .gte('created_at', historicalCutoff.toISOString())
      .order('created_at', { ascending: false });

    const analysis = {
      alerts: [] as RealTimeAlert[],
      metrics: {} as RealTimeMetrics,
      recommendations: [] as IntelligentRecommendation[],
      summary: {
        alertsGenerated: 0,
        criticalAlerts: 0,
        automatedActions: 0,
        intelligenceLevel: 0
      }
    };

    // Build current balance map
    const currentBalances = new Map<string, number>();
    for (const account of accounts || []) {
      const balanceEntry = balanceData?.find(b => b.entity_id === account.id);
      const balance = parseFloat(balanceEntry?.field_value || '0');
      currentBalances.set(account.entity_code, balance);
    }

    // 1. REAL-TIME METRICS CALCULATION
    if (monitoringType === 'metrics' || monitoringType === 'comprehensive') {
      
      // Cash Flow Analysis
      const cashBalance = currentBalances.get('1001000') || 0;
      
      // Calculate daily cash changes from recent transactions
      const cashTransactions = (recentTransactions || []).filter(tx => {
        const entries = tx.transaction_data?.entries || [];
        return entries.some((entry: any) => entry.account_code === '1001000');
      });

      const dailyChanges: number[] = [];
      const dailyGroups = new Map<string, number>();
      
      for (const tx of cashTransactions) {
        const date = tx.created_at.split('T')[0];
        const entries = tx.transaction_data?.entries || [];
        const cashEntry = entries.find((entry: any) => entry.account_code === '1001000');
        
        if (cashEntry) {
          const change = (cashEntry.debit || 0) - (cashEntry.credit || 0);
          dailyGroups.set(date, (dailyGroups.get(date) || 0) + change);
        }
      }

      const avgDailyChange = Array.from(dailyGroups.values()).reduce((sum, val) => sum + val, 0) / Math.max(dailyGroups.size, 1);
      const projectedBalance7Days = cashBalance + (avgDailyChange * 7);
      const burnRate = Math.abs(avgDailyChange);
      const daysOfCashLeft = burnRate > 0 ? Math.max(0, cashBalance / burnRate) : 999;

      // Transaction Health
      const totalTransactions24h = (recentTransactions || []).length;
      const amounts24h = (recentTransactions || []).flatMap(tx => {
        const entries = tx.transaction_data?.entries || [];
        return entries.map((entry: any) => (entry.debit || 0) + (entry.credit || 0));
      });
      const averageAmount24h = amounts24h.length > 0 ? amounts24h.reduce((a, b) => a + b, 0) / amounts24h.length : 0;

      // Simple anomaly detection based on historical patterns
      const historicalAmounts = (historicalTransactions || []).flatMap(tx => {
        const entries = tx.transaction_data?.entries || [];
        return entries.map((entry: any) => (entry.debit || 0) + (entry.credit || 0));
      });

      const historicalAvg = historicalAmounts.length > 0 ? 
        historicalAmounts.reduce((a, b) => a + b, 0) / historicalAmounts.length : 0;
      
      const anomalyScore = historicalAvg > 0 ? 
        Math.min(Math.abs(averageAmount24h - historicalAvg) / historicalAvg, 1) : 0;

      // Account Health
      const imbalancedAccounts: string[] = [];
      for (const [accountCode, balance] of currentBalances.entries()) {
        // Check for unusual balances based on account type
        const firstDigit = accountCode.substring(0, 1);
        const isAssetOrExpense = ['1', '5', '6', '7', '8', '9'].includes(firstDigit);
        const isLiabilityRevenueEquity = ['2', '3', '4'].includes(firstDigit);
        
        // Flag unusual balances
        if ((isAssetOrExpense && balance < 0 && Math.abs(balance) > 100) ||
            (isLiabilityRevenueEquity && balance > 0 && balance > 100)) {
          // This could be normal, but worth monitoring
        }
        
        // Flag zero balances for active accounts that should have balances
        if (balance === 0 && ['1001000', '3001000'].includes(accountCode)) {
          imbalancedAccounts.push(accountCode);
        }
      }

      analysis.metrics = {
        organizationId,
        timestamp: new Date().toISOString(),
        cashFlow: {
          currentBalance: cashBalance,
          dailyChange: avgDailyChange,
          weeklyTrend: avgDailyChange > 50 ? 'positive' : avgDailyChange < -50 ? 'negative' : 'stable',
          projectedBalance7Days,
          burnRate,
          daysOfCashLeft: Math.round(daysOfCashLeft)
        },
        transactionHealth: {
          totalTransactions24h,
          averageAmount24h,
          anomalyScore,
          patternDeviations: Math.round(anomalyScore * 10),
          suspiciousTransactions: [] // Would implement with more sophisticated detection
        },
        accountHealth: {
          totalAccounts: accounts?.length || 0,
          activeAccounts: Array.from(currentBalances.keys()).length,
          imbalancedAccounts,
          overdueReconciliations: [], // Would implement with reconciliation tracking
          budgetVariances: [] // Would implement with budget system
        },
        riskFactors: {
          overall: Math.round((anomalyScore * 30) + (daysOfCashLeft < 30 ? 40 : 0) + (imbalancedAccounts.length * 10)),
          cashFlowRisk: daysOfCashLeft < 30 ? 80 : daysOfCashLeft < 60 ? 40 : 20,
          complianceRisk: imbalancedAccounts.length * 20,
          operationalRisk: Math.round(anomalyScore * 60),
          trendingUp: avgDailyChange < -100 // Negative trend is bad
        }
      };
    }

    // 2. REAL-TIME ALERTS GENERATION
    if (monitoringType === 'alerts' || monitoringType === 'comprehensive') {
      
      // Critical Cash Flow Alert
      if (analysis.metrics.cashFlow?.daysOfCashLeft < 7) {
        analysis.alerts.push({
          alertId: crypto.randomUUID(),
          alertType: 'cash_flow',
          severity: 'critical',
          title: 'Critical Cash Flow Warning',
          description: `Cash reserves critically low: only ${analysis.metrics.cashFlow.daysOfCashLeft} days remaining`,
          triggeredBy: {
            accountCode: '1001000',
            currentValue: analysis.metrics.cashFlow.currentBalance,
            threshold: analysis.metrics.cashFlow.burnRate * 7
          },
          businessImpact: {
            financial: Math.abs(analysis.metrics.cashFlow.dailyChange * 30),
            operational: 'critical',
            urgency: 'immediate'
          },
          recommendations: {
            immediate: [
              'Review all outstanding receivables for immediate collection',
              'Defer non-essential expenses',
              'Contact bank about emergency credit line'
            ],
            automated: [
              'Send overdue payment reminders to customers',
              'Flag all new expenses for approval'
            ],
            preventive: [
              'Implement daily cash flow monitoring',
              'Create cash reserve fund',
              'Diversify payment methods to improve cash flow timing'
            ]
          },
          metadata: {
            confidence: 0.95,
            dataPoints: analysis.metrics.cashFlow ? 1 : 0,
            lastUpdated: new Date().toISOString(),
            relatedAlerts: []
          }
        });
      }

      // High Transaction Anomaly Alert
      if (analysis.metrics.transactionHealth?.anomalyScore > 0.5) {
        analysis.alerts.push({
          alertId: crypto.randomUUID(),
          alertType: 'anomaly',
          severity: 'high',
          title: 'Unusual Transaction Patterns Detected',
          description: `Transaction patterns deviate significantly from historical norms (${Math.round(analysis.metrics.transactionHealth.anomalyScore * 100)}% anomaly score)`,
          triggeredBy: {
            pattern: 'transaction_amount_deviation',
            currentValue: analysis.metrics.transactionHealth.averageAmount24h,
            threshold: 0.5
          },
          businessImpact: {
            financial: 0, // Unknown until investigated
            operational: 'medium',
            urgency: 'today'
          },
          recommendations: {
            immediate: [
              'Review recent large transactions for accuracy',
              'Verify authorization for unusual amounts',
              'Check for duplicate or erroneous entries'
            ],
            automated: [
              'Flag transactions >2 standard deviations for review',
              'Require additional approval for unusual amounts'
            ],
            preventive: [
              'Implement transaction limits by user role',
              'Set up automated anomaly detection rules',
              'Regular transaction pattern review meetings'
            ]
          },
          metadata: {
            confidence: 0.8,
            dataPoints: analysis.metrics.transactionHealth?.totalTransactions24h || 0,
            lastUpdated: new Date().toISOString(),
            relatedAlerts: []
          }
        });
      }

      // Account Imbalance Alert
      if (analysis.metrics.accountHealth?.imbalancedAccounts.length > 0) {
        analysis.alerts.push({
          alertId: crypto.randomUUID(),
          alertType: 'compliance',
          severity: 'medium',
          title: 'Account Balance Issues Detected',
          description: `${analysis.metrics.accountHealth.imbalancedAccounts.length} accounts have unusual or zero balances`,
          triggeredBy: {
            accountCode: analysis.metrics.accountHealth.imbalancedAccounts[0]
          },
          businessImpact: {
            financial: 0,
            operational: 'medium',
            urgency: 'this_week'
          },
          recommendations: {
            immediate: [
              'Review account balances for accuracy',
              'Investigate zero balances in critical accounts',
              'Verify recent transactions affecting these accounts'
            ],
            automated: [
              'Schedule automatic reconciliation checks',
              'Set up balance monitoring alerts'
            ],
            preventive: [
              'Implement monthly account review process',
              'Set minimum balance alerts for critical accounts',
              'Create account balance dashboard for daily monitoring'
            ]
          },
          metadata: {
            confidence: 0.7,
            dataPoints: analysis.metrics.accountHealth?.imbalancedAccounts.length || 0,
            lastUpdated: new Date().toISOString(),
            relatedAlerts: []
          }
        });
      }

      // Filter alerts by severity if requested
      if (alertSeverity) {
        analysis.alerts = analysis.alerts.filter(alert => alert.severity === alertSeverity);
      }
    }

    // 3. INTELLIGENT RECOMMENDATIONS
    if (monitoringType === 'recommendations' || monitoringType === 'comprehensive') {
      
      // Cash Flow Optimization Recommendation
      if (analysis.metrics.cashFlow && analysis.metrics.cashFlow.daysOfCashLeft < 30) {
        analysis.recommendations.push({
          recommendationId: crypto.randomUUID(),
          type: 'risk_mitigation',
          priority: 'high',
          title: 'Implement Proactive Cash Flow Management',
          description: 'Current cash flow patterns indicate potential liquidity constraints within 30 days',
          expectedBenefit: {
            financial: analysis.metrics.cashFlow.burnRate * 15, // Half-month of burn rate
            timeframe: 'short_term',
            confidence: 0.85
          },
          implementation: {
            effort: 'medium',
            resources: ['finance_team', 'management', 'bank_relationship'],
            timeline: '1-2 weeks',
            steps: [
              'Set up daily cash position reporting',
              'Negotiate payment terms with key suppliers',
              'Implement accelerated collection procedures',
              'Establish line of credit for emergencies'
            ]
          },
          aiAnalysis: {
            basedOn: ['cash_flow_trends', 'transaction_patterns', 'industry_benchmarks'],
            patterns: ['decreasing_cash_trend', 'irregular_inflows'],
            confidence: 0.85,
            learningSource: 'organization'
          }
        });
      }

      // Process Efficiency Recommendation
      if (analysis.metrics.transactionHealth && analysis.metrics.transactionHealth.totalTransactions24h > 20) {
        analysis.recommendations.push({
          recommendationId: crypto.randomUUID(),
          type: 'efficiency',
          priority: 'medium',
          title: 'Automate High-Volume Transaction Processing',
          description: 'High transaction volume detected - automation could reduce processing time and errors',
          expectedBenefit: {
            financial: 2000, // Estimated monthly savings
            timeframe: 'long_term',
            confidence: 0.75
          },
          implementation: {
            effort: 'high',
            resources: ['it_team', 'finance_team', 'vendors'],
            timeline: '2-3 months',
            steps: [
              'Analyze current manual processes',
              'Evaluate automation tools and integrations',
              'Implement automated journal entry rules',
              'Set up exception handling workflows'
            ]
          },
          aiAnalysis: {
            basedOn: ['transaction_volume', 'processing_patterns', 'error_rates'],
            patterns: ['high_volume_manual_entry', 'repetitive_transactions'],
            confidence: 0.75,
            learningSource: 'industry'
          }
        });
      }
    }

    // Calculate summary
    analysis.summary = {
      alertsGenerated: analysis.alerts.length,
      criticalAlerts: analysis.alerts.filter(a => a.severity === 'critical').length,
      automatedActions: analysis.alerts.reduce((sum, alert) => sum + alert.recommendations.automated.length, 0),
      intelligenceLevel: Math.min(
        (analysis.alerts.length * 0.2) +
        (analysis.recommendations.length * 0.3) +
        (analysis.metrics.riskFactors ? (100 - analysis.metrics.riskFactors.overall) / 100 * 0.5 : 0),
        1.0
      )
    };

    console.log('✅ Real-time GL intelligence generated successfully');

    return NextResponse.json({
      data: monitoringType === 'comprehensive' ? analysis : {
        alerts: monitoringType === 'alerts' ? analysis.alerts : undefined,
        metrics: monitoringType === 'metrics' ? analysis.metrics : undefined,
        recommendations: monitoringType === 'recommendations' ? analysis.recommendations : undefined,
        summary: analysis.summary
      },
      metadata: {
        organizationId,
        monitoringType,
        alertSeverity,
        realTimeWindow,
        generatedAt: new Date().toISOString(),
        phaseLevel: 4,
        capabilities: [
          'Real-time cash flow monitoring',
          'Automated anomaly detection',
          'Proactive risk alerts',
          'Intelligent recommendations',
          'Continuous health monitoring',
          'Autonomous decision support'
        ]
      },
      success: true
    });

  } catch (error) {
    console.error('❌ Real-time intelligence error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}