/**
 * HERA Universal - Industry Packages Management API
 * 
 * Sacred Multi-Tenancy: organization_id filtering for all package operations
 * Manages industry-specific ERP packages that bundle multiple modules
 * Provides complete ERP system deployment in 2 minutes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Admin client for package operations
const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

// System constants
const SYSTEM_ORG_ID = '00000000-0000-0000-0000-000000000001';
const SYSTEM_USER_ID = '00000001-0000-0000-0000-000000000001';

interface IndustryPackage {
  id: string;
  entity_code: string;
  entity_name: string;
  entity_type: string;
  description?: string;
  industry_type?: string;
  target_business_size?: string;
  included_modules: Array<{
    id: string;
    code: string;
    name: string;
    category: string;
    order: number;
  }>;
  package_features: {
    total_modules: number;
    core_modules: number;
    industry_specific_modules: number;
    estimated_deployment_time: number;
    includes_coa: boolean;
    includes_workflows: boolean;
    includes_reports: boolean;
  };
  deployment_stats: {
    total_deployments: number;
    success_rate: number;
    average_deployment_time: number;
    last_deployed: string;
  };
  customizations?: {
    business_size_options: string[];
    regional_compliance: string[];
    additional_modules: string[];
  };
  organization_id: string;
}

interface PackageFilters {
  industry?: string;
  businessSize?: string;
  organizationId?: string;
}

// GET /api/templates/packages
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    
    // SACRED: organization_id for access control (optional for browsing system packages)
    const organizationId = searchParams.get('organizationId');
    
    const filters: PackageFilters = {
      industry: searchParams.get('industry') || undefined,
      businessSize: searchParams.get('businessSize') || undefined,
      organizationId: organizationId || undefined
    };
    
    const includeSystem = searchParams.get('includeSystem') !== 'false'; // Default true
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    console.log('📦 Fetching industry packages with filters:', filters);

    // SACRED: Query packages - system packages and org-specific packages
    const orgFilters = [];
    if (includeSystem) orgFilters.push(SYSTEM_ORG_ID);
    if (organizationId) orgFilters.push(organizationId);
    
    if (orgFilters.length === 0) {
      orgFilters.push(SYSTEM_ORG_ID); // At least include system packages
    }
    
    const { data: packages, error, count } = await supabase
      .from('core_entities')
      .select(`
        *,
        organization:core_organizations!inner(
          id,
          org_name,
          client:core_clients(
            id,
            client_name
          )
        )
      `)
      .in('organization_id', orgFilters) // SACRED: Multi-org filter
      .in('entity_type', ['erp_industry_template', 'custom_package_template'])
      .eq('is_active', true)
      .order('entity_name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Error fetching packages:', error);
      throw error;
    }

    if (!packages || packages.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          packages: [],
          totalCount: 0,
          filters,
          pagination: { limit, offset }
        },
        message: 'No industry packages found'
      });
    }

    // SACRED: Get dynamic data for packages
    const packageIds = packages.map(p => p.id);
    const { data: dynamicData } = await supabase
      .from('core_dynamic_data')
      .select('entity_id, field_name, field_value')
      .in('entity_id', packageIds);

    // Get package modules via relationships
    const { data: packageModules } = await supabase
      .from('core_relationships')
      .select(`
        parent_entity_id,
        relationship_data,
        child_module:core_entities!core_relationships_child_entity_id_fkey(
          id, entity_name, entity_code, entity_type
        )
      `)
      .in('organization_id', orgFilters) // SACRED: Filter relationships
      .in('parent_entity_id', packageIds)
      .eq('relationship_type', 'template_includes_module')
      .eq('is_active', true)
      .order('relationship_data->order', { ascending: true });

    // Get deployment statistics for packages
    const { data: deploymentStats } = await supabase
      .from('universal_transactions')
      .select(`
        transaction_data,
        transaction_status,
        created_at
      `)
      .eq('transaction_type', 'package_deployment')
      .contains('transaction_data', { package_id: packageIds[0] }) // Sample for now
      .order('created_at', { ascending: false })
      .limit(100);

    // Build data maps
    const dynamicDataMap = new Map<string, Record<string, any>>();
    dynamicData?.forEach(dd => {
      if (!dynamicDataMap.has(dd.entity_id)) {
        dynamicDataMap.set(dd.entity_id, {});
      }
      dynamicDataMap.get(dd.entity_id)![dd.field_name] = dd.field_value;
    });

    const packageModulesMap = new Map<string, Array<any>>();
    packageModules?.forEach(pm => {
      if (!packageModulesMap.has(pm.parent_entity_id)) {
        packageModulesMap.set(pm.parent_entity_id, []);
      }
      packageModulesMap.get(pm.parent_entity_id)!.push({
        id: pm.child_module.id,
        code: pm.child_module.entity_code,
        name: pm.child_module.entity_name,
        category: pm.child_module.entity_type,
        order: pm.relationship_data?.order || 0
      });
    });

    // Enrich packages with metadata
    const enrichedPackages: IndustryPackage[] = packages.map(pkg => {
      const metadata = dynamicDataMap.get(pkg.id) || {};
      const modules = packageModulesMap.get(pkg.id) || [];
      const coreModules = modules.filter(m => m.category === 'erp_module_template').length;
      
      // Calculate deployment stats (simplified for now)
      const deploymentCount = parseInt(metadata.total_deployments || '0');
      const successRate = parseFloat(metadata.success_rate || '95');
      const avgDeploymentTime = parseInt(metadata.average_deployment_time || '120');

      return {
        id: pkg.id,
        entity_code: pkg.entity_code,
        entity_name: pkg.entity_name,
        entity_type: pkg.entity_type,
        description: metadata.description,
        industry_type: metadata.industry_type || 'general',
        target_business_size: metadata.target_business_size || 'medium',
        included_modules: modules.sort((a, b) => a.order - b.order),
        package_features: {
          total_modules: modules.length,
          core_modules: coreModules,
          industry_specific_modules: modules.length - coreModules,
          estimated_deployment_time: parseInt(metadata.estimated_deployment_time || '120'),
          includes_coa: metadata.includes_coa === 'true',
          includes_workflows: metadata.includes_workflows === 'true',
          includes_reports: metadata.includes_reports === 'true'
        },
        deployment_stats: {
          total_deployments: deploymentCount,
          success_rate: successRate,
          average_deployment_time: avgDeploymentTime,
          last_deployed: metadata.last_deployed || new Date().toISOString()
        },
        customizations: {
          business_size_options: JSON.parse(metadata.business_size_options || '["small","medium","large"]'),
          regional_compliance: JSON.parse(metadata.regional_compliance || '["US_GAAP"]'),
          additional_modules: JSON.parse(metadata.additional_modules || '[]')
        },
        organization_id: pkg.organization_id
      };
    });

    // Apply filters
    let filteredPackages = enrichedPackages;
    
    if (filters.industry) {
      filteredPackages = filteredPackages.filter(p => p.industry_type === filters.industry);
    }
    
    if (filters.businessSize) {
      filteredPackages = filteredPackages.filter(p => 
        p.customizations?.business_size_options.includes(filters.businessSize!) ||
        p.target_business_size === filters.businessSize
      );
    }

    // Get available filter options
    const industries = [...new Set(enrichedPackages.map(p => p.industry_type).filter(Boolean))];
    const businessSizes = [...new Set(enrichedPackages.flatMap(p => 
      p.customizations?.business_size_options || []
    ))];

    // Calculate summary statistics
    const summary = {
      totalPackages: filteredPackages.length,
      systemPackages: filteredPackages.filter(p => p.organization_id === SYSTEM_ORG_ID).length,
      customPackages: filteredPackages.filter(p => p.organization_id !== SYSTEM_ORG_ID).length,
      totalModules: filteredPackages.reduce((sum, p) => sum + p.package_features.total_modules, 0),
      averageModulesPerPackage: filteredPackages.length > 0 ? 
        Math.round(filteredPackages.reduce((sum, p) => sum + p.package_features.total_modules, 0) / filteredPackages.length) : 0
    };

    console.log('✅ Industry packages fetched successfully:', filteredPackages.length);

    return NextResponse.json({
      success: true,
      data: {
        packages: filteredPackages,
        summary,
        totalCount: filteredPackages.length,
        filters,
        availableFilters: {
          industries,
          businessSizes
        },
        pagination: {
          limit,
          offset,
          hasMore: offset + limit < (count || 0)
        }
      },
      metadata: {
        organizationId,
        includeSystem,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Industry packages error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch industry packages' 
      },
      { status: 500 }
    );
  }
}

// POST /api/templates/packages - Create custom industry package
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    
    const {
      organizationId,
      packageName,
      description,
      industryType,
      targetBusinessSize,
      includedModules,
      packageFeatures,
      customizations,
      createdBy
    } = body;

    // SACRED: Validate organization_id is provided
    if (!organizationId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'organizationId is required for multi-tenant security' 
        },
        { status: 400 }
      );
    }

    console.log('📦 Creating custom industry package for organization:', organizationId);

    // Validate required fields
    if (!packageName || !industryType || !includedModules || !Array.isArray(includedModules) || includedModules.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: packageName, industryType, includedModules' 
        },
        { status: 400 }
      );
    }

    // Generate unique entity code
    const entityCode = `CUSTOM-${industryType.toUpperCase()}-PKG-${Date.now()}`;
    const entityId = crypto.randomUUID();

    // SACRED: Create package entity with organization_id
    const { data: packageEntity, error: entityError } = await supabase
      .from('core_entities')
      .insert({
        id: entityId,
        organization_id: organizationId, // SACRED: Organization isolation
        entity_type: 'custom_package_template',
        entity_name: packageName,
        entity_code: entityCode,
        is_active: true
      })
      .select()
      .single();

    if (entityError) {
      console.error('❌ Error creating package entity:', entityError);
      throw entityError;
    }

    // SACRED: Create dynamic data
    const dynamicFields = [
      {
        entity_id: entityId,
        field_name: 'description',
        field_value: description || '',
        field_type: 'text'
      },
      {
        entity_id: entityId,
        field_name: 'industry_type',
        field_value: industryType,
        field_type: 'text'
      },
      {
        entity_id: entityId,
        field_name: 'target_business_size',
        field_value: targetBusinessSize || 'medium',
        field_type: 'text'
      },
      {
        entity_id: entityId,
        field_name: 'created_by',
        field_value: createdBy || SYSTEM_USER_ID,
        field_type: 'text'
      },
      {
        entity_id: entityId,
        field_name: 'estimated_deployment_time',
        field_value: (packageFeatures?.estimated_deployment_time || 120).toString(),
        field_type: 'number'
      },
      {
        entity_id: entityId,
        field_name: 'includes_coa',
        field_value: (packageFeatures?.includes_coa || true).toString(),
        field_type: 'boolean'
      },
      {
        entity_id: entityId,
        field_name: 'includes_workflows',
        field_value: (packageFeatures?.includes_workflows || true).toString(),
        field_type: 'boolean'
      },
      {
        entity_id: entityId,
        field_name: 'includes_reports',
        field_value: (packageFeatures?.includes_reports || true).toString(),
        field_type: 'boolean'
      },
      {
        entity_id: entityId,
        field_name: 'business_size_options',
        field_value: JSON.stringify(customizations?.business_size_options || ['small', 'medium', 'large']),
        field_type: 'json'
      },
      {
        entity_id: entityId,
        field_name: 'regional_compliance',
        field_value: JSON.stringify(customizations?.regional_compliance || ['US_GAAP']),
        field_type: 'json'
      },
      {
        entity_id: entityId,
        field_name: 'total_deployments',
        field_value: '0',
        field_type: 'number'
      },
      {
        entity_id: entityId,
        field_name: 'success_rate',
        field_value: '100',
        field_type: 'number'
      }
    ];

    const { error: dynamicError } = await supabase
      .from('core_dynamic_data')
      .insert(dynamicFields);

    if (dynamicError) {
      console.error('❌ Error creating dynamic data:', dynamicError);
      throw dynamicError;
    }

    // SACRED: Create package-module relationships with organization_id
    const relationships = includedModules.map((moduleId: string, index: number) => ({
      organization_id: organizationId, // SACRED: Relationship isolation
      relationship_type: 'template_includes_module',
      parent_entity_id: entityId,
      child_entity_id: moduleId,
      relationship_data: { order: index + 1 },
      is_active: true
    }));

    const { error: relError } = await supabase
      .from('core_relationships')
      .insert(relationships);

    if (relError) {
      console.error('❌ Error creating module relationships:', relError);
      throw relError;
    }

    console.log('✅ Custom industry package created successfully:', entityCode);

    return NextResponse.json({
      success: true,
      data: {
        packageId: entityId,
        packageCode: entityCode,
        packageName: packageName,
        organizationId: organizationId,
        includedModulesCount: includedModules.length
      },
      message: 'Custom industry package created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Create package error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create industry package' 
      },
      { status: 500 }
    );
  }
}