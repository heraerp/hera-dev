"use client";

import React, { useState, useEffect } from 'react';
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package, ArrowLeft, Plus, Building2 } from 'lucide-react';
import Link from 'next/link';

// Import CRUD Template System
import { HERAUniversalCRUD } from '@/templates/crud/components/HERAUniversalCRUD';
import { CRUDConfig } from '@/templates/crud/types/crud-types';

// Import Product Configuration
import { 
  ALL_PRODUCT_FIELDS, 
  PRODUCT_FIELD_GROUPS,
  ESSENTIAL_PRODUCT_FIELDS,
  QUICK_CREATE_FIELDS
} from '@/lib/crud-configs/product-fields';
import { 
  createProductServiceAdapter, 
  ProductCRUDEntity 
} from '@/lib/crud-configs/product-service-adapter';

/**
 * Enhanced Product Management Page
 * Uses CRUD templates with existing ProductCatalogService
 * Provides advanced features while maintaining all business logic
 */
const EnhancedProductsPage = () => {
  const { 
    restaurantData, 
    loading: restaurantLoading, 
    error: restaurantError 
  } = useRestaurantManagement();

  const [productService, setProductService] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize product service when restaurant data is available
  useEffect(() => {
    if (restaurantData?.organizationId && !productService) {
      console.log('🚀 Initializing enhanced product service for:', restaurantData.businessName);
      
      const service = createProductServiceAdapter();
      setProductService(service);
      setIsInitialized(true);
      
      console.log('✅ Product service initialized with organization:', restaurantData.organizationId);
    }
  }, [restaurantData, productService]);

  // Loading state
  if (restaurantLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6 flex items-center justify-center">
        <Card className="p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading Products</h3>
            <p className="text-gray-600">Fetching your restaurant information...</p>
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (restaurantError || !restaurantData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6 flex items-center justify-center">
        <Card className="p-8 max-w-lg w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Unable to Load Products</h3>
            <p className="text-gray-600 mb-4">
              {restaurantError || "No restaurant found. Please complete restaurant setup first."}
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                🔄 Retry
              </Button>
              <Button 
                onClick={() => window.location.href = '/setup/restaurant'}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                Setup Restaurant
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Product service not ready
  if (!isInitialized || !productService) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6 flex items-center justify-center">
        <Card className="p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-pulse rounded-full h-12 w-12 bg-emerald-200 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Initializing Product System</h3>
            <p className="text-gray-600">Setting up advanced product management...</p>
          </div>
        </Card>
      </div>
    );
  }

  // Define custom actions for product management
  const productActions = [
    {
      key: 'view',
      label: 'View',
      icon: Package,
      variant: 'outline' as const,
      position: ['row'] as const,
      onClick: (item: any) => {
        console.log('View product:', item);
        // TODO: Implement view action
      }
    },
    {
      key: 'edit',
      label: 'Edit',
      icon: Package,
      variant: 'default' as const,
      position: ['row'] as const,
      onClick: (item: any) => {
        console.log('Edit product:', item);
        // TODO: Implement edit action
      }
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: Package,
      variant: 'destructive' as const,
      position: ['row'] as const,
      confirm: 'Are you sure you want to delete this product?',
      onClick: (item: any) => {
        console.log('Delete product:', item);
        // TODO: Implement delete action
      }
    }
  ];

  // Define bulk operations
  const bulkOperations = [
    {
      key: 'activate',
      label: 'Activate Products',
      description: 'Mark selected products as active',
      icon: Package,
      execute: async (selectedIds: string[], items: any[]) => {
        console.log('Bulk activate products:', selectedIds);
        // TODO: Implement bulk activation
      }
    },
    {
      key: 'deactivate',
      label: 'Deactivate Products',
      description: 'Mark selected products as inactive',
      icon: Package,
      execute: async (selectedIds: string[], items: any[]) => {
        console.log('Bulk deactivate products:', selectedIds);
        // TODO: Implement bulk deactivation
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/restaurant" className="p-2 rounded-xl bg-white/80 hover:bg-white transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                Enhanced Product Management
              </h1>
              <p className="text-gray-600 mt-1">
                {restaurantData.businessName} • Advanced CRUD Template System
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Status Badge */}
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Building2 className="w-4 h-4 mr-1" />
              Enhanced UI
            </Badge>
            
            {/* Quick Actions */}
            <Link href="/restaurant/products">
              <Button variant="outline" size="sm">
                View Classic UI
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/80 backdrop-blur border-green-200">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Package className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">Advanced CRUD</p>
              <p className="text-xs text-gray-600">Template-based UI</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Plus className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">Bulk Operations</p>
              <p className="text-xs text-gray-600">Multi-select actions</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur border-purple-200">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Package className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">Export Data</p>
              <p className="text-xs text-gray-600">CSV, Excel export</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur border-orange-200">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Package className="w-4 h-4 text-orange-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">Virtual Scrolling</p>
              <p className="text-xs text-gray-600">High performance</p>
            </CardContent>
          </Card>
        </div>

        {/* Main CRUD Interface */}
        <Card className="bg-white/90 backdrop-blur shadow-xl border-0">
          <CardContent className="p-0">
            <HERAUniversalCRUD
              entityType="product"
              entityTypeLabel="Products"
              entitySingular="product"
              entitySingularLabel="Product"
              service={productService}
              fields={ALL_PRODUCT_FIELDS}
              actions={productActions}
              bulkOperations={bulkOperations}
              enableSearch={true}
              enableFilters={true}
              enableSorting={true}
              enablePagination={true}
              enableBulkActions={true}
              enableExport={true}
              enableRealTime={false}
              enableVirtualScrolling={false}
              organizationId={restaurantData.organizationId}
              pagination={{
                pageSize: 25,
                showPageSizeSelector: true,
                showQuickJumper: true,
                showTotal: true
              }}
              permissions={{
                create: true,
                read: true,
                update: true,
                delete: true,
                export: true
              }}
              onError={(error) => {
                console.error('Product CRUD error:', error);
              }}
              onSuccess={(message, operation) => {
                console.log(`Product ${operation} successful:`, message);
              }}
              onReady={() => {
                console.log('✅ Product CRUD system ready');
              }}
            />
          </CardContent>
        </Card>
        
        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Enhanced Product Management • Powered by HERA Universal CRUD Templates
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProductsPage;