/**
 * Customer CRUD Service Usage Examples
 * 
 * This file demonstrates how to use the CustomerCrudService
 * for all CRUD operations with proper error handling.
 */

import { CustomerCrudService } from '@/lib/services/customerCrudService'
import type { CustomerCreateInput, CustomerUpdateInput, CustomerListOptions } from '@/lib/services/customerCrudService'

// Example organization ID (replace with actual)
const ORGANIZATION_ID = 'your-organization-id'

// ============================================================================
// EXAMPLE 1: CREATE A NEW CUSTOMER
// ============================================================================

export async function createCustomerExample() {
  console.log('📝 Creating new customer...')
  
  const newCustomer: CustomerCreateInput = {
    organizationId: ORGANIZATION_ID,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+1-555-9876',
    firstName: 'Sarah',
    lastName: 'Johnson',
    customerType: 'individual',
    birthDate: '1985-08-15',
    preferredName: 'Sarah',
    acquisitionSource: 'instagram',
    preferredContactMethod: 'email',
    notes: 'Loves herbal teas and quiet atmosphere',
    // Preferences
    favoriteTeas: ['chamomile', 'peppermint', 'lemon_ginger'],
    caffeinePreference: 'low',
    temperaturePreference: 'hot',
    dietaryRestrictions: ['vegetarian'],
    allergies: ['shellfish']
  }

  const result = await CustomerCrudService.createCustomer(newCustomer)
  
  if (result.success) {
    console.log('✅ Customer created successfully!')
    console.log('Customer ID:', result.data?.id)
    console.log('Customer Name:', result.data?.entityName)
    console.log('Customer Email:', result.data?.email)
    return result.data
  } else {
    console.error('❌ Failed to create customer:', result.error)
    return null
  }
}

// ============================================================================
// EXAMPLE 2: GET A CUSTOMER BY ID
// ============================================================================

export async function getCustomerExample(customerId: string) {
  console.log('📖 Getting customer by ID...')
  
  const result = await CustomerCrudService.getCustomer(ORGANIZATION_ID, customerId)
  
  if (result.success) {
    console.log('✅ Customer retrieved successfully!')
    console.log('Name:', result.data?.entityName)
    console.log('Email:', result.data?.email)
    console.log('Phone:', result.data?.phone)
    console.log('Type:', result.data?.customerType)
    console.log('Loyalty Tier:', result.data?.loyaltyTier)
    console.log('Total Orders:', result.data?.totalOrders)
    console.log('Total Spent:', result.data?.totalSpent)
    console.log('Preferences:', result.data?.preferences)
    return result.data
  } else {
    console.error('❌ Failed to get customer:', result.error)
    return null
  }
}

// ============================================================================
// EXAMPLE 3: LIST CUSTOMERS WITH FILTERING
// ============================================================================

export async function listCustomersExample() {
  console.log('📋 Listing customers...')
  
  const options: CustomerListOptions = {
    search: '', // Empty for all customers
    customerType: undefined, // Filter by type if needed
    loyaltyTier: undefined, // Filter by loyalty tier if needed
    isActive: true, // Only active customers
    limit: 25, // Page size
    offset: 0, // Start from beginning
    orderBy: 'created_at',
    orderDirection: 'desc'
  }

  const result = await CustomerCrudService.listCustomers(ORGANIZATION_ID, options)
  
  if (result.success) {
    console.log('✅ Customers retrieved successfully!')
    console.log('Total customers:', result.data?.total)
    console.log('Customers returned:', result.data?.customers.length)
    
    // Display first few customers
    result.data?.customers.slice(0, 5).forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.entityName} (${customer.email}) - ${customer.loyaltyTier}`)
    })
    
    return result.data
  } else {
    console.error('❌ Failed to list customers:', result.error)
    return null
  }
}

// ============================================================================
// EXAMPLE 4: SEARCH CUSTOMERS
// ============================================================================

export async function searchCustomersExample(searchTerm: string) {
  console.log('🔍 Searching customers for:', searchTerm)
  
  const options: CustomerListOptions = {
    search: searchTerm,
    isActive: true,
    limit: 10,
    offset: 0
  }

  const result = await CustomerCrudService.listCustomers(ORGANIZATION_ID, options)
  
  if (result.success) {
    console.log('✅ Search completed!')
    console.log('Matching customers:', result.data?.customers.length)
    
    result.data?.customers.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.entityName} (${customer.email})`)
    })
    
    return result.data
  } else {
    console.error('❌ Search failed:', result.error)
    return null
  }
}

// ============================================================================
// EXAMPLE 5: UPDATE A CUSTOMER
// ============================================================================

export async function updateCustomerExample(customerId: string) {
  console.log('📝 Updating customer...')
  
  const updates: CustomerUpdateInput = {
    email: 'sarah.johnson.updated@example.com',
    phone: '+1-555-1111',
    customerType: 'vip',
    notes: 'Updated to VIP status - excellent customer!',
    // Update preferences
    favoriteTeas: ['chamomile', 'peppermint', 'earl_grey'],
    caffeinePreference: 'moderate',
    temperaturePreference: 'both'
  }

  const result = await CustomerCrudService.updateCustomer(ORGANIZATION_ID, customerId, updates)
  
  if (result.success) {
    console.log('✅ Customer updated successfully!')
    console.log('Updated name:', result.data?.entityName)
    console.log('Updated email:', result.data?.email)
    console.log('Updated type:', result.data?.customerType)
    return result.data
  } else {
    console.error('❌ Failed to update customer:', result.error)
    return null
  }
}

// ============================================================================
// EXAMPLE 6: UPDATE CUSTOMER BUSINESS INTELLIGENCE
// ============================================================================

export async function updateCustomerStatsExample(customerId: string) {
  console.log('📊 Updating customer statistics after order...')
  
  const orderAmount = 42.50
  
  const result = await CustomerCrudService.updateCustomerStats(
    ORGANIZATION_ID, 
    customerId, 
    {
      incrementVisits: true,
      addSpending: orderAmount,
      updateLastVisit: true
    }
  )
  
  if (result.success) {
    console.log('✅ Customer stats updated successfully!')
    console.log('Order amount:', orderAmount)
    console.log('Visit count incremented')
    console.log('Last visit date updated')
    
    // Get updated customer to see new stats
    const updatedCustomer = await CustomerCrudService.getCustomer(ORGANIZATION_ID, customerId)
    if (updatedCustomer.success) {
      console.log('New total visits:', updatedCustomer.data?.totalOrders)
      console.log('New lifetime value:', updatedCustomer.data?.totalSpent)
      console.log('New loyalty tier:', updatedCustomer.data?.loyaltyTier)
    }
    
    return result.data
  } else {
    console.error('❌ Failed to update customer stats:', result.error)
    return null
  }
}

// ============================================================================
// EXAMPLE 7: DELETE A CUSTOMER
// ============================================================================

export async function deleteCustomerExample(customerId: string) {
  console.log('🗑️ Deleting customer...')
  
  // First get customer info for logging
  const customer = await CustomerCrudService.getCustomer(ORGANIZATION_ID, customerId)
  if (!customer.success) {
    console.error('❌ Customer not found for deletion')
    return false
  }
  
  const result = await CustomerCrudService.deleteCustomer(ORGANIZATION_ID, customerId)
  
  if (result.success) {
    console.log('✅ Customer deleted successfully!')
    console.log('Deleted customer:', customer.data?.entityName)
    return true
  } else {
    console.error('❌ Failed to delete customer:', result.error)
    return false
  }
}

// ============================================================================
// EXAMPLE 8: BULK DELETE CUSTOMERS
// ============================================================================

export async function bulkDeleteCustomersExample(customerIds: string[]) {
  console.log('🗑️ Bulk deleting customers...')
  console.log('Customer IDs:', customerIds)
  
  const result = await CustomerCrudService.bulkDeleteCustomers(ORGANIZATION_ID, customerIds)
  
  if (result.success) {
    console.log('✅ Bulk delete completed!')
    console.log('Deleted:', result.data?.deleted)
    console.log('Failed:', result.data?.failed)
    return result.data
  } else {
    console.error('❌ Bulk delete failed:', result.error)
    return null
  }
}

// ============================================================================
// EXAMPLE 9: FILTER CUSTOMERS BY TYPE AND LOYALTY
// ============================================================================

export async function filterCustomersExample() {
  console.log('🔍 Filtering customers by type and loyalty...')
  
  // Get VIP customers
  const vipOptions: CustomerListOptions = {
    customerType: 'vip',
    isActive: true,
    limit: 20,
    offset: 0,
    orderBy: 'updated_at',
    orderDirection: 'desc'
  }

  const vipResult = await CustomerCrudService.listCustomers(ORGANIZATION_ID, vipOptions)
  
  if (vipResult.success) {
    console.log('✅ VIP customers found:', vipResult.data?.customers.length)
  }

  // Get gold/platinum loyalty customers
  const loyalOptions: CustomerListOptions = {
    loyaltyTier: 'gold',
    isActive: true,
    limit: 20,
    offset: 0
  }

  const loyalResult = await CustomerCrudService.listCustomers(ORGANIZATION_ID, loyalOptions)
  
  if (loyalResult.success) {
    console.log('✅ Gold loyalty customers found:', loyalResult.data?.customers.length)
  }

  return {
    vipCustomers: vipResult.data?.customers || [],
    goldCustomers: loyalResult.data?.customers || []
  }
}

// ============================================================================
// EXAMPLE 10: COMPLETE CUSTOMER WORKFLOW
// ============================================================================

export async function completeCustomerWorkflowExample() {
  console.log('🔄 Running complete customer workflow...')
  
  try {
    // Step 1: Create customer
    console.log('\n1. Creating customer...')
    const customer = await createCustomerExample()
    if (!customer) throw new Error('Failed to create customer')
    
    // Step 2: Get customer details
    console.log('\n2. Getting customer details...')
    const customerDetails = await getCustomerExample(customer.id)
    if (!customerDetails) throw new Error('Failed to get customer')
    
    // Step 3: Update customer
    console.log('\n3. Updating customer...')
    const updatedCustomer = await updateCustomerExample(customer.id)
    if (!updatedCustomer) throw new Error('Failed to update customer')
    
    // Step 4: Simulate order and update stats
    console.log('\n4. Processing order and updating stats...')
    const statsUpdated = await updateCustomerStatsExample(customer.id)
    if (!statsUpdated) throw new Error('Failed to update stats')
    
    // Step 5: Final customer state
    console.log('\n5. Final customer state...')
    const finalCustomer = await getCustomerExample(customer.id)
    if (!finalCustomer) throw new Error('Failed to get final state')
    
    console.log('\n🎉 Complete workflow successful!')
    console.log('Final customer state:')
    console.log('  Name:', finalCustomer.entityName)
    console.log('  Email:', finalCustomer.email)
    console.log('  Type:', finalCustomer.customerType)
    console.log('  Loyalty Tier:', finalCustomer.loyaltyTier)
    console.log('  Total Orders:', finalCustomer.totalOrders)
    console.log('  Total Spent:', finalCustomer.totalSpent)
    
    // Step 6: Cleanup - delete test customer
    console.log('\n6. Cleaning up test customer...')
    await deleteCustomerExample(customer.id)
    
    return finalCustomer
    
  } catch (error) {
    console.error('❌ Workflow failed:', error)
    return null
  }
}

// ============================================================================
// EXPORT ALL EXAMPLES
// ============================================================================

export const CustomerCrudExamples = {
  createCustomer: createCustomerExample,
  getCustomer: getCustomerExample,
  listCustomers: listCustomersExample,
  searchCustomers: searchCustomersExample,
  updateCustomer: updateCustomerExample,
  updateCustomerStats: updateCustomerStatsExample,
  deleteCustomer: deleteCustomerExample,
  bulkDeleteCustomers: bulkDeleteCustomersExample,
  filterCustomers: filterCustomersExample,
  completeWorkflow: completeCustomerWorkflowExample
}

// Usage in components:
// import { CustomerCrudExamples } from '@/examples/customer-crud-usage'
// const result = await CustomerCrudExamples.createCustomer()