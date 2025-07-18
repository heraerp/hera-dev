/**
 * HERA Universal ERP - Supabase Service Role Client
 * For server-side operations that bypass RLS policies
 * Uses singleton pattern to prevent multiple client instances
 */

import { createClient } from '@supabase/supabase-js';

let serviceClientInstance: any = null;

// Service role client for admin operations (singleton)
export function createServiceClient() {
  if (serviceClientInstance) {
    return serviceClientInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }

  if (!serviceRoleKey) {
    console.warn('⚠️ NEXT_PUBLIC_SUPABASE_SERVICE_KEY not found - service operations may be limited');
    return null;
  }

  serviceClientInstance = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return serviceClientInstance;
}

// For use in API routes and server-side operations
export const serviceSupabase = createServiceClient();