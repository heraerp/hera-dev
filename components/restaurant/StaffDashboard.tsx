/**
 * HERA Universal - Restaurant Staff Dashboard
 * 
 * Professional dark/light theme with depth hierarchy
 * Following PO Gold Standard theme pattern
 */

'use client';

import { useState, useEffect } from 'react';
import { Plus, Filter, Download, Search, Eye, Edit, Trash2, Users, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { StaffForm } from './StaffForm';
import { StaffTable } from './StaffTable';
import { StaffDetails } from './StaffDetails';
import { MetricsCard } from '@/components/ui/MetricsCard';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/SearchInput';
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement';
import { canViewSalary, canManageStaff } from '@/lib/utils/rbac';

interface StaffDashboardProps {
  organizationId: string;
}

interface StaffMember {
  id: string;
  name: string;
  employee_id: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  hire_date: string;
  employment_type: string;
  is_active: boolean;
  salary?: number;
  hourly_rate?: number;
  createdAt: string;
}

interface DashboardMetrics {
  totalStaff: number;
  activeStaff: number;
  recentHires: number;
  totalPayroll: number;
}

export function StaffDashboard({ organizationId }: StaffDashboardProps) {
  const { restaurantData } = useRestaurantManagement();
  const userRole = restaurantData?.userRole;
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [viewMode, setViewMode] = useState<'view' | 'edit' | null>(null);

  // Fetch staff members
  const fetchStaff = async () => {
    try {
      const response = await fetch(`/api/staff?organizationId=${organizationId}`);
      if (response.ok) {
        const data = await response.json();
        const staffList = data.staff || [];
        setStaff(staffList);
        
        // Calculate metrics
        const totalStaff = staffList.length;
        const activeStaff = staffList.filter((member: StaffMember) => member.is_active).length;
        
        // Recent hires (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentHires = staffList.filter((member: StaffMember) => 
          new Date(member.hire_date) > thirtyDaysAgo
        ).length;
        
        // Total payroll estimation (only for authorized users)
        const totalPayroll = canViewSalary(userRole) ? staffList.reduce((sum: number, member: StaffMember) => {
          const salary = member.salary ? parseFloat(member.salary.toString()) : 0;
          const hourlyRate = member.hourly_rate ? parseFloat(member.hourly_rate.toString()) * 160 : 0; // 160 hours/month
          return sum + Math.max(salary, hourlyRate);
        }, 0) : 0;
        
        setMetrics({
          totalStaff,
          activeStaff,
          recentHires,
          totalPayroll
        });
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [organizationId]);

  // Filter staff
  const filteredStaff = staff.filter(member => {
    const matchesSearch = !searchTerm || 
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.employee_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || member.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  const handleStaffCreated = () => {
    setShowForm(false);
    setEditingStaff(null);
    setViewMode(null);
    fetchStaff(); // Refresh the list
  };

  const handleView = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember);
    setViewMode('view');
  };

  const handleEdit = (staffMember: StaffMember) => {
    setEditingStaff(staffMember);
    setViewMode('edit');
  };

  const handleCloseModals = () => {
    setSelectedStaff(null);
    setEditingStaff(null);
    setViewMode(null);
  };

  const handleEditFromView = () => {
    if (selectedStaff) {
      setEditingStaff(selectedStaff);
      setSelectedStaff(null);
      setViewMode('edit');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton for metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-3"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricsCard
            title="Total Staff"
            value={metrics.totalStaff.toString()}
            icon={Users}
            trend="+5% from last month"
            color="blue"
          />
          <MetricsCard
            title="Active Staff"
            value={metrics.activeStaff.toString()}
            icon={CheckCircle}
            trend={`${metrics.activeStaff}/${metrics.totalStaff} active`}
            color="green"
          />
          <MetricsCard
            title="Recent Hires"
            value={metrics.recentHires.toString()}
            icon={Clock}
            trend="Last 30 days"
            color="orange"
          />
          {canViewSalary(userRole) && (
            <MetricsCard
              title="Est. Payroll"
              value={`$${metrics.totalPayroll.toLocaleString()}`}
              icon={DollarSign}
              trend="Monthly estimate"
              color="purple"
            />
          )}
        </div>
      )}

      {/* Actions Bar */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <SearchInput
              placeholder="Search staff members..."
              value={searchTerm}
              onChange={setSearchTerm}
              className="w-full sm:w-64"
            />
            
            <div className="flex items-center space-x-2">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              >
                <option value="all">All Departments</option>
                <option value="kitchen">Kitchen</option>
                <option value="service">Service</option>
                <option value="management">Management</option>
                <option value="cleaning">Cleaning</option>
                <option value="delivery">Delivery</option>
              </select>
              
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            
            {canManageStaff(userRole) && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Staff Member
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-colors duration-200">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Staff Members ({filteredStaff.length})
          </h3>
        </div>
        
        {filteredStaff.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No staff members found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchTerm || departmentFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Get started by adding your first staff member'}
            </p>
            {!searchTerm && departmentFilter === 'all' && canManageStaff(userRole) && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Staff Member
              </Button>
            )}
          </div>
        ) : (
          <StaffTable 
            staff={filteredStaff}
            organizationId={organizationId}
            onRefresh={fetchStaff}
            onView={handleView}
            onEdit={handleEdit}
            userRole={userRole}
          />
        )}
      </div>

      {/* Add Staff Modal */}
      {showForm && (
        <StaffForm
          organizationId={organizationId}
          onClose={() => setShowForm(false)}
          onSuccess={handleStaffCreated}
          userRole={userRole}
        />
      )}

      {/* View Staff Details Modal */}
      {viewMode === 'view' && selectedStaff && (
        <StaffDetails
          staff={selectedStaff}
          onClose={handleCloseModals}
          onEdit={handleEditFromView}
          userRole={userRole}
        />
      )}

      {/* Edit Staff Modal */}
      {viewMode === 'edit' && editingStaff && (
        <StaffForm
          organizationId={organizationId}
          onClose={handleCloseModals}
          onSuccess={handleStaffCreated}
          initialData={editingStaff}
          isEdit={true}
          userRole={userRole}
        />
      )}
    </div>
  );
}