/**
 * HERA Universal ERP - Inventory Scanning Workflow
 * Complete inventory management with barcode scanning and real-time updates
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Minus, 
  Plus, 
  Search, 
  MapPin, 
  Barcode, 
  Edit3, 
  Save, 
  ArrowRight,
  Zap,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ShoppingCart,
  Truck,
  RotateCcw,
  Eye
} from 'lucide-react';
import { UniversalCameraInterface } from '../universal-camera-interface';
import { Button } from '@/components/ui/revolutionary-button';
import { Card } from '@/components/ui/revolutionary-card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ==================== TYPES ====================

interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  brand?: string;
  barcode?: string;
  unit_of_measure: string;
  cost_price: number;
  selling_price: number;
  reorder_level: number;
  reorder_quantity: number;
  locations: ProductLocation[];
  total_stock: number;
  reserved_stock: number;
  available_stock: number;
  last_updated: string;
}

interface ProductLocation {
  location_id: string;
  location_name: string;
  bin_location?: string;
  quantity: number;
  reserved_quantity: number;
  last_counted?: string;
}

interface InventoryTransaction {
  id: string;
  product_id: string;
  transaction_type: 'in' | 'out' | 'adjustment' | 'transfer' | 'count';
  quantity: number;
  unit_cost?: number;
  location_from?: string;
  location_to?: string;
  reason: string;
  reference?: string;
  employee_id: string;
  timestamp: string;
  batch_id?: string;
}

interface ScanResult {
  barcode: string;
  product?: Product;
  confidence: number;
  scan_type: 'found' | 'not_found' | 'multiple_matches';
  suggestions?: Product[];
}

interface InventoryScanningWorkflowProps {
  operationType: 'receive' | 'ship' | 'transfer' | 'count' | 'adjustment';
  locationId?: string;
  employeeId: string;
  onComplete?: (transactions: InventoryTransaction[]) => void;
  onError?: (error: Error) => void;
  enableBatchMode?: boolean;
  className?: string;
}

// ==================== MAIN COMPONENT ====================

export function InventoryScanningWorkflow({
  operationType,
  locationId,
  employeeId,
  onComplete,
  onError,
  enableBatchMode = true,
  className = ''
}: InventoryScanningWorkflowProps) {
  const [currentStep, setCurrentStep] = useState<'scan' | 'product' | 'quantity' | 'details' | 'batch' | 'complete'>('scan');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [scannedProducts, setScannedProducts] = useState<Array<{ product: Product; quantity: number; reason?: string }>>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [transferToLocation, setTransferToLocation] = useState<string>('');

  // ==================== SCANNING HANDLERS ====================

  const handleBarcodeCapture = useCallback((result: any) => {
    console.log('📦 HERA: Barcode scanned:', result);
    
    const scanResult: ScanResult = {
      barcode: result.barcode || result.value || '',
      confidence: result.confidence || 0.9,
      scan_type: 'found',
      product: result.product ? mockProductFromBarcode(result.barcode) : undefined
    };

    if (!scanResult.product) {
      scanResult.scan_type = 'not_found';
      scanResult.suggestions = mockSearchProducts(scanResult.barcode);
    }

    setScanResult(scanResult);
    
    if (scanResult.product) {
      setSelectedProduct(scanResult.product);
      setCurrentStep('quantity');
    } else {
      setCurrentStep('product');
    }
  }, []);

  const handleScanError = useCallback((error: Error) => {
    console.error('❌ HERA: Barcode scan failed:', error);
    onError?.(error);
  }, [onError]);

  // ==================== PRODUCT MANAGEMENT ====================

  const handleProductSelection = useCallback((product: Product) => {
    setSelectedProduct(product);
    setCurrentStep('quantity');
  }, []);

  const handleQuantityConfirm = useCallback(() => {
    if (selectedProduct) {
      if (enableBatchMode) {
        setScannedProducts(prev => [...prev, {
          product: selectedProduct,
          quantity: quantity,
          reason: reason || getDefaultReason(operationType)
        }]);
        
        // Reset for next scan
        setScanResult(null);
        setSelectedProduct(null);
        setQuantity(1);
        setReason('');
        setCurrentStep('scan');
      } else {
        setCurrentStep('details');
      }
    }
  }, [selectedProduct, quantity, reason, operationType, enableBatchMode]);

  const handleBatchComplete = useCallback(() => {
    setCurrentStep('complete');
    
    // Create transactions
    const transactions: InventoryTransaction[] = scannedProducts.map((item, index) => ({
      id: `TXN-${Date.now()}-${index}`,
      product_id: item.product.id,
      transaction_type: getTransactionType(operationType),
      quantity: operationType === 'ship' ? -item.quantity : item.quantity,
      location_from: operationType === 'ship' ? locationId : undefined,
      location_to: operationType === 'receive' || operationType === 'transfer' ? (transferToLocation || locationId) : undefined,
      reason: item.reason || getDefaultReason(operationType),
      reference: reference,
      employee_id: employeeId,
      timestamp: new Date().toISOString(),
      batch_id: `BATCH-${Date.now()}`
    }));

    onComplete?.(transactions);
  }, [scannedProducts, operationType, locationId, transferToLocation, reference, employeeId, onComplete]);

  // ==================== UTILITY FUNCTIONS ====================

  const getTransactionType = (opType: string): InventoryTransaction['transaction_type'] => {
    switch (opType) {
      case 'receive': return 'in';
      case 'ship': return 'out';
      case 'transfer': return 'transfer';
      case 'count': return 'count';
      case 'adjustment': return 'adjustment';
      default: return 'adjustment';
    }
  };

  const getDefaultReason = (opType: string): string => {
    switch (opType) {
      case 'receive': return 'Goods received';
      case 'ship': return 'Goods shipped';
      case 'transfer': return 'Location transfer';
      case 'count': return 'Physical count';
      case 'adjustment': return 'Inventory adjustment';
      default: return 'Inventory movement';
    }
  };

  const getOperationTitle = (opType: string): string => {
    switch (opType) {
      case 'receive': return 'Receive Inventory';
      case 'ship': return 'Ship Inventory';
      case 'transfer': return 'Transfer Inventory';
      case 'count': return 'Count Inventory';
      case 'adjustment': return 'Adjust Inventory';
      default: return 'Inventory Operation';
    }
  };

  const getOperationIcon = (opType: string) => {
    switch (opType) {
      case 'receive': return <Truck className="w-5 h-5" />;
      case 'ship': return <ShoppingCart className="w-5 h-5" />;
      case 'transfer': return <RefreshCw className="w-5 h-5" />;
      case 'count': return <Eye className="w-5 h-5" />;
      case 'adjustment': return <Edit3 className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  // ==================== MOCK DATA FUNCTIONS ====================

  const mockProductFromBarcode = (barcode: string): Product | undefined => {
    const products = [
      {
        id: 'PRD-001',
        sku: 'ABC123',
        name: 'Wireless Bluetooth Headphones',
        description: 'Premium noise-cancelling headphones',
        category: 'Electronics',
        brand: 'TechCorp',
        barcode: '123456789012',
        unit_of_measure: 'Each',
        cost_price: 75.00,
        selling_price: 149.99,
        reorder_level: 10,
        reorder_quantity: 50,
        total_stock: 85,
        reserved_stock: 5,
        available_stock: 80,
        last_updated: new Date().toISOString(),
        locations: [
          {
            location_id: 'LOC-001',
            location_name: 'Main Warehouse',
            bin_location: 'A1-B2',
            quantity: 85,
            reserved_quantity: 5
          }
        ]
      }
    ];

    return products.find(p => p.barcode === barcode || p.sku === barcode);
  };

  const mockSearchProducts = (searchTerm: string): Product[] => {
    return [
      {
        id: 'PRD-002',
        sku: 'DEF456',
        name: 'USB Cable Type-C',
        description: '3-foot USB-C charging cable',
        category: 'Accessories',
        brand: 'ConnectCorp',
        barcode: '234567890123',
        unit_of_measure: 'Each',
        cost_price: 5.00,
        selling_price: 12.99,
        reorder_level: 20,
        reorder_quantity: 100,
        total_stock: 150,
        reserved_stock: 10,
        available_stock: 140,
        last_updated: new Date().toISOString(),
        locations: [
          {
            location_id: 'LOC-001',
            location_name: 'Main Warehouse',
            bin_location: 'B2-C3',
            quantity: 150,
            reserved_quantity: 10
          }
        ]
      }
    ];
  };

  // ==================== RENDER METHODS ====================

  const renderScanningStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          {getOperationIcon(operationType)}
          <h2 className="text-2xl font-bold">{getOperationTitle(operationType)}</h2>
        </div>
        <p className="text-muted-foreground">Scan product barcode or QR code</p>
      </div>

      {enableBatchMode && scannedProducts.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Scanned Products ({scannedProducts.length})</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep('batch')}
            >
              <Eye className="w-4 h-4 mr-1" />
              Review Batch
            </Button>
          </div>
          <div className="space-y-2">
            {scannedProducts.slice(-3).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <div>
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-sm text-muted-foreground">SKU: {item.product.sku}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">Qty: {item.quantity}</p>
                  <Badge variant="outline" className="text-xs">
                    {operationType === 'ship' ? '-' : '+'}{item.quantity}
                  </Badge>
                </div>
              </div>
            ))}
            {scannedProducts.length > 3 && (
              <p className="text-sm text-muted-foreground text-center">
                +{scannedProducts.length - 3} more items
              </p>
            )}
          </div>
        </Card>
      )}
      
      <div className="h-96 rounded-2xl overflow-hidden">
        <UniversalCameraInterface
          mode="barcode"
          onProcessed={handleBarcodeCapture}
          onError={handleScanError}
          autoProcess={true}
          enableAI={true}
        />
      </div>

      {enableBatchMode && scannedProducts.length > 0 && (
        <div className="flex justify-center">
          <Button onClick={handleBatchComplete} size="lg">
            Complete Batch ({scannedProducts.length} items)
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );

  const renderProductStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
        <p className="text-muted-foreground">
          Barcode: <code className="bg-muted px-2 py-1 rounded">{scanResult?.barcode}</code>
        </p>
      </div>

      {scanResult?.suggestions && scanResult.suggestions.length > 0 && (
        <div>
          <h3 className="font-semibold mb-4">Similar Products</h3>
          <div className="space-y-3">
            {scanResult.suggestions.map((product) => (
              <Card 
                key={product.id}
                className="p-4 cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-primary/20"
                onClick={() => handleProductSelection(product)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{product.name}</h4>
                    <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                    <p className="text-sm text-muted-foreground">Stock: {product.available_stock} available</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">${product.selling_price.toFixed(2)}</p>
                    <Badge 
                      variant={product.available_stock > product.reorder_level ? "default" : "destructive"}
                      className="mt-1"
                    >
                      {product.available_stock > product.reorder_level ? 'In Stock' : 'Low Stock'}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={() => setCurrentStep('scan')}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Scan Again
        </Button>
        <Button variant="outline">
          <Search className="w-4 h-4 mr-2" />
          Manual Search
        </Button>
      </div>
    </div>
  );

  const renderQuantityStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Set Quantity</h2>
        <p className="text-muted-foreground">Enter the quantity for this operation</p>
      </div>

      {selectedProduct && (
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">{selectedProduct.name}</h3>
              <p className="text-sm text-muted-foreground">SKU: {selectedProduct.sku}</p>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="outline">
                  Available: {selectedProduct.available_stock}
                </Badge>
                <Badge variant="outline">
                  Reserved: {selectedProduct.reserved_stock}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">${selectedProduct.selling_price.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">per {selectedProduct.unit_of_measure}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 text-center text-lg font-bold"
                  min="1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {operationType === 'ship' && quantity > selectedProduct.available_stock && (
                  <span className="text-red-600">⚠️ Quantity exceeds available stock</span>
                )}
              </p>
            </div>

            {(operationType === 'adjustment' || operationType === 'count') && (
              <div>
                <label className="block text-sm font-medium mb-2">Reason</label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="damaged">Damaged goods</SelectItem>
                    <SelectItem value="expired">Expired items</SelectItem>
                    <SelectItem value="lost">Lost inventory</SelectItem>
                    <SelectItem value="found">Found inventory</SelectItem>
                    <SelectItem value="count_correction">Count correction</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {operationType === 'transfer' && (
              <div>
                <label className="block text-sm font-medium mb-2">Transfer To Location</label>
                <Select value={transferToLocation} onValueChange={setTransferToLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOC-001">Main Warehouse</SelectItem>
                    <SelectItem value="LOC-002">Secondary Warehouse</SelectItem>
                    <SelectItem value="LOC-003">Retail Store</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2">Transaction Preview</h4>
            <div className="flex items-center justify-between">
              <span>{operationType === 'ship' ? 'Remove' : 'Add'} {quantity} {selectedProduct.unit_of_measure}</span>
              <Badge variant={operationType === 'ship' ? 'destructive' : 'default'}>
                {operationType === 'ship' ? '-' : '+'}{quantity}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              New stock level: {operationType === 'ship' 
                ? selectedProduct.available_stock - quantity 
                : selectedProduct.available_stock + quantity}
            </p>
          </div>
        </Card>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => setCurrentStep('scan')}>
          Back to Scan
        </Button>
        <Button 
          onClick={handleQuantityConfirm}
          disabled={operationType === 'ship' && quantity > (selectedProduct?.available_stock || 0)}
        >
          <Save className="w-4 h-4 mr-2" />
          {enableBatchMode ? 'Add to Batch' : 'Confirm'}
        </Button>
      </div>
    </div>
  );

  const renderBatchStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Review Batch</h2>
        <p className="text-muted-foreground">Review all scanned items before processing</p>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Batch Summary</h3>
          <Badge variant="default">{scannedProducts.length} Items</Badge>
        </div>
        <div className="space-y-3">
          {scannedProducts.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium">{item.product.name}</h4>
                <p className="text-sm text-muted-foreground">SKU: {item.product.sku}</p>
              </div>
              <div className="text-center mx-4">
                <p className="font-bold text-lg">{item.quantity}</p>
                <p className="text-xs text-muted-foreground">{item.product.unit_of_measure}</p>
              </div>
              <div className="text-right">
                <Badge variant={operationType === 'ship' ? 'destructive' : 'default'}>
                  {operationType === 'ship' ? '-' : '+'}{item.quantity}
                </Badge>
                {item.reason && (
                  <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total Items:</span>
            <span className="font-bold">{scannedProducts.reduce((sum, item) => sum + item.quantity, 0)}</span>
          </div>
        </div>
      </Card>

      {(operationType === 'receive' || operationType === 'transfer') && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Additional Information</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Reference Number</label>
              <Input
                placeholder="Purchase order, transfer order, etc."
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
          </div>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep('scan')}>
          Add More Items
        </Button>
        <Button onClick={handleBatchComplete} size="lg">
          Process Batch
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderCompletionStep = () => (
    <motion.div
      className="text-center space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-3xl font-bold text-green-700 mb-2">
          {getOperationTitle(operationType)} Complete!
        </h2>
        <p className="text-muted-foreground">
          {enableBatchMode 
            ? `${scannedProducts.length} items have been processed successfully`
            : 'Inventory operation completed successfully'
          }
        </p>
      </div>

      <Card className="p-6 max-w-md mx-auto">
        <div className="space-y-2">
          <p><strong>Operation:</strong> {getOperationTitle(operationType)}</p>
          <p><strong>Items Processed:</strong> {enableBatchMode ? scannedProducts.length : 1}</p>
          <p><strong>Total Quantity:</strong> {enableBatchMode 
            ? scannedProducts.reduce((sum, item) => sum + item.quantity, 0) 
            : quantity}</p>
          <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
        </div>
      </Card>

      <Button onClick={() => window.location.reload()}>
        Start New Operation
      </Button>
    </motion.div>
  );

  // ==================== MAIN RENDER ====================

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 'scan' && renderScanningStep()}
          {currentStep === 'product' && renderProductStep()}
          {currentStep === 'quantity' && renderQuantityStep()}
          {currentStep === 'batch' && renderBatchStep()}
          {currentStep === 'complete' && renderCompletionStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default InventoryScanningWorkflow;