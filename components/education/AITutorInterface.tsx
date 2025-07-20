'use client';

import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  BookOpen, 
  MessageCircle, 
  Lightbulb, 
  Target,
  CheckCircle,
  Clock,
  Star,
  Zap,
  TrendingUp,
  Award,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

// Edexcel Business A-Level Syllabus
const EDEXCEL_SYLLABUS = {
  "Theme 1": {
    title: "Marketing and People",
    color: "from-blue-500 to-purple-600",
    icon: "👥",
    topics: [
      "Meeting customer needs",
      "The market", 
      "Marketing mix",
      "Managing people",
      "Entrepreneurs and leaders"
    ]
  },
  "Theme 2": {
    title: "Managing Business Activities",
    color: "from-green-500 to-blue-600", 
    icon: "📊",
    topics: [
      "Raising finance",
      "Financial planning",
      "Managing finance", 
      "Resource management",
      "External influences"
    ]
  },
  "Theme 3": {
    title: "Business Decisions and Strategy",
    color: "from-purple-500 to-pink-600",
    icon: "🎯", 
    topics: [
      "Business objectives and strategy",
      "Business growth",
      "Decision-making techniques",
      "Influences on business decisions", 
      "Assessing competitiveness",
      "Managing change"
    ]
  },
  "Theme 4": {
    title: "Global Business", 
    color: "from-orange-500 to-red-600",
    icon: "🌍",
    topics: [
      "Globalisation",
      "Global markets and business expansion",
      "Global marketing",
      "Global industries and companies"
    ]
  }
};

interface AITutorProps {
  studentId: string;
  organizationId: string;
  onTopicSelect?: (topic: string) => void;
}

export default function AITutorInterface({ studentId, organizationId, onTopicSelect }: AITutorProps) {
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [tutorResponse, setTutorResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [studentPerformance, setStudentPerformance] = useState<any>(null);
  const [activeTheme, setActiveTheme] = useState<string>('');

  useEffect(() => {
    // Load student performance data on component mount
    // This would be called when component initializes
  }, [studentId]);

  const handleTopicSelect = async (topic: string) => {
    setSelectedTopic(topic);
    setIsLoading(true);
    setTutorResponse('');

    try {
      const response = await fetch('/api/education/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          organizationId,
          topic,
          type: 'explanation'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setTutorResponse(data.data.tutorResponse);
        setStudentPerformance(data.data.studentPerformance);
        
        if (onTopicSelect) {
          onTopicSelect(topic);
        }
      } else {
        setTutorResponse('Sorry, I couldn\'t provide tutoring for this topic right now. Please try again later.');
      }
    } catch (error) {
      console.error('Error getting AI tutoring:', error);
      setTutorResponse('Sorry, there was an error connecting to the AI tutor. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generatePracticeQuestion = async (topic: string) => {
    try {
      const response = await fetch('/api/education/ai/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          topic,
          marks: 6, // Default to 6-mark question
          studentLevel: studentPerformance?.level || 'intermediate'
        })
      });

      if (response.ok) {
        // Navigate to practice interface or trigger practice mode
        window.location.href = '/education/practice';
      }
    } catch (error) {
      console.error('Error generating practice question:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="text-purple-400" size={48} />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              AI Business Tutor
            </h1>
          </div>
          <p className="text-blue-200 text-lg">
            Master your Edexcel Business A-Level with personalized AI tutoring
          </p>
        </div>

        {/* Syllabus Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <BookOpen className="text-blue-400" size={28} />
            Complete Edexcel Syllabus Coverage
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(EDEXCEL_SYLLABUS).map(([themeKey, theme]) => (
              <div
                key={themeKey}
                className={`p-6 rounded-xl bg-gradient-to-br ${theme.color} bg-opacity-20 border border-white/20 hover:border-white/40 transition-all duration-300 cursor-pointer transform hover:scale-105`}
                onClick={() => setActiveTheme(activeTheme === themeKey ? '' : themeKey)}
              >
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{theme.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{themeKey}</h3>
                  <p className="text-sm text-gray-300">{theme.title}</p>
                </div>
                
                {activeTheme === themeKey && (
                  <div className="mt-4 space-y-2">
                    {theme.topics.map((topic, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTopicSelect(topic);
                        }}
                        className="w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span>{topic}</span>
                          <ArrowRight size={16} />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* AI Tutor Response */}
        {(isLoading || tutorResponse) && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <MessageCircle className="text-green-400" size={24} />
              <h3 className="text-xl font-bold">
                {isLoading ? 'AI Tutor is thinking...' : `Learning: ${selectedTopic}`}
              </h3>
              {isLoading && (
                <RefreshCw className="text-blue-400 animate-spin" size={20} />
              )}
            </div>
            
            {isLoading ? (
              <div className="space-y-3">
                <div className="animate-pulse bg-white/20 h-4 rounded w-3/4"></div>
                <div className="animate-pulse bg-white/20 h-4 rounded w-1/2"></div>
                <div className="animate-pulse bg-white/20 h-4 rounded w-2/3"></div>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-gray-100 leading-relaxed">
                  {tutorResponse}
                </div>
              </div>
            )}

            {!isLoading && tutorResponse && (
              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => generatePracticeQuestion(selectedTopic)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 rounded-lg font-bold transition-all duration-300 transform hover:scale-105"
                >
                  <Target size={20} />
                  <span>Practice This Topic</span>
                </button>
                
                <button
                  onClick={() => setTutorResponse('')}
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-bold transition-colors"
                >
                  <BookOpen size={20} />
                  <span>Choose Another Topic</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Student Performance Summary */}
        {studentPerformance && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="text-blue-400" size={24} />
              Your Progress in {selectedTopic}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {studentPerformance.averageScore}%
                </div>
                <div className="text-sm text-gray-300">Average Score</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {studentPerformance.totalAttempts}
                </div>
                <div className="text-sm text-gray-300">Questions Attempted</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 capitalize">
                  {studentPerformance.level}
                </div>
                <div className="text-sm text-gray-300">Current Level</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400 capitalize">
                  {studentPerformance.recentTrend}
                </div>
                <div className="text-sm text-gray-300">Recent Trend</div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => handleTopicSelect('Marketing mix')}
            className="group p-6 bg-gradient-to-br from-blue-500/20 to-purple-600/20 hover:from-blue-400/30 hover:to-purple-500/30 backdrop-blur-md rounded-xl border border-blue-400/30 transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-center">
              <Lightbulb className="text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform" size={48} />
              <h3 className="text-xl font-bold text-white mb-2">Marketing Mix</h3>
              <p className="text-blue-200">Learn the 4 Ps with real examples</p>
            </div>
          </button>

          <button
            onClick={() => handleTopicSelect('Raising finance')}
            className="group p-6 bg-gradient-to-br from-green-500/20 to-blue-600/20 hover:from-green-400/30 hover:to-blue-500/30 backdrop-blur-md rounded-xl border border-green-400/30 transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-center">
              <Award className="text-green-400 mx-auto mb-4 group-hover:scale-110 transition-transform" size={48} />
              <h3 className="text-xl font-bold text-white mb-2">Business Finance</h3>
              <p className="text-green-200">Master funding and financial planning</p>
            </div>
          </button>

          <button
            onClick={() => handleTopicSelect('Globalisation')}
            className="group p-6 bg-gradient-to-br from-orange-500/20 to-red-600/20 hover:from-orange-400/30 hover:to-red-500/30 backdrop-blur-md rounded-xl border border-orange-400/30 transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-center">
              <Star className="text-orange-400 mx-auto mb-4 group-hover:scale-110 transition-transform" size={48} />
              <h3 className="text-xl font-bold text-white mb-2">Global Business</h3>
              <p className="text-orange-200">Understand international markets</p>
            </div>
          </button>
        </div>

        {/* Pro Tip */}
        <div className="mt-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-md rounded-xl p-6 border border-purple-400/30">
          <div className="flex items-start gap-4">
            <Zap className="text-yellow-400 flex-shrink-0 mt-1" size={24} />
            <div>
              <h4 className="font-bold text-white mb-2">💡 Pro Tip</h4>
              <p className="text-gray-300 text-sm">
                Click on any syllabus theme above to see all topics, then select a specific topic for personalized AI tutoring. 
                The AI will explain concepts using current business examples and provide practice questions tailored to your level!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}