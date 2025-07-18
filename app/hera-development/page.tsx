/**
 * 🏗️ HERA Development Dashboard
 * 
 * Revolutionary interface where HERA develops itself using restaurant metaphors.
 * This page demonstrates the self-referential architecture where platform 
 * development is managed like restaurant operations.
 * 
 * Features:
 * - Development "menu" of available features
 * - Feature requests as "orders" 
 * - AI models as "special recipes"
 * - Quality metrics as "customer satisfaction"
 * - System organizations as "restaurant branches"
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import HeraSystemService, { 
  SYSTEM_ORGANIZATIONS, 
  SYSTEM_ENTITY_TYPES,
  HeraDevelopmentMetrics,
  SystemOrganizationType 
} from '@/lib/services/heraSystemService';
import { 
  Brain, 
  Code, 
  Shield, 
  BarChart3, 
  Settings, 
  GitBranch,
  Zap,
  Target,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Activity,
  TrendingUp,
  Users,
  Database,
  Cpu,
  Lock,
  TestTube,
  Palette,
  Rocket
} from 'lucide-react';

interface SystemEntity {
  id: string;
  entity_name: string;
  entity_type: string;
  entity_code: string;
  organization_id: string;
  created_at: string;
  metadata?: any;
  fields?: any;
}

interface NewFeatureRequest {
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'feature' | 'bug_fix' | 'enhancement' | 'security';
  estimatedEffort: string;
}

const organizationIcons = {
  CORE_PLATFORM: Code,
  AI_INTELLIGENCE: Brain,
  SECURITY_COMPLIANCE: Shield,
  DEVELOPER_TOOLS: Settings,
  ANALYTICS_BI: BarChart3,
  INTEGRATION_API: GitBranch
};

const organizationColors = {
  CORE_PLATFORM: 'bg-blue-500',
  AI_INTELLIGENCE: 'bg-purple-500',
  SECURITY_COMPLIANCE: 'bg-red-500',
  DEVELOPER_TOOLS: 'bg-green-500',
  ANALYTICS_BI: 'bg-yellow-500',
  INTEGRATION_API: 'bg-indigo-500'
};

export default function HeraDevelopmentDashboard() {
  const [metrics, setMetrics] = useState<HeraDevelopmentMetrics>({
    totalFeatures: 0,
    completedFeatures: 0,
    activeAIModels: 0,
    testCoverage: 0,
    qualityScore: 0,
    securityScore: 0,
    performanceScore: 0,
    developmentVelocity: 0
  });
  
  const [systemEntities, setSystemEntities] = useState<SystemEntity[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<SystemOrganizationType>('CORE_PLATFORM');
  const [loading, setLoading] = useState(true);
  const [showNewFeatureForm, setShowNewFeatureForm] = useState(false);
  const [newFeatureRequest, setNewFeatureRequest] = useState<NewFeatureRequest>({
    title: '',
    description: '',
    priority: 'medium',
    category: 'feature',
    estimatedEffort: ''
  });

  useEffect(() => {
    loadHeraDevelopmentData();
  }, []);

  const loadHeraDevelopmentData = async () => {
    console.log('🏗️ Loading HERA development data...');
    setLoading(true);
    
    try {
      // Load development metrics
      const developmentMetrics = await HeraSystemService.getHeraDevelopmentMetrics();
      setMetrics(developmentMetrics);
      
      // Load system entities for current organization
      const entities = await HeraSystemService.querySystemEntities({
        organizationType: selectedOrg,
        includeMetadata: true,
        includeFields: true
      });
      setSystemEntities(entities);
      
      console.log('✅ HERA development data loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load HERA development data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrganizationChange = async (orgType: SystemOrganizationType) => {
    setSelectedOrg(orgType);
    setLoading(true);
    
    try {
      const entities = await HeraSystemService.querySystemEntities({
        organizationType: orgType,
        includeMetadata: true,
        includeFields: true
      });
      setSystemEntities(entities);
    } catch (error) {
      console.error('❌ Failed to load organization data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFeatureRequest = async () => {
    if (!newFeatureRequest.title || !newFeatureRequest.description) {
      alert('Please fill in title and description');
      return;
    }
    
    console.log('🚀 Creating new feature request:', newFeatureRequest.title);
    
    try {
      const result = await HeraSystemService.createDevelopmentOrder({
        title: newFeatureRequest.title,
        description: newFeatureRequest.description,
        priority: newFeatureRequest.priority,
        category: newFeatureRequest.category,
        estimatedEffort: newFeatureRequest.estimatedEffort || '1-2 sprints'
      });
      
      if (result.success) {
        console.log('✅ Feature request created successfully');
        setShowNewFeatureForm(false);
        setNewFeatureRequest({
          title: '',
          description: '',
          priority: 'medium',
          category: 'feature',
          estimatedEffort: ''
        });
        // Reload data to show new request
        await loadHeraDevelopmentData();
      } else {
        alert(`Failed to create feature request: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Failed to create feature request:', error);
      alert('Failed to create feature request');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      case 'pending': return 'text-yellow-600';
      case 'blocked': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading && systemEntities.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading HERA Development Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Rocket className="w-6 h-6 text-blue-600" />
                HERA Development Center
              </h1>
              <p className="text-slate-600 mt-1">
                Self-Development Architecture - HERA developing HERA using restaurant metaphors
              </p>
            </div>
            <Button 
              onClick={() => setShowNewFeatureForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Feature Request
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Development Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Platform Features</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {metrics.completedFeatures}/{metrics.totalFeatures}
                  </p>
                </div>
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <div className="mt-4">
                <Progress value={metrics.developmentVelocity} className="h-2" />
                <p className="text-xs text-slate-500 mt-1">{metrics.developmentVelocity}% Development Velocity</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">AI Models</p>
                  <p className="text-2xl font-bold text-slate-900">{metrics.activeAIModels}</p>
                </div>
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
              <div className="mt-4">
                <Badge variant="outline" className="text-xs">Production Ready</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Test Coverage</p>
                  <p className="text-2xl font-bold text-slate-900">{metrics.testCoverage}%</p>
                </div>
                <TestTube className="w-8 h-8 text-green-600" />
              </div>
              <div className="mt-4">
                <Progress value={metrics.testCoverage} className="h-2" />
                <p className="text-xs text-slate-500 mt-1">Quality Assurance</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Quality Score</p>
                  <p className="text-2xl font-bold text-slate-900">{metrics.qualityScore}/100</p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="mt-4">
                <Progress value={metrics.qualityScore} className="h-2" />
                <p className="text-xs text-slate-500 mt-1">Overall System Health</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Organizations & Entities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              HERA System Organizations
            </CardTitle>
            <CardDescription>
              Each organization represents a different aspect of HERA development, like restaurant branches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedOrg} onValueChange={(value) => handleOrganizationChange(value as SystemOrganizationType)}>
              <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full mb-6">
                {Object.entries(SYSTEM_ORGANIZATIONS).map(([orgType, orgId]) => {
                  const Icon = organizationIcons[orgType as SystemOrganizationType];
                  return (
                    <TabsTrigger key={orgType} value={orgType} className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">
                        {orgType.replace('_', ' ')}
                      </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {Object.keys(SYSTEM_ORGANIZATIONS).map((orgType) => (
                <TabsContent key={orgType} value={orgType}>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-lg ${organizationColors[orgType as SystemOrganizationType]} flex items-center justify-center`}>
                        {React.createElement(organizationIcons[orgType as SystemOrganizationType], {
                          className: "w-6 h-6 text-white"
                        })}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {orgType.replace('_', ' & ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h3>
                        <p className="text-sm text-slate-600">
                          Organization ID: {SYSTEM_ORGANIZATIONS[orgType as SystemOrganizationType]}
                        </p>
                      </div>
                    </div>

                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-slate-600">Loading entities...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {systemEntities.map((entity) => (
                          <Card key={entity.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h4 className="font-medium text-slate-900 mb-1">
                                    {entity.entity_name}
                                  </h4>
                                  <p className="text-xs text-slate-500 mb-2">
                                    {entity.entity_code}
                                  </p>
                                  <Badge variant="outline" className="text-xs">
                                    {entity.entity_type.replace('_', ' ')}
                                  </Badge>
                                </div>
                                {entity.metadata?.task_specification?.status && (
                                  <Badge 
                                    variant="outline"
                                    className={`text-xs ${getStatusColor(entity.metadata.task_specification.status)}`}
                                  >
                                    {entity.metadata.task_specification.status}
                                  </Badge>
                                )}
                              </div>

                              {entity.metadata?.task_specification && (
                                <div className="space-y-2 text-xs">
                                  {entity.metadata.task_specification.priority && (
                                    <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(entity.metadata.task_specification.priority)}`}></div>
                                      <span className="text-slate-600">
                                        {entity.metadata.task_specification.priority} priority
                                      </span>
                                    </div>
                                  )}
                                  
                                  {entity.metadata.task_specification.estimated_effort && (
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-3 h-3 text-slate-400" />
                                      <span className="text-slate-600">
                                        {entity.metadata.task_specification.estimated_effort}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {entity.metadata?.implementation_status && (
                                <div className="mt-3 pt-3 border-t border-slate-100">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-600">Progress</span>
                                    <span className="font-medium">
                                      {entity.metadata.implementation_status.test_coverage || 0}% tested
                                    </span>
                                  </div>
                                  <Progress 
                                    value={entity.metadata.implementation_status.test_coverage || 0} 
                                    className="h-1 mt-1"
                                  />
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                        
                        {systemEntities.length === 0 && (
                          <div className="col-span-full text-center py-8">
                            <Database className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">No entities found for this organization</p>
                            <p className="text-xs text-slate-400 mt-1">
                              Create new development tasks to see them here
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* New Feature Request Modal */}
        {showNewFeatureForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  New Feature Request
                </CardTitle>
                <CardDescription>
                  Create a new development "order" for HERA platform enhancement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Feature Title</label>
                  <Input
                    value={newFeatureRequest.title}
                    onChange={(e) => setNewFeatureRequest(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Enhanced AI Test Generation"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Description</label>
                  <Textarea
                    value={newFeatureRequest.description}
                    onChange={(e) => setNewFeatureRequest(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the feature request in detail..."
                    className="mt-1 min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Priority</label>
                    <Select
                      value={newFeatureRequest.priority}
                      onValueChange={(value) => setNewFeatureRequest(prev => ({ ...prev, priority: value as any }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">Category</label>
                    <Select
                      value={newFeatureRequest.category}
                      onValueChange={(value) => setNewFeatureRequest(prev => ({ ...prev, category: value as any }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="feature">New Feature</SelectItem>
                        <SelectItem value="enhancement">Enhancement</SelectItem>
                        <SelectItem value="bug_fix">Bug Fix</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Estimated Effort</label>
                  <Input
                    value={newFeatureRequest.estimatedEffort}
                    onChange={(e) => setNewFeatureRequest(prev => ({ ...prev, estimatedEffort: e.target.value }))}
                    placeholder="e.g., 1-2 sprints, 1 week, 3 days"
                    className="mt-1"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowNewFeatureForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateFeatureRequest}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Create Feature Request
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}