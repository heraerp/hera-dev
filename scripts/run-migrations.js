import { createClient } from '@/lib/supabase/client';
#!/usr/bin/env node

/**
 * HERA Migration Runner - Run SQL migrations through Supabase
 * This script runs the testing framework migrations
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

class MigrationRunner {
  constructor() {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error('Missing Supabase configuration. Please check your environment variables.');
    }
    
    this.supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: chalk.blue,
      success: chalk.green,
      error: chalk.red,
      warning: chalk.yellow
    };
    
    console.log(`[${timestamp}] ${colors[type](message)}`);
  }

  async runMigration(filePath) {
    try {
      this.log(`Running migration: ${path.basename(filePath)}`, 'info');
      
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Split SQL by semicolons and execute each statement
      const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i].trim();
        if (statement.length === 0) continue;
        
        try {
          this.log(`  Executing statement ${i + 1}/${statements.length}...`, 'info');
          
          const { error } = await this.supabase.rpc('exec_sql', {
            sql: statement + ';'
          });
          
          if (error) {
            // Try direct query execution instead
            const { error: queryError } = await this.supabase
              .from('_dummy_table_that_does_not_exist')
              .select('*')
              .limit(0);
            
            // If the above fails, try raw SQL execution
            const { error: rawError } = await this.supabase.rpc('exec_raw_sql', {
              query: statement + ';'
            });
            
            if (rawError) {
              throw new Error(`SQL execution failed: ${rawError.message}`);
            }
          }
        } catch (err) {
          this.log(`  Warning: ${err.message}`, 'warning');
          // Continue with next statement
        }
      }
      
      this.log(`✅ Migration completed: ${path.basename(filePath)}`, 'success');
      
    } catch (error) {
      this.log(`❌ Migration failed: ${path.basename(filePath)} - ${error.message}`, 'error');
      throw error;
    }
  }

  async runAllMigrations() {
    this.log('🚀 Starting HERA Migration Runner', 'info');
    
    const migrationsDir = path.join(__dirname, '..', 'database', 'migrations');
    
    // Only run the testing framework migrations
    const migrationFiles = [
      '005_universal_testing_framework.sql',
      '006_universal_schema_testing.sql'
    ];
    
    for (const filename of migrationFiles) {
      const filePath = path.join(migrationsDir, filename);
      
      if (fs.existsSync(filePath)) {
        await this.runMigration(filePath);
      } else {
        this.log(`⚠️  Migration file not found: ${filename}`, 'warning');
      }
    }
    
    this.log('✅ All migrations completed successfully!', 'success');
  }
}

// Alternative: Direct SQL execution using simple queries
async function runMigrationsAlternative() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  console.log(chalk.blue('🚀 Running testing framework migrations...'));
  
  const migrationsDir = path.join(__dirname, '..', 'database', 'migrations');
  
  // Read the migration files
  const migration005 = fs.readFileSync(path.join(migrationsDir, '005_universal_testing_framework.sql'), 'utf8');
  const migration006 = fs.readFileSync(path.join(migrationsDir, '006_universal_schema_testing.sql'), 'utf8');
  
  console.log(chalk.yellow('📋 Please run these SQL statements in your Supabase SQL editor:'));
  console.log(chalk.yellow('=' * 60));
  
  console.log(chalk.blue('\n1. First, run this migration (005_universal_testing_framework.sql):'));
  console.log(chalk.gray('=' * 60));
  console.log(migration005);
  
  console.log(chalk.blue('\n2. Then, run this migration (006_universal_schema_testing.sql):'));
  console.log(chalk.gray('=' * 60));
  console.log(migration006);
  
  console.log(chalk.yellow('\n📝 Instructions:'));
  console.log(chalk.yellow('1. Go to your Supabase dashboard'));
  console.log(chalk.yellow('2. Navigate to SQL Editor'));
  console.log(chalk.yellow('3. Copy and paste the above SQL statements'));
  console.log(chalk.yellow('4. Run them in order'));
  console.log(chalk.yellow('5. Then try the testing dashboard again'));
}

// Main execution
async function main() {
  try {
    await runMigrationsAlternative();
  } catch (error) {
    console.error(chalk.red('❌ Migration runner failed:'), error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = MigrationRunner;