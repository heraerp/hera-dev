import { useState, useEffect, useCallback } from 'react';
import { AIEnhancedReportingService } from '@/lib/services/aiEnhancedReportingService';
import { useUniversalReporting } from './useUniversalReporting';
import type {
  AIInsight,
  AIDecision,
  AIPattern,
  BusinessOptimization,
  SmartAlert
} from '@/lib/services/aiEnhancedReportingService';

export interface UseAIEnhancedReportingReturn {
  // AI Data
  aiInsights: AIInsight[];
  aiDecisions: AIDecision[];
  smartAlerts: SmartAlert[];
  businessHealthScore: number;
  realTimeAnalysis: any;
  
  // Loading states
  loadingInsights: boolean;
  loadingDecisions: boolean;
  generatingInsights: boolean;
  performingAnalysis: boolean;
  
  // Error states
  error: string | null;
  
  // AI Actions
  generateAIInsights: () => Promise<boolean>;
  generateAIDecision: (
    decisionType: AIDecision['decisionType'],
    context: Record<string, any>
  ) => Promise<AIDecision | null>;
  performRealTimeAnalysis: () => Promise<boolean>;
  
  // Insight Management
  fetchAIInsights: (category?: AIInsight['category']) => Promise<boolean>;
  dismissInsight: (insightId: string) => Promise<boolean>;
  implementInsight: (insightId: string) => Promise<boolean>;
  
  // Decision Management
  fetchAIDecisions: (decisionType?: AIDecision['decisionType']) => Promise<boolean>;
  approveDecision: (decisionId: string) => Promise<boolean>;
  rejectDecision: (decisionId: string) => Promise<boolean>;
  implementDecision: (decisionId: string) => Promise<boolean>;
  
  // Alert Management
  acknowledgeAlert: (alertId: string) => Promise<boolean>;
  resolveAlert: (alertId: string) => Promise<boolean>;
  
  // Analytics
  getInsightsByCategory: (category: AIInsight['category']) => AIInsight[];
  getDecisionsByType: (type: AIDecision['decisionType']) => AIDecision[];
  getCriticalAlerts: () => SmartAlert[];
  getTopRecommendations: (limit?: number) => AIInsight[];
  
  // Utility functions
  calculateROI: (decision: AIDecision) => number;
  getPriorityScore: (insight: AIInsight) => number;
  formatConfidence: (confidence: number) => string;
  getImpactColor: (impact: AIInsight['impact']) => string;
  
  // Real-time updates
  refreshAIData: () => Promise<void>;
  
  // Stats
  aiStats: {
    totalInsights: number;
    activeInsights: number;
    implementedDecisions: number;
    pendingDecisions: number;
    criticalAlerts: number;
    averageConfidence: number;
    businessHealthTrend: 'improving' | 'declining' | 'stable';
  };
}

export function useAIEnhancedReporting(organizationId: string): UseAIEnhancedReportingReturn {
  // Use base reporting hook for analytics data
  const { analytics, refreshData } = useUniversalReporting(organizationId);
  
  // State
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([]);
  const [aiDecisions, setAIDecisions] = useState<AIDecision[]>([]);
  const [smartAlerts, setSmartAlerts] = useState<SmartAlert[]>([]);
  const [businessHealthScore, setBusinessHealthScore] = useState<number>(0);
  const [realTimeAnalysis, setRealTimeAnalysis] = useState<any>(null);
  
  // Loading states
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [loadingDecisions, setLoadingDecisions] = useState(false);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [performingAnalysis, setPerformingAnalysis] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  
  // Generate AI Insights
  const generateAIInsights = useCallback(async (): Promise<boolean> => {
    if (!organizationId || !analytics) return false;
    
    try {
      setGeneratingInsights(true);
      setError(null);
      
      const result = await AIEnhancedReportingService.generateAIInsights(
        organizationId,
        analytics
      );
      
      if (result.success && result.insights) {
        setAIInsights(result.insights);
        return true;
      } else {
        throw new Error(result.error || 'Failed to generate AI insights');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate AI insights';
      setError(errorMessage);
      console.error('Error generating AI insights:', err);
      return false;
    } finally {
      setGeneratingInsights(false);
    }
  }, [organizationId, analytics]);
  
  // Generate AI Decision
  const generateAIDecision = useCallback(async (
    decisionType: AIDecision['decisionType'],
    context: Record<string, any>
  ): Promise<AIDecision | null> => {
    if (!organizationId) return null;
    
    try {
      setError(null);
      
      const result = await AIEnhancedReportingService.generateAIDecision(
        organizationId,
        decisionType,
        context
      );
      
      if (result.success && result.decision) {
        // Refresh decisions list
        await fetchAIDecisions();
        return result.decision;
      } else {
        throw new Error(result.error || 'Failed to generate AI decision');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate AI decision';
      setError(errorMessage);
      console.error('Error generating AI decision:', err);
      return null;
    }
  }, [organizationId]);
  
  // Perform Real-Time Analysis
  const performRealTimeAnalysis = useCallback(async (): Promise<boolean> => {
    if (!organizationId) return false;
    
    try {
      setPerformingAnalysis(true);
      setError(null);
      
      const result = await AIEnhancedReportingService.performRealTimeAnalysis(organizationId);
      
      if (result.success && result.analysis) {
        setRealTimeAnalysis(result.analysis);
        setBusinessHealthScore(result.analysis.businessHealthScore);
        setAIInsights(result.analysis.insights || []);
        setSmartAlerts(result.analysis.alerts || []);
        return true;
      } else {
        throw new Error(result.error || 'Failed to perform real-time analysis');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to perform real-time analysis';
      setError(errorMessage);
      console.error('Error performing real-time analysis:', err);
      return false;
    } finally {
      setPerformingAnalysis(false);
    }
  }, [organizationId]);
  
  // Fetch AI Insights
  const fetchAIInsights = useCallback(async (
    category?: AIInsight['category']
  ): Promise<boolean> => {
    if (!organizationId) return false;
    
    try {
      setLoadingInsights(true);
      setError(null);
      
      const result = await AIEnhancedReportingService.getAIInsights(organizationId, category);
      
      if (result.success && result.insights) {
        setAIInsights(result.insights);
        return true;
      } else {
        throw new Error(result.error || 'Failed to fetch AI insights');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch AI insights';
      setError(errorMessage);
      console.error('Error fetching AI insights:', err);
      return false;
    } finally {
      setLoadingInsights(false);
    }
  }, [organizationId]);
  
  // Fetch AI Decisions
  const fetchAIDecisions = useCallback(async (
    decisionType?: AIDecision['decisionType']
  ): Promise<boolean> => {
    if (!organizationId) return false;
    
    try {
      setLoadingDecisions(true);
      setError(null);
      
      const result = await AIEnhancedReportingService.getAIDecisions(organizationId, decisionType);
      
      if (result.success && result.decisions) {
        setAIDecisions(result.decisions);
        return true;
      } else {
        throw new Error(result.error || 'Failed to fetch AI decisions');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch AI decisions';
      setError(errorMessage);
      console.error('Error fetching AI decisions:', err);
      return false;
    } finally {
      setLoadingDecisions(false);
    }
  }, [organizationId]);
  
  // Dismiss Insight
  const dismissInsight = useCallback(async (insightId: string): Promise<boolean> => {
    try {
      setError(null);
      
      // Update local state immediately
      setAIInsights(prev => prev.map(insight => 
        insight.id === insightId 
          ? { ...insight, status: 'dismissed' } 
          : insight
      ));
      
      // Here you would call the API to update the insight status
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to dismiss insight';
      setError(errorMessage);
      console.error('Error dismissing insight:', err);
      return false;
    }
  }, []);
  
  // Implement Insight
  const implementInsight = useCallback(async (insightId: string): Promise<boolean> => {
    try {
      setError(null);
      
      // Update local state immediately
      setAIInsights(prev => prev.map(insight => 
        insight.id === insightId 
          ? { ...insight, status: 'implemented' } 
          : insight
      ));
      
      // Here you would call the API to update the insight status
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to implement insight';
      setError(errorMessage);
      console.error('Error implementing insight:', err);
      return false;
    }
  }, []);
  
  // Approve Decision
  const approveDecision = useCallback(async (decisionId: string): Promise<boolean> => {
    try {
      setError(null);
      
      // Update local state immediately
      setAIDecisions(prev => prev.map(decision => 
        decision.id === decisionId 
          ? { ...decision, implementationStatus: 'approved' } 
          : decision
      ));
      
      // Here you would call the API to update the decision status
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve decision';
      setError(errorMessage);
      console.error('Error approving decision:', err);
      return false;
    }
  }, []);
  
  // Reject Decision
  const rejectDecision = useCallback(async (decisionId: string): Promise<boolean> => {
    try {
      setError(null);
      
      // Update local state immediately
      setAIDecisions(prev => prev.map(decision => 
        decision.id === decisionId 
          ? { ...decision, implementationStatus: 'rejected' } 
          : decision
      ));
      
      // Here you would call the API to update the decision status
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject decision';
      setError(errorMessage);
      console.error('Error rejecting decision:', err);
      return false;
    }
  }, []);
  
  // Implement Decision
  const implementDecision = useCallback(async (decisionId: string): Promise<boolean> => {
    try {
      setError(null);
      
      // Update local state immediately
      setAIDecisions(prev => prev.map(decision => 
        decision.id === decisionId 
          ? { 
              ...decision, 
              implementationStatus: 'implemented',
              implementedAt: new Date().toISOString()
            } 
          : decision
      ));
      
      // Here you would call the API to update the decision status and implement the decision
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to implement decision';
      setError(errorMessage);
      console.error('Error implementing decision:', err);
      return false;
    }
  }, []);
  
  // Acknowledge Alert
  const acknowledgeAlert = useCallback(async (alertId: string): Promise<boolean> => {
    try {
      setError(null);
      
      // Update local state immediately
      setSmartAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledgedAt: new Date().toISOString() } 
          : alert
      ));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to acknowledge alert';
      setError(errorMessage);
      console.error('Error acknowledging alert:', err);
      return false;
    }
  }, []);
  
  // Resolve Alert
  const resolveAlert = useCallback(async (alertId: string): Promise<boolean> => {
    try {
      setError(null);
      
      // Update local state immediately
      setSmartAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, resolvedAt: new Date().toISOString() } 
          : alert
      ));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resolve alert';
      setError(errorMessage);
      console.error('Error resolving alert:', err);
      return false;
    }
  }, []);
  
  // Utility functions
  const getInsightsByCategory = useCallback((category: AIInsight['category']): AIInsight[] => {
    return aiInsights.filter(insight => insight.category === category);
  }, [aiInsights]);
  
  const getDecisionsByType = useCallback((type: AIDecision['decisionType']): AIDecision[] => {
    return aiDecisions.filter(decision => decision.decisionType === type);
  }, [aiDecisions]);
  
  const getCriticalAlerts = useCallback((): SmartAlert[] => {
    return smartAlerts.filter(alert => 
      alert.severity === 'critical' || alert.severity === 'urgent'
    );
  }, [smartAlerts]);
  
  const getTopRecommendations = useCallback((limit: number = 5): AIInsight[] => {
    return aiInsights
      .filter(insight => insight.type === 'recommendation' && insight.status === 'active')
      .sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority;
        return b.confidence - a.confidence;
      })
      .slice(0, limit);
  }, [aiInsights]);
  
  const calculateROI = useCallback((decision: AIDecision): number => {
    // Simplified ROI calculation based on expected outcome
    const expectedChange = decision.expectedOutcome?.expectedChange || 0;
    const implementationCost = 1000; // Default implementation cost
    return (expectedChange / implementationCost) * 100;
  }, []);
  
  const getPriorityScore = useCallback((insight: AIInsight): number => {
    const impactWeights = { low: 1, medium: 2, high: 3, critical: 4 };
    return insight.priority * impactWeights[insight.impact] * insight.confidence;
  }, []);
  
  const formatConfidence = useCallback((confidence: number): string => {
    return `${(confidence * 100).toFixed(0)}%`;
  }, []);
  
  const getImpactColor = useCallback((impact: AIInsight['impact']): string => {
    const colors = {
      low: 'text-blue-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      critical: 'text-red-600'
    };
    return colors[impact] || 'text-gray-600';
  }, []);
  
  // Refresh all AI data
  const refreshAIData = useCallback(async (): Promise<void> => {
    await Promise.all([
      refreshData(), // Refresh base analytics
      fetchAIInsights(),
      fetchAIDecisions(),
      performRealTimeAnalysis()
    ]);
  }, [refreshData, fetchAIInsights, fetchAIDecisions, performRealTimeAnalysis]);
  
  // Calculate AI stats
  const aiStats = {
    totalInsights: aiInsights.length,
    activeInsights: aiInsights.filter(i => i.status === 'active').length,
    implementedDecisions: aiDecisions.filter(d => d.implementationStatus === 'implemented').length,
    pendingDecisions: aiDecisions.filter(d => d.implementationStatus === 'pending').length,
    criticalAlerts: getCriticalAlerts().length,
    averageConfidence: aiInsights.length > 0 
      ? aiInsights.reduce((sum, insight) => sum + insight.confidence, 0) / aiInsights.length 
      : 0,
    businessHealthTrend: businessHealthScore > 80 ? 'improving' : 
                        businessHealthScore < 60 ? 'declining' : 'stable' as const
  };
  
  // Initial load and auto-refresh
  useEffect(() => {
    if (organizationId && analytics) {
      refreshAIData();
      
      // Auto-refresh every 5 minutes
      const interval = setInterval(refreshAIData, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [organizationId, analytics, refreshAIData]);
  
  // Auto-generate insights when analytics change
  useEffect(() => {
    if (organizationId && analytics && aiInsights.length === 0) {
      generateAIInsights();
    }
  }, [organizationId, analytics, aiInsights.length, generateAIInsights]);
  
  return {
    // AI Data
    aiInsights,
    aiDecisions,
    smartAlerts,
    businessHealthScore,
    realTimeAnalysis,
    
    // Loading states
    loadingInsights,
    loadingDecisions,
    generatingInsights,
    performingAnalysis,
    
    // Error state
    error,
    
    // AI Actions
    generateAIInsights,
    generateAIDecision,
    performRealTimeAnalysis,
    
    // Insight Management
    fetchAIInsights,
    dismissInsight,
    implementInsight,
    
    // Decision Management
    fetchAIDecisions,
    approveDecision,
    rejectDecision,
    implementDecision,
    
    // Alert Management
    acknowledgeAlert,
    resolveAlert,
    
    // Analytics
    getInsightsByCategory,
    getDecisionsByType,
    getCriticalAlerts,
    getTopRecommendations,
    
    // Utility functions
    calculateROI,
    getPriorityScore,
    formatConfidence,
    getImpactColor,
    
    // Real-time updates
    refreshAIData,
    
    // Stats
    aiStats
  };
}