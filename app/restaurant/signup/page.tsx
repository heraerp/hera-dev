"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { 
  ChefHat, Mail, Building, MapPin, Phone, Users, 
  Utensils, CheckCircle, ArrowRight, ArrowLeft, 
  Eye, EyeOff, Lock, User, Store, Calendar,
  Sparkles, Shield, Zap
} from 'lucide-react'
import { Card } from '@/components/ui/revolutionary-card'
import { Button } from '@/components/ui/revolutionary-button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import UniversalCrudService from '@/lib/services/universalCrudService'
import { useRouter } from 'next/navigation'

// Step types for the registration flow
type RegistrationStep = 'account' | 'restaurant' | 'complete'

interface UserData {
  email: string
  password: string
  fullName: string
  phone: string
}

interface RestaurantData {
  restaurantName: string
  businessType: string
  cuisine: string
  location: string
  seats: string
  openingDate: string
}

// Steve Krug Principle: Clear visual progression
const steps = [
  { id: 'account', title: '👤 Your Account', description: 'Basic account information' },
  { id: 'restaurant', title: '🍕 Restaurant Details', description: 'Tell us about your business' },
  { id: 'complete', title: '✅ All Set!', description: 'Welcome to HERA' }
]

export default function RestaurantSignup() {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('account')
  const [userData, setUserData] = useState<UserData>({
    email: '',
    password: '',
    fullName: '',
    phone: ''
  })
  const [restaurantData, setRestaurantData] = useState<RestaurantData>({
    restaurantName: '',
    businessType: '',
    cuisine: '',
    location: '',
    seats: '',
    openingDate: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const supabase = createClient()
  const router = useRouter()

  // Steve Krug Principle: Minimal cognitive load - validate as user types
  const isAccountStepValid = userData.email && userData.password && userData.fullName && userData.phone
  const isRestaurantStepValid = restaurantData.restaurantName && restaurantData.businessType && 
                               restaurantData.cuisine && restaurantData.location && restaurantData.seats

  const handleUserDataChange = (field: keyof UserData, value: string) => {
    setUserData(prev => ({ ...prev, [field]: value }))
    setError(null) // Clear errors on input
  }

  const handleRestaurantDataChange = (field: keyof RestaurantData, value: string) => {
    setRestaurantData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  // Steve Krug Principle: Clear feedback on actions
  const handleNext = () => {
    if (currentStep === 'account' && isAccountStepValid) {
      setCurrentStep('restaurant')
    } else if (currentStep === 'restaurant' && isRestaurantStepValid) {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep === 'restaurant') {
      setCurrentStep('account')
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Step 1: Create Supabase Auth user (automatically creates core_users via trigger)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
            phone: userData.phone
          }
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to create user account')

      // Wait a moment for the trigger to create core_users record
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Step 2: Create the client (umbrella company/group) - following HERA schema
      const clientId = crypto.randomUUID()
      const { data: client, error: clientError } = await supabase
        .from('core_clients')
        .insert({
          id: clientId,
          client_name: `${restaurantData.restaurantName} Holdings`,
          client_code: `${restaurantData.restaurantName.slice(0, 3).toUpperCase()}${Date.now().toString().slice(-3)}`,
          client_type: 'restaurant_group',
          is_active: true
        })
        .select()
        .single()

      if (clientError) throw new Error(`Failed to create client: ${clientError.message}`)

      // Step 3: Create the organization - following HERA schema
      const organizationId = crypto.randomUUID()
      const { data: organization, error: orgError } = await supabase
        .from('core_organizations')
        .insert({
          id: organizationId,
          client_id: clientId,
          name: restaurantData.restaurantName,
          org_code: `${restaurantData.restaurantName.slice(0, 3).toUpperCase()}${Date.now().toString().slice(-3)}`,
          industry: 'restaurant',
          country: 'US',
          currency: 'USD',
          is_active: true
        })
        .select()
        .single()

      if (orgError) throw new Error(`Failed to create organization: ${orgError.message}`)

      // Step 4: Link user to organization with owner role
      const { error: linkError } = await supabase
        .from('user_organizations')
        .insert({
          id: crypto.randomUUID(),
          user_id: authData.user.id,
          organization_id: organizationId,
          role: 'owner',
          is_active: true
        })

      if (linkError) console.warn('Failed to link user to organization:', linkError)

      // Step 5: Create restaurant entity using universal pattern
      const restaurantEntityId = crypto.randomUUID()
      const { data: restaurantEntity, error: entityError } = await supabase
        .from('core_entities')
        .insert({
          id: restaurantEntityId,
          organization_id: organizationId,
          entity_type: 'restaurant',
          entity_name: restaurantData.restaurantName,
          entity_code: `REST-${Date.now().toString().slice(-6)}`,
          entity_description: `${restaurantData.cuisine} restaurant in ${restaurantData.location}`,
          is_active: true
        })
        .select()
        .single()

      if (entityError) throw new Error(`Failed to create restaurant entity: ${entityError.message}`)

      // Step 6: Store restaurant details in dynamic data
      const dynamicDataEntries = [
        { entity_id: restaurantEntityId, field_name: 'business_type', field_value: restaurantData.businessType, field_type: 'text' },
        { entity_id: restaurantEntityId, field_name: 'cuisine_type', field_value: restaurantData.cuisine, field_type: 'text' },
        { entity_id: restaurantEntityId, field_name: 'location', field_value: restaurantData.location, field_type: 'text' },
        { entity_id: restaurantEntityId, field_name: 'seating_capacity', field_value: restaurantData.seats, field_type: 'number' },
        { entity_id: restaurantEntityId, field_name: 'opening_date', field_value: restaurantData.openingDate || new Date().toISOString(), field_type: 'date' },
        { entity_id: restaurantEntityId, field_name: 'owner_name', field_value: userData.fullName, field_type: 'text' },
        { entity_id: restaurantEntityId, field_name: 'owner_phone', field_value: userData.phone, field_type: 'text' },
        { entity_id: restaurantEntityId, field_name: 'registration_date', field_value: new Date().toISOString(), field_type: 'timestamp' }
      ]

      const { error: dynamicError } = await supabase
        .from('core_dynamic_data')
        .insert(dynamicDataEntries.map(entry => ({
          ...entry,
          is_encrypted: false
        })))

      if (dynamicError) console.warn('Failed to store restaurant details:', dynamicError)

      setCurrentStep('complete')
      setSuccess(true)

      // Redirect to restaurant dashboard after 3 seconds
      setTimeout(() => {
        router.push('/restaurant/dashboard')
      }, 3000)

    } catch (error: any) {
      console.error('Registration error:', error)
      setError(error.message || 'Failed to create your restaurant account. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Steve Krug Principle: Clear visual hierarchy and progress indication
  const ProgressIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep
        const isCompleted = steps.findIndex(s => s.id === currentStep) > index
        
        return (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
              isCompleted ? 'bg-green-500 border-green-500 text-white' :
              isActive ? 'bg-orange-500 border-orange-500 text-white' :
              'bg-gray-200 border-gray-300 text-gray-500'
            }`}>
              {isCompleted ? <CheckCircle className="w-6 h-6" /> : 
               <span className="text-sm font-bold">{index + 1}</span>}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-1 mx-2 ${
                isCompleted ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )

  if (currentStep === 'complete' && success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Card variant="glass" className="p-12 max-w-md">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-12 h-12 text-green-600" />
            </motion.div>
            
            <h2 className="text-3xl font-bold text-green-800 mb-4">Welcome to HERA! 🎉</h2>
            <p className="text-green-600 mb-6">
              Your restaurant account has been created successfully. You're all set to start managing your business with AI-powered tools.
            </p>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Account created and verified</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Restaurant profile configured</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Universal schema initialized</span>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6">Redirecting to your dashboard...</p>
            
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-500 to-red-600"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 3 }}
              />
            </div>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mb-4">
              <ChefHat className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Start Your Restaurant Journey
            </h1>
            <p className="text-xl text-muted-foreground">
              Join HERA's AI-powered restaurant management platform
            </p>
            
            {/* Benefits badges */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <Badge className="bg-green-100 text-green-800">
                <Zap className="w-3 h-3 mr-1" />
                5-min setup
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                <Shield className="w-3 h-3 mr-1" />
                Secure & compliant
              </Badge>
              <Badge className="bg-purple-100 text-purple-800">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-powered
              </Badge>
            </div>
          </motion.div>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator />

        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="glass" className="p-8">
            <AnimatePresence mode="wait">
              
              {/* Step 1: Account Information */}
              {currentStep === 'account' && (
                <motion.div
                  key="account"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold mb-2">👤 Create Your Account</h2>
                    <p className="text-muted-foreground">Let's start with your basic information</p>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="text"
                        value={userData.fullName}
                        onChange={(e) => handleUserDataChange('fullName', e.target.value)}
                        placeholder="e.g., Sarah Chen"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="email"
                        value={userData.email}
                        onChange={(e) => handleUserDataChange('email', e.target.value)}
                        placeholder="sarah@zenteagarden.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={userData.password}
                        onChange={(e) => handleUserDataChange('password', e.target.value)}
                        placeholder="Create a secure password"
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? 
                          <EyeOff className="w-4 h-4 text-muted-foreground" /> : 
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        }
                      </button>
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="tel"
                        value={userData.phone}
                        onChange={(e) => handleUserDataChange('phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Restaurant Information */}
              {currentStep === 'restaurant' && (
                <motion.div
                  key="restaurant"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold mb-2">🍕 Restaurant Details</h2>
                    <p className="text-muted-foreground">Tell us about your business</p>
                  </div>

                  {/* Restaurant Name */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Restaurant Name *
                    </label>
                    <div className="relative">
                      <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="text"
                        value={restaurantData.restaurantName}
                        onChange={(e) => handleRestaurantDataChange('restaurantName', e.target.value)}
                        placeholder="e.g., Zen Tea Garden"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {/* Business Type */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Business Type *
                    </label>
                    <Select onValueChange={(value) => handleRestaurantDataChange('businessType', value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="restaurant">Full-Service Restaurant</SelectItem>
                        <SelectItem value="cafe">Cafe/Coffee Shop</SelectItem>
                        <SelectItem value="fast_casual">Fast Casual</SelectItem>
                        <SelectItem value="food_truck">Food Truck</SelectItem>
                        <SelectItem value="bakery">Bakery</SelectItem>
                        <SelectItem value="bar">Bar/Pub</SelectItem>
                        <SelectItem value="catering">Catering Service</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cuisine Type */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Cuisine Type *
                    </label>
                    <Select onValueChange={(value) => handleRestaurantDataChange('cuisine', value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cuisine type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="american">American</SelectItem>
                        <SelectItem value="italian">Italian</SelectItem>
                        <SelectItem value="chinese">Chinese</SelectItem>
                        <SelectItem value="mexican">Mexican</SelectItem>
                        <SelectItem value="indian">Indian</SelectItem>
                        <SelectItem value="japanese">Japanese</SelectItem>
                        <SelectItem value="thai">Thai</SelectItem>
                        <SelectItem value="mediterranean">Mediterranean</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                        <SelectItem value="seafood">Seafood</SelectItem>
                        <SelectItem value="vegetarian">Vegetarian/Vegan</SelectItem>
                        <SelectItem value="fusion">Fusion</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Location *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="text"
                        value={restaurantData.location}
                        onChange={(e) => handleRestaurantDataChange('location', e.target.value)}
                        placeholder="e.g., New York, NY"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {/* Seating Capacity */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Seating Capacity *
                    </label>
                    <Select onValueChange={(value) => handleRestaurantDataChange('seats', value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select seating capacity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-25">Small (1-25 seats)</SelectItem>
                        <SelectItem value="26-75">Medium (26-75 seats)</SelectItem>
                        <SelectItem value="76-150">Large (76-150 seats)</SelectItem>
                        <SelectItem value="150+">Extra Large (150+ seats)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Opening Date (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Opening Date (Optional)
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="date"
                        value={restaurantData.openingDate}
                        onChange={(e) => handleRestaurantDataChange('openingDate', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-red-100 border border-red-300 rounded-lg"
              >
                <p className="text-red-700 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 'account'}
                className={currentStep === 'account' ? 'invisible' : ''}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <Button
                type="button"
                onClick={handleNext}
                disabled={
                  (currentStep === 'account' && !isAccountStepValid) ||
                  (currentStep === 'restaurant' && (!isRestaurantStepValid || isSubmitting))
                }
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : currentStep === 'restaurant' ? (
                  'Create Restaurant'
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-8 text-muted-foreground text-sm">
          <p>Already have an account? <a href="/restaurant/login" className="text-primary hover:underline">Sign in here</a></p>
        </div>
      </div>
    </div>
  )
}