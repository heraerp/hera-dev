/**
 * HERA Universal ERP - Integration Services Index
 * Export all integration services for the mobile scanner ecosystem
 */

// 🔧 AUTO-FIX NEEDED: Remove backend service exports, use UniversalCrudService
import UniversalCrudService from '@/lib/services/universalCrudService'

export { workflowOrchestrator } from './workflow-orchestrator';

// Types and interfaces

export type {
  WorkflowStep,
  WorkflowDefinition,
  WorkflowExecution,
  WorkflowContext,
  IntegrationResult,
  ScannerData
} from './workflow-orchestrator';

// Utility function to process scanner data with full workflow integration
export async function processWithWorkflow(
  scannerData: ScannerData,
  workflowId?: string,
  context?: Partial<WorkflowContext>
): Promise<WorkflowExecution> {
  const { workflowOrchestrator } = await import('./workflow-orchestrator');
  
  if (workflowId) {
    // Use specified workflow
    return await workflowOrchestrator.executeWorkflow(workflowId, scannerData, context);
  } else {
    // Auto-select workflow based on scanner data type
    const availableWorkflows = workflowOrchestrator.getWorkflowsForTrigger(scannerData.type);
    
    if (availableWorkflows.length > 0) {
      // Use the first available workflow (could be made smarter with AI selection)
      return await workflowOrchestrator.executeWorkflow(
        availableWorkflows[0].id, 
        scannerData, 
        context
      );
    } else {
      // Create a generic workflow execution using UniversalCrudService
      const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store the scanner data as an entity using UniversalCrudService
      const entityData = {
        name: `scanner_${scannerData.type}_${Date.now()}`,
        organizationId: context?.tenant_id || null,
        fields: {
          scanner_type: scannerData.type,
          scanner_data: scannerData.data,
          metadata: scannerData.metadata
        }
      };
      
      const result = await UniversalCrudService.createEntity(entityData, 'scanner_processing');
      
      return {
        id: executionId,
        workflow_id: 'fallback_processing',
        status: result.success ? 'completed' : 'failed',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        input_data: scannerData,
        step_results: {
          'store_scanner_data': {
            success: result.success,
            data: result.data,
            error: result.error,
            module: 'scanner',
            operation: 'store_data',
            timestamp: new Date().toISOString()
          }
        }
      };
    }
  }
}

// Utility function to get recommended workflows for scanner data
export function getRecommendedWorkflows(scannerData: ScannerData): WorkflowDefinition[] {
  const { workflowOrchestrator } = require('./workflow-orchestrator');
  return workflowOrchestrator.getWorkflowsForTrigger(scannerData.type);
}

// Export the main workflow orchestrator as default (replaces backend service)
export { workflowOrchestrator as default } from './workflow-orchestrator';