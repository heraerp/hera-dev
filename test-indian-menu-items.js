/**
 * Test script to create sample Indian restaurant menu items for bulk upload testing
 */

// Sample Indian restaurant menu items data
const indianMenuItems = [
  // Appetizers
  {
    name: "Samosa",
    description: "Crispy pastry filled with spiced potatoes and peas",
    category: "Appetizers",
    base_price: 6.99,
    preparation_time: 8,
    calories: 150,
    spice_level: "mild",
    is_vegetarian: true,
    is_vegan: false,
    is_gluten_free: false,
    is_featured: true,
    is_active: true,
    display_order: 1,
    tags: "appetizer, vegetarian, crispy",
    allergens: "wheat, oil",
    ingredients: "potatoes, peas, spices, pastry",
    nutritional_info: "Rich in carbohydrates and dietary fiber"
  },
  {
    name: "Chicken Tikka",
    description: "Marinated chicken pieces grilled in tandoor",
    category: "Appetizers",
    base_price: 12.99,
    preparation_time: 15,
    calories: 280,
    spice_level: "medium",
    is_vegetarian: false,
    is_vegan: false,
    is_gluten_free: true,
    is_featured: true,
    is_active: true,
    display_order: 2,
    tags: "appetizer, chicken, tandoor",
    allergens: "dairy",
    ingredients: "chicken, yogurt, spices, onions",
    nutritional_info: "High in protein and low in carbs"
  },
  {
    name: "Paneer Tikka",
    description: "Grilled cottage cheese cubes with bell peppers",
    category: "Appetizers",
    base_price: 11.99,
    preparation_time: 12,
    calories: 220,
    spice_level: "medium",
    is_vegetarian: true,
    is_vegan: false,
    is_gluten_free: true,
    is_featured: false,
    is_active: true,
    display_order: 3,
    tags: "appetizer, vegetarian, paneer",
    allergens: "dairy",
    ingredients: "paneer, bell peppers, spices, yogurt",
    nutritional_info: "Rich in protein and calcium"
  },

  // Main Courses
  {
    name: "Chicken Biryani",
    description: "Aromatic basmati rice with spiced chicken",
    category: "Main Course",
    base_price: 16.99,
    preparation_time: 25,
    calories: 450,
    spice_level: "medium",
    is_vegetarian: false,
    is_vegan: false,
    is_gluten_free: true,
    is_featured: true,
    is_active: true,
    display_order: 10,
    tags: "main course, chicken, rice, biryani",
    allergens: "dairy, nuts",
    ingredients: "chicken, basmati rice, spices, yogurt, onions",
    nutritional_info: "Complete meal with protein and carbohydrates"
  },
  {
    name: "Vegetable Biryani",
    description: "Fragrant basmati rice with mixed vegetables",
    category: "Main Course",
    base_price: 14.99,
    preparation_time: 20,
    calories: 380,
    spice_level: "mild",
    is_vegetarian: true,
    is_vegan: false,
    is_gluten_free: true,
    is_featured: false,
    is_active: true,
    display_order: 11,
    tags: "main course, vegetarian, rice, biryani",
    allergens: "dairy, nuts",
    ingredients: "basmati rice, mixed vegetables, spices, ghee",
    nutritional_info: "Rich in vitamins and fiber"
  },
  {
    name: "Butter Chicken",
    description: "Creamy tomato-based curry with tender chicken",
    category: "Main Course",
    base_price: 18.99,
    preparation_time: 18,
    calories: 420,
    spice_level: "mild",
    is_vegetarian: false,
    is_vegan: false,
    is_gluten_free: true,
    is_featured: true,
    is_active: true,
    display_order: 12,
    tags: "main course, chicken, curry, creamy",
    allergens: "dairy, nuts",
    ingredients: "chicken, tomatoes, cream, butter, spices",
    nutritional_info: "High in protein with moderate calories"
  },
  {
    name: "Palak Paneer",
    description: "Cottage cheese in creamy spinach curry",
    category: "Main Course",
    base_price: 15.99,
    preparation_time: 15,
    calories: 320,
    spice_level: "mild",
    is_vegetarian: true,
    is_vegan: false,
    is_gluten_free: true,
    is_featured: false,
    is_active: true,
    display_order: 13,
    tags: "main course, vegetarian, paneer, spinach",
    allergens: "dairy",
    ingredients: "paneer, spinach, cream, spices, onions",
    nutritional_info: "Rich in iron, calcium, and protein"
  },
  {
    name: "Dal Makhani",
    description: "Creamy black lentils slow-cooked with butter",
    category: "Main Course",
    base_price: 13.99,
    preparation_time: 30,
    calories: 280,
    spice_level: "mild",
    is_vegetarian: true,
    is_vegan: false,
    is_gluten_free: true,
    is_featured: false,
    is_active: true,
    display_order: 14,
    tags: "main course, vegetarian, lentils, creamy",
    allergens: "dairy",
    ingredients: "black lentils, butter, cream, spices, tomatoes",
    nutritional_info: "High in protein and fiber"
  },

  // Breads
  {
    name: "Naan",
    description: "Traditional Indian flatbread baked in tandoor",
    category: "Breads",
    base_price: 4.99,
    preparation_time: 5,
    calories: 180,
    spice_level: "mild",
    is_vegetarian: true,
    is_vegan: false,
    is_gluten_free: false,
    is_featured: false,
    is_active: true,
    display_order: 20,
    tags: "bread, vegetarian, tandoor",
    allergens: "wheat, dairy",
    ingredients: "flour, yogurt, yeast, salt, oil",
    nutritional_info: "Source of carbohydrates and energy"
  },
  {
    name: "Garlic Naan",
    description: "Naan bread topped with fresh garlic and herbs",
    category: "Breads",
    base_price: 5.99,
    preparation_time: 6,
    calories: 200,
    spice_level: "mild",
    is_vegetarian: true,
    is_vegan: false,
    is_gluten_free: false,
    is_featured: true,
    is_active: true,
    display_order: 21,
    tags: "bread, vegetarian, garlic, herbs",
    allergens: "wheat, dairy",
    ingredients: "flour, yogurt, yeast, garlic, herbs, oil",
    nutritional_info: "Rich in carbohydrates with garlic benefits"
  },
  {
    name: "Roti",
    description: "Whole wheat flatbread cooked on griddle",
    category: "Breads",
    base_price: 3.99,
    preparation_time: 4,
    calories: 120,
    spice_level: "mild",
    is_vegetarian: true,
    is_vegan: true,
    is_gluten_free: false,
    is_featured: false,
    is_active: true,
    display_order: 22,
    tags: "bread, vegetarian, vegan, whole wheat",
    allergens: "wheat",
    ingredients: "whole wheat flour, water, salt, oil",
    nutritional_info: "High in fiber and complex carbohydrates"
  },

  // Beverages
  {
    name: "Mango Lassi",
    description: "Refreshing yogurt drink with mango pulp",
    category: "Beverages",
    base_price: 4.99,
    preparation_time: 3,
    calories: 160,
    spice_level: "mild",
    is_vegetarian: true,
    is_vegan: false,
    is_gluten_free: true,
    is_featured: true,
    is_active: true,
    display_order: 30,
    tags: "beverage, vegetarian, mango, yogurt",
    allergens: "dairy",
    ingredients: "yogurt, mango pulp, sugar, cardamom",
    nutritional_info: "Rich in probiotics and vitamin C"
  },
  {
    name: "Masala Chai",
    description: "Traditional spiced tea with milk",
    category: "Beverages",
    base_price: 3.99,
    preparation_time: 5,
    calories: 80,
    spice_level: "mild",
    is_vegetarian: true,
    is_vegan: false,
    is_gluten_free: true,
    is_featured: true,
    is_active: true,
    display_order: 31,
    tags: "beverage, vegetarian, tea, spiced",
    allergens: "dairy",
    ingredients: "tea leaves, milk, spices, sugar, ginger",
    nutritional_info: "Antioxidants and digestive benefits"
  },
  {
    name: "Fresh Lime Soda",
    description: "Sparkling water with fresh lime and mint",
    category: "Beverages",
    base_price: 3.49,
    preparation_time: 2,
    calories: 40,
    spice_level: "mild",
    is_vegetarian: true,
    is_vegan: true,
    is_gluten_free: true,
    is_featured: false,
    is_active: true,
    display_order: 32,
    tags: "beverage, vegetarian, vegan, refreshing",
    allergens: "",
    ingredients: "lime, soda water, mint, sugar, salt",
    nutritional_info: "Low calorie and vitamin C rich"
  },

  // Desserts
  {
    name: "Gulab Jamun",
    description: "Soft milk dumplings in rose-flavored syrup",
    category: "Desserts",
    base_price: 6.99,
    preparation_time: 10,
    calories: 220,
    spice_level: "mild",
    is_vegetarian: true,
    is_vegan: false,
    is_gluten_free: false,
    is_featured: true,
    is_active: true,
    display_order: 40,
    tags: "dessert, vegetarian, sweet, traditional",
    allergens: "dairy, wheat",
    ingredients: "milk powder, flour, sugar, rose water, cardamom",
    nutritional_info: "High in sugar and calories"
  },
  {
    name: "Ras Malai",
    description: "Soft cheese dumplings in sweetened milk",
    category: "Desserts",
    base_price: 7.99,
    preparation_time: 8,
    calories: 180,
    spice_level: "mild",
    is_vegetarian: true,
    is_vegan: false,
    is_gluten_free: true,
    is_featured: true,
    is_active: true,
    display_order: 41,
    tags: "dessert, vegetarian, sweet, milk",
    allergens: "dairy, nuts",
    ingredients: "milk, sugar, cardamom, pistachios, rose water",
    nutritional_info: "Rich in calcium and protein"
  },
  {
    name: "Kulfi",
    description: "Traditional Indian ice cream with cardamom",
    category: "Desserts",
    base_price: 5.99,
    preparation_time: 5,
    calories: 150,
    spice_level: "mild",
    is_vegetarian: true,
    is_vegan: false,
    is_gluten_free: true,
    is_featured: false,
    is_active: true,
    display_order: 42,
    tags: "dessert, vegetarian, ice cream, traditional",
    allergens: "dairy, nuts",
    ingredients: "milk, sugar, cardamom, pistachios, almonds",
    nutritional_info: "Cooling dessert with natural flavors"
  }
];

// Export data for testing
console.log('📊 Sample Indian Restaurant Menu Items:');
console.log(`Total Items: ${indianMenuItems.length}`);
console.log('Categories:', [...new Set(indianMenuItems.map(item => item.category))]);
console.log('Vegetarian Items:', indianMenuItems.filter(item => item.is_vegetarian).length);
console.log('Vegan Items:', indianMenuItems.filter(item => item.is_vegan).length);
console.log('Gluten-Free Items:', indianMenuItems.filter(item => item.is_gluten_free).length);
console.log('Featured Items:', indianMenuItems.filter(item => item.is_featured).length);

// Convert to JSON for export
const jsonData = JSON.stringify(indianMenuItems, null, 2);
console.log('\n📋 JSON Data for Bulk Upload:');
console.log(jsonData);

// Export for use in other modules
if (typeof module !== 'undefined') {
  module.exports = { indianMenuItems };
}

// Browser usage
if (typeof window !== 'undefined') {
  window.indianMenuItems = indianMenuItems;
}