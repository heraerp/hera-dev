/**
 * HERA Universal - GL Account Intelligence API
 * 
 * Phase 1: Basic GL account intelligence using core_dynamic_data patterns
 * Provides account usage analytics, balance tracking, and recommendations
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

interface AccountIntelligenceRequest {
  organizationId: string;
  accountId?: string;
  accountCode?: string;
  analysisType?: 'usage' | 'balance' | 'recommendations' | 'all';
}

interface AccountUsage {
  accountId: string;
  accountCode: string;
  accountName: string;
  usageCount: number;
  lastUsed: string | null;
  ytdActivity: number;
  currentBalance: number;
  balanceTrend: 'increasing' | 'decreasing' | 'stable';
  riskLevel: 'low' | 'medium' | 'high';
}

interface IntelligenceRecommendation {
  type: 'usage' | 'balance' | 'compliance' | 'efficiency';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  accountsAffected: string[];
  suggestedAction: string;
  confidence: number;
}

// GET /api/finance/gl-accounts/intelligence
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const accountId = searchParams.get('accountId');
    const accountCode = searchParams.get('accountCode');
    const analysisType = searchParams.get('analysisType') || 'all';
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    console.log('🧠 Generating GL account intelligence for organization:', organizationId);

    // CORE PATTERN: Get all GL accounts with their metadata
    let accountsQuery = supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId) // SACRED
      .eq('entity_type', 'chart_of_account')
      .eq('is_active', true)
      .order('entity_code', { ascending: true });

    // Filter by specific account if requested
    if (accountId) {
      accountsQuery = accountsQuery.eq('id', accountId);
    } else if (accountCode) {
      accountsQuery = accountsQuery.eq('entity_code', accountCode);
    }

    const { data: accounts, error: accountsError } = await accountsQuery;

    if (accountsError) {
      console.error('❌ Error fetching GL accounts:', accountsError);
      return NextResponse.json(
        { error: 'Failed to fetch GL accounts' },
        { status: 500 }
      );
    }

    // CORE PATTERN: Get dynamic data for all accounts
    const accountIds = accounts?.map(a => a.id) || [];
    let dynamicData: any[] = [];
    
    if (accountIds.length > 0) {
      const { data: dynamicDataResult } = await supabase
        .from('core_dynamic_data')
        .select('entity_id, field_name, field_value')
        .in('entity_id', accountIds);
      
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

    // Get recent transaction activity for intelligence
    const { data: recentTransactions } = await supabase
      .from('universal_transactions')
      .select('transaction_data, created_at, total_amount')
      .eq('organization_id', organizationId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
      .order('created_at', { ascending: false })
      .limit(100);

    // Phase 1: Basic Intelligence Analysis
    const intelligence = {
      accountUsage: [] as AccountUsage[],
      recommendations: [] as IntelligenceRecommendation[],
      summary: {
        totalAccounts: accounts?.length || 0,
        activeAccounts: 0,
        unusedAccounts: 0,
        highActivityAccounts: 0,
        totalBalance: 0,
        balanceByType: {} as Record<string, number>
      }
    };

    // Analyze each account
    for (const account of accounts || []) {
      const metadata = dynamicDataMap[account.id] || {};
      
      const usageCount = parseInt(metadata.usage_count || '0');
      const currentBalance = parseFloat(metadata.current_balance || '0');
      const ytdActivity = parseFloat(metadata.ytd_activity || '0');
      const accountType = metadata.account_type || 'ASSET';
      
      // Calculate balance trend (simplified for Phase 1)
      let balanceTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (ytdActivity > currentBalance * 0.1) balanceTrend = 'increasing';
      else if (ytdActivity < -currentBalance * 0.1) balanceTrend = 'decreasing';
      
      // Calculate risk level
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (usageCount === 0 && currentBalance > 0) riskLevel = 'medium';
      if (Math.abs(currentBalance) > 10000 && usageCount === 0) riskLevel = 'high';
      
      const accountUsage: AccountUsage = {
        accountId: account.id,
        accountCode: account.entity_code,
        accountName: account.entity_name,
        usageCount,
        lastUsed: metadata.last_used_date || null,
        ytdActivity,
        currentBalance,
        balanceTrend,
        riskLevel
      };
      
      intelligence.accountUsage.push(accountUsage);
      intelligence.summary.totalBalance += currentBalance;
      intelligence.summary.balanceByType[accountType] = 
        (intelligence.summary.balanceByType[accountType] || 0) + currentBalance;
      
      if (usageCount > 0) intelligence.summary.activeAccounts++;
      if (usageCount === 0) intelligence.summary.unusedAccounts++;
      if (usageCount > 10) intelligence.summary.highActivityAccounts++;
    }

    // Generate recommendations based on analysis
    if (analysisType === 'recommendations' || analysisType === 'all') {
      
      // Recommendation 1: Unused accounts with balances
      const unusedWithBalance = intelligence.accountUsage.filter(
        a => a.usageCount === 0 && Math.abs(a.currentBalance) > 100
      );
      
      if (unusedWithBalance.length > 0) {
        intelligence.recommendations.push({
          type: 'usage',
          priority: 'medium',
          title: 'Unused Accounts with Balances',
          description: `${unusedWithBalance.length} accounts have balances but no recent activity`,
          accountsAffected: unusedWithBalance.map(a => a.accountCode),
          suggestedAction: 'Review account balances and consider journal entries to move balances',
          confidence: 0.85
        });
      }

      // Recommendation 2: High activity accounts
      const highActivityAccounts = intelligence.accountUsage.filter(
        a => a.usageCount > 20
      );
      
      if (highActivityAccounts.length > 0) {
        intelligence.recommendations.push({
          type: 'efficiency',
          priority: 'low',
          title: 'High Activity Accounts',
          description: `${highActivityAccounts.length} accounts have high transaction volume`,
          accountsAffected: highActivityAccounts.map(a => a.accountCode),
          suggestedAction: 'Consider creating sub-accounts or cost centers for better tracking',
          confidence: 0.70
        });
      }

      // Recommendation 3: Balance validation
      const assetBalance = intelligence.summary.balanceByType['ASSET'] || 0;
      const liabilityBalance = intelligence.summary.balanceByType['LIABILITY'] || 0;
      const equityBalance = intelligence.summary.balanceByType['EQUITY'] || 0;
      
      const balanceCheck = assetBalance - (liabilityBalance + equityBalance);
      
      if (Math.abs(balanceCheck) > 100) {
        intelligence.recommendations.push({
          type: 'compliance',
          priority: 'high',
          title: 'Balance Sheet Out of Balance',
          description: `Accounting equation is off by $${balanceCheck.toFixed(2)}`,
          accountsAffected: ['All accounts'],
          suggestedAction: 'Review journal entries and account balances for accuracy',
          confidence: 0.95
        });
      }
    }

    console.log('✅ GL account intelligence generated successfully');

    // Return filtered results based on analysisType
    let responseData: any = {};
    
    if (analysisType === 'usage' || analysisType === 'all') {
      responseData.accountUsage = intelligence.accountUsage;
    }
    
    if (analysisType === 'balance' || analysisType === 'all') {
      responseData.balanceAnalysis = {
        totalBalance: intelligence.summary.totalBalance,
        balanceByType: intelligence.summary.balanceByType
      };
    }
    
    if (analysisType === 'recommendations' || analysisType === 'all') {
      responseData.recommendations = intelligence.recommendations;
    }
    
    if (analysisType === 'all') {
      responseData.summary = intelligence.summary;
    }

    return NextResponse.json({
      data: responseData,
      metadata: {
        analysisType,
        accountsAnalyzed: accounts?.length || 0,
        generatedAt: new Date().toISOString(),
        phaseLevel: 1,
        capabilities: [
          'Account usage tracking',
          'Balance trend analysis', 
          'Basic recommendations',
          'Risk level assessment'
        ]
      },
      success: true
    });

  } catch (error) {
    console.error('❌ GL account intelligence error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/finance/gl-accounts/intelligence
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body: AccountIntelligenceRequest = await request.json();

    console.log('🔄 Updating GL account intelligence data');

    if (!body.organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    // CORE PATTERN: Update account usage statistics
    // This would typically be called after journal entries are posted
    const { data: recentTransactions } = await supabase
      .from('universal_transactions')
      .select('transaction_data, created_at')
      .eq('organization_id', body.organizationId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
      .order('created_at', { ascending: false });

    // Count account usage from recent transactions
    const accountUsageMap = new Map<string, { count: number; lastUsed: string }>();
    
    for (const transaction of recentTransactions || []) {
      const entries = transaction.transaction_data?.entries || [];
      
      for (const entry of entries) {
        if (entry.account_code) {
          const current = accountUsageMap.get(entry.account_code) || { count: 0, lastUsed: transaction.created_at };
          accountUsageMap.set(entry.account_code, {
            count: current.count + 1,
            lastUsed: transaction.created_at > current.lastUsed ? transaction.created_at : current.lastUsed
          });
        }
      }
    }

    // CORE PATTERN: Update dynamic data for accounts
    const updates = [];
    for (const [accountCode, usage] of accountUsageMap.entries()) {
      // Get account entity
      const { data: account } = await supabase
        .from('core_entities')
        .select('id')
        .eq('organization_id', body.organizationId)
        .eq('entity_type', 'chart_of_account')
        .eq('entity_code', accountCode)
        .single();

      if (account) {
        updates.push(
          supabase
            .from('core_dynamic_data')
            .upsert({
              entity_id: account.id,
              field_name: 'usage_count',
              field_value: usage.count.toString(),
              field_type: 'number'
            }, { onConflict: 'entity_id,field_name' }),
          
          supabase
            .from('core_dynamic_data')
            .upsert({
              entity_id: account.id,
              field_name: 'last_used_date',
              field_value: usage.lastUsed,
              field_type: 'date'
            }, { onConflict: 'entity_id,field_name' })
        );
      }
    }

    // Execute all updates
    await Promise.all(updates);

    console.log('✅ GL account intelligence updated successfully');

    return NextResponse.json({
      success: true,
      message: 'Account intelligence data updated',
      accountsUpdated: accountUsageMap.size
    });

  } catch (error) {
    console.error('❌ GL account intelligence update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}