'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Utensils, Save, Loader2, Plus, Trash2, Calculator } from 'lucide-react';
import { ImageUpload } from '@/components/ui/ImageUpload';

/**
 * Menu Item Form Component
 * 
 * Following the same patterns as Purchase Orders forms:
 * - Modal overlay with professional styling
 * - Support for individual and composite/combo items
 * - Real-time profit margin calculation
 * - Component management for combo items
 * - Italian restaurant specific features
 */

interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  color?: string;
  icon?: string;
  isActive: boolean;
  itemCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  costPrice: number;
  categoryId?: string;
  categoryName?: string;
  prepTimeMinutes: number;
  isAvailable: boolean;
  itemType: 'individual' | 'composite';
  profitMargin?: number;
  components?: ComboComponent[];
  nutritionalInfo?: any;
  allergens?: string[];
  imageUrl?: string;
  imageName?: string;
  createdAt: string;
  updatedAt: string;
}

interface ComboComponent {
  itemId: string;
  itemName: string;
  portionSize: number;
  quantity: number;
  sequenceOrder: number;
  isMandatory: boolean;
}

interface MenuItemFormProps {
  organizationId: string;
  categories: MenuCategory[];
  existingItems: MenuItem[];
  item?: MenuItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

// Common allergens for Italian cuisine
const COMMON_ALLERGENS = [
  'Gluten', 'Dairy', 'Eggs', 'Nuts', 'Shellfish', 'Fish', 'Soy', 'Sesame'
];

export const MenuItemForm: React.FC<MenuItemFormProps> = ({
  organizationId,
  categories,
  existingItems,
  item,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: 0,
    costPrice: 0,
    categoryId: '',
    prepTimeMinutes: 15,
    isAvailable: true,
    itemType: 'individual' as 'individual' | 'composite',
    allergens: [] as string[],
    nutritionalInfo: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    },
    imageUrl: '',
    imageName: ''
  });

  const [components, setComponents] = useState<ComboComponent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!item;

  // Calculate profit margin in real-time
  const profitMargin = formData.basePrice > 0 ? 
    Math.round(((formData.basePrice - formData.costPrice) / formData.basePrice) * 100 * 100) / 100 : 0;

  // Populate form data if editing
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description,
        basePrice: item.basePrice,
        costPrice: item.costPrice,
        categoryId: item.categoryId || '',
        prepTimeMinutes: item.prepTimeMinutes,
        isAvailable: item.isAvailable,
        itemType: item.itemType,
        allergens: item.allergens || [],
        nutritionalInfo: item.nutritionalInfo || {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        },
        imageUrl: item.imageUrl || '',
        imageName: item.imageName || ''
      });

      setComponents(item.components || []);
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.name.trim()) {
        throw new Error('Item name is required');
      }
      if (!formData.categoryId) {
        throw new Error('Please select a category');
      }
      if (formData.basePrice <= 0) {
        throw new Error('Price must be greater than 0');
      }
      if (formData.costPrice < 0) {
        throw new Error('Cost cannot be negative');
      }
      if (formData.itemType === 'composite' && components.length === 0) {
        throw new Error('Combo items must have at least one component');
      }

      // Prepare request data
      const requestData = {
        organizationId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        basePrice: formData.basePrice,
        costPrice: formData.costPrice,
        categoryId: formData.categoryId,
        prepTimeMinutes: formData.prepTimeMinutes,
        isAvailable: formData.isAvailable,
        itemType: formData.itemType,
        allergens: formData.allergens,
        nutritionalInfo: formData.nutritionalInfo,
        imageUrl: formData.imageUrl,
        imageName: formData.imageName,
        ...(formData.itemType === 'composite' && { components }),
        ...(isEditing && { id: item!.id })
      };

      // Make API request
      const url = '/api/menu/items';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'create'} menu item`);
      }

      const result = await response.json();
      console.log(`✅ Menu item ${isEditing ? 'updated' : 'created'}:`, result);
      
      onSuccess();
    } catch (err) {
      console.error('Menu item form error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNutritionalChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      nutritionalInfo: {
        ...prev.nutritionalInfo,
        [field]: value
      }
    }));
  };

  const handleAllergenToggle = (allergen: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }));
  };

  const addComponent = () => {
    const newComponent: ComboComponent = {
      itemId: '',
      itemName: '',
      portionSize: 1.0,
      quantity: 1,
      sequenceOrder: components.length + 1,
      isMandatory: true
    };
    setComponents([...components, newComponent]);
  };

  const updateComponent = (index: number, field: keyof ComboComponent, value: any) => {
    const updatedComponents = [...components];
    updatedComponents[index] = {
      ...updatedComponents[index],
      [field]: value
    };
    setComponents(updatedComponents);
  };

  const removeComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  // Filter available items for combo components (exclude the current item being edited and already selected items)
  const getAvailableItemsForComponent = (currentComponentIndex: number) => {
    const selectedItemIds = components
      .filter((_, index) => index !== currentComponentIndex)
      .map(comp => comp.itemId)
      .filter(id => id !== '');
    
    return existingItems.filter(existingItem => 
      existingItem.itemType === 'individual' && 
      (!isEditing || existingItem.id !== item?.id) &&
      !selectedItemIds.includes(existingItem.id)
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center text-lg">
              <Utensils className="mr-2 h-5 w-5 text-orange-600" />
              {isEditing ? 'Edit Menu Item' : 'Add New Menu Item'}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Basic Information */}
                <div className="space-y-6">
                  {/* Item Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Item Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Margherita Pizza, Chicken Parmigiana"
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe the ingredients, preparation, or special features"
                      rows={3}
                      disabled={loading}
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Category *
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => handleInputChange('categoryId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                      disabled={loading}
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Item Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Item Type
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="individual"
                          checked={formData.itemType === 'individual'}
                          onChange={(e) => handleInputChange('itemType', e.target.value)}
                          className="mr-2"
                          disabled={loading}
                        />
                        Individual Item
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="composite"
                          checked={formData.itemType === 'composite'}
                          onChange={(e) => handleInputChange('itemType', e.target.value)}
                          className="mr-2"
                          disabled={loading}
                        />
                        Combo/Composite Item
                      </label>
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Menu Item Image
                    </label>
                    <ImageUpload
                      value={formData.imageUrl}
                      onChange={(imageUrl, imageName) => {
                        handleInputChange('imageUrl', imageUrl);
                        handleInputChange('imageName', imageName);
                      }}
                      onRemove={() => {
                        handleInputChange('imageUrl', '');
                        handleInputChange('imageName', '');
                      }}
                      organizationId={organizationId}
                      disabled={loading}
                      placeholder="Upload appetizing menu item photo"
                    />
                  </div>

                  {/* Allergens */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Allergens
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_ALLERGENS.map(allergen => (
                        <button
                          key={allergen}
                          type="button"
                          onClick={() => handleAllergenToggle(allergen)}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            formData.allergens.includes(allergen)
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                          }`}
                          disabled={loading}
                        >
                          {allergen}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column - Pricing & Details */}
                <div className="space-y-6">
                  {/* Pricing */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Menu Price * ($)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.basePrice || ''}
                        onChange={(e) => handleInputChange('basePrice', parseFloat(e.target.value) || 0)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Cost Price ($)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.costPrice || ''}
                        onChange={(e) => handleInputChange('costPrice', parseFloat(e.target.value) || 0)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Profit Margin Display */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Profit Margin
                      </span>
                      <Badge 
                        variant={profitMargin > 20 ? "default" : profitMargin > 10 ? "secondary" : "destructive"}
                        className="ml-2"
                      >
                        {profitMargin.toFixed(1)}%
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Profit: ${Math.max(0, formData.basePrice - formData.costPrice).toFixed(2)}
                    </p>
                  </div>

                  {/* Preparation Time */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Preparation Time (minutes)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="120"
                      value={formData.prepTimeMinutes}
                      onChange={(e) => handleInputChange('prepTimeMinutes', parseInt(e.target.value) || 15)}
                      disabled={loading}
                    />
                  </div>

                  {/* Availability */}
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isAvailable}
                        onChange={(e) => handleInputChange('isAvailable', e.target.checked)}
                        className="mr-2"
                        disabled={loading}
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Available for ordering
                      </span>
                    </label>
                  </div>

                  {/* Nutritional Information */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nutritional Information (optional)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">Calories</label>
                        <Input
                          type="number"
                          min="0"
                          value={formData.nutritionalInfo.calories || ''}
                          onChange={(e) => handleNutritionalChange('calories', parseInt(e.target.value) || 0)}
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">Protein (g)</label>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={formData.nutritionalInfo.protein || ''}
                          onChange={(e) => handleNutritionalChange('protein', parseFloat(e.target.value) || 0)}
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">Carbs (g)</label>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={formData.nutritionalInfo.carbs || ''}
                          onChange={(e) => handleNutritionalChange('carbs', parseFloat(e.target.value) || 0)}
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">Fat (g)</label>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={formData.nutritionalInfo.fat || ''}
                          onChange={(e) => handleNutritionalChange('fat', parseFloat(e.target.value) || 0)}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Combo Components Section */}
              {formData.itemType === 'composite' && (
                <div className="space-y-4 border-t pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Combo Components
                      </h3>
                      {components.length > 0 && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {components.filter(c => c.itemId).length} of {components.length} components selected
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      onClick={addComponent}
                      variant="outline"
                      size="sm"
                      disabled={loading}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Component
                    </Button>
                  </div>

                  {components.map((component, index) => (
                    <Card key={index} className="border border-gray-200 dark:border-gray-700">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          <div className="md:col-span-2">
                            <label className="text-xs text-gray-600 dark:text-gray-400">
                              Menu Item
                              {component.itemId && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                  ✓ Selected
                                </span>
                              )}
                            </label>
                            <select
                              value={component.itemId}
                              onChange={(e) => {
                                const selectedId = e.target.value;
                                // Find the item in all available items (not filtered) to get the name
                                const selectedItem = existingItems.find(item => item.id === selectedId);
                                updateComponent(index, 'itemId', selectedId);
                                updateComponent(index, 'itemName', selectedItem?.name || '');
                              }}
                              className={`w-full px-3 py-2 border rounded-md text-sm ${
                                component.itemId 
                                  ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20' 
                                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                              } text-gray-900 dark:text-gray-100`}
                              disabled={loading}
                            >
                              <option value="">Select item...</option>
                              {getAvailableItemsForComponent(index).map(item => (
                                <option key={item.id} value={item.id}>
                                  {item.name} - ${item.basePrice.toFixed(2)}
                                </option>
                              ))}
                              {/* Show currently selected item even if it would normally be filtered out */}
                              {component.itemId && !getAvailableItemsForComponent(index).find(item => item.id === component.itemId) && (
                                <option key={component.itemId} value={component.itemId}>
                                  ✓ {component.itemName || 'Selected Item'} - (Currently Selected)
                                </option>
                              )}
                            </select>
                            {getAvailableItemsForComponent(index).length === 0 && !component.itemId && (
                              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                ⚠ All available items are already selected in other components
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="text-xs text-gray-600 dark:text-gray-400">Portion Size</label>
                            <Input
                              type="number"
                              step="0.1"
                              min="0.1"
                              max="3.0"
                              value={component.portionSize}
                              onChange={(e) => updateComponent(index, 'portionSize', parseFloat(e.target.value) || 1.0)}
                              disabled={loading}
                            />
                          </div>

                          <div>
                            <label className="text-xs text-gray-600 dark:text-gray-400">Quantity</label>
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              value={component.quantity}
                              onChange={(e) => updateComponent(index, 'quantity', parseInt(e.target.value) || 1)}
                              disabled={loading}
                            />
                          </div>

                          <div className="flex items-end space-x-2">
                            <label className="flex items-center text-xs">
                              <input
                                type="checkbox"
                                checked={component.isMandatory}
                                onChange={(e) => updateComponent(index, 'isMandatory', e.target.checked)}
                                className="mr-1"
                                disabled={loading}
                              />
                              Required
                            </label>
                            <Button
                              type="button"
                              onClick={() => removeComponent(index)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              disabled={loading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {components.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Calculator className="mx-auto h-8 w-8 mb-2" />
                      <p>Add components to create a combo meal</p>
                    </div>
                  )}
                </div>
              )}

              {/* Form Actions */}
              <div className="flex space-x-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !formData.name.trim() || !formData.categoryId}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditing ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {isEditing ? 'Update Menu Item' : 'Create Menu Item'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};