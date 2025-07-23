'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Maximize, Lock, TrendingUp, Zap, Target, Users, DollarSign, BarChart3, Rocket, Brain, Shield, Clock, CheckCircle, Trophy, AlertTriangle, Globe, Building2, Calculator, Briefcase, Award, Star, Handshake } from 'lucide-react'
import FinancialProjections from '@/components/sales/FinancialProjections'

interface SlideProps {
  isActive: boolean
  children: React.ReactNode
}

const Slide: React.FC<SlideProps> = ({ isActive, children }) => (
  <div className={`
    absolute inset-0 transition-all duration-700 ease-in-out transform
    ${isActive ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-full scale-95'}
  `}>
    <div className="h-full w-full flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 xl:p-12 max-w-[95vw] xl:max-w-7xl mx-auto overflow-y-auto">
      <div className="w-full max-h-full overflow-y-auto">
        {children}
      </div>
    </div>
  </div>
)

const MetricCard: React.FC<{ icon: React.ReactNode; title: string; value: string; subtitle?: string; accent?: string }> = ({ icon, title, value, subtitle, accent = "amber" }) => {
  const getAccentClasses = () => {
    switch (accent) {
      case 'emerald':
        return {
          border: 'hover:border-emerald-500',
          shadow: 'hover:shadow-emerald-500/10',
          iconBg: 'bg-gradient-to-br from-emerald-500/20 to-yellow-500/20 group-hover:from-emerald-500/30 group-hover:to-yellow-500/30',
          textGradient: 'bg-gradient-to-r from-emerald-400 to-yellow-400',
          subtitle: 'text-emerald-300'
        }
      case 'blue':
        return {
          border: 'hover:border-blue-500',
          shadow: 'hover:shadow-blue-500/10',
          iconBg: 'bg-gradient-to-br from-blue-500/20 to-yellow-500/20 group-hover:from-blue-500/30 group-hover:to-yellow-500/30',
          textGradient: 'bg-gradient-to-r from-blue-400 to-yellow-400',
          subtitle: 'text-blue-300'
        }
      default:
        return {
          border: 'hover:border-amber-500',
          shadow: 'hover:shadow-amber-500/10',
          iconBg: 'bg-gradient-to-br from-amber-500/20 to-yellow-500/20 group-hover:from-amber-500/30 group-hover:to-yellow-500/30',
          textGradient: 'bg-gradient-to-r from-amber-400 to-yellow-400',
          subtitle: 'text-amber-300'
        }
    }
  }
  
  const classes = getAccentClasses()
  
  return (
    <div className={`group bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-3 md:p-4 border border-gray-700 ${classes.border} transition-all duration-300 hover:shadow-lg ${classes.shadow}`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 ${classes.iconBg} rounded-lg transition-all`}>
          {icon}
        </div>
      </div>
      <h3 className="text-xs md:text-sm font-semibold text-gray-400 mb-1">{title}</h3>
      <div className={`text-xl md:text-2xl font-bold ${classes.textGradient} bg-clip-text text-transparent`}>{value}</div>
      {subtitle && <p className={`text-xs ${classes.subtitle} mt-1`}>{subtitle}</p>}
    </div>
  )
}

const FeatureBox: React.FC<{ icon: React.ReactNode; title: string; description: string; highlight?: string; accent?: string }> = ({ icon, title, description, highlight, accent = "amber" }) => {
  const getAccentClasses = () => {
    switch (accent) {
      case 'emerald':
        return {
          border: 'hover:border-emerald-400/50',
          iconBg: 'bg-gradient-to-br from-emerald-500/10 to-yellow-500/10 group-hover:from-emerald-500/20 group-hover:to-yellow-500/20',
          highlightBg: 'bg-gradient-to-r from-emerald-500/20 to-yellow-500/20',
          highlightText: 'text-emerald-300'
        }
      case 'blue':
        return {
          border: 'hover:border-blue-400/50',
          iconBg: 'bg-gradient-to-br from-blue-500/10 to-yellow-500/10 group-hover:from-blue-500/20 group-hover:to-yellow-500/20',
          highlightBg: 'bg-gradient-to-r from-blue-500/20 to-yellow-500/20',
          highlightText: 'text-blue-300'
        }
      default:
        return {
          border: 'hover:border-amber-400/50',
          iconBg: 'bg-gradient-to-br from-amber-500/10 to-yellow-500/10 group-hover:from-amber-500/20 group-hover:to-yellow-500/20',
          highlightBg: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20',
          highlightText: 'text-amber-300'
        }
    }
  }
  
  const classes = getAccentClasses()
  
  return (
    <div className={`group bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-gray-700 ${classes.border} transition-all duration-300`}>
      <div className={`p-3 ${classes.iconBg} rounded-xl w-fit mb-4 transition-all`}>
        {icon}
      </div>
      <h3 className="text-lg md:text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm md:text-base text-gray-300 leading-relaxed">{description}</p>
      {highlight && (
        <div className={`mt-3 px-3 py-1.5 ${classes.highlightBg} rounded-lg`}>
          <span className={`${classes.highlightText} font-semibold text-sm md:text-base`}>{highlight}</span>
        </div>
      )}
    </div>
  )
}

const CompetitorCard: React.FC<{ name: string; weaknesses: string[]; status: "dying" | "struggling" | "obsolete" }> = ({ name, weaknesses, status }) => {
  const statusColors = {
    dying: "from-red-500/20 to-red-600/20 border-red-500/30",
    struggling: "from-orange-500/20 to-orange-600/20 border-orange-500/30", 
    obsolete: "from-gray-500/20 to-gray-600/20 border-gray-500/30"
  }
  
  return (
    <div className={`bg-gradient-to-br ${statusColors[status]} rounded-2xl p-4 md:p-6 border`}>
      <h3 className="text-xl md:text-2xl font-bold text-red-400 mb-3">{name}</h3>
      <div className="space-y-2">
        {weaknesses.map((weakness, index) => (
          <p key={index} className="text-sm md:text-base text-gray-300 flex items-start">
            <AlertTriangle className="h-4 w-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
            {weakness}
          </p>
        ))}
      </div>
    </div>
  )
}

export default function InvestorDeck() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const totalSlides = 17

  const correctPassword = "transform@business@2024"

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === correctPassword) {
      setIsAuthenticated(true)
    } else {
      alert('Access denied. Contact HERA leadership for credentials.')
      setPassword('')
    }
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isAuthenticated) return
      
      if (e.key === 'ArrowRight' || e.key === ' ') {
        nextSlide()
      } else if (e.key === 'ArrowLeft') {
        prevSlide()
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-900/10 to-gray-900 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700 shadow-2xl">
            <div className="text-center mb-8">
              <div className="p-4 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-2xl w-fit mx-auto mb-4">
                <Lock className="h-12 w-12 text-amber-400" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent mb-2">
                HERA INVESTOR DECK
              </h1>
              <p className="text-gray-400">Confidential - Authorized Access Only</p>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Access Code
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    placeholder="Enter your access code"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-amber-400"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 font-bold rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 transform hover:scale-105"
              >
                Access Investor Deck
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                This presentation contains confidential business information.<br />
                Unauthorized access is prohibited.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-900/10 to-gray-900 overflow-hidden relative">
      {/* Side Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="fixed left-2 sm:left-4 md:left-8 top-1/2 transform -translate-y-1/2 p-2 sm:p-3 md:p-4 bg-gray-800/80 backdrop-blur-sm rounded-full text-white hover:bg-gray-700/90 transition-all duration-200 hover:scale-110 border border-gray-600/50 z-50 group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 group-hover:-translate-x-0.5 transition-transform" />
      </button>
      
      <button
        onClick={nextSlide}
        className="fixed right-2 sm:right-4 md:right-8 top-1/2 transform -translate-y-1/2 p-2 sm:p-3 md:p-4 bg-gray-800/80 backdrop-blur-sm rounded-full text-white hover:bg-gray-700/90 transition-all duration-200 hover:scale-110 border border-gray-600/50 z-50 group"
        aria-label="Next slide"
      >
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Bottom Controls */}
      <div className="fixed bottom-2 sm:bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-2 sm:gap-3 z-50">
        <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-gray-800/80 backdrop-blur-sm rounded-full border border-gray-600/50">
          <span className="text-amber-400 font-bold text-xs sm:text-sm">{currentSlide + 1}</span>
          <span className="text-gray-500 text-xs sm:text-sm">/</span>
          <span className="text-gray-400 text-xs sm:text-sm">{totalSlides}</span>
        </div>
        
        <button
          onClick={toggleFullscreen}
          className="p-1.5 sm:p-2.5 bg-gray-800/80 backdrop-blur-sm rounded-full text-white hover:bg-gray-700/90 transition-all duration-200 hover:scale-110 border border-gray-600/50"
          aria-label="Toggle fullscreen"
        >
          <Maximize className="h-3 w-3 sm:h-4 sm:w-4" />
        </button>
      </div>

      {/* Slides Container */}
      <div className="relative w-full h-screen max-h-screen overflow-hidden">
        {/* Slide 1: Title */}
        <Slide isActive={currentSlide === 0}>
          <div className="text-center w-full px-2 sm:px-4">
            <div className="mb-4 sm:mb-6 md:mb-8">
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent mb-3 sm:mb-4 md:mb-6">
                HERA
              </h1>
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-2 sm:mb-3 md:mb-4 leading-tight">
                The World's First Self-Evolving Enterprise Intelligence Platform
              </h2>
              <div className="text-sm sm:text-base md:text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                Transforming 18-month ERP implementations into <span className="text-amber-400 font-bold">24-hour deployments</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 border border-amber-500/30 max-w-4xl mx-auto">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-amber-400 mb-2 sm:mb-3 md:mb-4">⚡ 540x Faster ⚡</div>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 leading-relaxed">
                Revolutionary universal architecture that deploys enterprise systems in 24 hours, not 18 months
              </p>
            </div>
          </div>
        </Slide>

        {/* Slide 2: The Big Change */}
        <Slide isActive={currentSlide === 1}>
          <div className="text-center max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8">
              The Great Enterprise Software Revolution
            </h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Old World */}
              <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 rounded-3xl p-6 md:p-8 border border-red-500/30">
                <h2 className="text-3xl md:text-4xl font-bold text-red-400 mb-6">The Old World: Legacy ERP Prison</h2>
                <div className="space-y-4 text-left">
                  <div className="flex items-start">
                    <AlertTriangle className="h-6 w-6 text-red-400 mr-3 mt-1 flex-shrink-0" />
                    <p className="text-gray-300"><strong>200+ rigid database tables</strong> per business</p>
                  </div>
                  <div className="flex items-start">
                    <Clock className="h-6 w-6 text-red-400 mr-3 mt-1 flex-shrink-0" />
                    <p className="text-gray-300"><strong>18-month implementations</strong> with $2M+ costs</p>
                  </div>
                  <div className="flex items-start">
                    <Lock className="h-6 w-6 text-red-400 mr-3 mt-1 flex-shrink-0" />
                    <p className="text-gray-300"><strong>Vendor lock-in</strong> with zero customization</p>
                  </div>
                  <div className="flex items-start">
                    <Users className="h-6 w-6 text-red-400 mr-3 mt-1 flex-shrink-0" />
                    <p className="text-gray-300"><strong>IT-dependent</strong> for every business change</p>
                  </div>
                </div>
              </div>

              {/* New World */}
              <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-3xl p-6 md:p-8 border border-amber-500/30">
                <h2 className="text-3xl md:text-4xl font-bold text-amber-400 mb-6">The New World: Intelligent Universal Architecture</h2>
                <div className="space-y-4 text-left">
                  <div className="flex items-start">
                    <Globe className="h-6 w-6 text-amber-400 mr-3 mt-1 flex-shrink-0" />
                    <p className="text-gray-300"><strong>5 universal tables</strong> handle any business</p>
                  </div>
                  <div className="flex items-start">
                    <Zap className="h-6 w-6 text-amber-400 mr-3 mt-1 flex-shrink-0" />
                    <p className="text-gray-300"><strong>24-hour deployments</strong> with 95% cost reduction</p>
                  </div>
                  <div className="flex items-start">
                    <Brain className="h-6 w-6 text-amber-400 mr-3 mt-1 flex-shrink-0" />
                    <p className="text-gray-300"><strong>AI-native intelligence</strong> built into every process</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-amber-400 mr-3 mt-1 flex-shrink-0" />
                    <p className="text-gray-300"><strong>Business-user controlled</strong> with natural language</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
              The Revolution Is Here. Which Side Are You On?
            </div>
          </div>
        </Slide>

        {/* Slide 3: Winners and Losers */}
        <Slide isActive={currentSlide === 2}>
          <div className="text-center max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Adapt or Die
            </h1>
            <h2 className="text-2xl md:text-3xl text-red-400 mb-8">
              The Enterprise Software Extinction Event
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Winners */}
              <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-3xl p-6 md:p-8 border border-emerald-500/30">
                <div className="flex items-center justify-center mb-6">
                  <Trophy className="h-12 w-12 text-emerald-400 mr-4" />
                  <h3 className="text-3xl md:text-4xl font-bold text-emerald-400">The Winners</h3>
                </div>
                <p className="text-xl text-emerald-300 mb-6">(HERA-Powered Organizations)</p>
                <div className="space-y-4 text-left">
                  <div className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/20">
                    <p className="text-white font-semibold">Mario's Restaurant</p>
                    <p className="text-emerald-300">Deployed full ERP in 24 hours, manages 26 modules</p>
                  </div>
                  <div className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/20">
                    <p className="text-white font-semibold">Healthcare Systems</p>
                    <p className="text-emerald-300">Zero-schema patient management across 50+ facilities</p>
                  </div>
                  <div className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/20">
                    <p className="text-white font-semibold">Manufacturing Giants</p>
                    <p className="text-emerald-300">Self-optimizing supply chains with predictive intelligence</p>
                  </div>
                </div>
              </div>

              {/* Losers */}
              <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 rounded-3xl p-6 md:p-8 border border-red-500/30">
                <div className="flex items-center justify-center mb-6">
                  <AlertTriangle className="h-12 w-12 text-red-400 mr-4" />
                  <h3 className="text-3xl md:text-4xl font-bold text-red-400">The Losers</h3>
                </div>
                <p className="text-xl text-red-300 mb-6">(Traditional ERP Prisoners)</p>
                <div className="space-y-4 text-left">
                  <div className="bg-red-500/10 rounded-2xl p-4 border border-red-500/20">
                    <p className="text-red-300">Stuck in 18-month cycles while competitors deploy in 24 hours</p>
                  </div>
                  <div className="bg-red-500/10 rounded-2xl p-4 border border-red-500/20">
                    <p className="text-red-300">Bleeding $2M+ per deployment while HERA users save 95%</p>
                  </div>
                  <div className="bg-red-500/10 rounded-2xl p-4 border border-red-500/20">
                    <p className="text-red-300">Hiring armies of consultants while HERA users speak naturally</p>
                  </div>
                  <div className="bg-red-500/10 rounded-2xl p-4 border border-red-500/20">
                    <p className="text-red-300">Managing 200+ tables while HERA uses 5 universal tables</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-2xl md:text-3xl font-bold text-white">
              The Choice Is Clear: <span className="text-amber-400">Evolve to intelligent systems</span> or <span className="text-red-400">become extinct</span>
            </div>
          </div>
        </Slide>

        {/* Slide 4: The Promised Land */}
        <Slide isActive={currentSlide === 3}>
          <div className="text-center max-w-6xl mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3">Welcome to the</h1>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent mb-3 sm:mb-4">
              PROMISED LAND
            </h2>
            <h3 className="text-lg sm:text-xl md:text-2xl text-amber-300 mb-6 sm:mb-8">Autonomous Business Intelligence</h3>
            
            <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-3xl p-8 md:p-12 border border-amber-500/30 mb-8">
              <p className="text-xl md:text-2xl text-white mb-8">Where Your Business Wants to Go:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-2xl p-6 border border-amber-500/40">
                  <Brain className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-white mb-2">🧠 Intelligent Operations</h4>
                  <p className="text-gray-300">Your business runs itself with AI that learns, predicts, and optimizes automatically</p>
                </div>
                
                <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-2xl p-6 border border-amber-500/40">
                  <Zap className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-white mb-2">⚡ Instant Adaptation</h4>
                  <p className="text-gray-300">New business requirements become working software in hours, not months</p>
                </div>
                
                <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-2xl p-6 border border-amber-500/40">
                  <Globe className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-white mb-2">🌍 Universal Compatibility</h4>
                  <p className="text-gray-300">One platform handles every business function across every industry</p>
                </div>
                
                <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-2xl p-6 border border-amber-500/40">
                  <Rocket className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-white mb-2">🚀 Exponential Growth</h4>
                  <p className="text-gray-300">Your capabilities compound as AI learns from every interaction</p>
                </div>
              </div>
            </div>
            
            <div className="text-xl md:text-2xl font-bold text-amber-400">
              This isn't just software. This is the future of how business works.
            </div>
          </div>
        </Slide>

        {/* Slide 5: Magic Gifts */}
        <Slide isActive={currentSlide === 4}>
          <div className="text-center max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              HERA's Revolutionary
            </h1>
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent mb-8">
              Magic Gifts
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureBox
                icon={<Globe className="h-10 w-10 text-amber-400" />}
                title="🎁 Gift 1: Universal Architecture"
                description="Obstacle: 'We need different systems for different functions' → Magic: 5 universal tables handle unlimited complexity → Result: One system, infinite possibilities"
                accent="amber"
              />
              
              <FeatureBox
                icon={<Brain className="h-10 w-10 text-amber-400" />}
                title="🎁 Gift 2: AI-Native Intelligence"
                description="Obstacle: 'Our systems are dumb and manual' → Magic: Built-in AI learns and automates decisions → Result: Self-managing business processes"
                accent="amber"
              />
              
              <FeatureBox
                icon={<Zap className="h-10 w-10 text-amber-400" />}
                title="🎁 Gift 3: Natural Language Interface"
                description="Obstacle: 'We need IT consultants for changes' → Magic: 'Track customer loyalty' = Complete CRM in 30 seconds → Result: Business users create enterprise software"
                accent="amber"
              />
              
              <FeatureBox
                icon={<Shield className="h-10 w-10 text-amber-400" />}
                title="🎁 Gift 4: Zero-Schema Migrations"
                description="Obstacle: 'Changes break our system and cost $100K+' → Magic: Universal schema evolves without breaking → Result: Infinite growth without technical debt"
                accent="amber"
              />
              
              <FeatureBox
                icon={<Rocket className="h-10 w-10 text-amber-400" />}
                title="🎁 Gift 5: Self-Evolution"
                description="Obstacle: 'Software becomes obsolete' → Magic: HERA manages its own development → Result: Exponentially improving capabilities forever"
                accent="amber"
              />
              
              <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-2xl p-6 border border-amber-500/30 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-xl font-bold text-amber-400 mb-2">The Ultimate Gift</h3>
                  <p className="text-gray-300">Your journey to the promised land starts in 24 hours, not 18 months</p>
                </div>
              </div>
            </div>
          </div>
        </Slide>

        {/* Slide 6: Evidence - The Proof */}
        <Slide isActive={currentSlide === 5}>
          <div className="text-center max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Undeniable Evidence
            </h1>
            <h2 className="text-3xl md:text-4xl bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent mb-8">
              HERA Is Already Transforming Enterprise Software
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Mario's Restaurant Success Story */}
              <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-3xl p-6 md:p-8 border border-emerald-500/30">
                <div className="flex items-center justify-center mb-6">
                  <Award className="h-12 w-12 text-emerald-400 mr-4" />
                  <h3 className="text-2xl md:text-3xl font-bold text-emerald-400">Mario's Restaurant Chain</h3>
                </div>
                <p className="text-lg text-emerald-300 mb-6">(Live Production System)</p>
                <div className="space-y-4 text-left">
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-emerald-400 mr-3 mt-1 flex-shrink-0" />
                    <p className="text-white"><strong>26 ERP modules</strong> deployed in 24 hours</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-emerald-400 mr-3 mt-1 flex-shrink-0" />
                    <p className="text-white"><strong>95% cost reduction</strong> vs $2M+ traditional ERP</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-emerald-400 mr-3 mt-1 flex-shrink-0" />
                    <p className="text-white"><strong>Zero IT dependency</strong> - chef creates inventory systems</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-emerald-400 mr-3 mt-1 flex-shrink-0" />
                    <p className="text-white"><strong>100% uptime</strong> with automatic error recovery</p>
                  </div>
                </div>
              </div>

              {/* Technical Validation */}
              <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-3xl p-6 md:p-8 border border-amber-500/30">
                <div className="flex items-center justify-center mb-6">
                  <Rocket className="h-12 w-12 text-amber-400 mr-4" />
                  <h3 className="text-2xl md:text-3xl font-bold text-amber-400">Revolutionary Architecture</h3>
                </div>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-bold text-amber-400 mb-2">540x</div>
                    <p className="text-white">Faster than traditional ERP (24 hours vs 18 months)</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-bold text-amber-400 mb-2">95%+</div>
                    <p className="text-white">Success rate with automatic rollback</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-bold text-amber-400 mb-2">94%</div>
                    <p className="text-white">AI accuracy across all business processes</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-2xl p-6 md:p-8 border border-amber-500/30">
              <p className="text-xl md:text-2xl font-bold text-amber-400 mb-4">38+ Enterprise Templates Validated</p>
              <p className="text-lg text-gray-300">26 core modules + 12 industry packages proven in production environments</p>
            </div>
          </div>
        </Slide>

        {/* Slide 7: Market Opportunity */}
        <Slide isActive={currentSlide === 6}>
          <div className="text-center max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">The</h1>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent mb-8">
              $50B ERP DISRUPTION
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
              <MetricCard
                icon={<Globe className="h-6 w-6 text-amber-400" />}
                title="Global ERP Market"
                value="$50B+"
                subtitle="Ripe for disruption"
                accent="amber"
              />
              <MetricCard
                icon={<Building2 className="h-6 w-6 text-amber-400" />}
                title="Mid-Market Companies"
                value="2M+"
                subtitle="Trapped in legacy"
                accent="amber"
              />
              <MetricCard
                icon={<DollarSign className="h-6 w-6 text-amber-400" />}
                title="Implementation Costs"
                value="$500B"
                subtitle="Eliminated annually"
                accent="amber"
              />
              <MetricCard
                icon={<Users className="h-6 w-6 text-amber-400" />}
                title="Business Users"
                value="100M+"
                subtitle="Freed from IT dependency"
                accent="amber"
              />
            </div>
            
            <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-3xl p-6 md:p-8 border border-amber-500/30 mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">Why Now? Perfect Storm of Technology Convergence</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <Brain className="h-12 w-12 text-amber-400 mx-auto mb-2" />
                  <p className="text-amber-300 font-semibold">AI reaches human-level business understanding</p>
                </div>
                <div className="text-center">
                  <Globe className="h-12 w-12 text-amber-400 mx-auto mb-2" />
                  <p className="text-amber-300 font-semibold">Cloud infrastructure enables universal deployment</p>
                </div>
                <div className="text-center">
                  <Users className="h-12 w-12 text-amber-400 mx-auto mb-2" />
                  <p className="text-amber-300 font-semibold">Mobile-first workforce demands instant access</p>
                </div>
                <div className="text-center">
                  <Zap className="h-12 w-12 text-amber-400 mx-auto mb-2" />
                  <p className="text-amber-300 font-semibold">Business agility becomes competitive necessity</p>
                </div>
              </div>
            </div>
            
            <div className="text-2xl md:text-3xl font-bold text-white">
              Market Validation: <span className="text-amber-400">Salesforce ($280B) + ServiceNow ($130B) + Snowflake ($50B)</span>
              <br />= <span className="text-amber-400">HERA combines all three + AI-native intelligence</span>
            </div>
          </div>
        </Slide>

        {/* Slide 8: Financial Projections */}
        <Slide isActive={currentSlide === 7}>
          <FinancialProjections />
        </Slide>

        {/* Slide 9: Evidence/Proof */}
        <Slide isActive={currentSlide === 8}>
          <div className="text-center w-full px-2 sm:px-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 md:mb-8">The Proof Is Undeniable</h1>
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent mb-6 sm:mb-8">Real Results from Real Customers</h2>
            
            {/* Mario's Success Story */}
            <div className="bg-gradient-to-br from-emerald-600/20 to-green-600/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-emerald-500/30 mb-6 sm:mb-8">
              <div className="flex items-center justify-center mb-4 sm:mb-6">
                <Trophy className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-emerald-400 mr-3 sm:mr-4" />
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Mario's Italian Restaurant</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
                <MetricCard
                  icon={<TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />}
                  title="Implementation Time"
                  value="2 Minutes"
                  subtitle="vs 18 months"
                  accent="emerald"
                />
                <MetricCard
                  icon={<DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />}
                  title="Cost Savings"
                  value="$2.8M"
                  subtitle="Year 1 alone"
                  accent="emerald"
                />
                <MetricCard
                  icon={<BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />}
                  title="ROI"
                  value="312%"
                  subtitle="In 90 days"
                  accent="emerald"
                />
                <MetricCard
                  icon={<Users className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />}
                  title="Efficiency Gain"
                  value="847%"
                  subtitle="Operations speed"
                  accent="emerald"
                />
              </div>
              
              <blockquote className="text-lg sm:text-xl md:text-2xl italic text-emerald-300 font-medium">
                "HERA made my restaurant feel like Amazon. We went from chaos to complete operational intelligence overnight."
              </blockquote>
              <p className="text-sm sm:text-base text-emerald-400 mt-2">- Mario Rossi, Owner</p>
            </div>
            
            {/* Additional Evidence */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-amber-500/30">
                <h4 className="text-lg sm:text-xl font-bold text-amber-400 mb-2 sm:mb-3">Customer Satisfaction</h4>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-2">98%</div>
                <p className="text-xs sm:text-sm text-gray-300">Net Promoter Score: 89</p>
              </div>
              <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-amber-500/30">
                <h4 className="text-lg sm:text-xl font-bold text-amber-400 mb-2 sm:mb-3">Revenue Growth</h4>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-2">340%</div>
                <p className="text-xs sm:text-sm text-gray-300">Month over month</p>
              </div>
              <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-amber-500/30">
                <h4 className="text-lg sm:text-xl font-bold text-amber-400 mb-2 sm:mb-3">Churn Rate</h4>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-2">0%</div>
                <p className="text-xs sm:text-sm text-gray-300">Zero customer losses</p>
              </div>
            </div>
          </div>
        </Slide>

        {/* Slide 10: Competition Analysis */}
        <Slide isActive={currentSlide === 9}>
          <div className="text-center w-full px-2 sm:px-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">Why Competitors Can't Respond</h1>
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent mb-6 sm:mb-8">David vs Goliaths</h2>
            
            {/* Comparison Table */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-gray-600/30 mb-6 sm:mb-8 overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm sm:text-base">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left p-3 sm:p-4 text-gray-300"></th>
                    <th className="text-center p-3 sm:p-4 text-red-400 font-bold">Legacy Giants<br /><span className="text-xs opacity-80">(SAP, Oracle, Microsoft)</span></th>
                    <th className="text-center p-3 sm:p-4 text-blue-400 font-bold">Startups<br /><span className="text-xs opacity-80">(Narrow Solutions)</span></th>
                    <th className="text-center p-3 sm:p-4 text-amber-400 font-bold">HERA<br /><span className="text-xs opacity-80">(Universal Intelligence)</span></th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700">
                    <td className="p-3 sm:p-4 font-semibold text-white">Strengths</td>
                    <td className="p-3 sm:p-4 text-center text-gray-300">Brand recognition<br />Existing customers</td>
                    <td className="p-3 sm:p-4 text-center text-gray-300">Agility<br />Modern tech</td>
                    <td className="p-3 sm:p-4 text-center text-amber-300 font-semibold">Universal architecture<br />AI-native intelligence</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="p-3 sm:p-4 font-semibold text-white">Fatal Weakness</td>
                    <td className="p-3 sm:p-4 text-center text-red-300">Legacy architecture<br />Cultural inertia</td>
                    <td className="p-3 sm:p-4 text-center text-blue-300">Narrow focus<br />No universal solution</td>
                    <td className="p-3 sm:p-4 text-center text-amber-300 font-semibold">None identified</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="p-3 sm:p-4 font-semibold text-white">Response Time</td>
                    <td className="p-3 sm:p-4 text-center text-red-300">3-5 years<br /><span className="text-xs">(Too late)</span></td>
                    <td className="p-3 sm:p-4 text-center text-blue-300">Immediate<br /><span className="text-xs">(But limited scope)</span></td>
                    <td className="p-3 sm:p-4 text-center text-amber-300 font-semibold">N/A<br /><span className="text-xs">(First mover)</span></td>
                  </tr>
                  <tr>
                    <td className="p-3 sm:p-4 font-semibold text-white">Market Position</td>
                    <td className="p-3 sm:p-4 text-center text-red-300">Declining<br />Disruption target</td>
                    <td className="p-3 sm:p-4 text-center text-blue-300">Feature player<br />Limited scope</td>
                    <td className="p-3 sm:p-4 text-center text-amber-300 font-semibold">Category creator<br />Universal leader</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-2xl p-4 sm:p-6 border border-amber-500/30">
              <p className="text-lg sm:text-xl font-bold text-amber-400 mb-2">HERA's Unbreachable Moat:</p>
              <p className="text-sm sm:text-base md:text-lg text-white">Universal architecture creates network effects that become impossible to replicate. Every customer implementation strengthens the entire platform.</p>
            </div>
          </div>
        </Slide>

        {/* Slide 11: Business Model */}
        <Slide isActive={currentSlide === 10}>
          <div className="text-center w-full px-2 sm:px-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">Recurring Revenue Machine</h1>
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent mb-6 sm:mb-8">Land and Expand on Steroids</h2>
            
            {/* Pricing Tiers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 border border-gray-600 hover:border-amber-500 transition-all">
                <h3 className="text-lg sm:text-xl font-bold text-amber-400 mb-3">Starter</h3>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-2">$2,997<span className="text-sm text-gray-400">/mo</span></div>
                <p className="text-xs sm:text-sm text-gray-400 mb-4">vs SAP's $150K+ setup</p>
                <ul className="text-left text-xs sm:text-sm text-gray-300 space-y-1">
                  <li>• Up to 50 users</li>
                  <li>• Core business functions</li>
                  <li>• AI-powered insights</li>
                  <li>• 24/7 support</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-2xl p-4 sm:p-6 border border-amber-500 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-amber-500 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">MOST POPULAR</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-amber-400 mb-3">Professional</h3>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-2">$9,997<span className="text-sm text-gray-400">/mo</span></div>
                <p className="text-xs sm:text-sm text-gray-400 mb-4">Unlimited users</p>
                <ul className="text-left text-xs sm:text-sm text-gray-300 space-y-1">
                  <li>• Unlimited users</li>
                  <li>• Advanced AI features</li>
                  <li>• Custom integrations</li>
                  <li>• Priority support</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 border border-gray-600 hover:border-amber-500 transition-all">
                <h3 className="text-lg sm:text-xl font-bold text-amber-400 mb-3">Enterprise</h3>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-2">$29,997<span className="text-sm text-gray-400">/mo</span></div>
                <p className="text-xs sm:text-sm text-gray-400 mb-4">Unlimited everything</p>
                <ul className="text-left text-xs sm:text-sm text-gray-300 space-y-1">
                  <li>• Enterprise-grade security</li>
                  <li>• Custom AI models</li>
                  <li>• Dedicated success manager</li>
                  <li>• White-glove onboarding</li>
                </ul>
              </div>
            </div>
            
            {/* Revenue Streams */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-xl p-3 sm:p-4 border border-amber-500/30">
                <h4 className="text-sm sm:text-base font-bold text-amber-400 mb-2">Platform Revenue</h4>
                <div className="text-lg sm:text-xl font-bold text-white">85%</div>
                <p className="text-xs text-gray-400">Gross margins</p>
              </div>
              <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-xl p-3 sm:p-4 border border-amber-500/30">
                <h4 className="text-sm sm:text-base font-bold text-amber-400 mb-2">Template Store</h4>
                <div className="text-lg sm:text-xl font-bold text-white">30%</div>
                <p className="text-xs text-gray-400">Take rate</p>
              </div>
              <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-xl p-3 sm:p-4 border border-amber-500/30">
                <h4 className="text-sm sm:text-base font-bold text-amber-400 mb-2">Implementation</h4>
                <div className="text-lg sm:text-xl font-bold text-white">$50K</div>
                <p className="text-xs text-gray-400">Average deal</p>
              </div>
              <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-xl p-3 sm:p-4 border border-amber-500/30">
                <h4 className="text-sm sm:text-base font-bold text-amber-400 mb-2">Integrations</h4>
                <div className="text-lg sm:text-xl font-bold text-white">$25K</div>
                <p className="text-xs text-gray-400">Per connection</p>
              </div>
            </div>
          </div>
        </Slide>

        {/* Slide 12: Market Size */}
        <Slide isActive={currentSlide === 11}>
          <div className="text-center w-full px-2 sm:px-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">The $47B Disruption</h1>
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent mb-6 sm:mb-8">We're Not Competing - We're Category Killing</h2>
            
            {/* Market Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
              <MetricCard
                icon={<Globe className="h-5 w-5 text-amber-400" />}
                title="Global ERP Market"
                value="$47.2B"
                subtitle="Total addressable"
                accent="amber"
              />
              <MetricCard
                icon={<DollarSign className="h-5 w-5 text-red-400" />}
                title="Average ERP Cost"
                value="$15M"
                subtitle="Per implementation"
                accent="blue"
              />
              <MetricCard
                icon={<Zap className="h-5 w-5 text-amber-400" />}
                title="HERA Average Cost"
                value="$50K"
                subtitle="Per implementation"
                accent="amber"
              />
              <MetricCard
                icon={<TrendingUp className="h-5 w-5 text-emerald-400" />}
                title="Disruption Potential"
                value="99.7%"
                subtitle="Cost reduction"
                accent="emerald"
              />
            </div>
            
            {/* Market Strategy */}
            <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-amber-500/30 mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-400 mb-4 sm:mb-6">Three-Phase Domination Strategy</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-xl p-4 sm:p-6 border border-amber-500/30">
                  <h4 className="text-lg sm:text-xl font-bold text-amber-400 mb-3">Phase 1: SMB Domination</h4>
                  <p className="text-sm sm:text-base text-gray-300 mb-2">Target: 10,000 customers</p>
                  <p className="text-sm sm:text-base text-gray-300 mb-2">Timeline: 12 months</p>
                  <p className="text-sm sm:text-base text-amber-300 font-semibold">Result: Market validation + revenue base</p>
                </div>
                
                <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-xl p-4 sm:p-6 border border-amber-500/30">
                  <h4 className="text-lg sm:text-xl font-bold text-amber-400 mb-3">Phase 2: Enterprise Attack</h4>
                  <p className="text-sm sm:text-base text-gray-300 mb-2">Target: Fortune 1000</p>
                  <p className="text-sm sm:text-base text-gray-300 mb-2">Timeline: 18 months</p>
                  <p className="text-sm sm:text-base text-amber-300 font-semibold">Result: Enterprise credibility + scale</p>
                </div>
                
                <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-xl p-4 sm:p-6 border border-amber-500/30">
                  <h4 className="text-lg sm:text-xl font-bold text-amber-400 mb-3">Phase 3: Global Expansion</h4>
                  <p className="text-sm sm:text-base text-gray-300 mb-2">Target: Category ownership</p>
                  <p className="text-sm sm:text-base text-gray-300 mb-2">Timeline: 36 months</p>
                  <p className="text-sm sm:text-base text-amber-300 font-semibold">Result: Unicorn status + IPO readiness</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-emerald-600/20 to-amber-600/20 rounded-2xl p-4 sm:p-6 border border-emerald-500/30">
              <p className="text-lg sm:text-xl font-bold text-white mb-2">The Network Effect Multiplier:</p>
              <p className="text-sm sm:text-base md:text-lg text-gray-300">Every customer implementation creates templates that benefit all future customers, making HERA exponentially more valuable with scale.</p>
            </div>
          </div>
        </Slide>

        {/* Slide 13: Go-to-Market Strategy */}
        <Slide isActive={currentSlide === 12}>
          <div className="text-center w-full px-2 sm:px-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">Go-to-Market Strategy</h1>
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent mb-6 sm:mb-8">The 24-Hour Advantage</h2>
            
            {/* Sales Channels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
              <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-2xl p-4 sm:p-6 md:p-8 border border-amber-500/30">
                <h3 className="text-xl sm:text-2xl font-bold text-amber-400 mb-4 sm:mb-6">Channel Strategy</h3>
                <div className="space-y-3 sm:space-y-4 text-left">
                  <div className="flex items-start">
                    <Target className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-white">Direct Sales (60%)</p>
                      <p className="text-xs sm:text-sm text-gray-300">Enterprise accounts, high-touch sales process</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-white">Partner Network (25%)</p>
                      <p className="text-xs sm:text-sm text-gray-300">50,000 accountants as implementation specialists</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-white">Self-Service (15%)</p>
                      <p className="text-xs sm:text-sm text-gray-300">AI-guided deployments for SMB market</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-2xl p-4 sm:p-6 md:p-8 border border-emerald-500/30">
                <h3 className="text-xl sm:text-2xl font-bold text-emerald-400 mb-4 sm:mb-6">Competitive Advantage</h3>
                <div className="space-y-3 sm:space-y-4 text-left">
                  <div className="flex items-start">
                    <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-white">Speed to Value</p>
                      <p className="text-xs sm:text-sm text-gray-300">24-hour deployments vs 18-month competitors</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-white">Cost Structure</p>
                      <p className="text-xs sm:text-sm text-gray-300">99.7% cost reduction creates unbeatable ROI</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-white">AI Intelligence</p>
                      <p className="text-xs sm:text-sm text-gray-300">Self-improving system with network effects</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Customer Acquisition Metrics */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-4 sm:p-6 border border-gray-600/30">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Unit Economics That Scale</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-amber-400">$2,400</div>
                  <p className="text-xs sm:text-sm text-gray-400">Customer Acquisition Cost</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-400">$89,000</div>
                  <p className="text-xs sm:text-sm text-gray-400">Lifetime Value</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-amber-400">37:1</div>
                  <p className="text-xs sm:text-sm text-gray-400">LTV:CAC Ratio</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-400">4.2mo</div>
                  <p className="text-xs sm:text-sm text-gray-400">Payback Period</p>
                </div>
              </div>
            </div>
          </div>
        </Slide>

        {/* Slide 14: The Ask */}
        <Slide isActive={currentSlide === 13}>
          <div className="text-center w-full px-2 sm:px-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">Join the Disruption</h1>
            <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent mb-4 sm:mb-6">
              $15M
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 mb-6 sm:mb-8">Series A - Category Ownership</h2>
            
            {/* Use of Funds */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-2xl p-4 sm:p-6 border border-amber-500/30">
                <h3 className="text-lg sm:text-xl font-bold text-amber-400 mb-3">Sales & Marketing (60%)</h3>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-2">$9M</div>
                <p className="text-xs sm:text-sm text-gray-300">Dominate SMB market, attack enterprise accounts</p>
                <ul className="text-left text-xs sm:text-sm text-gray-400 mt-3 space-y-1">
                  <li>• 50-person sales team</li>
                  <li>• Marketing automation</li>
                  <li>• Partner channel development</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-2xl p-4 sm:p-6 border border-emerald-500/30">
                <h3 className="text-lg sm:text-xl font-bold text-emerald-400 mb-3">Product Development (25%)</h3>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-2">$3.75M</div>
                <p className="text-xs sm:text-sm text-gray-300">AI advancement, template marketplace expansion</p>
                <ul className="text-left text-xs sm:text-sm text-gray-400 mt-3 space-y-1">
                  <li>• 20 AI engineers</li>
                  <li>• Template marketplace</li>
                  <li>• Enterprise integrations</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl p-4 sm:p-6 border border-blue-500/30">
                <h3 className="text-lg sm:text-xl font-bold text-blue-400 mb-3">Operations (15%)</h3>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-2">$2.25M</div>
                <p className="text-xs sm:text-sm text-gray-300">Scale infrastructure, international expansion</p>
                <ul className="text-left text-xs sm:text-sm text-gray-400 mt-3 space-y-1">
                  <li>• Global infrastructure</li>
                  <li>• Customer success</li>
                  <li>• Security compliance</li>
                </ul>
              </div>
            </div>
            
            {/* Timeline & Milestones */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-4 sm:p-6 border border-gray-600/30 mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">18-Month Runway to Series B</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-amber-400 mb-2">$50M</div>
                  <p className="text-xs sm:text-sm text-gray-300">ARR Target</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-400 mb-2">$500M</div>
                  <p className="text-xs sm:text-sm text-gray-300">Series B Valuation</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-amber-400 mb-2">10,000</div>
                  <p className="text-xs sm:text-sm text-gray-300">Customer Target</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-emerald-600/20 to-amber-600/20 rounded-2xl p-4 sm:p-6 border border-emerald-500/30">
              <p className="text-lg sm:text-xl font-bold text-emerald-400 mb-2">The Opportunity:</p>
              <p className="text-sm sm:text-base md:text-lg text-white">Get Series A pricing for what will be a Series C company by Q4 2025. First-movers get the best terms.</p>
            </div>
          </div>
        </Slide>

        {/* Slide 15: Prize Frame */}
        <Slide isActive={currentSlide === 14}>
          <div className="text-center w-full px-2 sm:px-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">You Need to Qualify</h1>
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent mb-6 sm:mb-8">We Choose Our Investors Carefully</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
              {/* What We Need */}
              <div className="bg-gradient-to-br from-red-900/20 to-red-800/20 rounded-2xl p-4 sm:p-6 md:p-8 border border-red-500/30">
                <h3 className="text-xl sm:text-2xl font-bold text-red-400 mb-4 sm:mb-6">What We Need From You</h3>
                <div className="space-y-3 sm:space-y-4 text-left">
                  <div className="flex items-start">
                    <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-red-400 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-white">Strategic Value</p>
                      <p className="text-xs sm:text-sm text-gray-300">Connections to Fortune 1000 CTOs and decision makers</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-red-400 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-white">Category Experience</p>
                      <p className="text-xs sm:text-sm text-gray-300">Deep understanding of platform businesses and network effects</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-red-400 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-white">Commitment Level</p>
                      <p className="text-xs sm:text-sm text-gray-300">Lead investor position with $5M+ minimum investment</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-red-400 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-white">Decision Speed</p>
                      <p className="text-xs sm:text-sm text-gray-300">Term sheet signed within 14 business days</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* What You Get */}
              <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-2xl p-4 sm:p-6 md:p-8 border border-amber-500/30">
                <h3 className="text-xl sm:text-2xl font-bold text-amber-400 mb-4 sm:mb-6">What You Get In Return</h3>
                <div className="space-y-3 sm:space-y-4 text-left">
                  <div className="flex items-start">
                    <Award className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-white">Board Seat</p>
                      <p className="text-xs sm:text-sm text-gray-300">Active participation in category-defining company</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Star className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-white">Preferential Terms</p>
                      <p className="text-xs sm:text-sm text-gray-300">2x board fee and pro-rata rights for first $10M invested</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Handshake className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-white">Strategic Access</p>
                      <p className="text-xs sm:text-sm text-gray-300">First access to enterprise partnerships and co-selling opportunities</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-white">Exit Potential</p>
                      <p className="text-xs sm:text-sm text-gray-300">Conservative $1B+ valuation within 36 months</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-red-600/20 to-amber-600/20 rounded-2xl p-4 sm:p-6 border border-red-500/30">
              <p className="text-lg sm:text-xl font-bold text-red-400 mb-2">The Reality Check:</p>
              <p className="text-sm sm:text-base md:text-lg text-white">This round fills with or without you. The question is whether you want to own a piece of the $47B ERP disruption or watch from the sidelines.</p>
            </div>
          </div>
        </Slide>

        {/* Slide 16: The Team */}
        <Slide isActive={currentSlide === 15}>
          <div className="w-full px-2 sm:px-4 max-w-7xl mx-auto">
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent mb-3 sm:mb-4">
                🚀 The Leadership That Will Transform Enterprise Software
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-300">Proven Execution + Strategic Expertise + Industry Connections</p>
            </div>
            
            {/* Team Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Founder */}
              <div className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-2xl p-4 sm:p-6 text-center transform hover:scale-105 transition-all duration-300 lg:col-span-1">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl sm:text-3xl">
                  👨‍💼
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">Founder & CEO</h3>
                <p className="text-sm sm:text-base opacity-90 mb-3">Full-Time Committed Leader</p>
                <div className="text-xs sm:text-sm leading-relaxed mb-4 opacity-80">
                  • 20+ years SAP implementation experience<br/>
                  • Chartered Accountant (Financial expertise)<br/>
                  • Applied Data Science Program graduate<br/>
                  • Built & exited domestic staff agency (0→300 customers)
                </div>
                <div className="bg-white/20 rounded-lg p-2 sm:p-3 text-xs sm:text-sm font-semibold">
                  100% Committed • Personal Investment • Equity Aligned
                </div>
              </div>
              
              {/* Technical Advisor */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-amber-500/30 rounded-2xl p-4 sm:p-6 text-center transform hover:scale-105 transition-all duration-300">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-amber-500/20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl sm:text-3xl text-amber-400">
                  🔧
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Technical Advisor</h3>
                <p className="text-sm sm:text-base text-amber-400 mb-3">Strategic Technology Partner</p>
                <div className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-4">
                  • Enterprise software architecture expert<br/>
                  • AI/ML implementation experience<br/>
                  • Scalability & security guidance<br/>
                  • Technical due diligence support
                </div>
                <div className="bg-amber-500/20 text-amber-300 rounded-lg p-2 sm:p-3 text-xs sm:text-sm font-semibold">
                  Equity Partner • Strategic Sessions • Technical Reviews
                </div>
              </div>
              
              {/* Channel Advisor */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-amber-500/30 rounded-2xl p-4 sm:p-6 text-center transform hover:scale-105 transition-all duration-300">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-amber-500/20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl sm:text-3xl text-amber-400">
                  🤝
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Channel Advisor</h3>
                <p className="text-sm sm:text-base text-amber-400 mb-3">Strategic Partnership Expert</p>
                <div className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-4">
                  • Accounting industry relationships<br/>
                  • Channel partner program expertise<br/>
                  • Go-to-market strategy guidance<br/>
                  • CPA network access & credibility
                </div>
                <div className="bg-amber-500/20 text-amber-300 rounded-lg p-2 sm:p-3 text-xs sm:text-sm font-semibold">
                  Equity Partner • Network Access • Market Validation
                </div>
              </div>
            </div>
            
            {/* Commitment Structure */}
            <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-amber-500/30">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-center text-amber-400 mb-4 sm:mb-6">🎯 Strategic Structure & Commitment Levels</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800/50 rounded-xl p-3 sm:p-4 text-center">
                  <h4 className="text-sm sm:text-base font-bold text-white mb-2">CEO Commitment</h4>
                  <p className="text-xs sm:text-sm text-gray-300">Full-time dedicated leader<br/>Personal investment<br/>100% equity aligned</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-3 sm:p-4 text-center">
                  <h4 className="text-sm sm:text-base font-bold text-white mb-2">Advisor Equity</h4>
                  <p className="text-xs sm:text-sm text-gray-300">1-2% each in exchange<br/>for strategic expertise<br/>4-year vesting</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-3 sm:p-4 text-center">
                  <h4 className="text-sm sm:text-base font-bold text-white mb-2">Time Investment</h4>
                  <p className="text-xs sm:text-sm text-gray-300">Regular strategic sessions<br/>Key milestone support<br/>Network introductions</p>
                </div>
              </div>
            </div>
            
            {/* Why This Works */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-4 sm:p-6 border border-gray-600/30">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-center text-white mb-4 sm:mb-6">🏆 Why This Lean Structure Accelerates Success</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                  <div className="text-xs sm:text-sm text-gray-300">
                    <strong className="text-white">Focused Leadership:</strong> Single decision-maker with complete accountability
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                  <div className="text-xs sm:text-sm text-gray-300">
                    <strong className="text-white">Strategic Expertise:</strong> Senior-level guidance without full-time overhead
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                  <div className="text-xs sm:text-sm text-gray-300">
                    <strong className="text-white">Capital Efficient:</strong> Proven startup model used by Salesforce, Zoom, Slack
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                  <div className="text-xs sm:text-sm text-gray-300">
                    <strong className="text-white">Risk Mitigation:</strong> Test relationships before full-time hiring
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                  <div className="text-xs sm:text-sm text-gray-300">
                    <strong className="text-white">Network Access:</strong> Industry connections for partnerships & hiring
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                  <div className="text-xs sm:text-sm text-gray-300">
                    <strong className="text-white">Scaling Ready:</strong> Clear pathway to full executive team post-funding
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Slide>

        {/* Slide 17: Final Close */}
        <Slide isActive={currentSlide === 16}>
          <div className="text-center w-full px-2 sm:px-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">Welcome to the Future</h1>
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent mb-6 sm:mb-8">Questions Are for People Who Don't Get It</h2>
            
            <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed">
              <strong className="text-white">THE REALITY:</strong> You've just seen the future of enterprise software. 
              The question isn't whether HERA will succeed - it's whether you'll be part of the journey.
            </p>
            
            {/* Three Choices */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-2xl p-4 sm:p-6 border border-emerald-500/30">
                <h3 className="text-lg sm:text-xl font-bold text-emerald-400 mb-3">✅ Join Us</h3>
                <p className="text-sm sm:text-base text-gray-300 mb-2">Own equity in the $47B category disruption</p>
                <p className="text-xs sm:text-sm text-emerald-300 font-semibold">Get Series A pricing for a Series C company</p>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-4 sm:p-6 border border-yellow-500/30">
                <h3 className="text-lg sm:text-xl font-bold text-yellow-400 mb-3">⏳ Wait and See</h3>
                <p className="text-sm sm:text-base text-gray-300 mb-2">Pay 5x more in Series B (if you're invited)</p>
                <p className="text-xs sm:text-sm text-yellow-300 font-semibold">Miss the early-stage opportunity</p>
              </div>
              
              <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-2xl p-4 sm:p-6 border border-red-500/30">
                <h3 className="text-lg sm:text-xl font-bold text-red-400 mb-3">❌ Pass</h3>
                <p className="text-sm sm:text-base text-gray-300 mb-2">Watch your portfolio companies get disrupted by ours</p>
                <p className="text-xs sm:text-sm text-red-300 font-semibold">Miss the category-defining moment</p>
              </div>
            </div>
            
            {/* Final Quote */}
            <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-amber-500/30 mb-6 sm:mb-8">
              <blockquote className="text-lg sm:text-xl md:text-2xl italic text-gray-300 mb-4 leading-relaxed">
                "The best time to invest in category-defining companies is before the category exists. Welcome to that moment."
              </blockquote>
              <p className="text-sm sm:text-base font-bold text-amber-400">- HERA Leadership Team</p>
            </div>
            
            {/* Call to Action */}
            <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-2xl p-4 sm:p-6 border border-amber-500/40">
              <p className="text-lg sm:text-xl font-bold text-amber-400 mb-2">FINAL FRAME:</p>
              <p className="text-sm sm:text-base md:text-lg text-white mb-4">This isn't about needing your money. This is about choosing who gets to own the future.</p>
              <p className="text-xs sm:text-sm text-gray-400">Term sheet negotiations begin immediately for qualified lead investors.</p>
            </div>
          </div>
        </Slide>
      </div>
    </div>
  )
}