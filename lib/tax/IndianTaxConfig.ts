/**
 * Indian Tax Configuration System
 * Comprehensive GST implementation for restaurant operations
 */

export interface TaxRate {
  rate: number; // Tax rate as decimal (e.g., 0.05 for 5%)
  description: string;
  applicableFrom: string; // ISO date string
  applicableTo?: string; // ISO date string, undefined for current
}

export interface TaxComponent {
  code: string;
  name: string;
  rate: number;
  description: string;
  accountCode?: string; // For accounting integration
}

export interface TaxBreakdown {
  subtotal: number;
  totalTax: number;
  total: number;
  components: TaxComponent[];
}

export interface IndianGSTConfig {
  // Restaurant GST Rate (5% as per Indian GST rules for restaurants)
  restaurantGSTRate: number;
  
  // GST Components for restaurants
  gstComponents: {
    cgst: TaxComponent;
    sgst: TaxComponent;
    igst?: TaxComponent; // For inter-state transactions
  };
  
  // Different tax rates for different item categories
  itemCategoryRates: {
    [category: string]: TaxRate;
  };
  
  // HSN codes for restaurant items
  hsnCodes: {
    [category: string]: string;
  };
  
  // Tax exemptions
  exemptions: {
    [condition: string]: boolean;
  };
}

// Indian GST Configuration for Restaurants
export const INDIAN_GST_CONFIG: IndianGSTConfig = {
  // 5% GST for restaurant services as per Indian GST law
  restaurantGSTRate: 0.05,
  
  gstComponents: {
    // CGST - Central Goods and Services Tax (2.5%)
    cgst: {
      code: 'CGST',
      name: 'Central GST',
      rate: 0.025, // 2.5%
      description: 'Central Goods and Services Tax',
      accountCode: '2110001' // CGST Payable account
    },
    
    // SGST - State Goods and Services Tax (2.5%)
    sgst: {
      code: 'SGST',
      name: 'State GST',
      rate: 0.025, // 2.5%
      description: 'State Goods and Services Tax',
      accountCode: '2110002' // SGST Payable account
    },
    
    // IGST - Integrated GST (5%) - for inter-state transactions
    igst: {
      code: 'IGST',
      name: 'Integrated GST',
      rate: 0.05, // 5%
      description: 'Integrated Goods and Services Tax',
      accountCode: '2110003' // IGST Payable account
    }
  },
  
  // Different rates for different categories (if needed in future)
  itemCategoryRates: {
    // Restaurant services - 5% GST
    'restaurant_service': {
      rate: 0.05,
      description: 'Restaurant services (dine-in, takeaway, delivery)',
      applicableFrom: '2017-07-01' // GST implementation date in India
    },
    
    // Packaged food items - 5% GST
    'packaged_food': {
      rate: 0.05,
      description: 'Packaged food items',
      applicableFrom: '2017-07-01'
    },
    
    // Beverages - 5% GST (non-alcoholic)
    'beverages': {
      rate: 0.05,
      description: 'Non-alcoholic beverages',
      applicableFrom: '2017-07-01'
    },
    
    // Alcoholic beverages - Variable (state-specific)
    'alcoholic_beverages': {
      rate: 0.28, // 28% (example - varies by state)
      description: 'Alcoholic beverages',
      applicableFrom: '2017-07-01'
    }
  },
  
  // HSN (Harmonized System of Nomenclature) codes
  hsnCodes: {
    'restaurant_service': '996331', // Restaurant services
    'packaged_food': '2106', // Food preparations
    'beverages': '2202', // Non-alcoholic beverages
    'alcoholic_beverages': '2208', // Alcoholic beverages
    'ice_cream': '2105', // Ice cream and frozen desserts
    'bakery_items': '1905', // Bakery products
    'dairy_products': '0401', // Dairy products
    'meat_products': '0201', // Meat and meat products
    'seafood': '0302', // Seafood
    'vegetables': '0701', // Vegetables
    'fruits': '0801', // Fruits
    'spices': '0904', // Spices and condiments
    'tea_coffee': '0902' // Tea and coffee
  },
  
  // Tax exemptions and special conditions
  exemptions: {
    'annual_turnover_below_20_lakh': false, // Not applicable for most restaurants
    'composition_scheme': false, // Restaurants typically don't qualify
    'export_services': true, // Export services are zero-rated
    'charitable_organization': true // Charitable organizations may be exempt
  }
};

// Tax calculation utilities
export class IndianTaxCalculator {
  private config: IndianGSTConfig;
  
  constructor(config: IndianGSTConfig = INDIAN_GST_CONFIG) {
    this.config = config;
  }
  
  /**
   * Calculate GST for restaurant items
   * @param subtotal - Pre-tax amount
   * @param isInterState - Whether transaction is inter-state
   * @param category - Item category for specific rates
   * @returns Tax breakdown
   */
  calculateGST(
    subtotal: number, 
    isInterState: boolean = false, 
    category: string = 'restaurant_service'
  ): TaxBreakdown {
    const categoryRate = this.config.itemCategoryRates[category];
    const taxRate = categoryRate?.rate || this.config.restaurantGSTRate;
    
    if (isInterState) {
      // Inter-state transaction - use IGST
      const igst = this.config.gstComponents.igst!;
      const taxAmount = subtotal * taxRate;
      
      return {
        subtotal,
        totalTax: taxAmount,
        total: subtotal + taxAmount,
        components: [
          {
            ...igst,
            rate: taxRate // Use the applicable rate
          }
        ]
      };
    } else {
      // Intra-state transaction - use CGST + SGST
      const cgst = this.config.gstComponents.cgst;
      const sgst = this.config.gstComponents.sgst;
      const halfRate = taxRate / 2;
      
      const cgstAmount = subtotal * halfRate;
      const sgstAmount = subtotal * halfRate;
      const totalTax = cgstAmount + sgstAmount;
      
      return {
        subtotal,
        totalTax,
        total: subtotal + totalTax,
        components: [
          {
            ...cgst,
            rate: halfRate
          },
          {
            ...sgst,
            rate: halfRate
          }
        ]
      };
    }
  }
  
  /**
   * Calculate tax for mixed categories
   * @param items - Array of items with category and amount
   * @param isInterState - Whether transaction is inter-state
   * @returns Tax breakdown
   */
  calculateMixedCategoryTax(
    items: Array<{ category: string; amount: number; hsnCode?: string }>,
    isInterState: boolean = false
  ): TaxBreakdown {
    let totalSubtotal = 0;
    let totalTax = 0;
    const componentMap = new Map<string, TaxComponent>();
    
    for (const item of items) {
      const itemTax = this.calculateGST(item.amount, isInterState, item.category);
      totalSubtotal += itemTax.subtotal;
      totalTax += itemTax.totalTax;
      
      // Aggregate tax components
      for (const component of itemTax.components) {
        const existing = componentMap.get(component.code);
        if (existing) {
          existing.rate += component.rate;
        } else {
          componentMap.set(component.code, { ...component });
        }
      }
    }
    
    return {
      subtotal: totalSubtotal,
      totalTax,
      total: totalSubtotal + totalTax,
      components: Array.from(componentMap.values())
    };
  }
  
  /**
   * Get HSN code for category
   * @param category - Item category
   * @returns HSN code
   */
  getHSNCode(category: string): string {
    return this.config.hsnCodes[category] || '996331'; // Default to restaurant services
  }
  
  /**
   * Format tax for display
   * @param taxBreakdown - Tax calculation result
   * @returns Formatted tax information
   */
  formatTaxDisplay(taxBreakdown: TaxBreakdown): {
    subtotal: string;
    taxLines: Array<{ label: string; amount: string }>;
    total: string;
  } {
    const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;
    
    const taxLines = taxBreakdown.components.map(component => ({
      label: `${component.name} (${(component.rate * 100).toFixed(1)}%)`,
      amount: formatCurrency(taxBreakdown.subtotal * component.rate)
    }));
    
    return {
      subtotal: formatCurrency(taxBreakdown.subtotal),
      taxLines,
      total: formatCurrency(taxBreakdown.total)
    };
  }
  
  /**
   * Generate tax invoice data for Indian GST compliance
   * @param orderData - Order information
   * @param taxBreakdown - Tax calculation
   * @returns GST invoice data
   */
  generateGSTInvoiceData(orderData: any, taxBreakdown: TaxBreakdown): any {
    return {
      invoiceNumber: orderData.orderNumber,
      invoiceDate: new Date().toISOString().split('T')[0],
      supplierGSTIN: orderData.restaurant.gstin || 'GSTIN_NOT_SET',
      customerGSTIN: orderData.customer.gstin || null,
      placeOfSupply: orderData.restaurant.state || 'State_Not_Set',
      reverseCharge: 'N',
      invoiceType: 'B2C', // Business to Consumer
      ecommerceGSTIN: null,
      items: orderData.items.map((item: any, index: number) => ({
        slNo: index + 1,
        productDescription: item.name,
        hsnCode: this.getHSNCode(item.category || 'restaurant_service'),
        quantity: item.quantity,
        unit: 'NOS',
        unitPrice: item.unitPrice,
        totalAmount: item.totalPrice,
        discount: 0,
        taxableAmount: item.totalPrice,
        cgstRate: taxBreakdown.components.find(c => c.code === 'CGST')?.rate * 100 || 0,
        cgstAmount: item.totalPrice * (taxBreakdown.components.find(c => c.code === 'CGST')?.rate || 0),
        sgstRate: taxBreakdown.components.find(c => c.code === 'SGST')?.rate * 100 || 0,
        sgstAmount: item.totalPrice * (taxBreakdown.components.find(c => c.code === 'SGST')?.rate || 0),
        igstRate: taxBreakdown.components.find(c => c.code === 'IGST')?.rate * 100 || 0,
        igstAmount: item.totalPrice * (taxBreakdown.components.find(c => c.code === 'IGST')?.rate || 0),
        cessRate: 0,
        cessAmount: 0,
        totalItemValue: item.totalPrice + (item.totalPrice * (taxBreakdown.totalTax / taxBreakdown.subtotal))
      })),
      totalTaxableAmount: taxBreakdown.subtotal,
      totalCGST: taxBreakdown.subtotal * (taxBreakdown.components.find(c => c.code === 'CGST')?.rate || 0),
      totalSGST: taxBreakdown.subtotal * (taxBreakdown.components.find(c => c.code === 'SGST')?.rate || 0),
      totalIGST: taxBreakdown.subtotal * (taxBreakdown.components.find(c => c.code === 'IGST')?.rate || 0),
      totalCess: 0,
      totalInvoiceValue: taxBreakdown.total,
      roundOff: 0,
      paymentTerms: 'Immediate',
      additionalInfo: 'Restaurant service as per GST provisions'
    };
  }
}

// Export singleton instance
export const indianTaxCalculator = new IndianTaxCalculator();

// Country-specific tax configurations
export const TAX_CONFIGURATIONS = {
  IN: INDIAN_GST_CONFIG,
  // Add other countries as needed
  US: {
    // US tax configuration would go here
  },
  UK: {
    // UK VAT configuration would go here
  }
};

// Generic tax interface for multi-country support
export interface CountryTaxConfig {
  countryCode: string;
  currencySymbol: string;
  taxCalculator: any;
  defaultTaxRate: number;
  taxDisplayFormat: string;
}

export const getCountryTaxConfig = (countryCode: string = 'IN'): CountryTaxConfig => {
  switch (countryCode) {
    case 'IN':
      return {
        countryCode: 'IN',
        currencySymbol: '₹',
        taxCalculator: indianTaxCalculator,
        defaultTaxRate: 0.05,
        taxDisplayFormat: 'GST ({rate}%)'
      };
    default:
      return {
        countryCode: 'IN',
        currencySymbol: '₹',
        taxCalculator: indianTaxCalculator,
        defaultTaxRate: 0.05,
        taxDisplayFormat: 'GST ({rate}%)'
      };
  }
};