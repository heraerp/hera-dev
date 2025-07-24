/**
 * HERA Universal - Users API Routes
 * 
 * Next.js 15 App Router API Route Handler
 * Manages user creation and updates in core_users table
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

// TypeScript interfaces
interface CreateUserRequest {
  email: string;
  fullName: string;
  userRole?: string;
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body: CreateUserRequest = await request.json();

    // Validate request
    if (!body.email || !body.fullName) {
      return NextResponse.json(
        { error: 'Missing required fields: email, fullName' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('core_users')
      .select('id, email, full_name')
      .eq('email', body.email)
      .single();

    if (existingUser) {
      return NextResponse.json({
        success: true,
        data: existingUser,
        message: 'User already exists'
      });
    }

    // Create new user
    const userId = crypto.randomUUID();
    
    const { data: newUser, error: createError } = await supabase
      .from('core_users')
      .insert({
        id: userId,
        email: body.email,
        full_name: body.fullName,
        user_role: body.userRole || 'user',
        is_active: true
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating user:', createError);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.full_name
      },
      message: 'User created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Users POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/users - Get users (with email search)
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const search = searchParams.get('search');

    let query = supabase
      .from('core_users')
      .select('id, email, full_name, user_role, is_active, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (email) {
      query = query.eq('email', email);
    }

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    const { data: users, error } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: users?.map(user => ({
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        userRole: user.user_role,
        isActive: user.is_active,
        createdAt: user.created_at
      })) || []
    });

  } catch (error) {
    console.error('Users GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}