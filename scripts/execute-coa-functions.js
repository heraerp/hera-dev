// Execute COA AI Functions via Supabase
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeFunctions() {
  console.log('🚀 Creating Chart of Accounts AI Functions...');

  try {
    // Test if similarity extension exists, create if not
    const { error: extensionError } = await supabase.rpc('exec_sql', {
      query: 'CREATE EXTENSION IF NOT EXISTS pg_trgm;'
    });
    
    if (extensionError && !extensionError.message.includes('already exists')) {
      console.log('Note: pg_trgm extension may not be available:', extensionError.message);
    }

    // Function 1: Dashboard Metrics
    console.log('Creating get_ai_coa_dashboard_metrics...');
    const { error: func1Error } = await supabase.rpc('exec_sql', {
      query: `
        CREATE OR REPLACE FUNCTION get_ai_coa_dashboard_metrics(p_organization_id UUID)
        RETURNS JSON AS $$
        DECLARE
            result JSON;
            total_accounts INTEGER;
            ai_confidence DECIMAL(5,2);
            suggestions_today INTEGER;
            time_saved_hours DECIMAL(4,2);
        BEGIN
            SELECT COUNT(*) INTO total_accounts
            FROM core_entities 
            WHERE organization_id = p_organization_id 
              AND entity_type = 'chart_of_account'
              AND is_active = true;

            SELECT COALESCE(AVG(
                CAST(dd.field_value AS DECIMAL)
            ), 85.0) INTO ai_confidence
            FROM core_entities ce
            JOIN core_dynamic_data dd ON ce.id = dd.entity_id
            WHERE ce.organization_id = p_organization_id
              AND ce.entity_type = 'ai_coa_suggestion'
              AND dd.field_name = 'confidence_score'
              AND ce.created_at >= CURRENT_DATE - INTERVAL '7 days';

            SELECT COUNT(*) INTO suggestions_today
            FROM core_entities 
            WHERE organization_id = p_organization_id
              AND entity_type = 'ai_coa_suggestion'
              AND created_at >= CURRENT_DATE;

            time_saved_hours := (suggestions_today * 5.0) / 60.0;

            result := json_build_object(
                'totalAccounts', total_accounts,
                'aiConfidence', ai_confidence,
                'suggestionsToday', suggestions_today,
                'timeSavedHours', time_saved_hours,
                'lastUpdated', NOW()
            );

            RETURN result;
        END;
        $$ LANGUAGE plpgsql;
      `
    });

    if (func1Error) {
      console.error('Error creating function 1:', func1Error);
    } else {
      console.log('✅ Dashboard metrics function created');
    }

    // Function 2: Transaction Pattern Analysis
    console.log('Creating ai_analyze_transaction_patterns...');
    const { error: func2Error } = await supabase.rpc('exec_sql', {
      query: `
        CREATE OR REPLACE FUNCTION ai_analyze_transaction_patterns(
            p_organization_id UUID, 
            p_days_back INTEGER DEFAULT 30
        ) RETURNS JSON AS $$
        DECLARE
            result JSON;
            suggestions JSON[];
            pattern_record RECORD;
        BEGIN
            suggestions := ARRAY[]::JSON[];

            FOR pattern_record IN
                SELECT 
                    ut.transaction_type,
                    COUNT(*) as frequency,
                    AVG(ut.total_amount) as avg_amount
                FROM universal_transactions ut
                WHERE ut.organization_id = p_organization_id
                  AND ut.transaction_date >= CURRENT_DATE - INTERVAL '1 day' * p_days_back
                  AND ut.is_financial = true
                GROUP BY ut.transaction_type
                HAVING COUNT(*) >= 3
                ORDER BY frequency DESC
                LIMIT 5
            LOOP
                suggestions := suggestions || json_build_object(
                    'type', 'CREATE',
                    'title', 'New Account for ' || pattern_record.transaction_type,
                    'description', 'Frequently used transaction type (' || pattern_record.frequency || ' times)',
                    'confidence', LEAST(95.0, 60.0 + (pattern_record.frequency * 2)),
                    'impact', CASE 
                        WHEN pattern_record.frequency > 20 THEN 'HIGH'
                        WHEN pattern_record.frequency > 10 THEN 'MEDIUM'
                        ELSE 'LOW'
                    END,
                    'suggested_account_code', '6' || LPAD((1000 + pattern_record.frequency)::TEXT, 3, '0') || '00',
                    'avg_monthly_amount', pattern_record.avg_amount
                );
            END LOOP;

            result := json_build_object(
                'suggestions', suggestions,
                'analysis_period_days', p_days_back,
                'patterns_analyzed', array_length(suggestions, 1),
                'generated_at', NOW()
            );

            RETURN result;
        END;
        $$ LANGUAGE plpgsql;
      `
    });

    if (func2Error) {
      console.error('Error creating function 2:', func2Error);
    } else {
      console.log('✅ Transaction pattern analysis function created');
    }

    // Create sample AI suggestions for Mario's restaurant
    console.log('Creating sample AI suggestions...');
    const marioOrgId = '123e4567-e89b-12d3-a456-426614174000';
    
    const { error: sampleError } = await supabase.rpc('exec_sql', {
      query: `
        DO $$
        DECLARE
            mario_org_id UUID := '123e4567-e89b-12d3-a456-426614174000';
            suggestion_id UUID;
        BEGIN
            -- Sample AI suggestion 1: Merge accounts
            suggestion_id := gen_random_uuid();
            INSERT INTO core_entities (
                id, organization_id, entity_type, entity_name, entity_code, is_active
            ) VALUES (
                suggestion_id, mario_org_id, 'ai_coa_suggestion', 
                'Merge Office Supply Accounts', 'AI-MERGE-001', true
            ) ON CONFLICT (id) DO NOTHING;
            
            INSERT INTO core_dynamic_data (entity_id, field_name, field_value, field_type)
            VALUES 
                (suggestion_id, 'suggestion_data', '{"type":"MERGE","confidence":92,"impact":"MEDIUM","description":"Consolidate Office Supplies and Office Materials accounts"}', 'text'),
                (suggestion_id, 'confidence_score', '92', 'number'),
                (suggestion_id, 'status', 'pending', 'text')
            ON CONFLICT (entity_id, field_name) DO NOTHING;

            -- Sample AI suggestion 2: Create new account  
            suggestion_id := gen_random_uuid();
            INSERT INTO core_entities (
                id, organization_id, entity_type, entity_name, entity_code, is_active
            ) VALUES (
                suggestion_id, mario_org_id, 'ai_coa_suggestion',
                'Create Online Delivery Fees Account', 'AI-CREATE-001', true
            ) ON CONFLICT (id) DO NOTHING;
            
            INSERT INTO core_dynamic_data (entity_id, field_name, field_value, field_type)
            VALUES 
                (suggestion_id, 'suggestion_data', '{"type":"CREATE","confidence":88,"impact":"HIGH","description":"Dedicated account for growing delivery expenses","suggested_account_code":"6150000","account_type":"EXPENSE"}', 'text'),
                (suggestion_id, 'confidence_score', '88', 'number'),
                (suggestion_id, 'status', 'pending', 'text')
            ON CONFLICT (entity_id, field_name) DO NOTHING;
        END $$;
      `
    });

    if (sampleError) {
      console.error('Error creating sample data:', sampleError);
    } else {
      console.log('✅ Sample AI suggestions created');
    }

    // Test the functions
    console.log('🧪 Testing functions...');
    
    const { data: metricsData, error: metricsError } = await supabase
      .rpc('get_ai_coa_dashboard_metrics', { p_organization_id: marioOrgId });

    if (metricsError) {
      console.error('Error testing metrics function:', metricsError);
    } else {
      console.log('✅ Dashboard metrics test:', metricsData);
    }

    const { data: patternData, error: patternError } = await supabase
      .rpc('ai_analyze_transaction_patterns', { 
        p_organization_id: marioOrgId, 
        p_days_back: 30 
      });

    if (patternError) {
      console.error('Error testing pattern analysis:', patternError);
    } else {
      console.log('✅ Pattern analysis test:', patternData);
    }

    console.log('🎉 Chart of Accounts AI Functions Setup Complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Visit http://localhost:3001/finance/chart-of-accounts');
    console.log('2. Try the onboarding: http://localhost:3001/finance/chart-of-accounts/onboarding');
    console.log('3. Test the AI suggestions in the QuickCOAWidget');
    console.log('4. Use the global COA floating button on any page');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the setup
executeFunctions();