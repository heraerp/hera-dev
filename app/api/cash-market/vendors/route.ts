/**
 * HERA Universal - Cash Market Vendors API Routes
 * 
 * Next.js 15 App Router API Route Handler
 * Uses HERA's 5-table universal architecture:
 * - core_entities: Vendor records
 * - core_dynamic_data: Vendor custom fields (contact, rating, etc.)
 * - universal_transactions: Financial tracking
 * - core_relationships: Vendor relationships
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Admin client for demo/testing purposes
const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

// TypeScript interfaces
interface VendorRequest {
  organizationId: string;
  name: string;
  category: string;
  location: string;
  contact?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  priceRange?: 'budget' | 'moderate' | 'premium';
  specialties?: string[];
  paymentTerms?: string;
  notes?: string;
}

interface VendorResponse {
  id: string;
  name: string;
  code: string;
  category: string;
  location: string;
  contact?: any;
  rating?: number;
  totalTransactions?: number;
  totalSpent?: number;
  averageOrder?: number;
  reliability?: string;
  priceRange?: string;
  specialties?: string[];
  lastTransaction?: string;
  paymentTerms?: string;
  status: string;
  notes?: string;
  aiValidation?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// GET /api/cash-market/vendors
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient(); // Use admin client for demo
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    // CORE PATTERN: Query core_entities first
    let query = supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'cash_market_vendor')
      .order('entity_name', { ascending: true });

    // Apply filters if provided
    if (search) {
      query = query.ilike('entity_name', `%${search}%`);
    }

    const { data: entities, error } = await query;

    if (error) {
      console.error('Error fetching vendors:', error);
      return NextResponse.json(
        { error: 'Failed to fetch vendors' },
        { status: 500 }
      );
    }

    // CORE PATTERN: Get dynamic data if entities exist
    let dynamicData: any[] = [];
    const entityIds = entities?.map(e => e.id) || [];
    
    if (entityIds.length > 0) {
      const { data: dynamicDataResult } = await supabase
        .from('core_dynamic_data')
        .select('entity_id, field_name, field_value')
        .in('entity_id', entityIds);
      
      dynamicData = dynamicDataResult || [];
    }

    // CORE PATTERN: Group dynamic data by entity_id
    const dynamicDataMap = dynamicData.reduce((acc, item) => {
      if (!acc[item.entity_id]) {
        acc[item.entity_id] = {};
      }
      acc[item.entity_id][item.field_name] = item.field_value;
      return acc;
    }, {} as Record<string, Record<string, any>>);

    // Get transaction statistics for each vendor
    const transactionStats = entityIds.length > 0 ? await getVendorTransactionStats(supabase, entityIds, organizationId) : {};

    // CORE PATTERN: Combine entities with dynamic data
    const enrichedVendors: VendorResponse[] = (entities || []).map(entity => {
      const dynamicFields = dynamicDataMap[entity.id] || {};
      const stats = transactionStats[entity.id] || {};
      
      // Parse contact info if stored as JSON
      let contact = {};
      try {
        contact = dynamicFields.contact ? JSON.parse(dynamicFields.contact) : {};
      } catch {
        contact = {};
      }

      // Parse specialties if stored as JSON array
      let specialties: string[] = [];
      try {
        specialties = dynamicFields.specialties ? JSON.parse(dynamicFields.specialties) : [];
      } catch {
        specialties = [];
      }

      return {
        id: entity.id,
        name: entity.entity_name,
        code: entity.entity_code,
        category: dynamicFields.category || 'General',
        location: dynamicFields.location || '',
        contact,
        rating: parseFloat(dynamicFields.rating || '0'),
        totalTransactions: stats.totalTransactions || 0,
        totalSpent: stats.totalSpent || 0,
        averageOrder: stats.averageOrder || 0,
        reliability: dynamicFields.reliability || 'medium',
        priceRange: dynamicFields.priceRange || 'moderate',
        specialties,
        lastTransaction: stats.lastTransaction,
        paymentTerms: dynamicFields.paymentTerms || 'Cash on delivery',
        status: dynamicFields.status || 'active',
        notes: dynamicFields.notes || '',
        aiValidation: dynamicFields.aiValidation ? JSON.parse(dynamicFields.aiValidation) : null,
        isActive: entity.is_active,
        createdAt: entity.created_at,
        updatedAt: entity.updated_at
      };
    });

    // Apply category filter if specified
    const filteredVendors = category && category !== 'all' 
      ? enrichedVendors.filter(v => v.category.toLowerCase() === category.toLowerCase())
      : enrichedVendors;

    return NextResponse.json({
      data: filteredVendors,
      summary: {
        total: filteredVendors.length,
        active: filteredVendors.filter(v => v.status === 'active').length,
        categories: [...new Set(enrichedVendors.map(v => v.category))],
        totalSpent: filteredVendors.reduce((sum, v) => sum + (v.totalSpent || 0), 0)
      }
    });

  } catch (error) {
    console.error('Cash market vendors GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/cash-market/vendors
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient(); // Use admin client for demo
    const body: VendorRequest = await request.json();

    // Validate request
    if (!body.organizationId || !body.name || !body.category) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, name, category' },
        { status: 400 }
      );
    }

    // CORE PATTERN: Generate entity code
    const entityCode = `${body.name.toUpperCase().slice(0,8)}-${Math.random().toString(36).substring(2,6).toUpperCase()}-CMV`;
    const entityId = crypto.randomUUID();

    // CORE PATTERN: Create entity record
    const { data: entity, error: entityError } = await supabase
      .from('core_entities')
      .insert({
        id: entityId,
        organization_id: body.organizationId,
        entity_type: 'cash_market_vendor',
        entity_name: body.name,
        entity_code: entityCode,
        is_active: true
      })
      .select()
      .single();

    if (entityError) {
      console.error('Error creating vendor entity:', entityError);
      return NextResponse.json(
        { error: 'Failed to create vendor' },
        { status: 500 }
      );
    }

    // CORE PATTERN: Create dynamic data fields
    const dynamicFields = [
      { field_name: 'category', field_value: body.category, field_type: 'text' },
      { field_name: 'location', field_value: body.location, field_type: 'text' },
      { field_name: 'contact', field_value: JSON.stringify(body.contact || {}), field_type: 'json' },
      { field_name: 'priceRange', field_value: body.priceRange || 'moderate', field_type: 'text' },
      { field_name: 'specialties', field_value: JSON.stringify(body.specialties || []), field_type: 'json' },
      { field_name: 'paymentTerms', field_value: body.paymentTerms || 'Cash on delivery', field_type: 'text' },
      { field_name: 'notes', field_value: body.notes || '', field_type: 'text' },
      { field_name: 'status', field_value: 'active', field_type: 'text' },
      { field_name: 'reliability', field_value: 'medium', field_type: 'text' },
      { field_name: 'rating', field_value: '0', field_type: 'number' }
    ].map(field => ({
      entity_id: entityId,
      ...field
    }));

    const { error: dynamicError } = await supabase
      .from('core_dynamic_data')
      .insert(dynamicFields);

    if (dynamicError) {
      console.error('Error creating vendor dynamic data:', dynamicError);
      // Clean up entity if dynamic data fails
      await supabase.from('core_entities').delete().eq('id', entityId);
      return NextResponse.json(
        { error: 'Failed to create vendor data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { 
        id: entityId, 
        name: body.name, 
        code: entityCode,
        category: body.category 
      },
      message: 'Cash market vendor created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Cash market vendors POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get vendor transaction statistics
async function getVendorTransactionStats(supabase: any, vendorIds: string[], organizationId: string) {
  const { data: transactions } = await supabase
    .from('universal_transactions')
    .select('transaction_data, total_amount, transaction_date')
    .eq('organization_id', organizationId)
    .eq('transaction_type', 'cash_market_purchase')
    .in('created_by', vendorIds); // Using created_by to link to vendor

  const stats: Record<string, any> = {};
  
  vendorIds.forEach(vendorId => {
    const vendorTransactions = transactions?.filter(t => {
      try {
        const data = typeof t.transaction_data === 'string' ? JSON.parse(t.transaction_data) : t.transaction_data;
        return data?.vendorId === vendorId;
      } catch {
        return false;
      }
    }) || [];

    const totalSpent = vendorTransactions.reduce((sum, t) => sum + (t.total_amount || 0), 0);
    const totalTransactions = vendorTransactions.length;
    const averageOrder = totalTransactions > 0 ? totalSpent / totalTransactions : 0;
    const lastTransaction = vendorTransactions.length > 0 
      ? vendorTransactions.sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())[0].transaction_date
      : null;

    stats[vendorId] = {
      totalSpent,
      totalTransactions,
      averageOrder,
      lastTransaction
    };
  });

  return stats;
}