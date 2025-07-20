/**
 * HERA Digital Accountant - Document Management API
 * 
 * Handles document upload, AI processing, and management
 * Following Purchase Order API patterns exactly
 * 
 * Uses HERA Universal Architecture:
 * - core_entities: Document records
 * - core_dynamic_data: Document properties and AI results
 * - core_relationships: Document-to-transaction links
 * - universal_transactions: Financial transactions
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

// TypeScript interfaces
interface DocumentCreateRequest {
  organizationId: string;
  documentType: 'invoice' | 'receipt' | 'statement' | 'contract' | 'purchase_order' | 'goods_receipt';
  fileName: string;
  fileSize: number;
  fileUrl?: string;
  mimeType: string;
  metadata?: {
    vendorName?: string;
    documentNumber?: string;
    documentDate?: string;
    totalAmount?: number;
    extractedText?: string;
  };
  aiProcessingEnabled?: boolean;
  aiConfidenceThreshold?: number;
}

interface DocumentResponse {
  id: string;
  documentNumber: string;
  documentType: string;
  fileName: string;
  status: string;
  aiConfidence?: number;
  processingStatus?: string;
  extractedData?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// GET /api/digital-accountant/documents
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const documentType = searchParams.get('documentType');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    if (!organizationId || organizationId === 'null' || organizationId === 'undefined') {
      return NextResponse.json(
        { error: 'Valid organizationId is required', success: false },
        { status: 400 }
      );
    }

    console.log('📄 Fetching documents for organization:', organizationId);

    // Build query for digital documents
    let query = supabase
      .from('core_entities')
      .select(`
        *,
        core_dynamic_data!inner(field_name, field_value, field_type)
      `, { count: 'exact' })
      .eq('organization_id', organizationId)
      .eq('entity_type', 'digital_document')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters using dynamic data
    if (documentType) {
      // This would require a more complex query to filter by dynamic data
      // For now, we'll filter in memory after fetch
    }

    const { data: documents, error, count } = await query;

    if (error) {
      console.error('❌ Error fetching documents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch documents', success: false },
        { status: 500 }
      );
    }

    // Transform entities to document format
    const transformedDocuments = (documents || []).map(doc => {
      // Convert dynamic data array to object
      const dynamicData = (doc.core_dynamic_data || []).reduce((acc: any, field: any) => {
        acc[field.field_name] = field.field_value;
        return acc;
      }, {});

      // Apply document type filter if needed
      if (documentType && dynamicData.document_type !== documentType) {
        return null;
      }

      // Apply status filter if needed
      if (status && dynamicData.processing_status !== status) {
        return null;
      }

      return {
        id: doc.id,
        documentNumber: doc.entity_code,
        documentType: dynamicData.document_type || 'unknown',
        fileName: dynamicData.file_name || '',
        fileSize: parseInt(dynamicData.file_size || '0'),
        status: dynamicData.processing_status || 'uploaded',
        aiConfidence: parseFloat(dynamicData.ai_confidence_score || '0'),
        processingStatus: dynamicData.processing_status,
        extractedData: dynamicData.extracted_data ? JSON.parse(dynamicData.extracted_data) : null,
        vendorName: dynamicData.vendor_name,
        documentDate: dynamicData.document_date,
        totalAmount: parseFloat(dynamicData.total_amount || '0'),
        createdAt: doc.created_at,
        updatedAt: doc.updated_at
      };
    }).filter(Boolean);

    console.log(`✅ Found ${transformedDocuments.length} documents`);

    return NextResponse.json({
      data: transformedDocuments,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      success: true
    });

  } catch (error) {
    console.error('❌ Digital Accountant Document GET error:', error);
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

// POST /api/digital-accountant/documents
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body: DocumentCreateRequest = await request.json();

    console.log('📄 Creating digital document:', JSON.stringify(body, null, 2));

    // Validate request
    if (!body.organizationId || !body.documentType || !body.fileName) {
      return NextResponse.json(
        { 
          error: 'Missing required fields: organizationId, documentType, fileName',
          success: false
        },
        { status: 400 }
      );
    }

    // Generate document number
    const timestamp = Date.now();
    const documentNumber = `DOC-${body.documentType.toUpperCase()}-${timestamp}`;

    console.log('📋 Generated document number:', documentNumber);

    // Create document entity
    const { data: documentEntity, error: entityError } = await supabase
      .from('core_entities')
      .insert({
        organization_id: body.organizationId,
        entity_type: 'digital_document',
        entity_name: `Document: ${body.fileName}`,
        entity_code: documentNumber,
        is_active: true
      })
      .select()
      .single();

    if (entityError) {
      console.error('❌ Error creating document entity:', entityError);
      return NextResponse.json(
        { 
          error: 'Failed to create document entity',
          details: entityError,
          success: false
        },
        { status: 500 }
      );
    }

    console.log('✅ Document entity created:', documentEntity.id);

    // Prepare dynamic data fields
    const dynamicDataFields = [
      { entity_id: documentEntity.id, field_name: 'document_type', field_value: body.documentType, field_type: 'text' },
      { entity_id: documentEntity.id, field_name: 'file_name', field_value: body.fileName, field_type: 'text' },
      { entity_id: documentEntity.id, field_name: 'file_size', field_value: body.fileSize.toString(), field_type: 'number' },
      { entity_id: documentEntity.id, field_name: 'mime_type', field_value: body.mimeType, field_type: 'text' },
      { entity_id: documentEntity.id, field_name: 'processing_status', field_value: 'uploaded', field_type: 'text' },
      { entity_id: documentEntity.id, field_name: 'ai_enabled', field_value: (body.aiProcessingEnabled || true).toString(), field_type: 'boolean' },
      { entity_id: documentEntity.id, field_name: 'ai_confidence_threshold', field_value: (body.aiConfidenceThreshold || 0.75).toString(), field_type: 'decimal' }
    ];

    // Add optional metadata fields
    if (body.fileUrl) {
      dynamicDataFields.push({
        entity_id: documentEntity.id,
        field_name: 'file_url',
        field_value: body.fileUrl,
        field_type: 'text'
      });
    }

    if (body.metadata) {
      if (body.metadata.vendorName) {
        dynamicDataFields.push({
          entity_id: documentEntity.id,
          field_name: 'vendor_name',
          field_value: body.metadata.vendorName,
          field_type: 'text'
        });
      }
      if (body.metadata.documentNumber) {
        dynamicDataFields.push({
          entity_id: documentEntity.id,
          field_name: 'source_document_number',
          field_value: body.metadata.documentNumber,
          field_type: 'text'
        });
      }
      if (body.metadata.documentDate) {
        dynamicDataFields.push({
          entity_id: documentEntity.id,
          field_name: 'document_date',
          field_value: body.metadata.documentDate,
          field_type: 'date'
        });
      }
      if (body.metadata.totalAmount) {
        dynamicDataFields.push({
          entity_id: documentEntity.id,
          field_name: 'total_amount',
          field_value: body.metadata.totalAmount.toString(),
          field_type: 'decimal'
        });
      }
      if (body.metadata.extractedText) {
        dynamicDataFields.push({
          entity_id: documentEntity.id,
          field_name: 'extracted_text',
          field_value: body.metadata.extractedText,
          field_type: 'text'
        });
      }
    }

    // Insert all dynamic data
    const { error: dataError } = await supabase
      .from('core_dynamic_data')
      .insert(dynamicDataFields);

    if (dataError) {
      console.error('❌ Error creating document data:', dataError);
      // Rollback entity creation
      await supabase
        .from('core_entities')
        .delete()
        .eq('id', documentEntity.id);
      
      return NextResponse.json(
        { 
          error: 'Failed to create document data',
          details: dataError,
          success: false
        },
        { status: 500 }
      );
    }

    console.log('✅ Document data created successfully');

    // If AI processing is enabled, trigger AI analysis
    if (body.aiProcessingEnabled !== false) {
      // Call create_ai_analysis database function
      const { data: aiResult, error: aiError } = await supabase
        .rpc('create_ai_analysis', {
          p_organization_id: body.organizationId,
          p_document_id: documentEntity.id,
          p_analysis_type: 'document_extraction',
          p_confidence_threshold: body.aiConfidenceThreshold || 0.75
        });

      if (aiError) {
        console.warn('⚠️ AI analysis creation failed:', aiError);
        // Don't fail the entire request, just log the warning
      } else {
        console.log('🤖 AI analysis triggered:', aiResult);
        
        // Update processing status
        await supabase
          .from('core_dynamic_data')
          .update({ field_value: 'ai_processing' })
          .eq('entity_id', documentEntity.id)
          .eq('field_name', 'processing_status');
      }
    }

    // Return the created document
    const response: DocumentResponse = {
      id: documentEntity.id,
      documentNumber: documentNumber,
      documentType: body.documentType,
      fileName: body.fileName,
      status: 'uploaded',
      processingStatus: body.aiProcessingEnabled !== false ? 'ai_processing' : 'uploaded',
      createdAt: documentEntity.created_at,
      updatedAt: documentEntity.updated_at
    };

    console.log(`🎉 Document created successfully: ${documentNumber}`);

    return NextResponse.json({
      data: response,
      success: true,
      message: `Document created successfully${body.aiProcessingEnabled !== false ? ' and queued for AI processing' : ''}`
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Digital Accountant Document POST error:', error);
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