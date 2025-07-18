"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { useUniversalStaff } from '@/hooks/useUniversalStaff';
import { OrganizationGuard, useOrganizationContext } from '@/components/restaurant/organization-guard';
import Link from 'next/link';
import { 
  Users, 
  UserPlus,
  Clock,
  Calendar,
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
  BarChart3,
  Activity,
  Star,
  MapPin,
  Phone,
  Mail,
  Shield,
  Award,
  Timer,
  Target,
  Zap,
  Brain,
  ArrowLeft,
  Plus,
  Minus,
  RefreshCw,
  Search,
  Filter,
  Download,
  Edit,
  Eye,
  LogIn,
  LogOut,
  UserCheck,
  Coffee,
  Home
} from 'lucide-react';

// Universal Staff Management with Real-time Integration
function UniversalStaffContent() {
  const { organizationId } = useOrganizationContext();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [staffModal, setStaffModal] = useState<{
    open: boolean;
    mode: 'create' | 'edit' | 'view';
    staff?: any;
  }>({ open: false, mode: 'create' });
  const [clockModal, setClockModal] = useState<{
    open: boolean;
    staff?: any;
    action: 'clock_in' | 'clock_out';
  }>({ open: false, action: 'clock_in' });

  // Use Universal Staff Service
  const {
    staffMembers,
    activeStaff,
    timeEntries,
    analytics,
    currentUserStatus,
    loading,
    creating,
    updating,
    clockingInOut,
    error,
    createStaffMember,
    updateStaffMember,
    createWorkShift,
    clockIn,
    clockOut,
    refetch,
    getStaffByRole,
    getStaffByDepartment,
    calculateTotalHours,
    stats
  } = useUniversalStaff(organizationId!);
  
  // Filter staff based on search and filters
  const filteredStaff = staffMembers.filter(staff => {
    const matchesSearch = staff.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         staff.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || staff.department === selectedDepartment;
    const matchesRole = selectedRole === 'all' || staff.role === selectedRole;
    return matchesSearch && matchesDepartment && matchesRole;
  });
  
  // Get unique departments and roles
  const departments = ['all', ...Array.from(new Set(staffMembers.map(staff => staff.department)))];
  const roles = ['all', ...Array.from(new Set(staffMembers.map(staff => staff.role)))];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'supervisor': return 'bg-green-100 text-green-800 border-green-200';
      case 'employee': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'trainee': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'on_leave': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'terminated': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleStaffSubmit = async (formData: any) => {
    if (staffModal.mode === 'create') {
      const success = await createStaffMember(formData);
      if (success) {
        setStaffModal({ open: false, mode: 'create' });
      }
    } else if (staffModal.mode === 'edit' && staffModal.staff) {
      const success = await updateStaffMember(staffModal.staff.id, formData);
      if (success) {
        setStaffModal({ open: false, mode: 'create' });
      }
    }
  };

  const handleClockAction = async (notes?: string) => {
    if (!clockModal.staff) return;
    
    const success = clockModal.action === 'clock_in' 
      ? await clockIn(clockModal.staff.id, 'Restaurant', notes)
      : await clockOut(clockModal.staff.id, notes);
    
    if (success) {
      setClockModal({ open: false, action: 'clock_in' });
    }
  };

  const renderDashboard = () => (
    <motion.div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/80 backdrop-blur border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Staff</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStaff}</p>
                  <p className="text-green-600 text-sm mt-1">{stats.activeStaff} active</p>
                </div>
                <Users className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/80 backdrop-blur border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Currently Online</p>
                  <p className="text-2xl font-bold text-green-600">{stats.onlineStaff}</p>
                  <p className="text-gray-600 text-sm mt-1">Staff members</p>
                </div>
                <UserCheck className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/80 backdrop-blur border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Avg Performance</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.averagePerformance.toFixed(1)}%</p>
                  <p className="text-gray-600 text-sm mt-1">Team score</p>
                </div>
                <TrendingUp className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/80 backdrop-blur border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Hours This Month</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalHoursThisMonth.toFixed(0)}</p>
                  <p className="text-gray-600 text-sm mt-1">Total hours</p>
                </div>
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-white/80 backdrop-blur border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Attendance Rate</p>
                  <p className="text-2xl font-bold text-green-600">{stats.attendanceRate.toFixed(1)}%</p>
                  <p className="text-gray-600 text-sm mt-1">This month</p>
                </div>
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => setStaffModal({ open: true, mode: 'create' })}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Staff Member
            </Button>
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Create Schedule
            </Button>
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Reports
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Department Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Department Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analytics.departmentBreakdown).map(([department, count]) => (
                  <div key={department} className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{department}</span>
                    <Badge variant="outline">{count} staff</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Role Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analytics.roleDistribution).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 capitalize">{role}</span>
                    <Badge className={getRoleColor(role)}>{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Performers */}
      {analytics?.topPerformers && analytics.topPerformers.length > 0 && (
        <Card className="bg-white/80 backdrop-blur border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topPerformers.slice(0, 5).map((performer, index) => (
                <div key={performer.staffMemberId} className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{performer.fullName}</p>
                      <p className="text-sm text-gray-600">Performance Score: {performer.score}%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-800">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +{performer.improvement.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );

  const renderStaffList = () => (
    <motion.div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search staff members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white/80"
          />
        </div>
        
        <select 
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white/80"
        >
          {departments.map(dept => (
            <option key={dept} value={dept}>
              {dept === 'all' ? 'All Departments' : dept}
            </option>
          ))}
        </select>

        <select 
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white/80"
        >
          {roles.map(role => (
            <option key={role} value={role}>
              {role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
            </option>
          ))}
        </select>

        <Button 
          onClick={() => setStaffModal({ open: true, mode: 'create' })}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Staff
        </Button>
      </div>

      {/* Staff Grid */}
      <Card className="bg-white/80 backdrop-blur border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Staff Members</CardTitle>
            <Badge variant="outline">{filteredStaff.length} members</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="p-4 border border-gray-200 rounded-lg animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No staff members found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStaff.map((staff, index) => (
                <motion.div
                  key={staff.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{staff.fullName}</h3>
                        <p className="text-sm text-gray-600">{staff.position}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setStaffModal({ open: true, mode: 'view', staff })}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setStaffModal({ open: true, mode: 'edit', staff })}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Role</span>
                      <Badge className={getRoleColor(staff.role)}>
                        {staff.role}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Status</span>
                      <Badge className={getStatusColor(staff.status)}>
                        {staff.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Performance</span>
                      <span className="text-sm font-medium text-blue-600">{staff.performanceScore}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <div className="flex items-center">
                      <Mail className="w-3 h-3 mr-1" />
                      {staff.email}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setClockModal({ open: true, staff, action: 'clock_in' })}
                      className="flex-1"
                    >
                      <LogIn className="w-3 h-3 mr-1" />
                      Clock In
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setClockModal({ open: true, staff, action: 'clock_out' })}
                      className="flex-1"
                    >
                      <LogOut className="w-3 h-3 mr-1" />
                      Clock Out
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderTimeTracking = () => (
    <motion.div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl">Recent Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {timeEntries.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No time entries found</p>
              <p className="text-sm">Time tracking data will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {timeEntries.slice(0, 20).map((entry) => {
                const staff = staffMembers.find(s => s.id === entry.staffMemberId);
                return (
                  <div key={entry.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        entry.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">{staff?.fullName || 'Unknown Staff'}</p>
                        <p className="text-sm text-gray-600">
                          {entry.status === 'active' ? 'Currently working' : 
                           `Worked ${entry.totalHours?.toFixed(1) || 0} hours`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(entry.clockInTime).toLocaleTimeString()}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(entry.clockInTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 p-6">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-4">
            <Link href="/restaurant/dashboard" className="p-2 rounded-xl bg-white/80 hover:bg-white transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                Universal Staff Management
              </h1>
              <p className="text-gray-600 mt-1">Complete staff management with Universal Schema integration</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              <Activity className="w-4 h-4 mr-1" />
              {stats.onlineStaff} Online
            </Badge>
            <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white/80 backdrop-blur rounded-lg p-1 mb-6">
          {[
            { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { key: 'staff', label: 'Staff Members', icon: Users },
            { key: 'time', label: 'Time Tracking', icon: Clock }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'staff' && renderStaffList()}
          {activeTab === 'time' && renderTimeTracking()}
        </AnimatePresence>

        {/* Staff Modal */}
        {staffModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">
                {staffModal.mode === 'create' ? 'Add Staff Member' : 
                 staffModal.mode === 'edit' ? 'Edit Staff Member' : 'Staff Details'}
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter first name"
                      id="firstName"
                      defaultValue={staffModal.staff?.firstName || ''}
                      disabled={staffModal.mode === 'view'}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter last name"
                      id="lastName"
                      defaultValue={staffModal.staff?.lastName || ''}
                      disabled={staffModal.mode === 'view'}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter email"
                    id="email"
                    defaultValue={staffModal.staff?.email || ''}
                    disabled={staffModal.mode === 'view'}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <Input
                      type="tel"
                      placeholder="Enter phone"
                      id="phone"
                      defaultValue={staffModal.staff?.phone || ''}
                      disabled={staffModal.mode === 'view'}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Position
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter position"
                      id="position"
                      defaultValue={staffModal.staff?.position || ''}
                      disabled={staffModal.mode === 'view'}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <select 
                      id="department"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      defaultValue={staffModal.staff?.department || 'ChefHat'}
                      disabled={staffModal.mode === 'view'}
                    >
                      <option value="ChefHat">ChefHat</option>
                      <option value="Service">Service</option>
                      <option value="Management">Management</option>
                      <option value="Cleaning">Cleaning</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select 
                      id="role"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      defaultValue={staffModal.staff?.role || 'employee'}
                      disabled={staffModal.mode === 'view'}
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="employee">Employee</option>
                      <option value="trainee">Trainee</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hire Date
                    </label>
                    <Input
                      type="date"
                      id="hireDate"
                      defaultValue={staffModal.staff?.hireDate?.split('T')[0] || new Date().toISOString().split('T')[0]}
                      disabled={staffModal.mode === 'view'}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hourly Rate
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter hourly rate"
                      id="hourlyRate"
                      step="0.01"
                      defaultValue={staffModal.staff?.hourlyRate || 15}
                      disabled={staffModal.mode === 'view'}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mt-6">
                {staffModal.mode !== 'view' && (
                  <Button 
                    onClick={() => {
                      const firstName = (document.getElementById('firstName') as HTMLInputElement)?.value || '';
                      const lastName = (document.getElementById('lastName') as HTMLInputElement)?.value || '';
                      const email = (document.getElementById('email') as HTMLInputElement)?.value || '';
                      const phone = (document.getElementById('phone') as HTMLInputElement)?.value || '';
                      const position = (document.getElementById('position') as HTMLInputElement)?.value || '';
                      const department = (document.getElementById('department') as HTMLSelectElement)?.value || '';
                      const role = (document.getElementById('role') as HTMLSelectElement)?.value || '';
                      const hireDate = (document.getElementById('hireDate') as HTMLInputElement)?.value || '';
                      const hourlyRate = parseFloat((document.getElementById('hourlyRate') as HTMLInputElement)?.value || '15');
                      
                      if (firstName && lastName && email) {
                        handleStaffSubmit({
                          firstName,
                          lastName,
                          email,
                          phone,
                          position,
                          department,
                          role,
                          hireDate: new Date(hireDate).toISOString(),
                          hourlyRate
                        });
                      }
                    }}
                    disabled={creating || updating}
                  >
                    {creating || updating ? 'Saving...' : staffModal.mode === 'create' ? 'Create Staff' : 'Update Staff'}
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => setStaffModal({ open: false, mode: 'create' })}
                >
                  {staffModal.mode === 'view' ? 'Close' : 'Cancel'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Clock Modal */}
        {clockModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {clockModal.action === 'clock_in' ? 'Clock In' : 'Clock Out'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Staff Member
                  </label>
                  <p className="text-gray-900">{clockModal.staff?.fullName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <p className="text-gray-900">{new Date().toLocaleString()}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter any notes..."
                    id="clockNotes"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mt-6">
                <Button 
                  onClick={() => {
                    const notes = (document.getElementById('clockNotes') as HTMLInputElement)?.value || '';
                    handleClockAction(notes);
                  }}
                  disabled={clockingInOut}
                  className={clockModal.action === 'clock_in' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                >
                  {clockingInOut ? 'Processing...' : clockModal.action === 'clock_in' ? 'Clock In' : 'Clock Out'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setClockModal({ open: false, action: 'clock_in' })}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main component with organization access control
export default function UniversalStaffPage() {
  return (
    <OrganizationGuard requiredRole="manager">
      <UniversalStaffContent />
    </OrganizationGuard>
  );
}