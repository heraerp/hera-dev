# 🔍 Claude CLI Schema Validation Prompt
**Stop Assumptions - Always Verify Database Schema First**

---

## 🎯 THE GOLDEN RULE PROMPT

Copy this EXACT prompt into Claude CLI before any database work:

```
CRITICAL RULE: NEVER ASSUME DATABASE SCHEMA

Before writing ANY SQL queries or database operations, you MUST:

1. First query the actual schema to see what tables and columns exist
2. Verify column names, data types, and constraints  
3. Check for any recent schema changes
4. Only then write queries based on ACTUAL schema, not assumptions

HERA Database: Connected to Supabase
Project: [YOUR_PROJECT_NAME]

START EVERY DATABASE TASK WITH THIS VERIFICATION:

Step 1: Show me the current schema for the tables I need to work with
Step 2: Verify the exact column names and data types
Step 3: Then proceed with the actual task

NEVER skip schema verification. ALWAYS check first, then code.

Current task: [DESCRIBE YOUR TASK HERE]
```

---

## 🛠️ MANDATORY SCHEMA CHECK COMMANDS

### **Before ANY Database Work, Run These:**

#### **1. Check Specific Table Schema**
```sql
-- Get exact table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'TABLE_NAME_HERE'
ORDER BY ordinal_position;
```

#### **2. Check All HERA Tables**
```sql
-- Get all HERA Universal tables
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN (
    'core_entities',
    'core_dynamic_data', 
    'core_metadata',
    'core_organizations',
    'core_users',
    'universal_transactions',
    'universal_transaction_lines'
  )
ORDER BY table_name, ordinal_position;
```

#### **3. Verify Foreign Key Relationships**
```sql
-- Check actual foreign key constraints
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;
```

#### **4. Check Recent Schema Changes**
```sql
-- See what tables exist (in case of recent changes)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

---

## 🚨 MANDATORY WORKFLOW FOR CLAUDE CLI

### **Template Conversation Starter:**

```
I need to work with HERA database tables for [YOUR_TASK]. 

BEFORE we start coding:

1. Please check the actual schema for these tables: [LIST_TABLES]
2. Show me the exact column names and data types
3. Verify any foreign key relationships
4. Check if there have been any recent schema changes

Only after confirming the actual schema, proceed with [YOUR_TASK].

NEVER assume column names or structure - always verify first.
```

---

## 📊 SCHEMA VERIFICATION CHECKLIST

Before Claude CLI writes ANY database code, verify:

- [ ] ✅ **Table Exists**: Confirmed table actually exists
- [ ] ✅ **Column Names**: Exact column names verified  
- [ ] ✅ **Data Types**: Correct data types confirmed
- [ ] ✅ **Constraints**: Foreign keys and constraints checked
- [ ] ✅ **Recent Changes**: No recent schema modifications
- [ ] ✅ **Naming Convention**: Follows HERA naming patterns

---

## 🎯 SPECIFIC HERA VERIFICATION PROMPTS

### **For Universal Transactions:**
```
Before working with universal transactions:

1. Check exact schema of universal_transactions table
2. Check exact schema of universal_transaction_lines table  
3. Verify the relationship between these tables
4. Confirm column names match HERA naming conventions
5. Then proceed with transaction operations

Show me the actual schema first.
```

### **For Core Entities:**
```
Before working with core entities:

1. Check exact schema of core_entities table
2. Check exact schema of core_dynamic_data table
3. Check exact schema of core_metadata table
4. Verify relationships between these tables
5. Confirm organization_id isolation patterns
6. Then proceed with entity operations

Show me the actual schema first.
```

### **For Organization Data:**
```
Before working with organization data:

1. Check exact schema of core_organizations table
2. Check exact schema of core_users table  
3. Check exact schema of user_organizations table
4. Verify the multi-tenant isolation setup
5. Confirm naming conventions (org_name vs name, etc.)
6. Then proceed with organization operations

Show me the actual schema first.
```

---

## 🔧 EMERGENCY SCHEMA SYNC COMMANDS

### **If Claude Makes Wrong Assumptions:**

```sql
-- Quick schema verification for any table
\d+ table_name_here

-- Or use this universal check:
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public' 
  AND t.table_name = 'YOUR_TABLE_NAME'
ORDER BY c.ordinal_position;
```

---

## 🎯 SAMPLE CONVERSATION FLOW

### **❌ WRONG WAY (What Currently Happens):**
```
User: "Add a customer to the database"
Claude: "I'll insert into customers table with name, email, phone columns..."
Result: ERROR - customers table doesn't exist, wrong column names
```

### **✅ RIGHT WAY (With Schema Verification):**
```
User: "Add a customer to the database"

Claude: "First, let me check the actual schema for customer data..."

[Runs schema verification queries]

Claude: "I see customers are stored in core_entities with entity_type='customer' 
and details in core_dynamic_data. The columns are:
- core_entities: id, organization_id, entity_type, entity_name, entity_code
- core_dynamic_data: entity_id, field_name, field_value, field_type

Now I'll create the customer using the actual HERA universal schema..."

Result: SUCCESS - Uses correct tables and columns
```

---

## 🚀 IMPLEMENTATION STRATEGY

### **1. Add to Claude CLI Context:**
Always start conversations with schema verification requirement.

### **2. Create Verification Habit:**
Make it automatic to check schema before any database work.

### **3. Use Specific Prompts:**
Don't say "add data" - say "verify schema first, then add data using actual table structure"

### **4. Maintain Schema Documentation:**
Keep the latest schema info readily available for Claude reference.

---

## 💡 PRO TIPS

### **For Complex Operations:**
```
Before complex database operations:

1. Get current schema for ALL involved tables
2. Map out the actual relationships 
3. Verify the HERA naming conventions in use
4. Check for any organization_id isolation requirements
5. Test with a simple query first
6. Then build the complex operation

Never assume - always verify current state first.
```

### **For New Features:**
```
Before building new features:

1. Check what tables/columns already exist for similar features
2. Verify the HERA universal schema patterns in use
3. Understand the current organization isolation setup
4. See how existing features implement similar functionality
5. Then design new feature to match existing patterns

Build on actual foundation, not assumed foundation.
```

---

## 🎯 FINAL MANDATE

**NEVER let Claude CLI make assumptions about database schema. Always verify first, then code based on actual reality.**

This simple habit will eliminate 90% of database errors and ensure Claude works with your actual HERA implementation, not an imagined version of it.

---

## 📝 QUICK REFERENCE

Copy this into every Claude CLI session:

```
RULE: Check actual schema before any database work.
COMMAND: Always run schema verification queries first.
RESULT: Code that works with actual database structure.
```

**Stop assumptions. Start with verification. Get working code every time.** ✅