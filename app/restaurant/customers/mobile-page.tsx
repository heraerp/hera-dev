'use client'

/**
 * HERA Universal - Mobile-Optimized Customer Management Page
 * Responsive design with touch-friendly interactions and smooth animations
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Search, Filter, Menu, X, ChevronRight, 
  Phone, Mail, Star, MoreVertical, Edit, Trash2,
  Users, TrendingUp, Heart, Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement'
import { CustomerServiceAdapter } from '@/lib/crud-configs/customer-service-adapter'
import { 
  mobileSlideUp, 
  staggerContainer, 
  staggerItem, 
  floatingCard, 
  magneticButton, 
  swipeToDelete, 
  pullToRefresh,
  touchRipple,
  createResponsiveAnimation,
  isMobile
} from '@/lib/animations/smooth-animations'

interface CustomerCard {
  id: string
  name: string
  email: string
  phone: string
  loyaltyTier: string
  totalSpent: number
  lastVisit: string
  customerType: string
  isActive: boolean
}

export default function MobileCustomerPage() {
  const { toast } = useToast()
  const { restaurantData, loading } = useRestaurantManagement()
  const [customers, setCustomers] = useState<CustomerCard[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [refreshing, setRefreshing] = useState(false)
  const [swipedItem, setSwipedItem] = useState<string | null>(null)
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 })
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 })

  // Load customers
  useEffect(() => {
    if (restaurantData?.organizationId) {
      loadCustomers()
    }
  }, [restaurantData?.organizationId])

  const loadCustomers = async () => {
    try {
      const organizationId = restaurantData?.organizationId
      if (!organizationId) return

      const result = await CustomerServiceAdapter.list(organizationId, {
        search: searchTerm,
        isActive: selectedFilter === 'active' ? true : selectedFilter === 'inactive' ? false : undefined
      })

      if (result.success) {
        setCustomers(result.data)
      }
    } catch (error) {
      console.error('Failed to load customers:', error)
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive",
      })
    }
  }

  // Pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true)
    await loadCustomers()
    setTimeout(() => setRefreshing(false), 1000)
  }

  // Handle swipe gestures
  const handleTouchStart = (e: React.TouchEvent, customerId: string) => {
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }

  const handleTouchMove = (e: React.TouchEvent, customerId: string) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }

  const handleTouchEnd = (customerId: string) => {
    if (!touchStart.x || !touchEnd.x) return

    const deltaX = touchStart.x - touchEnd.x
    const deltaY = touchStart.y - touchEnd.y
    
    // Horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 50) {
        // Swipe left - show delete option
        setSwipedItem(customerId)
      } else if (deltaX < -50) {
        // Swipe right - clear swiped item
        setSwipedItem(null)
      }
    }
    
    // Vertical swipe down - refresh
    if (deltaY < -100 && Math.abs(deltaX) < 50) {
      handleRefresh()
    }
  }

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'active' && customer.isActive) ||
                         (selectedFilter === 'inactive' && !customer.isActive) ||
                         (selectedFilter === 'vip' && customer.customerType === 'vip')
    
    return matchesSearch && matchesFilter
  })

  // Customer stats
  const stats = {
    total: customers.length,
    active: customers.filter(c => c.isActive).length,
    vip: customers.filter(c => c.customerType === 'vip').length,
    totalSpent: customers.reduce((sum, c) => sum + c.totalSpent, 0)
  }

  const getLoyaltyColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'bg-gray-800 text-white'
      case 'gold': return 'bg-yellow-500 text-white'
      case 'silver': return 'bg-gray-400 text-white'
      default: return 'bg-orange-600 text-white'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customers...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-sm sticky top-0 z-50"
      >
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            <motion.div variants={magneticButton}>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Customer
              </Button>
            </motion.div>
          </div>
          
          {/* Search and Filter */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setFilterOpen(!filterOpen)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Filter Panel */}
      <AnimatePresence>
        {filterOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-b overflow-hidden"
          >
            <div className="px-4 py-4">
              <div className="flex gap-2 flex-wrap">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'active', label: 'Active' },
                  { key: 'inactive', label: 'Inactive' },
                  { key: 'vip', label: 'VIP' }
                ].map(filter => (
                  <Button
                    key={filter.key}
                    variant={selectedFilter === filter.key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFilter(filter.key)}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="px-4 py-4"
      >
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Customers</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Spent</p>
                  <p className="text-2xl font-bold">${stats.totalSpent.toFixed(0)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Customer List */}
      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="px-4 pb-20"
      >
        <AnimatePresence>
          {filteredCustomers.map((customer, index) => (
            <motion.div
              key={customer.id}
              variants={staggerItem}
              layout
              onTouchStart={(e) => handleTouchStart(e, customer.id)}
              onTouchMove={(e) => handleTouchMove(e, customer.id)}
              onTouchEnd={() => handleTouchEnd(customer.id)}
              className="relative mb-4"
            >
              <motion.div
                animate={{
                  x: swipedItem === customer.id ? -80 : 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative"
              >
                <Card className="bg-white shadow-sm border-0">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                          <Badge className={getLoyaltyColor(customer.loyaltyTier)} variant="secondary">
                            {customer.loyaltyTier}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span>{customer.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span>{customer.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>Last visit: {customer.lastVisit}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="font-semibold text-green-600">${customer.totalSpent}</div>
                              <div className="text-xs text-gray-500">Total Spent</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-blue-600">{customer.customerType}</div>
                              <div className="text-xs text-gray-500">Type</div>
                            </div>
                          </div>
                          
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              {/* Swipe Actions */}
              <AnimatePresence>
                {swipedItem === customer.id && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="absolute right-0 top-0 h-full flex items-center"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-full px-6 bg-blue-500 text-white hover:bg-blue-600"
                      onClick={() => {
                        // Edit customer
                        setSwipedItem(null)
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-full px-6 bg-red-500 text-white hover:bg-red-600"
                      onClick={() => {
                        // Delete customer
                        setSwipedItem(null)
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Empty State */}
        {filteredCustomers.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Add your first customer to get started'}
            </p>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Customer
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Pull to Refresh Indicator */}
      <AnimatePresence>
        {refreshing && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-white rounded-full shadow-lg p-3 flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-700">Refreshing...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}