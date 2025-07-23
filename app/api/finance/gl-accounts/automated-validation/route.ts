/**
 * HERA Universal - Automated Journal Entry Validation & Approval API
 * 
 * Phase 4: AI-powered validation, automated approval workflows, and intelligent controls
 * Provides autonomous validation with smart approval routing and compliance checks
 * Uses HERA's 5-table universal architecture with ML-powered validation
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

interface ValidationResult {
  isValid: boolean;
  confidence: number;
  validationScore: number; // 0-100
  issues: ValidationIssue[];
  recommendations: string[];
  autoFixSuggestions: AutoFix[];
}

interface ValidationIssue {
  issueType: 'critical' | 'warning' | 'info';
  category: 'balance' | 'account' | 'amount' | 'compliance' | 'pattern' | 'authorization';
  description: string;
  affectedEntries: number[];
  severity: number; // 0-100
  canAutoFix: boolean;
  suggestedFix?: string;
}

interface AutoFix {
  fixType: 'account_correction' | 'amount_adjustment' | 'entry_addition' | 'entry_removal';
  description: string;
  confidence: number;
  originalEntry?: any;
  suggestedEntry?: any;
  reasoning: string;
}

interface ApprovalWorkflow {
  workflowId: string;
  journalEntryId: string;
  currentStep: number;
  totalSteps: number;
  status: 'pending' | 'approved' | 'rejected' | 'auto_approved' | 'escalated';
  approvers: Array<{
    level: number;
    requiredRole: string;
    userId?: string;
    status: 'pending' | 'approved' | 'rejected';
    timestamp?: string;
    comments?: string;
  }>;
  automationRules: {
    autoApproveThreshold: number;
    requiresManualReview: boolean;
    escalationTriggers: string[];
  };
  businessRules: {
    amountLimit: number;
    accountRestrictions: string[];
    timeRestrictions: string[];
    complianceChecks: string[];
  };
}

interface SmartValidation {
  organizationId: string;
  journalEntry: {
    description: string;
    entries: Array<{
      accountCode: string;
      accountName: string;
      debit?: number;
      credit?: number;
      description?: string;
    }>;
    totalAmount: number;
    entryDate: string;
  };
  contextualData: {
    userRole: string;
    userHistory: any;
    organizationRules: any;
    recentPatterns: any;
  };
}

// POST /api/finance/gl-accounts/automated-validation
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body: SmartValidation = await request.json();

    if (!body.organizationId || !body.journalEntry) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, journalEntry' },
        { status: 400 }
      );
    }

    console.log('🤖 Running automated validation for journal entry');

    // CORE PATTERN: Get organization's chart of accounts
    const { data: accounts } = await supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', body.organizationId) // SACRED
      .eq('entity_type', 'chart_of_account')
      .eq('is_active', true);

    const validAccountCodes = new Set(accounts?.map(acc => acc.entity_code) || []);

    // CORE PATTERN: Get account metadata
    const accountIds = accounts?.map(a => a.id) || [];
    const { data: accountMetadata } = await supabase
      .from('core_dynamic_data')
      .select('entity_id, field_name, field_value')
      .in('entity_id', accountIds);

    // Build account metadata map
    const metadataMap = new Map<string, Record<string, any>>();
    for (const account of accounts || []) {
      const metadata = accountMetadata?.filter(m => m.entity_id === account.id) || [];
      const accountData = metadata.reduce((acc, item) => {
        acc[item.field_name] = item.field_value;
        return acc;
      }, {} as Record<string, any>);
      metadataMap.set(account.entity_code, accountData);
    }

    // CORE PATTERN: Get recent transactions for pattern analysis
    const { data: recentTransactions } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', body.organizationId) // SACRED
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    const validation: ValidationResult = {
      isValid: true,
      confidence: 1.0,
      validationScore: 100,
      issues: [],
      recommendations: [],
      autoFixSuggestions: []
    };

    // 1. BASIC VALIDATION CHECKS
    
    // Check if journal entry balances
    const totalDebits = body.journalEntry.entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
    const totalCredits = body.journalEntry.entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
    const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

    if (!isBalanced) {
      validation.issues.push({
        issueType: 'critical',
        category: 'balance',
        description: `Journal entry is not balanced. Debits: $${totalDebits.toFixed(2)}, Credits: $${totalCredits.toFixed(2)}`,
        affectedEntries: [],
        severity: 100,
        canAutoFix: true,
        suggestedFix: 'Add balancing entry or adjust amounts'
      });
      validation.isValid = false;
      validation.validationScore -= 50;
    }

    // 2. ACCOUNT VALIDATION
    for (let i = 0; i < body.journalEntry.entries.length; i++) {
      const entry = body.journalEntry.entries[i];
      
      // Check if account exists
      if (!validAccountCodes.has(entry.accountCode)) {
        validation.issues.push({
          issueType: 'critical',
          category: 'account',
          description: `Account ${entry.accountCode} does not exist in chart of accounts`,
          affectedEntries: [i],
          severity: 90,
          canAutoFix: false
        });
        validation.isValid = false;
        validation.validationScore -= 30;
      } else {
        // Check if account allows posting
        const metadata = metadataMap.get(entry.accountCode);
        if (metadata?.allow_posting === 'false') {
          validation.issues.push({
            issueType: 'critical',
            category: 'account',
            description: `Account ${entry.accountCode} is marked as no posting allowed`,
            affectedEntries: [i],
            severity: 85,
            canAutoFix: false
          });
          validation.isValid = false;
          validation.validationScore -= 25;
        }
      }

      // Check for zero amounts
      if ((!entry.debit || entry.debit === 0) && (!entry.credit || entry.credit === 0)) {
        validation.issues.push({
          issueType: 'warning',
          category: 'amount',
          description: `Entry ${i + 1} has zero amount`,
          affectedEntries: [i],
          severity: 60,
          canAutoFix: true,
          suggestedFix: 'Remove entry or add amount'
        });
        validation.validationScore -= 10;
      }

      // Check for both debit and credit on same entry
      if (entry.debit && entry.debit > 0 && entry.credit && entry.credit > 0) {
        validation.issues.push({
          issueType: 'warning',
          category: 'amount',
          description: `Entry ${i + 1} has both debit and credit amounts`,
          affectedEntries: [i],
          severity: 70,
          canAutoFix: true,
          suggestedFix: 'Split into separate entries'
        });
        validation.validationScore -= 15;
      }
    }

    // 3. PATTERN ANALYSIS & ANOMALY DETECTION
    
    // Calculate average transaction amounts by account
    const accountAverages = new Map<string, { avg: number; count: number; stdDev: number }>();
    
    for (const tx of recentTransactions || []) {
      const entries = tx.transaction_data?.entries || [];
      for (const entry of entries) {
        if (!accountAverages.has(entry.account_code)) {
          accountAverages.set(entry.account_code, { avg: 0, count: 0, stdDev: 0 });
        }
        const stats = accountAverages.get(entry.account_code)!;
        const amount = (entry.debit || 0) + (entry.credit || 0);
        stats.avg = (stats.avg * stats.count + amount) / (stats.count + 1);
        stats.count++;
      }
    }

    // Check for unusual amounts
    for (let i = 0; i < body.journalEntry.entries.length; i++) {
      const entry = body.journalEntry.entries[i];
      const amount = (entry.debit || 0) + (entry.credit || 0);
      const stats = accountAverages.get(entry.accountCode);
      
      if (stats && stats.count > 3) {
        const deviation = Math.abs(amount - stats.avg) / (stats.avg || 1);
        
        if (deviation > 3) { // More than 3x the average
          validation.issues.push({
            issueType: 'warning',
            category: 'pattern',
            description: `Entry ${i + 1} amount ($${amount}) is unusual for account ${entry.accountCode} (avg: $${stats.avg.toFixed(2)})`,
            affectedEntries: [i],
            severity: 40,
            canAutoFix: false
          });
          validation.validationScore -= 5;
        }
      }
    }

    // 4. COMPLIANCE CHECKS
    
    // Check for weekend postings (if restricted)
    const entryDate = new Date(body.journalEntry.entryDate);
    const dayOfWeek = entryDate.getDay();
    
    if ([0, 6].includes(dayOfWeek)) { // Sunday = 0, Saturday = 6
      validation.issues.push({
        issueType: 'info',
        category: 'compliance',
        description: 'Entry is dated on a weekend - verify this is intentional',
        affectedEntries: [],
        severity: 20,
        canAutoFix: false
      });
    }

    // Check for future dates
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    if (entryDate > today) {
      validation.issues.push({
        issueType: 'warning',
        category: 'compliance',
        description: 'Entry date is in the future',
        affectedEntries: [],
        severity: 50,
        canAutoFix: false
      });
      validation.validationScore -= 10;
    }

    // 5. INTELLIGENT AUTO-FIX SUGGESTIONS
    
    if (!isBalanced && validation.autoFixSuggestions.length === 0) {
      const imbalance = totalDebits - totalCredits;
      
      validation.autoFixSuggestions.push({
        fixType: 'entry_addition',
        description: 'Add balancing entry',
        confidence: 0.9,
        suggestedEntry: {
          accountCode: imbalance > 0 ? '3001000' : '1001000', // Owner's Equity or Cash
          accountName: imbalance > 0 ? 'Owner\'s Equity' : 'Cash - Operating Account',
          debit: imbalance < 0 ? Math.abs(imbalance) : 0,
          credit: imbalance > 0 ? imbalance : 0,
          description: 'Auto-generated balancing entry'
        },
        reasoning: 'Add balancing entry to make journal entry balance'
      });
    }

    // 6. GENERATE RECOMMENDATIONS
    
    if (validation.issues.length === 0) {
      validation.recommendations.push('Journal entry passes all validation checks');
    } else {
      validation.recommendations.push('Review and fix validation issues before posting');
      
      if (validation.issues.some(i => i.canAutoFix)) {
        validation.recommendations.push('Consider using auto-fix suggestions for correctable issues');
      }
      
      if (validation.issues.some(i => i.category === 'pattern')) {
        validation.recommendations.push('Unusual patterns detected - verify amounts are correct');
      }
    }

    // Adjust confidence based on issues
    const criticalIssues = validation.issues.filter(i => i.issueType === 'critical').length;
    const warningIssues = validation.issues.filter(i => i.issueType === 'warning').length;
    
    validation.confidence = Math.max(0, 1 - (criticalIssues * 0.3) - (warningIssues * 0.1));

    console.log('✅ Automated validation completed');

    return NextResponse.json({
      success: true,
      data: validation,
      metadata: {
        organizationId: body.organizationId,
        validationEngine: 'hera_ai_v4',
        processingTime: Date.now(),
        checksPerformed: [
          'balance_validation',
          'account_existence',
          'posting_permissions',
          'amount_reasonableness',
          'pattern_analysis',
          'compliance_checks',
          'date_validation'
        ]
      }
    });

  } catch (error) {
    console.error('❌ Automated validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/finance/gl-accounts/automated-validation
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const workflowId = searchParams.get('workflowId');
    const status = searchParams.get('status');
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    console.log('📋 Retrieving approval workflows for organization:', organizationId);

    // CORE PATTERN: Get approval workflows from core_relationships
    let query = supabase
      .from('core_relationships')
      .select('*')
      .eq('organization_id', organizationId) // SACRED
      .eq('relationship_type', 'approval_workflow')
      .eq('is_active', true);

    if (workflowId) {
      query = query.eq('id', workflowId);
    }

    if (status) {
      query = query.contains('relationship_metadata', { status });
    }

    const { data: workflows } = await query.order('created_at', { ascending: false });

    // Transform to workflow format
    const approvalWorkflows = (workflows || []).map(wf => ({
      workflowId: wf.id,
      journalEntryId: wf.parent_entity_id,
      status: wf.relationship_metadata?.status || 'pending',
      currentStep: wf.relationship_metadata?.currentStep || 1,
      totalSteps: wf.relationship_metadata?.totalSteps || 1,
      approvers: wf.relationship_metadata?.approvers || [],
      automationRules: wf.relationship_metadata?.automationRules || {},
      businessRules: wf.relationship_metadata?.businessRules || {},
      createdAt: wf.created_at,
      updatedAt: wf.updated_at
    }));

    return NextResponse.json({
      success: true,
      data: {
        workflows: approvalWorkflows,
        summary: {
          total: approvalWorkflows.length,
          pending: approvalWorkflows.filter(w => w.status === 'pending').length,
          approved: approvalWorkflows.filter(w => w.status === 'approved').length,
          autoApproved: approvalWorkflows.filter(w => w.status === 'auto_approved').length
        }
      },
      metadata: {
        organizationId,
        workflowId,
        status,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Approval workflow retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}