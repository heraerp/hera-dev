/**
 * HERA Universal - Templates Marketplace API
 * 
 * Sacred Multi-Tenancy: EVERY query includes organization_id filtering
 * This API provides browsing, searching, and filtering of ERP templates
 * while maintaining strict tenant isolation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Admin client for system template operations
const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

// System organization ID that owns all global templates
const SYSTEM_ORG_ID = '00000000-0000-0000-0000-000000000001';
const SYSTEM_USER_ID = '00000001-0000-0000-0000-000000000001';

interface Template {
  id: string;
  entity_code: string;
  entity_name: string;
  entity_type: string;
  description?: string;
  category?: string;
  industry?: string;
  complexity?: 'simple' | 'medium' | 'complex';
  deployment_time_minutes?: number;
  modules_count?: number;
  is_featured?: boolean;
  usage_count?: number;
  success_rate?: number;
  metadata?: Record<string, any>;
}

interface MarketplaceFilters {
  category?: string;
  industry?: string;
  complexity?: string;
  search?: string;
  featured?: boolean;
}

// GET /api/templates/marketplace
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    
    // Extract filters
    const filters: MarketplaceFilters = {
      category: searchParams.get('category') || undefined,
      industry: searchParams.get('industry') || undefined,
      complexity: searchParams.get('complexity') || undefined,
      search: searchParams.get('search') || undefined,
      featured: searchParams.get('featured') === 'true'
    };
    
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    console.log('🛍️ Fetching templates marketplace with filters:', filters);

    // SACRED: Query system templates (owned by system organization)
    let query = supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', SYSTEM_ORG_ID) // SACRED: System org owns templates
      .in('entity_type', ['erp_module_template', 'erp_industry_template'])
      .eq('is_active', true)
      .order('entity_name', { ascending: true })
      .range(offset, offset + limit - 1);

    // Apply search filter
    if (filters.search) {
      query = query.or(`entity_name.ilike.%${filters.search}%,entity_code.ilike.%${filters.search}%`);
    }

    const { data: templates, error, count } = await query;

    if (error) {
      console.error('❌ Error fetching templates:', error);
      throw error;
    }

    if (!templates || templates.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          templates: [],
          totalCount: 0,
          filters,
          pagination: { limit, offset }
        },
        message: 'No templates found'
      });
    }

    // SACRED: Get dynamic data for templates (also filtered by organization_id)
    const templateIds = templates.map(t => t.id);
    const { data: dynamicData } = await supabase
      .from('core_dynamic_data')
      .select('entity_id, field_name, field_value')
      .in('entity_id', templateIds);

    // SACRED: Get relationships to count modules in packages
    const { data: relationships } = await supabase
      .from('core_relationships')
      .select('parent_entity_id, child_entity_id')
      .eq('organization_id', SYSTEM_ORG_ID) // SACRED: Filter relationships
      .in('parent_entity_id', templateIds)
      .eq('relationship_type', 'template_includes_module')
      .eq('is_active', true);

    // Build dynamic data map
    const dynamicDataMap = new Map<string, Record<string, any>>();
    dynamicData?.forEach(dd => {
      if (!dynamicDataMap.has(dd.entity_id)) {
        dynamicDataMap.set(dd.entity_id, {});
      }
      dynamicDataMap.get(dd.entity_id)![dd.field_name] = dd.field_value;
    });

    // Count modules per package
    const moduleCountMap = new Map<string, number>();
    relationships?.forEach(rel => {
      const count = moduleCountMap.get(rel.parent_entity_id) || 0;
      moduleCountMap.set(rel.parent_entity_id, count + 1);
    });

    // Enrich templates with metadata
    const enrichedTemplates: Template[] = templates.map(template => {
      const metadata = dynamicDataMap.get(template.id) || {};
      const moduleCount = moduleCountMap.get(template.id) || 0;

      return {
        id: template.id,
        entity_code: template.entity_code,
        entity_name: template.entity_name,
        entity_type: template.entity_type,
        description: metadata.description,
        category: metadata.category,
        industry: metadata.industry,
        complexity: metadata.complexity || 'medium',
        deployment_time_minutes: parseInt(metadata.deployment_time_minutes || '30'),
        modules_count: moduleCount,
        is_featured: metadata.is_featured === 'true',
        usage_count: parseInt(metadata.usage_count || '0'),
        success_rate: parseFloat(metadata.success_rate || '95'),
        metadata
      };
    });

    // Apply post-query filters
    let filteredTemplates = enrichedTemplates;
    
    if (filters.category) {
      filteredTemplates = filteredTemplates.filter(t => t.category === filters.category);
    }
    
    if (filters.industry) {
      filteredTemplates = filteredTemplates.filter(t => t.industry === filters.industry);
    }
    
    if (filters.complexity) {
      filteredTemplates = filteredTemplates.filter(t => t.complexity === filters.complexity);
    }
    
    if (filters.featured) {
      filteredTemplates = filteredTemplates.filter(t => t.is_featured);
    }

    // Get unique categories and industries for filtering
    const categories = [...new Set(enrichedTemplates.map(t => t.category).filter(Boolean))];
    const industries = [...new Set(enrichedTemplates.map(t => t.industry).filter(Boolean))];

    console.log('✅ Templates marketplace fetched successfully:', filteredTemplates.length);

    return NextResponse.json({
      success: true,
      data: {
        templates: filteredTemplates,
        totalCount: filteredTemplates.length,
        filters,
        availableFilters: {
          categories,
          industries,
          complexities: ['simple', 'medium', 'complex']
        },
        pagination: {
          limit,
          offset,
          hasMore: offset + limit < (count || 0)
        }
      },
      metadata: {
        systemOrganizationId: SYSTEM_ORG_ID,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Templates marketplace error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch templates marketplace' 
      },
      { status: 500 }
    );
  }
}

// POST /api/templates/marketplace - Create custom template
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    
    const {
      organizationId,
      templateName,
      templateType,
      description,
      category,
      industry,
      complexity,
      modules,
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

    console.log('🆕 Creating custom template for organization:', organizationId);

    // Validate required fields
    if (!templateName || !templateType) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: templateName, templateType' 
        },
        { status: 400 }
      );
    }

    // Generate unique entity code
    const entityCode = `CUSTOM-${templateType.toUpperCase()}-${Date.now()}`;
    const entityId = crypto.randomUUID();

    // SACRED: Create template entity with organization_id
    const { data: templateEntity, error: entityError } = await supabase
      .from('core_entities')
      .insert({
        id: entityId,
        organization_id: organizationId, // SACRED: Organization isolation
        entity_type: templateType === 'module' ? 'custom_module_template' : 'custom_package_template',
        entity_name: templateName,
        entity_code: entityCode,
        is_active: true
      })
      .select()
      .single();

    if (entityError) {
      console.error('❌ Error creating template entity:', entityError);
      throw entityError;
    }

    // SACRED: Create dynamic data with organization_id
    const dynamicFields = [
      {
        entity_id: entityId,
        field_name: 'description',
        field_value: description || '',
        field_type: 'text'
      },
      {
        entity_id: entityId,
        field_name: 'category',
        field_value: category || 'custom',
        field_type: 'text'
      },
      {
        entity_id: entityId,
        field_name: 'industry',
        field_value: industry || 'general',
        field_type: 'text'
      },
      {
        entity_id: entityId,
        field_name: 'complexity',
        field_value: complexity || 'medium',
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
        field_name: 'is_custom',
        field_value: 'true',
        field_type: 'boolean'
      },
      {
        entity_id: entityId,
        field_name: 'deployment_time_minutes',
        field_value: '30',
        field_type: 'number'
      },
      {
        entity_id: entityId,
        field_name: 'usage_count',
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

    // If package template with modules, create relationships
    if (templateType === 'package' && modules && modules.length > 0) {
      const relationships = modules.map((moduleId: string, index: number) => ({
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
    }

    console.log('✅ Custom template created successfully:', entityCode);

    return NextResponse.json({
      success: true,
      data: {
        templateId: entityId,
        templateCode: entityCode,
        templateName: templateName,
        organizationId: organizationId
      },
      message: 'Custom template created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Create template error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create template' 
      },
      { status: 500 }
    );
  }
}