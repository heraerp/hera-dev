'use client';

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Star, 
  Zap, 
  Crown, 
  Shield,
  Sword,
  Gem,
  TrendingUp
} from 'lucide-react';

interface LevelSystemProps {
  currentXP: number;
  currentLevel: number;
  totalXP?: number;
  animate?: boolean;
  size?: 'small' | 'medium' | 'large';
}

interface LevelInfo {
  level: number;
  title: string;
  icon: React.ReactNode;
  xpRequired: number;
  color: string;
  bgColor: string;
  description: string;
}

const LEVEL_DATA: LevelInfo[] = [
  { level: 1, title: 'Learning Explorer', icon: <Star size={20} />, xpRequired: 0, color: 'text-gray-400', bgColor: 'bg-gray-500/20', description: 'Just getting started!' },
  { level: 2, title: 'Knowledge Seeker', icon: <Zap size={20} />, xpRequired: 100, color: 'text-green-400', bgColor: 'bg-green-500/20', description: 'Building foundations' },
  { level: 3, title: 'Study Warrior', icon: <Shield size={20} />, xpRequired: 250, color: 'text-blue-400', bgColor: 'bg-blue-500/20', description: 'Gaining momentum' },
  { level: 4, title: 'Practice Champion', icon: <Sword size={20} />, xpRequired: 450, color: 'text-purple-400', bgColor: 'bg-purple-500/20', description: 'Mastering skills' },
  { level: 5, title: 'Exam Master', icon: <Trophy size={20} />, xpRequired: 700, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', description: 'Nearly exam ready' },
  { level: 6, title: 'Business Legend', icon: <Crown size={20} />, xpRequired: 1000, color: 'text-orange-400', bgColor: 'bg-orange-500/20', description: 'Future business leader' },
  { level: 7, title: 'Elite Scholar', icon: <Gem size={20} />, xpRequired: 1400, color: 'text-pink-400', bgColor: 'bg-pink-500/20', description: 'Top of the class' }
];

const XP_PER_LEVEL = 100;

export default function LevelSystem({ currentXP, currentLevel, totalXP, animate = true, size = 'medium' }: LevelSystemProps) {
  const [animatedXP, setAnimatedXP] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    if (animate) {
      const duration = 1000; // 1 second
      const steps = 60;
      const increment = currentXP / steps;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        setAnimatedXP(Math.min(increment * step, currentXP));
        
        if (step >= steps) {
          clearInterval(timer);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setAnimatedXP(currentXP);
    }
  }, [currentXP, animate]);

  const currentLevelInfo = LEVEL_DATA.find(l => l.level === currentLevel) || LEVEL_DATA[0];
  const nextLevelInfo = LEVEL_DATA.find(l => l.level === currentLevel + 1);
  
  const xpInCurrentLevel = currentXP % XP_PER_LEVEL;
  const xpForNextLevel = XP_PER_LEVEL;
  const progressPercentage = (xpInCurrentLevel / xpForNextLevel) * 100;

  const sizeClasses = {
    small: { ring: 'w-16 h-16', text: 'text-xs', icon: 'text-lg' },
    medium: { ring: 'w-24 h-24', text: 'text-sm', icon: 'text-xl' },
    large: { ring: 'w-32 h-32', text: 'text-base', icon: 'text-2xl' }
  };

  const CircularProgress = ({ percentage, color, size }: { percentage: number; color: string; size: string }) => {
    const radius = size === 'large' ? 60 : size === 'medium' ? 44 : 28;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className={`relative ${sizeClasses[size as keyof typeof sizeClasses].ring}`}>
        <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 144 144">
          {/* Background circle */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-white/20"
          />
          {/* Progress circle */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={color}
            style={{
              transition: 'stroke-dashoffset 1s ease-in-out'
            }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`${currentLevelInfo.color} ${sizeClasses[size as keyof typeof sizeClasses].icon}`}>
              {currentLevelInfo.icon}
            </div>
            <div className={`font-bold text-white ${sizeClasses[size as keyof typeof sizeClasses].text}`}>
              {currentLevel}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Main Level Display */}
      <div className="flex items-center gap-6">
        <CircularProgress 
          percentage={progressPercentage} 
          color={currentLevelInfo.color} 
          size={size}
        />
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`${currentLevelInfo.color} ${sizeClasses[size as keyof typeof sizeClasses].icon}`}>
              {currentLevelInfo.icon}
            </span>
            <h3 className="text-xl font-bold text-white">{currentLevelInfo.title}</h3>
            <span className="text-sm text-gray-300">Level {currentLevel}</span>
          </div>
          
          <p className="text-sm text-gray-400 mb-3">{currentLevelInfo.description}</p>
          
          {/* XP Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">
                {xpInCurrentLevel} / {xpForNextLevel} XP
              </span>
              {nextLevelInfo && (
                <span className="text-gray-400">
                  {xpForNextLevel - xpInCurrentLevel} XP to {nextLevelInfo.title}
                </span>
              )}
            </div>
            
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${currentLevelInfo.bgColor} ${currentLevelInfo.color} transition-all duration-1000 ease-out`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Next Level Preview */}
      {nextLevelInfo && size !== 'small' && (
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className={`${nextLevelInfo.color} text-lg`}>
              {nextLevelInfo.icon}
            </div>
            <div>
              <div className="font-semibold text-white">Next: {nextLevelInfo.title}</div>
              <div className="text-sm text-gray-400">{nextLevelInfo.description}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-sm text-gray-400">Level {nextLevelInfo.level}</div>
              <div className="text-xs text-gray-500">{xpForNextLevel - xpInCurrentLevel} XP needed</div>
            </div>
          </div>
        </div>
      )}

      {/* Level Milestones */}
      {size === 'large' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {LEVEL_DATA.slice(0, 8).map((levelInfo) => {
            const isUnlocked = currentLevel >= levelInfo.level;
            const isCurrent = currentLevel === levelInfo.level;
            
            return (
              <div
                key={levelInfo.level}
                className={`p-3 rounded-lg border transition-all duration-300 ${
                  isCurrent 
                    ? `${levelInfo.bgColor} border-2 ${levelInfo.color.replace('text-', 'border-')} scale-105` 
                    : isUnlocked 
                      ? 'bg-white/10 border-white/20 hover:bg-white/15' 
                      : 'bg-white/5 border-white/10 opacity-50'
                }`}
              >
                <div className="text-center">
                  <div className={`${isUnlocked ? levelInfo.color : 'text-gray-500'} text-lg mb-1`}>
                    {levelInfo.icon}
                  </div>
                  <div className={`text-xs font-medium ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                    Level {levelInfo.level}
                  </div>
                  <div className={`text-xs ${isUnlocked ? 'text-gray-300' : 'text-gray-600'}`}>
                    {levelInfo.title.split(' ')[0]}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// XP Gain Animation Component
interface XPGainProps {
  amount: number;
  onComplete?: () => void;
}

export function XPGainAnimation({ amount, onComplete }: XPGainProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete && onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg animate-bounce">
        +{amount} XP
      </div>
    </div>
  );
}

// Level Up Animation Component
interface LevelUpProps {
  newLevel: number;
  newTitle: string;
  onComplete?: () => void;
}

export function LevelUpAnimation({ newLevel, newTitle, onComplete }: LevelUpProps) {
  const [visible, setVisible] = useState(true);

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
      <div className="text-center">
        <div className="text-8xl animate-pulse mb-4">🎉</div>
        <div className="text-6xl font-bold text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text mb-4 animate-bounce">
          LEVEL UP!
        </div>
        <div className="text-3xl text-white mb-2">Level {newLevel}</div>
        <div className="text-xl text-gray-300 mb-6">{newTitle}</div>
        <div className="flex items-center justify-center gap-2">
          <Star className="text-yellow-400 animate-spin" size={24} />
          <span className="text-lg text-white">You're becoming unstoppable!</span>
          <Star className="text-yellow-400 animate-spin" size={24} />
        </div>
      </div>
    </div>
  );
}