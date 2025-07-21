/**
 * HERA Universal - Staff Table Component
 * 
 * Professional table for displaying staff members
 * Following PO Gold Standard theme pattern
 */

'use client';

import { useState } from 'react';
import { Eye, Edit, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { canManageStaff, canDeleteStaff } from '@/lib/utils/rbac';

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
  createdAt: string;
}

interface StaffTableProps {
  staff: StaffMember[];
  organizationId: string;
  onRefresh: () => void;
  onView: (staff: StaffMember) => void;
  onEdit: (staff: StaffMember) => void;
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

export function StaffTable({ staff, organizationId, onRefresh, onView, onEdit, userRole }: StaffTableProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (staffMember: StaffMember) => {
    if (!confirm(`Are you sure you want to delete ${staffMember.name}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/staff?id=${staffMember.id}&organizationId=${organizationId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        onRefresh();
      } else {
        alert(`Failed to delete staff: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert('Failed to delete staff member');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Staff Member
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Position
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Department
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Employment
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Hire Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {staff.map((member) => (
            <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                        {getInitials(member.name || 'N/A')}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {member.name || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {member.email || 'N/A'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 dark:text-gray-100">
                  {member.position?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge
                  status={member.department}
                  color={DEPARTMENTS[member.department as keyof typeof DEPARTMENTS]?.color as any || 'gray'}
                  text={DEPARTMENTS[member.department as keyof typeof DEPARTMENTS]?.label || member.department || 'N/A'}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge
                  status={member.employment_type}
                  color={EMPLOYMENT_TYPES[member.employment_type as keyof typeof EMPLOYMENT_TYPES]?.color as any || 'gray'}
                  text={EMPLOYMENT_TYPES[member.employment_type as keyof typeof EMPLOYMENT_TYPES]?.label || member.employment_type || 'N/A'}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {member.hire_date ? formatDate(member.hire_date) : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge
                  status={member.is_active ? 'active' : 'inactive'}
                  color={member.is_active ? 'green' : 'red'}
                  text={member.is_active ? 'Active' : 'Inactive'}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(member)}
                    title="View Details"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {canManageStaff(userRole) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(member)}
                      title="Edit Staff"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                  {canDeleteStaff(userRole) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(member)}
                      disabled={isDeleting}
                      title="Delete Staff"
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}