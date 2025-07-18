'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAIEnhancedReporting } from '@/hooks/useAIEnhancedReporting';
import { AIEnhancedScannerService } from '@/lib/services/aiEnhancedScannerService';
import { OrganizationGuard, useOrganizationContext } from '@/components/restaurant/organization-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Zap,
  Eye,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Lightbulb,
  BarChart3,
  PieChart,
  Activity,
  Scan,
  Camera,
  FileText,
  Settings,
  MessageSquare,
  Shield,
  Cpu
} from 'lucide-react';

// Organization ID comes from authenticated user context

interface AIInsightCardProps {
  insight: any;
  onDismiss: () => void;
  onImplement: () => void;
}

function AIInsightCard({ insight, onDismiss, onImplement }: AIInsightCardProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'recommendation': return <Lightbulb className="h-5 w-5" />;
      case 'warning': return <AlertTriangle className="h-5 w-5" />;
      case 'opportunity': return <Target className="h-5 w-5" />;
      case 'trend': return <TrendingUp className="h-5 w-5" />;
      case 'anomaly': return <Activity className="h-5 w-5" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className={`border-l-4 ${getImpactColor(insight.impact)}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {getInsightIcon(insight.type)}
            <div>
              <CardTitle className="text-lg">{insight.title}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline">{insight.category}</Badge>
                <Badge variant="secondary">{(insight.confidence * 100).toFixed(0)}% confidence</Badge>
                <Badge variant="outline">Priority {insight.priority}</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" onClick={onImplement}>
              <CheckCircle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{insight.description}</p>
        
        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Current</p>
            <p className="text-lg font-semibold">{insight.metrics.current}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Target</p>
            <p className="text-lg font-semibold text-green-600">{insight.metrics.target}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress to Target</span>
            <span>{Math.min(100, (insight.metrics.current / insight.metrics.target * 100)).toFixed(0)}%</span>
          </div>
          <Progress 
            value={Math.min(100, (insight.metrics.current / insight.metrics.target * 100))} 
            className="h-2"
          />
        </div>

        {/* Recommendations */}
        {insight.recommendations && insight.recommendations.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">AI Recommendations:</h4>
            <div className="space-y-2">
              {insight.recommendations.map((rec: any, index: number) => (
                <div key={index} className="bg-muted p-3 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">{rec.action}</p>
                      <p className="text-sm text-muted-foreground">{rec.expectedImpact}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">{rec.timeframe}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">{rec.effort} effort</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface AIDecisionCardProps {
  decision: any;
  onApprove: () => void;
  onReject: () => void;
  onImplement: () => void;
}

function AIDecisionCard({ decision, onApprove, onReject, onImplement }: AIDecisionCardProps) {
  const getDecisionIcon = (type: string) => {
    switch (type) {
      case 'pricing': return <BarChart3 className="h-5 w-5" />;
      case 'inventory': return <PieChart className="h-5 w-5" />;
      case 'staffing': return <Activity className="h-5 w-5" />;
      case 'marketing': return <TrendingUp className="h-5 w-5" />;
      case 'operations': return <Settings className="h-5 w-5" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'implemented': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {getDecisionIcon(decision.decisionType)}
            <div>
              <CardTitle className="text-lg capitalize">{decision.decisionType} Decision</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={getStatusColor(decision.implementationStatus)}>
                  {decision.implementationStatus}
                </Badge>
                <Badge variant="outline">{(decision.confidence * 100).toFixed(0)}% confidence</Badge>
              </div>
            </div>
          </div>
          {decision.implementationStatus === 'pending' && (
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" onClick={onApprove}>
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onReject}>
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </div>
          )}
          {decision.implementationStatus === 'approved' && (
            <Button size="sm" onClick={onImplement}>
              <Zap className="h-4 w-4 mr-1" />
              Implement
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Decision Details */}
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Decision Details:</h4>
          <div className="bg-muted p-3 rounded-lg">
            <pre className="text-sm whitespace-pre-wrap">
              {JSON.stringify(decision.decision, null, 2)}
            </pre>
          </div>
        </div>

        {/* AI Reasoning */}
        <div className="mb-4">
          <h4 className="font-semibold mb-2">AI Reasoning:</h4>
          <ul className="space-y-1">
            {decision.reasoning.map((reason: string, index: number) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start">
                <span className="mr-2">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Expected Outcome */}
        <div>
          <h4 className="font-semibold mb-2">Expected Outcome:</h4>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm">
              <span className="font-medium">{decision.expectedOutcome.metric}:</span> {' '}
              {decision.expectedOutcome.expectedChange > 0 ? '+' : ''}
              {decision.expectedOutcome.expectedChange.toFixed(1)}% change
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Expected timeframe: {decision.expectedOutcome.timeframe}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SmartAlertCardProps {
  alert: any;
  onAcknowledge: () => void;
  onResolve: () => void;
}

function SmartAlertCard({ alert, onAcknowledge, onResolve }: SmartAlertCardProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'urgent': return 'border-orange-500 bg-orange-50';
      case 'warning': return 'border-yellow-500 bg-yellow-50';
      case 'info': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'urgent':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <Alert className={`border-l-4 ${getSeverityColor(alert.severity)}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2">
          {getSeverityIcon(alert.severity)}
          <div className="flex-1">
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
            
            {alert.suggestedActions && alert.suggestedActions.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium mb-1">Suggested Actions:</p>
                <ul className="text-sm space-y-1">
                  {alert.suggestedActions.map((action: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          {!alert.acknowledgedAt && (
            <Button variant="ghost" size="sm" onClick={onAcknowledge}>
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {!alert.resolvedAt && (
            <Button variant="ghost" size="sm" onClick={onResolve}>
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
}

function AIDashboardContent() {
  const { organizationId } = useOrganizationContext();
  const {
    aiInsights,
    aiDecisions,
    smartAlerts,
    businessHealthScore,
    realTimeAnalysis,
    loadingInsights,
    generatingInsights,
    performingAnalysis,
    error,
    generateAIInsights,
    generateAIDecision,
    performRealTimeAnalysis,
    dismissInsight,
    implementInsight,
    approveDecision,
    rejectDecision,
    implementDecision,
    acknowledgeAlert,
    resolveAlert,
    getTopRecommendations,
    getCriticalAlerts,
    refreshAIData,
    aiStats
  } = useAIEnhancedReporting(organizationId!);

  const [activeTab, setActiveTab] = useState('overview');
  const [scanInsights, setScanInsights] = useState<any[]>([]);
  const [loadingScanInsights, setLoadingScanInsights] = useState(false);

  // Load scan insights
  useEffect(() => {
    const loadScanInsights = async () => {
      setLoadingScanInsights(true);
      try {
        const result = await AIEnhancedScannerService.generateScanInsights(organizationId!);
        if (result.success && result.insights) {
          setScanInsights(result.insights);
        }
      } catch (error) {
        console.error('Error loading scan insights:', error);
      } finally {
        setLoadingScanInsights(false);
      }
    };

    loadScanInsights();
  }, []);

  const topRecommendations = getTopRecommendations(3);
  const criticalAlerts = getCriticalAlerts();

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Business Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-blue-600" />
            <span>AI Business Health Score</span>
          </CardTitle>
          <CardDescription>
            Real-time AI assessment of your business performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-3xl font-bold">
                {businessHealthScore.toFixed(1)}
                <span className="text-lg text-muted-foreground">/100</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {aiStats.businessHealthTrend === 'improving' ? '📈 Improving' :
                 aiStats.businessHealthTrend === 'declining' ? '📉 Declining' : '➡️ Stable'}
              </p>
            </div>
            <div className="w-32 h-32 relative">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke={businessHealthScore >= 80 ? "#10b981" : businessHealthScore >= 60 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="2"
                  strokeDasharray={`${businessHealthScore}, 100`}
                  transform="rotate(-90 18 18)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-semibold">
                  {businessHealthScore >= 80 ? 'Excellent' :
                   businessHealthScore >= 60 ? 'Good' : 'Needs Work'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{aiStats.totalInsights}</div>
              <div className="text-sm text-muted-foreground">AI Insights</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{aiStats.implementedDecisions}</div>
              <div className="text-sm text-muted-foreground">Implemented</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{aiStats.pendingDecisions}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{(aiStats.averageConfidence * 100).toFixed(0)}%</div>
              <div className="text-sm text-muted-foreground">Avg Confidence</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>AI Quick Actions</CardTitle>
          <CardDescription>Perform AI analysis and generate insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={generateAIInsights} 
              disabled={generatingInsights}
              className="h-16"
            >
              {generatingInsights && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              <Brain className="h-4 w-4 mr-2" />
              Generate AI Insights
            </Button>
            <Button 
              onClick={performRealTimeAnalysis}
              disabled={performingAnalysis}
              className="h-16"
            >
              {performingAnalysis && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              <Activity className="h-4 w-4 mr-2" />
              Real-Time Analysis
            </Button>
            <Button 
              onClick={() => generateAIDecision('pricing', { currentPrice: 10, demand: 0.8 })}
              className="h-16"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Generate Decision
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Critical Alerts</span>
              <Badge variant="destructive">{criticalAlerts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalAlerts.map((alert) => (
                <SmartAlertCard
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={() => acknowledgeAlert(alert.id)}
                  onResolve={() => resolveAlert(alert.id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <span>Top AI Recommendations</span>
          </CardTitle>
          <CardDescription>Priority insights for immediate action</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topRecommendations.map((insight) => (
              <AIInsightCard
                key={insight.id}
                insight={insight}
                onDismiss={() => dismissInsight(insight.id)}
                onImplement={() => implementInsight(insight.id)}
              />
            ))}
            {topRecommendations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recommendations available. Generate AI insights to see recommendations.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderInsights = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Insights</h2>
          <p className="text-muted-foreground">AI-generated business intelligence and recommendations</p>
        </div>
        <Button onClick={generateAIInsights} disabled={generatingInsights}>
          {generatingInsights && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
          <Brain className="h-4 w-4 mr-2" />
          Generate Insights
        </Button>
      </div>

      <div className="grid gap-6">
        <AnimatePresence>
          {aiInsights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <AIInsightCard
                insight={insight}
                onDismiss={() => dismissInsight(insight.id)}
                onImplement={() => implementInsight(insight.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {aiInsights.length === 0 && !loadingInsights && (
          <div className="text-center py-12">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No AI Insights Generated</h3>
            <p className="text-muted-foreground mb-4">
              Generate AI insights to receive intelligent business recommendations.
            </p>
            <Button onClick={generateAIInsights}>
              <Brain className="h-4 w-4 mr-2" />
              Generate AI Insights
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const renderDecisions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Decisions</h2>
          <p className="text-muted-foreground">AI-generated business decisions for review and implementation</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => generateAIDecision('inventory', { currentStock: 100, velocity: 10 })}>
            Generate Inventory Decision
          </Button>
          <Button onClick={() => generateAIDecision('pricing', { currentPrice: 10, demand: 0.8 })}>
            Generate Pricing Decision
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <AnimatePresence>
          {aiDecisions.map((decision, index) => (
            <motion.div
              key={decision.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <AIDecisionCard
                decision={decision}
                onApprove={() => approveDecision(decision.id)}
                onReject={() => rejectDecision(decision.id)}
                onImplement={() => implementDecision(decision.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {aiDecisions.length === 0 && (
          <div className="text-center py-12">
            <Cpu className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No AI Decisions Generated</h3>
            <p className="text-muted-foreground mb-4">
              Generate AI decisions to receive intelligent business recommendations.
            </p>
            <div className="flex justify-center space-x-2">
              <Button variant="outline" onClick={() => generateAIDecision('inventory', { currentStock: 100, velocity: 10 })}>
                Generate Inventory Decision
              </Button>
              <Button onClick={() => generateAIDecision('pricing', { currentPrice: 10, demand: 0.8 })}>
                Generate Pricing Decision
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderScannerAI = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">AI-Enhanced Scanner</h2>
        <p className="text-muted-foreground">Intelligent scanning with AI-powered recommendations</p>
      </div>

      {/* Scanner Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Scan className="h-5 w-5" />
            <span>Scanner Insights</span>
          </CardTitle>
          <CardDescription>AI analysis of your scanning patterns and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingScanInsights ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Analyzing scan data...</p>
            </div>
          ) : scanInsights.length > 0 ? (
            <div className="space-y-4">
              {scanInsights.map((insight) => (
                <div key={insight.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{insight.title}</h4>
                    <Badge variant="outline">{insight.insightType}</Badge>
                  </div>
                  <p className="text-muted-foreground mb-3">{insight.description}</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Current</p>
                      <p className="font-semibold">{insight.data.currentValue}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Target</p>
                      <p className="font-semibold text-green-600">{insight.data.targetValue}</p>
                    </div>
                    {insight.data.potentialSaving && (
                      <div>
                        <p className="text-muted-foreground">Potential Saving</p>
                        <p className="font-semibold text-green-600">${insight.data.potentialSaving}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No scanner insights available. Start scanning documents to generate insights.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scanner Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Scanner Performance</CardTitle>
          <CardDescription>AI-powered scanning metrics and optimization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">94%</div>
              <div className="text-sm text-muted-foreground">OCR Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">1.2s</div>
              <div className="text-sm text-muted-foreground">Avg Process Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">87%</div>
              <div className="text-sm text-muted-foreground">Auto-Categorization</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">156</div>
              <div className="text-sm text-muted-foreground">Scans This Month</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loadingInsights && aiInsights.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          {/* Enhanced loading header */}
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <div className="h-6 bg-gradient-to-r from-purple-200 to-indigo-200 rounded w-48 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-64 mt-2 animate-pulse"></div>
            </div>
          </div>

          {/* Enhanced loading cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-6 space-y-4 bg-white shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gradient-to-r from-purple-200 to-indigo-200 rounded animate-pulse"></div>
                  <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>
                <div className="h-10 bg-gradient-to-r from-purple-100 to-indigo-100 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg font-medium">Initializing AI Engine...</p>
            <p className="text-sm">Analyzing your business data to generate intelligent insights</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <span>AI-Enhanced Dashboard</span>
          </h1>
          <p className="text-muted-foreground">
            Revolutionary AI integration for intelligent business optimization
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50">
            AI Engine v2.1
          </Badge>
          <Button variant="outline" onClick={refreshAIData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh AI Data
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>AI Engine Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="decisions">AI Decisions</TabsTrigger>
          <TabsTrigger value="scanner">Scanner AI</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {renderInsights()}
        </TabsContent>

        <TabsContent value="decisions" className="space-y-6">
          {renderDecisions()}
        </TabsContent>

        <TabsContent value="scanner" className="space-y-6">
          {renderScannerAI()}
        </TabsContent>
      </Tabs>

      {/* Real-time Analysis Indicator */}
      {performingAnalysis && (
        <div className="fixed bottom-4 right-4">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm">Performing real-time AI analysis...</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// Main component with organization access control
export default function AIDashboardPage() {
  return (
    <OrganizationGuard requiredRole="manager">
      <AIDashboardContent />
    </OrganizationGuard>
  );
}