'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Database,
  Brain,
  Zap,
  Target,
  Activity,
  Shield,
  RefreshCw,
  Play,
  Pause,
  Eye,
  Settings,
  BarChart3
} from 'lucide-react';

interface QuarterEndStep {
  id: string;
  step_name: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'review_required';
  assigned_to: string;
  estimated_hours: number;
  actual_hours?: number;
  dependencies: string[];
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  automation_level: number;
  ai_recommendations: string[];
  entity_types_involved: string[];
  transaction_count?: number;
}

interface QuarterEndMetrics {
  total_steps: number;
  completed_steps: number;
  in_progress_steps: number;
  blocked_steps: number;
  overall_progress: number;
  estimated_completion: string;
  critical_path_steps: number;
  automation_score: number;
  compliance_score: number;
}

export default function QuarterEndClosePage() {
  const [organizationId] = useState('00000000-0000-0000-0000-000000000001');
  const [closeSteps, setCloseSteps] = useState<QuarterEndStep[]>([
    {
      id: 'mgmt-fees',
      step_name: 'Management Performance Fees',
      description: 'Post management performance fees in advance for quarterly performance',
      status: 'completed',
      assigned_to: 'Finance Team',
      estimated_hours: 8,
      actual_hours: 6.5,
      dependencies: [],
      deadline: '2024-01-15T17:00:00Z',
      priority: 'high',
      automation_level: 75,
      ai_recommendations: [
        'AI detected 12% variance in fee calculations - review recommended',
        'Historical patterns suggest optimizing fee posting timing by 2 days'
      ],
      entity_types_involved: ['fee_transaction', 'performance_metric', 'client_account'],
      transaction_count: 47
    },
    {
      id: 'property-costs',
      step_name: 'Property Related Costs & Rebates',
      description: 'Process property-related cost allocations and rebate calculations',
      status: 'in_progress',
      assigned_to: 'Property Accounting',
      estimated_hours: 12,
      actual_hours: 8.5,
      dependencies: ['mgmt-fees'],
      deadline: '2024-01-16T17:00:00Z',
      priority: 'high',
      automation_level: 60,
      ai_recommendations: [
        'AI identified $23K in potential rebate optimizations',
        'Pattern suggests consolidating property cost entries for efficiency'
      ],
      entity_types_involved: ['property_cost', 'rebate_calculation', 'allocation_rule'],
      transaction_count: 156
    },
    {
      id: 'depreciation',
      step_name: 'Depreciation & Fixed Assets',
      description: 'Calculate depreciation and reconcile fixed asset registers',
      status: 'in_progress',
      assigned_to: 'Fixed Assets Team',
      estimated_hours: 16,
      actual_hours: 12,
      dependencies: ['property-costs'],
      deadline: '2024-01-17T17:00:00Z',
      priority: 'high',
      automation_level: 85,
      ai_recommendations: [
        'AI automation reduced manual effort by 40%',
        'Depreciation calculations verified with 99.2% accuracy'
      ],
      entity_types_involved: ['fixed_asset', 'depreciation_schedule', 'asset_reconciliation'],
      transaction_count: 89
    },
    {
      id: 'overseas-close',
      step_name: 'Overseas Close Review',
      description: 'Review and validate overseas subsidiary postings and close procedures',
      status: 'not_started',
      assigned_to: 'International Accounting',
      estimated_hours: 20,
      dependencies: ['depreciation'],
      deadline: '2024-01-18T17:00:00Z',
      priority: 'high',
      automation_level: 45,
      ai_recommendations: [
        'Currency fluctuation detected - hedge accounting review suggested',
        'AI translation services available for foreign documentation'
      ],
      entity_types_involved: ['overseas_entity', 'currency_translation', 'subsidiary_close'],
      transaction_count: 234
    },
    {
      id: 'ap-costing',
      step_name: 'AP Costing & Close',
      description: 'Close accounts payable and perform cost allocations',
      status: 'not_started',
      assigned_to: 'AP Team',
      estimated_hours: 14,
      dependencies: ['overseas-close'],
      deadline: '2024-01-19T17:00:00Z',
      priority: 'medium',
      automation_level: 70,
      ai_recommendations: [
        'AI matching reduced invoice processing time by 60%',
        'Predictive costing models available for complex allocations'
      ],
      entity_types_involved: ['ap_invoice', 'cost_allocation', 'vendor_payment'],
      transaction_count: 567
    },
    {
      id: 'concur-expenses',
      step_name: 'Concur Expenses & Invoices',
      description: 'Process Concur expense reports and invoice accruals',
      status: 'not_started',
      assigned_to: 'Expense Management',
      estimated_hours: 10,
      dependencies: ['ap-costing'],
      deadline: '2024-01-20T17:00:00Z',
      priority: 'medium',
      automation_level: 90,
      ai_recommendations: [
        'AI expense categorization at 95% accuracy',
        'Automated policy compliance checking enabled'
      ],
      entity_types_involved: ['expense_report', 'invoice_accrual', 'policy_compliance'],
      transaction_count: 345
    },
    {
      id: 'foundation-reconciliation',
      step_name: 'Foundation & Advisors Reconciliation',
      description: 'Reconcile foundation accounts and advisor fee calculations',
      status: 'not_started',
      assigned_to: 'Foundation Accounting',
      estimated_hours: 18,
      dependencies: ['concur-expenses'],
      deadline: '2024-01-21T17:00:00Z',
      priority: 'high',
      automation_level: 55,
      ai_recommendations: [
        'AI detected pattern in advisor fee structures - optimization possible',
        'Foundation reporting automation available for compliance'
      ],
      entity_types_involved: ['foundation_account', 'advisor_fee', 'charitable_allocation'],
      transaction_count: 78
    },
    {
      id: 'payroll-postings',
      step_name: 'Payroll Postings & Prepayments',
      description: 'Post payroll transactions and review prepayment schedules',
      status: 'not_started',
      assigned_to: 'Payroll Team',
      estimated_hours: 12,
      dependencies: ['foundation-reconciliation'],
      deadline: '2024-01-22T17:00:00Z',
      priority: 'medium',
      automation_level: 80,
      ai_recommendations: [
        'AI payroll verification reduces errors by 85%',
        'Prepayment optimization suggests timing adjustments'
      ],
      entity_types_involved: ['payroll_transaction', 'prepayment_schedule', 'employee_benefit'],
      transaction_count: 234
    },
    {
      id: 'vat-submission',
      step_name: 'VAT Data & Accruals',
      description: 'Submit VAT data and process expense/invoice accruals',
      status: 'not_started',
      assigned_to: 'Tax Team',
      estimated_hours: 16,
      dependencies: ['payroll-postings'],
      deadline: '2024-01-23T17:00:00Z',
      priority: 'high',
      automation_level: 75,
      ai_recommendations: [
        'AI VAT classification at 98% accuracy',
        'Automated compliance checking for multiple jurisdictions'
      ],
      entity_types_involved: ['vat_transaction', 'tax_accrual', 'compliance_report'],
      transaction_count: 456
    },
    {
      id: 'fca-submission',
      step_name: 'FCA Regulatory Submission',
      description: 'Prepare and submit FCA regulatory reports and compliance documentation',
      status: 'not_started',
      assigned_to: 'Compliance Team',
      estimated_hours: 24,
      dependencies: ['vat-submission'],
      deadline: '2024-01-24T17:00:00Z',
      priority: 'high',
      automation_level: 65,
      ai_recommendations: [
        'AI regulatory mapping ensures 100% compliance coverage',
        'Automated report generation reduces preparation time by 50%'
      ],
      entity_types_involved: ['regulatory_report', 'compliance_metric', 'fca_submission'],
      transaction_count: 123
    }
  ]);

  const [metrics, setMetrics] = useState<QuarterEndMetrics>({
    total_steps: 10,
    completed_steps: 1,
    in_progress_steps: 2,
    blocked_steps: 0,
    overall_progress: 15,
    estimated_completion: '2024-01-24T17:00:00Z',
    critical_path_steps: 7,
    automation_score: 70,
    compliance_score: 94
  });

  const [aiInsights, setAiInsights] = useState([
    {
      type: 'optimization',
      message: 'AI detected potential 3-day acceleration in close timeline through parallel processing',
      confidence: 0.89,
      actionable: true
    },
    {
      type: 'risk',
      message: 'Overseas close dependency risk identified - recommend early engagement',
      confidence: 0.92,
      actionable: true
    },
    {
      type: 'efficiency',
      message: 'Automation opportunities could increase overall process efficiency by 35%',
      confidence: 0.87,
      actionable: true
    }
  ]);

  useEffect(() => {
    // Calculate metrics from steps
    const completed = closeSteps.filter(step => step.status === 'completed').length;
    const inProgress = closeSteps.filter(step => step.status === 'in_progress').length;
    const blocked = closeSteps.filter(step => step.status === 'blocked').length;
    const progress = Math.round((completed / closeSteps.length) * 100);
    const avgAutomation = Math.round(closeSteps.reduce((sum, step) => sum + step.automation_level, 0) / closeSteps.length);

    setMetrics(prev => ({
      ...prev,
      completed_steps: completed,
      in_progress_steps: inProgress,
      blocked_steps: blocked,
      overall_progress: progress,
      automation_score: avgAutomation
    }));
  }, [closeSteps]);

  const executeAICommand = async (command: string) => {
    try {
      // Simulate HERA Universal Transaction for AI command
      const aiTransaction = {
        id: crypto.randomUUID(),
        organization_id: organizationId,
        transaction_type: 'quarter_end_ai_command',
        transaction_number: `QE-AI-${Date.now()}`,
        transaction_date: new Date().toISOString(),
        transaction_status: 'processing',
        transaction_data: {
          command: command,
          quarter: 'Q4-2024',
          processing_stage: 'analysis',
          ai_confidence: Math.random() * 0.3 + 0.7
        },
        ai_generated: true,
        created_by: 'ai_assistant'
      };

      console.log('Quarter-end AI command executed:', aiTransaction);
      alert(`🤖 AI Command: "${command}"\n✅ Processing with ${Math.round(aiTransaction.transaction_data.ai_confidence * 100)}% confidence\n📊 Transaction ID: ${aiTransaction.id}`);
    } catch (error) {
      console.error('AI command execution failed:', error);
    }
  };

  const updateStepStatus = (stepId: string, newStatus: QuarterEndStep['status']) => {
    setCloseSteps(prev => 
      prev.map(step => 
        step.id === stepId 
          ? { ...step, status: newStatus }
          : step
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'review_required': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'blocked': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'review_required': return <Eye className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8 bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-purple-950 min-h-screen">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Calendar className="w-12 h-12 text-purple-600" />
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Quarter-End Close Management
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              AI-Powered Financial Close Process • Q4 2024
            </p>
          </div>
        </div>
      </div>

      {/* Overall Progress Dashboard */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-purple-500" />
              Quarter-End Close Progress
            </div>
            <Badge className="bg-purple-100 text-purple-800">
              {metrics.overall_progress}% Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{metrics.total_steps}</div>
              <div className="text-sm text-gray-600">Total Steps</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.completed_steps}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.in_progress_steps}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{metrics.blocked_steps}</div>
              <div className="text-sm text-gray-600">Blocked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{metrics.automation_score}%</div>
              <div className="text-sm text-gray-600">AI Automation</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600">{metrics.compliance_score}%</div>
              <div className="text-sm text-gray-600">Compliance</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-gray-600">{metrics.overall_progress}%</span>
              </div>
              <Progress value={metrics.overall_progress} className="h-3" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">AI Automation Level</span>
                <span className="text-sm text-gray-600">{metrics.automation_score}%</span>
              </div>
              <Progress value={metrics.automation_score} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="steps" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
          <TabsTrigger value="steps">
            <FileText className="w-4 h-4 mr-2" />
            Close Steps
          </TabsTrigger>
          <TabsTrigger value="ai-insights">
            <Brain className="w-4 h-4 mr-2" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="automation">
            <Zap className="w-4 h-4 mr-2" />
            Automation
          </TabsTrigger>
          <TabsTrigger value="compliance">
            <Shield className="w-4 h-4 mr-2" />
            Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="steps" className="space-y-4">
          {closeSteps.map((step, index) => (
            <Card key={step.id} className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center mr-3 text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <span className="text-lg">{step.step_name}</span>
                      <div className="text-sm text-gray-600 font-normal">{step.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(step.status)}
                    <Badge className={getStatusColor(step.status)}>
                      {step.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-600">Assigned To</div>
                    <div className="font-medium">{step.assigned_to}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Deadline</div>
                    <div className="font-medium">{new Date(step.deadline).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Priority</div>
                    <div className={`font-medium capitalize ${getPriorityColor(step.priority)}`}>
                      {step.priority}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Automation</div>
                    <div className="flex items-center space-x-2">
                      <Progress value={step.automation_level} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{step.automation_level}%</span>
                    </div>
                  </div>
                </div>

                {step.transaction_count && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-600">Universal Transactions</div>
                    <div className="font-medium">{step.transaction_count.toLocaleString()} transactions processed</div>
                  </div>
                )}

                <div className="mb-4">
                  <div className="text-sm font-medium mb-2">Entity Types Involved:</div>
                  <div className="flex flex-wrap gap-2">
                    {step.entity_types_involved.map((entityType) => (
                      <Badge key={entityType} variant="outline" className="text-xs">
                        {entityType.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>

                {step.ai_recommendations.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium mb-2 flex items-center">
                      <Brain className="w-4 h-4 mr-1 text-purple-500" />
                      AI Recommendations:
                    </div>
                    <ul className="space-y-1">
                      {step.ai_recommendations.map((recommendation, idx) => (
                        <li key={idx} className="text-sm text-purple-600 dark:text-purple-400 flex items-start">
                          <Zap className="w-3 h-3 mr-2 text-purple-500 mt-0.5 flex-shrink-0" />
                          {recommendation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Progress: {step.actual_hours || 0} / {step.estimated_hours} hours
                  </div>
                  <div className="space-x-2">
                    {step.status === 'not_started' && (
                      <Button 
                        size="sm" 
                        onClick={() => updateStepStatus(step.id, 'in_progress')}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Start
                      </Button>
                    )}
                    {step.status === 'in_progress' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateStepStatus(step.id, 'completed')}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-6">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="w-5 h-5 mr-2 text-blue-500" />
                AI-Powered Quarter-End Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiInsights.map((insight, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 bg-white/50 dark:bg-slate-800/50 p-4 rounded-r-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={
                        insight.type === 'optimization' ? 'bg-green-100 text-green-800' :
                        insight.type === 'risk' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }>
                        {insight.type}
                      </Badge>
                      <Badge variant="outline">
                        {Math.round(insight.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{insight.message}</p>
                    {insight.actionable && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => executeAICommand(`implement_${insight.type}_suggestion`)}
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Apply Recommendation
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-green-500" />
                Natural Language Commands
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
                      onClick={() => executeAICommand("Accelerate quarter-end close timeline")}
                    >
                      "Accelerate quarter-end close timeline"
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => executeAICommand("Find automation opportunities in close process")}
                    >
                      "Find automation opportunities in close process"
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => executeAICommand("Analyze compliance risks for FCA submission")}
                    >
                      "Analyze compliance risks for FCA submission"
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">🎯 AI Capabilities:</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Process Optimization</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Risk Assessment</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Timeline Prediction</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Compliance Monitoring</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                Automation Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {closeSteps.filter(step => step.automation_level < 80).map((step) => (
                  <div key={step.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{step.step_name}</h4>
                      <Badge variant="outline">
                        {step.automation_level}% automated
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      Potential automation increase: {Math.min(100, step.automation_level + 25)}%
                    </div>
                    <Button size="sm" variant="outline">
                      <Settings className="w-3 h-3 mr-1" />
                      Configure Automation
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-500" />
                Regulatory Compliance Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">FCA Requirements</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Capital Adequacy Reporting</span>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Risk Management Disclosure</span>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Liquidity Coverage Ratio</span>
                      <Clock className="w-4 h-4 text-yellow-500" />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">VAT Compliance</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">VAT Return Preparation</span>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">EC Sales List</span>
                      <Clock className="w-4 h-4 text-yellow-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Intrastat Declaration</span>
                      <Clock className="w-4 h-4 text-yellow-500" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500">
        HERA Universal Quarter-End Close • Organization: {organizationId} • 
        All processes powered by Universal Schema • AI-Native Automation
      </div>
    </div>
  );
}