'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Edit, Trash2, X, Save, Coffee, Cake, Package, Loader2,
  AlertCircle, CheckCircle, DollarSign, Clock, Tag, FileText,
  Thermometer, Timer, Heart, Star, Leaf
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/revolutionary-card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import ProductCatalogService from '@/lib/services/productCatalogService'
import type { ProductData, CategoryData } from '@/lib/services/productCatalogService'

interface ProductCrudModalsProps {
  organizationId: string
  categories: any[]
  selectedProduct?: any
  modalType: 'create' | 'edit' | 'view' | 'delete' | null
  onClose: () => void
  onSuccess: () => void
}

interface ProductFormData {
  name: string
  description: string
  categoryId: string
  basePrice: number
  sku: string
  preparationTimeMinutes: number
  isActive: boolean
  productType: 'tea' | 'pastry' | 'beverage' | 'food'
  brewingInstructions: {
    temperature: string
    steepingTime: string
    teaAmount: string
  }
  nutritionalInfo: {
    caffeineContent: string
    caloriesPerServing: number
    allergens: string[]
  }
  originStory: string
  seasonalAvailability: boolean
  popularPairings: string[]
}

const initialFormData: ProductFormData = {
  name: '',
  description: '',
  categoryId: '',
  basePrice: 0,
  sku: '',
  preparationTimeMinutes: 5,
  isActive: true,
  productType: 'tea',
  brewingInstructions: {
    temperature: '',
    steepingTime: '',
    teaAmount: ''
  },
  nutritionalInfo: {
    caffeineContent: '',
    caloriesPerServing: 0,
    allergens: []
  },
  originStory: '',
  seasonalAvailability: false,
  popularPairings: []
}

export default function ProductCrudModals({
  organizationId,
  categories,
  selectedProduct,
  modalType,
  onClose,
  onSuccess
}: ProductCrudModalsProps) {
  const [formData, setFormData] = useState<ProductFormData>(initialFormData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState(1)
  const [allergenInput, setAllergenInput] = useState('')
  const [pairingInput, setPairingInput] = useState('')

  // Populate form data when editing
  useEffect(() => {
    if (modalType === 'edit' && selectedProduct) {
      const productData = selectedProduct.dynamicData || {}
      setFormData({
        name: selectedProduct.entity_name || '',
        description: productData.description?.value || '',
        categoryId: productData.category_id?.value || '',
        basePrice: parseFloat(productData.base_price?.value || '0'),
        sku: productData.sku?.value || '',
        preparationTimeMinutes: parseInt(productData.preparation_time_minutes?.value || '5'),
        isActive: selectedProduct.is_active !== false,
        productType: productData.product_type?.value || 'tea',
        brewingInstructions: {
          temperature: productData.brewing_temperature?.value || '',
          steepingTime: productData.steeping_time?.value || '',
          teaAmount: productData.tea_amount?.value || ''
        },
        nutritionalInfo: {
          caffeineContent: productData.caffeine_content?.value || '',
          caloriesPerServing: parseInt(productData.calories_per_serving?.value || '0'),
          allergens: productData.allergens?.value ? JSON.parse(productData.allergens.value) : []
        },
        originStory: productData.origin_story?.value || '',
        seasonalAvailability: productData.seasonal_availability?.value === 'true',
        popularPairings: productData.popular_pairings?.value ? JSON.parse(productData.popular_pairings.value) : []
      })
    } else if (modalType === 'create') {
      setFormData(initialFormData)
    }
  }, [modalType, selectedProduct])

  // Auto-generate SKU based on product name
  useEffect(() => {
    if (modalType === 'create' && formData.name && !formData.sku) {
      const sku = formData.name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 8) + '-' + Date.now().toString().slice(-4)
      setFormData(prev => ({ ...prev, sku }))
    }
  }, [formData.name, modalType])

  const getProductIcon = (type: string) => {
    switch (type) {
      case 'tea': return <Leaf className="w-5 h-5" />
      case 'pastry': return <Cake className="w-5 h-5" />
      case 'beverage': return <Coffee className="w-5 h-5" />
      case 'food': return <Package className="w-5 h-5" />
      default: return <Package className="w-5 h-5" />
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      const productData: ProductData = {
        name: formData.name,
        description: formData.description,
        categoryId: formData.categoryId,
        basePrice: formData.basePrice,
        sku: formData.sku,
        preparationTimeMinutes: formData.preparationTimeMinutes,
        isActive: formData.isActive,
        productType: formData.productType,
        brewingInstructions: formData.brewingInstructions,
        nutritionalInfo: formData.nutritionalInfo,
        originStory: formData.originStory,
        seasonalAvailability: formData.seasonalAvailability,
        popularPairings: formData.popularPairings
      }

      let result
      if (modalType === 'create') {
        console.log('🚀 Creating new product:', productData)
        result = await ProductCatalogService.createProduct(organizationId, productData)
      } else if (modalType === 'edit') {
        console.log('✏️ Updating product:', selectedProduct.id, productData)
        result = await ProductCatalogService.updateProduct(organizationId, selectedProduct.id, productData)
      }

      if (result?.success) {
        setSuccess(true)
        console.log('✅ Product operation successful')
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 1500)
      } else {
        throw new Error(result?.error || 'Operation failed')
      }
    } catch (error) {
      console.error('❌ Product operation failed:', error)
      setError(error instanceof Error ? error.message : 'Operation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedProduct) return

    setLoading(true)
    setError(null)

    try {
      console.log('🗑️ Deleting product:', selectedProduct.id)
      const result = await ProductCatalogService.deleteProduct(organizationId, selectedProduct.id)

      if (result?.success) {
        setSuccess(true)
        console.log('✅ Product deleted successfully')
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 1500)
      } else {
        throw new Error(result?.error || 'Delete failed')
      }
    } catch (error) {
      console.error('❌ Product deletion failed:', error)
      setError(error instanceof Error ? error.message : 'Delete failed')
    } finally {
      setLoading(false)
    }
  }

  const addAllergen = () => {
    if (allergenInput.trim() && !formData.nutritionalInfo.allergens.includes(allergenInput.trim())) {
      setFormData(prev => ({
        ...prev,
        nutritionalInfo: {
          ...prev.nutritionalInfo,
          allergens: [...prev.nutritionalInfo.allergens, allergenInput.trim()]
        }
      }))
      setAllergenInput('')
    }
  }

  const removeAllergen = (allergen: string) => {
    setFormData(prev => ({
      ...prev,
      nutritionalInfo: {
        ...prev.nutritionalInfo,
        allergens: prev.nutritionalInfo.allergens.filter(a => a !== allergen)
      }
    }))
  }

  const addPairing = () => {
    if (pairingInput.trim() && !formData.popularPairings.includes(pairingInput.trim())) {
      setFormData(prev => ({
        ...prev,
        popularPairings: [...prev.popularPairings, pairingInput.trim()]
      }))
      setPairingInput('')
    }
  }

  const removePairing = (pairing: string) => {
    setFormData(prev => ({
      ...prev,
      popularPairings: prev.popularPairings.filter(p => p !== pairing)
    }))
  }

  if (!modalType) return null

  const isViewMode = modalType === 'view'
  const isDeleteMode = modalType === 'delete'
  const totalSteps = 3

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          <Card className="bg-white border-0 shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    {modalType === 'create' && <Plus className="w-5 h-5 text-white" />}
                    {modalType === 'edit' && <Edit className="w-5 h-5 text-white" />}
                    {modalType === 'view' && getProductIcon(selectedProduct?.dynamicData?.product_type?.value)}
                    {modalType === 'delete' && <Trash2 className="w-5 h-5 text-white" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {modalType === 'create' && 'Create New Product'}
                      {modalType === 'edit' && 'Edit Product'}
                      {modalType === 'view' && 'Product Details'}
                      {modalType === 'delete' && 'Delete Product'}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {modalType === 'create' && 'Add a new product to your catalog'}
                      {modalType === 'edit' && 'Update product information'}
                      {modalType === 'view' && 'View product details and specifications'}
                      {modalType === 'delete' && 'Permanently remove this product'}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Progress indicator for create/edit */}
              {(modalType === 'create' || modalType === 'edit') && !isDeleteMode && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Step {step} of {totalSteps}</span>
                    <span>{Math.round((step / totalSteps) * 100)}% Complete</span>
                  </div>
                  <Progress value={(step / totalSteps) * 100} className="h-2" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[60vh]">
              {/* Success State */}
              {success && (
                <div className="p-8 text-center">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    {modalType === 'delete' ? 'Product Deleted!' : 'Success!'}
                  </h3>
                  <p className="text-green-600">
                    {modalType === 'create' && 'Product has been created successfully'}
                    {modalType === 'edit' && 'Product has been updated successfully'}
                    {modalType === 'delete' && 'Product has been removed from your catalog'}
                  </p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="p-6 bg-red-50 border-b border-red-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">Error</p>
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Delete Confirmation */}
              {isDeleteMode && !success && (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Product</h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete <strong>{selectedProduct?.entity_name}</strong>? 
                    This action cannot be undone.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDelete}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Deleting...
                        </>
                      ) : (
                        'Delete Product'
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Form Content */}
              {!isDeleteMode && !success && (
                <div className="p-6 space-y-6">
                  {/* Step 1: Basic Information */}
                  {step === 1 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Package className="w-5 h-5" />
                          Basic Information
                        </h3>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Product Name *</Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="e.g., Premium Jasmine Green Tea"
                              disabled={isViewMode}
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="sku">SKU</Label>
                            <Input
                              id="sku"
                              value={formData.sku}
                              onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                              placeholder="Auto-generated"
                              disabled={isViewMode}
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="category">Category *</Label>
                            <Select
                              value={formData.categoryId}
                              onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                              disabled={isViewMode}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {category.entity_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="productType">Product Type</Label>
                            <Select
                              value={formData.productType}
                              onValueChange={(value: any) => setFormData(prev => ({ ...prev, productType: value }))}
                              disabled={isViewMode}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="tea">Tea</SelectItem>
                                <SelectItem value="pastry">Pastry</SelectItem>
                                <SelectItem value="beverage">Beverage</SelectItem>
                                <SelectItem value="food">Food</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="basePrice">Base Price (₹) *</Label>
                            <Input
                              id="basePrice"
                              type="number"
                              step="0.01"
                              value={formData.basePrice}
                              onChange={(e) => setFormData(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
                              placeholder="0.00"
                              disabled={isViewMode}
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="prepTime">Preparation Time (minutes)</Label>
                            <Input
                              id="prepTime"
                              type="number"
                              value={formData.preparationTimeMinutes}
                              onChange={(e) => setFormData(prev => ({ ...prev, preparationTimeMinutes: parseInt(e.target.value) || 0 }))}
                              placeholder="5"
                              disabled={isViewMode}
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe the product, its flavor profile, and unique characteristics..."
                            disabled={isViewMode}
                            className="mt-1 min-h-[100px]"
                          />
                        </div>

                        <div className="flex items-center gap-2 mt-4">
                          <Switch
                            id="isActive"
                            checked={formData.isActive}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                            disabled={isViewMode}
                          />
                          <Label htmlFor="isActive">Product is active</Label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Brewing & Nutritional Info */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Coffee className="w-5 h-5" />
                          Brewing Instructions & Nutrition
                        </h3>

                        {/* Brewing Instructions */}
                        <div className="mb-6">
                          <h4 className="font-medium mb-3 text-gray-700">Brewing Instructions</h4>
                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="temperature">Temperature</Label>
                              <Input
                                id="temperature"
                                value={formData.brewingInstructions.temperature}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  brewingInstructions: { ...prev.brewingInstructions, temperature: e.target.value }
                                }))}
                                placeholder="e.g., 85°C"
                                disabled={isViewMode}
                                className="mt-1"
                              />
                            </div>

                            <div>
                              <Label htmlFor="steepingTime">Steeping Time</Label>
                              <Input
                                id="steepingTime"
                                value={formData.brewingInstructions.steepingTime}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  brewingInstructions: { ...prev.brewingInstructions, steepingTime: e.target.value }
                                }))}
                                placeholder="e.g., 3-5 minutes"
                                disabled={isViewMode}
                                className="mt-1"
                              />
                            </div>

                            <div>
                              <Label htmlFor="teaAmount">Tea Amount</Label>
                              <Input
                                id="teaAmount"
                                value={formData.brewingInstructions.teaAmount}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  brewingInstructions: { ...prev.brewingInstructions, teaAmount: e.target.value }
                                }))}
                                placeholder="e.g., 1 tsp per cup"
                                disabled={isViewMode}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Nutritional Information */}
                        <div>
                          <h4 className="font-medium mb-3 text-gray-700">Nutritional Information</h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="caffeineContent">Caffeine Content</Label>
                              <Input
                                id="caffeineContent"
                                value={formData.nutritionalInfo.caffeineContent}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  nutritionalInfo: { ...prev.nutritionalInfo, caffeineContent: e.target.value }
                                }))}
                                placeholder="e.g., 30-40mg per cup"
                                disabled={isViewMode}
                                className="mt-1"
                              />
                            </div>

                            <div>
                              <Label htmlFor="caloriesPerServing">Calories per Serving</Label>
                              <Input
                                id="caloriesPerServing"
                                type="number"
                                value={formData.nutritionalInfo.caloriesPerServing}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  nutritionalInfo: { ...prev.nutritionalInfo, caloriesPerServing: parseInt(e.target.value) || 0 }
                                }))}
                                placeholder="0"
                                disabled={isViewMode}
                                className="mt-1"
                              />
                            </div>
                          </div>

                          {/* Allergens */}
                          <div className="mt-4">
                            <Label>Allergens</Label>
                            <div className="flex gap-2 mt-2">
                              {!isViewMode && (
                                <>
                                  <Input
                                    value={allergenInput}
                                    onChange={(e) => setAllergenInput(e.target.value)}
                                    placeholder="Add allergen"
                                    onKeyPress={(e) => e.key === 'Enter' && addAllergen()}
                                    className="flex-1"
                                  />
                                  <Button type="button" onClick={addAllergen} size="sm">Add</Button>
                                </>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {formData.nutritionalInfo.allergens.map((allergen) => (
                                <Badge key={allergen} variant="secondary" className="gap-1">
                                  {allergen}
                                  {!isViewMode && (
                                    <button onClick={() => removeAllergen(allergen)}>
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Additional Details */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Star className="w-5 h-5" />
                          Additional Details
                        </h3>

                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="originStory">Origin Story</Label>
                            <Textarea
                              id="originStory"
                              value={formData.originStory}
                              onChange={(e) => setFormData(prev => ({ ...prev, originStory: e.target.value }))}
                              placeholder="Tell the story of this product's origin, source, or inspiration..."
                              disabled={isViewMode}
                              className="mt-1 min-h-[80px]"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <Switch
                              id="seasonalAvailability"
                              checked={formData.seasonalAvailability}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, seasonalAvailability: checked }))}
                              disabled={isViewMode}
                            />
                            <Label htmlFor="seasonalAvailability">Seasonal availability only</Label>
                          </div>

                          {/* Popular Pairings */}
                          <div>
                            <Label>Popular Pairings</Label>
                            <div className="flex gap-2 mt-2">
                              {!isViewMode && (
                                <>
                                  <Input
                                    value={pairingInput}
                                    onChange={(e) => setPairingInput(e.target.value)}
                                    placeholder="Add pairing suggestion"
                                    onKeyPress={(e) => e.key === 'Enter' && addPairing()}
                                    className="flex-1"
                                  />
                                  <Button type="button" onClick={addPairing} size="sm">Add</Button>
                                </>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {formData.popularPairings.map((pairing) => (
                                <Badge key={pairing} variant="outline" className="gap-1">
                                  <Heart className="w-3 h-3" />
                                  {pairing}
                                  {!isViewMode && (
                                    <button onClick={() => removePairing(pairing)}>
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {!isDeleteMode && !success && (
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {step > 1 && !isViewMode && (
                      <Button variant="outline" onClick={() => setStep(step - 1)}>
                        Previous
                      </Button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={onClose}>
                      {isViewMode ? 'Close' : 'Cancel'}
                    </Button>
                    
                    {!isViewMode && (
                      <>
                        {step < totalSteps ? (
                          <Button 
                            onClick={() => setStep(step + 1)}
                            disabled={!formData.name || !formData.categoryId || formData.basePrice <= 0}
                          >
                            Next
                          </Button>
                        ) : (
                          <Button 
                            onClick={handleSubmit} 
                            disabled={loading || !formData.name || !formData.categoryId || formData.basePrice <= 0}
                            className="gap-2"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {modalType === 'create' ? 'Creating...' : 'Updating...'}
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4" />
                                {modalType === 'create' ? 'Create Product' : 'Update Product'}
                              </>
                            )}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}