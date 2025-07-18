'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  ChefHat, Package, DollarSign, Users, Settings, 
  ArrowRight, ArrowLeft, Check, Clock, Star,
  Plus, Trash2, Edit, Coffee, Cake, Utensils,
  Camera, Upload, Save, RefreshCw, AlertCircle,
  CheckCircle, Loader2, Eye, BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/revolutionary-card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement'
import { useProducts } from '@/hooks/useProducts'

interface Product {
  id?: string
  name: string
  description: string
  price: number
  category: string
  isAvailable: boolean
  preparationTime: number
  allergens: string[]
  isVegetarian: boolean
  isVegan: boolean
  calories?: number
  image?: string
}

interface StaffMember {
  name: string
  role: string
  email: string
  phone: string
  shift: string
}

interface OperatingHours {
  [key: string]: {
    isOpen: boolean
    openTime: string
    closeTime: string
  }
}

const WIZARD_STEPS = [
  { id: 'products', title: 'Menu & Products', icon: Package, description: 'Add your menu items and products' },
  { id: 'pricing', title: 'Pricing & Options', icon: DollarSign, description: 'Set pricing and customization options' },
  { id: 'staff', title: 'Staff Setup', icon: Users, description: 'Add your team members' },
  { id: 'operations', title: 'Operations', icon: Settings, description: 'Configure operating hours and policies' },
  { id: 'review', title: 'Review & Launch', icon: CheckCircle, description: 'Review setup and go live' }
]

const CATEGORIES = [
  'Hot Beverages', 'Cold Beverages', 'Pastries & Desserts', 'Light Meals', 
  'Appetizers', 'Main Course', 'Desserts', 'Beverages', 'Specials'
]

const ALLERGENS = [
  'Nuts', 'Dairy', 'Gluten', 'Soy', 'Eggs', 'Fish', 'Shellfish', 'Sesame'
]

const DAYS_OF_WEEK = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
]

export default function RestaurantSetupWizard() {
  const router = useRouter()
  const { 
    restaurantData, 
    allRestaurants,
    hasMultipleRestaurants,
    loading: restaurantLoading,
    error: restaurantError
  } = useRestaurantManagement()
  const { createProduct } = useProducts()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  
  // Products state
  const [products, setProducts] = useState<Product[]>([])
  const [newProduct, setNewProduct] = useState<Product>({
    name: '',
    description: '',
    price: 0,
    category: 'Hot Beverages',
    isAvailable: true,
    preparationTime: 5,
    allergens: [],
    isVegetarian: false,
    isVegan: false,
    calories: 0
  })
  
  // Staff state
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [newStaff, setNewStaff] = useState<StaffMember>({
    name: '',
    role: 'Server',
    email: '',
    phone: '',
    shift: 'Full Time'
  })
  
  // Operations state
  const [operatingHours, setOperatingHours] = useState<OperatingHours>(() => {
    const defaultHours: OperatingHours = {}
    DAYS_OF_WEEK.forEach(day => {
      defaultHours[day] = {
        isOpen: true,
        openTime: '08:00',
        closeTime: '22:00'
      }
    })
    return defaultHours
  })
  
  const [policies, setPolicies] = useState({
    takesTakeaway: true,
    takesReservations: true,
    acceptsCards: true,
    acceptsCash: true,
    hasWifi: true,
    parkingAvailable: false,
    deliveryAvailable: false,
    minimumOrder: 0,
    deliveryFee: 0
  })

  // Redirect if no restaurant data - handle multi-restaurant case
  useEffect(() => {
    if (!restaurantLoading && !restaurantData) {
      if (hasMultipleRestaurants && allRestaurants.length > 0) {
        // User has multiple restaurants but none selected - redirect to selection
        console.log('🔀 User has multiple restaurants, redirecting to selection...')
        router.push('/restaurant/select?redirect=/restaurant/setup-wizard')
      } else if (allRestaurants.length === 0) {
        // User has no restaurants - redirect to setup
        console.log('🏗️ User has no restaurants, redirecting to setup...')
        router.push('/setup/restaurant')
      }
      // Otherwise, stay on setup wizard (single restaurant case)
    }
  }, [restaurantLoading, restaurantData, hasMultipleRestaurants, allRestaurants.length, router])

  const addProduct = () => {
    if (newProduct.name && newProduct.price > 0) {
      setProducts([...products, { ...newProduct, id: Date.now().toString() }])
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        category: 'Hot Beverages',
        isAvailable: true,
        preparationTime: 5,
        allergens: [],
        isVegetarian: false,
        isVegan: false,
        calories: 0
      })
    }
  }

  const removeProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id))
  }

  const addStaff = () => {
    if (newStaff.name && newStaff.email) {
      setStaff([...staff, newStaff])
      setNewStaff({
        name: '',
        role: 'Server',
        email: '',
        phone: '',
        shift: 'Full Time'
      })
    }
  }

  const removeStaff = (index: number) => {
    setStaff(staff.filter((_, i) => i !== index))
  }

  const nextStep = async () => {
    // Validate current step
    if (currentStep === 0 && products.length === 0) {
      alert('Please add at least one product to continue.')
      return
    }
    
    if (currentStep === 2 && staff.length === 0) {
      alert('Please add at least one staff member to continue.')
      return
    }

    // Mark step as completed
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep])
    }

    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeSetup = async () => {
    if (!restaurantData) return

    setIsSubmitting(true)
    try {
      console.log('🚀 Starting complete restaurant setup...')
      
      // Save all products to database
      console.log('📦 Saving products to database...')
      for (const product of products) {
        await createProduct({
          organizationId: restaurantData.organizationId,
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          isAvailable: product.isAvailable,
          preparationTime: product.preparationTime,
          allergens: product.allergens,
          isVegetarian: product.isVegetarian,
          isVegan: product.isVegan,
          calories: product.calories
        })
      }
      console.log(`✅ ${products.length} products saved successfully`)

      // Save operating hours to metadata
      console.log('⏰ Saving operating hours...')
      await fetch('/api/restaurant/operating-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: restaurantData.organizationId,
          operatingHours
        })
      })
      console.log('✅ Operating hours saved')
      
      // Save policies to metadata
      console.log('📋 Saving restaurant policies...')
      await fetch('/api/restaurant/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: restaurantData.organizationId,
          policies
        })
      })
      console.log('✅ Restaurant policies saved')
      
      // Save staff data to Universal Staff Service
      console.log('👥 Saving staff members...')
      for (const staffMember of staff) {
        await fetch('/api/restaurant/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            organizationId: restaurantData.organizationId,
            ...staffMember
          })
        })
      }
      console.log(`✅ ${staff.length} staff members saved`)
      
      console.log('🎉 Restaurant setup completed successfully!')
      router.push('/restaurant/dashboard')
      
    } catch (error) {
      console.error('❌ Setup completion failed:', error)
      alert('Setup failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleAllergen = (allergen: string) => {
    const allergens = newProduct.allergens.includes(allergen)
      ? newProduct.allergens.filter(a => a !== allergen)
      : [...newProduct.allergens, allergen]
    setNewProduct({ ...newProduct, allergens })
  }

  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100

  if (restaurantLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading restaurant data...</p>
        </Card>
      </div>
    )
  }

  if (!restaurantData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Restaurant Setup Wizard</h1>
              <p className="text-gray-600">{restaurantData.businessName} - Complete your restaurant setup</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Progress</div>
              <div className="flex items-center gap-2">
                <Progress value={progress} className="w-32" />
                <span className="text-sm font-medium">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Steps Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {WIZARD_STEPS.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isCompleted = completedSteps.includes(index)
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    relative p-3 rounded-full border-2 transition-all duration-300
                    ${isActive ? 'bg-blue-600 border-blue-600 text-white' : ''}
                    ${isCompleted ? 'bg-green-600 border-green-600 text-white' : ''}
                    ${!isActive && !isCompleted ? 'bg-gray-100 border-gray-300 text-gray-500' : ''}
                  `}>
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="ml-3 hidden md:block">
                    <div className={`font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                      {step.title}
                    </div>
                    <div className="text-sm text-gray-500">{step.description}</div>
                  </div>
                  {index < WIZARD_STEPS.length - 1 && (
                    <div className="w-8 h-0.5 bg-gray-300 mx-4 hidden md:block" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Products Step */}
            {currentStep === 0 && (
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Package className="w-8 h-8 text-blue-600" />
                  <div>
                    <h2 className="text-2xl font-bold">Menu & Products</h2>
                    <p className="text-gray-600">Add your menu items and products</p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Add Product Form */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Add New Product</h3>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Product Name *</Label>
                          <Input
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                            placeholder="e.g., Cappuccino"
                          />
                        </div>
                        <div>
                          <Label>Category</Label>
                          <Select value={newProduct.category} onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={newProduct.description}
                          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                          placeholder="Describe your product..."
                          rows={3}
                        />
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label>Price *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <Label>Prep Time (minutes)</Label>
                          <Input
                            type="number"
                            value={newProduct.preparationTime}
                            onChange={(e) => setNewProduct({ ...newProduct, preparationTime: parseInt(e.target.value) || 5 })}
                          />
                        </div>
                        <div>
                          <Label>Calories (optional)</Label>
                          <Input
                            type="number"
                            value={newProduct.calories || ''}
                            onChange={(e) => setNewProduct({ ...newProduct, calories: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label>Dietary Options</Label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2">
                            <Switch
                              checked={newProduct.isVegetarian}
                              onCheckedChange={(checked) => setNewProduct({ ...newProduct, isVegetarian: checked })}
                            />
                            <span>Vegetarian</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <Switch
                              checked={newProduct.isVegan}
                              onCheckedChange={(checked) => setNewProduct({ ...newProduct, isVegan: checked })}
                            />
                            <span>Vegan</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <Switch
                              checked={newProduct.isAvailable}
                              onCheckedChange={(checked) => setNewProduct({ ...newProduct, isAvailable: checked })}
                            />
                            <span>Available</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <Label>Allergens</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {ALLERGENS.map(allergen => (
                            <Badge
                              key={allergen}
                              variant={newProduct.allergens.includes(allergen) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => toggleAllergen(allergen)}
                            >
                              {allergen}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button onClick={addProduct} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                      </Button>
                    </div>
                  </div>

                  {/* Products List */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Your Menu ({products.length} items)</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {products.map((product) => (
                        <Card key={product.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{product.name}</h4>
                                <Badge variant="outline" className="text-xs">{product.category}</Badge>
                                {product.isVegetarian && <Badge className="bg-green-100 text-green-800 text-xs">Veg</Badge>}
                                {product.isVegan && <Badge className="bg-green-100 text-green-800 text-xs">Vegan</Badge>}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>${product.price.toFixed(2)}</span>
                                <span>{product.preparationTime} min</span>
                                {product.allergens.length > 0 && (
                                  <span>Allergens: {product.allergens.join(', ')}</span>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeProduct(product.id!)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                      {products.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No products added yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Pricing Step */}
            {currentStep === 1 && (
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <DollarSign className="w-8 h-8 text-blue-600" />
                  <div>
                    <h2 className="text-2xl font-bold">Pricing & Options</h2>
                    <p className="text-gray-600">Set pricing strategies and customization options</p>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Pricing Strategy */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Pricing Strategy</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card className="p-6 border-2 border-blue-200 bg-blue-50">
                        <h4 className="font-semibold text-blue-900 mb-2">Value-Based Pricing</h4>
                        <p className="text-sm text-blue-700 mb-4">Price based on customer perceived value and competition</p>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Hot Beverages</span>
                            <span className="font-medium">$3.50 - $6.00</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Cold Beverages</span>
                            <span className="font-medium">$4.00 - $7.00</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Pastries</span>
                            <span className="font-medium">$2.50 - $5.00</span>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-6 border-2 border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-2">Cost-Plus Pricing</h4>
                        <p className="text-sm text-gray-600 mb-4">Price based on cost plus desired profit margin</p>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Target Margin</span>
                            <span className="font-medium">65-75%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Food Cost</span>
                            <span className="font-medium">25-30%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Labor Cost</span>
                            <span className="font-medium">30-35%</span>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>

                  {/* Tax Settings */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Tax Configuration</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label>Sales Tax Rate (%)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="8.25"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Service Charge (%)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="10.00"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Gratuity (%)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="18.00"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Discount Options */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Discount & Loyalty Options</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">Student Discount</h4>
                          <p className="text-sm text-gray-600">10% off for students with valid ID</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">Happy Hour</h4>
                          <p className="text-sm text-gray-600">20% off beverages 3-5 PM weekdays</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">Loyalty Program</h4>
                          <p className="text-sm text-gray-600">Earn points for every purchase</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Staff Step */}
            {currentStep === 2 && (
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div>
                    <h2 className="text-2xl font-bold">Staff Setup</h2>
                    <p className="text-gray-600">Add your team members</p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Add Staff Form */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Add Staff Member</h3>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Full Name *</Label>
                          <Input
                            value={newStaff.name}
                            onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                            placeholder="e.g., Sarah Johnson"
                          />
                        </div>
                        <div>
                          <Label>Role</Label>
                          <Select value={newStaff.role} onValueChange={(value) => setNewStaff({ ...newStaff, role: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Manager">Manager</SelectItem>
                              <SelectItem value="Server">Server</SelectItem>
                              <SelectItem value="Chef">Chef</SelectItem>
                              <SelectItem value="Barista">Barista</SelectItem>
                              <SelectItem value="Cashier">Cashier</SelectItem>
                              <SelectItem value="Cleaner">Cleaner</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Email *</Label>
                          <Input
                            type="email"
                            value={newStaff.email}
                            onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                            placeholder="sarah@restaurant.com"
                          />
                        </div>
                        <div>
                          <Label>Phone</Label>
                          <Input
                            value={newStaff.phone}
                            onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                            placeholder="+1 234 567 8900"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Shift</Label>
                        <Select value={newStaff.shift} onValueChange={(value) => setNewStaff({ ...newStaff, shift: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Full Time">Full Time</SelectItem>
                            <SelectItem value="Part Time">Part Time</SelectItem>
                            <SelectItem value="Morning">Morning</SelectItem>
                            <SelectItem value="Evening">Evening</SelectItem>
                            <SelectItem value="Weekend">Weekend</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button onClick={addStaff} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Staff Member
                      </Button>
                    </div>
                  </div>

                  {/* Staff List */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Team Members ({staff.length})</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {staff.map((member, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{member.name}</h4>
                                <Badge variant="outline">{member.role}</Badge>
                                <Badge className="bg-blue-100 text-blue-800">{member.shift}</Badge>
                              </div>
                              <div className="text-sm text-gray-600">
                                <p>{member.email}</p>
                                {member.phone && <p>{member.phone}</p>}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeStaff(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                      {staff.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No staff members added yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Operations Step */}
            {currentStep === 3 && (
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Settings className="w-8 h-8 text-blue-600" />
                  <div>
                    <h2 className="text-2xl font-bold">Operations</h2>
                    <p className="text-gray-600">Configure operating hours and policies</p>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Operating Hours */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Operating Hours</h3>
                    <div className="space-y-4">
                      {DAYS_OF_WEEK.map((day) => (
                        <div key={day} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="w-24">
                            <label className="flex items-center gap-2">
                              <Switch
                                checked={operatingHours[day].isOpen}
                                onCheckedChange={(checked) => 
                                  setOperatingHours({
                                    ...operatingHours,
                                    [day]: { ...operatingHours[day], isOpen: checked }
                                  })
                                }
                              />
                              <span className="text-sm font-medium capitalize">
                                {day.charAt(0).toUpperCase() + day.slice(1)}
                              </span>
                            </label>
                          </div>
                          {operatingHours[day].isOpen && (
                            <div className="flex items-center gap-4">
                              <div>
                                <Label className="text-xs">Open</Label>
                                <Input
                                  type="time"
                                  value={operatingHours[day].openTime}
                                  onChange={(e) => 
                                    setOperatingHours({
                                      ...operatingHours,
                                      [day]: { ...operatingHours[day], openTime: e.target.value }
                                    })
                                  }
                                  className="w-32"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Close</Label>
                                <Input
                                  type="time"
                                  value={operatingHours[day].closeTime}
                                  onChange={(e) => 
                                    setOperatingHours({
                                      ...operatingHours,
                                      [day]: { ...operatingHours[day], closeTime: e.target.value }
                                    })
                                  }
                                  className="w-32"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Restaurant Policies */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Restaurant Policies</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-700">Service Options</h4>
                        <div className="space-y-3">
                          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm">Takeaway Orders</span>
                            <Switch
                              checked={policies.takesTakeaway}
                              onCheckedChange={(checked) => setPolicies({...policies, takesTakeaway: checked})}
                            />
                          </label>
                          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm">Table Reservations</span>
                            <Switch
                              checked={policies.takesReservations}
                              onCheckedChange={(checked) => setPolicies({...policies, takesReservations: checked})}
                            />
                          </label>
                          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm">Delivery Service</span>
                            <Switch
                              checked={policies.deliveryAvailable}
                              onCheckedChange={(checked) => setPolicies({...policies, deliveryAvailable: checked})}
                            />
                          </label>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-700">Payment & Amenities</h4>
                        <div className="space-y-3">
                          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm">Cash Payments</span>
                            <Switch
                              checked={policies.acceptsCash}
                              onCheckedChange={(checked) => setPolicies({...policies, acceptsCash: checked})}
                            />
                          </label>
                          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm">Card Payments</span>
                            <Switch
                              checked={policies.acceptsCards}
                              onCheckedChange={(checked) => setPolicies({...policies, acceptsCards: checked})}
                            />
                          </label>
                          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm">Free WiFi</span>
                            <Switch
                              checked={policies.hasWifi}
                              onCheckedChange={(checked) => setPolicies({...policies, hasWifi: checked})}
                            />
                          </label>
                          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm">Parking Available</span>
                            <Switch
                              checked={policies.parkingAvailable}
                              onCheckedChange={(checked) => setPolicies({...policies, parkingAvailable: checked})}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Settings */}
                  {policies.deliveryAvailable && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Delivery Settings</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Minimum Order ($)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={policies.minimumOrder}
                            onChange={(e) => setPolicies({...policies, minimumOrder: parseFloat(e.target.value) || 0})}
                            placeholder="15.00"
                          />
                        </div>
                        <div>
                          <Label>Delivery Fee ($)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={policies.deliveryFee}
                            onChange={(e) => setPolicies({...policies, deliveryFee: parseFloat(e.target.value) || 0})}
                            placeholder="3.99"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Review Step */}
            {currentStep === 4 && (
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <h2 className="text-2xl font-bold">Review & Launch</h2>
                    <p className="text-gray-600">Review your setup and launch your restaurant</p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Setup Summary</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-green-600" />
                          <div>
                            <div className="font-medium">Products</div>
                            <div className="text-sm text-gray-600">{products.length} menu items added</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-blue-600" />
                          <div>
                            <div className="font-medium">Staff</div>
                            <div className="text-sm text-gray-600">{staff.length} team members added</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Settings className="w-5 h-5 text-purple-600" />
                          <div>
                            <div className="font-medium">Operations</div>
                            <div className="text-sm text-gray-600">
                              {Object.values(operatingHours).filter(h => h.isOpen).length} days open, 
                              {policies.deliveryAvailable ? 'Delivery enabled' : 'Dine-in only'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-orange-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <DollarSign className="w-5 h-5 text-orange-600" />
                          <div>
                            <div className="font-medium">Pricing</div>
                            <div className="text-sm text-gray-600">Value-based pricing strategy configured</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8">
                      <Button
                        size="lg"
                        onClick={completeSetup}
                        disabled={isSubmitting || products.length === 0}
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="w-5 h-5 mr-2" />
                        )}
                        {isSubmitting ? 'Setting up...' : 'Complete Setup & Launch'}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">What's Next?</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <div className="font-medium">Dashboard Analytics</div>
                          <div className="text-sm text-gray-600">View real-time analytics and insights</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Coffee className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div>
                          <div className="font-medium">Start Taking Orders</div>
                          <div className="text-sm text-gray-600">Begin processing customer orders</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Eye className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div>
                          <div className="font-medium">Monitor Performance</div>
                          <div className="text-sm text-gray-600">Track sales, staff, and customer satisfaction</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Step {currentStep + 1} of {WIZARD_STEPS.length}
            </p>
          </div>

          {currentStep < WIZARD_STEPS.length - 1 ? (
            <Button onClick={nextStep}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={completeSetup}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Complete Setup
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}