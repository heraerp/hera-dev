"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UniversalCrudService from '@/lib/services/universalCrudService';
import { AuthUtils } from '@/lib/auth/auth-utils';

export function useAuthRedirect() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [hasOrganizations, setHasOrganizations] = useState(false);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const supabase = createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
          console.warn('Auth check error:', error.message);
          return;
        }

        setUser(user);

        if (user) {
          // Check if user has organizations
          const hasOrgs = await AuthUtils.hasExistingOrganizations(user.id);
          setHasOrganizations(hasOrgs);
        }
      } catch (error) {
        console.warn('Auth redirect check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndRedirect();
  }, []);

  const redirectToAppropriateRoute = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const redirectPath = await AuthUtils.getPostAuthRedirectPath(user.id);
    router.push(redirectPath);
  };

  const redirectToSetup = () => {
    router.push('/setup');
  };

  const redirectToRestaurant = () => {
    router.push('/restaurant');
  };

  return {
    isLoading,
    user,
    hasOrganizations,
    redirectToAppropriateRoute,
    redirectToSetup,
    redirectToRestaurant
  };
}

export default useAuthRedirect;