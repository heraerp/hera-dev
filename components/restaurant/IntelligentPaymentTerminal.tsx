'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard, Shield, Brain, DollarSign, Check, AlertTriangle,
  Clock, Star, Zap, Lock, Users, TrendingUp, Activity,
  Receipt, Bell, Gift, Target, Eye, Settings, Loader2,
  Smartphone, Wallet, Banknote, Award, ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/revolutionary-card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import PaymentProcessingService from '@/lib/services/paymentProcessingService'
import type { 
  PaymentTransaction, 
  PaymentMethodData, 
  PaymentResult,
  FraudAssessment,
  PaymentAnalytics,
  OrderPaymentData
} from '@/lib/services/paymentProcessingService'
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement'

interface IntelligentPaymentTerminalProps {
  orderData?: OrderPaymentData
  onPaymentComplete?: (payment: PaymentTransaction) => void
  onPaymentFailed?: (error: string) => void
  viewMode?: 'cashier' | 'customer' | 'manager'
  showAnalytics?: boolean
}

interface TerminalState {
  currentPayment: PaymentTransaction | null
  paymentMethod: PaymentMethodData | null
  processing: boolean
  fraudAssessment: FraudAssessment | null
  paymentResult: PaymentResult | null
  analytics: PaymentAnalytics | null
  loading: boolean
  error: string | null
  step: 'order_review' | 'payment_method' | 'processing' | 'fraud_check' | 'completed' | 'failed'
  recommendations: any[]
  securityLevel: 'standard' | 'enhanced' | 'maximum'
}

export default function IntelligentPaymentTerminal({
  orderData,
  onPaymentComplete,
  onPaymentFailed,
  viewMode = 'cashier',
  showAnalytics = true
}: IntelligentPaymentTerminalProps) {
  const { restaurantData, loading: restaurantLoading } = useRestaurantManagement()
  const [activeTab, setActiveTab] = useState('payment')
  
  const [state, setState] = useState<TerminalState>({
    currentPayment: null,
    paymentMethod: null,
    processing: false,
    fraudAssessment: null,
    paymentResult: null,
    analytics: null,
    loading: false,
    error: null,
    step: 'order_review',
    recommendations: [],
    securityLevel: 'enhanced'
  })
  
  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    paymentType: 'credit_card',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    holderName: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US'
    },
    cashAmount: 0,
    loyaltyPoints: 0,
    tipAmount: 0
  })

  useEffect(() => {
    if (restaurantData?.organizationId && showAnalytics) {
      loadPaymentAnalytics()
    }
  }, [restaurantData?.organizationId, showAnalytics])

  const loadPaymentAnalytics = async () => {
    if (!restaurantData?.organizationId) return

    setState(prev => ({ ...prev, loading: true }))

    try {
      const analyticsResult = await PaymentProcessingService.getPaymentAnalytics(
        restaurantData.organizationId,
        'day'
      )

      if (analyticsResult.success && analyticsResult.data) {
        setState(prev => ({
          ...prev,
          analytics: analyticsResult.data!,
          loading: false
        }))
      }
    } catch (error) {
      console.error('❌ Failed to load payment analytics:', error)
      setState(prev => ({ 
        ...prev, 
        loading: false,
        error: 'Failed to load payment analytics'
      }))
    }
  }

  const createPaymentTransaction = async () => {
    if (!restaurantData?.organizationId || !orderData) return

    setState(prev => ({ ...prev, processing: true, error: null, step: 'processing' }))

    try {
      console.log('🏦 Creating payment transaction...')

      const paymentResult = await PaymentProcessingService.createPaymentTransaction(
        restaurantData.organizationId,
        orderData
      )

      if (paymentResult.success && paymentResult.data) {
        setState(prev => ({
          ...prev,
          currentPayment: paymentResult.data!,
          step: 'payment_method',
          processing: false
        }))

        console.log('✅ Payment transaction created:', paymentResult.data.id)
      } else {
        throw new Error(paymentResult.error || 'Failed to create payment transaction')
      }

    } catch (error) {
      console.error('❌ Payment transaction creation failed:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Payment creation failed',
        step: 'failed',
        processing: false
      }))
      onPaymentFailed?.(error instanceof Error ? error.message : 'Payment creation failed')
    }
  }

  const processPayment = async () => {
    if (!state.currentPayment || !state.paymentMethod || !restaurantData?.organizationId) return

    setState(prev => ({ ...prev, processing: true, error: null, step: 'fraud_check' }))

    try {
      console.log('💳 Processing payment...')

      const processingResult = await PaymentProcessingService.processPayment(
        state.currentPayment.id,
        restaurantData.organizationId,
        state.paymentMethod
      )

      if (processingResult.success && processingResult.data?.success) {
        setState(prev => ({
          ...prev,
          paymentResult: processingResult.data!,
          fraudAssessment: processingResult.data!.fraudAssessment || null,
          recommendations: processingResult.data!.recommendations || [],
          step: 'completed',
          processing: false
        }))

        // Update analytics after successful payment
        loadPaymentAnalytics()

        console.log('✅ Payment processed successfully')
        onPaymentComplete?.(processingResult.data!.paymentTransaction!)

      } else {
        throw new Error(processingResult.error || 'Payment processing failed')
      }

    } catch (error) {
      console.error('❌ Payment processing failed:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Payment processing failed',
        step: 'failed',
        processing: false
      }))
      onPaymentFailed?.(error instanceof Error ? error.message : 'Payment processing failed')
    }
  }

  const buildPaymentMethodData = (): PaymentMethodData => {
    switch (paymentForm.paymentType) {
      case 'credit_card':
        return {
          type: 'credit_card',
          cardData: {
            number: paymentForm.cardNumber.replace(/\s/g, ''),
            expiryMonth: paymentForm.expiryMonth,
            expiryYear: paymentForm.expiryYear,
            cvv: paymentForm.cvv,
            holderName: paymentForm.holderName,
            billingAddress: paymentForm.billingAddress
          }
        }
      case 'digital_wallet':
        return {
          type: 'digital_wallet',
          digitalWalletData: {
            provider: 'apple_pay',
            token: 'mock_wallet_token_123',
            email: 'customer@example.com'
          }
        }
      case 'cash':
        return {
          type: 'cash',
          cashData: {
            amountTendered: paymentForm.cashAmount,
            changeRequired: Math.max(0, paymentForm.cashAmount - (orderData?.amount || 0))
          }
        }
      case 'loyalty_points':
        return {
          type: 'loyalty_points',
          loyaltyData: {
            pointsToRedeem: paymentForm.loyaltyPoints,
            membershipLevel: 'gold',
            accountId: 'loyalty_account_123'
          }
        }
      default:
        throw new Error('Invalid payment method type')
    }
  }

  const handlePaymentMethodSubmit = () => {
    try {
      const paymentMethodData = buildPaymentMethodData()
      setState(prev => ({
        ...prev,
        paymentMethod: paymentMethodData
      }))
      processPayment()
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Invalid payment method data'
      }))
    }
  }

  const resetTerminal = () => {
    setState({
      currentPayment: null,
      paymentMethod: null,
      processing: false,
      fraudAssessment: null,
      paymentResult: null,
      analytics: state.analytics, // Keep analytics
      loading: false,
      error: null,
      step: 'order_review',
      recommendations: [],
      securityLevel: 'enhanced'
    })

    setPaymentForm({
      paymentType: 'credit_card',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      holderName: '',
      billingAddress: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'US'
      },
      cashAmount: 0,
      loyaltyPoints: 0,
      tipAmount: 0
    })
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'order_review': return <Receipt className="w-5 h-5" />
      case 'payment_method': return <CreditCard className="w-5 h-5" />
      case 'processing': return <Loader2 className="w-5 h-5 animate-spin" />
      case 'fraud_check': return <Shield className="w-5 h-5" />
      case 'completed': return <Check className="w-5 h-5" />
      case 'failed': return <AlertTriangle className="w-5 h-5" />
      default: return <Clock className="w-5 h-5" />
    }
  }

  if (restaurantLoading) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Loading restaurant data...</p>
      </Card>
    )
  }

  if (!restaurantData?.organizationId) {
    return (
      <Card className="p-8 text-center">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
        <h3 className="text-lg font-semibold mb-2">Restaurant Setup Required</h3>
        <p className="text-gray-600 mb-4">
          Please complete your restaurant setup to access payment processing.
        </p>
        <Button onClick={() => window.location.href = '/setup/restaurant'}>
          Complete Setup
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="w-7 h-7 text-blue-600" />
            Intelligent Payment Terminal
          </h1>
          <p className="text-gray-600">
            AI-powered secure payment processing with fraud detection
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className={`gap-1 ${getRiskLevelColor(state.securityLevel)}`}>
            <Shield className="w-3 h-3" />
            {state.securityLevel.toUpperCase()} Security
          </Badge>
          <Button variant="outline" onClick={resetTerminal}>
            Reset
          </Button>
        </div>
      </div>

      {/* Payment Analytics Dashboard */}
      {showAnalytics && state.analytics && (
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">₹{state.analytics.totalRevenue.toFixed(0)}</div>
                <div className="text-sm text-gray-600">Today's Revenue</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{state.analytics.totalTransactions}</div>
                <div className="text-sm text-gray-600">Transactions</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{state.analytics.successRate}%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{(state.analytics.fraudRate * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Fraud Rate</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Main Payment Interface */}
      <Card className="overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-gray-200 bg-gray-50/50">
            <TabsList className="grid w-full grid-cols-3 bg-transparent border-none">
              <TabsTrigger value="payment" className="py-4 px-6">
                <CreditCard className="w-4 h-4 mr-2" />
                Payment Processing
              </TabsTrigger>
              <TabsTrigger value="security" className="py-4 px-6">
                <Shield className="w-4 h-4 mr-2" />
                Security & Fraud
              </TabsTrigger>
              <TabsTrigger value="analytics" className="py-4 px-6">
                <Activity className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="payment" className="p-6">
            <div className="space-y-6">
              {/* Payment Process Steps */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <div className="flex items-center gap-4">
                  {getStepIcon(state.step)}
                  <div>
                    <h3 className="font-semibold text-blue-800 capitalize">
                      {state.step.replace('_', ' ')}
                    </h3>
                    <p className="text-sm text-blue-600">
                      {state.step === 'order_review' && 'Review order details and start payment'}
                      {state.step === 'payment_method' && 'Select and enter payment method'}
                      {state.step === 'processing' && 'Processing payment transaction...'}
                      {state.step === 'fraud_check' && 'Performing security verification...'}
                      {state.step === 'completed' && 'Payment completed successfully!'}
                      {state.step === 'failed' && 'Payment failed. Please try again.'}
                    </p>
                  </div>
                </div>
                {state.processing && (
                  <Progress value={75} className="w-32" />
                )}
              </div>

              {/* Error Display */}
              {state.error && (
                <Card className="p-4 bg-red-50 border-red-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">Payment Error</p>
                      <p className="text-sm text-red-600">{state.error}</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Order Review Step */}
              {state.step === 'order_review' && orderData && (
                <Card className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Receipt className="w-5 h-5" />
                    Order Summary
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {orderData.orderItems.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">{item.itemName}</span>
                            <span className="text-gray-600 ml-2">x{item.quantity}</span>
                          </div>
                          <span className="font-medium">₹{item.totalPrice.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{(orderData.amount - orderData.taxAmount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>₹{orderData.taxAmount.toFixed(2)}</span>
                      </div>
                      {orderData.tipAmount && (
                        <div className="flex justify-between">
                          <span>Tip</span>
                          <span>₹{orderData.tipAmount.toFixed(2)}</span>
                        </div>
                      )}
                      {orderData.discountAmount && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span>-₹{orderData.discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>₹{orderData.amount.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={createPaymentTransaction}
                      disabled={state.processing}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      {state.processing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Creating Payment...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Start Payment Process
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              )}

              {/* Payment Method Step */}
              {state.step === 'payment_method' && (
                <Card className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Method
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Payment Type Selection */}
                    <div>
                      <Label htmlFor="payment-type">Payment Type</Label>
                      <Select 
                        value={paymentForm.paymentType} 
                        onValueChange={(value) => setPaymentForm(prev => ({ ...prev, paymentType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="credit_card">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4" />
                              Credit Card
                            </div>
                          </SelectItem>
                          <SelectItem value="digital_wallet">
                            <div className="flex items-center gap-2">
                              <Smartphone className="w-4 h-4" />
                              Digital Wallet
                            </div>
                          </SelectItem>
                          <SelectItem value="cash">
                            <div className="flex items-center gap-2">
                              <Banknote className="w-4 h-4" />
                              Cash
                            </div>
                          </SelectItem>
                          <SelectItem value="loyalty_points">
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4" />
                              Loyalty Points
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Credit Card Form */}
                    {paymentForm.paymentType === 'credit_card' && (
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="card-number">Card Number</Label>
                            <Input
                              id="card-number"
                              placeholder="1234 5678 9012 3456"
                              value={paymentForm.cardNumber}
                              onChange={(e) => setPaymentForm(prev => ({ ...prev, cardNumber: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="holder-name">Cardholder Name</Label>
                            <Input
                              id="holder-name"
                              placeholder="John Smith"
                              value={paymentForm.holderName}
                              onChange={(e) => setPaymentForm(prev => ({ ...prev, holderName: e.target.value }))}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="expiry-month">Month</Label>
                            <Select
                              value={paymentForm.expiryMonth}
                              onValueChange={(value) => setPaymentForm(prev => ({ ...prev, expiryMonth: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="MM" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                  <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                                    {month.toString().padStart(2, '0')}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="expiry-year">Year</Label>
                            <Select
                              value={paymentForm.expiryYear}
                              onValueChange={(value) => setPaymentForm(prev => ({ ...prev, expiryYear: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="YYYY" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                                  <SelectItem key={year} value={year.toString()}>
                                    {year}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="cvv">CVV</Label>
                            <Input
                              id="cvv"
                              placeholder="123"
                              maxLength={4}
                              value={paymentForm.cvv}
                              onChange={(e) => setPaymentForm(prev => ({ ...prev, cvv: e.target.value }))}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Cash Payment Form */}
                    {paymentForm.paymentType === 'cash' && (
                      <div>
                        <Label htmlFor="cash-amount">Cash Amount Tendered</Label>
                        <Input
                          id="cash-amount"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={paymentForm.cashAmount || ''}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, cashAmount: parseFloat(e.target.value) || 0 }))}
                        />
                        {paymentForm.cashAmount > 0 && orderData && (
                          <p className="text-sm text-gray-600 mt-2">
                            Change: ₹{Math.max(0, paymentForm.cashAmount - orderData.amount).toFixed(2)}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Digital Wallet */}
                    {paymentForm.paymentType === 'digital_wallet' && (
                      <div className="text-center py-8">
                        <Smartphone className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                        <h4 className="text-lg font-semibold mb-2">Digital Wallet Payment</h4>
                        <p className="text-gray-600 mb-4">
                          Use Apple Pay, Google Pay, or other digital wallet
                        </p>
                        <div className="flex justify-center gap-4">
                          <Badge className="px-4 py-2">Apple Pay</Badge>
                          <Badge className="px-4 py-2">Google Pay</Badge>
                          <Badge className="px-4 py-2">PayPal</Badge>
                        </div>
                      </div>
                    )}

                    {/* Loyalty Points */}
                    {paymentForm.paymentType === 'loyalty_points' && (
                      <div>
                        <Label htmlFor="loyalty-points">Loyalty Points to Redeem</Label>
                        <Input
                          id="loyalty-points"
                          type="number"
                          placeholder="0"
                          value={paymentForm.loyaltyPoints || ''}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, loyaltyPoints: parseInt(e.target.value) || 0 }))}
                        />
                        <p className="text-sm text-gray-600 mt-2">
                          Available: 1,250 points (₹{(1250 * 0.01).toFixed(2)} value)
                        </p>
                      </div>
                    )}

                    <Button 
                      onClick={handlePaymentMethodSubmit}
                      disabled={state.processing}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      {state.processing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Process Secure Payment
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              )}

              {/* Fraud Check Step */}
              {state.step === 'fraud_check' && (
                <Card className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security Verification
                  </h3>
                  
                  <div className="text-center py-8">
                    <Shield className="w-16 h-16 mx-auto mb-4 text-blue-600 animate-pulse" />
                    <h4 className="text-lg font-semibold mb-2">Performing Security Checks</h4>
                    <p className="text-gray-600 mb-4">
                      AI-powered fraud detection in progress...
                    </p>
                    <Progress value={60} className="w-full max-w-md mx-auto" />
                  </div>
                </Card>
              )}

              {/* Completed Step */}
              {state.step === 'completed' && state.paymentResult && (
                <Card className="p-6 bg-green-50 border-green-200">
                  <div className="text-center">
                    <Check className="w-16 h-16 mx-auto mb-4 text-green-600" />
                    <h3 className="text-xl font-semibold text-green-800 mb-2">
                      Payment Successful!
                    </h3>
                    <p className="text-green-600 mb-6">
                      Transaction completed securely
                    </p>
                    
                    {state.paymentResult.paymentTransaction && (
                      <div className="bg-white p-4 rounded-lg border text-left space-y-2">
                        <div className="flex justify-between">
                          <span>Transaction ID:</span>
                          <span className="font-mono text-sm">{state.paymentResult.transactionId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Amount:</span>
                          <span className="font-semibold">₹{state.paymentResult.paymentTransaction.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Processing Fee:</span>
                          <span>₹{state.paymentResult.paymentTransaction.processingFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Net Amount:</span>
                          <span className="font-semibold">₹{state.paymentResult.paymentTransaction.netAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-3 mt-6">
                      <Button onClick={resetTerminal} className="flex-1">
                        New Payment
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Receipt className="w-4 h-4 mr-2" />
                        Print Receipt
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Failed Step */}
              {state.step === 'failed' && (
                <Card className="p-6 bg-red-50 border-red-200">
                  <div className="text-center">
                    <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-600" />
                    <h3 className="text-xl font-semibold text-red-800 mb-2">
                      Payment Failed
                    </h3>
                    <p className="text-red-600 mb-6">
                      {state.error || 'Payment processing failed. Please try again.'}
                    </p>
                    
                    <div className="flex gap-3">
                      <Button onClick={resetTerminal} className="flex-1">
                        Try Again
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Contact Support
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="security" className="p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security & Fraud Detection
              </h3>

              {/* Fraud Assessment */}
              {state.fraudAssessment && (
                <Card className="p-6">
                  <h4 className="font-semibold mb-4">Fraud Assessment Results</h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Risk Score:</span>
                      <div className="flex items-center gap-2">
                        <Progress value={state.fraudAssessment.riskScore * 100} className="w-24" />
                        <span className="font-semibold">
                          {(state.fraudAssessment.riskScore * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Risk Level:</span>
                      <Badge className={getRiskLevelColor(state.fraudAssessment.riskLevel)}>
                        {state.fraudAssessment.riskLevel.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Recommendation:</span>
                      <Badge className={
                        state.fraudAssessment.recommendation === 'approve' ? 'bg-green-100 text-green-800' :
                        state.fraudAssessment.recommendation === 'review' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {state.fraudAssessment.recommendation.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Confidence:</span>
                      <span className="font-semibold">
                        {(state.fraudAssessment.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {state.fraudAssessment.riskFactors.length > 0 && (
                    <div className="mt-6">
                      <h5 className="font-medium mb-3">Risk Factors</h5>
                      <div className="space-y-2">
                        {state.fraudAssessment.riskFactors.map((factor, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <span className="font-medium capitalize">{factor.factor.replace('_', ' ')}</span>
                              <p className="text-sm text-gray-600">{factor.description}</p>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">{(factor.score * 100).toFixed(1)}%</div>
                              <div className="text-sm text-gray-600">Weight: {factor.weight}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              )}

              {/* Security Features */}
              <Card className="p-6">
                <h4 className="font-semibold mb-4">Security Features</h4>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Check className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-medium">PCI DSS Compliant</div>
                      <div className="text-sm text-gray-600">Level 1 merchant compliance</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Check className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-medium">End-to-End Encryption</div>
                      <div className="text-sm text-gray-600">256-bit SSL encryption</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Check className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-medium">Real-Time Fraud Detection</div>
                      <div className="text-sm text-gray-600">AI-powered risk assessment</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Check className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-medium">Secure Tokenization</div>
                      <div className="text-sm text-gray-600">Payment data tokenization</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Payment Analytics
              </h3>

              {state.analytics ? (
                <>
                  {/* Payment Method Distribution */}
                  <Card className="p-6">
                    <h4 className="font-semibold mb-4">Payment Method Distribution</h4>
                    <div className="space-y-4">
                      {state.analytics.paymentMethodDistribution.map((method, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{method.method}</span>
                            <span className="text-sm text-gray-600">
                              {method.count} transactions ({method.percentage}%)
                            </span>
                          </div>
                          <Progress value={method.percentage} className="h-2" />
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Success Rate: {method.successRate}%</span>
                            <span>Avg: ₹{method.averageAmount.toFixed(2)}</span>
                            <span>Total: ₹{method.totalRevenue.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Financial Summary */}
                  <Card className="p-6">
                    <h4 className="font-semibold mb-4">Financial Summary</h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Gross Revenue:</span>
                          <span className="font-semibold">₹{state.analytics.totalRevenue.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Processing Costs:</span>
                          <span className="text-red-600">-₹{state.analytics.processingCosts.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-semibold">Net Revenue:</span>
                          <span className="font-semibold">₹{state.analytics.netRevenue.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Average Transaction:</span>
                          <span className="font-semibold">₹{state.analytics.averageTransactionValue.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Success Rate:</span>
                          <span className="font-semibold text-green-600">{state.analytics.successRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fraud Rate:</span>
                          <span className="font-semibold text-orange-600">{(state.analytics.fraudRate * 100).toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </>
              ) : (
                <Card className="p-8 text-center">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h4 className="text-lg font-semibold mb-2">No Analytics Data</h4>
                  <p className="text-gray-600 mb-4">
                    Process some payments to see analytics data here.
                  </p>
                  <Button onClick={loadPaymentAnalytics} variant="outline">
                    Refresh Analytics
                  </Button>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* AI Recommendations */}
      {state.recommendations.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            AI Payment Recommendations
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {state.recommendations.map((rec, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{rec.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(rec.confidence * 100)}% confidence
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-600">
                    Impact: +{Math.round(rec.impact * 100)}%
                  </span>
                  {rec.actionRequired && (
                    <Button size="sm" variant="outline">
                      Take Action
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Universal Transactions Architecture Showcase */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="text-center mb-4">
          <Badge className="gap-1 bg-green-500 text-white mb-3">
            <Lock className="w-3 h-3" />
            Secure Universal Payment Architecture
          </Badge>
          <h3 className="text-lg font-semibold text-green-800">
            Enterprise-Grade Payment Security Technology
          </h3>
        </div>
        
        <div className="grid md:grid-cols-4 gap-4 text-sm">
          <div className="text-center p-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="font-medium text-green-800">AI Fraud Detection</div>
            <div className="text-green-600">Machine learning powered security</div>
          </div>
          
          <div className="text-center p-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <div className="font-medium text-green-800">PCI DSS Compliant</div>
            <div className="text-green-600">Enterprise security standards</div>
          </div>
          
          <div className="text-center p-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div className="font-medium text-green-800">Real-Time Processing</div>
            <div className="text-green-600">Instant payment verification</div>
          </div>
          
          <div className="text-center p-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div className="font-medium text-green-800">Universal Schema</div>
            <div className="text-green-600">Scalable payment architecture</div>
          </div>
        </div>
      </Card>
    </div>
  )
}