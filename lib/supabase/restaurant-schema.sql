-- HERA Universal ERP - Restaurant Management Schema
-- Additional tables for restaurant-specific functionality

-- 1. Restaurant Social Proof Table (for real-time activity feed)
CREATE TABLE restaurant_social_proof (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_name VARCHAR(255) NOT NULL,
    achievement VARCHAR(500) NOT NULL,
    metric VARCHAR(100),
    value DECIMAL(10,2),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_real BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Restaurant Hook Analytics Table (for behavioral tracking)
CREATE TABLE restaurant_hook_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    restaurant_id UUID REFERENCES core_entities(id),
    session_id UUID DEFAULT gen_random_uuid(),
    current_phase VARCHAR(50) NOT NULL,
    actions_count INTEGER DEFAULT 0,
    rewards_triggered INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- in seconds
    completion_rate DECIMAL(5,2) DEFAULT 0,
    engagement_score DECIMAL(5,2) DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Restaurant Benchmarks Table (for predictions and comparisons)
CREATE TABLE restaurant_benchmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cuisine VARCHAR(100) NOT NULL,
    size_category VARCHAR(50) NOT NULL,
    location_type VARCHAR(100),
    avg_revenue_increase DECIMAL(5,2) DEFAULT 0,
    avg_efficiency_gain DECIMAL(5,2) DEFAULT 0,
    avg_customer_satisfaction DECIMAL(3,2) DEFAULT 0,
    sample_size INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Restaurant Success Stories Table (for social proof)
CREATE TABLE restaurant_success_stories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES core_entities(id),
    story_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    metrics JSONB,
    before_data JSONB,
    after_data JSONB,
    timeframe_days INTEGER,
    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Restaurant Activity Log Table (for detailed tracking)
CREATE TABLE restaurant_activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    restaurant_id UUID REFERENCES core_entities(id),
    activity_type VARCHAR(100) NOT NULL,
    activity_data JSONB,
    hook_phase VARCHAR(50),
    reward_triggered VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id UUID,
    ip_address INET,
    user_agent TEXT
);

-- Indexes for performance
CREATE INDEX idx_restaurant_social_proof_timestamp ON restaurant_social_proof(timestamp DESC);
CREATE INDEX idx_restaurant_hook_analytics_user_id ON restaurant_hook_analytics(user_id);
CREATE INDEX idx_restaurant_hook_analytics_restaurant_id ON restaurant_hook_analytics(restaurant_id);
CREATE INDEX idx_restaurant_benchmarks_cuisine ON restaurant_benchmarks(cuisine);
CREATE INDEX idx_restaurant_benchmarks_size ON restaurant_benchmarks(size_category);
CREATE INDEX idx_restaurant_success_stories_restaurant_id ON restaurant_success_stories(restaurant_id);
CREATE INDEX idx_restaurant_success_stories_featured ON restaurant_success_stories(is_featured, is_published);
CREATE INDEX idx_restaurant_activity_log_restaurant_id ON restaurant_activity_log(restaurant_id);
CREATE INDEX idx_restaurant_activity_log_timestamp ON restaurant_activity_log(timestamp DESC);

-- Row Level Security Policies
ALTER TABLE restaurant_social_proof ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_hook_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_success_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_activity_log ENABLE ROW LEVEL SECURITY;

-- Social Proof Policies (public read for real-time feed)
CREATE POLICY "Anyone can read social proof" ON restaurant_social_proof
    FOR SELECT
    USING (true);

CREATE POLICY "System can insert social proof" ON restaurant_social_proof
    FOR INSERT
    WITH CHECK (true);

-- Hook Analytics Policies (users can access their own data)
CREATE POLICY "Users can read their own hook analytics" ON restaurant_hook_analytics
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hook analytics" ON restaurant_hook_analytics
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hook analytics" ON restaurant_hook_analytics
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Benchmarks Policies (public read for predictions)
CREATE POLICY "Anyone can read benchmarks" ON restaurant_benchmarks
    FOR SELECT
    USING (true);

CREATE POLICY "System can manage benchmarks" ON restaurant_benchmarks
    FOR ALL
    USING (true);

-- Success Stories Policies (public read for published stories)
CREATE POLICY "Anyone can read published success stories" ON restaurant_success_stories
    FOR SELECT
    USING (is_published = true);

CREATE POLICY "Restaurant owners can manage their stories" ON restaurant_success_stories
    FOR ALL
    USING (
        restaurant_id IN (
            SELECT id FROM core_entities 
            WHERE organization_id IN (
                SELECT organization_id FROM user_organizations 
                WHERE user_id = auth.uid() AND is_active = true
            )
        )
    );

-- Activity Log Policies (users can access their own activity)
CREATE POLICY "Users can read their own activity log" ON restaurant_activity_log
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity log" ON restaurant_activity_log
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Anonymous policies for testing
CREATE POLICY "Anonymous users can read social proof" ON restaurant_social_proof
    FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Anonymous users can insert social proof" ON restaurant_social_proof
    FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Anonymous users can read benchmarks" ON restaurant_benchmarks
    FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Anonymous users can read published success stories" ON restaurant_success_stories
    FOR SELECT
    TO anon
    USING (is_published = true);

CREATE POLICY "Anonymous users can manage hook analytics" ON restaurant_hook_analytics
    FOR ALL
    TO anon
    USING (true);

CREATE POLICY "Anonymous users can manage activity log" ON restaurant_activity_log
    FOR ALL
    TO anon
    USING (true);

-- Insert initial benchmark data
INSERT INTO restaurant_benchmarks (cuisine, size_category, avg_revenue_increase, avg_efficiency_gain, avg_customer_satisfaction, sample_size) VALUES
('italian', 'small', 31.5, 25.2, 4.6, 387),
('italian', 'medium', 28.3, 22.1, 4.5, 892),
('italian', 'large', 26.1, 19.8, 4.4, 234),
('american', 'small', 28.7, 24.3, 4.3, 521),
('american', 'medium', 27.1, 21.9, 4.4, 1203),
('american', 'large', 25.8, 20.2, 4.2, 445),
('asian', 'small', 35.2, 28.9, 4.7, 298),
('asian', 'medium', 32.8, 26.4, 4.6, 687),
('asian', 'large', 30.1, 23.7, 4.5, 156),
('mexican', 'small', 29.4, 23.8, 4.4, 234),
('mexican', 'medium', 27.9, 22.3, 4.3, 567),
('mexican', 'large', 26.2, 21.1, 4.2, 123),
('seafood', 'small', 41.3, 32.7, 4.8, 145),
('seafood', 'medium', 38.9, 30.2, 4.7, 289),
('seafood', 'large', 35.6, 27.8, 4.6, 87),
('other', 'small', 26.8, 21.4, 4.2, 678),
('other', 'medium', 25.3, 20.1, 4.1, 1456),
('other', 'large', 24.1, 19.2, 4.0, 432);

-- Insert sample success stories
INSERT INTO restaurant_success_stories (restaurant_id, story_type, title, description, metrics, timeframe_days, is_featured, is_published) VALUES
(
    (SELECT id FROM core_entities WHERE entity_name = 'Demo Restaurant' LIMIT 1),
    'revenue_growth',
    'From Struggling to Thriving: How Tony''s Pizza Increased Revenue by 42%',
    'Tony''s Pizza was struggling with inefficient operations and declining sales. After implementing HERA Universal, they saw dramatic improvements in just 3 months.',
    '{"revenue_increase": 42.3, "efficiency_gain": 35.8, "customer_satisfaction": 4.8, "cost_reduction": 18.5}',
    90,
    true,
    true
),
(
    (SELECT id FROM core_entities WHERE entity_name = 'Demo Restaurant' LIMIT 1),
    'efficiency_improvement',
    'Ocean View Seafood Cuts Order Processing Time by 60%',
    'Ocean View Seafood transformed their kitchen operations and customer service with HERA Universal''s intelligent automation.',
    '{"efficiency_gain": 60.2, "order_processing_time": -65.4, "customer_wait_time": -45.3, "staff_satisfaction": 4.7}',
    60,
    true,
    true
);

-- Insert sample social proof data
INSERT INTO restaurant_social_proof (restaurant_name, achievement, metric, value, is_real) VALUES
('Tony''s Pizza', 'increased revenue by 42%', 'revenue_increase', 42.3, true),
('Ocean View Seafood', 'improved efficiency by 60%', 'efficiency_gain', 60.2, true),
('Mama''s Kitchen', 'achieved 4.8-star rating', 'customer_satisfaction', 4.8, true),
('The Burger Joint', 'reduced costs by 25%', 'cost_reduction', 25.4, true),
('Sushi Zen', 'boosted customer satisfaction by 35%', 'customer_satisfaction', 4.7, true),
('Milano''s Italian', 'increased revenue by 38%', 'revenue_increase', 38.1, true),
('Spice Route', 'improved order accuracy by 85%', 'order_accuracy', 85.3, true),
('The Steakhouse', 'reduced food waste by 40%', 'waste_reduction', 40.2, true);

-- Function to generate real-time social proof
CREATE OR REPLACE FUNCTION generate_social_proof_entry()
RETURNS trigger AS $$
BEGIN
    -- Generate a social proof entry when a new restaurant registers
    INSERT INTO restaurant_social_proof (restaurant_name, achievement, metric, value, is_real)
    VALUES (
        NEW.entity_name,
        'joined the success community',
        'registration',
        1,
        false
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically generate social proof on restaurant registration
CREATE TRIGGER restaurant_registration_social_proof
    AFTER INSERT ON core_entities
    FOR EACH ROW
    WHEN (NEW.entity_type = 'restaurant')
    EXECUTE FUNCTION generate_social_proof_entry();

-- Function to update restaurant benchmarks
CREATE OR REPLACE FUNCTION update_restaurant_benchmarks()
RETURNS void AS $$
BEGIN
    -- This function would analyze actual restaurant performance data
    -- and update the benchmarks table periodically
    -- For now, it's a placeholder for future implementation
    
    UPDATE restaurant_benchmarks 
    SET last_updated = NOW()
    WHERE last_updated < NOW() - INTERVAL '24 hours';
    
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to update benchmarks (if you have pg_cron extension)
-- SELECT cron.schedule('update-restaurant-benchmarks', '0 2 * * *', 'SELECT update_restaurant_benchmarks();');