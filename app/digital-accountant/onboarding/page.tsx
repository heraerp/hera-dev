/**
 * HERA Digital Accountant - Behavioral Onboarding Journey
 * 
 * Designed using Nir Eyal's Hook Model principles
 * Creates immediate habit formation through progressive rewards
 * Establishes triggers, actions, and investments for long-term engagement
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Mic, Brain, Zap, Target, CheckCircle2, ArrowRight,
  DollarSign, Clock, Sparkles, Trophy, Gift, Star,
  ChefHat, Receipt, TrendingUp, Shield, Lightbulb,
  Play, Volume2, Heart, Award, Users, Rocket
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  action: string;
  reward: string;
  trigger: string;
  investment: string;
  psychologyNote: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [userProgress, setUserProgress] = useState({
    receiptsProcessed: 0,
    timesSaved: 0,
    aiConfidence: 0,
    habitsFormed: 0
  });

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Your AI Accountant',
      subtitle: 'Transform financial chaos into organized intelligence',
      description: 'In 60 seconds, you\'ll experience the future of expense management. No more manual entry, no more lost receipts, no more late-night accounting.',
      action: 'Watch the magic happen',
      reward: 'Immediate "wow" moment + time anxiety relief',
      trigger: 'Onboarding completion anxiety',
      investment: 'Attention and curiosity',
      psychologyNote: 'TRIGGER: Anxiety about complexity → ACTION: Simple demo → REWARD: Relief + excitement'
    },
    {
      id: 'first-capture',
      title: 'Your First Receipt',
      subtitle: 'Snap a photo and watch AI work its magic',
      description: 'Take a photo of any receipt (even a sample). Watch as our AI instantly extracts vendor, amount, category, and creates a perfect transaction.',
      action: 'Capture your first receipt',
      reward: 'Instant processing + "This actually works!" feeling',
      trigger: 'Natural smartphone behavior',
      investment: 'First data point for AI learning',
      psychologyNote: 'TRIGGER: Familiar camera action → ACTION: One tap → REWARD: AI magic moment'
    },
    {
      id: 'voice-command',
      title: 'Speak Your Expenses',
      subtitle: 'Just say "Post $15 coffee expense"',
      description: 'Try our voice command feature. Simply speak your expense and watch it get automatically categorized and posted to your books.',
      action: 'Say an expense out loud',
      reward: 'Hands-free convenience + futuristic feeling',
      trigger: 'Natural speech pattern',
      investment: 'Voice pattern learning for AI',
      psychologyNote: 'TRIGGER: Convenience desire → ACTION: Natural speech → REWARD: Effortless completion'
    },
    {
      id: 'ai-insights',
      title: 'AI Discovers Your Patterns',
      subtitle: 'See what your spending reveals about your business',
      description: 'Our AI has already analyzed your data and found interesting patterns. Discover insights that help you make better business decisions.',
      action: 'View your first AI insights',
      reward: 'Business intelligence + feeling of understanding',
      trigger: 'Curiosity about personal patterns',
      investment: 'Attention to insights builds engagement',
      psychologyNote: 'TRIGGER: Self-discovery curiosity → ACTION: View insights → REWARD: Personal revelation'
    },
    {
      id: 'habit-formation',
      title: 'Build Your Money Habit',
      subtitle: 'Set up triggers for daily financial awareness',
      description: 'Choose when and how you want HERA to remind you about your finances. Build the habit that successful business owners use.',
      action: 'Choose your reminder preferences',
      reward: 'Control + commitment to improvement',
      trigger: 'Personal schedule alignment',
      investment: 'Commitment to behavior change',
      psychologyNote: 'TRIGGER: Desire for control → ACTION: Set preferences → REWARD: Personalized system'
    }
  ];

  const handleStepComplete = (stepIndex: number) => {
    setCompletedSteps(prev => new Set([...prev, stepIndex]));
    
    // Update progress metrics for gamification
    setUserProgress(prev => ({
      receiptsProcessed: prev.receiptsProcessed + (stepIndex === 1 ? 1 : 0),
      timesSaved: prev.timesSaved + 5,
      aiConfidence: Math.min(prev.aiConfidence + 20, 100),
      habitsFormed: prev.habitsFormed + 1
    }));

    // Auto-advance to next step
    setTimeout(() => {
      if (stepIndex < onboardingSteps.length - 1) {
        setCurrentStep(stepIndex + 1);
      } else {
        // Complete onboarding, redirect to main dashboard
        router.push('/digital-accountant?onboarded=true');
      }
    }, 2000);
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Progress Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  HERA Digital Accountant
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Building your financial habits
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Step {currentStep + 1} of {onboardingSteps.length}
              </div>
              <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Onboarding Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Step Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg"
            >
              {currentStep === 0 && <Rocket className="w-12 h-12 text-white" />}
              {currentStep === 1 && <Camera className="w-12 h-12 text-white" />}
              {currentStep === 2 && <Mic className="w-12 h-12 text-white" />}
              {currentStep === 3 && <Brain className="w-12 h-12 text-white" />}
              {currentStep === 4 && <Target className="w-12 h-12 text-white" />}
            </motion.div>

            {/* Step Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-12"
            >
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {currentStepData.title}
              </h2>
              <p className="text-xl text-blue-600 dark:text-blue-400 mb-6">
                {currentStepData.subtitle}
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                {currentStepData.description}
              </p>
            </motion.div>

            {/* Interactive Step Component */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 max-w-2xl mx-auto"
            >
              {/* Step-specific interactive content */}
              {currentStep === 0 && <WelcomeDemo onComplete={() => handleStepComplete(0)} />}
              {currentStep === 1 && <FirstCaptureDemo onComplete={() => handleStepComplete(1)} />}
              {currentStep === 2 && <VoiceCommandDemo onComplete={() => handleStepComplete(2)} />}
              {currentStep === 3 && <AIInsightsDemo onComplete={() => handleStepComplete(3)} />}
              {currentStep === 4 && <HabitFormationDemo onComplete={() => handleStepComplete(4)} />}
            </motion.div>

            {/* Progress Gamification */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto"
            >
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {userProgress.receiptsProcessed}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Receipts</div>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {userProgress.timesSaved}m
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Time Saved</div>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {userProgress.aiConfidence}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">AI Accuracy</div>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {userProgress.habitsFormed}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Habits</div>
              </div>
            </motion.div>

            {/* Behavioral Psychology Insight */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
              className="mt-8 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800 max-w-2xl mx-auto"
            >
              <div className="flex items-center mb-2">
                <Lightbulb className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                <span className="font-semibold text-indigo-800 dark:text-indigo-200">Behavioral Design</span>
              </div>
              <p className="text-sm text-indigo-700 dark:text-indigo-300">
                {currentStepData.psychologyNote}
              </p>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Individual step components for interactive demos
function WelcomeDemo({ onComplete }: { onComplete: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
    // Simulate demo playback
    setTimeout(() => {
      onComplete();
    }, 3000);
  };

  return (
    <div className="text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Play className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          See HERA in Action
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Watch a 30-second demo of AI-powered receipt processing
        </p>
      </div>
      
      <button
        onClick={handlePlay}
        disabled={isPlaying}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-lg font-semibold flex items-center mx-auto"
      >
        {isPlaying ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing Demo...
          </>
        ) : (
          <>
            <Play className="w-5 h-5 mr-2" />
            Watch Demo
          </>
        )}
      </button>
    </div>
  );
}

function FirstCaptureDemo({ onComplete }: { onComplete: () => void }) {
  const [captured, setCaptured] = useState(false);

  const handleCapture = () => {
    setCaptured(true);
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  return (
    <div className="text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Camera className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Snap Your First Receipt
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Use any receipt - even an old one from your wallet
        </p>
      </div>
      
      {captured ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600 mr-2" />
            <span className="text-green-600 font-semibold">Receipt Captured!</span>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <p className="text-green-800 dark:text-green-200 text-sm">
              ✨ AI extracted: Starbucks • $4.50 • Food & Beverage • 98% confidence
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={handleCapture}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center mx-auto"
        >
          <Camera className="w-5 h-5 mr-2" />
          Take Photo
        </button>
      )}
    </div>
  );
}

function VoiceCommandDemo({ onComplete }: { onComplete: () => void }) {
  const [listening, setListening] = useState(false);
  const [command, setCommand] = useState('');

  const handleVoiceTest = () => {
    setListening(true);
    setCommand('');
    
    // Simulate voice recognition
    setTimeout(() => {
      setCommand('Post $15 coffee expense');
    }, 1500);
    
    setTimeout(() => {
      setListening(false);
      onComplete();
    }, 3000);
  };

  return (
    <div className="text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mic className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Try Voice Commands
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Say something like "Post $15 coffee expense"
        </p>
      </div>
      
      {listening ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-green-600 font-semibold">Listening...</span>
          </div>
          {command && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-blue-800 dark:text-blue-200">
                "{command}"
              </p>
              <p className="text-green-600 text-sm mt-2">
                ✅ Transaction created automatically!
              </p>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={handleVoiceTest}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center mx-auto"
        >
          <Mic className="w-5 h-5 mr-2" />
          Try Voice Command
        </button>
      )}
    </div>
  );
}

function AIInsightsDemo({ onComplete }: { onComplete: () => void }) {
  const [showInsights, setShowInsights] = useState(false);

  const handleShowInsights = () => {
    setShowInsights(true);
    setTimeout(() => {
      onComplete();
    }, 3000);
  };

  return (
    <div className="text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Discover AI Insights
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          See what patterns AI has already found in your spending
        </p>
      </div>
      
      {showInsights ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">$47</div>
            <div className="text-sm text-blue-800 dark:text-blue-200">Weekly coffee average</div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">15%</div>
            <div className="text-sm text-green-800 dark:text-green-200">Under budget this month</div>
          </div>
        </div>
      ) : (
        <button
          onClick={handleShowInsights}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center mx-auto"
        >
          <Brain className="w-5 h-5 mr-2" />
          Show My Insights
        </button>
      )}
    </div>
  );
}

function HabitFormationDemo({ onComplete }: { onComplete: () => void }) {
  const [preference, setPreference] = useState('');

  const handleSetPreference = (pref: string) => {
    setPreference(pref);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  return (
    <div className="text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Build Your Financial Habit
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          When would you like daily financial insights?
        </p>
      </div>
      
      {preference ? (
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-green-800 dark:text-green-200">
            Perfect! You'll get insights {preference.toLowerCase()}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => handleSetPreference('Morning')}
            className="bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 text-blue-800 dark:text-blue-200 px-4 py-3 rounded-lg hover:from-blue-200 hover:to-blue-300"
          >
            ☀️ Morning
          </button>
          <button
            onClick={() => handleSetPreference('Afternoon')}
            className="bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 text-orange-800 dark:text-orange-200 px-4 py-3 rounded-lg hover:from-orange-200 hover:to-orange-300"
          >
            🌅 Afternoon
          </button>
          <button
            onClick={() => handleSetPreference('Evening')}
            className="bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 text-purple-800 dark:text-purple-200 px-4 py-3 rounded-lg hover:from-purple-200 hover:to-purple-300"
          >
            🌙 Evening
          </button>
        </div>
      )}
    </div>
  );
}