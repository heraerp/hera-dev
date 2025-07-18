import { Order } from './posEventPublisher'
import { TransactionClassification, JournalEntry } from './transactionClassificationAI'
import { createClient } from '@/lib/supabase/client'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export interface JournalEntryRecord {
  id: string
  organization_id: string
  transaction_id: string
  journal_number: string
  date: string
  description: string
  total_debit: number
  total_credit: number
  status: 'draft' | 'posted' | 'cancelled'
  accounts: JournalLineItem[]
  created_by?: string
  created_at: string
  updated_at: string
}

export interface JournalLineItem {
  line_number: number
  account_code: string
  account_name: string
  debit: number
  credit: number
  description: string
  reference?: string
}

export interface JournalCreationResult {
  success: boolean
  journalEntry?: JournalEntryRecord
  message: string
  error?: string
  validationErrors?: string[]
}

export class JournalCreationService {
  private organizationId: string
  private config: any
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
  private isInitialized = false

  async initialize(organizationId: string, config: any): Promise<void> {
    this.organizationId = organizationId
    this.config = config
    this.isInitialized = true
    console.log('✅ Journal Creation Service initialized')
  }

  async createFromPOSOrder(order: Order, classification: TransactionClassification): Promise<JournalEntryRecord> {
    if (!this.isInitialized) {
      throw new Error('Journal Creation Service not initialized')
    }

    console.log('📝 Creating journal entry for order:', order.orderNumber)

    try {
      const journalEntry = await this.generateJournalEntry(order, classification)
      
      // Validate the journal entry
      const validation = this.validateJournalEntry(journalEntry)
      if (!validation.isValid) {
        throw new Error(`Journal entry validation failed: ${validation.errors.join(', ')}`)
      }

      // Save to database
      await this.saveJournalEntry(journalEntry)

      console.log('✅ Journal entry created successfully:', journalEntry.journal_number)
      return journalEntry

    } catch (error) {
      console.error('❌ Error creating journal entry:', error)
      throw error
    }
  }

  private async generateJournalEntry(order: Order, classification: TransactionClassification): Promise<JournalEntryRecord> {
    const journalId = crypto.randomUUID()
    const journalNumber = await this.generateJournalNumber(order.createdAt)
    const date = new Date(order.completedAt || order.createdAt).toISOString().split('T')[0]
    
    const journalEntry: JournalEntryRecord = {
      id: journalId,
      organization_id: this.organizationId,
      transaction_id: order.id,
      journal_number: journalNumber,
      date: date,
      description: `POS Sale - ${order.orderNumber}`,
      total_debit: 0,
      total_credit: 0,
      status: 'draft',
      accounts: [],
      created_by: order.staffMember?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Generate journal line items
    const lineItems = await this.generateJournalLineItems(order, classification)
    journalEntry.accounts = lineItems

    // Calculate totals
    journalEntry.total_debit = lineItems.reduce((sum, item) => sum + item.debit, 0)
    journalEntry.total_credit = lineItems.reduce((sum, item) => sum + item.credit, 0)

    return journalEntry
  }

  private async generateJournalLineItems(order: Order, classification: TransactionClassification): Promise<JournalLineItem[]> {
    const lineItems: JournalLineItem[] = []
    let lineNumber = 1

    // 1. Cash/Payment Method Entry (Debit)
    const cashAccount = this.getCashAccount(order.payment.method)
    lineItems.push({
      line_number: lineNumber++,
      account_code: cashAccount.code,
      account_name: cashAccount.name,
      debit: order.totalAmount,
      credit: 0,
      description: `Payment received via ${order.payment.method}`,
      reference: order.payment.reference
    })

    // 2. Revenue Entries (Credit)
    const revenueBreakdown = this.analyzeRevenueBreakdown(order)
    for (const revenue of revenueBreakdown) {
      lineItems.push({
        line_number: lineNumber++,
        account_code: revenue.account_code,
        account_name: revenue.account_name,
        debit: 0,
        credit: revenue.amount,
        description: revenue.description,
        reference: order.orderNumber
      })
    }

    // 3. Tax Entries (Credit)
    if (order.taxes > 0) {
      const taxBreakdown = this.analyzeTaxBreakdown(order.taxes)
      for (const tax of taxBreakdown) {
        lineItems.push({
          line_number: lineNumber++,
          account_code: tax.account_code,
          account_name: tax.account_name,
          debit: 0,
          credit: tax.amount,
          description: tax.description,
          reference: order.orderNumber
        })
      }
    }

    // 4. Discount Entries (Debit) - if any
    if (order.discounts > 0) {
      const discountAccount = this.getDiscountAccount()
      lineItems.push({
        line_number: lineNumber++,
        account_code: discountAccount.code,
        account_name: discountAccount.name,
        debit: order.discounts,
        credit: 0,
        description: 'Discount given to customer',
        reference: order.orderNumber
      })
    }

    // 5. Service Charge Entries (Credit) - if any
    if (order.serviceCharges > 0) {
      const serviceChargeAccount = this.getServiceChargeAccount()
      lineItems.push({
        line_number: lineNumber++,
        account_code: serviceChargeAccount.code,
        account_name: serviceChargeAccount.name,
        debit: 0,
        credit: order.serviceCharges,
        description: 'Service charge collected',
        reference: order.orderNumber
      })
    }

    return lineItems
  }

  private analyzeRevenueBreakdown(order: Order): { account_code: string; account_name: string; amount: number; description: string }[] {
    const breakdown: { account_code: string; account_name: string; amount: number; description: string }[] = []
    
    // Group items by category
    const categoryGroups = order.items.reduce((groups, item) => {
      const category = item.category || 'food'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(item)
      return groups
    }, {} as Record<string, typeof order.items>)

    // Create revenue entries for each category
    for (const [category, items] of Object.entries(categoryGroups)) {
      const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0)
      const account = this.getRevenueAccount(category)
      
      breakdown.push({
        account_code: account.code,
        account_name: account.name,
        amount: totalAmount,
        description: `${category} sales - ${items.length} items`
      })
    }

    return breakdown
  }

  private analyzeTaxBreakdown(totalTax: number): { account_code: string; account_name: string; amount: number; description: string }[] {
    // For Indian restaurants, typically split between CGST and SGST
    const cgstAmount = totalTax / 2
    const sgstAmount = totalTax / 2

    return [
      {
        account_code: '2110001',
        account_name: 'CGST Payable',
        amount: cgstAmount,
        description: 'Central GST collected'
      },
      {
        account_code: '2110002',
        account_name: 'SGST Payable',
        amount: sgstAmount,
        description: 'State GST collected'
      }
    ]
  }

  private getCashAccount(paymentMethod: string): { code: string; name: string } {
    const accountMap = {
      'cash': { code: '1110000', name: 'Cash in Hand' },
      'credit_card': { code: '1120000', name: 'Credit Card Receivable' },
      'debit_card': { code: '1120001', name: 'Debit Card Receivable' },
      'upi': { code: '1121000', name: 'UPI Collections' },
      'digital_wallet': { code: '1122000', name: 'Digital Wallet' }
    }

    return accountMap[paymentMethod] || accountMap['cash']
  }

  private getRevenueAccount(category: string): { code: string; name: string } {
    const accountMap = {
      'food': { code: '4110000', name: 'Food Sales' },
      'beverage': { code: '4120000', name: 'Beverage Sales' },
      'delivery': { code: '4130000', name: 'Delivery Revenue' },
      'catering': { code: '4150000', name: 'Catering Revenue' },
      'other': { code: '4190000', name: 'Other Revenue' }
    }

    return accountMap[category] || accountMap['food']
  }

  private getDiscountAccount(): { code: string; name: string } {
    return { code: '5110000', name: 'Sales Discounts' }
  }

  private getServiceChargeAccount(): { code: string; name: string } {
    return { code: '4140000', name: 'Service Charges' }
  }

  private validateJournalEntry(journalEntry: JournalEntryRecord): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check if accounts array exists and has entries
    if (!journalEntry.accounts || journalEntry.accounts.length === 0) {
      errors.push('Journal entry must have at least one account entry')
    }

    // Validate double-entry accounting
    const totalDebits = journalEntry.accounts.reduce((sum, account) => sum + account.debit, 0)
    const totalCredits = journalEntry.accounts.reduce((sum, account) => sum + account.credit, 0)
    
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      errors.push(`Journal entry is not balanced: Debits ${totalDebits}, Credits ${totalCredits}`)
    }

    // Validate account codes
    for (const account of journalEntry.accounts) {
      if (!account.account_code || account.account_code.length < 6) {
        errors.push(`Invalid account code: ${account.account_code}`)
      }
      
      if (!account.account_name || account.account_name.trim() === '') {
        errors.push(`Missing account name for code: ${account.account_code}`)
      }
      
      if (account.debit < 0 || account.credit < 0) {
        errors.push(`Negative amounts not allowed: ${account.account_code}`)
      }
      
      if (account.debit > 0 && account.credit > 0) {
        errors.push(`Account cannot have both debit and credit: ${account.account_code}`)
      }
    }

    // Validate required fields
    if (!journalEntry.journal_number || journalEntry.journal_number.trim() === '') {
      errors.push('Journal number is required')
    }

    if (!journalEntry.date) {
      errors.push('Journal date is required')
    }

    if (!journalEntry.description || journalEntry.description.trim() === '') {
      errors.push('Journal description is required')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  private async saveJournalEntry(journalEntry: JournalEntryRecord): Promise<void> {
    try {
      console.log('🚀 Saving journal entry with service role client...')
      
      // Save journal entry to core_entities using service role (bypasses RLS)
      const { error: entityError } = await this.supabaseAdmin
        .from('core_entities')
        .insert({
          id: journalEntry.id,
          organization_id: journalEntry.organization_id,
          entity_type: 'journal_entry',
          entity_name: journalEntry.description,
          entity_code: journalEntry.journal_number,
          is_active: true,
          created_at: journalEntry.created_at,
          updated_at: journalEntry.updated_at
        })

      if (entityError) {
        console.error('❌ Entity creation error:', entityError)
        throw entityError
      }

      console.log('✅ Journal entry entity created successfully')

      // Save journal entry details to core_dynamic_data using service role
      const journalData = {
        transaction_id: journalEntry.transaction_id,
        date: journalEntry.date,
        description: journalEntry.description,
        total_debit: journalEntry.total_debit,
        total_credit: journalEntry.total_credit,
        status: journalEntry.status,
        accounts: journalEntry.accounts,
        created_by: journalEntry.created_by
      }

      const { error: dataError } = await this.supabaseAdmin
        .from('core_dynamic_data')
        .insert({
          entity_id: journalEntry.id,
          field_name: 'journal_entry_data',
          field_value: JSON.stringify(journalData),
          field_type: 'jsonb'
        })

      if (dataError) {
        console.error('❌ Dynamic data creation error:', dataError)
        throw dataError
      }

      console.log('✅ Journal entry data saved successfully')
      console.log('✅ Journal entry saved to database')

    } catch (error) {
      console.error('❌ Error saving journal entry:', error)
      throw error
    }
  }

  private async generateJournalNumber(date: string): Promise<string> {
    const dateObj = new Date(date)
    const year = dateObj.getFullYear()
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    const day = String(dateObj.getDate()).padStart(2, '0')
    
    // Get the next sequence number for the day using service role client
    const { count } = await this.supabaseAdmin
      .from('core_entities')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', this.organizationId)
      .eq('entity_type', 'journal_entry')
      .gte('created_at', `${year}-${month}-${day}T00:00:00Z`)
      .lt('created_at', `${year}-${month}-${day}T23:59:59Z`)

    const sequence = String((count || 0) + 1).padStart(4, '0')
    
    return `JE-${year}${month}${day}-${sequence}`
  }

  async getJournalEntry(journalId: string): Promise<JournalEntryRecord | null> {
    try {
      const { data: entity, error: entityError } = await this.supabaseAdmin
        .from('core_entities')
        .select('*')
        .eq('id', journalId)
        .eq('entity_type', 'journal_entry')
        .single()

      if (entityError) throw entityError

      const { data: journalData, error: dataError } = await this.supabaseAdmin
        .from('core_dynamic_data')
        .select('field_value')
        .eq('entity_id', journalId)
        .eq('field_name', 'journal_entry_data')
        .single()

      if (dataError) throw dataError

      const data = JSON.parse(journalData.field_value)

      return {
        id: entity.id,
        organization_id: entity.organization_id,
        journal_number: entity.entity_code,
        ...data,
        created_at: entity.created_at,
        updated_at: entity.updated_at
      }

    } catch (error) {
      console.error('❌ Error fetching journal entry:', error)
      return null
    }
  }

  async updateJournalStatus(journalId: string, status: 'draft' | 'posted' | 'cancelled'): Promise<void> {
    try {
      const { data: currentData, error: fetchError } = await this.supabaseAdmin
        .from('core_dynamic_data')
        .select('field_value')
        .eq('entity_id', journalId)
        .eq('field_name', 'journal_entry_data')
        .single()

      if (fetchError) throw fetchError

      const data = JSON.parse(currentData.field_value)
      data.status = status

      const { error: updateError } = await this.supabaseAdmin
        .from('core_dynamic_data')
        .update({
          field_value: JSON.stringify(data),
          updated_at: new Date().toISOString()
        })
        .eq('entity_id', journalId)
        .eq('field_name', 'journal_entry_data')

      if (updateError) throw updateError

      console.log('✅ Journal entry status updated:', status)

    } catch (error) {
      console.error('❌ Error updating journal entry status:', error)
      throw error
    }
  }
}

export default JournalCreationService