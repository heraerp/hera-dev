'use client'

import { useState, useEffect } from 'react'
import UniversalCrudService from '@/lib/services/universalCrudService'
import { Card } from '@/components/ui/revolutionary-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface TableCheck {
  table: string
  exists: boolean
  error?: string
}

export default function TestDatabasePage() {
  const [checks, setChecks] = useState<TableCheck[]>([])
  const [isChecking, setIsChecking] = useState(false)
  const [supabase] = useState(() => createClient())
  
  const requiredTables = [
    'core_clients',
    'core_organizations', 
    'core_entities',
    'core_dynamic_data',
    'core_users',
    'user_clients',
    'user_organizations'
  ]

  const checkDatabaseStructure = async () => {
    setIsChecking(true)
    const results: TableCheck[] = []
    
    for (const table of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        results.push({
          table,
          exists: !error,
          error: error?.message
        })
      } catch (err) {
        results.push({
          table,
          exists: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        })
      }
    }
    
    setChecks(results)
    setIsChecking(false)
  }

  useEffect(() => {
    checkDatabaseStructure()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card variant="elevated" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Database Structure Test</h1>
              <p className="text-gray-600">Verifying HERA Universal structure in Supabase</p>
            </div>
            <Button onClick={checkDatabaseStructure} disabled={isChecking}>
              {isChecking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isChecking ? 'Checking...' : 'Recheck'}
            </Button>
          </div>
        </Card>

        {/* Results */}
        <div className="grid gap-4">
          {checks.map((check) => (
            <Card key={check.table} variant="glass" className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    check.exists ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {check.exists ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <X className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{check.table}</h3>
                    {check.error && (
                      <p className="text-sm text-red-600">{check.error}</p>
                    )}
                  </div>
                </div>
                <Badge variant={check.exists ? 'default' : 'destructive'}>
                  {check.exists ? 'Available' : 'Missing'}
                </Badge>
              </div>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <Card variant="elevated" className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Database Structure Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {checks.filter(c => c.exists).length}
                </div>
                <div className="text-sm text-gray-600">Tables Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {checks.filter(c => !c.exists).length}
                </div>
                <div className="text-sm text-gray-600">Tables Missing</div>
              </div>
            </div>
            
            {checks.every(c => c.exists) ? (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-800 font-medium">
                  ✅ All required tables are available! The restaurant setup should work properly.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-red-800 font-medium">
                  ❌ Some tables are missing. Please ensure your Supabase database has the HERA Universal structure.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}