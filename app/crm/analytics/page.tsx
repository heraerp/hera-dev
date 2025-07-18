'use client';

import { useCRM } from '@/hooks/useCRM';
import { CRMAnalytics } from '@/components/crm/CRMAnalytics';

const ORGANIZATION_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

export default function CRMAnalyticsPage() {
  const { analytics, loading, error } = useCRM(ORGANIZATION_ID);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">CRM Analytics</h1>
        <p className="text-muted-foreground">
          Comprehensive analytics and insights for crm operations
        </p>
      </div>

      <CRMAnalytics analytics={analytics} />
    </div>
  );
}