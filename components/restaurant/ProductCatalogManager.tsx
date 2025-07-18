'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, Plus, Search, Filter, Grid, List, Edit, Trash2,
  Eye, Coffee, Cake, Leaf, Clock, DollarSign, Star,
  ChevronDown, ChevronRight, Settings, Download, Upload,
  AlertCircle, CheckCircle, Loader2, Tag, Users, TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/revolutionary-card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import ProductCatalogService from '@/lib/services/productCatalogService'
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement'
import ProductCrudModals from './ProductCrudModals'

interface ProductCatalogManagerProps {
  onProductSelect?: (product: any) => void
  viewMode?: 'management' | 'selection'
  showCreateButton?: boolean
}

interface CatalogState {
  categories: any[]
  products: any[]
  categorizedProducts: any[]
  loading: boolean
  error: string | null
  searchTerm: string
  selectedCategory: string
  viewMode: 'grid' | 'list'
  showInactive: boolean
}

export default function ProductCatalogManager({
  onProductSelect,
  viewMode = 'management',
  showCreateButton = true
}: ProductCatalogManagerProps) {
  const { restaurantData, loading: restaurantLoading } = useRestaurantManagement()
  const [isInitializing, setIsInitializing] = useState(false)
  const [initProgress, setInitProgress] = useState(0)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  
  const [state, setState] = useState<CatalogState>({
    categories: [],
    products: [],
    categorizedProducts: [],
    loading: true,
    error: null,
    searchTerm: '',
    selectedCategory: 'all',
    viewMode: 'grid',
    showInactive: false
  })

  // CRUD Modal State
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view' | 'delete' | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  useEffect(() => {
    if (restaurantData?.organizationId) {
      loadProductCatalog()
    }
  }, [restaurantData?.organizationId])

  const loadProductCatalog = async () => {
    if (!restaurantData?.organizationId) return

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      console.log('🔍 Loading product catalog for organization:', restaurantData.organizationId)
      
      const result = await ProductCatalogService.getProductCatalog(restaurantData.organizationId)
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          categories: result.data?.categories || [],
          products: result.data?.products || [],
          categorizedProducts: result.data?.categorizedProducts || [],
          loading: false
        }))
        console.log('✅ Product catalog loaded:', result.data)
      } else {
        throw new Error(result.error || 'Failed to load catalog')
      }
    } catch (error) {
      console.error('❌ Failed to load product catalog:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load catalog',
        loading: false
      }))
    }
  }

  const initializeProductCatalog = async () => {
    if (!restaurantData?.organizationId) return

    setIsInitializing(true)
    setInitProgress(0)

    try {
      console.log('🚀 Initializing product catalog...')
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setInitProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const result = await ProductCatalogService.initializeProductCatalog(restaurantData.organizationId)
      
      clearInterval(progressInterval)
      setInitProgress(100)
      
      if (result.success) {
        console.log('✅ Product catalog initialized successfully')
        setTimeout(() => {
          setIsInitializing(false)
          loadProductCatalog()
        }, 1000)
      } else {
        throw new Error(result.error || 'Initialization failed')
      }
    } catch (error) {
      console.error('❌ Product catalog initialization failed:', error)
      setIsInitializing(false)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Initialization failed'
      }))
    }
  }

  const handleSearch = async () => {
    if (!restaurantData?.organizationId || !state.searchTerm.trim()) {
      loadProductCatalog()
      return
    }

    setState(prev => ({ ...prev, loading: true }))

    try {
      const result = await ProductCatalogService.searchProducts(
        restaurantData.organizationId,
        state.searchTerm,
        {
          categoryId: state.selectedCategory !== 'all' ? state.selectedCategory : undefined
        }
      )

      if (result.success) {
        setState(prev => ({
          ...prev,
          products: result.data || [],
          loading: false
        }))
      } else {
        throw new Error(result.error || 'Search failed')
      }
    } catch (error) {
      console.error('❌ Product search failed:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Search failed',
        loading: false
      }))
    }
  }

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const getProductIcon = (productType: string) => {
    switch (productType) {
      case 'tea': return <Coffee className="w-4 h-4" />
      case 'pastry': return <Cake className="w-4 h-4" />
      case 'beverage': return <Coffee className="w-4 h-4" />
      case 'food': return <Package className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  const getCategoryIcon = (categoryType: string) => {
    switch (categoryType) {
      case 'tea': return <Leaf className="w-5 h-5" />
      case 'pastry': return <Cake className="w-5 h-5" />
      case 'beverage': return <Coffee className="w-5 h-5" />
      default: return <Package className="w-5 h-5" />
    }
  }

  // CRUD Modal Handlers
  const openCreateModal = () => {
    setSelectedProduct(null)
    setModalType('create')
  }

  const openEditModal = (product: any) => {
    setSelectedProduct(product)
    setModalType('edit')
  }

  const openViewModal = (product: any) => {
    setSelectedProduct(product)
    setModalType('view')
  }

  const openDeleteModal = (product: any) => {
    setSelectedProduct(product)
    setModalType('delete')
  }

  const closeModal = () => {
    setModalType(null)
    setSelectedProduct(null)
  }

  const handleModalSuccess = () => {
    loadProductCatalog() // Reload the catalog after successful CRUD operation
  }

  const filteredProducts = state.selectedCategory === 'all' 
    ? state.products 
    : state.products.filter(product => 
        product.dynamicData?.category_id?.value === state.selectedCategory
      )

  if (restaurantLoading) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Loading restaurant data...</p>
      </Card>
    )
  }

  if (!restaurantData?.organizationId) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
        <h3 className="text-lg font-semibold mb-2">Restaurant Setup Required</h3>
        <p className="text-gray-600 mb-4">
          Please complete your restaurant setup to access product management.
        </p>
        <Button onClick={() => window.location.href = '/setup/restaurant'}>
          Complete Setup
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Catalog</h1>
          <p className="text-gray-600">
            Manage your restaurant's menu items, categories, and pricing
          </p>
        </div>
        
        {showCreateButton && (
          <div className="flex gap-3">
            {state.categories.length === 0 && (
              <Button
                onClick={initializeProductCatalog}
                disabled={isInitializing}
                className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {isInitializing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4" />
                    Initialize Sample Catalog
                  </>
                )}
              </Button>
            )}
            
            <Button className="gap-2" onClick={openCreateModal}>
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </div>
        )}
      </div>

      {/* Initialization Progress */}
      {isInitializing && (
        <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-green-600" />
              <span className="font-medium text-green-800">
                Initializing Product Catalog...
              </span>
            </div>
            <Progress value={initProgress} className="h-2" />
            <p className="text-sm text-green-700">
              Creating categories, products, and variants for your tea shop
            </p>
          </div>
        </Card>
      )}

      {/* Error Display */}
      {state.error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Error</p>
              <p className="text-sm text-red-600">{state.error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadProductCatalog}
              className="ml-auto"
            >
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={state.searchTerm}
                onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            
            <Select
              value={state.selectedCategory}
              onValueChange={(value) => setState(prev => ({ ...prev, selectedCategory: value }))}
            >
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {state.categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.entity_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button onClick={handleSearch} variant="outline">
              Search
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant={state.viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setState(prev => ({ ...prev, viewMode: 'grid' }))}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={state.viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setState(prev => ({ ...prev, viewMode: 'list' }))}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Content */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Category Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Categories
            </h3>
            
            <div className="space-y-2">
              {state.categories.map((category) => {
                const isExpanded = expandedCategories.has(category.id)
                const categoryProducts = state.products.filter(product =>
                  product.dynamicData?.category_id?.value === category.id
                )
                
                return (
                  <div key={category.id} className="space-y-1">
                    <div
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        state.selectedCategory === category.id
                          ? 'bg-blue-100 text-blue-800'
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        setState(prev => ({ ...prev, selectedCategory: category.id }))
                        toggleCategoryExpansion(category.id)
                      }}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                      {getCategoryIcon(category.dynamicData?.category_type?.value)}
                      <span className="text-sm font-medium flex-1">
                        {category.entity_name}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {categoryProducts.length}
                      </Badge>
                    </div>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="ml-6 space-y-1"
                        >
                          {categoryProducts.map((product) => (
                            <div
                              key={product.id}
                              className="flex items-center gap-2 p-2 text-sm text-gray-600 hover:bg-gray-50 rounded cursor-pointer"
                              onClick={() => onProductSelect?.(product)}
                            >
                              {getProductIcon(product.dynamicData?.product_type?.value)}
                              <span className="truncate flex-1">{product.entity_name}</span>
                              <span className="text-xs font-medium">
                                ₹{product.dynamicData?.base_price?.value}
                              </span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Products Grid/List */}
        <div className="lg:col-span-3">
          {state.loading ? (
            <Card className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading products...</p>
            </Card>
          ) : filteredProducts.length === 0 ? (
            <Card className="p-8 text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
              <p className="text-gray-600 mb-4">
                {state.searchTerm
                  ? `No products match "${state.searchTerm}"`
                  : 'Start by adding your first product or initializing the sample catalog'}
              </p>
              {!state.searchTerm && showCreateButton && (
                <div className="flex gap-3 justify-center">
                  {state.categories.length === 0 && (
                    <Button onClick={initializeProductCatalog} variant="outline">
                      <Star className="w-4 h-4 mr-2" />
                      Initialize Sample Catalog
                    </Button>
                  )}
                  <Button onClick={openCreateModal}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              )}
            </Card>
          ) : (
            <div className={
              state.viewMode === 'grid'
                ? 'grid md:grid-cols-2 xl:grid-cols-3 gap-4'
                : 'space-y-4'
            }>
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group">
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      {getProductIcon(product.dynamicData?.product_type?.value)}
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {product.entity_name}
                        </h3>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" onClick={() => openViewModal(product)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(product)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDeleteModal(product)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.dynamicData?.description?.value}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-green-600">
                            ₹{product.dynamicData?.base_price?.value}
                          </span>
                          {product.dynamicData?.preparation_time_minutes?.value && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {product.dynamicData.preparation_time_minutes.value}m
                            </div>
                          )}
                        </div>
                        
                        {product.category && (
                          <Badge variant="secondary" className="text-xs">
                            {product.category.name}
                          </Badge>
                        )}
                      </div>
                      
                      {viewMode === 'management' && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>SKU: {product.dynamicData?.sku?.value}</span>
                            <span>Active</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      {state.products.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Catalog Summary</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{state.categories.length}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{state.products.length}</div>
              <div className="text-sm text-gray-600">Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                ₹{Math.round(state.products.reduce((sum, p) => sum + parseFloat(p.dynamicData?.base_price?.value || '0'), 0) / state.products.length)}
              </div>
              <div className="text-sm text-gray-600">Avg. Price</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(state.products.reduce((sum, p) => sum + parseFloat(p.dynamicData?.preparation_time_minutes?.value || '0'), 0) / state.products.length)}m
              </div>
              <div className="text-sm text-gray-600">Avg. Prep Time</div>
            </div>
          </div>
        </Card>
      )}

      {/* CRUD Modals */}
      <ProductCrudModals
        organizationId={restaurantData?.organizationId || ''}
        categories={state.categories}
        selectedProduct={selectedProduct}
        modalType={modalType}
        onClose={closeModal}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}