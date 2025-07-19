/**
 * HERA Universal - Inventory Usage Analytics API
 * 
 * Next.js 15 App Router API Route Handler
 * Provides usage patterns and forecasting for inventory items
 * 
 * Route: GET /api/inventory/items/usage
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

interface UsageAnalytics {
  itemId: string;
  itemName: string;
  itemCode: string;
  category: string;
  unitOfMeasure: string;
  currentStock: number;
  reorderPoint: number;
  
  // Usage patterns
  avgDailyUsage: number;
  avgWeeklyUsage: number;
  avgMonthlyUsage: number;
  usageVelocity: 'fast' | 'medium' | 'slow' | 'none';
  
  // Forecasting
  daysUntilStockout: number | null;
  suggestedReorderQuantity: number;
  optimalReorderPoint: number;
  
  // Trends
  usageTrend: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data';
  seasonalityPattern: 'detected' | 'none' | 'insufficient_data';
  
  // Purchase order correlation
  lastPurchaseDate: string | null;
  avgDeliveryDays: number | null;
  purchaseFrequency: number; // purchases per month
  
  // Performance metrics
  stockoutRisk: 'high' | 'medium' | 'low';
  turnoverRate: number; // times per year
  
  // Historical data
  usageHistory: Array<{
    date: string;
    quantityUsed: number;
    cumulativeUsage: number;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient(); // Use admin client for demo
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const itemId = searchParams.get('itemId'); // Optional: specific item
    const category = searchParams.get('category'); // Optional: filter by category
    const timeframe = searchParams.get('timeframe') || '90'; // Days to analyze (default 90)
    const forecastDays = parseInt(searchParams.get('forecastDays') || '30'); // Forecast period

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    const timeframeDays = parseInt(timeframe);
    if (timeframeDays <= 0 || timeframeDays > 365) {
      return NextResponse.json(
        { error: 'timeframe must be between 1 and 365 days' },
        { status: 400 }
      );
    }

    // Get inventory items
    let itemsQuery = supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'inventory_item')
      .eq('is_active', true);

    if (itemId) {
      itemsQuery = itemsQuery.eq('id', itemId);
    }

    const { data: items, error: itemsError } = await itemsQuery;

    if (itemsError) {
      console.error('Error fetching inventory items:', itemsError);
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
          fastMoving: 0,
          slowMoving: 0,
          avgTurnoverRate: 0
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

    // Get stock movements for the specified timeframe
    const timeframeStart = new Date();
    timeframeStart.setDate(timeframeStart.getDate() - timeframeDays);

    const { data: stockMovements } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('transaction_type', 'stock_movement')
      .gte('created_at', timeframeStart.toISOString())
      .order('created_at', { ascending: true });

    // Get purchase orders for delivery time analysis
    const { data: purchaseOrders } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('transaction_type', 'purchase_order')
      .gte('created_at', timeframeStart.toISOString())
      .order('created_at', { ascending: false });

    // Calculate analytics for each item
    const analytics: UsageAnalytics[] = [];

    for (const item of items) {
      const itemData = dynamicDataMap[item.id] || {};
      const currentStock = parseFloat(itemData.current_stock || '0');
      const reorderPoint = parseFloat(itemData.reorder_point || '0');
      const unitPrice = parseFloat(itemData.unit_price || '0');

      // Filter movements for this item
      const itemMovements = stockMovements?.filter(movement =>
        movement.procurement_metadata?.item_id === item.id
      ) || [];

      // Calculate usage (decreases in stock)
      const usageMovements = itemMovements.filter(movement =>
        movement.procurement_metadata?.adjustment_type === 'decrease'
      );

      const totalUsage = usageMovements.reduce((sum, movement) =>
        sum + (movement.procurement_metadata?.quantity_changed || 0), 0
      );

      // Calculate time-based usage
      const avgDailyUsage = timeframeDays > 0 ? totalUsage / timeframeDays : 0;
      const avgWeeklyUsage = avgDailyUsage * 7;
      const avgMonthlyUsage = avgDailyUsage * 30;

      // Determine usage velocity
      let usageVelocity: 'fast' | 'medium' | 'slow' | 'none';
      if (avgDailyUsage === 0) {
        usageVelocity = 'none';
      } else if (avgDailyUsage >= reorderPoint / 7) { // Would hit reorder point in a week
        usageVelocity = 'fast';
      } else if (avgDailyUsage >= reorderPoint / 30) { // Would hit reorder point in a month
        usageVelocity = 'medium';
      } else {
        usageVelocity = 'slow';
      }

      // Calculate stockout prediction
      const daysUntilStockout = avgDailyUsage > 0 ? Math.floor(currentStock / avgDailyUsage) : null;

      // Calculate suggested reorder quantity (enough for forecast period + safety stock)
      const forecastUsage = avgDailyUsage * forecastDays;
      const safetyStock = reorderPoint * 0.5; // 50% of reorder point as safety
      const suggestedReorderQuantity = Math.ceil(forecastUsage + safetyStock);

      // Calculate optimal reorder point based on usage patterns
      const avgDeliveryDays = 7; // Default assumption, could be calculated from PO history
      const leadTimeUsage = avgDailyUsage * avgDeliveryDays;
      const optimalReorderPoint = Math.ceil(leadTimeUsage + safetyStock);

      // Analyze usage trend (compare first half vs second half of timeframe)
      const midpoint = new Date(timeframeStart.getTime() + (Date.now() - timeframeStart.getTime()) / 2);
      const firstHalfUsage = usageMovements
        .filter(m => new Date(m.created_at) < midpoint)
        .reduce((sum, m) => sum + (m.procurement_metadata?.quantity_changed || 0), 0);
      const secondHalfUsage = usageMovements
        .filter(m => new Date(m.created_at) >= midpoint)
        .reduce((sum, m) => sum + (m.procurement_metadata?.quantity_changed || 0), 0);

      let usageTrend: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data';
      if (usageMovements.length < 5) {
        usageTrend = 'insufficient_data';
      } else {
        const trendDifference = (secondHalfUsage - firstHalfUsage) / Math.max(firstHalfUsage, 1);
        if (trendDifference > 0.2) {
          usageTrend = 'increasing';
        } else if (trendDifference < -0.2) {
          usageTrend = 'decreasing';
        } else {
          usageTrend = 'stable';
        }
      }

      // Calculate stock risk
      let stockoutRisk: 'high' | 'medium' | 'low';
      if (currentStock === 0) {
        stockoutRisk = 'high';
      } else if (daysUntilStockout !== null && daysUntilStockout <= 7) {
        stockoutRisk = 'high';
      } else if (daysUntilStockout !== null && daysUntilStockout <= 14) {
        stockoutRisk = 'medium';
      } else {
        stockoutRisk = 'low';
      }

      // Calculate turnover rate (annual)
      const annualUsage = avgDailyUsage * 365;
      const avgInventoryLevel = currentStock + reorderPoint / 2;
      const turnoverRate = avgInventoryLevel > 0 ? annualUsage / avgInventoryLevel : 0;

      // Get purchase order history for this item
      const itemPOs = purchaseOrders?.filter(po =>
        po.procurement_metadata?.items?.some((poItem: any) => poItem.itemId === item.id)
      ) || [];

      const lastPurchaseDate = itemPOs[0]?.created_at || null;
      const purchaseFrequency = itemPOs.length > 0 ? (itemPOs.length / (timeframeDays / 30)) : 0;

      // Create usage history (daily aggregation)
      const usageHistory = [];
      for (let i = timeframeDays - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const dayUsage = usageMovements
          .filter(m => m.created_at.startsWith(dateStr))
          .reduce((sum, m) => sum + (m.procurement_metadata?.quantity_changed || 0), 0);

        usageHistory.push({
          date: dateStr,
          quantityUsed: dayUsage,
          cumulativeUsage: usageHistory.length > 0 
            ? usageHistory[usageHistory.length - 1].cumulativeUsage + dayUsage
            : dayUsage
        });
      }

      // Apply category filter if specified
      if (category && itemData.category !== category) {
        continue;
      }

      analytics.push({
        itemId: item.id,
        itemName: item.entity_name,
        itemCode: item.entity_code,
        category: itemData.category || 'uncategorized',
        unitOfMeasure: itemData.unit_of_measure || 'unit',
        currentStock,
        reorderPoint,
        
        avgDailyUsage,
        avgWeeklyUsage,
        avgMonthlyUsage,
        usageVelocity,
        
        daysUntilStockout,
        suggestedReorderQuantity,
        optimalReorderPoint,
        
        usageTrend,
        seasonalityPattern: usageMovements.length > 30 ? 'detected' : 'insufficient_data',
        
        lastPurchaseDate,
        avgDeliveryDays,
        purchaseFrequency,
        
        stockoutRisk,
        turnoverRate,
        
        usageHistory
      });
    }

    // Sort by usage velocity and then by risk
    analytics.sort((a, b) => {
      const velocityOrder = { fast: 0, medium: 1, slow: 2, none: 3 };
      const riskOrder = { high: 0, medium: 1, low: 2 };
      
      if (a.usageVelocity !== b.usageVelocity) {
        return velocityOrder[a.usageVelocity] - velocityOrder[b.usageVelocity];
      }
      return riskOrder[a.stockoutRisk] - riskOrder[b.stockoutRisk];
    });

    // Calculate summary statistics
    const summary = {
      total: analytics.length,
      fastMoving: analytics.filter(item => item.usageVelocity === 'fast').length,
      mediumMoving: analytics.filter(item => item.usageVelocity === 'medium').length,
      slowMoving: analytics.filter(item => item.usageVelocity === 'slow').length,
      noMovement: analytics.filter(item => item.usageVelocity === 'none').length,
      highRisk: analytics.filter(item => item.stockoutRisk === 'high').length,
      avgTurnoverRate: analytics.length > 0 
        ? analytics.reduce((sum, item) => sum + item.turnoverRate, 0) / analytics.length
        : 0,
      totalDailyUsage: analytics.reduce((sum, item) => sum + item.avgDailyUsage, 0),
      itemsNeedingReorder: analytics.filter(item => 
        item.currentStock <= item.reorderPoint
      ).length
    };

    return NextResponse.json({
      data: analytics,
      summary,
      metadata: {
        timeframeDays,
        forecastDays,
        analysisDate: new Date().toISOString(),
        currency: 'USD'
      }
    });

  } catch (error) {
    console.error('Usage analytics GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}