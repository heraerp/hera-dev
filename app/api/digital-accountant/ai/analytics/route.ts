/**
 * HERA Digital Accountant - AI Analytics & Intelligence API
 * 
 * Provides AI performance analytics, confidence trends, and intelligence insights
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

// TypeScript interfaces
interface AIAnalyticsResponse {
  overview: {
    totalDocumentsProcessed: number;
    averageConfidenceScore: number;
    automationRate: number;
    manualInterventionRate: number;
    accuracyRate: number;
  };
  confidenceTrends: {
    daily: Array<{
      date: string;
      averageConfidence: number;
      documentsProcessed: number;
      autoProcessed: number;
    }>;
    byDocumentType: Record<string, {
      averageConfidence: number;
      totalProcessed: number;
      automationRate: number;
    }>;
  };
  relationshipDetection: {
    totalRelationshipsDetected: number;
    averageConfidence: number;
    accuracyRate: number;
    manualOverrides: number;
    byRelationshipType: Record<string, {
      detected: number;
      averageConfidence: number;
      manualOverrides: number;
    }>;
  };
  threeWayMatchValidation: {
    totalValidations: number;
    passRate: number;
    warningRate: number;
    failureRate: number;
    overrideRate: number;
    averageVariance: number;
  };
  journalEntryAutomation: {
    totalJournalEntries: number;
    aiGeneratedRate: number;
    autoPostedRate: number;
    averageConfidence: number;
    manualCorrections: number;
  };
  recommendations: string[];
}

// GET /api/digital-accountant/ai/analytics
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const period = searchParams.get('period') || '30'; // days
    const includeDetails = searchParams.get('includeDetails') === 'true';

    if (!organizationId || organizationId === 'null' || organizationId === 'undefined') {
      return NextResponse.json(
        { error: 'Valid organizationId is required', success: false },
        { status: 400 }
      );
    }

    console.log('📊 Generating AI analytics for organization:', organizationId);

    const periodDays = parseInt(period);
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString();

    // 1. Document Processing Analytics
    const documentAnalytics = await getDocumentProcessingAnalytics(supabase, organizationId, startDate, includeDetails);

    // 2. Relationship Detection Analytics
    const relationshipAnalytics = await getRelationshipDetectionAnalytics(supabase, organizationId, startDate);

    // 3. Three-Way Match Analytics
    const threeWayMatchAnalytics = await getThreeWayMatchAnalytics(supabase, organizationId, startDate);

    // 4. Journal Entry Analytics
    const journalAnalytics = await getJournalEntryAnalytics(supabase, organizationId, startDate);

    // 5. Generate recommendations
    const recommendations = generateRecommendations(
      documentAnalytics,
      relationshipAnalytics,
      threeWayMatchAnalytics,
      journalAnalytics
    );

    const response: AIAnalyticsResponse = {
      overview: {
        totalDocumentsProcessed: documentAnalytics.totalProcessed,
        averageConfidenceScore: documentAnalytics.averageConfidence,
        automationRate: documentAnalytics.automationRate,
        manualInterventionRate: documentAnalytics.manualInterventionRate,
        accuracyRate: documentAnalytics.accuracyRate
      },
      confidenceTrends: {
        daily: documentAnalytics.dailyTrends,
        byDocumentType: documentAnalytics.byDocumentType
      },
      relationshipDetection: {
        totalRelationshipsDetected: relationshipAnalytics.totalDetected,
        averageConfidence: relationshipAnalytics.averageConfidence,
        accuracyRate: relationshipAnalytics.accuracyRate,
        manualOverrides: relationshipAnalytics.manualOverrides,
        byRelationshipType: relationshipAnalytics.byType
      },
      threeWayMatchValidation: {
        totalValidations: threeWayMatchAnalytics.totalValidations,
        passRate: threeWayMatchAnalytics.passRate,
        warningRate: threeWayMatchAnalytics.warningRate,
        failureRate: threeWayMatchAnalytics.failureRate,
        overrideRate: threeWayMatchAnalytics.overrideRate,
        averageVariance: threeWayMatchAnalytics.averageVariance
      },
      journalEntryAutomation: {
        totalJournalEntries: journalAnalytics.totalEntries,
        aiGeneratedRate: journalAnalytics.aiGeneratedRate,
        autoPostedRate: journalAnalytics.autoPostedRate,
        averageConfidence: journalAnalytics.averageConfidence,
        manualCorrections: journalAnalytics.manualCorrections
      },
      recommendations: recommendations
    };

    console.log('✅ AI analytics generated successfully');

    return NextResponse.json({
      data: response,
      period: `${periodDays} days`,
      generatedAt: new Date().toISOString(),
      success: true
    });

  } catch (error) {
    console.error('❌ AI analytics error:', error);
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

// Document Processing Analytics
async function getDocumentProcessingAnalytics(
  supabase: any, 
  organizationId: string, 
  startDate: string,
  includeDetails: boolean
) {
  // Get document processing statistics
  const { data: documents } = await supabase
    .from('core_entities')
    .select(`
      id,
      created_at,
      core_dynamic_data!inner(field_name, field_value)
    `)
    .eq('organization_id', organizationId)
    .eq('entity_type', 'digital_document')
    .gte('created_at', startDate);

  let totalProcessed = 0;
  let totalConfidence = 0;
  let autoProcessed = 0;
  let manualIntervention = 0;
  const dailyStats: Record<string, any> = {};
  const documentTypeStats: Record<string, any> = {};

  (documents || []).forEach(doc => {
    const dynamicData = (doc.core_dynamic_data || []).reduce((acc: any, field: any) => {
      acc[field.field_name] = field.field_value;
      return acc;
    }, {});

    const confidence = parseFloat(dynamicData.ai_confidence_score || '0');
    const status = dynamicData.processing_status || 'unknown';
    const docType = dynamicData.document_type || 'unknown';
    const date = doc.created_at.split('T')[0];

    totalProcessed++;
    totalConfidence += confidence;

    // Count automation vs manual
    if (status === 'ai_processed' || (confidence >= 0.95 && status !== 'manual_review')) {
      autoProcessed++;
    } else if (status === 'review_required' || status === 'manual_review') {
      manualIntervention++;
    }

    // Daily trends
    if (!dailyStats[date]) {
      dailyStats[date] = { total: 0, confidence: 0, auto: 0 };
    }
    dailyStats[date].total++;
    dailyStats[date].confidence += confidence;
    if (status === 'ai_processed') dailyStats[date].auto++;

    // Document type stats
    if (!documentTypeStats[docType]) {
      documentTypeStats[docType] = { total: 0, confidence: 0, auto: 0 };
    }
    documentTypeStats[docType].total++;
    documentTypeStats[docType].confidence += confidence;
    if (status === 'ai_processed') documentTypeStats[docType].auto++;
  });

  // Transform daily stats
  const dailyTrends = Object.entries(dailyStats).map(([date, stats]: [string, any]) => ({
    date,
    averageConfidence: stats.total > 0 ? stats.confidence / stats.total : 0,
    documentsProcessed: stats.total,
    autoProcessed: stats.auto
  }));

  // Transform document type stats
  const byDocumentType = Object.entries(documentTypeStats).reduce((acc: any, [type, stats]: [string, any]) => {
    acc[type] = {
      averageConfidence: stats.total > 0 ? stats.confidence / stats.total : 0,
      totalProcessed: stats.total,
      automationRate: stats.total > 0 ? stats.auto / stats.total : 0
    };
    return acc;
  }, {});

  return {
    totalProcessed,
    averageConfidence: totalProcessed > 0 ? totalConfidence / totalProcessed : 0,
    automationRate: totalProcessed > 0 ? autoProcessed / totalProcessed : 0,
    manualInterventionRate: totalProcessed > 0 ? manualIntervention / totalProcessed : 0,
    accuracyRate: 0.92, // Mock accuracy rate - would be calculated from feedback
    dailyTrends,
    byDocumentType
  };
}

// Relationship Detection Analytics
async function getRelationshipDetectionAnalytics(supabase: any, organizationId: string, startDate: string) {
  const { data: relationships } = await supabase
    .from('core_relationships')
    .select('*')
    .eq('organization_id', organizationId)
    .gte('created_at', startDate);

  let totalDetected = 0;
  let totalConfidence = 0;
  let manualOverrides = 0;
  const byType: Record<string, any> = {};

  (relationships || []).forEach(rel => {
    const metadata = rel.metadata || {};
    const confidence = rel.relationship_strength || metadata.confidence_score || 0;
    const isManual = metadata.detection_method === 'manual' || metadata.detection_method === 'manual_override';
    const relType = rel.relationship_type;

    totalDetected++;
    totalConfidence += confidence;
    if (isManual) manualOverrides++;

    if (!byType[relType]) {
      byType[relType] = { detected: 0, confidence: 0, manual: 0 };
    }
    byType[relType].detected++;
    byType[relType].confidence += confidence;
    if (isManual) byType[relType].manual++;
  });

  // Transform by type stats
  const byRelationshipType = Object.entries(byType).reduce((acc: any, [type, stats]: [string, any]) => {
    acc[type] = {
      detected: stats.detected,
      averageConfidence: stats.detected > 0 ? stats.confidence / stats.detected : 0,
      manualOverrides: stats.manual
    };
    return acc;
  }, {});

  return {
    totalDetected,
    averageConfidence: totalDetected > 0 ? totalConfidence / totalDetected : 0,
    accuracyRate: 0.88, // Mock accuracy rate
    manualOverrides,
    byType: byRelationshipType
  };
}

// Three-Way Match Analytics
async function getThreeWayMatchAnalytics(supabase: any, organizationId: string, startDate: string) {
  const { data: validations } = await supabase
    .from('core_entities')
    .select(`
      id,
      core_dynamic_data!inner(field_name, field_value)
    `)
    .eq('organization_id', organizationId)
    .eq('entity_type', 'three_way_match_result')
    .gte('created_at', startDate);

  let totalValidations = 0;
  let passed = 0;
  let warnings = 0;
  let failed = 0;
  let overridden = 0;
  let totalVariance = 0;

  (validations || []).forEach(validation => {
    const dynamicData = (validation.core_dynamic_data || []).reduce((acc: any, field: any) => {
      acc[field.field_name] = field.field_value;
      return acc;
    }, {});

    const status = dynamicData.control_status || 'unknown';
    const result = dynamicData.validation_result ? JSON.parse(dynamicData.validation_result) : {};

    totalValidations++;

    switch (status) {
      case 'passed': passed++; break;
      case 'warning': warnings++; break;
      case 'failed': failed++; break;
      case 'overridden': overridden++; break;
    }

    // Calculate average variance (mock calculation)
    if (result.variance_percent) {
      totalVariance += parseFloat(result.variance_percent);
    }
  });

  return {
    totalValidations,
    passRate: totalValidations > 0 ? passed / totalValidations : 0,
    warningRate: totalValidations > 0 ? warnings / totalValidations : 0,
    failureRate: totalValidations > 0 ? failed / totalValidations : 0,
    overrideRate: totalValidations > 0 ? overridden / totalValidations : 0,
    averageVariance: totalValidations > 0 ? totalVariance / totalValidations : 0
  };
}

// Journal Entry Analytics
async function getJournalEntryAnalytics(supabase: any, organizationId: string, startDate: string) {
  const { data: journals } = await supabase
    .from('universal_transactions')
    .select('*')
    .eq('organization_id', organizationId)
    .in('transaction_type', ['journal_entry', 'ai_journal_entry'])
    .gte('created_at', startDate);

  let totalEntries = 0;
  let aiGenerated = 0;
  let autoPosted = 0;
  let totalConfidence = 0;
  let manualCorrections = 0;

  (journals || []).forEach(journal => {
    const aiClassification = journal.ai_classification || {};
    
    totalEntries++;
    
    if (journal.ai_generated) {
      aiGenerated++;
      totalConfidence += aiClassification.confidence_score || 0;
    }
    
    if (journal.transaction_status === 'posted' && journal.ai_generated) {
      autoPosted++;
    }
    
    // Mock manual corrections count
    if (journal.ai_generated && journal.transaction_status === 'posted') {
      manualCorrections += Math.random() > 0.8 ? 1 : 0;
    }
  });

  return {
    totalEntries,
    aiGeneratedRate: totalEntries > 0 ? aiGenerated / totalEntries : 0,
    autoPostedRate: aiGenerated > 0 ? autoPosted / aiGenerated : 0,
    averageConfidence: aiGenerated > 0 ? totalConfidence / aiGenerated : 0,
    manualCorrections
  };
}

// Generate AI Recommendations
function generateRecommendations(
  docAnalytics: any,
  relAnalytics: any,
  matchAnalytics: any,
  journalAnalytics: any
): string[] {
  const recommendations = [];

  // Document processing recommendations
  if (docAnalytics.averageConfidence < 0.8) {
    recommendations.push('Consider improving document preprocessing or AI model training');
  }
  if (docAnalytics.manualInterventionRate > 0.3) {
    recommendations.push('High manual intervention rate - review confidence thresholds');
  }

  // Relationship detection recommendations
  if (relAnalytics.averageConfidence < 0.7) {
    recommendations.push('Relationship detection accuracy could be improved with better matching algorithms');
  }
  if (relAnalytics.manualOverrides > relAnalytics.totalDetected * 0.2) {
    recommendations.push('High manual override rate - consider adjusting auto-detection rules');
  }

  // Three-way match recommendations
  if (matchAnalytics.failureRate > 0.2) {
    recommendations.push('High three-way match failure rate - review variance tolerances');
  }
  if (matchAnalytics.overrideRate > 0.1) {
    recommendations.push('Frequent validation overrides - ensure proper authorization controls');
  }

  // Journal entry recommendations
  if (journalAnalytics.aiGeneratedRate < 0.6) {
    recommendations.push('Increase AI-assisted journal entry creation for better efficiency');
  }
  if (journalAnalytics.manualCorrections > journalAnalytics.totalEntries * 0.15) {
    recommendations.push('High manual correction rate for AI journal entries - improve account mapping');
  }

  // Default recommendations if none specific
  if (recommendations.length === 0) {
    recommendations.push('AI system is performing well - continue monitoring for optimization opportunities');
  }

  return recommendations;
}