/**
 * HERA Logo Showcase - Pentagram Design Presentation
 * Professional logo variants for universal AI-orchestrated ERP brand
 */

"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  HERALogo, 
  HERAEnterpriseMarkLogo, 
  HERAMonogram, 
  HERALogoUsage 
} from '@/components/branding/HERALogo';
import { RESTAURANT_TYPOGRAPHY } from '@/lib/design/RestaurantBrandSystem';
import {
  Palette,
  Zap,
  Download,
  Eye,
  Sparkles,
  Building,
  Smartphone,
  Monitor,
  FileText,
  Star,
  Award
} from 'lucide-react';

export default function LogoShowcasePage() {
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'colored'>('colored');
  const [selectedSize, setSelectedSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [animationEnabled, setAnimationEnabled] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <HERALogo variant="compact" size="md" theme="colored" />
              <div className="border-l border-gray-200 pl-4">
                <h1 className={`text-lg font-semibold text-slate-800`}
                   style={{ fontFamily: RESTAURANT_TYPOGRAPHY.fontFamilies.display }}>
                  Logo Showcase
                </h1>
                <p className="text-xs text-slate-500 tracking-wide">
                  PENTAGRAM DESIGN PRESENTATION
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                <Award className="w-3 h-3 mr-1" />
                Pentagram Design
              </Badge>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                <Sparkles className="w-3 h-3 mr-1" />
                Enterprise Grade
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Brand Introduction */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <HERAEnterpriseMarkLogo size="xl" animated />
            <h1 className={`text-4xl font-bold text-slate-800 mt-6 mb-4`}
               style={{ fontFamily: RESTAURANT_TYPOGRAPHY.fontFamilies.display }}>
              HERA Universal Brand Identity
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              A sophisticated typography logo designed to compete with enterprise giants like SAP. 
              HERA represents the future of AI-orchestrated ERP systems with intelligent, 
              modern aesthetics that convey trust, innovation, and universal capability.
            </p>
          </motion.div>
        </div>

        {/* Interactive Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Interactive Logo Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* Theme Selection */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Theme</label>
                <div className="flex gap-1">
                  {(['light', 'dark', 'colored'] as const).map((theme) => (
                    <Button
                      key={theme}
                      variant={selectedTheme === theme ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTheme(theme)}
                      className="capitalize"
                    >
                      {theme}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Size</label>
                <div className="flex gap-1">
                  {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSize(size)}
                      className="uppercase"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Animation Toggle */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Animation</label>
                <Button
                  variant={animationEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAnimationEnabled(!animationEnabled)}
                  className="w-full"
                >
                  <Zap className="w-4 h-4 mr-1" />
                  {animationEnabled ? 'Enabled' : 'Disabled'}
                </Button>
              </div>

              {/* Download */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Export</label>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="w-4 h-4 mr-1" />
                  Assets
                </Button>
              </div>
            </div>

            {/* Live Preview */}
            <div className={`p-8 rounded-lg border-2 border-dashed border-gray-300 ${
              selectedTheme === 'dark' ? 'bg-slate-800' : 'bg-white'
            }`}>
              <div className="flex items-center justify-center">
                <HERALogo
                  variant="full"
                  size={selectedSize}
                  theme={selectedTheme}
                  animated={animationEnabled}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logo Variants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          
          {/* Full Logo */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="w-5 h-5" />
                Full Logo with Tagline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-6 rounded-lg mb-4 flex items-center justify-center min-h-[120px]">
                <HERALogo variant="full" size="lg" theme="colored" animated />
              </div>
              <p className="text-sm text-slate-600">
                Primary logo for main brand applications, websites, and marketing materials. 
                Includes the AI orchestration tagline for clear positioning.
              </p>
            </CardContent>
          </Card>

          {/* Compact Logo */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Compact Version
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-6 rounded-lg mb-4 flex items-center justify-center min-h-[120px]">
                <HERALogo variant="compact" size="lg" theme="colored" animated />
              </div>
              <p className="text-sm text-slate-600">
                Ideal for navigation bars, headers, and horizontal layouts where space is limited. 
                Maintains brand recognition without the tagline.
              </p>
            </CardContent>
          </Card>

          {/* Icon Only */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Icon Only
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-6 rounded-lg mb-4 flex items-center justify-center min-h-[120px]">
                <HERALogo variant="icon" size="lg" theme="colored" animated />
              </div>
              <p className="text-sm text-slate-600">
                Perfect for favicons, app icons, and very small applications. 
                The distinctive 'H' with AI indicator maintains brand identity.
              </p>
            </CardContent>
          </Card>

          {/* Enterprise Mark */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Enterprise Mark
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-6 rounded-lg mb-4 flex items-center justify-center min-h-[120px]">
                <HERAEnterpriseMarkLogo size="lg" animated />
              </div>
              <p className="text-sm text-slate-600">
                Gradient version for presentations, enterprise documents, and premium applications. 
                Conveys sophistication and enterprise credibility.
              </p>
            </CardContent>
          </Card>

          {/* Monogram */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="w-5 h-5" />
                Monogram
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-6 rounded-lg mb-4 flex items-center justify-center min-h-[120px]">
                <HERAMonogram size="lg" theme="colored" animated />
              </div>
              <p className="text-sm text-slate-600">
                Contained version for social media profiles, stamps, and branded elements. 
                Works excellently as a standalone brand mark.
              </p>
            </CardContent>
          </Card>

          {/* Dark Background Example */}
          <Card className="overflow-hidden bg-slate-800">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Dark Background
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-900 p-6 rounded-lg mb-4 flex items-center justify-center min-h-[120px]">
                <HERALogo variant="compact" size="lg" theme="dark" animated />
              </div>
              <p className="text-sm text-slate-300">
                Light version optimized for dark backgrounds and night mode interfaces. 
                Maintains clarity and brand consistency.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Brand Positioning Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Enterprise Brand Positioning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-orange-600" />
                  Competitive Analysis
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">SAP</span>
                    <span className="text-sm text-slate-600">Legacy, complex, blue-heavy</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Oracle</span>
                    <span className="text-sm text-slate-600">Traditional, corporate, red accent</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <span className="font-bold text-orange-800">HERA</span>
                    <span className="text-sm text-orange-700">Modern, AI-first, warm sophistication</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-600" />
                  Design Principles
                </h3>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Timeless Typography:</strong> Playfair Display conveys sophistication and reliability</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>AI Indicator:</strong> The orange dot symbolizes intelligent orchestration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Warm Authority:</strong> Orange accent humanizes enterprise software</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Universal Scalability:</strong> Works from favicon to billboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Future-Proof:</strong> Avoids trends, focuses on enduring design</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Guidelines */}
        <HERALogoUsage />
      </div>
    </div>
  );
}