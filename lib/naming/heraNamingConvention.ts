/**
 * HERA Universal Naming Convention Framework
 * AI-powered naming validation and suggestion system
 * Prevents schema mismatches through predictable patterns
 */

export interface NamingValidationResult {
  isValid: boolean
  error?: string
  suggestion?: string
  pattern?: string
  confidence?: number
}

export interface FieldMetadata {
  name: string
  purpose: string
  dataType: string
  isRequired: boolean
  references?: string
}

export interface TableSchema {
  tableName: string
  entityType: string
  fields: FieldMetadata[]
  relationships: string[]
}

/**
 * Universal Naming Patterns
 */
export const NAMING_PATTERNS = {
  // Core Identification Patterns
  PRIMARY_KEY: 'id',
  FOREIGN_KEY: '{target_entity}_id',
  ENTITY_CODE: '{entity}_code',
  ENTITY_NAME: '{scope}_name',
  ENTITY_TYPE: '{entity}_type',
  
  // Status and State Patterns
  BOOLEAN_STATUS: 'is_{state}',
  ENTITY_STATUS: '{entity}_status',
  
  // Timestamp Patterns
  CREATED_TIMESTAMP: 'created_at',
  UPDATED_TIMESTAMP: 'updated_at',
  ACTION_TIMESTAMP: '{action}_at',
  
  // Business Semantic Fields
  SEMANTIC_FIELDS: [
    'email', 'currency', 'country', 'industry', 
    'phone', 'address', 'description', 'notes',
    'metadata_value', 'metadata_type', 'metadata_key', 'metadata_category'
  ]
} as const

/**
 * HERA Entity-Specific Naming Conventions
 */
export const ENTITY_CONVENTIONS = {
  core_clients: {
    prefix: 'client',
    requiredFields: ['id', 'client_name', 'client_code', 'client_type', 'is_active'],
    patterns: {
      name: 'client_name',
      code: 'client_code',
      type: 'client_type',
      status: 'is_active'
    }
  },
  core_organizations: {
    prefix: 'org',
    requiredFields: ['id', 'client_id', 'org_name', 'org_code', 'industry', 'is_active'],
    patterns: {
      name: 'org_name',
      code: 'org_code',
      type: 'industry', // Semantic alternative to org_type
      foreignKey: 'client_id',
      status: 'is_active'
    }
  },
  core_users: {
    prefix: 'user',
    requiredFields: ['id', 'email', 'full_name', 'user_role', 'auth_user_id', 'is_active'],
    patterns: {
      name: 'full_name', // Single field instead of first_name/last_name
      role: 'user_role',
      externalId: 'auth_user_id',
      status: 'is_active'
    }
  },
  core_entities: {
    prefix: 'entity',
    requiredFields: ['id', 'organization_id', 'entity_type', 'entity_name', 'entity_code', 'is_active'],
    patterns: {
      name: 'entity_name',
      code: 'entity_code',
      type: 'entity_type',
      foreignKey: 'organization_id',
      status: 'is_active'
    }
  },
  universal_transactions: {
    prefix: 'transaction',
    requiredFields: ['id', 'organization_id', 'transaction_type', 'transaction_number', 'transaction_date', 'transaction_status'],
    patterns: {
      type: 'transaction_type',
      number: 'transaction_number',
      date: 'transaction_date',
      status: 'transaction_status',
      foreignKey: 'organization_id'
    }
  },
  core_metadata: {
    prefix: 'metadata',
    requiredFields: ['organization_id', 'entity_type', 'entity_id', 'metadata_type', 'metadata_value'],
    patterns: {
      type: 'metadata_type',
      value: 'metadata_value',
      key: 'metadata_key',
      category: 'metadata_category',
      foreignKey: 'entity_id'
    }
  }
} as const

/**
 * AI-Powered Naming Convention Engine
 */
export class HeraNamingConventionAI {
  private static learnedPatterns: Map<string, number> = new Map()
  private static entityPatterns: Map<string, any> = new Map()

  /**
   * Learn patterns from existing schema
   */
  static async learnPatternsFromSchema(schema: TableSchema[]): Promise<void> {
    console.log('🧠 Learning naming patterns from HERA schema...')
    
    for (const table of schema) {
      const entityType = this.extractEntityType(table.tableName)
      const patterns = this.analyzeFieldPatterns(table.fields)
      
      this.entityPatterns.set(table.tableName, {
        entityType,
        patterns,
        fieldCount: table.fields.length,
        confidence: this.calculatePatternConfidence(patterns)
      })
    }
    
    console.log(`✅ Learned patterns for ${schema.length} tables`)
  }

  /**
   * Generate field name following HERA conventions
   */
  static async generateFieldName(
    tableName: string,
    fieldPurpose: string,
    dataType: string,
    references?: string
  ): Promise<string> {
    const entityType = this.extractEntityType(tableName)
    const convention = ENTITY_CONVENTIONS[tableName as keyof typeof ENTITY_CONVENTIONS]
    
    // Apply universal patterns
    switch (fieldPurpose) {
      case 'primary_key':
        return 'id'
        
      case 'foreign_key':
        if (references) {
          const refEntity = this.extractEntityType(references)
          return `${refEntity}_id`
        }
        return `${entityType}_id`
        
      case 'entity_code':
        return convention ? `${convention.prefix}_code` : `${entityType}_code`
        
      case 'entity_name':
        return convention ? `${convention.prefix}_name` : `${entityType}_name`
        
      case 'entity_type':
        return convention?.patterns.type || `${entityType}_type`
        
      case 'boolean_status':
        return convention?.patterns.status || 'is_active'
        
      case 'created_timestamp':
        return 'created_at'
        
      case 'updated_timestamp':
        return 'updated_at'
        
      case 'semantic_field':
        // Use semantic naming for business fields
        return this.generateSemanticName(fieldPurpose, dataType)
        
      default:
        return this.generateSemanticName(fieldPurpose, dataType)
    }
  }

  /**
   * Validate field name against HERA conventions
   */
  static async validateFieldName(
    tableName: string,
    fieldName: string,
    fieldPurpose?: string
  ): Promise<NamingValidationResult> {
    const convention = ENTITY_CONVENTIONS[tableName as keyof typeof ENTITY_CONVENTIONS]
    const entityType = this.extractEntityType(tableName)
    
    // Check universal patterns
    if (fieldName === 'id') {
      return { isValid: true, pattern: 'Primary key pattern', confidence: 1.0 }
    }
    
    if (fieldName.endsWith('_id')) {
      const refEntity = fieldName.replace('_id', '')
      return { 
        isValid: true, 
        pattern: `Foreign key pattern: ${refEntity}_id`, 
        confidence: 0.95 
      }
    }
    
    if (fieldName.endsWith('_code')) {
      const expectedPrefix = convention?.prefix || entityType
      const actualPrefix = fieldName.replace('_code', '')
      
      if (actualPrefix === expectedPrefix) {
        return { isValid: true, pattern: `Entity code pattern: ${expectedPrefix}_code`, confidence: 1.0 }
      } else {
        return {
          isValid: false,
          error: `Code field should use prefix '${expectedPrefix}'`,
          suggestion: `${expectedPrefix}_code`,
          pattern: 'Entity code pattern',
          confidence: 0.8
        }
      }
    }
    
    if (fieldName.endsWith('_name')) {
      const expectedPrefix = convention?.prefix || entityType
      const actualPrefix = fieldName.replace('_name', '')
      
      if (actualPrefix === expectedPrefix) {
        return { isValid: true, pattern: `Entity name pattern: ${expectedPrefix}_name`, confidence: 1.0 }
      }
    }
    
    if (fieldName.startsWith('is_')) {
      return { isValid: true, pattern: 'Boolean status pattern: is_[state]', confidence: 1.0 }
    }
    
    if (fieldName.endsWith('_at')) {
      return { isValid: true, pattern: 'Timestamp pattern: [action]_at', confidence: 1.0 }
    }
    
    if (NAMING_PATTERNS.SEMANTIC_FIELDS.includes(fieldName)) {
      return { isValid: true, pattern: 'Semantic naming', confidence: 1.0 }
    }
    
    // Check convention-specific patterns
    if (convention) {
      const conventionValidation = this.validateAgainstConvention(fieldName, convention)
      if (conventionValidation.isValid) {
        return conventionValidation
      }
    }
    
    // Allow 'name' field for menu entities (menu_category, menu_item, etc.)
    if (fieldName === 'name' && tableName.startsWith('menu_')) {
      return { isValid: true, pattern: 'Menu entity name field', confidence: 1.0 }
    }
    
    // Field doesn't match any pattern
    return {
      isValid: false,
      error: `Field '${fieldName}' doesn't follow HERA naming conventions`,
      suggestion: await this.suggestCorrectName(tableName, fieldName, fieldPurpose),
      pattern: 'Expected: [entity]_[attribute] or semantic naming',
      confidence: 0.3
    }
  }

  /**
   * Suggest correct field name
   */
  static async suggestCorrectName(
    tableName: string,
    currentName: string,
    purpose?: string
  ): Promise<string> {
    const entityType = this.extractEntityType(tableName)
    const convention = ENTITY_CONVENTIONS[tableName as keyof typeof ENTITY_CONVENTIONS]
    
    // Analyze current name to understand intent
    if (currentName.includes('name') && !currentName.includes('_')) {
      return convention?.patterns.name || `${entityType}_name`
    }
    
    if (currentName.includes('code') && !currentName.includes('_')) {
      return convention?.patterns.code || `${entityType}_code`
    }
    
    if (currentName.includes('type') && !currentName.includes('_')) {
      return convention?.patterns.type || `${entityType}_type`
    }
    
    if (currentName.includes('status') && !currentName.startsWith('is_')) {
      return 'is_active'
    }
    
    // Handle common legacy patterns
    const legacyMappings: Record<string, string> = {
      'first_name': 'full_name',
      'last_name': 'full_name',
      'fname': 'full_name',
      'lname': 'full_name',
      'code': `${entityType}_code`,
      'name': `${entityType}_name`,
      'type': convention?.patterns.type || `${entityType}_type`,
      'status': 'is_active',
      'active': 'is_active'
    }
    
    if (legacyMappings[currentName]) {
      return legacyMappings[currentName]
    }
    
    // Default suggestion
    return `${entityType}_${currentName}`
  }

  /**
   * Generate migration script for field renames
   */
  static async generateMigrationScript(
    tableName: string,
    fieldMappings: Array<{ old: string; new: string }>
  ): Promise<string> {
    let script = `-- HERA Naming Convention Migration for ${tableName}\n`
    script += `-- Generated by HeraNamingConventionAI\n\n`
    
    for (const mapping of fieldMappings) {
      script += `-- Rename ${mapping.old} to ${mapping.new}\n`
      script += `ALTER TABLE ${tableName} RENAME COLUMN ${mapping.old} TO ${mapping.new};\n\n`
    }
    
    script += `-- Update indexes for renamed columns\n`
    for (const mapping of fieldMappings) {
      if (mapping.new.endsWith('_code') || mapping.new.endsWith('_name')) {
        script += `CREATE INDEX IF NOT EXISTS idx_${tableName}_${mapping.new} ON ${tableName}(${mapping.new});\n`
      }
    }
    
    return script
  }

  /**
   * Real-time validation for development
   */
  static async validateOnType(
    tableName: string,
    fieldName: string
  ): Promise<NamingValidationResult> {
    return await this.validateFieldName(tableName, fieldName)
  }

  // Private helper methods
  private static extractEntityType(tableName: string): string {
    // Extract entity type from table name
    if (tableName.startsWith('core_')) {
      const entity = tableName.replace('core_', '').replace(/s$/, '') // Remove plural
      return entity
    }
    
    if (tableName.startsWith('universal_')) {
      const entity = tableName.replace('universal_', '').replace(/s$/, '')
      return entity
    }
    
    return tableName.replace(/s$/, '') // Remove plural
  }

  private static analyzeFieldPatterns(fields: FieldMetadata[]): any {
    const patterns = {
      hasId: fields.some(f => f.name === 'id'),
      hasForeignKeys: fields.filter(f => f.name.endsWith('_id')).length,
      hasTimestamps: fields.filter(f => f.name.endsWith('_at')).length,
      hasStatusFields: fields.filter(f => f.name.startsWith('is_')).length,
      hasCodeFields: fields.filter(f => f.name.endsWith('_code')).length,
      hasNameFields: fields.filter(f => f.name.endsWith('_name')).length
    }
    
    return patterns
  }

  private static calculatePatternConfidence(patterns: any): number {
    let score = 0
    let maxScore = 6
    
    if (patterns.hasId) score += 1
    if (patterns.hasForeignKeys > 0) score += 1
    if (patterns.hasTimestamps >= 2) score += 1 // created_at and updated_at
    if (patterns.hasStatusFields > 0) score += 1
    if (patterns.hasCodeFields > 0) score += 1
    if (patterns.hasNameFields > 0) score += 1
    
    return score / maxScore
  }

  private static validateAgainstConvention(
    fieldName: string,
    convention: any
  ): NamingValidationResult {
    // Check if field matches convention patterns
    for (const [patternType, expectedName] of Object.entries(convention.patterns)) {
      if (fieldName === expectedName) {
        return {
          isValid: true,
          pattern: `Convention pattern: ${patternType}`,
          confidence: 1.0
        }
      }
    }
    
    return { isValid: false }
  }

  private static generateSemanticName(purpose: string, dataType: string): string {
    // Generate semantic field names based on purpose and type
    const semanticMappings: Record<string, string> = {
      'contact_email': 'email',
      'business_email': 'email',
      'phone_number': 'phone',
      'telephone': 'phone',
      'mobile': 'phone',
      'location_country': 'country',
      'business_country': 'country',
      'payment_currency': 'currency',
      'business_currency': 'currency',
      'business_category': 'industry',
      'company_type': 'industry',
      'business_type': 'industry'
    }
    
    return semanticMappings[purpose] || purpose.toLowerCase().replace(/[^a-z0-9]/g, '_')
  }
}

/**
 * TypeScript type generator from naming conventions
 */
export class HeraTypeGenerator {
  static async generateTableTypes(tableName: string): Promise<string> {
    const convention = ENTITY_CONVENTIONS[tableName as keyof typeof ENTITY_CONVENTIONS]
    if (!convention) {
      throw new Error(`No naming convention found for table: ${tableName}`)
    }
    
    const entityType = tableName.replace('core_', '').replace('universal_', '')
    const typeName = this.pascalCase(entityType)
    
    let typeDefinition = `export interface ${typeName} {\n`
    
    // Generate fields based on convention
    for (const field of convention.requiredFields) {
      const tsType = this.mapSqlTypeToTypeScript(field)
      typeDefinition += `  ${field}: ${tsType}\n`
    }
    
    typeDefinition += `  created_at: string\n`
    typeDefinition += `  updated_at: string\n`
    typeDefinition += `}\n\n`
    
    // Generate create interface
    typeDefinition += `export interface Create${typeName}Data {\n`
    for (const field of convention.requiredFields) {
      if (field !== 'id' && !field.includes('created_at') && !field.includes('updated_at')) {
        const tsType = this.mapSqlTypeToTypeScript(field)
        typeDefinition += `  ${field}: ${tsType}\n`
      }
    }
    typeDefinition += `}\n`
    
    return typeDefinition
  }

  private static pascalCase(str: string): string {
    return str.replace(/(^|_)([a-z])/g, (_, __, char) => char.toUpperCase())
  }

  private static mapSqlTypeToTypeScript(field: string): string {
    if (field === 'id' || field.endsWith('_id')) return 'string'
    if (field.startsWith('is_')) return 'boolean'
    if (field.endsWith('_at')) return 'string'
    if (field.includes('amount') || field.includes('price')) return 'number'
    return 'string'
  }
}

export default HeraNamingConventionAI