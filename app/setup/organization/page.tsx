'use client'

import { PageErrorBoundary } from '@/components/error-boundaries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/revolutionary-card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import UniversalCrudService from '@/lib/services/universalCrudService'
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement'
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Check,
  ChefHat,
  Clock,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Users,
  Utensils
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface OrganizationSetupData {
  // Restaurant Information
  businessName: string
  locationName: string
  cuisineType: string
  businessType: string
  establishedYear: string
  
  // Location Details
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  
  // Contact Information
  primaryPhone: string
  businessEmail: string
  website: string
  
  // Operational Details
  openingTime: string
  closingTime: string
  seatingCapacity: string
  
  // Manager Information
  managerName: string
  managerEmail: string
  managerPhone: string
}

interface SetupResult {
  success: boolean
  data?: {
    organizationId: string
    userOrganizationId: string
  }
  error?: string
}

// Organization Setup Service
class OrganizationSetupService {
  static async createOrganization(
    orgData: OrganizationSetupData, 
    clientId: string, 
    coreUserId: string
  ): Promise<SetupResult> {
    try {
      console.log('🚀 Starting Organization Creation...')
      
      // Create service client
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
      
      const supabaseAdmin = createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
        global: {
          headers: {
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`
          }
        }
      })

      // Generate organization data
      const organizationId = crypto.randomUUID()
      const orgCode = this.generateOrgCode(orgData.businessName, orgData.locationName)
      const orgName = `${orgData.businessName} - ${orgData.locationName}`

      // Step 1: Create Organization Record
      console.log('📋 Step 1: Creating organization record...')
      const { error: orgError } = await supabaseAdmin
        .from('core_organizations')
        .insert({
          id: organizationId,
          client_id: clientId,
          org_name: orgName,
          org_code: orgCode,
          industry: 'restaurant',
          country: orgData.country,
          currency: this.getCurrencyForCountry(orgData.country),
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (orgError) {
        throw new Error(`Organization creation failed: ${orgError.message}`)
      }

      console.log('✅ Organization created:', organizationId)

      // Step 2: Create Organization Entity
      console.log('📋 Step 2: Creating organization entity...')
      const { error: entityError } = await supabaseAdmin
        .from('core_entities')
        .insert({
          id: organizationId,
          organization_id: organizationId, // Self-reference
          entity_type: 'organization',
          entity_name: orgName,
          entity_code: orgCode,
          is_active: true
        })

      if (entityError) {
        console.error('⚠️ Organization entity creation failed (non-critical):', entityError)
      }

      // Step 3: Create User-Organization Link
      console.log('📋 Step 3: Creating user-organization link...')
      const linkId = crypto.randomUUID()
      
      const { error: linkError } = await supabaseAdmin
        .from('user_organizations')
        .insert({
          id: linkId,
          user_id: coreUserId,
          organization_id: organizationId,
          role: 'owner',
          is_active: true,
          created_at: new Date().toISOString()
        })

      if (linkError) {
        throw new Error(`User-organization link failed: ${linkError.message}`)
      }

      console.log('✅ User-organization link created:', linkId)

      // Step 4: Create Organization Metadata
      console.log('📋 Step 4: Creating organization metadata...')
      await this.createOrganizationMetadata(organizationId, orgData, coreUserId, supabaseAdmin)

      // Step 5: Initialize Restaurant Data
      console.log('📋 Step 5: Initializing restaurant data...')
      await this.initializeRestaurantData(organizationId, orgData, supabaseAdmin)

      console.log('✅ Organization setup complete!')

      return {
        success: true,
        data: {
          organizationId,
          userOrganizationId: linkId
        }
      }

    } catch (error) {
      console.error('🚨 Organization setup failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown setup error'
      }
    }
  }

  private static async createOrganizationMetadata(
    organizationId: string,
    orgData: OrganizationSetupData,
    coreUserId: string,
    supabaseAdmin: any
  ) {
    const metadataEntries = [
      // Location Details
      {
        organization_id: organizationId,
        entity_type: 'organization',
        entity_id: organizationId,
        metadata_type: 'location_details',
        metadata_category: 'address',
        metadata_key: 'physical_address',
        metadata_value: {
          address: orgData.address,
          city: orgData.city,
          state: orgData.state,
          postal_code: orgData.postalCode,
          country: orgData.country
        },
        is_system_generated: false,
        created_by: coreUserId
      },
      // Business Details
      {
        organization_id: organizationId,
        entity_type: 'organization',
        entity_id: organizationId,
        metadata_type: 'business_details',
        metadata_category: 'restaurant_info',
        metadata_key: 'restaurant_profile',
        metadata_value: {
          cuisine_type: orgData.cuisineType,
          business_type: orgData.businessType,
          established_year: orgData.establishedYear,
          primary_phone: orgData.primaryPhone,
          business_email: orgData.businessEmail,
          website: orgData.website || null
        },
        is_system_generated: false,
        created_by: coreUserId
      },
      // Operational Details
      {
        organization_id: organizationId,
        entity_type: 'organization',
        entity_id: organizationId,
        metadata_type: 'operational_details',
        metadata_category: 'hours',
        metadata_key: 'business_hours',
        metadata_value: {
          opening_time: orgData.openingTime,
          closing_time: orgData.closingTime,
          seating_capacity: parseInt(orgData.seatingCapacity),
          days_of_operation: 'Monday - Sunday'
        },
        is_system_generated: false,
        created_by: coreUserId
      },
      // Manager Information
      {
        organization_id: organizationId,
        entity_type: 'organization',
        entity_id: organizationId,
        metadata_type: 'staff_details',
        metadata_category: 'management',
        metadata_key: 'manager_info',
        metadata_value: {
          manager_name: orgData.managerName,
          manager_email: orgData.managerEmail,
          manager_phone: orgData.managerPhone
        },
        is_system_generated: false,
        created_by: coreUserId
      }
    ]

    for (const metadata of metadataEntries) {
      const { error } = await supabaseAdmin
        .from('core_metadata')
        .insert(metadata)

      if (error) {
        console.error('⚠️ Metadata creation failed (non-critical):', error)
      }
    }
  }

  private static async initializeRestaurantData(
    organizationId: string,
    orgData: OrganizationSetupData,
    supabaseAdmin: any
  ) {
    // Create default menu categories
    const categories = [
      { name: 'Hot Beverages', description: 'Fresh brewed teas and coffees', sort_order: 1 },
      { name: 'Cold Beverages', description: 'Refreshing cold drinks', sort_order: 2 },
      { name: 'Pastries & Desserts', description: 'Sweet treats and baked goods', sort_order: 3 },
      { name: 'Light Meals', description: 'Sandwiches and light bites', sort_order: 4 }
    ]

    for (const category of categories) {
      const categoryId = crypto.randomUUID()
      const categoryCode = this.generateEntityCode(category.name, 'CAT')

      // Create category entity
      await supabaseAdmin
        .from('core_entities')
        .insert({
          id: categoryId,
          organization_id: organizationId,
          entity_type: 'menu_category',
          entity_name: category.name,
          entity_code: categoryCode,
          is_active: true
        })

      // Create category metadata
      await supabaseAdmin
        .from('core_metadata')
        .insert({
          organization_id: organizationId,
          entity_type: 'menu_category',
          entity_id: categoryId,
          metadata_type: 'category_details',
          metadata_category: 'menu',
          metadata_key: 'category_info',
          metadata_value: {
            description: category.description,
            sort_order: category.sort_order
          },
          is_system_generated: false
        })
    }
  }

  private static generateOrgCode(businessName: string, locationName: string): string {
    const baseCode = `${businessName}-${locationName}`.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 8)
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `${baseCode}-${random}-ORG`
  }

  private static generateEntityCode(name: string, type: string): string {
    const baseCode = name.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 8)
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `${baseCode}-${random}-${type}`
  }

  private static getCurrencyForCountry(country: string): string {
    const currencyMap: Record<string, string> = {
      'India': 'INR',
      'United States': 'USD',
      'United Kingdom': 'GBP',
      'Canada': 'CAD',
      'Australia': 'AUD'
    }
    return currencyMap[country] || 'USD'
  }
}

// Organization Setup Form Component
function OrganizationSetupForm() {
  const router = useRouter()
  const { restaurantData, loading: authLoading } = useRestaurantManagement()
  const [isLoading, setIsLoading] = useState(false)
  const [setupResult, setSetupResult] = useState<SetupResult | null>(null)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [clientInfo, setClientInfo] = useState<any>(null)
  
  const [formData, setFormData] = useState<OrganizationSetupData>({
    businessName: '',
    locationName: '',
    cuisineType: '',
    businessType: 'restaurant',
    establishedYear: new Date().getFullYear().toString(),
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    primaryPhone: '',
    businessEmail: '',
    website: '',
    openingTime: '08:00',
    closingTime: '20:00',
    seatingCapacity: '20',
    managerName: '',
    managerEmail: '',
    managerPhone: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Get current user and client information
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const supabase = createClient()
        
        // Get current auth user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/signin')
          return
        }

        // Get core user
        const { data: coreUser } = await supabase
          .from('core_users')
          .select('*')
          .eq('auth_user_id', user.id)
          .single()

        if (!coreUser) {
          router.push('/setup/client')
          return
        }

        setUserInfo(coreUser)

        // Get client information
        const { data: clients } = await supabase
          .from('core_clients')
          .select('*')
          .limit(1)

        if (!clients || clients.length === 0) {
          router.push('/setup/client')
          return
        }

        setClientInfo(clients[0])

        // Pre-fill manager information
        setFormData(prev => ({
          ...prev,
          managerName: coreUser.full_name || '',
          managerEmail: coreUser.email || ''
        }))

      } catch (error) {
        console.error('Error getting user info:', error)
        router.push('/auth/signin')
      }
    }

    if (!authLoading) {
      getCurrentUser()
    }
  }, [authLoading, router])

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Required fields validation
    const requiredFields = [
      'businessName', 'locationName', 'cuisineType', 'address', 'city', 
      'state', 'postalCode', 'primaryPhone', 'businessEmail', 'openingTime', 
      'closingTime', 'seatingCapacity', 'managerName', 'managerEmail', 'managerPhone'
    ]

    requiredFields.forEach(field => {
      if (!formData[field as keyof OrganizationSetupData] || 
          formData[field as keyof OrganizationSetupData].toString().trim() === '') {
        newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`
      }
    })

    // Specific validations
    if (formData.businessEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.businessEmail)) {
      newErrors.businessEmail = 'Valid email address required'
    }

    if (formData.managerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.managerEmail)) {
      newErrors.managerEmail = 'Valid email address required'
    }

    if (formData.primaryPhone && !/^[6-9]\d{9}$/.test(formData.primaryPhone.replace(/\D/g, ''))) {
      newErrors.primaryPhone = 'Valid 10-digit mobile number required'
    }

    if (formData.managerPhone && !/^[6-9]\d{9}$/.test(formData.managerPhone.replace(/\D/g, ''))) {
      newErrors.managerPhone = 'Valid 10-digit mobile number required'
    }

    if (formData.postalCode && !/^\d{6}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Postal code must be 6 digits'
    }

    if (parseInt(formData.seatingCapacity) < 1) {
      newErrors.seatingCapacity = 'Seating capacity must be at least 1'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !clientInfo || !userInfo) {
      return
    }

    setIsLoading(true)
    
    try {
      const result = await OrganizationSetupService.createOrganization(
        formData, 
        clientInfo.id, 
        userInfo.id
      )
      setSetupResult(result)
      
      if (result.success) {
        // Redirect to restaurant dashboard
        setTimeout(() => {
          router.push('/restaurant/dashboard')
        }, 3000)
      }
    } catch (error) {
      console.error('Organization setup error:', error)
      setSetupResult({
        success: false,
        error: 'Setup failed. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle input changes
  const handleInputChange = (field: keyof OrganizationSetupData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Loading state
  if (authLoading || !userInfo || !clientInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your account information...</p>
        </div>
      </div>
    )
  }

  // Show success screen
  if (setupResult?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Restaurant Setup Complete!
            </h1>
            
            <p className="text-gray-600 mb-6">
              Your restaurant location has been successfully created and configured.
            </p>
            
            <div className="bg-green-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-green-900 mb-2">What's Next:</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Access your restaurant dashboard</li>
                <li>• Set up your menu and products</li>
                <li>• Configure staff and permissions</li>
                <li>• Start taking orders</li>
              </ul>
            </div>
            
            <p className="text-sm text-gray-500 mb-4">
              Redirecting to your dashboard in a few seconds...
            </p>
            
            <Button 
              onClick={() => router.push('/restaurant/dashboard')}
              className="w-full"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Show error screen
  if (setupResult?.success === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Setup Failed
            </h1>
            
            <p className="text-gray-600 mb-6">
              {setupResult.error}
            </p>
            
            <Button 
              onClick={() => setSetupResult(null)}
              variant="outline"
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Main setup form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Utensils className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Add Restaurant Location
          </h1>
          <p className="text-gray-600">
            Set up a new restaurant location for <span className="font-semibold text-blue-600">{clientInfo?.client_name}</span>
          </p>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Restaurant Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-blue-600" />
                  Restaurant Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="businessName">Restaurant Name *</Label>
                    <Input
                      id="businessName"
                      placeholder="e.g., Zen Tea Garden"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                    />
                    {errors.businessName && <p className="text-sm text-red-600">{errors.businessName}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="locationName">Location Name *</Label>
                    <Input
                      id="locationName"
                      placeholder="e.g., Main Branch, Downtown"
                      value={formData.locationName}
                      onChange={(e) => handleInputChange('locationName', e.target.value)}
                    />
                    {errors.locationName && <p className="text-sm text-red-600">{errors.locationName}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="cuisineType">Cuisine Type *</Label>
                    <Select value={formData.cuisineType} onValueChange={(value) => handleInputChange('cuisineType', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="indian">Indian</SelectItem>
                        <SelectItem value="chinese">Chinese</SelectItem>
                        <SelectItem value="continental">Continental</SelectItem>
                        <SelectItem value="tea_coffee">Tea & Coffee</SelectItem>
                        <SelectItem value="fast_food">Fast Food</SelectItem>
                        <SelectItem value="multi_cuisine">Multi-Cuisine</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.cuisineType && <p className="text-sm text-red-600">{errors.cuisineType}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="establishedYear">Established Year *</Label>
                    <Input
                      id="establishedYear"
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={formData.establishedYear}
                      onChange={(e) => handleInputChange('establishedYear', e.target.value)}
                    />
                    {errors.establishedYear && <p className="text-sm text-red-600">{errors.establishedYear}</p>}
                  </div>
                </div>
              </div>

              {/* Location Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Location Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-3">
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      placeholder="Complete street address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                    />
                    {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                    {errors.city && <p className="text-sm text-red-600">{errors.city}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                    />
                    {errors.state && <p className="text-sm text-red-600">{errors.state}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      placeholder="6-digit postal code"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    />
                    {errors.postalCode && <p className="text-sm text-red-600">{errors.postalCode}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="country">Country *</Label>
                    <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="India">India</SelectItem>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="Australia">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-blue-600" />
                  Contact Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="primaryPhone">Primary Phone *</Label>
                    <Input
                      id="primaryPhone"
                      placeholder="+91-98765-43210"
                      value={formData.primaryPhone}
                      onChange={(e) => handleInputChange('primaryPhone', e.target.value)}
                    />
                    {errors.primaryPhone && <p className="text-sm text-red-600">{errors.primaryPhone}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="businessEmail">Business Email *</Label>
                    <Input
                      id="businessEmail"
                      type="email"
                      value={formData.businessEmail}
                      onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                    />
                    {errors.businessEmail && <p className="text-sm text-red-600">{errors.businessEmail}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="website">Website (Optional)</Label>
                    <Input
                      id="website"
                      placeholder="https://yourrestaurant.com"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Operational Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Operational Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="openingTime">Opening Time *</Label>
                    <Input
                      id="openingTime"
                      type="time"
                      value={formData.openingTime}
                      onChange={(e) => handleInputChange('openingTime', e.target.value)}
                    />
                    {errors.openingTime && <p className="text-sm text-red-600">{errors.openingTime}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="closingTime">Closing Time *</Label>
                    <Input
                      id="closingTime"
                      type="time"
                      value={formData.closingTime}
                      onChange={(e) => handleInputChange('closingTime', e.target.value)}
                    />
                    {errors.closingTime && <p className="text-sm text-red-600">{errors.closingTime}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="seatingCapacity">Seating Capacity *</Label>
                    <Input
                      id="seatingCapacity"
                      type="number"
                      min="1"
                      value={formData.seatingCapacity}
                      onChange={(e) => handleInputChange('seatingCapacity', e.target.value)}
                    />
                    {errors.seatingCapacity && <p className="text-sm text-red-600">{errors.seatingCapacity}</p>}
                  </div>
                </div>
              </div>

              {/* Manager Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Manager Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="managerName">Manager Name *</Label>
                    <Input
                      id="managerName"
                      value={formData.managerName}
                      onChange={(e) => handleInputChange('managerName', e.target.value)}
                    />
                    {errors.managerName && <p className="text-sm text-red-600">{errors.managerName}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="managerEmail">Manager Email *</Label>
                    <Input
                      id="managerEmail"
                      type="email"
                      value={formData.managerEmail}
                      onChange={(e) => handleInputChange('managerEmail', e.target.value)}
                    />
                    {errors.managerEmail && <p className="text-sm text-red-600">{errors.managerEmail}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="managerPhone">Manager Phone *</Label>
                    <Input
                      id="managerPhone"
                      placeholder="+91-87654-32109"
                      value={formData.managerPhone}
                      onChange={(e) => handleInputChange('managerPhone', e.target.value)}
                    />
                    {errors.managerPhone && <p className="text-sm text-red-600">{errors.managerPhone}</p>}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/restaurant/dashboard')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Restaurant...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Restaurant Location
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function OrganizationSetupPage() {
  return (
    <PageErrorBoundary>
      <OrganizationSetupForm />
    </PageErrorBoundary>
  )
}