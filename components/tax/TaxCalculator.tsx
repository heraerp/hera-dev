/**
 * Generic Tax Calculator Component
 * Supports multiple countries with configurable tax systems
 */

"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  IndianTaxCalculator, 
  TaxBreakdown, 
  getCountryTaxConfig,
  CountryTaxConfig 
} from '@/lib/tax/IndianTaxConfig';
import { Calculator, FileText, Info } from 'lucide-react';

export interface TaxCalculatorProps {
  subtotal: number;
  items?: Array<{
    name: string;
    category: string;
    amount: number;
    quantity?: number;
    unitPrice?: number;
  }>;
  countryCode?: string;
  isInterState?: boolean;
  customerDetails?: {
    gstin?: string;
    state?: string;
  };
  restaurantDetails?: {
    gstin?: string;
    state?: string;
  };
  onTaxCalculated?: (taxBreakdown: TaxBreakdown) => void;
  showDetailedBreakdown?: boolean;
  compactMode?: boolean;
}

export default function TaxCalculator({
  subtotal,
  items = [],
  countryCode = 'IN',
  isInterState = false,
  customerDetails,
  restaurantDetails,
  onTaxCalculated,
  showDetailedBreakdown = false,
  compactMode = false
}: TaxCalculatorProps) {
  const taxConfig: CountryTaxConfig = getCountryTaxConfig(countryCode);
  const calculator = taxConfig.taxCalculator as IndianTaxCalculator;
  
  // Calculate taxes based on items or subtotal
  const taxBreakdown: TaxBreakdown = React.useMemo(() => {
    let breakdown: TaxBreakdown;
    
    if (items.length > 0) {
      // Calculate for mixed categories
      const taxItems = items.map(item => ({
        category: item.category || 'restaurant_service',
        amount: item.amount
      }));
      breakdown = calculator.calculateMixedCategoryTax(taxItems, isInterState);
    } else {
      // Calculate for single category
      breakdown = calculator.calculateGST(subtotal, isInterState);
    }
    
    return breakdown;
  }, [subtotal, items, isInterState, calculator]);
  
  // Call callback when tax is calculated
  React.useEffect(() => {
    if (onTaxCalculated) {
      onTaxCalculated(taxBreakdown);
    }
  }, [taxBreakdown, onTaxCalculated]);
  
  const formatCurrency = (amount: number) => {
    return `${taxConfig.currencySymbol}${amount.toFixed(2)}`;
  };
  
  const formatTaxDisplay = calculator.formatTaxDisplay(taxBreakdown);
  
  // Determine transaction type for display
  const getTransactionType = () => {
    if (countryCode === 'IN') {
      return isInterState ? 'Inter-State (IGST)' : 'Intra-State (CGST + SGST)';
    }
    return 'Standard Tax';
  };
  
  if (compactMode) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal:</span>
          <span>{formatCurrency(taxBreakdown.subtotal)}</span>
        </div>
        
        {taxBreakdown.components.map((component, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span>{component.name} ({(component.rate * 100).toFixed(1)}%):</span>
            <span>{formatCurrency(taxBreakdown.subtotal * component.rate)}</span>
          </div>
        ))}
        
        <Separator />
        
        <div className="flex justify-between font-semibold">
          <span>Total:</span>
          <span className="text-green-600">{formatCurrency(taxBreakdown.total)}</span>
        </div>
      </div>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Calculator className="w-5 h-5 mr-2" />
          Tax Calculation
          <Badge variant="outline" className="ml-2">
            {countryCode}
          </Badge>
        </CardTitle>
        <div className="text-sm text-gray-600">
          {getTransactionType()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Basic Tax Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="font-medium">Subtotal:</span>
            <span>{formatCurrency(taxBreakdown.subtotal)}</span>
          </div>
          
          {taxBreakdown.components.map((component, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="flex items-center">
                {component.name} ({(component.rate * 100).toFixed(1)}%)
                {component.accountCode && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {component.accountCode}
                  </Badge>
                )}
              </span>
              <span>{formatCurrency(taxBreakdown.subtotal * component.rate)}</span>
            </div>
          ))}
          
          <Separator />
          
          <div className="flex justify-between text-lg font-bold">
            <span>Total Amount:</span>
            <span className="text-green-600">{formatCurrency(taxBreakdown.total)}</span>
          </div>
        </div>
        
        {/* Detailed Breakdown */}
        {showDetailedBreakdown && items.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Detailed Item Breakdown
            </h4>
            <div className="space-y-2">
              {items.map((item, index) => {
                const itemTax = calculator.calculateGST(item.amount, isInterState, item.category);
                return (
                  <div key={index} className="flex justify-between text-sm">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      {item.quantity && item.unitPrice && (
                        <span className="text-gray-500 ml-2">
                          ({item.quantity} × {formatCurrency(item.unitPrice)})
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div>{formatCurrency(item.amount)}</div>
                      <div className="text-xs text-gray-500">
                        +{formatCurrency(itemTax.totalTax)} tax
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Tax Information */}
        {countryCode === 'IN' && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start">
              <Info className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
              <div className="text-sm text-blue-800">
                <div className="font-medium">GST Information</div>
                <div className="mt-1">
                  • Restaurant services are taxed at 5% GST as per Indian GST law
                  {isInterState ? (
                    <div>• Inter-state transaction: 5% IGST applicable</div>
                  ) : (
                    <div>• Intra-state transaction: 2.5% CGST + 2.5% SGST</div>
                  )}
                  {restaurantDetails?.gstin && (
                    <div>• Restaurant GSTIN: {restaurantDetails.gstin}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Customer GST Details */}
        {customerDetails?.gstin && (
          <div className="mt-3 p-3 bg-green-50 rounded-lg">
            <div className="text-sm text-green-800">
              <div className="font-medium">Customer GST Details</div>
              <div className="mt-1">
                • Customer GSTIN: {customerDetails.gstin}
                {customerDetails.state && (
                  <div>• State: {customerDetails.state}</div>
                )}
                • Invoice Type: B2B (Business to Business)
              </div>
            </div>
          </div>
        )}
        
        {/* Total Tax Summary */}
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <div className="text-sm">
            <div className="font-medium mb-2">Tax Summary</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-600">Effective Tax Rate:</span>
                <span className="font-medium ml-2">
                  {((taxBreakdown.totalTax / taxBreakdown.subtotal) * 100).toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-gray-600">Total Tax Amount:</span>
                <span className="font-medium ml-2 text-red-600">
                  {formatCurrency(taxBreakdown.totalTax)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Export utility functions
export const useTaxCalculation = (
  subtotal: number,
  countryCode: string = 'IN',
  isInterState: boolean = false,
  category: string = 'restaurant_service'
) => {
  const taxConfig = getCountryTaxConfig(countryCode);
  const calculator = taxConfig.taxCalculator as IndianTaxCalculator;
  
  return React.useMemo(() => {
    return calculator.calculateGST(subtotal, isInterState, category);
  }, [subtotal, isInterState, category, calculator]);
};

export const formatIndianCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const getTaxDisplayText = (countryCode: string = 'IN') => {
  const config = getCountryTaxConfig(countryCode);
  return config.taxDisplayFormat.replace('{rate}', (config.defaultTaxRate * 100).toString());
};