/**
 * HERA Configuration Control Panel - Solution Templates API
 * 
 * Template lifecycle management with deployment analytics and governance
 * Revolutionary template marketplace with AI-powered recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

interface TemplateDeploymentRequest {
  templateCode: string;
  organizationId: string;
  customizations?: Record<string, any>;
  deploymentMode?: 'quick' | 'custom' | 'enterprise';
  userId: string;
}

// GET /api/system/configuration/templates
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    
    const templateType = searchParams.get('templateType') || 'all';
    const includeAnalytics = searchParams.get('includeAnalytics') !== 'false';
    const organizationId = searchParams.get('organizationId');

    // Get solution template analytics
    const { data: templateAnalytics, error: analyticsError } = await supabase
      .rpc('get_solution_template_analytics');

    if (analyticsError) {
      console.error('Template analytics error:', analyticsError);
      return NextResponse.json(
        { error: 'Failed to fetch template analytics' },
        { status: 500 }
      );
    }

    // Get all system templates
    const { data: systemTemplates, error: templatesError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', '00000000-0000-0000-0000-000000000001')
      .eq('entity_type', 'erp_module_template')
      .eq('is_active', true)
      .order('entity_name');

    if (templatesError) {
      console.error('System templates error:', templatesError);
      return NextResponse.json(
        { error: 'Failed to fetch system templates' },
        { status: 500 }
      );
    }

    // Get template metadata
    const templateIds = systemTemplates?.map(t => t.id) || [];
    let templateMetadata: any[] = [];
    
    if (templateIds.length > 0) {
      const { data: metadataResult, error: metadataError } = await supabase
        .from('core_dynamic_data')
        .select('entity_id, field_name, field_value')
        .in('entity_id', templateIds);

      if (!metadataError) {
        templateMetadata = metadataResult || [];
      }
    }

    // Group metadata by template
    const metadataMap = templateMetadata.reduce((acc, item) => {
      if (!acc[item.entity_id]) {
        acc[item.entity_id] = {};
      }
      acc[item.entity_id][item.field_name] = item.field_value;
      return acc;
    }, {});

    // Combine templates with analytics and metadata
    const enrichedTemplates = (systemTemplates || []).map(template => {
      const analytics = (templateAnalytics || []).find(
        (a: any) => a.template_code === template.entity_code
      );
      const metadata = metadataMap[template.id] || {};

      return {
        id: template.id,
        code: template.entity_code,
        name: template.entity_name,
        description: metadata.description || 'No description available',
        category: metadata.category || 'General',
        industry: metadata.industry || 'Universal',
        version: metadata.version || '1.0',
        features: JSON.parse(metadata.features || '[]'),
        prerequisites: JSON.parse(metadata.prerequisites || '[]'),
        customizationOptions: JSON.parse(metadata.customization_options || '{}'),
        deploymentTime: parseInt(metadata.estimated_deployment_minutes || '2'),
        complexity: metadata.complexity || 'Medium',
        maintainer: metadata.maintainer || 'HERA Systems',
        documentation: metadata.documentation_url || '',
        analytics: includeAnalytics ? {
          deploymentCount: analytics?.deployment_count || 0,
          successRate: analytics?.success_rate || 0,
          avgDeploymentTime: analytics?.avg_deployment_time_seconds || 0,
          lastDeployment: analytics?.last_deployment,
          popularityScore: analytics?.popularity_score || 0,
          duplicateRisk: analytics?.duplicate_risk || 'LOW',
          recommendations: analytics?.recommendations || []
        } : null,
        createdAt: template.created_at,
        updatedAt: template.updated_at
      };
    });

    // Filter by template type if specified
    let filteredTemplates = enrichedTemplates;
    if (templateType !== 'all') {
      filteredTemplates = enrichedTemplates.filter(
        template => template.category.toLowerCase() === templateType.toLowerCase()
      );
    }

    // Get deployment status for specific organization if provided
    let organizationDeployments: any[] = [];
    if (organizationId) {
      const { data: deployments } = await supabase
        .from('core_entities')
        .select('entity_code, created_at')
        .eq('organization_id', organizationId)
        .eq('entity_type', 'deployed_erp_module');
      
      organizationDeployments = deployments || [];
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        templates: filteredTemplates,
        summary: {
          totalTemplates: enrichedTemplates.length,
          filteredCount: filteredTemplates.length,
          categories: [...new Set(enrichedTemplates.map(t => t.category))],
          industries: [...new Set(enrichedTemplates.map(t => t.industry))],
          averageDeploymentTime: enrichedTemplates.reduce(
            (sum, t) => sum + t.deploymentTime, 0
          ) / enrichedTemplates.length || 0
        },
        organizationDeployments: organizationDeployments,
        marketplaceStats: {
          totalDeployments: (templateAnalytics || []).reduce(
            (sum: number, t: any) => sum + (t.deployment_count || 0), 0
          ),
          averageSuccessRate: (templateAnalytics || []).reduce(
            (sum: number, t: any) => sum + (t.success_rate || 0), 0
          ) / (templateAnalytics?.length || 1),
          mostPopularTemplate: (templateAnalytics || []).reduce(
            (max: any, t: any) => (t.deployment_count > (max?.deployment_count || 0)) ? t : max,
            null
          )
        }
      }
    });

  } catch (error) {
    console.error('Templates API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/system/configuration/templates - Deploy template
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body: TemplateDeploymentRequest = await request.json();

    const { templateCode, organizationId, customizations, deploymentMode, userId } = body;

    if (!templateCode || !organizationId) {
      return NextResponse.json(
        { error: 'templateCode and organizationId are required' },
        { status: 400 }
      );
    }

    // Verify template exists
    const { data: template, error: templateError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('entity_code', templateCode)
      .eq('entity_type', 'erp_module_template')
      .eq('organization_id', '00000000-0000-0000-0000-000000000001')
      .single();

    if (templateError || !template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Check if already deployed
    const { data: existingDeployment } = await supabase
      .from('core_entities')
      .select('id')
      .eq('entity_code', `${templateCode}-ORG-${organizationId.split('-')[0]}`)
      .eq('organization_id', organizationId)
      .eq('entity_type', 'deployed_erp_module')
      .single();

    if (existingDeployment) {
      return NextResponse.json(
        { error: 'Template already deployed to this organization' },
        { status: 409 }
      );
    }

    const deploymentId = crypto.randomUUID();
    const deploymentCode = `${templateCode}-ORG-${organizationId.split('-')[0]}`;
    const startTime = Date.now();

    try {
      // Create deployed module entity
      const { error: deploymentError } = await supabase
        .from('core_entities')
        .insert({
          id: deploymentId,
          organization_id: organizationId,
          entity_type: 'deployed_erp_module',
          entity_name: `${template.entity_name} - Deployed`,
          entity_code: deploymentCode,
          is_active: true
        });

      if (deploymentError) {
        throw deploymentError;
      }

      // Store deployment metadata
      const deploymentMetadata = [
        { entity_id: deploymentId, field_name: 'template_code', field_value: templateCode, field_type: 'text' },
        { entity_id: deploymentId, field_name: 'deployment_mode', field_value: deploymentMode || 'quick', field_type: 'text' },
        { entity_id: deploymentId, field_name: 'deployment_status', field_value: 'success', field_type: 'text' },
        { entity_id: deploymentId, field_name: 'customizations', field_value: JSON.stringify(customizations || {}), field_type: 'json' },
        { entity_id: deploymentId, field_name: 'deployed_by', field_value: userId || 'system', field_type: 'text' },
        { entity_id: deploymentId, field_name: 'deployment_duration_seconds', field_value: ((Date.now() - startTime) / 1000).toString(), field_type: 'number' }
      ];

      const { error: metadataError } = await supabase
        .from('core_dynamic_data')
        .insert(deploymentMetadata);

      if (metadataError) {
        console.warn('Failed to store deployment metadata:', metadataError);
      }

      // Track configuration change
      const changeId = await supabase.rpc('track_configuration_change', {
        p_component_type: templateCode,
        p_component_id: deploymentId,
        p_change_type: 'template_deployment',
        p_organization_id: organizationId,
        p_user_id: userId || '00000001-0000-0000-0000-000000000001',
        p_change_data: JSON.stringify({
          template_code: templateCode,
          deployment_mode: deploymentMode,
          customizations: customizations
        }),
        p_impact_assessment: JSON.stringify({
          affected_organizations: 1,
          risk_level: 'low',
          impact_description: `Template ${templateCode} deployed successfully`
        })
      });

      return NextResponse.json({
        success: true,
        message: 'Template deployed successfully',
        data: {
          deploymentId,
          deploymentCode,
          templateCode,
          organizationId,
          deploymentTime: Date.now() - startTime,
          status: 'deployed',
          changeTrackingId: changeId.data
        }
      });

    } catch (deploymentError) {
      console.error('Template deployment failed:', deploymentError);
      
      // Track failed deployment
      await supabase.rpc('track_configuration_change', {
        p_component_type: templateCode,
        p_component_id: deploymentId,
        p_change_type: 'template_deployment_failed',
        p_organization_id: organizationId,
        p_user_id: userId || '00000001-0000-0000-0000-000000000001',
        p_change_data: JSON.stringify({
          template_code: templateCode,
          error: deploymentError.message
        }),
        p_impact_assessment: JSON.stringify({
          affected_organizations: 1,
          risk_level: 'medium',
          impact_description: `Template ${templateCode} deployment failed`
        })
      });

      return NextResponse.json(
        { error: 'Template deployment failed', details: deploymentError.message },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Template deployment API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}