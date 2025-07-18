'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Calculator, BookOpen, TrendingUp, DollarSign, Star, FileText,
  Plus, Settings, Download, Upload, BarChart3, Activity,
  Target, PieChart, Users, Eye, Receipt
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/revolutionary-card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import FinancialAccountingDashboard from '@/components/restaurant/FinancialAccountingDashboard'
import type { ChartOfAccount, JournalEntry } from '@/lib/services/financialAccountingService'
import { createClient } from '@/lib/supabase/client'

export default function RestaurantFinancialsPage() {
  const [activeTab, setActiveTab] = useState('accounting')
  const [selectedAccount, setSelectedAccount] = useState<ChartOfAccount | null>(null)
  const [selectedJournalEntry, setSelectedJournalEntry] = useState<JournalEntry | null>(null)

  const handleAccountSelect = (account: ChartOfAccount) => {
    setSelectedAccount(account)
    console.log('Selected account:', account)
  }

  const handleJournalEntrySelect = (entry: JournalEntry) => {
    setSelectedJournalEntry(entry)
    console.log('Selected journal entry:', entry)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Financial Accounting System
              </h1>
              <p className="text-xl text-blue-100 mb-4">
                SAP Business One-style financial management using HERA Universal Schema
              </p>
              <div className="flex items-center justify-center gap-6 text-blue-200 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Chart of Accounts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4" />
                  <span>Journal Entries</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Financial Reports</span>
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
                <div className="text-sm text-gray-600">Total Assets</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">₹--</div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <PieChart className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">₹--</div>
                <div className="text-sm text-gray-600">Net Income</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <BookOpen className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">--</div>
                <div className="text-sm text-gray-600">Accounts</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200 bg-gray-50/50">
              <TabsList className="grid w-full grid-cols-4 bg-transparent border-none">
                <TabsTrigger value="accounting" className="py-4 px-6">
                  <Calculator className="w-4 h-4 mr-2" />
                  Financial Accounting
                </TabsTrigger>
                <TabsTrigger value="reports" className="py-4 px-6">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Financial Reports
                </TabsTrigger>
                <TabsTrigger value="analysis" className="py-4 px-6">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Financial Analysis
                </TabsTrigger>
                <TabsTrigger value="settings" className="py-4 px-6">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="accounting" className="p-6">
              <FinancialAccountingDashboard
                onAccountSelect={handleAccountSelect}
                onJournalEntrySelect={handleJournalEntrySelect}
                viewMode="accountant"
                showInitializeButton={true}
              />
            </TabsContent>

            <TabsContent value="reports" className="p-6">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  Financial Reports & Analysis
                </h3>

                {/* Standard Financial Reports */}
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                    <h4 className="font-semibold mb-2">Balance Sheet</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Statement of financial position showing assets, liabilities, and equity
                    </p>
                    <Button className="w-full" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                  </Card>

                  <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 text-green-600" />
                    <h4 className="font-semibold mb-2">Income Statement</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Profit and loss statement showing revenue, expenses, and net income
                    </p>
                    <Button className="w-full" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                  </Card>

                  <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                    <h4 className="font-semibold mb-2">Cash Flow Statement</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Cash inflows and outflows from operating, investing, and financing activities
                    </p>
                    <Button className="w-full" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                  </Card>

                  <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-orange-600" />
                    <h4 className="font-semibold mb-2">Trial Balance</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Summary of all account balances to ensure debits equal credits
                    </p>
                    <Button className="w-full" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                  </Card>

                  <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                    <Receipt className="w-12 h-12 mx-auto mb-4 text-indigo-600" />
                    <h4 className="font-semibold mb-2">General Ledger</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Detailed record of all financial transactions by account
                    </p>
                    <Button className="w-full" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                  </Card>

                  <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                    <PieChart className="w-12 h-12 mx-auto mb-4 text-pink-600" />
                    <h4 className="font-semibold mb-2">Financial Ratios</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Key financial ratios and performance indicators analysis
                    </p>
                    <Button className="w-full" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                  </Card>
                </div>

                {/* Sample Financial Data */}
                <Card className="p-6">
                  <h4 className="font-semibold mb-4">Sample Financial Performance</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium mb-3">Revenue Breakdown</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Tea Sales</span>
                          <span className="font-semibold">₹8,500</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pastry Sales</span>
                          <span className="font-semibold">₹6,200</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Catering Revenue</span>
                          <span className="font-semibold">₹3,800</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 font-bold">
                          <span>Total Revenue</span>
                          <span>₹18,500</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-3">Expense Breakdown</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Cost of Goods Sold</span>
                          <span className="font-semibold">₹7,400</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rent Expense</span>
                          <span className="font-semibold">₹2,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Salaries & Wages</span>
                          <span className="font-semibold">₹4,500</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Other Expenses</span>
                          <span className="font-semibold">₹1,600</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 font-bold">
                          <span>Total Expenses</span>
                          <span>₹15,500</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-green-800">Net Profit</span>
                      <span className="text-2xl font-bold text-green-800">₹3,000</span>
                    </div>
                    <div className="text-sm text-green-600 mt-1">
                      Profit Margin: 16.2% • ROI: 24.5%
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="p-6">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  Financial Analysis & KPIs
                </h3>

                {/* Key Performance Indicators */}
                <div className="grid md:grid-cols-4 gap-4">
                  <Card className="p-6 text-center">
                    <div className="text-2xl font-bold text-green-600">16.2%</div>
                    <div className="text-sm text-gray-600">Profit Margin</div>
                    <div className="text-xs text-green-600 mt-1">↑ 2.3% vs last month</div>
                  </Card>
                  
                  <Card className="p-6 text-center">
                    <div className="text-2xl font-bold text-blue-600">2.4</div>
                    <div className="text-sm text-gray-600">Current Ratio</div>
                    <div className="text-xs text-blue-600 mt-1">Healthy liquidity</div>
                  </Card>
                  
                  <Card className="p-6 text-center">
                    <div className="text-2xl font-bold text-purple-600">24.5%</div>
                    <div className="text-sm text-gray-600">ROI</div>
                    <div className="text-xs text-purple-600 mt-1">↑ 4.2% vs last quarter</div>
                  </Card>
                  
                  <Card className="p-6 text-center">
                    <div className="text-2xl font-bold text-orange-600">12.8</div>
                    <div className="text-sm text-gray-600">Days Sales Outstanding</div>
                    <div className="text-xs text-orange-600 mt-1">Excellent collection</div>
                  </Card>
                </div>

                {/* Financial Ratios Analysis */}
                <Card className="p-6">
                  <h4 className="font-semibold mb-4">Financial Ratios Analysis</h4>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h5 className="font-medium mb-3 text-blue-800">Liquidity Ratios</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Current Ratio</span>
                          <span className="font-semibold">2.40</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Quick Ratio</span>
                          <span className="font-semibold">1.85</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cash Ratio</span>
                          <span className="font-semibold">0.95</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-3 text-green-800">Profitability Ratios</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Gross Profit Margin</span>
                          <span className="font-semibold">40.0%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Net Profit Margin</span>
                          <span className="font-semibold">16.2%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Return on Assets</span>
                          <span className="font-semibold">18.5%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-3 text-purple-800">Efficiency Ratios</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Asset Turnover</span>
                          <span className="font-semibold">1.14</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Inventory Turnover</span>
                          <span className="font-semibold">8.5</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Receivables Turnover</span>
                          <span className="font-semibold">28.5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Trend Analysis */}
                <Card className="p-6">
                  <h4 className="font-semibold mb-4">Financial Trends</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span>Revenue Growth</span>
                        <span className="font-semibold text-green-600">+15.3% YoY</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span>Cost Control</span>
                        <span className="font-semibold text-blue-600">-8.2% YoY</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span>Profit Margin Improvement</span>
                        <span className="font-semibold text-purple-600">+3.1% YoY</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* AI Financial Insights */}
                <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    AI Financial Insights
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-lg">
                      <h5 className="font-medium text-purple-800 mb-2">Optimization Opportunity</h5>
                      <p className="text-sm text-purple-600">
                        Reducing food waste by 15% could improve profit margin by 2.3 percentage points
                      </p>
                    </div>
                    
                    <div className="p-4 bg-white rounded-lg">
                      <h5 className="font-medium text-blue-800 mb-2">Cash Flow Prediction</h5>
                      <p className="text-sm text-blue-600">
                        Based on current trends, expect positive cash flow of ₹8,500 next month
                      </p>
                    </div>
                    
                    <div className="p-4 bg-white rounded-lg">
                      <h5 className="font-medium text-green-800 mb-2">Growth Opportunity</h5>
                      <p className="text-sm text-green-600">
                        Expanding catering services could increase revenue by 25% within 6 months
                      </p>
                    </div>
                    
                    <div className="p-4 bg-white rounded-lg">
                      <h5 className="font-medium text-orange-800 mb-2">Risk Alert</h5>
                      <p className="text-sm text-orange-600">
                        Monitor inventory levels - current turnover rate suggests potential stockouts
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="p-6">
              <div className="max-w-2xl mx-auto space-y-6">
                <h3 className="text-xl font-semibold">Financial Accounting Settings</h3>
                
                <div className="space-y-4">
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Chart of Accounts Structure</h4>
                        <p className="text-sm text-gray-600">Configure account numbering and hierarchy</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Fiscal Year Settings</h4>
                        <p className="text-sm text-gray-600">Set fiscal year periods and accounting calendar</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Journal Entry Templates</h4>
                        <p className="text-sm text-gray-600">Create templates for recurring transactions</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Financial Reporting</h4>
                        <p className="text-sm text-gray-600">Customize report formats and automated generation</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Tax Configuration</h4>
                        <p className="text-sm text-gray-600">Set up tax codes and calculation rules</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Integration Settings</h4>
                        <p className="text-sm text-gray-600">Connect with banking and payment systems</p>
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
                      <h4 className="font-medium mb-2">Import Financial Data</h4>
                      <p className="text-sm text-gray-600 mb-4">Bulk import chart of accounts and transactions</p>
                      <Button variant="outline" className="w-full">
                        Choose File
                      </Button>
                    </Card>

                    <Card className="p-6 text-center">
                      <Download className="w-8 h-8 mx-auto mb-3 text-green-600" />
                      <h4 className="font-medium mb-2">Export Financial Data</h4>
                      <p className="text-sm text-gray-600 mb-4">Download complete financial records</p>
                      <Button variant="outline" className="w-full">
                        Export CSV
                      </Button>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* SAP Business One Financial Architecture Showcase */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="text-center mb-4">
            <Badge className="gap-1 bg-blue-500 text-white mb-3">
              <Star className="w-3 h-3" />
              SAP Business One Financial Architecture
            </Badge>
            <h3 className="text-lg font-semibold text-blue-800">
              Enterprise Financial Management Technology
            </h3>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div className="font-medium text-blue-800">SAP Chart of Accounts</div>
              <div className="text-blue-600">5-level hierarchical account structure with 80+ standard accounts</div>
            </div>
            
            <div className="text-center p-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Receipt className="w-4 h-4 text-white" />
              </div>
              <div className="font-medium text-blue-800">Automated Journal Entries</div>
              <div className="text-blue-600">Real-time double-entry bookkeeping with automated posting</div>
            </div>
            
            <div className="text-center p-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <div className="font-medium text-blue-800">Financial Reporting</div>
              <div className="text-blue-600">Complete financial statements and trial balance generation</div>
            </div>
            
            <div className="text-center p-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div className="font-medium text-blue-800">Universal Schema</div>
              <div className="text-blue-600">Scalable financial architecture using HERA universal transactions</div>
            </div>
          </div>
        </Card>

        {/* Selected Account/Journal Entry Details */}
        {(selectedAccount || selectedJournalEntry) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                {selectedAccount ? 'Selected Account Details' : 'Selected Journal Entry Details'}
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(selectedAccount || selectedJournalEntry, null, 2)}
                </pre>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}