'use client'

import { PageErrorBoundary, AsyncErrorBoundary } from '@/components/error-boundaries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/revolutionary-card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import NextStepPreview from '@/components/ux/NextStepPreview'
import UniversalRestaurantSetupService from '@/lib/services/universalRestaurantSetupService'
import UniversalCrudService from '@/lib/services/universalCrudService'
import { createClient } from '@/lib/supabase/client'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  Check,
  ChefHat,
  Clock,
  CreditCard,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Settings,
  Users,
  Utensils
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

// Initialize Supabase client
const supabase = createClient()

// Restaurant Validator
function createRestaurantValidator() {
  return {
    validate: (data: RestaurantSetupData) => {
      const errors: Record<string, string> = {}
      const warnings: Record<string, string> = {}

      // Client Information Validation
      if (!data.clientName || data.clientName.trim().length < 2) {
        errors.clientName = 'Company/Group name must be at least 2 characters'
      }
      
      // Business Information Validation
      if (!data.businessName || data.businessName.trim().length < 2) {
        errors.businessName = 'Restaurant name must be at least 2 characters'
      }
      if (!data.cuisineType || data.cuisineType.trim().length < 2) {
        errors.cuisineType = 'Cuisine type is required'
      }
      
      // Location Validation
      if (!data.locationName || data.locationName.trim().length < 2) {
        errors.locationName = 'Location name is required'
      }
      if (!data.address || data.address.trim().length < 5) {
        errors.address = 'Address must be at least 5 characters'
      }
      if (!data.city || data.city.trim().length < 2) {
        errors.city = 'City is required'
      }
      if (!data.state || data.state.trim().length < 2) {
        errors.state = 'State is required'
      }
      if (!data.postalCode || !/^\d{6}$/.test(data.postalCode)) {
        errors.postalCode = 'Postal code must be 6 digits'
      }
      
      // Contact Validation
      if (!data.primaryPhone || !/^[6-9]\d{9}$/.test(data.primaryPhone.replace(/\D/g, ''))) {
        errors.primaryPhone = 'Valid 10-digit mobile number required'
      }
      if (!data.businessEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.businessEmail)) {
        errors.businessEmail = 'Valid email address required'
      }
      
      // Manager Validation
      if (!data.managerName || data.managerName.trim().length < 2) {
        errors.managerName = 'Manager name is required'
      }
      if (!data.managerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.managerEmail)) {
        errors.managerEmail = 'Valid manager email required'
      }
      if (!data.managerPhone || !/^[6-9]\d{9}$/.test(data.managerPhone.replace(/\D/g, ''))) {
        errors.managerPhone = 'Valid manager mobile number required'
      }
      
      // Operational Details Validation
      if (!data.seatingCapacity || parseInt(data.seatingCapacity) < 1) {
        errors.seatingCapacity = 'Seating capacity must be at least 1'
      }
      
      // Warnings (non-blocking)
      if (!data.website) {
        warnings.website = 'Adding a website helps customers find you online'
      }
      
      return { errors, warnings }
    },
    
    validateField: (fieldName: string, value: string, data: RestaurantSetupData) => {
      const tempData = { ...data, [fieldName]: value }
      const { errors, warnings } = createRestaurantValidator().validate(tempData)
      return {
        error: errors[fieldName] || null,
        warning: warnings[fieldName] || null
      }
    }
  }
}

interface RestaurantSetupData {
  // Client-level information (Parent Company)
  clientName: string
  clientType: string
  
  // Restaurant-level information (Specific Location)
  businessName: string
  businessType: string
  cuisineType: string
  establishedYear: string
  locationName: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  currency: string
  primaryPhone: string
  businessEmail: string
  website: string
  openingTime: string
  closingTime: string
  seatingCapacity: string
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

function RestaurantSetupPageDirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const clientId = searchParams.get('clientId')
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [setupProgress, setSetupProgress] = useState<SetupProgress | null>(null)
  const [setupError, setSetupError] = useState<string | null>(null)
  const [setupSuccess, setSetupSuccess] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])
  const [clientInfo, setClientInfo] = useState<any>(null)
  
  // Form validation state
  const [validator] = useState(() => createRestaurantValidator())
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [validationWarnings, setValidationWarnings] = useState<Record<string, string>>({})
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  
  const [setupData, setSetupData] = useState<RestaurantSetupData>({
    // Client-level information (Parent Company)
    clientName: '',
    clientType: 'restaurant_group',
    
    // Restaurant-level information (Specific Location)
    businessName: '',
    businessType: 'restaurant_chain',
    cuisineType: '',
    establishedYear: new Date().getFullYear().toString(),
    locationName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    currency: 'INR',
    primaryPhone: '',
    businessEmail: '',
    website: '',
    openingTime: '07:00',
    closingTime: '23:00',
    seatingCapacity: '',
    managerName: '',
    managerEmail: '',
    managerPhone: ''
  })

  // Load client information if clientId is provided
  useEffect(() => {
    console.log('🚀 Restaurant setup page loaded')
    
    if (clientId) {
      loadClientInformation(clientId)
    }
  }, [clientId])

  // Load client information from database
  const loadClientInformation = async (clientId: string) => {
    try {
      console.log('📋 Loading client information for:', clientId)
      
      // Get client from core_clients
      const { data: client, error: clientError } = await supabase
        .from('core_clients')
        .select('*')
        .eq('id', clientId)
        .single()

      if (clientError) {
        console.error('Error loading client:', clientError)
        return
      }

      console.log('✅ Client loaded:', client)

      // Get client metadata
      const { data: metadata, error: metadataError } = await supabase
        .from('core_metadata')
        .select('*')
        .eq('entity_id', clientId)
        .eq('entity_type', 'client')
        .single()

      if (!metadataError && metadata) {
        console.log('✅ Client metadata loaded:', metadata)
        setClientInfo({ ...client, metadata: metadata.metadata_value })
        
        // Pre-populate form with client information
        setSetupData(prev => ({
          ...prev,
          clientName: client.client_name,
          clientType: client.client_type,
          country: metadata.metadata_value?.country || 'India',
          primaryPhone: metadata.metadata_value?.primary_contact?.phone || '',
          businessEmail: metadata.metadata_value?.primary_contact?.email || '',
          managerName: metadata.metadata_value?.primary_contact?.name || '',
          managerEmail: metadata.metadata_value?.primary_contact?.email || ''
        }))
      } else {
        setClientInfo(client)
        
        // Pre-populate basic client information
        setSetupData(prev => ({
          ...prev,
          clientName: client.client_name,
          clientType: client.client_type
        }))
      }
      
    } catch (error) {
      console.error('Error loading client information:', error)
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
    const newData = { ...setupData, [field]: value }
    setSetupData(newData)
    setTouchedFields(prev => new Set([...prev, field]))
  }

  const handleNext = async () => {
    // Validate current step before proceeding
    const requiredFields = {
      1: ['clientName', 'businessName', 'locationName', 'cuisineType', 'businessEmail', 'primaryPhone'],
      2: ['address', 'city', 'state', 'postalCode'],
      3: ['openingTime', 'closingTime', 'seatingCapacity'],
      4: ['managerName', 'managerEmail', 'managerPhone']
    }
    
    const currentStepFields = requiredFields[currentStep as keyof typeof requiredFields] || []
    
    // Check required fields
    const emptyRequiredFields = []
    currentStepFields.forEach(field => {
      const value = setupData[field as keyof RestaurantSetupData]
      if (!value || value.toString().trim() === '') {
        emptyRequiredFields.push(field)
      }
    })
    
    // Block navigation if required fields are empty
    if (emptyRequiredFields.length > 0) {
      setSetupError(`Please fill in the following required fields: ${emptyRequiredFields.join(', ')}`)
      return
    }
    
    setSetupError(null)
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
      // Step 4: Complete setup
      await handleCompleteSetup()
    }
  }

  const handleCompleteSetup = async () => {
    setIsSubmitting(true)
    setSetupProgress({ step: 'Starting setup...', status: 'processing', message: 'Initializing restaurant setup' })

    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('Authentication required. Please log in first.')
      }

      console.log('🚀 Starting restaurant setup for user:', user.id)
      
      // Test service role first
      setSetupProgress({ step: 'Testing service role...', status: 'processing', message: 'Verifying database permissions' })
      const serviceTest = await UniversalRestaurantSetupService.testServiceRole()
      if (!serviceTest.success) {
        throw new Error(`Service role test failed: ${serviceTest.message}`)
      }
      console.log('✅ Service role test passed')

      // Setup restaurant using Universal Architecture
      setSetupProgress({ step: 'Creating restaurant...', status: 'processing', message: 'Setting up your restaurant with Universal Architecture' })
      
      const setupResult = await UniversalRestaurantSetupService.setupRestaurant(setupData, user.id, clientId || undefined)
      
      if (!setupResult.success) {
        throw new Error(setupResult.error || 'Restaurant setup failed')
      }

      console.log('🎉 Restaurant setup successful:', setupResult.data)
      
      setSetupProgress({ step: 'Setup complete!', status: 'completed', message: 'Your restaurant has been successfully created' })
      setSetupSuccess(true)

      // Redirect to restaurant dashboard after 2 seconds
      setTimeout(() => {
        router.push('/restaurant/dashboard')
      }, 2000)

    } catch (error) {
      console.error('🚨 Setup failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown setup error'
      setSetupError(errorMessage)
      setSetupProgress({ step: 'Setup failed', status: 'error', message: errorMessage, error: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const progress = (currentStep / 4) * 100
  
  // Calculate estimated time remaining
  const getEstimatedTimeRemaining = () => {
    const stepTimes = [2, 1, 2, 1] // minutes per step
    const remainingSteps = stepTimes.slice(currentStep - 1)
    const totalMinutes = remainingSteps.reduce((sum, time) => sum + time, 0)
    return totalMinutes <= 1 ? 'Less than 1 minute' : `About ${totalMinutes} minutes`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto px-4 py-8 md:py-12">
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Welcome to HERA Universal
              </h1>
              <p className="text-xl text-blue-100 mb-4">
                Let's set up your restaurant in just 4 simple steps
              </p>
              <div className="flex items-center justify-center gap-4 text-blue-200">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{getEstimatedTimeRemaining()} remaining</span>
                </div>
                <div className="text-sm">
                  Step {currentStep} of 4
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 -mt-8 relative z-10">
        {/* Progress Steps */}
        <Card className="p-6 md:p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Setup Journey</h2>
            <p className="text-gray-600">Complete each step to launch your restaurant</p>
          </div>
          
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-bold text-blue-600">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-3 bg-gray-200" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                  step.status === 'current' ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300 shadow-lg' : ''
                } ${
                  step.status === 'completed' ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 shadow-md' : ''
                } ${
                  step.status === 'pending' ? 'bg-gray-50 border-gray-200' : ''
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 mx-auto transition-all duration-300 ${
                  step.status === 'current' ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg' : ''
                } ${
                  step.status === 'completed' ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-md' : ''
                } ${
                  step.status === 'pending' ? 'bg-gray-200 text-gray-500' : ''
                }`}>
                  {step.status === 'completed' ? <Check className="w-6 h-6" /> : step.icon}
                </div>
                
                <div className="text-center">
                  <h3 className={`font-semibold text-sm mb-1 ${
                    step.status === 'pending' ? 'text-gray-500' : 'text-gray-800'
                  }`}>
                    {step.title}
                  </h3>
                  <p className={`text-xs leading-relaxed ${
                    step.status === 'pending' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Form Content */}
        <Card className="mt-8 overflow-hidden border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {currentStep === 1 && "Business Information"}
                  {currentStep === 2 && "Location Details"}
                  {currentStep === 3 && "Operations Setup"}
                  {currentStep === 4 && "Team Setup"}
                </h2>
                <p className="text-blue-100">
                  {currentStep === 1 && "Let's start with the basics about your restaurant"}
                  {currentStep === 2 && "Tell us where your restaurant is located"}
                  {currentStep === 3 && "Set up your operating hours and capacity"}
                  {currentStep === 4 && "Add your manager's contact information"}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6 md:p-8 space-y-6">
            {/* Next Step Preview - Shows what comes next */}
            <NextStepPreview
              currentStep={currentStep}
              totalSteps={4}
              estimatedTime={currentStep < 4 ? "1-2 min" : "Complete!"}
              completionMessage="Your restaurant system will be ready to use!"
            />
            
            {currentStep === 1 && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Show client info if pre-loaded */}
                {clientInfo && (
                  <div className="md:col-span-2 bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-blue-900">Company Information</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-blue-800">Company:</span><br />
                        <span className="text-blue-700">{clientInfo.client_name}</span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Type:</span><br />
                        <span className="text-blue-700">{clientInfo.client_type}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Client name field - readonly if pre-loaded */}
                <div className="space-y-3 md:col-span-2">
                  <Label htmlFor="clientName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    Company/Group Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="clientName"
                    placeholder="e.g., Zen Restaurant Group, ABC Food Services"
                    value={setupData.clientName}
                    onChange={(e) => handleInputChange('clientName', e.target.value)}
                    className="h-12 text-base"
                    readOnly={!!clientInfo}
                  />
                  <p className="text-xs text-gray-500">
                    {clientInfo 
                      ? "Company information pre-loaded from your registration"
                      : "This is your parent company or group name that owns multiple restaurants"
                    }
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="businessName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-blue-500" />
                    Restaurant Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="businessName"
                    placeholder="e.g., Zen Tea Garden"
                    value={setupData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    className="h-12 text-base"
                  />
                  <p className="text-xs text-gray-500">
                    This specific restaurant location name
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="locationName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    Location Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="locationName"
                    placeholder="e.g., Main Branch, Downtown Location"
                    value={setupData.locationName}
                    onChange={(e) => handleInputChange('locationName', e.target.value)}
                    className="h-12 text-base"
                  />
                  <p className="text-xs text-gray-500">
                    Specific location identifier (e.g., Main Branch, Downtown)
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="cuisineType" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <ChefHat className="w-4 h-4 text-blue-500" />
                    Cuisine Type <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cuisineType"
                    placeholder="e.g., Tea House, Pastries & Light Meals"
                    value={setupData.cuisineType}
                    onChange={(e) => handleInputChange('cuisineType', e.target.value)}
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="businessEmail" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-500" />
                    Business Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    placeholder="info@zenteagarden.com"
                    value={setupData.businessEmail}
                    onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="primaryPhone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-500" />
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="primaryPhone"
                    placeholder="+91 98765 43210"
                    value={setupData.primaryPhone}
                    onChange={(e) => handleInputChange('primaryPhone', e.target.value)}
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="website" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-500" />
                    Website (Optional)
                  </Label>
                  <Input
                    id="website"
                    placeholder="https://zenteagarden.com"
                    value={setupData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="establishedYear" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    Established Year
                  </Label>
                  <Input
                    id="establishedYear"
                    placeholder="2024"
                    value={setupData.establishedYear}
                    onChange={(e) => handleInputChange('establishedYear', e.target.value)}
                    className="h-12 text-base"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3 md:col-span-2">
                    <Label htmlFor="address" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      Street Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="address"
                      placeholder="123 Garden Street, Near Central Park"
                      value={setupData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                      City <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="city"
                      placeholder="Mumbai"
                      value={setupData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                      State <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="state"
                      placeholder="Maharashtra"
                      value={setupData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="postalCode" className="text-sm font-medium text-gray-700">
                      Postal Code <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="postalCode"
                      placeholder="400001"
                      value={setupData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                      Country
                    </Label>
                    <Select value={setupData.country} onValueChange={(value) => handleInputChange('country', value)}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="India">India</SelectItem>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="openingTime" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      Opening Time <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="openingTime"
                      type="time"
                      value={setupData.openingTime}
                      onChange={(e) => handleInputChange('openingTime', e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="closingTime" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      Closing Time <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="closingTime"
                      type="time"
                      value={setupData.closingTime}
                      onChange={(e) => handleInputChange('closingTime', e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="seatingCapacity" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      Seating Capacity <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="seatingCapacity"
                      type="number"
                      placeholder="e.g., 24"
                      value={setupData.seatingCapacity}
                      onChange={(e) => handleInputChange('seatingCapacity', e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="currency" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-500" />
                      Currency
                    </Label>
                    <Select value={setupData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹) - Indian Rupee</SelectItem>
                        <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                        <SelectItem value="GBP">GBP (£) - British Pound</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="managerName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      Manager Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="managerName"
                      placeholder="e.g., Sarah Johnson"
                      value={setupData.managerName}
                      onChange={(e) => handleInputChange('managerName', e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="managerEmail" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-500" />
                      Manager Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="managerEmail"
                      type="email"
                      placeholder="sarah@zenteagarden.com"
                      value={setupData.managerEmail}
                      onChange={(e) => handleInputChange('managerEmail', e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="managerPhone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-500" />
                      Manager Phone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="managerPhone"
                      placeholder="+91 98765 43210"
                      value={setupData.managerPhone}
                      onChange={(e) => handleInputChange('managerPhone', e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>
                </div>
                
                {/* Helpful tips for Step 4 */}
                <div className="mt-6 p-4 bg-orange-50 border-l-4 border-orange-400 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-orange-600 font-semibold text-xs">👥</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-orange-900 mb-2">Final Step - Team Setup:</h4>
                      <ul className="text-sm text-orange-800 space-y-1">
                        <li>• Manager will have admin access to all restaurant features</li>
                        <li>• This contact info is used for system notifications and support</li>
                        <li>• You can add more staff members after setup is complete</li>
                        <li>• 🎉 After this step, your restaurant system will be ready to use!</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Setup Progress Display */}
                {(setupProgress || isSubmitting) && (
                  <Card className="p-6 mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                    <div className="flex items-center gap-4">
                      {setupProgress?.status === 'processing' && (
                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                      )}
                      {setupProgress?.status === 'completed' && (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                      {setupProgress?.status === 'error' && (
                        <AlertCircle className="w-6 h-6 text-red-500" />
                      )}
                      <div>
                        <p className="font-semibold text-gray-800">{setupProgress?.step}</p>
                        <p className="text-sm text-gray-600">{setupProgress?.message}</p>
                      </div>
                    </div>
                  </Card>
                )}

                {setupSuccess && (
                  <Card className="p-6 mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-green-800 mb-2">Setup Complete!</h3>
                      <p className="text-green-700 mb-4">
                        Your restaurant has been successfully created using HERA Universal Architecture.
                      </p>
                      <div className="text-sm text-green-600">
                        Redirecting to your restaurant dashboard...
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Error Display */}
        {setupError && (
          <Card className="mt-6 p-4 border-red-200 bg-red-50">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Validation Error</p>
                <p className="text-sm text-red-600">{setupError}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8">
          <Card className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-0">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || isSubmitting}
                className="h-12 px-6 gap-3"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="text-center px-4">
                <p className="text-sm text-gray-600 mb-1">Step {currentStep} of 4</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        step <= currentStep
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <Button
                onClick={handleNext}
                disabled={isSubmitting || setupSuccess}
                className="h-12 px-8 gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {currentStep === 4 ? (
                  <>
                    Complete Setup
                    <Check className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function RestaurantSetupPageWithErrorBoundary() {
  return (
    <PageErrorBoundary pageName="Restaurant Setup">
      <AsyncErrorBoundary operationName="restaurant setup">
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div></div>}>
          <RestaurantSetupPageDirect />
        </Suspense>
      </AsyncErrorBoundary>
    </PageErrorBoundary>
  );
}

export default RestaurantSetupPageWithErrorBoundary;
