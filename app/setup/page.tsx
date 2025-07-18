'use client'

import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { 
  Store, Utensils, Building2, Package, Users, 
  ArrowRight, Sparkles, Zap, Shield, Globe,
  Search, Filter, Plus, Settings, Eye, 
  MapPin, Calendar, ChevronRight, Star, Info, 
  BarChart3, TrendingUp, AlertCircle, DollarSign,
  CheckCircle, Clock, Grid, List, Layers,
  Target, Rocket, HeartHandshake, Award
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/revolutionary-card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import SolutionDetailsModal from '@/components/setup/solution-details-modal'
import SolutionComparisonModal from '@/components/setup/solution-comparison-modal'
import ComingSoonCard from '@/components/setup/coming-soon-card'

const setupOptions = [
  {
    id: 'restaurant',
    title: 'Restaurant',
    description: 'Perfect for cafes, restaurants, and food service businesses',
    icon: Utensils,
    color: 'from-orange-500 to-red-600',
    bgColor: 'from-orange-50 to-red-50',
    features: ['Menu Management', 'Table Booking', 'ChefHat Display', 'Online Orders'],
    path: '/setup/restaurant',
    popular: true,
    category: 'food-service',
    size: 'small-medium',
    pricing: 'starter'
  },
  {
    id: 'retail',
    title: 'Retail Store',
    description: 'Ideal for shops, boutiques, and retail businesses',
    icon: Store,
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'from-blue-50 to-indigo-50',
    features: ['Inventory Control', 'Barcode Scanning', 'Customer Loyalty', 'Multi-location'],
    path: '/setup/retail',
    popular: false,
    category: 'retail',
    size: 'small-medium',
    pricing: 'professional',
    estimatedLaunch: 'Q2 2025'
  },
  {
    id: 'enterprise',
    title: 'Enterprise',
    description: 'Comprehensive solution for large organizations',
    icon: Building2,
    color: 'from-purple-500 to-pink-600',
    bgColor: 'from-purple-50 to-pink-50',
    features: ['Custom Workflows', 'Advanced Analytics', 'API Integration', 'Compliance'],
    path: '/setup/enterprise',
    popular: false,
    category: 'enterprise',
    size: 'large',
    pricing: 'enterprise',
    estimatedLaunch: 'Q3 2025'
  },
  {
    id: 'warehouse',
    title: 'Warehouse',
    description: 'Streamline your warehouse and logistics operations',
    icon: Package,
    color: 'from-green-500 to-emerald-600',
    bgColor: 'from-green-50 to-emerald-50',
    features: ['Stock Management', 'Order Fulfillment', 'Shipping Integration', 'WMS'],
    path: '/setup/warehouse',
    popular: false,
    category: 'logistics',
    size: 'medium-large',
    pricing: 'professional',
    estimatedLaunch: 'Q2 2025'
  },
  {
    id: 'professional-services',
    title: 'Professional Services',
    description: 'For consultants, agencies, and service-based businesses',
    icon: Users,
    color: 'from-teal-500 to-cyan-600',
    bgColor: 'from-teal-50 to-cyan-50',
    features: ['Project Management', 'Time Tracking', 'Client Portal', 'Billing'],
    path: '/setup/professional-services',
    popular: false,
    category: 'services',
    size: 'small-medium',
    pricing: 'professional',
    estimatedLaunch: 'Q1 2025'
  },
  {
    id: 'healthcare',
    title: 'Healthcare',
    description: 'Medical practices, clinics, and healthcare providers',
    icon: Building2,
    color: 'from-emerald-500 to-green-600',
    bgColor: 'from-emerald-50 to-green-50',
    features: ['Patient Management', 'Appointment Scheduling', 'EMR Integration', 'Compliance'],
    path: '/setup/healthcare',
    popular: false,
    category: 'healthcare',
    size: 'small-large',
    pricing: 'professional',
    estimatedLaunch: 'Q4 2025'
  },
  {
    id: 'private-wealth',
    title: 'Private Wealth Management',
    description: 'Ultra-high-net-worth portfolio management across global markets',
    icon: DollarSign,
    color: 'from-amber-500 to-yellow-600',
    bgColor: 'from-amber-50 to-yellow-50',
    features: ['Global Portfolio Tracking', 'Multi-Exchange Integration', 'Risk Analytics', 'Tax Optimization', 'Private Banking Integration', 'Real-Time Valuations'],
    path: '/setup/private-wealth',
    popular: false,
    category: 'wealth-management',
    size: 'enterprise',
    pricing: 'custom',
    estimatedLaunch: 'Q2 2025'
  }
]

// Mock organizations data
const mockOrganizations = [
  {
    id: 'org-1',
    name: 'The Golden Spoon',
    type: 'restaurant',
    location: 'New York, NY',
    status: 'active',
    lastActivity: '2024-01-15',
    setup: 'complete',
    users: 12,
    revenue: '$45,000'
  },
  {
    id: 'org-2', 
    name: 'Downtown Retail Co.',
    type: 'retail',
    location: 'Los Angeles, CA',
    status: 'active',
    lastActivity: '2024-01-14',
    setup: 'complete',
    users: 8,
    revenue: '$78,000'
  },
  {
    id: 'org-3',
    name: 'TechCorp Industries',
    type: 'enterprise',
    location: 'Seattle, WA',
    status: 'setup',
    lastActivity: '2024-01-13',
    setup: 'in-progress',
    users: 45,
    revenue: '$0'
  }
]

export default function SetupPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('solutions')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSize, setSelectedSize] = useState('all')
  const [organizations, setOrganizations] = useState(mockOrganizations)
  const [selectedSolution, setSelectedSolution] = useState<typeof setupOptions[0] | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showComparisonModal, setShowComparisonModal] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Filter solutions based on search and filters
  const filteredSolutions = setupOptions.filter(option => {
    const matchesSearch = option.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         option.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         option.features.some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || option.category === selectedCategory
    const matchesSize = selectedSize === 'all' || option.size.includes(selectedSize)
    
    return matchesSearch && matchesCategory && matchesSize
  })

  // Get category stats
  const categoryStats = {
    all: setupOptions.length,
    'food-service': setupOptions.filter(o => o.category === 'food-service').length,
    retail: setupOptions.filter(o => o.category === 'retail').length,
    enterprise: setupOptions.filter(o => o.category === 'enterprise').length,
    logistics: setupOptions.filter(o => o.category === 'logistics').length,
    services: setupOptions.filter(o => o.category === 'services').length,
    healthcare: setupOptions.filter(o => o.category === 'healthcare').length,
    'wealth-management': setupOptions.filter(o => o.category === 'wealth-management').length
  }

  const handleSolutionClick = (solution: typeof setupOptions[0], action: 'select' | 'details') => {
    if (action === 'details') {
      setSelectedSolution(solution)
      setShowDetailsModal(true)
    } else {
      router.push(solution.path)
    }
  }

  return (
    <div className="min-h-screen relative">
      {/* Enhanced Background with Multiple Layers */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50" />
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-50/20 via-transparent to-purple-50/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tl from-orange-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Enhanced Header with Glass Morphism */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/40 to-transparent backdrop-blur-sm" />
        <div className="max-w-7xl mx-auto px-6 py-20 relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Badge variant="secondary" className="gap-2 mb-6 px-4 py-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-200 text-orange-700">
                <Sparkles className="w-4 h-4" />
                HERA Universal Platform
              </Badge>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent leading-tight"
            >
              Choose Your Business Solution
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            >
              Discover intelligent SMB solutions, manage your organizations, and scale your business with our Universal Architecture
            </motion.p>

            {/* Quick Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex items-center justify-center gap-8 mt-8"
            >
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>1 Solution Ready</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-orange-500" />
                <span>6 Coming Soon</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Target className="w-4 h-4 text-blue-500" />
                <span>100% Universal</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Main Content with Glass Morphism */}
      <div className="max-w-7xl mx-auto px-6 pb-20 -mt-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <Card variant="glass" className="p-0 overflow-hidden backdrop-blur-xl bg-white/80 border-white/20 shadow-2xl">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Enhanced Tab Header */}
              <div className="border-b border-white/20 bg-gradient-to-r from-white/40 to-white/60 backdrop-blur-sm">
                <TabsList className="grid w-full grid-cols-2 bg-transparent border-none h-16">
                  <TabsTrigger 
                    value="solutions" 
                    className="py-5 px-8 data-[state=active]:bg-white/50 data-[state=active]:shadow-lg data-[state=active]:border-white/30 transition-all duration-300"
                  >
                    <Layers className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-semibold">Browse Solutions</div>
                      <div className="text-xs text-gray-500 mt-0.5">Discover perfect fit for your business</div>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="organizations" 
                    className="py-5 px-8 data-[state=active]:bg-white/50 data-[state=active]:shadow-lg data-[state=active]:border-white/30 transition-all duration-300"
                  >
                    <Building2 className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-semibold">My Organizations</div>
                      <div className="text-xs text-gray-500 mt-0.5">Manage your existing businesses</div>
                    </div>
                  </TabsTrigger>
                </TabsList>
              </div>

            <TabsContent value="solutions" className="p-8 space-y-8">
              {/* Enhanced Search and Filters Section */}
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">Find Your Perfect Solution</h2>
                  <p className="text-gray-600">Choose from our comprehensive suite of business solutions</p>
                </div>
                
                <div className="bg-gradient-to-r from-gray-50/50 to-blue-50/50 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                  <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 max-w-lg">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        placeholder="Search solutions, features, or business types..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-4 py-3 bg-white/70 backdrop-blur-sm border-white/40 focus:bg-white/90 transition-all duration-300 text-lg"
                      />
                      {searchTerm && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSearchTerm('')}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-[180px] bg-white/70 backdrop-blur-sm border-white/40 focus:bg-white/90">
                          <Filter className="w-4 h-4 mr-2 text-gray-500" />
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 backdrop-blur-md border-white/40">
                          <SelectItem value="all">All Categories ({categoryStats.all})</SelectItem>
                          <SelectItem value="food-service">🍽️ Food Service ({categoryStats['food-service']})</SelectItem>
                          <SelectItem value="retail">🛍️ Retail ({categoryStats.retail})</SelectItem>
                          <SelectItem value="enterprise">🏢 Enterprise ({categoryStats.enterprise})</SelectItem>
                          <SelectItem value="logistics">📦 Logistics ({categoryStats.logistics})</SelectItem>
                          <SelectItem value="services">⚡ Services ({categoryStats.services})</SelectItem>
                          <SelectItem value="healthcare">🏥 Healthcare ({categoryStats.healthcare})</SelectItem>
                          <SelectItem value="wealth-management">💎 Wealth ({categoryStats['wealth-management']})</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={selectedSize} onValueChange={setSelectedSize}>
                        <SelectTrigger className="w-[140px] bg-white/70 backdrop-blur-sm border-white/40 focus:bg-white/90">
                          <SelectValue placeholder="Size" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 backdrop-blur-md border-white/40">
                          <SelectItem value="all">All Sizes</SelectItem>
                          <SelectItem value="small">Small Team</SelectItem>
                          <SelectItem value="medium">Growing Business</SelectItem>
                          <SelectItem value="large">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowComparisonModal(true)}
                          className="gap-2 bg-white/70 backdrop-blur-sm border-white/40 hover:bg-white/90"
                        >
                          <BarChart3 className="w-4 h-4" />
                          Compare
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                          className="gap-2 bg-white/70 backdrop-blur-sm border-white/40 hover:bg-white/90"
                        >
                          {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                          {viewMode === 'grid' ? 'List' : 'Grid'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Filter Tags */}
                  {(searchTerm || selectedCategory !== 'all' || selectedSize !== 'all') && (
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/30">
                      <span className="text-sm text-gray-600 mr-2">Active filters:</span>
                      {searchTerm && (
                        <Badge variant="secondary" className="gap-1">
                          Search: "{searchTerm}"
                          <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-red-600">×</button>
                        </Badge>
                      )}
                      {selectedCategory !== 'all' && (
                        <Badge variant="secondary" className="gap-1">
                          Category: {selectedCategory}
                          <button onClick={() => setSelectedCategory('all')} className="ml-1 hover:text-red-600">×</button>
                        </Badge>
                      )}
                      {selectedSize !== 'all' && (
                        <Badge variant="secondary" className="gap-1">
                          Size: {selectedSize}
                          <button onClick={() => setSelectedSize('all')} className="ml-1 hover:text-red-600">×</button>
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Solutions Grid with Clear Separation */}
              <div className="space-y-8">
                {/* Available Solutions Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Ready to Deploy</h3>
                      <p className="text-sm text-gray-600">Production-ready solutions you can set up immediately</p>
                    </div>
                  </div>
                  
                  <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                    {filteredSolutions.filter(option => option.id === 'restaurant').map((option, index) => (
                      <motion.div
                        key={option.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group"
                      >
                        <Card 
                          variant="elevated" 
                          className="relative overflow-hidden h-full hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 border-2 border-green-200/50 hover:border-green-300"
                        >
                          {/* Enhanced Background with Depth */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${option.bgColor} opacity-40 group-hover:opacity-60 transition-all duration-500`} />
                          <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
                          
                          {/* Status Badges */}
                          <div className="absolute top-4 right-4 flex gap-2">
                            <Badge className="gap-1 bg-green-500 text-white shadow-lg">
                              <CheckCircle className="w-3 h-3" />
                              Ready Now
                            </Badge>
                            {option.popular && (
                              <Badge className="gap-1 bg-orange-500 text-white shadow-lg">
                                <Star className="w-3 h-3" />
                                Popular
                              </Badge>
                            )}
                          </div>

                          <div className="relative p-6 space-y-5">
                            {/* Enhanced Icon */}
                            <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${option.color} shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                              <option.icon className="w-10 h-10 text-white" />
                            </div>

                            {/* Enhanced Header */}
                            <div className="space-y-2">
                              <h3 className="text-2xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                                {option.title}
                              </h3>
                              <p className="text-gray-600 leading-relaxed">{option.description}</p>
                            </div>

                            {/* Enhanced Features List */}
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold text-gray-700 mb-3">Key Features:</h4>
                              <div className="grid grid-cols-1 gap-2">
                                {option.features.map((feature) => (
                                  <div key={feature} className="flex items-center gap-3 text-sm text-gray-700">
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <span>{feature}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

                            {/* Enhanced Metadata */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {option.category.replace('-', ' ')}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {option.size.replace('-', ' ')}
                                </Badge>
                              </div>
                              <div className="text-xs text-gray-500 font-medium">
                                {option.pricing} plan
                              </div>
                            </div>

                            {/* Enhanced Action Buttons */}
                            <div className="flex gap-3 pt-2">
                              <Button 
                                variant="outline"
                                size="sm"
                                className="flex-1 group/btn hover:bg-gray-50"
                                onClick={() => handleSolutionClick(option, 'details')}
                              >
                                <Info className="w-4 h-4 mr-2" />
                                Learn More
                              </Button>
                              <Button 
                                variant="default" 
                                size="sm"
                                className="flex-1 group/btn bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
                                onClick={() => handleSolutionClick(option, 'select')}
                              >
                                <Rocket className="w-4 h-4 mr-2" />
                                Start Setup
                                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Coming Soon Solutions Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Coming Soon</h3>
                      <p className="text-sm text-gray-600">Exciting solutions in development - reserve your spot</p>
                    </div>
                  </div>
                  
                  <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                    {filteredSolutions.filter(option => option.id !== 'restaurant').map((option, index) => (
                      <motion.div
                        key={option.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (index + 1) * 0.1 }}
                      >
                        <ComingSoonCard
                          id={option.id}
                          title={option.title}
                          description={option.description}
                          icon={option.icon}
                          color={option.color}
                          bgColor={option.bgColor}
                          features={option.features}
                          category={option.category}
                          estimatedLaunch={option.estimatedLaunch}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {filteredSolutions.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-500 mb-4">No solutions found matching your criteria</div>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedCategory('all')
                      setSelectedSize('all')
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="organizations" className="p-8 space-y-8">
              <div className="text-center space-y-4 mb-8">
                <Badge variant="secondary" className="gap-2 mb-4 px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-200 text-indigo-700">
                  <Building2 className="w-4 h-4" />
                  Organization Hub
                </Badge>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Your Business Portfolio
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Centralized control panel for all your organizations with real-time insights and management tools
                </p>
              </div>

              <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-6 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 backdrop-blur-sm rounded-2xl border border-white/30">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Multi-Organization Management</h3>
                    <p className="text-gray-600">Seamlessly switch between and manage multiple businesses</p>
                  </div>
                </div>
                <Button 
                  className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg px-6 py-3"
                  size="lg"
                >
                  <Plus className="w-5 h-5" />
                  Add New Business
                </Button>
              </div>

              {/* Enhanced Organization Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card variant="glass" className="p-6 backdrop-blur-md bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border-blue-200/30 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-3xl font-bold text-gray-900">{organizations.length}</div>
                        <div className="text-sm text-gray-600 font-medium">Total Organizations</div>
                        <div className="text-xs text-blue-600 mt-1">All businesses under management</div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
                
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card variant="glass" className="p-6 backdrop-blur-md bg-gradient-to-br from-green-50/50 to-emerald-50/50 border-green-200/30 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-3xl font-bold text-gray-900">
                          {organizations.filter(o => o.status === 'active').length}
                        </div>
                        <div className="text-sm text-gray-600 font-medium">Active Businesses</div>
                        <div className="text-xs text-green-600 mt-1">Currently operational</div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
                
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card variant="glass" className="p-6 backdrop-blur-md bg-gradient-to-br from-orange-50/50 to-red-50/50 border-orange-200/30 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-3xl font-bold text-gray-900">
                          {organizations.reduce((sum, org) => sum + org.users, 0)}
                        </div>
                        <div className="text-sm text-gray-600 font-medium">Total Users</div>
                        <div className="text-xs text-orange-600 mt-1">Across all organizations</div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </div>

              {/* Enhanced Organization List */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">Your Organizations</h3>
                <div className="grid gap-6">
                  {organizations.map((org, index) => (
                    <motion.div
                      key={org.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -2 }}
                    >
                      <Card 
                        variant="glass" 
                        className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer backdrop-blur-md bg-white/70 border-white/30 group"
                        onClick={() => router.push(`/${org.type}/dashboard`)}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                          <div className="flex items-center gap-6">
                            <div className="relative">
                              <Avatar className="w-16 h-16 shadow-lg">
                                <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                                  {org.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                                org.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                              }`} />
                            </div>
                            
                            <div className="space-y-2">
                              <h3 className="font-bold text-xl text-gray-900 group-hover:text-indigo-600 transition-colors">
                                {org.name}
                              </h3>
                              <div className="flex items-center gap-3 text-gray-600">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  <span className="text-sm">{org.location}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span className="text-sm">Active {org.lastActivity}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={org.status === 'active' ? 'default' : 'secondary'}
                                  className={org.status === 'active' ? 'bg-green-500 text-white' : ''}
                                >
                                  {org.status === 'active' ? 'Active' : 'Setup Required'}
                                </Badge>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {org.type}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap lg:flex-nowrap items-center gap-6">
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 text-center">
                              <div className="space-y-1">
                                <div className="text-sm text-gray-500">Revenue</div>
                                <div className="font-bold text-lg text-gray-900">{org.revenue}</div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-sm text-gray-500">Users</div>
                                <div className="font-bold text-lg text-gray-900">{org.users}</div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-sm text-gray-500">Setup</div>
                                <div className="font-bold text-lg text-gray-900 capitalize">{org.setup}</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                title="Settings"
                                className="hover:bg-gray-100/80"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  // Handle settings
                                }}
                              >
                                <Settings className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                title="View Dashboard"
                                className="hover:bg-indigo-100/80"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  router.push(`/${org.type}/dashboard`)
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                            </div>
                          </div>
                        </div>
                        
                        {org.setup === 'in-progress' && (
                          <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200/50 rounded-xl">
                            <div className="flex items-center gap-3 text-yellow-800">
                              <AlertCircle className="w-5 h-5" />
                              <div>
                                <div className="font-medium">Setup in Progress</div>
                                <div className="text-sm text-yellow-700 mt-1">
                                  Complete your organization setup to unlock all features and start processing transactions
                                </div>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              className="mt-3 bg-yellow-600 hover:bg-yellow-700 text-white"
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/setup/${org.type}`)
                              }}
                            >
                              Continue Setup
                            </Button>
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {organizations.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏢</div>
                  <div className="text-xl font-semibold mb-2">No organizations yet</div>
                  <div className="text-gray-500 mb-6">
                    Get started by adding your first business to the platform
                  </div>
                  <Button size="lg" className="gap-2">
                    <Plus className="w-5 h-5" />
                    Add Your First Business
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>

        {/* Enhanced Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-20"
        >
          <Card variant="glass" className="p-10 backdrop-blur-xl bg-gradient-to-br from-white/90 to-white/70 border-white/30 shadow-2xl">
            <div className="text-center space-y-4 mb-12">
              <Badge variant="secondary" className="gap-2 mb-4 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-200 text-blue-700">
                <Award className="w-4 h-4" />
                Why HERA Universal?
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                The Future of Business Management
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Experience the power of Universal Architecture designed for modern businesses
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div 
                className="text-center space-y-4 group"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="inline-flex p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Lightning Fast Setup</h3>
                <p className="text-gray-600 leading-relaxed">
                  Deploy in under 5 minutes with our AI-powered setup wizard. No technical expertise required.
                </p>
                <div className="text-sm text-green-600 font-medium">
                  ⚡ 90% faster than traditional ERP
                </div>
              </motion.div>
              
              <motion.div 
                className="text-center space-y-4 group"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="inline-flex p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Bank-Grade Security</h3>
                <p className="text-gray-600 leading-relaxed">
                  Enterprise security with advanced encryption, role-based access, and SOC 2 compliance.
                </p>
                <div className="text-sm text-blue-600 font-medium">
                  🛡️ Zero security incidents to date
                </div>
              </motion.div>
              
              <motion.div 
                className="text-center space-y-4 group"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="inline-flex p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Universal Architecture</h3>
                <p className="text-gray-600 leading-relaxed">
                  One platform, infinite possibilities. Scale from startup to enterprise without limits.
                </p>
                <div className="text-sm text-purple-600 font-medium">
                  🌍 Supports any business model
                </div>
              </motion.div>
            </div>

            {/* Additional Benefits */}
            <div className="mt-12 pt-8 border-t border-gray-200/50">
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-orange-600">99.9%</div>
                  <div className="text-sm text-gray-600">Uptime SLA</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-green-600">5 min</div>
                  <div className="text-sm text-gray-600">Average Setup</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-blue-600">24/7</div>
                  <div className="text-sm text-gray-600">Expert Support</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-purple-600">∞</div>
                  <div className="text-sm text-gray-600">Scalability</div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Enhanced CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <Card variant="glass" className="p-8 backdrop-blur-sm bg-gradient-to-r from-orange-50/50 to-red-50/50 border-orange-200/30">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-orange-700">
                <HeartHandshake className="w-5 h-5" />
                <span className="font-medium">Need Help Choosing?</span>
              </div>
              <p className="text-gray-700 text-lg">
                Our solution architects are standing by to help you find the perfect fit for your business.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
                <Button 
                  variant="default" 
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
                >
                  <HeartHandshake className="w-5 h-5" />
                  Talk to an Expert
                </Button>
                <Button variant="outline" size="lg" className="gap-2">
                  <Eye className="w-5 h-5" />
                  Schedule Demo
                </Button>
                <Button variant="ghost" size="lg" className="gap-2 text-gray-600">
                  <Info className="w-5 h-5" />
                  View Pricing
                </Button>
              </div>
              <div className="text-sm text-gray-500 mt-4">
                Free consultation • No commitment • 30-day money-back guarantee
              </div>
            </div>
          </Card>
        </motion.div>
        </motion.div>
      </div>

      {/* Modals */}
      <SolutionDetailsModal
        solution={selectedSolution}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onSelect={(path) => router.push(path)}
      />
      
      <SolutionComparisonModal
        solutions={setupOptions}
        isOpen={showComparisonModal}
        onClose={() => setShowComparisonModal(false)}
        onSelect={(solutionId) => {
          const solution = setupOptions.find(s => s.id === solutionId)
          if (solution) {
            router.push(solution.path)
          }
        }}
      />
    </div>
  )
}