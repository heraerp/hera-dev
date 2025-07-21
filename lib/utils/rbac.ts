/**
 * HERA Universal - Role-Based Access Control (RBAC) Utilities
 * 
 * Centralized role management and permission checking
 */

export type UserRole = 'owner' | 'manager' | 'admin' | 'staff' | 'chef' | 'server' | 'cashier';

export interface RolePermissions {
  viewSalary: boolean;
  editSalary: boolean;
  viewAllStaff: boolean;
  editAllStaff: boolean;
  deleteStaff: boolean;
  createStaff: boolean;
  viewReports: boolean;
  editSettings: boolean;
  manageUsers: boolean;
  viewFinancials: boolean;
}

// Define role hierarchy and permissions
const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  owner: {
    viewSalary: true,
    editSalary: true,
    viewAllStaff: true,
    editAllStaff: true,
    deleteStaff: true,
    createStaff: true,
    viewReports: true,
    editSettings: true,
    manageUsers: true,
    viewFinancials: true,
  },
  manager: {
    viewSalary: true,
    editSalary: true,
    viewAllStaff: true,
    editAllStaff: true,
    deleteStaff: true,
    createStaff: true,
    viewReports: true,
    editSettings: false,
    manageUsers: false,
    viewFinancials: true,
  },
  admin: {
    viewSalary: true,
    editSalary: false,
    viewAllStaff: true,
    editAllStaff: true,
    deleteStaff: false,
    createStaff: true,
    viewReports: true,
    editSettings: false,
    manageUsers: false,
    viewFinancials: false,
  },
  staff: {
    viewSalary: false,
    editSalary: false,
    viewAllStaff: true,
    editAllStaff: false,
    deleteStaff: false,
    createStaff: false,
    viewReports: false,
    editSettings: false,
    manageUsers: false,
    viewFinancials: false,
  },
  chef: {
    viewSalary: false,
    editSalary: false,
    viewAllStaff: true,
    editAllStaff: false,
    deleteStaff: false,
    createStaff: false,
    viewReports: false,
    editSettings: false,
    manageUsers: false,
    viewFinancials: false,
  },
  server: {
    viewSalary: false,
    editSalary: false,
    viewAllStaff: false,
    editAllStaff: false,
    deleteStaff: false,
    createStaff: false,
    viewReports: false,
    editSettings: false,
    manageUsers: false,
    viewFinancials: false,
  },
  cashier: {
    viewSalary: false,
    editSalary: false,
    viewAllStaff: false,
    editAllStaff: false,
    deleteStaff: false,
    createStaff: false,
    viewReports: false,
    editSettings: false,
    manageUsers: false,
    viewFinancials: false,
  },
};

/**
 * Check if a user role has a specific permission
 */
export function hasPermission(userRole: string | undefined, permission: keyof RolePermissions): boolean {
  if (!userRole) return false;
  
  const role = userRole.toLowerCase() as UserRole;
  const rolePermissions = ROLE_PERMISSIONS[role];
  
  if (!rolePermissions) {
    console.warn(`Unknown role: ${role}, defaulting to no permissions`);
    return false;
  }
  
  return rolePermissions[permission];
}

/**
 * Check if a user can view salary information
 */
export function canViewSalary(userRole: string | undefined): boolean {
  return hasPermission(userRole, 'viewSalary');
}

/**
 * Check if a user can edit salary information
 */
export function canEditSalary(userRole: string | undefined): boolean {
  return hasPermission(userRole, 'editSalary');
}

/**
 * Check if a user can manage staff (create, edit, delete)
 */
export function canManageStaff(userRole: string | undefined): boolean {
  return hasPermission(userRole, 'editAllStaff') || hasPermission(userRole, 'createStaff');
}

/**
 * Check if a user can delete staff members
 */
export function canDeleteStaff(userRole: string | undefined): boolean {
  return hasPermission(userRole, 'deleteStaff');
}

/**
 * Get all permissions for a role (for debugging/display)
 */
export function getRolePermissions(userRole: string | undefined): RolePermissions | null {
  if (!userRole) return null;
  
  const role = userRole.toLowerCase() as UserRole;
  return ROLE_PERMISSIONS[role] || null;
}

/**
 * Get a user-friendly role display name
 */
export function getRoleDisplayName(userRole: string | undefined): string {
  if (!userRole) return 'Unknown';
  
  const role = userRole.toLowerCase();
  return role.charAt(0).toUpperCase() + role.slice(1);
}