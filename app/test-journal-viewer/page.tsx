'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement'
import { createClient } from '@/lib/supabase/client'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { RefreshCw, FileText, DollarSign } from 'lucide-react'

interface JournalEntryView {
  id: string
  journal_number: string
  description: string
  date: string
  total_debit: number
  total_credit: number
  status: string
  accounts: any[]
  created_at: string
  type: 'journal_entry' | 'universal_transaction'
}

export default function TestJournalViewer() {
  const { restaurantData } = useRestaurantManagement()
  const [journalEntries, setJournalEntries] = useState<JournalEntryView[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create service role client
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!}`
        }
      }
    }
  )

  const loadJournalEntries = async () => {
    if (!restaurantData?.organizationId) return

    setLoading(true)
    setError(null)

    try {
      console.log('🔍 Loading journal entries for organization:', restaurantData.organizationId)

      // Get journal entities and universal transactions
      const { data: entities, error: entitiesError } = await supabaseAdmin
        .from('core_entities')
        .select('*')
        .eq('organization_id', restaurantData.organizationId)
        .in('entity_type', ['journal_entry', 'universal_transaction'])
        .order('created_at', { ascending: false })

      if (entitiesError) throw entitiesError

      console.log('📊 Found', entities?.length || 0, 'journal entries')

      if (!entities || entities.length === 0) {
        setJournalEntries([])
        return
      }

      // Get journal data for each entry
      const journalPromises = entities.map(async (entity) => {
        if (entity.entity_type === 'journal_entry') {
          // Handle journal entries
          const { data: dynamicData, error: dataError } = await supabaseAdmin
            .from('core_dynamic_data')
            .select('field_value')
            .eq('entity_id', entity.id)
            .eq('field_name', 'journal_entry_data')
            .single()

          if (dataError) {
            console.warn('⚠️ Failed to load data for journal entry:', entity.id, dataError)
            return null
          }

          const journalData = JSON.parse(dynamicData.field_value)
          
          return {
            id: entity.id,
            journal_number: entity.entity_code,
            description: entity.entity_name,
            date: journalData.date,
            total_debit: journalData.total_debit,
            total_credit: journalData.total_credit,
            status: journalData.status,
            accounts: journalData.accounts || [],
            created_at: entity.created_at,
            type: 'journal_entry'
          }
        } else if (entity.entity_type === 'universal_transaction') {
          // Handle universal transactions
          const { data: transactionData, error: dataError } = await supabaseAdmin
            .from('core_metadata')
            .select('metadata_value')
            .eq('entity_id', entity.id)
            .eq('metadata_key', 'transaction_details')
            .single()

          if (dataError) {
            console.warn('⚠️ Failed to load data for transaction:', entity.id, dataError)
            return null
          }

          const txData = transactionData.metadata_value
          
          return {
            id: entity.id,
            journal_number: entity.entity_code,
            description: entity.entity_name,
            date: txData.transaction_date,
            total_debit: txData.total_amount,
            total_credit: txData.total_amount,
            status: txData.posting_status || 'draft',
            accounts: txData.mapped_accounts || [],
            created_at: entity.created_at,
            type: 'universal_transaction'
          }
        }
        
        return null
      })

      const journalEntries = (await Promise.all(journalPromises)).filter(Boolean) as JournalEntryView[]
      
      console.log('✅ Loaded', journalEntries.length, 'journal entries successfully')
      setJournalEntries(journalEntries)

    } catch (error) {
      console.error('❌ Error loading journal entries:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (restaurantData?.organizationId) {
      loadJournalEntries()
    }
  }, [restaurantData?.organizationId])

  if (!restaurantData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-6 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Loading Restaurant Data
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg">
                <FileText className="h-8 w-8 text-white" />
              </div>
              Journal Entry Viewer
            </h1>
            <p className="text-gray-600">
              View journal entries created from POS transactions for {restaurantData.restaurantName}
            </p>
          </div>
          <Button onClick={loadJournalEntries} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-red-800">
                <strong>Error:</strong> {error}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Journal Entries */}
        <div className="grid grid-cols-1 gap-4">
          {journalEntries.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-gray-600">
                  {loading ? 'Loading journal entries...' : 'No journal entries found. Process a POS order to create entries.'}
                </div>
              </CardContent>
            </Card>
          ) : (
            journalEntries.map((entry) => (
              <Card key={entry.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      {entry.journal_number}
                      {entry.type === 'universal_transaction' && (
                        <Badge variant="outline" className="text-xs">
                          Universal Tx
                        </Badge>
                      )}
                    </CardTitle>
                    <Badge variant={entry.status === 'posted' ? 'default' : 'secondary'}>
                      {entry.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {entry.description} • {new Date(entry.date).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Total Debits:</strong> ₹{entry.total_debit.toFixed(2)}
                      </div>
                      <div>
                        <strong>Total Credits:</strong> ₹{entry.total_credit.toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <strong className="text-sm">Account Entries:</strong>
                      <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                        {entry.accounts.map((account, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <div>
                              <div className="font-medium">{account.account_code} - {account.account_name}</div>
                              <div className="text-gray-600 text-xs">{account.description}</div>
                            </div>
                            <div className="text-right">
                              {account.debit > 0 && <div className="text-red-600">Dr: ₹{account.debit.toFixed(2)}</div>}
                              {account.credit > 0 && <div className="text-green-600">Cr: ₹{account.credit.toFixed(2)}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Created: {new Date(entry.created_at).toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}