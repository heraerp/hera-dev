/**
 * HERA Universal ERP - Barcode Scanner Component
 * Advanced inventory management through barcode scanning
 * Real-time product identification and stock management
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  ScanLine, 
  Plus, 
  Minus, 
  Eye, 
  Edit, 
  Save, 
  CheckCircle2,
  AlertTriangle,
  X,
  MapPin,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ShoppingCart,
  Truck,
  Archive,
  Settings,
  Search,
  Filter,
  Download,
  RefreshCw,
  Zap
} from 'lucide-react';
import { UniversalCameraInterface } from './universal-camera-interface';
import { 
  barcodeScanningEngine, 
  ScanResult, 
  ProductData, 
  BatchSession, 
  InventoryUpdate,
  StockLocation 
} from '@/lib/scanner/barcode-scanning-engine';
import { CapturedPhoto } from '@/lib/camera/universal-camera-service';
import { Button } from '@/components/ui/revolutionary-button';
import { Card } from '@/components/ui/revolutionary-card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import motionConfig from '@/lib/motion';

// ==================== COMPONENT INTERFACES ====================

interface BarcodeScannerProps {
  mode: 'lookup' | 'receiving' | 'picking' | 'counting' | 'audit';
  onScanComplete?: (result: ScanResult) => void;
  onInventoryUpdate?: (update: InventoryUpdate) => void;
  onError?: (error: Error) => void;
  enableBatchMode?: boolean;
  enableInventoryUpdates?: boolean;
  locationTracking?: boolean;
  autoQuantityPrompt?: boolean;
  className?: string;
}

interface ScanningState {
  isScanning: boolean;
  lastScan?: ScanResult;
  scanHistory: ScanResult[];
  currentBatch?: BatchSession;
  totalScanned: number;
  successfulScans: number;
  failedScans: number;
}

interface ProductDisplayState {
  product?: ProductData;
  showDetails: boolean;
  isEditing: boolean;
  editedQuantity: number;
  operation: 'add' | 'subtract' | 'set';
  showInventoryUpdate: boolean;
}

interface BatchModeState {
  isActive: boolean;
  session?: BatchSession;
  expectedItems: BatchExpectedItem[];
  scannedItems: Map<string, BatchScannedItem>;
  progress: {
    total: number;
    scanned: number;
    remaining: number;
    accuracy: number;
  };
}

interface BatchExpectedItem {
  barcode: string;
  productName: string;
  expectedQuantity: number;
  location?: string;
}

interface BatchScannedItem {
  barcode: string;
  product: ProductData;
  scannedQuantity: number;
  expectedQuantity?: number;
  variance: number;
  timestamps: string[];
  locations: string[];
}

// ==================== BARCODE SCANNER COMPONENT ====================

export function BarcodeScanner({
  mode = 'lookup',
  onScanComplete,
  onInventoryUpdate,
  onError,
  enableBatchMode = true,
  enableInventoryUpdates = true,
  locationTracking = true,
  autoQuantityPrompt = true,
  className = ''
}: BarcodeScannerProps) {
  
  // ==================== STATE MANAGEMENT ====================
  
  const [scanningState, setScanningState] = useState<ScanningState>({
    isScanning: false,
    scanHistory: [],
    totalScanned: 0,
    successfulScans: 0,
    failedScans: 0
  });

  const [productState, setProductState] = useState<ProductDisplayState>({
    showDetails: false,
    isEditing: false,
    editedQuantity: 1,
    operation: 'add',
    showInventoryUpdate: false
  });

  const [batchState, setBatchState] = useState<BatchModeState>({
    isActive: false,
    expectedItems: [],
    scannedItems: new Map(),
    progress: { total: 0, scanned: 0, remaining: 0, accuracy: 100 }
  });

  const [activeTab, setActiveTab] = useState<'scanner' | 'history' | 'batch' | 'analytics'>('scanner');

  // ==================== BARCODE SCANNING HANDLERS ====================

  const handlePhotoCapture = useCallback(async (photo: CapturedPhoto) => {
    try {
      console.log('📊 HERA: Processing barcode scan...');
      
      setScanningState(prev => ({ 
        ...prev, 
        isScanning: true 
      }));

      const scanResult = await barcodeScanningEngine.scanBarcode(photo);
      
      await handleScanResult(scanResult);

    } catch (error) {
      console.error('❌ HERA: Barcode scan failed:', error);
      
      setScanningState(prev => ({
        ...prev,
        isScanning: false,
        failedScans: prev.failedScans + 1
      }));
      
      onError?.(error instanceof Error ? error : new Error('Barcode scan failed'));
    }
  }, []);

  const handleScanResult = useCallback(async (scanResult: ScanResult) => {
    try {
      console.log('✅ HERA: Barcode scan successful:', scanResult.barcode);
      
      // Update scanning statistics
      setScanningState(prev => ({
        ...prev,
        isScanning: false,
        lastScan: scanResult,
        scanHistory: [scanResult, ...prev.scanHistory.slice(0, 49)], // Keep last 50 scans
        totalScanned: prev.totalScanned + 1,
        successfulScans: prev.successfulScans + 1
      }));

      // Update product display
      if (scanResult.product) {
        setProductState(prev => ({
          ...prev,
          product: scanResult.product,
          showDetails: true,
          editedQuantity: 1
        }));
      }

      // Handle batch mode
      if (batchState.isActive) {
        await handleBatchScan(scanResult);
      }

      // Trigger quantity prompt for inventory operations
      if (autoQuantityPrompt && ['receiving', 'picking', 'counting'].includes(mode)) {
        setProductState(prev => ({ ...prev, showInventoryUpdate: true }));
      }

      onScanComplete?.(scanResult);

    } catch (error) {
      console.error('❌ HERA: Scan result handling failed:', error);
      onError?.(error instanceof Error ? error : new Error('Scan result processing failed'));
    }
  }, [mode, batchState.isActive, autoQuantityPrompt, onScanComplete, onError]);

  // ==================== INVENTORY MANAGEMENT ====================

  const handleInventoryUpdate = useCallback(async () => {
    try {
      if (!productState.product) return;

      console.log('📦 HERA: Updating inventory...', {
        barcode: productState.product.barcode,
        quantity: productState.editedQuantity,
        operation: productState.operation
      });

      const inventoryUpdate = await barcodeScanningEngine.updateInventory(
        productState.product.barcode,
        productState.editedQuantity,
        productState.operation
      );

      // Update product state with new inventory
      setProductState(prev => ({
        ...prev,
        product: prev.product ? {
          ...prev.product,
          inventory: {
            ...prev.product.inventory,
            current_stock: inventoryUpdate.new_quantity
          }
        } : undefined,
        showInventoryUpdate: false
      }));

      onInventoryUpdate?.(inventoryUpdate);

      console.log('✅ HERA: Inventory updated successfully');

    } catch (error) {
      console.error('❌ HERA: Inventory update failed:', error);
      onError?.(error instanceof Error ? error : new Error('Inventory update failed'));
    }
  }, [productState.product, productState.editedQuantity, productState.operation, onInventoryUpdate, onError]);

  // ==================== BATCH MODE HANDLERS ====================

  const startBatchSession = useCallback(async () => {
    try {
      console.log('📦 HERA: Starting batch session...');
      
      const sessionType = mode === 'receiving' ? 'receiving' : 
                         mode === 'counting' ? 'counting' : 
                         'cycle_count';
      
      const session = await barcodeScanningEngine.startBatchScan(sessionType);
      
      setBatchState(prev => ({
        ...prev,
        isActive: true,
        session,
        scannedItems: new Map(),
        progress: { total: 0, scanned: 0, remaining: 0, accuracy: 100 }
      }));

      setActiveTab('batch');

    } catch (error) {
      console.error('❌ HERA: Batch session start failed:', error);
      onError?.(error instanceof Error ? error : new Error('Batch session start failed'));
    }
  }, [mode, onError]);

  const endBatchSession = useCallback(async () => {
    try {
      if (!batchState.session) return;

      console.log('⚡ HERA: Processing batch session...');
      
      const result = await barcodeScanningEngine.processBatch();
      
      setBatchState(prev => ({
        ...prev,
        isActive: false,
        session: undefined
      }));

      console.log('✅ HERA: Batch session completed:', result);

    } catch (error) {
      console.error('❌ HERA: Batch session end failed:', error);
      onError?.(error instanceof Error ? error : new Error('Batch session processing failed'));
    }
  }, [batchState.session, onError]);

  const handleBatchScan = useCallback(async (scanResult: ScanResult) => {
    if (!scanResult.product) return;

    const barcode = scanResult.barcode;
    const existing = batchState.scannedItems.get(barcode);
    
    if (existing) {
      // Update existing item
      existing.scannedQuantity += 1;
      existing.timestamps.push(scanResult.scan_timestamp);
      if (scanResult.location) {
        existing.locations.push(scanResult.location.warehouse_id || 'unknown');
      }
    } else {
      // Add new item
      const newItem: BatchScannedItem = {
        barcode,
        product: scanResult.product,
        scannedQuantity: 1,
        variance: 0,
        timestamps: [scanResult.scan_timestamp],
        locations: scanResult.location ? [scanResult.location.warehouse_id || 'unknown'] : []
      };
      
      batchState.scannedItems.set(barcode, newItem);
    }

    // Update progress
    const scannedCount = Array.from(batchState.scannedItems.values())
      .reduce((sum, item) => sum + item.scannedQuantity, 0);
    
    setBatchState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        scanned: scannedCount,
        remaining: Math.max(0, prev.progress.total - scannedCount)
      }
    }));

  }, [batchState]);

  // ==================== RENDER METHODS ====================

  const renderScannerInterface = () => (
    <div className="h-full relative">
      <UniversalCameraInterface
        mode="barcode"
        onCapture={handlePhotoCapture}
        onError={onError}
        autoProcess={true}
        showPreview={false}
        className="h-full"
      />

      {/* Scanning overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Barcode scanning frame */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-64 h-40 border-2 border-primary rounded-lg relative"
            animate={{
              borderColor: scanningState.isScanning ? '#10B981' : '#3B82F6'
            }}
          >
            {/* Scanning line */}
            <AnimatePresence>
              {scanningState.isScanning && (
                <motion.div
                  className="absolute inset-x-0 h-0.5 bg-green-500 shadow-lg"
                  initial={{ top: '0%' }}
                  animate={{ top: '100%' }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
              )}
            </AnimatePresence>

            {/* Corner markers */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary" />
          </motion.div>
        </div>

        {/* Mode indicator */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <Badge variant="secondary" className="bg-black/50 text-white">
            <Package className="w-4 h-4 mr-2" />
            {getModeTitle(mode)}
          </Badge>
        </div>

        {/* Statistics */}
        <div className="absolute top-4 right-4">
          <Card variant="glass" className="p-3 bg-black/50 text-white">
            <div className="text-xs space-y-1">
              <div className="flex justify-between gap-4">
                <span>Scanned:</span>
                <span className="font-mono">{scanningState.successfulScans}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Failed:</span>
                <span className="font-mono text-red-400">{scanningState.failedScans}</span>
              </div>
              {scanningState.totalScanned > 0 && (
                <div className="flex justify-between gap-4">
                  <span>Success Rate:</span>
                  <span className="font-mono text-green-400">
                    {Math.round((scanningState.successfulScans / scanningState.totalScanned) * 100)}%
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Last scan result */}
        <AnimatePresence>
          {scanningState.lastScan && (
            <motion.div
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <Card variant="glass" className="p-4 bg-black/50 text-white max-w-sm">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {scanningState.lastScan.product?.name || 'Unknown Product'}
                    </p>
                    <p className="text-xs text-gray-300 font-mono">
                      {scanningState.lastScan.barcode}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      {Math.round(scanningState.lastScan.confidence * 100)}%
                    </Badge>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  const renderProductDetails = () => {
    if (!productState.product) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Scan a barcode to view product details</p>
          </div>
        </div>
      );
    }

    const product = productState.product;

    return (
      <div className="space-y-6">
        {/* Product Header */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={product.images?.[0]?.image_url} />
              <AvatarFallback>
                <Package className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold truncate">{product.name}</h3>
              <p className="text-muted-foreground">{product.description}</p>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="outline">{product.sku}</Badge>
                <Badge variant="secondary">{product.category}</Badge>
                <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                  {product.status}
                </Badge>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-2xl font-bold">
                ${product.pricing?.selling_price.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">
                Cost: ${product.pricing?.cost_price.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        {/* Inventory Information */}
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Inventory Status</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {product.inventory?.current_stock || 0}
              </p>
              <p className="text-sm text-muted-foreground">Current Stock</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {product.inventory?.available_stock || 0}
              </p>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">
                {product.inventory?.reorder_point || 0}
              </p>
              <p className="text-sm text-muted-foreground">Reorder Point</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {product.inventory?.reserved_stock || 0}
              </p>
              <p className="text-sm text-muted-foreground">Reserved</p>
            </div>
          </div>

          {/* Stock Locations */}
          {product.inventory?.locations && product.inventory.locations.length > 0 && (
            <div className="mt-6">
              <h5 className="font-medium mb-3">Stock Locations</h5>
              <div className="space-y-2">
                {product.inventory.locations.map((location, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{location.location_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {location.zone}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{location.quantity}</p>
                      <p className="text-xs text-muted-foreground">
                        Reserved: {location.reserved_quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Inventory Actions */}
        {enableInventoryUpdates && (
          <Card className="p-6">
            <h4 className="font-semibold mb-4">Inventory Actions</h4>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={productState.editedQuantity}
                    onChange={(e) => setProductState(prev => ({
                      ...prev,
                      editedQuantity: parseInt(e.target.value) || 0
                    }))}
                    className="w-full"
                  />
                </div>
                
                <div className="flex-1">
                  <Label htmlFor="operation">Operation</Label>
                  <Select
                    value={productState.operation}
                    onValueChange={(value: 'add' | 'subtract' | 'set') =>
                      setProductState(prev => ({ ...prev, operation: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add">Add Stock</SelectItem>
                      <SelectItem value="subtract">Remove Stock</SelectItem>
                      <SelectItem value="set">Set Quantity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setProductState(prev => ({ ...prev, editedQuantity: prev.editedQuantity - 1 }))}
                  disabled={productState.editedQuantity <= 0}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="gradient"
                  onClick={handleInventoryUpdate}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Update Inventory
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setProductState(prev => ({ ...prev, editedQuantity: prev.editedQuantity + 1 }))}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    );
  };

  const renderScanHistory = () => (
    <div className="space-y-4">
      {scanningState.scanHistory.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No scans yet</p>
          <p className="text-sm">Your scan history will appear here</p>
        </div>
      ) : (
        scanningState.scanHistory.map((scan, index) => (
          <Card key={scan.scan_id} className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <Badge variant="outline">#{scanningState.scanHistory.length - index}</Badge>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium truncate">
                    {scan.product?.name || 'Unknown Product'}
                  </h4>
                  <Badge variant={scan.confidence > 0.9 ? 'default' : 'secondary'}>
                    {Math.round(scan.confidence * 100)}%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground font-mono">{scan.barcode}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(scan.scan_timestamp).toLocaleString()}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setProductState(prev => ({
                      ...prev,
                      product: scan.product,
                      showDetails: true
                    }));
                    setActiveTab('scanner');
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );

  const renderBatchMode = () => (
    <div className="space-y-6">
      {!batchState.isActive ? (
        <Card className="p-6 text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Batch Scanning Mode</h3>
          <p className="text-muted-foreground mb-6">
            Scan multiple items efficiently with automatic tracking and validation
          </p>
          <Button
            variant="gradient"
            onClick={startBatchSession}
            className="w-full max-w-xs"
          >
            Start Batch Session
          </Button>
        </Card>
      ) : (
        <>
          {/* Batch Progress */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Batch Session Active</h3>
              <Badge variant="default">
                {batchState.session?.session_type.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{batchState.progress.scanned}</p>
                <p className="text-sm text-muted-foreground">Scanned</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{batchState.progress.remaining}</p>
                <p className="text-sm text-muted-foreground">Remaining</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{batchState.progress.accuracy}%</p>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={endBatchSession}
                className="flex-1"
              >
                Complete Session
              </Button>
            </div>
          </Card>

          {/* Scanned Items */}
          <Card className="p-6">
            <h4 className="font-semibold mb-4">Scanned Items</h4>
            {batchState.scannedItems.size === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No items scanned yet
              </p>
            ) : (
              <div className="space-y-3">
                {Array.from(batchState.scannedItems.values()).map((item) => (
                  <div key={item.barcode} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground font-mono">{item.barcode}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">Qty: {item.scannedQuantity}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.timestamps.length} scan{item.timestamps.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Scanning Statistics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Scanning Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{scanningState.totalScanned}</p>
            <p className="text-sm text-muted-foreground">Total Scans</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{scanningState.successfulScans}</p>
            <p className="text-sm text-muted-foreground">Successful</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{scanningState.failedScans}</p>
            <p className="text-sm text-muted-foreground">Failed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {scanningState.totalScanned > 0 
                ? Math.round((scanningState.successfulScans / scanningState.totalScanned) * 100)
                : 0
              }%
            </p>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4">Recent Activity</h4>
        {scanningState.scanHistory.slice(0, 5).map((scan, index) => (
          <div key={scan.scan_id} className="flex items-center gap-3 py-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <div className="flex-1">
              <p className="font-medium">{scan.product?.name || 'Unknown Product'}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(scan.scan_timestamp).toLocaleTimeString()}
              </p>
            </div>
            <Badge variant="outline">
              {Math.round(scan.confidence * 100)}%
            </Badge>
          </div>
        ))}
      </Card>
    </div>
  );

  // ==================== MAIN RENDER ====================

  return (
    <div className={`h-full flex flex-col bg-background ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Barcode Scanner</h1>
            <p className="text-muted-foreground">
              {getModeDescription(mode)}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {enableBatchMode && (
              <Button
                variant={batchState.isActive ? "default" : "outline"}
                onClick={batchState.isActive ? endBatchSession : startBatchSession}
                className="flex items-center gap-2"
              >
                <Archive className="w-4 h-4" />
                {batchState.isActive ? 'End Batch' : 'Start Batch'}
              </Button>
            )}
            
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="h-full flex flex-col">
          <TabsList className="mx-4 mt-4">
            <TabsTrigger value="scanner" className="flex items-center gap-2">
              <ScanLine className="w-4 h-4" />
              Scanner
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              History
            </TabsTrigger>
            {enableBatchMode && (
              <TabsTrigger value="batch" className="flex items-center gap-2">
                <Archive className="w-4 h-4" />
                Batch
              </TabsTrigger>
            )}
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto">
            <TabsContent value="scanner" className="mt-0 h-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
                <div className="h-full">
                  {renderScannerInterface()}
                </div>
                <div className="p-4 overflow-auto">
                  {renderProductDetails()}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-0 p-4">
              {renderScanHistory()}
            </TabsContent>

            {enableBatchMode && (
              <TabsContent value="batch" className="mt-0 p-4">
                {renderBatchMode()}
              </TabsContent>
            )}

            <TabsContent value="analytics" className="mt-0 p-4">
              {renderAnalytics()}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

// ==================== HELPER FUNCTIONS ====================

function getModeTitle(mode: string): string {
  switch (mode) {
    case 'lookup': return 'Product Lookup';
    case 'receiving': return 'Inventory Receiving';
    case 'picking': return 'Order Picking';
    case 'counting': return 'Stock Counting';
    case 'audit': return 'Inventory Audit';
    default: return 'Barcode Scanner';
  }
}

function getModeDescription(mode: string): string {
  switch (mode) {
    case 'lookup': return 'Scan barcodes to lookup product information';
    case 'receiving': return 'Scan items being received into inventory';
    case 'picking': return 'Scan items for order fulfillment';
    case 'counting': return 'Scan items for inventory counting';
    case 'audit': return 'Scan items for inventory audit verification';
    default: return 'Scan barcodes for inventory management';
  }
}

export default BarcodeScanner;