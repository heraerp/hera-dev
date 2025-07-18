'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useConversionTracking } from '@/lib/analytics/conversion-tracking';

interface ABTestVariant {
  id: string;
  name: string;
  config: Record<string, any>;
}

interface ABTestContext {
  variantId: string | null;
  config: Record<string, any>;
  isVariant: (variantId: string) => boolean;
  getConfig: <T>(key: string, defaultValue?: T) => T;
}

const ABTestContext = createContext<ABTestContext | null>(null);

interface ABTestProviderProps {
  children: React.ReactNode;
  tests?: Record<string, ABTestVariant[]>;
}

const DEFAULT_TESTS = {
  'landing_page_optimization': [
    {
      id: 'control',
      name: 'Original Landing Page',
      config: {
        heroTitle: 'Save $2,400/Month with AI-Powered Restaurant Management',
        ctaText: 'Start Free Trial',
        ctaColor: 'orange',
        testimonialSpeed: 'normal',
        socialProofStyle: 'testimonials',
        urgencyLevel: 'low',
        savingsEmphasis: 'moderate'
      }
    },
    {
      id: 'savings_focused',
      name: 'Savings-Focused Variant',
      config: {
        heroTitle: '💰 Cut Restaurant Costs by 30% in 3 Weeks',
        ctaText: 'Start Saving Money Today',
        ctaColor: 'green',
        testimonialSpeed: 'fast',
        socialProofStyle: 'live_activity',
        urgencyLevel: 'high',
        savingsEmphasis: 'high'
      }
    },
    {
      id: 'ai_focused',
      name: 'AI-Focused Variant',
      config: {
        heroTitle: '🤖 AI-Powered Restaurant Revolution',
        ctaText: 'Experience the AI Difference',
        ctaColor: 'blue',
        testimonialSpeed: 'slow',
        socialProofStyle: 'stats',
        urgencyLevel: 'low',
        savingsEmphasis: 'low'
      }
    },
    {
      id: 'urgency_focused',
      name: 'Urgency-Focused Variant',
      config: {
        heroTitle: '⚡ Limited Time: Revolutionary Restaurant AI',
        ctaText: 'Claim Your Spot Now',
        ctaColor: 'red',
        testimonialSpeed: 'fast',
        socialProofStyle: 'notifications',
        urgencyLevel: 'very_high',
        savingsEmphasis: 'moderate'
      }
    }
  ],
  
  'form_optimization': [
    {
      id: 'single_step',
      name: 'Single Step Form',
      config: {
        steps: 1,
        progressBar: false,
        fieldsRequired: ['email', 'restaurantName'],
        socialProof: true
      }
    },
    {
      id: 'multi_step',
      name: 'Multi-Step Form',
      config: {
        steps: 3,
        progressBar: true,
        fieldsRequired: ['email', 'restaurantName', 'restaurantType'],
        socialProof: false
      }
    },
    {
      id: 'gamified',
      name: 'Gamified Form',
      config: {
        steps: 4,
        progressBar: true,
        fieldsRequired: ['email', 'restaurantName', 'restaurantType', 'challenges'],
        socialProof: true,
        gamification: true
      }
    }
  ],

  'pricing_display': [
    {
      id: 'monthly_focus',
      name: 'Monthly Pricing Focus',
      config: {
        priceDisplay: 'monthly',
        savingsCalculator: true,
        comparison: false,
        guarantee: '30-day'
      }
    },
    {
      id: 'savings_focus',
      name: 'Savings-First Pricing',
      config: {
        priceDisplay: 'savings',
        savingsCalculator: true,
        comparison: true,
        guarantee: 'roi'
      }
    }
  ],

  'cta_optimization': [
    {
      id: 'benefit_focused',
      name: 'Benefit-Focused CTA',
      config: {
        ctaText: 'Start Saving Money Today',
        ctaColor: 'green',
        ctaSize: 'large',
        urgencyText: false
      }
    },
    {
      id: 'urgency_focused',
      name: 'Urgency-Focused CTA',
      config: {
        ctaText: 'Claim Your Free Trial',
        ctaColor: 'red',
        ctaSize: 'large',
        urgencyText: 'Limited spots available'
      }
    },
    {
      id: 'social_focused',
      name: 'Social Proof CTA',
      config: {
        ctaText: 'Join 500+ Restaurants',
        ctaColor: 'blue',
        ctaSize: 'large',
        urgencyText: false,
        socialCount: true
      }
    }
  ]
};

export function ABTestProvider({ children, tests = DEFAULT_TESTS }: ABTestProviderProps) {
  const [variants, setVariants] = useState<Record<string, string>>({});
  const [configs, setConfigs] = useState<Record<string, any>>({});
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { track } = useConversionTracking();

  useEffect(() => {
    initializeTests();
  }, []);

  const initializeTests = () => {
    const newVariants: Record<string, string> = {};
    const newConfigs: Record<string, any> = {};

    Object.entries(tests).forEach(([testName, testVariants]) => {
      // Get existing assignment or create new one
      let assignedVariant = localStorage.getItem(`ab_test_${testName}`);
      
      if (!assignedVariant) {
        // Weighted random assignment
        const random = Math.random() * 100;
        let cumulativeWeight = 0;
        const weights = testVariants.length > 0 ? 100 / testVariants.length : 0;
        
        for (const variant of testVariants) {
          cumulativeWeight += weights;
          if (random <= cumulativeWeight) {
            assignedVariant = variant.id;
            break;
          }
        }
        
        if (assignedVariant) {
          localStorage.setItem(`ab_test_${testName}`, assignedVariant);
          
          // Track assignment
          track('ab_test_assigned', {
            test_name: testName,
            variant_id: assignedVariant,
            timestamp: new Date().toISOString()
          });
        }
      }

      if (assignedVariant) {
        newVariants[testName] = assignedVariant;
        
        // Find and store config
        const variantConfig = testVariants.find(v => v.id === assignedVariant);
        if (variantConfig) {
          newConfigs[testName] = variantConfig.config;
        }
      }
    });

    setVariants(newVariants);
    setConfigs(newConfigs);
    setIsInitialized(true);
  };

  const isVariant = (testName: string, variantId: string) => {
    return variants[testName] === variantId;
  };

  const getConfig = <T,>(testName: string, key: string, defaultValue?: T): T => {
    const testConfig = configs[testName];
    if (testConfig && key in testConfig) {
      return testConfig[key];
    }
    return defaultValue as T;
  };

  const getVariantId = (testName: string): string | null => {
    return variants[testName] || null;
  };

  const contextValue: ABTestContext = {
    variantId: null, // Legacy - use getVariantId instead
    config: {}, // Legacy - use getConfig instead
    isVariant: (variantId: string) => false, // Legacy
    getConfig: <T,>(key: string, defaultValue?: T) => defaultValue as T // Legacy
  };

  if (!isInitialized) {
    // Return children without A/B test context during initialization
    return <>{children}</>;
  }

  return (
    <ABTestContext.Provider value={contextValue}>
      <ABTestWrapper 
        variants={variants} 
        configs={configs}
        isVariant={isVariant}
        getConfig={getConfig}
        getVariantId={getVariantId}
      >
        {children}
      </ABTestWrapper>
    </ABTestContext.Provider>
  );
}

interface ABTestWrapperProps {
  children: React.ReactNode;
  variants: Record<string, string>;
  configs: Record<string, any>;
  isVariant: (testName: string, variantId: string) => boolean;
  getConfig: <T>(testName: string, key: string, defaultValue?: T) => T;
  getVariantId: (testName: string) => string | null;
}

const ABTestWrapperContext = createContext<{
  variants: Record<string, string>;
  configs: Record<string, any>;
  isVariant: (testName: string, variantId: string) => boolean;
  getConfig: <T>(testName: string, key: string, defaultValue?: T) => T;
  getVariantId: (testName: string) => string | null;
} | null>(null);

function ABTestWrapper({ children, ...contextValue }: ABTestWrapperProps) {
  return (
    <ABTestWrapperContext.Provider value={contextValue}>
      {children}
    </ABTestWrapperContext.Provider>
  );
}

export function useABTest(testName?: string) {
  const context = useContext(ABTestWrapperContext);
  const { track } = useConversionTracking();
  
  if (!context) {
    // Fallback for SSR or when provider is not available
    return {
      variantId: 'control',
      config: {},
      isVariant: () => false,
      getConfig: (key: string, defaultValue?: any) => defaultValue,
      trackConversion: () => {},
      getVariantId: () => 'control'
    };
  }

  const { variants, configs, isVariant, getConfig, getVariantId } = context;

  // If no test name provided, return general utilities
  if (!testName) {
    return {
      isVariant: (testName: string, variantId: string) => isVariant(testName, variantId),
      getConfig: <T,>(testName: string, key: string, defaultValue?: T) => getConfig(testName, key, defaultValue),
      getVariantId: (testName: string) => getVariantId(testName),
      trackConversion: (testName: string, conversionType: string, value?: number) => {
        const variantId = getVariantId(testName);
        track('ab_test_conversion', {
          test_name: testName,
          variant_id: variantId,
          conversion_type: conversionType,
          value
        });
      }
    };
  }

  // Test-specific utilities
  const variantId = getVariantId(testName);
  const config = configs[testName] || {};

  return {
    variantId,
    config,
    isVariant: (variantId: string) => isVariant(testName, variantId),
    getConfig: <T,>(key: string, defaultValue?: T) => getConfig(testName, key, defaultValue),
    trackConversion: (conversionType: string, value?: number) => {
      track('ab_test_conversion', {
        test_name: testName,
        variant_id: variantId,
        conversion_type: conversionType,
        value
      });
    }
  };
}

// Utility component for conditional rendering based on A/B tests
interface ABTestComponentProps {
  testName: string;
  variantId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ABTestComponent({ testName, variantId, children, fallback = null }: ABTestComponentProps) {
  const { isVariant } = useABTest();
  
  if (isVariant(testName, variantId)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}

// Hook for getting multiple test configurations at once
export function useMultipleABTests(testNames: string[]) {
  const context = useContext(ABTestWrapperContext);
  
  if (!context) {
    // Fallback for SSR
    return testNames.reduce((acc, testName) => {
      acc[testName] = {
        variantId: 'control',
        getConfig: (key: string, defaultValue?: any) => defaultValue
      };
      return acc;
    }, {} as Record<string, any>);
  }

  const { getVariantId, getConfig } = context;
  
  return testNames.reduce((acc, testName) => {
    acc[testName] = {
      variantId: getVariantId(testName),
      getConfig: <T,>(key: string, defaultValue?: T) => getConfig(testName, key, defaultValue)
    };
    return acc;
  }, {} as Record<string, any>);
}

// React component for A/B test analytics dashboard
export function ABTestAnalytics() {
  const [testResults, setTestResults] = useState<any[]>([]);
  
  useEffect(() => {
    loadTestResults();
  }, []);

  const loadTestResults = async () => {
    try {
      const response = await fetch('/api/analytics/ab-tests');
      const data = await response.json();
      setTestResults(data);
    } catch (error) {
      console.error('Failed to load A/B test results:', error);
    }
  };

  if (testResults.length === 0) {
    return <div>Loading A/B test results...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">A/B Test Results</h2>
      
      {testResults.map((test) => (
        <div key={test.name} className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">{test.name}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {test.variants.map((variant: any) => (
              <div key={variant.id} className="border p-4 rounded">
                <h4 className="font-medium">{variant.name}</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <div>Conversions: {variant.conversions}</div>
                  <div>Visitors: {variant.visitors}</div>
                  <div>Rate: {((variant.conversions / variant.visitors) * 100).toFixed(2)}%</div>
                  <div className={`font-semibold ${
                    variant.statistical_significance > 0.95 ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {variant.statistical_significance > 0.95 ? 'Statistically Significant' : 'Not Significant'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}