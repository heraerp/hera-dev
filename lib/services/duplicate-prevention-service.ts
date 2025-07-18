/**
 * HERA Universal Duplicate Prevention Service
 * Comprehensive duplicate detection and prevention across all schema levels
 */

import { supabase } from '@/lib/supabase/client';

export interface DuplicateCheckResult {
  hasDuplicates: boolean;
  duplicateType?: string;
  duplicateIds?: string[];
  duplicateFields?: string[];
  preventionAction: 'allow' | 'reject' | 'merge' | 'update' | 'manual_review';
  message?: string;
  suggestions?: string[];
}

export interface DuplicatePattern {
  patternType: string;
  frequency: number;
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendedAction: string;
  affectedEntities: string[];
}

export interface FieldDuplicate {
  entityId: string;
  fieldName: string;
  existingValue: any;
  newValue: any;
  action: 'keep_existing' | 'update' | 'create_version';
}

export class DuplicatePreventionService {
  private static instance: DuplicatePreventionService;

  static getInstance(): DuplicatePreventionService {
    if (!this.instance) {
      this.instance = new DuplicatePreventionService();
    }
    return this.instance;
  }

  /**
   * Comprehensive duplicate check for entities
   */
  async checkEntityDuplicates(
    organizationId: string,
    entityType: string,
    entityData: any
  ): Promise<DuplicateCheckResult> {
    console.log('🔍 Checking for entity duplicates...');
    
    const checks = await Promise.all([
      this.checkEntityCodeDuplicate(organizationId, entityType, entityData.entity_code),
      this.checkBusinessRuleDuplicates(organizationId, entityType, entityData),
      this.checkSimilarEntities(organizationId, entityType, entityData)
    ]);

    const duplicateResults = checks.filter(c => c.hasDuplicates);
    
    if (duplicateResults.length === 0) {
      return { hasDuplicates: false, preventionAction: 'allow' };
    }

    // Determine the most severe duplicate
    const criticalDuplicate = duplicateResults.find(r => r.preventionAction === 'reject') || duplicateResults[0];
    
    return {
      ...criticalDuplicate,
      suggestions: this.generateSuggestions(duplicateResults)
    };
  }

  /**
   * Check for duplicate dynamic data fields
   */
  async checkDynamicDataDuplicates(
    entityId: string,
    fields: Array<{ name: string; value: any; type: string }>
  ): Promise<DuplicateCheckResult> {
    console.log('🔍 Checking for dynamic data duplicates...');
    
    const duplicateFields: FieldDuplicate[] = [];
    
    for (const field of fields) {
      const { data: existing } = await supabase
        .from('core_dynamic_data')
        .select('*')
        .eq('entity_id', entityId)
        .eq('field_name', field.name)
        .single();
      
      if (existing) {
        duplicateFields.push({
          entityId,
          fieldName: field.name,
          existingValue: existing.field_value,
          newValue: field.value,
          action: this.determineFieldAction(field, existing)
        });
      }
    }
    
    if (duplicateFields.length === 0) {
      return { hasDuplicates: false, preventionAction: 'allow' };
    }
    
    return {
      hasDuplicates: true,
      duplicateType: 'dynamic_data',
      duplicateFields: duplicateFields.map(f => f.fieldName),
      preventionAction: 'update',
      message: `Found ${duplicateFields.length} existing fields that will be updated`,
      suggestions: duplicateFields.map(f => 
        `Field "${f.fieldName}" exists with value "${f.existingValue}". Will update to "${f.newValue}"`
      )
    };
  }

  /**
   * Check for duplicate metadata
   */
  async checkMetadataDuplicates(
    organizationId: string,
    entityType: string,
    entityId: string,
    metadata: any
  ): Promise<DuplicateCheckResult> {
    console.log('🔍 Checking for metadata duplicates...');
    
    const { data: existing } = await supabase
      .from('core_metadata')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .eq('metadata_type', metadata.type)
      .eq('metadata_key', metadata.key)
      .eq('is_active', true);
    
    if (!existing || existing.length === 0) {
      return { hasDuplicates: false, preventionAction: 'allow' };
    }
    
    return {
      hasDuplicates: true,
      duplicateType: 'metadata',
      duplicateIds: existing.map(e => e.id),
      preventionAction: 'update',
      message: 'Active metadata exists. Will deactivate old and create new version.',
      suggestions: ['Previous metadata will be archived with timestamp']
    };
  }

  /**
   * Check for duplicate transactions
   */
  async checkTransactionDuplicates(
    organizationId: string,
    transactionType: string,
    transactionNumber: string
  ): Promise<DuplicateCheckResult> {
    console.log('🔍 Checking for transaction duplicates...');
    
    const { data: existing } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('transaction_type', transactionType)
      .eq('transaction_number', transactionNumber);
    
    if (!existing || existing.length === 0) {
      return { hasDuplicates: false, preventionAction: 'allow' };
    }
    
    return {
      hasDuplicates: true,
      duplicateType: 'transaction',
      duplicateIds: existing.map(e => e.id),
      preventionAction: 'reject',
      message: `Transaction ${transactionNumber} already exists`,
      suggestions: [
        `Use next sequence number`,
        `Add suffix to make unique (e.g., ${transactionNumber}-R1)`
      ]
    };
  }

  /**
   * Business rule duplicate checks
   */
  private async checkBusinessRuleDuplicates(
    organizationId: string,
    entityType: string,
    entityData: any
  ): Promise<DuplicateCheckResult> {
    switch (entityType) {
      case 'customer':
        return this.checkCustomerDuplicates(organizationId, entityData);
      case 'product':
        return this.checkProductDuplicates(organizationId, entityData);
      case 'invoice':
        return this.checkInvoiceDuplicates(organizationId, entityData);
      case 'employee':
        return this.checkEmployeeDuplicates(organizationId, entityData);
      default:
        return { hasDuplicates: false, preventionAction: 'allow' };
    }
  }

  /**
   * Check for duplicate customers by email, phone, or tax ID
   */
  private async checkCustomerDuplicates(
    organizationId: string,
    customerData: any
  ): Promise<DuplicateCheckResult> {
    const duplicateChecks = [];
    
    // Check email
    if (customerData.email) {
      const emailDup = await this.findDynamicFieldDuplicate(
        organizationId, 'customer', 'email', customerData.email
      );
      if (emailDup) duplicateChecks.push(emailDup);
    }
    
    // Check phone
    if (customerData.phone) {
      const phoneDup = await this.findDynamicFieldDuplicate(
        organizationId, 'customer', 'phone', customerData.phone
      );
      if (phoneDup) duplicateChecks.push(phoneDup);
    }
    
    // Check tax ID
    if (customerData.tax_id) {
      const taxDup = await this.findDynamicFieldDuplicate(
        organizationId, 'customer', 'tax_id', customerData.tax_id
      );
      if (taxDup) duplicateChecks.push(taxDup);
    }
    
    if (duplicateChecks.length === 0) {
      return { hasDuplicates: false, preventionAction: 'allow' };
    }
    
    return {
      hasDuplicates: true,
      duplicateType: 'customer_business_rule',
      duplicateIds: [...new Set(duplicateChecks.flatMap(c => c.entityIds))],
      preventionAction: 'merge',
      message: 'Customer with same email/phone/tax ID already exists',
      suggestions: [
        'Merge with existing customer',
        'Update existing customer record',
        'Create as new customer with different identifier'
      ]
    };
  }

  /**
   * Check for duplicate products by code or SKU
   */
  private async checkProductDuplicates(
    organizationId: string,
    productData: any
  ): Promise<DuplicateCheckResult> {
    // Check product code
    if (productData.product_code) {
      const { data: existing } = await supabase
        .from('core_entities')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_type', 'product')
        .eq('entity_code', productData.product_code)
        .eq('is_active', true);
      
      if (existing && existing.length > 0) {
        return {
          hasDuplicates: true,
          duplicateType: 'product_code',
          duplicateIds: existing.map(e => e.id),
          preventionAction: 'reject',
          message: `Product code ${productData.product_code} already exists`,
          suggestions: [
            'Use a different product code',
            'Add variant suffix (e.g., -V2)',
            'Update existing product instead'
          ]
        };
      }
    }
    
    return { hasDuplicates: false, preventionAction: 'allow' };
  }

  /**
   * Check for duplicate invoices
   */
  private async checkInvoiceDuplicates(
    organizationId: string,
    invoiceData: any
  ): Promise<DuplicateCheckResult> {
    if (!invoiceData.invoice_number) {
      return { hasDuplicates: false, preventionAction: 'allow' };
    }
    
    return this.checkTransactionDuplicates(
      organizationId,
      'INVOICE',
      invoiceData.invoice_number
    );
  }

  /**
   * Check for duplicate employees
   */
  private async checkEmployeeDuplicates(
    organizationId: string,
    employeeData: any
  ): Promise<DuplicateCheckResult> {
    // Check employee ID
    if (employeeData.employee_id) {
      const empIdDup = await this.findDynamicFieldDuplicate(
        organizationId, 'employee', 'employee_id', employeeData.employee_id
      );
      if (empIdDup) {
        return {
          hasDuplicates: true,
          duplicateType: 'employee_id',
          duplicateIds: empIdDup.entityIds,
          preventionAction: 'reject',
          message: `Employee ID ${employeeData.employee_id} already exists`,
          suggestions: ['Use next available employee ID', 'Check if updating existing employee']
        };
      }
    }
    
    // Check SSN/National ID
    if (employeeData.national_id) {
      const nationalIdDup = await this.findDynamicFieldDuplicate(
        organizationId, 'employee', 'national_id', employeeData.national_id
      );
      if (nationalIdDup) {
        return {
          hasDuplicates: true,
          duplicateType: 'national_id',
          duplicateIds: nationalIdDup.entityIds,
          preventionAction: 'reject',
          message: 'Employee with same national ID already exists',
          suggestions: ['This appears to be an existing employee', 'Update existing record instead']
        };
      }
    }
    
    return { hasDuplicates: false, preventionAction: 'allow' };
  }

  /**
   * Find duplicates in dynamic data fields
   */
  private async findDynamicFieldDuplicate(
    organizationId: string,
    entityType: string,
    fieldName: string,
    fieldValue: any
  ): Promise<{ entityIds: string[] } | null> {
    const { data } = await supabase
      .from('core_dynamic_data')
      .select('entity_id, core_entities!inner(organization_id, entity_type)')
      .eq('field_name', fieldName)
      .eq('field_value', fieldValue)
      .eq('core_entities.organization_id', organizationId)
      .eq('core_entities.entity_type', entityType);
    
    if (!data || data.length === 0) return null;
    
    return {
      entityIds: data.map(d => d.entity_id)
    };
  }

  /**
   * Check for similar entities (fuzzy matching)
   */
  private async checkSimilarEntities(
    organizationId: string,
    entityType: string,
    entityData: any
  ): Promise<DuplicateCheckResult> {
    // This would use more sophisticated matching algorithms
    // For now, just check entity name similarity
    if (!entityData.entity_name) {
      return { hasDuplicates: false, preventionAction: 'allow' };
    }
    
    const { data: similar } = await supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', entityType)
      .ilike('entity_name', `%${entityData.entity_name}%`)
      .eq('is_active', true);
    
    if (!similar || similar.length === 0) {
      return { hasDuplicates: false, preventionAction: 'allow' };
    }
    
    // Calculate similarity scores
    const exactMatch = similar.find(s => 
      s.entity_name.toLowerCase() === entityData.entity_name.toLowerCase()
    );
    
    if (exactMatch) {
      return {
        hasDuplicates: true,
        duplicateType: 'entity_name',
        duplicateIds: [exactMatch.id],
        preventionAction: 'manual_review',
        message: `Entity with same name "${entityData.entity_name}" already exists`,
        suggestions: [
          'Add distinguishing information (e.g., location, department)',
          'Use existing entity',
          'Create with different name'
        ]
      };
    }
    
    return { hasDuplicates: false, preventionAction: 'allow' };
  }

  /**
   * Check entity code duplicate
   */
  private async checkEntityCodeDuplicate(
    organizationId: string,
    entityType: string,
    entityCode: string
  ) {
    
    const { data: existing } = await supabase
      .from('core_entities')
      .select('id, entity_name')
      .eq('organization_id', organizationId)
      .eq('entity_type', entityType)
      .eq('entity_code', entityCode)
      .eq('is_active', true);
    
    if (!existing || existing.length === 0) {
      return { hasDuplicates: false, preventionAction: 'allow' };
    }
    
    return {
      hasDuplicates: true,
      duplicateType: 'entity_code',
      duplicateIds: existing.map(e => e.id),
      preventionAction: 'reject',
      message: `Entity code "${entityCode}" is already in use`,
      suggestions: [
        `Use next available code`,
        `Add suffix (e.g., ${entityCode}-2)`,
        `Update existing entity: ${existing[0].entity_name}`
      ]
    };
  }

  /**
   * Determine action for duplicate fields
   */
  private determineFieldAction(
    newField: { name: string; value: any; type: string },
    existingField: any
  ): 'keep_existing' | 'update' | 'create_version' {
    // If values are the same, keep existing
    if (newField.value === existingField.field_value) {
      return 'keep_existing';
    }
    
    // For certain field types, create versions
    if (['price', 'salary', 'rate'].includes(newField.name)) {
      return 'create_version';
    }
    
    // Default to update
    return 'update';
  }

  /**
   * Generate suggestions based on duplicate results
   */
  private generateSuggestions(duplicateResults: DuplicateCheckResult[]): string[] {
    const suggestions = new Set<string>();
    
    duplicateResults.forEach(result => {
      result.suggestions?.forEach(s => suggestions.add(s));
    });
    
    return Array.from(suggestions);
  }

  /**
   * Monitor duplicate patterns across the system
   */
  async monitorDuplicatePatterns(organizationId: string): Promise<DuplicatePattern[]> {
    const patterns: DuplicatePattern[] = [];
    
    // Check for entity duplicates
    const { data: entityDuplicates } = await supabase
      .rpc('detect_entity_duplicates', { org_id: organizationId });
    
    if (entityDuplicates && entityDuplicates.length > 0) {
      patterns.push({
        patternType: 'entity_duplicates',
        frequency: entityDuplicates.length,
        impactLevel: 'high',
        recommendedAction: 'Review and merge duplicate entities',
        affectedEntities: entityDuplicates.map((d: any) => d.entity_type)
      });
    }
    
    // Check for transaction duplicates
    const { data: transactionDuplicates } = await supabase
      .rpc('detect_transaction_duplicates', { org_id: organizationId });
    
    if (transactionDuplicates && transactionDuplicates.length > 0) {
      patterns.push({
        patternType: 'transaction_duplicates',
        frequency: transactionDuplicates.length,
        impactLevel: 'critical',
        recommendedAction: 'Investigate duplicate transactions immediately',
        affectedEntities: transactionDuplicates.map((d: any) => d.transaction_type)
      });
    }
    
    return patterns;
  }

  /**
   * Prevent duplicate metadata by deactivating existing
   */
  async preventDuplicateMetadata(
    organizationId: string,
    entityType: string,
    entityId: string,
    metadataType: string,
    metadataKey: string
  ): Promise<void> {
    await supabase
      .from('core_metadata')
      .update({ 
        is_active: false, 
        effective_to: new Date().toISOString() 
      })
      .eq('organization_id', organizationId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .eq('metadata_type', metadataType)
      .eq('metadata_key', metadataKey)
      .eq('is_active', true);
  }
}

// Export singleton instance
export const duplicatePreventionService = DuplicatePreventionService.getInstance();