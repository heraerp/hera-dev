'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  Lightbulb, 
  Target,
  Zap,
  CheckCircle,
  XCircle,
  TrendingUp,
  Clock,
  Star,
  Trophy,
  Brain,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface Question {
  id: string;
  questionText: string;
  marksAvailable: number;
  topicArea: string;
  commandWords: string;
  difficultyLevel: string;
  timeAllocationMinutes: number;
}

interface ExamTechniqueAdvice {
  marks: number;
  commandWord: string;
  techniqueAdvice: string;
  timeGuidance: string;
  structureTemplate: string;
  examplePhrases: string[];
  commonErrors: string[];
}

interface AIFeedback {
  strengths: string[];
  improvements: string[];
  techniqueScore: number;
  structureScore: number;
  terminologyScore: number;
  timeEfficiency: string;
  confidence: number;
}

interface PracticeInterfaceProps {
  studentId: string;
  organizationId: string;
  onComplete?: (result: any) => void;
}

// Exam technique advice for different mark allocations
const getExamTechniqueAdvice = (marks: number, commandWord: string): ExamTechniqueAdvice => {
  const baseAdvice = {
    marks,
    commandWord,
    techniqueAdvice: '',
    timeGuidance: '',
    structureTemplate: '',
    examplePhrases: [],
    commonErrors: []
  };

  if (marks <= 2) {
    return {
      ...baseAdvice,
      techniqueAdvice: 'Keep it brief and factual - no explanations needed!',
      timeGuidance: '1-2 minutes maximum',
      structureTemplate: 'Simple factual statements',
      examplePhrases: ['One feature is...', 'Another feature is...'],
      commonErrors: ['Don\'t waste time explaining when just facts are needed']
    };
  } else if (marks <= 6) {
    return {
      ...baseAdvice,
      techniqueAdvice: 'Use PEE structure: Point → Explanation → Example',
      timeGuidance: '4-9 minutes (1.5 mins per mark)',
      structureTemplate: 'Point → Explain why → Give business example',
      examplePhrases: ['One advantage is...', 'This means that...', 'For example...'],
      commonErrors: ['Always include business examples for application marks']
    };
  } else if (marks <= 12) {
    return {
      ...baseAdvice,
      techniqueAdvice: 'Show analysis with cause and effect relationships',
      timeGuidance: '12-18 minutes',
      structureTemplate: 'Multiple detailed points with analysis',
      examplePhrases: ['This leads to...', 'As a result...', 'The impact is...'],
      commonErrors: ['Go beyond description - analyze WHY and HOW']
    };
  } else {
    return {
      ...baseAdvice,
      techniqueAdvice: 'Evaluation requires balanced judgment with clear conclusion',
      timeGuidance: '24-37 minutes',
      structureTemplate: 'Introduction → Analysis → Evaluation → Conclusion',
      examplePhrases: ['However...', 'On balance...', 'Overall, the most significant...'],
      commonErrors: ['Must show evaluation skills with contrasting arguments']
    };
  }
};

// Generate model answer based on question type and marks
const generateModelAnswer = (question: Question, techniqueAdvice: ExamTechniqueAdvice): string => {
  const { questionText, marksAvailable, topicArea, commandWords } = question;
  const command = commandWords.toLowerCase();

  // Sample model answers based on the demo questions
  if (questionText.includes('limited company')) {
    return `Two features of a limited company are:

1. **Limited liability** - Shareholders are only responsible for company debts up to the amount they have invested in shares. This means their personal assets are protected if the company fails.

2. **Separate legal entity** - The company has its own legal identity separate from its owners. This allows the company to enter into contracts, own assets, and be sued in its own name.

**Examiner Note**: Each point clearly states the feature and explains what it means in practice. No examples needed for a 2-mark "state" question.`;
  }

  if (questionText.includes('franchising')) {
    return `Two advantages of franchising for a franchisor are:

**1. Rapid expansion with reduced risk**
Franchising allows the franchisor to expand their business quickly across multiple locations without having to invest their own capital in each new outlet. The franchisee provides the initial investment, reducing the financial risk for the franchisor. For example, McDonald's has expanded globally through franchising without having to fund every restaurant directly.

**2. Local market knowledge and management**
Franchisees typically have better knowledge of their local market conditions, customer preferences, and regulations. They also provide hands-on management of the outlet, reducing the franchisor's operational burden. For instance, a local franchisee would understand regional food preferences better than a distant head office.

**Examiner Note**: Each advantage is clearly explained with reasoning (why it's beneficial) and includes a relevant business example. This follows the PEE structure: Point → Explanation → Example.`;
  }

  if (questionText.includes('digital marketing')) {
    return `**Analysis of the impact of digital marketing on small businesses:**

**Positive Impacts:**

**Cost-effective customer reach**
Digital marketing allows small businesses to reach large audiences at a fraction of the cost of traditional advertising. Social media platforms and Google Ads enable precise targeting of potential customers, meaning small businesses can compete more effectively with larger competitors. This leads to improved return on investment for marketing spend.

**Real-time customer engagement and feedback**
Small businesses can interact directly with customers through social media, responding to queries instantly and building stronger relationships. This immediate communication channel helps build customer loyalty and allows for rapid response to customer complaints or suggestions.

**Negative Impacts:**

**Increased competition and market saturation**
Digital marketing has lowered barriers to entry, meaning small businesses now face more competition online. Every business can now reach the same global market, making it harder to stand out. This can lead to price wars and reduced profit margins.

**Technical skills requirement**
Effective digital marketing requires knowledge of various platforms, analytics, and constantly changing algorithms. Small business owners may lack these skills or the resources to hire specialists, potentially limiting their digital marketing effectiveness.

**Overall Impact:**
Digital marketing has generally benefited small businesses by providing affordable access to large markets, though it has also increased competitive pressure. Success depends on the business's ability to adapt and develop digital marketing expertise.

**Examiner Note**: This answer shows clear analysis by explaining cause-and-effect relationships. It considers both positive and negative impacts (balanced analysis) and includes specific examples. The conclusion weighs up the overall impact.`;
  }

  // Generic model answer template
  const marks = marksAvailable;
  if (marks <= 2) {
    return `**Model Answer for ${marks}-mark "${command}" question:**

${techniqueAdvice.structureTemplate}

Two ${command === 'state' ? 'points' : 'examples'} are:
1. [First key point - brief and factual]
2. [Second key point - brief and factual]

**Examiner Note**: For ${marks}-mark questions, keep answers concise and factual. No explanations or examples needed.`;
  }

  if (marks <= 6) {
    return `**Model Answer for ${marks}-mark "${command}" question:**

${techniqueAdvice.structureTemplate}

**Point 1:** [First main point]
**Explanation:** [Why this point is relevant/important]
**Example:** [Specific business example to illustrate the point]

**Point 2:** [Second main point]  
**Explanation:** [Why this point is relevant/important]
**Example:** [Specific business example to illustrate the point]

**Examiner Note**: This follows the PEE structure (Point-Explanation-Example). Each point should be fully developed with business context and real examples.`;
  }

  if (marks <= 12) {
    return `**Model Answer for ${marks}-mark "${command}" question:**

**Introduction:** Brief context about the topic

**Analysis Point 1:** [First analytical point]
- Explanation of cause and effect
- Impact on the business/stakeholders
- Link to business performance

**Analysis Point 2:** [Second analytical point]
- Explanation of cause and effect  
- Impact on the business/stakeholders
- Connection to first point

**Analysis Point 3:** [Third analytical point]
- Broader implications
- Long-term consequences
- Links to business objectives

**Conclusion:** Summary of key analytical insights

**Examiner Note**: Show clear analysis by explaining WHY and HOW things happen. Use connectives like "this leads to...", "as a result...", "the impact is...". Link points together to show integrated thinking.`;
  }

  return `**Model Answer for ${marks}-mark "${command}" question:**

**Introduction:** [Set context and define key terms]

**Analysis Section:**
- [Analytical point with cause-effect reasoning]
- [Impact assessment with examples]
- [Links to business theory/concepts]

**Evaluation Section:**
- [Balanced view considering different perspectives]
- [Weighing up advantages vs disadvantages]
- [Consideration of stakeholder impacts]

**Conclusion:** [Clear judgment with justification]

**Examiner Note**: For high-mark evaluation questions, you must show balanced analysis AND make clear judgments. Use phrases like "however", "on balance", "the most significant factor is..." to show evaluation skills.`;
};

export default function PracticeInterface({ studentId, organizationId, onComplete }: PracticeInterfaceProps) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [techniqueAdvice, setTechniqueAdvice] = useState<ExamTechniqueAdvice | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [xpGained, setXpGained] = useState(0);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [modelAnswer, setModelAnswer] = useState<string>('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    fetchPracticeQuestion();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isTimerRunning && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timeRemaining]);

  const fetchPracticeQuestion = async () => {
    try {
      // First try to generate a new AI question
      const aiResponse = await fetch('/api/education/ai/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          // Let AI select random topic and marks for variety
        })
      });

      let fetchedQuestion;
      
      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        fetchedQuestion = aiData.data;
        console.log('Generated AI question:', fetchedQuestion.topicArea, fetchedQuestion.marksAvailable + ' marks');
      } else {
        // Fallback to existing questions if AI generation fails
        console.log('AI generation failed, using fallback questions');
        const response = await fetch(`/api/education/questions/practice?organizationId=${organizationId}&count=1`);
        const data = await response.json();
        fetchedQuestion = data.data?.[0];
      }
      
      if (fetchedQuestion) {
        setQuestion(fetchedQuestion);
        setTimeRemaining(fetchedQuestion.timeAllocationMinutes * 60); // Convert to seconds
        const advice = getExamTechniqueAdvice(fetchedQuestion.marksAvailable, fetchedQuestion.commandWords);
        setTechniqueAdvice(advice);
        
        // Use AI-generated model answer if available, otherwise generate one
        const modelAns = fetchedQuestion.modelAnswer || generateModelAnswer(fetchedQuestion, advice);
        setModelAnswer(modelAns);
      }
    } catch (error) {
      console.error('Error fetching question:', error);
      // Could add user-friendly error handling here
    }
  };

  const startTimer = () => {
    setIsTimerRunning(true);
    setStartTime(new Date());
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    if (question) {
      setTimeRemaining(question.timeAllocationMinutes * 60);
    }
    setAnswer('');
    setFeedback(null);
    setStartTime(null);
    setShowModelAnswer(false);
  };

  const handleTimeUp = () => {
    if (answer.trim()) {
      submitAnswer();
    }
  };

  const submitAnswer = async () => {
    if (!question || !answer.trim() || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      const timeTaken = startTime ? Math.round((new Date().getTime() - startTime.getTime()) / 60000) : question.timeAllocationMinutes;
      
      const response = await fetch('/api/education/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          questionId: question.id,
          answerText: answer,
          timeTakenMinutes: timeTaken,
          organizationId
        })
      });

      const result = await response.json();
      setFeedback(result.data);
      
      // Calculate XP based on performance
      const xp = Math.round((result.data.percentage / 100) * 50) + 10; // Base 10 XP + performance bonus
      setXpGained(xp);
      
      // Show celebration for good answers
      if (result.data.percentage >= 70) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }

      if (onComplete) {
        onComplete(result.data);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (!question) return 'text-green-400';
    const percentage = (timeRemaining / (question.timeAllocationMinutes * 60)) * 100;
    if (percentage > 50) return 'text-green-400';
    if (percentage > 20) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your practice question... 🧠</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-6xl animate-bounce mb-4">🎉</div>
            <div className="text-3xl font-bold text-yellow-400 mb-2">Excellent Work!</div>
            <div className="text-xl text-white mb-4">+{xpGained} XP Gained!</div>
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="text-yellow-400 animate-pulse" size={24} />
              <span className="text-lg">Keep up the amazing progress!</span>
              <Sparkles className="text-yellow-400 animate-pulse" size={24} />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6">
        {/* Header with Timer and Question Info */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Target className="text-blue-400" size={24} />
                <span className="font-bold text-lg">{question.marksAvailable} Mark Question</span>
              </div>
              <div className="px-3 py-1 bg-purple-500/30 rounded-full text-sm">
                {question.topicArea}
              </div>
              <div className="px-3 py-1 bg-orange-500/30 rounded-full text-sm">
                {question.difficultyLevel}
              </div>
            </div>
            
            {/* Timer */}
            <div className="flex items-center gap-4">
              <div className={`text-3xl font-bold ${getTimerColor()}`}>
                {formatTime(timeRemaining)}
              </div>
              <div className="flex gap-2">
                {!isTimerRunning ? (
                  <button
                    onClick={startTimer}
                    className="bg-green-500 hover:bg-green-400 p-2 rounded-lg transition-colors"
                  >
                    <Play size={20} />
                  </button>
                ) : (
                  <button
                    onClick={pauseTimer}
                    className="bg-yellow-500 hover:bg-yellow-400 p-2 rounded-lg transition-colors"
                  >
                    <Pause size={20} />
                  </button>
                )}
                <button
                  onClick={resetTimer}
                  className="bg-red-500 hover:bg-red-400 p-2 rounded-lg transition-colors"
                >
                  <RotateCcw size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Question */}
          <div className="bg-white/5 rounded-lg p-4 mb-4">
            <div className="text-xl font-semibold mb-2">
              {question.questionText}
            </div>
            <div className="text-sm text-blue-200">
              Command word: <span className="font-bold text-yellow-400">{question.commandWords}</span> • 
              Time allocation: <span className="font-bold text-green-400">{question.timeAllocationMinutes} minutes</span>
            </div>
          </div>

          {/* Technique Hints */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowHints(!showHints)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg transition-colors"
            >
              <Lightbulb size={16} />
              <span>{showHints ? 'Hide' : 'Show'} Technique Tips</span>
            </button>
          </div>

          {showHints && techniqueAdvice && (
            <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-yellow-400 mb-2">🎯 Technique Advice</h4>
                  <p className="text-sm mb-2">{techniqueAdvice.techniqueAdvice}</p>
                  <p className="text-sm text-yellow-200">
                    <Clock size={14} className="inline mr-1" />
                    {techniqueAdvice.timeGuidance}
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-yellow-400 mb-2">📝 Structure Guide</h4>
                  <p className="text-sm mb-2">{techniqueAdvice.structureTemplate}</p>
                  <div className="text-xs text-yellow-200">
                    <strong>Use phrases like:</strong> {techniqueAdvice.examplePhrases.join(', ')}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Answer Input */}
        {!feedback ? (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="text-purple-400" size={24} />
              <span className="font-bold text-lg">Your Answer</span>
            </div>
            
            <textarea
              ref={textareaRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Start typing your answer here... Remember to use the technique tips above!"
              className="w-full h-64 bg-white/5 border border-white/20 rounded-lg p-4 text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-blue-200">
                Words: {answer.split(/\s+/).filter(word => word.length > 0).length} • 
                Expected: ~{question.marksAvailable * 40} words
              </div>
              
              <button
                onClick={submitAnswer}
                disabled={!answer.trim() || isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    <span>Submit Answer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* AI Feedback Display */
          <div className="space-y-6">
            {/* Score Display */}
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-xl p-6 border border-purple-400/30">
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text mb-2">
                  {feedback.estimatedMarks}/{feedback.maxMarks}
                </div>
                <div className="text-2xl font-bold text-white mb-2">
                  {feedback.percentage}% Score
                </div>
                <div className="text-lg text-purple-200">
                  +{xpGained} XP Earned! 🌟
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-sm text-purple-200 mb-1">Technique Score</div>
                  <div className="text-2xl font-bold text-yellow-400">{feedback.aiFeedback?.technique_score || 0}/10</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-purple-200 mb-1">Time Efficiency</div>
                  <div className="text-lg font-semibold text-green-400">{feedback.aiFeedback?.time_efficiency}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-purple-200 mb-1">AI Confidence</div>
                  <div className="text-2xl font-bold text-blue-400">{feedback.aiFeedback?.confidence}%</div>
                </div>
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="bg-green-500/10 backdrop-blur-md rounded-xl p-6 border border-green-400/30">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="text-green-400" size={24} />
                  <span className="font-bold text-lg">What You Did Well! 🎉</span>
                </div>
                
                {feedback.aiFeedback?.strengths?.length > 0 ? (
                  <ul className="space-y-2">
                    {feedback.aiFeedback.strengths.map((strength: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <Star className="text-yellow-400 flex-shrink-0 mt-0.5" size={16} />
                        <span className="text-green-100">{strength}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-green-200">Keep practicing to unlock strengths!</p>
                )}
              </div>

              {/* Improvements */}
              <div className="bg-orange-500/10 backdrop-blur-md rounded-xl p-6 border border-orange-400/30">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="text-orange-400" size={24} />
                  <span className="font-bold text-lg">Level Up Tips! 🚀</span>
                </div>
                
                {feedback.aiFeedback?.improvements?.length > 0 ? (
                  <ul className="space-y-2">
                    {feedback.aiFeedback.improvements.map((improvement: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <Zap className="text-yellow-400 flex-shrink-0 mt-0.5" size={16} />
                        <span className="text-orange-100">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-orange-200">Excellent work! Keep it up!</p>
                )}
              </div>
            </div>

            {/* Model Answer Section */}
            <div className="bg-blue-500/10 backdrop-blur-md rounded-xl p-6 border border-blue-400/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Star className="text-blue-400" size={24} />
                  <span className="font-bold text-lg">Model Answer 📚</span>
                </div>
                <button
                  onClick={() => setShowModelAnswer(!showModelAnswer)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors text-blue-200 hover:text-blue-100"
                >
                  <Lightbulb size={16} />
                  <span>{showModelAnswer ? 'Hide' : 'Show'} Model Answer</span>
                </button>
              </div>
              
              {showModelAnswer ? (
                <div className="bg-white/5 rounded-lg p-4 border border-blue-400/20">
                  <div className="prose prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-blue-100 text-sm leading-relaxed">
                      {modelAnswer}
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-400/20">
                    <div className="text-xs text-blue-200">
                      💡 <strong>Learning Tip:</strong> Compare your answer with this model response. 
                      Notice the structure, use of business terminology, and how each point is developed. 
                      Try to incorporate these techniques in your next answer!
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-blue-200 mb-2">See how an examiner would answer this question</div>
                  <div className="text-sm text-blue-300">Learn from the perfect structure and technique</div>
                </div>
              )}
            </div>

            {/* Next Actions */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setFeedback(null);
                  setAnswer('');
                  setShowModelAnswer(false);
                  fetchPracticeQuestion();
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 rounded-lg font-bold transition-all duration-300 transform hover:scale-105"
              >
                <Play size={20} />
                <span>Practice Another Question</span>
              </button>
              
              <button
                onClick={() => onComplete && onComplete(feedback)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 rounded-lg font-bold transition-all duration-300 transform hover:scale-105"
              >
                <Trophy size={20} />
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}