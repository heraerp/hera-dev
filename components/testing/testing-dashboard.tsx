'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  PlayCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Database,
  Settings,
  FileText,
  Activity
} from 'lucide-react';
import HERATestingService from '@/lib/services/testing-service';
import { 
  TestSuite, 
  TestExecution, 
  TestAnalytics, 
  TestExecutionReport,
  TestResult,
  TestDashboardData
} from '@/types/testing';

interface TestingDashboardProps {
  organizationId?: string;
  userId?: string;
}

export default function TestingDashboard({ 
  organizationId = '11111111-1111-1111-1111-111111111111',
  userId = '00000000-0000-0000-0000-000000000000'
}: TestingDashboardProps) {
  const [testingService] = useState(() => HERATestingService.getInstance(organizationId));
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [recentExecutions, setRecentExecutions] = useState<TestExecution[]>([]);
  const [analytics, setAnalytics] = useState<TestAnalytics | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<TestExecutionReport | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load test suites
      const suites = await testingService.listTestSuites();
      setTestSuites(suites);

      // Load recent executions
      const executions: TestExecution[] = [];
      for (const suite of suites) {
        const suiteExecutions = await testingService.listTestExecutions(suite.id);
        executions.push(...suiteExecutions);
      }
      
      // Sort by most recent first
      executions.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRecentExecutions(executions.slice(0, 10));

      // Load analytics
      const analyticsData = await testingService.getTestAnalytics();
      setAnalytics(analyticsData);

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const runUniversalSchemaTests = async () => {
    try {
      setIsRunningTests(true);
      setError(null);

      const executionId = await testingService.runUniversalSchemaTests(userId);
      
      // Wait a moment for test to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get detailed report
      const report = await testingService.getTestExecutionReport(executionId);
      setSelectedExecution(report);
      
      // Reload dashboard data
      await loadDashboardData();
      
    } catch (err) {
      console.error('Error running tests:', err);
      setError(err instanceof Error ? err.message : 'Failed to run tests');
    } finally {
      setIsRunningTests(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASSED':
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'FAILED':
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'running':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASSED':
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading testing dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Testing Dashboard</h1>
        <Button 
          onClick={runUniversalSchemaTests}
          disabled={isRunningTests}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isRunningTests ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <PlayCircle className="w-4 h-4 mr-2" />
              Run Universal Schema Tests
            </>
          )}
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalExecutions}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.successRate.toFixed(1)}%</div>
              <Progress value={analytics.successRate} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.averageDuration.toFixed(0)}ms</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Test Suites</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{testSuites.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="executions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="executions">Recent Executions</TabsTrigger>
          <TabsTrigger value="suites">Test Suites</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
        </TabsList>

        {/* Recent Executions Tab */}
        <TabsContent value="executions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Test Executions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentExecutions.length === 0 ? (
                  <div className="text-center py-8">
                    <Database className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">No test executions found</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Run your first test to see executions here
                    </p>
                  </div>
                ) : (
                  recentExecutions.map((execution) => (
                    <div key={execution.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(execution.status)}
                          <span className="font-medium">{execution.type}</span>
                          <Badge className={getStatusColor(execution.status)}>
                            {execution.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(execution.createdAt).toLocaleString()}
                        </div>
                      </div>
                      
                      {execution.results && (
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {execution.results.passed}
                            </div>
                            <div className="text-sm text-gray-600">Passed</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">
                              {execution.results.failed}
                            </div>
                            <div className="text-sm text-gray-600">Failed</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {execution.results.total}
                            </div>
                            <div className="text-sm text-gray-600">Total</div>
                          </div>
                        </div>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={async () => {
                          try {
                            const report = await testingService.getTestExecutionReport(execution.id);
                            setSelectedExecution(report);
                          } catch (err) {
                            console.error('Error loading execution report:', err);
                          }
                        }}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Suites Tab */}
        <TabsContent value="suites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Suites</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testSuites.length === 0 ? (
                  <div className="text-center py-8">
                    <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">No test suites found</p>
                  </div>
                ) : (
                  testSuites.map((suite) => (
                    <div key={suite.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-medium">{suite.name}</h3>
                          <p className="text-sm text-gray-600">{suite.code}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{suite.type}</Badge>
                          <Badge className={getStatusColor(suite.status)}>
                            {suite.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-500 mt-2">
                        Created: {new Date(suite.createdAt).toLocaleString()}
                      </div>
                      
                      <div className="flex space-x-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              const executionId = await testingService.createTestExecution(
                                suite.id,
                                'manual',
                                userId
                              );
                              await loadDashboardData();
                            } catch (err) {
                              console.error('Error creating execution:', err);
                            }
                          }}
                        >
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Run Suite
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              const executions = await testingService.listTestExecutions(suite.id);
                              // Handle viewing executions
                            } catch (err) {
                              console.error('Error loading executions:', err);
                            }
                          }}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View History
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Results Tab */}
        <TabsContent value="results" className="space-y-4">
          {selectedExecution ? (
            <Card>
              <CardHeader>
                <CardTitle>Test Execution Report</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(selectedExecution.executionStatus)}>
                    {selectedExecution.executionStatus}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {selectedExecution.executionTimeMs}ms
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedExecution.passedTests}
                    </div>
                    <div className="text-sm text-gray-600">Passed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {selectedExecution.failedTests}
                    </div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedExecution.totalTests}
                    </div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Test Details</h4>
                  {selectedExecution.testDetails && selectedExecution.testDetails.length > 0 ? (
                    selectedExecution.testDetails.map((test, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(test.status)}
                          <span className="font-medium">{test.testName}</span>
                          <Badge variant="outline">{test.category}</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          {test.message}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No test details available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Select a test execution to view results</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}