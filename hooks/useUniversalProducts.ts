import { useState, useEffect, useCallback } from 'react';
import { UniversalProductService } from '@/lib/services/universalProductService';
import { ProductWithDetails, ProductStats } from '@/types/product';

export interface UseUniversalProductsReturn {
  products: ProductWithDetails[];
  loading: boolean;
  error: string | null;
  stats: ProductStats;
  refetch: () => Promise<void>;
  createProduct: (productData: any) => Promise<{ success: boolean; productId?: string; productCode?: string; error?: string }>;
  updateProduct: (productId: string, productData: any) => Promise<{ success: boolean; error?: string }>;
  deleteProduct: (productId: string) => Promise<{ success: boolean; error?: string }>;
  updateInventory: (productId: string, count: number) => Promise<{ success: boolean; error?: string }>;
  duplicateProduct: (product: ProductWithDetails) => Promise<{ success: boolean; productId?: string; productCode?: string; error?: string }>;
}

export function useUniversalProducts(organizationId: string): UseUniversalProductsReturn {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ProductStats>({
    totalProducts: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0,
    averagePrice: 0,
    averageCost: 0
  });

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching products for organization:', organizationId);
      const result = await UniversalProductService.fetchProducts(organizationId);
      
      if (result.success) {
        const productList = result.products || [];
        setProducts(productList);
        console.log(`✅ Loaded ${productList.length} products`);
        
        // Get stats
        const statsResult = await UniversalProductService.getProductStats(organizationId);
        if (statsResult.success) {
          setStats(statsResult.stats!);
        }
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(errorMessage);
      console.error('❌ Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  // Create product
  const createProduct = useCallback(async (productData: any) => {
    try {
      setError(null);
      console.log('📝 Creating product:', productData.entity_name);
      
      const result = await UniversalProductService.createProduct({
        organizationId,
        entity_name: productData.entity_name,
        entity_code: productData.entity_code,
        metadata: productData.metadata || productData
      });
      
      if (result.success) {
        console.log('✅ Product created successfully:', result.productCode);
        // Refresh products list
        await fetchProducts();
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create product';
      setError(errorMessage);
      console.error('❌ Error creating product:', err);
      return { success: false, error: errorMessage };
    }
  }, [organizationId, fetchProducts]);

  // Update product
  const updateProduct = useCallback(async (productId: string, productData: any) => {
    try {
      setError(null);
      console.log('📝 Updating product:', productId);
      
      const result = await UniversalProductService.updateProduct(productId, {
        organizationId,
        entity_name: productData.entity_name,
        entity_code: productData.entity_code,
        metadata: productData.metadata || productData
      });
      
      if (result.success) {
        console.log('✅ Product updated successfully');
        // Refresh products list
        await fetchProducts();
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update product';
      setError(errorMessage);
      console.error('❌ Error updating product:', err);
      return { success: false, error: errorMessage };
    }
  }, [organizationId, fetchProducts]);

  // Delete product
  const deleteProduct = useCallback(async (productId: string) => {
    try {
      setError(null);
      console.log('🗑️ Deleting product:', productId);
      
      const result = await UniversalProductService.deleteProduct(productId);
      
      if (result.success) {
        console.log('✅ Product deleted successfully');
        // Refresh products list
        await fetchProducts();
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete product';
      setError(errorMessage);
      console.error('❌ Error deleting product:', err);
      return { success: false, error: errorMessage };
    }
  }, [fetchProducts]);

  // Update inventory
  const updateInventory = useCallback(async (productId: string, count: number) => {
    try {
      setError(null);
      console.log('📦 Updating inventory for product:', productId, 'to:', count);
      
      const result = await UniversalProductService.updateInventory(productId, count, organizationId);
      
      if (result.success) {
        console.log('✅ Inventory updated successfully');
        // Refresh products list
        await fetchProducts();
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update inventory';
      setError(errorMessage);
      console.error('❌ Error updating inventory:', err);
      return { success: false, error: errorMessage };
    }
  }, [organizationId, fetchProducts]);

  // Duplicate product
  const duplicateProduct = useCallback(async (product: ProductWithDetails) => {
    try {
      setError(null);
      console.log('📋 Duplicating product:', product.entity_name);
      
      const duplicateData = {
        organizationId,
        entity_name: `${product.entity_name} (Copy)`,
        entity_code: UniversalProductService.generateProductCode(product.category),
        metadata: {
          category: product.category,
          description: product.description,
          product_type: product.product_type,
          price: product.price,
          cost_per_unit: product.cost_per_unit,
          inventory_count: 0, // Start with 0 inventory for duplicate
          minimum_stock: product.minimum_stock,
          unit_type: product.unit_type,
          preparation_time_minutes: product.preparation_time_minutes,
          calories: product.calories,
          allergens: product.allergens,
          serving_temperature: product.serving_temperature,
          caffeine_level: product.caffeine_level,
          origin: product.origin,
          supplier_name: product.supplier_name,
          storage_requirements: product.storage_requirements,
          shelf_life_days: product.shelf_life_days,
          status: 'out_of_stock',
          is_draft: false,
          created_by: organizationId,
          updated_by: organizationId
        }
      };
      
      const result = await UniversalProductService.createProduct(duplicateData);
      
      if (result.success) {
        console.log('✅ Product duplicated successfully:', result.productCode);
        // Refresh products list
        await fetchProducts();
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate product';
      setError(errorMessage);
      console.error('❌ Error duplicating product:', err);
      return { success: false, error: errorMessage };
    }
  }, [organizationId, fetchProducts]);

  // Initial fetch
  useEffect(() => {
    if (organizationId) {
      fetchProducts();
    }
  }, [organizationId, fetchProducts]);

  return {
    products,
    loading,
    error,
    stats,
    refetch: fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    updateInventory,
    duplicateProduct
  };
}