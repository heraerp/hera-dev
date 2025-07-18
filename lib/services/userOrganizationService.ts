/**
 * HERA Universal ERP - User Organization Service
 * Comprehensive service for managing multi-organization access, solution switching,
 * and organization management following Universal Architecture principles
 * 
 * Key Features:
 * - Multi-organization user access management
 * - Solution/module switching within organizations
 * - Role-based permissions and access control
 * - Organization switching and context management
 * - Real-time sync and conflict resolution
 * - Comprehensive audit trail
 */

import { supabase } from '@/lib/supabase/client'
import type { 
  Organization, 
  UserOrganization, 
  UserRole, 
  TransactionPermissions,
  TransactionType
} from '@/types/transactions'

// Entity and metadata types following Universal Architecture
const USER_ORG_ENTITY_TYPES = {
  USER_ORGANIZATION: 'user_organization',
  USER_ROLE: 'user_role',
  USER_PERMISSION: 'user_permission',
  ORGANIZATION_ACCESS: 'organization_access',
  SOLUTION_ACCESS: 'solution_access',
  MODULE_ACCESS: 'module_access'
} as const

const USER_ORG_METADATA_TYPES = {
  ACCESS_CONTEXT: 'access_context',
  PERMISSION_OVERRIDE: 'permission_override',
  ROLE_CONFIGURATION: 'role_configuration',
  SOLUTION_PREFERENCES: 'solution_preferences',
  MODULE_SETTINGS: 'module_settings',
  AUDIT_TRAIL: 'audit_trail'
} as const

// Solution types available in HERA Universal
export interface Solution {
  id: string
  name: string
  code: string
  description: string
  modules: Module[]
  is_active: boolean
  required_role?: UserRole
}

export interface Module {
  id: string
  solution_id: string
  name: string
  code: string
  description: string
  features: string[]
  required_permissions: string[]
  is_active: boolean
}

// Extended UserOrganization with solution access
export interface UserOrganizationAccess extends UserOrganization {
  solutions: SolutionAccess[]
  modules: ModuleAccess[]
  permission_overrides?: PermissionOverride[]
  last_active_solution?: string
  last_active_module?: string
  preferences?: UserPreferences
}

export interface SolutionAccess {
  solution_id: string
  solution_code: string
  solution_name: string
  is_enabled: boolean
  granted_at: string
  granted_by?: string
  expires_at?: string
  usage_count: number
  last_accessed?: string
}

export interface ModuleAccess {
  module_id: string
  module_code: string
  module_name: string
  solution_id: string
  is_enabled: boolean
  permissions: string[]
  restrictions?: string[]
  granted_at: string
  expires_at?: string
}

export interface PermissionOverride {
  permission_key: string
  original_value: any
  override_value: any
  reason: string
  approved_by: string
  valid_from: string
  valid_until?: string
  is_active: boolean
}

export interface UserPreferences {
  default_solution?: string
  default_module?: string
  ui_settings?: Record<string, any>
  notification_preferences?: Record<string, any>
  dashboard_layout?: Record<string, any>
  shortcuts?: Record<string, any>
}

// Organization switching context
export interface OrganizationContext {
  organization: Organization
  userOrganization: UserOrganizationAccess
  permissions: TransactionPermissions
  activeSolution?: Solution
  activeModule?: Module
  availableSolutions: Solution[]
  availableModules: Module[]
}

// Service response types
export interface ServiceResponse<T> {
  success: boolean
  data?: T
  error?: string
  metadata?: Record<string, any>
}

export interface OrganizationSwitchResult {
  previousOrganization?: Organization
  newOrganization: Organization
  context: OrganizationContext
  sessionToken?: string
}

export interface SolutionSwitchResult {
  previousSolution?: Solution
  newSolution: Solution
  availableModules: Module[]
  permissions: Record<string, boolean>
}

// Main service class
export class UserOrganizationService {
  private static STORAGE_KEYS = {
    CURRENT_ORG: 'hera_current_organization',
    CURRENT_SOLUTION: 'hera_current_solution',
    CURRENT_MODULE: 'hera_current_module',
    USER_CONTEXT: 'hera_user_context'
  }

  /**
   * Get all organizations accessible by a user with full access details
   */
  static async getUserOrganizations(userId: string): Promise<ServiceResponse<UserOrganizationAccess[]>> {
    try {
      // Get user's organizations with full relationship data
      const { data: userOrgs, error } = await supabase
        .from('user_organizations')
        .select(`
          *,
          core_organizations!inner(*),
          core_metadata!inner(
            metadata_type,
            metadata_key,
            metadata_value
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .eq('core_organizations.is_active', true)
        .order('joined_at', { ascending: false })

      if (error) throw error

      // Transform to UserOrganizationAccess with solution/module data
      const enrichedOrgs = await Promise.all(
        (userOrgs || []).map(async (uo) => {
          const solutions = await this.getUserSolutionAccess(userId, uo.organization_id)
          const modules = await this.getUserModuleAccess(userId, uo.organization_id)
          const overrides = await this.getPermissionOverrides(userId, uo.organization_id)

          return {
            ...uo,
            solutions: solutions.data || [],
            modules: modules.data || [],
            permission_overrides: overrides.data || [],
            last_active_solution: this.getMetadataValue(uo.core_metadata, 'last_active_solution'),
            last_active_module: this.getMetadataValue(uo.core_metadata, 'last_active_module'),
            preferences: this.getMetadataValue(uo.core_metadata, 'user_preferences')
          } as UserOrganizationAccess
        })
      )

      return { success: true, data: enrichedOrgs }
    } catch (error) {
      console.error('Error fetching user organizations:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch organizations' 
      }
    }
  }

  /**
   * Switch user's active organization with full context
   */
  static async switchOrganization(
    userId: string, 
    organizationId: string
  ): Promise<ServiceResponse<OrganizationSwitchResult>> {
    try {
      // Verify user has access to target organization
      const { data: access, error: accessError } = await supabase
        .from('user_organizations')
        .select('*, core_organizations!inner(*)')
        .eq('user_id', userId)
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .single()

      if (accessError || !access) {
        throw new Error('You do not have access to this organization')
      }

      // Get current organization for comparison
      const currentOrgId = localStorage.getItem(this.STORAGE_KEYS.CURRENT_ORG)
      let previousOrg: Organization | undefined

      if (currentOrgId && currentOrgId !== organizationId) {
        const { data: prevOrgData } = await supabase
          .from('core_organizations')
          .select('*')
          .eq('id', currentOrgId)
          .single()
        
        previousOrg = prevOrgData || undefined
      }

      // Build complete organization context
      const context = await this.buildOrganizationContext(userId, organizationId)
      
      if (!context.data) {
        throw new Error('Failed to build organization context')
      }

      // Update localStorage and session
      localStorage.setItem(this.STORAGE_KEYS.CURRENT_ORG, organizationId)
      localStorage.setItem(this.STORAGE_KEYS.USER_CONTEXT, JSON.stringify(context.data))

      // Create audit trail
      await this.createAuditTrail(userId, organizationId, 'organization_switch', {
        from_organization: currentOrgId,
        to_organization: organizationId,
        timestamp: new Date().toISOString()
      })

      // Update user's last active organization
      await this.updateUserMetadata(userId, organizationId, {
        last_active_organization: organizationId,
        last_switch_timestamp: new Date().toISOString()
      })

      return {
        success: true,
        data: {
          previousOrganization: previousOrg,
          newOrganization: access.core_organizations,
          context: context.data,
          sessionToken: `session-${organizationId}-${Date.now()}`
        }
      }
    } catch (error) {
      console.error('Error switching organization:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to switch organization'
      }
    }
  }

  /**
   * Switch active solution within an organization
   */
  static async switchSolution(
    userId: string,
    organizationId: string,
    solutionId: string
  ): Promise<ServiceResponse<SolutionSwitchResult>> {
    try {
      // Verify user has access to this solution
      const solutionAccess = await this.verifySolutionAccess(userId, organizationId, solutionId)
      
      if (!solutionAccess.success) {
        throw new Error('You do not have access to this solution')
      }

      // Get solution details
      const solution = await this.getSolutionDetails(solutionId)
      if (!solution.data) {
        throw new Error('Solution not found')
      }

      // Get current solution for comparison
      const currentSolutionId = localStorage.getItem(this.STORAGE_KEYS.CURRENT_SOLUTION)
      let previousSolution: Solution | undefined

      if (currentSolutionId && currentSolutionId !== solutionId) {
        const prevSol = await this.getSolutionDetails(currentSolutionId)
        previousSolution = prevSol.data
      }

      // Get available modules for this solution
      const modules = await this.getSolutionModules(solutionId, userId, organizationId)
      
      // Get user's permissions for this solution
      const permissions = await this.getSolutionPermissions(userId, organizationId, solutionId)

      // Update localStorage
      localStorage.setItem(this.STORAGE_KEYS.CURRENT_SOLUTION, solutionId)

      // Update user metadata
      await this.updateUserMetadata(userId, organizationId, {
        last_active_solution: solutionId,
        solution_switch_timestamp: new Date().toISOString()
      })

      // Create audit trail
      await this.createAuditTrail(userId, organizationId, 'solution_switch', {
        from_solution: currentSolutionId,
        to_solution: solutionId,
        timestamp: new Date().toISOString()
      })

      return {
        success: true,
        data: {
          previousSolution,
          newSolution: solution.data,
          availableModules: modules.data || [],
          permissions: permissions.data || {}
        }
      }
    } catch (error) {
      console.error('Error switching solution:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to switch solution'
      }
    }
  }

  /**
   * Get user's solution access for an organization
   */
  static async getUserSolutionAccess(
    userId: string,
    organizationId: string
  ): Promise<ServiceResponse<SolutionAccess[]>> {
    try {
      const { data, error } = await supabase
        .from('core_entities')
        .select(`
          *,
          core_metadata!inner(*)
        `)
        .eq('organization_id', organizationId)
        .eq('entity_type', USER_ORG_ENTITY_TYPES.SOLUTION_ACCESS)
        .eq('core_metadata.metadata_key', 'user_id')
        .eq('core_metadata.metadata_value', userId)
        .eq('is_active', true)

      if (error) throw error

      const solutionAccess = (data || []).map(entity => ({
        solution_id: entity.entity_subtype,
        solution_code: this.getMetadataValue(entity.core_metadata, 'solution_code'),
        solution_name: this.getMetadataValue(entity.core_metadata, 'solution_name'),
        is_enabled: this.getMetadataValue(entity.core_metadata, 'is_enabled') === 'true',
        granted_at: entity.created_at,
        granted_by: this.getMetadataValue(entity.core_metadata, 'granted_by'),
        expires_at: this.getMetadataValue(entity.core_metadata, 'expires_at'),
        usage_count: parseInt(this.getMetadataValue(entity.core_metadata, 'usage_count') || '0'),
        last_accessed: this.getMetadataValue(entity.core_metadata, 'last_accessed')
      })) as SolutionAccess[]

      return { success: true, data: solutionAccess }
    } catch (error) {
      console.error('Error fetching solution access:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch solution access'
      }
    }
  }

  /**
   * Get user's module access for an organization
   */
  static async getUserModuleAccess(
    userId: string,
    organizationId: string
  ): Promise<ServiceResponse<ModuleAccess[]>> {
    try {
      const { data, error } = await supabase
        .from('core_entities')
        .select(`
          *,
          core_metadata!inner(*)
        `)
        .eq('organization_id', organizationId)
        .eq('entity_type', USER_ORG_ENTITY_TYPES.MODULE_ACCESS)
        .eq('core_metadata.metadata_key', 'user_id')
        .eq('core_metadata.metadata_value', userId)
        .eq('is_active', true)

      if (error) throw error

      const moduleAccess = (data || []).map(entity => ({
        module_id: entity.entity_subtype,
        module_code: this.getMetadataValue(entity.core_metadata, 'module_code'),
        module_name: this.getMetadataValue(entity.core_metadata, 'module_name'),
        solution_id: this.getMetadataValue(entity.core_metadata, 'solution_id'),
        is_enabled: this.getMetadataValue(entity.core_metadata, 'is_enabled') === 'true',
        permissions: JSON.parse(this.getMetadataValue(entity.core_metadata, 'permissions') || '[]'),
        restrictions: JSON.parse(this.getMetadataValue(entity.core_metadata, 'restrictions') || '[]'),
        granted_at: entity.created_at,
        expires_at: this.getMetadataValue(entity.core_metadata, 'expires_at')
      })) as ModuleAccess[]

      return { success: true, data: moduleAccess }
    } catch (error) {
      console.error('Error fetching module access:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch module access'
      }
    }
  }

  /**
   * Grant solution access to a user
   */
  static async grantSolutionAccess(
    userId: string,
    organizationId: string,
    solutionId: string,
    grantedBy: string,
    expiresAt?: string
  ): Promise<ServiceResponse<SolutionAccess>> {
    try {
      // Create solution access entity
      const { data: entity, error: entityError } = await supabase
        .from('core_entities')
        .insert({
          organization_id: organizationId,
          entity_type: USER_ORG_ENTITY_TYPES.SOLUTION_ACCESS,
          entity_subtype: solutionId,
          entity_name: `Solution Access - ${userId}`,
          is_active: true
        })
        .select()
        .single()

      if (entityError) throw entityError

      // Get solution details
      const solution = await this.getSolutionDetails(solutionId)
      if (!solution.data) throw new Error('Solution not found')

      // Create metadata
      const metadata = [
        { key: 'user_id', value: userId },
        { key: 'solution_code', value: solution.data.code },
        { key: 'solution_name', value: solution.data.name },
        { key: 'is_enabled', value: 'true' },
        { key: 'granted_by', value: grantedBy },
        { key: 'usage_count', value: '0' }
      ]

      if (expiresAt) {
        metadata.push({ key: 'expires_at', value: expiresAt })
      }

      const { error: metadataError } = await supabase
        .from('core_metadata')
        .insert(
          metadata.map(m => ({
            organization_id: organizationId,
            entity_id: entity.id,
            entity_type: USER_ORG_ENTITY_TYPES.SOLUTION_ACCESS,
            metadata_type: USER_ORG_METADATA_TYPES.ACCESS_CONTEXT,
            metadata_category: 'solution_access',
            metadata_key: m.key,
            metadata_value: m.value,
            is_active: true
          }))
        )

      if (metadataError) throw metadataError

      // Create audit trail
      await this.createAuditTrail(userId, organizationId, 'grant_solution_access', {
        solution_id: solutionId,
        granted_by: grantedBy,
        expires_at: expiresAt
      })

      return {
        success: true,
        data: {
          solution_id: solutionId,
          solution_code: solution.data.code,
          solution_name: solution.data.name,
          is_enabled: true,
          granted_at: new Date().toISOString(),
          granted_by: grantedBy,
          expires_at: expiresAt,
          usage_count: 0
        }
      }
    } catch (error) {
      console.error('Error granting solution access:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to grant solution access'
      }
    }
  }

  /**
   * Revoke solution access from a user
   */
  static async revokeSolutionAccess(
    userId: string,
    organizationId: string,
    solutionId: string,
    revokedBy: string,
    reason?: string
  ): Promise<ServiceResponse<void>> {
    try {
      // Find and deactivate solution access
      const { data: entities, error: findError } = await supabase
        .from('core_entities')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('entity_type', USER_ORG_ENTITY_TYPES.SOLUTION_ACCESS)
        .eq('entity_subtype', solutionId)
        .eq('is_active', true)

      if (findError) throw findError

      if (entities && entities.length > 0) {
        // Deactivate all matching entities
        const { error: updateError } = await supabase
          .from('core_entities')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .in('id', entities.map(e => e.id))

        if (updateError) throw updateError

        // Update metadata with revocation info
        for (const entity of entities) {
          await supabase
            .from('core_metadata')
            .insert([
              {
                organization_id: organizationId,
                entity_id: entity.id,
                entity_type: USER_ORG_ENTITY_TYPES.SOLUTION_ACCESS,
                metadata_type: USER_ORG_METADATA_TYPES.AUDIT_TRAIL,
                metadata_category: 'revocation',
                metadata_key: 'revoked_by',
                metadata_value: revokedBy,
                is_active: true
              },
              {
                organization_id: organizationId,
                entity_id: entity.id,
                entity_type: USER_ORG_ENTITY_TYPES.SOLUTION_ACCESS,
                metadata_type: USER_ORG_METADATA_TYPES.AUDIT_TRAIL,
                metadata_category: 'revocation',
                metadata_key: 'revocation_reason',
                metadata_value: reason || 'Access revoked',
                is_active: true
              }
            ])
        }
      }

      // Create audit trail
      await this.createAuditTrail(userId, organizationId, 'revoke_solution_access', {
        solution_id: solutionId,
        revoked_by: revokedBy,
        reason: reason
      })

      return { success: true }
    } catch (error) {
      console.error('Error revoking solution access:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to revoke solution access'
      }
    }
  }

  /**
   * Get permission overrides for a user in an organization
   */
  static async getPermissionOverrides(
    userId: string,
    organizationId: string
  ): Promise<ServiceResponse<PermissionOverride[]>> {
    try {
      const { data, error } = await supabase
        .from('core_entities')
        .select(`
          *,
          core_metadata!inner(*)
        `)
        .eq('organization_id', organizationId)
        .eq('entity_type', USER_ORG_ENTITY_TYPES.USER_PERMISSION)
        .eq('entity_subtype', 'permission_override')
        .eq('core_metadata.metadata_key', 'user_id')
        .eq('core_metadata.metadata_value', userId)
        .eq('is_active', true)

      if (error) throw error

      const overrides = (data || []).map(entity => {
        const metadata = entity.core_metadata || []
        return {
          permission_key: this.getMetadataValue(metadata, 'permission_key'),
          original_value: JSON.parse(this.getMetadataValue(metadata, 'original_value') || 'null'),
          override_value: JSON.parse(this.getMetadataValue(metadata, 'override_value') || 'null'),
          reason: this.getMetadataValue(metadata, 'reason'),
          approved_by: this.getMetadataValue(metadata, 'approved_by'),
          valid_from: this.getMetadataValue(metadata, 'valid_from'),
          valid_until: this.getMetadataValue(metadata, 'valid_until'),
          is_active: true
        }
      }) as PermissionOverride[]

      return { success: true, data: overrides }
    } catch (error) {
      console.error('Error fetching permission overrides:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch permission overrides'
      }
    }
  }

  /**
   * Build complete organization context for a user
   */
  static async buildOrganizationContext(
    userId: string,
    organizationId: string
  ): Promise<ServiceResponse<OrganizationContext>> {
    try {
      // Get organization details
      const { data: org, error: orgError } = await supabase
        .from('core_organizations')
        .select('*')
        .eq('id', organizationId)
        .single()

      if (orgError || !org) throw new Error('Organization not found')

      // Get user organization relationship
      const { data: userOrg, error: userOrgError } = await supabase
        .from('user_organizations')
        .select('*')
        .eq('user_id', userId)
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .single()

      if (userOrgError || !userOrg) throw new Error('User organization relationship not found')

      // Get solution and module access
      const [solutions, modules, overrides] = await Promise.all([
        this.getUserSolutionAccess(userId, organizationId),
        this.getUserModuleAccess(userId, organizationId),
        this.getPermissionOverrides(userId, organizationId)
      ])

      // Build UserOrganizationAccess
      const userOrgAccess: UserOrganizationAccess = {
        ...userOrg,
        solutions: solutions.data || [],
        modules: modules.data || [],
        permission_overrides: overrides.data || []
      }

      // Calculate effective permissions
      const permissions = await this.calculateEffectivePermissions(
        userOrg.role,
        userOrg.permissions,
        overrides.data || []
      )

      // Get available solutions for this user
      const availableSolutions = await this.getAvailableSolutions(organizationId, userOrg.role)

      // Get current active solution and module
      const currentSolutionId = localStorage.getItem(this.STORAGE_KEYS.CURRENT_SOLUTION)
      let activeSolution: Solution | undefined
      let availableModules: Module[] = []

      if (currentSolutionId) {
        const sol = await this.getSolutionDetails(currentSolutionId)
        if (sol.data) {
          activeSolution = sol.data
          const mods = await this.getSolutionModules(currentSolutionId, userId, organizationId)
          availableModules = mods.data || []
        }
      }

      return {
        success: true,
        data: {
          organization: org,
          userOrganization: userOrgAccess,
          permissions: permissions.data!,
          activeSolution,
          activeModule: undefined, // TODO: Implement active module tracking
          availableSolutions: availableSolutions.data || [],
          availableModules
        }
      }
    } catch (error) {
      console.error('Error building organization context:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to build organization context'
      }
    }
  }

  /**
   * Calculate effective permissions considering role and overrides
   */
  private static async calculateEffectivePermissions(
    role: UserRole,
    customPermissions?: Record<string, any>,
    overrides?: PermissionOverride[]
  ): Promise<ServiceResponse<TransactionPermissions>> {
    try {
      // Base permissions by role
      const rolePermissions: Record<UserRole, TransactionPermissions> = {
        admin: {
          can_view: true,
          can_create: true,
          can_edit: true,
          can_approve: true,
          can_delete: true,
          can_admin: true,
          can_export: true,
          can_override_controls: true,
          allowed_transaction_types: ['journal_entry', 'sales', 'purchase', 'payment', 'master_data', 'inventory', 'payroll', 'reconciliation']
        },
        manager: {
          can_view: true,
          can_create: true,
          can_edit: true,
          can_approve: true,
          can_delete: false,
          can_admin: false,
          can_export: true,
          can_override_controls: false,
          max_transaction_amount: 100000,
          allowed_transaction_types: ['journal_entry', 'sales', 'purchase', 'payment', 'inventory']
        },
        editor: {
          can_view: true,
          can_create: true,
          can_edit: true,
          can_approve: false,
          can_delete: false,
          can_admin: false,
          can_export: true,
          can_override_controls: false,
          max_transaction_amount: 10000,
          allowed_transaction_types: ['journal_entry', 'sales', 'purchase', 'payment']
        },
        user: {
          can_view: true,
          can_create: true,
          can_edit: false,
          can_approve: false,
          can_delete: false,
          can_admin: false,
          can_export: false,
          can_override_controls: false,
          max_transaction_amount: 1000,
          allowed_transaction_types: ['journal_entry', 'sales', 'purchase']
        },
        viewer: {
          can_view: true,
          can_create: false,
          can_edit: false,
          can_approve: false,
          can_delete: false,
          can_admin: false,
          can_export: false,
          can_override_controls: false,
          allowed_transaction_types: []
        }
      }

      // Start with role permissions
      let permissions = { ...rolePermissions[role] }

      // Apply custom permissions
      if (customPermissions) {
        permissions = { ...permissions, ...customPermissions }
      }

      // Apply active overrides
      if (overrides) {
        const now = new Date()
        for (const override of overrides) {
          if (!override.is_active) continue

          // Check validity period
          if (override.valid_from && new Date(override.valid_from) > now) continue
          if (override.valid_until && new Date(override.valid_until) < now) continue

          // Apply override
          (permissions as any)[override.permission_key] = override.override_value
        }
      }

      return { success: true, data: permissions }
    } catch (error) {
      console.error('Error calculating permissions:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate permissions'
      }
    }
  }

  /**
   * Get available solutions for an organization
   */
  private static async getAvailableSolutions(
    organizationId: string,
    userRole: UserRole
  ): Promise<ServiceResponse<Solution[]>> {
    try {
      // Mock solution data - replace with actual database query
      const allSolutions: Solution[] = [
        {
          id: 'fin-001',
          name: 'Financial Management',
          code: 'FINANCE',
          description: 'Complete financial management solution',
          modules: [],
          is_active: true
        },
        {
          id: 'inv-001',
          name: 'Inventory Management',
          code: 'INVENTORY',
          description: 'Advanced inventory and warehouse management',
          modules: [],
          is_active: true,
          required_role: 'editor'
        },
        {
          id: 'hr-001',
          name: 'Human Resources',
          code: 'HR',
          description: 'Complete HR and payroll management',
          modules: [],
          is_active: true,
          required_role: 'manager'
        },
        {
          id: 'crm-001',
          name: 'Customer Relationship Management',
          code: 'CRM',
          description: 'Customer and sales management',
          modules: [],
          is_active: true
        }
      ]

      // Filter by role requirements
      const roleHierarchy: Record<UserRole, number> = {
        viewer: 1,
        user: 2,
        editor: 3,
        manager: 4,
        admin: 5
      }

      const userRoleLevel = roleHierarchy[userRole]
      const availableSolutions = allSolutions.filter(solution => {
        if (!solution.required_role) return true
        return roleHierarchy[solution.required_role] <= userRoleLevel
      })

      return { success: true, data: availableSolutions }
    } catch (error) {
      console.error('Error fetching available solutions:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch available solutions'
      }
    }
  }

  /**
   * Get solution details
   */
  private static async getSolutionDetails(solutionId: string): Promise<ServiceResponse<Solution>> {
    try {
      // Mock implementation - replace with actual database query
      const solution: Solution = {
        id: solutionId,
        name: 'Solution Name',
        code: 'SOLUTION_CODE',
        description: 'Solution description',
        modules: [],
        is_active: true
      }

      return { success: true, data: solution }
    } catch (error) {
      console.error('Error fetching solution details:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch solution details'
      }
    }
  }

  /**
   * Get modules for a solution
   */
  private static async getSolutionModules(
    solutionId: string,
    userId: string,
    organizationId: string
  ): Promise<ServiceResponse<Module[]>> {
    try {
      // Mock implementation - replace with actual database query
      const modules: Module[] = [
        {
          id: 'mod-001',
          solution_id: solutionId,
          name: 'General Ledger',
          code: 'GL',
          description: 'General ledger and journal entries',
          features: ['Journal Entries', 'Trial Balance', 'Financial Reports'],
          required_permissions: ['can_create', 'can_view'],
          is_active: true
        }
      ]

      return { success: true, data: modules }
    } catch (error) {
      console.error('Error fetching solution modules:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch solution modules'
      }
    }
  }

  /**
   * Get solution permissions for a user
   */
  private static async getSolutionPermissions(
    userId: string,
    organizationId: string,
    solutionId: string
  ): Promise<ServiceResponse<Record<string, boolean>>> {
    try {
      // Mock implementation - replace with actual permission calculation
      const permissions: Record<string, boolean> = {
        can_access_gl: true,
        can_create_journal: true,
        can_approve_journal: false,
        can_post_journal: false,
        can_view_reports: true,
        can_export_reports: true
      }

      return { success: true, data: permissions }
    } catch (error) {
      console.error('Error fetching solution permissions:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch solution permissions'
      }
    }
  }

  /**
   * Verify user has access to a solution
   */
  private static async verifySolutionAccess(
    userId: string,
    organizationId: string,
    solutionId: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      const { data, error } = await supabase
        .from('core_entities')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('entity_type', USER_ORG_ENTITY_TYPES.SOLUTION_ACCESS)
        .eq('entity_subtype', solutionId)
        .eq('is_active', true)
        .limit(1)

      if (error) throw error

      return { success: true, data: (data && data.length > 0) }
    } catch (error) {
      console.error('Error verifying solution access:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify solution access'
      }
    }
  }

  /**
   * Create audit trail entry
   */
  private static async createAuditTrail(
    userId: string,
    organizationId: string,
    action: string,
    details: Record<string, any>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('universal_transactions')
        .insert({
          organization_id: organizationId,
          transaction_type: 'audit_trail',
          transaction_subtype: action,
          transaction_number: `AUDIT-${Date.now()}`,
          business_date: new Date().toISOString().split('T')[0],
          transaction_data: {
            user_id: userId,
            action: action,
            details: details,
            timestamp: new Date().toISOString(),
            ip_address: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
            user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
          },
          workflow_status: 'POSTED',
          created_by: userId
        })

      if (error) throw error
    } catch (error) {
      console.error('Error creating audit trail:', error)
    }
  }

  /**
   * Update user metadata
   */
  private static async updateUserMetadata(
    userId: string,
    organizationId: string,
    metadata: Record<string, any>
  ): Promise<void> {
    try {
      const metadataEntries = Object.entries(metadata).map(([key, value]) => ({
        organization_id: organizationId,
        entity_id: userId,
        entity_type: 'user',
        metadata_type: USER_ORG_METADATA_TYPES.SOLUTION_PREFERENCES,
        metadata_category: 'user_preferences',
        metadata_key: key,
        metadata_value: typeof value === 'string' ? value : JSON.stringify(value),
        is_active: true
      }))

      const { error } = await supabase
        .from('core_metadata')
        .upsert(metadataEntries, {
          onConflict: 'organization_id,entity_id,entity_type,metadata_key'
        })

      if (error) throw error
    } catch (error) {
      console.error('Error updating user metadata:', error)
    }
  }

  /**
   * Get metadata value helper
   */
  private static getMetadataValue(metadata: any[], key: string): any {
    if (!metadata || !Array.isArray(metadata)) return null
    const item = metadata.find(m => m.metadata_key === key)
    return item ? item.metadata_value : null
  }

  /**
   * Subscribe to organization changes
   */
  static subscribeToOrganizationChanges(
    organizationId: string,
    callback: (payload: any) => void
  ) {
    return supabase
      .channel(`user-org-${organizationId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_organizations', 
          filter: `organization_id=eq.${organizationId}` 
        },
        callback
      )
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'core_entities', 
          filter: `organization_id=eq.${organizationId},entity_type=in.(${Object.values(USER_ORG_ENTITY_TYPES).join(',')})` 
        },
        callback
      )
      .subscribe()
  }

  /**
   * Unsubscribe from changes
   */
  static unsubscribe(subscription: any) {
    if (subscription) {
      supabase.removeChannel(subscription)
    }
  }
}

export default UserOrganizationService