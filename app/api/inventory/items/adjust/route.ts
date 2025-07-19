/**
 * HERA Universal - Stock Adjustment API
 * 
 * Next.js 15 App Router API Route Handler
 * Handles stock level adjustments with full audit trail
 * 
 * Route: POST /api/inventory/items/adjust
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

interface StockAdjustmentRequest {
  organizationId: string;
  itemId: string;
  adjustmentType: 'increase' | 'decrease' | 'set_absolute';
  quantity: number;
  reason: string;
  adjustmentSubtype?: 'manual_adjustment' | 'purchase_receipt' | 'damage' | 'theft' | 'expired' | 'returned' | 'sold' | 'transferred';
  referencePO?: string;
  referenceDocument?: string;
  adjustedBy?: string;
  notes?: string;
  costPerUnit?: number;
}

interface StockAdjustmentResponse {
  success: boolean;
  data: {
    adjustmentId: string;
    itemId: string;
    itemName: string;
    previousStock: number;
    newStock: number;
    quantityChanged: number;
    adjustmentType: string;
    reason: string;
    transactionNumber: string;
  };
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient(); // Use admin client for demo
    const body: StockAdjustmentRequest = await request.json();

    // Validate request
    if (!body.organizationId || !body.itemId || !body.adjustmentType || body.quantity === undefined || !body.reason) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, itemId, adjustmentType, quantity, reason' },
        { status: 400 }
      );
    }

    if (body.quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be greater than 0' },
        { status: 400 }
      );
    }

    if (!['increase', 'decrease', 'set_absolute'].includes(body.adjustmentType)) {
      return NextResponse.json(
        { error: 'Invalid adjustmentType. Must be increase, decrease, or set_absolute' },
        { status: 400 }
      );
    }

    // Verify item exists and get current stock
    const { data: item, error: itemError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('id', body.itemId)
      .eq('organization_id', body.organizationId)
      .eq('entity_type', 'inventory_item')
      .eq('is_active', true)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        { error: 'Inventory item not found or inactive' },
        { status: 404 }
      );
    }

    // Get current stock level
    const { data: currentStockData, error: stockError } = await supabase
      .from('core_dynamic_data')
      .select('field_value')
      .eq('entity_id', body.itemId)
      .eq('field_name', 'current_stock')
      .single();

    if (stockError) {
      console.error('Error fetching current stock:', stockError);
      return NextResponse.json(
        { error: 'Failed to fetch current stock level' },
        { status: 500 }
      );
    }

    const previousStock = parseFloat(currentStockData?.field_value || '0');
    let newStock: number;
    let actualQuantityChanged: number;

    // Calculate new stock based on adjustment type
    switch (body.adjustmentType) {
      case 'increase':
        newStock = previousStock + body.quantity;
        actualQuantityChanged = body.quantity;
        break;
      case 'decrease':
        if (previousStock < body.quantity) {
          return NextResponse.json(
            { error: `Insufficient stock. Current stock: ${previousStock}, requested decrease: ${body.quantity}` },
            { status: 400 }
          );
        }
        newStock = previousStock - body.quantity;
        actualQuantityChanged = -body.quantity;
        break;
      case 'set_absolute':
        newStock = body.quantity;
        actualQuantityChanged = body.quantity - previousStock;
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid adjustment type' },
          { status: 400 }
        );
    }

    // Ensure stock doesn't go negative
    if (newStock < 0) {
      return NextResponse.json(
        { error: 'Stock level cannot be negative' },
        { status: 400 }
      );
    }

    // Generate transaction number
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const { count } = await supabase
      .from('universal_transactions')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', body.organizationId)
      .eq('transaction_type', 'stock_movement')
      .gte('created_at', new Date().toISOString().split('T')[0]);
    
    const adjustmentNumber = `ADJ-${today}-${String((count || 0) + 1).padStart(4, '0')}`;

    // Create stock movement transaction
    const { data: adjustment, error: adjustmentError } = await supabase
      .from('universal_transactions')
      .insert({
        organization_id: body.organizationId,
        transaction_type: 'stock_movement',
        transaction_subtype: body.adjustmentSubtype || 'manual_adjustment',
        transaction_number: adjustmentNumber,
        transaction_date: new Date().toISOString(),
        total_amount: body.costPerUnit ? Math.abs(actualQuantityChanged) * body.costPerUnit : 0,
        currency: 'USD',
        procurement_metadata: {
          item_id: body.itemId,
          item_name: item.entity_name,
          item_code: item.entity_code,
          adjustment_type: actualQuantityChanged >= 0 ? 'increase' : 'decrease',
          quantity_changed: Math.abs(actualQuantityChanged),
          actual_quantity_changed: actualQuantityChanged,
          previous_stock: previousStock,
          new_stock: newStock,
          reason: body.reason,
          reference_po: body.referencePO,
          reference_document: body.referenceDocument,
          adjusted_by: body.adjustedBy || 'api_user',
          notes: body.notes,
          cost_per_unit: body.costPerUnit,
          total_cost_impact: body.costPerUnit ? Math.abs(actualQuantityChanged) * body.costPerUnit : 0
        },
        transaction_data: {
          created_via: 'stock_adjustment_api',
          adjustment_method: body.adjustmentType
        }
      })
      .select()
      .single();

    if (adjustmentError) {
      console.error('Error creating stock adjustment:', adjustmentError);
      return NextResponse.json(
        { error: 'Failed to create stock adjustment record' },
        { status: 500 }
      );
    }

    // Update current stock in dynamic data
    const { error: updateError } = await supabase
      .from('core_dynamic_data')
      .update({
        field_value: String(newStock),
        updated_at: new Date().toISOString()
      })
      .eq('entity_id', body.itemId)
      .eq('field_name', 'current_stock');

    if (updateError) {
      console.error('Error updating stock level:', updateError);
      
      // Rollback the transaction record
      await supabase
        .from('universal_transactions')
        .delete()
        .eq('id', adjustment.id);
      
      return NextResponse.json(
        { error: 'Failed to update stock level' },
        { status: 500 }
      );
    }

    // Update the entity's updated_at timestamp
    await supabase
      .from('core_entities')
      .update({
        updated_at: new Date().toISOString()
      })
      .eq('id', body.itemId);

    // Check if reorder alert is needed after adjustment
    const { data: reorderData } = await supabase
      .from('core_dynamic_data')
      .select('field_value')
      .eq('entity_id', body.itemId)
      .eq('field_name', 'reorder_point')
      .single();

    const reorderPoint = parseFloat(reorderData?.field_value || '0');
    const needsReorder = newStock <= reorderPoint;

    // Log reorder alert if needed
    if (needsReorder && body.adjustmentType === 'decrease') {
      await supabase
        .from('universal_transactions')
        .insert({
          organization_id: body.organizationId,
          transaction_type: 'alert',
          transaction_subtype: 'reorder_alert',
          transaction_number: `ALERT-${adjustmentNumber}`,
          transaction_date: new Date().toISOString(),
          total_amount: 0,
          currency: 'USD',
          procurement_metadata: {
            item_id: body.itemId,
            item_name: item.entity_name,
            alert_type: newStock === 0 ? 'out_of_stock' : 'low_stock',
            current_stock: newStock,
            reorder_point: reorderPoint,
            triggered_by_adjustment: adjustmentNumber
          }
        });
    }

    const response: StockAdjustmentResponse = {
      success: true,
      data: {
        adjustmentId: adjustment.id,
        itemId: body.itemId,
        itemName: item.entity_name,
        previousStock,
        newStock,
        quantityChanged: actualQuantityChanged,
        adjustmentType: body.adjustmentType,
        reason: body.reason,
        transactionNumber: adjustmentNumber
      },
      message: `Stock adjusted successfully. ${item.entity_name}: ${previousStock} → ${newStock} units${needsReorder ? ' (Reorder alert triggered)' : ''}`
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Stock adjustment POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}