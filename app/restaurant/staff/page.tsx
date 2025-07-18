'use client'

import { useState, useEffect } from 'react'
// import { motion } from 'framer-motion' // Temporarily disabled
import { PageErrorBoundary } from '@/components/error-boundaries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/ui/navbar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import UniversalBulkUpload from '@/components/ui/universal-bulk-upload'
// import HERAUniversalCRUD from '@/templates/crud/components/HERAUniversalCRUD'
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement'
import { 
  Users, Plus, ArrowLeft, Settings, Clock, Target, Upload, 
  UserCheck, Calendar, DollarSign, Shield, Award, TrendingUp,
  AlertCircle, CheckCircle, XCircle, Eye, Edit, Trash2,
  Filter, Search, Download, BarChart3, Brain, Zap
} from 'lucide-react'
import Link from 'next/link'

// Staff Form Component
function StaffForm({ onSuccess, onCancel, organizationId, isEdit = false, initialData = null }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    position: initialData?.position || '',
    department: initialData?.department || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    hire_date: initialData?.hire_date || '',
    employment_type: initialData?.employment_type || '',
    salary: initialData?.salary || '',
    hourly_rate: initialData?.hourly_rate || '',
    address: initialData?.address || '',
    emergency_contact: initialData?.emergency_contact || '',
    emergency_phone: initialData?.emergency_phone || '',
    date_of_birth: initialData?.date_of_birth || '',
    shift_schedule: initialData?.shift_schedule || '',
    access_level: initialData?.access_level || '',
    notes: initialData?.notes || ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (isEdit) {
        // Edit mode - call the onSuccess handler with the form data
        onSuccess(formData)
      } else {
        // Create mode - make API call
        const response = await fetch('/api/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            organizationId
          })
        })

        const data = await response.json()
        
        if (data.success) {
          onSuccess()
        } else {
          console.error('Failed to create staff:', data.error)
          alert(`Failed to create staff: ${data.error}`)
        }
      }
    } catch (error) {
      console.error('Error submitting staff form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        {isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
            <input
              type="text"
              value={initialData?.employee_id || 'Auto-generated'}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
          <select
            name="position"
            value={formData.position}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Select Position</option>
            {TOYOTA_STAFF_POSITIONS.map(pos => (
              <option key={pos.value} value={pos.value}>{pos.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
          <select
            name="department"
            value={formData.department}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Select Department</option>
            {TOYOTA_DEPARTMENTS.map(dept => (
              <option key={dept.value} value={dept.value}>{dept.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date *</label>
          <input
            type="date"
            name="hire_date"
            value={formData.hire_date}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type *</label>
          <select
            name="employment_type"
            value={formData.employment_type}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Select Type</option>
            {EMPLOYMENT_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Additional Fields */}
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Salary</label>
          <input
            type="number"
            name="salary"
            value={formData.salary}
            onChange={handleInputChange}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate</label>
          <input
            type="number"
            name="hourly_rate"
            value={formData.hourly_rate}
            onChange={handleInputChange}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
          <input
            type="text"
            name="emergency_contact"
            value={formData.emergency_contact}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Phone</label>
          <input
            type="tel"
            name="emergency_phone"
            value={formData.emergency_phone}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Access Level</label>
          <select
            name="access_level"
            value={formData.access_level}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Select Access Level</option>
            <option value="basic">Basic</option>
            <option value="advanced">Advanced</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Additional notes about the staff member..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          {isSubmitting 
            ? (isEdit ? 'Updating...' : 'Creating...') 
            : (isEdit ? 'Update Staff Member' : 'Create Staff Member')
          }
        </Button>
      </div>
    </form>
  )
}

// Toyota Production System Staff Configuration
const TOYOTA_STAFF_POSITIONS = [
  { value: 'manager', label: 'Manager', department: 'management', level: 'advanced' },
  { value: 'chef', label: 'Chef', department: 'kitchen', level: 'advanced' },
  { value: 'server', label: 'Server', department: 'service', level: 'basic' },
  { value: 'cashier', label: 'Cashier', department: 'service', level: 'basic' },
  { value: 'kitchen_staff', label: 'Kitchen Staff', department: 'kitchen', level: 'basic' },
  { value: 'cleaner', label: 'Cleaner', department: 'cleaning', level: 'basic' },
  { value: 'host', label: 'Host', department: 'service', level: 'basic' }
]

const TOYOTA_DEPARTMENTS = [
  { value: 'kitchen', label: 'Kitchen', color: 'bg-orange-100 text-orange-800' },
  { value: 'service', label: 'Service', color: 'bg-blue-100 text-blue-800' },
  { value: 'management', label: 'Management', color: 'bg-purple-100 text-purple-800' },
  { value: 'cleaning', label: 'Cleaning', color: 'bg-green-100 text-green-800' },
  { value: 'delivery', label: 'Delivery', color: 'bg-yellow-100 text-yellow-800' }
]

const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full Time', color: 'bg-green-100 text-green-800' },
  { value: 'part_time', label: 'Part Time', color: 'bg-blue-100 text-blue-800' },
  { value: 'contract', label: 'Contract', color: 'bg-purple-100 text-purple-800' },
  { value: 'temporary', label: 'Temporary', color: 'bg-orange-100 text-orange-800' }
]

// Staff Fields Configuration (Toyota Standardized Work)
const STAFF_FIELDS = [
  { key: 'name', label: 'Full Name', type: 'text', required: true, searchable: true, showInList: true },
  { key: 'employee_id', label: 'Employee ID', type: 'text', required: false, searchable: true, showInList: true },
  { key: 'position', label: 'Position', type: 'select', required: true, options: TOYOTA_STAFF_POSITIONS.map(p => ({ value: p.value, label: p.label })), showInList: true },
  { key: 'department', label: 'Department', type: 'select', required: true, options: TOYOTA_DEPARTMENTS.map(d => ({ value: d.value, label: d.label })), showInList: true },
  { key: 'email', label: 'Email', type: 'email', required: true, searchable: true, showInList: true },
  { key: 'phone', label: 'Phone', type: 'tel', required: true, searchable: true, showInList: true },
  { key: 'hire_date', label: 'Hire Date', type: 'date', required: true, showInList: true },
  { key: 'employment_type', label: 'Employment Type', type: 'select', required: true, options: EMPLOYMENT_TYPES.map(e => ({ value: e.value, label: e.label })), showInList: true },
  { key: 'salary', label: 'Monthly Salary', type: 'number', required: false, showInList: false },
  { key: 'hourly_rate', label: 'Hourly Rate', type: 'number', required: false, showInList: false },
  { key: 'address', label: 'Address', type: 'textarea', required: false, showInList: false },
  { key: 'emergency_contact', label: 'Emergency Contact', type: 'text', required: false, showInList: false },
  { key: 'emergency_phone', label: 'Emergency Phone', type: 'tel', required: false, showInList: false },
  { key: 'date_of_birth', label: 'Date of Birth', type: 'date', required: false, showInList: false },
  { key: 'shift_schedule', label: 'Shift Schedule', type: 'text', required: false, showInList: false },
  { key: 'access_level', label: 'Access Level', type: 'select', required: false, options: [
    { value: 'basic', label: 'Basic' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'admin', label: 'Admin' }
  ], showInList: false },
  { key: 'notes', label: 'Notes', type: 'textarea', required: false, showInList: false }
]

export default function StaffManagementPage() {
  const [activeTab, setActiveTab] = useState('management')
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [showAddStaff, setShowAddStaff] = useState(false)
  const [showEditStaff, setShowEditStaff] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [staffList, setStaffList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [staffStats, setStaffStats] = useState({
    total: 0,
    active: 0,
    departments: {},
    positions: {},
    recentHires: 0
  })

  const { restaurantData, loading, error } = useRestaurantManagement()

  // Load staff data when component mounts
  useEffect(() => {
    if (restaurantData?.organizationId) {
      loadStaffData()
    }
  }, [restaurantData])

  const loadStaffData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/staff?organizationId=${restaurantData.organizationId}`)
      const data = await response.json()
      
      if (data.success) {
        setStaffList(data.staff || [])
        calculateStats(data.staff || [])
      }
    } catch (error) {
      console.error('Failed to load staff data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStats = (staff) => {
    const stats = {
      total: staff.length,
      active: staff.filter(s => s.is_active).length,
      departments: {},
      positions: {},
      recentHires: 0
    }

    staff.forEach(member => {
      const dept = member.department || 'unassigned'
      const pos = member.position || 'unassigned'
      
      stats.departments[dept] = (stats.departments[dept] || 0) + 1
      stats.positions[pos] = (stats.positions[pos] || 0) + 1
      
      const hireDate = new Date(member.hire_date)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      if (hireDate > thirtyDaysAgo) {
        stats.recentHires++
      }
    })

    setStaffStats(stats)
  }

  const handleDeleteStaff = async (staffMember) => {
    if (!confirm(`Are you sure you want to delete ${staffMember.name}?`)) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/staff?id=${staffMember.id}&organizationId=${organizationId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        await loadStaffData() // Refresh the list
      } else {
        alert(`Failed to delete staff: ${data.error}`)
      }
    } catch (error) {
      console.error('Error deleting staff:', error)
      alert('Failed to delete staff member')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditStaff = (staffMember) => {
    setSelectedStaff(staffMember)
    setShowEditStaff(true)
  }

  const handleUpdateStaff = async (updates) => {
    try {
      const response = await fetch('/api/staff', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: selectedStaff.id,
          organizationId: organizationId,
          ...updates
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setShowEditStaff(false)
        setSelectedStaff(null)
        await loadStaffData() // Refresh the list
      } else {
        alert(`Failed to update staff: ${data.error}`)
      }
    } catch (error) {
      console.error('Error updating staff:', error)
      alert('Failed to update staff member')
    }
  }

  // Toyota Production System - Stop & Fix (Jidoka)
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading staff management system...</p>
        </div>
      </div>
    )
  }

  if (error || !restaurantData) {
    return (
      <PageErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Restaurant Setup Required</h2>
              <p className="text-gray-600 mb-6">Please complete your restaurant setup before managing staff.</p>
              <Link href="/restaurant/setup">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                  Complete Setup
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </PageErrorBoundary>
    )
  }

  const organizationId = restaurantData.organizationId

  return (
    <PageErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        {/* Navigation */}
        <Navbar />
        
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">
            <div className="text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Staff Management System
                </h1>
                <p className="text-xl text-emerald-100 mb-4">
                  Toyota Production System for Restaurant Operations
                </p>
                <div className="flex items-center justify-center gap-6 text-emerald-200 text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    <span>Standardized Work</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Just-in-Time Scheduling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Continuous Improvement</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4 md:p-6 -mt-8 relative z-10">
          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{staffStats.total}</div>
                  <div className="text-sm text-gray-600">Total Staff</div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{staffStats.active}</div>
                  <div className="text-sm text-gray-600">Active Staff</div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{staffStats.recentHires}</div>
                  <div className="text-sm text-gray-600">Recent Hires</div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{Object.keys(staffStats.departments).length}</div>
                  <div className="text-sm text-gray-600">Departments</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-gray-200 bg-gray-50/50">
                <TabsList className="grid w-full grid-cols-4 bg-transparent border-none">
                  <TabsTrigger value="management" className="py-4 px-6">
                    <Users className="w-4 h-4 mr-2" />
                    Staff Management
                  </TabsTrigger>
                  <TabsTrigger value="scheduling" className="py-4 px-6">
                    <Calendar className="w-4 h-4 mr-2" />
                    Scheduling
                  </TabsTrigger>
                  <TabsTrigger value="performance" className="py-4 px-6">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Performance
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="py-4 px-6">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="management" className="p-6">
                <div className="space-y-6">
                  {/* Action Buttons */}
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">Staff Management</h2>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => setShowBulkUpload(true)}
                        variant="outline"
                        className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Bulk Upload
                      </Button>
                      <Button 
                        onClick={() => setShowAddStaff(true)}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Staff Member
                      </Button>
                    </div>
                  </div>

                  {/* Staff Management Table */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {isLoading ? (
                      <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading staff data...</p>
                      </div>
                    ) : staffList.length === 0 ? (
                      <div className="p-8 text-center">
                        <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-semibold mb-2">No Staff Members Yet</h3>
                        <p className="text-gray-600 mb-6">Start building your team by adding staff members or importing from Excel.</p>
                        <div className="flex justify-center gap-4">
                          <Button 
                            onClick={() => setShowAddStaff(true)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add First Staff Member
                          </Button>
                          <Button 
                            onClick={() => setShowBulkUpload(true)}
                            variant="outline"
                            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Bulk Upload
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Member</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employment</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hire Date</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {staffList.map((staff, index) => (
                              <tr key={staff.id || index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="h-10 w-10 flex-shrink-0">
                                      <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <span className="text-emerald-600 font-medium text-sm">
                                          {staff.name ? staff.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'N/A'}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">{staff.name || 'N/A'}</div>
                                      <div className="text-sm text-gray-500">{staff.email || 'N/A'}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{staff.position || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <Badge className={TOYOTA_DEPARTMENTS.find(d => d.value === staff.department)?.color || 'bg-gray-100 text-gray-800'}>
                                    {TOYOTA_DEPARTMENTS.find(d => d.value === staff.department)?.label || staff.department || 'N/A'}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <Badge className={EMPLOYMENT_TYPES.find(e => e.value === staff.employment_type)?.color || 'bg-gray-100 text-gray-800'}>
                                    {EMPLOYMENT_TYPES.find(e => e.value === staff.employment_type)?.label || staff.employment_type || 'N/A'}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {staff.hire_date ? new Date(staff.hire_date).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <Badge className={staff.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                    {staff.is_active ? 'Active' : 'Inactive'}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditStaff(staff)}
                                      title="View Details"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditStaff(staff)}
                                      title="Edit Staff"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700"
                                      onClick={() => handleDeleteStaff(staff)}
                                      disabled={isDeleting}
                                      title="Delete Staff"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="scheduling" className="p-6">
                <div className="space-y-6">
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold mb-2">Toyota Just-in-Time Scheduling</h3>
                    <p className="text-gray-600 mb-6">
                      Implement Toyota's Just-in-Time principles for optimal staff scheduling based on demand forecasting.
                    </p>
                    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                      <Card className="p-6">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <Brain className="w-6 h-6 text-blue-600" />
                        </div>
                        <h4 className="font-semibold mb-2">Demand Forecasting</h4>
                        <p className="text-sm text-gray-600">AI-powered prediction of customer volume and staff needs</p>
                      </Card>
                      <Card className="p-6">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <Target className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h4 className="font-semibold mb-2">Optimal Allocation</h4>
                        <p className="text-sm text-gray-600">Right staff, right time, right position - zero waste</p>
                      </Card>
                      <Card className="p-6">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <Zap className="w-6 h-6 text-purple-600" />
                        </div>
                        <h4 className="font-semibold mb-2">Real-Time Adjustment</h4>
                        <p className="text-sm text-gray-600">Dynamic scheduling based on actual demand</p>
                      </Card>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="p-6">
                <div className="space-y-6">
                  <div className="text-center py-12">
                    <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold mb-2">Toyota Kaizen Performance System</h3>
                    <p className="text-gray-600 mb-6">
                      Continuous improvement tracking for every staff member using Toyota's Kaizen methodology.
                    </p>
                    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                      <Card className="p-6">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <Award className="w-6 h-6 text-green-600" />
                        </div>
                        <h4 className="font-semibold mb-2">Performance Metrics</h4>
                        <p className="text-sm text-gray-600">Order accuracy, speed, customer satisfaction tracking</p>
                      </Card>
                      <Card className="p-6">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <Target className="w-6 h-6 text-blue-600" />
                        </div>
                        <h4 className="font-semibold mb-2">Skill Development</h4>
                        <p className="text-sm text-gray-600">Standardized training modules and competency tracking</p>
                      </Card>
                      <Card className="p-6">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <TrendingUp className="w-6 h-6 text-purple-600" />
                        </div>
                        <h4 className="font-semibold mb-2">Career Progression</h4>
                        <p className="text-sm text-gray-600">Clear advancement paths with measurable milestones</p>
                      </Card>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="p-6">
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Staff Analytics & Insights</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="p-6">
                      <h3 className="font-semibold mb-4">Department Distribution</h3>
                      <div className="space-y-3">
                        {TOYOTA_DEPARTMENTS.map((dept, index) => (
                          <div key={dept.value} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${dept.color.split(' ')[0]}`}></div>
                              <span className="text-sm">{dept.label}</span>
                            </div>
                            <div className="text-sm font-medium">
                              {staffStats.departments[dept.value] || 0}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h3 className="font-semibold mb-4">Position Distribution</h3>
                      <div className="space-y-3">
                        {TOYOTA_STAFF_POSITIONS.map((pos, index) => (
                          <div key={pos.value} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                              <span className="text-sm">{pos.label}</span>
                            </div>
                            <div className="text-sm font-medium">
                              {staffStats.positions[pos.value] || 0}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>

                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Toyota Production Metrics</h3>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">98.5%</div>
                        <div className="text-sm text-gray-600">Quality Rate</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">87%</div>
                        <div className="text-sm text-gray-600">Efficiency</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">4.8</div>
                        <div className="text-sm text-gray-600">Customer Rating</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">92%</div>
                        <div className="text-sm text-gray-600">Retention Rate</div>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Add Staff Modal */}
          {showAddStaff && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto m-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Add Staff Member</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddStaff(false)}
                  >
                    ×
                  </Button>
                </div>
                <StaffForm 
                  onSuccess={() => {
                    setShowAddStaff(false)
                    loadStaffData()
                  }}
                  onCancel={() => setShowAddStaff(false)}
                  organizationId={organizationId}
                />
              </div>
            </div>
          )}

          {/* Edit Staff Modal */}
          {showEditStaff && selectedStaff && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto m-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Edit Staff Member</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowEditStaff(false)
                      setSelectedStaff(null)
                    }}
                  >
                    ×
                  </Button>
                </div>
                <StaffForm 
                  isEdit={true}
                  initialData={selectedStaff}
                  onSuccess={handleUpdateStaff}
                  onCancel={() => {
                    setShowEditStaff(false)
                    setSelectedStaff(null)
                  }}
                  organizationId={organizationId}
                />
              </div>
            </div>
          )}

          {/* Bulk Upload Modal */}
          {showBulkUpload && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto m-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Staff Bulk Upload</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBulkUpload(false)}
                  >
                    ×
                  </Button>
                </div>
                <UniversalBulkUpload
                  entityType="staff"
                  onSuccess={() => {
                    setShowBulkUpload(false)
                    loadStaffData()
                  }}
                  onError={(error) => {
                    console.error('Bulk upload failed:', error)
                  }}
                />
              </div>
            </div>
          )}

          {/* Toyota Production System Showcase */}
          <Card className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
            <div className="text-center mb-4">
              <Badge className="gap-1 bg-emerald-500 text-white mb-3">
                <Target className="w-3 h-3" />
                Toyota Production System
              </Badge>
              <h3 className="text-lg font-semibold text-emerald-800">
                Revolutionary Restaurant Staff Management
              </h3>
            </div>
            
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <div className="font-medium text-emerald-800">Standardized Work</div>
                <div className="text-emerald-600">Consistent processes for all staff positions</div>
              </div>
              
              <div className="text-center p-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div className="font-medium text-emerald-800">Just-in-Time</div>
                <div className="text-emerald-600">Optimal staffing based on demand</div>
              </div>
              
              <div className="text-center p-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div className="font-medium text-emerald-800">Kaizen</div>
                <div className="text-emerald-600">Continuous improvement culture</div>
              </div>
              
              <div className="text-center p-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div className="font-medium text-emerald-800">Poka-yoke</div>
                <div className="text-emerald-600">Error prevention and quality assurance</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageErrorBoundary>
  )
}