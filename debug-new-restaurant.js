/**
 * Debug New Restaurant Data
 * Check what data exists for the newly created restaurant
 */

import { createClient } from '@/lib/supabase/client';
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Create Supabase client with service role for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function debugNewRestaurantData() {
  try {
    console.log('🔍 Debugging New Restaurant Data...')
    
    // Get the most recent restaurant organization
    const { data: organizations, error: orgsError } = await supabase
      .from('core_organizations')
      .select('*')
      .eq('industry', 'restaurant')
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (orgsError) {
      console.error('❌ Organizations error:', orgsError)
      return
    }
    
    if (!organizations || organizations.length === 0) {
      console.log('❌ No restaurant organizations found')
      return
    }
    
    const restaurant = organizations[0]
    console.log(`\n🏪 Most Recent Restaurant: ${restaurant.org_name}`)
    console.log(`   Organization ID: ${restaurant.id}`)
    console.log(`   Client ID: ${restaurant.client_id}`)
    console.log(`   Created: ${restaurant.created_at}`)
    console.log(`   Industry: ${restaurant.industry}`)
    console.log(`   Active: ${restaurant.is_active}`)
    
    // Check for menu categories
    console.log('\n📋 Menu Categories:')
    const { data: categories, error: catError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', restaurant.id)
      .eq('entity_type', 'menu_category')
    
    if (catError) {
      console.error('❌ Categories error:', catError)
    } else if (categories && categories.length > 0) {
      categories.forEach(cat => {
        console.log(`  - ${cat.entity_name} (${cat.entity_code})`)
      })
    } else {
      console.log('  ❌ No menu categories found')
    }
    
    // Check for products
    console.log('\n🛍️ Products:')
    const { data: products, error: prodError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', restaurant.id)
      .eq('entity_type', 'product')
    
    if (prodError) {
      console.error('❌ Products error:', prodError)
    } else if (products && products.length > 0) {
      products.forEach(prod => {
        console.log(`  - ${prod.entity_name} (${prod.entity_code})`)
      })
    } else {
      console.log('  ❌ No products found - This is why dashboard is empty!')
    }
    
    // Check for orders/transactions
    console.log('\n📦 Orders/Transactions:')
    const { data: transactions, error: transError } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', restaurant.id)
    
    if (transError) {
      console.error('❌ Transactions error:', transError)
    } else if (transactions && transactions.length > 0) {
      transactions.forEach(trans => {
        console.log(`  - ${trans.transaction_number}: ${trans.transaction_type} - $${trans.total_amount}`)
      })
    } else {
      console.log('  ❌ No transactions found - This is expected for new restaurants')
    }
    
    // Check user-organization link
    console.log('\n👤 User Links:')
    const { data: userLinks, error: linkError } = await supabase
      .from('user_organizations')
      .select(`
        *,
        core_users(email, full_name)
      `)
      .eq('organization_id', restaurant.id)
    
    if (linkError) {
      console.error('❌ User links error:', linkError)
    } else if (userLinks && userLinks.length > 0) {
      userLinks.forEach(link => {
        console.log(`  - ${link.core_users?.email} (${link.role})`)
      })
    } else {
      console.log('  ❌ No user links found')
    }
    
    console.log('\n📊 Summary:')
    console.log(`✅ Restaurant created: ${restaurant.org_name}`)
    console.log(`✅ Categories: ${categories?.length || 0}`)
    console.log(`❌ Products: ${products?.length || 0} (Need to add products)`)
    console.log(`❌ Orders: ${transactions?.length || 0} (Expected for new restaurants)`)
    console.log(`✅ User Access: ${userLinks?.length || 0}`)
    
    console.log('\n🎯 Next Steps:')
    console.log('1. Go to /restaurant/products and add some menu items')
    console.log('2. Go to /restaurant/orders and create test orders')
    console.log('3. Dashboard will show analytics once you have transaction data')
    
  } catch (error) {
    console.error('❌ Debug script error:', error)
  }
}

// Run the debug script
debugNewRestaurantData()