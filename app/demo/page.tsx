'use client'

import React, { useState, useEffect } from 'react'
import { Play, ArrowRight, TrendingUp, Clock, DollarSign, Users, CheckCircle, Smartphone, Brain, Zap, Globe, Building2, Calculator, Award, Star, BarChart3 } from 'lucide-react'

interface DemoStep {
  id: string
  title: string
  subtitle: string
  component: React.ComponentType
}

const InvestorDemo = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const nextStep = () => {
    if (currentStep < demoSteps.length - 1) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentStep(currentStep + 1)
        setIsAnimating(false)
      }, 300)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentStep(currentStep - 1)
        setIsAnimating(false)
      }, 300)
    }
  }

  // Act 1: The Old World - Mario's Restaurant Before HERA
  const OldWorldDemo = () => {
    const [currentPain, setCurrentPain] = useState(0)
    const painPoints = [
      { time: "7:00 AM", task: "Check inventory spreadsheet", system: "Excel", status: "manual", cost: "$200/mo" },
      { time: "7:30 AM", task: "Update POS system manually", system: "Square", status: "disconnected", cost: "$160/mo" },
      { time: "8:00 AM", task: "Email payroll data to accountant", system: "QuickBooks", status: "manual", cost: "$180/mo" },
      { time: "9:00 AM", task: "Call suppliers to place orders", system: "Phone/Email", status: "manual", cost: "$300/mo" },
      { time: "10:00 AM", task: "Update reservation system", system: "OpenTable", status: "disconnected", cost: "$200/mo" },
      { time: "11:00 AM", task: "Try to figure out why cash doesn't match", system: "Multiple", status: "panic", cost: "$160/mo" }
    ]

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentPain((prev) => (prev + 1) % painPoints.length)
      }, 2000)
      return () => clearInterval(interval)
    }, [])

    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">🍕 Meet Mario's Daily Nightmare</h2>
          <p className="text-xl text-gray-300">"Like 90% of restaurant owners, he's drowning in software chaos..."</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mario's Photo/Avatar */}
          <div className="bg-gradient-to-br from-red-900/20 to-red-800/20 rounded-3xl p-8 border border-red-500/30 text-center">
            <div className="w-32 h-32 bg-red-500/20 rounded-full mx-auto mb-6 flex items-center justify-center text-6xl">
              👨‍🍳
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Mario Rossi</h3>
            <p className="text-red-300 mb-4">Owner, Mario's Italian Restaurant</p>
            <div className="bg-red-500/20 rounded-xl p-4">
              <p className="text-white font-semibold mb-2">Current Reality:</p>
              <div className="space-y-2 text-sm text-red-200">
                <div>💰 Total Software Cost: $1,200/month</div>
                <div>⏰ Daily Admin Time: 3+ hours</div>
                <div>😵 Work Schedule: 16 hours/day</div>
                <div>📊 Profit Margin: 8% (barely surviving)</div>
              </div>
            </div>
          </div>

          {/* Live Pain Point Cycle */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-8 border border-gray-600/30">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Mario's Daily Software Hell</h3>
            <div className="space-y-4">
              {painPoints.map((pain, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border transition-all duration-500 ${
                    currentPain === index
                      ? 'bg-red-500/20 border-red-500 scale-105'
                      : 'bg-gray-800/30 border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        currentPain === index ? 'bg-red-500' : 'bg-gray-600'
                      }`}></div>
                      <div>
                        <div className="text-sm text-gray-400">{pain.time}</div>
                        <div className={`font-semibold ${
                          currentPain === index ? 'text-white' : 'text-gray-500'
                        }`}>{pain.task}</div>
                        <div className="text-sm text-gray-400">{pain.system}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-red-400 font-semibold">{pain.cost}</div>
                      <div className={`text-xs px-2 py-1 rounded ${
                        pain.status === 'panic' ? 'bg-red-500/30 text-red-300' :
                        pain.status === 'manual' ? 'bg-yellow-500/30 text-yellow-300' :
                        'bg-gray-500/30 text-gray-300'
                      }`}>
                        {pain.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="bg-gradient-to-r from-red-600/20 to-red-800/20 rounded-2xl p-6 border border-red-500/30 max-w-4xl mx-auto">
            <p className="text-xl text-red-300 font-semibold mb-2">THE BRUTAL REALITY:</p>
            <p className="text-white text-lg">Mario works 16-hour days managing disconnected software instead of serving customers and barely breaks even.</p>
          </div>
        </div>
      </div>
    )
  }

  // Act 2: The Transformation - 2-Minute HERA Deployment
  const TransformationDemo = () => {
    const [deploymentStep, setDeploymentStep] = useState(0)
    const [isDeploying, setIsDeploying] = useState(false)
    const [deployedSystems, setDeployedSystems] = useState<string[]>([])

    const deploymentSteps = [
      { speaker: "Accountant", message: "Mario, I want to show you something. Just tell me about your restaurant." },
      { speaker: "Mario", message: "I'm Mario, I run an Italian restaurant in Brooklyn, 50 seats, family recipes, struggling with all these systems..." },
      { speaker: "HERA AI", message: "I understand. You're a traditional Italian restaurant with table service. Let me create your complete business management system..." },
      { speaker: "System", message: "🚀 HERA AI is building your restaurant..." }
    ]

    const systems = [
      { name: "POS System", icon: "💳", description: "Complete POS with Mario's menu", time: 200 },
      { name: "Inventory Management", icon: "📦", description: "Italian suppliers integrated", time: 400 },
      { name: "Staff Scheduling", icon: "👥", description: "Brooklyn labor laws compliant", time: 600 },
      { name: "Financial Reporting", icon: "📊", description: "Restaurant-specific accounts", time: 800 },
      { name: "Customer Management", icon: "🎯", description: "Loyalty programs included", time: 1000 },
      { name: "Kitchen Management", icon: "🍝", description: "Prep time optimization", time: 1200 },
      { name: "Mobile Apps", icon: "📱", description: "Staff, customer, and owner apps", time: 1400 }
    ]

    const startDeployment = () => {
      setIsDeploying(true)
      setDeployedSystems([])
      
      systems.forEach((system, index) => {
        setTimeout(() => {
          setDeployedSystems(prev => [...prev, system.name])
          if (index === systems.length - 1) {
            setTimeout(() => setIsDeploying(false), 500)
          }
        }, system.time)
      })
    }

    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent mb-4">
            ⚡ The 2-Minute Miracle
          </h2>
          <p className="text-xl text-gray-300">"Watch what happens when Mario discovers HERA..."</p>
        </div>

        {/* Conversation Flow */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-8 border border-gray-600/30 mb-8">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">The Conversation</h3>
          <div className="space-y-4 max-w-4xl mx-auto">
            {deploymentSteps.slice(0, deploymentStep + 1).map((step, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl ${
                  step.speaker === 'HERA AI' ? 'bg-amber-500/20 border border-amber-500/50' :
                  step.speaker === 'Mario' ? 'bg-blue-500/20 border border-blue-500/50' :
                  step.speaker === 'System' ? 'bg-emerald-500/20 border border-emerald-500/50' :
                  'bg-gray-700/50 border border-gray-600/50'
                } transform animate-fadeIn`}
              >
                <div className="flex items-start">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    step.speaker === 'HERA AI' ? 'bg-amber-500' :
                    step.speaker === 'Mario' ? 'bg-blue-500' :
                    step.speaker === 'System' ? 'bg-emerald-500' :
                    'bg-gray-500'
                  }`}>
                    {step.speaker === 'HERA AI' ? '🤖' :
                     step.speaker === 'Mario' ? '👨‍🍳' :
                     step.speaker === 'System' ? '⚙️' : '👩‍💼'}
                  </div>
                  <div>
                    <div className="font-semibold text-white mb-1">{step.speaker}:</div>
                    <div className="text-gray-300">{step.message}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {deploymentStep < deploymentSteps.length - 1 && (
            <div className="text-center mt-6">
              <button
                onClick={() => setDeploymentStep(deploymentStep + 1)}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all"
              >
                Continue Conversation
              </button>
            </div>
          )}

          {deploymentStep === deploymentSteps.length - 1 && !isDeploying && deployedSystems.length === 0 && (
            <div className="text-center mt-6">
              <button
                onClick={startDeployment}
                className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-all flex items-center mx-auto"
              >
                <Play className="h-6 w-6 mr-2" />
                Start 2-Minute Deployment
              </button>
            </div>
          )}
        </div>

        {/* Live Deployment Visualization */}
        {(isDeploying || deployedSystems.length > 0) && (
          <div className="bg-gradient-to-br from-emerald-600/20 to-green-600/20 rounded-3xl p-8 border border-emerald-500/30">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              🚀 HERA Building Mario's Restaurant System
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {systems.map((system, index) => (
                <div
                  key={system.name}
                  className={`p-4 rounded-xl border transition-all duration-500 ${
                    deployedSystems.includes(system.name)
                      ? 'bg-emerald-500/20 border-emerald-500 scale-105'
                      : 'bg-gray-800/30 border-gray-700'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-3">{system.icon}</span>
                    <div>
                      <div className={`font-semibold ${
                        deployedSystems.includes(system.name) ? 'text-emerald-300' : 'text-gray-500'
                      }`}>
                        {system.name}
                      </div>
                      <div className="text-sm text-gray-400">{system.description}</div>
                    </div>
                  </div>
                  {deployedSystems.includes(system.name) && (
                    <div className="flex items-center text-emerald-400 text-sm">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Deployed & Ready
                    </div>
                  )}
                </div>
              ))}
            </div>

            {deployedSystems.length === systems.length && (
              <div className="mt-8 text-center">
                <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-2xl p-6 border border-emerald-500/30">
                  <h4 className="text-2xl font-bold text-emerald-400 mb-4">🎉 Deployment Complete!</h4>
                  <p className="text-white text-lg mb-4">Mario's complete restaurant management system is ready!</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-3xl font-bold text-emerald-400">2 min</div>
                      <div className="text-sm text-gray-400">Total setup time</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-emerald-400">$0</div>
                      <div className="text-sm text-gray-400">Implementation cost</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-emerald-400">7</div>
                      <div className="text-sm text-gray-400">Systems integrated</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Act 3: The Results Dashboard
  const ResultsDemo = () => {
    const [selectedMetric, setSelectedMetric] = useState('financial')
    
    const metrics = {
      financial: [
        { label: "Food Costs", before: "28%", after: "22%", improvement: "6% reduction", icon: "🥗" },
        { label: "Labor Costs", before: "35%", after: "29%", improvement: "6% reduction", icon: "👥" },
        { label: "Revenue", before: "$45K/mo", after: "$59K/mo", improvement: "+32% growth", icon: "💰" },
        { label: "Profit Margin", before: "8%", after: "18%", improvement: "10% increase", icon: "📈" }
      ],
      operational: [
        { label: "Order Accuracy", before: "92%", after: "99.5%", improvement: "7.5% better", icon: "✅" },
        { label: "Wait Time", before: "15 min", after: "8 min", improvement: "7 min faster", icon: "⏰" },
        { label: "Food Waste", before: "12%", after: "4%", improvement: "8% reduction", icon: "🗑️" },
        { label: "Staff Turnover", before: "45%", after: "12%", improvement: "33% reduction", icon: "🎯" }
      ],
      lifestyle: [
        { label: "Daily Admin Time", before: "3 hours", after: "20 min", improvement: "2h 40m saved", icon: "📋" },
        { label: "Work Hours", before: "16 hrs/day", after: "12 hrs/day", improvement: "4 hrs less", icon: "🕐" },
        { label: "Stress Level", before: "Always Panic", after: "In Control", improvement: "Peace of mind", icon: "😌" },
        { label: "Family Time", before: "Minimal", after: "Doubled", improvement: "Life balance", icon: "👨‍👩‍👧‍👦" }
      ]
    }

    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">📊 Mario's Transformation: 3 Months Later</h2>
          <p className="text-xl text-gray-300">"The results that speak louder than features"</p>
        </div>

        {/* Metric Categories */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800/50 rounded-2xl p-2 border border-gray-600/30">
            {Object.keys(metrics).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedMetric(category)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all capitalize ${
                  selectedMetric === category
                    ? 'bg-amber-500 text-gray-900'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {category} Impact
              </button>
            ))}
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {metrics[selectedMetric as keyof typeof metrics].map((metric, index) => (
            <div
              key={metric.label}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-600/30 hover:border-amber-500/50 transition-all"
            >
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">{metric.icon}</span>
                <h3 className="text-xl font-bold text-white">{metric.label}</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-red-400 font-semibold mb-1">Before</div>
                  <div className="text-2xl text-white">{metric.before}</div>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <div className="text-emerald-400 font-semibold mb-1">After</div>
                  <div className="text-2xl text-white">{metric.after}</div>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <div className="bg-amber-500/20 rounded-lg p-2 border border-amber-500/30">
                  <span className="text-amber-300 font-semibold">{metric.improvement}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mario's Quote */}
        <div className="bg-gradient-to-br from-emerald-600/20 to-green-600/20 rounded-3xl p-8 border border-emerald-500/30 text-center">
          <div className="w-24 h-24 bg-emerald-500/20 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl">
            👨‍🍳
          </div>
          <blockquote className="text-2xl italic text-emerald-300 font-medium mb-4">
            "HERA didn't just give me software. It gave me my life back."
          </blockquote>
          <p className="text-emerald-400 font-semibold">- Mario Rossi, Mario's Italian Restaurant</p>
        </div>
      </div>
    )
  }

  // Act 4: The Network Effect - Partner Success
  const NetworkEffectDemo = () => {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">🏆 The Channel Partner Transformation</h2>
          <p className="text-xl text-gray-300">"Sofia's accounting practice was revolutionized too..."</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sofia's Transformation */}
          <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-3xl p-8 border border-blue-500/30">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-blue-500/20 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
                👩‍💼
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Sofia Chen, CPA</h3>
              <p className="text-blue-300">Partner, Brooklyn Accounting Solutions</p>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-500/20 rounded-xl p-4">
                <h4 className="text-lg font-bold text-blue-300 mb-3">Practice Revenue Growth</h4>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-red-400 font-semibold mb-1">Before HERA</div>
                    <div className="text-2xl text-white">$2.1M</div>
                    <div className="text-sm text-gray-400">Traditional services</div>
                  </div>
                  <div>
                    <div className="text-emerald-400 font-semibold mb-1">After HERA</div>
                    <div className="text-2xl text-white">$3.8M</div>
                    <div className="text-sm text-gray-400">Advisory + commissions</div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/20 rounded-xl p-4">
                <h4 className="text-lg font-bold text-blue-300 mb-3">Client Value Transformation</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Service Value per Client:</span>
                    <span className="text-emerald-400 font-semibold">$500 → $1,200/mo</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Client Relationship:</span>
                    <span className="text-emerald-400 font-semibold">Tax prep → Business advisor</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Time Allocation:</span>
                    <span className="text-emerald-400 font-semibold">20% → 70% advisory</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Network Metrics */}
          <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-3xl p-8 border border-amber-500/30">
            <h3 className="text-2xl font-bold text-amber-400 mb-6 text-center">HERA Partner Network Growth</h3>
            
            <div className="space-y-6">
              <div className="bg-amber-500/20 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-amber-400 mb-2">150</div>
                <div className="text-white font-semibold">Active Accounting Partners</div>
                <div className="text-sm text-gray-400">Deploying HERA daily</div>
              </div>

              <div className="bg-amber-500/20 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-amber-400 mb-2">$180K</div>
                <div className="text-white font-semibold">Avg Annual Revenue per Partner</div>
                <div className="text-sm text-gray-400">From HERA deployments</div>
              </div>

              <div className="bg-amber-500/20 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-amber-400 mb-2">94%</div>
                <div className="text-white font-semibold">Partner Satisfaction Score</div>
                <div className="text-sm text-gray-400">Would recommend to others</div>
              </div>

              <div className="bg-amber-500/20 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-amber-400 mb-2">23</div>
                <div className="text-white font-semibold">States Covered</div>
                <div className="text-sm text-gray-400">Growing density</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-gradient-to-r from-blue-600/20 to-amber-600/20 rounded-2xl p-6 border border-blue-500/30 text-center">
            <blockquote className="text-xl italic text-blue-300 font-medium mb-4">
              "I went from being a tax preparer to being the most sought-after business advisor in Brooklyn. Every client wants what Mario has."
            </blockquote>
            <p className="text-blue-400 font-semibold">- Sofia Chen, HERA Channel Partner</p>
          </div>
        </div>
      </div>
    )
  }

  // Act 5: Platform Scale Demo
  const PlatformScaleDemo = () => {
    const [selectedView, setSelectedView] = useState('deployments')
    
    const platformData = {
      deployments: {
        title: "Real-Time Platform Activity",
        data: [
          { label: "Restaurants Deployed", value: "1,200", growth: "+15 today", icon: "🍕" },
          { label: "Accounting Practices", value: "250", growth: "+8 this week", icon: "📊" },
          { label: "Educational Institutions", value: "85", growth: "+12 this month", icon: "🎓" },
          { label: "Average Deployment Time", value: "2 min", growth: "Consistent", icon: "⚡" }
        ]
      },
      revenue: {
        title: "Revenue Performance",
        data: [
          { label: "Monthly Recurring Revenue", value: "$5.2M", growth: "+23% MoM", icon: "💰" },
          { label: "Customer Satisfaction", value: "97.5%", growth: "+2.1% YoY", icon: "⭐" },
          { label: "Partner Revenue Share", value: "$1.8M", growth: "+31% MoM", icon: "🤝" },
          { label: "AI Learning Rate", value: "97%", growth: "+12% accuracy", icon: "🧠" }
        ]
      },
      network: {
        title: "Network Effect Metrics",
        data: [
          { label: "Active Partners", value: "150", growth: "+25 this quarter", icon: "🏢" },
          { label: "Avg Partner Revenue", value: "$180K", growth: "+40% YoY", icon: "📈" },
          { label: "Template Library", value: "2,847", growth: "+156 this month", icon: "📚" },
          { label: "Cross-Deployment Learning", value: "94%", growth: "Improving daily", icon: "🔄" }
        ]
      }
    }

    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent mb-4">
            🚀 The Scalability Proof
          </h2>
          <p className="text-xl text-gray-300">"Live platform demonstrating scale and network effects"</p>
        </div>

        {/* View Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800/50 rounded-2xl p-2 border border-gray-600/30">
            {Object.keys(platformData).map((view) => (
              <button
                key={view}
                onClick={() => setSelectedView(view)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all capitalize ${
                  selectedView === view
                    ? 'bg-amber-500 text-gray-900'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {view === 'deployments' ? 'Live Activity' : view === 'revenue' ? 'Revenue Metrics' : 'Network Effects'}
              </button>
            ))}
          </div>
        </div>

        {/* Platform Dashboard */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-8 border border-gray-600/30 mb-8">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            {platformData[selectedView as keyof typeof platformData].title}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformData[selectedView as keyof typeof platformData].data.map((item, index) => (
              <div
                key={item.label}
                className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-2xl p-6 border border-amber-500/30 text-center hover:scale-105 transition-all"
              >
                <div className="text-4xl mb-3">{item.icon}</div>
                <div className="text-3xl font-bold text-amber-400 mb-2">{item.value}</div>
                <div className="text-white font-semibold mb-2">{item.label}</div>
                <div className="text-emerald-300 text-sm">{item.growth}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Learning Visualization */}
        <div className="bg-gradient-to-br from-emerald-600/20 to-green-600/20 rounded-3xl p-8 border border-emerald-500/30">
          <h3 className="text-2xl font-bold text-emerald-400 mb-6 text-center">🧠 AI Intelligence Growth</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-xl font-bold text-white mb-4">Learning Metrics</h4>
              {[
                { metric: "Deployment Accuracy", progress: 97, improvement: "85% → 97%" },
                { metric: "Customization Speed", progress: 94, improvement: "5 min → 2 min" },
                { metric: "Business Insights", progress: 91, improvement: "Basic → Predictive" },
                { metric: "Integration Capabilities", progress: 89, improvement: "12 → 47 systems" }
              ].map((item) => (
                <div key={item.metric} className="bg-emerald-500/20 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-semibold">{item.metric}</span>
                    <span className="text-emerald-300 text-sm">{item.improvement}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-emerald-500/20 rounded-2xl p-6">
              <h4 className="text-xl font-bold text-white mb-4">The Network Effect</h4>
              <div className="space-y-4 text-sm text-gray-300">
                <p>Every customer deployment strengthens the entire platform:</p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-400 mr-2" />
                    <span>New business patterns learned automatically</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-400 mr-2" />
                    <span>Templates shared across similar businesses</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-400 mr-2" />
                    <span>AI recommendations become more accurate</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-400 mr-2" />
                    <span>Integration possibilities expand continuously</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Final Investment Moment
  const InvestmentMoment = () => {
    const [showProjections, setShowProjections] = useState(false)
    
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent mb-4">
            💡 The Investor Realization Moment
          </h2>
          <p className="text-xl text-gray-300">"Do you see what just happened?"</p>
        </div>

        {/* Key Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-2xl p-6 border border-blue-500/30">
            <h3 className="text-xl font-bold text-blue-400 mb-4">What You Just Witnessed:</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-center">
                <Zap className="h-4 w-4 text-blue-400 mr-2" />
                <span><strong>Speed:</strong> 2-minute deployments (not 6-18 months)</span>
              </div>
              <div className="flex items-center">
                <Brain className="h-4 w-4 text-blue-400 mr-2" />
                <span><strong>Intelligence:</strong> Business-context AI (not data processing)</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 text-blue-400 mr-2" />
                <span><strong>Network:</strong> Partners who win bigger (not channel conflicts)</span>
              </div>
              <div className="flex items-center">
                <Globe className="h-4 w-4 text-blue-400 mr-2" />
                <span><strong>Scalability:</strong> Infinite customization (not rigid templates)</span>
              </div>
              <div className="flex items-center">
                <Award className="h-4 w-4 text-blue-400 mr-2" />
                <span><strong>Defensibility:</strong> Network effects (not isolated silos)</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-600/20 to-green-600/20 rounded-2xl p-6 border border-emerald-500/30">
            <h3 className="text-xl font-bold text-emerald-400 mb-4">Market Implications:</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex justify-between items-center">
                <span>Restaurant Industry:</span>
                <span className="text-emerald-400 font-semibold">$800B (90% addressable)</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Accounting Services:</span>
                <span className="text-emerald-400 font-semibold">$120B (80% addressable)</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Education Industry:</span>
                <span className="text-emerald-400 font-semibold">$6T (95% addressable)</span>
              </div>
              <div className="border-t border-emerald-500/30 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Total Addressable:</span>
                  <span className="text-emerald-400 font-bold text-lg">$7T+</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Model Reality */}
        <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-2xl p-6 border border-amber-500/30 mb-8">
          <h3 className="text-xl font-bold text-amber-400 mb-4 text-center">Revenue Model Reality Check</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-red-500/20 rounded-xl p-4 border border-red-500/30">
              <h4 className="text-red-400 font-bold mb-2">Traditional SaaS</h4>
              <p className="text-gray-300 text-sm mb-3">$100/month × 10,000 customers</p>
              <div className="text-2xl font-bold text-red-400">$12M ARR</div>
            </div>
            <div className="bg-emerald-500/20 rounded-xl p-4 border border-emerald-500/30">
              <h4 className="text-emerald-400 font-bold mb-2">HERA Platform</h4>
              <p className="text-gray-300 text-sm mb-3">$800/month × 5,000 customers + 30% commissions</p>
              <div className="text-2xl font-bold text-emerald-400">$60M+ ARR</div>
            </div>
          </div>
          <p className="text-center text-amber-300 mt-4 font-semibold">Same customers, 5x revenue through intelligent platform + partner network</p>
        </div>

        {/* Investment Projections */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowProjections(!showProjections)}
            className="bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-all"
          >
            {showProjections ? 'Hide' : 'Show'} Investment Projections
          </button>
        </div>

        {showProjections && (
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-8 border border-gray-600/30">
            <h3 className="text-2xl font-bold text-center text-white mb-6">Your $35M Series A Investment Trajectory</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[
                { year: "2025", arr: "$6M", valuation: "$140M", multiple: "4x" },
                { year: "2026", arr: "$45M", valuation: "$450M", multiple: "3.2x" },
                { year: "2027", arr: "$120M", valuation: "$1.2B", multiple: "2.7x" },
                { year: "2028", arr: "$300M", valuation: "$3B+", multiple: "2.5x" }
              ].map((projection) => (
                <div key={projection.year} className="bg-amber-500/20 rounded-xl p-4 text-center border border-amber-500/30">
                  <div className="text-amber-400 font-bold text-lg mb-2">{projection.year}</div>
                  <div className="text-white font-semibold mb-1">{projection.arr} ARR</div>
                  <div className="text-emerald-400 font-bold mb-1">{projection.valuation}</div>
                  <div className="text-amber-300 text-sm">{projection.multiple} return</div>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-2">85x Potential Return</div>
              <p className="text-gray-300">Over 3.5 years - Category creation opportunity</p>
            </div>
          </div>
        )}

        {/* Final Decision Moment */}
        <div className="bg-gradient-to-r from-amber-600/20 to-yellow-600/20 rounded-2xl p-8 border border-amber-500/30 text-center mt-8">
          <h3 className="text-2xl font-bold text-amber-400 mb-4">🎯 The Moment of Decision</h3>
          <p className="text-xl text-white mb-6">Are you ready to own the future of business software?</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-500/20 rounded-xl p-4 border border-emerald-500/30">
              <h4 className="text-emerald-400 font-bold mb-2">Join the Revolution</h4>
              <p className="text-gray-300 text-sm">Own equity in the $47B category disruption</p>
            </div>
            <div className="bg-red-500/20 rounded-xl p-4 border border-red-500/30">
              <h4 className="text-red-400 font-bold mb-2">Watch from Sidelines</h4>
              <p className="text-gray-300 text-sm">Miss the category-defining moment</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const demoSteps: DemoStep[] = [
    {
      id: 'old-world',
      title: '🍕 ACT 1: The Old World',
      subtitle: "Mario's Restaurant Before HERA",
      component: OldWorldDemo
    },
    {
      id: 'transformation',
      title: '⚡ ACT 2: The Transformation',
      subtitle: 'Mario Discovers HERA - 2-Minute Deployment',
      component: TransformationDemo
    },
    {
      id: 'results',
      title: '📊 ACT 3: The Results',
      subtitle: '3 Months Later - Business Transformation',
      component: ResultsDemo
    },
    {
      id: 'network-effect',
      title: '🏆 ACT 4: The Network Effect',
      subtitle: "The Accountant's Success Story",
      component: NetworkEffectDemo
    },
    {
      id: 'platform-scale',
      title: '🚀 ACT 5: Platform Scale',
      subtitle: 'Live Platform Demonstrating Network Effects',
      component: PlatformScaleDemo
    },
    {
      id: 'investment-moment',
      title: '💡 THE REALIZATION',
      subtitle: 'The Investment Opportunity Revealed',
      component: InvestmentMoment
    }
  ]

  const CurrentComponent = demoSteps[currentStep].component

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-900/10 to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                🎯 HERA: The Live Demo That Changes Everything
              </h1>
              <p className="text-gray-400 text-sm sm:text-base">Experience the transformation that's changing enterprise software</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-amber-400 font-semibold">
                {currentStep + 1} / {demoSteps.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-800/30 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="w-full bg-gray-700 rounded-full h-1">
            <div
              className="bg-gradient-to-r from-amber-500 to-yellow-500 h-1 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="bg-gray-800/20 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">{demoSteps[currentStep].title}</h2>
              <p className="text-gray-400">{demoSteps[currentStep].subtitle}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-all"
              >
                Previous
              </button>
              <button
                onClick={nextStep}
                disabled={currentStep === demoSteps.length - 1}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all font-semibold"
              >
                Next Act
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          <CurrentComponent />
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border-t border-gray-700/50 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400 mb-4">
            "Every revolutionary technology looks like magic until it becomes inevitable. HERA is at that exact moment of transition."
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <span>Series A: $35M</span>
            <span>•</span>
            <span>Timeline: NOW</span>
            <span>•</span>
            <span>Opportunity: UNLIMITED</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvestorDemo