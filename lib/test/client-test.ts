/**
 * HERA Universal ERP - Client Service Test
 * Test client creation with direct Supabase API
 */

import { ClientService } from '@/lib/services/client-service'
import type { CreateClientData } from '@/lib/supabase/client'

export async function testClientCreation() {
  console.log('🧪 Testing HERA Client Creation with Supabase...')
  
  try {
    // Test client data
    const testClientData: CreateClientData = {
      client_name: 'Test Client Company',
      client_code: 'TEST001',
      client_type: 'enterprise'
    }
    
    console.log('📝 Creating client:', testClientData)
    
    // Create client
    const newClient = await ClientService.createClient(testClientData)
    console.log('✅ Client created successfully:', newClient)
    
    // Fetch the created client
    const fetchedClient = await ClientService.getClient(newClient.id)
    console.log('📋 Fetched client:', fetchedClient)
    
    // Test organization creation
    const testOrgData = {
      name: 'Test Organization',
      org_code: 'TEST-ORG-001',
      industry: 'technology',
      country: 'US',
      currency: 'USD'
    }
    
    console.log('🏢 Creating organization:', testOrgData)
    
    const newOrg = await ClientService.createOrganization(newClient.id, testOrgData)
    console.log('✅ Organization created successfully:', newOrg)
    
    // Get client organizations
    const clientOrgs = await ClientService.getClientOrganizations(newClient.id)
    console.log('📋 Client organizations:', clientOrgs)
    
    // Get client stats
    const stats = await ClientService.getClientStats(newClient.id)
    console.log('📊 Client statistics:', stats)
    
    // Test search
    const searchResults = await ClientService.searchClients('Test')
    console.log('🔍 Search results:', searchResults)
    
    // Clean up - delete test data
    await ClientService.deleteClient(newClient.id)
    console.log('🗑️ Test client deleted')
    
    console.log('✅ All tests passed!')
    
    return {
      success: true,
      client: newClient,
      organization: newOrg,
      stats
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Export for manual testing
export default testClientCreation