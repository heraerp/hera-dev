import UniversalCrudService from '@/lib/services/universalCrudService';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { ProductWithDetails, ProductInput, ProductStats, ProductSearchOptions, ProductSearchResult } from '@/types/product';

const supabase = createClient();

// Admin client for read operations and RLS bypass when needed
const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!}`
      }
    }
  }
);

// Helper to get authenticated client for write operations
// This ensures audit triggers get proper user context from JWT claims
const getAuthenticatedClient = async () => {
  // Check if user is authenticated
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    // If no authenticated user, fall back to admin client with warning
    // This is needed for initialization and system operations
    console.warn('⚠️ No authenticated user found, using admin client for write operation');
    console.warn('⚠️ Audit triggers may fail - ensure proper user authentication for production');
    return supabaseAdmin;
  }
  
  // For write operations, use the regular client which includes user JWT context
  // This allows audit triggers to extract user information from JWT claims
  return supabase;
};

// Universal Product Service - Integration with Universal Schema
export interface ProductEntity {
  id: string;
  organization_id: string;
  entity_type: 'product';
  entity_name: string;
  entity_code: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductMetadata {
  // Product Details
  category: 'tea' | 'pastries' | 'packaging' | 'supplies';
  description: string;
  product_type: 'finished_good' | 'ingredient' | 'packaging';
  
  // Pricing & Costs
  price: number;
  cost_per_unit: number;
  
  // Inventory Management
  inventory_count: number;
  minimum_stock: number;
  unit_type: 'pieces' | 'servings' | 'grams' | 'kg' | 'ml' | 'liters';
  
  // Preparation & Service
  preparation_time_minutes: number;
  serving_temperature: string;
  caffeine_level: string;
  
  // Nutritional Information
  calories: number;
  allergens: string;
  
  // Sourcing & Origin
  origin: string;
  supplier_name: string;
  
  // Storage & Shelf Life
  storage_requirements: string;
  shelf_life_days: number;
  
  // Status & Metadata
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  is_draft: boolean;
  created_by: string;
  updated_by: string;
}

export interface ProductCreateInput {
  organizationId: string;
  entity_name: string;
  entity_code: string;
  metadata: ProductMetadata;
}

export class UniversalProductService {
  /**
   * Initialize product system with sample data for specific organization
   */
  static async initializeProductData(organizationId?: string): Promise<void> {
    // Skip initialization if no organization ID provided
    if (!organizationId) {
      console.log('⏭️ Skipping product initialization - no organization ID provided');
      return;
    }

    try {
      console.log('🍃 Initializing Universal Product System for organization:', organizationId);
      
      // Check if sample products already exist for this organization
      const { data: existingProducts, error: checkError } = await supabase
        .from('core_entities')
        .select('id')
        .eq('organization_id', organizationId) // HERA Universal Architecture: Use passed organizationId
        .eq('entity_type', 'product')
        .limit(1);

      if (checkError) {
        console.error('❌ Error checking existing products:', checkError);
        throw checkError;
      }

      if (existingProducts && existingProducts.length > 0) {
        console.log('✅ Sample products already exist');
        return;
      }

      // Verify organization exists before creating products
      const { data: orgExists, error: orgError } = await supabase
        .from('core_organizations')
        .select('id')
        .eq('id', organizationId)
        .single();

      if (orgError || !orgExists) {
        console.log('⚠️ Skipping product initialization - organization does not exist:', organizationId);
        return;
      }

      // Create sample products for the tea house
      const sampleProducts = [
        {
          id: '550e8400-e29b-41d4-a716-446655440030',
          entity_name: 'Premium Jasmine Green Tea',
          entity_code: 'TEA-001',
          metadata: {
            category: 'tea',
            description: 'Authentic Chinese jasmine green tea with delicate floral aroma',
            product_type: 'finished_good',
            price: 4.50,
            cost_per_unit: 1.20,
            inventory_count: 150,
            minimum_stock: 20,
            unit_type: 'servings',
            preparation_time_minutes: 5,
            serving_temperature: 'Hot (70-80°C)',
            caffeine_level: 'Medium',
            calories: 5,
            allergens: 'None',
            origin: 'Fujian Province, China',
            supplier_name: 'Golden Mountain Tea Co.',
            storage_requirements: 'Cool, dry place away from light',
            shelf_life_days: 730,
            status: 'in_stock',
            is_draft: false,
            created_by: 'system',
            updated_by: 'system'
          }
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440031',
          entity_name: 'Fresh Blueberry Scone',
          entity_code: 'PASTRY-001',
          metadata: {
            category: 'pastries',
            description: 'Freshly baked scone with organic blueberries and light glaze',
            product_type: 'finished_good',
            price: 3.25,
            cost_per_unit: 0.85,
            inventory_count: 24,
            minimum_stock: 5,
            unit_type: 'pieces',
            preparation_time_minutes: 2,
            serving_temperature: 'Room temperature',
            caffeine_level: 'None',
            calories: 280,
            allergens: 'Gluten, Dairy, Eggs',
            origin: 'Local bakery',
            supplier_name: 'Artisan Bakehouse',
            storage_requirements: 'Refrigerated display case',
            shelf_life_days: 3,
            status: 'in_stock',
            is_draft: false,
            created_by: 'system',
            updated_by: 'system'
          }
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440032',
          entity_name: 'Earl Grey Black Tea',
          entity_code: 'TEA-002',
          metadata: {
            category: 'tea',
            description: 'Classic Earl Grey black tea with bergamot oil',
            product_type: 'finished_good',
            price: 4.00,
            cost_per_unit: 1.10,
            inventory_count: 8,
            minimum_stock: 15,
            unit_type: 'servings',
            preparation_time_minutes: 5,
            serving_temperature: 'Hot (85-90°C)',
            caffeine_level: 'High',
            calories: 2,
            allergens: 'None',
            origin: 'Sri Lanka',
            supplier_name: 'Ceylon Tea Imports',
            storage_requirements: 'Airtight container, cool place',
            shelf_life_days: 1095,
            status: 'low_stock',
            is_draft: false,
            created_by: 'system',
            updated_by: 'system'
          }
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440033',
          entity_name: 'Eco-Friendly Tea Cups',
          entity_code: 'PKG-001',
          metadata: {
            category: 'packaging',
            description: 'Biodegradable paper cups for hot beverages',
            product_type: 'packaging',
            price: 0.15,
            cost_per_unit: 0.08,
            inventory_count: 0,
            minimum_stock: 200,
            unit_type: 'pieces',
            preparation_time_minutes: 0,
            serving_temperature: 'Ambient',
            caffeine_level: 'None',
            calories: 0,
            allergens: 'None',
            origin: 'Sustainable Packaging Solutions',
            supplier_name: 'Green Pack Co.',
            storage_requirements: 'Dry storage area',
            shelf_life_days: 1825,
            status: 'out_of_stock',
            is_draft: false,
            created_by: 'system',
            updated_by: 'system'
          }
        }
      ];

      for (const product of sampleProducts) {
        // Create product entity using authenticated client for proper audit context
        const authClient = await getAuthenticatedClient();
        const { error: entityError } = await authClient
          .from('core_entities')
          .insert({
            id: product.id,
            organization_id: organizationId, // HERA Universal Architecture: Use passed organizationId
            entity_type: 'product',
            entity_name: product.entity_name,
            entity_code: product.entity_code,
            is_active: true
          });

        if (entityError && entityError.code !== '23505') {
          // Check if it's an audit trigger error (changed_by constraint)
          if (entityError.code === '23502' && entityError.message.includes('changed_by')) {
            console.log(`⚠️ Skipping product ${product.entity_name} - audit trigger requires user context`);
            continue;
          }
          
          console.error(`❌ Error creating product entity ${product.entity_name}:`, {
            error: entityError,
            message: entityError.message,
            code: entityError.code,
            details: entityError.details,
            hint: entityError.hint
          });
          continue;
        }

        // Create product metadata using authenticated client for proper audit context
        const { error: metadataError } = await authClient
          .from('core_metadata')
          .insert({
            organization_id: organizationId, // HERA Universal Architecture: Use passed organizationId
            entity_type: 'product',
            entity_id: product.id,
            metadata_type: 'product_details',
            metadata_category: 'catalog',
            metadata_key: 'product_info',
            metadata_value: JSON.stringify(product.metadata),
            is_system_generated: false,
            created_by: organizationId // HERA Universal Architecture: Use passed organizationId
          });

        if (metadataError && metadataError.code !== '23505') {
          // Check if it's an audit trigger error (changed_by constraint)
          if (metadataError.code === '23502' && metadataError.message.includes('changed_by')) {
            console.log(`⚠️ Skipping metadata for product ${product.entity_name} - audit trigger requires user context`);
          } else {
            console.error(`❌ Error creating product metadata ${product.entity_name}:`, {
              error: metadataError,
              message: metadataError.message,
              code: metadataError.code,
              details: metadataError.details,
              hint: metadataError.hint
            });
          }
        } else {
          console.log(`✅ Created sample product: ${product.entity_name}`);
        }
      }

      console.log('✅ Universal Product System initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing product data:', error);
      throw error;
    }
  }

  /**
   * Generate product code
   */
  static generateProductCode(category: string): string {
    const prefix = {
      'tea': 'TEA',
      'pastries': 'PASTRY', 
      'packaging': 'PKG',
      'supplies': 'SUP'
    }[category] || 'PROD';
    
    const timestamp = Date.now().toString().slice(-4);
    return `${prefix}-${timestamp}`;
  }

  /**
   * Create a new product
   */
  static async createProduct(productInput: ProductCreateInput): Promise<{
    success: boolean;
    productId?: string;
    productCode?: string;
    error?: string;
  }> {
    try {
      await this.initializeProductData(productInput.organizationId);

      const productId = crypto.randomUUID();
      const productCode = productInput.entity_code || this.generateProductCode(productInput.metadata.category);

      // Calculate status based on inventory
      const status = productInput.metadata.inventory_count === 0 ? 'out_of_stock' :
                    productInput.metadata.inventory_count <= productInput.metadata.minimum_stock ? 'low_stock' : 'in_stock';

      // Create product entity using authenticated client for proper audit context
      const authClient = await getAuthenticatedClient();
      const { error: entityError } = await authClient
        .from('core_entities')
        .insert({
          id: productId,
          organization_id: productInput.organizationId,
          entity_type: 'product',
          entity_name: productInput.entity_name,
          entity_code: productCode,
          is_active: true
        });

      if (entityError) {
        console.error('Error creating product entity:', entityError);
        throw entityError;
      }

      // Create product metadata
      const metadata = {
        ...productInput.metadata,
        status,
        created_by: productInput.organizationId,
        updated_by: productInput.organizationId
      };

      const { error: metadataError } = await authClient
        .from('core_metadata')
        .insert({
          organization_id: productInput.organizationId,
          entity_type: 'product',
          entity_id: productId,
          metadata_type: 'product_details',
          metadata_category: 'catalog',
          metadata_key: 'product_info',
          metadata_value: JSON.stringify(metadata),
          is_system_generated: false,
          created_by: productInput.organizationId
        });

      if (metadataError) {
        console.error('Error creating product metadata:', metadataError);
        // Clean up entity if metadata fails
        await supabase
          .from('core_entities')
          .delete()
          .eq('id', productId);
        throw metadataError;
      }

      return {
        success: true,
        productId,
        productCode
      };

    } catch (error) {
      console.error('Error in createProduct:', error);
      return {
        success: false,
        error: error.message || 'Failed to create product'
      };
    }
  }

  /**
   * Fetch products with metadata
   */
  static async fetchProducts(organizationId: string): Promise<{
    success: boolean;
    products?: ProductWithDetails[];
    error?: string;
  }> {
    try {
      // HERA Universal Architecture: Fetch entities with organization_id isolation
      // Note: Product initialization is now done during restaurant setup, not on every fetch
      const { data: entities, error: entitiesError } = await supabase
        .from('core_entities')
        .select('*')
        .eq('organization_id', organizationId) // SACRED PRINCIPLE: Always filter by organization_id
        .eq('entity_type', 'product')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (entitiesError) {
        console.error('Error fetching product entities:', entitiesError);
        throw entitiesError;
      }

      if (!entities || entities.length === 0) {
        return {
          success: true,
          products: []
        };
      }

      // HERA Universal Architecture: Fetch metadata with double organization isolation
      const entityIds = entities.map(e => e.id);
      const { data: metadata, error: metadataError } = await supabase
        .from('core_metadata')
        .select('entity_id, metadata_key, metadata_value, metadata_type, metadata_category')
        .eq('organization_id', organizationId) // SACRED PRINCIPLE: organization_id isolation
        .in('entity_id', entityIds) // Only get metadata for our entities
        .eq('entity_type', 'product')
        .eq('metadata_type', 'product_details')
        .eq('metadata_key', 'product_info');

      if (metadataError) {
        console.error('Error fetching product metadata:', metadataError);
        throw metadataError;
      }

      // Universal Architecture: Create entity-metadata lookup map
      const metadataMap = new Map();
      metadata?.forEach(m => {
        metadataMap.set(m.entity_id, m);
      });

      // Transform to ProductWithDetails format using HERA Universal Pattern
      const products: ProductWithDetails[] = entities?.map(entity => {
        // Parse metadata using universal schema pattern
        let productInfo: any = {};
        const metadataEntry = metadataMap.get(entity.id);

        if (metadataEntry?.metadata_value) {
          try {
            productInfo = JSON.parse(metadataEntry.metadata_value);
          } catch (e) {
            console.warn('Failed to parse product metadata:', e);
          }
        }

        return {
          // Entity fields
          id: entity.id,
          organization_id: entity.organization_id,
          entity_type: entity.entity_type,
          entity_name: entity.entity_name,
          entity_code: entity.entity_code,
          is_active: entity.is_active,
          created_at: entity.created_at,
          updated_at: entity.updated_at,

          // Metadata fields with defaults
          category: productInfo.category || 'supplies',
          description: productInfo.description || '',
          product_type: productInfo.product_type || 'finished_good',
          price: productInfo.price || 0,
          cost_per_unit: productInfo.cost_per_unit || 0,
          inventory_count: productInfo.inventory_count || 0,
          minimum_stock: productInfo.minimum_stock || 0,
          unit_type: productInfo.unit_type || 'pieces',
          preparation_time_minutes: productInfo.preparation_time_minutes || 0,
          serving_temperature: productInfo.serving_temperature || '',
          caffeine_level: productInfo.caffeine_level || 'None',
          calories: productInfo.calories || 0,
          allergens: productInfo.allergens || 'None',
          origin: productInfo.origin || '',
          supplier_name: productInfo.supplier_name || '',
          storage_requirements: productInfo.storage_requirements || '',
          shelf_life_days: productInfo.shelf_life_days || 0,
          status: productInfo.status || 'in_stock',
          is_draft: productInfo.is_draft || false,
          created_by: productInfo.created_by || '',
          updated_by: productInfo.updated_by || ''
        };
      }) || [];

      return {
        success: true,
        products
      };

    } catch (error) {
      console.error('Error in fetchProducts:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch products'
      };
    }
  }

  /**
   * Update product
   */
  static async updateProduct(productId: string, updates: Partial<ProductCreateInput>): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Update entity if needed using authenticated client
      if (updates.entity_name || updates.entity_code) {
        const authClient = await getAuthenticatedClient();
        const { error: entityError } = await authClient
          .from('core_entities')
          .update({
            entity_name: updates.entity_name,
            entity_code: updates.entity_code,
            updated_at: new Date().toISOString()
          })
          .eq('id', productId);

        if (entityError) {
          console.error('Error updating product entity:', entityError);
          throw entityError;
        }
      }

      // Update metadata if provided
      if (updates.metadata) {
        // First get existing metadata
        const { data: existingMetadata, error: fetchError } = await supabase
          .from('core_metadata')
          .select('metadata_value')
          .eq('entity_id', productId)
          .eq('metadata_type', 'product_details')
          .eq('metadata_key', 'product_info')
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error fetching existing metadata:', fetchError);
          throw fetchError;
        }

        // Merge existing with updates
        let existingData = {};
        if (existingMetadata?.metadata_value) {
          try {
            existingData = JSON.parse(existingMetadata.metadata_value);
          } catch (e) {
            console.warn('Failed to parse existing metadata:', e);
          }
        }

        const updatedMetadata = {
          ...existingData,
          ...updates.metadata,
          updated_by: updates.organizationId,
          status: updates.metadata.inventory_count === 0 ? 'out_of_stock' :
                 updates.metadata.inventory_count <= updates.metadata.minimum_stock ? 'low_stock' : 'in_stock'
        };

        const authClientForMeta = await getAuthenticatedClient();
        const { error: metadataError } = await authClientForMeta
          .from('core_metadata')
          .update({
            metadata_value: JSON.stringify(updatedMetadata),
            updated_at: new Date().toISOString()
          })
          .eq('entity_id', productId)
          .eq('metadata_type', 'product_details')
          .eq('metadata_key', 'product_info');

        if (metadataError) {
          console.error('Error updating product metadata:', metadataError);
          throw metadataError;
        }
      }

      return { success: true };

    } catch (error) {
      console.error('Error in updateProduct:', error);
      return {
        success: false,
        error: error.message || 'Failed to update product'
      };
    }
  }

  /**
   * Delete product (soft delete by setting is_active = false)
   */
  static async deleteProduct(productId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const authClient = await getAuthenticatedClient();
      const { error } = await authClient
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

      return { success: true };

    } catch (error) {
      console.error('Error in deleteProduct:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete product'
      };
    }
  }

  /**
   * Get product statistics
   */
  static async getProductStats(organizationId: string): Promise<{
    success: boolean;
    stats?: ProductStats;
    error?: string;
  }> {
    try {
      const productsResult = await this.fetchProducts(organizationId);
      
      if (!productsResult.success) {
        throw new Error(productsResult.error);
      }

      const products = productsResult.products || [];

      const stats: ProductStats = {
        totalProducts: products.length,
        inStock: products.filter(p => p.status === 'in_stock').length,
        lowStock: products.filter(p => p.status === 'low_stock').length,
        outOfStock: products.filter(p => p.status === 'out_of_stock').length,
        totalValue: products.reduce((sum, p) => sum + (p.inventory_count * p.price), 0),
        averagePrice: products.length > 0 ? products.reduce((sum, p) => sum + p.price, 0) / products.length : 0,
        averageCost: products.length > 0 ? products.reduce((sum, p) => sum + p.cost_per_unit, 0) / products.length : 0
      };

      return {
        success: true,
        stats
      };

    } catch (error) {
      console.error('Error in getProductStats:', error);
      return {
        success: false,
        error: error.message || 'Failed to get product statistics'
      };
    }
  }

  /**
   * Update inventory count
   */
  static async updateInventory(productId: string, newCount: number, organizationId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Get current metadata
      const { data: metadata, error: fetchError } = await supabase
        .from('core_metadata')
        .select('metadata_value')
        .eq('entity_id', productId)
        .eq('metadata_type', 'product_details')
        .eq('metadata_key', 'product_info')
        .single();

      if (fetchError) {
        console.error('Error fetching product metadata:', fetchError);
        throw fetchError;
      }

      let productData = {};
      if (metadata?.metadata_value) {
        try {
          productData = JSON.parse(metadata.metadata_value);
        } catch (e) {
          console.warn('Failed to parse product metadata:', e);
        }
      }

      // Update inventory count and status
      const updatedData = {
        ...productData,
        inventory_count: newCount,
        status: newCount === 0 ? 'out_of_stock' :
               newCount <= (productData.minimum_stock || 0) ? 'low_stock' : 'in_stock',
        updated_by: organizationId
      };

      const authClient = await getAuthenticatedClient();
      const { error: updateError } = await authClient
        .from('core_metadata')
        .update({
          metadata_value: JSON.stringify(updatedData),
          updated_at: new Date().toISOString()
        })
        .eq('entity_id', productId)
        .eq('metadata_type', 'product_details')
        .eq('metadata_key', 'product_info');

      if (updateError) {
        console.error('Error updating inventory:', updateError);
        throw updateError;
      }

      return { success: true };

    } catch (error) {
      console.error('Error in updateInventory:', error);
      return {
        success: false,
        error: error.message || 'Failed to update inventory'
      };
    }
  }

  /**
   * Subscribe to product changes
   */
  static subscribeToProductChanges(
    organizationId: string,
    callback: (payload: any) => void
  ) {
    return supabase
      .channel('product-changes')
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
          table: 'core_metadata',
          filter: `organization_id=eq.${organizationId} AND entity_type=eq.product`
        },
        callback
      )
      .subscribe();
  }
}