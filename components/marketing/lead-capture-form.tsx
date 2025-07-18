'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useFeedback } from '@/components/ui/enhanced-feedback';
import { useConversionTracking } from '@/lib/analytics/conversion-tracking';
import { 
  Zap, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Phone,
  Calendar,
  Star,
  Shield,
  Gift,
  TrendingUp,
  Users,
  Brain,
  Award,
  Coffee
} from 'lucide-react';

interface LeadCaptureProps {
  variant?: 'default' | 'savings' | 'urgency' | 'social_proof';
  onSubmit?: (data: LeadData) => void;
  className?: string;
}

interface LeadData {
  email: string;
  restaurantName: string;
  phoneNumber?: string;
  restaurantType?: string;
  monthlyRevenue?: string;
  currentChallenges?: string[];
  referralSource?: string;
}

const RESTAURANT_TYPES = [
  { value: 'qsr', label: 'Quick Service', savings: '$1,800' },
  { value: 'casual', label: 'Casual Dining', savings: '$2,400' },
  { value: 'fine', label: 'Fine Dining', savings: '$3,200' },
  { value: 'cafe', label: 'Cafe/Bakery', savings: '$1,200' }
];

const REVENUE_RANGES = [
  { value: '10k-25k', label: '$10K - $25K', icon: Coffee },
  { value: '25k-50k', label: '$25K - $50K', icon: Users },
  { value: '50k-100k', label: '$50K - $100K', icon: TrendingUp },
  { value: '100k+', label: '$100K+', icon: Award }
];

const CHALLENGES = [
  { id: 'food-cost', label: 'High Food Costs', icon: DollarSign },
  { id: 'waste', label: 'Food Waste', icon: TrendingUp },
  { id: 'inventory', label: 'Inventory Issues', icon: CheckCircle },
  { id: 'staff', label: 'Staff Management', icon: Users },
  { id: 'compliance', label: 'Compliance', icon: Shield },
  { id: 'growth', label: 'Revenue Growth', icon: Award }
];

export function LeadCaptureForm({ variant = 'default', onSubmit, className }: LeadCaptureProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<LeadData>({
    email: '',
    restaurantName: '',
    phoneNumber: '',
    restaurantType: '',
    monthlyRevenue: '',
    currentChallenges: [],
    referralSource: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimatedSavings, setEstimatedSavings] = useState(2400);
  
  const { success, error, info } = useFeedback();
  const { track, trackFunnelStep, getVariantConfig } = useConversionTracking();

  const variantConfig = getVariantConfig();
  const totalSteps = variant === 'default' ? 3 : 4;

  useEffect(() => {
    track('lead_form_view', { variant, step });
    trackFunnelStep('trial_signup', 'form_view');
  }, [step, variant]);

  useEffect(() => {
    // Calculate estimated savings based on restaurant type and revenue
    const type = RESTAURANT_TYPES.find(t => t.value === formData.restaurantType);
    const baseAmount = type ? parseInt(type.savings.replace(/[$,]/g, '')) : 2400;
    
    const multiplier = {
      '10k-25k': 0.6,
      '25k-50k': 1.0,
      '50k-100k': 1.4,
      '100k+': 2.0
    }[formData.monthlyRevenue || '25k-50k'] || 1.0;

    const challengeBonus = formData.currentChallenges.length * 200;
    setEstimatedSavings(Math.round(baseAmount * multiplier + challengeBonus));
  }, [formData.restaurantType, formData.monthlyRevenue, formData.currentChallenges]);

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      track('lead_form_step_complete', { variant, step, form_data: formData });
      trackFunnelStep('trial_signup', `step_${step}_complete`);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    track('lead_form_submit_attempt', { variant, form_data: formData });
    trackFunnelStep('trial_signup', 'form_submit');

    try {
      // Validate required fields
      if (!formData.email || !formData.restaurantName) {
        error('Missing Information', 'Please fill in all required fields');
        return;
      }

      // Submit to multiple services
      await Promise.allSettled([
        submitToHera(formData),
        submitToHubspot(formData),
        submitToSalesforce(formData),
        submitToMailchimp(formData)
      ]);

      success('Welcome to HERA!', `${formData.restaurantName} is all set. Check your email for next steps.`);
      
      track('lead_form_submit_success', { 
        variant, 
        form_data: formData,
        estimated_savings: estimatedSavings 
      });
      trackFunnelStep('trial_signup', 'form_submit_success');

      // Redirect to onboarding
      setTimeout(() => {
        window.location.href = '/setup/restaurant';
      }, 2000);

      onSubmit?.(formData);
    } catch (err) {
      error('Submission Failed', 'Please try again or contact support');
      track('lead_form_submit_error', { variant, error: err });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitToHera = async (data: LeadData) => {
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        source: 'landing_page',
        variant,
        estimated_savings: estimatedSavings,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) throw new Error('HERA submission failed');
  };

  const submitToHubspot = async (data: LeadData) => {
    // HubSpot integration
    if (process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID) {
      await fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID}/${process.env.NEXT_PUBLIC_HUBSPOT_FORM_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: [
            { name: 'email', value: data.email },
            { name: 'restaurant_name', value: data.restaurantName },
            { name: 'phone', value: data.phoneNumber },
            { name: 'restaurant_type', value: data.restaurantType },
            { name: 'monthly_revenue', value: data.monthlyRevenue },
            { name: 'estimated_savings', value: estimatedSavings.toString() }
          ]
        })
      });
    }
  };

  const submitToSalesforce = async (data: LeadData) => {
    // Salesforce Web-to-Lead
    if (process.env.NEXT_PUBLIC_SALESFORCE_ORG_ID) {
      const formData = new FormData();
      formData.append('oid', process.env.NEXT_PUBLIC_SALESFORCE_ORG_ID);
      formData.append('email', data.email);
      formData.append('company', data.restaurantName);
      formData.append('phone', data.phoneNumber || '');
      formData.append('lead_source', 'Website');
      
      await fetch('https://webto.salesforce.com/servlet/servlet.WebToLead', {
        method: 'POST',
        body: formData
      });
    }
  };

  const submitToMailchimp = async (data: LeadData) => {
    // Mailchimp signup
    await fetch('/api/mailchimp/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        merge_fields: {
          FNAME: data.restaurantName,
          RTYPE: data.restaurantType,
          REVENUE: data.monthlyRevenue,
          SAVINGS: estimatedSavings
        }
      })
    });
  };

  const toggleChallenge = (challengeId: string) => {
    const challenges = formData.currentChallenges || [];
    const newChallenges = challenges.includes(challengeId)
      ? challenges.filter(c => c !== challengeId)
      : [...challenges, challengeId];
    
    setFormData({ ...formData, currentChallenges: newChallenges });
    track('challenge_selected', { challenge: challengeId, total_challenges: newChallenges.length });
  };

  const progress = (step / totalSteps) * 100;

  return (
    <Card className={`shadow-xl border-2 border-orange-200 ${className}`}>
      <CardContent className="p-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Badge className="bg-green-100 text-green-800">
              <Clock className="h-3 w-3 mr-1" />
              2 min setup
            </Badge>
            <Badge className="bg-blue-100 text-blue-800">
              Step {step} of {totalSteps}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Dynamic Header Based on Variant */}
        <div className="text-center mb-6">
          <motion.h3 
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-bold text-gray-800 mb-2"
          >
            {getStepTitle()}
          </motion.h3>
          
          {step === totalSteps && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4"
            >
              <div className="flex items-center justify-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-lg font-bold text-green-800">
                  Estimated Monthly Savings: ${estimatedSavings.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                ${(estimatedSavings * 12).toLocaleString()} annual savings • {Math.round((estimatedSavings * 12 / 299) * 100)}% ROI
              </p>
            </motion.div>
          )}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
            className="flex items-center space-x-2"
          >
            <span>Back</span>
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={isSubmitting || !isStepValid()}
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{step === totalSteps ? 'Start Free Trial' : 'Continue'}</span>
                {step === totalSteps ? <Zap className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </>
            )}
          </Button>
        </div>

        {/* Trust Indicators */}
        {step === 1 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-600">
              <div className="flex items-center space-x-1">
                <Shield className="h-3 w-3" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3" />
                <span>30-day guarantee</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3" />
                <span>500+ restaurants</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  function getStepTitle(): string {
    const titles = {
      1: variant === 'urgency' ? '⚡ Limited Time: Start Your Free Trial' : '🚀 Start Your Free Trial',
      2: '🏪 Tell Us About Your Restaurant',
      3: '📊 What Are Your Biggest Challenges?',
      4: '✨ You\'re All Set!'
    };
    return titles[step as keyof typeof titles] || 'Complete Your Setup';
  }

  function renderStepContent(): React.ReactNode {
    switch (step) {
      case 1:
        return renderBasicInfo();
      case 2:
        return renderRestaurantDetails();
      case 3:
        return renderChallenges();
      case 4:
        return renderConfirmation();
      default:
        return null;
    }
  }

  function renderBasicInfo(): React.ReactNode {
    return (
      <div className="space-y-4">
        <div>
          <Input
            placeholder="Restaurant Name"
            value={formData.restaurantName}
            onChange={(e) => {
              setFormData({ ...formData, restaurantName: e.target.value });
              track('restaurant_name_entered', { length: e.target.value.length });
            }}
            className="text-lg py-3"
            onFocus={() => trackFunnelStep('trial_signup', 'form_focus')}
          />
        </div>
        
        <div>
          <Input
            type="email"
            placeholder="Your Email Address"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              track('email_entered', { domain: e.target.value.split('@')[1] });
            }}
            className="text-lg py-3"
          />
        </div>

        {variant === 'social_proof' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <p className="text-sm text-blue-800">
                <strong>Join 500+ restaurants</strong> already saving an average of $2,400/month with HERA
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderRestaurantDetails(): React.ReactNode {
    return (
      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Restaurant Type</label>
          <div className="grid grid-cols-2 gap-3">
            {RESTAURANT_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => {
                  setFormData({ ...formData, restaurantType: type.value });
                  track('restaurant_type_selected', { type: type.value });
                }}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  formData.restaurantType === type.value
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <p className="font-medium text-gray-800">{type.label}</p>
                <p className="text-xs text-green-600 font-semibold">Avg savings: {type.savings}/mo</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Monthly Revenue</label>
          <div className="grid grid-cols-2 gap-3">
            {REVENUE_RANGES.map((range) => (
              <button
                key={range.value}
                onClick={() => {
                  setFormData({ ...formData, monthlyRevenue: range.value });
                  track('revenue_range_selected', { range: range.value });
                }}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  formData.monthlyRevenue === range.value
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <range.icon className="h-4 w-4 text-gray-600" />
                  <span className="font-medium text-gray-800">{range.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <Input
            type="tel"
            placeholder="Phone Number (Optional)"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            className="text-lg py-3"
          />
        </div>
      </div>
    );
  }

  function renderChallenges(): React.ReactNode {
    return (
      <div className="space-y-4">
        <p className="text-gray-600 text-sm">
          Select your biggest challenges (choose all that apply):
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          {CHALLENGES.map((challenge) => (
            <button
              key={challenge.id}
              onClick={() => toggleChallenge(challenge.id)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                formData.currentChallenges?.includes(challenge.id)
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <challenge.icon className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-800">{challenge.label}</span>
                </div>
                {formData.currentChallenges?.includes(challenge.id) && (
                  <CheckCircle className="h-4 w-4 text-orange-600" />
                )}
              </div>
            </button>
          ))}
        </div>

        {formData.currentChallenges && formData.currentChallenges.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-purple-50 border border-purple-200 rounded-lg p-4"
          >
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <p className="text-sm text-purple-800">
                <strong>Perfect!</strong> HERA's AI will prioritize solving these {formData.currentChallenges.length} challenges first.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  function renderConfirmation(): React.ReactNode {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-4">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          
          <h4 className="text-lg font-bold text-gray-800">
            {formData.restaurantName} is Ready for HERA!
          </h4>
          
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">${estimatedSavings.toLocaleString()}</p>
                <p className="text-xs text-gray-600">Estimated Monthly Savings</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{Math.round((estimatedSavings * 12 / 299) * 100)}%</p>
                <p className="text-xs text-gray-600">Projected Annual ROI</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <p>✓ Your restaurant profile is created</p>
          <p>✓ AI system is ready to learn your business</p>
          <p>✓ 30-day money-back guarantee</p>
          <p>✓ Expert support team standing by</p>
        </div>
      </div>
    );
  }

  function isStepValid(): boolean {
    switch (step) {
      case 1:
        return !!(formData.email && formData.restaurantName);
      case 2:
        return !!(formData.restaurantType && formData.monthlyRevenue);
      case 3:
        return true; // Challenges are optional
      case 4:
        return true;
      default:
        return false;
    }
  }
}