'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building2, MapPin, Users, Settings, Edit3, Save, X, 
  Store, Phone, Mail, Globe, Calendar, Clock, User,
  ChefHat, Utensils, Star, TrendingUp, BarChart3,
  Loader2, CheckCircle, AlertCircle, RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/revolutionary-card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { restaurantManagementService, RestaurantData, RestaurantUpdateData } from '@/lib/services/restaurantManagementService'

interface EditSection {
  id: string
  title: string
  isEditing: boolean
}

export default function RestaurantManagementPage() {
  const { toast } = useToast()
  const [restaurantData, setRestaurantData] = useState<RestaurantData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editSections, setEditSections] = useState<EditSection[]>([
    { id: 'business', title: 'Business Information', isEditing: false },
    { id: 'location', title: 'Location Details', isEditing: false },
    { id: 'operations', title: 'Operations', isEditing: false },
    { id: 'manager', title: 'Manager Information', isEditing: false }
  ])
  const [editData, setEditData] = useState<RestaurantUpdateData>({})
  const [saving, setSaving] = useState(false)

  // Load restaurant data
  useEffect(() => {
    loadRestaurantData()
  }, [])

  const loadRestaurantData = async () => {
    try {
      setLoading(true)
      
      // For now, use a mock user ID - in production this would come from auth
      const mockUserId = 'current-user'
      const data = await restaurantManagementService.getRestaurantByUserId(mockUserId)
      
      if (data) {
        setRestaurantData(data)
        console.log('✅ Restaurant data loaded:', data.businessName)
      } else {
        toast({
          title: "No Restaurant Found",
          description: "No restaurant data found for this user.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('❌ Error loading restaurant data:', error)
      toast({
        title: "Error",
        description: "Failed to load restaurant data.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleEdit = (sectionId: string) => {
    setEditSections(prev => prev.map(section => ({
      ...section,
      isEditing: section.id === sectionId ? !section.isEditing : false
    })))
    
    // Reset edit data when entering edit mode
    if (!editSections.find(s => s.id === sectionId)?.isEditing) {
      setEditData({})
    }
  }

  const handleInputChange = (field: keyof RestaurantUpdateData, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const saveSection = async (sectionId: string) => {
    if (!restaurantData) return

    try {
      setSaving(true)
      
      const success = await restaurantManagementService.updateRestaurant(restaurantData, editData)
      
      if (success) {
        // Reload data to get updated values
        await loadRestaurantData()
        
        // Exit edit mode
        setEditSections(prev => prev.map(section => ({
          ...section,
          isEditing: section.id === sectionId ? false : section.isEditing
        })))
        
        setEditData({})
        
        toast({
          title: "Success",
          description: "Restaurant information updated successfully!",
          variant: "default"
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update restaurant information.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('❌ Error saving data:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = (sectionId: string) => {
    setEditSections(prev => prev.map(section => ({
      ...section,
      isEditing: section.id === sectionId ? false : section.isEditing
    })))
    setEditData({})
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Loading restaurant data...</p>
        </div>
      </div>
    )
  }

  if (!restaurantData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Restaurant Found</h2>
          <p className="text-slate-600 mb-4">
            No restaurant data found for your account. Please complete the restaurant setup first.
          </p>
          <Button onClick={() => window.location.href = '/setup/restaurant'}>
            Setup Restaurant
          </Button>
        </Card>
      </div>
    )
  }

  const isEditingSection = (sectionId: string) => 
    editSections.find(s => s.id === sectionId)?.isEditing || false

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Store className="h-8 w-8 text-blue-600" />
                {restaurantData.businessName}
              </h1>
              <p className="text-slate-600 mt-1">
                {restaurantData.locationName} • {restaurantData.city}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge 
                variant={restaurantData.isActive ? "default" : "secondary"}
                className="px-3 py-1"
              >
                {restaurantData.isActive ? "Active" : "Inactive"}
              </Badge>
              
              <Button 
                onClick={loadRestaurantData}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Business Information */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Business Information
                </h2>
                
                {!isEditingSection('business') ? (
                  <Button 
                    onClick={() => toggleEdit('business')}
                    variant="outline" 
                    size="sm"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => saveSection('business')}
                      size="sm"
                      disabled={saving}
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      Save
                    </Button>
                    <Button 
                      onClick={() => cancelEdit('business')}
                      variant="outline" 
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Business Name</Label>
                  {isEditingSection('business') ? (
                    <Input
                      value={editData.businessName ?? restaurantData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 font-medium">{restaurantData.businessName}</p>
                  )}
                </div>

                <div>
                  <Label>Cuisine Type</Label>
                  {isEditingSection('business') ? (
                    <Input
                      value={editData.cuisineType ?? restaurantData.cuisineType}
                      onChange={(e) => handleInputChange('cuisineType', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 font-medium">{restaurantData.cuisineType}</p>
                  )}
                </div>

                <div>
                  <Label>Business Email</Label>
                  {isEditingSection('business') ? (
                    <Input
                      type="email"
                      value={editData.businessEmail ?? restaurantData.businessEmail}
                      onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 font-medium">{restaurantData.businessEmail}</p>
                  )}
                </div>

                <div>
                  <Label>Primary Phone</Label>
                  {isEditingSection('business') ? (
                    <Input
                      value={editData.primaryPhone ?? restaurantData.primaryPhone}
                      onChange={(e) => handleInputChange('primaryPhone', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 font-medium">{restaurantData.primaryPhone}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label>Website</Label>
                  {isEditingSection('business') ? (
                    <Input
                      value={editData.website ?? restaurantData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="mt-1"
                      placeholder="https://example.com"
                    />
                  ) : (
                    <p className="mt-1 font-medium">{restaurantData.website || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Location Details */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  Location Details
                </h2>
                
                {!isEditingSection('location') ? (
                  <Button 
                    onClick={() => toggleEdit('location')}
                    variant="outline" 
                    size="sm"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => saveSection('location')}
                      size="sm"
                      disabled={saving}
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      Save
                    </Button>
                    <Button 
                      onClick={() => cancelEdit('location')}
                      variant="outline" 
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Location Name</Label>
                  {isEditingSection('location') ? (
                    <Input
                      value={editData.locationName ?? restaurantData.locationName}
                      onChange={(e) => handleInputChange('locationName', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 font-medium">{restaurantData.locationName}</p>
                  )}
                </div>

                <div>
                  <Label>City</Label>
                  {isEditingSection('location') ? (
                    <Input
                      value={editData.city ?? restaurantData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 font-medium">{restaurantData.city}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label>Address</Label>
                  {isEditingSection('location') ? (
                    <Textarea
                      value={editData.address ?? restaurantData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  ) : (
                    <p className="mt-1 font-medium">{restaurantData.address}</p>
                  )}
                </div>

                <div>
                  <Label>State</Label>
                  {isEditingSection('location') ? (
                    <Select 
                      value={editData.state ?? restaurantData.state}
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
                  {isEditingSection('location') ? (
                    <Input
                      value={editData.postalCode ?? restaurantData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 font-medium">{restaurantData.postalCode}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Operations */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  Operations
                </h2>
                
                {!isEditingSection('operations') ? (
                  <Button 
                    onClick={() => toggleEdit('operations')}
                    variant="outline" 
                    size="sm"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => saveSection('operations')}
                      size="sm"
                      disabled={saving}
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      Save
                    </Button>
                    <Button 
                      onClick={() => cancelEdit('operations')}
                      variant="outline" 
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label>Opening Time</Label>
                  {isEditingSection('operations') ? (
                    <Input
                      type="time"
                      value={editData.openingTime ?? restaurantData.openingTime}
                      onChange={(e) => handleInputChange('openingTime', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 font-medium">{restaurantData.openingTime}</p>
                  )}
                </div>

                <div>
                  <Label>Closing Time</Label>
                  {isEditingSection('operations') ? (
                    <Input
                      type="time"
                      value={editData.closingTime ?? restaurantData.closingTime}
                      onChange={(e) => handleInputChange('closingTime', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 font-medium">{restaurantData.closingTime}</p>
                  )}
                </div>

                <div>
                  <Label>Seating Capacity</Label>
                  {isEditingSection('operations') ? (
                    <Input
                      type="number"
                      value={editData.seatingCapacity ?? restaurantData.seatingCapacity}
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <User className="h-5 w-5 text-orange-600" />
                  Manager Information
                </h2>
                
                {!isEditingSection('manager') ? (
                  <Button 
                    onClick={() => toggleEdit('manager')}
                    variant="outline" 
                    size="sm"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => saveSection('manager')}
                      size="sm"
                      disabled={saving}
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      Save
                    </Button>
                    <Button 
                      onClick={() => cancelEdit('manager')}
                      variant="outline" 
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Manager Name</Label>
                  {isEditingSection('manager') ? (
                    <Input
                      value={editData.managerName ?? restaurantData.managerName}
                      onChange={(e) => handleInputChange('managerName', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 font-medium">{restaurantData.managerName}</p>
                  )}
                </div>

                <div>
                  <Label>Manager Phone</Label>
                  {isEditingSection('manager') ? (
                    <Input
                      value={editData.managerPhone ?? restaurantData.managerPhone}
                      onChange={(e) => handleInputChange('managerPhone', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 font-medium">{restaurantData.managerPhone}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label>Manager Email</Label>
                  {isEditingSection('manager') ? (
                    <Input
                      type="email"
                      value={editData.managerEmail ?? restaurantData.managerEmail}
                      onChange={(e) => handleInputChange('managerEmail', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 font-medium">{restaurantData.managerEmail}</p>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Quick Stats
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
                  <span className="text-slate-600">Client ID</span>
                  <p className="font-mono text-xs mt-1 break-all">{restaurantData.clientId}</p>
                </div>
                
                <div>
                  <span className="text-slate-600">Organization ID</span>
                  <p className="font-mono text-xs mt-1 break-all">{restaurantData.organizationId}</p>
                </div>
                
                <div>
                  <span className="text-slate-600">Client Code</span>
                  <p className="font-medium">{restaurantData.clientCode}</p>
                </div>
                
                <div>
                  <span className="text-slate-600">Org Code</span>
                  <p className="font-medium">{restaurantData.orgCode}</p>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/restaurant/orders'}
                >
                  <Utensils className="h-4 w-4 mr-2" />
                  View Orders
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/restaurant/products'}
                >
                  <ChefHat className="h-4 w-4 mr-2" />
                  Manage Menu
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/restaurant/dashboard'}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}