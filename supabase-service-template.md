# 🚀 SUPABASE UNIVERSAL SERVICE TEMPLATE

[Include the complete UniversalEntityService and UniversalTransactionService classes from my previous response]

## Usage Pattern:
```typescript
// Always follow this pattern
const service = new UniversalEntityService();
const entity = await service.createEntity({
  entity_type: 'your_entity_type',
  organization_id: 'org-123',
  entity_name: 'Your Entity Name',
  dynamic_fields: {
    field1: 'value1',
    field2: 'value2'
  }
});