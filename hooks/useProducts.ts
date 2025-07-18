import { useState, useEffect, useCallback } from 'react';
import { ProductService } from '@/lib/services/productService';
import { ProductWithDetails, ProductInput, ProductSearchFilters } from '@/types/product';

export interface UseProductsReturn {
  products: ProductWithDetails[];
  loading: boolean;
  error: string | null;
  stats: {
    totalProducts: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
  };
  refetch: () => Promise<void>;
  createProduct: (productData: ProductInput) => Promise<ProductWithDetails>;
  updateProduct: (productId: string, productData: ProductInput) => Promise<ProductWithDetails>;
  deleteProduct: (productId: string) => Promise<void>;
  updateInventory: (productId: string, count: number, type?: 'set' | 'add' | 'subtract') => Promise<void>;
  duplicateProduct: (product: ProductWithDetails) => Promise<ProductWithDetails>;
  bulkUpdate: (productIds: string[], updates: any) => Promise<void>;
}

export function useProducts(organizationId: string): UseProductsReturn {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate stats
  const stats = {
    totalProducts: products.filter(p => p.is_active).length,
    inStock: products.filter(p => p.is_active && p.status === 'in_stock').length,
    lowStock: products.filter(p => p.is_active && p.status === 'low_stock').length,
    outOfStock: products.filter(p => p.is_active && p.status === 'out_of_stock').length,
    totalValue: products.filter(p => p.is_active).reduce((sum, p) => sum + (p.inventory_count * p.cost_per_unit), 0)
  };

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProductService.fetchProducts(organizationId);
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  // Create product
  const createProduct = useCallback(async (productData: ProductInput): Promise<ProductWithDetails> => {
    try {
      const newProduct = await ProductService.createProduct(productData);
      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create product';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Update product
  const updateProduct = useCallback(async (productId: string, productData: ProductInput): Promise<ProductWithDetails> => {
    try {
      const updatedProduct = await ProductService.updateProduct(productId, productData);
      setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));
      return updatedProduct;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update product';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Delete product
  const deleteProduct = useCallback(async (productId: string): Promise<void> => {
    try {
      await ProductService.deleteProduct(productId);
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, is_active: false } : p));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete product';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Update inventory
  const updateInventory = useCallback(async (
    productId: string, 
    count: number, 
    type: 'set' | 'add' | 'subtract' = 'set'
  ): Promise<void> => {
    try {
      await ProductService.updateInventory(productId, count, type);
      
      // Update local state optimistically
      setProducts(prev => prev.map(p => {
        if (p.id === productId) {
          let newCount = count;
          if (type === 'add') {
            newCount = p.inventory_count + count;
          } else if (type === 'subtract') {
            newCount = Math.max(0, p.inventory_count - count);
          }
          
          // Calculate new status
          let newStatus: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
          if (newCount === 0) {
            newStatus = 'out_of_stock';
          } else if (newCount <= p.minimum_stock) {
            newStatus = 'low_stock';
          }
          
          return { ...p, inventory_count: newCount, status: newStatus };
        }
        return p;
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update inventory';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Duplicate product
  const duplicateProduct = useCallback(async (product: ProductWithDetails): Promise<ProductWithDetails> => {
    try {
      const duplicateData: ProductInput = {
        organizationId,
        entity_name: `${product.entity_name} (Copy)`,
        entity_code: ProductService.generateProductCode(product.category, product.entity_name),
        fields: {
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
          shelf_life_days: product.shelf_life_days
        }
      };
      
      return await createProduct(duplicateData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate product';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [organizationId, createProduct]);

  // Bulk update
  const bulkUpdate = useCallback(async (productIds: string[], updates: any): Promise<void> => {
    try {
      await ProductService.bulkUpdateProducts(productIds, updates);
      
      // Optimistically update local state
      setProducts(prev => prev.map(p => {
        if (productIds.includes(p.id)) {
          return { ...p, ...updates };
        }
        return p;
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk update products';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

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
    duplicateProduct,
    bulkUpdate
  };
}