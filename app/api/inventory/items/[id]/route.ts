/**
 * HERA Universal - Individual Inventory Item API Routes
 * 
 * Next.js 15 App Router API Route Handler
 * Handles GET, PUT, DELETE operations for individual inventory items
 * 
 * Routes:
 * - GET /api/inventory/items/[id] - Get item details with history
 * - PUT /api/inventory/items/[id] - Update item properties
 * - DELETE /api/inventory/items/[id] - Soft delete item
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Admin client for demo/testing purposes
const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/inventory/items/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = getAdminClient(); // Use admin client for demo
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Inventory item ID is required' },
        { status: 400 }
      );
    }

    // Get inventory item details
    const { data: item, error } = await supabase
      .from('core_entities')
      .select('*')
      .eq('id', id)
      .eq('entity_type', 'inventory_item')
      .single();

    if (error || !item) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    // Get dynamic data
    const { data: dynamicData } = await supabase
      .from('core_dynamic_data')
      .select('field_name, field_value, field_type')
      .eq('entity_id', id);

    const itemFields = (dynamicData || []).reduce((acc, field) => {
      acc[field.field_name] = field.field_value;
      return acc;
    }, {} as Record<string, any>);

    // Get stock movement history
    const { data: stockMovements } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', item.organization_id)
      .eq('transaction_type', 'stock_movement')
      .contains('procurement_metadata', { item_id: id })
      .order('created_at', { ascending: false })
      .limit(50);

    // Get supplier relationships
    const { data: supplierRelationships } = await supabase
      .from('core_relationships')
      .select(`
        *,
        parent_entity:core_entities!parent_entity_id(*)
      `)
      .eq('child_entity_id', id)
      .eq('relationship_type', 'supplier_item')
      .eq('is_active', true);

    // Get recent purchase orders that included this item
    const { data: recentPOs } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', item.organization_id)
      .eq('transaction_type', 'purchase_order')
      .contains('procurement_metadata->items', [{ itemId: id }])
      .order('created_at', { ascending: false })
      .limit(10);

    // Calculate usage analytics
    const currentStock = parseFloat(itemFields.current_stock || '0');
    const reorderPoint = parseFloat(itemFields.reorder_point || '0');
    const maxStockLevel = parseFloat(itemFields.max_stock_level || '100');

    let stockStatus: string;
    if (currentStock === 0) {
      stockStatus = 'out_of_stock';
    } else if (currentStock <= reorderPoint) {
      stockStatus = 'low_stock';
    } else if (currentStock > maxStockLevel) {
      stockStatus = 'overstock';
    } else {
      stockStatus = 'in_stock';
    }

    // Calculate usage patterns from stock movements
    const last30DaysMovements = stockMovements?.filter(movement => {
      const movementDate = new Date(movement.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return movementDate >= thirtyDaysAgo;
    }) || [];

    const totalUsage30Days = last30DaysMovements
      .filter(m => m.procurement_metadata?.adjustment_type === 'decrease')
      .reduce((sum, m) => sum + (m.procurement_metadata?.quantity_changed || 0), 0);

    const avgDailyUsage = totalUsage30Days / 30;
    const daysUntilStockout = avgDailyUsage > 0 ? Math.floor(currentStock / avgDailyUsage) : null;

    // Prepare enriched item data
    const enrichedItem = {
      id: item.id,
      name: item.entity_name,
      code: item.entity_code,
      isActive: item.is_active,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      
      // Properties from dynamic data
      category: itemFields.category || 'uncategorized',
      unitPrice: parseFloat(itemFields.unit_price || '0'),
      currentStock,
      reorderPoint,
      maxStockLevel,
      unitOfMeasure: itemFields.unit_of_measure || 'unit',
      shelfLifeDays: parseInt(itemFields.shelf_life_days || '0'),
      storageRequirements: itemFields.storage_requirements,
      description: itemFields.description,
      sku: itemFields.sku,
      
      // Calculated fields
      stockStatus,
      stockValue: currentStock * parseFloat(itemFields.unit_price || '0'),
      daysUntilStockout,
      avgDailyUsage,
      
      // Historical data
      stockMovements: stockMovements?.map(movement => ({
        id: movement.id,
        date: movement.created_at,
        type: movement.transaction_subtype,
        quantityChanged: movement.procurement_metadata?.quantity_changed || 0,
        adjustmentType: movement.procurement_metadata?.adjustment_type,
        reason: movement.procurement_metadata?.reason,
        referenceNumber: movement.transaction_number,
        referencePO: movement.procurement_metadata?.reference_po
      })) || [],
      
      // Relationships
      suppliers: supplierRelationships?.map(rel => ({
        id: rel.parent_entity?.id,
        name: rel.parent_entity?.entity_name,
        code: rel.parent_entity?.entity_code,
        relationshipData: rel.relationship_data,
        isPreferred: rel.relationship_data?.is_preferred || false,
        lastOrderDate: rel.relationship_data?.last_order_date,
        avgDeliveryDays: rel.relationship_data?.avg_delivery_days
      })) || [],
      
      // Recent purchase orders
      recentPurchaseOrders: recentPOs?.map(po => ({
        id: po.id,
        poNumber: po.transaction_number,
        date: po.transaction_date,
        totalAmount: po.total_amount,
        status: po.workflow_status,
        supplier: po.procurement_metadata?.supplier_id
      })) || [],
      
      // Recommendations
      recommendations: {
        shouldReorder: stockStatus === 'low_stock' || stockStatus === 'out_of_stock',
        suggestedOrderQuantity: daysUntilStockout !== null && daysUntilStockout < 7 
          ? Math.ceil(avgDailyUsage * 14) // 2 weeks supply
          : null,
        preferredSupplier: supplierRelationships?.find(rel => rel.relationship_data?.is_preferred)?.parent_entity?.entity_name
      }
    };

    return NextResponse.json({ data: enrichedItem });

  } catch (error) {
    console.error('Inventory item GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/inventory/items/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = getAdminClient(); // Use admin client for demo
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Inventory item ID is required' },
        { status: 400 }
      );
    }

    // Check if item exists
    const { data: item, error: fetchError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('id', id)
      .eq('entity_type', 'inventory_item')
      .single();

    if (fetchError || !item) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    // Update main entity if name changed
    if (body.name && body.name !== item.entity_name) {
      const { error: nameUpdateError } = await supabase
        .from('core_entities')
        .update({
          entity_name: body.name,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (nameUpdateError) {
        console.error('Error updating item name:', nameUpdateError);
        return NextResponse.json(
          { error: 'Failed to update item name' },
          { status: 500 }
        );
      }
    }

    // Update dynamic fields
    const dynamicUpdates = [
      'category', 'unit_price', 'reorder_point', 'max_stock_level',
      'unit_of_measure', 'shelf_life_days', 'storage_requirements',
      'description', 'sku'
    ];
    
    for (const field of dynamicUpdates) {
      if (body[field] !== undefined) {
        // Check if field exists
        const { data: existingField } = await supabase
          .from('core_dynamic_data')
          .select('id')
          .eq('entity_id', id)
          .eq('field_name', field)
          .single();

        const fieldType = ['unit_price', 'reorder_point', 'max_stock_level', 'shelf_life_days'].includes(field) 
          ? 'number' : 'text';

        if (existingField) {
          // Update existing field
          await supabase
            .from('core_dynamic_data')
            .update({
              field_value: String(body[field]),
              field_type: fieldType,
              updated_at: new Date().toISOString()
            })
            .eq('entity_id', id)
            .eq('field_name', field);
        } else {
          // Create new field
          await supabase
            .from('core_dynamic_data')
            .insert({
              entity_id: id,
              field_name: field,
              field_value: String(body[field]),
              field_type: fieldType
            });
        }
      }
    }

    // Handle status updates
    if (body.isActive !== undefined) {
      await supabase
        .from('core_entities')
        .update({
          is_active: body.isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
    }

    return NextResponse.json({
      success: true,
      message: 'Inventory item updated successfully'
    });

  } catch (error) {
    console.error('Inventory item PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/inventory/items/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = getAdminClient(); // Use admin client for demo
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';
    const reason = searchParams.get('reason') || 'Item deactivated';

    if (!id) {
      return NextResponse.json(
        { error: 'Inventory item ID is required' },
        { status: 400 }
      );
    }

    // Check if item exists
    const { data: item, error: fetchError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('id', id)
      .eq('entity_type', 'inventory_item')
      .single();

    if (fetchError || !item) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    // Check for pending purchase orders
    const { data: pendingPOs, count } = await supabase
      .from('universal_transactions')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', item.organization_id)
      .eq('transaction_type', 'purchase_order')
      .in('workflow_status', ['pending', 'approved', 'pending_approval'])
      .contains('procurement_metadata->items', [{ itemId: id }]);

    if (count && count > 0 && !force) {
      return NextResponse.json(
        { 
          error: 'Cannot delete item with pending purchase orders',
          relatedRecords: count,
          suggestion: 'Deactivate item instead or use force=true parameter'
        },
        { status: 400 }
      );
    }

    // Soft delete - deactivate item
    const { error: deactivateError } = await supabase
      .from('core_entities')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (deactivateError) {
      console.error('Error deactivating item:', deactivateError);
      return NextResponse.json(
        { error: 'Failed to deactivate item' },
        { status: 500 }
      );
    }

    // Log the deactivation
    await supabase
      .from('universal_transactions')
      .insert({
        organization_id: item.organization_id,
        transaction_type: 'stock_movement',
        transaction_subtype: 'item_deactivated',
        transaction_number: `DEACT-${item.entity_code}`,
        transaction_date: new Date().toISOString(),
        total_amount: 0,
        currency: 'USD',
        procurement_metadata: {
          item_id: id,
          reason: reason,
          deactivated_by: 'api_user'
        }
      });

    return NextResponse.json({
      success: true,
      message: force ? 'Item deactivated successfully (soft delete due to existing records)' : 'Item deactivated successfully'
    });

  } catch (error) {
    console.error('Inventory item DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}