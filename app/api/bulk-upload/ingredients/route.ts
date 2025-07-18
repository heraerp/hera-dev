/**
 * Bulk Upload Ingredients API Route
 * Handles bulk creation of ingredients from Excel data
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service key client for bypassing RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!}`
      }
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    const { organizationId, ingredients } = await request.json();
    
    if (!organizationId || !ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json(
        { error: 'Organization ID and ingredients array are required' },
        { status: 400 }
      );
    }

    console.log('📤 Bulk uploading', ingredients.length, 'ingredients for organization:', organizationId);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      createdIds: [] as string[]
    };

    // Process each ingredient
    for (let i = 0; i < ingredients.length; i++) {
      const ingredient = ingredients[i];
      
      try {
        // Validate required fields
        if (!ingredient.name || !ingredient.unit || !ingredient.cost_per_unit || !ingredient.supplier || !ingredient.category) {
          throw new Error(`Row ${i + 1}: Missing required fields`);
        }

        // Generate IDs
        const ingredientId = crypto.randomUUID();
        const ingredientCode = `ING-${ingredient.name.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        // Create ingredient entity
        const { error: entityError } = await supabaseAdmin
          .from('core_entities')
          .insert({
            id: ingredientId,
            organization_id: organizationId,
            entity_type: 'ingredient',
            entity_name: ingredient.name,
            entity_code: ingredientCode,
            is_active: true
          });

        if (entityError) {
          throw new Error(`Entity creation failed: ${entityError.message}`);
        }

        // Create ingredient details metadata
        const ingredientDetails = {
          unit: ingredient.unit,
          cost_per_unit: parseFloat(ingredient.cost_per_unit),
          supplier: ingredient.supplier,
          category: ingredient.category,
          supplier_sku: ingredient.supplier_sku,
          storage_location: ingredient.storage_location,
          expiry_days: ingredient.expiry_days ? parseInt(ingredient.expiry_days) : undefined
        };

        const { error: metadataError } = await supabaseAdmin
          .from('core_metadata')
          .insert({
            organization_id: organizationId,
            entity_type: 'ingredient',
            entity_id: ingredientId,
            metadata_type: 'ingredient_details',
            metadata_category: 'ingredient_information',
            metadata_key: 'ingredient_details',
            metadata_value: JSON.stringify(ingredientDetails),
            created_by: '16848910-d8cf-462b-a4d2-f94ac253d698' // Valid user ID
          });

        if (metadataError) {
          throw new Error(`Metadata creation failed: ${metadataError.message}`);
        }

        // Create inventory information
        const inventoryInfo = {
          stock_level: ingredient.stock_level ? parseFloat(ingredient.stock_level) : 0,
          min_stock_level: ingredient.min_stock_level ? parseFloat(ingredient.min_stock_level) : 0,
          max_stock_level: ingredient.max_stock_level ? parseFloat(ingredient.max_stock_level) : 0,
          reorder_point: ingredient.min_stock_level ? parseFloat(ingredient.min_stock_level) : 0,
          last_stock_update: new Date().toISOString()
        };

        const { error: inventoryError } = await supabaseAdmin
          .from('core_metadata')
          .insert({
            organization_id: organizationId,
            entity_type: 'ingredient',
            entity_id: ingredientId,
            metadata_type: 'inventory_info',
            metadata_category: 'inventory',
            metadata_key: 'inventory_info',
            metadata_value: JSON.stringify(inventoryInfo),
            created_by: '16848910-d8cf-462b-a4d2-f94ac253d698' // Valid user ID
          });

        if (inventoryError) {
          throw new Error(`Inventory creation failed: ${inventoryError.message}`);
        }

        results.success++;
        results.createdIds.push(ingredientId);
        console.log(`✅ Created ingredient ${i + 1}/${ingredients.length}: ${ingredient.name}`);

      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${i + 1} (${ingredient.name || 'Unknown'}): ${error.message}`);
        console.error(`❌ Error processing ingredient ${i + 1}:`, error);
      }
    }

    console.log(`📊 Bulk upload complete: ${results.success} success, ${results.failed} failed`);

    return NextResponse.json({
      success: true,
      message: `Bulk upload completed: ${results.success} ingredients created, ${results.failed} failed`,
      results
    });

  } catch (error) {
    console.error('❌ Bulk upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error during bulk upload' },
      { status: 500 }
    );
  }
}

// GET - Check bulk upload status or get template
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'template') {
      // Return template information
      return NextResponse.json({
        template: {
          name: 'Ingredient Template',
          fields: [
            { name: 'name', required: true, type: 'string', description: 'Ingredient name' },
            { name: 'unit', required: true, type: 'string', description: 'Unit of measurement (kg, L, pieces, etc.)' },
            { name: 'cost_per_unit', required: true, type: 'number', description: 'Cost per unit in local currency' },
            { name: 'supplier', required: true, type: 'string', description: 'Supplier name' },
            { name: 'category', required: true, type: 'string', description: 'Ingredient category' },
            { name: 'stock_level', required: false, type: 'number', description: 'Current stock level' },
            { name: 'min_stock_level', required: false, type: 'number', description: 'Minimum stock level' },
            { name: 'max_stock_level', required: false, type: 'number', description: 'Maximum stock level' },
            { name: 'supplier_sku', required: false, type: 'string', description: 'Supplier SKU code' },
            { name: 'storage_location', required: false, type: 'string', description: 'Storage location' },
            { name: 'expiry_days', required: false, type: 'number', description: 'Days until expiry' },
            { name: 'notes', required: false, type: 'string', description: 'Additional notes' }
          ]
        }
      });
    }

    return NextResponse.json({
      message: 'Bulk upload API for ingredients',
      endpoints: {
        POST: 'Upload ingredients data',
        GET: 'Get template information'
      }
    });

  } catch (error) {
    console.error('❌ Error in bulk upload GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}