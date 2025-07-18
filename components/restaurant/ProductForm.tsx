"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/revolutionary-card';
import { Button } from '@/components/ui/revolutionary-button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import motionConfig from '@/lib/motion';
import { 
  Package,
  Save,
  X,
  Plus,
  Sparkles,
  Coffee,
  Cookie,
  Box,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Upload,
  Camera,
  Zap,
  DollarSign,
  Clock,
  Package2,
  Scale,
  Thermometer,
  Shield,
  Truck,
  Calendar,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  RefreshCw
} from 'lucide-react';

interface ProductFormProps {
  product?: any;
  onSave: (productData: any) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export default function ProductForm({ product, onSave, onCancel, isEdit = false }: ProductFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Information
    entity_name: product?.entity_name || '',
    entity_code: product?.entity_code || '',
    category: product?.category || 'tea',
    product_type: product?.product_type || 'finished_good',
    description: product?.description || '',
    
    // Pricing & Costs
    price: product?.price || 0,
    cost_per_unit: product?.cost_per_unit || 0,
    
    // Inventory
    inventory_count: product?.inventory_count || 0,
    minimum_stock: product?.minimum_stock || 10,
    unit_type: product?.unit_type || 'pieces',
    
    // Details
    preparation_time_minutes: product?.preparation_time_minutes || 0,
    calories: product?.calories || 0,
    allergens: product?.allergens || 'None',
    serving_temperature: product?.serving_temperature || '',
    caffeine_level: product?.caffeine_level || '',
    origin: product?.origin || '',
    
    // Advanced
    supplier_name: product?.supplier_name || '',
    storage_requirements: product?.storage_requirements || '',
    shelf_life_days: product?.shelf_life_days || 0,
  });

  const [errors, setErrors] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  // Categories with icons
  const categories = [
    { id: 'tea', name: 'Tea & Beverages', icon: Coffee, color: 'bg-green-500' },
    { id: 'pastries', name: 'Pastries & Food', icon: Cookie, color: 'bg-orange-500' },
    { id: 'packaging', name: 'Packaging', icon: Box, color: 'bg-purple-500' },
    { id: 'supplies', name: 'Supplies', icon: Wrench, color: 'bg-gray-500' }
  ];

  // Product types
  const productTypes = [
    { id: 'finished_good', name: 'Finished Good', description: 'Ready-to-serve items' },
    { id: 'ingredient', name: 'Ingredient', description: 'Raw materials for preparation' },
    { id: 'packaging', name: 'Packaging', description: 'Cups, bags, containers' }
  ];

  // Unit types
  const unitTypes = [
    { id: 'pieces', name: 'Pieces' },
    { id: 'servings', name: 'Servings' },
    { id: 'grams', name: 'Grams' },
    { id: 'kg', name: 'Kilograms' },
    { id: 'ml', name: 'Milliliters' },
    { id: 'liters', name: 'Liters' }
  ];

  // Form steps
  const steps = [
    { id: 1, name: 'Basic Info', icon: Package, required: true },
    { id: 2, name: 'Pricing', icon: DollarSign, required: true },
    { id: 3, name: 'Inventory', icon: Package2, required: true },
    { id: 4, name: 'Details', icon: BarChart3, required: false },
    { id: 5, name: 'Advanced', icon: Zap, required: false }
  ];

  // AI Suggestions based on product name
  const generateAISuggestions = async (productName: string) => {
    if (!productName || productName.length < 3) return;
    
    setIsGeneratingAI(true);
    
    // Mock AI suggestions - in real implementation, this would call an AI service
    setTimeout(() => {
      const suggestions = [
        {
          type: 'description',
          title: 'Suggested Description',
          value: `Premium ${productName.toLowerCase()} crafted with finest ingredients for exceptional taste and quality.`,
          confidence: 92
        },
        {
          type: 'pricing',
          title: 'Suggested Pricing',
          value: `₹${Math.floor(Math.random() * 100) + 50} (based on similar products)`,
          confidence: 87
        },
        {
          type: 'category',
          title: 'Suggested Category',
          value: productName.toLowerCase().includes('tea') ? 'tea' : 
                productName.toLowerCase().includes('coffee') ? 'tea' :
                productName.toLowerCase().includes('cake') || productName.toLowerCase().includes('pastry') ? 'pastries' : 'supplies',
          confidence: 95
        }
      ];
      
      setAiSuggestions(suggestions);
      setIsGeneratingAI(false);
    }, 1500);
  };

  // Handle form field changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
    
    // Generate AI suggestions when product name changes
    if (field === 'entity_name' && value.length > 2) {
      generateAISuggestions(value);
    }

    // Auto-generate code if not editing
    if (field === 'entity_name' && !isEdit) {
      const code = value.toUpperCase().replace(/\s+/g, '-').slice(0, 10);
      const category = formData.category.toUpperCase().slice(0, 3);
      const timestamp = Date.now().toString().slice(-3);
      setFormData(prev => ({ ...prev, entity_code: `${category}-${code}-${timestamp}` }));
    }
  };

  // Apply AI suggestion
  const applySuggestion = (suggestion: any) => {
    switch (suggestion.type) {
      case 'description':
        handleInputChange('description', suggestion.value);
        break;
      case 'category':
        handleInputChange('category', suggestion.value);
        break;
      case 'pricing':
        const price = parseInt(suggestion.value.replace(/[^0-9]/g, ''));
        handleInputChange('price', price);
        break;
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.entity_name.trim()) {
      newErrors.entity_name = 'Product name is required';
    }
    
    if (!formData.entity_code.trim()) {
      newErrors.entity_code = 'Product code is required';
    }
    
    if (formData.cost_per_unit <= 0) {
      newErrors.cost_per_unit = 'Cost per unit must be greater than 0';
    }
    
    if (formData.minimum_stock < 0) {
      newErrors.minimum_stock = 'Minimum stock cannot be negative';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (saveAsDraft = false) => {
    if (!saveAsDraft && !validateForm()) {
      return;
    }
    
    const productData = {
      ...formData,
      is_draft: saveAsDraft,
      updated_at: new Date().toISOString()
    };
    
    onSave(productData);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Get category info
  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || categories[0];
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {isEdit ? 'Edit Product' : 'Add New Product'}
                </h2>
                <p className="text-sm text-gray-600">
                  {isEdit ? 'Update product information' : 'Create a new product for your inventory'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSubmit(true)}
                disabled={!formData.entity_name.trim()}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button variant="ghost" size="sm" onClick={onCancel}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-4 overflow-x-auto">
            {steps.map((step) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <motion.button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap",
                    isActive ? "bg-blue-100 text-blue-700" :
                    isCompleted ? "bg-green-100 text-green-700" :
                    "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <StepIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">{step.name}</span>
                  {step.required && <span className="text-red-500 text-xs">*</span>}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-4 border-blue-200 bg-blue-50">
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">AI Suggestions</h3>
                  {isGeneratingAI && (
                    <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                  )}
                </div>
                <div className="space-y-2">
                  {aiSuggestions.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white rounded-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-800">{suggestion.title}</span>
                          <Badge className="text-xs bg-blue-100 text-blue-800">
                            {suggestion.confidence}% confident
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{suggestion.value}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applySuggestion(suggestion)}
                        className="ml-4"
                      >
                        Apply
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="entity_name" className="text-sm font-medium text-gray-700">
                    Product Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="entity_name"
                    value={formData.entity_name}
                    onChange={(e) => handleInputChange('entity_name', e.target.value)}
                    placeholder="Enter product name"
                    className={cn(errors.entity_name && "border-red-500")}
                  />
                  {errors.entity_name && (
                    <p className="text-sm text-red-500 mt-1">{errors.entity_name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="entity_code" className="text-sm font-medium text-gray-700">
                    Product Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="entity_code"
                    value={formData.entity_code}
                    onChange={(e) => handleInputChange('entity_code', e.target.value)}
                    placeholder="AUTO-GENERATED"
                    className={cn(errors.entity_code && "border-red-500")}
                  />
                  {errors.entity_code && (
                    <p className="text-sm text-red-500 mt-1">{errors.entity_code}</p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Category <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {categories.map((category) => {
                    const CategoryIcon = category.icon;
                    return (
                      <motion.button
                        key={category.id}
                        onClick={() => handleInputChange('category', category.id)}
                        className={cn(
                          "p-4 rounded-lg border-2 transition-all",
                          formData.category === category.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <CategoryIcon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                        <p className="text-sm font-medium text-gray-800">{category.name}</p>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Product Type <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {productTypes.map((type) => (
                    <motion.button
                      key={type.id}
                      onClick={() => handleInputChange('product_type', type.id)}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all text-left",
                        formData.product_type === type.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <p className="font-medium text-gray-800">{type.name}</p>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your product..."
                  rows={3}
                />
              </div>
            </motion.div>
          )}

          {/* Step 2: Pricing */}
          {currentStep === 2 && (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                    Selling Price (₹)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Leave as 0 for non-selling items (ingredients, packaging)
                  </p>
                </div>

                <div>
                  <Label htmlFor="cost_per_unit" className="text-sm font-medium text-gray-700">
                    Cost Per Unit (₹) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cost_per_unit"
                    type="number"
                    value={formData.cost_per_unit}
                    onChange={(e) => handleInputChange('cost_per_unit', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className={cn(errors.cost_per_unit && "border-red-500")}
                  />
                  {errors.cost_per_unit && (
                    <p className="text-sm text-red-500 mt-1">{errors.cost_per_unit}</p>
                  )}
                </div>
              </div>

              {/* Profit Margin Calculation */}
              {formData.price > 0 && formData.cost_per_unit > 0 && (
                <Card className="p-4 bg-green-50 border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-green-800">Profit Analysis</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Profit per unit</p>
                      <p className="font-bold text-green-600">
                        {formatCurrency(formData.price - formData.cost_per_unit)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Profit margin</p>
                      <p className="font-bold text-green-600">
                        {(((formData.price - formData.cost_per_unit) / formData.price) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Markup</p>
                      <p className="font-bold text-green-600">
                        {(((formData.price - formData.cost_per_unit) / formData.cost_per_unit) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </motion.div>
          )}

          {/* Step 3: Inventory */}
          {currentStep === 3 && (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="inventory_count" className="text-sm font-medium text-gray-700">
                    Current Stock
                  </Label>
                  <Input
                    id="inventory_count"
                    type="number"
                    value={formData.inventory_count}
                    onChange={(e) => handleInputChange('inventory_count', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <Label htmlFor="minimum_stock" className="text-sm font-medium text-gray-700">
                    Minimum Stock <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="minimum_stock"
                    type="number"
                    value={formData.minimum_stock}
                    onChange={(e) => handleInputChange('minimum_stock', parseInt(e.target.value) || 0)}
                    placeholder="10"
                    min="0"
                    className={cn(errors.minimum_stock && "border-red-500")}
                  />
                  {errors.minimum_stock && (
                    <p className="text-sm text-red-500 mt-1">{errors.minimum_stock}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="unit_type" className="text-sm font-medium text-gray-700">
                    Unit Type <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="unit_type"
                    value={formData.unit_type}
                    onChange={(e) => handleInputChange('unit_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {unitTypes.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Stock Status Indicator */}
              <Card className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Package2 className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-800">Stock Status</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Stock</span>
                    <span className="font-medium">{formData.inventory_count} {formData.unit_type}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        formData.inventory_count > formData.minimum_stock ? 'bg-green-500' :
                        formData.inventory_count > 0 ? 'bg-yellow-500' : 'bg-red-500'
                      )}
                      style={{ 
                        width: `${Math.max(5, Math.min(100, (formData.inventory_count / (formData.minimum_stock || 1)) * 100))}%` 
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Minimum: {formData.minimum_stock}</span>
                    <span>
                      {formData.inventory_count > formData.minimum_stock ? 'Well Stocked' :
                       formData.inventory_count > 0 ? 'Low Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Details */}
          {currentStep === 4 && (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="preparation_time_minutes" className="text-sm font-medium text-gray-700">
                    Preparation Time (minutes)
                  </Label>
                  <Input
                    id="preparation_time_minutes"
                    type="number"
                    value={formData.preparation_time_minutes}
                    onChange={(e) => handleInputChange('preparation_time_minutes', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <Label htmlFor="calories" className="text-sm font-medium text-gray-700">
                    Calories (per serving)
                  </Label>
                  <Input
                    id="calories"
                    type="number"
                    value={formData.calories}
                    onChange={(e) => handleInputChange('calories', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="serving_temperature" className="text-sm font-medium text-gray-700">
                    Serving Temperature
                  </Label>
                  <Input
                    id="serving_temperature"
                    value={formData.serving_temperature}
                    onChange={(e) => handleInputChange('serving_temperature', e.target.value)}
                    placeholder="Hot, Cold, Room Temperature"
                  />
                </div>

                <div>
                  <Label htmlFor="caffeine_level" className="text-sm font-medium text-gray-700">
                    Caffeine Level
                  </Label>
                  <select
                    id="caffeine_level"
                    value={formData.caffeine_level}
                    onChange={(e) => handleInputChange('caffeine_level', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="None">None</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="origin" className="text-sm font-medium text-gray-700">
                    Origin
                  </Label>
                  <Input
                    id="origin"
                    value={formData.origin}
                    onChange={(e) => handleInputChange('origin', e.target.value)}
                    placeholder="Country or region of origin"
                  />
                </div>

                <div>
                  <Label htmlFor="allergens" className="text-sm font-medium text-gray-700">
                    Allergens
                  </Label>
                  <Input
                    id="allergens"
                    value={formData.allergens}
                    onChange={(e) => handleInputChange('allergens', e.target.value)}
                    placeholder="None, Dairy, Nuts, etc."
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 5: Advanced */}
          {currentStep === 5 && (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="supplier_name" className="text-sm font-medium text-gray-700">
                    Supplier Name
                  </Label>
                  <Input
                    id="supplier_name"
                    value={formData.supplier_name}
                    onChange={(e) => handleInputChange('supplier_name', e.target.value)}
                    placeholder="Primary supplier"
                  />
                </div>

                <div>
                  <Label htmlFor="shelf_life_days" className="text-sm font-medium text-gray-700">
                    Shelf Life (days)
                  </Label>
                  <Input
                    id="shelf_life_days"
                    type="number"
                    value={formData.shelf_life_days}
                    onChange={(e) => handleInputChange('shelf_life_days', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="storage_requirements" className="text-sm font-medium text-gray-700">
                  Storage Requirements
                </Label>
                <Textarea
                  id="storage_requirements"
                  value={formData.storage_requirements}
                  onChange={(e) => handleInputChange('storage_requirements', e.target.value)}
                  placeholder="Special storage instructions..."
                  rows={3}
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Step {currentStep} of {steps.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                disabled={currentStep === steps.length}
              >
                Next
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={() => handleSubmit(false)}>
                <Save className="w-4 h-4 mr-2" />
                {isEdit ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}