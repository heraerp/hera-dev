'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUniversalReporting } from '@/hooks/useUniversalReporting';
import { OrganizationGuard, useOrganizationContext } from '@/components/restaurant/organization-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/ui/navbar'
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Package, 
  Clock,
  Download,
  Plus,
  Calendar,
  Filter,
  RefreshCw,
  Eye,
  FileText,
  Layout,
  Settings
} from 'lucide-react';

// Organization ID comes from authenticated user context

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  format?: 'currency' | 'percentage' | 'number';
}

function MetricCard({ title, value, change, icon, format = 'number' }: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat('en-US').format(val);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="text-muted-foreground">
            {icon}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold">
            {formatValue(value)}
          </div>
          {change !== undefined && (
            <p className={`text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change.toFixed(1)}% from last period
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface ReportCardProps {
  report: any;
  onView: () => void;
  onExport: (format: string) => void;
  onDelete: () => void;
}

function ReportCard({ report, onView, onExport, onDelete }: ReportCardProps) {
  const getReportIcon = (type: string) => {
    switch (type) {
      case 'financial': return <DollarSign className="h-4 w-4" />;
      case 'operational': return <BarChart3 className="h-4 w-4" />;
      case 'staff': return <Users className="h-4 w-4" />;
      case 'inventory': return <Package className="h-4 w-4" />;
      case 'sales': return <TrendingUp className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'generating': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {getReportIcon(report.reportType)}
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold">{report.title}</h3>
              <p className="text-sm text-muted-foreground">{report.description}</p>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{new Date(report.generatedAt).toLocaleDateString()}</span>
                <Badge variant="outline" className={getStatusColor(report.status)}>
                  {report.status}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" onClick={onView}>
              <Eye className="h-4 w-4" />
            </Button>
            <Select onValueChange={onExport}>
              <SelectTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">Export as PDF</SelectItem>
                <SelectItem value="excel">Export as Excel</SelectItem>
                <SelectItem value="csv">Export as CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NewReportDialog({ onGenerate }: { onGenerate: (type: string, period: any) => void }) {
  const [reportType, setReportType] = useState('');
  const [periodType, setPeriodType] = useState('monthly');
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const handleGenerate = () => {
    if (!reportType) return;
    
    onGenerate(reportType, {
      startDate,
      endDate,
      type: periodType
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate New Report</DialogTitle>
          <DialogDescription>
            Create a comprehensive analytics report for your organization.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="financial">Financial Performance</SelectItem>
                <SelectItem value="operational">Operational Efficiency</SelectItem>
                <SelectItem value="staff">Staff Performance</SelectItem>
                <SelectItem value="inventory">Inventory Management</SelectItem>
                <SelectItem value="sales">Sales Analytics</SelectItem>
                <SelectItem value="custom">Universal Analytics</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="periodType">Period Type</Label>
            <Select value={periodType} onValueChange={setPeriodType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <DialogTrigger asChild>
            <Button variant="outline">Cancel</Button>
          </DialogTrigger>
          <Button onClick={handleGenerate} disabled={!reportType}>
            Generate Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function UniversalReportsContent() {
  const { organizationId } = useOrganizationContext();
  const {
    analytics,
    reports,
    dashboards,
    currentDashboard,
    loading,
    generating,
    error,
    generateReport,
    fetchReports,
    exportReport,
    deleteReport,
    refreshData,
    stats,
    formatMetric
  } = useUniversalReporting(organizationId!);

  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [reportTypeFilter, setReportTypeFilter] = useState('all');

  // Filter reports based on search and type
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = reportTypeFilter === 'all' || report.reportType === reportTypeFilter;
    return matchesSearch && matchesType;
  });

  const handleGenerateReport = async (reportType: string, period: any) => {
    const result = await generateReport(reportType as any, period);
    if (result) {
      console.log('Report generated successfully:', result);
    }
  };

  const renderOverview = () => {
    if (!analytics) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Revenue"
            value={analytics.financial.totalRevenue}
            change={analytics.financial.revenueGrowth}
            icon={<DollarSign className="h-4 w-4" />}
            format="currency"
          />
          <MetricCard
            title="Net Profit"
            value={analytics.financial.netProfit}
            change={analytics.financial.profitMargin}
            icon={<TrendingUp className="h-4 w-4" />}
            format="currency"
          />
          <MetricCard
            title="Total Orders"
            value={analytics.operational.totalOrders}
            change={15.2}
            icon={<BarChart3 className="h-4 w-4" />}
          />
          <MetricCard
            title="Active Staff"
            value={analytics.staff.activeStaff}
            change={5.1}
            icon={<Users className="h-4 w-4" />}
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <MetricCard
            title="Profit Margin"
            value={analytics.financial.profitMargin}
            icon={<PieChart className="h-4 w-4" />}
            format="percentage"
          />
          <MetricCard
            title="Order Fulfillment"
            value={analytics.operational.orderFulfillmentRate}
            icon={<Clock className="h-4 w-4" />}
            format="percentage"
          />
          <MetricCard
            title="Staff Utilization"
            value={analytics.staff.staffUtilization}
            icon={<Users className="h-4 w-4" />}
            format="percentage"
          />
          <MetricCard
            title="Inventory Value"
            value={analytics.inventory.stockValue}
            icon={<Package className="h-4 w-4" />}
            format="currency"
          />
          <MetricCard
            title="Customer Retention"
            value={analytics.customer.customerRetentionRate}
            icon={<TrendingUp className="h-4 w-4" />}
            format="percentage"
          />
          <MetricCard
            title="System Uptime"
            value={analytics.operational.systemUptime}
            icon={<BarChart3 className="h-4 w-4" />}
            format="percentage"
          />
        </div>

        {/* Quick Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Insights</CardTitle>
            <CardDescription>Key performance indicators at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-600">Performing Well</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Revenue growth is {analytics.financial.revenueGrowth.toFixed(1)}% above target</li>
                  <li>• Customer retention at {analytics.customer.customerRetentionRate.toFixed(1)}%</li>
                  <li>• System uptime excellent at {analytics.operational.systemUptime}%</li>
                  <li>• Staff performance above average at {analytics.staff.averagePerformance}/5</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-amber-600">Needs Attention</h4>
                <ul className="space-y-1 text-sm">
                  <li>• {analytics.inventory.lowStockItems} products are low in stock</li>
                  <li>• Inventory waste at {analytics.inventory.wastePercentage}%</li>
                  <li>• Average order time: {analytics.operational.averageOrderTime} minutes</li>
                  <li>• Staff turnover rate: {analytics.staff.staffTurnover}%</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderReports = () => (
    <div className="space-y-6">
      {/* Reports Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Generated Reports</h2>
          <p className="text-muted-foreground">
            Manage and export your analytics reports
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <NewReportDialog onGenerate={handleGenerateReport} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={reportTypeFilter} onValueChange={setReportTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="financial">Financial</SelectItem>
            <SelectItem value="operational">Operational</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="inventory">Inventory</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reports Grid */}
      <div className="grid gap-4">
        <AnimatePresence>
          {filteredReports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <ReportCard
                report={report}
                onView={() => console.log('View report:', report.id)}
                onExport={(format) => exportReport(report.id, format as any)}
                onDelete={() => deleteReport(report.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No reports found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || reportTypeFilter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Generate your first analytics report to get started.'}
          </p>
          {!searchQuery && reportTypeFilter === 'all' && (
            <NewReportDialog onGenerate={handleGenerateReport} />
          )}
        </div>
      )}
    </div>
  );

  const renderDashboards = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboards</h2>
          <p className="text-muted-foreground">
            Customize your analytics with interactive dashboards
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Dashboard
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {dashboards.map((dashboard) => (
          <Card key={dashboard.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Layout className="h-5 w-5" />
                  <CardTitle className="text-lg">{dashboard.name}</CardTitle>
                </div>
                <Badge variant={dashboard.isDefault ? 'default' : 'outline'}>
                  {dashboard.isDefault ? 'Default' : 'Custom'}
                </Badge>
              </div>
              <CardDescription>{dashboard.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {dashboard.widgets.length} widgets • {dashboard.category}
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {dashboards.length === 0 && (
        <div className="text-center py-12">
          <Layout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No dashboards created</h3>
          <p className="text-muted-foreground mb-4">
            Create your first dashboard to visualize your analytics data.
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Dashboard
          </Button>
        </div>
      )}
    </div>
  );

  if (loading && !analytics) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Universal Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive business intelligence and reporting system
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            {stats.totalReports} reports
          </Badge>
          <Badge variant="outline">
            {stats.totalDashboards} dashboards
          </Badge>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          {renderReports()}
        </TabsContent>

        <TabsContent value="dashboards" className="space-y-6">
          {renderDashboards()}
        </TabsContent>
      </Tabs>

      {/* Loading indicator for generating reports */}
      {generating && (
        <div className="fixed bottom-4 right-4">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm">Generating report...</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// Main component with organization access control
export default function UniversalReportsPage() {
  return (
    <OrganizationGuard requiredRole="manager">
      <UniversalReportsContent />
    </OrganizationGuard>
  );
}