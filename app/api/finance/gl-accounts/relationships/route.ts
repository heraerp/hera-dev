/**
 * HERA Universal - GL Account Relationships API
 * 
 * Phase 2: Advanced account relationship mapping using core_relationships
 * Creates intelligent connections between accounts based on transaction patterns
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

interface SmartAccountSuggestion {
  targetAccount: {
    code: string;
    name: string;
    type: string;
  };
  confidence: number;
  reason: string;
  basedOn: 'transaction_pattern' | 'account_relationship' | 'business_rule' | 'industry_standard';
  frequency: number;
  averageAmount: number;
  lastUsed: string;
  examples: string[];
}

interface AccountCluster {
  clusterId: string;
  clusterName: string;
  accounts: string[];
  commonUsage: string;
  strength: number;
  recommendedActions: string[];
}

// GET /api/finance/gl-accounts/relationships
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const sourceAccountCode = searchParams.get('sourceAccountCode');
    const analysisType = searchParams.get('analysisType') || 'suggestions'; // suggestions, clusters, mapping
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    console.log('🔗 Analyzing GL account relationships for organization:', organizationId);

    // CORE PATTERN: Get existing relationships from core_relationships
    const { data: existingRelationships } = await supabase
      .from('core_relationships')
      .select('*')
      .eq('organization_id', organizationId) // SACRED
      .eq('relationship_type', 'gl_account_pattern')
      .eq('is_active', true);

    // CORE PATTERN: Get all GL accounts
    const { data: accounts } = await supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId) // SACRED
      .eq('entity_type', 'chart_of_account')
      .eq('is_active', true);

    // CORE PATTERN: Get recent transactions for pattern analysis
    const { data: transactions } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', organizationId) // SACRED
      .gte('transaction_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .in('transaction_type', ['journal_entry', 'ai_journal_entry'])
      .order('transaction_date', { ascending: false });

    const analysis = {
      smartSuggestions: [] as SmartAccountSuggestion[],
      accountClusters: [] as AccountCluster[],
      relationshipMap: new Map<string, any>()
    };

    // Build transaction patterns
    const accountPairs = new Map<string, {
      frequency: number;
      totalAmount: number;
      lastUsed: string;
      examples: string[];
    }>();

    for (const transaction of transactions || []) {
      const entries = transaction.transaction_data?.entries || [];
      
      // Create pairs for all combinations in each transaction
      for (let i = 0; i < entries.length; i++) {
        for (let j = i + 1; j < entries.length; j++) {
          const account1 = entries[i].account_code;
          const account2 = entries[j].account_code;
          
          // Create consistent key (alphabetical order)
          const key = account1 < account2 ? `${account1}-${account2}` : `${account2}-${account1}`;
          
          if (!accountPairs.has(key)) {
            accountPairs.set(key, {
              frequency: 0,
              totalAmount: 0,
              lastUsed: transaction.transaction_date,
              examples: []
            });
          }
          
          const pair = accountPairs.get(key)!;
          pair.frequency++;
          pair.totalAmount += Math.max(entries[i].debit || entries[i].credit, entries[j].debit || entries[j].credit);
          
          if (transaction.transaction_date > pair.lastUsed) {
            pair.lastUsed = transaction.transaction_date;
          }
          
          if (pair.examples.length < 3) {
            pair.examples.push(transaction.transaction_data?.description || 'Transaction');
          }
        }
      }
    }

    // 1. SMART ACCOUNT SUGGESTIONS
    if (analysisType === 'suggestions' || analysisType === 'all') {
      if (sourceAccountCode) {
        // Get suggestions for specific account
        const relatedPairs = Array.from(accountPairs.entries())
          .filter(([key]) => key.includes(sourceAccountCode))
          .sort(([,a], [,b]) => b.frequency - a.frequency);

        for (const [pairKey, pairData] of relatedPairs.slice(0, 5)) {
          const [account1, account2] = pairKey.split('-');
          const targetCode = account1 === sourceAccountCode ? account2 : account1;
          
          const targetAccount = accounts?.find(acc => acc.entity_code === targetCode);
          if (!targetAccount) continue;

          // Determine confidence based on frequency and recency
          const recencyScore = Math.max(0, 1 - (Date.now() - new Date(pairData.lastUsed).getTime()) / (30 * 24 * 60 * 60 * 1000));
          const frequencyScore = Math.min(pairData.frequency / 10, 1);
          const confidence = (recencyScore * 0.3 + frequencyScore * 0.7);

          analysis.smartSuggestions.push({
            targetAccount: {
              code: targetAccount.entity_code,
              name: targetAccount.entity_name,
              type: 'Unknown' // Could get from dynamic data
            },
            confidence,
            reason: `Frequently used together (${pairData.frequency} transactions)`,
            basedOn: 'transaction_pattern',
            frequency: pairData.frequency,
            averageAmount: pairData.totalAmount / pairData.frequency,
            lastUsed: pairData.lastUsed,
            examples: pairData.examples
          });
        }
      } else {
        // Get general suggestions based on industry standards
        const industryStandards = [
          {
            sourcePattern: '1001000', // Cash
            suggestions: [
              { code: '4001000', name: 'Food Sales Revenue', reason: 'Daily cash sales are common in restaurants' },
              { code: '6004000', name: 'Rent - Restaurant Space', reason: 'Monthly rent payments typically made in cash' },
              { code: '1003000', name: 'Food Inventory', reason: 'Cash purchases of inventory' }
            ]
          },
          {
            sourcePattern: '5001000', // Food Cost
            suggestions: [
              { code: '1003000', name: 'Food Inventory', reason: 'Food cost comes from inventory usage' },
              { code: '2001000', name: 'Accounts Payable - Food Suppliers', reason: 'Food purchases create payables' }
            ]
          }
        ];

        for (const standard of industryStandards) {
          if (accounts?.some(acc => acc.entity_code === standard.sourcePattern)) {
            for (const suggestion of standard.suggestions) {
              if (accounts?.some(acc => acc.entity_code === suggestion.code)) {
                analysis.smartSuggestions.push({
                  targetAccount: {
                    code: suggestion.code,
                    name: suggestion.name,
                    type: 'Standard'
                  },
                  confidence: 0.8,
                  reason: suggestion.reason,
                  basedOn: 'industry_standard',
                  frequency: 0,
                  averageAmount: 0,
                  lastUsed: 'Never',
                  examples: ['Industry best practice']
                });
              }
            }
          }
        }
      }
    }

    // 2. ACCOUNT CLUSTERS
    if (analysisType === 'clusters' || analysisType === 'all') {
      // Group accounts that frequently appear together
      const clusters = new Map<string, Set<string>>();
      
      for (const transaction of transactions || []) {
        const entries = transaction.transaction_data?.entries || [];
        const accountCodes = entries.map(e => e.account_code).sort();
        
        if (accountCodes.length >= 2) {
          const clusterKey = accountCodes.join('-');
          
          if (!clusters.has(clusterKey)) {
            clusters.set(clusterKey, new Set(accountCodes));
          }
        }
      }

      // Convert to cluster objects
      const clusterArray = Array.from(clusters.entries())
        .filter(([, accountSet]) => accountSet.size >= 2)
        .map(([key, accountSet], index) => {
          const accountArray = Array.from(accountSet);
          const frequency = Array.from(accountPairs.entries())
            .filter(([pairKey]) => {
              const [a1, a2] = pairKey.split('-');
              return accountArray.includes(a1) && accountArray.includes(a2);
            })
            .reduce((sum, [, data]) => sum + data.frequency, 0);

          // Determine cluster usage pattern
          let commonUsage = 'Mixed transactions';
          if (accountArray.some(acc => acc.startsWith('1')) && accountArray.some(acc => acc.startsWith('4'))) {
            commonUsage = 'Sales transactions';
          } else if (accountArray.some(acc => acc.startsWith('5')) && accountArray.some(acc => acc.startsWith('1'))) {
            commonUsage = 'Expense transactions';
          }

          return {
            clusterId: `cluster_${index + 1}`,
            clusterName: `Account Cluster ${index + 1}`,
            accounts: accountArray,
            commonUsage,
            strength: Math.min(frequency / 10, 1),
            recommendedActions: [
              'Consider creating templates for these common transactions',
              'Set up automated journal entry rules',
              'Monitor this cluster for unusual patterns'
            ]
          };
        })
        .sort((a, b) => b.strength - a.strength);

      analysis.accountClusters = clusterArray.slice(0, 5); // Top 5 clusters
    }

    console.log('✅ GL account relationships analysis completed');

    return NextResponse.json({
      data: {
        smartSuggestions: analysis.smartSuggestions,
        accountClusters: analysis.accountClusters,
        existingRelationships: existingRelationships?.length || 0
      },
      metadata: {
        analysisType,
        sourceAccount: sourceAccountCode,
        generatedAt: new Date().toISOString(),
        phaseLevel: 2,
        capabilities: [
          'Smart account suggestions',
          'Transaction pattern recognition', 
          'Account clustering',
          'Relationship strength scoring',
          'Industry standard recommendations'
        ]
      },
      success: true
    });

  } catch (error) {
    console.error('❌ GL account relationships error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/finance/gl-accounts/relationships
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { organizationId, sourceAccountCode, targetAccountCode, relationshipType, metadata } = body;

    if (!organizationId || !sourceAccountCode || !targetAccountCode) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, sourceAccountCode, targetAccountCode' },
        { status: 400 }
      );
    }

    console.log('🔗 Creating GL account relationship:', sourceAccountCode, '->', targetAccountCode);

    // CORE PATTERN: Get source and target account entities
    const { data: sourceAccount } = await supabase
      .from('core_entities')
      .select('id')
      .eq('organization_id', organizationId) // SACRED
      .eq('entity_type', 'chart_of_account')
      .eq('entity_code', sourceAccountCode)
      .single();

    const { data: targetAccount } = await supabase
      .from('core_entities')
      .select('id')
      .eq('organization_id', organizationId) // SACRED
      .eq('entity_type', 'chart_of_account') 
      .eq('entity_code', targetAccountCode)
      .single();

    if (!sourceAccount || !targetAccount) {
      return NextResponse.json(
        { error: 'One or both accounts not found' },
        { status: 404 }
      );
    }

    // CORE PATTERN: Create relationship in core_relationships
    const relationshipTypeId = crypto.randomUUID(); // Generate UUID for relationship type
    
    const relationshipData = {
      organization_id: organizationId, // SACRED
      relationship_type_id: relationshipTypeId,
      relationship_type: 'gl_account_pattern',
      relationship_subtype: relationshipType || 'transaction_pair',
      relationship_name: `GL Account Pattern: ${sourceAccountCode} - ${targetAccountCode}`,
      relationship_code: `GL_${sourceAccountCode}_${targetAccountCode}`,
      parent_entity_id: sourceAccount.id,
      child_entity_id: targetAccount.id,
      relationship_metadata: {
        source_account_code: sourceAccountCode,
        target_account_code: targetAccountCode,
        created_by: 'gl_intelligence_system',
        ...metadata
      },
      is_active: true,
      created_by: crypto.randomUUID()  // System-generated relationship
    };

    const { data: relationship, error: relationshipError } = await supabase
      .from('core_relationships')
      .insert(relationshipData)
      .select()
      .single();

    if (relationshipError) {
      console.error('❌ Error creating relationship:', relationshipError);
      console.error('❌ Relationship data:', JSON.stringify(relationshipData, null, 2));
      return NextResponse.json(
        { error: 'Failed to create account relationship', details: relationshipError },
        { status: 500 }
      );
    }

    console.log('✅ GL account relationship created successfully');

    return NextResponse.json({
      success: true,
      data: {
        relationshipId: relationship.id,
        sourceAccountCode,
        targetAccountCode,
        relationshipType: relationshipType || 'transaction_pair'
      },
      message: 'Account relationship created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ GL account relationship creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}