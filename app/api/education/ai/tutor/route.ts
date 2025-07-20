/**
 * HERA Education - AI Tutoring API
 * 
 * Provides personalized AI tutoring based on student performance
 * and Edexcel Business A-Level syllabus
 */

import { NextRequest, NextResponse } from 'next/server';
import { provideTutoring, explainTopic } from '@/lib/openai';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

interface TutoringRequest {
  studentId: string;
  organizationId: string;
  topic: string;
  type: 'explanation' | 'tutoring' | 'help';
  specificQuestions?: string[];
}

// POST /api/education/ai/tutor
export async function POST(request: NextRequest) {
  try {
    const body: TutoringRequest = await request.json();

    if (!body.studentId || !body.organizationId || !body.topic) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    // Get student data and performance history
    const { data: student } = await supabase
      .from('core_entities')
      .select('*')
      .eq('id', body.studentId)
      .eq('entity_type', 'student')
      .single();

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Get student's recent answers to analyze performance
    const { data: recentAnswers } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', body.organizationId)
      .eq('transaction_type', 'answer_submission')
      .eq('transaction_data->>student_id', body.studentId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Analyze performance and identify weaknesses
    const performance = analyzeStudentPerformance(recentAnswers || []);
    const weaknesses = identifyWeaknesses(recentAnswers || [], body.topic);

    // Get student learning style
    const { data: studentData } = await supabase
      .from('core_dynamic_data')
      .select('field_name, field_value')
      .eq('entity_id', body.studentId);

    const learningStyle = studentData?.find(d => d.field_name === 'learning_style')?.field_value || 'visual';

    let tutorResponse: string;

    if (body.type === 'explanation') {
      // Provide topic explanation with caching
      tutorResponse = await explainTopic(
        body.topic,
        performance.level,
        body.specificQuestions,
        body.organizationId
      );
    } else {
      // Provide personalized tutoring with caching
      tutorResponse = await provideTutoring(
        body.topic,
        performance,
        weaknesses,
        learningStyle,
        body.organizationId
      );
    }

    // Store tutoring session
    const sessionId = crypto.randomUUID();
    await supabase.from('universal_transactions').insert({
      organization_id: body.organizationId,
      transaction_type: 'ai_tutoring_session',
      transaction_subtype: body.type,
      transaction_number: `TUTOR-${sessionId.slice(0,8)}`,
      transaction_date: new Date().toISOString(),
      total_amount: 0,
      currency: 'USD',
      transaction_status: 'completed',
      is_financial: false,
      transaction_data: {
        session_id: sessionId,
        student_id: body.studentId,
        topic: body.topic,
        tutoring_type: body.type,
        student_performance: performance,
        weaknesses_addressed: weaknesses,
        learning_style: learningStyle,
        ai_model: 'gpt-4',
        session_duration: 'instant',
        timestamp: new Date().toISOString()
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        tutorResponse,
        studentPerformance: performance,
        weaknessesIdentified: weaknesses,
        recommendedActions: generateRecommendations(performance, weaknesses),
        sessionId
      },
      message: 'AI tutoring session completed'
    });

  } catch (error) {
    console.error('Error in AI tutoring:', error);
    return NextResponse.json(
      { 
        error: 'Failed to provide AI tutoring',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper functions
function analyzeStudentPerformance(answers: any[]): any {
  if (answers.length === 0) {
    return {
      level: 'beginner',
      averageScore: 0,
      totalAttempts: 0,
      topicPerformance: {},
      timeManagement: 'unknown',
      confidence: 'building'
    };
  }

  const totalScore = answers.reduce((sum, answer) => {
    const marks = answer.transaction_data?.estimated_marks || 0;
    const maxMarks = answer.transaction_data?.max_marks || 1;
    return sum + (marks / maxMarks * 100);
  }, 0);

  const averageScore = totalScore / answers.length;

  // Analyze by topic
  const topicPerformance: Record<string, number[]> = {};
  answers.forEach(answer => {
    const topic = answer.transaction_data?.topic_area;
    const score = (answer.transaction_data?.estimated_marks || 0) / (answer.transaction_data?.max_marks || 1) * 100;
    if (topic) {
      if (!topicPerformance[topic]) topicPerformance[topic] = [];
      topicPerformance[topic].push(score);
    }
  });

  // Calculate average per topic
  const topicAverages: Record<string, number> = {};
  Object.entries(topicPerformance).forEach(([topic, scores]) => {
    topicAverages[topic] = scores.reduce((a, b) => a + b, 0) / scores.length;
  });

  // Determine level
  let level = 'beginner';
  if (averageScore >= 70) level = 'advanced';
  else if (averageScore >= 50) level = 'intermediate';

  return {
    level,
    averageScore: Math.round(averageScore),
    totalAttempts: answers.length,
    topicPerformance: topicAverages,
    timeManagement: averageScore >= 60 ? 'good' : 'needs_improvement',
    confidence: averageScore >= 60 ? 'growing' : 'building',
    recentTrend: calculateTrend(answers.slice(-5))
  };
}

function identifyWeaknesses(answers: any[], currentTopic: string): string[] {
  const weaknesses: string[] = [];

  if (answers.length === 0) {
    return ['Limited practice data available'];
  }

  // Analyze common patterns
  const averageScore = answers.reduce((sum, answer) => {
    const marks = answer.transaction_data?.estimated_marks || 0;
    const maxMarks = answer.transaction_data?.max_marks || 1;
    return sum + (marks / maxMarks * 100);
  }, 0) / answers.length;

  if (averageScore < 40) {
    weaknesses.push('Basic understanding needs strengthening');
  } else if (averageScore < 60) {
    weaknesses.push('Application of knowledge to business context');
  }

  // Check for specific command word issues
  const commandWordPerformance: Record<string, number[]> = {};
  answers.forEach(answer => {
    const command = answer.transaction_data?.command_word;
    const score = (answer.transaction_data?.estimated_marks || 0) / (answer.transaction_data?.max_marks || 1) * 100;
    if (command) {
      if (!commandWordPerformance[command]) commandWordPerformance[command] = [];
      commandWordPerformance[command].push(score);
    }
  });

  Object.entries(commandWordPerformance).forEach(([command, scores]) => {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avg < 50) {
      weaknesses.push(`${command} question technique`);
    }
  });

  // Time management analysis
  const timingIssues = answers.filter(answer => {
    const timeTaken = answer.transaction_data?.time_taken_minutes || 0;
    const recommended = answer.transaction_data?.recommended_time_minutes || timeTaken;
    return timeTaken > recommended * 1.5;
  });

  if (timingIssues.length > answers.length * 0.3) {
    weaknesses.push('Time management in exams');
  }

  return weaknesses.slice(0, 3); // Return top 3 weaknesses
}

function calculateTrend(recentAnswers: any[]): string {
  if (recentAnswers.length < 2) return 'insufficient_data';

  const firstHalf = recentAnswers.slice(0, Math.ceil(recentAnswers.length / 2));
  const secondHalf = recentAnswers.slice(Math.ceil(recentAnswers.length / 2));

  const firstAvg = firstHalf.reduce((sum, answer) => {
    return sum + (answer.transaction_data?.estimated_marks || 0) / (answer.transaction_data?.max_marks || 1) * 100;
  }, 0) / firstHalf.length;

  const secondAvg = secondHalf.reduce((sum, answer) => {
    return sum + (answer.transaction_data?.estimated_marks || 0) / (answer.transaction_data?.max_marks || 1) * 100;
  }, 0) / secondHalf.length;

  if (secondAvg > firstAvg + 5) return 'improving';
  if (secondAvg < firstAvg - 5) return 'declining';
  return 'stable';
}

function generateRecommendations(performance: any, weaknesses: string[]): string[] {
  const recommendations: string[] = [];

  if (performance.averageScore < 50) {
    recommendations.push('Focus on understanding core concepts before attempting harder questions');
    recommendations.push('Practice more basic knowledge questions to build confidence');
  }

  if (weaknesses.includes('Time management in exams')) {
    recommendations.push('Practice timed questions regularly - aim for 1.5 minutes per mark');
  }

  if (weaknesses.some(w => w.includes('question technique'))) {
    recommendations.push('Review command word requirements and practice specific question types');
  }

  if (performance.recentTrend === 'declining') {
    recommendations.push('Take a break and revisit fundamentals - you may be experiencing fatigue');
  }

  recommendations.push('Continue regular practice to maintain momentum');

  return recommendations.slice(0, 4);
}