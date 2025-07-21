-- HERA Chart of Accounts AI Functions
-- Creates the missing PostgreSQL functions for COA AI features
-- Uses HERA Universal Architecture (core_entities, core_dynamic_data, universal_transactions)

-- Function 1: Get AI COA Dashboard Metrics
CREATE OR REPLACE FUNCTION get_ai_coa_dashboard_metrics(p_organization_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_accounts INTEGER;
    ai_confidence DECIMAL(5,2);
    suggestions_today INTEGER;
    time_saved_hours DECIMAL(4,2);
BEGIN
    -- Get total accounts for organization
    SELECT COUNT(*) INTO total_accounts
    FROM core_entities 
    WHERE organization_id = p_organization_id 
      AND entity_type = 'chart_of_account'
      AND is_active = true;

    -- Calculate AI confidence based on recent suggestions accepted
    SELECT COALESCE(AVG(
        CAST(dd.field_value AS DECIMAL)
    ), 85.0) INTO ai_confidence
    FROM core_entities ce
    JOIN core_dynamic_data dd ON ce.id = dd.entity_id
    WHERE ce.organization_id = p_organization_id
      AND ce.entity_type = 'ai_coa_suggestion'
      AND dd.field_name = 'confidence_score'
      AND ce.created_at >= CURRENT_DATE - INTERVAL '7 days';

    -- Count AI suggestions processed today
    SELECT COUNT(*) INTO suggestions_today
    FROM core_entities 
    WHERE organization_id = p_organization_id
      AND entity_type = 'ai_coa_suggestion'
      AND created_at >= CURRENT_DATE;

    -- Estimate time saved (5 minutes per suggestion on average)
    time_saved_hours := (suggestions_today * 5.0) / 60.0;

    -- Build result JSON
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

-- Function 2: Analyze Transaction Patterns for AI Suggestions  
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

    -- Find frequently used account patterns that might need new accounts
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
        HAVING COUNT(*) >= 5
        ORDER BY frequency DESC
        LIMIT 10
    LOOP
        -- Generate AI suggestion based on transaction patterns
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

    -- Build result
    result := json_build_object(
        'suggestions', suggestions,
        'analysis_period_days', p_days_back,
        'patterns_analyzed', array_length(suggestions, 1),
        'generated_at', NOW()
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function 3: Process AI Suggestion (Accept/Reject)
CREATE OR REPLACE FUNCTION process_ai_suggestion(
    p_organization_id UUID,
    p_suggestion_id UUID,
    p_action TEXT, -- 'accept' or 'reject'
    p_user_id UUID DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    result JSON;
    suggestion_record RECORD;
    new_account_id UUID;
    suggestion_data JSON;
BEGIN
    -- Get the suggestion details
    SELECT 
        ce.entity_name,
        ce.entity_code,
        dd.field_value as suggestion_json
    INTO suggestion_record
    FROM core_entities ce
    LEFT JOIN core_dynamic_data dd ON ce.id = dd.entity_id AND dd.field_name = 'suggestion_data'
    WHERE ce.id = p_suggestion_id
      AND ce.organization_id = p_organization_id
      AND ce.entity_type = 'ai_coa_suggestion';

    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Suggestion not found'
        );
    END IF;

    suggestion_data := suggestion_record.suggestion_json::JSON;

    IF p_action = 'accept' THEN
        -- Create the suggested account
        new_account_id := gen_random_uuid();
        
        INSERT INTO core_entities (
            id,
            organization_id,
            entity_type,
            entity_name,
            entity_code,
            is_active
        ) VALUES (
            new_account_id,
            p_organization_id,
            'chart_of_account',
            suggestion_data->>'title',
            suggestion_data->>'suggested_account_code',
            true
        );

        -- Add account properties
        INSERT INTO core_dynamic_data (entity_id, field_name, field_value, field_type)
        VALUES 
            (new_account_id, 'account_type', suggestion_data->>'account_type', 'text'),
            (new_account_id, 'description', suggestion_data->>'description', 'text'),
            (new_account_id, 'created_by_ai', 'true', 'text'),
            (new_account_id, 'ai_confidence', suggestion_data->>'confidence', 'number');

        -- Mark suggestion as completed
        UPDATE core_entities 
        SET entity_name = entity_name || ' [ACCEPTED]'
        WHERE id = p_suggestion_id;

        result := json_build_object(
            'success', true,
            'action', 'accepted',
            'new_account_id', new_account_id,
            'account_name', suggestion_data->>'title',
            'account_code', suggestion_data->>'suggested_account_code'
        );
    ELSE
        -- Mark suggestion as rejected
        UPDATE core_entities 
        SET entity_name = entity_name || ' [REJECTED]'
        WHERE id = p_suggestion_id;

        result := json_build_object(
            'success', true,
            'action', 'rejected',
            'suggestion_id', p_suggestion_id
        );
    END IF;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function 4: Detect Account Merge Opportunities
CREATE OR REPLACE FUNCTION ai_detect_merge_opportunities(p_organization_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
    opportunities JSON[];
    merge_record RECORD;
BEGIN
    opportunities := ARRAY[]::JSON[];

    -- Find accounts with similar names that could be merged
    FOR merge_record IN
        SELECT 
            a1.id as account1_id,
            a1.entity_name as account1_name,
            a1.entity_code as account1_code,
            a2.id as account2_id,
            a2.entity_name as account2_name,
            a2.entity_code as account2_code,
            similarity(a1.entity_name, a2.entity_name) as similarity_score
        FROM core_entities a1
        JOIN core_entities a2 ON a1.id < a2.id
        WHERE a1.organization_id = p_organization_id
          AND a2.organization_id = p_organization_id
          AND a1.entity_type = 'chart_of_account'
          AND a2.entity_type = 'chart_of_account'
          AND a1.is_active = true
          AND a2.is_active = true
          AND similarity(a1.entity_name, a2.entity_name) > 0.7
        ORDER BY similarity_score DESC
        LIMIT 5
    LOOP
        opportunities := opportunities || json_build_object(
            'type', 'MERGE',
            'title', 'Merge Similar Accounts',
            'description', 'Combine "' || merge_record.account1_name || '" and "' || merge_record.account2_name || '"',
            'confidence', (merge_record.similarity_score * 100)::INTEGER,
            'impact', 'MEDIUM',
            'account1_id', merge_record.account1_id,
            'account1_name', merge_record.account1_name,
            'account2_id', merge_record.account2_id,
            'account2_name', merge_record.account2_name,
            'similarity_score', merge_record.similarity_score
        );
    END LOOP;

    result := json_build_object(
        'opportunities', opportunities,
        'total_found', array_length(opportunities, 1),
        'generated_at', NOW()
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function 5: Generate Intelligent Account Code
CREATE OR REPLACE FUNCTION generate_intelligent_account_code(
    p_organization_id UUID,
    p_account_type TEXT,
    p_account_name TEXT
) RETURNS JSON AS $$
DECLARE
    result JSON;
    suggested_code VARCHAR(20);
    base_code INTEGER;
    sequence_num INTEGER;
    existing_codes INTEGER[];
BEGIN
    -- Determine base code based on account type
    base_code := CASE p_account_type
        WHEN 'ASSET' THEN 1000000
        WHEN 'LIABILITY' THEN 2000000
        WHEN 'EQUITY' THEN 3000000
        WHEN 'REVENUE' THEN 4000000
        WHEN 'EXPENSE' THEN 6000000
        ELSE 9000000
    END;

    -- Get existing codes in this range
    SELECT ARRAY(
        SELECT CAST(entity_code AS INTEGER)
        FROM core_entities
        WHERE organization_id = p_organization_id
          AND entity_type = 'chart_of_account'
          AND entity_code ~ '^[0-9]+$'
          AND CAST(entity_code AS INTEGER) BETWEEN base_code AND base_code + 999999
        ORDER BY CAST(entity_code AS INTEGER)
    ) INTO existing_codes;

    -- Find next available sequence
    sequence_num := 1;
    WHILE (base_code + (sequence_num * 100)) = ANY(existing_codes) LOOP
        sequence_num := sequence_num + 1;
    END LOOP;

    suggested_code := (base_code + (sequence_num * 100))::TEXT;

    -- Generate intelligent suggestions based on account name
    result := json_build_object(
        'suggested_code', suggested_code,
        'account_type', p_account_type,
        'base_code', base_code,
        'sequence_number', sequence_num,
        'naming_suggestions', json_build_array(
            p_account_name,
            INITCAP(p_account_name),
            UPPER(REPLACE(p_account_name, ' ', '_'))
        ),
        'confidence', 92,
        'reasoning', 'Based on existing account structure and naming patterns'
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust as needed for your setup)
-- GRANT EXECUTE ON FUNCTION get_ai_coa_dashboard_metrics(UUID) TO authenticated;
-- GRANT EXECUTE ON FUNCTION ai_analyze_transaction_patterns(UUID, INTEGER) TO authenticated;
-- GRANT EXECUTE ON FUNCTION process_ai_suggestion(UUID, UUID, TEXT, UUID) TO authenticated;
-- GRANT EXECUTE ON FUNCTION ai_detect_merge_opportunities(UUID) TO authenticated;
-- GRANT EXECUTE ON FUNCTION generate_intelligent_account_code(UUID, TEXT, TEXT) TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_core_entities_coa_org 
ON core_entities(organization_id, entity_type) 
WHERE entity_type IN ('chart_of_account', 'ai_coa_suggestion');

CREATE INDEX IF NOT EXISTS idx_universal_transactions_org_date 
ON universal_transactions(organization_id, transaction_date) 
WHERE is_financial = true;

-- Insert some sample AI suggestions for demonstration
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
    );
    
    INSERT INTO core_dynamic_data (entity_id, field_name, field_value, field_type)
    VALUES 
        (suggestion_id, 'suggestion_data', '{"type":"MERGE","confidence":92,"impact":"MEDIUM","description":"Consolidate Office Supplies and Office Materials accounts"}', 'text'),
        (suggestion_id, 'confidence_score', '92', 'number'),
        (suggestion_id, 'status', 'pending', 'text');

    -- Sample AI suggestion 2: Create new account  
    suggestion_id := gen_random_uuid();
    INSERT INTO core_entities (
        id, organization_id, entity_type, entity_name, entity_code, is_active
    ) VALUES (
        suggestion_id, mario_org_id, 'ai_coa_suggestion',
        'Create Online Delivery Fees Account', 'AI-CREATE-001', true
    );
    
    INSERT INTO core_dynamic_data (entity_id, field_name, field_value, field_type)
    VALUES 
        (suggestion_id, 'suggestion_data', '{"type":"CREATE","confidence":88,"impact":"HIGH","description":"Dedicated account for growing delivery expenses","suggested_account_code":"6150000","account_type":"EXPENSE"}', 'text'),
        (suggestion_id, 'confidence_score', '88', 'number'),
        (suggestion_id, 'status', 'pending', 'text');
END $$;

-- Test the functions
-- SELECT get_ai_coa_dashboard_metrics('123e4567-e89b-12d3-a456-426614174000');
-- SELECT ai_analyze_transaction_patterns('123e4567-e89b-12d3-a456-426614174000', 30);
-- SELECT ai_detect_merge_opportunities('123e4567-e89b-12d3-a456-426614174000');
-- SELECT generate_intelligent_account_code('123e4567-e89b-12d3-a456-426614174000', 'EXPENSE', 'Marketing Expenses');