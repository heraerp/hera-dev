/**
 * Creates an Excel file with Indian restaurant menu items for bulk upload testing
 */

import * as XLSX from 'xlsx';

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
    available_times: "lunch, dinner",
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
    available_times: "lunch, dinner",
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
    available_times: "lunch, dinner",
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
    available_times: "lunch, dinner",
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
    available_times: "lunch, dinner",
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
    available_times: "lunch, dinner",
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
    available_times: "lunch, dinner",
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
    available_times: "lunch, dinner",
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
    available_times: "lunch, dinner",
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
    available_times: "lunch, dinner",
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
    available_times: "lunch, dinner",
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
    available_times: "lunch, dinner",
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
    available_times: "all day",
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
    available_times: "all day",
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
    available_times: "lunch, dinner",
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
    available_times: "lunch, dinner",
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
    available_times: "lunch, dinner",
    allergens: "dairy, nuts",
    ingredients: "milk, sugar, cardamom, pistachios, almonds",
    nutritional_info: "Cooling dessert with natural flavors"
  }
];

// Function to create Excel file
function createIndianMenuExcel() {
  console.log('🚀 Creating Indian Menu Excel file...');
  
  try {
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Add worksheet
    const ws = XLSX.utils.json_to_sheet(indianMenuItems);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Indian Menu Items');
    
    // Generate buffer
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    
    // Create blob and download
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Indian_Restaurant_Menu_Items.xlsx';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    console.log('✅ Excel file created and downloaded successfully!');
    console.log(`📊 Total items: ${indianMenuItems.length}`);
    console.log('📋 Categories:', [...new Set(indianMenuItems.map(item => item.category))]);
    
  } catch (error) {
    console.error('❌ Error creating Excel file:', error);
  }
}

// Export function
if (typeof module !== 'undefined') {
  module.exports = { createIndianMenuExcel, indianMenuItems };
}

// Browser usage
if (typeof window !== 'undefined') {
  window.createIndianMenuExcel = createIndianMenuExcel;
  window.indianMenuItems = indianMenuItems;
}

// Auto-create if run directly
if (typeof window !== 'undefined') {
  console.log('🔧 Indian Menu Excel Creator loaded');
  console.log('📞 Call createIndianMenuExcel() to download the Excel file');
}