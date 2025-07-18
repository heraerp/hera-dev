/**
 * HERA Universal Form Builder - Component Exports
 * Export all Universal Form Builder components for easy importing
 */

// Core Components
export { DynamicFormGenerator } from './DynamicFormGenerator';
export { UniversalDataTable } from './UniversalDataTable';

// Core Services
export { universalEntityManager } from '@/lib/universal-entity-manager';
export { AISchemaGenerator } from '@/lib/ai-schema-generator';

// Types
export type {
  UniversalEntityInput,
  UniversalEntityResponse,
  UniversalSearchOptions,
  CoreEntity,
  CoreDynamicData,
  CoreMetadata,
  AISchemaRegistry
} from '@/lib/universal-entity-manager';

export type {
  GeneratedSchema,
  GeneratedField,
  BusinessDomain,
  RequirementAnalysis,
  SchemaMetadata,
  AIInsight
} from '@/lib/ai-schema-generator';

// Field Types and Templates
export { 
  UNIVERSAL_FIELD_TYPES, 
  ENTITY_TEMPLATES 
} from './DynamicFormGenerator';

// Usage Examples and Documentation
export const USAGE_EXAMPLES = {
  // Basic Usage
  basic: `
import { DynamicFormGenerator, UniversalDataTable } from '@/components/universal';

// Generate a form from business requirement
<DynamicFormGenerator
  organizationId="your-org-id"
  entityType="customer"
  businessRequirement="I need to manage customer information including company name, contact person, email, phone, and address"
  onFormSubmit={(data) => console.log('Form submitted:', data)}
  mode="create"
/>

// Display data in a universal table
<UniversalDataTable
  organizationId="your-org-id"
  entityType="customer"
  title="Customer Management"
  searchable={true}
  editable={true}
  paginated={true}
/>
  `,
  
  // Advanced Usage with AI
  advanced: `
import { AISchemaGenerator, universalEntityManager } from '@/components/universal';

// Generate schema using AI
const schema = AISchemaGenerator.generateSchema(
  'I need to track invoice information with supplier details, amounts, and payment status',
  'invoice'
);

// Create entity using universal manager
const result = await universalEntityManager.createEntity({
  organization_id: 'your-org-id',
  entity_type: 'invoice',
  entity_name: 'Invoice #12345',
  fields: {
    supplier_name: 'ABC Corp',
    total_amount: 1500.00,
    invoice_date: '2024-01-15',
    status: 'pending'
  }
});
  `,
  
  // Custom Field Types
  customFields: `
import { UNIVERSAL_FIELD_TYPES } from '@/components/universal';

// Extend field types for custom business logic
const customFieldTypes = [
  ...UNIVERSAL_FIELD_TYPES,
  {
    id: 'custom_rating',
    label: 'Rating (1-5)',
    type: 'number',
    icon: Star,
    category: 'business',
    validation: { min: 1, max: 5 },
    placeholder: 'Rate from 1 to 5'
  }
];
  `
};

// Integration Guide
export const INTEGRATION_GUIDE = {
  setup: `
1. Install dependencies:
   npm install @hookform/resolvers react-hook-form zod framer-motion

2. Set up Supabase client:
   - Configure your Supabase connection in @/lib/supabase/client
   - Ensure your database has the universal schema tables

3. Import and use components:
   import { DynamicFormGenerator, UniversalDataTable } from '@/components/universal';
  `,
  
  databaseSchema: `
-- Universal Schema Tables (auto-created by the system)
CREATE TABLE core_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_name VARCHAR(255) NOT NULL,
  entity_code VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE core_dynamic_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES core_entities(id) ON DELETE CASCADE,
  field_name VARCHAR(100) NOT NULL,
  field_value TEXT,
  field_type VARCHAR(50) NOT NULL,
  field_order INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT FALSE,
  validation_rules JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE core_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES core_entities(id) ON DELETE CASCADE,
  metadata_type VARCHAR(100) NOT NULL,
  metadata_key VARCHAR(100) NOT NULL,
  metadata_value JSONB,
  ai_generated BOOLEAN DEFAULT FALSE,
  ai_confidence_score DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ai_schema_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  schema_definition JSONB NOT NULL,
  confidence_score DECIMAL(3,2) DEFAULT 0,
  deployment_status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
  `,
  
  apiIntegration: `
// API Integration Example
import { universalEntityManager } from '@/components/universal';

// Create API endpoint
export async function POST(request: Request) {
  const data = await request.json();
  
  const result = await universalEntityManager.createEntity({
    organization_id: data.organizationId,
    entity_type: data.entityType,
    entity_name: data.entityName,
    fields: data.fields,
    metadata: data.metadata
  });
  
  return Response.json(result);
}
  `
};

// Best Practices
export const BEST_PRACTICES = {
  formDesign: [
    'Keep forms simple and intuitive',
    'Use clear field labels and placeholders',
    'Group related fields together',
    'Provide helpful validation messages',
    'Use appropriate field types for data',
    'Include progress indicators for long forms'
  ],
  
  dataModeling: [
    'Use descriptive entity and field names',
    'Define proper validation rules',
    'Consider relationships between entities',
    'Plan for future schema evolution',
    'Document business rules clearly',
    'Use consistent naming conventions'
  ],
  
  performance: [
    'Implement proper pagination for large datasets',
    'Use debounced search for better UX',
    'Cache frequently accessed data',
    'Optimize database queries',
    'Use proper indexing strategies',
    'Monitor AI generation performance'
  ],
  
  security: [
    'Validate all input data',
    'Implement proper access controls',
    'Use row-level security (RLS)',
    'Sanitize user inputs',
    'Audit sensitive operations',
    'Encrypt sensitive data fields'
  ]
};

// Version Information
export const VERSION_INFO = {
  version: '1.0.0',
  compatibility: {
    react: '>=18.0.0',
    nextjs: '>=14.0.0',
    supabase: '>=2.0.0',
    typescript: '>=5.0.0'
  },
  lastUpdated: '2024-01-15',
  changelog: [
    {
      version: '1.0.0',
      date: '2024-01-15',
      changes: [
        'Initial release of Universal Form Builder',
        'AI-powered schema generation',
        'Dynamic form creation',
        'Universal data table component',
        'Complete CRUD operations support'
      ]
    }
  ]
};

// Export everything for convenience
export default {
  DynamicFormGenerator,
  UniversalDataTable,
  universalEntityManager,
  AISchemaGenerator,
  USAGE_EXAMPLES,
  INTEGRATION_GUIDE,
  BEST_PRACTICES,
  VERSION_INFO
};