"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/revolutionary-card';
import { Button } from '@/components/ui/revolutionary-button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import motionConfig from '@/lib/motion';

// HERA Restaurant Platform Marketing Page
// Inspired by McDonald's design but showcasing HERA's revolutionary capabilities
export default function HERARestaurantMarketingPage() {
  const [activeSection, setActiveSection] = useState('hero');
  const [showDemo, setShowDemo] = useState(false);

  const heroStats = {
    prediction_accuracy: 94,
    table_utilization: 100,
    revenue_increase: 340,
    customer_satisfaction: 98,
    processing_time: 1.2,
    error_reduction: 89
  };

  const businessJourney = {
    restaurant_name: "Zen Tea Garden",
    owner: "Maya Patel",
    location: "Mumbai, India",
    journey: [
      {
        phase: "Before HERA",
        emoji: "😰",
        challenges: [
          "Manual order management causing 15% errors",
          "Inventory tracking on spreadsheets",
          "No real-time kitchen coordination",
          "Customer complaints about wait times",
          "Financial reporting took 3 days"
        ],
        metrics: {
          daily_revenue: 12000,
          order_accuracy: 85,
          customer_satisfaction: 72,
          staff_efficiency: 60
        }
      },
      {
        phase: "After HERA",
        emoji: "🚀",
        improvements: [
          "AI-powered order optimization reduces errors to 0.8%",
          "Real-time inventory with automatic reorder points",
          "ChefHat display system with predictive timing",
          "Customer app with live order tracking",
          "Instant financial dashboards with profit insights"
        ],
        metrics: {
          daily_revenue: 28800,
          order_accuracy: 99.2,
          customer_satisfaction: 96,
          staff_efficiency: 92
        }
      }
    ]
  };

  const features = [
    {
      category: "🧮 Digital Accountant",
      title: "Your Personal Restaurant Accountant",
      description: "Complete financial management that works 24/7 - like having a senior accountant on your team",
      capabilities: [
        "Full P&L and Balance Sheet generation",
        "Unit costing for every menu item",
        "Real-time financial health monitoring",
        "Tax compliance and reporting",
        "Cost analysis and profit optimization"
      ],
      icon: "🧮",
      color: "from-blue-500 to-indigo-600"
    },
    {
      category: "📱 Mobile-First Experience",
      title: "Complete Restaurant in Your Pocket",
      description: "Run your entire restaurant from your phone - works perfectly offline, syncs when online",
      capabilities: [
        "iOS & Android native apps",
        "100% offline functionality",
        "Automatic sync when connected",
        "Scan invoices, inventory, receipts",
        "Manage everything remotely"
      ],
      icon: "📱",
      color: "from-emerald-500 to-teal-600"
    },
    {
      category: "📦 Smart Inventory & Forecasting",
      title: "Never Run Out, Never Overstock",
      description: "Intelligent inventory that predicts demand and orders exactly what you need",
      capabilities: [
        "Smart demand forecasting",
        "Automatic reorder points",
        "Waste reduction by 75%",
        "Supplier optimization",
        "Real-time stock tracking"
      ],
      icon: "📦",
      color: "from-purple-500 to-indigo-600"
    },
    {
      category: "⚡ Complete Restaurant System",
      title: "Everything You Need in One Place",
      description: "Orders, kitchen, staff, customers, finances - all working together seamlessly",
      capabilities: [
        "Order management & kitchen display",
        "Staff scheduling & payroll",
        "Customer loyalty programs",
        "Real-time analytics dashboard",
        "Multi-location support"
      ],
      icon: "⚡",
      color: "from-amber-500 to-orange-600"
    }
  ];

  const businessModules = [
    {
      name: "Digital Accountant",
      emoji: "🧮",
      description: "Complete financial management system - P&L, Balance Sheet, Tax compliance",
      features: ["Real-time P&L", "Balance Sheet", "Tax reports", "Cost analysis"]
    },
    {
      name: "Smart Inventory",
      emoji: "📦",
      description: "Intelligent forecasting and automatic reordering - never run out or overstock",
      features: ["Smart forecasting", "Auto-reordering", "Waste reduction", "Supplier optimization"]
    },
    {
      name: "Unit Costing",
      emoji: "💰",
      description: "Know the exact cost of every menu item - optimize pricing for maximum profit",
      features: ["Recipe costing", "Ingredient tracking", "Profit margins", "Price optimization"]
    },
    {
      name: "Mobile & Offline",
      emoji: "📱",
      description: "Complete restaurant management on mobile - works perfectly offline",
      features: ["iOS & Android apps", "100% offline", "Auto-sync", "Mobile scanning"]
    },
    {
      name: "Multi-Location",
      emoji: "🏢",
      description: "Manage multiple restaurants from one dashboard - consolidated reporting",
      features: ["Centralized control", "Consolidated reports", "Inter-branch transfers", "Group analytics"]
    },
    {
      name: "Complete System",
      emoji: "⚡",
      description: "Orders, kitchen, staff, customers - everything integrated seamlessly",
      features: ["Order management", "ChefHat display", "Staff scheduling", "Customer loyalty"]
    }
  ];

  const testimonials = [
    {
      name: "Maya Patel",
      restaurant: "Zen Tea Garden",
      location: "Mumbai",
      quote: "HERA just works like magic. Everything runs itself now. Revenue increased 240% in 3 months!",
      impact: "240% revenue increase",
      avatar: "👩‍💼"
    },
    {
      name: "Raj Kumar",
      restaurant: "Spice Route",
      location: "Delhi",
      quote: "It's like having a crystal ball. We never run out of ingredients and waste is down 75%.",
      impact: "75% waste reduction",
      avatar: "👨‍🍳"
    },
    {
      name: "Priya Sharma",
      restaurant: "Coastal Bites",
      location: "Goa",
      quote: "Our customers love the mobile ordering. Wait times reduced from 25 minutes to 8 minutes.",
      impact: "68% faster service",
      avatar: "👩‍🦳"
    }
  ];

  const pricingPlans = [
    {
      name: "Small Business",
      price: "₹8,999",
      period: "per month",
      originalPrice: "₹26,999",
      description: "Perfect for single restaurant operations",
      userLimit: "Up to 10 users",
      features: [
        "Complete Digital Accountant System",
        "Smart Inventory Management",
        "Smart Forecasting & Demand Planning",
        "Unit Costing & Recipe Management",
        "Full Financial System (P&L, Balance Sheet)",
        "Mobile Version (iOS & Android)",
        "100% Offline Sync Capability",
        "Order Management & ChefHat Display",
        "Customer Management & Loyalty",
        "Staff Scheduling & Payroll",
        "Real-time Analytics Dashboard",
        "24/7 Support"
      ],
      color: "from-blue-500 to-indigo-600",
      popular: false,
      savings: "67% OFF"
    },
    {
      name: "Medium Business",
      price: "₹23,999",
      period: "per month",
      originalPrice: "₹59,999",
      description: "For growing restaurants with multiple locations",
      userLimit: "Up to 50 users",
      features: [
        "Everything in Small Business Plan",
        "Multi-location Management",
        "Advanced Financial Consolidation",
        "Inter-branch Inventory Transfer",
        "Multi-currency Support",
        "Advanced Reporting & Analytics",
        "API Access for Integrations",
        "Priority Support",
        "Training & Onboarding"
      ],
      color: "from-purple-500 to-indigo-600",
      popular: true,
      savings: "60% OFF"
    },
    {
      name: "Large Business",
      price: "₹59,999",
      period: "per month",
      originalPrice: "₹149,999",
      description: "For restaurant chains and enterprise groups",
      userLimit: "Unlimited users",
      features: [
        "Everything in Medium Business Plan",
        "Enterprise Group Consolidation",
        "Advanced Financial Analytics",
        "Custom Workflow Automation",
        "White-label Mobile Apps",
        "Advanced Security & Compliance",
        "Dedicated Account Manager",
        "Custom Training Programs",
        "24/7 Priority Support",
        "On-site Implementation"
      ],
      color: "from-emerald-500 to-teal-600",
      popular: false,
      savings: "60% OFF"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <motion.div 
          className="relative z-10 text-center text-white px-6 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionConfig.spring.swift}
        >
          <motion.div
            className="mb-8"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={motionConfig.spring.bounce}
          >
            <div className="relative mb-8">
              {/* Elegant visual representation */}
              <div className="flex items-center justify-center mb-8">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl">
                    <span className="text-5xl">🍽️</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                    <span className="text-lg">✨</span>
                  </div>
                  <div className="absolute -bottom-2 -left-2 w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                    <span className="text-lg">⚡</span>
                  </div>
                </div>
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
              HERA RESTAURANT
            </h1>
            <p className="text-xl md:text-2xl mb-2 text-blue-200">
              Restaurant Management That Just Works
            </p>
            <p className="text-lg text-slate-300 max-w-3xl mx-auto">
              Everything your restaurant needs - orders, inventory, staff, customers - all working seamlessly together
            </p>
          </motion.div>

          {/* Hero Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...motionConfig.spring.swift, delay: 0.3 }}
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-300">{heroStats.prediction_accuracy}%</div>
              <div className="text-sm text-slate-300">Order Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-300">{heroStats.table_utilization}%</div>
              <div className="text-sm text-slate-300">Efficiency ↑</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-300">{heroStats.revenue_increase}%</div>
              <div className="text-sm text-slate-300">Revenue ↑</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-300">{heroStats.customer_satisfaction}%</div>
              <div className="text-sm text-slate-300">Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-300">{heroStats.processing_time}s</div>
              <div className="text-sm text-slate-300">Order Speed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-300">{heroStats.error_reduction}%</div>
              <div className="text-sm text-slate-300">Less Waste</div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...motionConfig.spring.swift, delay: 0.5 }}
          >
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg"
              onClick={() => setShowDemo(true)}
            >
              🚀 Start Free Trial
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-blue-300 text-blue-300 hover:bg-blue-300 hover:text-slate-900 font-bold text-lg px-8 py-4 rounded-full"
            >
              📹 Watch Demo
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Business Journey Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={motionConfig.spring.swift}
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Real Success Story: {businessJourney.restaurant_name}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              How {businessJourney.owner} transformed her restaurant using HERA Universal
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            {businessJourney.journey.map((phase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ ...motionConfig.spring.swift, delay: index * 0.2 }}
              >
                <Card className="p-8 h-full">
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4">{phase.emoji}</div>
                    <h3 className="text-2xl font-bold text-gray-800">{phase.phase}</h3>
                  </div>

                  {/* Challenges or Improvements */}
                  <div className="space-y-3 mb-8">
                    {(phase.challenges || phase.improvements).map((item, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                          phase.challenges ? "bg-red-500" : "bg-green-500"
                        )}></div>
                        <p className="text-gray-700">{item}</p>
                      </div>
                    ))}
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className={cn(
                        "text-2xl font-bold",
                        phase.challenges ? "text-red-600" : "text-green-600"
                      )}>
                        ₹{phase.metrics.daily_revenue.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Daily Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className={cn(
                        "text-2xl font-bold",
                        phase.challenges ? "text-red-600" : "text-green-600"
                      )}>
                        {phase.metrics.order_accuracy}%
                      </div>
                      <div className="text-sm text-gray-600">Order Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className={cn(
                        "text-2xl font-bold",
                        phase.challenges ? "text-red-600" : "text-green-600"
                      )}>
                        {phase.metrics.customer_satisfaction}%
                      </div>
                      <div className="text-sm text-gray-600">Customer Satisfaction</div>
                    </div>
                    <div className="text-center">
                      <div className={cn(
                        "text-2xl font-bold",
                        phase.challenges ? "text-red-600" : "text-green-600"
                      )}>
                        {phase.metrics.staff_efficiency}%
                      </div>
                      <div className="text-sm text-gray-600">Staff Efficiency</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={motionConfig.spring.swift}
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              The Only Restaurant Platform You'll Ever Need
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Four breakthrough technologies that put your restaurant 5 years ahead of the competition
            </p>
            <div className="mt-8 inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full">
              <span className="text-blue-800 font-semibold">✨ Invisible Intelligence - It Just Works Like Magic</span>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ ...motionConfig.spring.swift, delay: index * 0.1 }}
              >
                <Card className="p-8 h-full">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className={cn(
                      "w-16 h-16 rounded-xl flex items-center justify-center text-3xl text-white bg-gradient-to-br",
                      feature.color
                    )}>
                      {feature.icon}
                    </div>
                    <div>
                      <Badge className="mb-2 text-xs">{feature.category}</Badge>
                      <h3 className="text-xl font-bold text-gray-800">{feature.title}</h3>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-6">{feature.description}</p>
                  
                  <div className="space-y-3">
                    {feature.capabilities.map((capability, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-gray-700">{capability}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Modules Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={motionConfig.spring.swift}
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Complete Restaurant Management Suite
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to run a successful restaurant, all in one platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {businessModules.map((module, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ ...motionConfig.spring.swift, delay: index * 0.1 }}
              >
                <Card className="p-6 h-full text-center">
                  <div className="text-5xl mb-4">{module.emoji}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{module.name}</h3>
                  <p className="text-gray-600 mb-4">{module.description}</p>
                  <div className="space-y-2">
                    {module.features.map((feature, idx) => (
                      <div key={idx} className="text-sm text-gray-500">
                        • {feature}
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={motionConfig.spring.swift}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Restaurant Owners Love HERA
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Join thousands of successful restaurants experiencing the magic of HERA
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ ...motionConfig.spring.swift, delay: index * 0.1 }}
              >
                <Card className="p-6 h-full">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="text-4xl">{testimonial.avatar}</div>
                    <div>
                      <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
                      <p className="text-gray-600">{testimonial.restaurant}</p>
                      <p className="text-sm text-gray-500">{testimonial.location}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                  <Badge className="bg-green-100 text-green-800">
                    {testimonial.impact}
                  </Badge>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={motionConfig.spring.swift}
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Choose Your Business Size - All Features Included
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
              Every plan includes the complete HERA system. Only difference is number of users and consolidation features.
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
              ✨ Launch Pricing: Save up to 67% - Limited Time
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ ...motionConfig.spring.swift, delay: index * 0.1 }}
              >
                <Card className={cn(
                  "p-8 h-full text-center relative",
                  plan.popular ? "border-2 border-purple-500 shadow-lg" : ""
                )}>
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white">
                      Most Popular
                    </Badge>
                  )}
                  
                  {plan.savings && (
                    <Badge className="absolute -top-3 right-4 bg-red-500 text-white">
                      {plan.savings}
                    </Badge>
                  )}
                  
                  <div className={cn(
                    "w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center bg-gradient-to-br",
                    plan.color
                  )}>
                    <span className="text-2xl text-white">🚀</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-2">{plan.description}</p>
                  <div className="bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-1 rounded-full mb-4">
                    <span className="text-blue-800 font-semibold text-sm">{plan.userLimit}</span>
                  </div>
                  
                  <div className="mb-6">
                    {plan.originalPrice && (
                      <div className="text-lg text-gray-500 line-through mb-1">{plan.originalPrice}</div>
                    )}
                    <span className="text-4xl font-bold text-gray-800">{plan.price}</span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                  
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    className={cn(
                      "w-full bg-gradient-to-r text-white font-bold",
                      plan.color
                    )}
                  >
                    Start Free Trial
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={motionConfig.spring.swift}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Your Competitors Are Already Running Smarter. Don't Get Left Behind.
            </h2>
            <p className="text-xl text-gray-300 mb-4 max-w-2xl mx-auto">
              Every day you wait, your competitors gain more advantage. Start your transformation today.
            </p>
            <div className="mb-8 text-blue-300 font-semibold">
              ⚡ Setup takes 5 minutes • See results in 24 hours • ROI in first month guaranteed
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg"
              >
                🚀 Start Your 30-Day Free Trial
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white font-bold text-lg px-8 py-4 rounded-full"
              >
                📞 See Live Demo (2 mins)
              </Button>
            </div>
            
            <p className="text-sm text-gray-400 mt-6">
              No setup fees • No long-term contracts • Cancel anytime • All features included in every plan
            </p>
            
            <div className="mt-8 flex items-center justify-center space-x-8 text-gray-400 text-sm">
              <div className="flex items-center space-x-2">
                <span>🔒</span>
                <span>Bank-level security</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>⚡</span>
                <span>5-minute setup</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>💰</span>
                <span>ROI guaranteed</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}