'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useFeedback } from '@/components/ui/enhanced-feedback';
import { 
  Store, 
  Utensils, 
  Coffee, 
  Pizza, 
  Users, 
  MapPin, 
  Phone, 
  Mail,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  Camera,
  Upload,
  FileText,
  TrendingUp,
  Clock,
  DollarSign,
  Brain
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  component: React.ReactNode;
}

interface RestaurantData {
  businessType: string;
  restaurantName: string;
  numberOfLocations: string;
  address: string;
  phone: string;
  email: string;
  menuSource: string;
  currentChallenges: string[];
}

export function OnboardingWizard({ onComplete }: { onComplete: (data: RestaurantData) => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [restaurantData, setRestaurantData] = useState<RestaurantData>({
    businessType: '',
    restaurantName: '',
    numberOfLocations: '1',
    address: '',
    phone: '',
    email: '',
    menuSource: '',
    currentChallenges: []
  });
  
  const { success, info } = useFeedback();

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to HERA Restaurant',
      description: 'Let\'s set up your restaurant in under 5 minutes!',
      icon: Sparkles,
      component: <WelcomeStep />
    },
    {
      id: 'business-type',
      title: 'Restaurant Type',
      description: 'Help us customize HERA for your business',
      icon: Store,
      component: <BusinessTypeStep data={restaurantData} onChange={setRestaurantData} />
    },
    {
      id: 'basic-info',
      title: 'Basic Information',
      description: 'Tell us about your restaurant',
      icon: FileText,
      component: <BasicInfoStep data={restaurantData} onChange={setRestaurantData} />
    },
    {
      id: 'menu-import',
      title: 'Import Your Menu',
      description: 'We\'ll help you get your menu into HERA instantly',
      icon: Upload,
      component: <MenuImportStep data={restaurantData} onChange={setRestaurantData} />
    },
    {
      id: 'challenges',
      title: 'Current Challenges',
      description: 'What problems can HERA solve for you?',
      icon: TrendingUp,
      component: <ChallengesStep data={restaurantData} onChange={setRestaurantData} />
    },
    {
      id: 'complete',
      title: 'All Set!',
      description: 'Your restaurant is ready to go',
      icon: CheckCircle,
      component: <CompleteStep data={restaurantData} />
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      info('Progress Saved', 'Your information has been saved');
    } else {
      onComplete(restaurantData);
      success('Setup Complete!', 'Your restaurant is ready to use');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="shadow-xl border-2 border-orange-200">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-green-100 text-green-800">
              <Clock className="h-3 w-3 mr-1" />
              5 min setup
            </Badge>
            <Badge className="bg-blue-100 text-blue-800">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          
          <Progress value={progress} className="h-2 mb-4" />
          
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              {React.createElement(steps[currentStep].icon, { className: "h-6 w-6 text-orange-600" })}
            </div>
            <div>
              <CardTitle>{steps[currentStep].title}</CardTitle>
              <CardDescription>{steps[currentStep].description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {steps[currentStep].component}
            </motion.div>
          </AnimatePresence>
          
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              {currentStep === steps.length - 1 ? 'Complete Setup' : 'Continue'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Step Components
function WelcomeStep() {
  const benefits = [
    { icon: DollarSign, text: '30% average food cost reduction', color: 'text-green-600' },
    { icon: TrendingUp, text: '1,950% ROI in first year', color: 'text-blue-600' },
    { icon: Clock, text: 'Save 15 hours per week', color: 'text-purple-600' },
    { icon: Brain, text: 'AI learns your business', color: 'text-orange-600' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold text-gray-800">
          Welcome to the Future of Restaurant Management
        </h3>
        <p className="text-gray-600">
          HERA's AI-powered system will transform your restaurant operations. 
          Join hundreds of restaurants already saving money and time.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {benefits.map((benefit, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
          >
            <benefit.icon className={`h-5 w-5 ${benefit.color}`} />
            <span className="text-sm font-medium text-gray-700">{benefit.text}</span>
          </motion.div>
        ))}
      </div>
      
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-orange-600" />
          <p className="text-sm font-medium text-orange-800">
            Quick Tip: Have your menu ready (PDF, photo, or website) for instant import!
          </p>
        </div>
      </div>
    </div>
  );
}

function BusinessTypeStep({ data, onChange }: { data: RestaurantData; onChange: (data: RestaurantData) => void }) {
  const types = [
    { value: 'qsr', label: 'Quick Service (QSR)', icon: Pizza, description: 'Fast food, takeout focused' },
    { value: 'casual', label: 'Casual Dining', icon: Utensils, description: 'Sit-down, table service' },
    { value: 'fine', label: 'Fine Dining', icon: Coffee, description: 'Upscale, premium experience' },
    { value: 'cafe', label: 'Cafe/Bakery', icon: Coffee, description: 'Coffee, pastries, light meals' }
  ];

  return (
    <div className="space-y-6">
      <RadioGroup
        value={data.businessType}
        onValueChange={(value) => onChange({ ...data, businessType: value })}
      >
        <div className="grid grid-cols-2 gap-4">
          {types.map((type) => (
            <label
              key={type.value}
              htmlFor={type.value}
              className={`
                relative flex flex-col items-center space-y-2 p-4 rounded-lg border-2 cursor-pointer transition-all
                ${data.businessType === type.value 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 hover:border-orange-300'
                }
              `}
            >
              <RadioGroupItem value={type.value} id={type.value} className="sr-only" />
              <type.icon className={`h-8 w-8 ${
                data.businessType === type.value ? 'text-orange-600' : 'text-gray-600'
              }`} />
              <div className="text-center">
                <p className="font-medium text-gray-800">{type.label}</p>
                <p className="text-xs text-gray-600 mt-1">{type.description}</p>
              </div>
              {data.businessType === type.value && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="h-5 w-5 text-orange-600" />
                </div>
              )}
            </label>
          ))}
        </div>
      </RadioGroup>
      
      <div className="space-y-4">
        <Label htmlFor="locations">Number of Locations</Label>
        <RadioGroup
          value={data.numberOfLocations}
          onValueChange={(value) => onChange({ ...data, numberOfLocations: value })}
        >
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="loc1" />
              <label htmlFor="loc1">Single Location</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="2-5" id="loc2" />
              <label htmlFor="loc2">2-5 Locations</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="6+" id="loc3" />
              <label htmlFor="loc3">6+ Locations</label>
            </div>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}

function BasicInfoStep({ data, onChange }: { data: RestaurantData; onChange: (data: RestaurantData) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Restaurant Name</Label>
        <Input
          id="name"
          placeholder="e.g., Tony's Pizza Palace"
          value={data.restaurantName}
          onChange={(e) => onChange({ ...data, restaurantName: e.target.value })}
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          placeholder="123 Main Street, City, State"
          value={data.address}
          onChange={(e) => onChange({ ...data, address: e.target.value })}
          className="mt-1"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(555) 123-4567"
            value={data.phone}
            onChange={(e) => onChange({ ...data, phone: e.target.value })}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="contact@restaurant.com"
            value={data.email}
            onChange={(e) => onChange({ ...data, email: e.target.value })}
            className="mt-1"
          />
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-blue-600" />
          <p className="text-sm text-blue-800">
            <strong>AI Tip:</strong> HERA will automatically set up tax rates, compliance requirements, 
            and local regulations based on your address.
          </p>
        </div>
      </div>
    </div>
  );
}

function MenuImportStep({ data, onChange }: { data: RestaurantData; onChange: (data: RestaurantData) => void }) {
  const importOptions = [
    { 
      value: 'photo', 
      label: 'Take Photo', 
      icon: Camera, 
      description: 'Snap a photo of your menu',
      time: '2 min'
    },
    { 
      value: 'upload', 
      label: 'Upload File', 
      icon: Upload, 
      description: 'PDF, Excel, or Word file',
      time: '1 min'
    },
    { 
      value: 'website', 
      label: 'From Website', 
      icon: FileText, 
      description: 'Import from your website',
      time: '3 min'
    },
    { 
      value: 'manual', 
      label: 'Enter Later', 
      icon: Zap, 
      description: 'Skip for now',
      time: '0 min'
    }
  ];

  return (
    <div className="space-y-6">
      <RadioGroup
        value={data.menuSource}
        onValueChange={(value) => onChange({ ...data, menuSource: value })}
      >
        <div className="space-y-3">
          {importOptions.map((option) => (
            <label
              key={option.value}
              htmlFor={option.value}
              className={`
                relative flex items-center space-x-4 p-4 rounded-lg border-2 cursor-pointer transition-all
                ${data.menuSource === option.value 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 hover:border-orange-300'
                }
              `}
            >
              <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
              
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                data.menuSource === option.value ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                <option.icon className="h-6 w-6" />
              </div>
              
              <div className="flex-1">
                <p className="font-medium text-gray-800">{option.label}</p>
                <p className="text-sm text-gray-600">{option.description}</p>
              </div>
              
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {option.time}
              </Badge>
              
              {data.menuSource === option.value && (
                <CheckCircle className="h-5 w-5 text-orange-600 absolute top-4 right-4" />
              )}
            </label>
          ))}
        </div>
      </RadioGroup>
      
      {data.menuSource && data.menuSource !== 'manual' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-green-600" />
            <p className="text-sm text-green-800">
              <strong>AI Magic:</strong> Our AI will extract all menu items, prices, and descriptions 
              automatically. You can review and edit everything after import.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function ChallengesStep({ data, onChange }: { data: RestaurantData; onChange: (data: RestaurantData) => void }) {
  const challenges = [
    { id: 'food-cost', label: 'High Food Costs', description: 'Reduce waste, optimize pricing' },
    { id: 'inventory', label: 'Inventory Management', description: 'Prevent stockouts, reduce waste' },
    { id: 'staff', label: 'Staff Scheduling', description: 'Optimize labor costs' },
    { id: 'orders', label: 'Order Accuracy', description: 'Reduce errors, improve speed' },
    { id: 'marketing', label: 'Customer Retention', description: 'Loyalty programs, promotions' },
    { id: 'compliance', label: 'Compliance & Taxes', description: 'Automate reporting' }
  ];

  const toggleChallenge = (challengeId: string) => {
    const newChallenges = data.currentChallenges.includes(challengeId)
      ? data.currentChallenges.filter(c => c !== challengeId)
      : [...data.currentChallenges, challengeId];
    onChange({ ...data, currentChallenges: newChallenges });
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-600">
        Select all that apply. HERA will prioritize features and insights based on your needs.
      </p>
      
      <div className="grid grid-cols-2 gap-3">
        {challenges.map((challenge) => (
          <button
            key={challenge.id}
            onClick={() => toggleChallenge(challenge.id)}
            className={`
              p-4 rounded-lg border-2 text-left transition-all
              ${data.currentChallenges.includes(challenge.id)
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 hover:border-orange-300'
              }
            `}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-gray-800">{challenge.label}</p>
                <p className="text-xs text-gray-600 mt-1">{challenge.description}</p>
              </div>
              {data.currentChallenges.includes(challenge.id) && (
                <CheckCircle className="h-5 w-5 text-orange-600 flex-shrink-0 ml-2" />
              )}
            </div>
          </button>
        ))}
      </div>
      
      {data.currentChallenges.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-purple-50 border border-purple-200 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <p className="text-sm text-purple-800">
              <strong>Perfect!</strong> HERA's AI will focus on solving these {data.currentChallenges.length} challenges 
              first, with an expected ROI of {data.currentChallenges.length * 325}% in the first year.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function CompleteStep({ data }: { data: RestaurantData }) {
  const nextSteps = [
    { label: 'Tour your AI Dashboard', time: '2 min', icon: Brain },
    { label: 'Import remaining menu items', time: '5 min', icon: Upload },
    { label: 'Set up staff accounts', time: '3 min', icon: Users },
    { label: 'Configure kitchen display', time: '2 min', icon: Utensils }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-800">
          {data.restaurantName} is Ready!
        </h3>
        
        <p className="text-gray-600">
          Your restaurant is set up and ready to start saving money. 
          HERA's AI is already analyzing your business to provide personalized insights.
        </p>
      </div>
      
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-800 mb-3">Your First Week Goals:</h4>
        <div className="space-y-2">
          {nextSteps.map((step, index) => (
            <div key={index} className="flex items-center justify-between p-2">
              <div className="flex items-center space-x-3">
                <step.icon className="h-5 w-5 text-orange-600" />
                <span className="text-sm text-gray-700">{step.label}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {step.time}
              </Badge>
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 pt-4">
        <Card className="text-center p-4 border-green-200 bg-green-50">
          <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">$2,400</p>
          <p className="text-sm text-gray-600">Expected Monthly Savings</p>
        </Card>
        
        <Card className="text-center p-4 border-blue-200 bg-blue-50">
          <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">1,950%</p>
          <p className="text-sm text-gray-600">Projected First Year ROI</p>
        </Card>
      </div>
    </div>
  );
}