/**
 * Excel Template Service - HERA Universal
 * Handles Excel template generation and bulk upload processing
 */

import * as XLSX from 'xlsx';

export interface IngredientTemplate {
  name: string;
  unit: string;
  cost_per_unit: number;
  supplier: string;
  category: string;
  stock_level?: number;
  min_stock_level?: number;
  max_stock_level?: number;
  supplier_sku?: string;
  storage_location?: string;
  expiry_days?: number;
  notes?: string;
}

export interface RecipeTemplate {
  name: string;
  description: string;
  category: string;
  serving_size: number;
  prep_time_minutes: number;
  cook_time_minutes: number;
  difficulty_level: 'easy' | 'medium' | 'hard';
  instructions: string;
  notes?: string;
  allergen_info?: string;
  dietary_info?: string;
  equipment_needed?: string;
}

export interface RecipeIngredientTemplate {
  recipe_name: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  preparation_notes?: string;
  is_optional?: boolean;
  substitutes?: string;
}

export class ExcelTemplateService {
  
  /**
   * Universal Excel file parser
   */
  static parseExcelFile(file: File, fieldConfigs: any[]): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
  }> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get first worksheet
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
          
          // Transform data according to field configs
          const transformedData = jsonData.map((row, index) => {
            const transformedRow: any = {};
            
            fieldConfigs.forEach(fieldConfig => {
              const value = row[fieldConfig.label] || row[fieldConfig.key];
              
              if (value !== undefined && value !== null && value !== '') {
                // Apply transformation based on field type
                switch (fieldConfig.type) {
                  case 'number':
                    transformedRow[fieldConfig.key] = parseFloat(value);
                    break;
                  case 'boolean':
                    transformedRow[fieldConfig.key] = ['true', '1', 1, true].includes(value);
                    break;
                  case 'array':
                    transformedRow[fieldConfig.key] = typeof value === 'string' 
                      ? value.split(fieldConfig.arrayDelimiter || ',').map(v => v.trim()).filter(v => v)
                      : value;
                    break;
                  case 'date':
                    try {
                      // Handle different date formats
                      let dateValue;
                      if (typeof value === 'number') {
                        // Excel serial date number
                        dateValue = XLSX.SSF.parse_date_code(value);
                        transformedRow[fieldConfig.key] = new Date(dateValue.y, dateValue.m - 1, dateValue.d).toISOString().split('T')[0];
                      } else if (typeof value === 'string') {
                        // String date
                        const parsedDate = new Date(value);
                        if (isNaN(parsedDate.getTime())) {
                          // Try different date formats
                          const dateFormats = [
                            /(\d{4}-\d{2}-\d{2})/,  // YYYY-MM-DD
                            /(\d{2}\/\d{2}\/\d{4})/, // MM/DD/YYYY
                            /(\d{2}-\d{2}-\d{4})/,  // MM-DD-YYYY
                            /(\d{4}\/\d{2}\/\d{2})/, // YYYY/MM/DD
                          ];
                          
                          let dateStr = value;
                          for (const format of dateFormats) {
                            const match = dateStr.match(format);
                            if (match) {
                              const testDate = new Date(match[1]);
                              if (!isNaN(testDate.getTime())) {
                                transformedRow[fieldConfig.key] = testDate.toISOString().split('T')[0];
                                break;
                              }
                            }
                          }
                          
                          if (!transformedRow[fieldConfig.key]) {
                            transformedRow[fieldConfig.key] = null; // Invalid date
                          }
                        } else {
                          transformedRow[fieldConfig.key] = parsedDate.toISOString().split('T')[0];
                        }
                      } else {
                        transformedRow[fieldConfig.key] = null;
                      }
                    } catch (error) {
                      console.warn(`Date parsing error for value "${value}":`, error);
                      transformedRow[fieldConfig.key] = null;
                    }
                    break;
                  default:
                    transformedRow[fieldConfig.key] = String(value).trim();
                }
              } else {
                transformedRow[fieldConfig.key] = value;
              }
            });
            
            return transformedRow;
          });

          console.log(`✅ Parsed ${transformedData.length} items from Excel`);
          resolve({
            success: true,
            data: transformedData
          });

        } catch (error) {
          console.error('❌ Error parsing Excel file:', error);
          resolve({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to parse Excel file'
          });
        }
      };

      reader.onerror = () => {
        resolve({
          success: false,
          error: 'Failed to read file'
        });
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Download template with data
   */
  static downloadTemplate(data: { [sheetName: string]: any[] }, filename: string): void {
    const workbook = XLSX.utils.book_new();
    
    Object.entries(data).forEach(([sheetName, sheetData]) => {
      const worksheet = XLSX.utils.json_to_sheet(sheetData);
      
      // Auto-adjust column widths
      const columnWidths = Object.keys(sheetData[0] || {}).map(key => ({
        wch: Math.max(key.length, 20)
      }));
      worksheet['!cols'] = columnWidths;
      
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    XLSX.writeFile(workbook, filename);
    console.log(`✅ Template downloaded: ${filename}`);
  }

  /**
   * Generate Excel template for ingredients
   */
  static generateIngredientTemplate(): void {
    console.log('📊 Generating ingredient template...');

    // Sample data for template
    const sampleData: IngredientTemplate[] = [
      {
        name: 'Wheat Flour',
        unit: 'kg',
        cost_per_unit: 2.50,
        supplier: 'Grain Suppliers Inc',
        category: 'Baking',
        stock_level: 50,
        min_stock_level: 10,
        max_stock_level: 100,
        supplier_sku: 'WHEAT-001',
        storage_location: 'Dry Storage A1',
        expiry_days: 365,
        notes: 'Store in cool, dry place'
      },
      {
        name: 'Olive Oil',
        unit: 'L',
        cost_per_unit: 12.00,
        supplier: 'Mediterranean Imports',
        category: 'Oils & Vinegars',
        stock_level: 24,
        min_stock_level: 5,
        max_stock_level: 50,
        supplier_sku: 'OIL-EVV-001',
        storage_location: 'Pantry B2',
        expiry_days: 730,
        notes: 'Extra virgin olive oil'
      },
      {
        name: 'Mozzarella Cheese',
        unit: 'kg',
        cost_per_unit: 15.00,
        supplier: 'Dairy Fresh Co',
        category: 'Dairy',
        stock_level: 12,
        min_stock_level: 3,
        max_stock_level: 25,
        supplier_sku: 'MOZZ-001',
        storage_location: 'Refrigerator C1',
        expiry_days: 14,
        notes: 'Keep refrigerated'
      }
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(sampleData);

    // Set column widths
    const columnWidths = [
      { wch: 20 }, // name
      { wch: 8 },  // unit
      { wch: 12 }, // cost_per_unit
      { wch: 20 }, // supplier
      { wch: 15 }, // category
      { wch: 12 }, // stock_level
      { wch: 12 }, // min_stock_level
      { wch: 12 }, // max_stock_level
      { wch: 15 }, // supplier_sku
      { wch: 18 }, // storage_location
      { wch: 12 }, // expiry_days
      { wch: 30 }  // notes
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ingredients');

    // Generate and download file
    XLSX.writeFile(workbook, 'ingredient-template.xlsx');
    console.log('✅ Ingredient template generated: ingredient-template.xlsx');
  }

  /**
   * Generate Excel template for recipes
   */
  static generateRecipeTemplate(): void {
    console.log('📊 Generating recipe template...');

    // Sample data for recipes
    const sampleRecipes: RecipeTemplate[] = [
      {
        name: 'Classic Margherita Pizza',
        description: 'Traditional Italian pizza with fresh mozzarella and basil',
        category: 'Pizza',
        serving_size: 1,
        prep_time_minutes: 20,
        cook_time_minutes: 12,
        difficulty_level: 'medium',
        instructions: 'Step 1: Prepare dough|Step 2: Add sauce|Step 3: Add cheese|Step 4: Bake',
        notes: 'Use high-quality San Marzano tomatoes',
        allergen_info: 'gluten,dairy',
        dietary_info: 'vegetarian',
        equipment_needed: 'pizza stone,pizza peel'
      },
      {
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with classic Caesar dressing',
        category: 'Salad',
        serving_size: 1,
        prep_time_minutes: 10,
        cook_time_minutes: 0,
        difficulty_level: 'easy',
        instructions: 'Step 1: Wash lettuce|Step 2: Make dressing|Step 3: Toss and serve',
        notes: 'Best served immediately',
        allergen_info: 'dairy,eggs,fish',
        dietary_info: '',
        equipment_needed: 'mixing bowl,whisk'
      }
    ];

    // Sample data for recipe ingredients
    const sampleIngredients: RecipeIngredientTemplate[] = [
      {
        recipe_name: 'Classic Margherita Pizza',
        ingredient_name: 'Wheat Flour',
        quantity: 0.250,
        unit: 'kg',
        preparation_notes: 'Sift before use',
        is_optional: false,
        substitutes: 'Tipo 00 flour'
      },
      {
        recipe_name: 'Classic Margherita Pizza',
        ingredient_name: 'Mozzarella Cheese',
        quantity: 0.150,
        unit: 'kg',
        preparation_notes: 'Slice thinly',
        is_optional: false,
        substitutes: 'Buffalo mozzarella'
      },
      {
        recipe_name: 'Caesar Salad',
        ingredient_name: 'Olive Oil',
        quantity: 0.030,
        unit: 'L',
        preparation_notes: 'Use for dressing',
        is_optional: false,
        substitutes: 'Vegetable oil'
      }
    ];

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Create recipes worksheet
    const recipesWorksheet = XLSX.utils.json_to_sheet(sampleRecipes);
    recipesWorksheet['!cols'] = [
      { wch: 25 }, // name
      { wch: 40 }, // description
      { wch: 15 }, // category
      { wch: 12 }, // serving_size
      { wch: 12 }, // prep_time_minutes
      { wch: 12 }, // cook_time_minutes
      { wch: 12 }, // difficulty_level
      { wch: 50 }, // instructions
      { wch: 30 }, // notes
      { wch: 20 }, // allergen_info
      { wch: 20 }, // dietary_info
      { wch: 20 }  // equipment_needed
    ];
    XLSX.utils.book_append_sheet(workbook, recipesWorksheet, 'Recipes');

    // Create recipe ingredients worksheet
    const ingredientsWorksheet = XLSX.utils.json_to_sheet(sampleIngredients);
    ingredientsWorksheet['!cols'] = [
      { wch: 25 }, // recipe_name
      { wch: 20 }, // ingredient_name
      { wch: 12 }, // quantity
      { wch: 8 },  // unit
      { wch: 25 }, // preparation_notes
      { wch: 12 }, // is_optional
      { wch: 20 }  // substitutes
    ];
    XLSX.utils.book_append_sheet(workbook, ingredientsWorksheet, 'Recipe Ingredients');

    // Generate and download file
    XLSX.writeFile(workbook, 'recipe-template.xlsx');
    console.log('✅ Recipe template generated: recipe-template.xlsx');
  }

  /**
   * Parse uploaded Excel file for ingredients
   */
  static parseIngredientsFromExcel(file: File): Promise<{
    success: boolean;
    data?: IngredientTemplate[];
    error?: string;
  }> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get first worksheet
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
          
          // Validate and transform data
          const ingredients: IngredientTemplate[] = jsonData.map((row, index) => {
            // Validate required fields
            if (!row.name || !row.unit || !row.cost_per_unit || !row.supplier || !row.category) {
              throw new Error(`Row ${index + 2}: Missing required fields (name, unit, cost_per_unit, supplier, category)`);
            }

            // Validate cost_per_unit is a number
            const costPerUnit = parseFloat(row.cost_per_unit);
            if (isNaN(costPerUnit) || costPerUnit <= 0) {
              throw new Error(`Row ${index + 2}: cost_per_unit must be a positive number`);
            }

            return {
              name: String(row.name).trim(),
              unit: String(row.unit).trim(),
              cost_per_unit: costPerUnit,
              supplier: String(row.supplier).trim(),
              category: String(row.category).trim(),
              stock_level: row.stock_level ? parseFloat(row.stock_level) : undefined,
              min_stock_level: row.min_stock_level ? parseFloat(row.min_stock_level) : undefined,
              max_stock_level: row.max_stock_level ? parseFloat(row.max_stock_level) : undefined,
              supplier_sku: row.supplier_sku ? String(row.supplier_sku).trim() : undefined,
              storage_location: row.storage_location ? String(row.storage_location).trim() : undefined,
              expiry_days: row.expiry_days ? parseInt(row.expiry_days) : undefined,
              notes: row.notes ? String(row.notes).trim() : undefined
            };
          });

          console.log(`✅ Parsed ${ingredients.length} ingredients from Excel`);
          resolve({
            success: true,
            data: ingredients
          });

        } catch (error) {
          console.error('❌ Error parsing Excel file:', error);
          resolve({
            success: false,
            error: error.message || 'Failed to parse Excel file'
          });
        }
      };

      reader.onerror = () => {
        resolve({
          success: false,
          error: 'Failed to read file'
        });
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Parse uploaded Excel file for recipes
   */
  static parseRecipesFromExcel(file: File): Promise<{
    success: boolean;
    data?: {
      recipes: RecipeTemplate[];
      ingredients: RecipeIngredientTemplate[];
    };
    error?: string;
  }> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Parse recipes sheet
          const recipesSheet = workbook.Sheets['Recipes'];
          if (!recipesSheet) {
            throw new Error('Recipes sheet not found');
          }
          
          const recipesData = XLSX.utils.sheet_to_json(recipesSheet) as any[];
          
          const recipes: RecipeTemplate[] = recipesData.map((row, index) => {
            // Validate required fields
            if (!row.name || !row.category || !row.serving_size || !row.prep_time_minutes || !row.cook_time_minutes) {
              throw new Error(`Recipes Row ${index + 2}: Missing required fields`);
            }

            return {
              name: String(row.name).trim(),
              description: String(row.description || '').trim(),
              category: String(row.category).trim(),
              serving_size: parseInt(row.serving_size),
              prep_time_minutes: parseInt(row.prep_time_minutes),
              cook_time_minutes: parseInt(row.cook_time_minutes),
              difficulty_level: (row.difficulty_level || 'easy') as 'easy' | 'medium' | 'hard',
              instructions: String(row.instructions || '').trim(),
              notes: row.notes ? String(row.notes).trim() : undefined,
              allergen_info: row.allergen_info ? String(row.allergen_info).trim() : undefined,
              dietary_info: row.dietary_info ? String(row.dietary_info).trim() : undefined,
              equipment_needed: row.equipment_needed ? String(row.equipment_needed).trim() : undefined
            };
          });

          // Parse recipe ingredients sheet
          const ingredientsSheet = workbook.Sheets['Recipe Ingredients'];
          if (!ingredientsSheet) {
            throw new Error('Recipe Ingredients sheet not found');
          }
          
          const ingredientsData = XLSX.utils.sheet_to_json(ingredientsSheet) as any[];
          
          const ingredients: RecipeIngredientTemplate[] = ingredientsData.map((row, index) => {
            // Validate required fields
            if (!row.recipe_name || !row.ingredient_name || !row.quantity || !row.unit) {
              throw new Error(`Recipe Ingredients Row ${index + 2}: Missing required fields`);
            }

            return {
              recipe_name: String(row.recipe_name).trim(),
              ingredient_name: String(row.ingredient_name).trim(),
              quantity: parseFloat(row.quantity),
              unit: String(row.unit).trim(),
              preparation_notes: row.preparation_notes ? String(row.preparation_notes).trim() : undefined,
              is_optional: row.is_optional ? Boolean(row.is_optional) : false,
              substitutes: row.substitutes ? String(row.substitutes).trim() : undefined
            };
          });

          console.log(`✅ Parsed ${recipes.length} recipes and ${ingredients.length} ingredients from Excel`);
          resolve({
            success: true,
            data: {
              recipes,
              ingredients
            }
          });

        } catch (error) {
          console.error('❌ Error parsing Excel file:', error);
          resolve({
            success: false,
            error: error.message || 'Failed to parse Excel file'
          });
        }
      };

      reader.onerror = () => {
        resolve({
          success: false,
          error: 'Failed to read file'
        });
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Generate comprehensive template with instructions
   */
  static generateComprehensiveTemplate(): void {
    console.log('📊 Generating comprehensive template...');

    const workbook = XLSX.utils.book_new();

    // Instructions sheet
    const instructions = [
      { section: 'BULK UPLOAD INSTRUCTIONS', content: '' },
      { section: '', content: '' },
      { section: '1. INGREDIENT TEMPLATE', content: '' },
      { section: '   - Fill out the "Ingredients" sheet', content: '' },
      { section: '   - Required fields: name, unit, cost_per_unit, supplier, category', content: '' },
      { section: '   - Optional fields: stock_level, min_stock_level, max_stock_level, supplier_sku, storage_location, expiry_days, notes', content: '' },
      { section: '', content: '' },
      { section: '2. RECIPE TEMPLATE', content: '' },
      { section: '   - Fill out the "Recipes" sheet for recipe information', content: '' },
      { section: '   - Fill out the "Recipe Ingredients" sheet for recipe ingredients', content: '' },
      { section: '   - Required fields (Recipes): name, category, serving_size, prep_time_minutes, cook_time_minutes', content: '' },
      { section: '   - Required fields (Recipe Ingredients): recipe_name, ingredient_name, quantity, unit', content: '' },
      { section: '', content: '' },
      { section: '3. FIELD FORMATS', content: '' },
      { section: '   - cost_per_unit: Number (e.g., 2.50)', content: '' },
      { section: '   - serving_size: Number (e.g., 4)', content: '' },
      { section: '   - prep_time_minutes: Number (e.g., 15)', content: '' },
      { section: '   - cook_time_minutes: Number (e.g., 30)', content: '' },
      { section: '   - difficulty_level: easy, medium, or hard', content: '' },
      { section: '   - instructions: Use | to separate steps', content: '' },
      { section: '   - allergen_info: Comma-separated (e.g., gluten,dairy)', content: '' },
      { section: '   - dietary_info: Comma-separated (e.g., vegetarian,gluten-free)', content: '' },
      { section: '   - equipment_needed: Comma-separated (e.g., mixing bowl,whisk)', content: '' },
      { section: '', content: '' },
      { section: '4. UPLOAD PROCESS', content: '' },
      { section: '   - Save file as .xlsx format', content: '' },
      { section: '   - Upload through the bulk upload interface', content: '' },
      { section: '   - Review any validation errors', content: '' },
      { section: '   - Confirm import to add to your inventory', content: '' }
    ];

    const instructionsSheet = XLSX.utils.json_to_sheet(instructions);
    instructionsSheet['!cols'] = [{ wch: 50 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

    // Add ingredient template sheet
    const ingredientSample: IngredientTemplate[] = [
      {
        name: 'Wheat Flour',
        unit: 'kg',
        cost_per_unit: 2.50,
        supplier: 'Grain Suppliers Inc',
        category: 'Baking',
        stock_level: 50,
        min_stock_level: 10,
        max_stock_level: 100,
        supplier_sku: 'WHEAT-001',
        storage_location: 'Dry Storage A1',
        expiry_days: 365,
        notes: 'Store in cool, dry place'
      }
    ];

    const ingredientSheet = XLSX.utils.json_to_sheet(ingredientSample);
    ingredientSheet['!cols'] = [
      { wch: 20 }, { wch: 8 }, { wch: 12 }, { wch: 20 }, { wch: 15 },
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 18 },
      { wch: 12 }, { wch: 30 }
    ];
    XLSX.utils.book_append_sheet(workbook, ingredientSheet, 'Ingredients');

    // Add recipe template sheets
    const recipeSample: RecipeTemplate[] = [
      {
        name: 'Classic Margherita Pizza',
        description: 'Traditional Italian pizza with fresh mozzarella and basil',
        category: 'Pizza',
        serving_size: 1,
        prep_time_minutes: 20,
        cook_time_minutes: 12,
        difficulty_level: 'medium',
        instructions: 'Step 1: Prepare dough|Step 2: Add sauce|Step 3: Add cheese|Step 4: Bake',
        notes: 'Use high-quality San Marzano tomatoes',
        allergen_info: 'gluten,dairy',
        dietary_info: 'vegetarian',
        equipment_needed: 'pizza stone,pizza peel'
      }
    ];

    const recipeSheet = XLSX.utils.json_to_sheet(recipeSample);
    recipeSheet['!cols'] = [
      { wch: 25 }, { wch: 40 }, { wch: 15 }, { wch: 12 }, { wch: 12 },
      { wch: 12 }, { wch: 12 }, { wch: 50 }, { wch: 30 }, { wch: 20 },
      { wch: 20 }, { wch: 20 }
    ];
    XLSX.utils.book_append_sheet(workbook, recipeSheet, 'Recipes');

    const recipeIngredientSample: RecipeIngredientTemplate[] = [
      {
        recipe_name: 'Classic Margherita Pizza',
        ingredient_name: 'Wheat Flour',
        quantity: 0.250,
        unit: 'kg',
        preparation_notes: 'Sift before use',
        is_optional: false,
        substitutes: 'Tipo 00 flour'
      }
    ];

    const recipeIngredientSheet = XLSX.utils.json_to_sheet(recipeIngredientSample);
    recipeIngredientSheet['!cols'] = [
      { wch: 25 }, { wch: 20 }, { wch: 12 }, { wch: 8 },
      { wch: 25 }, { wch: 12 }, { wch: 20 }
    ];
    XLSX.utils.book_append_sheet(workbook, recipeIngredientSheet, 'Recipe Ingredients');

    // Generate and download file
    XLSX.writeFile(workbook, 'hera-universal-template.xlsx');
    console.log('✅ Comprehensive template generated: hera-universal-template.xlsx');
  }
}