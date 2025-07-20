'use client';

import React, { useState, useEffect } from 'react';
import { ValidationRulesManager } from '@/components/validation/ValidationRulesManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Settings, 
  Database, 
  Users, 
  AlertCircle,
  CheckCircle,
  Play,
  Code,
  BookOpen
} from 'lucide-react';

export default function ValidationRulesPage() {
  const [organizationId, setOrganizationId] = useState<string>('00000000-0000-0000-0000-000000000001');
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  useEffect(() => {
    // Check if default validation rules are set up
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const response = await fetch(`/api/validation-rules?organizationId=${organizationId}`);
      const data = await response.json();
      setIsSetupComplete(data.total > 0);
    } catch (error) {
      console.error('Error checking setup status:', error);
    }
  };

  const runSetupFunction = async () => {
    try {
      // In a real implementation, you would call your setup function here
      // For now, we'll create some sample rules via the API
      const sampleRules = [
        {
          organizationId,
          name: 'Table Seat Capacity Rule',
          targetEntityType: 'restaurant_table',
          targetFieldName: 'seat_capacity',
          validationType: 'numeric_range',
          minValue: 1,
          maxValue: 50,
          errorMessage: 'Table seat capacity must be between 1 and 50',
          isActive: true
        },
        {
          organizationId,
          name: 'Menu Item Price Rule',
          targetEntityType: 'menu_item',
          targetFieldName: 'price',
          validationType: 'numeric_range',
          minValue: 0.01,
          errorMessage: 'Menu item price must be positive',
          isActive: true
        },
        {
          organizationId,
          name: 'Employee Email Format',
          targetEntityType: 'employee',
          targetFieldName: 'email',
          validationType: 'regex_pattern',
          regexPattern: '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$',
          errorMessage: 'Please enter a valid email address',
          isActive: true
        },
        {
          organizationId,
          name: 'Employee Hire Date Rule',
          targetEntityType: 'employee',
          targetFieldName: 'hire_date',
          validationType: 'date_rule',
          ruleExpression: 'no_future_dates',
          errorMessage: 'Employee hire date cannot be in the future',
          isActive: true
        }
      ];

      for (const rule of sampleRules) {
        await fetch('/api/validation-rules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rule)
        });
      }

      setIsSetupComplete(true);
      alert('Default validation rules have been created successfully!');
    } catch (error) {
      console.error('Error running setup:', error);
      alert('Error creating default validation rules. Please try again.');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Validation Rules Management</h1>
          <p className="text-gray-600 mt-2">
            Configure and manage field validation rules using HERA's Universal Schema
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isSetupComplete ? "default" : "secondary"}>
            {isSetupComplete ? (
              <><CheckCircle className="w-4 h-4 mr-1" /> Setup Complete</>
            ) : (
              <><AlertCircle className="w-4 h-4 mr-1" /> Setup Required</>
            )}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="manager" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="manager">
            <Settings className="w-4 h-4 mr-2" />
            Rules Manager
          </TabsTrigger>
          <TabsTrigger value="overview">
            <Shield className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="setup">
            <Database className="w-4 h-4 mr-2" />
            Setup
          </TabsTrigger>
          <TabsTrigger value="documentation">
            <BookOpen className="w-4 h-4 mr-2" />
            Documentation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manager">
          <ValidationRulesManager organizationId={organizationId} />
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-500" />
                  Universal Validation Architecture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <div>
                      <p className="font-medium">Layer 1: Organization Isolation</p>
                      <p className="text-sm text-gray-600">Multi-tenant data security</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div>
                      <p className="font-medium">Layer 2: Entity Reference Validation</p>
                      <p className="text-sm text-gray-600">Automatic business rule enforcement</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <div>
                      <p className="font-medium">Layer 3: Universal Field Validation</p>
                      <p className="text-sm text-gray-600">Dynamic, configurable rules as entities</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="w-5 h-5 mr-2 text-green-500" />
                  Validation Rule Types
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="font-medium">Numeric Range</span>
                    </div>
                    <Badge variant="outline">min/max values</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="font-medium">Regex Pattern</span>
                    </div>
                    <Badge variant="outline">text format validation</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="font-medium">Date Rules</span>
                    </div>
                    <Badge variant="outline">date constraints</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span className="font-medium">Custom Logic</span>
                    </div>
                    <Badge variant="outline">complex expressions</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Key Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <Users className="w-8 h-8 text-blue-500 mx-auto" />
                  <h3 className="font-semibold">Business User Control</h3>
                  <p className="text-sm text-gray-600">
                    Non-technical users can create and modify validation rules without code changes
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <Database className="w-8 h-8 text-green-500 mx-auto" />
                  <h3 className="font-semibold">Universal Schema Integration</h3>
                  <p className="text-sm text-gray-600">
                    Validation rules are stored as entities, following the same universal pattern
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <Shield className="w-8 h-8 text-purple-500 mx-auto" />
                  <h3 className="font-semibold">Multi-Tenant Security</h3>
                  <p className="text-sm text-gray-600">
                    Rules respect organization boundaries with client-level sharing options
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2 text-blue-500" />
                Database Setup & Initialization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Setup Function Available</h3>
                <p className="text-blue-800 text-sm mb-4">
                  The <code>setup_hera_validation_rules()</code> function creates default validation rules for common business scenarios.
                </p>
                {!isSetupComplete ? (
                  <Button onClick={runSetupFunction} className="bg-blue-600 hover:bg-blue-700">
                    <Play className="w-4 h-4 mr-2" />
                    Run Setup Function
                  </Button>
                ) : (
                  <div className="flex items-center space-x-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Setup completed successfully</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Default Rules Created:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">Table Seat Capacity</h4>
                    <p className="text-sm text-gray-600">Numeric range: 1-50 seats</p>
                    <Badge variant="outline" className="mt-2">restaurant_table.seat_capacity</Badge>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">Menu Item Price</h4>
                    <p className="text-sm text-gray-600">Minimum: $0.01</p>
                    <Badge variant="outline" className="mt-2">menu_item.price</Badge>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">Employee Email</h4>
                    <p className="text-sm text-gray-600">Valid email format required</p>
                    <Badge variant="outline" className="mt-2">employee.email</Badge>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">Hire Date</h4>
                    <p className="text-sm text-gray-600">No future dates allowed</p>
                    <Badge variant="outline" className="mt-2">employee.hire_date</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SQL Function</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm">
                  <code>{`-- Call the setup function to create default validation rules
SELECT setup_hera_validation_rules();

-- Verify rules were created
SELECT 
    ce.entity_name as rule_name,
    cdd1.field_value as target_entity,
    cdd2.field_value as target_field
FROM core_entities ce
JOIN core_dynamic_data cdd1 ON ce.id = cdd1.entity_id 
    AND cdd1.field_name = 'target_entity_type'
JOIN core_dynamic_data cdd2 ON ce.id = cdd2.entity_id 
    AND cdd2.field_name = 'target_field_name'
WHERE ce.entity_type = 'validation_rule'
    AND ce.is_active = true;`}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-green-500" />
                Documentation & Examples
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Creating Validation Rules</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium">1. Numeric Range Validation</h4>
                    <p className="text-sm text-gray-600">Set minimum and maximum values for numeric fields</p>
                    <div className="bg-gray-50 rounded p-2 mt-2 text-sm font-mono">
                      Example: price between $0.01 and $999.99
                    </div>
                  </div>
                  
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-medium">2. Regex Pattern Validation</h4>
                    <p className="text-sm text-gray-600">Use regular expressions to validate text format</p>
                    <div className="bg-gray-50 rounded p-2 mt-2 text-sm font-mono">
                      {"Example: ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"}
                    </div>
                  </div>
                  
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-medium">3. Date Rule Validation</h4>
                    <p className="text-sm text-gray-600">Apply constraints to date fields</p>
                    <div className="bg-gray-50 rounded p-2 mt-2 text-sm font-mono">
                      Example: no_future_dates, business_days_only
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Testing Validation Rules</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm">
                    <code>{`-- Test a validation rule directly
SELECT validate_field_against_universal_rules(
    'menu_item',     -- entity type
    'price',         -- field name  
    '15.99',         -- field value
    'number'         -- field type
);

-- This will either pass silently or raise an exception with your error message`}</code>
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Common Use Cases</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium">Restaurant Management</h4>
                    <ul className="text-sm text-gray-600 mt-2 space-y-1">
                      <li>• Menu item pricing rules</li>
                      <li>• Table capacity limits</li>
                      <li>• Staff contact validation</li>
                      <li>• Inventory quantity rules</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium">E-commerce</h4>
                    <ul className="text-sm text-gray-600 mt-2 space-y-1">
                      <li>• Product price validation</li>
                      <li>• SKU format requirements</li>
                      <li>• Customer email verification</li>
                      <li>• Order value limits</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}