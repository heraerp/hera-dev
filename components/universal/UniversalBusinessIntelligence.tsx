'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  Layers, 
  GitBranch,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Activity,
  Zap,
  RefreshCw,
  Eye,
  Target
} from 'lucide-react';

interface UniversalBusinessIntelligenceProps {
  organizationId: string;
}

interface UniversalEntity {
  entity_type: string;
  count: number;
  growth_rate: number;
  health_score: number;
  last_updated: string;
}

interface UniversalTransaction {
  transaction_type: string;
  daily_volume: number;
  success_rate: number;
  avg_processing_time: number;
  trend: 'up' | 'down' | 'stable';
}

interface SchemaCompliance {
  total_tables_used: number;
  new_tables_created: number;
  universal_pattern_compliance: number;
  naming_convention_score: number;
  organization_isolation_score: number;
}

export function UniversalBusinessIntelligence({ organizationId }: UniversalBusinessIntelligenceProps) {
  const [entities, setEntities] = useState<UniversalEntity[]>([
    {
      entity_type: 'menu_item',
      count: 847,
      growth_rate: 12.5,
      health_score: 94.2,
      last_updated: '2 minutes ago'
    },
    {
      entity_type: 'customer',
      count: 2103,
      growth_rate: 18.7,
      health_score: 97.1,
      last_updated: '1 minute ago'
    },
    {
      entity_type: 'order',
      count: 15624,
      growth_rate: 23.4,
      health_score: 91.8,
      last_updated: '30 seconds ago'
    },
    {
      entity_type: 'employee',
      count: 156,
      growth_rate: 5.2,
      health_score: 98.5,
      last_updated: '45 seconds ago'
    },
    {
      entity_type: 'supplier',
      count: 89,
      growth_rate: 8.1,
      health_score: 95.7,
      last_updated: '1 minute ago'
    },
    {
      entity_type: 'workflow_instance',
      count: 342,
      growth_rate: 31.2,
      health_score: 89.3,
      last_updated: '15 seconds ago'
    }
  ]);

  const [transactions, setTransactions] = useState<UniversalTransaction[]>([
    {
      transaction_type: 'order_creation',
      daily_volume: 387,
      success_rate: 98.7,
      avg_processing_time: 145,
      trend: 'up'
    },
    {
      transaction_type: 'payment_processing',
      daily_volume: 351,
      success_rate: 99.2,
      avg_processing_time: 89,
      trend: 'stable'
    },
    {
      transaction_type: 'inventory_update',
      daily_volume: 1247,
      success_rate: 97.1,
      avg_processing_time: 67,
      trend: 'up'
    },
    {
      transaction_type: 'workflow_execution',
      daily_volume: 234,
      success_rate: 94.8,
      avg_processing_time: 234,
      trend: 'down'
    }
  ]);

  const [compliance, setCompliance] = useState<SchemaCompliance>({
    total_tables_used: 6,
    new_tables_created: 0,
    universal_pattern_compliance: 100,
    naming_convention_score: 98.5,
    organization_isolation_score: 100
  });

  const [loading, setLoading] = useState(false);

  const refreshUniversalData = async () => {
    setLoading(true);
    try {
      // Simulate HERA Universal CRUD operations
      // In real implementation, this would use UniversalCrudService
      
      // Mock real-time updates to demonstrate universal schema power
      setEntities(prev => prev.map(entity => ({
        ...entity,
        count: entity.count + Math.floor(Math.random() * 5),
        growth_rate: Math.max(0, entity.growth_rate + (Math.random() - 0.5) * 2),
        health_score: Math.min(100, Math.max(80, entity.health_score + (Math.random() - 0.5) * 1)),
        last_updated: 'Just now'
      })));

      setTransactions(prev => prev.map(transaction => ({
        ...transaction,
        daily_volume: transaction.daily_volume + Math.floor(Math.random() * 10),
        success_rate: Math.min(100, Math.max(90, transaction.success_rate + (Math.random() - 0.5) * 0.5)),
        avg_processing_time: Math.max(50, transaction.avg_processing_time + (Math.random() - 0.5) * 10)
      })));

      console.log('Universal data refreshed using HERA patterns');
    } catch (error) {
      console.error('Error refreshing universal data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-500 transform rotate-180" />;
      case 'stable': return <Activity className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 90) return 'text-blue-600';
    if (score >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* HERA Schema Compliance Dashboard */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
            HERA Universal Schema Compliance
            <Badge className="ml-2 bg-green-100 text-green-800">100% Compliant</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{compliance.total_tables_used}</div>
              <div className="text-sm text-gray-600">Core Tables Used</div>
              <div className="text-xs text-green-600 font-medium">Perfect Universal Schema</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{compliance.new_tables_created}</div>
              <div className="text-sm text-gray-600">New Tables Created</div>
              <div className="text-xs text-green-600 font-medium">Zero Table Creation</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{compliance.universal_pattern_compliance}%</div>
              <div className="text-sm text-gray-600">Pattern Compliance</div>
              <Progress value={compliance.universal_pattern_compliance} className="mt-1 h-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{compliance.naming_convention_score}%</div>
              <div className="text-sm text-gray-600">Naming Convention</div>
              <Progress value={compliance.naming_convention_score} className="mt-1 h-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{compliance.organization_isolation_score}%</div>
              <div className="text-sm text-gray-600">Org Isolation</div>
              <Progress value={compliance.organization_isolation_score} className="mt-1 h-2" />
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center">
              <Database className="w-4 h-4 mr-2 text-blue-500" />
              Universal Schema Architecture in Action
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium text-green-700">✅ Entity Pattern</div>
                <div className="text-gray-600">All business objects in core_entities</div>
              </div>
              <div>
                <div className="font-medium text-blue-700">✅ Metadata Pattern</div>
                <div className="text-gray-600">Rich context in core_metadata</div>
              </div>
              <div>
                <div className="font-medium text-purple-700">✅ Transaction Pattern</div>
                <div className="text-gray-600">All operations in universal_transactions</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Universal Entity Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Layers className="w-5 h-5 mr-2 text-blue-500" />
                Universal Entity Analytics
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshUniversalData}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {entities.map((entity) => (
                <div key={entity.entity_type} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="font-medium">{entity.entity_type.replace('_', ' ')}</span>
                    </div>
                    <Badge variant="outline">{entity.count.toLocaleString()} entities</Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <div className="text-gray-600">Growth Rate</div>
                      <div className="font-medium text-green-600">+{entity.growth_rate.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Health Score</div>
                      <div className={`font-medium ${getHealthColor(entity.health_score)}`}>
                        {entity.health_score.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Last Updated</div>
                      <div className="font-medium text-gray-800 dark:text-gray-200">{entity.last_updated}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <GitBranch className="w-5 h-5 mr-2 text-purple-500" />
              Universal Transaction Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.transaction_type} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {getTrendIcon(transaction.trend)}
                      <span className="font-medium">{transaction.transaction_type.replace('_', ' ')}</span>
                    </div>
                    <Badge variant="outline">{transaction.daily_volume} today</Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <div className="text-gray-600">Success Rate</div>
                      <div className="font-medium text-green-600">{transaction.success_rate.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Avg Time</div>
                      <div className="font-medium text-blue-600">{transaction.avg_processing_time}ms</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Trend</div>
                      <div className={`font-medium capitalize ${
                        transaction.trend === 'up' ? 'text-green-600' : 
                        transaction.trend === 'down' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {transaction.trend}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* HERA Architecture Benefits */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-purple-500" />
            HERA Universal Schema Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
                <Database className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold">Infinite Flexibility</h4>
              <p className="text-sm text-gray-600">Add any business object without schema changes</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold">Lightning Development</h4>
              <p className="text-sm text-gray-600">30 minutes to working prototype</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold">Perfect Multi-tenancy</h4>
              <p className="text-sm text-gray-600">Organization-first architecture</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold">AI-Native Design</h4>
              <p className="text-sm text-gray-600">Intelligence embedded throughout</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
                🚀 {entities.reduce((sum, e) => sum + e.count, 0).toLocaleString()} Total Entities
              </div>
              <div className="text-sm text-gray-600">
                Managed through just 6 universal tables • Zero schema changes • Infinite business flexibility
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Organization Data */}
      <div className="text-center text-xs text-gray-500">
        Organization: {organizationId} | Real-time updates every 5 seconds | 
        All data flows through HERA Universal Schema
      </div>
    </div>
  );
}