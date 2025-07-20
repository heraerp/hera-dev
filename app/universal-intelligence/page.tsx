'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain,
  Sparkles,
  TrendingUp,
  Zap,
  Target,
  Users,
  Database,
  Activity,
  Eye,
  Lightbulb,
  RefreshCw,
  Play,
  MessageSquare,
  BarChart3,
  PieChart,
  LineChart,
  Globe,
  Smartphone,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Cpu,
  Heart
} from 'lucide-react';

// HERA Universal Components
import { UniversalBusinessIntelligence } from '@/components/universal/UniversalBusinessIntelligence';
import { AIPatternDiscovery } from '@/components/universal/AIPatternDiscovery';
import { MobileFirstDashboard } from '@/components/universal/MobileFirstDashboard';

export default function UniversalIntelligencePage() {
  const [organizationId, setOrganizationId] = useState<string>('00000000-0000-0000-0000-000000000001');
  const [aiEngine, setAIEngine] = useState({
    isActive: true,
    confidence: 94.5,
    patternsLearned: 1247,
    activeQueries: 15,
    predictiveAccuracy: 91.8,
    systemHealth: 'optimal' as 'optimal' | 'good' | 'warning' | 'critical'
  });

  const [universalMetrics, setUniversalMetrics] = useState({
    totalEntities: 15420,
    transactionsToday: 387,
    activeWorkflows: 23,
    aiDecisions: 2847,
    mobileUsers: 156,
    offlineCapability: 100,
    realTimeUpdates: 45
  });

  const [businessInsights, setBusinessInsights] = useState([
    {
      id: '1',
      type: 'pattern_discovery',
      confidence: 0.94,
      title: 'Peak Customer Activity Detected',
      description: 'AI discovered 40% higher order volume between 12-2 PM on weekdays',
      impact: 'high',
      actionable: true,
      recommendation: 'Consider dynamic staffing adjustments during peak hours'
    },
    {
      id: '2',
      type: 'efficiency_optimization',
      confidence: 0.87,
      title: 'Menu Item Performance Correlation',
      description: 'Items with prep time <5 min have 23% higher customer satisfaction',
      impact: 'medium',
      actionable: true,
      recommendation: 'Optimize menu design to highlight quick-prep items'
    },
    {
      id: '3',
      type: 'predictive_analysis',
      confidence: 0.91,
      title: 'Inventory Demand Forecast',
      description: 'AI predicts 15% increase in ingredient demand next week',
      impact: 'high',
      actionable: true,
      recommendation: 'Adjust procurement schedule to prevent stockouts'
    }
  ]);

  useEffect(() => {
    // Simulate real-time AI learning
    const interval = setInterval(() => {
      setAIEngine(prev => ({
        ...prev,
        patternsLearned: prev.patternsLearned + Math.floor(Math.random() * 3),
        confidence: Math.min(99.9, prev.confidence + (Math.random() - 0.5) * 0.1),
        predictiveAccuracy: Math.min(99.9, prev.predictiveAccuracy + (Math.random() - 0.5) * 0.2)
      }));

      setUniversalMetrics(prev => ({
        ...prev,
        totalEntities: prev.totalEntities + Math.floor(Math.random() * 5),
        transactionsToday: prev.transactionsToday + Math.floor(Math.random() * 3),
        aiDecisions: prev.aiDecisions + Math.floor(Math.random() * 8),
        realTimeUpdates: Math.floor(Math.random() * 100)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const executeAICommand = async (command: string) => {
    try {
      // Simulate AI processing with HERA patterns
      console.log(`AI Command: ${command}`);
      
      // Example of HERA Universal Transaction pattern
      const aiTransaction = {
        id: crypto.randomUUID(),
        organization_id: organizationId,
        transaction_type: 'ai_analysis',
        transaction_number: `AI-${Date.now()}`,
        transaction_date: new Date().toISOString(),
        transaction_status: 'processing',
        ai_confidence: Math.random() * 0.2 + 0.8,
        is_ai_generated: true,
        metadata: {
          command: command,
          processing_time_ms: Math.floor(Math.random() * 2000) + 500,
          algorithm_used: 'pattern_discovery_v2'
        }
      };

      alert(`AI Command executed: "${command}"\nTransaction ID: ${aiTransaction.id}\nConfidence: ${Math.round(aiTransaction.ai_confidence * 100)}%`);
    } catch (error) {
      console.error('AI command execution failed:', error);
    }
  };

  const getHealthIcon = () => {
    switch (aiEngine.systemHealth) {
      case 'optimal': return <Heart className="w-5 h-5 text-green-500" />;
      case 'good': return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'critical': return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 min-h-screen">
      {/* Hero Header - Mobile First Design */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="relative">
            <Brain className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              HERA Universal Intelligence
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              AI-Native Business Intelligence • Mobile-First • Offline-Capable
            </p>
          </div>
        </div>
        
        {/* Real-time AI Status */}
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            {getHealthIcon()}
            <span className="font-medium">System: {aiEngine.systemHealth}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-blue-500" />
            <span>AI Confidence: {aiEngine.confidence.toFixed(1)}%</span>
          </div>
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-green-500" />
            <span>Patterns: {aiEngine.patternsLearned.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Universal Metrics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4 text-center">
            <Database className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{universalMetrics.totalEntities.toLocaleString()}</div>
            <div className="text-xs text-gray-600">Universal Entities</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{universalMetrics.transactionsToday}</div>
            <div className="text-xs text-gray-600">Transactions Today</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4 text-center">
            <Activity className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{universalMetrics.activeWorkflows}</div>
            <div className="text-xs text-gray-600">Active Workflows</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4 text-center">
            <Brain className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{universalMetrics.aiDecisions.toLocaleString()}</div>
            <div className="text-xs text-gray-600">AI Decisions</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4 text-center">
            <Smartphone className="w-6 h-6 text-pink-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{universalMetrics.mobileUsers}</div>
            <div className="text-xs text-gray-600">Mobile Users</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4 text-center">
            <Globe className="w-6 h-6 text-cyan-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{universalMetrics.offlineCapability}%</div>
            <div className="text-xs text-gray-600">Offline Ready</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4 text-center">
            <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{universalMetrics.realTimeUpdates}</div>
            <div className="text-xs text-gray-600">Live Updates</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="intelligence" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
          <TabsTrigger value="intelligence" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
            <Brain className="w-4 h-4 mr-2" />
            AI Intelligence
          </TabsTrigger>
          <TabsTrigger value="patterns" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
            <Eye className="w-4 h-4 mr-2" />
            Pattern Discovery
          </TabsTrigger>
          <TabsTrigger value="mobile" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
            <Smartphone className="w-4 h-4 mr-2" />
            Mobile-First
          </TabsTrigger>
          <TabsTrigger value="universal" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
            <Database className="w-4 h-4 mr-2" />
            Universal Schema
          </TabsTrigger>
        </TabsList>

        <TabsContent value="intelligence" className="space-y-6">
          {/* AI Business Insights */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                AI Business Insights
                <Badge variant="secondary" className="ml-2">Live Learning</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {businessInsights.map((insight) => (
                  <div key={insight.id} className={`border-l-4 p-4 rounded-r-lg ${getImpactColor(insight.impact)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{insight.title}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{Math.round(insight.confidence * 100)}% confidence</Badge>
                        <Badge className={insight.impact === 'high' ? 'bg-red-100 text-red-800' : insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                          {insight.impact} impact
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{insight.description}</p>
                    {insight.actionable && (
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          💡 {insight.recommendation}
                        </p>
                        <Button size="sm" variant="outline" onClick={() => executeAICommand(`implement_${insight.type}`)}>
                          <Play className="w-3 h-3 mr-1" />
                          Implement
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Natural Language AI Interface */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-blue-500" />
                Natural Language Business Intelligence
                <Badge className="ml-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  Vibe Coding
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">🗣️ Try These Commands:</h4>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => executeAICommand("Show me customer satisfaction trends")}
                    >
                      <ArrowRight className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>"Show me customer satisfaction trends"</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => executeAICommand("Find inefficiencies in our workflow")}
                    >
                      <ArrowRight className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>"Find inefficiencies in our workflow"</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => executeAICommand("Predict next month revenue")}
                    >
                      <ArrowRight className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>"Predict next month's revenue"</span>
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">🎯 AI Capabilities:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Pattern Discovery</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Predictive Analysis</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Workflow Optimization</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Real-time Learning</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Confidence Scoring</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Explainable AI</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns">
          <AIPatternDiscovery organizationId={organizationId} />
        </TabsContent>

        <TabsContent value="mobile">
          <MobileFirstDashboard organizationId={organizationId} />
        </TabsContent>

        <TabsContent value="universal">
          <UniversalBusinessIntelligence organizationId={organizationId} />
        </TabsContent>
      </Tabs>

      {/* Footer - HERA Principles */}
      <Card className="bg-gradient-to-r from-slate-100 to-blue-100 dark:from-slate-800 dark:to-blue-900 border-0">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-bold">🚀 HERA Universal Principles in Action</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-center space-x-2">
                <Database className="w-4 h-4 text-blue-500" />
                <span><strong>Universal Schema:</strong> No new tables, infinite flexibility</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Brain className="w-4 h-4 text-purple-500" />
                <span><strong>AI-Native:</strong> Intelligence embedded throughout</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Smartphone className="w-4 h-4 text-green-500" />
                <span><strong>Mobile-First:</strong> 100% offline-capable operations</span>
              </div>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Built with HERA Universal Architecture • Real-time AI Learning • Organization-First Security
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}