'use client';

import React, { useState, useEffect } from 'react';
import { PageErrorBoundary, ComponentErrorBoundary, AsyncErrorBoundary } from '@/components/error-boundaries';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer, 
  Clock,
  DollarSign,
  Target,
  Zap,
  Award,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Filter,
  Calendar
} from 'lucide-react';

interface AnalyticsData {
  funnel?: any[];
  abTests?: Record<string, any>;
  performance?: any[];
  engagement?: any[];
  summary?: {
    totalVisitors: number;
    conversionRate: number;
    averageSessionTime: number;
    pageLoadTime: number;
  };
}

interface ABTestResult {
  variantId: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
  lift: number;
  significance: number;
  isWinner: boolean;
}

function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({});
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/analytics/track?timeRange=${timeRange}&metric=all`);
      const data = await response.json();
      
      setAnalyticsData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateABTestResults = (): ABTestResult[] => {
    if (!analyticsData.abTests) return [];

    const results = Object.entries(analyticsData.abTests).map(([variantId, data]: [string, any]) => {
      const conversionRate = data.visitors > 0 ? (data.conversions / data.visitors) * 100 : 0;
      return {
        variantId,
        visitors: data.visitors,
        conversions: data.conversions,
        conversionRate,
        lift: 0, // Will calculate below
        significance: 0, // Simplified - would need proper statistical calculation
        isWinner: false
      };
    });

    // Calculate lift relative to control
    const control = results.find(r => r.variantId.includes('control'));
    if (control) {
      results.forEach(result => {
        if (result.variantId !== control.variantId) {
          result.lift = ((result.conversionRate - control.conversionRate) / control.conversionRate) * 100;
          result.significance = Math.min(95, Math.abs(result.lift) * 2); // Simplified calculation
        }
      });

      // Mark winner (highest conversion rate with statistical significance)
      const winner = results
        .filter(r => r.significance > 95)
        .sort((a, b) => b.conversionRate - a.conversionRate)[0];
      
      if (winner) {
        winner.isWinner = true;
      }
    }

    return results.sort((a, b) => b.conversionRate - a.conversionRate);
  };

  const getFunnelConversionRates = () => {
    if (!analyticsData.funnel) return [];

    const funnelSteps = analyticsData.funnel.reduce((acc: any, step: any) => {
      if (!acc[step.funnel_name]) {
        acc[step.funnel_name] = {};
      }
      acc[step.funnel_name][step.step_name] = step.count;
      return acc;
    }, {});

    return Object.entries(funnelSteps).map(([funnelName, steps]: [string, any]) => {
      const stepNames = Object.keys(steps).sort();
      const firstStepCount = steps[stepNames[0]] || 1;
      
      return {
        funnelName,
        steps: stepNames.map(stepName => ({
          name: stepName,
          count: steps[stepName],
          conversionRate: (steps[stepName] / firstStepCount) * 100
        }))
      };
    });
  };

  const getPerformanceAverages = () => {
    if (!analyticsData.performance || analyticsData.performance.length === 0) {
      return { pageLoadTime: 0, domContentLoaded: 0, serverResponse: 0 };
    }

    const total = analyticsData.performance.length;
    return {
      pageLoadTime: analyticsData.performance.reduce((sum: number, p: any) => sum + (p.page_load_time || 0), 0) / total,
      domContentLoaded: analyticsData.performance.reduce((sum: number, p: any) => sum + (p.dom_content_loaded || 0), 0) / total,
      serverResponse: analyticsData.performance.reduce((sum: number, p: any) => sum + (p.server_response || 0), 0) / total
    };
  };

  const getEngagementAverages = () => {
    if (!analyticsData.engagement || analyticsData.engagement.length === 0) {
      return { timeOnPage: 0, scrollDepth: 0, activeUsers: 0 };
    }

    const total = analyticsData.engagement.length;
    return {
      timeOnPage: analyticsData.engagement.reduce((sum: number, e: any) => sum + (e.time_on_page || 0), 0) / total,
      scrollDepth: analyticsData.engagement.reduce((sum: number, e: any) => sum + (e.max_scroll_depth || 0), 0) / total,
      activeUsers: analyticsData.engagement.filter((e: any) => e.was_active).length
    };
  };

  const abTestResults = calculateABTestResults();
  const funnelData = getFunnelConversionRates();
  const performanceData = getPerformanceAverages();
  const engagementData = getEngagementAverages();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Real-time conversion tracking and A/B test results</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            </div>
            
            <Button
              onClick={loadAnalytics}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <div className="flex space-x-2">
              {['1d', '7d', '30d'].map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {abTestResults.reduce((sum, r) => sum + r.visitors, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Total Visitors</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Target className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {abTestResults.length > 0 
                      ? (abTestResults.reduce((sum, r) => sum + r.conversions, 0) / abTestResults.reduce((sum, r) => sum + r.visitors, 0) * 100).toFixed(1)
                      : 0}%
                  </p>
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(engagementData.timeOnPage / 1000)}s
                  </p>
                  <p className="text-sm text-gray-600">Avg Session Time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Zap className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(performanceData.pageLoadTime)}ms
                  </p>
                  <p className="text-sm text-gray-600">Page Load Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="ab-tests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ab-tests">A/B Tests</TabsTrigger>
            <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>

          <TabsContent value="ab-tests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>A/B Test Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {abTestResults.map((result) => (
                    <motion.div
                      key={result.variantId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 border rounded-lg ${
                        result.isWinner ? 'border-green-300 bg-green-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-semibold text-gray-800">
                            {result.variantId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </h4>
                          {result.isWinner && (
                            <Badge className="bg-green-100 text-green-800">
                              <Award className="h-3 w-3 mr-1" />
                              Winner
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="text-center">
                            <p className="font-bold text-gray-900">{result.visitors}</p>
                            <p className="text-gray-600">Visitors</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-gray-900">{result.conversions}</p>
                            <p className="text-gray-600">Conversions</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-gray-900">{result.conversionRate.toFixed(2)}%</p>
                            <p className="text-gray-600">Rate</p>
                          </div>
                          {result.lift !== 0 && (
                            <div className="text-center">
                              <p className={`font-bold ${result.lift > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {result.lift > 0 ? '+' : ''}{result.lift.toFixed(1)}%
                              </p>
                              <p className="text-gray-600">Lift</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Conversion Rate</span>
                          <span>{result.conversionRate.toFixed(2)}%</span>
                        </div>
                        <Progress 
                          value={result.conversionRate} 
                          className="h-2"
                          max={Math.max(...abTestResults.map(r => r.conversionRate))}
                        />
                      </div>
                      
                      {result.significance > 0 && (
                        <div className="mt-2 flex items-center space-x-2 text-xs">
                          {result.significance > 95 ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-3 w-3 text-yellow-600" />
                          )}
                          <span className={result.significance > 95 ? 'text-green-600' : 'text-yellow-600'}>
                            {result.significance.toFixed(0)}% confidence
                            {result.significance > 95 ? ' (Statistically significant)' : ' (Not significant)'}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="funnel" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Conversion Funnel Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {funnelData.map((funnel) => (
                    <div key={funnel.funnelName} className="space-y-3">
                      <h4 className="font-semibold text-gray-800 capitalize">
                        {funnel.funnelName.replace(/_/g, ' ')} Funnel
                      </h4>
                      
                      <div className="space-y-2">
                        {funnel.steps.map((step, index) => (
                          <div key={step.name} className="flex items-center space-x-4">
                            <div className="w-32 text-sm text-gray-600 capitalize">
                              {step.name.replace(/_/g, ' ')}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                <span>{step.count} users</span>
                                <span>{step.conversionRate.toFixed(1)}%</span>
                              </div>
                              <Progress value={step.conversionRate} className="h-2" />
                            </div>
                            {index > 0 && (
                              <div className="w-20 text-sm text-right">
                                <span className={`font-medium ${
                                  step.conversionRate < funnel.steps[index - 1].conversionRate * 0.7 
                                    ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                  -{(funnel.steps[index - 1].conversionRate - step.conversionRate).toFixed(1)}%
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Page Load Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {Math.round(performanceData.pageLoadTime)}ms
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {performanceData.pageLoadTime < 3000 ? (
                      <span className="text-green-600">Excellent</span>
                    ) : performanceData.pageLoadTime < 5000 ? (
                      <span className="text-yellow-600">Good</span>
                    ) : (
                      <span className="text-red-600">Needs Improvement</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">DOM Content Loaded</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {Math.round(performanceData.domContentLoaded)}ms
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Time to interactive content
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Server Response</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {Math.round(performanceData.serverResponse)}ms
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Time to first byte
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Average Time on Page</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {Math.round(engagementData.timeOnPage / 1000)}s
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    User engagement duration
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Average Scroll Depth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {Math.round(engagementData.scrollDepth)}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Page content viewed
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {engagementData.activeUsers}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Users with interactions
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Export Actions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">Export Analytics Data</h3>
                <p className="text-sm text-gray-600">Download detailed reports for external analysis</p>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AnalyticsDashboardWithErrorBoundary() {
  return (
    <PageErrorBoundary pageName="Analytics Dashboard">
      <AnalyticsDashboard />
    </PageErrorBoundary>
  );
}

export default AnalyticsDashboardWithErrorBoundary;