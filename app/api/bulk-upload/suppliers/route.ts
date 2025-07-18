/**
 * Suppliers Bulk Upload API Route
 * Uses Universal Bulk Upload System
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, suppliers } = body;

    // Forward to universal bulk upload API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/universal-bulk-upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        organizationId,
        entityType: 'suppliers',
        data: suppliers
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(result, { status: response.status });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Suppliers bulk upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error during suppliers bulk upload' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'template') {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/universal-bulk-upload?action=template&entityType=suppliers`);
      const result = await response.json();
      return NextResponse.json(result);
    }

    return NextResponse.json({
      message: 'Suppliers Bulk Upload API',
      endpoints: {
        POST: 'Upload suppliers data',
        GET: 'Get template information'
      }
    });

  } catch (error) {
    console.error('❌ Error in suppliers bulk upload GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}