'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Star,
  CheckCircle,
  ArrowRight,
  Brain,
  Zap,
  Phone,
  Calendar,
  Award,
  Shield,
  ChefHat,
  DollarSign,
  TrendingUp,
  Clock,
  Building2,
  Handshake,
  Target,
  Crown,
  AlertTriangle,
  Timer,
  UserCheck,
  BookOpen,
  Lightbulb,
  Calculator,
  FileText,
  TrendingDown,
  PieChart,
  BarChart,
  Lock,
  Eye,
  UserMinus,
  Banknote,
  FileCheck,
  AlertCircle
} from 'lucide-react';

// Beta Partnership Application Form
interface BetaApplicationData {
  restaurantName: string;
  ownerName: string;
  email: string;
  phone: string;
  locations: number;
  biggestChallenge: string;
  currentSystems: string;
  timeline: string;
  scalingPlans: string;
  accountantPreference: string;
}

export default function HeraBetaLanding() {
  const [betaApplication, setBetaApplication] = useState<BetaApplicationData>({
    restaurantName: '',
    ownerName: '',
    email: '',
    phone: '',
    locations: 1,
    biggestChallenge: '',
    currentSystems: '',
    timeline: '',
    scalingPlans: '',
    accountantPreference: ''
  });
  
  const [spotsRemaining, setSpotsRemaining] = useState(27); // Scarcity indicator
  const [isApplicationSubmitted, setIsApplicationSubmitted] = useState(false);
  const [showLongForm, setShowLongForm] = useState(false);

  // Countdown for founder pricing
  const [timeLeft, setTimeLeft] = useState({
    days: 14,
    hours: 7,
    minutes: 23
  });

  // Multi-location savings calculator
  const calculateSavings = (locations: number) => {
    const baseMonthly = 2400; // Per location monthly savings
    const scaleBonus = locations > 1 ? locations * 300 : 0; // Additional savings from scale
    const totalMonthlySavings = (baseMonthly * locations) + scaleBonus;
    const yearlyGroupPurchasing = locations > 2 ? locations * 1200 : 0; // Group purchasing power
    
    return {
      monthly: totalMonthlySavings,
      yearly: totalMonthlySavings * 12 + yearlyGroupPurchasing,
      setupValue: 2500 * locations, // Value of free setup
      migrationValue: 3500 * locations // Value of free data migration
    };
  };

  const savings = calculateSavings(betaApplication.locations);

  // Founder pricing comparison
  const pricingComparison = {
    founderPrice: 199,
    standardPrice: 499,
    enterprisePrice: 899
  };

  // Testimonials focused on multi-location challenges
  const multiLocationTestimonials = [
    {
      name: "Maria Santos",
      restaurant: "Santos Restaurant Group",
      locations: 4,
      quote: "Managing 4 locations was chaos. Different systems, inconsistent reporting, training nightmares. HERA unified everything.",
      challenge: "Inconsistent operations across locations",
      result: "Standardized all locations in 2 weeks"
    },
    {
      name: "David Kim", 
      restaurant: "Seoul Kitchen Chain",
      locations: 7,
      quote: "Our investors wanted consolidated reporting. HERA gave us real-time visibility across all 7 locations.",
      challenge: "Investor reporting complexity",
      result: "Real-time multi-location dashboard"
    },
    {
      name: "Anthony Ricci",
      restaurant: "Ricci's Pizza Empire",
      locations: 12,
      quote: "Staff training used to take weeks per location. Now it's consistent everywhere thanks to HERA's unified system.",
      challenge: "Training inefficiencies across locations", 
      result: "Consistent training across all locations"
    }
  ];

  // Handle beta application submission
  const handleBetaApplication = async () => {
    if (!betaApplication.email || !betaApplication.restaurantName || !betaApplication.ownerName) {
      return;
    }

    // Simulate API call to submit beta application
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsApplicationSubmitted(true);
      setSpotsRemaining(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Application submission failed');
    }
  };

  // Quick qualification form first, then full application
  const QuickQualificationForm = () => (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
      <div className="text-center mb-6">
        <Badge className="bg-blue-600 text-white px-4 py-2 mb-4">
          <Crown className="h-4 w-4 mr-2" />
          Beta Partnership Application
        </Badge>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Apply to Become a Founding Partner
        </h3>
        <p className="text-gray-600">
          Help build the future of restaurant technology • Get exclusive benefits
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            placeholder="Restaurant Name *"
            value={betaApplication.restaurantName}
            onChange={(e) => setBetaApplication(prev => ({ ...prev, restaurantName: e.target.value }))}
            className="border-blue-300 focus:border-blue-500"
          />
          <Input
            placeholder="Owner/Manager Name *"
            value={betaApplication.ownerName}
            onChange={(e) => setBetaApplication(prev => ({ ...prev, ownerName: e.target.value }))}
            className="border-blue-300 focus:border-blue-500"
          />
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            type="email"
            placeholder="Email Address *"
            value={betaApplication.email}
            onChange={(e) => setBetaApplication(prev => ({ ...prev, email: e.target.value }))}
            className="border-blue-300 focus:border-blue-500"
          />
          <Input
            type="tel"
            placeholder="Phone Number"
            value={betaApplication.phone}
            onChange={(e) => setBetaApplication(prev => ({ ...prev, phone: e.target.value }))}
            className="border-blue-300 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How many restaurant locations do you operate? *
          </label>
          <select
            value={betaApplication.locations}
            onChange={(e) => setBetaApplication(prev => ({ ...prev, locations: parseInt(e.target.value) }))}
            className="w-full p-3 border border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
          >
            <option value={1}>1 location</option>
            <option value={2}>2 locations</option>
            <option value={3}>3 locations</option>
            <option value={4}>4 locations</option>
            <option value={5}>5 locations</option>
            <option value={6}>6-10 locations</option>
            <option value={11}>11+ locations</option>
          </select>
        </div>

        {!showLongForm && (
          <Button
            onClick={() => setShowLongForm(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
            size="lg"
          >
            <UserCheck className="h-5 w-5 mr-2" />
            Continue Application
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        )}
      </div>
    </Card>
  );

  // Full partnership application form
  const FullPartnershipForm = () => (
    <Card className="p-6 bg-white border-2 border-blue-200 mt-6">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What's your biggest operational challenge? *
          </label>
          <Textarea
            placeholder="e.g., Managing inventory across multiple locations, inconsistent staff training, manual reporting..."
            value={betaApplication.biggestChallenge}
            onChange={(e) => setBetaApplication(prev => ({ ...prev, biggestChallenge: e.target.value }))}
            className="border-blue-300 focus:border-blue-500"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What systems are you currently using?
          </label>
          <Input
            placeholder="e.g., Toast POS, QuickBooks, manual inventory sheets..."
            value={betaApplication.currentSystems}
            onChange={(e) => setBetaApplication(prev => ({ ...prev, currentSystems: e.target.value }))}
            className="border-blue-300 focus:border-blue-500"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              When would you like to start?
            </label>
            <select
              value={betaApplication.timeline}
              onChange={(e) => setBetaApplication(prev => ({ ...prev, timeline: e.target.value }))}
              className="w-full p-3 border border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select timeline</option>
              <option value="immediately">Immediately</option>
              <option value="1-2weeks">Within 1-2 weeks</option>
              <option value="1month">Within 1 month</option>
              <option value="2-3months">2-3 months</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scaling plans?
            </label>
            <select
              value={betaApplication.scalingPlans}
              onChange={(e) => setBetaApplication(prev => ({ ...prev, scalingPlans: e.target.value }))}
              className="w-full p-3 border border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select plans</option>
              <option value="no-expansion">No expansion planned</option>
              <option value="1-2locations">1-2 new locations this year</option>
              <option value="3-5locations">3-5 new locations this year</option>
              <option value="aggressive">Aggressive expansion (5+ locations)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Accounting Support Preference
          </label>
          <select
            value={betaApplication.accountantPreference}
            onChange={(e) => setBetaApplication(prev => ({ ...prev, accountantPreference: e.target.value }))}
            className="w-full p-3 border border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
          >
            <option value="">Select preference</option>
            <option value="existing-accountant">Work with my existing accountant</option>
            <option value="hera-network">Choose from HERA's CPA network</option>
            <option value="need-recommendation">I need help finding a restaurant CPA</option>
            <option value="have-both">I have an accountant but open to network options</option>
          </select>
          <p className="text-xs text-gray-500 mt-2">
            Either way, you get full accounting support included in your partnership
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Your Beta Partnership Benefits:</h4>
          <div className="grid md:grid-cols-2 gap-2 text-sm text-blue-700">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              No setup charges (${savings.setupValue.toLocaleString()} value)
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Complete data migration included
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Direct access to founders
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Permanent founder pricing ($199/mo vs $499/mo)
            </div>
          </div>
        </div>

        <Button
          onClick={handleBetaApplication}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6"
          size="lg"
          disabled={!betaApplication.restaurantName || !betaApplication.email || !betaApplication.biggestChallenge}
        >
          <Handshake className="h-5 w-5 mr-2" />
          Submit Partnership Application
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Partnership Opportunity + Scarcity */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Scarcity Indicator */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Badge className="bg-red-600 text-white px-6 py-3 text-lg font-bold shadow-lg">
              <Timer className="h-5 w-5 mr-2" />
              Only {spotsRemaining} Beta Partnership Spots Remaining
            </Badge>
          </motion.div>

          {/* Full-Width Hero Section */}
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-800 px-4 py-2 text-sm font-medium mb-8">
              <Crown className="h-4 w-4 mr-2" />
              Exclusive Beta Partnership Program
            </Badge>
            
            <h1 className="text-6xl font-bold text-gray-900 leading-tight mb-6">
              One System.<br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Every Operation.
              </span><br />
              <span className="text-4xl text-gray-700">Complete Control.</span>
            </h1>
            
            <p className="text-2xl text-gray-800 leading-relaxed mb-4 font-medium max-w-4xl mx-auto">
              HERA is the world's first <strong className="text-blue-600">Universal Restaurant Operating System</strong> that runs 
              your entire business from a single, intelligent platform.
            </p>

            <p className="text-xl text-gray-700 leading-relaxed max-w-5xl mx-auto mb-8">
              Imagine managing <strong>inventory, purchasing, staff scheduling, financial reporting, customer orders, 
              kitchen operations, and analytics</strong> from one unified system that learns your business and 
              predicts what you need before you need it.
            </p>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border-l-4 border-amber-400 max-w-4xl mx-auto">
              <p className="text-lg text-gray-800">
                <strong className="text-amber-700">The Reality:</strong> Most restaurants juggle 8-15 different systems. 
                HERA replaces them all with one AI-powered platform that actually talks to itself.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >

                {/* The Transformation */}
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  <div className="bg-red-50 p-6 rounded-xl border-2 border-red-200">
                    <h4 className="text-lg font-bold text-red-800 mb-3 flex items-center">
                      <TrendingDown className="h-5 w-5 mr-2" />
                      Without HERA (The Chaos)
                    </h4>
                    <ul className="text-sm text-red-700 space-y-2">
                      <li>• POS system that doesn't talk to inventory</li>
                      <li>• Manual inventory counts and guesswork ordering</li>
                      <li>• Separate payroll, scheduling, and HR systems</li>
                      <li>• Spreadsheets for financial reporting</li>
                      <li>• Multiple logins, constant switching between apps</li>
                      <li>• Data trapped in silos, no unified insights</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200">
                    <h4 className="text-lg font-bold text-green-800 mb-3 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      With HERA (The Solution)
                    </h4>
                    <ul className="text-sm text-green-700 space-y-2">
                      <li>• One login, one dashboard, complete visibility</li>
                      <li>• AI predicts demand and auto-generates orders</li>
                      <li>• Integrated staff management with smart scheduling</li>
                      <li>• Real-time financial reporting and analytics</li>
                      <li>• Everything connected, talking, and learning</li>
                      <li>• Your accountant gets clean, organized data</li>
                    </ul>
                  </div>
                </div>

                {/* Powerful Closing Statement */}
                <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-8 rounded-xl text-white mt-8">
                  <h3 className="text-2xl font-bold text-center mb-4">
                    This Is What Restaurant Technology Should Have Been All Along
                  </h3>
                  <p className="text-lg text-center text-blue-100 mb-6">
                    Stop wrestling with disconnected systems. Stop losing money to inefficiency. 
                    Stop spending hours on tasks that should take minutes.
                  </p>
                  <div className="text-center">
                    <p className="text-xl font-semibold text-yellow-300 mb-2">
                      HERA learns your restaurant and runs it better than you thought possible.
                    </p>
                    <p className="text-lg text-blue-200">
                      We're inviting 50 forward-thinking operators to help us perfect this vision.
                    </p>
                  </div>
                </div>

                {/* Multi-Location Benefits Highlight */}
                <div className="bg-white p-8 rounded-xl border-2 border-blue-300 shadow-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    <Building2 className="h-6 w-6 mr-3 inline text-blue-600" />
                    Built for Multi-Location Operators
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-3 text-green-600 flex-shrink-0" />
                      <span className="text-gray-800 font-medium">Unified dashboard for all locations</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-3 text-green-600 flex-shrink-0" />
                      <span className="text-gray-800 font-medium">Standardized operations with local flexibility</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-3 text-green-600 flex-shrink-0" />
                      <span className="text-gray-800 font-medium">Group purchasing power</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-3 text-green-600 flex-shrink-0" />
                      <span className="text-gray-800 font-medium">Investor-ready consolidated reporting</span>
                    </div>
                  </div>
                </div>

                {/* Beta Advantages */}
                <div className="bg-white p-6 rounded-xl border-2 border-green-300 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    <Target className="h-6 w-6 mr-2 inline text-green-600" />
                    Why Beta is Better Than "Finished" Products
                  </h3>
                  <div className="space-y-3 text-base">
                    <div className="flex items-center">
                      <Lightbulb className="h-5 w-5 mr-3 text-yellow-600" />
                      <span className="text-gray-800"><strong>Your feedback shapes the product</strong> - influence the roadmap</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-3 text-blue-600" />
                      <span className="text-gray-800"><strong>Partner relationship</strong> - not just another customer</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-3 text-green-600" />
                      <span className="text-gray-800"><strong>Founder pricing locked in</strong> - save $300/month forever</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Partnership Application Form */}
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                {!isApplicationSubmitted ? (
                  <>
                    <QuickQualificationForm />
                    {showLongForm && <FullPartnershipForm />}
                  </>
                ) : (
                  <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 text-center">
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">
                      Application Submitted Successfully!
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Welcome to the HERA founding partner program! Our team will review your application and contact you within 24 hours.
                    </p>
                    <Button
                      onClick={() => window.location.href = 'tel:+1-800-HERA-BETA'}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Speak with Founder Now: 1-800-HERA-BETA
                    </Button>
                  </Card>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Digital Accountant Freedom Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-emerald-400 text-emerald-900 px-6 py-3 text-lg font-bold mb-6">
              <Calculator className="h-5 w-5 mr-2" />
              Revolutionary Digital Accountant
            </Badge>
            <h2 className="text-5xl font-bold text-white mb-6">
              Fire Your In-House Accountant.<br />
              <span className="text-emerald-300">Keep Your Money Safe.</span>
            </h2>
            <p className="text-2xl text-green-100 leading-relaxed max-w-4xl mx-auto">
              HERA's AI Digital Accountant handles all your bookkeeping automatically, with every transaction 
              <strong className="text-emerald-300"> verified and approved by qualified CPAs</strong> – 
              giving you accounting perfection without the payroll expense or fraud risk.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center p-8 bg-green-800/50 backdrop-blur rounded-xl border border-green-700"
            >
              <UserMinus className="h-16 w-16 text-red-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">No More In-House Accountant</h3>
              <p className="text-green-100 text-lg leading-relaxed mb-4">
                Save $60,000-$120,000 annually in salary, benefits, and overhead. 
                HERA's Digital Accountant works 24/7 without vacation, sick days, or human error.
              </p>
              <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4">
                <p className="text-red-300 font-semibold">
                  💰 Average Savings: $90,000/year
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center p-8 bg-green-800/50 backdrop-blur rounded-xl border border-green-700"
            >
              <Banknote className="h-16 w-16 text-yellow-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">100% Automated Postings</h3>
              <p className="text-green-100 text-lg leading-relaxed mb-4">
                Every sale, purchase, payment, and expense automatically posts to the correct accounts. 
                No manual entry, no mistakes, no delays. Your books are always current.
              </p>
              <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4">
                <p className="text-yellow-300 font-semibold">
                  ⚡ Real-time posting, zero errors
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center p-8 bg-green-800/50 backdrop-blur rounded-xl border border-green-700"
            >
              <Shield className="h-16 w-16 text-blue-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">CPA-Verified Every Transaction</h3>
              <p className="text-green-100 text-lg leading-relaxed mb-4">
                Qualified accountants review and approve all postings. Built-in fraud detection flags 
                suspicious activity. Your books are bulletproof and audit-ready.
              </p>
              <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
                <p className="text-blue-300 font-semibold">
                  🔒 Fraud protection + compliance
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final Partnership CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Become a Founding Partner?
          </h2>
          
          <p className="text-xl mb-8 text-blue-100">
            Join an exclusive group of 50 restaurant operators who will shape the future of restaurant technology.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8 text-center">
            <div>
              <div className="text-3xl font-bold text-yellow-300">{spotsRemaining}</div>
              <div className="text-sm text-blue-200">Spots Remaining</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-300">$199/mo</div>
              <div className="text-sm text-blue-200">Founder Pricing (vs $499/mo)</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-300">$0</div>
              <div className="text-sm text-blue-200">Setup & Migration</div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6"
            >
              <Crown className="h-5 w-5 mr-2" />
              Apply for Partnership
            </Button>
            
            <Button
              onClick={() => window.location.href = 'tel:+1-800-HERA-BETA'}
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 text-lg px-8 py-6"
            >
              <Phone className="h-5 w-5 mr-2" />
              Speak with Founder
            </Button>
          </div>
          
          <p className="text-lg text-blue-100 mt-6 font-medium">
            Applications reviewed within 24 hours • No obligation • Partnership-first approach
          </p>
        </div>
      </section>
    </div>
  );
}