'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Package, Coffee, Cake, TrendingUp, DollarSign,
  Plus, Settings, Download, Upload, BarChart3,
  Star, Clock, Users, Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/revolutionary-card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Navbar } from '@/components/ui/navbar'
import ProductCatalogManager from '@/components/restaurant/ProductCatalogManager'

export default function RestaurantProductsPage() {
  const [activeTab, setActiveTab] = useState('catalog')
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product)
    console.log('Selected product:', product)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation Bar with User Info */}
      <Navbar />
      
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Product Catalog Management
              </h1>
              <p className="text-xl text-blue-100 mb-4">
                Manage your restaurant's menu items using HERA Universal Schema
              </p>
              <div className="flex items-center justify-center gap-6 text-blue-200 text-sm">
                <div className="flex items-center gap-2">
                  <Coffee className="w-4 h-4" />
                  <span>Tea Specialties</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cake className="w-4 h-4" />
                  <span>Fresh Pastries</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span>Universal Architecture</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 -mt-8 relative z-10">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">--</div>
                <div className="text-sm text-gray-600">Total Products</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">₹--</div>
                <div className="text-sm text-gray-600">Avg. Price</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">--m</div>
                <div className="text-sm text-gray-600">Avg. Prep Time</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">--</div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200 bg-gray-50/50">
              <TabsList className="grid w-full grid-cols-4 bg-transparent border-none">
                <TabsTrigger value="catalog" className="py-4 px-6">
                  <Package className="w-4 h-4 mr-2" />
                  Product Catalog
                </TabsTrigger>
                <TabsTrigger value="analytics" className="py-4 px-6">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="inventory" className="py-4 px-6">
                  <Users className="w-4 h-4 mr-2" />
                  Inventory
                </TabsTrigger>
                <TabsTrigger value="settings" className="py-4 px-6">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="catalog" className="p-6">
              <ProductCatalogManager
                onProductSelect={handleProductSelect}
                viewMode="management"
                showCreateButton={true}
              />
            </TabsContent>

            <TabsContent value="analytics" className="p-6">
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">Product Analytics</h3>
                <p className="text-gray-600 mb-6">
                  Detailed analytics and insights about your product performance coming soon.
                </p>
                <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <Card className="p-6">
                    <h4 className="font-semibold mb-2">Sales Performance</h4>
                    <p className="text-sm text-gray-600">Track which products sell best</p>
                  </Card>
                  <Card className="p-6">
                    <h4 className="font-semibold mb-2">Pricing Analysis</h4>
                    <p className="text-sm text-gray-600">Optimize pricing strategies</p>
                  </Card>
                  <Card className="p-6">
                    <h4 className="font-semibold mb-2">Customer Preferences</h4>
                    <p className="text-sm text-gray-600">Understand customer choices</p>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="inventory" className="p-6">
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">Inventory Management</h3>
                <p className="text-gray-600 mb-6">
                  Track stock levels, set reorder points, and manage supplier relationships.
                </p>
                <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <Card className="p-6">
                    <h4 className="font-semibold mb-2">Stock Levels</h4>
                    <p className="text-sm text-gray-600">Monitor current inventory</p>
                  </Card>
                  <Card className="p-6">
                    <h4 className="font-semibold mb-2">Reorder Alerts</h4>
                    <p className="text-sm text-gray-600">Automated reorder notifications</p>
                  </Card>
                  <Card className="p-6">
                    <h4 className="font-semibold mb-2">Supplier Management</h4>
                    <p className="text-sm text-gray-600">Manage supplier relationships</p>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="p-6">
              <div className="max-w-2xl mx-auto space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Catalog Settings</h3>
                  <div className="space-y-4">
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Auto-generate SKUs</h4>
                          <p className="text-sm text-gray-600">Automatically create SKUs for new products</p>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Price Rules</h4>
                          <p className="text-sm text-gray-600">Set up automatic pricing rules and modifiers</p>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Category Management</h4>
                          <p className="text-sm text-gray-600">Organize and restructure product categories</p>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                    </Card>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Import/Export</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="p-6 text-center">
                      <Upload className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                      <h4 className="font-medium mb-2">Import Products</h4>
                      <p className="text-sm text-gray-600 mb-4">Bulk import from CSV or Excel</p>
                      <Button variant="outline" className="w-full">
                        Choose File
                      </Button>
                    </Card>

                    <Card className="p-6 text-center">
                      <Download className="w-8 h-8 mx-auto mb-3 text-green-600" />
                      <h4 className="font-medium mb-2">Export Catalog</h4>
                      <p className="text-sm text-gray-600 mb-4">Download complete product list</p>
                      <Button variant="outline" className="w-full">
                        Export CSV
                      </Button>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Architecture Showcase */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="text-center mb-4">
            <Badge className="gap-1 bg-green-500 text-white mb-3">
              <Star className="w-3 h-3" />
              HERA Universal Architecture
            </Badge>
            <h3 className="text-lg font-semibold text-green-800">
              Powered by Universal Schema Technology
            </h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Package className="w-4 h-4 text-white" />
              </div>
              <div className="font-medium text-green-800">Universal Entities</div>
              <div className="text-green-600">Products stored as core_entities with rich metadata</div>
            </div>
            
            <div className="text-center p-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div className="font-medium text-green-800">Organization Isolation</div>
              <div className="text-green-600">Complete multi-tenant data separation</div>
            </div>
            
            <div className="text-center p-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div className="font-medium text-green-800">Infinite Scalability</div>
              <div className="text-green-600">No schema changes needed for new features</div>
            </div>
          </div>
        </Card>

        {/* Selected Product Details */}
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Selected Product Details
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(selectedProduct, null, 2)}
                </pre>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}