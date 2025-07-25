/**
 * HERA Universal - Menu Category Individual API Routes
 * 
 * Next.js 15 App Router API Route Handler
 * Handles GET, PUT, and DELETE operations for individual menu categories
 * 
 * Uses HERA's 5-table universal architecture:
 * - core_entities: Menu category records
 * - core_dynamic_data: Category properties
 * - core_relationships: Category-item relationships
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Admin client for consistent access
const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

// GET /api/menu/categories/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getAdminClient();
    const { id: categoryId } = await params;

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Get category with dynamic data
    const { data: category, error } = await supabase
      .from('core_entities')
      .select(`
        *,
        core_dynamic_data(field_name, field_value)
      `)
      .eq('id', categoryId)
      .eq('entity_type', 'menu_category')
      .eq('is_active', true)
      .single();

    if (error || !category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Build dynamic data map
    const dynamicData = (category.core_dynamic_data || []).reduce((acc: any, field: any) => {
      acc[field.field_name] = field.field_value;
      return acc;
    }, {});

    // Get item count for this category
    const [relationshipCount, dynamicDataCount] = await Promise.all([
      // Check core_relationships
      supabase
        .from('core_relationships')
        .select('id', { count: 'exact' })
        .eq('parent_entity_id', categoryId)
        .eq('relationship_type', 'menu_item_category')
        .eq('is_active', true),
      
      // Check dynamic data references
      supabase
        .from('core_dynamic_data')
        .select('entity_id', { count: 'exact' })
        .eq('field_name', 'category_id')
        .eq('field_value', categoryId)
    ]);

    const itemCount = (relationshipCount.count || 0) + (dynamicDataCount.count || 0);

    const enrichedCategory = {
      id: category.id,
      name: category.entity_name,
      description: dynamicData.description || '',
      displayOrder: parseInt(dynamicData.display_order || '0'),
      color: dynamicData.color || '#6B7280',
      icon: dynamicData.icon || 'utensils',
      isActive: category.is_active,
      itemCount: itemCount,
      createdAt: category.created_at,
      updatedAt: category.updated_at
    };

    return NextResponse.json({
      success: true,
      data: enrichedCategory
    });

  } catch (error) {
    console.error('Menu category GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/menu/categories/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getAdminClient();
    const { id: categoryId } = await params;
    const updateData = await request.json();

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    console.log('Updating menu category:', categoryId, 'with data:', updateData);

    // Verify category exists and get current data
    const { data: existingCategory, error: fetchError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('id', categoryId)
      .eq('entity_type', 'menu_category')
      .eq('is_active', true)
      .single();

    if (fetchError || !existingCategory) {
      console.error('Category not found:', fetchError);
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Update entity name if provided
    if (updateData.name && updateData.name !== existingCategory.entity_name) {
      const { error: entityError } = await supabase
        .from('core_entities')
        .update({ 
          entity_name: updateData.name,
          updated_at: new Date().toISOString()
        })
        .eq('id', categoryId);

      if (entityError) {
        console.error('Error updating category entity:', entityError);
        return NextResponse.json(
          { error: 'Failed to update category name' },
          { status: 500 }
        );
      }
    }

    // Update dynamic properties with proper upsert
    const propertyUpdates = [];
    if (updateData.description !== undefined) propertyUpdates.push({ field_name: 'description', field_value: updateData.description || '' });
    if (updateData.displayOrder !== undefined) propertyUpdates.push({ field_name: 'display_order', field_value: updateData.displayOrder.toString() });
    if (updateData.color !== undefined) propertyUpdates.push({ field_name: 'color', field_value: updateData.color });
    if (updateData.icon !== undefined) propertyUpdates.push({ field_name: 'icon', field_value: updateData.icon });

    for (const update of propertyUpdates) {
      const { error: upsertError } = await supabase
        .from('core_dynamic_data')
        .upsert({
          entity_id: categoryId,
          field_name: update.field_name,
          field_value: update.field_value,
          field_type: update.field_name === 'display_order' ? 'integer' : 'text',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'entity_id,field_name'
        });

      if (upsertError) {
        console.error(`Error updating ${update.field_name}:`, upsertError);
        // Continue with other updates instead of failing completely
      }
    }

    console.log(`✅ Category updated: ${categoryId}`);

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      data: {
        id: categoryId,
        name: updateData.name || existingCategory.entity_name
      }
    });

  } catch (error) {
    console.error('Menu category PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/menu/categories/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getAdminClient();
    const { id: categoryId } = await params;

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    console.log('Attempting to delete category:', categoryId);

    // Verify category exists
    const { data: existingCategory, error: fetchError } = await supabase
      .from('core_entities')
      .select('entity_name')
      .eq('id', categoryId)
      .eq('entity_type', 'menu_category')
      .eq('is_active', true)
      .single();

    if (fetchError || !existingCategory) {
      console.error('Category not found:', fetchError);
      return NextResponse.json(
        { error: 'Category not found or already deleted' },
        { status: 404 }
      );
    }

    // Check if category has menu items using BOTH relationship patterns
    const [relationshipResult, dynamicDataResult] = await Promise.all([
      // Check core_relationships table
      supabase
        .from('core_relationships')
        .select('id', { count: 'exact' })
        .eq('parent_entity_id', categoryId)
        .eq('relationship_type', 'menu_item_category')
        .eq('is_active', true),
      
      // Check dynamic data references
      supabase
        .from('core_dynamic_data')
        .select('entity_id')
        .eq('field_name', 'category_id')
        .eq('field_value', categoryId)
    ]);

    const relationshipCount = relationshipResult.count || 0;
    const dynamicDataCount = dynamicDataResult.data?.length || 0;
    const totalItemCount = relationshipCount + dynamicDataCount;

    console.log(`Category ${categoryId} has ${totalItemCount} associated menu items (${relationshipCount} relationships + ${dynamicDataCount} dynamic references)`);

    if (totalItemCount > 0) {
      return NextResponse.json(
        { 
          error: `Cannot delete category "${existingCategory.entity_name}" because it contains ${totalItemCount} menu item(s). Please move or delete the menu items first.`,
          itemCount: totalItemCount,
          details: {
            relationshipItems: relationshipCount,
            dynamicDataItems: dynamicDataCount
          }
        },
        { status: 400 }
      );
    }

    // Delete category (soft delete by setting is_active = false)
    const { error: deleteError } = await supabase
      .from('core_entities')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', categoryId)
      .eq('entity_type', 'menu_category');

    if (deleteError) {
      console.error('Error deleting menu category:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete menu category' },
        { status: 500 }
      );
    }

    // Also soft delete any associated dynamic data
    await supabase
      .from('core_dynamic_data')
      .update({ is_active: false })
      .eq('entity_id', categoryId);

    console.log(`✅ Category deleted: ${existingCategory.entity_name}`);

    return NextResponse.json({
      success: true,
      message: `Menu category "${existingCategory.entity_name}" deleted successfully`
    });

  } catch (error) {
    console.error('Menu category DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}