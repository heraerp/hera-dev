/**
 * Menu Item Modal - Toyota Production System Implementation
 * Standardized item creation/editing with built-in validation
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  MenuItem, 
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
  DollarSign,
  Clock,
  Star,
  Tag,
  ChefHat,
  Flame,
  Leaf,
  Wheat,
  Plus,
  Minus
} from 'lucide-react';

interface MenuItemModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  item?: MenuItem;
  mode: 'create' | 'edit';
  menuService: MenuManagementService;
  categories: MenuCategory[];
}

export default function MenuItemModal({
  open,
  onClose,
  onSave,
  item,
  mode,
  menuService,
  categories
}: MenuItemModalProps) {
  console.log('🍕 MenuItemModal rendered with:', { open, categoriesCount: categories.length, mode });
  const [formData, setFormData] = useState<MenuItem>({
    name: '',
    category_id: '',
    description: '',
    base_price: 0,
    image_url: '',
    preparation_time: 5,
    display_order: 0,
    is_active: true,
    is_featured: false,
    is_vegetarian: false,
    is_vegan: false,
    is_gluten_free: false,
    spice_level: undefined,
    calories: undefined,
    tags: [],
    available_times: [],
    recipe_id: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Available times options
  const availableTimesOptions = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'late_night', label: 'Late Night' },
    { value: 'all_day', label: 'All Day' }
  ];

  // Spice level options
  const spiceLevels = [
    { value: 'mild', label: 'Mild', icon: '🌶️' },
    { value: 'medium', label: 'Medium', icon: '🌶️🌶️' },
    { value: 'hot', label: 'Hot', icon: '🌶️🌶️🌶️' },
    { value: 'extra_hot', label: 'Extra Hot', icon: '🌶️🌶️🌶️🌶️' }
  ];

  // Initialize form data
  useEffect(() => {
    console.log('🍕 MenuItemModal: Categories updated:', categories.length, categories.map(c => c.name));
    
    if (item && mode === 'edit') {
      // Parse JSON fields if they're strings
      let tags: string[] = [];
      let availableTimes: string[] = [];
      
      try {
        tags = typeof item.tags === 'string' ? JSON.parse(item.tags) : (item.tags || []);
      } catch (e) {
        console.warn('Failed to parse tags:', item.tags);
        tags = [];
      }
      
      try {
        availableTimes = typeof item.available_times === 'string' ? JSON.parse(item.available_times) : (item.available_times || []);
      } catch (e) {
        console.warn('Failed to parse available_times:', item.available_times);
        availableTimes = [];
      }
      
      setFormData({
        ...item,
        tags: tags,
        available_times: availableTimes
      });
    } else {
      setFormData({
        name: '',
        category_id: categories.length > 0 ? categories[0].id! : '',
        description: '',
        base_price: 0,
        image_url: '',
        preparation_time: 5,
        display_order: 0,
        is_active: true,
        is_featured: false,
        is_vegetarian: false,
        is_vegan: false,
        is_gluten_free: false,
        spice_level: undefined,
        calories: undefined,
        tags: [],
        available_times: [],
        recipe_id: ''
      });
    }
    setError(null);
    setSuccess(null);
  }, [item, mode, open, categories]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('🏭 Toyota Method: Processing menu item form submission...');
      
      if (mode === 'create') {
        const result = await menuService.createMenuItem(formData);
        if (result.success) {
          setSuccess('Menu item created successfully!');
          console.log('✅ Toyota Method: Menu item created successfully');
        } else {
          throw new Error(result.error || 'Failed to create menu item');
        }
      } else {
        const result = await menuService.updateMenuItem(item!.id!, formData);
        if (result.success) {
          setSuccess('Menu item updated successfully!');
          console.log('✅ Toyota Method: Menu item updated successfully');
        } else {
          throw new Error(result.error || 'Failed to update menu item');
        }
      }

      // Close modal and refresh data after short delay
      setTimeout(() => {
        onSave();
        onClose();
      }, 1000);

    } catch (error) {
      console.error('❌ Toyota Method: Menu item operation failed:', error);
      setError(error instanceof Error ? error.message : 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle available times toggle
  const toggleAvailableTime = (time: string) => {
    const currentTimes = Array.isArray(formData.available_times) ? formData.available_times : [];
    const newTimes = currentTimes.includes(time)
      ? currentTimes.filter(t => t !== time)
      : [...currentTimes, time];
    
    setFormData(prev => ({
      ...prev,
      available_times: newTimes
    }));
  };

  // Handle tag addition
  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  // Handle tag removal
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    setError(null);

    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      // Convert to base64 for now (in production, you'd upload to a cloud service)
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setFormData(prev => ({ ...prev, image_url: base64String }));
        setUploadingImage(false);
      };
      reader.onerror = () => {
        setError('Failed to process image');
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);

    } catch (error) {
      console.error('Image upload error:', error);
      setError('Failed to upload image');
      setUploadingImage(false);
    }
  };

  // Remove image
  const removeImage = () => {
    setFormData(prev => ({ ...prev, image_url: '' }));
    setImagePreview(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
  };

  // Set preview when editing item with existing image
  React.useEffect(() => {
    if (formData.image_url && !imagePreview) {
      setImagePreview(formData.image_url);
    }
  }, [formData.image_url, imagePreview]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'create' ? 'Create Menu Item' : 'Edit Menu Item'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Toyota Method: Standardized menu item management
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
            {/* Item Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Item Name *
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Margherita Pizza, Caesar Salad"
                required
                className="w-full"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category_id" className="text-sm font-medium text-gray-700">
                Category *
              </Label>
              <select
                id="category_id"
                value={formData.category_id}
                onChange={(e) => {
                  console.log('🍕 Category selected:', e.target.value);
                  setFormData(prev => ({ ...prev, category_id: e.target.value }));
                }}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a category</option>
                {categories.map(category => {
                  const categoryName = category.entity_name || category.name;
                  console.log('🍕 Rendering category option:', categoryName, category.id);
                  return (
                    <option key={category.id} value={category.id}>
                      {categoryName}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed description of the menu item..."
              rows={3}
              required
              className="w-full"
            />
          </div>

          {/* Pricing and Timing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Base Price */}
            <div className="space-y-2">
              <Label htmlFor="base_price" className="text-sm font-medium text-gray-700">
                Base Price *
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="base_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.base_price}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    base_price: parseFloat(e.target.value) || 0 
                  }))}
                  placeholder="0.00"
                  required
                  className="pl-9"
                />
              </div>
            </div>

            {/* Preparation Time */}
            <div className="space-y-2">
              <Label htmlFor="preparation_time" className="text-sm font-medium text-gray-700">
                Prep Time (minutes)
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="preparation_time"
                  type="number"
                  min="1"
                  value={formData.preparation_time}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    preparation_time: parseInt(e.target.value) || 5 
                  }))}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Display Order */}
            <div className="space-y-2">
              <Label htmlFor="display_order" className="text-sm font-medium text-gray-700">
                Display Order
              </Label>
              <Input
                id="display_order"
                type="number"
                min="0"
                value={formData.display_order}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  display_order: parseInt(e.target.value) || 0 
                }))}
                className="w-full"
              />
            </div>
          </div>

          {/* Image Upload and URL */}
          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-700">
              Menu Item Image
            </Label>
            
            {/* Image Upload Section */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              {imagePreview ? (
                <div className="space-y-4">
                  {/* Image Preview */}
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-white"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Upload New Image Button */}
                  <div className="flex items-center justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('image-file-input')?.click()}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Image className="w-4 h-4 mr-2" />
                          Change Image
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Image className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('image-file-input')?.click()}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Image className="w-4 h-4 mr-2" />
                          Upload Image
                        </>
                      )}
                    </Button>
                    <p className="text-sm text-gray-500">
                      Upload an image or enter URL below
                    </p>
                    <p className="text-xs text-gray-400">
                      JPG, PNG up to 5MB
                    </p>
                  </div>
                </div>
              )}
              
              {/* Hidden File Input */}
              <input
                id="image-file-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            
            {/* Manual Image URL Input */}
            <div className="space-y-2">
              <Label htmlFor="image_url" className="text-sm font-medium text-gray-700">
                Or enter image URL
              </Label>
              <div className="relative">
                <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url || ''}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, image_url: e.target.value }));
                    // Update preview when URL is entered manually
                    if (e.target.value && e.target.value.startsWith('http')) {
                      setImagePreview(e.target.value);
                    }
                  }}
                  placeholder="https://example.com/image.jpg"
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {/* Dietary Information */}
          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-700">
              Dietary Information
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Vegetarian */}
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_vegetarian}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_vegetarian: checked }))}
                />
                <Label className="text-sm text-gray-700 flex items-center">
                  <Leaf className="w-4 h-4 mr-1 text-green-500" />
                  Vegetarian
                </Label>
              </div>

              {/* Vegan */}
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_vegan}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_vegan: checked }))}
                />
                <Label className="text-sm text-gray-700 flex items-center">
                  <Leaf className="w-4 h-4 mr-1 text-emerald-500" />
                  Vegan
                </Label>
              </div>

              {/* Gluten-Free */}
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_gluten_free}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_gluten_free: checked }))}
                />
                <Label className="text-sm text-gray-700 flex items-center">
                  <Wheat className="w-4 h-4 mr-1 text-blue-500" />
                  Gluten-Free
                </Label>
              </div>

              {/* Featured */}
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                />
                <Label className="text-sm text-gray-700 flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                  Featured
                </Label>
              </div>
            </div>
          </div>

          {/* Spice Level */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              Spice Level
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="spice-none"
                  name="spice_level"
                  checked={!formData.spice_level}
                  onChange={() => setFormData(prev => ({ ...prev, spice_level: undefined }))}
                  className="w-4 h-4 text-blue-600"
                />
                <Label htmlFor="spice-none" className="text-sm text-gray-700">
                  None
                </Label>
              </div>
              {spiceLevels.map((level) => (
                <div key={level.value} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`spice-${level.value}`}
                    name="spice_level"
                    checked={formData.spice_level === level.value}
                    onChange={() => setFormData(prev => ({ ...prev, spice_level: level.value as any }))}
                    className="w-4 h-4 text-blue-600"
                  />
                  <Label htmlFor={`spice-${level.value}`} className="text-sm text-gray-700">
                    {level.label} {level.icon}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Calories */}
          <div className="space-y-2">
            <Label htmlFor="calories" className="text-sm font-medium text-gray-700">
              Calories (optional)
            </Label>
            <Input
              id="calories"
              type="number"
              min="0"
              value={formData.calories || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                calories: e.target.value ? parseInt(e.target.value) : undefined 
              }))}
              placeholder="e.g., 450"
              className="w-full"
            />
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              Tags
            </Label>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTag}
                disabled={!newTag.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(Array.isArray(formData.tags) ? formData.tags : []).map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
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
                    checked={(Array.isArray(formData.available_times) ? formData.available_times : []).includes(option.value)}
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
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label className="text-sm font-medium text-gray-700">
              Active Item
            </Label>
            <p className="text-xs text-gray-500">
              {formData.is_active ? 'Visible to customers' : 'Hidden from customers'}
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
              disabled={loading || !formData.name?.trim() || !formData.category_id || !formData.description?.trim()}
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
                  {mode === 'create' ? 'Create Item' : 'Update Item'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}