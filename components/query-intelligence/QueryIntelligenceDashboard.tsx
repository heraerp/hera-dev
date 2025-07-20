'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Zap, 
  Clock, 
  TrendingUp, 
  Database,
  Target,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  Lightbulb,
  RefreshCw
} from 'lucide-react';

interface QueryPattern {
  id: string;
  entityTypes: string[];
  fieldNames: string[];
  avgExecutionTime: number;
  frequency: number;
  complexity: 'simple' | 'medium' | 'complex';
  confidenceScore: number;
  cacheHitRate?: number;
}

interface PerformancePrediction {
  queryType: string;
  predictedTime: number;
  confidenceScore: number;
  suggestions: string[];
  priority: 'low' | 'medium' | 'high';
}

interface CacheEntry {
  id: string;
  patternId: string;
  hitRate: number;
  effectiveness: number;
  lastAccessed: string;
  expiryMinutes: number;
}

interface QueryIntelligenceDashboardProps {
  organizationId: string;
}

export function QueryIntelligenceDashboard({ organizationId }: QueryIntelligenceDashboardProps) {
  const [patterns, setPatterns] = useState<QueryPattern[]>([]);
  const [predictions, setPredictions] = useState<PerformancePrediction[]>([]);
  const [cacheEntries, setCacheEntries] = useState<CacheEntry[]>([]);
  const [overallStats, setOverallStats] = useState({
    totalPatterns: 0,
    avgPerformance: 0,
    cacheEffectiveness: 0,
    aiConfidence: 0,
    performanceHealth: 'good' as 'good' | 'warning' | 'critical'
  });
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    loadDashboardData();
  }, [organizationId]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate loading query intelligence data
      // In real implementation, this would call your AI analytics API
      
      // Mock data for demonstration
      const mockPatterns: QueryPattern[] = [
        {
          id: '1',
          entityTypes: ['menu_item', 'category'],
          fieldNames: ['name', 'price', 'description'],
          avgExecutionTime: 85,
          frequency: 45,
          complexity: 'simple',
          confidenceScore: 0.94,
          cacheHitRate: 89
        },
        {
          id: '2',
          entityTypes: ['customer', 'order'],
          fieldNames: ['email', 'total_amount', 'status'],
          avgExecutionTime: 320,
          frequency: 28,
          complexity: 'complex',
          confidenceScore: 0.87,
          cacheHitRate: 72
        },
        {
          id: '3',
          entityTypes: ['employee'],
          fieldNames: ['name', 'role', 'schedule'],
          avgExecutionTime: 125,
          frequency: 15,
          complexity: 'medium',
          confidenceScore: 0.91,
          cacheHitRate: 95
        }
      ];

      const mockPredictions: PerformancePrediction[] = [
        {
          queryType: 'Customer Order History',
          predictedTime: 450,
          confidenceScore: 0.89,
          suggestions: [
            'Consider adding index on customer.email for 60% improvement',
            'Enable intelligent caching for this query pattern',
            'Optimize join strategy for better performance'
          ],
          priority: 'high'
        },
        {
          queryType: 'Menu Category Browsing',
          predictedTime: 75,
          confidenceScore: 0.96,
          suggestions: [
            'Query performance is optimal',
            'Current caching strategy is effective'
          ],
          priority: 'low'
        }
      ];

      const mockCacheEntries: CacheEntry[] = [
        {
          id: '1',
          patternId: '1',
          hitRate: 89,
          effectiveness: 94,
          lastAccessed: '2 minutes ago',
          expiryMinutes: 30
        },
        {
          id: '2',
          patternId: '2',
          hitRate: 72,
          effectiveness: 78,
          lastAccessed: '5 minutes ago',
          expiryMinutes: 60
        }
      ];

      setPatterns(mockPatterns);
      setPredictions(mockPredictions);
      setCacheEntries(mockCacheEntries);
      
      setOverallStats({
        totalPatterns: mockPatterns.length,
        avgPerformance: Math.round(mockPatterns.reduce((sum, p) => sum + p.avgExecutionTime, 0) / mockPatterns.length),
        cacheEffectiveness: Math.round(mockCacheEntries.reduce((sum, c) => sum + c.effectiveness, 0) / mockCacheEntries.length),
        aiConfidence: Math.round(mockPatterns.reduce((sum, p) => sum + p.confidenceScore, 0) / mockPatterns.length * 100),
        performanceHealth: 'good'
      });

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading query intelligence data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'complex': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'border-green-500 text-green-700';
      case 'medium': return 'border-yellow-500 text-yellow-700';
      case 'high': return 'border-red-500 text-red-700';
      default: return 'border-gray-500 text-gray-700';
    }
  };

  const getHealthIcon = () => {
    switch (overallStats.performanceHealth) {
      case 'good': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading AI Query Intelligence...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Query Patterns</p>
                <p className="text-2xl font-bold">{overallStats.totalPatterns}</p>
              </div>
              <Brain className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Performance</p>
                <p className="text-2xl font-bold">{overallStats.avgPerformance}ms</p>
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cache Effectiveness</p>
                <p className="text-2xl font-bold">{overallStats.cacheEffectiveness}%</p>
              </div>
              <Zap className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Confidence</p>
                <p className="text-2xl font-bold">{overallStats.aiConfidence}%</p>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-500" />
              System Performance Health
            </div>
            <div className="flex items-center space-x-2">
              {getHealthIcon()}
              <Badge variant="outline" className="capitalize">
                {overallStats.performanceHealth}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium mb-2">Query Performance</p>
              <Progress value={85} className="mb-1" />
              <p className="text-xs text-gray-600">85% of queries under 200ms</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">AI Accuracy</p>
              <Progress value={overallStats.aiConfidence} className="mb-1" />
              <p className="text-xs text-gray-600">{overallStats.aiConfidence}% prediction accuracy</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Cache Utilization</p>
              <Progress value={overallStats.cacheEffectiveness} className="mb-1" />
              <p className="text-xs text-gray-600">{overallStats.cacheEffectiveness}% cache effectiveness</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Query Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-green-500" />
              Learned Query Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {patterns.map((pattern) => (
                <div key={pattern.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getComplexityColor(pattern.complexity)}`}></div>
                      <span className="font-medium text-sm">
                        {pattern.entityTypes.join(' + ')}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {pattern.avgExecutionTime}ms avg
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-gray-600 mb-2">
                    Fields: {pattern.fieldNames.join(', ')}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-4">
                      <span>Frequency: {pattern.frequency}x/day</span>
                      <span>Confidence: {Math.round(pattern.confidenceScore * 100)}%</span>
                    </div>
                    {pattern.cacheHitRate && (
                      <Badge variant="secondary" className="text-xs">
                        {pattern.cacheHitRate}% cached
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
              AI Optimization Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {predictions.map((prediction, index) => (
                <div key={index} className={`border-l-4 pl-4 ${getPriorityColor(prediction.priority)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{prediction.queryType}</h4>
                    <Badge variant="outline" className="text-xs">
                      ~{prediction.predictedTime}ms
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-gray-600 mb-2">
                    AI Confidence: {Math.round(prediction.confidenceScore * 100)}%
                  </div>
                  
                  <ul className="text-xs space-y-1">
                    {prediction.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-gray-400 mr-1">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cache Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Database className="w-5 h-5 mr-2 text-purple-500" />
              Intelligent Cache Management
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadDashboardData}
              className="flex items-center space-x-1"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cacheEntries.map((entry) => (
              <div key={entry.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">Cache Entry #{entry.id}</span>
                  <Badge variant="secondary">{entry.hitRate}% hit rate</Badge>
                </div>
                
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Effectiveness:</span>
                    <span className="font-medium">{entry.effectiveness}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last accessed:</span>
                    <span>{entry.lastAccessed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expires in:</span>
                    <span>{entry.expiryMinutes} minutes</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500">
        Last updated: {lastRefresh.toLocaleTimeString()} | 
        AI continuously learns from query patterns to optimize performance
      </div>
    </div>
  );
}