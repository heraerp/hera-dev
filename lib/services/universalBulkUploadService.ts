/**
 * Universal Bulk Upload Service
 * Standardized bulk upload system for all entity types in HERA Universal
 */

import { ExcelTemplateService } from './excelTemplateService';

// Universal field configuration
export interface UniversalFieldConfig {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  required: boolean;
  description?: string;
  validation?: (value: any) => boolean;
  transform?: (value: any) => any;
  arrayDelimiter?: string; // For array fields (e.g., ',' or '|')
  placeholder?: string;
  options?: string[]; // For select fields
}

// Universal entity type configuration
export interface UniversalEntityConfig {
  entityType: string;
  entityLabel: string;
  apiEndpoint: string;
  templateName: string;
  fields: UniversalFieldConfig[];
  validations?: {
    [key: string]: (item: any, allItems: any[]) => string | null;
  };
  preprocessing?: (items: any[]) => Promise<any[]>;
  postprocessing?: (results: any[], organizationId: string) => Promise<void>;
}

// Built-in entity configurations
export const ENTITY_CONFIGURATIONS: { [key: string]: UniversalEntityConfig } = {
  // Products configuration
  products: {
    entityType: 'product',
    entityLabel: 'Products',
    apiEndpoint: '/api/bulk-upload/products',
    templateName: 'Products Template',
    fields: [
      { key: 'name', label: 'Product Name', type: 'string', required: true, description: 'Name of the product' },
      { key: 'description', label: 'Description', type: 'string', required: false, description: 'Product description' },
      { key: 'category', label: 'Category', type: 'string', required: true, description: 'Product category' },
      { key: 'price', label: 'Price', type: 'number', required: true, description: 'Product price' },
      { key: 'cost', label: 'Cost', type: 'number', required: false, description: 'Product cost' },
      { key: 'sku', label: 'SKU', type: 'string', required: false, description: 'Product SKU' },
      { key: 'barcode', label: 'Barcode', type: 'string', required: false, description: 'Product barcode' },
      { key: 'stock_level', label: 'Stock Level', type: 'number', required: false, description: 'Current stock level' },
      { key: 'min_stock_level', label: 'Min Stock Level', type: 'number', required: false, description: 'Minimum stock level' },
      { key: 'supplier', label: 'Supplier', type: 'string', required: false, description: 'Product supplier' },
      { key: 'tags', label: 'Tags', type: 'array', required: false, description: 'Product tags', arrayDelimiter: ',' },
      { key: 'is_active', label: 'Active', type: 'boolean', required: false, description: 'Whether product is active' }
    ]
  },

  // Ingredients configuration
  ingredients: {
    entityType: 'ingredient',
    entityLabel: 'Ingredients',
    apiEndpoint: '/api/bulk-upload/ingredients',
    templateName: 'Ingredients Template',
    fields: [
      { key: 'name', label: 'Ingredient Name', type: 'string', required: true, description: 'Name of the ingredient' },
      { key: 'unit', label: 'Unit', type: 'string', required: true, description: 'Unit of measurement' },
      { key: 'cost_per_unit', label: 'Cost per Unit', type: 'number', required: true, description: 'Cost per unit' },
      { key: 'supplier', label: 'Supplier', type: 'string', required: true, description: 'Ingredient supplier' },
      { key: 'category', label: 'Category', type: 'string', required: true, description: 'Ingredient category' },
      { key: 'stock_level', label: 'Stock Level', type: 'number', required: false, description: 'Current stock level' },
      { key: 'min_stock_level', label: 'Min Stock Level', type: 'number', required: false, description: 'Minimum stock level' },
      { key: 'max_stock_level', label: 'Max Stock Level', type: 'number', required: false, description: 'Maximum stock level' },
      { key: 'supplier_sku', label: 'Supplier SKU', type: 'string', required: false, description: 'Supplier SKU' },
      { key: 'storage_location', label: 'Storage Location', type: 'string', required: false, description: 'Storage location' },
      { key: 'expiry_days', label: 'Expiry Days', type: 'number', required: false, description: 'Days until expiry' },
      { key: 'notes', label: 'Notes', type: 'string', required: false, description: 'Additional notes' }
    ]
  },

  // Recipes configuration
  recipes: {
    entityType: 'recipe',
    entityLabel: 'Recipes',
    apiEndpoint: '/api/bulk-upload/recipes',
    templateName: 'Recipes Template',
    fields: [
      { key: 'name', label: 'Recipe Name', type: 'string', required: true, description: 'Name of the recipe' },
      { key: 'description', label: 'Description', type: 'string', required: false, description: 'Recipe description' },
      { key: 'category', label: 'Category', type: 'string', required: true, description: 'Recipe category' },
      { key: 'serving_size', label: 'Serving Size', type: 'number', required: true, description: 'Number of servings' },
      { key: 'prep_time_minutes', label: 'Prep Time (min)', type: 'number', required: true, description: 'Preparation time in minutes' },
      { key: 'cook_time_minutes', label: 'Cook Time (min)', type: 'number', required: true, description: 'Cooking time in minutes' },
      { key: 'difficulty_level', label: 'Difficulty', type: 'string', required: false, description: 'Recipe difficulty', options: ['easy', 'medium', 'hard'] },
      { key: 'instructions', label: 'Instructions', type: 'array', required: false, description: 'Instructions', arrayDelimiter: '|' },
      { key: 'notes', label: 'Notes', type: 'string', required: false, description: 'Additional notes' },
      { key: 'allergen_info', label: 'Allergens', type: 'array', required: false, description: 'Allergen information', arrayDelimiter: ',' },
      { key: 'dietary_info', label: 'Dietary Info', type: 'array', required: false, description: 'Dietary information', arrayDelimiter: ',' },
      { key: 'equipment_needed', label: 'Equipment', type: 'array', required: false, description: 'Equipment needed', arrayDelimiter: ',' }
    ]
  },

  // Menu Categories configuration
  menu_categories: {
    entityType: 'menu_category',
    entityLabel: 'Menu Categories',
    apiEndpoint: '/api/bulk-upload/menu-categories',
    templateName: 'Menu Categories Template',
    fields: [
      { key: 'name', label: 'Category Name', type: 'string', required: true, description: 'Name of the menu category' },
      { key: 'description', label: 'Description', type: 'string', required: false, description: 'Category description' },
      { key: 'display_order', label: 'Display Order', type: 'number', required: false, description: 'Display order for sorting (1, 2, 3, etc.)' },
      { key: 'is_active', label: 'Active', type: 'boolean', required: false, description: 'Is category active/available' },
      { key: 'icon', label: 'Icon', type: 'string', required: false, description: 'Category icon', options: ['coffee', 'pizza', 'salad', 'soup', 'dessert', 'wine', 'sandwich', 'utensils', 'chef-hat', 'star'] },
      { key: 'image_url', label: 'Image URL', type: 'string', required: false, description: 'URL to category image' },
      { key: 'available_times', label: 'Available Times', type: 'array', required: false, description: 'Available time slots', arrayDelimiter: ',', options: ['breakfast', 'lunch', 'dinner', 'late_night', 'all_day'] },
      { key: 'parent_category_name', label: 'Parent Category', type: 'string', required: false, description: 'Parent category name (for sub-categories)' },
      { key: 'color_theme', label: 'Color Theme', type: 'string', required: false, description: 'Color theme for category', options: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'indigo', 'gray'] },
      { key: 'sort_priority', label: 'Sort Priority', type: 'string', required: false, description: 'Priority level for sorting', options: ['high', 'medium', 'low'] },
      { key: 'tags', label: 'Tags', type: 'array', required: false, description: 'Category tags for filtering', arrayDelimiter: ',' },
      { key: 'meta_keywords', label: 'Meta Keywords', type: 'array', required: false, description: 'SEO keywords for category', arrayDelimiter: ',' },
      { key: 'dietary_focus', label: 'Dietary Focus', type: 'array', required: false, description: 'Dietary restrictions this category focuses on', arrayDelimiter: ',', options: ['vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'keto', 'halal', 'kosher'] },
      { key: 'preparation_style', label: 'Preparation Style', type: 'string', required: false, description: 'Cooking/preparation style', options: ['grilled', 'fried', 'steamed', 'baked', 'raw', 'tandoor', 'curry', 'stir_fry'] },
      { key: 'spice_level', label: 'Default Spice Level', type: 'string', required: false, description: 'Default spice level for category', options: ['mild', 'medium', 'hot', 'extra_hot'] },
      { key: 'price_range', label: 'Price Range', type: 'string', required: false, description: 'Expected price range', options: ['budget', 'moderate', 'premium', 'luxury'] },
      { key: 'serving_style', label: 'Serving Style', type: 'string', required: false, description: 'How items are typically served', options: ['individual', 'sharing', 'family_style', 'buffet'] },
      { key: 'cuisine_type', label: 'Cuisine Type', type: 'string', required: false, description: 'Type of cuisine', options: ['indian', 'chinese', 'italian', 'mexican', 'american', 'thai', 'japanese', 'mediterranean', 'fusion'] },
      { key: 'temperature_preference', label: 'Temperature', type: 'string', required: false, description: 'Serving temperature preference', options: ['hot', 'cold', 'room_temperature', 'mixed'] },
      { key: 'allergen_warnings', label: 'Allergen Warnings', type: 'array', required: false, description: 'Common allergens in this category', arrayDelimiter: ',', options: ['nuts', 'dairy', 'gluten', 'shellfish', 'eggs', 'soy', 'fish'] },
      { key: 'nutritional_focus', label: 'Nutritional Focus', type: 'array', required: false, description: 'Nutritional highlights', arrayDelimiter: ',', options: ['high_protein', 'low_carb', 'high_fiber', 'low_fat', 'antioxidants', 'vitamins', 'minerals'] },
      { key: 'seasonal_availability', label: 'Seasonal Availability', type: 'array', required: false, description: 'Seasons when category is most relevant', arrayDelimiter: ',', options: ['spring', 'summer', 'fall', 'winter', 'year_round'] },
      { key: 'portion_size', label: 'Typical Portion Size', type: 'string', required: false, description: 'Expected portion size', options: ['small', 'medium', 'large', 'extra_large', 'variable'] },
      { key: 'prep_complexity', label: 'Preparation Complexity', type: 'string', required: false, description: 'Complexity level of preparation', options: ['simple', 'moderate', 'complex', 'expert'] },
      { key: 'kitchen_station', label: 'Kitchen Station', type: 'string', required: false, description: 'Primary kitchen station for preparation', options: ['cold_prep', 'hot_prep', 'grill', 'tandoor', 'fryer', 'steamer', 'salad_station', 'dessert_station'] },
      { key: 'menu_section', label: 'Menu Section', type: 'string', required: false, description: 'Section of menu where category appears', options: ['appetizers', 'soups', 'salads', 'mains', 'sides', 'desserts', 'beverages', 'specials'] },
      { key: 'popularity_score', label: 'Popularity Score', type: 'number', required: false, description: 'Category popularity score (1-10)' },
      { key: 'profit_margin', label: 'Expected Profit Margin', type: 'string', required: false, description: 'Expected profit margin range', options: ['low', 'medium', 'high', 'premium'] },
      { key: 'inventory_type', label: 'Inventory Type', type: 'string', required: false, description: 'Type of inventory management', options: ['fresh', 'frozen', 'dry_goods', 'mixed', 'made_to_order'] },
      { key: 'storage_requirements', label: 'Storage Requirements', type: 'array', required: false, description: 'Special storage needs', arrayDelimiter: ',', options: ['refrigerated', 'frozen', 'dry_storage', 'climate_controlled', 'special_handling'] },
      { key: 'notes', label: 'Notes', type: 'string', required: false, description: 'Additional notes or special instructions' }
    ]
  },

  // Menu Items configuration
  menu_items: {
    entityType: 'menu_item',
    entityLabel: 'Menu Items',
    apiEndpoint: '/api/bulk-upload/menu-items',
    templateName: 'Menu Items Template',
    fields: [
      { key: 'name', label: 'Item Name', type: 'string', required: true, description: 'Name of the menu item' },
      { key: 'description', label: 'Description', type: 'string', required: false, description: 'Menu item description' },
      { key: 'category', label: 'Category', type: 'string', required: true, description: 'Menu category (e.g., appetizers, mains, desserts)' },
      { key: 'base_price', label: 'Base Price', type: 'number', required: true, description: 'Base price of the item' },
      { key: 'preparation_time', label: 'Prep Time (min)', type: 'number', required: false, description: 'Preparation time in minutes' },
      { key: 'calories', label: 'Calories', type: 'number', required: false, description: 'Calorie count' },
      { key: 'spice_level', label: 'Spice Level', type: 'string', required: false, description: 'Spice level', options: ['mild', 'medium', 'hot', 'extra_hot'] },
      { key: 'is_vegetarian', label: 'Vegetarian', type: 'boolean', required: false, description: 'Is vegetarian dish' },
      { key: 'is_vegan', label: 'Vegan', type: 'boolean', required: false, description: 'Is vegan dish' },
      { key: 'is_gluten_free', label: 'Gluten Free', type: 'boolean', required: false, description: 'Is gluten-free dish' },
      { key: 'is_featured', label: 'Featured', type: 'boolean', required: false, description: 'Is featured item' },
      { key: 'is_active', label: 'Active', type: 'boolean', required: false, description: 'Is item active/available' },
      { key: 'display_order', label: 'Display Order', type: 'number', required: false, description: 'Display order on menu' },
      { key: 'image_url', label: 'Image URL', type: 'string', required: false, description: 'URL to item image' },
      { key: 'tags', label: 'Tags', type: 'array', required: false, description: 'Menu item tags', arrayDelimiter: ',' },
      { key: 'available_times', label: 'Available Times', type: 'array', required: false, description: 'Available time slots', arrayDelimiter: ',' },
      { key: 'allergens', label: 'Allergens', type: 'array', required: false, description: 'Allergen information', arrayDelimiter: ',' },
      { key: 'ingredients', label: 'Key Ingredients', type: 'array', required: false, description: 'Key ingredients', arrayDelimiter: ',' },
      { key: 'nutritional_info', label: 'Nutritional Info', type: 'string', required: false, description: 'Additional nutritional information' }
    ]
  },

  // Customers configuration
  customers: {
    entityType: 'customer',
    entityLabel: 'Customers',
    apiEndpoint: '/api/bulk-upload/customers',
    templateName: 'Customers Template',
    fields: [
      { key: 'name', label: 'Customer Name', type: 'string', required: true, description: 'Full name of the customer' },
      { key: 'email', label: 'Email', type: 'string', required: false, description: 'Customer email address' },
      { key: 'phone', label: 'Phone', type: 'string', required: false, description: 'Customer phone number' },
      { key: 'address', label: 'Address', type: 'string', required: false, description: 'Customer address' },
      { key: 'city', label: 'City', type: 'string', required: false, description: 'Customer city' },
      { key: 'state', label: 'State', type: 'string', required: false, description: 'Customer state/province' },
      { key: 'zip_code', label: 'ZIP Code', type: 'string', required: false, description: 'Customer ZIP/postal code' },
      { key: 'country', label: 'Country', type: 'string', required: false, description: 'Customer country' },
      { key: 'date_of_birth', label: 'Date of Birth', type: 'date', required: false, description: 'Customer date of birth (YYYY-MM-DD)' },
      { key: 'customer_type', label: 'Customer Type', type: 'string', required: false, description: 'Type of customer', options: ['regular', 'vip', 'corporate'] },
      { key: 'notes', label: 'Notes', type: 'string', required: false, description: 'Additional customer notes' },
      { key: 'loyalty_points', label: 'Loyalty Points', type: 'number', required: false, description: 'Current loyalty points' },
      { key: 'preferences', label: 'Preferences', type: 'array', required: false, description: 'Customer preferences', arrayDelimiter: ',' },
      { key: 'is_active', label: 'Active', type: 'boolean', required: false, description: 'Is customer active' }
    ]
  },

  // Suppliers configuration
  suppliers: {
    entityType: 'supplier',
    entityLabel: 'Suppliers',
    apiEndpoint: '/api/bulk-upload/suppliers',
    templateName: 'Suppliers Template',
    fields: [
      { key: 'name', label: 'Supplier Name', type: 'string', required: true, description: 'Supplier company name' },
      { key: 'contact_person', label: 'Contact Person', type: 'string', required: false, description: 'Contact person name' },
      { key: 'email', label: 'Email', type: 'string', required: false, description: 'Supplier email' },
      { key: 'phone', label: 'Phone', type: 'string', required: false, description: 'Supplier phone' },
      { key: 'address', label: 'Address', type: 'string', required: false, description: 'Supplier address' },
      { key: 'city', label: 'City', type: 'string', required: false, description: 'Supplier city' },
      { key: 'postal_code', label: 'Postal Code', type: 'string', required: false, description: 'Supplier postal code' },
      { key: 'country', label: 'Country', type: 'string', required: false, description: 'Supplier country' },
      { key: 'tax_number', label: 'Tax Number', type: 'string', required: false, description: 'Tax identification number' },
      { key: 'payment_terms', label: 'Payment Terms', type: 'string', required: false, description: 'Payment terms' },
      { key: 'category', label: 'Category', type: 'string', required: false, description: 'Supplier category' },
      { key: 'notes', label: 'Notes', type: 'string', required: false, description: 'Additional notes' }
    ]
  },

  // Inventory configuration
  inventory: {
    entityType: 'inventory_item',
    entityLabel: 'Inventory Items',
    apiEndpoint: '/api/bulk-upload/inventory',
    templateName: 'Inventory Template',
    fields: [
      // Required fields
      { key: 'product_name', label: 'Product Name', type: 'string', required: true, description: 'Name of the inventory item' },
      { key: 'sku', label: 'SKU', type: 'string', required: true, description: 'Stock Keeping Unit code' },
      { key: 'category', label: 'Category', type: 'string', required: true, description: 'Inventory category (e.g., Dry Goods, Dairy, Produce)' },
      { key: 'unit', label: 'Unit', type: 'string', required: true, description: 'Unit of measurement (e.g., kg, liter, pieces)' },
      { key: 'current_stock', label: 'Current Stock', type: 'number', required: true, description: 'Current stock quantity' },
      { key: 'unit_cost', label: 'Unit Cost', type: 'number', required: true, description: 'Cost per unit' },
      
      // Stock level management
      { key: 'min_stock_level', label: 'Min Stock Level', type: 'number', required: false, description: 'Minimum stock level before reorder' },
      { key: 'max_stock_level', label: 'Max Stock Level', type: 'number', required: false, description: 'Maximum stock level' },
      { key: 'reorder_point', label: 'Reorder Point', type: 'number', required: false, description: 'Stock level to trigger reorder' },
      { key: 'reorder_quantity', label: 'Reorder Quantity', type: 'number', required: false, description: 'Quantity to reorder' },
      
      // Supplier and tracking
      { key: 'supplier_name', label: 'Supplier Name', type: 'string', required: false, description: 'Primary supplier' },
      { key: 'supplier_sku', label: 'Supplier SKU', type: 'string', required: false, description: 'Supplier product code' },
      { key: 'location', label: 'Storage Location', type: 'string', required: false, description: 'Storage location (e.g., Main Storage, Freezer, Dry Storage)' },
      
      // Quality and expiry
      { key: 'batch_number', label: 'Batch Number', type: 'string', required: false, description: 'Current batch number' },
      { key: 'expiry_date', label: 'Expiry Date', type: 'date', required: false, description: 'Expiry date (YYYY-MM-DD format, leave empty if not applicable)' },
      { key: 'storage_conditions', label: 'Storage Conditions', type: 'string', required: false, description: 'Required storage conditions' },
      
      // Environmental tracking
      { key: 'temperature', label: 'Storage Temperature', type: 'number', required: false, description: 'Required storage temperature (°C)' },
      { key: 'humidity', label: 'Storage Humidity', type: 'number', required: false, description: 'Required storage humidity (%)' },
      
      // Analytics and notes
      { key: 'consumption_rate', label: 'Daily Consumption Rate', type: 'number', required: false, description: 'Average daily consumption' },
      { key: 'notes', label: 'Notes', type: 'string', required: false, description: 'Additional notes' }
    ],
    validations: {
      stock_levels: (item: any) => {
        if (item.min_stock_level && item.max_stock_level && item.min_stock_level >= item.max_stock_level) {
          return 'Min stock level must be less than max stock level';
        }
        if (item.reorder_point && item.min_stock_level && item.reorder_point < item.min_stock_level) {
          return 'Reorder point should be greater than or equal to min stock level';
        }
        return null;
      },
      stock_positive: (item: any) => {
        if (item.current_stock < 0) {
          return 'Current stock cannot be negative';
        }
        return null;
      },
      cost_positive: (item: any) => {
        if (item.unit_cost <= 0) {
          return 'Unit cost must be greater than zero';
        }
        return null;
      }
    }
  },

  // Orders configuration
  orders: {
    entityType: 'order',
    entityLabel: 'Orders',
    apiEndpoint: '/api/bulk-upload/orders',
    templateName: 'Orders Template',
    fields: [
      // Required fields
      { key: 'order_number', label: 'Order Number', type: 'string', required: true, description: 'Unique order identifier' },
      { key: 'customer_name', label: 'Customer Name', type: 'string', required: true, description: 'Customer name' },
      { key: 'order_date', label: 'Order Date', type: 'date', required: true, description: 'Order date (YYYY-MM-DD format)' },
      { key: 'total_amount', label: 'Total Amount', type: 'number', required: true, description: 'Total order amount' },
      { key: 'status', label: 'Status', type: 'string', required: true, description: 'Order status', options: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'] },
      
      // Order details
      { key: 'order_type', label: 'Order Type', type: 'string', required: false, description: 'Type of order', options: ['dine_in', 'takeout', 'delivery', 'pickup'] },
      { key: 'table_number', label: 'Table Number', type: 'string', required: false, description: 'Table number for dine-in orders' },
      { key: 'phone_number', label: 'Phone Number', type: 'string', required: false, description: 'Customer phone number' },
      { key: 'email', label: 'Email', type: 'string', required: false, description: 'Customer email address' },
      
      // Payment and timing
      { key: 'payment_method', label: 'Payment Method', type: 'string', required: false, description: 'Payment method', options: ['cash', 'card', 'online', 'mobile_pay'] },
      { key: 'payment_status', label: 'Payment Status', type: 'string', required: false, description: 'Payment status', options: ['pending', 'paid', 'refunded', 'failed'] },
      { key: 'delivery_time', label: 'Delivery Time', type: 'string', required: false, description: 'Requested delivery time' },
      { key: 'special_instructions', label: 'Special Instructions', type: 'string', required: false, description: 'Special instructions for the order' },
      
      // Location and tracking
      { key: 'delivery_address', label: 'Delivery Address', type: 'string', required: false, description: 'Delivery address for delivery orders' },
      { key: 'staff_member', label: 'Staff Member', type: 'string', required: false, description: 'Staff member who took the order' },
      { key: 'notes', label: 'Notes', type: 'string', required: false, description: 'Additional notes' }
    ],
    validations: {
      amount_positive: (item: any) => {
        if (item.total_amount <= 0) {
          return 'Total amount must be greater than zero';
        }
        return null;
      },
      order_date_valid: (item: any) => {
        const orderDate = new Date(item.order_date);
        const today = new Date();
        if (orderDate > today) {
          return 'Order date cannot be in the future';
        }
        return null;
      }
    }
  },

  // Staff configuration
  staff: {
    entityType: 'staff',
    entityLabel: 'Staff Members',
    apiEndpoint: '/api/bulk-upload/staff',
    templateName: 'Staff Template',
    fields: [
      // Required fields
      { key: 'full_name', label: 'Full Name', type: 'string', required: true, description: 'Employee full name' },
      { key: 'email', label: 'Email', type: 'string', required: true, description: 'Employee email address' },
      { key: 'phone', label: 'Phone Number', type: 'string', required: true, description: 'Employee phone number' },
      { key: 'position', label: 'Position', type: 'string', required: true, description: 'Job position', options: ['manager', 'chef', 'server', 'cashier', 'kitchen_staff', 'cleaner', 'host'] },
      { key: 'hire_date', label: 'Hire Date', type: 'date', required: true, description: 'Employee hire date (YYYY-MM-DD format)' },
      
      // Employment details
      { key: 'employee_id', label: 'Employee ID', type: 'string', required: false, description: 'Unique employee identifier' },
      { key: 'department', label: 'Department', type: 'string', required: false, description: 'Department', options: ['kitchen', 'service', 'management', 'cleaning', 'delivery'] },
      { key: 'salary', label: 'Salary', type: 'number', required: false, description: 'Monthly salary' },
      { key: 'hourly_rate', label: 'Hourly Rate', type: 'number', required: false, description: 'Hourly rate for hourly employees' },
      { key: 'employment_type', label: 'Employment Type', type: 'string', required: false, description: 'Type of employment', options: ['full_time', 'part_time', 'contract', 'temporary'] },
      
      // Personal information
      { key: 'address', label: 'Address', type: 'string', required: false, description: 'Employee address' },
      { key: 'emergency_contact', label: 'Emergency Contact', type: 'string', required: false, description: 'Emergency contact name' },
      { key: 'emergency_phone', label: 'Emergency Phone', type: 'string', required: false, description: 'Emergency contact phone' },
      { key: 'date_of_birth', label: 'Date of Birth', type: 'date', required: false, description: 'Employee date of birth (YYYY-MM-DD format)' },
      
      // Work details
      { key: 'shift_schedule', label: 'Shift Schedule', type: 'string', required: false, description: 'Regular shift schedule' },
      { key: 'access_level', label: 'Access Level', type: 'string', required: false, description: 'System access level', options: ['basic', 'advanced', 'admin'] },
      { key: 'notes', label: 'Notes', type: 'string', required: false, description: 'Additional notes' }
    ],
    validations: {
      salary_positive: (item: any) => {
        if (item.salary && item.salary <= 0) {
          return 'Salary must be greater than zero';
        }
        return null;
      },
      hourly_rate_positive: (item: any) => {
        if (item.hourly_rate && item.hourly_rate <= 0) {
          return 'Hourly rate must be greater than zero';
        }
        return null;
      },
      hire_date_valid: (item: any) => {
        const hireDate = new Date(item.hire_date);
        const today = new Date();
        if (hireDate > today) {
          return 'Hire date cannot be in the future';
        }
        return null;
      }
    }
  },

  // Payments configuration
  payments: {
    entityType: 'payment',
    entityLabel: 'Payments',
    apiEndpoint: '/api/bulk-upload/payments',
    templateName: 'Payments Template',
    fields: [
      // Required fields
      { key: 'payment_id', label: 'Payment ID', type: 'string', required: true, description: 'Unique payment identifier' },
      { key: 'order_number', label: 'Order Number', type: 'string', required: true, description: 'Associated order number' },
      { key: 'amount', label: 'Amount', type: 'number', required: true, description: 'Payment amount' },
      { key: 'payment_method', label: 'Payment Method', type: 'string', required: true, description: 'Payment method', options: ['cash', 'card', 'online', 'mobile_pay', 'check'] },
      { key: 'payment_date', label: 'Payment Date', type: 'date', required: true, description: 'Payment date (YYYY-MM-DD format)' },
      { key: 'status', label: 'Status', type: 'string', required: true, description: 'Payment status', options: ['pending', 'completed', 'failed', 'refunded', 'cancelled'] },
      
      // Payment details
      { key: 'transaction_id', label: 'Transaction ID', type: 'string', required: false, description: 'Payment processor transaction ID' },
      { key: 'currency', label: 'Currency', type: 'string', required: false, description: 'Payment currency', options: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'] },
      { key: 'card_last_four', label: 'Card Last Four', type: 'string', required: false, description: 'Last four digits of card (for card payments)' },
      { key: 'card_type', label: 'Card Type', type: 'string', required: false, description: 'Type of card', options: ['visa', 'mastercard', 'amex', 'discover', 'other'] },
      
      // Processing details
      { key: 'processor', label: 'Payment Processor', type: 'string', required: false, description: 'Payment processor used', options: ['stripe', 'paypal', 'square', 'other'] },
      { key: 'processing_fee', label: 'Processing Fee', type: 'number', required: false, description: 'Processing fee charged' },
      { key: 'net_amount', label: 'Net Amount', type: 'number', required: false, description: 'Net amount after fees' },
      { key: 'refund_amount', label: 'Refund Amount', type: 'number', required: false, description: 'Amount refunded (if any)' },
      { key: 'refund_date', label: 'Refund Date', type: 'date', required: false, description: 'Date of refund (YYYY-MM-DD format)' },
      
      // Additional information
      { key: 'customer_name', label: 'Customer Name', type: 'string', required: false, description: 'Customer name' },
      { key: 'staff_member', label: 'Staff Member', type: 'string', required: false, description: 'Staff member who processed payment' },
      { key: 'notes', label: 'Notes', type: 'string', required: false, description: 'Additional notes' }
    ],
    validations: {
      amount_positive: (item: any) => {
        if (item.amount <= 0) {
          return 'Payment amount must be greater than zero';
        }
        return null;
      },
      processing_fee_valid: (item: any) => {
        if (item.processing_fee && item.processing_fee < 0) {
          return 'Processing fee cannot be negative';
        }
        return null;
      },
      net_amount_valid: (item: any) => {
        if (item.net_amount && item.amount && item.processing_fee) {
          const expectedNet = item.amount - item.processing_fee;
          if (Math.abs(item.net_amount - expectedNet) > 0.01) {
            return 'Net amount should equal amount minus processing fee';
          }
        }
        return null;
      }
    }
  }
};

export class UniversalBulkUploadService {
  /**
   * Get entity configuration
   */
  static getEntityConfig(entityType: string): UniversalEntityConfig | null {
    return ENTITY_CONFIGURATIONS[entityType] || null;
  }

  /**
   * Get all available entity types
   */
  static getAvailableEntityTypes(): string[] {
    return Object.keys(ENTITY_CONFIGURATIONS);
  }

  /**
   * Validate data against entity configuration
   */
  static validateData(data: any[], config: UniversalEntityConfig): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    data.forEach((item, index) => {
      config.fields.forEach(field => {
        const value = item[field.key];
        
        // Check required fields
        if (field.required && (value === undefined || value === null || value === '')) {
          errors.push(`Row ${index + 1}: Missing required field "${field.label}"`);
        }

        // Type validation
        if (value !== undefined && value !== null && value !== '') {
          switch (field.type) {
            case 'number':
              if (isNaN(Number(value))) {
                errors.push(`Row ${index + 1}: "${field.label}" must be a number`);
              }
              break;
            case 'boolean':
              if (typeof value !== 'boolean' && !['true', 'false', '1', '0'].includes(String(value).toLowerCase())) {
                errors.push(`Row ${index + 1}: "${field.label}" must be a boolean`);
              }
              break;
            case 'date':
              // Allow null/empty dates for optional fields
              if (value !== null && value !== undefined && value !== '') {
                if (isNaN(Date.parse(value))) {
                  errors.push(`Row ${index + 1}: "${field.label}" must be a valid date (YYYY-MM-DD format)`);
                }
              }
              break;
          }
        }

        // Custom validation
        if (field.validation && value !== undefined && value !== null && value !== '') {
          if (!field.validation(value)) {
            errors.push(`Row ${index + 1}: "${field.label}" validation failed`);
          }
        }

        // Options validation
        if (field.options && value !== undefined && value !== null && value !== '') {
          if (!field.options.includes(String(value))) {
            errors.push(`Row ${index + 1}: "${field.label}" must be one of: ${field.options.join(', ')}`);
          }
        }
      });

      // Custom entity validations
      if (config.validations) {
        Object.entries(config.validations).forEach(([key, validator]) => {
          const error = validator(item, data);
          if (error) {
            errors.push(`Row ${index + 1}: ${error}`);
          }
        });
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Transform data according to field configurations
   */
  static transformData(data: any[], config: UniversalEntityConfig): any[] {
    return data.map(item => {
      const transformedItem: any = {};

      config.fields.forEach(field => {
        let value = item[field.key];

        if (value !== undefined && value !== null && value !== '') {
          // Apply custom transformation
          if (field.transform) {
            value = field.transform(value);
          } else {
            // Default transformations
            switch (field.type) {
              case 'number':
                value = Number(value);
                break;
              case 'boolean':
                value = ['true', '1', 1, true].includes(value);
                break;
              case 'array':
                if (typeof value === 'string') {
                  value = value.split(field.arrayDelimiter || ',').map(v => v.trim()).filter(v => v);
                }
                break;
              case 'date':
                value = new Date(value).toISOString();
                break;
            }
          }
        }

        transformedItem[field.key] = value;
      });

      return transformedItem;
    });
  }


  /**
   * Parse Excel file for entity type
   */
  static async parseExcelFile(file: File, entityType: string): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
  }> {
    const config = this.getEntityConfig(entityType);
    if (!config) {
      return { success: false, error: `Entity type "${entityType}" not supported` };
    }

    try {
      // Use existing Excel parsing logic
      const result = await ExcelTemplateService.parseExcelFile(file, config.fields);
      
      if (!result.success) {
        return result;
      }

      // Validate data
      const validation = this.validateData(result.data!, config);
      if (!validation.valid) {
        return { 
          success: false, 
          error: `Validation failed:\n${validation.errors.join('\n')}` 
        };
      }

      // Transform data
      const transformedData = this.transformData(result.data!, config);

      // Apply preprocessing if defined
      let finalData = transformedData;
      if (config.preprocessing) {
        finalData = await config.preprocessing(transformedData);
      }

      return {
        success: true,
        data: finalData
      };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Generate Excel template for entity type
   */
  static generateExcelTemplate(entityType: string): void {
    const config = this.getEntityConfig(entityType);
    if (!config) {
      console.error(`Entity type "${entityType}" not supported`);
      return;
    }

    // Import XLSX dynamically
    import('xlsx').then(XLSX => {
      // Create sample data with one example row
      const sampleData: any = {};
      config.fields.forEach(field => {
        if (field.required) {
          sampleData[field.label] = this.generateSampleValue(field);
        } else {
          sampleData[field.label] = ''; // Empty for optional fields
        }
      });

      // Create workbook with sample data
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet([sampleData]);
      
      // Set column widths
      const columnWidths = config.fields.map(field => ({
        wch: Math.max(field.label.length, 20)
      }));
      worksheet['!cols'] = columnWidths;
      
      // Add comments with descriptions
      config.fields.forEach((field, index) => {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: index });
        if (worksheet[cellRef]) {
          worksheet[cellRef].c = [{
            a: 'Template',
            t: `${field.description}\n${field.required ? 'REQUIRED' : 'OPTIONAL'}\nType: ${field.type}`
          }];
        }
      });

      XLSX.utils.book_append_sheet(workbook, worksheet, config.entityLabel);
      
      // Create instructions sheet
      const instructions = [
        { Field: 'Instructions', Description: 'How to use this template' },
        { Field: '', Description: '' },
        { Field: 'Required Fields', Description: 'These fields must be filled:' },
        ...config.fields.filter(f => f.required).map(f => ({ 
          Field: f.label, 
          Description: f.description 
        })),
        { Field: '', Description: '' },
        { Field: 'Optional Fields', Description: 'These fields can be left empty:' },
        ...config.fields.filter(f => !f.required).map(f => ({ 
          Field: f.label, 
          Description: f.description 
        })),
        { Field: '', Description: '' },
        { Field: 'Format Guidelines', Description: '' },
        { Field: 'Numbers', Description: 'Use decimal format (e.g., 2.50, 100.00)' },
        { Field: 'Dates', Description: 'Use YYYY-MM-DD format (e.g., 2024-01-15) or leave empty' },
        { Field: 'Yes/No', Description: 'Use true/false, yes/no, or 1/0' },
        { Field: 'Lists', Description: 'Separate multiple values with commas' },
        { Field: 'Empty Fields', Description: 'Leave optional fields empty if not applicable' }
      ];

      const instructionsSheet = XLSX.utils.json_to_sheet(instructions);
      instructionsSheet['!cols'] = [{ wch: 20 }, { wch: 60 }];
      XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

      // Download file
      const filename = `${config.templateName.toLowerCase().replace(/\s+/g, '-')}.xlsx`;
      XLSX.writeFile(workbook, filename);
      
      console.log(`✅ Template downloaded: ${filename}`);
    }).catch(error => {
      console.error('Failed to generate template:', error);
    });
  }

  /**
   * Generate sample value for field
   */
  private static generateSampleValue(field: UniversalFieldConfig): any {
    switch (field.type) {
      case 'string':
        if (field.options) return field.options[0];
        return `Sample ${field.label}`;
      case 'number':
        return field.key.includes('price') || field.key.includes('cost') ? 10.99 : 1;
      case 'boolean':
        return true;
      case 'array':
        return field.options ? field.options.slice(0, 2).join(field.arrayDelimiter || ',') : `Item1${field.arrayDelimiter || ','}Item2`;
      case 'date':
        return new Date().toISOString().split('T')[0];
      default:
        return '';
    }
  }

  /**
   * Upload data to server
   */
  static async uploadData(
    data: any[], 
    entityType: string, 
    organizationId: string
  ): Promise<{
    success: boolean;
    results?: {
      success: number;
      failed: number;
      errors: string[];
      createdIds: string[];
    };
    error?: string;
  }> {
    const config = this.getEntityConfig(entityType);
    if (!config) {
      return { success: false, error: `Entity type "${entityType}" not supported` };
    }

    try {
      const response = await fetch(config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId,
          items: data // Use 'items' key for all entity types
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Upload failed' };
      }

      const result = await response.json();
      
      // Apply postprocessing if defined
      if (config.postprocessing && result.results) {
        await config.postprocessing(result.results, organizationId);
      }

      return {
        success: true,
        results: result.results
      };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }

  /**
   * Register custom entity configuration
   */
  static registerEntityConfig(entityType: string, config: UniversalEntityConfig): void {
    ENTITY_CONFIGURATIONS[entityType] = config;
  }
}

export default UniversalBulkUploadService;