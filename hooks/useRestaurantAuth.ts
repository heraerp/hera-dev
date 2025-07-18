'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import UniversalCrudService from '@/lib/services/universalCrudService';
import { createClient } from '@/lib/supabase/client';
import { 
  RestaurantStaff, 
  RestaurantSession, 
  LoginCredentials, 
  AuthError,
  ROLE_PERMISSIONS,
  RestaurantRole
} from '@/types/restaurant-auth';

interface AuthContextType {
  session: RestaurantSession | null;
  staff: RestaurantStaff | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: AuthError }>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: RestaurantRole) => boolean;
  refreshSession: () => Promise<void>;
  updateProfile: (updates: Partial<RestaurantStaff>) => Promise<{ success: boolean; error?: AuthError }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useRestaurantAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useRestaurantAuth must be used within a RestaurantAuthProvider');
  }
  return context;
};

// Helper function to get department from role
const getDepartmentFromRole = (role: RestaurantRole): string => {
  switch (role) {
    case 'admin': return 'Administration';
    case 'manager': return 'Management';
    case 'waiter': return 'Service';
    case 'chef': return 'ChefHat';
    case 'cashier': return 'Finance';
    case 'host': return 'Front of House';
    default: return 'General';
  }
};

export const useAuthProvider = () => {
  const [session, setSession] = useState<RestaurantSession | null>(null);
  const [staff, setStaff] = useState<RestaurantStaff | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Load session from localStorage on mount
  useEffect(() => {
    const loadStoredSession = () => {
      try {
        const storedSession = localStorage.getItem('restaurant_session');
        if (storedSession) {
          const parsedSession: RestaurantSession = JSON.parse(storedSession);
          
          // Check if session is still valid
          if (parsedSession.expiresAt > Date.now()) {
            setSession(parsedSession);
            setStaff(parsedSession.user);
          } else {
            // Session expired, clear it
            localStorage.removeItem('restaurant_session');
          }
        }
      } catch (error) {
        console.error('Error loading stored session:', error);
        localStorage.removeItem('restaurant_session');
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredSession();
  }, []);

  // Login function - Mock authentication for demo
  const login = useCallback(async (credentials: LoginCredentials): Promise<{ success: boolean; error?: AuthError }> => {
    setIsLoading(true);
    
    try {
      // Mock authentication - bypass Supabase for demo
      const demoCredentials = {
        'admin@restaurant.demo': { role: 'admin' as RestaurantRole, name: 'Admin User' },
        'manager@restaurant.demo': { role: 'manager' as RestaurantRole, name: 'Manager User' },
        'waiter@restaurant.demo': { role: 'waiter' as RestaurantRole, name: 'Waiter User' },
        'chef@restaurant.demo': { role: 'chef' as RestaurantRole, name: 'Chef User' },
        'cashier@restaurant.demo': { role: 'cashier' as RestaurantRole, name: 'Cashier User' },
        'host@restaurant.demo': { role: 'host' as RestaurantRole, name: 'Host User' }
      };

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const demo = demoCredentials[credentials.email as keyof typeof demoCredentials];
      
      if (!demo || credentials.password !== 'demo123') {
        return {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password'
          }
        };
      }

      // Create mock staff profile
      const mockStaff: RestaurantStaff = {
        id: `demo-${demo.role}-${Date.now()}`,
        email: credentials.email,
        name: demo.name,
        role: demo.role,
        permissions: ROLE_PERMISSIONS[demo.role],
        restaurant_id: 'demo-restaurant-123',
        is_active: true,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        profile: {
          phone: '+1-555-0123',
          emergency_contact: '+1-555-0456',
          hire_date: '2024-01-01',
          department: getDepartmentFromRole(demo.role)
        }
      };

      const newSession: RestaurantSession = {
        access_token: `mock-token-${Date.now()}`,
        refresh_token: `mock-refresh-${Date.now()}`,
        expires_at: Date.now() / 1000 + 3600,
        staff: mockStaff
      };

      setSession(newSession);
      setStaff(mockStaff);
      
      // Store in localStorage
      localStorage.setItem('restaurant_session', JSON.stringify(newSession));
      localStorage.setItem('restaurant_staff', JSON.stringify(mockStaff));

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network error occurred'
        }
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      localStorage.removeItem('restaurant_session');
      setSession(null);
      setStaff(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [supabase]);

  // Check if user has specific permission
  const hasPermission = useCallback((permission: string): boolean => {
    if (!session || !session.permissions) return false;
    return session.permissions.includes(permission);
  }, [session]);

  // Check if user has specific role
  const hasRole = useCallback((role: RestaurantRole): boolean => {
    if (!staff) return false;
    return staff.role === role;
  }, [staff]);

  // Refresh session
  const refreshSession = useCallback(async () => {
    if (!session) return;

    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: session.refreshToken
      });

      if (error || !data.session) {
        await logout();
        return;
      }

      // Update session with new tokens
      const updatedSession: RestaurantSession = {
        ...session,
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token || session.refreshToken,
        expiresAt: Date.now() + (8 * 60 * 60 * 1000) // 8 hours
      };

      localStorage.setItem('restaurant_session', JSON.stringify(updatedSession));
      setSession(updatedSession);
    } catch (error) {
      console.error('Session refresh error:', error);
      await logout();
    }
  }, [session, supabase, logout]);

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<RestaurantStaff>): Promise<{ success: boolean; error?: AuthError }> => {
    if (!staff || !session) {
      return {
        success: false,
        error: {
          code: 'NOT_AUTHENTICATED',
          message: 'User not authenticated'
        }
      };
    }

    try {
      // Update dynamic data fields
      const updatePromises = Object.entries(updates).map(([key, value]) => {
        if (key === 'id' || key === 'restaurantId') return Promise.resolve();
        
        const fieldType = typeof value === 'number' ? 'number' : 
                         typeof value === 'boolean' ? 'boolean' :
                         typeof value === 'object' ? 'json' : 'text';

        return supabase
          .from('core_dynamic_data')
          .upsert({
            entity_id: staff.id,
            field_name: key,
            field_value: typeof value === 'object' ? JSON.stringify(value) : String(value),
            field_type: fieldType
          });
      });

      await Promise.all(updatePromises);

      // Update local state
      const updatedStaff = { ...staff, ...updates };
      const updatedSession = { ...session, user: updatedStaff };
      
      setStaff(updatedStaff);
      setSession(updatedSession);
      localStorage.setItem('restaurant_session', JSON.stringify(updatedSession));

      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update profile'
        }
      };
    }
  }, [staff, session, supabase]);

  // Auto-refresh session before expiry
  useEffect(() => {
    if (!session) return;

    const timeUntilExpiry = session.expiresAt - Date.now();
    const refreshTime = Math.max(timeUntilExpiry - (30 * 60 * 1000), 60000); // Refresh 30 minutes before expiry

    const refreshTimeout = setTimeout(() => {
      refreshSession();
    }, refreshTime);

    return () => clearTimeout(refreshTimeout);
  }, [session, refreshSession]);

  return {
    session,
    staff,
    isAuthenticated: !!session && !!staff,
    isLoading,
    login,
    logout,
    hasPermission,
    hasRole,
    refreshSession,
    updateProfile
  };
};

export { AuthContext };