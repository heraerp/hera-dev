'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalculatorIcon, FileText, TrendingUp } from 'lucide-react'
import TrialBalance from '@/components/accounting/TrialBalance'
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement'

export default function TestTrialBalancePage() {
  const { restaurantData } = useRestaurantManagement()

  if (!restaurantData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-6 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalculatorIcon className="h-5 w-5" />
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg">
                <CalculatorIcon className="h-8 w-8 text-white" />
              </div>
              Trial Balance Report
            </h1>
            <p className="text-gray-600">
              Complete trial balance for {restaurantData.restaurantName} • Verify your books are balanced
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-300">
              <TrendingUp className="w-3 h-3 mr-1" />
              Live Data
            </Badge>
            <Button 
              onClick={() => window.open('/test-journal-viewer', '_blank')}
              variant="outline"
            >
              <FileText className="w-4 h-4 mr-2" />
              View Journal Entries
            </Button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">What is a Trial Balance?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                A trial balance is a bookkeeping report that lists all accounts and their balances 
                to ensure that debits equal credits in your accounting system.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Account Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Assets (1xxx)</span>
                  <span className="text-blue-600">Debit</span>
                </div>
                <div className="flex justify-between">
                  <span>Liabilities (2xxx)</span>
                  <span className="text-red-600">Credit</span>
                </div>
                <div className="flex justify-between">
                  <span>Revenue (4xxx)</span>
                  <span className="text-green-600">Credit</span>
                </div>
                <div className="flex justify-between">
                  <span>Expenses (5xxx)</span>
                  <span className="text-orange-600">Debit</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Balance Check</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                If total debits don't equal total credits, there may be an error in your 
                journal entries that needs to be corrected.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Trial Balance Component */}
        <TrialBalance organizationId={restaurantData.organizationId} />

        {/* Footer Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-gray-600">
              <p className="mb-2">
                <strong>Note:</strong> This trial balance is generated from journal entries created by the POS integration and manual journal entries.
              </p>
              <p>
                To create more data, process orders through the POS system or manually create journal entries.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}