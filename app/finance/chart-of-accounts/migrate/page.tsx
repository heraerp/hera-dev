"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { 
  Upload, FileText, Download, ArrowLeft, CheckCircle, AlertTriangle,
  Brain, Zap, Eye, Settings, RefreshCw, Users, Building, FileSpreadsheet,
  Database, Target, Loader2, X, Check
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

// Navigation items
const navigationItems = [
  {
    id: "finance",
    label: "Finance",
    href: "/finance",
    icon: Building,
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
    id: "migrate-accounts",
    label: "Migrate Legacy Data",
    href: "/finance/chart-of-accounts/migrate",
    icon: Database,
    category: "finance"
  }
]

interface ParsedAccount {
  originalCode: string;
  originalName: string;
  originalType?: string;
  balance?: number;
  rowNumber: number;
}

interface MappedAccount {
  originalAccount: ParsedAccount;
  suggestedMapping: {
    accountCode: string;
    accountName: string;
    accountType: string;
    confidence: number;
    reasoning: string;
  };
  status: 'ready' | 'conflict' | 'manual_review';
}

import { useOrganization } from "@/utils/organization-context"

export default function MigrateChartsOfAccountsPage() {
  const router = useRouter()
  const { setContext } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { organizationId } = useOrganization()
  
  // Migration states
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'mapping' | 'execute' | 'complete'>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileFormat, setFileFormat] = useState<'auto_detect' | 'quickbooks' | 'xero' | 'sage' | 'csv'>('auto_detect')
  const [importResult, setImportResult] = useState<any>(null)
  const [migrationResult, setMigrationResult] = useState<any>(null)
  const [mappedAccounts, setMappedAccounts] = useState<MappedAccount[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Configuration states
  const [hasHeaders, setHasHeaders] = useState(true)
  const [skipRows, setSkipRows] = useState(0)
  const [mappingStrategy, setMappingStrategy] = useState<'ai_smart' | 'name_based' | 'code_based'>('ai_smart')

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

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
    }
  }

  // Process uploaded file
  const processFile = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setError(null)

    try {
      // Read file content
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        const fileContent = e.target?.result as string
        
        // Import and preview
        const response = await fetch('/api/finance/chart-of-accounts/import-csv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            organizationId: organizationId || '123e4567-e89b-12d3-a456-426614174000', // Use current org or Mario's as fallback
            fileContent: fileContent,
            fileFormat: fileFormat,
            hasHeaders: hasHeaders,
            skipRows: skipRows,
            previewMode: true
          })
        })

        if (response.ok) {
          const result = await response.json()
          setImportResult(result.data)
          setCurrentStep('preview')
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Failed to process file')
        }
        
        setIsProcessing(false)
      }
      
      reader.readAsText(selectedFile)
    } catch (error) {
      console.error('File processing error:', error)
      setError('Failed to read file')
      setIsProcessing(false)
    }
  }

  // Generate mapping preview
  const generateMapping = async () => {
    if (!importResult?.accounts) return

    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/finance/chart-of-accounts/migrate-legacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: organizationId || '123e4567-e89b-12d3-a456-426614174000',
          accounts: importResult.accounts,
          migrationMode: 'preview',
          mappingStrategy: mappingStrategy,
          conflictResolution: 'skip'
        })
      })

      if (response.ok) {
        const result = await response.json()
        setMigrationResult(result.data)
        setMappedAccounts(result.data.mappedAccounts)
        setCurrentStep('mapping')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to generate mapping')
      }
    } catch (error) {
      console.error('Mapping error:', error)
      setError('Failed to generate account mapping')
    } finally {
      setIsProcessing(false)
    }
  }

  // Execute migration
  const executeMigration = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/finance/chart-of-accounts/migrate-legacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: organizationId || '123e4567-e89b-12d3-a456-426614174000',
          accounts: importResult.accounts,
          migrationMode: 'execute', 
          mappingStrategy: mappingStrategy,
          conflictResolution: 'skip'
        })
      })

      if (response.ok) {
        const result = await response.json()
        setCurrentStep('complete')
        // Update migration result with execution details
        setMigrationResult(prev => ({
          ...prev,
          executionResult: result.data
        }))
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to execute migration')
      }
    } catch (error) {
      console.error('Migration execution error:', error)
      setError('Failed to execute migration')
    } finally {
      setIsProcessing(false)
    }
  }

  // Download template
  const downloadTemplate = async (format: string) => {
    try {
      const response = await fetch(`/api/finance/chart-of-accounts/import-csv?format=${format}`)
      if (response.ok) {
        const result = await response.json()
        
        // Create and download CSV file
        const blob = new Blob([result.data.csvTemplate], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `hera-coa-template-${format}.csv`
        link.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Template download error:', error)
    }
  }

  const resetMigration = () => {
    setCurrentStep('upload')
    setSelectedFile(null)
    setImportResult(null)
    setMigrationResult(null)
    setMappedAccounts([])
    setError(null)
  }

  if (!mounted) return null

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
                    Migrate Legacy Chart of Accounts
                  </motion.h1>
                  <motion.p 
                    className="text-muted-foreground mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Import your existing chart of accounts from QuickBooks, Xero, or CSV files
                  </motion.p>
                </div>

                <div className="flex items-center gap-3">
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
            <div className="max-w-5xl mx-auto space-y-6">
              
              {/* Progress Steps */}
              <Card variant="glass">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    {['upload', 'preview', 'mapping', 'execute', 'complete'].map((step, index) => {
                      const isActive = currentStep === step
                      const isCompleted = ['upload', 'preview', 'mapping', 'execute', 'complete'].indexOf(currentStep) > index
                      
                      return (
                        <div key={step} className="flex items-center">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center border-2",
                            isActive ? "border-financial-primary bg-financial-primary text-white" :
                            isCompleted ? "border-green-500 bg-green-500 text-white" :
                            "border-gray-300 bg-background text-gray-400"
                          )}>
                            {isCompleted ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <span className="text-sm font-semibold">{index + 1}</span>
                            )}
                          </div>
                          
                          {index < 4 && (
                            <div className={cn(
                              "w-20 h-0.5 mx-2",
                              isCompleted ? "bg-green-500" : "bg-gray-300"
                            )} />
                          )}
                        </div>
                      )
                    })}
                  </div>
                  
                  <div className="flex justify-between mt-2 text-sm">
                    <span className={cn(currentStep === 'upload' ? "text-financial-primary font-medium" : "text-muted-foreground")}>
                      Upload File
                    </span>
                    <span className={cn(currentStep === 'preview' ? "text-financial-primary font-medium" : "text-muted-foreground")}>
                      Preview Data
                    </span>
                    <span className={cn(currentStep === 'mapping' ? "text-financial-primary font-medium" : "text-muted-foreground")}>
                      Review Mapping
                    </span>
                    <span className={cn(currentStep === 'execute' ? "text-financial-primary font-medium" : "text-muted-foreground")}>
                      Execute Migration
                    </span>
                    <span className={cn(currentStep === 'complete' ? "text-financial-primary font-medium" : "text-muted-foreground")}>
                      Complete
                    </span>
                  </div>
                </div>
              </Card>

              {/* Error Alert */}
              {error && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Step 1: Upload File */}
              {currentStep === 'upload' && (
                <div className="space-y-6">
                  <Card variant="glass">
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-financial-primary" />
                        Upload Your Chart of Accounts
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* File Upload */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Select File
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="mt-4">
                              <label className="cursor-pointer">
                                <span className="text-financial-primary font-medium hover:text-financial-primary/80">
                                  Choose file
                                </span>
                                <input
                                  type="file"
                                  accept=".csv,.xlsx,.xls"
                                  onChange={handleFileUpload}
                                  className="sr-only"
                                />
                              </label>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                              CSV, Excel (.xlsx, .xls) files supported
                            </p>
                            {selectedFile && (
                              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-green-600" />
                                  <span className="text-sm text-green-800">{selectedFile.name}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Configuration */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              File Format
                            </label>
                            <select
                              value={fileFormat}
                              onChange={(e) => setFileFormat(e.target.value as any)}
                              className="w-full p-3 border border-border rounded-lg bg-background"
                            >
                              <option value="auto_detect">Auto Detect</option>
                              <option value="quickbooks">QuickBooks</option>
                              <option value="xero">Xero</option>
                              <option value="sage">Sage</option>
                              <option value="csv">Generic CSV</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={hasHeaders}
                                onChange={(e) => setHasHeaders(e.target.checked)}
                                className="rounded border-border"
                              />
                              <span className="text-sm">File has headers</span>
                            </label>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Skip Rows
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="10"
                              value={skipRows}
                              onChange={(e) => setSkipRows(parseInt(e.target.value) || 0)}
                              className="w-full p-3 border border-border rounded-lg bg-background"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between">
                        <div>
                          <Button
                            variant="outline"
                            onClick={() => downloadTemplate('quickbooks')}
                            leftIcon={<Download className="w-4 h-4" />}
                            size="sm"
                          >
                            QuickBooks Template
                          </Button>
                        </div>
                        
                        <Button
                          onClick={processFile}
                          disabled={!selectedFile || isProcessing}
                          className="bg-gradient-to-r from-financial-primary to-financial-success"
                          leftIcon={isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                        >
                          {isProcessing ? 'Processing...' : 'Preview Data'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Step 2: Preview Data */}
              {currentStep === 'preview' && importResult && (
                <div className="space-y-6">
                  <Card variant="glass">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                          <FileSpreadsheet className="w-5 h-5 text-financial-primary" />
                          Data Preview
                        </h3>
                        <Badge className="bg-green-100 text-green-800">
                          {importResult.parsedAccounts} accounts found
                        </Badge>
                      </div>

                      {/* Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="text-2xl font-bold text-blue-600">{importResult.totalRows}</div>
                          <div className="text-sm text-blue-800">Total Rows</div>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="text-2xl font-bold text-green-600">{importResult.parsedAccounts}</div>
                          <div className="text-sm text-green-800">Valid Accounts</div>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="text-2xl font-bold text-red-600">{importResult.errors.length}</div>
                          <div className="text-sm text-red-800">Errors</div>
                        </div>
                      </div>

                      {/* Sample Data */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                        <h4 className="font-medium mb-3">Sample Accounts:</h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {importResult.accounts.slice(0, 5).map((account: ParsedAccount, index: number) => (
                            <div key={index} className="flex items-center justify-between text-sm bg-white p-3 rounded border">
                              <div className="flex items-center gap-4">
                                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                  {account.originalCode}
                                </code>
                                <span className="font-medium">{account.originalName}</span>
                                {account.originalType && (
                                  <Badge variant="outline" className="text-xs">
                                    {account.originalType}
                                  </Badge>
                                )}
                              </div>
                              {account.balance && (
                                <span className="text-financial-primary font-mono">
                                  ${account.balance.toFixed(2)}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentStep('upload')}
                          leftIcon={<ArrowLeft className="w-4 h-4" />}
                        >
                          Back to Upload
                        </Button>
                        
                        <Button
                          onClick={generateMapping}
                          disabled={isProcessing}
                          className="bg-gradient-to-r from-financial-primary to-financial-success"
                          leftIcon={isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                        >
                          {isProcessing ? 'Analyzing...' : 'Generate Smart Mapping'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Step 3: Review Mapping */}
              {currentStep === 'mapping' && migrationResult && (
                <div className="space-y-6">
                  <Card variant="glass">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                          <Target className="w-5 h-5 text-financial-primary" />
                          AI-Generated Account Mapping
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800">
                            {migrationResult.mapped} ready
                          </Badge>
                          {migrationResult.conflicts > 0 && (
                            <Badge className="bg-red-100 text-red-800">
                              {migrationResult.conflicts} conflicts
                            </Badge>
                          )}
                          {migrationResult.manualReview > 0 && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              {migrationResult.manualReview} review needed
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Account Mappings */}
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {mappedAccounts.map((mapped, index) => (
                          <div
                            key={index}
                            className={cn(
                              "p-4 border rounded-lg",
                              mapped.status === 'ready' ? "bg-green-50 border-green-200" :
                              mapped.status === 'conflict' ? "bg-red-50 border-red-200" :
                              "bg-yellow-50 border-yellow-200"
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="text-sm">
                                    <code className="bg-gray-100 px-2 py-1 rounded">
                                      {mapped.originalAccount.originalCode}
                                    </code>
                                    <span className="mx-2">→</span>
                                    <code className="bg-financial-primary/10 px-2 py-1 rounded">
                                      {mapped.suggestedMapping.accountCode}
                                    </code>
                                  </div>
                                  <Badge className={cn(
                                    "text-xs",
                                    mapped.suggestedMapping.confidence >= 0.9 ? "bg-green-100 text-green-800" :
                                    mapped.suggestedMapping.confidence >= 0.7 ? "bg-yellow-100 text-yellow-800" :
                                    "bg-red-100 text-red-800"
                                  )}>
                                    {Math.round(mapped.suggestedMapping.confidence * 100)}% confidence
                                  </Badge>
                                </div>
                                
                                <div className="text-sm font-medium mb-1">
                                  {mapped.originalAccount.originalName} → {mapped.suggestedMapping.accountName}
                                </div>
                                
                                <div className="text-xs text-financial-primary bg-financial-primary/10 px-2 py-1 rounded inline-block">
                                  AI: {mapped.suggestedMapping.reasoning}
                                </div>
                              </div>
                              
                              <Badge className={cn(
                                "ml-4",
                                mapped.status === 'ready' ? "bg-green-100 text-green-800" :
                                mapped.status === 'conflict' ? "bg-red-100 text-red-800" :
                                "bg-yellow-100 text-yellow-800"
                              )}>
                                {mapped.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 flex items-center justify-between">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentStep('preview')}
                          leftIcon={<ArrowLeft className="w-4 h-4" />}
                        >
                          Back to Preview
                        </Button>
                        
                        <Button
                          onClick={() => setCurrentStep('execute')}
                          className="bg-gradient-to-r from-financial-primary to-financial-success"
                          leftIcon={<Zap className="w-4 h-4" />}
                        >
                          Proceed to Migration
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Step 4: Execute Migration */}
              {currentStep === 'execute' && (
                <div className="space-y-6">
                  <Card variant="glass">
                    <div className="p-6 text-center">
                      <div className="w-20 h-20 bg-gradient-to-r from-financial-primary to-financial-success rounded-full flex items-center justify-center mx-auto mb-6">
                        <Database className="w-10 h-10 text-white" />
                      </div>
                      
                      <h3 className="text-2xl font-semibold mb-4">Ready to Execute Migration</h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        {migrationResult?.mapped || 0} accounts are ready to be created in your HERA Chart of Accounts.
                        This action cannot be undone.
                      </p>

                      <div className="flex items-center justify-center gap-4">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentStep('mapping')}
                          leftIcon={<ArrowLeft className="w-4 h-4" />}
                        >
                          Back to Review
                        </Button>
                        
                        <Button
                          onClick={executeMigration}
                          disabled={isProcessing}
                          className="bg-gradient-to-r from-financial-primary to-financial-success"
                          leftIcon={isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                        >
                          {isProcessing ? 'Migrating...' : 'Execute Migration'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Step 5: Complete */}
              {currentStep === 'complete' && (
                <div className="space-y-6">
                  <Card variant="glass">
                    <div className="p-6 text-center">
                      <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-white" />
                      </div>
                      
                      <h3 className="text-2xl font-semibold mb-4">Migration Complete!</h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Your legacy chart of accounts has been successfully migrated to HERA.
                      </p>

                      {migrationResult?.executionResult && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="text-2xl font-bold text-green-600">
                              {migrationResult.executionResult.bulkCreationResult?.created || 0}
                            </div>
                            <div className="text-sm text-green-800">Accounts Created</div>
                          </div>
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="text-2xl font-bold text-yellow-600">
                              {migrationResult.executionResult.bulkCreationResult?.skipped || 0}
                            </div>
                            <div className="text-sm text-yellow-800">Accounts Skipped</div>
                          </div>
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="text-2xl font-bold text-red-600">
                              {migrationResult.executionResult.bulkCreationResult?.failed || 0}
                            </div>
                            <div className="text-sm text-red-800">Accounts Failed</div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-center gap-4">
                        <Button
                          variant="outline"
                          onClick={resetMigration}
                          leftIcon={<RefreshCw className="w-4 h-4" />}
                        >
                          Migrate More Data
                        </Button>
                        
                        <Button
                          onClick={() => router.push('/finance/chart-of-accounts')}
                          className="bg-gradient-to-r from-financial-primary to-financial-success"
                          leftIcon={<Eye className="w-4 h-4" />}
                        >
                          View Chart of Accounts
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </NavigationProvider>
  )
}