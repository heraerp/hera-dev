/**
 * HERA Universal - Goods Receiving Form
 * 
 * Professional form for creating goods receipts
 * Integrates with purchase orders and inventory management
 * Following HERA Universal patterns with AI intelligence
 */

'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Minus, Camera, Scan, Package, Star, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import GoodsReceivingService, { CreateReceiptRequest, ReceiptLineItem } from '@/lib/services/goodsReceivingService';

interface GoodsReceivingFormProps {
  organizationId: string;
  onClose: () => void;
  onSuccess: (receiptNumber?: string) => void;
  purchaseOrderId?: string; // Optional PO integration
}

interface FormData extends Omit<CreateReceiptRequest, 'items'> {
  items: Array<Omit<ReceiptLineItem, 'id' | 'createdAt' | 'updatedAt'>>;
}

export function GoodsReceivingForm({ 
  organizationId, 
  onClose, 
  onSuccess, 
  purchaseOrderId 
}: GoodsReceivingFormProps) {
  const [formData, setFormData] = useState<FormData>({
    organizationId,
    supplierId: '',
    supplierName: '',
    purchaseOrderId: purchaseOrderId || '',
    deliveryDate: new Date().toISOString().split('T')[0],
    receivedBy: 'Restaurant Manager', // Default value for easier testing
    items: [],
    overallQualityRating: 5,
    deliveryRating: 5,
    packagingRating: 5,
    temperatureCompliant: true,
    documentsComplete: true,
    deliveryNotes: '',
    qualityInspectionNotes: '',
    imageUrls: [],
    receivingLocation: 'Main Warehouse'
  });

  const [suppliers, setSuppliers] = useState<Array<{ id: string; name: string }>>([]);
  const [availableItems, setAvailableItems] = useState<Array<{ id: string; name: string; unit: string; price: number }>>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<Array<{ id: string; poNumber: string; items: any[] }>>([]);
  const [selectedPO, setSelectedPO] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingPOs, setLoadingPOs] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch suppliers and items
  useEffect(() => {
    // Mock data - in real implementation, fetch from API
    setSuppliers([
      { id: 'sup-001', name: 'Fresh Foods Co.' },
      { id: 'sup-002', name: 'Quality Meats Ltd.' },
      { id: 'sup-003', name: 'Green Vegetables Inc.' }
    ]);

    setAvailableItems([
      { id: 'item-001', name: 'Tomatoes', unit: 'kg', price: 3.50 },
      { id: 'item-002', name: 'Chicken Breast', unit: 'kg', price: 12.99 },
      { id: 'item-003', name: 'Rice', unit: 'kg', price: 2.25 },
      { id: 'item-004', name: 'Onions', unit: 'kg', price: 1.80 }
    ]);
  }, []);

  // Fetch purchase orders when supplier is selected
  useEffect(() => {
    if (formData.supplierId) {
      fetchPurchaseOrdersBySupplier(formData.supplierId);
    } else {
      setPurchaseOrders([]);
      setSelectedPO('');
    }
  }, [formData.supplierId]);

  // Fetch purchase orders for selected supplier
  const fetchPurchaseOrdersBySupplier = async (supplierId: string) => {
    try {
      setLoadingPOs(true);
      
      const response = await fetch(
        `/api/purchasing/purchase-orders?organizationId=${organizationId}&supplierId=${supplierId}&forReceiving=true`
      );
      
      if (response.ok) {
        const data = await response.json();
        setPurchaseOrders(data.data || []);
      } else {
        console.error('Failed to fetch purchase orders');
        setPurchaseOrders([]);
      }
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      setPurchaseOrders([]);
    } finally {
      setLoadingPOs(false);
    }
  };

  // Handle PO selection - populate items from PO
  const handlePOSelection = (poId: string) => {
    setSelectedPO(poId);
    
    const selectedPurchaseOrder = purchaseOrders.find(po => po.id === poId);
    if (selectedPurchaseOrder && selectedPurchaseOrder.items) {
      // Update purchase order ID
      setFormData(prev => ({ ...prev, purchaseOrderId: poId }));
      
      // Populate items from PO
      const poItems = selectedPurchaseOrder.items.map((item: any) => ({
        itemId: item.itemId || '',
        itemName: item.itemName || item.name || '',
        expectedQuantity: item.quantity || 0,
        receivedQuantity: item.quantity || 0, // Default to expected quantity
        unitPrice: item.unitPrice || 0,
        unit: item.unit || 'units',
        qualityStatus: 'accepted' as const,
        storageLocation: 'Main Warehouse'
      }));
      
      setFormData(prev => ({ ...prev, items: poItems }));
    }
  };

  // Add new item to receipt
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          itemId: '',
          itemName: '',
          expectedQuantity: 0,
          receivedQuantity: 0,
          unitPrice: 0,
          unit: 'kg',
          qualityStatus: 'accepted',
          storageLocation: 'Main Warehouse'
        }
      ]
    }));
  };

  // Remove item from receipt
  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Update item data
  const updateItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // Update item when product is selected
  const selectItem = (index: number, itemId: string) => {
    const selectedItem = availableItems.find(item => item.id === itemId);
    if (selectedItem) {
      updateItem(index, 'itemId', itemId);
      updateItem(index, 'itemName', selectedItem.name);
      updateItem(index, 'unit', selectedItem.unit);
      updateItem(index, 'unitPrice', selectedItem.price);
    }
  };

  // Calculate total value
  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => 
      sum + (item.receivedQuantity * item.unitPrice), 0
    );
  };

  // Calculate overall quality score
  const calculateQualityScore = () => {
    return (formData.overallQualityRating + formData.deliveryRating + formData.packagingRating) / 3;
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.supplierId) newErrors.supplierId = 'Supplier is required';
    if (!formData.deliveryDate) newErrors.deliveryDate = 'Delivery date is required';
    if (!formData.receivedBy) newErrors.receivedBy = 'Received by is required';
    if (formData.items.length === 0) newErrors.items = 'At least one item is required';

    formData.items.forEach((item, index) => {
      if (!item.itemId) newErrors[`item-${index}-itemId`] = 'Item is required';
      if (item.receivedQuantity <= 0) newErrors[`item-${index}-receivedQuantity`] = 'Received quantity must be greater than 0';
      if (item.unitPrice <= 0) newErrors[`item-${index}-unitPrice`] = 'Unit price must be greater than 0';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await GoodsReceivingService.createGoodsReceipt(formData);
      
      if (result.success) {
        console.log('✅ Goods receipt created successfully:', result.data);
        onSuccess(result.data?.receiptNumber || 'GR-' + Date.now());
      } else {
        throw new Error(result.error || 'Failed to create goods receipt');
      }
      
    } catch (error) {
      console.error('❌ Error creating goods receipt:', error);
      // Show error to user (you could add a toast notification here)
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to create goods receipt'}`);
    } finally {
      setLoading(false);
    }
  };

  const getQualityStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'partial': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'damaged': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getQualityIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <X className="w-4 h-4" />;
      case 'partial': return <AlertTriangle className="w-4 h-4" />;
      case 'damaged': return <AlertTriangle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <Package className="w-6 h-6 mr-2 text-green-600" />
              Create Goods Receipt
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Record received items and quality inspection
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                📋 Receipt Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplier">Supplier *</Label>
                  <Select value={formData.supplierId} onValueChange={(value) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      supplierId: value,
                      supplierName: suppliers.find(s => s.id === value)?.name || ''
                    }));
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map(supplier => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.supplierId && <p className="text-sm text-red-600 mt-1">{errors.supplierId}</p>}
                </div>

                <div>
                  <Label htmlFor="purchaseOrder">Purchase Order (Optional)</Label>
                  <Select 
                    value={selectedPO} 
                    onValueChange={handlePOSelection}
                    disabled={!formData.supplierId || loadingPOs}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        loadingPOs ? "Loading purchase orders..." : 
                        !formData.supplierId ? "Select a supplier first" :
                        purchaseOrders.length === 0 ? "No open POs for this supplier" :
                        "Select a purchase order to auto-fill items"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {purchaseOrders.map(po => (
                        <SelectItem key={po.id} value={po.id}>
                          {po.poNumber} - {po.items?.length || 0} items
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedPO && (
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-green-600">
                        ✅ Items populated from PO {purchaseOrders.find(po => po.id === selectedPO)?.poNumber}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPO('');
                          setFormData(prev => ({ ...prev, purchaseOrderId: '', items: [] }));
                        }}
                        className="text-xs"
                      >
                        Clear PO
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="deliveryDate">Delivery Date *</Label>
                  <Input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: e.target.value }))}
                  />
                  {errors.deliveryDate && <p className="text-sm text-red-600 mt-1">{errors.deliveryDate}</p>}
                </div>

                <div>
                  <Label htmlFor="receivedBy">Received By *</Label>
                  <Input
                    placeholder="Enter receiver name"
                    value={formData.receivedBy}
                    onChange={(e) => setFormData(prev => ({ ...prev, receivedBy: e.target.value }))}
                  />
                  {errors.receivedBy && <p className="text-sm text-red-600 mt-1">{errors.receivedBy}</p>}
                </div>

                <div>
                  <Label htmlFor="receivingLocation">Receiving Location</Label>
                  <Input
                    placeholder="Storage location"
                    value={formData.receivingLocation}
                    onChange={(e) => setFormData(prev => ({ ...prev, receivingLocation: e.target.value }))}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="temperatureCompliant"
                    checked={formData.temperatureCompliant}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, temperatureCompliant: !!checked }))}
                  />
                  <Label htmlFor="temperatureCompliant">Temperature Compliant</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="documentsComplete"
                    checked={formData.documentsComplete}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, documentsComplete: !!checked }))}
                  />
                  <Label htmlFor="documentsComplete">Documents Complete</Label>
                </div>
              </div>
            </Card>

            {/* Quality Ratings */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                Quality Assessment
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="overallQuality">Overall Quality (1-5)</Label>
                  <Select value={formData.overallQualityRating.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, overallQualityRating: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(rating => (
                        <SelectItem key={rating} value={rating.toString()}>
                          {'★'.repeat(rating)} {rating}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="deliveryRating">Delivery Rating (1-5)</Label>
                  <Select value={formData.deliveryRating.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, deliveryRating: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(rating => (
                        <SelectItem key={rating} value={rating.toString()}>
                          {'★'.repeat(rating)} {rating}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="packagingRating">Packaging Rating (1-5)</Label>
                  <Select value={formData.packagingRating.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, packagingRating: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(rating => (
                        <SelectItem key={rating} value={rating.toString()}>
                          {'★'.repeat(rating)} {rating}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  🎯 <strong>Overall Quality Score: {calculateQualityScore().toFixed(1)}/5</strong>
                </p>
              </div>
            </Card>

            {/* Items */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Received Items
                  {selectedPO && (
                    <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200">
                      From PO
                    </Badge>
                  )}
                </h3>
                <Button type="button" onClick={addItem} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {errors.items && <p className="text-sm text-red-600 mb-4">{errors.items}</p>}

              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div className="md:col-span-2">
                        <Label>Item *</Label>
                        {selectedPO && item.itemName ? (
                          <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700">
                            <p className="text-sm font-medium">{item.itemName}</p>
                            <p className="text-xs text-gray-500">From PO • ${item.unitPrice}/{item.unit}</p>
                          </div>
                        ) : (
                          <Select 
                            value={item.itemId} 
                            onValueChange={(value) => selectItem(index, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select item" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableItems.map(availableItem => (
                                <SelectItem key={availableItem.id} value={availableItem.id}>
                                  {availableItem.name} - ${availableItem.price}/{availableItem.unit}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        {errors[`item-${index}-itemId`] && <p className="text-sm text-red-600 mt-1">{errors[`item-${index}-itemId`]}</p>}
                      </div>

                      <div>
                        <Label>Expected Qty</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={item.expectedQuantity}
                          onChange={(e) => updateItem(index, 'expectedQuantity', parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      <div>
                        <Label>Received Qty *</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={item.receivedQuantity}
                          onChange={(e) => updateItem(index, 'receivedQuantity', parseFloat(e.target.value) || 0)}
                          className={
                            item.expectedQuantity > 0 && item.receivedQuantity !== item.expectedQuantity
                              ? 'border-amber-500 focus:ring-amber-500'
                              : ''
                          }
                        />
                        {item.expectedQuantity > 0 && item.receivedQuantity !== item.expectedQuantity && (
                          <p className="text-xs text-amber-600 mt-1">
                            ⚠️ Variance: {((item.receivedQuantity - item.expectedQuantity) / item.expectedQuantity * 100).toFixed(1)}%
                          </p>
                        )}
                        {errors[`item-${index}-receivedQuantity`] && <p className="text-sm text-red-600 mt-1">{errors[`item-${index}-receivedQuantity`]}</p>}
                      </div>

                      <div>
                        <Label>Quality Status</Label>
                        <Select 
                          value={item.qualityStatus} 
                          onValueChange={(value) => updateItem(index, 'qualityStatus', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="accepted">✅ Accepted</SelectItem>
                            <SelectItem value="partial">⚠️ Partial</SelectItem>
                            <SelectItem value="damaged">🔶 Damaged</SelectItem>
                            <SelectItem value="rejected">❌ Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <Label>Storage Location</Label>
                        <Input
                          placeholder="Storage location"
                          value={item.storageLocation}
                          onChange={(e) => updateItem(index, 'storageLocation', e.target.value)}
                        />
                      </div>

                      <div>
                        <Label>Batch Number</Label>
                        <Input
                          placeholder="Batch/Lot number"
                          value={item.batchNumber || ''}
                          onChange={(e) => updateItem(index, 'batchNumber', e.target.value)}
                        />
                      </div>

                      <div>
                        <Label>Expiry Date</Label>
                        <Input
                          type="date"
                          value={item.expiryDate || ''}
                          onChange={(e) => updateItem(index, 'expiryDate', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <Badge className={getQualityStatusColor(item.qualityStatus)}>
                        {getQualityIcon(item.qualityStatus)}
                        <span className="ml-1">{item.qualityStatus}</span>
                      </Badge>
                      
                      <div className="text-sm font-medium">
                        Total: ${(item.receivedQuantity * item.unitPrice).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {formData.items.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Total Receipt Value:</span>
                    <span className="text-xl font-bold text-green-600">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </Card>

            {/* Notes */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                📝 Additional Notes
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deliveryNotes">Delivery Notes</Label>
                  <Textarea
                    placeholder="Notes about the delivery..."
                    value={formData.deliveryNotes}
                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryNotes: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="qualityNotes">Quality Inspection Notes</Label>
                  <Textarea
                    placeholder="Quality inspection observations..."
                    value={formData.qualityInspectionNotes}
                    onChange={(e) => setFormData(prev => ({ ...prev, qualityInspectionNotes: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
            </Card>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            💡 All fields marked with * are required
          </div>
          
          <div className="flex items-center space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleSubmit}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Creating...' : 'Create Receipt'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}