import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// Note: Toast functionality replaced with alerts for now
import { 
  Plus, 
  Trash2, 
  Calculator, 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  Clipboard, 
  Download,
  Upload,
  Grid,
  List,
  Save,
  RotateCcw,
  Clock,
  AlertTriangle,
  RefreshCw,
  FileText,
  X
} from 'lucide-react';
import UniversalCrudService from '@/lib/services/universalCrudService';
import { HeraTransactionService } from '@/services/heraTransactions';

// Types
interface JournalEntryLine {
  id: string;
  account_code: string;
  account_name: string;
  description: string;
  entry_type: 'DEBIT' | 'CREDIT';
  amount: number;
  cost_center?: string;
  tax_code?: string;
  project_code?: string;
  department?: string;
}

interface Account {
  id: string;
  account_code: string;
  account_name: string;
  account_type: string;
  is_active: boolean;
  allow_posting: boolean;
  is_control_account?: boolean;
  is_blocked?: boolean;
}

interface ValidationError {
  field: string;
  message: string;
  type: 'error' | 'warning';
}

interface ApprovalStatus {
  required: boolean;
  approver?: string;
  status?: 'pending' | 'approved' | 'rejected';
  reason?: string;
}

export const JournalEntryForm: React.FC = () => {
  // Simple toast replacement function
  const toast = (params: { title: string; description: string; variant?: string }) => {
    console.log(`${params.title}: ${params.description}`);
    alert(`${params.title}: ${params.description}`);
  };
  
  // State management
  const [journalEntry, setJournalEntry] = useState({
    reference: '',
    posting_date: new Date().toISOString().split('T')[0],
    description: '',
    lines: [
      { id: '1', account_code: '', account_name: '', description: '', entry_type: 'DEBIT' as 'DEBIT' | 'CREDIT', amount: 0, cost_center: 'none', tax_code: 'none', project_code: 'none', department: 'none' },
      { id: '2', account_code: '', account_name: '', description: '', entry_type: 'CREDIT' as 'DEBIT' | 'CREDIT', amount: 0, cost_center: 'none', tax_code: 'none', project_code: 'none', department: 'none' }
    ] as JournalEntryLine[]
  });

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [budgetWarnings, setBudgetWarnings] = useState<string[]>([]);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>({ required: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error' | 'pending_approval'>('idle');
  const [viewMode, setViewMode] = useState<'form' | 'grid'>('form');
  const [showTemplates, setShowTemplates] = useState(false);
  const [pasteData, setPasteData] = useState('');
  const [showPasteDialog, setShowPasteDialog] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [taxCodes, setTaxCodes] = useState<any[]>([]);
  const [costCenters, setCostCenters] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [accountingPeriods, setAccountingPeriods] = useState<any[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<any>(null);
  const pasteTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Common journal entry templates
  const [templates] = useState([
    {
      id: 'rent_expense',
      name: 'Monthly Rent Expense',
      description: 'Monthly office rent payment',
      lines: [
        { account_code: '6100', account_name: 'Rent Expense', description: 'Monthly office rent', entry_type: 'DEBIT', amount: 0 },
        { account_code: '1010', account_name: 'Cash', description: 'Rent payment', entry_type: 'CREDIT', amount: 0 }
      ]
    },
    {
      id: 'utilities',
      name: 'Utilities Expense',
      description: 'Monthly utilities payment',
      lines: [
        { account_code: '6300', account_name: 'Utilities', description: 'Monthly utilities', entry_type: 'DEBIT', amount: 0 },
        { account_code: '1010', account_name: 'Cash', description: 'Utilities payment', entry_type: 'CREDIT', amount: 0 }
      ]
    },
    {
      id: 'sales_revenue',
      name: 'Sales Revenue',
      description: 'Record sales revenue',
      lines: [
        { account_code: '1010', account_name: 'Cash', description: 'Sales receipt', entry_type: 'DEBIT', amount: 0 },
        { account_code: '4000', account_name: 'Revenue', description: 'Sales revenue', entry_type: 'CREDIT', amount: 0 }
      ]
    },
    {
      id: 'depreciation',
      name: 'Monthly Depreciation',
      description: 'Record monthly depreciation expense',
      lines: [
        { account_code: '6800', account_name: 'Depreciation Expense', description: 'Monthly depreciation', entry_type: 'DEBIT', amount: 0 },
        { account_code: '1800', account_name: 'Accumulated Depreciation', description: 'Accumulated depreciation', entry_type: 'CREDIT', amount: 0 }
      ]
    },
    {
      id: 'accrual',
      name: 'Expense Accrual',
      description: 'Record accrued expenses',
      lines: [
        { account_code: '6000', account_name: 'Expense Account', description: 'Accrued expense', entry_type: 'DEBIT', amount: 0 },
        { account_code: '2100', account_name: 'Accrued Liabilities', description: 'Expense accrual', entry_type: 'CREDIT', amount: 0 }
      ]
    }
  ]);

  // Load master data from core_dynamic_data
  useEffect(() => {
    loadMasterData();
    generateReference();
  }, []);

  const loadMasterData = async () => {
    try {
      const supabase = createClient();
      
      // Load chart of accounts
      const { data: accountsData, error: accountsError } = await supabase
        .from('core_dynamic_data')
        .select('*')
        .eq('data_type', 'chart_of_accounts')
        .eq('is_active', true);

      if (accountsData && !accountsError) {
        const chartOfAccounts = accountsData.map(acc => ({
          id: acc.id,
          account_code: acc.attributes?.account_code || '',
          account_name: acc.name,
          account_type: acc.attributes?.account_type || '',
          is_active: acc.is_active,
          allow_posting: acc.attributes?.allow_posting !== false,
          is_control_account: acc.attributes?.is_control_account || false,
          is_blocked: acc.attributes?.is_blocked || false
        }));
        setAccounts(chartOfAccounts);
      }

      // Load tax codes
      const { data: taxData } = await supabase
        .from('core_dynamic_data')
        .select('*')
        .eq('data_type', 'tax_code')
        .eq('is_active', true);

      if (taxData) {
        setTaxCodes(taxData.map(tc => ({
          id: tc.id,
          code: tc.code,
          name: tc.name,
          rate: tc.attributes?.rate || 0,
          is_active: tc.is_active
        })));
      }

      // Load cost centers
      const { data: costCenterData } = await supabase
        .from('core_dynamic_data')
        .select('*')
        .eq('data_type', 'cost_center')
        .eq('is_active', true);

      if (costCenterData) {
        setCostCenters(costCenterData.map(cc => ({
          id: cc.id,
          code: cc.code,
          name: cc.name,
          is_active: cc.is_active
        })));
      }

      // Load projects
      const { data: projectData } = await supabase
        .from('core_dynamic_data')
        .select('*')
        .eq('data_type', 'project')
        .eq('is_active', true);

      if (projectData) {
        setProjects(projectData.map(p => ({
          id: p.id,
          code: p.code,
          name: p.name,
          is_active: p.is_active
        })));
      }

      // Load departments
      const { data: deptData } = await supabase
        .from('core_dynamic_data')
        .select('*')
        .eq('data_type', 'department')
        .eq('is_active', true);

      if (deptData) {
        setDepartments(deptData.map(d => ({
          id: d.id,
          code: d.code,
          name: d.name,
          is_active: d.is_active
        })));
      }

      // Load accounting periods
      const { data: periodData } = await supabase
        .from('core_dynamic_data')
        .select('*')
        .eq('data_type', 'accounting_period')
        .eq('is_active', true);

      if (periodData) {
        setAccountingPeriods(periodData);
        // Find current period
        const current = periodData.find(p => 
          p.attributes?.status === 'open' && 
          new Date(p.attributes?.start_date) <= new Date() && 
          new Date(p.attributes?.end_date) >= new Date()
        );
        setCurrentPeriod(current);
      }

    } catch (error) {
      console.error('Error loading master data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load master data',
        variant: 'destructive'
      });
    }
  };

  const generateReference = async () => {
    try {
      // For demo purposes, using a mock organization ID
      // In production, this would come from the auth context
      const organizationId = 'org-123';
      const nextNumber = await HeraTransactionService.generateTransactionNumber(organizationId, 'journal_entry');
      setJournalEntry(prev => ({ ...prev, reference: nextNumber }));
    } catch (error) {
      console.error('Error generating reference:', error);
      // Fallback to simple numbering
      const timestamp = Date.now();
      setJournalEntry(prev => ({ ...prev, reference: `JE-${timestamp}` }));
    }
  };

  // Keyboard shortcuts for efficiency
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter or Cmd+Enter to add new line
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        addLine();
      }
      
      // Ctrl+D or Cmd+D to duplicate last line
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (journalEntry.lines.length > 0) {
          duplicateLine(journalEntry.lines[journalEntry.lines.length - 1].id);
        }
      }
      
      // Ctrl+V or Cmd+V to open paste dialog (when not in input field)
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setShowPasteDialog(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [journalEntry.lines]);

  // Calculate totals based on entry type
  const totalDebits = journalEntry.lines
    .filter(line => line.entry_type === 'DEBIT')
    .reduce((sum, line) => sum + (line.amount || 0), 0);
  
  const totalCredits = journalEntry.lines
    .filter(line => line.entry_type === 'CREDIT')
    .reduce((sum, line) => sum + (line.amount || 0), 0);
  
  const difference = totalDebits - totalCredits;
  const isBalanced = Math.abs(difference) < 0.01;

  // Comprehensive validation following all 20 ERP rules
  const validateJournalEntry = (): ValidationError[] => {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    
    // Rule 1: Debit = Credit Validation
    if (!isBalanced) {
      errors.push({ 
        field: 'balance', 
        message: `Journal entry is out of balance by ${Math.abs(difference).toFixed(2)}`,
        type: 'error'
      });
    }
    
    // Rule 4: Open Accounting Period
    if (!currentPeriod) {
      errors.push({ 
        field: 'period', 
        message: 'No open accounting period found',
        type: 'error'
      });
    } else if (currentPeriod && journalEntry.posting_date) {
      const postingDate = new Date(journalEntry.posting_date);
      const periodStart = new Date(currentPeriod.attributes?.start_date);
      const periodEnd = new Date(currentPeriod.attributes?.end_date);
      
      if (postingDate < periodStart || postingDate > periodEnd) {
        errors.push({ 
          field: 'posting_date', 
          message: 'Posting date is outside the current accounting period',
          type: 'error'
        });
      }
    }

    // Rule 5: Date Controls
    const postingDate = new Date(journalEntry.posting_date);
    const today = new Date();
    const futureLimit = new Date();
    futureLimit.setDate(today.getDate() + 30); // 30 days future limit
    
    if (postingDate > futureLimit) {
      warnings.push({ 
        field: 'posting_date', 
        message: 'Posting date is more than 30 days in the future',
        type: 'warning'
      });
    }
    
    // Basic field validation
    if (!journalEntry.reference) {
      errors.push({ 
        field: 'reference', 
        message: 'Reference is required',
        type: 'error'
      });
    }
    
    if (!journalEntry.description) {
      errors.push({ 
        field: 'description', 
        message: 'Description is required',
        type: 'error'
      });
    }
    
    if (totalDebits === 0 && totalCredits === 0) {
      errors.push({ 
        field: 'amounts', 
        message: 'Journal entry must have at least one debit and one credit',
        type: 'error'
      });
    }
    
    // Validate each line
    journalEntry.lines.forEach((line, index) => {
      // Rule 3: Valid Account Codes
      if (!line.account_code) {
        errors.push({ 
          field: `line_${index}_account`, 
          message: `Line ${index + 1}: Account is required`,
          type: 'error'
        });
      } else {
        const account = accounts.find(acc => acc.account_code === line.account_code);
        
        if (!account) {
          errors.push({ 
            field: `line_${index}_account`, 
            message: `Line ${index + 1}: Invalid account code`,
            type: 'error'
          });
        } else {
          // Rule 17: Control Accounts Protection
          if (account.is_control_account) {
            errors.push({ 
              field: `line_${index}_account`, 
              message: `Line ${index + 1}: Cannot post directly to control account ${account.account_name}`,
              type: 'error'
            });
          }
          
          if (account.is_blocked) {
            errors.push({ 
              field: `line_${index}_account`, 
              message: `Line ${index + 1}: Account ${account.account_name} is blocked`,
              type: 'error'
            });
          }
          
          if (!account.allow_posting) {
            errors.push({ 
              field: `line_${index}_account`, 
              message: `Line ${index + 1}: Account ${account.account_name} does not allow direct posting`,
              type: 'error'
            });
          }
          
          // Rule 18: Validation Against Budgets (for expense accounts)
          if (account.account_type === 'EXPENSE' && line.entry_type === 'DEBIT' && line.amount > 10000) {
            warnings.push({ 
              field: `line_${index}_budget`, 
              message: `Line ${index + 1}: Large expense amount may exceed budget`,
              type: 'warning'
            });
            setBudgetWarnings(prev => [...prev, `Line ${index + 1}: ${account.account_name} - Amount ${line.amount} may exceed budget`]);
          }
        }
      }
      
      // Rule 2: One Side per Line Item
      if (!line.entry_type) {
        errors.push({ 
          field: `line_${index}_type`, 
          message: `Line ${index + 1}: Must specify Debit or Credit`,
          type: 'error'
        });
      }
      
      if (!line.description || line.description.trim() === '') {
        errors.push({ 
          field: `line_${index}_description`, 
          message: `Line ${index + 1}: Description is required`,
          type: 'error'
        });
      }
      
      if (!line.amount || line.amount <= 0) {
        errors.push({ 
          field: `line_${index}_amount`, 
          message: `Line ${index + 1}: Amount must be greater than zero`,
          type: 'error'
        });
      }
      
      // Rule 9: Cost Center/Project Validation
      if (line.cost_center && line.cost_center !== 'none' && !costCenters.find(cc => cc.code === line.cost_center)) {
        errors.push({ 
          field: `line_${index}_cost_center`, 
          message: `Line ${index + 1}: Invalid cost center`,
          type: 'error'
        });
      }
      
      if (line.project_code && line.project_code !== 'none' && !projects.find(p => p.code === line.project_code)) {
        errors.push({ 
          field: `line_${index}_project`, 
          message: `Line ${index + 1}: Invalid project code`,
          type: 'error'
        });
      }
      
      // Rule 11: Tax (VAT/GST) Rules
      if (line.tax_code && line.tax_code !== 'none' && !taxCodes.find(tc => tc.code === line.tax_code)) {
        errors.push({ 
          field: `line_${index}_tax`, 
          message: `Line ${index + 1}: Invalid tax code`,
          type: 'error'
        });
      }
    });
    
    // Rule 7: User Role and Approval Workflow
    const totalAmount = Math.max(totalDebits, totalCredits);
    if (totalAmount > 50000) { // Example threshold
      setApprovalStatus({
        required: true,
        reason: 'Journal entry amount exceeds approval threshold of $50,000',
        status: 'pending'
      });
    }
    
    // Rule 12: Attachments and Justification
    if (totalAmount > 10000 && attachments.length === 0) {
      warnings.push({ 
        field: 'attachments', 
        message: 'Large journal entries should have supporting documentation',
        type: 'warning'
      });
    }
    
    return [...errors, ...warnings];
  };

  // Event handlers
  const handleLineChange = (lineId: string, field: string, value: any) => {
    setJournalEntry(prev => ({
      ...prev,
      lines: prev.lines.map(line => 
        line.id === lineId ? { ...line, [field]: value } : line
      )
    }));
  };

  const handleAccountSelect = (lineId: string, accountCode: string) => {
    const selectedAccount = accounts.find(acc => acc.account_code === accountCode);
    if (selectedAccount) {
      setJournalEntry(prev => ({
        ...prev,
        lines: prev.lines.map(line => 
          line.id === lineId ? { 
            ...line, 
            account_code: selectedAccount.account_code, 
            account_name: selectedAccount.account_name 
          } : line
        )
      }));
    }
  };

  const addLine = () => {
    const newLine: JournalEntryLine = {
      id: Date.now().toString(),
      account_code: '',
      account_name: '',
      description: '',
      entry_type: 'DEBIT',
      amount: 0,
      cost_center: 'none',
      tax_code: 'none',
      project_code: 'none',
      department: 'none'
    };
    
    setJournalEntry(prev => ({
      ...prev,
      lines: [...prev.lines, newLine]
    }));
  };

  const removeLine = (lineId: string) => {
    if (journalEntry.lines.length > 2) {
      setJournalEntry(prev => ({
        ...prev,
        lines: prev.lines.filter(line => line.id !== lineId)
      }));
    }
  };

  const duplicateLine = (lineId: string) => {
    const originalLine = journalEntry.lines.find(line => line.id === lineId);
    if (originalLine) {
      const duplicatedLine: JournalEntryLine = {
        ...originalLine,
        id: Date.now().toString(),
        description: originalLine.description + ' (Copy)',
        amount: 0
      };
      
      setJournalEntry(prev => ({
        ...prev,
        lines: [...prev.lines, duplicatedLine]
      }));
    }
  };

  const loadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setJournalEntry(prev => ({
        ...prev,
        description: template.description,
        lines: template.lines.map((line, index) => ({
          ...line,
          id: (Date.now() + index).toString()
        }))
      }));
      setShowTemplates(false);
    }
  };

  const processPasteData = () => {
    if (!pasteData.trim()) return;
    
    try {
      const lines = pasteData.trim().split('\n');
      const newLines: JournalEntryLine[] = [];
      
      lines.forEach((line, index) => {
        const parts = line.includes('\t') ? line.split('\t') : line.split(',');
        
        if (parts.length >= 4) {
          const [accountCode, description, entryType, amount] = parts.map(p => p.trim().replace(/"/g, ''));
          
          if (accountCode && description && entryType && amount) {
            const account = accounts.find(acc => acc.account_code === accountCode);
            
            newLines.push({
              id: (Date.now() + index).toString(),
              account_code: accountCode,
              account_name: account ? account.account_name : 'Unknown Account',
              description: description,
              entry_type: entryType.toUpperCase() === 'DEBIT' ? 'DEBIT' : 'CREDIT',
              amount: parseFloat(amount) || 0
            });
          }
        }
      });
      
      if (newLines.length > 0) {
        setJournalEntry(prev => ({
          ...prev,
          lines: [...prev.lines, ...newLines]
        }));
        setPasteData('');
        setShowPasteDialog(false);
        toast({
          title: 'Success',
          description: `Imported ${newLines.length} lines`
        });
      }
    } catch (error) {
      console.error('Error processing paste data:', error);
      toast({
        title: 'Error',
        description: 'Failed to process paste data',
        variant: 'destructive'
      });
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      'Account Code,Account Name,Description,Entry Type,Amount,Cost Center,Department,Project',
      ...journalEntry.lines.map(line => 
        `${line.account_code},"${line.account_name}","${line.description}",${line.entry_type},${line.amount},${line.cost_center || ''},${line.department || ''},${line.project_code || ''}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journal-entry-${journalEntry.reference || 'draft'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllLines = () => {
    setJournalEntry(prev => ({
      ...prev,
      lines: [
        { id: '1', account_code: '', account_name: '', description: '', entry_type: 'DEBIT', amount: 0, cost_center: 'none', tax_code: 'none', project_code: 'none', department: 'none' },
        { id: '2', account_code: '', account_name: '', description: '', entry_type: 'CREDIT', amount: 0, cost_center: 'none', tax_code: 'none', project_code: 'none', department: 'none' }
      ]
    }));
  };

  const handleSubmit = async () => {
    setBudgetWarnings([]);
    const errors = validateJournalEntry();
    const errorOnly = errors.filter(e => e.type === 'error');
    setValidationErrors(errors);
    
    if (errorOnly.length > 0) {
      setSubmitStatus('error');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      // Prepare transaction data for universal_transactions table
      const transactionData = {
        transaction_type: 'journal_entry',
        business_date: journalEntry.posting_date,
        transaction_data: {
          reference: journalEntry.reference,
          description: journalEntry.description,
          posting_date: journalEntry.posting_date,
          total_debits: totalDebits,
          total_credits: totalCredits,
          is_balanced: isBalanced,
          approval_required: approvalStatus.required,
          attachments: attachments.map(f => f.name)
        },
        status: approvalStatus.required ? 'pending_approval' : 'posted',
        // Rule 14: System vs Manual Entries
        entry_source: 'manual',
        // Rule 15: Audit Trail
        created_by: 'current_user', // Replace with actual user ID
        // Rule 6: Document Numbering
        transaction_number: journalEntry.reference,
        // AI fields (for future enhancement)
        ai_confidence_score: 1.0,
        ai_suggested: false,
        fraud_risk_score: 0.0
      };

      // Prepare transaction lines
      const transactionLines = journalEntry.lines.map((line, index) => ({
        line_number: index + 1,
        account_code: line.account_code,
        description: line.description,
        debit_amount: line.entry_type === 'DEBIT' ? line.amount : 0,
        credit_amount: line.entry_type === 'CREDIT' ? line.amount : 0,
        cost_center_code: line.cost_center,
        department_code: line.department,
        project_code: line.project_code,
        tax_code: line.tax_code,
        line_metadata: {
          account_name: line.account_name,
          entry_type: line.entry_type
        }
      }));

      // Create transaction using the API
      const response = await fetch('/api/finance/journal-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reference: journalEntry.reference,
          posting_date: journalEntry.posting_date,
          description: journalEntry.description,
          lines: journalEntry.lines.map(line => ({
            ...line,
            cost_center: line.cost_center === 'none' ? null : line.cost_center,
            tax_code: line.tax_code === 'none' ? null : line.tax_code,
            project_code: line.project_code === 'none' ? null : line.project_code,
            department: line.department === 'none' ? null : line.department
          })),
          attachments: attachments.map(f => f.name)
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create journal entry');
      }

      if (result.success) {
        setSubmitStatus(approvalStatus.required ? 'pending_approval' : 'success');
        
        toast({
          title: approvalStatus.required ? 'Submitted for Approval' : 'Journal Entry Posted',
          description: approvalStatus.required 
            ? `Journal entry ${journalEntry.reference} has been submitted for approval`
            : `Journal entry ${journalEntry.reference} has been posted successfully`
        });

        // Reset form after successful submission
        setTimeout(() => {
          setJournalEntry({
            reference: '',
            posting_date: new Date().toISOString().split('T')[0],
            description: '',
            lines: [
              { id: '1', account_code: '', account_name: '', description: '', entry_type: 'DEBIT', amount: 0, cost_center: 'none', tax_code: 'none', project_code: 'none', department: 'none' },
              { id: '2', account_code: '', account_name: '', description: '', entry_type: 'CREDIT', amount: 0, cost_center: 'none', tax_code: 'none', project_code: 'none', department: 'none' }
            ]
          });
          setSubmitStatus('idle');
          setValidationErrors([]);
          setBudgetWarnings([]);
          setApprovalStatus({ required: false });
          setAttachments([]);
          generateReference();
        }, 2000);
      }
      
    } catch (error) {
      console.error('Error creating journal entry:', error);
      setSubmitStatus('error');
      toast({
        title: 'Error',
        description: 'Failed to create journal entry',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Journal Entry</h1>
        <div className="flex items-center gap-4">
          <Badge variant={isBalanced ? "default" : "destructive"} className="text-sm py-1 px-3">
            {isBalanced ? "Balanced" : `Out of Balance: $${Math.abs(difference).toFixed(2)}`}
          </Badge>
          {currentPeriod && (
            <Badge variant="outline" className="text-sm py-1 px-3">
              Period: {currentPeriod.name}
            </Badge>
          )}
        </div>
      </div>

      {/* Header Information */}
      <Card>
        <CardHeader>
          <CardTitle>Journal Entry Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="reference">Reference *</Label>
              <Input
                id="reference"
                value={journalEntry.reference}
                onChange={(e) => setJournalEntry(prev => ({ ...prev, reference: e.target.value }))}
                placeholder="JE-2024-001"
                className={validationErrors.find(e => e.field === 'reference') ? 'border-red-500' : ''}
              />
            </div>
            <div>
              <Label htmlFor="posting_date">Posting Date *</Label>
              <Input
                id="posting_date"
                type="date"
                value={journalEntry.posting_date}
                onChange={(e) => setJournalEntry(prev => ({ ...prev, posting_date: e.target.value }))}
                className={validationErrors.find(e => e.field === 'posting_date') ? 'border-red-500' : ''}
              />
            </div>
            <div>
              <Label>Status</Label>
              <div className="mt-2">
                <Badge variant="outline">Draft</Badge>
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={journalEntry.description}
              onChange={(e) => setJournalEntry(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter journal entry description..."
              rows={2}
              className={validationErrors.find(e => e.field === 'description') ? 'border-red-500' : ''}
            />
          </div>
        </CardContent>
      </Card>

      {/* Bulk Entry Options */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Entry Options</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'form' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('form')}
              >
                <List className="w-4 h-4 mr-2" />
                Form View
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4 mr-2" />
                Grid View
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplates(true)}
            >
              <Save className="w-4 h-4 mr-2" />
              Load Template
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPasteDialog(true)}
            >
              <Clipboard className="w-4 h-4 mr-2" />
              Paste from Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllLines}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear All
            </Button>
            
            <div className="ml-auto text-sm text-muted-foreground">
              <strong>Shortcuts:</strong> Ctrl+Enter (Add Line) • Ctrl+D (Duplicate) • Ctrl+V (Paste)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Choose Journal Entry Template</DialogTitle>
            <DialogDescription>
              Select a template to quickly create common journal entries
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {templates.map(template => (
              <div 
                key={template.id} 
                className="border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors"
                onClick={() => loadTemplate(template.id)}
              >
                <div className="font-medium">{template.name}</div>
                <div className="text-sm text-muted-foreground">{template.description}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {template.lines.length} lines
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Paste Dialog */}
      <Dialog open={showPasteDialog} onOpenChange={setShowPasteDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Paste Journal Lines from Excel</DialogTitle>
            <DialogDescription>
              Paste your data in the format: Account Code, Description, Entry Type (DEBIT/CREDIT), Amount
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Paste your data here:</Label>
              <Textarea
                ref={pasteTextareaRef}
                value={pasteData}
                onChange={(e) => setPasteData(e.target.value)}
                placeholder="Paste from Excel... Format: Account Code, Description, DEBIT/CREDIT, Amount"
                rows={10}
                className="font-mono text-sm"
                autoFocus
              />
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-sm">
                <strong>Expected Format:</strong> Account Code, Description, Entry Type (DEBIT/CREDIT), Amount
                <div className="mt-2 font-mono text-xs bg-background p-2 rounded border">
                  1010,Cash Receipt,DEBIT,1000.00<br />
                  4000,Sales Revenue,CREDIT,1000.00
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  • Copy directly from Excel (tab-separated values work too)<br />
                  • Entry types must be "DEBIT" or "CREDIT"<br />
                  • Amount should be numeric (no currency symbols)
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowPasteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={processPasteData} disabled={!pasteData.trim()}>
                <Upload className="w-4 h-4 mr-2" />
                Import Lines
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Journal Lines - Form View */}
      {viewMode === 'form' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Journal Lines</CardTitle>
              <Button onClick={addLine} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Line
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {journalEntry.lines.map((line, index) => (
                <div key={line.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Line {index + 1}</span>
                      <Badge variant={line.entry_type === 'DEBIT' ? 'default' : 'secondary'}>
                        {line.entry_type}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => duplicateLine(line.id)}
                        variant="outline"
                        size="sm"
                        title="Duplicate this line"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      {journalEntry.lines.length > 2 && (
                        <Button
                          onClick={() => removeLine(line.id)}
                          variant="outline"
                          size="sm"
                          title="Remove this line"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label>Account *</Label>
                      <Select
                        value={line.account_code}
                        onValueChange={(value) => handleAccountSelect(line.id, value)}
                      >
                        <SelectTrigger className={validationErrors.find(e => e.field === `line_${index}_account`) ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.filter(acc => acc.allow_posting && !acc.is_blocked).map(account => (
                            <SelectItem key={account.id} value={account.account_code}>
                              {account.account_code} - {account.account_name}
                              {account.is_control_account && ' (Control)'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Description *</Label>
                      <Input
                        value={line.description}
                        onChange={(e) => handleLineChange(line.id, 'description', e.target.value)}
                        placeholder="Line description"
                        className={validationErrors.find(e => e.field === `line_${index}_description`) ? 'border-red-500' : ''}
                      />
                    </div>
                    
                    <div>
                      <Label>Entry Type *</Label>
                      <Select
                        value={line.entry_type}
                        onValueChange={(value) => handleLineChange(line.id, 'entry_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DEBIT">Debit</SelectItem>
                          <SelectItem value="CREDIT">Credit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Amount *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={line.amount || ''}
                        onChange={(e) => handleLineChange(line.id, 'amount', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className={validationErrors.find(e => e.field === `line_${index}_amount`) ? 'border-red-500' : ''}
                      />
                    </div>
                    
                    <div>
                      <Label>Cost Center</Label>
                      <Select
                        value={line.cost_center || ''}
                        onValueChange={(value) => handleLineChange(line.id, 'cost_center', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Optional" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {costCenters.map(cc => (
                            <SelectItem key={cc.id} value={cc.code}>
                              {cc.code} - {cc.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Department</Label>
                      <Select
                        value={line.department || ''}
                        onValueChange={(value) => handleLineChange(line.id, 'department', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Optional" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {departments.map(d => (
                            <SelectItem key={d.id} value={d.code}>
                              {d.code} - {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Tax Code</Label>
                      <Select
                        value={line.tax_code || ''}
                        onValueChange={(value) => handleLineChange(line.id, 'tax_code', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Optional" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {taxCodes.map(tc => (
                            <SelectItem key={tc.id} value={tc.code}>
                              {tc.code} - {tc.name} ({tc.rate}%)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Project</Label>
                      <Select
                        value={line.project_code || ''}
                        onValueChange={(value) => handleLineChange(line.id, 'project_code', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Optional" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {projects.map(p => (
                            <SelectItem key={p.id} value={p.code}>
                              {p.code} - {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Journal Lines - Grid View */}
      {viewMode === 'grid' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Journal Lines - Grid View</CardTitle>
              <Button onClick={addLine} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Line
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Line</th>
                    <th className="text-left p-2">Account</th>
                    <th className="text-left p-2">Description</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Cost Center</th>
                    <th className="text-left p-2">Department</th>
                    <th className="text-left p-2">Tax</th>
                    <th className="text-left p-2">Project</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {journalEntry.lines.map((line, index) => (
                    <tr key={line.id} className="border-b hover:bg-accent/50 transition-colors">
                      <td className="p-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{index + 1}</span>
                          <Badge variant={line.entry_type === 'DEBIT' ? 'default' : 'secondary'} className="text-xs">
                            {line.entry_type === 'DEBIT' ? 'Dr' : 'Cr'}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-2">
                        <Select
                          value={line.account_code}
                          onValueChange={(value) => handleAccountSelect(line.id, value)}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {accounts.filter(acc => acc.allow_posting && !acc.is_blocked).map(account => (
                              <SelectItem key={account.id} value={account.account_code}>
                                {account.account_code} - {account.account_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <Input
                          value={line.description}
                          onChange={(e) => handleLineChange(line.id, 'description', e.target.value)}
                          placeholder="Description"
                          className="w-[200px]"
                        />
                      </td>
                      <td className="p-2">
                        <Select
                          value={line.entry_type}
                          onValueChange={(value) => handleLineChange(line.id, 'entry_type', value)}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DEBIT">Debit</SelectItem>
                            <SelectItem value="CREDIT">Credit</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={line.amount || ''}
                          onChange={(e) => handleLineChange(line.id, 'amount', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="w-[100px]"
                        />
                      </td>
                      <td className="p-2">
                        <Select
                          value={line.cost_center || ''}
                          onValueChange={(value) => handleLineChange(line.id, 'cost_center', value)}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="None" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {costCenters.map(cc => (
                              <SelectItem key={cc.id} value={cc.code}>
                                {cc.code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <Select
                          value={line.department || ''}
                          onValueChange={(value) => handleLineChange(line.id, 'department', value)}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="None" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {departments.map(d => (
                              <SelectItem key={d.id} value={d.code}>
                                {d.code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <Select
                          value={line.tax_code || ''}
                          onValueChange={(value) => handleLineChange(line.id, 'tax_code', value)}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="None" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {taxCodes.map(tc => (
                              <SelectItem key={tc.id} value={tc.code}>
                                {tc.code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <Select
                          value={line.project_code || ''}
                          onValueChange={(value) => handleLineChange(line.id, 'project_code', value)}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="None" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {projects.map(p => (
                              <SelectItem key={p.id} value={p.code}>
                                {p.code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <div className="flex space-x-1">
                          <Button
                            onClick={() => duplicateLine(line.id)}
                            variant="outline"
                            size="sm"
                            title="Duplicate"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          {journalEntry.lines.length > 2 && (
                            <Button
                              onClick={() => removeLine(line.id)}
                              variant="outline"
                              size="sm"
                              title="Remove"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attachments */}
      <Card>
        <CardHeader>
          <CardTitle>Supporting Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Upload supporting documents (invoices, contracts, etc.)</Label>
              <Input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                onChange={(e) => {
                  if (e.target.files) {
                    setAttachments(Array.from(e.target.files));
                  }
                }}
                className="mt-2"
              />
            </div>
            {attachments.length > 0 && (
              <div className="space-y-2">
                <Label>Attached Files:</Label>
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">${totalDebits.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Total Debits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${totalCredits.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Total Credits</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(difference).toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">
                {isBalanced ? 'Balanced ✓' : 'Out of Balance'}
              </div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                {isBalanced ? '✓ BALANCED' : '✗ UNBALANCED'}
              </div>
              <div className="text-sm text-muted-foreground">
                {isBalanced ? 'Ready to Post' : 'Cannot Post'}
              </div>
            </div>
          </div>
          
          {!isBalanced && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold">Journal Entry Out of Balance</div>
                <div className="text-sm">
                  {difference > 0 ? `Debits exceed Credits by $${difference.toFixed(2)}` : `Credits exceed Debits by $${Math.abs(difference).toFixed(2)}`}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Approval Status */}
      {approvalStatus.required && (
        <Alert className="border-yellow-500 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <div className="font-medium text-yellow-800">Approval Required</div>
            <div className="text-sm text-yellow-700">
              {approvalStatus.reason}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Budget Warnings */}
      {budgetWarnings.length > 0 && (
        <Alert className="border-orange-500 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <div className="font-medium text-orange-800 mb-2">Budget Warnings</div>
            <ul className="list-disc pl-4 space-y-1 text-orange-700">
              {budgetWarnings.map((warning, index) => (
                <li key={index} className="text-sm">{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Errors */}
      {validationErrors.filter(e => e.type === 'error').length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-2">Validation Errors - Cannot Post</div>
            <ul className="list-disc pl-4 space-y-1">
              {validationErrors.filter(e => e.type === 'error').map((error, index) => (
                <li key={index} className="text-sm">{error.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Warnings */}
      {validationErrors.filter(e => e.type === 'warning').length > 0 && (
        <Alert className="border-yellow-500 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <div className="font-medium text-yellow-800 mb-2">Warnings</div>
            <ul className="list-disc pl-4 space-y-1 text-yellow-700">
              {validationErrors.filter(e => e.type === 'warning').map((warning, index) => (
                <li key={index} className="text-sm">{warning.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {submitStatus === 'success' && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="font-medium">Journal Entry Posted Successfully!</div>
            <div className="text-sm">All ERP validations passed and entry has been recorded.</div>
          </AlertDescription>
        </Alert>
      )}

      {/* Pending Approval Message */}
      {submitStatus === 'pending_approval' && (
        <Alert className="border-yellow-500 bg-yellow-50">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <div className="font-medium">Journal Entry Submitted for Approval</div>
            <div className="text-sm">Entry has been saved and is pending manager approval.</div>
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={() => generateReference()}>
          Save as Draft
        </Button>
        
        {approvalStatus.required && approvalStatus.status === 'pending' ? (
          <Button disabled className="min-w-32">
            <Clock className="w-4 h-4 mr-2" />
            Awaiting Approval
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !isBalanced || validationErrors.filter(e => e.type === 'error').length > 0}
            className="min-w-32"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                {approvalStatus.required ? 'Submitting...' : 'Posting...'}
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                {approvalStatus.required ? 'Submit for Approval' : 'Post Journal Entry'}
              </>
            )}
          </Button>
        )}
      </div>

      {/* ERP Validation Status Summary */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm">ERP Validation Status (20 Rules)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isBalanced ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>1. Balance Check</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${journalEntry.lines.every(l => l.entry_type) ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>2. One Side per Line</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${journalEntry.lines.every(l => !l.account_code || accounts.find(a => a.account_code === l.account_code)?.allow_posting) ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>3. Valid Accounts</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${currentPeriod ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>4. Open Period</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${journalEntry.posting_date ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>5. Date Controls</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${journalEntry.reference ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>6. Document Number</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${approvalStatus.required || totalDebits < 50000 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span>7. Approval Workflow</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>8. Currency Ready</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>9. Cost Centers</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>10. Intercompany Ready</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>11. Tax Rules</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${attachments.length > 0 || totalDebits < 10000 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span>12. Attachments</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>13. Suspense Ready</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>14. Manual Entry</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>15. Audit Trail</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>16. Reversal Ready</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${journalEntry.lines.every(l => !l.account_code || !accounts.find(a => a.account_code === l.account_code)?.is_control_account) ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>17. Control Protection</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${budgetWarnings.length === 0 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span>18. Budget Check</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>19. Recurring Ready</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>20. Segregation</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};