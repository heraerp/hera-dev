import { createClient } from '@/lib/supabase/client'

export interface Transaction {
  id: string
  transaction_number: string
  transaction_type: string
  transaction_subtype?: string
  total_amount: number
  currency: string
  posting_status: string
  posted_at?: string
  released_to_accounting: boolean
  released_at?: string
  released_by?: string
  created_at: string
  created_by?: string
  organization_id: string
  is_financial: boolean
  requires_approval: boolean
  mapped_accounts?: any
  transaction_data?: any
}

export interface AIIntelligence {
  id: string
  transaction_id: string
  confidence_score: number
  classification_data?: any
  created_at: string
  organization_id: string
}

export interface PostingStats {
  totalTransactions: number
  financialTransactions: number
  postedTransactions: number
  releasedTransactions: number
  pendingRelease: number
  autoReleasedToday: number
}

export interface AIMetrics {
  highConfidence: number // percentage
  mediumConfidence: number // percentage
  lowConfidence: number // percentage
  averageConfidence: number // 0-1 scale
  autoReleaseRate: number // percentage
}

export interface TransactionWithAI extends Transaction {
  ai_intelligence?: AIIntelligence
}

class DigitalAccountantService {
  private supabase = createClient()

  /**
   * Get posting statistics dashboard
   */
  async getPostingStats(organizationId: string): Promise<PostingStats> {
    try {
      // Get total transactions
      const { count: totalTransactions } = await this.supabase
        .from('universal_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)

      // Get financial transactions
      const { count: financialTransactions } = await this.supabase
        .from('universal_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('is_financial', true)

      // Get posted transactions
      const { count: postedTransactions } = await this.supabase
        .from('universal_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .in('posting_status', ['posted_pending_release', 'posted_and_released'])

      // Get released transactions
      const { count: releasedTransactions } = await this.supabase
        .from('universal_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('released_to_accounting', true)

      // Get pending release
      const { count: pendingRelease } = await this.supabase
        .from('universal_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('posting_status', 'posted_pending_release')

      // Get auto-released today
      const today = new Date().toISOString().split('T')[0]
      const { count: autoReleasedToday } = await this.supabase
        .from('universal_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('posting_status', 'posted_and_released')
        .gte('released_at', `${today}T00:00:00`)
        .lte('released_at', `${today}T23:59:59`)

      return {
        totalTransactions: totalTransactions || 0,
        financialTransactions: financialTransactions || 0,
        postedTransactions: postedTransactions || 0,
        releasedTransactions: releasedTransactions || 0,
        pendingRelease: pendingRelease || 0,
        autoReleasedToday: autoReleasedToday || 0
      }
    } catch (error) {
      console.error('Error fetching posting stats:', error)
      throw error
    }
  }

  /**
   * Get AI metrics for the organization
   */
  async getAIMetrics(organizationId: string): Promise<AIMetrics> {
    try {
      // Get all AI intelligence records for transactions
      const { data: aiData, error } = await this.supabase
        .from('ai_intelligence')
        .select('confidence_score')
        .eq('organization_id', organizationId)

      if (error) throw error

      if (!aiData || aiData.length === 0) {
        return {
          highConfidence: 0,
          mediumConfidence: 0,
          lowConfidence: 0,
          averageConfidence: 0,
          autoReleaseRate: 0
        }
      }

      const confidenceScores = aiData.map(record => record.confidence_score)
      const total = confidenceScores.length

      // Calculate confidence distribution
      const highConfidence = confidenceScores.filter(score => score >= 0.95).length
      const mediumConfidence = confidenceScores.filter(score => score >= 0.80 && score < 0.95).length
      const lowConfidence = confidenceScores.filter(score => score < 0.80).length

      // Calculate average confidence
      const averageConfidence = confidenceScores.reduce((sum, score) => sum + score, 0) / total

      // Get auto-release rate
      const { count: autoReleased } = await this.supabase
        .from('universal_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('posting_status', 'posted_and_released')

      const { count: totalPosted } = await this.supabase
        .from('universal_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .in('posting_status', ['posted_pending_release', 'posted_and_released'])

      const autoReleaseRate = totalPosted > 0 ? Math.round((autoReleased / totalPosted) * 100) : 0

      return {
        highConfidence: Math.round((highConfidence / total) * 100),
        mediumConfidence: Math.round((mediumConfidence / total) * 100),
        lowConfidence: Math.round((lowConfidence / total) * 100),
        averageConfidence,
        autoReleaseRate
      }
    } catch (error) {
      console.error('Error fetching AI metrics:', error)
      throw error
    }
  }

  /**
   * Get recent transactions with AI data
   */
  async getRecentTransactions(organizationId: string, limit: number = 10): Promise<TransactionWithAI[]> {
    try {
      const { data, error } = await this.supabase
        .from('universal_transactions')
        .select(`
          *,
          ai_intelligence (
            confidence_score,
            classification_data
          )
        `)
        .eq('organization_id', organizationId)
        .eq('is_financial', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching recent transactions:', error)
      throw error
    }
  }

  /**
   * Get transactions pending release
   */
  async getPendingReleaseTransactions(organizationId: string): Promise<TransactionWithAI[]> {
    try {
      const { data, error } = await this.supabase
        .from('universal_transactions')
        .select(`
          *,
          ai_intelligence (
            confidence_score,
            classification_data
          )
        `)
        .eq('organization_id', organizationId)
        .eq('posting_status', 'posted_pending_release')
        .order('created_at', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching pending release transactions:', error)
      throw error
    }
  }

  /**
   * Release a transaction to accounting
   */
  async releaseTransaction(
    transactionId: string, 
    organizationId: string, 
    userId: string,
    comment?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Call the database function for releasing transaction
      const { data, error } = await this.supabase
        .rpc('release_to_accounting', {
          p_transaction_id: transactionId,
          p_organization_id: organizationId,
          p_user_id: userId,
          p_comment: comment || null
        })

      if (error) throw error

      return {
        success: true,
        message: 'Transaction released to accounting successfully'
      }
    } catch (error) {
      console.error('Error releasing transaction:', error)
      return {
        success: false,
        message: `Failed to release transaction: ${error.message}`
      }
    }
  }

  /**
   * Get system status for dashboard
   */
  async getSystemStatus(organizationId: string): Promise<{
    autoPostingActive: boolean
    aiClassificationActive: boolean
    databaseConnected: boolean
    auditTrailRecording: boolean
    overallStatus: 'operational' | 'warning' | 'error'
  }> {
    try {
      // Check if recent transactions are being processed
      const { count: recentTransactions } = await this.supabase
        .from('universal_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

      // Check if AI intelligence is being recorded
      const { count: recentAI } = await this.supabase
        .from('ai_intelligence')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

      // Simulate system checks (in real implementation, these would be actual health checks)
      const autoPostingActive = true
      const aiClassificationActive = recentAI > 0
      const databaseConnected = true
      const auditTrailRecording = true

      const allSystemsOperational = autoPostingActive && aiClassificationActive && 
                                  databaseConnected && auditTrailRecording

      return {
        autoPostingActive,
        aiClassificationActive,
        databaseConnected,
        auditTrailRecording,
        overallStatus: allSystemsOperational ? 'operational' : 'warning'
      }
    } catch (error) {
      console.error('Error checking system status:', error)
      return {
        autoPostingActive: false,
        aiClassificationActive: false,
        databaseConnected: false,
        auditTrailRecording: false,
        overallStatus: 'error'
      }
    }
  }

  /**
   * Subscribe to real-time transaction updates
   */
  subscribeToTransactionUpdates(
    organizationId: string, 
    callback: (payload: any) => void
  ) {
    const channel = this.supabase
      .channel('transaction-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'universal_transactions',
          filter: `organization_id=eq.${organizationId}`
        },
        callback
      )
      .subscribe()

    return channel
  }

  /**
   * Force auto-post a transaction (for admin/testing)
   */
  async forceAutoPost(
    transactionId: string, 
    organizationId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await this.supabase
        .rpc('auto_post_transaction', {
          p_transaction_id: transactionId,
          p_organization_id: organizationId,
          p_force_post: true
        })

      if (error) throw error

      return {
        success: true,
        message: 'Transaction auto-posted successfully'
      }
    } catch (error) {
      console.error('Error force auto-posting transaction:', error)
      return {
        success: false,
        message: `Failed to auto-post transaction: ${error.message}`
      }
    }
  }
}

export const digitalAccountantService = new DigitalAccountantService()
export default digitalAccountantService