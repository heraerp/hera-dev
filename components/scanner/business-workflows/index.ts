/**
 * HERA Universal ERP - Business Workflow Components Index
 * Export all business workflow components for the mobile scanner ecosystem
 */

export { InvoiceProcessingWorkflow } from './invoice-processing-workflow';
export { ReceiptExpenseWorkflow } from './receipt-expense-workflow';
export { InventoryScanningWorkflow } from './inventory-scanning-workflow';
export { AssetManagementWorkflow } from './asset-management-workflow';

// Workflow types and utilities
export type {
  InvoiceData,
  ReceiptData,
  Product,
  Asset,
  InventoryTransaction,
  AssetOperation
} from './invoice-processing-workflow';

// Re-export workflow component props for easier imports
export type { InvoiceProcessingWorkflowProps } from './invoice-processing-workflow';
export type { ReceiptExpenseWorkflowProps } from './receipt-expense-workflow';
export type { InventoryScanningWorkflowProps } from './inventory-scanning-workflow';
export type { AssetManagementWorkflowProps } from './asset-management-workflow';