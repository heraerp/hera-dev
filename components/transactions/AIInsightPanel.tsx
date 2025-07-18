"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Brain,
  Zap,
  AlertTriangle,
  Shield,
  BarChart3,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Eye,
  Lightbulb,
  Target,
  Activity,
  Sparkles,
  Info,
  ChevronRight,
  RefreshCw
} from "lucide-react"
import { Card } from "@/components/ui/revolutionary-card"
import { Button } from "@/components/ui/revolutionary-button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { HeraTransactionService } from "@/services/heraTransactions"
import type { 
  UniversalTransaction, 
  AIAnalysisResult,
  AIFactor 
} from "@/types/transactions"
import motionConfig from "@/lib/motion"

interface AIInsightPanelProps {
  transaction?: UniversalTransaction
  organizationId?: string
  className?: string
  variant?: "default" | "compact" | "detailed"
}

interface InsightCardProps {
  title: string
  value: string | number
  confidence?: number
  status: "positive" | "negative" | "neutral" | "warning"
  icon: React.ReactNode
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

function InsightCard({ 
  title, 
  value, 
  confidence, 
  status, 
  icon, 
  description, 
  action 
}: InsightCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case "positive": return "text-green-600 bg-green-50 border-green-200"
      case "negative": return "text-red-600 bg-red-50 border-red-200"
      case "warning": return "text-yellow-600 bg-yellow-50 border-yellow-200"
      default: return "text-blue-600 bg-blue-50 border-blue-200"
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={motionConfig.spring.gentle}
    >
      <Card className={`p-4 border ${getStatusColor()}`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {icon}
            <h4 className="font-medium text-sm">{title}</h4>
          </div>
          {confidence !== undefined && (
            <Badge variant="outline" className="text-xs">
              {(confidence * 100).toFixed(0)}%
            </Badge>
          )}
        </div>
        
        <p className="text-lg font-semibold mb-1">{value}</p>
        
        {description && (
          <p className="text-xs text-muted-foreground mb-3">{description}</p>
        )}
        
        {action && (
          <Button variant="ghost" size="sm" onClick={action.onClick} className="h-6 px-2 text-xs">
            {action.label}
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        )}
      </Card>
    </motion.div>
  )
}

export function AIInsightPanel({ 
  transaction, 
  organizationId, 
  className, 
  variant = "default" 
}: AIInsightPanelProps) {
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>(["overview"])

  // Fetch AI analysis for specific transaction
  useEffect(() => {
    if (transaction?.id && organizationId) {
      fetchAIAnalysis()
    }
  }, [transaction?.id, organizationId])

  const fetchAIAnalysis = async () => {
    if (!transaction?.id || !organizationId) return

    try {
      setLoading(true)
      const analysis = await HeraTransactionService.getAIAnalysis(transaction.id, organizationId)
      setAiAnalysis(analysis)
    } catch (error) {
      console.error("Error fetching AI analysis:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  if (variant === "compact") {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-600" />
            <h3 className="font-semibold text-sm">AI Insights</h3>
          </div>
          {loading && <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />}
        </div>

        {transaction?.ai_generated && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">AI Confidence</span>
              <span className="font-medium">
                {((transaction.ai_confidence_score || 0) * 100).toFixed(0)}%
              </span>
            </div>
            <Progress value={(transaction.ai_confidence_score || 0) * 100} className="h-1" />
            
            {transaction.fraud_risk_score && transaction.fraud_risk_score > 0.3 && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Risk: {(transaction.fraud_risk_score * 100).toFixed(0)}%
              </Badge>
            )}
          </div>
        )}

        {!transaction?.ai_generated && (
          <p className="text-xs text-muted-foreground">
            No AI analysis available for this transaction.
          </p>
        )}
      </Card>
    )
  }

  if (!transaction) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <Brain className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
        <h3 className="font-semibold mb-2">AI Insights</h3>
        <p className="text-sm text-muted-foreground">
          Select a transaction to view AI analysis and insights.
        </p>
      </Card>
    )
  }

  return (
    <Card className={`${className}`}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold">AI Insights</h3>
            {transaction.ai_generated && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                <Zap className="w-3 h-3 mr-1" />
                AI Generated
              </Badge>
            )}
          </div>
          
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : (
            <Button variant="ghost" size="sm" onClick={fetchAIAnalysis}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Overview Section */}
        <Collapsible 
          open={expandedSections.includes("overview")} 
          onOpenChange={() => toggleSection("overview")}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="font-medium text-sm">Analysis Overview</span>
            </div>
            <ChevronRight className={`w-4 h-4 transition-transform ${
              expandedSections.includes("overview") ? "rotate-90" : ""
            }`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="pt-3">
            <div className="grid grid-cols-1 gap-3">
              {/* Confidence Score */}
              {transaction.ai_confidence_score !== undefined && (
                <InsightCard
                  title="AI Confidence"
                  value={`${(transaction.ai_confidence_score * 100).toFixed(1)}%`}
                  status={transaction.ai_confidence_score > 0.8 ? "positive" : transaction.ai_confidence_score > 0.5 ? "neutral" : "warning"}
                  icon={<Target className="w-4 h-4" />}
                  description="Confidence in AI classification and processing"
                />
              )}

              {/* Data Quality */}
              {transaction.data_quality_score !== undefined && (
                <InsightCard
                  title="Data Quality"
                  value={`${transaction.data_quality_score.toFixed(1)}%`}
                  status={transaction.data_quality_score > 90 ? "positive" : transaction.data_quality_score > 70 ? "neutral" : "warning"}
                  icon={<BarChart3 className="w-4 h-4" />}
                  description="Overall data completeness and accuracy"
                />
              )}

              {/* Processing Status */}
              <InsightCard
                title="Processing Status"
                value={transaction.workflow_status || "Unknown"}
                status={
                  transaction.workflow_status === "POSTED" ? "positive" :
                  transaction.workflow_status === "REJECTED" ? "negative" :
                  "neutral"
                }
                icon={
                  transaction.workflow_status === "POSTED" ? <CheckCircle className="w-4 h-4" /> :
                  transaction.workflow_status === "REJECTED" ? <XCircle className="w-4 h-4" /> :
                  <Activity className="w-4 h-4" />
                }
                description="Current transaction workflow status"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Fraud Detection Section */}
        <Collapsible 
          open={expandedSections.includes("fraud")} 
          onOpenChange={() => toggleSection("fraud")}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="font-medium text-sm">Fraud Detection</span>
              {transaction.fraud_risk_score && transaction.fraud_risk_score > 0.5 && (
                <Badge variant="destructive" className="text-xs">
                  Alert
                </Badge>
              )}
            </div>
            <ChevronRight className={`w-4 h-4 transition-transform ${
              expandedSections.includes("fraud") ? "rotate-90" : ""
            }`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="pt-3">
            <div className="space-y-3">
              {/* Risk Score */}
              <InsightCard
                title="Fraud Risk Score"
                value={transaction.fraud_risk_score ? `${(transaction.fraud_risk_score * 100).toFixed(1)}%` : "0%"}
                status={
                  (transaction.fraud_risk_score || 0) > 0.7 ? "negative" :
                  (transaction.fraud_risk_score || 0) > 0.3 ? "warning" :
                  "positive"
                }
                icon={<Shield className="w-4 h-4" />}
                description="Probability of fraudulent activity"
              />

              {/* Validation Status */}
              <InsightCard
                title="Validation Status"
                value={transaction.fraud_validation_status || "Not Reviewed"}
                status={
                  transaction.fraud_validation_status === "CLEAN" ? "positive" :
                  transaction.fraud_validation_status === "FLAGGED" ? "negative" :
                  "neutral"
                }
                icon={
                  transaction.fraud_validation_status === "CLEAN" ? <CheckCircle className="w-4 h-4" /> :
                  transaction.fraud_validation_status === "FLAGGED" ? <AlertTriangle className="w-4 h-4" /> :
                  <Eye className="w-4 h-4" />
                }
                description="Manual fraud validation result"
              />

              {/* Risk Indicators */}
              {aiAnalysis?.fraud_assessment.indicators && aiAnalysis.fraud_assessment.indicators.length > 0 && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h5 className="font-medium text-xs mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Risk Indicators
                  </h5>
                  <div className="space-y-1">
                    {aiAnalysis.fraud_assessment.indicators.slice(0, 3).map((indicator, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <div className="w-1 h-1 bg-yellow-500 rounded-full" />
                        <span>{indicator}</span>
                      </div>
                    ))}
                    {aiAnalysis.fraud_assessment.indicators.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{aiAnalysis.fraud_assessment.indicators.length - 3} more indicators
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* AI Explainability Section */}
        {aiAnalysis?.explainability && (
          <Collapsible 
            open={expandedSections.includes("explainability")} 
            onOpenChange={() => toggleSection("explainability")}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                <span className="font-medium text-sm">AI Reasoning</span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${
                expandedSections.includes("explainability") ? "rotate-90" : ""
              }`} />
            </CollapsibleTrigger>
            
            <CollapsibleContent className="pt-3">
              <div className="space-y-3">
                {/* AI Reasoning */}
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-blue-600" />
                    <h5 className="font-medium text-sm">AI Analysis</h5>
                  </div>
                  <p className="text-xs text-blue-800">
                    {aiAnalysis.explainability.reasoning}
                  </p>
                </div>

                {/* Key Factors */}
                {aiAnalysis.explainability.factors && aiAnalysis.explainability.factors.length > 0 && (
                  <div>
                    <h5 className="font-medium text-xs mb-2">Key Factors</h5>
                    <div className="space-y-2">
                      {aiAnalysis.explainability.factors.slice(0, 3).map((factor: AIFactor, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <span className="flex-1">{factor.factor}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={Math.abs(factor.impact) * 100} className="w-16 h-1" />
                            <span className={`font-medium ${factor.impact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {factor.impact > 0 ? '+' : ''}{(factor.impact * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        <Separator />

        {/* Data Quality Issues */}
        {aiAnalysis?.data_quality.issues && aiAnalysis.data_quality.issues.length > 0 && (
          <Collapsible 
            open={expandedSections.includes("quality")} 
            onOpenChange={() => toggleSection("quality")}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                <span className="font-medium text-sm">Data Quality</span>
                <Badge variant="outline" className="text-xs">
                  {aiAnalysis.data_quality.issues.length} issues
                </Badge>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${
                expandedSections.includes("quality") ? "rotate-90" : ""
              }`} />
            </CollapsibleTrigger>
            
            <CollapsibleContent className="pt-3">
              <div className="space-y-2">
                {aiAnalysis.data_quality.issues.slice(0, 3).map((issue, index) => (
                  <div key={index} className="p-2 bg-yellow-50 rounded border border-yellow-200">
                    <div className="flex items-center gap-2 text-xs">
                      <AlertTriangle className="w-3 h-3 text-yellow-600" />
                      <span>{issue}</span>
                    </div>
                  </div>
                ))}
                
                {aiAnalysis.data_quality.suggestions && aiAnalysis.data_quality.suggestions.length > 0 && (
                  <div className="mt-3">
                    <h6 className="font-medium text-xs mb-1">Suggestions</h6>
                    <div className="space-y-1">
                      {aiAnalysis.data_quality.suggestions.slice(0, 2).map((suggestion, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs text-green-700">
                          <Sparkles className="w-3 h-3" />
                          <span>{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* No AI Data Available */}
        {!transaction.ai_generated && !aiAnalysis && (
          <div className="text-center py-6">
            <Brain className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
            <h4 className="font-medium mb-1">No AI Analysis Available</h4>
            <p className="text-xs text-muted-foreground mb-3">
              This transaction was not processed by AI systems.
            </p>
            <Button variant="outline" size="sm">
              Request AI Analysis
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}