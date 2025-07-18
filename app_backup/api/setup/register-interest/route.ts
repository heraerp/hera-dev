import UniversalCrudService from '@/lib/services/universalCrudService'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const body = await request.json()
    const {
      entityType,
      solutionId,
      solutionTitle,
      email,
      category,
      estimatedLaunch,
      metadata
    } = body

    // Validate required fields
    if (!entityType || !solutionId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate unique ID for the interest registration
    const entityId = crypto.randomUUID()
    const entityCode = `INT-${solutionId.toUpperCase()}-${Date.now()}`

    // Insert into core_entities table
    const { error: entityError } = await supabase
      .from('core_entities')
      .insert({
        id: entityId,
        organization_id: null, // No organization for interest registrations
        entity_type: entityType,
        entity_name: `Interest: ${solutionTitle}`,
        entity_code: entityCode,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (entityError) {
      console.error('Error creating entity:', entityError)
      return NextResponse.json(
        { error: 'Failed to create interest registration' },
        { status: 500 }
      )
    }

    // Insert into core_metadata table
    const metadataRecords = [
      {
        organization_id: null,
        entity_type: entityType,
        entity_id: entityId,
        metadata_type: 'contact_info',
        metadata_category: 'email',
        metadata_key: 'email_address',
        metadata_value: JSON.stringify({ email })
      },
      {
        organization_id: null,
        entity_type: entityType,
        entity_id: entityId,
        metadata_type: 'solution_info',
        metadata_category: 'product_interest',
        metadata_key: 'solution_details',
        metadata_value: JSON.stringify({
          solutionId,
          solutionTitle,
          category,
          estimatedLaunch
        })
      },
      {
        organization_id: null,
        entity_type: entityType,
        entity_id: entityId,
        metadata_type: 'tracking_info',
        metadata_category: 'registration_data',
        metadata_key: 'metadata',
        metadata_value: JSON.stringify(metadata)
      }
    ]

    const { error: metadataError } = await supabase
      .from('core_metadata')
      .insert(metadataRecords)

    if (metadataError) {
      console.error('Error creating metadata:', metadataError)
      // Try to clean up the entity if metadata fails
      await supabase
        .from('core_entities')
        .delete()
        .eq('id', entityId)
      
      return NextResponse.json(
        { error: 'Failed to save interest details' },
        { status: 500 }
      )
    }

    // Success response
    return NextResponse.json({
      success: true,
      message: 'Interest registered successfully',
      data: {
        entityId,
        entityCode,
        solutionTitle,
        email,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error in register-interest API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve interest registrations (for admin use)
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const solutionId = searchParams.get('solutionId')

    // Base query for interest registrations
    let entityQuery = supabase
      .from('core_entities')
      .select('*')
      .eq('entity_type', 'interest_registration')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    const { data: entities, error: entityError } = await entityQuery

    if (entityError) {
      console.error('Error fetching entities:', entityError)
      return NextResponse.json(
        { error: 'Failed to fetch interest registrations' },
        { status: 500 }
      )
    }

    if (!entities || entities.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0
      })
    }

    // Get metadata for all entities
    const entityIds = entities.map(e => e.id)
    const { data: metadata, error: metadataError } = await supabase
      .from('core_metadata')
      .select('*')
      .in('entity_id', entityIds)

    if (metadataError) {
      console.error('Error fetching metadata:', metadataError)
      return NextResponse.json(
        { error: 'Failed to fetch interest details' },
        { status: 500 }
      )
    }

    // Combine entities with their metadata
    const registrations = entities.map(entity => {
      const entityMetadata = metadata?.filter(m => m.entity_id === entity.id) || []
      
      let email = ''
      let solutionDetails = {}
      let registrationMetadata = {}

      entityMetadata.forEach(meta => {
        if (meta.metadata_category === 'email') {
          email = JSON.parse(meta.metadata_value).email
        } else if (meta.metadata_category === 'product_interest') {
          solutionDetails = JSON.parse(meta.metadata_value)
        } else if (meta.metadata_category === 'registration_data') {
          registrationMetadata = JSON.parse(meta.metadata_value)
        }
      })

      return {
        id: entity.id,
        email,
        solutionDetails,
        metadata: registrationMetadata,
        createdAt: entity.created_at
      }
    })

    // Filter by solutionId if provided
    const filteredRegistrations = solutionId 
      ? registrations.filter(r => r.solutionDetails.solutionId === solutionId)
      : registrations

    return NextResponse.json({
      success: true,
      data: filteredRegistrations,
      count: filteredRegistrations.length
    })

  } catch (error) {
    console.error('Error in GET register-interest API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}