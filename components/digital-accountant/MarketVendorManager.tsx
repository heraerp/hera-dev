'use client'

import React, { useState, useMemo } from 'react'
import { Store, MapPin, Phone, Star, TrendingUp, AlertCircle, Check, X, Plus, Search, Filter } from 'lucide-react'

interface MarketVendor {
  id: string
  name: string
  category: string
  location: string
  contact?: {
    phone?: string
    email?: string
    address?: string
  }
  rating: number
  totalTransactions: number
  totalSpent: number
  averageOrder: number
  reliability: 'high' | 'medium' | 'low'
  priceRange: 'budget' | 'moderate' | 'premium'
  specialties: string[]
  lastTransaction: Date
  paymentTerms: string
  status: 'active' | 'inactive' | 'pending_verification'
  notes?: string
  aiValidation?: {
    confidence: number
    issues: string[]
    verified: boolean
  }
}

interface MarketVendorManagerProps {
  className?: string
}

export default function MarketVendorManager({ className = '' }: MarketVendorManagerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null)
  const [showAddVendor, setShowAddVendor] = useState(false)

  // Mock vendor data
  const mockVendors: MarketVendor[] = [
    {
      id: 'vendor-001',
      name: 'Fresh Fish Market',
      category: 'Seafood',
      location: 'Mushroom Kingdom Fish District',
      contact: {
        phone: '(555) 123-4567',
        address: '123 Harbor Street'
      },
      rating: 4.8,
      totalTransactions: 45,
      totalSpent: 2340.80,
      averageOrder: 52.02,
      reliability: 'high',
      priceRange: 'moderate',
      specialties: ['Fresh Fish', 'Shellfish', 'Seasonal Catch'],
      lastTransaction: new Date('2024-01-20'),
      paymentTerms: 'Cash on delivery',
      status: 'active',
      notes: 'Best quality fish in the kingdom. Always fresh catches.',
      aiValidation: {
        confidence: 0.96,
        issues: [],
        verified: true
      }
    },
    {
      id: 'vendor-002',
      name: 'Koopa Meat Co.',
      category: 'Meat',
      location: 'Central Meat Market',
      contact: {
        phone: '(555) 234-5678',
        address: '456 Butcher Lane'
      },
      rating: 4.5,
      totalTransactions: 32,
      totalSpent: 1890.45,
      averageOrder: 59.08,
      reliability: 'high',
      priceRange: 'premium',
      specialties: ['Prime Beef', 'Organic Poultry', 'Specialty Cuts'],
      lastTransaction: new Date('2024-01-20'),
      paymentTerms: 'Cash only',
      status: 'active',
      aiValidation: {
        confidence: 0.91,
        issues: [],
        verified: true
      }
    },
    {
      id: 'vendor-003',
      name: 'Yoshi Produce Farm',
      category: 'Produce',
      location: 'Organic Farmers Market',
      contact: {
        phone: '(555) 345-6789',
        email: 'yoshi@producefarm.com'
      },
      rating: 4.9,
      totalTransactions: 67,
      totalSpent: 1234.56,
      averageOrder: 18.43,
      reliability: 'high',
      priceRange: 'moderate',
      specialties: ['Organic Vegetables', 'Fresh Herbs', 'Seasonal Fruits'],
      lastTransaction: new Date('2024-01-19'),
      paymentTerms: 'Cash on delivery',
      status: 'active',
      notes: 'Excellent organic produce. Always on time.',
      aiValidation: {
        confidence: 0.98,
        issues: [],
        verified: true
      }
    },
    {
      id: 'vendor-004',
      name: 'Bob-omb\'s Feed & Supply',
      category: 'Specialty',
      location: 'Industrial District',
      contact: {
        phone: '(555) 456-7890'
      },
      rating: 3.2,
      totalTransactions: 3,
      totalSpent: 547.50,
      averageOrder: 182.50,
      reliability: 'medium',
      priceRange: 'budget',
      specialties: ['Emergency Supplies', 'Bulk Items'],
      lastTransaction: new Date('2024-01-17'),
      paymentTerms: 'Cash only',
      status: 'pending_verification',
      notes: 'New vendor - needs verification',
      aiValidation: {
        confidence: 0.67,
        issues: ['Limited transaction history', 'Inconsistent pricing'],
        verified: false
      }
    },
    {
      id: 'vendor-005',
      name: 'Toad\'s Spice Emporium',
      category: 'Spices',
      location: 'Spice Market District',
      contact: {
        phone: '(555) 567-8901',
        email: 'toad@spiceemporium.com'
      },
      rating: 4.6,
      totalTransactions: 28,
      totalSpent: 892.34,
      averageOrder: 31.87,
      reliability: 'high',
      priceRange: 'moderate',
      specialties: ['Rare Spices', 'Herb Blends', 'International Seasonings'],
      lastTransaction: new Date('2024-01-18'),
      paymentTerms: 'Cash on delivery',
      status: 'active',
      aiValidation: {
        confidence: 0.93,
        issues: [],
        verified: true
      }
    }
  ]

  // Filter vendors based on search and category
  const filteredVendors = useMemo(() => {
    return mockVendors.filter(vendor => {
      const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vendor.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = selectedCategory === 'all' || vendor.category.toLowerCase() === selectedCategory.toLowerCase()
      return matchesSearch && matchesCategory
    })
  }, [mockVendors, searchTerm, selectedCategory])

  const categories = useMemo(() => {
    const cats = ['all', ...new Set(mockVendors.map(v => v.category))]
    return cats
  }, [mockVendors])

  const selectedVendorData = selectedVendor 
    ? mockVendors.find(v => v.id === selectedVendor)
    : null

  const getReliabilityColor = (reliability: string) => {
    switch (reliability) {
      case 'high': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'inactive': return 'text-gray-600 bg-gray-100'
      case 'pending_verification': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Store className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Market Vendor Management</h2>
          </div>
          
          <button
            onClick={() => setShowAddVendor(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Vendor
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search vendors or specialties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Vendor List and Detail View */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vendor List */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Vendors ({filteredVendors.length})
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  onClick={() => setSelectedVendor(vendor.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedVendor === vendor.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <h4 className="font-medium text-gray-900">{vendor.name}</h4>
                        {vendor.aiValidation?.verified ? (
                          <Check className="w-4 h-4 text-green-600 ml-2" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-600 ml-2" />
                        )}
                      </div>
                      
                      <div className="flex items-center mb-2">
                        {getRatingStars(vendor.rating)}
                        <span className="ml-2 text-sm text-gray-600">
                          {vendor.rating.toFixed(1)} ({vendor.totalTransactions} orders)
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{vendor.category}</p>
                      
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="w-3 h-3 mr-1" />
                        {vendor.location}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(vendor.status)}`}>
                        {vendor.status.replace('_', ' ')}
                      </span>
                      <span className={`mt-1 px-2 py-1 text-xs rounded-full ${getReliabilityColor(vendor.reliability)}`}>
                        {vendor.reliability}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Total: ${vendor.totalSpent.toFixed(2)}
                    </span>
                    <span className="text-gray-600">
                      Avg: ${vendor.averageOrder.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vendor Detail */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Vendor Details</h3>
            {selectedVendorData ? (
              <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-gray-900">{selectedVendorData.name}</h4>
                  <div className="flex items-center">
                    {selectedVendorData.aiValidation?.verified ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    )}
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <p className="text-gray-900">{selectedVendorData.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Rating</label>
                    <div className="flex items-center">
                      {getRatingStars(selectedVendorData.rating)}
                      <span className="ml-2 text-sm">{selectedVendorData.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                {selectedVendorData.contact && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Contact Information</label>
                    <div className="mt-1 space-y-1">
                      {selectedVendorData.contact.phone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm">{selectedVendorData.contact.phone}</span>
                        </div>
                      )}
                      {selectedVendorData.contact.address && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm">{selectedVendorData.contact.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Business Metrics */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Business Metrics</label>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-600">Total Spent</p>
                      <p className="font-semibold">${selectedVendorData.totalSpent.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-600">Transactions</p>
                      <p className="font-semibold">{selectedVendorData.totalTransactions}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-600">Average Order</p>
                      <p className="font-semibold">${selectedVendorData.averageOrder.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-600">Last Order</p>
                      <p className="font-semibold">{selectedVendorData.lastTransaction.toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Specialties */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Specialties</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedVendorData.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Payment Terms */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Payment Terms</label>
                  <p className="text-gray-900">{selectedVendorData.paymentTerms}</p>
                </div>

                {/* AI Validation */}
                {selectedVendorData.aiValidation && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">AI Validation</label>
                    <div className="mt-2 p-3 bg-gray-50 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Confidence Score</span>
                        <span className="font-medium">
                          {(selectedVendorData.aiValidation.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      {selectedVendorData.aiValidation.issues.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Issues:</p>
                          <ul className="text-xs text-red-600 space-y-1">
                            {selectedVendorData.aiValidation.issues.map((issue, index) => (
                              <li key={index}>• {issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedVendorData.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Notes</label>
                    <p className="text-gray-900 text-sm">{selectedVendorData.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm">
                    Edit Vendor
                  </button>
                  {selectedVendorData.status === 'pending_verification' && (
                    <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm">
                      Verify
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-8 text-center text-gray-500">
                <Store className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Select a vendor to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}