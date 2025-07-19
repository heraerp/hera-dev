'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, Coffee, Save, Loader2 } from 'lucide-react';

/**
 * Menu Category Form Component
 * 
 * Following the same patterns as Purchase Orders forms:
 * - Modal overlay with backdrop
 * - Same styling and validation patterns
 * - Same loading states and error handling
 * - Professional color picker for categories
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

interface MenuCategoryFormProps {
  organizationId: string;
  category?: MenuCategory | null;
  onClose: () => void;
  onSuccess: () => void;
}

// Predefined category colors for Italian restaurant
const CATEGORY_COLORS = [
  { name: 'Classic Red', value: '#DC2626' },
  { name: 'Italian Green', value: '#16A34A' },
  { name: 'Warm Orange', value: '#EA580C' },
  { name: 'Royal Purple', value: '#9333EA' },
  { name: 'Ocean Blue', value: '#2563EB' },
  { name: 'Tuscan Yellow', value: '#CA8A04' },
  { name: 'Wine Red', value: '#991B1B' },
  { name: 'Olive Green', value: '#65A30D' },
  { name: 'Neutral Gray', value: '#6B7280' },
  { name: 'Deep Brown', value: '#92400E' }
];

// Predefined icons for menu categories
const CATEGORY_ICONS = [
  { name: 'General', value: 'utensils' },
  { name: 'Coffee & Drinks', value: 'coffee' },
  { name: 'Pizza', value: 'pizza' },
  { name: 'Pasta', value: 'bowl' },
  { name: 'Salads', value: 'leaf' },
  { name: 'Desserts', value: 'cake' },
  { name: 'Wine', value: 'wine' },
  { name: 'Appetizers', value: 'cheese' },
  { name: 'Main Course', value: 'chef-hat' },
  { name: 'Beverages', value: 'glass-water' }
];

export const MenuCategoryForm: React.FC<MenuCategoryFormProps> = ({
  organizationId,
  category,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    displayOrder: 1,
    color: '#6B7280',
    icon: 'utensils'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!category;

  // Populate form data if editing
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        displayOrder: category.displayOrder,
        color: category.color || '#6B7280',
        icon: category.icon || 'utensils'
      });
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.name.trim()) {
        throw new Error('Category name is required');
      }

      // Prepare request data
      const requestData = {
        organizationId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        displayOrder: formData.displayOrder,
        color: formData.color,
        icon: formData.icon,
        ...(isEditing && { id: category!.id })
      };

      // Make API request
      const url = '/api/menu/categories';
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
        throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'create'} category`);
      }

      const result = await response.json();
      console.log(`✅ Category ${isEditing ? 'updated' : 'created'}:`, result);
      
      onSuccess();
    } catch (err) {
      console.error('Category form error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center text-lg">
              <Coffee className="mr-2 h-5 w-5 text-orange-600" />
              {isEditing ? 'Edit Category' : 'Add New Category'}
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
              {/* Category Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Appetizers, Main Courses, Desserts"
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
                  placeholder="Brief description of this category"
                  rows={3}
                  disabled={loading}
                />
              </div>

              {/* Display Order */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Display Order
                </label>
                <Input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => handleInputChange('displayOrder', parseInt(e.target.value) || 1)}
                  min="1"
                  max="100"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">Lower numbers appear first in the menu</p>
              </div>

              {/* Category Color */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category Color
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {CATEGORY_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => handleInputChange('color', color.value)}
                      className={`w-10 h-10 rounded-md border-2 transition-all ${
                        formData.color === color.value
                          ? 'border-gray-900 dark:border-gray-100 scale-110'
                          : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                      disabled={loading}
                    />
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="color"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className="w-12 h-8 p-0 border-0"
                    disabled={loading}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Custom color</span>
                </div>
              </div>

              {/* Category Icon */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category Icon
                </label>
                <select
                  value={formData.icon}
                  onChange={(e) => handleInputChange('icon', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  disabled={loading}
                >
                  {CATEGORY_ICONS.map((icon) => (
                    <option key={icon.value} value={icon.value}>
                      {icon.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Preview
                </label>
                <div 
                  className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-3 rounded border-l-4"
                  style={{ borderLeftColor: formData.color }}
                >
                  <div 
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: formData.color }}
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {formData.name || 'Category Name'}
                    </div>
                    {formData.description && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formData.description}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex space-x-3">
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
                  disabled={loading || !formData.name.trim()}
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
                      {isEditing ? 'Update Category' : 'Create Category'}
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