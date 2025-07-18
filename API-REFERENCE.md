# 📱 HERA Mobile Scanner API Reference

Quick reference guide for integrating the HERA Mobile Scanner Ecosystem into your applications.

---

## 🚀 Quick Start

### 1. Basic Setup

```typescript
import { OfflineProvider } from '@/components/providers/offline-provider';
import { UniversalCameraInterface } from '@/components/scanner/universal-camera-interface';
import { useOfflineOperations } from '@/components/providers/offline-provider';

// Wrap your app
<OfflineProvider>
  <YourApp />
</OfflineProvider>
```

### 2. Simple Document Scanning

```typescript
function DocumentScanner() {
  const { processInvoice } = useOfflineOperations();
  
  const handleInvoiceCapture = async (photo) => {
    const invoice = await processInvoice(photo);
    console.log('Invoice processed:', invoice);
  };
  
  return (
    <UniversalCameraInterface
      mode="invoice"
      onCapture={handleInvoiceCapture}
      autoProcess={true}
    />
  );
}
```

---

## 🎯 Core Components

### UniversalCameraInterface

```typescript
interface UniversalCameraInterfaceProps {
  mode: 'document' | 'barcode' | 'receipt' | 'invoice' | 'business_card';
  onCapture?: (photo: CapturedPhoto) => void;
  onProcessed?: (result: any) => void;
  onError?: (error: Error) => void;
  autoProcess?: boolean; // Default: true
  showPreview?: boolean; // Default: true
  allowModeSwitch?: boolean; // Default: true
}

// Usage
<UniversalCameraInterface
  mode="invoice"
  onCapture={handleCapture}
  onProcessed={handleProcessed}
  autoProcess={true}
/>
```

### DocumentScanner

```typescript
interface DocumentScannerProps {
  documentType?: DocumentType;
  onDocumentProcessed?: (result: ProcessingResult) => void;
  onError?: (error: Error) => void;
  showProcessingSteps?: boolean; // Default: true
  allowEditing?: boolean; // Default: true
  workflowMode?: 'manual' | 'automatic' | 'assisted'; // Default: 'automatic'
}

// Usage
<DocumentScanner
  documentType="invoice"
  onDocumentProcessed={handleInvoiceProcessed}
  showProcessingSteps={true}
  allowEditing={true}
/>
```

### BarcodeScanner

```typescript
interface BarcodeScannerProps {
  mode: 'lookup' | 'receiving' | 'picking' | 'counting' | 'audit';
  onScanComplete?: (result: ScanResult) => void;
  onInventoryUpdate?: (update: InventoryUpdate) => void;
  onError?: (error: Error) => void;
  enableBatchMode?: boolean; // Default: true
  enableInventoryUpdates?: boolean; // Default: true
}

// Usage
<BarcodeScanner
  mode="receiving"
  onScanComplete={handleScanComplete}
  onInventoryUpdate={handleInventoryUpdate}
  enableBatchMode={true}
/>
```

---

## 🎣 Hooks & Context

### useOfflineOperations

```typescript
const {
  processDocument,
  processInvoice,
  processReceipt,
  processBusinessCard,
  updateInventory,
  lookupProduct
} = useOfflineOperations();

// Process invoice
const invoice = await processInvoice(photo);

// Update inventory
const operationId = await updateInventory(productId, quantity, 'add');

// Lookup product by barcode
const product = await lookupProduct(barcode);
```

### useOfflineStatus

```typescript
const {
  isOnline,
  isOfflineReady,
  canWorkOffline,
  hasPendingSync,
  hasFailedSync,
  lastSyncTime,
  nextSyncTime
} = useOfflineStatus();

// Check if can work offline
if (canWorkOffline) {
  // Enable offline features
}
```

### useOfflineSync

```typescript
const {
  status,
  sync,
  retry,
  pendingCount,
  failedCount,
  onSyncComplete,
  onGoOffline,
  onGoOnline
} = useOfflineSync();

// Manual sync
await sync();

// Retry failed operations
await retry();

// Listen for sync events
const unsubscribe = onSyncComplete((result) => {
  console.log('Sync completed:', result);
});
```

---

## 🔧 Core Services

### Universal Camera Service

```typescript
import { universalCameraService } from '@/lib/camera/universal-camera-service';

// Initialize camera
const stream = await universalCameraService.initializeCamera({
  facingMode: 'environment',
  resolution: 'high',
  scanMode: 'invoice'
});

// Capture photo
const photo = await universalCameraService.capturePhoto('auto_enhance');

// Detect document type
const docType = await universalCameraService.detectDocumentType(photo);

// Process business document
const processed = await universalCameraService.processBusinessDocument(photo);
```

### AI Processing Pipeline

```typescript
import { aiProcessingPipeline } from '@/lib/ai/document-processing-pipeline';

// Classify document
const classification = await aiProcessingPipeline.classifyDocument(photo);

// Extract invoice data
const invoiceData = await aiProcessingPipeline.extractInvoiceData(photo);

// Extract receipt data
const receiptData = await aiProcessingPipeline.extractReceiptData(photo);

// Categorize expense
const categorized = await aiProcessingPipeline.categorizeExpense(receiptData);
```

### Digital Accountant System

```typescript
import { digitalAccountantSystem } from '@/lib/scanner/digital-accountant-system';

// Process invoice
const invoiceResult = await digitalAccountantSystem.processInvoice(photo);

// Process receipt
const receiptResult = await digitalAccountantSystem.processReceipt(photo, employeeId);

// Process business card
const contactResult = await digitalAccountantSystem.processBusinessCard(photo);
```

### Barcode Scanning Engine

```typescript
import { barcodeScanningEngine } from '@/lib/scanner/barcode-scanning-engine';

// Scan barcode
const scanResult = await barcodeScanningEngine.scanBarcode(photo);

// Lookup product
const productLookup = await barcodeScanningEngine.lookupProduct(barcode);

// Update inventory
const inventoryUpdate = await barcodeScanningEngine.updateInventory(
  barcode, 
  quantity, 
  'add'
);

// Start batch session
const batchSession = await barcodeScanningEngine.startBatchScan('receiving');
```

---

## 💾 Offline Services

### Offline Sync Manager

```typescript
import { offlineSyncManager } from '@/lib/offline/offline-sync-manager';

// Add operation
const operationId = await offlineSyncManager.addOperation({
  type: 'process_document',
  entity: 'invoices',
  data: invoiceData,
  metadata: {
    priority: 'high',
    requiresNetwork: true
  },
  dependencies: []
});

// Trigger sync
const result = await offlineSyncManager.triggerSync();

// Get status
const status = offlineSyncManager.getStatus();
```

### Offline Storage Manager

```typescript
import { offlineStorageManager } from '@/lib/offline/offline-storage-manager';

// Store data
await offlineStorageManager.set('product_123', productData, {
  metadata: {
    entityType: 'product',
    priority: 'high'
  },
  tags: ['product', 'inventory']
});

// Get data
const product = await offlineStorageManager.get('product_123');

// Query data
const products = await offlineStorageManager.query({
  filters: { 'metadata.entityType': 'product' },
  tags: ['electronics'],
  limit: 50
});

// Store product
await offlineStorageManager.storeProduct(productData);

// Get product by barcode
const product = await offlineStorageManager.getProductByBarcode(barcode);
```

### Offline Processing Engine

```typescript
import { offlineProcessingEngine } from '@/lib/offline/offline-processing-engine';

// Process document offline
const job = await offlineProcessingEngine.processDocument(photo, 'invoice');

// Process invoice offline
const invoice = await offlineProcessingEngine.processInvoice(photo);

// Process receipt offline
const receipt = await offlineProcessingEngine.processReceipt(photo);

// Process business card offline
const contact = await offlineProcessingEngine.processBusinessCard(photo);
```

---

## 📊 Status Components

### OfflineStatusIndicator

```typescript
import { OfflineStatusIndicator } from '@/components/offline/offline-status-indicator';

<OfflineStatusIndicator
  position="top-right" // 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  showDetails={false}
  autoHide={true}
/>
```

### OfflineModeBanner

```typescript
import { OfflineModeBanner } from '@/components/offline/offline-status-indicator';

<OfflineModeBanner
  show={!isOnline && canWorkOffline}
  onDismiss={() => setDismissed(true)}
/>
```

### OfflineSyncProgress

```typescript
import { OfflineSyncProgress } from '@/components/offline/offline-status-indicator';

<OfflineSyncProgress
  show={syncInProgress}
  onComplete={() => setShowProgress(false)}
/>
```

---

## 🛠️ Configuration

### OfflineProvider Configuration

```typescript
<OfflineProvider
  enableAutoSync={true}
  syncInterval={30000} // 30 seconds
  maxCacheSize={200} // 200 MB
  enableOfflineProcessing={true}
>
  <App />
</OfflineProvider>
```

### Camera Configuration

```typescript
const cameraOptions = {
  facingMode: 'environment' | 'user',
  resolution: 'low' | 'medium' | 'high' | 'ultra',
  flashMode: 'auto' | 'on' | 'off',
  scanMode: 'document' | 'barcode' | 'receipt' | 'invoice',
  enableMLProcessing: boolean,
  enhancementMode: 'none' | 'auto_enhance' | 'document_enhance' | 'receipt_enhance'
};
```

### Sync Configuration

```typescript
const syncConfig = {
  maxStorageSize: 100, // MB
  syncInterval: 30000, // milliseconds
  retryAttempts: 3,
  conflictResolution: 'local_wins' | 'server_wins' | 'merge' | 'manual',
  enablePeriodicSync: boolean,
  enableBackgroundSync: boolean,
  batchSize: number
};
```

---

## 📝 Type Definitions

### Core Types

```typescript
// Captured photo interface
interface CapturedPhoto {
  id: string;
  dataUrl: string;
  blob: Blob;
  timestamp: number;
  metadata: PhotoMetadata;
  enhancement: EnhancementType;
  thumbnails: PhotoThumbnails;
}

// Document types
type DocumentType = 'invoice' | 'receipt' | 'business_card' | 'contract' | 'purchase_order';

// Processing result
interface ProcessingResult {
  document: ProcessedDocument;
  extractedData: InvoiceData | ReceiptData | any;
  confidence: number;
  validationResults: ValidationResult[];
  suggestedActions: SuggestedAction[];
  previewImage: string;
}

// Sync status
interface SyncStatus {
  isOnline: boolean;
  lastSyncTimestamp: number;
  pendingOperations: number;
  failedOperations: number;
  storageUsed: number;
  storageAvailable: number;
  syncInProgress: boolean;
  nextScheduledSync: number;
}
```

### Business Data Types

```typescript
// Invoice data
interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate?: string;
  vendor: VendorInfo;
  billTo: BillToInfo;
  lineItems: LineItem[];
  totals: InvoiceTotals;
  currency: string;
  paymentTerms?: string;
  notes?: string;
}

// Receipt data
interface ReceiptData {
  transactionDate: string;
  transactionTime?: string;
  merchant: MerchantInfo;
  items: ReceiptItem[];
  totals: ReceiptTotals;
  paymentMethod: string;
  receiptNumber?: string;
  category: string;
  tags: string[];
}

// Product data
interface ProductData {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  description: string;
  category: string;
  pricing: ProductPricing;
  inventory: InventoryData;
  images: ProductImage[];
  status: 'active' | 'inactive' | 'discontinued';
}
```

---

## ⚡ Performance Tips

### Optimization Guidelines

```typescript
// 1. Preload critical data
await offlineStorageManager.storeProduct(criticalProducts);

// 2. Use web workers for heavy processing
const worker = new Worker('/workers/document-processor.js');

// 3. Optimize image size for processing
const optimizedPhoto = await universalCameraService.capturePhoto('auto_enhance');

// 4. Batch operations when possible
const operations = await Promise.all([
  processInvoice(photo1),
  processInvoice(photo2),
  processInvoice(photo3)
]);

// 5. Monitor memory usage
const stats = offlineStorageManager.getStats();
if (stats.usedSize > maxSize) {
  await offlineStorageManager.clear('old-pattern-*');
}
```

### Error Handling

```typescript
try {
  const invoice = await processInvoiceOffline(photo);
} catch (error) {
  if (error.code === 'OFFLINE_PROCESSING_FAILED') {
    // Handle offline processing failure
    await fallbackToManualEntry(photo);
  } else if (error.code === 'INSUFFICIENT_STORAGE') {
    // Handle storage issues
    await offlineStorageManager.clear('cache-*');
    retry();
  }
}
```

---

## 🔍 Debugging

### Debug Utilities

```typescript
// Enable debug mode
localStorage.setItem('hera_debug', 'true');

// Monitor performance
console.log('Processing time:', performance.now() - startTime);

// Check storage stats
const stats = offlineStorageManager.getStats();
console.log('Storage usage:', stats);

// Monitor sync status
offlineSyncManager.on('operation-added', (op) => {
  console.log('Operation queued:', op.id);
});

// Track camera events
universalCameraService.on('photo-captured', (photo) => {
  console.log('Photo captured:', photo.metadata);
});
```

### Common Issues

```typescript
// Issue: Camera not initializing
// Solution: Check permissions
const hasPermission = await navigator.permissions.query({ name: 'camera' });

// Issue: Offline processing slow
// Solution: Check available memory
const memory = (performance as any).memory;
if (memory.usedJSHeapSize > threshold) {
  // Trigger cleanup
}

// Issue: Sync failing
// Solution: Check network and retry logic
const status = offlineSyncManager.getStatus();
if (status.failedOperations > 0) {
  await offlineSyncManager.triggerSync();
}
```

---

This API reference provides everything you need to integrate the HERA Mobile Scanner Ecosystem into your applications. For more detailed documentation, see the [complete technical documentation](./MOBILE-SCANNER-ECOSYSTEM.md).