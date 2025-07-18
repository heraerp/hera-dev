'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  ShoppingCart, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle, 
  Activity, 
  Clock, 
  TrendingUp,
  BarChart3,
  RefreshCw,
  Settings,
  Zap,
  CalculatorIcon
} from 'lucide-react'
import { usePOSAccountingIntegration } from '@/hooks/usePOSAccountingIntegration'
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement'
import { Order, OrderItem } from '@/lib/services/posEventPublisher'

const POSAccountingIntegrationDemo: React.FC = () => {
  const { restaurantData } = useRestaurantManagement()
  const {
    isInitialized,
    isProcessing,
    integrationStats,
    integrationHealth,
    recentErrors,
    processOrderCompletion,
    processPaymentReceived,
    processRefund,
    processOrderVoid,
    getEventStats,
    clearErrors,
    reinitialize
  } = usePOSAccountingIntegration()

  // Demo order state
  const [demoOrder, setDemoOrder] = useState<Partial<Order>>({
    orderNumber: `ORD-${Date.now()}`,
    customerName: 'John Doe',
    tableNumber: 'Table 5',
    items: [
      {
        id: '1',
        name: 'Chicken Biryani',
        category: 'food',
        quantity: 2,
        unitPrice: 250,
        totalPrice: 500
      },
      {
        id: '2',
        name: 'Mango Lassi',
        category: 'beverage',
        quantity: 2,
        unitPrice: 80,
        totalPrice: 160
      }
    ],
    subtotal: 660,
    taxes: 118.80, // 18% GST
    discounts: 0,
    serviceCharges: 0,
    totalAmount: 778.80,
    payment: {
      method: 'upi',
      provider: 'gpay',
      amount: 778.80,
      reference: 'UPI-' + Date.now(),
      timestamp: new Date().toISOString()
    }
  })

  const [lastResult, setLastResult] = useState<any>(null)

  const handleProcessOrder = async () => {
    if (!demoOrder.orderNumber || !restaurantData?.organizationId) {
      setLastResult({
        success: false,
        message: 'Restaurant not selected or order number missing',
        error: 'Missing required data'
      })
      return
    }

    const order: Order = {
      id: crypto.randomUUID(),
      orderNumber: demoOrder.orderNumber,
      organizationId: restaurantData.organizationId,
      customerName: demoOrder.customerName,
      tableNumber: demoOrder.tableNumber,
      items: demoOrder.items as OrderItem[],
      subtotal: demoOrder.subtotal || 0,
      taxes: demoOrder.taxes || 0,
      discounts: demoOrder.discounts || 0,
      serviceCharges: demoOrder.serviceCharges || 0,
      totalAmount: demoOrder.totalAmount || 0,
      payment: demoOrder.payment!,
      status: 'completed',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      staffMember: {
        id: restaurantData.userId || crypto.randomUUID(),
        name: 'Demo Staff'
      },
      restaurant: {
        id: restaurantData.organizationId,
        name: restaurantData.restaurantName || 'Demo Restaurant',
        location: 'Main Branch'
      }
    }

    try {
      const result = await processOrderCompletion(order)
      setLastResult(result)
    } catch (error) {
      setLastResult({
        success: false,
        message: error.message,
        error: error.message
      })
    }
  }

  const handleProcessRefund = async () => {
    if (!demoOrder.orderNumber || !restaurantData?.organizationId) {
      setLastResult({
        success: false,
        message: 'Restaurant not selected or order number missing',
        error: 'Missing required data'
      })
      return
    }

    try {
      const result = await processRefund({
        orderId: demoOrder.orderNumber,
        refundAmount: 100,
        reason: 'Customer complaint'
      })
      setLastResult(result)
    } catch (error) {
      setLastResult({
        success: false,
        message: error.message,
        error: error.message
      })
    }
  }

  const handleVoidOrder = async () => {
    if (!demoOrder.orderNumber || !restaurantData?.organizationId) {
      setLastResult({
        success: false,
        message: 'Restaurant not selected or order number missing',
        error: 'Missing required data'
      })
      return
    }

    try {
      const result = await processOrderVoid({
        orderId: demoOrder.orderNumber,
        reason: 'Kitchen error'
      })
      setLastResult(result)
    } catch (error) {
      setLastResult({
        success: false,
        message: error.message,
        error: error.message
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          Healthy
        </Badge>
      case 'degraded':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Degraded
        </Badge>
      case 'offline':
        return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300">
          <Activity className="w-3 h-3 mr-1" />
          Offline
        </Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Show loading if restaurant data is not available
  if (!restaurantData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-6 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Loading Restaurant Data
            </CardTitle>
            <CardDescription>
              Please wait while we load your restaurant information...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-sm text-gray-600">
              If this takes too long, please ensure you have a restaurant set up.
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg">
                <ShoppingCart className="h-8 w-8 text-white" />
              </div>
              POS → Accounting Integration
            </h1>
            <p className="text-gray-600">
              Real-time demo of automatic journal creation from POS transactions
            </p>
          </div>
          <div className="flex items-center gap-4">
            {getStatusBadge(integrationHealth.systemStatus)}
            <Badge variant={isInitialized ? 'default' : 'secondary'}>
              {isInitialized ? 'Initialized' : 'Initializing...'}
            </Badge>
          </div>
        </div>

        {/* Integration Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Processed</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{integrationStats.totalProcessed}</div>
              <p className="text-xs text-muted-foreground">
                Transactions processed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{integrationHealth.successRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Successfully posted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{integrationStats.averageProcessingTime.toFixed(0)}ms</div>
              <p className="text-xs text-muted-foreground">
                Average response time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Count</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{integrationHealth.errorCount}</div>
              <p className="text-xs text-muted-foreground">
                Recent errors
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Demo Order Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Demo Order
              </CardTitle>
              <CardDescription>
                Create and process a demo order to see the integration in action
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orderNumber">Order Number</Label>
                  <Input
                    id="orderNumber"
                    value={demoOrder.orderNumber || ''}
                    onChange={(e) => setDemoOrder(prev => ({ ...prev, orderNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={demoOrder.customerName || ''}
                    onChange={(e) => setDemoOrder(prev => ({ ...prev, customerName: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tableNumber">Table Number</Label>
                  <Input
                    id="tableNumber"
                    value={demoOrder.tableNumber || ''}
                    onChange={(e) => setDemoOrder(prev => ({ ...prev, tableNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={demoOrder.payment?.method || 'cash'}
                    onValueChange={(value) => setDemoOrder(prev => ({
                      ...prev,
                      payment: { ...prev.payment!, method: value as any }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="debit_card">Debit Card</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Order Items</Label>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  {demoOrder.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-600">{item.category} • Qty: {item.quantity}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">₹{item.totalPrice}</div>
                        <div className="text-sm text-gray-600">₹{item.unitPrice} each</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{demoOrder.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes (18% GST):</span>
                  <span>₹{demoOrder.taxes}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>₹{demoOrder.totalAmount}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleProcessOrder}
                  disabled={!isInitialized || isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Process Order
                    </>
                  )}
                </Button>
                <Button 
                  onClick={handleProcessRefund}
                  disabled={!isInitialized || isProcessing}
                  variant="outline"
                >
                  Refund
                </Button>
                <Button 
                  onClick={handleVoidOrder}
                  disabled={!isInitialized || isProcessing}
                  variant="outline"
                >
                  Void
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Integration Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Integration Results
              </CardTitle>
              <CardDescription>
                Real-time results and system status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {lastResult && (
                <Alert className={lastResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  <div className="flex items-center gap-2">
                    {lastResult.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="font-medium">
                      {lastResult.success ? 'Success' : 'Error'}
                    </span>
                  </div>
                  <AlertDescription className="mt-2">
                    {lastResult.message}
                    {lastResult.transactionId && (
                      <div className="mt-1 text-sm">
                        Transaction ID: {lastResult.transactionId}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">System Status</span>
                  {getStatusBadge(integrationHealth.systemStatus)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Last Heartbeat</span>
                  <span className="text-sm text-gray-600">
                    {integrationHealth.lastHeartbeat 
                      ? new Date(integrationHealth.lastHeartbeat).toLocaleTimeString()
                      : 'Never'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Is Online</span>
                  <Badge variant={integrationHealth.isOnline ? 'default' : 'secondary'}>
                    {integrationHealth.isOnline ? 'Online' : 'Offline'}
                  </Badge>
                </div>
              </div>

              {recentErrors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Recent Errors</span>
                    <Button onClick={clearErrors} variant="outline" size="sm">
                      Clear
                    </Button>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {recentErrors.map((error, index) => (
                      <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={reinitialize}
                  variant="outline"
                  size="sm"
                  disabled={isProcessing}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Reinitialize
                </Button>
                <Button 
                  onClick={() => window.open('/test-journal-viewer', '_blank')}
                  variant="outline"
                  size="sm"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  View Journal Entries
                </Button>
                <Button 
                  onClick={() => window.open('/test-trial-balance', '_blank')}
                  variant="outline"
                  size="sm"
                >
                  <CalculatorIcon className="w-4 h-4 mr-2" />
                  Trial Balance
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default POSAccountingIntegrationDemo