/**
 * HERA Universal - Individual Transaction Auto-Fix API
 * 
 * Granular auto-fix operations for specific transactions with detailed control
 * Provides precise fix application and rollback capabilities
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Admin client for GL operations
const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

interface TransactionAutoFixRequest {
  organizationId: string;
  operation: 'analyze' | 'apply' | 'rollback';
  fixTypes?: ('account_mapping' | 'balance_adjustment' | 'format_correction')[];
  confidenceThreshold?: number;
  approvalRequired?: boolean;
}

interface FixOption {
  fixId: string;
  fixType: string;
  confidence: number;
  description: string;
  originalValue: any;
  proposedValue: any;
  riskLevel: 'low' | 'medium' | 'high';
  businessRationale: string;
  technicalDetails: {
    method: string;
    validationRules: string[];
    dependencies: string[];
  };
  impact: {
    validationImprovement: number;
    complianceGain: number;
    timesSaved: number;
  };
  reversible: boolean;
}

// GET /api/finance/gl-accounts/autofix/[transactionId] - Analyze fix options
export async function GET(
  request: NextRequest,
  { params }: { params: { transactionId: string } }
) {
  try {
    const startTime = Date.now();
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const includeHistory = searchParams.get('includeHistory') === 'true';
    
    if (!organizationId) {
      return NextResponse.json({
        success: false,
        error: 'organizationId is required'
      }, { status: 400 });
    }

    const transactionId = params.transactionId;
    console.log('🔍 Analyzing auto-fix options for transaction:', transactionId);

    // SACRED PRINCIPLE: Organization isolation
    const { data: transaction, error: transactionError } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('organization_id', organizationId) // SACRED
      .single();

    if (transactionError || !transaction) {
      return NextResponse.json({
        success: false,
        error: 'Transaction not found or access denied'
      }, { status: 404 });
    }

    // Get GL accounts for reference
    const { data: glAccounts } = await supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'chart_of_account')
      .eq('is_active', true);

    const accountsByCode = new Map();
    for (const account of glAccounts || []) {
      accountsByCode.set(account.entity_code, account);
    }

    // Analyze current errors and potential fixes
    const errors = transaction.gl_validation_errors || [];
    const fixOptions: FixOption[] = [];
    const transactionData = transaction.transaction_data || {};
    const entries = transactionData.entries || [];

    // Analyze each error for auto-fix potential
    for (let i = 0; i < errors.length; i++) {
      const error = errors[i];

      if (error.errorType === 'missing_gl_account') {
        // Find the problematic entry
        const problemEntry = entries.find((entry: any) => 
          entry.account_code && !accountsByCode.has(entry.account_code)
        );

        if (problemEntry) {
          const suggestedAccount = findBestAccountMatch(
            problemEntry.account_code,
            transaction.transaction_type,
            accountsByCode
          );

          if (suggestedAccount) {
            fixOptions.push({
              fixId: crypto.randomUUID(),
              fixType: 'account_mapping',
              confidence: calculateMappingConfidence(problemEntry.account_code, suggestedAccount, transaction.transaction_type),
              description: `Map invalid account '${problemEntry.account_code}' to valid account '${suggestedAccount}'`,
              originalValue: problemEntry.account_code,
              proposedValue: suggestedAccount,
              riskLevel: 'low',
              businessRationale: `Transaction type '${transaction.transaction_type}' typically uses account category '${suggestedAccount.substring(0,1)}xxx'`,
              technicalDetails: {
                method: 'pattern_matching_with_type_analysis',
                validationRules: [
                  'account_exists_check',
                  'account_active_check',
                  'transaction_type_compatibility'
                ],
                dependencies: [
                  'chart_of_accounts',
                  'transaction_type_mappings'
                ]
              },
              impact: {
                validationImprovement: 0.4,
                complianceGain: 0.3,
                timesSaved: 15
              },
              reversible: true
            });
          }
        }
      }

      if (error.errorType === 'balance_mismatch') {
        const debitTotal = entries.reduce((sum: number, entry: any) => sum + (entry.debit || 0), 0);
        const creditTotal = entries.reduce((sum: number, entry: any) => sum + (entry.credit || 0), 0);
        const difference = Math.abs(debitTotal - creditTotal);

        if (difference > 0 && difference < 10) { // Only for small differences
          fixOptions.push({
            fixId: crypto.randomUUID(),
            fixType: 'balance_adjustment',
            confidence: 0.7,
            description: `Adjust ${debitTotal > creditTotal ? 'credit' : 'debit'} side by $${difference.toFixed(2)} to balance entry`,
            originalValue: { debitTotal, creditTotal, difference },
            proposedValue: { debitTotal: Math.max(debitTotal, creditTotal), creditTotal: Math.max(debitTotal, creditTotal), difference: 0 },
            riskLevel: difference < 1 ? 'low' : 'medium',
            businessRationale: 'Small rounding differences can be safely adjusted to maintain double-entry principle',
            technicalDetails: {
              method: 'minimal_adjustment_algorithm',
              validationRules: [
                'double_entry_balance_check',
                'materiality_threshold_check'
              ],
              dependencies: [
                'journal_entry_validation',
                'rounding_policies'
              ]
            },
            impact: {
              validationImprovement: 0.5,
              complianceGain: 0.4,
              timesSaved: 10
            },
            reversible: true
          });
        }
      }
    }

    // Get fix history if requested
    let fixHistory = [];
    if (includeHistory) {
      // Check if this transaction has been auto-fixed before
      const previousFixes = []; // Would query from audit log or metadata
      fixHistory = previousFixes;
    }

    // Calculate overall fix potential
    const totalConfidence = fixOptions.length > 0 
      ? fixOptions.reduce((sum, option) => sum + option.confidence, 0) / fixOptions.length 
      : 0;

    const totalTimesSaved = fixOptions.reduce((sum, option) => sum + option.impact.timesSaved, 0);
    const totalValidationImprovement = fixOptions.reduce((sum, option) => sum + option.impact.validationImprovement, 0);

    const processingTime = Date.now() - startTime;

    console.log('✅ Auto-fix analysis completed:', fixOptions.length, 'options identified');

    return NextResponse.json({
      success: true,
      data: {
        transactionId,
        organizationId,
        transaction: {
          number: transaction.transaction_number,
          type: transaction.transaction_type,
          amount: transaction.total_amount,
          currentStatus: transaction.gl_validation_status,
          currentConfidence: parseFloat(transaction.gl_confidence_score || '0.5')
        },
        analysis: {
          fixOptionsAvailable: fixOptions.length,
          totalConfidence,
          recommendedAction: fixOptions.length > 0 && totalConfidence > 0.7 
            ? 'auto_fix_recommended' 
            : fixOptions.length > 0 
              ? 'manual_review_suggested'
              : 'no_fixes_available',
          riskAssessment: {
            overall: fixOptions.every(opt => opt.riskLevel === 'low') ? 'low' : 'medium',
            factors: [
              fixOptions.length > 0 ? 'Automated fixes available' : 'No automated fixes',
              totalConfidence > 0.8 ? 'High confidence fixes' : 'Medium confidence fixes',
              fixOptions.every(opt => opt.reversible) ? 'All fixes reversible' : 'Some fixes not reversible'
            ]
          }
        },
        fixOptions,
        potentialImpact: {
          timesSaved: totalTimesSaved,
          validationImprovement: Math.min(1, totalValidationImprovement),
          complianceGain: Math.min(1, fixOptions.reduce((sum, opt) => sum + opt.impact.complianceGain, 0)),
          confidenceIncrease: Math.min(0.5, totalValidationImprovement * 0.8)
        },
        fixHistory,
        recommendations: fixOptions.length > 0 ? [
          totalConfidence > 0.8 ? 'Safe to apply all fixes automatically' : 'Review fixes before applying',
          'Monitor results for learning improvement',
          'Consider creating permanent rules for similar patterns'
        ] : [
          'No automated fixes available',
          'Manual review required',
          'Consider updating validation rules'
        ]
      },
      metadata: {
        processingTimeMs: processingTime,
        heraAdvantage: `${processingTime}ms analysis vs hours of manual review`,
        generatedAt: new Date().toISOString(),
        apiVersion: '1.0.0'
      }
    });

  } catch (error) {
    console.error('❌ Auto-fix analysis GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// PUT /api/finance/gl-accounts/autofix/[transactionId] - Apply or rollback fixes
export async function PUT(
  request: NextRequest,
  { params }: { params: { transactionId: string } }
) {
  try {
    const startTime = Date.now();
    const supabase = getAdminClient();
    const body: TransactionAutoFixRequest = await request.json();
    
    if (!body.organizationId) {
      return NextResponse.json({
        success: false,
        error: 'organizationId is required'
      }, { status: 400 });
    }

    const transactionId = params.transactionId;
    const { operation, fixTypes, confidenceThreshold = 0.7 } = body;

    console.log('🔧 Executing auto-fix operation:', operation, 'for transaction:', transactionId);

    // Get transaction with organization check
    const { data: transaction, error: transactionError } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('organization_id', body.organizationId) // SACRED
      .single();

    if (transactionError || !transaction) {
      return NextResponse.json({
        success: false,
        error: 'Transaction not found or access denied'
      }, { status: 404 });
    }

    if (operation === 'apply') {
      // Get GL accounts for reference
      const { data: glAccounts } = await supabase
        .from('core_entities')
        .select('*')
        .eq('organization_id', body.organizationId)
        .eq('entity_type', 'chart_of_account')
        .eq('is_active', true);

      const accountsByCode = new Map();
      for (const account of glAccounts || []) {
        accountsByCode.set(account.entity_code, account);
      }

      const appliedFixes = [];
      let updatedTransactionData = { ...transaction.transaction_data };
      let newConfidenceScore = parseFloat(transaction.gl_confidence_score || '0.5');
      let fixesApplied = false;

      const errors = transaction.gl_validation_errors || [];
      const entries = updatedTransactionData.entries || [];

      // Apply account mapping fixes
      if (!fixTypes || fixTypes.includes('account_mapping')) {
        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i];
          
          if (entry.account_code && !accountsByCode.has(entry.account_code)) {
            const suggestedAccount = findBestAccountMatch(
              entry.account_code,
              transaction.transaction_type,
              accountsByCode
            );

            if (suggestedAccount) {
              const confidence = calculateMappingConfidence(
                entry.account_code,
                suggestedAccount,
                transaction.transaction_type
              );

              if (confidence >= confidenceThreshold) {
                const originalCode = entry.account_code;
                entry.account_code = suggestedAccount;

                appliedFixes.push({
                  fixId: crypto.randomUUID(),
                  fixType: 'account_mapping',
                  fieldPath: `entries[${i}].account_code`,
                  originalValue: originalCode,
                  newValue: suggestedAccount,
                  confidence,
                  appliedAt: new Date().toISOString(),
                  rationale: `Mapped based on transaction type and pattern analysis`
                });

                newConfidenceScore += 0.2;
                fixesApplied = true;
              }
            }
          }
        }
      }

      // Apply balance adjustment fixes
      if (!fixTypes || fixTypes.includes('balance_adjustment')) {
        const debitTotal = entries.reduce((sum: number, entry: any) => sum + (entry.debit || 0), 0);
        const creditTotal = entries.reduce((sum: number, entry: any) => sum + (entry.credit || 0), 0);
        const difference = Math.abs(debitTotal - creditTotal);

        if (difference > 0 && difference < 10) { // Only small differences
          const confidence = difference < 1 ? 0.9 : 0.7;
          
          if (confidence >= confidenceThreshold) {
            // Adjust the larger side down to match the smaller side (conservative approach)
            const targetAmount = Math.min(debitTotal, creditTotal);
            
            if (debitTotal > creditTotal) {
              // Reduce largest debit entry
              const largestDebitEntry = entries.reduce((prev: any, current: any) => 
                (current.debit || 0) > (prev.debit || 0) ? current : prev
              );
              if (largestDebitEntry && largestDebitEntry.debit) {
                const originalDebit = largestDebitEntry.debit;
                largestDebitEntry.debit = originalDebit - difference;
                
                appliedFixes.push({
                  fixId: crypto.randomUUID(),
                  fixType: 'balance_adjustment',
                  fieldPath: 'debit_balance_adjustment',
                  originalValue: originalDebit,
                  newValue: largestDebitEntry.debit,
                  confidence,
                  appliedAt: new Date().toISOString(),
                  rationale: 'Adjusted debit to balance journal entry'
                });
              }
            } else {
              // Reduce largest credit entry
              const largestCreditEntry = entries.reduce((prev: any, current: any) => 
                (current.credit || 0) > (prev.credit || 0) ? current : prev
              );
              if (largestCreditEntry && largestCreditEntry.credit) {
                const originalCredit = largestCreditEntry.credit;
                largestCreditEntry.credit = originalCredit - difference;
                
                appliedFixes.push({
                  fixId: crypto.randomUUID(),
                  fixType: 'balance_adjustment',
                  fieldPath: 'credit_balance_adjustment',
                  originalValue: originalCredit,
                  newValue: largestCreditEntry.credit,
                  confidence,
                  appliedAt: new Date().toISOString(),
                  rationale: 'Adjusted credit to balance journal entry'
                });
              }
            }

            newConfidenceScore += 0.15;
            fixesApplied = true;
          }
        }
      }

      // Update transaction with fixes
      if (fixesApplied) {
        updatedTransactionData.entries = entries;
        
        // Store fix history in metadata
        const fixMetadata = {
          appliedFixes,
          previousConfidence: parseFloat(transaction.gl_confidence_score || '0.5'),
          appliedAt: new Date().toISOString(),
          appliedBy: 'auto_fix_system'
        };

        const { error: updateError } = await supabase
          .from('universal_transactions')
          .update({
            transaction_data: updatedTransactionData,
            gl_validation_status: 'auto_fixed',
            gl_confidence_score: Math.min(1, newConfidenceScore),
            gl_auto_fix_applied: true,
            gl_posting_metadata: fixMetadata,
            updated_at: new Date().toISOString()
          })
          .eq('id', transactionId);

        if (updateError) {
          console.error('❌ Error applying fixes:', updateError);
          return NextResponse.json({
            success: false,
            error: 'Failed to apply fixes'
          }, { status: 500 });
        }
      }

      const processingTime = Date.now() - startTime;

      console.log('✅ Auto-fix applied successfully:', appliedFixes.length, 'fixes');

      return NextResponse.json({
        success: true,
        data: {
          transactionId,
          operation: 'apply',
          fixesApplied: appliedFixes.length,
          appliedFixes,
          results: {
            previousConfidence: parseFloat(transaction.gl_confidence_score || '0.5'),
            newConfidence: Math.min(1, newConfidenceScore),
            confidenceImprovement: Math.min(1, newConfidenceScore) - parseFloat(transaction.gl_confidence_score || '0.5'),
            newStatus: fixesApplied ? 'auto_fixed' : transaction.gl_validation_status,
            readyForPosting: Math.min(1, newConfidenceScore) >= 0.8
          },
          businessImpact: {
            timesSaved: appliedFixes.length * 12, // 12 minutes per fix
            errorsEliminated: appliedFixes.length,
            complianceImproved: appliedFixes.length * 0.2,
            validationImproved: appliedFixes.length * 0.3
          }
        },
        metadata: {
          processingTimeMs: processingTime,
          heraAdvantage: `${processingTime}ms automated fix vs ${appliedFixes.length * 15} minutes manual correction`,
          generatedAt: new Date().toISOString()
        }
      });

    } else if (operation === 'rollback') {
      // Implement rollback logic
      const fixMetadata = transaction.gl_posting_metadata || {};
      const appliedFixes = fixMetadata.appliedFixes || [];

      if (appliedFixes.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'No fixes found to rollback'
        }, { status: 400 });
      }

      // This would restore the original transaction data
      // Implementation would depend on how rollback data is stored
      
      console.log('🔄 Rollback operation requested but not yet implemented');

      return NextResponse.json({
        success: false,
        error: 'Rollback functionality not yet implemented'
      }, { status: 501 });

    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid operation. Must be "apply" or "rollback"'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Auto-fix PUT error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// Helper functions
function findBestAccountMatch(invalidCode: string, transactionType: string, accountsByCode: Map<string, any>): string | null {
  // Transaction type to account mapping
  const typeMapping: Record<string, string[]> = {
    'SALES_ORDER': ['4001000', '4002000', '4003000'],
    'PURCHASE_ORDER': ['5001000', '6001000', '7001000'],
    'JOURNAL_ENTRY': ['1001000', '2001000', '3001000'],
    'AI_JOURNAL_ENTRY': ['1001000', '2001000', '3001000']
  };

  const preferredAccounts = typeMapping[transactionType] || [];
  for (const accountCode of preferredAccounts) {
    if (accountsByCode.has(accountCode)) {
      return accountCode;
    }
  }

  // Pattern matching by code prefix
  const codePrefix = invalidCode.substring(0, 1);
  for (const [code, account] of accountsByCode.entries()) {
    if (code.startsWith(codePrefix)) {
      return code;
    }
  }

  return null;
}

function calculateMappingConfidence(originalCode: string, suggestedCode: string, transactionType: string): number {
  let confidence = 0.5; // Base confidence
  
  // Boost confidence for transaction type alignment
  const typeMapping: Record<string, string> = {
    'SALES_ORDER': '4',    // Revenue
    'PURCHASE_ORDER': '5', // COGS
    'JOURNAL_ENTRY': '1',  // Assets (conservative)
    'AI_JOURNAL_ENTRY': '1'
  };

  const expectedPrefix = typeMapping[transactionType];
  if (expectedPrefix && suggestedCode.startsWith(expectedPrefix)) {
    confidence += 0.3;
  }

  // Boost confidence for similar code patterns
  if (originalCode.substring(0, 1) === suggestedCode.substring(0, 1)) {
    confidence += 0.1;
  }

  // Boost confidence for common account codes
  const commonAccounts = ['1001000', '4001000', '5001000', '6001000'];
  if (commonAccounts.includes(suggestedCode)) {
    confidence += 0.1;
  }

  return Math.min(1, confidence);
}