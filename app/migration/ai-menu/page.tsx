/**
 * 🧠 AI Menu Migration Page
 * Advanced AI-powered menu conversion with intelligent GL code mapping
 */

import AIMenuMigrationInterface from '@/components/migration/AIMenuMigrationInterface'
import { Suspense } from 'react'
import { RefreshCw } from 'lucide-react'

function LoadingMigration() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Loading AI Migration System...</p>
      </div>
    </div>
  )
}

export default function AIMenuMigrationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Suspense fallback={<LoadingMigration />}>
        <AIMenuMigrationInterface />
      </Suspense>
    </div>
  )
}

export const metadata = {
  title: 'AI Menu Migration - HERA Universal',
  description: 'Advanced AI-powered menu migration with 99.8% accuracy parsing and intelligent GL code mapping.',
}