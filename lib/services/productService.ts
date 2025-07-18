import UniversalCrudService from '@/lib/services/universalCrudService';
import { ProductEntity, ProductDynamicData, ProductInput, ProductWithDetails } from '@/types/product';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// Product field definitions following HERA universal schema
export const PRODUCT_FIELDS = {
  price: 'decimal',
  category: 'text',
  description: 'text',
  preparation_time_minutes: 'integer',
  inventory_count: 'integer',
  serving_temperature: 'text',
  caffeine_level: 'text',
  origin: 'text',
  allergens: 'text',
  calories: 'integer',
  cost_per_unit: 'decimal',
  supplier_name: 'text',
  minimum_stock: 'integer',
  product_type: 'text',
  unit_type: 'text',
  storage_requirements: 'text',
  shelf_life_days: 'integer',
  status: 'text',
  is_draft: 'boolean',
  created_by: 'text',
  updated_by: 'text'
} as const;

export class ProductService {
  /**
   * Transform raw database data into product objects
   */
  private static transformProductData(entities: any[]): ProductWithDetails[] {
    return entities.map(entity => {
      const product: ProductWithDetails = {
        id: entity.id,
        organization_id: entity.organization_id,
        entity_type: entity.entity_type,
        entity_name: entity.entity_name,
        entity_code: entity.entity_code,
        is_active: entity.is_active,
        created_at: entity.created_at,
        updated_at: entity.updated_at,
        // Default values
        price: 0,
        category: 'supplies',
        description: '',
        preparation_time_minutes: 0,
        inventory_count: 0,
        serving_temperature: '',
        caffeine_level: '',
        origin: '',
        allergens: 'None',
        calories: 0,
        cost_per_unit: 0,
        supplier_name: '',
        minimum_stock: 10,
        product_type: 'finished_good',
        unit_type: 'pieces',
        storage_requirements: '',
        shelf_life_days: 0,
        status: 'in_stock',
        is_draft: false,
        created_by: '',
        updated_by: ''
      };

      // Apply dynamic data
      if (entity.core_dynamic_data) {
        entity.core_dynamic_data.forEach((data: any) => {
          const fieldName = data.field_name;
          let fieldValue = data.field_value;

          // Type conversion based on field type
          if (data.field_type === 'decimal' || data.field_type === 'integer') {
            fieldValue = parseFloat(fieldValue) || 0;
          } else if (data.field_type === 'boolean') {
            fieldValue = fieldValue === 'true';
          } else if (data.field_type === 'json') {
            try {
              fieldValue = JSON.parse(fieldValue);
            } catch (e) {
              fieldValue = fieldValue;
            }
          }

          product[fieldName] = fieldValue;
        });
      }

      // Calculate status based on inventory
      if (product.inventory_count === 0) {
        product.status = 'out_of_stock';
      } else if (product.inventory_count <= product.minimum_stock) {
        product.status = 'low_stock';
      } else {
        product.status = 'in_stock';
      }

      return product;
    });
  }

  /**
   * Fetch all products for an organization
   */
  static async fetchProducts(organizationId: string): Promise<ProductWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('core_entities')
        .select(`
          *,
          core_dynamic_data (
            field_name,
            field_value,
            field_type,
            created_at,
            updated_at
          )
        `)
        .eq('organization_id', organizationId)
        .eq('entity_type', 'product')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      return this.transformProductData(data || []);
    } catch (error) {
      console.error('Error in fetchProducts:', error);
      throw error;
    }
  }

  /**
   * Fetch a single product by ID
   */
  static async fetchProductById(productId: string): Promise<ProductWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from('core_entities')
        .select(`
          *,
          core_dynamic_data (
            field_name,
            field_value,
            field_type,
            created_at,
            updated_at
          )
        `)
        .eq('id', productId)
        .eq('entity_type', 'product')
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        throw error;
      }

      if (!data) return null;

      const products = this.transformProductData([data]);
      return products[0] || null;
    } catch (error) {
      console.error('Error in fetchProductById:', error);
      throw error;
    }
  }

  /**
   * Create a new product
   */
  static async createProduct(productInput: ProductInput): Promise<ProductWithDetails> {
    try {
      // Start transaction
      const { data: entity, error: entityError } = await supabase
        .from('core_entities')
        .insert({
          organization_id: productInput.organizationId,
          entity_type: 'product',
          entity_name: productInput.entity_name,
          entity_code: productInput.entity_code,
          is_active: true
        })
        .select()
        .single();

      if (entityError) {
        console.error('Error creating product entity:', entityError);
        throw entityError;
      }

      // Create dynamic data entries
      const dynamicData = Object.entries(productInput.fields || {})
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([fieldName, fieldValue]) => ({
          organization_id: entity.organization_id,
          entity_id: entity.id,
          entity_type: 'product',
          metadata_type: 'product_data',
          metadata_category: 'product',
          metadata_scope: 'public',
          metadata_key: fieldName,
          metadata_value: String(fieldValue),
          metadata_value_type: PRODUCT_FIELDS[fieldName as keyof typeof PRODUCT_FIELDS] || 'text',
          is_active: true
        }));

      if (dynamicData.length > 0) {
        const { error: dynamicError } = await supabase
          .from('core_metadata')
          .insert(dynamicData);

        if (dynamicError) {
          console.error('Error creating product dynamic data:', dynamicError);
          // Clean up entity if dynamic data fails
          await supabase
            .from('core_entities')
            .delete()
            .eq('id', entity.id);
          throw dynamicError;
        }
      }

      // Fetch the complete product
      const createdProduct = await this.fetchProductById(entity.id);
      if (!createdProduct) {
        throw new Error('Failed to fetch created product');
      }

      return createdProduct;
    } catch (error) {
      console.error('Error in createProduct:', error);
      throw error;
    }
  }

  /**
   * Update an existing product
   */
  static async updateProduct(productId: string, productInput: ProductInput): Promise<ProductWithDetails> {
    try {
      // Update entity
      const { error: entityError } = await supabase
        .from('core_entities')
        .update({
          entity_name: productInput.entity_name,
          entity_code: productInput.entity_code,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (entityError) {
        console.error('Error updating product entity:', entityError);
        throw entityError;
      }

      // Delete existing dynamic data
      const { error: deleteError } = await supabase
        .from('core_metadata')
        .delete()
        .eq('entity_id', productId)
        .eq('entity_type', 'product');

      if (deleteError) {
        console.error('Error deleting existing dynamic data:', deleteError);
        throw deleteError;
      }

      // Insert new dynamic data
      const dynamicData = Object.entries(productInput.fields || {})
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([fieldName, fieldValue]) => ({
          organization_id: productInput.organizationId,
          entity_id: productId,
          entity_type: 'product',
          metadata_type: 'product_data',
          metadata_category: 'product',
          metadata_scope: 'public',
          metadata_key: fieldName,
          metadata_value: String(fieldValue),
          metadata_value_type: PRODUCT_FIELDS[fieldName as keyof typeof PRODUCT_FIELDS] || 'text',
          is_active: true
        }));

      if (dynamicData.length > 0) {
        const { error: dynamicError } = await supabase
          .from('core_metadata')
          .insert(dynamicData);

        if (dynamicError) {
          console.error('Error creating updated dynamic data:', dynamicError);
          throw dynamicError;
        }
      }

      // Fetch the updated product
      const updatedProduct = await this.fetchProductById(productId);
      if (!updatedProduct) {
        throw new Error('Failed to fetch updated product');
      }

      return updatedProduct;
    } catch (error) {
      console.error('Error in updateProduct:', error);
      throw error;
    }
  }

  /**
   * Delete/Archive a product
   */
  static async deleteProduct(productId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('core_entities')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (error) {
        console.error('Error deleting product:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteProduct:', error);
      throw error;
    }
  }

  /**
   * Search products by name, code, or description
   */
  static async searchProducts(
    organizationId: string, 
    query: string, 
    filters: {
      category?: string;
      status?: string;
      product_type?: string;
    } = {}
  ): Promise<ProductWithDetails[]> {
    try {
      let supabaseQuery = supabase
        .from('core_entities')
        .select(`
          *,
          core_dynamic_data (
            field_name,
            field_value,
            field_type,
            created_at,
            updated_at
          )
        `)
        .eq('organization_id', organizationId)
        .eq('entity_type', 'product')
        .eq('is_active', true);

      // Add text search
      if (query) {
        supabaseQuery = supabaseQuery.or(`entity_name.ilike.%${query}%,entity_code.ilike.%${query}%`);
      }

      const { data, error } = await supabaseQuery.order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching products:', error);
        throw error;
      }

      let products = this.transformProductData(data || []);

      // Apply filters
      if (filters.category && filters.category !== 'all') {
        products = products.filter(p => p.category === filters.category);
      }

      if (filters.status && filters.status !== 'all') {
        products = products.filter(p => p.status === filters.status);
      }

      if (filters.product_type && filters.product_type !== 'all') {
        products = products.filter(p => p.product_type === filters.product_type);
      }

      // Apply text search on description and other fields
      if (query) {
        const queryLower = query.toLowerCase();
        products = products.filter(p => 
          p.entity_name.toLowerCase().includes(queryLower) ||
          p.entity_code.toLowerCase().includes(queryLower) ||
          p.description.toLowerCase().includes(queryLower) ||
          p.allergens.toLowerCase().includes(queryLower) ||
          p.origin.toLowerCase().includes(queryLower) ||
          p.supplier_name.toLowerCase().includes(queryLower)
        );
      }

      return products;
    } catch (error) {
      console.error('Error in searchProducts:', error);
      throw error;
    }
  }

  /**
   * Update product inventory
   */
  static async updateInventory(
    productId: string, 
    inventoryCount: number,
    updateType: 'set' | 'add' | 'subtract' = 'set'
  ): Promise<void> {
    try {
      // First, get the product entity to get organization_id
      const { data: productEntity, error: entityError } = await supabase
        .from('core_entities')
        .select('organization_id')
        .eq('id', productId)
        .single();

      if (entityError) {
        console.error('Error fetching product entity:', entityError);
        throw entityError;
      }

      // Then, get current inventory
      const { data: currentData, error: fetchError } = await supabase
        .from('core_metadata')
        .select('metadata_value')
        .eq('entity_id', productId)
        .eq('metadata_key', 'inventory_count')
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching current inventory:', fetchError);
        throw fetchError;
      }

      let newInventoryCount = inventoryCount;

      if (updateType === 'add' && currentData) {
        newInventoryCount = (parseInt(currentData.metadata_value) || 0) + inventoryCount;
      } else if (updateType === 'subtract' && currentData) {
        newInventoryCount = Math.max(0, (parseInt(currentData.metadata_value) || 0) - inventoryCount);
      }

      // Update or insert inventory count
      const { error: upsertError } = await supabase
        .from('core_metadata')
        .upsert({
          organization_id: productEntity.organization_id,
          entity_id: productId,
          entity_type: 'product',
          metadata_type: 'product_data',
          metadata_category: 'product',
          metadata_scope: 'public',
          metadata_key: 'inventory_count',
          metadata_value: String(newInventoryCount),
          metadata_value_type: 'integer',
          is_active: true
        }, {
          onConflict: 'entity_id,metadata_key'
        });

      if (upsertError) {
        console.error('Error updating inventory:', upsertError);
        throw upsertError;
      }
    } catch (error) {
      console.error('Error in updateInventory:', error);
      throw error;
    }
  }

  /**
   * Get product analytics/stats
   */
  static async getProductAnalytics(organizationId: string): Promise<{
    totalProducts: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
    topCategories: Array<{ category: string; count: number }>;
  }> {
    try {
      const products = await this.fetchProducts(organizationId);
      
      const stats = {
        totalProducts: products.length,
        inStock: products.filter(p => p.status === 'in_stock').length,
        lowStock: products.filter(p => p.status === 'low_stock').length,
        outOfStock: products.filter(p => p.status === 'out_of_stock').length,
        totalValue: products.reduce((sum, p) => sum + (p.inventory_count * p.cost_per_unit), 0),
        topCategories: []
      };

      // Calculate top categories
      const categoryCount = products.reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      stats.topCategories = Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return stats;
    } catch (error) {
      console.error('Error in getProductAnalytics:', error);
      throw error;
    }
  }

  /**
   * Bulk update products
   */
  static async bulkUpdateProducts(
    productIds: string[], 
    updates: Partial<ProductInput['fields']>
  ): Promise<void> {
    try {
      const updatePromises = productIds.map(async (productId) => {
        // Get organization_id for each product
        const { data: productEntity, error: entityError } = await supabase
          .from('core_entities')
          .select('organization_id')
          .eq('id', productId)
          .single();

        if (entityError) {
          console.error(`Error fetching product ${productId}:`, entityError);
          throw entityError;
        }

        const dynamicData = Object.entries(updates)
          .filter(([_, value]) => value !== undefined && value !== null && value !== '')
          .map(([fieldName, fieldValue]) => ({
            organization_id: productEntity.organization_id,
            entity_id: productId,
            entity_type: 'product',
            metadata_type: 'product_data',
            metadata_category: 'product',
            metadata_scope: 'public',
            metadata_key: fieldName,
            metadata_value: String(fieldValue),
            metadata_value_type: PRODUCT_FIELDS[fieldName as keyof typeof PRODUCT_FIELDS] || 'text',
            is_active: true
          }));

        if (dynamicData.length > 0) {
          const { error } = await supabase
            .from('core_metadata')
            .upsert(dynamicData, {
              onConflict: 'entity_id,metadata_key'
            });

          if (error) {
            console.error(`Error updating product ${productId}:`, error);
            throw error;
          }
        }
      });

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error in bulkUpdateProducts:', error);
      throw error;
    }
  }

  /**
   * Subscribe to product changes
   */
  static subscribeToProducts(
    organizationId: string, 
    callback: (payload: any) => void
  ) {
    return supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'core_entities',
          filter: `organization_id=eq.${organizationId} AND entity_type=eq.product`
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'core_dynamic_data'
        },
        callback
      )
      .subscribe();
  }

  /**
   * Generate product code
   */
  static generateProductCode(category: string, productName: string): string {
    const categoryCode = category.toUpperCase().slice(0, 3);
    const nameCode = productName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    const timestamp = Date.now().toString().slice(-4);
    return `${categoryCode}-${nameCode}-${timestamp}`;
  }

  /**
   * Validate product code uniqueness
   */
  static async validateProductCode(
    organizationId: string, 
    productCode: string, 
    excludeId?: string
  ): Promise<boolean> {
    try {
      let query = supabase
        .from('core_entities')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('entity_type', 'product')
        .eq('entity_code', productCode);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error validating product code:', error);
        return false;
      }

      return (data || []).length === 0;
    } catch (error) {
      console.error('Error in validateProductCode:', error);
      return false;
    }
  }
}