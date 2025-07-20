/**
 * HERA Digital Accountant - Pending Review Relationships API
 * 
 * Lists relationships with low confidence requiring human review
 * Following Purchase Order API patterns
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

// GET /api/digital-accountant/relationships/pending-review
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const maxConfidence = searchParams.get('maxConfidence') || '0.80'; // Default threshold
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    if (!organizationId || organizationId === 'null' || organizationId === 'undefined') {
      return NextResponse.json(
        { error: 'Valid organizationId is required', success: false },
        { status: 400 }
      );
    }

    console.log('🔍 Fetching low-confidence relationships for review:', {
      organizationId,
      maxConfidence,
      page,
      limit
    });

    // Query relationships with low confidence scores
    const { data: relationships, error, count } = await supabase
      .from('core_relationships')
      .select(`
        *,
        parent_entity:core_entities!parent_entity_id(
          id, 
          entity_type, 
          entity_code, 
          entity_name,
          core_dynamic_data(field_name, field_value)
        ),
        child_entity:core_entities!child_entity_id(
          id, 
          entity_type, 
          entity_code, 
          entity_name,
          core_dynamic_data(field_name, field_value)
        )
      `, { count: 'exact' })
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .lte('relationship_strength', parseFloat(maxConfidence))
      .order('relationship_strength', { ascending: true }) // Lowest confidence first
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Error fetching pending review relationships:', error);
      return NextResponse.json(
        { error: 'Failed to fetch pending review relationships', success: false },
        { status: 500 }
      );
    }

    // Transform and enrich the relationships
    const transformedRelationships = (relationships || []).map(rel => {
      const metadata = rel.metadata || {};
      
      // Extract dynamic data for parent entity
      const parentData = (rel.parent_entity?.core_dynamic_data || []).reduce((acc: any, field: any) => {
        acc[field.field_name] = field.field_value;
        return acc;
      }, {});

      // Extract dynamic data for child entity
      const childData = (rel.child_entity?.core_dynamic_data || []).reduce((acc: any, field: any) => {
        acc[field.field_name] = field.field_value;
        return acc;
      }, {});

      // Determine review reasons based on confidence factors
      const reviewReasons = [];
      const confidence = rel.relationship_strength || 0;

      if (confidence < 0.5) {
        reviewReasons.push('Very low confidence score');
      } else if (confidence < 0.7) {
        reviewReasons.push('Low confidence score');
      } else {
        reviewReasons.push('Below auto-approval threshold');
      }

      // Check specific match factors
      if (metadata.supplier_match === false) {
        reviewReasons.push('Supplier mismatch');
      }
      if (metadata.amount_variance_percent > 10) {
        reviewReasons.push(`High amount variance: ${metadata.amount_variance_percent.toFixed(1)}%`);
      }
      if (metadata.days_difference > 30) {
        reviewReasons.push(`Large date gap: ${metadata.days_difference} days`);
      }

      return {
        id: rel.id,
        relationshipType: rel.relationship_type,
        relationshipName: rel.relationship_name,
        confidence: confidence,
        reviewReasons: reviewReasons,
        parentEntity: {
          id: rel.parent_entity.id,
          type: rel.parent_entity.entity_type,
          code: rel.parent_entity.entity_code,
          name: rel.parent_entity.entity_name,
          details: {
            amount: parseFloat(parentData.total_amount || '0'),
            date: parentData.transaction_date,
            supplier: parentData.supplier_name || parentData.vendor_name
          }
        },
        childEntity: {
          id: rel.child_entity.id,
          type: rel.child_entity.entity_type,
          code: rel.child_entity.entity_code,
          name: rel.child_entity.entity_name,
          details: {
            amount: parseFloat(childData.total_amount || '0'),
            date: childData.transaction_date,
            supplier: childData.supplier_name || childData.vendor_name
          }
        },
        matchDetails: {
          detectionMethod: metadata.detection_method,
          matchFactors: metadata.match_factors || [],
          supplierMatch: metadata.supplier_match,
          daysDifference: metadata.days_difference,
          amountVariance: metadata.amount_variance_percent,
          detectedAt: metadata.detected_at
        },
        suggestedActions: [
          confidence < 0.3 ? 'Remove relationship' : 'Review and confirm',
          'Update supplier mapping',
          'Adjust variance tolerance'
        ],
        createdAt: rel.created_at,
        createdBy: rel.created_by
      };
    });

    // Calculate review statistics
    const stats = {
      totalPendingReview: count || 0,
      byConfidenceRange: {
        veryLow: transformedRelationships.filter(r => r.confidence < 0.3).length,
        low: transformedRelationships.filter(r => r.confidence >= 0.3 && r.confidence < 0.5).length,
        medium: transformedRelationships.filter(r => r.confidence >= 0.5 && r.confidence < 0.7).length,
        belowThreshold: transformedRelationships.filter(r => r.confidence >= 0.7).length
      },
      byRelationshipType: transformedRelationships.reduce((acc: any, rel) => {
        acc[rel.relationshipType] = (acc[rel.relationshipType] || 0) + 1;
        return acc;
      }, {})
    };

    console.log(`✅ Found ${transformedRelationships.length} relationships pending review`);

    return NextResponse.json({
      data: transformedRelationships,
      stats: stats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      success: true
    });

  } catch (error) {
    console.error('❌ Pending review GET error:', error);
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

// PUT /api/digital-accountant/relationships/pending-review
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();

    const { relationshipId, action, newConfidence, reviewNotes } = body;

    if (!relationshipId || !action) {
      return NextResponse.json(
        { error: 'relationshipId and action are required', success: false },
        { status: 400 }
      );
    }

    console.log('📝 Processing review action:', { relationshipId, action });

    let updateData: any = {
      updated_at: new Date().toISOString()
    };

    switch (action) {
      case 'approve':
        updateData.relationship_strength = newConfidence || 1.0;
        updateData.metadata = supabase.sql`
          metadata || jsonb_build_object(
            'review_approved', true,
            'review_date', '${new Date().toISOString()}',
            'review_notes', '${reviewNotes || 'Manually approved'}',
            'original_confidence', relationship_strength
          )
        `;
        break;

      case 'reject':
        updateData.is_active = false;
        updateData.metadata = supabase.sql`
          metadata || jsonb_build_object(
            'review_rejected', true,
            'review_date', '${new Date().toISOString()}',
            'review_notes', '${reviewNotes || 'Manually rejected'}',
            'rejection_reason', '${reviewNotes}'
          )
        `;
        break;

      case 'adjust_confidence':
        if (!newConfidence) {
          return NextResponse.json(
            { error: 'newConfidence is required for adjust_confidence action', success: false },
            { status: 400 }
          );
        }
        updateData.relationship_strength = newConfidence;
        updateData.metadata = supabase.sql`
          metadata || jsonb_build_object(
            'confidence_adjusted', true,
            'adjustment_date', '${new Date().toISOString()}',
            'original_confidence', relationship_strength,
            'adjusted_confidence', ${newConfidence}
          )
        `;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: approve, reject, or adjust_confidence', success: false },
          { status: 400 }
        );
    }

    // Update the relationship
    const { data: updatedRel, error } = await supabase
      .from('core_relationships')
      .update(updateData)
      .eq('id', relationshipId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating relationship:', error);
      return NextResponse.json(
        { 
          error: 'Failed to update relationship',
          details: error,
          success: false
        },
        { status: 500 }
      );
    }

    // Log the review action
    await supabase
      .from('core_events')
      .insert({
        organization_id: updatedRel.organization_id,
        event_type: 'relationship_review_action',
        entity_id: relationshipId,
        event_data: {
          action: action,
          original_confidence: updatedRel.relationship_strength,
          new_confidence: newConfidence,
          review_notes: reviewNotes,
          reviewed_by: 'api_user' // In production, get from auth
        },
        created_at: new Date().toISOString()
      });

    console.log('✅ Review action completed successfully');

    return NextResponse.json({
      success: true,
      message: `Relationship ${action} completed successfully`,
      data: {
        relationshipId: relationshipId,
        action: action,
        newStatus: action === 'reject' ? 'inactive' : 'active',
        newConfidence: newConfidence || updatedRel.relationship_strength
      }
    });

  } catch (error) {
    console.error('❌ Review action error:', error);
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