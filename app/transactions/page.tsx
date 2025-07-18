"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Building2,
  ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/revolutionary-button"
import { Card } from "@/components/ui/revolutionary-card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "@/components/providers/theme-provider"
import { useHeraOrganization } from "@/hooks/useHeraOrganization"
import { HeraTransactionService } from "@/services/heraTransactions"
import { TransactionCard } from "@/components/transactions/TransactionCard"
import { TransactionStats } from "@/components/transactions/TransactionStats"
import { TransactionFilters } from "@/components/transactions/TransactionFilters"
import { CreateTransactionModal } from "@/components/transactions/CreateTransactionModal"
import { AIInsightPanel } from "@/components/transactions/AIInsightPanel"
import type { 
  UniversalTransaction, 
  TransactionFilters as Filters, 
  TransactionSearchResult,
  TransactionStats as Stats,
  TransactionType,
  TransactionStatus
} from "@/types/transactions"
import motionConfig from "@/lib/motion"

export default function TransactionsPage() {
  const { setContext } = useTheme()
  const { 
    currentOrganization, 
    organizations, 
    switchOrganization, 
    canCreate, 
    canEdit, 
    canExport,
    loading: orgLoading,
    error: orgError 
  } = useHeraOrganization()

  // State management
  const [transactions, setTransactions] = useState<UniversalTransaction[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<UniversalTransaction | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    limit: 20,
    sort_by: 'created_at',
    sort_order: 'desc'
  })

  // Set theme context
  useEffect(() => {
    setContext("analytical")
  }, [setContext])

  // Update filters with organization
  useEffect(() => {
    if (currentOrganization?.id) {
      setFilters(prev => ({
        ...prev,
        organization_id: currentOrganization.id,
        page: 1
      }))
    }
  }, [currentOrganization?.id])

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    if (!filters.organization_id) return

    try {
      setLoading(true)
      setError(null)

      const result: TransactionSearchResult = await HeraTransactionService.getTransactions({
        ...filters,
        page
      })
      
      if (page === 1) {
        setTransactions(result.transactions)
      } else {
        setTransactions(prev => [...prev, ...result.transactions])
      }
      
      setTotalCount(result.total_count)
      setHasMore(result.has_more)

    } catch (err) {
      console.error('Error fetching transactions:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  // Fetch transaction statistics
  const fetchStats = useCallback(async () => {
    if (!currentOrganization?.id) return

    try {
      const statsResult = await HeraTransactionService.getTransactionStats(currentOrganization.id)
      setStats(statsResult)
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }, [currentOrganization?.id])

  // Setup real-time subscriptions
  useEffect(() => {
    if (!currentOrganization?.id) return

    const subscription = HeraTransactionService.subscribeToTransactions(
      currentOrganization.id,
      (payload) => {
        setIsRealTimeConnected(true)
        
        if (payload.eventType === 'INSERT' && payload.new) {
          setTransactions(prev => [payload.new!, ...prev])
          setTotalCount(prev => prev + 1)
        } else if (payload.eventType === 'UPDATE' && payload.new) {
          setTransactions(prev => 
            prev.map(t => t.id === payload.new!.id ? payload.new! : t)
          )
        } else if (payload.eventType === 'DELETE' && payload.old) {
          setTransactions(prev => 
            prev.filter(t => t.id !== payload.old!.id)
          )
          setTotalCount(prev => prev - 1)
        }

        // Refresh stats when transactions change
        fetchStats()
      }
    )

    return () => {
      subscription.unsubscribe()
      setIsRealTimeConnected(false)
    }
  }, [currentOrganization?.id, fetchStats])

  // Initial data fetch
  useEffect(() => {
    if (currentOrganization?.id) {
      fetchTransactions()
      fetchStats()
    }
  }, [currentOrganization?.id, fetchTransactions, fetchStats])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [filters.search_query, filters.transaction_type, filters.transaction_status])

  // Load more transactions
  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1)
    }
  }

  // Export transactions
  const handleExport = async () => {
    if (!canExport || !filters.organization_id) return

    try {
      const csvData = await HeraTransactionService.exportTransactions(filters, 'csv')
      const blob = new Blob([csvData], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transactions-${currentOrganization?.name}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export error:', err)
    }
  }

  // Handle filter changes
  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters)
    setPage(1)
  }

  // Clear filters
  const handleClearFilters = () => {
    setFilters({
      organization_id: currentOrganization?.id,
      page: 1,
      limit: 20,
      sort_by: 'created_at',
      sort_order: 'desc'
    })
    setPage(1)
  }

  // Handle transaction actions
  const handleViewTransaction = (transaction: UniversalTransaction) => {
    setSelectedTransaction(transaction)
  }

  const handleEditTransaction = (transaction: UniversalTransaction) => {
    // TODO: Implement edit functionality
    console.log('Edit transaction:', transaction.id)
  }

  const handleDeleteTransaction = async (transaction: UniversalTransaction) => {
    try {
      await HeraTransactionService.deleteTransaction(transaction.id, transaction.organization_id)
      fetchTransactions() // Refresh the list
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  const handleApproveTransaction = async (transaction: UniversalTransaction) => {
    try {
      await HeraTransactionService.updateTransactionStatus(transaction.id, transaction.organization_id, 'APPROVED')
      fetchTransactions() // Refresh the list
    } catch (err) {
      console.error('Approve error:', err)
    }
  }

  const handleRejectTransaction = async (transaction: UniversalTransaction) => {
    try {
      await HeraTransactionService.updateTransactionStatus(transaction.id, transaction.organization_id, 'REJECTED')
      fetchTransactions() // Refresh the list
    } catch (err) {
      console.error('Reject error:', err)
    }
  }

  const handleTransactionCreated = (transaction: UniversalTransaction) => {
    setTransactions(prev => [transaction, ...prev])
    setTotalCount(prev => prev + 1)
    fetchStats() // Refresh stats
  }

  if (orgLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading organizations...</p>
        </div>
      </div>
    )
  }

  if (orgError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-destructive" />
            <h2 className="text-lg font-semibold mb-2">Organization Error</h2>
            <p className="text-muted-foreground mb-4">{orgError}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!currentOrganization) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <div className="text-center">
            <Building2 className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold mb-2">No Organization Selected</h2>
            <p className="text-muted-foreground">Please select an organization to view transactions.</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionConfig.spring.smooth}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Universal Transactions
              </h1>
              <p className="text-muted-foreground">
                Manage all transaction types for {currentOrganization.name}
                {isRealTimeConnected && (
                  <span className="ml-2 inline-flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-xs">Live</span>
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Organization Selector */}
              {organizations.length > 1 && (
                <select
                  value={currentOrganization.id}
                  onChange={(e) => switchOrganization(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg bg-background"
                >
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              )}

              {canExport && (
                <Button
                  variant="outline"
                  onClick={handleExport}
                  leftIcon={<Download className="w-4 h-4" />}
                >
                  Export
                </Button>
              )}

              {canCreate && (
                <Button
                  variant="default"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setShowCreateModal(true)}
                >
                  Create Transaction
                </Button>
              )}
            </div>
          </div>

          {/* Statistics Dashboard */}
          {stats && (
            <TransactionStats 
              stats={stats} 
              loading={loading}
              className="mb-6"
              variant="compact"
            />
          )}

          {/* Filters */}
          <TransactionFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            className="mb-6"
            compact={true}
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Transaction List */}
          <div className="lg:col-span-3">
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {error && (
                <Card className="p-4 border-destructive/20 bg-destructive/5">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    <p className="text-destructive">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchTransactions()}
                    >
                      Retry
                    </Button>
                  </div>
                </Card>
              )}

              {transactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TransactionCard
                    transaction={transaction}
                    permissions={{
                      can_view: true,
                      can_create: canCreate,
                      can_edit: canEdit,
                      can_approve: canApprove,
                      can_delete: canAdmin,
                      can_admin: canAdmin,
                      can_export: canExport,
                      can_override_controls: canOverrideControls,
                      allowed_transaction_types: []
                    }}
                    onView={handleViewTransaction}
                    onEdit={handleEditTransaction}
                    onDelete={handleDeleteTransaction}
                    onApprove={handleApproveTransaction}
                    onReject={handleRejectTransaction}
                  />
                </motion.div>
              ))}

              {loading && (
                <div className="text-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Loading transactions...</p>
                </div>
              )}

              {hasMore && !loading && (
                <div className="text-center py-4">
                  <Button variant="outline" onClick={loadMore}>
                    Load More
                  </Button>
                </div>
              )}

              {!loading && transactions.length === 0 && (
                <Card className="p-8 text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
                  <p className="text-muted-foreground mb-4">
                    {filters.search_query || filters.transaction_type?.length || filters.transaction_status?.length
                      ? "Try adjusting your search or filters"
                      : "Create your first transaction to get started"
                    }
                  </p>
                  {canCreate && (
                    <Button variant="default" onClick={() => setShowCreateModal(true)}>
                      Create Transaction
                    </Button>
                  )}
                </Card>
              )}
            </motion.div>
          </div>

          {/* AI Insights Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <AIInsightPanel
                transaction={selectedTransaction || undefined}
                organizationId={currentOrganization?.id}
                variant="default"
              />
            </div>
          </div>
        </div>

        {/* Create Transaction Modal */}
        <CreateTransactionModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onTransactionCreated={handleTransactionCreated}
        />
      </div>
    </div>
  )
}