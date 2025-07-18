import UniversalCrudService from '@/lib/services/universalCrudService';
import { createClient } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient();

// Inventory Type Definitions
export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  category: string;
  currentStock: number;
  unit: string;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  reorderQuantity: number;
  unitCost: number;
  avgCost: number;
  totalValue: number;
  location: string;
  status: 'critical' | 'low' | 'good' | 'optimal';
  lastUpdated: string;
  
  // Tracking information
  batchNumber?: string;
  expiryDate?: string;
  supplierId?: string;
  supplierName?: string;
  
  // AI and analytics
  consumptionRate: number; // units per day
  daysRemaining: number;
  aiRecommendation?: string;
  lastOrderDate?: string;
  
  // Environmental data
  temperature?: number;
  humidity?: number;
  storageConditions?: string;
}

export interface InventoryTransaction {
  id: string;
  inventoryItemId: string;
  productName: string;
  transactionType: 'receipt' | 'usage' | 'adjustment' | 'transfer' | 'waste' | 'return';
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  batchNumber?: string;
  reason?: string;
  location?: string;
  targetLocation?: string;
  referenceId?: string; // Order ID, Purchase Order ID, etc.
  timestamp: string;
  userId?: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  paymentTerms?: string;
  leadTime: number; // days
  minOrderAmount?: number;
  preferredProducts: string[];
  rating: number;
  lastOrderDate?: string;
}

export interface ReorderAlert {
  id: string;
  inventoryItemId: string;
  productName: string;
  currentStock: number;
  reorderPoint: number;
  suggestedQuantity: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedStockoutDate: string;
  preferredSupplier?: Supplier;
  estimatedCost: number;
  aiConfidence: number;
}

export interface InventoryAnalytics {
  totalValue: number;
  totalItems: number;
  lowStockItems: number;
  criticalItems: number;
  averageTurnover: number;
  topMovingItems: Array<{
    productName: string;
    quantity: number;
    value: number;
    turnoverRate: number;
  }>;
  slowMovingItems: Array<{
    productName: string;
    daysWithoutMovement: number;
    value: number;
  }>;
  wasteAnalysis: {
    totalWaste: number;
    wasteValue: number;
    topWasteItems: Array<{ productName: string; quantity: number; value: number }>;
  };
  costAnalysis: {
    averageCostPerUnit: Record<string, number>;
    costTrends: Array<{ date: string; totalCost: number }>;
  };
  reorderRecommendations: ReorderAlert[];
}

export class UniversalInventoryService {
  /**
   * Get all inventory items
   */
  static async getInventoryItems(organizationId: string): Promise<{
    success: boolean;
    items?: InventoryItem[];
    error?: string;
  }> {
    try {
      console.log('📦 Fetching inventory items...');
      
      // Fetch inventory entities from core_entities
      const { data: entities, error: entitiesError } = await supabase
        .from('core_entities')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_type', 'inventory_item')
        .order('entity_name', { ascending: true });
      
      if (entitiesError) throw entitiesError;
      
      if (!entities || entities.length === 0) {
        return { success: true, items: [] };
      }
      
      // Fetch metadata for all inventory items
      const itemIds = entities.map(e => e.id);
      const { data: metadata, error: metadataError } = await supabase
        .from('core_metadata')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_type', 'inventory_item')
        .in('entity_id', itemIds);
      
      if (metadataError) throw metadataError;
      
      // Process inventory items
      const items: InventoryItem[] = entities.map(entity => {
        const itemMetadata = metadata?.filter(m => m.entity_id === entity.id) || [];
        
        // Extract metadata values
        const stockData = itemMetadata.find(m => m.metadata_key === 'stock_levels')?.metadata_value || {};
        const costData = itemMetadata.find(m => m.metadata_key === 'cost_info')?.metadata_value || {};
        const trackingData = itemMetadata.find(m => m.metadata_key === 'tracking_info')?.metadata_value || {};
        const analyticsData = itemMetadata.find(m => m.metadata_key === 'analytics')?.metadata_value || {};
        
        // Calculate status based on stock levels
        const currentStock = stockData.current_stock || 0;
        const minLevel = stockData.min_stock_level || 0;
        const reorderPoint = stockData.reorder_point || minLevel;
        
        let status: 'critical' | 'low' | 'good' | 'optimal' = 'good';
        if (currentStock <= 0) {
          status = 'critical';
        } else if (currentStock <= reorderPoint) {
          status = 'low';
        } else if (currentStock >= stockData.max_stock_level * 0.8) {
          status = 'optimal';
        }
        
        // Calculate days remaining based on consumption rate
        const consumptionRate = analyticsData.consumption_rate || 1;
        const daysRemaining = consumptionRate > 0 ? Math.floor(currentStock / consumptionRate) : 999;
        
        return {
          id: entity.id,
          productId: entity.related_entity_id || entity.id,
          productName: entity.entity_name,
          sku: trackingData.sku || entity.entity_code || '',
          category: trackingData.category || 'General',
          currentStock,
          unit: stockData.unit || 'pcs',
          minStockLevel: minLevel,
          maxStockLevel: stockData.max_stock_level || 100,
          reorderPoint,
          reorderQuantity: stockData.reorder_quantity || 50,
          unitCost: costData.unit_cost || 0,
          avgCost: costData.avg_cost || costData.unit_cost || 0,
          totalValue: currentStock * (costData.avg_cost || costData.unit_cost || 0),
          location: trackingData.location || 'Main Storage',
          status,
          lastUpdated: entity.updated_at || entity.created_at,
          batchNumber: trackingData.batch_number,
          expiryDate: trackingData.expiry_date,
          supplierId: trackingData.supplier_id,
          supplierName: trackingData.supplier_name,
          consumptionRate,
          daysRemaining,
          aiRecommendation: analyticsData.ai_recommendation,
          lastOrderDate: trackingData.last_order_date,
          temperature: trackingData.temperature,
          humidity: trackingData.humidity,
          storageConditions: trackingData.storage_conditions
        };
      });
      
      console.log(`✅ Fetched ${items.length} inventory items`);
      
      return {
        success: true,
        items
      };
      
    } catch (error) {
      console.error('❌ Error fetching inventory items:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch inventory items'
      };
    }
  }
  
  /**
   * Create inventory item
   */
  static async createInventoryItem(
    organizationId: string,
    productId: string,
    inventoryData: {
      sku?: string;
      category?: string;
      initialStock: number;
      unit: string;
      minStockLevel: number;
      maxStockLevel: number;
      reorderPoint: number;
      reorderQuantity: number;
      unitCost: number;
      location: string;
      supplierId?: string;
      supplierName?: string;
      batchNumber?: string;
      expiryDate?: string;
    }
  ): Promise<{
    success: boolean;
    inventoryItemId?: string;
    error?: string;
  }> {
    try {
      console.log('📦 Creating inventory item for product:', productId);
      
      const inventoryItemId = uuidv4();
      const now = new Date().toISOString();
      
      // Get product name
      const { data: product } = await supabase
        .from('core_entities')
        .select('entity_name')
        .eq('id', productId)
        .single();
      
      const productName = product?.entity_name || 'Unknown Product';
      
      // Create inventory item entity
      const { error: entityError } = await supabase
        .from('core_entities')
        .insert({
          id: inventoryItemId,
          organization_id: organizationId,
          entity_type: 'inventory_item',
          entity_subtype: 'stock_item',
          entity_name: productName,
          entity_code: inventoryData.sku || `INV-${Date.now()}`,
          related_entity_id: productId,
          created_at: now,
          updated_at: now
        });
      
      if (entityError) throw entityError;
      
      // Create metadata entries
      const metadataEntries = [
        {
          organization_id: organizationId,
          entity_type: 'inventory_item',
          entity_id: inventoryItemId,
          metadata_type: 'stock_levels',
          metadata_category: 'inventory',
          metadata_key: 'stock_levels',
          metadata_value: {
            current_stock: inventoryData.initialStock,
            unit: inventoryData.unit,
            min_stock_level: inventoryData.minStockLevel,
            max_stock_level: inventoryData.maxStockLevel,
            reorder_point: inventoryData.reorderPoint,
            reorder_quantity: inventoryData.reorderQuantity
          }
        },
        {
          organization_id: organizationId,
          entity_type: 'inventory_item',
          entity_id: inventoryItemId,
          metadata_type: 'cost_info',
          metadata_category: 'financial',
          metadata_key: 'cost_info',
          metadata_value: {
            unit_cost: inventoryData.unitCost,
            avg_cost: inventoryData.unitCost,
            last_cost_update: now
          }
        },
        {
          organization_id: organizationId,
          entity_type: 'inventory_item',
          entity_id: inventoryItemId,
          metadata_type: 'tracking_info',
          metadata_category: 'operational',
          metadata_key: 'tracking_info',
          metadata_value: {
            sku: inventoryData.sku,
            category: inventoryData.category,
            location: inventoryData.location,
            supplier_id: inventoryData.supplierId,
            supplier_name: inventoryData.supplierName,
            batch_number: inventoryData.batchNumber,
            expiry_date: inventoryData.expiryDate
          }
        },
        {
          organization_id: organizationId,
          entity_type: 'inventory_item',
          entity_id: inventoryItemId,
          metadata_type: 'analytics',
          metadata_category: 'analytics',
          metadata_key: 'analytics',
          metadata_value: {
            consumption_rate: 1, // Default 1 unit per day
            ai_recommendation: null,
            last_analysis: now
          }
        }
      ];
      
      // Insert metadata
      const { error: metadataError } = await supabase
        .from('core_metadata')
        .insert(metadataEntries);
      
      if (metadataError) throw metadataError;
      
      // Create initial stock receipt transaction
      await this.createInventoryTransaction(organizationId, {
        inventoryItemId,
        productName,
        transactionType: 'receipt',
        quantity: inventoryData.initialStock,
        unitCost: inventoryData.unitCost,
        batchNumber: inventoryData.batchNumber,
        reason: 'Initial stock',
        location: inventoryData.location,
        notes: 'Initial inventory setup'
      });
      
      console.log('✅ Inventory item created successfully');
      
      return {
        success: true,
        inventoryItemId
      };
      
    } catch (error) {
      console.error('❌ Error creating inventory item:', error);
      return {
        success: false,
        error: error.message || 'Failed to create inventory item'
      };
    }
  }
  
  /**
   * Update inventory stock levels
   */
  static async updateStock(
    organizationId: string,
    inventoryItemId: string,
    stockChange: number,
    transactionType: 'receipt' | 'usage' | 'adjustment' | 'waste',
    options: {
      unitCost?: number;
      batchNumber?: string;
      reason?: string;
      location?: string;
      referenceId?: string;
      notes?: string;
    } = {}
  ): Promise<{
    success: boolean;
    newStockLevel?: number;
    error?: string;
  }> {
    try {
      console.log(`📦 Updating stock for item ${inventoryItemId}: ${stockChange} units`);
      
      // Get current inventory item data
      const inventoryResult = await this.getInventoryItems(organizationId);
      if (!inventoryResult.success) throw new Error('Failed to fetch inventory data');
      
      const inventoryItem = inventoryResult.items?.find(item => item.id === inventoryItemId);
      if (!inventoryItem) throw new Error('Inventory item not found');
      
      // Calculate new stock level
      const newStockLevel = Math.max(0, inventoryItem.currentStock + stockChange);
      
      // Update stock levels metadata
      const { error: stockUpdateError } = await supabase
        .from('core_metadata')
        .update({
          metadata_value: {
            current_stock: newStockLevel,
            unit: inventoryItem.unit,
            min_stock_level: inventoryItem.minStockLevel,
            max_stock_level: inventoryItem.maxStockLevel,
            reorder_point: inventoryItem.reorderPoint,
            reorder_quantity: inventoryItem.reorderQuantity,
            last_stock_update: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('organization_id', organizationId)
        .eq('entity_type', 'inventory_item')
        .eq('entity_id', inventoryItemId)
        .eq('metadata_key', 'stock_levels');
      
      if (stockUpdateError) throw stockUpdateError;
      
      // Update average cost if unit cost provided
      if (options.unitCost && transactionType === 'receipt') {
        const totalValue = (inventoryItem.currentStock * inventoryItem.avgCost) + 
                          (Math.abs(stockChange) * options.unitCost);
        const newAvgCost = totalValue / newStockLevel;
        
        await supabase
          .from('core_metadata')
          .update({
            metadata_value: {
              unit_cost: options.unitCost,
              avg_cost: newAvgCost,
              last_cost_update: new Date().toISOString()
            }
          })
          .eq('organization_id', organizationId)
          .eq('entity_type', 'inventory_item')
          .eq('entity_id', inventoryItemId)
          .eq('metadata_key', 'cost_info');
      }
      
      // Create inventory transaction
      await this.createInventoryTransaction(organizationId, {
        inventoryItemId,
        productName: inventoryItem.productName,
        transactionType,
        quantity: Math.abs(stockChange),
        unitCost: options.unitCost,
        batchNumber: options.batchNumber,
        reason: options.reason,
        location: options.location || inventoryItem.location,
        referenceId: options.referenceId,
        notes: options.notes
      });
      
      console.log(`✅ Stock updated: ${inventoryItem.currentStock} → ${newStockLevel}`);
      
      return {
        success: true,
        newStockLevel
      };
      
    } catch (error) {
      console.error('❌ Error updating stock:', error);
      return {
        success: false,
        error: error.message || 'Failed to update stock'
      };
    }
  }
  
  /**
   * Create inventory transaction
   */
  static async createInventoryTransaction(
    organizationId: string,
    transaction: Omit<InventoryTransaction, 'id' | 'timestamp' | 'userId'>
  ): Promise<{
    success: boolean;
    transactionId?: string;
    error?: string;
  }> {
    try {
      const transactionId = uuidv4();
      const now = new Date().toISOString();
      
      // Create transaction entity
      const { error: entityError } = await supabase
        .from('core_entities')
        .insert({
          id: transactionId,
          organization_id: organizationId,
          entity_type: 'inventory_transaction',
          entity_subtype: transaction.transactionType,
          entity_name: `${transaction.transactionType.toUpperCase()}: ${transaction.productName}`,
          related_entity_id: transaction.inventoryItemId,
          created_at: now,
          updated_at: now
        });
      
      if (entityError) throw entityError;
      
      // Create transaction metadata
      const { error: metadataError } = await supabase
        .from('core_metadata')
        .insert({
          organization_id: organizationId,
          entity_type: 'inventory_transaction',
          entity_id: transactionId,
          metadata_type: 'transaction_details',
          metadata_category: 'operational',
          metadata_key: 'transaction_details',
          metadata_value: {
            inventory_item_id: transaction.inventoryItemId,
            product_name: transaction.productName,
            transaction_type: transaction.transactionType,
            quantity: transaction.quantity,
            unit_cost: transaction.unitCost,
            total_cost: transaction.unitCost ? transaction.quantity * transaction.unitCost : null,
            batch_number: transaction.batchNumber,
            reason: transaction.reason,
            location: transaction.location,
            target_location: transaction.targetLocation,
            reference_id: transaction.referenceId,
            notes: transaction.notes,
            timestamp: now
          }
        });
      
      if (metadataError) throw metadataError;
      
      return {
        success: true,
        transactionId
      };
      
    } catch (error) {
      console.error('❌ Error creating inventory transaction:', error);
      return {
        success: false,
        error: error.message || 'Failed to create transaction'
      };
    }
  }
  
  /**
   * Get inventory transactions
   */
  static async getInventoryTransactions(
    organizationId: string,
    inventoryItemId?: string,
    limit: number = 50
  ): Promise<{
    success: boolean;
    transactions?: InventoryTransaction[];
    error?: string;
  }> {
    try {
      console.log('📋 Fetching inventory transactions...');
      
      // Build query
      let entitiesQuery = supabase
        .from('core_entities')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_type', 'inventory_transaction')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (inventoryItemId) {
        entitiesQuery = entitiesQuery.eq('related_entity_id', inventoryItemId);
      }
      
      const { data: entities, error: entitiesError } = await entitiesQuery;
      
      if (entitiesError) throw entitiesError;
      
      if (!entities || entities.length === 0) {
        return { success: true, transactions: [] };
      }
      
      // Fetch metadata for all transactions
      const transactionIds = entities.map(e => e.id);
      const { data: metadata, error: metadataError } = await supabase
        .from('core_metadata')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_type', 'inventory_transaction')
        .in('entity_id', transactionIds);
      
      if (metadataError) throw metadataError;
      
      // Process transactions
      const transactions: InventoryTransaction[] = entities.map(entity => {
        const transactionMetadata = metadata?.find(m => m.entity_id === entity.id);
        const details = transactionMetadata?.metadata_value || {};
        
        return {
          id: entity.id,
          inventoryItemId: details.inventory_item_id || entity.related_entity_id,
          productName: details.product_name || entity.entity_name,
          transactionType: details.transaction_type || entity.entity_subtype,
          quantity: details.quantity || 0,
          unitCost: details.unit_cost,
          totalCost: details.total_cost,
          batchNumber: details.batch_number,
          reason: details.reason,
          location: details.location,
          targetLocation: details.target_location,
          referenceId: details.reference_id,
          timestamp: details.timestamp || entity.created_at,
          userId: details.user_id,
          notes: details.notes
        };
      });
      
      console.log(`✅ Fetched ${transactions.length} transactions`);
      
      return {
        success: true,
        transactions
      };
      
    } catch (error) {
      console.error('❌ Error fetching transactions:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch transactions'
      };
    }
  }
  
  /**
   * Get reorder alerts
   */
  static async getReorderAlerts(organizationId: string): Promise<{
    success: boolean;
    alerts?: ReorderAlert[];
    error?: string;
  }> {
    try {
      console.log('🚨 Checking for reorder alerts...');
      
      const inventoryResult = await this.getInventoryItems(organizationId);
      if (!inventoryResult.success || !inventoryResult.items) {
        throw new Error('Failed to fetch inventory data');
      }
      
      const alerts: ReorderAlert[] = [];
      
      for (const item of inventoryResult.items) {
        // Check if item needs reordering
        if (item.currentStock <= item.reorderPoint && item.status !== 'optimal') {
          const daysUntilStockout = item.daysRemaining;
          let priority: 'critical' | 'high' | 'medium' | 'low' = 'medium';
          
          if (item.currentStock <= 0) {
            priority = 'critical';
          } else if (daysUntilStockout <= 3) {
            priority = 'critical';
          } else if (daysUntilStockout <= 7) {
            priority = 'high';
          } else if (daysUntilStockout <= 14) {
            priority = 'medium';
          } else {
            priority = 'low';
          }
          
          // Calculate suggested quantity (enough for 30 days)
          const suggestedQuantity = Math.max(
            item.reorderQuantity,
            Math.ceil(item.consumptionRate * 30)
          );
          
          const estimatedStockoutDate = new Date();
          estimatedStockoutDate.setDate(estimatedStockoutDate.getDate() + daysUntilStockout);
          
          alerts.push({
            id: `alert-${item.id}`,
            inventoryItemId: item.id,
            productName: item.productName,
            currentStock: item.currentStock,
            reorderPoint: item.reorderPoint,
            suggestedQuantity,
            priority,
            estimatedStockoutDate: estimatedStockoutDate.toISOString(),
            estimatedCost: suggestedQuantity * item.unitCost,
            aiConfidence: 0.85 // Mock AI confidence
          });
        }
      }
      
      // Sort by priority
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
      
      console.log(`✅ Found ${alerts.length} reorder alerts`);
      
      return {
        success: true,
        alerts
      };
      
    } catch (error) {
      console.error('❌ Error generating reorder alerts:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate reorder alerts'
      };
    }
  }
  
  /**
   * Get inventory analytics
   */
  static async getInventoryAnalytics(organizationId: string): Promise<{
    success: boolean;
    analytics?: InventoryAnalytics;
    error?: string;
  }> {
    try {
      console.log('📊 Calculating inventory analytics...');
      
      const [inventoryResult, transactionsResult, alertsResult] = await Promise.all([
        this.getInventoryItems(organizationId),
        this.getInventoryTransactions(organizationId, undefined, 1000),
        this.getReorderAlerts(organizationId)
      ]);
      
      if (!inventoryResult.success || !inventoryResult.items) {
        throw new Error('Failed to fetch inventory data');
      }
      
      const items = inventoryResult.items;
      const transactions = transactionsResult.transactions || [];
      const alerts = alertsResult.alerts || [];
      
      // Calculate totals
      const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0);
      const totalItems = items.length;
      const lowStockItems = items.filter(item => item.status === 'low').length;
      const criticalItems = items.filter(item => item.status === 'critical').length;
      
      // Calculate top moving items (based on recent transactions)
      const itemMovement: Record<string, { quantity: number; value: number }> = {};
      const recentTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.timestamp);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return transactionDate >= thirtyDaysAgo && t.transactionType === 'usage';
      });
      
      recentTransactions.forEach(transaction => {
        if (!itemMovement[transaction.productName]) {
          itemMovement[transaction.productName] = { quantity: 0, value: 0 };
        }
        itemMovement[transaction.productName].quantity += transaction.quantity;
        itemMovement[transaction.productName].value += transaction.totalCost || 0;
      });
      
      const topMovingItems = Object.entries(itemMovement)
        .map(([productName, movement]) => ({
          productName,
          quantity: movement.quantity,
          value: movement.value,
          turnoverRate: movement.quantity / 30 // daily average
        }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10);
      
      // Calculate slow moving items
      const slowMovingItems = items
        .filter(item => {
          const hasRecentMovement = topMovingItems.some(moving => moving.productName === item.productName);
          return !hasRecentMovement && item.currentStock > 0;
        })
        .map(item => ({
          productName: item.productName,
          daysWithoutMovement: 30, // Mock data
          value: item.totalValue
        }))
        .slice(0, 10);
      
      // Calculate waste analysis (from waste transactions)
      const wasteTransactions = transactions.filter(t => t.transactionType === 'waste');
      const totalWaste = wasteTransactions.reduce((sum, t) => sum + t.quantity, 0);
      const wasteValue = wasteTransactions.reduce((sum, t) => sum + (t.totalCost || 0), 0);
      
      const wasteByProduct: Record<string, { quantity: number; value: number }> = {};
      wasteTransactions.forEach(transaction => {
        if (!wasteByProduct[transaction.productName]) {
          wasteByProduct[transaction.productName] = { quantity: 0, value: 0 };
        }
        wasteByProduct[transaction.productName].quantity += transaction.quantity;
        wasteByProduct[transaction.productName].value += transaction.totalCost || 0;
      });
      
      const topWasteItems = Object.entries(wasteByProduct)
        .map(([productName, waste]) => ({
          productName,
          quantity: waste.quantity,
          value: waste.value
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
      
      const analytics: InventoryAnalytics = {
        totalValue,
        totalItems,
        lowStockItems,
        criticalItems,
        averageTurnover: topMovingItems.length > 0 
          ? topMovingItems.reduce((sum, item) => sum + item.turnoverRate, 0) / topMovingItems.length 
          : 0,
        topMovingItems,
        slowMovingItems,
        wasteAnalysis: {
          totalWaste,
          wasteValue,
          topWasteItems
        },
        costAnalysis: {
          averageCostPerUnit: items.reduce((acc, item) => {
            acc[item.productName] = item.avgCost;
            return acc;
          }, {} as Record<string, number>),
          costTrends: [] // Would be calculated from historical data
        },
        reorderRecommendations: alerts
      };
      
      console.log('✅ Inventory analytics calculated');
      
      return {
        success: true,
        analytics
      };
      
    } catch (error) {
      console.error('❌ Error calculating analytics:', error);
      return {
        success: false,
        error: error.message || 'Failed to calculate analytics'
      };
    }
  }
  
  /**
   * Process order and update inventory
   */
  static async processOrderInventoryUpdate(
    organizationId: string,
    orderItems: Array<{ productId: string; quantity: number; productName: string }>,
    orderId: string
  ): Promise<{
    success: boolean;
    insufficientStock?: Array<{ productName: string; requested: number; available: number }>;
    error?: string;
  }> {
    try {
      console.log(`📦 Processing inventory update for order ${orderId}`);
      
      const inventoryResult = await this.getInventoryItems(organizationId);
      if (!inventoryResult.success || !inventoryResult.items) {
        throw new Error('Failed to fetch inventory data');
      }
      
      const inventoryItems = inventoryResult.items;
      const insufficientStock: Array<{ productName: string; requested: number; available: number }> = [];
      
      // Check stock availability first
      for (const orderItem of orderItems) {
        const inventoryItem = inventoryItems.find(item => item.productId === orderItem.productId);
        
        if (!inventoryItem) {
          console.warn(`⚠️ No inventory item found for product ${orderItem.productName}`);
          continue;
        }
        
        if (inventoryItem.currentStock < orderItem.quantity) {
          insufficientStock.push({
            productName: orderItem.productName,
            requested: orderItem.quantity,
            available: inventoryItem.currentStock
          });
        }
      }
      
      // If there are insufficient stock items, return without processing
      if (insufficientStock.length > 0) {
        return {
          success: false,
          insufficientStock,
          error: 'Insufficient stock for some items'
        };
      }
      
      // Process inventory updates
      for (const orderItem of orderItems) {
        const inventoryItem = inventoryItems.find(item => item.productId === orderItem.productId);
        
        if (inventoryItem) {
          await this.updateStock(
            organizationId,
            inventoryItem.id,
            -orderItem.quantity, // Negative for usage
            'usage',
            {
              reason: 'Order fulfillment',
              referenceId: orderId,
              notes: `Order ${orderId}: ${orderItem.quantity} units used`
            }
          );
        }
      }
      
      console.log('✅ Order inventory update completed');
      
      return {
        success: true
      };
      
    } catch (error) {
      console.error('❌ Error processing order inventory update:', error);
      return {
        success: false,
        error: error.message || 'Failed to process inventory update'
      };
    }
  }
}