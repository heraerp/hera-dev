export interface RestaurantAccountingConfig {
  organizationId: string
  defaultTaxRate: number
  revenueRecognition: 'immediate' | 'deferred'
  currencyCode: string
  fiscalYearStart: string
  autoPostingEnabled: boolean
  aiConfidenceThreshold: number
  manualReviewRequired: boolean
  
  accountMappings: {
    cashAccount: string
    revenueAccount: string
    taxAccount: string
    discountAccount: string
    serviceChargeAccount: string
    creditCardAccount: string
    upiAccount: string
    digitalWalletAccount: string
  }
  
  classificationRules: {
    foodItems: { account: string; category: string }
    beverageItems: { account: string; category: string }
    deliveryCharges: { account: string; category: string }
    serviceCharges: { account: string; category: string }
    cateringOrders: { account: string; category: string }
  }
  
  paymentMethodMapping: {
    cash: string
    credit_card: string
    debit_card: string
    upi_gpay: string
    upi_phonepe: string
    upi_paytm: string
    digital_wallet: string
  }
  
  taxConfiguration: {
    cgst: { rate: number; account: string }
    sgst: { rate: number; account: string }
    igst: { rate: number; account: string }
    cess: { rate: number; account: string }
  }
  
  businessRules: {
    largeOrderThreshold: number
    cashPaymentLimit: number
    discountApprovalLimit: number
    refundApprovalLimit: number
    autoReleaseAmountLimit: number
  }
}

const DEFAULT_RESTAURANT_CONFIG: Omit<RestaurantAccountingConfig, 'organizationId'> = {
  defaultTaxRate: 18, // 18% GST for India
  revenueRecognition: 'immediate',
  currencyCode: 'INR',
  fiscalYearStart: '04-01', // April 1st for India
  autoPostingEnabled: true,
  aiConfidenceThreshold: 0.85,
  manualReviewRequired: false,
  
  accountMappings: {
    cashAccount: '1110000',           // Cash in Hand
    revenueAccount: '4110000',        // Food Sales
    taxAccount: '2110001',            // CGST Payable
    discountAccount: '5110000',       // Sales Discounts
    serviceChargeAccount: '4140000',  // Service Charges
    creditCardAccount: '1120000',     // Credit Card Receivable
    upiAccount: '1121000',            // UPI Collections
    digitalWalletAccount: '1122000'   // Digital Wallet
  },
  
  classificationRules: {
    foodItems: { 
      account: '4110000', 
      category: 'food_sales' 
    },
    beverageItems: { 
      account: '4120000', 
      category: 'beverage_sales' 
    },
    deliveryCharges: { 
      account: '4130000', 
      category: 'delivery_revenue' 
    },
    serviceCharges: { 
      account: '4140000', 
      category: 'service_revenue' 
    },
    cateringOrders: { 
      account: '4150000', 
      category: 'catering_revenue' 
    }
  },
  
  paymentMethodMapping: {
    cash: '1110000',              // Cash in Hand
    credit_card: '1120000',       // Credit Card Receivable
    debit_card: '1120001',        // Debit Card Receivable
    upi_gpay: '1121001',          // UPI Collections - GPay
    upi_phonepe: '1121002',       // UPI Collections - PhonePe
    upi_paytm: '1121003',         // UPI Collections - Paytm
    digital_wallet: '1122000'     // Digital Wallet
  },
  
  taxConfiguration: {
    cgst: { rate: 9, account: '2110001' },    // CGST Payable
    sgst: { rate: 9, account: '2110002' },    // SGST Payable
    igst: { rate: 18, account: '2110003' },   // IGST Payable
    cess: { rate: 0, account: '2110005' }     // Cess Payable
  },
  
  businessRules: {
    largeOrderThreshold: 5000,        // Orders > ₹5000 are considered large
    cashPaymentLimit: 2000,           // Cash payments > ₹2000 need approval
    discountApprovalLimit: 500,       // Discounts > ₹500 need approval
    refundApprovalLimit: 1000,        // Refunds > ₹1000 need approval
    autoReleaseAmountLimit: 10000     // Auto-release only for amounts ≤ ₹10000
  }
}

/**
 * Get restaurant accounting configuration
 * In production, this would load from database based on organization
 */
export async function getRestaurantAccountingConfig(organizationId: string): Promise<RestaurantAccountingConfig> {
  // TODO: Load from database based on organization
  // For now, return default configuration
  
  return {
    organizationId,
    ...DEFAULT_RESTAURANT_CONFIG
  }
}

/**
 * Update restaurant accounting configuration
 */
export async function updateRestaurantAccountingConfig(
  organizationId: string, 
  updates: Partial<RestaurantAccountingConfig>
): Promise<RestaurantAccountingConfig> {
  // TODO: Save to database
  const currentConfig = await getRestaurantAccountingConfig(organizationId)
  
  return {
    ...currentConfig,
    ...updates,
    organizationId // Ensure organizationId is not overwritten
  }
}

/**
 * Get account mapping for specific transaction type
 */
export function getAccountMapping(
  config: RestaurantAccountingConfig, 
  transactionType: string,
  itemCategory?: string
): { debitAccount: string; creditAccount: string } {
  
  switch (transactionType) {
    case 'food_sale':
      return {
        debitAccount: config.accountMappings.cashAccount,
        creditAccount: config.classificationRules.foodItems.account
      }
      
    case 'beverage_sale':
      return {
        debitAccount: config.accountMappings.cashAccount,
        creditAccount: config.classificationRules.beverageItems.account
      }
      
    case 'delivery_charge':
      return {
        debitAccount: config.accountMappings.cashAccount,
        creditAccount: config.classificationRules.deliveryCharges.account
      }
      
    case 'service_charge':
      return {
        debitAccount: config.accountMappings.cashAccount,
        creditAccount: config.classificationRules.serviceCharges.account
      }
      
    case 'tax_collection':
      return {
        debitAccount: config.accountMappings.cashAccount,
        creditAccount: config.accountMappings.taxAccount
      }
      
    case 'discount_given':
      return {
        debitAccount: config.accountMappings.discountAccount,
        creditAccount: config.accountMappings.revenueAccount
      }
      
    default:
      return {
        debitAccount: config.accountMappings.cashAccount,
        creditAccount: config.accountMappings.revenueAccount
      }
  }
}

/**
 * Get payment method account
 */
export function getPaymentMethodAccount(
  config: RestaurantAccountingConfig, 
  paymentMethod: string
): string {
  return config.paymentMethodMapping[paymentMethod] || config.accountMappings.cashAccount
}

/**
 * Calculate tax breakdown
 */
export function calculateTaxBreakdown(
  config: RestaurantAccountingConfig, 
  totalAmount: number,
  isInterState: boolean = false
): { cgst: number; sgst: number; igst: number; cess: number } {
  
  const taxableAmount = totalAmount / (1 + (config.defaultTaxRate / 100))
  const totalTax = totalAmount - taxableAmount
  
  if (isInterState) {
    return {
      cgst: 0,
      sgst: 0,
      igst: totalTax,
      cess: 0
    }
  } else {
    return {
      cgst: totalTax / 2,
      sgst: totalTax / 2,
      igst: 0,
      cess: 0
    }
  }
}

/**
 * Validate business rules
 */
export function validateBusinessRules(
  config: RestaurantAccountingConfig,
  transaction: {
    amount: number
    paymentMethod: string
    discountAmount: number
    transactionType: string
  }
): { isValid: boolean; warnings: string[]; errors: string[] } {
  
  const warnings: string[] = []
  const errors: string[] = []
  
  // Check large order threshold
  if (transaction.amount > config.businessRules.largeOrderThreshold) {
    warnings.push(`Large order: Amount ₹${transaction.amount} exceeds threshold of ₹${config.businessRules.largeOrderThreshold}`)
  }
  
  // Check cash payment limit
  if (transaction.paymentMethod === 'cash' && transaction.amount > config.businessRules.cashPaymentLimit) {
    warnings.push(`Large cash payment: Amount ₹${transaction.amount} exceeds limit of ₹${config.businessRules.cashPaymentLimit}`)
  }
  
  // Check discount approval limit
  if (transaction.discountAmount > config.businessRules.discountApprovalLimit) {
    errors.push(`Discount approval required: Amount ₹${transaction.discountAmount} exceeds limit of ₹${config.businessRules.discountApprovalLimit}`)
  }
  
  // Check auto-release limit
  if (transaction.amount > config.businessRules.autoReleaseAmountLimit) {
    warnings.push(`Manual review required: Amount ₹${transaction.amount} exceeds auto-release limit of ₹${config.businessRules.autoReleaseAmountLimit}`)
  }
  
  return {
    isValid: errors.length === 0,
    warnings,
    errors
  }
}

/**
 * Get chart of accounts for restaurant
 */
export function getRestaurantChartOfAccounts(): Array<{
  code: string
  name: string
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE'
  category: string
}> {
  return [
    // Assets
    { code: '1110000', name: 'Cash in Hand', type: 'ASSET', category: 'current_assets' },
    { code: '1120000', name: 'Credit Card Receivable', type: 'ASSET', category: 'current_assets' },
    { code: '1120001', name: 'Debit Card Receivable', type: 'ASSET', category: 'current_assets' },
    { code: '1121000', name: 'UPI Collections', type: 'ASSET', category: 'current_assets' },
    { code: '1121001', name: 'UPI Collections - GPay', type: 'ASSET', category: 'current_assets' },
    { code: '1121002', name: 'UPI Collections - PhonePe', type: 'ASSET', category: 'current_assets' },
    { code: '1121003', name: 'UPI Collections - Paytm', type: 'ASSET', category: 'current_assets' },
    { code: '1122000', name: 'Digital Wallet', type: 'ASSET', category: 'current_assets' },
    { code: '1130000', name: 'Inventory - Food', type: 'ASSET', category: 'current_assets' },
    { code: '1130001', name: 'Inventory - Beverages', type: 'ASSET', category: 'current_assets' },
    
    // Liabilities
    { code: '2110001', name: 'CGST Payable', type: 'LIABILITY', category: 'current_liabilities' },
    { code: '2110002', name: 'SGST Payable', type: 'LIABILITY', category: 'current_liabilities' },
    { code: '2110003', name: 'IGST Payable', type: 'LIABILITY', category: 'current_liabilities' },
    { code: '2110005', name: 'Cess Payable', type: 'LIABILITY', category: 'current_liabilities' },
    
    // Revenue
    { code: '4110000', name: 'Food Sales', type: 'REVENUE', category: 'operating_revenue' },
    { code: '4120000', name: 'Beverage Sales', type: 'REVENUE', category: 'operating_revenue' },
    { code: '4130000', name: 'Delivery Revenue', type: 'REVENUE', category: 'operating_revenue' },
    { code: '4140000', name: 'Service Charges', type: 'REVENUE', category: 'operating_revenue' },
    { code: '4150000', name: 'Catering Revenue', type: 'REVENUE', category: 'operating_revenue' },
    
    // Expenses
    { code: '5110000', name: 'Sales Discounts', type: 'EXPENSE', category: 'operating_expenses' },
    { code: '5120000', name: 'Food Costs', type: 'EXPENSE', category: 'cost_of_goods_sold' },
    { code: '5130000', name: 'Beverage Costs', type: 'EXPENSE', category: 'cost_of_goods_sold' }
  ]
}

export default {
  getRestaurantAccountingConfig,
  updateRestaurantAccountingConfig,
  getAccountMapping,
  getPaymentMethodAccount,
  calculateTaxBreakdown,
  validateBusinessRules,
  getRestaurantChartOfAccounts
}