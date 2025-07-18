import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function generateDigitalAccountantDemoData(
  organizationId: string,
  userId: string
) {
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

  console.log('🚀 Generating Digital Accountant demo data...')

  try {
    // Define transaction types and subtypes
    const transactionTypes = [
      { type: 'SALES_ORDER', subtypes: ['POS_SALE', 'ONLINE_ORDER', 'CATERING'] },
      { type: 'VENDOR_INVOICE', subtypes: ['SUPPLIER_INVOICE', 'UTILITY_BILL', 'SERVICE_INVOICE'] },
      { type: 'PAYMENT', subtypes: ['CUSTOMER_PAYMENT', 'VENDOR_PAYMENT', 'REFUND'] },
      { type: 'JOURNAL_ENTRY', subtypes: ['ACCRUAL', 'ADJUSTMENT', 'CORRECTION'] },
      { type: 'EXPENSE_REPORT', subtypes: ['EMPLOYEE_EXPENSE', 'TRAVEL_EXPENSE', 'OFFICE_EXPENSE'] }
    ]

    // Define confidence ranges for different scenarios
    const confidenceRanges = [
      { min: 0.95, max: 0.99, percentage: 0.65 }, // 65% high confidence
      { min: 0.80, max: 0.94, percentage: 0.28 }, // 28% medium confidence
      { min: 0.60, max: 0.79, percentage: 0.07 }  // 7% low confidence
    ]

    // Generate transactions for the last 30 days
    const now = new Date()
    const transactions = []
    const aiIntelligence = []

    for (let days = 0; days < 30; days++) {
      const date = new Date(now)
      date.setDate(date.getDate() - days)
      
      // Generate 20-50 transactions per day
      const transactionsPerDay = Math.floor(Math.random() * 30) + 20
      
      for (let i = 0; i < transactionsPerDay; i++) {
        const transactionId = crypto.randomUUID()
        const typeInfo = transactionTypes[Math.floor(Math.random() * transactionTypes.length)]
        const subtype = typeInfo.subtypes[Math.floor(Math.random() * typeInfo.subtypes.length)]
        
        // Determine confidence level
        const rand = Math.random()
        let confidenceScore = 0
        let confidenceRange = confidenceRanges[0]
        
        if (rand < confidenceRanges[0].percentage) {
          confidenceRange = confidenceRanges[0]
        } else if (rand < confidenceRanges[0].percentage + confidenceRanges[1].percentage) {
          confidenceRange = confidenceRanges[1]
        } else {
          confidenceRange = confidenceRanges[2]
        }
        
        confidenceScore = confidenceRange.min + Math.random() * (confidenceRange.max - confidenceRange.min)
        
        // Determine amount based on transaction type
        let amount = 0
        switch (typeInfo.type) {
          case 'SALES_ORDER':
            amount = Math.random() * 500 + 50 // $50-$550
            break
          case 'VENDOR_INVOICE':
            amount = Math.random() * 50000 + 1000 // $1,000-$51,000
            break
          case 'PAYMENT':
            amount = Math.random() * 10000 + 100 // $100-$10,100
            break
          case 'JOURNAL_ENTRY':
            amount = Math.random() * 20000 + 500 // $500-$20,500
            break
          case 'EXPENSE_REPORT':
            amount = Math.random() * 5000 + 50 // $50-$5,050
            break
        }
        
        amount = Math.round(amount * 100) / 100 // Round to 2 decimals
        
        // Determine posting status based on confidence and amount
        let postingStatus = 'draft'
        let releasedToAccounting = false
        let releasedAt = null
        let releasedBy = null
        
        if (confidenceScore >= 0.95 && amount <= 10000) {
          // High confidence + low amount = auto-release
          postingStatus = 'posted_and_released'
          releasedToAccounting = true
          releasedAt = new Date(date.getTime() + Math.random() * 3600000) // Within 1 hour
          releasedBy = userId
        } else if (confidenceScore >= 0.80) {
          // Medium/high confidence = post but hold
          postingStatus = 'posted_pending_release'
          
          // 70% of pending transactions should be released manually
          if (Math.random() < 0.7 && days > 0) {
            releasedToAccounting = true
            releasedAt = new Date(date.getTime() + Math.random() * 86400000) // Within 24 hours
            releasedBy = userId
            postingStatus = 'posted_and_released'
          }
        }
        
        // Create transaction number
        const dateStr = date.toISOString().split('T')[0].replace(/-/g, '')
        const sequenceNum = String(i + 1).padStart(4, '0')
        const transactionNumber = `TXN-${dateStr}-${sequenceNum}`
        
        // Create mapped accounts (simulated)
        const mappedAccounts = {
          debit: [
            { account: '1100000', description: 'Cash and Bank', amount: amount }
          ],
          credit: [
            { account: '4100000', description: 'Revenue', amount: amount }
          ]
        }
        
        const transaction = {
          id: transactionId,
          organization_id: organizationId,
          transaction_type: typeInfo.type,
          transaction_subtype: subtype,
          transaction_number: transactionNumber,
          transaction_date: date.toISOString().split('T')[0],
          total_amount: amount,
          currency: 'USD',
          is_financial: true,
          posting_status: postingStatus,
          posted_at: postingStatus !== 'draft' ? date.toISOString() : null,
          released_to_accounting: releasedToAccounting,
          released_at: releasedAt?.toISOString() || null,
          released_by: releasedBy,
          posting_period: date.toISOString().slice(0, 7), // YYYY-MM
          mapped_accounts: mappedAccounts,
          transaction_data: {
            source: 'demo_generator',
            demo: true,
            confidence_score: confidenceScore
          },
          created_by: userId,
          created_at: date.toISOString(),
          updated_at: date.toISOString()
        }
        
        transactions.push(transaction)
        
        // Create AI intelligence record
        const ai = {
          id: crypto.randomUUID(),
          organization_id: organizationId,
          transaction_id: transactionId,
          confidence_score: confidenceScore,
          classification_data: {
            primary_classification: typeInfo.type,
            sub_classification: subtype,
            confidence_factors: {
              pattern_match: Math.random() * 0.3 + 0.7,
              historical_similarity: Math.random() * 0.3 + 0.7,
              rule_compliance: Math.random() * 0.3 + 0.7,
              data_completeness: Math.random() * 0.3 + 0.7
            },
            suggested_accounts: mappedAccounts
          },
          created_at: date.toISOString(),
          updated_at: date.toISOString()
        }
        
        aiIntelligence.push(ai)
      }
    }
    
    console.log(`✅ Generated ${transactions.length} transactions`)
    console.log(`✅ Generated ${aiIntelligence.length} AI intelligence records`)
    
    // Insert transactions in batches
    const batchSize = 100
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize)
      const { error } = await supabaseAdmin
        .from('universal_transactions')
        .insert(batch)
      
      if (error) {
        console.error(`❌ Error inserting transactions batch ${i / batchSize + 1}:`, error)
        throw error
      }
      console.log(`✅ Inserted transactions batch ${i / batchSize + 1}/${Math.ceil(transactions.length / batchSize)}`)
    }
    
    // Insert AI intelligence records in batches
    for (let i = 0; i < aiIntelligence.length; i += batchSize) {
      const batch = aiIntelligence.slice(i, i + batchSize)
      const { error } = await supabaseAdmin
        .from('ai_intelligence')
        .insert(batch)
      
      if (error) {
        console.error(`❌ Error inserting AI intelligence batch ${i / batchSize + 1}:`, error)
        throw error
      }
      console.log(`✅ Inserted AI intelligence batch ${i / batchSize + 1}/${Math.ceil(aiIntelligence.length / batchSize)}`)
    }
    
    // Create some journal entries for posted transactions
    const postedTransactions = transactions.filter(t => t.posting_status !== 'draft')
    const journalEntries = []
    
    for (const transaction of postedTransactions) {
      const journalEntryId = crypto.randomUUID()
      const journalEntry = {
        id: journalEntryId,
        organization_id: organizationId,
        entity_type: 'journal_entry',
        entity_name: `Journal Entry for ${transaction.transaction_number}`,
        entity_code: `JE-${transaction.transaction_date.replace(/-/g, '')}-${transaction.id.slice(0, 6)}`,
        is_active: true,
        created_at: transaction.posted_at,
        updated_at: transaction.posted_at
      }
      
      journalEntries.push(journalEntry)
      
      // Update transaction with journal entry reference
      await supabaseAdmin
        .from('universal_transactions')
        .update({ journal_entry_id: journalEntryId })
        .eq('id', transaction.id)
    }
    
    // Insert journal entries in batches
    for (let i = 0; i < journalEntries.length; i += batchSize) {
      const batch = journalEntries.slice(i, i + batchSize)
      const { error } = await supabaseAdmin
        .from('core_entities')
        .insert(batch)
      
      if (error) {
        console.error(`❌ Error inserting journal entries batch ${i / batchSize + 1}:`, error)
        throw error
      }
    }
    
    console.log(`✅ Created ${journalEntries.length} journal entries`)
    
    // Generate summary statistics
    const stats = {
      totalTransactions: transactions.length,
      financialTransactions: transactions.filter(t => t.is_financial).length,
      postedTransactions: transactions.filter(t => t.posting_status !== 'draft').length,
      releasedTransactions: transactions.filter(t => t.released_to_accounting).length,
      pendingRelease: transactions.filter(t => t.posting_status === 'posted_pending_release').length,
      autoReleasedToday: transactions.filter(t => {
        const today = new Date().toISOString().split('T')[0]
        return t.posting_status === 'posted_and_released' && 
               t.transaction_date === today &&
               t.confidence_score >= 0.95
      }).length,
      averageConfidence: aiIntelligence.reduce((sum, ai) => sum + ai.confidence_score, 0) / aiIntelligence.length,
      highConfidencePercentage: (aiIntelligence.filter(ai => ai.confidence_score >= 0.95).length / aiIntelligence.length) * 100,
      mediumConfidencePercentage: (aiIntelligence.filter(ai => ai.confidence_score >= 0.80 && ai.confidence_score < 0.95).length / aiIntelligence.length) * 100,
      lowConfidencePercentage: (aiIntelligence.filter(ai => ai.confidence_score < 0.80).length / aiIntelligence.length) * 100
    }
    
    console.log('\n📊 Demo Data Statistics:')
    console.log(`Total Transactions: ${stats.totalTransactions}`)
    console.log(`Financial Transactions: ${stats.financialTransactions}`)
    console.log(`Posted Transactions: ${stats.postedTransactions}`)
    console.log(`Released Transactions: ${stats.releasedTransactions}`)
    console.log(`Pending Release: ${stats.pendingRelease}`)
    console.log(`Auto-Released Today: ${stats.autoReleasedToday}`)
    console.log(`Average AI Confidence: ${(stats.averageConfidence * 100).toFixed(1)}%`)
    console.log(`High Confidence: ${stats.highConfidencePercentage.toFixed(1)}%`)
    console.log(`Medium Confidence: ${stats.mediumConfidencePercentage.toFixed(1)}%`)
    console.log(`Low Confidence: ${stats.lowConfidencePercentage.toFixed(1)}%`)
    
    return {
      success: true,
      stats,
      message: `Successfully generated ${transactions.length} demo transactions with AI intelligence data`
    }
    
  } catch (error) {
    console.error('❌ Error generating demo data:', error)
    return {
      success: false,
      error: error.message,
      message: 'Failed to generate demo data'
    }
  }
}

// Helper function to clear existing demo data
export async function clearDigitalAccountantDemoData(organizationId: string) {
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

  console.log('🗑️ Clearing existing demo data...')

  try {
    // Delete AI intelligence records
    const { error: aiError } = await supabaseAdmin
      .from('ai_intelligence')
      .delete()
      .eq('organization_id', organizationId)
    
    if (aiError) throw aiError
    
    // Delete transactions
    const { error: txnError } = await supabaseAdmin
      .from('universal_transactions')
      .delete()
      .eq('organization_id', organizationId)
      .eq('transaction_data->demo', true)
    
    if (txnError) throw txnError
    
    // Delete journal entries
    const { error: jeError } = await supabaseAdmin
      .from('core_entities')
      .delete()
      .eq('organization_id', organizationId)
      .eq('entity_type', 'journal_entry')
    
    if (jeError) throw jeError
    
    console.log('✅ Demo data cleared successfully')
    return { success: true }
    
  } catch (error) {
    console.error('❌ Error clearing demo data:', error)
    return { success: false, error: error.message }
  }
}