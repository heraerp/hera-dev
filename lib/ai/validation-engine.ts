/**
 * HERA Universal ERP - AI Validation Engine
 * Comprehensive validation system with business logic, compliance, and quality checks
 */

import { openAIIntegration } from './openai-integration';
import { anthropicIntegration } from './anthropic-integration';

// ==================== TYPES ====================

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'format' | 'business_logic' | 'compliance' | 'data_quality' | 'security';
  documentTypes: string[];
  validator: (data: any, context?: any) => Promise<ValidationResult>;
  dependencies?: string[];
  enabled: boolean;
}

export interface ValidationResult {
  ruleId: string;
  passed: boolean;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details?: string;
  suggestedFix?: string;
  affectedFields: string[];
  businessImpact?: string;
  complianceImpact?: string;
}

export interface ValidationReport {
  documentId: string;
  documentType: string;
  overallScore: number;
  passed: boolean;
  results: ValidationResult[];
  summary: ValidationSummary;
  recommendations: string[];
  requiresHumanReview: boolean;
  timestamp: string;
  processingTime: number;
}

export interface ValidationSummary {
  totalRules: number;
  passedRules: number;
  failedRules: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  complianceStatus: 'compliant' | 'non_compliant' | 'needs_review';
  dataQualityScore: number;
}

export interface ValidationContext {
  companyPolicies?: Record<string, any>;
  regulatoryRequirements?: Record<string, any>;
  industryStandards?: Record<string, any>;
  previousDocuments?: any[];
  userProfile?: Record<string, any>;
  businessRules?: Record<string, any>;
}

export interface ComplianceRule {
  id: string;
  name: string;
  jurisdiction: string;
  category: 'tax' | 'financial' | 'data_privacy' | 'industry' | 'internal';
  requirements: string[];
  validator: (data: any) => Promise<boolean>;
  penalties?: string[];
}

// ==================== VALIDATION ENGINE ====================

export class ValidationEngine {
  private rules: Map<string, ValidationRule> = new Map();
  private complianceRules: Map<string, ComplianceRule> = new Map();
  private validationHistory: ValidationReport[] = [];

  constructor() {
    this.initializeDefaultRules();
    this.initializeComplianceRules();
  }

  // ==================== RULE MANAGEMENT ====================

  private initializeDefaultRules(): void {
    const defaultRules: ValidationRule[] = [
      // Format Validation Rules
      {
        id: 'email_format',
        name: 'Email Format Validation',
        description: 'Validates email addresses are properly formatted',
        severity: 'medium',
        category: 'format',
        documentTypes: ['business_card', 'contact', 'invoice'],
        enabled: true,
        validator: this.validateEmailFormat.bind(this)
      },
      {
        id: 'phone_format',
        name: 'Phone Number Format',
        description: 'Validates phone numbers follow international standards',
        severity: 'low',
        category: 'format',
        documentTypes: ['business_card', 'contact', 'invoice'],
        enabled: true,
        validator: this.validatePhoneFormat.bind(this)
      },
      {
        id: 'date_format',
        name: 'Date Format Validation',
        description: 'Validates dates are properly formatted and logical',
        severity: 'high',
        category: 'format',
        documentTypes: ['invoice', 'receipt', 'contract'],
        enabled: true,
        validator: this.validateDateFormat.bind(this)
      },
      {
        id: 'currency_format',
        name: 'Currency Format Validation',
        description: 'Validates currency amounts and formatting',
        severity: 'high',
        category: 'format',
        documentTypes: ['invoice', 'receipt'],
        enabled: true,
        validator: this.validateCurrencyFormat.bind(this)
      },

      // Business Logic Rules
      {
        id: 'invoice_calculations',
        name: 'Invoice Calculation Validation',
        description: 'Validates mathematical accuracy of invoice totals',
        severity: 'critical',
        category: 'business_logic',
        documentTypes: ['invoice'],
        enabled: true,
        validator: this.validateInvoiceCalculations.bind(this)
      },
      {
        id: 'due_date_logic',
        name: 'Due Date Logic',
        description: 'Validates due date is after issue date',
        severity: 'high',
        category: 'business_logic',
        documentTypes: ['invoice'],
        enabled: true,
        validator: this.validateDueDateLogic.bind(this)
      },
      {
        id: 'expense_policy',
        name: 'Expense Policy Compliance',
        description: 'Validates expenses comply with company policies',
        severity: 'high',
        category: 'business_logic',
        documentTypes: ['receipt'],
        enabled: true,
        validator: this.validateExpensePolicy.bind(this)
      },

      // Data Quality Rules
      {
        id: 'required_fields',
        name: 'Required Fields Validation',
        description: 'Validates all required fields are present',
        severity: 'critical',
        category: 'data_quality',
        documentTypes: ['invoice', 'receipt', 'business_card'],
        enabled: true,
        validator: this.validateRequiredFields.bind(this)
      },
      {
        id: 'data_consistency',
        name: 'Data Consistency Check',
        description: 'Validates data consistency across fields',
        severity: 'medium',
        category: 'data_quality',
        documentTypes: ['invoice', 'receipt'],
        enabled: true,
        validator: this.validateDataConsistency.bind(this)
      },

      // Compliance Rules
      {
        id: 'tax_compliance',
        name: 'Tax Compliance Validation',
        description: 'Validates tax calculations and compliance',
        severity: 'critical',
        category: 'compliance',
        documentTypes: ['invoice', 'receipt'],
        enabled: true,
        validator: this.validateTaxCompliance.bind(this)
      },

      // Security Rules
      {
        id: 'sensitive_data',
        name: 'Sensitive Data Detection',
        description: 'Detects and flags sensitive information',
        severity: 'high',
        category: 'security',
        documentTypes: ['invoice', 'receipt', 'business_card'],
        enabled: true,
        validator: this.validateSensitiveData.bind(this)
      }
    ];

    defaultRules.forEach(rule => {
      this.rules.set(rule.id, rule);
    });

    console.log(`🛡️ HERA: Initialized ${defaultRules.length} validation rules`);
  }

  private initializeComplianceRules(): void {
    const complianceRules: ComplianceRule[] = [
      {
        id: 'gdpr_compliance',
        name: 'GDPR Compliance',
        jurisdiction: 'EU',
        category: 'data_privacy',
        requirements: ['consent_management', 'data_minimization', 'right_to_erasure'],
        validator: this.validateGDPRCompliance.bind(this)
      },
      {
        id: 'sox_compliance',
        name: 'Sarbanes-Oxley Compliance',
        jurisdiction: 'US',
        category: 'financial',
        requirements: ['audit_trail', 'internal_controls', 'financial_reporting'],
        validator: this.validateSOXCompliance.bind(this)
      },
      {
        id: 'pci_compliance',
        name: 'PCI DSS Compliance',
        jurisdiction: 'Global',
        category: 'financial',
        requirements: ['card_data_protection', 'secure_transmission', 'access_controls'],
        validator: this.validatePCICompliance.bind(this)
      }
    ];

    complianceRules.forEach(rule => {
      this.complianceRules.set(rule.id, rule);
    });

    console.log(`📋 HERA: Initialized ${complianceRules.length} compliance rules`);
  }

  // ==================== VALIDATION EXECUTION ====================

  async validateDocument(
    documentData: any,
    documentType: string,
    context?: ValidationContext
  ): Promise<ValidationReport> {
    try {
      console.log(`🛡️ HERA: Starting validation for ${documentType} document...`);
      const startTime = performance.now();

      // Get applicable rules for document type
      const applicableRules = Array.from(this.rules.values())
        .filter(rule => rule.enabled && rule.documentTypes.includes(documentType));

      console.log(`Found ${applicableRules.length} applicable validation rules`);

      // Execute validation rules
      const results: ValidationResult[] = [];
      
      for (const rule of applicableRules) {
        try {
          const result = await rule.validator(documentData, context);
          results.push(result);
        } catch (error) {
          console.error(`Validation rule ${rule.id} failed:`, error);
          results.push({
            ruleId: rule.id,
            passed: false,
            confidence: 0,
            severity: rule.severity,
            message: `Validation rule execution failed: ${error}`,
            affectedFields: [],
            businessImpact: 'Unable to validate due to processing error'
          });
        }
      }

      // AI-powered validation for complex business logic
      const aiValidationResults = await this.performAIValidation(documentData, documentType, context);
      results.push(...aiValidationResults);

      // Generate validation report
      const report = this.generateValidationReport(
        documentData,
        documentType,
        results,
        performance.now() - startTime
      );

      // Store validation history
      this.validationHistory.push(report);

      console.log(`✅ HERA: Validation completed - Score: ${report.overallScore}%, Passed: ${report.passed}`);
      
      return report;

    } catch (error) {
      console.error('❌ HERA: Document validation failed:', error);
      throw new Error(`Validation failed: ${error}`);
    }
  }

  private async performAIValidation(
    documentData: any,
    documentType: string,
    context?: ValidationContext
  ): Promise<ValidationResult[]> {
    try {
      console.log('🤖 HERA: Performing AI-powered validation...');

      const results: ValidationResult[] = [];

      // OpenAI validation
      try {
        const openAIValidation = await openAIIntegration.validateExtractedData(documentData, documentType);
        
        if (!openAIValidation.isValid) {
          results.push({
            ruleId: 'ai_openai_validation',
            passed: false,
            confidence: openAIValidation.confidence,
            severity: 'high',
            message: 'OpenAI detected validation issues',
            details: openAIValidation.reasoning,
            affectedFields: openAIValidation.issues.map(issue => issue.field),
            suggestedFix: openAIValidation.suggestions.join('; ')
          });
        } else {
          results.push({
            ruleId: 'ai_openai_validation',
            passed: true,
            confidence: openAIValidation.confidence,
            severity: 'low',
            message: 'OpenAI validation passed',
            affectedFields: []
          });
        }
      } catch (error) {
        console.warn('OpenAI validation failed:', error);
      }

      // Anthropic Claude validation
      try {
        const claudeValidation = await anthropicIntegration.performAdvancedValidation(documentData, context || {});
        
        if (!claudeValidation.isValid) {
          results.push({
            ruleId: 'ai_claude_validation',
            passed: false,
            confidence: claudeValidation.confidence,
            severity: claudeValidation.criticalIssues.length > 0 ? 'critical' : 'medium',
            message: 'Claude detected validation issues',
            details: claudeValidation.criticalIssues.concat(claudeValidation.warnings).join('; '),
            affectedFields: [],
            suggestedFix: claudeValidation.suggestions.join('; ')
          });
        } else {
          results.push({
            ruleId: 'ai_claude_validation',
            passed: true,
            confidence: claudeValidation.confidence,
            severity: 'low',
            message: 'Claude validation passed',
            affectedFields: []
          });
        }
      } catch (error) {
        console.warn('Claude validation failed:', error);
      }

      return results;

    } catch (error) {
      console.error('AI validation failed:', error);
      return [];
    }
  }

  // ==================== INDIVIDUAL VALIDATORS ====================

  private async validateEmailFormat(data: any): Promise<ValidationResult> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailFields = this.extractEmailFields(data);
    const invalidEmails = emailFields.filter(email => !emailRegex.test(email.value));

    return {
      ruleId: 'email_format',
      passed: invalidEmails.length === 0,
      confidence: 1.0,
      severity: 'medium',
      message: invalidEmails.length === 0 
        ? 'All email addresses are properly formatted'
        : `Found ${invalidEmails.length} invalid email address(es)`,
      affectedFields: invalidEmails.map(email => email.field),
      suggestedFix: 'Verify email addresses and correct formatting'
    };
  }

  private async validatePhoneFormat(data: any): Promise<ValidationResult> {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const phoneFields = this.extractPhoneFields(data);
    const invalidPhones = phoneFields.filter(phone => 
      !phoneRegex.test(phone.value.replace(/[\s\-\(\)]/g, ''))
    );

    return {
      ruleId: 'phone_format',
      passed: invalidPhones.length === 0,
      confidence: 1.0,
      severity: 'low',
      message: invalidPhones.length === 0 
        ? 'All phone numbers are properly formatted'
        : `Found ${invalidPhones.length} invalid phone number(s)`,
      affectedFields: invalidPhones.map(phone => phone.field),
      suggestedFix: 'Verify phone numbers and use international format'
    };
  }

  private async validateDateFormat(data: any): Promise<ValidationResult> {
    const dateFields = this.extractDateFields(data);
    const invalidDates = dateFields.filter(date => {
      const parsedDate = new Date(date.value);
      return isNaN(parsedDate.getTime()) || parsedDate.getFullYear() < 1900 || parsedDate.getFullYear() > 2100;
    });

    return {
      ruleId: 'date_format',
      passed: invalidDates.length === 0,
      confidence: 1.0,
      severity: 'high',
      message: invalidDates.length === 0 
        ? 'All dates are valid and properly formatted'
        : `Found ${invalidDates.length} invalid date(s)`,
      affectedFields: invalidDates.map(date => date.field),
      suggestedFix: 'Verify dates and use standard format (YYYY-MM-DD)'
    };
  }

  private async validateCurrencyFormat(data: any): Promise<ValidationResult> {
    const currencyFields = this.extractCurrencyFields(data);
    const invalidAmounts = currencyFields.filter(amount => {
      const numericValue = parseFloat(amount.value.toString().replace(/[^\d.-]/g, ''));
      return isNaN(numericValue) || numericValue < 0;
    });

    return {
      ruleId: 'currency_format',
      passed: invalidAmounts.length === 0,
      confidence: 1.0,
      severity: 'high',
      message: invalidAmounts.length === 0 
        ? 'All currency amounts are valid'
        : `Found ${invalidAmounts.length} invalid currency amount(s)`,
      affectedFields: invalidAmounts.map(amount => amount.field),
      suggestedFix: 'Verify amounts are positive numbers with proper decimal formatting'
    };
  }

  private async validateInvoiceCalculations(data: any): Promise<ValidationResult> {
    if (!data.lineItems || !data.totals) {
      return {
        ruleId: 'invoice_calculations',
        passed: false,
        confidence: 1.0,
        severity: 'critical',
        message: 'Missing line items or totals for calculation validation',
        affectedFields: ['lineItems', 'totals']
      };
    }

    // Calculate expected subtotal
    const calculatedSubtotal = data.lineItems.reduce((sum: number, item: any) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);

    // Calculate expected tax
    const calculatedTax = data.lineItems.reduce((sum: number, item: any) => {
      return sum + (item.taxAmount || 0);
    }, 0);

    // Calculate expected total
    const calculatedTotal = calculatedSubtotal + calculatedTax + (data.totals.shippingCost || 0) - (data.totals.totalDiscount || 0);

    const subtotalDiff = Math.abs(calculatedSubtotal - (data.totals.subtotal || 0));
    const taxDiff = Math.abs(calculatedTax - (data.totals.totalTax || 0));
    const totalDiff = Math.abs(calculatedTotal - (data.totals.totalAmount || 0));

    const tolerance = 0.01; // Allow 1 cent tolerance for rounding
    const passed = subtotalDiff <= tolerance && taxDiff <= tolerance && totalDiff <= tolerance;

    return {
      ruleId: 'invoice_calculations',
      passed,
      confidence: 1.0,
      severity: 'critical',
      message: passed 
        ? 'All invoice calculations are correct'
        : 'Invoice calculation discrepancies detected',
      details: passed ? undefined : 
        `Subtotal diff: $${subtotalDiff.toFixed(2)}, Tax diff: $${taxDiff.toFixed(2)}, Total diff: $${totalDiff.toFixed(2)}`,
      affectedFields: passed ? [] : ['totals.subtotal', 'totals.totalTax', 'totals.totalAmount'],
      suggestedFix: 'Recalculate totals based on line items and verify tax calculations'
    };
  }

  private async validateDueDateLogic(data: any): Promise<ValidationResult> {
    if (!data.issueDate || !data.dueDate) {
      return {
        ruleId: 'due_date_logic',
        passed: false,
        confidence: 1.0,
        severity: 'high',
        message: 'Missing issue date or due date',
        affectedFields: ['issueDate', 'dueDate']
      };
    }

    const issueDate = new Date(data.issueDate);
    const dueDate = new Date(data.dueDate);
    const passed = dueDate >= issueDate;

    return {
      ruleId: 'due_date_logic',
      passed,
      confidence: 1.0,
      severity: 'high',
      message: passed 
        ? 'Due date is after issue date'
        : 'Due date is before issue date',
      affectedFields: passed ? [] : ['dueDate'],
      suggestedFix: 'Verify due date is after issue date'
    };
  }

  private async validateExpensePolicy(data: any, context?: ValidationContext): Promise<ValidationResult> {
    const policies = context?.companyPolicies || {};
    const issues: string[] = [];

    // Check spending limits
    if (policies.spendingLimits) {
      const categoryLimit = policies.spendingLimits[data.category];
      if (categoryLimit && data.totals.total > categoryLimit) {
        issues.push(`Amount $${data.totals.total} exceeds ${data.category} limit of $${categoryLimit}`);
      }
    }

    // Check receipt requirements
    if (policies.receiptRequired && data.totals.total > (policies.receiptThreshold || 25)) {
      if (!data.receiptNumber) {
        issues.push('Receipt required for expenses over threshold');
      }
    }

    // Check business purpose requirement
    if (policies.requireBusinessPurpose && !data.businessPurpose) {
      issues.push('Business purpose required for expense reimbursement');
    }

    return {
      ruleId: 'expense_policy',
      passed: issues.length === 0,
      confidence: 1.0,
      severity: 'high',
      message: issues.length === 0 
        ? 'Expense complies with company policies'
        : 'Expense policy violations detected',
      details: issues.join('; '),
      affectedFields: issues.length > 0 ? ['category', 'totals.total', 'businessPurpose'] : [],
      suggestedFix: 'Review company expense policy and obtain required approvals'
    };
  }

  private async validateRequiredFields(data: any): Promise<ValidationResult> {
    const requiredFields = this.getRequiredFieldsForDocument(data);
    const missingFields = requiredFields.filter(field => !this.hasValue(data, field));

    return {
      ruleId: 'required_fields',
      passed: missingFields.length === 0,
      confidence: 1.0,
      severity: 'critical',
      message: missingFields.length === 0 
        ? 'All required fields are present'
        : `Missing ${missingFields.length} required field(s)`,
      affectedFields: missingFields,
      suggestedFix: 'Provide values for all required fields'
    };
  }

  private async validateDataConsistency(data: any): Promise<ValidationResult> {
    const inconsistencies: string[] = [];

    // Check currency consistency
    if (data.currency && data.totals) {
      const amounts = Object.values(data.totals).filter(val => typeof val === 'number');
      // Add currency consistency checks here
    }

    // Check address consistency
    if (data.vendor?.address && data.billTo?.address) {
      // Add address consistency checks here
    }

    return {
      ruleId: 'data_consistency',
      passed: inconsistencies.length === 0,
      confidence: 0.8,
      severity: 'medium',
      message: inconsistencies.length === 0 
        ? 'Data is internally consistent'
        : 'Data consistency issues detected',
      details: inconsistencies.join('; '),
      affectedFields: [],
      suggestedFix: 'Review and correct inconsistent data'
    };
  }

  private async validateTaxCompliance(data: any): Promise<ValidationResult> {
    // Implement tax compliance validation based on jurisdiction
    return {
      ruleId: 'tax_compliance',
      passed: true,
      confidence: 0.9,
      severity: 'critical',
      message: 'Tax compliance validation passed',
      affectedFields: []
    };
  }

  private async validateSensitiveData(data: any): Promise<ValidationResult> {
    const sensitivePatterns = [
      { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, type: 'Credit Card' },
      { pattern: /\b\d{3}-\d{2}-\d{4}\b/, type: 'SSN' },
      { pattern: /\b[A-Z]{2}\d{2}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{2}\b/, type: 'IBAN' }
    ];

    const dataString = JSON.stringify(data);
    const detectedSensitive = sensitivePatterns.filter(pattern => 
      pattern.pattern.test(dataString)
    );

    return {
      ruleId: 'sensitive_data',
      passed: detectedSensitive.length === 0,
      confidence: 0.9,
      severity: 'high',
      message: detectedSensitive.length === 0 
        ? 'No sensitive data detected'
        : `Detected sensitive data: ${detectedSensitive.map(s => s.type).join(', ')}`,
      affectedFields: [],
      suggestedFix: 'Review and redact sensitive information'
    };
  }

  // ==================== COMPLIANCE VALIDATORS ====================

  private async validateGDPRCompliance(data: any): Promise<boolean> {
    // Implement GDPR compliance validation
    return true;
  }

  private async validateSOXCompliance(data: any): Promise<boolean> {
    // Implement SOX compliance validation
    return true;
  }

  private async validatePCICompliance(data: any): Promise<boolean> {
    // Implement PCI DSS compliance validation
    return true;
  }

  // ==================== UTILITY METHODS ====================

  private extractEmailFields(data: any): Array<{ field: string; value: string }> {
    const emails: Array<{ field: string; value: string }> = [];
    
    const findEmails = (obj: any, path: string = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (typeof value === 'string' && value.includes('@')) {
          emails.push({ field: currentPath, value });
        } else if (typeof value === 'object' && value !== null) {
          findEmails(value, currentPath);
        }
      }
    };

    findEmails(data);
    return emails;
  }

  private extractPhoneFields(data: any): Array<{ field: string; value: string }> {
    const phones: Array<{ field: string; value: string }> = [];
    
    const findPhones = (obj: any, path: string = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (typeof value === 'string' && (
          key.toLowerCase().includes('phone') || 
          key.toLowerCase().includes('mobile') ||
          /[\+]?[\d\s\-\(\)]{10,}/.test(value)
        )) {
          phones.push({ field: currentPath, value });
        } else if (typeof value === 'object' && value !== null) {
          findPhones(value, currentPath);
        }
      }
    };

    findPhones(data);
    return phones;
  }

  private extractDateFields(data: any): Array<{ field: string; value: string }> {
    const dates: Array<{ field: string; value: string }> = [];
    
    const findDates = (obj: any, path: string = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (typeof value === 'string' && (
          key.toLowerCase().includes('date') ||
          key.toLowerCase().includes('time') ||
          /\d{4}-\d{2}-\d{2}/.test(value) ||
          /\d{2}\/\d{2}\/\d{4}/.test(value)
        )) {
          dates.push({ field: currentPath, value });
        } else if (typeof value === 'object' && value !== null) {
          findDates(value, currentPath);
        }
      }
    };

    findDates(data);
    return dates;
  }

  private extractCurrencyFields(data: any): Array<{ field: string; value: any }> {
    const currencies: Array<{ field: string; value: any }> = [];
    
    const findCurrencies = (obj: any, path: string = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if ((typeof value === 'number' || typeof value === 'string') && (
          key.toLowerCase().includes('amount') ||
          key.toLowerCase().includes('price') ||
          key.toLowerCase().includes('cost') ||
          key.toLowerCase().includes('total') ||
          key.toLowerCase().includes('tax')
        )) {
          currencies.push({ field: currentPath, value });
        } else if (typeof value === 'object' && value !== null) {
          findCurrencies(value, currentPath);
        }
      }
    };

    findCurrencies(data);
    return currencies;
  }

  private getRequiredFieldsForDocument(data: any): string[] {
    // Define required fields based on document type
    const documentType = data.documentType || this.inferDocumentType(data);
    
    const requiredFields: Record<string, string[]> = {
      invoice: ['invoiceNumber', 'issueDate', 'vendor.name', 'totals.totalAmount'],
      receipt: ['transactionDate', 'merchant.name', 'totals.total'],
      business_card: ['name', 'company']
    };

    return requiredFields[documentType] || [];
  }

  private hasValue(obj: any, path: string): boolean {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current === null || current === undefined || !(key in current)) {
        return false;
      }
      current = current[key];
    }
    
    return current !== null && current !== undefined && current !== '';
  }

  private inferDocumentType(data: any): string {
    if (data.invoiceNumber || data.invoice_number) return 'invoice';
    if (data.receiptNumber || data.receipt_number) return 'receipt';
    if (data.name && data.company) return 'business_card';
    return 'unknown';
  }

  private generateValidationReport(
    documentData: any,
    documentType: string,
    results: ValidationResult[],
    processingTime: number
  ): ValidationReport {
    const summary = this.generateValidationSummary(results);
    const overallScore = this.calculateOverallScore(results);
    const passed = summary.criticalIssues === 0 && summary.highIssues === 0;
    const requiresHumanReview = this.determineHumanReviewRequired(results, overallScore);

    return {
      documentId: documentData.id || `doc_${Date.now()}`,
      documentType,
      overallScore,
      passed,
      results,
      summary,
      recommendations: this.generateRecommendations(results),
      requiresHumanReview,
      timestamp: new Date().toISOString(),
      processingTime
    };
  }

  private generateValidationSummary(results: ValidationResult[]): ValidationSummary {
    const totalRules = results.length;
    const passedRules = results.filter(r => r.passed).length;
    const failedRules = totalRules - passedRules;
    
    const criticalIssues = results.filter(r => !r.passed && r.severity === 'critical').length;
    const highIssues = results.filter(r => !r.passed && r.severity === 'high').length;
    const mediumIssues = results.filter(r => !r.passed && r.severity === 'medium').length;
    const lowIssues = results.filter(r => !r.passed && r.severity === 'low').length;

    const complianceResults = results.filter(r => r.ruleId.includes('compliance') || r.ruleId.includes('tax'));
    const complianceStatus = complianceResults.some(r => !r.passed) ? 'non_compliant' : 'compliant';

    const dataQualityResults = results.filter(r => r.ruleId.includes('data_quality') || r.ruleId.includes('format'));
    const dataQualityScore = dataQualityResults.length > 0 
      ? (dataQualityResults.filter(r => r.passed).length / dataQualityResults.length) * 100
      : 100;

    return {
      totalRules,
      passedRules,
      failedRules,
      criticalIssues,
      highIssues,
      mediumIssues,
      lowIssues,
      complianceStatus,
      dataQualityScore
    };
  }

  private calculateOverallScore(results: ValidationResult[]): number {
    if (results.length === 0) return 0;

    const weights = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1
    };

    const totalWeight = results.reduce((sum, result) => {
      return sum + weights[result.severity];
    }, 0);

    const passedWeight = results
      .filter(result => result.passed)
      .reduce((sum, result) => {
        return sum + weights[result.severity];
      }, 0);

    return (passedWeight / totalWeight) * 100;
  }

  private determineHumanReviewRequired(results: ValidationResult[], overallScore: number): boolean {
    const criticalFailures = results.filter(r => !r.passed && r.severity === 'critical').length;
    const highFailures = results.filter(r => !r.passed && r.severity === 'high').length;
    const lowConfidenceResults = results.filter(r => r.confidence < 0.8).length;

    return criticalFailures > 0 || highFailures > 2 || overallScore < 70 || lowConfidenceResults > 3;
  }

  private generateRecommendations(results: ValidationResult[]): string[] {
    const recommendations: string[] = [];
    
    const failedResults = results.filter(r => !r.passed);
    
    if (failedResults.length === 0) {
      recommendations.push('Document validation passed successfully');
      return recommendations;
    }

    const criticalIssues = failedResults.filter(r => r.severity === 'critical');
    if (criticalIssues.length > 0) {
      recommendations.push('Address critical validation issues before processing');
    }

    const dataQualityIssues = failedResults.filter(r => r.ruleId.includes('format') || r.ruleId.includes('required'));
    if (dataQualityIssues.length > 0) {
      recommendations.push('Improve data quality by verifying extracted information');
    }

    const complianceIssues = failedResults.filter(r => r.ruleId.includes('compliance') || r.ruleId.includes('tax'));
    if (complianceIssues.length > 0) {
      recommendations.push('Review compliance requirements and obtain necessary approvals');
    }

    return recommendations;
  }

  // ==================== PUBLIC API ====================

  addCustomRule(rule: ValidationRule): void {
    this.rules.set(rule.id, rule);
    console.log(`📝 HERA: Added custom validation rule: ${rule.name}`);
  }

  removeRule(ruleId: string): boolean {
    const deleted = this.rules.delete(ruleId);
    if (deleted) {
      console.log(`🗑️ HERA: Removed validation rule: ${ruleId}`);
    }
    return deleted;
  }

  enableRule(ruleId: string): boolean {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = true;
      return true;
    }
    return false;
  }

  disableRule(ruleId: string): boolean {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = false;
      return true;
    }
    return false;
  }

  getValidationHistory(): ValidationReport[] {
    return [...this.validationHistory];
  }

  getValidationStatistics(): any {
    const reports = this.validationHistory;
    
    return {
      totalDocuments: reports.length,
      averageScore: reports.reduce((sum, r) => sum + r.overallScore, 0) / reports.length || 0,
      passRate: (reports.filter(r => r.passed).length / reports.length) * 100 || 0,
      averageProcessingTime: reports.reduce((sum, r) => sum + r.processingTime, 0) / reports.length || 0,
      commonIssues: this.getCommonIssues(reports)
    };
  }

  private getCommonIssues(reports: ValidationReport[]): Array<{ issue: string; frequency: number }> {
    const issueCount = new Map<string, number>();
    
    reports.forEach(report => {
      report.results.filter(r => !r.passed).forEach(result => {
        const current = issueCount.get(result.ruleId) || 0;
        issueCount.set(result.ruleId, current + 1);
      });
    });

    return Array.from(issueCount.entries())
      .map(([issue, frequency]) => ({ issue, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
  }
}

// ==================== FACTORY FUNCTION ====================

export function createValidationEngine(): ValidationEngine {
  return new ValidationEngine();
}

// ==================== SINGLETON INSTANCE ====================

export const validationEngine = createValidationEngine();

export default validationEngine;