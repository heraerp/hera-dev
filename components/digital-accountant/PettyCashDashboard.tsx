'use client'

import React, { useState, useMemo } from 'react'
import { Wallet, Plus, Minus, TrendingUp, TrendingDown, AlertTriangle, Check, Clock, DollarSign, Receipt, User, Calendar } from 'lucide-react'
import ConfidenceIndicator from './ConfidenceIndicator'

interface CashTransaction {
  id: string
  type: 'expense' | 'replenishment' | 'advance'
  date: Date
  vendor: string
  description: string
  amount: number
  category: string
  submittedBy: string
  receiptImage?: string
  aiConfidence?: number
  status: 'pending' | 'approved' | 'rejected'
  location?: string
  inventoryItems?: Array<{
    item: string
    quantity: string
    unitPrice: number
  }>
}

interface PettyCashDashboardProps {
  className?: string
}

export default function PettyCashDashboard({ className = '' }: PettyCashDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null)

  // Mock data for demonstration
  const mockTransactions: CashTransaction[] = [
    {
      id: 'cash-001',
      type: 'expense',
      date: new Date('2024-01-20T08:30:00'),
      vendor: 'Fresh Fish Market',
      description: 'Daily fish purchase - Red Snapper, Salmon',
      amount: 145.80,
      category: 'Food & Beverage',
      submittedBy: 'Mario (Chef)',
      aiConfidence: 0.92,
      status: 'approved',
      location: 'Mushroom Kingdom Fish Market',
      inventoryItems: [
        { item: 'Red Snapper', quantity: '3 lbs', unitPrice: 28.50 },
        { item: 'Fresh Salmon', quantity: '2 lbs', unitPrice: 34.40 }
      ]
    },
    {
      id: 'cash-002',
      type: 'expense',
      date: new Date('2024-01-20T09:15:00'),
      vendor: 'Koopa Meat Co.',
      description: 'Premium beef for weekend special',
      amount: 89.45,
      category: 'Food & Beverage',
      submittedBy: 'Luigi (Sous Chef)',
      aiConfidence: 0.87,
      status: 'pending',
      location: 'Central Meat Market',
      inventoryItems: [
        { item: 'Prime Ribeye', quantity: '2.5 lbs', unitPrice: 35.78 }
      ]
    },
    {
      id: 'cash-003',
      type: 'expense',
      date: new Date('2024-01-19T16:45:00'),
      vendor: 'Yoshi Produce Farm',
      description: 'Organic vegetables and herbs',
      amount: 67.20,
      category: 'Food & Beverage',
      submittedBy: 'Peach (Kitchen Manager)',
      aiConfidence: 0.95,
      status: 'approved',
      location: 'Organic Farmers Market',
      inventoryItems: [
        { item: 'Organic Tomatoes', quantity: '5 lbs', unitPrice: 8.50 },
        { item: 'Fresh Basil', quantity: '2 bunches', unitPrice: 4.25 },
        { item: 'Baby Spinach', quantity: '3 bags', unitPrice: 6.75 }
      ]
    },
    {
      id: 'cash-004',
      type: 'replenishment',
      date: new Date('2024-01-19T10:00:00'),
      vendor: 'Bank Transfer',
      description: 'Petty cash replenishment',
      amount: 500.00,
      category: 'Cash Management',
      submittedBy: 'Toad (Accounting)',
      status: 'approved'
    },
    {
      id: 'cash-005',
      type: 'expense',
      date: new Date('2024-01-18T14:20:00'),
      vendor: 'Emergency Spice Co.',
      description: 'Urgent spice restock',
      amount: 34.75,
      category: 'Food & Beverage',
      submittedBy: 'Mario (Chef)',
      aiConfidence: 0.78,
      status: 'approved',
      location: 'Spice Market District'
    }
  ]

  // Calculate summary metrics
  const summary = useMemo(() => {
    const totalExpenses = mockTransactions
      .filter(t => t.type === 'expense' && t.status === 'approved')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalReplenishments = mockTransactions
      .filter(t => t.type === 'replenishment' && t.status === 'approved')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const pendingAmount = mockTransactions
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const currentBalance = totalReplenishments - totalExpenses
    
    return {
      currentBalance,
      totalExpenses,
      pendingAmount,
      transactionCount: mockTransactions.filter(t => t.type === 'expense').length,
      avgConfidence: mockTransactions
        .filter(t => t.aiConfidence)
        .reduce((sum, t) => sum + (t.aiConfidence || 0), 0) / 
        mockTransactions.filter(t => t.aiConfidence).length
    }
  }, [mockTransactions])

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'expense': return <Minus className="w-4 h-4" />
      case 'replenishment': return <Plus className="w-4 h-4" />
      default: return <DollarSign className="w-4 h-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <Check className="w-4 h-4 text-green-600" />
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />
      case 'rejected': return <AlertTriangle className="w-4 h-4 text-red-600" />
      default: return null
    }
  }

  const selectedTransactionData = selectedTransaction 
    ? mockTransactions.find(t => t.id === selectedTransaction)
    : null

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Wallet className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Petty Cash Management</h2>
          </div>
          
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Current Balance</p>
                <p className="text-2xl font-bold text-blue-900">
                  ${summary.currentBalance.toFixed(2)}
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-2">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-900">
                  ${summary.totalExpenses.toFixed(2)}
                </p>
              </div>
              <div className="bg-red-100 rounded-full p-2">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-900">
                  ${summary.pendingAmount.toFixed(2)}
                </p>
              </div>
              <div className="bg-yellow-100 rounded-full p-2">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">AI Confidence</p>
                <p className="text-2xl font-bold text-green-900">
                  {(summary.avgConfidence * 100).toFixed(0)}%
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Transaction List and Detail View */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transaction List */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {mockTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  onClick={() => setSelectedTransaction(transaction.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedTransaction === transaction.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div className={`p-1 rounded-full mr-2 ${
                          transaction.type === 'expense' ? 'bg-red-100' :
                          transaction.type === 'replenishment' ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <span className="font-medium text-gray-900">{transaction.vendor}</span>
                        {getStatusIcon(transaction.status)}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{transaction.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold ${
                          transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {transaction.type === 'expense' ? '-' : '+'}${transaction.amount.toFixed(2)}
                        </span>
                        
                        {transaction.aiConfidence && (
                          <ConfidenceIndicator 
                            confidence={transaction.aiConfidence} 
                            variant="badge" 
                          />
                        )}
                      </div>
                      
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <User className="w-3 h-3 mr-1" />
                        {transaction.submittedBy}
                        <Calendar className="w-3 h-3 ml-3 mr-1" />
                        {transaction.date.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction Detail */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction Details</h3>
            {selectedTransactionData ? (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">{selectedTransactionData.vendor}</h4>
                  <div className="flex items-center">
                    {getStatusIcon(selectedTransactionData.status)}
                    <span className="ml-2 text-sm capitalize">{selectedTransactionData.status}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Amount</label>
                    <p className={`text-lg font-semibold ${
                      selectedTransactionData.type === 'expense' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {selectedTransactionData.type === 'expense' ? '-' : '+'}${selectedTransactionData.amount.toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <p className="text-gray-900">{selectedTransactionData.description}</p>
                  </div>

                  {selectedTransactionData.location && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Location</label>
                      <p className="text-gray-900">{selectedTransactionData.location}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <p className="text-gray-900">{selectedTransactionData.category}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Submitted By</label>
                    <p className="text-gray-900">{selectedTransactionData.submittedBy}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Date & Time</label>
                    <p className="text-gray-900">
                      {selectedTransactionData.date.toLocaleDateString()} at {selectedTransactionData.date.toLocaleTimeString()}
                    </p>
                  </div>

                  {selectedTransactionData.aiConfidence && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">AI Confidence</label>
                      <div className="mt-1">
                        <ConfidenceIndicator 
                          confidence={selectedTransactionData.aiConfidence} 
                          variant="detailed" 
                        />
                      </div>
                    </div>
                  )}

                  {selectedTransactionData.inventoryItems && selectedTransactionData.inventoryItems.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Items Purchased</label>
                      <div className="mt-2 space-y-2">
                        {selectedTransactionData.inventoryItems.map((item, index) => (
                          <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                            <span className="text-sm">{item.item}</span>
                            <span className="text-sm text-gray-600">{item.quantity}</span>
                            <span className="text-sm font-medium">${item.unitPrice.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTransactionData.status === 'pending' && (
                    <div className="flex gap-2 mt-4">
                      <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm">
                        Approve
                      </button>
                      <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md text-sm">
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-8 text-center text-gray-500">
                <Receipt className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Select a transaction to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}