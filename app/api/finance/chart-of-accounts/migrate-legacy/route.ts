/**
 * HERA Universal - Legacy Chart of Accounts Migration
 * 
 * Intelligent migration system for importing existing COA data
 * Supports CSV, Excel, JSON, and popular accounting software formats
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { claudeAI } from '@/utils/claude-ai-service';
import { COATemplateMatcher } from '@/utils/coa-template-matcher';

// Admin client for demo/testing purposes
const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

interface LegacyAccount {
  originalCode: string;
  originalName: string;
  originalType?: string;
  originalCategory?: string;
  description?: string;
  balance?: number;
  isActive?: boolean;
  parentCode?: string;
  level?: number;
}

interface MigrationRequest {
  organizationId: string;
  accounts: LegacyAccount[];
  migrationMode: 'preview' | 'execute';
  mappingStrategy: 'ai_smart' | 'code_based' | 'name_based' | 'custom';
  customMappings?: Record<string, string>; // originalCode -> newCode
  conflictResolution: 'skip' | 'merge' | 'rename' | 'fail';
  preserveStructure?: boolean; // Keep original hierarchy
}

interface MappedAccount {
  originalAccount: LegacyAccount;
  suggestedMapping: {
    accountCode: string;
    accountName: string;
    accountType: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'COST_OF_SALES' | 
                 'DIRECT_EXPENSE' | 'INDIRECT_EXPENSE' | 'TAX_EXPENSE' | 'EXTRAORDINARY_EXPENSE';
    description: string;
    confidence: number;
    reasoning: string;
  };
  conflicts?: string[];
  status: 'ready' | 'conflict' | 'manual_review';
}

interface MigrationResult {
  totalAccounts: number;
  mapped: number;
  conflicts: number;
  manualReview: number;
  mappedAccounts: MappedAccount[];
  summary: {
    byOriginalType: Record<string, number>;
    byNewType: Record<string, number>;
    confidenceDistribution: Record<string, number>;
  };
}

// AI-powered account type mapping
// Fast Path: Rule-based account type mapping
const mapAccountType = (originalType: string, accountName: string, balance?: number): {
  accountType: string;
  confidence: number;
  reasoning: string;
} => {
  const name = accountName.toLowerCase();
  const origType = originalType?.toLowerCase() || '';

  // High confidence mappings based on common patterns
  if (origType.includes('asset') || origType.includes('fixed assets') || origType.includes('plant') ||
      name.includes('cash') || name.includes('bank') || name.includes('receivable') || 
      name.includes('inventory') || name.includes('equipment') || name.includes('machinery') ||
      origType.includes('sundry debtors') || name.includes('debtors')) {
    return {
      accountType: 'ASSET',
      confidence: 0.95,
      reasoning: 'Common asset account patterns detected'
    };
  }

  if (origType.includes('liability') || origType.includes('liabilities') || 
      origType.includes('sundry creditors') || origType.includes('current liabilities') ||
      name.includes('payable') || name.includes('creditors') || name.includes('loan') || 
      name.includes('accrued') || name.includes('debt') || name.includes('deposit received') ||
      name.includes('deposit recieved') || name.includes('advance deposit') ||
      name.includes('advances from') || name.includes('unearned')) {
    return {
      accountType: 'LIABILITY', 
      confidence: 0.95,
      reasoning: 'Common liability account patterns detected'
    };
  }

  if (origType.includes('equity') || name.includes('capital') || name.includes('retained') || 
      name.includes('owner') || name.includes('stock')) {
    return {
      accountType: 'EQUITY',
      confidence: 0.95,
      reasoning: 'Common equity account patterns detected'
    };
  }

  if (origType.includes('revenue') || origType.includes('income') || name.includes('sales') || 
      name.includes('revenue') || name.includes('income') || (balance && balance < 0)) {
    return {
      accountType: 'REVENUE',
      confidence: 0.90,
      reasoning: 'Revenue patterns or credit balance detected'
    };
  }

  if (name.includes('cost of') || name.includes('cogs') || name.includes('cost of goods') ||
      name.includes('food cost') || name.includes('beverage cost') || name.includes('materials')) {
    return {
      accountType: 'COST_OF_SALES',
      confidence: 0.92,
      reasoning: 'Cost of sales patterns detected'
    };
  }

  if (origType.includes('expense') || name.includes('expense') || name.includes('wages') || 
      name.includes('salary') || name.includes('rent') || name.includes('utilities') || 
      (balance && balance > 0)) {
    if (name.includes('tax') || name.includes('fica') || name.includes('payroll tax')) {
      return {
        accountType: 'TAX_EXPENSE',
        confidence: 0.94,
        reasoning: 'Tax-related expense detected'
      };
    }
    
    if (name.includes('marketing') || name.includes('insurance') || name.includes('office') || 
        name.includes('administrative')) {
      return {
        accountType: 'INDIRECT_EXPENSE',
        confidence: 0.88,
        reasoning: 'Indirect expense patterns detected'
      };
    }
    
    return {
      accountType: 'DIRECT_EXPENSE',
      confidence: 0.85,
      reasoning: 'General expense patterns detected'
    };
  }

  // Default fallback
  return {
    accountType: 'DIRECT_EXPENSE',
    confidence: 0.50,
    reasoning: 'Default mapping - requires manual review'
  };
};

// Smart Path: Enhanced mapping with Claude AI for complex cases
const mapAccountTypeWithAI = async (
  account: LegacyAccount, 
  businessType: string = 'restaurant',
  existingAccounts?: Array<{code: string; name: string; type: string}>
): Promise<{
  accountType: string;
  accountCode?: string;
  accountName?: string;
  confidence: number;
  reasoning: string;
  aiEnhanced: boolean;
}> => {
  
  // First try fast path (rule-based)
  const fastResult = mapAccountType(account.originalType || '', account.originalName, account.balance);
  
  // If confidence is high enough, use fast path
  if (fastResult.confidence >= 0.75) {
    console.log('✅ Fast Path: High confidence mapping for', account.originalName);
    return {
      ...fastResult,
      aiEnhanced: false
    };
  }

  // For low confidence cases, try Claude AI (smart path)
  console.log('🧠 Smart Path: Using Claude AI for complex account:', account.originalName);
  
  try {
    const aiResult = await claudeAI.mapAccount({
      originalCode: account.originalCode,
      originalName: account.originalName,
      originalType: account.originalType,
      description: account.description,
      balance: account.balance,
      businessType: businessType,
      existingAccounts: existingAccounts
    });

    if (aiResult && aiResult.confidence > fastResult.confidence) {
      console.log('✅ Smart Path: Claude AI improved confidence from', fastResult.confidence, 'to', aiResult.confidence);
      return {
        accountType: aiResult.accountType,
        accountCode: aiResult.accountCode,
        accountName: aiResult.accountName,
        confidence: aiResult.confidence,
        reasoning: aiResult.reasoning,
        aiEnhanced: true
      };
    }
  } catch (error) {
    console.error('❌ Claude AI mapping failed:', error);
  }

  // Fallback to fast path if AI fails or doesn't improve confidence
  console.log('⚠️ Smart Path failed, using fast path result');
  return {
    ...fastResult,
    aiEnhanced: false
  };
};

// Generate HERA account code based on type and sequence
const generateHeraAccountCode = (accountType: string, sequence: number, existingCodes: Set<string>): string => {
  const baseRanges = {
    'ASSET': 1000000,
    'LIABILITY': 2000000,
    'EQUITY': 3000000,
    'REVENUE': 4000000,
    'COST_OF_SALES': 5000000,
    'DIRECT_EXPENSE': 6000000,
    'INDIRECT_EXPENSE': 7000000,
    'TAX_EXPENSE': 8000000,
    'EXTRAORDINARY_EXPENSE': 9000000
  };

  const baseCode = baseRanges[accountType as keyof typeof baseRanges] || 6000000;
  
  // Try different increments to find available code
  const increments = [1000, 100, 10, 1];
  
  for (const increment of increments) {
    for (let i = 0; i < 100; i++) {
      const candidateCode = (baseCode + (sequence * increment) + i).toString().padStart(7, '0');
      if (candidateCode.length === 7 && !existingCodes.has(candidateCode)) {
        existingCodes.add(candidateCode);
        return candidateCode;
      }
    }
  }

  // Fallback to simple increment
  const fallbackCode = (baseCode + Math.floor(Math.random() * 999999)).toString().padStart(7, '0');
  existingCodes.add(fallbackCode);
  return fallbackCode;
};

// Load COA template for intelligent matching
const loadCOATemplate = async (
  supabase: any,
  businessType: string
): Promise<any | null> => {
  try {
    console.log('📚 Loading COA template for business type:', businessType);
    
    // Find template entity
    const { data: templateEntity } = await supabase
      .from('core_entities')
      .select('id, entity_code, entity_name, created_at')
      .eq('organization_id', '00000000-0000-0000-0000-000000000001') // System org
      .eq('entity_type', 'coa_template')
      .ilike('entity_code', `CLAUDE_${businessType.toUpperCase().replace(/\s+/g, '_')}_COA_V%`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!templateEntity) {
      console.log('⚠️ No template found for business type:', businessType);
      return null;
    }

    // Get template data
    const { data: templateData } = await supabase
      .from('core_dynamic_data')
      .select('field_name, field_value')
      .eq('entity_id', templateEntity.id);

    if (!templateData || templateData.length === 0) {
      console.log('⚠️ No template data found');
      return null;
    }

    // Reconstruct template
    const accounts: any[] = [];
    let metadata: any = null;

    templateData.forEach((field: any) => {
      if (field.field_name === 'template_metadata') {
        metadata = JSON.parse(field.field_value);
      } else if (field.field_name.startsWith('account_')) {
        accounts.push(JSON.parse(field.field_value));
      }
    });

    const template = {
      templateId: templateEntity.entity_code,
      businessType,
      accounts,
      metadata,
      loadedAt: new Date().toISOString()
    };

    console.log('✅ Loaded template with', accounts.length, 'accounts:', template.templateId);
    return template;
  } catch (error) {
    console.error('❌ Failed to load COA template:', error);
    return null;
  }
};

// Enhanced account mapping with template-based intelligence + hybrid AI
const mapAccountsWithTemplate = async (
  accounts: LegacyAccount[],
  strategy: string,
  customMappings: Record<string, string> = {},
  existingCodes: Set<string>,
  businessType: string = 'restaurant',
  supabase: any
): Promise<MappedAccount[]> => {
  const mappedAccounts: MappedAccount[] = [];
  
  // Try to load template first
  const template = await loadCOATemplate(supabase, businessType);
  let templateMatcher: COATemplateMatcher | null = null;
  
  if (template) {
    templateMatcher = new COATemplateMatcher();
    await templateMatcher.loadTemplate(template);
    console.log('🎯 Using template-based matching for', accounts.length, 'accounts');
  } else {
    console.log('⚠️ No template available, falling back to hybrid AI mapping');
  }

  // Process each account
  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];
    let mappedAccount: MappedAccount;

    console.log(`\n🔄 Processing account ${i + 1}/${accounts.length}: "${account.originalName}"`);

    // Check for custom mapping first
    if (customMappings[account.originalCode]) {
      const customCode = customMappings[account.originalCode];
      const typeMapping = mapAccountType(account.originalType || '', account.originalName, account.balance);
      
      mappedAccount = {
        originalAccount: account,
        suggestedMapping: {
          accountCode: customCode,
          accountName: account.originalName,
          accountType: typeMapping.accountType as any,
          description: account.description || `Migrated from ${account.originalCode}`,
          confidence: 1.0,
          reasoning: 'Custom mapping provided by user'
        },
        status: existingCodes.has(customCode) ? 'conflict' : 'ready'
      };
    } else if (templateMatcher) {
      // Template-based matching (preferred method)
      try {
        const templateMatches = await templateMatcher.matchAccount({
          name: account.originalName,
          type: account.originalType,
          description: account.description,
          originalCode: account.originalCode
        });

        if (templateMatches.length > 0) {
          const bestMatch = templateMatches[0];
          
          console.log(`✅ Template match: "${bestMatch.account.accountName}" (${bestMatch.confidence.toFixed(2)} confidence)`);
          
          mappedAccount = {
            originalAccount: account,
            suggestedMapping: {
              accountCode: bestMatch.account.accountCode,
              accountName: bestMatch.account.accountName,
              accountType: bestMatch.account.accountType as any,
              description: bestMatch.account.description + ` (Template-based match)`,
              confidence: bestMatch.confidence,
              reasoning: `Template match: ${bestMatch.reasoning}`
            },
            status: bestMatch.confidence > 0.8 ? 'ready' : 'manual_review'
          };
        } else {
          // Fallback to hybrid AI if no template match
          console.log('⚠️ No template match found, using hybrid AI fallback');
          const typeMapping = await mapAccountTypeWithAI(account, businessType);
          
          mappedAccount = {
            originalAccount: account,
            suggestedMapping: {
              accountCode: generateHeraAccountCode(typeMapping.accountType, i + 1, existingCodes),
              accountName: typeMapping.accountName || account.originalName,
              accountType: typeMapping.accountType as any,
              description: account.description || `Migrated from ${account.originalCode} (AI fallback)`,
              confidence: typeMapping.confidence,
              reasoning: typeMapping.reasoning + ' (AI fallback after no template match)'
            },
            status: typeMapping.confidence > 0.75 ? 'ready' : 'manual_review'
          };
        }
      } catch (error) {
        console.error('❌ Template matching failed:', error);
        
        // Fallback to hybrid AI
        const typeMapping = await mapAccountTypeWithAI(account, businessType);
        
        mappedAccount = {
          originalAccount: account,
          suggestedMapping: {
            accountCode: generateHeraAccountCode(typeMapping.accountType, i + 1, existingCodes),
            accountName: typeMapping.accountName || account.originalName,
            accountType: typeMapping.accountType as any,
            description: account.description || `Migrated from ${account.originalCode} (AI fallback)`,
            confidence: typeMapping.confidence,
            reasoning: typeMapping.reasoning + ' (AI fallback after template error)'
          },
          status: typeMapping.confidence > 0.75 ? 'ready' : 'manual_review'
        };
      }
    } else {
      // No template available - use original hybrid AI approach
      console.log('🔧 Using original hybrid AI approach (no template)');
      const typeMapping = await mapAccountTypeWithAI(account, businessType);
      
      mappedAccount = {
        originalAccount: account,
        suggestedMapping: {
          accountCode: typeMapping.accountCode || generateHeraAccountCode(typeMapping.accountType, i + 1, existingCodes),
          accountName: typeMapping.accountName || account.originalName,
          accountType: typeMapping.accountType as any,
          description: account.description || `Migrated from ${account.originalCode}${typeMapping.aiEnhanced ? ' (AI Enhanced)' : ''}`,
          confidence: typeMapping.confidence,
          reasoning: typeMapping.reasoning
        },
        status: typeMapping.confidence < 0.75 ? 'manual_review' : 'ready'
      };
    }

    // Check for conflicts
    if (existingCodes.has(mappedAccount.suggestedMapping.accountCode) && !customMappings[account.originalCode]) {
      mappedAccount.status = 'conflict';
      mappedAccount.conflicts = ['Account code already exists'];
      console.log(`⚠️ Conflict detected: ${mappedAccount.suggestedMapping.accountCode} already exists`);
    } else {
      existingCodes.add(mappedAccount.suggestedMapping.accountCode);
    }

    mappedAccounts.push(mappedAccount);
  }

  // Log summary
  const templateMapped = mappedAccounts.filter(m => m.suggestedMapping.reasoning.includes('Template')).length;
  const aiMapped = mappedAccounts.filter(m => m.suggestedMapping.reasoning.includes('AI')).length;
  
  console.log(`\n📊 Mapping summary: ${templateMapped} template-based, ${aiMapped} AI-based, ${mappedAccounts.length - templateMapped - aiMapped} rule-based`);

  return mappedAccounts;
};

// Legacy function for backwards compatibility
const mapAccounts = async (
  accounts: LegacyAccount[], 
  strategy: string,
  customMappings: Record<string, string> = {},
  existingCodes: Set<string>,
  businessType: string = 'restaurant'
): Promise<MappedAccount[]> => {
  const mappedAccounts: MappedAccount[] = [];
  const typeCounters: Record<string, number> = {};

  for (const account of accounts) {
    let mappedAccount: MappedAccount;

    // Check for custom mapping first
    if (customMappings[account.originalCode]) {
      const customCode = customMappings[account.originalCode];
      const typeMapping = mapAccountType(account.originalType || '', account.originalName, account.balance);
      
      mappedAccount = {
        originalAccount: account,
        suggestedMapping: {
          accountCode: customCode,
          accountName: account.originalName,
          accountType: typeMapping.accountType as any,
          description: account.description || `Migrated from ${account.originalCode}`,
          confidence: 1.0,
          reasoning: 'Custom mapping provided by user'
        },
        status: existingCodes.has(customCode) ? 'conflict' : 'ready'
      };
    } else {
      // Hybrid AI-powered mapping (Fast Path + Smart Path)
      const typeMapping = await mapAccountTypeWithAI(
        account, 
        businessType,
        Array.from(existingCodes).map(code => ({
          code,
          name: `Existing Account ${code}`, // Would fetch actual names in real implementation
          type: 'UNKNOWN'
        }))
      );
      
      // Initialize counter for this type
      if (!typeCounters[typeMapping.accountType]) {
        typeCounters[typeMapping.accountType] = 0;
      }
      typeCounters[typeMapping.accountType]++;

      // Use AI-suggested account code if available, otherwise generate new one
      const newCode = typeMapping.accountCode || generateHeraAccountCode(
        typeMapping.accountType,
        typeCounters[typeMapping.accountType],
        existingCodes
      );

      // Use AI-enhanced account name if available
      const enhancedName = typeMapping.accountName || account.originalName;

      mappedAccount = {
        originalAccount: account,
        suggestedMapping: {
          accountCode: newCode,
          accountName: enhancedName,
          accountType: typeMapping.accountType as any,
          description: account.description || `Migrated from ${account.originalCode} - ${enhancedName}${typeMapping.aiEnhanced ? ' (AI Enhanced)' : ''}`,
          confidence: typeMapping.confidence,
          reasoning: typeMapping.reasoning
        },
        status: typeMapping.confidence < 0.75 ? 'manual_review' : 'ready'
      };
    }

    // Check for conflicts
    if (existingCodes.has(mappedAccount.suggestedMapping.accountCode) && !customMappings[account.originalCode]) {
      mappedAccount.status = 'conflict';
      mappedAccount.conflicts = ['Account code already exists'];
    }

    mappedAccounts.push(mappedAccount);
  }

  return mappedAccounts;
};

// POST /api/finance/chart-of-accounts/migrate-legacy
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body: MigrationRequest = await request.json();

    console.log('🔄 Legacy COA Migration Request:', {
      organizationId: body.organizationId,
      accountCount: body.accounts?.length || 0,
      migrationMode: body.migrationMode,
      mappingStrategy: body.mappingStrategy
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
        { error: 'No accounts provided for migration' },
        { status: 400 }
      );
    }

    if (body.accounts.length > 500) {
      return NextResponse.json(
        { error: 'Maximum 500 accounts can be migrated at once' },
        { status: 400 }
      );
    }

    // Get existing account codes to avoid conflicts
    const { data: existingAccounts } = await supabase
      .from('core_entities')
      .select('entity_code')
      .eq('organization_id', body.organizationId)
      .eq('entity_type', 'chart_of_account');

    const existingCodes = new Set(existingAccounts?.map(acc => acc.entity_code) || []);

    // Perform intelligent mapping with template-based matching + hybrid AI
    const mappedAccounts = await mapAccountsWithTemplate(
      body.accounts,
      body.mappingStrategy,
      body.customMappings,
      existingCodes,
      'restaurant', // TODO: Get business type from organization profile
      supabase
    );

    // Calculate summary statistics
    const summary = {
      byOriginalType: body.accounts.reduce((acc, account) => {
        const type = account.originalType || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      
      byNewType: mappedAccounts.reduce((acc, mapped) => {
        const type = mapped.suggestedMapping.accountType;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      
      confidenceDistribution: mappedAccounts.reduce((acc, mapped) => {
        const range = mapped.suggestedMapping.confidence >= 0.9 ? 'High (90%+)' :
                     mapped.suggestedMapping.confidence >= 0.7 ? 'Medium (70-89%)' : 'Low (<70%)';
        acc[range] = (acc[range] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    const result: MigrationResult = {
      totalAccounts: body.accounts.length,
      mapped: mappedAccounts.filter(m => m.status === 'ready').length,
      conflicts: mappedAccounts.filter(m => m.status === 'conflict').length,
      manualReview: mappedAccounts.filter(m => m.status === 'manual_review').length,
      mappedAccounts,
      summary
    };

    // If preview mode, return mapping results
    if (body.migrationMode === 'preview') {
      console.log('✅ Migration Preview Generated:', {
        total: result.totalAccounts,
        ready: result.mapped,
        conflicts: result.conflicts,
        review: result.manualReview
      });

      return NextResponse.json({
        success: true,
        data: result,
        message: `Migration preview: ${result.mapped} ready, ${result.conflicts} conflicts, ${result.manualReview} need review`
      });
    }

    // Execute migration for accounts marked as ready
    const readyAccounts = mappedAccounts
      .filter(m => m.status === 'ready')
      .map(m => ({
        accountName: m.suggestedMapping.accountName,
        accountCode: m.suggestedMapping.accountCode,
        accountType: m.suggestedMapping.accountType,
        description: m.suggestedMapping.description,
        isActive: m.originalAccount.isActive ?? true,
        allowPosting: true,
        currency: 'USD',
        openingBalance: m.originalAccount.balance || 0,
        taxDeductible: false,
        notes: `Migrated from legacy system. Original code: ${m.originalAccount.originalCode}`
      }));

    // Use existing bulk creation API
    const bulkCreateResponse = await fetch(`${request.url.replace('/migrate-legacy', '/bulk-create')}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organizationId: body.organizationId,
        accounts: readyAccounts
      })
    });

    if (!bulkCreateResponse.ok) {
      throw new Error('Failed to execute bulk account creation');
    }

    const bulkResult = await bulkCreateResponse.json();

    console.log('✅ Legacy Migration Executed:', {
      requested: readyAccounts.length,
      created: bulkResult.data.created,
      skipped: bulkResult.data.skipped,
      failed: bulkResult.data.failed
    });

    return NextResponse.json({
      success: true,
      data: {
        migrationResult: result,
        bulkCreationResult: bulkResult.data,
        conflictsRequiringAttention: mappedAccounts.filter(m => 
          m.status === 'conflict' || m.status === 'manual_review'
        )
      },
      message: `Migration completed: ${bulkResult.data.created} accounts created, ${result.conflicts + result.manualReview} require attention`
    });

  } catch (error) {
    console.error('❌ Legacy Migration error:', error);
    return NextResponse.json(
      { error: 'Internal server error during migration' },
      { status: 500 }
    );
  }
}