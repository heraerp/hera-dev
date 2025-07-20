/**
 * HERA Education - Content Library API
 * 
 * Manages cached AI-generated content for instant access
 * Saves questions, answers, explanations, and exam tips
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

interface ContentRequest {
  organizationId: string;
  type: 'question' | 'explanation' | 'exam_tips' | 'study_plan';
  topic?: string;
  marks?: number;
  difficulty?: string;
  searchTerm?: string;
}

// GET /api/education/content - Retrieve cached content
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const type = searchParams.get('type');
    const topic = searchParams.get('topic');
    const marks = searchParams.get('marks');
    const difficulty = searchParams.get('difficulty');
    const searchTerm = searchParams.get('search');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    // Build query based on content type
    let query = supabase
      .from('core_entities')
      .select(`
        *,
        content_data:core_dynamic_data(field_name, field_value)
      `)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    // Filter by content type
    if (type === 'question') {
      query = query.eq('entity_type', 'cached_question');
    } else if (type === 'explanation') {
      query = query.eq('entity_type', 'topic_explanation');
    } else if (type === 'exam_tips') {
      query = query.eq('entity_type', 'exam_tips');
    } else if (type === 'study_plan') {
      query = query.eq('entity_type', 'study_plan');
    } else {
      // Return all content types
      query = query.in('entity_type', ['cached_question', 'topic_explanation', 'exam_tips', 'study_plan']);
    }

    const { data: content, error } = await query;

    if (error) {
      console.error('Error fetching content:', error);
      return NextResponse.json(
        { error: 'Failed to fetch content' },
        { status: 500 }
      );
    }

    // Process and filter results
    let enrichedContent = (content || []).map(item => {
      const dynamicData = item.content_data.reduce((acc: any, field: any) => {
        acc[field.field_name] = field.field_value;
        return acc;
      }, {});

      return {
        id: item.id,
        type: item.entity_type,
        title: item.entity_name,
        code: item.entity_code,
        createdAt: item.created_at,
        ...dynamicData
      };
    });

    // Apply filters
    if (topic) {
      enrichedContent = enrichedContent.filter(item => 
        item.topic_area?.toLowerCase().includes(topic.toLowerCase())
      );
    }

    if (marks) {
      enrichedContent = enrichedContent.filter(item => 
        item.marks_available === marks
      );
    }

    if (difficulty) {
      enrichedContent = enrichedContent.filter(item => 
        item.difficulty_level === difficulty
      );
    }

    if (searchTerm) {
      enrichedContent = enrichedContent.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.topic_area?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Group by type for easier consumption
    const groupedContent = {
      questions: enrichedContent.filter(item => item.type === 'cached_question'),
      explanations: enrichedContent.filter(item => item.type === 'topic_explanation'),
      examTips: enrichedContent.filter(item => item.type === 'exam_tips'),
      studyPlans: enrichedContent.filter(item => item.type === 'study_plan')
    };

    return NextResponse.json({
      success: true,
      data: groupedContent,
      summary: {
        total: enrichedContent.length,
        byType: {
          questions: groupedContent.questions.length,
          explanations: groupedContent.explanations.length,
          examTips: groupedContent.examTips.length,
          studyPlans: groupedContent.studyPlans.length
        },
        availableTopics: [...new Set(enrichedContent.map(item => item.topic_area).filter(Boolean))]
      }
    });

  } catch (error) {
    console.error('Error in content API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/education/content - Cache new AI-generated content
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, type, content, metadata } = body;

    if (!organizationId || !type || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();
    const contentId = crypto.randomUUID();
    const contentCode = `${type.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substring(2,6).toUpperCase()}`;

    // Map content types to entity types
    const entityTypeMap = {
      'question': 'cached_question',
      'explanation': 'topic_explanation', 
      'exam_tips': 'exam_tips',
      'study_plan': 'study_plan'
    };

    const entityType = entityTypeMap[type as keyof typeof entityTypeMap] || 'cached_content';

    // Create entity record
    const { data: entity, error: entityError } = await supabase
      .from('core_entities')
      .insert({
        id: contentId,
        organization_id: organizationId,
        entity_type: entityType,
        entity_name: content.title || content.question || content.topic || 'Cached Content',
        entity_code: contentCode,
        is_active: true
      })
      .select()
      .single();

    if (entityError) {
      console.error('Error creating content entity:', entityError);
      return NextResponse.json(
        { error: 'Failed to cache content' },
        { status: 500 }
      );
    }

    // Store content data
    const dynamicFields = [
      {
        entity_id: contentId,
        field_name: 'content_type',
        field_value: type,
        field_type: 'text'
      },
      {
        entity_id: contentId,
        field_name: 'ai_generated',
        field_value: 'true',
        field_type: 'text'
      },
      {
        entity_id: contentId,
        field_name: 'cache_timestamp',
        field_value: new Date().toISOString(),
        field_type: 'text'
      }
    ];

    // Store content-specific fields
    Object.entries(content).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        dynamicFields.push({
          entity_id: contentId,
          field_name: key,
          field_value: typeof value === 'object' ? JSON.stringify(value) : String(value),
          field_type: typeof value === 'object' ? 'json' : typeof value === 'number' ? 'number' : 'text'
        });
      }
    });

    // Store metadata
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          dynamicFields.push({
            entity_id: contentId,
            field_name: `meta_${key}`,
            field_value: typeof value === 'object' ? JSON.stringify(value) : String(value),
            field_type: typeof value === 'object' ? 'json' : typeof value === 'number' ? 'number' : 'text'
          });
        }
      });
    }

    await supabase.from('core_dynamic_data').insert(dynamicFields);

    // Create caching transaction
    await supabase.from('universal_transactions').insert({
      organization_id: organizationId,
      transaction_type: 'content_caching',
      transaction_subtype: type,
      transaction_number: contentCode,
      transaction_date: new Date().toISOString(),
      total_amount: 0,
      currency: 'USD',
      transaction_status: 'completed',
      is_financial: false,
      transaction_data: {
        content_id: contentId,
        content_type: type,
        cache_strategy: 'ai_generated_content',
        content_size: JSON.stringify(content).length,
        timestamp: new Date().toISOString()
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: contentId,
        code: contentCode,
        type: entityType,
        cached: true
      },
      message: 'Content cached successfully'
    });

  } catch (error) {
    console.error('Error caching content:', error);
    return NextResponse.json(
      { error: 'Failed to cache content' },
      { status: 500 }
    );
  }
}