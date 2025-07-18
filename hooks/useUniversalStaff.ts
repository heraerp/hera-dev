import { useState, useEffect, useCallback } from 'react';
import { UniversalStaffService } from '@/lib/services/universalStaffService';
import type { 
  StaffMember, 
  WorkShift,
  TimeEntry,
  StaffAnalytics,
  EmergencyContact,
  Permission
} from '@/lib/services/universalStaffService';

export interface UseUniversalStaffReturn {
  // Data
  staffMembers: StaffMember[];
  activeStaff: StaffMember[];
  timeEntries: TimeEntry[];
  analytics: StaffAnalytics | null;
  currentUserStatus: 'clocked_in' | 'clocked_out' | 'unknown';
  
  // Loading states
  loading: boolean;
  creating: boolean;
  updating: boolean;
  clockingInOut: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  createStaffMember: (staffData: any) => Promise<boolean>;
  updateStaffMember: (staffId: string, updates: Partial<StaffMember>) => Promise<boolean>;
  createWorkShift: (shiftData: any) => Promise<boolean>;
  clockIn: (staffId: string, location?: string, notes?: string) => Promise<boolean>;
  clockOut: (staffId: string, notes?: string) => Promise<boolean>;
  refetch: () => Promise<void>;
  
  // Utilities
  getStaffMember: (staffId: string) => StaffMember | undefined;
  getStaffByRole: (role: string) => StaffMember[];
  getStaffByDepartment: (department: string) => StaffMember[];
  calculateTotalHours: (staffId: string, period: 'week' | 'month') => number;
  
  // Stats
  stats: {
    totalStaff: number;
    activeStaff: number;
    totalDepartments: number;
    averagePerformance: number;
    totalHoursThisMonth: number;
    attendanceRate: number;
    onlineStaff: number;
  };
}

export function useUniversalStaff(organizationId: string): UseUniversalStaffReturn {
  // State
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [analytics, setAnalytics] = useState<StaffAnalytics | null>(null);
  const [currentUserStatus, setCurrentUserStatus] = useState<'clocked_in' | 'clocked_out' | 'unknown'>('unknown');
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [clockingInOut, setClockinInOut] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  
  // Derived data
  const activeStaff = staffMembers.filter(staff => staff.status === 'active');
  
  // Fetch staff members
  const fetchStaffMembers = useCallback(async () => {
    if (!organizationId) return;
    
    try {
      setError(null);
      
      const result = await UniversalStaffService.getStaffMembers(organizationId);
      
      if (result.success && result.staff) {
        setStaffMembers(result.staff);
      } else {
        throw new Error(result.error || 'Failed to fetch staff members');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch staff';
      setError(errorMessage);
      console.error('Error fetching staff members:', err);
    }
  }, [organizationId]);
  
  // Fetch time entries
  const fetchTimeEntries = useCallback(async () => {
    if (!organizationId) return;
    
    try {
      const result = await UniversalStaffService.getTimeEntries(organizationId);
      
      if (result.success && result.timeEntries) {
        setTimeEntries(result.timeEntries);
      }
    } catch (err) {
      console.error('Error fetching time entries:', err);
    }
  }, [organizationId]);
  
  // Fetch analytics
  const fetchAnalytics = useCallback(async () => {
    if (!organizationId) return;
    
    try {
      const result = await UniversalStaffService.getStaffAnalytics(organizationId);
      
      if (result.success && result.analytics) {
        setAnalytics(result.analytics);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  }, [organizationId]);
  
  // Fetch all data
  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStaffMembers(),
        fetchTimeEntries(),
        fetchAnalytics()
      ]);
    } finally {
      setLoading(false);
    }
  }, [fetchStaffMembers, fetchTimeEntries, fetchAnalytics]);
  
  // Create staff member
  const createStaffMember = useCallback(async (
    staffData: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      position: string;
      department: string;
      role: 'admin' | 'manager' | 'supervisor' | 'employee' | 'trainee';
      hireDate: string;
      salary?: number;
      hourlyRate: number;
      address?: string;
      emergencyContact?: EmergencyContact;
      permissions?: Permission[];
    }
  ): Promise<boolean> => {
    if (!organizationId) return false;
    
    try {
      setCreating(true);
      setError(null);
      
      const result = await UniversalStaffService.createStaffMember(
        organizationId, 
        staffData
      );
      
      if (result.success) {
        await refetch(); // Refresh all data
        return true;
      } else {
        throw new Error(result.error || 'Failed to create staff member');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create staff member';
      setError(errorMessage);
      console.error('Error creating staff member:', err);
      return false;
    } finally {
      setCreating(false);
    }
  }, [organizationId, refetch]);
  
  // Update staff member
  const updateStaffMember = useCallback(async (
    staffId: string,
    updates: Partial<StaffMember>
  ): Promise<boolean> => {
    if (!organizationId) return false;
    
    try {
      setUpdating(true);
      setError(null);
      
      const result = await UniversalStaffService.updateStaffMember(
        organizationId,
        staffId,
        updates
      );
      
      if (result.success) {
        await refetch(); // Refresh all data
        return true;
      } else {
        throw new Error(result.error || 'Failed to update staff member');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update staff member';
      setError(errorMessage);
      console.error('Error updating staff member:', err);
      return false;
    } finally {
      setUpdating(false);
    }
  }, [organizationId, refetch]);
  
  // Create work shift
  const createWorkShift = useCallback(async (
    shiftData: {
      staffMemberId: string;
      date: string;
      startTime: string;
      endTime: string;
      position: string;
      location: string;
      breakDuration?: number;
    }
  ): Promise<boolean> => {
    if (!organizationId) return false;
    
    try {
      setCreating(true);
      setError(null);
      
      const result = await UniversalStaffService.createWorkShift(
        organizationId,
        shiftData
      );
      
      if (result.success) {
        await refetch(); // Refresh all data
        return true;
      } else {
        throw new Error(result.error || 'Failed to create work shift');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create work shift';
      setError(errorMessage);
      console.error('Error creating work shift:', err);
      return false;
    } finally {
      setCreating(false);
    }
  }, [organizationId, refetch]);
  
  // Clock in
  const clockIn = useCallback(async (
    staffId: string,
    location: string = 'Restaurant',
    notes?: string
  ): Promise<boolean> => {
    if (!organizationId) return false;
    
    try {
      setClockinInOut(true);
      setError(null);
      
      const result = await UniversalStaffService.clockInOut(
        organizationId,
        staffId,
        'clock_in',
        location,
        notes
      );
      
      if (result.success) {
        setCurrentUserStatus(result.currentStatus || 'clocked_in');
        await fetchTimeEntries(); // Refresh time entries
        return true;
      } else {
        throw new Error(result.error || 'Failed to clock in');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clock in';
      setError(errorMessage);
      console.error('Error clocking in:', err);
      return false;
    } finally {
      setClockinInOut(false);
    }
  }, [organizationId, fetchTimeEntries]);
  
  // Clock out
  const clockOut = useCallback(async (
    staffId: string,
    notes?: string
  ): Promise<boolean> => {
    if (!organizationId) return false;
    
    try {
      setClockinInOut(true);
      setError(null);
      
      const result = await UniversalStaffService.clockInOut(
        organizationId,
        staffId,
        'clock_out',
        'Restaurant',
        notes
      );
      
      if (result.success) {
        setCurrentUserStatus(result.currentStatus || 'clocked_out');
        await fetchTimeEntries(); // Refresh time entries
        return true;
      } else {
        throw new Error(result.error || 'Failed to clock out');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clock out';
      setError(errorMessage);
      console.error('Error clocking out:', err);
      return false;
    } finally {
      setClockinInOut(false);
    }
  }, [organizationId, fetchTimeEntries]);
  
  // Utility functions
  const getStaffMember = useCallback((staffId: string): StaffMember | undefined => {
    return staffMembers.find(staff => staff.id === staffId);
  }, [staffMembers]);
  
  const getStaffByRole = useCallback((role: string): StaffMember[] => {
    return staffMembers.filter(staff => staff.role === role);
  }, [staffMembers]);
  
  const getStaffByDepartment = useCallback((department: string): StaffMember[] => {
    return staffMembers.filter(staff => staff.department === department);
  }, [staffMembers]);
  
  const calculateTotalHours = useCallback((
    staffId: string, 
    period: 'week' | 'month'
  ): number => {
    const now = new Date();
    const startDate = new Date();
    
    if (period === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate.setMonth(now.getMonth() - 1);
    }
    
    return timeEntries
      .filter(entry => 
        entry.staffMemberId === staffId && 
        new Date(entry.clockInTime) >= startDate &&
        entry.totalHours
      )
      .reduce((total, entry) => total + (entry.totalHours || 0), 0);
  }, [timeEntries]);
  
  // Calculate stats
  const stats = {
    totalStaff: staffMembers.length,
    activeStaff: activeStaff.length,
    totalDepartments: Array.from(new Set(staffMembers.map(s => s.department))).length,
    averagePerformance: staffMembers.length > 0 
      ? staffMembers.reduce((sum, staff) => sum + staff.performanceScore, 0) / staffMembers.length 
      : 0,
    totalHoursThisMonth: analytics?.totalHoursThisMonth || 0,
    attendanceRate: analytics?.attendanceRate || 0,
    onlineStaff: timeEntries.filter(entry => 
      entry.status === 'active' && 
      new Date(entry.clockInTime).toDateString() === new Date().toDateString()
    ).length
  };
  
  // Initial load
  useEffect(() => {
    if (organizationId) {
      refetch();
    }
  }, [organizationId, refetch]);
  
  // Check current user status from recent time entries
  useEffect(() => {
    const recentEntry = timeEntries
      .filter(entry => new Date(entry.clockInTime).toDateString() === new Date().toDateString())
      .sort((a, b) => new Date(b.clockInTime).getTime() - new Date(a.clockInTime).getTime())[0];
    
    if (recentEntry) {
      setCurrentUserStatus(recentEntry.status === 'active' ? 'clocked_in' : 'clocked_out');
    }
  }, [timeEntries]);
  
  return {
    // Data
    staffMembers,
    activeStaff,
    timeEntries,
    analytics,
    currentUserStatus,
    
    // Loading states
    loading,
    creating,
    updating,
    clockingInOut,
    
    // Error state
    error,
    
    // Actions
    createStaffMember,
    updateStaffMember,
    createWorkShift,
    clockIn,
    clockOut,
    refetch,
    
    // Utilities
    getStaffMember,
    getStaffByRole,
    getStaffByDepartment,
    calculateTotalHours,
    
    // Stats
    stats
  };
}