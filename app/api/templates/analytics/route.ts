/**
 * HERA Universal - Template Analytics API
 * 
 * Sacred Multi-Tenancy: All analytics respect organization_id boundaries
 * Provides comprehensive analytics on template usage, performance, and trends
 * Maintains strict data isolation while enabling meaningful insights
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Admin client for analytics operations
const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

// System constants
const SYSTEM_ORG_ID = '00000000-0000-0000-0000-000000000001';

interface TemplateAnalytics {
  overview: {
    total_templates: number;
    system_templates: number;
    custom_templates: number;
    total_deployments: number;
    success_rate: number;
    average_deployment_time: number;
  };
  deployment_trends: Array<{
    date: string;
    deployments: number;
    success_rate: number;
    average_time: number;
  }>;
  popular_templates: Array<{
    template_id: string;
    template_name: string;
    template_type: string;
    deployment_count: number;
    success_rate: number;
    last_deployed: string;
  }>;
  organization_metrics: Array<{
    organization_id: string;
    organization_name: string;
    client_name?: string;
    templates_deployed: number;
    modules_deployed: number;
    last_deployment: string;
  }>;
  performance_metrics: {
    fastest_deployments: Array<{
      deployment_id: string;
      template_name: string;
      organization_name: string;
      deployment_time_seconds: number;
    }>;
    slowest_deployments: Array<{
      deployment_id: string;
      template_name: string;
      organization_name: string;
      deployment_time_seconds: number;
    }>;
    error_patterns: Array<{
      error_type: string;
      count: number;
      templates_affected: string[];
    }>;
  };
  industry_insights: Array<{
    industry: string;
    package_count: number;
    deployment_count: number;
    average_modules: number;
    success_rate: number;
  }>;
}

interface AnalyticsFilters {
  organizationId?: string;
  clientId?: string;
  timeRange?: string; // '7d', '30d', '90d', '1y'
  industryType?: string;
  templateType?: string;
}

// GET /api/templates/analytics - Comprehensive template analytics
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    
    const filters: AnalyticsFilters = {
      organizationId: searchParams.get('organizationId') || undefined,
      clientId: searchParams.get('clientId') || undefined,
      timeRange: searchParams.get('timeRange') || '30d',
      industryType: searchParams.get('industryType') || undefined,
      templateType: searchParams.get('templateType') || undefined
    };
    
    const includeOrgMetrics = searchParams.get('includeOrgMetrics') !== 'false';
    const includePerformance = searchParams.get('includePerformance') !== 'false';
    
    console.log('📊 Generating template analytics with filters:', filters);

    // Calculate date range for analytics
    const endDate = new Date();
    const startDate = new Date();
    
    switch (filters.timeRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    const analytics: TemplateAnalytics = {
      overview: {
        total_templates: 0,
        system_templates: 0,
        custom_templates: 0,
        total_deployments: 0,
        success_rate: 0,
        average_deployment_time: 0
      },
      deployment_trends: [],
      popular_templates: [],
      organization_metrics: [],
      performance_metrics: {
        fastest_deployments: [],
        slowest_deployments: [],
        error_patterns: []
      },
      industry_insights: []
    };

    // 1. OVERVIEW METRICS
    console.log('📋 Calculating overview metrics...');
    
    // SACRED: Get template counts with organization filtering
    let templateQuery = supabase
      .from('core_entities')
      .select('organization_id, entity_type')
      .in('entity_type', ['erp_module_template', 'erp_industry_template', 'custom_module_template', 'custom_package_template'])
      .eq('is_active', true);
    
    if (filters.organizationId) {
      templateQuery = templateQuery.in('organization_id', [SYSTEM_ORG_ID, filters.organizationId]);
    }
    
    const { data: templates } = await templateQuery;
    
    analytics.overview.total_templates = templates?.length || 0;
    analytics.overview.system_templates = templates?.filter(t => t.organization_id === SYSTEM_ORG_ID).length || 0;
    analytics.overview.custom_templates = templates?.filter(t => t.organization_id !== SYSTEM_ORG_ID).length || 0;

    // SACRED: Get deployment metrics with organization filtering
    let deploymentQuery = supabase
      .from('universal_transactions')
      .select('transaction_status, transaction_data, created_at, organization_id')
      .in('transaction_type', ['module_deployment', 'package_deployment'])
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
    
    if (filters.organizationId) {
      deploymentQuery = deploymentQuery.eq('organization_id', filters.organizationId);
    }
    
    if (filters.clientId) {
      deploymentQuery = deploymentQuery.eq('client_id', filters.clientId);
    }
    
    const { data: deployments } = await deploymentQuery;
    
    analytics.overview.total_deployments = deployments?.length || 0;
    
    const successfulDeployments = deployments?.filter(d => d.transaction_status === 'completed') || [];
    analytics.overview.success_rate = deployments?.length > 0 ? 
      (successfulDeployments.length / deployments.length) * 100 : 0;
    
    // Calculate average deployment time
    const deploymentTimes = deployments?.map(d => {
      const data = d.transaction_data || {};
      const result = data.deployment_result || {};
      return result.total_time_seconds || 0;
    }).filter(time => time > 0) || [];
    
    analytics.overview.average_deployment_time = deploymentTimes.length > 0 ?
      deploymentTimes.reduce((sum, time) => sum + time, 0) / deploymentTimes.length : 0;

    // 2. DEPLOYMENT TRENDS
    console.log('📈 Calculating deployment trends...');
    
    const trendData = new Map<string, { count: number; successful: number; total_time: number; deployments: any[] }>();
    
    deployments?.forEach(deployment => {
      const date = new Date(deployment.created_at).toISOString().split('T')[0];
      const isSuccessful = deployment.transaction_status === 'completed';
      const deploymentTime = deployment.transaction_data?.deployment_result?.total_time_seconds || 0;
      
      if (!trendData.has(date)) {
        trendData.set(date, { count: 0, successful: 0, total_time: 0, deployments: [] });
      }
      
      const trend = trendData.get(date)!;
      trend.count++;
      trend.deployments.push(deployment);
      
      if (isSuccessful) {
        trend.successful++;
        trend.total_time += deploymentTime;
      }
    });
    
    analytics.deployment_trends = Array.from(trendData.entries()).map(([date, data]) => ({
      date,
      deployments: data.count,
      success_rate: data.count > 0 ? (data.successful / data.count) * 100 : 0,
      average_time: data.successful > 0 ? Math.round(data.total_time / data.successful) : 0
    })).sort((a, b) => a.date.localeCompare(b.date));

    // 3. POPULAR TEMPLATES
    console.log('🎆 Identifying popular templates...');
    
    const templateUsage = new Map<string, {
      template_id: string;
      template_name: string;
      template_type: string;
      deployments: any[];
      successful: number;
      last_deployed: string;
    }>();
    
    deployments?.forEach(deployment => {
      const data = deployment.transaction_data || {};
      const templateId = data.module_id || data.package_id;
      const templateName = data.module_name || data.package_name || 'Unknown';
      const templateType = deployment.transaction_type === 'module_deployment' ? 'module' : 'package';
      
      if (!templateId) return;
      
      if (!templateUsage.has(templateId)) {
        templateUsage.set(templateId, {
          template_id: templateId,
          template_name: templateName,
          template_type: templateType,
          deployments: [],
          successful: 0,
          last_deployed: deployment.created_at
        });
      }
      
      const usage = templateUsage.get(templateId)!;
      usage.deployments.push(deployment);
      
      if (deployment.transaction_status === 'completed') {
        usage.successful++;
      }
      
      if (deployment.created_at > usage.last_deployed) {
        usage.last_deployed = deployment.created_at;
      }
    });
    
    analytics.popular_templates = Array.from(templateUsage.values())
      .map(usage => ({
        template_id: usage.template_id,
        template_name: usage.template_name,
        template_type: usage.template_type,
        deployment_count: usage.deployments.length,
        success_rate: usage.deployments.length > 0 ? (usage.successful / usage.deployments.length) * 100 : 0,
        last_deployed: usage.last_deployed
      }))
      .sort((a, b) => b.deployment_count - a.deployment_count)
      .slice(0, 10);

    // 4. ORGANIZATION METRICS (if requested and not filtered by org)
    if (includeOrgMetrics && !filters.organizationId) {
      console.log('🏢 Calculating organization metrics...');
      
      // SACRED: Get organizations with deployment data
      const { data: orgDeployments } = await supabase
        .from('universal_transactions')
        .select(`
          organization_id,
          transaction_type,
          transaction_data,
          created_at,
          organization:core_organizations!inner(
            id,
            org_name,
            client:core_clients(
              id,
              client_name
            )
          )
        `)
        .in('transaction_type', ['module_deployment', 'package_deployment'])
        .gte('created_at', startDate.toISOString());
      
      const orgMetrics = new Map<string, {
        org_id: string;
        org_name: string;
        client_name?: string;
        template_deployments: Set<string>;
        module_count: number;
        last_deployment: string;
      }>();
      
      orgDeployments?.forEach(deployment => {
        const orgId = deployment.organization_id;
        const orgName = deployment.organization.org_name;
        const clientName = deployment.organization.client?.client_name;
        const templateId = deployment.transaction_data?.module_id || deployment.transaction_data?.package_id || 'unknown';
        
        if (!orgMetrics.has(orgId)) {
          orgMetrics.set(orgId, {
            org_id: orgId,
            org_name: orgName,
            client_name: clientName,
            template_deployments: new Set(),
            module_count: 0,
            last_deployment: deployment.created_at
          });
        }
        
        const metrics = orgMetrics.get(orgId)!;
        metrics.template_deployments.add(templateId);
        metrics.module_count += deployment.transaction_data?.deployment_result?.modules_deployed || 1;
        
        if (deployment.created_at > metrics.last_deployment) {
          metrics.last_deployment = deployment.created_at;
        }
      });
      
      analytics.organization_metrics = Array.from(orgMetrics.values())
        .map(metrics => ({
          organization_id: metrics.org_id,
          organization_name: metrics.org_name,
          client_name: metrics.client_name,
          templates_deployed: metrics.template_deployments.size,
          modules_deployed: metrics.module_count,
          last_deployment: metrics.last_deployment
        }))
        .sort((a, b) => b.templates_deployed - a.templates_deployed)
        .slice(0, 20);
    }

    // 5. PERFORMANCE METRICS
    if (includePerformance) {
      console.log('⚡ Calculating performance metrics...');
      
      const deploymentPerformance = deployments?.map(deployment => {
        const data = deployment.transaction_data || {};
        const result = data.deployment_result || {};
        const templateName = data.module_name || data.package_name || 'Unknown';
        const deploymentTime = result.total_time_seconds || 0;
        
        return {
          deployment_id: deployment.id,
          template_name: templateName,
          organization_id: deployment.organization_id,
          deployment_time_seconds: deploymentTime,
          errors: data.errors || []
        };
      }).filter(d => d.deployment_time_seconds > 0) || [];
      
      // Get organization names for performance data
      const orgIds = [...new Set(deploymentPerformance.map(d => d.organization_id))];
      const { data: orgNames } = await supabase
        .from('core_organizations')
        .select('id, org_name')
        .in('id', orgIds);
      
      const orgNameMap = new Map(orgNames?.map(org => [org.id, org.org_name]) || []);
      
      // Fastest deployments
      analytics.performance_metrics.fastest_deployments = deploymentPerformance
        .sort((a, b) => a.deployment_time_seconds - b.deployment_time_seconds)
        .slice(0, 5)
        .map(d => ({
          deployment_id: d.deployment_id,
          template_name: d.template_name,
          organization_name: orgNameMap.get(d.organization_id) || 'Unknown',
          deployment_time_seconds: d.deployment_time_seconds
        }));
      
      // Slowest deployments
      analytics.performance_metrics.slowest_deployments = deploymentPerformance
        .sort((a, b) => b.deployment_time_seconds - a.deployment_time_seconds)
        .slice(0, 5)
        .map(d => ({
          deployment_id: d.deployment_id,
          template_name: d.template_name,
          organization_name: orgNameMap.get(d.organization_id) || 'Unknown',
          deployment_time_seconds: d.deployment_time_seconds
        }));
      
      // Error patterns
      const errorCounts = new Map<string, { count: number; templates: Set<string> }>();
      
      deploymentPerformance.forEach(d => {
        d.errors.forEach((error: string) => {
          const errorType = error.split(':')[0] || error.substring(0, 50);
          
          if (!errorCounts.has(errorType)) {
            errorCounts.set(errorType, { count: 0, templates: new Set() });
          }
          
          const errorData = errorCounts.get(errorType)!;
          errorData.count++;
          errorData.templates.add(d.template_name);
        });
      });
      
      analytics.performance_metrics.error_patterns = Array.from(errorCounts.entries())
        .map(([error_type, data]) => ({
          error_type,
          count: data.count,
          templates_affected: Array.from(data.templates)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    }

    // 6. INDUSTRY INSIGHTS
    console.log('🏭 Calculating industry insights...');
    
    // SACRED: Get industry packages with organization filtering
    let industryQuery = supabase
      .from('core_entities')
      .select(`
        id,
        entity_name,
        organization_id,
        dynamic_data:core_dynamic_data(
          field_name,
          field_value
        )
      `)
      .eq('entity_type', 'erp_industry_template')
      .eq('is_active', true);
    
    if (filters.organizationId) {
      industryQuery = industryQuery.in('organization_id', [SYSTEM_ORG_ID, filters.organizationId]);
    }
    
    const { data: industryPackages } = await industryQuery;
    
    const industryMap = new Map<string, {
      package_count: number;
      deployment_count: number;
      total_modules: number;
      successful_deployments: number;
    }>();
    
    industryPackages?.forEach(pkg => {
      const industryType = pkg.dynamic_data?.find((d: any) => d.field_name === 'industry_type')?.field_value || 'general';
      
      if (!industryMap.has(industryType)) {
        industryMap.set(industryType, {
          package_count: 0,
          deployment_count: 0,
          total_modules: 0,
          successful_deployments: 0
        });
      }
      
      const industry = industryMap.get(industryType)!;
      industry.package_count++;
      
      // Count deployments of this package
      const packageDeployments = deployments?.filter(d => 
        d.transaction_data?.package_id === pkg.id
      ) || [];
      
      industry.deployment_count += packageDeployments.length;
      industry.successful_deployments += packageDeployments.filter(d => d.transaction_status === 'completed').length;
      
      // Add module count (simplified)
      const moduleCount = parseInt(pkg.dynamic_data?.find((d: any) => d.field_name === 'total_modules')?.field_value || '0');
      if (moduleCount > 0) {
        industry.total_modules += moduleCount;
      }
    });
    
    analytics.industry_insights = Array.from(industryMap.entries())
      .map(([industry, data]) => ({
        industry,
        package_count: data.package_count,
        deployment_count: data.deployment_count,
        average_modules: data.package_count > 0 ? Math.round(data.total_modules / data.package_count) : 0,
        success_rate: data.deployment_count > 0 ? (data.successful_deployments / data.deployment_count) * 100 : 0
      }))
      .sort((a, b) => b.deployment_count - a.deployment_count);

    console.log('✅ Template analytics generated successfully');

    return NextResponse.json({
      success: true,
      data: analytics,
      metadata: {
        filters,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        includeOrgMetrics,
        includePerformance,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Template analytics error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate template analytics' 
      },
      { status: 500 }
    );
  }
}