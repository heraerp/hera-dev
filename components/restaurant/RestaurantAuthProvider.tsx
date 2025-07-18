'use client';

import React, { ReactNode } from 'react';
import { AuthContext, useAuthProvider } from '@/hooks/useRestaurantAuth';

interface RestaurantAuthProviderProps {
  children: ReactNode;
}

export const RestaurantAuthProvider: React.FC<RestaurantAuthProviderProps> = ({ children }) => {
  const auth = useAuthProvider();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};