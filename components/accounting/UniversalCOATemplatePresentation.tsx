'use client'

import React, { useState } from 'react';
import { 
  Database, 
  Copy, 
  Settings,
  ArrowRight,
  CheckCircle,
  Building,
  Users,
  FileText,
  Edit3,
  Plus,
  GitBranch,
  Target,
  Zap,
  Shield,
  Clock,
  ChevronRight,
  ChevronDown,
  Star,
  Globe,
  Workflow,
  TrendingUp,
  Award,
  BookOpen,
  Search,
  Filter,
  Download,
  Upload,
  BarChart3,
  Play
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

const UniversalCOATemplatePresentation = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [expandedSections, setExpandedSections] = useState(new Set(['system']));
  const [selectedTemplate, setSelectedTemplate] = useState('india-restaurant');

  const systemOrgId = '00000000-0000-0000-0000-000000000001';
  const restaurantOrgId = '7cc09b11-34c5-4299-b392-01a54ff84092';

  const toggleSection = (section) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const templates = {
    'india-restaurant': {
      name: 'India Restaurant Standard',
      description: 'Complete COA for Indian restaurant operations with GST compliance',
      icon: '🇮🇳',
      accounts: 25,
      compliance: ['GST', 'Companies Act 2013', 'GAAP'],
      deployments: 15,
      setupTime: '8 minutes',
      rating: 4.9,
      features: ['UPI Collections', 'CGST/SGST Handling', 'Cash Operations', 'Digital Payments']
    },
    'usa-services': {
      name: 'USA Professional Services',
      description: 'Standard COA for US-based professional service companies',
      icon: '🇺🇸',
      accounts: 28,
      compliance: ['GAAP', 'IRS', 'SOX'],
      deployments: 23,
      setupTime: '12 minutes',
      rating: 4.8,
      features: ['Revenue Recognition', 'Professional Fees', 'Tax Handling', 'Client Billing']
    },
    'uk-retail': {
      name: 'UK Retail Standard',
      description: 'Comprehensive COA for UK retail operations with VAT compliance',
      icon: '🇬🇧',
      accounts: 32,
      compliance: ['UK GAAP', 'VAT', 'Companies House'],
      deployments: 18,
      setupTime: '10 minutes',
      rating: 4.7,
      features: ['VAT Handling', 'Inventory Tracking', 'Retail Operations', 'Multi-location']
    }
  };

  const universalStructure = {
    system_org: {
      id: systemOrgId,
      name: 'System Organization',
      icon: <Database className="w-5 h-5 text-blue-600" />,
      description: 'Global template repository',
      entities: [
        {
          id: 'template-001',
          entity_type: 'coa_template',
          entity_name: 'India Restaurant Standard',
          entity_code: 'IND_REST_STD_v1',
          properties: {
            industry: 'RESTAURANT',
            country: 'INDIA',
            core_version: 'v1.0',
            compliance_version: 'v1.0',
            deployment_count: '15',
            status: 'active',
            ai_confidence: '0.98',
            last_updated: '2025-01-15'
          }
        },
        {
          id: 'account-001',
          entity_type: 'coa_template_account',
          entity_name: 'Cash in Hand',
          entity_code: 'CASH_IN_HAND',
          properties: {
            account_classification: 'ASSET',
            account_type: 'CURRENT_ASSET',
            normal_balance: 'DEBIT',
            suggested_account_code: '1110',
            ai_reasoning: 'Essential for cash-based restaurant operations',
            ai_confidence: '0.95',
            template_id: 'template-001'
          }
        },
        {
          id: 'account-002',
          entity_type: 'coa_template_account',
          entity_name: 'UPI Collections',
          entity_code: 'UPI_COLLECTIONS',
          properties: {
            account_classification: 'ASSET',
            account_type: 'CURRENT_ASSET',
            normal_balance: 'DEBIT',
            suggested_account_code: '1130',
            ai_reasoning: 'Critical for Indian digital payment landscape',
            ai_confidence: '0.98',
            country_specific: 'true',
            template_id: 'template-001'
          }
        },
        {
          id: 'account-003',
          entity_type: 'coa_template_account',
          entity_name: 'CGST Payable',
          entity_code: 'CGST_PAYABLE',
          properties: {
            account_classification: 'LIABILITY',
            account_type: 'TAX_LIABILITY',
            normal_balance: 'CREDIT',
            suggested_account_code: '2120',
            ai_reasoning: 'GST output liability - legally required',
            ai_confidence: '1.0',
            compliance_required: 'true',
            template_id: 'template-001'
          }
        }
      ]
    },
    restaurant_org: {
      id: restaurantOrgId,
      name: 'Restaurant Organization',
      icon: <Building className="w-5 h-5 text-green-600" />,
      description: 'Live organization with adopted template',
      entities: [
        {
          id: 'adoption-001',
          entity_type: 'coa_adoption',
          entity_name: 'Adopted India Restaurant Template',
          entity_code: 'ADOPTION_IND_REST_001',
          properties: {
            source_template_id: 'template-001',
            adoption_date: '2025-01-15',
            deployment_status: 'completed',
            accounts_created: '25',
            setup_time_minutes: '8',
            user_id: 'user-001',
            customizations_count: '3'
          }
        },
        {
          id: 'org-account-001',
          entity_type: 'coa_account',
          entity_name: 'Cash in Hand',
          entity_code: 'CASH_IN_HAND',
          properties: {
            account_classification: 'ASSET',
            account_type: 'CURRENT_ASSET',
            normal_balance: 'DEBIT',
            account_code: '1110',
            source_template_account_id: 'account-001',
            created_from_template: 'true',
            adoption_id: 'adoption-001'
          }
        },
        {
          id: 'org-account-002',
          entity_type: 'coa_account',
          entity_name: 'UPI Collections',
          entity_code: 'UPI_COLLECTIONS',
          properties: {
            account_classification: 'ASSET',
            account_type: 'CURRENT_ASSET',
            normal_balance: 'DEBIT',
            account_code: '1130',
            source_template_account_id: 'account-002',
            created_from_template: 'true',
            adoption_id: 'adoption-001'
          }
        },
        {
          id: 'custom-account-001',
          entity_type: 'coa_account',
          entity_name: 'Delivery App Commission',
          entity_code: 'DELIVERY_COMMISSION',
          properties: {
            account_classification: 'EXPENSE',
            account_type: 'OPERATING_EXPENSE',
            normal_balance: 'DEBIT',
            account_code: '5150',
            custom_addition: 'true',
            reason_for_addition: 'Specific to our delivery model',
            added_by: 'user-001',
            date_added: '2025-01-15'
          }
        }
      ]
    }
  };

  const steps = [
    {
      number: 1,
      title: 'Browse Templates',
      description: 'Explore industry-specific templates',
      icon: <Search className="w-5 h-5" />,
      color: 'bg-blue-500',
      detail: 'Browse our curated library of industry and region-specific COA templates, each designed by experts and validated by AI.'
    },
    {
      number: 2,
      title: 'One-Click Adopt',
      description: 'Deploy complete COA instantly',
      icon: <Copy className="w-5 h-5" />,
      color: 'bg-green-500',
      detail: 'Single click copies entire template to your organization, creating all accounts with proper classifications and relationships.'
    },
    {
      number: 3,
      title: 'Smart Customize',
      description: 'Add business-specific accounts',
      icon: <Edit3 className="w-5 h-5" />,
      color: 'bg-purple-500',
      detail: 'AI suggests customizations based on your business model. Add, modify, or remove accounts while maintaining compliance.'
    },
    {
      number: 4,
      title: 'Instant Deploy',
      description: 'Ready for transactions',
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'bg-orange-500',
      detail: 'Complete COA is deployed and ready for use. All compliance requirements met, audit trails preserved.'
    }
  ];

  const benefits = [
    {
      icon: <Clock className="w-8 h-8 text-blue-600" />,
      title: 'Setup Time',
      metric: '< 30 minutes',
      description: 'vs weeks traditional',
      color: 'bg-blue-50'
    },
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      title: 'Compliance',
      metric: '100%',
      description: 'out-of-the-box',
      color: 'bg-green-50'
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-purple-600" />,
      title: 'Adoption Rate',
      metric: '90%',
      description: 'template completion',
      color: 'bg-purple-50'
    },
    {
      icon: <Star className="w-8 h-8 text-orange-600" />,
      title: 'Satisfaction',
      metric: '4.8/5',
      description: 'user rating',
      color: 'bg-orange-50'
    }
  ];

  const renderEntity = (entity, orgType) => (
    <Card key={entity.id} className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className={`p-1 rounded ${
              entity.entity_type === 'coa_template' ? 'bg-blue-100' :
              entity.entity_type === 'coa_template_account' ? 'bg-green-100' :
              entity.entity_type === 'coa_adoption' ? 'bg-purple-100' :
              entity.entity_type === 'coa_account' ? 'bg-orange-100' : 'bg-gray-100'
            }`}>
              {entity.entity_type === 'coa_template' && <FileText className="w-4 h-4 text-blue-600" />}
              {entity.entity_type === 'coa_template_account' && <FileText className="w-4 h-4 text-green-600" />}
              {entity.entity_type === 'coa_adoption' && <Copy className="w-4 h-4 text-purple-600" />}
              {entity.entity_type === 'coa_account' && <FileText className="w-4 h-4 text-orange-600" />}
            </div>
            <div>
              <div className="font-medium text-gray-900">{entity.entity_name}</div>
              <Badge variant="outline" className="text-xs">{entity.entity_type}</Badge>
            </div>
          </div>
          <div className="text-xs text-gray-400 font-mono">{entity.entity_code}</div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(entity.properties).slice(0, 4).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-gray-600">{key.replace(/_/g, ' ')}:</span>
              <span className="text-gray-900 font-mono">{value}</span>
            </div>
          ))}
        </div>
        {Object.keys(entity.properties).length > 4 && (
          <div className="text-xs text-gray-500 mt-2">
            +{Object.keys(entity.properties).length - 4} more properties
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderOrganization = (orgKey, orgData) => (
    <Card key={orgKey} className="mb-4">
      <CardHeader 
        className="cursor-pointer"
        onClick={() => toggleSection(orgKey)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {orgData.icon}
            <div>
              <CardTitle className="text-lg">{orgData.name}</CardTitle>
              <p className="text-sm text-gray-600">{orgData.description}</p>
              <p className="text-xs text-gray-500 font-mono">{orgData.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{orgData.entities.length} entities</Badge>
            {expandedSections.has(orgKey) ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>
      </CardHeader>
      
      {expandedSections.has(orgKey) && (
        <CardContent>
          <div className="space-y-3">
            {orgData.entities.map(entity => renderEntity(entity, orgKey))}
          </div>
        </CardContent>
      )}
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      {/* Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 p-3 rounded-xl">
              <GitBranch className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Universal Schema COA Template System
              </h1>
              <p className="text-lg text-gray-600">
                Enterprise-grade templates → One-click deployment → Smart customization
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="outline" className="bg-blue-50">
                  <Database className="w-3 h-3 mr-1" />
                  Universal Schema
                </Badge>
                <Badge variant="outline" className="bg-green-50">
                  <Zap className="w-3 h-3 mr-1" />
                  AI-Powered
                </Badge>
                <Badge variant="outline" className="bg-purple-50">
                  <Shield className="w-3 h-3 mr-1" />
                  Compliance Ready
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="process">Process</TabsTrigger>
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Revolutionary Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className={`text-center p-6 ${benefit.color} rounded-lg`}>
                    <div className="flex justify-center mb-3">{benefit.icon}</div>
                    <h3 className="font-semibold text-gray-900">{benefit.title}</h3>
                    <div className="text-2xl font-bold text-gray-900 my-2">{benefit.metric}</div>
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Process Steps Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Workflow className="w-5 h-5 mr-2" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {steps.map((step, index) => (
                  <div key={step.number} className="text-center p-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white mx-auto mb-3 ${step.color}`}>
                      {step.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                    <p className="text-xs text-gray-500">{step.detail}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Universal Schema Advantages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Universal Schema Advantages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium">No New Tables Required</span>
                  </div>
                  <p className="text-sm text-gray-600 ml-8">
                    Uses existing core_entities, core_dynamic_data, and core_relationships tables
                  </p>
                  
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium">System Organization as Template Store</span>
                  </div>
                  <p className="text-sm text-gray-600 ml-8">
                    Global template repository accessible to all organizations
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Standard Adoption Process</span>
                  </div>
                  <p className="text-sm text-gray-600 ml-8">
                    One-click copying with complete property preservation
                  </p>
                  
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Minor Modifications Supported</span>
                  </div>
                  <p className="text-sm text-gray-600 ml-8">
                    Add custom accounts while maintaining template traceability
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          {/* Template Gallery */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Available Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(templates).map(([key, template]) => (
                  <Card 
                    key={key} 
                    className={`cursor-pointer transition-all ${
                      selectedTemplate === key ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedTemplate(key)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="text-2xl">{template.icon}</div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{template.name}</h3>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-3 h-3 ${
                                    i < Math.floor(template.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`} 
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">{template.rating}</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Accounts:</span>
                          <span className="font-medium">{template.accounts}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Setup Time:</span>
                          <span className="font-medium">{template.setupTime}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Deployments:</span>
                          <span className="font-medium">{template.deployments}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1">
                          {template.compliance.map((comp, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {comp}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Key Features:</h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {template.features.map((feature, index) => (
                            <li key={index} className="flex items-center">
                              <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Template Details */}
          {selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  {templates[selectedTemplate].name} - Detailed View
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Template Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Success Rate:</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={95} className="w-20 h-2" />
                          <span className="text-sm font-medium">95%</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">User Satisfaction:</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={templates[selectedTemplate].rating * 20} className="w-20 h-2" />
                          <span className="text-sm font-medium">{templates[selectedTemplate].rating}/5</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Setup Completion:</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={90} className="w-20 h-2" />
                          <span className="text-sm font-medium">90%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Recent Deployments</h4>
                    <div className="space-y-2">
                      {[
                        { org: 'Spice Route Café', date: '2 days ago', status: 'Completed' },
                        { org: 'Mumbai Kitchen', date: '1 week ago', status: 'Completed' },
                        { org: 'Delhi Darbar', date: '2 weeks ago', status: 'Completed' }
                      ].map((deployment, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium text-sm">{deployment.org}</div>
                            <div className="text-xs text-gray-500">{deployment.date}</div>
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {deployment.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="process" className="space-y-6">
          {/* Process Steps Detail */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Workflow className="w-5 h-5 mr-2" />
                Template Adoption Process
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div 
                      className={`flex items-center space-x-3 cursor-pointer ${
                        activeStep >= step.number ? 'text-gray-900' : 'text-gray-400'
                      }`}
                      onClick={() => setActiveStep(step.number)}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                        activeStep >= step.number ? step.color : 'bg-gray-300'
                      }`}>
                        {step.icon}
                      </div>
                      <div className="hidden md:block">
                        <div className="font-medium">{step.title}</div>
                        <div className="text-sm text-gray-500">{step.description}</div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-1 mx-4 rounded ${
                        activeStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step Details */}
              <Card className="bg-gray-50">
                <CardContent className="p-6">
                  {activeStep === 1 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">Step 1: Browse Templates</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">What Happens:</h4>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-center">
                              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                              Browse curated template library
                            </li>
                            <li className="flex items-center">
                              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                              Filter by industry and country
                            </li>
                            <li className="flex items-center">
                              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                              Review compliance requirements
                            </li>
                            <li className="flex items-center">
                              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                              Check deployment statistics
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Universal Schema:</h4>
                          <div className="bg-white p-3 rounded border">
                            <div className="text-xs font-mono text-gray-700">
                              core_entities WHERE<br/>
                              &nbsp;&nbsp;organization_id = 'system'<br/>
                              &nbsp;&nbsp;entity_type = 'coa_template'<br/>
                              &nbsp;&nbsp;is_active = true
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStep === 2 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">Step 2: One-Click Adopt</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">What Happens:</h4>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-center">
                              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                              Create adoption tracking entity
                            </li>
                            <li className="flex items-center">
                              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                              Copy all template accounts
                            </li>
                            <li className="flex items-center">
                              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                              Preserve all properties and relationships
                            </li>
                            <li className="flex items-center">
                              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                              Change entity_type to 'coa_account'
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">SQL Function:</h4>
                          <div className="bg-white p-3 rounded border">
                            <div className="text-xs font-mono text-gray-700">
                              adopt_coa_template(<br/>
                              &nbsp;&nbsp;template_id,<br/>
                              &nbsp;&nbsp;organization_id,<br/>
                              &nbsp;&nbsp;user_id<br/>
                              )
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStep === 3 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">Step 3: Smart Customize</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">What Happens:</h4>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-center">
                              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                              AI suggests business-specific accounts
                            </li>
                            <li className="flex items-center">
                              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                              Add custom accounts as needed
                            </li>
                            <li className="flex items-center">
                              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                              Modify account names for clarity
                            </li>
                            <li className="flex items-center">
                              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                              Track all modifications with audit trail
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Customization Types:</h4>
                          <div className="space-y-2">
                            <Badge variant="outline" className="bg-blue-50">Account Addition</Badge>
                            <Badge variant="outline" className="bg-green-50">Name Modification</Badge>
                            <Badge variant="outline" className="bg-purple-50">Property Updates</Badge>
                            <Badge variant="outline" className="bg-orange-50">Custom Relationships</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStep === 4 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">Step 4: Instant Deploy</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">What Happens:</h4>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-center">
                              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                              Complete COA deployed in organization
                            </li>
                            <li className="flex items-center">
                              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                              All accounts ready for transactions
                            </li>
                            <li className="flex items-center">
                              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                              Compliance automatically validated
                            </li>
                            <li className="flex items-center">
                              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                              Full audit trail preserved
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Ready Features:</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-2 bg-white rounded">
                              <span className="text-sm">Account Codes</span>
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="flex items-center justify-between p-2 bg-white rounded">
                              <span className="text-sm">Balance Types</span>
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="flex items-center justify-between p-2 bg-white rounded">
                              <span className="text-sm">Tax Handling</span>
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="flex items-center justify-between p-2 bg-white rounded">
                              <span className="text-sm">Reporting Ready</span>
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="architecture" className="space-y-6">
          {/* Universal Schema Structure */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(universalStructure).map(([orgKey, orgData]) => (
              <div key={orgKey}>
                {renderOrganization(orgKey, orgData)}
              </div>
            ))}
          </div>

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Technical Implementation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Core Tables Used</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-blue-50 rounded border">
                      <div className="font-medium text-blue-900">core_entities</div>
                      <div className="text-sm text-blue-700">Templates and accounts</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded border">
                      <div className="font-medium text-green-900">core_dynamic_data</div>
                      <div className="text-sm text-green-700">Account properties</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded border">
                      <div className="font-medium text-purple-900">core_relationships</div>
                      <div className="text-sm text-purple-700">Hierarchical structure</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Entity Types</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">coa_template</span>
                      <Badge variant="outline">Template Definition</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">coa_template_account</span>
                      <Badge variant="outline">Template Account</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">coa_adoption</span>
                      <Badge variant="outline">Adoption Tracking</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">coa_account</span>
                      <Badge variant="outline">Live Account</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-900">8 min</div>
                  <div className="text-sm text-blue-700">Average Setup Time</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-900">25x</div>
                  <div className="text-sm text-green-700">Faster than Manual</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Star className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-900">99%</div>
                  <div className="text-sm text-purple-700">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <CardContent className="p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Ready to Transform Your COA Setup?</h2>
            <p className="text-blue-100 mb-4">
              Join hundreds of organizations already using Universal COA Templates
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="secondary" size="lg">
                <Play className="w-4 h-4 mr-2" />
                Try Demo
              </Button>
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-blue-600">
                <BookOpen className="w-4 h-4 mr-2" />
                View Documentation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UniversalCOATemplatePresentation;