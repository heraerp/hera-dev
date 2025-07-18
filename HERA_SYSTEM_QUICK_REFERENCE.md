# 🎯 HERA System Quick Reference
**For Claude CLI Development Sessions**

## 🚀 System Organization IDs

```
Core Platform:     00000001-0001-0000-0000-000000000000
AI Intelligence:   00000001-0002-0000-0000-000000000000  
Security:          00000001-0003-0000-0000-000000000000
Developer Tools:   00000001-0004-0000-0000-000000000000
Analytics:         00000001-0005-0000-0000-000000000000
Integration:       00000001-0006-0000-0000-000000000000
```

## 🔧 Entity ID Patterns

```
Platform Features: 00000002-XXXX-0000-0000-000000000000
AI Models:         00000003-XXXX-0000-0000-000000000000
Dev Tasks:         00000004-XXXX-0000-0000-000000000000
Metrics:           00000005-XXXX-0000-0000-000000000000
Security:          00000006-XXXX-0000-0000-000000000000
Integrations:      00000007-XXXX-0000-0000-000000000000
```

## 📋 Common Entity Types

- `platform_feature` - Core capabilities
- `ai_model` - AI/ML models
- `development_task` - Dev work items
- `performance_metric` - System metrics
- `security_policy` - Security controls
- `integration_config` - External integrations

## ⚡ Quick Commands

### Show System Overview
```sql
SELECT co.org_name, ce.entity_type, ce.entity_name, ce.entity_code
FROM core_entities ce
JOIN core_organizations co ON ce.organization_id = co.id
WHERE co.client_id = '00000000-0000-0000-0000-000000000001'
ORDER BY co.org_name, ce.entity_type;
```

### Add Platform Feature
```sql
INSERT INTO core_entities VALUES
('00000002-XXXX-0000-0000-000000000000', '00000001-0001-0000-0000-000000000000', 
 'platform_feature', 'Feature Name', 'CODE', true, NOW(), NOW());
```

### Add AI Model
```sql
INSERT INTO core_entities VALUES
('00000003-XXXX-0000-0000-000000000000', '00000001-0002-0000-0000-000000000000',
 'ai_model', 'Model Name', 'CODE', true, NOW(), NOW());
```

### Add Development Task
```sql
INSERT INTO core_entities VALUES
('00000004-XXXX-0000-0000-000000000000', '00000001-0004-0000-0000-000000000000',
 'development_task', 'Task Name', 'CODE', true, NOW(), NOW());
```

## 🎯 Current System Entities (26 Total)

**Platform Features (5)**
- UTS-CORE: Universal Transaction System
- PROC-SMART: Smart Procurement Module  
- INV-AI: AI-Powered Inventory Management
- SCAN-MOBILE: Mobile Scanner Ecosystem
- SELF-DEV: Self-Development Architecture

**AI Models (5)**
- ICM-v2.1: Invoice Classification Model
- DFE-v1.3: Demand Forecasting Engine
- FDS-v2.0: Fraud Detection System
- NLQP-v1.0: Natural Language Query Processor
- SIAE-v1.0: Self-Improvement Analysis Engine

**Development Tasks (5)**
- TASK-SELF-DEV: Self-Development Architecture (100%)
- TASK-MOD-GEN: Universal Module Generator (75%)
- TASK-AI-CTX: AI Context Manager
- TASK-SCAN-PERF: Mobile Scanner Performance
- TASK-CICD: CI/CD Pipeline

**Performance Metrics (5)**
- PERF-RESPONSE: Platform Response Time
- PERF-AI-ACC: AI Processing Accuracy
- PERF-USER-SAT: User Satisfaction Score
- PERF-DEV-VEL: Development Velocity
- PERF-SELF-IMP: Self-Improvement Rate

**Security Policies (3)**
- SEC-ENCRYPT: Data Encryption Policy
- SEC-ACCESS: Access Control Matrix
- SEC-AI-STD: AI Model Security Standards

**Integration Configs (3)**
- INT-SUPABASE: Supabase Real-time Integration
- INT-OPENAI: OpenAI API Integration
- INT-CLAUDE: Claude API Integration

## 🏗️ System User ID
```
System User: 00000001-0000-0000-0000-000000000001
```
Use this for all `created_by` fields in metadata.

## 📊 Utility Scripts

```bash
# Interactive management
node scripts/hera-system-manager.js

# Quick overview
node scripts/hera-system-manager.js overview

# Generate report
node scripts/hera-system-manager.js report
```

---
**HERA develops itself using its own universal patterns! 🚀**