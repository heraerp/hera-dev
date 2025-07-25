'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, User, TrendingUp, Target, Users, DollarSign, Building, Lightbulb, BarChart, Rocket, CheckCircle, Brain, Trophy, Award, Star, Globe, Clock, Maximize, Minimize, Download, Eye, EyeOff, Lock } from 'lucide-react';

interface SlideProps {
  isActive: boolean;
  children: React.ReactNode;
}

const Slide: React.FC<SlideProps> = ({ isActive, children }) => (
  <div className={`
    absolute inset-0 transition-all duration-700 ease-out
    ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
  `}>
    <div className="h-full w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-full max-h-full overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  </div>
);

export default function SeedDeckTemplate() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isGeneratingPPT, setIsGeneratingPPT] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const totalSlides = 11;

  // Minimum distance for a swipe (in pixels)
  const minSwipeDistance = 50;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Password handling
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'NextDecade') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password. Please try again.');
      setPassword('');
    }
  };

  // Fullscreen functionality
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Touch gesture handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentSlide < totalSlides - 1) {
      nextSlide();
    }
    if (isRightSwipe && currentSlide > 0) {
      prevSlide();
    }
  };

  // Listen for fullscreen changes
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Simple deck export function
  const exportDeck = () => {
    if (isGeneratingPPT) return;
    
    try {
      setIsGeneratingPPT(true);

      // Create slide data
      const slides = [
        {
          title: 'HERA',
          subtitle: 'Universal Business Platform',
          content: ['Seed Round Pitch Deck', 'Hanaset Inc • Dover, Delaware', '', 'Revolutionizing Enterprise Software with Universal Architecture']
        },
        {
          title: 'The Problem',
          subtitle: 'Traditional ERP systems fail 70% of the time',
          content: ['• 18+ month implementations', '• $2M+ average cost', '• 200+ rigid database tables', '• 70% failure rate', '• Complex customizations required']
        },
        {
          title: 'The Solution',
          subtitle: 'HERA Universal Platform',
          content: ['• 24-hour deployment', '• $0 implementation cost', '• 5+ universal tables', '• 95%+ success rate', '• AI-native intelligence', '• Template-driven architecture']
        },
        {
          title: 'Traction',
          subtitle: 'Multi-Vertical Go-to-Market Strategy',
          content: [
            'Go-to-Market Traction Matrix:',
            '',
            '31st July 2025: Go Live - Education Platform',
            '31st Aug 2025: Go Live - Restaurant ERP (India) + Education Customer Onboarding',
            '30th Sep 2025: Go Live - Coffee Shop (Oman) + Accounting Firms (India & Oman)',
            '',
            '• 3 Verticals: Education, Restaurant, Professional Services',
            '• 2 Markets: India & Oman initial launch',
            '• 6 Days to Revenue: Education platform launches 31st July',
            '• Platform Status: Ready for Launch'
          ]
        },
        {
          title: 'Business Model',
          subtitle: 'Multiple Revenue Streams',
          content: ['• SaaS Subscriptions: $500-$5,000/month', '• Template Marketplace: 20% revenue share', '• Enterprise Licensing: White-label solutions', '• Professional Services: Implementation support', '• LTV:CAC Ratio: 12:1']
        },
        {
          title: 'Market Opportunity',
          subtitle: '$850B+ Market Disruption',
          content: ['• TAM: $850B Global Enterprise Software', '• SAM: $400B SMB & Mid-Market ERP', '• SOM: $40B Obtainable Market (10% in 5 years)', '• Growing 8-12% annually', '• Perfect market timing with AI infrastructure maturity']
        },
        {
          title: 'The Team',
          subtitle: 'Built by Visionaries',
          content: ['CEO: Enterprise software expertise, AI/ML background', 'CTO: Universal architecture pioneer, scale engineering expert', '', 'The only team capable of building this solution', 'Perfect problem-solution fit with deep domain expertise']
        },
        {
          title: 'Investment Opportunity',
          subtitle: '$2M Seed Round',
          content: ['• 18 months runway to Series A', '• $500K MRR target', '• Use of funds: 40% Product & AI, 30% Sales & Marketing', '• 20% Team Building, 10% Operations & Legal', '• Once-in-a-decade opportunity']
        },
        {
          title: 'Thank You',
          subtitle: 'Questions & Discussion',
          content: ['founders@hanaset.com', 'heraerp.com', '', '$850B Market • 2-3 Year Window • Winner-Take-All', 'The time to invest in the future of enterprise software is now']
        }
      ];

      // Generate HTML content
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HERA Seed Deck - Hanaset Inc</title>
    <style>
        @page { size: landscape; margin: 20mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8fafc;
            color: #1e293b;
            line-height: 1.6;
        }
        .slide {
            width: 100vw;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 60px;
            page-break-after: always;
            background: linear-gradient(to br, #f8fafc, #f1f5f9);
        }
        .slide:last-child { page-break-after: avoid; }
        .slide-title {
            font-size: 4rem;
            font-weight: bold;
            color: #10b981;
            margin-bottom: 20px;
        }
        .slide-subtitle {
            font-size: 2rem;
            color: #475569;
            margin-bottom: 40px;
        }
        .slide-content {
            font-size: 1.5rem;
            color: #64748b;
            max-width: 800px;
            text-align: left;
        }
        .slide-content li {
            margin-bottom: 10px;
            list-style: none;
        }
        .footer {
            position: fixed;
            bottom: 20px;
            right: 20px;
            font-size: 0.9rem;
            color: #94a3b8;
        }
        @media print {
            .slide { page-break-after: always; }
        }
    </style>
</head>
<body>
${slides.map((slide, index) => `
    <div class="slide">
        <h1 class="slide-title">${slide.title}</h1>
        <h2 class="slide-subtitle">${slide.subtitle}</h2>
        <div class="slide-content">
            ${slide.content.map(line => `<div>${line}</div>`).join('')}
        </div>
        <div class="footer">HERA Seed Deck - ${index + 1}/${slides.length}</div>
    </div>
`).join('')}
</body>
</html>`;

      // Create and download the file
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'HERA-Seed-Deck.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Show success feedback
      alert('Deck exported successfully! Open the HTML file and print to PDF using your browser.');
      
    } catch (error) {
      console.error('Error exporting deck:', error);
      alert('Error exporting deck. Please try again.');
    } finally {
      setIsGeneratingPPT(false);
    }
  };

  // Optimize mobile viewport
  React.useEffect(() => {
    // Prevent zoom on mobile devices
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    }
    
    // Prevent pull-to-refresh on mobile
    document.body.style.overscrollBehavior = 'none';
    
    return () => {
      document.body.style.overscrollBehavior = 'auto';
    };
  }, []);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault();
        if (currentSlide < totalSlides - 1) {
          nextSlide();
        }
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        if (currentSlide > 0) {
          prevSlide();
        }
      } else if (event.key === 'Home') {
        event.preventDefault();
        setCurrentSlide(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        setCurrentSlide(totalSlides - 1);
      } else if (event.key === 'f' || event.key === 'F') {
        event.preventDefault();
        toggleFullscreen();
      } else if (event.key === 'Escape' && isFullscreen) {
        event.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, totalSlides]);

  // Password protection screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">HERA Seed Deck</h2>
            <p className="text-gray-400">
              Confidential - Authorized Access Only
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div className="relative">
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter access password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-900/20 py-2 px-4 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
            >
              Access Seed Deck
            </button>
          </form>

          <div className="text-center text-xs text-gray-500">
            Protected by enterprise-grade security
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen bg-white ${isFullscreen ? 'overflow-hidden' : ''}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Header */}
      <div className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 transition-all duration-300 ${isFullscreen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3 sm:py-4 flex justify-between items-center">
          <div className="text-xs sm:text-sm font-medium text-gray-600">
            HERA ERP Seed Round Pitch Deck
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden lg:block text-xs text-gray-400 text-right">
              <div>ERP: Enterprise Resource Planning | MRR: Monthly Recurring Revenue | ARR: Annual Recurring Revenue</div>
              <div>TAM: Total Addressable Market | SAM: Serviceable Addressable Market | SOM: Serviceable Obtainable Market</div>
              <div>GL: General Ledger | CAC: Customer Acquisition Cost | LTV: Lifetime Value | AI: Artificial Intelligence</div>
            </div>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`relative overflow-hidden ${isFullscreen ? 'h-screen pt-0' : 'h-screen pt-12 sm:pt-16'}`}>
        
        {/* Slide 1: Title */}
        <Slide isActive={currentSlide === 0}>
          <div className="relative min-h-full">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-blue-50/30"></div>
            <div className="absolute top-0 left-0 w-full h-full opacity-[0.02]" 
                 style={{backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23000000' fill-opacity='1'%3e%3ccircle cx='7' cy='7' r='1'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`}}></div>
            
            <div className="relative z-10 text-center space-y-16 py-16">
              {/* Company Badge */}
              <div className="inline-flex items-center px-6 py-2 bg-slate-100/80 backdrop-blur-sm rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-sm font-medium text-slate-700 tracking-wide">Seed Round Presentation</span>
              </div>

              {/* Main Title */}
              <div className="space-y-4 lg:space-y-8">
                <div className="space-y-4">
                  <h1 className="text-7xl font-bold text-slate-900 tracking-tight">
                    Hanaset Inc
                  </h1>
                  <div className="flex items-center justify-center space-x-4">
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent w-24"></div>
                    <div className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full">
                      <span className="text-xl font-bold text-white tracking-wide">HERA ERP</span>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent w-24"></div>
                  </div>
                </div>
                
                {/* Value Proposition */}
                <div className="max-w-4xl mx-auto">
                  <p className="text-2xl font-semibold text-slate-700 leading-relaxed mb-4">
                    The world's first <span className="text-emerald-600 font-bold">self-evolving universal ERP platform</span>
                  </p>
                  <p className="text-xl text-slate-600 leading-relaxed">
                    5+ core tables • 24-hour deployment • Zero implementation costs
                  </p>
                </div>
              </div>

              {/* Key Stats Preview */}
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-1">547x</div>
                  <div className="text-sm text-slate-500 uppercase tracking-wide">Faster than SAP</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-1">$2M</div>
                  <div className="text-sm text-slate-500 uppercase tracking-wide">Seed Round</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-1">$850B</div>
                  <div className="text-sm text-slate-500 uppercase tracking-wide">Market Size</div>
                </div>
              </div>

              {/* Contact */}
              <div className="text-sm text-slate-400 space-y-1">
                <div>8 The Green STE B, Dover, Delaware, DE-19901, USA</div>
                <div>founders@hanaset.com • heraerp.com</div>
              </div>
            </div>
          </div>
        </Slide>

        {/* Slide 2: Problem */}
        <Slide isActive={currentSlide === 1}>
          <div className="relative min-h-full bg-gradient-to-br from-red-50/50 to-orange-50/30">
            <div className="max-w-6xl mx-auto py-8 lg:py-12 space-y-8 lg:space-y-12">
              {/* Header */}
              <div className="text-center space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-red-100/80 rounded-full">
                  <Target className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-sm font-semibold text-red-700 uppercase tracking-wide">The Problem</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                  Traditional ERP is <span className="text-red-600">fundamentally broken</span>
                </h2>
                <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                  Businesses are trapped in 18+ month implementations that cost millions and usually fail
                </p>
              </div>
              
              {/* Problem Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-red-100">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">18+</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">Month Implementations</h3>
                      <p className="text-slate-600 leading-relaxed">
                        Average ERP implementation takes 18+ months and costs $2M+. Most projects go over budget and timeline.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-red-100">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">200+</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">Rigid Database Tables</h3>
                      <p className="text-slate-600 leading-relaxed">
                        Traditional ERP requires 200+ rigid tables that need expensive customization for each business.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-red-100">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">70%</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">Failure Rate</h3>
                      <p className="text-slate-600 leading-relaxed">
                        60-70% of ERP projects fail, leaving businesses worse off than before they started.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-red-100">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">AI as Afterthought</h3>
                      <p className="text-slate-600 leading-relaxed">
                        AI is bolted-on to legacy systems, not built into the core architecture from day one.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="text-center">
                <div className="inline-flex items-center px-6 py-3 bg-slate-900 rounded-full">
                  <span className="text-white font-semibold">There has to be a better way...</span>
                </div>
              </div>
            </div>
          </div>
        </Slide>

        {/* Slide 3: Solution */}
        <Slide isActive={currentSlide === 2}>
          <div className="relative min-h-full bg-gradient-to-br from-emerald-50/50 to-teal-50/30">
            <div className="max-w-6xl mx-auto py-8 lg:py-12 space-y-8 lg:space-y-12">
              {/* Header */}
              <div className="text-center space-y-4 lg:space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-emerald-100/80 rounded-full">
                  <Lightbulb className="w-5 h-5 text-emerald-600 mr-2" />
                  <span className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">The Solution</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                  Introducing <span className="text-emerald-600">HERA ERP</span>
                </h2>
                <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                  The world's first self-evolving universal ERP platform with 5+ core tables that adapts to any business instantly
                </p>
              </div>
              
              {/* Interlocking Comparison */}
              <div className="relative max-w-5xl mx-auto">
                {/* Mobile: Stacked view */}
                <div className="lg:hidden space-y-4">
                  {/* Traditional ERP */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-red-200 overflow-hidden">
                    <div className="bg-red-500 text-white text-center py-3 px-4">
                      <h3 className="text-xl font-bold">Traditional ERP</h3>
                    </div>
                    <div className="p-6 space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-red-100">
                        <span className="text-slate-700 font-medium">Implementation</span>
                        <span className="text-red-600 font-bold">18+ months</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-red-100">
                        <span className="text-slate-700 font-medium">Database Tables</span>
                        <span className="text-red-600 font-bold">200+ rigid</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-red-100">
                        <span className="text-slate-700 font-medium">Implementation Cost</span>
                        <span className="text-red-600 font-bold">$2M+</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-red-100">
                        <span className="text-slate-700 font-medium">Success Rate</span>
                        <span className="text-red-600 font-bold">30-40%</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-slate-700 font-medium">AI Integration</span>
                        <span className="text-red-600 font-bold">Bolt-on</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* HERA ERP */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-emerald-200 overflow-hidden">
                    <div className="bg-emerald-500 text-white text-center py-3 px-4">
                      <h3 className="text-xl font-bold">HERA ERP</h3>
                    </div>
                    <div className="p-6 space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-emerald-100">
                        <span className="text-slate-700 font-medium">Implementation</span>
                        <span className="text-emerald-600 font-bold">24 hours</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-emerald-100">
                        <span className="text-slate-700 font-medium">Database Tables</span>
                        <span className="text-emerald-600 font-bold">5+ universal</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-emerald-100">
                        <span className="text-slate-700 font-medium">Implementation Cost</span>
                        <span className="text-emerald-600 font-bold">$0</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-emerald-100">
                        <span className="text-slate-700 font-medium">Success Rate</span>
                        <span className="text-emerald-600 font-bold">95%+</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-slate-700 font-medium">AI Integration</span>
                        <span className="text-emerald-600 font-bold">Native</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop: Interlocking side-by-side view */}
                <div className="hidden lg:block relative">
                  <div className="grid grid-cols-2 gap-0">
                    {/* Traditional ERP - Left side */}
                    <div className="relative z-10 transform translate-x-4">
                      <div className="bg-white/95 backdrop-blur-sm rounded-l-2xl rounded-r-lg shadow-2xl border-2 border-red-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-red-600 to-red-500 text-white text-center py-4 px-6 relative">
                          <h3 className="text-2xl font-bold">Traditional ERP</h3>
                        </div>
                        <div className="p-8 space-y-4">
                            <div className="flex justify-between items-center py-3 border-b-2 border-red-100">
                              <span className="text-slate-700 font-semibold text-lg">Implementation</span>
                              <span className="text-red-600 font-bold text-xl">18+ months</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b-2 border-red-100">
                              <span className="text-slate-700 font-semibold text-lg">Database Tables</span>
                              <span className="text-red-600 font-bold text-xl">200+ rigid</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b-2 border-red-100">
                              <span className="text-slate-700 font-semibold text-lg">Implementation Cost</span>
                              <span className="text-red-600 font-bold text-xl">$2M+</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b-2 border-red-100">
                              <span className="text-slate-700 font-semibold text-lg">Success Rate</span>
                              <span className="text-red-600 font-bold text-xl">30-40%</span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                              <span className="text-slate-700 font-semibold text-lg">AI Integration</span>
                              <span className="text-red-600 font-bold text-xl">Bolt-on</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* HERA ERP - Right side */}
                      <div className="relative z-20 transform -translate-x-4">
                        <div className="bg-white/95 backdrop-blur-sm rounded-r-2xl rounded-l-lg shadow-2xl border-2 border-emerald-200 overflow-hidden">
                          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-center py-4 px-6 relative">
                            <h3 className="text-2xl font-bold">HERA ERP</h3>
                          </div>
                          <div className="p-8 space-y-4">
                            <div className="flex justify-between items-center py-3 border-b-2 border-emerald-100">
                              <span className="text-slate-700 font-semibold text-lg">Implementation</span>
                              <span className="text-emerald-600 font-bold text-xl">24 hours</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b-2 border-emerald-100">
                              <span className="text-slate-700 font-semibold text-lg">Database Tables</span>
                              <span className="text-emerald-600 font-bold text-xl">5+ universal</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b-2 border-emerald-100">
                              <span className="text-slate-700 font-semibold text-lg">Implementation Cost</span>
                              <span className="text-emerald-600 font-bold text-xl">$0</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b-2 border-emerald-100">
                              <span className="text-slate-700 font-semibold text-lg">Success Rate</span>
                              <span className="text-emerald-600 font-bold text-xl">95%+</span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                              <span className="text-slate-700 font-semibold text-lg">AI Integration</span>
                              <span className="text-emerald-600 font-bold text-xl">Native</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* VS Badge at header level */}
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
                      <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-2xl border-4 border-white">
                        <span className="text-xl font-bold">VS</span>
                      </div>
                    </div>
                  </div>
                </div>

              {/* Key Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl border border-emerald-100">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Rocket className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Lightning Fast</h3>
                  <p className="text-slate-600 leading-relaxed">
                    24-hour deployment vs 18+ months. Get your ERP running instantly, not eventually.
                  </p>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl border border-emerald-100">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Building className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Universal Architecture</h3>
                  <p className="text-slate-600 leading-relaxed">
                    5+ core tables adapt to any business model. No custom development required.
                  </p>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl border border-emerald-100">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">AI-Native Intelligence</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Self-evolving system with autonomous intelligence built into the core.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Slide>

        {/* Slide 4: Traction */}
        <Slide isActive={currentSlide === 3}>
          <div className="relative min-h-full bg-gradient-to-br from-blue-50/50 to-indigo-50/30">
            <div className="max-w-7xl mx-auto py-6 lg:py-8 space-y-6 lg:space-y-8">
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-blue-100/80 rounded-full">
                  <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Traction</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                  Multi-Vertical <span className="text-blue-600">Go-to-Market Strategy</span>
                </h2>
                <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                  Launching across 3 verticals in India & Oman markets
                </p>
              </div>

              {/* Go-to-Market Traction Matrix */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-blue-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
                  <h3 className="text-xl font-bold text-white text-center">Go-to-Market Traction Matrix</h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Timeline</th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-slate-700 uppercase tracking-wider">Education Platform</th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-slate-700 uppercase tracking-wider">Restaurant ERP</th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-slate-700 uppercase tracking-wider">Professional Firm Management</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">31st July 2025</td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-emerald-100 text-emerald-800">
                            🚀 Go Live: Education
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-amber-100 text-amber-800">
                            Final Testing
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                            Requirements Gathering
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">31st Aug 2025</td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-teal-100 text-teal-800">
                            Customer Onboarding
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-emerald-100 text-emerald-800">
                            🚀 Go Live: Restaurant (India)
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-800">
                            Pre-Launch Testing
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">30th Sep 2025</td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-indigo-100 text-indigo-800">
                            Scale & Optimize
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-emerald-100 text-emerald-800">
                            🚀 Go Live: Coffee Shop (Oman)
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-emerald-100 text-emerald-800">
                            🚀 Go Live: Accounting Firms (India & Oman)
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Key Launch Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-xl border border-blue-100">
                  <div className="space-y-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto">
                      <Building className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900">3</div>
                    <h3 className="text-lg font-bold text-slate-900">Verticals</h3>
                    <p className="text-sm text-slate-600">Education, Restaurant, Professional Services</p>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-xl border border-blue-100">
                  <div className="space-y-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                      <Globe className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900">2</div>
                    <h3 className="text-lg font-bold text-slate-900">Markets</h3>
                    <p className="text-sm text-slate-600">India & Oman initial launch</p>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-xl border border-blue-100">
                  <div className="space-y-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto">
                      <Rocket className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900">6</div>
                    <h3 className="text-lg font-bold text-slate-900">Days to Revenue</h3>
                    <p className="text-sm text-slate-600">Education platform launches 31st July</p>
                  </div>
                </div>
              </div>

              {/* Platform Readiness */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-center">
                <div className="flex items-center justify-center space-x-3 mb-3">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  <span className="text-white font-bold text-lg uppercase tracking-wide">Platform Status: Ready for Launch</span>
                </div>
                <p className="text-emerald-100 text-base">
                  136 AI systems built • Universal architecture proven • 24-hour deployment capability
                </p>
              </div>
            </div>
          </div>
        </Slide>

        {/* Slide 5: Platform Intelligence */}
        <Slide isActive={currentSlide === 4}>
          <div className="relative min-h-full bg-gradient-to-br from-purple-50/50 to-indigo-50/30">
            <div className="max-w-6xl mx-auto py-8 lg:py-12 space-y-8 lg:space-y-12">
              {/* Header */}
              <div className="text-center space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-purple-100/80 rounded-full">
                  <BarChart className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Platform Intelligence</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                  AI-Native <span className="text-purple-600">Intelligence</span>
                </h2>
                <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                  Revolutionary AI capabilities built and operational across all systems
                </p>
              </div>
              
              {/* Intelligence Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl border border-purple-100">
                  <div className="space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                      <span className="text-xl font-bold text-white">4-Phase</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900">GL Intelligence System</h3>
                    <p className="text-slate-600">Complete autonomous CFO assistant with real-time financial monitoring</p>
                    <div className="inline-flex items-center px-3 py-1 bg-emerald-100 rounded-full">
                      <span className="text-sm font-semibold text-emerald-700">Fully Operational</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl border border-purple-100">
                  <div className="space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto">
                      <span className="text-xl font-bold text-white">95%</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Deployment Success</h3>
                    <p className="text-slate-600">Proven track record vs 30-40% traditional ERP success rates</p>
                    <div className="inline-flex items-center px-3 py-1 bg-blue-100 rounded-full">
                      <span className="text-sm font-semibold text-blue-700">Industry Leading</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl border border-purple-100">
                  <div className="space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto">
                      <span className="text-xl font-bold text-white">24hrs</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Lightning Deployment</h3>
                    <p className="text-slate-600">Complete ERP system deployment vs 18+ months traditional timeline</p>
                    <div className="inline-flex items-center px-3 py-1 bg-emerald-100 rounded-full">
                      <span className="text-sm font-semibold text-emerald-700">Record Breaking</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl border border-purple-100">
                  <div className="space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto">
                      <span className="text-xl font-bold text-white">∞</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Universal Adaptability</h3>
                    <p className="text-slate-600">Any industry, any size - 5+ core tables handle infinite complexity</p>
                    <div className="inline-flex items-center px-3 py-1 bg-orange-100 rounded-full">
                      <span className="text-sm font-semibold text-orange-700">Revolutionary</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Intelligence Showcase */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-8 text-center">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <Brain className="w-6 h-6 text-white" />
                  <span className="text-white font-bold text-lg uppercase tracking-wide">AI Intelligence Active</span>
                </div>
                <p className="text-purple-100 text-lg max-w-4xl mx-auto">
                  World's first self-evolving ERP system with ML-powered anomaly detection, predictive forecasting, and autonomous decision support across all business functions
                </p>
              </div>
            </div>
          </div>
        </Slide>

        {/* Slide 6: Competitive Advantage */}
        <Slide isActive={currentSlide === 5}>
          <div className="relative min-h-full bg-gradient-to-br from-orange-50/50 to-amber-50/30">
            <div className="max-w-6xl mx-auto py-8 lg:py-12 space-y-8 lg:space-y-12">
              {/* Header */}
              <div className="text-center space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-orange-100/80 rounded-full">
                  <Rocket className="w-5 h-5 text-orange-600 mr-2" />
                  <span className="text-sm font-semibold text-orange-700 uppercase tracking-wide">Competitive Advantage</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                  What Makes HERA <span className="text-orange-600">Unstoppable</span>
                </h2>
                <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                  Three revolutionary insights that create an unbreachable competitive moat
                </p>
              </div>
              
              {/* Competitive Advantages */}
              <div className="space-y-4 lg:space-y-8">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 lg:p-10 shadow-xl border border-orange-100">
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">1</span>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Universal Architecture Insight</h3>
                      <p className="text-lg text-slate-600 leading-relaxed">
                        Every business uses the same 5+ core data patterns: <strong>WHO</strong> (organizations), <strong>WHAT</strong> (entities), <strong>HOW</strong> (data), <strong>WHY</strong> (relationships), <strong>WHEN</strong> (transactions). 
                        While competitors build 200+ rigid tables, we built 5+ universal core tables that adapt to any business instantly.
                      </p>
                      <div className="inline-flex items-center px-4 py-2 bg-teal-100 rounded-full">
                        <span className="text-sm font-semibold text-teal-700">97.5% table reduction vs traditional ERP</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 lg:p-10 shadow-xl border border-orange-100">
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">2</span>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Self-Evolving Meta-Architecture</h3>
                      <p className="text-lg text-slate-600 leading-relaxed">
                        HERA manages its own development using its own universal patterns. This creates exponentially faster innovation cycles - 
                        we evolve at the speed of code, not corporate development processes. Our system becomes more intelligent with every deployment.
                      </p>
                      <div className="inline-flex items-center px-4 py-2 bg-emerald-100 rounded-full">
                        <span className="text-sm font-semibold text-emerald-700">World's first self-managing ERP system</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 lg:p-10 shadow-xl border border-orange-100">
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">3</span>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Perfect Market Timing</h3>
                      <p className="text-lg text-slate-600 leading-relaxed">
                        AI infrastructure is finally mature enough for autonomous business systems. Cloud computing enables instant global deployment. 
                        Remote work demands mobile-first ERP. Traditional ERP vendors are locked into legacy architectures - they can't rebuild without destroying their existing business.
                      </p>
                      <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full">
                        <span className="text-sm font-semibold text-purple-700">2-3 year competitive response window</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Moat Summary */}
              <div className="bg-gradient-to-r from-orange-600 to-amber-700 rounded-2xl p-8 text-center">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <Trophy className="w-6 h-6 text-white" />
                  <span className="text-white font-bold text-lg uppercase tracking-wide">Unbreachable Competitive Moat</span>
                </div>
                <p className="text-orange-100 text-lg max-w-4xl mx-auto">
                  Network effects + Universal architecture + Self-evolution = Impossible for traditional vendors to replicate without starting over
                </p>
              </div>
            </div>
          </div>
        </Slide>

        {/* Slide 7: Business Model */}
        <Slide isActive={currentSlide === 6}>
          <div className="relative min-h-full bg-gradient-to-br from-emerald-50/50 to-green-50/30">
            <div className="max-w-6xl mx-auto py-8 lg:py-12 space-y-8 lg:space-y-12">
              {/* Header */}
              <div className="text-center space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-emerald-100/80 rounded-full">
                  <DollarSign className="w-5 h-5 text-emerald-600 mr-2" />
                  <span className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">Business Model</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                  Viral <span className="text-emerald-600">Growth</span> Model
                </h2>
                <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                  SaaS model with zero implementation costs creates explosive viral adoption
                </p>
              </div>
              
              {/* Business Model Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Revenue Streams */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-xl border border-emerald-100">
                  <div className="space-y-4 lg:space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Revenue Streams</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-4 p-4 bg-slate-50 rounded-xl">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full mt-2"></div>
                        <div>
                          <div className="font-semibold text-slate-900">SaaS Subscriptions</div>
                          <div className="text-slate-600 text-sm">$500-$5,000/month per organization</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4 p-4 bg-slate-50 rounded-xl">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <div className="font-semibold text-slate-900">Template Marketplace</div>
                          <div className="text-slate-600 text-sm">20% revenue share on all template sales</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4 p-4 bg-slate-50 rounded-xl">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mt-2"></div>
                        <div>
                          <div className="font-semibold text-slate-900">Enterprise Licensing</div>
                          <div className="text-slate-600 text-sm">White-label solutions for large enterprises</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4 p-4 bg-slate-50 rounded-xl">
                        <div className="w-3 h-3 bg-amber-500 rounded-full mt-2"></div>
                        <div>
                          <div className="font-semibold text-slate-900">Professional Services</div>
                          <div className="text-slate-600 text-sm">Customization and implementation support</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Unit Economics */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-xl border border-emerald-100">
                  <div className="space-y-4 lg:space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <BarChart className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Unit Economics</h3>
                    </div>
                    <div className="space-y-4 lg:space-y-6">
                      <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                        <span className="text-slate-600 font-medium">Customer LTV</span>
                        <span className="text-2xl font-bold text-slate-900">$180K</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                        <span className="text-slate-600 font-medium">Customer CAC</span>
                        <span className="text-2xl font-bold text-slate-900">$15K</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                        <span className="text-slate-600 font-medium">Gross Margin</span>
                        <span className="text-2xl font-bold text-slate-900">85%</span>
                      </div>
                      <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6 rounded-xl text-white text-center">
                        <div className="text-sm font-semibold uppercase tracking-wide mb-2">LTV:CAC Ratio</div>
                        <div className="text-4xl font-bold">12:1</div>
                        <div className="text-emerald-100 text-sm mt-2">Exceptional unit economics</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Growth Strategy */}
              <div className="bg-gradient-to-r from-emerald-600 to-green-700 rounded-2xl p-8 text-center">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <Rocket className="w-6 h-6 text-white" />
                  <span className="text-white font-bold text-lg uppercase tracking-wide">Viral Growth Strategy</span>
                </div>
                <p className="text-emerald-100 text-lg max-w-4xl mx-auto">
                  Zero implementation cost removes adoption barriers • Network effects strengthen with each deployment • Template marketplace creates ecosystem growth
                </p>
              </div>
            </div>
          </div>
        </Slide>

        {/* Slide 8: Market */}
        <Slide isActive={currentSlide === 7}>
          <div className="relative min-h-full bg-gradient-to-br from-blue-50/50 to-indigo-50/30">
            <div className="max-w-7xl mx-auto py-6 space-y-6">
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-blue-100/80 rounded-full">
                  <Building className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Market Opportunity</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                  <span className="text-blue-600">$850B+</span> Market Disruption
                </h2>
                <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                  Multiple disruption vectors across the global enterprise software landscape
                </p>
              </div>
              
              {/* Market Size Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center shadow-xl border border-blue-100">
                  <div className="space-y-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                      <span className="text-base font-bold text-white">TAM</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">$850B</div>
                    <h3 className="text-lg font-bold text-slate-900">Total Market</h3>
                    <p className="text-sm text-slate-600">Global ERP & Enterprise Software</p>
                    <div className="inline-flex items-center px-2 py-1 bg-blue-100 rounded-full">
                      <span className="text-xs font-semibold text-blue-700">8-12% growth</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center shadow-xl border border-blue-100">
                  <div className="space-y-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto">
                      <span className="text-base font-bold text-white">SAM</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">$400B</div>
                    <h3 className="text-lg font-bold text-slate-900">Serviceable Market</h3>
                    <p className="text-sm text-slate-600">SMB & Mid-Market ERP</p>
                    <div className="inline-flex items-center px-2 py-1 bg-teal-100 rounded-full">
                      <span className="text-xs font-semibold text-teal-700">Fastest growing</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center shadow-xl border border-blue-100">
                  <div className="space-y-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto">
                      <span className="text-base font-bold text-white">SOM</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">$40B</div>
                    <h3 className="text-lg font-bold text-slate-900">Obtainable Market</h3>
                    <p className="text-sm text-slate-600">10% capture in 5 years</p>
                    <div className="inline-flex items-center px-2 py-1 bg-purple-100 rounded-full">
                      <span className="text-xs font-semibold text-purple-700">Conservative</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Market Strategy - Condensed */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-blue-100">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Go-to-Market Strategy</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="text-base font-semibold text-slate-900">Land & Expand Model</h4>
                      <ul className="space-y-1 text-sm text-slate-600">
                        <li className="flex items-start space-x-2">
                          <div className="w-1 h-1 bg-blue-500 rounded-full mt-2"></div>
                          <span>Target SMBs frustrated with ERP failures</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <div className="w-1 h-1 bg-blue-500 rounded-full mt-2"></div>
                          <span>Zero implementation cost removes barriers</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <div className="w-1 h-1 bg-blue-500 rounded-full mt-2"></div>
                          <span>Viral growth through referrals</span>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-base font-semibold text-slate-900">Ecosystem Growth</h4>
                      <ul className="space-y-1 text-sm text-slate-600">
                        <li className="flex items-start space-x-2">
                          <div className="w-1 h-1 bg-teal-500 rounded-full mt-2"></div>
                          <span>Template marketplace network effects</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <div className="w-1 h-1 bg-teal-500 rounded-full mt-2"></div>
                          <span>Enterprise white-label licensing</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <div className="w-1 h-1 bg-teal-500 rounded-full mt-2"></div>
                          <span>Partner ecosystem amplification</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Market Timing - Condensed */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-center">
                <div className="flex items-center justify-center space-x-3 mb-3">
                  <Clock className="w-5 h-5 text-white" />
                  <span className="text-white font-bold text-base uppercase tracking-wide">Perfect Market Timing</span>
                </div>
                <p className="text-blue-100 text-base max-w-4xl mx-auto">
                  AI infrastructure mature • Cloud enables instant deployment • Remote work demands mobile ERP • Traditional vendors locked in legacy
                </p>
              </div>
            </div>
          </div>
        </Slide>

        {/* Slide 9: Team */}
        <Slide isActive={currentSlide === 8}>
          <div className="relative min-h-full bg-gradient-to-br from-indigo-50/50 to-purple-50/30">
            <div className="max-w-6xl mx-auto py-8 lg:py-12 space-y-8 lg:space-y-12">
              {/* Header */}
              <div className="text-center space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-indigo-100/80 rounded-full">
                  <Users className="w-5 h-5 text-indigo-600 mr-2" />
                  <span className="text-sm font-semibold text-indigo-700 uppercase tracking-wide">The Team</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                  Built by <span className="text-indigo-600">Visionaries</span>
                </h2>
                <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                  The founding team uniquely positioned to revolutionize enterprise software
                </p>
              </div>
              
              {/* Founder Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 lg:p-10 shadow-xl border border-indigo-100">
                  <div className="text-center space-y-6">
                    <div className="w-28 h-28 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">CEO</span>
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Visionary Founder</h3>
                      <p className="text-indigo-600 font-semibold mt-2">CEO & Co-founder</p>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-slate-50 rounded-xl p-4">
                        <div className="font-semibold text-slate-900 text-sm">Enterprise Software Expertise</div>
                        <div className="text-slate-600 text-sm">15+ years building scalable business platforms</div>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4">
                        <div className="font-semibold text-slate-900 text-sm">AI/ML Background</div>
                        <div className="text-slate-600 text-sm">Deep experience in autonomous systems architecture</div>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4">
                        <div className="font-semibold text-slate-900 text-sm">Business Strategy</div>
                        <div className="text-slate-600 text-sm">Proven track record in disruptive technology markets</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 lg:p-10 shadow-xl border border-indigo-100">
                  <div className="text-center space-y-6">
                    <div className="w-28 h-28 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full mx-auto flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">CTO</span>
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Technical Architect</h3>
                      <p className="text-teal-600 font-semibold mt-2">CTO & Co-founder</p>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-slate-50 rounded-xl p-4">
                        <div className="font-semibold text-slate-900 text-sm">Universal Architecture</div>
                        <div className="text-slate-600 text-sm">Architect of the revolutionary 5+ table system</div>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4">
                        <div className="font-semibold text-slate-900 text-sm">Scale Engineering</div>
                        <div className="text-slate-600 text-sm">Built systems handling millions of transactions daily</div>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4">
                        <div className="font-semibold text-slate-900 text-sm">AI-Native Development</div>
                        <div className="text-slate-600 text-sm">Pioneer in self-evolving software architectures</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Why This Team */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-10 shadow-xl border border-indigo-100">
                <div className="text-center space-y-6">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Perfect Problem-Solution Fit</h3>
                  </div>
                  <p className="text-lg text-slate-600 leading-relaxed max-w-4xl mx-auto">
                    This founding team has spent years witnessing the failure of traditional ERP implementations firsthand. 
                    They've identified the core architectural flaw that causes 70% of ERP projects to fail, and built the world's first 
                    universal solution that eliminates this problem entirely. This isn't just another ERP company - it's the team that 
                    solved the fundamental impossibility of universal business software.
                  </p>
                  <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white font-semibold">
                    The only team capable of building this solution
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Slide>

        {/* Slide 10: Funding */}
        <Slide isActive={currentSlide === 9}>
          <div className="relative min-h-full bg-gradient-to-br from-emerald-50/50 to-green-50/30">
            <div className="max-w-6xl mx-auto py-6 space-y-6">
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-emerald-100/80 rounded-full">
                  <DollarSign className="w-5 h-5 text-emerald-600 mr-2" />
                  <span className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">Investment Opportunity</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                  <span className="text-emerald-600">$2M</span> Seed Round
                </h2>
                <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                  Fuel the revolution in enterprise software and capture the $850B+ market
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Funding Overview */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-emerald-100">
                  <div className="text-center space-y-4">
                    <div className="text-4xl font-bold text-slate-900">$2.0M</div>
                    <div className="text-lg font-semibold text-emerald-600">Seed Investment</div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Clock className="w-5 h-5 text-emerald-600" />
                          <span className="font-semibold text-slate-900">Runway</span>
                        </div>
                        <span className="font-bold text-slate-900">18 months</span>
                      </div>
                      
                      <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <TrendingUp className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-slate-900">MRR Target</span>
                        </div>
                        <span className="font-bold text-slate-900">$500K</span>
                      </div>
                      
                      <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Rocket className="w-5 h-5 text-purple-600" />
                          <span className="font-semibold text-slate-900">Next Stage</span>
                        </div>
                        <span className="font-bold text-slate-900">Series A</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Use of Funds */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-emerald-100">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-900 text-center">Use of Funds</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                          <span className="font-semibold text-slate-900">Product & AI</span>
                        </div>
                        <span className="font-bold text-slate-900">40%</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="font-semibold text-slate-900">Sales & Marketing</span>
                        </div>
                        <span className="font-bold text-slate-900">30%</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span className="font-semibold text-slate-900">Team Building</span>
                        </div>
                        <span className="font-bold text-slate-900">20%</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                          <span className="font-semibold text-slate-900">Operations & Legal</span>
                        </div>
                        <span className="font-bold text-slate-900">10%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Investment CTA */}
              <div className="bg-gradient-to-r from-emerald-600 to-green-700 rounded-2xl p-6 text-center">
                <div className="flex items-center justify-center space-x-3 mb-3">
                  <Star className="w-5 h-5 text-white" />
                  <span className="text-white font-bold text-lg uppercase tracking-wide">Once-in-a-Decade Opportunity</span>
                </div>
                <p className="text-emerald-100 text-base">
                  Join us in revolutionizing the $850B enterprise software market • 2-3 year competitive window • Winner-take-all market dynamics
                </p>
              </div>
            </div>
          </div>
        </Slide>

        {/* Slide 11: Thank You */}
        <Slide isActive={currentSlide === 10}>
          <div className="relative min-h-full bg-gradient-to-br from-slate-50 to-gray-50">
            <div className="max-w-4xl mx-auto py-24 text-center space-y-16">
              {/* Main Thank You */}
              <div className="space-y-4 lg:space-y-8">
                <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-slate-100 to-gray-100 rounded-full mb-8">
                  <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">The Future Starts Now</span>
                </div>
                <h1 className="text-7xl font-bold text-slate-900 tracking-tight">
                  Thank <span className="text-emerald-600">You</span>
                </h1>
                <p className="text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                  Questions & Discussion
                </p>
              </div>
              
              {/* CTA Section */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-slate-200">
                <div className="space-y-4 lg:space-y-8">
                  <div className="flex items-center justify-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                      <Rocket className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Ready to Revolutionize Business Software?</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-50 rounded-xl p-6 text-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold text-sm">@</span>
                      </div>
                      <div className="font-semibold text-slate-900 text-lg">founders@hanaset.com</div>
                      <div className="text-slate-600 text-sm mt-1">Direct founder access</div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-xl p-6 text-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      <div className="font-semibold text-slate-900 text-lg">heraerp.com</div>
                      <div className="text-slate-600 text-sm mt-1">Live platform demo</div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-xl p-6 text-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Building className="w-5 h-5 text-white" />
                      </div>
                      <div className="font-semibold text-slate-900 text-sm">8 The Green STE B</div>
                      <div className="text-slate-600 text-sm">Dover, Delaware, DE-19901, USA</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Investment CTA */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-8">
                <div className="text-white text-center space-y-4">
                  <div className="flex items-center justify-center space-x-2">
                    <Star className="w-5 h-5" />
                    <span className="font-bold uppercase tracking-wide">$850B Market • 2-3 Year Window • Winner-Take-All</span>
                    <Star className="w-5 h-5" />
                  </div>
                  <p className="text-emerald-100 text-lg">
                    The time to invest in the future of enterprise software is now
                  </p>
                </div>
              </div>
              
              {/* Attribution */}
              <div className="text-xs text-slate-400 font-medium tracking-wide uppercase">
                Based on Aaron Harris Seed Deck Template • Enhanced with Adam Wathan & Steve Schoger Design Principles
              </div>
            </div>
          </div>
        </Slide>
      </div>

      {/* Left Arrow */}
      <div className={`fixed top-1/2 transform -translate-y-1/2 z-50 ${isFullscreen ? 'left-2 sm:left-4' : 'left-4 sm:left-8'}`}>
        <button
          onClick={prevSlide}
          className={`p-3 sm:p-4 rounded-full transition-all duration-200 touch-manipulation ${
            currentSlide === 0 
              ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
              : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:text-gray-900 hover:bg-white shadow-lg border border-gray-200 hover:shadow-xl active:scale-95'
          }`}
          disabled={currentSlide === 0}
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Right Arrow */}
      <div className={`fixed top-1/2 transform -translate-y-1/2 z-50 ${isFullscreen ? 'right-2 sm:right-4' : 'right-4 sm:right-8'}`}>
        <button
          onClick={nextSlide}
          className={`p-3 sm:p-4 rounded-full transition-all duration-200 touch-manipulation ${
            currentSlide === totalSlides - 1
              ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
              : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:text-gray-900 hover:bg-white shadow-lg border border-gray-200 hover:shadow-xl active:scale-95'
          }`}
          disabled={currentSlide === totalSlides - 1}
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Bottom Progress Indicators */}
      <div className="fixed bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 sm:px-6 py-2 sm:py-3 shadow-lg border border-gray-200">
          <div className="flex space-x-1 sm:space-x-2">
            {Array.from({ length: totalSlides }, (_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`rounded-full transition-all touch-manipulation ${
                  i === currentSlide 
                    ? 'bg-gray-900 w-4 h-2 sm:w-6 sm:h-2' 
                    : 'bg-gray-300 hover:bg-gray-400 w-2 h-2 sm:w-2 sm:h-2'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Top Controls */}
      <div className={`fixed z-40 ${isFullscreen ? 'top-2 right-2 sm:top-4 sm:right-4' : 'top-16 right-4 sm:top-20 sm:right-8'}`}>
        <div className="flex items-center space-x-2">
          {/* Export Deck Button */}
          <button
            onClick={exportDeck}
            disabled={isGeneratingPPT}
            className="bg-white/90 backdrop-blur-sm rounded-full p-2 sm:p-3 shadow-sm border border-gray-200 hover:bg-white hover:shadow-md transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
            title={isGeneratingPPT ? "Exporting deck..." : "Export deck (HTML → PDF)"}
          >
            <Download className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-emerald-600 ${isGeneratingPPT ? 'animate-spin' : ''}`} />
          </button>
          
          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="bg-white/90 backdrop-blur-sm rounded-full p-2 sm:p-3 shadow-sm border border-gray-200 hover:bg-white hover:shadow-md transition-all duration-200 group"
            title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-blue-600" />
            ) : (
              <Maximize className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-blue-600" />
            )}
          </button>
          
          {/* Slide Counter */}
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 sm:px-4 sm:py-2 shadow-sm border border-gray-200">
            <span className="text-xs sm:text-sm font-medium text-gray-600">
              {currentSlide + 1} / {totalSlides}
            </span>
          </div>
        </div>
      </div>

      {/* Fullscreen Indicator */}
      {isFullscreen && (
        <div className="fixed top-2 left-2 sm:top-4 sm:left-4 z-40">
          <div className="bg-black/80 backdrop-blur-sm rounded-full px-2 py-1 sm:px-3 sm:py-1 shadow-sm">
            <span className="text-xs font-medium text-white flex items-center space-x-1 sm:space-x-2">
              <Maximize className="w-3 h-3" />
              <span className="hidden sm:inline">Fullscreen • F to exit</span>
              <span className="sm:hidden">Full</span>
            </span>
          </div>
        </div>
      )}

      {/* Mobile Swipe Instruction - Show only on first slide and on mobile */}
      {currentSlide === 0 && (
        <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 z-40 sm:hidden">
          <div className="bg-black/70 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
            <span className="text-xs font-medium text-white flex items-center space-x-2">
              <span>👈 Swipe to navigate 👉</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}