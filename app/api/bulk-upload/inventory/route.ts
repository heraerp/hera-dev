import { NextRequest, NextResponse } from 'next/server';
import UniversalCrudService from '@/lib/services/universalCrudService';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { organizationId, items } = await request.json();

    console.log('🚀 Starting inventory bulk upload...');
    console.log(`📦 Processing ${items.length} inventory items for organization: ${organizationId}`);

    if (!organizationId || !items || !Array.isArray(items)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: organizationId and items array' 
      }, { status: 400 });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      try {
        console.log(`📋 Processing item ${i + 1}/${items.length}: ${item.product_name}`);
        
        // Create ingredient entity first
        const ingredientId = uuidv4();
        const ingredientData = {
          name: item.product_name,
          organizationId,
          fields: {
            sku: item.sku,
            category: item.category,
            unit: item.unit,
            unit_cost: item.unit_cost,
            supplier_name: item.supplier_name || '',
            supplier_sku: item.supplier_sku || '',
            notes: item.notes || ''
          }
        };

        const ingredientResult = await UniversalCrudService.createEntity(ingredientData, 'ingredient');
        
        if (!ingredientResult.success) {
          throw new Error(`Failed to create ingredient: ${ingredientResult.error}`);
        }

        // Create inventory item entity
        const inventoryItemId = uuidv4();
        const inventoryData = {
          name: `Inventory - ${item.product_name}`,
          organizationId,
          fields: {
            product_id: ingredientId,
            product_name: item.product_name,
            sku: item.sku,
            category: item.category,
            current_stock: item.current_stock,
            unit: item.unit,
            min_stock_level: item.min_stock_level || 0,
            max_stock_level: item.max_stock_level || 0,
            reorder_point: item.reorder_point || 0,
            reorder_quantity: item.reorder_quantity || 0,
            unit_cost: item.unit_cost,
            avg_cost: item.unit_cost,
            total_value: item.current_stock * item.unit_cost,
            location: item.location || 'Main Storage',
            supplier_name: item.supplier_name || '',
            supplier_sku: item.supplier_sku || '',
            batch_number: item.batch_number || '',
            expiry_date: item.expiry_date || null,
            storage_conditions: item.storage_conditions || '',
            temperature: item.temperature || null,
            humidity: item.humidity || null,
            consumption_rate: item.consumption_rate || 0,
            notes: item.notes || ''
          }
        };

        // Calculate status based on stock levels
        let status = 'optimal';
        if (item.current_stock <= (item.min_stock_level || 0)) {
          status = 'critical';
        } else if (item.current_stock <= (item.reorder_point || 0)) {
          status = 'low';
        } else if (item.current_stock < (item.max_stock_level || 0) * 0.7) {
          status = 'good';
        }
        
        inventoryData.fields.status = status;
        inventoryData.fields.days_remaining = Math.round(item.current_stock / (item.consumption_rate || 1));

        const inventoryResult = await UniversalCrudService.createEntity(inventoryData, 'inventory_item');
        
        if (!inventoryResult.success) {
          throw new Error(`Failed to create inventory item: ${inventoryResult.error}`);
        }

        // Create initial stock adjustment record
        const adjustmentId = uuidv4();
        const adjustmentData = {
          name: `Initial stock - ${item.product_name}`,
          organizationId,
          fields: {
            inventory_item_id: inventoryItemId,
            product_name: item.product_name,
            transaction_type: 'receipt',
            quantity: item.current_stock,
            unit_cost: item.unit_cost,
            total_cost: item.current_stock * item.unit_cost,
            reason: 'Bulk upload - Initial stock',
            reference: `BULK-${Date.now()}`,
            performed_by: 'Bulk Upload',
            transaction_date: new Date().toISOString()
          }
        };

        const adjustmentResult = await UniversalCrudService.createEntity(adjustmentData, 'inventory_adjustment');

        results.push({
          index: i,
          name: item.product_name,
          ingredientId,
          inventoryItemId,
          adjustmentId: adjustmentResult.success ? adjustmentId : null,
          status: 'success'
        });

        console.log(`✅ Successfully created inventory item: ${item.product_name}`);

      } catch (error) {
        console.error(`❌ Error processing item ${i + 1} (${item.product_name}):`, error);
        errors.push({
          index: i,
          name: item.product_name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const response = {
      success: true,
      processed: items.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors
    };

    console.log('🎉 Bulk upload completed:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Bulk upload failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}