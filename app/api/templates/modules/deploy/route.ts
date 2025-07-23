/**
 * HERA Universal - ERP Module Deployment API
 * 
 * Sacred Multi-Tenancy: All deployments tracked with organization_id
 * Creates deployment transactions using universal_transactions system
 * Maintains complete audit trail of all module deployments
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

interface ModuleDeploymentRequest {
  organizationId: string;
  clientId?: string;
  moduleId: string;
  deploymentOptions?: {
    configuration?: Record<string, any>;
    includeDefaultData?: boolean;
    setupChartOfAccounts?: boolean;
    createWorkflows?: boolean;
    assignUsers?: string[];
  };
  createdBy?: string;
}

interface DeploymentResult {
  deploymentId: string;
  transactionId: string;
  organizationId: string;
  moduleId: string;
  status: 'success' | 'partial' | 'failed';
  deployed_entities: Array<{
    entity_type: string;
    entity_code: string;
    entity_name: string;
  }>;
  created_accounts?: Array<{
    account_code: string;
    account_name: string;
  }>;
  created_workflows?: Array<{
    workflow_code: string;
    workflow_name: string;
  }>;
  deployment_time_seconds: number;
  errors?: string[];
  warnings?: string[];
}

// POST /api/templates/modules/deploy - Deploy module to organization
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body: ModuleDeploymentRequest = await request.json();
    const startTime = Date.now();
    
    const { organizationId, clientId, moduleId, deploymentOptions, createdBy } = body;

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

    console.log('🚀 Starting module deployment:', moduleId, 'to org:', organizationId);

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

    // SACRED: Get module template - must be accessible (system or owned)
    const { data: module, error: moduleError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('id', moduleId)
      .in('organization_id', [SYSTEM_ORG_ID, organizationId]) // SACRED: Access control
      .in('entity_type', ['erp_module_template', 'custom_module_template'])
      .eq('is_active', true)
      .single();

    if (moduleError || !module) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Module template not found or access denied' 
        },
        { status: 404 }
      );
    }

    // Check if module is already deployed
    const { data: existingDeployment } = await supabase
      .from('core_entities')
      .select('id, entity_code')
      .eq('organization_id', organizationId) // SACRED: Check org deployment
      .eq('entity_type', 'deployed_erp_module')
      .eq('entity_code', `${module.entity_code}-DEPLOYED`)
      .eq('is_active', true)
      .single();

    if (existingDeployment) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Module '${module.entity_name}' is already deployed to this organization` 
        },
        { status: 409 }
      );
    }

    // Get module configuration and dependencies
    const { data: moduleData } = await supabase
      .from('core_dynamic_data')
      .select('field_name, field_value')
      .eq('entity_id', moduleId);

    const moduleConfig: Record<string, any> = {};
    moduleData?.forEach(data => {
      moduleConfig[data.field_name] = data.field_value;
    });

    // SACRED: Create deployment transaction with organization_id
    const transactionNumber = `DEPLOY-${organizationId.substring(0, 8)}-${Date.now()}`;
    
    const { data: transaction, error: transactionError } = await supabase
      .from('universal_transactions')
      .insert({
        organization_id: organizationId, // SACRED: Transaction isolation
        transaction_type: 'module_deployment',
        transaction_number: transactionNumber,
        transaction_date: new Date().toISOString().split('T')[0],
        total_amount: 0, // No cost for internal deployments
        currency: 'USD',
        created_by: createdBy || SYSTEM_USER_ID,
        transaction_status: 'processing',
        transaction_data: {
          module_id: moduleId,
          module_name: module.entity_name,
          module_code: module.entity_code,
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

    const deploymentResult: DeploymentResult = {
      deploymentId: crypto.randomUUID(),
      transactionId: transaction.id,
      organizationId,
      moduleId,
      status: 'success',
      deployed_entities: [],
      deployment_time_seconds: 0,
      errors: [],
      warnings: []
    };

    try {
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
        deploymentResult.errors?.push(`Failed to create deployed module entity: ${deployError.message}`);
        throw deployError;
      }

      deploymentResult.deployed_entities.push({
        entity_type: 'deployed_erp_module',
        entity_code: deployedModule.entity_code,
        entity_name: deployedModule.entity_name
      });

      // Copy module configuration to deployed instance
      const deployedModuleConfig = Object.entries(moduleConfig).map(([field_name, field_value]) => ({
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
          field_value: moduleId,
          field_type: 'text'
        }
      );

      const { error: configError } = await supabase
        .from('core_dynamic_data')
        .insert(deployedModuleConfig);

      if (configError) {
        deploymentResult.warnings?.push(`Failed to copy module configuration: ${configError.message}`);
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
          line_order: 1,
          line_data: {
            module_code: module.entity_code,
            deployment_status: 'completed'
          }
        });

      if (lineError) {
        deploymentResult.warnings?.push(`Failed to create transaction line: ${lineError.message}`);
      }

      // Setup Chart of Accounts if requested
      if (deploymentOptions?.setupChartOfAccounts && moduleConfig.coa_accounts) {
        try {
          const coaAccounts = await setupModuleChartOfAccounts(
            supabase,
            organizationId,
            module,
            moduleConfig
          );
          deploymentResult.created_accounts = coaAccounts;
        } catch (coaError) {
          deploymentResult.warnings?.push(`COA setup failed: ${coaError}`);
        }
      }

      // Create default workflows if requested
      if (deploymentOptions?.createWorkflows && moduleConfig.workflow_steps) {
        try {
          const workflows = await createModuleWorkflows(
            supabase,
            organizationId,
            module,
            moduleConfig
          );
          deploymentResult.created_workflows = workflows;
        } catch (workflowError) {
          deploymentResult.warnings?.push(`Workflow creation failed: ${workflowError}`);
        }
      }

      // Update transaction status to completed
      const { error: updateError } = await supabase
        .from('universal_transactions')
        .update({
          transaction_status: 'completed',
          posted_at: new Date().toISOString(),
          transaction_data: {
            ...transaction.transaction_data,
            end_time: new Date().toISOString(),
            deployment_result: {
              status: 'success',
              entities_created: deploymentResult.deployed_entities.length,
              accounts_created: deploymentResult.created_accounts?.length || 0,
              workflows_created: deploymentResult.created_workflows?.length || 0
            }
          }
        })
        .eq('id', transaction.id)
        .eq('organization_id', organizationId); // SACRED: Double-check org

      if (updateError) {
        deploymentResult.warnings?.push(`Failed to update transaction status: ${updateError.message}`);
      }

    } catch (deploymentError) {
      console.error('❌ Deployment error:', deploymentError);
      deploymentResult.status = 'failed';
      deploymentResult.errors?.push(
        deploymentError instanceof Error ? deploymentError.message : 'Unknown deployment error'
      );
      
      // Update transaction status to failed
      await supabase
        .from('universal_transactions')
        .update({
          transaction_status: 'failed',
          transaction_data: {
            ...transaction.transaction_data,
            end_time: new Date().toISOString(),
            error: deploymentResult.errors[0]
          }
        })
        .eq('id', transaction.id)
        .eq('organization_id', organizationId); // SACRED: Double-check org
    }

    // Calculate deployment time
    deploymentResult.deployment_time_seconds = Math.round((Date.now() - startTime) / 1000);

    console.log(`${deploymentResult.status === 'success' ? '✅' : '❌'} Module deployment ${deploymentResult.status}:`, 
      deploymentResult.deployment_time_seconds, 'seconds');

    return NextResponse.json({
      success: deploymentResult.status === 'success',
      data: deploymentResult,
      message: deploymentResult.status === 'success' 
        ? 'Module deployed successfully' 
        : 'Module deployment failed'
    }, { 
      status: deploymentResult.status === 'success' ? 201 : 500 
    });

  } catch (error) {
    console.error('❌ Module deployment error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Module deployment failed' 
      },
      { status: 500 }
    );
  }
}

// Helper function to setup Chart of Accounts for module
async function setupModuleChartOfAccounts(
  supabase: any, 
  organizationId: string, 
  module: any, 
  moduleConfig: Record<string, any>
): Promise<Array<{ account_code: string; account_name: string }>> {
  const accounts = [];
  
  // Module-specific account patterns
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
        account_name: account.name
      });

    } catch (error) {
      console.error('Error creating account:', account.code, error);
    }
  }

  return accounts;
}

// Helper function to create module workflows
async function createModuleWorkflows(
  supabase: any,
  organizationId: string,
  module: any,
  moduleConfig: Record<string, any>
): Promise<Array<{ workflow_code: string; workflow_name: string }>> {
  const workflows = [];
  
  // Module-specific workflow patterns
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
        workflow_name: workflow.name
      });

    } catch (error) {
      console.error('Error creating workflow:', workflow.code, error);
    }
  }

  return workflows;
}