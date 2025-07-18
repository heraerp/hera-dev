// lib/types/duplicate-prevention.ts
import { SupabaseClient } from '@supabase/supabase-js';

export class DuplicatePreventionService {
  private supabase: SupabaseClient;
  
  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }
  
  async checkEntityDuplicates(
    organizationId: string,
    entityType: string,
    entityData: any
  ): Promise<DuplicateCheckResult> {
    const checks = [
      this.checkEntityCodeDuplicates(organizationId, entityType, entityData.entity_code),
      this.checkBusinessRuleDuplicates(organizationId, entityType, entityData),
      this.checkDynamicDataDuplicates(organizationId, entityType, entityData)
    ];
    
    const results = await Promise.all(checks);
    
    return {
      hasDuplicates: results.some(r => r.hasDuplicates),
      duplicateType: results.find(r => r.hasDuplicates)?.duplicateType || null,
      duplicateIds: results.flatMap(r => r.duplicateIds || []),
      preventionAction: this.determinePrevention(results)
    };
  }
  
  private async checkEntityCodeDuplicates(
    organizationId: string,
    entityType: string,
    entityCode: string
  ): Promise<DuplicateCheckResult> {
    const { data, error } = await this.supabase
      .from('core_entities')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('entity_type', entityType)
      .eq('entity_code', entityCode)
      .eq('is_active', true);
    
    return {
      hasDuplicates: data && data.length > 0,
      duplicateType: 'entity_code',
      duplicateIds: data?.map(d => d.id) || [],
      preventionAction: data && data.length > 0 ? 'reject' : 'allow'
    };
  }
  
  private async checkBusinessRuleDuplicates(
    organizationId: string,
    entityType: string,
    entityData: any
  ): Promise<DuplicateCheckResult> {
    // Business-specific duplicate checks
    switch (entityType) {
      case 'customer':
        return this.checkCustomerDuplicates(organizationId, entityData);
      case 'product':
        return this.checkProductDuplicates(organizationId, entityData);
      case 'invoice':
        return this.checkInvoiceDuplicates(organizationId, entityData);
      default:
        return { hasDuplicates: false, preventionAction: 'allow' };
    }
  }
  
  private async checkCustomerDuplicates(
    organizationId: string,
    customerData: any
  ): Promise<DuplicateCheckResult> {
    // Check for duplicate customers by email, phone, or tax ID
    const emailCheck = customerData.email ? await this.checkDynamicFieldDuplicate(
      organizationId, 'customer', 'email', customerData.email
    ) : null;
    
    const phoneCheck = customerData.phone ? await this.checkDynamicFieldDuplicate(
      organizationId, 'customer', 'phone', customerData.phone
    ) : null;
    
    const taxIdCheck = customerData.tax_id ? await this.checkDynamicFieldDuplicate(
      organizationId, 'customer', 'tax_id', customerData.tax_id
    ) : null;
    
    const duplicateChecks = [emailCheck, phoneCheck, taxIdCheck].filter(Boolean);
    const hasDuplicates = duplicateChecks.some(check => check.hasDuplicates);
    
    return {
      hasDuplicates,
      duplicateType: 'customer_business_rule',
      duplicateIds: duplicateChecks.flatMap(check => check.duplicateIds || []),
      preventionAction: hasDuplicates ? 'merge_or_reject' : 'allow'
    };
  }
  
  async preventDuplicateMetadata(
    organizationId: string,
    entityType: string,
    entityId: string,
    metadataType: string,
    metadataCategory: string,
    metadataKey: string
  ): Promise<void> {
    // Deactivate existing metadata before inserting new
    await this.supabase
      .from('core_metadata')
      .update({ is_active: false, effective_to: new Date().toISOString() })
      .eq('organization_id', organizationId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .eq('metadata_type', metadataType)
      .eq('metadata_category', metadataCategory)
      .eq('metadata_key', metadataKey)
      .eq('is_active', true);
  }
  
  async monitorDuplicatePatterns(): Promise<DuplicatePattern[]> {
    // Monitor for duplicate patterns across the system
    const patterns = await Promise.all([
      this.detectEntityDuplicatePatterns(),
      this.detectTransactionDuplicatePatterns(),
      this.detectAIDuplicatePatterns()
    ]);
    
    return patterns.flat();
  }

  private determinePrevention(results: DuplicateCheckResult[]): string {
    if (results.some(r => r.preventionAction === 'reject')) return 'reject';
    if (results.some(r => r.preventionAction === 'merge_or_reject')) return 'merge_or_reject';
    if (results.some(r => r.preventionAction === 'manual_review')) return 'manual_review';
    return 'allow';
  }

  private async checkDynamicDataDuplicates(
    organizationId: string,
    entityType: string,
    entityData: any
  ): Promise<DuplicateCheckResult> {
    return { hasDuplicates: false, preventionAction: 'allow' };
  }

  private async checkProductDuplicates(
    organizationId: string,
    productData: any
  ): Promise<DuplicateCheckResult> {
    return { hasDuplicates: false, preventionAction: 'allow' };
  }

  private async checkInvoiceDuplicates(
    organizationId: string,
    invoiceData: any
  ): Promise<DuplicateCheckResult> {
    return { hasDuplicates: false, preventionAction: 'allow' };
  }

  private async checkDynamicFieldDuplicate(
    organizationId: string,
    entityType: string,
    fieldName: string,
    fieldValue: string
  ): Promise<DuplicateCheckResult> {
    return { hasDuplicates: false, preventionAction: 'allow' };
  }

  private async detectEntityDuplicatePatterns(): Promise<DuplicatePattern[]> {
    return [];
  }

  private async detectTransactionDuplicatePatterns(): Promise<DuplicatePattern[]> {
    return [];
  }

  private async detectAIDuplicatePatterns(): Promise<DuplicatePattern[]> {
    return [];
  }
}

interface DuplicateCheckResult {
  hasDuplicates: boolean;
  duplicateType?: string;
  duplicateIds?: string[];
  preventionAction: 'allow' | 'reject' | 'merge_or_reject' | 'manual_review';
}

interface DuplicatePattern {
  patternType: string;
  frequency: number;
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendedAction: string;
}