/**
 * HERA AI Schema Generator
 * Intelligent schema generation for ANY business requirement
 * Uses AI to analyze requirements and generate optimal database schemas
 */

import { z } from 'zod';

// Business Domain Knowledge Base
const BUSINESS_DOMAINS = {
  finance: {
    keywords: ['invoice', 'payment', 'expense', 'revenue', 'tax', 'accounting', 'budget', 'cost', 'profit', 'loss', 'balance', 'ledger', 'journal', 'credit', 'debit', 'financial'],
    commonFields: [
      { name: 'amount', type: 'currency', required: true },
      { name: 'date', type: 'date', required: true },
      { name: 'reference_number', type: 'text', required: true },
      { name: 'description', type: 'textarea', required: false },
      { name: 'status', type: 'select', required: true, options: ['pending', 'approved', 'rejected', 'paid'] }
    ],
    entities: ['invoice', 'payment', 'expense', 'budget', 'journal_entry', 'account', 'transaction']
  },
  
  crm: {
    keywords: ['customer', 'client', 'contact', 'lead', 'opportunity', 'prospect', 'sales', 'marketing', 'campaign', 'deal', 'pipeline', 'relationship'],
    commonFields: [
      { name: 'name', type: 'text', required: true },
      { name: 'email', type: 'email', required: true },
      { name: 'phone', type: 'phone', required: true },
      { name: 'company', type: 'text', required: false },
      { name: 'status', type: 'select', required: true, options: ['active', 'inactive', 'potential', 'converted'] }
    ],
    entities: ['customer', 'lead', 'contact', 'opportunity', 'campaign', 'deal']
  },
  
  inventory: {
    keywords: ['product', 'item', 'stock', 'inventory', 'warehouse', 'supplier', 'purchase', 'order', 'quantity', 'unit', 'category', 'catalog'],
    commonFields: [
      { name: 'product_name', type: 'text', required: true },
      { name: 'product_code', type: 'text', required: true },
      { name: 'quantity', type: 'number', required: true },
      { name: 'unit_price', type: 'currency', required: true },
      { name: 'category', type: 'select', required: true, options: ['raw_materials', 'finished_goods', 'consumables'] },
      { name: 'supplier', type: 'text', required: false }
    ],
    entities: ['product', 'inventory', 'stock', 'supplier', 'purchase_order', 'goods_receipt']
  },
  
  hr: {
    keywords: ['employee', 'staff', 'personnel', 'payroll', 'salary', 'department', 'position', 'hire', 'performance', 'leave', 'attendance'],
    commonFields: [
      { name: 'employee_id', type: 'text', required: true },
      { name: 'full_name', type: 'text', required: true },
      { name: 'email', type: 'email', required: true },
      { name: 'department', type: 'select', required: true, options: ['finance', 'hr', 'it', 'operations', 'sales'] },
      { name: 'position', type: 'text', required: true },
      { name: 'hire_date', type: 'date', required: true },
      { name: 'is_active', type: 'boolean', required: true }
    ],
    entities: ['employee', 'department', 'position', 'payroll', 'leave', 'attendance']
  },
  
  project: {
    keywords: ['project', 'task', 'milestone', 'deadline', 'resource', 'team', 'timeline', 'deliverable', 'scope', 'budget', 'client'],
    commonFields: [
      { name: 'project_name', type: 'text', required: true },
      { name: 'project_code', type: 'text', required: true },
      { name: 'start_date', type: 'date', required: true },
      { name: 'end_date', type: 'date', required: false },
      { name: 'budget', type: 'currency', required: false },
      { name: 'status', type: 'select', required: true, options: ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'] },
      { name: 'description', type: 'textarea', required: false }
    ],
    entities: ['project', 'task', 'milestone', 'resource', 'team', 'deliverable']
  },
  
  restaurant: {
    keywords: ['menu', 'item', 'ingredient', 'recipe', 'order', 'table', 'customer', 'reservation', 'kitchen', 'food', 'beverage', 'meal'],
    commonFields: [
      { name: 'name', type: 'text', required: true },
      { name: 'price', type: 'currency', required: true },
      { name: 'category', type: 'select', required: true, options: ['appetizer', 'main_course', 'dessert', 'beverage'] },
      { name: 'description', type: 'textarea', required: false },
      { name: 'is_available', type: 'boolean', required: true },
      { name: 'preparation_time', type: 'number', required: false }
    ],
    entities: ['menu_item', 'order', 'table', 'reservation', 'ingredient', 'recipe']
  },
  
  retail: {
    keywords: ['product', 'sale', 'customer', 'transaction', 'price', 'discount', 'promotion', 'category', 'brand', 'retail', 'store'],
    commonFields: [
      { name: 'product_name', type: 'text', required: true },
      { name: 'price', type: 'currency', required: true },
      { name: 'category', type: 'select', required: true, options: ['electronics', 'clothing', 'food', 'home', 'books'] },
      { name: 'brand', type: 'text', required: false },
      { name: 'in_stock', type: 'boolean', required: true },
      { name: 'description', type: 'textarea', required: false }
    ],
    entities: ['product', 'sale', 'customer', 'transaction', 'promotion', 'category']
  }
};

// Field Type Patterns
const FIELD_PATTERNS = {
  // Identity fields
  id: { type: 'text', pattern: /\b(id|identifier|code|number)\b/i },
  name: { type: 'text', pattern: /\b(name|title|label|designation)\b/i },
  
  // Contact fields
  email: { type: 'email', pattern: /\b(email|mail|e-mail)\b/i },
  phone: { type: 'phone', pattern: /\b(phone|mobile|contact|telephone)\b/i },
  address: { type: 'textarea', pattern: /\b(address|location|place)\b/i },
  website: { type: 'url', pattern: /\b(website|url|site|link)\b/i },
  
  // Financial fields
  currency: { type: 'currency', pattern: /\b(amount|price|cost|budget|salary|wage|fee|payment|revenue|expense|total|subtotal|tax|discount)\b/i },
  percentage: { type: 'percentage', pattern: /\b(rate|percent|percentage|commission|discount|tax_rate)\b/i },
  
  // Date/Time fields
  date: { type: 'date', pattern: /\b(date|day|birthday|deadline|due|start|end|created|updated|modified)\b/i },
  datetime: { type: 'datetime', pattern: /\b(datetime|timestamp|time|scheduled|appointment)\b/i },
  
  // Boolean fields
  boolean: { type: 'boolean', pattern: /\b(is_|has_|can_|should_|active|enabled|disabled|complete|finished|approved|published|visible)\b/i },
  
  // Text fields
  description: { type: 'textarea', pattern: /\b(description|details|notes|comments|remarks|summary|content|body|message)\b/i },
  
  // Status fields
  status: { 
    type: 'select', 
    pattern: /\b(status|state|stage|phase|condition|level|priority|type|category|classification)\b/i,
    options: ['active', 'inactive', 'pending', 'completed', 'cancelled', 'draft', 'published']
  },
  
  // Quantity fields
  quantity: { type: 'number', pattern: /\b(quantity|count|number|amount|size|weight|volume|capacity|stock|inventory)\b/i }
};

// AI Schema Generator Class
export class AISchemaGenerator {
  private static businessDomains = BUSINESS_DOMAINS;
  private static fieldPatterns = FIELD_PATTERNS;
  private static aiEnabled = true;
  
  /**
   * Enable or disable AI processing
   */
  static setAIEnabled(enabled: boolean): void {
    this.aiEnabled = enabled;
  }
  
  /**
   * Check if AI is available and configured
   */
  static isAIAvailable(): boolean {
    return this.aiEnabled && (!!process.env.ANTHROPIC_API_KEY || !!process.env.OPENAI_API_KEY);
  }
  
  /**
   * Generate schema from business requirement using AI (Claude first, OpenAI fallback)
   */
  static async generateSchema(requirement: string, entityType?: string, organizationId?: string): Promise<GeneratedSchema> {
    // Check for similar existing schemas first
    if (organizationId) {
      console.log('🔍 HERA: Checking for existing similar schemas...');
      const { schemaRegistry } = await import('@/lib/services/schema-registry-service');
      
      const similarSchemas = await schemaRegistry.findSimilarSchemas(
        organizationId, 
        requirement, 
        entityType
      );
      
      if (similarSchemas.length > 0) {
        const topMatch = similarSchemas[0];
        console.log(`📊 HERA: Found similar schema: ${topMatch.entity_type} (${(topMatch.similarity_score * 100).toFixed(1)}% match)`);
        
        if (topMatch.recommendation === 'use_existing' && topMatch.similarity_score > 0.8) {
          console.log('✨ HERA: Using existing schema:', topMatch.reason);
          
          // Fetch and return the existing schema
          const existingSchema = await schemaRegistry.getSchemaByType(organizationId, topMatch.entity_type);
          if (existingSchema?.schema_definition) {
            return existingSchema.schema_definition as GeneratedSchema;
          }
        }
      }
    }

    // Try Claude first with organization context
    try {
      console.log('🧠 HERA: Attempting schema generation with Claude AI...');
      const claudeSchema = await this.generateSchemaWithClaude(requirement, entityType, organizationId);
      if (claudeSchema && claudeSchema.confidence > 0.7) {
        console.log('✅ HERA: Schema generated successfully with Claude');
        
        // Register the new schema
        if (organizationId) {
          const { schemaRegistry } = await import('@/lib/services/schema-registry-service');
          await schemaRegistry.registerSchema(
            organizationId,
            claudeSchema.entityType,
            claudeSchema.entityName,
            claudeSchema,
            true // AI generated
          );
        }
        
        return claudeSchema;
      }
    } catch (error) {
      console.warn('⚠️ HERA: Claude schema generation failed, trying OpenAI fallback:', error);
    }

    // Fallback to OpenAI with organization context
    try {
      console.log('🤖 HERA: Attempting schema generation with OpenAI fallback...');
      const openAISchema = await this.generateSchemaWithOpenAI(requirement, entityType, organizationId);
      if (openAISchema && openAISchema.confidence > 0.7) {
        console.log('✅ HERA: Schema generated successfully with OpenAI');
        
        // Register the new schema
        if (organizationId) {
          const { schemaRegistry } = await import('@/lib/services/schema-registry-service');
          await schemaRegistry.registerSchema(
            organizationId,
            openAISchema.entityType,
            openAISchema.entityName,
            openAISchema,
            true // AI generated
          );
        }
        
        return openAISchema;
      }
    } catch (error) {
      console.warn('⚠️ HERA: OpenAI schema generation failed, using rule-based fallback:', error);
    }

    // Final fallback to rule-based generation
    console.log('🔧 HERA: Using rule-based schema generation as final fallback');
    return this.generateSchemaRuleBased(requirement, entityType);
  }

  /**
   * Generate schema using Claude AI
   */
  static async generateSchemaWithClaude(requirement: string, entityType?: string, organizationId?: string): Promise<GeneratedSchema> {
    const { anthropicIntegration } = await import('./ai/anthropic-integration');
    
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key not configured');
    }

    // Get context about existing schemas if organization ID is provided
    let existingSchemaContext = '';
    if (organizationId) {
      const { schemaRegistry } = await import('@/lib/services/schema-registry-service');
      existingSchemaContext = await schemaRegistry.generateAIContext(organizationId);
    }

    // Enhanced requirement with context
    const enhancedRequirement = existingSchemaContext 
      ? `${requirement}\n\nExisting Schema Context:\n${existingSchemaContext}`
      : requirement;

    const schema = await anthropicIntegration.generateSchema(enhancedRequirement, entityType);
    return this.validateAndEnhanceSchema(schema, requirement);
  }

  /**
   * Generate schema using OpenAI
   */
  static async generateSchemaWithOpenAI(requirement: string, entityType?: string, organizationId?: string): Promise<GeneratedSchema> {
    const { openAIIntegration } = await import('./ai/openai-integration');
    
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Get context about existing schemas if organization ID is provided
    let existingSchemaContext = '';
    if (organizationId) {
      const { schemaRegistry } = await import('@/lib/services/schema-registry-service');
      existingSchemaContext = await schemaRegistry.generateAIContext(organizationId);
    }

    // Enhanced requirement with context
    const enhancedRequirement = existingSchemaContext 
      ? `${requirement}\n\nExisting Schema Context:\n${existingSchemaContext}`
      : requirement;

    const schema = await openAIIntegration.generateSchema(enhancedRequirement, entityType);
    return this.validateAndEnhanceSchema(schema, requirement);
  }

  /**
   * Generate schema using rule-based approach (fallback)
   */
  static generateSchemaRuleBased(requirement: string, entityType?: string): GeneratedSchema {
    const analyzedRequirement = this.analyzeRequirement(requirement);
    const domain = this.identifyDomain(requirement);
    const fields = this.generateFields(requirement, domain);
    const metadata = this.generateMetadata(requirement, domain);
    
    return {
      entityType: entityType || analyzedRequirement.entityType,
      name: this.generateEntityName(requirement, entityType),
      domain: domain,
      fields: fields,
      metadata: metadata,
      confidence: this.calculateConfidence(requirement, domain, fields),
      suggestions: this.generateSuggestions(requirement, domain, fields),
      validationRules: this.generateValidationRules(fields),
      businessRules: this.generateBusinessRules(requirement, domain),
      auditTrail: {
        generated_at: new Date().toISOString(),
        requirement: requirement,
        analysis: analyzedRequirement
      }
    };
  }

  /**
   * Validate and enhance AI-generated schema
   */
  static validateAndEnhanceSchema(schema: any, requirement: string): GeneratedSchema {
    // Ensure all required fields are present
    const validatedSchema = {
      entityType: schema.entityType || 'custom_entity',
      name: schema.entityName || this.generateEntityName(requirement),
      domain: schema.domain || { name: 'general', confidence: 0.5, keywords: [], commonFields: [] },
      fields: schema.fields || [],
      metadata: schema.metadata || this.generateMetadata(requirement, schema.domain),
      confidence: schema.confidence || 0.8,
      suggestions: schema.suggestions || [],
      validationRules: schema.validationRules || {},
      businessRules: schema.businessRules || [],
      auditTrail: schema.auditTrail || {
        generated_at: new Date().toISOString(),
        requirement: requirement,
        analysis: { originalText: requirement, entityType: schema.entityType, complexity: 0.7 }
      }
    };

    // Add standard system fields if missing
    this.ensureSystemFields(validatedSchema.fields);

    // Enhance metadata with AI indicator
    if (!validatedSchema.metadata.ai_insights) {
      validatedSchema.metadata.ai_insights = [];
    }
    
    validatedSchema.metadata.ai_insights.push({
      type: 'performance',
      title: 'AI-Generated Schema',
      description: 'This schema was generated using advanced AI analysis for optimal business process alignment.',
      priority: 'medium',
      recommendation: 'Review and customize fields based on specific business requirements.'
    });

    return validatedSchema as GeneratedSchema;
  }

  /**
   * Ensure system fields are present
   */
  static ensureSystemFields(fields: GeneratedField[]): void {
    const systemFields = [
      { name: 'id', type: 'text', required: true, label: 'ID', source: 'system' as const },
      { name: 'created_at', type: 'datetime', required: true, label: 'Created At', source: 'system' as const },
      { name: 'updated_at', type: 'datetime', required: true, label: 'Updated At', source: 'system' as const }
    ];

    systemFields.forEach(sysField => {
      if (!fields.some(f => f.name === sysField.name)) {
        fields.unshift({
          ...sysField,
          confidence: 1.0,
          aiGenerated: false
        });
      }
    });
  }
  
  /**
   * Analyze business requirement text
   */
  private static analyzeRequirement(requirement: string): RequirementAnalysis {
    const words = requirement.toLowerCase().split(/\s+/);
    const sentences = requirement.split(/[.!?]+/).filter(s => s.trim());
    
    // Extract key entities
    const entities = this.extractEntities(words);
    
    // Extract actions/operations
    const actions = this.extractActions(words);
    
    // Extract business rules
    const businessRules = this.extractBusinessRules(sentences);
    
    // Extract field requirements
    const fieldRequirements = this.extractFieldRequirements(sentences);
    
    // Determine entity type
    const entityType = this.determineEntityType(entities, actions);
    
    return {
      originalText: requirement,
      words: words,
      sentences: sentences,
      entities: entities,
      actions: actions,
      businessRules: businessRules,
      fieldRequirements: fieldRequirements,
      entityType: entityType,
      complexity: this.calculateComplexity(words, sentences, entities)
    };
  }
  
  /**
   * Identify business domain
   */
  private static identifyDomain(requirement: string): BusinessDomain {
    const words = requirement.toLowerCase().split(/\s+/);
    const domainScores: Record<string, number> = {};
    
    // Score each domain based on keyword matches
    Object.entries(this.businessDomains).forEach(([domain, config]) => {
      domainScores[domain] = 0;
      
      config.keywords.forEach(keyword => {
        const matches = words.filter(word => 
          word.includes(keyword) || keyword.includes(word)
        ).length;
        domainScores[domain] += matches;
      });
    });
    
    // Find best matching domain
    const bestDomain = Object.entries(domainScores).reduce((a, b) => 
      domainScores[a[0]] > domainScores[b[0]] ? a : b
    )[0];
    
    return {
      name: bestDomain,
      confidence: domainScores[bestDomain] / words.length,
      keywords: this.businessDomains[bestDomain as keyof typeof this.businessDomains]?.keywords || [],
      commonFields: this.businessDomains[bestDomain as keyof typeof this.businessDomains]?.commonFields || []
    };
  }
  
  /**
   * Generate fields based on requirement and domain
   */
  private static generateFields(requirement: string, domain: BusinessDomain): GeneratedField[] {
    const words = requirement.toLowerCase().split(/\s+/);
    const fields: GeneratedField[] = [];
    
    // Add domain-specific common fields
    domain.commonFields.forEach(field => {
      fields.push({
        ...field,
        source: 'domain',
        confidence: 0.8,
        aiGenerated: true
      });
    });
    
    // Extract fields from requirement text
    const extractedFields = this.extractFieldsFromText(requirement);
    extractedFields.forEach(field => {
      // Check if field already exists
      const existingField = fields.find(f => f.name === field.name);
      if (!existingField) {
        fields.push(field);
      }
    });
    
    // Add standard fields
    if (!fields.some(f => f.name === 'id')) {
      fields.unshift({
        name: 'id',
        type: 'text',
        required: true,
        label: 'ID',
        source: 'system',
        confidence: 1.0,
        aiGenerated: false
      });
    }
    
    if (!fields.some(f => f.name === 'created_at')) {
      fields.push({
        name: 'created_at',
        type: 'datetime',
        required: true,
        label: 'Created At',
        source: 'system',
        confidence: 1.0,
        aiGenerated: false
      });
    }
    
    if (!fields.some(f => f.name === 'updated_at')) {
      fields.push({
        name: 'updated_at',
        type: 'datetime',
        required: true,
        label: 'Updated At',
        source: 'system',
        confidence: 1.0,
        aiGenerated: false
      });
    }
    
    return fields;
  }
  
  /**
   * Extract fields from requirement text
   */
  private static extractFieldsFromText(requirement: string): GeneratedField[] {
    const words = requirement.toLowerCase().split(/\s+/);
    const fields: GeneratedField[] = [];
    
    // Check each word/phrase against field patterns
    words.forEach((word, index) => {
      Object.entries(this.fieldPatterns).forEach(([patternName, pattern]) => {
        if (pattern.pattern.test(word)) {
          const fieldName = this.generateFieldName(word, words, index);
          const fieldLabel = this.generateFieldLabel(fieldName);
          
          fields.push({
            name: fieldName,
            type: pattern.type,
            required: this.determineIfRequired(word, words, index),
            label: fieldLabel,
            options: pattern.options,
            source: 'pattern',
            confidence: 0.7,
            aiGenerated: true,
            placeholder: this.generatePlaceholder(fieldName, pattern.type)
          });
        }
      });
    });
    
    return fields;
  }
  
  /**
   * Generate metadata
   */
  private static generateMetadata(requirement: string, domain: BusinessDomain): SchemaMetadata {
    return {
      generated_at: new Date().toISOString(),
      generator_version: '1.0.0',
      requirement_analysis: {
        domain: domain.name,
        confidence: domain.confidence,
        complexity: this.calculateComplexity(requirement.split(/\s+/), [requirement], [])
      },
      business_context: {
        domain: domain.name,
        industry: this.inferIndustry(requirement),
        use_case: this.inferUseCase(requirement)
      },
      ai_insights: this.generateAIInsights(requirement, domain)
    };
  }
  
  /**
   * Generate AI insights
   */
  private static generateAIInsights(requirement: string, domain: BusinessDomain): AIInsight[] {
    const insights: AIInsight[] = [];
    
    // Domain-specific insights
    if (domain.name === 'finance') {
      insights.push({
        type: 'compliance',
        title: 'Financial Compliance',
        description: 'Consider adding audit trails and approval workflows for financial data.',
        priority: 'high',
        recommendation: 'Add fields for approval status, approver, and audit trail.'
      });
    }
    
    if (domain.name === 'hr') {
      insights.push({
        type: 'privacy',
        title: 'Data Privacy',
        description: 'HR data requires special privacy and security considerations.',
        priority: 'high',
        recommendation: 'Implement data encryption and access controls.'
      });
    }
    
    // General insights
    const words = requirement.toLowerCase().split(/\s+/);
    if (words.length > 50) {
      insights.push({
        type: 'complexity',
        title: 'Complex Requirement',
        description: 'This requirement is complex and may benefit from breaking into multiple entities.',
        priority: 'medium',
        recommendation: 'Consider creating related entities and establishing relationships.'
      });
    }
    
    return insights;
  }
  
  /**
   * Helper methods
   */
  private static generateEntityName(requirement: string, entityType?: string): string {
    if (entityType) {
      return entityType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    // Extract entity name from requirement
    const words = requirement.split(/\s+/);
    const entityWords = words.filter(word => 
      !['a', 'an', 'the', 'for', 'to', 'of', 'in', 'on', 'at', 'by', 'with'].includes(word.toLowerCase())
    );
    
    return entityWords.slice(0, 3).join(' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  
  private static generateFieldName(word: string, words: string[], index: number): string {
    // Look for modifiers before the word
    const modifiers = [];
    if (index > 0) {
      modifiers.push(words[index - 1]);
    }
    
    // Clean and format field name
    const cleanWord = word.replace(/[^a-z0-9]/gi, '');
    const fieldName = modifiers.length > 0 
      ? `${modifiers.join('_')}_${cleanWord}`
      : cleanWord;
    
    return fieldName.toLowerCase();
  }
  
  private static generateFieldLabel(fieldName: string): string {
    return fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  
  private static generatePlaceholder(fieldName: string, type: string): string {
    switch (type) {
      case 'email':
        return 'user@example.com';
      case 'phone':
        return '+1 (555) 123-4567';
      case 'url':
        return 'https://example.com';
      case 'currency':
        return '$0.00';
      case 'percentage':
        return '0%';
      case 'date':
        return 'Select date...';
      case 'number':
        return '0';
      case 'boolean':
        return 'Yes/No';
      default:
        return `Enter ${fieldName.replace(/_/g, ' ')}...`;
    }
  }
  
  private static extractEntities(words: string[]): string[] {
    const entities = [];
    
    // Look for entity keywords
    const entityPatterns = [
      /\b(customer|client|user|person|individual)\b/i,
      /\b(product|item|good|service|offering)\b/i,
      /\b(order|purchase|sale|transaction)\b/i,
      /\b(invoice|bill|receipt|payment)\b/i,
      /\b(project|task|job|work)\b/i,
      /\b(employee|staff|worker|team)\b/i
    ];
    
    words.forEach(word => {
      entityPatterns.forEach(pattern => {
        if (pattern.test(word)) {
          entities.push(word);
        }
      });
    });
    
    return [...new Set(entities)];
  }
  
  private static extractActions(words: string[]): string[] {
    const actions = [];
    
    const actionPatterns = [
      /\b(create|add|insert|new)\b/i,
      /\b(update|modify|edit|change)\b/i,
      /\b(delete|remove|cancel)\b/i,
      /\b(view|display|show|list)\b/i,
      /\b(search|find|filter|query)\b/i,
      /\b(track|monitor|record|log)\b/i,
      /\b(approve|reject|validate|verify)\b/i,
      /\b(calculate|compute|process|analyze)\b/i
    ];
    
    words.forEach(word => {
      actionPatterns.forEach(pattern => {
        if (pattern.test(word)) {
          actions.push(word);
        }
      });
    });
    
    return [...new Set(actions)];
  }
  
  private static extractBusinessRules(sentences: string[]): string[] {
    const rules = [];
    
    const rulePatterns = [
      /\b(must|should|required|mandatory|optional)\b/i,
      /\b(if|when|then|unless|provided)\b/i,
      /\b(minimum|maximum|at least|no more than)\b/i,
      /\b(validate|verify|check|ensure)\b/i,
      /\b(cannot|not allowed|prohibited|restricted)\b/i
    ];
    
    sentences.forEach(sentence => {
      rulePatterns.forEach(pattern => {
        if (pattern.test(sentence)) {
          rules.push(sentence.trim());
        }
      });
    });
    
    return rules;
  }
  
  private static extractFieldRequirements(sentences: string[]): string[] {
    const requirements = [];
    
    const fieldPatterns = [
      /\b(field|column|property|attribute)\b/i,
      /\b(store|save|record|capture)\b/i,
      /\b(input|enter|provide|specify)\b/i,
      /\b(name|title|description|details)\b/i,
      /\b(date|time|amount|quantity|price)\b/i
    ];
    
    sentences.forEach(sentence => {
      fieldPatterns.forEach(pattern => {
        if (pattern.test(sentence)) {
          requirements.push(sentence.trim());
        }
      });
    });
    
    return requirements;
  }
  
  private static determineEntityType(entities: string[], actions: string[]): string {
    if (entities.length === 0) {
      return 'custom_entity';
    }
    
    // Use the first entity as the base type
    const primaryEntity = entities[0];
    
    // Check if it's a compound entity
    if (entities.length > 1 && actions.includes('create')) {
      return `${primaryEntity}_${entities[1]}`;
    }
    
    return primaryEntity;
  }
  
  private static determineIfRequired(word: string, words: string[], index: number): boolean {
    // Check for required indicators
    const requiredPatterns = [
      /\b(required|mandatory|must|essential)\b/i,
      /\b(id|name|title|email)\b/i
    ];
    
    const optionalPatterns = [
      /\b(optional|may|might|could)\b/i,
      /\b(description|notes|comments)\b/i
    ];
    
    // Check surrounding words
    const context = words.slice(Math.max(0, index - 2), index + 3).join(' ');
    
    if (requiredPatterns.some(pattern => pattern.test(context))) {
      return true;
    }
    
    if (optionalPatterns.some(pattern => pattern.test(context))) {
      return false;
    }
    
    // Default based on field type
    return ['id', 'name', 'title', 'email'].includes(word.toLowerCase());
  }
  
  private static calculateComplexity(words: string[], sentences: string[], entities: string[]): number {
    const wordCount = words.length;
    const sentenceCount = sentences.length;
    const entityCount = entities.length;
    
    let complexity = 0;
    
    // Base complexity from word count
    complexity += wordCount * 0.1;
    
    // Additional complexity from sentence structure
    complexity += sentenceCount * 0.5;
    
    // Additional complexity from entity count
    complexity += entityCount * 0.3;
    
    // Normalize to 0-1 scale
    return Math.min(complexity / 10, 1);
  }
  
  private static calculateConfidence(requirement: string, domain: BusinessDomain, fields: GeneratedField[]): number {
    let confidence = 0;
    
    // Domain confidence
    confidence += domain.confidence * 0.3;
    
    // Field confidence
    const avgFieldConfidence = fields.reduce((acc, field) => acc + (field.confidence || 0), 0) / fields.length;
    confidence += avgFieldConfidence * 0.4;
    
    // Requirement clarity
    const words = requirement.split(/\s+/);
    const clarityScore = Math.min(words.length / 50, 1); // More words = more clarity
    confidence += clarityScore * 0.3;
    
    return Math.min(confidence, 1);
  }
  
  private static generateSuggestions(requirement: string, domain: BusinessDomain, fields: GeneratedField[]): string[] {
    const suggestions = [];
    
    // Domain-specific suggestions
    if (domain.name === 'finance') {
      suggestions.push('Consider adding approval workflow fields');
      suggestions.push('Add audit trail and version control');
    }
    
    if (domain.name === 'crm') {
      suggestions.push('Consider adding lead scoring fields');
      suggestions.push('Add communication history tracking');
    }
    
    // Field-based suggestions
    if (fields.some(f => f.type === 'currency')) {
      suggestions.push('Consider adding currency code field for multi-currency support');
    }
    
    if (fields.some(f => f.type === 'email')) {
      suggestions.push('Add email verification status field');
    }
    
    if (fields.some(f => f.type === 'date')) {
      suggestions.push('Consider adding timezone information');
    }
    
    return suggestions;
  }
  
  private static generateValidationRules(fields: GeneratedField[]): Record<string, any> {
    const rules: Record<string, any> = {};
    
    fields.forEach(field => {
      rules[field.name] = {};
      
      if (field.required) {
        rules[field.name].required = true;
      }
      
      switch (field.type) {
        case 'email':
          rules[field.name].pattern = '^[^@]+@[^@]+\\.[^@]+$';
          break;
        case 'phone':
          rules[field.name].pattern = '^[\\d\\s\\-\\+\\(\\)]+$';
          break;
        case 'url':
          rules[field.name].pattern = '^https?://';
          break;
        case 'currency':
          rules[field.name].min = 0;
          break;
        case 'number':
          rules[field.name].min = 0;
          break;
        case 'text':
          if (field.name.includes('code') || field.name.includes('id')) {
            rules[field.name].minLength = 3;
            rules[field.name].maxLength = 50;
          } else {
            rules[field.name].minLength = 1;
            rules[field.name].maxLength = 255;
          }
          break;
        case 'textarea':
          rules[field.name].minLength = 1;
          rules[field.name].maxLength = 2000;
          break;
      }
    });
    
    return rules;
  }
  
  private static generateBusinessRules(requirement: string, domain: BusinessDomain): string[] {
    const rules = [];
    
    // Domain-specific business rules
    if (domain.name === 'finance') {
      rules.push('All financial amounts must be positive');
      rules.push('Invoice numbers must be unique');
      rules.push('Payment dates cannot be in the future');
    }
    
    if (domain.name === 'crm') {
      rules.push('Email addresses must be unique per customer');
      rules.push('Customer status must be valid');
      rules.push('Lead scores must be between 0 and 100');
    }
    
    if (domain.name === 'hr') {
      rules.push('Employee IDs must be unique');
      rules.push('Hire dates cannot be in the future');
      rules.push('Active employees must have valid departments');
    }
    
    // Extract rules from requirement text
    const sentences = requirement.split(/[.!?]+/).filter(s => s.trim());
    sentences.forEach(sentence => {
      if (sentence.toLowerCase().includes('must') || sentence.toLowerCase().includes('required')) {
        rules.push(sentence.trim());
      }
    });
    
    return rules;
  }
  
  private static inferIndustry(requirement: string): string {
    const industryKeywords = {
      'restaurant': ['restaurant', 'food', 'menu', 'kitchen', 'dining', 'chef', 'recipe'],
      'retail': ['retail', 'store', 'shop', 'product', 'sale', 'customer', 'inventory'],
      'healthcare': ['patient', 'medical', 'healthcare', 'hospital', 'clinic', 'doctor', 'treatment'],
      'manufacturing': ['manufacturing', 'production', 'factory', 'assembly', 'quality', 'process'],
      'finance': ['bank', 'financial', 'investment', 'loan', 'credit', 'portfolio', 'trading'],
      'education': ['school', 'student', 'course', 'grade', 'teacher', 'education', 'learning'],
      'technology': ['software', 'application', 'system', 'development', 'programming', 'tech']
    };
    
    const words = requirement.toLowerCase().split(/\s+/);
    
    for (const [industry, keywords] of Object.entries(industryKeywords)) {
      if (keywords.some(keyword => words.includes(keyword))) {
        return industry;
      }
    }
    
    return 'general';
  }
  
  private static inferUseCase(requirement: string): string {
    const useCasePatterns = {
      'data_entry': /\b(enter|input|capture|record|store)\b/i,
      'reporting': /\b(report|analyze|dashboard|metrics|analytics)\b/i,
      'workflow': /\b(process|workflow|approval|review|manage)\b/i,
      'tracking': /\b(track|monitor|follow|status|progress)\b/i,
      'communication': /\b(communicate|notify|alert|message|email)\b/i,
      'integration': /\b(integrate|connect|sync|import|export)\b/i
    };
    
    for (const [useCase, pattern] of Object.entries(useCasePatterns)) {
      if (pattern.test(requirement)) {
        return useCase;
      }
    }
    
    return 'general';
  }
}

// Type definitions
export interface GeneratedSchema {
  entityType: string;
  name: string;
  domain: BusinessDomain;
  fields: GeneratedField[];
  metadata: SchemaMetadata;
  confidence: number;
  suggestions: string[];
  validationRules: Record<string, any>;
  businessRules: string[];
  auditTrail: {
    generated_at: string;
    requirement: string;
    analysis: RequirementAnalysis;
  };
}

export interface GeneratedField {
  name: string;
  type: string;
  required: boolean;
  label: string;
  options?: string[];
  source: 'domain' | 'pattern' | 'system';
  confidence: number;
  aiGenerated: boolean;
  placeholder?: string;
  description?: string;
  validation?: any;
}

export interface BusinessDomain {
  name: string;
  confidence: number;
  keywords: string[];
  commonFields: any[];
}

export interface RequirementAnalysis {
  originalText: string;
  words: string[];
  sentences: string[];
  entities: string[];
  actions: string[];
  businessRules: string[];
  fieldRequirements: string[];
  entityType: string;
  complexity: number;
}

export interface SchemaMetadata {
  generated_at: string;
  generator_version: string;
  requirement_analysis: {
    domain: string;
    confidence: number;
    complexity: number;
  };
  business_context: {
    domain: string;
    industry: string;
    use_case: string;
  };
  ai_insights: AIInsight[];
}

export interface AIInsight {
  type: 'compliance' | 'privacy' | 'complexity' | 'performance' | 'security' | 'usability';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  recommendation: string;
}

// Validation schemas
export const GeneratedSchemaValidator = z.object({
  entityType: z.string(),
  name: z.string(),
  domain: z.object({
    name: z.string(),
    confidence: z.number(),
    keywords: z.array(z.string()),
    commonFields: z.array(z.any())
  }),
  fields: z.array(z.object({
    name: z.string(),
    type: z.string(),
    required: z.boolean(),
    label: z.string(),
    options: z.array(z.string()).optional(),
    source: z.enum(['domain', 'pattern', 'system']),
    confidence: z.number(),
    aiGenerated: z.boolean(),
    placeholder: z.string().optional(),
    description: z.string().optional(),
    validation: z.any().optional()
  })),
  metadata: z.any(),
  confidence: z.number(),
  suggestions: z.array(z.string()),
  validationRules: z.record(z.any()),
  businessRules: z.array(z.string()),
  auditTrail: z.object({
    generated_at: z.string(),
    requirement: z.string(),
    analysis: z.any()
  })
});

// Backward compatibility - synchronous version
export const generateSchemaSync = (requirement: string, entityType?: string): GeneratedSchema => {
  return AISchemaGenerator.generateSchemaRuleBased(requirement, entityType);
};

export default AISchemaGenerator;