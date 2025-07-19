/**
 * HERA Universal - Menu Combo Calculation API
 * 
 * Next.js 15 App Router API Route Handler
 * Handles combo meal pricing, portion scaling, and cost calculations
 * 
 * Mario's Italian Restaurant - Combo & Composite Item Calculator
 * Supports Italian Thali-style composite meals with portion scaling
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
interface ComboCalculationRequest {
  organizationId: string;
  comboItems: ComboItem[];
  customerCount?: number;
  customizations?: ComboCustomization[];
}

interface ComboItem {
  itemId: string;
  quantity: number;
  portionSize: number; // 0.5 = half portion, 1.0 = full portion, 1.5 = extra portion
  isMandatory: boolean;
  category?: 'appetizer' | 'main' | 'side' | 'dessert' | 'beverage';
}

interface ComboCustomization {
  itemId: string;
  customizationType: 'substitute' | 'extra' | 'remove' | 'modify';
  targetItemId?: string; // For substitutions
  modifier?: string; // "extra cheese", "no onions", etc.
  priceAdjustment: number;
}

interface ComboCalculationResult {
  totalBasePrice: number;
  totalCostPrice: number;
  totalProfitMargin: number;
  itemBreakdown: ComboItemBreakdown[];
  customizationAdjustments: number;
  bulkDiscountApplied: number;
  finalPrice: number;
  preparationTime: number;
  nutritionalInfo?: NutritionalSummary;
  recommendations?: string[];
}

interface ComboItemBreakdown {
  itemId: string;
  itemName: string;
  basePrice: number;
  adjustedPrice: number;
  costPrice: number;
  quantity: number;
  portionSize: number;
  prepTimeMinutes: number;
  category: string;
}

interface NutritionalSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
}

// Calculate bulk discount based on party size
const calculateBulkDiscount = (customerCount: number, basePrice: number): number => {
  if (customerCount >= 8) return basePrice * 0.15; // 15% for parties of 8+
  if (customerCount >= 6) return basePrice * 0.10; // 10% for parties of 6+
  if (customerCount >= 4) return basePrice * 0.05; // 5% for parties of 4+
  return 0;
};

// Italian restaurant portion scaling rules
const getItalianPortionRules = (itemCategory: string, portionSize: number) => {
  const rules = {
    appetizer: {
      minPortion: 0.5,
      maxPortion: 2.0,
      priceMultiplier: portionSize < 1.0 ? 0.7 : portionSize, // Half antipasti = 70% price
      costMultiplier: portionSize
    },
    main: {
      minPortion: 0.5,
      maxPortion: 1.5,
      priceMultiplier: portionSize,
      costMultiplier: portionSize
    },
    side: {
      minPortion: 0.5,
      maxPortion: 3.0, // Generous side portions
      priceMultiplier: portionSize < 1.0 ? 0.8 : portionSize,
      costMultiplier: portionSize
    },
    dessert: {
      minPortion: 0.5,
      maxPortion: 2.0,
      priceMultiplier: portionSize,
      costMultiplier: portionSize
    },
    beverage: {
      minPortion: 1.0,
      maxPortion: 2.0,
      priceMultiplier: portionSize,
      costMultiplier: portionSize
    }
  };

  return rules[itemCategory as keyof typeof rules] || rules.main;
};

// POST /api/menu/combos/calculate
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body: ComboCalculationRequest = await request.json();

    console.log('Calculating combo meal with data:', JSON.stringify(body, null, 2));

    // Validate request
    if (!body.organizationId || !body.comboItems || body.comboItems.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, comboItems' },
        { status: 400 }
      );
    }

    const customerCount = body.customerCount || 1;
    const customizations = body.customizations || [];

    // Get menu items data
    const itemIds = body.comboItems.map(item => item.itemId);
    const { data: menuItems, error: itemsError } = await supabase
      .from('core_entities')
      .select(`
        *,
        core_dynamic_data(field_name, field_value)
      `)
      .in('id', itemIds)
      .eq('organization_id', body.organizationId)
      .eq('is_active', true);

    if (itemsError) {
      console.error('Error fetching menu items:', itemsError);
      return NextResponse.json(
        { error: 'Failed to fetch menu items' },
        { status: 500 }
      );
    }

    // Build item data map
    const itemDataMap = new Map();
    menuItems?.forEach(item => {
      const dynamicData = (item.core_dynamic_data || []).reduce((acc: any, field: any) => {
        acc[field.field_name] = field.field_value;
        return acc;
      }, {});

      itemDataMap.set(item.id, {
        id: item.id,
        name: item.entity_name,
        basePrice: parseFloat(dynamicData.base_price || '0'),
        costPrice: parseFloat(dynamicData.cost_price || '0'),
        prepTimeMinutes: parseInt(dynamicData.prep_time_minutes || '0'),
        category: dynamicData.category || 'main',
        nutritionalInfo: dynamicData.nutritional_info ? JSON.parse(dynamicData.nutritional_info) : null
      });
    });

    // Calculate combo breakdown
    let totalBasePrice = 0;
    let totalCostPrice = 0;
    let totalPrepTime = 0;
    let customizationAdjustments = 0;
    const itemBreakdown: ComboItemBreakdown[] = [];
    const nutritionalSummary: NutritionalSummary = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sodium: 0
    };

    // Process each combo item
    for (const comboItem of body.comboItems) {
      const itemData = itemDataMap.get(comboItem.itemId);
      if (!itemData) {
        console.warn(`Menu item not found: ${comboItem.itemId}`);
        continue;
      }

      // Apply Italian portion scaling
      const portionRules = getItalianPortionRules(itemData.category, comboItem.portionSize);
      const adjustedPrice = itemData.basePrice * portionRules.priceMultiplier * comboItem.quantity;
      const adjustedCost = itemData.costPrice * portionRules.costMultiplier * comboItem.quantity;
      const itemPrepTime = itemData.prepTimeMinutes * comboItem.quantity;

      totalBasePrice += adjustedPrice;
      totalCostPrice += adjustedCost;
      totalPrepTime = Math.max(totalPrepTime, itemPrepTime); // Parallel preparation

      // Add to breakdown
      itemBreakdown.push({
        itemId: comboItem.itemId,
        itemName: itemData.name,
        basePrice: itemData.basePrice,
        adjustedPrice: adjustedPrice,
        costPrice: adjustedCost,
        quantity: comboItem.quantity,
        portionSize: comboItem.portionSize,
        prepTimeMinutes: itemPrepTime,
        category: itemData.category
      });

      // Aggregate nutritional info
      if (itemData.nutritionalInfo) {
        const nutrition = itemData.nutritionalInfo;
        const multiplier = comboItem.quantity * comboItem.portionSize;
        nutritionalSummary.calories += (nutrition.calories || 0) * multiplier;
        nutritionalSummary.protein += (nutrition.protein || 0) * multiplier;
        nutritionalSummary.carbs += (nutrition.carbs || 0) * multiplier;
        nutritionalSummary.fat += (nutrition.fat || 0) * multiplier;
        nutritionalSummary.fiber += (nutrition.fiber || 0) * multiplier;
        nutritionalSummary.sodium += (nutrition.sodium || 0) * multiplier;
      }
    }

    // Apply customization adjustments
    customizations.forEach(customization => {
      customizationAdjustments += customization.priceAdjustment;
    });

    // Calculate bulk discount
    const bulkDiscountApplied = calculateBulkDiscount(customerCount, totalBasePrice);

    // Calculate final price
    const finalPrice = Math.max(0, totalBasePrice + customizationAdjustments - bulkDiscountApplied);
    const totalProfitMargin = totalCostPrice > 0 ? 
      Math.round(((finalPrice - totalCostPrice) / finalPrice) * 100 * 100) / 100 : 0;

    // Generate recommendations
    const recommendations = [];
    if (totalProfitMargin < 20) {
      recommendations.push("Consider adjusting portion sizes or ingredients to improve profit margin");
    }
    if (totalPrepTime > 45) {
      recommendations.push("High preparation time - consider pre-preparation strategies");
    }
    if (bulkDiscountApplied > 0) {
      recommendations.push(`Party discount of $${bulkDiscountApplied.toFixed(2)} applied for ${customerCount} customers`);
    }
    if (nutritionalSummary.calories > 1200) {
      recommendations.push("High calorie content - consider offering lighter options");
    }

    const result: ComboCalculationResult = {
      totalBasePrice: Math.round(totalBasePrice * 100) / 100,
      totalCostPrice: Math.round(totalCostPrice * 100) / 100,
      totalProfitMargin: totalProfitMargin,
      itemBreakdown: itemBreakdown,
      customizationAdjustments: Math.round(customizationAdjustments * 100) / 100,
      bulkDiscountApplied: Math.round(bulkDiscountApplied * 100) / 100,
      finalPrice: Math.round(finalPrice * 100) / 100,
      preparationTime: totalPrepTime,
      nutritionalInfo: nutritionalSummary,
      recommendations: recommendations
    };

    console.log(`✅ Combo calculated: $${result.finalPrice} (${result.totalProfitMargin}% margin)`);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Combo calculation POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/menu/combos/calculate?organizationId=xxx&presetCombo=family-feast
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const presetCombo = searchParams.get('presetCombo');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    // Predefined combo presets for Mario's Italian Restaurant
    const comboPresets = {
      'family-feast': {
        name: 'Family Feast',
        description: 'Perfect for 4-6 people',
        customerCount: 5,
        comboItems: [
          { itemId: 'placeholder-antipasti', quantity: 2, portionSize: 1.5, isMandatory: true, category: 'appetizer' },
          { itemId: 'placeholder-pasta-1', quantity: 2, portionSize: 1.0, isMandatory: true, category: 'main' },
          { itemId: 'placeholder-pasta-2', quantity: 2, portionSize: 1.0, isMandatory: true, category: 'main' },
          { itemId: 'placeholder-salad', quantity: 1, portionSize: 2.0, isMandatory: true, category: 'side' },
          { itemId: 'placeholder-bread', quantity: 1, portionSize: 2.0, isMandatory: true, category: 'side' },
          { itemId: 'placeholder-tiramisu', quantity: 1, portionSize: 1.5, isMandatory: false, category: 'dessert' }
        ]
      },
      'romantic-dinner': {
        name: 'Romantic Dinner for Two',
        description: 'Intimate dining experience',
        customerCount: 2,
        comboItems: [
          { itemId: 'placeholder-bruschetta', quantity: 1, portionSize: 1.0, isMandatory: true, category: 'appetizer' },
          { itemId: 'placeholder-main-1', quantity: 1, portionSize: 1.0, isMandatory: true, category: 'main' },
          { itemId: 'placeholder-main-2', quantity: 1, portionSize: 1.0, isMandatory: true, category: 'main' },
          { itemId: 'placeholder-wine', quantity: 1, portionSize: 1.0, isMandatory: true, category: 'beverage' },
          { itemId: 'placeholder-dessert', quantity: 1, portionSize: 1.0, isMandatory: true, category: 'dessert' }
        ]
      },
      'lunch-special': {
        name: 'Quick Lunch Special',
        description: 'Fast and delicious',
        customerCount: 1,
        comboItems: [
          { itemId: 'placeholder-soup', quantity: 1, portionSize: 0.75, isMandatory: true, category: 'appetizer' },
          { itemId: 'placeholder-pasta', quantity: 1, portionSize: 1.0, isMandatory: true, category: 'main' },
          { itemId: 'placeholder-drink', quantity: 1, portionSize: 1.0, isMandatory: true, category: 'beverage' }
        ]
      }
    };

    if (presetCombo && comboPresets[presetCombo as keyof typeof comboPresets]) {
      const preset = comboPresets[presetCombo as keyof typeof comboPresets];
      return NextResponse.json({
        success: true,
        data: {
          preset: preset,
          calculationEndpoint: '/api/menu/combos/calculate',
          instructions: 'POST the combo items to the calculation endpoint to get pricing'
        }
      });
    }

    // Return all available presets
    return NextResponse.json({
      success: true,
      data: {
        availablePresets: Object.keys(comboPresets),
        presets: comboPresets,
        usage: 'Use ?presetCombo=family-feast to get specific preset details'
      }
    });

  } catch (error) {
    console.error('Combo calculation GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}