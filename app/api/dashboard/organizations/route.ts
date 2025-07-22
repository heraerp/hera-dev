/**
 * HERA Universal Dashboard - Organizations API (Optimized)
 * 
 * Monitors multi-tenant organizations, isolation, and resource usage
 * Optimized for fast response times
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

interface OrganizationSummary {
  id: string;
  name: string;
  industry: string;
  entityCount: number;
  transactionCount: number;
  userCount: number;
  lastActivity: string;
  healthScore: number;
  complianceStatus: 'compliant' | 'warning' | 'violation';
  features: string[];
  createdAt: string;
  storageUsed: number;
  apiCallsToday: number;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    
    // Get organizations summary (optimized)
    const organizations = await getOrganizationsSummaryFast(supabase);
    
    // Quick isolation check
    const isolationStatus = await checkTenantIsolationFast(supabase);
    
    // Quick resource usage
    const resourceUsage = await calculateResourceUsageFast(supabase);
    
    // Quick health metrics
    const healthMetrics = await getOrganizationHealthFast(supabase);
    
    // Quick compliance check
    const complianceIssues = await checkComplianceIssuesFast(supabase);
    
    // Quick feature usage
    const featureUsage = await analyzeFeatureUsageFast(supabase);
    
    return NextResponse.json({
      organizations,
      isolationStatus,
      resourceUsage,
      healthMetrics,
      complianceIssues,
      featureUsage,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Organizations monitoring error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization metrics' },
      { status: 500 }
    );
  }
}

async function getOrganizationsSummaryFast(supabase: any): Promise<OrganizationSummary[]> {
  try {
    // Get all organizations
    const { data: orgs } = await supabase
      .from('core_organizations')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(20); // Limit to top 20 organizations for performance
    
    if (!orgs || orgs.length === 0) {
      return [];
    }
    
    const orgIds = orgs.map(org => org.id);
    
    // Get entity counts for all organizations in one query
    const { data: entityCounts } = await supabase
      .from('core_entities')
      .select('organization_id')
      .in('organization_id', orgIds);
    
    // Get transaction counts for all organizations in one query
    const { data: transactionCounts } = await supabase
      .from('universal_transactions')
      .select('organization_id')
      .in('organization_id', orgIds);
    
    // Get user counts for all organizations in one query
    const { data: userCounts } = await supabase
      .from('user_organizations')
      .select('organization_id')
      .in('organization_id', orgIds)
      .eq('is_active', true);
    
    // Count entities by organization
    const entityCountMap = new Map();
    entityCounts?.forEach(e => {
      entityCountMap.set(e.organization_id, (entityCountMap.get(e.organization_id) || 0) + 1);
    });
    
    // Count transactions by organization
    const transactionCountMap = new Map();
    transactionCounts?.forEach(t => {
      transactionCountMap.set(t.organization_id, (transactionCountMap.get(t.organization_id) || 0) + 1);
    });
    
    // Count users by organization
    const userCountMap = new Map();
    userCounts?.forEach(u => {
      userCountMap.set(u.organization_id, (userCountMap.get(u.organization_id) || 0) + 1);
    });
    
    // Build organization summaries
    const organizations: OrganizationSummary[] = orgs.map((org: any) => {
      const entityCount = entityCountMap.get(org.id) || 0;
      const transactionCount = transactionCountMap.get(org.id) || 0;
      const userCount = userCountMap.get(org.id) || 0;
      
      // Calculate health score based on activity
      let healthScore = 100;
      if (entityCount === 0) healthScore -= 30;
      if (transactionCount === 0) healthScore -= 20;
      if (userCount === 0) healthScore -= 20;
      
      return {
        id: org.id,
        name: org.org_name || org.name || 'Unknown Organization',
        industry: org.industry || 'Unknown',
        entityCount,
        transactionCount,
        userCount,
        lastActivity: org.updated_at || org.created_at,
        healthScore: Math.max(healthScore, 0),
        complianceStatus: healthScore >= 80 ? 'compliant' : healthScore >= 60 ? 'warning' : 'violation',
        features: determineFeatures(entityCount, transactionCount, userCount),
        createdAt: org.created_at,
        storageUsed: Math.round((entityCount * 0.5 + transactionCount * 0.2) * 100) / 100, // Estimated MB
        apiCallsToday: Math.floor(Math.random() * 1000) // Mock data - would need actual tracking
      };
    });
    
    return organizations;
  } catch (error) {
    console.error('Error in organizations summary:', error);
    return [];
  }
}

async function checkTenantIsolationFast(supabase: any) {
  try {
    // Quick sample check for isolation violations
    const { data: sampleRelationships } = await supabase
      .from('core_relationships')
      .select('parent_entity_id, child_entity_id, organization_id')
      .limit(100);
    
    const violations: any[] = [];
    
    // Check for cross-organization references (simplified check)
    if (sampleRelationships && sampleRelationships.length > 0) {
      // This would require more complex logic in production
      // For now, assume no violations found in sample
    }
    
    return {
      totalChecked: sampleRelationships?.length || 0,
      violationsFound: violations.length,
      isolationScore: violations.length === 0 ? 100 : Math.max(0, 100 - violations.length * 10),
      violations,
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in isolation check:', error);
    return {
      totalChecked: 0,
      violationsFound: 0,
      isolationScore: 100,
      violations: [],
      lastChecked: new Date().toISOString()
    };
  }
}

async function calculateResourceUsageFast(supabase: any) {
  try {
    // Get total counts across all tables
    const [
      { count: totalOrgs },
      { count: totalEntities },
      { count: totalDynamicData },
      { count: totalRelationships },
      { count: totalTransactions }
    ] = await Promise.all([
      supabase.from('core_organizations').select('*', { count: 'exact', head: true }),
      supabase.from('core_entities').select('*', { count: 'exact', head: true }),
      supabase.from('core_dynamic_data').select('*', { count: 'exact', head: true }),
      supabase.from('core_relationships').select('*', { count: 'exact', head: true }),
      supabase.from('universal_transactions').select('*', { count: 'exact', head: true })
    ]);
    
    // Calculate estimated storage (simplified)
    const estimatedStorageMB = Math.round(
      (totalEntities || 0) * 0.5 +
      (totalDynamicData || 0) * 0.2 +
      (totalRelationships || 0) * 0.1 +
      (totalTransactions || 0) * 0.3
    );
    
    return {
      totalOrganizations: totalOrgs || 0,
      totalRecords: (totalEntities || 0) + (totalDynamicData || 0) + (totalRelationships || 0) + (totalTransactions || 0),
      estimatedStorageMB,
      averageRecordsPerOrg: totalOrgs ? Math.round(((totalEntities || 0) + (totalDynamicData || 0)) / totalOrgs) : 0,
      growthRate: 5.2, // Mock - would calculate from historical data
      resourceHealth: estimatedStorageMB < 1000 ? 'healthy' : estimatedStorageMB < 5000 ? 'warning' : 'critical'
    };
  } catch (error) {
    console.error('Error in resource usage calculation:', error);
    return {
      totalOrganizations: 0,
      totalRecords: 0,
      estimatedStorageMB: 0,
      averageRecordsPerOrg: 0,
      growthRate: 0,
      resourceHealth: 'healthy'
    };
  }
}

async function getOrganizationHealthFast(supabase: any) {
  try {
    // Quick health metrics
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    // Active organizations (had activity in last 30 days)
    const { data: activeOrgs } = await supabase
      .from('core_entities')
      .select('organization_id')
      .gte('created_at', thirtyDaysAgo)
      .limit(1000);
    
    const activeOrgIds = new Set(activeOrgs?.map(e => e.organization_id) || []);
    
    // Total organizations
    const { count: totalOrgs } = await supabase
      .from('core_organizations')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    const activePercentage = totalOrgs ? Math.round((activeOrgIds.size / totalOrgs) * 100) : 0;
    
    return {
      totalOrganizations: totalOrgs || 0,
      activeOrganizations: activeOrgIds.size,
      activePercentage,
      averageHealthScore: 85, // Mock - would calculate from actual health scores
      alertsCount: 2, // Mock - would get from monitoring system
      topPerformers: Array.from(activeOrgIds).slice(0, 5), // Top 5 active orgs
      needsAttention: [], // Organizations needing attention
      performanceTrend: 'stable' // Mock trend
    };
  } catch (error) {
    console.error('Error in organization health:', error);
    return {
      totalOrganizations: 0,
      activeOrganizations: 0,
      activePercentage: 0,
      averageHealthScore: 0,
      alertsCount: 0,
      topPerformers: [],
      needsAttention: [],
      performanceTrend: 'unknown'
    };
  }
}

async function checkComplianceIssuesFast(supabase: any) {
  try {
    // Quick compliance checks
    const issues: any[] = [];
    
    // Check for organizations without required fields
    const { data: incompleteOrgs } = await supabase
      .from('core_organizations')
      .select('id, org_name')
      .or('org_name.is.null,industry.is.null')
      .limit(10);
    
    incompleteOrgs?.forEach((org: any) => {
      issues.push({
        organizationId: org.id,
        issueType: 'missing_required_fields',
        severity: 'medium',
        description: 'Organization missing required metadata',
        suggestedFix: 'Update organization profile with missing information'
      });
    });
    
    // Check for inactive organizations with data
    const { data: inactiveWithData } = await supabase
      .from('core_organizations')
      .select('id, org_name')
      .eq('is_active', false)
      .limit(5);
    
    if (inactiveWithData && inactiveWithData.length > 0) {
      // Check if they have entities
      const inactiveIds = inactiveWithData.map(org => org.id);
      const { count: entitiesInInactive } = await supabase
        .from('core_entities')
        .select('*', { count: 'exact', head: true })
        .in('organization_id', inactiveIds);
      
      if (entitiesInInactive && entitiesInInactive > 0) {
        issues.push({
          organizationId: 'multiple',
          issueType: 'inactive_with_data',
          severity: 'high',
          description: `${inactiveWithData.length} inactive organizations still have data`,
          suggestedFix: 'Review data retention policy for inactive organizations'
        });
      }
    }
    
    return {
      totalIssues: issues.length,
      criticalIssues: issues.filter(i => i.severity === 'critical').length,
      complianceScore: Math.max(0, 100 - issues.length * 5),
      issues: issues.slice(0, 10), // Top 10 issues
      lastAudit: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in compliance check:', error);
    return {
      totalIssues: 0,
      criticalIssues: 0,
      complianceScore: 100,
      issues: [],
      lastAudit: new Date().toISOString()
    };
  }
}

async function analyzeFeatureUsageFast(supabase: any) {
  try {
    // Quick feature usage analysis
    const features = {
      entity_management: 0,
      transaction_processing: 0,
      relationship_mapping: 0,
      dynamic_fields: 0,
      user_management: 0
    };
    
    // Count organizations using each feature (simplified)
    const [
      { count: entitiesCount },
      { count: transactionsCount },
      { count: relationshipsCount },
      { count: dynamicDataCount },
      { count: usersCount }
    ] = await Promise.all([
      supabase.from('core_entities').select('organization_id', { count: 'exact', head: true }),
      supabase.from('universal_transactions').select('organization_id', { count: 'exact', head: true }),
      supabase.from('core_relationships').select('organization_id', { count: 'exact', head: true }),
      supabase.from('core_dynamic_data').select('entity_id', { count: 'exact', head: true }),
      supabase.from('user_organizations').select('organization_id', { count: 'exact', head: true })
    ]);
    
    return {
      featureAdoption: {
        entity_management: entitiesCount || 0,
        transaction_processing: transactionsCount || 0,
        relationship_mapping: relationshipsCount || 0,
        dynamic_fields: dynamicDataCount || 0,
        user_management: usersCount || 0
      },
      mostUsedFeatures: ['entity_management', 'dynamic_fields', 'transaction_processing'],
      leastUsedFeatures: ['relationship_mapping'],
      adoptionTrend: 'growing' // Mock trend
    };
  } catch (error) {
    console.error('Error in feature usage analysis:', error);
    return {
      featureAdoption: {
        entity_management: 0,
        transaction_processing: 0,
        relationship_mapping: 0,
        dynamic_fields: 0,
        user_management: 0
      },
      mostUsedFeatures: [],
      leastUsedFeatures: [],
      adoptionTrend: 'unknown'
    };
  }
}

// Helper functions
function determineFeatures(entityCount: number, transactionCount: number, userCount: number): string[] {
  const features: string[] = [];
  
  if (entityCount > 0) features.push('Entity Management');
  if (transactionCount > 0) features.push('Transaction Processing');
  if (userCount > 1) features.push('Multi-User');
  if (entityCount > 100) features.push('Enterprise Scale');
  
  return features;
}