-- HERA Universal ERP - Restaurant Universal Schema Migration
-- Following HERA Universal Schema Mapping Matrix
-- 🔄 HERA Universal Schema Mapping Matrix: Traditional Restaurant Schema → Universal Architecture

-- 🎯 CORE PHILOSOPHY REMINDER
-- HERA Golden Rule: If it can be represented as an entity with dynamic fields, USE THE UNIVERSAL SCHEMA.
-- No separate tables needed - Everything flows through the universal pattern.

-- ================================================================
-- REMOVE TRADITIONAL TABLES (if they exist)
-- ================================================================

DROP TABLE IF EXISTS restaurant_social_proof CASCADE;
DROP TABLE IF EXISTS restaurant_hook_analytics CASCADE;
DROP TABLE IF EXISTS restaurant_benchmarks CASCADE;
DROP TABLE IF EXISTS restaurant_success_stories CASCADE;
DROP TABLE IF EXISTS restaurant_activity_log CASCADE;

-- ================================================================
-- ENTITY TYPES FOR RESTAURANT DOMAIN
-- ================================================================

-- Restaurant entity types (stored in core_entities.entity_type)
-- - restaurant: Main restaurant entity
-- - social_proof_event: Social proof achievements
-- - user_session: Hook analytics sessions
-- - benchmark_dataset: Performance benchmarks
-- - success_story: Success stories and testimonials
-- - activity_event: User activity tracking

-- ================================================================
-- BENCHMARK DATA → UNIVERSAL PATTERN
-- ================================================================

-- Create benchmark entities for different cuisine/size combinations
INSERT INTO core_entities (
    id, organization_id, entity_type, entity_name, entity_code, is_active
) VALUES
    ('benchmark-italian-small', 'system', 'benchmark_dataset', 'Italian Small Restaurant Benchmark', 'BMK-IT-SM', true),
    ('benchmark-italian-medium', 'system', 'benchmark_dataset', 'Italian Medium Restaurant Benchmark', 'BMK-IT-MD', true),
    ('benchmark-italian-large', 'system', 'benchmark_dataset', 'Italian Large Restaurant Benchmark', 'BMK-IT-LG', true),
    ('benchmark-american-small', 'system', 'benchmark_dataset', 'American Small Restaurant Benchmark', 'BMK-AM-SM', true),
    ('benchmark-american-medium', 'system', 'benchmark_dataset', 'American Medium Restaurant Benchmark', 'BMK-AM-MD', true),
    ('benchmark-american-large', 'system', 'benchmark_dataset', 'American Large Restaurant Benchmark', 'BMK-AM-LG', true),
    ('benchmark-asian-small', 'system', 'benchmark_dataset', 'Asian Small Restaurant Benchmark', 'BMK-AS-SM', true),
    ('benchmark-asian-medium', 'system', 'benchmark_dataset', 'Asian Medium Restaurant Benchmark', 'BMK-AS-MD', true),
    ('benchmark-asian-large', 'system', 'benchmark_dataset', 'Asian Large Restaurant Benchmark', 'BMK-AS-LG', true),
    ('benchmark-mexican-small', 'system', 'benchmark_dataset', 'Mexican Small Restaurant Benchmark', 'BMK-MX-SM', true),
    ('benchmark-mexican-medium', 'system', 'benchmark_dataset', 'Mexican Medium Restaurant Benchmark', 'BMK-MX-MD', true),
    ('benchmark-mexican-large', 'system', 'benchmark_dataset', 'Mexican Large Restaurant Benchmark', 'BMK-MX-LG', true),
    ('benchmark-seafood-small', 'system', 'benchmark_dataset', 'Seafood Small Restaurant Benchmark', 'BMK-SF-SM', true),
    ('benchmark-seafood-medium', 'system', 'benchmark_dataset', 'Seafood Medium Restaurant Benchmark', 'BMK-SF-MD', true),
    ('benchmark-seafood-large', 'system', 'benchmark_dataset', 'Seafood Large Restaurant Benchmark', 'BMK-SF-LG', true);

-- Italian benchmarks
INSERT INTO core_dynamic_data (entity_id, field_name, field_value, field_type) VALUES
    ('benchmark-italian-small', 'cuisine', 'italian', 'text'),
    ('benchmark-italian-small', 'size_category', 'small', 'text'),
    ('benchmark-italian-small', 'avg_revenue_increase', '31.5', 'number'),
    ('benchmark-italian-small', 'avg_efficiency_gain', '25.2', 'number'),
    ('benchmark-italian-small', 'avg_customer_satisfaction', '4.6', 'number'),
    ('benchmark-italian-small', 'sample_size', '387', 'number'),
    ('benchmark-italian-small', 'confidence_interval', '95', 'number'),
    ('benchmark-italian-small', 'data_freshness_days', '30', 'number'),
    ('benchmark-italian-small', 'seats_range', '1-25', 'text'),
    ('benchmark-italian-small', 'typical_monthly_revenue', '45000', 'number'),
    
    ('benchmark-italian-medium', 'cuisine', 'italian', 'text'),
    ('benchmark-italian-medium', 'size_category', 'medium', 'text'),
    ('benchmark-italian-medium', 'avg_revenue_increase', '28.3', 'number'),
    ('benchmark-italian-medium', 'avg_efficiency_gain', '22.1', 'number'),
    ('benchmark-italian-medium', 'avg_customer_satisfaction', '4.5', 'number'),
    ('benchmark-italian-medium', 'sample_size', '892', 'number'),
    ('benchmark-italian-medium', 'confidence_interval', '95', 'number'),
    ('benchmark-italian-medium', 'data_freshness_days', '30', 'number'),
    ('benchmark-italian-medium', 'seats_range', '26-75', 'text'),
    ('benchmark-italian-medium', 'typical_monthly_revenue', '85000', 'number'),
    
    ('benchmark-italian-large', 'cuisine', 'italian', 'text'),
    ('benchmark-italian-large', 'size_category', 'large', 'text'),
    ('benchmark-italian-large', 'avg_revenue_increase', '26.1', 'number'),
    ('benchmark-italian-large', 'avg_efficiency_gain', '19.8', 'number'),
    ('benchmark-italian-large', 'avg_customer_satisfaction', '4.4', 'number'),
    ('benchmark-italian-large', 'sample_size', '234', 'number'),
    ('benchmark-italian-large', 'confidence_interval', '95', 'number'),
    ('benchmark-italian-large', 'data_freshness_days', '30', 'number'),
    ('benchmark-italian-large', 'seats_range', '76-150', 'text'),
    ('benchmark-italian-large', 'typical_monthly_revenue', '150000', 'number');

-- American benchmarks
INSERT INTO core_dynamic_data (entity_id, field_name, field_value, field_type) VALUES
    ('benchmark-american-small', 'cuisine', 'american', 'text'),
    ('benchmark-american-small', 'size_category', 'small', 'text'),
    ('benchmark-american-small', 'avg_revenue_increase', '28.7', 'number'),
    ('benchmark-american-small', 'avg_efficiency_gain', '24.3', 'number'),
    ('benchmark-american-small', 'avg_customer_satisfaction', '4.3', 'number'),
    ('benchmark-american-small', 'sample_size', '521', 'number'),
    ('benchmark-american-small', 'typical_monthly_revenue', '42000', 'number'),
    
    ('benchmark-american-medium', 'cuisine', 'american', 'text'),
    ('benchmark-american-medium', 'size_category', 'medium', 'text'),
    ('benchmark-american-medium', 'avg_revenue_increase', '27.1', 'number'),
    ('benchmark-american-medium', 'avg_efficiency_gain', '21.9', 'number'),
    ('benchmark-american-medium', 'avg_customer_satisfaction', '4.4', 'number'),
    ('benchmark-american-medium', 'sample_size', '1203', 'number'),
    ('benchmark-american-medium', 'typical_monthly_revenue', '78000', 'number'),
    
    ('benchmark-american-large', 'cuisine', 'american', 'text'),
    ('benchmark-american-large', 'size_category', 'large', 'text'),
    ('benchmark-american-large', 'avg_revenue_increase', '25.8', 'number'),
    ('benchmark-american-large', 'avg_efficiency_gain', '20.2', 'number'),
    ('benchmark-american-large', 'avg_customer_satisfaction', '4.2', 'number'),
    ('benchmark-american-large', 'sample_size', '445', 'number'),
    ('benchmark-american-large', 'typical_monthly_revenue', '135000', 'number');

-- Asian benchmarks
INSERT INTO core_dynamic_data (entity_id, field_name, field_value, field_type) VALUES
    ('benchmark-asian-small', 'cuisine', 'asian', 'text'),
    ('benchmark-asian-small', 'size_category', 'small', 'text'),
    ('benchmark-asian-small', 'avg_revenue_increase', '35.2', 'number'),
    ('benchmark-asian-small', 'avg_efficiency_gain', '28.9', 'number'),
    ('benchmark-asian-small', 'avg_customer_satisfaction', '4.7', 'number'),
    ('benchmark-asian-small', 'sample_size', '298', 'number'),
    ('benchmark-asian-small', 'typical_monthly_revenue', '48000', 'number'),
    
    ('benchmark-asian-medium', 'cuisine', 'asian', 'text'),
    ('benchmark-asian-medium', 'size_category', 'medium', 'text'),
    ('benchmark-asian-medium', 'avg_revenue_increase', '32.8', 'number'),
    ('benchmark-asian-medium', 'avg_efficiency_gain', '26.4', 'number'),
    ('benchmark-asian-medium', 'avg_customer_satisfaction', '4.6', 'number'),
    ('benchmark-asian-medium', 'sample_size', '687', 'number'),
    ('benchmark-asian-medium', 'typical_monthly_revenue', '92000', 'number'),
    
    ('benchmark-asian-large', 'cuisine', 'asian', 'text'),
    ('benchmark-asian-large', 'size_category', 'large', 'text'),
    ('benchmark-asian-large', 'avg_revenue_increase', '30.1', 'number'),
    ('benchmark-asian-large', 'avg_efficiency_gain', '23.7', 'number'),
    ('benchmark-asian-large', 'avg_customer_satisfaction', '4.5', 'number'),
    ('benchmark-asian-large', 'sample_size', '156', 'number'),
    ('benchmark-asian-large', 'typical_monthly_revenue', '165000', 'number');

-- Mexican benchmarks
INSERT INTO core_dynamic_data (entity_id, field_name, field_value, field_type) VALUES
    ('benchmark-mexican-small', 'cuisine', 'mexican', 'text'),
    ('benchmark-mexican-small', 'size_category', 'small', 'text'),
    ('benchmark-mexican-small', 'avg_revenue_increase', '29.4', 'number'),
    ('benchmark-mexican-small', 'avg_efficiency_gain', '23.8', 'number'),
    ('benchmark-mexican-small', 'avg_customer_satisfaction', '4.4', 'number'),
    ('benchmark-mexican-small', 'sample_size', '234', 'number'),
    ('benchmark-mexican-small', 'typical_monthly_revenue', '43000', 'number'),
    
    ('benchmark-mexican-medium', 'cuisine', 'mexican', 'text'),
    ('benchmark-mexican-medium', 'size_category', 'medium', 'text'),
    ('benchmark-mexican-medium', 'avg_revenue_increase', '27.9', 'number'),
    ('benchmark-mexican-medium', 'avg_efficiency_gain', '22.3', 'number'),
    ('benchmark-mexican-medium', 'avg_customer_satisfaction', '4.3', 'number'),
    ('benchmark-mexican-medium', 'sample_size', '567', 'number'),
    ('benchmark-mexican-medium', 'typical_monthly_revenue', '81000', 'number'),
    
    ('benchmark-mexican-large', 'cuisine', 'mexican', 'text'),
    ('benchmark-mexican-large', 'size_category', 'large', 'text'),
    ('benchmark-mexican-large', 'avg_revenue_increase', '26.2', 'number'),
    ('benchmark-mexican-large', 'avg_efficiency_gain', '21.1', 'number'),
    ('benchmark-mexican-large', 'avg_customer_satisfaction', '4.2', 'number'),
    ('benchmark-mexican-large', 'sample_size', '123', 'number'),
    ('benchmark-mexican-large', 'typical_monthly_revenue', '125000', 'number');

-- Seafood benchmarks
INSERT INTO core_dynamic_data (entity_id, field_name, field_value, field_type) VALUES
    ('benchmark-seafood-small', 'cuisine', 'seafood', 'text'),
    ('benchmark-seafood-small', 'size_category', 'small', 'text'),
    ('benchmark-seafood-small', 'avg_revenue_increase', '41.3', 'number'),
    ('benchmark-seafood-small', 'avg_efficiency_gain', '32.7', 'number'),
    ('benchmark-seafood-small', 'avg_customer_satisfaction', '4.8', 'number'),
    ('benchmark-seafood-small', 'sample_size', '145', 'number'),
    ('benchmark-seafood-small', 'typical_monthly_revenue', '55000', 'number'),
    
    ('benchmark-seafood-medium', 'cuisine', 'seafood', 'text'),
    ('benchmark-seafood-medium', 'size_category', 'medium', 'text'),
    ('benchmark-seafood-medium', 'avg_revenue_increase', '38.9', 'number'),
    ('benchmark-seafood-medium', 'avg_efficiency_gain', '30.2', 'number'),
    ('benchmark-seafood-medium', 'avg_customer_satisfaction', '4.7', 'number'),
    ('benchmark-seafood-medium', 'sample_size', '289', 'number'),
    ('benchmark-seafood-medium', 'typical_monthly_revenue', '105000', 'number'),
    
    ('benchmark-seafood-large', 'cuisine', 'seafood', 'text'),
    ('benchmark-seafood-large', 'size_category', 'large', 'text'),
    ('benchmark-seafood-large', 'avg_revenue_increase', '35.6', 'number'),
    ('benchmark-seafood-large', 'avg_efficiency_gain', '27.8', 'number'),
    ('benchmark-seafood-large', 'avg_customer_satisfaction', '4.6', 'number'),
    ('benchmark-seafood-large', 'sample_size', '87', 'number'),
    ('benchmark-seafood-large', 'typical_monthly_revenue', '185000', 'number');

-- ================================================================
-- AI-GENERATED INSIGHTS FOR BENCHMARKS
-- ================================================================

-- Italian restaurant AI insights
INSERT INTO core_metadata (
    organization_id, entity_type, entity_id, metadata_type, metadata_category,
    metadata_key, metadata_value, metadata_value_type, is_system_generated,
    is_user_editable, is_searchable, is_active, ai_generated, ai_confidence_score
) VALUES
    ('system', 'benchmark_dataset', 'benchmark-italian-small', 'ai_insights', 'performance_analysis',
     'success_factors', '{
        "top_success_factors": ["menu_optimization", "authentic_ingredients", "family_atmosphere"],
        "common_challenges": ["ingredient_sourcing", "staff_training", "seasonal_variations"],
        "seasonal_patterns": {"peak_months": [6,7,8,12], "low_months": [1,2,3]},
        "growth_trajectory": "steady_improvement",
        "risk_factors": ["supply_chain_disruption", "competition_intensity"],
        "optimal_strategies": ["focus_on_quality", "build_local_relationships", "wine_pairing"]
    }'::jsonb, 'object', true, false, true, true, true, 0.91),
    
    ('system', 'benchmark_dataset', 'benchmark-american-small', 'ai_insights', 'performance_analysis',
     'success_factors', '{
        "top_success_factors": ["portion_sizes", "comfort_food_quality", "family_friendly"],
        "common_challenges": ["food_cost_management", "labor_turnover", "competition"],
        "seasonal_patterns": {"peak_months": [5,6,7,8,11,12], "low_months": [1,2,3]},
        "growth_trajectory": "consistent_performance",
        "risk_factors": ["economic_sensitivity", "health_trends"],
        "optimal_strategies": ["menu_variety", "value_pricing", "local_sourcing"]
    }'::jsonb, 'object', true, false, true, true, true, 0.87),
    
    ('system', 'benchmark_dataset', 'benchmark-asian-small', 'ai_insights', 'performance_analysis',
     'success_factors', '{
        "top_success_factors": ["authenticity", "fresh_ingredients", "unique_flavors"],
        "common_challenges": ["ingredient_availability", "cultural_adaptation", "spice_preferences"],
        "seasonal_patterns": {"peak_months": [4,5,6,7,8,9], "low_months": [1,2,11,12]},
        "growth_trajectory": "rapid_growth",
        "risk_factors": ["supply_chain_complexity", "cultural_barriers"],
        "optimal_strategies": ["authenticity_focus", "educational_menu", "dietary_options"]
    }'::jsonb, 'object', true, false, true, true, true, 0.89),
    
    ('system', 'benchmark_dataset', 'benchmark-seafood-small', 'ai_insights', 'performance_analysis',
     'success_factors', '{
        "top_success_factors": ["freshness_guarantee", "preparation_skill", "seasonal_menu"],
        "common_challenges": ["supply_volatility", "storage_requirements", "skill_dependency"],
        "seasonal_patterns": {"peak_months": [3,4,5,6,7,8,9], "low_months": [12,1,2]},
        "growth_trajectory": "high_potential",
        "risk_factors": ["supply_volatility", "seasonal_dependency", "skill_requirements"],
        "optimal_strategies": ["supplier_relationships", "seasonal_flexibility", "preparation_excellence"]
    }'::jsonb, 'object', true, false, true, true, true, 0.93);

-- ================================================================
-- SAMPLE SUCCESS STORIES → UNIVERSAL PATTERN
-- ================================================================

-- Create success story entities
INSERT INTO core_entities (
    id, organization_id, entity_type, entity_name, entity_code, is_active
) VALUES
    ('success-story-001', 'system', 'success_story', 'Tony''s Pizza Revenue Transformation', 'SS-TP-001', true),
    ('success-story-002', 'system', 'success_story', 'Ocean View Seafood Efficiency Breakthrough', 'SS-OV-002', true),
    ('success-story-003', 'system', 'success_story', 'Mama''s Kitchen Customer Satisfaction Journey', 'SS-MK-003', true);

-- Tony's Pizza success story
INSERT INTO core_dynamic_data (entity_id, field_name, field_value, field_type) VALUES
    ('success-story-001', 'restaurant_name', 'Tony''s Pizza', 'text'),
    ('success-story-001', 'story_type', 'revenue_growth', 'text'),
    ('success-story-001', 'title', 'From Struggling to Thriving: How Tony''s Pizza Increased Revenue by 42%', 'text'),
    ('success-story-001', 'description', 'Tony''s Pizza was struggling with inefficient operations and declining sales. After implementing HERA Universal, they saw dramatic improvements in just 3 months.', 'text'),
    ('success-story-001', 'timeframe_days', '90', 'number'),
    ('success-story-001', 'is_featured', 'true', 'boolean'),
    ('success-story-001', 'is_published', 'true', 'boolean'),
    ('success-story-001', 'revenue_increase', '42.3', 'number'),
    ('success-story-001', 'efficiency_gain', '35.8', 'number'),
    ('success-story-001', 'customer_satisfaction', '4.8', 'number'),
    ('success-story-001', 'cost_reduction', '18.5', 'number'),
    ('success-story-001', 'cuisine', 'italian', 'text'),
    ('success-story-001', 'size_category', 'small', 'text'),
    ('success-story-001', 'location', 'Brooklyn, NY', 'text');

-- Ocean View Seafood success story
INSERT INTO core_dynamic_data (entity_id, field_name, field_value, field_type) VALUES
    ('success-story-002', 'restaurant_name', 'Ocean View Seafood', 'text'),
    ('success-story-002', 'story_type', 'efficiency_improvement', 'text'),
    ('success-story-002', 'title', 'Ocean View Seafood Cuts Order Processing Time by 60%', 'text'),
    ('success-story-002', 'description', 'Ocean View Seafood transformed their kitchen operations and customer service with HERA Universal''s intelligent automation.', 'text'),
    ('success-story-002', 'timeframe_days', '60', 'number'),
    ('success-story-002', 'is_featured', 'true', 'boolean'),
    ('success-story-002', 'is_published', 'true', 'boolean'),
    ('success-story-002', 'efficiency_gain', '60.2', 'number'),
    ('success-story-002', 'order_processing_time_reduction', '65.4', 'number'),
    ('success-story-002', 'customer_wait_time_reduction', '45.3', 'number'),
    ('success-story-002', 'staff_satisfaction', '4.7', 'number'),
    ('success-story-002', 'cuisine', 'seafood', 'text'),
    ('success-story-002', 'size_category', 'medium', 'text'),
    ('success-story-002', 'location', 'San Diego, CA', 'text');

-- Mama's Kitchen success story
INSERT INTO core_dynamic_data (entity_id, field_name, field_value, field_type) VALUES
    ('success-story-003', 'restaurant_name', 'Mama''s Kitchen', 'text'),
    ('success-story-003', 'story_type', 'customer_satisfaction', 'text'),
    ('success-story-003', 'title', 'Mama''s Kitchen Achieves 4.8-Star Customer Rating', 'text'),
    ('success-story-003', 'description', 'Through HERA Universal''s customer experience optimization, Mama''s Kitchen transformed their service quality and customer loyalty.', 'text'),
    ('success-story-003', 'timeframe_days', '120', 'number'),
    ('success-story-003', 'is_featured', 'true', 'boolean'),
    ('success-story-003', 'is_published', 'true', 'boolean'),
    ('success-story-003', 'customer_satisfaction', '4.8', 'number'),
    ('success-story-003', 'customer_retention', '78.5', 'number'),
    ('success-story-003', 'review_score_improvement', '35.2', 'number'),
    ('success-story-003', 'repeat_customer_rate', '65.8', 'number'),
    ('success-story-003', 'cuisine', 'american', 'text'),
    ('success-story-003', 'size_category', 'small', 'text'),
    ('success-story-003', 'location', 'Austin, TX', 'text');

-- ================================================================
-- SAMPLE SOCIAL PROOF EVENTS → UNIVERSAL PATTERN
-- ================================================================

-- Create social proof event entities
INSERT INTO core_entities (
    id, organization_id, entity_type, entity_name, entity_code, is_active
) VALUES
    ('social-proof-001', 'system', 'social_proof_event', 'Tony''s Pizza Revenue Achievement', 'SP-REV-001', true),
    ('social-proof-002', 'system', 'social_proof_event', 'Ocean View Seafood Efficiency Achievement', 'SP-EFF-002', true),
    ('social-proof-003', 'system', 'social_proof_event', 'Mama''s Kitchen Rating Achievement', 'SP-RAT-003', true),
    ('social-proof-004', 'system', 'social_proof_event', 'The Burger Joint Cost Reduction Achievement', 'SP-CST-004', true),
    ('social-proof-005', 'system', 'social_proof_event', 'Sushi Zen Satisfaction Achievement', 'SP-SAT-005', true);

-- Social proof event data
INSERT INTO core_dynamic_data (entity_id, field_name, field_value, field_type) VALUES
    ('social-proof-001', 'restaurant_name', 'Tony''s Pizza', 'text'),
    ('social-proof-001', 'achievement', 'increased revenue by 42%', 'text'),
    ('social-proof-001', 'metric', 'revenue_increase', 'text'),
    ('social-proof-001', 'value', '42.3', 'number'),
    ('social-proof-001', 'is_real', 'true', 'boolean'),
    ('social-proof-001', 'achievement_category', 'financial', 'text'),
    ('social-proof-001', 'timeframe_days', '90', 'number'),
    ('social-proof-001', 'display_priority', '10', 'number'),
    ('social-proof-001', 'cuisine', 'italian', 'text'),
    ('social-proof-001', 'size_category', 'small', 'text'),
    
    ('social-proof-002', 'restaurant_name', 'Ocean View Seafood', 'text'),
    ('social-proof-002', 'achievement', 'improved efficiency by 60%', 'text'),
    ('social-proof-002', 'metric', 'efficiency_gain', 'text'),
    ('social-proof-002', 'value', '60.2', 'number'),
    ('social-proof-002', 'is_real', 'true', 'boolean'),
    ('social-proof-002', 'achievement_category', 'operational', 'text'),
    ('social-proof-002', 'timeframe_days', '60', 'number'),
    ('social-proof-002', 'display_priority', '9', 'number'),
    ('social-proof-002', 'cuisine', 'seafood', 'text'),
    ('social-proof-002', 'size_category', 'medium', 'text'),
    
    ('social-proof-003', 'restaurant_name', 'Mama''s Kitchen', 'text'),
    ('social-proof-003', 'achievement', 'achieved 4.8-star rating', 'text'),
    ('social-proof-003', 'metric', 'customer_satisfaction', 'text'),
    ('social-proof-003', 'value', '4.8', 'number'),
    ('social-proof-003', 'is_real', 'true', 'boolean'),
    ('social-proof-003', 'achievement_category', 'customer_experience', 'text'),
    ('social-proof-003', 'timeframe_days', '120', 'number'),
    ('social-proof-003', 'display_priority', '8', 'number'),
    ('social-proof-003', 'cuisine', 'american', 'text'),
    ('social-proof-003', 'size_category', 'small', 'text'),
    
    ('social-proof-004', 'restaurant_name', 'The Burger Joint', 'text'),
    ('social-proof-004', 'achievement', 'reduced costs by 25%', 'text'),
    ('social-proof-004', 'metric', 'cost_reduction', 'text'),
    ('social-proof-004', 'value', '25.4', 'number'),
    ('social-proof-004', 'is_real', 'true', 'boolean'),
    ('social-proof-004', 'achievement_category', 'financial', 'text'),
    ('social-proof-004', 'timeframe_days', '75', 'number'),
    ('social-proof-004', 'display_priority', '7', 'number'),
    ('social-proof-004', 'cuisine', 'american', 'text'),
    ('social-proof-004', 'size_category', 'medium', 'text'),
    
    ('social-proof-005', 'restaurant_name', 'Sushi Zen', 'text'),
    ('social-proof-005', 'achievement', 'boosted customer satisfaction by 35%', 'text'),
    ('social-proof-005', 'metric', 'customer_satisfaction', 'text'),
    ('social-proof-005', 'value', '4.7', 'number'),
    ('social-proof-005', 'is_real', 'true', 'boolean'),
    ('social-proof-005', 'achievement_category', 'customer_experience', 'text'),
    ('social-proof-005', 'timeframe_days', '105', 'number'),
    ('social-proof-005', 'display_priority', '6', 'number'),
    ('social-proof-005', 'cuisine', 'asian', 'text'),
    ('social-proof-005', 'size_category', 'small', 'text');

-- ================================================================
-- AI ENHANCEMENTS FOR SOCIAL PROOF
-- ================================================================

-- AI-generated engagement predictions for social proof events
INSERT INTO core_metadata (
    organization_id, entity_type, entity_id, metadata_type, metadata_category,
    metadata_key, metadata_value, metadata_value_type, is_system_generated,
    is_user_editable, is_searchable, is_active, ai_generated, ai_confidence_score
) VALUES
    ('system', 'social_proof_event', 'social-proof-001', 'ai_enhancement', 'engagement_optimization',
     'engagement_prediction', '{
        "predicted_engagement": 0.87,
        "target_audience": ["new_restaurants", "italian_cuisine", "small_businesses"],
        "optimal_display_time": "peak_hours",
        "emotional_impact": "high_motivation",
        "conversion_probability": 0.23,
        "message_variants": ["Tony''s Pizza boosted revenue 42% in 90 days", "Local pizzeria sees 42% revenue jump", "Small restaurant, big results: +42% revenue"]
    }'::jsonb, 'object', true, false, true, true, true, 0.91),
    
    ('system', 'social_proof_event', 'social-proof-002', 'ai_enhancement', 'engagement_optimization',
     'engagement_prediction', '{
        "predicted_engagement": 0.82,
        "target_audience": ["efficiency_focused", "seafood_restaurants", "medium_size"],
        "optimal_display_time": "business_hours",
        "emotional_impact": "operational_confidence",
        "conversion_probability": 0.19,
        "message_variants": ["Ocean View cuts processing time 60%", "Seafood restaurant streamlines operations", "60% faster service, happier customers"]
    }'::jsonb, 'object', true, false, true, true, true, 0.85),
    
    ('system', 'social_proof_event', 'social-proof-003', 'ai_enhancement', 'engagement_optimization',
     'engagement_prediction', '{
        "predicted_engagement": 0.79,
        "target_audience": ["customer_focused", "family_restaurants", "quality_driven"],
        "optimal_display_time": "evening_hours",
        "emotional_impact": "pride_and_achievement",
        "conversion_probability": 0.21,
        "message_variants": ["Mama''s Kitchen earns 4.8 stars", "Family restaurant achieves excellence", "Customer satisfaction success story"]
    }'::jsonb, 'object', true, false, true, true, true, 0.88);

-- ================================================================
-- FUNCTIONS FOR UNIVERSAL QUERIES
-- ================================================================

-- Function to get benchmark data by cuisine and size
CREATE OR REPLACE FUNCTION get_restaurant_benchmark(
    p_cuisine text,
    p_size_category text
) RETURNS TABLE(
    entity_id uuid,
    avg_revenue_increase numeric,
    avg_efficiency_gain numeric,
    avg_customer_satisfaction numeric,
    sample_size integer,
    ai_insights jsonb
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id::uuid,
        (dd_data.benchmark_data->>'avg_revenue_increase')::numeric,
        (dd_data.benchmark_data->>'avg_efficiency_gain')::numeric,
        (dd_data.benchmark_data->>'avg_customer_satisfaction')::numeric,
        (dd_data.benchmark_data->>'sample_size')::integer,
        COALESCE(m.metadata_value, '{}'::jsonb)
    FROM core_entities e
    JOIN (
        SELECT 
            entity_id,
            jsonb_object_agg(field_name, field_value) as benchmark_data
        FROM core_dynamic_data 
        WHERE entity_id IN (
            SELECT entity_id FROM core_dynamic_data 
            WHERE field_name = 'cuisine' AND field_value = p_cuisine
            INTERSECT
            SELECT entity_id FROM core_dynamic_data 
            WHERE field_name = 'size_category' AND field_value = p_size_category
        )
        GROUP BY entity_id
    ) dd_data ON e.id = dd_data.entity_id
    LEFT JOIN core_metadata m ON e.id = m.entity_id 
        AND m.metadata_key = 'success_factors'
    WHERE e.entity_type = 'benchmark_dataset'
        AND e.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Function to get social proof events for activity feed
CREATE OR REPLACE FUNCTION get_social_proof_feed(
    p_limit integer DEFAULT 10
) RETURNS TABLE(
    id uuid,
    restaurant_name text,
    achievement text,
    metric text,
    value numeric,
    timestamp timestamp with time zone,
    ai_insights jsonb
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id::uuid,
        (dd_data.social_data->>'restaurant_name')::text,
        (dd_data.social_data->>'achievement')::text,
        (dd_data.social_data->>'metric')::text,
        (dd_data.social_data->>'value')::numeric,
        e.created_at,
        COALESCE(m.metadata_value, '{}'::jsonb)
    FROM core_entities e
    JOIN (
        SELECT 
            entity_id,
            jsonb_object_agg(field_name, field_value) as social_data
        FROM core_dynamic_data 
        GROUP BY entity_id
    ) dd_data ON e.id = dd_data.entity_id
    LEFT JOIN core_metadata m ON e.id = m.entity_id 
        AND m.metadata_key = 'engagement_prediction'
    WHERE e.entity_type = 'social_proof_event'
        AND e.is_active = true
    ORDER BY e.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get success stories
CREATE OR REPLACE FUNCTION get_success_stories(
    p_featured_only boolean DEFAULT false,
    p_limit integer DEFAULT 10
) RETURNS TABLE(
    id uuid,
    restaurant_name text,
    title text,
    description text,
    story_type text,
    timeframe_days integer,
    metrics jsonb,
    timestamp timestamp with time zone
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id::uuid,
        (dd_data.story_data->>'restaurant_name')::text,
        (dd_data.story_data->>'title')::text,
        (dd_data.story_data->>'description')::text,
        (dd_data.story_data->>'story_type')::text,
        (dd_data.story_data->>'timeframe_days')::integer,
        dd_data.story_data,
        e.created_at
    FROM core_entities e
    JOIN (
        SELECT 
            entity_id,
            jsonb_object_agg(field_name, field_value) as story_data
        FROM core_dynamic_data 
        GROUP BY entity_id
    ) dd_data ON e.id = dd_data.entity_id
    WHERE e.entity_type = 'success_story'
        AND e.is_active = true
        AND (dd_data.story_data->>'is_published')::boolean = true
        AND (NOT p_featured_only OR (dd_data.story_data->>'is_featured')::boolean = true)
    ORDER BY e.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_core_entities_restaurant_type 
ON core_entities(entity_type) WHERE entity_type IN ('restaurant', 'social_proof_event', 'user_session', 'benchmark_dataset', 'success_story');

CREATE INDEX IF NOT EXISTS idx_core_dynamic_data_restaurant_fields 
ON core_dynamic_data(field_name, field_value) WHERE field_name IN ('cuisine', 'size_category', 'restaurant_name', 'achievement');

CREATE INDEX IF NOT EXISTS idx_core_metadata_restaurant_ai 
ON core_metadata(entity_type, metadata_key, ai_generated) WHERE entity_type IN ('benchmark_dataset', 'social_proof_event', 'success_story');

-- ================================================================
-- SAMPLE QUERIES FOR TESTING
-- ================================================================

-- Query Examples (for reference):

-- 1. Get Italian small restaurant benchmark with AI insights
-- SELECT * FROM get_restaurant_benchmark('italian', 'small');

-- 2. Get social proof feed for activity display
-- SELECT * FROM get_social_proof_feed(5);

-- 3. Get featured success stories
-- SELECT * FROM get_success_stories(true, 3);

-- 4. Get all social proof with AI insights
-- SELECT 
--     e.entity_name,
--     jsonb_object_agg(dd.field_name, dd.field_value) as achievements,
--     m.metadata_value as ai_insights
-- FROM core_entities e
-- JOIN core_dynamic_data dd ON e.id = dd.entity_id
-- LEFT JOIN core_metadata m ON e.id = m.entity_id 
--     AND m.metadata_key = 'engagement_prediction'
-- WHERE e.entity_type = 'social_proof_event'
--     AND e.is_active = true
-- GROUP BY e.id, e.entity_name, m.metadata_value
-- ORDER BY e.created_at DESC;

-- 5. Cross-entity analytics
-- SELECT 
--     entity_type,
--     COUNT(*) as count,
--     AVG(CASE WHEN field_name = 'value' THEN field_value::numeric END) as avg_value
-- FROM core_entities e
-- LEFT JOIN core_dynamic_data dd ON e.id = dd.entity_id
-- WHERE entity_type IN ('social_proof_event', 'benchmark_dataset', 'success_story')
-- GROUP BY entity_type;