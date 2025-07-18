import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Star, 
  Clock,
  Coffee,
  Users,
  CreditCard,
  BarChart3,
  X
} from 'lucide-react';
import Link from 'next/link';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  action: string;
  link: string;
  icon: any;
  emoji: string;
  estimatedTime: string;
  completed?: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface OnboardingGuidanceProps {
  onDismiss?: () => void;
  completedSteps?: string[];
}

const OnboardingGuidance: React.FC<OnboardingGuidanceProps> = ({
  onDismiss,
  completedSteps = []
}) => {
  const [dismissed, setDismissed] = useState(false);

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'setup-menu',
      title: 'Set Up Your Menu',
      description: 'Add your first products to start taking orders',
      action: 'Add Products',
      link: '/restaurant/products',
      icon: Coffee,
      emoji: '☕',
      estimatedTime: '5 min',
      priority: 'high',
      completed: completedSteps.includes('setup-menu')
    },
    {
      id: 'test-order',
      title: 'Process Your First Order',
      description: 'Learn how orders flow through your system',
      action: 'Create Order',
      link: '/restaurant/orders',
      icon: Users,
      emoji: '🛒',
      estimatedTime: '3 min',
      priority: 'high',
      completed: completedSteps.includes('test-order')
    },
    {
      id: 'setup-payment',
      title: 'Configure Payments',
      description: 'Set up payment processing for transactions',
      action: 'Setup Payments',
      link: '/restaurant/payments',
      icon: CreditCard,
      emoji: '💳',
      estimatedTime: '7 min',
      priority: 'medium',
      completed: completedSteps.includes('setup-payment')
    },
    {
      id: 'view-analytics',
      title: 'Explore Analytics',
      description: 'See insights about your restaurant performance',
      action: 'View Dashboard',
      link: '/restaurant/analytics',
      icon: BarChart3,
      emoji: '📊',
      estimatedTime: '2 min',
      priority: 'low',
      completed: completedSteps.includes('view-analytics')
    }
  ];

  const completedCount = onboardingSteps.filter(step => step.completed).length;
  const progressPercentage = (completedCount / onboardingSteps.length) * 100;
  const nextStep = onboardingSteps.find(step => !step.completed && step.priority === 'high') ||
                   onboardingSteps.find(step => !step.completed);

  if (dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <Card className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
              <Star className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-blue-900">
                Welcome to HERA Universal! 🎉
              </CardTitle>
              <p className="text-sm text-blue-700">
                Let's get your restaurant running in just a few quick steps
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-blue-600 hover:text-blue-800"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-800">
              Setup Progress
            </span>
            <span className="text-sm text-blue-600">
              {completedCount} of {onboardingSteps.length} completed
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2 bg-blue-100" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Next Recommended Step */}
        {nextStep && (
          <Card className="border-orange-200 bg-orange-50">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  Start Here
                </Badge>
                <div className="flex items-center gap-1 text-xs text-orange-600">
                  <Clock className="w-3 h-3" />
                  {nextStep.estimatedTime}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl">
                  <nextStep.icon className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-orange-900 mb-1">
                    {nextStep.emoji} {nextStep.title}
                  </h4>
                  <p className="text-sm text-orange-700 mb-3">
                    {nextStep.description}
                  </p>
                  <Link href={nextStep.link}>
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                      {nextStep.action}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* All Steps Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {onboardingSteps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                step.completed
                  ? 'bg-green-50 border-green-200'
                  : step.priority === 'high'
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-center">
                {step.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">
                    {step.emoji} {step.title}
                  </span>
                  {step.priority === 'high' && !step.completed && (
                    <Badge variant="secondary" className="text-xs">
                      Priority
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600">
                  {step.description}
                </p>
              </div>

              {!step.completed && (
                <Link href={step.link}>
                  <Button variant="outline" size="sm">
                    Start
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-blue-200">
          <div className="text-sm text-blue-600">
            <span className="font-medium">🚀 HERA Universal</span> - 
            World's fastest restaurant ERP setup
          </div>
          <div className="text-xs text-blue-500">
            ⏱️ Average completion: 15 minutes
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OnboardingGuidance;