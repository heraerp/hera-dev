/**
 * HERA Universal ERP - Supabase Client Configuration
 * Direct Supabase API client for optimal performance
 * Uses singleton pattern to prevent multiple client instances
 */

import { createBrowserClient } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";

let clientInstance: any = null;

export function createClient() {
  if (clientInstance) {
    return clientInstance;
  }

  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    clientInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  } else {
    // Server-side: use createServerClient with minimal config
    clientInstance = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get() {
            return undefined;
          },
          set() {
            // No-op
          },
          remove() {
            // No-op
          },
        },
      }
    );
  }

  return clientInstance;
}

// Create a singleton client instance
export const supabase = createClient();

// Type definitions for HERA ERP entities
export interface Client {
  id: string
  client_name: string
  client_code: string
  client_type: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Organization {
  id: string
  client_id: string
  name: string
  org_code: string
  industry: string
  country: string
  currency: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateClientData {
  client_name: string
  client_code: string
  client_type?: string
}

export interface CreateOrganizationData {
  name: string
  org_code?: string
  industry?: string
  country?: string
  currency?: string
}

// Export for advanced usage
export type { SupabaseClient } from '@supabase/supabase-js'
export { supabase as default }
