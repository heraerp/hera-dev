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
  Lightbulb
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
    scalingPlans: ''
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
            <Badge className="bg-red-100 text-red-800 px-6 py-2 text-lg font-bold">
              <Timer className="h-5 w-5 mr-2" />
              Only {spotsRemaining} Beta Partnership Spots Remaining
            </Badge>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Badge className="bg-blue-100 text-blue-800 px-4 py-2 text-sm font-medium">
                  <Crown className="h-4 w-4 mr-2" />
                  Exclusive Beta Partnership Program
                </Badge>
                
                <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                  Become a Founding Partner in the Restaurant Revolution
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  We're looking for <strong>50 visionary restaurant operators</strong> to co-create the future of restaurant technology. 
                  Get extraordinary value while helping build something bigger than yourself.
                </p>

                {/* Multi-Location Benefits Highlight */}
                <div className="bg-white p-6 rounded-xl border-2 border-blue-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    <Building2 className="h-5 w-5 mr-2 inline" />
                    Built for Multi-Location Operators
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Unified dashboard for all locations
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Standardized operations with local flexibility
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Group purchasing power
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Investor-ready consolidated reporting
                    </div>
                  </div>
                </div>

                {/* Beta Advantages */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    <Target className="h-5 w-5 mr-2 inline" />
                    Why Beta is Better Than "Finished" Products
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Lightbulb className="h-4 w-4 mr-2 text-yellow-600" />
                      <span><strong>Your feedback shapes the product</strong> - influence the roadmap</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-blue-600" />
                      <span><strong>Partner relationship</strong> - not just another customer</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                      <span><strong>Founder pricing locked in</strong> - save $300/month forever</span>
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

      {/* Multi-Location Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Finally, A System Built for Multi-Location Operators
            </h2>
            <p className="text-lg text-gray-600">
              Stop juggling different systems across locations. Unify everything.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center p-6 bg-blue-50 rounded-xl"
            >
              <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Scaling Challenge Solved</h3>
              <p className="text-gray-600 mb-4">
                Maintain consistency across all locations while allowing local flexibility. 
                Standard operations with customized local adaptations.
              </p>
              <Badge className="bg-blue-100 text-blue-800">
                Works for 1-100+ locations
              </Badge>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center p-6 bg-green-50 rounded-xl"
            >
              <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Investor Reporting Made Simple</h3>
              <p className="text-gray-600 mb-4">
                Real-time consolidated reporting across all locations. 
                Give investors the visibility they demand without the manual work.
              </p>
              <Badge className="bg-green-100 text-green-800">
                Real-time dashboards
              </Badge>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center p-6 bg-purple-50 rounded-xl"
            >
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Train Once, Deploy Everywhere</h3>
              <p className="text-gray-600 mb-4">
                Staff training that works consistently across all locations. 
                No more retraining different systems at each restaurant.
              </p>
              <Badge className="bg-purple-100 text-purple-800">
                Unified training system
              </Badge>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Multi-Location Savings Calculator */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Calculate Your Multi-Location Savings
            </h2>
            <p className="text-lg text-gray-600">
              See how much HERA saves across all your locations
            </p>
          </div>
          
          <Card className="p-8 bg-white shadow-lg">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-4">
                  Number of locations:
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={betaApplication.locations}
                    onChange={(e) => setBetaApplication(prev => ({ ...prev, locations: parseInt(e.target.value) }))}
                    className="flex-1"
                  />
                  <div className="text-2xl font-bold text-blue-600 min-w-[60px]">
                    {betaApplication.locations}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Monthly Savings:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${savings.monthly.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Annual Savings:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${savings.yearly.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Beta Setup Value (FREE):</span>
                  <span className="text-xl font-bold text-blue-600">
                    ${savings.setupValue.toLocaleString()}
                  </span>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Total First Year Value</p>
                    <p className="text-3xl font-bold text-yellow-600">
                      ${(savings.yearly + savings.setupValue + savings.migrationValue).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Honest Beta Positioning */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Honest Truth: We're in Beta (And That's Great for You)
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card className="p-6 border-2 border-red-200 bg-red-50">
              <h3 className="text-lg font-semibold text-red-800 mb-4">
                <AlertTriangle className="h-5 w-5 mr-2 inline" />
                What "Beta" Means
              </h3>
              <ul className="text-sm text-red-700 space-y-2 text-left">
                <li>• We're still adding features based on your feedback</li>
                <li>• Some advanced features are coming in the next 3-6 months</li>
                <li>• You'll experience the product evolving with your input</li>
                <li>• We're transparent about what works and what we're improving</li>
              </ul>
            </Card>
            
            <Card className="p-6 border-2 border-green-200 bg-green-50">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                <CheckCircle className="h-5 w-5 mr-2 inline" />
                Why Beta Partners Win
              </h3>
              <ul className="text-sm text-green-700 space-y-2 text-left">
                <li>• Direct influence over product development</li>
                <li>• Founder-level pricing locked in forever</li>
                <li>• White-glove migration and setup (normally $2,500+)</li>
                <li>• Partnership relationship, not vendor-customer</li>
              </ul>
            </Card>
          </div>
          
          <p className="text-lg text-gray-600 mb-8">
            Unlike "finished" products that can't adapt to your needs, HERA evolves with your business. 
            You're not just buying software - you're investing in a partnership.
          </p>
        </div>
      </section>

      {/* Multi-Location Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Multi-Location Operators Love HERA
            </h2>
            <p className="text-lg text-gray-600">
              Real stories from restaurant operators managing multiple locations
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {multiLocationTestimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="p-6 h-full">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400 mr-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      {testimonial.locations} locations
                    </Badge>
                  </div>
                  
                  <blockquote className="text-gray-700 mb-4 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-red-600 font-medium">Challenge: </span>
                      <span className="text-gray-600">{testimonial.challenge}</span>
                    </div>
                    <div>
                      <span className="text-green-600 font-medium">Result: </span>
                      <span className="text-gray-600">{testimonial.result}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <p className="font-semibold text-gray-800">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.restaurant}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Risk Mitigation - No Charges Section */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Zero Risk. Maximum Value. No Catches.
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card className="p-6 bg-blue-800 border-blue-700 text-white">
              <Shield className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">What's Included (FREE)</h3>
              <ul className="text-sm space-y-2 text-left">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                  Complete data migration from existing systems
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                  Full setup and configuration ($2,500+ value)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                  Staff training and onboarding
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                  Direct line to founders for support
                </li>
              </ul>
            </Card>
            
            <Card className="p-6 bg-blue-800 border-blue-700 text-white">
              <Handshake className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">Our Promise to You</h3>
              <ul className="text-sm space-y-2 text-left">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                  No long-term contracts during beta
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                  Cancel anytime with 30 days notice
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                  Your data remains yours, always
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                  Founder pricing locked in for life
                </li>
              </ul>
            </Card>
          </div>
          
          <p className="text-xl text-blue-200 mb-8">
            What's the catch? There isn't one. We need your feedback to build the best possible product. 
            In exchange, you get extraordinary value and influence over the roadmap.
          </p>
        </div>
      </section>

      {/* Founder Access Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Direct Access to the Founders
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Monthly Partner Calls</h3>
              <p className="text-gray-600">
                Direct feedback sessions with founders. Your voice shapes the product roadmap.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Priority Support Line</h3>
              <p className="text-gray-600">
                Direct line to the founding team. Issues get resolved by the people who built the system.
              </p>
            </div>
          </div>
          
          <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              <BookOpen className="h-5 w-5 mr-2 inline" />
              Your Success is Our Success
            </h3>
            <p className="text-gray-600 mb-4">
              As a founding partner, your success directly impacts our success. We're invested in making sure 
              HERA transforms your restaurant operations and drives real ROI.
            </p>
            <p className="text-sm text-gray-500">
              This isn't just software - it's a partnership to revolutionize restaurant technology together.
            </p>
          </Card>
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
              <div className="text-3xl font-bold text-yellow-300">$199</div>
              <div className="text-sm text-blue-200">Founder Pricing (vs $499)</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-300">$0</div>
              <div className="text-sm text-blue-200">Setup & Migration</div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' })}
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
          
          <p className="text-sm text-blue-200 mt-6">
            Applications reviewed within 24 hours • No obligation • Partnership-first approach
          </p>
        </div>
      </section>
    </div>
  );
}