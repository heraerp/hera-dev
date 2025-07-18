/**
 * Create a manual Excel template for menu items bulk upload
 */

const XLSX = require('xlsx');

// Menu items configuration
const menuItemsConfig = {
  entityType: 'menu_item',
  entityLabel: 'Menu Items',
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
};

function generateSampleValue(field) {
  switch (field.type) {
    case 'string':
      if (field.options) return field.options[0];
      return field.required ? `Sample ${field.label}` : '';
    case 'number':
      return field.required ? (field.key.includes('price') ? 10.99 : 1) : '';
    case 'boolean':
      return field.required ? true : '';
    case 'array':
      return field.required ? 'item1,item2' : '';
    default:
      return field.required ? `Sample ${field.label}` : '';
  }
}

function createMenuItemsTemplate() {
  console.log('🚀 Creating Menu Items Excel Template...');
  
  // Create sample data with one example row
  const sampleData = {};
  menuItemsConfig.fields.forEach(field => {
    sampleData[field.label] = generateSampleValue(field);
  });
  
  // Add a few more sample rows for better examples
  const templateData = [
    sampleData,
    {
      "Item Name": "Chicken Tikka Masala",
      "Description": "Creamy tomato-based curry with tender chicken pieces",
      "Category": "Main Course",
      "Base Price": 16.99,
      "Prep Time (min)": 20,
      "Calories": 420,
      "Spice Level": "medium",
      "Vegetarian": false,
      "Vegan": false,
      "Gluten Free": true,
      "Featured": true,
      "Active": true,
      "Display Order": 1,
      "Image URL": "",
      "Tags": "main course,chicken,curry,popular",
      "Available Times": "lunch,dinner",
      "Allergens": "dairy,nuts",
      "Key Ingredients": "chicken,tomatoes,cream,spices",
      "Nutritional Info": "High in protein, moderate calories"
    },
    {
      "Item Name": "Vegetable Samosa",
      "Description": "Crispy pastry filled with spiced potatoes and peas",
      "Category": "Appetizers",
      "Base Price": 6.99,
      "Prep Time (min)": 8,
      "Calories": 150,
      "Spice Level": "mild",
      "Vegetarian": true,
      "Vegan": false,
      "Gluten Free": false,
      "Featured": false,
      "Active": true,
      "Display Order": 2,
      "Image URL": "",
      "Tags": "appetizer,vegetarian,popular",
      "Available Times": "lunch,dinner",
      "Allergens": "wheat,oil",
      "Key Ingredients": "potatoes,peas,spices,pastry",
      "Nutritional Info": "Good source of fiber and vitamins"
    }
  ];
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(templateData);
  
  // Set column widths
  const columnWidths = menuItemsConfig.fields.map(field => ({
    wch: Math.max(field.label.length, 20)
  }));
  worksheet['!cols'] = columnWidths;
  
  // Add the main sheet
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Menu Items');
  
  // Create instructions sheet
  const instructions = [
    { Field: 'MENU ITEMS BULK UPLOAD INSTRUCTIONS', Description: '' },
    { Field: '', Description: '' },
    { Field: 'Required Fields', Description: 'These fields MUST be filled:' },
    { Field: '  • Item Name', Description: 'Name of the menu item' },
    { Field: '  • Category', Description: 'Menu category (e.g., appetizers, mains, desserts)' },
    { Field: '  • Base Price', Description: 'Base price of the item (number format)' },
    { Field: '', Description: '' },
    { Field: 'Optional Fields', Description: 'These fields can be left empty:' },
    { Field: '  • Description', Description: 'Menu item description' },
    { Field: '  • Prep Time (min)', Description: 'Preparation time in minutes (number)' },
    { Field: '  • Calories', Description: 'Calorie count (number)' },
    { Field: '  • Spice Level', Description: 'Use: mild, medium, hot, or extra_hot' },
    { Field: '  • Vegetarian', Description: 'Use: true or false' },
    { Field: '  • Vegan', Description: 'Use: true or false' },
    { Field: '  • Gluten Free', Description: 'Use: true or false' },
    { Field: '  • Featured', Description: 'Use: true or false' },
    { Field: '  • Active', Description: 'Use: true or false' },
    { Field: '  • Display Order', Description: 'Display order on menu (number)' },
    { Field: '  • Image URL', Description: 'URL to item image' },
    { Field: '  • Tags', Description: 'Comma-separated tags' },
    { Field: '  • Available Times', Description: 'Comma-separated time slots' },
    { Field: '  • Allergens', Description: 'Comma-separated allergen information' },
    { Field: '  • Key Ingredients', Description: 'Comma-separated key ingredients' },
    { Field: '  • Nutritional Info', Description: 'Additional nutritional information' },
    { Field: '', Description: '' },
    { Field: 'Format Guidelines', Description: '' },
    { Field: '  • Numbers', Description: 'Use decimal format (e.g., 2.50, 100.00)' },
    { Field: '  • Yes/No', Description: 'Use true/false or leave empty' },
    { Field: '  • Lists', Description: 'Separate multiple values with commas' },
    { Field: '  • Empty Fields', Description: 'Leave optional fields empty if not applicable' },
    { Field: '', Description: '' },
    { Field: 'Upload Process', Description: '' },
    { Field: '  1. Fill in your menu items data', Description: 'Use the Menu Items sheet' },
    { Field: '  2. Save file as .xlsx format', Description: 'Keep the Excel format' },
    { Field: '  3. Upload through bulk upload interface', Description: 'Use the web interface' },
    { Field: '  4. Review any validation errors', Description: 'Fix any issues reported' },
    { Field: '  5. Confirm import', Description: 'Add items to your menu' }
  ];
  
  const instructionsSheet = XLSX.utils.json_to_sheet(instructions);
  instructionsSheet['!cols'] = [{ wch: 40 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');
  
  // Download file
  const filename = 'menu-items-template.xlsx';
  XLSX.writeFile(workbook, filename);
  
  console.log(`✅ Template created successfully: ${filename}`);
  console.log('📋 Template includes:');
  console.log('   - Menu Items sheet with sample data');
  console.log('   - Instructions sheet with detailed guidelines');
  console.log('   - Proper column widths for readability');
  console.log(`   - ${menuItemsConfig.fields.length} fields including all menu item attributes`);
  
  return filename;
}

// Create the template
const filename = createMenuItemsTemplate();

console.log('\n🎯 Template Usage:');
console.log('1. Open the generated Excel file');
console.log('2. Replace sample data with your actual menu items');
console.log('3. Follow the format guidelines in the Instructions sheet');
console.log('4. Save and upload through the bulk upload interface');
console.log('\n📊 Template ready for Indian restaurant menu items!');