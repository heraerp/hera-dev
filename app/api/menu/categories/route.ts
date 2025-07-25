/**
 * HERA Universal - Menu Categories API Routes
 * 
 * Next.js 15 App Router API Route Handler
 * Handles GET and POST operations for menu categories
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

// TypeScript interfaces
interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  color?: string;
  icon?: string;
  isActive: boolean;
  itemCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface MenuCategoryRequest {
  organizationId: string;
  name: string;
  description?: string;
  displayOrder?: number;
  color?: string;
  icon?: string;
}

// GET /api/menu/categories
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    // Get menu categories
    const { data: categories, error } = await supabase
      .from('core_entities')
      .select(`
        *,
        core_dynamic_data(field_name, field_value)
      `)
      .eq('organization_id', organizationId)
      .eq('entity_type', 'menu_category')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching menu categories:', error);
      return NextResponse.json(
        { error: 'Failed to fetch menu categories' },
        { status: 500 }
      );
    }

    // Enrich categories with dynamic data and item counts
    const enrichedCategories = await Promise.all(
      (categories || []).map(async (category) => {
        // Build dynamic data map
        const dynamicData = (category.core_dynamic_data || []).reduce((acc: any, field: any) => {
          acc[field.field_name] = field.field_value;
          return acc;
        }, {});

        // Get item count for this category
        const { count: itemCount } = await supabase
          .from('core_relationships')
          .select('id', { count: 'exact' })
          .eq('parent_entity_id', category.id)
          .eq('relationship_type', 'menu_item_category')
          .eq('is_active', true);

        return {
          id: category.id,
          name: category.entity_name,
          description: dynamicData.description || '',
          displayOrder: parseInt(dynamicData.display_order || '0'),
          color: dynamicData.color || '#6B7280',
          icon: dynamicData.icon || 'utensils',
          isActive: category.is_active,
          itemCount: itemCount || 0,
          createdAt: category.created_at,
          updatedAt: category.updated_at
        };
      })
    );

    // Sort by display order
    enrichedCategories.sort((a, b) => a.displayOrder - b.displayOrder);

    return NextResponse.json({
      data: enrichedCategories,
      total: enrichedCategories.length
    });

  } catch (error) {
    console.error('Menu categories GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/menu/categories
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body: MenuCategoryRequest = await request.json();

    console.log('Creating menu category with data:', JSON.stringify(body, null, 2));

    // Validate request
    if (!body.organizationId || !body.name) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, name' },
        { status: 400 }
      );
    }

    // Generate category code
    const categoryCode = `MARIO-CAT-${body.name.toUpperCase().replace(/[^A-Z0-9]/g, '-')}`;

    // Get next display order
    const { data: lastCategory } = await supabase
      .from('core_entities')
      .select('id')
      .eq('organization_id', body.organizationId)
      .eq('entity_type', 'menu_category')
      .order('created_at', { ascending: false })
      .limit(1);

    const { count: categoryCount } = await supabase
      .from('core_entities')
      .select('id', { count: 'exact' })
      .eq('organization_id', body.organizationId)
      .eq('entity_type', 'menu_category');

    const displayOrder = body.displayOrder || (categoryCount || 0) + 1;

    // Create category entity
    const { data: category, error: categoryError } = await supabase
      .from('core_entities')
      .insert({
        organization_id: body.organizationId,
        entity_type: 'menu_category',
        entity_name: body.name,
        entity_code: categoryCode,
        is_active: true
      })
      .select()
      .single();

    if (categoryError) {
      console.error('Error creating menu category:', categoryError);
      return NextResponse.json(
        { error: 'Failed to create menu category' },
        { status: 500 }
      );
    }

    // Add category properties
    const categoryProperties = [
      { field_name: 'description', field_value: body.description || '', field_type: 'text' },
      { field_name: 'display_order', field_value: displayOrder.toString(), field_type: 'integer' },
      { field_name: 'color', field_value: body.color || '#6B7280', field_type: 'text' },
      { field_name: 'icon', field_value: body.icon || 'utensils', field_type: 'text' }
    ];

    const { error: propertiesError } = await supabase
      .from('core_dynamic_data')
      .insert(
        categoryProperties.map(prop => ({
          entity_id: category.id,
          ...prop
        }))
      );

    if (propertiesError) {
      console.error('Error adding category properties:', propertiesError);
      // Don't fail the request, just log the error
    }

    console.log(`✅ Category created: ${body.name}`);

    return NextResponse.json({
      success: true,
      data: {
        id: category.id,
        name: body.name,
        code: categoryCode,
        displayOrder: displayOrder,
        message: `Menu category '${body.name}' created successfully`
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Menu category POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/menu/categories
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    console.log('Updating menu category:', id, 'with data:', updateData);

    // Verify category exists and get current data
    const { data: existingCategory, error: fetchError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('id', id)
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
        .eq('id', id);

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
          entity_id: id,
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

    console.log(`✅ Category updated: ${id}`);

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      data: {
        id: id,
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

// DELETE /api/menu/categories
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    console.log('Attempting to delete category:', id);

    // Verify category exists
    const { data: existingCategory, error: fetchError } = await supabase
      .from('core_entities')
      .select('entity_name')
      .eq('id', id)
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
    // Check core_relationships table
    const { count: relationshipCount } = await supabase
      .from('core_relationships')
      .select('id', { count: 'exact' })
      .eq('parent_entity_id', id)
      .eq('relationship_type', 'menu_item_category')
      .eq('is_active', true);

    // Also check if any menu items directly reference this category in dynamic data
    const { data: menuItemsWithCategory } = await supabase
      .from('core_dynamic_data')
      .select('entity_id')
      .eq('field_name', 'category_id')
      .eq('field_value', id);

    const totalItemCount = (relationshipCount || 0) + (menuItemsWithCategory?.length || 0);

    console.log(`Category ${id} has ${totalItemCount} associated menu items`);

    if (totalItemCount > 0) {
      return NextResponse.json(
        { 
          error: `Cannot delete category "${existingCategory.entity_name}" because it contains ${totalItemCount} menu item(s). Please move or delete the menu items first.`,
          itemCount: totalItemCount
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
      .eq('id', id)
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
      .eq('entity_id', id);

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