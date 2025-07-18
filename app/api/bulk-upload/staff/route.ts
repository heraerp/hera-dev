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
    console.log('🚀 Starting staff bulk upload API...')
    
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

    console.log(`📦 Processing ${items.length} staff members for organization: ${organizationId}`)
    
    const results = []
    const errors = []

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      
      try {
        // Generate staff member ID
        const staffId = crypto.randomUUID()
        const staffCode = `STAFF-${Date.now()}-${String(i + 1).padStart(3, '0')}`
        
        // Create staff member in core_entities table
        const { data: entityData, error: entityError } = await supabaseAdmin
          .from('core_entities')
          .insert({
            id: staffId,
            organization_id: organizationId,
            entity_type: 'staff',
            entity_name: item.name || `Staff Member ${i + 1}`,
            entity_code: staffCode,
            is_active: item.is_active !== undefined ? item.is_active : true
          })
          .select()
          .single()

        if (entityError) {
          console.error(`❌ Staff entity creation failed for row ${i + 1}:`, entityError)
          errors.push(`Row ${i + 1}: ${entityError.message}`)
          continue
        }

        // Create staff metadata
        const staffMetadata = {
          id: crypto.randomUUID(),
          organization_id: organizationId,
          entity_type: 'staff',
          entity_id: staffId,
          metadata_type: 'staff_details',
          metadata_category: 'employment',
          metadata_key: 'staff_information',
          metadata_value: {
            employee_id: item.employee_id || staffCode,
            email: item.email || null,
            phone: item.phone || null,
            position: item.position || null,
            department: item.department || null,
            hire_date: item.hire_date || null,
            salary: item.salary || null,
            hourly_rate: item.hourly_rate || null,
            employment_type: item.employment_type || 'full_time',
            status: item.status || 'active',
            emergency_contact_name: item.emergency_contact_name || null,
            emergency_contact_phone: item.emergency_contact_phone || null,
            address: item.address || null,
            date_of_birth: item.date_of_birth || null,
            national_id: item.national_id || null,
            bank_account_number: item.bank_account_number || null,
            tax_id: item.tax_id || null,
            skills: item.skills || null,
            certifications: item.certifications || null,
            notes: item.notes || null
          }
        }

        const { error: metadataError } = await supabaseAdmin
          .from('core_metadata')
          .insert(staffMetadata)

        if (metadataError) {
          console.error(`❌ Staff metadata creation failed for row ${i + 1}:`, metadataError)
          // Don't fail the entire staff member for metadata errors
        }

        results.push({
          row: i + 1,
          id: staffId,
          staff_code: staffCode,
          name: item.name || `Staff Member ${i + 1}`,
          position: item.position || null,
          department: item.department || null,
          status: item.status || 'active'
        })
        
        console.log(`✅ Staff member ${i + 1} created successfully: ${staffCode}`)
        
      } catch (error) {
        console.error(`❌ Error processing staff member ${i + 1}:`, error)
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    console.log(`📊 Bulk upload completed. Success: ${results.length}, Errors: ${errors.length}`)

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${results.length} staff members`,
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