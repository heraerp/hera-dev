/**
 * Create Excel template filled with Indian restaurant menu items
 */

const XLSX = require('xlsx');
const { indianMenuItems } = require('./test-indian-menu-items');

function createIndianMenuTemplate() {
  console.log('🚀 Creating Indian Restaurant Menu Template...');
  
  // Transform Indian menu items to match template format
  const templateData = indianMenuItems.map(item => ({
    "Item Name": item.name,
    "Description": item.description,
    "Category": item.category,
    "Base Price": item.base_price,
    "Prep Time (min)": item.preparation_time,
    "Calories": item.calories,
    "Spice Level": item.spice_level,
    "Vegetarian": item.is_vegetarian,
    "Vegan": item.is_vegan,
    "Gluten Free": item.is_gluten_free,
    "Featured": item.is_featured,
    "Active": item.is_active,
    "Display Order": item.display_order,
    "Image URL": item.image_url || '',
    "Tags": item.tags,
    "Available Times": item.available_times,
    "Allergens": item.allergens,
    "Key Ingredients": item.ingredients,
    "Nutritional Info": item.nutritional_info
  }));
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(templateData);
  
  // Set column widths
  const columnWidths = [
    { wch: 25 }, // Item Name
    { wch: 50 }, // Description
    { wch: 15 }, // Category
    { wch: 12 }, // Base Price
    { wch: 12 }, // Prep Time
    { wch: 10 }, // Calories
    { wch: 12 }, // Spice Level
    { wch: 12 }, // Vegetarian
    { wch: 10 }, // Vegan
    { wch: 12 }, // Gluten Free
    { wch: 12 }, // Featured
    { wch: 10 }, // Active
    { wch: 12 }, // Display Order
    { wch: 20 }, // Image URL
    { wch: 30 }, // Tags
    { wch: 20 }, // Available Times
    { wch: 20 }, // Allergens
    { wch: 40 }, // Key Ingredients
    { wch: 40 }  // Nutritional Info
  ];
  worksheet['!cols'] = columnWidths;
  
  // Add the main sheet
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Indian Menu Items');
  
  // Create summary sheet
  const summary = [
    { Category: 'Indian Restaurant Menu Summary', Count: '' },
    { Category: '', Count: '' },
    { Category: 'Total Items', Count: indianMenuItems.length },
    { Category: 'Vegetarian Items', Count: indianMenuItems.filter(item => item.is_vegetarian).length },
    { Category: 'Vegan Items', Count: indianMenuItems.filter(item => item.is_vegan).length },
    { Category: 'Gluten-Free Items', Count: indianMenuItems.filter(item => item.is_gluten_free).length },
    { Category: 'Featured Items', Count: indianMenuItems.filter(item => item.is_featured).length },
    { Category: '', Count: '' },
    { Category: 'Categories:', Count: '' },
    { Category: 'Appetizers', Count: indianMenuItems.filter(item => item.category === 'Appetizers').length },
    { Category: 'Main Course', Count: indianMenuItems.filter(item => item.category === 'Main Course').length },
    { Category: 'Breads', Count: indianMenuItems.filter(item => item.category === 'Breads').length },
    { Category: 'Beverages', Count: indianMenuItems.filter(item => item.category === 'Beverages').length },
    { Category: 'Desserts', Count: indianMenuItems.filter(item => item.category === 'Desserts').length },
    { Category: '', Count: '' },
    { Category: 'Price Range:', Count: '' },
    { Category: 'Lowest Price', Count: `$${Math.min(...indianMenuItems.map(item => item.base_price)).toFixed(2)}` },
    { Category: 'Highest Price', Count: `$${Math.max(...indianMenuItems.map(item => item.base_price)).toFixed(2)}` },
    { Category: 'Average Price', Count: `$${(indianMenuItems.reduce((sum, item) => sum + item.base_price, 0) / indianMenuItems.length).toFixed(2)}` }
  ];
  
  const summarySheet = XLSX.utils.json_to_sheet(summary);
  summarySheet['!cols'] = [{ wch: 25 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  
  // Download file
  const filename = 'indian-restaurant-menu-template.xlsx';
  XLSX.writeFile(workbook, filename);
  
  console.log(`✅ Indian menu template created: ${filename}`);
  console.log('📊 Template Statistics:');
  console.log(`   - Total Items: ${indianMenuItems.length}`);
  console.log(`   - Categories: ${[...new Set(indianMenuItems.map(item => item.category))].length}`);
  console.log(`   - Vegetarian: ${indianMenuItems.filter(item => item.is_vegetarian).length}`);
  console.log(`   - Vegan: ${indianMenuItems.filter(item => item.is_vegan).length}`);
  console.log(`   - Gluten-Free: ${indianMenuItems.filter(item => item.is_gluten_free).length}`);
  console.log(`   - Featured: ${indianMenuItems.filter(item => item.is_featured).length}`);
  console.log(`   - Price Range: $${Math.min(...indianMenuItems.map(item => item.base_price)).toFixed(2)} - $${Math.max(...indianMenuItems.map(item => item.base_price)).toFixed(2)}`);
  
  return filename;
}

// Create the template
const filename = createIndianMenuTemplate();

console.log('\n🎯 Ready for Testing:');
console.log('1. The template contains 17 authentic Indian restaurant menu items');
console.log('2. All fields are properly formatted for bulk upload');
console.log('3. Data includes dietary restrictions, allergens, and nutritional info');
console.log('4. Template can be uploaded directly through the bulk upload interface');
console.log('\n✅ Indian restaurant menu template ready for bulk upload testing!');