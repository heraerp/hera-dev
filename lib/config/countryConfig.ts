/**
 * Country Configuration
 * Centralized country settings for the application
 */

export interface CountryConfig {
  code: string;
  name: string;
  currency: {
    code: string;
    symbol: string;
    position: 'before' | 'after';
  };
  tax: {
    name: string;
    rate: number;
    displayFormat: string;
  };
  locale: string;
  dateFormat: string;
  phoneFormat: string;
  addressFormat: string[];
}

export const COUNTRY_CONFIGS: Record<string, CountryConfig> = {
  IN: {
    code: 'IN',
    name: 'India',
    currency: {
      code: 'INR',
      symbol: '₹',
      position: 'before'
    },
    tax: {
      name: 'GST',
      rate: 0.05, // 5% for restaurants
      displayFormat: 'GST (5%)'
    },
    locale: 'en-IN',
    dateFormat: 'dd/MM/yyyy',
    phoneFormat: '+91 XXXXX XXXXX',
    addressFormat: ['street', 'city', 'state', 'pincode', 'country']
  },
  US: {
    code: 'US',
    name: 'United States',
    currency: {
      code: 'USD',
      symbol: '$',
      position: 'before'
    },
    tax: {
      name: 'Sales Tax',
      rate: 0.08, // Varies by state
      displayFormat: 'Sales Tax (8%)'
    },
    locale: 'en-US',
    dateFormat: 'MM/dd/yyyy',
    phoneFormat: '+1 (XXX) XXX-XXXX',
    addressFormat: ['street', 'city', 'state', 'zipcode', 'country']
  },
  UK: {
    code: 'UK',
    name: 'United Kingdom',
    currency: {
      code: 'GBP',
      symbol: '£',
      position: 'before'
    },
    tax: {
      name: 'VAT',
      rate: 0.20, // 20% VAT
      displayFormat: 'VAT (20%)'
    },
    locale: 'en-GB',
    dateFormat: 'dd/MM/yyyy',
    phoneFormat: '+44 XXXX XXXXXX',
    addressFormat: ['street', 'city', 'county', 'postcode', 'country']
  }
};

// Default country (India for initial deployment)
export const DEFAULT_COUNTRY = 'IN';

// Get country configuration
export const getCountryConfig = (countryCode: string = DEFAULT_COUNTRY): CountryConfig => {
  return COUNTRY_CONFIGS[countryCode] || COUNTRY_CONFIGS[DEFAULT_COUNTRY];
};

// Format currency based on country
export const formatCurrency = (amount: number, countryCode: string = DEFAULT_COUNTRY): string => {
  const config = getCountryConfig(countryCode);
  const formatted = new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
  
  return formatted;
};

// Format date based on country
export const formatDate = (date: Date, countryCode: string = DEFAULT_COUNTRY): string => {
  const config = getCountryConfig(countryCode);
  return new Intl.DateTimeFormat(config.locale).format(date);
};

// Get tax display text
export const getTaxDisplayText = (countryCode: string = DEFAULT_COUNTRY): string => {
  const config = getCountryConfig(countryCode);
  return config.tax.displayFormat;
};

// Environment variable for country setting
export const getConfiguredCountry = (): string => {
  // In production, this could be set via environment variable
  return process.env.NEXT_PUBLIC_COUNTRY_CODE || DEFAULT_COUNTRY;
};