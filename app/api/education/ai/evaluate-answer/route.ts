/**
 * HERA Universal - AI Answer Evaluation API
 * 
 * Advanced AI evaluation endpoint using OpenAI for detailed answer analysis
 * Provides technique-specific feedback for exam preparation
 */

import { NextRequest, NextResponse } from 'next/server';
import { evaluateAnswer } from '@/lib/openai';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

interface EvaluationRequest {
  answerText: string;
  questionId: string;
  organizationId: string;
  evaluationType?: 'standard' | 'detailed' | 'technique_focused';
}

// Advanced technique analysis patterns
const TechniquePatterns = {
  'evaluate': {
    required: ['advantage', 'disadvantage', 'benefit', 'drawback', 'positive', 'negative', 'however', 'on balance'],
    structure: 'Introduction → Advantages → Disadvantages → Judgment',
    scoring: (text: string) => {
      const balanceWords = ['however', 'on the other hand', 'conversely', 'in contrast'];
      const judgmentWords = ['overall', 'on balance', 'in conclusion', 'therefore'];
      
      let score = 0;
      if (balanceWords.some(word => text.toLowerCase().includes(word))) score += 3;
      if (judgmentWords.some(word => text.toLowerCase().includes(word))) score += 2;
      
      return Math.min(5, score);
    }
  },
  'analyse': {
    required: ['because', 'due to', 'leads to', 'results in', 'causes', 'therefore'],
    structure: 'Point → Explanation → Link to business impact',
    scoring: (text: string) => {
      const causalWords = ['because', 'due to', 'leads to', 'results in', 'causes'];
      const impactWords = ['impact', 'effect', 'consequence', 'result'];
      
      let score = 0;
      if (causalWords.some(word => text.toLowerCase().includes(word))) score += 3;
      if (impactWords.some(word => text.toLowerCase().includes(word))) score += 2;
      
      return Math.min(5, score);
    }
  },
  'explain': {
    required: ['because', 'this means', 'for example', 'such as'],
    structure: 'Statement → Explanation → Example',
    scoring: (text: string) => {
      const explanationWords = ['because', 'this means', 'this is because'];
      const exampleWords = ['for example', 'such as', 'for instance'];
      
      let score = 0;
      if (explanationWords.some(word => text.toLowerCase().includes(word))) score += 3;
      if (exampleWords.some(word => text.toLowerCase().includes(word))) score += 2;
      
      return Math.min(5, score);
    }
  }
};

// POST /api/education/ai/evaluate-answer
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body: EvaluationRequest = await request.json();

    // Validate request
    if (!body.answerText || !body.questionId || !body.organizationId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get question details
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

    const marksAvailable = parseInt(questionData.marks_available || '0');
    const commandWords = questionData.command_words || '';
    const topicArea = questionData.topic_area || '';
    const markScheme = JSON.parse(questionData.mark_scheme_points || '[]');

    // Perform comprehensive AI evaluation using OpenAI
    const evaluation = await evaluateAnswer(
      question.entity_name,
      body.answerText,
      marksAvailable,
      commandWords,
      5 // Default time taken - could be passed in request
    );

    // Store evaluation in metadata
    const evaluationId = crypto.randomUUID();
    await supabase
      .from('universal_transactions')
      .insert({
        organization_id: body.organizationId,
        transaction_type: 'ai_evaluation',
        transaction_subtype: body.evaluationType || 'standard',
        transaction_number: `EVAL-${evaluationId.slice(0,8)}`,
        transaction_date: new Date().toISOString(),
        total_amount: evaluation.estimated_marks,
        currency: 'MARKS',
        transaction_status: 'completed',
        is_financial: false,
        transaction_data: {
          evaluation_id: evaluationId,
          question_id: body.questionId,
          answer_text: body.answerText,
          evaluation_result: evaluation,
          ai_model: 'HERA-Education-AI-v1.0',
          evaluation_timestamp: new Date().toISOString()
        }
      });

    return NextResponse.json({
      success: true,
      data: {
        evaluationId,
        ...evaluation
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

async function performAdvancedEvaluation(
  answerText: string, 
  questionData: any, 
  evaluationType: string
): Promise<any> {
  const { marksAvailable, commandWords, topicArea, markScheme } = questionData;
  
  // Initialize evaluation result
  let evaluation = {
    estimated_marks: 0,
    max_marks: marksAvailable,
    percentage: 0,
    detailed_feedback: {
      content_analysis: {},
      technique_analysis: {},
      structure_analysis: {},
      time_management: {},
      improvement_suggestions: [],
      examiner_comments: []
    },
    confidence_score: 0
  };

  // Content Analysis
  evaluation.detailed_feedback.content_analysis = analyzeContent(answerText, markScheme, topicArea);
  
  // Technique Analysis based on command words
  evaluation.detailed_feedback.technique_analysis = analyzeTechnique(answerText, commandWords, marksAvailable);
  
  // Structure Analysis
  evaluation.detailed_feedback.structure_analysis = analyzeStructure(answerText, marksAvailable);
  
  // Calculate estimated marks
  const contentScore = evaluation.detailed_feedback.content_analysis.relevance_score || 0;
  const techniqueScore = evaluation.detailed_feedback.technique_analysis.technique_score || 0;
  const structureScore = evaluation.detailed_feedback.structure_analysis.organization_score || 0;
  
  evaluation.estimated_marks = Math.round(
    (contentScore * 0.4 + techniqueScore * 0.35 + structureScore * 0.25) * marksAvailable / 10
  );
  
  evaluation.percentage = Math.round((evaluation.estimated_marks / marksAvailable) * 100);
  evaluation.confidence_score = Math.min(95, 70 + (evaluation.estimated_marks / marksAvailable * 25));

  // Generate improvement suggestions
  evaluation.detailed_feedback.improvement_suggestions = generateImprovementSuggestions(
    evaluation.detailed_feedback,
    commandWords,
    marksAvailable
  );

  // Generate examiner-style comments
  evaluation.detailed_feedback.examiner_comments = generateExaminerComments(
    evaluation.detailed_feedback,
    evaluation.percentage
  );

  return evaluation;
}

function analyzeContent(answerText: string, markScheme: string[], topicArea: string): any {
  // Business terminology analysis
  const businessTerms = [
    'profit', 'revenue', 'market share', 'competitive advantage', 'stakeholders',
    'cash flow', 'brand loyalty', 'marketing mix', 'supply chain', 'economies of scale',
    'break-even', 'roi', 'productivity', 'efficiency', 'innovation', 'sustainability'
  ];
  
  const terminologyUsed = businessTerms.filter(term => 
    answerText.toLowerCase().includes(term)
  );

  // Mark scheme coverage
  const markSchemeCoverage = markScheme.filter(point => 
    answerText.toLowerCase().includes(point.toLowerCase())
  );

  // Topic relevance
  const topicRelevance = answerText.toLowerCase().includes(topicArea.toLowerCase()) ? 8 : 5;

  return {
    terminology_count: terminologyUsed.length,
    terminology_used: terminologyUsed.slice(0, 5),
    mark_scheme_coverage: markSchemeCoverage.length,
    topic_relevance: topicRelevance,
    relevance_score: Math.min(10, topicRelevance + terminologyUsed.length * 0.5)
  };
}

function analyzeTechnique(answerText: string, commandWords: string, marksAvailable: number): any {
  const primaryCommand = commandWords.toLowerCase().split(' ')[0];
  const technique = TechniquePatterns[primaryCommand];
  
  if (!technique) {
    return {
      technique_recognized: false,
      technique_score: 5,
      command_word_advice: `Practice ${primaryCommand} questions specifically`
    };
  }

  const techniqueScore = technique.scoring(answerText);
  const requiredWords = technique.required.filter(word => 
    answerText.toLowerCase().includes(word)
  );

  return {
    technique_recognized: true,
    command_word: primaryCommand,
    technique_score: techniqueScore,
    required_words_used: requiredWords,
    recommended_structure: technique.structure,
    technique_advice: generateTechniqueAdvice(primaryCommand, techniqueScore, marksAvailable)
  };
}

function analyzeStructure(answerText: string, marksAvailable: number): any {
  const paragraphs = answerText.split('\n').filter(p => p.trim().length > 0);
  const sentences = answerText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const wordCount = answerText.split(/\s+/).length;
  
  const expectedWordCount = marksAvailable * 50; // 50 words per mark
  const lengthScore = Math.max(0, 10 - Math.abs(wordCount - expectedWordCount) / expectedWordCount * 10);
  
  const structureWords = ['firstly', 'secondly', 'furthermore', 'however', 'in conclusion'];
  const structureUsed = structureWords.filter(word => 
    answerText.toLowerCase().includes(word)
  );

  return {
    paragraph_count: paragraphs.length,
    sentence_count: sentences.length,
    word_count: wordCount,
    expected_word_count: expectedWordCount,
    length_appropriateness: lengthScore,
    structure_words_used: structureUsed,
    organization_score: Math.min(10, lengthScore + structureUsed.length * 1.5)
  };
}

function generateTechniqueAdvice(commandWord: string, score: number, marks: number): string {
  const adviceMap: Record<string, string> = {
    'evaluate': score < 3 ? 
      'For evaluation questions, you must show both sides and make a clear judgment. Use "however" to show balance.' :
      'Good evaluation technique. Continue to strengthen your final judgment.',
    'analyse': score < 3 ?
      'Analysis requires explaining WHY things happen. Use "because", "leads to", and "results in".' :
      'Strong analytical approach. Keep linking causes to effects.',
    'explain': score < 3 ?
      'Explanations need reasoning. Always explain WHY using "because" and give examples.' :
      'Good explanatory technique. Your reasoning is clear.'
  };

  return adviceMap[commandWord] || `Practice ${commandWord} questions to improve technique.`;
}

function generateImprovementSuggestions(feedback: any, commandWords: string, marks: number): string[] {
  const suggestions = [];
  
  if (feedback.content_analysis.terminology_count < 2) {
    suggestions.push('Include more specific business terminology to demonstrate knowledge');
  }
  
  if (feedback.technique_analysis.technique_score < 3) {
    suggestions.push(`Improve your ${commandWords.split(' ')[0]} technique - review the specific requirements`);
  }
  
  if (feedback.structure_analysis.organization_score < 6) {
    suggestions.push('Improve answer structure with clear paragraphs and linking words');
  }
  
  if (marks >= 8 && !feedback.content_analysis.terminology_used.includes('however')) {
    suggestions.push('For high-mark questions, show analysis and evaluation');
  }
  
  return suggestions.slice(0, 4);
}

function generateExaminerComments(feedback: any, percentage: number): string[] {
  const comments = [];
  
  if (percentage >= 80) {
    comments.push('Excellent understanding demonstrated');
  } else if (percentage >= 60) {
    comments.push('Good knowledge with room for improvement');
  } else {
    comments.push('Basic understanding shown, needs development');
  }
  
  if (feedback.technique_analysis.technique_score >= 4) {
    comments.push('Strong exam technique evident');
  } else {
    comments.push('Work on exam technique and question requirements');
  }
  
  return comments;
}