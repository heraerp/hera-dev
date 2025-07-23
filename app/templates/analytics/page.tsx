'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Package, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Users,
  Zap,
  Activity,
  BarChart3,
  PieChart,
  RefreshCw
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    total_templates: number;
    system_templates: number;
    custom_templates: number;
    total_deployments: number;
    success_rate: number;
    average_deployment_time: number;
  };
  popular_templates: Array<{
    template_name: string;
    template_type: string;
    deployment_count: number;
    success_rate: number;
  }>;
  deployment_trends: Array<{
    date: string;
    deployments: number;
    success_rate: number;
  }>;
  industry_insights: Array<{
    industry: string;
    deployment_count: number;
    package_count: number;
    success_rate: number;
  }>;
  performance_metrics: {
    fastest_deployments: Array<{
      template_name: string;
      deployment_time_seconds: number;
      organization_name: string;
    }>;
    slowest_deployments: Array<{
      template_name: string;
      deployment_time_seconds: number;
      organization_name: string;
    }>;
  };
}

const AnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  // Load analytics data from API
  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Load analytics from the Templates API
      const response = await fetch(`/api/templates/analytics?timeRange=${timeRange}&organizationId=00000000-0000-0000-0000-000000000001`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      
      // Transform API data to UI format
      const transformedData: AnalyticsData = {
        overview: {
          total_templates: data.data?.overview?.total_templates || 0,
          system_templates: data.data?.overview?.system_templates || 0,
          custom_templates: data.data?.overview?.custom_templates || 0,
          total_deployments: data.data?.overview?.total_deployments || 0,
          success_rate: data.data?.overview?.success_rate || 0,
          average_deployment_time: data.data?.overview?.average_deployment_time || 0
        },
        popular_templates: (data.data?.popular_templates || []).map((template: any) => ({
          template_name: template.template_name || 'Unknown Template',
          template_type: template.template_type || 'module',
          deployment_count: template.deployment_count || 0,
          success_rate: template.success_rate || 0
        })),
        deployment_trends: (data.data?.deployment_trends || []).map((trend: any) => ({
          date: trend.date || new Date().toISOString(),
          deployments: trend.deployments || 0,
          success_rate: trend.success_rate || 0
        })),
        industry_insights: (data.data?.industry_insights || []).map((insight: any) => ({
          industry: insight.industry || 'Unknown',
          deployment_count: insight.deployment_count || 0,
          package_count: insight.package_count || 0,
          success_rate: insight.success_rate || 0
        })),
        performance_metrics: {
          fastest_deployments: (data.data?.performance_metrics?.fastest_deployments || []).map((deployment: any) => ({
            template_name: deployment.template_name || 'Unknown Template',
            deployment_time_seconds: deployment.deployment_time_seconds || 0,
            organization_name: deployment.organization_name || 'Unknown Organization'
          })),
          slowest_deployments: (data.data?.performance_metrics?.slowest_deployments || []).map((deployment: any) => ({
            template_name: deployment.template_name || 'Unknown Template',
            deployment_time_seconds: deployment.deployment_time_seconds || 0,
            organization_name: deployment.organization_name || 'Unknown Organization'
          }))
        }
      };

      setAnalyticsData(transformedData);
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Fallback to empty data structure on error
      setAnalyticsData({
        overview: {
          total_templates: 0,
          system_templates: 0,
          custom_templates: 0,
          total_deployments: 0,
          success_rate: 0,
          average_deployment_time: 0
        },
        popular_templates: [],
        deployment_trends: [],
        industry_insights: [],
        performance_metrics: {
          fastest_deployments: [],
          slowest_deployments: []
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
          <span className="text-white text-lg">Loading Analytics...</span>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return <div className="min-h-screen bg-gray-800 flex items-center justify-center text-white">No data available</div>;
  }

  return (
    <div className="min-h-screen bg-gray-800">
      {/* Header */}
      <div className="bg-gray-700 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Templates Analytics</h1>
            <div className="flex items-center space-x-4">
              {/* Time range selector */}
              <div className="flex space-x-2">
                {[
                  { key: '7d', label: '7 days' },
                  { key: '30d', label: '30 days' },
                  { key: '90d', label: '90 days' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setTimeRange(key)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      timeRange === key
                        ? 'bg-teal-500 text-white'
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Overview Cards - Don't Make Me Think: Clear visual hierarchy */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {analyticsData.overview.total_templates}
                  </div>
                  <div className="text-sm text-gray-400">Templates</div>
                </div>
                <Package className="h-8 w-8 text-teal-400" />
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {analyticsData.overview.total_deployments.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Deployments</div>
                </div>
                <Activity className="h-8 w-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {analyticsData.overview.success_rate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-400">Success Rate</div>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {Math.round(analyticsData.overview.average_deployment_time)}s
                  </div>
                  <div className="text-sm text-gray-400">Avg Deploy Time</div>
                </div>
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {analyticsData.overview.system_templates}
                  </div>
                  <div className="text-sm text-gray-400">System Templates</div>
                </div>
                <Zap className="h-8 w-8 text-purple-400" />
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {analyticsData.industry_insights.length}
                  </div>
                  <div className="text-sm text-gray-400">Industries</div>
                </div>
                <Users className="h-8 w-8 text-indigo-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Popular Templates */}
            <div className="bg-gray-700 rounded-lg p-6">
              <div className="flex items-center mb-6">
                <TrendingUp className="h-6 w-6 text-teal-400 mr-3" />
                <h2 className="text-xl font-semibold text-white">Popular Templates</h2>
              </div>
              
              <div className="space-y-4">
                {analyticsData.popular_templates.map((template, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-teal-500 rounded-full text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-white font-medium">{template.template_name}</div>
                        <div className="text-gray-400 text-sm capitalize">{template.template_type}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">{template.deployment_count}</div>
                      <div className="text-green-400 text-sm">{template.success_rate.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Industry Insights */}
            <div className="bg-gray-700 rounded-lg p-6">
              <div className="flex items-center mb-6">
                <BarChart3 className="h-6 w-6 text-blue-400 mr-3" />
                <h2 className="text-xl font-semibold text-white">Industry Insights</h2>
              </div>
              
              <div className="space-y-4">
                {analyticsData.industry_insights.map((industry, index) => (
                  <div key={index} className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-white font-medium capitalize">
                        {industry.industry}
                      </div>
                      <div className="text-green-400 text-sm font-medium">
                        {industry.success_rate.toFixed(1)}% success
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Deployments:</span>
                        <span className="text-white ml-1">{industry.deployment_count}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Packages:</span>
                        <span className="text-white ml-1">{industry.package_count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Deployment Trends Chart */}
          <div className="bg-gray-700 rounded-lg p-6">
            <div className="flex items-center mb-6">
              <Activity className="h-6 w-6 text-green-400 mr-3" />
              <h2 className="text-xl font-semibold text-white">Deployment Trends</h2>
            </div>
            
            {/* Simple chart representation - in production, use a proper chart library */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                <span>Date</span>
                <span>Deployments</span>
                <span>Success Rate</span>
              </div>
              
              {analyticsData.deployment_trends.map((day, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="text-white text-sm">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div 
                        className="bg-teal-500 rounded-full mr-2"
                        style={{ 
                          width: `${Math.max(4, (day.deployments / 100) * 60)}px`,
                          height: '8px'
                        }}
                      ></div>
                      <span className="text-white text-sm w-8">{day.deployments}</span>
                    </div>
                    
                    <div className="text-green-400 text-sm font-medium w-12">
                      {day.success_rate.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Fastest Deployments */}
            <div className="bg-gray-700 rounded-lg p-6">
              <div className="flex items-center mb-6">
                <Zap className="h-6 w-6 text-yellow-400 mr-3" />
                <h2 className="text-xl font-semibold text-white">Fastest Deployments</h2>
              </div>
              
              <div className="space-y-3">
                {analyticsData.performance_metrics.fastest_deployments.map((deployment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div>
                      <div className="text-white text-sm font-medium">{deployment.template_name}</div>
                      <div className="text-gray-400 text-xs">{deployment.organization_name}</div>
                    </div>
                    <div className="text-yellow-400 font-semibold">
                      {deployment.deployment_time_seconds}s
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Slowest Deployments */}
            <div className="bg-gray-700 rounded-lg p-6">
              <div className="flex items-center mb-6">
                <AlertTriangle className="h-6 w-6 text-orange-400 mr-3" />
                <h2 className="text-xl font-semibold text-white">Longest Deployments</h2>
              </div>
              
              <div className="space-y-3">
                {analyticsData.performance_metrics.slowest_deployments.map((deployment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div>
                      <div className="text-white text-sm font-medium">{deployment.template_name}</div>
                      <div className="text-gray-400 text-xs">{deployment.organization_name}</div>
                    </div>
                    <div className="text-orange-400 font-semibold">
                      {deployment.deployment_time_seconds}s
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;