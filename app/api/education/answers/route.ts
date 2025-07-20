/**
 * HERA Universal - Answer Submission API Routes
 * 
 * Handles student answer submissions with AI-powered evaluation
 * Provides instant feedback and technique analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

interface AnswerSubmission {
  studentId: string;
  questionId: string;
  answerText: string;
  timeTakenMinutes: number;
  organizationId: string;
}

// Advanced AI evaluation function (simulated)
function evaluateAnswer(
  answerText: string, 
  questionData: any, 
  markScheme: string[], 
  timeTaken: number
): any {
  const wordsCount = answerText.split(/\s+/).length;
  const marksAvailable = questionData.marksAvailable;
  const recommendedTime = Math.ceil(marksAvailable * 1.5);
  
  // Simulate AI scoring based on various factors
  let estimatedMarks = 0;
  let feedback = {
    strengths: [] as string[],
    improvements: [] as string[],
    technique_score: 0,
    structure_score: 0,
    terminology_score: 0,
    time_efficiency: '',
    confidence: 0
  };

  // Length analysis
  const expectedWords = marksAvailable * 40; // Roughly 40 words per mark
  const lengthRatio = wordsCount / expectedWords;
  
  if (lengthRatio > 0.8 && lengthRatio < 1.5) {
    feedback.strengths.push('Good answer length for the marks available');
    estimatedMarks += marksAvailable * 0.2;
  } else if (lengthRatio < 0.5) {
    feedback.improvements.push('Answer too brief - expand your explanations');
  } else {
    feedback.improvements.push('Answer may be too lengthy - focus on key points');
  }

  // Structure analysis (simulated by looking for key words)
  const structureIndicators = ['firstly', 'secondly', 'however', 'therefore', 'in conclusion', 'for example'];
  const structureScore = structureIndicators.filter(indicator => 
    answerText.toLowerCase().includes(indicator)
  ).length;
  
  feedback.structure_score = Math.min(10, structureScore * 2);
  
  if (structureScore > 2) {
    feedback.strengths.push('Good use of structure words');
    estimatedMarks += marksAvailable * 0.15;
  } else {
    feedback.improvements.push('Use more structure words (firstly, however, therefore)');
  }

  // Business terminology analysis
  const businessTerms = [
    'profit', 'revenue', 'market share', 'competitive advantage', 'stakeholders',
    'cash flow', 'brand', 'marketing mix', 'supply chain', 'economies of scale',
    'break-even', 'roi', 'productivity', 'efficiency', 'innovation'
  ];
  
  const terminologyCount = businessTerms.filter(term => 
    answerText.toLowerCase().includes(term)
  ).length;
  
  feedback.terminology_score = Math.min(10, terminologyCount * 1.5);
  
  if (terminologyCount >= 3) {
    feedback.strengths.push('Excellent use of business terminology');
    estimatedMarks += marksAvailable * 0.2;
  } else if (terminologyCount >= 1) {
    feedback.strengths.push('Good use of business terminology');
    estimatedMarks += marksAvailable * 0.1;
  } else {
    feedback.improvements.push('Include more specific business terminology');
  }

  // Command word analysis
  const commandWord = questionData.commandWords.toLowerCase();
  let commandWordScore = 0;
  
  if (commandWord.includes('evaluate') || commandWord.includes('assess')) {
    const evaluationWords = ['advantage', 'disadvantage', 'benefit', 'drawback', 'positive', 'negative'];
    commandWordScore = evaluationWords.filter(word => 
      answerText.toLowerCase().includes(word)
    ).length;
    
    if (commandWordScore >= 2) {
      feedback.strengths.push('Good evaluation showing both sides');
      estimatedMarks += marksAvailable * 0.25;
    } else {
      feedback.improvements.push('For evaluation questions, discuss both advantages and disadvantages');
    }
  } else if (commandWord.includes('explain') || commandWord.includes('describe')) {
    if (answerText.includes('because') || answerText.includes('due to') || answerText.includes('leads to')) {
      feedback.strengths.push('Good explanations with reasoning');
      estimatedMarks += marksAvailable * 0.2;
    } else {
      feedback.improvements.push('Use more explanatory language (because, due to, leads to)');
    }
  }

  // Time efficiency analysis
  const timeEfficiency = (recommendedTime / timeTaken) * 100;
  
  if (timeEfficiency >= 80 && timeEfficiency <= 120) {
    feedback.time_efficiency = 'Excellent time management';
    feedback.strengths.push('Good timing for this question type');
  } else if (timeEfficiency < 80) {
    feedback.time_efficiency = 'Too slow - practice for speed';
    feedback.improvements.push('Work on answering more quickly');
  } else {
    feedback.time_efficiency = 'Very fast - check for completeness';
    feedback.improvements.push('Take more time to develop your points');
  }

  // Final calculations
  estimatedMarks = Math.min(marksAvailable, Math.max(0, estimatedMarks));
  feedback.technique_score = Math.round(((estimatedMarks / marksAvailable) * 10));
  feedback.confidence = Math.min(95, 60 + (feedback.strengths.length * 8));

  // Add mark-specific advice
  if (marksAvailable <= 2) {
    feedback.improvements.push('For low-mark questions, be concise and factual');
  } else if (marksAvailable >= 8) {
    if (!answerText.toLowerCase().includes('however') && !answerText.toLowerCase().includes('on the other hand')) {
      feedback.improvements.push('For high-mark questions, show analysis and evaluation');
    }
  }

  return {
    estimated_marks: Math.round(estimatedMarks),
    ai_feedback: feedback
  };
}

// GET /api/education/answers
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const studentId = searchParams.get('studentId');
    const questionId = searchParams.get('questionId');
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    // Get answer submissions from universal_transactions
    let query = supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('transaction_type', 'answer_submission')
      .order('created_at', { ascending: false });

    if (studentId) {
      query = query.eq('transaction_data->>student_id', studentId);
    }
    if (questionId) {
      query = query.eq('transaction_data->>question_id', questionId);
    }

    const { data: answers, error } = await query;

    if (error) {
      console.error('Error fetching answers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch answers' },
        { status: 500 }
      );
    }

    // Transform for response
    const enrichedAnswers = (answers || []).map(answer => ({
      id: answer.id,
      studentId: answer.transaction_data?.student_id,
      questionId: answer.transaction_data?.question_id,
      answerText: answer.transaction_data?.answer_text,
      timeTakenMinutes: answer.transaction_data?.time_taken_minutes,
      estimatedMarks: answer.transaction_data?.estimated_marks,
      maxMarks: answer.transaction_data?.max_marks,
      aiFeedback: answer.transaction_data?.ai_feedback,
      submittedAt: answer.created_at,
      humanReviewed: answer.transaction_data?.human_reviewed || false
    }));

    return NextResponse.json({
      data: enrichedAnswers,
      summary: {
        total: enrichedAnswers.length,
        averageScore: enrichedAnswers.length > 0 ? 
          enrichedAnswers.reduce((sum, a) => sum + (a.estimatedMarks / a.maxMarks * 100), 0) / enrichedAnswers.length : 0
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

// POST /api/education/answers
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body: AnswerSubmission = await request.json();

    // Validate request
    if (!body.organizationId || !body.studentId || !body.questionId || !body.answerText) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get question details for evaluation
    const { data: question, error: questionError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('id', body.questionId)
      .eq('entity_type', 'exam_question')
      .single();

    if (questionError || !question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Get question dynamic data
    const { data: questionDynamicData } = await supabase
      .from('core_dynamic_data')
      .select('field_name, field_value')
      .eq('entity_id', body.questionId);

    const questionData = (questionDynamicData || []).reduce((acc, item) => {
      acc[item.field_name] = item.field_value;
      return acc;
    }, {} as Record<string, any>);

    const enrichedQuestionData = {
      questionText: question.entity_name,
      marksAvailable: parseInt(questionData.marks_available || '0'),
      topicArea: questionData.topic_area || '',
      commandWords: questionData.command_words || '',
      difficultyLevel: questionData.difficulty_level || 'intermediate',
      markSchemePoints: JSON.parse(questionData.mark_scheme_points || '[]')
    };

    // Perform AI evaluation
    const evaluation = evaluateAnswer(
      body.answerText,
      enrichedQuestionData,
      enrichedQuestionData.markSchemePoints,
      body.timeTakenMinutes
    );

    // Generate submission number
    const submissionNumber = `ANS-${Date.now()}-${Math.random().toString(36).substring(2,6).toUpperCase()}`;

    // Store answer as transaction
    const { data: answerTransaction, error: answerError } = await supabase
      .from('universal_transactions')
      .insert({
        organization_id: body.organizationId,
        transaction_type: 'answer_submission',
        transaction_subtype: 'practice_answer',
        transaction_number: submissionNumber,
        transaction_date: new Date().toISOString(),
        total_amount: evaluation.estimated_marks,
        currency: 'MARKS',
        transaction_status: 'completed',
        is_financial: false,
        transaction_data: {
          student_id: body.studentId,
          question_id: body.questionId,
          answer_text: body.answerText,
          time_taken_minutes: body.timeTakenMinutes,
          estimated_marks: evaluation.estimated_marks,
          max_marks: enrichedQuestionData.marksAvailable,
          ai_feedback: evaluation.ai_feedback,
          topic_area: enrichedQuestionData.topicArea,
          command_word: enrichedQuestionData.commandWords.split(' ')[0], // First command word
          difficulty_level: enrichedQuestionData.difficultyLevel,
          human_reviewed: false,
          submission_timestamp: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (answerError) {
      console.error('Error storing answer:', answerError);
      return NextResponse.json(
        { error: 'Failed to store answer' },
        { status: 500 }
      );
    }

    // Update student progress
    const progressIncrement = (evaluation.estimated_marks / enrichedQuestionData.marksAvailable) * 2; // Max 2 points per question
    
    await supabase
      .from('core_dynamic_data')
      .upsert({
        entity_id: body.studentId,
        field_name: 'current_progress',
        field_value: String(progressIncrement), // In real app, would fetch current and add
        field_type: 'number'
      });

    return NextResponse.json({
      success: true,
      data: {
        submissionId: answerTransaction.id,
        estimatedMarks: evaluation.estimated_marks,
        maxMarks: enrichedQuestionData.marksAvailable,
        percentage: Math.round((evaluation.estimated_marks / enrichedQuestionData.marksAvailable) * 100),
        aiFeedback: evaluation.ai_feedback
      },
      message: 'Answer evaluated successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Internal server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}