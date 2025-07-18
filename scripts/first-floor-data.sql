-- First Floor Restaurant - Dummy Data for HERA Universal Schema
-- This script creates the complete data set for the First Floor Indian multi-cuisine restaurant

-- 1. Restaurant Organization
INSERT INTO core_organizations (id, name, type, status, metadata, created_at, updated_at) 
VALUES (
  'first-floor-restaurant',
  'First Floor',
  'restaurant',
  'active',
  '{"cuisine_type": "Indian Multi-Cuisine", "location": "Downtown", "capacity": 50, "rating": 4.5}',
  NOW(),
  NOW()
);

-- 2. Menu Items as Entities with Dynamic Data
-- 2.1 Appetizers
INSERT INTO core_entities (id, organization_id, entity_type, name, status, metadata, created_at, updated_at)
VALUES 
  ('menu-paneer-tikka', 'first-floor-restaurant', 'menu_item', 'Paneer Tikka', 'active', '{"category": "appetizer"}', NOW(), NOW()),
  ('menu-chicken-65', 'first-floor-restaurant', 'menu_item', 'Chicken 65', 'active', '{"category": "appetizer"}', NOW(), NOW()),
  ('menu-veg-samosa', 'first-floor-restaurant', 'menu_item', 'Vegetable Samosa', 'active', '{"category": "appetizer"}', NOW(), NOW()),
  ('menu-fish-tikka', 'first-floor-restaurant', 'menu_item', 'Fish Tikka', 'active', '{"category": "appetizer"}', NOW(), NOW()),
  ('menu-mutton-seekh', 'first-floor-restaurant', 'menu_item', 'Mutton Seekh Kebab', 'active', '{"category": "appetizer"}', NOW(), NOW());

-- 2.2 Soups
INSERT INTO core_entities (id, organization_id, entity_type, name, status, metadata, created_at, updated_at)
VALUES 
  ('menu-tomato-soup', 'first-floor-restaurant', 'menu_item', 'Tomato Soup', 'active', '{"category": "soup"}', NOW(), NOW()),
  ('menu-corn-soup', 'first-floor-restaurant', 'menu_item', 'Sweet Corn Soup', 'active', '{"category": "soup"}', NOW(), NOW());

-- 2.3 Main Courses
INSERT INTO core_entities (id, organization_id, entity_type, name, status, metadata, created_at, updated_at)
VALUES 
  ('menu-butter-chicken', 'first-floor-restaurant', 'menu_item', 'Butter Chicken', 'active', '{"category": "main_course"}', NOW(), NOW()),
  ('menu-palak-paneer', 'first-floor-restaurant', 'menu_item', 'Palak Paneer', 'active', '{"category": "main_course"}', NOW(), NOW()),
  ('menu-dal-makhani', 'first-floor-restaurant', 'menu_item', 'Dal Makhani', 'active', '{"category": "main_course"}', NOW(), NOW()),
  ('menu-fish-curry', 'first-floor-restaurant', 'menu_item', 'Fish Curry', 'active', '{"category": "main_course"}', NOW(), NOW()),
  ('menu-mutton-curry', 'first-floor-restaurant', 'menu_item', 'Mutton Curry', 'active', '{"category": "main_course"}', NOW(), NOW()),
  ('menu-chicken-curry', 'first-floor-restaurant', 'menu_item', 'Chicken Curry', 'active', '{"category": "main_course"}', NOW(), NOW());

-- 2.4 Rice
INSERT INTO core_entities (id, organization_id, entity_type, name, status, metadata, created_at, updated_at)
VALUES 
  ('menu-veg-biryani', 'first-floor-restaurant', 'menu_item', 'Vegetable Biryani', 'active', '{"category": "rice"}', NOW(), NOW()),
  ('menu-chicken-biryani', 'first-floor-restaurant', 'menu_item', 'Chicken Biryani', 'active', '{"category": "rice"}', NOW(), NOW()),
  ('menu-mutton-biryani', 'first-floor-restaurant', 'menu_item', 'Mutton Biryani', 'active', '{"category": "rice"}', NOW(), NOW());

-- 2.5 Breads
INSERT INTO core_entities (id, organization_id, entity_type, name, status, metadata, created_at, updated_at)
VALUES 
  ('menu-garlic-naan', 'first-floor-restaurant', 'menu_item', 'Garlic Naan', 'active', '{"category": "bread"}', NOW(), NOW()),
  ('menu-tandoori-roti', 'first-floor-restaurant', 'menu_item', 'Tandoori Roti', 'active', '{"category": "bread"}', NOW(), NOW());

-- 2.6 Desserts
INSERT INTO core_entities (id, organization_id, entity_type, name, status, metadata, created_at, updated_at)
VALUES 
  ('menu-gulab-jamun', 'first-floor-restaurant', 'menu_item', 'Gulab Jamun', 'active', '{"category": "dessert"}', NOW(), NOW()),
  ('menu-kulfi', 'first-floor-restaurant', 'menu_item', 'Kulfi', 'active', '{"category": "dessert"}', NOW(), NOW());

-- 2.7 Beverages
INSERT INTO core_entities (id, organization_id, entity_type, name, status, metadata, created_at, updated_at)
VALUES 
  ('menu-mango-lassi', 'first-floor-restaurant', 'menu_item', 'Mango Lassi', 'active', '{"category": "beverage"}', NOW(), NOW()),
  ('menu-masala-chai', 'first-floor-restaurant', 'menu_item', 'Masala Chai', 'active', '{"category": "beverage"}', NOW(), NOW());

-- 3. Dynamic Data for Menu Items (Prices, Descriptions, etc.)
INSERT INTO core_dynamic_data (entity_id, field_name, field_value, field_type, created_at, updated_at)
VALUES 
  -- Paneer Tikka
  ('menu-paneer-tikka', 'description', 'Grilled cottage cheese cubes marinated in spices and yogurt', 'text', NOW(), NOW()),
  ('menu-paneer-tikka', 'price', '8.99', 'currency', NOW(), NOW()),
  ('menu-paneer-tikka', 'preparation_time', '15', 'number', NOW(), NOW()),
  ('menu-paneer-tikka', 'dietary_options', '["vegetarian", "gluten_free"]', 'array', NOW(), NOW()),
  ('menu-paneer-tikka', 'allergens', '["dairy"]', 'array', NOW(), NOW()),
  ('menu-paneer-tikka', 'spice_level', '2', 'number', NOW(), NOW()),
  ('menu-paneer-tikka', 'popularity_score', '0.9', 'number', NOW(), NOW()),
  ('menu-paneer-tikka', 'ai_recommended', 'true', 'boolean', NOW(), NOW()),
  ('menu-paneer-tikka', 'ingredients', '["paneer", "yogurt", "spices", "bell peppers", "onions"]', 'array', NOW(), NOW()),
  ('menu-paneer-tikka', 'availability', 'true', 'boolean', NOW(), NOW()),
  
  -- Chicken 65
  ('menu-chicken-65', 'description', 'Deep-fried spicy chicken appetizer from South India', 'text', NOW(), NOW()),
  ('menu-chicken-65', 'price', '9.99', 'currency', NOW(), NOW()),
  ('menu-chicken-65', 'preparation_time', '20', 'number', NOW(), NOW()),
  ('menu-chicken-65', 'dietary_options', '["gluten_free"]', 'array', NOW(), NOW()),
  ('menu-chicken-65', 'allergens', '[]', 'array', NOW(), NOW()),
  ('menu-chicken-65', 'spice_level', '4', 'number', NOW(), NOW()),
  ('menu-chicken-65', 'popularity_score', '0.95', 'number', NOW(), NOW()),
  ('menu-chicken-65', 'ai_recommended', 'true', 'boolean', NOW(), NOW()),
  ('menu-chicken-65', 'ingredients', '["chicken", "curry leaves", "ginger", "garlic", "red chilli"]', 'array', NOW(), NOW()),
  ('menu-chicken-65', 'availability', 'true', 'boolean', NOW(), NOW()),
  
  -- Vegetable Samosa
  ('menu-veg-samosa', 'description', 'Crispy pastry filled with spiced vegetables', 'text', NOW(), NOW()),
  ('menu-veg-samosa', 'price', '5.99', 'currency', NOW(), NOW()),
  ('menu-veg-samosa', 'preparation_time', '10', 'number', NOW(), NOW()),
  ('menu-veg-samosa', 'dietary_options', '["vegetarian", "vegan"]', 'array', NOW(), NOW()),
  ('menu-veg-samosa', 'allergens', '["gluten"]', 'array', NOW(), NOW()),
  ('menu-veg-samosa', 'spice_level', '2', 'number', NOW(), NOW()),
  ('menu-veg-samosa', 'popularity_score', '0.85', 'number', NOW(), NOW()),
  ('menu-veg-samosa', 'ai_recommended', 'false', 'boolean', NOW(), NOW()),
  ('menu-veg-samosa', 'ingredients', '["flour", "potatoes", "peas", "spices"]', 'array', NOW(), NOW()),
  ('menu-veg-samosa', 'availability', 'true', 'boolean', NOW(), NOW()),
  
  -- Fish Tikka
  ('menu-fish-tikka', 'description', 'Grilled fish marinated in yogurt and spices', 'text', NOW(), NOW()),
  ('menu-fish-tikka', 'price', '10.99', 'currency', NOW(), NOW()),
  ('menu-fish-tikka', 'preparation_time', '18', 'number', NOW(), NOW()),
  ('menu-fish-tikka', 'dietary_options', '["gluten_free", "dairy_free"]', 'array', NOW(), NOW()),
  ('menu-fish-tikka', 'allergens', '["fish"]', 'array', NOW(), NOW()),
  ('menu-fish-tikka', 'spice_level', '3', 'number', NOW(), NOW()),
  ('menu-fish-tikka', 'popularity_score', '0.8', 'number', NOW(), NOW()),
  ('menu-fish-tikka', 'ai_recommended', 'false', 'boolean', NOW(), NOW()),
  ('menu-fish-tikka', 'ingredients', '["fish", "yogurt", "spices", "lemon"]', 'array', NOW(), NOW()),
  ('menu-fish-tikka', 'availability', 'true', 'boolean', NOW(), NOW()),
  
  -- Mutton Seekh Kebab
  ('menu-mutton-seekh', 'description', 'Spiced minced mutton grilled on skewers', 'text', NOW(), NOW()),
  ('menu-mutton-seekh', 'price', '12.99', 'currency', NOW(), NOW()),
  ('menu-mutton-seekh', 'preparation_time', '25', 'number', NOW(), NOW()),
  ('menu-mutton-seekh', 'dietary_options', '["gluten_free"]', 'array', NOW(), NOW()),
  ('menu-mutton-seekh', 'allergens', '[]', 'array', NOW(), NOW()),
  ('menu-mutton-seekh', 'spice_level', '3', 'number', NOW(), NOW()),
  ('menu-mutton-seekh', 'popularity_score', '0.75', 'number', NOW(), NOW()),
  ('menu-mutton-seekh', 'ai_recommended', 'false', 'boolean', NOW(), NOW()),
  ('menu-mutton-seekh', 'ingredients', '["mutton", "spices", "herbs", "onions"]', 'array', NOW(), NOW()),
  ('menu-mutton-seekh', 'availability', 'true', 'boolean', NOW(), NOW()),
  
  -- Tomato Soup
  ('menu-tomato-soup', 'description', 'Fresh tomato soup with herbs and cream', 'text', NOW(), NOW()),
  ('menu-tomato-soup', 'price', '6.99', 'currency', NOW(), NOW()),
  ('menu-tomato-soup', 'preparation_time', '8', 'number', NOW(), NOW()),
  ('menu-tomato-soup', 'dietary_options', '["vegetarian"]', 'array', NOW(), NOW()),
  ('menu-tomato-soup', 'allergens', '["dairy"]', 'array', NOW(), NOW()),
  ('menu-tomato-soup', 'spice_level', '0', 'number', NOW(), NOW()),
  ('menu-tomato-soup', 'popularity_score', '0.8', 'number', NOW(), NOW()),
  ('menu-tomato-soup', 'ai_recommended', 'false', 'boolean', NOW(), NOW()),
  ('menu-tomato-soup', 'ingredients', '["tomatoes", "cream", "herbs", "garlic"]', 'array', NOW(), NOW()),
  ('menu-tomato-soup', 'availability', 'true', 'boolean', NOW(), NOW()),
  
  -- Sweet Corn Soup
  ('menu-corn-soup', 'description', 'Creamy corn soup with vegetables', 'text', NOW(), NOW()),
  ('menu-corn-soup', 'price', '7.99', 'currency', NOW(), NOW()),
  ('menu-corn-soup', 'preparation_time', '10', 'number', NOW(), NOW()),
  ('menu-corn-soup', 'dietary_options', '["vegetarian"]', 'array', NOW(), NOW()),
  ('menu-corn-soup', 'allergens', '[]', 'array', NOW(), NOW()),
  ('menu-corn-soup', 'spice_level', '0', 'number', NOW(), NOW()),
  ('menu-corn-soup', 'popularity_score', '0.75', 'number', NOW(), NOW()),
  ('menu-corn-soup', 'ai_recommended', 'false', 'boolean', NOW(), NOW()),
  ('menu-corn-soup', 'ingredients', '["sweet corn", "vegetables", "cornstarch"]', 'array', NOW(), NOW()),
  ('menu-corn-soup', 'availability', 'true', 'boolean', NOW(), NOW()),
  
  -- Butter Chicken
  ('menu-butter-chicken', 'description', 'Tender chicken in creamy tomato sauce', 'text', NOW(), NOW()),
  ('menu-butter-chicken', 'price', '16.99', 'currency', NOW(), NOW()),
  ('menu-butter-chicken', 'preparation_time', '25', 'number', NOW(), NOW()),
  ('menu-butter-chicken', 'dietary_options', '["gluten_free"]', 'array', NOW(), NOW()),
  ('menu-butter-chicken', 'allergens', '["dairy", "nuts"]', 'array', NOW(), NOW()),
  ('menu-butter-chicken', 'spice_level', '1', 'number', NOW(), NOW()),
  ('menu-butter-chicken', 'popularity_score', '0.95', 'number', NOW(), NOW()),
  ('menu-butter-chicken', 'ai_recommended', 'true', 'boolean', NOW(), NOW()),
  ('menu-butter-chicken', 'ingredients', '["chicken", "tomato sauce", "cream", "butter", "spices"]', 'array', NOW(), NOW()),
  ('menu-butter-chicken', 'availability', 'true', 'boolean', NOW(), NOW()),
  
  -- Palak Paneer
  ('menu-palak-paneer', 'description', 'Cottage cheese cubes in spinach gravy', 'text', NOW(), NOW()),
  ('menu-palak-paneer', 'price', '14.99', 'currency', NOW(), NOW()),
  ('menu-palak-paneer', 'preparation_time', '20', 'number', NOW(), NOW()),
  ('menu-palak-paneer', 'dietary_options', '["vegetarian", "gluten_free"]', 'array', NOW(), NOW()),
  ('menu-palak-paneer', 'allergens', '["dairy"]', 'array', NOW(), NOW()),
  ('menu-palak-paneer', 'spice_level', '1', 'number', NOW(), NOW()),
  ('menu-palak-paneer', 'popularity_score', '0.9', 'number', NOW(), NOW()),
  ('menu-palak-paneer', 'ai_recommended', 'true', 'boolean', NOW(), NOW()),
  ('menu-palak-paneer', 'ingredients', '["paneer", "spinach", "cream", "spices"]', 'array', NOW(), NOW()),
  ('menu-palak-paneer', 'availability', 'true', 'boolean', NOW(), NOW()),
  
  -- Dal Makhani
  ('menu-dal-makhani', 'description', 'Creamy black lentils slow-cooked overnight', 'text', NOW(), NOW()),
  ('menu-dal-makhani', 'price', '12.99', 'currency', NOW(), NOW()),
  ('menu-dal-makhani', 'preparation_time', '30', 'number', NOW(), NOW()),
  ('menu-dal-makhani', 'dietary_options', '["vegetarian", "gluten_free"]', 'array', NOW(), NOW()),
  ('menu-dal-makhani', 'allergens', '["dairy"]', 'array', NOW(), NOW()),
  ('menu-dal-makhani', 'spice_level', '1', 'number', NOW(), NOW()),
  ('menu-dal-makhani', 'popularity_score', '0.85', 'number', NOW(), NOW()),
  ('menu-dal-makhani', 'ai_recommended', 'false', 'boolean', NOW(), NOW()),
  ('menu-dal-makhani', 'ingredients', '["black lentils", "cream", "butter", "tomatoes", "spices"]', 'array', NOW(), NOW()),
  ('menu-dal-makhani', 'availability', 'true', 'boolean', NOW(), NOW()),
  
  -- Fish Curry
  ('menu-fish-curry', 'description', 'Fresh fish in coconut-based curry', 'text', NOW(), NOW()),
  ('menu-fish-curry', 'price', '17.99', 'currency', NOW(), NOW()),
  ('menu-fish-curry', 'preparation_time', '20', 'number', NOW(), NOW()),
  ('menu-fish-curry', 'dietary_options', '["gluten_free", "dairy_free"]', 'array', NOW(), NOW()),
  ('menu-fish-curry', 'allergens', '["fish"]', 'array', NOW(), NOW()),
  ('menu-fish-curry', 'spice_level', '3', 'number', NOW(), NOW()),
  ('menu-fish-curry', 'popularity_score', '0.8', 'number', NOW(), NOW()),
  ('menu-fish-curry', 'ai_recommended', 'false', 'boolean', NOW(), NOW()),
  ('menu-fish-curry', 'ingredients', '["fish", "coconut milk", "curry leaves", "spices"]', 'array', NOW(), NOW()),
  ('menu-fish-curry', 'availability', 'true', 'boolean', NOW(), NOW()),
  
  -- Mutton Curry
  ('menu-mutton-curry', 'description', 'Tender mutton in spicy gravy', 'text', NOW(), NOW()),
  ('menu-mutton-curry', 'price', '18.99', 'currency', NOW(), NOW()),
  ('menu-mutton-curry', 'preparation_time', '35', 'number', NOW(), NOW()),
  ('menu-mutton-curry', 'dietary_options', '["gluten_free"]', 'array', NOW(), NOW()),
  ('menu-mutton-curry', 'allergens', '[]', 'array', NOW(), NOW()),
  ('menu-mutton-curry', 'spice_level', '4', 'number', NOW(), NOW()),
  ('menu-mutton-curry', 'popularity_score', '0.75', 'number', NOW(), NOW()),
  ('menu-mutton-curry', 'ai_recommended', 'false', 'boolean', NOW(), NOW()),
  ('menu-mutton-curry', 'ingredients', '["mutton", "onions", "tomatoes", "spices"]', 'array', NOW(), NOW()),
  ('menu-mutton-curry', 'availability', 'true', 'boolean', NOW(), NOW()),
  
  -- Chicken Curry
  ('menu-chicken-curry', 'description', 'Traditional chicken curry with aromatic spices', 'text', NOW(), NOW()),
  ('menu-chicken-curry', 'price', '15.99', 'currency', NOW(), NOW()),
  ('menu-chicken-curry', 'preparation_time', '25', 'number', NOW(), NOW()),
  ('menu-chicken-curry', 'dietary_options', '["gluten_free"]', 'array', NOW(), NOW()),
  ('menu-chicken-curry', 'allergens', '[]', 'array', NOW(), NOW()),
  ('menu-chicken-curry', 'spice_level', '3', 'number', NOW(), NOW()),
  ('menu-chicken-curry', 'popularity_score', '0.88', 'number', NOW(), NOW()),
  ('menu-chicken-curry', 'ai_recommended', 'false', 'boolean', NOW(), NOW()),
  ('menu-chicken-curry', 'ingredients', '["chicken", "onions", "tomatoes", "spices"]', 'array', NOW(), NOW()),
  ('menu-chicken-curry', 'availability', 'true', 'boolean', NOW(), NOW()),
  
  -- Vegetable Biryani
  ('menu-veg-biryani', 'description', 'Fragrant basmati rice with mixed vegetables and spices', 'text', NOW(), NOW()),
  ('menu-veg-biryani', 'price', '13.99', 'currency', NOW(), NOW()),
  ('menu-veg-biryani', 'preparation_time', '25', 'number', NOW(), NOW()),
  ('menu-veg-biryani', 'dietary_options', '["vegetarian", "vegan", "gluten_free"]', 'array', NOW(), NOW()),
  ('menu-veg-biryani', 'allergens', '[]', 'array', NOW(), NOW()),
  ('menu-veg-biryani', 'spice_level', '2', 'number', NOW(), NOW()),
  ('menu-veg-biryani', 'popularity_score', '0.88', 'number', NOW(), NOW()),
  ('menu-veg-biryani', 'ai_recommended', 'true', 'boolean', NOW(), NOW()),
  ('menu-veg-biryani', 'ingredients', '["basmati rice", "vegetables", "spices", "herbs"]', 'array', NOW(), NOW()),
  ('menu-veg-biryani', 'availability', 'true', 'boolean', NOW(), NOW()),
  
  -- Chicken Biryani
  ('menu-chicken-biryani', 'description', 'Aromatic rice with tender chicken pieces', 'text', NOW(), NOW()),
  ('menu-chicken-biryani', 'price', '15.99', 'currency', NOW(), NOW()),
  ('menu-chicken-biryani', 'preparation_time', '30', 'number', NOW(), NOW()),
  ('menu-chicken-biryani', 'dietary_options', '["gluten_free"]', 'array', NOW(), NOW()),
  ('menu-chicken-biryani', 'allergens', '[]', 'array', NOW(), NOW()),
  ('menu-chicken-biryani', 'spice_level', '2', 'number', NOW(), NOW()),
  ('menu-chicken-biryani', 'popularity_score', '0.92', 'number', NOW(), NOW()),
  ('menu-chicken-biryani', 'ai_recommended', 'true', 'boolean', NOW(), NOW()),
  ('menu-chicken-biryani', 'ingredients', '["basmati rice", "chicken", "spices", "saffron"]', 'array', NOW(), NOW()),
  ('menu-chicken-biryani', 'availability', 'true', 'boolean', NOW(), NOW()),
  
  -- Mutton Biryani
  ('menu-mutton-biryani', 'description', 'Royal biryani with succulent mutton pieces', 'text', NOW(), NOW()),
  ('menu-mutton-biryani', 'price', '18.99', 'currency', NOW(), NOW()),
  ('menu-mutton-biryani', 'preparation_time', '40', 'number', NOW(), NOW()),
  ('menu-mutton-biryani', 'dietary_options', '["gluten_free"]', 'array', NOW(), NOW()),
  ('menu-mutton-biryani', 'allergens', '[]', 'array', NOW(), NOW()),
  ('menu-mutton-biryani', 'spice_level', '3', 'number', NOW(), NOW()),
  ('menu-mutton-biryani', 'popularity_score', '0.85', 'number', NOW(), NOW()),
  ('menu-mutton-biryani', 'ai_recommended', 'false', 'boolean', NOW(), NOW()),
  ('menu-mutton-biryani', 'ingredients', '["basmati rice", "mutton", "spices", "saffron"]', 'array', NOW(), NOW()),
  ('menu-mutton-biryani', 'availability', 'true', 'boolean', NOW(), NOW()),
  
  -- Garlic Naan
  ('menu-garlic-naan', 'description', 'Soft bread topped with garlic and butter', 'text', NOW(), NOW()),
  ('menu-garlic-naan', 'price', '3.99', 'currency', NOW(), NOW()),
  ('menu-garlic-naan', 'preparation_time', '10', 'number', NOW(), NOW()),
  ('menu-garlic-naan', 'dietary_options', '["vegetarian"]', 'array', NOW(), NOW()),
  ('menu-garlic-naan', 'allergens', '["gluten", "dairy"]', 'array', NOW(), NOW()),
  ('menu-garlic-naan', 'spice_level', '0', 'number', NOW(), NOW()),
  ('menu-garlic-naan', 'popularity_score', '0.9', 'number', NOW(), NOW()),
  ('menu-garlic-naan', 'ai_recommended', 'true', 'boolean', NOW(), NOW()),
  ('menu-garlic-naan', 'ingredients', '["flour", "yogurt", "garlic", "butter"]', 'array', NOW(), NOW()),
  ('menu-garlic-naan', 'availability', 'true', 'boolean', NOW(), NOW()),
  
  -- Tandoori Roti
  ('menu-tandoori-roti', 'description', 'Whole wheat flat bread from clay oven', 'text', NOW(), NOW()),
  ('menu-tandoori-roti', 'price', '2.99', 'currency', NOW(), NOW()),
  ('menu-tandoori-roti', 'preparation_time', '8', 'number', NOW(), NOW()),
  ('menu-tandoori-roti', 'dietary_options', '["vegetarian", "vegan"]', 'array', NOW(), NOW()),
  ('menu-tandoori-roti', 'allergens', '["gluten"]', 'array', NOW(), NOW()),
  ('menu-tandoori-roti', 'spice_level', '0', 'number', NOW(), NOW()),
  ('menu-tandoori-roti', 'popularity_score', '0.8', 'number', NOW(), NOW()),
  ('menu-tandoori-roti', 'ai_recommended', 'false', 'boolean', NOW(), NOW()),
  ('menu-tandoori-roti', 'ingredients', '["whole wheat flour", "water", "salt"]', 'array', NOW(), NOW()),
  ('menu-tandoori-roti', 'availability', 'true', 'boolean', NOW(), NOW()),
  
  -- Gulab Jamun
  ('menu-gulab-jamun', 'description', 'Deep fried milk dumplings in sugar syrup', 'text', NOW(), NOW()),
  ('menu-gulab-jamun', 'price', '6.99', 'currency', NOW(), NOW()),
  ('menu-gulab-jamun', 'preparation_time', '5', 'number', NOW(), NOW()),
  ('menu-gulab-jamun', 'dietary_options', '["vegetarian"]', 'array', NOW(), NOW()),
  ('menu-gulab-jamun', 'allergens', '["dairy", "gluten"]', 'array', NOW(), NOW()),
  ('menu-gulab-jamun', 'spice_level', '0', 'number', NOW(), NOW()),
  ('menu-gulab-jamun', 'popularity_score', '0.95', 'number', NOW(), NOW()),
  ('menu-gulab-jamun', 'ai_recommended', 'true', 'boolean', NOW(), NOW()),
  ('menu-gulab-jamun', 'ingredients', '["milk powder", "flour", "sugar syrup", "cardamom"]', 'array', NOW(), NOW()),
  ('menu-gulab-jamun', 'availability', 'true', 'boolean', NOW(), NOW()),
  
  -- Kulfi
  ('menu-kulfi', 'description', 'Traditional Indian ice cream with pistachios', 'text', NOW(), NOW()),
  ('menu-kulfi', 'price', '5.99', 'currency', NOW(), NOW()),
  ('menu-kulfi', 'preparation_time', '3', 'number', NOW(), NOW()),
  ('menu-kulfi', 'dietary_options', '["vegetarian", "gluten_free"]', 'array', NOW(), NOW()),
  ('menu-kulfi', 'allergens', '["dairy", "nuts"]', 'array', NOW(), NOW()),
  ('menu-kulfi', 'spice_level', '0', 'number', NOW(), NOW()),
  ('menu-kulfi', 'popularity_score', '0.85', 'number', NOW(), NOW()),
  ('menu-kulfi', 'ai_recommended', 'false', 'boolean', NOW(), NOW()),
  ('menu-kulfi', 'ingredients', '["milk", "sugar", "pistachios", "cardamom"]', 'array', NOW(), NOW()),
  ('menu-kulfi', 'availability', 'true', 'boolean', NOW(), NOW()),
  
  -- Mango Lassi
  ('menu-mango-lassi', 'description', 'Sweet yogurt drink with mango pulp', 'text', NOW(), NOW()),
  ('menu-mango-lassi', 'price', '5.99', 'currency', NOW(), NOW()),
  ('menu-mango-lassi', 'preparation_time', '5', 'number', NOW(), NOW()),
  ('menu-mango-lassi', 'dietary_options', '["vegetarian", "gluten_free"]', 'array', NOW(), NOW()),
  ('menu-mango-lassi', 'allergens', '["dairy"]', 'array', NOW(), NOW()),
  ('menu-mango-lassi', 'spice_level', '0', 'number', NOW(), NOW()),
  ('menu-mango-lassi', 'popularity_score', '0.9', 'number', NOW(), NOW()),
  ('menu-mango-lassi', 'ai_recommended', 'true', 'boolean', NOW(), NOW()),
  ('menu-mango-lassi', 'ingredients', '["yogurt", "mango pulp", "sugar", "cardamom"]', 'array', NOW(), NOW()),
  ('menu-mango-lassi', 'availability', 'true', 'boolean', NOW(), NOW()),
  
  -- Masala Chai
  ('menu-masala-chai', 'description', 'Spiced Indian tea with milk', 'text', NOW(), NOW()),
  ('menu-masala-chai', 'price', '3.99', 'currency', NOW(), NOW()),
  ('menu-masala-chai', 'preparation_time', '5', 'number', NOW(), NOW()),
  ('menu-masala-chai', 'dietary_options', '["vegetarian"]', 'array', NOW(), NOW()),
  ('menu-masala-chai', 'allergens', '["dairy"]', 'array', NOW(), NOW()),
  ('menu-masala-chai', 'spice_level', '1', 'number', NOW(), NOW()),
  ('menu-masala-chai', 'popularity_score', '0.88', 'number', NOW(), NOW()),
  ('menu-masala-chai', 'ai_recommended', 'false', 'boolean', NOW(), NOW()),
  ('menu-masala-chai', 'ingredients', '["tea", "milk", "ginger", "cardamom", "cinnamon"]', 'array', NOW(), NOW()),
  ('menu-masala-chai', 'availability', 'true', 'boolean', NOW(), NOW());

-- 4. Staff Members
INSERT INTO core_entities (id, organization_id, entity_type, name, status, metadata, created_at, updated_at)
VALUES 
  ('staff-001', 'first-floor-restaurant', 'staff', 'Rajesh Kumar', 'active', '{"role": "head_waiter"}', NOW(), NOW()),
  ('staff-002', 'first-floor-restaurant', 'staff', 'Priya Sharma', 'active', '{"role": "waiter"}', NOW(), NOW()),
  ('staff-003', 'first-floor-restaurant', 'staff', 'Amit Singh', 'active', '{"role": "chef"}', NOW(), NOW()),
  ('staff-004', 'first-floor-restaurant', 'staff', 'Sunita Devi', 'active', '{"role": "sous_chef"}', NOW(), NOW()),
  ('staff-005', 'first-floor-restaurant', 'staff', 'Ravi Gupta', 'active', '{"role": "waiter"}', NOW(), NOW()),
  ('staff-006', 'first-floor-restaurant', 'staff', 'Meera Joshi', 'active', '{"role": "cashier"}', NOW(), NOW());

-- 5. Staff Dynamic Data
INSERT INTO core_dynamic_data (entity_id, field_name, field_value, field_type, created_at, updated_at)
VALUES 
  ('staff-001', 'phone', '+91-9876543210', 'text', NOW(), NOW()),
  ('staff-001', 'shift', 'day', 'text', NOW(), NOW()),
  ('staff-001', 'experience_years', '5', 'number', NOW(), NOW()),
  
  ('staff-002', 'phone', '+91-9876543211', 'text', NOW(), NOW()),
  ('staff-002', 'shift', 'day', 'text', NOW(), NOW()),
  ('staff-002', 'experience_years', '2', 'number', NOW(), NOW()),
  
  ('staff-003', 'phone', '+91-9876543212', 'text', NOW(), NOW()),
  ('staff-003', 'shift', 'day', 'text', NOW(), NOW()),
  ('staff-003', 'experience_years', '8', 'number', NOW(), NOW()),
  
  ('staff-004', 'phone', '+91-9876543213', 'text', NOW(), NOW()),
  ('staff-004', 'shift', 'day', 'text', NOW(), NOW()),
  ('staff-004', 'experience_years', '4', 'number', NOW(), NOW()),
  
  ('staff-005', 'phone', '+91-9876543214', 'text', NOW(), NOW()),
  ('staff-005', 'shift', 'evening', 'text', NOW(), NOW()),
  ('staff-005', 'experience_years', '1', 'number', NOW(), NOW()),
  
  ('staff-006', 'phone', '+91-9876543215', 'text', NOW(), NOW()),
  ('staff-006', 'shift', 'day', 'text', NOW(), NOW()),
  ('staff-006', 'experience_years', '3', 'number', NOW(), NOW());

-- 6. Tables
INSERT INTO core_entities (id, organization_id, entity_type, name, status, metadata, created_at, updated_at)
VALUES 
  ('table-001', 'first-floor-restaurant', 'table', 'Table 1', 'active', '{"capacity": 2, "location": "window"}', NOW(), NOW()),
  ('table-002', 'first-floor-restaurant', 'table', 'Table 2', 'active', '{"capacity": 4, "location": "center"}', NOW(), NOW()),
  ('table-003', 'first-floor-restaurant', 'table', 'Table 3', 'active', '{"capacity": 6, "location": "corner"}', NOW(), NOW()),
  ('table-004', 'first-floor-restaurant', 'table', 'Table 4', 'active', '{"capacity": 2, "location": "window"}', NOW(), NOW()),
  ('table-005', 'first-floor-restaurant', 'table', 'Table 5', 'active', '{"capacity": 4, "location": "center"}', NOW(), NOW()),
  ('table-006', 'first-floor-restaurant', 'table', 'Table 6', 'active', '{"capacity": 8, "location": "private"}', NOW(), NOW()),
  ('table-007', 'first-floor-restaurant', 'table', 'Table 7', 'active', '{"capacity": 4, "location": "center"}', NOW(), NOW()),
  ('table-008', 'first-floor-restaurant', 'table', 'Table 8', 'active', '{"capacity": 2, "location": "window"}', NOW(), NOW()),
  ('table-009', 'first-floor-restaurant', 'table', 'Table 9', 'active', '{"capacity": 4, "location": "center"}', NOW(), NOW()),
  ('table-010', 'first-floor-restaurant', 'table', 'Table 10', 'active', '{"capacity": 6, "location": "corner"}', NOW(), NOW());

-- 7. Customers
INSERT INTO core_entities (id, organization_id, entity_type, name, status, metadata, created_at, updated_at)
VALUES 
  ('customer-001', 'first-floor-restaurant', 'customer', 'Arjun Patel', 'active', '{"phone": "+91-9876543220"}', NOW(), NOW()),
  ('customer-002', 'first-floor-restaurant', 'customer', 'Sneha Reddy', 'active', '{"phone": "+91-9876543221"}', NOW(), NOW()),
  ('customer-003', 'first-floor-restaurant', 'customer', 'Vikram Mehta', 'active', '{"phone": "+91-9876543222"}', NOW(), NOW()),
  ('customer-004', 'first-floor-restaurant', 'customer', 'Kavya Iyer', 'active', '{"phone": "+91-9876543223"}', NOW(), NOW()),
  ('customer-005', 'first-floor-restaurant', 'customer', 'Rohit Agarwal', 'active', '{"phone": "+91-9876543224"}', NOW(), NOW());

-- 8. Customer Dynamic Data (Preferences)
INSERT INTO core_dynamic_data (entity_id, field_name, field_value, field_type, created_at, updated_at)
VALUES 
  ('customer-001', 'dietary_preferences', '["vegetarian"]', 'array', NOW(), NOW()),
  ('customer-001', 'allergies', '["nuts"]', 'array', NOW(), NOW()),
  ('customer-001', 'spice_tolerance', '2', 'number', NOW(), NOW()),
  
  ('customer-002', 'dietary_preferences', '["gluten_free"]', 'array', NOW(), NOW()),
  ('customer-002', 'allergies', '["dairy"]', 'array', NOW(), NOW()),
  ('customer-002', 'spice_tolerance', '3', 'number', NOW(), NOW()),
  
  ('customer-003', 'dietary_preferences', '[]', 'array', NOW(), NOW()),
  ('customer-003', 'allergies', '[]', 'array', NOW(), NOW()),
  ('customer-003', 'spice_tolerance', '4', 'number', NOW(), NOW()),
  
  ('customer-004', 'dietary_preferences', '["vegan"]', 'array', NOW(), NOW()),
  ('customer-004', 'allergies', '["dairy", "eggs"]', 'array', NOW(), NOW()),
  ('customer-004', 'spice_tolerance', '1', 'number', NOW(), NOW()),
  
  ('customer-005', 'dietary_preferences', '["vegetarian"]', 'array', NOW(), NOW()),
  ('customer-005', 'allergies', '[]', 'array', NOW(), NOW()),
  ('customer-005', 'spice_tolerance', '3', 'number', NOW(), NOW());

-- 9. Sample Orders
INSERT INTO core_entities (id, organization_id, entity_type, name, status, metadata, created_at, updated_at)
VALUES 
  ('order-001', 'first-floor-restaurant', 'order', 'Order #001', 'completed', '{"table_id": "table-002", "customer_id": "customer-001", "waiter_id": "staff-001"}', NOW(), NOW()),
  ('order-002', 'first-floor-restaurant', 'order', 'Order #002', 'completed', '{"table_id": "table-005", "customer_id": "customer-002", "waiter_id": "staff-002"}', NOW(), NOW()),
  ('order-003', 'first-floor-restaurant', 'order', 'Order #003', 'in_progress', '{"table_id": "table-003", "customer_id": "customer-003", "waiter_id": "staff-001"}', NOW(), NOW());

-- 10. Order Dynamic Data
INSERT INTO core_dynamic_data (entity_id, field_name, field_value, field_type, created_at, updated_at)
VALUES 
  ('order-001', 'total_amount', '45.97', 'currency', NOW(), NOW()),
  ('order-001', 'payment_method', 'credit_card', 'text', NOW(), NOW()),
  ('order-001', 'special_instructions', 'Less spicy', 'text', NOW(), NOW()),
  
  ('order-002', 'total_amount', '38.98', 'currency', NOW(), NOW()),
  ('order-002', 'payment_method', 'cash', 'text', NOW(), NOW()),
  ('order-002', 'special_instructions', 'No garlic', 'text', NOW(), NOW()),
  
  ('order-003', 'total_amount', '52.96', 'currency', NOW(), NOW()),
  ('order-003', 'payment_method', 'pending', 'text', NOW(), NOW()),
  ('order-003', 'special_instructions', 'Extra spicy', 'text', NOW(), NOW());

-- 11. AI Schema Registry
INSERT INTO ai_schema_registry (id, organization_id, entity_type, schema_name, schema_version, schema_definition, ai_confidence, created_at, updated_at)
VALUES 
  ('schema-menu-item', 'first-floor-restaurant', 'menu_item', 'RestaurantMenuItem', '1.0', '{"fields": {"name": "string", "description": "string", "price": "currency", "category": "string", "preparation_time": "number", "dietary_options": "array", "allergens": "array", "spice_level": "number", "popularity_score": "number", "ai_recommended": "boolean", "ingredients": "array", "availability": "boolean"}}', 0.95, NOW(), NOW()),
  
  ('schema-order', 'first-floor-restaurant', 'order', 'RestaurantOrder', '1.0', '{"fields": {"table_id": "string", "customer_id": "string", "waiter_id": "string", "total_amount": "currency", "payment_method": "string", "special_instructions": "string", "order_items": "array"}}', 0.92, NOW(), NOW()),
  
  ('schema-customer', 'first-floor-restaurant', 'customer', 'RestaurantCustomer', '1.0', '{"fields": {"phone": "string", "dietary_preferences": "array", "allergies": "array", "spice_tolerance": "number"}}', 0.88, NOW(), NOW()),
  
  ('schema-staff', 'first-floor-restaurant', 'staff', 'RestaurantStaff', '1.0', '{"fields": {"role": "string", "phone": "string", "shift": "string", "experience_years": "number"}}', 0.90, NOW(), NOW()),
  
  ('schema-table', 'first-floor-restaurant', 'table', 'RestaurantTable', '1.0', '{"fields": {"capacity": "number", "location": "string", "status": "string"}}', 0.85, NOW(), NOW());

-- 12. AI Schema Components
INSERT INTO ai_schema_components (id, schema_id, component_name, component_type, component_definition, ai_confidence, created_at, updated_at)
VALUES 
  ('comp-price-validation', 'schema-menu-item', 'PriceValidation', 'validation', '{"rule": "price > 0 AND price < 100", "message": "Price must be between $0 and $100"}', 0.98, NOW(), NOW()),
  
  ('comp-spice-level', 'schema-menu-item', 'SpiceLevelValidation', 'validation', '{"rule": "spice_level >= 0 AND spice_level <= 5", "message": "Spice level must be between 0 and 5"}', 0.96, NOW(), NOW()),
  
  ('comp-dietary-options', 'schema-menu-item', 'DietaryOptionsEnum', 'enum', '{"values": ["vegetarian", "vegan", "gluten_free", "dairy_free", "nut_free"], "multiple": true}', 0.94, NOW(), NOW()),
  
  ('comp-allergens', 'schema-menu-item', 'AllergensEnum', 'enum', '{"values": ["dairy", "gluten", "nuts", "eggs", "fish", "shellfish", "soy"], "multiple": true}', 0.92, NOW(), NOW()),
  
  ('comp-payment-method', 'schema-order', 'PaymentMethodEnum', 'enum', '{"values": ["cash", "credit_card", "debit_card", "upi", "pending"], "multiple": false}', 0.90, NOW(), NOW());

-- 13. Sample Inventory Items
INSERT INTO core_entities (id, organization_id, entity_type, name, status, metadata, created_at, updated_at)
VALUES 
  ('inv-basmati-rice', 'first-floor-restaurant', 'inventory', 'Basmati Rice', 'active', '{"category": "grains"}', NOW(), NOW()),
  ('inv-chicken', 'first-floor-restaurant', 'inventory', 'Chicken', 'active', '{"category": "meat"}', NOW(), NOW()),
  ('inv-paneer', 'first-floor-restaurant', 'inventory', 'Paneer', 'active', '{"category": "dairy"}', NOW(), NOW()),
  ('inv-tomatoes', 'first-floor-restaurant', 'inventory', 'Tomatoes', 'active', '{"category": "vegetables"}', NOW(), NOW()),
  ('inv-onions', 'first-floor-restaurant', 'inventory', 'Onions', 'active', '{"category": "vegetables"}', NOW(), NOW());

-- 14. Inventory Dynamic Data
INSERT INTO core_dynamic_data (entity_id, field_name, field_value, field_type, created_at, updated_at)
VALUES 
  ('inv-basmati-rice', 'quantity', '25', 'number', NOW(), NOW()),
  ('inv-basmati-rice', 'unit', 'kg', 'text', NOW(), NOW()),
  ('inv-basmati-rice', 'cost_per_unit', '5.99', 'currency', NOW(), NOW()),
  ('inv-basmati-rice', 'supplier', 'Rice Traders Ltd', 'text', NOW(), NOW()),
  
  ('inv-chicken', 'quantity', '15', 'number', NOW(), NOW()),
  ('inv-chicken', 'unit', 'kg', 'text', NOW(), NOW()),
  ('inv-chicken', 'cost_per_unit', '12.99', 'currency', NOW(), NOW()),
  ('inv-chicken', 'supplier', 'Fresh Meat Co', 'text', NOW(), NOW()),
  
  ('inv-paneer', 'quantity', '8', 'number', NOW(), NOW()),
  ('inv-paneer', 'unit', 'kg', 'text', NOW(), NOW()),
  ('inv-paneer', 'cost_per_unit', '8.99', 'currency', NOW(), NOW()),
  ('inv-paneer', 'supplier', 'Dairy Fresh', 'text', NOW(), NOW()),
  
  ('inv-tomatoes', 'quantity', '20', 'number', NOW(), NOW()),
  ('inv-tomatoes', 'unit', 'kg', 'text', NOW(), NOW()),
  ('inv-tomatoes', 'cost_per_unit', '2.99', 'currency', NOW(), NOW()),
  ('inv-tomatoes', 'supplier', 'Vegetable Market', 'text', NOW(), NOW()),
  
  ('inv-onions', 'quantity', '18', 'number', NOW(), NOW()),
  ('inv-onions', 'unit', 'kg', 'text', NOW(), NOW()),
  ('inv-onions', 'cost_per_unit', '1.99', 'currency', NOW(), NOW()),
  ('inv-onions', 'supplier', 'Vegetable Market', 'text', NOW(), NOW());

-- 15. Universal Transactions for Sample Orders
INSERT INTO universal_transactions (id, organization_id, transaction_type, status, total_amount, metadata, created_at, updated_at)
VALUES 
  ('txn-order-001', 'first-floor-restaurant', 'restaurant_order', 'completed', 45.97, '{"order_id": "order-001", "table_id": "table-002", "customer_id": "customer-001"}', NOW(), NOW()),
  ('txn-order-002', 'first-floor-restaurant', 'restaurant_order', 'completed', 38.98, '{"order_id": "order-002", "table_id": "table-005", "customer_id": "customer-002"}', NOW(), NOW()),
  ('txn-order-003', 'first-floor-restaurant', 'restaurant_order', 'in_progress', 52.96, '{"order_id": "order-003", "table_id": "table-003", "customer_id": "customer-003"}', NOW(), NOW());

-- 16. Universal Transaction Lines
INSERT INTO universal_transaction_lines (id, transaction_id, line_type, entity_id, quantity, unit_price, total_amount, metadata, created_at, updated_at)
VALUES 
  -- Order 001 lines
  ('txn-line-001-1', 'txn-order-001', 'order_item', 'menu-paneer-tikka', 1, 8.99, 8.99, '{"item_name": "Paneer Tikka"}', NOW(), NOW()),
  ('txn-line-001-2', 'txn-order-001', 'order_item', 'menu-butter-chicken', 1, 16.99, 16.99, '{"item_name": "Butter Chicken"}', NOW(), NOW()),
  ('txn-line-001-3', 'txn-order-001', 'order_item', 'menu-garlic-naan', 2, 3.99, 7.98, '{"item_name": "Garlic Naan"}', NOW(), NOW()),
  ('txn-line-001-4', 'txn-order-001', 'order_item', 'menu-dal-makhani', 1, 12.99, 12.99, '{"item_name": "Dal Makhani"}', NOW(), NOW()),
  
  -- Order 002 lines
  ('txn-line-002-1', 'txn-order-002', 'order_item', 'menu-chicken-biryani', 1, 15.99, 15.99, '{"item_name": "Chicken Biryani"}', NOW(), NOW()),
  ('txn-line-002-2', 'txn-order-002', 'order_item', 'menu-veg-samosa', 2, 5.99, 11.98, '{"item_name": "Vegetable Samosa"}', NOW(), NOW()),
  ('txn-line-002-3', 'txn-order-002', 'order_item', 'menu-mango-lassi', 1, 5.99, 5.99, '{"item_name": "Mango Lassi"}', NOW(), NOW()),
  ('txn-line-002-4', 'txn-order-002', 'order_item', 'menu-kulfi', 1, 5.99, 5.99, '{"item_name": "Kulfi"}', NOW(), NOW()),
  
  -- Order 003 lines
  ('txn-line-003-1', 'txn-order-003', 'order_item', 'menu-chicken-65', 1, 9.99, 9.99, '{"item_name": "Chicken 65"}', NOW(), NOW()),
  ('txn-line-003-2', 'txn-order-003', 'order_item', 'menu-mutton-biryani', 1, 18.99, 18.99, '{"item_name": "Mutton Biryani"}', NOW(), NOW()),
  ('txn-line-003-3', 'txn-order-003', 'order_item', 'menu-fish-curry', 1, 17.99, 17.99, '{"item_name": "Fish Curry"}', NOW(), NOW()),
  ('txn-line-003-4', 'txn-order-003', 'order_item', 'menu-gulab-jamun', 1, 6.99, 6.99, '{"item_name": "Gulab Jamun"}', NOW(), NOW());

-- This completes the First Floor Restaurant data setup
-- The restaurant is now fully configured with menu items, staff, tables, customers, orders, and inventory
-- All data follows the HERA Universal Schema Architecture principles