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
  
  const correctPassword = "empire@hera@2024"
  const totalSlides = 12

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
              The Software Empire That Ate Private Equity
            </h2>
            <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-2xl p-6 border border-amber-500/30 max-w-4xl mx-auto">
              <p className="text-xl md:text-2xl text-amber-300 font-semibold">
                From One Universal Platform to Six $100M+ Business Units
              </p>
            </div>
          </div>
        </Slide>

        {/* Slide 2: The Andy Raskin Strategic Narrative */}
        <Slide isActive={currentSlide === 1}>
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-white mb-8">
              🎯 The Strategic Narrative
            </h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Old World */}
              <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 rounded-3xl p-8 border border-red-500/30">
                <h2 className="text-2xl md:text-3xl font-bold text-red-400 mb-6">❌ The Old World</h2>
                <h3 className="text-xl font-bold text-white mb-4">Private Equity's Software Problem</h3>
                <div className="space-y-4 text-gray-300">
                  <p><strong>Option A:</strong> Buy expensive, mature SaaS companies at 10x+ revenue multiples</p>
                  <p><strong>Option B:</strong> Build software from scratch (18-month development, $10M+ investment per vertical)</p>
                  <p><strong>Option C:</strong> Avoid software entirely and miss the biggest wealth creation opportunity</p>
                </div>
                <div className="mt-6 p-4 bg-red-500/20 rounded-xl">
                  <p className="text-red-300 font-semibold">The brutal reality: Traditional PE can't compete with software economics</p>
                </div>
              </div>

              {/* New World */}
              <div className="bg-gradient-to-br from-emerald-600/20 to-green-600/20 rounded-3xl p-8 border border-emerald-500/30">
                <h2 className="text-2xl md:text-3xl font-bold text-emerald-400 mb-6">✅ The New World</h2>
                <h3 className="text-xl font-bold text-white mb-4">HERA's Universal PE Model</h3>
                <div className="space-y-4 text-gray-300">
                  <p><strong>Same Technology Platform:</strong> One universal 5-table architecture powers every vertical</p>
                  <p><strong>Dedicated CEOs:</strong> Industry veterans lead each vertical as separate business units</p>
                  <p><strong>Channel Partners:</strong> Professional service providers become your sales force</p>
                  <p><strong>24-Hour Deployment:</strong> Enter any new market in one day, not one year</p>
                </div>
                <div className="mt-6 p-4 bg-emerald-500/20 rounded-xl">
                  <p className="text-emerald-300 font-semibold">The breakthrough: HERA combines the best of both worlds</p>
                </div>
              </div>
            </div>
          </div>
        </Slide>

        {/* Slide 3: The Problem HERA Solves */}
        <Slide isActive={currentSlide === 2}>
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-white mb-8">
              💥 The Problem HERA Solves
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <FeatureBox
                icon={<Factory className="h-8 w-8 md:h-10 md:w-10 text-red-400" />}
                title="🏭 Enterprise Software is Broken"
                description="18-month implementations, $2M+ costs, 200+ rigid database tables that break when business changes. SMBs can't afford it, enterprises hate using it."
                accent="red"
              />
              <FeatureBox
                icon={<DollarSign className="h-8 w-8 md:h-10 md:w-10 text-red-400" />}
                title="💰 PE Can't Scale Software"
                description="Traditional PE model requires separate teams, separate technology, separate everything for each vertical. No economies of scale, massive capital requirements."
                accent="red"
              />
              <FeatureBox
                icon={<BarChart3 className="h-8 w-8 md:h-10 md:w-10 text-red-400" />}
                title="🤖 SaaS Companies Hit Revenue Walls"
                description="Single-vertical SaaS companies max out at $100M ARR. They can't expand horizontally without rebuilding everything from scratch."
                accent="red"
              />
              <FeatureBox
                icon={<Zap className="h-8 w-8 md:h-10 md:w-10 text-red-400" />}
                title="⚡ Speed-to-Market is Everything"
                description="By the time traditional software is built, the market opportunity has moved on. Winners deploy in days, not years."
                accent="red"
              />
            </div>

            <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-2xl p-6 border border-amber-500/30 text-center">
              <p className="text-xl md:text-2xl text-amber-300 font-semibold italic">
                "The future belongs to platforms that can instantly adapt to any business model while maintaining the depth of industry-specific solutions."
              </p>
            </div>
          </div>
        </Slide>

        {/* Slide 4: HERA's Unfair Advantage */}
        <Slide isActive={currentSlide === 3}>
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-white mb-8">
              🚀 HERA's Unfair Advantage
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FeatureBox
                icon={<Wrench className="h-8 w-8 md:h-10 md:w-10 text-amber-400" />}
                title="🔧 Universal Architecture Breakthrough"
                description="5 core tables handle ANY business scenario. Restaurant POS, hospital management, manufacturing ERP - same technology foundation. This has never been achieved before."
                highlight="Never achieved before"
              />
              <FeatureBox
                icon={<Zap className="h-8 w-8 md:h-10 md:w-10 text-amber-400" />}
                title="⚡ 24-Hour Market Entry"
                description="New vertical? Deploy complete industry solution in one day. Traditional competitors need 18 months and $10M investment. We need 24 hours and $0 additional development."
                highlight="24 hours vs 18 months"
              />
              <FeatureBox
                icon={<Brain className="h-8 w-8 md:h-10 md:w-10 text-amber-400" />}
                title="🤖 AI Learning Across Verticals"
                description="Restaurant insights improve healthcare operations. Manufacturing efficiencies enhance education platforms. Every customer makes every vertical smarter."
                highlight="Cross-vertical intelligence"
              />
              <FeatureBox
                icon={<Users className="h-8 w-8 md:h-10 md:w-10 text-amber-400" />}
                title="👥 Channel Partner Army"
                description="Accountants, consultants, and industry experts become our sales force. They sell, we fulfill. Infinite distribution without direct sales costs."
                highlight="Infinite distribution"
              />
            </div>
          </div>
        </Slide>

        {/* Slide 5: The Empire - Six Business Units */}
        <Slide isActive={currentSlide === 4}>
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-white mb-4">
              🏗️ The Empire: Six $100M+ Business Units
            </h1>
            <p className="text-xl text-center text-amber-300 mb-8 font-semibold">
              Each Vertical = Separate Business with Dedicated Leadership
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <VerticalCard
                icon="🍕"
                title="HERA Restaurant Solutions"
                revenue="$120M ARR Potential"
                ceo="Restaurant industry veteran"
                channel="Accountants serving restaurants"
                edge="Only platform that handles POS + ERP + compliance in one system"
                accent="amber"
              />
              <VerticalCard
                icon="🏥"
                title="HERA Healthcare Platform"
                revenue="$200M ARR Potential"
                ceo="Healthcare admin expert"
                channel="Practice management consultants"
                edge="HIPAA compliance + ERP built-in from day one"
                accent="blue"
              />
              <VerticalCard
                icon="🏭"
                title="HERA Manufacturing Hub"
                revenue="$150M ARR Potential"
                ceo="Manufacturing operations leader"
                channel="Industrial consultants"
                edge="Real-time production + financial integration"
                accent="purple"
              />
              <VerticalCard
                icon="🎓"
                title="HERA Education Solutions"
                revenue="$100M ARR Potential"
                ceo="EdTech veteran"
                channel="Educational consultants"
                edge="Student info system + financial management unified"
                accent="emerald"
              />
              <VerticalCard
                icon="🏪"
                title="HERA Retail Platform"
                revenue="$130M ARR Potential"
                ceo="Omnichannel retail expert"
                channel="Retail consultants"
                edge="Online + offline + inventory + finance in one platform"
                accent="red"
              />
              <VerticalCard
                icon="💼"
                title="HERA Pure ERP"
                revenue="$180M ARR Potential"
                ceo="Enterprise ERP veteran"
                channel="Accounting firms direct"
                edge="Works for ANY industry - ultimate flexibility"
                accent="amber"
              />
            </div>
          </div>
        </Slide>

        {/* Slide 6: The Economics */}
        <Slide isActive={currentSlide === 5}>
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-white mb-4">
              💰 The Economics Are Staggering
            </h1>
            <p className="text-xl text-center text-amber-300 mb-8 font-semibold">
              Private Equity Returns at Software Multiples
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <MetricCard
                icon={<DollarSign className="h-6 w-6 text-amber-400" />}
                title="Total ARR Potential"
                value="$880M"
                subtitle="6 Verticals Combined"
                accent="amber"
              />
              <MetricCard
                icon={<TrendingUp className="h-6 w-6 text-emerald-400" />}
                title="Gross Margin"
                value="85%"
                subtitle="Software Economics"
                accent="emerald"
              />
              <MetricCard
                icon={<Target className="h-6 w-6 text-blue-400" />}
                title="Revenue Multiple"
                value="10x"
                subtitle="at Exit"
                accent="blue"
              />
              <MetricCard
                icon={<Trophy className="h-6 w-6 text-purple-400" />}
                title="Portfolio Valuation"
                value="$8.8B"
                subtitle="at Maturity"
                accent="purple"
              />
            </div>

            <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-2xl p-8 border border-amber-500/30 text-center">
              <p className="text-lg md:text-xl text-white mb-2">
                <strong>Traditional PE:</strong> Buy one business for $100M, sell for $300M in 5 years.
              </p>
              <p className="text-lg md:text-xl text-amber-300 font-bold">
                <strong>HERA PE:</strong> Build six businesses for $10M total, sell portfolio for $8.8B in 5 years.
              </p>
            </div>
          </div>
        </Slide>

        {/* Slide 7: The Unbreachable Moat */}
        <Slide isActive={currentSlide === 6}>
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-white mb-8">
              🛡️ The Unbreachable Moat
            </h1>
            <p className="text-xl text-center text-purple-300 mb-8 font-semibold">
              Why HERA Can't Be Copied
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureBox
                icon={<Wrench className="h-8 w-8 md:h-10 md:w-10 text-purple-400" />}
                title="🔧 Universal Architecture"
                description="10+ years of R&D created the only truly universal business platform. Can't be reverse-engineered or rebuilt quickly."
                accent="purple"
              />
              <FeatureBox
                icon={<TrendingUp className="h-8 w-8 md:h-10 md:w-10 text-purple-400" />}
                title="📈 Network Effects"
                description="Each new customer improves AI for all verticals. Each new vertical makes platform more valuable to existing customers."
                accent="purple"
              />
              <FeatureBox
                icon={<Users className="h-8 w-8 md:h-10 md:w-10 text-purple-400" />}
                title="👥 Channel Lock-in"
                description="Professional service providers become financially dependent on HERA success. They actively block competitors."
                accent="purple"
              />
              <FeatureBox
                icon={<Zap className="h-8 w-8 md:h-10 md:w-10 text-purple-400" />}
                title="⚡ Speed Advantage"
                description="By the time competitors understand the model, HERA will dominate 6+ verticals. First-mover advantage compounds exponentially."
                accent="purple"
              />
              <FeatureBox
                icon={<DollarSign className="h-8 w-8 md:h-10 md:w-10 text-purple-400" />}
                title="💰 Capital Efficiency"
                description="Competitors need $60M+ to build 6 separate platforms. HERA needs $10M total. Economics make competition impossible."
                accent="purple"
              />
              <FeatureBox
                icon={<Brain className="h-8 w-8 md:h-10 md:w-10 text-purple-400" />}
                title="🤖 AI Data Advantage"
                description="Cross-industry AI learning creates insurmountable intelligence gap. More data = better product = more customers = more data."
                accent="purple"
              />
            </div>
          </div>
        </Slide>

        {/* Slide 8: The 5-Year Empire Timeline */}
        <Slide isActive={currentSlide === 7}>
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-white mb-8">
              🗓️ The 5-Year Empire Timeline
            </h1>
            
            <div className="space-y-6">
              <div className="flex items-center bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl p-6 border border-amber-500/30">
                <div className="text-2xl font-bold text-amber-400 min-w-[120px]">Aug 2025</div>
                <div className="ml-6">
                  <h3 className="text-xl font-bold text-white mb-2">🚀 Quadruple Launch</h3>
                  <p className="text-gray-300">Restaurant + Education + Pure ERP + Practice Management go live simultaneously. Prove the multi-vertical model works.</p>
                </div>
              </div>

              <div className="flex items-center bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl p-6 border border-amber-500/30">
                <div className="text-2xl font-bold text-amber-400 min-w-[120px]">Q4 2025</div>
                <div className="ml-6">
                  <h3 className="text-xl font-bold text-white mb-2">📈 Channel Acceleration</h3>
                  <p className="text-gray-300">Scale accountant partnerships for 3 verticals + direct sales to 650,000 accounting firms for practice management. First $10M ARR.</p>
                </div>
              </div>

              <div className="flex items-center bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl p-6 border border-amber-500/30">
                <div className="text-2xl font-bold text-amber-400 min-w-[120px]">2026</div>
                <div className="ml-6">
                  <h3 className="text-xl font-bold text-white mb-2">💰 Market Validation: $100M ARR</h3>
                  <p className="text-gray-300">Prove the PE model works across multiple verticals. Practice Management ($40M), Pure ERP ($30M), Restaurant ($20M), Education ($10M).</p>
                </div>
              </div>

              <div className="flex items-center bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl p-6 border border-amber-500/30">
                <div className="text-2xl font-bold text-amber-400 min-w-[120px]">2027</div>
                <div className="ml-6">
                  <h3 className="text-xl font-bold text-white mb-2">🏭 Vertical Expansion</h3>
                  <p className="text-gray-300">Add Healthcare + Manufacturing + Retail using proven playbook. Total: $300M ARR across 7 business units.</p>
                </div>
              </div>

              <div className="flex items-center bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl p-6 border border-amber-500/30">
                <div className="text-2xl font-bold text-amber-400 min-w-[120px]">2028</div>
                <div className="ml-6">
                  <h3 className="text-xl font-bold text-white mb-2">👑 Market Domination</h3>
                  <p className="text-gray-300">$600M ARR across portfolio. Each vertical hits market leadership. Strategic exit opportunities at 10x+ multiples.</p>
                </div>
              </div>

              <div className="flex items-center bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl p-6 border border-amber-500/30">
                <div className="text-2xl font-bold text-amber-400 min-w-[120px]">2029</div>
                <div className="ml-6">
                  <h3 className="text-xl font-bold text-white mb-2">🎯 Portfolio Exit</h3>
                  <p className="text-gray-300">$880M ARR portfolio valued at $8.8B+. Individual verticals can be sold separately or portfolio as a whole to maximize returns.</p>
                </div>
              </div>
            </div>
          </div>
        </Slide>

        {/* Slide 9: Why This Changes Everything */}
        <Slide isActive={currentSlide === 8}>
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-white mb-8">
              🎯 Why This Changes Everything
            </h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Strategic Shift */}
              <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 rounded-3xl p-8 border border-red-500/30">
                <h2 className="text-2xl md:text-3xl font-bold text-red-400 mb-6">The Strategic Shift</h2>
                <div className="space-y-4 text-gray-300">
                  <p><span className="bg-amber-500/20 px-2 py-1 rounded text-amber-300 font-bold">This isn't just a software company</span> - it's a new category of private equity that uses technology as its unfair advantage.</p>
                  <p><span className="bg-amber-500/20 px-2 py-1 rounded text-amber-300 font-bold">This isn't just a PE firm</span> - it's a software empire that uses business development expertise to achieve impossible scale.</p>
                  <p><span className="bg-amber-500/20 px-2 py-1 rounded text-amber-300 font-bold">The winners in the next decade</span> won't be traditional software companies OR traditional PE firms. They'll be hybrid models like HERA.</p>
                </div>
              </div>

              {/* Competitive Landscape */}
              <div className="bg-gradient-to-br from-emerald-600/20 to-green-600/20 rounded-3xl p-8 border border-emerald-500/30">
                <h2 className="text-2xl md:text-3xl font-bold text-emerald-400 mb-6">The Competitive Landscape Shift</h2>
                <div className="space-y-4 text-gray-300">
                  <p><strong>Traditional Software Companies:</strong> Single vertical, slow growth, limited addressable market</p>
                  <p><strong>Traditional PE Firms:</strong> High acquisition costs, limited software expertise, can't build from scratch</p>
                  <p><strong>HERA Model:</strong> Multiple verticals, exponential growth, unlimited addressable market</p>
                </div>
                <div className="mt-6 p-4 bg-emerald-500/20 rounded-xl">
                  <p className="text-emerald-300 font-semibold">By 2030, every major PE firm will try to copy this model. But HERA will have a 5-year head start and unbreachable network effects.</p>
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
                title="Series A Ask"
                value="$15M"
                subtitle="Empire Building"
                accent="amber"
              />
              <MetricCard
                icon={<TrendingUp className="h-6 w-6 text-emerald-400" />}
                title="18-Month Target"
                value="$100M"
                subtitle="ARR Across Portfolio"
                accent="emerald"
              />
              <MetricCard
                icon={<Trophy className="h-6 w-6 text-purple-400" />}
                title="Exit Valuation"
                value="$8.8B"
                subtitle="5-Year Potential"
                accent="purple"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureBox
                icon={<Rocket className="h-8 w-8 md:h-10 md:w-10 text-amber-400" />}
                title="Sales & Marketing (60%)"
                description="$9M - Dominate SMB across all verticals, attack enterprise with dedicated sales teams"
                highlight="$9M Investment"
              />
              <FeatureBox
                icon={<Brain className="h-8 w-8 md:h-10 md:w-10 text-blue-400" />}
                title="Product Development (25%)"
                description="$3.75M - AI advancement, template marketplace, cross-vertical intelligence"
                highlight="$3.75M Investment"
                accent="blue"
              />
              <FeatureBox
                icon={<Globe className="h-8 w-8 md:h-10 md:w-10 text-emerald-400" />}
                title="Operations (15%)"
                description="$2.25M - Scale infrastructure, international expansion, dedicated CEOs"
                highlight="$2.25M Investment"
                accent="emerald"
              />
            </div>
          </div>
        </Slide>

        {/* Slide 11: Why Now */}
        <Slide isActive={currentSlide === 10}>
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-white mb-8">
              ⚡ The Window is Closing
            </h1>
            <p className="text-xl text-center text-red-300 mb-8 font-semibold">
              18 Months to Category Lock-Up
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <MetricCard
                icon={<TrendingUp className="h-6 w-6 text-red-400" />}
                title="SMB Market"
                value="340%"
                subtitle="Faster adoption than expected"
                accent="red"
              />
              <MetricCard
                icon={<Building2 className="h-6 w-6 text-red-400" />}
                title="Enterprise Pilots"
                value="Q1 2025"
                subtitle="Starting soon"
                accent="red"
              />
              <MetricCard
                icon={<Clock className="h-6 w-6 text-red-400" />}
                title="Microsoft Response"
                value="18 mo"
                subtitle="Too late"
                accent="red"
              />
              <MetricCard
                icon={<AlertTriangle className="h-6 w-6 text-red-400" />}
                title="Decision Deadline"
                value="14 days"
                subtitle="Time is running out"
                accent="red"
              />
            </div>

            <div className="bg-gradient-to-r from-red-600/20 to-red-800/20 rounded-2xl p-8 border border-red-500/30 text-center">
              <p className="text-xl md:text-2xl text-red-300 font-bold">
                THE CHOICE: Join the disruption or watch from the sidelines as we redefine enterprise software forever.
              </p>
            </div>
          </div>
        </Slide>

        {/* Slide 12: The Close */}
        <Slide isActive={currentSlide === 11}>
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