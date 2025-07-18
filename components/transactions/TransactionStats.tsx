"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Zap,
  DollarSign,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react"
import { Card } from "@/components/ui/revolutionary-card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { TransactionStats } from "@/types/transactions"
import motionConfig from "@/lib/motion"

interface TransactionStatsProps {
  stats: TransactionStats
  loading?: boolean
  className?: string
  variant?: "default" | "compact" | "detailed"
}

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  color: string
  description?: string
  trend?: "up" | "down" | "neutral"
  className?: string
}

function StatCard({ 
  title, 
  value, 
  change, 
  icon, 
  color, 
  description, 
  trend,
  className 
}: StatCardProps) {
  const getTrendIcon = () => {
    if (!change) return null
    if (trend === "up") return <TrendingUp className="w-3 h-3 text-green-600" />
    if (trend === "down") return <TrendingDown className="w-3 h-3 text-red-600" />
    return <Activity className="w-3 h-3 text-gray-600" />
  }

  const getTrendColor = () => {
    if (!change) return "text-muted-foreground"
    if (trend === "up") return "text-green-600"
    if (trend === "down") return "text-red-600"
    return "text-gray-600"
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={motionConfig.spring.gentle}
    >
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color}`}>
            {icon}
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-xs ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

export function TransactionStats({ stats, loading, className, variant = "default" }: TransactionStatsProps) {
  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${className}`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="space-y-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-20"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (variant === "compact") {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 ${className}`}>
        <StatCard
          title="Total"
          value={stats.total_transactions}
          icon={<BarChart3 className="w-4 h-4 text-blue-600" />}
          color="bg-blue-100"
        />
        <StatCard
          title="Pending"
          value={stats.pending_transactions}
          icon={<Clock className="w-4 h-4 text-yellow-600" />}
          color="bg-yellow-100"
        />
        <StatCard
          title="Posted"
          value={stats.posted_transactions}
          icon={<CheckCircle className="w-4 h-4 text-green-600" />}
          color="bg-green-100"
        />
        <StatCard
          title="AI %"
          value={`${stats.ai_generated_percentage.toFixed(1)}%`}
          icon={<Zap className="w-4 h-4 text-purple-600" />}
          color="bg-purple-100"
        />
      </div>
    )
  }

  // Calculate approval rate
  const approvalRate = stats.total_transactions > 0 
    ? ((stats.approved_transactions + stats.posted_transactions) / stats.total_transactions) * 100
    : 0

  // Calculate processing efficiency
  const processingEfficiency = stats.total_transactions > 0
    ? ((stats.posted_transactions) / stats.total_transactions) * 100
    : 0

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Transactions"
          value={stats.total_transactions}
          icon={<BarChart3 className="w-4 h-4 text-blue-600" />}
          color="bg-blue-100"
          description="All transaction types"
        />
        
        <StatCard
          title="Pending Approval"
          value={stats.pending_transactions}
          icon={<Clock className="w-4 h-4 text-yellow-600" />}
          color="bg-yellow-100"
          description="Awaiting review"
        />
        
        <StatCard
          title="Successfully Posted"
          value={stats.posted_transactions}
          icon={<CheckCircle className="w-4 h-4 text-green-600" />}
          color="bg-green-100"
          description="Completed transactions"
        />
        
        <StatCard
          title="Total Value"
          value={new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact',
            maximumFractionDigits: 1
          }).format(stats.total_amount)}
          icon={<DollarSign className="w-4 h-4 text-green-600" />}
          color="bg-green-100"
          description="Transaction volume"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="AI Generated"
          value={`${stats.ai_generated_percentage.toFixed(1)}%`}
          icon={<Zap className="w-4 h-4 text-purple-600" />}
          color="bg-purple-100"
          description="Automated processing"
        />
        
        <StatCard
          title="Fraud Flagged"
          value={stats.fraud_flagged_count}
          icon={<AlertTriangle className="w-4 h-4 text-red-600" />}
          color="bg-red-100"
          description="Risk detected"
        />
        
        <StatCard
          title="Data Quality"
          value={`${stats.data_quality_average.toFixed(1)}%`}
          icon={<Activity className="w-4 h-4 text-blue-600" />}
          color="bg-blue-100"
          description="Average score"
        />
      </div>

      {/* Status Breakdown */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <PieChart className="w-4 h-4" />
          Transaction Status Distribution
        </h3>
        
        <div className="space-y-3">
          {stats.by_status.map((statusData) => {
            const getStatusIcon = (status: string) => {
              switch (status) {
                case 'PENDING': return <Clock className="w-4 h-4 text-yellow-600" />
                case 'APPROVED': return <CheckCircle className="w-4 h-4 text-blue-600" />
                case 'POSTED': return <CheckCircle className="w-4 h-4 text-green-600" />
                case 'REJECTED': return <XCircle className="w-4 h-4 text-red-600" />
                case 'CANCELLED': return <XCircle className="w-4 h-4 text-gray-600" />
                default: return <RefreshCw className="w-4 h-4 text-gray-600" />
              }
            }

            const getStatusColor = (status: string) => {
              switch (status) {
                case 'PENDING': return 'bg-yellow-500'
                case 'APPROVED': return 'bg-blue-500'
                case 'POSTED': return 'bg-green-500'
                case 'REJECTED': return 'bg-red-500'
                case 'CANCELLED': return 'bg-gray-500'
                default: return 'bg-gray-400'
              }
            }

            return (
              <div key={statusData.status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(statusData.status)}
                  <span className="text-sm font-medium capitalize">
                    {statusData.status.toLowerCase().replace('_', ' ')}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 min-w-0 flex-1 ml-4">
                  <div className="flex-1">
                    <Progress 
                      value={statusData.percentage} 
                      className="h-2"
                      // Custom progress bar color based on status
                      style={{
                        '--progress-background': getStatusColor(statusData.status)
                      } as React.CSSProperties}
                    />
                  </div>
                  
                  <div className="text-right min-w-[60px]">
                    <span className="text-sm font-semibold">{statusData.count}</span>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({statusData.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Transaction Types */}
      {stats.by_type.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Transaction Types
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.by_type.map((typeData) => {
              const getTypeIcon = (type: string) => {
                const icons: Record<string, string> = {
                  journal_entry: "📝",
                  sales: "💰",
                  purchase: "🛒",
                  payment: "💳",
                  master_data: "🗂️",
                  inventory: "📦",
                  payroll: "👥",
                  reconciliation: "🔄"
                }
                return icons[type] || "📄"
              }

              return (
                <div key={typeData.type} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getTypeIcon(typeData.type)}</span>
                    <div>
                      <p className="text-sm font-medium capitalize">
                        {typeData.type.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {typeData.count} transactions
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        notation: 'compact'
                      }).format(typeData.amount)}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {typeData.percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h4 className="font-semibold mb-3">Processing Efficiency</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completion Rate</span>
              <span className="font-medium">{processingEfficiency.toFixed(1)}%</span>
            </div>
            <Progress value={processingEfficiency} className="h-2" />
          </div>
          
          {stats.average_processing_time > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex justify-between text-sm">
                <span>Avg Processing Time</span>
                <span className="font-medium">{stats.average_processing_time}h</span>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-4">
          <h4 className="font-semibold mb-3">Approval Metrics</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Approval Rate</span>
              <span className="font-medium">{approvalRate.toFixed(1)}%</span>
            </div>
            <Progress value={approvalRate} className="h-2" />
          </div>
          
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Rejected</span>
              <span>{stats.rejected_transactions}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Trends */}
      {stats.trends.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Trends
          </h3>
          
          <div className="space-y-3">
            {stats.trends.slice(0, 5).map((trend, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{trend.period}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{trend.transaction_count}</span>
                  {trend.growth_rate !== 0 && (
                    <Badge 
                      variant={trend.growth_rate > 0 ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {trend.growth_rate > 0 ? "+" : ""}{trend.growth_rate.toFixed(1)}%
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}