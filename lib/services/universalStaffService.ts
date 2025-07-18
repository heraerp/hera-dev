import UniversalCrudService from '@/lib/services/universalCrudService';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// Staff Type Definitions
export interface StaffMember {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  role: 'admin' | 'manager' | 'supervisor' | 'employee' | 'trainee';
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  hireDate: string;
  salary: number;
  hourlyRate: number;
  workSchedule: WorkSchedule;
  permissions: Permission[];
  profileImage?: string;
  
  // Performance metrics
  performanceScore: number;
  totalHoursWorked: number;
  averageRating: number;
  completedTasks: number;
  onTimePercentage: number;
  
  // Contact and emergency info
  address?: string;
  emergencyContact?: EmergencyContact;
  
  // System info
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkSchedule {
  id: string;
  staffMemberId: string;
  scheduleName: string;
  startDate: string;
  endDate: string;
  shifts: WorkShift[];
  totalHours: number;
  status: 'draft' | 'published' | 'completed';
}

export interface WorkShift {
  id: string;
  staffMemberId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // hours
  position: string;
  location: string;
  breakDuration: number; // minutes
  status: 'scheduled' | 'in_progress' | 'completed' | 'missed' | 'cancelled';
  clockInTime?: string;
  clockOutTime?: string;
  actualHours?: number;
  notes?: string;
}

export interface Permission {
  id: string;
  name: string;
  category: 'system' | 'inventory' | 'orders' | 'finance' | 'reports' | 'staff';
  description: string;
  actions: string[]; // ['read', 'create', 'update', 'delete']
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface TimeEntry {
  id: string;
  staffMemberId: string;
  shiftId?: string;
  clockInTime: string;
  clockOutTime?: string;
  totalHours?: number;
  breakTime: number; // minutes
  overtime: number; // hours
  location: string;
  deviceUsed: string;
  ipAddress: string;
  notes?: string;
  approvedBy?: string;
  status: 'active' | 'completed' | 'pending_approval' | 'approved' | 'rejected';
}

export interface StaffPerformance {
  staffMemberId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  metrics: {
    totalHours: number;
    scheduledHours: number;
    attendanceRate: number;
    punctualityScore: number;
    productivityScore: number;
    customerRating: number;
    tasksCompleted: number;
    tasksAssigned: number;
    salesGenerated?: number;
    ordersProcessed?: number;
  };
  goals: PerformanceGoal[];
  reviews: PerformanceReview[];
}

export interface PerformanceGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface PerformanceReview {
  id: string;
  reviewerId: string;
  reviewerName: string;
  period: string;
  rating: number; // 1-5
  strengths: string[];
  improvements: string[];
  comments: string;
  goals: PerformanceGoal[];
  reviewDate: string;
}

export interface StaffAnalytics {
  totalStaff: number;
  activeStaff: number;
  departmentBreakdown: Record<string, number>;
  roleDistribution: Record<string, number>;
  averagePerformance: number;
  totalHoursThisMonth: number;
  attendanceRate: number;
  turnoverRate: number;
  
  topPerformers: Array<{
    staffMemberId: string;
    fullName: string;
    score: number;
    improvement: number;
  }>;
  
  attendanceTrends: Array<{
    date: string;
    attendanceRate: number;
    totalHours: number;
    missedShifts: number;
  }>;
  
  productivityMetrics: {
    averageTasksPerDay: number;
    averageCustomerRating: number;
    totalSalesGenerated: number;
    orderCompletionRate: number;
  };
  
  costAnalysis: {
    totalPayroll: number;
    averageHourlyRate: number;
    overtimeCosts: number;
    trainingCosts: number;
  };
}

export class UniversalStaffService {
  /**
   * Get all staff members
   */
  static async getStaffMembers(organizationId: string): Promise<{
    success: boolean;
    staff?: StaffMember[];
    error?: string;
  }> {
    try {
      console.log('👥 Fetching staff members...');
      
      // Fetch staff entities from core_entities
      const { data: entities, error: entitiesError } = await supabase
        .from('core_entities')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_type', 'staff_member')
        .order('entity_name', { ascending: true });
      
      if (entitiesError) throw entitiesError;
      
      if (!entities || entities.length === 0) {
        return { success: true, staff: [] };
      }
      
      // Fetch metadata for all staff members
      const staffIds = entities.map(e => e.id);
      const { data: metadata, error: metadataError } = await supabase
        .from('core_metadata')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_type', 'staff_member')
        .in('entity_id', staffIds);
      
      if (metadataError) throw metadataError;
      
      // Process staff members
      const staff: StaffMember[] = entities.map(entity => {
        const staffMetadata = metadata?.filter(m => m.entity_id === entity.id) || [];
        
        // Extract metadata values
        const personalInfo = staffMetadata.find(m => m.metadata_key === 'personal_info')?.metadata_value || {};
        const employmentInfo = staffMetadata.find(m => m.metadata_key === 'employment_info')?.metadata_value || {};
        const performanceData = staffMetadata.find(m => m.metadata_key === 'performance')?.metadata_value || {};
        const permissionsData = staffMetadata.find(m => m.metadata_key === 'permissions')?.metadata_value || {};
        const scheduleData = staffMetadata.find(m => m.metadata_key === 'schedule')?.metadata_value || {};
        
        return {
          id: entity.id,
          employeeId: entity.entity_code || `EMP-${entity.id.slice(-6)}`,
          firstName: personalInfo.first_name || 'Unknown',
          lastName: personalInfo.last_name || 'User',
          fullName: entity.entity_name,
          email: personalInfo.email || '',
          phone: personalInfo.phone || '',
          position: employmentInfo.position || 'Employee',
          department: employmentInfo.department || 'General',
          role: employmentInfo.role || 'employee',
          status: employmentInfo.status || 'active',
          hireDate: employmentInfo.hire_date || entity.created_at,
          salary: employmentInfo.salary || 0,
          hourlyRate: employmentInfo.hourly_rate || 15,
          workSchedule: scheduleData as WorkSchedule || {
            id: '',
            staffMemberId: entity.id,
            scheduleName: 'Default Schedule',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            shifts: [],
            totalHours: 40,
            status: 'draft'
          },
          permissions: permissionsData.permissions || [],
          profileImage: personalInfo.profile_image,
          performanceScore: performanceData.score || 85,
          totalHoursWorked: performanceData.total_hours || 0,
          averageRating: performanceData.average_rating || 4.2,
          completedTasks: performanceData.completed_tasks || 0,
          onTimePercentage: performanceData.on_time_percentage || 95,
          address: personalInfo.address,
          emergencyContact: personalInfo.emergency_contact,
          lastLogin: personalInfo.last_login,
          createdAt: entity.created_at,
          updatedAt: entity.updated_at
        };
      });
      
      console.log(`✅ Fetched ${staff.length} staff members`);
      
      return {
        success: true,
        staff
      };
      
    } catch (error) {
      console.error('❌ Error fetching staff members:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch staff members'
      };
    }
  }
  
  /**
   * Create staff member
   */
  static async createStaffMember(
    organizationId: string,
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
  ): Promise<{
    success: boolean;
    staffMemberId?: string;
    employeeId?: string;
    error?: string;
  }> {
    try {
      console.log('👥 Creating staff member:', staffData.firstName, staffData.lastName);
      
      const staffMemberId = uuidv4();
      const now = new Date().toISOString();
      const fullName = `${staffData.firstName} ${staffData.lastName}`;
      const employeeId = `EMP-${Date.now().toString().slice(-6)}`;
      
      // Create staff member entity
      const { error: entityError } = await supabase
        .from('core_entities')
        .insert({
          id: staffMemberId,
          organization_id: organizationId,
          entity_type: 'staff_member',
          entity_subtype: 'employee',
          entity_name: fullName,
          entity_code: employeeId,
          created_at: now,
          updated_at: now
        });
      
      if (entityError) throw entityError;
      
      // Default permissions based on role
      const defaultPermissions = this.getDefaultPermissions(staffData.role);
      
      // Create metadata entries
      const metadataEntries = [
        {
          organization_id: organizationId,
          entity_type: 'staff_member',
          entity_id: staffMemberId,
          metadata_type: 'personal_info',
          metadata_category: 'contact',
          metadata_key: 'personal_info',
          metadata_value: {
            first_name: staffData.firstName,
            last_name: staffData.lastName,
            email: staffData.email,
            phone: staffData.phone,
            address: staffData.address,
            emergency_contact: staffData.emergencyContact,
            profile_image: null,
            last_login: null
          }
        },
        {
          organization_id: organizationId,
          entity_type: 'staff_member',
          entity_id: staffMemberId,
          metadata_type: 'employment_info',
          metadata_category: 'employment',
          metadata_key: 'employment_info',
          metadata_value: {
            position: staffData.position,
            department: staffData.department,
            role: staffData.role,
            status: 'active',
            hire_date: staffData.hireDate,
            salary: staffData.salary || 0,
            hourly_rate: staffData.hourlyRate,
            employment_type: 'full_time'
          }
        },
        {
          organization_id: organizationId,
          entity_type: 'staff_member',
          entity_id: staffMemberId,
          metadata_type: 'permissions',
          metadata_category: 'security',
          metadata_key: 'permissions',
          metadata_value: {
            permissions: staffData.permissions || defaultPermissions,
            role_permissions: this.getRolePermissions(staffData.role),
            last_updated: now
          }
        },
        {
          organization_id: organizationId,
          entity_type: 'staff_member',
          entity_id: staffMemberId,
          metadata_type: 'performance',
          metadata_category: 'analytics',
          metadata_key: 'performance',
          metadata_value: {
            score: 85, // Starting score
            total_hours: 0,
            average_rating: 4.0,
            completed_tasks: 0,
            on_time_percentage: 100,
            goals: [],
            reviews: []
          }
        },
        {
          organization_id: organizationId,
          entity_type: 'staff_member',
          entity_id: staffMemberId,
          metadata_type: 'schedule',
          metadata_category: 'operational',
          metadata_key: 'schedule',
          metadata_value: {
            id: uuidv4(),
            staff_member_id: staffMemberId,
            schedule_name: 'Default Schedule',
            start_date: now,
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            shifts: [],
            total_hours: 40,
            status: 'draft'
          }
        }
      ];
      
      // Insert metadata
      const { error: metadataError } = await supabase
        .from('core_metadata')
        .insert(metadataEntries);
      
      if (metadataError) throw metadataError;
      
      console.log('✅ Staff member created successfully');
      
      return {
        success: true,
        staffMemberId,
        employeeId
      };
      
    } catch (error) {
      console.error('❌ Error creating staff member:', error);
      return {
        success: false,
        error: error.message || 'Failed to create staff member'
      };
    }
  }
  
  /**
   * Update staff member
   */
  static async updateStaffMember(
    organizationId: string,
    staffMemberId: string,
    updates: Partial<StaffMember>
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      console.log('👥 Updating staff member:', staffMemberId);
      
      const now = new Date().toISOString();
      
      // Update entity name if name changed
      if (updates.firstName || updates.lastName) {
        const fullName = `${updates.firstName || ''} ${updates.lastName || ''}`.trim();
        if (fullName) {
          await supabase
            .from('core_entities')
            .update({
              entity_name: fullName,
              updated_at: now
            })
            .eq('id', staffMemberId)
            .eq('organization_id', organizationId);
        }
      }
      
      // Update metadata entries based on what changed
      const metadataUpdates = [];
      
      if (updates.firstName || updates.lastName || updates.email || updates.phone || updates.address) {
        metadataUpdates.push({
          metadata_key: 'personal_info',
          metadata_value: {
            first_name: updates.firstName,
            last_name: updates.lastName,
            email: updates.email,
            phone: updates.phone,
            address: updates.address,
            emergency_contact: updates.emergencyContact
          }
        });
      }
      
      if (updates.position || updates.department || updates.role || updates.status || updates.salary || updates.hourlyRate) {
        metadataUpdates.push({
          metadata_key: 'employment_info',
          metadata_value: {
            position: updates.position,
            department: updates.department,
            role: updates.role,
            status: updates.status,
            salary: updates.salary,
            hourly_rate: updates.hourlyRate
          }
        });
      }
      
      if (updates.permissions) {
        metadataUpdates.push({
          metadata_key: 'permissions',
          metadata_value: {
            permissions: updates.permissions,
            last_updated: now
          }
        });
      }
      
      // Execute metadata updates
      for (const update of metadataUpdates) {
        await supabase
          .from('core_metadata')
          .update({
            metadata_value: update.metadata_value,
            updated_at: now
          })
          .eq('organization_id', organizationId)
          .eq('entity_type', 'staff_member')
          .eq('entity_id', staffMemberId)
          .eq('metadata_key', update.metadata_key);
      }
      
      console.log('✅ Staff member updated successfully');
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Error updating staff member:', error);
      return {
        success: false,
        error: error.message || 'Failed to update staff member'
      };
    }
  }
  
  /**
   * Create work shift
   */
  static async createWorkShift(
    organizationId: string,
    shiftData: {
      staffMemberId: string;
      date: string;
      startTime: string;
      endTime: string;
      position: string;
      location: string;
      breakDuration?: number;
    }
  ): Promise<{
    success: boolean;
    shiftId?: string;
    error?: string;
  }> {
    try {
      console.log('📅 Creating work shift for staff member:', shiftData.staffMemberId);
      
      const shiftId = uuidv4();
      const now = new Date().toISOString();
      
      // Calculate duration
      const startTime = new Date(`${shiftData.date}T${shiftData.startTime}`);
      const endTime = new Date(`${shiftData.date}T${shiftData.endTime}`);
      const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // hours
      
      // Create shift entity
      const { error: entityError } = await supabase
        .from('core_entities')
        .insert({
          id: shiftId,
          organization_id: organizationId,
          entity_type: 'work_shift',
          entity_subtype: 'scheduled',
          entity_name: `${shiftData.position} - ${shiftData.date}`,
          related_entity_id: shiftData.staffMemberId,
          created_at: now,
          updated_at: now
        });
      
      if (entityError) throw entityError;
      
      // Create shift metadata
      const { error: metadataError } = await supabase
        .from('core_metadata')
        .insert({
          organization_id: organizationId,
          entity_type: 'work_shift',
          entity_id: shiftId,
          metadata_type: 'shift_details',
          metadata_category: 'scheduling',
          metadata_key: 'shift_details',
          metadata_value: {
            staff_member_id: shiftData.staffMemberId,
            date: shiftData.date,
            start_time: shiftData.startTime,
            end_time: shiftData.endTime,
            duration: duration,
            position: shiftData.position,
            location: shiftData.location,
            break_duration: shiftData.breakDuration || 30,
            status: 'scheduled',
            clock_in_time: null,
            clock_out_time: null,
            actual_hours: null,
            notes: null
          }
        });
      
      if (metadataError) throw metadataError;
      
      console.log('✅ Work shift created successfully');
      
      return {
        success: true,
        shiftId
      };
      
    } catch (error) {
      console.error('❌ Error creating work shift:', error);
      return {
        success: false,
        error: error.message || 'Failed to create work shift'
      };
    }
  }
  
  /**
   * Clock in/out
   */
  static async clockInOut(
    organizationId: string,
    staffMemberId: string,
    action: 'clock_in' | 'clock_out',
    location: string = 'Restaurant',
    notes?: string
  ): Promise<{
    success: boolean;
    timeEntryId?: string;
    currentStatus?: 'clocked_in' | 'clocked_out';
    error?: string;
  }> {
    try {
      console.log(`⏰ ${action} for staff member:`, staffMemberId);
      
      const now = new Date().toISOString();
      
      if (action === 'clock_in') {
        // Create new time entry
        const timeEntryId = uuidv4();
        
        const { error: entityError } = await supabase
          .from('core_entities')
          .insert({
            id: timeEntryId,
            organization_id: organizationId,
            entity_type: 'time_entry',
            entity_subtype: 'active',
            entity_name: `Clock In - ${new Date().toLocaleString()}`,
            related_entity_id: staffMemberId,
            created_at: now,
            updated_at: now
          });
        
        if (entityError) throw entityError;
        
        const { error: metadataError } = await supabase
          .from('core_metadata')
          .insert({
            organization_id: organizationId,
            entity_type: 'time_entry',
            entity_id: timeEntryId,
            metadata_type: 'time_details',
            metadata_category: 'attendance',
            metadata_key: 'time_details',
            metadata_value: {
              staff_member_id: staffMemberId,
              clock_in_time: now,
              clock_out_time: null,
              total_hours: null,
              break_time: 0,
              overtime: 0,
              location: location,
              device_used: 'web_app',
              ip_address: 'unknown',
              notes: notes,
              status: 'active'
            }
          });
        
        if (metadataError) throw metadataError;
        
        return {
          success: true,
          timeEntryId,
          currentStatus: 'clocked_in'
        };
        
      } else {
        // Find active time entry and clock out
        const { data: activeEntries, error: findError } = await supabase
          .from('core_entities')
          .select(`
            id,
            core_metadata!inner(metadata_value)
          `)
          .eq('organization_id', organizationId)
          .eq('entity_type', 'time_entry')
          .eq('entity_subtype', 'active')
          .eq('related_entity_id', staffMemberId);
        
        if (findError) throw findError;
        
        if (!activeEntries || activeEntries.length === 0) {
          throw new Error('No active time entry found');
        }
        
        const activeEntry = activeEntries[0];
        const timeDetails = (activeEntry as any).core_metadata[0]?.metadata_value;
        
        if (!timeDetails?.clock_in_time) {
          throw new Error('Invalid time entry data');
        }
        
        // Calculate total hours
        const clockInTime = new Date(timeDetails.clock_in_time);
        const clockOutTime = new Date(now);
        const totalHours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
        
        // Update time entry
        await supabase
          .from('core_entities')
          .update({
            entity_subtype: 'completed',
            updated_at: now
          })
          .eq('id', activeEntry.id);
        
        await supabase
          .from('core_metadata')
          .update({
            metadata_value: {
              ...timeDetails,
              clock_out_time: now,
              total_hours: totalHours,
              status: 'completed'
            },
            updated_at: now
          })
          .eq('entity_id', activeEntry.id)
          .eq('metadata_key', 'time_details');
        
        return {
          success: true,
          timeEntryId: activeEntry.id,
          currentStatus: 'clocked_out'
        };
      }
      
    } catch (error) {
      console.error('❌ Error with clock in/out:', error);
      return {
        success: false,
        error: error.message || 'Failed to process clock in/out'
      };
    }
  }
  
  /**
   * Get staff analytics
   */
  static async getStaffAnalytics(organizationId: string): Promise<{
    success: boolean;
    analytics?: StaffAnalytics;
    error?: string;
  }> {
    try {
      console.log('📊 Calculating staff analytics...');
      
      const [staffResult, timeEntriesResult] = await Promise.all([
        this.getStaffMembers(organizationId),
        this.getTimeEntries(organizationId)
      ]);
      
      if (!staffResult.success || !staffResult.staff) {
        throw new Error('Failed to fetch staff data');
      }
      
      const staff = staffResult.staff;
      const timeEntries = timeEntriesResult.timeEntries || [];
      
      // Calculate analytics
      const totalStaff = staff.length;
      const activeStaff = staff.filter(s => s.status === 'active').length;
      
      // Department breakdown
      const departmentBreakdown: Record<string, number> = {};
      staff.forEach(member => {
        departmentBreakdown[member.department] = (departmentBreakdown[member.department] || 0) + 1;
      });
      
      // Role distribution
      const roleDistribution: Record<string, number> = {};
      staff.forEach(member => {
        roleDistribution[member.role] = (roleDistribution[member.role] || 0) + 1;
      });
      
      // Performance metrics
      const averagePerformance = staff.reduce((sum, member) => sum + member.performanceScore, 0) / totalStaff || 0;
      const totalHoursThisMonth = timeEntries
        .filter(entry => {
          const entryDate = new Date(entry.clockInTime);
          const now = new Date();
          return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
        })
        .reduce((sum, entry) => sum + (entry.totalHours || 0), 0);
      
      // Top performers
      const topPerformers = staff
        .sort((a, b) => b.performanceScore - a.performanceScore)
        .slice(0, 5)
        .map(member => ({
          staffMemberId: member.id,
          fullName: member.fullName,
          score: member.performanceScore,
          improvement: Math.random() * 10 - 5 // Mock improvement
        }));
      
      const analytics: StaffAnalytics = {
        totalStaff,
        activeStaff,
        departmentBreakdown,
        roleDistribution,
        averagePerformance,
        totalHoursThisMonth,
        attendanceRate: 95, // Mock data
        turnoverRate: 12, // Mock data
        topPerformers,
        attendanceTrends: [], // Would be calculated from historical data
        productivityMetrics: {
          averageTasksPerDay: 15,
          averageCustomerRating: 4.3,
          totalSalesGenerated: 45000,
          orderCompletionRate: 98
        },
        costAnalysis: {
          totalPayroll: staff.reduce((sum, member) => sum + (member.salary || member.hourlyRate * 40 * 4), 0),
          averageHourlyRate: staff.reduce((sum, member) => sum + member.hourlyRate, 0) / totalStaff || 0,
          overtimeCosts: 2500,
          trainingCosts: 800
        }
      };
      
      console.log('✅ Staff analytics calculated');
      
      return {
        success: true,
        analytics
      };
      
    } catch (error) {
      console.error('❌ Error calculating staff analytics:', error);
      return {
        success: false,
        error: error.message || 'Failed to calculate staff analytics'
      };
    }
  }
  
  /**
   * Get time entries
   */
  static async getTimeEntries(
    organizationId: string,
    staffMemberId?: string,
    limit: number = 100
  ): Promise<{
    success: boolean;
    timeEntries?: TimeEntry[];
    error?: string;
  }> {
    try {
      console.log('⏰ Fetching time entries...');
      
      let entitiesQuery = supabase
        .from('core_entities')
        .select(`
          id,
          related_entity_id,
          created_at,
          core_metadata!inner(metadata_value)
        `)
        .eq('organization_id', organizationId)
        .eq('entity_type', 'time_entry')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (staffMemberId) {
        entitiesQuery = entitiesQuery.eq('related_entity_id', staffMemberId);
      }
      
      const { data: entities, error: entitiesError } = await entitiesQuery;
      
      if (entitiesError) throw entitiesError;
      
      const timeEntries: TimeEntry[] = (entities || []).map((entity: any) => {
        const details = entity.core_metadata[0]?.metadata_value || {};
        
        return {
          id: entity.id,
          staffMemberId: entity.related_entity_id,
          clockInTime: details.clock_in_time,
          clockOutTime: details.clock_out_time,
          totalHours: details.total_hours,
          breakTime: details.break_time || 0,
          overtime: details.overtime || 0,
          location: details.location || 'Unknown',
          deviceUsed: details.device_used || 'unknown',
          ipAddress: details.ip_address || 'unknown',
          notes: details.notes,
          status: details.status || 'completed'
        };
      });
      
      console.log(`✅ Fetched ${timeEntries.length} time entries`);
      
      return {
        success: true,
        timeEntries
      };
      
    } catch (error) {
      console.error('❌ Error fetching time entries:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch time entries'
      };
    }
  }
  
  /**
   * Helper: Get default permissions for role
   */
  private static getDefaultPermissions(role: string): Permission[] {
    const basePermissions: Permission[] = [
      {
        id: 'view_dashboard',
        name: 'View Dashboard',
        category: 'system',
        description: 'Access to main dashboard',
        actions: ['read']
      }
    ];
    
    switch (role) {
      case 'admin':
        return [
          ...basePermissions,
          {
            id: 'manage_all',
            name: 'Full System Access',
            category: 'system',
            description: 'Complete system administration',
            actions: ['read', 'create', 'update', 'delete']
          }
        ];
      
      case 'manager':
        return [
          ...basePermissions,
          {
            id: 'manage_staff',
            name: 'Staff Management',
            category: 'staff',
            description: 'Manage staff and schedules',
            actions: ['read', 'create', 'update']
          },
          {
            id: 'view_reports',
            name: 'View Reports',
            category: 'reports',
            description: 'Access to analytical reports',
            actions: ['read']
          }
        ];
      
      case 'supervisor':
        return [
          ...basePermissions,
          {
            id: 'view_orders',
            name: 'Order Management',
            category: 'orders',
            description: 'Process and manage orders',
            actions: ['read', 'update']
          }
        ];
      
      default:
        return basePermissions;
    }
  }
  
  /**
   * Helper: Get role-specific permissions
   */
  private static getRolePermissions(role: string): string[] {
    switch (role) {
      case 'admin':
        return ['*']; // All permissions
      case 'manager':
        return ['staff:*', 'reports:read', 'inventory:*', 'orders:*'];
      case 'supervisor':
        return ['orders:*', 'inventory:read', 'staff:read'];
      case 'employee':
        return ['orders:read', 'orders:update', 'inventory:read'];
      case 'trainee':
        return ['orders:read'];
      default:
        return ['dashboard:read'];
    }
  }
}