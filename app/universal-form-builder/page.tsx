/**
 * HERA Universal Form Builder - Main Page
 * Optimized with lazy loading for better bundle size
 */

"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load the complete form builder
const UniversalFormBuilderLazy = dynamic(
  () => import('@/components/universal-form-builder/UniversalFormBuilderLazy'),
  {
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <Skeleton className="h-16 w-96 mx-auto" />
            <Skeleton className="h-6 w-[600px] mx-auto" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      </div>
    ),
    ssr: false
  }
);

export default function UniversalFormBuilderPage() {
  return <UniversalFormBuilderLazy />;
}