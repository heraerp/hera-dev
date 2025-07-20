'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Heart,
  Shield, 
  Zap, 
  Clock, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Activity,
  TestTube,
  Bell,
  RefreshCw,
  Play,
  Pause,
  Settings,
  BarChart3,
  Target,
  Users,
  Database,
  Cpu,
  HardDrive
} from 'lucide-react';

interface HealthMetrics {
  totalHealthChecks: number;
  healthyChecks: number;
  warningChecks: number;
  criticalChecks: number;
  avgHealthScore: number;
  avgResponseTime: number;
  systemUptimePercentage: number;
  overallSystemStatus: 'HEALTHY' | 'WARNING' | 'HIGH_RISK' | 'CRITICAL';
  lastHealthCheck: string;
}

interface TestMetrics {
  totalTestRuns: number;
  passedTests: number;
  failedTests: number;
  avgTestCoverage: number;
  testSuccessRate: number;
  lastTestRun: string;
}

interface AlertMetrics {
  totalAlerts: number;
  activeAlerts: number;
  criticalAlerts: number;
  highAlerts: number;
  lastAlertGenerated: string;
}

interface ReliabilityPrediction {
  predictedIssues: Array<{
    issueType: string;
    probability: number;
    impact: string;
    predictedOccurrence: string;
    description: string;
  }>;
  riskScore: string;
  confidenceLevel: number;
  recommendations: Array<{
    priority: string;
    category: string;
    recommendation: string;
    estimatedImpact: string;
  }>;
}

interface SystemHealthDashboardProps {
  organizationId: string;
}

export function SystemHealthDashboard({ organizationId }: SystemHealthDashboardProps) {
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics>({
    totalHealthChecks: 0,
    healthyChecks: 0,
    warningChecks: 0,
    criticalChecks: 0,
    avgHealthScore: 0,
    avgResponseTime: 0,
    systemUptimePercentage: 0,
    overallSystemStatus: 'HEALTHY',
    lastHealthCheck: 'Never'
  });

  const [testMetrics, setTestMetrics] = useState<TestMetrics>({
    totalTestRuns: 0,
    passedTests: 0,
    failedTests: 0,
    avgTestCoverage: 0,
    testSuccessRate: 0,
    lastTestRun: 'Never'
  });

  const [alertMetrics, setAlertMetrics] = useState<AlertMetrics>({
    totalAlerts: 0,
    activeAlerts: 0,
    criticalAlerts: 0,
    highAlerts: 0,
    lastAlertGenerated: 'None'
  });

  const [reliabilityPrediction, setReliabilityPrediction] = useState<ReliabilityPrediction>({
    predictedIssues: [],
    riskScore: 'low',
    confidenceLevel: 0,
    recommendations: []
  });

  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    loadMonitoringData();
    
    if (autoRefresh) {
      const interval = setInterval(loadMonitoringData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [organizationId, autoRefresh]);

  const loadMonitoringData = async () => {
    setLoading(true);
    try {
      // Simulate loading comprehensive monitoring data
      // In real implementation, this would call your monitoring APIs
      
      // Mock health metrics
      setHealthMetrics({
        totalHealthChecks: 48,
        healthyChecks: 45,
        warningChecks: 3,
        criticalChecks: 0,
        avgHealthScore: 94.2,
        avgResponseTime: 145.8,
        systemUptimePercentage: 99.87,
        overallSystemStatus: 'HEALTHY',
        lastHealthCheck: '2 minutes ago'
      });

      // Mock test metrics
      setTestMetrics({
        totalTestRuns: 12,
        passedTests: 11,
        failedTests: 1,
        avgTestCoverage: 87.5,
        testSuccessRate: 91.67,
        lastTestRun: '15 minutes ago'
      });

      // Mock alert metrics
      setAlertMetrics({
        totalAlerts: 5,
        activeAlerts: 2,
        criticalAlerts: 0,
        highAlerts: 1,
        lastAlertGenerated: '8 minutes ago'
      });

      // Mock reliability prediction
      setReliabilityPrediction({
        predictedIssues: [
          {
            issueType: 'performance_degradation',
            probability: 0.65,
            impact: 'medium',
            predictedOccurrence: 'next 48 hours',
            description: 'Response time trending upward'
          }
        ],
        riskScore: 'low',
        confidenceLevel: 0.85,
        recommendations: [
          {
            priority: 'medium',
            category: 'performance',
            recommendation: 'Optimize slow queries and add caching',
            estimatedImpact: 'Reduce response time by 30-40%'
          }
        ]
      });

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeHealthCheck = async (checkType: string) => {
    try {
      // In real implementation, call execute_health_check function
      console.log(`Executing ${checkType} health check...`);
      alert(`${checkType} health check initiated successfully!`);
      await loadMonitoringData();
    } catch (error) {
      console.error(`Error executing ${checkType} health check:`, error);
    }
  };

  const runAutomatedTest = async (testType: string) => {
    try {
      // In real implementation, call execute_automated_test function
      console.log(`Running ${testType} automated test...`);
      alert(`${testType} test suite started successfully!`);
      await loadMonitoringData();
    } catch (error) {
      console.error(`Error running ${testType} test:`, error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY': return 'text-green-600 bg-green-50';
      case 'WARNING': return 'text-yellow-600 bg-yellow-50';
      case 'HIGH_RISK': return 'text-orange-600 bg-orange-50';
      case 'CRITICAL': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'HEALTHY': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'WARNING': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'HIGH_RISK': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'CRITICAL': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRiskColor = (riskScore: string) => {
    switch (riskScore.toLowerCase()) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading System Health Data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${getStatusColor(healthMetrics.overallSystemStatus)}`}>
            {getStatusIcon(healthMetrics.overallSystemStatus)}
            <span className="font-semibold">System Status: {healthMetrics.overallSystemStatus}</span>
          </div>
          <Badge variant="outline">
            Uptime: {healthMetrics.systemUptimePercentage}%
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="flex items-center space-x-1"
          >
            {autoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{autoRefresh ? 'Pause' : 'Resume'}</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadMonitoringData}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Health Score</p>
                <p className="text-2xl font-bold">{healthMetrics.avgHealthScore}</p>
              </div>
              <Heart className="w-8 h-8 text-green-500" />
            </div>
            <Progress value={healthMetrics.avgHealthScore} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Time</p>
                <p className="text-2xl font-bold">{healthMetrics.avgResponseTime}ms</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2 text-xs">
              <TrendingDown className="w-3 h-3 text-green-500 mr-1" />
              <span className="text-green-600">5.2% improvement</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Test Coverage</p>
                <p className="text-2xl font-bold">{testMetrics.avgTestCoverage}%</p>
              </div>
              <TestTube className="w-8 h-8 text-purple-500" />
            </div>
            <Progress value={testMetrics.avgTestCoverage} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold">{alertMetrics.activeAlerts}</p>
              </div>
              <Bell className="w-8 h-8 text-orange-500" />
            </div>
            <div className="text-xs text-gray-600 mt-2">
              {alertMetrics.criticalAlerts} critical, {alertMetrics.highAlerts} high
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Checks and Testing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-500" />
              System Health Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{healthMetrics.healthyChecks}</div>
                  <div className="text-sm text-gray-600">Healthy</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{healthMetrics.warningChecks}</div>
                  <div className="text-sm text-gray-600">Warning</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{healthMetrics.criticalChecks}</div>
                  <div className="text-sm text-gray-600">Critical</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Data Integrity</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => executeHealthCheck('data_integrity')}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Run Check
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Performance</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => executeHealthCheck('performance')}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Run Check
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">System Capacity</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => executeHealthCheck('system_capacity')}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Run Check
                  </Button>
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                Last check: {healthMetrics.lastHealthCheck}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TestTube className="w-5 h-5 mr-2 text-purple-500" />
              Automated Testing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{testMetrics.passedTests}</div>
                  <div className="text-sm text-gray-600">Passed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{testMetrics.failedTests}</div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Functional Tests</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => runAutomatedTest('functional')}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Run Tests
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Integration Tests</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => runAutomatedTest('integration')}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Run Tests
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Security Tests</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => runAutomatedTest('security')}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Run Tests
                  </Button>
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                Last test run: {testMetrics.lastTestRun} | Success rate: {testMetrics.testSuccessRate}%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Predictive Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-500" />
            AI Predictive Reliability Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
                Predicted Issues
              </h4>
              {reliabilityPrediction.predictedIssues.length > 0 ? (
                <div className="space-y-3">
                  {reliabilityPrediction.predictedIssues.map((issue, index) => (
                    <div key={index} className="border-l-4 border-yellow-500 pl-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{issue.issueType.replace('_', ' ')}</span>
                        <Badge variant="outline">
                          {Math.round(issue.probability * 100)}% probability
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{issue.description}</p>
                      <p className="text-xs text-gray-500">Expected: {issue.predictedOccurrence}</p>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-sm">
                    <span>AI Confidence:</span>
                    <span className="font-medium">{Math.round(reliabilityPrediction.confidenceLevel * 100)}%</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600">No issues predicted for the next 48 hours</p>
              )}
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2 text-green-500" />
                AI Recommendations
              </h4>
              {reliabilityPrediction.recommendations.length > 0 ? (
                <div className="space-y-3">
                  {reliabilityPrediction.recommendations.map((rec, index) => (
                    <div key={index} className="border-l-4 border-green-500 pl-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{rec.category}</span>
                        <Badge variant="outline">{rec.priority}</Badge>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{rec.recommendation}</p>
                      <p className="text-xs text-green-600">Impact: {rec.estimatedImpact}</p>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2 text-sm">
                    <span>Risk Score:</span>
                    <span className={`font-medium capitalize ${getRiskColor(reliabilityPrediction.riskScore)}`}>
                      {reliabilityPrediction.riskScore}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600">System operating optimally - no recommendations at this time</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500">
        Last updated: {lastRefresh.toLocaleTimeString()} | 
        Auto-refresh: {autoRefresh ? 'Enabled (30s)' : 'Disabled'} | 
        AI continuously monitors system health and predicts issues
      </div>
    </div>
  );
}