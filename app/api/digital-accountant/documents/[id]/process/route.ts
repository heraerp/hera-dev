/**
 * HERA Digital Accountant - Document AI Processing API
 * 
 * Triggers AI analysis for documents using database functions
 * Following Purchase Order API patterns
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

interface ProcessingRequest {
  analysisType?: 'document_extraction' | 'invoice_matching' | 'expense_categorization';
  confidenceThreshold?: number;
  extractFields?: string[];
  validationRules?: string[];
  autoPost?: boolean;
}

// POST /api/digital-accountant/documents/[id]/process
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getAdminClient();
    const documentId = params.id;
    const body: ProcessingRequest = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required', success: false },
        { status: 400 }
      );
    }

    console.log('🤖 Triggering AI processing for document:', documentId);

    // Get document details
    const { data: document, error: fetchError } = await supabase
      .from('core_entities')
      .select(`
        *,
        core_dynamic_data(field_name, field_value)
      `)
      .eq('id', documentId)
      .eq('entity_type', 'digital_document')
      .single();

    if (fetchError || !document) {
      return NextResponse.json(
        { error: 'Document not found', success: false },
        { status: 404 }
      );
    }

    // Extract document metadata
    const dynamicData = (document.core_dynamic_data || []).reduce((acc: any, field: any) => {
      acc[field.field_name] = field.field_value;
      return acc;
    }, {});

    // Call create_ai_analysis database function
    const { data: analysisResult, error: analysisError } = await supabase
      .rpc('create_ai_analysis', {
        p_organization_id: document.organization_id,
        p_document_id: documentId,
        p_analysis_type: body.analysisType || 'document_extraction',
        p_confidence_threshold: body.confidenceThreshold || 0.75
      });

    if (analysisError) {
      console.error('❌ AI analysis failed:', analysisError);
      return NextResponse.json(
        { 
          error: 'AI analysis failed',
          details: analysisError,
          success: false
        },
        { status: 500 }
      );
    }

    console.log('✅ AI analysis created:', analysisResult);

    // Update document status
    await supabase
      .from('core_dynamic_data')
      .upsert({
        entity_id: documentId,
        field_name: 'processing_status',
        field_value: 'ai_analyzing',
        field_type: 'text',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'entity_id,field_name'
      });

    // Simulate AI processing (in production, this would call actual AI service)
    const mockAIResults = await simulateAIProcessing(dynamicData, body);

    // Store AI results
    const aiResultsToStore = [
      {
        entity_id: documentId,
        field_name: 'ai_confidence_score',
        field_value: mockAIResults.confidenceScore.toString(),
        field_type: 'decimal'
      },
      {
        entity_id: documentId,
        field_name: 'extracted_data',
        field_value: JSON.stringify(mockAIResults.extractedData),
        field_type: 'json'
      },
      {
        entity_id: documentId,
        field_name: 'processing_status',
        field_value: mockAIResults.confidenceScore >= (body.confidenceThreshold || 0.75) ? 'ai_processed' : 'review_required',
        field_type: 'text'
      }
    ];

    const { error: storeError } = await supabase
      .from('core_dynamic_data')
      .upsert(aiResultsToStore, {
        onConflict: 'entity_id,field_name'
      });

    if (storeError) {
      console.error('❌ Error storing AI results:', storeError);
    }

    // If high confidence and auto-post enabled, trigger relationship detection
    if (mockAIResults.confidenceScore >= 0.95 && body.autoPost) {
      // Trigger auto-relationship detection
      if (dynamicData.document_type === 'invoice') {
        await triggerInvoiceMatching(supabase, documentId, document.organization_id, mockAIResults.extractedData);
      }
    }

    console.log('🎉 AI processing completed successfully');

    return NextResponse.json({
      data: {
        analysisId: analysisResult,
        confidenceScore: mockAIResults.confidenceScore,
        extractedData: mockAIResults.extractedData,
        suggestedActions: mockAIResults.suggestedActions,
        processingStatus: mockAIResults.confidenceScore >= (body.confidenceThreshold || 0.75) ? 'ai_processed' : 'review_required',
        requiresReview: mockAIResults.confidenceScore < (body.confidenceThreshold || 0.75)
      },
      success: true,
      message: 'AI analysis completed successfully'
    });

  } catch (error) {
    console.error('❌ Document processing error:', error);
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

// Simulate AI processing (in production, replace with actual AI service)
async function simulateAIProcessing(documentData: any, options: ProcessingRequest) {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const documentType = documentData.document_type;
  const vendorName = documentData.vendor_name || '';
  const totalAmount = parseFloat(documentData.total_amount || '0');

  let extractedData: any = {};
  let confidenceScore = 0.85;
  let suggestedActions: string[] = [];

  // Simulate extraction based on document type
  switch (documentType) {
    case 'invoice':
      extractedData = {
        invoiceNumber: `INV-${Math.floor(Math.random() * 100000)}`,
        vendorName: vendorName || 'Fresh Foods Co.',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        totalAmount: totalAmount || Math.floor(Math.random() * 1000) + 100,
        taxAmount: totalAmount * 0.08,
        lineItems: [
          {
            description: 'Fresh Vegetables',
            quantity: 10,
            unitPrice: totalAmount / 10,
            amount: totalAmount
          }
        ]
      };
      confidenceScore = 0.92;
      suggestedActions = ['Match with purchase order', 'Validate three-way match', 'Schedule payment'];
      break;

    case 'receipt':
      extractedData = {
        receiptNumber: `REC-${Math.floor(Math.random() * 100000)}`,
        vendorName: vendorName || 'Office Supplies Inc.',
        receiptDate: new Date().toISOString().split('T')[0],
        totalAmount: totalAmount || Math.floor(Math.random() * 500) + 50,
        paymentMethod: 'Credit Card',
        items: ['Office supplies', 'Printer paper']
      };
      confidenceScore = 0.88;
      suggestedActions = ['Categorize expense', 'Create journal entry'];
      break;

    case 'statement':
      extractedData = {
        statementPeriod: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
        bankName: 'First National Bank',
        accountNumber: '****1234',
        openingBalance: Math.floor(Math.random() * 10000) + 5000,
        closingBalance: Math.floor(Math.random() * 10000) + 5000,
        totalDebits: Math.floor(Math.random() * 5000),
        totalCredits: Math.floor(Math.random() * 5000)
      };
      confidenceScore = 0.95;
      suggestedActions = ['Reconcile transactions', 'Import bank feeds'];
      break;

    default:
      extractedData = {
        documentType: documentType,
        extractedText: documentData.extracted_text || 'Sample extracted text',
        metadata: {
          fileName: documentData.file_name,
          fileSize: documentData.file_size
        }
      };
      confidenceScore = 0.75;
      suggestedActions = ['Manual review required'];
  }

  // Apply confidence threshold adjustment
  if (options.confidenceThreshold && confidenceScore < options.confidenceThreshold) {
    suggestedActions.unshift('Low confidence - manual review required');
  }

  return {
    extractedData,
    confidenceScore,
    suggestedActions,
    processingTime: 1500,
    aiModel: 'hera-document-ai-v1'
  };
}

// Trigger invoice matching for high-confidence invoices
async function triggerInvoiceMatching(
  supabase: any,
  documentId: string,
  organizationId: string,
  extractedData: any
) {
  try {
    // Create a purchase_invoice transaction from the document
    const { data: invoice, error } = await supabase
      .from('universal_transactions')
      .insert({
        organization_id: organizationId,
        transaction_type: 'purchase_invoice',
        transaction_number: extractedData.invoiceNumber || `INV-AUTO-${Date.now()}`,
        transaction_date: extractedData.invoiceDate || new Date().toISOString().split('T')[0],
        total_amount: extractedData.totalAmount || 0,
        currency: 'USD',
        transaction_status: 'pending_validation',
        transaction_data: {
          source_document_id: documentId,
          extracted_data: extractedData,
          auto_created: true
        }
      })
      .select()
      .single();

    if (!error && invoice) {
      console.log('✅ Invoice transaction created for matching:', invoice.id);
      
      // The auto_detect_relationships trigger will handle the matching
      // Link document to invoice
      await supabase
        .from('core_relationships')
        .insert({
          organization_id: organizationId,
          relationship_type: 'document_to_transaction',
          relationship_name: 'Document source for invoice',
          parent_entity_id: documentId,
          child_entity_id: invoice.id,
          is_active: true,
          created_by: 'system_ai_processing'
        });
    }
  } catch (error) {
    console.error('⚠️ Invoice matching failed:', error);
  }
}