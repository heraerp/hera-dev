import UniversalCrudService from '@/lib/services/universalCrudService';

const supabase = createClient();

/**
 * Debug version of product service for testing
 * Uses service role key to bypass RLS
 */
export class ProductServiceDebug {
  /**
   * Test basic connectivity
   */
  static async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('core_entities')
        .select('count')
        .limit(1);

      if (error) {
        console.error('Connection test failed:', error);
        return false;
      }

      console.log('Connection test successful');
      return true;
    } catch (error) {
      console.error('Connection test error:', error);
      return false;
    }
  }

  /**
   * Test fetching entities
   */
  static async testFetchEntities(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('core_entities')
        .select('*')
        .eq('organization_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d479')
        .limit(5);

      if (error) {
        console.error('Error fetching entities:', error);
        throw error;
      }

      console.log('Fetched entities:', data);
      return data || [];
    } catch (error) {
      console.error('Error in testFetchEntities:', error);
      throw error;
    }
  }

  /**
   * Test fetching metadata
   */
  static async testFetchMetadata(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('core_metadata')
        .select('*')
        .eq('organization_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d479')
        .limit(5);

      if (error) {
        console.error('Error fetching metadata:', error);
        throw error;
      }

      console.log('Fetched metadata:', data);
      return data || [];
    } catch (error) {
      console.error('Error in testFetchMetadata:', error);
      throw error;
    }
  }

  /**
   * Test creating a simple product
   */
  static async testCreateProduct(): Promise<any> {
    try {
      console.log('Testing product creation...');

      // First create the entity
      const { data: entity, error: entityError } = await supabase
        .from('core_entities')
        .insert({
          id: 'test-product-' + Date.now(),
          organization_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          entity_type: 'product',
          entity_name: 'Test Product',
          entity_code: 'TEST-' + Date.now(),
          is_active: true
        })
        .select()
        .single();

      if (entityError) {
        console.error('Error creating entity:', entityError);
        throw entityError;
      }

      console.log('Created entity:', entity);

      // Then add some metadata
      const metadataEntries = [
        {
          organization_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          entity_id: entity.id,
          entity_type: 'product',
          metadata_type: 'product_data',
          metadata_category: 'product',
          metadata_scope: 'public',
          metadata_key: 'price',
          metadata_value: '10.99',
          metadata_value_type: 'decimal',
          is_active: true
        },
        {
          organization_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          entity_id: entity.id,
          entity_type: 'product',
          metadata_type: 'product_data',
          metadata_category: 'product',
          metadata_scope: 'public',
          metadata_key: 'description',
          metadata_value: 'Test product description',
          metadata_value_type: 'text',
          is_active: true
        }
      ];

      const { data: metadata, error: metadataError } = await supabase
        .from('core_metadata')
        .insert(metadataEntries)
        .select();

      if (metadataError) {
        console.error('Error creating metadata:', metadataError);
        throw metadataError;
      }

      console.log('Created metadata:', metadata);

      return { entity, metadata };
    } catch (error) {
      console.error('Error in testCreateProduct:', error);
      throw error;
    }
  }

  /**
   * Test fetching products
   */
  static async testFetchProducts(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('core_entities')
        .select(`
          *,
          core_metadata (
            metadata_key,
            metadata_value,
            metadata_value_type,
            created_at,
            updated_at
          )
        `)
        .eq('organization_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d479')
        .eq('entity_type', 'product')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      console.log('Fetched products:', data);
      return data || [];
    } catch (error) {
      console.error('Error in testFetchProducts:', error);
      throw error;
    }
  }

  /**
   * Run all tests
   */
  static async runAllTests(): Promise<void> {
    try {
      console.log('=== Running Product Service Debug Tests ===');

      // Test 1: Connection
      console.log('\n1. Testing connection...');
      const connectionOk = await this.testConnection();
      if (!connectionOk) {
        throw new Error('Connection test failed');
      }

      // Test 2: Fetch entities
      console.log('\n2. Testing fetch entities...');
      await this.testFetchEntities();

      // Test 3: Fetch metadata
      console.log('\n3. Testing fetch metadata...');
      await this.testFetchMetadata();

      // Test 4: Create product
      console.log('\n4. Testing create product...');
      await this.testCreateProduct();

      // Test 5: Fetch products
      console.log('\n5. Testing fetch products...');
      await this.testFetchProducts();

      console.log('\n=== All tests completed successfully! ===');
    } catch (error) {
      console.error('\n=== Test failed ===', error);
      throw error;
    }
  }
}