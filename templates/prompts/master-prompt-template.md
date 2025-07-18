# 🚀 HERA UNIVERSAL PROMPT TEMPLATE

⚠️ REFERENCE: templates/architecture/universal-constraints.md
⚠️ REFERENCE: templates/backend/supabase-service-template.md
⚠️ REFERENCE: templates/frontend/universal-react-hooks.md

🎯 TASK: Build [FEATURE NAME] using HERA universal schema + Supabase auto-APIs

📋 REQUIREMENTS:
- Feature: [Describe feature]
- Entities needed: [List as core_entities]
- Fields needed: [List as core_dynamic_data]
- Relationships: [List as core_relationships]

🏗️ IMPLEMENTATION CONSTRAINTS:
1. Use core_entities for all business objects
2. Use core_dynamic_data for all custom fields
3. Use core_relationships for all connections
4. Store complex data in core_metadata
5. All transactions go through universal_transactions
6. LEVERAGE Supabase auto-generated APIs for all operations

📊 EXPECTED DELIVERABLES:
- Follow patterns from templates/backend/supabase-service-template.md
- Use hooks from templates/frontend/universal-react-hooks.md
- Implement validation from templates/architecture/validation-checklist.md
- No new table creation whatsoever

BUILD: [Your specific requirements]