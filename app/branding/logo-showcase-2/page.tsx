/**
 * HERA Logo Showcase 2.0 - Enhanced Design System
 * Demonstrates the improved logo variants with modern typography and better orange integration
 */

"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  HERALogo, 
  HERAEnterpriseMarkLogo, 
  HERAModernLogo, 
  HERAGeometricLogo, 
  HERAMonogram, 
  HERALogoUsage 
} from '@/components/branding/HERALogo';
import { 
  Sun, 
  Moon, 
  Download, 
  Eye, 
  Palette, 
  Settings, 
  Code, 
  Zap,
  Sparkles
} from 'lucide-react';

export default function HERALogoShowcase2() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [animationEnabled, setAnimationEnabled] = useState(true);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const toggleAnimation = () => setAnimationEnabled(!animationEnabled);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-slate-50 to-gray-100'}`}>
      {/* Header */}
      <motion.header 
        className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'} border-b shadow-sm sticky top-0 z-50`}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <HERAEnterpriseMarkLogo size="md" theme={isDarkMode ? 'dark' : 'light'} animated />
              <div className="flex items-center gap-2">
                <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  2.0 Enhanced
                </Badge>
                <Badge variant="outline" className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
                  Logo Showcase
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAnimation}
                className="flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                {animationEnabled ? 'Disable' : 'Enable'} Animation
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={toggleDarkMode}
                className="flex items-center gap-2"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {isDarkMode ? 'Light' : 'Dark'} Mode
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className={`text-5xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            HERA Logo System 2.0
          </h1>
          <p className={`text-xl mb-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            Enhanced minimalist design with improved typography and orange integration
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Badge className="bg-green-100 text-green-700 border-green-200">
              <Code className="w-3 h-3 mr-1" />
              Modern Typography
            </Badge>
            <Badge className="bg-purple-100 text-purple-700 border-purple-200">
              <Palette className="w-3 h-3 mr-1" />
              Enhanced Orange Element
            </Badge>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
              <Eye className="w-3 h-3 mr-1" />
              Dark Mode Support
            </Badge>
            <Badge className="bg-orange-100 text-orange-700 border-orange-200">
              <Settings className="w-3 h-3 mr-1" />
              3 Distinct Variations
            </Badge>
          </div>
        </motion.div>

        {/* Logo Variants Showcase */}
        <Tabs defaultValue="enhanced" className="w-full">
          <TabsList className={`grid w-full grid-cols-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <TabsTrigger value="enhanced">Enhanced Enterprise</TabsTrigger>
            <TabsTrigger value="modern">Modern Crossbar</TabsTrigger>
            <TabsTrigger value="geometric">Geometric</TabsTrigger>
            <TabsTrigger value="comparison">All Variants</TabsTrigger>
          </TabsList>

          {/* Enhanced Enterprise Mark */}
          <TabsContent value="enhanced" className="mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'} shadow-lg`}>
                <CardHeader>
                  <CardTitle className={`text-2xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Enhanced Enterprise Mark
                  </CardTitle>
                  <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    The original enterprise logo enhanced with gradient R and improved typography
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className={`p-8 rounded-lg ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'} text-center`}>
                      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        Light Theme
                      </h3>
                      <div className="space-y-6">
                        <HERAEnterpriseMarkLogo size="xl" theme="light" animated={animationEnabled} />
                        <HERAEnterpriseMarkLogo size="lg" theme="light" animated={animationEnabled} />
                        <HERAEnterpriseMarkLogo size="md" theme="light" animated={animationEnabled} />
                        <HERAEnterpriseMarkLogo size="sm" theme="light" animated={animationEnabled} />
                      </div>
                    </div>
                    
                    <div className="p-8 rounded-lg bg-slate-800 text-center">
                      <h3 className="text-lg font-semibold mb-4 text-white">
                        Dark Theme
                      </h3>
                      <div className="space-y-6">
                        <HERAEnterpriseMarkLogo size="xl" theme="dark" animated={animationEnabled} />
                        <HERAEnterpriseMarkLogo size="lg" theme="dark" animated={animationEnabled} />
                        <HERAEnterpriseMarkLogo size="md" theme="dark" animated={animationEnabled} />
                        <HERAEnterpriseMarkLogo size="sm" theme="dark" animated={animationEnabled} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="font-semibold text-orange-800 mb-2">Key Features</h4>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• Enhanced typography with Inter/SF Pro Display font family</li>
                      <li>• Gradient orange R for better visual hierarchy</li>
                      <li>• Improved letter spacing for better readability</li>
                      <li>• Animated orange dot with subtle pulsing effect</li>
                      <li>• Automatic dark mode theming</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Modern Crossbar */}
          <TabsContent value="modern" className="mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'} shadow-lg`}>
                <CardHeader>
                  <CardTitle className={`text-2xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Modern Logo with Orange Crossbar
                  </CardTitle>
                  <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    Clean, modern approach with orange element integrated as the R crossbar
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className={`p-8 rounded-lg ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'} text-center`}>
                      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        Light Theme
                      </h3>
                      <div className="space-y-6">
                        <HERAModernLogo size="xl" theme="light" animated={animationEnabled} />
                        <HERAModernLogo size="lg" theme="light" animated={animationEnabled} />
                        <HERAModernLogo size="md" theme="light" animated={animationEnabled} />
                        <HERAModernLogo size="sm" theme="light" animated={animationEnabled} />
                      </div>
                    </div>
                    
                    <div className="p-8 rounded-lg bg-slate-800 text-center">
                      <h3 className="text-lg font-semibold mb-4 text-white">
                        Dark Theme
                      </h3>
                      <div className="space-y-6">
                        <HERAModernLogo size="xl" theme="dark" animated={animationEnabled} />
                        <HERAModernLogo size="lg" theme="dark" animated={animationEnabled} />
                        <HERAModernLogo size="md" theme="dark" animated={animationEnabled} />
                        <HERAModernLogo size="sm" theme="dark" animated={animationEnabled} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Key Features</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Orange crossbar integrated seamlessly into the R letterform</li>
                      <li>• Animated crossbar reveal effect</li>
                      <li>• Minimal design perfect for modern interfaces</li>
                      <li>• Consistent letter spacing and typography</li>
                      <li>• Subtle glow effect on the orange crossbar</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Geometric */}
          <TabsContent value="geometric" className="mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'} shadow-lg`}>
                <CardHeader>
                  <CardTitle className={`text-2xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Geometric Logo with Orange Square
                  </CardTitle>
                  <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    Bold geometric approach with orange square as a separate brand element
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className={`p-8 rounded-lg ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'} text-center`}>
                      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        Light Theme
                      </h3>
                      <div className="space-y-6">
                        <HERAGeometricLogo size="xl" theme="light" animated={animationEnabled} />
                        <HERAGeometricLogo size="lg" theme="light" animated={animationEnabled} />
                        <HERAGeometricLogo size="md" theme="light" animated={animationEnabled} />
                        <HERAGeometricLogo size="sm" theme="light" animated={animationEnabled} />
                      </div>
                    </div>
                    
                    <div className="p-8 rounded-lg bg-slate-800 text-center">
                      <h3 className="text-lg font-semibold mb-4 text-white">
                        Dark Theme
                      </h3>
                      <div className="space-y-6">
                        <HERAGeometricLogo size="xl" theme="dark" animated={animationEnabled} />
                        <HERAGeometricLogo size="lg" theme="dark" animated={animationEnabled} />
                        <HERAGeometricLogo size="md" theme="dark" animated={animationEnabled} />
                        <HERAGeometricLogo size="sm" theme="dark" animated={animationEnabled} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-800 mb-2">Key Features</h4>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• Geometric orange square with rounded corners</li>
                      <li>• Animated square entrance with rotation effect</li>
                      <li>• Perfect for marketing materials and presentations</li>
                      <li>• Clear separation between brand mark and wordmark</li>
                      <li>• Scalable geometric proportions</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* All Variants Comparison */}
          <TabsContent value="comparison" className="mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'} shadow-lg`}>
                <CardHeader>
                  <CardTitle className={`text-2xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    All Logo Variants Comparison
                  </CardTitle>
                  <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    Compare all logo variants side by side to understand their unique characteristics
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Enhanced Enterprise */}
                    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'} text-center`}>
                      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        Enhanced Enterprise
                      </h3>
                      <div className="space-y-4">
                        <HERAEnterpriseMarkLogo size="lg" theme={isDarkMode ? 'dark' : 'light'} animated={animationEnabled} />
                        <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          Perfect for professional applications like POS systems and dashboards
                        </p>
                      </div>
                    </div>
                    
                    {/* Modern Crossbar */}
                    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'} text-center`}>
                      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        Modern Crossbar
                      </h3>
                      <div className="space-y-4">
                        <HERAModernLogo size="lg" theme={isDarkMode ? 'dark' : 'light'} animated={animationEnabled} />
                        <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          Clean and modern, ideal for contemporary interfaces and mobile applications
                        </p>
                      </div>
                    </div>
                    
                    {/* Geometric */}
                    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'} text-center`}>
                      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        Geometric Square
                      </h3>
                      <div className="space-y-4">
                        <HERAGeometricLogo size="lg" theme={isDarkMode ? 'dark' : 'light'} animated={animationEnabled} />
                        <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          Bold and distinctive, perfect for marketing materials and brand recognition
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Original logos for comparison */}
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                      Original Logo Variants
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'} text-center`}>
                        <HERALogo variant="full" size="md" animated={animationEnabled} />
                        <p className={`text-xs mt-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Full with Tagline</p>
                      </div>
                      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'} text-center`}>
                        <HERALogo variant="compact" size="md" animated={animationEnabled} />
                        <p className={`text-xs mt-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Compact Version</p>
                      </div>
                      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'} text-center`}>
                        <HERAMonogram size="md" animated={animationEnabled} />
                        <p className={`text-xs mt-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Monogram</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Usage Guidelines */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <HERALogoUsage />
        </motion.div>
      </div>
    </div>
  );
}