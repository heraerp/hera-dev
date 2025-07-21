/**
 * HERA Universal - Cash Market API Hook
 * 
 * React hook for interacting with cash market APIs
 * Provides typed methods for vendors, transactions, and receipts
 * Uses Mario's Restaurant organization for demo purposes
 */

import { useState, useCallback } from 'react';

// Mario's Restaurant Organization ID (from CLAUDE.md)
const DEMO_ORGANIZATION_ID = '123e4567-e89b-12d3-a456-426614174000';

// TypeScript interfaces
export interface CashMarketVendor {
  id: string;
  name: string;
  code: string;
  category: string;
  location: string;
  contact?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  rating?: number;
  totalTransactions?: number;
  totalSpent?: number;
  averageOrder?: number;
  reliability?: 'high' | 'medium' | 'low';
  priceRange?: 'budget' | 'moderate' | 'premium';
  specialties?: string[];
  lastTransaction?: string;
  paymentTerms?: string;
  status: string;
  notes?: string;
  aiValidation?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CashMarketTransaction {
  id: string;
  transactionNumber: string;
  date: string;
  type: 'expense' | 'replenishment' | 'advance';
  amount: number;
  currency: string;
  status: string;
  workflowStatus?: string;
  description: string;
  category: string;
  location?: string;
  items?: Array<{
    item: string;
    quantity: string;
    unitPrice: number;
    totalPrice: number;
  }>;
  submittedBy: string;
  aiConfidence?: number;
  receiptImageUrl?: string;
  notes?: string;
  vendor?: {
    vendorId: string;
    vendorName: string;
    vendorCode: string;
  };
  isFinancial: boolean;
  requiresApproval: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CashMarketReceipt {
  id: string;
  filename: string;
  code: string;
  imageUrl: string;
  uploadedBy: string;
  processingStatus: 'processing' | 'completed' | 'error' | 'needs_review';
  aiProcessingData?: any;
  vendor?: {
    id: string;
    name: string;
    code: string;
  };
  transactionId?: string;
  hasTransaction: boolean;
  notes?: string;
  confidence?: number;
  extractedAmount?: number;
  extractedVendor?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Response types
interface APIResponse<T> {
  data: T;
  summary?: any;
  pagination?: any;
}

interface APIError {
  error: string;
}

// Hook implementation
export function useCashMarketAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function for API calls
  const apiCall = useCallback(async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      const url = endpoint.includes('organizationId') 
        ? endpoint 
        : `${endpoint}${endpoint.includes('?') ? '&' : '?'}organizationId=${DEMO_ORGANIZATION_ID}`;

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData: APIError = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Vendor API methods
  const vendors = {
    // Get all vendors
    list: useCallback(async (filters?: {
      category?: string;
      search?: string;
    }): Promise<APIResponse<CashMarketVendor[]>> => {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.search) params.append('search', filters.search);
      
      return apiCall(`/api/cash-market/vendors?${params.toString()}`);
    }, [apiCall]),

    // Get single vendor
    get: useCallback(async (id: string): Promise<APIResponse<CashMarketVendor>> => {
      return apiCall(`/api/cash-market/vendors/${id}`);
    }, [apiCall]),

    // Create vendor
    create: useCallback(async (vendorData: {
      name: string;
      category: string;
      location: string;
      contact?: any;
      priceRange?: string;
      specialties?: string[];
      paymentTerms?: string;
      notes?: string;
    }): Promise<APIResponse<{ id: string; name: string; code: string }>> => {
      return apiCall('/api/cash-market/vendors', {
        method: 'POST',
        body: JSON.stringify({
          organizationId: DEMO_ORGANIZATION_ID,
          ...vendorData,
        }),
      });
    }, [apiCall]),

    // Update vendor
    update: useCallback(async (id: string, updates: Partial<CashMarketVendor>): Promise<APIResponse<any>> => {
      return apiCall(`/api/cash-market/vendors/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          organizationId: DEMO_ORGANIZATION_ID,
          ...updates,
        }),
      });
    }, [apiCall]),

    // Delete vendor
    delete: useCallback(async (id: string): Promise<APIResponse<any>> => {
      return apiCall(`/api/cash-market/vendors/${id}`, {
        method: 'DELETE',
      });
    }, [apiCall]),
  };

  // Transaction API methods
  const transactions = {
    // Get all transactions
    list: useCallback(async (filters?: {
      vendorId?: string;
      type?: string;
      status?: string;
      dateFrom?: string;
      dateTo?: string;
      category?: string;
      limit?: number;
      offset?: number;
    }): Promise<APIResponse<CashMarketTransaction[]>> => {
      const params = new URLSearchParams();
      if (filters?.vendorId) params.append('vendorId', filters.vendorId);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());
      
      return apiCall(`/api/cash-market/transactions?${params.toString()}`);
    }, [apiCall]),

    // Get single transaction
    get: useCallback(async (id: string): Promise<APIResponse<CashMarketTransaction>> => {
      return apiCall(`/api/cash-market/transactions/${id}`);
    }, [apiCall]),

    // Create transaction
    create: useCallback(async (transactionData: {
      vendorId: string;
      receiptId?: string;
      type?: 'expense' | 'replenishment' | 'advance';
      amount: number;
      currency?: string;
      description: string;
      category: string;
      location?: string;
      items?: any[];
      submittedBy: string;
      aiConfidence?: number;
      receiptImageUrl?: string;
      notes?: string;
    }): Promise<APIResponse<any>> => {
      return apiCall('/api/cash-market/transactions', {
        method: 'POST',
        body: JSON.stringify({
          organizationId: DEMO_ORGANIZATION_ID,
          ...transactionData,
        }),
      });
    }, [apiCall]),

    // Update transaction
    update: useCallback(async (id: string, updates: Partial<CashMarketTransaction>): Promise<APIResponse<any>> => {
      return apiCall(`/api/cash-market/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          organizationId: DEMO_ORGANIZATION_ID,
          ...updates,
        }),
      });
    }, [apiCall]),

    // Delete transaction
    delete: useCallback(async (id: string): Promise<APIResponse<any>> => {
      return apiCall(`/api/cash-market/transactions/${id}`, {
        method: 'DELETE',
      });
    }, [apiCall]),
  };

  // Receipt API methods
  const receipts = {
    // Get all receipts
    list: useCallback(async (filters?: {
      status?: string;
      vendorId?: string;
      dateFrom?: string;
      dateTo?: string;
      hasTransaction?: boolean;
      limit?: number;
      offset?: number;
    }): Promise<APIResponse<CashMarketReceipt[]>> => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.vendorId) params.append('vendorId', filters.vendorId);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);
      if (filters?.hasTransaction !== undefined) params.append('hasTransaction', filters.hasTransaction.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());
      
      return apiCall(`/api/cash-market/receipts?${params.toString()}`);
    }, [apiCall]),

    // Get single receipt
    get: useCallback(async (id: string): Promise<APIResponse<CashMarketReceipt>> => {
      return apiCall(`/api/cash-market/receipts/${id}`);
    }, [apiCall]),

    // Create receipt
    create: useCallback(async (receiptData: {
      filename: string;
      imageUrl: string;
      uploadedBy: string;
      aiProcessingData?: any;
      processingStatus?: string;
      vendorId?: string;
      transactionId?: string;
      notes?: string;
    }): Promise<APIResponse<any>> => {
      return apiCall('/api/cash-market/receipts', {
        method: 'POST',
        body: JSON.stringify({
          organizationId: DEMO_ORGANIZATION_ID,
          ...receiptData,
        }),
      });
    }, [apiCall]),

    // Update receipt
    update: useCallback(async (id: string, updates: Partial<CashMarketReceipt>): Promise<APIResponse<any>> => {
      return apiCall(`/api/cash-market/receipts/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          organizationId: DEMO_ORGANIZATION_ID,
          ...updates,
        }),
      });
    }, [apiCall]),

    // Delete receipt
    delete: useCallback(async (id: string): Promise<APIResponse<any>> => {
      return apiCall(`/api/cash-market/receipts/${id}`, {
        method: 'DELETE',
      });
    }, [apiCall]),

    // Process receipt with AI
    process: useCallback(async (id: string, forceReprocess = false): Promise<APIResponse<any>> => {
      return apiCall(`/api/cash-market/receipts/${id}/process`, {
        method: 'POST',
        body: JSON.stringify({
          organizationId: DEMO_ORGANIZATION_ID,
          forceReprocess,
        }),
      });
    }, [apiCall]),
  };

  return {
    loading,
    error,
    vendors,
    transactions,
    receipts,
    // Utility method to clear error
    clearError: useCallback(() => setError(null), []),
  };
}