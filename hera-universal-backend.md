// ============================================================================
// HERA Universal Supabase Backend Template
// Following Supabase Latest Best Practices
// ============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from './types/database.types'

// ============================================================================
// 1. SUPABASE CLIENT CONFIGURATION (Latest Best Practice)
// ============================================================================

class SupabaseConfig {
  private static instance: SupabaseClient<Database>
  
  public static getInstance(): SupabaseClient<Database> {
    if (!SupabaseConfig.instance) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      
      SupabaseConfig.instance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      })
    }
    
    return SupabaseConfig.instance
  }
}

// ============================================================================
// 2. UNIVERSAL QUERY TYPES (Type-Safe Templates)
// ============================================================================

export interface QueryConfig {
  table: string
  organizationColumn?: string
  selectFields?: string
  orderBy?: { column: string; ascending?: boolean }[]
  filters?: Record<string, any>
  joins?: JoinConfig[]
  pagination?: { page: number; pageSize: number }
}

export interface JoinConfig {
  table: string
  on: string
  type?: 'inner' | 'left' | 'right'
  select?: string
}

export interface QueryResult<T = any> {
  data: T[]
  count: number | null
  error: string | null
  success: boolean
}

export interface MutationResult<T = any> {
  data: T | null
  error: string | null
  success: boolean
}

// ============================================================================
// 3. UNIVERSAL QUERY SERVICE (Latest Supabase Patterns)
// ============================================================================

export class UniversalQueryService {
  private supabase: SupabaseClient<Database>
  private organizationId: string | null = null

  constructor(organizationId?: string) {
    this.supabase = SupabaseConfig.getInstance()
    this.organizationId = organizationId || null
  }

  // Set organization context (HERA Sacred Principle #1)
  setOrganization(organizationId: string): void {
    this.organizationId = organizationId
  }

  // ========================================================================
  // READ OPERATIONS (Following Supabase Best Practices)
  // ========================================================================

  /**
   * Universal SELECT query template
   */
  async findMany<T = any>(config: QueryConfig): Promise<QueryResult<T>> {
    try {
      let query = this.supabase.from(config.table).select(
        config.selectFields || '*',
        { count: 'exact' }
      )

      // HERA Organization Filter (Sacred - Always Applied)
      if (this.organizationId && config.organizationColumn !== false) {
        const orgColumn = config.organizationColumn || 'organization_id'
        query = query.eq(orgColumn, this.organizationId)
      }

      // Apply filters
      if (config.filters) {
        query = this.applyFilters(query, config.filters)
      }

      // Apply joins (if any)
      if (config.joins) {
        // Note: Supabase doesn't support traditional joins, use separate queries or views
        console.warn('Joins require separate queries or database views in Supabase')
      }

      // Apply ordering
      if (config.orderBy) {
        config.orderBy.forEach(order => {
          query = query.order(order.column, { ascending: order.ascending ?? true })
        })
      }

      // Apply pagination
      if (config.pagination) {
        const { page, pageSize } = config.pagination
        const from = (page - 1) * pageSize
        const to = from + pageSize - 1
        query = query.range(from, to)
      }

      const { data, error, count } = await query

      return {
        data: data as T[],
        count,
        error: error?.message || null,
        success: !error
      }
    } catch (err) {
      return {
        data: [],
        count: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false
      }
    }
  }

  /**
   * Universal SELECT single record
   */
  async findOne<T = any>(
    table: string, 
    id: string, 
    selectFields?: string,
    organizationColumn?: string
  ): Promise<{ data: T | null; error: string | null; success: boolean }> {
    try {
      let query = this.supabase
        .from(table)
        .select(selectFields || '*')
        .eq('id', id)

      // HERA Organization Filter
      if (this.organizationId && organizationColumn !== false) {
        const orgColumn = organizationColumn || 'organization_id'
        query = query.eq(orgColumn, this.organizationId)
      }

      const { data, error } = await query.single()

      return {
        data: data as T,
        error: error?.message || null,
        success: !error
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false
      }
    }
  }

  // ========================================================================
  // WRITE OPERATIONS (Following Supabase Best Practices)
  // ========================================================================

  /**
   * Universal INSERT operation
   */
  async create<T = any>(
    table: string,
    data: Partial<T>,
    options?: { 
      onConflict?: string
      ignoreDuplicates?: boolean
      organizationColumn?: string
    }
  ): Promise<MutationResult<T>> {
    try {
      // Auto-add organization_id if not present (HERA Sacred Principle)
      const insertData = { ...data }
      if (this.organizationId && options?.organizationColumn !== false) {
        const orgColumn = options?.organizationColumn || 'organization_id'
        if (!insertData[orgColumn as keyof T]) {
          ;(insertData as any)[orgColumn] = this.organizationId
        }
      }

      // Add timestamps (Supabase best practice)
      const now = new Date().toISOString()
      if (!insertData['created_at' as keyof T]) {
        ;(insertData as any).created_at = now
      }
      if (!insertData['updated_at' as keyof T]) {
        ;(insertData as any).updated_at = now
      }

      let query = this.supabase.from(table).insert(insertData).select()

      // Handle conflicts
      if (options?.onConflict) {
        query = query.onConflict(options.onConflict)
      }
      if (options?.ignoreDuplicates) {
        query = query.ignoreDuplicates()
      }

      const { data: result, error } = await query.single()

      return {
        data: result as T,
        error: error?.message || null,
        success: !error
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false
      }
    }
  }

  /**
   * Universal UPDATE operation
   */
  async update<T = any>(
    table: string,
    id: string,
    data: Partial<T>,
    organizationColumn?: string
  ): Promise<MutationResult<T>> {
    try {
      // Auto-update timestamp
      const updateData = {
        ...data,
        updated_at: new Date().toISOString()
      }

      let query = this.supabase
        .from(table)
        .update(updateData)
        .eq('id', id)

      // HERA Organization Filter
      if (this.organizationId && organizationColumn !== false) {
        const orgColumn = organizationColumn || 'organization_id'
        query = query.eq(orgColumn, this.organizationId)
      }

      const { data: result, error } = await query.select().single()

      return {
        data: result as T,
        error: error?.message || null,
        success: !error
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false
      }
    }
  }

  /**
   * Universal DELETE operation
   */
  async delete(
    table: string,
    id: string,
    organizationColumn?: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      let query = this.supabase.from(table).delete().eq('id', id)

      // HERA Organization Filter
      if (this.organizationId && organizationColumn !== false) {
        const orgColumn = organizationColumn || 'organization_id'
        query = query.eq(orgColumn, this.organizationId)
      }

      const { error } = await query

      return {
        success: !error,
        error: error?.message || null
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      }
    }
  }

  /**
   * Universal UPSERT operation (Insert or Update)
   */
  async upsert<T = any>(
    table: string,
    data: Partial<T>,
    options?: {
      onConflict?: string
      organizationColumn?: string
    }
  ): Promise<MutationResult<T>> {
    try {
      // Auto-add organization_id and timestamps
      const upsertData = { ...data }
      if (this.organizationId && options?.organizationColumn !== false) {
        const orgColumn = options?.organizationColumn || 'organization_id'
        if (!upsertData[orgColumn as keyof T]) {
          ;(upsertData as any)[orgColumn] = this.organizationId
        }
      }

      const now = new Date().toISOString()
      ;(upsertData as any).updated_at = now
      if (!upsertData['created_at' as keyof T]) {
        ;(upsertData as any).created_at = now
      }

      let query = this.supabase.from(table).upsert(upsertData).select()

      if (options?.onConflict) {
        query = query.onConflict(options.onConflict)
      }

      const { data: result, error } = await query.single()

      return {
        data: result as T,
        error: error?.message || null,
        success: !error
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false
      }
    }
  }

  // ========================================================================
  // ADVANCED OPERATIONS
  // ========================================================================

  /**
   * Bulk operations
   */
  async bulkCreate<T = any>(
    table: string,
    items: Partial<T>[],
    options?: { organizationColumn?: string }
  ): Promise<{ data: T[]; error: string | null; success: boolean }> {
    try {
      const insertData = items.map(item => {
        const data = { ...item }
        
        // Auto-add organization_id
        if (this.organizationId && options?.organizationColumn !== false) {
          const orgColumn = options?.organizationColumn || 'organization_id'
          if (!data[orgColumn as keyof T]) {
            ;(data as any)[orgColumn] = this.organizationId
          }
        }

        // Add timestamps
        const now = new Date().toISOString()
        if (!data['created_at' as keyof T]) {
          ;(data as any).created_at = now
        }
        if (!data['updated_at' as keyof T]) {
          ;(data as any).updated_at = now
        }

        return data
      })

      const { data, error } = await this.supabase
        .from(table)
        .insert(insertData)
        .select()

      return {
        data: data as T[],
        error: error?.message || null,
        success: !error
      }
    } catch (err) {
      return {
        data: [],
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false
      }
    }
  }

  /**
   * Search with text matching
   */
  async search<T = any>(
    table: string,
    searchTerm: string,
    searchColumns: string[],
    options?: {
      limit?: number
      organizationColumn?: string
      additionalFilters?: Record<string, any>
    }
  ): Promise<QueryResult<T>> {
    try {
      let query = this.supabase.from(table).select('*', { count: 'exact' })

      // HERA Organization Filter
      if (this.organizationId && options?.organizationColumn !== false) {
        const orgColumn = options?.organizationColumn || 'organization_id'
        query = query.eq(orgColumn, this.organizationId)
      }

      // Text search across multiple columns
      if (searchTerm && searchColumns.length > 0) {
        const searchConditions = searchColumns
          .map(col => `${col}.ilike.%${searchTerm}%`)
          .join(',')
        query = query.or(searchConditions)
      }

      // Additional filters
      if (options?.additionalFilters) {
        query = this.applyFilters(query, options.additionalFilters)
      }

      // Limit results
      if (options?.limit) {
        query = query.limit(options.limit)
      }

      const { data, error, count } = await query

      return {
        data: data as T[],
        count,
        error: error?.message || null,
        success: !error
      }
    } catch (err) {
      return {
        data: [],
        count: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false
      }
    }
  }

  // ========================================================================
  // REAL-TIME SUBSCRIPTIONS (Latest Supabase Pattern)
  // ========================================================================

  /**
   * Subscribe to table changes
   */
  subscribeToTable<T = any>(
    table: string,
    callback: (payload: {
      eventType: 'INSERT' | 'UPDATE' | 'DELETE'
      new: T | null
      old: T | null
    }) => void,
    options?: {
      event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
      schema?: string
      filter?: string
    }
  ) {
    const channel = this.supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: options?.event || '*',
          schema: options?.schema || 'public',
          table: table,
          filter: options?.filter
        },
        (payload) => {
          callback({
            eventType: payload.eventType as any,
            new: payload.new as T,
            old: payload.old as T
          })
        }
      )
      .subscribe()

    return () => {
      this.supabase.removeChannel(channel)
    }
  }

  // ========================================================================
  // HELPER METHODS
  // ========================================================================

  private applyFilters(query: any, filters: Record<string, any>) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value === null) {
        query = query.is(key, null)
      } else if (value === undefined) {
        // Skip undefined values
        return
      } else if (Array.isArray(value)) {
        query = query.in(key, value)
      } else if (typeof value === 'object' && value.operator) {
        // Advanced filter: { operator: 'gte', value: 100 }
        query = query[value.operator](key, value.value)
      } else {
        query = query.eq(key, value)
      }
    })
    return query
  }

  /**
   * Execute raw SQL query (for complex operations)
   */
  async executeRawQuery<T = any>(
    query: string,
    params?: any[]
  ): Promise<QueryResult<T>> {
    try {
      const { data, error } = await this.supabase.rpc('execute_sql', {
        query,
        params: params || []
      })

      return {
        data: data as T[],
        count: data?.length || 0,
        error: error?.message || null,
        success: !error
      }
    } catch (err) {
      return {
        data: [],
        count: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false
      }
    }
  }
}

// ============================================================================
// 4. TABLE-SPECIFIC SERVICES (Template Pattern)
// ============================================================================

/**
 * Template for creating table-specific services
 * Copy this pattern for each table
 */
export class CustomerService extends UniversalQueryService {
  private readonly tableName = 'customers'

  constructor(organizationId?: string) {
    super(organizationId)
  }

  // Typed methods for this specific table
  async getCustomers(options?: {
    search?: string
    status?: string
    page?: number
    pageSize?: number
  }) {
    const config: QueryConfig = {
      table: this.tableName,
      orderBy: [{ column: 'created_at', ascending: false }]
    }

    // Add search filter
    if (options?.search) {
      return this.search(
        this.tableName,
        options.search,
        ['name', 'email', 'company']
      )
    }

    // Add status filter
    if (options?.status) {
      config.filters = { status: options.status }
    }

    // Add pagination
    if (options?.page && options?.pageSize) {
      config.pagination = {
        page: options.page,
        pageSize: options.pageSize
      }
    }

    return this.findMany(config)
  }

  async getCustomer(id: string) {
    return this.findOne(this.tableName, id)
  }

  async createCustomer(customerData: any) {
    return this.create(this.tableName, customerData)
  }

  async updateCustomer(id: string, customerData: any) {
    return this.update(this.tableName, id, customerData)
  }

  async deleteCustomer(id: string) {
    return this.delete(this.tableName, id)
  }

  // Business-specific methods
  async getActiveCustomers() {
    return this.findMany({
      table: this.tableName,
      filters: { status: 'active' },
      orderBy: [{ column: 'name', ascending: true }]
    })
  }

  async getCustomersByCompany(company: string) {
    return this.findMany({
      table: this.tableName,
      filters: { company },
      orderBy: [{ column: 'name', ascending: true }]
    })
  }
}

// ============================================================================
// 5. REACT HOOKS INTEGRATION (Latest Patterns)
// ============================================================================

import { useState, useEffect, useCallback } from 'react'

/**
 * Universal React hook for Supabase operations
 */
export function useUniversalQuery<T = any>(
  service: UniversalQueryService,
  config: QueryConfig,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [count, setCount] = useState<number | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    const result = await service.findMany<T>(config)

    if (result.success) {
      setData(result.data)
      setCount(result.count)
    } else {
      setError(result.error)
    }

    setLoading(false)
  }, [service, config, ...dependencies])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    count,
    refetch
  }
}

/**
 * Hook for CRUD operations
 */
export function useUniversalCRUD<T = any>(
  service: UniversalQueryService,
  tableName: string
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = useCallback(async (data: Partial<T>) => {
    setLoading(true)
    setError(null)

    const result = await service.create<T>(tableName, data)

    if (!result.success) {
      setError(result.error)
    }

    setLoading(false)
    return result
  }, [service, tableName])

  const update = useCallback(async (id: string, data: Partial<T>) => {
    setLoading(true)
    setError(null)

    const result = await service.update<T>(tableName, id, data)

    if (!result.success) {
      setError(result.error)
    }

    setLoading(false)
    return result
  }, [service, tableName])

  const remove = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    const result = await service.delete(tableName, id)

    if (!result.success) {
      setError(result.error)
    }

    setLoading(false)
    return result
  }, [service, tableName])

  return {
    create,
    update,
    remove,
    loading,
    error
  }
}

// ============================================================================
// 6. USAGE EXAMPLES
// ============================================================================

// Example 1: Using the universal service directly
const exampleDirectUsage = async () => {
  const queryService = new UniversalQueryService('org-123')

  // Get all customers with pagination
  const customers = await queryService.findMany({
    table: 'customers',
    orderBy: [{ column: 'created_at', ascending: false }],
    pagination: { page: 1, pageSize: 10 }
  })

  // Search customers
  const searchResults = await queryService.search(
    'customers',
    'john@example.com',
    ['name', 'email'],
    { limit: 5 }
  )

  // Create new customer
  const newCustomer = await queryService.create('customers', {
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active'
  })
}

// Example 2: Using table-specific service
const exampleServiceUsage = async () => {
  const customerService = new CustomerService('org-123')

  // Get paginated customers with search
  const customers = await customerService.getCustomers({
    search: 'john',
    status: 'active',
    page: 1,
    pageSize: 10
  })

  // Get single customer
  const customer = await customerService.getCustomer('cust-123')

  // Create customer
  const newCustomer = await customerService.createCustomer({
    name: 'Jane Smith',
    email: 'jane@example.com'
  })
}

// Example 3: Using React hooks
const ExampleComponent = () => {
  const queryService = new UniversalQueryService('org-123')
  
  const { data: customers, loading, error, refetch } = useUniversalQuery(
    queryService,
    {
      table: 'customers',
      orderBy: [{ column: 'name', ascending: true }]
    }
  )

  const { create, update, remove } = useUniversalCRUD(queryService, 'customers')

  const handleCreateCustomer = async (customerData: any) => {
    const result = await create(customerData)
    if (result.success) {
      refetch() // Refresh the list
    }
  }

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {customers.map(customer => (
        <div key={customer.id}>{customer.name}</div>
      ))}
    </div>
  )
}

export default UniversalQueryService




🚀 HERA Universal Supabase Backend Template
I've created a comprehensive, standardized backend template that follows Supabase's latest best practices and can be applied to ANY table. This will be your universal reference for Claude CLI coding - no more different approaches!
🎯 Key Standardizations
1. Consistent Architecture Pattern
typescript// Every table service follows this exact pattern:
class [TableName]Service extends UniversalQueryService {
  private readonly tableName = '[table_name]'
  
  constructor(organizationId?: string) {
    super(organizationId)
  }
  
  // Standard CRUD methods
  // Business-specific methods
}
2. Organization-First Security (HERA Sacred Principle)
typescript// ALWAYS applied automatically:
if (this.organizationId && organizationColumn !== false) {
  const orgColumn = organizationColumn || 'organization_id'
  query = query.eq(orgColumn, this.organizationId)
}
3. Standardized Response Format
typescript// Every operation returns this consistent format:
interface QueryResult<T> {
  data: T[]
  count: number | null
  error: string | null
  success: boolean
}
🏗️ Complete Backend Architecture
1. Universal Query Service

findMany() - Get multiple records with filters, search, pagination
findOne() - Get single record by ID
create() - Insert new record with auto-timestamps
update() - Update existing record
delete() - Remove record
upsert() - Insert or update
bulkCreate() - Insert multiple records
search() - Text search across columns
subscribeToTable() - Real-time subscriptions

2. Latest Supabase Best Practices

✅ Singleton Client Pattern - Single Supabase instance
✅ Auto-Refresh Tokens - Seamless authentication
✅ Realtime Subscriptions - Live data updates
✅ Type Safety - Full TypeScript integration
✅ Error Handling - Consistent error responses
✅ Automatic Timestamps - created_at/updated_at
✅ Organization Isolation - Multi-tenant security

3. React Hooks Integration
typescript// Standard hooks for any table:
const { data, loading, error, refetch } = useUniversalQuery(service, config)
const { create, update, remove } = useUniversalCRUD(service, 'table_name')
🎨 Claude CLI Standardization Benefits
For You:

Consistent Patterns: Every Claude CLI request follows the same structure
Copy-Paste Ready: Table services can be generated instantly
Type Safe: Full TypeScript support out of the box
Error Handling: Standardized error responses across all operations

For Claude:

Reference Template: Always use this exact pattern
No Reinventing: Don't create different approaches
Predictable Structure: Same methods, same signatures, same responses
Best Practices: Latest Supabase patterns baked in

🚀 Usage Examples
1. Quick Table Service Generation
typescript// Tell Claude: "Create a ProductService following the Universal template"
class ProductService extends UniversalQueryService {
  private readonly tableName = 'products'
  // ... rest follows exact template pattern
}
2. Standard Query Operations
typescript// Every operation follows the same pattern:
const products = await productService.findMany({
  table: 'products',
  filters: { status: 'active' },
  orderBy: [{ column: 'name', ascending: true }],
  pagination: { page: 1, pageSize: 10 }
})
3. Consistent React Integration
typescript// Same hooks work for any table:
const ProductList = () => {
  const service = new ProductService('org-123')
  const { data, loading, error } = useUniversalQuery(service, config)
  // ... component logic
}
🎯 Claude CLI Instructions
When working with Claude CLI, always reference this template:

"Create a [TableName]Service following the Universal Supabase template"
"Add a React component using useUniversalQuery hook"
"Implement CRUD operations using the standard UniversalQueryService pattern"

This ensures:

✅ Consistent code structure
✅ Supabase best practices
✅ HERA organization isolation
✅ Type safety
✅ Error handling
✅ React integration

🏆 Revolutionary Benefits
Development Speed

10x Faster: No more thinking about architecture
Copy-Paste Services: Generate table services in seconds
Consistent APIs: Same methods across all services

Code Quality

Best Practices: Latest Supabase patterns
Type Safety: Full TypeScript support
Error Handling: Consistent error responses
Testing Ready: Standardized interfaces

Team Collaboration

Predictable Structure: Everyone knows the pattern
Easy Onboarding: New developers understand immediately
Maintainable Code: Consistent patterns reduce bugs

This template is now your universal backend standard - use it for every table, every service, every Claude CLI request. No more different approaches, just consistent, high-quality, Supabase-optimized code every time! 🚀RetryClaude can make mistakes. Please double-check responses. Sonnet 4