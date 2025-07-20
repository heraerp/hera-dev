'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Eye,
  Brain,
  TrendingUp,
  Zap,
  Target,
  Activity,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Clock,
  Users,
  BarChart3,
  PieChart,
  RefreshCw,
  Play,
  Sparkles
} from 'lucide-react';

interface AIPatternDiscoveryProps {
  organizationId: string;
}

interface DiscoveredPattern {
  id: string;
  pattern_name: string;
  pattern_type: 'behavioral' | 'operational' | 'financial' | 'temporal';
  confidence_score: number;
  business_impact: 'high' | 'medium' | 'low';
  discovered_at: string;
  entity_types: string[];
  pattern_description: string;
  actionable_insights: string[];
  ai_recommendations: string[];
  usage_frequency: number;
  trend_direction: 'increasing' | 'decreasing' | 'stable';
}

interface AILearningMetrics {
  total_patterns_discovered: number;
  high_confidence_patterns: number;
  actionable_insights_generated: number;
  business_impact_score: number;
  learning_velocity: number;
  ai_accuracy_rate: number;
}

export function AIPatternDiscovery({ organizationId }: AIPatternDiscoveryProps) {
  const [patterns, setPatterns] = useState<DiscoveredPattern[]>([
    {
      id: '1',
      pattern_name: 'Peak Hour Customer Behavior',
      pattern_type: 'behavioral',
      confidence_score: 0.94,
      business_impact: 'high',
      discovered_at: '2 hours ago',
      entity_types: ['customer', 'order', 'menu_item'],
      pattern_description: 'Customers order 40% more appetizers during 12-2 PM and prefer quick-service items',
      actionable_insights: [
        'Increase appetizer inventory during lunch hours',
        'Promote quick-prep items in lunch menu',
        'Add staff during peak ordering windows'
      ],
      ai_recommendations: [
        'Dynamic menu pricing for peak hours',
        'Automated staff scheduling based on predicted volume',
        'Real-time inventory adjustments'
      ],
      usage_frequency: 87,
      trend_direction: 'increasing'
    },
    {
      id: '2',
      pattern_name: 'Seasonal Menu Performance',
      pattern_type: 'operational',
      confidence_score: 0.89,
      business_impact: 'medium',
      discovered_at: '1 day ago',
      entity_types: ['menu_item', 'order', 'seasonal_data'],
      pattern_description: 'Seasonal menu items show 23% higher profit margins but 15% lower order frequency',
      actionable_insights: [
        'Focus seasonal marketing on high-margin items',
        'Create limited-time seasonal bundles',
        'Optimize seasonal ingredient procurement'
      ],
      ai_recommendations: [
        'Predictive seasonal demand modeling',
        'Dynamic pricing for seasonal items',
        'Automated seasonal menu rotation'
      ],
      usage_frequency: 65,
      trend_direction: 'stable'
    },
    {
      id: '3',
      pattern_name: 'Payment Method Preferences',
      pattern_type: 'financial',
      confidence_score: 0.91,
      business_impact: 'medium',
      discovered_at: '3 hours ago',
      entity_types: ['payment', 'customer', 'transaction'],
      pattern_description: 'Mobile payments correlate with 18% higher average order values and faster checkout times',
      actionable_insights: [
        'Promote mobile payment adoption',
        'Optimize mobile payment UX',
        'Create mobile payment incentives'
      ],
      ai_recommendations: [
        'Personalized payment method suggestions',
        'Mobile payment rewards program',
        'Predictive payment failure prevention'
      ],
      usage_frequency: 73,
      trend_direction: 'increasing'
    },
    {
      id: '4',
      pattern_name: 'Staff Performance Correlation',
      pattern_type: 'operational',
      confidence_score: 0.86,
      business_impact: 'high',
      discovered_at: '6 hours ago',
      entity_types: ['employee', 'order', 'customer_satisfaction'],
      pattern_description: 'Employees with customer service training show 31% higher customer satisfaction scores',
      actionable_insights: [
        'Expand customer service training program',
        'Identify top-performing staff patterns',
        'Create peer mentorship programs'
      ],
      ai_recommendations: [
        'AI-powered training recommendations',
        'Real-time performance coaching',
        'Predictive staff scheduling optimization'
      ],
      usage_frequency: 92,
      trend_direction: 'increasing'
    }
  ]);

  const [metrics, setMetrics] = useState<AILearningMetrics>({
    total_patterns_discovered: 247,
    high_confidence_patterns: 189,
    actionable_insights_generated: 1456,
    business_impact_score: 87.3,
    learning_velocity: 23.5,
    ai_accuracy_rate: 91.7
  });

  const [discoveryInProgress, setDiscoveryInProgress] = useState(false);

  const runPatternDiscovery = async () => {
    setDiscoveryInProgress(true);
    try {
      // Simulate AI pattern discovery using HERA Universal Schema
      console.log('Running AI pattern discovery across universal entities...');
      
      // Mock discovering new patterns
      setTimeout(() => {
        setMetrics(prev => ({
          ...prev,
          total_patterns_discovered: prev.total_patterns_discovered + Math.floor(Math.random() * 5) + 1,
          actionable_insights_generated: prev.actionable_insights_generated + Math.floor(Math.random() * 10) + 3,
          learning_velocity: Math.min(100, prev.learning_velocity + Math.random() * 2)
        }));
        
        console.log('New patterns discovered using AI analysis of universal schema data');
        setDiscoveryInProgress(false);
      }, 3000);
    } catch (error) {
      console.error('AI pattern discovery failed:', error);
      setDiscoveryInProgress(false);
    }
  };

  const getPatternTypeColor = (type: string) => {
    switch (type) {
      case 'behavioral': return 'bg-blue-100 text-blue-800';
      case 'operational': return 'bg-green-100 text-green-800';
      case 'financial': return 'bg-purple-100 text-purple-800';
      case 'temporal': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'decreasing': return <TrendingUp className="w-4 h-4 text-red-500 transform rotate-180" />;
      case 'stable': return <Activity className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Learning Metrics Dashboard */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="w-5 h-5 mr-2 text-purple-500" />
              AI Pattern Discovery Engine
              <Badge className="ml-2 bg-purple-100 text-purple-800">
                <Sparkles className="w-3 h-3 mr-1" />
                Learning
              </Badge>
            </div>
            <Button 
              onClick={runPatternDiscovery}
              disabled={discoveryInProgress}
              className="bg-gradient-to-r from-purple-500 to-blue-500"
            >
              {discoveryInProgress ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Discover Patterns
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{metrics.total_patterns_discovered}</div>
              <div className="text-sm text-gray-600">Patterns Discovered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.high_confidence_patterns}</div>
              <div className="text-sm text-gray-600">High Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.actionable_insights_generated.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Insights Generated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{metrics.business_impact_score}%</div>
              <div className="text-sm text-gray-600">Business Impact</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{metrics.learning_velocity}%</div>
              <div className="text-sm text-gray-600">Learning Velocity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600">{metrics.ai_accuracy_rate}%</div>
              <div className="text-sm text-gray-600">AI Accuracy</div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Continuous Learning</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Real-time Analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">Actionable Insights</span>
                </div>
              </div>
              <Badge variant="outline">
                {discoveryInProgress ? 'Analyzing...' : 'Ready'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Discovered Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {patterns.map((pattern) => (
          <Card key={pattern.id} className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mr-3"></div>
                  <span className="text-lg">{pattern.pattern_name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(pattern.trend_direction)}
                  <Badge className={getPatternTypeColor(pattern.pattern_type)}>
                    {pattern.pattern_type}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pattern Metrics */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-blue-600">
                    {Math.round(pattern.confidence_score * 100)}%
                  </div>
                  <div className="text-xs text-gray-600">Confidence</div>
                  <Progress value={pattern.confidence_score * 100} className="mt-1 h-2" />
                </div>
                <div>
                  <div className={`text-lg font-bold ${getImpactColor(pattern.business_impact)}`}>
                    {pattern.business_impact.toUpperCase()}
                  </div>
                  <div className="text-xs text-gray-600">Impact</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600">{pattern.usage_frequency}%</div>
                  <div className="text-xs text-gray-600">Usage Freq</div>
                </div>
              </div>

              {/* Pattern Description */}
              <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">{pattern.pattern_description}</p>
              </div>

              {/* Entity Types */}
              <div>
                <div className="text-sm font-medium mb-2">Related Entities:</div>
                <div className="flex flex-wrap gap-2">
                  {pattern.entity_types.map((entityType) => (
                    <Badge key={entityType} variant="outline" className="text-xs">
                      {entityType.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actionable Insights */}
              <div>
                <div className="text-sm font-medium mb-2 flex items-center">
                  <Lightbulb className="w-4 h-4 mr-1 text-yellow-500" />
                  Actionable Insights:
                </div>
                <ul className="space-y-1">
                  {pattern.actionable_insights.slice(0, 2).map((insight, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                      <CheckCircle className="w-3 h-3 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>

              {/* AI Recommendations */}
              <div>
                <div className="text-sm font-medium mb-2 flex items-center">
                  <Brain className="w-4 h-4 mr-1 text-purple-500" />
                  AI Recommendations:
                </div>
                <ul className="space-y-1">
                  {pattern.ai_recommendations.slice(0, 2).map((recommendation, index) => (
                    <li key={index} className="text-sm text-purple-600 dark:text-purple-400 flex items-start">
                      <Sparkles className="w-3 h-3 mr-2 text-purple-500 mt-0.5 flex-shrink-0" />
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                <div className="flex items-center space-x-2">
                  <Clock className="w-3 h-3" />
                  <span>Discovered {pattern.discovered_at}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="w-3 h-3" />
                  <span>Trend: {pattern.trend_direction}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Pattern Discovery Capabilities */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
            AI Discovery Algorithms Active
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold">Behavioral Analysis</h4>
              <p className="text-sm text-gray-600">Customer interaction patterns and preferences</p>
              <Badge className="bg-blue-100 text-blue-800">24/7 Active</Badge>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold">Operational Intelligence</h4>
              <p className="text-sm text-gray-600">Process optimization and efficiency patterns</p>
              <Badge className="bg-green-100 text-green-800">Real-time</Badge>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                <PieChart className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold">Financial Modeling</h4>
              <p className="text-sm text-gray-600">Revenue optimization and cost analysis</p>
              <Badge className="bg-purple-100 text-purple-800">Predictive</Badge>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                🧠 6 Discovery Algorithms • Universal Schema Analysis • Continuous Learning
              </div>
              <div className="text-sm text-gray-600 mt-1">
                AI analyzes patterns across all {metrics.total_patterns_discovered} discovered patterns in real-time
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500">
        AI Pattern Discovery powered by HERA Universal Schema • 
        Organization: {organizationId} • 
        Learning from {patterns.length} active patterns
      </div>
    </div>
  );
}