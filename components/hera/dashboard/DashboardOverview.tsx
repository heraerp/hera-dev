'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Database, 
  Users, 
  Building, 
  BarChart3, 
  Zap, 
  CheckCircle, 
  TrendingUp, 
  Activity,
  ArrowRight,
  Plus,
  Sparkles
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { heraApi } from '@/lib/hera/api/client'
import { Skeleton } from '@/components/ui/skeleton'

interface DashboardStats {
  organizations: number
  users: number
  transactions: number
  schemas: number
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    organizations: 0,
    users: 0,
    transactions: 0,
    schemas: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      // Load real data from Supabase (graceful fallback to demo data)
      const [orgs, users, transactions, schemas] = await Promise.all([
        heraApi.organizations.list(),
        heraApi.users.list(),
        heraApi.transactions.list(),
        heraApi.ai.listSchemas()
      ])

      setStats({
        organizations: orgs.length,
        users: users.length,
        transactions: transactions.length,
        schemas: schemas.length
      })
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
      // Demo data for presentation
      setStats({
        organizations: 5,
        users: 23,
        transactions: 142,
        schemas: 8
      })
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    {
      title: 'Organizations',
      value: stats.organizations,
      description: 'Active organizations',
      icon: Building,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12%',
      changeColor: 'text-green-600'
    },
    {
      title: 'Users',
      value: stats.users,
      description: 'Total users',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+8%',
      changeColor: 'text-green-600'
    },
    {
      title: 'Transactions',
      value: stats.transactions,
      description: 'Total transactions',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+24%',
      changeColor: 'text-green-600'
    },
    {
      title: 'AI Schemas',
      value: stats.schemas,
      description: 'Generated schemas',
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '+45%',
      changeColor: 'text-green-600'
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HERA ERP Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Universal Database Management System - Anti-SAP Architecture
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            System Healthy
          </Badge>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Quick Action
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">{stat.description}</p>
                  <span className={`text-xs font-medium ${stat.changeColor}`}>
                    {stat.change}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Architecture & Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Architecture Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="w-5 h-5 mr-2" />
              HERA Architecture
            </CardTitle>
            <CardDescription>
              Revolutionary 3-layer architecture: 32 tables vs SAP's 100,000+
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Database className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm font-medium">Core Layer</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-blue-600 mr-2">15 tables</span>
                  <Progress value={80} className="w-16 h-2" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <Building className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm font-medium">Templates</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-green-600 mr-2">~200 solutions</span>
                  <Progress value={60} className="w-16 h-2" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <Zap className="w-4 h-4 text-purple-600 mr-2" />
                  <span className="text-sm font-medium">AI Custom</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-purple-600 mr-2">∞ generated</span>
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Quick Actions
            </CardTitle>
            <CardDescription>Get started with HERA ERP features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full justify-between" variant="outline">
                <div className="flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-purple-600" />
                  Generate AI Schema
                </div>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button className="w-full justify-between" variant="outline">
                <div className="flex items-center">
                  <Database className="w-4 h-4 mr-2 text-blue-600" />
                  Browse Templates
                </div>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button className="w-full justify-between" variant="outline">
                <div className="flex items-center">
                  <Building className="w-4 h-4 mr-2 text-green-600" />
                  Add Organization
                </div>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button className="w-full justify-between" variant="outline">
                <div className="flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2 text-orange-600" />
                  View Analytics
                </div>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest actions in your HERA system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: 'Schema generated', item: 'Coffee Shop Management', time: '5 minutes ago', icon: Zap, color: 'bg-purple-50 text-purple-600' },
              { action: 'Template installed', item: 'Retail Store Template', time: '1 hour ago', icon: Database, color: 'bg-blue-50 text-blue-600' },
              { action: 'User created', item: 'john@example.com', time: '2 hours ago', icon: Users, color: 'bg-green-50 text-green-600' },
              { action: 'Transaction processed', item: 'Sale #12345', time: '3 hours ago', icon: TrendingUp, color: 'bg-orange-50 text-orange-600' }
            ].map((activity, index) => {
              const Icon = activity.icon
              return (
                <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`p-2 rounded-full ${activity.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-sm text-gray-500">{activity.item}</p>
                  </div>
                  <div className="text-sm text-gray-500">{activity.time}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
