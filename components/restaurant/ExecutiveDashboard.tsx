'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Calendar,
  Briefcase,
  Building,
  Globe,
  Award,
  Zap
} from 'lucide-react';
import { Card } from '@/components/ui/revolutionary-card';
import { Button } from '@/components/ui/revolutionary-button';
import { Badge } from '@/components/ui/badge';

interface ExecutiveDashboardProps {
  restaurantId: string;
  executiveId: string;
  role: 'ceo' | 'cfo' | 'coo';
}

interface KPI {
  title: string;
  value: string;
  change: number;
  target?: number;
  status: 'exceeding' | 'on_track' | 'behind' | 'critical';
  icon: React.ReactNode;
  insight?: string;
}

interface StrategicAlert {
  type: 'opportunity' | 'risk' | 'achievement';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  timeline: string;
  action?: string;
}

const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ restaurantId, executiveId, role }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 300000); // Update every 5 minutes
    return () => clearInterval(timer);
  }, []);

  // Steve Krug: Most important metrics first, executive-level only
  const strategicKPIs: KPI[] = [
    {
      title: 'Monthly Revenue',
      value: '$247K',
      change: 18.5,
      target: 250,
      status: 'on_track',
      icon: <DollarSign className="w-6 h-6" />,
      insight: 'On track to exceed target by month end'
    },
    {
      title: 'Profit Margin',
      value: '28.4%',
      change: 3.2,
      target: 25,
      status: 'exceeding',
      icon: <TrendingUp className="w-6 h-6" />,
      insight: 'Exceeding industry average of 22%'
    },
    {
      title: 'Customer Growth',
      value: '+1,247',
      change: 22.1,
      target: 15,
      status: 'exceeding',
      icon: <Users className="w-6 h-6" />,
      insight: 'Strong word-of-mouth driving growth'
    },
    {
      title: 'Market Share',
      value: '12.8%',
      change: 1.4,
      target: 15,
      status: 'behind',
      icon: <Target className="w-6 h-6" />,
      insight: 'Need aggressive marketing push'
    },
    {
      title: 'Operational Efficiency',
      value: '94.2%',
      change: 2.8,
      target: 90,
      status: 'exceeding',
      icon: <Zap className="w-6 h-6" />,
      insight: 'Best-in-class operations'
    },
    {
      title: 'Customer Satisfaction',
      value: '4.7/5',
      change: 0.3,
      target: 4.5,
      status: 'exceeding',
      icon: <Award className="w-6 h-6" />,
      insight: 'Industry-leading satisfaction'
    }
  ];

  const strategicAlerts: StrategicAlert[] = [
    {
      type: 'opportunity',
      title: 'Expansion Opportunity',
      description: 'Prime location available in Business District. 40% higher foot traffic than current location.',
      impact: 'high',
      timeline: '30 days to decide',
      action: 'Schedule site visit'
    },
    {
      type: 'achievement',
      title: 'Profitability Milestone',
      description: 'Achieved highest monthly profit margin in company history at 28.4%.',
      impact: 'high',
      timeline: 'This month'
    },
    {
      type: 'risk',
      title: 'Competitive Threat',
      description: 'Major chain opening 2 blocks away next quarter. Potential 15-20% revenue impact.',
      impact: 'high',
      timeline: '90 days',
      action: 'Develop counter-strategy'
    },
    {
      type: 'opportunity',
      title: 'Technology Partnership',
      description: 'Food delivery platform offering exclusive partnership with 0% commission for 6 months.',
      impact: 'medium',
      timeline: '14 days to decide',
      action: 'Review contract'
    }
  ];

  const competitiveMetrics = {
    revenue_vs_market: { us: 247000, market_avg: 180000, rank: 2 },
    efficiency_vs_peers: { us: 94.2, peer_avg: 78.5, rank: 1 },
    growth_vs_industry: { us: 22.1, industry_avg: 8.3, rank: 1 }
  };

  const getKPIStatusColor = (status: KPI['status']) => {
    switch (status) {
      case 'exceeding': return 'bg-green-50 border-green-200 text-green-800';
      case 'on_track': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'behind': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'critical': return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  const getAlertColor = (type: StrategicAlert['type']) => {
    switch (type) {
      case 'opportunity': return 'bg-blue-50 border-l-blue-500 text-blue-800';
      case 'achievement': return 'bg-green-50 border-l-green-500 text-green-800';
      case 'risk': return 'bg-red-50 border-l-red-500 text-red-800';
    }
  };

  const getAlertIcon = (type: StrategicAlert['type']) => {
    switch (type) {
      case 'opportunity': return <Target className="w-5 h-5 text-blue-600" />;
      case 'achievement': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'risk': return <AlertTriangle className="w-5 h-5 text-red-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Steve Krug: Executive header with essential context only */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              {role.toUpperCase()} Dashboard
            </h1>
            <p className="text-slate-600">
              Strategic Overview • {currentTime.toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex bg-white rounded-lg border p-1">
              {(['week', 'month', 'quarter', 'year'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded capitalize transition-colors ${
                    selectedPeriod === period 
                      ? 'bg-blue-500 text-white' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
            
            <Button variant="outline" leftIcon={<BarChart3 className="w-4 h-4" />}>
              Deep Dive
            </Button>
          </div>
        </header>

        {/* Steve Krug: Strategic KPIs - most important metrics at a glance */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {strategicKPIs.map((kpi, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`p-6 border-2 ${getKPIStatusColor(kpi.status)}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {kpi.icon}
                    <h3 className="font-semibold">{kpi.title}</h3>
                  </div>
                  <Badge className={kpi.status === 'exceeding' ? 'bg-green-100 text-green-800' : 
                                   kpi.status === 'on_track' ? 'bg-blue-100 text-blue-800' :
                                   'bg-orange-100 text-orange-800'}>
                    {kpi.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-slate-800">{kpi.value}</div>
                  <div className="flex items-center space-x-2">
                    {kpi.change > 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      kpi.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {kpi.change > 0 ? '+' : ''}{kpi.change}%
                    </span>
                    <span className="text-sm text-slate-500">vs last {selectedPeriod}</span>
                  </div>
                  {kpi.insight && (
                    <p className="text-xs text-slate-600 bg-white bg-opacity-50 p-2 rounded">
                      💡 {kpi.insight}
                    </p>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Strategic Alerts */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Strategic Alerts</h3>
              
              <div className="space-y-4">
                {strategicAlerts.map((alert, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 border-l-4 rounded-r-lg ${getAlertColor(alert.type)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-bold">{alert.title}</h4>
                            <Badge className={`text-xs ${
                              alert.impact === 'high' ? 'bg-red-100 text-red-800' :
                              alert.impact === 'medium' ? 'bg-orange-100 text-orange-800' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {alert.impact.toUpperCase()} IMPACT
                            </Badge>
                          </div>
                          <p className="text-sm opacity-90 mb-2">{alert.description}</p>
                          <p className="text-xs opacity-75">Timeline: {alert.timeline}</p>
                        </div>
                      </div>
                      {alert.action && (
                        <Button size="sm" variant="outline">
                          {alert.action}
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Competitive Position */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Competitive Position</h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                <CompetitiveMetric
                  title="Revenue vs Market"
                  ourValue="$247K"
                  marketValue="$180K"
                  rank={2}
                  performance={37.2}
                />
                <CompetitiveMetric
                  title="Efficiency vs Peers"
                  ourValue="94.2%"
                  marketValue="78.5%"
                  rank={1}
                  performance={20.0}
                />
                <CompetitiveMetric
                  title="Growth vs Industry"
                  ourValue="22.1%"
                  marketValue="8.3%"
                  rank={1}
                  performance={166.3}
                />
              </div>
            </Card>
          </div>

          {/* Executive Actions */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Executive Actions</h3>
              
              <div className="space-y-3">
                <ExecutiveActionButton
                  icon={<Building className="w-5 h-5" />}
                  title="Expansion Planning"
                  subtitle="Review growth opportunities"
                  priority="high"
                />
                <ExecutiveActionButton
                  icon={<DollarSign className="w-5 h-5" />}
                  title="Budget Review"
                  subtitle="Q4 budget allocation"
                  priority="medium"
                />
                <ExecutiveActionButton
                  icon={<Users className="w-5 h-5" />}
                  title="Talent Strategy"
                  subtitle="Key hires & retention"
                  priority="medium"
                />
                <ExecutiveActionButton
                  icon={<Globe className="w-5 h-5" />}
                  title="Market Analysis"
                  subtitle="Competitive landscape"
                  priority="low"
                />
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Key Objectives</h3>
              
              <div className="space-y-4">
                <ObjectiveProgress
                  title="Revenue Target"
                  current={247}
                  target={300}
                  unit="K"
                  deadline="Q4 2024"
                />
                <ObjectiveProgress
                  title="Market Share"
                  current={12.8}
                  target={15.0}
                  unit="%"
                  deadline="2024"
                />
                <ObjectiveProgress
                  title="New Locations"
                  current={1}
                  target={3}
                  unit=""
                  deadline="2025"
                />
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Board Meeting</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-slate-600" />
                  <span className="text-sm text-slate-600">Next: Dec 15, 2024</span>
                </div>
                <Button className="w-full bg-slate-800 text-white">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Prepare Board Deck
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const CompetitiveMetric: React.FC<{
  title: string;
  ourValue: string;
  marketValue: string;
  rank: number;
  performance: number;
}> = ({ title, ourValue, marketValue, rank, performance }) => (
  <div className="p-4 bg-slate-50 rounded-lg">
    <h4 className="font-medium text-slate-700 text-sm mb-3">{title}</h4>
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-xs text-slate-500">Us</span>
        <span className="font-bold text-slate-800">{ourValue}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-xs text-slate-500">Market</span>
        <span className="text-slate-600">{marketValue}</span>
      </div>
      <div className="border-t pt-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-500">Rank</span>
          <Badge className="bg-blue-100 text-blue-800">#{rank}</Badge>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-slate-500">Performance</span>
          <span className="text-sm font-bold text-green-600">+{performance.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  </div>
);

const ExecutiveActionButton: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  priority: 'high' | 'medium' | 'low';
}> = ({ icon, title, subtitle, priority }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
      priority === 'high' ? 'border-red-200 bg-red-50 hover:bg-red-100' :
      priority === 'medium' ? 'border-orange-200 bg-orange-50 hover:bg-orange-100' :
      'border-slate-200 bg-white hover:bg-slate-50'
    }`}
  >
    <div className="flex items-center space-x-3">
      <div className={priority === 'high' ? 'text-red-600' : priority === 'medium' ? 'text-orange-600' : 'text-slate-600'}>
        {icon}
      </div>
      <div className="flex-1">
        <h4 className={`font-medium ${priority === 'high' ? 'text-red-800' : priority === 'medium' ? 'text-orange-800' : 'text-slate-800'}`}>
          {title}
        </h4>
        <p className={`text-sm ${priority === 'high' ? 'text-red-600' : priority === 'medium' ? 'text-orange-600' : 'text-slate-500'}`}>
          {subtitle}
        </p>
      </div>
      {priority === 'high' && (
        <AlertTriangle className="w-4 h-4 text-red-500" />
      )}
    </div>
  </motion.button>
);

const ObjectiveProgress: React.FC<{
  title: string;
  current: number;
  target: number;
  unit: string;
  deadline: string;
}> = ({ title, current, target, unit, deadline }) => {
  const percentage = Math.min(100, (current / target) * 100);
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-slate-700">{title}</span>
        <span className="text-slate-600">{current}{unit} / {target}{unit}</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2 mb-1">
        <div
          className={`h-2 rounded-full transition-all ${
            percentage >= 80 ? 'bg-green-500' : 
            percentage >= 60 ? 'bg-orange-500' : 'bg-red-500'
          }`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="text-xs text-slate-500">Deadline: {deadline}</div>
    </div>
  );
};

export default ExecutiveDashboard;