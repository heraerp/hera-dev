/**
 * HERA Universal - Practice Questions API
 * 
 * Intelligently selects practice questions based on student progress
 * Uses AI to recommend questions that target weak areas
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

// GET /api/education/questions/practice
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const organizationId = searchParams.get('organizationId');
    const difficulty = searchParams.get('difficulty');
    const targetMarks = searchParams.get('targetMarks'); // e.g., "2,6,12"
    const topicArea = searchParams.get('topicArea');
    const count = parseInt(searchParams.get('count') || '5');
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    // If studentId provided, analyze their performance first
    let weakAreas: { topics: string[], commandWords: string[] } = { topics: [], commandWords: [] };
    let attemptedQuestionIds: string[] = [];
    
    if (studentId) {
      // Get student's answer history
      const { data: answers } = await supabase
        .from('universal_transactions')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('transaction_type', 'answer_submission')
        .eq('transaction_data->>student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(50);

      // Track attempted questions
      attemptedQuestionIds = answers?.map(a => a.transaction_data?.question_id).filter(Boolean) || [];

      // Analyze performance by topic and command word
      const topicScores: Record<string, { total: number, count: number }> = {};
      const commandWordScores: Record<string, { total: number, count: number }> = {};

      answers?.forEach(answer => {
        const data = answer.transaction_data;
        if (data) {
          const score = (data.estimated_marks || 0) / (data.max_marks || 1) * 100;
          
          // Track topic performance
          if (data.topic_area) {
            if (!topicScores[data.topic_area]) {
              topicScores[data.topic_area] = { total: 0, count: 0 };
            }
            topicScores[data.topic_area].total += score;
            topicScores[data.topic_area].count += 1;
          }

          // Track command word performance
          if (data.command_word) {
            if (!commandWordScores[data.command_word]) {
              commandWordScores[data.command_word] = { total: 0, count: 0 };
            }
            commandWordScores[data.command_word].total += score;
            commandWordScores[data.command_word].count += 1;
          }
        }
      });

      // Identify weak areas (below 60% average)
      Object.entries(topicScores).forEach(([topic, scores]) => {
        const average = scores.total / scores.count;
        if (average < 60) {
          weakAreas.topics.push(topic);
        }
      });

      Object.entries(commandWordScores).forEach(([word, scores]) => {
        const average = scores.total / scores.count;
        if (average < 60) {
          weakAreas.commandWords.push(word);
        }
      });
    }

    // Build query for questions
    let query = supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'exam_question')
      .eq('is_active', true);

    // Exclude already attempted questions if student provided
    if (attemptedQuestionIds.length > 0) {
      query = query.not('id', 'in', `(${attemptedQuestionIds.join(',')})`);
    }

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

    // Group dynamic data by entity_id
    const dynamicDataMap = dynamicData.reduce((acc, item) => {
      if (!acc[item.entity_id]) {
        acc[item.entity_id] = {};
      }
      acc[item.entity_id][item.field_name] = item.field_value;
      return acc;
    }, {} as Record<string, Record<string, any>>);

    // Enrich and score questions
    let enrichedQuestions = (questions || []).map(question => {
      const marks = parseInt(dynamicDataMap[question.id]?.marks_available || '0');
      const topic = dynamicDataMap[question.id]?.topic_area || '';
      const commandWord = dynamicDataMap[question.id]?.command_words || '';
      const difficultyLevel = dynamicDataMap[question.id]?.difficulty_level || 'intermediate';
      
      // Calculate relevance score for intelligent selection
      let relevanceScore = 50; // Base score
      
      // Boost score if question targets weak areas
      if (weakAreas.topics.includes(topic)) relevanceScore += 30;
      if (weakAreas.commandWords.some(w => commandWord.includes(w))) relevanceScore += 20;
      
      // Adjust for difficulty preference
      if (difficulty) {
        if (difficultyLevel === difficulty) relevanceScore += 10;
      }
      
      // Adjust for target marks
      if (targetMarks) {
        const targets = targetMarks.split(',').map(m => parseInt(m));
        if (targets.includes(marks)) relevanceScore += 25;
      }
      
      // Adjust for topic preference
      if (topicArea && topic === topicArea) relevanceScore += 15;
      
      return {
        id: question.id,
        questionText: question.entity_name,
        marksAvailable: marks,
        topicArea: topic,
        difficultyLevel,
        commandWords: commandWord,
        relevanceScore,
        timeAllocationMinutes: Math.ceil(marks * 1.5),
        isWeakArea: weakAreas.topics.includes(topic) || 
                    weakAreas.commandWords.some(w => commandWord.includes(w))
      };
    });

    // Filter by criteria
    if (difficulty) {
      enrichedQuestions = enrichedQuestions.filter(q => q.difficultyLevel === difficulty);
    }
    
    if (targetMarks) {
      const targets = targetMarks.split(',').map(m => parseInt(m));
      enrichedQuestions = enrichedQuestions.filter(q => targets.includes(q.marksAvailable));
    }
    
    if (topicArea) {
      enrichedQuestions = enrichedQuestions.filter(q => q.topicArea === topicArea);
    }

    // Sort by relevance score and select top N
    enrichedQuestions.sort((a, b) => b.relevanceScore - a.relevanceScore);
    const selectedQuestions = enrichedQuestions.slice(0, count);

    // If not enough questions after filtering, add some random ones
    if (selectedQuestions.length < count) {
      const remaining = enrichedQuestions
        .slice(count)
        .sort(() => Math.random() - 0.5)
        .slice(0, count - selectedQuestions.length);
      selectedQuestions.push(...remaining);
    }

    // Calculate practice session metadata
    const totalMarks = selectedQuestions.reduce((sum, q) => sum + q.marksAvailable, 0);
    const estimatedTime = selectedQuestions.reduce((sum, q) => sum + q.timeAllocationMinutes, 0);

    return NextResponse.json({
      data: selectedQuestions,
      summary: {
        count: selectedQuestions.length,
        totalMarks,
        estimatedTimeMinutes: estimatedTime,
        weakAreasTargeted: {
          topics: selectedQuestions.filter(q => weakAreas.topics.includes(q.topicArea)).length,
          commandWords: selectedQuestions.filter(q => 
            weakAreas.commandWords.some(w => q.commandWords.includes(w))
          ).length
        }
      },
      recommendations: generatePracticeRecommendations(selectedQuestions, weakAreas)
    });

  } catch (error) {
    console.error('Internal server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generatePracticeRecommendations(questions: any[], weakAreas: any): string[] {
  const recommendations = [];
  
  if (weakAreas.topics.length > 0) {
    recommendations.push(`Focus on weak topics: ${weakAreas.topics.slice(0, 3).join(', ')}`);
  }
  
  if (weakAreas.commandWords.length > 0) {
    recommendations.push(`Practice "${weakAreas.commandWords[0]}" questions - review the technique`);
  }
  
  const totalTime = questions.reduce((sum, q) => sum + q.timeAllocationMinutes, 0);
  recommendations.push(`Allocate ${totalTime} minutes for this practice session`);
  
  const marksDistribution = questions.reduce((acc, q) => {
    const range = q.marksAvailable <= 2 ? '1-2 marks' :
                  q.marksAvailable <= 6 ? '3-6 marks' :
                  q.marksAvailable <= 12 ? '8-12 marks' : '16+ marks';
    acc[range] = (acc[range] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostCommonRange = Object.entries(marksDistribution)
    .sort(([,a], [,b]) => b - a)[0];
  
  if (mostCommonRange) {
    recommendations.push(`This session focuses on ${mostCommonRange[0]} questions`);
  }
  
  return recommendations;
}