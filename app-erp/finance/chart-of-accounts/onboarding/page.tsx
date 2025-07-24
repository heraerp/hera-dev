/**
 * HERA Finance - Chart of Accounts Onboarding Journey
 * 
 * Designed using Nir Eyal's Hook Model principles
 * Creates immediate habit formation for COA maintenance
 * Establishes triggers, actions, and investments for financial management
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Brain, Search, Target, CheckCircle2, ArrowRight,
  DollarSign, Clock, Sparkles, Trophy, Gift, Star,
  Building, TrendingUp, Shield, Lightbulb, Plus,
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

export default function COAOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [userProgress, setUserProgress] = useState({
    accountsOptimized: 0,
    timeSaved: 0,
    aiConfidence: 0,
    habitsFormed: 0
  });

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to AI Chart of Accounts',
      subtitle: 'Transform financial complexity into organized intelligence',
      description: 'In 60 seconds, you\'ll experience how AI maintains your Chart of Accounts automatically. No more manual account creation, no more classification headaches, no more compliance worries.',
      action: 'See the AI in action',
      reward: 'Immediate "wow" moment + financial anxiety relief',
      trigger: 'COA maintenance anxiety',
      investment: 'Attention and curiosity',
      psychologyNote: 'TRIGGER: Financial complexity anxiety → ACTION: Simple demo → REWARD: Relief + excitement'
    },
    {
      id: 'first-suggestion',
      title: 'Your First AI Suggestion',
      subtitle: 'Accept an intelligent account recommendation',
      description: 'AI has analyzed your business and found an opportunity to optimize your account structure. Watch as one click improves your financial organization.',
      action: 'Accept AI recommendation',
      reward: 'Instant account improvement + "This actually works!" feeling',
      trigger: 'Natural business improvement desire',
      investment: 'First trust decision for AI learning',
      psychologyNote: 'TRIGGER: Improvement opportunity → ACTION: One click → REWARD: Visible enhancement'
    },
    {
      id: 'smart-search',
      title: 'Find Accounts Instantly',
      subtitle: 'Just search "office supplies account"',
      description: 'Try our intelligent account search. Simply type what you\'re looking for and watch AI find the exact account with context and suggestions.',
      action: 'Search for an account',
      reward: 'Lightning-fast results + intelligent context',
      trigger: 'Natural search behavior',
      investment: 'Usage pattern learning for AI',
      psychologyNote: 'TRIGGER: Information need → ACTION: Natural search → REWARD: Instant precise results'
    },
    {
      id: 'pattern-insights',
      title: 'AI Discovers Your Patterns',
      subtitle: 'See what your account usage reveals about your business',
      description: 'Our AI has analyzed your account patterns and found interesting insights. Discover optimization opportunities that improve your financial reporting.',
      action: 'View your account insights',
      reward: 'Business intelligence + feeling of financial mastery',
      trigger: 'Curiosity about business patterns',
      investment: 'Attention to insights builds engagement',
      psychologyNote: 'TRIGGER: Self-discovery curiosity → ACTION: View insights → REWARD: Business revelation'
    },
    {
      id: 'habit-formation',
      title: 'Build Your Financial Routine',
      subtitle: 'Set up triggers for daily account optimization',
      description: 'Choose when and how you want HERA to notify you about account opportunities. Build the habit that successful business owners use for financial clarity.',
      action: 'Choose your optimization schedule',
      reward: 'Control + commitment to financial excellence',
      trigger: 'Personal schedule alignment',
      investment: 'Commitment to habit change',
      psychologyNote: 'TRIGGER: Desire for financial control → ACTION: Set preferences → REWARD: Personalized optimization system'
    }
  ];

  const handleStepComplete = (stepIndex: number) => {
    setCompletedSteps(prev => new Set([...prev, stepIndex]));
    
    // Update progress metrics for gamification
    setUserProgress(prev => ({
      accountsOptimized: prev.accountsOptimized + (stepIndex === 1 ? 1 : 0),
      timeSaved: prev.timeSaved + 15,
      aiConfidence: Math.min(prev.aiConfidence + 18, 100),
      habitsFormed: prev.habitsFormed + 1
    }));

    // Auto-advance to next step
    setTimeout(() => {
      if (stepIndex < onboardingSteps.length - 1) {
        setCurrentStep(stepIndex + 1);
      } else {
        // Complete onboarding, redirect to main COA dashboard
        router.push('/finance/chart-of-accounts?onboarded=true');
      }
    }, 2000);
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Progress Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  HERA Chart of Accounts AI
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Building your financial management habits
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Step {currentStep + 1} of {onboardingSteps.length}
              </div>
              <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-500"
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
              className="w-24 h-24 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg"
            >
              {currentStep === 0 && <Rocket className="w-12 h-12 text-white" />}
              {currentStep === 1 && <Brain className="w-12 h-12 text-white" />}
              {currentStep === 2 && <Search className="w-12 h-12 text-white" />}
              {currentStep === 3 && <TrendingUp className="w-12 h-12 text-white" />}
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
              <p className="text-xl text-indigo-600 dark:text-indigo-400 mb-6">
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
              {currentStep === 1 && <FirstSuggestionDemo onComplete={() => handleStepComplete(1)} />}
              {currentStep === 2 && <SmartSearchDemo onComplete={() => handleStepComplete(2)} />}
              {currentStep === 3 && <PatternInsightsDemo onComplete={() => handleStepComplete(3)} />}
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
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {userProgress.accountsOptimized}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Accounts</div>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {userProgress.timeSaved}m
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Time Saved</div>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {userProgress.aiConfidence}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">AI Accuracy</div>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
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
          See AI COA Management in Action
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Watch a 30-second demo of AI-powered account optimization
        </p>
      </div>
      
      <button
        onClick={handlePlay}
        disabled={isPlaying}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-lg font-semibold flex items-center mx-auto"
      >
        {isPlaying ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing Demo...
          </>
        ) : (
          <>
            <Play className="w-5 h-5 mr-2" />
            Watch COA Demo
          </>
        )}
      </button>
    </div>
  );
}

function FirstSuggestionDemo({ onComplete }: { onComplete: () => void }) {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    setAccepted(true);
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  return (
    <div className="text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Accept Your First AI Suggestion
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          AI recommends consolidating similar expense accounts
        </p>
      </div>
      
      {accepted ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600 mr-2" />
            <span className="text-green-600 font-semibold">Suggestion Applied!</span>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <p className="text-green-800 dark:text-green-200 text-sm">
              ✨ AI merged "Office Supplies" + "Office Materials" → "Office Expenses" • 94% efficiency gain
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
          <div className="text-blue-800 dark:text-blue-200 mb-3">
            <div className="font-semibold">Merge Similar Accounts</div>
            <div className="text-sm">Consolidate "Office Supplies" and "Office Materials" for cleaner reporting</div>
            <div className="text-xs mt-1">94% confidence • Medium impact</div>
          </div>
          <button
            onClick={handleAccept}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center mx-auto"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Accept Suggestion
          </button>
        </div>
      )}
    </div>
  );
}

function SmartSearchDemo({ onComplete }: { onComplete: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCompleted, setSearchCompleted] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.includes('office')) {
      setTimeout(() => {
        setSearchCompleted(true);
        setTimeout(() => onComplete(), 2000);
      }, 1000);
    }
  };

  return (
    <div className="text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Try Intelligent Account Search
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Type "office supplies account" and see AI magic
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for accounts..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-center"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        
        {searchCompleted && (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-left">
            <div className="flex items-center mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-semibold text-green-800 dark:text-green-200">Found: Office Expenses (6210)</span>
            </div>
            <p className="text-green-700 dark:text-green-300 text-sm">
              ✨ Current balance: $3,247.80 • 23 transactions this month • Trending up 12%
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function PatternInsightsDemo({ onComplete }: { onComplete: () => void }) {
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
          <TrendingUp className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Discover Your Account Patterns
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          See what AI has learned about your business structure
        </p>
      </div>
      
      {showInsights ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">23%</div>
            <div className="text-sm text-blue-800 dark:text-blue-200">More efficient than average restaurant</div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">5</div>
            <div className="text-sm text-green-800 dark:text-green-200">Accounts can be optimized further</div>
          </div>
        </div>
      ) : (
        <button
          onClick={handleShowInsights}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center mx-auto"
        >
          <TrendingUp className="w-5 h-5 mr-2" />
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
          Build Your COA Routine
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          When would you like daily account optimization insights?
        </p>
      </div>
      
      {preference ? (
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-green-800 dark:text-green-200">
            Perfect! You'll get COA insights {preference.toLowerCase()}.
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
            onClick={() => handleSetPreference('Midday')}
            className="bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 text-orange-800 dark:text-orange-200 px-4 py-3 rounded-lg hover:from-orange-200 hover:to-orange-300"
          >
            🌅 Midday
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