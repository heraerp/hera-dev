/**
 * HERA Combo Calculation Demo Component
 * Demonstrates the comprehensive combo meal calculation system
 * using all 5 core HERA Universal tables
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MenuManagementService } from '@/lib/services/menuManagementService';
import { useOrganizationContext } from '@/components/restaurant/organization-guard';
import {
  Calculator,
  DollarSign,
  TrendingUp,
  Users,
  Clock,
  Star,
  ShoppingCart,
  PieChart,
  Activity,
  Zap,
  Target,
  Award,
  Loader2
} from 'lucide-react';

interface ComboCalculationDemoProps {
  organizationId: string;
}

export default function ComboCalculationDemo({ organizationId }: ComboCalculationDemoProps) {
  const [menuService, setMenuService] = useState<MenuManagementService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comboData, setComboData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [demoComboId, setDemoComboId] = useState<string | null>(null);

  useEffect(() => {
    if (organizationId) {
      const service = MenuManagementService.getInstance(organizationId);
      setMenuService(service);
      initializeDemo(service);
    }
  }, [organizationId]);

  const initializeDemo = async (service: MenuManagementService) => {
    try {
      setLoading(true);
      setError(null);

      // Create demo combo meal if it doesn't exist
      const demoCombo = await service.createComboMeal({
        name: 'Burger Combo Deluxe',
        description: 'Classic burger with crispy fries and refreshing drink',
        components: [
          {
            item_id: 'demo-burger-123', // This would be actual item IDs in real implementation
            quantity: 1,
            role: 'main',
            customizable: true
          },
          {
            item_id: 'demo-fries-456',
            quantity: 1,
            role: 'side',
            customizable: false
          },
          {
            item_id: 'demo-drink-789',
            quantity: 1,
            role: 'beverage',
            customizable: true
          }
        ],
        discount_percentage: 20,
        image_url: 'https://example.com/burger-combo.jpg'
      });

      if (demoCombo.success) {
        setDemoComboId(demoCombo.data.combo_id);
        setComboData(demoCombo.data);
        
        // Get comprehensive analysis
        const analysisResult = await service.getComboAnalysis(demoCombo.data.combo_id);
        if (analysisResult.success) {
          setAnalysis(analysisResult.data);
        }
      }
    } catch (error) {
      console.error('Demo initialization failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize demo');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value * 100) / 100}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Initializing combo calculation demo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertDescription className="text-red-800">{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🍔 HERA Combo Calculation System
        </h1>
        <p className="text-gray-600 mb-4">
          Comprehensive combo meal pricing with all 5 core HERA Universal tables
        </p>
        <div className="flex justify-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-800">
            <Calculator className="w-3 h-3 mr-1" />
            Dynamic Pricing
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-800">
            <PieChart className="w-3 h-3 mr-1" />
            Nutritional Analysis
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-800">
            <Activity className="w-3 h-3 mr-1" />
            AI Insights
          </Badge>
        </div>
      </div>

      {/* Combo Overview */}
      {comboData && (
        <Card className="bg-gradient-to-r from-orange-50 to-red-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-orange-600" />
              <span>Combo Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(comboData.combo_price)}
                </div>
                <div className="text-sm text-gray-600">Combo Price</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {formatCurrency(comboData.individual_total)}
                </div>
                <div className="text-sm text-gray-600">Individual Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(comboData.savings)}
                </div>
                <div className="text-sm text-gray-600">Savings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatPercentage(comboData.savings_percentage)}
                </div>
                <div className="text-sm text-gray-600">Discount</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Component Breakdown */}
      {comboData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span>Component Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {comboData.components.map((component: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">{component.name}</div>
                      <div className="text-sm text-gray-600">
                        Quantity: {component.quantity} | Role: {component.role}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(component.total_price)}</div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(component.individual_price)} each
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comprehensive Analysis */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pricing Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span>Pricing Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Combo Price:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(analysis.pricing_analysis.combo_price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Individual Total:</span>
                  <span className="font-semibold">
                    {formatCurrency(analysis.pricing_analysis.individual_total)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Savings:</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(analysis.pricing_analysis.savings)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Savings Percentage:</span>
                  <span className="font-semibold text-blue-600">
                    {formatPercentage(analysis.pricing_analysis.savings_percentage)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Nutritional Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-purple-600" />
                <span>Nutritional Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Calories:</span>
                  <span className="font-semibold">{analysis.nutrition_analysis.total_calories}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Protein:</span>
                  <span className="font-semibold">{analysis.nutrition_analysis.protein}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Carbs:</span>
                  <span className="font-semibold">{analysis.nutrition_analysis.carbs}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fat:</span>
                  <span className="font-semibold">{analysis.nutrition_analysis.fat}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Health Score:</span>
                  <span className="font-semibold text-green-600">
                    {analysis.nutrition_analysis.health_score}/10
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Intelligence */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <span>Business Intelligence</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Value Proposition:</span>
                  <Badge variant={analysis.business_intelligence.value_proposition === 'Excellent' ? 'default' : 'secondary'}>
                    {analysis.business_intelligence.value_proposition}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Component Balance:</span>
                  <Badge variant={analysis.business_intelligence.component_balance === 'Perfect Balance' ? 'default' : 'secondary'}>
                    {analysis.business_intelligence.component_balance}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Upsell Potential:</span>
                  <Badge variant={analysis.business_intelligence.upsell_potential === 'High' ? 'default' : 'secondary'}>
                    {analysis.business_intelligence.upsell_potential}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Profit Margin:</span>
                  <span className="font-semibold text-green-600">
                    {formatPercentage(analysis.business_intelligence.profit_margin * 100)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                <span>AI Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Star className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Performance Score</span>
                  </div>
                  <div className="text-sm text-blue-700">
                    This combo shows excellent performance with high customer satisfaction
                    and strong reorder rates during peak hours.
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-800">Customer Behavior</span>
                  </div>
                  <div className="text-sm text-green-700">
                    High customization rate with strong upsell success.
                    Most popular during lunch hours.
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Award className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-purple-800">Recommendations</span>
                  </div>
                  <div className="text-sm text-purple-700">
                    Consider promoting during off-peak hours and adding seasonal variations
                    to maintain interest.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* System Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <span>System Features Demonstrated</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  core_entities
                </Badge>
              </div>
              <div className="text-sm text-green-700">
                Combo meal and component items stored as flexible entities
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  core_dynamic_data
                </Badge>
              </div>
              <div className="text-sm text-blue-700">
                Pricing, descriptions, and properties stored flexibly
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline" className="bg-purple-100 text-purple-800">
                  core_metadata
                </Badge>
              </div>
              <div className="text-sm text-purple-700">
                Nutritional info, AI insights, and business intelligence
              </div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline" className="bg-orange-100 text-orange-800">
                  core_relationships
                </Badge>
              </div>
              <div className="text-sm text-orange-700">
                Combo-to-component relationships with quantities and roles
              </div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline" className="bg-red-100 text-red-800">
                  core_organizations
                </Badge>
              </div>
              <div className="text-sm text-red-700">
                Organization-specific pricing settings and preferences
              </div>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline" className="bg-indigo-100 text-indigo-800">
                  Dynamic Calculation
                </Badge>
              </div>
              <div className="text-sm text-indigo-700">
                Real-time pricing with customizations and rule application
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button 
          onClick={() => initializeDemo(menuService!)}
          disabled={!menuService}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Calculator className="w-4 h-4 mr-2" />
          Recalculate Combo
        </Button>
        <Button 
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Reset Demo
        </Button>
      </div>
    </div>
  );
}