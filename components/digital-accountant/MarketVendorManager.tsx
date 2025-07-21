'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Store, MapPin, Phone, Star, TrendingUp, AlertCircle, Check, X, Plus, Search, Filter, Loader2 } from 'lucide-react'
import { useCashMarketAPI, type CashMarketVendor } from '@/hooks/useCashMarketAPI'

// Using CashMarketVendor from the API hook

interface MarketVendorManagerProps {
  className?: string
}

export default function MarketVendorManager({ className = '' }: MarketVendorManagerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null)
  const [showAddVendor, setShowAddVendor] = useState(false)
  const [vendors, setVendors] = useState<CashMarketVendor[]>([])
  const [newVendor, setNewVendor] = useState({
    name: '',
    category: '',
    location: '',
    contact: { phone: '', email: '', address: '' },
    priceRange: 'moderate' as const,
    specialties: [] as string[],
    paymentTerms: 'Cash on delivery',
    notes: ''
  })

  const { vendors: vendorAPI, loading, error, clearError } = useCashMarketAPI()

  // Load vendors on component mount
  useEffect(() => {
    loadVendors()
  }, [])

  const loadVendors = async () => {
    try {
      const response = await vendorAPI.list({ category: selectedCategory !== 'all' ? selectedCategory : undefined, search: searchTerm })
      setVendors(response.data)
    } catch (err) {
      console.error('Failed to load vendors:', err)
    }
  }

  // Reload when filters change
  useEffect(() => {
    loadVendors()
  }, [selectedCategory, searchTerm])

  const handleAddVendor = async () => {
    if (!newVendor.name || !newVendor.category || !newVendor.location) {
      alert('Please fill in all required fields')
      return
    }

    try {
      await vendorAPI.create({
        name: newVendor.name,
        category: newVendor.category,
        location: newVendor.location,
        contact: newVendor.contact,
        priceRange: newVendor.priceRange,
        specialties: newVendor.specialties,
        paymentTerms: newVendor.paymentTerms,
        notes: newVendor.notes
      })
      
      // Reset form and reload vendors
      setNewVendor({
        name: '',
        category: '',
        location: '',
        contact: { phone: '', email: '', address: '' },
        priceRange: 'moderate',
        specialties: [],
        paymentTerms: 'Cash on delivery',
        notes: ''
      })
      setShowAddVendor(false)
      loadVendors()
    } catch (err) {
      console.error('Failed to create vendor:', err)
    }
  }

  // Mock vendors are removed - using real API data in 'vendors' state

  // Filter vendors based on search and category
  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor => {
      const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (vendor.specialties || []).some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = selectedCategory === 'all' || vendor.category.toLowerCase() === selectedCategory.toLowerCase()
      return matchesSearch && matchesCategory
    })
  }, [vendors, searchTerm, selectedCategory])

  const categories = useMemo(() => {
    const cats = ['all', ...new Set(vendors.map(v => v.category))]
    return cats
  }, [vendors])

  const selectedVendorData = selectedVendor 
    ? vendors.find(v => v.id === selectedVendor)
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

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
              <button
                onClick={clearError}
                className="text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

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

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin mr-2" />
            <span className="text-gray-600">Loading vendors...</span>
          </div>
        )}

        {/* Vendor List and Detail View */}
        {!loading && (
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
                      {getRatingStars(selectedVendorData.rating || 0)}
                      <span className="ml-2 text-sm">{(selectedVendorData.rating || 0).toFixed(1)}</span>
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
                      <p className="font-semibold">${(selectedVendorData.totalSpent || 0).toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-600">Transactions</p>
                      <p className="font-semibold">{selectedVendorData.totalTransactions || 0}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-600">Average Order</p>
                      <p className="font-semibold">${(selectedVendorData.averageOrder || 0).toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-600">Last Order</p>
                      <p className="font-semibold">{selectedVendorData.lastTransaction ? new Date(selectedVendorData.lastTransaction).toLocaleDateString() : 'No orders yet'}</p>
                    </div>
                  </div>
                </div>

                {/* Specialties */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Specialties</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(selectedVendorData.specialties || []).map((specialty, index) => (
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
                  <p className="text-gray-900">{selectedVendorData.paymentTerms || 'Not specified'}</p>
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
        )}

        {/* Add Vendor Modal */}
        {showAddVendor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Add New Vendor</h3>
                <button
                  onClick={() => setShowAddVendor(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={newVendor.name}
                    onChange={(e) => setNewVendor(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Vendor name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <input
                    type="text"
                    value={newVendor.category}
                    onChange={(e) => setNewVendor(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Seafood, Meat, Produce"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <input
                    type="text"
                    value={newVendor.location}
                    onChange={(e) => setNewVendor(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Market location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={newVendor.contact.phone}
                    onChange={(e) => setNewVendor(prev => ({ ...prev, contact: { ...prev.contact, phone: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                  <select
                    value={newVendor.priceRange}
                    onChange={(e) => setNewVendor(prev => ({ ...prev, priceRange: e.target.value as 'budget' | 'moderate' | 'premium' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="budget">Budget</option>
                    <option value="moderate">Moderate</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={newVendor.notes}
                    onChange={(e) => setNewVendor(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Additional notes"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddVendor(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddVendor}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 flex items-center"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Add Vendor
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}