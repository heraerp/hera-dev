/**
 * HERA Universal - Inventory Items API Routes
 * 
 * Next.js 15 App Router API Route Handler
 * Handles GET and POST operations for inventory items
 * 
 * Uses HERA's 5-table universal architecture:
 * - core_entities: Inventory item records
 * - core_dynamic_data: Item properties (price, stock, reorder points)
 * - core_relationships: Supplier-item connections
 * - universal_transactions: Stock movements and adjustments
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

// TypeScript interfaces
interface InventoryItemRequest {
  organizationId: string;
  name: string;
  category?: string;
  unitPrice?: number;
  currentStock?: number;
  reorderPoint?: number;
  maxStockLevel?: number;
  unitOfMeasure?: string;
  shelfLifeDays?: number;
  storageRequirements?: string;
  description?: string;
  sku?: string;
}

interface StockStatus {
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock';
  currentStock: number;
  reorderPoint: number;
  maxStockLevel: number;
  daysUntilReorder?: number;
}

// GET /api/inventory/items
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient(); // Use admin client for demo
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const category = searchParams.get('category');
    const status = searchParams.get('status'); // in_stock, low_stock, out_of_stock
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'entity_name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    // CORE PATTERN: Query core_entities first
    let query = supabase
      .from('core_entities')
      .select('*', { count: 'exact' })
      .eq('organization_id', organizationId)
      .eq('entity_type', 'inventory_item')
      .eq('is_active', true);

    // Apply search filter
    if (search) {
      query = query.or(`entity_name.ilike.%${search}%,entity_code.ilike.%${search}%`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: items, error, count } = await query;

    if (error) {
      console.error('Error fetching inventory items:', error);
      return NextResponse.json(
        { error: 'Failed to fetch inventory items' },
        { status: 500 }
      );
    }

    // CORE PATTERN: Get dynamic data if items exist
    let dynamicData: any[] = [];
    const itemIds = items?.map(item => item.id) || [];
    
    if (itemIds.length > 0) {
      const { data: dynamicDataResult } = await supabase
        .from('core_dynamic_data')
        .select('entity_id, field_name, field_value')
        .in('entity_id', itemIds);
      
      dynamicData = dynamicDataResult || [];
    }

    // CORE PATTERN: Group dynamic data by entity_id
    const dynamicDataMap = dynamicData.reduce((acc, item) => {
      if (!acc[item.entity_id]) {
        acc[item.entity_id] = {};
      }
      acc[item.entity_id][item.field_name] = item.field_value;
      return acc;
    }, {} as Record<string, Record<string, any>>);

    // Get recent stock movements for each item
    const stockMovements = await Promise.all(
      itemIds.map(async (itemId) => {
        const { data: movements } = await supabase
          .from('universal_transactions')
          .select('*')
          .eq('organization_id', organizationId)
          .eq('transaction_type', 'stock_movement')
          .contains('procurement_metadata', { item_id: itemId })
          .order('created_at', { ascending: false })
          .limit(5);

        return { itemId, movements: movements || [] };
      })
    );

    const movementsMap = stockMovements.reduce((acc, { itemId, movements }) => {
      acc[itemId] = movements;
      return acc;
    }, {} as Record<string, any[]>);

    // CORE PATTERN: Combine items with dynamic data and calculate stock status
    let enrichedItems = (items || []).map(item => {
      const itemData = dynamicDataMap[item.id] || {};
      const currentStock = parseFloat(itemData.current_stock || '0');
      const reorderPoint = parseFloat(itemData.reorder_point || '0');
      const maxStockLevel = parseFloat(itemData.max_stock_level || '100');

      // Calculate stock status
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

      return {
        id: item.id,
        name: item.entity_name,
        code: item.entity_code,
        category: itemData.category || 'uncategorized',
        unitPrice: parseFloat(itemData.unit_price || '0'),
        currentStock,
        reorderPoint,
        maxStockLevel,
        unitOfMeasure: itemData.unit_of_measure || 'unit',
        stockStatus,
        shelfLifeDays: parseInt(itemData.shelf_life_days || '0'),
        storageRequirements: itemData.storage_requirements,
        description: itemData.description,
        sku: itemData.sku,
        lastUpdated: item.updated_at,
        recentMovements: movementsMap[item.id] || [],
        isActive: item.is_active,
        createdAt: item.created_at
      };
    });

    // Apply category filter
    if (category) {
      enrichedItems = enrichedItems.filter(item => item.category === category);
    }

    // Apply status filter
    if (status) {
      enrichedItems = enrichedItems.filter(item => item.stockStatus === status);
    }

    // Calculate summary statistics
    const summary = {
      total: enrichedItems.length,
      inStock: enrichedItems.filter(item => item.stockStatus === 'in_stock').length,
      lowStock: enrichedItems.filter(item => item.stockStatus === 'low_stock').length,
      outOfStock: enrichedItems.filter(item => item.stockStatus === 'out_of_stock').length,
      overstock: enrichedItems.filter(item => item.stockStatus === 'overstock').length,
      categories: [...new Set(enrichedItems.map(item => item.category))],
      totalValue: enrichedItems.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0)
    };

    return NextResponse.json({
      data: enrichedItems,
      summary,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Inventory items GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/inventory/items
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient(); // Use admin client for demo
    const body: InventoryItemRequest = await request.json();

    // Validate request
    if (!body.organizationId || !body.name) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, name' },
        { status: 400 }
      );
    }

    // CORE PATTERN: Generate entity code
    const itemCode = body.sku || `ITEM-${body.name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const itemId = crypto.randomUUID();

    // CORE PATTERN: Create entity record
    const { data: item, error: itemError } = await supabase
      .from('core_entities')
      .insert({
        id: itemId,
        organization_id: body.organizationId,
        entity_type: 'inventory_item',
        entity_name: body.name,
        entity_code: itemCode,
        is_active: true
      })
      .select()
      .single();

    if (itemError) {
      console.error('Error creating inventory item:', itemError);
      return NextResponse.json(
        { error: 'Failed to create inventory item' },
        { status: 500 }
      );
    }

    // CORE PATTERN: Create dynamic data fields
    const dynamicFields = [
      { entity_id: itemId, field_name: 'category', field_value: body.category || 'uncategorized', field_type: 'text' },
      { entity_id: itemId, field_name: 'unit_price', field_value: String(body.unitPrice || 0), field_type: 'number' },
      { entity_id: itemId, field_name: 'current_stock', field_value: String(body.currentStock || 0), field_type: 'number' },
      { entity_id: itemId, field_name: 'reorder_point', field_value: String(body.reorderPoint || 0), field_type: 'number' },
      { entity_id: itemId, field_name: 'max_stock_level', field_value: String(body.maxStockLevel || 100), field_type: 'number' },
      { entity_id: itemId, field_name: 'unit_of_measure', field_value: body.unitOfMeasure || 'unit', field_type: 'text' },
      { entity_id: itemId, field_name: 'shelf_life_days', field_value: String(body.shelfLifeDays || 0), field_type: 'number' },
      { entity_id: itemId, field_name: 'storage_requirements', field_value: body.storageRequirements || 'room_temperature', field_type: 'text' },
      { entity_id: itemId, field_name: 'description', field_value: body.description || '', field_type: 'text' },
      { entity_id: itemId, field_name: 'sku', field_value: body.sku || itemCode, field_type: 'text' },
      { entity_id: itemId, field_name: 'created_date', field_value: new Date().toISOString(), field_type: 'text' }
    ];

    const { error: fieldsError } = await supabase
      .from('core_dynamic_data')
      .insert(dynamicFields);

    if (fieldsError) {
      console.error('Error creating dynamic fields:', fieldsError);
      // Clean up the entity if dynamic data creation fails
      await supabase.from('core_entities').delete().eq('id', itemId);
      return NextResponse.json(
        { error: 'Failed to create inventory item properties' },
        { status: 500 }
      );
    }

    // Create initial stock movement if currentStock > 0
    if (body.currentStock && body.currentStock > 0) {
      await supabase
        .from('universal_transactions')
        .insert({
          organization_id: body.organizationId,
          transaction_type: 'stock_movement',
          transaction_subtype: 'initial_stock',
          transaction_number: `INIT-${itemCode}`,
          transaction_date: new Date().toISOString(),
          total_amount: 0,
          currency: 'USD',
          procurement_metadata: {
            item_id: itemId,
            adjustment_type: 'increase',
            quantity_changed: body.currentStock,
            reason: 'Initial stock entry',
            previous_stock: 0,
            new_stock: body.currentStock
          }
        });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: itemId,
        name: body.name,
        code: itemCode,
        currentStock: body.currentStock || 0,
        category: body.category || 'uncategorized'
      },
      message: 'Inventory item created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Inventory item POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}