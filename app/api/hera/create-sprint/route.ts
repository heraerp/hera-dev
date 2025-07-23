/**
 * HERA Self-Development API - Create Sprint Endpoint
 * 
 * Enables autonomous sprint creation for HERA's continuous development
 * Uses HERA's universal architecture to manage its own development cycles
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// HERA Self-Development Organization Constants (using Mario's restaurant for testing)
const HERA_DEV_ORG_ID = '123e4567-e89b-12d3-a456-426614174000';
const SYSTEM_USER_ID = '00000001-0000-0000-0000-000000000001';

// Admin client for HERA operations
const getAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

interface CreateSprintRequest {
  sprint_name: string;
  duration_weeks?: number;
  focus_areas?: string[];
  auto_assign_tasks?: boolean;
  priority_level?: 'low' | 'medium' | 'high';
  description?: string;
}

interface SprintTask {
  task_id: string;
  task_name: string;
  task_type: string;
  priority: string;
  estimated_effort: number;
  description: string;
}

// Generate AI-powered tasks based on focus areas
function generateSprintTasks(focusAreas: string[], sprintName: string): SprintTask[] {
  const taskTemplates = {
    performance: [
      { name: 'Optimize database queries', type: 'performance_optimization', effort: 8, description: 'Improve query performance for core entity operations' },
      { name: 'Implement caching layer', type: 'performance_optimization', effort: 13, description: 'Add Redis caching for frequently accessed data' },
      { name: 'Database index optimization', type: 'performance_optimization', effort: 5, description: 'Optimize indexes for core tables' }
    ],
    ai: [
      { name: 'Enhance natural language processing', type: 'ai_enhancement', effort: 21, description: 'Improve command parsing and intent recognition' },
      { name: 'Predictive analytics development', type: 'ai_enhancement', effort: 34, description: 'Build predictive models for business intelligence' },
      { name: 'Auto-suggestion algorithms', type: 'ai_enhancement', effort: 13, description: 'Develop intelligent auto-completion features' }
    ],
    ux: [
      { name: 'Responsive design improvements', type: 'ux_improvement', effort: 8, description: 'Enhance mobile and tablet experience' },
      { name: 'Real-time collaboration features', type: 'ux_improvement', effort: 21, description: 'Implement live multi-user editing capabilities' },
      { name: 'Accessibility enhancements', type: 'ux_improvement', effort: 13, description: 'Improve WCAG compliance and screen reader support' }
    ],
    security: [
      { name: 'Field-level encryption', type: 'security_enhancement', effort: 21, description: 'Implement selective encryption for sensitive data' },
      { name: 'Advanced authentication', type: 'security_enhancement', effort: 13, description: 'Add multi-factor authentication and SSO' },
      { name: 'Security audit framework', type: 'security_enhancement', effort: 8, description: 'Automated security scanning and reporting' }
    ],
    architecture: [
      { name: 'Universal schema optimization', type: 'architecture_improvement', effort: 21, description: 'Enhance core table relationships and patterns' },
      { name: 'API rate limiting', type: 'architecture_improvement', effort: 8, description: 'Implement intelligent API throttling' },
      { name: 'Microservice optimization', type: 'architecture_improvement', effort: 13, description: 'Optimize service communication patterns' }
    ]
  };

  const sprintTasks: SprintTask[] = [];
  
  focusAreas.forEach(area => {
    const templates = taskTemplates[area as keyof typeof taskTemplates] || taskTemplates.performance;
    // Select 2-3 tasks per focus area
    const selectedTasks = templates.slice(0, Math.min(3, templates.length));
    
    selectedTasks.forEach((template, index) => {
      sprintTasks.push({
        task_id: crypto.randomUUID(),
        task_name: template.name,
        task_type: template.type,
        priority: index === 0 ? 'high' : (index === 1 ? 'medium' : 'low'),
        estimated_effort: template.effort,
        description: template.description
      });
    });
  });

  return sprintTasks;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body: CreateSprintRequest = await request.json();

    if (!body.sprint_name || body.sprint_name.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Sprint name is required',
        hera_response: "I need a name for my development sprint! Please provide a sprint name so I can organize my self-improvement activities."
      }, { status: 400 });
    }

    const sprintId = crypto.randomUUID();
    const sprintCode = `HERA-SPRINT-${sprintId.substring(0, 8).toUpperCase()}`;
    const durationWeeks = body.duration_weeks || 2;
    const focusAreas = body.focus_areas || ['performance', 'ai', 'ux'];
    const autoAssignTasks = body.auto_assign_tasks !== false; // Default true
    const priorityLevel = body.priority_level || 'medium';

    // Create sprint entity
    const { error: sprintError } = await supabase
      .from('core_entities')
      .insert({
        id: sprintId,
        organization_id: HERA_DEV_ORG_ID,
        entity_type: 'hera_development_sprint',
        entity_name: body.sprint_name,
        entity_code: sprintCode,
        is_active: true
      });

    if (sprintError) {
      throw sprintError;
    }

    // Add sprint metadata
    const sprintMetadata = [
      { field_name: 'duration_weeks', field_value: durationWeeks.toString(), field_type: 'number' },
      { field_name: 'focus_areas', field_value: focusAreas.join(','), field_type: 'text' },
      { field_name: 'auto_assign_tasks', field_value: autoAssignTasks.toString(), field_type: 'boolean' },
      { field_name: 'priority_level', field_value: priorityLevel, field_type: 'text' },
      { field_name: 'description', field_value: body.description || 'AI-generated development sprint', field_type: 'text' },
      { field_name: 'sprint_status', field_value: 'planning', field_type: 'text' },
      { field_name: 'start_date', field_value: new Date().toISOString(), field_type: 'text' },
      { field_name: 'estimated_end_date', field_value: new Date(Date.now() + durationWeeks * 7 * 24 * 60 * 60 * 1000).toISOString(), field_type: 'text' }
    ];

    await supabase
      .from('core_dynamic_data')
      .insert(
        sprintMetadata.map(field => ({
          entity_id: sprintId,
          field_name: field.field_name,
          field_value: field.field_value,
          field_type: field.field_type
        }))
      );

    let sprintTasks: SprintTask[] = [];
    let tasksCreated = 0;

    // Generate and assign tasks if auto-assignment is enabled
    if (autoAssignTasks) {
      sprintTasks = generateSprintTasks(focusAreas, body.sprint_name);
      
      for (const task of sprintTasks) {
        try {
          // Create task entity
          const { error: taskError } = await supabase
            .from('core_entities')
            .insert({
              id: task.task_id,
              organization_id: HERA_DEV_ORG_ID,
              entity_type: 'hera_ai_evolution_task',
              entity_name: task.task_name,
              entity_code: `TASK-${task.task_id.substring(0, 8).toUpperCase()}`,
              is_active: true
            });

          if (!taskError) {
            // Add task metadata
            const taskMetadata = [
              { field_name: 'task_type', field_value: task.task_type, field_type: 'text' },
              { field_name: 'priority', field_value: task.priority, field_type: 'text' },
              { field_name: 'estimated_effort', field_value: task.estimated_effort.toString(), field_type: 'number' },
              { field_name: 'description', field_value: task.description, field_type: 'text' },
              { field_name: 'sprint_id', field_value: sprintId, field_type: 'text' },
              { field_name: 'task_status', field_value: 'todo', field_type: 'text' },
              { field_name: 'auto_generated', field_value: 'true', field_type: 'boolean' }
            ];

            await supabase
              .from('core_dynamic_data')
              .insert(
                taskMetadata.map(field => ({
                  entity_id: task.task_id,
                  field_name: field.field_name,
                  field_value: field.field_value,
                  field_type: field.field_type
                }))
              );

            // Create relationship between sprint and task
            await supabase
              .from('core_relationships')
              .insert({
                organization_id: HERA_DEV_ORG_ID,
                relationship_type: 'sprint_task',
                relationship_name: 'Sprint contains Task',
                parent_entity_id: sprintId,
                child_entity_id: task.task_id,
                is_active: true
              });

            tasksCreated++;
          }
        } catch (taskError) {
          console.warn(`Failed to create task ${task.task_name}:`, taskError);
        }
      }
    }

    // Calculate sprint statistics
    const totalEstimatedHours = sprintTasks.reduce((sum, task) => sum + task.estimated_effort, 0);
    const highPriorityTasks = sprintTasks.filter(task => task.priority === 'high').length;
    
    const response = {
      success: true,
      sprint_id: sprintId,
      sprint_code: sprintCode,
      sprint_name: body.sprint_name,
      duration_weeks: durationWeeks,
      focus_areas: focusAreas,
      tasks_created: tasksCreated,
      total_estimated_hours: totalEstimatedHours,
      high_priority_tasks: highPriorityTasks,
      sprint_summary: {
        status: 'created',
        planning_phase: true,
        auto_tasks_assigned: autoAssignTasks,
        estimated_completion: new Date(Date.now() + durationWeeks * 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      tasks: sprintTasks.map(task => ({
        id: task.task_id,
        name: task.task_name,
        type: task.task_type,
        priority: task.priority,
        effort_hours: task.estimated_effort
      })),
      hera_response: `I've successfully created "${body.sprint_name}"! This ${durationWeeks}-week sprint focuses on ${focusAreas.join(', ')} and includes ${tasksCreated} auto-generated tasks with ${totalEstimatedHours} estimated hours of development. I'm excited to work on ${highPriorityTasks} high-priority improvements and continue evolving my capabilities!`,
      meta: {
        timestamp: new Date().toISOString(),
        operation: 'sprint_creation',
        organization_id: HERA_DEV_ORG_ID
      }
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('HERA Sprint Creation Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create development sprint',
      hera_response: "I encountered an issue while creating my development sprint. My autonomous planning systems need a moment to recalibrate. Please try again with your sprint details!",
      meta: {
        timestamp: new Date().toISOString(),
        operation: 'sprint_creation',
        error_type: 'creation_failure'
      }
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get all HERA development sprints
    let query = supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', HERA_DEV_ORG_ID)
      .eq('entity_type', 'hera_development_sprint')
      .order('created_at', { ascending: false });

    if (limit > 0) {
      query = query.limit(limit);
    }

    const { data: sprints, error: sprintsError } = await query;

    if (sprintsError) {
      throw sprintsError;
    }

    // Get sprint metadata
    const sprintIds = sprints?.map(sprint => sprint.id) || [];
    let sprintData: any[] = [];

    if (sprintIds.length > 0) {
      const { data: metadata } = await supabase
        .from('core_dynamic_data')
        .select('entity_id, field_name, field_value')
        .in('entity_id', sprintIds);

      // Group metadata by sprint ID
      const metadataMap = (metadata || []).reduce((acc, item) => {
        if (!acc[item.entity_id]) {
          acc[item.entity_id] = {};
        }
        acc[item.entity_id][item.field_name] = item.field_value;
        return acc;
      }, {} as Record<string, Record<string, any>>);

      // Combine sprint data with metadata
      sprintData = (sprints || []).map(sprint => {
        const metadata = metadataMap[sprint.id] || {};
        return {
          id: sprint.id,
          name: sprint.entity_name,
          code: sprint.entity_code,
          created_at: sprint.created_at,
          is_active: sprint.is_active,
          ...metadata,
          // Convert focus_areas string back to array
          focus_areas: metadata?.focus_areas ? metadata.focus_areas.split(',') : []
        };
      });

      // Filter by status if specified
      if (status !== 'all') {
        sprintData = sprintData.filter(sprint => sprint.sprint_status === status);
      }
    }

    return NextResponse.json({
      success: true,
      sprints: sprintData,
      total_count: sprintData.length,
      active_sprints: sprintData.filter(s => s.sprint_status === 'active' || s.sprint_status === 'planning').length,
      hera_response: `I have ${sprintData.length} development sprints in my system! These represent my continuous evolution and self-improvement efforts. Each sprint helps me become more intelligent and capable.`,
      meta: {
        timestamp: new Date().toISOString(),
        operation: 'sprint_listing',
        filter_status: status
      }
    });

  } catch (error) {
    console.error('HERA Sprint Listing Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve development sprints',
      hera_response: "I'm having trouble accessing my sprint history. My development tracking systems are temporarily offline.",
      meta: {
        timestamp: new Date().toISOString(),
        operation: 'sprint_listing',
        error_type: 'retrieval_failure'
      }
    }, { status: 500 });
  }
}