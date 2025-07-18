'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CreditCard, Shield, Brain, DollarSign, Star, Lock,
  Plus, Settings, Download, Upload, BarChart3, Activity,
  Target, Receipt, Users, Eye, Bell, TrendingUp, AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/ui/navbar'
import { Card } from '@/components/ui/revolutionary-card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import IntelligentPaymentTerminal from '@/components/restaurant/IntelligentPaymentTerminal'
import UniversalBulkUpload from '@/components/ui/universal-bulk-upload'
import type { PaymentTransaction } from '@/lib/services/paymentProcessingService'

export default function RestaurantPaymentsPage() {
  const [activeTab, setActiveTab] = useState('terminal')
  const [selectedPayment, setSelectedPayment] = useState<PaymentTransaction | null>(null)
  const [showBulkUpload, setShowBulkUpload] = useState(false)

  const handlePaymentComplete = (payment: PaymentTransaction) => {
    setSelectedPayment(payment)
    console.log('Payment completed:', payment)
  }

  const handlePaymentFailed = (error: string) => {
    console.error('Payment failed:', error)
  }

  // Sample order data for demonstration
  const sampleOrderData = {
    orderId: 'order-' + Date.now(),
    customerId: 'customer-001',
    amount: 23.75,
    currency: 'USD',
    taxAmount: 1.81,
    tipAmount: 3.00,
    orderItems: [
      {
        itemId: 'tea-001',
        itemName: 'Premium Earl Grey Tea',
        quantity: 1,
        unitPrice: 4.50,
        totalPrice: 4.50
      },
      {
        itemId: 'pastry-001',
        itemName: 'Fresh Butter Croissant',
        quantity: 1,
        unitPrice: 3.25,
        totalPrice: 3.25
      },
      {
        itemId: 'tea-002',
        itemName: 'Jasmine Green Tea',
        quantity: 2,
        unitPrice: 4.00,
        totalPrice: 8.00
      }
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-50">
      
      {/* Navigation Bar with User Info */}
      <Navbar />
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-blue-600 to-purple-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Intelligent Payment Processing
              </h1>
              <p className="text-xl text-green-100 mb-4">
                AI-powered secure payment management using HERA Universal Transactions Architecture
              </p>
              <div className="flex items-center justify-center gap-6 text-green-200 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>AI Fraud Detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span>PCI DSS Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  <span>Universal Architecture</span>
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
              <div className="p-3 bg-green-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">₹--</div>
                <div className="text-sm text-gray-600">Today's Revenue</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">--</div>
                <div className="text-sm text-gray-600">Transactions</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">--%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">--%</div>
                <div className="text-sm text-gray-600">Fraud Rate</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200 bg-gray-50/50">
              <TabsList className="grid w-full grid-cols-4 bg-transparent border-none">
                <TabsTrigger value="terminal" className="py-4 px-6">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Payment Terminal
                </TabsTrigger>
                <TabsTrigger value="security" className="py-4 px-6">
                  <Shield className="w-4 h-4 mr-2" />
                  Security & Fraud
                </TabsTrigger>
                <TabsTrigger value="analytics" className="py-4 px-6">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="settings" className="py-4 px-6">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="terminal" className="p-6">
              <IntelligentPaymentTerminal
                orderData={sampleOrderData}
                onPaymentComplete={handlePaymentComplete}
                onPaymentFailed={handlePaymentFailed}
                viewMode="cashier"
                showAnalytics={true}
              />
            </TabsContent>

            <TabsContent value="security" className="p-6">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Shield className="w-6 h-6 text-blue-600" />
                  Security & Fraud Protection
                </h3>

                {/* Security Dashboard */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      AI Fraud Detection
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Detection Accuracy</span>
                        <Badge className="bg-green-100 text-green-800">99.2%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>False Positive Rate</span>
                        <Badge className="bg-blue-100 text-blue-800">0.1%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Response Time</span>
                        <Badge className="bg-purple-100 text-purple-800">&lt;200ms</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Risk Assessment</span>
                        <Badge className="bg-green-100 text-green-800">Real-Time</Badge>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-green-600" />
                      Security Compliance
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>PCI DSS Level</span>
                        <Badge className="bg-green-100 text-green-800">Level 1</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Data Encryption</span>
                        <Badge className="bg-green-100 text-green-800">AES-256</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>TLS Version</span>
                        <Badge className="bg-green-100 text-green-800">1.3</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Tokenization</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Threat Monitoring */}
                <Card className="p-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-orange-600" />
                    Real-Time Threat Monitoring
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <div className="font-semibold text-green-800">0</div>
                      <div className="text-sm text-green-600">Active Threats</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Bell className="w-4 h-4 text-white" />
                      </div>
                      <div className="font-semibold text-blue-800">3</div>
                      <div className="text-sm text-blue-600">Security Alerts</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Activity className="w-4 h-4 text-white" />
                      </div>
                      <div className="font-semibold text-purple-800">127</div>
                      <div className="text-sm text-purple-600">Security Events</div>
                    </div>
                  </div>
                </Card>

                {/* Security Recommendations */}
                <Card className="p-6">
                  <h4 className="font-semibold mb-4">AI Security Recommendations</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                      <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-blue-800">Enable 3D Secure</h5>
                        <p className="text-sm text-blue-600">
                          Reduce fraud risk by 65% for transactions over ₹50
                        </p>
                      </div>
                      <Button size="sm" variant="outline">Configure</Button>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                      <Target className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-green-800">Velocity Limits</h5>
                        <p className="text-sm text-green-600">
                          Optimize transaction velocity limits based on customer behavior
                        </p>
                      </div>
                      <Button size="sm" variant="outline">Review</Button>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                      <Activity className="w-5 h-5 text-purple-600 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-purple-800">Device Fingerprinting</h5>
                        <p className="text-sm text-purple-600">
                          Enhanced device recognition for repeat customers
                        </p>
                      </div>
                      <Button size="sm" variant="outline">Enable</Button>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="p-6">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  Payment Analytics & Intelligence
                </h3>

                {/* Financial Overview */}
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="p-6">
                    <h4 className="font-semibold mb-4">Revenue Breakdown</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Gross Revenue</span>
                        <span className="font-semibold">₹2,847.50</span>
                      </div>
                      <div className="flex justify-between text-red-600">
                        <span>Processing Fees</span>
                        <span>-₹82.58</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Net Revenue</span>
                        <span className="font-semibold">₹2,764.92</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h4 className="font-semibold mb-4">Transaction Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Total Transactions</span>
                        <span className="font-semibold">147</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Successful</span>
                        <span className="text-green-600">144 (98%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Failed</span>
                        <span className="text-red-600">3 (2%)</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h4 className="font-semibold mb-4">Security Overview</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Fraud Attempts</span>
                        <span className="text-red-600">2</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Blocked</span>
                        <span className="text-green-600">2 (100%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>False Positives</span>
                        <span className="text-yellow-600">0</span>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Payment Method Performance */}
                <Card className="p-6">
                  <h4 className="font-semibold mb-4">Payment Method Performance</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Credit Cards</span>
                        <span className="text-sm text-gray-600">65% • 96 transactions</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Success Rate: 98%</span>
                        <span>Avg: ₹19.80</span>
                        <span>Total: ₹1,900.80</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Digital Wallets</span>
                        <span className="text-sm text-gray-600">25% • 37 transactions</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Success Rate: 99%</span>
                        <span>Avg: ₹16.50</span>
                        <span>Total: ₹610.50</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Cash</span>
                        <span className="text-sm text-gray-600">10% • 14 transactions</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '10%' }}></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Success Rate: 100%</span>
                        <span>Avg: ₹24.00</span>
                        <span>Total: ₹336.00</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* AI Insights */}
                <Card className="p-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    AI-Powered Insights
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h5 className="font-medium text-blue-800 mb-2">Peak Payment Times</h5>
                      <p className="text-sm text-blue-600">
                        Lunch rush (12-2 PM) accounts for 45% of daily transactions
                      </p>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h5 className="font-medium text-green-800 mb-2">Customer Preferences</h5>
                      <p className="text-sm text-green-600">
                        Digital wallet usage increases 30% on weekends
                      </p>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h5 className="font-medium text-purple-800 mb-2">Revenue Optimization</h5>
                      <p className="text-sm text-purple-600">
                        Switching to Stripe for transactions &gt;₹50 saves 0.5% in fees
                      </p>
                    </div>
                    
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h5 className="font-medium text-orange-800 mb-2">Fraud Patterns</h5>
                      <p className="text-sm text-orange-600">
                        No suspicious patterns detected in last 30 days
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="p-6">
              <div className="max-w-2xl mx-auto space-y-6">
                <h3 className="text-xl font-semibold">Payment Processing Settings</h3>
                
                <div className="space-y-4">
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Payment Gateway Configuration</h4>
                        <p className="text-sm text-gray-600">Configure primary and backup payment gateways</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Fraud Detection Rules</h4>
                        <p className="text-sm text-gray-600">Customize AI-powered fraud detection parameters</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Security Compliance</h4>
                        <p className="text-sm text-gray-600">PCI DSS and regulatory compliance settings</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Payment Methods</h4>
                        <p className="text-sm text-gray-600">Enable/disable payment methods and set limits</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Financial Reporting</h4>
                        <p className="text-sm text-gray-600">Automated reporting and reconciliation settings</p>
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
                      <h4 className="font-medium mb-2">Import Payment Data</h4>
                      <p className="text-sm text-gray-600 mb-4">Bulk import historical payment records</p>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setShowBulkUpload(true)}
                      >
                        Bulk Upload Payments
                      </Button>
                    </Card>

                    <Card className="p-6 text-center">
                      <Download className="w-8 h-8 mx-auto mb-3 text-green-600" />
                      <h4 className="font-medium mb-2">Export Payment Data</h4>
                      <p className="text-sm text-gray-600 mb-4">Download payment history and reports</p>
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

        {/* Secure Universal Payment Architecture Showcase */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="text-center mb-4">
            <Badge className="gap-1 bg-green-500 text-white mb-3">
              <Lock className="w-3 h-3" />
              Secure Universal Payment Architecture
            </Badge>
            <h3 className="text-lg font-semibold text-green-800">
              Revolutionary Enterprise Payment Security Technology
            </h3>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div className="font-medium text-green-800">AI Fraud Detection</div>
              <div className="text-green-600">Machine learning powered security with 99%+ accuracy</div>
            </div>
            
            <div className="text-center p-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div className="font-medium text-green-800">Enterprise Security</div>
              <div className="text-green-600">PCI DSS Level 1 compliance with end-to-end encryption</div>
            </div>
            
            <div className="text-center p-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <div className="font-medium text-green-800">Real-Time Processing</div>
              <div className="text-green-600">Instant payment verification and settlement</div>
            </div>
            
            <div className="text-center p-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div className="font-medium text-green-800">Universal Schema</div>
              <div className="text-green-600">Scalable payment architecture for any business</div>
            </div>
          </div>
        </Card>

        {/* Bulk Upload Modal */}
        {showBulkUpload && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto m-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Bulk Upload Payments</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBulkUpload(false)}
                >
                  ×
                </Button>
              </div>
              <UniversalBulkUpload
                entityType="payments"
                onSuccess={() => {
                  setShowBulkUpload(false);
                  // Refresh payments data if needed
                }}
                onError={(error) => {
                  console.error('Bulk upload failed:', error);
                }}
              />
            </div>
          </div>
        )}

        {/* Selected Payment Details */}
        {selectedPayment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Completed Payment Transaction
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(selectedPayment, null, 2)}
                </pre>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}