'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building2, MapPin, Clock, User, Edit3, Save, X, 
  Store, Phone, Mail, Globe, CheckCircle, AlertCircle,
  Loader2, RefreshCw, Settings, BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/ui/navbar'
import { Card } from '@/components/ui/revolutionary-card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement'
import { RestaurantUpdateData } from '@/lib/services/restaurantManagementService'

interface EditFormData {
  businessName: string
  cuisineType: string
  businessEmail: string
  primaryPhone: string
  website: string
  locationName: string
  address: string
  city: string
  state: string
  postalCode: string
  openingTime: string
  closingTime: string
  seatingCapacity: string
  managerName: string
  managerEmail: string
  managerPhone: string
}

export default function RestaurantProfilePage() {
  const { toast } = useToast()
  const { 
    restaurantData, 
    loading, 
    error, 
    refreshData, 
    updateRestaurant, 
    isUpdating 
  } = useRestaurantManagement()
  
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<EditFormData>({
    businessName: '',
    cuisineType: '',
    businessEmail: '',
    primaryPhone: '',
    website: '',
    locationName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    openingTime: '',
    closingTime: '',
    seatingCapacity: '',
    managerName: '',
    managerEmail: '',
    managerPhone: ''
  })

  const enterEditMode = () => {
    if (!restaurantData) return
    
    setEditForm({
      businessName: restaurantData.businessName,
      cuisineType: restaurantData.cuisineType,
      businessEmail: restaurantData.businessEmail,
      primaryPhone: restaurantData.primaryPhone,
      website: restaurantData.website || '',
      locationName: restaurantData.locationName,
      address: restaurantData.address,
      city: restaurantData.city,
      state: restaurantData.state,
      postalCode: restaurantData.postalCode,
      openingTime: restaurantData.openingTime,
      closingTime: restaurantData.closingTime,
      seatingCapacity: restaurantData.seatingCapacity,
      managerName: restaurantData.managerName,
      managerEmail: restaurantData.managerEmail,
      managerPhone: restaurantData.managerPhone
    })
    setIsEditing(true)
  }

  const exitEditMode = () => {
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!restaurantData) return

    // Prepare updates (only include changed fields)
    const updates: RestaurantUpdateData = {}
    
    if (editForm.businessName !== restaurantData.businessName) updates.businessName = editForm.businessName
    if (editForm.cuisineType !== restaurantData.cuisineType) updates.cuisineType = editForm.cuisineType
    if (editForm.businessEmail !== restaurantData.businessEmail) updates.businessEmail = editForm.businessEmail
    if (editForm.primaryPhone !== restaurantData.primaryPhone) updates.primaryPhone = editForm.primaryPhone
    if (editForm.website !== (restaurantData.website || '')) updates.website = editForm.website
    if (editForm.locationName !== restaurantData.locationName) updates.locationName = editForm.locationName
    if (editForm.address !== restaurantData.address) updates.address = editForm.address
    if (editForm.city !== restaurantData.city) updates.city = editForm.city
    if (editForm.state !== restaurantData.state) updates.state = editForm.state
    if (editForm.postalCode !== restaurantData.postalCode) updates.postalCode = editForm.postalCode
    if (editForm.openingTime !== restaurantData.openingTime) updates.openingTime = editForm.openingTime
    if (editForm.closingTime !== restaurantData.closingTime) updates.closingTime = editForm.closingTime
    if (editForm.seatingCapacity !== restaurantData.seatingCapacity) updates.seatingCapacity = editForm.seatingCapacity
    if (editForm.managerName !== restaurantData.managerName) updates.managerName = editForm.managerName
    if (editForm.managerEmail !== restaurantData.managerEmail) updates.managerEmail = editForm.managerEmail
    if (editForm.managerPhone !== restaurantData.managerPhone) updates.managerPhone = editForm.managerPhone

    if (Object.keys(updates).length === 0) {
      toast({
        title: "No Changes",
        description: "No changes were made to save.",
        variant: "default"
      })
      setIsEditing(false)
      return
    }

    const success = await updateRestaurant(updates)
    
    if (success) {
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Restaurant profile updated successfully!",
        variant: "default"
      })
    } else {
      toast({
        title: "Error", 
        description: "Failed to update restaurant profile.",
        variant: "destructive"
      })
    }
  }

  const handleInputChange = (field: keyof EditFormData, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        
      {/* Navigation Bar with User Info */}
      <Navbar />
      <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Loading restaurant profile...</p>
        </div>
      </div>
    )
  }

  if (error || !restaurantData) {
    return (
      <div 
        className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4"
        data-testid={error ? "error-state" : "no-restaurant-found"}
      >
        <div className="max-w-3xl w-full mx-auto">
          <Card className="p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-center mb-2">
                {error ? 'Unable to Load Profile' : 'No Restaurant Found'}
              </h2>
              <p className="text-center text-slate-600 mb-4">
                {error || 'Click below to set up your restaurant profile.'}
              </p>
              <div className="mt-4 flex justify-center gap-2">
                {error && (
                  <Button onClick={refreshData} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                )}
                <Button onClick={() => window.location.href = '/setup/restaurant'}>
                  Setup Restaurant
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 overflow-x-hidden"
      data-testid="restaurant-content"
    >
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Store className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
                <span className="truncate">{restaurantData.businessName}</span>
              </h1>
              <p className="text-slate-600 mt-1 text-sm sm:text-base">
                Restaurant Profile & Settings
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Badge 
                variant={restaurantData.isActive ? "default" : "secondary"}
                className="px-3 py-1"
              >
                {restaurantData.isActive ? "Active" : "Inactive"}
              </Badge>
              
              {!isEditing ? (
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button 
                    onClick={refreshData}
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  
                  <Button 
                    onClick={enterEditMode}
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button 
                    onClick={handleSave}
                    size="sm"
                    disabled={isUpdating}
                    className="w-full sm:w-auto"
                  >
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                  <Button 
                    onClick={exitEditMode}
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 pb-12">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
          
          {/* Main Profile Form */}
          <div className="xl:col-span-3 space-y-6">
            
            {/* Business Information */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
                <Building2 className="h-5 w-5 text-blue-600" />
                Business Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label>Business Name</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 font-medium">{restaurantData.businessName}</p>
                  )}
                </div>

                <div>
                  <Label>Cuisine Type</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.cuisineType}
                      onChange={(e) => handleInputChange('cuisineType', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 font-medium">{restaurantData.cuisineType}</p>
                  )}
                </div>

                <div>
                  <Label>Business Email</Label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={editForm.businessEmail}
                      onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 font-medium">{restaurantData.businessEmail}</p>
                  )}
                </div>

                <div>
                  <Label>Primary Phone</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.primaryPhone}
                      onChange={(e) => handleInputChange('primaryPhone', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 font-medium">{restaurantData.primaryPhone}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <Label>Website</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="mt-1"
                      placeholder="https://example.com"
                    />
                  ) : (
                    <p className="mt-1 font-medium break-words">{restaurantData.website || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Location Details */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
                <MapPin className="h-5 w-5 text-green-600" />
                Location Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label>Location Name</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.locationName}
                      onChange={(e) => handleInputChange('locationName', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 font-medium">{restaurantData.locationName}</p>
                  )}
                </div>

                <div>
                  <Label>City</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 font-medium">{restaurantData.city}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <Label>Address</Label>
                  {isEditing ? (
                    <Textarea
                      value={editForm.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="mt-1 resize-none"
                      rows={3}
                    />
                  ) : (
                    <p className="mt-1 font-medium break-words">{restaurantData.address}</p>
                  )}
                </div>

                <div>
                  <Label>State</Label>
                  {isEditing ? (
                    <Select 
                      value={editForm.state}
                      onValueChange={(value) => handleInputChange('state', value)}
                    >
                      <SelectTrigger className="mt-1">
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
                  ) : (
                    <p className="mt-1 font-medium">{restaurantData.state || 'Not specified'}</p>
                  )}
                </div>

                <div>
                  <Label>Postal Code</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 font-medium">{restaurantData.postalCode}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Operations & Manager */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Operations */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
                  <Clock className="h-5 w-5 text-purple-600" />
                  Operations
                </h2>

                <div className="space-y-4">
                  <div>
                    <Label>Opening Time</Label>
                    {isEditing ? (
                      <Input
                        type="time"
                        value={editForm.openingTime}
                        onChange={(e) => handleInputChange('openingTime', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 font-medium">{restaurantData.openingTime}</p>
                    )}
                  </div>

                  <div>
                    <Label>Closing Time</Label>
                    {isEditing ? (
                      <Input
                        type="time"
                        value={editForm.closingTime}
                        onChange={(e) => handleInputChange('closingTime', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 font-medium">{restaurantData.closingTime}</p>
                    )}
                  </div>

                  <div>
                    <Label>Seating Capacity</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editForm.seatingCapacity}
                        onChange={(e) => handleInputChange('seatingCapacity', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 font-medium">{restaurantData.seatingCapacity} seats</p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Manager Information */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
                  <User className="h-5 w-5 text-orange-600" />
                  Manager
                </h2>

                <div className="space-y-4">
                  <div>
                    <Label>Manager Name</Label>
                    {isEditing ? (
                      <Input
                        value={editForm.managerName}
                        onChange={(e) => handleInputChange('managerName', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 font-medium">{restaurantData.managerName}</p>
                    )}
                  </div>

                  <div>
                    <Label>Manager Email</Label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={editForm.managerEmail}
                        onChange={(e) => handleInputChange('managerEmail', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 font-medium">{restaurantData.managerEmail}</p>
                    )}
                  </div>

                  <div>
                    <Label>Manager Phone</Label>
                    {isEditing ? (
                      <Input
                        value={editForm.managerPhone}
                        onChange={(e) => handleInputChange('managerPhone', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 font-medium">{restaurantData.managerPhone}</p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            
            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Restaurant Info
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Status</span>
                  <Badge variant={restaurantData.isActive ? "default" : "secondary"}>
                    {restaurantData.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Established</span>
                  <span className="font-medium">{restaurantData.establishedYear}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Industry</span>
                  <span className="font-medium">{restaurantData.industry}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Currency</span>
                  <span className="font-medium">{restaurantData.currency}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Country</span>
                  <span className="font-medium">{restaurantData.country}</span>
                </div>
              </div>
            </Card>

            {/* System Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5 text-slate-600" />
                System Information
              </h3>
              
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-slate-600">Client Code</span>
                  <p className="font-medium">{restaurantData.clientCode}</p>
                </div>
                
                <div>
                  <span className="text-slate-600">Organization Code</span>
                  <p className="font-medium">{restaurantData.orgCode}</p>
                </div>
                
                <div>
                  <span className="text-slate-600">Created</span>
                  <p className="font-medium">
                    {new Date(restaurantData.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <span className="text-slate-600">Last Updated</span>
                  <p className="font-medium">
                    {new Date(restaurantData.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}