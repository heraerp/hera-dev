/**
 * HERA Universal Architecture Enforcement Rules
 * Prevents deviations from standardized patterns
 */

module.exports = {
  rules: {
    // Prevent direct Supabase client usage outside approved files
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@/lib/supabase/client',
            message: '🚨 HERA VIOLATION: Use UniversalCrudService instead of direct Supabase client. Check templates/crud/ for patterns.'
          },
          {
            name: '@/lib/supabase/server', 
            message: '🚨 HERA VIOLATION: Use UniversalCrudService instead of direct Supabase server. Check templates/crud/ for patterns.'
          }
        ],
        patterns: [
          {
            group: ['**/workflow-orchestrator', '**/erp-integration-service'],
            message: '🚨 HERA VIOLATION: Backend services not allowed. Use UniversalCrudService for database operations.'
          }
        ]
      }
    ],
    
    // Require naming convention validation
    'hera/require-naming-validation': 'error',
    
    // Require UniversalCrudService for database operations
    'hera/require-universal-crud': 'error'
  },
  
  // Override for approved files that can use direct Supabase
  overrides: [
    {
      files: [
        'lib/supabase/client.ts',
        'lib/supabase/server.ts', 
        'lib/services/universalCrudService.ts',
        'middleware.ts'
      ],
      rules: {
        'no-restricted-imports': 'off'
      }
    }
  ]
};