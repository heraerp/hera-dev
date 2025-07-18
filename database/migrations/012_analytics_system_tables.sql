-- =====================================================
-- HERA Universal Analytics System Tables Migration
-- =====================================================
-- Creates all required tables for the analytics tracking system
-- Includes A/B testing, conversion funnels, performance monitoring

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. ANALYTICS EVENTS TABLE
-- =====================================================
-- Main events tracking table for all user interactions
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    session_id TEXT NOT NULL,
    user_id TEXT,
    variant_id TEXT, -- For A/B testing
    event_properties JSONB DEFAULT '{}',
    page_url TEXT,
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_variant ON analytics_events(variant_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_properties ON analytics_events USING GIN(event_properties);

-- =====================================================
-- 2. CONVERSION FUNNEL METRICS TABLE
-- =====================================================
-- Tracks funnel step counts and conversion metrics
CREATE TABLE IF NOT EXISTS funnel_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    funnel_name TEXT NOT NULL,
    step_name TEXT NOT NULL,
    step_number INTEGER DEFAULT 1,
    count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(funnel_name, step_name)
);

-- Indexes for funnel metrics
CREATE INDEX IF NOT EXISTS idx_funnel_metrics_name ON funnel_metrics(funnel_name);
CREATE INDEX IF NOT EXISTS idx_funnel_metrics_step ON funnel_metrics(step_name);
CREATE INDEX IF NOT EXISTS idx_funnel_metrics_number ON funnel_metrics(step_number);

-- =====================================================
-- 3. A/B TEST METRICS TABLE
-- =====================================================
-- Tracks individual A/B test events and conversions
CREATE TABLE IF NOT EXISTS ab_test_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    is_conversion BOOLEAN DEFAULT FALSE,
    test_name TEXT,
    user_properties JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for A/B test metrics
CREATE INDEX IF NOT EXISTS idx_ab_test_variant ON ab_test_metrics(variant_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_session ON ab_test_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_conversion ON ab_test_metrics(is_conversion);
CREATE INDEX IF NOT EXISTS idx_ab_test_name ON ab_test_metrics(test_name);
CREATE INDEX IF NOT EXISTS idx_ab_test_timestamp ON ab_test_metrics(timestamp);

-- =====================================================
-- 4. A/B TEST SUMMARY TABLE
-- =====================================================
-- Aggregated A/B test results for dashboard performance
CREATE TABLE IF NOT EXISTS ab_test_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id TEXT NOT NULL UNIQUE,
    test_name TEXT,
    total_visitors INTEGER DEFAULT 0,
    total_conversions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0.00,
    confidence_level DECIMAL(5,2) DEFAULT 0.00,
    statistical_significance DECIMAL(5,2) DEFAULT 0.00,
    is_winner BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for A/B test summary
CREATE INDEX IF NOT EXISTS idx_ab_summary_variant ON ab_test_summary(variant_id);
CREATE INDEX IF NOT EXISTS idx_ab_summary_test ON ab_test_summary(test_name);
CREATE INDEX IF NOT EXISTS idx_ab_summary_winner ON ab_test_summary(is_winner);

-- =====================================================
-- 5. PERFORMANCE METRICS TABLE
-- =====================================================
-- Tracks page performance and loading times
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    page_url TEXT NOT NULL,
    dom_content_loaded INTEGER, -- milliseconds
    page_load_time INTEGER, -- milliseconds
    dns_lookup INTEGER, -- milliseconds
    server_response INTEGER, -- milliseconds
    dom_processing INTEGER, -- milliseconds
    first_contentful_paint INTEGER, -- milliseconds
    largest_contentful_paint INTEGER, -- milliseconds
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance metrics
CREATE INDEX IF NOT EXISTS idx_performance_session ON performance_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_performance_url ON performance_metrics(page_url);
CREATE INDEX IF NOT EXISTS idx_performance_timestamp ON performance_metrics(timestamp);

-- =====================================================
-- 6. ENGAGEMENT METRICS TABLE
-- =====================================================
-- Tracks user engagement and interaction data
CREATE TABLE IF NOT EXISTS engagement_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    page_url TEXT NOT NULL,
    time_on_page INTEGER, -- milliseconds
    max_scroll_depth INTEGER, -- percentage 0-100
    was_active BOOLEAN DEFAULT TRUE,
    page_views INTEGER DEFAULT 1,
    click_count INTEGER DEFAULT 0,
    interaction_events JSONB DEFAULT '[]',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for engagement metrics
CREATE INDEX IF NOT EXISTS idx_engagement_session ON engagement_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_engagement_url ON engagement_metrics(page_url);
CREATE INDEX IF NOT EXISTS idx_engagement_active ON engagement_metrics(was_active);
CREATE INDEX IF NOT EXISTS idx_engagement_timestamp ON engagement_metrics(timestamp);

-- =====================================================
-- 7. LEADS TABLE
-- =====================================================
-- Stores lead capture data from forms
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    restaurant_name TEXT,
    phone_number TEXT,
    restaurant_type TEXT,
    monthly_revenue TEXT,
    current_challenges TEXT[],
    referral_source TEXT DEFAULT 'landing_page',
    ab_test_variant TEXT,
    estimated_savings DECIMAL(10,2),
    form_data JSONB DEFAULT '{}',
    lead_status TEXT DEFAULT 'new', -- new, contacted, qualified, converted, lost
    lead_score INTEGER DEFAULT 0, -- 0-100 scoring
    follow_up_date TIMESTAMPTZ,
    assigned_to TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for leads
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_leads_variant ON leads(ab_test_variant);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(lead_score);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);

-- =====================================================
-- 8. DATABASE FUNCTIONS FOR ANALYTICS
-- =====================================================

-- Function to increment A/B test visitor counts
CREATE OR REPLACE FUNCTION increment_visitor_count(variant_id TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO ab_test_summary (variant_id, total_visitors)
    VALUES (variant_id, 1)
    ON CONFLICT (variant_id)
    DO UPDATE SET 
        total_visitors = ab_test_summary.total_visitors + 1,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to increment A/B test conversion counts
CREATE OR REPLACE FUNCTION increment_conversion_count(variant_id TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO ab_test_summary (variant_id, total_conversions)
    VALUES (variant_id, 1)
    ON CONFLICT (variant_id)
    DO UPDATE SET 
        total_conversions = ab_test_summary.total_conversions + 1,
        updated_at = NOW();
        
    -- Update conversion rate
    UPDATE ab_test_summary 
    SET conversion_rate = CASE 
        WHEN total_visitors > 0 THEN (total_conversions::DECIMAL / total_visitors) * 100
        ELSE 0
    END
    WHERE ab_test_summary.variant_id = increment_conversion_count.variant_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate A/B test statistical significance
CREATE OR REPLACE FUNCTION calculate_ab_test_significance()
RETURNS VOID AS $$
DECLARE
    control_record RECORD;
    variant_record RECORD;
    z_score DECIMAL;
    p_value DECIMAL;
BEGIN
    -- Find control variant
    SELECT * INTO control_record 
    FROM ab_test_summary 
    WHERE variant_id LIKE '%control%' 
    ORDER BY total_visitors DESC 
    LIMIT 1;
    
    IF control_record IS NULL THEN
        RETURN;
    END IF;
    
    -- Update significance for all variants
    FOR variant_record IN 
        SELECT * FROM ab_test_summary 
        WHERE variant_id != control_record.variant_id
    LOOP
        -- Simplified z-score calculation
        -- In production, use proper statistical libraries
        IF control_record.total_visitors > 0 AND variant_record.total_visitors > 0 THEN
            z_score := ABS(variant_record.conversion_rate - control_record.conversion_rate) / 
                      SQRT((control_record.conversion_rate * (100 - control_record.conversion_rate) / control_record.total_visitors) +
                           (variant_record.conversion_rate * (100 - variant_record.conversion_rate) / variant_record.total_visitors));
            
            -- Convert z-score to confidence level (simplified)
            UPDATE ab_test_summary 
            SET statistical_significance = LEAST(99.99, GREATEST(0, z_score * 20))
            WHERE variant_id = variant_record.variant_id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Trigger to update funnel metrics updated_at
CREATE OR REPLACE FUNCTION update_funnel_metrics_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_funnel_metrics_timestamp
    BEFORE UPDATE ON funnel_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_funnel_metrics_timestamp();

-- Trigger to update A/B test summary timestamp
CREATE OR REPLACE FUNCTION update_ab_summary_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ab_summary_timestamp
    BEFORE UPDATE ON ab_test_summary
    FOR EACH ROW
    EXECUTE FUNCTION update_ab_summary_timestamp();

-- Trigger to update leads timestamp
CREATE OR REPLACE FUNCTION update_leads_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_leads_timestamp
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_leads_timestamp();

-- =====================================================
-- 10. ROW LEVEL SECURITY (Optional)
-- =====================================================
-- Enable RLS for multi-tenant scenarios if needed

-- ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Example RLS policy (uncomment if multi-tenant analytics needed)
-- CREATE POLICY analytics_isolation ON analytics_events
--     USING (session_id = current_setting('app.current_session_id'));

-- =====================================================
-- 11. SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample A/B test variants
INSERT INTO ab_test_summary (variant_id, test_name, total_visitors, total_conversions) 
VALUES 
    ('control', 'landing_page_optimization', 100, 15),
    ('savings_focused', 'landing_page_optimization', 95, 18),
    ('ai_focused', 'landing_page_optimization', 88, 12),
    ('urgency_focused', 'landing_page_optimization', 103, 22)
ON CONFLICT (variant_id) DO NOTHING;

-- Update conversion rates for sample data
UPDATE ab_test_summary 
SET conversion_rate = CASE 
    WHEN total_visitors > 0 THEN (total_conversions::DECIMAL / total_visitors) * 100
    ELSE 0
END;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'Analytics system tables migration completed successfully';
    RAISE NOTICE 'Created tables: analytics_events, funnel_metrics, ab_test_metrics, ab_test_summary, performance_metrics, engagement_metrics, leads';
    RAISE NOTICE 'Created functions: increment_visitor_count, increment_conversion_count, calculate_ab_test_significance';
    RAISE NOTICE 'Sample A/B test data inserted for testing';
END $$;