/**
 * HERA Universal - Validation Rules API Routes
 * 
 * Manages validation rules as universal schema entities
 * Enables business users to configure field validation without code changes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Admin client for consistent access
const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

// TypeScript interfaces
interface ValidationRule {
  id: string;
  name: string;
  code: string;
  targetEntityType: string;
  targetFieldName: string;
  validationType: 'numeric_range' | 'regex_pattern' | 'date_rule' | 'custom';
  minValue?: number;
  maxValue?: number;
  regexPattern?: string;
  ruleExpression?: string;
  errorMessage: string;
  isActive: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

interface ValidationRuleRequest {
  organizationId: string;
  name: string;
  targetEntityType: string;
  targetFieldName: string;
  validationType: string;
  minValue?: number;
  maxValue?: number;
  regexPattern?: string;
  ruleExpression?: string;
  errorMessage: string;
  isActive?: boolean;
}

// Helper function to generate rule code
const generateRuleCode = (name: string): string => {
  return `VR-${name.toUpperCase().replace(/[^A-Z0-9]/g, '-')}`;
};

// GET /api/validation-rules
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const entityType = searchParams.get('entityType');
    const fieldName = searchParams.get('fieldName');
    const isActive = searchParams.get('isActive');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    // Build query for validation rules
    let query = supabase
      .from('core_entities')
      .select(`
        *,
        core_dynamic_data(field_name, field_value)
      `)
      .eq('organization_id', organizationId)
      .eq('entity_type', 'validation_rule');

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data: rules, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching validation rules:', error);
      return NextResponse.json(
        { error: 'Failed to fetch validation rules' },
        { status: 500 }
      );
    }

    // Enrich rules with dynamic data
    const enrichedRules = (rules || []).map(rule => {
      // Build dynamic data map
      const dynamicData = (rule.core_dynamic_data || []).reduce((acc: any, field: any) => {
        acc[field.field_name] = field.field_value;
        return acc;
      }, {});

      // Determine validation type based on available fields
      let validationType = 'custom';
      if (dynamicData.min_value !== undefined || dynamicData.max_value !== undefined) {
        validationType = 'numeric_range';
      } else if (dynamicData.regex_pattern !== undefined) {
        validationType = 'regex_pattern';
      } else if (dynamicData.rule_expression !== undefined) {
        validationType = 'date_rule';
      }

      return {
        id: rule.id,
        name: rule.entity_name,
        code: rule.entity_code,
        targetEntityType: dynamicData.target_entity_type || '',
        targetFieldName: dynamicData.target_field_name || '',
        validationType: validationType,
        minValue: dynamicData.min_value ? parseFloat(dynamicData.min_value) : undefined,
        maxValue: dynamicData.max_value ? parseFloat(dynamicData.max_value) : undefined,
        regexPattern: dynamicData.regex_pattern || '',
        ruleExpression: dynamicData.rule_expression || '',
        errorMessage: dynamicData.error_message || '',
        isActive: rule.is_active,
        organizationId: rule.organization_id,
        createdAt: rule.created_at,
        updatedAt: rule.updated_at
      };
    });

    // Apply additional filters
    let filteredRules = enrichedRules;
    if (entityType) {
      filteredRules = filteredRules.filter(rule => rule.targetEntityType === entityType);
    }
    if (fieldName) {
      filteredRules = filteredRules.filter(rule => rule.targetFieldName === fieldName);
    }

    return NextResponse.json({
      data: filteredRules,
      total: filteredRules.length,
      summary: {
        total_rules: filteredRules.length,
        active_rules: filteredRules.filter(r => r.isActive).length,
        numeric_rules: filteredRules.filter(r => r.validationType === 'numeric_range').length,
        regex_rules: filteredRules.filter(r => r.validationType === 'regex_pattern').length,
        date_rules: filteredRules.filter(r => r.validationType === 'date_rule').length
      }
    });

  } catch (error) {
    console.error('Validation rules GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/validation-rules
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body: ValidationRuleRequest = await request.json();

    console.log('Creating validation rule with data:', JSON.stringify(body, null, 2));

    // Validate request
    if (!body.organizationId || !body.name || !body.targetEntityType || !body.targetFieldName) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, name, targetEntityType, targetFieldName' },
        { status: 400 }
      );
    }

    // Generate rule code
    const ruleCode = generateRuleCode(body.name);

    // Create validation rule entity
    const { data: validationRule, error: ruleError } = await supabase
      .from('core_entities')
      .insert({
        organization_id: body.organizationId,
        entity_type: 'validation_rule',
        entity_name: body.name,
        entity_code: ruleCode,
        is_active: body.isActive !== false
      })
      .select()
      .single();

    if (ruleError) {
      console.error('Error creating validation rule:', ruleError);
      return NextResponse.json(
        { error: 'Failed to create validation rule' },
        { status: 500 }
      );
    }

    // Add rule properties
    const ruleProperties = [
      { field_name: 'target_entity_type', field_value: body.targetEntityType, field_type: 'text' },
      { field_name: 'target_field_name', field_value: body.targetFieldName, field_type: 'text' },
      { field_name: 'error_message', field_value: body.errorMessage, field_type: 'text' }
    ];

    // Add validation type specific properties
    if (body.validationType === 'numeric_range') {
      if (body.minValue !== undefined) {
        ruleProperties.push({ field_name: 'min_value', field_value: body.minValue.toString(), field_type: 'number' });
      }
      if (body.maxValue !== undefined) {
        ruleProperties.push({ field_name: 'max_value', field_value: body.maxValue.toString(), field_type: 'number' });
      }
    } else if (body.validationType === 'regex_pattern') {
      if (body.regexPattern) {
        ruleProperties.push({ field_name: 'regex_pattern', field_value: body.regexPattern, field_type: 'text' });
      }
    } else if (body.validationType === 'date_rule') {
      if (body.ruleExpression) {
        ruleProperties.push({ field_name: 'rule_expression', field_value: body.ruleExpression, field_type: 'text' });
      }
    }

    const { error: propertiesError } = await supabase
      .from('core_dynamic_data')
      .insert(
        ruleProperties.map(prop => ({
          entity_id: validationRule.id,
          ...prop
        }))
      );

    if (propertiesError) {
      console.error('Error adding rule properties:', propertiesError);
      return NextResponse.json(
        { error: 'Failed to add rule properties' },
        { status: 500 }
      );
    }

    console.log(`✅ Validation rule created: ${body.name} (${body.validationType})`);

    return NextResponse.json({
      success: true,
      data: {
        id: validationRule.id,
        name: body.name,
        code: ruleCode,
        type: body.validationType,
        message: `Validation rule '${body.name}' created successfully`
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Validation rule POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/validation-rules
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Validation rule ID is required' },
        { status: 400 }
      );
    }

    console.log('Updating validation rule:', id, 'with data:', updateData);

    // Update entity name and status if provided
    const entityUpdates: any = {};
    if (updateData.name) entityUpdates.entity_name = updateData.name;
    if (updateData.isActive !== undefined) entityUpdates.is_active = updateData.isActive;

    if (Object.keys(entityUpdates).length > 0) {
      const { error: entityError } = await supabase
        .from('core_entities')
        .update(entityUpdates)
        .eq('id', id);

      if (entityError) {
        console.error('Error updating validation rule entity:', entityError);
        return NextResponse.json(
          { error: 'Failed to update validation rule' },
          { status: 500 }
        );
      }
    }

    // Update dynamic properties
    const propertyUpdates = [];
    if (updateData.targetEntityType !== undefined) propertyUpdates.push({ field_name: 'target_entity_type', field_value: updateData.targetEntityType });
    if (updateData.targetFieldName !== undefined) propertyUpdates.push({ field_name: 'target_field_name', field_value: updateData.targetFieldName });
    if (updateData.errorMessage !== undefined) propertyUpdates.push({ field_name: 'error_message', field_value: updateData.errorMessage });
    if (updateData.minValue !== undefined) propertyUpdates.push({ field_name: 'min_value', field_value: updateData.minValue.toString() });
    if (updateData.maxValue !== undefined) propertyUpdates.push({ field_name: 'max_value', field_value: updateData.maxValue.toString() });
    if (updateData.regexPattern !== undefined) propertyUpdates.push({ field_name: 'regex_pattern', field_value: updateData.regexPattern });
    if (updateData.ruleExpression !== undefined) propertyUpdates.push({ field_name: 'rule_expression', field_value: updateData.ruleExpression });

    for (const update of propertyUpdates) {
      await supabase
        .from('core_dynamic_data')
        .upsert({
          entity_id: id,
          field_name: update.field_name,
          field_value: update.field_value,
          field_type: ['min_value', 'max_value'].includes(update.field_name) ? 'number' : 'text'
        });
    }

    console.log(`✅ Validation rule updated: ${id}`);

    return NextResponse.json({
      success: true,
      message: 'Validation rule updated successfully'
    });

  } catch (error) {
    console.error('Validation rule PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/validation-rules
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Validation rule ID is required' },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    // Soft delete validation rule (set is_active = false)
    const { error } = await supabase
      .from('core_entities')
      .update({ is_active: false })
      .eq('id', id)
      .eq('entity_type', 'validation_rule');

    if (error) {
      console.error('Error deleting validation rule:', error);
      return NextResponse.json(
        { error: 'Failed to delete validation rule' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Validation rule deleted successfully'
    });

  } catch (error) {
    console.error('Validation rule DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}