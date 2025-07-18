'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  CalculatorIcon, 
  Download, 
  RefreshCw, 
  Calendar, 
  TrendingUp,
  DollarSign,
  Building,
  CreditCard,
  Banknote,
  CheckCircle,
  AlertTriangle,
  BarChart3
} from 'lucide-react'
import TrialBalanceService, { TrialBalanceData, AccountBalance } from '@/lib/services/trialBalanceService'
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement'

interface TrialBalanceProps {
  organizationId?: string
  className?: string
}

export default function TrialBalance({ organizationId: propOrganizationId, className }: TrialBalanceProps) {
  const { restaurantData } = useRestaurantManagement()
  const organizationId = propOrganizationId || restaurantData?.organizationId

  const [trialBalance, setTrialBalance] = useState<TrialBalanceData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Date filters
  const [periodStart, setPeriodStart] = useState(() => {
    const start = new Date(new Date().getFullYear(), 0, 1)
    return start.toISOString().split('T')[0]
  })
  const [periodEnd, setPeriodEnd] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })

  const trialBalanceService = new TrialBalanceService()

  const generateTrialBalance = async () => {
    if (!organizationId) {
      setError('No organization selected')
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('🧮 Generating trial balance...')
      
      const result = await trialBalanceService.generateTrialBalance(
        organizationId,
        periodEnd,
        periodStart,
        periodEnd
      )

      if (result.success && result.data) {
        setTrialBalance(result.data)
        console.log('✅ Trial balance generated:', result.message)
      } else {
        setError(result.message)
      }

    } catch (error) {
      console.error('❌ Error generating trial balance:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const downloadCSV = () => {
    if (!trialBalance) return

    const csvContent = trialBalanceService.exportToCSV(trialBalance)
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trial-balance-${trialBalance.as_of_date}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const getAccountIcon = (accountType: string) => {
    switch (accountType) {
      case 'asset': return <Building className="h-4 w-4 text-blue-600" />
      case 'liability': return <CreditCard className="h-4 w-4 text-red-600" />
      case 'equity': return <TrendingUp className="h-4 w-4 text-purple-600" />
      case 'revenue': return <DollarSign className="h-4 w-4 text-green-600" />
      case 'expense': return <Banknote className="h-4 w-4 text-orange-600" />
      default: return <BarChart3 className="h-4 w-4 text-gray-600" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const summary = trialBalance ? trialBalanceService.getTrialBalanceSummary(trialBalance) : null

  useEffect(() => {
    if (organizationId) {
      generateTrialBalance()
    }
  }, [organizationId])

  if (!organizationId) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-gray-600">
            Please select a restaurant to view trial balance
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <CalculatorIcon className="h-6 w-6" />
                Trial Balance
              </CardTitle>
              <CardDescription>
                Statement showing all account balances to verify accounting equation
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {trialBalance && (
                <Button onClick={downloadCSV} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              )}
              <Button onClick={generateTrialBalance} disabled={loading} size="sm">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Generating...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="periodStart">Period Start</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="periodStart"
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="periodEnd">Period End</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="periodEnd"
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Trial Balance Status */}
      {trialBalance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {trialBalance.is_balanced ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              Balance Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(trialBalance.total_debits)}
                </div>
                <div className="text-sm text-gray-600">Total Debits</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(trialBalance.total_credits)}
                </div>
                <div className="text-sm text-gray-600">Total Credits</div>
              </div>
              <div className="text-center">
                <Badge 
                  variant={trialBalance.is_balanced ? "default" : "destructive"}
                  className="text-sm px-3 py-1"
                >
                  {trialBalance.is_balanced ? 'Balanced' : 'Out of Balance'}
                </Badge>
                <div className="text-sm text-gray-600 mt-1">
                  Difference: {formatCurrency(Math.abs(trialBalance.total_debits - trialBalance.total_credits))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Summary */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Account Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Building className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-lg font-semibold">{formatCurrency(summary.assets.total)}</div>
                <div className="text-sm text-gray-600">Assets ({summary.assets.count})</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <CreditCard className="h-5 w-5 text-red-600" />
                </div>
                <div className="text-lg font-semibold">{formatCurrency(summary.liabilities.total)}</div>
                <div className="text-sm text-gray-600">Liabilities ({summary.liabilities.count})</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-lg font-semibold">{formatCurrency(summary.equity.total)}</div>
                <div className="text-sm text-gray-600">Equity ({summary.equity.count})</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-lg font-semibold">{formatCurrency(summary.revenue.total)}</div>
                <div className="text-sm text-gray-600">Revenue ({summary.revenue.count})</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Banknote className="h-5 w-5 text-orange-600" />
                </div>
                <div className="text-lg font-semibold">{formatCurrency(summary.expenses.total)}</div>
                <div className="text-sm text-gray-600">Expenses ({summary.expenses.count})</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trial Balance Table */}
      {trialBalance && trialBalance.accounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>
              As of {new Date(trialBalance.as_of_date).toLocaleDateString()} • Period: {new Date(trialBalance.period_start).toLocaleDateString()} to {new Date(trialBalance.period_end).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Account Code</TableHead>
                    <TableHead>Account Name</TableHead>
                    <TableHead className="w-[100px]">Type</TableHead>
                    <TableHead className="text-right w-[120px]">Debit</TableHead>
                    <TableHead className="text-right w-[120px]">Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trialBalance.accounts.map((account) => (
                    <TableRow key={account.account_code}>
                      <TableCell className="font-mono text-sm">
                        {account.account_code}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getAccountIcon(account.account_type)}
                          {account.account_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {account.account_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {account.is_debit_nature && account.net_balance > 0 
                          ? formatCurrency(account.net_balance) 
                          : '–'
                        }
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {!account.is_debit_nature && account.net_balance < 0 
                          ? formatCurrency(Math.abs(account.net_balance)) 
                          : '–'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                    <TableCell colSpan={3} className="text-right">
                      <strong>TOTALS</strong>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <strong>{formatCurrency(trialBalance.total_debits)}</strong>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <strong>{formatCurrency(trialBalance.total_credits)}</strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {trialBalance && trialBalance.accounts.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-600">
              <CalculatorIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No Transactions Found</h3>
              <p className="text-sm">
                No journal entries found for the selected period. 
                Process some orders or manually create journal entries to see the trial balance.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}