/**
 * HERA Universal - Inventory Alerts API
 * 
 * Next.js 15 App Router API Route Handler
 * Gets inventory items requiring attention (low stock, out of stock, etc.)
 * 
 * Route: GET /api/inventory/items/alerts
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

interface InventoryAlert {
  id: string;
  name: string;
  code: string;
  category: string;
  currentStock: number;
  reorderPoint: number;
  maxStockLevel: number;
  unitOfMeasure: string;
  alertType: 'out_of_stock' | 'low_stock' | 'overstock' | 'slow_moving' | 'fast_moving' | 'expiring_soon';
  urgency: 'high' | 'medium' | 'low';
  daysUntilStockout?: number;
  suggestedAction: string;
  suggestedOrderQuantity?: number;
  lastMovementDate?: string;
  avgDailyUsage?: number;
  stockValue: number;
  preferredSupplier?: string;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient(); // Use admin client for demo
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const alertType = searchParams.get('alertType'); // Filter by specific alert type
    const urgency = searchParams.get('urgency'); // Filter by urgency level
    const category = searchParams.get('category'); // Filter by item category

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    // Get all active inventory items
    const { data: items, error } = await supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'inventory_item')
      .eq('is_active', true)
      .order('entity_name', { ascending: true });

    if (error) {
      console.error('Error fetching inventory items:', error);
      return NextResponse.json(
        { error: 'Failed to fetch inventory items' },
        { status: 500 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json({
        data: [],
        summary: {
          total: 0,
          highUrgency: 0,
          mediumUrgency: 0,
          lowUrgency: 0,
          alertTypes: {}
        }
      });
    }

    // Get dynamic data for all items
    const itemIds = items.map(item => item.id);
    const { data: dynamicData } = await supabase
      .from('core_dynamic_data')
      .select('entity_id, field_name, field_value')
      .in('entity_id', itemIds);

    // Group dynamic data by entity_id
    const dynamicDataMap = (dynamicData || []).reduce((acc, item) => {
      if (!acc[item.entity_id]) {
        acc[item.entity_id] = {};
      }
      acc[item.entity_id][item.field_name] = item.field_value;
      return acc;
    }, {} as Record<string, Record<string, any>>);

    // Get recent stock movements for usage calculation
    const { data: recentMovements } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('transaction_type', 'stock_movement')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
      .order('created_at', { ascending: false });

    // Get supplier relationships for preferred supplier info
    const { data: supplierRelationships } = await supabase
      .from('core_relationships')
      .select(`
        child_entity_id,
        parent_entity:core_entities!parent_entity_id(entity_name),
        relationship_data
      `)
      .in('child_entity_id', itemIds)
      .eq('relationship_type', 'supplier_item')
      .eq('is_active', true);

    const preferredSuppliers = supplierRelationships?.reduce((acc, rel) => {
      if (rel.relationship_data?.is_preferred) {
        acc[rel.child_entity_id] = rel.parent_entity?.entity_name;
      }
      return acc;
    }, {} as Record<string, string>) || {};

    // Calculate alerts for each item
    const alerts: InventoryAlert[] = [];

    for (const item of items) {
      const itemData = dynamicDataMap[item.id] || {};
      const currentStock = parseFloat(itemData.current_stock || '0');
      const reorderPoint = parseFloat(itemData.reorder_point || '0');
      const maxStockLevel = parseFloat(itemData.max_stock_level || '100');
      const unitPrice = parseFloat(itemData.unit_price || '0');
      const shelfLifeDays = parseInt(itemData.shelf_life_days || '0');

      // Calculate usage patterns from recent movements
      const itemMovements = recentMovements?.filter(movement => 
        movement.procurement_metadata?.item_id === item.id
      ) || [];

      const last30DaysUsage = itemMovements
        .filter(m => m.procurement_metadata?.adjustment_type === 'decrease')
        .reduce((sum, m) => sum + (m.procurement_metadata?.quantity_changed || 0), 0);

      const avgDailyUsage = last30DaysUsage / 30;
      const daysUntilStockout = avgDailyUsage > 0 ? Math.floor(currentStock / avgDailyUsage) : null;

      const lastMovementDate = itemMovements[0]?.created_at;
      const daysSinceLastMovement = lastMovementDate 
        ? Math.floor((Date.now() - new Date(lastMovementDate).getTime()) / (1000 * 60 * 60 * 24))
        : null;

      // Determine alert conditions
      const alertConditions = [];

      // Out of stock alert
      if (currentStock === 0) {
        alertConditions.push({
          alertType: 'out_of_stock' as const,
          urgency: 'high' as const,
          suggestedAction: 'Emergency reorder needed immediately',
          suggestedOrderQuantity: Math.max(reorderPoint * 2, avgDailyUsage * 14)
        });
      }

      // Low stock alert
      if (currentStock > 0 && currentStock <= reorderPoint) {
        alertConditions.push({
          alertType: 'low_stock' as const,
          urgency: daysUntilStockout && daysUntilStockout <= 3 ? 'high' as const : 'medium' as const,
          suggestedAction: 'Reorder required to maintain stock levels',
          suggestedOrderQuantity: Math.ceil(avgDailyUsage * 14) // 2 weeks supply
        });
      }

      // Overstock alert
      if (currentStock > maxStockLevel) {
        alertConditions.push({
          alertType: 'overstock' as const,
          urgency: 'low' as const,
          suggestedAction: 'Reduce ordering or increase sales efforts',
          suggestedOrderQuantity: 0
        });
      }

      // Slow-moving inventory (no movement in 30 days but has stock)
      if (currentStock > 0 && daysSinceLastMovement && daysSinceLastMovement > 30) {
        alertConditions.push({
          alertType: 'slow_moving' as const,
          urgency: 'low' as const,
          suggestedAction: 'Review item necessity or implement promotion',
          suggestedOrderQuantity: 0
        });
      }

      // Fast-moving inventory (high usage rate)
      if (avgDailyUsage > 0 && daysUntilStockout && daysUntilStockout <= 7) {
        alertConditions.push({
          alertType: 'fast_moving' as const,
          urgency: 'medium' as const,
          suggestedAction: 'Consider increasing reorder point or stock levels',
          suggestedOrderQuantity: Math.ceil(avgDailyUsage * 21) // 3 weeks supply
        });
      }

      // Expiring soon (if shelf life tracking is enabled)
      if (shelfLifeDays > 0 && lastMovementDate) {
        const daysSinceReceived = Math.floor((Date.now() - new Date(lastMovementDate).getTime()) / (1000 * 60 * 60 * 24));
        const daysUntilExpiry = shelfLifeDays - daysSinceReceived;
        
        if (daysUntilExpiry <= 3 && daysUntilExpiry > 0) {
          alertConditions.push({
            alertType: 'expiring_soon' as const,
            urgency: 'high' as const,
            suggestedAction: `Use within ${daysUntilExpiry} days to avoid waste`,
            suggestedOrderQuantity: 0
          });
        }
      }

      // Create alert records for each condition
      for (const condition of alertConditions) {
        alerts.push({
          id: item.id,
          name: item.entity_name,
          code: item.entity_code,
          category: itemData.category || 'uncategorized',
          currentStock,
          reorderPoint,
          maxStockLevel,
          unitOfMeasure: itemData.unit_of_measure || 'unit',
          alertType: condition.alertType,
          urgency: condition.urgency,
          daysUntilStockout,
          suggestedAction: condition.suggestedAction,
          suggestedOrderQuantity: condition.suggestedOrderQuantity,
          lastMovementDate,
          avgDailyUsage,
          stockValue: currentStock * unitPrice,
          preferredSupplier: preferredSuppliers[item.id]
        });
      }
    }

    // Apply filters
    let filteredAlerts = alerts;

    if (alertType) {
      filteredAlerts = filteredAlerts.filter(alert => alert.alertType === alertType);
    }

    if (urgency) {
      filteredAlerts = filteredAlerts.filter(alert => alert.urgency === urgency);
    }

    if (category) {
      filteredAlerts = filteredAlerts.filter(alert => alert.category === category);
    }

    // Sort by urgency (high first) then by current stock level
    filteredAlerts.sort((a, b) => {
      const urgencyOrder = { high: 0, medium: 1, low: 2 };
      if (a.urgency !== b.urgency) {
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      }
      return a.currentStock - b.currentStock;
    });

    // Calculate summary statistics
    const summary = {
      total: filteredAlerts.length,
      highUrgency: filteredAlerts.filter(alert => alert.urgency === 'high').length,
      mediumUrgency: filteredAlerts.filter(alert => alert.urgency === 'medium').length,
      lowUrgency: filteredAlerts.filter(alert => alert.urgency === 'low').length,
      alertTypes: filteredAlerts.reduce((acc, alert) => {
        acc[alert.alertType] = (acc[alert.alertType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      totalStockValue: filteredAlerts.reduce((sum, alert) => sum + alert.stockValue, 0),
      estimatedReorderValue: filteredAlerts
        .filter(alert => alert.suggestedOrderQuantity && alert.suggestedOrderQuantity > 0)
        .reduce((sum, alert) => {
          const unitPrice = parseFloat(dynamicDataMap[alert.id]?.unit_price || '0');
          return sum + ((alert.suggestedOrderQuantity || 0) * unitPrice);
        }, 0)
    };

    return NextResponse.json({
      data: filteredAlerts,
      summary
    });

  } catch (error) {
    console.error('Inventory alerts GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}