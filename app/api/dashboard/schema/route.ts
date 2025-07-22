/**
 * HERA Universal Dashboard - Schema Governance API
 * 
 * Monitors naming conventions, entity types, and field usage patterns
 * Prevents duplication and ensures schema consistency
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

interface FieldViolation {
  fieldName: string;
  currentName: string;
  suggestedName: string;
  violationType: 'ambiguous' | 'non-semantic' | 'inconsistent' | 'reserved_word';
  entityType: string;
  organizationId: string;
  confidence: number;
  examples: string[];
}

interface DuplicationRisk {
  entityType: string;
  similarTypes: string[];
  riskLevel: 'low' | 'medium' | 'high';
  organizations: string[];
  suggestedConsolidation: string;
  examples: any[];
}

interface EntityTypeDefinition {
  entityType: string;
  usage_count: number;
  organizations: string[];
  field_patterns: Record<string, number>;
  created_at: string;
  last_used: string;
  is_system_type: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    
    // Analyze naming convention compliance
    const namingCompliance = await analyzeNamingConventions(supabase, organizationId);
    
    // Get entity type registry
    const entityRegistry = await getEntityTypeRegistry(supabase);
    
    // Analyze field usage patterns
    const fieldAnalysis = await analyzeFieldUsage(supabase);
    
    // Check for duplications
    const duplicationRisks = await identifyDuplicationRisks(supabase);
    
    // Get field naming patterns
    const namingPatterns = await analyzeNamingPatterns(supabase);
    
    // Get reserved words violations
    const reservedWordViolations = await checkReservedWords(supabase);
    
    return NextResponse.json({
      namingCompliance,
      entityRegistry,
      fieldAnalysis,
      duplicationRisks,
      namingPatterns,
      reservedWordViolations,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Schema governance error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schema governance metrics' },
      { status: 500 }
    );
  }
}

async function analyzeNamingConventions(supabase: any, organizationId: string | null) {
  // Get all field names from core_dynamic_data
  let query = supabase
    .from('core_dynamic_data')
    .select('field_name, entity_id, field_type');
    
  if (organizationId) {
    // Need to join with core_entities to filter by organization
    const { data: entities } = await supabase
      .from('core_entities')
      .select('id')
      .eq('organization_id', organizationId);
    
    const entityIds = entities?.map(e => e.id) || [];
    if (entityIds.length > 0) {
      query = query.in('entity_id', entityIds);
    }
  }
  
  const { data: fields } = await query;
  
  const violations: FieldViolation[] = [];
  const compliantFields: string[] = [];
  const fieldNameMap = new Map<string, string[]>(); // Track similar field names
  
  // Naming convention rules
  const rules = {
    snake_case: /^[a-z]+(_[a-z]+)*$/,
    no_numbers_at_start: /^[a-zA-Z]/,
    meaningful_length: (name: string) => name.length >= 3 && name.length <= 50,
    no_reserved_words: (name: string) => !RESERVED_WORDS.includes(name.toLowerCase()),
    semantic_clarity: (name: string) => !AMBIGUOUS_TERMS.includes(name.toLowerCase())
  };
  
  fields?.forEach(field => {
    const violations_found: string[] = [];
    
    // Check each rule
    if (!rules.snake_case.test(field.field_name)) {
      violations_found.push('not_snake_case');
    }
    
    if (!rules.no_numbers_at_start.test(field.field_name)) {
      violations_found.push('starts_with_number');
    }
    
    if (!rules.meaningful_length(field.field_name)) {
      violations_found.push('invalid_length');
    }
    
    if (!rules.no_reserved_words(field.field_name)) {
      violations_found.push('reserved_word');
    }
    
    if (!rules.semantic_clarity(field.field_name)) {
      violations_found.push('ambiguous_term');
    }
    
    if (violations_found.length > 0) {
      violations.push({
        fieldName: field.field_name,
        currentName: field.field_name,
        suggestedName: suggestProperName(field.field_name),
        violationType: determineViolationType(violations_found),
        entityType: 'unknown', // Would need to join with core_entities
        organizationId: organizationId || 'unknown',
        confidence: calculateConfidence(field.field_name, violations_found),
        examples: getFieldExamples(field.field_name)
      });
    } else {
      compliantFields.push(field.field_name);
    }
    
    // Track similar names for inconsistency detection
    const normalized = field.field_name.toLowerCase().replace(/_/g, '');
    if (!fieldNameMap.has(normalized)) {
      fieldNameMap.set(normalized, []);
    }
    fieldNameMap.get(normalized)!.push(field.field_name);
  });
  
  // Check for inconsistent naming (same concept, different names)
  fieldNameMap.forEach((names, normalized) => {
    if (names.length > 1) {
      // Only flag as inconsistent if there are actually different variations
      const uniqueNames = [...new Set(names)];
      if (uniqueNames.length > 1) {
        names.forEach(name => {
          if (!violations.some(v => v.fieldName === name)) {
            // Don't suggest the same name as the current name
            const suggestedName = uniqueNames.find(n => n !== name) || uniqueNames[0];
            if (suggestedName !== name) {
              violations.push({
                fieldName: name,
                currentName: name,
                suggestedName: suggestedName,
                violationType: 'inconsistent',
                entityType: 'various',
                organizationId: organizationId || 'various',
                confidence: 0.8,
                examples: uniqueNames.filter(n => n !== name)
              });
            }
          }
        });
      }
    }
  });
  
  return {
    compliantFields: compliantFields.length,
    nonCompliantFields: violations,
    complianceScore: Math.round((compliantFields.length / (compliantFields.length + violations.length)) * 100),
    suggestedFixes: violations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10), // Top 10 priorities
    totalFieldsAnalyzed: fields?.length || 0
  };
}

async function getEntityTypeRegistry(supabase: any) {
  // Get all unique entity types
  const { data: entityTypes } = await supabase
    .from('core_entities')
    .select('entity_type, organization_id, created_at')
    .order('entity_type');
  
  // Process into registry
  const typeMap = new Map<string, EntityTypeDefinition>();
  
  entityTypes?.forEach((entity: any) => {
    if (!typeMap.has(entity.entity_type)) {
      typeMap.set(entity.entity_type, {
        entityType: entity.entity_type,
        usage_count: 0,
        organizations: [],
        field_patterns: {},
        created_at: entity.created_at,
        last_used: entity.created_at,
        is_system_type: isSystemEntityType(entity.entity_type)
      });
    }
    
    const type = typeMap.get(entity.entity_type)!;
    type.usage_count++;
    if (!type.organizations.includes(entity.organization_id)) {
      type.organizations.push(entity.organization_id);
    }
    if (new Date(entity.created_at) > new Date(type.last_used)) {
      type.last_used = entity.created_at;
    }
  });
  
  // Get field patterns for each entity type
  for (const [entityType, definition] of typeMap) {
    const { data: entities } = await supabase
      .from('core_entities')
      .select('id')
      .eq('entity_type', entityType)
      .limit(100);
    
    if (entities && entities.length > 0) {
      const entityIds = entities.map(e => e.id);
      const { data: fields } = await supabase
        .from('core_dynamic_data')
        .select('field_name')
        .in('entity_id', entityIds);
      
      fields?.forEach(field => {
        definition.field_patterns[field.field_name] = 
          (definition.field_patterns[field.field_name] || 0) + 1;
      });
    }
  }
  
  const systemTypes = Array.from(typeMap.values()).filter(t => t.is_system_type);
  const userTypes = Array.from(typeMap.values()).filter(t => !t.is_system_type);
  
  // Find potential duplicates
  const duplicateRisks = findSimilarEntityTypes(Array.from(typeMap.values()));
  
  // Find unused types (no recent activity)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const unusedTypes = Array.from(typeMap.values())
    .filter(t => new Date(t.last_used) < new Date(thirtyDaysAgo))
    .map(t => t.entityType);
  
  return {
    systemTypes,
    userTypes,
    duplicateRisks,
    unusedTypes,
    totalTypes: typeMap.size,
    typesPerOrganization: calculateAverageTypesPerOrg(typeMap)
  };
}

async function analyzeFieldUsage(supabase: any) {
  // Get field usage statistics
  const { data: fieldUsage } = await supabase.rpc('analyze_field_usage');
  
  // Manual analysis if RPC doesn't exist
  const { data: allFields } = await supabase
    .from('core_dynamic_data')
    .select('field_name, field_type');
  
  const fieldStats = new Map<string, { count: number; types: Set<string> }>();
  
  allFields?.forEach(field => {
    if (!fieldStats.has(field.field_name)) {
      fieldStats.set(field.field_name, { count: 0, types: new Set() });
    }
    const stat = fieldStats.get(field.field_name)!;
    stat.count++;
    stat.types.add(field.field_type);
  });
  
  // Convert to sorted array
  const mostUsedFields = Array.from(fieldStats.entries())
    .map(([name, stats]) => ({
      fieldName: name,
      usageCount: stats.count,
      fieldTypes: Array.from(stats.types),
      isStandard: isStandardField(name)
    }))
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 20);
  
  // Find redundant fields (similar names, same purpose)
  const redundantFields = findRedundantFields(Array.from(fieldStats.keys()));
  
  // Check for missing standard fields
  const missingStandardFields = STANDARD_FIELDS.filter(
    std => !fieldStats.has(std) || fieldStats.get(std)!.count < 10
  );
  
  // Field type distribution
  const typeDistribution: Record<string, number> = {};
  allFields?.forEach(field => {
    typeDistribution[field.field_type] = (typeDistribution[field.field_type] || 0) + 1;
  });
  
  return {
    mostUsedFields,
    redundantFields,
    missingStandardFields,
    fieldTypeDistribution: typeDistribution,
    totalUniqueFields: fieldStats.size,
    averageFieldsPerEntity: calculateAverageFieldsPerEntity(fieldStats, allFields?.length || 0)
  };
}

async function identifyDuplicationRisks(supabase: any) {
  const risks: DuplicationRisk[] = [];
  
  // Get all entity types with their usage
  const { data: entityTypes } = await supabase
    .from('core_entities')
    .select('entity_type, organization_id, id');
  
  // Group by entity type
  const typeGroups = new Map<string, any[]>();
  entityTypes?.forEach(entity => {
    if (!typeGroups.has(entity.entity_type)) {
      typeGroups.set(entity.entity_type, []);
    }
    typeGroups.get(entity.entity_type)!.push(entity);
  });
  
  // Find similar entity types
  const typeNames = Array.from(typeGroups.keys());
  for (let i = 0; i < typeNames.length; i++) {
    for (let j = i + 1; j < typeNames.length; j++) {
      const similarity = calculateSimilarity(typeNames[i], typeNames[j]);
      
      if (similarity > 0.7) {
        const orgs1 = new Set(typeGroups.get(typeNames[i])!.map(e => e.organization_id));
        const orgs2 = new Set(typeGroups.get(typeNames[j])!.map(e => e.organization_id));
        
        risks.push({
          entityType: typeNames[i],
          similarTypes: [typeNames[j]],
          riskLevel: similarity > 0.9 ? 'high' : similarity > 0.8 ? 'medium' : 'low',
          organizations: Array.from(new Set([...orgs1, ...orgs2])),
          suggestedConsolidation: suggestConsolidatedName(typeNames[i], typeNames[j]),
          examples: [
            { type: typeNames[i], count: typeGroups.get(typeNames[i])!.length },
            { type: typeNames[j], count: typeGroups.get(typeNames[j])!.length }
          ]
        });
      }
    }
  }
  
  // Check for plural/singular duplicates
  typeNames.forEach(type => {
    const singular = type.replace(/s$/, '');
    const plural = type.endsWith('s') ? type : type + 's';
    
    if (type !== singular && typeGroups.has(singular)) {
      risks.push({
        entityType: type,
        similarTypes: [singular],
        riskLevel: 'high',
        organizations: Array.from(new Set([
          ...typeGroups.get(type)!.map(e => e.organization_id),
          ...typeGroups.get(singular)!.map(e => e.organization_id)
        ])),
        suggestedConsolidation: singular,
        examples: [
          { type: type, count: typeGroups.get(type)!.length },
          { type: singular, count: typeGroups.get(singular)!.length }
        ]
      });
    }
  });
  
  return risks;
}

async function analyzeNamingPatterns(supabase: any) {
  const { data: fields } = await supabase
    .from('core_dynamic_data')
    .select('field_name')
    .limit(1000);
  
  const patterns = {
    prefixes: new Map<string, number>(),
    suffixes: new Map<string, number>(),
    wordFrequency: new Map<string, number>(),
    caseStyles: {
      snake_case: 0,
      camelCase: 0,
      PascalCase: 0,
      UPPER_CASE: 0,
      'kebab-case': 0,
      mixed: 0
    }
  };
  
  fields?.forEach(field => {
    const name = field.field_name;
    
    // Analyze case style
    if (/^[a-z]+(_[a-z]+)*$/.test(name)) patterns.caseStyles.snake_case++;
    else if (/^[a-z][a-zA-Z]*$/.test(name)) patterns.caseStyles.camelCase++;
    else if (/^[A-Z][a-zA-Z]*$/.test(name)) patterns.caseStyles.PascalCase++;
    else if (/^[A-Z]+(_[A-Z]+)*$/.test(name)) patterns.caseStyles.UPPER_CASE++;
    else if (/^[a-z]+(-[a-z]+)*$/.test(name)) patterns.caseStyles['kebab-case']++;
    else patterns.caseStyles.mixed++;
    
    // Extract words
    const words = name.split(/[_\-\s]+/);
    words.forEach(word => {
      if (word.length > 2) {
        patterns.wordFrequency.set(word, (patterns.wordFrequency.get(word) || 0) + 1);
      }
    });
    
    // Common prefixes/suffixes
    if (words.length > 0) {
      patterns.prefixes.set(words[0], (patterns.prefixes.get(words[0]) || 0) + 1);
      patterns.suffixes.set(words[words.length - 1], (patterns.suffixes.get(words[words.length - 1]) || 0) + 1);
    }
  });
  
  return {
    caseStyles: patterns.caseStyles,
    commonPrefixes: Array.from(patterns.prefixes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10),
    commonSuffixes: Array.from(patterns.suffixes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10),
    commonWords: Array.from(patterns.wordFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
  };
}

async function checkReservedWords(supabase: any) {
  const { data: fields } = await supabase
    .from('core_dynamic_data')
    .select('field_name, entity_id');
  
  const violations: any[] = [];
  
  fields?.forEach(field => {
    if (RESERVED_WORDS.includes(field.field_name.toLowerCase())) {
      violations.push({
        fieldName: field.field_name,
        entityId: field.entity_id,
        severity: 'high',
        suggestion: `${field.field_name}_value`,
        reason: 'SQL reserved word'
      });
    }
    
    if (POSTGRESQL_RESERVED.includes(field.field_name.toLowerCase())) {
      violations.push({
        fieldName: field.field_name,
        entityId: field.entity_id,
        severity: 'medium',
        suggestion: `${field.field_name}_field`,
        reason: 'PostgreSQL reserved word'
      });
    }
  });
  
  return violations;
}

// Helper functions
function suggestProperName(fieldName: string): string {
  let suggested = fieldName.toLowerCase();
  
  // Convert to snake_case
  suggested = suggested.replace(/([a-z])([A-Z])/g, '$1_$2');
  suggested = suggested.replace(/[\s-]+/g, '_');
  suggested = suggested.replace(/[^a-z0-9_]/g, '');
  
  // Remove numbers from start
  suggested = suggested.replace(/^[0-9]+/, '');
  
  // Expand common abbreviations
  const abbreviations: Record<string, string> = {
    'qty': 'quantity',
    'amt': 'amount',
    'desc': 'description',
    'addr': 'address',
    'tel': 'telephone',
    'dob': 'date_of_birth',
    'qty': 'quantity',
    'cat': 'category'
  };
  
  Object.entries(abbreviations).forEach(([abbr, full]) => {
    suggested = suggested.replace(new RegExp(`\\b${abbr}\\b`, 'g'), full);
  });
  
  return suggested;
}

function determineViolationType(violations: string[]): 'ambiguous' | 'non-semantic' | 'inconsistent' | 'reserved_word' {
  if (violations.includes('reserved_word')) return 'reserved_word';
  if (violations.includes('ambiguous_term')) return 'ambiguous';
  if (violations.includes('not_snake_case') || violations.includes('invalid_length')) return 'non-semantic';
  return 'inconsistent';
}

function calculateConfidence(fieldName: string, violations: string[]): number {
  let confidence = 1.0;
  
  // Reduce confidence based on violation types
  violations.forEach(violation => {
    switch(violation) {
      case 'reserved_word': confidence *= 0.9; break;
      case 'not_snake_case': confidence *= 0.8; break;
      case 'ambiguous_term': confidence *= 0.7; break;
      case 'starts_with_number': confidence *= 0.85; break;
      case 'invalid_length': confidence *= 0.9; break;
    }
  });
  
  return Math.round(confidence * 100) / 100;
}

function getFieldExamples(fieldName: string): string[] {
  // Provide examples of better naming
  const examples: string[] = [];
  
  if (fieldName.includes('data')) {
    examples.push('customer_email', 'order_date', 'product_description');
  }
  
  if (fieldName.length < 3) {
    examples.push('quantity', 'identifier', 'description');
  }
  
  return examples;
}

function isSystemEntityType(entityType: string): boolean {
  const systemTypes = [
    'user', 'organization', 'role', 'permission',
    'audit_log', 'system_config', 'notification'
  ];
  
  return systemTypes.includes(entityType);
}

function findSimilarEntityTypes(types: EntityTypeDefinition[]): DuplicationRisk[] {
  const risks: DuplicationRisk[] = [];
  
  // Implementation would use string similarity algorithms
  // This is a simplified version
  
  return risks;
}

function calculateSimilarity(str1: string, str2: string): number {
  // Levenshtein distance normalized
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

function suggestConsolidatedName(name1: string, name2: string): string {
  // Prefer singular over plural
  if (name1.endsWith('s') && !name2.endsWith('s')) return name2;
  if (name2.endsWith('s') && !name1.endsWith('s')) return name1;
  
  // Prefer shorter name if very similar
  if (Math.abs(name1.length - name2.length) < 3) {
    return name1.length < name2.length ? name1 : name2;
  }
  
  return name1;
}

function isStandardField(fieldName: string): boolean {
  return STANDARD_FIELDS.includes(fieldName);
}

function findRedundantFields(fieldNames: string[]): any[] {
  const redundant: any[] = [];
  
  // Find fields that are likely the same concept
  const groups = new Map<string, string[]>();
  
  fieldNames.forEach(name => {
    const normalized = name.toLowerCase().replace(/[_-]/g, '');
    let added = false;
    
    groups.forEach((group, key) => {
      if (calculateSimilarity(normalized, key) > 0.8) {
        group.push(name);
        added = true;
      }
    });
    
    if (!added) {
      groups.set(normalized, [name]);
    }
  });
  
  groups.forEach((names, key) => {
    if (names.length > 1) {
      redundant.push({
        concept: key,
        fields: names,
        suggestedField: names[0],
        redundancyScore: names.length
      });
    }
  });
  
  return redundant;
}

function calculateAverageTypesPerOrg(typeMap: Map<string, EntityTypeDefinition>): number {
  const orgTypes = new Map<string, Set<string>>();
  
  typeMap.forEach((def, type) => {
    def.organizations.forEach(org => {
      if (!orgTypes.has(org)) {
        orgTypes.set(org, new Set());
      }
      orgTypes.get(org)!.add(type);
    });
  });
  
  const counts = Array.from(orgTypes.values()).map(set => set.size);
  return counts.length > 0 ? Math.round(counts.reduce((a, b) => a + b, 0) / counts.length) : 0;
}

function calculateAverageFieldsPerEntity(fieldStats: Map<string, any>, totalFields: number): number {
  // This would need actual entity count
  // Simplified calculation
  return Math.round(totalFields / 100); // Assuming ~100 entities average
}

// Constants
const RESERVED_WORDS = [
  'select', 'from', 'where', 'order', 'group', 'by', 'having',
  'insert', 'update', 'delete', 'create', 'alter', 'drop',
  'table', 'index', 'view', 'trigger', 'function', 'procedure',
  'user', 'role', 'grant', 'revoke', 'commit', 'rollback',
  'and', 'or', 'not', 'in', 'exists', 'between', 'like',
  'null', 'true', 'false', 'case', 'when', 'then', 'else'
];

const POSTGRESQL_RESERVED = [
  'all', 'analyse', 'analyze', 'and', 'any', 'array', 'as', 'asc',
  'authorization', 'binary', 'both', 'case', 'cast', 'check', 'collate',
  'column', 'constraint', 'create', 'current_date', 'current_time',
  'current_timestamp', 'current_user', 'default', 'deferrable', 'desc',
  'distinct', 'do', 'else', 'end', 'except', 'false', 'for', 'foreign',
  'from', 'grant', 'group', 'having', 'in', 'initially', 'intersect',
  'into', 'leading', 'limit', 'localtime', 'localtimestamp', 'new',
  'not', 'null', 'off', 'offset', 'old', 'on', 'only', 'or', 'order',
  'placing', 'primary', 'references', 'returning', 'select', 'session_user',
  'some', 'symmetric', 'table', 'then', 'to', 'trailing', 'true', 'union',
  'unique', 'user', 'using', 'when', 'where', 'with'
];

const AMBIGUOUS_TERMS = [
  'data', 'info', 'value', 'item', 'thing', 'stuff', 'misc',
  'other', 'temp', 'tmp', 'test', 'flag', 'status', 'type'
];

const STANDARD_FIELDS = [
  'id', 'created_at', 'updated_at', 'created_by', 'updated_by',
  'is_active', 'name', 'description', 'email', 'phone', 'address',
  'city', 'state', 'country', 'postal_code', 'amount', 'quantity',
  'price', 'total', 'date', 'start_date', 'end_date', 'status',
  'category', 'tags', 'notes', 'reference_number', 'external_id'
];