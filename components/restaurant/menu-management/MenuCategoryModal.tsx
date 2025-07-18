/**
 * Menu Category Modal - Toyota Production System Implementation
 * Standardized category creation/editing with built-in validation
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MenuCategory, 
  MenuManagementService 
} from '@/lib/services/menuManagementService';
import {
  X,
  Save,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Image,
  Grid3x3,
  Coffee,
  Pizza,
  Salad,
  Soup,
  Dessert as DessertIcon,
  Wine,
  Sandwich,
  Utensils,
  ChefHat,
  Star
} from 'lucide-react';

interface MenuCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  category?: MenuCategory;
  mode: 'create' | 'edit';
  menuService: MenuManagementService;
}

export default function MenuCategoryModal({
  open,
  onClose,
  onSave,
  category,
  mode,
  menuService
}: MenuCategoryModalProps) {
  const [formData, setFormData] = useState<MenuCategory>({
    name: '',
    entity_name: '',
    description: '',
    display_order: 0,
    is_active: true,
    icon: '',
    image_url: '',
    available_times: [],
    parent_category_id: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  // Available times options
  const availableTimesOptions = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'late_night', label: 'Late Night' },
    { value: 'all_day', label: 'All Day' }
  ];

  // Initialize form data
  useEffect(() => {
    if (category && mode === 'edit') {
      setFormData({
        ...category,
        available_times: category.available_times || []
      });
    } else {
      setFormData({
        name: '',
        entity_name: '',
        description: '',
        display_order: 0,
        is_active: true,
        icon: '',
        image_url: '',
        available_times: [],
        parent_category_id: ''
      });
    }
    setError(null);
    setSuccess(null);
  }, [category, mode, open]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('📝 Processing category form submission...');
      
      if (mode === 'create') {
        // For create, ensure we have required fields
        const categoryData = {
          ...formData,
          name: formData.name || '',
          display_order: formData.display_order || 0,
          is_active: formData.is_active !== undefined ? formData.is_active : true
        };
        const result = await menuService.createCategory(categoryData);
        if (result.success) {
          setSuccess('Category created successfully!');
          console.log('✅ Category created successfully');
        } else {
          throw new Error(result.error || 'Failed to create category');
        }
      } else {
        const result = await menuService.updateCategory(category!.id!, formData);
        if (result.success) {
          setSuccess('Category updated successfully!');
          console.log('✅ Category updated successfully');
        } else {
          throw new Error(result.error || 'Failed to update category');
        }
      }

      // Close modal and refresh data after short delay
      setTimeout(() => {
        onSave();
        onClose();
      }, 1000);

    } catch (error) {
      console.error('❌ Category operation failed:', error);
      setError(error instanceof Error ? error.message : 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle available times toggle
  const toggleAvailableTime = (time: string) => {
    const currentTimes = formData.available_times || [];
    const newTimes = currentTimes.includes(time)
      ? currentTimes.filter(t => t !== time)
      : [...currentTimes, time];
    
    setFormData(prev => ({
      ...prev,
      available_times: newTimes
    }));
  };

  // Check for duplicate names as user types
  const checkDuplicateName = React.useCallback(async (name: string) => {
    if (!name.trim() || !menuService) {
      setNameError(null);
      return;
    }

    try {
      const categories = await menuService.getCategories(true); // Include inactive
      if (categories.success && categories.data) {
        const duplicate = categories.data.find(cat => {
          const catName = cat.entity_name || cat.name;
          return catName && 
                 catName.toLowerCase().trim() === name.toLowerCase().trim() && 
                 cat.id !== category?.id; // Exclude current category when editing
        });

        if (duplicate) {
          setNameError(`Category "${name}" already exists`);
        } else {
          setNameError(null);
        }
      }
    } catch (error) {
      // Ignore validation errors during typing
      setNameError(null);
    }
  }, [menuService, category?.id]);

  // Debounced name checking
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.name) {
        checkDuplicateName(formData.name);
      }
    }, 500); // Check after 500ms of no typing

    return () => clearTimeout(timeoutId);
  }, [formData.name, checkDuplicateName]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'create' ? 'Create Category' : 'Edit Category'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Add or edit menu categories
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Display */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Display */}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Category Name *
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name || ''}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, name: e.target.value }));
                  setNameError(null); // Clear error when user starts typing
                }}
                placeholder="e.g., Beverages, Main Courses"
                required
                className={`w-full ${nameError ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              {nameError && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {nameError}
                </p>
              )}
            </div>

            {/* Display Order */}
            <div className="space-y-2">
              <Label htmlFor="display_order" className="text-sm font-medium text-gray-700">
                Display Order
              </Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order || 0}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  display_order: parseInt(e.target.value) || 0 
                }))}
                min="0"
                className="w-full"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this category..."
              rows={3}
              className="w-full"
            />
          </div>

          {/* Visual Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Icon Selector */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Category Icon
              </Label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { value: 'coffee', label: 'Coffee', icon: Coffee },
                  { value: 'pizza', label: 'Pizza', icon: Pizza },
                  { value: 'salad', label: 'Salad', icon: Salad },
                  { value: 'soup', label: 'Soup', icon: Soup },
                  { value: 'dessert', label: 'Dessert', icon: DessertIcon },
                  { value: 'wine', label: 'Wine', icon: Wine },
                  { value: 'sandwich', label: 'Sandwich', icon: Sandwich },
                  { value: 'utensils', label: 'General', icon: Utensils },
                  { value: 'chefhat', label: 'Chef', icon: ChefHat },
                  { value: 'star', label: 'Special', icon: Star },
                ].map((option) => {
                  const IconComponent = option.icon;
                  const isSelected = formData.icon === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, icon: option.value }))}
                      className={`
                        p-3 rounded-lg border-2 transition-all
                        ${isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                      title={option.label}
                    >
                      <IconComponent className={`w-5 h-5 mx-auto ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500">
                Select an icon for this category
              </p>
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="image_url" className="text-sm font-medium text-gray-700">
                Image URL
              </Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                placeholder="https://example.com/image.jpg"
                className="w-full"
              />
            </div>
          </div>

          {/* Available Times */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              Available Times
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableTimesOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`time-${option.value}`}
                    checked={(formData.available_times || []).includes(option.value)}
                    onChange={() => toggleAvailableTime(option.value)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <Label 
                    htmlFor={`time-${option.value}`} 
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center space-x-3">
            <Switch
              checked={formData.is_active !== undefined ? formData.is_active : true}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label className="text-sm font-medium text-gray-700">
              Active Category
            </Label>
            <p className="text-xs text-gray-500">
              {(formData.is_active !== undefined ? formData.is_active : true) ? 'Visible to customers' : 'Hidden from customers'}
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name?.trim() || !!nameError}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {mode === 'create' ? 'Create Category' : 'Update Category'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}