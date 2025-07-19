/**
 * HERA Universal - Menu Analytics API
 * 
 * Next.js 15 App Router API Route Handler
 * Provides menu performance analytics, sales insights, and profitability reports
 * 
 * Uses HERA's 5-table universal architecture for comprehensive menu analytics
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
interface MenuAnalytics {
  summary: MenuSummary;
  categoryPerformance: CategoryPerformance[];
  topItems: TopPerformingItems;
  profitabilityAnalysis: ProfitabilityAnalysis;
  recommendations: AnalyticsRecommendation[];
  trends: MenuTrends;
}

interface MenuSummary {
  totalItems: number;
  totalCategories: number;
  averageItemPrice: number;
  averageProfitMargin: number;
  totalMenuValue: number;
  mostExpensiveItem: string;
  cheapestItem: string;
  highestMarginItem: string;
  lowestMarginItem: string;
}

interface CategoryPerformance {
  categoryId: string;
  categoryName: string;
  itemCount: number;
  averagePrice: number;
  averageMargin: number;
  totalValue: number;
  priceRange: {
    min: number;
    max: number;
  };
}

interface TopPerformingItems {
  highestProfit: MenuItem[];
  lowestCost: MenuItem[];
  quickestPrep: MenuItem[];
  premiumItems: MenuItem[];
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  cost: number;
  margin: number;
  prepTime: number;
  category: string;
}

interface ProfitabilityAnalysis {
  excellentMargin: number; // Count of items with >30% margin
  goodMargin: number; // Count of items with 20-30% margin
  fairMargin: number; // Count of items with 10-20% margin
  poorMargin: number; // Count of items with <10% margin
  averageMarginByCategory: Record<string, number>;
  riskItems: MenuItem[]; // Items with very low margins
}

interface AnalyticsRecommendation {
  type: 'pricing' | 'cost' | 'menu_engineering' | 'operational';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  itemsAffected?: string[];
}

interface MenuTrends {
  priceDistribution: PriceDistribution[];
  marginDistribution: MarginDistribution[];
  prepTimeDistribution: PrepTimeDistribution[];
}

interface PriceDistribution {
  range: string;
  count: number;
  percentage: number;
}

interface MarginDistribution {
  range: string;
  count: number;
  percentage: number;
}

interface PrepTimeDistribution {
  range: string;
  count: number;
  percentage: number;
}

// Calculate price distribution
const calculatePriceDistribution = (items: MenuItem[]): PriceDistribution[] => {
  const ranges = [
    { min: 0, max: 10, label: '$0-$10' },
    { min: 10, max: 20, label: '$10-$20' },
    { min: 20, max: 30, label: '$20-$30' },
    { min: 30, max: 50, label: '$30-$50' },
    { min: 50, max: Infinity, label: '$50+' }
  ];

  return ranges.map(range => {
    const count = items.filter(item => item.price >= range.min && item.price < range.max).length;
    return {
      range: range.label,
      count,
      percentage: Math.round((count / items.length) * 100 * 100) / 100
    };
  });
};

// Calculate margin distribution
const calculateMarginDistribution = (items: MenuItem[]): MarginDistribution[] => {
  const ranges = [
    { min: -Infinity, max: 0, label: 'Loss (<0%)' },
    { min: 0, max: 10, label: 'Poor (0-10%)' },
    { min: 10, max: 20, label: 'Fair (10-20%)' },
    { min: 20, max: 30, label: 'Good (20-30%)' },
    { min: 30, max: Infinity, label: 'Excellent (30%+)' }
  ];

  return ranges.map(range => {
    const count = items.filter(item => item.margin >= range.min && item.margin < range.max).length;
    return {
      range: range.label,
      count,
      percentage: Math.round((count / items.length) * 100 * 100) / 100
    };
  });
};

// Calculate prep time distribution
const calculatePrepTimeDistribution = (items: MenuItem[]): PrepTimeDistribution[] => {
  const ranges = [
    { min: 0, max: 15, label: 'Fast (<15 min)' },
    { min: 15, max: 30, label: 'Medium (15-30 min)' },
    { min: 30, max: 45, label: 'Slow (30-45 min)' },
    { min: 45, max: Infinity, label: 'Very Slow (45+ min)' }
  ];

  return ranges.map(range => {
    const count = items.filter(item => item.prepTime >= range.min && item.prepTime < range.max).length;
    return {
      range: range.label,
      count,
      percentage: Math.round((count / items.length) * 100 * 100) / 100
    };
  });
};

// Generate analytics recommendations
const generateRecommendations = (items: MenuItem[], categoryPerformance: CategoryPerformance[]): AnalyticsRecommendation[] => {
  const recommendations: AnalyticsRecommendation[] = [];

  // Find low margin items
  const lowMarginItems = items.filter(item => item.margin < 15);
  if (lowMarginItems.length > 0) {
    recommendations.push({
      type: 'pricing',
      priority: 'high',
      title: 'Review Low Margin Items',
      description: `${lowMarginItems.length} items have profit margins below 15%. Consider repricing or reducing costs.`,
      impact: `Potential revenue increase of $${Math.round(lowMarginItems.reduce((sum, item) => sum + (item.price * 0.1), 0))} per day`,
      itemsAffected: lowMarginItems.map(item => item.name)
    });
  }

  // Find high prep time items
  const slowItems = items.filter(item => item.prepTime > 30);
  if (slowItems.length > 0) {
    recommendations.push({
      type: 'operational',
      priority: 'medium',
      title: 'Optimize Prep Times',
      description: `${slowItems.length} items take over 30 minutes to prepare. Consider pre-preparation or recipe optimization.`,
      impact: 'Improved kitchen efficiency and customer satisfaction',
      itemsAffected: slowItems.map(item => item.name)
    });
  }

  // Check category balance
  const categoryMargins = categoryPerformance.map(cat => cat.averageMargin);
  const avgMargin = categoryMargins.reduce((a, b) => a + b, 0) / categoryMargins.length;
  const underperformingCategories = categoryPerformance.filter(cat => cat.averageMargin < avgMargin * 0.8);
  
  if (underperformingCategories.length > 0) {
    recommendations.push({
      type: 'menu_engineering',
      priority: 'medium',
      title: 'Category Performance Review',
      description: `${underperformingCategories.map(cat => cat.categoryName).join(', ')} categories have below-average margins.`,
      impact: 'Better menu balance and overall profitability',
      itemsAffected: underperformingCategories.map(cat => cat.categoryName)
    });
  }

  // Premium pricing opportunity
  const highMarginItems = items.filter(item => item.margin > 40);
  if (highMarginItems.length > items.length * 0.1) {
    recommendations.push({
      type: 'pricing',
      priority: 'low',
      title: 'Premium Menu Development',
      description: `${highMarginItems.length} items show excellent margins. Consider developing more premium offerings.`,
      impact: 'Increased average check size and profitability',
      itemsAffected: highMarginItems.map(item => item.name)
    });
  }

  return recommendations;
};

// GET /api/menu/analytics
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const categoryId = searchParams.get('categoryId'); // Optional filter
    const dateRange = searchParams.get('dateRange') || '30'; // Days

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    console.log(`Generating menu analytics for org: ${organizationId}`);

    // Get all menu items with their dynamic data
    let query = supabase
      .from('core_entities')
      .select(`
        *,
        core_dynamic_data(field_name, field_value)
      `)
      .eq('organization_id', organizationId)
      .in('entity_type', ['menu_item', 'composite_menu_item'])
      .eq('is_active', true);

    const { data: menuItemsRaw, error: itemsError } = await query;

    if (itemsError) {
      console.error('Error fetching menu items:', itemsError);
      return NextResponse.json(
        { error: 'Failed to fetch menu items' },
        { status: 500 }
      );
    }

    // Get categories
    const { data: categoriesRaw } = await supabase
      .from('core_entities')
      .select(`
        *,
        core_dynamic_data(field_name, field_value)
      `)
      .eq('organization_id', organizationId)
      .eq('entity_type', 'menu_category')
      .eq('is_active', true);

    // Get category relationships
    const { data: categoryRelationships } = await supabase
      .from('core_relationships')
      .select('parent_entity_id, child_entity_id')
      .eq('organization_id', organizationId)
      .eq('relationship_type', 'menu_item_category')
      .eq('is_active', true);

    // Build category map
    const categoryMap = new Map();
    categoriesRaw?.forEach(category => {
      const dynamicData = (category.core_dynamic_data || []).reduce((acc: any, field: any) => {
        acc[field.field_name] = field.field_value;
        return acc;
      }, {});

      categoryMap.set(category.id, {
        id: category.id,
        name: category.entity_name,
        ...dynamicData
      });
    });

    // Build item-to-category mapping
    const itemCategoryMap = new Map();
    categoryRelationships?.forEach(rel => {
      itemCategoryMap.set(rel.child_entity_id, rel.parent_entity_id);
    });

    // Process menu items
    const menuItems: MenuItem[] = (menuItemsRaw || []).map(item => {
      const dynamicData = (item.core_dynamic_data || []).reduce((acc: any, field: any) => {
        acc[field.field_name] = field.field_value;
        return acc;
      }, {});

      const basePrice = parseFloat(dynamicData.base_price || '0');
      const costPrice = parseFloat(dynamicData.cost_price || '0');
      const prepTime = parseInt(dynamicData.prep_time_minutes || '0');
      const margin = basePrice > 0 ? Math.round(((basePrice - costPrice) / basePrice) * 100 * 100) / 100 : 0;

      const categoryId = itemCategoryMap.get(item.id);
      const category = categoryId ? categoryMap.get(categoryId) : null;

      return {
        id: item.id,
        name: item.entity_name,
        price: basePrice,
        cost: costPrice,
        margin: margin,
        prepTime: prepTime,
        category: category?.name || 'Uncategorized'
      };
    });

    // Filter by category if specified
    const filteredItems = categoryId ? 
      menuItems.filter(item => itemCategoryMap.get(item.id) === categoryId) : 
      menuItems;

    if (filteredItems.length === 0) {
      return NextResponse.json({
        data: {
          summary: { totalItems: 0 },
          message: 'No menu items found for the specified criteria'
        }
      });
    }

    // Calculate summary
    const totalItems = filteredItems.length;
    const totalCategories = new Set(filteredItems.map(item => item.category)).size;
    const averageItemPrice = Math.round(filteredItems.reduce((sum, item) => sum + item.price, 0) / totalItems * 100) / 100;
    const averageProfitMargin = Math.round(filteredItems.reduce((sum, item) => sum + item.margin, 0) / totalItems * 100) / 100;
    const totalMenuValue = Math.round(filteredItems.reduce((sum, item) => sum + item.price, 0) * 100) / 100;

    const sortedByPrice = [...filteredItems].sort((a, b) => b.price - a.price);
    const sortedByMargin = [...filteredItems].sort((a, b) => b.margin - a.margin);

    const summary: MenuSummary = {
      totalItems,
      totalCategories,
      averageItemPrice,
      averageProfitMargin,
      totalMenuValue,
      mostExpensiveItem: sortedByPrice[0]?.name || 'N/A',
      cheapestItem: sortedByPrice[sortedByPrice.length - 1]?.name || 'N/A',
      highestMarginItem: sortedByMargin[0]?.name || 'N/A',
      lowestMarginItem: sortedByMargin[sortedByMargin.length - 1]?.name || 'N/A'
    };

    // Calculate category performance
    const categoryGroups = filteredItems.reduce((groups, item) => {
      const category = item.category;
      if (!groups[category]) groups[category] = [];
      groups[category].push(item);
      return groups;
    }, {} as Record<string, MenuItem[]>);

    const categoryPerformance: CategoryPerformance[] = Object.entries(categoryGroups).map(([categoryName, items]) => {
      const prices = items.map(item => item.price);
      const margins = items.map(item => item.margin);
      
      return {
        categoryId: 'cat-' + categoryName.toLowerCase().replace(/\s+/g, '-'),
        categoryName,
        itemCount: items.length,
        averagePrice: Math.round(items.reduce((sum, item) => sum + item.price, 0) / items.length * 100) / 100,
        averageMargin: Math.round(margins.reduce((a, b) => a + b, 0) / margins.length * 100) / 100,
        totalValue: Math.round(items.reduce((sum, item) => sum + item.price, 0) * 100) / 100,
        priceRange: {
          min: Math.min(...prices),
          max: Math.max(...prices)
        }
      };
    });

    // Calculate top performing items
    const topItems: TopPerformingItems = {
      highestProfit: filteredItems.sort((a, b) => (b.price - b.cost) - (a.price - a.cost)).slice(0, 5),
      lowestCost: filteredItems.sort((a, b) => a.cost - b.cost).slice(0, 5),
      quickestPrep: filteredItems.sort((a, b) => a.prepTime - b.prepTime).slice(0, 5),
      premiumItems: filteredItems.filter(item => item.price > averageItemPrice * 1.5).slice(0, 5)
    };

    // Calculate profitability analysis
    const excellentMargin = filteredItems.filter(item => item.margin > 30).length;
    const goodMargin = filteredItems.filter(item => item.margin >= 20 && item.margin <= 30).length;
    const fairMargin = filteredItems.filter(item => item.margin >= 10 && item.margin < 20).length;
    const poorMargin = filteredItems.filter(item => item.margin < 10).length;

    const averageMarginByCategory = Object.fromEntries(
      categoryPerformance.map(cat => [cat.categoryName, cat.averageMargin])
    );

    const riskItems = filteredItems.filter(item => item.margin < 5).slice(0, 10);

    const profitabilityAnalysis: ProfitabilityAnalysis = {
      excellentMargin,
      goodMargin,
      fairMargin,
      poorMargin,
      averageMarginByCategory,
      riskItems
    };

    // Generate recommendations
    const recommendations = generateRecommendations(filteredItems, categoryPerformance);

    // Calculate trends
    const trends: MenuTrends = {
      priceDistribution: calculatePriceDistribution(filteredItems),
      marginDistribution: calculateMarginDistribution(filteredItems),
      prepTimeDistribution: calculatePrepTimeDistribution(filteredItems)
    };

    const analytics: MenuAnalytics = {
      summary,
      categoryPerformance,
      topItems,
      profitabilityAnalysis,
      recommendations,
      trends
    };

    console.log(`✅ Menu analytics generated for ${totalItems} items`);

    return NextResponse.json({
      success: true,
      data: analytics,
      metadata: {
        organizationId,
        categoryFilter: categoryId,
        dateRange: `${dateRange} days`,
        generatedAt: new Date().toISOString(),
        itemsAnalyzed: totalItems
      }
    });

  } catch (error) {
    console.error('Menu analytics GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}