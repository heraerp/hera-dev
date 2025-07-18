/**
 * HERA Procurement System - Supplier Management Hook
 * Manages supplier operations with backend API integration
 */

import { useState, useCallback } from 'react';

// Types for supplier management
interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
  contact_person?: string;
}

interface ReliabilityMetrics {
  on_time_delivery: number;
  quality_score: number;
  communication_score: number;
  responsiveness_score: number;
  cost_efficiency: number;
}

interface RiskAssessment {
  overall_risk: 'low' | 'medium' | 'high' | 'critical';
  financial_stability: number;
  compliance_score: number;
  reputation_score: number;
  geographic_risk: string;
  dependency_risk: number;
}

interface CertificationCompliance {
  iso_certifications: string[];
  industry_standards: string[];
  regulatory_compliance: string[];
  last_audit_date?: string;
  compliance_score: number;
}

interface Supplier {
  id: string;
  name: string;
  description?: string;
  categories: string[];
  status: 'active' | 'inactive' | 'under_review' | 'blacklisted';
  performance_score?: number;
  contact_info?: ContactInfo;
  reliability_metrics?: ReliabilityMetrics;
  risk_assessment?: RiskAssessment;
  certification_compliance?: CertificationCompliance;
  total_orders?: number;
  total_value?: number;
  average_order_value?: number;
  last_order_date?: string;
  created_at: string;
  updated_at: string;
}

interface SupplierAnalytics {
  total_suppliers: number;
  active_suppliers: number;
  average_performance_score?: number;
  category_coverage: Record<string, number>;
  risk_distribution: Record<string, number>;
  top_performers: Array<{
    name: string;
    category: string;
    score: number;
    orders: number;
  }>;
  monthly_trends: Array<{
    month: string;
    new_suppliers: number;
    performance_change: number;
  }>;
}

interface SupplierCreate {
  name: string;
  description?: string;
  categories: string[];
  contact_info?: ContactInfo;
  certification_compliance?: CertificationCompliance;
}

interface SupplierFilters {
  category?: string;
  status?: string;
  performance_min?: number;
  risk_level?: string;
  search?: string;
  skip?: number;
  limit?: number;
}

// API Base URL - would be configured via environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export function useProcurementSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierAnalytics, setSupplierAnalytics] = useState<SupplierAnalytics | null>(null);
  const [currentSupplier, setCurrentSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get authentication token (would integrate with your auth system)
  const getAuthToken = useCallback(() => {
    // In a real implementation, this would get the JWT token from your auth system
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

  // Get list of suppliers
  const getSuppliers = useCallback(async (filters?: SupplierFilters): Promise<Supplier[]> => {
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

      const url = `${API_BASE_URL}/procurement/suppliers/?${params.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: createHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setSuppliers(result);
      return result;
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      
      // Return mock data for development/demo purposes
      const mockSuppliers: Supplier[] = [
        {
          id: '1',
          name: 'TechSupply Corporation',
          description: 'Leading provider of enterprise technology solutions and equipment',
          categories: ['IT', 'Electronics', 'Software'],
          status: 'active',
          performance_score: 94.5,
          contact_info: {
            email: 'procurement@techsupply.com',
            phone: '+1-555-0123',
            contact_person: 'Sarah Johnson'
          },
          reliability_metrics: {
            on_time_delivery: 0.96,
            quality_score: 0.93,
            communication_score: 0.91,
            responsiveness_score: 0.95,
            cost_efficiency: 0.88
          },
          risk_assessment: {
            overall_risk: 'low',
            financial_stability: 0.92,
            compliance_score: 0.96,
            reputation_score: 0.94,
            geographic_risk: 'low',
            dependency_risk: 0.15
          },
          total_orders: 47,
          total_value: 234500,
          average_order_value: 4987,
          last_order_date: '2024-01-15',
          created_at: '2023-03-15',
          updated_at: '2024-01-15'
        },
        {
          id: '2',
          name: 'Office Essentials Plus',
          description: 'Complete office supply solutions for modern workplaces',
          categories: ['Office Supplies', 'Furniture', 'Stationery'],
          status: 'active',
          performance_score: 87.2,
          contact_info: {
            email: 'orders@officeessentials.com',
            phone: '+1-555-0124',
            contact_person: 'Michael Chen'
          },
          reliability_metrics: {
            on_time_delivery: 0.89,
            quality_score: 0.85,
            communication_score: 0.88,
            responsiveness_score: 0.86,
            cost_efficiency: 0.92
          },
          risk_assessment: {
            overall_risk: 'low',
            financial_stability: 0.85,
            compliance_score: 0.89,
            reputation_score: 0.87,
            geographic_risk: 'low',
            dependency_risk: 0.22
          },
          total_orders: 73,
          total_value: 89340,
          average_order_value: 1224,
          last_order_date: '2024-01-18',
          created_at: '2023-02-20',
          updated_at: '2024-01-18'
        },
        {
          id: '3',
          name: 'Industrial Equipment Co',
          description: 'Heavy-duty industrial equipment and machinery supplier',
          categories: ['Equipment', 'Machinery', 'Tools'],
          status: 'active',
          performance_score: 91.8,
          contact_info: {
            email: 'sales@industrialequip.com',
            phone: '+1-555-0125',
            contact_person: 'David Rodriguez'
          },
          reliability_metrics: {
            on_time_delivery: 0.94,
            quality_score: 0.96,
            communication_score: 0.85,
            responsiveness_score: 0.89,
            cost_efficiency: 0.83
          },
          risk_assessment: {
            overall_risk: 'medium',
            financial_stability: 0.78,
            compliance_score: 0.92,
            reputation_score: 0.91,
            geographic_risk: 'medium',
            dependency_risk: 0.35
          },
          total_orders: 23,
          total_value: 456780,
          average_order_value: 19864,
          last_order_date: '2024-01-12',
          created_at: '2023-05-10',
          updated_at: '2024-01-12'
        },
        {
          id: '4',
          name: 'Global Logistics Partners',
          description: 'Comprehensive logistics and shipping solutions worldwide',
          categories: ['Services', 'Logistics', 'Transportation'],
          status: 'active',
          performance_score: 89.3,
          contact_info: {
            email: 'partnerships@globallogistics.com',
            phone: '+1-555-0126',
            contact_person: 'Lisa Wang'
          },
          reliability_metrics: {
            on_time_delivery: 0.92,
            quality_score: 0.87,
            communication_score: 0.94,
            responsiveness_score: 0.91,
            cost_efficiency: 0.86
          },
          risk_assessment: {
            overall_risk: 'low',
            financial_stability: 0.88,
            compliance_score: 0.95,
            reputation_score: 0.89,
            geographic_risk: 'medium',
            dependency_risk: 0.18
          },
          total_orders: 156,
          total_value: 78920,
          average_order_value: 506,
          last_order_date: '2024-01-19',
          created_at: '2023-01-08',
          updated_at: '2024-01-19'
        },
        {
          id: '5',
          name: 'Premium Furniture Solutions',
          description: 'High-quality office and workspace furniture manufacturer',
          categories: ['Furniture', 'Office Supplies', 'Design'],
          status: 'under_review',
          performance_score: 76.4,
          contact_info: {
            email: 'info@premiumfurniture.com',
            phone: '+1-555-0127',
            contact_person: 'Robert Kim'
          },
          reliability_metrics: {
            on_time_delivery: 0.78,
            quality_score: 0.82,
            communication_score: 0.71,
            responsiveness_score: 0.74,
            cost_efficiency: 0.89
          },
          risk_assessment: {
            overall_risk: 'high',
            financial_stability: 0.65,
            compliance_score: 0.73,
            reputation_score: 0.79,
            geographic_risk: 'low',
            dependency_risk: 0.42
          },
          total_orders: 12,
          total_value: 124560,
          average_order_value: 10380,
          last_order_date: '2023-12-28',
          created_at: '2023-09-15',
          updated_at: '2023-12-28'
        }
      ];
      
      setSuppliers(mockSuppliers);
      return mockSuppliers;
    } finally {
      setIsLoading(false);
    }
  }, [createHeaders, handleApiError]);

  // Get supplier analytics
  const getSupplierAnalytics = useCallback(async (): Promise<SupplierAnalytics> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/procurement/suppliers/analytics`, {
        method: 'GET',
        headers: createHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setSupplierAnalytics(result);
      return result;
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      
      // Return mock analytics for development/demo purposes
      const mockAnalytics: SupplierAnalytics = {
        total_suppliers: 5,
        active_suppliers: 4,
        average_performance_score: 87.8,
        category_coverage: {
          'IT': 1,
          'Office Supplies': 2,
          'Equipment': 1,
          'Services': 1,
          'Furniture': 2
        },
        risk_distribution: {
          'low': 3,
          'medium': 1,
          'high': 1,
          'critical': 0
        },
        top_performers: [
          { name: 'TechSupply Corporation', category: 'IT', score: 94.5, orders: 47 },
          { name: 'Industrial Equipment Co', category: 'Equipment', score: 91.8, orders: 23 },
          { name: 'Global Logistics Partners', category: 'Services', score: 89.3, orders: 156 }
        ],
        monthly_trends: [
          { month: 'Dec 2023', new_suppliers: 1, performance_change: 2.3 },
          { month: 'Jan 2024', new_suppliers: 0, performance_change: 1.8 }
        ]
      };
      
      setSupplierAnalytics(mockAnalytics);
      return mockAnalytics;
    } finally {
      setIsLoading(false);
    }
  }, [createHeaders, handleApiError]);

  // Get a specific supplier
  const getSupplier = useCallback(async (supplierId: string): Promise<Supplier> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/procurement/suppliers/${supplierId}`, {
        method: 'GET',
        headers: createHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setCurrentSupplier(result);
      return result;
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [createHeaders, handleApiError]);

  // Create a new supplier
  const createSupplier = useCallback(async (supplierData: SupplierCreate): Promise<Supplier> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/procurement/suppliers/`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(supplierData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setCurrentSupplier(result);
      
      // Update suppliers list if it's loaded
      setSuppliers(prev => [result, ...prev]);
      
      return result;
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [createHeaders, handleApiError]);

  // Update a supplier
  const updateSupplier = useCallback(async (
    supplierId: string, 
    updateData: Partial<SupplierCreate>
  ): Promise<Supplier> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/procurement/suppliers/${supplierId}`, {
        method: 'PUT',
        headers: createHeaders(),
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setCurrentSupplier(result);
      
      // Update in suppliers list
      setSuppliers(prev => prev.map(supplier => supplier.id === supplierId ? result : supplier));
      
      return result;
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [createHeaders, handleApiError]);

  // Delete a supplier
  const deleteSupplier = useCallback(async (supplierId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/procurement/suppliers/${supplierId}`, {
        method: 'DELETE',
        headers: createHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Remove from suppliers list
      setSuppliers(prev => prev.filter(supplier => supplier.id !== supplierId));
      
      // Clear current supplier if it's the deleted one
      if (currentSupplier?.id === supplierId) {
        setCurrentSupplier(null);
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [createHeaders, handleApiError, currentSupplier]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    suppliers,
    supplierAnalytics,
    currentSupplier,
    isLoading,
    error,

    // Actions
    getSuppliers,
    getSupplierAnalytics,
    getSupplier,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    clearError,

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
        day: 'numeric'
      });
    },

    formatPercentage: (value: number) => {
      return `${Math.round(value * 100)}%`;
    },

    getPerformanceColor: (score: number) => {
      if (score >= 90) return 'bg-green-100 text-green-800 border-green-200';
      if (score >= 80) return 'bg-blue-100 text-blue-800 border-blue-200';
      if (score >= 70) return 'bg-amber-100 text-amber-800 border-amber-200';
      return 'bg-red-100 text-red-800 border-red-200';
    },

    getRiskColor: (risk: string) => {
      const colors = {
        low: 'bg-green-100 text-green-800 border-green-200',
        medium: 'bg-amber-100 text-amber-800 border-amber-200',
        high: 'bg-red-100 text-red-800 border-red-200',
        critical: 'bg-red-200 text-red-900 border-red-300'
      };
      return colors[risk as keyof typeof colors] || colors.medium;
    },

    getStatusColor: (status: string) => {
      const colors = {
        active: 'bg-green-100 text-green-800 border-green-200',
        inactive: 'bg-gray-100 text-gray-800 border-gray-200',
        under_review: 'bg-amber-100 text-amber-800 border-amber-200',
        blacklisted: 'bg-red-100 text-red-800 border-red-200'
      };
      return colors[status as keyof typeof colors] || colors.active;
    }
  };
}