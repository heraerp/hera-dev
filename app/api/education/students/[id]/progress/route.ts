/**
 * HERA Universal - Student Progress API
 * 
 * Analyzes and returns comprehensive student progress metrics
 * Uses AI-powered insights from study session data
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

// GET /api/education/students/[id]/progress
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getAdminClient();
    const { id: studentId } = await params;

    // Get student entity
    const { data: student, error: studentError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('id', studentId)
      .eq('entity_type', 'student')
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Get student dynamic data
    const { data: dynamicData } = await supabase
      .from('core_dynamic_data')
      .select('field_name, field_value')
      .eq('entity_id', studentId);

    const studentData = (dynamicData || []).reduce((acc, item) => {
      acc[item.field_name] = item.field_value;
      return acc;
    }, {} as Record<string, any>);

    // Get all study sessions
    const { data: sessions } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', student.organization_id)
      .eq('transaction_type', 'study_session')
      .eq('transaction_data->>student_id', studentId)
      .order('created_at', { ascending: true });

    // Get all answers submitted
    const { data: answers } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', student.organization_id)
      .eq('transaction_type', 'answer_submission')
      .eq('transaction_data->>student_id', studentId)
      .order('created_at', { ascending: true });

    // Calculate metrics
    const totalStudyHours = sessions?.reduce((total, session) => {
      return total + (session.transaction_data?.duration_minutes || 0) / 60;
    }, 0) || 0;

    const questionsAttempted = answers?.length || 0;

    const averageScore = answers?.reduce((total, answer) => {
      const score = answer.transaction_data?.estimated_marks || 0;
      const maxMarks = answer.transaction_data?.max_marks || 1;
      return total + (score / maxMarks) * 100;
    }, 0) / (answers?.length || 1) || 0;

    // Analyze exam technique by command word performance
    const commandWordPerformance: Record<string, { attempts: number; averageScore: number }> = {};
    
    answers?.forEach(answer => {
      const commandWord = answer.transaction_data?.command_word;
      if (commandWord) {
        if (!commandWordPerformance[commandWord]) {
          commandWordPerformance[commandWord] = { attempts: 0, averageScore: 0 };
        }
        commandWordPerformance[commandWord].attempts++;
        const score = (answer.transaction_data?.estimated_marks || 0) / (answer.transaction_data?.max_marks || 1) * 100;
        commandWordPerformance[commandWord].averageScore = 
          (commandWordPerformance[commandWord].averageScore * (commandWordPerformance[commandWord].attempts - 1) + score) / 
          commandWordPerformance[commandWord].attempts;
      }
    });

    // Calculate time management efficiency
    const timeEfficiency = answers?.reduce((total, answer) => {
      const actualTime = answer.transaction_data?.time_taken_minutes || 0;
      const recommendedTime = answer.transaction_data?.recommended_time_minutes || actualTime;
      return total + Math.min(100, (recommendedTime / actualTime) * 100);
    }, 0) / (answers?.length || 1) || 0;

    // Topic performance analysis
    const topicPerformance: Record<string, number> = {};
    answers?.forEach(answer => {
      const topic = answer.transaction_data?.topic_area;
      if (topic) {
        if (!topicPerformance[topic]) {
          topicPerformance[topic] = 0;
        }
        const score = (answer.transaction_data?.estimated_marks || 0) / (answer.transaction_data?.max_marks || 1) * 100;
        topicPerformance[topic] = (topicPerformance[topic] + score) / 2;
      }
    });

    // Calculate exam readiness score (0-100)
    const examReadinessScore = calculateExamReadiness({
      averageScore,
      timeEfficiency,
      questionsAttempted,
      commandWordPerformance,
      totalStudyHours
    });

    // Generate recommendations
    const recommendations = generateRecommendations({
      averageScore,
      timeEfficiency,
      commandWordPerformance,
      topicPerformance,
      questionsAttempted
    });

    // Identify focus areas
    const nextFocusAreas = identifyFocusAreas({
      topicPerformance,
      commandWordPerformance,
      recentAnswers: answers?.slice(-10) || []
    });

    const progressResponse = {
      student: {
        id: student.id,
        name: student.entity_name,
        targetExam: studentData.target_exam || 'Not specified',
        currentProgress: parseFloat(studentData.current_progress || '0')
      },
      totalStudyHours: Math.round(totalStudyHours * 10) / 10,
      questionsAttempted,
      averageComprehension: Math.round(averageScore),
      examReadinessScore: Math.round(examReadinessScore),
      techniqueAnalysis: {
        timeManagement: Math.round(timeEfficiency),
        commandWordRecognition: calculateCommandWordScore(commandWordPerformance),
        answerStructure: calculateStructureScore(answers || []),
        businessTerminology: calculateTerminologyScore(answers || [])
      },
      recommendations,
      nextFocusAreas,
      detailedMetrics: {
        commandWordPerformance,
        topicPerformance,
        recentProgress: calculateRecentProgress(answers?.slice(-20) || [])
      }
    };

    return NextResponse.json({ data: progressResponse });

  } catch (error) {
    console.error('Internal server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions for calculations
function calculateExamReadiness(metrics: any): number {
  const weights = {
    averageScore: 0.30,
    timeEfficiency: 0.25,
    practiceVolume: 0.20,
    commandWordMastery: 0.15,
    consistency: 0.10
  };

  const practiceScore = Math.min(100, (metrics.questionsAttempted / 50) * 100);
  const commandWordScore = calculateCommandWordScore(metrics.commandWordPerformance);
  const consistencyScore = metrics.totalStudyHours > 10 ? 80 : metrics.totalStudyHours * 8;

  return (
    metrics.averageScore * weights.averageScore +
    metrics.timeEfficiency * weights.timeEfficiency +
    practiceScore * weights.practiceVolume +
    commandWordScore * weights.commandWordMastery +
    consistencyScore * weights.consistency
  );
}

function calculateCommandWordScore(performance: Record<string, any>): number {
  const scores = Object.values(performance).map(p => p.averageScore);
  return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
}

function calculateStructureScore(answers: any[]): number {
  // Analyze answer structure quality based on AI feedback
  let totalScore = 0;
  let count = 0;

  answers.forEach(answer => {
    const feedback = answer.transaction_data?.ai_feedback;
    if (feedback?.structure_score) {
      totalScore += feedback.structure_score;
      count++;
    }
  });

  return count > 0 ? Math.round(totalScore / count) : 50;
}

function calculateTerminologyScore(answers: any[]): number {
  // Analyze business terminology usage
  let totalScore = 0;
  let count = 0;

  answers.forEach(answer => {
    const feedback = answer.transaction_data?.ai_feedback;
    if (feedback?.terminology_score) {
      totalScore += feedback.terminology_score;
      count++;
    }
  });

  return count > 0 ? Math.round(totalScore / count) : 50;
}

function generateRecommendations(metrics: any): string[] {
  const recommendations = [];

  if (metrics.averageScore < 60) {
    recommendations.push('Focus on understanding core concepts before attempting harder questions');
  }

  if (metrics.timeEfficiency < 70) {
    recommendations.push('Practice time management - aim for 1.5 minutes per mark');
  }

  if (metrics.questionsAttempted < 20) {
    recommendations.push('Increase practice frequency - aim for at least 5 questions per study session');
  }

  // Command word specific recommendations
  Object.entries(metrics.commandWordPerformance).forEach(([word, perf]: [string, any]) => {
    if (perf.averageScore < 50) {
      recommendations.push(`Review "${word}" questions - practice the specific technique required`);
    }
  });

  // Topic specific recommendations
  Object.entries(metrics.topicPerformance).forEach(([topic, score]: [string, any]) => {
    if (score < 60) {
      recommendations.push(`Strengthen understanding of ${topic}`);
    }
  });

  return recommendations.slice(0, 5); // Top 5 recommendations
}

function identifyFocusAreas(data: any): string[] {
  const areas = [];

  // Identify weak topics
  Object.entries(data.topicPerformance).forEach(([topic, score]: [string, any]) => {
    if (score < 70) {
      areas.push(topic);
    }
  });

  // Identify weak command words
  Object.entries(data.commandWordPerformance).forEach(([word, perf]: [string, any]) => {
    if (perf.averageScore < 70) {
      areas.push(`${word} questions`);
    }
  });

  return areas.slice(0, 3); // Top 3 focus areas
}

function calculateRecentProgress(recentAnswers: any[]): any {
  if (recentAnswers.length < 2) return { trend: 'insufficient_data' };

  const firstHalf = recentAnswers.slice(0, Math.floor(recentAnswers.length / 2));
  const secondHalf = recentAnswers.slice(Math.floor(recentAnswers.length / 2));

  const firstAvg = firstHalf.reduce((sum, a) => {
    return sum + (a.transaction_data?.estimated_marks || 0) / (a.transaction_data?.max_marks || 1) * 100;
  }, 0) / firstHalf.length;

  const secondAvg = secondHalf.reduce((sum, a) => {
    return sum + (a.transaction_data?.estimated_marks || 0) / (a.transaction_data?.max_marks || 1) * 100;
  }, 0) / secondHalf.length;

  return {
    trend: secondAvg > firstAvg ? 'improving' : secondAvg < firstAvg ? 'declining' : 'stable',
    percentageChange: Math.round(((secondAvg - firstAvg) / firstAvg) * 100)
  };
}