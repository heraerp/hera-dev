import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const organizationId = searchParams.get('organizationId')

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'dashboard-metrics':
        const { data: metrics, error: metricsError } = await supabase
          .rpc('get_ai_coa_dashboard_metrics', {
            p_organization_id: organizationId
          })

        if (metricsError) {
          console.error('Error fetching dashboard metrics:', metricsError)
          return NextResponse.json(
            { error: 'Failed to fetch dashboard metrics' },
            { status: 500 }
          )
        }

        return NextResponse.json(metrics)

      case 'suggestions':
        const { data: suggestions, error: suggestionsError } = await supabase
          .from('ai_account_suggestions')
          .select('*')
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: false })
          .limit(20)

        if (suggestionsError) {
          console.error('Error fetching suggestions:', suggestionsError)
          return NextResponse.json(
            { error: 'Failed to fetch AI suggestions' },
            { status: 500 }
          )
        }

        return NextResponse.json({ suggestions })

      case 'performance':
        const { data: performance, error: performanceError } = await supabase
          .from('ai_performance_metrics')
          .select('*')
          .eq('organization_id', organizationId)
          .order('date', { ascending: false })
          .limit(30)

        if (performanceError) {
          console.error('Error fetching performance metrics:', performanceError)
          return NextResponse.json(
            { error: 'Failed to fetch performance metrics' },
            { status: 500 }
          )
        }

        return NextResponse.json({ performance })

      case 'compliance':
        const { data: compliance, error: complianceError } = await supabase
          .from('compliance_monitoring')
          .select('*')
          .eq('organization_id', organizationId)
          .single()

        if (complianceError) {
          console.error('Error fetching compliance data:', complianceError)
          return NextResponse.json(
            { error: 'Failed to fetch compliance data' },
            { status: 500 }
          )
        }

        return NextResponse.json(compliance)

      case 'accounts':
        const { data: accounts, error: accountsError } = await supabase
          .from('chart_of_accounts')
          .select('*')
          .eq('organization_id', organizationId)
          .eq('is_active', true)
          .order('account_code')

        if (accountsError) {
          console.error('Error fetching accounts:', accountsError)
          return NextResponse.json(
            { error: 'Failed to fetch chart of accounts' },
            { status: 500 }
          )
        }

        return NextResponse.json({ accounts })

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('AI COA API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { action, organizationId } = body

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'generate-suggestions':
        const { daysBack = 30 } = body
        
        const { data: suggestions, error: suggestionsError } = await supabase
          .rpc('ai_analyze_transaction_patterns', {
            p_organization_id: organizationId,
            p_days_back: daysBack
          })

        if (suggestionsError) {
          console.error('Error generating suggestions:', suggestionsError)
          return NextResponse.json(
            { error: 'Failed to generate AI suggestions' },
            { status: 500 }
          )
        }

        // Insert new suggestions if any were generated
        if (suggestions && suggestions.length > 0) {
          const newSuggestions = suggestions.map((suggestion: any) => ({
            organization_id: organizationId,
            suggestion_type: 'NEW_ACCOUNT',
            suggested_account_name: suggestion.suggested_account_name,
            suggested_account_type: suggestion.suggested_account_type,
            confidence_score: suggestion.confidence_score,
            reasoning: suggestion.reasoning,
            auto_approve: suggestion.auto_approve,
            evidence: suggestion.supporting_evidence
          }))

          const { error: insertError } = await supabase
            .from('ai_account_suggestions')
            .insert(newSuggestions)

          if (insertError) {
            console.error('Error inserting suggestions:', insertError)
            return NextResponse.json(
              { error: 'Failed to save AI suggestions' },
              { status: 500 }
            )
          }
        }

        return NextResponse.json({ 
          success: true, 
          suggestions_generated: suggestions?.length || 0,
          suggestions: suggestions 
        })

      case 'process-suggestion':
        const { suggestionId, actionType } = body
        
        const { data: result, error: processError } = await supabase
          .rpc('process_ai_suggestion', {
            p_suggestion_id: suggestionId,
            p_action: actionType
          })

        if (processError) {
          console.error('Error processing suggestion:', processError)
          return NextResponse.json(
            { error: 'Failed to process suggestion' },
            { status: 500 }
          )
        }

        return NextResponse.json(result)

      case 'detect-merges':
        const { data: mergeOpportunities, error: mergeError } = await supabase
          .rpc('ai_detect_merge_opportunities', {
            p_organization_id: organizationId
          })

        if (mergeError) {
          console.error('Error detecting merge opportunities:', mergeError)
          return NextResponse.json(
            { error: 'Failed to detect merge opportunities' },
            { status: 500 }
          )
        }

        return NextResponse.json({ mergeOpportunities })

      case 'validate-compliance':
        const { accountId = null } = body
        
        const { data: validation, error: validationError } = await supabase
          .rpc('ai_validate_account_compliance', {
            p_organization_id: organizationId,
            p_account_id: accountId
          })

        if (validationError) {
          console.error('Error validating compliance:', validationError)
          return NextResponse.json(
            { error: 'Failed to validate compliance' },
            { status: 500 }
          )
        }

        return NextResponse.json({ validation })

      case 'create-account':
        const { 
          accountName, 
          accountType, 
          parentAccountId = null 
        } = body

        // Generate intelligent account code
        const { data: accountCode, error: codeError } = await supabase
          .rpc('generate_intelligent_account_code', {
            p_organization_id: organizationId,
            p_account_type: accountType,
            p_account_name: accountName,
            p_parent_account_id: parentAccountId
          })

        if (codeError) {
          console.error('Error generating account code:', codeError)
          return NextResponse.json(
            { error: 'Failed to generate account code' },
            { status: 500 }
          )
        }

        // Create the account
        const { data: newAccount, error: createError } = await supabase
          .from('chart_of_accounts')
          .insert({
            organization_id: organizationId,
            account_code: accountCode,
            account_name: accountName,
            account_type: accountType,
            parent_account_id: parentAccountId,
            account_level: parentAccountId ? 2 : 1, // Simplified level calculation
            is_active: true,
            allow_posting: true,
            ai_generated: false,
            ai_confidence: 0.0,
            gaap_compliant: true,
            ifrs_compliant: true
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating account:', createError)
          return NextResponse.json(
            { error: 'Failed to create account' },
            { status: 500 }
          )
        }

        return NextResponse.json({ 
          success: true, 
          account: newAccount 
        })

      case 'initialize-config':
        const { 
          enableAutoSuggestions = true,
          autoApproveThreshold = 0.85 
        } = body

        const { data: config, error: configError } = await supabase
          .rpc('initialize_ai_coa_configuration', {
            p_organization_id: organizationId,
            p_enable_auto_suggestions: enableAutoSuggestions,
            p_auto_approve_threshold: autoApproveThreshold
          })

        if (configError) {
          console.error('Error initializing AI config:', configError)
          return NextResponse.json(
            { error: 'Failed to initialize AI configuration' },
            { status: 500 }
          )
        }

        return NextResponse.json(config)

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('AI COA API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { action, organizationId } = body

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'update-config':
        const { 
          newAccountThreshold,
          mergeThreshold,
          reclassifyThreshold,
          enableAutoSuggestions,
          enablePatternAnalysis,
          enableComplianceMonitoring 
        } = body

        const { data: updatedConfig, error: updateError } = await supabase
          .from('coa_ai_configuration')
          .update({
            new_account_auto_approve_threshold: newAccountThreshold,
            merge_auto_approve_threshold: mergeThreshold,
            reclassify_auto_approve_threshold: reclassifyThreshold,
            enable_auto_suggestions: enableAutoSuggestions,
            enable_pattern_analysis: enablePatternAnalysis,
            enable_compliance_monitoring: enableComplianceMonitoring,
            updated_at: new Date().toISOString()
          })
          .eq('organization_id', organizationId)
          .select()
          .single()

        if (updateError) {
          console.error('Error updating configuration:', updateError)
          return NextResponse.json(
            { error: 'Failed to update configuration' },
            { status: 500 }
          )
        }

        return NextResponse.json({ 
          success: true, 
          config: updatedConfig 
        })

      case 'update-account':
        const { 
          accountId,
          accountName,
          isActive,
          allowPosting,
          gaapCompliant,
          ifrsCompliant,
          soxControlled 
        } = body

        const { data: updatedAccount, error: accountError } = await supabase
          .from('chart_of_accounts')
          .update({
            account_name: accountName,
            is_active: isActive,
            allow_posting: allowPosting,
            gaap_compliant: gaapCompliant,
            ifrs_compliant: ifrsCompliant,
            sox_controlled: soxControlled,
            updated_at: new Date().toISOString()
          })
          .eq('id', accountId)
          .eq('organization_id', organizationId)
          .select()
          .single()

        if (accountError) {
          console.error('Error updating account:', accountError)
          return NextResponse.json(
            { error: 'Failed to update account' },
            { status: 500 }
          )
        }

        return NextResponse.json({ 
          success: true, 
          account: updatedAccount 
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('AI COA API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const organizationId = searchParams.get('organizationId')
    const targetId = searchParams.get('targetId')

    if (!organizationId || !targetId) {
      return NextResponse.json(
        { error: 'Organization ID and target ID are required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'delete-account':
        const { error: deleteError } = await supabase
          .from('chart_of_accounts')
          .update({ is_active: false })
          .eq('id', targetId)
          .eq('organization_id', organizationId)

        if (deleteError) {
          console.error('Error deleting account:', deleteError)
          return NextResponse.json(
            { error: 'Failed to delete account' },
            { status: 500 }
          )
        }

        return NextResponse.json({ success: true })

      case 'delete-suggestion':
        const { error: suggestionError } = await supabase
          .from('ai_account_suggestions')
          .delete()
          .eq('id', targetId)
          .eq('organization_id', organizationId)

        if (suggestionError) {
          console.error('Error deleting suggestion:', suggestionError)
          return NextResponse.json(
            { error: 'Failed to delete suggestion' },
            { status: 500 }
          )
        }

        return NextResponse.json({ success: true })

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('AI COA API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}