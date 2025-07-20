/**
 * HERA Education - Simple Test Endpoint
 * 
 * Quick test endpoint to verify the education API system is working
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId') || '123e4567-e89b-12d3-a456-426614174000';

    return NextResponse.json({
      success: true,
      message: 'HERA Education API is operational',
      system: {
        name: 'HERA Education System',
        version: '1.0.0',
        description: 'AI-powered exam preparation platform',
        features: [
          'Student Management',
          'Past Paper Processing',
          'AI Question Practice',
          'Answer Evaluation',
          'Progress Tracking',
          'Exam Technique Analysis'
        ]
      },
      test_organization: organizationId,
      available_endpoints: {
        students: '/api/education/students',
        papers: '/api/education/papers',
        questions: '/api/education/questions',
        practice: '/api/education/questions/practice',
        answers: '/api/education/answers',
        ai_evaluation: '/api/education/ai/evaluate-answer'
      },
      sample_student_data: {
        name: 'Future Business Leader',
        age: 12,
        gradeLevel: 'Advanced',
        targetExam: 'Edexcel Business A-Level',
        learningStyle: 'Visual-Kinesthetic'
      },
      sample_question_data: {
        questionText: 'Evaluate the impact of digital marketing on small businesses.',
        marksAvailable: 8,
        topicArea: 'Marketing',
        commandWords: 'Evaluate',
        difficultyLevel: 'intermediate'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Test endpoint failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}