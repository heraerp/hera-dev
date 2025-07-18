'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import RestaurantSelector from '@/components/restaurant/RestaurantSelector'
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement'
import { Card } from '@/components/ui/revolutionary-card'
import { Loader2 } from 'lucide-react'

export default function RestaurantSelectPage() {
  const router = useRouter()
  const { 
    allRestaurants, 
    selectedRestaurant, 
    hasMultipleRestaurants,
    loading, 
    error,
    selectRestaurant 
  } = useRestaurantManagement()

  // If user has only one restaurant, redirect to dashboard
  useEffect(() => {
    if (!loading && !hasMultipleRestaurants && selectedRestaurant) {
      router.push('/restaurant/dashboard')
    }
  }, [loading, hasMultipleRestaurants, selectedRestaurant, router])

  const handleSelectRestaurant = (restaurant: any) => {
    selectRestaurant(restaurant)
    // Check if user wants to go to setup wizard (from URL parameter)
    const urlParams = new URLSearchParams(window.location.search)
    const redirectTo = urlParams.get('redirect') || '/restaurant/dashboard'
    router.push(redirectTo)
  }

  const handleCreateNew = () => {
    router.push('/setup/restaurant')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your restaurants...</p>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Restaurant Found</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={handleCreateNew}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Set Up Restaurant
          </button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <RestaurantSelector
        restaurants={allRestaurants}
        selectedRestaurant={selectedRestaurant}
        onSelectRestaurant={handleSelectRestaurant}
        onCreateNew={handleCreateNew}
      />
    </div>
  )
}