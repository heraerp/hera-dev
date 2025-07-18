'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building2, ChefHat, MapPin, Check, Plus, 
  ArrowRight, Users, Calendar, Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/revolutionary-card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export interface RestaurantOption {
  id: string
  name: string
  location?: string
  role: string
  industry: string
  isActive: boolean
  createdAt: string
  clientId: string
}

interface RestaurantSelectorProps {
  restaurants: RestaurantOption[]
  selectedRestaurant?: RestaurantOption | null
  onSelectRestaurant: (restaurant: RestaurantOption) => void
  onCreateNew?: () => void
  loading?: boolean
}

export default function RestaurantSelector({
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
  onCreateNew,
  loading = false
}: RestaurantSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    selectedRestaurant?.id || null
  )

  useEffect(() => {
    if (selectedRestaurant) {
      setSelectedId(selectedRestaurant.id)
    }
  }, [selectedRestaurant])

  const handleSelect = (restaurant: RestaurantOption) => {
    setSelectedId(restaurant.id)
    onSelectRestaurant(restaurant)
  }

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner': return 'bg-green-100 text-green-800'
      case 'manager': return 'bg-blue-100 text-blue-800'
      case 'staff': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRestaurantInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your restaurants...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Select Your Restaurant
        </h1>
        <p className="text-gray-600 text-lg">
          You have access to {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''}. 
          Choose one to continue to your dashboard.
        </p>
      </div>

      {/* Restaurant Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <AnimatePresence>
          {restaurants.map((restaurant, index) => (
            <motion.div
              key={restaurant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-xl ${
                  selectedId === restaurant.id 
                    ? 'ring-2 ring-blue-500 bg-gradient-to-br from-blue-50 to-purple-50' 
                    : 'hover:shadow-lg border-gray-200'
                }`}
                onClick={() => handleSelect(restaurant)}
              >
                <div className="flex items-start justify-between mb-4">
                  <Avatar className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600">
                    <AvatarFallback className="text-white font-bold text-lg">
                      {getRestaurantInitials(restaurant.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  {selectedId === restaurant.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                    >
                      <Check className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {restaurant.name}
                  </h3>
                  
                  {restaurant.location && (
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{restaurant.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 mb-3">
                    <ChefHat className="w-4 h-4 text-orange-600" />
                    <span className="text-sm text-gray-600 capitalize">
                      {restaurant.industry} Business
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge className={getRoleColor(restaurant.role)}>
                    {restaurant.role}
                  </Badge>
                  
                  <div className="flex items-center gap-1 text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span className="text-xs">
                      {new Date(restaurant.createdAt).getFullYear()}
                    </span>
                  </div>
                </div>

                {/* Active Status */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        restaurant.isActive ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm text-gray-600">
                        {restaurant.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    {selectedId === restaurant.id && (
                      <Button size="sm" className="h-7 text-xs">
                        Enter Dashboard
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Create New Restaurant Card */}
        {onCreateNew && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: restaurants.length * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className="p-6 cursor-pointer transition-all duration-300 hover:shadow-xl border-2 border-dashed border-gray-300 hover:border-blue-500 bg-gradient-to-br from-gray-50 to-blue-50"
              onClick={onCreateNew}
            >
              <div className="text-center h-full flex flex-col justify-center">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Create New Restaurant
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  Set up a new restaurant location with HERA Universal
                </p>
                
                <Button variant="outline" className="mt-auto">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Selected Restaurant Actions */}
      {selectedId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {restaurants.find(r => r.id === selectedId)?.name} Selected
                  </h4>
                  <p className="text-sm text-gray-600">
                    Ready to access your restaurant dashboard
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    const restaurant = restaurants.find(r => r.id === selectedId)
                    if (restaurant) {
                      // Select restaurant and go to setup wizard
                      onSelectRestaurant(restaurant)
                      window.location.href = '/restaurant/setup-wizard'
                    }
                  }}
                >
                  <ChefHat className="w-5 h-5 mr-2" />
                  Setup Wizard
                </Button>
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => {
                    const restaurant = restaurants.find(r => r.id === selectedId)
                    if (restaurant) {
                      onSelectRestaurant(restaurant)
                    }
                  }}
                >
                  Continue to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}