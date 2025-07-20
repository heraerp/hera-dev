/**
 * HERA Digital Accountant - Document Detail API
 * 
 * Handles individual document operations: GET, PUT (update), DELETE
 * Following Purchase Order API patterns exactly
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Admin client for bypassing RLS during development
const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

interface DocumentUpdateRequest {
  status?: string;
  extractedData?: Record<string, any>;
  aiConfidenceScore?: number;
  validationResults?: Record<string, any>;
  metadata?: Record<string, any>;
}

// GET /api/digital-accountant/documents/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getAdminClient();
    const documentId = params.id;

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required', success: false },
        { status: 400 }
      );
    }

    console.log('📄 Fetching document details:', documentId);

    // Get document entity with all dynamic data
    const { data: document, error } = await supabase
      .from('core_entities')
      .select(`
        *,
        core_dynamic_data(field_name, field_value, field_type)
      `)
      .eq('id', documentId)
      .eq('entity_type', 'digital_document')
      .single();

    if (error || !document) {
      console.error('❌ Document not found:', error);
      return NextResponse.json(
        { error: 'Document not found', success: false },
        { status: 404 }
      );
    }

    // Get AI analysis if exists
    const { data: aiAnalysis } = await supabase
      .from('core_entities')
      .select(`
        *,
        core_dynamic_data(field_name, field_value, field_type)
      `)
      .eq('entity_type', 'ai_analysis')
      .eq('organization_id', document.organization_id)
      .filter('core_dynamic_data.field_name', 'eq', 'document_id')
      .filter('core_dynamic_data.field_value', 'eq', documentId)
      .single();

    // Get related transactions (if document has been linked)
    const { data: relationships } = await supabase
      .from('core_relationships')
      .select(`
        *,
        parent_entity:parent_entity_id(id, entity_type, entity_code, entity_name),
        child_entity:child_entity_id(id, entity_type, entity_code, entity_name)
      `)
      .or(`parent_entity_id.eq.${documentId},child_entity_id.eq.${documentId}`)
      .eq('is_active', true);

    // Transform data
    const dynamicData = (document.core_dynamic_data || []).reduce((acc: any, field: any) => {
      acc[field.field_name] = field.field_value;
      return acc;
    }, {});

    const aiData = aiAnalysis ? (aiAnalysis.core_dynamic_data || []).reduce((acc: any, field: any) => {
      acc[field.field_name] = field.field_value;
      return acc;
    }, {}) : null;

    const response = {
      id: document.id,
      organizationId: document.organization_id,
      documentNumber: document.entity_code,
      documentName: document.entity_name,
      documentType: dynamicData.document_type,
      fileName: dynamicData.file_name,
      fileSize: parseInt(dynamicData.file_size || '0'),
      fileUrl: dynamicData.file_url,
      mimeType: dynamicData.mime_type,
      status: dynamicData.processing_status || 'uploaded',
      vendorName: dynamicData.vendor_name,
      documentDate: dynamicData.document_date,
      totalAmount: parseFloat(dynamicData.total_amount || '0'),
      extractedText: dynamicData.extracted_text,
      extractedData: dynamicData.extracted_data ? JSON.parse(dynamicData.extracted_data) : null,
      aiAnalysis: aiData ? {
        id: aiAnalysis.id,
        confidenceScore: parseFloat(aiData.confidence_score || '0'),
        extractedFields: aiData.extracted_fields ? JSON.parse(aiData.extracted_fields) : null,
        suggestedActions: aiData.suggested_actions ? JSON.parse(aiData.suggested_actions) : null,
        validationResults: aiData.validation_results ? JSON.parse(aiData.validation_results) : null,
        processedAt: aiData.processed_at
      } : null,
      relationships: (relationships || []).map(rel => ({
        id: rel.id,
        type: rel.relationship_type,
        relatedEntity: rel.parent_entity_id === documentId ? rel.child_entity : rel.parent_entity,
        confidence: rel.relationship_strength || 0,
        metadata: rel.metadata
      })),
      createdAt: document.created_at,
      updatedAt: document.updated_at
    };

    console.log('✅ Document details retrieved successfully');

    return NextResponse.json({
      data: response,
      success: true
    });

  } catch (error) {
    console.error('❌ Document GET error:', error);
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

// PUT /api/digital-accountant/documents/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getAdminClient();
    const documentId = params.id;
    const body: DocumentUpdateRequest = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required', success: false },
        { status: 400 }
      );
    }

    console.log('📝 Updating document:', documentId, body);

    // Verify document exists
    const { data: document, error: fetchError } = await supabase
      .from('core_entities')
      .select('id, organization_id')
      .eq('id', documentId)
      .eq('entity_type', 'digital_document')
      .single();

    if (fetchError || !document) {
      return NextResponse.json(
        { error: 'Document not found', success: false },
        { status: 404 }
      );
    }

    // Update dynamic data fields
    const updates = [];

    if (body.status) {
      updates.push({
        entity_id: documentId,
        field_name: 'processing_status',
        field_value: body.status
      });
    }

    if (body.extractedData) {
      updates.push({
        entity_id: documentId,
        field_name: 'extracted_data',
        field_value: JSON.stringify(body.extractedData)
      });
    }

    if (body.aiConfidenceScore !== undefined) {
      updates.push({
        entity_id: documentId,
        field_name: 'ai_confidence_score',
        field_value: body.aiConfidenceScore.toString()
      });
    }

    if (body.validationResults) {
      updates.push({
        entity_id: documentId,
        field_name: 'validation_results',
        field_value: JSON.stringify(body.validationResults)
      });
    }

    // Update each field
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('core_dynamic_data')
        .upsert({
          ...update,
          field_type: update.field_name.includes('score') ? 'decimal' : 
                      update.field_name.includes('data') || update.field_name.includes('results') ? 'json' : 
                      'text',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'entity_id,field_name'
        });

      if (updateError) {
        console.error(`❌ Error updating field ${update.field_name}:`, updateError);
      }
    }

    // Update entity timestamp
    await supabase
      .from('core_entities')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', documentId);

    console.log('✅ Document updated successfully');

    return NextResponse.json({
      success: true,
      message: 'Document updated successfully',
      documentId: documentId
    });

  } catch (error) {
    console.error('❌ Document PUT error:', error);
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

// DELETE /api/digital-accountant/documents/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getAdminClient();
    const documentId = params.id;

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required', success: false },
        { status: 400 }
      );
    }

    console.log('🗑️ Soft deleting document:', documentId);

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('core_entities')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId)
      .eq('entity_type', 'digital_document');

    if (error) {
      console.error('❌ Error deleting document:', error);
      return NextResponse.json(
        { 
          error: 'Failed to delete document',
          details: error,
          success: false
        },
        { status: 500 }
      );
    }

    // Also deactivate any relationships
    await supabase
      .from('core_relationships')
      .update({ is_active: false })
      .or(`parent_entity_id.eq.${documentId},child_entity_id.eq.${documentId}`);

    console.log('✅ Document deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('❌ Document DELETE error:', error);
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