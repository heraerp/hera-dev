/**
 * HERA Universal - Exam Questions API Routes
 * 
 * Manages exam questions with AI-powered insights
 * Includes examiner expectations and technique guidance
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

interface QuestionRequest {
  organizationId: string;
  paperId?: string;
  questionNumber: string;
  questionText: string;
  marksAvailable: number;
  topicArea: string;
  questionType: 'knowledge' | 'application' | 'analysis' | 'evaluation';
  difficultyLevel: 'basic' | 'intermediate' | 'advanced';
  commandWords: string;
  timeAllocationMinutes?: number;
  examinerExpectations?: string;
  markSchemePoints?: string[];
  commonMistakes?: string[];
}

// Exam technique rules for different mark allocations
const ExamTechniqueRules: Record<string, any> = {
  "1-2": {
    timeGuidance: "1-2 minutes maximum",
    structure: "Brief, accurate statements only",
    commandWords: ["State", "Give", "Name", "Identify"],
    technique: "No explanation needed - just facts",
    errorPrevention: "Don't waste time explaining when just facts needed"
  },
  "3-6": {
    timeGuidance: "4-9 minutes (1.5 mins per mark)",
    structure: "PEE: Point → Explanation → Example",
    commandWords: ["Explain", "Describe", "Outline"],
    technique: "Apply to business context with examples",
    errorPrevention: "Always include business examples for application marks"
  },
  "8-12": {
    timeGuidance: "12-18 minutes",
    structure: "Multiple detailed points with analysis",
    commandWords: ["Analyse", "Examine", "Assess"],
    technique: "Show cause and effect, consider multiple perspectives",
    errorPrevention: "Go beyond description - analyze WHY and HOW"
  },
  "16-25": {
    timeGuidance: "24-37 minutes",
    structure: "Introduction → Analysis → Evaluation → Conclusion",
    commandWords: ["Evaluate", "Discuss", "To what extent"],
    technique: "Make clear judgments with balanced arguments",
    errorPrevention: "Must show evaluation skills with 'However', 'On balance'"
  }
};

function getMarkRange(marks: number): string {
  if (marks <= 2) return "1-2";
  if (marks <= 6) return "3-6";
  if (marks <= 12) return "8-12";
  return "16-25";
}

// GET /api/education/questions
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const paperId = searchParams.get('paperId');
    const topicArea = searchParams.get('topicArea');
    const difficultyLevel = searchParams.get('difficultyLevel');
    const questionType = searchParams.get('questionType');
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    // Base query for questions
    let query = supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'exam_question')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    const { data: questions, error } = await query;

    if (error) {
      console.error('Error fetching questions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch questions' },
        { status: 500 }
      );
    }

    // Get dynamic data for questions
    let dynamicData: any[] = [];
    const questionIds = questions?.map(q => q.id) || [];
    
    if (questionIds.length > 0) {
      const { data: dynamicDataResult } = await supabase
        .from('core_dynamic_data')
        .select('entity_id, field_name, field_value')
        .in('entity_id', questionIds);
      
      dynamicData = dynamicDataResult || [];
    }

    // Get paper relationships if needed
    let paperRelationships: Record<string, string> = {};
    if (questionIds.length > 0) {
      const { data: relationships } = await supabase
        .from('core_relationships')
        .select('parent_entity_id, child_entity_id')
        .eq('relationship_type', 'paper_question')
        .in('child_entity_id', questionIds);
      
      relationships?.forEach(rel => {
        paperRelationships[rel.child_entity_id] = rel.parent_entity_id;
      });
    }

    // Group dynamic data by entity_id
    const dynamicDataMap = dynamicData.reduce((acc, item) => {
      if (!acc[item.entity_id]) {
        acc[item.entity_id] = {};
      }
      acc[item.entity_id][item.field_name] = item.field_value;
      return acc;
    }, {} as Record<string, Record<string, any>>);

    // Combine all data
    let enrichedQuestions = (questions || []).map(question => {
      const marks = parseInt(dynamicDataMap[question.id]?.marks_available || '0');
      const markRange = getMarkRange(marks);
      const techniqueAdvice = ExamTechniqueRules[markRange];
      
      return {
        id: question.id,
        paperId: paperRelationships[question.id],
        questionNumber: dynamicDataMap[question.id]?.question_number || '',
        questionText: question.entity_name,
        marksAvailable: marks,
        topicArea: dynamicDataMap[question.id]?.topic_area || '',
        questionType: dynamicDataMap[question.id]?.question_type || 'knowledge',
        difficultyLevel: dynamicDataMap[question.id]?.difficulty_level || 'intermediate',
        commandWords: dynamicDataMap[question.id]?.command_words || '',
        timeAllocationMinutes: parseInt(dynamicDataMap[question.id]?.time_allocation_minutes || 
          String(Math.ceil(marks * 1.5))),
        examinerExpectations: dynamicDataMap[question.id]?.examiner_expectations || '',
        markSchemePoints: JSON.parse(dynamicDataMap[question.id]?.mark_scheme_points || '[]'),
        commonMistakes: JSON.parse(dynamicDataMap[question.id]?.common_mistakes || '[]'),
        techniqueAdvice,
        createdAt: question.created_at,
        isActive: question.is_active
      };
    });

    // Apply filters
    if (paperId) {
      enrichedQuestions = enrichedQuestions.filter(q => q.paperId === paperId);
    }
    if (topicArea) {
      enrichedQuestions = enrichedQuestions.filter(q => q.topicArea === topicArea);
    }
    if (difficultyLevel) {
      enrichedQuestions = enrichedQuestions.filter(q => q.difficultyLevel === difficultyLevel);
    }
    if (questionType) {
      enrichedQuestions = enrichedQuestions.filter(q => q.questionType === questionType);
    }

    // Calculate summary statistics
    const totalMarks = enrichedQuestions.reduce((sum, q) => sum + q.marksAvailable, 0);
    const byTopic = enrichedQuestions.reduce((acc, q) => {
      acc[q.topicArea] = (acc[q.topicArea] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      data: enrichedQuestions,
      summary: {
        total: enrichedQuestions.length,
        totalMarks,
        byTopic,
        byDifficulty: {
          basic: enrichedQuestions.filter(q => q.difficultyLevel === 'basic').length,
          intermediate: enrichedQuestions.filter(q => q.difficultyLevel === 'intermediate').length,
          advanced: enrichedQuestions.filter(q => q.difficultyLevel === 'advanced').length
        }
      }
    });

  } catch (error) {
    console.error('Internal server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/education/questions
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body: QuestionRequest = await request.json();

    // Validate request
    if (!body.organizationId || !body.questionText || !body.marksAvailable) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate question code
    const questionCode = `Q-${body.topicArea.toUpperCase().slice(0,3)}-${body.marksAvailable}M-${Math.random().toString(36).substring(2,6).toUpperCase()}`;
    const questionId = crypto.randomUUID();

    // Create entity record
    const { data: question, error: questionError } = await supabase
      .from('core_entities')
      .insert({
        id: questionId,
        organization_id: body.organizationId,
        entity_type: 'exam_question',
        entity_name: body.questionText,
        entity_code: questionCode,
        is_active: true
      })
      .select()
      .single();

    if (questionError) {
      console.error('Error creating question:', questionError);
      return NextResponse.json(
        { error: 'Failed to create question' },
        { status: 500 }
      );
    }

    // Calculate time allocation if not provided
    const timeAllocation = body.timeAllocationMinutes || Math.ceil(body.marksAvailable * 1.5);

    // Get technique advice
    const markRange = getMarkRange(body.marksAvailable);
    const techniqueAdvice = ExamTechniqueRules[markRange];

    // Create dynamic data fields
    const dynamicFields = [
      {
        entity_id: questionId,
        field_name: 'question_number',
        field_value: body.questionNumber,
        field_type: 'text'
      },
      {
        entity_id: questionId,
        field_name: 'marks_available',
        field_value: String(body.marksAvailable),
        field_type: 'number'
      },
      {
        entity_id: questionId,
        field_name: 'topic_area',
        field_value: body.topicArea,
        field_type: 'text'
      },
      {
        entity_id: questionId,
        field_name: 'question_type',
        field_value: body.questionType,
        field_type: 'text'
      },
      {
        entity_id: questionId,
        field_name: 'difficulty_level',
        field_value: body.difficultyLevel,
        field_type: 'text'
      },
      {
        entity_id: questionId,
        field_name: 'command_words',
        field_value: body.commandWords,
        field_type: 'text'
      },
      {
        entity_id: questionId,
        field_name: 'time_allocation_minutes',
        field_value: String(timeAllocation),
        field_type: 'number'
      },
      {
        entity_id: questionId,
        field_name: 'examiner_expectations',
        field_value: body.examinerExpectations || techniqueAdvice.technique,
        field_type: 'text'
      },
      {
        entity_id: questionId,
        field_name: 'mark_scheme_points',
        field_value: JSON.stringify(body.markSchemePoints || []),
        field_type: 'text'
      },
      {
        entity_id: questionId,
        field_name: 'common_mistakes',
        field_value: JSON.stringify(body.commonMistakes || [techniqueAdvice.errorPrevention]),
        field_type: 'text'
      }
    ];

    const { error: dynamicError } = await supabase
      .from('core_dynamic_data')
      .insert(dynamicFields);

    if (dynamicError) {
      console.error('Error creating dynamic data:', dynamicError);
    }

    // Create paper-question relationship if paperId provided
    if (body.paperId) {
      await supabase
        .from('core_relationships')
        .insert({
          organization_id: body.organizationId,
          relationship_type: 'paper_question',
          relationship_subtype: 'contains',
          parent_entity_id: body.paperId,
          child_entity_id: questionId,
          relationship_name: `Paper contains ${body.questionNumber}`,
          is_active: true
        });
    }

    // Create question creation transaction
    await supabase
      .from('universal_transactions')
      .insert({
        organization_id: body.organizationId,
        transaction_type: 'question_creation',
        transaction_subtype: body.paperId ? 'from_paper' : 'standalone',
        transaction_number: questionCode,
        transaction_date: new Date().toISOString(),
        total_amount: body.marksAvailable,
        currency: 'MARKS',
        transaction_status: 'completed',
        is_financial: false,
        transaction_data: {
          question_id: questionId,
          paper_id: body.paperId,
          topic_area: body.topicArea,
          difficulty_level: body.difficultyLevel,
          question_type: body.questionType
        }
      });

    return NextResponse.json({
      success: true,
      data: {
        id: questionId,
        code: questionCode,
        questionText: body.questionText,
        marksAvailable: body.marksAvailable,
        techniqueAdvice
      },
      message: 'Question created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Internal server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}