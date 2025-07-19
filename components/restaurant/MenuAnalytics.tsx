'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, BarChart3, TrendingUp, DollarSign, Clock, AlertCircle, Star, Target, Lightbulb } from 'lucide-react';

/**
 * Menu Analytics Component
 * 
 * Following the same patterns as Purchase Orders analytics:
 * - Professional charts and insights
 * - Real-time data analysis
 * - Actionable recommendations
 * - Performance metrics for menu items and categories
 */

interface MenuAnalyticsProps {
  organizationId: string;
  onClose: () => void;
}

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
  excellentMargin: number;
  goodMargin: number;
  fairMargin: number;
  poorMargin: number;
  averageMarginByCategory: Record<string, number>;
  riskItems: MenuItem[];
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

export const MenuAnalytics: React.FC<MenuAnalyticsProps> = ({ organizationId, onClose }) => {
  const [analytics, setAnalytics] = useState<MenuAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [organizationId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/menu/analytics?organizationId=${organizationId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load analytics');
      }

      const result = await response.json();
      setAnalytics(result.data);

    } catch (err) {
      console.error('Error loading menu analytics:', err);
      setError('Failed to load analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pricing': return DollarSign;
      case 'cost': return TrendingUp;
      case 'menu_engineering': return Target;
      case 'operational': return Clock;
      default: return Lightbulb;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          <Card className="border-0 shadow-2xl">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
          <Card className="border-0 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="flex items-center text-lg">
                <AlertCircle className="mr-2 h-5 w-5 text-red-600" />
                Analytics Error
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <div className="flex space-x-3">
                <Button onClick={loadAnalytics} className="flex-1">
                  Retry
                </Button>
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center text-lg">
              <BarChart3 className="mr-2 h-5 w-5 text-orange-600" />
              Menu Performance Analytics
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {analytics.summary.totalItems}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Total Items</p>
                    <p className="text-xs text-blue-500 mt-1">
                      {analytics.summary.totalCategories} categories
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      ${analytics.summary.averageItemPrice.toFixed(2)}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">Avg Price</p>
                    <p className="text-xs text-green-500 mt-1">
                      ${analytics.summary.totalMenuValue.toFixed(0)} total value
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {analytics.summary.averageProfitMargin.toFixed(1)}%
                    </p>
                    <p className="text-sm text-purple-600 dark:text-purple-400">Avg Margin</p>
                    <p className="text-xs text-purple-500 mt-1">profit margin</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                      {analytics.profitabilityAnalysis.excellentMargin}
                    </p>
                    <p className="text-sm text-orange-600 dark:text-orange-400">High Margin</p>
                    <p className="text-xs text-orange-500 mt-1">items (30%+ margin)</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Price & Margin Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Price Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.trends.priceDistribution.map((range, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {range.range}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 transition-all duration-300"
                              style={{ width: `${range.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                            {range.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Margin Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.trends.marginDistribution.map((range, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {range.range}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${
                                range.range.includes('Excellent') ? 'bg-green-500' :
                                range.range.includes('Good') ? 'bg-blue-500' :
                                range.range.includes('Fair') ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${range.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                            {range.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Category Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 text-sm font-medium text-gray-900 dark:text-gray-100">Category</th>
                        <th className="text-center py-2 text-sm font-medium text-gray-900 dark:text-gray-100">Items</th>
                        <th className="text-center py-2 text-sm font-medium text-gray-900 dark:text-gray-100">Avg Price</th>
                        <th className="text-center py-2 text-sm font-medium text-gray-900 dark:text-gray-100">Avg Margin</th>
                        <th className="text-center py-2 text-sm font-medium text-gray-900 dark:text-gray-100">Price Range</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.categoryPerformance.map((category, index) => (
                        <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-3">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {category.categoryName}
                            </div>
                          </td>
                          <td className="py-3 text-center">
                            <Badge variant="secondary">{category.itemCount}</Badge>
                          </td>
                          <td className="py-3 text-center">
                            <span className="font-medium">${category.averagePrice.toFixed(2)}</span>
                          </td>
                          <td className="py-3 text-center">
                            <Badge 
                              variant={category.averageMargin > 20 ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {category.averageMargin.toFixed(1)}%
                            </Badge>
                          </td>
                          <td className="py-3 text-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              ${category.priceRange.min.toFixed(2)} - ${category.priceRange.max.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Star className="mr-2 h-5 w-5 text-yellow-500" />
                    Highest Profit Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.topItems.highestProfit.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{item.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{item.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600 dark:text-green-400">
                            ${(item.price - item.cost).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {item.margin.toFixed(1)}% margin
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-blue-500" />
                    Quickest Prep Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.topItems.quickestPrep.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{item.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{item.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-blue-600 dark:text-blue-400">
                            {item.prepTime} min
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            ${item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />
                  AI Recommendations ({analytics.recommendations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.recommendations.map((recommendation, index) => {
                    const TypeIcon = getTypeIcon(recommendation.type);
                    return (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <TypeIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                              {recommendation.title}
                            </h4>
                          </div>
                          <Badge className={getPriorityColor(recommendation.priority)}>
                            {recommendation.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {recommendation.description}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 mb-2">
                          <strong>Impact:</strong> {recommendation.impact}
                        </p>
                        {recommendation.itemsAffected && recommendation.itemsAffected.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {recommendation.itemsAffected.slice(0, 3).map((item, itemIndex) => (
                              <Badge key={itemIndex} variant="outline" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                            {recommendation.itemsAffected.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{recommendation.itemsAffected.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Risk Items */}
            {analytics.profitabilityAnalysis.riskItems.length > 0 && (
              <Card className="border-red-200 dark:border-red-800">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center text-red-600 dark:text-red-400">
                    <AlertCircle className="mr-2 h-5 w-5" />
                    Risk Items (Low Margin)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analytics.profitabilityAnalysis.riskItems.map((item, index) => (
                      <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-red-900 dark:text-red-100">{item.name}</p>
                            <p className="text-sm text-red-600 dark:text-red-400">{item.category}</p>
                          </div>
                          <Badge variant="destructive" className="text-xs">
                            {item.margin.toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                          Price: ${item.price.toFixed(2)} • Cost: ${item.cost.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Close Button */}
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={onClose} className="bg-orange-600 hover:bg-orange-700">
                Close Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};