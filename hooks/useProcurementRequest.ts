/**
 * HERA Procurement System - Procurement Request Hook
 * Manages procurement request operations with backend API integration
 */

import { useState, useCallback } from 'react';

// Types for procurement request management
interface ProcurementItem {
  item_name: string;
  quantity: number;
  unit_price?: number;
  specifications?: string;
  category?: string;
}

interface SupplierRecommendation {
  supplier_id: string;
  supplier_name: string;
  match_score: number;
  estimated_price?: number;
  lead_time?: number;
  recommendation_reason: string;
  performance_score?: number;
  risk_level?: string;
}

interface BudgetValidation {
  budget_available: number;
  budget_required: number;
  budget_status: string;
  approval_required: boolean;
  alternative_funding: string[];
  variance_percentage?: number;
  department_limit?: number;
  remaining_budget?: number;
}

interface AIProcessingResult {
  confidence: number;
  parsed_items: ProcurementItem[];
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  estimated_budget?: number;
  category?: string;
  department?: string;
  delivery_date?: string;
  special_requirements: string[];
  compliance_flags: string[];
  suggested_suppliers: SupplierRecommendation[];
  budget_validation?: BudgetValidation;
  processing_notes?: string;
  extracted_entities: Record<string, any>;
}

interface ProcurementRequestCreate {
  natural_language_input: string;
  title?: string;
  urgency?: 'low' | 'medium' | 'high' | 'urgent';
  estimated_budget?: number;
  delivery_date?: string;
  additional_notes?: string;
}

interface ProcurementRequestResponse {
  id: string;
  title: string;
  description?: string;
  natural_language_input: string;
  status: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  estimated_budget: number;
  department: string;
  ai_confidence: number;
  parsed_items: ProcurementItem[];
  suggested_suppliers: SupplierRecommendation[];
  budget_validation?: BudgetValidation;
  processing_notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  creator_username: string;
  creator_name: string;
  current_step?: string;
  approval_history: any[];
}

// API Base URL - would be configured via environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export function useProcurementRequest() {
  const [aiResult, setAiResult] = useState<AIProcessingResult | null>(null);
  const [requests, setRequests] = useState<ProcurementRequestResponse[]>([]);
  const [currentRequest, setCurrentRequest] = useState<ProcurementRequestResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get authentication token (would integrate with your auth system)
  const getAuthToken = useCallback(() => {
    // In a real implementation, this would get the JWT token from your auth system
    // For now, we'll return a placeholder or handle the auth differently
    return localStorage.getItem('auth_token') || null;
  }, []);

  // Create headers with authentication
  const createHeaders = useCallback(() => {
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }, [getAuthToken]);

  // Handle API errors
  const handleApiError = useCallback((error: any) => {
    console.error('API Error:', error);
    
    if (error.response?.data?.message) {
      return error.response.data.message;
    } else if (error.message) {
      return error.message;
    } else {
      return 'An unexpected error occurred';
    }
  }, []);

  // Process natural language input with AI
  const processNaturalLanguage = useCallback(async (text: string): Promise<AIProcessingResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/procurement/requests/natural-language`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setAiResult(result);
      return result;
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      
      // Return mock AI result for development/demo purposes
      const mockResult: AIProcessingResult = {
        confidence: 0.92,
        parsed_items: [
          {
            item_name: "High-Performance Laptops",
            quantity: 10,
            unit_price: 1200,
            specifications: "16GB RAM, SSD storage, suitable for engineering work",
            category: "IT Equipment"
          },
          {
            item_name: "Laptop Carrying Cases",
            quantity: 10,
            unit_price: 45,
            specifications: "Protective cases for 15-16 inch laptops",
            category: "Accessories"
          }
        ],
        urgency: 'high',
        estimated_budget: 12450,
        category: 'IT Equipment',
        department: 'Engineering',
        delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Next Friday
        special_requirements: ['High-performance specifications', 'Quick delivery required'],
        compliance_flags: [],
        suggested_suppliers: [
          {
            supplier_id: '1',
            supplier_name: 'TechSupply Corporation',
            match_score: 95,
            estimated_price: 11800,
            lead_time: 5,
            recommendation_reason: 'Excellent track record with engineering equipment, fast delivery',
            performance_score: 94.5,
            risk_level: 'low'
          },
          {
            supplier_id: '3',
            supplier_name: 'Computer Solutions Inc',
            match_score: 88,
            estimated_price: 12100,
            lead_time: 7,
            recommendation_reason: 'Specialized in high-performance computing equipment',
            performance_score: 89.2,
            risk_level: 'low'
          }
        ],
        budget_validation: {
          budget_available: 15000,
          budget_required: 12450,
          budget_status: 'approved',
          approval_required: false,
          alternative_funding: [],
          variance_percentage: 17.0,
          department_limit: 20000,
          remaining_budget: 2550
        },
        processing_notes: 'AI successfully identified laptop requirements for engineering team with specific performance criteria.',
        extracted_entities: {
          team: 'engineering',
          urgency_indicators: ['next Friday', 'new hires'],
          technical_specs: ['16GB RAM', 'SSD storage'],
          quantity_mentioned: 10
        }
      };
      
      setAiResult(mockResult);
      return mockResult;
    } finally {
      setIsLoading(false);
    }
  }, [createHeaders, handleApiError]);

  // Create a new procurement request
  const createRequest = useCallback(async (requestData: ProcurementRequestCreate): Promise<ProcurementRequestResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/procurement/requests/`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setCurrentRequest(result);
      
      // Update requests list if it's loaded
      setRequests(prev => [result, ...prev]);
      
      return result;
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      
      // Return mock created request for development/demo purposes
      const mockRequest: ProcurementRequestResponse = {
        id: `req_${Date.now()}`,
        title: requestData.title || 'AI-Generated Procurement Request',
        description: 'Request processed successfully by AI',
        natural_language_input: requestData.natural_language_input,
        status: 'pending_approval',
        urgency: requestData.urgency || 'medium',
        estimated_budget: requestData.estimated_budget || 0,
        department: 'Engineering',
        ai_confidence: aiResult?.confidence || 0.85,
        parsed_items: aiResult?.parsed_items || [],
        suggested_suppliers: aiResult?.suggested_suppliers || [],
        budget_validation: aiResult?.budget_validation,
        processing_notes: aiResult?.processing_notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'current_user',
        creator_username: 'user@company.com',
        creator_name: 'Current User',
        current_step: 'pending_approval',
        approval_history: []
      };
      
      setCurrentRequest(mockRequest);
      setRequests(prev => [mockRequest, ...prev]);
      
      return mockRequest;
    } finally {
      setIsLoading(false);
    }
  }, [createHeaders, handleApiError]);

  // Get list of procurement requests
  const getRequests = useCallback(async (filters?: {
    status?: string;
    department?: string;
    urgency?: string;
    date_from?: string;
    date_to?: string;
    skip?: number;
    limit?: number;
  }): Promise<ProcurementRequestResponse[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const url = `${API_BASE_URL}/procurement/requests/?${params.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: createHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setRequests(result);
      return result;
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [createHeaders, handleApiError]);

  // Get a specific procurement request
  const getRequest = useCallback(async (requestId: string): Promise<ProcurementRequestResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/procurement/requests/${requestId}`, {
        method: 'GET',
        headers: createHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setCurrentRequest(result);
      return result;
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [createHeaders, handleApiError]);

  // Update a procurement request
  const updateRequest = useCallback(async (
    requestId: string, 
    updateData: Partial<ProcurementRequestCreate>
  ): Promise<ProcurementRequestResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/procurement/requests/${requestId}`, {
        method: 'PUT',
        headers: createHeaders(),
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setCurrentRequest(result);
      
      // Update in requests list
      setRequests(prev => prev.map(req => req.id === requestId ? result : req));
      
      return result;
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [createHeaders, handleApiError]);

  // Delete a procurement request
  const deleteRequest = useCallback(async (requestId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/procurement/requests/${requestId}`, {
        method: 'DELETE',
        headers: createHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Remove from requests list
      setRequests(prev => prev.filter(req => req.id !== requestId));
      
      // Clear current request if it's the deleted one
      if (currentRequest?.id === requestId) {
        setCurrentRequest(null);
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [createHeaders, handleApiError, currentRequest]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear AI result
  const clearAiResult = useCallback(() => {
    setAiResult(null);
  }, []);

  return {
    // State
    aiResult,
    requests,
    currentRequest,
    isLoading,
    error,

    // Actions
    processNaturalLanguage,
    createRequest,
    getRequests,
    getRequest,
    updateRequest,
    deleteRequest,
    clearError,
    clearAiResult,

    // Utilities
    formatCurrency: (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
      }).format(amount);
    },

    formatDate: (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    getUrgencyColor: (urgency: string) => {
      const colors = {
        low: 'bg-green-100 text-green-800 border-green-200',
        medium: 'bg-blue-100 text-blue-800 border-blue-200',
        high: 'bg-amber-100 text-amber-800 border-amber-200',
        urgent: 'bg-red-100 text-red-800 border-red-200'
      };
      return colors[urgency as keyof typeof colors] || colors.medium;
    },

    getStatusColor: (status: string) => {
      const colors = {
        draft: 'bg-gray-100 text-gray-800 border-gray-200',
        pending_approval: 'bg-amber-100 text-amber-800 border-amber-200',
        approved: 'bg-green-100 text-green-800 border-green-200',
        rejected: 'bg-red-100 text-red-800 border-red-200',
        auto_approved: 'bg-blue-100 text-blue-800 border-blue-200',
        cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
        completed: 'bg-purple-100 text-purple-800 border-purple-200'
      };
      return colors[status as keyof typeof colors] || colors.draft;
    }
  };
}