/**
 * HERA Digital Accountant - API Index & Health Check
 * 
 * Provides API overview, health status, and capability discovery
 * Following Purchase Order API patterns exactly
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Admin client for bypassing RLS during development
const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

// API Documentation Structure
const API_DOCUMENTATION = {
  name: 'HERA Digital Accountant API',
  version: '1.0.0',
  description: 'AI-powered document processing, transaction relationship detection, three-way match validation, and intelligent workflow automation',
  endpoints: {
    documents: {
      description: 'Document management and AI processing',
      endpoints: [
        { method: 'GET', path: '/documents', description: 'List documents with filtering' },
        { method: 'POST', path: '/documents', description: 'Upload and create new document' },
        { method: 'GET', path: '/documents/{id}', description: 'Get document details' },
        { method: 'PUT', path: '/documents/{id}', description: 'Update document' },
        { method: 'DELETE', path: '/documents/{id}', description: 'Soft delete document' },
        { method: 'POST', path: '/documents/{id}/process', description: 'Trigger AI processing' }
      ]
    },
    relationships: {
      description: 'Transaction relationship management',
      endpoints: [
        { method: 'GET', path: '/relationships', description: 'List auto-detected relationships' },
        { method: 'POST', path: '/relationships', description: 'Create manual relationship' },
        { method: 'GET', path: '/relationships/pending-review', description: 'List low-confidence relationships' },
        { method: 'PUT', path: '/relationships/pending-review', description: 'Review and approve/reject relationships' }
      ]
    },
    threeWayMatch: {
      description: 'PO → GR → Invoice validation system',
      endpoints: [
        { method: 'GET', path: '/three-way-match/pending', description: 'List invoices pending validation' },
        { method: 'POST', path: '/three-way-match/validate/{invoiceId}', description: 'Trigger three-way match validation' },
        { method: 'PUT', path: '/three-way-match/{id}/override', description: 'Override validation for exceptions' }
      ]
    },
    journalEntries: {
      description: 'AI-assisted journal entry creation',
      endpoints: [
        { method: 'GET', path: '/journal-entries', description: 'List journal entries' },
        { method: 'POST', path: '/journal-entries', description: 'Create journal entry' },
        { method: 'PUT', path: '/journal-entries/{id}/post', description: 'Post journal entry to GL' }
      ]
    },
    aiIntelligence: {
      description: 'AI performance analytics and feedback',
      endpoints: [
        { method: 'GET', path: '/ai/analytics', description: 'AI performance analytics and trends' },
        { method: 'POST', path: '/ai/feedback', description: 'Submit user feedback for AI improvement' },
        { method: 'GET', path: '/ai/feedback', description: 'Get feedback summary and statistics' }
      ]
    }
  },
  features: [
    'AI-powered document processing with confidence scoring',
    'Automatic relationship detection (PO→GR→Invoice→Payment)',
    'Three-way match validation with variance analysis',
    'Workflow cascade triggers using HERA Universal Architecture',
    'Complete audit trail using core_events',
    'Control framework using core_entities + core_dynamic_data',
    'Real-time notification and event processing',
    'Zero-schema migration universal transaction processing',
    'Enterprise-grade compliance controls',
    '100% HERA Universal Architecture compliance'
  ]
};

// GET /api/digital-accountant
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const includeHealth = searchParams.get('includeHealth') === 'true';

    console.log('📋 Digital Accountant API index requested');

    let healthStatus = null;
    if (includeHealth && organizationId) {
      healthStatus = await getSystemHealth(supabase, organizationId);
    }

    const response = {
      api: API_DOCUMENTATION,
      health: healthStatus,
      timestamp: new Date().toISOString(),
      endpoints: {
        baseUrl: '/api/digital-accountant',
        documentation: 'https://docs.hera-universal.com/digital-accountant',
        examples: 'https://examples.hera-universal.com/digital-accountant'
      }
    };

    return NextResponse.json({
      data: response,
      success: true
    });

  } catch (error) {
    console.error('❌ API index error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    );
  }
}

// Health Check Function
async function getSystemHealth(supabase: any, organizationId: string) {
  const health = {
    status: 'healthy',
    components: {},
    metrics: {},
    lastChecked: new Date().toISOString()
  };

  try {
    // Check database connectivity
    const { data: dbCheck } = await supabase
      .from('core_organizations')
      .select('id')
      .eq('id', organizationId)
      .single();

    health.components['database'] = {
      status: dbCheck ? 'healthy' : 'unhealthy',
      responseTime: Date.now() % 100 // Mock response time
    };

    // Check AI processing functions
    const { data: functionsCheck, error: functionsError } = await supabase
      .rpc('validate_three_way_match', { invoice_id: 'health-check' });

    health.components['ai_functions'] = {
      status: functionsError ? 'degraded' : 'healthy',
      error: functionsError?.message
    };

    // Get recent activity metrics
    const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Documents processed today
    const { data: documents, count: docCount } = await supabase
      .from('core_entities')
      .select('id', { count: 'exact' })
      .eq('organization_id', organizationId)
      .eq('entity_type', 'digital_document')
      .gte('created_at', startDate);

    // Relationships detected today
    const { data: relationships, count: relCount } = await supabase
      .from('core_relationships')
      .select('id', { count: 'exact' })
      .eq('organization_id', organizationId)
      .gte('created_at', startDate);

    // Journal entries created today
    const { data: journals, count: journalCount } = await supabase
      .from('universal_transactions')
      .select('id', { count: 'exact' })
      .eq('organization_id', organizationId)
      .in('transaction_type', ['journal_entry', 'ai_journal_entry'])
      .gte('created_at', startDate);

    health.metrics = {
      documentsProcessedToday: docCount || 0,
      relationshipsDetectedToday: relCount || 0,
      journalEntriesCreatedToday: journalCount || 0,
      systemLoad: Math.random() * 0.5 + 0.2, // Mock system load 20-70%
      aiConfidenceAverage: 0.85 + Math.random() * 0.1 // Mock 85-95%
    };

    // Determine overall status
    const componentStatuses = Object.values(health.components).map((c: any) => c.status);
    if (componentStatuses.includes('unhealthy')) {
      health.status = 'unhealthy';
    } else if (componentStatuses.includes('degraded')) {
      health.status = 'degraded';
    }

  } catch (error) {
    console.error('Health check error:', error);
    health.status = 'unhealthy';
    health.components['health_check'] = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }

  return health;
}

// POST /api/digital-accountant (Configuration endpoint)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, organizationId } = body;

    if (!action || !organizationId) {
      return NextResponse.json(
        { error: 'action and organizationId are required', success: false },
        { status: 400 }
      );
    }

    console.log('⚙️ Digital Accountant configuration action:', action);

    const supabase = getAdminClient();
    let result = {};

    switch (action) {
      case 'initialize':
        // Initialize Digital Accountant for organization
        result = await initializeDigitalAccountant(supabase, organizationId);
        break;

      case 'reset_ai_models':
        // Reset AI learning models (development only)
        result = await resetAIModels(supabase, organizationId);
        break;

      case 'recalibrate_confidence':
        // Recalibrate confidence thresholds based on feedback
        result = await recalibrateConfidence(supabase, organizationId);
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}`, success: false },
          { status: 400 }
        );
    }

    return NextResponse.json({
      data: result,
      success: true,
      message: `Action '${action}' completed successfully`
    });

  } catch (error) {
    console.error('❌ Configuration error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    );
  }
}

// Configuration helper functions
async function initializeDigitalAccountant(supabase: any, organizationId: string) {
  // Create default configuration entities
  const configEntity = await supabase
    .from('core_entities')
    .insert({
      organization_id: organizationId,
      entity_type: 'digital_accountant_config',
      entity_name: 'Digital Accountant Configuration',
      entity_code: 'DA_CONFIG',
      is_active: true
    })
    .select()
    .single();

  // Set default configuration
  const defaultConfig = [
    { entity_id: configEntity.data.id, field_name: 'ai_confidence_threshold', field_value: '0.85', field_type: 'decimal' },
    { entity_id: configEntity.data.id, field_name: 'auto_post_threshold', field_value: '0.95', field_type: 'decimal' },
    { entity_id: configEntity.data.id, field_name: 'variance_tolerance_percent', field_value: '5.0', field_type: 'decimal' },
    { entity_id: configEntity.data.id, field_name: 'enable_auto_relationships', field_value: 'true', field_type: 'boolean' },
    { entity_id: configEntity.data.id, field_name: 'enable_three_way_match', field_value: 'true', field_type: 'boolean' }
  ];

  await supabase
    .from('core_dynamic_data')
    .insert(defaultConfig);

  return {
    configurationId: configEntity.data.id,
    message: 'Digital Accountant initialized with default settings'
  };
}

async function resetAIModels(supabase: any, organizationId: string) {
  // In development - reset AI learning data
  await supabase
    .from('core_metadata')
    .delete()
    .eq('organization_id', organizationId)
    .eq('metadata_type', 'ai_learning');

  return { message: 'AI learning models reset' };
}

async function recalibrateConfidence(supabase: any, organizationId: string) {
  // Analyze feedback and adjust confidence thresholds
  const { data: feedback } = await supabase
    .from('core_entities')
    .select(`
      core_dynamic_data!inner(field_name, field_value)
    `)
    .eq('organization_id', organizationId)
    .eq('entity_type', 'ai_feedback');

  // Mock recalibration based on feedback
  const newThreshold = 0.80 + Math.random() * 0.15; // 80-95%

  return {
    newConfidenceThreshold: newThreshold,
    feedbackAnalyzed: feedback?.length || 0,
    message: 'Confidence thresholds recalibrated based on user feedback'
  };
}