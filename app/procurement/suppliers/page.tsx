"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/revolutionary-card';
import { Button } from '@/components/ui/revolutionary-button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import motionConfig from '@/lib/motion';
import { useProcurementSuppliers } from '@/hooks/useProcurementSuppliers';

// Supplier Intelligence - AI-Powered Supplier Management
export default function SuppliersPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'performance' | 'risk'>('performance');

  const {
    suppliers,
    supplierAnalytics,
    isLoading,
    error,
    getSuppliers,
    getSupplierAnalytics,
    formatCurrency
  } = useProcurementSuppliers();

  // Load suppliers and analytics on component mount
  useEffect(() => {
    loadSuppliers();
    loadAnalytics();
  }, [selectedCategory, sortBy]);

  const loadSuppliers = async () => {
    try {
      const filters = selectedCategory !== 'all' ? { category: selectedCategory } : {};
      await getSuppliers({ ...filters, search: searchQuery });
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      await getSupplierAnalytics();
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  // Filter and sort suppliers
  const filteredSuppliers = suppliers
    .filter(supplier => 
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.categories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'performance':
          return (b.performance_score || 0) - (a.performance_score || 0);
        case 'risk':
          const riskOrder = { low: 0, medium: 1, high: 2, critical: 3 };
          const aRisk = a.risk_assessment?.overall_risk || 'medium';
          const bRisk = b.risk_assessment?.overall_risk || 'medium';
          return riskOrder[aRisk as keyof typeof riskOrder] - riskOrder[bRisk as keyof typeof riskOrder];
        default:
          return 0;
      }
    });

  const categories = [
    { value: 'all', label: 'All Categories', count: suppliers.length },
    { value: 'IT', label: 'IT & Technology', count: suppliers.filter(s => s.categories.includes('IT')).length },
    { value: 'Office Supplies', label: 'Office Supplies', count: suppliers.filter(s => s.categories.includes('Office Supplies')).length },
    { value: 'Equipment', label: 'Equipment', count: suppliers.filter(s => s.categories.includes('Equipment')).length },
    { value: 'Furniture', label: 'Furniture', count: suppliers.filter(s => s.categories.includes('Furniture')).length },
    { value: 'Services', label: 'Services', count: suppliers.filter(s => s.categories.includes('Services')).length },
  ];

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 80) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 70) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getRiskColor = (risk: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-amber-100 text-amber-800 border-amber-200',
      high: 'bg-red-100 text-red-800 border-red-200',
      critical: 'bg-red-200 text-red-900 border-red-300'
    };
    return colors[risk as keyof typeof colors] || colors.medium;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      under_review: 'bg-amber-100 text-amber-800 border-amber-200',
      blacklisted: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors] || colors.active;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header
        className="bg-white shadow-sm sticky top-0 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={motionConfig.spring.swift}
      >
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="p-2"
              >
                <span className="text-xl">←</span>
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-2xl">🏢</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Supplier Intelligence</h1>
                  <p className="text-sm text-gray-600">🤖 AI-Powered Supplier Management & Analytics</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-600">{supplierAnalytics?.total_suppliers || 0}</div>
                  <div className="text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">{supplierAnalytics?.active_suppliers || 0}</div>
                  <div className="text-gray-600">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">{supplierAnalytics?.average_performance_score?.toFixed(1) || 'N/A'}</div>
                  <div className="text-gray-600">Avg Score</div>
                </div>
              </div>
              
              <Button className="bg-purple-500 hover:bg-purple-600">
                <span className="text-lg mr-1">➕</span>
                Add Supplier
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="p-4 space-y-6">
        {/* Analytics Cards */}
        {supplierAnalytics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={motionConfig.spring.swift}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <AnalyticsCard
              title="Total Suppliers"
              value={supplierAnalytics.total_suppliers}
              emoji="🏢"
              color="purple"
            />
            <AnalyticsCard
              title="Active Suppliers"
              value={supplierAnalytics.active_suppliers}
              emoji="✅"
              color="green"
            />
            <AnalyticsCard
              title="Avg Performance"
              value={`${supplierAnalytics.average_performance_score?.toFixed(1) || '0'}%`}
              emoji="📊"
              color="blue"
            />
            <AnalyticsCard
              title="Categories Covered"
              value={Object.keys(supplierAnalytics.category_coverage || {}).length}
              emoji="📦"
              color="amber"
            />
          </motion.div>
        )}

        {/* Category Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...motionConfig.spring.swift, delay: 0.1 }}
          className="flex items-center space-x-2 overflow-x-auto pb-2"
        >
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.value)}
              className="flex items-center space-x-2 whitespace-nowrap"
            >
              <span>{category.label}</span>
              {category.count > 0 && (
                <Badge className="bg-gray-100 text-gray-800 text-xs">
                  {category.count}
                </Badge>
              )}
            </Button>
          ))}
        </motion.div>

        {/* Search and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...motionConfig.spring.swift, delay: 0.2 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search suppliers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            </div>
            
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="performance">Sort by Performance</option>
              <option value="name">Sort by Name</option>
              <option value="risk">Sort by Risk</option>
            </select>
            
            <div className="text-sm text-gray-600">
              {filteredSuppliers.length} of {suppliers.length} suppliers
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <span className="text-lg">⊞</span>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <span className="text-lg">☰</span>
            </Button>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-20"
          >
            <Card className="p-8 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="text-4xl mb-4"
              >
                🤖
              </motion.div>
              <p className="text-gray-600">Loading supplier intelligence...</p>
            </Card>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6 bg-red-50 border-red-200">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">❌</span>
                <div>
                  <h3 className="font-semibold text-red-800">Error Loading Suppliers</h3>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredSuppliers.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center py-20"
          >
            <Card className="p-12 text-center max-w-md">
              <div className="text-6xl mb-6">🏢</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {searchQuery ? 'No Matching Suppliers' : 'No Suppliers Yet'}
              </h2>
              <p className="text-gray-600 mb-8">
                {searchQuery 
                  ? 'Try adjusting your search terms or filter criteria.'
                  : 'Add your first supplier to start building your supplier network.'
                }
              </p>
              <Button className="bg-purple-500 hover:bg-purple-600">
                ➕ Add First Supplier
              </Button>
            </Card>
          </motion.div>
        )}

        {/* Suppliers Grid/List */}
        {!isLoading && !error && filteredSuppliers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...motionConfig.spring.swift, delay: 0.3 }}
          >
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSuppliers.map((supplier, index) => (
                  <SupplierCard
                    key={supplier.id}
                    supplier={supplier}
                    index={index}
                    onSelect={setSelectedSupplier}
                    getPerformanceColor={getPerformanceColor}
                    getRiskColor={getRiskColor}
                    getStatusColor={getStatusColor}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSuppliers.map((supplier, index) => (
                  <SupplierListItem
                    key={supplier.id}
                    supplier={supplier}
                    index={index}
                    onSelect={setSelectedSupplier}
                    getPerformanceColor={getPerformanceColor}
                    getRiskColor={getRiskColor}
                    getStatusColor={getStatusColor}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Top Performers Section */}
        {supplierAnalytics?.top_performers && supplierAnalytics.top_performers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...motionConfig.spring.swift, delay: 0.4 }}
          >
            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">⭐ Top Performing Suppliers</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {supplierAnalytics.top_performers.slice(0, 3).map((performer, index) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-gray-800">{performer.name}</div>
                      <Badge className="bg-green-100 text-green-800">
                        #{index + 1}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{performer.category}</div>
                    <div className="flex items-center space-x-4 text-sm">
                      <div>
                        <span className="text-gray-600">Score: </span>
                        <span className="font-semibold text-green-600">{performer.score}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Orders: </span>
                        <span className="font-semibold">{performer.orders}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Analytics Card Component
interface AnalyticsCardProps {
  title: string;
  value: string | number;
  emoji: string;
  color: string;
}

function AnalyticsCard({ title, value, emoji, color }: AnalyticsCardProps) {
  const colorClasses = {
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100 text-purple-800 border-purple-200 shadow-purple-500/10',
    green: 'bg-gradient-to-br from-green-50 to-green-100 text-green-800 border-green-200 shadow-green-500/10',
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800 border-blue-200 shadow-blue-500/10',
    amber: 'bg-gradient-to-br from-amber-50 to-amber-100 text-amber-800 border-amber-200 shadow-amber-500/10'
  };

  return (
    <Card variant="glass" className={cn("p-4 border shadow-lg transition-all duration-300 hover:scale-105", colorClasses[color as keyof typeof colorClasses])}>
      <div className="text-center space-y-2">
        <div className="text-2xl mb-1">{emoji}</div>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <div className="text-sm font-medium opacity-75">{title}</div>
      </div>
    </Card>
  );
}

// Supplier Card Component for Grid View
interface SupplierCardProps {
  supplier: any;
  index: number;
  onSelect: (id: string) => void;
  getPerformanceColor: (score: number) => string;
  getRiskColor: (risk: string) => string;
  getStatusColor: (status: string) => string;
}

function SupplierCard({ 
  supplier, 
  index, 
  onSelect, 
  getPerformanceColor, 
  getRiskColor, 
  getStatusColor 
}: SupplierCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...motionConfig.spring.bounce, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      <Card 
        variant="glass" 
        className="p-6 cursor-pointer transition-all duration-300 hover:shadow-lg"
        onClick={() => onSelect(supplier.id)}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🏢</span>
              <Badge className={cn("text-xs", getStatusColor(supplier.status))}>
                {supplier.status.toUpperCase()}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-800">
                {supplier.performance_score?.toFixed(1) || 'N/A'}%
              </div>
              <div className="text-xs text-gray-600">Performance</div>
            </div>
          </div>

          {/* Name and Description */}
          <div>
            <h3 className="font-bold text-lg text-gray-800 mb-2">
              {supplier.name}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {supplier.description || 'No description available'}
            </p>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-1">
            {supplier.categories.slice(0, 3).map((category: string, idx: number) => (
              <Badge key={idx} className="bg-blue-100 text-blue-800 text-xs">
                {category}
              </Badge>
            ))}
            {supplier.categories.length > 3 && (
              <Badge className="bg-gray-100 text-gray-800 text-xs">
                +{supplier.categories.length - 3} more
              </Badge>
            )}
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Performance:</span>
              <Badge className={cn("ml-2 text-xs", getPerformanceColor(supplier.performance_score || 0))}>
                {supplier.performance_score?.toFixed(1) || 'N/A'}%
              </Badge>
            </div>
            <div>
              <span className="text-gray-600">Risk:</span>
              <Badge className={cn("ml-2 text-xs", getRiskColor(supplier.risk_assessment?.overall_risk || 'medium'))}>
                {(supplier.risk_assessment?.overall_risk || 'medium').toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Reliability Metrics */}
          {supplier.reliability_metrics && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-700">Reliability Metrics:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-600">On-time: </span>
                  <span className="font-medium">{Math.round((supplier.reliability_metrics.on_time_delivery || 0) * 100)}%</span>
                </div>
                <div>
                  <span className="text-gray-600">Quality: </span>
                  <span className="font-medium">{Math.round((supplier.reliability_metrics.quality_score || 0) * 100)}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Contact Info */}
          {supplier.contact_info && (
            <div className="pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-600">
                {supplier.contact_info.email && (
                  <div>📧 {supplier.contact_info.email}</div>
                )}
                {supplier.contact_info.phone && (
                  <div>📞 {supplier.contact_info.phone}</div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
            <Button size="sm" variant="outline" className="flex-1 text-xs">
              📄 View Profile
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              📊 Performance
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              ✏️ Edit
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Supplier List Item Component for List View
function SupplierListItem({ 
  supplier, 
  index, 
  onSelect, 
  getPerformanceColor, 
  getRiskColor, 
  getStatusColor 
}: SupplierCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...motionConfig.spring.swift, delay: index * 0.05 }}
    >
      <Card 
        variant="glass" 
        className="p-4 cursor-pointer transition-all duration-300 hover:shadow-md"
        onClick={() => onSelect(supplier.id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🏢</span>
              <Badge className={cn("text-xs", getStatusColor(supplier.status))}>
                {supplier.status.toUpperCase()}
              </Badge>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800">
                {supplier.name}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                {supplier.categories.slice(0, 2).map((category: string, idx: number) => (
                  <Badge key={idx} className="bg-blue-100 text-blue-800 text-xs">
                    {category}
                  </Badge>
                ))}
                {supplier.categories.length > 2 && (
                  <span className="text-xs text-gray-500">+{supplier.categories.length - 2} more</span>
                )}
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-6 text-sm">
              <div className="text-center">
                <div className="text-gray-600">Performance</div>
                <Badge className={cn("text-xs", getPerformanceColor(supplier.performance_score || 0))}>
                  {supplier.performance_score?.toFixed(1) || 'N/A'}%
                </Badge>
              </div>
              
              <div className="text-center">
                <div className="text-gray-600">Risk</div>
                <Badge className={cn("text-xs", getRiskColor(supplier.risk_assessment?.overall_risk || 'medium'))}>
                  {(supplier.risk_assessment?.overall_risk || 'medium').toUpperCase()}
                </Badge>
              </div>
              
              <div className="text-center">
                <div className="text-gray-600">On-time</div>
                <div className="font-semibold">
                  {Math.round((supplier.reliability_metrics?.on_time_delivery || 0) * 100)}%
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-gray-600">Quality</div>
                <div className="font-semibold">
                  {Math.round((supplier.reliability_metrics?.quality_score || 0) * 100)}%
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" className="text-xs">
              📄 View
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              📊 Analytics
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              ✏️ Edit
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}