'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PracticeInterface from '@/components/education/PracticeInterface';
import LevelSystem, { XPGainAnimation, LevelUpAnimation } from '@/components/education/LevelSystem';
import AchievementSystem, { AchievementUnlock } from '@/components/education/AchievementSystem';
import { 
  ArrowLeft, 
  Trophy, 
  Target,
  Clock,
  Brain,
  Star,
  Zap
} from 'lucide-react';

// Demo organization and student IDs
const DEMO_ORG_ID = '803c33bc-add0-4ad8-8d22-9511a049223a';
const DEMO_STUDENT_ID = '60f7e16a-65c2-4ee9-b206-24110a1b9983'; // Future Business Leader

interface PracticeResult {
  submissionId: string;
  estimatedMarks: number;
  maxMarks: number;
  percentage: number;
  aiFeedback: any;
}

export default function PracticePage() {
  const router = useRouter();
  const [mode, setMode] = useState<'dashboard' | 'practice' | 'results'>('dashboard');
  const [practiceResult, setPracticeResult] = useState<PracticeResult | null>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [showXPGain, setShowXPGain] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState<any>(null);
  const [showAchievement, setShowAchievement] = useState(false);
  const [newAchievement, setNewAchievement] = useState<any>(null);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const [studentResponse, progressResponse] = await Promise.all([
        fetch(`/api/education/students/${DEMO_STUDENT_ID}`),
        fetch(`/api/education/students/${DEMO_STUDENT_ID}/progress`)
      ]);

      const studentData = await studentResponse.json();
      const progressData = await progressResponse.json();

      const enhancedData = {
        ...studentData.data,
        ...progressData.data,
        level: Math.floor((progressData.data?.questionsAttempted || 0) / 10) + 1,
        xp: ((progressData.data?.questionsAttempted || 0) % 10) * 100,
        streak: Math.floor(Math.random() * 14) + 1, // Simulated
      };

      setStudentData(enhancedData);
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  const handlePracticeComplete = (result: PracticeResult) => {
    setPracticeResult(result);
    
    // Calculate XP gain
    const baseXP = 20;
    const performanceBonus = Math.round((result.percentage / 100) * 30);
    const totalXP = baseXP + performanceBonus;
    
    setXpGained(totalXP);
    setShowXPGain(true);
    
    // Check for level up
    if (studentData) {
      const newTotalXP = studentData.xp + totalXP;
      const currentLevel = studentData.level;
      const newLevel = Math.floor(newTotalXP / 1000) + 1;
      
      if (newLevel > currentLevel) {
        setLevelUpData({
          newLevel,
          newTitle: `Level ${newLevel} Expert`
        });
        setShowLevelUp(true);
      }
    }
    
    setMode('results');
    
    // Refresh student data
    setTimeout(() => {
      fetchStudentData();
    }, 1000);
  };

  const handleAchievementUnlock = (achievement: any) => {
    setNewAchievement(achievement);
    setShowAchievement(true);
  };

  const startPractice = () => {
    setMode('practice');
    setPracticeResult(null);
  };

  const backToDashboard = () => {
    setMode('dashboard');
    setPracticeResult(null);
  };

  if (mode === 'practice') {
    return (
      <>
        {/* Animations */}
        {showXPGain && (
          <XPGainAnimation 
            amount={xpGained} 
            onComplete={() => setShowXPGain(false)} 
          />
        )}
        
        {showLevelUp && levelUpData && (
          <LevelUpAnimation 
            newLevel={levelUpData.newLevel}
            newTitle={levelUpData.newTitle}
            onComplete={() => setShowLevelUp(false)} 
          />
        )}
        
        {showAchievement && newAchievement && (
          <AchievementUnlock 
            achievement={newAchievement}
            onComplete={() => setShowAchievement(false)} 
          />
        )}

        <div className="fixed top-4 left-4 z-40">
          <button
            onClick={backToDashboard}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg border border-white/20 text-white transition-all duration-300"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
        </div>

        <PracticeInterface 
          studentId={DEMO_STUDENT_ID}
          organizationId={DEMO_ORG_ID}
          onComplete={handlePracticeComplete}
        />
      </>
    );
  }

  if (mode === 'results' && practiceResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        {/* Animations */}
        {showXPGain && (
          <XPGainAnimation 
            amount={xpGained} 
            onComplete={() => setShowXPGain(false)} 
          />
        )}
        
        {showLevelUp && levelUpData && (
          <LevelUpAnimation 
            newLevel={levelUpData.newLevel}
            newTitle={levelUpData.newTitle}
            onComplete={() => setShowLevelUp(false)} 
          />
        )}
        
        {showAchievement && newAchievement && (
          <AchievementUnlock 
            achievement={newAchievement}
            onComplete={() => setShowAchievement(false)} 
          />
        )}

        <div className="max-w-6xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={backToDashboard}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg border border-white/20 transition-all duration-300"
            >
              <ArrowLeft size={20} />
              <span>Dashboard</span>
            </button>
            
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              🎉 Practice Complete!
            </h1>
          </div>

          {/* Results Display */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Score & Feedback */}
            <div className="space-y-6">
              {/* Main Score */}
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-xl p-8 border border-purple-400/30 text-center">
                <div className="text-8xl font-bold text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text mb-4">
                  {practiceResult.percentage}%
                </div>
                <div className="text-2xl font-bold text-white mb-2">
                  {practiceResult.estimatedMarks} / {practiceResult.maxMarks} marks
                </div>
                <div className="text-lg text-purple-200">
                  +{xpGained} XP Earned! 🌟
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 text-center">
                  <Brain className="text-purple-400 mx-auto mb-2" size={24} />
                  <div className="text-sm text-gray-300">Technique</div>
                  <div className="text-xl font-bold text-purple-400">
                    {practiceResult.aiFeedback?.technique_score || 0}/10
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 text-center">
                  <Clock className="text-green-400 mx-auto mb-2" size={24} />
                  <div className="text-sm text-gray-300">Speed</div>
                  <div className="text-lg font-bold text-green-400">Good</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 text-center">
                  <Target className="text-blue-400 mx-auto mb-2" size={24} />
                  <div className="text-sm text-gray-300">Confidence</div>
                  <div className="text-xl font-bold text-blue-400">
                    {practiceResult.aiFeedback?.confidence || 0}%
                  </div>
                </div>
              </div>

              {/* AI Feedback */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="bg-green-500/10 backdrop-blur-md rounded-xl p-6 border border-green-400/30">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="text-green-400" size={20} />
                    <span className="font-bold">Strengths</span>
                  </div>
                  
                  {practiceResult.aiFeedback?.strengths?.length > 0 ? (
                    <ul className="space-y-2">
                      {practiceResult.aiFeedback.strengths.map((strength: string, index: number) => (
                        <li key={index} className="text-sm text-green-200">• {strength}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-green-200">Keep practicing to unlock strengths!</p>
                  )}
                </div>

                {/* Improvements */}
                <div className="bg-orange-500/10 backdrop-blur-md rounded-xl p-6 border border-orange-400/30">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="text-orange-400" size={20} />
                    <span className="font-bold">Level Up Tips</span>
                  </div>
                  
                  {practiceResult.aiFeedback?.improvements?.length > 0 ? (
                    <ul className="space-y-2">
                      {practiceResult.aiFeedback.improvements.slice(0, 3).map((improvement: string, index: number) => (
                        <li key={index} className="text-sm text-orange-200">• {improvement}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-orange-200">Excellent work!</p>
                  )}
                </div>
              </div>
            </div>

            {/* Progress & Next Steps */}
            <div className="space-y-6">
              {/* Level Progress */}
              {studentData && (
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Trophy className="text-yellow-400" size={24} />
                    Your Progress
                  </h3>
                  
                  <LevelSystem 
                    currentXP={studentData.xp + xpGained}
                    currentLevel={studentData.level}
                    size="medium"
                    animate={true}
                  />
                </div>
              )}

              {/* Next Actions */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold mb-4">What's Next?</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={startPractice}
                    className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 rounded-lg font-bold transition-all duration-300 transform hover:scale-105"
                  >
                    <Target size={24} />
                    <span>Practice Another Question</span>
                  </button>
                  
                  <button
                    onClick={() => router.push('/education')}
                    className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 rounded-lg font-bold transition-all duration-300 transform hover:scale-105"
                  >
                    <Trophy size={24} />
                    <span>View Full Dashboard</span>
                  </button>
                </div>

                {/* Quick Stats */}
                <div className="mt-6 pt-6 border-t border-white/20">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-400">{studentData?.questionsAttempted || 0}</div>
                      <div className="text-sm text-gray-300">Questions Attempted</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-400">{studentData?.examReadinessScore || 0}%</div>
                      <div className="text-sm text-gray-300">Exam Ready</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Mode
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              🚀 Practice Arena
            </h1>
            <p className="text-blue-200 mt-2">Master your exam skills through gamified practice!</p>
          </div>
          
          <button
            onClick={() => router.push('/education')}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg border border-white/20 transition-all duration-300"
          >
            <ArrowLeft size={20} />
            <span>Back to Education</span>
          </button>
        </div>

        {/* Student Progress Overview */}
        {studentData && (
          <div className="mb-8">
            <LevelSystem 
              currentXP={studentData.xp || 0}
              currentLevel={studentData.level || 1}
              size="large"
              animate={true}
            />
          </div>
        )}

        {/* Quick Practice Modes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={startPractice}
            className="group p-8 bg-gradient-to-br from-green-500/20 to-emerald-600/20 hover:from-green-400/30 hover:to-emerald-500/30 backdrop-blur-md rounded-xl border border-green-400/30 transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-center">
              <Target className="text-green-400 mx-auto mb-4 group-hover:scale-110 transition-transform" size={48} />
              <h3 className="text-2xl font-bold text-white mb-2">Quick Practice</h3>
              <p className="text-green-200">Random question to keep skills sharp</p>
              <div className="mt-4 text-sm text-green-300">5-10 minutes • Any difficulty</div>
            </div>
          </button>

          <button
            onClick={startPractice}
            className="group p-8 bg-gradient-to-br from-orange-500/20 to-red-600/20 hover:from-orange-400/30 hover:to-red-500/30 backdrop-blur-md rounded-xl border border-orange-400/30 transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-center">
              <Clock className="text-orange-400 mx-auto mb-4 group-hover:scale-110 transition-transform" size={48} />
              <h3 className="text-2xl font-bold text-white mb-2">Timed Challenge</h3>
              <p className="text-orange-200">Race against the clock</p>
              <div className="mt-4 text-sm text-orange-300">3-5 minutes • Speed focused</div>
            </div>
          </button>

          <button
            onClick={startPractice}
            className="group p-8 bg-gradient-to-br from-purple-500/20 to-pink-600/20 hover:from-purple-400/30 hover:to-pink-500/30 backdrop-blur-md rounded-xl border border-purple-400/30 transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-center">
              <Brain className="text-purple-400 mx-auto mb-4 group-hover:scale-110 transition-transform" size={48} />
              <h3 className="text-2xl font-bold text-white mb-2">AI Targeted</h3>
              <p className="text-purple-200">Focus on weak areas</p>
              <div className="mt-4 text-sm text-purple-300">10-15 minutes • Personalized</div>
            </div>
          </button>
        </div>

        {/* Achievement System */}
        {studentData && (
          <AchievementSystem 
            studentData={{
              questionsAttempted: studentData.questionsAttempted || 0,
              averageScore: studentData.averageComprehension || 0,
              totalStudyTime: studentData.totalStudyHours || 0,
              streak: studentData.streak || 0,
              level: studentData.level || 1
            }}
            onAchievementUnlock={handleAchievementUnlock}
          />
        )}
      </div>
    </div>
  );
}