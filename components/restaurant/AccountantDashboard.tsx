'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
  Calculator,
  FileText,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Clock,
  Eye,
  Download,
  Upload,
  RefreshCw,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { Card } from '@/components/ui/revolutionary-card';
import { Button } from '@/components/ui/revolutionary-button';
import { Badge } from '@/components/ui/badge';

interface AccountantDashboardProps {
  restaurantId: string;
  accountantId: string;
}

interface DailyTask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'needs_attention';
  priority: 'high' | 'medium' | 'low';
  dueTime?: string;
  amount?: number;
  discrepancy?: number;
}

interface Transaction {
  id: string;
  type: 'cash' | 'card' | 'expense' | 'refund';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: Date;
  description: string;
  category: string;
  approver?: string;
}

const AccountantDashboard: React.FC<AccountantDashboardProps> = ({ restaurantId, accountantId }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Steve Krug: Daily checklist - accountants love checkboxes
  const dailyTasks: DailyTask[] = [
    {
      id: '1',
      title: 'Cash Drawer Reconciliation',
      description: 'Verify cash drawer totals match POS records',
      status: 'needs_attention',
      priority: 'high',
      dueTime: '2:00 PM',
      discrepancy: -50 // $50 short
    },
    {
      id: '2',
      title: 'Credit Card Settlement',
      description: 'Verify card payment batches and fees',
      status: 'completed',
      priority: 'high',
      amount: 6420
    },
    {
      id: '3',
      title: 'Daily Sales Report',
      description: 'Generate and review daily sales summary',
      status: 'in_progress',
      priority: 'medium',
      amount: 8870
    },
    {
      id: '4',
      title: 'Expense Approvals',
      description: '3 pending expense claims need review',
      status: 'pending',
      priority: 'medium',
      amount: 1250
    },
    {
      id: '5',
      title: 'Inventory Reconciliation',
      description: 'Match inventory usage with sales',
      status: 'pending',
      priority: 'low'
    }
  ];

  const pendingTransactions: Transaction[] = [
    {
      id: 'EXP-001',
      type: 'expense',
      amount: 450,
      status: 'pending',
      timestamp: new Date(),
      description: 'ChefHat equipment repair',
      category: 'Maintenance'
    },
    {
      id: 'REF-002', 
      type: 'refund',
      amount: 85,
      status: 'pending',
      timestamp: new Date(),
      description: 'Customer complaint - order error',
      category: 'Customer Service'
    },
    {
      id: 'EXP-003',
      type: 'expense', 
      amount: 720,
      status: 'pending',
      timestamp: new Date(),
      description: 'Groceries and supplies',
      category: 'Inventory'
    }
  ];

  const financialSummary = {
    revenue: { today: 8870, yesterday: 8420, change: 5.3 },
    expenses: { today: 2100, yesterday: 1950, change: 7.7 },
    profit: { today: 6770, yesterday: 6470, change: 4.6 },
    cash: { drawer: 950, expected: 1000, discrepancy: -50 }
  };

  const handleTaskComplete = (taskId: string) => {
    // Mark task as completed
    console.log('Task completed:', taskId);
  };

  const handleTransactionApproval = (transactionId: string, approved: boolean) => {
    console.log('Transaction', transactionId, approved ? 'approved' : 'rejected');
  };

  const getTaskStatusColor = (status: DailyTask['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-50 border-green-200 text-green-800';
      case 'in_progress': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'needs_attention': return 'bg-red-50 border-red-200 text-red-800';
      case 'pending': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
  };

  const getTaskIcon = (status: DailyTask['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress': return <Clock className="w-5 h-5 text-blue-600" />;
      case 'needs_attention': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'pending': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Accounting Dashboard</h1>
            <p className="text-slate-600">
              {selectedDate.toLocaleDateString()} • {currentTime.toLocaleTimeString()}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="px-4 py-2 border border-slate-300 rounded-lg"
            />
            <Button leftIcon={<Download className="w-4 h-4" />} variant="outline">
              Export
            </Button>
            <Button leftIcon={<RefreshCw className="w-4 h-4" />} variant="outline">
              Refresh
            </Button>
          </div>
        </header>

        {/* Steve Krug: Most urgent discrepancies first */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg"
        >
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <h2 className="text-lg font-bold text-red-800">Cash Discrepancy Detected</h2>
              <p className="text-red-700">Cash drawer is $50 short. Requires immediate investigation.</p>
            </div>
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              Investigate Now
            </Button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Steve Krug: Daily checklist - accountants love structure */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">Daily Tasks</h3>
                <Badge variant="outline">
                  {dailyTasks.filter(t => t.status === 'completed').length} / {dailyTasks.length} Complete
                </Badge>
              </div>
              
              <div className="space-y-4">
                {dailyTasks.map(task => (
                  <DailyTaskCard 
                    key={task.id} 
                    task={task} 
                    onComplete={() => handleTaskComplete(task.id)}
                  />
                ))}
              </div>
            </Card>

            {/* Pending Approvals */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Pending Approvals</h3>
              
              <div className="space-y-4">
                {pendingTransactions.map(transaction => (
                  <TransactionCard 
                    key={transaction.id}
                    transaction={transaction}
                    onApprove={(approved) => handleTransactionApproval(transaction.id, approved)}
                  />
                ))}
              </div>
            </Card>
          </div>

          {/* Financial Summary */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Today's Summary</h3>
              
              <div className="space-y-4">
                <SummaryItem
                  title="Revenue"
                  amount={financialSummary.revenue.today}
                  change={financialSummary.revenue.change}
                  icon={<TrendingUp className="w-5 h-5" />}
                  positive={financialSummary.revenue.change > 0}
                />
                
                <SummaryItem
                  title="Expenses"
                  amount={financialSummary.expenses.today}
                  change={financialSummary.expenses.change}
                  icon={<TrendingDown className="w-5 h-5" />}
                  positive={financialSummary.expenses.change < 0}
                />
                
                <SummaryItem
                  title="Net Profit"
                  amount={financialSummary.profit.today}
                  change={financialSummary.profit.change}
                  icon={<DollarSign className="w-5 h-5" />}
                  positive={financialSummary.profit.change > 0}
                />
              </div>
            </Card>

            {/* Cash Status */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Cash Status</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Expected</span>
                  <span className="font-bold">${financialSummary.cash.expected}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Actual</span>
                  <span className="font-bold">${financialSummary.cash.drawer}</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="font-bold">Discrepancy</span>
                  <span className={`font-bold ${
                    financialSummary.cash.discrepancy < 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    ${financialSummary.cash.discrepancy}
                  </span>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Calculator className="w-4 h-4 mr-2" />
                  Reconcile Cash Drawer
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Daily Report
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Review Card Settlements
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Audit Trail
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Steve Krug: Each task card has obvious completion state
const DailyTaskCard: React.FC<{ task: DailyTask; onComplete: () => void }> = ({ task, onComplete }) => (
  <motion.div
    layout
    className={`p-4 rounded-lg border-2 ${getTaskStatusColor(task.status)}`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {getTaskIcon(task.status)}
        <div className="flex-1">
          <h4 className="font-bold">{task.title}</h4>
          <p className="text-sm opacity-80">{task.description}</p>
          {task.discrepancy && (
            <p className="text-sm font-bold text-red-600 mt-1">
              Discrepancy: ${Math.abs(task.discrepancy)} {task.discrepancy < 0 ? 'short' : 'over'}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        {task.amount && (
          <div className="text-right">
            <div className="font-bold">${task.amount.toLocaleString()}</div>
            {task.dueTime && (
              <div className="text-xs opacity-75">Due: {task.dueTime}</div>
            )}
          </div>
        )}
        
        {task.status !== 'completed' && (
          <Button
            size="sm"
            onClick={onComplete}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Complete
          </Button>
        )}
      </div>
    </div>
  </motion.div>
);

// Steve Krug: Clear approve/reject buttons
const TransactionCard: React.FC<{ 
  transaction: Transaction; 
  onApprove: (approved: boolean) => void;
}> = ({ transaction, onApprove }) => (
  <div className="p-4 bg-white border border-slate-200 rounded-lg">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <Badge variant="outline">{transaction.id}</Badge>
          <Badge className={
            transaction.type === 'expense' ? 'bg-red-100 text-red-800' :
            transaction.type === 'refund' ? 'bg-orange-100 text-orange-800' :
            'bg-green-100 text-green-800'
          }>
            {transaction.type.toUpperCase()}
          </Badge>
        </div>
        <h4 className="font-bold text-slate-800">{transaction.description}</h4>
        <p className="text-sm text-slate-600">{transaction.category}</p>
        <p className="text-xs text-slate-500">{transaction.timestamp.toLocaleString()}</p>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <div className="text-xl font-bold text-slate-800">
            ${transaction.amount.toFixed(2)}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onApprove(false)}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <X className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => onApprove(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Check className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>
);

const SummaryItem: React.FC<{
  title: string;
  amount: number;
  change: number;
  icon: React.ReactNode;
  positive: boolean;
}> = ({ title, amount, change, icon, positive }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-2">
      <div className="text-slate-600">{icon}</div>
      <span className="text-slate-700">{title}</span>
    </div>
    <div className="text-right">
      <div className="font-bold text-slate-800">${amount.toLocaleString()}</div>
      <div className={`text-xs flex items-center ${
        positive ? 'text-green-600' : 'text-red-600'
      }`}>
        {positive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
        {change > 0 ? '+' : ''}{change.toFixed(1)}%
      </div>
    </div>
  </div>
);

function getTaskStatusColor(status: DailyTask['status']) {
  switch (status) {
    case 'completed': return 'bg-green-50 border-green-200 text-green-800';
    case 'in_progress': return 'bg-blue-50 border-blue-200 text-blue-800';
    case 'needs_attention': return 'bg-red-50 border-red-200 text-red-800';
    case 'pending': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
  }
}

function getTaskIcon(status: DailyTask['status']) {
  switch (status) {
    case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'in_progress': return <Clock className="w-5 h-5 text-blue-600" />;
    case 'needs_attention': return <AlertTriangle className="w-5 h-5 text-red-600" />;
    case 'pending': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
  }
}

export default AccountantDashboard;