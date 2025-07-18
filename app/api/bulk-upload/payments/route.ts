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
    console.log('🚀 Starting payments bulk upload API...')
    
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

    console.log(`📦 Processing ${items.length} payments for organization: ${organizationId}`)
    
    const results = []
    const errors = []

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      
      try {
        // Generate payment ID
        const paymentId = crypto.randomUUID()
        const paymentNumber = `PAY-${Date.now()}-${String(i + 1).padStart(3, '0')}`
        
        // Create payment in universal_transactions table
        const { data: paymentData, error: paymentError } = await supabaseAdmin
          .from('universal_transactions')
          .insert({
            id: paymentId,
            organization_id: organizationId,
            transaction_type: 'PAYMENT',
            transaction_number: paymentNumber,
            transaction_date: item.transaction_date || new Date().toISOString().split('T')[0],
            total_amount: parseFloat(item.amount) || 0,
            currency: item.currency || 'USD',
            transaction_status: item.status || 'completed'
          })
          .select()
          .single()

        if (paymentError) {
          console.error(`❌ Payment creation failed for row ${i + 1}:`, paymentError)
          errors.push(`Row ${i + 1}: ${paymentError.message}`)
          continue
        }

        // Create payment metadata
        const paymentMetadata = {
          id: crypto.randomUUID(),
          organization_id: organizationId,
          entity_type: 'transaction',
          entity_id: paymentId,
          metadata_type: 'payment_details',
          metadata_category: 'financial',
          metadata_key: 'payment_information',
          metadata_value: {
            transaction_id: item.transaction_id || paymentNumber,
            payment_method: item.payment_method || 'cash',
            payment_gateway: item.payment_gateway || null,
            gateway_transaction_id: item.gateway_transaction_id || null,
            card_last_four: item.card_last_four || null,
            card_brand: item.card_brand || null,
            processing_fee: item.processing_fee || 0,
            net_amount: parseFloat(item.amount || 0) - parseFloat(item.processing_fee || 0),
            customer_name: item.customer_name || null,
            customer_email: item.customer_email || null,
            customer_phone: item.customer_phone || null,
            billing_address: item.billing_address || null,
            description: item.description || null,
            reference_number: item.reference_number || null,
            authorization_code: item.authorization_code || null,
            receipt_url: item.receipt_url || null,
            refund_amount: item.refund_amount || 0,
            refund_reason: item.refund_reason || null,
            processor_response: item.processor_response || null,
            risk_score: item.risk_score || null,
            notes: item.notes || null
          }
        }

        const { error: metadataError } = await supabaseAdmin
          .from('core_metadata')
          .insert(paymentMetadata)

        if (metadataError) {
          console.error(`❌ Payment metadata creation failed for row ${i + 1}:`, metadataError)
          // Don't fail the entire payment for metadata errors
        }

        results.push({
          row: i + 1,
          id: paymentId,
          payment_number: paymentNumber,
          amount: parseFloat(item.amount) || 0,
          payment_method: item.payment_method || 'cash',
          customer_name: item.customer_name || null,
          status: item.status || 'completed'
        })
        
        console.log(`✅ Payment ${i + 1} created successfully: ${paymentNumber}`)
        
      } catch (error) {
        console.error(`❌ Error processing payment ${i + 1}:`, error)
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    console.log(`📊 Bulk upload completed. Success: ${results.length}, Errors: ${errors.length}`)

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${results.length} payments`,
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