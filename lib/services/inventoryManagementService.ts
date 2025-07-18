/**
 * Inventory Management Service
 * Handles ingredient inventory, stock tracking, and supplier management
 */

import { createClient } from '@/lib/supabase/client';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Service key client for bypassing RLS
const supabaseAdmin = createSupabaseClient(
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

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  cost_per_unit: number;
  current_stock: number;
  min_stock_level: number;
  max_stock_level: number;
  reorder_point: number;
  supplier_id: string;
  supplier_name: string;
  supplier_sku: string;
  storage_location: string;
  expiry_date?: string;
  expiry_days?: number;
  is_perishable: boolean;
  last_ordered_date?: string;
  last_ordered_quantity?: number;
  average_monthly_usage: number;
  total_value: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface StockAdjustment {
  id: string;
  inventory_id: string;
  adjustment_type: 'manual' | 'recipe_usage' | 'purchase' | 'waste' | 'expired';
  quantity_change: number;
  previous_stock: number;
  new_stock: number;
  unit_cost: number;
  total_cost: number;
  reason: string;
  reference_id?: string; // Recipe ID, Purchase Order ID, etc.
  adjusted_by: string;
  adjusted_at: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  tax_number: string;
  payment_terms: string;
  delivery_days: number;
  minimum_order_amount: number;
  is_active: boolean;
  rating: number;
  total_orders: number;
  last_order_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrder {
  id: string;
  supplier_id: string;
  order_number: string;
  order_date: string;
  expected_delivery_date: string;
  actual_delivery_date?: string;
  status: 'draft' | 'sent' | 'confirmed' | 'delivered' | 'cancelled';
  total_amount: number;
  tax_amount: number;
  final_amount: number;
  items: PurchaseOrderItem[];
  created_by: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  inventory_id: string;
  ingredient_name: string;
  quantity_ordered: number;
  quantity_received?: number;
  unit_price: number;
  total_price: number;
  unit: string;
  notes?: string;
}

export interface InventoryAlert {
  id: string;
  inventory_id: string;
  alert_type: 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_acknowledged: boolean;
  created_at: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
}

export class InventoryManagementService {
  private static supabase = createClient();

  /**
   * Get all inventory items for an organization
   */
  static async getInventoryItems(organizationId: string): Promise<{
    success: boolean;
    data?: InventoryItem[];
    error?: string;
  }> {
    try {
      console.log('📦 Fetching inventory items for organization:', organizationId);

      // Get ingredient entities
      const { data: ingredients, error: ingredientsError } = await this.supabase
        .from('core_entities')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_type', 'ingredient')
        .eq('is_active', true)
        .order('entity_name');

      if (ingredientsError) {
        throw new Error(`Failed to fetch ingredients: ${ingredientsError.message}`);
      }

      if (!ingredients || ingredients.length === 0) {
        return { success: true, data: [] };
      }

      // Get ingredient metadata
      const ingredientIds = ingredients.map(i => i.id);
      const { data: metadata, error: metadataError } = await this.supabase
        .from('core_metadata')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_type', 'ingredient')
        .in('entity_id', ingredientIds);

      if (metadataError) {
        throw new Error(`Failed to fetch metadata: ${metadataError.message}`);
      }

      // Get stock adjustments for current stock calculations
      const { data: stockData, error: stockError } = await this.supabase
        .from('core_metadata')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_type', 'ingredient')
        .eq('metadata_type', 'stock_info')
        .in('entity_id', ingredientIds);

      if (stockError) {
        console.warn('Failed to fetch stock data:', stockError);
      }

      // Build inventory items
      const inventoryItems: InventoryItem[] = ingredients.map(ingredient => {
        const ingredientMetadata = metadata?.filter(m => m.entity_id === ingredient.id) || [];
        const stockInfo = stockData?.find(s => s.entity_id === ingredient.id);

        // Parse ingredient details
        const detailsMetadata = ingredientMetadata.find(m => m.metadata_type === 'ingredient_details');
        let details: any = {};
        if (detailsMetadata) {
          try {
            details = JSON.parse(detailsMetadata.metadata_value);
          } catch (e) {
            console.warn('Failed to parse ingredient details:', e);
          }
        }

        // Parse stock info
        let stock: any = {
          current_stock: details.stock_level || 0,
          min_stock_level: details.min_stock_level || 0,
          max_stock_level: details.max_stock_level || 100,
          reorder_point: details.min_stock_level || 0,
          average_monthly_usage: 0
        };

        if (stockInfo) {
          try {
            const stockDetails = JSON.parse(stockInfo.metadata_value);
            stock = { ...stock, ...stockDetails };
          } catch (e) {
            console.warn('Failed to parse stock info:', e);
          }
        }

        // Calculate status
        const currentStock = stock.current_stock || 0;
        const minStock = stock.min_stock_level || 0;
        let status: InventoryItem['status'] = 'in_stock';
        
        if (currentStock <= 0) {
          status = 'out_of_stock';
        } else if (currentStock <= minStock) {
          status = 'low_stock';
        }

        // Check expiry
        const expiryDate = details.expiry_date;
        if (expiryDate && new Date(expiryDate) < new Date()) {
          status = 'expired';
        }

        return {
          id: ingredient.id,
          name: ingredient.entity_name,
          category: details.category || 'Unknown',
          unit: details.unit || 'units',
          cost_per_unit: details.cost_per_unit || 0,
          current_stock: currentStock,
          min_stock_level: stock.min_stock_level || 0,
          max_stock_level: stock.max_stock_level || 100,
          reorder_point: stock.reorder_point || stock.min_stock_level || 0,
          supplier_id: details.supplier_id || '',
          supplier_name: details.supplier || 'Unknown',
          supplier_sku: details.supplier_sku || '',
          storage_location: details.storage_location || 'Unknown',
          expiry_date: details.expiry_date,
          expiry_days: details.expiry_days,
          is_perishable: details.expiry_days ? details.expiry_days < 30 : false,
          last_ordered_date: stock.last_ordered_date,
          last_ordered_quantity: stock.last_ordered_quantity,
          average_monthly_usage: stock.average_monthly_usage || 0,
          total_value: currentStock * (details.cost_per_unit || 0),
          status,
          notes: details.notes,
          created_at: ingredient.created_at,
          updated_at: ingredient.updated_at
        };
      });

      console.log(`✅ Found ${inventoryItems.length} inventory items`);
      return { success: true, data: inventoryItems };

    } catch (error) {
      console.error('❌ Error fetching inventory items:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch inventory items' 
      };
    }
  }

  /**
   * Update stock level for an inventory item
   */
  static async updateStock(
    organizationId: string,
    inventoryId: string,
    adjustment: {
      quantity_change: number;
      adjustment_type: StockAdjustment['adjustment_type'];
      reason: string;
      reference_id?: string;
      notes?: string;
    }
  ): Promise<{
    success: boolean;
    data?: StockAdjustment;
    error?: string;
  }> {
    try {
      console.log('📦 Updating stock for inventory item:', inventoryId, 'Change:', adjustment.quantity_change);

      // Get current stock info
      const { data: currentStock, error: stockError } = await this.supabase
        .from('core_metadata')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_type', 'ingredient')
        .eq('entity_id', inventoryId)
        .eq('metadata_type', 'stock_info')
        .single();

      let previousStock = 0;
      if (currentStock) {
        try {
          const stockData = JSON.parse(currentStock.metadata_value);
          previousStock = stockData.current_stock || 0;
        } catch (e) {
          console.warn('Failed to parse current stock:', e);
        }
      }

      const newStock = Math.max(0, previousStock + adjustment.quantity_change);

      // Get ingredient details for cost calculation
      const { data: ingredientDetails, error: detailsError } = await this.supabase
        .from('core_metadata')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_type', 'ingredient')
        .eq('entity_id', inventoryId)
        .eq('metadata_type', 'ingredient_details')
        .single();

      let unitCost = 0;
      if (ingredientDetails) {
        try {
          const details = JSON.parse(ingredientDetails.metadata_value);
          unitCost = details.cost_per_unit || 0;
        } catch (e) {
          console.warn('Failed to parse ingredient details:', e);
        }
      }

      // Create stock adjustment record
      const stockAdjustmentId = crypto.randomUUID();
      const stockAdjustment: StockAdjustment = {
        id: stockAdjustmentId,
        inventory_id: inventoryId,
        adjustment_type: adjustment.adjustment_type,
        quantity_change: adjustment.quantity_change,
        previous_stock: previousStock,
        new_stock: newStock,
        unit_cost: unitCost,
        total_cost: adjustment.quantity_change * unitCost,
        reason: adjustment.reason,
        reference_id: adjustment.reference_id,
        adjusted_by: 'current_user', // TODO: Get actual user ID
        adjusted_at: new Date().toISOString(),
        notes: adjustment.notes
      };

      // Store stock adjustment
      const { error: adjustmentError } = await supabaseAdmin
        .from('core_metadata')
        .insert({
          organization_id: organizationId,
          entity_type: 'stock_adjustment',
          entity_id: stockAdjustmentId,
          metadata_type: 'adjustment_details',
          metadata_category: 'inventory',
          metadata_key: 'stock_adjustment',
          metadata_value: JSON.stringify(stockAdjustment),
          created_by: 'current_user'
        });

      if (adjustmentError) {
        throw new Error(`Failed to create stock adjustment: ${adjustmentError.message}`);
      }

      // Update stock info
      const updatedStockInfo = {
        current_stock: newStock,
        last_adjustment_date: new Date().toISOString(),
        last_adjustment_quantity: adjustment.quantity_change,
        last_adjustment_type: adjustment.adjustment_type
      };

      if (currentStock) {
        // Update existing stock info
        const { error: updateError } = await supabaseAdmin
          .from('core_metadata')
          .update({
            metadata_value: JSON.stringify(updatedStockInfo),
            updated_at: new Date().toISOString()
          })
          .eq('id', currentStock.id);

        if (updateError) {
          throw new Error(`Failed to update stock info: ${updateError.message}`);
        }
      } else {
        // Create new stock info
        const { error: createError } = await supabaseAdmin
          .from('core_metadata')
          .insert({
            organization_id: organizationId,
            entity_type: 'ingredient',
            entity_id: inventoryId,
            metadata_type: 'stock_info',
            metadata_category: 'inventory',
            metadata_key: 'stock_info',
            metadata_value: JSON.stringify(updatedStockInfo),
            created_by: 'current_user'
          });

        if (createError) {
          throw new Error(`Failed to create stock info: ${createError.message}`);
        }
      }

      console.log(`✅ Stock updated: ${previousStock} → ${newStock} (${adjustment.quantity_change > 0 ? '+' : ''}${adjustment.quantity_change})`);
      return { success: true, data: stockAdjustment };

    } catch (error) {
      console.error('❌ Error updating stock:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update stock' 
      };
    }
  }

  /**
   * Get stock adjustments for an inventory item
   */
  static async getStockAdjustments(
    organizationId: string,
    inventoryId?: string,
    limit: number = 50
  ): Promise<{
    success: boolean;
    data?: StockAdjustment[];
    error?: string;
  }> {
    try {
      console.log('📦 Fetching stock adjustments for organization:', organizationId);

      let query = this.supabase
        .from('core_metadata')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_type', 'stock_adjustment')
        .eq('metadata_type', 'adjustment_details')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (inventoryId) {
        // Filter by inventory ID (we'll need to parse the metadata to filter)
        query = query.contains('metadata_value', { inventory_id: inventoryId });
      }

      const { data: adjustments, error: adjustmentsError } = await query;

      if (adjustmentsError) {
        throw new Error(`Failed to fetch stock adjustments: ${adjustmentsError.message}`);
      }

      const stockAdjustments: StockAdjustment[] = adjustments?.map(adj => {
        try {
          return JSON.parse(adj.metadata_value);
        } catch (e) {
          console.warn('Failed to parse stock adjustment:', e);
          return null;
        }
      }).filter(Boolean) || [];

      console.log(`✅ Found ${stockAdjustments.length} stock adjustments`);
      return { success: true, data: stockAdjustments };

    } catch (error) {
      console.error('❌ Error fetching stock adjustments:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch stock adjustments' 
      };
    }
  }

  /**
   * Get inventory alerts
   */
  static async getInventoryAlerts(organizationId: string): Promise<{
    success: boolean;
    data?: InventoryAlert[];
    error?: string;
  }> {
    try {
      console.log('🚨 Generating inventory alerts for organization:', organizationId);

      const { data: inventoryItems } = await this.getInventoryItems(organizationId);
      if (!inventoryItems) {
        return { success: true, data: [] };
      }

      const alerts: InventoryAlert[] = [];

      inventoryItems.forEach(item => {
        // Low stock alert
        if (item.current_stock <= item.min_stock_level && item.current_stock > 0) {
          alerts.push({
            id: crypto.randomUUID(),
            inventory_id: item.id,
            alert_type: 'low_stock',
            message: `${item.name} is running low (${item.current_stock} ${item.unit} remaining)`,
            severity: 'medium',
            is_acknowledged: false,
            created_at: new Date().toISOString()
          });
        }

        // Out of stock alert
        if (item.current_stock <= 0) {
          alerts.push({
            id: crypto.randomUUID(),
            inventory_id: item.id,
            alert_type: 'out_of_stock',
            message: `${item.name} is out of stock`,
            severity: 'high',
            is_acknowledged: false,
            created_at: new Date().toISOString()
          });
        }

        // Expiring soon alert
        if (item.expiry_date) {
          const expiryDate = new Date(item.expiry_date);
          const today = new Date();
          const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilExpiry <= 3 && daysUntilExpiry > 0) {
            alerts.push({
              id: crypto.randomUUID(),
              inventory_id: item.id,
              alert_type: 'expiring_soon',
              message: `${item.name} expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`,
              severity: 'medium',
              is_acknowledged: false,
              created_at: new Date().toISOString()
            });
          }
        }

        // Expired alert
        if (item.status === 'expired') {
          alerts.push({
            id: crypto.randomUUID(),
            inventory_id: item.id,
            alert_type: 'expired',
            message: `${item.name} has expired`,
            severity: 'critical',
            is_acknowledged: false,
            created_at: new Date().toISOString()
          });
        }
      });

      console.log(`🚨 Generated ${alerts.length} inventory alerts`);
      return { success: true, data: alerts };

    } catch (error) {
      console.error('❌ Error generating inventory alerts:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate inventory alerts' 
      };
    }
  }

  /**
   * Get inventory summary statistics
   */
  static async getInventorySummary(organizationId: string): Promise<{
    success: boolean;
    data?: {
      total_items: number;
      total_value: number;
      low_stock_items: number;
      out_of_stock_items: number;
      expiring_items: number;
      categories: { name: string; count: number; value: number }[];
      top_suppliers: { name: string; items: number; value: number }[];
    };
    error?: string;
  }> {
    try {
      console.log('📊 Calculating inventory summary for organization:', organizationId);

      const { data: inventoryItems } = await this.getInventoryItems(organizationId);
      if (!inventoryItems) {
        return { success: true, data: {
          total_items: 0,
          total_value: 0,
          low_stock_items: 0,
          out_of_stock_items: 0,
          expiring_items: 0,
          categories: [],
          top_suppliers: []
        }};
      }

      const summary = {
        total_items: inventoryItems.length,
        total_value: inventoryItems.reduce((sum, item) => sum + item.total_value, 0),
        low_stock_items: inventoryItems.filter(item => item.status === 'low_stock').length,
        out_of_stock_items: inventoryItems.filter(item => item.status === 'out_of_stock').length,
        expiring_items: inventoryItems.filter(item => {
          if (!item.expiry_date) return false;
          const expiryDate = new Date(item.expiry_date);
          const today = new Date();
          const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
        }).length,
        categories: [] as { name: string; count: number; value: number }[],
        top_suppliers: [] as { name: string; items: number; value: number }[]
      };

      // Calculate categories
      const categoryMap = new Map<string, { count: number; value: number }>();
      inventoryItems.forEach(item => {
        const category = item.category || 'Unknown';
        const existing = categoryMap.get(category) || { count: 0, value: 0 };
        categoryMap.set(category, {
          count: existing.count + 1,
          value: existing.value + item.total_value
        });
      });

      summary.categories = Array.from(categoryMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.value - a.value);

      // Calculate top suppliers
      const supplierMap = new Map<string, { items: number; value: number }>();
      inventoryItems.forEach(item => {
        const supplier = item.supplier_name || 'Unknown';
        const existing = supplierMap.get(supplier) || { items: 0, value: 0 };
        supplierMap.set(supplier, {
          items: existing.items + 1,
          value: existing.value + item.total_value
        });
      });

      summary.top_suppliers = Array.from(supplierMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      console.log(`📊 Inventory summary: ${summary.total_items} items, $${summary.total_value.toFixed(2)} total value`);
      return { success: true, data: summary };

    } catch (error) {
      console.error('❌ Error calculating inventory summary:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to calculate inventory summary' 
      };
    }
  }

  /**
   * Bulk update stock levels from recipe production
   */
  static async updateStockFromRecipe(
    organizationId: string,
    recipeId: string,
    quantityProduced: number,
    recipeIngredients: { ingredient_id: string; quantity: number; unit: string }[]
  ): Promise<{
    success: boolean;
    adjustments?: StockAdjustment[];
    error?: string;
  }> {
    try {
      console.log('🍳 Updating stock from recipe production:', recipeId, 'Quantity:', quantityProduced);

      const adjustments: StockAdjustment[] = [];

      for (const ingredient of recipeIngredients) {
        const totalUsed = ingredient.quantity * quantityProduced;
        
        const result = await this.updateStock(organizationId, ingredient.ingredient_id, {
          quantity_change: -totalUsed,
          adjustment_type: 'recipe_usage',
          reason: `Recipe production: ${quantityProduced} servings`,
          reference_id: recipeId,
          notes: `Used ${totalUsed} ${ingredient.unit} for recipe production`
        });

        if (result.success && result.data) {
          adjustments.push(result.data);
        }
      }

      console.log(`✅ Updated stock for ${adjustments.length} ingredients from recipe production`);
      return { success: true, adjustments };

    } catch (error) {
      console.error('❌ Error updating stock from recipe:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update stock from recipe' 
      };
    }
  }
}

export default InventoryManagementService;