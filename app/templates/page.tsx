'use client';

import React, { useState, useEffect } from 'react';
import { Search, Zap, Package, Clock, CheckCircle, TrendingUp, ArrowRight, Sparkles, Play } from 'lucide-react';

// HERA Gold Theme Colors
const theme = {
  primary: '#30D5C8',      // Teal accent
  background: '#1f2937',   // Gray-800 main background
  surface: '#374151',      // Gray-700 card surfaces
  textPrimary: '#ffffff',  // Primary text
  textSecondary: '#d1d5db', // Gray-300 secondary text
  hover: '#4b5563',        // Gray-600 hover states
};

interface Template {
  id: string;
  name: string;
  type: 'module' | 'package';
  category: string;
  industry: string;
  deploymentTime: number;
  modulesCount?: number;
  deploymentSuccess: number;
  description: string;
  featured?: boolean;
}

const TemplatesDashboard = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showDeploymentWizard, setShowDeploymentWizard] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // Load templates from API
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      console.log('Loading templates from APIs...');
      
      // Load both modules and packages from the Templates APIs
      const [modulesResponse, packagesResponse] = await Promise.all([
        fetch('/api/templates/modules?organizationId=00000000-0000-0000-0000-000000000001'),
        fetch('/api/templates/packages?organizationId=00000000-0000-0000-0000-000000000001')
      ]);

      console.log('API responses received:', { 
        modulesOk: modulesResponse.ok, 
        packagesOk: packagesResponse.ok 
      });

      if (!modulesResponse.ok || !packagesResponse.ok) {
        throw new Error('Failed to fetch templates');
      }

      const [modulesData, packagesData] = await Promise.all([
        modulesResponse.json(),
        packagesResponse.json()
      ]);

      console.log('API data received:', { 
        modulesCount: modulesData.data?.modules?.length || 0, 
        packagesCount: packagesData.data?.packages?.length || 0 
      });

      // Transform API data to UI format
      const allTemplates: Template[] = [];

      // Add modules
      if (modulesData.data?.modules) {
        modulesData.data.modules.forEach((module: any) => {
          allTemplates.push({
            id: module.id,
            name: module.entity_name || module.module_name,
            type: 'module',
            category: module.category || 'Operational',
            industry: module.industry_vertical || 'Universal',
            deploymentTime: Math.ceil((module.average_deployment_time || 60) / 60), // Convert to minutes
            deploymentSuccess: Math.round((module.success_rate || 0.95) * 100),
            description: module.description || `${module.entity_name || module.module_name} module for business operations`,
            featured: module.is_featured || false
          });
        });
      }

      // Add packages
      if (packagesData.data?.packages) {
        packagesData.data.packages.forEach((pkg: any) => {
          allTemplates.push({
            id: pkg.id,
            name: pkg.entity_name || pkg.package_name,
            type: 'package',
            category: 'Complete Solution',
            industry: pkg.industry_type === 'general' ? 'Universal' : (pkg.industry_type || 'Universal'),
            deploymentTime: Math.ceil((pkg.package_features?.estimated_deployment_time || 120) / 60), // Convert to minutes
            modulesCount: pkg.package_features?.total_modules || 0,
            deploymentSuccess: Math.round((pkg.deployment_stats?.success_rate || 95)),
            description: pkg.description || `Complete ${pkg.industry_type || 'business'} ERP package`,
            featured: pkg.is_featured || false
          });
        });
      }

      console.log('Total templates processed:', allTemplates.length);
      setTemplates(allTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      // Fallback to empty array on error
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleQuickDeploy = (template: Template) => {
    setSelectedTemplate(template);
    setShowDeploymentWizard(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
          <span className="text-white text-lg">Loading Templates...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-800">
      {/* Hero Section - Don't Make Me Think: Clear value proposition */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="h-10 w-10 text-teal-400 mr-3" />
              <h1 className="text-4xl font-bold text-white">
                HERA Global Templates
              </h1>
            </div>
            <p className="text-xl text-gray-300 mb-6 max-w-3xl mx-auto">
              Deploy complete ERP systems in <span className="text-teal-400 font-semibold">2 minutes</span> instead of 18 months. 
              Choose from 38+ ready-to-deploy templates.
            </p>
            
            {/* Key Metrics - Social Proof */}
            <div className="flex justify-center space-x-8 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-400">2 min</div>
                <div className="text-sm text-gray-400">Deployment Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-400">95%+</div>
                <div className="text-sm text-gray-400">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-400">38+</div>
                <div className="text-sm text-gray-400">Templates</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-400">$0</div>
                <div className="text-sm text-gray-400">Deployment Cost</div>
              </div>
            </div>

            {/* Primary CTA - Don't Make Me Think: One obvious choice */}
            <button 
              onClick={() => setShowDeploymentWizard(true)}
              className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-lg text-lg font-semibold inline-flex items-center transition-colors duration-200"
            >
              <Play className="h-5 w-5 mr-2" />
              Deploy Your First ERP System
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters - Don't Make Me Think: Simple, obvious controls */}
      <div className="px-6 py-6 border-b border-gray-600">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex space-x-3">
              {['all', 'Complete Solution', 'Financial', 'Operational'].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    selectedCategory === category
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {category === 'all' ? 'All Templates' : category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid - Don't Make Me Think: Scannable, consistent layout */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-4">No templates found</div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="text-teal-400 hover:text-teal-300 underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-gray-700 rounded-lg p-6 hover:bg-gray-600 transition-colors duration-200 border border-gray-600"
                >
                  {/* Template Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      {template.type === 'package' ? (
                        <Package className="h-6 w-6 text-teal-400 mr-2" />
                      ) : (
                        <Zap className="h-6 w-6 text-blue-400 mr-2" />
                      )}
                      <div>
                        <h3 className="font-semibold text-white text-lg">{template.name}</h3>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-sm text-gray-400">{template.industry}</span>
                          {template.featured && (
                            <span className="bg-teal-500 text-white text-xs px-2 py-1 rounded-full">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Template Description */}
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                    {template.description}
                  </p>

                  {/* Template Metrics - Visual Hierarchy */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-teal-400 mr-2" />
                      <span className="text-sm text-gray-300">
                        {template.deploymentTime} min deploy
                      </span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                      <span className="text-sm text-gray-300">
                        {template.deploymentSuccess}% success
                      </span>
                    </div>
                    {template.modulesCount && (
                      <div className="flex items-center col-span-2">
                        <TrendingUp className="h-4 w-4 text-blue-400 mr-2" />
                        <span className="text-sm text-gray-300">
                          {template.modulesCount} modules included
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons - Don't Make Me Think: Clear, obvious actions */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleQuickDeploy(template)}
                      className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Deploy Now
                    </button>
                    <button className="px-4 py-2 text-gray-300 border border-gray-500 rounded-lg hover:bg-gray-600 transition-colors duration-200">
                      Preview
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Deployment Wizard Modal - Don't Make Me Think: Simple flow */}
      {showDeploymentWizard && (
        <DeploymentWizard
          template={selectedTemplate}
          onClose={() => {
            setShowDeploymentWizard(false);
            setSelectedTemplate(null);
          }}
        />
      )}
    </div>
  );
};

// Deployment Wizard Component - Don't Make Me Think: Step-by-step, obvious progress
const DeploymentWizard = ({ 
  template, 
  onClose 
}: { 
  template: Template | null; 
  onClose: () => void; 
}) => {
  const [step, setStep] = useState(1);
  const [organizationId, setOrganizationId] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [businessSize, setBusinessSize] = useState('medium');
  const [deploymentOptions, setDeploymentOptions] = useState({
    setupChartOfAccounts: true,
    createDefaultWorkflows: true,
    enableAnalytics: true,
  });
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);

  // Debug logging for state changes
  React.useEffect(() => {
    console.log('🔄 STATE CHANGE: deployed =', deployed, ', deploying =', deploying);
  }, [deployed, deploying]);

  const handleDeploy = async () => {
    if (!template || !organizationName.trim()) {
      console.error('❌ Missing template or organization name');
      return;
    }
    
    // Auto-generate organization ID
    const autoGeneratedOrgId = crypto.randomUUID();
    setOrganizationId(autoGeneratedOrgId);
    
    console.log('🚀 Starting deployment:', {
      template: template.name,
      type: template.type,
      orgName: organizationName,
      orgId: autoGeneratedOrgId
    });
    
    setDeploying(true);
    let deploymentSuccessful = false;
    try {
      // Step 1: Create the organization first
      console.log('📋 Step 1: Creating organization...');
      const orgPayload = {
        id: autoGeneratedOrgId,
        org_name: organizationName.trim(),
        org_code: `${organizationName.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 4)}${Math.random().toString(36).substring(2, 4).toUpperCase()}ORG`,
        industry: 'restaurant',
        country: 'US',
        currency: 'USD',
        is_active: true
      };
      
      console.log('🏢 Creating organization:', orgPayload);
      
      const orgResponse = await fetch('/api/core/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orgPayload),
      });
      
      if (!orgResponse.ok) {
        const orgError = await orgResponse.text();
        console.error('❌ Organization creation failed:', orgError);
        throw new Error(`Failed to create organization: ${orgResponse.status} - ${orgError}`);
      }
      
      const orgResult = await orgResponse.json();
      console.log('✅ Organization created:', orgResult);
      
      // Step 2: Deploy the template to the new organization
      console.log('📦 Step 2: Deploying template...');
      const deploymentPayload = {
        deploymentType: template.type, // 'module' or 'package' - this is what the API expects
        organizationId: autoGeneratedOrgId,
        organizationName: organizationName.trim(),
        templateId: template.id,
        businessSize: businessSize,
        deploymentOptions: deploymentOptions,
        createdBy: autoGeneratedOrgId, // Using org ID as creator for now
        metadata: {
          templateName: template.name,
          industry: template.industry,
          category: template.category
        }
      };
      
      console.log('📦 Deployment payload:', deploymentPayload);
      
      // Use the real deployment API
      const response = await fetch('/api/templates/deployments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deploymentPayload),
      });

      console.log('📡 API Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error response:', errorText);
        throw new Error(`Deployment failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Deployment successful:', result);
      
      // Mark deployment as successful
      deploymentSuccessful = true;
      
      // Ensure proper state transition: first stop deploying, then set deployed
      console.log('🎉 Deployment API successful, transitioning state...');
      setDeploying(false);
      
      // Use setTimeout to ensure state update completes before showing success
      setTimeout(() => {
        console.log('🎉 Setting deployed state to true');
        setDeployed(true);
      }, 200);
    } catch (error) {
      console.error('❌ Deployment error:', error);
      // Show error in UI instead of always showing success
      alert(`Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Only set deploying to false if deployment was not successful (i.e., on error)
      if (!deploymentSuccessful) {
        console.log('❌ Deployment failed, cleaning up deploying state');
        setDeploying(false);
      }
    }
  };

  const totalSteps = 3;

  if (deployed) {
    console.log('🎉 SUCCESS MODAL: Rendering deployment success modal');
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-gray-700 rounded-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">
            Deployment Successful!
          </h2>
          <p className="text-gray-300 mb-6">
            {template?.name} has been deployed successfully. Your ERP system is now operational.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-3 px-6 rounded-lg font-medium"
            >
              View Dashboard
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 px-6 rounded-lg font-medium"
            >
              Deploy Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (deploying) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-gray-700 rounded-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-400 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Deploying {template?.name}
          </h2>
          <p className="text-gray-300 mb-6">
            Setting up your ERP system... This usually takes about {template?.deploymentTime} minutes.
          </p>
          <div className="bg-gray-800 rounded-full h-2 mb-2">
            <div className="bg-teal-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
          <p className="text-sm text-gray-400">Creating modules and workflows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-700 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            Deploy {template?.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Step {step} of {totalSteps}</span>
            <span className="text-sm text-gray-400">{Math.round((step / totalSteps) * 100)}% complete</span>
          </div>
          <div className="bg-gray-800 rounded-full h-2">
            <div 
              className="bg-teal-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        {step === 1 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Organization Setup</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="Enter your organization name (e.g., Mario's Italian Restaurant)"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Your organization ID will be auto-generated to ensure data isolation and security
                </p>
              </div>
              {organizationId && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Generated Organization ID
                  </label>
                  <input
                    type="text"
                    value={organizationId}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    This unique ID was automatically generated for your organization
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Configuration</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Business Size
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['small', 'medium', 'large', 'enterprise'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setBusinessSize(size)}
                      className={`py-2 px-4 rounded-lg text-sm font-medium capitalize transition-colors ${
                        businessSize === size
                          ? 'bg-teal-500 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Deployment Options
                </label>
                <div className="space-y-3">
                  {Object.entries(deploymentOptions).map(([key, value]) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setDeploymentOptions(prev => ({
                          ...prev,
                          [key]: e.target.checked
                        }))}
                        className="h-4 w-4 text-teal-500 focus:ring-teal-500 border-gray-600 rounded bg-gray-800"
                      />
                      <span className="ml-3 text-gray-300">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Review & Deploy</h3>
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-white mb-3">Deployment Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Template:</span>
                  <span className="text-white">{template?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Organization:</span>
                  <span className="text-white">{organizationName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Business Size:</span>
                  <span className="text-white capitalize">{businessSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Deployment Time:</span>
                  <span className="text-white">~{template?.deploymentTime} minutes</span>
                </div>
                {template?.modulesCount && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Modules:</span>
                    <span className="text-white">{template.modulesCount} modules</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-900 border border-blue-700 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="text-blue-400 mr-3 mt-0.5">ℹ</div>
                <div>
                  <h5 className="text-blue-200 font-medium mb-1">What happens next?</h5>
                  <ul className="text-blue-300 text-sm space-y-1">
                    <li>• ERP modules will be deployed to your organization</li>
                    <li>• Chart of accounts will be automatically created</li>
                    <li>• Default workflows will be configured</li>
                    <li>• You'll get instant access to your new ERP system</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className={`px-6 py-2 rounded-lg font-medium ${
              step === 1
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-500'
            }`}
          >
            Previous
          </button>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-500"
            >
              Cancel
            </button>
            
            {step < totalSteps ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !organizationName.trim()}
                className={`px-6 py-2 rounded-lg font-medium ${
                  (step === 1 && !organizationName.trim())
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-teal-500 text-white hover:bg-teal-600'
                }`}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleDeploy}
                className="px-6 py-2 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 flex items-center"
              >
                <Play className="h-4 w-4 mr-2" />
                Deploy Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatesDashboard;