'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle,
  Brain
} from 'lucide-react'

interface ConfidenceIndicatorProps {
  confidence: number
  showPercentage?: boolean
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'badge' | 'progress' | 'detailed'
  className?: string
}

export default function ConfidenceIndicator({
  confidence,
  showPercentage = true,
  showIcon = true,
  size = 'md',
  variant = 'badge',
  className = ''
}: ConfidenceIndicatorProps) {
  
  const percentage = Math.round(confidence * 100)
  
  const getConfidenceLevel = () => {
    if (confidence >= 0.95) return 'high'
    if (confidence >= 0.80) return 'medium'
    return 'low'
  }

  const getConfidenceColor = () => {
    const level = getConfidenceLevel()
    switch (level) {
      case 'high':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-300',
          icon: CheckCircle,
          progressClass: 'bg-green-500'
        }
      case 'medium':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-300',
          icon: AlertTriangle,
          progressClass: 'bg-yellow-500'
        }
      case 'low':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-300',
          icon: AlertCircle,
          progressClass: 'bg-red-500'
        }
    }
  }

  const colors = getConfidenceColor()
  const Icon = colors.icon

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          badge: 'text-xs px-2 py-1',
          icon: 'h-3 w-3',
          progress: 'h-1'
        }
      case 'lg':
        return {
          badge: 'text-base px-3 py-2',
          icon: 'h-5 w-5',
          progress: 'h-3'
        }
      default:
        return {
          badge: 'text-sm px-2 py-1',
          icon: 'h-4 w-4',
          progress: 'h-2'
        }
    }
  }

  const sizeClasses = getSizeClasses()

  if (variant === 'badge') {
    return (
      <Badge 
        className={`
          ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses.badge} 
          flex items-center gap-1 ${className}
        `}
      >
        {showIcon && <Icon className={`${sizeClasses.icon} mr-1`} />}
        {showPercentage && `${percentage}%`}
        {!showPercentage && getConfidenceLevel().charAt(0).toUpperCase() + getConfidenceLevel().slice(1)}
      </Badge>
    )
  }

  if (variant === 'progress') {
    return (
      <div className={`space-y-1 ${className}`}>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-gray-600">
            <Brain className={sizeClasses.icon} />
            AI Confidence
          </span>
          <span className={`font-medium ${colors.text}`}>
            {percentage}%
          </span>
        </div>
        <div className="relative">
          <Progress value={percentage} className={`${sizeClasses.progress} bg-gray-200`} />
          <div 
            className={`absolute top-0 left-0 ${sizeClasses.progress} ${colors.progressClass} rounded-full transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">AI Confidence Score</span>
          <Badge className={`${colors.bg} ${colors.text} ${colors.border}`}>
            <Icon className="h-3 w-3 mr-1" />
            {percentage}%
          </Badge>
        </div>
        
        <div className="relative">
          <Progress value={percentage} className="h-2 bg-gray-200" />
          <div 
            className={`absolute top-0 left-0 h-2 ${colors.progressClass} rounded-full transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <div className="text-xs text-gray-500">
          {getConfidenceLevel() === 'high' && 'High confidence - ready for automatic processing'}
          {getConfidenceLevel() === 'medium' && 'Medium confidence - review recommended'}
          {getConfidenceLevel() === 'low' && 'Low confidence - manual review required'}
        </div>
      </div>
    )
  }

  return null
}