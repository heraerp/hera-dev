import { useState, useEffect, useCallback } from 'react';
import CRMService from '@/lib/services/crmService';

// HERA Universal CRM Hook
// Generated using proven patterns from useUniversalReporting
export function useCRM(organizationId: string) {
  // State management
  const [contacts, setContacts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [aiInsights, setAIInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load contacts
      const contactResult = await CRMService.listContacts();
      if (contactResult.success && contactResult.contacts) {
        setContacts(contactResult.contacts);
      }

      // Load analytics
      const analyticsResult = await CRMService.getCRMAnalytics();
      if (analyticsResult.success && analyticsResult.analytics) {
        setAnalytics(analyticsResult.analytics);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  // Generate AI insights
  const generateAIInsights = useCallback(async () => {
    try {
      const lead_scoringResult = await CRMService.generateLeadScoring();
      if (lead_scoringResult.success && lead_scoringResult.insights) {
        setAIInsights(prev => [...prev, ...lead_scoringResult.insights]);
      }
      const churn_predictionResult = await CRMService.generateChurnPrediction();
      if (churn_predictionResult.success && churn_predictionResult.insights) {
        setAIInsights(prev => [...prev, ...churn_predictionResult.insights]);
      }
      const revenue_forecastResult = await CRMService.generateRevenueForecast();
      if (revenue_forecastResult.success && revenue_forecastResult.insights) {
        setAIInsights(prev => [...prev, ...revenue_forecastResult.insights]);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  // CRUD operations
  const createContact = useCallback(async (data: any) => {
    const result = await CRMService.createContact(data);
    if (result.success) {
      await loadData(); // Refresh data
    }
    return result;
  }, [loadData]);

  // Effects
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time subscription
  useEffect(() => {
    const subscription = CRMService.subscribeCRMChanges((payload) => {
      console.log('CRM change:', payload);
      loadData(); // Refresh on changes
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadData]);

  return {
    // Data
    contacts,
    analytics,
    aiInsights,
    
    // State
    loading,
    error,
    
    // Actions
    loadData,
    generateAIInsights,
    createContact,
    
    // Computed
    totalContacts: contacts.length,
    activeContacts: contacts.filter(item => item.status === 'active').length
  };
}