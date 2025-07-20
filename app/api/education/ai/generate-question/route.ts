/**
 * HERA Education - AI Question Generation API
 * 
 * Uses OpenAI to generate unlimited practice questions based on
 * Edexcel Business A-Level syllabus
 */

import { NextRequest, NextResponse } from 'next/server';
import { generatePracticeQuestion, EDEXCEL_BUSINESS_SYLLABUS } from '@/lib/openai';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

interface QuestionRequest {
  organizationId: string;
  topic?: string;
  marks?: number;
  studentLevel?: 'basic' | 'intermediate' | 'advanced';
  studentId?: string;
}

// POST /api/education/ai/generate-question
export async function POST(request: NextRequest) {
  try {
    const body: QuestionRequest = await request.json();

    if (!body.organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    // Default parameters
    const topic = body.topic || selectRandomTopic();
    const marks = body.marks || selectRandomMarks();
    const studentLevel = body.studentLevel || 'intermediate';

    console.log(`Generating ${marks}-mark question on "${topic}" for ${studentLevel} level`);

    // Generate question using OpenAI with caching
    const questionData = await generatePracticeQuestion(topic, marks, studentLevel, body.organizationId);

    // Store question in HERA universal database
    const supabase = getAdminClient();
    const questionId = crypto.randomUUID();
    const questionCode = `AI-${topic.replace(/\s+/g, '').slice(0,6).toUpperCase()}-${marks}M-${Math.random().toString(36).substring(2,6).toUpperCase()}`;

    // Create entity record
    const { data: question, error: questionError } = await supabase
      .from('core_entities')
      .insert({
        id: questionId,
        organization_id: body.organizationId,
        entity_type: 'exam_question',
        entity_name: questionData.question,
        entity_code: questionCode,
        is_active: true
      })
      .select()
      .single();

    if (questionError) {
      console.error('Error storing question:', questionError);
      return NextResponse.json(
        { error: 'Failed to store generated question' },
        { status: 500 }
      );
    }

    // Store question metadata
    const dynamicFields = [
      {
        entity_id: questionId,
        field_name: 'marks_available',
        field_value: String(questionData.marks),
        field_type: 'number'
      },
      {
        entity_id: questionId,
        field_name: 'topic_area',
        field_value: topic,
        field_type: 'text'
      },
      {
        entity_id: questionId,
        field_name: 'command_words',
        field_value: questionData.commandWords,
        field_type: 'text'
      },
      {
        entity_id: questionId,
        field_name: 'difficulty_level',
        field_value: questionData.difficulty,
        field_type: 'text'
      },
      {
        entity_id: questionId,
        field_name: 'time_allocation_minutes',
        field_value: String(questionData.timeMinutes),
        field_type: 'number'
      },
      {
        entity_id: questionId,
        field_name: 'mark_scheme_points',
        field_value: JSON.stringify(questionData.markScheme),
        field_type: 'text'
      },
      {
        entity_id: questionId,
        field_name: 'model_answer',
        field_value: questionData.modelAnswer,
        field_type: 'text'
      },
      {
        entity_id: questionId,
        field_name: 'ai_generated',
        field_value: 'true',
        field_type: 'text'
      },
      {
        entity_id: questionId,
        field_name: 'generation_timestamp',
        field_value: new Date().toISOString(),
        field_type: 'text'
      }
    ];

    await supabase.from('core_dynamic_data').insert(dynamicFields);

    // Log generation transaction
    await supabase.from('universal_transactions').insert({
      organization_id: body.organizationId,
      transaction_type: 'ai_question_generation',
      transaction_subtype: 'openai_generation',
      transaction_number: questionCode,
      transaction_date: new Date().toISOString(),
      total_amount: questionData.marks,
      currency: 'MARKS',
      transaction_status: 'completed',
      is_financial: false,
      transaction_data: {
        question_id: questionId,
        topic,
        marks,
        student_level: studentLevel,
        ai_model: 'gpt-4',
        generation_time: new Date().toISOString()
      }
    });

    // Format response to match existing question structure
    const formattedQuestion = {
      id: questionId,
      questionText: questionData.question,
      marksAvailable: questionData.marks,
      topicArea: topic,
      commandWords: questionData.commandWords,
      difficultyLevel: questionData.difficulty,
      timeAllocationMinutes: questionData.timeMinutes,
      markScheme: questionData.markScheme,
      modelAnswer: questionData.modelAnswer,
      aiGenerated: true
    };

    return NextResponse.json({
      success: true,
      data: formattedQuestion,
      message: 'AI question generated successfully'
    });

  } catch (error) {
    console.error('Error generating AI question:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate AI question',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/education/ai/generate-question - Get available topics
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: {
        syllabus: EDEXCEL_BUSINESS_SYLLABUS,
        availableMarks: [2, 4, 6, 10, 16],
        studentLevels: ['basic', 'intermediate', 'advanced'],
        supportedCommands: {
          2: ['State', 'Give', 'Identify'],
          4: ['Explain'],
          6: ['Explain', 'Analyse'],
          10: ['Analyse'],
          16: ['Evaluate', 'Assess', 'To what extent']
        }
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get AI generation info' },
      { status: 500 }
    );
  }
}

// Helper functions
function selectRandomTopic(): string {
  const themes = Object.values(EDEXCEL_BUSINESS_SYLLABUS);
  const randomTheme = themes[Math.floor(Math.random() * themes.length)];
  const topics = Object.values(randomTheme.topics);
  return topics[Math.floor(Math.random() * topics.length)];
}

function selectRandomMarks(): number {
  const markOptions = [2, 4, 6, 10, 16];
  return markOptions[Math.floor(Math.random() * markOptions.length)];
}