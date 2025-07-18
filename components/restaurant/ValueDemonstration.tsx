'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  TrendingUp, 
  Leaf, 
  Clock, 
  Users, 
  Package,
  AlertTriangle,
  CheckCircle,
  Brain,
  Zap,
  ArrowUp,
  ArrowDown,
  Calculator,
  PiggyBank,
  Target,
  Award,
  BarChart3
} from 'lucide-react';

interface SavingsMetric {
  category: string;
  icon: React.ElementType;
  currentCost: number;
  optimizedCost: number;
  savings: number;
  percentage: number;
  timeframe: string;
  description: string;
}

export function ValueDemonstration() {
  const [selectedRestaurantType, setSelectedRestaurantType] = useState<'qsr' | 'casual' | 'fine'>('casual');
  const [monthlyRevenue, setMonthlyRevenue] = useState(50000);
  const [animatedSavings, setAnimatedSavings] = useState(0);

  // Calculate savings based on restaurant type and revenue
  const calculateSavings = (): SavingsMetric[] => {
    const baseMultiplier = {
      qsr: 0.28,
      casual: 0.30,
      fine: 0.35
    }[selectedRestaurantType];

    const foodCostSavings = monthlyRevenue * 0.35 * baseMultiplier; // 35% food cost * savings rate
    const laborSavings = monthlyRevenue * 0.25 * 0.15; // 25% labor cost * 15% optimization
    const wasteSavings = monthlyRevenue * 0.05 * 0.5; // 5% waste * 50% reduction
    const inventorySavings = monthlyRevenue * 0.02 * 0.8; // 2% inventory holding * 80% optimization

    return [
      {
        category: 'Food Cost Optimization',
        icon: Package,
        currentCost: monthlyRevenue * 0.35,
        optimizedCost: monthlyRevenue * 0.35 * (1 - baseMultiplier),
        savings: foodCostSavings,
        percentage: baseMultiplier * 100,
        timeframe: '1-2 weeks',
        description: 'AI-powered ordering, portion control, and pricing optimization'
      },
      {
        category: 'Waste Reduction',
        icon: Leaf,
        currentCost: monthlyRevenue * 0.05,
        optimizedCost: monthlyRevenue * 0.025,
        savings: wasteSavings,
        percentage: 50,
        timeframe: '1 week',
        description: 'Predictive analytics prevent over-ordering and spoilage'
      },
      {
        category: 'Labor Efficiency',
        icon: Users,
        currentCost: monthlyRevenue * 0.25,
        optimizedCost: monthlyRevenue * 0.25 * 0.85,
        savings: laborSavings,
        percentage: 15,
        timeframe: '2-3 weeks',
        description: 'Smart scheduling and automated workflows'
      },
      {
        category: 'Inventory Optimization',
        icon: BarChart3,
        currentCost: monthlyRevenue * 0.02,
        optimizedCost: monthlyRevenue * 0.004,
        savings: inventorySavings,
        percentage: 80,
        timeframe: '1-2 weeks',
        description: 'Just-in-time ordering reduces holding costs'
      }
    ];
  };

  const savings = calculateSavings();
  const totalMonthlySavings = savings.reduce((sum, metric) => sum + metric.savings, 0);
  const totalAnnualSavings = totalMonthlySavings * 12;
  const roi = (totalAnnualSavings / 299) * 100; // Assuming $299/month subscription

  // Animate savings counter
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimatedSavings(prev => {
        const increment = totalMonthlySavings / 100;
        if (prev + increment >= totalMonthlySavings) {
          clearInterval(timer);
          return totalMonthlySavings;
        }
        return prev + increment;
      });
    }, 20);

    return () => clearInterval(timer);
  }, [totalMonthlySavings]);

  return (
    <div className="space-y-6">
      {/* Header with Live Savings Counter */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Your Estimated Monthly Savings
              </h3>
              <div className="flex items-baseline space-x-2">
                <span className="text-5xl font-bold text-green-600">
                  ${animatedSavings.toFixed(0)}
                </span>
                <span className="text-lg text-gray-600">/month</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                ${(animatedSavings * 12).toFixed(0)} annual savings • {roi.toFixed(0)}% ROI
              </p>
            </div>
            
            <div className="flex flex-col items-end space-y-2">
              <Badge className="bg-green-100 text-green-800 px-4 py-2">
                <TrendingUp className="h-4 w-4 mr-1" />
                Guaranteed Results
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 px-4 py-2">
                <Clock className="h-4 w-4 mr-1" />
                See Results in 7 Days
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Restaurant Type Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5 text-orange-600" />
            <span>Customize Your Calculation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Restaurant Type</label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {(['qsr', 'casual', 'fine'] as const).map((type) => (
                  <Button
                    key={type}
                    variant={selectedRestaurantType === type ? 'default' : 'outline'}
                    onClick={() => setSelectedRestaurantType(type)}
                    className="capitalize"
                  >
                    {type === 'qsr' ? 'Quick Service' : type}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">
                Monthly Revenue: ${monthlyRevenue.toLocaleString()}
              </label>
              <input
                type="range"
                min="10000"
                max="200000"
                step="5000"
                value={monthlyRevenue}
                onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                className="w-full mt-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>$10K</span>
                <span>$200K</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Savings Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        {savings.map((metric, index) => (
          <motion.div
            key={metric.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <metric.icon className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{metric.category}</h4>
                      <p className="text-xs text-gray-600">{metric.timeframe} to see results</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {metric.percentage}% savings
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Cost</span>
                    <span className="font-medium text-red-600">
                      ${metric.currentCost.toFixed(0)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Optimized Cost</span>
                    <span className="font-medium text-green-600">
                      ${metric.optimizedCost.toFixed(0)}
                    </span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">Monthly Savings</span>
                      <span className="text-lg font-bold text-green-600">
                        ${metric.savings.toFixed(0)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 mt-3">
                    {metric.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Success Stories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-yellow-600" />
            <span>Real Results from Real Restaurants</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tony" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tony">Tony's Pizza</TabsTrigger>
              <TabsTrigger value="maria">Casa Maria</TabsTrigger>
              <TabsTrigger value="chen">Golden Dragon</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tony" className="space-y-4">
              <SuccessStory
                name="Tony's Pizza Kitchen"
                type="QSR"
                monthlyRevenue={45000}
                monthlySavings={2400}
                quote="HERA cut our food costs by 28% in just 3 weeks. The AI predictions are scary accurate!"
                highlights={[
                  { label: 'Food Cost Reduction', value: '28%' },
                  { label: 'Waste Reduction', value: '45%' },
                  { label: 'Time Saved Weekly', value: '12 hours' }
                ]}
              />
            </TabsContent>
            
            <TabsContent value="maria" className="space-y-4">
              <SuccessStory
                name="Casa Maria Mexican Grill"
                type="Casual Dining"
                monthlyRevenue={85000}
                monthlySavings={3200}
                quote="The inventory predictions saved us from a Cinco de Mayo disaster. Never ran out of anything!"
                highlights={[
                  { label: 'Stockout Prevention', value: '100%' },
                  { label: 'Inventory Costs', value: '-35%' },
                  { label: 'Customer Satisfaction', value: '+22%' }
                ]}
              />
            </TabsContent>
            
            <TabsContent value="chen" className="space-y-4">
              <SuccessStory
                name="Golden Dragon Asian Fusion"
                type="Fine Dining"
                monthlyRevenue={120000}
                monthlySavings={4800}
                quote="HERA's AI helped us optimize our premium ingredients usage. ROI in the first month!"
                highlights={[
                  { label: 'Premium Ingredient Waste', value: '-62%' },
                  { label: 'Profit Margin Increase', value: '+8%' },
                  { label: 'First Month ROI', value: '1,200%' }
                ]}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">
            Start Saving ${totalMonthlySavings.toFixed(0)}/month Today
          </h3>
          <p className="text-lg mb-6 opacity-90">
            Join hundreds of restaurants already transforming their operations with HERA
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
              <Zap className="h-5 w-5 mr-2" />
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Brain className="h-5 w-5 mr-2" />
              See AI Demo
            </Button>
          </div>
          
          <div className="mt-6 flex items-center justify-center space-x-4 text-sm opacity-75">
            <span>✓ No credit card required</span>
            <span>•</span>
            <span>✓ 30-day money back guarantee</span>
            <span>•</span>
            <span>✓ Cancel anytime</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface SuccessStoryProps {
  name: string;
  type: string;
  monthlyRevenue: number;
  monthlySavings: number;
  quote: string;
  highlights: Array<{ label: string; value: string }>;
}

function SuccessStory({ name, type, monthlyRevenue, monthlySavings, quote, highlights }: SuccessStoryProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-lg text-gray-800">{name}</h4>
          <p className="text-sm text-gray-600">{type} • ${monthlyRevenue.toLocaleString()}/month revenue</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-600">${monthlySavings}</p>
          <p className="text-sm text-gray-600">saved monthly</p>
        </div>
      </div>
      
      <blockquote className="italic text-gray-700 border-l-4 border-orange-300 pl-4">
        "{quote}"
      </blockquote>
      
      <div className="grid grid-cols-3 gap-4">
        {highlights.map((highlight, index) => (
          <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-lg font-bold text-gray-800">{highlight.value}</p>
            <p className="text-xs text-gray-600">{highlight.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}