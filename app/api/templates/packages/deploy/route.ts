/**
 * HERA Universal - Industry Package Deployment API
 * 
 * Sacred Multi-Tenancy: Complete ERP deployment with organization_id isolation
 * Deploys complete industry packages (multiple modules) in one transaction
 * Creates comprehensive deployment transaction with detailed line items
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

interface PackageDeploymentRequest {
  organizationId: string;
  clientId?: string;
  packageId: string;
  deploymentOptions?: {
    businessSize?: 'small' | 'medium' | 'large' | 'enterprise';
    industrySpecific?: boolean;
    includeOptionalModules?: boolean;
    setupChartOfAccounts?: boolean;
    createDefaultWorkflows?: boolean;
    enableAnalytics?: boolean;
    assignUsers?: Array<{
      userId: string;
      role: string;
      modules: string[];
    }>;
    customConfigurations?: Record<string, any>;
  };
  createdBy?: string;
}

interface PackageDeploymentResult {
  deploymentId: string;
  transactionId: string;
  organizationId: string;
  packageId: string;
  packageName: string;
  status: 'success' | 'partial' | 'failed';
  deployment_summary: {
    modules_deployed: number;
    modules_failed: number;
    accounts_created: number;
    workflows_created: number;
    users_assigned: number;
  };
  deployed_modules: Array<{
    moduleId: string;
    moduleCode: string;
    moduleName: string;
    status: 'success' | 'failed';
    deployment_time_seconds: number;
    accounts_created?: number;
    workflows_created?: number;
    error?: string;
  }>;
  created_accounts?: Array<{
    account_code: string;
    account_name: string;
    account_type: string;
    created_by_module: string;
  }>;
  created_workflows?: Array<{
    workflow_code: string;
    workflow_name: string;
    created_by_module: string;
    steps: string[];
  }>;
  user_assignments?: Array<{
    userId: string;
    modules: string[];
    permissions: string[];
  }>;
  total_deployment_time_seconds: number;
  errors?: string[];
  warnings?: string[];
}

// POST /api/templates/packages/deploy - Deploy complete industry package
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body: PackageDeploymentRequest = await request.json();
    const startTime = Date.now();
    
    const { organizationId, clientId, packageId, deploymentOptions, createdBy } = body;

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

    console.log('🚀 Starting package deployment:', packageId, 'to org:', organizationId);

    // SACRED: Verify organization exists and is active
    const { data: organization, error: orgError } = await supabase
      .from('core_organizations')
      .select('id, org_name, client_id, is_active')
      .eq('id', organizationId)
      .eq('is_active', true)
      .single();

    if (orgError || !organization) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Organization not found or inactive' 
        },
        { status: 404 }
      );
    }

    // SACRED: Get package template - must be accessible (system or owned)
    const { data: packageTemplate, error: packageError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('id', packageId)
      .in('organization_id', [SYSTEM_ORG_ID, organizationId]) // SACRED: Access control
      .in('entity_type', ['erp_industry_template', 'custom_package_template'])
      .eq('is_active', true)
      .single();

    if (packageError || !packageTemplate) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Package template not found or access denied' 
        },
        { status: 404 }
      );
    }

    // Get package modules via relationships (simplified query to avoid join issues)
    const { data: packageRelationships } = await supabase
      .from('core_relationships')
      .select('child_entity_id, relationship_data')
      .in('organization_id', [SYSTEM_ORG_ID, organizationId]) // SACRED: Filter relationships
      .eq('parent_entity_id', packageId)
      .eq('relationship_type', 'template_includes_module')
      .eq('is_active', true)
      .order('relationship_data->order', { ascending: true });

    console.log('📋 Found package relationships:', packageRelationships?.length || 0);

    let packageModules: any[] = [];
    if (packageRelationships && packageRelationships.length > 0) {
      // Get the actual modules
      const childIds = packageRelationships.map(r => r.child_entity_id);
      const { data: modules } = await supabase
        .from('core_entities')
        .select('id, entity_name, entity_code, entity_type')
        .in('id', childIds);

      // Combine relationship data with module data
      packageModules = packageRelationships.map(rel => {
        const module = modules?.find(m => m.id === rel.child_entity_id);
        return {
          child_entity_id: rel.child_entity_id,
          relationship_data: rel.relationship_data,
          child_module: module
        };
      }).filter(pm => pm.child_module); // Only include items where module was found
    }

    if (!packageModules || packageModules.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Package contains no modules' 
        },
        { status: 400 }
      );
    }

    // Check for already deployed modules
    const modulesCodes = packageModules.map(pm => pm.child_module.entity_code);
    const deployedCodes = modulesCodes.map(code => `${code}-DEPLOYED`);
    
    const { data: alreadyDeployed } = await supabase
      .from('core_entities')
      .select('entity_code')
      .eq('organization_id', organizationId) // SACRED: Check org deployments
      .eq('entity_type', 'deployed_erp_module')
      .in('entity_code', deployedCodes)
      .eq('is_active', true);

    const alreadyDeployedSet = new Set(alreadyDeployed?.map(ad => ad.entity_code.replace('-DEPLOYED', '')) || []);
    const modulesToDeploy = packageModules.filter(pm => 
      !alreadyDeployedSet.has(pm.child_module.entity_code)
    );

    // Deduplicate modules to prevent duplicate deployments
    const uniqueModulesToDeploy = [];
    const seenModuleCodes = new Set();
    
    for (const moduleRelation of modulesToDeploy) {
      const moduleCode = moduleRelation.child_module.entity_code;
      if (!seenModuleCodes.has(moduleCode)) {
        seenModuleCodes.add(moduleCode);
        uniqueModulesToDeploy.push(moduleRelation);
      }
    }
    
    console.log(`📋 Deduplicated modules: ${modulesToDeploy.length} → ${uniqueModulesToDeploy.length}`);

    if (uniqueModulesToDeploy.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'All package modules are already deployed to this organization' 
        },
        { status: 409 }
      );
    }

    // SACRED: Create deployment transaction with organization_id
    const transactionNumber = `PKG-DEPLOY-${organizationId.substring(0, 8)}-${Date.now()}`;
    
    const { data: transaction, error: transactionError } = await supabase
      .from('universal_transactions')
      .insert({
        organization_id: organizationId, // SACRED: Transaction isolation
        transaction_type: 'package_deployment',
        transaction_number: transactionNumber,
        transaction_date: new Date().toISOString().split('T')[0],
        total_amount: uniqueModulesToDeploy.length * 0, // No cost for internal deployments
        currency: 'USD',
        created_by: createdBy || SYSTEM_USER_ID,
        transaction_status: 'processing',
        transaction_data: {
          package_id: packageId,
          package_name: packageTemplate.entity_name,
          package_code: packageTemplate.entity_code,
          total_modules: packageModules.length,
          modules_to_deploy: uniqueModulesToDeploy.length,
          deployment_options: deploymentOptions || {},
          start_time: new Date().toISOString(),
          client_id: clientId || organization.client_id // Store client_id in metadata instead
        }
      })
      .select()
      .single();

    if (transactionError) {
      console.error('❌ Error creating deployment transaction:', transactionError);
      throw transactionError;
    }

    const deploymentResult: PackageDeploymentResult = {
      deploymentId: crypto.randomUUID(),
      transactionId: transaction.id,
      organizationId,
      packageId,
      packageName: packageTemplate.entity_name,
      status: 'success',
      deployment_summary: {
        modules_deployed: 0,
        modules_failed: 0,
        accounts_created: 0,
        workflows_created: 0,
        users_assigned: 0
      },
      deployed_modules: [],
      created_accounts: [],
      created_workflows: [],
      user_assignments: [],
      total_deployment_time_seconds: 0,
      errors: [],
      warnings: []
    };

    // Deploy each module in the package
    let lineOrder = 1;
    
    for (const packageModule of uniqueModulesToDeploy) {
      const moduleStartTime = Date.now();
      const module = packageModule.child_module;
      
      try {
        console.log(`🛠️ Deploying module: ${module.entity_name}`);

        // SACRED: Create deployed module entity with organization_id
        const deployedModuleId = crypto.randomUUID();
        
        const { data: deployedModule, error: deployError } = await supabase
          .from('core_entities')
          .insert({
            id: deployedModuleId,
            organization_id: organizationId, // SACRED: Deployed to specific org
            entity_type: 'deployed_erp_module',
            entity_name: `${module.entity_name} - Deployed`,
            entity_code: `${module.entity_code}-DEPLOYED`,
            is_active: true
          })
          .select()
          .single();

        if (deployError) {
          throw new Error(`Failed to create deployed module entity: ${deployError.message}`);
        }

        // Get and copy module configuration
        const { data: moduleConfig } = await supabase
          .from('core_dynamic_data')
          .select('field_name, field_value')
          .eq('entity_id', module.id);

        const configMap: Record<string, any> = {};
        moduleConfig?.forEach(config => {
          configMap[config.field_name] = config.field_value;
        });

        // Copy module configuration to deployed instance
        const deployedModuleConfig = Object.entries(configMap).map(([field_name, field_value]) => ({
          entity_id: deployedModuleId,
          field_name,
          field_value: String(field_value),
          field_type: typeof field_value === 'number' ? 'number' : 
                     typeof field_value === 'boolean' ? 'boolean' : 'text'
        }));

        // Add deployment-specific metadata
        deployedModuleConfig.push(
          {
            entity_id: deployedModuleId,
            field_name: 'deployed_at',
            field_value: new Date().toISOString(),
            field_type: 'text'
          },
          {
            entity_id: deployedModuleId,
            field_name: 'deployed_by',
            field_value: createdBy || SYSTEM_USER_ID,
            field_type: 'text'
          },
          {
            entity_id: deployedModuleId,
            field_name: 'deployment_transaction_id',
            field_value: transaction.id,
            field_type: 'text'
          },
          {
            entity_id: deployedModuleId,
            field_name: 'source_template_id',
            field_value: module.id,
            field_type: 'text'
          },
          {
            entity_id: deployedModuleId,
            field_name: 'deployed_as_part_of_package',
            field_value: packageId,
            field_type: 'text'
          }
        );

        const { error: configError } = await supabase
          .from('core_dynamic_data')
          .insert(deployedModuleConfig);

        if (configError) {
          deploymentResult.warnings?.push(`Failed to copy module configuration for ${module.entity_name}: ${configError.message}`);
        }

        // SACRED: Create deployment transaction line with organization_id
        const { error: lineError } = await supabase
          .from('universal_transaction_lines')
          .insert({
            transaction_id: transaction.id,
            organization_id: organizationId, // SACRED: Line isolation
            entity_id: deployedModuleId,
            line_description: `Deploy ${module.entity_name}`,
            quantity: 1,
            unit_price: 0,
            line_amount: 0,
            line_order: lineOrder++,
            line_data: {
              module_code: module.entity_code,
              module_category: module.entity_type,
              deployment_status: 'completed'
            }
          });

        if (lineError) {
          deploymentResult.warnings?.push(`Failed to create transaction line for ${module.entity_name}: ${lineError.message}`);
        }

        // Setup module-specific resources
        let moduleAccountsCreated = 0;
        let moduleWorkflowsCreated = 0;

        // Setup Chart of Accounts if enabled
        if (deploymentOptions?.setupChartOfAccounts) {
          try {
            const accounts = await setupModuleChartOfAccounts(
              supabase,
              organizationId,
              module,
              configMap
            );
            
            deploymentResult.created_accounts?.push(...accounts.map(acc => ({
              ...acc,
              created_by_module: module.entity_code
            })));
            
            moduleAccountsCreated = accounts.length;
          } catch (coaError) {
            deploymentResult.warnings?.push(`COA setup failed for ${module.entity_name}: ${coaError}`);
          }
        }

        // Create workflows if enabled
        if (deploymentOptions?.createDefaultWorkflows) {
          try {
            const workflows = await createModuleWorkflows(
              supabase,
              organizationId,
              module,
              configMap
            );
            
            deploymentResult.created_workflows?.push(...workflows.map(wf => ({
              ...wf,
              created_by_module: module.entity_code
            })));
            
            moduleWorkflowsCreated = workflows.length;
          } catch (workflowError) {
            deploymentResult.warnings?.push(`Workflow creation failed for ${module.entity_name}: ${workflowError}`);
          }
        }

        const moduleDeploymentTime = Math.round((Date.now() - moduleStartTime) / 1000);

        // Add to deployment results
        deploymentResult.deployed_modules.push({
          moduleId: module.id,
          moduleCode: module.entity_code,
          moduleName: module.entity_name,
          status: 'success',
          deployment_time_seconds: moduleDeploymentTime,
          accounts_created: moduleAccountsCreated,
          workflows_created: moduleWorkflowsCreated
        });

        deploymentResult.deployment_summary.modules_deployed++;
        deploymentResult.deployment_summary.accounts_created += moduleAccountsCreated;
        deploymentResult.deployment_summary.workflows_created += moduleWorkflowsCreated;

        console.log(`✅ Module deployed successfully: ${module.entity_name} (${moduleDeploymentTime}s)`);

      } catch (moduleError) {
        console.error(`❌ Module deployment failed: ${module.entity_name}:`, moduleError);
        
        deploymentResult.deployed_modules.push({
          moduleId: module.id,
          moduleCode: module.entity_code,
          moduleName: module.entity_name,
          status: 'failed',
          deployment_time_seconds: Math.round((Date.now() - moduleStartTime) / 1000),
          error: moduleError instanceof Error ? moduleError.message : 'Unknown error'
        });

        deploymentResult.deployment_summary.modules_failed++;
        deploymentResult.errors?.push(`${module.entity_name}: ${moduleError instanceof Error ? moduleError.message : 'Unknown error'}`);
      }
    }

    // Handle user assignments if specified
    if (deploymentOptions?.assignUsers && deploymentOptions.assignUsers.length > 0) {
      try {
        const assignments = await assignUsersToModules(
          supabase,
          organizationId,
          deploymentOptions.assignUsers,
          deploymentResult.deployed_modules.filter(dm => dm.status === 'success')
        );
        
        deploymentResult.user_assignments = assignments;
        deploymentResult.deployment_summary.users_assigned = assignments.length;
        
      } catch (assignError) {
        deploymentResult.warnings?.push(`User assignment failed: ${assignError}`);
      }
    }

    // Determine overall deployment status
    if (deploymentResult.deployment_summary.modules_failed > 0) {
      if (deploymentResult.deployment_summary.modules_deployed > 0) {
        deploymentResult.status = 'partial';
      } else {
        deploymentResult.status = 'failed';
      }
    }

    // Calculate total deployment time
    deploymentResult.total_deployment_time_seconds = Math.round((Date.now() - startTime) / 1000);

    // Update transaction status
    const transactionStatus = deploymentResult.status === 'failed' ? 'failed' : 'completed';
    
    const { error: updateError } = await supabase
      .from('universal_transactions')
      .update({
        transaction_status: transactionStatus,
        posted_at: new Date().toISOString(),
        transaction_data: {
          ...transaction.transaction_data,
          end_time: new Date().toISOString(),
          deployment_result: {
            status: deploymentResult.status,
            modules_deployed: deploymentResult.deployment_summary.modules_deployed,
            modules_failed: deploymentResult.deployment_summary.modules_failed,
            accounts_created: deploymentResult.deployment_summary.accounts_created,
            workflows_created: deploymentResult.deployment_summary.workflows_created,
            users_assigned: deploymentResult.deployment_summary.users_assigned,
            total_time_seconds: deploymentResult.total_deployment_time_seconds
          }
        }
      })
      .eq('id', transaction.id)
      .eq('organization_id', organizationId); // SACRED: Double-check org

    if (updateError) {
      deploymentResult.warnings?.push(`Failed to update transaction status: ${updateError.message}`);
    }

    const successIcon = deploymentResult.status === 'success' ? '✅' : 
                       deploymentResult.status === 'partial' ? '⚠️' : '❌';
    
    console.log(`${successIcon} Package deployment ${deploymentResult.status}:`, 
      `${deploymentResult.deployment_summary.modules_deployed}/${modulesToDeploy.length} modules`,
      `(${deploymentResult.total_deployment_time_seconds}s)`);

    return NextResponse.json({
      success: deploymentResult.status !== 'failed',
      data: deploymentResult,
      message: `Package deployment ${deploymentResult.status}: ${deploymentResult.deployment_summary.modules_deployed} modules deployed`
    }, { 
      status: deploymentResult.status === 'failed' ? 500 : 201
    });

  } catch (error) {
    console.error('❌ Package deployment error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Package deployment failed' 
      },
      { status: 500 }
    );
  }
}

// Helper function to setup Chart of Accounts for module (reused from modules/deploy)
async function setupModuleChartOfAccounts(
  supabase: any, 
  organizationId: string, 
  module: any, 
  moduleConfig: Record<string, any>
): Promise<Array<{ account_code: string; account_name: string; account_type: string }>> {
  const accounts = [];
  
  // Module-specific account patterns (same as in module deployment)
  const moduleAccountPatterns: Record<string, Array<{ code: string; name: string; type: string }>> = {
    'SYS-GL-CORE': [
      { code: '1001000', name: 'Cash - Operating Account', type: 'ASSET' },
      { code: '2001000', name: 'Accounts Payable', type: 'LIABILITY' },
      { code: '3001000', name: 'Owner\'s Equity', type: 'EQUITY' },
      { code: '4001000', name: 'Revenue - General', type: 'REVENUE' }
    ],
    'SYS-AR-MGMT': [
      { code: '1002000', name: 'Accounts Receivable', type: 'ASSET' },
      { code: '1002100', name: 'Allowance for Doubtful Accounts', type: 'ASSET' }
    ],
    'SYS-INVENTORY': [
      { code: '1003000', name: 'Inventory - Raw Materials', type: 'ASSET' },
      { code: '1003100', name: 'Inventory - Work in Process', type: 'ASSET' },
      { code: '1003200', name: 'Inventory - Finished Goods', type: 'ASSET' },
      { code: '5001000', name: 'Cost of Goods Sold', type: 'COST_OF_SALES' }
    ],
    'SYS-PROCURE': [
      { code: '2002000', name: 'Accounts Payable - Trade', type: 'LIABILITY' },
      { code: '6001000', name: 'Procurement Expenses', type: 'DIRECT_EXPENSE' }
    ],
    'SYS-HR-CORE': [
      { code: '6002000', name: 'Salaries and Wages', type: 'DIRECT_EXPENSE' },
      { code: '2003000', name: 'Accrued Payroll', type: 'LIABILITY' },
      { code: '6003000', name: 'Employee Benefits', type: 'DIRECT_EXPENSE' }
    ]
  };

  const moduleCode = module.entity_code;
  const accountsToCreate = moduleAccountPatterns[moduleCode] || [];

  for (const account of accountsToCreate) {
    try {
      // Check if account already exists
      const { data: existingAccount } = await supabase
        .from('core_entities')
        .select('id')
        .eq('organization_id', organizationId) // SACRED: Org filter
        .eq('entity_type', 'chart_of_account')
        .eq('entity_code', account.code)
        .single();

      if (existingAccount) continue; // Skip if exists

      // SACRED: Create account entity with organization_id
      const accountId = crypto.randomUUID();
      const { error: accountError } = await supabase
        .from('core_entities')
        .insert({
          id: accountId,
          organization_id: organizationId, // SACRED: Account isolation
          entity_type: 'chart_of_account',
          entity_name: account.name,
          entity_code: account.code,
          is_active: true
        });

      if (accountError) throw accountError;

      // Add account metadata
      await supabase
        .from('core_dynamic_data')
        .insert([
          {
            entity_id: accountId,
            field_name: 'account_type',
            field_value: account.type,
            field_type: 'text'
          },
          {
            entity_id: accountId,
            field_name: 'created_by_module',
            field_value: moduleCode,
            field_type: 'text'
          },
          {
            entity_id: accountId,
            field_name: 'current_balance',
            field_value: '0',
            field_type: 'number'
          }
        ]);

      accounts.push({
        account_code: account.code,
        account_name: account.name,
        account_type: account.type
      });

    } catch (error) {
      console.error('Error creating account:', account.code, error);
    }
  }

  return accounts;
}

// Helper function to create module workflows (reused from modules/deploy)
async function createModuleWorkflows(
  supabase: any,
  organizationId: string,
  module: any,
  moduleConfig: Record<string, any>
): Promise<Array<{ workflow_code: string; workflow_name: string; steps: string[] }>> {
  const workflows = [];
  
  // Module-specific workflow patterns (same as in module deployment)
  const workflowPatterns: Record<string, Array<{ code: string; name: string; steps: string[] }>> = {
    'SYS-PROCURE': [
      { 
        code: 'PROC-APPROVAL',
        name: 'Purchase Order Approval Workflow',
        steps: ['request', 'review', 'approve', 'purchase']
      }
    ],
    'SYS-AR-MGMT': [
      {
        code: 'AR-COLLECTION',
        name: 'Accounts Receivable Collection Workflow',
        steps: ['invoice', 'follow_up', 'collection', 'write_off']
      }
    ],
    'SYS-HR-CORE': [
      {
        code: 'HR-ONBOARDING',
        name: 'Employee Onboarding Workflow',
        steps: ['application', 'background_check', 'offer', 'onboarding']
      }
    ],
    'SYS-CRM-CORE': [
      {
        code: 'LEAD-MGMT',
        name: 'Lead Management Workflow',
        steps: ['lead_capture', 'qualification', 'nurturing', 'conversion']
      }
    ]
  };

  const moduleCode = module.entity_code;
  const workflowsToCreate = workflowPatterns[moduleCode] || [];

  for (const workflow of workflowsToCreate) {
    try {
      // SACRED: Create workflow entity with organization_id
      const workflowId = crypto.randomUUID();
      const { error: workflowError } = await supabase
        .from('core_entities')
        .insert({
          id: workflowId,
          organization_id: organizationId, // SACRED: Workflow isolation
          entity_type: 'business_workflow',
          entity_name: workflow.name,
          entity_code: workflow.code,
          is_active: true
        });

      if (workflowError) throw workflowError;

      // Add workflow metadata
      await supabase
        .from('core_dynamic_data')
        .insert([
          {
            entity_id: workflowId,
            field_name: 'workflow_steps',
            field_value: JSON.stringify(workflow.steps),
            field_type: 'json'
          },
          {
            entity_id: workflowId,
            field_name: 'created_by_module',
            field_value: moduleCode,
            field_type: 'text'
          },
          {
            entity_id: workflowId,
            field_name: 'is_active',
            field_value: 'true',
            field_type: 'boolean'
          }
        ]);

      workflows.push({
        workflow_code: workflow.code,
        workflow_name: workflow.name,
        steps: workflow.steps
      });

    } catch (error) {
      console.error('Error creating workflow:', workflow.code, error);
    }
  }

  return workflows;
}

// Helper function to assign users to modules
async function assignUsersToModules(
  supabase: any,
  organizationId: string,
  userAssignments: Array<{ userId: string; role: string; modules: string[] }>,
  deployedModules: Array<{ moduleId: string; moduleCode: string; moduleName: string }>
): Promise<Array<{ userId: string; modules: string[]; permissions: string[] }>> {
  const assignments = [];

  for (const assignment of userAssignments) {
    try {
      // Verify user exists and has access to organization
      const { data: userOrg } = await supabase
        .from('user_organizations')
        .select('user_id, role')
        .eq('user_id', assignment.userId)
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .single();

      if (!userOrg) {
        console.warn(`User ${assignment.userId} not found in organization ${organizationId}`);
        continue;
      }

      const assignedModules = [];
      const permissions = [];

      // Assign user to each specified module
      for (const moduleCode of assignment.modules) {
        const deployedModule = deployedModules.find(dm => dm.moduleCode === moduleCode);
        if (!deployedModule) {
          console.warn(`Module ${moduleCode} not found in deployed modules`);
          continue;
        }

        // Create user-module relationship
        const { error: relationError } = await supabase
          .from('core_relationships')
          .insert({
            organization_id: organizationId,
            relationship_type: 'user_has_module_access',
            parent_entity_id: assignment.userId, // User as parent
            child_entity_id: deployedModule.moduleId, // Module as child
            relationship_data: {
              role: assignment.role,
              assigned_at: new Date().toISOString(),
              permissions: ['read', 'write', 'execute'] // Default permissions
            },
            is_active: true
          });

        if (!relationError) {
          assignedModules.push(moduleCode);
          permissions.push('read', 'write', 'execute');
        } else {
          console.error(`Failed to assign user ${assignment.userId} to module ${moduleCode}:`, relationError);
        }
      }

      if (assignedModules.length > 0) {
        assignments.push({
          userId: assignment.userId,
          modules: assignedModules,
          permissions: [...new Set(permissions)] // Remove duplicates
        });
      }

    } catch (error) {
      console.error(`Error assigning user ${assignment.userId}:`, error);
    }
  }

  return assignments;
}