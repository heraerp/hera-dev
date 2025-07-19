/**
 * HERA Universal - Purchase Order Edit Form
 * 
 * Professional edit form with theme-aware design
 */

'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PurchaseOrderEditFormProps {
  order: PurchaseOrder;
  organizationId: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  supplierId?: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  requestedDeliveryDate?: string;
  notes?: string;
  items: Array<{
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalPrice?: number;
    unit?: string;
  }>;
}

interface Supplier {
  id: string;
  name: string;
}

interface OrderItem {
  itemName: string;
  quantity: number;
  unitPrice: number;
  unit: string;
}

export function PurchaseOrderEditForm({ order, organizationId, onClose, onSuccess }: PurchaseOrderEditFormProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Check if this order has missing item data (older orders)
  const hasMissingItemData = !order.items || order.items.length === 0;
  const [formData, setFormData] = useState({
    supplierId: order.supplierId || '',
    notes: (order as any).notes || '',
    requestedDeliveryDate: order.requestedDeliveryDate || '',
    status: order.status
  });
  
  // Convert order items to editable format
  const [items, setItems] = useState<OrderItem[]>(() => {
    if (order.items && order.items.length > 0) {
      return order.items.map(item => ({
        itemName: item.itemName || '',
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        unit: item.unit || 'unit'
      }));
    }
    
    // If no items, create default items based on total amount
    // This handles cases where items data was lost but we have the total
    if (order.totalAmount > 0) {
      return [{
        itemName: 'Unknown Item (Please update)',
        quantity: 1,
        unitPrice: order.totalAmount,
        unit: 'unit'
      }];
    }
    
    // Fallback to empty item
    return [{ itemName: '', quantity: 1, unitPrice: 0, unit: 'unit' }];
  });

  // Fetch suppliers on component mount
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch(`/api/purchasing/suppliers?organizationId=${organizationId}`);
        if (response.ok) {
          const data = await response.json();
          setSuppliers(data.data || []);
          
          // If we don't already have a supplierId, try to find supplier by name
          if (!order.supplierId && order.supplierName && order.supplierName !== 'Unknown Supplier') {
            const currentSupplier = (data.data || []).find((s: Supplier) => s.name === order.supplierName);
            if (currentSupplier) {
              setFormData(prev => ({ ...prev, supplierId: currentSupplier.id }));
            }
          }
          
          // Validate that the current supplierId exists in the suppliers list
          if (order.supplierId) {
            const supplierExists = (data.data || []).find((s: Supplier) => s.id === order.supplierId);
            if (!supplierExists) {
              console.warn(`Supplier ID ${order.supplierId} not found in current suppliers list`);
              // Try to find by name as fallback
              const supplierByName = (data.data || []).find((s: Supplier) => s.name === order.supplierName);
              if (supplierByName) {
                setFormData(prev => ({ ...prev, supplierId: supplierByName.id }));
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    };

    fetchSuppliers();
  }, [organizationId, order.supplierName]);


  const addItem = () => {
    setItems([...items, { itemName: '', quantity: 1, unitPrice: 0, unit: 'unit' }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const updatedItems = items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setItems(updatedItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        id: order.id,
        supplierId: formData.supplierId,
        items: items.map(item => ({
          itemName: item.itemName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          unit: item.unit,
          totalPrice: item.quantity * item.unitPrice
        })),
        notes: formData.notes,
        requestedDeliveryDate: formData.requestedDeliveryDate,
        status: formData.status
      };

      const response = await fetch('/api/purchasing/purchase-orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        onSuccess();
      } else {
        console.error('Failed to update purchase order');
      }
    } catch (error) {
      console.error('Error updating purchase order:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Edit Purchase Order - {order.poNumber}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {hasMissingItemData && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex">
                <div className="text-yellow-400 mr-3">
                  ⚠️
                </div>
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Original Item Data Not Available
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    This purchase order was created before detailed item tracking. Please update the item information below.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  PO Number
                </label>
                <input
                  type="text"
                  value={order.poNumber}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Supplier *
                </label>
                <select
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending_approval">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="auto_approved">Auto Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Requested Delivery Date
              </label>
              <input
                type="date"
                value={formData.requestedDeliveryDate}
                onChange={(e) => setFormData({ ...formData, requestedDeliveryDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Items *
                </label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        placeholder="Item name"
                        value={item.itemName}
                        onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <input
                        type="number"
                        placeholder="Quantity"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        min="1"
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <input
                        type="text"
                        placeholder="Unit"
                        value={item.unit}
                        onChange={(e) => updateItem(index, 'unit', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <input
                        type="number"
                        placeholder="Unit Price"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Total: ${calculateTotal().toFixed(2)}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Additional notes or requirements..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}