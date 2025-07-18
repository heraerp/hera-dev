/**
 * HERA Business Action Executor
 * Converts conversational intents into HERA universal transactions
 */

"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, Pause, CheckCircle, AlertCircle, Clock, 
  DollarSign, FileText, Users, Package, CreditCard,
  TrendingUp, AlertTriangle, Info, Zap, Brain,
  ChevronRight, ChevronDown, Eye, Settings, X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useConversationStore } from '@/stores/conversationStore'
import { HeraTransactionService } from '@/services/heraTransactions'
import type { 
  BusinessAction, 
  ActionResult, 
  BusinessActionType,
  UniversalTransaction,
  ValidationError,
  ValidationWarning
} from '@/types/conversation'

// ================================================================================================
// BUSINESS ACTION EXECUTOR COMPONENT
// ================================================================================================

interface BusinessActionExecutorProps {
  className?: string
  showPreview?: boolean
  autoExecute?: boolean
  confirmationRequired?: boolean
}

export function BusinessActionExecutor({
  className,
  showPreview = true,
  autoExecute = false,
  confirmationRequired = true
}: BusinessActionExecutorProps) {
  const { pendingActions, executeAction } = useConversationStore(state => ({
    pendingActions: state.pendingActions,
    executeAction: state.executeAction
  }))

  const [executingActions, setExecutingActions] = useState<Set<string>>(new Set())
  const [completedActions, setCompletedActions] = useState<Map<string, ActionResult>>(new Map())
  const [expandedActions, setExpandedActions] = useState<Set<string>>(new Set())
  const [selectedActions, setSelectedActions] = useState<Set<string>>(new Set())

  // Auto-execute valid actions if enabled
  useEffect(() => {
    if (autoExecute && !confirmationRequired) {
      pendingActions
        .filter(action => action.validation.isValid && !executingActions.has(action.id))
        .forEach(action => handleExecuteAction(action))
    }
  }, [pendingActions, autoExecute, confirmationRequired, executingActions])

  const handleExecuteAction = async (action: BusinessAction) => {
    setExecutingActions(prev => new Set([...prev, action.id]))

    try {
      await executeAction(action)
      
      // Simulate result for demo
      const result: ActionResult = {
        actionId: action.id,
        success: Math.random() > 0.1, // 90% success rate
        message: `Successfully executed ${action.description}`,
        transactionId: `txn_${Date.now()}`,
        data: await simulateTransactionCreation(action)
      }

      setCompletedActions(prev => new Map([...prev, [action.id, result]]))
    } catch (error) {
      const result: ActionResult = {
        actionId: action.id,
        success: false,
        message: error instanceof Error ? error.message : 'Action execution failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
      setCompletedActions(prev => new Map([...prev, [action.id, result]]))
    } finally {
      setExecutingActions(prev => {
        const newSet = new Set(prev)
        newSet.delete(action.id)
        return newSet
      })
    }
  }

  const simulateTransactionCreation = async (action: BusinessAction): Promise<UniversalTransaction> => {
    // Map business action to transaction type
    const transactionTypeMap: Record<BusinessActionType, string> = {
      'create_invoice': 'sales',
      'record_payment': 'payment',
      'add_customer': 'master_data',
      'update_inventory': 'inventory',
      'create_purchase_order': 'purchase',
      'process_expense': 'purchase',
      'generate_report': 'journal_entry',
      'assign_workflow': 'master_data',
      'approve_transaction': 'journal_entry',
      'send_notification': 'master_data'
    }

    // Create transaction through HeraTransactionService
    return await HeraTransactionService.createTransaction({
      organizationId: '550e8400-e29b-41d4-a716-446655440000',
      transactionType: transactionTypeMap[action.type] || 'journal_entry',
      transactionData: {
        conversationAction: action,
        aiGenerated: true,
        confidence: action.validation.isValid ? 0.9 : 0.6,
        executedAt: new Date().toISOString(),
        ...action.parameters
      }
    })
  }

  const toggleActionExpansion = (actionId: string) => {
    setExpandedActions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(actionId)) {
        newSet.delete(actionId)
      } else {
        newSet.add(actionId)
      }
      return newSet
    })
  }

  const toggleActionSelection = (actionId: string) => {
    setSelectedActions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(actionId)) {
        newSet.delete(actionId)
      } else {
        newSet.add(actionId)
      }
      return newSet
    })
  }

  const executeSelectedActions = async () => {
    const actionsToExecute = pendingActions.filter(action => 
      selectedActions.has(action.id) && 
      action.validation.isValid && 
      !executingActions.has(action.id)
    )

    for (const action of actionsToExecute) {
      await handleExecuteAction(action)
    }

    setSelectedActions(new Set())
  }

  if (pendingActions.length === 0) {
    return null
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Business Actions
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {pendingActions.length} action{pendingActions.length !== 1 ? 's' : ''} ready to execute
            </p>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedActions.size > 0 && (
          <motion.button
            onClick={executeSelectedActions}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="w-4 h-4" />
            <span>Execute {selectedActions.size} Actions</span>
          </motion.button>
        )}
      </div>

      {/* Actions List */}
      <div className="space-y-3">
        <AnimatePresence>
          {pendingActions.map((action, index) => (
            <ActionCard
              key={action.id}
              action={action}
              isExecuting={executingActions.has(action.id)}
              result={completedActions.get(action.id)}
              isExpanded={expandedActions.has(action.id)}
              isSelected={selectedActions.has(action.id)}
              onExecute={() => handleExecuteAction(action)}
              onToggleExpansion={() => toggleActionExpansion(action.id)}
              onToggleSelection={() => toggleActionSelection(action.id)}
              showPreview={showPreview}
              index={index}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ================================================================================================
// ACTION CARD COMPONENT
// ================================================================================================

interface ActionCardProps {
  action: BusinessAction
  isExecuting: boolean
  result?: ActionResult
  isExpanded: boolean
  isSelected: boolean
  onExecute: () => void
  onToggleExpansion: () => void
  onToggleSelection: () => void
  showPreview: boolean
  index: number
}

function ActionCard({
  action,
  isExecuting,
  result,
  isExpanded,
  isSelected,
  onExecute,
  onToggleExpansion,
  onToggleSelection,
  showPreview,
  index
}: ActionCardProps) {
  const getActionIcon = () => {
    switch (action.type) {
      case 'create_invoice': return FileText
      case 'record_payment': return DollarSign
      case 'add_customer': return Users
      case 'update_inventory': return Package
      case 'create_purchase_order': return CreditCard
      case 'generate_report': return TrendingUp
      default: return Zap
    }
  }

  const getStatusColor = () => {
    if (result) {
      return result.success ? 'green' : 'red'
    }
    if (isExecuting) return 'blue'
    if (!action.validation.isValid) return 'red'
    return 'slate'
  }

  const getStatusIcon = () => {
    if (result) {
      return result.success ? CheckCircle : AlertCircle
    }
    if (isExecuting) return Clock
    if (!action.validation.isValid) return AlertTriangle
    return null
  }

  const ActionIcon = getActionIcon()
  const StatusIcon = getStatusIcon()
  const statusColor = getStatusColor()

  return (
    <motion.div
      className={cn(
        "border rounded-xl p-4 transition-all duration-300",
        isSelected && "ring-2 ring-blue-500 border-blue-300",
        result?.success && "border-green-200 bg-green-50 dark:bg-green-900/20",
        result && !result.success && "border-red-200 bg-red-50 dark:bg-red-900/20",
        !result && action.validation.isValid && "border-slate-200 dark:border-slate-700 hover:border-blue-300",
        !result && !action.validation.isValid && "border-red-200 bg-red-50 dark:bg-red-900/20"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      layout
    >
      {/* Main Action Row */}
      <div className="flex items-center space-x-4">
        {/* Selection Checkbox */}
        <motion.button
          onClick={onToggleSelection}
          className={cn(
            "w-5 h-5 rounded border-2 flex items-center justify-center",
            isSelected 
              ? "bg-blue-500 border-blue-500" 
              : "border-slate-300 dark:border-slate-600 hover:border-blue-400"
          )}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
        </motion.button>

        {/* Action Icon */}
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          statusColor === 'green' && "bg-green-100 dark:bg-green-900/30",
          statusColor === 'red' && "bg-red-100 dark:bg-red-900/30",
          statusColor === 'blue' && "bg-blue-100 dark:bg-blue-900/30",
          statusColor === 'slate' && "bg-slate-100 dark:bg-slate-800"
        )}>
          <ActionIcon className={cn(
            "w-5 h-5",
            statusColor === 'green' && "text-green-600 dark:text-green-400",
            statusColor === 'red' && "text-red-600 dark:text-red-400",
            statusColor === 'blue' && "text-blue-600 dark:text-blue-400",
            statusColor === 'slate' && "text-slate-600 dark:text-slate-400"
          )} />
        </div>

        {/* Action Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-slate-900 dark:text-slate-100 truncate">
              {action.description}
            </h4>
            
            {/* Status */}
            <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
              {StatusIcon && (
                <StatusIcon className={cn(
                  "w-4 h-4",
                  statusColor === 'green' && "text-green-500",
                  statusColor === 'red' && "text-red-500",
                  statusColor === 'blue' && "text-blue-500"
                )} />
              )}
              
              {isExecuting && (
                <motion.div
                  className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center space-x-4 mt-1 text-sm text-slate-600 dark:text-slate-400">
            <span className="capitalize">{action.type.replace('_', ' ')}</span>
            <span>•</span>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs",
              action.riskLevel === 'low' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
              action.riskLevel === 'medium' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
              action.riskLevel === 'high' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
            )}>
              {action.riskLevel} risk
            </span>
            {action.estimatedTime && (
              <>
                <span>•</span>
                <span>{action.estimatedTime}s</span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Expand/Collapse */}
          <motion.button
            onClick={onToggleExpansion}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.div>
          </motion.button>

          {/* Execute Button */}
          {!result && (
            <motion.button
              onClick={onExecute}
              disabled={!action.validation.isValid || isExecuting}
              className={cn(
                "px-3 py-1 rounded-lg text-sm font-medium transition-colors",
                action.validation.isValid && !isExecuting
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-slate-300 text-slate-600 cursor-not-allowed"
              )}
              whileHover={action.validation.isValid && !isExecuting ? { scale: 1.05 } : {}}
              whileTap={action.validation.isValid && !isExecuting ? { scale: 0.95 } : {}}
            >
              {isExecuting ? 'Executing...' : 'Execute'}
            </motion.button>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700"
          >
            <ActionDetails
              action={action}
              result={result}
              showPreview={showPreview}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ================================================================================================
// ACTION DETAILS COMPONENT
// ================================================================================================

interface ActionDetailsProps {
  action: BusinessAction
  result?: ActionResult
  showPreview: boolean
}

function ActionDetails({ action, result, showPreview }: ActionDetailsProps) {
  const [activeTab, setActiveTab] = useState<'parameters' | 'validation' | 'result'>('parameters')

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex space-x-4 border-b border-slate-200 dark:border-slate-700">
        {[
          { id: 'parameters', label: 'Parameters', icon: Settings },
          { id: 'validation', label: 'Validation', icon: AlertTriangle },
          ...(result ? [{ id: 'result', label: 'Result', icon: CheckCircle }] : [])
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center space-x-2 px-3 py-2 border-b-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            )}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'parameters' && (
          <motion.div
            key="parameters"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-3"
          >
            <h5 className="font-medium text-slate-900 dark:text-slate-100">Action Parameters</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(action.parameters).map(([key, value]) => (
                <div
                  key={key}
                  className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                >
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-slate-900 dark:text-slate-100 mt-1">
                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'validation' && (
          <motion.div
            key="validation"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-3"
          >
            <ValidationView validation={action.validation} />
          </motion.div>
        )}

        {activeTab === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-3"
          >
            <ResultView result={result} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ================================================================================================
// VALIDATION VIEW
// ================================================================================================

function ValidationView({ validation }: { validation: any }) {
  return (
    <div className="space-y-4">
      {/* Overall Status */}
      <div className={cn(
        "flex items-center space-x-3 p-3 rounded-lg",
        validation.isValid 
          ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
          : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
      )}>
        {validation.isValid ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <AlertCircle className="w-5 h-5 text-red-500" />
        )}
        <div>
          <p className={cn(
            "font-medium",
            validation.isValid ? "text-green-900 dark:text-green-100" : "text-red-900 dark:text-red-100"
          )}>
            {validation.isValid ? 'Validation Passed' : 'Validation Failed'}
          </p>
          <p className={cn(
            "text-sm",
            validation.isValid ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
          )}>
            {validation.isValid 
              ? 'This action is ready to execute'
              : 'Please review and fix the issues below'
            }
          </p>
        </div>
      </div>

      {/* Errors */}
      {validation.errors && validation.errors.length > 0 && (
        <div className="space-y-2">
          <h6 className="font-medium text-red-900 dark:text-red-100">Validation Errors</h6>
          {validation.errors.map((error: ValidationError, index: number) => (
            <div
              key={index}
              className="flex items-start space-x-2 p-2 bg-red-50 dark:bg-red-900/20 rounded"
            >
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-700 dark:text-red-300">{error.message}</p>
                {error.suggestion && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Suggestion: {error.suggestion}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Warnings */}
      {validation.warnings && validation.warnings.length > 0 && (
        <div className="space-y-2">
          <h6 className="font-medium text-yellow-900 dark:text-yellow-100">Warnings</h6>
          {validation.warnings.map((warning: ValidationWarning, index: number) => (
            <div
              key={index}
              className="flex items-start space-x-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded"
            >
              <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">{warning.message}</p>
                {warning.recommendation && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    Recommendation: {warning.recommendation}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Missing Data */}
      {validation.missingData && validation.missingData.length > 0 && (
        <div className="space-y-2">
          <h6 className="font-medium text-slate-900 dark:text-slate-100">Missing Data</h6>
          <div className="flex flex-wrap gap-2">
            {validation.missingData.map((field: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-sm"
              >
                {field}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ================================================================================================
// RESULT VIEW
// ================================================================================================

function ResultView({ result }: { result: ActionResult }) {
  return (
    <div className="space-y-4">
      {/* Status */}
      <div className={cn(
        "flex items-center space-x-3 p-3 rounded-lg",
        result.success 
          ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
          : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
      )}>
        {result.success ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <AlertCircle className="w-5 h-5 text-red-500" />
        )}
        <div>
          <p className={cn(
            "font-medium",
            result.success ? "text-green-900 dark:text-green-100" : "text-red-900 dark:text-red-100"
          )}>
            {result.success ? 'Action Completed Successfully' : 'Action Failed'}
          </p>
          <p className={cn(
            "text-sm",
            result.success ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
          )}>
            {result.message}
          </p>
        </div>
      </div>

      {/* Transaction ID */}
      {result.transactionId && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Transaction Created
          </p>
          <p className="text-blue-700 dark:text-blue-300 font-mono text-sm">
            {result.transactionId}
          </p>
        </div>
      )}

      {/* Errors */}
      {result.errors && result.errors.length > 0 && (
        <div className="space-y-2">
          <h6 className="font-medium text-red-900 dark:text-red-100">Errors</h6>
          {result.errors.map((error, index) => (
            <div
              key={index}
              className="p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-700 dark:text-red-300"
            >
              {error}
            </div>
          ))}
        </div>
      )}

      {/* Next Steps */}
      {result.nextSteps && result.nextSteps.length > 0 && (
        <div className="space-y-2">
          <h6 className="font-medium text-slate-900 dark:text-slate-100">Next Steps</h6>
          <div className="space-y-1">
            {result.nextSteps.map((step, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400"
              >
                <ChevronRight className="w-3 h-3" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default BusinessActionExecutor