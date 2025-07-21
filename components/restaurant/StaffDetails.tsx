/**
 * HERA Universal - Staff Details Component
 * 
 * Professional modal for viewing staff member details
 * Following PO Gold Standard theme pattern
 */

'use client';

import { X, User, Mail, Phone, Calendar, Building, DollarSign, Clock, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { canViewSalary, canManageStaff } from '@/lib/utils/rbac';

interface StaffMember {
  id: string;
  name: string;
  employee_id?: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  hire_date: string;
  employment_type: string;
  is_active: boolean;
  salary?: number;
  hourly_rate?: number;
  emergency_contact?: string;
  emergency_phone?: string;
  notes?: string;
  createdAt: string;
}

interface StaffDetailsProps {
  staff: StaffMember;
  onClose: () => void;
  onEdit: () => void;
  userRole?: string;
}

const DEPARTMENTS = {
  kitchen: { label: 'Kitchen', color: 'orange' },
  service: { label: 'Service', color: 'blue' },
  management: { label: 'Management', color: 'purple' },
  cleaning: { label: 'Cleaning', color: 'green' },
  delivery: { label: 'Delivery', color: 'yellow' }
};

const EMPLOYMENT_TYPES = {
  full_time: { label: 'Full Time', color: 'green' },
  part_time: { label: 'Part Time', color: 'blue' },
  contract: { label: 'Contract', color: 'purple' },
  temporary: { label: 'Temporary', color: 'orange' }
};

const POSITIONS = {
  manager: 'Manager',
  chef: 'Chef',
  server: 'Server',
  cashier: 'Cashier',
  kitchen_staff: 'Kitchen Staff',
  cleaner: 'Cleaner',
  host: 'Host'
};

export function StaffDetails({ staff, onClose, onEdit, userRole }: StaffDetailsProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateTenure = (hireDate: string) => {
    const hire = new Date(hireDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - hire.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (months === 0) return `${years} year${years > 1 ? 's' : ''}`;
    return `${years} year${years > 1 ? 's' : ''}, ${months} month${months > 1 ? 's' : ''}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4 transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">
                {getInitials(staff.name || 'N/A')}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {staff.name || 'N/A'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {staff.employee_id ? `Employee ID: ${staff.employee_id}` : 'No Employee ID'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {canManageStaff(userRole) && (
              <Button onClick={onEdit} size="sm">
                Edit
              </Button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Status and Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Basic Information
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Position</label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {POSITIONS[staff.position as keyof typeof POSITIONS] || staff.position?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</label>
                  <div className="mt-1">
                    <StatusBadge
                      status={staff.department}
                      color={DEPARTMENTS[staff.department as keyof typeof DEPARTMENTS]?.color as any || 'gray'}
                      text={DEPARTMENTS[staff.department as keyof typeof DEPARTMENTS]?.label || staff.department || 'N/A'}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Employment Type</label>
                  <div className="mt-1">
                    <StatusBadge
                      status={staff.employment_type}
                      color={EMPLOYMENT_TYPES[staff.employment_type as keyof typeof EMPLOYMENT_TYPES]?.color as any || 'gray'}
                      text={EMPLOYMENT_TYPES[staff.employment_type as keyof typeof EMPLOYMENT_TYPES]?.label || staff.employment_type || 'N/A'}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                  <div className="mt-1">
                    <StatusBadge
                      status={staff.is_active ? 'active' : 'inactive'}
                      color={staff.is_active ? 'green' : 'red'}
                      text={staff.is_active ? 'Active' : 'Inactive'}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Contact Information
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {staff.email ? (
                      <a href={`mailto:${staff.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {staff.email}
                      </a>
                    ) : 'N/A'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {staff.phone ? (
                      <a href={`tel:${staff.phone}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {staff.phone}
                      </a>
                    ) : 'N/A'}
                  </p>
                </div>
                
                {staff.emergency_contact && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Emergency Contact</label>
                    <p className="text-gray-900 dark:text-gray-100">{staff.emergency_contact}</p>
                    {staff.emergency_phone && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <a href={`tel:${staff.emergency_phone}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                          {staff.emergency_phone}
                        </a>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center mb-4">
              <Building className="w-5 h-5 mr-2" />
              Employment Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Hire Date</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {staff.hire_date ? formatDate(staff.hire_date) : 'N/A'}
                </p>
                {staff.hire_date && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {calculateTenure(staff.hire_date)} tenure
                  </p>
                )}
              </div>
              
              {canViewSalary(userRole) && (staff.salary || staff.hourly_rate) && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Compensation</span>
                  </div>
                  {staff.salary && (
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      ${Number(staff.salary).toLocaleString()}/month
                    </p>
                  )}
                  {staff.hourly_rate && (
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      ${Number(staff.hourly_rate).toFixed(2)}/hour
                    </p>
                  )}
                </div>
              )}
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                  <UserCheck className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Member Since</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {formatDate(staff.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {staff.notes && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Notes</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{staff.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {canManageStaff(userRole) && (
            <Button onClick={onEdit}>
              Edit Staff Member
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}