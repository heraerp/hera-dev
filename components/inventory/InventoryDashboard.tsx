/**
 * HERA Universal - Inventory Dashboard
 * 
 * Professional dark/light theme with depth hierarchy
 * Real-time inventory tracking and alerts
 */

'use client';

import { useState, useEffect } from 'react';
import { Plus, Filter, Download, Search, Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { InventoryItemsGrid } from './InventoryItemsGrid';
import { InventoryAlertsPanel } from './InventoryAlertsPanel';
import { InventoryItemForm } from './InventoryItemForm';
import { MetricsCard } from '@/components/ui/MetricsCard';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/SearchInput';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface InventoryDashboardProps {
  organizationId: string;
}

interface InventoryItem {
  id: string;
  name: string;
  code: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  reorderPoint: number;
  maxStockLevel: number;
  unitOfMeasure: string;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock';
  lastUpdated: string;
}

interface InventoryAlert {
  id: string;
  name: string;
  alertType: 'out_of_stock' | 'low_stock' | 'overstock' | 'slow_moving' | 'fast_moving' | 'expiring_soon';
  urgency: 'high' | 'medium' | 'low';
  currentStock: number;
  suggestedAction: string;
}

interface InventoryMetrics {
  totalItems: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
}

export function InventoryDashboard({ organizationId }: InventoryDashboardProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [metrics, setMetrics] = useState<InventoryMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch inventory data
  const fetchInventoryData = async () => {
    try {
      const [itemsResponse, alertsResponse] = await Promise.all([
        fetch(`/api/inventory/items?organizationId=${organizationId}&limit=50`),
        fetch(`/api/inventory/items/alerts?organizationId=${organizationId}`)
      ]);

      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json();
        setItems(itemsData.data || []);
        
        // Set metrics from summary
        if (itemsData.summary) {
          setMetrics({
            totalItems: itemsData.summary.total,
            inStock: itemsData.summary.inStock,
            lowStock: itemsData.summary.lowStock,
            outOfStock: itemsData.summary.outOfStock,
            totalValue: itemsData.summary.totalValue
          });
        }
      }

      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData.data || []);
      }
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, [organizationId]);

  // Filter items
  const filteredItems = items.filter(item => {
    const safeName = item.name || '';
    const safeCode = item.code || '';
    const safeSearchTerm = searchTerm || '';
    
    const matchesSearch = safeName.toLowerCase().includes(safeSearchTerm.toLowerCase()) ||
                         safeCode.toLowerCase().includes(safeSearchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.stockStatus === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique categories
  const categories = Array.from(new Set(items.map(item => item.category || 'Uncategorized').filter(Boolean)));

  // Priority alerts
  const priorityAlerts = alerts.filter(alert => alert.urgency === 'high').slice(0, 3);

  // Handle item creation
  const handleItemCreated = (itemName?: string) => {
    setShowAddForm(false);
    fetchInventoryData(); // Refresh the list
    
    if (itemName) {
      console.log(`✅ Inventory Item Created: ${itemName}`);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-3"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Priority Alerts */}
      {priorityAlerts.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
              {priorityAlerts.length} urgent inventory alert{priorityAlerts.length > 1 ? 's' : ''} require attention
            </h3>
          </div>
        </div>
      )}

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricsCard
            title="Total Items"
            value={metrics.totalItems.toString()}
            icon={Package}
            trend="+5 new this month"
            color="blue"
          />
          <MetricsCard
            title="In Stock"
            value={metrics.inStock.toString()}
            icon={TrendingUp}
            trend="85% of inventory"
            color="green"
          />
          <MetricsCard
            title="Low Stock"
            value={metrics.lowStock.toString()}
            icon={TrendingDown}
            trend={metrics.lowStock > 0 ? "Needs attention" : "All good"}
            color={metrics.lowStock > 0 ? "orange" : "green"}
          />
          <MetricsCard
            title="Total Value"
            value={`$${metrics.totalValue.toLocaleString()}`}
            icon={TrendingUp}
            trend="+12% from last month"
            color="green"
          />
        </div>
      )}

      {/* Actions Bar */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <SearchInput
              placeholder="Search inventory items..."
              value={searchTerm}
              onChange={setSearchTerm}
              className="w-full sm:w-64"
            />
            
            <div className="flex items-center space-x-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              >
                <option value="all">All Status</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="overstock">Overstock</option>
              </select>
              
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            
            <Button onClick={() => setShowAddForm(true)} className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Inventory Grid */}
        <div className="lg:col-span-3">
          <InventoryItemsGrid 
            items={filteredItems}
            onRefresh={fetchInventoryData}
          />
        </div>

        {/* Alerts Panel */}
        <div className="lg:col-span-1">
          <InventoryAlertsPanel alerts={alerts} />
        </div>
      </div>

      {/* Add Item Form Modal */}
      {showAddForm && (
        <InventoryItemForm
          organizationId={organizationId}
          onClose={() => setShowAddForm(false)}
          onSuccess={handleItemCreated}
        />
      )}
    </div>
  );
}