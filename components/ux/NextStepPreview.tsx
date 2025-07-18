import React from 'react';
import { Card } from '@/components/ui/card';
import { ArrowRight, Clock, CheckCircle } from 'lucide-react';

interface NextStepPreviewProps {
  currentStep: number;
  totalSteps: number;
  nextStepTitle?: string;
  nextStepDescription?: string;
  estimatedTime?: string;
  completionMessage?: string;
}

const NextStepPreview: React.FC<NextStepPreviewProps> = ({
  currentStep,
  totalSteps,
  nextStepTitle,
  nextStepDescription,
  estimatedTime,
  completionMessage
}) => {
  const isLastStep = currentStep === totalSteps;
  
  const stepData = {
    1: {
      title: "Location Details",
      description: "Tell us where your restaurant is located",
      icon: "📍"
    },
    2: {
      title: "Operations Setup", 
      description: "Set your hours and capacity",
      icon: "⏰"
    },
    3: {
      title: "Team Setup",
      description: "Add your manager's information", 
      icon: "👥"
    },
    4: {
      title: "Complete Setup",
      description: "Launch your restaurant system",
      icon: "🎉"
    }
  };

  const nextStep = stepData[currentStep + 1 as keyof typeof stepData];

  return (
    <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <div className="flex items-center gap-3">
        {!isLastStep ? (
          <>
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-blue-800">
                  Next: {nextStep?.title || nextStepTitle}
                </span>
                {estimatedTime && (
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    <Clock className="w-3 h-3" />
                    {estimatedTime}
                  </div>
                )}
              </div>
              <p className="text-xs text-blue-600">
                {nextStep?.description || nextStepDescription}
              </p>
            </div>
            <div className="text-lg">
              {nextStep?.icon}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-green-800">
                Almost done! 
              </span>
              <p className="text-xs text-green-600">
                {completionMessage || "Complete this step to launch your restaurant system"}
              </p>
            </div>
            <div className="text-lg">🚀</div>
          </>
        )}
      </div>
    </Card>
  );
};

export default NextStepPreview;