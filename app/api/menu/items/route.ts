/**
 * HERA Universal - Menu Items API Routes
 * 
 * Next.js 15 App Router API Route Handler
 * Handles GET and POST operations for menu items including combo/composite items
 * 
 * Uses HERA's 5-table universal architecture:
 * - core_entities: Menu item records
 * - core_dynamic_data: Item properties (price, cost, prep time, etc.)
 * - core_relationships: Category relationships, combo components
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
interface MenuItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  costPrice: number;
  categoryId?: string;
  categoryName?: string;
  prepTimeMinutes: number;
  isAvailable: boolean;
  itemType: 'individual' | 'composite';
  profitMargin?: number;
  components?: ComboComponent[];
  nutritionalInfo?: any;
  allergens?: string[];
  imageUrl?: string;
  imageName?: string;
  createdAt: string;
  updatedAt: string;
}

interface ComboComponent {
  itemId: string;
  itemName: string;
  portionSize: number;
  quantity: number;
  sequenceOrder: number;
  isMandatory: boolean;
}

interface MenuItemRequest {
  organizationId: string;
  name: string;
  description: string;
  basePrice: number;
  costPrice: number;
  categoryId: string;
  prepTimeMinutes?: number;
  isAvailable?: boolean;
  itemType?: 'individual' | 'composite';
  components?: ComboComponent[];
  allergens?: string[];
  nutritionalInfo?: any;
  imageUrl?: string;
  imageName?: string;
}

// Calculate profit margin helper
const calculateProfitMargin = (basePrice: number, costPrice: number): number => {
  if (basePrice <= 0) return 0;
  return Math.round(((basePrice - costPrice) / basePrice) * 100 * 100) / 100;
};

// GET /api/menu/items
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const categoryId = searchParams.get('categoryId');
    const itemType = searchParams.get('itemType'); // 'individual' | 'composite'
    const includeComponents = searchParams.get('includeComponents') === 'true';

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    // Build query for menu items
    let query = supabase
      .from('core_entities')
      .select(`
        *,
        core_dynamic_data(field_name, field_value)
      `)
      .eq('organization_id', organizationId)
      .eq('is_active', true);

    // Filter by item type
    if (itemType === 'individual') {
      query = query.eq('entity_type', 'menu_item');
    } else if (itemType === 'composite') {
      query = query.eq('entity_type', 'composite_menu_item');
    } else {
      query = query.in('entity_type', ['menu_item', 'composite_menu_item']);
    }

    const { data: items, error } = await query.order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching menu items:', error);
      return NextResponse.json(
        { error: 'Failed to fetch menu items' },
        { status: 500 }
      );
    }

    // Enrich items with dynamic data and relationships
    const enrichedItems = await Promise.all(
      (items || []).map(async (item) => {
        // Build dynamic data map
        const dynamicData = (item.core_dynamic_data || []).reduce((acc: any, field: any) => {
          acc[field.field_name] = field.field_value;
          return acc;
        }, {});

        // Get category information
        let categoryInfo = null;
        const { data: categoryRel } = await supabase
          .from('core_relationships')
          .select(`
            parent_entity_id,
            core_entities!core_relationships_parent_entity_id_fkey(entity_name)
          `)
          .eq('child_entity_id', item.id)
          .eq('relationship_type', 'menu_item_category')
          .eq('is_active', true)
          .limit(1);

        if (categoryRel && categoryRel.length > 0) {
          categoryInfo = {
            id: categoryRel[0].parent_entity_id,
            name: categoryRel[0].core_entities.entity_name
          };
        }

        // Get combo components if this is a composite item and requested
        let components = [];
        if (item.entity_type === 'composite_menu_item' && includeComponents) {
          const { data: componentRels } = await supabase
            .from('core_relationships')
            .select(`
              child_entity_id,
              relationship_data,
              relationship_metadata,
              core_entities!core_relationships_child_entity_id_fkey(entity_name)
            `)
            .eq('parent_entity_id', item.id)
            .eq('relationship_type', 'composite_item')
            .eq('is_active', true)
            .order('relationship_data->>sequence_order');

          components = (componentRels || []).map(rel => {
            const data = rel.relationship_data || {};
            return {
              itemId: rel.child_entity_id,
              itemName: rel.core_entities.entity_name,
              portionSize: parseFloat(data.portion_size || '1.0'),
              quantity: parseInt(data.quantity || '1'),
              sequenceOrder: parseInt(data.sequence_order || '1'),
              isMandatory: data.is_mandatory === true
            };
          });
        }

        const basePrice = parseFloat(dynamicData.base_price || '0');
        const costPrice = parseFloat(dynamicData.cost_price || '0');

        return {
          id: item.id,
          name: item.entity_name,
          description: dynamicData.description || '',
          basePrice: basePrice,
          costPrice: costPrice,
          categoryId: categoryInfo?.id,
          categoryName: categoryInfo?.name,
          prepTimeMinutes: parseInt(dynamicData.prep_time_minutes || '0'),
          isAvailable: dynamicData.is_available === 'true',
          itemType: item.entity_type === 'composite_menu_item' ? 'composite' : 'individual',
          profitMargin: calculateProfitMargin(basePrice, costPrice),
          components: components,
          allergens: dynamicData.allergens ? JSON.parse(dynamicData.allergens) : [],
          nutritionalInfo: dynamicData.nutritional_info ? JSON.parse(dynamicData.nutritional_info) : null,
          imageUrl: dynamicData.image_url || '',
          imageName: dynamicData.image_name || '',
          createdAt: item.created_at,
          updatedAt: item.updated_at
        };
      })
    );

    // Filter by category if specified
    let filteredItems = enrichedItems;
    if (categoryId) {
      filteredItems = enrichedItems.filter(item => item.categoryId === categoryId);
    }

    return NextResponse.json({
      data: filteredItems,
      total: filteredItems.length,
      summary: {
        individual_items: filteredItems.filter(item => item.itemType === 'individual').length,
        combo_items: filteredItems.filter(item => item.itemType === 'composite').length,
        average_margin: filteredItems.length > 0 ? 
          Math.round(filteredItems.reduce((sum, item) => sum + item.profitMargin, 0) / filteredItems.length * 100) / 100 : 0,
        total_menu_value: Math.round(filteredItems.reduce((sum, item) => sum + item.basePrice, 0) * 100) / 100
      }
    });

  } catch (error) {
    console.error('Menu items GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/menu/items
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body: MenuItemRequest = await request.json();

    console.log('Creating menu item with data:', JSON.stringify(body, null, 2));

    // Validate request
    if (!body.organizationId || !body.name || !body.categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, name, categoryId' },
        { status: 400 }
      );
    }

    // Generate item code
    const itemCode = `MARIO-ITEM-${body.name.toUpperCase().replace(/[^A-Z0-9]/g, '-')}`;
    const entityType = body.itemType === 'composite' ? 'composite_menu_item' : 'menu_item';

    // Create menu item entity
    const { data: menuItem, error: itemError } = await supabase
      .from('core_entities')
      .insert({
        organization_id: body.organizationId,
        entity_type: entityType,
        entity_name: body.name,
        entity_code: itemCode,
        is_active: true
      })
      .select()
      .single();

    if (itemError) {
      console.error('Error creating menu item:', itemError);
      return NextResponse.json(
        { error: 'Failed to create menu item' },
        { status: 500 }
      );
    }

    // Add item properties
    const itemProperties = [
      { field_name: 'description', field_value: body.description, field_type: 'text' },
      { field_name: 'base_price', field_value: body.basePrice.toString(), field_type: 'decimal' },
      { field_name: 'cost_price', field_value: body.costPrice.toString(), field_type: 'decimal' },
      { field_name: 'prep_time_minutes', field_value: (body.prepTimeMinutes || 10).toString(), field_type: 'integer' },
      { field_name: 'is_available', field_value: (body.isAvailable !== false).toString(), field_type: 'boolean' }
    ];

    // Add image properties if provided
    if (body.imageUrl) {
      itemProperties.push({ field_name: 'image_url', field_value: body.imageUrl, field_type: 'text' });
    }
    if (body.imageName) {
      itemProperties.push({ field_name: 'image_name', field_value: body.imageName, field_type: 'text' });
    }

    // Add optional properties
    if (body.allergens && body.allergens.length > 0) {
      itemProperties.push({ field_name: 'allergens', field_value: JSON.stringify(body.allergens), field_type: 'json' });
    }
    if (body.nutritionalInfo) {
      itemProperties.push({ field_name: 'nutritional_info', field_value: JSON.stringify(body.nutritionalInfo), field_type: 'json' });
    }

    const { error: propertiesError } = await supabase
      .from('core_dynamic_data')
      .insert(
        itemProperties.map(prop => ({
          entity_id: menuItem.id,
          ...prop
        }))
      );

    if (propertiesError) {
      console.error('Error adding item properties:', propertiesError);
    }

    // Link to category
    const { error: categoryLinkError } = await supabase
      .from('core_relationships')
      .insert({
        organization_id: body.organizationId,
        relationship_type: 'menu_item_category',
        parent_entity_id: body.categoryId,
        child_entity_id: menuItem.id,
        is_active: true
      });

    if (categoryLinkError) {
      console.error('Error linking item to category:', categoryLinkError);
    }

    // Handle combo components if this is a composite item
    if (body.itemType === 'composite' && body.components && body.components.length > 0) {
      const componentRelationships = body.components.map(component => ({
        organization_id: body.organizationId,
        relationship_type: 'composite_item',
        parent_entity_id: menuItem.id,
        child_entity_id: component.itemId,
        relationship_data: {
          portion_size: component.portionSize.toString(),
          quantity: component.quantity.toString(),
          sequence_order: component.sequenceOrder.toString(),
          is_mandatory: component.isMandatory
        },
        is_active: true
      }));

      const { error: componentsError } = await supabase
        .from('core_relationships')
        .insert(componentRelationships);

      if (componentsError) {
        console.error('Error adding combo components:', componentsError);
      }
    }

    const profitMargin = calculateProfitMargin(body.basePrice, body.costPrice);

    console.log(`✅ Menu item created: ${body.name} (${profitMargin}% margin)`);

    return NextResponse.json({
      success: true,
      data: {
        id: menuItem.id,
        name: body.name,
        code: itemCode,
        type: entityType,
        profitMargin: profitMargin,
        message: `Menu item '${body.name}' created successfully`
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Menu item POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/menu/items
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Menu item ID is required' },
        { status: 400 }
      );
    }

    console.log('Updating menu item:', id, 'with data:', updateData);

    // Update entity name if provided
    if (updateData.name) {
      const { error: entityError } = await supabase
        .from('core_entities')
        .update({ entity_name: updateData.name })
        .eq('id', id);

      if (entityError) {
        console.error('Error updating menu item entity:', entityError);
        return NextResponse.json(
          { error: 'Failed to update menu item' },
          { status: 500 }
        );
      }
    }

    // Update dynamic properties
    const propertyUpdates = [];
    if (updateData.description !== undefined) propertyUpdates.push({ field_name: 'description', field_value: updateData.description });
    if (updateData.basePrice !== undefined) propertyUpdates.push({ field_name: 'base_price', field_value: updateData.basePrice.toString() });
    if (updateData.costPrice !== undefined) propertyUpdates.push({ field_name: 'cost_price', field_value: updateData.costPrice.toString() });
    if (updateData.prepTimeMinutes !== undefined) propertyUpdates.push({ field_name: 'prep_time_minutes', field_value: updateData.prepTimeMinutes.toString() });
    if (updateData.isAvailable !== undefined) propertyUpdates.push({ field_name: 'is_available', field_value: updateData.isAvailable.toString() });
    if (updateData.imageUrl !== undefined) propertyUpdates.push({ field_name: 'image_url', field_value: updateData.imageUrl });
    if (updateData.imageName !== undefined) propertyUpdates.push({ field_name: 'image_name', field_value: updateData.imageName });

    for (const update of propertyUpdates) {
      await supabase
        .from('core_dynamic_data')
        .upsert({
          entity_id: id,
          field_name: update.field_name,
          field_value: update.field_value,
          field_type: ['base_price', 'cost_price'].includes(update.field_name) ? 'decimal' : 
                     ['prep_time_minutes'].includes(update.field_name) ? 'integer' : 
                     ['is_available'].includes(update.field_name) ? 'boolean' : 'text'
        });
    }

    // Update category relationship if provided
    if (updateData.categoryId) {
      // Deactivate existing category relationship
      await supabase
        .from('core_relationships')
        .update({ is_active: false })
        .eq('child_entity_id', id)
        .eq('relationship_type', 'menu_item_category');

      // Create new category relationship
      await supabase
        .from('core_relationships')
        .insert({
          organization_id: updateData.organizationId,
          relationship_type: 'menu_item_category',
          parent_entity_id: updateData.categoryId,
          child_entity_id: id,
          is_active: true
        });
    }

    console.log(`✅ Menu item updated: ${id}`);

    return NextResponse.json({
      success: true,
      message: 'Menu item updated successfully'
    });

  } catch (error) {
    console.error('Menu item PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/menu/items
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Menu item ID is required' },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    // Check if item is used in any combo
    const { count: comboUsage } = await supabase
      .from('core_relationships')
      .select('id', { count: 'exact' })
      .eq('child_entity_id', id)
      .eq('relationship_type', 'composite_item')
      .eq('is_active', true);

    if (comboUsage && comboUsage > 0) {
      return NextResponse.json(
        { error: 'Cannot delete menu item that is used in combo meals. Please remove from combos first.' },
        { status: 400 }
      );
    }

    // Delete menu item (soft delete by setting is_active = false)
    const { error } = await supabase
      .from('core_entities')
      .update({ is_active: false })
      .eq('id', id)
      .in('entity_type', ['menu_item', 'composite_menu_item']);

    if (error) {
      console.error('Error deleting menu item:', error);
      return NextResponse.json(
        { error: 'Failed to delete menu item' },
        { status: 500 }
      );
    }

    // Deactivate all relationships
    await supabase
      .from('core_relationships')
      .update({ is_active: false })
      .or(`parent_entity_id.eq.${id},child_entity_id.eq.${id}`);

    return NextResponse.json({
      success: true,
      message: 'Menu item deleted successfully'
    });

  } catch (error) {
    console.error('Menu item DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}