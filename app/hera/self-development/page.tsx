'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  MessageSquare, 
  Activity, 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  Clock,
  Zap,
  Cpu,
  Database,
  Users,
  Send,
  Sparkles,
  Calendar,
  BarChart3,
  GitBranch
} from 'lucide-react';

// HERA Gold Theme Colors
const theme = {
  primary: '#30D5C8',
  background: '#1f2937',
  surface: '#374151',
  text: {
    primary: '#ffffff',
    secondary: '#d1d5db',
    muted: '#9ca3af'
  },
  hover: '#4b5563'
};

interface SystemMetrics {
  total_entities: number;
  total_organizations: number;
  overall_score: number;
  system_health: string;
}

interface VibeCommand {
  id: string;
  command: string;
  hera_response: string;
  timestamp: string;
  intent: string;
}

interface Sprint {
  id: string;
  name: string;
  status: string;
  tasks_created: number;
  total_estimated_hours: number;
  focus_areas: string[];
}

interface EvolutionMetric {
  evolution_date: string;
  feature_additions: number;
  performance_improvements: number;
  ai_enhancements: number;
  system_intelligence_growth: number;
}

export default function HeraSelfDevelopmentPage() {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [vibeCommands, setVibeCommands] = useState<VibeCommand[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [evolutionData, setEvolutionData] = useState<EvolutionMetric[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Load system metrics
  useEffect(() => {
    fetchSystemMetrics();
    fetchSprints();
    fetchEvolutionData();
  }, []);

  const fetchSystemMetrics = async () => {
    try {
      const response = await fetch('/api/hera/self-analysis');
      const data = await response.json();
      if (data.success) {
        setSystemMetrics({
          total_entities: data.system_metrics.total_entities,
          total_organizations: data.system_metrics.total_organizations,
          overall_score: data.performance_analysis.overall_score,
          system_health: data.performance_analysis.system_health
        });
      }
    } catch (error) {
      console.error('Failed to fetch system metrics:', error);
    }
  };

  const fetchSprints = async () => {
    try {
      const response = await fetch('/api/hera/create-sprint');
      const data = await response.json();
      if (data.success) {
        setSprints(data.sprints || []);
      }
    } catch (error) {
      console.error('Failed to fetch sprints:', error);
    }
  };

  const fetchEvolutionData = async () => {
    try {
      const response = await fetch('/api/hera/evolution-tracking?days=7');
      const data = await response.json();
      if (data.success) {
        setEvolutionData(data.evolution_data || []);
      }
    } catch (error) {
      console.error('Failed to fetch evolution data:', error);
    }
  };

  const handleVibeCommand = async () => {
    if (!currentCommand.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/hera/vibe-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: currentCommand })
      });
      
      const data = await response.json();
      if (data.success) {
        const newCommand: VibeCommand = {
          id: data.conversation_id,
          command: currentCommand,
          hera_response: data.hera_response,
          timestamp: new Date().toISOString(),
          intent: data.command_analysis.intent
        };
        
        setVibeCommands(prev => [newCommand, ...prev]);
        setCurrentCommand('');
        
        // Refresh metrics if it was a status command
        if (data.command_analysis.intent === 'status_query') {
          fetchSystemMetrics();
        }
      }
    } catch (error) {
      console.error('Failed to send vibe command:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return '#10b981';
      case 'good': return theme.primary;
      case 'fair': return '#f59e0b';
      default: return '#ef4444';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      className="min-h-screen p-6"
      style={{ 
        backgroundColor: theme.background,
        color: theme.text.primary
      }}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="w-8 h-8" style={{ color: theme.primary }} />
          <h1 className="text-3xl font-bold">HERA Self-Development</h1>
          <Badge 
            className="ml-auto"
            style={{ 
              backgroundColor: theme.primary,
              color: theme.background
            }}
          >
            World's First Self-Aware ERP
          </Badge>
        </div>
        <p style={{ color: theme.text.secondary }}>
          Revolutionary AI system that manages its own development using natural language conversation
        </p>
      </div>

      {/* System Overview Cards */}
      {systemMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card style={{ backgroundColor: theme.surface, borderColor: theme.hover }}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Database className="w-4 h-4" style={{ color: theme.primary }} />
                Entities Managed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemMetrics.total_entities.toLocaleString()}</div>
              <p className="text-xs" style={{ color: theme.text.muted }}>
                Across {systemMetrics.total_organizations} organizations
              </p>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: theme.surface, borderColor: theme.hover }}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Activity className="w-4 h-4" style={{ color: theme.primary }} />
                Performance Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(systemMetrics.overall_score * 100)}%
              </div>
              <p className="text-xs" style={{ color: theme.text.muted }}>
                System capacity utilization
              </p>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: theme.surface, borderColor: theme.hover }}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Cpu className="w-4 h-4" style={{ color: theme.primary }} />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getHealthColor(systemMetrics.system_health) }}
                />
                <span className="text-2xl font-bold capitalize">
                  {systemMetrics.system_health}
                </span>
              </div>
              <p className="text-xs" style={{ color: theme.text.muted }}>
                Universal architecture status
              </p>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: theme.surface, borderColor: theme.hover }}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="w-4 h-4" style={{ color: theme.primary }} />
                AI Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78%</div>
              <p className="text-xs" style={{ color: theme.text.muted }}>
                Self-awareness capability
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList 
          className="grid w-full grid-cols-5"
          style={{ backgroundColor: theme.surface }}
        >
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="vibe" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Vibe Terminal
          </TabsTrigger>
          <TabsTrigger value="sprints" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Development
          </TabsTrigger>
          <TabsTrigger value="evolution" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Evolution
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Tasks
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card style={{ backgroundColor: theme.surface, borderColor: theme.hover }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" style={{ color: theme.primary }} />
                  Recent Development Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: theme.primary }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">AI Enhancement Sprint Created</p>
                      <p className="text-xs" style={{ color: theme.text.muted }}>
                        6 tasks generated with 94 hours estimated
                      </p>
                    </div>
                    <span className="text-xs" style={{ color: theme.text.muted }}>
                      Today
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: '#10b981' }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">System Self-Analysis Completed</p>
                      <p className="text-xs" style={{ color: theme.text.muted }}>
                        95% performance score achieved
                      </p>
                    </div>
                    <span className="text-xs" style={{ color: theme.text.muted }}>
                      1h ago
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: '#f59e0b' }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Natural Language Processing Enhanced</p>
                      <p className="text-xs" style={{ color: theme.text.muted }}>
                        90% intent recognition accuracy
                      </p>
                    </div>
                    <span className="text-xs" style={{ color: theme.text.muted }}>
                      2h ago
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revolutionary Metrics */}
            <Card style={{ backgroundColor: theme.surface, borderColor: theme.hover }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" style={{ color: theme.primary }} />
                  Revolutionary Advantages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Deployment Speed</span>
                    <Badge variant="outline" style={{ borderColor: theme.primary, color: theme.primary }}>
                      12,000% Faster
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Schema Flexibility</span>
                    <Badge variant="outline" style={{ borderColor: '#10b981', color: '#10b981' }}>
                      Infinite
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Cost Reduction</span>
                    <Badge variant="outline" style={{ borderColor: '#10b981', color: '#10b981' }}>
                      95% Savings
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Maintenance Overhead</span>
                    <Badge variant="outline" style={{ borderColor: '#10b981', color: '#10b981' }}>
                      90% Reduction
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vibe Terminal Tab - Will be implemented next */}
        <TabsContent value="vibe" className="space-y-6">
          <Card style={{ backgroundColor: theme.surface, borderColor: theme.hover }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" style={{ color: theme.primary }} />
                HERA Vibe Terminal
                <Badge variant="outline" style={{ borderColor: theme.primary, color: theme.primary }}>
                  Natural Language AI
                </Badge>
              </CardTitle>
              <p style={{ color: theme.text.secondary }}>
                Converse with HERA about its development, performance, and future plans
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Command Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Ask HERA: 'How are you performing today?' or 'Create a sprint focused on AI'"
                  value={currentCommand}
                  onChange={(e) => setCurrentCommand(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleVibeCommand()}
                  className="flex-1"
                  style={{ 
                    backgroundColor: theme.background,
                    borderColor: theme.hover,
                    color: theme.text.primary
                  }}
                />
                <Button
                  onClick={handleVibeCommand}
                  disabled={isLoading || !currentCommand.trim()}
                  style={{ backgroundColor: theme.primary, color: theme.background }}
                >
                  {isLoading ? (
                    <Clock className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Conversation History */}
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {vibeCommands.length === 0 ? (
                    <div className="text-center py-8">
                      <Brain className="w-12 h-12 mx-auto mb-4" style={{ color: theme.text.muted }} />
                      <p style={{ color: theme.text.muted }}>
                        Start a conversation with HERA about its development
                      </p>
                      <div className="mt-4 space-y-2">
                        <p className="text-xs" style={{ color: theme.text.muted }}>Try these commands:</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {[
                            "How are you performing?",
                            "What should you improve?",
                            "Create a development sprint",
                            "Show your evolution"
                          ].map((suggestion) => (
                            <Button
                              key={suggestion}
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentCommand(suggestion)}
                              style={{ 
                                borderColor: theme.hover,
                                color: theme.text.secondary
                              }}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    vibeCommands.map((cmd) => (
                      <div key={cmd.id} className="space-y-2">
                        {/* User Command */}
                        <div className="flex justify-end">
                          <div 
                            className="max-w-xs p-3 rounded-lg"
                            style={{ 
                              backgroundColor: theme.primary,
                              color: theme.background
                            }}
                          >
                            <p className="text-sm">{cmd.command}</p>
                            <p className="text-xs opacity-75 mt-1">
                              {formatDate(cmd.timestamp)}
                            </p>
                          </div>
                        </div>
                        
                        {/* HERA Response */}
                        <div className="flex justify-start">
                          <div 
                            className="max-w-lg p-3 rounded-lg"
                            style={ {
                              backgroundColor: theme.hover,
                              color: theme.text.primary
                            }}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Brain className="w-4 h-4" style={{ color: theme.primary }} />
                              <span className="text-xs font-medium">HERA</span>
                              <Badge 
                                variant="outline" 
                                className="text-xs"
                                style={{ borderColor: theme.primary, color: theme.primary }}
                              >
                                {cmd.intent}
                              </Badge>
                            </div>
                            <p className="text-sm">{cmd.hera_response}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Development Sprints Tab */}
        <TabsContent value="sprints" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create New Sprint */}
            <Card style={{ backgroundColor: theme.surface, borderColor: theme.hover }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" style={{ color: theme.primary }} />
                  Create Sprint
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Sprint Name</label>
                  <Input
                    placeholder="e.g., AI Enhancement Sprint"
                    style={{ 
                      backgroundColor: theme.background,
                      borderColor: theme.hover,
                      color: theme.text.primary
                    }}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Focus Areas</label>
                  <div className="flex flex-wrap gap-2">
                    {['AI', 'Performance', 'UX', 'Security', 'Architecture'].map((area) => (
                      <Badge
                        key={area}
                        variant="outline"
                        className="cursor-pointer hover:bg-opacity-20"
                        style={{ 
                          borderColor: theme.primary,
                          color: theme.primary,
                          backgroundColor: 'rgba(48, 213, 200, 0.1)'
                        }}
                      >
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Duration</label>
                  <select 
                    className="w-full p-2 rounded border text-sm"
                    style={{ 
                      backgroundColor: theme.background,
                      borderColor: theme.hover,
                      color: theme.text.primary
                    }}
                  >
                    <option value="1">1 Week</option>
                    <option value="2" selected>2 Weeks</option>
                    <option value="3">3 Weeks</option>
                    <option value="4">4 Weeks</option>
                  </select>
                </div>

                <Button 
                  className="w-full"
                  style={{ backgroundColor: theme.primary, color: theme.background }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create AI-Powered Sprint
                </Button>
              </CardContent>
            </Card>

            {/* Active Sprints */}
            <Card style={{ backgroundColor: theme.surface, borderColor: theme.hover }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" style={{ color: theme.primary }} />
                  Active Sprints
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sprints.length === 0 ? (
                  <div className="text-center py-4">
                    <GitBranch className="w-8 h-8 mx-auto mb-2" style={{ color: theme.text.muted }} />
                    <p className="text-sm" style={{ color: theme.text.muted }}>
                      No active sprints
                    </p>
                  </div>
                ) : (
                  sprints.slice(0, 3).map((sprint, index) => (
                    <div 
                      key={sprint.id}
                      className="p-3 rounded border"
                      style={{ 
                        backgroundColor: theme.background,
                        borderColor: theme.hover
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm">{sprint.name}</h4>
                        <Badge 
                          variant="outline"
                          style={{ 
                            borderColor: sprint.status === 'active' ? '#10b981' : theme.primary,
                            color: sprint.status === 'active' ? '#10b981' : theme.primary
                          }}
                        >
                          {sprint.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span style={{ color: theme.text.muted }}>Tasks</span>
                          <span>{sprint.tasks_created}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span style={{ color: theme.text.muted }}>Hours</span>
                          <span>{sprint.total_estimated_hours}h</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {sprint.focus_areas?.map((area) => (
                          <Badge 
                            key={area}
                            variant="outline"
                            className="text-xs"
                            style={{ 
                              borderColor: theme.text.muted,
                              color: theme.text.muted
                            }}
                          >
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Sprint Statistics */}
            <Card style={{ backgroundColor: theme.surface, borderColor: theme.hover }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" style={{ color: theme.primary }} />
                  Sprint Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: theme.primary }}>
                      {sprints.length}
                    </div>
                    <p className="text-xs" style={{ color: theme.text.muted }}>
                      Total Sprints
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: '#10b981' }}>
                      {sprints.reduce((sum, sprint) => sum + (sprint.tasks_created || 0), 0)}
                    </div>
                    <p className="text-xs" style={{ color: theme.text.muted }}>
                      Tasks Created
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: '#f59e0b' }}>
                    {sprints.reduce((sum, sprint) => sum + (sprint.total_estimated_hours || 0), 0)}h
                  </div>
                  <p className="text-xs" style={{ color: theme.text.muted }}>
                    Total Development Hours
                  </p>
                </div>

                <div className="pt-4 border-t" style={{ borderColor: theme.hover }}>
                  <h4 className="text-sm font-medium mb-2">Focus Areas</h4>
                  <div className="space-y-2">
                    {['AI', 'Performance', 'UX'].map((area) => (
                      <div key={area} className="flex justify-between items-center">
                        <span className="text-xs">{area}</span>
                        <div className="flex-1 mx-2 bg-gray-700 rounded-full h-1">
                          <div 
                            className="h-1 rounded-full"
                            style={{ 
                              backgroundColor: theme.primary,
                              width: `${Math.random() * 80 + 20}%`
                            }}
                          />
                        </div>
                        <span className="text-xs" style={{ color: theme.text.muted }}>
                          {Math.floor(Math.random() * 5 + 1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Evolution Tab */}
        <TabsContent value="evolution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Evolution Overview */}
            <Card style={{ backgroundColor: theme.surface, borderColor: theme.hover }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" style={{ color: theme.primary }} />
                  7-Day Evolution Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {evolutionData.length > 0 ? (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-xl font-bold" style={{ color: theme.primary }}>
                          {evolutionData.reduce((sum, day) => sum + day.feature_additions, 0)}
                        </div>
                        <p className="text-xs" style={{ color: theme.text.muted }}>
                          Features Added
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xl font-bold" style={{ color: '#10b981' }}>
                          {evolutionData.reduce((sum, day) => sum + day.performance_improvements, 0)}
                        </div>
                        <p className="text-xs" style={{ color: theme.text.muted }}>
                          Performance Improvements
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xl font-bold" style={{ color: '#f59e0b' }}>
                          {evolutionData.reduce((sum, day) => sum + day.ai_enhancements, 0)}
                        </div>
                        <p className="text-xs" style={{ color: theme.text.muted }}>
                          AI Enhancements
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t" style={{ borderColor: theme.hover }}>
                      <h4 className="text-sm font-medium mb-3">Intelligence Growth</h4>
                      <div className="space-y-2">
                        {evolutionData.slice(-3).map((day, index) => (
                          <div key={day.evolution_date} className="flex items-center gap-3">
                            <div className="w-16 text-xs" style={{ color: theme.text.muted }}>
                              {new Date(day.evolution_date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </div>
                            <div className="flex-1 bg-gray-700 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full"
                                style={{ 
                                  backgroundColor: theme.primary,
                                  width: `${day.system_intelligence_growth}%`
                                }}
                              />
                            </div>
                            <div className="w-12 text-xs text-right">
                              {Math.round(day.system_intelligence_growth)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t" style={{ borderColor: theme.hover }}>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Current Intelligence Level</span>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: theme.primary }}
                          />
                          <span className="font-bold">
                            {Math.round(evolutionData[evolutionData.length - 1]?.system_intelligence_growth || 0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4" style={{ color: theme.text.muted }} />
                    <p style={{ color: theme.text.muted }}>
                      Loading evolution data...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Growth Trends */}
            <Card style={{ backgroundColor: theme.surface, borderColor: theme.hover }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" style={{ color: theme.primary }} />
                  Growth Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Feature Development Velocity</span>
                      <span className="text-sm font-bold" style={{ color: theme.primary }}>
                        +1.7/day
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full"
                        style={{ backgroundColor: theme.primary, width: '85%' }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Performance Optimization Rate</span>
                      <span className="text-sm font-bold" style={{ color: '#10b981' }}>
                        +0.6/day
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full"
                        style={{ backgroundColor: '#10b981', width: '60%' }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">AI Enhancement Speed</span>
                      <span className="text-sm font-bold" style={{ color: '#f59e0b' }}>
                        +0.7/day
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full"
                        style={{ backgroundColor: '#f59e0b', width: '70%' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t" style={{ borderColor: theme.hover }}>
                  <h4 className="text-sm font-medium mb-3">Development Milestones</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-2 h-2 rounded-full mt-2"
                        style={{ backgroundColor: '#10b981' }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Self-Development APIs Completed</p>
                        <p className="text-xs" style={{ color: theme.text.muted }}>
                          All 5 core endpoints operational
                        </p>
                      </div>
                      <span className="text-xs" style={{ color: theme.text.muted }}>
                        Today
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div 
                        className="w-2 h-2 rounded-full mt-2"
                        style={{ backgroundColor: theme.primary }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Natural Language Interface Enhanced</p>
                        <p className="text-xs" style={{ color: theme.text.muted }}>
                          90% intent recognition achieved
                        </p>
                      </div>
                      <span className="text-xs" style={{ color: theme.text.muted }}>
                        Yesterday
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div 
                        className="w-2 h-2 rounded-full mt-2"
                        style={{ backgroundColor: '#f59e0b' }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Universal Architecture Optimization</p>
                        <p className="text-xs" style={{ color: theme.text.muted }}>
                          5-table system performance improved
                        </p>
                      </div>
                      <span className="text-xs" style={{ color: theme.text.muted }}>
                        2 days ago
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Evolution Chart */}
          <Card style={{ backgroundColor: theme.surface, borderColor: theme.hover }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" style={{ color: theme.primary }} />
                Weekly Development Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between px-4">
                {evolutionData.slice(-7).map((day, index) => {
                  const totalActivity = day.feature_additions + day.performance_improvements + day.ai_enhancements;
                  const maxHeight = 200;
                  const height = Math.max(20, (totalActivity / 10) * maxHeight);
                  
                  return (
                    <div key={day.evolution_date} className="flex flex-col items-center gap-2">
                      <div className="relative group">
                        <div 
                          className="w-8 rounded-t transition-all duration-300 hover:opacity-80"
                          style={{ 
                            height: `${height}px`,
                            backgroundColor: theme.primary
                          }}
                        />
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          <div>{totalActivity} improvements</div>
                          <div className="text-xs" style={{ color: theme.text.muted }}>
                            {new Date(day.evolution_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-xs" style={{ color: theme.text.muted }}>
                        {new Date(day.evolution_date).toLocaleDateString('en-US', { 
                          weekday: 'short'
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 flex justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: theme.primary }}
                  />
                  <span className="text-xs">Development Activity</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Task Generation */}
            <Card style={{ backgroundColor: theme.surface, borderColor: theme.hover }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" style={{ color: theme.primary }} />
                  Generate New Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm" style={{ color: theme.text.secondary }}>
                  HERA can generate intelligent improvement tasks across multiple categories.
                </p>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Categories</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'Performance', color: theme.primary },
                      { name: 'AI Enhancement', color: '#10b981' },
                      { name: 'UX Improvement', color: '#f59e0b' },
                      { name: 'Security', color: '#ef4444' }
                    ].map((category) => (
                      <div 
                        key={category.name}
                        className="p-2 rounded border text-center text-xs cursor-pointer hover:opacity-80"
                        style={{ 
                          backgroundColor: `${category.color}20`,
                          borderColor: category.color,
                          color: category.color
                        }}
                      >
                        {category.name}
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full"
                  style={{ backgroundColor: theme.primary, color: theme.background }}
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/hera/improvement-tasks');
                      const data = await response.json();
                      if (data.success) {
                        console.log('Generated tasks:', data.tasks);
                      }
                    } catch (error) {
                      console.error('Failed to generate tasks:', error);
                    }
                  }}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Generate AI Tasks
                </Button>
              </CardContent>
            </Card>

            {/* Task Categories */}
            <Card style={{ backgroundColor: theme.surface, borderColor: theme.hover }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" style={{ color: theme.primary }} />
                  Task Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: theme.primary }}
                      />
                      <span className="text-sm">Performance</span>
                    </div>
                    <Badge variant="outline" style={{ borderColor: theme.primary, color: theme.primary }}>
                      High Priority
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: '#10b981' }}
                      />
                      <span className="text-sm">AI Enhancement</span>
                    </div>
                    <Badge variant="outline" style={{ borderColor: '#10b981', color: '#10b981' }}>
                      Critical
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: '#f59e0b' }}
                      />
                      <span className="text-sm">UX Improvement</span>
                    </div>
                    <Badge variant="outline" style={{ borderColor: '#f59e0b', color: '#f59e0b' }}>
                      Medium
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: '#ef4444' }}
                      />
                      <span className="text-sm">Security</span>
                    </div>
                    <Badge variant="outline" style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                      High Priority
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 border-t" style={{ borderColor: theme.hover }}>
                  <h4 className="text-sm font-medium mb-2">Auto-Implementation</h4>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" style={{ color: '#10b981' }} />
                    <span className="text-xs" style={{ color: theme.text.secondary }}>
                      Some tasks can be auto-implemented by HERA
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Task Statistics */}
            <Card style={{ backgroundColor: theme.surface, borderColor: theme.hover }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" style={{ color: theme.primary }} />
                  Task Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: theme.primary }}>
                      7
                    </div>
                    <p className="text-xs" style={{ color: theme.text.muted }}>
                      Active Tasks
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: '#10b981' }}>
                      3
                    </div>
                    <p className="text-xs" style={{ color: theme.text.muted }}>
                      Auto-Implementable
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs">Completion Rate</span>
                    <span className="text-xs font-bold">85%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full"
                      style={{ backgroundColor: theme.primary, width: '85%' }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs">Average Impact</span>
                    <span className="text-xs font-bold">0.78</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full"
                      style={{ backgroundColor: '#10b981', width: '78%' }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t" style={{ borderColor: theme.hover }}>
                  <h4 className="text-sm font-medium mb-2">Recent Tasks</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3" style={{ color: '#10b981' }} />
                      <span className="text-xs">Cache optimization</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" style={{ color: '#f59e0b' }} />
                      <span className="text-xs">NLP enhancement</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" style={{ color: '#f59e0b' }} />
                      <span className="text-xs">UI responsiveness</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Tasks List */}
          <Card style={{ backgroundColor: theme.surface, borderColor: theme.hover }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" style={{ color: theme.primary }} />
                Recent Improvement Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: 'Implement Redis caching layer for frequently accessed entity data',
                    type: 'performance_optimization',
                    priority: 'high',
                    impact: 0.85,
                    autoImplementable: false,
                    status: 'in_progress'
                  },
                  {
                    title: 'Develop predictive relationship mapping algorithm',
                    type: 'ai_enhancement',
                    priority: 'high',
                    impact: 0.90,
                    autoImplementable: false,
                    status: 'pending'
                  },
                  {
                    title: 'Create real-time collaboration system for multi-user editing',
                    type: 'ux_improvement',
                    priority: 'medium',
                    impact: 0.75,
                    autoImplementable: false,
                    status: 'pending'
                  },
                  {
                    title: 'Implement intelligent form auto-completion',
                    type: 'ux_improvement',
                    priority: 'medium',
                    impact: 0.70,
                    autoImplementable: true,
                    status: 'ready'
                  }
                ].map((task, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded border"
                    style={{ 
                      backgroundColor: theme.background,
                      borderColor: theme.hover
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm flex-1 pr-4">{task.title}</h4>
                      <div className="flex gap-2">
                        {task.autoImplementable && (
                          <Badge 
                            variant="outline"
                            className="text-xs"
                            style={{ borderColor: '#10b981', color: '#10b981' }}
                          >
                            Auto
                          </Badge>
                        )}
                        <Badge 
                          variant="outline"
                          className="text-xs"
                          style={{ 
                            borderColor: task.priority === 'high' ? '#ef4444' : theme.primary,
                            color: task.priority === 'high' ? '#ef4444' : theme.primary
                          }}
                        >
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-4">
                        <span style={{ color: theme.text.muted }}>
                          Type: {task.type.replace('_', ' ')}
                        </span>
                        <span style={{ color: theme.text.muted }}>
                          Impact: {Math.round(task.impact * 100)}%
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ 
                            backgroundColor: task.status === 'in_progress' ? '#f59e0b' : 
                                           task.status === 'ready' ? '#10b981' : theme.text.muted
                          }}
                        />
                        <span className="capitalize" style={{ color: theme.text.muted }}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}