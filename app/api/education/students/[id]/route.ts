/**
 * HERA Universal - Individual Student API Routes
 * 
 * Handles GET, PUT, DELETE operations for individual students
 * Following the exact patterns from Purchase Order API
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

interface StudentUpdate {
  name?: string;
  age?: number;
  gradeLevel?: string;
  targetExam?: string;
  learningStyle?: string;
  currentProgress?: number;
}

// GET /api/education/students/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getAdminClient();
    const { id: studentId } = await params;

    // Get student entity
    const { data: student, error: studentError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('id', studentId)
      .eq('entity_type', 'student')
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Get dynamic data
    const { data: dynamicData, error: dynamicError } = await supabase
      .from('core_dynamic_data')
      .select('field_name, field_value')
      .eq('entity_id', studentId);

    if (dynamicError) {
      console.error('Error fetching dynamic data:', dynamicError);
    }

    // Build dynamic data map
    const dynamicDataMap = (dynamicData || []).reduce((acc, item) => {
      acc[item.field_name] = item.field_value;
      return acc;
    }, {} as Record<string, any>);

    // Get recent study sessions
    const { data: sessions } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', student.organization_id)
      .eq('transaction_type', 'study_session')
      .eq('transaction_data->>student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Combine all data
    const enrichedStudent = {
      id: student.id,
      organizationId: student.organization_id,
      name: student.entity_name,
      code: student.entity_code,
      isActive: student.is_active,
      createdAt: student.created_at,
      updatedAt: student.updated_at,
      age: dynamicDataMap.age ? parseInt(dynamicDataMap.age) : undefined,
      gradeLevel: dynamicDataMap.grade_level,
      targetExam: dynamicDataMap.target_exam,
      learningStyle: dynamicDataMap.learning_style,
      currentProgress: dynamicDataMap.current_progress ? 
        parseFloat(dynamicDataMap.current_progress) : 0,
      recentSessions: sessions?.map(s => ({
        id: s.id,
        date: s.transaction_date,
        duration: s.transaction_data?.duration_minutes || 0,
        questionsAttempted: s.transaction_data?.questions_attempted || 0,
        averageScore: s.transaction_data?.average_score || 0
      })) || []
    };

    return NextResponse.json({ data: enrichedStudent });

  } catch (error) {
    console.error('Internal server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/education/students/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getAdminClient();
    const { id: studentId } = await params;
    const body: StudentUpdate = await request.json();

    // Verify student exists
    const { data: student, error: studentError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('id', studentId)
      .eq('entity_type', 'student')
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Update entity name if provided
    if (body.name) {
      const { error: updateError } = await supabase
        .from('core_entities')
        .update({
          entity_name: body.name,
          updated_at: new Date().toISOString()
        })
        .eq('id', studentId);

      if (updateError) {
        console.error('Error updating student name:', updateError);
      }
    }

    // Update dynamic fields
    const dynamicUpdates = [];
    const fieldsToUpdate = ['age', 'gradeLevel', 'targetExam', 'learningStyle', 'currentProgress'];
    
    for (const field of fieldsToUpdate) {
      const fieldName = field === 'gradeLevel' ? 'grade_level' : 
                       field === 'targetExam' ? 'target_exam' :
                       field === 'learningStyle' ? 'learning_style' :
                       field === 'currentProgress' ? 'current_progress' : field;
                       
      if (body[field as keyof StudentUpdate] !== undefined) {
        // Check if field exists
        const { data: existing } = await supabase
          .from('core_dynamic_data')
          .select('id')
          .eq('entity_id', studentId)
          .eq('field_name', fieldName)
          .single();

        if (existing) {
          // Update existing field
          await supabase
            .from('core_dynamic_data')
            .update({
              field_value: String(body[field as keyof StudentUpdate]),
              updated_at: new Date().toISOString()
            })
            .eq('entity_id', studentId)
            .eq('field_name', fieldName);
        } else {
          // Insert new field
          await supabase
            .from('core_dynamic_data')
            .insert({
              entity_id: studentId,
              field_name: fieldName,
              field_value: String(body[field as keyof StudentUpdate]),
              field_type: typeof body[field as keyof StudentUpdate] === 'number' ? 'number' : 'text'
            });
        }
      }
    }

    // Log update transaction
    await supabase
      .from('universal_transactions')
      .insert({
        organization_id: student.organization_id,
        transaction_type: 'student_update',
        transaction_subtype: 'profile_update',
        transaction_number: `UPD-${student.entity_code}-${Date.now()}`,
        transaction_date: new Date().toISOString(),
        total_amount: 0,
        currency: 'USD',
        transaction_status: 'completed',
        is_financial: false,
        transaction_data: {
          student_id: studentId,
          updated_fields: Object.keys(body),
          update_timestamp: new Date().toISOString()
        }
      });

    return NextResponse.json({
      success: true,
      message: 'Student updated successfully'
    });

  } catch (error) {
    console.error('Internal server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/education/students/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getAdminClient();
    const { id: studentId } = await params;

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('core_entities')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', studentId)
      .eq('entity_type', 'student');

    if (error) {
      console.error('Error deleting student:', error);
      return NextResponse.json(
        { error: 'Failed to delete student' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Student deleted successfully'
    });

  } catch (error) {
    console.error('Internal server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}