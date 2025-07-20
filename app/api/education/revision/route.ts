/**
 * HERA Education - Revision Mode API
 * 
 * Provides revision content exclusively from cached AI-generated content
 * No OpenAI calls - only uses previously generated and cached materials
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

interface RevisionRequest {
  organizationId: string;
  studentId?: string;
  topic?: string;
  contentType?: 'question' | 'explanation' | 'exam_tips' | 'study_plan' | 'all';
  difficulty?: string;
  marks?: number;
  limit?: number;
}

// GET /api/education/revision - Get revision content from cache only
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const topic = searchParams.get('topic');
    const contentType = searchParams.get('contentType') || 'all';
    const difficulty = searchParams.get('difficulty');
    const marks = searchParams.get('marks');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    // Get all cached content for the organization
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
    if (contentType !== 'all') {
      const entityTypeMap = {
        'question': 'cached_question',
        'explanation': 'topic_explanation', 
        'exam_tips': 'exam_tips',
        'study_plan': 'study_plan'
      };
      const entityType = entityTypeMap[contentType as keyof typeof entityTypeMap];
      if (entityType) {
        query = query.eq('entity_type', entityType);
      }
    } else {
      query = query.in('entity_type', ['cached_question', 'topic_explanation', 'exam_tips', 'study_plan']);
    }

    // Apply limit
    query = query.limit(limit);

    const { data: content, error } = await query;

    if (error) {
      console.error('Error fetching revision content:', error);
      return NextResponse.json(
        { error: 'Failed to fetch revision content' },
        { status: 500 }
      );
    }

    // Process and enrich content
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
        cachedContent: true,
        ...dynamicData
      };
    });

    // Apply additional filters
    if (topic) {
      enrichedContent = enrichedContent.filter(item => 
        item.topic_area?.toLowerCase().includes(topic.toLowerCase())
      );
    }

    if (difficulty) {
      enrichedContent = enrichedContent.filter(item => 
        item.difficulty_level === difficulty
      );
    }

    if (marks) {
      enrichedContent = enrichedContent.filter(item => 
        item.marks_available === marks
      );
    }

    // Group by type for easier consumption
    const groupedContent = {
      questions: enrichedContent.filter(item => item.type === 'cached_question'),
      explanations: enrichedContent.filter(item => item.type === 'topic_explanation'),
      examTips: enrichedContent.filter(item => item.type === 'exam_tips'),
      studyPlans: enrichedContent.filter(item => item.type === 'study_plan')
    };

    // Get content statistics
    const stats = {
      totalItems: enrichedContent.length,
      byType: {
        questions: groupedContent.questions.length,
        explanations: groupedContent.explanations.length,
        examTips: groupedContent.examTips.length,
        studyPlans: groupedContent.studyPlans.length
      },
      byTopic: [...new Set(enrichedContent.map(item => item.topic_area).filter(Boolean))],
      byDifficulty: [...new Set(enrichedContent.map(item => item.difficulty_level).filter(Boolean))],
      availableMarks: [...new Set(enrichedContent.map(item => item.marks_available).filter(Boolean))].sort((a, b) => a - b)
    };

    return NextResponse.json({
      success: true,
      data: groupedContent,
      stats,
      revision: {
        mode: 'cached_content_only',
        description: 'All content is from previously generated AI materials - no new API calls needed',
        totalCachedItems: enrichedContent.length,
        recommendation: enrichedContent.length === 0 
          ? 'Generate some practice content first by using the AI Tutor or Practice modes'
          : 'Great! You have plenty of cached content for effective revision'
      },
      message: 'Revision content retrieved from cache'
    });

  } catch (error) {
    console.error('Error in revision API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/education/revision - Create a personalized revision plan from cached content
export async function POST(request: NextRequest) {
  try {
    const body: RevisionRequest = await request.json();

    if (!body.organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    // Get student's weak areas if studentId provided
    let weakAreas: string[] = [];
    if (body.studentId) {
      const { data: studentAnswers } = await supabase
        .from('universal_transactions')
        .select('transaction_data')
        .eq('organization_id', body.organizationId)
        .eq('transaction_type', 'answer_submission')
        .eq('transaction_data->>student_id', body.studentId)
        .order('created_at', { ascending: false })
        .limit(20);

      // Analyze performance to identify weak topics
      if (studentAnswers) {
        const topicPerformance: Record<string, number[]> = {};
        
        studentAnswers.forEach(answer => {
          const topic = answer.transaction_data?.topic_area;
          const score = (answer.transaction_data?.estimated_marks || 0) / (answer.transaction_data?.max_marks || 1) * 100;
          if (topic) {
            if (!topicPerformance[topic]) topicPerformance[topic] = [];
            topicPerformance[topic].push(score);
          }
        });

        // Find topics with average score below 60%
        weakAreas = Object.entries(topicPerformance)
          .map(([topic, scores]) => ({
            topic,
            average: scores.reduce((a, b) => a + b, 0) / scores.length
          }))
          .filter(item => item.average < 60)
          .map(item => item.topic);
      }
    }

    // Get all cached content
    const { data: allContent } = await supabase
      .from('core_entities')
      .select(`
        *,
        content_data:core_dynamic_data(field_name, field_value)
      `)
      .eq('organization_id', body.organizationId)
      .eq('is_active', true)
      .in('entity_type', ['cached_question', 'topic_explanation', 'exam_tips']);

    if (!allContent || allContent.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          revisionPlan: [],
          recommendation: 'No cached content available yet. Generate some content first using the AI Tutor or Practice modes.'
        },
        message: 'No cached content available for revision'
      });
    }

    // Process content and create revision plan
    const processedContent = allContent.map(item => {
      const dynamicData = item.content_data.reduce((acc: any, field: any) => {
        acc[field.field_name] = field.field_value;
        return acc;
      }, {});

      return {
        id: item.id,
        type: item.entity_type,
        title: item.entity_name,
        topicArea: dynamicData.topic_area,
        difficulty: dynamicData.difficulty_level,
        marks: dynamicData.marks_available,
        ...dynamicData
      };
    });

    // Create personalized revision plan
    const revisionSessions = [];

    // Priority 1: Weak areas (if student provided)
    if (weakAreas.length > 0) {
      weakAreas.forEach(topic => {
        const topicContent = processedContent.filter(content => 
          content.topicArea?.toLowerCase().includes(topic.toLowerCase())
        );

        if (topicContent.length > 0) {
          revisionSessions.push({
            sessionTitle: `Focus Session: ${topic}`,
            priority: 'high',
            reason: 'Identified as weak area',
            content: topicContent.slice(0, 3), // Limit to 3 items per session
            estimatedMinutes: 30
          });
        }
      });
    }

    // Priority 2: Recent content for reinforcement
    const recentContent = processedContent
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 6);

    if (recentContent.length > 0) {
      revisionSessions.push({
        sessionTitle: 'Recent Learning Reinforcement',
        priority: 'medium',
        reason: 'Recently generated content for reinforcement',
        content: recentContent,
        estimatedMinutes: 25
      });
    }

    // Priority 3: Comprehensive review by topic
    const allTopics = [...new Set(processedContent.map(item => item.topicArea).filter(Boolean))];
    
    allTopics.slice(0, 3).forEach(topic => {
      const topicContent = processedContent.filter(content => 
        content.topicArea === topic
      );

      if (topicContent.length > 1) {
        revisionSessions.push({
          sessionTitle: `Complete Review: ${topic}`,
          priority: 'low',
          reason: 'Comprehensive topic coverage',
          content: topicContent.slice(0, 4),
          estimatedMinutes: 20
        });
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        revisionPlan: revisionSessions,
        totalSessions: revisionSessions.length,
        estimatedTotalTime: revisionSessions.reduce((total, session) => total + session.estimatedMinutes, 0),
        weakAreasIdentified: weakAreas,
        availableContent: {
          total: processedContent.length,
          byType: {
            questions: processedContent.filter(c => c.type === 'cached_question').length,
            explanations: processedContent.filter(c => c.type === 'topic_explanation').length,
            examTips: processedContent.filter(c => c.type === 'exam_tips').length
          }
        }
      },
      message: 'Personalized revision plan created from cached content'
    });

  } catch (error) {
    console.error('Error creating revision plan:', error);
    return NextResponse.json(
      { error: 'Failed to create revision plan' },
      { status: 500 }
    );
  }
}