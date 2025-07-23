'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Play, 
  Eye, 
  RefreshCw,
  TrendingUp,
  Package,
  Zap,
  Calendar,
  User,
  Activity
} from 'lucide-react';

interface Deployment {
  id: string;
  templateName: string;
  templateType: 'module' | 'package';
  organizationName: string;
  status: 'processing' | 'completed' | 'failed' | 'partial';
  progress: number;
  deploymentTime: number;
  modulesDeployed: number;
  totalModules: number;
  accountsCreated: number;
  workflowsCreated: number;
  createdAt: string;
  createdBy: string;
  errors?: string[];
  warnings?: string[];
}

const DeploymentsPage = () => {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Load deployments from API
  useEffect(() => {
    loadDeployments();
  }, []);

  const loadDeployments = async () => {
    try {
      setLoading(true);
      
      // Load deployments from the Templates API
      const response = await fetch('/api/templates/deployments?organizationId=00000000-0000-0000-0000-000000000001');
      
      if (!response.ok) {
        throw new Error('Failed to fetch deployments');
      }

      const data = await response.json();
      
      // Transform API data to UI format
      const transformedDeployments: Deployment[] = [];
      
      if (data.data?.deployments) {
        data.data.deployments.forEach((deployment: any) => {
          transformedDeployments.push({
            id: deployment.id,
            templateName: deployment.template_name || deployment.metadata?.templateName || 'Unknown Template',
            templateType: (deployment.template_type || deployment.metadata?.templateType || 'module') as 'module' | 'package',
            organizationName: deployment.organization_name || 'Organization',
            status: mapDeploymentStatus(deployment.deployment_status),
            progress: calculateProgress(deployment.deployment_status, deployment.modules_deployed, deployment.total_modules),
            deploymentTime: deployment.deployment_time_seconds || 0,
            modulesDeployed: deployment.modules_deployed || 0,
            totalModules: deployment.total_modules || 1,
            accountsCreated: deployment.accounts_created || 0,
            workflowsCreated: deployment.workflows_created || 0,
            createdAt: deployment.created_at || new Date().toISOString(),
            createdBy: deployment.created_by || 'System',
            errors: deployment.deployment_errors || [],
            warnings: deployment.deployment_warnings || []
          });
        });
      }

      setDeployments(transformedDeployments);
    } catch (error) {
      console.error('Error loading deployments:', error);
      // Fallback to empty array on error
      setDeployments([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to map API status to UI status
  const mapDeploymentStatus = (apiStatus: string): 'processing' | 'completed' | 'failed' | 'partial' => {
    switch (apiStatus?.toLowerCase()) {
      case 'in_progress':
      case 'deploying':
        return 'processing';
      case 'completed':
      case 'success':
        return 'completed';
      case 'failed':
      case 'error':
        return 'failed';
      case 'partial':
      case 'partial_success':
        return 'partial';
      default:
        return 'processing';
    }
  };

  // Helper function to calculate progress percentage
  const calculateProgress = (status: string, modulesDeployed: number, totalModules: number): number => {
    if (status === 'completed' || status === 'success') return 100;
    if (status === 'failed' || status === 'error') return 0;
    if (totalModules > 0) {
      return Math.round((modulesDeployed / totalModules) * 100);
    }
    return 50; // Default for unknown progress
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDeployments();
    setRefreshing(false);
  };

  const filteredDeployments = deployments.filter(deployment => {
    return selectedStatus === 'all' || deployment.status === selectedStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-400 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      case 'partial':
        return <AlertCircle className="h-5 w-5 text-orange-400" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-900';
      case 'processing':
        return 'text-yellow-400 bg-yellow-900';
      case 'failed':
        return 'text-red-400 bg-red-900';
      case 'partial':
        return 'text-orange-400 bg-orange-900';
      default:
        return 'text-gray-400 bg-gray-900';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
          <span className="text-white text-lg">Loading Deployments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-800">
      {/* Header with Quick Stats */}
      <div className="bg-gray-700 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Deployment Monitor</h1>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Quick Stats - Don't Make Me Think: Visual overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {deployments.filter(d => d.status === 'completed').length}
                  </div>
                  <div className="text-sm text-gray-400">Completed</div>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {deployments.filter(d => d.status === 'processing').length}
                  </div>
                  <div className="text-sm text-gray-400">In Progress</div>
                </div>
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {Math.round(deployments.reduce((sum, d) => sum + (d.deploymentTime || 0), 0) / deployments.filter(d => d.deploymentTime > 0).length) || 0}s
                  </div>
                  <div className="text-sm text-gray-400">Avg Time</div>
                </div>
                <TrendingUp className="h-8 w-8 text-teal-400" />
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {Math.round((deployments.filter(d => d.status === 'completed').length / deployments.length) * 100) || 0}%
                  </div>
                  <div className="text-sm text-gray-400">Success Rate</div>
                </div>
                <Activity className="h-8 w-8 text-blue-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters - Don't Make Me Think: Simple, obvious choices */}
      <div className="px-6 py-4 border-b border-gray-600">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-3">
            {[
              { key: 'all', label: 'All Deployments' },
              { key: 'processing', label: 'In Progress' },
              { key: 'completed', label: 'Completed' },
              { key: 'partial', label: 'Partial' },
              { key: 'failed', label: 'Failed' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSelectedStatus(key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  selectedStatus === key
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {label}
                <span className="ml-2 text-xs opacity-75">
                  ({key === 'all' ? deployments.length : deployments.filter(d => d.status === key).length})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Deployments List */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {filteredDeployments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-4">No deployments found</div>
              <button
                onClick={() => setSelectedStatus('all')}
                className="text-teal-400 hover:text-teal-300 underline"
              >
                Show all deployments
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDeployments.map((deployment) => (
                <div
                  key={deployment.id}
                  className="bg-gray-700 rounded-lg p-6 border border-gray-600 hover:border-gray-500 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    {/* Left side - Main info */}
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Template icon */}
                      <div className="mt-1">
                        {deployment.templateType === 'package' ? (
                          <Package className="h-6 w-6 text-teal-400" />
                        ) : (
                          <Zap className="h-6 w-6 text-blue-400" />
                        )}
                      </div>

                      {/* Main content */}
                      <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            {deployment.templateName}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deployment.status)}`}>
                            {deployment.status.charAt(0).toUpperCase() + deployment.status.slice(1)}
                          </span>
                        </div>

                        {/* Organization and user info */}
                        <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {deployment.organizationName}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(deployment.createdAt).toLocaleDateString()} at {new Date(deployment.createdAt).toLocaleTimeString()}
                          </div>
                          <div>by {deployment.createdBy}</div>
                        </div>

                        {/* Progress bar for processing deployments */}
                        {deployment.status === 'processing' && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                              <span>Deployment Progress</span>
                              <span>{deployment.progress}%</span>
                            </div>
                            <div className="bg-gray-800 rounded-full h-2">
                              <div 
                                className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${deployment.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Deployment metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Modules:</span>
                            <span className="text-white ml-1">
                              {deployment.modulesDeployed}/{deployment.totalModules}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Accounts:</span>
                            <span className="text-white ml-1">{deployment.accountsCreated}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Workflows:</span>
                            <span className="text-white ml-1">{deployment.workflowsCreated}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Time:</span>
                            <span className="text-white ml-1">
                              {deployment.deploymentTime > 0 ? `${deployment.deploymentTime}s` : 'In progress...'}
                            </span>
                          </div>
                        </div>

                        {/* Warnings/Errors */}
                        {deployment.warnings && deployment.warnings.length > 0 && (
                          <div className="mt-3 bg-orange-900 border border-orange-700 rounded-lg p-3">
                            <div className="flex items-start">
                              <AlertCircle className="h-4 w-4 text-orange-400 mr-2 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="text-orange-200 font-medium text-sm mb-1">Warnings</div>
                                <ul className="text-orange-300 text-sm space-y-1">
                                  {deployment.warnings.map((warning, index) => (
                                    <li key={index}>• {warning}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right side - Status and actions */}
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(deployment.status)}
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        {deployment.status === 'failed' && (
                          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors">
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeploymentsPage;