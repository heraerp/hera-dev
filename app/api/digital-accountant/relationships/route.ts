/**
 * HERA Digital Accountant - Transaction Relationship Management API
 * 
 * Manages auto-detected and manual transaction relationships
 * Following Purchase Order API patterns exactly
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Admin client for bypassing RLS during development
const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

// TypeScript interfaces
interface RelationshipCreateRequest {
  organizationId: string;
  parentEntityId: string;
  childEntityId: string;
  relationshipType: 'po_to_gr' | 'gr_to_invoice' | 'document_to_transaction' | 'custom';
  confidence?: number;
  metadata?: Record<string, any>;
  manualOverride?: boolean;
}

interface RelationshipResponse {
  id: string;
  relationshipType: string;
  parentEntity: {
    id: string;
    type: string;
    code: string;
    name: string;
  };
  childEntity: {
    id: string;
    type: string;
    code: string;
    name: string;
  };
  confidence: number;
  detectionMethod: string;
  matchFactors: string[];
  createdAt: string;
  createdBy: string;
}

// GET /api/digital-accountant/relationships
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const relationshipType = searchParams.get('relationshipType');
    const minConfidence = searchParams.get('minConfidence');
    const detectionMethod = searchParams.get('detectionMethod');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    if (!organizationId || organizationId === 'null' || organizationId === 'undefined') {
      return NextResponse.json(
        { error: 'Valid organizationId is required', success: false },
        { status: 400 }
      );
    }

    console.log('🔗 Fetching relationships for organization:', organizationId);

    // Build query
    let query = supabase
      .from('core_relationships')
      .select(`
        *,
        parent_entity:core_entities!parent_entity_id(id, entity_type, entity_code, entity_name),
        child_entity:core_entities!child_entity_id(id, entity_type, entity_code, entity_name)
      `, { count: 'exact' })
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (relationshipType) {
      query = query.eq('relationship_type', relationshipType);
    }

    if (minConfidence) {
      query = query.gte('relationship_strength', parseFloat(minConfidence));
    }

    const { data: relationships, error, count } = await query;

    if (error) {
      console.error('❌ Error fetching relationships:', error);
      return NextResponse.json(
        { error: 'Failed to fetch relationships', success: false },
        { status: 500 }
      );
    }

    // Transform relationships
    const transformedRelationships = (relationships || []).map(rel => {
      const metadata = rel.metadata || {};
      const confidence = rel.relationship_strength || metadata.confidence_score || 0;
      
      // Filter by detection method if specified
      if (detectionMethod && metadata.detection_method !== detectionMethod) {
        return null;
      }

      return {
        id: rel.id,
        relationshipType: rel.relationship_type,
        relationshipName: rel.relationship_name,
        parentEntity: {
          id: rel.parent_entity.id,
          type: rel.parent_entity.entity_type,
          code: rel.parent_entity.entity_code,
          name: rel.parent_entity.entity_name
        },
        childEntity: {
          id: rel.child_entity.id,
          type: rel.child_entity.entity_type,
          code: rel.child_entity.entity_code,
          name: rel.child_entity.entity_name
        },
        confidence: confidence,
        detectionMethod: metadata.detection_method || 'manual',
        matchFactors: metadata.match_factors || [],
        metadata: metadata,
        createdAt: rel.created_at,
        createdBy: rel.created_by || 'system'
      };
    }).filter(Boolean);

    console.log(`✅ Found ${transformedRelationships.length} relationships`);

    return NextResponse.json({
      data: transformedRelationships,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      success: true
    });

  } catch (error) {
    console.error('❌ Relationships GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    );
  }
}

// POST /api/digital-accountant/relationships
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body: RelationshipCreateRequest = await request.json();

    console.log('🔗 Creating manual relationship:', JSON.stringify(body, null, 2));

    // Validate request
    if (!body.organizationId || !body.parentEntityId || !body.childEntityId || !body.relationshipType) {
      return NextResponse.json(
        { 
          error: 'Missing required fields: organizationId, parentEntityId, childEntityId, relationshipType',
          success: false
        },
        { status: 400 }
      );
    }

    // Verify both entities exist and belong to the organization
    const { data: parentEntity } = await supabase
      .from('core_entities')
      .select('id, entity_type, entity_code, entity_name')
      .eq('id', body.parentEntityId)
      .eq('organization_id', body.organizationId)
      .single();

    const { data: childEntity } = await supabase
      .from('core_entities')
      .select('id, entity_type, entity_code, entity_name')
      .eq('id', body.childEntityId)
      .eq('organization_id', body.organizationId)
      .single();

    if (!parentEntity || !childEntity) {
      return NextResponse.json(
        { error: 'One or both entities not found or do not belong to the organization', success: false },
        { status: 404 }
      );
    }

    // Check if relationship already exists
    const { data: existingRel } = await supabase
      .from('core_relationships')
      .select('id')
      .eq('organization_id', body.organizationId)
      .eq('parent_entity_id', body.parentEntityId)
      .eq('child_entity_id', body.childEntityId)
      .eq('relationship_type', body.relationshipType)
      .eq('is_active', true)
      .single();

    if (existingRel) {
      return NextResponse.json(
        { error: 'Relationship already exists', success: false },
        { status: 409 }
      );
    }

    // Get relationship type entity
    const { data: relTypeEntity } = await supabase
      .from('core_entities')
      .select('id')
      .eq('entity_type', 'relationship_type')
      .eq('entity_code', body.relationshipType.toUpperCase().replace('_', '_TO_') + '_REL')
      .single();

    // Build metadata
    const metadata = {
      ...body.metadata,
      detection_method: body.manualOverride ? 'manual_override' : 'manual_creation',
      confidence_score: body.confidence || 1.0,
      created_via_api: true,
      match_factors: ['manual_verification'],
      created_at: new Date().toISOString()
    };

    // Create the relationship
    const { data: newRelationship, error: createError } = await supabase
      .from('core_relationships')
      .insert({
        organization_id: body.organizationId,
        relationship_type_id: relTypeEntity?.id,
        relationship_type: body.relationshipType,
        relationship_name: `Manual: ${parentEntity.entity_code} → ${childEntity.entity_code}`,
        parent_entity_id: body.parentEntityId,
        child_entity_id: body.childEntityId,
        is_active: true,
        created_by: 'api_manual_creation',
        metadata: metadata,
        relationship_strength: body.confidence || 1.0
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating relationship:', createError);
      return NextResponse.json(
        { 
          error: 'Failed to create relationship',
          details: createError,
          success: false
        },
        { status: 500 }
      );
    }

    console.log('✅ Relationship created successfully:', newRelationship.id);

    // Log the manual creation in core_events
    await supabase
      .from('core_events')
      .insert({
        organization_id: body.organizationId,
        event_type: 'relationship_manual_creation',
        entity_id: newRelationship.id,
        event_data: {
          relationship_type: body.relationshipType,
          parent_entity: {
            id: parentEntity.id,
            type: parentEntity.entity_type,
            code: parentEntity.entity_code
          },
          child_entity: {
            id: childEntity.id,
            type: childEntity.entity_type,
            code: childEntity.entity_code
          },
          confidence: body.confidence || 1.0,
          manual_override: body.manualOverride || false
        },
        created_at: new Date().toISOString()
      });

    // If this completes a chain, trigger validation
    if (body.relationshipType === 'gr_to_invoice' && childEntity.entity_type === 'universal_transactions') {
      // Trigger three-way match validation
      const { data: validationResult } = await supabase
        .rpc('validate_three_way_match', {
          invoice_id: body.childEntityId
        });

      console.log('🔍 Three-way match validation triggered:', validationResult);
    }

    const response: RelationshipResponse = {
      id: newRelationship.id,
      relationshipType: newRelationship.relationship_type,
      parentEntity: {
        id: parentEntity.id,
        type: parentEntity.entity_type,
        code: parentEntity.entity_code,
        name: parentEntity.entity_name
      },
      childEntity: {
        id: childEntity.id,
        type: childEntity.entity_type,
        code: childEntity.entity_code,
        name: childEntity.entity_name
      },
      confidence: body.confidence || 1.0,
      detectionMethod: 'manual',
      matchFactors: ['manual_verification'],
      createdAt: newRelationship.created_at,
      createdBy: 'api_manual_creation'
    };

    return NextResponse.json({
      data: response,
      success: true,
      message: 'Relationship created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Relationships POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    );
  }
}