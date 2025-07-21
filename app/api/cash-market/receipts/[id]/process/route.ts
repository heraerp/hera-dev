/**
 * HERA Universal - Receipt Processing API Route
 * 
 * Next.js 15 App Router API Route Handler
 * Processes receipts using AI to extract transaction data
 * Updates receipt status and creates transactions if confidence is high enough
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Admin client for demo/testing purposes
const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

// Mock AI processing function (replace with actual AI service)
function mockAIProcessing(imageUrl: string): Promise<any> {
  return new Promise((resolve) => {
    // Simulate AI processing delay
    setTimeout(() => {
      // Mock AI extraction results
      const mockResults = {
        vendor: 'Fresh Fish Market',
        amount: 145.80,
        date: new Date().toISOString(),
        items: [
          'Red Snapper - 2 lbs @ $18.50/lb',
          'Salmon - 1.5 lbs @ $22.50/lb',
          'Processing fee'
        ],
        confidence: 0.92,
        extractedText: 'FRESH FISH MARKET\n123 Harbor St\nRed Snapper 2 lbs $37.00\nSalmon 1.5 lbs $33.75\nProcessing $5.05\nSubtotal $75.80\nTax $6.00\nTotal $145.80\nCash Payment',
        currency: 'USD',
        category: 'Food & Beverage',
        paymentMethod: 'Cash',
        taxAmount: 6.00,
        subtotal: 139.80
      };
      
      resolve(mockResults);
    }, 2000);
  });
}

// POST /api/cash-market/receipts/[id]/process
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { organizationId, forceReprocess = false } = body;
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    // Verify receipt exists and belongs to organization
    const { data: entity, error: entityError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('id', params.id)
      .eq('organization_id', organizationId)
      .eq('entity_type', 'cash_market_receipt')
      .single();

    if (entityError || !entity) {
      return NextResponse.json(
        { error: 'Receipt not found' },
        { status: 404 }
      );
    }

    // Get current receipt data
    const { data: dynamicData } = await supabase
      .from('core_dynamic_data')
      .select('field_name, field_value, field_type')
      .eq('entity_id', params.id);

    const receiptData = (dynamicData || []).reduce((acc, item) => {
      let value = item.field_value;
      if (item.field_type === 'json' && value) {
        try {
          value = JSON.parse(value);
        } catch {
          // Keep as string if parse fails
        }
      }
      acc[item.field_name] = value;
      return acc;
    }, {} as Record<string, any>);

    // Check if already processed and not forcing reprocess
    if (receiptData.processingStatus === 'completed' && !forceReprocess) {
      return NextResponse.json(
        { error: 'Receipt already processed. Use forceReprocess=true to reprocess.' },
        { status: 400 }
      );
    }

    // Update status to processing
    await supabase
      .from('core_dynamic_data')
      .upsert({
        entity_id: params.id,
        field_name: 'processingStatus',
        field_value: 'processing',
        field_type: 'text',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'entity_id,field_name'
      });

    try {
      // Perform AI processing (mock for now)
      const aiResults = await mockAIProcessing(receiptData.imageUrl);
      
      // Update receipt with AI processing results
      const aiProcessingData = {
        ...aiResults,
        processedAt: new Date().toISOString(),
        processingVersion: '1.0'
      };

      // Update receipt status and AI data
      await supabase
        .from('core_dynamic_data')
        .upsert([
          {
            entity_id: params.id,
            field_name: 'processingStatus',
            field_value: aiResults.confidence > 0.8 ? 'completed' : 'needs_review',
            field_type: 'text',
            updated_at: new Date().toISOString()
          },
          {
            entity_id: params.id,
            field_name: 'aiProcessingData',
            field_value: JSON.stringify(aiProcessingData),
            field_type: 'json',
            updated_at: new Date().toISOString()
          }
        ], {
          onConflict: 'entity_id,field_name'
        });

      // Try to find matching vendor by name
      let vendorId = receiptData.vendorId;
      if (!vendorId && aiResults.vendor) {
        console.log('🔍 Looking for vendor:', aiResults.vendor);
        
        // Try exact name match first
        let { data: vendorMatch, error: vendorError } = await supabase
          .from('core_entities')
          .select('id, entity_name')
          .eq('organization_id', organizationId)
          .eq('entity_type', 'cash_market_vendor')
          .eq('entity_name', aiResults.vendor);
        
        // If no exact match, try fuzzy match
        if (!vendorMatch || vendorMatch.length === 0) {
          const result = await supabase
            .from('core_entities')
            .select('id, entity_name')
            .eq('organization_id', organizationId)
            .eq('entity_type', 'cash_market_vendor')
            .ilike('entity_name', `%${aiResults.vendor}%`);
          vendorMatch = result.data;
          vendorError = result.error;
        }
        
        console.log('🔍 Vendor lookup result:', vendorMatch, vendorError);
        
        if (vendorMatch && vendorMatch.length > 0) {
          vendorId = vendorMatch[0].id;
          console.log('✅ Found vendor:', vendorId);
          
          // Update receipt with vendor ID
          await supabase
            .from('core_dynamic_data')
            .upsert({
              entity_id: params.id,
              field_name: 'vendorId',
              field_value: vendorId,
              field_type: 'text',
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'entity_id,field_name'
            });
        }
      }

      // Auto-create transaction if confidence is high enough and vendor is found
      let autoCreatedTransaction = null;
      if (aiResults.confidence > 0.85 && vendorId && aiResults.amount > 0) {
        const transactionNumber = `CM-AUTO-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        
        const transactionData = {
          vendorId: vendorId,
          receiptId: params.id,
          description: `Auto-processed: ${aiResults.vendor} - Cash Market Purchase`,
          category: aiResults.category || 'Food & Beverage',
          items: aiResults.items || [],
          submittedBy: 'AI Processing System',
          aiConfidence: aiResults.confidence,
          receiptImageUrl: receiptData.imageUrl,
          notes: `Auto-generated from receipt processing. Confidence: ${(aiResults.confidence * 100).toFixed(1)}%`,
          aiProcessingData: aiProcessingData,
          timestamp: new Date().toISOString()
        };

        // Create transaction
        const { data: transaction, error: transactionError } = await supabase
          .from('universal_transactions')
          .insert({
            organization_id: organizationId,
            transaction_type: 'cash_market_purchase',
            transaction_subtype: 'expense',
            transaction_number: transactionNumber,
            transaction_date: aiResults.date || new Date().toISOString(),
            total_amount: aiResults.amount,
            currency: aiResults.currency || 'USD',
            transaction_status: 'approved',
            workflow_status: 'auto_approved',
            requires_approval: false,
            is_financial: true,
            transaction_data: JSON.stringify(transactionData),
            created_by: 'system'
          })
          .select()
          .single();

        if (!transactionError && transaction) {
          // Create transaction-receipt relationship
          await supabase
            .from('core_relationships')
            .insert({
              organization_id: organizationId,
              relationship_type: 'transaction_receipt',
              relationship_name: 'Auto-processed Receipt',
              parent_entity_id: transaction.id,
              child_entity_id: params.id,
              relationship_data: JSON.stringify({
                transactionNumber: transactionNumber,
                autoCreated: true,
                confidence: aiResults.confidence
              }),
              is_active: true
            });

          autoCreatedTransaction = {
            id: transaction.id,
            number: transactionNumber,
            amount: aiResults.amount,
            status: 'approved'
          };
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          receiptId: params.id,
          processingStatus: aiResults.confidence > 0.8 ? 'completed' : 'needs_review',
          aiResults: aiProcessingData,
          autoCreatedTransaction,
          confidence: aiResults.confidence,
          recommendedActions: aiResults.confidence < 0.8 ? [
            'Manual review recommended',
            'Verify extracted amounts',
            'Confirm vendor information'
          ] : [
            'Processing completed successfully',
            'Transaction auto-created',
            'No manual review needed'
          ]
        },
        message: autoCreatedTransaction 
          ? 'Receipt processed successfully and transaction auto-created'
          : aiResults.confidence > 0.8 
            ? 'Receipt processed successfully but no transaction created (missing vendor)'
            : 'Receipt processed but needs manual review'
      });

    } catch (processingError) {
      console.error('AI processing error:', processingError);
      
      // Update status to error
      await supabase
        .from('core_dynamic_data')
        .upsert({
          entity_id: params.id,
          field_name: 'processingStatus',
          field_value: 'error',
          field_type: 'text',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'entity_id,field_name'
        });

      return NextResponse.json(
        { error: 'Failed to process receipt with AI' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Receipt processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}