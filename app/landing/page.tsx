'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ValueDemonstration } from '@/components/restaurant/ValueDemonstration';
import { TrustBuilders } from '@/components/restaurant/TrustBuilders';
import { useFeedback } from '@/components/ui/enhanced-feedback';
import { LeadCaptureForm } from '@/components/marketing/lead-capture-form';
import { SocialProofEngine } from '@/components/marketing/social-proof-engine';
import { useABTest } from '@/components/marketing/ab-test-provider';
import { useConversionTracking } from '@/lib/analytics/conversion-tracking';
import { 
  DollarSign, 
  TrendingUp, 
  Leaf, 
  Clock, 
  Users, 
  Star,
  Play,
  CheckCircle,
  ArrowRight,
  Brain,
  Zap,
  Phone,
  Calendar,
  Award,
  Shield,
  ChefHat,
  Coffee,
  Pizza,
  BarChart3
} from 'lucide-react';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  const { success, error } = useFeedback();
  const { track, trackFunnelStep } = useConversionTracking();
  
  // A/B Test configurations
  const landingPageTest = useABTest('landing_page_optimization');
  const formTest = useABTest('form_optimization');
  const ctaTest = useABTest('cta_optimization');
  
  // Get A/B test configurations with fallbacks
  const heroTitle = landingPageTest.getConfig('heroTitle', 'Save $2,400/Month with AI-Powered Restaurant Management');
  const ctaColor = ctaTest.getConfig('ctaColor', 'orange');
  const ctaText = ctaTest.getConfig('ctaText', 'Start Free Trial');
  const socialProofStyle = landingPageTest.getConfig('socialProofStyle', 'testimonials');
  const urgencyLevel = landingPageTest.getConfig('urgencyLevel', 'low');

  const testimonials = [
    {
      name: "Tony Marinelli",
      restaurant: "Tony's Pizza Kitchen",
      quote: "HERA cut our food costs by 28% in just 3 weeks. ROI was immediate!",
      savings: "$2,400/month",
      rating: 5,
      image: "🍕"
    },
    {
      name: "Maria Rodriguez", 
      restaurant: "Casa Maria Grill",
      quote: "The AI predictions are incredibly accurate. Never run out of ingredients anymore.",
      savings: "$1,800/month",
      rating: 5,
      image: "🌮"
    },
    {
      name: "David Chen",
      restaurant: "Golden Dragon",
      quote: "Best investment we ever made. The voice control is a game-changer.",
      savings: "$3,200/month", 
      rating: 5,
      image: "🥡"
    }
  ];

  const benefits = [
    { icon: DollarSign, text: "30% Average Food Cost Reduction", stat: "$2,400", unit: "saved monthly" },
    { icon: TrendingUp, text: "1,950% First Year ROI", stat: "1,950%", unit: "ROI guaranteed" },
    { icon: Clock, text: "5-Minute Setup", stat: "5 min", unit: "to go live" },
    { icon: Brain, text: "AI-Powered Intelligence", stat: "24/7", unit: "AI monitoring" }
  ];

  const features = [
    { icon: ChefHat, title: "Smart Kitchen Display", description: "AI-optimized prep workflows" },
    { icon: Coffee, title: "Voice Inventory Control", description: "Just ask 'How much coffee?'" },
    { icon: BarChart3, title: "Predictive Analytics", description: "Know tomorrow's demand today" },
    { icon: Users, title: "Staff Optimization", description: "Perfect scheduling every time" }
  ];

  // Track landing page view and A/B test exposure
  useEffect(() => {
    track('landing_page_view', {
      variant_id: landingPageTest.variantId,
      form_variant: formTest.variantId,
      cta_variant: ctaTest.variantId
    });
    trackFunnelStep('trial_signup', 'landing_view');
  }, []);

  // Rotate testimonials with A/B test speed
  useEffect(() => {
    const speed = landingPageTest.getConfig('testimonialSpeed', 'normal');
    const interval = speed === 'fast' ? 3000 : speed === 'slow' ? 8000 : 5000;
    
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, interval);
    return () => clearInterval(timer);
  }, [landingPageTest]);

  const handleTrialSignup = async () => {
    if (!email || !restaurantName) {
      error('Missing Information', 'Please enter your email and restaurant name');
      return;
    }

    // Track conversion
    landingPageTest.trackConversion('trial_signup');
    ctaTest.trackConversion('form_submit');
    trackFunnelStep('trial_signup', 'form_submit');

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      success('Trial Started!', `Welcome ${restaurantName}! Check your email for next steps.`);
      
      // Track successful conversion
      track('trial_signup_success', {
        restaurant_name: restaurantName,
        email,
        variant_combination: `${landingPageTest.variantId}_${formTest.variantId}_${ctaTest.variantId}`
      });
      
      // Redirect to onboarding
      setTimeout(() => {
        window.location.href = '/setup/restaurant';
      }, 1500);
    } catch (err) {
      error('Signup Failed', 'Please try again or contact support');
      track('trial_signup_error', { error: err });
    }
  };

  const handleDemoRequest = async () => {
    if (!email || !phoneNumber) {
      error('Contact Info Required', 'Please enter your email and phone number');
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      success('Demo Scheduled!', 'Our expert will call you within 24 hours');
    } catch (err) {
      error('Demo Request Failed', 'Please try again or call us directly');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 via-white to-red-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Badge className="bg-green-100 text-green-800 px-4 py-2 text-sm font-medium">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  500+ Restaurants Already Saving Money
                </Badge>
                
                <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                  {heroTitle}
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  The world's first Universal Restaurant System. Cut food costs by 30%, 
                  eliminate waste, and automate operations with AI that learns your business.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="text-center p-4 bg-white/80 rounded-lg border border-orange-200"
                    >
                      <benefit.icon className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-800">{benefit.stat}</p>
                      <p className="text-xs text-gray-600">{benefit.unit}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              
              {/* Lead Capture Form with A/B Testing */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <LeadCaptureForm
                  variant={formTest.getConfig('steps', 1) === 1 ? 'default' : 'urgency'}
                  onSubmit={(data) => {
                    // Handle form submission
                    track('lead_form_completed', {
                      form_variant: formTest.variantId,
                      data
                    });
                    window.location.href = '/setup/restaurant';
                  }}
                />
              </motion.div>
            </div>
            
            {/* Video/Demo Section */}
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
              >
                {!isVideoPlaying ? (
                  <div className="relative bg-gradient-to-br from-orange-400 to-red-500 p-12 text-center">
                    <button
                      onClick={() => setIsVideoPlaying(true)}
                      className="group relative"
                    >
                      <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Play className="h-8 w-8 text-orange-600 ml-1" />
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">
                        See HERA in Action
                      </h4>
                      <p className="text-orange-100">
                        2-minute demo showing real restaurants saving money
                      </p>
                    </button>
                    
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-white text-orange-600 px-4 py-2">
                        <Clock className="h-4 w-4 mr-1" />
                        2 min watch
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-black flex items-center justify-center">
                    <div className="text-center text-white">
                      <h4 className="text-xl font-bold mb-4">Demo Video</h4>
                      <p className="text-gray-300 mb-6">
                        Interactive demo showing HERA's AI-powered features
                      </p>
                      <Button
                        onClick={() => window.location.href = '/restaurant/ai-dashboard'}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        Try Live Demo
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Social Proof Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Trusted by 500+ Restaurant Owners
            </h2>
            <p className="text-lg text-gray-600">
              Average customer saves $2,400/month and sees ROI in first week
            </p>
          </div>
          
          <SocialProofEngine 
            variant={socialProofStyle as any}
            className="max-w-4xl mx-auto"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Everything Your Restaurant Needs
            </h2>
            <p className="text-lg text-gray-600">
              One AI-powered system replaces 10+ different tools
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="text-center group"
              >
                <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                  <feature.icon className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button
              onClick={() => window.location.href = '/restaurant'}
              size="lg"
              variant="outline"
              className="border-2 border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <BarChart3 className="h-5 w-5 mr-2" />
              Explore All Features
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Value Demonstration */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Calculate Your Savings
            </h2>
            <p className="text-lg text-gray-600">
              See exactly how much HERA will save your restaurant
            </p>
          </div>
          
          <ValueDemonstration />
        </div>
      </section>

      {/* Trust Builders */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <TrustBuilders />
        </div>
      </section>

      {/* Expert Demo CTA */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-red-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Want a Personal Demo from a Restaurant Expert?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Our restaurant industry experts will show you exactly how HERA can transform your operations
          </p>
          
          <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <Input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
              />
              <Input
                type="tel"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
              />
            </div>
            
            <Button
              onClick={handleDemoRequest}
              size="lg"
              className="w-full bg-white text-orange-600 hover:bg-gray-100 text-lg py-6"
            >
              <Calendar className="h-5 w-5 mr-2" />
              Schedule Expert Demo
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            
            <div className="mt-4 text-sm opacity-75">
              <div className="flex items-center justify-center space-x-4">
                <span>✓ 15-minute personalized demo</span>
                <span>✓ Custom ROI calculation</span>
                <span>✓ Implementation planning</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Join the Restaurant Revolution
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            Stop losing money to inefficiency. Start your free trial today and see results in 7 days.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              onClick={handleTrialSignup}
              size="lg"
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-lg px-8 py-6"
            >
              <Zap className="h-5 w-5 mr-2" />
              Start Free Trial
            </Button>
            
            <Button
              onClick={() => window.location.href = 'tel:+1-800-HERA-AI'}
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 text-lg px-8 py-6"
            >
              <Phone className="h-5 w-5 mr-2" />
              Call Sales: 1-800-HERA-AI
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-700">
            <div className="text-center">
              <Shield className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">30-Day Guarantee</p>
            </div>
            <div className="text-center">
              <Award className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Industry Leading</p>
            </div>
            <div className="text-center">
              <Users className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">24/7 Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Social Proof Notifications */}
      {urgencyLevel !== 'low' && (
        <SocialProofEngine 
          variant="notifications"
        />
      )}
    </div>
  );
}