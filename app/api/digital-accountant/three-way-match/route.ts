/**
 * HERA Digital Accountant - Three-Way Match Validation API
 * 
 * Manages PO → GR → Invoice validation with variance analysis
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
interface ThreeWayMatchResult {
  matchId: string;
  invoiceId: string;
  matchStatus: 'PASSED' | 'WARNING' | 'FAILED';
  matchChain: {
    purchaseOrder: {
      id: string;
      number: string;
      amount: number;
      date: string;
    };
    goodsReceipt: {
      id: string;
      number: string;
      amount: number;
      date: string;
    };
    invoice: {
      id: string;
      number: string;
      amount: number;
      date: string;
    };
  };
  variances: {
    poToGr: {
      amount: number;
      percentage: number;
      withinTolerance: boolean;
    };
    grToInvoice: {
      amount: number;
      percentage: number;
      withinTolerance: boolean;
    };
    poToInvoice: {
      amount: number;
      percentage: number;
      withinTolerance: boolean;
    };
  };
  issues: string[];
  recommendations: string[];
  validatedAt: string;
}

// GET /api/digital-accountant/three-way-match/pending
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    if (!organizationId || organizationId === 'null' || organizationId === 'undefined') {
      return NextResponse.json(
        { error: 'Valid organizationId is required', success: false },
        { status: 400 }
      );
    }

    console.log('🔍 Fetching invoices pending three-way match validation:', organizationId);

    // Find invoices that have GR relationships but haven't been validated yet
    const { data: pendingInvoices, error, count } = await supabase
      .from('universal_transactions')
      .select(`
        *,
        gr_relationship:core_relationships!child_entity_id(
          id,
          parent_entity_id,
          metadata,
          parent_entity:core_entities!parent_entity_id(
            id,
            entity_type,
            entity_code
          )
        ),
        validation_result:core_entities!inner(
          id,
          entity_type,
          entity_code,
          core_dynamic_data!inner(field_name, field_value)
        )
      `, { count: 'exact' })
      .eq('organization_id', organizationId)
      .eq('transaction_type', 'purchase_invoice')
      .in('transaction_status', ['pending_validation', 'validation_required'])
      .order('transaction_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Error fetching pending invoices:', error);
      return NextResponse.json(
        { error: 'Failed to fetch pending invoices', success: false },
        { status: 500 }
      );
    }

    // Filter and transform to only include invoices with proper chains
    const transformedInvoices = [];

    for (const invoice of (pendingInvoices || [])) {
      // Check if invoice has a GR relationship
      const grRelationship = invoice.gr_relationship?.find(
        (rel: any) => rel.parent_entity?.entity_type === 'goods_receipt'
      );

      if (!grRelationship) continue;

      // Get the goods receipt details
      const { data: goodsReceipt } = await supabase
        .from('universal_transactions')
        .select('*')
        .eq('id', grRelationship.parent_entity_id)
        .single();

      if (!goodsReceipt) continue;

      // Check if GR has a PO relationship
      const { data: poRelationship } = await supabase
        .from('core_relationships')
        .select(`
          *,
          parent_entity:core_entities!parent_entity_id(
            id,
            entity_type,
            entity_code
          )
        `)
        .eq('child_entity_id', goodsReceipt.id)
        .eq('relationship_type', 'po_to_gr')
        .eq('is_active', true)
        .single();

      if (!poRelationship) continue;

      // Get the purchase order details
      const { data: purchaseOrder } = await supabase
        .from('universal_transactions')
        .select('*')
        .eq('id', poRelationship.parent_entity_id)
        .single();

      if (!purchaseOrder) continue;

      // Check if already validated
      const existingValidation = invoice.validation_result?.find(
        (result: any) => 
          result.entity_type === 'three_way_match_result' &&
          result.core_dynamic_data?.some((dd: any) => 
            dd.field_name === 'control_type' && dd.field_value === 'three_way_match'
          )
      );

      if (existingValidation) continue;

      transformedInvoices.push({
        id: invoice.id,
        invoiceNumber: invoice.transaction_number,
        invoiceDate: invoice.transaction_date,
        amount: invoice.total_amount,
        status: invoice.transaction_status,
        supplier: invoice.transaction_data?.supplier_name || 'Unknown',
        chain: {
          purchaseOrder: {
            id: purchaseOrder.id,
            number: purchaseOrder.transaction_number,
            amount: purchaseOrder.total_amount,
            date: purchaseOrder.transaction_date
          },
          goodsReceipt: {
            id: goodsReceipt.id,
            number: goodsReceipt.transaction_number,
            amount: goodsReceipt.total_amount,
            date: goodsReceipt.transaction_date
          }
        },
        relationships: {
          poToGr: {
            confidence: poRelationship.relationship_strength || 0,
            metadata: poRelationship.metadata
          },
          grToInvoice: {
            confidence: grRelationship.relationship_strength || 0,
            metadata: grRelationship.metadata
          }
        },
        createdAt: invoice.created_at
      });
    }

    console.log(`✅ Found ${transformedInvoices.length} invoices pending validation`);

    return NextResponse.json({
      data: transformedInvoices,
      pagination: {
        page,
        limit,
        total: transformedInvoices.length,
        totalPages: Math.ceil(transformedInvoices.length / limit)
      },
      success: true
    });

  } catch (error) {
    console.error('❌ Three-way match GET error:', error);
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

// POST /api/digital-accountant/three-way-match/validate/[invoiceId]
export async function POST(
  request: NextRequest,
  { params }: { params: { invoiceId: string } }
) {
  try {
    const supabase = getAdminClient();
    const invoiceId = params.invoiceId;

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invoice ID is required', success: false },
        { status: 400 }
      );
    }

    console.log('🔍 Triggering three-way match validation for invoice:', invoiceId);

    // Call the database function
    const { data: validationResult, error: validationError } = await supabase
      .rpc('validate_three_way_match', {
        invoice_id: invoiceId
      });

    if (validationError) {
      console.error('❌ Validation failed:', validationError);
      return NextResponse.json(
        { 
          error: 'Three-way match validation failed',
          details: validationError,
          success: false
        },
        { status: 500 }
      );
    }

    console.log('✅ Three-way match validation completed:', validationResult);

    // Parse the validation result
    const result = typeof validationResult === 'string' 
      ? JSON.parse(validationResult) 
      : validationResult;

    // Calculate detailed variances
    const variances = {
      poToGr: {
        amount: Math.abs((result.po_amount || 0) - (result.gr_amount || 0)),
        percentage: result.po_amount ? 
          (Math.abs((result.po_amount || 0) - (result.gr_amount || 0)) / result.po_amount * 100) : 0,
        withinTolerance: result.po_amount ? 
          (Math.abs((result.po_amount || 0) - (result.gr_amount || 0)) / result.po_amount) <= (result.variance_tolerance_percent / 100) : true
      },
      grToInvoice: {
        amount: Math.abs((result.gr_amount || 0) - (result.invoice_amount || 0)),
        percentage: result.gr_amount ? 
          (Math.abs((result.gr_amount || 0) - (result.invoice_amount || 0)) / result.gr_amount * 100) : 0,
        withinTolerance: result.gr_amount ? 
          (Math.abs((result.gr_amount || 0) - (result.invoice_amount || 0)) / result.gr_amount) <= (result.variance_tolerance_percent / 100) : true
      },
      poToInvoice: {
        amount: Math.abs((result.po_amount || 0) - (result.invoice_amount || 0)),
        percentage: result.po_amount ? 
          (Math.abs((result.po_amount || 0) - (result.invoice_amount || 0)) / result.po_amount * 100) : 0,
        withinTolerance: result.po_amount ? 
          (Math.abs((result.po_amount || 0) - (result.invoice_amount || 0)) / result.po_amount) <= (result.variance_tolerance_percent / 100) : true
      }
    };

    // Generate recommendations based on issues
    const recommendations = [];
    if (result.match_status === 'FAILED') {
      recommendations.push('Manual review required - significant variances detected');
      if (!variances.poToGr.withinTolerance) {
        recommendations.push('Verify goods receipt quantities match purchase order');
      }
      if (!variances.grToInvoice.withinTolerance) {
        recommendations.push('Contact supplier to clarify invoice discrepancies');
      }
    } else if (result.match_status === 'WARNING') {
      recommendations.push('Review variances before approval');
      recommendations.push('Consider updating tolerance thresholds if appropriate');
    } else {
      recommendations.push('Invoice validated successfully - ready for payment processing');
    }

    // Update invoice status based on validation
    const newStatus = result.match_status === 'PASSED' ? 'validated' : 
                     result.match_status === 'WARNING' ? 'review_required' : 
                     'validation_failed';

    await supabase
      .from('universal_transactions')
      .update({
        transaction_status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', invoiceId);

    // Format response
    const response: ThreeWayMatchResult = {
      matchId: result.control_entity_id || `TWM_${invoiceId}`,
      invoiceId: invoiceId,
      matchStatus: result.match_status,
      matchChain: {
        purchaseOrder: {
          id: result.po_id,
          number: `PO-${result.po_id?.slice(-6)}`,
          amount: result.po_amount || 0,
          date: 'N/A'
        },
        goodsReceipt: {
          id: result.gr_id,
          number: `GR-${result.gr_id?.slice(-6)}`,
          amount: result.gr_amount || 0,
          date: 'N/A'
        },
        invoice: {
          id: result.invoice_id,
          number: `INV-${result.invoice_id?.slice(-6)}`,
          amount: result.invoice_amount || 0,
          date: 'N/A'
        }
      },
      variances: variances,
      issues: result.issues || [],
      recommendations: recommendations,
      validatedAt: result.validated_at || new Date().toISOString()
    };

    return NextResponse.json({
      data: response,
      success: true,
      message: `Three-way match validation completed: ${result.match_status}`
    });

  } catch (error) {
    console.error('❌ Three-way match validation error:', error);
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