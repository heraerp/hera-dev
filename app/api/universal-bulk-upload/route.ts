/**
 * Universal Bulk Upload API Route
 * Handles bulk creation of any entity type using universal architecture
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import UniversalBulkUploadService from '@/lib/services/universalBulkUploadService';

// Service key client for bypassing RLS
const supabaseAdmin = createClient(
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
);

export async function POST(request: NextRequest) {
  try {
    const { organizationId, entityType, data } = await request.json();
    
    if (!organizationId || !entityType || !data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Organization ID, entity type, and data array are required' },
        { status: 400 }
      );
    }

    // Get entity configuration
    const entityConfig = UniversalBulkUploadService.getEntityConfig(entityType);
    if (!entityConfig) {
      return NextResponse.json(
        { error: `Entity type "${entityType}" not supported` },
        { status: 400 }
      );
    }

    console.log(`📤 Universal bulk uploading ${data.length} ${entityConfig.entityLabel} for organization:`, organizationId);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      createdIds: [] as string[]
    };

    // Process each item
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      
      try {
        // Validate required fields
        const requiredFields = entityConfig.fields.filter(f => f.required);
        for (const field of requiredFields) {
          if (!item[field.key] || item[field.key] === '') {
            throw new Error(`Missing required field: ${field.label}`);
          }
        }

        // Generate entity ID and code
        const entityId = crypto.randomUUID();
        const entityCode = generateEntityCode(item.name || item[entityConfig.fields[0].key], entityType);

        // Create entity in core_entities
        const { error: entityError } = await supabaseAdmin
          .from('core_entities')
          .insert({
            id: entityId,
            organization_id: organizationId,
            entity_type: entityType,
            entity_name: item.name || item[entityConfig.fields[0].key],
            entity_code: entityCode,
            is_active: true
          });

        if (entityError) {
          throw new Error(`Entity creation failed: ${entityError.message}`);
        }

        // Create metadata for all fields
        const metadataEntries = [];
        for (const field of entityConfig.fields) {
          const value = item[field.key];
          
          if (value !== undefined && value !== null && value !== '') {
            metadataEntries.push({
              organization_id: organizationId,
              entity_type: entityType,
              entity_id: entityId,
              metadata_type: `${entityType}_details`,
              metadata_category: 'entity_information',
              metadata_key: field.key,
              metadata_value: JSON.stringify(value),
              created_by: '16848910-d8cf-462b-a4d2-f94ac253d698' // Default user ID
            });
          }
        }

        // Insert metadata in batches
        if (metadataEntries.length > 0) {
          const { error: metadataError } = await supabaseAdmin
            .from('core_metadata')
            .insert(metadataEntries);

          if (metadataError) {
            throw new Error(`Metadata creation failed: ${metadataError.message}`);
          }
        }

        // Handle specific entity types with additional processing
        await handleSpecificEntityProcessing(entityType, entityId, item, organizationId);

        results.success++;
        results.createdIds.push(entityId);
        console.log(`✅ Created ${entityType} ${i + 1}/${data.length}: ${item.name || item[entityConfig.fields[0].key]}`);

      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${i + 1} (${item.name || item[entityConfig.fields[0].key] || 'Unknown'}): ${error.message}`);
        console.error(`❌ Error processing ${entityType} ${i + 1}:`, error);
      }
    }

    console.log(`📊 Universal bulk upload complete: ${results.success} success, ${results.failed} failed`);

    return NextResponse.json({
      success: true,
      message: `Bulk upload completed: ${results.success} ${entityConfig.entityLabel} created, ${results.failed} failed`,
      results
    });

  } catch (error) {
    console.error('❌ Universal bulk upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error during bulk upload' },
      { status: 500 }
    );
  }
}

// Handle specific entity type processing
async function handleSpecificEntityProcessing(
  entityType: string,
  entityId: string,
  item: any,
  organizationId: string
) {
  switch (entityType) {
    case 'product':
      // Product-specific processing
      if (item.price && item.cost) {
        const profitMargin = ((item.price - item.cost) / item.price) * 100;
        
        await supabaseAdmin
          .from('core_metadata')
          .insert({
            organization_id: organizationId,
            entity_type: 'product',
            entity_id: entityId,
            metadata_type: 'pricing_analysis',
            metadata_category: 'financial',
            metadata_key: 'profit_analysis',
            metadata_value: JSON.stringify({
              cost: item.cost,
              price: item.price,
              profit_margin: profitMargin,
              markup_percentage: ((item.price - item.cost) / item.cost) * 100
            }),
            created_by: '16848910-d8cf-462b-a4d2-f94ac253d698'
          });
      }
      break;

    case 'customer':
      // Customer-specific processing
      if (item.email || item.phone) {
        await supabaseAdmin
          .from('core_metadata')
          .insert({
            organization_id: organizationId,
            entity_type: 'customer',
            entity_id: entityId,
            metadata_type: 'contact_information',
            metadata_category: 'customer_details',
            metadata_key: 'contact_details',
            metadata_value: JSON.stringify({
              email: item.email,
              phone: item.phone,
              preferred_contact: item.email ? 'email' : 'phone'
            }),
            created_by: '16848910-d8cf-462b-a4d2-f94ac253d698'
          });
      }
      break;

    case 'supplier':
      // Supplier-specific processing
      if (item.payment_terms || item.tax_number) {
        await supabaseAdmin
          .from('core_metadata')
          .insert({
            organization_id: organizationId,
            entity_type: 'supplier',
            entity_id: entityId,
            metadata_type: 'business_information',
            metadata_category: 'supplier_details',
            metadata_key: 'business_details',
            metadata_value: JSON.stringify({
              tax_number: item.tax_number,
              payment_terms: item.payment_terms,
              business_type: 'supplier'
            }),
            created_by: '16848910-d8cf-462b-a4d2-f94ac253d698'
          });
      }
      break;

    case 'menu_item':
      // Menu item-specific processing
      if (item.calories || item.allergens) {
        await supabaseAdmin
          .from('core_metadata')
          .insert({
            organization_id: organizationId,
            entity_type: 'menu_item',
            entity_id: entityId,
            metadata_type: 'nutritional_information',
            metadata_category: 'menu_details',
            metadata_key: 'nutrition_info',
            metadata_value: JSON.stringify({
              calories: item.calories,
              allergens: item.allergens,
              dietary_info: item.dietary_info
            }),
            created_by: '16848910-d8cf-462b-a4d2-f94ac253d698'
          });
      }
      break;

    case 'menu_category':
      // Menu category-specific processing
      if (item.parent_category_name) {
        // Find parent category by name
        const { data: parentCategory } = await supabaseAdmin
          .from('core_entities')
          .select('id')
          .eq('organization_id', organizationId)
          .eq('entity_type', 'menu_category')
          .eq('entity_name', item.parent_category_name)
          .single();

        if (parentCategory) {
          await supabaseAdmin
            .from('core_metadata')
            .insert({
              organization_id: organizationId,
              entity_type: 'menu_category',
              entity_id: entityId,
              metadata_type: 'category_hierarchy',
              metadata_category: 'category_details',
              metadata_key: 'parent_category_id',
              metadata_value: JSON.stringify(parentCategory.id),
              created_by: '16848910-d8cf-462b-a4d2-f94ac253d698'
            });
        }
      }

      // Store category visualization metadata
      if (item.icon || item.color_theme || item.cuisine_type) {
        await supabaseAdmin
          .from('core_metadata')
          .insert({
            organization_id: organizationId,
            entity_type: 'menu_category',
            entity_id: entityId,
            metadata_type: 'category_visualization',
            metadata_category: 'category_details',
            metadata_key: 'visual_config',
            metadata_value: JSON.stringify({
              icon: item.icon,
              color_theme: item.color_theme,
              cuisine_type: item.cuisine_type
            }),
            created_by: '16848910-d8cf-462b-a4d2-f94ac253d698'
          });
      }

      // Store category business metadata
      if (item.price_range || item.profit_margin || item.popularity_score) {
        await supabaseAdmin
          .from('core_metadata')
          .insert({
            organization_id: organizationId,
            entity_type: 'menu_category',
            entity_id: entityId,
            metadata_type: 'category_business',
            metadata_category: 'category_details',
            metadata_key: 'business_metrics',
            metadata_value: JSON.stringify({
              price_range: item.price_range,
              profit_margin: item.profit_margin,
              popularity_score: item.popularity_score
            }),
            created_by: '16848910-d8cf-462b-a4d2-f94ac253d698'
          });
      }
      break;

    default:
      // No specific processing needed
      break;
  }
}

// Generate entity code
function generateEntityCode(name: string, entityType: string): string {
  const baseCode = name.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const typeCode = entityType.toUpperCase().slice(0, 3);
  return `${baseCode}-${random}-${typeCode}`;
}

// GET - Get template information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const action = searchParams.get('action');

    if (action === 'template' && entityType) {
      const entityConfig = UniversalBulkUploadService.getEntityConfig(entityType);
      if (!entityConfig) {
        return NextResponse.json(
          { error: `Entity type "${entityType}" not supported` },
          { status: 400 }
        );
      }

      return NextResponse.json({
        template: {
          name: entityConfig.templateName,
          entityType: entityConfig.entityType,
          entityLabel: entityConfig.entityLabel,
          fields: entityConfig.fields
        }
      });
    }

    if (action === 'supported-types') {
      const supportedTypes = UniversalBulkUploadService.getAvailableEntityTypes();
      return NextResponse.json({
        supportedTypes,
        configurations: supportedTypes.map(type => {
          const config = UniversalBulkUploadService.getEntityConfig(type);
          return {
            entityType: type,
            entityLabel: config?.entityLabel,
            templateName: config?.templateName
          };
        })
      });
    }

    return NextResponse.json({
      message: 'Universal Bulk Upload API',
      endpoints: {
        POST: 'Upload data for any entity type',
        GET: 'Get template information or supported types'
      },
      supportedEntityTypes: UniversalBulkUploadService.getAvailableEntityTypes()
    });

  } catch (error) {
    console.error('❌ Error in universal bulk upload GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}