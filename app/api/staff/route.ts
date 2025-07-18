import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin client for RLS bypass
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
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')

    if (!organizationId) {
      return NextResponse.json({ success: false, error: 'Organization ID is required' }, { status: 400 })
    }

    console.log('🔍 Fetching staff for organization:', organizationId)

    // Get staff entities from core_entities
    const { data: entities, error: entitiesError } = await supabaseAdmin
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'staff')
      .eq('is_active', true)

    if (entitiesError) {
      console.error('❌ Error fetching entities:', entitiesError)
      return NextResponse.json({ success: false, error: entitiesError.message }, { status: 500 })
    }

    if (!entities || entities.length === 0) {
      console.log('✅ No staff found for organization')
      return NextResponse.json({ success: true, staff: [] })
    }

    // Get metadata for all staff entities
    const entityIds = entities.map(e => e.id)
    const { data: metadata, error: metadataError } = await supabaseAdmin
      .from('core_metadata')
      .select('entity_id, metadata_key, metadata_value')
      .eq('organization_id', organizationId)
      .in('entity_id', entityIds)

    if (metadataError) {
      console.error('❌ Error fetching metadata:', metadataError)
      return NextResponse.json({ success: false, error: metadataError.message }, { status: 500 })
    }

    // Combine entities with their metadata
    const staffWithMetadata = entities.map(entity => {
      const entityMetadata = metadata?.filter(m => m.entity_id === entity.id) || []
      const metadataObj = {}
      
      entityMetadata.forEach(meta => {
        try {
          // Handle JSON string values
          if (typeof meta.metadata_value === 'string' && 
              (meta.metadata_value.startsWith('{') || 
               meta.metadata_value.startsWith('[') || 
               meta.metadata_value.startsWith('"'))) {
            metadataObj[meta.metadata_key] = JSON.parse(meta.metadata_value)
          } else {
            metadataObj[meta.metadata_key] = meta.metadata_value
          }
        } catch {
          metadataObj[meta.metadata_key] = meta.metadata_value
        }
      })

      return {
        id: entity.id,
        name: entity.entity_name,
        employee_id: entity.entity_code,
        is_active: entity.is_active,
        created_at: entity.created_at,
        updated_at: entity.updated_at,
        ...metadataObj
      }
    })

    console.log('✅ Retrieved staff:', staffWithMetadata.length)
    return NextResponse.json({ success: true, staff: staffWithMetadata })

  } catch (error) {
    console.error('❌ Staff GET error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { organizationId, ...staffData } = data

    if (!organizationId) {
      return NextResponse.json({ success: false, error: 'Organization ID is required' }, { status: 400 })
    }

    if (!staffData.name) {
      return NextResponse.json({ success: false, error: 'Staff name is required' }, { status: 400 })
    }

    console.log('🚀 Creating staff member:', staffData.name)

    const staffId = crypto.randomUUID()
    // System user UUID for created_by field
    const systemUserId = '00000000-0000-0000-0000-000000000001'
    
    // Generate unique employee ID with timestamp and random string
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase()
    const employeeId = staffData.employee_id || `EMP-${timestamp}-${randomStr}`

    // Create entity record
    const { data: entity, error: entityError } = await supabaseAdmin
      .from('core_entities')
      .insert({
        id: staffId,
        organization_id: organizationId,
        entity_type: 'staff',
        entity_name: staffData.name,
        entity_code: employeeId, // This now uses the unique employee ID
        is_active: true
      })
      .select()
      .single()

    if (entityError) {
      console.error('❌ Error creating entity:', entityError)
      return NextResponse.json({ success: false, error: entityError.message }, { status: 500 })
    }

    // Create metadata records for all staff fields
    const metadataRecords = []
    const staffFields = [
      'position', 'department', 'email', 'phone', 'hire_date', 'employment_type',
      'salary', 'hourly_rate', 'address', 'emergency_contact', 'emergency_phone',
      'date_of_birth', 'shift_schedule', 'access_level', 'notes'
    ]

    staffFields.forEach(field => {
      if (staffData[field]) {
        metadataRecords.push({
          id: crypto.randomUUID(),
          organization_id: organizationId,
          entity_type: 'staff',
          entity_id: staffId,
          metadata_type: 'staff_details',
          metadata_category: 'employment',
          metadata_key: field,
          metadata_value: JSON.stringify(staffData[field]),
          created_by: systemUserId
        })
      }
    })

    if (metadataRecords.length > 0) {
      const { error: metadataError } = await supabaseAdmin
        .from('core_metadata')
        .insert(metadataRecords)

      if (metadataError) {
        console.error('❌ Error creating metadata:', metadataError)
        return NextResponse.json({ success: false, error: metadataError.message }, { status: 500 })
      }
    }

    console.log('✅ Staff member created successfully')
    return NextResponse.json({ 
      success: true, 
      staffId,
      message: 'Staff member created successfully'
    })

  } catch (error) {
    console.error('❌ Staff POST error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const staffId = searchParams.get('id')
    const organizationId = searchParams.get('organizationId')

    if (!staffId || !organizationId) {
      return NextResponse.json({ success: false, error: 'Staff ID and Organization ID are required' }, { status: 400 })
    }

    console.log('🗑️ Deleting staff member:', staffId)

    // First delete metadata
    const { error: metadataError } = await supabaseAdmin
      .from('core_metadata')
      .delete()
      .eq('entity_id', staffId)
      .eq('organization_id', organizationId)

    if (metadataError) {
      console.error('❌ Error deleting metadata:', metadataError)
      return NextResponse.json({ success: false, error: metadataError.message }, { status: 500 })
    }

    // Then delete entity
    const { error: entityError } = await supabaseAdmin
      .from('core_entities')
      .delete()
      .eq('id', staffId)
      .eq('organization_id', organizationId)

    if (entityError) {
      console.error('❌ Error deleting entity:', entityError)
      return NextResponse.json({ success: false, error: entityError.message }, { status: 500 })
    }

    console.log('✅ Staff member deleted successfully')
    return NextResponse.json({ success: true, message: 'Staff member deleted successfully' })

  } catch (error) {
    console.error('❌ Staff DELETE error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { staffId, organizationId, ...updates } = data

    if (!staffId || !organizationId) {
      return NextResponse.json({ success: false, error: 'Staff ID and Organization ID are required' }, { status: 400 })
    }

    console.log('📝 Updating staff member:', staffId)

    // Update entity name if provided
    if (updates.name) {
      const { error: entityError } = await supabaseAdmin
        .from('core_entities')
        .update({ entity_name: updates.name })
        .eq('id', staffId)
        .eq('organization_id', organizationId)

      if (entityError) {
        console.error('❌ Error updating entity:', entityError)
        return NextResponse.json({ success: false, error: entityError.message }, { status: 500 })
      }
    }

    // Update metadata fields
    const staffFields = [
      'position', 'department', 'email', 'phone', 'hire_date', 'employment_type',
      'salary', 'hourly_rate', 'address', 'emergency_contact', 'emergency_phone',
      'date_of_birth', 'shift_schedule', 'access_level', 'notes'
    ]

    for (const field of staffFields) {
      if (field in updates) {
        // Check if metadata record exists
        const { data: existingMetadata } = await supabaseAdmin
          .from('core_metadata')
          .select('id')
          .eq('organization_id', organizationId)
          .eq('entity_id', staffId)
          .eq('metadata_key', field)
          .single()

        if (existingMetadata) {
          // Update existing metadata record
          const { error: metadataError } = await supabaseAdmin
            .from('core_metadata')
            .update({
              metadata_value: JSON.stringify(updates[field])
            })
            .eq('id', existingMetadata.id)
          
          if (metadataError) {
            console.error('❌ Error updating metadata:', metadataError)
            return NextResponse.json({ success: false, error: metadataError.message }, { status: 500 })
          }
        } else {
          // Create new metadata record
          const { error: metadataError } = await supabaseAdmin
            .from('core_metadata')
            .insert({
              id: crypto.randomUUID(),
              organization_id: organizationId,
              entity_type: 'staff',
              entity_id: staffId,
              metadata_type: 'staff_details',
              metadata_category: 'employment',
              metadata_key: field,
              metadata_value: JSON.stringify(updates[field]),
              created_by: '00000000-0000-0000-0000-000000000001'
            })
          
          if (metadataError) {
            console.error('❌ Error creating metadata:', metadataError)
            return NextResponse.json({ success: false, error: metadataError.message }, { status: 500 })
          }
        }
      }
    }

    console.log('✅ Staff member updated successfully')
    return NextResponse.json({ success: true, message: 'Staff member updated successfully' })

  } catch (error) {
    console.error('❌ Staff PUT error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}