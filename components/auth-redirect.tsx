"use client";

import { useEffect } from 'react';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

export function AuthRedirect() {
  const { isLoading, user, hasOrganizations, redirectToAppropriateRoute } = useAuthRedirect();

  useEffect(() => {
    if (!isLoading && user) {
      redirectToAppropriateRoute();
    }
  }, [isLoading, user, redirectToAppropriateRoute]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no user, let the page handle the login flow
  if (!user) {
    return null;
  }

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">
          {hasOrganizations ? 'Redirecting to your dashboard...' : 'Setting up your account...'}
        </p>
      </div>
    </div>
  );
}

export default AuthRedirect;