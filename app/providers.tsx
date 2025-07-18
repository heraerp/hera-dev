'use client';

import React from 'react';
import { ABTestProvider } from '@/components/marketing/ab-test-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" enableCircadianRhythm={false}>
      <ABTestProvider>
        {children}
      </ABTestProvider>
    </ThemeProvider>
  );
}