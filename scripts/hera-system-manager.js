#!/usr/bin/env node

/**
 * 🏗️ HERA System Manager
 * 
 * Utility script for managing HERA Self-Development Architecture entities.
 * This script helps add, update, and monitor HERA system entities that track
 * the platform's own development using restaurant metaphors.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import readline from 'readline';
import fs from 'fs';
import { createClient } from '@/lib/supabase/client';

// Load environment variables
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
);

// HERA System Organization IDs
const SYSTEM_ORGS = {
  'core-platform': '00000001-0001-0000-0000-000000000000',
  'ai-intelligence': '00000001-0002-0000-0000-000000000000',
  'security': '00000001-0003-0000-0000-000000000000',
  'developer-tools': '00000001-0004-0000-0000-000000000000',
  'analytics': '00000001-0005-0000-0000-000000000000',
  'integration': '00000001-0006-0000-0000-000000000000'
};

// Entity type prefixes for ID generation
const ID_PREFIXES = {
  'platform_feature': '00000002',
  'ai_model': '00000003',
  'development_task': '00000004',
  'performance_metric': '00000005',
  'security_policy': '00000006',
  'integration_config': '00000007'
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function generateSystemEntityId(entityType) {
  const prefix = ID_PREFIXES[entityType];
  if (!prefix) {
    throw new Error(`Unknown entity type: ${entityType}`);
  }
  
  // Generate a unique suffix (simple incremental for now)
  const suffix = String(Date.now()).slice(-4).padStart(4, '0');
  return `${prefix}-${suffix}-0000-0000-000000000000`;
}

function generateEntityCode(name, type) {
  const baseCode = name
    .replace(/[^A-Z0-9\s]/gi, '')
    .split(' ')
    .map(word => word.slice(0, 3).toUpperCase())
    .join('-');
  
  const typeCode = type.toUpperCase().slice(0, 4);
  return `${baseCode}-${typeCode}`;
}

async function showSystemOverview() {
  console.log('\n🏗️ HERA System Overview');
  console.log('=' .repeat(50));
  
  try {
    const { data: entities, error } = await supabase
      .from('core_entities')
      .select(`
        entity_type,
        entity_name,
        entity_code,
        created_at,
        core_organizations!inner(org_name)
      `)
      .eq('core_organizations.client_id', '00000000-0000-0000-0000-000000000001')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Group by organization
    const byOrg = entities.reduce((acc, entity) => {
      const orgName = entity.core_organizations.org_name;
      if (!acc[orgName]) acc[orgName] = [];
      acc[orgName].push(entity);
      return acc;
    }, {});

    Object.entries(byOrg).forEach(([orgName, orgEntities]) => {
      console.log(`\n📁 ${orgName}`);
      orgEntities.forEach(entity => {
        console.log(`   • ${entity.entity_name} (${entity.entity_code})`);
      });
    });

    console.log(`\n📊 Total System Entities: ${entities.length}`);
    
  } catch (error) {
    console.error('❌ Error fetching system overview:', error.message);
  }
}

async function addSystemEntity() {
  console.log('\n🆕 Add New HERA System Entity');
  console.log('=' .repeat(40));
  
  try {
    // Get entity details from user
    const entityType = await question('Entity Type (platform_feature/ai_model/development_task/performance_metric/security_policy/integration_config): ');
    const entityName = await question('Entity Name: ');
    const entityCode = await question(`Entity Code (default: ${generateEntityCode(entityName, entityType)}): `) || generateEntityCode(entityName, entityType);
    
    // Show organization options
    console.log('\nAvailable Organizations:');
    Object.entries(SYSTEM_ORGS).forEach(([key, id]) => {
      console.log(`  ${key}: ${id}`);
    });
    
    const orgKey = await question('Organization (core-platform/ai-intelligence/security/developer-tools/analytics/integration): ');
    const organizationId = SYSTEM_ORGS[orgKey];
    
    if (!organizationId) {
      throw new Error('Invalid organization selected');
    }
    
    // Generate entity ID
    const entityId = generateSystemEntityId(entityType);
    
    // Insert entity
    const { error: entityError } = await supabase
      .from('core_entities')
      .insert({
        id: entityId,
        organization_id: organizationId,
        entity_type: entityType,
        entity_name: entityName,
        entity_code: entityCode,
        is_active: true
      });
      
    if (entityError) throw entityError;
    
    console.log(`✅ Entity created successfully!`);
    console.log(`   ID: ${entityId}`);
    console.log(`   Name: ${entityName}`);
    console.log(`   Code: ${entityCode}`);
    
    // Ask if they want to add metadata
    const addMetadata = await question('Add metadata? (y/n): ');
    if (addMetadata.toLowerCase() === 'y') {
      await addEntityMetadata(entityId, organizationId, entityType);
    }
    
  } catch (error) {
    console.error('❌ Error adding entity:', error.message);
  }
}

async function addEntityMetadata(entityId, organizationId, entityType) {
  console.log('\n📋 Add Entity Metadata');
  
  const metadataType = await question('Metadata Type (feature_details/performance/task_details/metric_values): ');
  const metadataCategory = await question('Metadata Category (technical/metrics/progress/performance): ');
  const metadataKey = await question('Metadata Key: ');
  
  console.log('Enter metadata value as JSON:');
  const metadataValue = await question('Metadata Value: ');
  
  try {
    const parsedValue = JSON.parse(metadataValue);
    
    const { error } = await supabase
      .from('core_metadata')
      .insert({
        organization_id: organizationId,
        entity_type: entityType,
        entity_id: entityId,
        metadata_type: metadataType,
        metadata_category: metadataCategory,
        metadata_key: metadataKey,
        metadata_value: parsedValue,
        is_active: true,
        created_by: '00000001-0000-0000-0000-000000000001' // System user
      });
      
    if (error) throw error;
    
    console.log('✅ Metadata added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding metadata:', error.message);
  }
}

async function updateEntityStatus() {
  console.log('\n🔄 Update Entity Status');
  console.log('=' .repeat(30));
  
  try {
    // Show recent entities
    const { data: entities, error } = await supabase
      .from('core_entities')
      .select('id, entity_name, entity_code')
      .eq('organization_id', SYSTEM_ORGS['developer-tools'])
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (error) throw error;
    
    console.log('\nRecent Development Tasks:');
    entities.forEach((entity, index) => {
      console.log(`  ${index + 1}. ${entity.entity_name} (${entity.entity_code})`);
    });
    
    const selection = await question('Select entity number (or enter entity ID): ');
    const entityId = isNaN(selection) ? selection : entities[parseInt(selection) - 1]?.id;
    
    if (!entityId) {
      throw new Error('Invalid selection');
    }
    
    const status = await question('New Status (planning/in_progress/testing/completed): ');
    const completion = await question('Completion Percentage (0-100): ');
    const notes = await question('Notes (optional): ');
    
    const updateData = {
      status: status,
      completion_percentage: parseInt(completion),
      last_updated: new Date().toISOString()
    };
    
    if (notes) updateData.notes = notes;
    
    const { error: updateError } = await supabase
      .from('core_metadata')
      .upsert({
        entity_id: entityId,
        organization_id: SYSTEM_ORGS['developer-tools'],
        entity_type: 'development_task',
        metadata_type: 'task_details',
        metadata_category: 'progress',
        metadata_key: 'status_update',
        metadata_value: updateData,
        is_active: true,
        created_by: '00000001-0000-0000-0000-000000000001'
      });
      
    if (updateError) throw updateError;
    
    console.log('✅ Status updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating status:', error.message);
  }
}

async function generateReport() {
  console.log('\n📊 HERA Development Report');
  console.log('=' .repeat(35));
  
  try {
    // Get development tasks with metadata
    const { data: tasks, error } = await supabase
      .from('core_entities')
      .select(`
        entity_name,
        entity_code,
        created_at,
        core_metadata(metadata_value)
      `)
      .eq('organization_id', SYSTEM_ORGS['developer-tools'])
      .eq('entity_type', 'development_task');
      
    if (error) throw error;
    
    console.log('\n🎯 Development Tasks Summary:');
    
    let completed = 0;
    let inProgress = 0;
    let planned = 0;
    
    tasks.forEach(task => {
      const metadata = task.core_metadata?.[0]?.metadata_value;
      const status = metadata?.status || 'unknown';
      const completion = metadata?.completion_percentage || 0;
      
      console.log(`\n• ${task.entity_name}`);
      console.log(`  Status: ${status} (${completion}%)`);
      console.log(`  Code: ${task.entity_code}`);
      
      if (status === 'completed') completed++;
      else if (status === 'in_progress') inProgress++;
      else if (status === 'planning') planned++;
    });
    
    console.log('\n📈 Summary:');
    console.log(`  Total Tasks: ${tasks.length}`);
    console.log(`  Completed: ${completed}`);
    console.log(`  In Progress: ${inProgress}`);
    console.log(`  Planned: ${planned}`);
    console.log(`  Completion Rate: ${Math.round((completed / tasks.length) * 100)}%`);
    
    // Save report to file
    const report = {
      generated_at: new Date().toISOString(),
      summary: {
        total_tasks: tasks.length,
        completed,
        in_progress: inProgress,
        planned,
        completion_rate: Math.round((completed / tasks.length) * 100)
      },
      tasks: tasks.map(t => ({
        name: t.entity_name,
        code: t.entity_code,
        status: t.core_metadata?.[0]?.metadata_value?.status || 'unknown',
        completion: t.core_metadata?.[0]?.metadata_value?.completion_percentage || 0
      }))
    };
    
    fs.writeFileSync('hera-development-report.json', JSON.stringify(report, null, 2));
    console.log('\n💾 Report saved to hera-development-report.json');
    
  } catch (error) {
    console.error('❌ Error generating report:', error.message);
  }
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function showMenu() {
  console.log('\n🏗️ HERA System Manager');
  console.log('=' .repeat(25));
  console.log('1. Show System Overview');
  console.log('2. Add New Entity');
  console.log('3. Update Entity Status');
  console.log('4. Generate Development Report');
  console.log('5. Exit');
  
  const choice = await question('\nSelect option (1-5): ');
  
  switch (choice) {
    case '1':
      await showSystemOverview();
      break;
    case '2':
      await addSystemEntity();
      break;
    case '3':
      await updateEntityStatus();
      break;
    case '4':
      await generateReport();
      break;
    case '5':
      console.log('👋 Goodbye!');
      rl.close();
      return;
    default:
      console.log('❌ Invalid option');
  }
  
  // Show menu again
  setTimeout(showMenu, 1000);
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.length > 0) {
  const command = args[0];
  
  switch (command) {
    case 'overview':
      await showSystemOverview();
      process.exit(0);
    case 'report':
      await generateReport();
      process.exit(0);
    default:
      console.log('Available commands: overview, report');
      process.exit(1);
  }
} else {
  // Interactive mode
  showMenu();
}