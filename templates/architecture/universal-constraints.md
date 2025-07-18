# 🛡️ HERA UNIVERSAL ARCHITECTURE CONSTRAINTS

⚠️ CRITICAL ARCHITECTURE CONSTRAINTS - NEVER VIOLATE THESE:

🏗️ HERA UNIVERSAL SCHEMA RULES:
1. NEVER CREATE NEW TABLES - Use existing universal schema only
2. ALL data goes into core_entities + core_dynamic_data pattern
3. Use core_metadata for complex/nested data structures
4. Leverage core_relationships for entity connections
5. Store AI data as entities with dynamic fields

📊 MANDATORY CORE TABLES (Use these ONLY):
- core_entities (ALL business objects)
- core_dynamic_data (ALL custom fields)
- core_relationships (ALL connections)
- core_metadata (ALL complex/nested data)
- universal_transactions (ALL transactions)
- universal_transaction_lines (ALL transaction details)
- core_workflows (ALL process flows)
- ai_schema_registry (AI-generated schemas)

❌ FORBIDDEN ACTIONS:
- Creating separate tables for ANY reason
- Using traditional ERP table patterns
- Ignoring the universal entity model
- Bypassing core_dynamic_data for custom fields

✅ REQUIRED APPROACH:
- Every business object = core_entities record
- Every custom field = core_dynamic_data record
- Every relationship = core_relationships record
- Every complex data = core_metadata record

🎯 VALIDATION CHECKPOINT:
Before providing any solution, ask yourself:
1. "Am I using core_entities for the main object?"
2. "Am I using core_dynamic_data for custom fields?"
3. "Am I creating ANY new tables?" (Answer must be NO)
4. "Does this follow HERA universal patterns?"

If you deviate from these rules, STOP and redesign using universal schema.