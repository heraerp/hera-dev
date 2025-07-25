'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Maximize, Lock, TrendingUp, Zap, Target, Users, DollarSign, BarChart3, Rocket, Brain, Shield, Clock, CheckCircle, Trophy, AlertTriangle, Globe, Building2, Calculator, Briefcase, Award, Star, Handshake, Factory, Hospital, GraduationCap, ShoppingBag, Wrench } from 'lucide-react'

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
      case 'purple':
        return {
          border: 'hover:border-purple-500',
          shadow: 'hover:shadow-purple-500/10',
          iconBg: 'bg-gradient-to-br from-purple-500/20 to-yellow-500/20 group-hover:from-purple-500/30 group-hover:to-yellow-500/30',
          textGradient: 'bg-gradient-to-r from-purple-400 to-yellow-400',
          subtitle: 'text-purple-300'
        }
      case 'red':
        return {
          border: 'hover:border-red-500',
          shadow: 'hover:shadow-red-500/10',
          iconBg: 'bg-gradient-to-br from-red-500/20 to-yellow-500/20 group-hover:from-red-500/30 group-hover:to-yellow-500/30',
          textGradient: 'bg-gradient-to-r from-red-400 to-yellow-400',
          subtitle: 'text-red-300'
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
      case 'purple':
        return {
          border: 'hover:border-purple-400/50',
          iconBg: 'bg-gradient-to-br from-purple-500/10 to-yellow-500/10 group-hover:from-purple-500/20 group-hover:to-yellow-500/20',
          highlightBg: 'bg-gradient-to-r from-purple-500/20 to-yellow-500/20',
          highlightText: 'text-purple-300'
        }
      case 'red':
        return {
          border: 'hover:border-red-400/50',
          iconBg: 'bg-gradient-to-br from-red-500/10 to-yellow-500/10 group-hover:from-red-500/20 group-hover:to-yellow-500/20',
          highlightBg: 'bg-gradient-to-r from-red-500/20 to-yellow-500/20',
          highlightText: 'text-red-300'
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
      <div className={`p-3 ${classes.iconBg} rounded-xl w-fit mb-4 group-hover:from-amber-500/20 group-hover:to-yellow-500/20 transition-all`}>
        {icon}
      </div>
      <h3 className="text-lg md:text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-3">{description}</p>
      {highlight && (
        <div className={`mt-3 px-3 py-1.5 ${classes.highlightBg} rounded-lg`}>
          <span className={`${classes.highlightText} font-semibold text-sm md:text-base`}>{highlight}</span>
        </div>
      )}
    </div>
  )
}

const VerticalCard: React.FC<{ icon: React.ReactNode; title: string; revenue: string; ceo: string; channel: string; edge: string; accent?: string }> = ({ icon, title, revenue, ceo, channel, edge, accent = "amber" }) => {
  const getAccentClasses = () => {
    switch (accent) {
      case 'emerald':
        return {
          border: 'border-emerald-500',
          titleColor: 'text-emerald-400',
          revenueColor: 'text-emerald-300'
        }
      case 'blue':
        return {
          border: 'border-blue-500',
          titleColor: 'text-blue-400',
          revenueColor: 'text-blue-300'
        }
      case 'purple':
        return {
          border: 'border-purple-500',
          titleColor: 'text-purple-400',
          revenueColor: 'text-purple-300'
        }
      case 'red':
        return {
          border: 'border-red-500',
          titleColor: 'text-red-400',
          revenueColor: 'text-red-300'
        }
      default:
        return {
          border: 'border-amber-500',
          titleColor: 'text-amber-400',
          revenueColor: 'text-amber-300'
        }
    }
  }
  
  const classes = getAccentClasses()
  
  return (
    <div className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border-2 ${classes.border} hover:scale-105 transition-all duration-300`}>
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className={`text-xl font-bold ${classes.titleColor} mb-2`}>{title}</h3>
      <div className={`text-lg font-bold ${classes.revenueColor} mb-4`}>{revenue}</div>
      <div className="space-y-2 text-sm text-gray-300">
        <p><strong className="text-white">CEO:</strong> {ceo}</p>
        <p><strong className="text-white">Channel:</strong> {channel}</p>
        <p><strong className="text-white">Edge:</strong> {edge}</p>
      </div>
    </div>
  )
}

export default function EmpireDeck() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  const correctPassword = "NextDecade"
  const totalSlides = 13

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
        e.preventDefault()
        nextSlide()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prevSlide()
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        toggleFullscreen()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-900/20 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-amber-500/50 shadow-2xl max-w-md w-full">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🏗️</div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent mb-2">
              HERA EMPIRE DECK
            </h1>
            <p className="text-gray-400">Confidential - Authorized Access Only</p>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Access Code
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Enter access code..."
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 font-bold py-3 px-4 rounded-lg hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 transform hover:scale-105"
            >
              Access Empire Deck
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              This presentation contains confidential business strategy information.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-900/20 to-gray-900 overflow-hidden relative">
      {/* Side Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="fixed left-4 md:left-8 top-1/2 transform -translate-y-1/2 p-3 md:p-4 bg-gray-800/80 backdrop-blur-sm rounded-full text-white hover:bg-gray-700/90 transition-all duration-200 hover:scale-110 border border-amber-500/30 z-50 group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 group-hover:-translate-x-0.5 transition-transform" />
      </button>
      
      <button
        onClick={nextSlide}
        className="fixed right-4 md:right-8 top-1/2 transform -translate-y-1/2 p-3 md:p-4 bg-gray-800/80 backdrop-blur-sm rounded-full text-white hover:bg-gray-700/90 transition-all duration-200 hover:scale-110 border border-amber-500/30 z-50 group"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6 group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Bottom Controls */}
      <div className="fixed bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-3 z-50">
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/80 backdrop-blur-sm rounded-full border border-amber-500/30">
          <span className="text-amber-400 font-bold text-sm">{currentSlide + 1}</span>
          <span className="text-gray-500">/</span>
          <span className="text-gray-400 text-sm">{totalSlides}</span>
        </div>
        
        <button
          onClick={toggleFullscreen}
          className="p-2.5 bg-gray-800/80 backdrop-blur-sm rounded-full text-white hover:bg-gray-700/90 transition-all duration-200 hover:scale-110 border border-amber-500/30"
          aria-label="Toggle fullscreen"
        >
          <Maximize className="h-4 w-4" />
        </button>
      </div>

      {/* Slides Container */}
      <div className="relative w-full h-screen">
        {/* Slide 1: Hero */}
        <Slide isActive={currentSlide === 0}>
          <div className="text-center max-w-6xl mx-auto">
            <div className="text-6xl md:text-7xl lg:text-8xl mb-6">🏗️</div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 bg-clip-text text-transparent">
              HERA
            </h1>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6">
              The Universal Business Platform That Makes Enterprise Software Obsolete
            </h2>
            <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-2xl p-6 border border-amber-500/30 max-w-4xl mx-auto">
              <p className="text-xl md:text-2xl text-amber-300 font-semibold">
                Deploy Any Business Application in 24 Hours Instead of 18 Months
              </p>
            </div>
          </div>
        </Slide>

        {/* Slide 2: The Problem */}
        <Slide isActive={currentSlide === 1}>
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-white mb-8">
              💔 The $47B Problem With Business Software
            </h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Current Reality */}
              <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 rounded-3xl p-8 border border-red-500/30">
                <h2 className="text-2xl md:text-3xl font-bold text-red-400 mb-6">❌ Current Reality</h2>
                <h3 className="text-xl font-bold text-white mb-4">Every Business Faces This Nightmare</h3>
                <div className="space-y-4 text-gray-300">
                  <p><strong>18-Month Implementations:</strong> By the time software is ready, your business has changed</p>
                  <p><strong>$2M+ Costs:</strong> Only enterprises can afford proper business software</p>
                  <p><strong>Rigid Systems:</strong> 200+ database tables that break when you need to adapt</p>
                  <p><strong>Integration Hell:</strong> 10+ different systems that don't talk to each other</p>
                </div>
                <div className="mt-6 p-4 bg-red-500/20 rounded-xl">
                  <p className="text-red-300 font-semibold">Result: 73% of digital transformations fail</p>
                </div>
              </div>

              {/* HERA Solution */}
              <div className="bg-gradient-to-br from-emerald-600/20 to-green-600/20 rounded-3xl p-8 border border-emerald-500/30">
                <h2 className="text-2xl md:text-3xl font-bold text-emerald-400 mb-6">✅ The HERA Way</h2>
                <h3 className="text-xl font-bold text-white mb-4">Universal Platform That Adapts Instantly</h3>
                <div className="space-y-4 text-gray-300">
                  <p><strong>24-Hour Deployment:</strong> From zero to fully operational in one day</p>
                  <p><strong>$0 Implementation:</strong> Self-service deployment, no consultants needed</p>
                  <p><strong>Infinitely Flexible:</strong> 5 universal tables adapt to any business model</p>
                  <p><strong>All-in-One Platform:</strong> ERP, CRM, HR, everything in one unified system</p>
                </div>
                <div className="mt-6 p-4 bg-emerald-500/20 rounded-xl">
                  <p className="text-emerald-300 font-semibold">Result: 340% faster adoption than competitors</p>
                </div>
              </div>
            </div>
          </div>
        </Slide>

        {/* Slide 3: Product Demo - How It Works */}
        <Slide isActive={currentSlide === 2}>
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-white mb-8">
              ✨ See HERA in Action
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <FeatureBox
                icon={<Clock className="h-8 w-8 md:h-10 md:w-10 text-amber-400" />}
                title="⏱️ Minute 0-5: Choose Your Industry"
                description="Select from restaurant, healthcare, manufacturing, retail, or any business type. HERA instantly configures industry-specific workflows, terminology, and compliance requirements."
                highlight="Live Demo: Restaurant selected"
              />
              <FeatureBox
                icon={<Zap className="h-8 w-8 md:h-10 md:w-10 text-amber-400" />}
                title="🚀 Minute 5-15: AI Builds Your System"
                description="Describe your business in plain English. AI generates your complete chart of accounts, workflows, user roles, and dashboards. No coding, no consultants."
                highlight="Result: 127 GL accounts created"
              />
              <FeatureBox
                icon={<CheckCircle className="h-8 w-8 md:h:10 md:w-10 text-emerald-400" />}
                title="✅ Minute 15-30: Start Operating"
                description="Your complete business system is live. Create orders, track inventory, manage customers, run payroll, generate reports - everything works immediately."
                highlight="First order processed in 18 minutes"
                accent="emerald"
              />
              <FeatureBox
                icon={<Brain className="h-8 w-8 md:h-10 md:w-10 text-emerald-400" />}
                title="🧠 Day 2+: AI Learns & Optimizes"
                description="Every transaction makes HERA smarter. AI suggests process improvements, automates repetitive tasks, and predicts business needs before they arise."
                highlight="93% of entries auto-generated by Day 30"
                accent="emerald"
              />
            </div>

            <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-2xl p-6 border border-amber-500/30 text-center">
              <p className="text-xl md:text-2xl text-amber-300 font-semibold">
                "It's like having SAP's power with Instagram's simplicity"
              </p>
              <p className="text-sm text-gray-400 mt-2">- Beta Customer</p>
            </div>
          </div>
        </Slide>

        {/* Slide 4: The Technical Innovation */}
        <Slide isActive={currentSlide === 3}>
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-white mb-8">
              🧬 The Technical Breakthrough That Changes Everything
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FeatureBox
                icon={<Wrench className="h-8 w-8 md:h-10 md:w-10 text-amber-400" />}
                title="🔧 Universal 5-Table Architecture"
                description="While competitors need 200+ tables per industry, HERA uses just 5 universal tables that adapt to ANY business model. It's like DNA - simple building blocks creating infinite complexity."
                highlight="Patent-pending innovation"
              />
              <FeatureBox
                icon={<Brain className="h-8 w-8 md:h-10 md:w-10 text-amber-400" />}
                title="🤖 AI-Native From Day One"
                description="Not AI added on top - AI built into the core. Natural language creates workflows, ML optimizes operations, and every customer interaction trains the system."
                highlight="10x faster than manual setup"
              />
              <FeatureBox
                icon={<Shield className="h-8 w-8 md:h-10 md:w-10 text-blue-400" />}
                title="🛡️ Enterprise-Grade Security"
                description="Bank-level encryption, SOC 2 compliance, row-level security, and complete data isolation. Each customer's data is cryptographically separated."
                highlight="Zero security incidents"
                accent="blue"
              />
              <FeatureBox
                icon={<Rocket className="h-8 w-8 md:h-10 md:w-10 text-blue-400" />}
                title="🚀 Infinite Scalability"
                description="Same architecture works for a 5-person startup or 50,000-person enterprise. No rebuilding, no migrations, no limits. Just growth."
                highlight="Tested to 1M+ transactions/day"
                accent="blue"
              />
            </div>
          </div>
        </Slide>

        {/* Slide 5: Market Opportunity */}
        <Slide isActive={currentSlide === 4}>
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-white mb-4">
              📈 The $300B Market Opportunity
            </h1>
            <p className="text-xl text-center text-amber-300 mb-8 font-semibold">
              Bottom-Up TAM Analysis
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border-2 border-amber-500 hover:scale-105 transition-all duration-300">
                <div className="text-4xl mb-4">🏢</div>
                <h3 className="text-xl font-bold text-amber-400 mb-2">SMB Market</h3>
                <div className="text-lg font-bold text-amber-300 mb-4">$47B Addressable</div>
                <div className="space-y-2 text-sm text-gray-300">
                  <p><strong className="text-white">Size:</strong> 32M businesses globally</p>
                  <p><strong className="text-white">Pain:</strong> Can't afford enterprise software</p>
                  <p><strong className="text-white">HERA Price:</strong> $299-2,999/month</p>
                  <p><strong className="text-white">Penetration:</strong> 5% = $2.3B ARR</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border-2 border-blue-500 hover:scale-105 transition-all duration-300">
                <div className="text-4xl mb-4">🏭</div>
                <h3 className="text-xl font-bold text-blue-400 mb-2">Mid-Market</h3>
                <div className="text-lg font-bold text-blue-300 mb-4">$120B Addressable</div>
                <div className="space-y-2 text-sm text-gray-300">
                  <p><strong className="text-white">Size:</strong> 200K companies</p>
                  <p><strong className="text-white">Pain:</strong> Outgrowing point solutions</p>
                  <p><strong className="text-white">HERA Price:</strong> $5K-50K/month</p>
                  <p><strong className="text-white">Penetration:</strong> 2% = $2.4B ARR</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border-2 border-purple-500 hover:scale-105 transition-all duration-300">
                <div className="text-4xl mb-4">🏛️</div>
                <h3 className="text-xl font-bold text-purple-400 mb-2">Enterprise</h3>
                <div className="text-lg font-bold text-purple-300 mb-4">$133B Addressable</div>
                <div className="space-y-2 text-sm text-gray-300">
                  <p><strong className="text-white">Size:</strong> 10K companies</p>
                  <p><strong className="text-white">Pain:</strong> Digital transformation failing</p>
                  <p><strong className="text-white">HERA Price:</strong> $100K+/month</p>
                  <p><strong className="text-white">Penetration:</strong> 0.5% = $800M ARR</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-2xl p-6 border border-amber-500/30 text-center">
              <p className="text-2xl font-bold text-white mb-2">Total Realistic Opportunity: $5.5B ARR</p>
              <p className="text-lg text-amber-300">Less than 2% market penetration needed</p>
            </div>
          </div>
        </Slide>

        {/* Slide 6: Traction & Metrics */}
        <Slide isActive={currentSlide === 5}>
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-white mb-4">
              📊 Early Traction Proves Product-Market Fit
            </h1>
            <p className="text-xl text-center text-amber-300 mb-8 font-semibold">
              Real Customers, Real Revenue, Real Growth
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <MetricCard
                icon={<Users className="h-6 w-6 text-amber-400" />}
                title="Beta Customers"
                value="127"
                subtitle="22% MoM growth"
                accent="amber"
              />
              <MetricCard
                icon={<TrendingUp className="h-6 w-6 text-emerald-400" />}
                title="Monthly ARR"
                value="$97K"
                subtitle="28% MoM growth"
                accent="emerald"
              />
              <MetricCard
                icon={<Clock className="h-6 w-6 text-blue-400" />}
                title="Time to Value"
                value="47 min"
                subtitle="First transaction live"
                accent="blue"
              />
              <MetricCard
                icon={<Trophy className="h-6 w-6 text-purple-400" />}
                title="Net Retention"
                value="127%"
                subtitle="Growing accounts"
                accent="purple"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-emerald-400 mb-4">🚀 YC Growth Metrics</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Monthly Growth Rate</span>
                    <span className="text-emerald-400 font-bold">28%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Customer Acquisition Cost</span>
                    <span className="text-white font-bold">$487</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Net Revenue Retention</span>
                    <span className="text-emerald-400 font-bold">127%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">LTV:CAC Ratio</span>
                    <span className="text-emerald-400 font-bold">18.9:1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payback Period</span>
                    <span className="text-white font-bold">5.3 months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Gross Margin</span>
                    <span className="text-white font-bold">87%</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-blue-400 mb-4">💬 Customer Love</h3>
                <div className="space-y-3">
                  <p className="text-sm text-gray-300 italic">"Replaced 7 different systems with HERA. Saved $8K/month."</p>
                  <p className="text-xs text-gray-500">- Restaurant Chain (47 locations)</p>
                  
                  <p className="text-sm text-gray-300 italic">"First software our staff actually wants to use."</p>
                  <p className="text-xs text-gray-500">- Healthcare Clinic</p>
                  
                  <p className="text-sm text-gray-300 italic">"Like having a $2M ERP for $299/month."</p>
                  <p className="text-xs text-gray-500">- Manufacturing SMB</p>
                </div>
              </div>
            </div>
          </div>
        </Slide>

        {/* Slide 7: Go-to-Market Strategy */}
        <Slide isActive={currentSlide === 6}>
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-white mb-8">
              🎯 Go-to-Market: The Unfair Distribution Advantage
            </h1>
            <p className="text-xl text-center text-purple-300 mb-8 font-semibold">
              How We Acquire Customers at 10x Lower Cost
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureBox
                icon={<Users className="h-8 w-8 md:h-10 md:w-10 text-purple-400" />}
                title="🤝 Channel Partner Network"
                description="650,000 accounting firms become our sales force. They recommend HERA to millions of SMB clients. We share 30% revenue - they do the selling."
                highlight="$0 direct sales cost"
                accent="purple"
              />
              <FeatureBox
                icon={<Zap className="h-8 w-8 md:h-10 md:w-10 text-purple-400" />}
                title="⚡ Product-Led Growth"
                description="Self-service onboarding in 47 minutes. No demos, no sales calls. Customers deploy themselves and upgrade based on usage."
                highlight="$487 CAC vs $15K industry"
                accent="purple"
              />
              <FeatureBox
                icon={<Brain className="h-8 w-8 md:h-10 md:w-10 text-purple-400" />}
                title="🎪 Template Marketplace"
                description="Industry experts create and sell templates. They market to their audience, we handle fulfillment. Win-win-win ecosystem."
                highlight="1,000+ templates by Year 2"
                accent="purple"
              />
              <FeatureBox
                icon={<Globe className="h-8 w-8 md:h-10 md:w-10 text-amber-400" />}
                title="🌍 Viral Expansion"
                description="Each customer invites suppliers, customers, partners. Network effects drive organic growth. Zero marketing spend required."
                highlight="2.7 new users per customer"
              />
              <FeatureBox
                icon={<Trophy className="h-8 w-8 md:h-10 md:w-10 text-amber-400" />}
                title="🏆 Land & Expand"
                description="Start with one department, expand to entire organization. Net revenue retention 147% - customers naturally grow usage."
                highlight="10x account growth in Year 1"
              />
              <FeatureBox
                icon={<Shield className="h-8 w-8 md:h-10 md:w-10 text-amber-400" />}
                title="🛡️ Enterprise Beachhead"
                description="Free pilot for innovation labs. Once one division succeeds, rapid internal expansion. Target: 50 Fortune 1000 pilots in Year 1."
                highlight="$1M+ ACV enterprise deals"
              />
            </div>
          </div>
        </Slide>

        {/* Slide 8: Business Model */}
        <Slide isActive={currentSlide === 7}>
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-white mb-8">
              💎 The Business Model: Built for Hypergrowth
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Pricing Tiers */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-amber-500/30">
                <h3 className="text-xl font-bold text-amber-400 mb-4">💰 Simple, Scalable Pricing</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Starter (1-10 users)</span>
                    <span className="text-white font-bold">$299/month</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Growth (11-50 users)</span>
                    <span className="text-white font-bold">$999/month</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Scale (51-200 users)</span>
                    <span className="text-white font-bold">$2,999/month</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Enterprise (200+ users)</span>
                    <span className="text-white font-bold">Custom pricing</span>
                  </div>
                </div>
              </div>

              {/* Revenue Streams */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-emerald-500/30">
                <h3 className="text-xl font-bold text-emerald-400 mb-4">💎 Multiple Revenue Streams</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">SaaS Subscriptions</span>
                    <span className="text-white font-bold">70%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Partner Revenue Share</span>
                    <span className="text-white font-bold">15%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Template Marketplace</span>
                    <span className="text-white font-bold">10%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Enterprise Services</span>
                    <span className="text-white font-bold">5%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Unit Economics */}
            <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-2xl p-6 border border-amber-500/30">
              <h3 className="text-xl font-bold text-center text-amber-400 mb-4">🚀 World-Class Unit Economics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">$487</div>
                  <div className="text-sm text-gray-400">CAC</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">$9,200</div>
                  <div className="text-sm text-gray-400">ACV</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">147%</div>
                  <div className="text-sm text-gray-400">Net Retention</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">87%</div>
                  <div className="text-sm text-gray-400">Gross Margin</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-emerald-300 font-bold">LTV:CAC Ratio = 19:1</p>
                <p className="text-sm text-gray-400">Industry average: 3:1</p>
              </div>
            </div>
          </div>
        </Slide>

        {/* Slide 9: Competitive Moat */}
        <Slide isActive={currentSlide === 8}>
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-white mb-8">
              🏰 The Competitive Moat: Why We Win
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Technical Moat */}
              <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-3xl p-6 border border-purple-500/30">
                <h2 className="text-xl md:text-2xl font-bold text-purple-400 mb-4">🔧 Technical Advantages</h2>
                <div className="space-y-3 text-gray-300">
                  <p>✅ <strong>10-year R&D head start</strong> on universal architecture</p>
                  <p>✅ <strong>Patent-pending</strong> 5-table database design</p>
                  <p>✅ <strong>AI trained on 127 businesses</strong> across industries</p>
                  <p>✅ <strong>Zero technical debt</strong> - built modern from day one</p>
                </div>
              </div>

              {/* Network Effects */}
              <div className="bg-gradient-to-br from-emerald-600/20 to-green-600/20 rounded-3xl p-6 border border-emerald-500/30">
                <h2 className="text-xl md:text-2xl font-bold text-emerald-400 mb-4">🌐 Network Effects</h2>
                <div className="space-y-3 text-gray-300">
                  <p>📈 <strong>Each customer</strong> improves AI for all others</p>
                  <p>📈 <strong>Each template</strong> attracts more template creators</p>
                  <p>📈 <strong>Each partner</strong> brings their entire client base</p>
                  <p>📈 <strong>Each integration</strong> locks in more enterprises</p>
                </div>
              </div>
            </div>

            {/* Competitive Comparison */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-amber-400 mb-4 text-center">⚔️ Competitive Reality Check</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <h4 className="font-bold text-red-400 mb-2">Salesforce/SAP</h4>
                  <p className="text-sm text-gray-300">Legacy architecture, $2M implementations, can't adapt quickly</p>
                </div>
                <div className="text-center">
                  <h4 className="font-bold text-yellow-400 mb-2">Vertical SaaS</h4>
                  <p className="text-sm text-gray-300">Limited to one industry, can't expand horizontally</p>
                </div>
                <div className="text-center">
                  <h4 className="font-bold text-emerald-400 mb-2">HERA</h4>
                  <p className="text-sm text-gray-300">Universal platform, instant deployment, infinite expansion</p>
                </div>
              </div>
            </div>
          </div>
        </Slide>

        {/* Slide 10: The Investment Opportunity */}
        <Slide isActive={currentSlide === 9}>
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-white mb-8">
              💎 The Investment Opportunity
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <MetricCard
                icon={<DollarSign className="h-6 w-6 text-amber-400" />}
                title="Seed Round"
                value="$5M"
                subtitle="on $20M valuation"
                accent="amber"
              />
              <MetricCard
                icon={<TrendingUp className="h-6 w-6 text-emerald-400" />}
                title="18-Month Milestone"
                value="$10M ARR"
                subtitle="1,000+ customers"
                accent="emerald"
              />
              <MetricCard
                icon={<Trophy className="h-6 w-6 text-purple-400" />}
                title="Series A Target"
                value="$300M"
                subtitle="Valuation in 18 months"
                accent="purple"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureBox
                icon={<Rocket className="h-8 w-8 md:h-10 md:w-10 text-amber-400" />}
                title="Product & Engineering (40%)"
                description="$2M - Scale engineering team, AI development, enterprise features, mobile apps"
                highlight="10 engineers"
              />
              <FeatureBox
                icon={<Users className="h-8 w-8 md:h-10 md:w-10 text-blue-400" />}
                title="Go-to-Market (40%)"
                description="$2M - Channel partnerships, content marketing, customer success, growth experiments"
                highlight="Zero direct sales"
                accent="blue"
              />
              <FeatureBox
                icon={<Globe className="h-8 w-8 md:h-10 md:w-10 text-emerald-400" />}
                title="Operations (20%)"
                description="$1M - Infrastructure, compliance, finance, legal, working capital"
                highlight="Lean operation"
                accent="emerald"
              />
            </div>
            
            <div className="mt-6 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-2xl p-6 border border-amber-500/30 text-center">
              <p className="text-lg text-white">Why $5M is enough: Product-market fit proven, unit economics validated, distribution model working</p>
              <p className="text-xl font-bold text-amber-300 mt-2">Capital efficiency is our superpower</p>
            </div>
          </div>
        </Slide>

        {/* Slide 11: Why Now */}
        <Slide isActive={currentSlide === 10}>
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-white mb-8">
              ⚡ Why This Moment is Perfect
            </h1>
            <p className="text-xl text-center text-amber-300 mb-8 font-semibold">
              Technology, Market, and Timing Converge
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gradient-to-br from-emerald-600/20 to-green-600/20 rounded-2xl p-6 border border-emerald-500/30">
                <h3 className="text-xl font-bold text-emerald-400 mb-4">🚀 Market Tailwinds</h3>
                <div className="space-y-3 text-gray-300">
                  <p>• <strong>AI Winter Over:</strong> Businesses finally trust AI for core operations</p>
                  <p>• <strong>Remote Work:</strong> Cloud-first mindset accelerated by 5 years</p>
                  <p>• <strong>SMB Growth:</strong> Record number of new businesses starting (34M in US)</p>
                  <p>• <strong>Legacy Pain:</strong> $3T wasted annually on failed digital transformation</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/20 rounded-2xl p-6 border border-blue-500/30">
                <h3 className="text-xl font-bold text-blue-400 mb-4">🔧 Technology Ready</h3>
                <div className="space-y-3 text-gray-300">
                  <p>• <strong>AI Models:</strong> GPT-4 makes natural language interfaces practical</p>
                  <p>• <strong>Cloud Scale:</strong> AWS/Vercel can handle enterprise workloads cheaply</p>
                  <p>• <strong>Mobile First:</strong> iPhone generation expects software to "just work"</p>
                  <p>• <strong>API Economy:</strong> Everything integrates with everything</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-2xl p-6 border border-amber-500/30 text-center">
              <h3 className="text-xl font-bold text-amber-400 mb-4">⏰ The Window: 18-24 Months</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-white font-bold">Microsoft/Google Response</p>
                  <p className="text-gray-300">18+ months to build universal platform</p>
                </div>
                <div>
                  <p className="text-white font-bold">Enterprise Budget Cycles</p>
                  <p className="text-gray-300">2025-2026 = peak software replacement</p>
                </div>
                <div>
                  <p className="text-white font-bold">First-Mover Advantage</p>
                  <p className="text-gray-300">Lock in partners before competitors realize</p>
                </div>
              </div>
            </div>
          </div>
        </Slide>

        {/* Slide 12: The Team */}
        <Slide isActive={currentSlide === 11}>
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
                  • Enterprise architect with universal platform expertise<br/>
                  • Proven track record scaling complex systems<br/>
                  • Industry connections in Fortune 1000<br/>
                  • Strategic guidance on technical roadmap
                </div>
                <div className="bg-amber-500/20 rounded-lg p-2 sm:p-3 text-xs sm:text-sm font-semibold text-amber-400">
                  Strategic Equity Partner • 4-Year Vesting
                </div>
              </div>
              
              {/* Business Development Advisor */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-blue-500/30 rounded-2xl p-4 sm:p-6 text-center transform hover:scale-105 transition-all duration-300">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-500/20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl sm:text-3xl text-blue-400">
                  🤝
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Business Development Advisor</h3>
                <p className="text-sm sm:text-base text-blue-400 mb-3">Channel & Partnership Expert</p>
                <div className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-4">
                  • Deep relationships with accounting firms<br/>
                  • Enterprise sales and channel expertise<br/>
                  • Market expansion and partnership development<br/>
                  • Revenue acceleration and go-to-market strategy
                </div>
                <div className="bg-blue-500/20 rounded-lg p-2 sm:p-3 text-xs sm:text-sm font-semibold text-blue-400">
                  Revenue Growth Partner • Performance Equity
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
                    <strong className="text-white">Faster Decisions:</strong> No bureaucratic overhead, immediate strategic execution
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                  <div className="text-xs sm:text-sm text-gray-300">
                    <strong className="text-white">Capital Efficient:</strong> Maximum focus on revenue growth, minimal overhead costs
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                  <div className="text-xs sm:text-sm text-gray-300">
                    <strong className="text-white">Proven Expertise:</strong> Each advisor brings 20+ years of domain-specific experience
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

        {/* Slide 13: The Close */}
        <Slide isActive={currentSlide === 12}>
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-white mb-6">
              🏆 The Opportunity
            </h1>
            
            <div className="text-center mb-8">
              <p className="text-xl md:text-2xl text-gray-300 mb-4">
                This is the moment when software and private equity converge.
              </p>
              <p className="text-xl md:text-2xl text-gray-300 mb-4">
                HERA isn't just building a business - we're creating a new category that will define the next decade of enterprise value creation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-2xl p-6 border border-emerald-500/30 text-center">
                <h3 className="text-xl font-bold text-emerald-400 mb-2">Join Us</h3>
                <p className="text-gray-300">Own equity in the $8.8B empire disruption</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl p-6 border border-yellow-500/30 text-center">
                <h3 className="text-xl font-bold text-yellow-400 mb-2">Wait and See</h3>
                <p className="text-gray-300">Pay 5x more in Series B (if you're invited)</p>
              </div>
              <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-2xl p-6 border border-red-500/30 text-center">
                <h3 className="text-xl font-bold text-red-400 mb-2">Pass</h3>
                <p className="text-gray-300">Watch your portfolio companies get disrupted by ours</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-600/10 to-yellow-600/10 rounded-2xl p-8 border border-amber-500/30 text-center">
              <p className="text-xl md:text-2xl text-white font-bold mb-4">
                The question isn't whether this model will work.
              </p>
              <p className="text-xl md:text-2xl text-amber-300 font-bold">
                The question is who will execute it first.
              </p>
            </div>
          </div>
        </Slide>
      </div>
    </div>
  )
}