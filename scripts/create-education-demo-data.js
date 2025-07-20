/**
 * Create Demo Education Organization Data
 * 
 * Creates "Brilliant Minds Academy" as our education demo organization
 * with sample students, papers, and questions
 */

const { createClient } = require('@supabase/supabase-js');

// Use environment variables or fallback to demo values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DEMO_ORG_ID = '803c33bc-add0-4ad8-8d22-9511a049223a';

async function createEducationDemoData() {
  console.log('🎓 Creating HERA Education Demo Organization...');

  try {
    // 1. Create client first (if it doesn't exist)
    console.log('Creating client...');
    const { data: existingClient } = await supabase
      .from('core_clients')
      .select('id')
      .eq('id', DEMO_ORG_ID)
      .single();

    if (!existingClient) {
      await supabase
        .from('core_clients')
        .insert({
          id: DEMO_ORG_ID,
          client_name: 'Brilliant Minds Academy',
          client_code: 'BMA',
          is_active: true
        });
    }

    // 2. Create Brilliant Minds Academy organization
    console.log('Creating Brilliant Minds Academy...');
    const { error: orgError } = await supabase
      .from('core_organizations')
      .upsert({
        id: DEMO_ORG_ID,
        org_name: 'Brilliant Minds Academy',
        client_id: DEMO_ORG_ID,
        org_code: 'BMA-EDU',
        industry: 'Education',
        country: 'UK',
        currency: 'GBP',
        is_active: true
      });

    if (orgError) {
      console.error('Error creating organization:', orgError);
      return;
    }
    console.log('✅ Brilliant Minds Academy created');

    // 3. Create sample students
    console.log('Creating sample students...');
    
    const students = [
      {
        name: 'Emma Thompson',
        age: 17,
        gradeLevel: 'A-Level Year 2',
        targetExam: 'Edexcel Business A-Level',
        learningStyle: 'Visual'
      },
      {
        name: 'James Wilson',
        age: 16,
        gradeLevel: 'A-Level Year 1',
        targetExam: 'Edexcel Business A-Level',
        learningStyle: 'Kinesthetic'
      },
      {
        name: 'Sophie Chen',
        age: 17,
        gradeLevel: 'A-Level Year 2',
        targetExam: 'Edexcel Business A-Level',
        learningStyle: 'Auditory'
      },
      {
        name: 'Future Business Leader',
        age: 12,
        gradeLevel: 'Advanced',
        targetExam: 'Edexcel Business A-Level',
        learningStyle: 'Visual-Kinesthetic'
      }
    ];

    for (const student of students) {
      const studentId = crypto.randomUUID();
      const studentCode = `STU-${student.name.split(' ')[0].toUpperCase()}-${Math.random().toString(36).substring(2,6).toUpperCase()}`;

      // Create student entity
      await supabase.from('core_entities').insert({
        id: studentId,
        organization_id: DEMO_ORG_ID,
        entity_type: 'student',
        entity_name: student.name,
        entity_code: studentCode,
        is_active: true
      });

      // Add student dynamic data
      const dynamicFields = [
        { entity_id: studentId, field_name: 'age', field_value: String(student.age), field_type: 'number' },
        { entity_id: studentId, field_name: 'grade_level', field_value: student.gradeLevel, field_type: 'text' },
        { entity_id: studentId, field_name: 'target_exam', field_value: student.targetExam, field_type: 'text' },
        { entity_id: studentId, field_name: 'learning_style', field_value: student.learningStyle, field_type: 'text' },
        { entity_id: studentId, field_name: 'current_progress', field_value: '0', field_type: 'number' }
      ];

      await supabase.from('core_dynamic_data').insert(dynamicFields);

      // Create enrollment transaction
      await supabase.from('universal_transactions').insert({
        organization_id: DEMO_ORG_ID,
        transaction_type: 'student_enrollment',
        transaction_subtype: 'initial_registration',
        transaction_number: `ENR-${studentCode}-${Date.now()}`,
        transaction_date: new Date().toISOString(),
        total_amount: 0,
        currency: 'GBP',
        transaction_status: 'completed',
        is_financial: false,
        transaction_data: {
          student_id: studentId,
          student_name: student.name,
          target_exam: student.targetExam,
          enrollment_date: new Date().toISOString()
        }
      });

      console.log(`✅ Created student: ${student.name}`);
    }

    // 4. Create sample past papers
    console.log('Creating sample past papers...');
    
    const papers = [
      {
        title: 'Edexcel Business A-Level Paper 1 - June 2023',
        examBoard: 'Edexcel',
        examYear: 2023,
        examSeries: 'June',
        paperNumber: '1',
        totalMarks: 80,
        durationMinutes: 120
      },
      {
        title: 'Edexcel Business A-Level Paper 2 - January 2023',
        examBoard: 'Edexcel',
        examYear: 2023,
        examSeries: 'January',
        paperNumber: '2',
        totalMarks: 100,
        durationMinutes: 150
      },
      {
        title: 'AQA Business A-Level Paper 1 - June 2023',
        examBoard: 'AQA',
        examYear: 2023,
        examSeries: 'June',
        paperNumber: '1',
        totalMarks: 75,
        durationMinutes: 105
      }
    ];

    const paperIds = [];
    for (const paper of papers) {
      const paperId = crypto.randomUUID();
      const paperCode = `PAPER-${paper.examBoard.toUpperCase().slice(0,3)}-${paper.examYear}-${paper.paperNumber}`;
      paperIds.push(paperId);

      // Create paper entity
      await supabase.from('core_entities').insert({
        id: paperId,
        organization_id: DEMO_ORG_ID,
        entity_type: 'past_paper',
        entity_name: paper.title,
        entity_code: paperCode,
        is_active: true
      });

      // Add paper dynamic data
      const dynamicFields = [
        { entity_id: paperId, field_name: 'exam_board', field_value: paper.examBoard, field_type: 'text' },
        { entity_id: paperId, field_name: 'exam_year', field_value: String(paper.examYear), field_type: 'number' },
        { entity_id: paperId, field_name: 'exam_series', field_value: paper.examSeries, field_type: 'text' },
        { entity_id: paperId, field_name: 'paper_number', field_value: paper.paperNumber, field_type: 'text' },
        { entity_id: paperId, field_name: 'total_marks', field_value: String(paper.totalMarks), field_type: 'number' },
        { entity_id: paperId, field_name: 'duration_minutes', field_value: String(paper.durationMinutes), field_type: 'number' },
        { entity_id: paperId, field_name: 'upload_method', field_value: 'manual', field_type: 'text' },
        { entity_id: paperId, field_name: 'processing_status', field_value: 'complete', field_type: 'text' }
      ];

      await supabase.from('core_dynamic_data').insert(dynamicFields);
      console.log(`✅ Created paper: ${paper.title}`);
    }

    // 5. Create sample questions
    console.log('Creating sample questions...');
    
    const questions = [
      {
        paperId: paperIds[0],
        questionNumber: '1',
        questionText: 'State two features of a limited company.',
        marksAvailable: 2,
        topicArea: 'Business Structure',
        questionType: 'knowledge',
        difficultyLevel: 'basic',
        commandWords: 'State',
        markSchemePoints: ['Limited liability', 'Separate legal entity', 'Owned by shareholders', 'Can raise capital through shares']
      },
      {
        paperId: paperIds[0],
        questionNumber: '2',
        questionText: 'Explain two advantages of franchising for a franchisor.',
        marksAvailable: 6,
        topicArea: 'Business Growth',
        questionType: 'application',
        difficultyLevel: 'intermediate',
        commandWords: 'Explain',
        markSchemePoints: ['Rapid expansion', 'Reduced financial risk', 'Local market knowledge', 'Franchise fees income']
      },
      {
        paperId: paperIds[0],
        questionNumber: '3',
        questionText: 'Analyse the impact of digital marketing on small businesses.',
        marksAvailable: 8,
        topicArea: 'Marketing',
        questionType: 'analysis',
        difficultyLevel: 'intermediate',
        commandWords: 'Analyse',
        markSchemePoints: ['Cost-effective reach', 'Targeted advertising', 'Real-time analytics', 'Global market access', 'Competition increase']
      },
      {
        paperId: paperIds[0],
        questionNumber: '4',
        questionText: 'Evaluate the effectiveness of motivation theories in improving employee performance.',
        marksAvailable: 12,
        topicArea: 'Human Resources',
        questionType: 'evaluation',
        difficultyLevel: 'advanced',
        commandWords: 'Evaluate',
        markSchemePoints: ['Maslow hierarchy relevance', 'Herzberg two-factor theory', 'Individual differences', 'Cultural variations', 'Practical implementation challenges']
      },
      {
        paperId: paperIds[1],
        questionNumber: '1',
        questionText: 'Define the term "break-even point".',
        marksAvailable: 2,
        topicArea: 'Finance',
        questionType: 'knowledge',
        difficultyLevel: 'basic',
        commandWords: 'Define',
        markSchemePoints: ['Point where total revenue equals total costs', 'No profit or loss made', 'All fixed and variable costs covered']
      }
    ];

    for (const question of questions) {
      const questionId = crypto.randomUUID();
      const questionCode = `Q-${question.topicArea.toUpperCase().slice(0,3)}-${question.marksAvailable}M-${Math.random().toString(36).substring(2,6).toUpperCase()}`;

      // Create question entity
      await supabase.from('core_entities').insert({
        id: questionId,
        organization_id: DEMO_ORG_ID,
        entity_type: 'exam_question',
        entity_name: question.questionText,
        entity_code: questionCode,
        is_active: true
      });

      // Add question dynamic data
      const timeAllocation = Math.ceil(question.marksAvailable * 1.5);
      const dynamicFields = [
        { entity_id: questionId, field_name: 'question_number', field_value: question.questionNumber, field_type: 'text' },
        { entity_id: questionId, field_name: 'marks_available', field_value: String(question.marksAvailable), field_type: 'number' },
        { entity_id: questionId, field_name: 'topic_area', field_value: question.topicArea, field_type: 'text' },
        { entity_id: questionId, field_name: 'question_type', field_value: question.questionType, field_type: 'text' },
        { entity_id: questionId, field_name: 'difficulty_level', field_value: question.difficultyLevel, field_type: 'text' },
        { entity_id: questionId, field_name: 'command_words', field_value: question.commandWords, field_type: 'text' },
        { entity_id: questionId, field_name: 'time_allocation_minutes', field_value: String(timeAllocation), field_type: 'number' },
        { entity_id: questionId, field_name: 'mark_scheme_points', field_value: JSON.stringify(question.markSchemePoints), field_type: 'text' },
        { entity_id: questionId, field_name: 'common_mistakes', field_value: JSON.stringify(['Being too brief', 'Not using business terminology']), field_type: 'text' }
      ];

      await supabase.from('core_dynamic_data').insert(dynamicFields);

      // Create paper-question relationship
      await supabase.from('core_relationships').insert({
        organization_id: DEMO_ORG_ID,
        relationship_type: 'paper_question',
        relationship_subtype: 'contains',
        parent_entity_id: question.paperId,
        child_entity_id: questionId,
        relationship_name: `Paper contains ${question.questionNumber}`,
        is_active: true
      });

      console.log(`✅ Created question: ${question.questionNumber} (${question.marksAvailable} marks)`);
    }

    console.log('\n🎉 Education demo data created successfully!');
    console.log('\n📊 Summary:');
    console.log('• Organization: Brilliant Minds Academy');
    console.log(`• Organization ID: ${DEMO_ORG_ID}`);
    console.log(`• Students: ${students.length}`);
    console.log(`• Past Papers: ${papers.length}`);
    console.log(`• Questions: ${questions.length}`);
    
    console.log('\n🧪 Test endpoints:');
    console.log(`• Students: GET /api/education/students?organizationId=${DEMO_ORG_ID}`);
    console.log(`• Papers: GET /api/education/papers?organizationId=${DEMO_ORG_ID}`);
    console.log(`• Questions: GET /api/education/questions?organizationId=${DEMO_ORG_ID}`);
    console.log(`• Practice: GET /api/education/questions/practice?organizationId=${DEMO_ORG_ID}&count=3`);
    console.log(`• Test: GET /api/education/test?organizationId=${DEMO_ORG_ID}`);

  } catch (error) {
    console.error('Error creating demo data:', error);
  }
}

// Run the script
createEducationDemoData();