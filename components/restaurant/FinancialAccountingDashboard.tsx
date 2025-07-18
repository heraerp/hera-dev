'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calculator, PieChart, TrendingUp, DollarSign, FileText, BookOpen,
  BarChart3, Activity, Target, Users, Plus, Settings, Download,
  Eye, Edit, Trash2, CheckCircle, AlertTriangle, Loader2,
  Building, CreditCard, Wallet, Receipt, Banknote, Star
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
import FinancialAccountingService from '@/lib/services/financialAccountingService'
import type { 
  ChartOfAccount, 
  JournalEntry, 
  FinancialReport,
  FinancialReportData
} from '@/lib/services/financialAccountingService'
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement'

interface FinancialAccountingDashboardProps {
  onAccountSelect?: (account: ChartOfAccount) => void
  onJournalEntrySelect?: (entry: JournalEntry) => void
  viewMode?: 'accountant' | 'manager' | 'owner'
  showInitializeButton?: boolean
}

interface DashboardState {
  chartOfAccounts: ChartOfAccount[]
  journalEntries: JournalEntry[]
  trialBalance: FinancialReport | null
  loading: boolean
  error: string | null
  selectedAccount: ChartOfAccount | null
  selectedJournalEntry: JournalEntry | null
  financialSummary: {
    totalAssets: number
    totalLiabilities: number
    totalEquity: number
    totalRevenue: number
    totalExpenses: number
    netIncome: number
    cashBalance: number
  }
  filters: {
    accountType: string
    dateRange: string
    search: string
  }
}

export default function FinancialAccountingDashboard({
  onAccountSelect,
  onJournalEntrySelect,
  viewMode = 'accountant',
  showInitializeButton = true
}: FinancialAccountingDashboardProps) {
  const { restaurantData, loading: restaurantLoading } = useRestaurantManagement()
  const [activeTab, setActiveTab] = useState('overview')
  const [isInitializing, setIsInitializing] = useState(false)
  
  const [state, setState] = useState<DashboardState>({
    chartOfAccounts: [],
    journalEntries: [],
    trialBalance: null,
    loading: true,
    error: null,
    selectedAccount: null,
    selectedJournalEntry: null,
    financialSummary: {
      totalAssets: 0,
      totalLiabilities: 0,
      totalEquity: 0,
      totalRevenue: 0,
      totalExpenses: 0,
      netIncome: 0,
      cashBalance: 0
    },
    filters: {
      accountType: 'all',
      dateRange: 'current_month',
      search: ''
    }
  })

  useEffect(() => {
    if (restaurantData?.organizationId) {
      loadFinancialData()
    }
  }, [restaurantData?.organizationId])

  const loadFinancialData = async () => {
    if (!restaurantData?.organizationId) return

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      console.log('📊 Loading financial data for organization:', restaurantData.organizationId)
      
      // Load chart of accounts
      const chartResult = await FinancialAccountingService.getChartOfAccounts(
        restaurantData.organizationId
      )

      if (chartResult.success && chartResult.data) {
        const accounts = chartResult.data
        
        // Calculate financial summary
        const summary = calculateFinancialSummary(accounts)
        
        setState(prev => ({
          ...prev,
          chartOfAccounts: accounts,
          financialSummary: summary,
          loading: false
        }))
        
        // Load trial balance
        loadTrialBalance()
        
        console.log('✅ Financial data loaded:', { accounts: accounts.length })
      } else {
        setState(prev => ({
          ...prev,
          chartOfAccounts: [],
          loading: false,
          error: chartResult.error || 'No chart of accounts found'
        }))
      }

    } catch (error) {
      console.error('❌ Failed to load financial data:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load financial data',
        loading: false
      }))
    }
  }

  const loadTrialBalance = async () => {
    if (!restaurantData?.organizationId) return

    try {
      const today = new Date().toISOString().split('T')[0]
      const trialBalanceResult = await FinancialAccountingService.generateTrialBalance(
        restaurantData.organizationId,
        today
      )

      if (trialBalanceResult.success && trialBalanceResult.data) {
        setState(prev => ({
          ...prev,
          trialBalance: trialBalanceResult.data!
        }))
        
        console.log('✅ Trial balance loaded')
      }

    } catch (error) {
      console.warn('⚠️ Failed to load trial balance:', error)
    }
  }

  const calculateFinancialSummary = (accounts: ChartOfAccount[]) => {
    const summary = {
      totalAssets: 0,
      totalLiabilities: 0,
      totalEquity: 0,
      totalRevenue: 0,
      totalExpenses: 0,
      netIncome: 0,
      cashBalance: 0
    }

    accounts.forEach(account => {
      if (!account.isPosting) return // Skip non-posting accounts

      switch (account.accountType) {
        case 'Assets':
          summary.totalAssets += account.balance
          if (account.accountCode === '1110') { // Cash and Cash Equivalents
            summary.cashBalance = account.balance
          }
          break
        case 'Liabilities':
          summary.totalLiabilities += account.balance
          break
        case 'Equity':
          summary.totalEquity += account.balance
          break
        case 'Income':
          summary.totalRevenue += account.balance
          break
        case 'Expense':
          summary.totalExpenses += account.balance
          break
      }
    })

    summary.netIncome = summary.totalRevenue - summary.totalExpenses

    return summary
  }

  const initializeFinancialData = async () => {
    if (!restaurantData?.organizationId) return

    setIsInitializing(true)

    try {
      console.log('🏦 Initializing financial accounting data...')

      const initResult = await FinancialAccountingService.initializeFinancialData(
        restaurantData.organizationId
      )

      if (initResult.success) {
        // Reload financial data after initialization
        await loadFinancialData()
        
        console.log('✅ Financial data initialized successfully')
      } else {
        throw new Error(initResult.error || 'Failed to initialize financial data')
      }

    } catch (error) {
      console.error('❌ Financial data initialization failed:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Initialization failed'
      }))
    } finally {
      setIsInitializing(false)
    }
  }

  const createSalesJournalEntry = async () => {
    if (!restaurantData?.organizationId) return

    try {
      console.log('💰 Creating sample sales journal entry...')

      const salesData = {
        orderId: 'demo-order-' + Date.now(),
        totalAmount: 25.50,
        taxAmount: 2.04,
        paymentMethod: 'cash',
        saleDate: new Date().toISOString().split('T')[0]
      }

      const journalResult = await FinancialAccountingService.createSalesJournalEntry(
        restaurantData.organizationId,
        salesData
      )

      if (journalResult.success) {
        // Reload financial data to reflect the new entry
        await loadFinancialData()
        console.log('✅ Sales journal entry created successfully')
      } else {
        throw new Error(journalResult.error || 'Failed to create journal entry')
      }

    } catch (error) {
      console.error('❌ Failed to create sales journal entry:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create journal entry'
      }))
    }
  }

  const filteredAccounts = state.chartOfAccounts.filter(account => {
    if (state.filters.accountType !== 'all' && account.accountType !== state.filters.accountType) {
      return false
    }
    if (state.filters.search && !account.accountName.toLowerCase().includes(state.filters.search.toLowerCase()) &&
        !account.accountCode.includes(state.filters.search)) {
      return false
    }
    return true
  })

  const getAccountTypeIcon = (accountType: string) => {
    switch (accountType) {
      case 'Assets': return <Building className="w-4 h-4" />
      case 'Liabilities': return <CreditCard className="w-4 h-4" />
      case 'Equity': return <Wallet className="w-4 h-4" />
      case 'Income': return <TrendingUp className="w-4 h-4" />
      case 'Expense': return <Receipt className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getAccountTypeColor = (accountType: string) => {
    switch (accountType) {
      case 'Assets': return 'text-blue-600 bg-blue-100'
      case 'Liabilities': return 'text-red-600 bg-red-100'
      case 'Equity': return 'text-purple-600 bg-purple-100'
      case 'Income': return 'text-green-600 bg-green-100'
      case 'Expense': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
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
          Please complete your restaurant setup to access financial accounting.
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
            <Calculator className="w-7 h-7 text-blue-600" />
            Financial Accounting System
          </h1>
          <p className="text-gray-600">
            SAP Business One-style chart of accounts with universal schema architecture
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {showInitializeButton && state.chartOfAccounts.length === 0 && (
            <Button
              onClick={initializeFinancialData}
              disabled={isInitializing}
              className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {isInitializing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Initialize Chart of Accounts
                </>
              )}
            </Button>
          )}
          
          {state.chartOfAccounts.length > 0 && (
            <Button
              onClick={createSalesJournalEntry}
              variant="outline"
              className="gap-2"
            >
              <Receipt className="w-4 h-4" />
              Create Sample Entry
            </Button>
          )}
          
          <Button variant="outline" className="gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {state.error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Error</p>
              <p className="text-sm text-red-600">{state.error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadFinancialData}
              className="ml-auto"
            >
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Financial Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">₹{state.financialSummary.totalAssets.toFixed(0)}</div>
              <div className="text-sm text-gray-600">Total Assets</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <CreditCard className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">₹{state.financialSummary.totalLiabilities.toFixed(0)}</div>
              <div className="text-sm text-gray-600">Total Liabilities</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">₹{state.financialSummary.totalRevenue.toFixed(0)}</div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">₹{state.financialSummary.netIncome.toFixed(0)}</div>
              <div className="text-sm text-gray-600">Net Income</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-gray-200 bg-gray-50/50">
            <TabsList className="grid w-full grid-cols-4 bg-transparent border-none">
              <TabsTrigger value="overview" className="py-4 px-6">
                <PieChart className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="chart" className="py-4 px-6">
                <BookOpen className="w-4 h-4 mr-2" />
                Chart of Accounts
              </TabsTrigger>
              <TabsTrigger value="trial_balance" className="py-4 px-6">
                <BarChart3 className="w-4 h-4 mr-2" />
                Trial Balance
              </TabsTrigger>
              <TabsTrigger value="reports" className="py-4 px-6">
                <FileText className="w-4 h-4 mr-2" />
                Reports
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Financial Overview</h3>

              {/* Balance Sheet Summary */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h4 className="font-semibold mb-4">Balance Sheet Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-blue-600" />
                        Total Assets
                      </span>
                      <span className="font-semibold">₹{state.financialSummary.totalAssets.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-red-600" />
                        Total Liabilities
                      </span>
                      <span className="font-semibold">₹{state.financialSummary.totalLiabilities.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-purple-600" />
                        Owner's Equity
                      </span>
                      <span className="font-semibold">₹{state.financialSummary.totalEquity.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center font-bold">
                      <span>Assets = Liabilities + Equity</span>
                      <span className={
                        Math.abs(state.financialSummary.totalAssets - (state.financialSummary.totalLiabilities + state.financialSummary.totalEquity)) < 0.01
                          ? 'text-green-600' : 'text-red-600'
                      }>
                        {Math.abs(state.financialSummary.totalAssets - (state.financialSummary.totalLiabilities + state.financialSummary.totalEquity)) < 0.01 ? '✓ Balanced' : '⚠ Unbalanced'}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h4 className="font-semibold mb-4">Income Statement Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        Total Revenue
                      </span>
                      <span className="font-semibold">₹{state.financialSummary.totalRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-orange-600" />
                        Total Expenses
                      </span>
                      <span className="font-semibold">₹{state.financialSummary.totalExpenses.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center font-bold">
                      <span>Net Income</span>
                      <span className={state.financialSummary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}>
                        ₹{state.financialSummary.netIncome.toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="text-sm text-gray-600 mb-2">Profit Margin</div>
                      <Progress 
                        value={state.financialSummary.totalRevenue > 0 ? (state.financialSummary.netIncome / state.financialSummary.totalRevenue) * 100 : 0} 
                        className="h-2"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {state.financialSummary.totalRevenue > 0 ? ((state.financialSummary.netIncome / state.financialSummary.totalRevenue) * 100).toFixed(1) : 0}%
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Cash Flow Summary */}
              <Card className="p-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-green-600" />
                  Cash Position
                </h4>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-800">₹{state.financialSummary.cashBalance.toFixed(0)}</div>
                    <div className="text-sm text-green-600">Cash Balance</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-800">₹0</div>
                    <div className="text-sm text-blue-600">Accounts Receivable</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-800">₹0</div>
                    <div className="text-sm text-red-600">Accounts Payable</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-800">₹{state.financialSummary.cashBalance.toFixed(0)}</div>
                    <div className="text-sm text-purple-600">Working Capital</div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="chart" className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Chart of Accounts</h3>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="account-type">Filter by Type:</Label>
                    <Select 
                      value={state.filters.accountType} 
                      onValueChange={(value) => setState(prev => ({ 
                        ...prev, 
                        filters: { ...prev.filters, accountType: value } 
                      }))}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Assets">Assets</SelectItem>
                        <SelectItem value="Liabilities">Liabilities</SelectItem>
                        <SelectItem value="Equity">Equity</SelectItem>
                        <SelectItem value="Income">Income</SelectItem>
                        <SelectItem value="Expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Input
                    placeholder="Search accounts..."
                    value={state.filters.search}
                    onChange={(e) => setState(prev => ({ 
                      ...prev, 
                      filters: { ...prev.filters, search: e.target.value } 
                    }))}
                    className="w-64"
                  />
                </div>
              </div>

              {state.loading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-600">Loading chart of accounts...</p>
                </div>
              ) : filteredAccounts.length === 0 ? (
                <Card className="p-8 text-center">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h4 className="text-lg font-semibold mb-2">No Chart of Accounts</h4>
                  <p className="text-gray-600 mb-4">
                    Initialize your chart of accounts to start financial accounting.
                  </p>
                  {showInitializeButton && (
                    <Button onClick={initializeFinancialData} disabled={isInitializing}>
                      {isInitializing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Initializing...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Initialize Chart of Accounts
                        </>
                      )}
                    </Button>
                  )}
                </Card>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredAccounts.map((account) => (
                    <motion.div
                      key={account.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg border hover:shadow-md transition-all duration-200 cursor-pointer"
                      onClick={() => {
                        setState(prev => ({ ...prev, selectedAccount: account }))
                        onAccountSelect?.(account)
                      }}
                      style={{ paddingLeft: `${account.level * 20 + 16}px` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                            {getAccountTypeIcon(account.accountType)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {account.accountCode} - {account.accountName}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Badge className={getAccountTypeColor(account.accountType)}>
                                {account.accountType}
                              </Badge>
                              <span>•</span>
                              <span>{account.accountCategory}</span>
                              {!account.isPosting && (
                                <>
                                  <span>•</span>
                                  <Badge variant="outline" className="text-xs">Header</Badge>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            ₹{account.balance.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">
                            Level {account.level}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="trial_balance" className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Trial Balance</h3>
                
                <div className="flex gap-3">
                  <Button variant="outline" onClick={loadTrialBalance}>
                    <Activity className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {state.trialBalance ? (
                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold">Trial Balance</h4>
                      <Badge className="text-xs">
                        As of {new Date(state.trialBalance.periodEnd).toLocaleDateString()}
                      </Badge>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Account Code</th>
                            <th className="text-left py-2">Account Name</th>
                            <th className="text-right py-2">Debit</th>
                            <th className="text-right py-2">Credit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {state.trialBalance.data.map((row, index) => (
                            <tr key={index} className={row.accountCode === 'TOTAL' ? 'border-t-2 font-bold' : 'border-b'}>
                              <td className="py-2">{row.accountCode}</td>
                              <td className="py-2">{row.accountName}</td>
                              <td className="py-2 text-right">
                                {row.debitBalance > 0 ? `₹${row.debitBalance.toFixed(2)}` : '-'}
                              </td>
                              <td className="py-2 text-right">
                                {row.creditBalance > 0 ? `₹${row.creditBalance.toFixed(2)}` : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="p-8 text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h4 className="text-lg font-semibold mb-2">No Trial Balance Data</h4>
                  <p className="text-gray-600 mb-4">
                    Create some journal entries to generate a trial balance.
                  </p>
                  <Button onClick={loadTrialBalance} variant="outline">
                    Generate Trial Balance
                  </Button>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Financial Reports</h3>

              <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-6 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                  <h4 className="font-semibold mb-2">Balance Sheet</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Assets, liabilities, and equity at a point in time
                  </p>
                  <Button variant="outline" className="w-full">
                    Generate Report
                  </Button>
                </Card>

                <Card className="p-6 text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-green-600" />
                  <h4 className="font-semibold mb-2">Income Statement</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Revenue and expenses over a period of time
                  </p>
                  <Button variant="outline" className="w-full">
                    Generate Report
                  </Button>
                </Card>

                <Card className="p-6 text-center">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                  <h4 className="font-semibold mb-2">Cash Flow Statement</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Cash inflows and outflows from operations
                  </p>
                  <Button variant="outline" className="w-full">
                    Generate Report
                  </Button>
                </Card>
              </div>

              {/* Sample Reports Data */}
              <Card className="p-6">
                <h4 className="font-semibold mb-4">Recent Financial Activity</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">Sales Revenue Recognition</span>
                      <p className="text-sm text-gray-600">Tea and pastry sales journal entry</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">+₹23.75</div>
                      <div className="text-sm text-gray-600">Today</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">Rent Expense</span>
                      <p className="text-sm text-gray-600">Monthly rent payment</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-red-600">-₹2,000</div>
                      <div className="text-sm text-gray-600">Jan 1</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">Owner Capital Contribution</span>
                      <p className="text-sm text-gray-600">Initial investment</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-blue-600">+₹5,000</div>
                      <div className="text-sm text-gray-600">Jan 1</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* SAP Business One Architecture Showcase */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="text-center mb-4">
          <Badge className="gap-1 bg-blue-500 text-white mb-3">
            <Star className="w-3 h-3" />
            SAP Business One Universal Architecture
          </Badge>
          <h3 className="text-lg font-semibold text-blue-800">
            Enterprise Financial Accounting Technology
          </h3>
        </div>
        
        <div className="grid md:grid-cols-4 gap-4 text-sm">
          <div className="text-center p-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div className="font-medium text-blue-800">SAP Chart of Accounts</div>
            <div className="text-blue-600">Enterprise-grade account structure and hierarchy</div>
          </div>
          
          <div className="text-center p-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Calculator className="w-4 h-4 text-white" />
            </div>
            <div className="font-medium text-blue-800">Automated Journal Entries</div>
            <div className="text-blue-600">Real-time financial transaction processing</div>
          </div>
          
          <div className="text-center p-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <div className="font-medium text-blue-800">Financial Reporting</div>
            <div className="text-blue-600">Complete trial balance and financial statements</div>
          </div>
          
          <div className="text-center p-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div className="font-medium text-blue-800">Universal Schema</div>
            <div className="text-blue-600">Scalable financial architecture for any business</div>
          </div>
        </div>
      </Card>

      {/* Selected Account Details */}
      {state.selectedAccount && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Account Details
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(state.selectedAccount, null, 2)}
              </pre>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}