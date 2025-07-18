"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Clock,
  Zap,
  Shield
} from "lucide-react"
import { Card } from "@/components/ui/revolutionary-card"
import { Button } from "@/components/ui/revolutionary-button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { 
  UniversalTransaction, 
  TransactionType, 
  TransactionStatus,
  TransactionPermissions 
} from "@/types/transactions"

interface TransactionCardProps {
  transaction: UniversalTransaction
  permissions: TransactionPermissions
  onView?: (transaction: UniversalTransaction) => void
  onEdit?: (transaction: UniversalTransaction) => void
  onDelete?: (transaction: UniversalTransaction) => void
  onApprove?: (transaction: UniversalTransaction) => void
  onReject?: (transaction: UniversalTransaction) => void
  className?: string
  variant?: "default" | "compact" | "detailed"
}

export function TransactionCard({
  transaction,
  permissions,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  className,
  variant = "default"
}: TransactionCardProps) {
  
  // Get transaction type display info
  const getTypeInfo = (type: TransactionType) => {
    const typeMap = {
      journal_entry: { 
        icon: "📝", 
        label: "Journal Entry", 
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" 
      },
      sales: { 
        icon: "💰", 
        label: "Sales", 
        color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
      },
      purchase: { 
        icon: "🛒", 
        label: "Purchase", 
        color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" 
      },
      payment: { 
        icon: "💳", 
        label: "Payment", 
        color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" 
      },
      master_data: { 
        icon: "🗂️", 
        label: "Master Data", 
        color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" 
      },
      inventory: { 
        icon: "📦", 
        label: "Inventory", 
        color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" 
      },
      payroll: { 
        icon: "👥", 
        label: "Payroll", 
        color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200" 
      },
      reconciliation: { 
        icon: "🔄", 
        label: "Reconciliation", 
        color: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200" 
      }
    }
    return typeMap[type] || typeMap.journal_entry
  }

  // Get status display info
  const getStatusInfo = (status: TransactionStatus) => {
    const statusMap = {
      DRAFT: { 
        icon: <Edit className="w-3 h-3" />, 
        label: "Draft", 
        color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" 
      },
      PENDING: { 
        icon: <Clock className="w-3 h-3" />, 
        label: "Pending", 
        color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" 
      },
      APPROVED: { 
        icon: <CheckCircle className="w-3 h-3" />, 
        label: "Approved", 
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" 
      },
      POSTED: { 
        icon: <CheckCircle className="w-3 h-3" />, 
        label: "Posted", 
        color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
      },
      REJECTED: { 
        icon: <XCircle className="w-3 h-3" />, 
        label: "Rejected", 
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" 
      },
      CANCELLED: { 
        icon: <XCircle className="w-3 h-3" />, 
        label: "Cancelled", 
        color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" 
      }
    }
    return statusMap[status] || statusMap.DRAFT
  }

  // Calculate risk level
  const getRiskLevel = () => {
    const riskScore = transaction.fraud_risk_score || 0
    if (riskScore > 0.7) return { level: "HIGH", color: "text-red-600", icon: <AlertTriangle className="w-4 h-4" /> }
    if (riskScore > 0.4) return { level: "MEDIUM", color: "text-yellow-600", icon: <AlertTriangle className="w-4 h-4" /> }
    if (riskScore > 0.1) return { level: "LOW", color: "text-green-600", icon: <Shield className="w-4 h-4" /> }
    return null
  }

  // Format amount
  const formatAmount = (amount: any) => {
    if (!amount) return null
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(numericAmount)) return amount.toString()
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numericAmount)
  }

  const typeInfo = getTypeInfo(transaction.transaction_type)
  const statusInfo = getStatusInfo(transaction.workflow_status || 'DRAFT')
  const riskInfo = getRiskLevel()

  const canEdit = permissions.can_edit && (transaction.workflow_status === 'DRAFT' || transaction.workflow_status === 'PENDING')
  const canApprove = permissions.can_approve && transaction.workflow_status === 'PENDING'
  const canDelete = permissions.can_delete && (transaction.workflow_status === 'DRAFT' || transaction.workflow_status === 'CANCELLED')

  if (variant === "compact") {
    return (
      <Card className={`p-3 hover:shadow-md transition-all duration-200 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">{typeInfo.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{transaction.transaction_number}</span>
                <Badge variant="secondary" className={`text-xs ${statusInfo.color}`}>
                  {statusInfo.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(transaction.business_date).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {transaction.ai_generated && (
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                <Zap className="w-3 h-3 mr-1" />
                AI
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={() => onView?.(transaction)}>
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className={`p-4 hover:shadow-lg transition-all duration-200 ${className}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{typeInfo.icon}</div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-base">{transaction.transaction_number}</h3>
                <Badge variant="secondary" className={statusInfo.color}>
                  <span className="flex items-center gap-1">
                    {statusInfo.icon}
                    {statusInfo.label}
                  </span>
                </Badge>
                <Badge variant="secondary" className={typeInfo.color}>
                  {typeInfo.label}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-1">
                {transaction.transaction_data?.description || 
                 transaction.transaction_data?.reference ||
                 `${typeInfo.label} Transaction`}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(transaction)}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              
              {canEdit && (
                <DropdownMenuItem onClick={() => onEdit?.(transaction)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              
              {canApprove && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onApprove?.(transaction)}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onReject?.(transaction)}>
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </DropdownMenuItem>
                </>
              )}
              
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(transaction)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Transaction Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Business Date</p>
            <p className="font-medium">{new Date(transaction.business_date).toLocaleDateString()}</p>
          </div>
          
          {transaction.transaction_data?.amount && (
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide">Amount</p>
              <p className="font-medium">{formatAmount(transaction.transaction_data.amount)}</p>
            </div>
          )}
          
          {transaction.department && (
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide">Department</p>
              <p className="font-medium">{transaction.department}</p>
            </div>
          )}
          
          {transaction.created_by && (
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide">Created By</p>
              <p className="font-medium">{transaction.created_by}</p>
            </div>
          )}
        </div>

        {/* AI and Risk Indicators */}
        {(transaction.ai_generated || riskInfo) && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
            {transaction.ai_generated && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                <Zap className="w-3 h-3 mr-1" />
                AI Generated
                {transaction.ai_confidence_score && (
                  <span className="ml-1">
                    ({(transaction.ai_confidence_score * 100).toFixed(0)}%)
                  </span>
                )}
              </Badge>
            )}
            
            {riskInfo && (
              <Badge variant="outline" className={`${riskInfo.color} border-current`}>
                {riskInfo.icon}
                <span className="ml-1">{riskInfo.level} Risk</span>
              </Badge>
            )}
            
            {transaction.data_quality_score && transaction.data_quality_score < 90 && (
              <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Quality: {transaction.data_quality_score}%
              </Badge>
            )}
          </div>
        )}

        {/* Tags */}
        {transaction.tags && transaction.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {transaction.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {transaction.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{transaction.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  )
}