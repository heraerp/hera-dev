'use client';

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Flame, 
  Star, 
  Zap, 
  Target,
  Clock,
  Brain,
  BookOpen,
  TrendingUp,
  Award,
  Crown,
  Shield,
  Sword,
  Gem,
  Medal,
  CheckCircle,
  Sparkles
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'practice' | 'streak' | 'performance' | 'speed' | 'mastery';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  requirement: {
    type: string;
    value: number;
    current?: number;
  };
  unlocked: boolean;
  unlockedAt?: Date;
}

interface StreakData {
  current: number;
  longest: number;
  lastPracticeDate?: Date;
}

interface AchievementSystemProps {
  studentData: {
    questionsAttempted: number;
    averageScore: number;
    totalStudyTime: number;
    streak: number;
    level: number;
  };
  onAchievementUnlock?: (achievement: Achievement) => void;
}

const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlocked' | 'requirement'>[] = [
  // Practice Achievements
  {
    id: 'first_answer',
    title: 'First Steps',
    description: 'Submit your first practice answer',
    icon: <Star className="w-6 h-6" />,
    category: 'practice',
    rarity: 'common',
    xpReward: 25,
    requirement: { type: 'questions_attempted', value: 1 }
  },
  {
    id: 'practice_warrior',
    title: 'Practice Warrior',
    description: 'Answer 10 practice questions',
    icon: <Sword className="w-6 h-6" />,
    category: 'practice',
    rarity: 'rare',
    xpReward: 100,
    requirement: { type: 'questions_attempted', value: 10 }
  },
  {
    id: 'question_master',
    title: 'Question Master',
    description: 'Answer 50 practice questions',
    icon: <Crown className="w-6 h-6" />,
    category: 'practice',
    rarity: 'epic',
    xpReward: 250,
    requirement: { type: 'questions_attempted', value: 50 }
  },

  // Streak Achievements
  {
    id: 'streak_starter',
    title: 'Getting Hot',
    description: 'Practice for 3 days in a row',
    icon: <Flame className="w-6 h-6" />,
    category: 'streak',
    rarity: 'common',
    xpReward: 50,
    requirement: { type: 'streak', value: 3 }
  },
  {
    id: 'week_warrior',
    title: 'Week Warrior',
    description: 'Practice for 7 days in a row',
    icon: <Shield className="w-6 h-6" />,
    category: 'streak',
    rarity: 'rare',
    xpReward: 150,
    requirement: { type: 'streak', value: 7 }
  },
  {
    id: 'streak_legend',
    title: 'Streak Legend',
    description: 'Practice for 30 days in a row',
    icon: <Trophy className="w-6 h-6" />,
    category: 'streak',
    rarity: 'legendary',
    xpReward: 500,
    requirement: { type: 'streak', value: 30 }
  },

  // Performance Achievements
  {
    id: 'first_perfect',
    title: 'Perfect Score',
    description: 'Get 100% on a practice question',
    icon: <Target className="w-6 h-6" />,
    category: 'performance',
    rarity: 'rare',
    xpReward: 100,
    requirement: { type: 'perfect_score', value: 1 }
  },
  {
    id: 'high_achiever',
    title: 'High Achiever',
    description: 'Maintain 80% average score',
    icon: <TrendingUp className="w-6 h-6" />,
    category: 'performance',
    rarity: 'epic',
    xpReward: 200,
    requirement: { type: 'average_score', value: 80 }
  },

  // Speed Achievements
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Complete a question in record time',
    icon: <Zap className="w-6 h-6" />,
    category: 'speed',
    rarity: 'rare',
    xpReward: 75,
    requirement: { type: 'fast_completion', value: 1 }
  },

  // Mastery Achievements
  {
    id: 'business_expert',
    title: 'Business Expert',
    description: 'Master all business topics',
    icon: <Brain className="w-6 h-6" />,
    category: 'mastery',
    rarity: 'legendary',
    xpReward: 1000,
    requirement: { type: 'topic_mastery', value: 5 }
  }
];

const RARITY_COLORS = {
  common: {
    bg: 'bg-gray-500/20',
    border: 'border-gray-400',
    text: 'text-gray-300',
    glow: 'shadow-gray-400/20'
  },
  rare: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-400',
    text: 'text-blue-300',
    glow: 'shadow-blue-400/20'
  },
  epic: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-400',
    text: 'text-purple-300',
    glow: 'shadow-purple-400/20'
  },
  legendary: {
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-400',
    text: 'text-yellow-300',
    glow: 'shadow-yellow-400/20'
  }
};

export default function AchievementSystem({ studentData, onAchievementUnlock }: AchievementSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    checkAchievements();
  }, [studentData]);

  const checkAchievements = () => {
    const updatedAchievements = ACHIEVEMENT_DEFINITIONS.map(def => {
      let current = 0;
      let unlocked = false;

      switch (def.requirement.type) {
        case 'questions_attempted':
          current = studentData.questionsAttempted;
          unlocked = current >= def.requirement.value;
          break;
        case 'streak':
          current = studentData.streak;
          unlocked = current >= def.requirement.value;
          break;
        case 'average_score':
          current = studentData.averageScore;
          unlocked = current >= def.requirement.value;
          break;
        case 'perfect_score':
          // Simulated - would track from actual data
          current = studentData.averageScore >= 100 ? 1 : 0;
          unlocked = current >= def.requirement.value;
          break;
        case 'fast_completion':
          // Simulated - would track from timing data
          current = studentData.questionsAttempted > 5 ? 1 : 0;
          unlocked = current >= def.requirement.value;
          break;
        case 'topic_mastery':
          // Simulated - would track from topic progress
          current = Math.floor(studentData.level / 2);
          unlocked = current >= def.requirement.value;
          break;
      }

      return {
        ...def,
        requirement: { ...def.requirement, current },
        unlocked,
        unlockedAt: unlocked ? new Date() : undefined
      };
    });

    // Check for new achievements
    const previouslyUnlocked = achievements.filter(a => a.unlocked).map(a => a.id);
    const newlyUnlocked = updatedAchievements.filter(a => 
      a.unlocked && !previouslyUnlocked.includes(a.id)
    );

    if (newlyUnlocked.length > 0) {
      setNewAchievements(newlyUnlocked);
      newlyUnlocked.forEach(achievement => {
        onAchievementUnlock && onAchievementUnlock(achievement);
      });
    }

    setAchievements(updatedAchievements);
  };

  const StreakDisplay = ({ streak }: { streak: number }) => {
    const getStreakIcon = () => {
      if (streak >= 30) return <Crown className="w-8 h-8 text-yellow-400" />;
      if (streak >= 14) return <Trophy className="w-8 h-8 text-orange-400" />;
      if (streak >= 7) return <Flame className="w-8 h-8 text-red-400" />;
      if (streak >= 3) return <Zap className="w-8 h-8 text-blue-400" />;
      return <Star className="w-8 h-8 text-gray-400" />;
    };

    const getStreakTitle = () => {
      if (streak >= 30) return 'Legendary Streak! 👑';
      if (streak >= 14) return 'On Fire! 🔥';
      if (streak >= 7) return 'Hot Streak! 🔥';
      if (streak >= 3) return 'Getting Hot! ⚡';
      return 'Start Your Streak! ⭐';
    };

    return (
      <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-md rounded-xl p-6 border border-red-400/30">
        <div className="flex items-center justify-between mb-4">
          {getStreakIcon()}
          <div className="text-right">
            <div className="text-sm text-red-200">Day Streak</div>
            <div className="text-4xl font-bold text-red-400">{streak}</div>
          </div>
        </div>
        <div className="text-lg font-semibold mb-2">{getStreakTitle()}</div>
        <div className="text-sm text-red-200">
          {streak === 0 ? 'Practice today to start your streak!' : 'Keep it going!'}
        </div>
        
        {/* Streak Progress */}
        <div className="mt-4">
          <div className="grid grid-cols-7 gap-1">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`h-3 rounded-full ${
                  i < (streak % 7) ? 'bg-red-400' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
          <div className="text-xs text-red-200 mt-1 text-center">
            {7 - (streak % 7)} days to next streak milestone
          </div>
        </div>
      </div>
    );
  };

  const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
    const rarity = RARITY_COLORS[achievement.rarity];
    const progress = achievement.requirement.current || 0;
    const target = achievement.requirement.value;
    const progressPercentage = Math.min((progress / target) * 100, 100);

    return (
      <div className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
        achievement.unlocked 
          ? `${rarity.bg} ${rarity.border} ${rarity.glow} shadow-lg scale-105`
          : 'bg-white/5 border-white/20 opacity-60'
      }`}>
        {achievement.unlocked && (
          <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
        )}
        
        <div className="flex items-start gap-3">
          <div className={`${achievement.unlocked ? rarity.text : 'text-gray-500'} flex-shrink-0`}>
            {achievement.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={`font-bold ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
                {achievement.title}
              </h4>
              <span className={`text-xs px-2 py-1 rounded-full ${rarity.bg} ${rarity.text} border ${rarity.border}`}>
                {achievement.rarity}
              </span>
            </div>
            
            <p className={`text-sm mb-3 ${achievement.unlocked ? 'text-gray-300' : 'text-gray-500'}`}>
              {achievement.description}
            </p>
            
            {!achievement.unlocked && (
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{progress} / {target}</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      progressPercentage > 0 ? 'bg-gradient-to-r from-blue-500 to-purple-500' : ''
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className={`text-xs ${achievement.unlocked ? 'text-green-400' : 'text-gray-500'}`}>
                {achievement.unlocked ? 'Unlocked!' : 'Locked'}
              </span>
              <span className="text-xs text-yellow-400 font-bold">
                +{achievement.xpReward} XP
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalXP = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.xpReward, 0);

  return (
    <div className="space-y-6">
      {/* Achievement Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StreakDisplay streak={studentData.streak} />
        
        {/* Total Achievements */}
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-xl p-6 border border-purple-400/30">
          <div className="flex items-center justify-between mb-4">
            <Trophy className="text-purple-400 w-8 h-8" />
            <div className="text-right">
              <div className="text-sm text-purple-200">Achievements</div>
              <div className="text-4xl font-bold text-purple-400">{unlockedCount}</div>
            </div>
          </div>
          <div className="text-lg font-semibold mb-2">Trophy Hunter</div>
          <div className="text-sm text-purple-200">
            {unlockedCount} of {achievements.length} unlocked
          </div>
          
          <div className="mt-4">
            <div className="w-full bg-white/20 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-400 to-pink-500 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* XP Earned */}
        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-md rounded-xl p-6 border border-yellow-400/30">
          <div className="flex items-center justify-between mb-4">
            <Star className="text-yellow-400 w-8 h-8" />
            <div className="text-right">
              <div className="text-sm text-yellow-200">Bonus XP</div>
              <div className="text-4xl font-bold text-yellow-400">{totalXP}</div>
            </div>
          </div>
          <div className="text-lg font-semibold mb-2">XP Master</div>
          <div className="text-sm text-yellow-200">
            From achievements unlocked
          </div>
        </div>
      </div>

      {/* Achievement Categories */}
      <div className="space-y-6">
        {['practice', 'streak', 'performance', 'speed', 'mastery'].map(category => {
          const categoryAchievements = achievements.filter(a => a.category === category);
          const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
          
          return (
            <div key={category}>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Medal className="text-blue-400" size={24} />
                {categoryTitle} Achievements
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryAchievements.map(achievement => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Achievement Unlock Animation
interface AchievementUnlockProps {
  achievement: Achievement;
  onComplete?: () => void;
}

export function AchievementUnlock({ achievement, onComplete }: AchievementUnlockProps) {
  const [visible, setVisible] = useState(true);
  const rarity = RARITY_COLORS[achievement.rarity];

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete && onComplete();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className={`max-w-md mx-4 p-8 rounded-2xl border-2 ${rarity.bg} ${rarity.border} ${rarity.glow} shadow-2xl`}>
        <div className="text-center">
          <div className="text-6xl mb-4">🏆</div>
          <div className="text-2xl font-bold text-white mb-2">Achievement Unlocked!</div>
          
          <div className={`${rarity.text} text-6xl mb-4 animate-bounce`}>
            {achievement.icon}
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">{achievement.title}</h3>
          <p className="text-gray-300 mb-4">{achievement.description}</p>
          
          <div className={`inline-block px-4 py-2 rounded-full ${rarity.bg} ${rarity.border} border`}>
            <span className={`text-sm font-bold ${rarity.text} uppercase`}>
              {achievement.rarity}
            </span>
          </div>
          
          <div className="mt-4 text-yellow-400 font-bold text-lg">
            +{achievement.xpReward} XP Reward!
          </div>
          
          <div className="flex items-center justify-center gap-2 mt-4">
            <Sparkles className="text-yellow-400 animate-pulse" size={20} />
            <span className="text-white">Keep up the incredible work!</span>
            <Sparkles className="text-yellow-400 animate-pulse" size={20} />
          </div>
        </div>
      </div>
    </div>
  );
}