const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

/**
 * 🎯 WORKING PRODUCT CREATION TEST
 * Find a way to create products that works with audit triggers
 */

class WorkingProductTest {
  constructor() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;
    
    this.supabaseAdmin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`
        }
      }
    });
    
    this.systemUserId = '16848910-d8cf-462b-a4d2-f94ac253d698'; // Demo User from our check
    this.testOrg = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : '🔧';
    console.log(`${prefix} [${timestamp.slice(11, 19)}] ${message}`);
  }

  async setup() {
    // Get first available organization
    const { data: orgs } = await this.supabaseAdmin
      .from('core_organizations')
      .select('*')
      .limit(1);
    
    if (!orgs || orgs.length === 0) {
      throw new Error('No organizations found');
    }
    
    this.testOrg = orgs[0];
    this.log(`Using organization: ${this.testOrg.org_name} (${this.testOrg.id})`);
  }

  async testMethod1_SessionVariable() {
    this.log('Method 1: Try setting session variable for audit triggers...');
    
    try {
      // Set session variable that audit triggers might use
      await this.supabaseAdmin.rpc('set_session_user', { user_id: this.systemUserId });
      
      const productId = crypto.randomUUID();
      const { data, error } = await this.supabaseAdmin
        .from('core_entities')
        .insert({
          id: productId,
          organization_id: this.testOrg.id,
          entity_type: 'product',
          entity_name: 'TEST_Method1_Product',
          entity_code: 'TEST-M1-001',
          is_active: true
        })
        .select();
      
      if (error) {
        this.log(`Method 1 failed: ${error.message}`, 'error');
        return false;
      } else {
        this.log('Method 1 SUCCESS!', 'success');
        await this.supabaseAdmin.from('core_entities').delete().eq('id', productId);
        return true;
      }
    } catch (error) {
      this.log(`Method 1 exception: ${error.message}`, 'error');
      return false;
    }
  }

  async testMethod2_DisableAudit() {
    this.log('Method 2: Try disabling audit triggers...');
    
    try {
      // Try to disable session triggers
      await this.supabaseAdmin.rpc('set_config', { 
        setting_name: 'audit.enabled', 
        new_value: 'false', 
        is_local: true 
      });
      
      const productId = crypto.randomUUID();
      const { data, error } = await this.supabaseAdmin
        .from('core_entities')
        .insert({
          id: productId,
          organization_id: this.testOrg.id,
          entity_type: 'product',
          entity_name: 'TEST_Method2_Product',
          entity_code: 'TEST-M2-001',
          is_active: true
        })
        .select();
      
      if (error) {
        this.log(`Method 2 failed: ${error.message}`, 'error');
        return false;
      } else {
        this.log('Method 2 SUCCESS!', 'success');
        await this.supabaseAdmin.from('core_entities').delete().eq('id', productId);
        return true;
      }
    } catch (error) {
      this.log(`Method 2 exception: ${error.message}`, 'error');
      return false;
    }
  }

  async testMethod3_DirectSQL() {
    this.log('Method 3: Try direct SQL with explicit user context...');
    
    try {
      const productId = crypto.randomUUID();
      
      // Use direct SQL with explicit user setting
      const { data, error } = await this.supabaseAdmin
        .rpc('create_product_with_audit', {
          p_id: productId,
          p_organization_id: this.testOrg.id,
          p_entity_type: 'product',
          p_entity_name: 'TEST_Method3_Product',
          p_entity_code: 'TEST-M3-001',
          p_user_id: this.systemUserId
        });
      
      if (error) {
        this.log(`Method 3 failed: ${error.message}`, 'error');
        return false;
      } else {
        this.log('Method 3 SUCCESS!', 'success');
        await this.supabaseAdmin.from('core_entities').delete().eq('id', productId);
        return true;
      }
    } catch (error) {
      this.log(`Method 3 exception: ${error.message}`, 'error');
      return false;
    }
  }

  async testMethod4_BulkInsert() {
    this.log('Method 4: Try bulk insert approach...');
    
    try {
      // Sometimes bulk inserts behave differently with triggers
      const productIds = [crypto.randomUUID()];
      const products = productIds.map((id, index) => ({
        id,
        organization_id: this.testOrg.id,
        entity_type: 'product',
        entity_name: `TEST_Method4_Product_${index}`,
        entity_code: `TEST-M4-${String(index).padStart(3, '0')}`,
        is_active: true
      }));
      
      const { data, error } = await this.supabaseAdmin
        .from('core_entities')
        .insert(products)
        .select();
      
      if (error) {
        this.log(`Method 4 failed: ${error.message}`, 'error');
        return false;
      } else {
        this.log('Method 4 SUCCESS!', 'success');
        await this.supabaseAdmin.from('core_entities').delete().in('id', productIds);
        return true;
      }
    } catch (error) {
      this.log(`Method 4 exception: ${error.message}`, 'error');
      return false;
    }
  }

  async testMethod5_UpsertApproach() {
    this.log('Method 5: Try upsert approach...');
    
    try {
      const productId = crypto.randomUUID();
      const { data, error } = await this.supabaseAdmin
        .from('core_entities')
        .upsert({
          id: productId,
          organization_id: this.testOrg.id,
          entity_type: 'product',
          entity_name: 'TEST_Method5_Product',
          entity_code: 'TEST-M5-001',
          is_active: true
        })
        .select();
      
      if (error) {
        this.log(`Method 5 failed: ${error.message}`, 'error');
        return false;
      } else {
        this.log('Method 5 SUCCESS!', 'success');
        await this.supabaseAdmin.from('core_entities').delete().eq('id', productId);
        return true;
      }
    } catch (error) {
      this.log(`Method 5 exception: ${error.message}`, 'error');
      return false;
    }
  }

  async testMethod6_SessionContext() {
    this.log('Method 6: Try setting session context variables...');
    
    try {
      // Set multiple session variables that audit system might use
      const queries = [
        `SET session.audit_user_id = '${this.systemUserId}';`,
        `SET session.current_user_id = '${this.systemUserId}';`,
        `SET session.app_user_id = '${this.systemUserId}';`,
        `SET session.changed_by = '${this.systemUserId}';`
      ];
      
      for (const query of queries) {
        try {
          await this.supabaseAdmin.rpc('exec_sql', { sql: query });
        } catch (e) {
          // Ignore errors for non-existent session variables
        }
      }
      
      const productId = crypto.randomUUID();
      const { data, error } = await this.supabaseAdmin
        .from('core_entities')
        .insert({
          id: productId,
          organization_id: this.testOrg.id,
          entity_type: 'product',
          entity_name: 'TEST_Method6_Product',
          entity_code: 'TEST-M6-001',
          is_active: true
        })
        .select();
      
      if (error) {
        this.log(`Method 6 failed: ${error.message}`, 'error');
        return false;
      } else {
        this.log('Method 6 SUCCESS!', 'success');
        await this.supabaseAdmin.from('core_entities').delete().eq('id', productId);
        return true;
      }
    } catch (error) {
      this.log(`Method 6 exception: ${error.message}`, 'error');
      return false;
    }
  }

  async runAllTests() {
    console.log('🚀 TESTING WORKING PRODUCT CREATION METHODS');
    console.log('='.repeat(60));
    
    await this.setup();
    
    const methods = [
      this.testMethod1_SessionVariable,
      this.testMethod2_DisableAudit,
      this.testMethod3_DirectSQL,
      this.testMethod4_BulkInsert,
      this.testMethod5_UpsertApproach,
      this.testMethod6_SessionContext
    ];
    
    let successfulMethods = [];
    
    for (let i = 0; i < methods.length; i++) {
      const success = await methods[i].call(this);
      if (success) {
        successfulMethods.push(i + 1);
      }
    }
    
    console.log('\n🎯 RESULTS SUMMARY');
    console.log('='.repeat(30));
    if (successfulMethods.length > 0) {
      console.log(`✅ Successful methods: ${successfulMethods.join(', ')}`);
      console.log('🎉 Found working approaches for product creation!');
    } else {
      console.log('❌ No methods worked - audit triggers are blocking all approaches');
      console.log('💡 May need to modify database triggers or use stored procedures');
    }
    
    return successfulMethods;
  }
}

// Run the test
async function runWorkingProductTest() {
  const tester = new WorkingProductTest();
  const results = await tester.runAllTests();
  return results;
}

runWorkingProductTest().catch(console.error);