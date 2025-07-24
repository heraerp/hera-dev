"use client";

import { useState, useMemo } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  BookOpenIcon,
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  ViewfinderCircleIcon,
  BanknotesIcon,
  CpuChipIcon,
  CubeIcon,
  ShoppingCartIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  BuildingStorefrontIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  MegaphoneIcon,
  HeartIcon,
  FolderIcon,
  ClockIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
  SparklesIcon,
  UserGroupIcon,
  CogIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { AppCard } from '../../../components/erp/app-card';
import { useTheme } from '../../../components/providers/theme-provider';

export default function ERPAppStorePage() {
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Complete app catalog
  const apps = [
    // Finance Apps (6)
    {
      id: 'gl-core',
      name: 'General Ledger',
      description: '4-phase AI-powered GL system with real-time intelligence, autonomous validation, and ML anomaly detection',
      icon: BookOpenIcon,
      category: 'finance',
      categoryName: 'Finance',
      status: 'live',
      href: '/app-erp/finance/gl',
      features: ['7-digit COA', '4-phase AI intelligence', 'Real-time monitoring', 'Autonomous validation'],
      downloads: '2.1K',
      rating: 4.9,
      size: '15.2 MB',
      lastUpdated: '2 days ago',
      developer: 'HERA Finance Team',
      screenshots: 4,
      tags: ['AI', 'Accounting', 'Intelligence', 'Real-time']
    },
    {
      id: 'digital-accountant',
      name: 'Digital Accountant',
      description: 'AI-powered financial assistant with document processing, three-way matching, and process automation',
      icon: CpuChipIcon,
      category: 'finance',
      categoryName: 'Finance',
      status: 'live',
      href: '/app-erp/finance/digital-accountant',
      features: ['Document processing', 'Three-way matching', 'AI analytics', 'Process automation'],
      downloads: '1.8K',
      rating: 4.8,
      size: '22.1 MB',
      lastUpdated: '1 week ago',
      developer: 'HERA AI Team',
      screenshots: 6,
      tags: ['AI', 'Automation', 'Documents', 'Matching']
    },
    {
      id: 'accounts-receivable',
      name: 'Accounts Receivable',
      description: 'Complete AR management with customer invoicing, payment tracking, and aging analysis',
      icon: ArrowDownCircleIcon,
      category: 'finance',
      categoryName: 'Finance',
      status: 'coming-soon',
      href: '/app-erp/finance/ar',
      features: ['Invoice management', 'Payment processing', 'Aging reports', 'Customer analytics'],
      downloads: '0',
      rating: 0,
      size: 'TBD',
      lastUpdated: 'Coming Soon',
      developer: 'HERA Finance Team',
      screenshots: 0,
      tags: ['Invoicing', 'Payments', 'Customers', 'Reports']
    },
    {
      id: 'accounts-payable',
      name: 'Accounts Payable',
      description: 'Vendor bill management with automated approval workflows and payment processing',
      icon: ArrowUpCircleIcon,
      category: 'finance',
      categoryName: 'Finance',
      status: 'coming-soon',
      href: '/app-erp/finance/ap',
      features: ['Vendor bills', 'Approval workflows', 'Payment automation', 'Three-way matching'],
      downloads: '0',
      rating: 0,
      size: 'TBD',
      lastUpdated: 'Coming Soon',
      developer: 'HERA Finance Team',
      screenshots: 0,
      tags: ['Vendors', 'Approvals', 'Payments', 'Workflows']
    },
    {
      id: 'budget-control',
      name: 'Budget Control',
      description: 'Advanced budget planning, variance analysis, and financial control systems',
      icon: ViewfinderCircleIcon,
      category: 'finance',
      categoryName: 'Finance',
      status: 'coming-soon',
      href: '/app-erp/finance/budget',
      features: ['Budget planning', 'Variance analysis', 'Approval controls', 'Forecasting'],
      downloads: '0',
      rating: 0,
      size: 'TBD',
      lastUpdated: 'Coming Soon',
      developer: 'HERA Finance Team',
      screenshots: 0,
      tags: ['Budgets', 'Planning', 'Controls', 'Forecasting']
    },
    {
      id: 'cash-management',
      name: 'Cash Management',
      description: 'Cash flow forecasting, bank reconciliation, and liquidity management',
      icon: BanknotesIcon,
      category: 'finance',
      categoryName: 'Finance',
      status: 'coming-soon',
      href: '/app-erp/finance/cash',
      features: ['Cash flow forecasting', 'Bank reconciliation', 'Liquidity management', 'Position tracking'],
      downloads: '0',
      rating: 0,
      size: 'TBD',
      lastUpdated: 'Coming Soon',
      developer: 'HERA Finance Team',
      screenshots: 0,
      tags: ['Cash Flow', 'Banking', 'Forecasting', 'Reconciliation']
    },

    // Operations Apps (5)
    {
      id: 'inventory-management',
      name: 'Inventory Management',
      description: 'Smart inventory tracking with AI forecasting, real-time alerts, and analytics',
      icon: CubeIcon,
      category: 'operations',
      categoryName: 'Operations',
      status: 'live',
      href: '/app-erp/operations/inventory',
      features: ['Real-time tracking', 'Smart alerts', 'Usage analytics', 'Stock adjustments'],
      downloads: '1.5K',
      rating: 4.7,
      size: '18.3 MB',
      lastUpdated: '3 days ago',
      developer: 'HERA Operations Team',
      screenshots: 5,
      tags: ['Inventory', 'Tracking', 'Analytics', 'Alerts']
    },
    {
      id: 'procurement',
      name: 'Procurement',
      description: 'Complete procurement management with PO workflows, supplier management, and approvals',
      icon: ShoppingCartIcon,
      category: 'operations',
      categoryName: 'Operations',
      status: 'live',
      href: '/app-erp/operations/procurement',
      features: ['PO management', 'Supplier portal', 'Approval workflows', 'Goods receiving'],
      downloads: '1.2K',
      rating: 4.6,
      size: '16.7 MB',
      lastUpdated: '1 week ago',
      developer: 'HERA Operations Team',
      screenshots: 4,
      tags: ['Procurement', 'Suppliers', 'Purchase Orders', 'Approvals']
    },
    {
      id: 'manufacturing',
      name: 'Manufacturing',
      description: 'Production planning, BOM management, work orders, and capacity planning',
      icon: WrenchScrewdriverIcon,
      category: 'operations',
      categoryName: 'Operations',
      status: 'coming-soon',
      href: '/app-erp/operations/manufacturing',
      features: ['Production planning', 'BOM management', 'Work orders', 'Capacity planning'],
      downloads: '0',
      rating: 0,
      size: 'TBD',
      lastUpdated: 'Coming Soon',
      developer: 'HERA Operations Team',
      screenshots: 0,
      tags: ['Manufacturing', 'Production', 'BOM', 'Work Orders']
    },
    {
      id: 'quality-management',
      name: 'Quality Management',
      description: 'Quality inspections, defect tracking, compliance standards, and audit trails',
      icon: ShieldCheckIcon,
      category: 'operations',
      categoryName: 'Operations',
      status: 'coming-soon',
      href: '/app-erp/operations/quality',
      features: ['Quality inspections', 'Defect tracking', 'Compliance standards', 'Audit trails'],
      downloads: '0',
      rating: 0,
      size: 'TBD',
      lastUpdated: 'Coming Soon',
      developer: 'HERA Operations Team',
      screenshots: 0,
      tags: ['Quality', 'Inspections', 'Compliance', 'Audits']
    },
    {
      id: 'warehouse-management',
      name: 'Warehouse Management',
      description: 'Location management, pick/pack operations, cycle counting, and space optimization',
      icon: BuildingStorefrontIcon,
      category: 'operations',
      categoryName: 'Operations',
      status: 'coming-soon',
      href: '/app-erp/operations/warehouse',
      features: ['Location management', 'Pick/pack operations', 'Cycle counting', 'Space optimization'],
      downloads: '0',
      rating: 0,
      size: 'TBD',
      lastUpdated: 'Coming Soon',
      developer: 'HERA Operations Team',
      screenshots: 0,
      tags: ['Warehouse', 'Locations', 'Picking', 'Optimization']
    },

    // Sales & Marketing Apps (4)
    {
      id: 'crm-core',
      name: 'Customer CRM',
      description: '360-degree customer relationship management with contact tracking and analytics',
      icon: UsersIcon,
      category: 'sales-marketing',
      categoryName: 'Sales & Marketing',
      status: 'coming-soon',
      href: '/app-erp/sales-marketing/crm',
      features: ['360° customer view', 'Contact management', 'Activity tracking', 'Customer analytics'],
      downloads: '0',
      rating: 0,
      size: 'TBD',
      lastUpdated: 'Coming Soon',
      developer: 'HERA CRM Team',
      screenshots: 0,
      tags: ['CRM', 'Customers', 'Contacts', 'Analytics']
    },
    {
      id: 'sales-automation',
      name: 'Sales Force',
      description: 'Sales pipeline management, opportunity tracking, and commission calculations',
      icon: ChatBubbleLeftRightIcon,
      category: 'sales-marketing',
      categoryName: 'Sales & Marketing',
      status: 'coming-soon',
      href: '/app-erp/sales-marketing/sales',
      features: ['Sales pipeline', 'Opportunity tracking', 'Commission tracking', 'Sales analytics'],
      downloads: '0',
      rating: 0,
      size: 'TBD',
      lastUpdated: 'Coming Soon',
      developer: 'HERA Sales Team',
      screenshots: 0,
      tags: ['Sales', 'Pipeline', 'Opportunities', 'Commissions']
    },
    {
      id: 'marketing-automation',
      name: 'Marketing Hub',
      description: 'Marketing campaigns, lead management, and marketing analytics',
      icon: MegaphoneIcon,
      category: 'sales-marketing',
      categoryName: 'Sales & Marketing',
      status: 'coming-soon',
      href: '/app-erp/sales-marketing/marketing',
      features: ['Campaign management', 'Lead tracking', 'Email automation', 'Marketing analytics'],
      downloads: '0',
      rating: 0,
      size: 'TBD',
      lastUpdated: 'Coming Soon',
      developer: 'HERA Marketing Team',
      screenshots: 0,
      tags: ['Marketing', 'Campaigns', 'Leads', 'Automation']
    },
    {
      id: 'service-management',
      name: 'Service Desk',
      description: 'Customer service ticketing, SLA management, and knowledge base',
      icon: HeartIcon,
      category: 'sales-marketing',
      categoryName: 'Sales & Marketing',
      status: 'coming-soon',
      href: '/app-erp/sales-marketing/service',
      features: ['Service tickets', 'SLA management', 'Knowledge base', 'Customer satisfaction'],
      downloads: '0',
      rating: 0,
      size: 'TBD',
      lastUpdated: 'Coming Soon',
      developer: 'HERA Service Team',
      screenshots: 0,
      tags: ['Service', 'Tickets', 'SLA', 'Support']
    },

    // Human Resources Apps (4)
    {
      id: 'hr-core',
      name: 'Employee Hub',
      description: 'Complete employee lifecycle management with onboarding and directory',
      icon: UserGroupIcon,
      category: 'human-resources',
      categoryName: 'Human Resources',
      status: 'coming-soon',
      href: '/app-erp/human-resources/employees',
      features: ['Employee directory', 'Onboarding workflows', 'Profile management', 'Org charts'],
      downloads: '0',
      rating: 0,
      size: 'TBD',
      lastUpdated: 'Coming Soon',
      developer: 'HERA HR Team',
      screenshots: 0,
      tags: ['HR', 'Employees', 'Onboarding', 'Directory']
    },
    {
      id: 'payroll-management',
      name: 'Payroll Pro',
      description: 'Automated payroll processing with tax compliance and reporting',
      icon: BanknotesIcon,
      category: 'human-resources',
      categoryName: 'Human Resources',
      status: 'coming-soon',
      href: '/app-erp/human-resources/payroll',
      features: ['Payroll automation', 'Tax compliance', 'Direct deposit', 'Payroll reports'],
      downloads: '0',
      rating: 0,
      size: 'TBD',
      lastUpdated: 'Coming Soon',
      developer: 'HERA HR Team',
      screenshots: 0,
      tags: ['Payroll', 'Automation', 'Taxes', 'Compliance']
    },
    {
      id: 'performance-management',
      name: 'Performance Track',
      description: 'Performance reviews, goal management, and employee development',
      icon: ViewfinderCircleIcon,
      category: 'human-resources',
      categoryName: 'Human Resources',
      status: 'coming-soon',
      href: '/app-erp/human-resources/performance',
      features: ['Performance reviews', 'Goal tracking', 'Development plans', 'Feedback systems'],
      downloads: '0',
      rating: 0,
      size: 'TBD',
      lastUpdated: 'Coming Soon',
      developer: 'HERA HR Team',
      screenshots: 0,
      tags: ['Performance', 'Reviews', 'Goals', 'Development']
    },
    {
      id: 'recruitment',
      name: 'Talent Finder',
      description: 'Recruitment management with candidate tracking and hiring workflows',
      icon: MagnifyingGlassIcon,
      category: 'human-resources',
      categoryName: 'Human Resources',
      status: 'coming-soon',
      href: '/app-erp/human-resources/recruitment',
      features: ['Job postings', 'Candidate tracking', 'Interview scheduling', 'Hiring workflows'],
      downloads: '0',
      rating: 0,
      size: 'TBD',
      lastUpdated: 'Coming Soon',
      developer: 'HERA HR Team',
      screenshots: 0,
      tags: ['Recruitment', 'Candidates', 'Hiring', 'Jobs']
    },

    // Projects Apps (3)
    {
      id: 'project-management',
      name: 'Project Pro',
      description: 'Project planning, milestone tracking, and team collaboration',
      icon: FolderIcon,
      category: 'projects',
      categoryName: 'Projects',
      status: 'coming-soon',
      href: '/app-erp/projects/planning',
      features: ['Project planning', 'Milestone tracking', 'Team collaboration', 'Gantt charts'],
      downloads: '0',
      rating: 0,
      size: 'TBD',
      lastUpdated: 'Coming Soon',
      developer: 'HERA Projects Team',
      screenshots: 0,
      tags: ['Projects', 'Planning', 'Milestones', 'Collaboration']
    },
    {
      id: 'time-tracking',
      name: 'Time Tracker',
      description: 'Time tracking, timesheet management, and productivity analytics',
      icon: ClockIcon,
      category: 'projects',
      categoryName: 'Projects',
      status: 'coming-soon',
      href: '/app-erp/projects/tracking',
      features: ['Time tracking', 'Timesheet approval', 'Project time reports', 'Productivity metrics'],
      downloads: '0',
      rating: 0,
      size: 'TBD',
      lastUpdated: 'Coming Soon',
      developer: 'HERA Projects Team',
      screenshots: 0,
      tags: ['Time', 'Tracking', 'Timesheets', 'Productivity']
    },
    {
      id: 'resource-management',
      name: 'Resource Planner',
      description: 'Resource allocation, capacity planning, and utilization tracking',
      icon: UserGroupIcon,
      category: 'projects',
      categoryName: 'Projects',
      status: 'coming-soon',
      href: '/app-erp/projects/resources',
      features: ['Resource allocation', 'Capacity planning', 'Utilization tracking', 'Resource optimization'],
      downloads: '0',
      rating: 0,
      size: 'TBD',
      lastUpdated: 'Coming Soon',
      developer: 'HERA Projects Team',
      screenshots: 0,
      tags: ['Resources', 'Allocation', 'Capacity', 'Optimization']
    },

    // Analytics Apps (3)
    {
      id: 'business-analytics',
      name: 'Analytics Hub',
      description: 'Executive dashboards, business intelligence, and real-time reporting',
      icon: ChartBarIcon,
      category: 'analytics',
      categoryName: 'Analytics',
      status: 'live',
      href: '/app-erp/analytics/dashboards',
      features: ['Executive dashboards', 'Real-time reporting', 'KPI tracking', 'Data visualization'],
      downloads: '900',
      rating: 4.5,
      size: '12.8 MB',
      lastUpdated: '5 days ago',
      developer: 'HERA Analytics Team',
      screenshots: 3,
      tags: ['Analytics', 'Dashboards', 'KPIs', 'Reporting']
    },
    {
      id: 'advanced-reporting',
      name: 'Report Builder',
      description: 'Custom report builder with advanced analytics and scheduled delivery',
      icon: DocumentChartBarIcon,
      category: 'analytics',
      categoryName: 'Analytics',
      status: 'coming-soon',
      href: '/app-erp/analytics/reports',
      features: ['Custom reports', 'Report builder', 'Scheduled delivery', 'Export options'],
      downloads: '0',
      rating: 0,
      size: 'TBD',
      lastUpdated: 'Coming Soon',
      developer: 'HERA Analytics Team',
      screenshots: 0,
      tags: ['Reports', 'Builder', 'Scheduling', 'Custom']
    },
    {
      id: 'ai-insights',
      name: 'AI Insights',
      description: 'AI-powered predictive analytics, recommendations, and business insights',
      icon: SparklesIcon,
      category: 'analytics',
      categoryName: 'Analytics',
      status: 'coming-soon',
      href: '/app-erp/analytics/ai-insights',
      features: ['Predictive analytics', 'AI recommendations', 'Pattern recognition', 'Automated insights'],
      downloads: '0',
      rating: 0,
      size: 'TBD',
      lastUpdated: 'Coming Soon',
      developer: 'HERA AI Team',
      screenshots: 0,
      tags: ['AI', 'Predictions', 'Insights', 'Automation']
    },

    // Admin Apps (2)
    {
      id: 'user-management',
      name: 'User Admin',
      description: 'User management, role assignment, and access control',
      icon: UserGroupIcon,
      category: 'admin',
      categoryName: 'Administration',
      status: 'coming-soon',
      href: '/app-erp/admin/users',
      features: ['User management', 'Role assignment', 'Access control', 'Permission management'],
      downloads: '0',
      rating: 0,
      size: 'TBD',
      lastUpdated: 'Coming Soon',
      developer: 'HERA Admin Team',
      screenshots: 0,
      tags: ['Users', 'Roles', 'Permissions', 'Access']
    },
    {
      id: 'system-settings',
      name: 'System Control',
      description: 'System configuration, compliance management, and integration settings',
      icon: CogIcon,
      category: 'admin',
      categoryName: 'Administration',
      status: 'coming-soon',
      href: '/app-erp/admin/system',
      features: ['System settings', 'Compliance tools', 'Integration management', 'Security controls'],
      downloads: '0',
      rating: 0,
      size: 'TBD',
      lastUpdated: 'Coming Soon',
      developer: 'HERA Admin Team',
      screenshots: 0,
      tags: ['System', 'Settings', 'Compliance', 'Security']
    }
  ];

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All Apps', count: apps.length },
    { id: 'finance', name: 'Finance', count: apps.filter(app => app.category === 'finance').length },
    { id: 'operations', name: 'Operations', count: apps.filter(app => app.category === 'operations').length },
    { id: 'sales-marketing', name: 'Sales & Marketing', count: apps.filter(app => app.category === 'sales-marketing').length },
    { id: 'human-resources', name: 'Human Resources', count: apps.filter(app => app.category === 'human-resources').length },
    { id: 'projects', name: 'Projects', count: apps.filter(app => app.category === 'projects').length },
    { id: 'analytics', name: 'Analytics', count: apps.filter(app => app.category === 'analytics').length },
    { id: 'admin', name: 'Administration', count: apps.filter(app => app.category === 'admin').length }
  ];

  // Filter and search apps
  const filteredApps = useMemo(() => {
    return apps.filter(app => {
      const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           app.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || app.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchQuery, selectedCategory, selectedStatus, apps]);

  const liveAppsCount = apps.filter(app => app.status === 'live').length;
  const comingSoonCount = apps.filter(app => app.status === 'coming-soon').length;

  // Theme toggle function
  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('auto');
    } else {
      setTheme('light');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with HERA Gold Theme */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-4">
                <h1 className="text-3xl font-bold leading-7 text-gray-900 dark:text-white sm:leading-9 sm:truncate">
                  🏪 HERA App Store
                </h1>
                
                {/* Theme Toggle Button - HERA Gold Theme */}
                <button
                  onClick={toggleTheme}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-teal-50 dark:hover:bg-gray-700 hover:border-teal-300 dark:hover:border-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 shadow-sm hover:shadow-md"
                  title={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'auto' : 'light'} mode`}
                >
                  {theme === 'light' ? (
                    <SunIcon className="w-4 h-4 mr-2" />
                  ) : theme === 'dark' ? (
                    <MoonIcon className="w-4 h-4 mr-2" />
                  ) : (
                    <CogIcon className="w-4 h-4 mr-2" />
                  )}
                  <span className="hidden sm:inline">
                    {theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'Auto'}
                  </span>
                </button>
              </div>
              
              <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <span className="mr-2 flex h-2 w-2 bg-green-400 rounded-full"></span>
                  {liveAppsCount} Live Apps
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <span className="mr-2 flex h-2 w-2 bg-yellow-400 rounded-full"></span>
                  {comingSoonCount} Coming Soon
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span className="mr-2 flex h-2 w-2 bg-blue-400 rounded-full"></span>
                  Complete ERP Suite
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Sidebar Filters */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Filters
              </h3>
              
              {/* Status Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Status
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="all"
                      checked={selectedStatus === 'all'}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      All Apps ({apps.length})
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="live"
                      checked={selectedStatus === 'live'}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center">
                      <span className="mr-2 flex h-2 w-2 bg-green-400 rounded-full"></span>
                      Live ({liveAppsCount})
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="coming-soon"
                      checked={selectedStatus === 'coming-soon'}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center">
                      <span className="mr-2 flex h-2 w-2 bg-yellow-400 rounded-full"></span>
                      Coming Soon ({comingSoonCount})
                    </span>
                  </label>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Categories
                </h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category.id}
                        checked={selectedCategory === category.id}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {category.name} ({category.count})
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search apps, features, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>

            {/* Mobile Filters */}
            <div className="lg:hidden mb-6">
              <div className="flex space-x-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.count})
                    </option>
                  ))}
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="live">Live</option>
                  <option value="coming-soon">Coming Soon</option>
                </select>
              </div>
            </div>

            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredApps.length} {filteredApps.length === 1 ? 'app' : 'apps'} found
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>

            {/* Apps Grid */}
            {filteredApps.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredApps.map((app) => (
                  <AppCard key={app.id} app={app} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No apps found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}