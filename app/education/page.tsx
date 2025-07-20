'use client';

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Flame, 
  Star, 
  Target,
  Clock,
  BookOpen,
  TrendingUp,
  Award,
  Zap,
  Brain,
  Timer,
  Play
} from 'lucide-react';

// Demo organization ID for Brilliant Minds Academy
const DEMO_ORG_ID = '803c33bc-add0-4ad8-8d22-9511a049223a';

interface Student {
  id: string;
  name: string;
  age: number;
  targetExam: string;
  currentProgress: number;
  level?: number;
  xp?: number;
  streak?: number;
}

interface ProgressData {
  totalStudyHours: number;
  questionsAttempted: number;
  averageComprehension: number;
  examReadinessScore: number;
  techniqueAnalysis: {
    timeManagement: number;
    commandWordRecognition: number;
    answerStructure: number;
    businessTerminology: number;
  };
}

export default function EducationDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentProgress(selectedStudent.id);
    }
  }, [selectedStudent]);

  const fetchStudents = async () => {
    try {
      const response = await fetch(`/api/education/students?organizationId=${DEMO_ORG_ID}`);
      const data = await response.json();
      
      // Enhance students with gaming data
      const enhancedStudents = data.data?.map((student: any) => ({
        ...student,
        level: Math.floor(student.currentProgress / 10) + 1,
        xp: (student.currentProgress % 10) * 100,
        streak: Math.floor(Math.random() * 14) + 1 // Simulated streak
      })) || [];
      
      setStudents(enhancedStudents);
      if (enhancedStudents.length > 0) {
        // Select "Future Business Leader" by default
        const futureLeader = enhancedStudents.find(s => s.name === 'Future Business Leader') || enhancedStudents[0];
        setSelectedStudent(futureLeader);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentProgress = async (studentId: string) => {
    try {
      const response = await fetch(`/api/education/students/${studentId}/progress`);
      const data = await response.json();
      setProgressData(data.data);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your learning adventure... 🚀</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="p-6 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              🎓 Brilliant Minds Academy
            </h1>
            <p className="text-blue-200 mt-1">Where Learning Becomes an Adventure!</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-blue-200">Welcome back,</div>
              <div className="font-bold text-lg">{selectedStudent?.name || 'Exam Warrior'}</div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl">
              🎯
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Student Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="text-yellow-400" size={24} />
            Choose Your Learning Character
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {students.map((student) => (
              <div
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                  selectedStudent?.id === student.id
                    ? 'bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border-2 border-yellow-400'
                    : 'bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-2xl">
                    {student.name === 'Future Business Leader' ? '🚀' : 
                     student.name === 'Emma Thompson' ? '👩‍🎓' :
                     student.name === 'James Wilson' ? '👨‍💼' : '🎯'}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-blue-200">Level</div>
                    <div className="text-xl font-bold text-yellow-400">{student.level}</div>
                  </div>
                </div>
                <div className="font-semibold text-white">{student.name}</div>
                <div className="text-sm text-blue-200">Age {student.age} • {student.targetExam}</div>
                
                {/* XP Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-blue-200 mb-1">
                    <span>XP Progress</span>
                    <span>{student.xp}/1000</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(student.xp || 0) / 10}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedStudent && progressData && (
          <>
            {/* Gaming Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Level & XP */}
              <div className="bg-gradient-to-br from-yellow-400/20 to-orange-500/20 backdrop-blur-md rounded-xl p-6 border border-yellow-400/30">
                <div className="flex items-center justify-between mb-4">
                  <Trophy className="text-yellow-400" size={32} />
                  <div className="text-right">
                    <div className="text-sm text-yellow-200">Level</div>
                    <div className="text-3xl font-bold text-yellow-400">{selectedStudent.level}</div>
                  </div>
                </div>
                <div className="text-lg font-semibold mb-2">Exam Warrior</div>
                <div className="text-sm text-yellow-200">
                  {1000 - (selectedStudent.xp || 0)} XP to Level {(selectedStudent.level || 0) + 1}
                </div>
              </div>

              {/* Streak */}
              <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-md rounded-xl p-6 border border-red-400/30">
                <div className="flex items-center justify-between mb-4">
                  <Flame className="text-red-400" size={32} />
                  <div className="text-right">
                    <div className="text-sm text-red-200">Day Streak</div>
                    <div className="text-3xl font-bold text-red-400">{selectedStudent.streak}</div>
                  </div>
                </div>
                <div className="text-lg font-semibold mb-2">On Fire! 🔥</div>
                <div className="text-sm text-red-200">Keep it going!</div>
              </div>

              {/* Questions Attempted */}
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md rounded-xl p-6 border border-green-400/30">
                <div className="flex items-center justify-between mb-4">
                  <Target className="text-green-400" size={32} />
                  <div className="text-right">
                    <div className="text-sm text-green-200">Questions</div>
                    <div className="text-3xl font-bold text-green-400">{progressData.questionsAttempted}</div>
                  </div>
                </div>
                <div className="text-lg font-semibold mb-2">Practice Hero</div>
                <div className="text-sm text-green-200">Keep practicing!</div>
              </div>

              {/* Exam Readiness */}
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-xl p-6 border border-purple-400/30">
                <div className="flex items-center justify-between mb-4">
                  <Brain className="text-purple-400" size={32} />
                  <div className="text-right">
                    <div className="text-sm text-purple-200">Readiness</div>
                    <div className="text-3xl font-bold text-purple-400">{progressData.examReadinessScore}%</div>
                  </div>
                </div>
                <div className="text-lg font-semibold mb-2">Almost Ready!</div>
                <div className="text-sm text-purple-200">Keep improving!</div>
              </div>
            </div>

            {/* Skills Progress */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="text-blue-400" size={24} />
                Skill Mastery Progress
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(progressData.techniqueAnalysis).map(([skill, score]) => {
                  const skillName = skill.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                  const color = score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red';
                  
                  return (
                    <div key={skill} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{skillName}</span>
                        <span className={`text-${color}-400 font-bold`}>{score}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-3">
                        <div 
                          className={`bg-gradient-to-r from-${color}-400 to-${color}-500 h-3 rounded-full transition-all duration-1000`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {/* AI Tutor */}
              <button 
                onClick={() => window.location.href = '/education/tutor'}
                className="group bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 p-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 touch-manipulation"
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Brain size={28} />
                  <span>AI Tutor</span>
                </div>
                <div className="text-sm opacity-90">Learn any topic with AI</div>
              </button>

              {/* Start Practice */}
              <button 
                onClick={() => window.location.href = '/education/practice'}
                className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 p-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 touch-manipulation"
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Play size={28} />
                  <span>AI Practice</span>
                </div>
                <div className="text-sm opacity-90">Unlimited AI questions</div>
              </button>

              {/* Timed Challenge */}
              <button 
                onClick={() => window.location.href = '/education/practice'}
                className="group bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 p-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 touch-manipulation"
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Timer size={28} />
                  <span>Timed Challenge</span>
                </div>
                <div className="text-sm opacity-90">Test your speed!</div>
              </button>

              {/* Exam Mode */}
              <button 
                onClick={() => window.location.href = '/education/practice'}
                className="group bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 p-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 touch-manipulation"
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Award size={28} />
                  <span>Exam Mode</span>
                </div>
                <div className="text-sm opacity-90">Real exam simulation</div>
              </button>

              {/* Revision Mode */}
              <button 
                onClick={() => window.location.href = '/education/revision'}
                className="group bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 p-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 touch-manipulation"
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <BookOpen size={28} />
                  <span>Revision Mode</span>
                </div>
                <div className="text-sm opacity-90">Use cached content offline!</div>
              </button>
            </div>

            {/* Recent Achievements */}
            <div className="mt-8 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Star className="text-yellow-400" size={24} />
                Recent Achievements
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-yellow-400/20 rounded-lg">
                  <Trophy className="text-yellow-400" size={20} />
                  <div>
                    <div className="font-semibold">First Answer!</div>
                    <div className="text-sm text-blue-200">Submitted your first practice answer</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-red-400/20 rounded-lg">
                  <Flame className="text-red-400" size={20} />
                  <div>
                    <div className="font-semibold">Week Warrior</div>
                    <div className="text-sm text-blue-200">7-day practice streak!</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-green-400/20 rounded-lg">
                  <Zap className="text-green-400" size={20} />
                  <div>
                    <div className="font-semibold">Speed Master</div>
                    <div className="text-sm text-blue-200">Excellent time management</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}