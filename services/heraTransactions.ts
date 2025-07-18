import { createClient } from '@supabase/supabase-js'
import type {
  UniversalTransaction,
  UniversalTransactionLine,
  TransactionFilters,
  TransactionSearchResult,
  TransactionStats,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  APIResponse,
  TransactionSubscriptionPayload,
  TransactionType,
  TransactionStatus,
  AIAnalysisResult
} from '@/types/transactions'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Please check your .env.local file.')
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '')

export class HeraTransactionService {
  /**
   * Get transactions with filtering, pagination, and search
   */
  static async getTransactions(
    filters: TransactionFilters
  ): Promise<TransactionSearchResult> {
    try {
      // Check if Supabase is properly configured
      if (!supabaseUrl || !supabaseKey) {
        console.warn('Supabase not configured, using mock data')
        return this.getMockTransactions(filters)
      }

      let query = supabase
        .from('universal_transactions')
        .select(`
          *,
          universal_transaction_lines!inner(*)
        `)

      // Apply organization filter (required for multi-tenancy)
      if (filters.organization_id) {
        query = query.eq('organization_id', filters.organization_id)
      }

      // Apply transaction type filter
      if (filters.transaction_type && filters.transaction_type.length > 0) {
        query = query.in('transaction_type', filters.transaction_type)
      }

      // Apply status filter
      if (filters.transaction_status && filters.transaction_status.length > 0) {
        query = query.in('workflow_status', filters.transaction_status)
      }

      // Apply date filters
      if (filters.date_from) {
        query = query.gte('business_date', filters.date_from)
      }
      if (filters.date_to) {
        query = query.lte('business_date', filters.date_to)
      }

      // Apply search query
      if (filters.search_query) {
        query = query.or(`
          transaction_number.ilike.%${filters.search_query}%,
          transaction_data->>'description'.ilike.%${filters.search_query}%,
          transaction_data->>'reference'.ilike.%${filters.search_query}%
        `)
      }

      // Apply AI generated filter
      if (filters.ai_generated !== undefined) {
        query = query.eq('ai_generated', filters.ai_generated)
      }

      // Apply fraud risk filters
      if (filters.fraud_risk_min !== undefined) {
        query = query.gte('fraud_risk_score', filters.fraud_risk_min)
      }
      if (filters.fraud_risk_max !== undefined) {
        query = query.lte('fraud_risk_score', filters.fraud_risk_max)
      }

      // Apply department filter
      if (filters.department) {
        query = query.eq('department', filters.department)
      }

      // Apply cost center filter
      if (filters.cost_center) {
        query = query.eq('cost_center', filters.cost_center)
      }

      // Apply project code filter
      if (filters.project_code) {
        query = query.eq('project_code', filters.project_code)
      }

      // Apply tags filter
      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags)
      }

      // Apply sorting
      const sortBy = filters.sort_by || 'created_at'
      const sortOrder = filters.sort_order || 'desc'
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // Apply pagination
      const page = filters.page || 1
      const limit = filters.limit || 20
      const offset = (page - 1) * limit

      // Get total count for pagination
      const { count } = await supabase
        .from('universal_transactions')
        .select('*', { count: 'exact', head: true })
        .match({ organization_id: filters.organization_id })

      // Apply pagination to main query
      query = query.range(offset, offset + limit - 1)

      const { data, error } = await query

      if (error) {
        throw error
      }

      return {
        transactions: data || [],
        total_count: count || 0,
        page,
        limit,
        has_more: (count || 0) > offset + limit
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      throw new Error(`Failed to fetch transactions: ${error.message}`)
    }
  }

  /**
   * Get a single transaction by ID
   */
  static async getTransaction(
    id: string,
    organizationId: string
  ): Promise<UniversalTransaction | null> {
    try {
      const { data, error } = await supabase
        .from('universal_transactions')
        .select(`
          *,
          universal_transaction_lines(*)
        `)
        .eq('id', id)
        .eq('organization_id', organizationId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Not found
        }
        throw error
      }

      return data
    } catch (error) {
      console.error('Error fetching transaction:', error)
      throw new Error(`Failed to fetch transaction: ${error.message}`)
    }
  }

  /**
   * Create a new transaction with auto-generated transaction number
   */
  static async createTransaction(
    request: CreateTransactionRequest
  ): Promise<UniversalTransaction> {
    try {
      // Generate transaction number
      const transactionNumber = await this.generateTransactionNumber(
        request.organization_id,
        request.transaction_type
      )

      // Prepare transaction data
      const transactionData: Partial<UniversalTransaction> = {
        organization_id: request.organization_id,
        transaction_type: request.transaction_type,
        transaction_subtype: request.transaction_subtype,
        transaction_number: transactionNumber,
        business_date: request.business_date,
        transaction_data: request.transaction_data,
        workflow_status: 'DRAFT',
        ai_generated: false,
        fraud_risk_score: 0,
        data_quality_score: 100,
        security_classification: 'INTERNAL',
        tags: request.tags || [],
        priority_level: request.priority_level || 'NORMAL',
        department: request.department,
        cost_center: request.cost_center,
        project_code: request.project_code,
        audit_trail: {
          created_at: new Date().toISOString(),
          created_by: 'current_user', // TODO: Get from auth context
          actions: [
            {
              action: 'CREATED',
              timestamp: new Date().toISOString(),
              user: 'current_user',
              notes: 'Transaction created'
            }
          ]
        }
      }

      // Insert transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('universal_transactions')
        .insert(transactionData)
        .select()
        .single()

      if (transactionError) {
        throw transactionError
      }

      // Insert transaction lines if provided
      if (request.lines && request.lines.length > 0) {
        const lines = request.lines.map((line, index) => ({
          ...line,
          transaction_id: transaction.id,
          organization_id: request.organization_id,
          line_number: index + 1
        }))

        const { error: linesError } = await supabase
          .from('universal_transaction_lines')
          .insert(lines)

        if (linesError) {
          // Rollback transaction if lines insertion fails
          await supabase
            .from('universal_transactions')
            .delete()
            .eq('id', transaction.id)
          throw linesError
        }
      }

      return transaction
    } catch (error) {
      console.error('Error creating transaction:', error)
      throw new Error(`Failed to create transaction: ${error.message}`)
    }
  }

  /**
   * Update transaction status and workflow
   */
  static async updateTransactionStatus(
    id: string,
    organizationId: string,
    status: TransactionStatus,
    notes?: string
  ): Promise<UniversalTransaction> {
    try {
      // Get current transaction for audit trail
      const current = await this.getTransaction(id, organizationId)
      if (!current) {
        throw new Error('Transaction not found')
      }

      // Update audit trail
      const updatedAuditTrail = {
        ...current.audit_trail,
        actions: [
          ...(current.audit_trail?.actions || []),
          {
            action: 'STATUS_CHANGED',
            timestamp: new Date().toISOString(),
            user: 'current_user', // TODO: Get from auth context
            from_status: current.workflow_status,
            to_status: status,
            notes: notes || `Status changed from ${current.workflow_status} to ${status}`
          }
        ]
      }

      const { data, error } = await supabase
        .from('universal_transactions')
        .update({
          workflow_status: status,
          audit_trail: updatedAuditTrail,
          updated_at: new Date().toISOString(),
          updated_by: 'current_user' // TODO: Get from auth context
        })
        .eq('id', id)
        .eq('organization_id', organizationId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Error updating transaction status:', error)
      throw new Error(`Failed to update transaction status: ${error.message}`)
    }
  }

  /**
   * Update transaction data
   */
  static async updateTransaction(
    id: string,
    organizationId: string,
    updates: UpdateTransactionRequest
  ): Promise<UniversalTransaction> {
    try {
      const { data, error } = await supabase
        .from('universal_transactions')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          updated_by: 'current_user' // TODO: Get from auth context
        })
        .eq('id', id)
        .eq('organization_id', organizationId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Error updating transaction:', error)
      throw new Error(`Failed to update transaction: ${error.message}`)
    }
  }

  /**
   * Delete transaction (soft delete by changing status)
   */
  static async deleteTransaction(
    id: string,
    organizationId: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('universal_transactions')
        .update({
          workflow_status: 'CANCELLED',
          updated_at: new Date().toISOString(),
          updated_by: 'current_user' // TODO: Get from auth context
        })
        .eq('id', id)
        .eq('organization_id', organizationId)

      if (error) {
        throw error
      }

      return true
    } catch (error) {
      console.error('Error deleting transaction:', error)
      throw new Error(`Failed to delete transaction: ${error.message}`)
    }
  }

  /**
   * Get transaction statistics for dashboard
   */
  static async getTransactionStats(
    organizationId: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<TransactionStats> {
    try {
      // Check if Supabase is properly configured
      if (!supabaseUrl || !supabaseKey) {
        console.warn('Supabase not configured, using mock stats')
        return this.getMockStats()
      }

      // Build date filter
      let dateFilter = ''
      if (dateFrom && dateTo) {
        dateFilter = `AND business_date BETWEEN '${dateFrom}' AND '${dateTo}'`
      }

      // Get aggregate statistics using RPC or raw query
      const { data: stats, error } = await supabase.rpc('get_transaction_stats', {
        org_id: organizationId,
        date_from: dateFrom,
        date_to: dateTo
      })

      if (error) {
        // Fallback to manual aggregation if RPC doesn't exist
        console.warn('RPC not available, using manual aggregation')
        return await this.getManualTransactionStats(organizationId, dateFrom, dateTo)
      }

      return stats
    } catch (error) {
      console.error('Error fetching transaction stats:', error)
      // Fallback to mock stats
      return this.getMockStats()
    }
  }

  /**
   * Manual transaction statistics calculation (fallback)
   */
  private static async getManualTransactionStats(
    organizationId: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<TransactionStats> {
    try {
      let query = supabase
        .from('universal_transactions')
        .select('*')
        .eq('organization_id', organizationId)

      if (dateFrom) {
        query = query.gte('business_date', dateFrom)
      }
      if (dateTo) {
        query = query.lte('business_date', dateTo)
      }

      const { data: transactions, error } = await query

      if (error) {
        throw error
      }

      // Calculate stats manually
      const total = transactions?.length || 0
      const pending = transactions?.filter(t => t.workflow_status === 'PENDING').length || 0
      const approved = transactions?.filter(t => t.workflow_status === 'APPROVED').length || 0
      const posted = transactions?.filter(t => t.workflow_status === 'POSTED').length || 0
      const rejected = transactions?.filter(t => t.workflow_status === 'REJECTED').length || 0
      const aiGenerated = transactions?.filter(t => t.ai_generated).length || 0
      const fraudFlagged = transactions?.filter(t => (t.fraud_risk_score || 0) > 0.7).length || 0

      return {
        total_transactions: total,
        pending_transactions: pending,
        approved_transactions: approved,
        posted_transactions: posted,
        rejected_transactions: rejected,
        total_amount: 0, // TODO: Calculate from transaction_data
        ai_generated_percentage: total > 0 ? (aiGenerated / total) * 100 : 0,
        average_processing_time: 0, // TODO: Calculate from audit_trail
        fraud_flagged_count: fraudFlagged,
        data_quality_average: 95, // TODO: Calculate from data_quality_score
        trends: [], // TODO: Implement trend calculation
        by_type: [], // TODO: Group by transaction_type
        by_status: [
          { status: 'PENDING', count: pending, percentage: total > 0 ? (pending / total) * 100 : 0 },
          { status: 'APPROVED', count: approved, percentage: total > 0 ? (approved / total) * 100 : 0 },
          { status: 'POSTED', count: posted, percentage: total > 0 ? (posted / total) * 100 : 0 },
          { status: 'REJECTED', count: rejected, percentage: total > 0 ? (rejected / total) * 100 : 0 }
        ]
      }
    } catch (error) {
      console.error('Error calculating manual stats:', error)
      // Return empty stats if everything fails
      return {
        total_transactions: 0,
        pending_transactions: 0,
        approved_transactions: 0,
        posted_transactions: 0,
        rejected_transactions: 0,
        total_amount: 0,
        ai_generated_percentage: 0,
        average_processing_time: 0,
        fraud_flagged_count: 0,
        data_quality_average: 0,
        trends: [],
        by_type: [],
        by_status: []
      }
    }
  }

  /**
   * Generate unique transaction number
   */
  static async generateTransactionNumber(
    organizationId: string,
    transactionType: TransactionType
  ): Promise<string> {
    try {
      const year = new Date().getFullYear()
      const typePrefix = this.getTypePrefix(transactionType)
      
      // Get organization prefix (first 3 letters of org name or default)
      const { data: org } = await supabase
        .from('core_organizations')
        .select('name')
        .eq('id', organizationId)
        .single()

      const orgPrefix = org?.name?.substring(0, 3).toUpperCase() || 'ORG'

      // Get next sequence number for this org/type/year
      const { data: lastTransaction } = await supabase
        .from('universal_transactions')
        .select('transaction_number')
        .eq('organization_id', organizationId)
        .eq('transaction_type', transactionType)
        .like('transaction_number', `${orgPrefix}-${typePrefix}-${year}-%`)
        .order('transaction_number', { ascending: false })
        .limit(1)
        .single()

      let sequence = 1
      if (lastTransaction?.transaction_number) {
        const lastSequence = parseInt(
          lastTransaction.transaction_number.split('-').pop() || '0'
        )
        sequence = lastSequence + 1
      }

      return `${orgPrefix}-${typePrefix}-${year}-${sequence.toString().padStart(4, '0')}`
    } catch (error) {
      console.error('Error generating transaction number:', error)
      // Fallback to timestamp-based number
      return `TXN-${Date.now()}`
    }
  }

  /**
   * Get transaction type prefix for numbering
   */
  private static getTypePrefix(type: TransactionType): string {
    const prefixes: Record<TransactionType, string> = {
      journal_entry: 'JE',
      sales: 'SAL',
      purchase: 'PUR',
      payment: 'PAY',
      master_data: 'MDT',
      inventory: 'INV',
      payroll: 'PAY',
      reconciliation: 'REC'
    }
    return prefixes[type] || 'TXN'
  }

  /**
   * Subscribe to real-time transaction updates
   */
  static subscribeToTransactions(
    organizationId: string,
    callback: (payload: TransactionSubscriptionPayload) => void
  ) {
    return supabase
      .channel('transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'universal_transactions',
          filter: `organization_id=eq.${organizationId}`
        },
        (payload) => {
          callback({
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new as UniversalTransaction,
            old: payload.old as UniversalTransaction
          })
        }
      )
      .subscribe()
  }

  /**
   * Bulk update transaction statuses
   */
  static async bulkUpdateStatus(
    transactionIds: string[],
    organizationId: string,
    status: TransactionStatus,
    notes?: string
  ): Promise<UniversalTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('universal_transactions')
        .update({
          workflow_status: status,
          updated_at: new Date().toISOString(),
          updated_by: 'current_user' // TODO: Get from auth context
        })
        .in('id', transactionIds)
        .eq('organization_id', organizationId)
        .select()

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error bulk updating transactions:', error)
      throw new Error(`Failed to bulk update transactions: ${error.message}`)
    }
  }

  /**
   * Export transactions to CSV format
   */
  static async exportTransactions(
    filters: TransactionFilters,
    format: 'csv' | 'json' = 'csv'
  ): Promise<string> {
    try {
      const result = await this.getTransactions({
        ...filters,
        limit: 10000 // Large limit for export
      })

      if (format === 'json') {
        return JSON.stringify(result.transactions, null, 2)
      }

      // CSV format
      const headers = [
        'Transaction Number',
        'Type',
        'Status',
        'Business Date',
        'Amount',
        'Description',
        'Department',
        'AI Generated',
        'Fraud Risk Score'
      ]

      const rows = result.transactions.map(t => [
        t.transaction_number,
        t.transaction_type,
        t.workflow_status,
        t.business_date,
        t.transaction_data?.amount || '',
        t.transaction_data?.description || '',
        t.department || '',
        t.ai_generated ? 'Yes' : 'No',
        t.fraud_risk_score || ''
      ])

      return [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')
    } catch (error) {
      console.error('Error exporting transactions:', error)
      throw new Error(`Failed to export transactions: ${error.message}`)
    }
  }

  /**
   * Get AI analysis for a transaction
   */
  static async getAIAnalysis(
    transactionId: string,
    organizationId: string
  ): Promise<AIAnalysisResult | null> {
    try {
      const transaction = await this.getTransaction(transactionId, organizationId)
      
      if (!transaction) {
        return null
      }

      // Return structured AI analysis from existing fields
      return {
        confidence_score: transaction.ai_confidence_score || 0,
        classification: transaction.ai_classification || {},
        decision_trail: transaction.ai_decision_trail?.trail || [],
        explainability: transaction.ai_explainability_report || {
          factors: [],
          reasoning: 'No AI analysis available',
          confidence_breakdown: {}
        },
        fraud_assessment: {
          risk_score: transaction.fraud_risk_score || 0,
          indicators: transaction.fraud_indicators?.indicators || [],
          recommendation: transaction.fraud_validation_status || 'CLEAN'
        },
        data_quality: {
          score: transaction.data_quality_score || 100,
          issues: transaction.data_quality_issues?.issues || [],
          suggestions: transaction.data_quality_remediation?.suggestions || []
        }
      }
    } catch (error) {
      console.error('Error getting AI analysis:', error)
      return null
    }
  }

  /**
   * Get mock transactions for demo purposes
   */
  private static async getMockTransactions(filters: TransactionFilters): Promise<TransactionSearchResult> {
    // Mock transactions data
    const mockTransactions: UniversalTransaction[] = [
      {
        id: 'mock-txn-1',
        organization_id: filters.organization_id || 'demo-org-1',
        transaction_type: 'sales',
        transaction_number: 'SAL-2024-0001',
        business_date: '2024-01-15',
        transaction_data: {
          description: 'Sale to Coffee Corner Cafe',
          amount: 1250.00,
          reference: 'INV-2024-001'
        },
        workflow_status: 'POSTED',
        ai_generated: false,
        fraud_risk_score: 0.1,
        data_quality_score: 95,
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z',
        created_by: 'demo-user',
        department: 'Sales',
        tags: ['revenue', 'customer-payment']
      },
      {
        id: 'mock-txn-2',
        organization_id: filters.organization_id || 'demo-org-1',
        transaction_type: 'purchase',
        transaction_number: 'PUR-2024-0001',
        business_date: '2024-01-14',
        transaction_data: {
          description: 'Office supplies purchase',
          amount: 450.75,
          reference: 'PO-2024-001'
        },
        workflow_status: 'APPROVED',
        ai_generated: true,
        ai_confidence_score: 0.85,
        fraud_risk_score: 0.05,
        data_quality_score: 98,
        created_at: '2024-01-14T14:15:00Z',
        updated_at: '2024-01-14T14:15:00Z',
        created_by: 'ai-system',
        department: 'Administration',
        tags: ['supplies', 'office']
      },
      {
        id: 'mock-txn-3',
        organization_id: filters.organization_id || 'demo-org-1',
        transaction_type: 'journal_entry',
        transaction_number: 'JE-2024-0001',
        business_date: '2024-01-13',
        transaction_data: {
          description: 'Monthly depreciation adjustment',
          amount: 2500.00,
          reference: 'ADJ-2024-001'
        },
        workflow_status: 'PENDING',
        ai_generated: true,
        ai_confidence_score: 0.92,
        fraud_risk_score: 0.02,
        data_quality_score: 100,
        created_at: '2024-01-13T09:00:00Z',
        updated_at: '2024-01-13T09:00:00Z',
        created_by: 'ai-system',
        department: 'Accounting',
        tags: ['adjustment', 'depreciation', 'monthly']
      },
      {
        id: 'mock-txn-4',
        organization_id: filters.organization_id || 'demo-org-1',
        transaction_type: 'payment',
        transaction_number: 'PAY-2024-0001',
        business_date: '2024-01-12',
        transaction_data: {
          description: 'Vendor payment - Tech Solutions Inc',
          amount: 3200.00,
          reference: 'PAYMENT-001'
        },
        workflow_status: 'POSTED',
        ai_generated: false,
        fraud_risk_score: 0.65,
        data_quality_score: 88,
        created_at: '2024-01-12T16:45:00Z',
        updated_at: '2024-01-12T16:45:00Z',
        created_by: 'demo-user',
        department: 'Finance',
        tags: ['vendor-payment', 'tech-services'],
        fraud_validation_status: 'FLAGGED'
      }
    ]

    // Apply basic filtering
    let filteredTransactions = mockTransactions
    
    if (filters.search_query) {
      const query = filters.search_query.toLowerCase()
      filteredTransactions = filteredTransactions.filter(t => 
        t.transaction_number.toLowerCase().includes(query) ||
        t.transaction_data?.description?.toLowerCase().includes(query) ||
        t.transaction_data?.reference?.toLowerCase().includes(query)
      )
    }

    if (filters.transaction_type?.length) {
      filteredTransactions = filteredTransactions.filter(t => 
        filters.transaction_type!.includes(t.transaction_type)
      )
    }

    if (filters.transaction_status?.length) {
      filteredTransactions = filteredTransactions.filter(t => 
        filters.transaction_status!.includes(t.workflow_status!)
      )
    }

    // Apply pagination
    const page = filters.page || 1
    const limit = filters.limit || 20
    const offset = (page - 1) * limit
    const paginatedTransactions = filteredTransactions.slice(offset, offset + limit)

    return {
      transactions: paginatedTransactions,
      total_count: filteredTransactions.length,
      page,
      limit,
      has_more: filteredTransactions.length > offset + limit
    }
  }

  /**
   * Get mock transaction statistics
   */
  static async getMockStats(): Promise<TransactionStats> {
    return {
      total_transactions: 47,
      pending_transactions: 12,
      approved_transactions: 8,
      posted_transactions: 25,
      rejected_transactions: 2,
      total_amount: 125750.50,
      ai_generated_percentage: 65.2,
      average_processing_time: 2.4,
      fraud_flagged_count: 3,
      data_quality_average: 94.2,
      trends: [
        { period: '2024-01', transaction_count: 47, total_amount: 125750.50, growth_rate: 12.5 },
        { period: '2023-12', transaction_count: 42, total_amount: 112300.25, growth_rate: 8.2 },
        { period: '2023-11', transaction_count: 39, total_amount: 103850.75, growth_rate: 15.1 }
      ],
      by_type: [
        { type: 'sales', count: 18, amount: 65200.00, percentage: 38.3 },
        { type: 'purchase', count: 15, amount: 32750.50, percentage: 31.9 },
        { type: 'journal_entry', count: 8, amount: 15300.00, percentage: 17.0 },
        { type: 'payment', count: 6, amount: 12500.00, percentage: 12.8 }
      ],
      by_status: [
        { status: 'POSTED', count: 25, percentage: 53.2 },
        { status: 'PENDING', count: 12, percentage: 25.5 },
        { status: 'APPROVED', count: 8, percentage: 17.0 },
        { status: 'REJECTED', count: 2, percentage: 4.3 }
      ]
    }
  }
}