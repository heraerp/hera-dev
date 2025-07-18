'use client'

import { useState } from 'react'
import UniversalCrudService from '@/lib/services/universalCrudService'
import { Card } from '@/components/ui/revolutionary-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Check, X, Loader2, Database, AlertTriangle, Copy } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function DatabaseSetupPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [setupResult, setSetupResult] = useState<{ success: boolean; message: string } | null>(null)
  const [supabase] = useState(() => createClient())

  const sqlScript = `-- HERA Universal Database Structure Setup
-- Execute this in your Supabase SQL Editor

-- Core Clients Table (Top Level - Business Entity)
CREATE TABLE IF NOT EXISTS core_clients (
    id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    client_code TEXT UNIQUE NOT NULL,
    client_type TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Core Organizations Table (Restaurant Locations)
CREATE TABLE IF NOT EXISTS core_organizations (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL REFERENCES core_clients(id),
    name TEXT NOT NULL,
    org_code TEXT NOT NULL,
    industry TEXT,
    country TEXT,
    currency TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Core Entities Table (Universal Entity Storage)
CREATE TABLE IF NOT EXISTS core_entities (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES core_organizations(id),
    entity_type TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    entity_code TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Core Dynamic Data Table (Flexible Attributes)
CREATE TABLE IF NOT EXISTS core_dynamic_data (
    id SERIAL PRIMARY KEY,
    entity_id TEXT NOT NULL REFERENCES core_entities(id),
    field_name TEXT NOT NULL,
    field_value TEXT,
    field_type TEXT DEFAULT 'text',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(entity_id, field_name)
);

-- Core Users Table
CREATE TABLE IF NOT EXISTS core_users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    role TEXT,
    auth_user_id TEXT UNIQUE
);

-- User-Client Relationships
CREATE TABLE IF NOT EXISTS user_clients (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES core_users(id),
    client_id TEXT NOT NULL REFERENCES core_clients(id),
    role TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, client_id)
);

-- User-Organization Relationships
CREATE TABLE IF NOT EXISTS user_organizations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES core_users(id),
    organization_id TEXT NOT NULL REFERENCES core_organizations(id),
    role TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, organization_id)
);

-- Enable Row Level Security
ALTER TABLE core_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_dynamic_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (Allow all for authenticated users)
CREATE POLICY "Allow all for authenticated users" ON core_clients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON core_organizations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON core_entities FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON core_dynamic_data FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON core_users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON user_clients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON user_organizations FOR ALL USING (auth.role() = 'authenticated');`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sqlScript)
      alert('SQL script copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const testDatabaseStructure = async () => {
    setIsCreating(true)
    setSetupResult(null)
    
    try {
      // Test if we can access core_clients table
      const { data, error } = await supabase
        .from('core_clients')
        .select('*')
        .limit(1)
      
      if (error) {
        setSetupResult({
          success: false,
          message: `Database structure not found: ${error.message}`
        })
      } else {
        setSetupResult({
          success: true,
          message: 'Database structure is ready! You can now use the restaurant setup.'
        })
      }
    } catch (err) {
      setSetupResult({
        success: false,
        message: `Error testing database: ${err instanceof Error ? err.message : 'Unknown error'}`
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card variant="elevated" className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Database className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Database Setup Required</h1>
              <p className="text-gray-600">
                Your Supabase database needs the HERA Universal structure to enable restaurant setup.
              </p>
            </div>
          </div>
        </Card>

        {/* Instructions */}
        <Card variant="elevated" className="p-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Setup Instructions
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge className="mt-1">1</Badge>
                <div>
                  <p className="font-medium">Go to your Supabase Dashboard</p>
                  <p className="text-sm text-gray-600">Open your Supabase project dashboard</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge className="mt-1">2</Badge>
                <div>
                  <p className="font-medium">Navigate to SQL Editor</p>
                  <p className="text-sm text-gray-600">Click on "SQL Editor" in the left sidebar</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge className="mt-1">3</Badge>
                <div>
                  <p className="font-medium">Copy & Execute the SQL Script</p>
                  <p className="text-sm text-gray-600">Copy the script below and execute it in the SQL Editor</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge className="mt-1">4</Badge>
                <div>
                  <p className="font-medium">Test the Setup</p>
                  <p className="text-sm text-gray-600">Click "Test Database Structure" below to verify</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* SQL Script */}
        <Card variant="elevated" className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">HERA Universal Structure SQL</h3>
              <Button onClick={copyToClipboard} variant="outline" size="sm" className="gap-2">
                <Copy className="w-4 h-4" />
                Copy Script
              </Button>
            </div>
            
            <div className="relative">
              <Textarea
                value={sqlScript}
                readOnly
                rows={20}
                className="font-mono text-sm bg-gray-50 border-gray-200"
              />
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This script creates all the required tables with proper relationships, 
                indexes, and Row Level Security policies. It's safe to run multiple times.
              </p>
            </div>
          </div>
        </Card>

        {/* Test Button */}
        <Card variant="elevated" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Test Database Structure</h3>
              <p className="text-sm text-gray-600">
                After running the SQL script, test if the database structure is ready
              </p>
            </div>
            <Button onClick={testDatabaseStructure} disabled={isCreating} className="gap-2">
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              {isCreating ? 'Testing...' : 'Test Database Structure'}
            </Button>
          </div>
          
          {setupResult && (
            <div className={`mt-4 p-4 rounded-lg border ${
              setupResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  setupResult.success ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {setupResult.success ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <X className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div>
                  <p className={`font-medium ${
                    setupResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {setupResult.success ? 'Database Ready!' : 'Database Not Ready'}
                  </p>
                  <p className={`text-sm ${
                    setupResult.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {setupResult.message}
                  </p>
                  {setupResult.success && (
                    <div className="mt-2">
                      <Button asChild size="sm">
                        <a href="/setup/restaurant">Go to Restaurant Setup</a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Quick Links */}
        <Card variant="glass" className="p-6">
          <div className="text-center space-y-4">
            <h3 className="font-semibold">Once Database is Ready</h3>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild variant="outline">
                <a href="/setup/test-db">Database Test Page</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/setup/restaurant">Restaurant Setup</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/setup">Setup Landing</a>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}