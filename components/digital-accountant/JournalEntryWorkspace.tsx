'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Brain,
  Calculator,
  CheckCircle,
  AlertTriangle,
  Save,
  Send,
  Eye,
  Search,
  Filter,
  Calendar,
  DollarSign,
  User,
  FileText,
  RefreshCw,
  Zap,
  Target
} from 'lucide-react'
import ConfidenceIndicator from './ConfidenceIndicator'

interface JournalEntry {
  id: string
  journalNumber: string
  description: string
  entryDate: string
  status: 'draft' | 'posted' | 'pending_approval' | 'rejected'
  totalDebits: number
  totalCredits: number
  isBalanced: boolean
  lines: JournalEntryLine[]
  aiMetadata?: {
    generated: boolean
    confidenceScore: number
    suggestions: string[]
    sourceDocument?: string
    analysisId?: string
  }
  createdAt: string
  createdBy: string
  postedAt?: string
  approvedBy?: string
}

interface JournalEntryLine {
  id: string
  accountCode: string
  accountName: string
  description: string
  debit: number
  credit: number
  costCenter?: string
  project?: string
}

interface AccountSuggestion {
  accountCode: string
  accountName: string
  confidence: number
  reason: string
}

interface AIAssistant {
  isActive: boolean
  suggestions: AccountSuggestion[]
  recommendation: string
  confidence: number
}

export default function JournalEntryWorkspace() {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [aiAssistant, setAiAssistant] = useState<AIAssistant>({
    isActive: true,
    suggestions: [],
    recommendation: '',
    confidence: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>('list')

  // Function to check for journal entries from processed documents
  const checkProcessedDocuments = () => {
    const processedDocs = localStorage.getItem('processedDocuments')
    if (processedDocs) {
      const docs = JSON.parse(processedDocs)
      const newEntries: JournalEntry[] = []
      
      docs.forEach((doc: any) => {
        if (doc.type === 'invoice' && doc.status === 'completed' && doc.extractedData) {
          const existingEntry = journalEntries.find(je => je.aiMetadata?.sourceDocument === doc.filename)
          if (!existingEntry) {
            const newEntry: JournalEntry = {
              id: `je-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              journalNumber: `JE-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(journalEntries.length + newEntries.length + 1).padStart(3, '0')}`,
              description: `Invoice from ${doc.extractedData.vendor} - ${doc.extractedData.invoiceNumber || doc.filename}`,
              entryDate: doc.extractedData.date || new Date().toISOString().slice(0,10),
              status: 'draft',
              totalDebits: doc.extractedData.amount || 0,
              totalCredits: doc.extractedData.amount || 0,
              isBalanced: true,
              lines: [
                {
                  id: `line-${Date.now()}-1`,
                  accountCode: '1200001',
                  accountName: 'Inventory - Food & Beverage',
                  description: `${doc.extractedData.vendor} - ${doc.extractedData.invoiceNumber || 'Invoice'}`,
                  debit: doc.extractedData.amount || 0,
                  credit: 0
                },
                {
                  id: `line-${Date.now()}-2`,
                  accountCode: '2100001',
                  accountName: 'Accounts Payable',
                  description: `${doc.extractedData.vendor} - ${doc.extractedData.invoiceNumber || 'Invoice'}`,
                  debit: 0,
                  credit: doc.extractedData.amount || 0
                }
              ],
              aiMetadata: {
                generated: true,
                confidenceScore: doc.confidence || 0.95,
                suggestions: [
                  'Auto-generated from processed invoice',
                  'Review account mappings before posting',
                  'Three-way match recommended'
                ],
                sourceDocument: doc.filename,
                analysisId: doc.id
              },
              createdAt: new Date().toISOString(),
              createdBy: 'AI Digital Accountant'
            }
            newEntries.push(newEntry)
          }
        }
      })
      
      if (newEntries.length > 0) {
        setJournalEntries(prev => [...newEntries, ...prev])
      }
    }
  }

  // Check for new processed documents every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      checkProcessedDocuments()
    }, 3000)
    
    return () => clearInterval(interval)
  }, [journalEntries.length])

  // Mock data - replace with real API calls
  useEffect(() => {
    const loadJournalEntries = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Check for processed documents first
      checkProcessedDocuments()
      
      // Then load existing entries
      setJournalEntries(prev => [...prev,
        {
          id: '1',
          journalNumber: 'JE-20240118-001',
          description: 'Accrual for office supplies expense',
          entryDate: '2024-01-18',
          status: 'posted',
          totalDebits: 1250.00,
          totalCredits: 1250.00,
          isBalanced: true,
          lines: [
            {
              id: '1',
              accountCode: '6200001',
              accountName: 'Office Supplies Expense',
              description: 'Office supplies for Q1 2024',
              debit: 1250.00,
              credit: 0
            },
            {
              id: '2',
              accountCode: '2100001',
              accountName: 'Accounts Payable',
              description: 'ACME Corporation - INV-2024-0847',
              debit: 0,
              credit: 1250.00
            }
          ],
          aiMetadata: {
            generated: true,
            confidenceScore: 0.96,
            suggestions: ['Account mapping verified', 'Transaction balanced'],
            sourceDocument: 'INV-2024-0847',
            analysisId: 'ai-analysis-001'
          },
          createdAt: '2024-01-18T10:30:00Z',
          createdBy: 'system',
          postedAt: '2024-01-18T10:35:00Z',
          approvedBy: 'jane.smith@company.com'
        },
        {
          id: '2',
          journalNumber: 'JE-20240118-002',
          description: 'Depreciation expense - Computer equipment',
          entryDate: '2024-01-18',
          status: 'draft',
          totalDebits: 850.00,
          totalCredits: 850.00,
          isBalanced: true,
          lines: [
            {
              id: '3',
              accountCode: '6300002',
              accountName: 'Depreciation Expense - Equipment',
              description: 'Monthly depreciation - Computer equipment',
              debit: 850.00,
              credit: 0
            },
            {
              id: '4',
              accountCode: '1600002',
              accountName: 'Accumulated Depreciation - Equipment',
              description: 'Monthly depreciation - Computer equipment',
              debit: 0,
              credit: 850.00
            }
          ],
          aiMetadata: {
            generated: true,
            confidenceScore: 0.89,
            suggestions: ['Review depreciation rate', 'Verify asset classification'],
            analysisId: 'ai-analysis-002'
          },
          createdAt: '2024-01-18T14:20:00Z',
          createdBy: 'john.doe@company.com'
        },
        {
          id: '3',
          journalNumber: 'JE-20240118-003',
          description: 'Bank reconciliation adjustment',
          entryDate: '2024-01-18',
          status: 'pending_approval',
          totalDebits: 275.50,
          totalCredits: 275.50,
          isBalanced: true,
          lines: [
            {
              id: '5',
              accountCode: '1100001',
              accountName: 'Cash - Operating Account',
              description: 'Bank reconciliation adjustment',
              debit: 275.50,
              credit: 0
            },
            {
              id: '6',
              accountCode: '5200001',
              accountName: 'Miscellaneous Income',
              description: 'Interest income from bank',
              debit: 0,
              credit: 275.50
            }
          ],
          createdAt: '2024-01-18T16:45:00Z',
          createdBy: 'jane.smith@company.com'
        }
      ])
      
      setLoading(false)
    }

    loadJournalEntries()
  }, [])

  const initializeNewEntry = () => {
    const newEntry: JournalEntry = {
      id: `temp-${Date.now()}`,
      journalNumber: `JE-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Date.now().toString().slice(-3)}`,
      description: '',
      entryDate: new Date().toISOString().split('T')[0],
      status: 'draft',
      totalDebits: 0,
      totalCredits: 0,
      isBalanced: false,
      lines: [
        {
          id: '1',
          accountCode: '',
          accountName: '',
          description: '',
          debit: 0,
          credit: 0
        },
        {
          id: '2',
          accountCode: '',
          accountName: '',
          description: '',
          debit: 0,
          credit: 0
        }
      ],
      createdAt: new Date().toISOString(),
      createdBy: 'current.user@company.com'
    }
    
    setCurrentEntry(newEntry)
    setIsCreating(true)
    setActiveTab('create')
    
    // Trigger AI assistance
    triggerAIAssistance('')
  }

  const addNewLine = () => {
    if (!currentEntry) return
    
    const newLine: JournalEntryLine = {
      id: `line-${Date.now()}`,
      accountCode: '',
      accountName: '',
      description: '',
      debit: 0,
      credit: 0
    }
    
    setCurrentEntry({
      ...currentEntry,
      lines: [...currentEntry.lines, newLine]
    })
  }

  const updateLine = (lineId: string, field: keyof JournalEntryLine, value: any) => {
    if (!currentEntry) return
    
    const updatedLines = currentEntry.lines.map(line => 
      line.id === lineId ? { ...line, [field]: value } : line
    )
    
    const totalDebits = updatedLines.reduce((sum, line) => sum + (line.debit || 0), 0)
    const totalCredits = updatedLines.reduce((sum, line) => sum + (line.credit || 0), 0)
    const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01
    
    setCurrentEntry({
      ...currentEntry,
      lines: updatedLines,
      totalDebits,
      totalCredits,
      isBalanced
    })
    
    // Trigger AI assistance for account suggestions
    if (field === 'description' && value.length > 3) {
      triggerAIAssistance(value)
    }
  }

  const removeLine = (lineId: string) => {
    if (!currentEntry || currentEntry.lines.length <= 2) return
    
    const updatedLines = currentEntry.lines.filter(line => line.id !== lineId)
    const totalDebits = updatedLines.reduce((sum, line) => sum + (line.debit || 0), 0)
    const totalCredits = updatedLines.reduce((sum, line) => sum + (line.credit || 0), 0)
    const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01
    
    setCurrentEntry({
      ...currentEntry,
      lines: updatedLines,
      totalDebits,
      totalCredits,
      isBalanced
    })
  }

  const triggerAIAssistance = async (description: string) => {
    // Mock AI suggestions
    const suggestions: AccountSuggestion[] = [
      {
        accountCode: '6200001',
        accountName: 'Office Supplies Expense',
        confidence: 0.92,
        reason: 'Keywords: office, supplies'
      },
      {
        accountCode: '6100001',
        accountName: 'Professional Services',
        confidence: 0.84,
        reason: 'Similar transaction patterns'
      },
      {
        accountCode: '2100001',
        accountName: 'Accounts Payable',
        confidence: 0.96,
        reason: 'Common credit account for expenses'
      }
    ]
    
    setAiAssistant({
      isActive: true,
      suggestions,
      recommendation: 'Based on the description, this appears to be an expense transaction. Consider debiting an expense account and crediting accounts payable.',
      confidence: 0.89
    })
  }

  const saveEntry = async () => {
    if (!currentEntry) return
    
    // Mock save - update existing or add new
    setJournalEntries(prev => {
      const existingIndex = prev.findIndex(e => e.id === currentEntry.id)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = currentEntry
        return updated
      }
      return [currentEntry, ...prev]
    })
    setCurrentEntry(null)
    setIsCreating(false)
    setActiveTab('list')
  }

  const postEntry = async () => {
    if (!currentEntry || !currentEntry.isBalanced) return
    
    const postedEntry = {
      ...currentEntry,
      status: 'posted' as const,
      postedAt: new Date().toISOString()
    }
    
    setJournalEntries(prev => {
      const existingIndex = prev.findIndex(e => e.id === currentEntry.id)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = postedEntry
        return updated
      }
      return [postedEntry, ...prev]
    })
    setCurrentEntry(null)
    setIsCreating(false)
    setActiveTab('list')
  }

  const filteredEntries = journalEntries.filter(entry => {
    const matchesSearch = entry.journalNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || entry.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: JournalEntry['status']) => {
    switch (status) {
      case 'posted':
        return <Badge className="bg-green-100 text-green-800 border-green-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          Posted
        </Badge>
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">
          <FileText className="w-3 h-3 mr-1" />
          Draft
        </Badge>
      case 'pending_approval':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
          <RefreshCw className="w-3 h-3 mr-1" />
          Pending Approval
        </Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-300">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            Journal Entry Workspace
          </h1>
          <p className="text-gray-600">
            AI-assisted journal entry creation, validation, and posting
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            <Brain className="w-4 h-4 mr-1" />
            AI Assistant Active
          </Badge>
          <Button onClick={initializeNewEntry}>
            <Plus className="h-4 w-4 mr-2" />
            Create Entry
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="create" disabled={!isCreating}>
            {isCreating && currentEntry ? 'Review Entry' : 'Create Entry'}
          </TabsTrigger>
          <TabsTrigger value="list">Journal Entries</TabsTrigger>
          <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
        </TabsList>

        {/* Create Entry Tab */}
        {isCreating && (
          <TabsContent value="create">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Entry Form */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Journal Entry Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Journal Number</label>
                        <Input 
                          value={currentEntry?.journalNumber || ''} 
                          onChange={(e) => setCurrentEntry(prev => prev ? { ...prev, journalNumber: e.target.value } : null)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Entry Date</label>
                        <Input 
                          type="date"
                          value={currentEntry?.entryDate || ''} 
                          onChange={(e) => setCurrentEntry(prev => prev ? { ...prev, entryDate: e.target.value } : null)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea 
                        placeholder="Enter journal entry description..."
                        value={currentEntry?.description || ''} 
                        onChange={(e) => setCurrentEntry(prev => prev ? { ...prev, description: e.target.value } : null)}
                        className="resize-none"
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Journal Lines */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Journal Lines</CardTitle>
                      <Button variant="outline" size="sm" onClick={addNewLine}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Line
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead className="border-b">
                          <tr>
                            <th className="text-left p-2 font-medium">Account Code</th>
                            <th className="text-left p-2 font-medium">Account Name</th>
                            <th className="text-left p-2 font-medium">Description</th>
                            <th className="text-right p-2 font-medium">Debit</th>
                            <th className="text-right p-2 font-medium">Credit</th>
                            <th className="text-center p-2 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentEntry?.lines.map((line, index) => (
                            <tr key={line.id} className="border-b">
                              <td className="p-2">
                                <Input 
                                  value={line.accountCode}
                                  onChange={(e) => updateLine(line.id, 'accountCode', e.target.value)}
                                  className="w-24"
                                  placeholder="Account"
                                />
                              </td>
                              <td className="p-2">
                                <Input 
                                  value={line.accountName}
                                  onChange={(e) => updateLine(line.id, 'accountName', e.target.value)}
                                  className="min-w-0"
                                  placeholder="Account Name"
                                />
                              </td>
                              <td className="p-2">
                                <Input 
                                  value={line.description}
                                  onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                                  className="min-w-0"
                                  placeholder="Description"
                                />
                              </td>
                              <td className="p-2">
                                <Input 
                                  type="number"
                                  value={line.debit || ''}
                                  onChange={(e) => updateLine(line.id, 'debit', parseFloat(e.target.value) || 0)}
                                  className="w-24 text-right"
                                  placeholder="0.00"
                                  step="0.01"
                                />
                              </td>
                              <td className="p-2">
                                <Input 
                                  type="number"
                                  value={line.credit || ''}
                                  onChange={(e) => updateLine(line.id, 'credit', parseFloat(e.target.value) || 0)}
                                  className="w-24 text-right"
                                  placeholder="0.00"
                                  step="0.01"
                                />
                              </td>
                              <td className="p-2 text-center">
                                {currentEntry.lines.length > 2 && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => removeLine(line.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="border-t bg-gray-50">
                          <tr>
                            <td colSpan={3} className="p-2 font-medium">Totals</td>
                            <td className="p-2 text-right font-bold">
                              ${currentEntry?.totalDebits.toFixed(2) || '0.00'}
                            </td>
                            <td className="p-2 text-right font-bold">
                              ${currentEntry?.totalCredits.toFixed(2) || '0.00'}
                            </td>
                            <td className="p-2 text-center">
                              {currentEntry?.isBalanced ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                              )}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Balance Check */}
                    {currentEntry && !currentEntry.isBalanced && (
                      <Alert className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Entry is not balanced. Debits: ${currentEntry.totalDebits.toFixed(2)}, 
                          Credits: ${currentEntry.totalCredits.toFixed(2)}, 
                          Difference: ${Math.abs(currentEntry.totalDebits - currentEntry.totalCredits).toFixed(2)}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Calculator className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {currentEntry?.isBalanced ? 'Entry is balanced' : 'Entry must be balanced to post'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => {
                          setIsCreating(false)
                          setCurrentEntry(null)
                          setActiveTab('list')
                        }}>
                          Cancel
                        </Button>
                        <Button variant="outline" onClick={saveEntry}>
                          <Save className="h-4 w-4 mr-2" />
                          Save Draft
                        </Button>
                        <Button 
                          onClick={postEntry}
                          disabled={!currentEntry?.isBalanced}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Post Entry
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI Assistant Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      AI Assistant
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {aiAssistant.recommendation && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-sm">AI Recommendation</span>
                        </div>
                        <p className="text-sm text-blue-800">{aiAssistant.recommendation}</p>
                        <div className="mt-2">
                          <ConfidenceIndicator confidence={aiAssistant.confidence} size="sm" />
                        </div>
                      </div>
                    )}

                    {aiAssistant.suggestions.length > 0 && (
                      <div>
                        <div className="text-sm font-medium mb-2">Account Suggestions</div>
                        <div className="space-y-2">
                          {aiAssistant.suggestions.map((suggestion, index) => (
                            <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                              <div className="flex items-center justify-between mb-1">
                                <div className="font-medium text-sm">{suggestion.accountCode}</div>
                                <ConfidenceIndicator confidence={suggestion.confidence} size="sm" showPercentage={false} />
                              </div>
                              <div className="text-xs text-gray-600 mb-1">{suggestion.accountName}</div>
                              <div className="text-xs text-gray-500">{suggestion.reason}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Calculator className="h-4 w-4 mr-2" />
                      Auto-Balance
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      From Template
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Clear All Lines
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        )}

        {/* Journal Entries List Tab */}
        <TabsContent value="list">
          <div className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search journal entries..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="pending_approval">Pending Approval</option>
                    <option value="posted">Posted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Entries List */}
            <div className="space-y-4">
              {filteredEntries.map((entry) => (
                <Card key={entry.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <h3 className="text-lg font-semibold">{entry.journalNumber}</h3>
                          {getStatusBadge(entry.status)}
                          {entry.aiMetadata?.generated && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                              <Brain className="w-3 h-3 mr-1" />
                              AI Generated
                            </Badge>
                          )}
                          {entry.aiMetadata?.sourceDocument && (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                              <FileText className="w-3 h-3 mr-1" />
                              From {entry.aiMetadata.sourceDocument}
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600">{entry.description}</p>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {entry.entryDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            ${entry.totalDebits.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {entry.createdBy}
                          </span>
                          {entry.postedAt && (
                            <span>Posted: {new Date(entry.postedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {entry.aiMetadata && (
                          <ConfidenceIndicator confidence={entry.aiMetadata.confidenceScore} size="sm" />
                        )}
                        {entry.status === 'draft' && (
                          <>
                            <Button 
                              variant="default" 
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => {
                                // Simulate posting the entry
                                setJournalEntries(prev => prev.map(je => 
                                  je.id === entry.id 
                                    ? { ...je, status: 'posted', postedAt: new Date().toISOString() }
                                    : je
                                ))
                              }}
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Post
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setCurrentEntry(entry)
                                setIsCreating(true)
                                setActiveTab('create')
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          </>
                        )}
                        {entry.status === 'posted' && (
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Entry Summary */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Lines: </span>
                          <span className="font-medium">{entry.lines.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Balance: </span>
                          <span className={`font-medium ${entry.isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                            {entry.isBalanced ? 'Balanced' : 'Unbalanced'}
                          </span>
                        </div>
                      </div>
                      
                      {/* AI Metadata for entries from documents */}
                      {entry.aiMetadata?.sourceDocument && entry.aiMetadata?.suggestions && (
                        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <Brain className="h-4 w-4 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-blue-900 mb-1">AI Analysis</div>
                              <ul className="text-xs text-blue-800 space-y-1">
                                {entry.aiMetadata.suggestions.map((suggestion, idx) => (
                                  <li key={idx} className="flex items-start gap-1">
                                    <span className="text-blue-600">•</span>
                                    <span>{suggestion}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredEntries.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No journal entries found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Try adjusting your search or filters'
                      : 'Create your first journal entry to get started'
                    }
                  </p>
                  <Button onClick={initializeNewEntry}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Journal Entry
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* AI Assistant Tab */}
        <TabsContent value="ai-assistant">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Assistant Dashboard
              </CardTitle>
              <CardDescription>
                AI-powered assistance for journal entry creation and validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Brain className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">AI Assistant Features</h3>
                <div className="text-sm space-y-2 max-w-md mx-auto">
                  <p>• Intelligent account suggestions based on description</p>
                  <p>• Automatic balance validation and error detection</p>
                  <p>• Template recommendations for common transactions</p>
                  <p>• Compliance checking and approval workflows</p>
                  <p>• Real-time confidence scoring and feedback</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}