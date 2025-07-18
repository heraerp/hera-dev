/**
 * Universal Financial Accounting Service
 * SAP Business One-style financial management using HERA Universal Schema
 * Complete accounting automation with journal entries, chart of accounts, and financial reporting
 */

import UniversalCrudService from '@/lib/services/universalCrudService'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

// Regular client for read operations
const supabase = createClient()

// Admin client with service role for write operations (bypasses RLS)
const supabaseAdmin = createSupabaseClient(
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

// Financial entity types for universal schema (SAP Business One style)
export const FINANCIAL_ENTITY_TYPES = {
  // Chart of Accounts Structure
  ACCOUNT_GROUP: 'account_group',
  ACCOUNT_CATEGORY: 'account_category', 
  ACCOUNT: 'gl_account',
  SUB_ACCOUNT: 'sub_account',
  
  // Financial Transactions
  JOURNAL_ENTRY: 'journal_entry',
  JOURNAL_LINE: 'journal_line',
  FINANCIAL_TRANSACTION: 'financial_transaction',
  
  // Financial Periods & Controls
  FISCAL_YEAR: 'fiscal_year',
  ACCOUNTING_PERIOD: 'accounting_period',
  BUDGET: 'budget',
  BUDGET_LINE: 'budget_line',
  
  // Financial Reports
  TRIAL_BALANCE: 'trial_balance',
  BALANCE_SHEET: 'balance_sheet',
  PROFIT_LOSS: 'profit_loss',
  CASH_FLOW: 'cash_flow',
  
  // Cost Centers & Dimensions
  COST_CENTER: 'cost_center',
  PROFIT_CENTER: 'profit_center',
  PROJECT: 'project',
  DEPARTMENT: 'department'
} as const

// Financial metadata types for rich accounting data
export const FINANCIAL_METADATA_TYPES = {
  ACCOUNT_PROPERTIES: 'account_properties',
  FINANCIAL_RATIOS: 'financial_ratios',
  BUDGET_VARIANCE: 'budget_variance',
  AUDIT_TRAIL: 'audit_trail',
  TAX_INFORMATION: 'tax_information',
  REGULATORY_COMPLIANCE: 'regulatory_compliance',
  FINANCIAL_ANALYSIS: 'financial_analysis',
  CONSOLIDATION_DATA: 'consolidation_data'
} as const

// SAP Business One Chart of Accounts Structure
export const SAP_ACCOUNT_STRUCTURE = {
  // Assets (1000-1999)
  ASSETS: {
    code: '1000',
    name: 'ASSETS',
    type: 'Assets',
    categories: {
      CURRENT_ASSETS: {
        code: '1100',
        name: 'Current Assets',
        accounts: {
          CASH_AND_EQUIVALENTS: { code: '1110', name: 'Cash and Cash Equivalents' },
          PETTY_CASH: { code: '1111', name: 'Petty Cash' },
          BANK_CHECKING: { code: '1112', name: 'Bank - Checking Account' },
          BANK_SAVINGS: { code: '1113', name: 'Bank - Savings Account' },
          ACCOUNTS_RECEIVABLE: { code: '1120', name: 'Accounts Receivable - Trade' },
          ALLOWANCE_DOUBTFUL: { code: '1121', name: 'Allowance for Doubtful Accounts' },
          INVENTORY_RAW: { code: '1130', name: 'Inventory - Raw Materials' },
          INVENTORY_FINISHED: { code: '1131', name: 'Inventory - Finished Goods' },
          INVENTORY_SUPPLIES: { code: '1132', name: 'Inventory - Supplies' },
          PREPAID_EXPENSES: { code: '1140', name: 'Prepaid Expenses' },
          PREPAID_INSURANCE: { code: '1141', name: 'Prepaid Insurance' },
          PREPAID_RENT: { code: '1142', name: 'Prepaid Rent' },
          OTHER_CURRENT: { code: '1150', name: 'Other Current Assets' }
        }
      },
      FIXED_ASSETS: {
        code: '1200',
        name: 'Fixed Assets',
        accounts: {
          LAND: { code: '1210', name: 'Land' },
          BUILDINGS: { code: '1220', name: 'Buildings' },
          BUILDINGS_DEPRECIATION: { code: '1221', name: 'Accumulated Depreciation - Buildings' },
          EQUIPMENT: { code: '1230', name: 'Equipment' },
          EQUIPMENT_DEPRECIATION: { code: '1231', name: 'Accumulated Depreciation - Equipment' },
          FURNITURE_FIXTURES: { code: '1240', name: 'Furniture and Fixtures' },
          FURNITURE_DEPRECIATION: { code: '1241', name: 'Accumulated Depreciation - Furniture' },
          VEHICLES: { code: '1250', name: 'Vehicles' },
          VEHICLES_DEPRECIATION: { code: '1251', name: 'Accumulated Depreciation - Vehicles' },
          COMPUTER_EQUIPMENT: { code: '1260', name: 'Computer Equipment' },
          COMPUTER_DEPRECIATION: { code: '1261', name: 'Accumulated Depreciation - Computer Equipment' }
        }
      },
      INTANGIBLE_ASSETS: {
        code: '1300',
        name: 'Intangible Assets',
        accounts: {
          GOODWILL: { code: '1310', name: 'Goodwill' },
          PATENTS: { code: '1320', name: 'Patents' },
          TRADEMARKS: { code: '1330', name: 'Trademarks' },
          SOFTWARE: { code: '1340', name: 'Software Licenses' },
          OTHER_INTANGIBLE: { code: '1350', name: 'Other Intangible Assets' }
        }
      }
    }
  },
  
  // Liabilities (2000-2999)
  LIABILITIES: {
    code: '2000',
    name: 'LIABILITIES',
    type: 'Liabilities',
    categories: {
      CURRENT_LIABILITIES: {
        code: '2100',
        name: 'Current Liabilities',
        accounts: {
          ACCOUNTS_PAYABLE: { code: '2110', name: 'Accounts Payable - Trade' },
          ACCRUED_EXPENSES: { code: '2120', name: 'Accrued Expenses' },
          ACCRUED_PAYROLL: { code: '2121', name: 'Accrued Payroll' },
          ACCRUED_TAXES: { code: '2122', name: 'Accrued Taxes' },
          SHORT_TERM_DEBT: { code: '2130', name: 'Short-term Debt' },
          CURRENT_PORTION_LT: { code: '2140', name: 'Current Portion of Long-term Debt' },
          SALES_TAX_PAYABLE: { code: '2150', name: 'Sales Tax Payable' },
          PAYROLL_TAX_PAYABLE: { code: '2160', name: 'Payroll Tax Payable' },
          INCOME_TAX_PAYABLE: { code: '2170', name: 'Income Tax Payable' },
          OTHER_CURRENT: { code: '2180', name: 'Other Current Liabilities' }
        }
      },
      LONG_TERM_LIABILITIES: {
        code: '2200',
        name: 'Long-term Liabilities',
        accounts: {
          LONG_TERM_DEBT: { code: '2210', name: 'Long-term Debt' },
          MORTGAGE_PAYABLE: { code: '2220', name: 'Mortgage Payable' },
          BONDS_PAYABLE: { code: '2230', name: 'Bonds Payable' },
          DEFERRED_TAX: { code: '2240', name: 'Deferred Tax Liability' },
          OTHER_LONG_TERM: { code: '2250', name: 'Other Long-term Liabilities' }
        }
      }
    }
  },
  
  // Equity (3000-3999)
  EQUITY: {
    code: '3000',
    name: 'EQUITY',
    type: 'Equity',
    categories: {
      OWNERS_EQUITY: {
        code: '3100',
        name: 'Owner\'s Equity',
        accounts: {
          OWNER_CAPITAL: { code: '3110', name: 'Owner\'s Capital' },
          OWNER_DRAWINGS: { code: '3120', name: 'Owner\'s Drawings' },
          RETAINED_EARNINGS: { code: '3130', name: 'Retained Earnings' },
          CURRENT_EARNINGS: { code: '3140', name: 'Current Year Earnings' }
        }
      },
      STOCKHOLDER_EQUITY: {
        code: '3200',
        name: 'Stockholder Equity',
        accounts: {
          COMMON_STOCK: { code: '3210', name: 'Common Stock' },
          PREFERRED_STOCK: { code: '3220', name: 'Preferred Stock' },
          ADDITIONAL_PAID_IN: { code: '3230', name: 'Additional Paid-in Capital' },
          TREASURY_STOCK: { code: '3240', name: 'Treasury Stock' }
        }
      }
    }
  },
  
  // Revenue (4000-4999)
  REVENUE: {
    code: '4000',
    name: 'REVENUE',
    type: 'Income',
    categories: {
      OPERATING_REVENUE: {
        code: '4100',
        name: 'Operating Revenue',
        accounts: {
          SALES_REVENUE: { code: '4110', name: 'Sales Revenue' },
          FOOD_BEVERAGE_SALES: { code: '4111', name: 'Food and Beverage Sales' },
          TEA_SALES: { code: '4112', name: 'Tea Sales' },
          PASTRY_SALES: { code: '4113', name: 'Pastry Sales' },
          SERVICE_REVENUE: { code: '4120', name: 'Service Revenue' },
          CATERING_REVENUE: { code: '4121', name: 'Catering Revenue' },
          DELIVERY_REVENUE: { code: '4122', name: 'Delivery Revenue' },
          SALES_DISCOUNTS: { code: '4130', name: 'Sales Discounts' },
          SALES_RETURNS: { code: '4140', name: 'Sales Returns and Allowances' }
        }
      },
      OTHER_REVENUE: {
        code: '4200',
        name: 'Other Revenue',
        accounts: {
          INTEREST_INCOME: { code: '4210', name: 'Interest Income' },
          DIVIDEND_INCOME: { code: '4220', name: 'Dividend Income' },
          RENTAL_INCOME: { code: '4230', name: 'Rental Income' },
          GAIN_ON_SALE: { code: '4240', name: 'Gain on Sale of Assets' },
          MISCELLANEOUS_INCOME: { code: '4250', name: 'Miscellaneous Income' }
        }
      }
    }
  },
  
  // Expenses (5000-5999)
  EXPENSES: {
    code: '5000',
    name: 'EXPENSES',
    type: 'Expense',
    categories: {
      COST_OF_GOODS_SOLD: {
        code: '5100',
        name: 'Cost of Goods Sold',
        accounts: {
          COST_OF_SALES: { code: '5110', name: 'Cost of Sales' },
          FOOD_COSTS: { code: '5111', name: 'Food Costs' },
          BEVERAGE_COSTS: { code: '5112', name: 'Beverage Costs' },
          DIRECT_LABOR: { code: '5120', name: 'Direct Labor' },
          MANUFACTURING_OVERHEAD: { code: '5130', name: 'Manufacturing Overhead' },
          FREIGHT_IN: { code: '5140', name: 'Freight In' },
          PURCHASE_DISCOUNTS: { code: '5150', name: 'Purchase Discounts' }
        }
      },
      OPERATING_EXPENSES: {
        code: '5200',
        name: 'Operating Expenses',
        accounts: {
          SALARIES_WAGES: { code: '5210', name: 'Salaries and Wages' },
          PAYROLL_TAXES: { code: '5220', name: 'Payroll Taxes' },
          EMPLOYEE_BENEFITS: { code: '5230', name: 'Employee Benefits' },
          RENT_EXPENSE: { code: '5240', name: 'Rent Expense' },
          UTILITIES: { code: '5250', name: 'Utilities' },
          TELEPHONE: { code: '5260', name: 'Telephone' },
          INSURANCE: { code: '5270', name: 'Insurance' },
          OFFICE_SUPPLIES: { code: '5280', name: 'Office Supplies' },
          ADVERTISING: { code: '5290', name: 'Advertising and Marketing' },
          PROFESSIONAL_FEES: { code: '5300', name: 'Professional Fees' },
          LEGAL_FEES: { code: '5310', name: 'Legal Fees' },
          ACCOUNTING_FEES: { code: '5320', name: 'Accounting Fees' },
          DEPRECIATION: { code: '5330', name: 'Depreciation Expense' },
          REPAIRS_MAINTENANCE: { code: '5340', name: 'Repairs and Maintenance' },
          TRAVEL_ENTERTAINMENT: { code: '5350', name: 'Travel and Entertainment' },
          BAD_DEBT: { code: '5360', name: 'Bad Debt Expense' },
          BANK_CHARGES: { code: '5370', name: 'Bank Charges' },
          MISCELLANEOUS: { code: '5380', name: 'Miscellaneous Expenses' }
        }
      },
      NON_OPERATING_EXPENSES: {
        code: '5400',
        name: 'Non-Operating Expenses',
        accounts: {
          INTEREST_EXPENSE: { code: '5410', name: 'Interest Expense' },
          LOSS_ON_SALE: { code: '5420', name: 'Loss on Sale of Assets' },
          EXTRAORDINARY_LOSS: { code: '5430', name: 'Extraordinary Loss' }
        }
      }
    }
  }
} as const

// Interface definitions for financial accounting
export interface ChartOfAccount {
  id: string
  organizationId: string
  accountCode: string
  accountName: string
  accountType: 'Assets' | 'Liabilities' | 'Equity' | 'Income' | 'Expense'
  accountCategory: string
  parentAccountId?: string
  isActive: boolean
  isPosting: boolean
  level: number
  balance: number
  debitBalance: number
  creditBalance: number
  budgetAmount?: number
  createdAt: string
  updatedAt: string
}

export interface JournalEntry {
  id: string
  organizationId: string
  entryNumber: string
  entryDate: string
  reference: string
  description: string
  totalDebit: number
  totalCredit: number
  status: 'draft' | 'posted' | 'cancelled'
  sourceDocument: string
  sourceId: string
  createdBy: string
  postedBy?: string
  postedDate?: string
  lines: JournalLine[]
  createdAt: string
  updatedAt: string
}

export interface JournalLine {
  id: string
  journalEntryId: string
  accountId: string
  accountCode: string
  accountName: string
  debitAmount: number
  creditAmount: number
  description: string
  reference?: string
  costCenter?: string
  project?: string
  lineOrder: number
}

export interface FinancialReport {
  reportType: 'trial_balance' | 'balance_sheet' | 'income_statement' | 'cash_flow'
  organizationId: string
  periodStart: string
  periodEnd: string
  data: FinancialReportData[]
  totalAssets?: number
  totalLiabilities?: number
  totalEquity?: number
  totalRevenue?: number
  totalExpenses?: number
  netIncome?: number
  generatedAt: string
}

export interface FinancialReportData {
  accountCode: string
  accountName: string
  accountType: string
  debitBalance: number
  creditBalance: number
  netBalance: number
  level: number
  parentAccount?: string
}

export interface ServiceResult<T = any> {
  success: boolean
  data?: T
  error?: string
  details?: any
}

/**
 * Universal Financial Accounting Service
 * SAP Business One-style financial management with complete automation
 */
export class FinancialAccountingService {
  /**
   * Initialize chart of accounts with SAP Business One structure
   */
  static async initializeChartOfAccounts(organizationId: string): Promise<ServiceResult> {
    try {
      console.log('🏦 Initializing SAP Business One chart of accounts for organization:', organizationId)
      
      // Check if chart of accounts already exists
      const { data: existingAccounts } = await supabase
        .from('core_entities')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('entity_type', FINANCIAL_ENTITY_TYPES.ACCOUNT)
        .limit(1)
      
      if (existingAccounts && existingAccounts.length > 0) {
        console.log('✅ Chart of accounts already initialized')
        return { success: true, data: { message: 'Chart of accounts already exists' } }
      }
      
      let createdCount = 0
      
      // Create accounts from SAP structure
      for (const [groupKey, group] of Object.entries(SAP_ACCOUNT_STRUCTURE)) {
        // Create main account group
        const groupId = await this.createAccount(organizationId, {
          accountCode: group.code,
          accountName: group.name,
          accountType: group.type as any,
          accountCategory: 'Group',
          isPosting: false,
          level: 1
        })
        
        if (groupId) {
          createdCount++
          
          // Create categories within group
          for (const [categoryKey, category] of Object.entries(group.categories)) {
            const categoryId = await this.createAccount(organizationId, {
              accountCode: category.code,
              accountName: category.name,
              accountType: group.type as any,
              accountCategory: 'Category',
              parentAccountId: groupId,
              isPosting: false,
              level: 2
            })
            
            if (categoryId) {
              createdCount++
              
              // Create individual accounts
              for (const [accountKey, account] of Object.entries(category.accounts)) {
                const accountId = await this.createAccount(organizationId, {
                  accountCode: account.code,
                  accountName: account.name,
                  accountType: group.type as any,
                  accountCategory: 'Account',
                  parentAccountId: categoryId,
                  isPosting: true,
                  level: 3
                })
                
                if (accountId) {
                  createdCount++
                }
              }
            }
          }
        }
      }
      
      console.log(`✅ Chart of accounts initialized with ${createdCount} accounts`)
      
      return {
        success: true,
        data: { createdCount, message: 'Chart of accounts initialized successfully' }
      }
      
    } catch (error) {
      console.error('❌ Failed to initialize chart of accounts:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initialize chart of accounts'
      }
    }
  }
  
  /**
   * Create a new account in the chart of accounts
   */
  static async createAccount(
    organizationId: string, 
    accountData: {
      accountCode: string
      accountName: string
      accountType: 'Assets' | 'Liabilities' | 'Equity' | 'Income' | 'Expense'
      accountCategory: string
      parentAccountId?: string
      isPosting?: boolean
      level?: number
    }
  ): Promise<string | null> {
    try {
      const accountId = crypto.randomUUID()
      
      // Create account entity in core_entities
      const { error: entityError } = await supabaseAdmin
        .from('core_entities')
        .insert({
          id: accountId,
          organization_id: organizationId,
          entity_type: FINANCIAL_ENTITY_TYPES.ACCOUNT,
          entity_name: accountData.accountName,
          entity_code: accountData.accountCode,
          is_active: true
        })
      
      if (entityError) {
        throw new Error(`Failed to create account entity: ${entityError.message}`)
      }
      
      // Create account metadata
      const accountMetadata = {
        organization_id: organizationId,
        entity_type: 'gl_account',
        entity_id: accountId,
        metadata_type: FINANCIAL_METADATA_TYPES.ACCOUNT_PROPERTIES,
        metadata_category: 'account_structure',
        metadata_key: 'account_details',
        metadata_value: {
          account_code: accountData.accountCode,
          account_name: accountData.accountName,
          account_type: accountData.accountType,
          account_category: accountData.accountCategory,
          parent_account_id: accountData.parentAccountId,
          is_posting: accountData.isPosting ?? true,
          level: accountData.level ?? 1,
          balance: 0,
          debit_balance: 0,
          credit_balance: 0,
          is_active: true,
          created_date: new Date().toISOString(),
          last_transaction_date: null,
          account_properties: {
            currency: 'USD',
            is_bank_account: accountData.accountCode.startsWith('111'),
            is_cash_account: accountData.accountCode === '1110',
            is_receivable: accountData.accountCode === '1120',
            is_payable: accountData.accountCode === '2110',
            is_revenue: accountData.accountType === 'Income',
            is_expense: accountData.accountType === 'Expense',
            is_asset: accountData.accountType === 'Assets',
            is_liability: accountData.accountType === 'Liabilities',
            is_equity: accountData.accountType === 'Equity'
          }
        }
      }
      
      const { error: metadataError } = await supabaseAdmin
        .from('core_metadata')
        .insert(accountMetadata)
      
      if (metadataError) {
        console.warn('⚠️ Failed to create account metadata:', metadataError.message)
      }
      
      return accountId
      
    } catch (error) {
      console.error('❌ Failed to create account:', error)
      return null
    }
  }
  
  /**
   * Get chart of accounts with hierarchy
   */
  static async getChartOfAccounts(organizationId: string): Promise<ServiceResult<ChartOfAccount[]>> {
    try {
      console.log('📊 Fetching chart of accounts for organization:', organizationId)
      
      // Get account entities
      const { data: accounts, error: accountsError } = await supabase
        .from('core_entities')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_type', FINANCIAL_ENTITY_TYPES.ACCOUNT)
        .eq('is_active', true)
        .order('entity_code')
      
      if (accountsError) {
        throw new Error(`Failed to fetch accounts: ${accountsError.message}`)
      }
      
      // Get account metadata
      const accountIds = (accounts || []).map(acc => acc.id)
      
      const { data: metadata, error: metadataError } = await supabase
        .from('core_metadata')
        .select('entity_id, metadata_value')
        .eq('organization_id', organizationId)
        .eq('metadata_type', FINANCIAL_METADATA_TYPES.ACCOUNT_PROPERTIES)
        .in('entity_id', accountIds)
      
      if (metadataError) {
        console.warn('⚠️ Failed to fetch account metadata:', metadataError.message)
      }
      
      // Build metadata map
      const metadataMap = new Map()
      metadata?.forEach(m => metadataMap.set(m.entity_id, m.metadata_value))
      
      // Transform to ChartOfAccount objects
      const chartOfAccounts: ChartOfAccount[] = (accounts || []).map(account => {
        const accountMeta = metadataMap.get(account.id) || {}
        
        return {
          id: account.id,
          organizationId: account.organization_id,
          accountCode: account.entity_code,
          accountName: account.entity_name,
          accountType: accountMeta.account_type || 'Assets',
          accountCategory: accountMeta.account_category || 'Account',
          parentAccountId: accountMeta.parent_account_id,
          isActive: account.is_active,
          isPosting: accountMeta.is_posting ?? true,
          level: accountMeta.level || 1,
          balance: accountMeta.balance || 0,
          debitBalance: accountMeta.debit_balance || 0,
          creditBalance: accountMeta.credit_balance || 0,
          budgetAmount: accountMeta.budget_amount,
          createdAt: account.created_at,
          updatedAt: account.updated_at
        }
      })
      
      console.log('✅ Chart of accounts fetched successfully:', chartOfAccounts.length)
      
      return {
        success: true,
        data: chartOfAccounts
      }
      
    } catch (error) {
      console.error('❌ Failed to fetch chart of accounts:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch chart of accounts'
      }
    }
  }
  
  /**
   * Create journal entry for business transaction
   */
  static async createJournalEntry(
    organizationId: string,
    entryData: {
      reference: string
      description: string
      sourceDocument: string
      sourceId: string
      entryDate: string
      lines: {
        accountCode: string
        debitAmount?: number
        creditAmount?: number
        description: string
        reference?: string
      }[]
    }
  ): Promise<ServiceResult<JournalEntry>> {
    try {
      console.log('📝 Creating journal entry for organization:', organizationId)
      
      const entryId = crypto.randomUUID()
      const entryNumber = `JE-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
      
      // Validate that debits equal credits
      const totalDebits = entryData.lines.reduce((sum, line) => sum + (line.debitAmount || 0), 0)
      const totalCredits = entryData.lines.reduce((sum, line) => sum + (line.creditAmount || 0), 0)
      
      if (Math.abs(totalDebits - totalCredits) > 0.01) {
        throw new Error('Journal entry is not balanced: debits must equal credits')
      }
      
      // Get chart of accounts for validation
      const chartResult = await this.getChartOfAccounts(organizationId)
      if (!chartResult.success || !chartResult.data) {
        throw new Error('Failed to fetch chart of accounts')
      }
      
      const accountsMap = new Map()
      chartResult.data.forEach(acc => accountsMap.set(acc.accountCode, acc))
      
      // Validate account codes
      for (const line of entryData.lines) {
        if (!accountsMap.has(line.accountCode)) {
          throw new Error(`Invalid account code: ${line.accountCode}`)
        }
      }
      
      // Create journal entry in universal_transactions
      const journalTransaction = {
        id: entryId,
        organization_id: organizationId,
        transaction_type: 'JOURNAL_ENTRY',
        transaction_number: entryNumber,
        transaction_date: entryData.entryDate,
        total_amount: totalDebits,
        currency: 'USD',
        status: 'posted'
      }
      
      const { error: transactionError } = await supabaseAdmin
        .from('universal_transactions')
        .insert(journalTransaction)
      
      if (transactionError) {
        throw new Error(`Failed to create journal transaction: ${transactionError.message}`)
      }
      
      // Create journal lines in universal_transaction_lines
      const journalLines = entryData.lines.map((line, index) => {
        const account = accountsMap.get(line.accountCode)
        return {
          id: crypto.randomUUID(),
          transaction_id: entryId,
          entity_id: account.id,
          line_description: line.description,
          quantity: 1,
          unit_price: line.debitAmount || line.creditAmount || 0,
          line_amount: line.debitAmount || line.creditAmount || 0,
          line_order: index + 1
        }
      })
      
      const { error: linesError } = await supabaseAdmin
        .from('universal_transaction_lines')
        .insert(journalLines)
      
      if (linesError) {
        throw new Error(`Failed to create journal lines: ${linesError.message}`)
      }
      
      // Create journal entry metadata
      const journalMetadata = {
        organization_id: organizationId,
        entity_type: 'transaction',
        entity_id: entryId,
        metadata_type: FINANCIAL_METADATA_TYPES.AUDIT_TRAIL,
        metadata_category: 'journal_entry',
        metadata_key: 'journal_details',
        metadata_value: {
          entry_number: entryNumber,
          reference: entryData.reference,
          description: entryData.description,
          source_document: entryData.sourceDocument,
          source_id: entryData.sourceId,
          entry_date: entryData.entryDate,
          total_debits: totalDebits,
          total_credits: totalCredits,
          status: 'posted',
          created_by: 'system',
          posted_by: 'system',
          posted_date: new Date().toISOString(),
          journal_lines: entryData.lines.map((line, index) => ({
            line_number: index + 1,
            account_code: line.accountCode,
            account_name: accountsMap.get(line.accountCode)?.accountName,
            debit_amount: line.debitAmount || 0,
            credit_amount: line.creditAmount || 0,
            description: line.description,
            reference: line.reference
          }))
        }
      }
      
      const { error: metadataError } = await supabaseAdmin
        .from('core_metadata')
        .insert(journalMetadata)
      
      if (metadataError) {
        console.warn('⚠️ Failed to create journal metadata:', metadataError.message)
      }
      
      // Update account balances
      await this.updateAccountBalances(organizationId, entryData.lines)
      
      // Build response journal entry
      const journalEntry: JournalEntry = {
        id: entryId,
        organizationId: organizationId,
        entryNumber: entryNumber,
        entryDate: entryData.entryDate,
        reference: entryData.reference,
        description: entryData.description,
        totalDebit: totalDebits,
        totalCredit: totalCredits,
        status: 'posted',
        sourceDocument: entryData.sourceDocument,
        sourceId: entryData.sourceId,
        createdBy: 'system',
        postedBy: 'system',
        postedDate: new Date().toISOString(),
        lines: entryData.lines.map((line, index) => ({
          id: journalLines[index].id,
          journalEntryId: entryId,
          accountId: accountsMap.get(line.accountCode).id,
          accountCode: line.accountCode,
          accountName: accountsMap.get(line.accountCode).accountName,
          debitAmount: line.debitAmount || 0,
          creditAmount: line.creditAmount || 0,
          description: line.description,
          reference: line.reference,
          lineOrder: index + 1
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      console.log('✅ Journal entry created successfully:', entryNumber)
      
      return {
        success: true,
        data: journalEntry
      }
      
    } catch (error) {
      console.error('❌ Failed to create journal entry:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create journal entry'
      }
    }
  }
  
  /**
   * Update account balances after journal entry
   */
  private static async updateAccountBalances(
    organizationId: string,
    journalLines: {
      accountCode: string
      debitAmount?: number
      creditAmount?: number
    }[]
  ): Promise<void> {
    try {
      // Get current chart of accounts
      const chartResult = await this.getChartOfAccounts(organizationId)
      if (!chartResult.success || !chartResult.data) return
      
      const accountsMap = new Map()
      chartResult.data.forEach(acc => accountsMap.set(acc.accountCode, acc))
      
      // Update each affected account
      for (const line of journalLines) {
        const account = accountsMap.get(line.accountCode)
        if (!account) continue
        
        const debitAmount = line.debitAmount || 0
        const creditAmount = line.creditAmount || 0
        
        // Calculate new balances based on account type
        let newDebitBalance = account.debitBalance + debitAmount
        let newCreditBalance = account.creditBalance + creditAmount
        let newBalance = account.balance
        
        // For asset and expense accounts: debits increase balance
        if (account.accountType === 'Assets' || account.accountType === 'Expense') {
          newBalance = newBalance + debitAmount - creditAmount
        }
        // For liability, equity, and income accounts: credits increase balance
        else {
          newBalance = newBalance - debitAmount + creditAmount
        }
        
        // Update account metadata
        const { error } = await supabaseAdmin
          .from('core_metadata')
          .update({
            metadata_value: {
              ...account,
              balance: newBalance,
              debit_balance: newDebitBalance,
              credit_balance: newCreditBalance,
              last_transaction_date: new Date().toISOString()
            }
          })
          .eq('organization_id', organizationId)
          .eq('entity_id', account.id)
          .eq('metadata_type', FINANCIAL_METADATA_TYPES.ACCOUNT_PROPERTIES)
        
        if (error) {
          console.warn(`⚠️ Failed to update balance for account ${line.accountCode}:`, error.message)
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to update account balances:', error)
    }
  }
  
  /**
   * Create journal entry for sales transaction
   */
  static async createSalesJournalEntry(
    organizationId: string,
    salesData: {
      orderId: string
      customerId?: string
      totalAmount: number
      taxAmount: number
      paymentMethod: string
      saleDate: string
    }
  ): Promise<ServiceResult<JournalEntry>> {
    try {
      console.log('💰 Creating sales journal entry for order:', salesData.orderId)
      
      const journalLines = []
      
      // Debit: Cash/Accounts Receivable
      if (salesData.paymentMethod === 'cash') {
        journalLines.push({
          accountCode: '1110', // Cash and Cash Equivalents
          debitAmount: salesData.totalAmount,
          description: `Cash sale - Order ${salesData.orderId}`,
          reference: salesData.orderId
        })
      } else {
        journalLines.push({
          accountCode: '1120', // Accounts Receivable
          debitAmount: salesData.totalAmount,
          description: `Credit sale - Order ${salesData.orderId}`,
          reference: salesData.orderId
        })
      }
      
      // Credit: Sales Revenue (net of tax)
      const revenueAmount = salesData.totalAmount - salesData.taxAmount
      journalLines.push({
        accountCode: '4111', // Food and Beverage Sales
        creditAmount: revenueAmount,
        description: `Revenue - Order ${salesData.orderId}`,
        reference: salesData.orderId
      })
      
      // Credit: Sales Tax Payable
      if (salesData.taxAmount > 0) {
        journalLines.push({
          accountCode: '2150', // Sales Tax Payable
          creditAmount: salesData.taxAmount,
          description: `Sales tax - Order ${salesData.orderId}`,
          reference: salesData.orderId
        })
      }
      
      return await this.createJournalEntry(organizationId, {
        reference: `Order-${salesData.orderId}`,
        description: `Sales transaction for order ${salesData.orderId}`,
        sourceDocument: 'sales_order',
        sourceId: salesData.orderId,
        entryDate: salesData.saleDate,
        lines: journalLines
      })
      
    } catch (error) {
      console.error('❌ Failed to create sales journal entry:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create sales journal entry'
      }
    }
  }
  
  /**
   * Generate trial balance report
   */
  static async generateTrialBalance(
    organizationId: string,
    asOfDate: string
  ): Promise<ServiceResult<FinancialReport>> {
    try {
      console.log('📊 Generating trial balance for organization:', organizationId)
      
      // Get chart of accounts with current balances
      const chartResult = await this.getChartOfAccounts(organizationId)
      if (!chartResult.success || !chartResult.data) {
        throw new Error('Failed to fetch chart of accounts')
      }
      
      // Filter posting accounts and calculate totals
      const postingAccounts = chartResult.data.filter(acc => acc.isPosting)
      
      let totalDebits = 0
      let totalCredits = 0
      
      const reportData: FinancialReportData[] = postingAccounts.map(account => {
        const debitBalance = account.accountType === 'Assets' || account.accountType === 'Expense' 
          ? Math.max(0, account.balance) : 0
        const creditBalance = account.accountType === 'Liabilities' || account.accountType === 'Equity' || account.accountType === 'Income'
          ? Math.max(0, account.balance) : 0
        
        totalDebits += debitBalance
        totalCredits += creditBalance
        
        return {
          accountCode: account.accountCode,
          accountName: account.accountName,
          accountType: account.accountType,
          debitBalance: debitBalance,
          creditBalance: creditBalance,
          netBalance: account.balance,
          level: account.level
        }
      })
      
      // Add totals row
      reportData.push({
        accountCode: 'TOTAL',
        accountName: 'TOTAL',
        accountType: 'Total',
        debitBalance: totalDebits,
        creditBalance: totalCredits,
        netBalance: totalDebits - totalCredits,
        level: 0
      })
      
      const trialBalance: FinancialReport = {
        reportType: 'trial_balance',
        organizationId: organizationId,
        periodStart: '2024-01-01',
        periodEnd: asOfDate,
        data: reportData,
        generatedAt: new Date().toISOString()
      }
      
      console.log('✅ Trial balance generated successfully')
      
      return {
        success: true,
        data: trialBalance
      }
      
    } catch (error) {
      console.error('❌ Failed to generate trial balance:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate trial balance'
      }
    }
  }
  
  /**
   * Initialize sample financial data
   */
  static async initializeFinancialData(organizationId: string): Promise<ServiceResult> {
    try {
      console.log('🏦 Initializing financial accounting data for organization:', organizationId)
      
      // Initialize chart of accounts
      const chartResult = await this.initializeChartOfAccounts(organizationId)
      if (!chartResult.success) {
        throw new Error(chartResult.error || 'Failed to initialize chart of accounts')
      }
      
      // Create sample journal entries
      const sampleEntries = [
        // Opening balances
        {
          reference: 'OPENING-001',
          description: 'Opening balance - Cash',
          sourceDocument: 'opening_balance',
          sourceId: 'opening-001',
          entryDate: '2024-01-01',
          lines: [
            { accountCode: '1110', debitAmount: 5000, description: 'Opening cash balance' },
            { accountCode: '3110', creditAmount: 5000, description: 'Owner capital contribution' }
          ]
        },
        // Sample sales transaction
        {
          reference: 'SALES-001',
          description: 'Tea and pastry sales',
          sourceDocument: 'sales_order',
          sourceId: 'order-001',
          entryDate: '2024-01-15',
          lines: [
            { accountCode: '1110', debitAmount: 23.75, description: 'Cash received from customer' },
            { accountCode: '4111', creditAmount: 21.94, description: 'Food and beverage sales' },
            { accountCode: '2150', creditAmount: 1.81, description: 'Sales tax collected' }
          ]
        },
        // Sample expense transaction
        {
          reference: 'EXP-001',
          description: 'Monthly rent payment',
          sourceDocument: 'expense',
          sourceId: 'rent-001',
          entryDate: '2024-01-01',
          lines: [
            { accountCode: '5240', debitAmount: 2000, description: 'Monthly rent expense' },
            { accountCode: '1110', creditAmount: 2000, description: 'Cash payment for rent' }
          ]
        }
      ]
      
      let entriesCreated = 0
      
      for (const entryData of sampleEntries) {
        const entryResult = await this.createJournalEntry(organizationId, entryData)
        if (entryResult.success) {
          entriesCreated++
        }
      }
      
      console.log(`✅ Financial data initialized with ${entriesCreated} journal entries`)
      
      return {
        success: true,
        data: { 
          chartOfAccountsCreated: chartResult.data?.createdCount || 0,
          journalEntriesCreated: entriesCreated 
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to initialize financial data:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initialize financial data'
      }
    }
  }
}

export default FinancialAccountingService