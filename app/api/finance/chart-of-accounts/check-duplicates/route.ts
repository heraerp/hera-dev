/**
 * HERA Universal - Chart of Accounts Duplicate Detection
 * 
 * Advanced duplicate detection API with smart suggestions
 * Provides real-time feedback for account creation
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

interface DuplicateCheckRequest {
  organizationId: string;
  accountCodes?: string[];
  accountNames?: string[];
  checkSimilar?: boolean; // Check for similar names
  suggestAlternatives?: boolean; // Suggest alternative codes
}

interface DuplicateCheckResult {
  accountCode: string;
  status: 'available' | 'duplicate' | 'similar';
  existingAccount?: {
    id: string;
    name: string;
    code: string;
    type: string;
    isActive: boolean;
  };
  similarAccounts?: Array<{
    id: string;
    name: string;
    code: string;
    similarity: number;
  }>;
  suggestedAlternatives?: string[];
}

interface NameCheckResult {
  accountName: string;
  status: 'unique' | 'similar' | 'duplicate';
  similarAccounts?: Array<{
    id: string;
    name: string;
    code: string;
    similarity: number;
  }>;
  suggestion?: string;
}

// Calculate string similarity (Levenshtein distance)
const calculateSimilarity = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1.0;
  
  const len1 = s1.length;
  const len2 = s2.length;
  
  if (len1 === 0) return len2 === 0 ? 1.0 : 0.0;
  if (len2 === 0) return 0.0;
  
  const matrix: number[][] = [];
  
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,     // deletion
        matrix[i][j - 1] + 1,     // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  const maxLen = Math.max(len1, len2);
  return (maxLen - matrix[len1][len2]) / maxLen;
};

// Generate alternative account codes
const generateAlternativeCodes = (baseCode: string, existingCodes: Set<string>): string[] => {
  const alternatives: string[] = [];
  
  if (!/^\d{7}$/.test(baseCode)) {
    return alternatives;
  }
  
  const baseNum = parseInt(baseCode);
  
  // Try incrementing by 1, 10, 100
  const increments = [1, 10, 100, 1000];
  
  for (const increment of increments) {
    for (let i = 1; i <= 5; i++) {
      const newCode = (baseNum + (increment * i)).toString().padStart(7, '0');
      if (newCode.length === 7 && !existingCodes.has(newCode)) {
        alternatives.push(newCode);
        if (alternatives.length >= 5) break;
      }
    }
    if (alternatives.length >= 5) break;
  }
  
  return alternatives.slice(0, 3); // Return top 3 alternatives
};

// Get all existing accounts for organization
const getAllExistingAccounts = async (supabase: any, organizationId: string) => {
  const { data: entities, error } = await supabase
    .from('core_entities')
    .select('id, entity_name, entity_code, is_active')
    .eq('organization_id', organizationId)
    .eq('entity_type', 'chart_of_account');

  if (error) {
    throw new Error(`Failed to fetch existing accounts: ${error.message}`);
  }

  // Get dynamic data for account types
  const entityIds = entities?.map(e => e.id) || [];
  let dynamicData: any[] = [];
  
  if (entityIds.length > 0) {
    const { data: dynamicDataResult } = await supabase
      .from('core_dynamic_data')
      .select('entity_id, field_name, field_value')
      .in('entity_id', entityIds)
      .eq('field_name', 'account_type');
    
    dynamicData = dynamicDataResult || [];
  }

  // Map dynamic data
  const typeMap = dynamicData.reduce((acc, item) => {
    acc[item.entity_id] = item.field_value;
    return acc;
  }, {} as Record<string, string>);

  return (entities || []).map(entity => ({
    id: entity.id,
    name: entity.entity_name,
    code: entity.entity_code,
    type: typeMap[entity.id] || 'UNKNOWN',
    isActive: entity.is_active
  }));
};

// POST /api/finance/chart-of-accounts/check-duplicates
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body: DuplicateCheckRequest = await request.json();

    console.log('🔍 Duplicate Check Request:', {
      organizationId: body.organizationId,
      accountCodes: body.accountCodes?.length || 0,
      accountNames: body.accountNames?.length || 0,
      checkSimilar: body.checkSimilar,
      suggestAlternatives: body.suggestAlternatives
    });

    // Validate request
    if (!body.organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    if (!body.accountCodes && !body.accountNames) {
      return NextResponse.json(
        { error: 'Either accountCodes or accountNames must be provided' },
        { status: 400 }
      );
    }

    // Get all existing accounts
    const existingAccounts = await getAllExistingAccounts(supabase, body.organizationId);
    const existingCodes = new Set(existingAccounts.map(acc => acc.code));
    const existingNames = existingAccounts.map(acc => ({
      id: acc.id,
      name: acc.name,
      code: acc.code
    }));

    const results: {
      codeResults?: DuplicateCheckResult[];
      nameResults?: NameCheckResult[];
      summary: {
        totalChecked: number;
        duplicates: number;
        similar: number;
        available: number;
      };
    } = {
      summary: { totalChecked: 0, duplicates: 0, similar: 0, available: 0 }
    };

    // Check account codes
    if (body.accountCodes) {
      results.codeResults = [];
      
      for (const code of body.accountCodes) {
        const result: DuplicateCheckResult = {
          accountCode: code,
          status: 'available'
        };

        // Check exact duplicate
        if (existingCodes.has(code)) {
          const existingAccount = existingAccounts.find(acc => acc.code === code);
          result.status = 'duplicate';
          result.existingAccount = existingAccount;
          results.summary.duplicates++;
        } else {
          results.summary.available++;
          
          // Generate alternatives if requested
          if (body.suggestAlternatives) {
            result.suggestedAlternatives = generateAlternativeCodes(code, existingCodes);
          }
        }

        results.codeResults.push(result);
        results.summary.totalChecked++;
      }
    }

    // Check account names
    if (body.accountNames) {
      results.nameResults = [];
      
      for (const name of body.accountNames) {
        const result: NameCheckResult = {
          accountName: name,
          status: 'unique'
        };

        // Check for exact duplicate
        const exactMatch = existingNames.find(acc => 
          acc.name.toLowerCase().trim() === name.toLowerCase().trim()
        );

        if (exactMatch) {
          result.status = 'duplicate';
          result.similarAccounts = [{ ...exactMatch, similarity: 1.0 }];
        } else if (body.checkSimilar) {
          // Check for similar names
          const similarAccounts = existingNames
            .map(acc => ({
              ...acc,
              similarity: calculateSimilarity(name, acc.name)
            }))
            .filter(acc => acc.similarity > 0.7) // 70% similarity threshold
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 3);

          if (similarAccounts.length > 0) {
            result.status = 'similar';
            result.similarAccounts = similarAccounts;
            result.suggestion = `Similar to: ${similarAccounts[0].name}`;
            results.summary.similar++;
          }
        }

        results.nameResults.push(result);
        if (!body.accountCodes) results.summary.totalChecked++; // Only count if not already counted
      }
    }

    console.log('✅ Duplicate Check Completed:', results.summary);

    return NextResponse.json({
      success: true,
      data: results,
      message: `Checked ${results.summary.totalChecked} items: ${results.summary.duplicates} duplicates, ${results.summary.similar} similar, ${results.summary.available} available`
    });

  } catch (error) {
    console.error('❌ Duplicate Check error:', error);
    return NextResponse.json(
      { error: 'Internal server error during duplicate check' },
      { status: 500 }
    );
  }
}

// GET /api/finance/chart-of-accounts/check-duplicates (for simple code checks)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const accountCode = searchParams.get('accountCode');

    if (!organizationId || !accountCode) {
      return NextResponse.json(
        { error: 'organizationId and accountCode are required' },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();
    
    // Quick duplicate check
    const { data: existing } = await supabase
      .from('core_entities')
      .select('id, entity_name, entity_code')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'chart_of_account')
      .eq('entity_code', accountCode)
      .single();

    return NextResponse.json({
      accountCode,
      isDuplicate: !!existing,
      existingAccount: existing ? {
        id: existing.id,
        name: existing.entity_name,
        code: existing.entity_code
      } : null
    });

  } catch (error) {
    console.error('❌ GET Duplicate Check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}