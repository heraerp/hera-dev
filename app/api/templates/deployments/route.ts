/**
 * HERA Universal - Template Deployments Management API
 * 
 * Sacred Multi-Tenancy: All deployment tracking with organization_id isolation
 * Manages and monitors all template deployments across organizations
 * Provides comprehensive deployment analytics and status monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Admin client for deployment operations
const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

// System constants
const SYSTEM_ORG_ID = '00000000-0000-0000-0000-000000000001';
const SYSTEM_USER_ID = '00000001-0000-0000-0000-000000000001';

interface Deployment {
  id: string;
  transaction_number: string;
  organization_id: string;
  client_id?: string;
  deployment_type: 'module_deployment' | 'package_deployment';
  template_info: {
    template_id: string;
    template_name: string;
    template_code: string;
    template_type: string;
  };
  deployment_status: 'processing' | 'completed' | 'failed' | 'partial';
  deployment_summary: {
    modules_deployed?: number;
    modules_failed?: number;
    accounts_created?: number;
    workflows_created?: number;
    users_assigned?: number;
  };
  deployment_time_seconds: number;
  created_by: string;
  created_at: string;
  completed_at?: string;
  organization: {
    id: string;
    name: string;
    client?: {
      id: string;
      name: string;
    };
  };
  deployment_lines?: Array<{
    module_code: string;
    module_name: string;
    status: string;
  }>;
  errors?: string[];
  warnings?: string[];
}

interface DeploymentFilters {
  organizationId?: string;
  clientId?: string;
  deploymentType?: string;
  status?: string;
  createdBy?: string;
}

// GET /api/templates/deployments - List all deployments with filters
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    
    const filters: DeploymentFilters = {
      organizationId: searchParams.get('organizationId') || undefined,
      clientId: searchParams.get('clientId') || undefined,
      deploymentType: searchParams.get('deploymentType') || undefined,
      status: searchParams.get('status') || undefined,
      createdBy: searchParams.get('createdBy') || undefined
    };
    
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const includeLines = searchParams.get('includeLines') === 'true';
    
    console.log('📋 Fetching template deployments with filters:', filters);

    // SACRED: Build query with organization_id filtering
    let query = supabase
      .from('universal_transactions')
      .select(`
        id,
        transaction_number,
        organization_id,
        client_id,
        transaction_type,
        transaction_status,
        transaction_data,
        created_by,
        created_at,
        posted_at,
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
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // SACRED: Apply organization filter if provided
    if (filters.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }
    
    if (filters.clientId) {
      query = query.eq('client_id', filters.clientId);
    }
    
    if (filters.deploymentType) {
      query = query.eq('transaction_type', filters.deploymentType);
    }
    
    if (filters.status) {
      query = query.eq('transaction_status', filters.status);
    }
    
    if (filters.createdBy) {
      query = query.eq('created_by', filters.createdBy);
    }

    const { data: deploymentTransactions, error, count } = await query;

    if (error) {
      console.error('❌ Error fetching deployments:', error);
      throw error;
    }

    if (!deploymentTransactions || deploymentTransactions.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          deployments: [],
          totalCount: 0,
          filters,
          pagination: { limit, offset }
        },
        message: 'No template deployments found'
      });
    }

    // Get deployment lines if requested
    let deploymentLines: Map<string, any[]> = new Map();
    
    if (includeLines) {
      const transactionIds = deploymentTransactions.map(dt => dt.id);
      
      const { data: lines } = await supabase
        .from('universal_transaction_lines')
        .select('transaction_id, line_description, line_data')
        .in('transaction_id', transactionIds);
      
      lines?.forEach(line => {
        if (!deploymentLines.has(line.transaction_id)) {
          deploymentLines.set(line.transaction_id, []);
        }
        deploymentLines.get(line.transaction_id)!.push({
          module_code: line.line_data?.module_code || 'unknown',
          module_name: line.line_description.replace('Deploy ', ''),
          status: line.line_data?.deployment_status || 'unknown'
        });
      });
    }

    // Enrich deployment data
    const enrichedDeployments: Deployment[] = deploymentTransactions.map(dt => {
      const transactionData = dt.transaction_data || {};
      const deploymentResult = transactionData.deployment_result || {};
      
      // Calculate deployment time
      let deploymentTimeSeconds = 0;
      if (transactionData.start_time && transactionData.end_time) {
        const startTime = new Date(transactionData.start_time).getTime();
        const endTime = new Date(transactionData.end_time).getTime();
        deploymentTimeSeconds = Math.round((endTime - startTime) / 1000);
      } else if (deploymentResult.total_time_seconds) {
        deploymentTimeSeconds = deploymentResult.total_time_seconds;
      }

      return {
        id: dt.id,
        transaction_number: dt.transaction_number,
        organization_id: dt.organization_id,
        client_id: dt.client_id,
        deployment_type: dt.transaction_type as 'module_deployment' | 'package_deployment',
        template_info: {
          template_id: transactionData.module_id || transactionData.package_id || 'unknown',
          template_name: transactionData.module_name || transactionData.package_name || 'Unknown',
          template_code: transactionData.module_code || transactionData.package_code || 'unknown',
          template_type: dt.transaction_type === 'module_deployment' ? 'module' : 'package'
        },
        deployment_status: dt.transaction_status as 'processing' | 'completed' | 'failed' | 'partial',
        deployment_summary: {
          modules_deployed: deploymentResult.modules_deployed || 
                           (dt.transaction_type === 'module_deployment' ? 1 : 0),
          modules_failed: deploymentResult.modules_failed || 0,
          accounts_created: deploymentResult.accounts_created || 0,
          workflows_created: deploymentResult.workflows_created || 0,
          users_assigned: deploymentResult.users_assigned || 0
        },
        deployment_time_seconds: deploymentTimeSeconds,
        created_by: dt.created_by,
        created_at: dt.created_at,
        completed_at: dt.posted_at,
        organization: {
          id: dt.organization.id,
          name: dt.organization.org_name,
          client: dt.organization.client ? {
            id: dt.organization.client.id,
            name: dt.organization.client.client_name
          } : undefined
        },
        deployment_lines: includeLines ? deploymentLines.get(dt.id) || [] : undefined,
        errors: transactionData.errors || [],
        warnings: transactionData.warnings || []
      };
    });

    // Calculate summary statistics
    const summary = {
      totalDeployments: enrichedDeployments.length,
      completedDeployments: enrichedDeployments.filter(d => d.deployment_status === 'completed').length,
      failedDeployments: enrichedDeployments.filter(d => d.deployment_status === 'failed').length,
      processingDeployments: enrichedDeployments.filter(d => d.deployment_status === 'processing').length,
      averageDeploymentTime: enrichedDeployments.length > 0 ? 
        Math.round(enrichedDeployments.reduce((sum, d) => sum + d.deployment_time_seconds, 0) / enrichedDeployments.length) : 0,
      totalModulesDeployed: enrichedDeployments.reduce((sum, d) => sum + (d.deployment_summary.modules_deployed || 0), 0),
      totalAccountsCreated: enrichedDeployments.reduce((sum, d) => sum + (d.deployment_summary.accounts_created || 0), 0)
    };

    console.log('✅ Template deployments fetched successfully:', enrichedDeployments.length);

    return NextResponse.json({
      success: true,
      data: {
        deployments: enrichedDeployments,
        summary,
        totalCount: enrichedDeployments.length,
        filters,
        pagination: {
          limit,
          offset,
          hasMore: offset + limit < (count || 0)
        }
      },
      metadata: {
        includeLines,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Template deployments error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch template deployments' 
      },
      { status: 500 }
    );
  }
}

// POST /api/templates/deployments - Create new deployment (universal endpoint)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deploymentType, ...deploymentData } = body;
    
    console.log('🚀 Creating new deployment:', deploymentType);

    // Route to appropriate deployment endpoint based on type
    if (deploymentType === 'module') {
      const response = await fetch(new URL('/api/templates/modules/deploy', request.url), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: deploymentData.organizationId,
          clientId: deploymentData.clientId,
          moduleId: deploymentData.templateId,
          deploymentOptions: deploymentData.deploymentOptions,
          createdBy: deploymentData.createdBy
        })
      });
      
      const result = await response.json();
      
      return NextResponse.json(result, { status: response.status });
      
    } else if (deploymentType === 'package') {
      const response = await fetch(new URL('/api/templates/packages/deploy', request.url), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: deploymentData.organizationId,
          clientId: deploymentData.clientId,
          packageId: deploymentData.templateId,
          deploymentOptions: deploymentData.deploymentOptions,
          createdBy: deploymentData.createdBy
        })
      });
      
      const result = await response.json();
      
      return NextResponse.json(result, { status: response.status });
      
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid deployment type. Must be "module" or "package"' 
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('❌ Deployment creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create deployment' 
      },
      { status: 500 }
    );
  }
}