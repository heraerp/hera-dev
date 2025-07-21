/**
 * HERA Universal - Staff API Routes
 * 
 * Next.js 15 App Router API Route Handler
 * Uses HERA's universal architecture with core_dynamic_data
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Admin client for demo/testing purposes
const getAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

// GET /api/staff
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    // CORE PATTERN: Query core_entities first
    const { data: entities, error } = await supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'staff')
      .order('entity_name', { ascending: true });

    if (error) {
      console.error('Failed to fetch staff entities:', error);
      return NextResponse.json(
        { error: 'Failed to fetch staff entities' },
        { status: 500 }
      );
    }

    // CORE PATTERN: Get dynamic data if entities exist
    let dynamicData: any[] = [];
    const entityIds = entities?.map(e => e.id) || [];
    
    if (entityIds.length > 0) {
      const { data: dynamicDataResult } = await supabase
        .from('core_dynamic_data')
        .select('entity_id, field_name, field_value')
        .in('entity_id', entityIds);
      
      dynamicData = dynamicDataResult || [];
    }

    // CORE PATTERN: Group dynamic data by entity_id
    const dynamicDataMap = dynamicData.reduce((acc, item) => {
      if (!acc[item.entity_id]) {
        acc[item.entity_id] = {};
      }
      acc[item.entity_id][item.field_name] = item.field_value;
      return acc;
    }, {} as Record<string, Record<string, any>>);

    // CORE PATTERN: Combine entities with dynamic data
    const enrichedStaff = (entities || []).map(entity => ({
      id: entity.id,
      name: entity.entity_name,
      employee_id: entity.entity_code,
      is_active: entity.is_active,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
      ...dynamicDataMap[entity.id]
    }));

    return NextResponse.json({
      success: true,
      staff: enrichedStaff
    });

  } catch (error) {
    console.error('Staff GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/staff
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();

    // Validate request
    if (!body.organizationId || !body.name) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, name' },
        { status: 400 }
      );
    }

    // CORE PATTERN: Generate entity code and ID
    const entityCode = `EMP-${Date.now()}-${Math.random().toString(36).substring(2,6).toUpperCase()}`;
    const entityId = crypto.randomUUID();

    // CORE PATTERN: Create entity record
    const { data: entity, error: entityError } = await supabase
      .from('core_entities')
      .insert({
        id: entityId,
        organization_id: body.organizationId,
        entity_type: 'staff',
        entity_name: body.name,
        entity_code: entityCode,
        is_active: true
      })
      .select()
      .single();

    if (entityError) {
      console.error('Failed to create staff entity:', entityError);
      return NextResponse.json(
        { error: 'Failed to create staff entity' },
        { status: 500 }
      );
    }

    // CORE PATTERN: Create dynamic data fields
    const dynamicFields = Object.entries(body)
      .filter(([key, value]) => !['organizationId', 'name'].includes(key) && value !== undefined && value !== '')
      .map(([key, value]) => ({
        entity_id: entityId,
        field_name: key,
        field_value: String(value),
        field_type: typeof value === 'number' ? 'number' : 'text'
      }));

    if (dynamicFields.length > 0) {
      const { error: dynamicError } = await supabase
        .from('core_dynamic_data')
        .insert(dynamicFields);

      if (dynamicError) {
        console.error('Failed to create dynamic data:', dynamicError);
        // Don't fail the entire request, just log the error
      }
    }

    return NextResponse.json({
      success: true,
      staffId: entityId,
      message: 'Staff member created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Staff POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/staff
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, organizationId, ...updates } = body;
    const staffId = id || body.staffId;

    if (!staffId || !organizationId) {
      return NextResponse.json(
        { error: 'Staff ID and Organization ID are required' },
        { status: 400 }
      );
    }

    // Update entity name if provided
    if (updates.name) {
      const { error: entityError } = await supabase
        .from('core_entities')
        .update({ entity_name: updates.name })
        .eq('id', staffId)
        .eq('organization_id', organizationId);

      if (entityError) {
        console.error('Failed to update staff entity:', entityError);
        return NextResponse.json(
          { error: 'Failed to update staff entity' },
          { status: 500 }
        );
      }
    }

    // Update dynamic data fields
    const staffFields = [
      'position', 'department', 'email', 'phone', 'hire_date', 'employment_type',
      'salary', 'hourly_rate', 'emergency_contact', 'emergency_phone', 'notes'
    ];

    for (const field of staffFields) {
      if (field in updates && updates[field] !== undefined) {
        // Check if dynamic data record exists
        const { data: existingData } = await supabase
          .from('core_dynamic_data')
          .select('id')
          .eq('entity_id', staffId)
          .eq('field_name', field)
          .single();

        if (existingData) {
          // Update existing record
          await supabase
            .from('core_dynamic_data')
            .update({
              field_value: String(updates[field]),
              field_type: typeof updates[field] === 'number' ? 'number' : 'text'
            })
            .eq('id', existingData.id);
        } else {
          // Create new record
          await supabase
            .from('core_dynamic_data')
            .insert({
              entity_id: staffId,
              field_name: field,
              field_value: String(updates[field]),
              field_type: typeof updates[field] === 'number' ? 'number' : 'text'
            });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Staff member updated successfully'
    });

  } catch (error) {
    console.error('Staff PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/staff
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get('id');
    const organizationId = searchParams.get('organizationId');

    if (!staffId || !organizationId) {
      return NextResponse.json(
        { error: 'Staff ID and Organization ID are required' },
        { status: 400 }
      );
    }

    // First delete dynamic data
    await supabase
      .from('core_dynamic_data')
      .delete()
      .eq('entity_id', staffId);

    // Then delete entity
    const { error: entityError } = await supabase
      .from('core_entities')
      .delete()
      .eq('id', staffId)
      .eq('organization_id', organizationId);

    if (entityError) {
      console.error('Failed to delete staff entity:', entityError);
      return NextResponse.json(
        { error: 'Failed to delete staff entity' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Staff member deleted successfully'
    });

  } catch (error) {
    console.error('Staff DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}