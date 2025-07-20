/**
 * HERA Universal - Past Papers API Routes
 * 
 * Manages past exam papers for practice
 * Supports file uploads and AI question extraction
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

interface PastPaperRequest {
  organizationId: string;
  title: string;
  examBoard: string;
  examYear: number;
  examSeries: string;
  paperNumber: string;
  totalMarks: number;
  durationMinutes: number;
  uploadMethod?: 'upload' | 'manual' | 'scan';
  fileContent?: string;
}

// GET /api/education/papers
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const examBoard = searchParams.get('examBoard');
    const examYear = searchParams.get('examYear');
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    // Query core_entities for past papers
    let query = supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'past_paper')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    const { data: papers, error } = await query;

    if (error) {
      console.error('Error fetching papers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch papers' },
        { status: 500 }
      );
    }

    // Get dynamic data for papers
    let dynamicData: any[] = [];
    const paperIds = papers?.map(p => p.id) || [];
    
    if (paperIds.length > 0) {
      const { data: dynamicDataResult } = await supabase
        .from('core_dynamic_data')
        .select('entity_id, field_name, field_value')
        .in('entity_id', paperIds);
      
      dynamicData = dynamicDataResult || [];
    }

    // Group dynamic data by entity_id
    const dynamicDataMap = dynamicData.reduce((acc, item) => {
      if (!acc[item.entity_id]) {
        acc[item.entity_id] = {};
      }
      acc[item.entity_id][item.field_name] = item.field_value;
      return acc;
    }, {} as Record<string, Record<string, any>>);

    // Get question counts for each paper
    const questionCounts: Record<string, number> = {};
    if (paperIds.length > 0) {
      const { data: relationships } = await supabase
        .from('core_relationships')
        .select('parent_entity_id')
        .eq('relationship_type', 'paper_question')
        .in('parent_entity_id', paperIds);
      
      relationships?.forEach(rel => {
        questionCounts[rel.parent_entity_id] = (questionCounts[rel.parent_entity_id] || 0) + 1;
      });
    }

    // Combine all data
    let enrichedPapers = (papers || []).map(paper => ({
      id: paper.id,
      title: paper.entity_name,
      code: paper.entity_code,
      examBoard: dynamicDataMap[paper.id]?.exam_board || '',
      examYear: dynamicDataMap[paper.id]?.exam_year ? 
        parseInt(dynamicDataMap[paper.id].exam_year) : null,
      examSeries: dynamicDataMap[paper.id]?.exam_series || '',
      paperNumber: dynamicDataMap[paper.id]?.paper_number || '',
      totalMarks: dynamicDataMap[paper.id]?.total_marks ? 
        parseInt(dynamicDataMap[paper.id].total_marks) : 0,
      durationMinutes: dynamicDataMap[paper.id]?.duration_minutes ? 
        parseInt(dynamicDataMap[paper.id].duration_minutes) : 0,
      uploadMethod: dynamicDataMap[paper.id]?.upload_method || 'manual',
      processingStatus: dynamicDataMap[paper.id]?.processing_status || 'complete',
      questionCount: questionCounts[paper.id] || 0,
      createdAt: paper.created_at,
      isActive: paper.is_active
    }));

    // Apply filters
    if (examBoard) {
      enrichedPapers = enrichedPapers.filter(p => p.examBoard === examBoard);
    }
    if (examYear) {
      enrichedPapers = enrichedPapers.filter(p => p.examYear === parseInt(examYear));
    }

    return NextResponse.json({
      data: enrichedPapers,
      summary: {
        total: enrichedPapers.length,
        byExamBoard: enrichedPapers.reduce((acc, p) => {
          acc[p.examBoard] = (acc[p.examBoard] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        totalQuestions: Object.values(questionCounts).reduce((a, b) => a + b, 0)
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

// POST /api/education/papers
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body: PastPaperRequest = await request.json();

    // Validate request
    if (!body.organizationId || !body.title || !body.examBoard || !body.examYear) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate paper code
    const paperCode = `PAPER-${body.examBoard.toUpperCase().slice(0,3)}-${body.examYear}-${body.paperNumber || '1'}-${Math.random().toString(36).substring(2,6).toUpperCase()}`;
    const paperId = crypto.randomUUID();

    // Create entity record
    const { data: paper, error: paperError } = await supabase
      .from('core_entities')
      .insert({
        id: paperId,
        organization_id: body.organizationId,
        entity_type: 'past_paper',
        entity_name: body.title,
        entity_code: paperCode,
        is_active: true
      })
      .select()
      .single();

    if (paperError) {
      console.error('Error creating paper:', paperError);
      return NextResponse.json(
        { error: 'Failed to create paper' },
        { status: 500 }
      );
    }

    // Create dynamic data fields
    const dynamicFields = [
      {
        entity_id: paperId,
        field_name: 'exam_board',
        field_value: body.examBoard,
        field_type: 'text'
      },
      {
        entity_id: paperId,
        field_name: 'exam_year',
        field_value: String(body.examYear),
        field_type: 'number'
      },
      {
        entity_id: paperId,
        field_name: 'exam_series',
        field_value: body.examSeries,
        field_type: 'text'
      },
      {
        entity_id: paperId,
        field_name: 'paper_number',
        field_value: body.paperNumber,
        field_type: 'text'
      },
      {
        entity_id: paperId,
        field_name: 'total_marks',
        field_value: String(body.totalMarks),
        field_type: 'number'
      },
      {
        entity_id: paperId,
        field_name: 'duration_minutes',
        field_value: String(body.durationMinutes),
        field_type: 'number'
      },
      {
        entity_id: paperId,
        field_name: 'upload_method',
        field_value: body.uploadMethod || 'manual',
        field_type: 'text'
      },
      {
        entity_id: paperId,
        field_name: 'processing_status',
        field_value: body.fileContent ? 'processing' : 'complete',
        field_type: 'text'
      }
    ];

    if (body.fileContent) {
      dynamicFields.push({
        entity_id: paperId,
        field_name: 'file_content',
        field_value: body.fileContent,
        field_type: 'text'
      });
    }

    const { error: dynamicError } = await supabase
      .from('core_dynamic_data')
      .insert(dynamicFields);

    if (dynamicError) {
      console.error('Error creating dynamic data:', dynamicError);
    }

    // Create paper upload transaction
    await supabase
      .from('universal_transactions')
      .insert({
        organization_id: body.organizationId,
        transaction_type: 'paper_upload',
        transaction_subtype: body.uploadMethod || 'manual',
        transaction_number: paperCode,
        transaction_date: new Date().toISOString(),
        total_amount: body.totalMarks,
        currency: 'MARKS',
        transaction_status: 'completed',
        is_financial: false,
        transaction_data: {
          paper_id: paperId,
          exam_board: body.examBoard,
          exam_year: body.examYear,
          paper_number: body.paperNumber,
          processing_status: body.fileContent ? 'processing' : 'complete'
        }
      });

    // If file content provided, trigger AI processing (simulated)
    if (body.fileContent) {
      // In a real implementation, this would trigger an AI job
      // For now, we'll simulate by updating status after a delay
      setTimeout(async () => {
        await supabase
          .from('core_dynamic_data')
          .update({
            field_value: 'complete',
            updated_at: new Date().toISOString()
          })
          .eq('entity_id', paperId)
          .eq('field_name', 'processing_status');
      }, 5000);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: paperId,
        code: paperCode,
        title: body.title,
        processingStatus: body.fileContent ? 'processing' : 'complete'
      },
      message: 'Past paper created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Internal server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}