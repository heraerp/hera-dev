"use client";

import React from 'react';
import { PageErrorBoundary } from '@/components/error-boundaries';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  Package, 
  TrendingUp, 
  Users,
  DollarSign,
  Brain,
  Mic,
  Pizza,
  ChefHat,
  Utensils,
  Coffee,
  Clock,
  Star,
  ArrowRight,
  Zap,
  Shield,
  Leaf,
  BarChart3,
  Eye,
  CreditCard,
  Truck
} from 'lucide-react';

const RestaurantMainPage = () => {
  const features = [
    {
      icon: Brain,
      emoji: "🧠",
      title: "AI Dashboard",
      description: "Revolutionary AI-powered business intelligence with real-time insights and automated decision-making",
      link: "/restaurant/ai-dashboard",
      demo: true,
      status: "NEW"
    },
    {
      icon: Utensils,
      emoji: "🍝",
      title: "Menu Management",
      description: "Complete menu system with categories, items, combo meals, pricing analytics, and Italian-style composite dishes",
      link: "/restaurant/menu",
      demo: true,
      status: "NEW"
    },
    {
      icon: Coffee,
      emoji: "☕",
      title: "Product Catalog",
      description: "Complete menu and inventory management with Universal Schema and real-time sync",
      link: "/restaurant/products",
      demo: true,
      status: "LIVE"
    },
    {
      icon: Utensils,
      emoji: "🛒",
      title: "Order Management",
      description: "Universal transaction processing with real-time kitchen integration and customer tracking",
      link: "/restaurant/orders",
      demo: true,
      status: "LIVE"
    },
    {
      icon: ChefHat,
      emoji: "👨‍🍳",
      title: "Kitchen Display",
      description: "Real-time kitchen management with AI-optimized preparation workflows and timing",
      link: "/restaurant/kitchen",
      demo: true,
      status: "LIVE"
    },
    {
      icon: BarChart3,
      emoji: "📊",
      title: "Manager Dashboard",
      description: "Comprehensive business overview with KPIs, staff management, and performance analytics",
      link: "/restaurant/dashboard",
      demo: true,
      status: "LIVE"
    },
    {
      icon: Users,
      emoji: "👥",
      title: "Customer Intelligence",
      description: "AI-powered customer insights with loyalty tracking and personalized recommendations",
      link: "/restaurant/customers",
      demo: true,
      status: "HOT"
    }
  ];

  const additionalFeatures = [
    {
      icon: Package,
      emoji: "📦",
      title: "Smart Inventory",
      description: "AI-powered inventory management with voice control and predictive ordering",
      link: "/restaurant/inventory",
      demo: true
    },
    {
      icon: ChefHat,
      emoji: "👨‍🍳",
      title: "ChefHat Display",
      description: "Real-time kitchen display system for efficient order preparation",
      link: "/restaurant/kitchen",
      demo: true
    },
    {
      icon: TrendingUp,
      emoji: "📈",
      title: "Manager Dashboard",
      description: "Comprehensive restaurant management and staff coordination",
      link: "/restaurant/dashboard",
      demo: true
    },
    {
      icon: TrendingUp,
      emoji: "📣",
      title: "Marketing Tools",
      description: "Promotional campaigns and customer engagement",
      link: "/restaurant/marketing",
      demo: true
    },
    {
      icon: Star,
      emoji: "⭐",
      title: "Feedback System",
      description: "Collect and analyze customer feedback",
      link: "/restaurant/feedback",
      demo: true
    },
    {
      icon: Package,
      emoji: "🚚",
      title: "Delivery Management",
      description: "Manage delivery orders and track drivers",
      link: "/restaurant/delivery",
      demo: true
    },
    {
      icon: Truck,
      emoji: "📥",
      title: "Goods Receiving",
      description: "AI-powered receiving with supplier analytics and quality tracking",
      link: "/purchasing/receiving",
      demo: true,
      status: "NEW"
    }
  ];

  const metrics = [
    {
      title: "Food Cost Reduction",
      value: "30%",
      description: "Average savings with HERA AI",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Waste Reduction",
      value: "25%",
      description: "Through predictive ordering",
      icon: Leaf,
      color: "text-emerald-600"
    },
    {
      title: "ROI Achievement",
      value: "1,950%",
      description: "First-year return on investment",
      icon: TrendingUp,
      color: "text-blue-600"
    },
    {
      title: "Setup Time",
      value: "5 mins",
      description: "From signup to operation",
      icon: Clock,
      color: "text-purple-600"
    }
  ];

  const testimonials = [
    {
      name: "Tony Marinelli",
      restaurant: "Tony's Pizza ChefHat",
      quote: "HERA transformed our operations. We went from struggling with inventory to having it run itself.",
      rating: 5,
      savings: "$2,400/month"
    },
    {
      name: "Maria Rodriguez",
      restaurant: "Casa Maria Mexican Grill",
      quote: "The voice control is amazing. I can check inventory while cooking without touching anything.",
      rating: 5,
      savings: "$1,800/month"
    },
    {
      name: "David Chen",
      restaurant: "Golden Dragon Asian Fusion",
      quote: "HERA's AI predicted our busy periods perfectly. Never run out of ingredients anymore.",
      rating: 5,
      savings: "$3,200/month"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="max-w-7xl mx-auto p-6">
        
        {/* Quick Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-2 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">🚀</span>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">HERA Restaurant Demo</h3>
                    <p className="text-sm text-gray-600">World's First Universal Restaurant Management System</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href="/restaurant/ai-dashboard">
                    <Button size="sm" className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white">
                      <Brain className="mr-1 h-3 w-3" />
                      AI Dashboard
                      <Badge className="ml-2 bg-white/20 text-white">NEW</Badge>
                    </Button>
                  </Link>
                  <Link href="/restaurant/dashboard">
                    <Button size="sm" variant="outline" className="hover:bg-orange-50 border-orange-300 text-orange-700">
                      <BarChart3 className="mr-1 h-3 w-3" />
                      Manager Dashboard
                    </Button>
                  </Link>
                  <Link href="/restaurant/products">
                    <Button size="sm" variant="outline" className="hover:bg-green-50 border-green-300 text-green-700">
                      <Coffee className="mr-1 h-3 w-3" />
                      Product Catalog
                    </Button>
                  </Link>
                  <Link href="/restaurant/orders">
                    <Button size="sm" variant="outline" className="hover:bg-blue-50 border-blue-300 text-blue-700">
                      <Utensils className="mr-1 h-3 w-3" />
                      Order Management
                    </Button>
                  </Link>
                  <Link href="/restaurant/kitchen">
                    <Button size="sm" variant="outline" className="hover:bg-red-50 border-red-300 text-red-700">
                      <ChefHat className="mr-1 h-3 w-3" />
                      Kitchen Display
                    </Button>
                  </Link>
                  <Link href="/setup/restaurant">
                    <Button size="sm" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white">
                      <Zap className="mr-1 h-3 w-3" />
                      Quick Setup
                      <Badge className="ml-2 bg-white/20 text-white">5 min</Badge>
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 py-12"
        >
          <div className="flex items-center justify-center space-x-4 mb-6">
            <span className="text-6xl">🍕</span>
            <span className="text-6xl">🍔</span>
            <span className="text-6xl">🍜</span>
            <span className="text-6xl">🥗</span>
          </div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            HERA Restaurant Solutions
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The world's first Universal Restaurant Management System. 
            One AI-powered platform that handles <span className="font-semibold text-orange-600">everything</span> - 
            from inventory to staff, menu to compliance.
          </p>
          
          <div className="flex items-center justify-center space-x-6">
            <Badge className="bg-orange-100 text-orange-800 px-4 py-2">
              🧠 AI-Powered Intelligence
            </Badge>
            <Badge className="bg-green-100 text-green-800 px-4 py-2">
              💰 1,950% ROI
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 px-4 py-2">
              ⚡ 5-Minute Setup
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 justify-center">
            <Link href="/restaurant/ai-dashboard">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-lg px-8 py-4 shadow-lg">
                <Brain className="mr-2 h-5 w-5" />
                Try AI Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/restaurant/dashboard">
              <Button size="lg" variant="outline" className="bg-white hover:bg-orange-50 border-2 border-orange-300 text-orange-700 text-lg px-8 py-4 shadow-lg">
                <BarChart3 className="mr-2 h-5 w-5" />
                Manager Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          {metrics.map((metric, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <metric.icon className={`h-8 w-8 mx-auto mb-4 ${metric.color}`} />
                <div className={`text-3xl font-bold ${metric.color} mb-2`}>
                  {metric.value}
                </div>
                <div className="font-semibold text-gray-800 mb-1">
                  {metric.title}
                </div>
                <div className="text-sm text-gray-600">
                  {metric.description}
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Complete Restaurant Management Suite
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-200 ring-2 ring-orange-300 bg-gradient-to-br from-orange-50 to-red-50">
                  <CardHeader>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-3xl">{feature.emoji}</span>
                      <feature.icon className="h-6 w-6 text-orange-600" />
                    </div>
                    <CardTitle className="flex items-center justify-between">
                      <span>{feature.title}</span>
                      {feature.status && (
                        <Badge className={
                          feature.status === "HOT" ? "bg-red-100 text-red-800 animate-pulse" :
                          feature.status === "NEW" ? "bg-purple-100 text-purple-800 animate-pulse" :
                          feature.status === "LIVE" ? "bg-green-100 text-green-800" :
                          "bg-orange-100 text-orange-800"
                        }>
                          {feature.status}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600">{feature.description}</p>
                    
                    <Link href={feature.link}>
                      <Button className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                        <Eye className="mr-2 h-4 w-4" />
                        View Page
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Additional Features */}
          <h3 className="text-2xl font-bold text-center mb-6 text-gray-700">
            More Restaurant Tools
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + features.length) }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-200 hover:scale-105">
                  <CardHeader>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-3xl">{feature.emoji}</span>
                      <feature.icon className="h-6 w-6 text-orange-600" />
                    </div>
                    <CardTitle className="flex items-center justify-between">
                      <span>{feature.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600">{feature.description}</p>
                    
                    <Link href={feature.link}>
                      <Button variant="outline" className="w-full hover:bg-orange-50">
                        <Eye className="mr-2 h-4 w-4" />
                        View Page
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="text-2xl text-center flex items-center justify-center space-x-2">
                <Brain className="h-6 w-6 text-blue-600" />
                <span>How HERA Revolutionizes Your Restaurant</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center space-y-4">
                  <div className="text-4xl">🎤</div>
                  <h3 className="font-semibold text-lg">Just Talk to HERA</h3>
                  <p className="text-gray-600 text-sm">
                    "How much chicken do we have?" or "Order more tomatoes" - 
                    HERA understands natural language and handles everything.
                  </p>
                </div>
                
                <div className="text-center space-y-4">
                  <div className="text-4xl">🧠</div>
                  <h3 className="font-semibold text-lg">AI Does the Work</h3>
                  <p className="text-gray-600 text-sm">
                    Predictive ordering, waste reduction, cost optimization, 
                    and compliance monitoring happen automatically in the background.
                  </p>
                </div>
                
                <div className="text-center space-y-4">
                  <div className="text-4xl">💰</div>
                  <h3 className="font-semibold text-lg">You Save Money</h3>
                  <p className="text-gray-600 text-sm">
                    Typical restaurants save 25-30% on food costs while 
                    improving quality and reducing waste through AI optimization.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Real Results from Real Restaurants
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  <p className="text-gray-700 mb-4 italic">
                    "{testimonial.quote}"
                  </p>
                  
                  <div className="space-y-2">
                    <div className="font-semibold text-gray-800">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.restaurant}
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      💰 Saves {testimonial.savings}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-12 text-white"
        >
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Restaurant?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            See how HERA's AI-powered inventory management works in real-time
          </p>
          
          <div className="space-y-4">
            <Link href="/restaurant/inventory">
              <Button 
                size="lg" 
                className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8 py-4 mr-4"
              >
                <Pizza className="mr-2 h-5 w-5" />
                Try Live Inventory Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <div className="text-sm opacity-75 mt-4">
              ✅ No signup required • ✅ Interactive demo • ✅ Real restaurant data
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

function RestaurantMainPageWithErrorBoundary() {
  return (
    <PageErrorBoundary pageName="Restaurant Management">
      <RestaurantMainPage />
    </PageErrorBoundary>
  );
}

export default RestaurantMainPageWithErrorBoundary;