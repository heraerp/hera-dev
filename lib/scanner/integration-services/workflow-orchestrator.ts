/**
 * HERA Universal ERP - Workflow Orchestrator
 * Orchestrates complex business workflows across multiple ERP modules
 */

// 🔧 AUTO-FIX NEEDED: Replace erpIntegrationService with UniversalCrudService
// This file uses backend service pattern. Replace with UniversalCrudService
import UniversalCrudService from '@/lib/services/universalCrudService'
import { offlineDataManager } from '@/lib/offline/offline-data-manager';

// ==================== TYPES ====================

export interface IntegrationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  module: string;
  operation: string;
  timestamp: string;
  offline_queued?: boolean;
}

export interface ScannerData {
  type: 'invoice' | 'receipt' | 'barcode' | 'asset' | 'business_card' | 'analytics_event';
  data: any;
  metadata: {
    confidence: number;
    scan_timestamp: string;
    employee_id: string;
    location?: { lat: number; lng: number };
    device_info?: any;
  };
}

export interface WorkflowStep {
  id: string;
  name: string;
  module: string;
  operation: string;
  depends_on?: string[];
  parallel?: boolean;
  required?: boolean;
  timeout?: number;
  retry_count?: number;
  compensation?: WorkflowStep; // For rollback
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  trigger_type: 'invoice' | 'receipt' | 'barcode' | 'asset' | 'business_card' | 'analytics_event';
  steps: WorkflowStep[];
  rollback_strategy: 'none' | 'compensate' | 'full_rollback';
  timeout_ms: number;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back';
  started_at: string;
  completed_at?: string;
  input_data: ScannerData;
  step_results: Record<string, IntegrationResult>;
  current_step?: string;
  error?: string;
  rollback_reason?: string;
}

export interface WorkflowContext {
  execution_id: string;
  input_data: ScannerData;
  step_results: Record<string, IntegrationResult>;
  shared_data: Record<string, any>;
  employee_id: string;
  tenant_id?: string;
}

// ==================== PREDEFINED WORKFLOWS ====================

const WORKFLOW_DEFINITIONS: WorkflowDefinition[] = [
  {
    id: 'invoice_to_payment',
    name: 'Invoice to Payment Workflow',
    description: 'Complete invoice processing from scan to payment',
    trigger_type: 'invoice',
    timeout_ms: 300000, // 5 minutes
    rollback_strategy: 'compensate',
    steps: [
      {
        id: 'create_vendor',
        name: 'Create/Update Vendor',
        module: 'procurement',
        operation: 'upsert_vendor',
        required: true
      },
      {
        id: 'process_invoice',
        name: 'Process Invoice',
        module: 'finance',
        operation: 'create_invoice',
        depends_on: ['create_vendor'],
        required: true
      },
      {
        id: 'match_po',
        name: 'Match Purchase Order',
        module: 'procurement',
        operation: 'match_purchase_order',
        depends_on: ['process_invoice'],
        required: false
      },
      {
        id: 'create_gl_entries',
        name: 'Create GL Entries',
        module: 'finance',
        operation: 'create_journal_entries',
        depends_on: ['process_invoice'],
        required: true
      },
      {
        id: 'trigger_approval',
        name: 'Trigger Approval Workflow',
        module: 'finance',
        operation: 'trigger_approval',
        depends_on: ['create_gl_entries'],
        required: true
      }
    ]
  },
  {
    id: 'receipt_to_reimbursement',
    name: 'Receipt to Reimbursement Workflow',
    description: 'Process expense receipts for employee reimbursement',
    trigger_type: 'receipt',
    timeout_ms: 180000, // 3 minutes
    rollback_strategy: 'compensate',
    steps: [
      {
        id: 'classify_expense',
        name: 'Classify Expense',
        module: 'finance',
        operation: 'classify_expense',
        required: true
      },
      {
        id: 'check_policy',
        name: 'Check Expense Policy',
        module: 'finance',
        operation: 'validate_expense_policy',
        depends_on: ['classify_expense'],
        required: true
      },
      {
        id: 'create_expense_entry',
        name: 'Create Expense Entry',
        module: 'finance',
        operation: 'create_expense',
        depends_on: ['check_policy'],
        required: true
      },
      {
        id: 'update_merchant',
        name: 'Update Merchant Info',
        module: 'crm',
        operation: 'upsert_merchant',
        parallel: true,
        required: false
      },
      {
        id: 'trigger_reimbursement',
        name: 'Trigger Reimbursement',
        module: 'finance',
        operation: 'create_reimbursement_request',
        depends_on: ['create_expense_entry'],
        required: true
      }
    ]
  },
  {
    id: 'inventory_transaction',
    name: 'Inventory Transaction Workflow',
    description: 'Process inventory movements with full traceability',
    trigger_type: 'barcode',
    timeout_ms: 120000, // 2 minutes
    rollback_strategy: 'full_rollback',
    steps: [
      {
        id: 'validate_product',
        name: 'Validate Product',
        module: 'inventory',
        operation: 'validate_product',
        required: true
      },
      {
        id: 'check_stock_levels',
        name: 'Check Stock Levels',
        module: 'inventory',
        operation: 'check_stock',
        depends_on: ['validate_product'],
        required: true
      },
      {
        id: 'create_transaction',
        name: 'Create Inventory Transaction',
        module: 'inventory',
        operation: 'create_transaction',
        depends_on: ['check_stock_levels'],
        required: true
      },
      {
        id: 'update_stock_levels',
        name: 'Update Stock Levels',
        module: 'inventory',
        operation: 'update_stock',
        depends_on: ['create_transaction'],
        required: true
      },
      {
        id: 'check_reorder_points',
        name: 'Check Reorder Points',
        module: 'inventory',
        operation: 'check_reorder',
        depends_on: ['update_stock_levels'],
        required: false
      },
      {
        id: 'create_gl_impact',
        name: 'Create GL Impact',
        module: 'finance',
        operation: 'create_inventory_gl',
        depends_on: ['update_stock_levels'],
        required: false
      }
    ]
  },
  {
    id: 'asset_lifecycle',
    name: 'Asset Lifecycle Management',
    description: 'Complete asset management from registration to disposal',
    trigger_type: 'asset',
    timeout_ms: 240000, // 4 minutes
    rollback_strategy: 'compensate',
    steps: [
      {
        id: 'register_asset',
        name: 'Register Asset',
        module: 'assets',
        operation: 'register_asset',
        required: true
      },
      {
        id: 'setup_depreciation',
        name: 'Setup Depreciation Schedule',
        module: 'assets',
        operation: 'setup_depreciation',
        depends_on: ['register_asset'],
        required: false
      },
      {
        id: 'create_asset_gl',
        name: 'Create Asset GL Entries',
        module: 'finance',
        operation: 'create_asset_gl',
        depends_on: ['register_asset'],
        required: true
      },
      {
        id: 'assign_location',
        name: 'Assign Location',
        module: 'assets',
        operation: 'assign_location',
        depends_on: ['register_asset'],
        required: true
      },
      {
        id: 'setup_maintenance',
        name: 'Setup Maintenance Schedule',
        module: 'assets',
        operation: 'setup_maintenance',
        depends_on: ['register_asset'],
        required: false
      }
    ]
  },
  {
    id: 'contact_to_opportunity',
    name: 'Contact to Opportunity Workflow',
    description: 'Convert business card scans to sales opportunities',
    trigger_type: 'business_card',
    timeout_ms: 90000, // 1.5 minutes
    rollback_strategy: 'compensate',
    steps: [
      {
        id: 'create_contact',
        name: 'Create Contact',
        module: 'crm',
        operation: 'create_contact',
        required: true
      },
      {
        id: 'deduplicate_contact',
        name: 'Deduplicate Contact',
        module: 'crm',
        operation: 'deduplicate_contact',
        depends_on: ['create_contact'],
        required: true
      },
      {
        id: 'enrich_contact',
        name: 'Enrich Contact Data',
        module: 'crm',
        operation: 'enrich_contact',
        depends_on: ['deduplicate_contact'],
        required: false
      },
      {
        id: 'create_lead',
        name: 'Create Lead',
        module: 'crm',
        operation: 'create_lead',
        depends_on: ['deduplicate_contact'],
        required: false
      },
      {
        id: 'trigger_follow_up',
        name: 'Trigger Follow-up',
        module: 'crm',
        operation: 'schedule_follow_up',
        depends_on: ['create_lead'],
        required: false
      }
    ]
  },
  {
    id: 'analytics_tracking',
    name: 'Analytics Event Processing',
    description: 'Process analytics events using universal schema pattern',
    trigger_type: 'analytics_event',
    timeout_ms: 60000, // 1 minute
    rollback_strategy: 'none', // Analytics events don't need rollback
    steps: [
      {
        id: 'store_analytics_event',
        name: 'Store Analytics Event',
        module: 'analytics',
        operation: 'store_event',
        required: false // Analytics should never break the app
      },
      {
        id: 'process_real_time_metrics',
        name: 'Process Real-time Metrics',
        module: 'analytics',
        operation: 'process_metrics',
        depends_on: ['store_analytics_event'],
        required: false
      },
      {
        id: 'update_session_tracking',
        name: 'Update Session Tracking',
        module: 'analytics',
        operation: 'update_session',
        parallel: true,
        required: false
      }
    ]
  }
];

// ==================== WORKFLOW ORCHESTRATOR ====================

class WorkflowOrchestrator {
  private activeExecutions: Map<string, WorkflowExecution> = new Map();
  private workflows: Map<string, WorkflowDefinition> = new Map();

  constructor() {
    this.initializeWorkflows();
  }

  // ==================== INITIALIZATION ====================

  private initializeWorkflows(): void {
    WORKFLOW_DEFINITIONS.forEach(workflow => {
      this.workflows.set(workflow.id, workflow);
    });

    console.log('🎭 HERA: Workflow Orchestrator initialized with', this.workflows.size, 'workflows');
  }

  // ==================== WORKFLOW EXECUTION ====================

  async executeWorkflow(
    workflowId: string,
    scannerData: ScannerData,
    context?: Partial<WorkflowContext>
  ): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    // Validate trigger type
    if (workflow.trigger_type !== scannerData.type) {
      throw new Error(`Workflow ${workflowId} cannot be triggered by ${scannerData.type} data`);
    }

    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const execution: WorkflowExecution = {
      id: executionId,
      workflow_id: workflowId,
      status: 'pending',
      started_at: new Date().toISOString(),
      input_data: scannerData,
      step_results: {},
      current_step: undefined
    };

    this.activeExecutions.set(executionId, execution);

    // Store execution for offline recovery
    await offlineDataManager.storeData('workflow_executions', executionId, execution);

    console.log(`🎭 HERA: Starting workflow execution: ${executionId} (${workflowId})`);

    try {
      execution.status = 'running';
      await this.executeSteps(execution, workflow, context);
      
      execution.status = 'completed';
      execution.completed_at = new Date().toISOString();
      
      console.log(`✅ HERA: Workflow execution completed: ${executionId}`);
    } catch (error) {
      console.error(`❌ HERA: Workflow execution failed: ${executionId}`, error);
      
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : 'Execution failed';
      execution.completed_at = new Date().toISOString();

      // Attempt rollback if strategy is defined
      if (workflow.rollback_strategy !== 'none') {
        await this.rollbackExecution(execution, workflow);
      }
    } finally {
      // Update stored execution
      await offlineDataManager.storeData('workflow_executions', executionId, execution);
      this.activeExecutions.delete(executionId);
    }

    return execution;
  }

  // ==================== STEP EXECUTION ====================

  private async executeSteps(
    execution: WorkflowExecution,
    workflow: WorkflowDefinition,
    context?: Partial<WorkflowContext>
  ): Promise<void> {
    const workflowContext: WorkflowContext = {
      execution_id: execution.id,
      input_data: execution.input_data,
      step_results: execution.step_results,
      shared_data: {},
      employee_id: execution.input_data.metadata.employee_id,
      ...context
    };

    // Build dependency graph
    const dependencyGraph = this.buildDependencyGraph(workflow.steps);
    const executed = new Set<string>();
    const executing = new Set<string>();

    // Execute steps based on dependencies
    while (executed.size < workflow.steps.length) {
      const readySteps = workflow.steps.filter(step => 
        !executed.has(step.id) && 
        !executing.has(step.id) &&
        this.areDependenciesSatisfied(step, executed)
      );

      if (readySteps.length === 0) {
        // Check if we have steps executing
        if (executing.size === 0) {
          throw new Error('Workflow deadlock detected - no steps can be executed');
        }
        // Wait for executing steps to complete
        await new Promise(resolve => setTimeout(resolve, 100));
        continue;
      }

      // Execute ready steps (parallel if marked as such)
      const parallelSteps = readySteps.filter(step => step.parallel);
      const sequentialSteps = readySteps.filter(step => !step.parallel);

      // Start parallel steps
      const parallelPromises = parallelSteps.map(step => 
        this.executeStep(step, execution, workflowContext, executing, executed)
      );

      // Execute sequential steps one by one
      for (const step of sequentialSteps) {
        await this.executeStep(step, execution, workflowContext, executing, executed);
      }

      // Wait for parallel steps to complete
      if (parallelPromises.length > 0) {
        await Promise.all(parallelPromises);
      }
    }
  }

  private async executeStep(
    step: WorkflowStep,
    execution: WorkflowExecution,
    context: WorkflowContext,
    executing: Set<string>,
    executed: Set<string>
  ): Promise<void> {
    executing.add(step.id);
    execution.current_step = step.id;

    console.log(`🎯 HERA: Executing step: ${step.id} (${step.name})`);

    try {
      const stepTimeout = step.timeout || 30000; // 30 seconds default
      const maxRetries = step.retry_count || 0;
      
      let result: IntegrationResult | null = null;
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          result = await this.executeStepWithTimeout(step, context, stepTimeout);
          break;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Step execution failed');
          console.warn(`⚠️ HERA: Step ${step.id} failed (attempt ${attempt + 1}/${maxRetries + 1}):`, lastError.message);
          
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
          }
        }
      }

      if (!result) {
        if (step.required) {
          throw lastError || new Error(`Required step ${step.id} failed`);
        } else {
          console.warn(`⚠️ HERA: Optional step ${step.id} failed, continuing workflow`);
          result = {
            success: false,
            error: lastError?.message || 'Step failed',
            module: step.module,
            operation: step.operation,
            timestamp: new Date().toISOString()
          };
        }
      }

      execution.step_results[step.id] = result;
      context.step_results[step.id] = result;

      // Update shared data if step provides it
      if (result.data && typeof result.data === 'object') {
        Object.assign(context.shared_data, result.data);
      }

      console.log(`✅ HERA: Step completed: ${step.id}`);
    } catch (error) {
      console.error(`❌ HERA: Step execution failed: ${step.id}`, error);
      throw error;
    } finally {
      executing.delete(step.id);
      executed.add(step.id);
      
      // Update execution record
      await offlineDataManager.storeData('workflow_executions', execution.id, execution);
    }
  }

  private async executeStepWithTimeout(
    step: WorkflowStep,
    context: WorkflowContext,
    timeout: number
  ): Promise<IntegrationResult> {
    return new Promise(async (resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Step ${step.id} timed out after ${timeout}ms`));
      }, timeout);

      try {
        // Prepare step data from context
        const stepData = this.prepareStepData(step, context);
        
        // Execute through UniversalCrudService (HERA Universal Architecture)
        const result = await this.executeUniversalOperation(step, stepData);

        if (!result) {
          throw new Error(`Module operation returned null for step ${step.id}`);
        }

        clearTimeout(timeoutId);
        resolve(result);
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  // ==================== UNIVERSAL CRUD OPERATIONS ====================

  private async executeUniversalOperation(
    step: WorkflowStep,
    stepData: any
  ): Promise<IntegrationResult> {
    try {
      console.log(`🔧 HERA: Executing universal operation: ${step.module}.${step.operation}`);
      
      // Map workflow operations to UniversalCrudService operations
      const entityData = this.mapStepDataToEntityData(step, stepData);
      
      let result: any;
      
      switch (step.operation) {
        case 'upsert_vendor':
        case 'create_contact':
        case 'register_asset':
        case 'create_invoice':
        case 'create_expense':
        case 'create_transaction':
          result = await UniversalCrudService.createEntity(entityData, this.getEntityTypeForOperation(step.operation));
          break;
        case 'store_event':
        case 'process_metrics':
        case 'update_session':
          result = await UniversalCrudService.createEntity(entityData, 'analytics_event');
          break;
        default:
          // For other operations, create a generic entity
          result = await UniversalCrudService.createEntity(entityData, 'workflow_step');
      }
      
      return {
        success: result.success,
        data: result.data,
        error: result.error,
        module: step.module,
        operation: step.operation,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`❌ HERA: Universal operation failed for ${step.module}.${step.operation}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Operation failed',
        module: step.module,
        operation: step.operation,
        timestamp: new Date().toISOString()
      };
    }
  }

  private mapStepDataToEntityData(step: WorkflowStep, stepData: any): any {
    // Map workflow step data to EntityData format
    const entityName = this.generateEntityName(step, stepData);
    
    return {
      name: entityName,
      organizationId: stepData.tenant_id || stepData.organization_id || null,
      fields: {
        operation: step.operation,
        module: step.module,
        step_id: step.id,
        step_name: step.name,
        ...stepData
      }
    };
  }

  private generateEntityName(step: WorkflowStep, stepData: any): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '');
    return `${step.module}_${step.operation}_${timestamp}`;
  }

  private getEntityTypeForOperation(operation: string): string {
    const operationMap: Record<string, string> = {
      'upsert_vendor': 'vendor',
      'create_contact': 'contact',
      'register_asset': 'asset',
      'create_invoice': 'invoice',
      'create_expense': 'expense',
      'create_transaction': 'inventory_transaction',
      'store_event': 'analytics_event',
      'process_metrics': 'analytics_metric',
      'update_session': 'analytics_session'
    };
    
    return operationMap[operation] || 'workflow_entity';
  }

  // ==================== ROLLBACK HANDLING ====================

  private async rollbackExecution(
    execution: WorkflowExecution,
    workflow: WorkflowDefinition
  ): Promise<void> {
    console.log(`🔄 HERA: Rolling back workflow execution: ${execution.id}`);
    
    execution.status = 'rolled_back';
    execution.rollback_reason = execution.error;

    if (workflow.rollback_strategy === 'full_rollback') {
      // Reverse all completed steps
      const completedSteps = workflow.steps.filter(step => 
        execution.step_results[step.id]?.success
      );

      for (const step of completedSteps.reverse()) {
        try {
          await this.rollbackStep(step, execution);
        } catch (error) {
          console.error(`❌ HERA: Failed to rollback step ${step.id}:`, error);
        }
      }
    } else if (workflow.rollback_strategy === 'compensate') {
      // Execute compensation steps
      const completedSteps = workflow.steps.filter(step => 
        execution.step_results[step.id]?.success && step.compensation
      );

      for (const step of completedSteps.reverse()) {
        if (step.compensation) {
          try {
            await this.executeCompensationStep(step.compensation, execution);
          } catch (error) {
            console.error(`❌ HERA: Failed to execute compensation for step ${step.id}:`, error);
          }
        }
      }
    }
  }

  private async rollbackStep(step: WorkflowStep, execution: WorkflowExecution): Promise<void> {
    // Implementation would depend on the specific step and module
    console.log(`🔄 HERA: Rolling back step: ${step.id}`);
    // This would call module-specific rollback operations
  }

  private async executeCompensationStep(
    compensationStep: WorkflowStep,
    execution: WorkflowExecution
  ): Promise<void> {
    console.log(`🔄 HERA: Executing compensation step: ${compensationStep.id}`);
    // Execute the compensation step
  }

  // ==================== UTILITY METHODS ====================

  private buildDependencyGraph(steps: WorkflowStep[]): Map<string, string[]> {
    const graph = new Map<string, string[]>();
    
    steps.forEach(step => {
      graph.set(step.id, step.depends_on || []);
    });

    return graph;
  }

  private areDependenciesSatisfied(step: WorkflowStep, executed: Set<string>): boolean {
    if (!step.depends_on || step.depends_on.length === 0) {
      return true;
    }

    return step.depends_on.every(dep => executed.has(dep));
  }

  private prepareStepData(step: WorkflowStep, context: WorkflowContext): any {
    // Prepare data specific to each step type
    switch (step.operation) {
      case 'upsert_vendor':
        return this.prepareVendorData(context);
      case 'create_invoice':
        return this.prepareInvoiceData(context);
      case 'create_expense':
        return this.prepareExpenseData(context);
      case 'create_transaction':
        return this.prepareInventoryData(context);
      case 'register_asset':
        return this.prepareAssetData(context);
      case 'create_contact':
        return this.prepareContactData(context);
      case 'store_event':
      case 'process_metrics':
      case 'update_session':
        return this.prepareAnalyticsData(context);
      default:
        return {
          input_data: context.input_data.data,
          shared_data: context.shared_data,
          metadata: context.input_data.metadata
        };
    }
  }

  private prepareVendorData(context: WorkflowContext): any {
    const invoiceData = context.input_data.data;
    return {
      name: invoiceData.vendor?.vendor_name,
      tax_id: invoiceData.vendor?.tax_id,
      address: invoiceData.vendor?.address,
      source: 'invoice_scan',
      metadata: context.input_data.metadata
    };
  }

  private prepareInvoiceData(context: WorkflowContext): any {
    return {
      ...context.input_data.data,
      vendor_id: context.step_results.create_vendor?.data?.id,
      metadata: context.input_data.metadata
    };
  }

  private prepareExpenseData(context: WorkflowContext): any {
    return {
      ...context.input_data.data,
      employee_id: context.employee_id,
      metadata: context.input_data.metadata
    };
  }

  private prepareInventoryData(context: WorkflowContext): any {
    return {
      ...context.input_data.data,
      employee_id: context.employee_id,
      metadata: context.input_data.metadata
    };
  }

  private prepareAssetData(context: WorkflowContext): any {
    return {
      ...context.input_data.data,
      registered_by: context.employee_id,
      metadata: context.input_data.metadata
    };
  }

  private prepareContactData(context: WorkflowContext): any {
    return {
      ...context.input_data.data.contact,
      source: 'business_card_scan',
      metadata: context.input_data.metadata
    };
  }

  private prepareAnalyticsData(context: WorkflowContext): any {
    // Convert analytics event to universal schema format using EntityData pattern
    const analyticsData = context.input_data.data.content || context.input_data.data;
    return {
      event_type: analyticsData.event_type || 'workflow_analytics',
      session_id: analyticsData.session_id || context.execution_id,
      user_id: analyticsData.user_id || context.employee_id,
      properties: analyticsData.properties || {},
      timestamp: analyticsData.timestamp || new Date().toISOString(),
      organization_id: context.tenant_id || null,
      tenant_id: context.tenant_id || null, // Ensure backward compatibility
      metadata: {
        ...context.input_data.metadata,
        processing_type: 'workflow_analytics'
      }
    };
  }

  // ==================== PUBLIC API ====================

  getAvailableWorkflows(): WorkflowDefinition[] {
    return Array.from(this.workflows.values());
  }

  getWorkflowsForTrigger(triggerType: string): WorkflowDefinition[] {
    return Array.from(this.workflows.values()).filter(
      workflow => workflow.trigger_type === triggerType
    );
  }

  getWorkflow(workflowId: string): WorkflowDefinition | undefined {
    return this.workflows.get(workflowId);
  }

  getExecutionStatus(executionId: string): WorkflowExecution | undefined {
    return this.activeExecutions.get(executionId);
  }

  async getStoredExecution(executionId: string): Promise<WorkflowExecution | null> {
    try {
      return await offlineDataManager.getData('workflow_executions', executionId) as WorkflowExecution;
    } catch {
      return null;
    }
  }

  registerCustomWorkflow(workflow: WorkflowDefinition): void {
    this.workflows.set(workflow.id, workflow);
    console.log(`📝 HERA: Custom workflow registered: ${workflow.id}`);
  }

  async pauseExecution(executionId: string): Promise<boolean> {
    const execution = this.activeExecutions.get(executionId);
    if (execution && execution.status === 'running') {
      // Implementation for pausing workflow
      return true;
    }
    return false;
  }

  async resumeExecution(executionId: string): Promise<boolean> {
    // Implementation for resuming paused workflow
    return false;
  }

  async cancelExecution(executionId: string, reason?: string): Promise<boolean> {
    const execution = this.activeExecutions.get(executionId);
    if (execution) {
      execution.status = 'failed';
      execution.error = reason || 'Cancelled by user';
      execution.completed_at = new Date().toISOString();
      
      // Clean up
      this.activeExecutions.delete(executionId);
      await offlineDataManager.storeData('workflow_executions', executionId, execution);
      
      return true;
    }
    return false;
  }
}

// ==================== SINGLETON EXPORT ====================

export const workflowOrchestrator = new WorkflowOrchestrator();
export default workflowOrchestrator;