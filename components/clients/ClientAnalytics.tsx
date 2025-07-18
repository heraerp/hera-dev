'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Building2,
  Calendar,
  Target,
  Zap,
  BarChart3,
  PieChart
} from 'lucide-react';
import { Card } from '@/components/ui/revolutionary-card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import motionConfig from '@/lib/motion';
import { useClientManagement } from '@/hooks/useClientManagement';

export const ClientAnalytics: React.FC = () => {
  const { getClientAnalytics, clients } = useClientManagement();
  const analytics = getClientAnalytics();

  const kpis = [
    {
      id: 'total',
      title: 'Total Clients',
      value: analytics.total_clients,
      change: `+${analytics.recent_clients}`,
      trend: 'up' as const,
      description: 'All registered clients',
      icon: Users,
      color: 'blue'
    },
    {
      id: 'active',
      title: 'Active Clients',
      value: analytics.active_clients,
      change: `${Math.round((analytics.active_clients / analytics.total_clients) * 100)}%`,
      trend: 'up' as const,
      description: 'Currently active clients',
      icon: Activity,
      color: 'green'
    },
    {
      id: 'growth',
      title: 'Growth Rate',
      value: `${analytics.growth_rate.toFixed(1)}%`,
      change: 'This month',
      trend: analytics.growth_rate > 0 ? 'up' as const : 'down' as const,
      description: 'New client acquisition',
      icon: TrendingUp,
      color: 'purple'
    },
    {
      id: 'recent',
      title: 'New This Month',
      value: analytics.recent_clients,
      change: 'Last 30 days',
      trend: 'up' as const,
      description: 'Recently added clients',
      icon: Calendar,
      color: 'orange'
    }
  ];

  // Get top client types
  const topClientTypes = Object.entries(analytics.clients_by_type)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={motionConfig.spring.swift}
      >
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...motionConfig.spring.swift, delay: index * 0.1 }}
          >
            <KPICard kpi={kpi} />
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Section */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...motionConfig.spring.swift, delay: 0.5 }}
      >
        {/* Client Types Distribution */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              Client Types
            </h3>
            <Badge variant="outline" className="text-xs">
              {Object.keys(analytics.clients_by_type).length} Types
            </Badge>
          </div>
          
          <div className="space-y-4">
            {topClientTypes.map(([type, count], index) => (
              <motion.div
                key={type}
                className="flex items-center justify-between"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...motionConfig.spring.swift, delay: 0.7 + index * 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    index === 0 && "bg-blue-500",
                    index === 1 && "bg-green-500",
                    index === 2 && "bg-purple-500",
                    index === 3 && "bg-orange-500",
                    index === 4 && "bg-red-500"
                  )} />
                  <span className="text-sm font-medium capitalize">
                    {type.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{count}</span>
                  <Badge variant="secondary" className="text-xs">
                    {Math.round((count / analytics.total_clients) * 100)}%
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>

          {topClientTypes.length === 0 && (
            <div className="text-center py-8">
              <PieChart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No client data available</p>
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Activity Overview
            </h3>
            <Badge variant="outline" className="text-xs">
              Last 30 Days
            </Badge>
          </div>
          
          <div className="space-y-4">
            <ActivityItem
              icon={<Users className="w-4 h-4" />}
              label="New Clients Added"
              value={analytics.recent_clients}
              description="This month"
              trend={analytics.recent_clients > 0 ? 'up' : 'neutral'}
            />
            
            <ActivityItem
              icon={<Activity className="w-4 h-4" />}
              label="Active Clients"
              value={analytics.active_clients}
              description={`${Math.round((analytics.active_clients / analytics.total_clients) * 100)}% of total`}
              trend="up"
            />
            
            <ActivityItem
              icon={<Building2 className="w-4 h-4" />}
              label="Client Types"
              value={Object.keys(analytics.clients_by_type).length}
              description="Different business types"
              trend="neutral"
            />
            
            <ActivityItem
              icon={<Target className="w-4 h-4" />}
              label="Retention Rate"
              value="94.2%"
              description="Client satisfaction"
              trend="up"
            />
          </div>
        </Card>
      </motion.div>

      {/* Quick Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...motionConfig.spring.swift, delay: 0.8 }}
      >
        <Card variant="glass" className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold">AI Insights</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InsightCard
              type="growth"
              title="Strong Growth"
              message={`${analytics.recent_clients} new clients added this month, showing ${analytics.growth_rate.toFixed(1)}% growth rate.`}
              confidence={0.92}
            />
            
            <InsightCard
              type="opportunity"
              title="Market Expansion"
              message={`${Object.keys(analytics.clients_by_type).length} different client types indicate diverse market reach.`}
              confidence={0.87}
            />
            
            <InsightCard
              type="recommendation"
              title="Retention Focus"
              message={`With ${analytics.active_clients} active clients, focus on retention strategies for sustained growth.`}
              confidence={0.84}
            />
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

// KPI Card Component
interface KPICardProps {
  kpi: {
    id: string;
    title: string;
    value: string | number;
    change: string;
    trend: 'up' | 'down' | 'neutral';
    description: string;
    icon: React.ComponentType<any>;
    color: string;
  };
}

function KPICard({ kpi }: KPICardProps) {
  const Icon = kpi.icon;
  const TrendIcon = kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : Activity;
  
  return (
    <Card
      variant="glass"
      interaction="hover"
      className="p-6 group cursor-pointer"
    >
      <motion.div
        className="space-y-4"
        whileHover={{ y: -2 }}
        transition={motionConfig.spring.swift}
      >
        <div className="flex items-center justify-between">
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center",
            kpi.color === 'blue' && "bg-blue-100 text-blue-600",
            kpi.color === 'green' && "bg-green-100 text-green-600",
            kpi.color === 'purple' && "bg-purple-100 text-purple-600",
            kpi.color === 'orange' && "bg-orange-100 text-orange-600"
          )}>
            <Icon className="w-6 h-6" />
          </div>
          
          <motion.div
            className={cn(
              "flex items-center gap-1 text-sm",
              kpi.trend === 'up' && "text-green-600",
              kpi.trend === 'down' && "text-red-600",
              kpi.trend === 'neutral' && "text-muted-foreground"
            )}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <TrendIcon className="w-4 h-4" />
            <span>{kpi.change}</span>
          </motion.div>
        </div>
        
        <div>
          <motion.div
            className="text-3xl font-bold text-foreground mb-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={motionConfig.spring.bounce}
          >
            {kpi.value}
          </motion.div>
          <h3 className="font-medium text-foreground mb-1">{kpi.title}</h3>
          <p className="text-xs text-muted-foreground">{kpi.description}</p>
        </div>
      </motion.div>
    </Card>
  );
}

// Activity Item Component
interface ActivityItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  description: string;
  trend: 'up' | 'down' | 'neutral';
}

function ActivityItem({ icon, label, value, description, trend }: ActivityItemProps) {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-muted/20 rounded-lg transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="font-medium text-sm">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold">{value}</p>
        <div className={cn(
          "flex items-center gap-1 text-xs",
          trend === 'up' && "text-green-600",
          trend === 'down' && "text-red-600",
          trend === 'neutral' && "text-muted-foreground"
        )}>
          {trend === 'up' && <TrendingUp className="w-3 h-3" />}
          {trend === 'down' && <TrendingDown className="w-3 h-3" />}
          {trend === 'neutral' && <Activity className="w-3 h-3" />}
        </div>
      </div>
    </div>
  );
}

// Insight Card Component
interface InsightCardProps {
  type: 'growth' | 'opportunity' | 'recommendation' | 'alert';
  title: string;
  message: string;
  confidence: number;
}

function InsightCard({ type, title, message, confidence }: InsightCardProps) {
  return (
    <motion.div
      className={cn(
        "p-4 rounded-lg border",
        type === 'growth' && "bg-green-50 border-green-200 text-green-900",
        type === 'opportunity' && "bg-blue-50 border-blue-200 text-blue-900",
        type === 'recommendation' && "bg-purple-50 border-purple-200 text-purple-900",
        type === 'alert' && "bg-yellow-50 border-yellow-200 text-yellow-900"
      )}
      whileHover={{ scale: 1.02 }}
      transition={motionConfig.spring.swift}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm">{title}</h4>
        <span className="text-xs bg-white/50 px-2 py-1 rounded">
          {Math.round(confidence * 100)}% confident
        </span>
      </div>
      <p className="text-sm leading-relaxed">{message}</p>
    </motion.div>
  );
}