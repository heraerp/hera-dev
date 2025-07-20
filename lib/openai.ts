/**
 * OpenAI Integration for HERA Education System
 * 
 * Provides AI tutoring, question generation, and personalized learning
 * for Edexcel Business A-Level students
 */

import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Edexcel Business A-Level Syllabus Structure
export const EDEXCEL_BUSINESS_SYLLABUS = {
  "Theme 1": {
    title: "Marketing and People",
    topics: {
      "1.1": "Meeting customer needs",
      "1.2": "The market",
      "1.3": "Marketing mix",
      "1.4": "Managing people",
      "1.5": "Entrepreneurs and leaders"
    }
  },
  "Theme 2": {
    title: "Managing Business Activities", 
    topics: {
      "2.1": "Raising finance",
      "2.2": "Financial planning",
      "2.3": "Managing finance",
      "2.4": "Resource management",
      "2.5": "External influences"
    }
  },
  "Theme 3": {
    title: "Business Decisions and Strategy",
    topics: {
      "3.1": "Business objectives and strategy",
      "3.2": "Business growth", 
      "3.3": "Decision-making techniques",
      "3.4": "Influences on business decisions",
      "3.5": "Assessing competitiveness",
      "3.6": "Managing change"
    }
  },
  "Theme 4": {
    title: "Global Business",
    topics: {
      "4.1": "Globalisation",
      "4.2": "Global markets and business expansion",
      "4.3": "Global marketing",
      "4.4": "Global industries and companies"
    }
  }
};

// Question generation prompts for different mark allocations
const QUESTION_PROMPTS = {
  2: `Generate a 2-mark "State" or "Give" or "Identify" question for Edexcel Business A-Level.
  
Requirements:
- Topic: {topic}
- Command word: State/Give/Identify (factual recall)
- 2 marks available
- Should test basic knowledge
- Include clear mark scheme with 2 distinct points
- Time allocation: 3 minutes

Format your response as JSON:
{
  "question": "Question text here",
  "marks": 2,
  "commandWords": "State/Give/Identify", 
  "timeMinutes": 3,
  "markScheme": ["Point 1", "Point 2"],
  "modelAnswer": "Complete model answer with examiner notes",
  "difficulty": "basic"
}`,

  4: `Generate a 4-mark "Explain" question for Edexcel Business A-Level.

Requirements:
- Topic: {topic}
- Command word: Explain
- 4 marks available  
- Should require explanation with reasoning
- Include clear mark scheme
- Time allocation: 6 minutes

Format your response as JSON:
{
  "question": "Question text here",
  "marks": 4,
  "commandWords": "Explain",
  "timeMinutes": 6, 
  "markScheme": ["Point 1 + explanation", "Point 2 + explanation"],
  "modelAnswer": "Complete model answer using PEE structure with examiner notes",
  "difficulty": "intermediate"
}`,

  6: `Generate a 6-mark "Explain" or "Analyse" question for Edexcel Business A-Level.

Requirements:
- Topic: {topic}
- Command word: Explain/Analyse
- 6 marks available
- Should require detailed explanation with business examples
- Include comprehensive mark scheme
- Time allocation: 9 minutes

Format your response as JSON:
{
  "question": "Question text here",
  "marks": 6,
  "commandWords": "Explain/Analyse",
  "timeMinutes": 9,
  "markScheme": ["Detailed marking criteria"],
  "modelAnswer": "Complete model answer with PEE structure, business examples, and examiner notes",
  "difficulty": "intermediate"
}`,

  10: `Generate a 10-mark "Analyse" question for Edexcel Business A-Level.

Requirements:
- Topic: {topic}
- Command word: Analyse
- 10 marks available
- Should require cause-effect analysis with business context
- Include detailed mark scheme with levels
- Time allocation: 15 minutes

Format your response as JSON:
{
  "question": "Question text here",
  "marks": 10,
  "commandWords": "Analyse", 
  "timeMinutes": 15,
  "markScheme": ["Level descriptors with analysis requirements"],
  "modelAnswer": "Complete analytical answer with cause-effect reasoning and examiner notes",
  "difficulty": "advanced"
}`,

  16: `Generate a 16-mark "Evaluate" question for Edexcel Business A-Level.

Requirements:
- Topic: {topic}
- Command word: Evaluate/Assess/"To what extent"
- 16 marks available
- Should require balanced evaluation with judgment
- Include detailed mark scheme with levels
- Time allocation: 24 minutes

Format your response as JSON:
{
  "question": "Question text here",
  "marks": 16,
  "commandWords": "Evaluate",
  "timeMinutes": 24,
  "markScheme": ["Level descriptors for evaluation"],
  "modelAnswer": "Complete evaluative answer with balanced arguments, judgment, and examiner notes",
  "difficulty": "advanced"
}`
};

// AI Tutoring prompt for personalized teaching
const TUTORING_PROMPT = `You are an expert Edexcel Business A-Level tutor with 20 years of examining experience.

Student Context:
- Topic: {topic}
- Student's recent performance: {performance}
- Areas of weakness: {weaknesses}
- Learning style: {learningStyle}

Your role:
1. Explain the topic clearly with real business examples
2. Address specific weaknesses identified
3. Provide exam technique guidance
4. Suggest practice activities
5. Build confidence through positive reinforcement

Respond in a friendly, encouraging tone suitable for a 16-17 year old student.
Keep explanations clear and use lots of current business examples they'll recognize.

Focus on practical exam technique and real understanding, not just memorization.`;

// Answer evaluation prompt
const EVALUATION_PROMPT = `You are an experienced Edexcel Business A-Level examiner.

Evaluate this student answer:

Question: {question}
Marks Available: {marks}
Command Word: {commandWord}
Student Answer: {studentAnswer}
Time Taken: {timeTaken} minutes

Provide detailed feedback as JSON:
{
  "estimatedMarks": 0-{marks},
  "percentage": 0-100,
  "strengths": ["What the student did well"],
  "improvements": ["Specific areas to improve"],
  "techniqueAdvice": "Exam technique guidance",
  "timeManagement": "Comment on timing",
  "nextSteps": ["What to practice next"],
  "examinerComment": "Overall examiner perspective",
  "confidence": 0-100
}

Be encouraging but honest. Focus on technique improvement and specific actionable advice.`;

/**
 * Check cached content before making OpenAI call
 */
async function getCachedContent(
  organizationId: string,
  type: string,
  searchParams: Record<string, any>
): Promise<any | null> {
  try {
    const queryParams = new URLSearchParams({
      organizationId,
      type,
      ...Object.fromEntries(
        Object.entries(searchParams).map(([key, value]) => [key, String(value)])
      )
    });

    const response = await fetch(`/api/education/content?${queryParams}`);
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.success) return null;

    // Return first matching cached item
    const contentKey = `${type}s` as 'questions' | 'explanations' | 'examTips' | 'studyPlans';
    const cachedItems = data.data[contentKey] || [];
    
    return cachedItems.length > 0 ? cachedItems[0] : null;
  } catch (error) {
    console.error('Error checking cached content:', error);
    return null;
  }
}

/**
 * Save content to cache
 */
async function saveToCache(
  organizationId: string,
  type: string,
  content: any,
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    await fetch('/api/education/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organizationId,
        type,
        content,
        metadata
      })
    });
  } catch (error) {
    console.error('Error saving to cache:', error);
    // Don't throw - caching failure shouldn't break the main function
  }
}

/**
 * Generate a practice question using OpenAI with caching
 */
export async function generatePracticeQuestion(
  topic: string,
  marks: number = 6,
  studentLevel: 'basic' | 'intermediate' | 'advanced' = 'intermediate',
  organizationId: string = '803c33bc-add0-4ad8-8d22-9511a049223a' // Demo org
): Promise<any> {
  try {
    // First, check if we have cached content
    const cachedQuestion = await getCachedContent(organizationId, 'question', {
      topic_area: topic,
      marks_available: marks,
      difficulty_level: studentLevel
    });

    if (cachedQuestion) {
      console.log('Using cached question for:', topic, marks, studentLevel);
      // Transform cached data back to expected format
      return {
        question: cachedQuestion.question_text || cachedQuestion.content,
        marks: parseInt(cachedQuestion.marks_available) || marks,
        commandWords: cachedQuestion.command_words || 'Explain',
        timeMinutes: parseInt(cachedQuestion.time_minutes) || Math.ceil(marks * 1.5),
        markScheme: JSON.parse(cachedQuestion.mark_scheme || '[]'),
        modelAnswer: cachedQuestion.model_answer || '',
        difficulty: cachedQuestion.difficulty_level || studentLevel,
        cached: true
      };
    }

    // Generate new question with OpenAI
    console.log('Generating new question with OpenAI for:', topic, marks, studentLevel);
    const promptTemplate = QUESTION_PROMPTS[marks as keyof typeof QUESTION_PROMPTS] || QUESTION_PROMPTS[6];
    const prompt = promptTemplate.replace('{topic}', topic);

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system", 
          content: "You are an expert Edexcel Business A-Level examiner. Generate high-quality exam questions that match official standards."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    const questionData = JSON.parse(content);

    // Cache the new question for future use
    await saveToCache(organizationId, 'question', {
      question_text: questionData.question,
      marks_available: questionData.marks,
      command_words: questionData.commandWords,
      time_minutes: questionData.timeMinutes,
      mark_scheme: JSON.stringify(questionData.markScheme),
      model_answer: questionData.modelAnswer,
      difficulty_level: questionData.difficulty,
      topic_area: topic,
      syllabus_theme: findSyllabusTheme(topic)
    }, {
      ai_generated: true,
      openai_model: 'gpt-4',
      generated_at: new Date().toISOString()
    });

    return { ...questionData, cached: false };

  } catch (error) {
    console.error('Error generating question:', error);
    throw new Error('Failed to generate practice question');
  }
}

/**
 * Helper function to find syllabus theme for a topic
 */
function findSyllabusTheme(topic: string): string {
  for (const [themeKey, theme] of Object.entries(EDEXCEL_BUSINESS_SYLLABUS)) {
    const topicList = Object.values(theme.topics);
    if (topicList.some(t => t.toLowerCase().includes(topic.toLowerCase()) || topic.toLowerCase().includes(t.toLowerCase()))) {
      return themeKey;
    }
  }
  return 'Theme 1'; // Default fallback
}

/**
 * Provide AI tutoring for a specific topic with caching
 */
export async function provideTutoring(
  topic: string,
  studentPerformance: any,
  weaknesses: string[],
  learningStyle: string = 'visual',
  organizationId: string = '803c33bc-add0-4ad8-8d22-9511a049223a' // Demo org
): Promise<string> {
  try {
    // Check for cached explanation first (basic topic explanations can be reused)
    const cachedExplanation = await getCachedContent(organizationId, 'explanation', {
      topic_area: topic
    });

    if (cachedExplanation) {
      console.log('Using cached explanation for:', topic);
      return cachedExplanation.explanation_content || cachedExplanation.content || 'No explanation found.';
    }

    // Generate new tutoring content with OpenAI
    console.log('Generating new tutoring content with OpenAI for:', topic);
    const prompt = TUTORING_PROMPT
      .replace('{topic}', topic)
      .replace('{performance}', JSON.stringify(studentPerformance))
      .replace('{weaknesses}', weaknesses.join(', '))
      .replace('{learningStyle}', learningStyle);

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a highly experienced and encouraging Edexcel Business A-Level tutor."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1500
    });

    const tutorResponse = response.choices[0]?.message?.content || 'Sorry, I could not provide tutoring at this time.';

    // Cache the tutoring content for future use
    await saveToCache(organizationId, 'explanation', {
      explanation_content: tutorResponse,
      topic_area: topic,
      syllabus_theme: findSyllabusTheme(topic),
      learning_style: learningStyle,
      content_type: 'tutoring'
    }, {
      ai_generated: true,
      openai_model: 'gpt-4',
      generated_at: new Date().toISOString(),
      student_performance: JSON.stringify(studentPerformance),
      weaknesses: weaknesses.join(', ')
    });

    return tutorResponse;
  } catch (error) {
    console.error('Error providing tutoring:', error);
    throw new Error('Failed to provide AI tutoring');
  }
}

/**
 * Evaluate student answer using AI
 */
export async function evaluateAnswer(
  question: string,
  studentAnswer: string,
  marks: number,
  commandWord: string,
  timeTaken: number
): Promise<any> {
  try {
    const prompt = EVALUATION_PROMPT
      .replace('{question}', question)
      .replace('{marks}', marks.toString())
      .replace('{commandWord}', commandWord)
      .replace('{studentAnswer}', studentAnswer)
      .replace('{timeTaken}', timeTaken.toString());

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an experienced Edexcel Business A-Level examiner providing constructive feedback."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    return JSON.parse(content);
  } catch (error) {
    console.error('Error evaluating answer:', error);
    throw new Error('Failed to evaluate answer');
  }
}

/**
 * Get topic explanation and teaching content with caching
 */
export async function explainTopic(
  topic: string,
  studentLevel: string = 'intermediate',
  specificQuestions: string[] = [],
  organizationId: string = '803c33bc-add0-4ad8-8d22-9511a049223a' // Demo org
): Promise<string> {
  try {
    // Check for cached explanation first
    const cachedExplanation = await getCachedContent(organizationId, 'explanation', {
      topic_area: topic,
      student_level: studentLevel
    });

    if (cachedExplanation && specificQuestions.length === 0) {
      console.log('Using cached topic explanation for:', topic);
      return cachedExplanation.explanation_content || cachedExplanation.content || 'No explanation found.';
    }

    // Generate new explanation with OpenAI
    console.log('Generating new topic explanation with OpenAI for:', topic);
    const questionsText = specificQuestions.length > 0 
      ? `\n\nStudent has specific questions: ${specificQuestions.join(', ')}`
      : '';

    const prompt = `Explain the Edexcel Business A-Level topic "${topic}" to a ${studentLevel} level student.

Requirements:
- Use clear, engaging language suitable for 16-17 year olds
- Include relevant, current business examples (Apple, Amazon, Tesla, etc.)
- Cover key concepts and definitions
- Explain how this relates to exam requirements
- Provide practical examples students can remember
- Make it interesting and relatable${questionsText}

Structure your response with clear headings and make it comprehensive but digestible.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an engaging and knowledgeable Edexcel Business A-Level teacher."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const explanation = response.choices[0]?.message?.content || 'Sorry, I could not explain this topic at this time.';

    // Cache the explanation for future use (only if no specific questions)
    if (specificQuestions.length === 0) {
      await saveToCache(organizationId, 'explanation', {
        explanation_content: explanation,
        topic_area: topic,
        student_level: studentLevel,
        syllabus_theme: findSyllabusTheme(topic),
        content_type: 'topic_explanation'
      }, {
        ai_generated: true,
        openai_model: 'gpt-4',
        generated_at: new Date().toISOString()
      });
    }

    return explanation;
  } catch (error) {
    console.error('Error explaining topic:', error);
    throw new Error('Failed to explain topic');
  }
}

/**
 * Generate personalized study plan with caching
 */
export async function generateStudyPlan(
  studentPerformance: any,
  examDate: string,
  weakTopics: string[],
  organizationId: string = '803c33bc-add0-4ad8-8d22-9511a049223a' // Demo org
): Promise<any> {
  try {
    // Create a cache key based on exam date and weak topics
    const cacheKey = `${examDate}-${weakTopics.sort().join(',')}`;
    
    // Check for cached study plan
    const cachedPlan = await getCachedContent(organizationId, 'study_plan', {
      exam_date: examDate,
      weak_topics: weakTopics.join(',')
    });

    if (cachedPlan) {
      console.log('Using cached study plan for exam date:', examDate);
      return JSON.parse(cachedPlan.study_plan_content || cachedPlan.content || '{}');
    }

    // Generate new study plan with OpenAI
    console.log('Generating new study plan with OpenAI for exam date:', examDate);
    const prompt = `Create a personalized study plan for an Edexcel Business A-Level student.

Student Data:
- Current performance: ${JSON.stringify(studentPerformance)}
- Exam date: ${examDate}
- Weak topics: ${weakTopics.join(', ')}
- Time available: Calculate from current date to exam date

Create a detailed week-by-week study plan that:
1. Prioritizes weak areas
2. Includes regular practice questions
3. Balances all syllabus themes
4. Includes revision time
5. Has realistic daily targets

Format as JSON with weekly breakdown and daily activities.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert study planner for A-Level Business students."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 2000
    });

    const content = response.choices[0]?.message?.content;
    const studyPlan = content ? JSON.parse(content) : null;

    if (studyPlan) {
      // Cache the study plan for future use
      await saveToCache(organizationId, 'study_plan', {
        study_plan_content: JSON.stringify(studyPlan),
        exam_date: examDate,
        weak_topics: weakTopics.join(','),
        total_weeks: studyPlan.totalWeeks || 12,
        daily_hours: studyPlan.dailyHours || 2
      }, {
        ai_generated: true,
        openai_model: 'gpt-4',
        generated_at: new Date().toISOString(),
        student_performance: JSON.stringify(studentPerformance)
      });
    }

    return studyPlan;
  } catch (error) {
    console.error('Error generating study plan:', error);
    throw new Error('Failed to generate study plan');
  }
}