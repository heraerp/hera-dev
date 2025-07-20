/**
 * HERA Digital Accountant - AI Feedback API
 * 
 * Collects user feedback to improve AI accuracy and performance
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
interface FeedbackRequest {
  organizationId: string;
  feedbackType: 'document_processing' | 'relationship_detection' | 'three_way_match' | 'journal_entry' | 'general';
  entityId: string; // ID of the document, relationship, validation, or journal entry
  rating: number; // 1-5 scale
  accuracy: 'correct' | 'partially_correct' | 'incorrect';
  feedback: string;
  corrections?: {
    expectedResult?: any;
    actualResult?: any;
    correctedFields?: Record<string, any>;
  };
  metadata?: {
    originalConfidence?: number;
    processingTime?: number;
    userExperience?: 'poor' | 'fair' | 'good' | 'excellent';
  };
  submittedBy: string;
}

interface FeedbackSummary {
  totalFeedback: number;
  averageRating: number;
  accuracyDistribution: {
    correct: number;
    partiallyCorrect: number;
    incorrect: number;
  };
  byType: Record<string, {
    count: number;
    averageRating: number;
    accuracyRate: number;
  }>;
  recentFeedback: Array<{
    id: string;
    type: string;
    rating: number;
    feedback: string;
    submittedAt: string;
  }>;
}

// POST /api/digital-accountant/ai/feedback
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body: FeedbackRequest = await request.json();

    console.log('📝 Submitting AI feedback:', JSON.stringify(body, null, 2));

    // Validate request
    if (!body.organizationId || !body.feedbackType || !body.entityId || !body.rating || !body.accuracy || !body.feedback) {
      return NextResponse.json(
        { 
          error: 'Missing required fields: organizationId, feedbackType, entityId, rating, accuracy, feedback',
          success: false
        },
        { status: 400 }
      );
    }

    // Validate rating scale
    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5', success: false },
        { status: 400 }
      );
    }

    // Create feedback entity
    const { data: feedbackEntity, error: createError } = await supabase
      .from('core_entities')
      .insert({
        organization_id: body.organizationId,
        entity_type: 'ai_feedback',
        entity_name: `AI Feedback: ${body.feedbackType}`,
        entity_code: `FEEDBACK_${body.feedbackType.toUpperCase()}_${Date.now()}`,
        is_active: true
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating feedback entity:', createError);
      return NextResponse.json(
        { 
          error: 'Failed to create feedback',
          details: createError,
          success: false
        },
        { status: 500 }
      );
    }

    console.log('✅ Feedback entity created:', feedbackEntity.id);

    // Store feedback data
    const feedbackData = [
      { entity_id: feedbackEntity.id, field_name: 'feedback_type', field_value: body.feedbackType, field_type: 'text' },
      { entity_id: feedbackEntity.id, field_name: 'target_entity_id', field_value: body.entityId, field_type: 'text' },
      { entity_id: feedbackEntity.id, field_name: 'rating', field_value: body.rating.toString(), field_type: 'number' },
      { entity_id: feedbackEntity.id, field_name: 'accuracy', field_value: body.accuracy, field_type: 'text' },
      { entity_id: feedbackEntity.id, field_name: 'feedback_text', field_value: body.feedback, field_type: 'text' },
      { entity_id: feedbackEntity.id, field_name: 'submitted_by', field_value: body.submittedBy, field_type: 'text' },
      { entity_id: feedbackEntity.id, field_name: 'submitted_at', field_value: new Date().toISOString(), field_type: 'timestamp' }
    ];

    // Add optional fields
    if (body.corrections) {
      feedbackData.push({
        entity_id: feedbackEntity.id,
        field_name: 'corrections',
        field_value: JSON.stringify(body.corrections),
        field_type: 'json'
      });
    }

    if (body.metadata) {
      feedbackData.push({
        entity_id: feedbackEntity.id,
        field_name: 'metadata',
        field_value: JSON.stringify(body.metadata),
        field_type: 'json'
      });
    }

    const { error: dataError } = await supabase
      .from('core_dynamic_data')
      .insert(feedbackData);

    if (dataError) {
      console.error('❌ Error storing feedback data:', dataError);
      return NextResponse.json(
        { 
          error: 'Failed to store feedback data',
          details: dataError,
          success: false
        },
        { status: 500 }
      );
    }

    // Create relationship to the target entity
    await supabase
      .from('core_relationships')
      .insert({
        organization_id: body.organizationId,
        relationship_type: 'feedback_target',
        relationship_name: 'Feedback for AI entity',
        parent_entity_id: body.entityId,
        child_entity_id: feedbackEntity.id,
        is_active: true,
        created_by: body.submittedBy,
        metadata: {
          feedback_type: body.feedbackType,
          rating: body.rating,
          accuracy: body.accuracy
        }
      });

    // Store in AI learning system using core_metadata
    await supabase
      .from('core_metadata')
      .insert({
        organization_id: body.organizationId,
        entity_type: 'ai_learning',
        entity_id: body.entityId,
        metadata_type: 'user_feedback',
        metadata_category: 'machine_learning',
        metadata_key: `feedback_${body.feedbackType}`,
        metadata_value: {
          feedback_id: feedbackEntity.id,
          rating: body.rating,
          accuracy: body.accuracy,
          feedback_text: body.feedback,
          corrections: body.corrections,
          submitted_by: body.submittedBy,
          submitted_at: new Date().toISOString(),
          original_confidence: body.metadata?.originalConfidence,
          processing_time: body.metadata?.processingTime
        },
        ai_generated: false
      });

    // Log feedback event
    await supabase
      .from('core_events')
      .insert({
        organization_id: body.organizationId,
        event_type: 'ai_feedback_submitted',
        entity_id: feedbackEntity.id,
        event_data: {
          feedback_type: body.feedbackType,
          target_entity_id: body.entityId,
          rating: body.rating,
          accuracy: body.accuracy,
          has_corrections: !!body.corrections,
          submitted_by: body.submittedBy
        },
        created_at: new Date().toISOString()
      });

    console.log('🎉 AI feedback submitted successfully');

    return NextResponse.json({
      success: true,
      message: 'AI feedback submitted successfully',
      data: {
        feedbackId: feedbackEntity.id,
        feedbackType: body.feedbackType,
        targetEntityId: body.entityId,
        rating: body.rating,
        accuracy: body.accuracy,
        submittedAt: new Date().toISOString()
      }
    }, { status: 201 });

  } catch (error) {
    console.error('❌ AI feedback error:', error);
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

// GET /api/digital-accountant/ai/feedback
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const feedbackType = searchParams.get('feedbackType');
    const period = parseInt(searchParams.get('period') || '30'); // days
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    if (!organizationId || organizationId === 'null' || organizationId === 'undefined') {
      return NextResponse.json(
        { error: 'Valid organizationId is required', success: false },
        { status: 400 }
      );
    }

    console.log('📊 Fetching AI feedback summary for organization:', organizationId);

    const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000).toISOString();

    // Get feedback entities with data
    let query = supabase
      .from('core_entities')
      .select(`
        id,
        created_at,
        core_dynamic_data!inner(field_name, field_value)
      `, { count: 'exact' })
      .eq('organization_id', organizationId)
      .eq('entity_type', 'ai_feedback')
      .gte('created_at', startDate)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: feedbackEntities, error, count } = await query;

    if (error) {
      console.error('❌ Error fetching feedback:', error);
      return NextResponse.json(
        { error: 'Failed to fetch feedback', success: false },
        { status: 500 }
      );
    }

    // Process feedback data
    let totalFeedback = 0;
    let totalRating = 0;
    const accuracyCount = { correct: 0, partiallyCorrect: 0, incorrect: 0 };
    const byType: Record<string, any> = {};
    const recentFeedback = [];

    for (const feedback of (feedbackEntities || [])) {
      const dynamicData = (feedback.core_dynamic_data || []).reduce((acc: any, field: any) => {
        acc[field.field_name] = field.field_value;
        return acc;
      }, {});

      const type = dynamicData.feedback_type;
      const rating = parseInt(dynamicData.rating || '0');
      const accuracy = dynamicData.accuracy;
      const feedbackText = dynamicData.feedback_text;

      // Filter by type if specified
      if (feedbackType && type !== feedbackType) continue;

      totalFeedback++;
      totalRating += rating;

      // Count accuracy
      if (accuracy === 'correct') accuracyCount.correct++;
      else if (accuracy === 'partially_correct') accuracyCount.partiallyCorrect++;
      else if (accuracy === 'incorrect') accuracyCount.incorrect++;

      // Count by type
      if (!byType[type]) {
        byType[type] = { count: 0, totalRating: 0, correct: 0 };
      }
      byType[type].count++;
      byType[type].totalRating += rating;
      if (accuracy === 'correct') byType[type].correct++;

      // Collect recent feedback
      if (recentFeedback.length < 10) {
        recentFeedback.push({
          id: feedback.id,
          type: type,
          rating: rating,
          feedback: feedbackText,
          submittedAt: feedback.created_at
        });
      }
    }

    // Transform by type stats
    const byTypeStats = Object.entries(byType).reduce((acc: any, [type, stats]: [string, any]) => {
      acc[type] = {
        count: stats.count,
        averageRating: stats.count > 0 ? stats.totalRating / stats.count : 0,
        accuracyRate: stats.count > 0 ? stats.correct / stats.count : 0
      };
      return acc;
    }, {});

    const summary: FeedbackSummary = {
      totalFeedback,
      averageRating: totalFeedback > 0 ? totalRating / totalFeedback : 0,
      accuracyDistribution: accuracyCount,
      byType: byTypeStats,
      recentFeedback
    };

    console.log('✅ Feedback summary generated successfully');

    return NextResponse.json({
      data: summary,
      period: `${period} days`,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      success: true
    });

  } catch (error) {
    console.error('❌ Feedback GET error:', error);
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