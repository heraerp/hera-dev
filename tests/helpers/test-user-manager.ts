/**
 * Test User Manager for Supabase + Playwright Integration
 * Creates, manages, and cleans up test users directly in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { Page } from '@playwright/test';

// Supabase Admin Client (bypasses RLS for user management)
const supabaseAdmin = createClient(
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

export interface TestUser {
  id: string;
  email: string;
  password: string;
  fullName: string;
  role: 'owner' | 'manager' | 'staff';
  organizationId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface TestOrganization {
  id: string;
  name: string;
  code: string;
  industry: string;
  clientId: string;
}

export class TestUserManager {
  private static instance: TestUserManager;
  private createdUsers: TestUser[] = [];
  private createdOrganizations: TestOrganization[] = [];
  
  static getInstance(): TestUserManager {
    if (!TestUserManager.instance) {
      TestUserManager.instance = new TestUserManager();
    }
    return TestUserManager.instance;
  }

  /**
   * Create a complete test user with organization
   */
  async createTestUserWithOrganization(userConfig: {
    email?: string;
    password?: string;
    fullName?: string;
    role?: 'owner' | 'manager' | 'staff';
    organizationName?: string;
    industry?: string;
  } = {}): Promise<{ user: TestUser; organization: TestOrganization }> {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    
    const config = {
      email: userConfig.email || `test.user.${timestamp}.${randomId}@hera-test.com`,
      password: userConfig.password || 'TestPassword123!',
      fullName: userConfig.fullName || `Test User ${randomId}`,
      role: userConfig.role || 'owner',
      organizationName: userConfig.organizationName || `Test Restaurant ${randomId}`,
      industry: userConfig.industry || 'restaurant'
    };

    console.log('🚀 Creating test user and organization:', config.email);

    try {
      // Step 1: Create auth user in Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: config.email,
        password: config.password,
        email_confirm: true // Auto-confirm email
      });

      if (authError || !authData.user) {
        throw new Error(`Failed to create auth user: ${authError?.message}`);
      }

      console.log('✅ Auth user created:', authData.user.id);

      // Step 2: Create client entity
      const clientId = crypto.randomUUID();
      const { error: clientError } = await supabaseAdmin
        .from('core_clients')
        .insert({
          id: clientId,
          client_name: `${config.organizationName} Group`,
          client_code: `CLIENT-${randomId.toUpperCase()}`,
          client_type: 'business',
          is_active: true
        });

      if (clientError) {
        console.error('Failed to create client:', clientError);
        await this.cleanupAuthUser(authData.user.id);
        throw new Error(`Failed to create client: ${clientError.message}`);
      }

      console.log('✅ Client created:', clientId);

      // Step 3: Create organization
      const organizationId = crypto.randomUUID();
      const { error: orgError } = await supabaseAdmin
        .from('core_organizations')
        .insert({
          id: organizationId,
          client_id: clientId,
          org_name: config.organizationName,
          org_code: `ORG-${randomId.toUpperCase()}`,
          industry: config.industry,
          country: 'US',
          currency: 'USD',
          is_active: true
        });

      if (orgError) {
        console.error('Failed to create organization:', orgError);
        await this.cleanupAuthUser(authData.user.id);
        throw new Error(`Failed to create organization: ${orgError.message}`);
      }

      console.log('✅ Organization created:', organizationId);

      // Step 4: Create core user record
      const coreUserId = crypto.randomUUID();
      const { error: coreUserError } = await supabaseAdmin
        .from('core_users')
        .insert({
          id: coreUserId,
          email: config.email,
          full_name: config.fullName,
          auth_user_id: authData.user.id,
          user_role: config.role,
          is_active: true
        });

      if (coreUserError) {
        console.error('Failed to create core user:', coreUserError);
        await this.cleanupAuthUser(authData.user.id);
        throw new Error(`Failed to create core user: ${coreUserError.message}`);
      }

      console.log('✅ Core user created:', coreUserId);

      // Step 5: Link user to organization
      const { error: linkError } = await supabaseAdmin
        .from('user_organizations')
        .insert({
          id: crypto.randomUUID(),
          user_id: coreUserId,
          organization_id: organizationId,
          role: config.role,
          is_active: true
        });

      if (linkError) {
        console.error('Failed to link user to organization:', linkError);
        await this.cleanupAuthUser(authData.user.id);
        throw new Error(`Failed to link user to organization: ${linkError.message}`);
      }

      console.log('✅ User linked to organization');

      // Step 6: Create entity record for the organization
      const { error: entityError } = await supabaseAdmin
        .from('core_entities')
        .insert({
          id: organizationId, // Use same ID as organization
          organization_id: organizationId,
          entity_type: 'organization',
          entity_name: config.organizationName,
          entity_code: `ORG-${randomId.toUpperCase()}`,
          is_active: true
        });

      if (entityError) {
        console.warn('⚠️ Failed to create entity record (non-critical):', entityError);
      }

      // Step 7: Track created objects for cleanup
      const testUser: TestUser = {
        id: authData.user.id,
        email: config.email,
        password: config.password,
        fullName: config.fullName,
        role: config.role,
        organizationId: organizationId,
        isActive: true,
        createdAt: new Date().toISOString()
      };

      const testOrganization: TestOrganization = {
        id: organizationId,
        name: config.organizationName,
        code: `ORG-${randomId.toUpperCase()}`,
        industry: config.industry,
        clientId: clientId
      };

      this.createdUsers.push(testUser);
      this.createdOrganizations.push(testOrganization);

      console.log('🎉 Test user and organization created successfully!');
      
      return { user: testUser, organization: testOrganization };

    } catch (error) {
      console.error('❌ Failed to create test user:', error);
      throw error;
    }
  }

  /**
   * Create a simple test user without organization
   */
  async createSimpleTestUser(config: {
    email?: string;
    password?: string;
    fullName?: string;
  } = {}): Promise<TestUser> {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    
    const userConfig = {
      email: config.email || `test.simple.${timestamp}.${randomId}@hera-test.com`,
      password: config.password || 'TestPassword123!',
      fullName: config.fullName || `Simple Test User ${randomId}`,
    };

    console.log('🚀 Creating simple test user:', userConfig.email);

    try {
      // Create auth user in Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: userConfig.email,
        password: userConfig.password,
        email_confirm: true
      });

      if (authError || !authData.user) {
        throw new Error(`Failed to create auth user: ${authError?.message}`);
      }

      // Create core user record
      const coreUserId = crypto.randomUUID();
      const { error: coreUserError } = await supabaseAdmin
        .from('core_users')
        .insert({
          id: coreUserId,
          email: userConfig.email,
          full_name: userConfig.fullName,
          auth_user_id: authData.user.id,
          user_role: 'staff',
          is_active: true
        });

      if (coreUserError) {
        await this.cleanupAuthUser(authData.user.id);
        throw new Error(`Failed to create core user: ${coreUserError.message}`);
      }

      const testUser: TestUser = {
        id: authData.user.id,
        email: userConfig.email,
        password: userConfig.password,
        fullName: userConfig.fullName,
        role: 'staff',
        isActive: true,
        createdAt: new Date().toISOString()
      };

      this.createdUsers.push(testUser);

      console.log('✅ Simple test user created successfully!');
      return testUser;

    } catch (error) {
      console.error('❌ Failed to create simple test user:', error);
      throw error;
    }
  }

  /**
   * Login test user with Playwright
   */
  async loginTestUser(page: Page, testUser: TestUser): Promise<void> {
    console.log('🔐 Logging in test user:', testUser.email);

    await page.goto('http://localhost:3002/login');
    await page.waitForLoadState('networkidle');

    // Fill login form
    await page.fill('input[name="email"], input#email', testUser.email);
    await page.fill('input[name="password"], input#password', testUser.password);

    // Submit and wait for navigation
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.click('button[type="submit"]')
    ]);

    // Verify login success
    await page.waitForFunction(
      () => !window.location.href.includes('/login'),
      { timeout: 10000 }
    );

    console.log('✅ Test user logged in successfully');
  }

  /**
   * Get test user by email
   */
  getTestUser(email: string): TestUser | undefined {
    return this.createdUsers.find(user => user.email === email);
  }

  /**
   * Get all created test users
   */
  getAllTestUsers(): TestUser[] {
    return [...this.createdUsers];
  }

  /**
   * Get all created test organizations
   */
  getAllTestOrganizations(): TestOrganization[] {
    return [...this.createdOrganizations];
  }

  /**
   * Cleanup a specific test user
   */
  async cleanupTestUser(userId: string): Promise<void> {
    console.log('🧹 Cleaning up test user:', userId);

    try {
      // Find user in our tracking
      const userIndex = this.createdUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        console.warn('⚠️ User not found in tracking:', userId);
        return;
      }

      const user = this.createdUsers[userIndex];

      // Delete from user_organizations
      await supabaseAdmin
        .from('user_organizations')
        .delete()
        .eq('user_id', userId);

      // Delete from core_users (find by auth_user_id)
      await supabaseAdmin
        .from('core_users')
        .delete()
        .eq('auth_user_id', userId);

      // Delete auth user
      await this.cleanupAuthUser(userId);

      // Remove from tracking
      this.createdUsers.splice(userIndex, 1);

      console.log('✅ Test user cleaned up:', user.email);

    } catch (error) {
      console.error('❌ Error cleaning up test user:', error);
    }
  }

  /**
   * Cleanup all created test users and organizations
   */
  async cleanupAll(): Promise<void> {
    console.log('🧹 Cleaning up all test data...');

    // Cleanup users
    const userCleanupPromises = this.createdUsers.map(user => 
      this.cleanupTestUser(user.id)
    );
    await Promise.allSettled(userCleanupPromises);

    // Cleanup organizations
    const orgCleanupPromises = this.createdOrganizations.map(org => 
      this.cleanupTestOrganization(org.id)
    );
    await Promise.allSettled(orgCleanupPromises);

    console.log('✅ All test data cleaned up');
  }

  /**
   * Private method to cleanup auth user
   */
  private async cleanupAuthUser(userId: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) {
        console.warn('⚠️ Error deleting auth user:', error);
      }
    } catch (error) {
      console.warn('⚠️ Error deleting auth user:', error);
    }
  }

  /**
   * Private method to cleanup test organization
   */
  private async cleanupTestOrganization(organizationId: string): Promise<void> {
    try {
      // Find organization in tracking
      const orgIndex = this.createdOrganizations.findIndex(o => o.id === organizationId);
      if (orgIndex === -1) return;

      const org = this.createdOrganizations[orgIndex];

      // Delete organization entities
      await supabaseAdmin
        .from('core_entities')
        .delete()
        .eq('organization_id', organizationId);

      // Delete organization
      await supabaseAdmin
        .from('core_organizations')
        .delete()
        .eq('id', organizationId);

      // Delete client
      await supabaseAdmin
        .from('core_clients')
        .delete()
        .eq('id', org.clientId);

      // Remove from tracking
      this.createdOrganizations.splice(orgIndex, 1);

      console.log('✅ Test organization cleaned up:', org.name);

    } catch (error) {
      console.error('❌ Error cleaning up test organization:', error);
    }
  }

  /**
   * Create multiple test users for load testing
   */
  async createMultipleTestUsers(count: number, organizationName?: string): Promise<TestUser[]> {
    console.log(`🚀 Creating ${count} test users...`);
    
    const users: TestUser[] = [];
    
    for (let i = 0; i < count; i++) {
      try {
        if (organizationName && i === 0) {
          // First user creates the organization
          const { user } = await this.createTestUserWithOrganization({
            organizationName,
            role: 'owner'
          });
          users.push(user);
        } else if (organizationName && users.length > 0) {
          // Subsequent users join the existing organization
          const { user } = await this.createTestUserWithOrganization({
            organizationName: `${organizationName} ${i + 1}`,
            role: i === 1 ? 'manager' : 'staff'
          });
          users.push(user);
        } else {
          // Simple users without organization
          const user = await this.createSimpleTestUser();
          users.push(user);
        }
      } catch (error) {
        console.error(`❌ Failed to create test user ${i + 1}:`, error);
      }
    }

    console.log(`✅ Created ${users.length}/${count} test users`);
    return users;
  }
}

// Export singleton instance
export const testUserManager = TestUserManager.getInstance();

// Helper functions for common use cases
export const createTestUser = (config?: Parameters<TestUserManager['createTestUserWithOrganization']>[0]) => 
  testUserManager.createTestUserWithOrganization(config);

export const createSimpleUser = (config?: Parameters<TestUserManager['createSimpleTestUser']>[0]) => 
  testUserManager.createSimpleTestUser(config);

export const loginTestUser = (page: Page, user: TestUser) => 
  testUserManager.loginTestUser(page, user);

export const cleanupAllTestUsers = () => 
  testUserManager.cleanupAll();