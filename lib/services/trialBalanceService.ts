import { createClient } from '@/lib/supabase/client'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export interface AccountBalance {
  account_code: string
  account_name: string
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  debit_balance: number
  credit_balance: number
  net_balance: number
  is_debit_nature: boolean
}

export interface TrialBalanceData {
  accounts: AccountBalance[]
  total_debits: number
  total_credits: number
  is_balanced: boolean
  as_of_date: string
  organization_id: string
  period_start: string
  period_end: string
}

export interface TrialBalanceResult {
  success: boolean
  data?: TrialBalanceData
  message: string
  error?: string
}

export class TrialBalanceService {
  private supabase = createClient()
  private supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!}`
        }
      }
    }
  )

  /**
   * Generate trial balance for an organization
   */
  async generateTrialBalance(
    organizationId: string,
    asOfDate?: string,
    periodStart?: string,
    periodEnd?: string
  ): Promise<TrialBalanceResult> {
    try {
      console.log('🧮 Generating trial balance for organization:', organizationId)

      const endDate = asOfDate || new Date().toISOString().split('T')[0]
      const startDate = periodStart || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]
      const finalEndDate = periodEnd || endDate

      console.log('📅 Period:', startDate, 'to', finalEndDate)

      // Get all journal entries for the period
      const journalEntries = await this.getJournalEntries(organizationId, startDate, finalEndDate)
      
      if (journalEntries.length === 0) {
        return {
          success: true,
          data: {
            accounts: [],
            total_debits: 0,
            total_credits: 0,
            is_balanced: true,
            as_of_date: endDate,
            organization_id: organizationId,
            period_start: startDate,
            period_end: finalEndDate
          },
          message: 'No journal entries found for the specified period'
        }
      }

      // Calculate account balances
      const accountBalances = await this.calculateAccountBalances(journalEntries)

      // Sort accounts by account code
      accountBalances.sort((a, b) => a.account_code.localeCompare(b.account_code))

      // Calculate totals
      const totalDebits = accountBalances.reduce((sum, account) => 
        sum + (account.is_debit_nature ? account.net_balance : 0), 0
      )
      
      const totalCredits = accountBalances.reduce((sum, account) => 
        sum + (account.is_debit_nature ? 0 : Math.abs(account.net_balance)), 0
      )

      const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01

      const trialBalance: TrialBalanceData = {
        accounts: accountBalances,
        total_debits: totalDebits,
        total_credits: totalCredits,
        is_balanced: isBalanced,
        as_of_date: endDate,
        organization_id: organizationId,
        period_start: startDate,
        period_end: finalEndDate
      }

      console.log('✅ Trial balance generated successfully')
      console.log('📊 Total Debits:', totalDebits.toFixed(2))
      console.log('📊 Total Credits:', totalCredits.toFixed(2))
      console.log('⚖️ Balanced:', isBalanced ? 'Yes' : 'No')

      return {
        success: true,
        data: trialBalance,
        message: `Trial balance generated successfully. ${isBalanced ? 'Books are balanced.' : 'WARNING: Books are not balanced!'}`
      }

    } catch (error) {
      console.error('❌ Error generating trial balance:', error)
      return {
        success: false,
        message: 'Failed to generate trial balance',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get all journal entries for the specified period
   */
  private async getJournalEntries(organizationId: string, startDate: string, endDate: string) {
    console.log('📖 Fetching journal entries from', startDate, 'to', endDate)

    // Get journal entry entities
    const { data: entities, error: entitiesError } = await this.supabaseAdmin
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'journal_entry')
      .gte('created_at', startDate + 'T00:00:00Z')
      .lte('created_at', endDate + 'T23:59:59Z')
      .order('created_at', { ascending: true })

    if (entitiesError) throw entitiesError

    if (!entities || entities.length === 0) {
      console.log('📋 No journal entries found for the period')
      return []
    }

    console.log('📋 Found', entities.length, 'journal entries')

    // Get journal entry data
    const journalEntries = []
    for (const entity of entities) {
      const { data: dynamicData, error: dataError } = await this.supabaseAdmin
        .from('core_dynamic_data')
        .select('field_value')
        .eq('entity_id', entity.id)
        .eq('field_name', 'journal_entry_data')
        .single()

      if (dataError) {
        console.warn('⚠️ Failed to load journal entry data:', entity.id, dataError)
        continue
      }

      const journalData = JSON.parse(dynamicData.field_value)
      journalEntries.push({
        id: entity.id,
        journal_number: entity.entity_code,
        date: journalData.date,
        description: journalData.description || entity.entity_name,
        accounts: journalData.accounts || [],
        status: journalData.status,
        created_at: entity.created_at
      })
    }

    return journalEntries
  }

  /**
   * Calculate account balances from journal entries
   */
  private async calculateAccountBalances(journalEntries: any[]): Promise<AccountBalance[]> {
    console.log('🧮 Calculating account balances from', journalEntries.length, 'journal entries')

    const accountMap = new Map<string, {
      account_code: string
      account_name: string
      account_type: string
      total_debits: number
      total_credits: number
    }>()

    // Process all journal entry accounts
    for (const entry of journalEntries) {
      if (entry.status === 'cancelled') continue // Skip cancelled entries

      for (const account of entry.accounts) {
        const key = account.account_code
        
        if (!accountMap.has(key)) {
          accountMap.set(key, {
            account_code: account.account_code,
            account_name: account.account_name,
            account_type: this.determineAccountType(account.account_code),
            total_debits: 0,
            total_credits: 0
          })
        }

        const accountData = accountMap.get(key)!
        accountData.total_debits += account.debit || 0
        accountData.total_credits += account.credit || 0
      }
    }

    // Convert to AccountBalance array
    const accountBalances: AccountBalance[] = []
    
    for (const [, accountData] of accountMap) {
      const netBalance = accountData.total_debits - accountData.total_credits
      const isDebitNature = this.isDebitNatureAccount(accountData.account_type)
      
      accountBalances.push({
        account_code: accountData.account_code,
        account_name: accountData.account_name,
        account_type: accountData.account_type as any,
        debit_balance: accountData.total_debits,
        credit_balance: accountData.total_credits,
        net_balance: netBalance,
        is_debit_nature: isDebitNature
      })
    }

    return accountBalances
  }

  /**
   * Determine account type based on account code
   */
  private determineAccountType(accountCode: string): string {
    const firstDigit = accountCode.charAt(0)
    
    switch (firstDigit) {
      case '1': return 'asset'
      case '2': return 'liability'
      case '3': return 'equity'
      case '4': return 'revenue'
      case '5': return 'expense'
      case '6': return 'expense' // Cost of goods sold
      case '7': return 'expense' // Other expenses
      case '8': return 'revenue' // Other income
      case '9': return 'equity'  // Retained earnings, etc.
      default: return 'asset'   // Default to asset
    }
  }

  /**
   * Determine if account has debit nature
   */
  private isDebitNatureAccount(accountType: string): boolean {
    return ['asset', 'expense'].includes(accountType)
  }

  /**
   * Export trial balance to CSV
   */
  exportToCSV(trialBalance: TrialBalanceData): string {
    const header = 'Account Code,Account Name,Account Type,Debit Balance,Credit Balance,Net Balance\n'
    
    const rows = trialBalance.accounts.map(account => {
      const debitBalance = account.is_debit_nature && account.net_balance > 0 ? account.net_balance : 0
      const creditBalance = !account.is_debit_nature && account.net_balance < 0 ? Math.abs(account.net_balance) : 0
      
      return [
        account.account_code,
        `"${account.account_name}"`,
        account.account_type,
        debitBalance.toFixed(2),
        creditBalance.toFixed(2),
        account.net_balance.toFixed(2)
      ].join(',')
    }).join('\n')

    const totals = `\nTOTALS,,,"${trialBalance.total_debits.toFixed(2)}","${trialBalance.total_credits.toFixed(2)}",`
    
    return header + rows + totals
  }

  /**
   * Get trial balance summary statistics
   */
  getTrialBalanceSummary(trialBalance: TrialBalanceData) {
    const assetAccounts = trialBalance.accounts.filter(a => a.account_type === 'asset')
    const liabilityAccounts = trialBalance.accounts.filter(a => a.account_type === 'liability')
    const equityAccounts = trialBalance.accounts.filter(a => a.account_type === 'equity')
    const revenueAccounts = trialBalance.accounts.filter(a => a.account_type === 'revenue')
    const expenseAccounts = trialBalance.accounts.filter(a => a.account_type === 'expense')

    return {
      total_accounts: trialBalance.accounts.length,
      assets: {
        count: assetAccounts.length,
        total: assetAccounts.reduce((sum, a) => sum + (a.net_balance > 0 ? a.net_balance : 0), 0)
      },
      liabilities: {
        count: liabilityAccounts.length,
        total: liabilityAccounts.reduce((sum, a) => sum + (a.net_balance < 0 ? Math.abs(a.net_balance) : 0), 0)
      },
      equity: {
        count: equityAccounts.length,
        total: equityAccounts.reduce((sum, a) => sum + (a.net_balance < 0 ? Math.abs(a.net_balance) : 0), 0)
      },
      revenue: {
        count: revenueAccounts.length,
        total: revenueAccounts.reduce((sum, a) => sum + (a.net_balance < 0 ? Math.abs(a.net_balance) : 0), 0)
      },
      expenses: {
        count: expenseAccounts.length,
        total: expenseAccounts.reduce((sum, a) => sum + (a.net_balance > 0 ? a.net_balance : 0), 0)
      }
    }
  }
}

export default TrialBalanceService