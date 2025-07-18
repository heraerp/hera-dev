#!/bin/bash
# Setup HERA Universal Architecture enforcement git hooks

echo "🔧 Setting up HERA architecture enforcement hooks..."

# Create pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# HERA Universal Architecture validation

echo "🔍 Validating HERA architecture patterns..."

# Run architecture validation
node scripts/validate-architecture.js

if [ $? -ne 0 ]; then
    echo ""
    echo "🚨 COMMIT BLOCKED: Architecture violations found"
    echo "📚 See docs/HERA_ARCHITECTURE_ENFORCEMENT.md for rules"
    echo "🔧 Use templates/crud/ for reference patterns"
    echo ""
    exit 1
fi

echo "✅ Architecture validation passed"
EOF

# Make hooks executable
chmod +x .git/hooks/pre-commit

echo "✅ Git hooks installed successfully!"
echo ""
echo "📋 Architecture enforcement is now active:"
echo "   - Pre-commit validation for HERA patterns"
echo "   - Blocks direct Supabase usage outside approved files"
echo "   - Enforces UniversalCrudService usage"
echo "   - Validates EntityData interface compliance"
echo ""
echo "🎯 This prevents 'vibe coding' deviations from HERA standards!"