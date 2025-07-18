# 🎯 **HERA Universal Debugging & Prevention Protocol**

## **THE FIVE SACRED DEBUGGING PRINCIPLES**

### **1. "Trust but Verify" - Always confirm assumptions with commands**
### **2. "Document as You Go" - Leave clear trails for future debugging** 
### **3. "Fail Fast, Learn Faster" - Test small changes before big ones**
### **4. "Structure First, Code Second" - Understand project layout before making changes**
### **5. "Breadcrumb Everything" - Every action should leave traceable evidence**

---

## 🚀 **MANDATORY PRE-ACTION PROTOCOL**

**Before ANY task, ALWAYS run this 4-step audit:**

### **STEP 1: ENVIRONMENT AUDIT** 🌍
```bash
# Where am I and what's here?
pwd && echo "📍 Current location confirmed"
ls -la | head -10 && echo "📂 Directory contents verified"
echo $PWD && echo "🔗 Working directory path confirmed"
```

### **STEP 2: PROJECT STRUCTURE AUDIT** 📁
```bash
# Find critical project files
echo "🔍 Scanning for project files..."
find . -maxdepth 3 -name "package.json" -type f | head -5
find . -maxdepth 3 -name "tsconfig.json" -type f | head -3  
find . -maxdepth 3 -name "next.config.*" -type f | head -3
find . -maxdepth 3 -name "*.md" | grep -E "(README|CLAUDE)" | head -3
echo "✅ Project structure audit complete"
```

### **STEP 3: GIT CONTEXT AUDIT** 📊
```bash
# Understand current state
git branch 2>/dev/null | grep "*" || echo "⚠️ Not in git repo"
git status --porcelain | wc -l | xargs echo "📝 Changed files:"
git log --oneline -3 2>/dev/null | head -3 || echo "🔄 No git history"
echo "✅ Git context confirmed"
```

### **STEP 4: BUILD CONTEXT AUDIT** ⚡
```bash
# Verify build capability
echo "🔨 Testing build readiness..."
ls package.json 2>/dev/null && echo "✅ package.json found" || echo "❌ package.json missing"
ls node_modules 2>/dev/null && echo "✅ Dependencies exist" || echo "⚠️ No node_modules"
npm run build --dry-run 2>/dev/null || echo "🔍 Build command availability unknown"
echo "✅ Build context audit complete"
```

---

## 📝 **MANDATORY DOCUMENTATION PROTOCOL**

### **Before Starting Any Task**
```bash
# Create session context file
cat > SESSION_$(date +%Y%m%d_%H%M%S).md << EOF
# Session Context - $(date)

## Task: [DESCRIBE TASK HERE]
## User Request: [COPY USER REQUEST]

## Pre-Action Audit Results:
- Location: $(pwd)
- Git Branch: $(git branch 2>/dev/null | grep "*" | cut -d' ' -f2 || echo "unknown")
- Package.json: $(ls package.json 2>/dev/null && echo "found" || echo "not found")
- Build Status: [TO BE UPDATED]

## Actions Planned:
1. [LIST PLANNED ACTIONS]

## Actions Taken:
[UPDATE AS YOU GO]

## Verification Steps:
[LIST HOW YOU'LL VERIFY SUCCESS]
EOF

echo "📋 Session documentation created: SESSION_$(date +%Y%m%d_%H%M%S).md"
```

### **After Each Major Action**
```bash
# Update session log
echo "$(date +%H:%M:%S) - [ACTION]: [DESCRIPTION]" >> RECENT_ACTIONS.log
echo "$(date +%H:%M:%S) - [RESULT]: [SUCCESS/FAILURE]" >> RECENT_ACTIONS.log
echo "$(date +%H:%M:%S) - [VERIFICATION]: [HOW VERIFIED]" >> RECENT_ACTIONS.log
```

---

## 🛡️ **DEFENSIVE OPERATION PROTOCOL**

### **For File Operations**
```bash
# SAFE FILE OPERATION TEMPLATE
safe_file_operation() {
    local action="$1"
    local source="$2" 
    local target="$3"
    
    echo "🔒 SAFE FILE OPERATION: $action"
    echo "📂 Source: $source"
    echo "🎯 Target: $target"
    
    # 1. Verify source exists
    [ -e "$source" ] && echo "✅ Source exists" || { echo "❌ Source missing"; return 1; }
    
    # 2. Create backup if target exists
    [ -e "$target" ] && cp -r "$target" "${target}.backup.$(date +%s)"
    
    # 3. Execute operation
    $action "$source" "$target"
    
    # 4. Verify operation
    [ -e "$target" ] && echo "✅ Operation successful" || echo "❌ Operation failed"
    
    # 5. Document
    echo "$(date): $action $source -> $target" >> FILE_OPERATIONS.log
}

# Usage: safe_file_operation "mv" "frontend/frontend/package.json" "frontend/package.json"
```

### **For Build Operations**
```bash
# SAFE BUILD VERIFICATION
safe_build_test() {
    echo "🔨 SAFE BUILD TEST"
    
    # 1. Clean state
    rm -rf .next 2>/dev/null
    echo "🧹 Cleaned build artifacts"
    
    # 2. Install dependencies
    npm install && echo "✅ Dependencies installed" || { echo "❌ Dependency install failed"; return 1; }
    
    # 3. Test build
    npm run build 2>&1 | tee build_test_$(date +%s).log
    local build_exit_code=${PIPESTATUS[0]}
    
    # 4. Report result
    if [ $build_exit_code -eq 0 ]; then
        echo "✅ Build successful"
        echo "$(date): Build test passed" >> BUILD_HISTORY.log
        return 0
    else
        echo "❌ Build failed"
        echo "$(date): Build test failed - see build_test_*.log" >> BUILD_HISTORY.log
        return 1
    fi
}
```

---

## 🎯 **TASK-SPECIFIC PROTOCOLS**

### **Directory Structure Issues**
```bash
# DIRECTORY STRUCTURE DIAGNOSTIC
diagnose_directory_structure() {
    echo "📁 DIRECTORY STRUCTURE DIAGNOSTIC"
    
    # Find all package.json files
    echo "🔍 All package.json files:"
    find . -name "package.json" -type f -exec echo "  📦 {}" \;
    
    # Check for nested project directories
    echo "🔍 Potential nested projects:"
    find . -name "node_modules" -type d | head -5
    
    # Check for build artifacts
    echo "🔍 Build artifacts:"
    find . -name ".next" -type d | head -3
    find . -name "dist" -type d | head -3
    
    # Verify expected structure
    echo "🔍 Expected files check:"
    ls package.json 2>/dev/null && echo "✅ package.json in root" || echo "❌ No package.json in root"
    ls tsconfig.json 2>/dev/null && echo "✅ tsconfig.json found" || echo "⚠️ No tsconfig.json"
    ls next.config.* 2>/dev/null && echo "✅ Next.js config found" || echo "⚠️ No Next.js config"
}
```

### **Build Failure Issues**
```bash
# BUILD FAILURE DIAGNOSTIC
diagnose_build_failure() {
    echo "🔨 BUILD FAILURE DIAGNOSTIC"
    
    # Check dependencies
    echo "📦 Dependency check:"
    npm list --depth=0 2>&1 | head -10
    
    # Check for common issues
    echo "🔍 Common issue check:"
    ls package-lock.json 2>/dev/null && echo "✅ package-lock.json exists" || echo "⚠️ No package-lock.json"
    ls yarn.lock 2>/dev/null && echo "⚠️ yarn.lock found - potential conflict" || echo "✅ No yarn.lock conflict"
    
    # Check build command
    echo "🔍 Build command check:"
    npm run build --dry-run 2>&1 | head -5
    
    # Check TypeScript
    echo "🔍 TypeScript check:"
    npx tsc --noEmit --skipLibCheck 2>&1 | head -10
}
```

---

## 📋 **IMPLEMENTATION CHECKLIST**

### **Before Every Session:**
- [ ] Run 4-step Pre-Action Audit
- [ ] Create session documentation file
- [ ] Verify current project state
- [ ] Understand user's specific request

### **During Task Execution:**
- [ ] Use defensive operation protocols
- [ ] Document each major action immediately
- [ ] Test small changes before big ones
- [ ] Verify each step before proceeding

### **After Task Completion:**
- [ ] Run verification tests
- [ ] Update session documentation
- [ ] Create summary for future reference
- [ ] Clean up temporary files

### **Before Ending Session:**
- [ ] Final build test
- [ ] Git status check
- [ ] Create handoff notes
- [ ] Update project status file

---

## 🔄 **EMERGENCY RECOVERY PROTOCOL**

If anything goes wrong during a session:

```bash
# EMERGENCY RECOVERY
emergency_recovery() {
    echo "🚨 EMERGENCY RECOVERY INITIATED"
    
    # 1. Stop all operations
    echo "⏹️ Stopping current operations"
    
    # 2. Document current state
    echo "📸 Documenting current state"
    pwd > emergency_recovery_$(date +%s).log
    ls -la >> emergency_recovery_$(date +%s).log
    git status >> emergency_recovery_$(date +%s).log 2>&1
    
    # 3. Restore from backup if available
    echo "🔄 Checking for recent backups"
    ls *.backup.* 2>/dev/null || echo "⚠️ No backups found"
    
    # 4. Reset to last known good state
    echo "↩️ Consider: git stash && git reset --hard HEAD"
    echo "⚠️ MANUAL INTERVENTION REQUIRED"
}
```

---

## 💾 **QUICK REFERENCE COMMANDS**

### **Start Every Session With:**
```bash
# Copy and paste this entire block at the start of any debugging session
echo "🚀 Starting HERA Universal Debugging Protocol"
pwd && echo "📍 Current location confirmed"
find . -maxdepth 3 -name "package.json" -type f | head -5
git branch 2>/dev/null | grep "*" || echo "⚠️ Not in git repo"
ls package.json 2>/dev/null && echo "✅ package.json found" || echo "❌ package.json missing"
echo "✅ Pre-Action Audit Complete - Ready to proceed"
```

### **Emergency Commands:**
```bash
# If confused about project structure
find . -name "package.json" -type f | head -10

# If build fails
npm run build 2>&1 | head -20

# If git issues
git status && git log --oneline -3
```

---

## 📖 **USAGE INSTRUCTIONS**

1. **Save this file** in the project root as `DEBUGGING_PROTOCOL.md`
2. **Reference it** at the start of every debugging session
3. **Follow the protocols** systematically, even for simple tasks
4. **Update it** when new patterns emerge
5. **Share it** with team members for consistency

**Remember: The goal is to prevent issues through systematic verification, not just fix them after they occur.**

---

## 🎯 **SUCCESS METRICS**

This protocol is working if:
- ✅ Directory structure issues are caught immediately
- ✅ Build failures are diagnosed quickly
- ✅ Session handoffs are smooth
- ✅ Recovery from errors is rapid
- ✅ Similar issues don't repeat

**Last Updated:** July 11, 2025
**Version:** 1.0
**Next Review:** [Set reminder for 30 days]