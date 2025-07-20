'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Brain, 
  Clock, 
  Star,
  Target,
  TrendingUp,
  RefreshCw,
  Check,
  AlertCircle
} from 'lucide-react';

interface RevisionModeProps {
  studentId: string;
  organizationId: string;
}

interface RevisionContent {
  questions: any[];
  explanations: any[];
  examTips: any[];
  studyPlans: any[];
}

interface RevisionStats {
  totalItems: number;
  byType: {
    questions: number;
    explanations: number;
    examTips: number;
    studyPlans: number;
  };
  byTopic: string[];
  byDifficulty: string[];
  availableMarks: number[];
}

export default function RevisionMode({ studentId, organizationId }: RevisionModeProps) {
  const [revisionContent, setRevisionContent] = useState<RevisionContent | null>(null);
  const [revisionStats, setRevisionStats] = useState<RevisionStats | null>(null);
  const [revisionPlan, setRevisionPlan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [contentType, setContentType] = useState<string>('all');

  useEffect(() => {
    loadRevisionContent();
    loadRevisionPlan();
  }, [organizationId, selectedTopic, contentType]);

  const loadRevisionContent = async () => {
    try {
      const params = new URLSearchParams({
        organizationId,
        contentType,
        ...(selectedTopic && { topic: selectedTopic })
      });

      const response = await fetch(`/api/education/revision?${params}`);
      const data = await response.json();

      if (data.success) {
        setRevisionContent(data.data);
        setRevisionStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading revision content:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRevisionPlan = async () => {
    try {
      const response = await fetch('/api/education/revision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          studentId
        })
      });

      const data = await response.json();
      if (data.success) {
        setRevisionPlan(data.data.revisionPlan || []);
      }
    } catch (error) {
      console.error('Error loading revision plan:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <RefreshCw className="animate-spin" size={24} />
          Loading your revision materials...
        </div>
      </div>
    );
  }

  if (!revisionContent || revisionStats?.totalItems === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-white">
            <AlertCircle className="mx-auto mb-4 text-orange-400" size={64} />
            <h2 className="text-2xl font-bold mb-4">No Revision Content Available</h2>
            <p className="text-blue-200 mb-6">
              Generate some practice content first by using the AI Tutor or Practice modes.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/education/tutor'}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg font-bold hover:from-purple-400 hover:to-pink-500 transition-all"
              >
                Start with AI Tutor
              </button>
              <button
                onClick={() => window.location.href = '/education/practice'}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg font-bold hover:from-green-400 hover:to-emerald-500 transition-all"
              >
                Generate Practice Questions
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="text-green-400" size={48} />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Revision Mode
            </h1>
          </div>
          <p className="text-blue-200 text-lg">
            Review your saved AI-generated content - no internet required!
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <Target className="text-blue-400" size={24} />
              <div className="text-sm text-blue-200">Total Items</div>
            </div>
            <div className="text-3xl font-bold text-white">{revisionStats?.totalItems}</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="text-purple-400" size={24} />
              <div className="text-sm text-purple-200">Questions</div>
            </div>
            <div className="text-3xl font-bold text-white">{revisionStats?.byType.questions}</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="text-green-400" size={24} />
              <div className="text-sm text-green-200">Explanations</div>
            </div>
            <div className="text-3xl font-bold text-white">{revisionStats?.byType.explanations}</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <Star className="text-yellow-400" size={24} />
              <div className="text-sm text-yellow-200">Topics Covered</div>
            </div>
            <div className="text-3xl font-bold text-white">{revisionStats?.byTopic.length}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          >
            <option value="all">All Content</option>
            <option value="question">Questions Only</option>
            <option value="explanation">Explanations Only</option>
            <option value="exam_tips">Exam Tips Only</option>
          </select>

          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          >
            <option value="">All Topics</option>
            {revisionStats?.byTopic.map(topic => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>

          <button
            onClick={loadRevisionContent}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center gap-2 transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Revision Plan */}
        {revisionPlan.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="text-blue-400" size={28} />
              Your Personalized Revision Plan
            </h2>
            
            <div className="grid gap-4">
              {revisionPlan.map((session, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-white">{session.sessionTitle}</h3>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        session.priority === 'high' ? 'bg-red-500/20 text-red-300 border border-red-400/30' :
                        session.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30' :
                        'bg-green-500/20 text-green-300 border border-green-400/30'
                      }`}>
                        {session.priority} priority
                      </span>
                      <div className="flex items-center gap-1 text-blue-200">
                        <Clock size={16} />
                        <span className="text-sm">{session.estimatedMinutes} min</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-blue-200 text-sm mb-3">{session.reason}</p>
                  
                  <div className="text-sm text-gray-300">
                    {session.content.length} items available for this session
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Questions */}
          {revisionContent?.questions && revisionContent.questions.length > 0 && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Brain className="text-purple-400" size={24} />
                Practice Questions ({revisionContent.questions.length})
              </h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {revisionContent.questions.slice(0, 10).map((question, index) => (
                  <div key={question.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                        {question.marks_available || '6'} marks
                      </span>
                      <span className="text-xs text-gray-300">{question.topic_area}</span>
                    </div>
                    <div className="text-sm text-white line-clamp-2">
                      {question.question_text || question.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Explanations */}
          {revisionContent?.explanations && revisionContent.explanations.length > 0 && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BookOpen className="text-green-400" size={24} />
                Topic Explanations ({revisionContent.explanations.length})
              </h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {revisionContent.explanations.slice(0, 10).map((explanation, index) => (
                  <div key={explanation.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                        {explanation.topic_area}
                      </span>
                      <span className="text-xs text-gray-300">{explanation.student_level || 'intermediate'}</span>
                    </div>
                    <div className="text-sm text-white line-clamp-2">
                      {explanation.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cache Info */}
        <div className="mt-8 bg-green-500/10 backdrop-blur-md rounded-xl p-6 border border-green-400/30">
          <div className="flex items-start gap-4">
            <Check className="text-green-400 flex-shrink-0 mt-1" size={24} />
            <div>
              <h4 className="font-bold text-white mb-2">✅ Offline Ready</h4>
              <p className="text-green-200 text-sm">
                All this content is cached locally - you can review it anytime without internet connection or additional AI costs!
                Perfect for last-minute revision sessions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}