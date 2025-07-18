import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Service role client for bypassing RLS
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
)

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting orders bulk upload API...')
    
    const { items, organizationId } = await request.json()
    
    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Invalid items data' },
        { status: 400 }
      )
    }

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    console.log(`📦 Processing ${items.length} orders for organization: ${organizationId}`)
    
    const results = []
    const errors = []

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      
      try {
        // Generate order ID
        const orderId = crypto.randomUUID()
        const orderNumber = `ORD-${Date.now()}-${String(i + 1).padStart(3, '0')}`
        
        // Create order in universal_transactions table
        const { data: orderData, error: orderError } = await supabaseAdmin
          .from('universal_transactions')
          .insert({
            id: orderId,
            organization_id: organizationId,
            transaction_type: 'SALES_ORDER',
            transaction_number: orderNumber,
            transaction_date: item.order_date || new Date().toISOString().split('T')[0],
            total_amount: parseFloat(item.total_amount) || 0,
            currency: item.currency || 'USD',
            transaction_status: item.status || 'PENDING'
          })
          .select()
          .single()

        if (orderError) {
          console.error(`❌ Order creation failed for row ${i + 1}:`, orderError)
          errors.push(`Row ${i + 1}: ${orderError.message}`)
          continue
        }

        // Create order items in universal_transaction_lines (if provided)
        if (item.items && Array.isArray(item.items)) {
          const orderItems = item.items.map((orderItem: any, index: number) => ({
            id: crypto.randomUUID(),
            transaction_id: orderId,
            entity_id: orderItem.product_id || null,
            line_description: orderItem.product_name || `Item ${index + 1}`,
            quantity: parseFloat(orderItem.quantity) || 1,
            unit_price: parseFloat(orderItem.unit_price) || 0,
            line_amount: parseFloat(orderItem.quantity || 1) * parseFloat(orderItem.unit_price || 0),
            line_order: index + 1
          }))

          if (orderItems.length > 0) {
            const { error: itemsError } = await supabaseAdmin
              .from('universal_transaction_lines')
              .insert(orderItems)

            if (itemsError) {
              console.error(`❌ Order items creation failed for row ${i + 1}:`, itemsError)
              errors.push(`Row ${i + 1}: Failed to create order items - ${itemsError.message}`)
            }
          }
        }

        // Create order metadata
        const orderMetadata = {
          id: crypto.randomUUID(),
          organization_id: organizationId,
          entity_type: 'transaction',
          entity_id: orderId,
          metadata_type: 'order_context',
          metadata_category: 'customer_experience',
          metadata_key: 'order_details',
          metadata_value: {
            customer_name: item.customer_name || 'Walk-in Customer',
            customer_email: item.customer_email || null,
            customer_phone: item.customer_phone || null,
            table_number: item.table_number || null,
            order_type: item.order_type || 'dine_in',
            special_instructions: item.special_instructions || null,
            estimated_prep_time: item.estimated_prep_time || null,
            payment_method: item.payment_method || null,
            payment_status: item.payment_status || 'pending',
            delivery_address: item.delivery_address || null,
            delivery_instructions: item.delivery_instructions || null,
            discount_applied: item.discount_applied || 0,
            tax_amount: item.tax_amount || 0,
            tip_amount: item.tip_amount || 0,
            notes: item.notes || null
          }
        }

        const { error: metadataError } = await supabaseAdmin
          .from('core_metadata')
          .insert(orderMetadata)

        if (metadataError) {
          console.error(`❌ Order metadata creation failed for row ${i + 1}:`, metadataError)
          // Don't fail the entire order for metadata errors
        }

        results.push({
          row: i + 1,
          id: orderId,
          order_number: orderNumber,
          customer_name: item.customer_name || 'Walk-in Customer',
          total_amount: parseFloat(item.total_amount) || 0,
          status: item.status || 'PENDING'
        })
        
        console.log(`✅ Order ${i + 1} created successfully: ${orderNumber}`)
        
      } catch (error) {
        console.error(`❌ Error processing order ${i + 1}:`, error)
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    console.log(`📊 Bulk upload completed. Success: ${results.length}, Errors: ${errors.length}`)

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${results.length} orders`,
      results,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        total: items.length,
        success: results.length,
        failed: errors.length
      }
    })

  } catch (error) {
    console.error('❌ Bulk upload failed:', error)
    return NextResponse.json(
      { 
        error: 'Bulk upload failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}