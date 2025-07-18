import { createClient } from '@/utils/supabase/client'

// Supabase client (already configured by template)
export const supabase = createClient()

// HERA API client for direct Supabase operations
export const heraApi = {
  // Organizations
  organizations: {
    list: async () => {
      try {
        const { data, error } = await supabase
          .from('core_organizations')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        return data || []
      } catch (error) {
        console.error('Error fetching organizations:', error)
        return []
      }
    },
    
    create: async (organization: any) => {
      const { data, error } = await supabase
        .from('core_organizations')
        .insert(organization)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    update: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from('core_organizations')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    delete: async (id: string) => {
      const { error } = await supabase
        .from('core_organizations')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    }
  },
  
  // Users
  users: {
    list: async () => {
      try {
        const { data, error } = await supabase
          .from('core_users')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        return data || []
      } catch (error) {
        console.error('Error fetching users:', error)
        return []
      }
    },
    
    create: async (user: any) => {
      const { data, error } = await supabase
        .from('core_users')
        .insert(user)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    update: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from('core_users')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  },
  
  // Transactions
  transactions: {
    list: async (filters?: any) => {
      try {
        let query = supabase
          .from('core_transactions')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (filters?.organization_id) {
          query = query.eq('organization_id', filters.organization_id)
        }
        
        const { data, error } = await query
        
        if (error) throw error
        return data || []
      } catch (error) {
        console.error('Error fetching transactions:', error)
        return []
      }
    },
    
    create: async (transaction: any) => {
      const { data, error } = await supabase
        .from('core_transactions')
        .insert(transaction)
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  },
  
  // AI Schema
  ai: {
    generateSchema: async (request: any) => {
      try {
        const { data, error } = await supabase
          .from('ai_schema_registry')
          .insert({
            ...request,
            schema_name: `Schema_${Date.now()}`,
            ai_interpretation: { status: 'processing' },
            generated_schema: { status: 'generating' },
            implementation_status: 'PROCESSING'
          })
          .select()
          .single()
        
        if (error) throw error
        return data
      } catch (error) {
        console.error('Error generating schema:', error)
        throw error
      }
    },
    
    getSchema: async (id: string) => {
      try {
        const { data, error } = await supabase
          .from('ai_schema_registry')
          .select('*')
          .eq('id', id)
          .single()
        
        if (error) throw error
        return data
      } catch (error) {
        console.error('Error fetching schema:', error)
        throw error
      }
    },
    
    listSchemas: async (organizationId?: string) => {
      try {
        let query = supabase
          .from('ai_schema_registry')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (organizationId) {
          query = query.eq('organization_id', organizationId)
        }
        
        const { data, error } = await query
        
        if (error) throw error
        return data || []
      } catch (error) {
        console.error('Error fetching schemas:', error)
        return []
      }
    }
  },
  
  // Templates
  templates: {
    list: async () => {
      try {
        const { data, error } = await supabase
          .from('industry_template_registry')
          .select('*')
          .order('download_count', { ascending: false })
        
        if (error) throw error
        return data || []
      } catch (error) {
        console.error('Error fetching templates:', error)
        return []
      }
    },
    
    install: async (installation: any) => {
      const { data, error } = await supabase
        .from('template_installations')
        .insert(installation)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    getUserTemplates: async (organizationId: string) => {
      try {
        const { data, error } = await supabase
          .from('template_installations')
          .select(`
            *,
            template:industry_template_registry(*)
          `)
          .eq('organization_id', organizationId)
        
        if (error) throw error
        return data || []
      } catch (error) {
        console.error('Error fetching user templates:', error)
        return []
      }
    }
  },
  
  // Real-time subscriptions
  realtime: {
    subscribeToTransactions: (organizationId: string, callback: (payload: any) => void) => {
      return supabase
        .channel('transactions')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'core_transactions',
          filter: `organization_id=eq.${organizationId}`
        }, callback)
        .subscribe()
    },
    
    subscribeToSchemas: (userId: string, callback: (payload: any) => void) => {
      return supabase
        .channel('ai_schemas')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'ai_schema_registry',
          filter: `created_by=eq.${userId}`
        }, callback)
        .subscribe()
    }
  }
}

// Export types for TypeScript
export type Organization = {
  id: string
  name: string
  type: string
  industry_vertical?: string
  metadata?: any
  created_at: string
  updated_at: string
}

export type User = {
  id: string
  email: string
  profile_data?: any
  created_at: string
  updated_at: string
}

export type Transaction = {
  id: string
  organization_id: string
  transaction_type: string
  transaction_number: string
  amount?: number
  currency?: string
  transaction_data?: any
  status: string
  created_at: string
  created_by: string
}

export type AISchema = {
  id: string
  organization_id: string
  schema_name: string
  user_description: string
  business_domain?: string
  ai_interpretation: any
  generated_schema: any
  implementation_status: string
  created_at: string
  created_by: string
}
