/**
 * HERA Universal - Goods Receipt Form
 * 
 * Mario's Restaurant Goods Receipt & Quality Control
 * Professional form with comprehensive quality inspection features
 */

'use client';

import { useState, useEffect } from 'react';
import { X, Package, CheckCircle, Thermometer, Eye, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface GoodsReceiptFormProps {
  organizationId: string;
  poId: string;
  poNumber: string;
  onClose: () => void;
  onSuccess: (grNumber?: string) => void;
}

interface ReceiptItem {
  itemName: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unitPrice: number;
  unit: string;
  condition: 'good' | 'damaged' | 'expired' | 'rejected';
  qualityNotes?: string;
}

interface QualityInspection {
  temperatureCheck: 'passed' | 'failed' | 'not_applicable';
  packagingCondition: 'good' | 'damaged' | 'poor';
  visualInspection: 'passed' | 'failed' | 'conditional';
  freshness: 'excellent' | 'good' | 'acceptable' | 'poor' | 'rejected';
  overallRating: number;
  inspectorNotes: string;
  inspectorName: string;
  inspectionDate: string;
}

export function GoodsReceiptForm({ organizationId, poId, poNumber, onClose, onSuccess }: GoodsReceiptFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{show: boolean, grNumber: string} | null>(null);
  const [poData, setPOData] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    receivedBy: '00000001-0000-0000-0000-000000000002', // Chef Mario
    receivedByName: 'Chef Mario',
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryStatus: 'complete' as 'complete' | 'partial' | 'damaged' | 'rejected',
    qualityStatus: 'approved' as 'approved' | 'rejected' | 'conditional',
    notes: ''
  });

  const [items, setItems] = useState<ReceiptItem[]>([]);
  
  const [qualityInspection, setQualityInspection] = useState<QualityInspection>({
    temperatureCheck: 'not_applicable',
    packagingCondition: 'good',
    visualInspection: 'passed',
    freshness: 'good',
    overallRating: 4,
    inspectorNotes: '',
    inspectorName: 'Chef Mario',
    inspectionDate: new Date().toISOString()
  });

  // Load PO data
  useEffect(() => {
    const loadPOData = async () => {
      try {
        const response = await fetch(`/api/purchasing/purchase-orders?organizationId=${organizationId}&poId=${poId}`);
        if (response.ok) {
          const data = await response.json();
          const po = data.data?.[0];
          if (po) {
            setPOData(po);
            // Initialize items from PO
            const initialItems = (po.items || []).map((item: any) => ({
              itemName: item.itemName || item.productName,
              orderedQuantity: item.quantity,
              receivedQuantity: item.quantity, // Default to full delivery
              unitPrice: item.unitPrice,
              unit: item.unit || 'unit',
              condition: 'good' as const,
              qualityNotes: ''
            }));
            setItems(initialItems);
          }
        }
      } catch (error) {
        console.error('Error loading PO data:', error);
      }
    };

    loadPOData();
  }, [organizationId, poId]);

  const updateItem = (index: number, field: keyof ReceiptItem, value: any) => {
    const updatedItems = items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setItems(updatedItems);

    // Auto-update delivery and quality status based on items
    updateFormStatusFromItems(updatedItems);
  };

  const updateFormStatusFromItems = (currentItems: ReceiptItem[]) => {
    const totalOrdered = currentItems.reduce((sum, item) => sum + item.orderedQuantity, 0);
    const totalReceived = currentItems.reduce((sum, item) => sum + item.receivedQuantity, 0);
    const damagedItems = currentItems.filter(item => item.condition === 'damaged' || item.condition === 'rejected');
    const goodItems = currentItems.filter(item => item.condition === 'good');

    // Determine delivery status
    let deliveryStatus: 'complete' | 'partial' | 'damaged' | 'rejected' = 'complete';
    if (totalReceived === 0) {
      deliveryStatus = 'rejected';
    } else if (totalReceived < totalOrdered) {
      deliveryStatus = 'partial';
    } else if (damagedItems.length > 0) {
      deliveryStatus = 'damaged';
    }

    // Determine quality status
    let qualityStatus: 'approved' | 'rejected' | 'conditional' = 'approved';
    if (goodItems.length === 0) {
      qualityStatus = 'rejected';
    } else if (damagedItems.length > 0) {
      qualityStatus = 'conditional';
    }

    setFormData(prev => ({
      ...prev,
      deliveryStatus,
      qualityStatus
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const receiptData = {
        organizationId,
        poId,
        receivedBy: formData.receivedBy,
        receivedByName: formData.receivedByName,
        deliveryDate: formData.deliveryDate,
        deliveryStatus: formData.deliveryStatus,
        qualityStatus: formData.qualityStatus,
        items,
        qualityInspection,
        notes: formData.notes
      };

      const response = await fetch('/api/purchasing/goods-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(receiptData)
      });

      if (response.ok) {
        const result = await response.json();
        const grNumber = result.data?.grNumber || 'Unknown';
        
        setSuccess({ show: true, grNumber });
        
        setTimeout(() => {
          onSuccess(grNumber);
        }, 3000);
      } else {
        const errorData = await response.json();
        console.error('Failed to create goods receipt:', errorData);
        alert('Failed to create goods receipt. Please try again.');
      }
    } catch (error) {
      console.error('Error creating goods receipt:', error);
      alert('Error creating goods receipt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show success message
  if (success?.show) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Goods Receipt Created!
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Delivery has been successfully processed and quality checked.
          </p>
          
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-700 dark:text-green-300 font-medium">
              Goods Receipt Number
            </p>
            <p className="text-lg font-bold text-green-800 dark:text-green-200">
              {success.grNumber}
            </p>
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Closing automatically in 3 seconds...
          </div>
          
          <Button 
            onClick={() => onSuccess(success.grNumber)} 
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            Close
          </Button>
        </div>
      </div>
    );
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'good': return 'bg-green-100 text-green-800 border-green-200';
      case 'damaged': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getQualityColor = (status: string) => {
    switch (status) {
      case 'passed': case 'excellent': case 'good': return 'text-green-600';
      case 'acceptable': case 'conditional': return 'text-yellow-600';
      case 'failed': case 'poor': case 'rejected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
            <Package className="w-5 h-5 mr-2 text-orange-600" />
            Goods Receipt - {poNumber}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-8">
            {/* Delivery Information */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Delivery Information
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Delivery Date *
                  </label>
                  <input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Received By
                  </label>
                  <input
                    type="text"
                    value={formData.receivedByName}
                    onChange={(e) => setFormData({ ...formData, receivedByName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Delivery Status
                    </label>
                    <Badge className={getConditionColor(formData.deliveryStatus)}>
                      {formData.deliveryStatus}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quality Status
                    </label>
                    <Badge className={getConditionColor(formData.qualityStatus)}>
                      {formData.qualityStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Received */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Items Received
              </h4>
              
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Item Name
                        </label>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{item.itemName}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Ordered
                        </label>
                        <p className="text-gray-600 dark:text-gray-400">{item.orderedQuantity} {item.unit}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Received *
                        </label>
                        <input
                          type="number"
                          value={item.receivedQuantity}
                          onChange={(e) => updateItem(index, 'receivedQuantity', parseInt(e.target.value) || 0)}
                          min="0"
                          max={item.orderedQuantity}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Condition *
                        </label>
                        <select
                          value={item.condition}
                          onChange={(e) => updateItem(index, 'condition', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="good">Good</option>
                          <option value="damaged">Damaged</option>
                          <option value="expired">Expired</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Quality Notes
                        </label>
                        <input
                          type="text"
                          value={item.qualityNotes || ''}
                          onChange={(e) => updateItem(index, 'qualityNotes', e.target.value)}
                          placeholder="Optional notes"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality Inspection */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Quality Inspection
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Temperature Check
                  </label>
                  <select
                    value={qualityInspection.temperatureCheck}
                    onChange={(e) => setQualityInspection({ ...qualityInspection, temperatureCheck: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="passed">Passed</option>
                    <option value="failed">Failed</option>
                    <option value="not_applicable">N/A</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Packaging Condition
                  </label>
                  <select
                    value={qualityInspection.packagingCondition}
                    onChange={(e) => setQualityInspection({ ...qualityInspection, packagingCondition: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="good">Good</option>
                    <option value="damaged">Damaged</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Visual Inspection
                  </label>
                  <select
                    value={qualityInspection.visualInspection}
                    onChange={(e) => setQualityInspection({ ...qualityInspection, visualInspection: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="passed">Passed</option>
                    <option value="failed">Failed</option>
                    <option value="conditional">Conditional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Freshness Rating
                  </label>
                  <select
                    value={qualityInspection.freshness}
                    onChange={(e) => setQualityInspection({ ...qualityInspection, freshness: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="acceptable">Acceptable</option>
                    <option value="poor">Poor</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Overall Rating (1-5)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={qualityInspection.overallRating}
                    onChange={(e) => setQualityInspection({ ...qualityInspection, overallRating: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>1 (Poor)</span>
                    <span className="font-medium">{qualityInspection.overallRating}</span>
                    <span>5 (Excellent)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Inspector Notes
                  </label>
                  <textarea
                    rows={3}
                    value={qualityInspection.inspectorNotes}
                    onChange={(e) => setQualityInspection({ ...qualityInspection, inspectorNotes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Quality inspection notes..."
                  />
                </div>
              </div>
            </div>

            {/* Delivery Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Delivery Notes
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Additional delivery or quality notes..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={loading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Process Goods Receipt
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}