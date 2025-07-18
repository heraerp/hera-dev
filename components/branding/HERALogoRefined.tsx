/**
 * HERA Logo - Refined Typography Variations
 * World-class minimalist logo design with geometric sophistication
 * Multiple variations with integrated orange elements and custom letterforms
 */

"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Palette, Sun, Moon, Zap } from 'lucide-react';

interface HERALogoRefinedProps {
  variant?: 'geometric' | 'crossbar' | 'dot-punctuation' | 'negative-space';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'light' | 'dark';
  animated?: boolean;
  className?: string;
}

// Variation 1: Geometric Futura-inspired with integrated orange dot
export const HERAGeometric: React.FC<HERALogoRefinedProps> = ({
  size = 'md',
  theme = 'light',
  animated = false,
  className = ''
}) => {
  const sizeConfig = {
    sm: { container: 'h-8', text: 'text-2xl', dot: 'w-1.5 h-1.5' },
    md: { container: 'h-10', text: 'text-3xl', dot: 'w-2 h-2' },
    lg: { container: 'h-12', text: 'text-4xl', dot: 'w-2.5 h-2.5' },
    xl: { container: 'h-16', text: 'text-5xl', dot: 'w-3 h-3' }
  }[size];

  const colors = theme === 'dark' 
    ? { text: '#FFFFFF', dot: '#FF6B35' }
    : { text: '#000000', dot: '#FF6B35' };

  const [animationState, setAnimationState] = React.useState<'rest' | 'pulse'>('rest');

  React.useEffect(() => {
    if (!animated) return;

    const startCycle = () => {
      setAnimationState('pulse');
      setTimeout(() => setAnimationState('rest'), 2400);
    };

    const initialDelay = setTimeout(startCycle, 1000);
    const interval = setInterval(startCycle, 8000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [animated]);

  return (
    <div className={`${sizeConfig.container} flex items-center ${className}`}>
      <div className="relative flex items-baseline">
        <span
          className={sizeConfig.text}
          style={{
            fontFamily: '"SF Pro Display", -apple-system, system-ui, sans-serif',
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: colors.text,
            lineHeight: 1
          }}
        >
          HER
        </span>
        <div className="relative">
          <span
            className={sizeConfig.text}
            style={{
              fontFamily: '"SF Pro Display", -apple-system, system-ui, sans-serif',
              fontWeight: 600,
              letterSpacing: '0.08em',
              color: colors.text,
              lineHeight: 1
            }}
          >
            A
          </span>
          <motion.div
            className={`absolute top-1 right-0 ${sizeConfig.dot} rounded-full`}
            style={{ backgroundColor: colors.dot }}
            animate={animated && animationState === 'pulse' ? {
              scale: [1, 1.3, 1],
              opacity: [1, 0.7, 1]
            } : { scale: 1, opacity: 1 }}
            transition={{
              duration: 0.6,
              repeat: animationState === 'pulse' ? 2 : 0,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Variation 2: Orange crossbar replacing the A's crossbar
export const HERACrossbar: React.FC<HERALogoRefinedProps> = ({
  size = 'md',
  theme = 'light',
  animated = false,
  className = ''
}) => {
  const sizeConfig = {
    sm: { container: 'h-8', text: 'text-2xl', crossbar: 'h-0.5' },
    md: { container: 'h-10', text: 'text-3xl', crossbar: 'h-0.5' },
    lg: { container: 'h-12', text: 'text-4xl', crossbar: 'h-1' },
    xl: { container: 'h-16', text: 'text-5xl', crossbar: 'h-1' }
  }[size];

  const colors = theme === 'dark' 
    ? { text: '#FFFFFF', crossbar: '#FF6B35' }
    : { text: '#000000', crossbar: '#FF6B35' };

  return (
    <div className={`${sizeConfig.container} flex items-center ${className}`}>
      <div className="relative flex items-baseline">
        <span
          className={sizeConfig.text}
          style={{
            fontFamily: '"Inter", system-ui, sans-serif',
            fontWeight: 700,
            letterSpacing: '0.05em',
            color: colors.text,
            lineHeight: 1
          }}
        >
          HER
        </span>
        <div className="relative mx-1">
          {/* Custom A with orange crossbar */}
          <svg 
            viewBox="0 0 24 32" 
            className={sizeConfig.text}
            style={{ 
              width: size === 'sm' ? '18px' : size === 'md' ? '24px' : size === 'lg' ? '30px' : '40px',
              height: size === 'sm' ? '24px' : size === 'md' ? '32px' : size === 'lg' ? '40px' : '54px'
            }}
          >
            {/* A letter paths */}
            <path
              d="M12 2 L22 30 L18 30 L16 24 L8 24 L6 30 L2 30 L12 2 Z"
              fill={colors.text}
            />
            {/* Orange crossbar */}
            <motion.rect
              x="8.5"
              y="19"
              width="7"
              height="2"
              fill={colors.crossbar}
              animate={animated ? {
                scaleX: [1, 1.1, 1],
                opacity: [1, 0.8, 1]
              } : undefined}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

// Variation 3: Orange dot as intentional punctuation/period
export const HERADotPunctuation: React.FC<HERALogoRefinedProps> = ({
  size = 'md',
  theme = 'light',
  animated = false,
  className = ''
}) => {
  const sizeConfig = {
    sm: { container: 'h-8', text: 'text-2xl', dot: 'w-1.5 h-1.5' },
    md: { container: 'h-10', text: 'text-3xl', dot: 'w-2 h-2' },
    lg: { container: 'h-12', text: 'text-4xl', dot: 'w-3 h-3' },
    xl: { container: 'h-16', text: 'text-5xl', dot: 'w-4 h-4' }
  }[size];

  const colors = theme === 'dark' 
    ? { text: '#FFFFFF', dot: '#FF6B35' }
    : { text: '#000000', dot: '#FF6B35' };

  return (
    <div className={`${sizeConfig.container} flex items-end ${className}`}>
      <span
        className={sizeConfig.text}
        style={{
          fontFamily: '"Helvetica Neue", "Arial", system-ui, sans-serif',
          fontWeight: 300,
          letterSpacing: '0.12em',
          color: colors.text,
          lineHeight: 1
        }}
      >
        HERA
      </span>
      <motion.div
        className={`${sizeConfig.dot} rounded-full ml-1 mb-1`}
        style={{ backgroundColor: colors.dot }}
        animate={animated ? {
          scale: [1, 1.2, 1],
          y: [0, -2, 0]
        } : undefined}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

// Variation 4: Negative space integration in the R
export const HERANegativeSpace: React.FC<HERALogoRefinedProps> = ({
  size = 'md',
  theme = 'light',
  animated = false,
  className = ''
}) => {
  const sizeConfig = {
    sm: { container: 'h-8', text: 'text-2xl' },
    md: { container: 'h-10', text: 'text-3xl' },
    lg: { container: 'h-12', text: 'text-4xl' },
    xl: { container: 'h-16', text: 'text-5xl' }
  }[size];

  const colors = theme === 'dark' 
    ? { text: '#FFFFFF', accent: '#FF6B35' }
    : { text: '#000000', accent: '#FF6B35' };

  return (
    <div className={`${sizeConfig.container} flex items-center ${className}`}>
      <div className="flex items-baseline">
        <span
          className={sizeConfig.text}
          style={{
            fontFamily: '"SF Pro Display", -apple-system, system-ui, sans-serif',
            fontWeight: 500,
            letterSpacing: '0.06em',
            color: colors.text,
            lineHeight: 1
          }}
        >
          HE
        </span>
        
        {/* Custom R with negative space */}
        <div className="relative mx-0.5">
          <svg 
            viewBox="0 0 20 32" 
            className={sizeConfig.text}
            style={{ 
              width: size === 'sm' ? '15px' : size === 'md' ? '20px' : size === 'lg' ? '25px' : '32px',
              height: size === 'sm' ? '24px' : size === 'md' ? '32px' : size === 'lg' ? '40px' : '54px'
            }}
          >
            {/* R letter with orange negative space */}
            <path
              d="M2 30 L2 2 L12 2 Q18 2 18 8 Q18 14 12 14 L18 30 L14 30 L9 14 L6 14 L6 30 L2 30 Z M6 6 L6 10 L12 10 Q14 10 14 8 Q14 6 12 6 L6 6 Z"
              fill={colors.text}
            />
            {/* Orange accent in negative space */}
            <motion.circle
              cx="14"
              cy="8"
              r="1.5"
              fill={colors.accent}
              animate={animated ? {
                scale: [1, 1.2, 1],
                opacity: [1, 0.7, 1]
              } : undefined}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </svg>
        </div>

        <span
          className={sizeConfig.text}
          style={{
            fontFamily: '"SF Pro Display", -apple-system, system-ui, sans-serif',
            fontWeight: 500,
            letterSpacing: '0.06em',
            color: colors.text,
            lineHeight: 1
          }}
        >
          A
        </span>
      </div>
    </div>
  );
};

// Showcase component with all variations
export const HERALogoShowcase: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
  const [animationEnabled, setAnimationEnabled] = useState(true);

  const variations = [
    {
      name: 'Geometric Precision',
      component: HERAGeometric,
      description: 'Futura-inspired with integrated orange positioning marker',
      concept: 'Clean geometric sans-serif with the orange dot positioned as a visual anchor point, suggesting precision and forward movement.'
    },
    {
      name: 'Structural Integration', 
      component: HERACrossbar,
      description: 'Orange crossbar replaces traditional A structure',
      concept: 'The orange element becomes functional typography - the crossbar of the A - creating perfect integration between brand color and letterform.'
    },
    {
      name: 'Intentional Punctuation',
      component: HERADotPunctuation,
      description: 'Orange dot as purposeful period/statement marker',
      concept: 'Typography-forward approach where the orange serves as deliberate punctuation, creating a confident brand statement with "HERA."'
    },
    {
      name: 'Negative Space Intelligence',
      component: HERANegativeSpace,
      description: 'Orange accent integrated within the R\'s counter space',
      concept: 'Sophisticated use of negative space where the orange element lives within the letterform, suggesting intelligence and hidden depth.'
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      currentTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className={`border-b transition-colors duration-300 ${
        currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold transition-colors duration-300 ${
                currentTheme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                HERA Logo Refinements
              </h1>
              <p className={`text-sm transition-colors duration-300 ${
                currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                World-class typographic variations with geometric sophistication
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant={animationEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setAnimationEnabled(!animationEnabled)}
              >
                <Zap className="w-4 h-4 mr-1" />
                {animationEnabled ? 'Animated' : 'Static'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentTheme(currentTheme === 'light' ? 'dark' : 'light')}
              >
                {currentTheme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Design Philosophy */}
        <Card className={`mb-8 transition-colors duration-300 ${
          currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'
        }`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 transition-colors duration-300 ${
              currentTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <Palette className="w-5 h-5" />
              Design Philosophy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className={`font-semibold mb-3 transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                }`}>
                  Geometric Excellence
                </h3>
                <ul className={`space-y-2 text-sm transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <li>• Inspired by Futura and Avenir's geometric precision</li>
                  <li>• Clean, modern letterforms with subtle customizations</li>
                  <li>• Intentional orange element integration vs. arbitrary placement</li>
                  <li>• Multiple approaches: structural, decorative, and functional</li>
                </ul>
              </div>
              <div>
                <h3 className={`font-semibold mb-3 transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                }`}>
                  Enterprise Sophistication
                </h3>
                <ul className={`space-y-2 text-sm transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <li>• Maintains professional authority and confidence</li>
                  <li>• Tech-forward aesthetic suitable for AI/ERP positioning</li>
                  <li>• Scalable from business cards to digital displays</li>
                  <li>• Light and dark mode optimization</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logo Variations */}
        <div className="grid gap-8">
          {variations.map((variation, index) => {
            const Component = variation.component;
            return (
              <Card key={index} className={`transition-colors duration-300 ${
                currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'
              }`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className={`transition-colors duration-300 ${
                        currentTheme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {variation.name}
                      </CardTitle>
                      <p className={`text-sm mt-1 transition-colors duration-300 ${
                        currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {variation.description}
                      </p>
                    </div>
                    <Badge variant="outline">
                      Variation {index + 1}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Logo Display */}
                    <div className={`rounded-lg p-8 flex items-center justify-center transition-colors duration-300 ${
                      currentTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
                    }`}>
                      <Component 
                        size="lg" 
                        theme={currentTheme} 
                        animated={animationEnabled}
                      />
                    </div>
                    
                    {/* Concept Description */}
                    <div className="flex flex-col justify-center">
                      <h4 className={`font-semibold mb-3 transition-colors duration-300 ${
                        currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                      }`}>
                        Design Concept
                      </h4>
                      <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                        currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {variation.concept}
                      </p>
                      
                      {/* Size variations */}
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <p className={`text-xs font-medium mb-2 transition-colors duration-300 ${
                          currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          SCALABILITY TEST
                        </p>
                        <div className="flex items-end gap-4">
                          <Component size="sm" theme={currentTheme} />
                          <Component size="md" theme={currentTheme} />
                          <Component size="lg" theme={currentTheme} />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Implementation Notes */}
        <Card className={`mt-8 transition-colors duration-300 ${
          currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'
        }`}>
          <CardHeader>
            <CardTitle className={`transition-colors duration-300 ${
              currentTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Implementation Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className={`font-semibold mb-2 transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                }`}>
                  Primary Usage
                </h4>
                <p className={`text-sm transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Recommend <strong>Geometric Precision</strong> for main brand applications. 
                  Clean, scalable, and perfectly balanced for enterprise contexts.
                </p>
              </div>
              <div>
                <h4 className={`font-semibold mb-2 transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                }`}>
                  Digital Interfaces
                </h4>
                <p className={`text-sm transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <strong>Structural Integration</strong> works beautifully in headers and navigation. 
                  The orange crossbar creates unique recognition.
                </p>
              </div>
              <div>
                <h4 className={`font-semibold mb-2 transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                }`}>
                  Premium Applications
                </h4>
                <p className={`text-sm transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <strong>Negative Space Intelligence</strong> for sophisticated contexts like 
                  presentations and premium marketing materials.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HERALogoShowcase;