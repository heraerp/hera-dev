/**
 * Legacy Data Mapping Page
 * Provides interface for mapping legacy data structures to HERA Universal Architecture
 */

import LegacyDataMappingInterface from '@/components/migration/LegacyDataMappingInterface'

export default function LegacyMappingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <LegacyDataMappingInterface />
    </div>
  )
}

export const metadata = {
  title: 'Legacy Data Mapping - HERA Universal',
  description: 'Map your existing data structures to HERA Universal Architecture with intelligent suggestions and visual mapping tools.',
}