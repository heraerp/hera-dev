'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building2, MapPin, Users, Settings, ArrowRight, ArrowLeft, 
  Check, Store, Phone, Mail, Globe, Calendar, Clock,
  ChefHat, Utensils, CreditCard, Shield, Sparkles, Loader2, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/revolutionary-card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import UniversalCrudService from '@/lib/services/universalCrudService'

// Initialize Supabase client
const supabase = createClient()

interface RestaurantSetupData {
  // Client Information
  businessName: string
  businessType: string
  cuisineType: string
  establishedYear: string
  
  // Organization Information
  locationName: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  currency: string
  
  // Contact Information
  primaryPhone: string
  businessEmail: string
  website: string
  
  // Operations
  openingTime: string
  closingTime: string
  seatingCapacity: string
  
  // Manager Information
  managerName: string
  managerEmail: string
  managerPhone: string
}

interface SetupProgress {
  step: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  message: string
  error?: string
}

interface SetupStep {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  status: 'pending' | 'current' | 'completed'
}

export default function RestaurantSetupPageDirect() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [setupProgress, setSetupProgress] = useState<SetupProgress | null>(null)
  const [setupError, setSetupError] = useState<string | null>(null)
  const [setupSuccess, setSetupSuccess] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])
  
  const [setupData, setSetupData] = useState<RestaurantSetupData>({
    // Client Information
    businessName: '',
    businessType: 'restaurant_chain',
    cuisineType: '',
    establishedYear: new Date().getFullYear().toString(),
    
    // Organization Information
    locationName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    currency: 'INR',
    
    // Contact Information
    primaryPhone: '',
    businessEmail: '',
    website: '',
    
    // Operations
    openingTime: '07:00',
    closingTime: '23:00',
    seatingCapacity: '',
    
    // Manager Information
    managerName: '',
    managerEmail: '',
    managerPhone: ''
  })

  // Test Supabase connection on component mount
  useEffect(() => {
    testSupabaseConnection()
  }, [])

  const testSupabaseConnection = async () => {
    console.log('🔍 Testing Supabase connection...')
    const results: any[] = []
    
    try {
      // Test 1: Check if universal_transactions table exists
      console.log('📊 Checking universal_transactions table...')
      const { data: universalTransactions, error: universalError } = await supabase
        .from('universal_transactions')
        .select('*')
        .limit(1)
      
      if (universalError) {
        console.error('❌ universal_transactions table error:', universalError)
        results.push({ table: 'universal_transactions', status: 'error', error: universalError.message })
      } else {
        console.log('✅ universal_transactions table exists, records:', universalTransactions?.length || 0)
        results.push({ table: 'universal_transactions', status: 'success', count: universalTransactions?.length || 0 })
      }

      // Test 2: Check if core_entities table exists
      console.log('📊 Checking core_entities table...')
      const { data: entities, error: entitiesError } = await supabase
        .from('core_entities')
        .select('*')
        .limit(1)
      
      if (entitiesError) {
        console.error('❌ core_entities table error:', entitiesError)
        results.push({ table: 'core_entities', status: 'error', error: entitiesError.message })
      } else {
        console.log('✅ core_entities table exists, records:', entities?.length || 0)
        results.push({ table: 'core_entities', status: 'success', count: entities?.length || 0 })
      }

      // Test 3: Check if core_clients table exists
      console.log('📊 Checking core_clients table...')
      const { data: clients, error: clientsError } = await supabase
        .from('core_clients')
        .select('*')
        .limit(1)
      
      if (clientsError) {
        console.error('❌ core_clients table error:', clientsError)
        results.push({ table: 'core_clients', status: 'error', error: clientsError.message })
      } else {
        console.log('✅ core_clients table exists, records:', clients?.length || 0)
        results.push({ table: 'core_clients', status: 'success', count: clients?.length || 0 })
      }

      setTestResults(results)

    } catch (error) {
      console.error('🚨 Supabase connection test failed:', error)
      results.push({ table: 'connection', status: 'error', error: 'Connection failed' })
      setTestResults(results)
    }
  }

  // Generate consistent IDs
  const generateIds = (businessName: string) => {
    const timestamp = Date.now()
    const baseCode = businessName.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 8)
    
    return {
      clientId: `client-${baseCode.toLowerCase()}-${timestamp}`,
      clientCode: `${baseCode}-GROUP`,
      orgId: `org-${baseCode.toLowerCase()}-${timestamp}`,
      orgCode: `${baseCode}-001`,
      userId: `user-${timestamp}`,
      authUserId: `auth-${timestamp}`
    }
  }

  // Step 1: Create Client using direct Supabase calls
  const createClient = async (ids: any, data: RestaurantSetupData) => {
    // Create in core_clients table
    const { error: clientError } = await supabase
      .from('core_clients')
      .insert({
        id: ids.clientId,
        client_name: data.businessName,
        client_code: ids.clientCode,
        client_type: data.businessType,
        is_active: true
      })
    
    if (clientError) throw clientError
    
    // Create client as entity in core_entities
    const { error: entityError } = await supabase
      .from('core_entities')
      .insert({
        id: ids.clientId,
        organization_id: null,
        entity_type: 'client',
        entity_name: data.businessName,
        entity_code: ids.clientCode,
        is_active: true
      })
    
    if (entityError) throw entityError
    
    // Insert client business information into core_dynamic_data
    const clientData = [
      { entity_id: ids.clientId, field_name: 'business_name', field_value: data.businessName, field_type: 'text' },
      { entity_id: ids.clientId, field_name: 'business_type', field_value: data.businessType, field_type: 'text' },
      { entity_id: ids.clientId, field_name: 'cuisine_specialization', field_value: data.cuisineType, field_type: 'text' },
      { entity_id: ids.clientId, field_name: 'established_year', field_value: data.establishedYear, field_type: 'number' },
      { entity_id: ids.clientId, field_name: 'primary_contact', field_value: data.primaryPhone, field_type: 'text' },
      { entity_id: ids.clientId, field_name: 'business_email', field_value: data.businessEmail, field_type: 'text' }
    ]
    
    if (data.website) {
      clientData.push({ entity_id: ids.clientId, field_name: 'website', field_value: data.website, field_type: 'text' })
    }
    
    const { error: dataError } = await supabase
      .from('core_dynamic_data')
      .insert(clientData)
    
    if (dataError) throw dataError
  }

  // Step 2: Create Organization using direct Supabase calls
  const createOrganization = async (ids: any, data: RestaurantSetupData) => {
    // Create in core_organizations table
    const { error: orgError } = await supabase
      .from('core_organizations')
      .insert({
        id: ids.orgId,
        client_id: ids.clientId,
        name: `${data.businessName} - ${data.locationName}`,
        org_code: ids.orgCode,
        industry: 'Food & Beverage',
        country: data.country,
        currency: data.currency,
        is_active: true
      })
    
    if (orgError) throw orgError
    
    // Create organization as entity
    const { error: entityError } = await supabase
      .from('core_entities')
      .insert({
        id: ids.orgId,
        organization_id: ids.orgId,
        entity_type: 'organization',
        entity_name: `${data.businessName} - ${data.locationName}`,
        entity_code: ids.orgCode,
        is_active: true
      })
    
    if (entityError) throw entityError
    
    // Insert organization details into core_dynamic_data
    const orgData = [
      { entity_id: ids.orgId, field_name: 'location_name', field_value: data.locationName, field_type: 'text' },
      { entity_id: ids.orgId, field_name: 'full_address', field_value: data.address, field_type: 'text' },
      { entity_id: ids.orgId, field_name: 'city', field_value: data.city, field_type: 'text' },
      { entity_id: ids.orgId, field_name: 'state', field_value: data.state, field_type: 'text' },
      { entity_id: ids.orgId, field_name: 'country', field_value: data.country, field_type: 'text' },
      { entity_id: ids.orgId, field_name: 'postal_code', field_value: data.postalCode, field_type: 'text' },
      { entity_id: ids.orgId, field_name: 'opening_hours', field_value: `${data.openingTime}-${data.closingTime}`, field_type: 'text' },
      { entity_id: ids.orgId, field_name: 'seating_capacity', field_value: data.seatingCapacity, field_type: 'number' }
    ]
    
    const { error: dataError } = await supabase
      .from('core_dynamic_data')
      .insert(orgData)
    
    if (dataError) throw dataError
  }

  // Main setup method using direct Supabase calls
  const handleSetupSubmit = async () => {
    setIsSubmitting(true)
    setSetupError(null)
    setSetupProgress(null)
    
    try {
      const ids = generateIds(setupData.businessName)
      
      // Step 1: Create Client
      setSetupProgress({ step: 'Creating business entity', status: 'processing', message: 'Setting up your restaurant group...' })
      await createClient(ids, setupData)
      setSetupProgress({ step: 'Creating business entity', status: 'completed', message: 'Business entity created successfully' })
      
      // Step 2: Create Organization
      setSetupProgress({ step: 'Creating restaurant location', status: 'processing', message: 'Setting up your restaurant location...' })
      await createOrganization(ids, setupData)
      setSetupProgress({ step: 'Creating restaurant location', status: 'completed', message: 'Restaurant location created successfully' })
      
      // Step 3: Complete setup
      setSetupProgress({ step: 'Finalizing setup', status: 'processing', message: 'Completing restaurant setup...' })
      
      // Wait a moment to show completion
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSetupProgress({ step: 'Setup complete', status: 'completed', message: 'Restaurant setup completed successfully!' })
      setSetupSuccess(true)
      
      setTimeout(() => {
        router.push('/restaurant')
      }, 2000)
      
    } catch (error) {
      console.error('Setup error:', error)
      setSetupError(error instanceof Error ? error.message : 'An unexpected error occurred')
      setSetupProgress({ 
        step: 'Setup failed', 
        status: 'error', 
        message: 'Failed to complete setup', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps: SetupStep[] = [
    {
      id: 1,
      title: 'Business Information',
      description: 'Tell us about your restaurant business',
      icon: <Building2 className="w-5 h-5" />,
      status: currentStep === 1 ? 'current' : currentStep > 1 ? 'completed' : 'pending'
    },
    {
      id: 2,
      title: 'Location Details',
      description: 'Where is your restaurant located?',
      icon: <MapPin className="w-5 h-5" />,
      status: currentStep === 2 ? 'current' : currentStep > 2 ? 'completed' : 'pending'
    },
    {
      id: 3,
      title: 'Operations Setup',
      description: 'Configure your restaurant operations',
      icon: <Settings className="w-5 h-5" />,
      status: currentStep === 3 ? 'current' : currentStep > 3 ? 'completed' : 'pending'
    },
    {
      id: 4,
      title: 'Team Setup',
      description: 'Add your restaurant manager',
      icon: <Users className="w-5 h-5" />,
      status: currentStep === 4 ? 'current' : currentStep > 4 ? 'completed' : 'pending'
    }
  ]

  const handleInputChange = (field: string, value: string) => {
    setSetupData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = async () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete setup
      await handleSetupSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const progress = (currentStep / 4) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Restaurant Setup (Direct Supabase)
                </h1>
                <p className="text-sm text-gray-600">Get your restaurant up and running with direct Supabase integration</p>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="w-3 h-3" />
              Direct API
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Supabase Connection Test Results */}
        {testResults.length > 0 && (
          <Card variant="glass" className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              Supabase Connection Test Results
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {testResults.map((result, index) => (
                <div key={index} className={`flex items-center gap-2 p-2 rounded-lg ${
                  result.status === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {result.status === 'success' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">{result.table}</span>
                  {result.status === 'success' && (
                    <Badge variant="secondary" className="ml-auto">
                      {result.count} records
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Progress Bar */}
        <Card variant="glass" className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Setup Progress</span>
              <span className="text-sm font-bold text-orange-600">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
            
            {/* Steps */}
            <div className="grid grid-cols-4 gap-2 mt-4">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div 
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all cursor-pointer
                      ${step.status === 'current' ? 'bg-orange-50 border-2 border-orange-200' : ''}
                      ${step.status === 'completed' ? 'bg-green-50' : ''}
                      ${step.status === 'pending' ? 'opacity-50' : ''}
                    `}
                    onClick={() => step.status === 'completed' && setCurrentStep(step.id)}
                  >
                    <div className={`p-2 rounded-full
                      ${step.status === 'current' ? 'bg-orange-100 text-orange-600' : ''}
                      ${step.status === 'completed' ? 'bg-green-100 text-green-600' : ''}
                      ${step.status === 'pending' ? 'bg-gray-100 text-gray-400' : ''}
                    `}>
                      {step.status === 'completed' ? <Check className="w-5 h-5" /> : step.icon}
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium hidden md:block">{step.title}</p>
                      <p className="text-xs text-gray-500 hidden lg:block">{step.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Card>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && (
              <Card variant="elevated" className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-orange-100 rounded-xl">
                      <Building2 className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Business Information</h2>
                      <p className="text-gray-600">Let's start with your restaurant details</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">
                        Restaurant Name
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="businessName"
                        placeholder="e.g., Chef Lebanon Restaurant"
                        value={setupData.businessName}
                        onChange={(e) => handleInputChange('businessName', e.target.value)}
                        className="h-12"
                      />
                      <p className="text-xs text-gray-500">This is your brand name</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cuisineType">
                        Cuisine Type
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="cuisineType"
                        placeholder="e.g., Lebanese, Mediterranean"
                        value={setupData.cuisineType}
                        onChange={(e) => handleInputChange('cuisineType', e.target.value)}
                        className="h-12"
                      />
                      <p className="text-xs text-gray-500">Your restaurant's specialization</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="establishedYear">Established Year</Label>
                      <Select 
                        value={setupData.establishedYear}
                        onValueChange={(value) => handleInputChange('establishedYear', value)}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type</Label>
                      <Select 
                        value={setupData.businessType}
                        onValueChange={(value) => handleInputChange('businessType', value)}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="restaurant_chain">Restaurant Chain</SelectItem>
                          <SelectItem value="single_restaurant">Single Restaurant</SelectItem>
                          <SelectItem value="cloud_kitchen">Cloud ChefHat</SelectItem>
                          <SelectItem value="food_truck">Food Truck</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessEmail">
                        Business Email
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <Input
                          id="businessEmail"
                          type="email"
                          placeholder="info@restaurant.com"
                          value={setupData.businessEmail}
                          onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                          className="h-12 pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="primaryPhone">
                        Phone Number
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <Input
                          id="primaryPhone"
                          placeholder="+91 98765 43210"
                          value={setupData.primaryPhone}
                          onChange={(e) => handleInputChange('primaryPhone', e.target.value)}
                          className="h-12 pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website (Optional)</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <Input
                          id="website"
                          placeholder="www.restaurant.com"
                          value={setupData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          className="h-12 pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {currentStep === 2 && (
              <Card variant="elevated" className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-orange-100 rounded-xl">
                      <MapPin className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Location Details</h2>
                      <p className="text-gray-600">Where is your restaurant located?</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="locationName">
                        Branch Name
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="locationName"
                        placeholder="e.g., Kottakkal Branch"
                        value={setupData.locationName}
                        onChange={(e) => handleInputChange('locationName', e.target.value)}
                        className="h-12"
                      />
                      <p className="text-xs text-gray-500">Give this location a unique name</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">
                        Full Address
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Textarea
                        id="address"
                        placeholder="Enter your complete restaurant address"
                        value={setupData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">
                          City
                          <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                          id="city"
                          placeholder="e.g., Kottakkal"
                          value={setupData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className="h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">
                          State
                          <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Select 
                          value={setupData.state}
                          onValueChange={(value) => handleInputChange('state', value)}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Kerala">Kerala</SelectItem>
                            <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                            <SelectItem value="Karnataka">Karnataka</SelectItem>
                            <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                            <SelectItem value="Delhi">Delhi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="postalCode">
                          Postal Code
                          <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                          id="postalCode"
                          placeholder="676503"
                          value={setupData.postalCode}
                          onChange={(e) => handleInputChange('postalCode', e.target.value)}
                          className="h-12"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Select 
                          value={setupData.country}
                          onValueChange={(value) => handleInputChange('country', value)}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="India">India</SelectItem>
                            <SelectItem value="UAE">UAE</SelectItem>
                            <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                            <SelectItem value="Qatar">Qatar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select 
                          value={setupData.currency}
                          onValueChange={(value) => handleInputChange('currency', value)}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                            <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                            <SelectItem value="SAR">SAR - Saudi Riyal</SelectItem>
                            <SelectItem value="QAR">QAR - Qatari Riyal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {currentStep === 3 && (
              <Card variant="elevated" className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-orange-100 rounded-xl">
                      <Settings className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Operations Setup</h2>
                      <p className="text-gray-600">Configure your restaurant operations</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-600" />
                        Operating Hours
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="openingTime">Opening Time</Label>
                          <Input
                            id="openingTime"
                            type="time"
                            value={setupData.openingTime}
                            onChange={(e) => handleInputChange('openingTime', e.target.value)}
                            className="h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="closingTime">Closing Time</Label>
                          <Input
                            id="closingTime"
                            type="time"
                            value={setupData.closingTime}
                            onChange={(e) => handleInputChange('closingTime', e.target.value)}
                            className="h-12"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Store className="w-4 h-4 text-orange-600" />
                        Capacity
                      </h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="seatingCapacity">
                          Seating Capacity
                          <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                          id="seatingCapacity"
                          type="number"
                          placeholder="e.g., 50"
                          value={setupData.seatingCapacity}
                          onChange={(e) => handleInputChange('seatingCapacity', e.target.value)}
                          className="h-12"
                        />
                        <p className="text-xs text-gray-500">Total number of seats in your restaurant</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {currentStep === 4 && (
              <Card variant="elevated" className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-orange-100 rounded-xl">
                      <Users className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Manager Information</h2>
                      <p className="text-gray-600">Add your restaurant manager details</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="managerName">
                        Manager Name
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="managerName"
                        placeholder="e.g., John Smith"
                        value={setupData.managerName}
                        onChange={(e) => handleInputChange('managerName', e.target.value)}
                        className="h-12"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="managerEmail">
                          Manager Email
                          <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                          <Input
                            id="managerEmail"
                            type="email"
                            placeholder="manager@restaurant.com"
                            value={setupData.managerEmail}
                            onChange={(e) => handleInputChange('managerEmail', e.target.value)}
                            className="h-12 pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="managerPhone">
                          Manager Phone
                          <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                          <Input
                            id="managerPhone"
                            placeholder="+91 98765 43210"
                            value={setupData.managerPhone}
                            onChange={(e) => handleInputChange('managerPhone', e.target.value)}
                            className="h-12 pl-10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Setup Progress Display */}
        {setupProgress && (
          <Card variant="glass" className="p-4">
            <div className="flex items-center gap-3">
              {setupProgress.status === 'processing' && (
                <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
              )}
              {setupProgress.status === 'completed' && (
                <Check className="w-5 h-5 text-green-600" />
              )}
              {setupProgress.status === 'error' && (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <div>
                <p className="font-medium">{setupProgress.step}</p>
                <p className="text-sm text-gray-600">{setupProgress.message}</p>
                {setupProgress.error && (
                  <p className="text-sm text-red-600">{setupProgress.error}</p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Error Display */}
        {setupError && (
          <Card variant="glass" className="p-4 border-red-200 bg-red-50">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Setup Failed</p>
                <p className="text-sm text-red-600">{setupError}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Success Display */}
        {setupSuccess && (
          <Card variant="glass" className="p-4 border-green-200 bg-green-50">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Setup Completed Successfully!</p>
                <p className="text-sm text-green-600">Redirecting to your restaurant dashboard...</p>
              </div>
            </div>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <Button
            variant="gradient"
            onClick={handleNext}
            disabled={isSubmitting || setupSuccess}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Setting up...
              </>
            ) : currentStep === 4 ? (
              <>
                Complete Setup
                <Check className="w-4 h-4" />
              </>
            ) : (
              <>
                Next Step
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}