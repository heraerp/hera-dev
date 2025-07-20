/**
 * HERA Universal - Students API Routes
 * 
 * Next.js 15 App Router API Route Handler
 * Uses HERA's 5-table universal architecture:
 * - core_entities: Student records
 * - core_dynamic_data: Custom student fields
 * - universal_transactions: Learning tracking
 * - core_relationships: Student relationships
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
interface StudentRequest {
  organizationId: string;
  name: string;
  age?: number;
  gradeLevel?: string;
  targetExam?: string;
  learningStyle?: string;
}

// GET /api/education/students
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient(); // Use admin client for demo
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const targetExam = searchParams.get('targetExam');
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    // CORE PATTERN: Query core_entities first
    const { data: students, error } = await supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'student')
      .eq('is_active', true)
      .order('entity_name', { ascending: true });

    if (error) {
      console.error('Error fetching students:', error);
      return NextResponse.json(
        { error: 'Failed to fetch students' },
        { status: 500 }
      );
    }

    // CORE PATTERN: Get dynamic data if students exist
    let dynamicData: any[] = [];
    const studentIds = students?.map(s => s.id) || [];
    
    if (studentIds.length > 0) {
      const { data: dynamicDataResult } = await supabase
        .from('core_dynamic_data')
        .select('entity_id, field_name, field_value')
        .in('entity_id', studentIds);
      
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

    // CORE PATTERN: Combine entities with dynamic data
    let enrichedStudents = (students || []).map(student => ({
      id: student.id,
      name: student.entity_name,
      code: student.entity_code,
      isActive: student.is_active,
      createdAt: student.created_at,
      updatedAt: student.updated_at,
      age: dynamicDataMap[student.id]?.age ? parseInt(dynamicDataMap[student.id].age) : undefined,
      gradeLevel: dynamicDataMap[student.id]?.grade_level,
      targetExam: dynamicDataMap[student.id]?.target_exam,
      learningStyle: dynamicDataMap[student.id]?.learning_style,
      currentProgress: dynamicDataMap[student.id]?.current_progress ? 
        parseFloat(dynamicDataMap[student.id].current_progress) : 0
    }));

    // Filter by target exam if specified
    if (targetExam) {
      enrichedStudents = enrichedStudents.filter(s => s.targetExam === targetExam);
    }

    return NextResponse.json({
      data: enrichedStudents,
      summary: {
        total: enrichedStudents.length,
        active: enrichedStudents.filter(s => s.isActive).length
      }
    });

  } catch (error) {
    console.error('Internal server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/education/students
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient(); // Use admin client for demo
    const body: StudentRequest = await request.json();

    // Validate request
    if (!body.organizationId || !body.name) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, name' },
        { status: 400 }
      );
    }

    // CORE PATTERN: Generate entity code
    const studentCode = `STU-${body.name.toUpperCase().slice(0,4)}-${Math.random().toString(36).substring(2,6).toUpperCase()}`;
    const studentId = crypto.randomUUID();

    // CORE PATTERN: Create entity record
    const { data: student, error: studentError } = await supabase
      .from('core_entities')
      .insert({
        id: studentId,
        organization_id: body.organizationId,
        entity_type: 'student',
        entity_name: body.name,
        entity_code: studentCode,
        is_active: true
      })
      .select()
      .single();

    if (studentError) {
      console.error('Error creating student:', studentError);
      return NextResponse.json(
        { error: 'Failed to create student' },
        { status: 500 }
      );
    }

    // CORE PATTERN: Create dynamic data fields
    const dynamicFields = [];
    
    if (body.age !== undefined) {
      dynamicFields.push({
        entity_id: studentId,
        field_name: 'age',
        field_value: String(body.age),
        field_type: 'number'
      });
    }
    
    if (body.gradeLevel) {
      dynamicFields.push({
        entity_id: studentId,
        field_name: 'grade_level',
        field_value: body.gradeLevel,
        field_type: 'text'
      });
    }
    
    if (body.targetExam) {
      dynamicFields.push({
        entity_id: studentId,
        field_name: 'target_exam',
        field_value: body.targetExam,
        field_type: 'text'
      });
    }
    
    if (body.learningStyle) {
      dynamicFields.push({
        entity_id: studentId,
        field_name: 'learning_style',
        field_value: body.learningStyle,
        field_type: 'text'
      });
    }
    
    // Initialize current progress
    dynamicFields.push({
      entity_id: studentId,
      field_name: 'current_progress',
      field_value: '0',
      field_type: 'number'
    });

    if (dynamicFields.length > 0) {
      const { error: dynamicError } = await supabase
        .from('core_dynamic_data')
        .insert(dynamicFields);
        
      if (dynamicError) {
        console.error('Error creating dynamic data:', dynamicError);
      }
    }

    // Create initial learning transaction
    const { error: transactionError } = await supabase
      .from('universal_transactions')
      .insert({
        organization_id: body.organizationId,
        transaction_type: 'student_enrollment',
        transaction_subtype: 'initial_registration',
        transaction_number: `ENR-${studentCode}-${Date.now()}`,
        transaction_date: new Date().toISOString(),
        total_amount: 0,
        currency: 'USD',
        transaction_status: 'completed',
        is_financial: false,
        transaction_data: {
          student_id: studentId,
          student_name: body.name,
          target_exam: body.targetExam || 'Not specified',
          enrollment_date: new Date().toISOString()
        }
      });

    if (transactionError) {
      console.error('Error creating enrollment transaction:', transactionError);
    }

    return NextResponse.json({
      success: true,
      data: { 
        id: studentId, 
        name: body.name,
        code: studentCode,
        targetExam: body.targetExam
      },
      message: 'Student created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Internal server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}