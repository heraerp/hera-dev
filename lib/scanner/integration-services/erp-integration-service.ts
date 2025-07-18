/**
 * HERA Universal ERP - Integration Service for ERP Module Connectivity
 * Universal connector for all HERA ERP modules with the mobile scanner ecosystem
 */

import { offlineDataManager } from '@/lib/offline/offline-data-manager';
import { offlineSyncManager } from '@/lib/offline/offline-sync-manager';

// ==================== TYPES ====================

export interface ERPModule {
  id: string;
  name: string;
  version: string;
  endpoints: Record<string, string>;
  capabilities: string[];
  status: 'active' | 'inactive' | 'maintenance';
}

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

// ==================== ERP INTEGRATION SERVICE ====================

class ERPIntegrationService {
  private modules: Map<string, ERPModule> = new Map();
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;

  constructor() {
    this.initializeModules();
    // Only setup network listeners in browser environment
    if (typeof window !== 'undefined') {
      this.setupNetworkListeners();
    }
  }

  // ==================== MODULE MANAGEMENT ====================

  private initializeModules(): void {
    const coreModules: ERPModule[] = [
      {
        id: 'finance',
        name: 'Financial Management',
        version: '1.0.0',
        endpoints: {
          invoices: '/api/finance/invoices',
          receipts: '/api/finance/receipts',
          chartOfAccounts: '/api/finance/chart-of-accounts',
          journalEntries: '/api/finance/journal-entries',
          vendors: '/api/finance/vendors'
        },
        capabilities: ['invoice_processing', 'receipt_processing', 'gl_posting', 'vendor_management'],
        status: 'active'
      },
      {
        id: 'inventory',
        name: 'Inventory Management',
        version: '1.0.0',
        endpoints: {
          products: '/api/inventory/products',
          transactions: '/api/inventory/transactions',
          locations: '/api/inventory/locations',
          barcodes: '/api/inventory/barcodes',
          stockLevels: '/api/inventory/stock-levels'
        },
        capabilities: ['barcode_scanning', 'stock_management', 'location_tracking', 'product_lookup'],
        status: 'active'
      },
      {
        id: 'assets',
        name: 'Asset Management',
        version: '1.0.0',
        endpoints: {
          assets: '/api/assets',
          maintenance: '/api/assets/maintenance',
          depreciation: '/api/assets/depreciation',
          locations: '/api/assets/locations',
          operations: '/api/assets/operations'
        },
        capabilities: ['asset_registration', 'maintenance_tracking', 'location_management', 'depreciation_calc'],
        status: 'active'
      },
      {
        id: 'procurement',
        name: 'Procurement Management',
        version: '1.0.0',
        endpoints: {
          suppliers: '/api/procurement/suppliers',
          requests: '/api/procurement/requests',
          orders: '/api/procurement/orders',
          receipts: '/api/procurement/receipts'
        },
        capabilities: ['supplier_management', 'purchase_orders', 'goods_receipt', 'invoice_matching'],
        status: 'active'
      },
      {
        id: 'crm',
        name: 'Customer Relationship Management',
        version: '1.0.0',
        endpoints: {
          contacts: '/api/crm/contacts',
          leads: '/api/crm/leads',
          opportunities: '/api/crm/opportunities',
          businessCards: '/api/crm/business-cards'
        },
        capabilities: ['contact_management', 'business_card_processing', 'lead_tracking'],
        status: 'active'
      },
      {
        id: 'analytics',
        name: 'Analytics & Reporting',
        version: '1.0.0',
        endpoints: {
          events: '/api/analytics/track',
          metrics: '/api/analytics/metrics',
          sessions: '/api/analytics/sessions',
          reports: '/api/analytics/reports'
        },
        capabilities: ['event_tracking', 'metrics_processing', 'session_management', 'report_generation'],
        status: 'active'
      }
    ];

    coreModules.forEach(module => {
      this.modules.set(module.id, module);
    });

    console.log('🔗 HERA: ERP Integration Service initialized with', this.modules.size, 'modules');
  }

  private setupNetworkListeners(): void {
    // Ensure we're in a browser environment
    if (typeof window === 'undefined') {
      console.log('🔗 HERA: Skipping network listeners (server environment)');
      return;
    }

    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 HERA: Network connection restored');
      this.processOfflineQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📱 HERA: Operating in offline mode');
    });
    
    console.log('🔗 HERA: Network listeners setup complete');
  }

  // ==================== SCANNER DATA PROCESSING ====================

  async processScannerData(scannerData: ScannerData): Promise<IntegrationResult[]> {
    console.log('📊 HERA: Processing scanner data:', scannerData.type);

    const results: IntegrationResult[] = [];

    try {
      switch (scannerData.type) {
        case 'invoice':
          results.push(...await this.processInvoice(scannerData));
          break;
        case 'receipt':
          results.push(...await this.processReceipt(scannerData));
          break;
        case 'barcode':
          results.push(...await this.processBarcode(scannerData));
          break;
        case 'asset':
          results.push(...await this.processAsset(scannerData));
          break;
        case 'business_card':
          results.push(...await this.processBusinessCard(scannerData));
          break;
        default:
          throw new Error(`Unsupported scanner data type: ${scannerData.type}`);
      }

      return results;
    } catch (error) {
      console.error('❌ HERA: Scanner data processing failed:', error);
      return [{
        success: false,
        error: error instanceof Error ? error.message : 'Processing failed',
        module: 'integration_service',
        operation: 'process_scanner_data',
        timestamp: new Date().toISOString()
      }];
    }
  }

  // ==================== INVOICE PROCESSING ====================

  private async processInvoice(scannerData: ScannerData): Promise<IntegrationResult[]> {
    const results: IntegrationResult[] = [];
    const invoiceData = scannerData.data;

    // Finance module - Create vendor invoice
    results.push(await this.executeModuleOperation('finance', 'invoices', 'POST', {
      ...invoiceData,
      scan_metadata: scannerData.metadata,
      status: 'pending_approval'
    }));

    // Procurement module - Match with purchase orders if applicable
    if (invoiceData.reference || invoiceData.po_number) {
      results.push(await this.executeModuleOperation('procurement', 'orders', 'PATCH', {
        po_number: invoiceData.po_number || invoiceData.reference,
        invoice_data: invoiceData,
        operation: 'match_invoice'
      }));
    }

    // Finance module - Create pending journal entries
    results.push(await this.executeModuleOperation('finance', 'journalEntries', 'POST', {
      source: 'invoice_scan',
      invoice_id: invoiceData.invoice_number,
      entries: this.generateJournalEntries(invoiceData),
      status: 'pending',
      scan_metadata: scannerData.metadata
    }));

    return results.filter(result => result !== null) as IntegrationResult[];
  }

  // ==================== RECEIPT PROCESSING ====================

  private async processReceipt(scannerData: ScannerData): Promise<IntegrationResult[]> {
    const results: IntegrationResult[] = [];
    const receiptData = scannerData.data;

    // Finance module - Create expense entry
    results.push(await this.executeModuleOperation('finance', 'receipts', 'POST', {
      ...receiptData,
      scan_metadata: scannerData.metadata,
      status: 'pending_approval',
      employee_id: scannerData.metadata.employee_id
    }));

    // CRM module - Update merchant/vendor information
    if (receiptData.merchant) {
      results.push(await this.executeModuleOperation('crm', 'contacts', 'POST', {
        name: receiptData.merchant.name,
        type: 'vendor',
        address: receiptData.merchant.address,
        phone: receiptData.merchant.phone,
        source: 'receipt_scan'
      }));
    }

    // Finance module - Create expense journal entry
    results.push(await this.executeModuleOperation('finance', 'journalEntries', 'POST', {
      source: 'receipt_scan',
      receipt_id: receiptData.receipt_id,
      entries: this.generateExpenseJournalEntries(receiptData),
      status: 'pending',
      scan_metadata: scannerData.metadata
    }));

    return results.filter(result => result !== null) as IntegrationResult[];
  }

  // ==================== BARCODE PROCESSING ====================

  private async processBarcode(scannerData: ScannerData): Promise<IntegrationResult[]> {
    const results: IntegrationResult[] = [];
    const barcodeData = scannerData.data;

    // Inventory module - Product lookup
    results.push(await this.executeModuleOperation('inventory', 'products', 'GET', {
      barcode: barcodeData.barcode,
      include_stock: true
    }));

    // Inventory module - Record transaction if operation specified
    if (barcodeData.operation && barcodeData.quantity) {
      results.push(await this.executeModuleOperation('inventory', 'transactions', 'POST', {
        product_id: barcodeData.product_id,
        operation_type: barcodeData.operation,
        quantity: barcodeData.quantity,
        location_id: barcodeData.location_id,
        scan_metadata: scannerData.metadata,
        employee_id: scannerData.metadata.employee_id
      }));
    }

    return results.filter(result => result !== null) as IntegrationResult[];
  }

  // ==================== ASSET PROCESSING ====================

  private async processAsset(scannerData: ScannerData): Promise<IntegrationResult[]> {
    const results: IntegrationResult[] = [];
    const assetData = scannerData.data;

    // Assets module - Register or update asset
    const operation = assetData.asset_id ? 'PATCH' : 'POST';
    const endpoint = assetData.asset_id ? `assets/${assetData.asset_id}` : 'assets';
    
    results.push(await this.executeModuleOperation('assets', endpoint, operation, {
      ...assetData,
      scan_metadata: scannerData.metadata,
      last_scanned: scannerData.metadata.scan_timestamp,
      scanned_by: scannerData.metadata.employee_id
    }));

    // Assets module - Record operation
    results.push(await this.executeModuleOperation('assets', 'operations', 'POST', {
      asset_id: assetData.asset_id || assetData.asset_number,
      operation_type: assetData.operation_type || 'scan',
      notes: assetData.notes,
      photos: assetData.photos,
      scan_metadata: scannerData.metadata,
      employee_id: scannerData.metadata.employee_id
    }));

    // Finance module - Update depreciation if financial data provided
    if (assetData.financial) {
      results.push(await this.executeModuleOperation('assets', 'depreciation', 'POST', {
        asset_id: assetData.asset_id || assetData.asset_number,
        financial_data: assetData.financial,
        effective_date: new Date().toISOString()
      }));
    }

    return results.filter(result => result !== null) as IntegrationResult[];
  }

  // ==================== BUSINESS CARD PROCESSING ====================

  private async processBusinessCard(scannerData: ScannerData): Promise<IntegrationResult[]> {
    const results: IntegrationResult[] = [];
    const cardData = scannerData.data;

    // CRM module - Create or update contact
    results.push(await this.executeModuleOperation('crm', 'contacts', 'POST', {
      ...cardData.contact,
      source: 'business_card_scan',
      scan_metadata: scannerData.metadata,
      card_image: cardData.card_image
    }));

    // CRM module - Create lead if applicable
    if (cardData.create_lead) {
      results.push(await this.executeModuleOperation('crm', 'leads', 'POST', {
        contact_id: cardData.contact.id,
        source: 'business_card_scan',
        status: 'new',
        scan_metadata: scannerData.metadata
      }));
    }

    return results.filter(result => result !== null) as IntegrationResult[];
  }

  // ==================== MODULE OPERATIONS ====================

  private async executeModuleOperation(
    moduleId: string,
    endpoint: string,
    method: string,
    data?: any
  ): Promise<IntegrationResult | null> {
    const module = this.modules.get(moduleId);
    if (!module) {
      console.error(`❌ HERA: Module ${moduleId} not found`);
      return null;
    }

    const operation = `${method} ${endpoint}`;
    
    try {
      if (this.isOnline) {
        // Online operation
        const result = await this.performAPICall(module, endpoint, method, data);
        return {
          success: true,
          data: result,
          module: moduleId,
          operation,
          timestamp: new Date().toISOString()
        };
      } else {
        // Offline operation - queue for later
        await this.queueOfflineOperation(moduleId, endpoint, method, data);
        return {
          success: true,
          module: moduleId,
          operation,
          timestamp: new Date().toISOString(),
          offline_queued: true
        };
      }
    } catch (error) {
      console.error(`❌ HERA: Module operation failed for ${moduleId}:`, error);
      
      // Queue for retry if network error
      if (!this.isOnline || this.isNetworkError(error)) {
        await this.queueOfflineOperation(moduleId, endpoint, method, data);
        return {
          success: false,
          error: 'Queued for offline processing',
          module: moduleId,
          operation,
          timestamp: new Date().toISOString(),
          offline_queued: true
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Operation failed',
        module: moduleId,
        operation,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async performAPICall(
    module: ERPModule,
    endpoint: string,
    method: string,
    data?: any
  ): Promise<any> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const fullEndpoint = module.endpoints[endpoint] || `/api/${module.id}/${endpoint}`;
    const url = `${baseUrl}${fullEndpoint}`;

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Module-ID': module.id,
        'X-Module-Version': module.version,
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  // ==================== OFFLINE SUPPORT ====================

  private async queueOfflineOperation(
    moduleId: string,
    endpoint: string,
    method: string,
    data?: any
  ): Promise<void> {
    const operation = {
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      moduleId,
      endpoint,
      method,
      data,
      timestamp: new Date().toISOString(),
      retries: 0,
      priority: this.getOperationPriority(moduleId, endpoint)
    };

    await offlineDataManager.storeData('offline_operations', operation.id, operation);
    console.log('📱 HERA: Operation queued for offline processing:', operation.id);
  }

  private async processOfflineQueue(): Promise<void> {
    console.log('🔄 HERA: Processing offline operation queue...');
    
    try {
      const queuedOps = await offlineDataManager.getAllData('offline_operations');
      
      for (const [id, operation] of Object.entries(queuedOps)) {
        try {
          const op = operation as any;
          await this.executeModuleOperation(op.moduleId, op.endpoint, op.method, op.data);
          await offlineDataManager.removeData('offline_operations', id);
          console.log('✅ HERA: Offline operation processed:', id);
        } catch (error) {
          console.error('❌ HERA: Failed to process offline operation:', id, error);
          // Increment retry count and requeue if under limit
          const op = operation as any;
          if (op.retries < 3) {
            op.retries++;
            await offlineDataManager.storeData('offline_operations', id, op);
          } else {
            // Max retries reached, move to failed queue
            await offlineDataManager.removeData('offline_operations', id);
            await offlineDataManager.storeData('failed_operations', id, op);
          }
        }
      }
    } catch (error) {
      console.error('❌ HERA: Failed to process offline queue:', error);
    }
  }

  // ==================== UTILITY METHODS ====================

  private generateJournalEntries(invoiceData: any): any[] {
    return [
      {
        account: 'Accounts Payable',
        debit: 0,
        credit: invoiceData.amount.total,
        description: `Invoice ${invoiceData.invoice_number} - ${invoiceData.vendor.vendor_name}`
      },
      {
        account: 'Expense Account', // Would be determined by AI or user selection
        debit: invoiceData.amount.subtotal,
        credit: 0,
        description: `Invoice ${invoiceData.invoice_number} - ${invoiceData.vendor.vendor_name}`
      },
      {
        account: 'Tax Payable',
        debit: invoiceData.amount.tax || 0,
        credit: 0,
        description: `Tax on Invoice ${invoiceData.invoice_number}`
      }
    ];
  }

  private generateExpenseJournalEntries(receiptData: any): any[] {
    return [
      {
        account: 'Expense Account',
        debit: receiptData.transaction.amount,
        credit: 0,
        description: `Expense - ${receiptData.merchant.name}`
      },
      {
        account: 'Employee Reimbursements',
        debit: 0,
        credit: receiptData.transaction.amount,
        description: `Reimbursement for ${receiptData.employee_id}`
      }
    ];
  }

  private getOperationPriority(moduleId: string, endpoint: string): number {
    // Higher priority for critical operations
    if (moduleId === 'finance' && endpoint.includes('journalEntries')) return 1;
    if (moduleId === 'inventory' && endpoint.includes('transactions')) return 2;
    return 3;
  }

  private getAuthToken(): string {
    // Implementation would depend on your auth system
    return localStorage.getItem('auth_token') || '';
  }

  private isNetworkError(error: any): boolean {
    return error.name === 'TypeError' || 
           error.message.includes('network') || 
           error.message.includes('fetch');
  }

  // ==================== PUBLIC API ====================

  getModule(moduleId: string): ERPModule | undefined {
    return this.modules.get(moduleId);
  }

  getAvailableModules(): ERPModule[] {
    return Array.from(this.modules.values());
  }

  getModuleCapabilities(moduleId: string): string[] {
    return this.modules.get(moduleId)?.capabilities || [];
  }

  isModuleAvailable(moduleId: string): boolean {
    const module = this.modules.get(moduleId);
    return module ? module.status === 'active' : false;
  }

  async testModuleConnection(moduleId: string): Promise<boolean> {
    try {
      const result = await this.executeModuleOperation(moduleId, 'health', 'GET');
      return result?.success || false;
    } catch {
      return false;
    }
  }

  async getOfflineQueueStatus(): Promise<{ pending: number; failed: number }> {
    const pending = await offlineDataManager.getAllData('offline_operations');
    const failed = await offlineDataManager.getAllData('failed_operations');
    return {
      pending: Object.keys(pending).length,
      failed: Object.keys(failed).length
    };
  }

  async clearFailedOperations(): Promise<void> {
    await offlineDataManager.clearStore('failed_operations');
  }
}

// ==================== SINGLETON EXPORT ====================

export const erpIntegrationService = new ERPIntegrationService();
export default erpIntegrationService;