/**
 * HERA Universal ERP - Barcode & QR Scanning Engine
 * Revolutionary inventory management through mobile scanning
 * Complete product identification and real-time inventory updates
 */

import { EventEmitter } from 'events';
import { universalCameraService, CapturedPhoto, BarcodeResult, BarcodeFormat } from '@/lib/camera/universal-camera-service';
import { supabase } from '@/lib/supabase/client';

// ==================== BARCODE SCANNING INTERFACES ====================

export interface BarcodeScanningConfig {
  enableBarcodeFormats: BarcodeFormat[];
  enableQRCode: boolean;
  enableDataMatrix: boolean;
  enablePDF417: boolean;
  confidenceThreshold: number;
  maxScanAttempts: number;
  scanTimeout: number;
  enableBatchScanning: boolean;
  enableLocationTracking: boolean;
  enableRealTimeInventory: boolean;
  enablePriceVerification: boolean;
}

export interface ProductData {
  id: string;
  sku: string;
  barcode: string;
  upc?: string;
  ean?: string;
  name: string;
  description: string;
  brand: string;
  category: string;
  subcategory?: string;
  unit_of_measure: string;
  weight?: number;
  dimensions?: ProductDimensions;
  pricing: ProductPricing;
  inventory: InventoryData;
  supplier: SupplierData;
  attributes: ProductAttribute[];
  images: ProductImage[];
  compliance: ComplianceInfo;
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive' | 'discontinued';
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in' | 'mm';
  volume?: number;
}

export interface ProductPricing {
  cost_price: number;
  selling_price: number;
  msrp?: number;
  margin_percentage: number;
  currency: string;
  price_tiers?: PriceTier[];
  last_price_update: string;
}

export interface PriceTier {
  tier_name: string;
  min_quantity: number;
  price: number;
  discount_percentage: number;
}

export interface InventoryData {
  current_stock: number;
  available_stock: number;
  reserved_stock: number;
  reorder_point: number;
  reorder_quantity: number;
  max_stock_level: number;
  locations: StockLocation[];
  last_counted: string;
  last_movement: string;
  abc_classification: 'A' | 'B' | 'C';
  velocity: 'fast' | 'medium' | 'slow';
  lead_time_days: number;
}

export interface StockLocation {
  location_id: string;
  location_name: string;
  warehouse_id: string;
  zone: string;
  aisle?: string;
  shelf?: string;
  bin?: string;
  quantity: number;
  reserved_quantity: number;
  last_updated: string;
}

export interface SupplierData {
  supplier_id: string;
  supplier_name: string;
  supplier_sku?: string;
  lead_time_days: number;
  minimum_order_quantity: number;
  packaging_quantity: number;
  last_purchase_price: number;
  last_purchase_date: string;
  preferred_supplier: boolean;
}

export interface ProductAttribute {
  attribute_name: string;
  attribute_value: string;
  attribute_type: 'text' | 'number' | 'boolean' | 'date' | 'list';
  is_searchable: boolean;
  is_filterable: boolean;
}

export interface ProductImage {
  image_id: string;
  image_url: string;
  thumbnail_url: string;
  image_type: 'primary' | 'secondary' | 'detail' | 'packaging';
  sort_order: number;
  alt_text?: string;
}

export interface ComplianceInfo {
  requires_serial_tracking: boolean;
  requires_lot_tracking: boolean;
  requires_expiry_tracking: boolean;
  regulatory_approvals: string[];
  safety_data_sheet_url?: string;
  material_safety_notes?: string;
}

export interface ScanResult {
  scan_id: string;
  barcode: string;
  format: BarcodeFormat;
  confidence: number;
  scan_timestamp: string;
  location?: LocationData;
  product?: ProductData;
  quantity_scanned?: number;
  scan_context: ScanContext;
  processing_time: number;
  image_id?: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  warehouse_id?: string;
  zone?: string;
  aisle?: string;
  shelf?: string;
}

export interface ScanContext {
  operation_type: 'receiving' | 'picking' | 'counting' | 'shipping' | 'lookup' | 'audit';
  user_id: string;
  session_id: string;
  batch_id?: string;
  work_order_id?: string;
  transaction_reference?: string;
  notes?: string;
}

// ==================== BATCH SCANNING ====================

export interface BatchSession {
  session_id: string;
  session_type: 'receiving' | 'picking' | 'counting' | 'cycle_count' | 'physical_inventory';
  started_by: string;
  start_time: string;
  end_time?: string;
  expected_items?: BatchItem[];
  scanned_items: BatchItem[];
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  location: LocationData;
  metadata: BatchMetadata;
}

export interface BatchItem {
  item_id: string;
  barcode: string;
  product: ProductData;
  expected_quantity?: number;
  scanned_quantity: number;
  variance?: number;
  scan_timestamp: string;
  location?: LocationData;
  serial_numbers?: string[];
  lot_numbers?: string[];
  expiry_dates?: string[];
  condition: 'good' | 'damaged' | 'expired' | 'quarantine';
  notes?: string;
}

export interface BatchMetadata {
  reference_document?: string;
  supervisor: string;
  department: string;
  cost_center?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  compliance_required: boolean;
  accuracy_threshold: number;
}

export interface BatchResult {
  session_id: string;
  total_items: number;
  items_scanned: number;
  items_missing: number;
  items_extra: number;
  accuracy_percentage: number;
  total_variance: number;
  variance_amount: number;
  processing_time: number;
  discrepancies: Discrepancy[];
  actions_required: ActionRequired[];
}

export interface Discrepancy {
  item_id: string;
  barcode: string;
  product_name: string;
  discrepancy_type: 'missing' | 'extra' | 'quantity_variance' | 'location_mismatch';
  expected_quantity: number;
  actual_quantity: number;
  variance: number;
  location: LocationData;
  requires_investigation: boolean;
  suggested_action: string;
}

export interface ActionRequired {
  action_type: 'adjustment' | 'recount' | 'investigation' | 'purchase_order' | 'transfer';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to?: string;
  due_date?: string;
  estimated_cost?: number;
}

// ==================== INVENTORY OPERATIONS ====================

export interface StockMovement {
  movement_id: string;
  movement_type: 'receipt' | 'issue' | 'transfer' | 'adjustment' | 'count' | 'reservation';
  movement_date: string;
  reference_number: string;
  product_id: string;
  from_location?: LocationData;
  to_location?: LocationData;
  quantity: number;
  unit_cost?: number;
  total_cost?: number;
  reason_code: string;
  reason_description: string;
  user_id: string;
  approval_required: boolean;
  approved_by?: string;
  approval_date?: string;
  status: 'pending' | 'approved' | 'posted' | 'cancelled';
  batch_details?: BatchDetails;
  serial_numbers?: string[];
  lot_numbers?: string[];
}

export interface BatchDetails {
  batch_number: string;
  manufacturing_date?: string;
  expiry_date?: string;
  supplier_batch?: string;
  quality_status: 'approved' | 'quarantine' | 'rejected';
  test_results?: TestResult[];
}

export interface TestResult {
  test_name: string;
  test_value: string;
  test_unit?: string;
  pass_fail: 'pass' | 'fail';
  test_date: string;
  tested_by: string;
}

export interface InventoryUpdate {
  update_id: string;
  product_id: string;
  location_id: string;
  old_quantity: number;
  new_quantity: number;
  movement_id: string;
  timestamp: string;
  user_id: string;
  cost_impact: number;
  variance_flags: VarianceFlag[];
}

export interface VarianceFlag {
  flag_type: 'negative_stock' | 'high_variance' | 'cost_variance' | 'location_mismatch';
  severity: 'warning' | 'error' | 'critical';
  message: string;
  auto_correctable: boolean;
  suggested_action: string;
}

// ==================== PRODUCT LOOKUP & MANAGEMENT ====================

export interface ProductLookupResult {
  product: ProductData | null;
  match_confidence: number;
  alternative_matches: AlternativeMatch[];
  suggested_actions: ProductAction[];
  pricing_info: PricingInfo;
  availability_info: AvailabilityInfo;
  last_transactions: RecentTransaction[];
}

export interface AlternativeMatch {
  product: ProductData;
  match_score: number;
  match_reason: string;
  differences: ProductDifference[];
}

export interface ProductDifference {
  field: string;
  scanned_value: string;
  product_value: string;
  significance: 'low' | 'medium' | 'high';
}

export interface ProductAction {
  action_type: 'create_product' | 'update_barcode' | 'verify_identity' | 'link_variant';
  description: string;
  confidence: number;
  parameters: Record<string, any>;
  requires_approval: boolean;
}

export interface PricingInfo {
  current_price: number;
  currency: string;
  price_effective_date: string;
  competitor_prices?: CompetitorPrice[];
  price_history: PriceHistory[];
  margin_analysis: MarginAnalysis;
}

export interface CompetitorPrice {
  competitor_name: string;
  price: number;
  last_checked: string;
  availability: boolean;
  source: string;
}

export interface PriceHistory {
  effective_date: string;
  price: number;
  change_percentage: number;
  change_reason: string;
}

export interface MarginAnalysis {
  cost_price: number;
  selling_price: number;
  margin_amount: number;
  margin_percentage: number;
  target_margin: number;
  variance_from_target: number;
}

export interface AvailabilityInfo {
  in_stock: boolean;
  available_quantity: number;
  next_restock_date?: string;
  alternative_locations: StockLocation[];
  substitute_products: SubstituteProduct[];
  backorder_status?: BackorderInfo;
}

export interface SubstituteProduct {
  product_id: string;
  product_name: string;
  substitution_type: 'direct' | 'alternative' | 'upgrade' | 'downgrade';
  price_difference: number;
  availability: boolean;
  customer_acceptance_rate: number;
}

export interface BackorderInfo {
  backorder_id: string;
  quantity_backordered: number;
  estimated_availability: string;
  customer_notifications: number;
  backorder_priority: 'low' | 'normal' | 'high';
}

export interface RecentTransaction {
  transaction_id: string;
  transaction_type: 'sale' | 'purchase' | 'transfer' | 'adjustment';
  quantity: number;
  unit_price: number;
  total_amount: number;
  transaction_date: string;
  customer_supplier: string;
  location: string;
}

// ==================== BARCODE SCANNING ENGINE ====================

export class BarcodeScanningEngine extends EventEmitter {
  private config: BarcodeScanningConfig;
  private currentBatchSession: BatchSession | null = null;
  private scanCache: Map<string, ProductLookupResult> = new Map();
  private recentScans: ScanResult[] = [];
  private scanStatistics: ScanStatistics = {
    total_scans: 0,
    successful_scans: 0,
    failed_scans: 0,
    average_confidence: 0,
    average_processing_time: 0
  };

  constructor(config: Partial<BarcodeScanningConfig> = {}) {
    super();
    
    this.config = {
      enableBarcodeFormats: ['UPC_A', 'UPC_E', 'EAN_13', 'EAN_8', 'CODE_128', 'CODE_39', 'QR_CODE'],
      enableQRCode: true,
      enableDataMatrix: true,
      enablePDF417: true,
      confidenceThreshold: 0.8,
      maxScanAttempts: 3,
      scanTimeout: 10000,
      enableBatchScanning: true,
      enableLocationTracking: true,
      enableRealTimeInventory: true,
      enablePriceVerification: true,
      ...config
    };

    this.initializeEventListeners();
  }

  // ==================== CORE SCANNING METHODS ====================

  /**
   * Scan barcode from captured image
   */
  async scanBarcode(image: CapturedPhoto): Promise<ScanResult> {
    try {
      console.log('📊 HERA: Starting barcode scan...');
      
      const startTime = performance.now();
      this.scanStatistics.total_scans++;

      // Perform barcode detection
      const barcodeResult = await universalCameraService.scanBarcode(image);
      
      if (!barcodeResult.data || barcodeResult.confidence < this.config.confidenceThreshold) {
        this.scanStatistics.failed_scans++;
        throw new Error(`Barcode not detected or confidence too low: ${barcodeResult.confidence}`);
      }

      // Lookup product information
      const productLookup = await this.lookupProduct(barcodeResult.data);
      
      // Get current location if enabled
      const location = this.config.enableLocationTracking ? await this.getCurrentLocation() : undefined;
      
      const processingTime = performance.now() - startTime;
      
      const scanResult: ScanResult = {
        scan_id: this.generateScanId(),
        barcode: barcodeResult.data,
        format: barcodeResult.format,
        confidence: barcodeResult.confidence,
        scan_timestamp: new Date().toISOString(),
        location,
        product: productLookup.product || undefined,
        quantity_scanned: 1, // Default quantity
        scan_context: this.getCurrentScanContext(),
        processing_time: processingTime,
        image_id: image.id
      };

      // Update statistics
      this.scanStatistics.successful_scans++;
      this.updateScanStatistics(scanResult);
      
      // Store recent scan
      this.recentScans.unshift(scanResult);
      if (this.recentScans.length > 100) {
        this.recentScans = this.recentScans.slice(0, 100);
      }

      // Add to current batch if active
      if (this.currentBatchSession) {
        await this.addToBatch(scanResult);
      }

      this.emit('barcode-scanned', scanResult);
      console.log('✅ HERA: Barcode scanned successfully:', barcodeResult.data);

      return scanResult;

    } catch (error) {
      console.error('❌ HERA: Barcode scanning failed:', error);
      this.scanStatistics.failed_scans++;
      this.emit('scan-error', { error, image: image.id });
      throw error;
    }
  }

  /**
   * Scan QR code with enhanced data extraction
   */
  async scanQRCode(image: CapturedPhoto): Promise<QRCodeResult> {
    try {
      console.log('🔲 HERA: Scanning QR code...');
      
      const barcodeResult = await universalCameraService.scanBarcode(image);
      
      if (barcodeResult.format !== 'QR_CODE') {
        throw new Error('Not a QR code');
      }

      // Parse QR code data
      const qrData = this.parseQRCodeData(barcodeResult.data);
      
      const result: QRCodeResult = {
        ...barcodeResult,
        parsed_data: qrData,
        data_type: this.detectQRDataType(qrData),
        actions: this.suggestQRActions(qrData)
      };

      this.emit('qr-code-scanned', result);
      return result;

    } catch (error) {
      console.error('❌ HERA: QR code scanning failed:', error);
      throw error;
    }
  }

  /**
   * Scan multiple barcodes in one image
   */
  async scanMultipleCodes(image: CapturedPhoto): Promise<MultiScanResult> {
    try {
      console.log('📊 HERA: Scanning multiple codes...');
      
      // This would use an enhanced scanning algorithm to detect multiple codes
      const results = await this.performMulticodeScan(image);
      
      const multiResult: MultiScanResult = {
        scan_id: this.generateScanId(),
        image_id: image.id,
        codes_detected: results.length,
        scan_results: results,
        processing_time: performance.now(),
        confidence_average: results.reduce((sum, r) => sum + r.confidence, 0) / results.length
      };

      this.emit('multiple-codes-scanned', multiResult);
      return multiResult;

    } catch (error) {
      console.error('❌ HERA: Multiple code scanning failed:', error);
      throw error;
    }
  }

  // ==================== PRODUCT INTEGRATION ====================

  /**
   * Look up product by barcode
   */
  async lookupProduct(barcode: string): Promise<ProductLookupResult> {
    try {
      console.log('🔍 HERA: Looking up product:', barcode);
      
      // Check cache first
      if (this.scanCache.has(barcode)) {
        const cached = this.scanCache.get(barcode)!;
        console.log('✅ HERA: Product found in cache');
        return cached;
      }

      // Search in database
      const { data: product, error } = await supabase
        .from('products')
        .select(`
          *,
          inventory_data:inventory(*),
          supplier_data:suppliers(*),
          pricing_data:product_pricing(*)
        `)
        .or(`barcode.eq.${barcode},upc.eq.${barcode},ean.eq.${barcode}`)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      let lookupResult: ProductLookupResult;

      if (product) {
        // Product found
        lookupResult = {
          product: product as ProductData,
          match_confidence: 1.0,
          alternative_matches: [],
          suggested_actions: [],
          pricing_info: await this.getPricingInfo(product.id),
          availability_info: await this.getAvailabilityInfo(product.id),
          last_transactions: await this.getRecentTransactions(product.id)
        };
      } else {
        // Product not found
        const alternatives = await this.findAlternativeMatches(barcode);
        
        lookupResult = {
          product: null,
          match_confidence: 0,
          alternative_matches: alternatives,
          suggested_actions: [
            {
              action_type: 'create_product',
              description: 'Create new product with this barcode',
              confidence: 0.9,
              parameters: { barcode },
              requires_approval: true
            }
          ],
          pricing_info: {} as PricingInfo,
          availability_info: {} as AvailabilityInfo,
          last_transactions: []
        };
      }

      // Cache the result
      this.scanCache.set(barcode, lookupResult);
      
      this.emit('product-lookup-completed', { barcode, result: lookupResult });
      return lookupResult;

    } catch (error) {
      console.error('❌ HERA: Product lookup failed:', error);
      throw error;
    }
  }

  /**
   * Update inventory quantity for scanned product
   */
  async updateInventory(barcode: string, quantity: number, operation: 'add' | 'subtract' | 'set' = 'add'): Promise<InventoryUpdate> {
    try {
      console.log('📦 HERA: Updating inventory:', barcode, quantity, operation);
      
      // Get product
      const productLookup = await this.lookupProduct(barcode);
      if (!productLookup.product) {
        throw new Error('Product not found');
      }

      const product = productLookup.product;
      const location = await this.getCurrentLocation();
      
      // Calculate new quantity
      const currentStock = product.inventory.current_stock;
      let newQuantity: number;
      
      switch (operation) {
        case 'add':
          newQuantity = currentStock + quantity;
          break;
        case 'subtract':
          newQuantity = currentStock - quantity;
          break;
        case 'set':
          newQuantity = quantity;
          break;
      }

      // Create stock movement record
      const stockMovement = await this.createStockMovement({
        product_id: product.id,
        movement_type: operation === 'add' ? 'receipt' : 'issue',
        quantity: Math.abs(newQuantity - currentStock),
        reason_code: 'SCAN_UPDATE',
        reason_description: `Inventory updated via mobile scan`,
        from_location: operation === 'subtract' ? location : undefined,
        to_location: operation === 'add' ? location : undefined
      });

      // Update inventory in database
      const { data: updatedInventory, error } = await supabase
        .from('inventory')
        .update({
          current_stock: newQuantity,
          available_stock: newQuantity, // Simplified for demo
          last_movement: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('product_id', product.id)
        .select()
        .single();

      if (error) throw error;

      const inventoryUpdate: InventoryUpdate = {
        update_id: this.generateUpdateId(),
        product_id: product.id,
        location_id: location?.warehouse_id || 'default',
        old_quantity: currentStock,
        new_quantity: newQuantity,
        movement_id: stockMovement.movement_id,
        timestamp: new Date().toISOString(),
        user_id: this.getCurrentUserId(),
        cost_impact: this.calculateCostImpact(product, newQuantity - currentStock),
        variance_flags: this.checkVarianceFlags(product, currentStock, newQuantity)
      };

      // Generate universal transaction if enabled
      if (this.config.enableRealTimeInventory) {
        await this.generateInventoryTransaction(inventoryUpdate, stockMovement);
      }

      this.emit('inventory-updated', inventoryUpdate);
      console.log('✅ HERA: Inventory updated successfully');

      return inventoryUpdate;

    } catch (error) {
      console.error('❌ HERA: Inventory update failed:', error);
      throw error;
    }
  }

  /**
   * Create new product from scanned barcode
   */
  async createProduct(barcode: string, productData: Partial<ProductData>): Promise<ProductData> {
    try {
      console.log('➕ HERA: Creating new product:', barcode);
      
      const newProduct: Partial<ProductData> = {
        sku: productData.sku || this.generateSKU(),
        barcode,
        name: productData.name || `Product ${barcode}`,
        description: productData.description || '',
        brand: productData.brand || 'Unknown',
        category: productData.category || 'General',
        unit_of_measure: productData.unit_of_measure || 'EA',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...productData
      };

      const { data: product, error } = await supabase
        .from('products')
        .insert(newProduct)
        .select()
        .single();

      if (error) throw error;

      // Initialize inventory record
      await this.initializeInventory(product.id);

      // Clear cache to ensure fresh data
      this.scanCache.clear();

      this.emit('product-created', product);
      console.log('✅ HERA: Product created successfully:', product.id);

      return product as ProductData;

    } catch (error) {
      console.error('❌ HERA: Product creation failed:', error);
      throw error;
    }
  }

  // ==================== BATCH OPERATIONS ====================

  /**
   * Start batch scanning session
   */
  async startBatchScan(sessionType: BatchSession['session_type'], metadata?: Partial<BatchMetadata>): Promise<BatchSession> {
    try {
      console.log('📦 HERA: Starting batch scan session:', sessionType);
      
      if (this.currentBatchSession) {
        throw new Error('Batch session already active');
      }

      const location = await this.getCurrentLocation();
      
      this.currentBatchSession = {
        session_id: this.generateSessionId(),
        session_type: sessionType,
        started_by: this.getCurrentUserId(),
        start_time: new Date().toISOString(),
        scanned_items: [],
        status: 'active',
        location: location || {} as LocationData,
        metadata: {
          supervisor: this.getCurrentUserId(),
          department: 'warehouse',
          priority: 'normal',
          compliance_required: false,
          accuracy_threshold: 0.95,
          ...metadata
        }
      };

      this.emit('batch-session-started', this.currentBatchSession);
      console.log('✅ HERA: Batch session started:', this.currentBatchSession.session_id);

      return this.currentBatchSession;

    } catch (error) {
      console.error('❌ HERA: Batch session start failed:', error);
      throw error;
    }
  }

  /**
   * Add scan result to current batch
   */
  async addToBatch(scanResult: ScanResult): Promise<void> {
    try {
      if (!this.currentBatchSession) {
        throw new Error('No active batch session');
      }

      if (!scanResult.product) {
        console.warn('⚠️ HERA: Cannot add unidentified product to batch');
        return;
      }

      const existingItem = this.currentBatchSession.scanned_items.find(
        item => item.barcode === scanResult.barcode
      );

      if (existingItem) {
        // Update existing item
        existingItem.scanned_quantity += scanResult.quantity_scanned || 1;
        existingItem.scan_timestamp = scanResult.scan_timestamp;
      } else {
        // Add new item
        const batchItem: BatchItem = {
          item_id: this.generateItemId(),
          barcode: scanResult.barcode,
          product: scanResult.product,
          scanned_quantity: scanResult.quantity_scanned || 1,
          scan_timestamp: scanResult.scan_timestamp,
          location: scanResult.location,
          condition: 'good'
        };

        this.currentBatchSession.scanned_items.push(batchItem);
      }

      this.emit('item-added-to-batch', {
        session_id: this.currentBatchSession.session_id,
        item: scanResult
      });

    } catch (error) {
      console.error('❌ HERA: Add to batch failed:', error);
      throw error;
    }
  }

  /**
   * Process and complete batch session
   */
  async processBatch(): Promise<BatchResult> {
    try {
      console.log('⚡ HERA: Processing batch session...');
      
      if (!this.currentBatchSession) {
        throw new Error('No active batch session');
      }

      const session = this.currentBatchSession;
      const startTime = performance.now();

      // Calculate results
      const totalItems = session.expected_items ? session.expected_items.length : session.scanned_items.length;
      const itemsScanned = session.scanned_items.length;
      const itemsMissing = session.expected_items ? 
        session.expected_items.length - session.scanned_items.length : 0;
      const itemsExtra = session.expected_items ? 
        Math.max(0, session.scanned_items.length - session.expected_items.length) : 0;

      // Calculate discrepancies
      const discrepancies = await this.calculateDiscrepancies(session);
      
      // Calculate accuracy
      const accuracyPercentage = totalItems > 0 ? 
        ((totalItems - discrepancies.length) / totalItems) * 100 : 100;

      const processingTime = performance.now() - startTime;

      const result: BatchResult = {
        session_id: session.session_id,
        total_items: totalItems,
        items_scanned: itemsScanned,
        items_missing: itemsMissing,
        items_extra: itemsExtra,
        accuracy_percentage: accuracyPercentage,
        total_variance: this.calculateTotalVariance(discrepancies),
        variance_amount: this.calculateVarianceAmount(discrepancies),
        processing_time: processingTime,
        discrepancies,
        actions_required: this.generateRequiredActions(discrepancies)
      };

      // Update session status
      session.status = 'completed';
      session.end_time = new Date().toISOString();

      // Store batch results
      await this.storeBatchResults(session, result);

      // Process inventory updates
      if (session.session_type === 'receiving' || session.session_type === 'counting') {
        await this.processBatchInventoryUpdates(session);
      }

      // Clear current session
      this.currentBatchSession = null;

      this.emit('batch-processed', result);
      console.log('✅ HERA: Batch processing completed:', result.session_id);

      return result;

    } catch (error) {
      console.error('❌ HERA: Batch processing failed:', error);
      throw error;
    }
  }

  // ==================== INTEGRATION METHODS ====================

  /**
   * Generate stock movement for inventory operations
   */
  async generateStockMovement(scanResults: ScanResult[]): Promise<StockMovement[]> {
    try {
      console.log('📊 HERA: Generating stock movements...');
      
      const movements: StockMovement[] = [];
      
      for (const scan of scanResults) {
        if (!scan.product) continue;

        const movement: StockMovement = {
          movement_id: this.generateMovementId(),
          movement_type: 'receipt', // Default to receipt
          movement_date: scan.scan_timestamp,
          reference_number: `SCAN-${scan.scan_id}`,
          product_id: scan.product.id,
          to_location: scan.location,
          quantity: scan.quantity_scanned || 1,
          reason_code: 'SCAN_RECEIPT',
          reason_description: 'Product received via mobile scan',
          user_id: this.getCurrentUserId(),
          approval_required: false,
          status: 'posted'
        };

        movements.push(movement);
      }

      this.emit('stock-movements-generated', movements);
      return movements;

    } catch (error) {
      console.error('❌ HERA: Stock movement generation failed:', error);
      throw error;
    }
  }

  /**
   * Update universal transactions with scan data
   */
  async updateUniversalTransactions(movements: StockMovement[]): Promise<void> {
    try {
      console.log('🔄 HERA: Updating universal transactions...');
      
      for (const movement of movements) {
        const transaction = {
          transaction_type: 'inventory_receipt',
          transaction_date: movement.movement_date,
          description: movement.reason_description,
          reference_number: movement.reference_number,
          total_amount: movement.total_cost || 0,
          currency: 'USD',
          status: 'posted',
          metadata: {
            source: 'mobile_scan',
            movement_id: movement.movement_id,
            product_id: movement.product_id
          }
        };

        await supabase
          .from('universal_transactions')
          .insert(transaction);
      }

      console.log('✅ HERA: Universal transactions updated');

    } catch (error) {
      console.error('❌ HERA: Universal transaction update failed:', error);
      throw error;
    }
  }

  // ==================== PRIVATE HELPER METHODS ====================

  private initializeEventListeners(): void {
    universalCameraService.on('barcode-scanned', this.handleBarcodeScanResult.bind(this));
  }

  private handleBarcodeScanResult(result: BarcodeResult): void {
    // Handle barcode scan events from camera service
    this.emit('barcode-detected', result);
  }

  private generateScanId(): string {
    return `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateItemId(): string {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateUpdateId(): string {
    return `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMovementId(): string {
    return `move_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSKU(): string {
    return `SKU${Date.now().toString().slice(-6)}`;
  }

  private getCurrentUserId(): string {
    // This would get the current user from auth context
    return 'current_user_id';
  }

  private getCurrentScanContext(): ScanContext {
    return {
      operation_type: 'lookup',
      user_id: this.getCurrentUserId(),
      session_id: this.currentBatchSession?.session_id || `session_${Date.now()}`
    };
  }

  private async getCurrentLocation(): Promise<LocationData | undefined> {
    if (!this.config.enableLocationTracking) return undefined;

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
          maximumAge: 60000
        });
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      };
    } catch (error) {
      console.warn('⚠️ HERA: Location access failed:', error);
      return undefined;
    }
  }

  private updateScanStatistics(scan: ScanResult): void {
    const total = this.scanStatistics.successful_scans;
    const currentAvgConfidence = this.scanStatistics.average_confidence;
    const currentAvgTime = this.scanStatistics.average_processing_time;

    this.scanStatistics.average_confidence = 
      (currentAvgConfidence * (total - 1) + scan.confidence) / total;
    
    this.scanStatistics.average_processing_time = 
      (currentAvgTime * (total - 1) + scan.processing_time) / total;
  }

  // Placeholder methods for advanced functionality
  private parseQRCodeData(data: string): any { return { raw: data }; }
  private detectQRDataType(data: any): string { return 'unknown'; }
  private suggestQRActions(data: any): any[] { return []; }
  private async performMulticodeScan(image: CapturedPhoto): Promise<ScanResult[]> { return []; }
  private async findAlternativeMatches(barcode: string): Promise<AlternativeMatch[]> { return []; }
  private async getPricingInfo(productId: string): Promise<PricingInfo> { return {} as PricingInfo; }
  private async getAvailabilityInfo(productId: string): Promise<AvailabilityInfo> { return {} as AvailabilityInfo; }
  private async getRecentTransactions(productId: string): Promise<RecentTransaction[]> { return []; }
  private async createStockMovement(params: any): Promise<StockMovement> { return {} as StockMovement; }
  private calculateCostImpact(product: ProductData, quantityChange: number): number { return 0; }
  private checkVarianceFlags(product: ProductData, oldQty: number, newQty: number): VarianceFlag[] { return []; }
  private async generateInventoryTransaction(update: InventoryUpdate, movement: StockMovement): Promise<void> {}
  private async initializeInventory(productId: string): Promise<void> {}
  private async calculateDiscrepancies(session: BatchSession): Promise<Discrepancy[]> { return []; }
  private calculateTotalVariance(discrepancies: Discrepancy[]): number { return 0; }
  private calculateVarianceAmount(discrepancies: Discrepancy[]): number { return 0; }
  private generateRequiredActions(discrepancies: Discrepancy[]): ActionRequired[] { return []; }
  private async storeBatchResults(session: BatchSession, result: BatchResult): Promise<void> {}
  private async processBatchInventoryUpdates(session: BatchSession): Promise<void> {}
}

// ==================== SUPPORTING TYPES ====================

interface QRCodeResult extends BarcodeResult {
  parsed_data: any;
  data_type: string;
  actions: any[];
}

interface MultiScanResult {
  scan_id: string;
  image_id: string;
  codes_detected: number;
  scan_results: ScanResult[];
  processing_time: number;
  confidence_average: number;
}

interface ScanStatistics {
  total_scans: number;
  successful_scans: number;
  failed_scans: number;
  average_confidence: number;
  average_processing_time: number;
}

// ==================== FACTORY FUNCTION ====================

export function createBarcodeScanningEngine(config?: Partial<BarcodeScanningConfig>): BarcodeScanningEngine {
  return new BarcodeScanningEngine(config);
}

// ==================== SINGLETON INSTANCE ====================

export const barcodeScanningEngine = createBarcodeScanningEngine();