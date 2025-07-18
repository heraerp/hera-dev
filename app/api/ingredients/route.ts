/**
 * Ingredients API Route
 * Handles ingredient CRUD operations using service key to bypass RLS
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

// GET - Fetch all ingredients for an organization
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    console.log('🥕 API: Fetching ingredients for organization:', organizationId);

    // Get ingredient entities using service key
    const { data: ingredientEntities, error: entitiesError } = await supabaseAdmin
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'ingredient')
      .eq('is_active', true)
      .order('entity_name', { ascending: true });

    if (entitiesError) {
      console.error('❌ Error fetching ingredient entities:', entitiesError);
      return NextResponse.json(
        { error: 'Failed to fetch ingredients' },
        { status: 500 }
      );
    }

    if (!ingredientEntities || ingredientEntities.length === 0) {
      return NextResponse.json({ ingredients: [] });
    }

    // Get ingredient metadata
    const entityIds = ingredientEntities.map(entity => entity.id);
    const { data: metadata, error: metadataError } = await supabaseAdmin
      .from('core_metadata')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'ingredient')
      .in('entity_id', entityIds);

    if (metadataError) {
      console.error('❌ Error fetching ingredient metadata:', metadataError);
      return NextResponse.json(
        { error: 'Failed to fetch ingredient metadata' },
        { status: 500 }
      );
    }

    // Transform to ingredient objects
    const ingredients = ingredientEntities.map(entity => {
      const entityMetadata = metadata?.filter(m => m.entity_id === entity.id) || [];
      
      // Parse ingredient details
      const ingredientDetails = entityMetadata.find(m => m.metadata_type === 'ingredient_details');
      const inventoryInfo = entityMetadata.find(m => m.metadata_type === 'inventory_info');
      
      let details = {};
      let inventory = {};
      
      if (ingredientDetails) {
        try {
          details = JSON.parse(ingredientDetails.metadata_value);
        } catch (e) {
          console.warn('Failed to parse ingredient details:', e);
        }
      }
      
      if (inventoryInfo) {
        try {
          inventory = JSON.parse(inventoryInfo.metadata_value);
        } catch (e) {
          console.warn('Failed to parse inventory info:', e);
        }
      }
      
      return {
        id: entity.id,
        name: entity.entity_name,
        unit: details.unit || '',
        cost_per_unit: details.cost_per_unit || 0,
        supplier: details.supplier || '',
        category: details.category || '',
        stock_level: inventory.stock_level || 0,
        min_stock_level: inventory.min_stock_level || 0,
        max_stock_level: inventory.max_stock_level || 0,
        reorder_point: inventory.reorder_point || 0,
        supplier_sku: details.supplier_sku,
        storage_location: details.storage_location,
        expiry_days: details.expiry_days,
        is_active: entity.is_active,
        created_at: entity.created_at,
        updated_at: entity.updated_at
      };
    });

    console.log('✅ API: Successfully fetched', ingredients.length, 'ingredients');
    return NextResponse.json({ ingredients });

  } catch (error) {
    console.error('❌ API: Error in GET /api/ingredients:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new ingredient
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, ingredientData } = body;
    
    if (!organizationId || !ingredientData) {
      return NextResponse.json(
        { error: 'Organization ID and ingredient data are required' },
        { status: 400 }
      );
    }

    console.log('🥕 API: Creating ingredient:', ingredientData.name);

    const ingredientId = crypto.randomUUID();
    const ingredientCode = `ING-${ingredientData.name.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Create ingredient entity
    const { error: entityError } = await supabaseAdmin
      .from('core_entities')
      .insert({
        id: ingredientId,
        organization_id: organizationId,
        entity_type: 'ingredient',
        entity_name: ingredientData.name,
        entity_code: ingredientCode,
        is_active: true
      });

    if (entityError) {
      console.error('❌ Error creating ingredient entity:', entityError);
      return NextResponse.json(
        { error: 'Failed to create ingredient' },
        { status: 500 }
      );
    }

    // Create ingredient details metadata
    const ingredientDetails = {
      unit: ingredientData.unit,
      cost_per_unit: ingredientData.cost_per_unit,
      supplier: ingredientData.supplier,
      category: ingredientData.category,
      supplier_sku: ingredientData.supplier_sku,
      storage_location: ingredientData.storage_location,
      expiry_days: ingredientData.expiry_days
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
      console.error('❌ Error creating ingredient metadata:', metadataError);
      return NextResponse.json(
        { error: 'Failed to create ingredient metadata' },
        { status: 500 }
      );
    }

    // Create inventory information
    const inventoryInfo = {
      stock_level: ingredientData.stock_level || 0,
      min_stock_level: ingredientData.min_stock_level || 0,
      max_stock_level: ingredientData.max_stock_level || 0,
      reorder_point: ingredientData.min_stock_level || 0,
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
      console.error('❌ Error creating inventory metadata:', inventoryError);
      return NextResponse.json(
        { error: 'Failed to create inventory metadata' },
        { status: 500 }
      );
    }

    console.log('✅ API: Successfully created ingredient:', ingredientId);
    return NextResponse.json({ 
      success: true, 
      ingredientId,
      message: 'Ingredient created successfully'
    });

  } catch (error) {
    console.error('❌ API: Error in POST /api/ingredients:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}