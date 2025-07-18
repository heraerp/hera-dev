'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, Brain, Target, Activity, Star, TrendingUp,
  Plus, Settings, Download, Upload, Eye, Users,
  DollarSign, Package, PieChart, LineChart, Calendar,
  Zap, Award, Lightbulb, Bell, RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/ui/navbar'
import { Card } from '@/components/ui/revolutionary-card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import UniversalAnalyticsDashboard from '@/components/restaurant/UniversalAnalyticsDashboard'
import RestaurantNavigation from '@/components/restaurant/RestaurantNavigation'
import type { BusinessMetric } from '@/lib/services/analyticsService'

export default function RestaurantAnalyticsPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedMetric, setSelectedMetric] = useState<BusinessMetric | null>(null)
  const [selectedInsight, setSelectedInsight] = useState<any>(null)

  const handleMetricSelect = (metric: BusinessMetric) => {
    setSelectedMetric(metric)
    console.log('Selected metric:', metric)
  }

  const handleInsightSelect = (insight: any) => {
    setSelectedInsight(insight)
    console.log('Selected insight:', insight)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      
      {/* Navigation Bar with User Info */}
      <Navbar />
      {/* Navigation */}
      <div className="sticky top-0 z-50">
        <RestaurantNavigation compact={true} title="Analytics Dashboard" />
      </div>
      
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Universal Analytics Dashboard
              </h1>
              <p className="text-xl text-blue-100 mb-4">
                Comprehensive business intelligence with AI-powered insights using HERA Universal Schema
              </p>
              <div className="flex items-center justify-center gap-6 text-blue-200 text-sm">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>Real-Time Analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  <span>AI Insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span>Predictive Intelligence</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 -mt-8 relative z-10">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">₹--</div>
                <div className="text-sm text-gray-600">Revenue Today</div>
                <div className="text-xs text-green-600 mt-1">↑ Real-time tracking</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">--</div>
                <div className="text-sm text-gray-600">Orders Processed</div>
                <div className="text-xs text-blue-600 mt-1">AI-powered insights</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">--</div>
                <div className="text-sm text-gray-600">Active Customers</div>
                <div className="text-xs text-purple-600 mt-1">Behavioral analysis</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Brain className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">--</div>
                <div className="text-sm text-gray-600">AI Predictions</div>
                <div className="text-xs text-orange-600 mt-1">Forecast accuracy</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200 bg-gray-50/50">
              <TabsList className="grid w-full grid-cols-4 bg-transparent border-none">
                <TabsTrigger value="dashboard" className="py-4 px-6">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics Dashboard
                </TabsTrigger>
                <TabsTrigger value="insights" className="py-4 px-6">
                  <Brain className="w-4 h-4 mr-2" />
                  AI Insights
                </TabsTrigger>
                <TabsTrigger value="reports" className="py-4 px-6">
                  <PieChart className="w-4 h-4 mr-2" />
                  Business Reports
                </TabsTrigger>
                <TabsTrigger value="settings" className="py-4 px-6">
                  <Settings className="w-4 h-4 mr-2" />
                  Analytics Settings
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="dashboard" className="p-6">
              <UniversalAnalyticsDashboard
                onMetricSelect={handleMetricSelect}
                onInsightSelect={handleInsightSelect}
                viewMode="manager"
                showPredictive={true}
              />
            </TabsContent>

            <TabsContent value="insights" className="p-6">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Brain className="w-6 h-6 text-purple-600" />
                  Advanced AI Insights & Recommendations
                </h3>

                {/* AI Insight Categories */}
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-blue-500 rounded-xl">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900">Revenue Optimization</h4>
                        <p className="text-sm text-blue-700">AI-powered revenue insights</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 bg-white rounded-lg">
                        <h5 className="font-medium text-blue-800 mb-1">Peak Hour Analysis</h5>
                        <p className="text-sm text-blue-600">
                          Lunch rush (12-2 PM) generates 45% of daily revenue. Consider premium pricing during peak hours.
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded-lg">
                        <h5 className="font-medium text-blue-800 mb-1">Menu Optimization</h5>
                        <p className="text-sm text-blue-600">
                          Tea-pastry bundles show 32% higher profit margins than individual items.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-green-500 rounded-xl">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-900">Customer Intelligence</h4>
                        <p className="text-sm text-green-700">Behavioral pattern analysis</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 bg-white rounded-lg">
                        <h5 className="font-medium text-green-800 mb-1">Loyalty Insights</h5>
                        <p className="text-sm text-green-600">
                          Customers who try 3+ tea varieties have 85% higher retention rates.
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded-lg">
                        <h5 className="font-medium text-green-800 mb-1">Preference Mapping</h5>
                        <p className="text-sm text-green-600">
                          Weekend customers prefer premium blends (+25% willingness to pay).
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-purple-500 rounded-xl">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-purple-900">Operational Efficiency</h4>
                        <p className="text-sm text-purple-700">Process optimization</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 bg-white rounded-lg">
                        <h5 className="font-medium text-purple-800 mb-1">Inventory Optimization</h5>
                        <p className="text-sm text-purple-600">
                          Reduce tea leaf inventory by 15% to save ₹2,500/month without affecting service.
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded-lg">
                        <h5 className="font-medium text-purple-800 mb-1">Staffing Efficiency</h5>
                        <p className="text-sm text-purple-600">
                          Optimize staff scheduling to reduce labor costs by 12% during off-peak hours.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Predictive Analytics */}
                <Card className="p-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-600" />
                    Predictive Analytics & Forecasting
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium mb-3 text-indigo-800">7-Day Revenue Forecast</h5>
                      <div className="space-y-2">
                        {Array.from({ length: 7 }, (_, i) => {
                          const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000)
                          const baseRevenue = 2500 + (Math.random() * 500)
                          const isWeekend = date.getDay() === 0 || date.getDay() === 6
                          const revenue = isWeekend ? baseRevenue * 1.3 : baseRevenue
                          
                          return (
                            <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span className="text-sm">
                                {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              </span>
                              <div className="text-right">
                                <div className="font-semibold">₹{revenue.toFixed(0)}</div>
                                <div className="text-xs text-gray-600">
                                  {isWeekend ? '↑ Weekend boost' : '→ Regular day'}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-3 text-indigo-800">Demand Forecasting</h5>
                      <div className="space-y-2">
                        {[
                          { item: 'Earl Grey Tea', demand: 45, confidence: 0.92 },
                          { item: 'Jasmine Green Tea', demand: 38, confidence: 0.89 },
                          { item: 'Butter Croissant', demand: 52, confidence: 0.87 },
                          { item: 'Blueberry Scone', demand: 31, confidence: 0.84 },
                          { item: 'Chai Latte', demand: 42, confidence: 0.91 }
                        ].map((item, index) => (
                          <div key={index} className="p-2 bg-gray-50 rounded">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">{item.item}</span>
                              <div className="text-right">
                                <div className="font-semibold">{item.demand} units</div>
                                <div className="text-xs text-gray-600">
                                  {(item.confidence * 100).toFixed(0)}% confidence
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* AI Recommendations */}
                <Card className="p-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                    AI-Powered Business Recommendations
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                      <div className="flex items-start gap-3">
                        <Award className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-yellow-800 mb-1">Premium Tea Experience</h5>
                          <p className="text-sm text-yellow-700 mb-2">
                            Launch a "Tea Master" experience package with educational components
                          </p>
                          <div className="flex gap-2">
                            <Badge className="bg-yellow-100 text-yellow-800">+35% revenue potential</Badge>
                            <Badge className="bg-green-100 text-green-800">High confidence</Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-blue-800 mb-1">Digital Loyalty Program</h5>
                          <p className="text-sm text-blue-700 mb-2">
                            Implement AI-driven personalized rewards to boost customer retention
                          </p>
                          <div className="flex gap-2">
                            <Badge className="bg-blue-100 text-blue-800">+28% retention</Badge>
                            <Badge className="bg-purple-100 text-purple-800">Medium effort</Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-green-800 mb-1">Seasonal Menu Optimization</h5>
                          <p className="text-sm text-green-700 mb-2">
                            Introduce seasonal items based on weather patterns and local preferences
                          </p>
                          <div className="flex gap-2">
                            <Badge className="bg-green-100 text-green-800">+22% variety sales</Badge>
                            <Badge className="bg-orange-100 text-orange-800">Seasonal impact</Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                      <div className="flex items-start gap-3">
                        <Target className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-purple-800 mb-1">Delivery Service Expansion</h5>
                          <p className="text-sm text-purple-700 mb-2">
                            Launch premium tea delivery with subscription model for office customers
                          </p>
                          <div className="flex gap-2">
                            <Badge className="bg-purple-100 text-purple-800">+45% market reach</Badge>
                            <Badge className="bg-blue-100 text-blue-800">Scalable model</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="p-6">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <PieChart className="w-6 h-6 text-blue-600" />
                  Business Reports & Analytics
                </h3>

                {/* Report Categories */}
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                    <h4 className="font-semibold mb-2">Financial Performance Report</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Comprehensive financial analysis with profit/loss, cash flow, and ROI metrics
                    </p>
                    <Button className="w-full" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                  </Card>

                  <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                    <Users className="w-12 h-12 mx-auto mb-4 text-green-600" />
                    <h4 className="font-semibold mb-2">Customer Analytics Report</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Customer behavior analysis, segmentation, and retention metrics
                    </p>
                    <Button className="w-full" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                  </Card>

                  <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                    <Package className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                    <h4 className="font-semibold mb-2">Product Performance Report</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Product sales analysis, inventory turnover, and profitability insights
                    </p>
                    <Button className="w-full" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                  </Card>

                  <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-orange-600" />
                    <h4 className="font-semibold mb-2">Operational Efficiency Report</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Operations metrics, staff productivity, and process optimization
                    </p>
                    <Button className="w-full" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                  </Card>

                  <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                    <Brain className="w-12 h-12 mx-auto mb-4 text-indigo-600" />
                    <h4 className="font-semibold mb-2">AI Insights Report</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Machine learning insights, predictions, and optimization recommendations
                    </p>
                    <Button className="w-full" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                  </Card>

                  <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 text-pink-600" />
                    <h4 className="font-semibold mb-2">Executive Summary Report</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      High-level KPIs, trends, and strategic insights for executive review
                    </p>
                    <Button className="w-full" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                  </Card>
                </div>

                {/* Report Scheduling */}
                <Card className="p-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Automated Report Scheduling
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium mb-3">Daily Reports</h5>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">Daily Sales Summary</div>
                            <div className="text-sm text-gray-600">Every day at 11:00 PM</div>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">Operational Metrics</div>
                            <div className="text-sm text-gray-600">Every day at 8:00 AM</div>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-3">Weekly/Monthly Reports</h5>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">Weekly Performance Review</div>
                            <div className="text-sm text-gray-600">Every Monday at 9:00 AM</div>
                          </div>
                          <Badge className="bg-purple-100 text-purple-800">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">Monthly Financial Report</div>
                            <div className="text-sm text-gray-600">1st of every month</div>
                          </div>
                          <Badge className="bg-orange-100 text-orange-800">Pending</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="p-6">
              <div className="max-w-2xl mx-auto space-y-6">
                <h3 className="text-xl font-semibold">Analytics Configuration</h3>
                
                <div className="space-y-4">
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Real-Time Data Refresh</h4>
                        <p className="text-sm text-gray-600">Configure automatic data refresh intervals</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">AI Model Configuration</h4>
                        <p className="text-sm text-gray-600">Customize machine learning models and predictions</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Custom Metrics & KPIs</h4>
                        <p className="text-sm text-gray-600">Define business-specific metrics and targets</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Alert Thresholds</h4>
                        <p className="text-sm text-gray-600">Set up automated alerts for key performance indicators</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Data Retention Policy</h4>
                        <p className="text-sm text-gray-600">Configure how long analytics data is stored</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Export & Integration Settings</h4>
                        <p className="text-sm text-gray-600">Configure data exports and third-party integrations</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </Card>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Data Management</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="p-6 text-center">
                      <Upload className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                      <h4 className="font-medium mb-2">Import Analytics Data</h4>
                      <p className="text-sm text-gray-600 mb-4">Bulk import historical analytics data</p>
                      <Button variant="outline" className="w-full">
                        Choose File
                      </Button>
                    </Card>

                    <Card className="p-6 text-center">
                      <Download className="w-8 h-8 mx-auto mb-3 text-green-600" />
                      <h4 className="font-medium mb-2">Export Analytics Data</h4>
                      <p className="text-sm text-gray-600 mb-4">Download complete analytics datasets</p>
                      <Button variant="outline" className="w-full">
                        Export Data
                      </Button>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Universal Analytics Architecture Showcase */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <div className="text-center mb-4">
            <Badge className="gap-1 bg-purple-500 text-white mb-3">
              <Brain className="w-3 h-3" />
              Universal Analytics Architecture
            </Badge>
            <h3 className="text-lg font-semibold text-purple-800">
              Revolutionary Business Intelligence Technology
            </h3>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <div className="font-medium text-purple-800">Real-Time Analytics</div>
              <div className="text-purple-600">Live business metrics with millisecond accuracy</div>
            </div>
            
            <div className="text-center p-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div className="font-medium text-purple-800">AI-Powered Insights</div>
              <div className="text-purple-600">Machine learning driven predictions and recommendations</div>
            </div>
            
            <div className="text-center p-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <div className="font-medium text-purple-800">Universal Schema</div>
              <div className="text-purple-600">Scalable analytics architecture for any business</div>
            </div>
            
            <div className="text-center p-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div className="font-medium text-purple-800">Predictive Intelligence</div>
              <div className="text-purple-600">Advanced forecasting and trend analysis</div>
            </div>
          </div>
        </Card>

        {/* Selected Metric/Insight Details */}
        {(selectedMetric || selectedInsight) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                {selectedMetric ? 'Selected Business Metric' : 'Selected AI Insight'}
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(selectedMetric || selectedInsight, null, 2)}
                </pre>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}