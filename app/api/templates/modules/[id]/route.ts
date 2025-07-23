/**
 * HERA Universal - Individual ERP Module Operations API
 * 
 * Sacred Multi-Tenancy: organization_id validation on all operations
 * Handles GET/PUT/DELETE operations for individual ERP modules
 * Maintains strict tenant isolation and access control
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Admin client for operations
const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

// System constants
const SYSTEM_ORG_ID = '00000000-0000-0000-0000-000000000001';

// GET /api/templates/modules/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const moduleId = params.id;
    
    // SACRED: organization_id required for access control
    const organizationId = searchParams.get('organizationId');
    if (!organizationId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'organizationId is required for multi-tenant security' 
        },
        { status: 400 }
      );
    }
    
    console.log('🔍 Fetching module details:', moduleId, 'for org:', organizationId);

    // SACRED: Get module - must be accessible by organization (system or owned)
    const { data: module, error: moduleError } = await supabase
      .from('core_entities')
      .select(`
        *,
        organization:core_organizations!inner(
          id,
          org_name,
          client:core_clients(
            id,
            client_name
          )
        )
      `)
      .eq('id', moduleId)
      .in('organization_id', [SYSTEM_ORG_ID, organizationId]) // SACRED: Access control
      .in('entity_type', ['erp_module_template', 'custom_module_template'])
      .eq('is_active', true)
      .single();

    if (moduleError || !module) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Module not found or access denied' 
        },
        { status: 404 }
      );
    }

    // Get dynamic data
    const { data: dynamicData } = await supabase
      .from('core_dynamic_data')
      .select('field_name, field_value, field_type')
      .eq('entity_id', moduleId);

    // Get module dependencies
    const { data: dependencies } = await supabase
      .from('core_relationships')
      .select(`
        child_entity_id,
        child_module:core_entities!core_relationships_child_entity_id_fkey(
          id, entity_name, entity_code
        )
      `)
      .eq('parent_entity_id', moduleId)
      .in('organization_id', [SYSTEM_ORG_ID, organizationId]) // SACRED: Filter relationships
      .eq('relationship_type', 'module_depends_on')
      .eq('is_active', true);

    // Get modules that depend on this one
    const { data: dependents } = await supabase
      .from('core_relationships')
      .select(`
        parent_entity_id,
        parent_module:core_entities!core_relationships_parent_entity_id_fkey(
          id, entity_name, entity_code
        )
      `)
      .eq('child_entity_id', moduleId)
      .in('organization_id', [SYSTEM_ORG_ID, organizationId]) // SACRED: Filter relationships
      .eq('relationship_type', 'module_depends_on')
      .eq('is_active', true);

    // Check deployment status for this organization
    const { data: deployment } = await supabase
      .from('core_entities')
      .select('id, entity_code, created_at')
      .eq('organization_id', organizationId) // SACRED: Only check org deployment
      .eq('entity_type', 'deployed_erp_module')
      .eq('entity_code', `${module.entity_code}-DEPLOYED`)
      .eq('is_active', true)
      .single();

    // Get deployment history for this module
    const { data: deploymentHistory } = await supabase
      .from('universal_transactions')
      .select(`
        id, transaction_date, created_at,
        transaction_lines:universal_transaction_lines!inner(
          line_description, line_amount
        )
      `)
      .eq('organization_id', organizationId) // SACRED: Only org transactions
      .eq('transaction_type', 'template_deployment')
      .contains('transaction_data', { module_id: moduleId })
      .order('created_at', { ascending: false })
      .limit(5);

    // Build metadata map
    const metadata: Record<string, any> = {};
    dynamicData?.forEach(dd => {
      metadata[dd.field_name] = dd.field_value;
    });

    // Enrich module data
    const enrichedModule = {
      id: module.id,
      entity_code: module.entity_code,
      entity_name: module.entity_name,
      entity_type: module.entity_type,
      organization_id: module.organization_id,
      is_system: module.organization_id === SYSTEM_ORG_ID,
      is_custom: module.entity_type === 'custom_module_template',
      created_at: module.created_at,
      updated_at: module.updated_at,
      
      // Metadata
      description: metadata.description,
      module_category: metadata.module_category,
      functional_area: metadata.functional_area,
      is_core: metadata.is_core === 'true',
      
      // Configuration
      configuration: {
        deployment_time_minutes: parseInt(metadata.deployment_time_minutes || '15'),
        requires_setup: metadata.requires_setup === 'true',
        has_ui_components: metadata.has_ui_components === 'true',
        data_migration_required: metadata.data_migration_required === 'true',
        coa_accounts: parseInt(metadata.coa_accounts || '0'),
        workflow_steps: parseInt(metadata.workflow_steps || '0')
      },
      
      // Dependencies
      dependencies: dependencies?.map(dep => ({
        id: dep.child_entity_id,
        name: dep.child_module?.entity_name,
        code: dep.child_module?.entity_code
      })) || [],
      
      // Dependents
      dependents: dependents?.map(dep => ({
        id: dep.parent_entity_id,
        name: dep.parent_module?.entity_name,
        code: dep.parent_module?.entity_code
      })) || [],
      
      // Deployment status
      deployment_status: {
        is_deployed: !!deployment,
        deployed_at: deployment?.created_at,
        deployment_id: deployment?.id,
        deployment_history: deploymentHistory?.length || 0
      },
      
      // Analytics
      usage_analytics: {
        total_deployments: parseInt(metadata.total_deployments || '0'),
        active_organizations: parseInt(metadata.active_organizations || '0'),
        average_utilization: parseFloat(metadata.average_utilization || '0'),
        last_deployed: metadata.last_deployed
      },
      
      // Organization info
      organization: module.organization
    };

    console.log('✅ Module details fetched successfully');

    return NextResponse.json({
      success: true,
      data: enrichedModule,
      metadata: {
        organizationId,
        hasAccess: true,
        isSystemModule: module.organization_id === SYSTEM_ORG_ID,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Get module details error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch module details' 
      },
      { status: 500 }
    );
  }
}

// PUT /api/templates/modules/[id] - Update module configuration
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getAdminClient();
    const moduleId = params.id;
    const body = await request.json();
    
    const { organizationId, updates } = body;

    // SACRED: Validate organization_id is provided
    if (!organizationId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'organizationId is required for multi-tenant security' 
        },
        { status: 400 }
      );
    }

    console.log('🔧 Updating module configuration:', moduleId, 'for org:', organizationId);

    // SACRED: Verify module exists and organization has access
    const { data: module, error: moduleError } = await supabase
      .from('core_entities')
      .select('id, organization_id, entity_type')
      .eq('id', moduleId)
      .in('organization_id', [SYSTEM_ORG_ID, organizationId]) // SACRED: Access control
      .eq('is_active', true)
      .single();

    if (moduleError || !module) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Module not found or access denied' 
        },
        { status: 404 }
      );
    }

    // Only allow updates to custom modules owned by the organization
    if (module.organization_id !== organizationId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot modify system modules. Create a custom module instead.' 
        },
        { status: 403 }
      );
    }

    // Update entity name if provided
    if (updates.entity_name) {
      const { error: updateError } = await supabase
        .from('core_entities')
        .update({ 
          entity_name: updates.entity_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', moduleId)
        .eq('organization_id', organizationId); // SACRED: Double-check org

      if (updateError) {
        console.error('❌ Error updating entity:', updateError);
        throw updateError;
      }
    }

    // Update dynamic data fields
    const dynamicUpdates = Object.entries(updates)
      .filter(([key]) => key !== 'entity_name' && key !== 'organizationId')
      .map(([field_name, field_value]) => ({
        entity_id: moduleId,
        field_name,
        field_value: String(field_value),
        field_type: typeof field_value === 'number' ? 'number' : 
                   typeof field_value === 'boolean' ? 'boolean' : 'text'
      }));

    if (dynamicUpdates.length > 0) {
      // Use upsert to update existing or create new dynamic data
      const { error: dynamicError } = await supabase
        .from('core_dynamic_data')
        .upsert(dynamicUpdates, { 
          onConflict: 'entity_id,field_name',
          ignoreDuplicates: false 
        });

      if (dynamicError) {
        console.error('❌ Error updating dynamic data:', dynamicError);
        throw dynamicError;
      }
    }

    console.log('✅ Module configuration updated successfully');

    return NextResponse.json({
      success: true,
      message: 'Module configuration updated successfully',
      data: {
        moduleId,
        organizationId,
        updatedFields: Object.keys(updates)
      }
    });

  } catch (error) {
    console.error('❌ Update module error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update module' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/templates/modules/[id] - Soft delete custom module
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const moduleId = params.id;
    
    // SACRED: organization_id required for access control
    const organizationId = searchParams.get('organizationId');
    if (!organizationId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'organizationId is required for multi-tenant security' 
        },
        { status: 400 }
      );
    }

    console.log('🗑️ Deleting custom module:', moduleId, 'for org:', organizationId);

    // SACRED: Verify module exists and organization owns it
    const { data: module, error: moduleError } = await supabase
      .from('core_entities')
      .select('id, organization_id, entity_type, entity_name')
      .eq('id', moduleId)
      .eq('organization_id', organizationId) // SACRED: Must be owned by org
      .eq('entity_type', 'custom_module_template') // Only custom modules can be deleted
      .eq('is_active', true)
      .single();

    if (moduleError || !module) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Custom module not found or access denied' 
        },
        { status: 404 }
      );
    }

    // Check if module is currently deployed
    const { data: deployment } = await supabase
      .from('core_entities')
      .select('id')
      .eq('organization_id', organizationId) // SACRED: Check org deployment
      .eq('entity_type', 'deployed_erp_module')
      .eq('entity_code', `${module.entity_code || module.id}-DEPLOYED`)
      .eq('is_active', true)
      .single();

    if (deployment) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete deployed module. Please undeploy first.' 
        },
        { status: 409 }
      );
    }

    // Check if other modules depend on this one
    const { data: dependents } = await supabase
      .from('core_relationships')
      .select('parent_entity_id')
      .eq('child_entity_id', moduleId)
      .eq('organization_id', organizationId) // SACRED: Check org relationships
      .eq('relationship_type', 'module_depends_on')
      .eq('is_active', true);

    if (dependents && dependents.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot delete module. ${dependents.length} other modules depend on it.` 
        },
        { status: 409 }
      );
    }

    // Soft delete the module (set is_active = false)
    const { error: deleteError } = await supabase
      .from('core_entities')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', moduleId)
      .eq('organization_id', organizationId); // SACRED: Double-check org

    if (deleteError) {
      console.error('❌ Error deleting module:', deleteError);
      throw deleteError;
    }

    // Deactivate related relationships
    const { error: relError } = await supabase
      .from('core_relationships')
      .update({ is_active: false })
      .or(`parent_entity_id.eq.${moduleId},child_entity_id.eq.${moduleId}`)
      .eq('organization_id', organizationId); // SACRED: Only org relationships

    if (relError) {
      console.error('❌ Error deactivating relationships:', relError);
      // Don't throw - partial success is acceptable
    }

    console.log('✅ Custom module deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Custom module deleted successfully',
      data: {
        moduleId,
        moduleName: module.entity_name,
        organizationId
      }
    });

  } catch (error) {
    console.error('❌ Delete module error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete module' 
      },
      { status: 500 }
    );
  }
}