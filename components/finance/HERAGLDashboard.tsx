"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Plus, 
  Search, 
  Filter, 
  BookOpen, 
  FileText, 
  Upload, 
  RotateCcw, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Brain, 
  Zap,
  BarChart3,
  PieChart,
  Calendar,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Download,
  Sparkles,
  Activity,
  Shield,
  Clock,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Layers
} from 'lucide-react';

interface Organization {
  id: string;
  org_name: string;
  name?: string;
  industry?: string;
}

const HERAGLDashboard = () => {
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [orgLoading, setOrgLoading] = useState(true);
  const [orgError, setOrgError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const supabase = createClient();
  const [accounts, setAccounts] = useState([
    { id: '1110000', name: 'Cash - Operating Account', type: 'Asset', balance: 125000, status: 'active', aiScore: 0.98 },
    { id: '1200000', name: 'Accounts Receivable', type: 'Asset', balance: 85000, status: 'active', aiScore: 0.95 },
    { id: '2100000', name: 'Accounts Payable', type: 'Liability', balance: -45000, status: 'active', aiScore: 0.92 },
    { id: '4110000', name: 'Food & Beverage Sales', type: 'Revenue', balance: -380000, status: 'active', aiScore: 0.99 },
    { id: '5210000', name: 'Cost of Food Sales', type: 'Cost of Sales', balance: 152000, status: 'active', aiScore: 0.97 }
  ]);

  const [glMetrics, setGlMetrics] = useState({
    totalAccounts: 127,
    activeAccounts: 124,
    monthlyTransactions: 2847,
    automatedEntries: 2654,
    aiConfidenceAvg: 0.96,
    unbalancedEntries: 3,
    pendingApprovals: 7,
    periodStatus: 'Open'
  });

  const [aiInsights, setAiInsights] = useState([
    { type: 'anomaly', message: 'Unusual cash flow pattern detected in Account 1110000', confidence: 0.87 },
    { type: 'optimization', message: 'Suggest consolidating 3 similar expense accounts', confidence: 0.92 },
    { type: 'forecast', message: 'Revenue trending 12% above budget for current period', confidence: 0.94 }
  ]);

  const [recentJournals, setRecentJournals] = useState([
    { id: 'JE-2024-001', date: '2024-01-15', description: 'Daily Sales Entry - Auto Generated', amount: 12500, status: 'Posted', aiGenerated: true },
    { id: 'JE-2024-002', date: '2024-01-15', description: 'Supplier Payment - ABC Foods', amount: 8750, status: 'Posted', aiGenerated: false },
    { id: 'JE-2024-003', date: '2024-01-15', description: 'Payroll Accrual - Weekly', amount: 15600, status: 'Pending', aiGenerated: true }
  ]);

  // Load user and organization data directly
  useEffect(() => {
    loadUserOrganization();
  }, []);

  const loadUserOrganization = async () => {
    try {
      setOrgLoading(true);
      setOrgError(null);

      // Get current auth user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      console.log('👤 Auth user:', user.id);

      // Get core user (same as restaurant management system)
      const { data: coreUser, error: coreUserError } = await supabase
        .from('core_users')
        .select('id, email, full_name')
        .eq('auth_user_id', user.id)
        .single();

      if (coreUserError || !coreUser) {
        throw new Error('Core user record not found');
      }

      console.log('👤 Core user:', coreUser.id);

      // Query user organizations using core user ID
      console.log('🔍 Querying user_organizations table...');
      const { data: userOrgs, error: userOrgsError } = await supabase
        .from('user_organizations')
        .select(`
          organization_id,
          role,
          is_active,
          core_organizations (
            id,
            org_name,
            industry
          )
        `)
        .eq('user_id', coreUser.id)
        .eq('is_active', true);

      console.log('📊 User organizations query result:', { userOrgs, userOrgsError });

      if (userOrgsError) {
        throw new Error(`User organizations query failed: ${userOrgsError.message}`);
      }

      if (!userOrgs || userOrgs.length === 0) {
        // If no organizations found, user needs to select a restaurant
        console.log('🚫 No organizations found - redirecting to restaurant selection');
        window.location.href = '/restaurant/select?redirect=' + encodeURIComponent(window.location.pathname);
        return;
      }

      // Use the saved restaurant preference if available
      const savedRestaurantId = localStorage.getItem('selectedRestaurant');
      let selectedOrgData = userOrgs[0]; // Default to first organization

      if (savedRestaurantId) {
        const savedOrgData = userOrgs.find(uo => uo.core_organizations.id === savedRestaurantId);
        if (savedOrgData) {
          selectedOrgData = savedOrgData;
          console.log('🎯 Using saved restaurant preference:', savedOrgData.core_organizations.org_name);
        }
      }

      const selectedOrg = selectedOrgData.core_organizations;
      console.log('✅ Selected organization:', selectedOrg.org_name);
      
      setCurrentOrganization({
        id: selectedOrg.id,
        org_name: selectedOrg.org_name,
        industry: selectedOrg.industry
      });

      setOrgLoading(false);
    } catch (error) {
      console.error('❌ Error loading organization:', error);
      setOrgError(error instanceof Error ? error.message : 'Failed to load organization');
      setOrgLoading(false);
    }
  };

  // Load GL accounts when organization is available
  useEffect(() => {
    if (currentOrganization?.id) {
      loadGLAccountsData(currentOrganization.id);
    }
  }, [currentOrganization]);

  const loadGLAccountsData = async (organizationId: string) => {
    try {
      console.log('🔄 Loading GL accounts for organization:', organizationId);
      
      // TODO: Replace with actual API call to fetch GL accounts
      // const response = await fetch(`/api/finance/chart-of-accounts?organizationId=${organizationId}`);
      // const data = await response.json();
      // 
      // if (response.ok) {
      //   setAccounts(data.accounts || []);
      //   setGlMetrics({
      //     ...glMetrics,
      //     totalAccounts: data.totalAccounts || 0,
      //     activeAccounts: data.activeAccounts || 0
      //   });
      // } else {
      //   console.error('Failed to load GL accounts:', data.error);
      // }
      
      // For now, add organization ID to mock data to show it's connected
      console.log('✅ Organization context available - GL accounts ready to load');
      
    } catch (error) {
      console.error('❌ Error loading GL accounts:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  };

  const getAccountTypeColor = (type: string) => {
    const colors = {
      'Asset': 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-900/30',
      'Liability': 'text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-900/30',
      'Equity': 'text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-900/30',
      'Revenue': 'text-purple-700 bg-purple-50 dark:text-purple-300 dark:bg-purple-900/30',
      'Cost of Sales': 'text-orange-700 bg-orange-50 dark:text-orange-300 dark:bg-orange-900/30'
    };
    return colors[type as keyof typeof colors] || 'text-gray-700 bg-gray-50 dark:text-gray-300 dark:bg-gray-900/30';
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* AI Intelligence Banner - HERA Gold Theme */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 dark:from-gray-900 dark:to-gray-800 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="w-8 h-8 text-teal-400" />
              HERA AI Financial Intelligence
            </h2>
            <p className="mt-2 text-gray-300">Real-time AI orchestration with {glMetrics.aiConfidenceAvg * 100}% average confidence</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-teal-400">{glMetrics.automatedEntries}</div>
            <div className="text-sm text-gray-300">Automated Entries Today</div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid - HERA Gold Theme */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Accounts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{glMetrics.totalAccounts}</p>
            </div>
            <Layers className="w-8 h-8 text-teal-500" />
          </div>
          <div className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="w-4 h-4 inline mr-1" />
            {glMetrics.activeAccounts} active
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Transactions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{glMetrics.monthlyTransactions.toLocaleString()}</p>
            </div>
            <Activity className="w-8 h-8 text-teal-500" />
          </div>
          <div className="mt-2 text-sm text-teal-600 dark:text-teal-400">
            <Zap className="w-4 h-4 inline mr-1" />
            93% AI automated
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{glMetrics.pendingApprovals}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
          <div className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            Requires attention
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Period Status</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{glMetrics.periodStatus}</p>
            </div>
            <Shield className="w-8 h-8 text-teal-500" />
          </div>
          <div className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="w-4 h-4 inline mr-1" />
            Ready for close
          </div>
        </div>
      </div>

      {/* AI Insights - HERA Gold Theme */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
          <Sparkles className="w-5 h-5 text-teal-500" />
          AI-Generated Insights
        </h3>
        <div className="space-y-3">
          {aiInsights.map((insight, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                insight.type === 'anomaly' ? 'bg-red-500' : 
                insight.type === 'optimization' ? 'bg-teal-500' : 'bg-emerald-500'
              }`} />
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-gray-100">{insight.message}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  AI Confidence: {(insight.confidence * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Journal Entries - HERA Gold Theme */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Journal Entries</h3>
          <button className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 text-sm font-medium">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                <th className="pb-2 text-gray-700 dark:text-gray-300">Entry #</th>
                <th className="pb-2 text-gray-700 dark:text-gray-300">Date</th>
                <th className="pb-2 text-gray-700 dark:text-gray-300">Description</th>
                <th className="pb-2 text-gray-700 dark:text-gray-300">Amount</th>
                <th className="pb-2 text-gray-700 dark:text-gray-300">Status</th>
                <th className="pb-2 text-gray-700 dark:text-gray-300">AI</th>
              </tr>
            </thead>
            <tbody>
              {recentJournals.map((journal) => (
                <tr key={journal.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-2 text-gray-900 dark:text-gray-100">{journal.id}</td>
                  <td className="py-2 text-gray-900 dark:text-gray-100">{journal.date}</td>
                  <td className="py-2 text-gray-900 dark:text-gray-100">{journal.description}</td>
                  <td className="py-2 text-gray-900 dark:text-gray-100">{formatCurrency(journal.amount)}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      journal.status === 'Posted' 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}>
                      {journal.status}
                    </span>
                  </td>
                  <td className="py-2">
                    {journal.aiGenerated && <Brain className="w-4 h-4 text-teal-500" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderChartOfAccounts = () => (
    <div className="space-y-4">
      {/* Header with Actions - HERA Gold Theme */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">HERA 7-Digit Chart of Accounts</h2>
        <div className="flex gap-2">
          <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Add Account
          </button>
          <button className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
            <Upload className="w-4 h-4" />
            Import COA
          </button>
        </div>
      </div>

      {/* Search and Filter - HERA Gold Theme */}
      <div className="flex gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search accounts..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option>All Types</option>
          <option>Assets</option>
          <option>Liabilities</option>
          <option>Equity</option>
          <option>Revenue</option>
          <option>Expenses</option>
        </select>
        <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Accounts Table - HERA Gold Theme */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="text-left p-4 text-gray-700 dark:text-gray-300">Account #</th>
                <th className="text-left p-4 text-gray-700 dark:text-gray-300">Account Name</th>
                <th className="text-left p-4 text-gray-700 dark:text-gray-300">Type</th>
                <th className="text-left p-4 text-gray-700 dark:text-gray-300">Balance</th>
                <th className="text-left p-4 text-gray-700 dark:text-gray-300">AI Score</th>
                <th className="text-left p-4 text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-left p-4 text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="p-4 font-mono text-gray-900 dark:text-gray-100">{account.id}</td>
                  <td className="p-4 text-gray-900 dark:text-gray-100">{account.name}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getAccountTypeColor(account.type)}`}>
                      {account.type}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-gray-900 dark:text-gray-100">{formatCurrency(account.balance)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                      <span className="text-sm text-gray-900 dark:text-gray-100">{(account.aiScore * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      account.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                    }`}>
                      {account.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                        <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                        <Edit className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderJournalEntries = () => (
    <div className="space-y-4">
      {/* Header with Actions - HERA Gold Theme */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Journal Entry Management</h2>
        <div className="flex gap-2">
          <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
            <FileText className="w-4 h-4" />
            Create Journal
          </button>
          <button className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
            <Upload className="w-4 h-4" />
            Bulk Upload
          </button>
          <button className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
            <RotateCcw className="w-4 h-4" />
            Reversals
          </button>
        </div>
      </div>

      {/* AI-Powered Quick Actions - HERA Gold Theme */}
      <div className="bg-gradient-to-r from-gray-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
        <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
          <Brain className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          AI-Suggested Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="text-left">
              <p className="font-medium text-sm text-gray-900 dark:text-white">Auto-Generate Daily Sales</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Based on POS data</p>
            </div>
          </button>
          <button className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="text-left">
              <p className="font-medium text-sm text-gray-900 dark:text-white">Process Payroll Accruals</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Weekly payroll entries</p>
            </div>
          </button>
          <button className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="text-left">
              <p className="font-medium text-sm text-gray-900 dark:text-white">Depreciation Entries</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Monthly asset depreciation</p>
            </div>
          </button>
        </div>
      </div>

      {/* Journal Entries List - HERA Gold Theme */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Journal Entries</h3>
            <div className="flex gap-2">
              <select className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option>All Periods</option>
                <option>Current Month</option>
                <option>Last Month</option>
              </select>
              <select className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option>All Status</option>
                <option>Posted</option>
                <option>Pending</option>
                <option>Draft</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="text-left p-4 text-gray-700 dark:text-gray-300">Entry #</th>
                <th className="text-left p-4 text-gray-700 dark:text-gray-300">Date</th>
                <th className="text-left p-4 text-gray-700 dark:text-gray-300">Description</th>
                <th className="text-left p-4 text-gray-700 dark:text-gray-300">Reference</th>
                <th className="text-left p-4 text-gray-700 dark:text-gray-300">Amount</th>
                <th className="text-left p-4 text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-left p-4 text-gray-700 dark:text-gray-300">Created By</th>
                <th className="text-left p-4 text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentJournals.map((journal) => (
                <tr key={journal.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="p-4 font-mono text-gray-900 dark:text-gray-100">{journal.id}</td>
                  <td className="p-4 text-gray-900 dark:text-gray-100">{journal.date}</td>
                  <td className="p-4 text-gray-900 dark:text-gray-100">{journal.description}</td>
                  <td className="p-4 text-gray-900 dark:text-gray-100">AUTO-001</td>
                  <td className="p-4 font-mono text-gray-900 dark:text-gray-100">{formatCurrency(journal.amount)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      journal.status === 'Posted' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 
                      journal.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                    }`}>
                      {journal.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {journal.aiGenerated ? (
                        <>
                          <Brain className="w-4 h-4 text-teal-500" />
                          <span className="text-sm text-gray-900 dark:text-gray-100">AI System</span>
                        </>
                      ) : (
                        <>
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-900 dark:text-gray-100">M. Rodriguez</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                        <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                        <Edit className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                        <RotateCcw className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Financial Reports & Analytics</h2>
        <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
          <Download className="w-4 h-4" />
          Export All
        </button>
      </div>

      {/* Report Categories - HERA Gold Theme */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Financial Statements */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-8 h-8 text-teal-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Financial Statements</h3>
          </div>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:underline">Trial Balance</a></li>
            <li><a href="#" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:underline">Balance Sheet</a></li>
            <li><a href="#" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:underline">Income Statement</a></li>
            <li><a href="#" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:underline">Cash Flow Statement</a></li>
          </ul>
        </div>

        {/* GL Reports */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-teal-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">General Ledger</h3>
          </div>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:underline">GL Detail Report</a></li>
            <li><a href="#" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:underline">Account Analysis</a></li>
            <li><a href="#" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:underline">Journal Entry Register</a></li>
            <li><a href="#" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:underline">Period Activity Report</a></li>
          </ul>
        </div>

        {/* AI Analytics */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-teal-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">AI Analytics</h3>
          </div>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:underline">Anomaly Detection Report</a></li>
            <li><a href="#" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:underline">Predictive Analysis</a></li>
            <li><a href="#" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:underline">Variance Analysis</a></li>
            <li><a href="#" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:underline">Trend Forecasting</a></li>
          </ul>
        </div>

        {/* Compliance Reports */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-teal-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Compliance & Audit</h3>
          </div>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:underline">Audit Trail Report</a></li>
            <li><a href="#" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:underline">Control Testing</a></li>
            <li><a href="#" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:underline">SOX Compliance</a></li>
            <li><a href="#" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:underline">Period-End Checklist</a></li>
          </ul>
        </div>

        {/* Performance Reports */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-8 h-8 text-teal-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Performance</h3>
          </div>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:underline">Budget vs Actual</a></li>
            <li><a href="#" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:underline">KPI Dashboard</a></li>
            <li><a href="#" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:underline">Profitability Analysis</a></li>
            <li><a href="#" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:underline">Cost Center Reports</a></li>
          </ul>
        </div>

        {/* Custom Reports */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-8 h-8 text-teal-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Custom Reports</h3>
          </div>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:underline">Report Builder</a></li>
            <li><a href="#" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:underline">Saved Reports</a></li>
            <li><a href="#" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:underline">Scheduled Reports</a></li>
            <li><a href="#" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:underline">Executive Summary</a></li>
          </ul>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'coa', label: 'Chart of Accounts', icon: BookOpen },
    { id: 'journals', label: 'Journal Entries', icon: FileText },
    { id: 'reports', label: 'Reports', icon: TrendingUp }
  ];

  // Show loading state while organization context loads
  if (orgLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Loading Organization Context</h3>
          <p className="text-gray-600 dark:text-gray-400">GL accounts require organization context to load...</p>
        </div>
      </div>
    );
  }

  // Show error state if organization failed to load
  if (orgError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Organization Required</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Cannot access General Ledger without organization context: {orgError}
          </p>
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-4 text-left">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Debug Information:</p>
            <p className="text-xs text-gray-800 dark:text-gray-200">Check browser console (F12) for detailed logs</p>
            <p className="text-xs text-gray-800 dark:text-gray-200">Looking for user organizations and Mario's restaurant data</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => window.location.href = '/restaurant/select?redirect=' + encodeURIComponent('/app-erp/finance/gl')} 
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
            >
              Select Organization
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Retry
            </button>
            <button 
              onClick={() => loadUserOrganization()} 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Debug Load
            </button>
            <button 
              onClick={() => window.location.href = '/restaurant/dashboard'} 
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Restaurant Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if no organization is available
  if (!currentOrganization) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Organization Selected</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            General Ledger requires an organization context. Please select an organization to continue.
          </p>
          <button 
            onClick={() => window.location.href = '/restaurant/select?redirect=' + encodeURIComponent('/app-erp/finance/gl')} 
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
          >
            Select Organization
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header - HERA Gold Theme */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">General Ledger</h1>
                <div className="flex items-center gap-2 px-3 py-1 bg-teal-50 dark:bg-teal-900/30 rounded-lg border border-teal-200 dark:border-teal-800">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <span className="text-sm font-medium text-teal-700 dark:text-teal-300">
                    {currentOrganization.org_name || currentOrganization.name || 'Organization'}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                HERA AI-Orchestrated Financial Management
                {orgLoading && <span className="ml-2 text-xs">(Loading organization...)</span>}
                {orgError && <span className="ml-2 text-xs text-red-600">({orgError})</span>}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Current Period</p>
                <p className="font-semibold text-gray-900 dark:text-white">January 2024</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                glMetrics.periodStatus === 'Open' 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              }`}>
                {glMetrics.periodStatus}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - HERA Gold Theme */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'coa' && renderChartOfAccounts()}
        {activeTab === 'journals' && renderJournalEntries()}
        {activeTab === 'reports' && renderReports()}
      </div>
    </div>
  );
};

export default HERAGLDashboard;