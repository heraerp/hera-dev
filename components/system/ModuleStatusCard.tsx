'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle, 
  AlertTriangle, 
  Activity, 
  Calendar,
  Eye,
  Settings,
  TrendingUp,
  Users,
  Clock,
  Zap
} from 'lucide-react'

interface ModuleStatusCardProps {
  module: {
    title: string
    module_code: string
    module_name: string
    created_at: string
  }
  metadata: {
    icon: React.ComponentType<any>
    color: string
    category: string
    description: string
    features: string[]
    status?: 'healthy' | 'warning' | 'error'
    usage?: {
      activeUsers: number
      dailyTransactions: number
      lastAccessed: string
    }
    performance?: {
      uptime: number
      responseTime: number
      errorRate: number
    }
  }
  onViewDetails?: (moduleCode: string) => void
  onConfigure?: (moduleCode: string) => void
}

export default function ModuleStatusCard({ 
  module, 
  metadata, 
  onViewDetails, 
  onConfigure 
}: ModuleStatusCardProps) {
  const IconComponent = metadata.icon
  const status = metadata.status || 'healthy'
  
  const getStatusBadge = () => {
    switch (status) {
      case 'healthy':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        )
      case 'warning':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Warning
          </Badge>
        )
      case 'error':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-300">
            <Activity className="w-3 h-3 mr-1" />
            Unknown
          </Badge>
        )
    }
  }

  const getPerformanceColor = (value: number, type: 'uptime' | 'responseTime' | 'errorRate') => {
    switch (type) {
      case 'uptime':
        return value >= 99 ? 'text-green-600' : value >= 95 ? 'text-yellow-600' : 'text-red-600'
      case 'responseTime':
        return value <= 100 ? 'text-green-600' : value <= 500 ? 'text-yellow-600' : 'text-red-600'
      case 'errorRate':
        return value <= 1 ? 'text-green-600' : value <= 5 ? 'text-yellow-600' : 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4" style={{
      borderLeftColor: status === 'healthy' ? '#10b981' : status === 'warning' ? '#f59e0b' : '#ef4444'
    }}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${metadata.color.replace('text-', 'bg-').replace('border-', '').split(' ')[0]}`}>
              <IconComponent className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{module.module_name.replace(' - Deployed', '')}</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                {module.module_code.split('-').slice(0, -2).join('-')}
              </CardDescription>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Category Badge */}
          <div>
            <Badge variant="outline" className={metadata.color}>
              {metadata.category}
            </Badge>
          </div>
          
          {/* Description */}
          <p className="text-sm text-gray-600">{metadata.description}</p>
          
          {/* Usage Statistics */}
          {metadata.usage && (
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Active Users:</span>
                <span className="font-medium flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {metadata.usage.activeUsers}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Daily Transactions:</span>
                <span className="font-medium flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {metadata.usage.dailyTransactions.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Last Accessed:</span>
                <span className="font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {metadata.usage.lastAccessed}
                </span>
              </div>
            </div>
          )}
          
          {/* Performance Metrics */}
          {metadata.performance && (
            <div className="bg-blue-50 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Uptime:</span>
                <span className={`font-medium ${getPerformanceColor(metadata.performance.uptime, 'uptime')}`}>
                  {metadata.performance.uptime.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Response Time:</span>
                <span className={`font-medium ${getPerformanceColor(metadata.performance.responseTime, 'responseTime')}`}>
                  {metadata.performance.responseTime}ms
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Error Rate:</span>
                <span className={`font-medium ${getPerformanceColor(metadata.performance.errorRate, 'errorRate')}`}>
                  {metadata.performance.errorRate.toFixed(2)}%
                </span>
              </div>
            </div>
          )}
          
          {/* Key Features */}
          <div>
            <p className="text-sm font-medium text-gray-900 mb-2">Key Features:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              {metadata.features.slice(0, 3).map((feature, idx) => (
                <li key={idx} className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
              {metadata.features.length > 3 && (
                <li className="text-xs text-gray-500 italic">
                  +{metadata.features.length - 3} more features
                </li>
              )}
            </ul>
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-xs text-gray-500">
              <Calendar className="h-3 w-3 inline mr-1" />
              Deployed: {new Date(module.created_at).toLocaleDateString()}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onViewDetails?.(module.module_code)}
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onConfigure?.(module.module_code)}
              >
                <Settings className="h-3 w-3 mr-1" />
                Configure
              </Button>
            </div>
          </div>
          
          {/* Status Indicator */}
          <div className="flex items-center justify-center">
            <div className={`w-full h-1 rounded-full ${
              status === 'healthy' ? 'bg-green-200' : 
              status === 'warning' ? 'bg-yellow-200' : 
              'bg-red-200'
            }`}>
              <div className={`h-full rounded-full transition-all duration-1000 ${
                status === 'healthy' ? 'bg-green-500 w-full' : 
                status === 'warning' ? 'bg-yellow-500 w-3/4' : 
                'bg-red-500 w-1/2'
              }`} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}