"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { 
  Save, X, ArrowLeft, Sparkles, AlertTriangle, CheckCircle,
  Brain, Info, Lightbulb, Target, DollarSign, Calculator,
  Building, TrendingUp, Shield, FileText, Zap, Eye, Wand2,
  Upload, Download, Edit3, Trash2, Plus
} from "lucide-react"
import { NavigationProvider } from "@/components/providers/navigation-provider"
import { Sidebar } from "@/components/navigation/sidebar"
import { Breadcrumbs } from "@/components/navigation/breadcrumbs"
import { useTheme } from "@/components/providers/theme-provider"
import { Button } from "@/components/ui/revolutionary-button"
import { Card } from "@/components/ui/revolutionary-card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  AccountType,
  ChartOfAccountsEntry,
  AccountSearchRequest 
} from "@/lib/types/chart-of-accounts"

// Navigation items
const navigationItems = [
  {
    id: "finance",
    label: "Finance",
    href: "/finance",
    icon: DollarSign,
    category: "main"
  },
  {
    id: "chart-of-accounts",
    label: "Chart of Accounts",
    href: "/finance/chart-of-accounts",
    icon: FileText,
    category: "finance"
  },
  {
    id: "create-account",
    label: "Create Account",
    href: "/finance/chart-of-accounts/create",
    icon: Building,
    category: "finance"
  }
]

// 9-Category Account Structure with Enhanced Details
const ACCOUNT_CATEGORIES = {
  'ASSET': {
    name: 'Asset',
    description: 'Resources owned by the business that have economic value',
    icon: Building,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    codeRange: '1000000-1999999',
    examples: ['Cash', 'Accounts Receivable', 'Inventory', 'Equipment', 'Real Estate']
  },
  'LIABILITY': {
    name: 'Liability', 
    description: 'Debts and obligations owed to creditors',
    icon: AlertTriangle,
    color: 'text-red-600 bg-red-50 border-red-200',
    codeRange: '2000000-2999999',
    examples: ['Accounts Payable', 'Loans', 'Accrued Expenses', 'Credit Cards']
  },
  'EQUITY': {
    name: 'Equity',
    description: 'Owner\'s stake in the business after liabilities',
    icon: Shield,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    codeRange: '3000000-3999999', 
    examples: ['Owner\'s Capital', 'Retained Earnings', 'Common Stock']
  },
  'REVENUE': {
    name: 'Revenue',
    description: 'Income generated from business operations',
    icon: TrendingUp,
    color: 'text-green-600 bg-green-50 border-green-200',
    codeRange: '4000000-4999999',
    examples: ['Sales Revenue', 'Service Income', 'Interest Income']
  },
  'COST_OF_SALES': {
    name: 'Cost of Sales',
    description: 'Direct costs to produce goods or services sold',
    icon: Calculator,
    color: 'text-orange-600 bg-orange-50 border-orange-200',
    codeRange: '5000000-5999999',
    examples: ['Raw Materials', 'Food Ingredients', 'Direct Labor']
  },
  'DIRECT_EXPENSE': {
    name: 'Direct Expense',
    description: 'Operating expenses directly tied to business operations',
    icon: Target,
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    codeRange: '6000000-6999999',
    examples: ['Rent', 'Utilities', 'Staff Salaries', 'Kitchen Equipment']
  },
  'INDIRECT_EXPENSE': {
    name: 'Indirect Expense',
    description: 'General business expenses not directly tied to operations',
    icon: FileText,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    codeRange: '7000000-7999999',
    examples: ['Marketing', 'Insurance', 'Professional Services', 'Office Supplies']
  },
  'TAX_EXPENSE': {
    name: 'Tax Expense',
    description: 'All tax-related expenses and obligations',
    icon: Shield,
    color: 'text-rose-600 bg-rose-50 border-rose-200',
    codeRange: '8000000-8999999',
    examples: ['Income Tax', 'Sales Tax', 'Payroll Tax', 'Property Tax']
  },
  'EXTRAORDINARY_EXPENSE': {
    name: 'Extraordinary Expense',
    description: 'Unusual or infrequent business expenses',
    icon: Zap,
    color: 'text-gray-600 bg-gray-50 border-gray-200',
    codeRange: '9000000-9999999',
    examples: ['Legal Settlements', 'Natural Disaster Costs', 'Asset Write-offs']
  }
} as const

interface FormData {
  accountName: string
  accountCode: string
  accountType: AccountType
  description: string
  parentAccount?: string
  isActive: boolean
  allowPosting: boolean
  currency: string
  openingBalance: number
  budgetAmount?: number
  taxDeductible: boolean
  notes: string
}

interface AIsuggestion {
  type: 'code' | 'name' | 'category' | 'validation'
  message: string
  confidence: number
  action?: string
}

// AI Suggestion Component
function AISuggestionPanel({ 
  suggestions, 
  onAcceptSuggestion 
}: { 
  suggestions: AIsuggestion[]
  onAcceptSuggestion: (suggestion: AIsuggestion) => void 
}) {
  if (suggestions.length === 0) return null

  return (
    <Card variant="glass" className="border-l-4 border-l-blue-500">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">AI Suggestions</h3>
          <Badge className="bg-blue-100 text-blue-800 text-xs">
            {suggestions.length} insights
          </Badge>
        </div>
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 bg-blue-50 rounded-lg border border-blue-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium capitalize">{suggestion.type} Suggestion</span>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                      {Math.round(suggestion.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-sm text-blue-800 leading-relaxed">{suggestion.message}</p>
                </div>
                {suggestion.action && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAcceptSuggestion(suggestion)}
                    className="ml-3 border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    Apply
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  )
}

// Account Code Generator Component
function AccountCodeGenerator({ 
  accountType, 
  onCodeGenerated 
}: { 
  accountType: AccountType
  onCodeGenerated: (code: string) => void 
}) {
  const [isGenerating, setIsGenerating] = useState(false)
  
  const generateCode = async () => {
    setIsGenerating(true)
    // Simulate API call to generate next available code
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const category = ACCOUNT_CATEGORIES[accountType]
    const baseCode = category.codeRange.split('-')[0]
    // For demo, just increment by 1000
    const generatedCode = String(parseInt(baseCode) + Math.floor(Math.random() * 1000) * 1000)
    
    onCodeGenerated(generatedCode)
    setIsGenerating(false)
  }

  const category = ACCOUNT_CATEGORIES[accountType]

  return (
    <Card variant="glass" className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-financial-primary" />
          <h4 className="font-semibold">Account Code Generator</h4>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={generateCode}
          disabled={isGenerating}
          leftIcon={isGenerating ? undefined : <Zap className="w-4 h-4" />}
        >
          {isGenerating ? 'Generating...' : 'Generate Code'}
        </Button>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Category:</span>
          <span className="font-medium">{category.name}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Code Range:</span>
          <span className="font-mono text-financial-primary">{category.codeRange}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Next available code will be auto-generated within this range
        </div>
      </div>
    </Card>
  )
}

export default function CreateChartOfAccountsPage() {
  const router = useRouter()
  const { setContext } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  
  // AI Generation states
  const [currentTab, setCurrentTab] = useState<'manual' | 'ai'>('ai') // Start with AI tab
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiGeneratedAccounts, setAiGeneratedAccounts] = useState<any[]>([])
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set())
  const [aiPrompt, setAiPrompt] = useState('')
  const [businessType, setBusinessType] = useState('restaurant')
  const [complexity, setComplexity] = useState<'basic' | 'intermediate' | 'advanced'>('intermediate')
  const [specificNeeds, setSpecificNeeds] = useState<string[]>([])
  const [isBulkCreating, setIsBulkCreating] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    accountName: '',
    accountCode: '',
    accountType: 'ASSET',
    description: '',
    parentAccount: '',
    isActive: true,
    allowPosting: true,
    currency: 'USD',
    openingBalance: 0,
    budgetAmount: undefined,
    taxDeductible: false,
    notes: ''
  })

  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [aiSuggestions, setAISuggestions] = useState<AIsuggestion[]>([])

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Set financial context for theme
  useEffect(() => {
    if (mounted) {
      setContext("financial")
    }
  }, [setContext, mounted])

  // Generate AI suggestions based on form data
  useEffect(() => {
    if (!formData.accountName || formData.accountName.length < 3) return

    const suggestions: AIsuggestion[] = []
    
    // Account code suggestion
    if (!formData.accountCode && formData.accountType) {
      const category = ACCOUNT_CATEGORIES[formData.accountType]
      suggestions.push({
        type: 'code',
        message: `Suggested code range for ${category.name}: ${category.codeRange}`,
        confidence: 0.9,
        action: 'generate'
      })
    }

    // Category validation
    const name = formData.accountName.toLowerCase()
    if (name.includes('cash') || name.includes('bank')) {
      if (formData.accountType !== 'ASSET') {
        suggestions.push({
          type: 'category',
          message: 'Cash and bank accounts should typically be categorized as Assets',
          confidence: 0.95,
          action: 'change_category'
        })
      }
    }

    if (name.includes('revenue') || name.includes('sales') || name.includes('income')) {
      if (formData.accountType !== 'REVENUE') {
        suggestions.push({
          type: 'category',
          message: 'Revenue and sales accounts should be categorized as Revenue',
          confidence: 0.95,
          action: 'change_category'
        })
      }
    }

    if (name.includes('expense') || name.includes('cost')) {
      if (!['COST_OF_SALES', 'DIRECT_EXPENSE', 'INDIRECT_EXPENSE'].includes(formData.accountType)) {
        suggestions.push({
          type: 'category',
          message: 'Expense accounts should be categorized under Cost of Sales, Direct Expense, or Indirect Expense',
          confidence: 0.85,
          action: 'suggest_expense_category'
        })
      }
    }

    // Restaurant-specific suggestions
    if (name.includes('food') || name.includes('ingredient') || name.includes('meat') || name.includes('vegetable')) {
      if (formData.accountType !== 'COST_OF_SALES') {
        suggestions.push({
          type: 'category',
          message: 'Food and ingredient costs should be categorized as Cost of Sales for restaurants',
          confidence: 0.92,
          action: 'change_to_cos'
        })
      }
    }

    setAISuggestions(suggestions)
  }, [formData.accountName, formData.accountType])

  // Handle form field changes
  const handleFieldChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // Handle AI suggestion acceptance
  const handleAcceptSuggestion = (suggestion: AIsuggestion) => {
    switch (suggestion.action) {
      case 'generate':
        // Trigger code generation
        break
      case 'change_category':
        if (suggestion.message.includes('Asset')) {
          handleFieldChange('accountType', 'ASSET')
        } else if (suggestion.message.includes('Revenue')) {
          handleFieldChange('accountType', 'REVENUE')
        }
        break
      case 'change_to_cos':
        handleFieldChange('accountType', 'COST_OF_SALES')
        break
      case 'suggest_expense_category':
        // Could open a modal to help choose between expense types
        break
    }
  }

  // AI Account Generation Functions
  const handleAIGenerate = async () => {
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/finance/chart-of-accounts/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: 'demo-org-id',
          businessType,
          description: aiPrompt,
          specificNeeds,
          complexity
        })
      })

      if (response.ok) {
        const result = await response.json()
        setAiGeneratedAccounts(result.data.generatedAccounts)
        // Select all essential accounts by default
        const essentialCodes = new Set(
          result.data.generatedAccounts
            .filter((acc: any) => acc.priority === 'essential')
            .map((acc: any) => acc.accountCode)
        )
        setSelectedAccounts(essentialCodes)
      } else {
        console.error('Failed to generate accounts')
      }
    } catch (error) {
      console.error('Error generating accounts:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleBulkCreate = async () => {
    if (selectedAccounts.size === 0) return

    setIsBulkCreating(true)

    try {
      const accountsToCreate = aiGeneratedAccounts.filter(acc => 
        selectedAccounts.has(acc.accountCode)
      )

      const response = await fetch('/api/finance/chart-of-accounts/bulk-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: 'demo-org-id',
          accounts: accountsToCreate
        })
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/finance/chart-of-accounts?created=${result.data.created}&total=${result.data.totalRequested}`)
      } else {
        console.error('Failed to create accounts')
      }
    } catch (error) {
      console.error('Error creating accounts:', error)
    } finally {
      setIsBulkCreating(false)
    }
  }

  const toggleAccountSelection = (accountCode: string) => {
    const newSelected = new Set(selectedAccounts)
    if (newSelected.has(accountCode)) {
      newSelected.delete(accountCode)
    } else {
      newSelected.add(accountCode)
    }
    setSelectedAccounts(newSelected)
  }

  const selectAllByPriority = (priority: 'essential' | 'recommended' | 'optional') => {
    const codes = aiGeneratedAccounts
      .filter(acc => acc.priority === priority)
      .map(acc => acc.accountCode)
    
    const newSelected = new Set(selectedAccounts)
    codes.forEach(code => newSelected.add(code))
    setSelectedAccounts(newSelected)
  }

  const toggleSpecificNeed = (need: string) => {
    setSpecificNeeds(prev => 
      prev.includes(need) 
        ? prev.filter(n => n !== need)
        : [...prev, need]
    )
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.accountName.trim()) {
      newErrors.accountName = 'Account name is required'
    } else if (formData.accountName.length < 3) {
      newErrors.accountName = 'Account name must be at least 3 characters'
    }

    if (!formData.accountCode.trim()) {
      newErrors.accountCode = 'Account code is required'
    } else if (!/^\d{7}$/.test(formData.accountCode)) {
      newErrors.accountCode = 'Account code must be exactly 7 digits'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // API call to create account
      const response = await fetch('/api/finance/chart-of-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          organizationId: 'demo-org-id' // Replace with actual org ID
        })
      })

      if (response.ok) {
        router.push('/finance/chart-of-accounts?created=true')
      } else {
        console.error('Failed to create account')
      }
    } catch (error) {
      console.error('Error creating account:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Prevent hydration issues
  if (!mounted) return null

  const selectedCategory = ACCOUNT_CATEGORIES[formData.accountType]

  return (
    <NavigationProvider
      initialItems={navigationItems}
      enableAI={true}
      enableAnalytics={true}
    >
      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <Sidebar enableGestures={true} enableAI={true} showLogo={true} />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          {/* Header */}
          <div className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="p-6">
              <Breadcrumbs showHome={true} enableAI={true} />
              
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <motion.h1 
                    className="text-3xl font-bold text-foreground"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    Create Chart of Account
                  </motion.h1>
                  <motion.p 
                    className="text-muted-foreground mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Add a new account to your 9-category chart of accounts structure
                  </motion.p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    <Button
                      variant={currentTab === 'ai' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setCurrentTab('ai')}
                      leftIcon={<Wand2 className="w-4 h-4" />}
                    >
                      AI Generate
                    </Button>
                    <Button
                      variant={currentTab === 'manual' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setCurrentTab('manual')}
                      leftIcon={<Edit3 className="w-4 h-4" />}
                    >
                      Manual Create
                    </Button>
                  </div>
                  
                  {currentTab === 'manual' && (
                    <Button
                      variant="outline"
                      leftIcon={<Eye className="w-4 h-4" />}
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      {showPreview ? 'Hide' : 'Preview'}
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                    onClick={() => router.back()}
                  >
                    Back
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto h-[calc(100vh-180px)]">
            <div className="max-w-5xl mx-auto">
              {/* AI Generation Tab */}
              {currentTab === 'ai' && (
                <div className="space-y-6">
                  {/* AI Prompt Section */}
                  <Card variant="glass" className="border-l-4 border-l-purple-500">
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Wand2 className="w-6 h-6 text-purple-600" />
                        <h3 className="text-xl font-semibold">AI-Powered Chart of Accounts Generator</h3>
                        <Badge className="bg-purple-100 text-purple-800 text-xs">Beta</Badge>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Describe your business accounting needs
                          </label>
                          <textarea
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="e.g., I'm running an Italian restaurant in downtown. I need basic accounts for food costs, labor, rent, utilities, and revenue tracking. I also do some catering on weekends..."
                            rows={4}
                            className="w-full p-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Business Type</label>
                            <select
                              value={businessType}
                              onChange={(e) => setBusinessType(e.target.value)}
                              className="w-full p-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                            >
                              <option value="restaurant">Restaurant</option>
                              <option value="cafe">Cafe</option>
                              <option value="bakery">Bakery</option>
                              <option value="food_truck">Food Truck</option>
                              <option value="catering">Catering</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Complexity Level</label>
                            <select
                              value={complexity}
                              onChange={(e) => setComplexity(e.target.value as any)}
                              className="w-full p-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                            >
                              <option value="basic">Basic (Essential accounts only)</option>
                              <option value="intermediate">Intermediate (Essential + Recommended)</option>
                              <option value="advanced">Advanced (Complete structure)</option>
                            </select>
                          </div>
                          
                          <div>
                            <Button
                              onClick={handleAIGenerate}
                              disabled={isGenerating || !aiPrompt.trim()}
                              className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                              leftIcon={isGenerating ? <Brain className="w-4 h-4 animate-pulse" /> : <Sparkles className="w-4 h-4" />}
                            >
                              {isGenerating ? 'AI Thinking...' : 'Generate Accounts'}
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Specific Business Needs</label>
                          <div className="flex flex-wrap gap-2">
                            {['delivery', 'catering', 'bar', 'retail', 'franchising'].map(need => (
                              <Button
                                key={need}
                                variant={specificNeeds.includes(need) ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => toggleSpecificNeed(need)}
                              >
                                {need.charAt(0).toUpperCase() + need.slice(1)}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Generated Accounts Display */}
                  {aiGeneratedAccounts.length > 0 && (
                    <Card variant="glass">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                            <h3 className="text-xl font-semibold">AI Generated Chart of Accounts</h3>
                            <Badge className="bg-green-100 text-green-800">
                              {aiGeneratedAccounts.length} accounts
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => selectAllByPriority('essential')}
                            >
                              Select Essential
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => selectAllByPriority('recommended')}
                            >
                              Select Recommended
                            </Button>
                            <Button
                              onClick={handleBulkCreate}
                              disabled={selectedAccounts.size === 0 || isBulkCreating}
                              className="bg-gradient-to-r from-green-600 to-emerald-600"
                              leftIcon={isBulkCreating ? <Upload className="w-4 h-4 animate-bounce" /> : <Plus className="w-4 h-4" />}
                            >
                              {isBulkCreating ? 'Creating...' : `Create Selected (${selectedAccounts.size})`}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {aiGeneratedAccounts.map((account, index) => (
                            <motion.div
                              key={account.accountCode}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={cn(
                                "p-4 border rounded-lg cursor-pointer transition-all",
                                selectedAccounts.has(account.accountCode)
                                  ? "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700"
                                  : "bg-background border-border hover:bg-gray-50 dark:hover:bg-gray-800/50"
                              )}
                              onClick={() => toggleAccountSelection(account.accountCode)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <input
                                      type="checkbox"
                                      checked={selectedAccounts.has(account.accountCode)}
                                      onChange={() => toggleAccountSelection(account.accountCode)}
                                      className="w-4 h-4"
                                    />
                                    <span className="font-mono text-sm font-medium">
                                      {account.accountCode}
                                    </span>
                                    <span className="font-medium">{account.accountName}</span>
                                    <Badge
                                      variant={account.priority === 'essential' ? 'default' : 
                                              account.priority === 'recommended' ? 'secondary' : 'outline'}
                                      className="text-xs"
                                    >
                                      {account.priority}
                                    </Badge>
                                    <Badge className={cn(
                                      "text-xs border",
                                      ACCOUNT_CATEGORIES[account.accountType]?.color || "text-gray-600 bg-gray-50 border-gray-200"
                                    )}>
                                      {ACCOUNT_CATEGORIES[account.accountType]?.name || account.accountType}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {account.description}
                                  </p>
                                  <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded inline-block">
                                    AI: {account.aiReasoning}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {/* Manual Creation Tab */}
              {currentTab === 'manual' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Form - 2/3 width */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <Card variant="glass">
                      <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-financial-primary" />
                          Basic Information
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">
                              Account Name *
                            </label>
                            <input
                              type="text"
                              value={formData.accountName}
                              onChange={(e) => handleFieldChange('accountName', e.target.value)}
                              placeholder="e.g., Cash - Operating Account"
                              className={cn(
                                "w-full p-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-financial-primary/20",
                                errors.accountName && "border-red-500"
                              )}
                            />
                            {errors.accountName && (
                              <p className="text-red-500 text-sm mt-1">{errors.accountName}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Account Code *
                            </label>
                            <input
                              type="text"
                              value={formData.accountCode}
                              onChange={(e) => handleFieldChange('accountCode', e.target.value)}
                              placeholder="1001000"
                              className={cn(
                                "w-full p-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-financial-primary/20 font-mono",
                                errors.accountCode && "border-red-500"
                              )}
                            />
                            {errors.accountCode && (
                              <p className="text-red-500 text-sm mt-1">{errors.accountCode}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Account Type *
                            </label>
                            <select
                              value={formData.accountType}
                              onChange={(e) => handleFieldChange('accountType', e.target.value as AccountType)}
                              className="w-full p-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-financial-primary/20"
                            >
                              {Object.entries(ACCOUNT_CATEGORIES).map(([key, category]) => (
                                <option key={key} value={key}>
                                  {category.name} ({category.codeRange})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">
                              Description *
                            </label>
                            <textarea
                              value={formData.description}
                              onChange={(e) => handleFieldChange('description', e.target.value)}
                              placeholder="Detailed description of the account's purpose and usage"
                              rows={3}
                              className={cn(
                                "w-full p-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-financial-primary/20",
                                errors.description && "border-red-500"
                              )}
                            />
                            {errors.description && (
                              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Financial Settings */}
                    <Card variant="glass">
                      <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-financial-primary" />
                          Financial Settings
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Currency
                            </label>
                            <select
                              value={formData.currency}
                              onChange={(e) => handleFieldChange('currency', e.target.value)}
                              className="w-full p-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-financial-primary/20"
                            >
                              <option value="USD">USD - US Dollar</option>
                              <option value="EUR">EUR - Euro</option>
                              <option value="GBP">GBP - British Pound</option>
                              <option value="CAD">CAD - Canadian Dollar</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Opening Balance
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={formData.openingBalance}
                              onChange={(e) => handleFieldChange('openingBalance', parseFloat(e.target.value) || 0)}
                              className="w-full p-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-financial-primary/20"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Budget Amount (Optional)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={formData.budgetAmount || ''}
                              onChange={(e) => handleFieldChange('budgetAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                              placeholder="Annual budget amount"
                              className="w-full p-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-financial-primary/20"
                            />
                          </div>

                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={formData.taxDeductible}
                                onChange={(e) => handleFieldChange('taxDeductible', e.target.checked)}
                                className="rounded border-border"
                              />
                              <span className="text-sm font-medium">Tax Deductible</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Account Settings */}
                    <Card variant="glass">
                      <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-financial-primary" />
                          Account Settings
                        </h3>
                        
                        <div className="space-y-4">
                          <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => handleFieldChange('isActive', e.target.checked)}
                                className="rounded border-border"
                              />
                              <span className="text-sm font-medium">Active Account</span>
                            </label>
                            
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={formData.allowPosting}
                                onChange={(e) => handleFieldChange('allowPosting', e.target.checked)}
                                className="rounded border-border"
                              />
                              <span className="text-sm font-medium">Allow Posting</span>
                            </label>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Notes
                            </label>
                            <textarea
                              value={formData.notes}
                              onChange={(e) => handleFieldChange('notes', e.target.value)}
                              placeholder="Additional notes, accounting policies, or special instructions..."
                              rows={3}
                              className="w-full p-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-financial-primary/20"
                            />
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Form Actions */}
                    <div className="flex items-center justify-between pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        leftIcon={<X className="w-4 h-4" />}
                      >
                        Cancel
                      </Button>
                      
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        leftIcon={<Save className="w-4 h-4" />}
                        className="bg-gradient-to-r from-financial-primary to-financial-success"
                      >
                        {isSubmitting ? 'Creating Account...' : 'Create Account'}
                      </Button>
                    </div>
                  </div>

                  {/* Right Sidebar - 1/3 width */}
                  <div className="space-y-6">
                    {/* Selected Category Info */}
                    <Card variant="glass" className={cn("border-l-4", selectedCategory.color.split(' ')[2])}>
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", selectedCategory.color)}>
                            <selectedCategory.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{selectedCategory.name}</h4>
                            <p className="text-xs text-muted-foreground font-mono">
                              {selectedCategory.codeRange}
                            </p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {selectedCategory.description}
                        </p>
                        
                        <div>
                          <h5 className="text-sm font-medium mb-2">Examples:</h5>
                          <div className="flex flex-wrap gap-1">
                            {selectedCategory.examples.map((example, index) => (
                              <span
                                key={index}
                                className="text-xs bg-muted px-2 py-1 rounded-full"
                              >
                                {example}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Account Code Generator */}
                    <AccountCodeGenerator 
                      accountType={formData.accountType}
                      onCodeGenerated={(code) => handleFieldChange('accountCode', code)}
                    />

                    {/* AI Suggestions */}
                    <AISuggestionPanel 
                      suggestions={aiSuggestions}
                      onAcceptSuggestion={handleAcceptSuggestion}
                    />

                    {/* Preview Panel */}
                    <AnimatePresence>
                      {showPreview && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <Card variant="glass" className="border-l-4 border-l-green-500">
                            <div className="p-6">
                              <h4 className="font-semibold mb-4 flex items-center gap-2">
                                <Eye className="w-5 h-5 text-green-600" />
                                Account Preview
                              </h4>
                              
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Code:</span>
                                  <span className="text-sm font-mono font-medium">
                                    {formData.accountCode || 'Not set'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Name:</span>
                                  <span className="text-sm font-medium">
                                    {formData.accountName || 'Not set'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Type:</span>
                                  <span className={cn(
                                    "text-xs px-2 py-1 rounded-full border",
                                    selectedCategory.color
                                  )}>
                                    {selectedCategory.name}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Balance:</span>
                                  <span className="text-sm font-medium">
                                    {formData.currency} {formData.openingBalance.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Status:</span>
                                  <div className="flex items-center gap-1">
                                    {formData.isActive ? (
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                    ) : (
                                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                    )}
                                    <span className="text-sm">
                                      {formData.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
    </NavigationProvider>
  )
}