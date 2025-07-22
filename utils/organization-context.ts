/**
 * Organization Context Utility
 * 
 * Provides helper functions to get current organization ID
 * from various sources in the application
 */

// Get organization ID from various sources
export function getCurrentOrganizationId(): string | null {
  // 1. Check URL parameters
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const orgId = urlParams.get('organizationId');
    if (orgId) return orgId;
  }

  // 2. Check localStorage (if stored from previous selection)
  if (typeof window !== 'undefined') {
    const storedOrgId = localStorage.getItem('currentOrganizationId');
    if (storedOrgId) return storedOrgId;
  }

  // 3. Return Mario's restaurant as default for testing
  // In production, this would come from user session
  return '123e4567-e89b-12d3-a456-426614174000';
}

// Store organization ID for future use
export function setCurrentOrganizationId(organizationId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('currentOrganizationId', organizationId);
  }
}

// Get organization details from session/auth
export async function getOrganizationFromSession(): Promise<{
  id: string;
  name: string;
} | null> {
  // In production, this would fetch from your auth provider
  // For now, return Mario's restaurant
  return {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: "Mario's Italian Restaurant"
  };
}

// Hook for React components
export function useOrganization() {
  if (typeof window === 'undefined') {
    return {
      organizationId: null,
      organizationName: null,
      loading: false
    };
  }

  const organizationId = getCurrentOrganizationId();
  
  return {
    organizationId,
    organizationName: "Mario's Italian Restaurant", // Would fetch from DB
    loading: false
  };
}