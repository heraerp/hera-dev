/**
 * HERA Universal - Inventory Item Form
 * 
 * Professional form with theme-aware design
 * Matches the style of PurchaseOrderForm for consistency
 */

'use client';

import { useState } from 'react';
import { X, Package, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InventoryItemFormProps {
  organizationId: string;
  onClose: () => void;
  onSuccess: (itemName?: string) => void;
}

interface InventoryItemData {
  name: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  reorderPoint: number;
  maxStockLevel: number;
  unitOfMeasure: string;
  shelfLifeDays: number;
  storageRequirements: string;
  description: string;
  sku: string;
}

const CATEGORY_OPTIONS = [
  'raw_materials',
  'ingredients',
  'packaging',
  'cleaning_supplies',
  'office_supplies',
  'equipment',
  'beverages',
  'dry_goods',
  'frozen',
  'refrigerated',
  'other'
];

const UNIT_OPTIONS = [
  'unit',
  'kg',
  'lb',
  'g',
  'oz',
  'liter',
  'gallon',
  'ml',
  'cup',
  'piece',
  'box',
  'case',
  'bag',
  'bottle'
];

const STORAGE_OPTIONS = [
  'room_temperature',
  'refrigerated',
  'frozen',
  'dry_storage',
  'cool_storage',
  'climate_controlled'
];

export function InventoryItemForm({ organizationId, onClose, onSuccess }: InventoryItemFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{show: boolean, itemName: string} | null>(null);
  const [formData, setFormData] = useState<InventoryItemData>({
    name: '',
    category: 'raw_materials',
    unitPrice: 0,
    currentStock: 0,
    reorderPoint: 10,
    maxStockLevel: 100,
    unitOfMeasure: 'unit',
    shelfLifeDays: 0,
    storageRequirements: 'room_temperature',
    description: '',
    sku: ''
  });

  const handleInputChange = (field: keyof InventoryItemData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const itemData = {
        organizationId,
        name: formData.name,
        category: formData.category,
        unitPrice: formData.unitPrice,
        currentStock: formData.currentStock,
        reorderPoint: formData.reorderPoint,
        maxStockLevel: formData.maxStockLevel,
        unitOfMeasure: formData.unitOfMeasure,
        shelfLifeDays: formData.shelfLifeDays,
        storageRequirements: formData.storageRequirements,
        description: formData.description,
        sku: formData.sku || undefined
      };

      const response = await fetch('/api/inventory/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData)
      });

      if (response.ok) {
        const result = await response.json();
        const itemName = result.data?.name || formData.name;
        
        // Show success message
        setSuccess({ show: true, itemName });
        
        // Auto-close after 3 seconds and call onSuccess
        setTimeout(() => {
          onSuccess(itemName);
        }, 3000);
      } else {
        const errorData = await response.json();
        console.error('Failed to create inventory item:', errorData);
        alert('Failed to create inventory item. Please try again.');
      }
    } catch (error) {
      console.error('Error creating inventory item:', error);
      alert('Error creating inventory item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show success message if item was created
  if (success?.show) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Inventory Item Created!
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your inventory item has been successfully added.
          </p>
          
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-700 dark:text-green-300 font-medium">
              Item Name
            </p>
            <p className="text-lg font-bold text-green-800 dark:text-green-200">
              {success.itemName}
            </p>
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Closing automatically in 3 seconds...
          </div>
          
          <Button 
            onClick={() => onSuccess(success.itemName)} 
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
            <Package className="w-5 h-5 mr-2 text-orange-600" />
            Add Inventory Item
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
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter item name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SKU (Optional)
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Auto-generated if empty"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {CATEGORY_OPTIONS.map((category) => (
                    <option key={category} value={category}>
                      {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Unit of Measure
                </label>
                <select
                  value={formData.unitOfMeasure}
                  onChange={(e) => handleInputChange('unitOfMeasure', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {UNIT_OPTIONS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pricing and Stock */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Unit Price ($)
                </label>
                <input
                  type="number"
                  value={formData.unitPrice}
                  onChange={(e) => handleInputChange('unitPrice', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Stock
                </label>
                <input
                  type="number"
                  value={formData.currentStock}
                  onChange={(e) => handleInputChange('currentStock', parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reorder Point
                </label>
                <input
                  type="number"
                  value={formData.reorderPoint}
                  onChange={(e) => handleInputChange('reorderPoint', parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Stock Level
                </label>
                <input
                  type="number"
                  value={formData.maxStockLevel}
                  onChange={(e) => handleInputChange('maxStockLevel', parseInt(e.target.value) || 0)}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Shelf Life (Days)
                </label>
                <input
                  type="number"
                  value={formData.shelfLifeDays}
                  onChange={(e) => handleInputChange('shelfLifeDays', parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0 = No expiry"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Storage Requirements
                </label>
                <select
                  value={formData.storageRequirements}
                  onChange={(e) => handleInputChange('storageRequirements', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {STORAGE_OPTIONS.map((storage) => (
                    <option key={storage} value={storage}>
                      {storage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter item description, specifications, or notes..."
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
              Create Inventory Item
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}