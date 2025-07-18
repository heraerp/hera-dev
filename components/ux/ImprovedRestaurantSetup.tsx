import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import NextStepPreview from './NextStepPreview';
import SetupProgressTracker from './SetupProgressTracker';
import { 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  CheckCircle,
  Building2,
  MapPin,
  Settings,
  Users,
  Star
} from 'lucide-react';

interface ImprovedRestaurantSetupProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
  estimatedTimeRemaining?: string;
}

const ImprovedRestaurantSetup: React.FC<ImprovedRestaurantSetupProps> = ({
  currentStep,
  totalSteps,
  onNext,
  onBack,
  isSubmitting = false,
  estimatedTimeRemaining = "2 minutes"
}) => {
  const [formData, setFormData] = useState({
    businessName: '',
    cuisineType: '',
    businessEmail: '',
    primaryPhone: ''
  });

  const progressPercentage = (currentStep / totalSteps) * 100;
  const isLastStep = currentStep === totalSteps;

  const stepConfig = {
    1: {
      icon: Building2,
      title: "Business Information",
      description: "Let's start with the basics about your restaurant",
      completionMessage: "Great! Now let's add your location details."
    },
    2: {
      icon: MapPin,
      title: "Location Details",
      description: "Tell us where your restaurant is located",
      completionMessage: "Perfect! Time to set up your operations."
    },
    3: {
      icon: Settings,
      title: "Operations Setup",
      description: "Set up your operating hours and capacity",
      completionMessage: "Excellent! Finally, let's add your team information."
    },
    4: {
      icon: Users,
      title: "Team Setup",
      description: "Add your manager's contact information",
      completionMessage: "You're all set! Ready to launch your restaurant system."
    }
  };

  const currentStepConfig = stepConfig[currentStep as keyof typeof stepConfig];
  const CurrentIcon = currentStepConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header with Time Estimate */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="w-6 h-6 text-yellow-500" />
            <h1 className="text-3xl font-bold text-gray-900">HERA Universal Setup</h1>
          </div>
          <p className="text-gray-600 mb-4">
            World's fastest restaurant ERP - get running in minutes, not months!
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Clock className="w-3 h-3 mr-1" />
              {estimatedTimeRemaining} remaining
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Step {currentStep} of {totalSteps}
            </Badge>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="mb-8">
          <SetupProgressTracker
            currentStep={currentStep}
            totalSteps={totalSteps}
            compact={true}
          />
        </div>

        {/* Main Setup Card */}
        <Card className="mb-6 overflow-hidden border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
          
          {/* Step Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <CurrentIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {currentStepConfig.title}
                </h2>
                <p className="text-blue-100">
                  {currentStepConfig.description}
                </p>
              </div>
            </div>
            
            {/* Mini Progress Bar */}
            <div className="mt-4">
              <Progress 
                value={progressPercentage} 
                className="h-2 bg-blue-400/30" 
              />
            </div>
          </div>

          {/* Form Content */}
          <CardContent className="p-6 md:p-8">
            
            {/* Next Step Preview */}
            <div className="mb-6">
              <NextStepPreview
                currentStep={currentStep}
                totalSteps={totalSteps}
                estimatedTime="1 min"
                completionMessage="Your restaurant system will be ready to use!"
              />
            </div>

            {/* Form Fields - Example for Step 1 */}
            {currentStep === 1 && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="businessName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    Restaurant Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="businessName"
                    placeholder="e.g., Zen Tea Garden"
                    value={formData.businessName}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                    className="h-12 text-base"
                  />
                  <div className="text-xs text-gray-500">
                    💡 Choose a memorable name that reflects your cuisine style
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="cuisineType" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    Cuisine Type <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cuisineType"
                    placeholder="e.g., Tea House, Pastries & Light Meals"
                    value={formData.cuisineType}
                    onChange={(e) => setFormData(prev => ({ ...prev, cuisineType: e.target.value }))}
                    className="h-12 text-base"
                  />
                  <div className="text-xs text-gray-500">
                    🍽️ Describe what type of food/drinks you serve
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="businessEmail" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    Business Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    placeholder="info@zentea.com"
                    value={formData.businessEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessEmail: e.target.value }))}
                    className="h-12 text-base"
                  />
                  <div className="text-xs text-gray-500">
                    📧 Used for customer receipts and system notifications
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="primaryPhone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="primaryPhone"
                    placeholder="+91 98765 43210"
                    value={formData.primaryPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, primaryPhone: e.target.value }))}
                    className="h-12 text-base"
                  />
                  <div className="text-xs text-gray-500">
                    📞 Primary contact number for your restaurant
                  </div>
                </div>
              </div>
            )}

            {/* Help Section */}
            <Card className="mt-6 bg-gray-50 border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold text-sm">?</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">
                      Why do we need this information?
                    </h4>
                    <p className="text-sm text-gray-600">
                      {currentStep === 1 && "This creates your restaurant profile in HERA Universal, enabling customer receipts, staff access, and system branding."}
                      {currentStep === 2 && "Location details help with delivery zones, tax calculations, and customer directions."}
                      {currentStep === 3 && "Operating hours ensure accurate order scheduling and staff planning."}
                      {currentStep === 4 && "Manager information enables system administration and emergency contacts."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </CardContent>
        </Card>

        {/* Navigation */}
        <Card className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-0">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={currentStep === 1 || isSubmitting}
              className="h-12 px-6 gap-3"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="text-center px-4">
              <p className="text-sm text-gray-600 mb-1">Step {currentStep} of {totalSteps}</p>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalSteps }, (_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i + 1 <= currentStep
                        ? 'bg-blue-500'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <Button
              onClick={onNext}
              disabled={isSubmitting}
              className="h-12 px-8 gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLastStep ? (
                <>
                  Complete Setup
                  <CheckCircle className="w-5 h-5" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Bottom Help */}
        <div className="text-center mt-6 text-sm text-gray-500">
          Need help? Contact our support team or 
          <button className="text-blue-600 hover:text-blue-800 ml-1">
            view the setup guide
          </button>
        </div>

      </div>
    </div>
  );
};

export default ImprovedRestaurantSetup;