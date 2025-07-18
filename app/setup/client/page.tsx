'use client'

import { PageErrorBoundary } from '@/components/error-boundaries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/revolutionary-card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import UniversalCrudService from '@/lib/services/universalCrudService'
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Check,
  Globe,
  Loader2,
  Mail,
  Phone,
  Users
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// Initialize Supabase client
const supabase = createClient()

interface ClientSetupData {
  clientName: string
  clientType: string
  primaryContactName: string
  primaryContactEmail: string
  primaryContactPhone: string
  country: string
  businessDescription: string
  expectedLocations: string
}

interface SetupResult {
  success: boolean
  data?: {
    clientId: string
    loginCredentials?: {
      email: string
      temporaryPassword: string
    }
  }
  error?: string
}

// Simplified Client Information Collection Service
class ClientInformationService {
  static async saveClientInformation(clientData: ClientSetupData): Promise<SetupResult> {
    try {
      console.log('🚀 Saving Client Information...')
      
      // Create service client for database operations
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

      // Generate IDs and codes
      const clientId = crypto.randomUUID()
      const clientCode = this.generateClientCode(clientData.clientName)

      // Step 1: Create Client Record
      console.log('📋 Step 1: Creating client record...')
      const { error: clientError } = await supabaseAdmin
        .from('core_clients')
        .insert({
          id: clientId,
          client_name: clientData.clientName,
          client_code: clientCode,
          client_type: clientData.clientType,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (clientError) {
        throw new Error(`Client creation failed: ${clientError.message}`)
      }

      console.log('✅ Client created:', clientId)

      // Step 2: Create Client Entity in Universal Schema
      console.log('📋 Step 2: Creating client entity...')
      const { error: entityError } = await supabaseAdmin
        .from('core_entities')
        .insert({
          id: clientId,
          organization_id: null, // Clients have no parent organization
          entity_type: 'client',
          entity_name: clientData.clientName,
          entity_code: clientCode,
          is_active: true
        })

      if (entityError) {
        console.error('⚠️ Client entity creation failed (non-critical):', entityError)
      }

      // Step 3: Create Client Metadata
      console.log('📋 Step 3: Creating client metadata...')
      const clientMetadata = {
        organization_id: null, // Client metadata is global
        entity_type: 'client',
        entity_id: clientId,
        metadata_type: 'client_details',
        metadata_category: 'business_info',
        metadata_key: 'client_profile',
        metadata_value: {
          business_description: clientData.businessDescription,
          expected_locations: parseInt(clientData.expectedLocations),
          country: clientData.country,
          primary_contact: {
            name: clientData.primaryContactName,
            email: clientData.primaryContactEmail,
            phone: clientData.primaryContactPhone
          },
          registration_date: new Date().toISOString(),
          client_status: 'pending_restaurant_setup'
        },
        is_system_generated: false
      }

      const { error: metadataError } = await supabaseAdmin
        .from('core_metadata')
        .insert(clientMetadata)

      if (metadataError) {
        console.error('⚠️ Client metadata creation failed (non-critical):', metadataError)
      }

      console.log('✅ Client information saved!')

      return {
        success: true,
        data: {
          clientId,
          clientName: clientData.clientName,
          primaryContactEmail: clientData.primaryContactEmail
        }
      }

    } catch (error) {
      console.error('🚨 Client information save failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error saving client information'
      }
    }
  }

  private static generateClientCode(clientName: string): string {
    const baseCode = clientName.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 8)
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `${baseCode}-${random}-CLIENT`
  }

  private static generateTemporaryPassword(): string {
    // Generate a secure temporary password
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }
}

// Client Setup Form Component
function ClientSetupForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [setupResult, setSetupResult] = useState<SetupResult | null>(null)
  const [formData, setFormData] = useState<ClientSetupData>({
    clientName: '',
    clientType: 'restaurant_group',
    primaryContactName: '',
    primaryContactEmail: '',
    primaryContactPhone: '',
    country: 'India',
    businessDescription: '',
    expectedLocations: '1'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.clientName || formData.clientName.trim().length < 2) {
      newErrors.clientName = 'Company name must be at least 2 characters'
    }

    if (!formData.primaryContactName || formData.primaryContactName.trim().length < 2) {
      newErrors.primaryContactName = 'Primary contact name is required'
    }

    if (!formData.primaryContactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.primaryContactEmail)) {
      newErrors.primaryContactEmail = 'Valid email address required'
    }

    if (!formData.primaryContactPhone || !/^[6-9]\d{9}$/.test(formData.primaryContactPhone.replace(/\D/g, ''))) {
      newErrors.primaryContactPhone = 'Valid 10-digit mobile number required'
    }

    if (!formData.businessDescription || formData.businessDescription.trim().length < 10) {
      newErrors.businessDescription = 'Business description must be at least 10 characters'
    }

    if (!formData.expectedLocations || parseInt(formData.expectedLocations) < 1) {
      newErrors.expectedLocations = 'Expected locations must be at least 1'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    
    try {
      const result = await ClientInformationService.saveClientInformation(formData)
      setSetupResult(result)
      
      if (result.success) {
        // Show success screen with login credentials
        console.log('✅ Client registration successful')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setSetupResult({
        success: false,
        error: 'Registration failed. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle input changes
  const handleInputChange = (field: keyof ClientSetupData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Show success screen
  if (setupResult?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Company Information Saved!
            </h1>
            
            <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-blue-900 mb-2">Company Details:</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-blue-800">Company:</span><br />
                  <span className="text-blue-600">{setupResult.data?.clientName}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Contact Email:</span><br />
                  <span className="text-blue-600">{setupResult.data?.primaryContactEmail}</span>
                </div>
              </div>
            </div>
            
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-left">
                Now let's set up your first restaurant location and complete the full registration.
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={() => router.push(`/setup/restaurant?clientId=${setupResult.data?.clientId}`)}
              className="w-full"
            >
              Continue to Restaurant Setup
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
              Registration Failed
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

  // Main registration form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Register Your Company
            </h1>
            <p className="text-gray-600">
              Create your company account to manage multiple restaurant locations
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Company Information
              </h3>
              
              <div className="space-y-3">
                <Label htmlFor="clientName" className="text-sm font-medium text-gray-700">
                  Company Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="clientName"
                  placeholder="e.g., Zen Restaurant Group"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  className="h-12 text-base"
                />
                {errors.clientName && (
                  <p className="text-sm text-red-600">{errors.clientName}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="clientType" className="text-sm font-medium text-gray-700">
                  Business Type <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.clientType} onValueChange={(value) => handleInputChange('clientType', value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restaurant_group">Restaurant Group</SelectItem>
                    <SelectItem value="franchise">Franchise</SelectItem>
                    <SelectItem value="single_location">Single Location</SelectItem>
                    <SelectItem value="chain">Restaurant Chain</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="businessDescription" className="text-sm font-medium text-gray-700">
                  Business Description <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="businessDescription"
                  placeholder="Brief description of your restaurant business"
                  value={formData.businessDescription}
                  onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                  className="h-12 text-base"
                />
                {errors.businessDescription && (
                  <p className="text-sm text-red-600">{errors.businessDescription}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="expectedLocations" className="text-sm font-medium text-gray-700">
                  Expected Number of Locations <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.expectedLocations} onValueChange={(value) => handleInputChange('expectedLocations', value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Location</SelectItem>
                    <SelectItem value="2">2-3 Locations</SelectItem>
                    <SelectItem value="5">4-10 Locations</SelectItem>
                    <SelectItem value="15">11-25 Locations</SelectItem>
                    <SelectItem value="50">25+ Locations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Primary Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Primary Contact
              </h3>
              
              <div className="space-y-3">
                <Label htmlFor="primaryContactName" className="text-sm font-medium text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="primaryContactName"
                  placeholder="Primary contact person name"
                  value={formData.primaryContactName}
                  onChange={(e) => handleInputChange('primaryContactName', e.target.value)}
                  className="h-12 text-base"
                />
                {errors.primaryContactName && (
                  <p className="text-sm text-red-600">{errors.primaryContactName}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="primaryContactEmail" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-500" />
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="primaryContactEmail"
                  type="email"
                  placeholder="contact@yourcompany.com"
                  value={formData.primaryContactEmail}
                  onChange={(e) => handleInputChange('primaryContactEmail', e.target.value)}
                  className="h-12 text-base"
                />
                {errors.primaryContactEmail && (
                  <p className="text-sm text-red-600">{errors.primaryContactEmail}</p>
                )}
                <p className="text-xs text-blue-600">
                  This will be your login email address
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="primaryContactPhone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-500" />
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="primaryContactPhone"
                  placeholder="+91-98765-43210"
                  value={formData.primaryContactPhone}
                  onChange={(e) => handleInputChange('primaryContactPhone', e.target.value)}
                  className="h-12 text-base"
                />
                {errors.primaryContactPhone && (
                  <p className="text-sm text-red-600">{errors.primaryContactPhone}</p>
                )}
              </div>
            </div>

            {/* Location & Currency */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                Location & Currency
              </h3>
              
              <div className="space-y-3">
                <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                  Primary Country <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                  <SelectTrigger className="h-12">
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

            {/* Submit */}
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 text-base font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Company Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}

export default function ClientSetupPage() {
  return (
    <PageErrorBoundary>
      <ClientSetupForm />
    </PageErrorBoundary>
  )
}