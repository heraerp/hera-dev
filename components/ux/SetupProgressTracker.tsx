import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current?: boolean;
  estimatedTime: string;
  actionLink?: string;
  actionLabel?: string;
}

interface SetupProgressTrackerProps {
  currentStep: number;
  totalSteps: number;
  overallProgress?: number;
  customSteps?: SetupStep[];
  showTimeEstimate?: boolean;
  compact?: boolean;
}

const SetupProgressTracker: React.FC<SetupProgressTrackerProps> = ({
  currentStep,
  totalSteps,
  overallProgress,
  customSteps,
  showTimeEstimate = true,
  compact = false
}) => {
  // Default setup steps for restaurant
  const defaultSteps: SetupStep[] = [
    {
      id: 'business-info',
      title: 'Business Information',
      description: 'Restaurant name, cuisine type, contact details',
      completed: currentStep > 1,
      current: currentStep === 1,
      estimatedTime: '2 min',
      actionLink: '/setup/restaurant',
      actionLabel: 'Complete'
    },
    {
      id: 'location-details',
      title: 'Location Details',
      description: 'Address, city, state, and postal code',
      completed: currentStep > 2,
      current: currentStep === 2,
      estimatedTime: '1 min'
    },
    {
      id: 'operations-setup',
      title: 'Operations Setup',
      description: 'Hours, capacity, and operational preferences',
      completed: currentStep > 3,
      current: currentStep === 3,
      estimatedTime: '2 min'
    },
    {
      id: 'team-setup',
      title: 'Team Setup',
      description: 'Manager information and staff details',
      completed: currentStep > 4,
      current: currentStep === 4,
      estimatedTime: '1 min'
    }
  ];

  const steps = customSteps || defaultSteps;
  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = overallProgress || (completedSteps / steps.length) * 100;
  const totalEstimatedTime = steps.reduce((total, step) => {
    const time = parseInt(step.estimatedTime);
    return total + (isNaN(time) ? 0 : time);
  }, 0);

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium text-blue-800">
            Setup Progress
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {completedSteps}/{steps.length}
          </Badge>
        </div>
        <div className="flex-1">
          <Progress value={progressPercentage} className="h-2 bg-blue-100" />
        </div>
        <div className="text-sm text-blue-600">
          {Math.round(progressPercentage)}%
        </div>
      </div>
    );
  }

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-blue-900">
            Restaurant Setup Progress
          </CardTitle>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {completedSteps} of {steps.length} completed
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-700">Overall Progress</span>
            <span className="font-medium text-blue-800">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3 bg-blue-100" />
          {showTimeEstimate && (
            <div className="flex items-center justify-between text-xs text-blue-600">
              <span>Estimated total time: {totalEstimatedTime} minutes</span>
              <span>Almost done! 🎉</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
              step.completed
                ? 'bg-green-50 border border-green-200'
                : step.current
                ? 'bg-orange-50 border border-orange-200'
                : 'bg-gray-50 border border-gray-200'
            }`}
          >
            {/* Status Icon */}
            <div className="flex-shrink-0">
              {step.completed ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : step.current ? (
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{index + 1}</span>
                </div>
              ) : (
                <Circle className="w-6 h-6 text-gray-400" />
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`font-medium ${
                  step.completed ? 'text-green-800' : 
                  step.current ? 'text-orange-800' : 
                  'text-gray-600'
                }`}>
                  {step.title}
                </h4>
                {step.current && (
                  <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                    Current
                  </Badge>
                )}
                {step.completed && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    Complete
                  </Badge>
                )}
              </div>
              <p className={`text-sm ${
                step.completed ? 'text-green-600' : 
                step.current ? 'text-orange-600' : 
                'text-gray-500'
              }`}>
                {step.description}
              </p>
            </div>

            {/* Time Estimate & Action */}
            <div className="flex items-center gap-3">
              {showTimeEstimate && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {step.estimatedTime}
                </div>
              )}
              
              {step.current && step.actionLink && (
                <Link href={step.actionLink}>
                  <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium">
                    {step.actionLabel || 'Continue'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              )}
            </div>
          </div>
        ))}

        {/* Completion Message */}
        {progressPercentage >= 100 && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h4 className="font-medium text-green-800">
                  Setup Complete! 🎉
                </h4>
                <p className="text-sm text-green-600">
                  Your restaurant is now ready to start taking orders.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SetupProgressTracker;