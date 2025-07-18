# 🛡️ HERA Universal Branch Protection Rules

## 🌿 Branch Strategy

### **Main Branch (`main`)**
- **Purpose**: Production-ready code only
- **Protection Level**: Maximum
- **Auto-Deploy**: Production environment

### **Develop Branch (`develop`)**  
- **Purpose**: Integration and staging
- **Protection Level**: High
- **Auto-Deploy**: Staging environment

### **Feature Branches (`feature/*`)**
- **Purpose**: New features and enhancements
- **Naming**: `feature/module-name` or `feature/description`
- **Source**: Always branch from `develop`

### **Hotfix Branches (`hotfix/*`)**
- **Purpose**: Critical production fixes
- **Naming**: `hotfix/description`
- **Source**: Branch from `main`, merge to both `main` and `develop`

## 🔒 Protection Rules Configuration

### **Main Branch Protection**
```yaml
branch: main
protection_rules:
  # Require pull request reviews
  required_reviews:
    required_approving_review_count: 2
    dismiss_stale_reviews: true
    require_code_owner_reviews: true
    
  # Status checks
  required_status_checks:
    strict: true
    contexts:
      - "🛡️ Quality Gates & Security"
      - "🎨 Frontend Pipeline"
      - "🔧 Backend Pipeline" 
      - "🗄️ Database Pipeline"
      - "🔗 Integration Tests"
      - "🤖 Claude CLI Team Integration"
      
  # Additional restrictions
  enforce_admins: true
  allow_force_pushes: false
  allow_deletions: false
  restrict_pushes: true
  
  # Required signatures
  required_signed_commits: true
```

### **Develop Branch Protection**
```yaml
branch: develop
protection_rules:
  # Require pull request reviews
  required_reviews:
    required_approving_review_count: 1
    dismiss_stale_reviews: true
    
  # Status checks
  required_status_checks:
    strict: true
    contexts:
      - "🛡️ Quality Gates & Security"
      - "🎨 Frontend Pipeline"
      - "🔧 Backend Pipeline"
      - "🔗 Integration Tests"
      
  # Additional restrictions
  enforce_admins: false
  allow_force_pushes: false
  allow_deletions: false
```

## 👥 Required Reviewers

### **CODEOWNERS Configuration**
```bash
# Global ownership
* @hera-universal/core-team

# Frontend specific
/frontend/ @hera-universal/frontend-team
/frontend/lib/services/ @hera-universal/architecture-team
/frontend/components/ @hera-universal/ui-team

# Backend specific  
/backend/ @hera-universal/backend-team
/backend/ai_engine/ @hera-universal/ai-team

# Database changes
/database/ @hera-universal/database-team
*-schema.sql @hera-universal/architecture-team

# Infrastructure
/.github/ @hera-universal/devops-team
/tools/ @hera-universal/architecture-team

# Documentation
/docs/ @hera-universal/documentation-team
README.md @hera-universal/core-team
```

## 🧪 Quality Gates

### **Required Checks Before Merge**

#### **1. Automated Testing**
- [ ] Unit tests pass (>95% success rate)
- [ ] Integration tests pass
- [ ] HERA module tests pass (>90% score)
- [ ] Security scans clean
- [ ] Performance benchmarks met

#### **2. Code Quality**
- [ ] TypeScript compilation successful
- [ ] Linting passes (no errors)
- [ ] Code formatting consistent
- [ ] No security vulnerabilities
- [ ] Performance regression analysis

#### **3. Architecture Compliance**
- [ ] Universal Schema patterns followed
- [ ] AI integration properly implemented
- [ ] Real-time subscriptions configured
- [ ] Mobile-first design verified
- [ ] Error handling comprehensive

#### **4. Documentation**
- [ ] Code is self-documenting
- [ ] README updated (if needed)
- [ ] API documentation current
- [ ] Module documentation generated

## 🚀 Deployment Rules

### **Staging Deployment (Develop Branch)**
- **Trigger**: Successful merge to `develop`
- **Requirements**: All quality gates passed
- **Environment**: Staging/Preview
- **Auto-Deploy**: Yes
- **Rollback**: Automatic on failure

### **Production Deployment (Main Branch)**
- **Trigger**: Successful merge to `main`
- **Requirements**: 
  - All quality gates passed
  - Staging deployment successful
  - Manual approval required
- **Environment**: Production
- **Auto-Deploy**: Yes (after approval)
- **Rollback**: Manual trigger available

## 🔐 Security Requirements

### **Required Security Checks**
- [ ] CodeQL analysis passed
- [ ] Dependency vulnerability scan clean
- [ ] Secrets scanning passed
- [ ] SAST (Static Application Security Testing)
- [ ] License compliance verified

### **Additional Security Measures**
- [ ] No hardcoded secrets
- [ ] Environment variables properly managed
- [ ] Authentication/authorization reviewed
- [ ] Data privacy compliance (GDPR)
- [ ] Audit logging implemented

## 📊 Merge Requirements

### **Feature Branch → Develop**
1. **Required Approvals**: 1 team member
2. **Required Checks**: All automated tests
3. **Claude AI Review**: Recommended
4. **Documentation**: Updated if needed

### **Develop → Main (Release)**
1. **Required Approvals**: 2 core team members
2. **Required Checks**: Full pipeline success
3. **Release Notes**: Must be provided
4. **Staging Validation**: Must be verified

### **Hotfix → Main (Emergency)**
1. **Required Approvals**: 1 core team member + 1 senior
2. **Required Checks**: Critical tests only
3. **Emergency Override**: Available for critical issues
4. **Post-Merge**: Full testing in production

## 🎯 Performance Criteria

### **Build Performance**
- Frontend build: < 5 minutes
- Backend tests: < 3 minutes
- Database tests: < 2 minutes
- Integration tests: < 10 minutes
- Total pipeline: < 15 minutes

### **Code Quality Metrics**
- Test coverage: > 90%
- TypeScript coverage: 100%
- Linting errors: 0
- Security vulnerabilities: 0
- Performance regression: 0%

## 🚨 Emergency Procedures

### **Critical Hotfix Process**
1. **Create hotfix branch** from `main`
2. **Implement minimal fix** with tests
3. **Fast-track review** (1 approver minimum)
4. **Deploy to staging** for validation
5. **Emergency deploy** to production
6. **Post-incident review** required

### **Rollback Process**
1. **Immediate rollback** via deployment tools
2. **Create rollback PR** if needed
3. **Incident analysis** and documentation
4. **Prevention measures** implementation

## 📋 Compliance & Audit

### **Audit Trail Requirements**
- All changes tracked in git history
- Review comments preserved
- Deployment logs maintained
- Security scans archived
- Performance metrics recorded

### **Compliance Checks**
- SOC 2 compliance verified
- GDPR requirements met
- Industry standards followed
- Security policies enforced
- Change management documented

---

## 🛠️ GitHub Configuration Commands

To implement these rules via GitHub CLI:

```bash
# Enable branch protection for main
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["ci/frontend","ci/backend","ci/integration"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":2}'

# Enable branch protection for develop  
gh api repos/:owner/:repo/branches/develop/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["ci/frontend","ci/backend"]}' \
  --field required_pull_request_reviews='{"required_approving_review_count":1}'
```