/**
 * HERA Universal - Purchase Order Dashboard
 * 
 * Professional dark/light theme with depth hierarchy
 * Real-time data integration with Mario's restaurant
 */

'use client';

import { useState, useEffect } from 'react';
import { Plus, Filter, Download, Search, Eye, Edit, Trash2, ShoppingCart, DollarSign, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { PurchaseOrderForm } from './PurchaseOrderForm';
import { PurchaseOrderTable } from './PurchaseOrderTable';
import { MetricsCard } from '@/components/ui/MetricsCard';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/SearchInput';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface PurchaseOrderDashboardProps {
  organizationId: string;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'auto_approved' | 'pending_approval';
  createdAt: string;
  requestedDeliveryDate?: string;
  items: Array<{
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

interface DashboardMetrics {
  totalOrders: number;
  pendingApproval: number;
  totalValue: number;
  autoApproved: number;
}

export function PurchaseOrderDashboard({ organizationId }: PurchaseOrderDashboardProps) {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch purchase orders
  const fetchPurchaseOrders = async () => {
    try {
      const response = await fetch(`/api/purchasing/purchase-orders?organizationId=${organizationId}`);
      if (response.ok) {
        const data = await response.json();
        setPurchaseOrders(data.data || []);
        
        // Calculate metrics
        const orders = data.data || [];
        const totalValue = orders.reduce((sum: number, order: PurchaseOrder) => sum + order.totalAmount, 0);
        const pendingApproval = orders.filter((order: PurchaseOrder) => order.status === 'pending_approval').length;
        const autoApproved = orders.filter((order: PurchaseOrder) => order.status === 'auto_approved').length;
        
        setMetrics({
          totalOrders: orders.length,
          pendingApproval,
          totalValue,
          autoApproved
        });
      }
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, [organizationId]);

  // Filter purchase orders
  const filteredOrders = purchaseOrders.filter(order => {
    const safePoNumber = order.poNumber || '';
    const safeSupplierName = order.supplierName || '';
    const safeSearchTerm = searchTerm || '';
    
    const matchesSearch = safePoNumber.toLowerCase().includes(safeSearchTerm.toLowerCase()) ||
                         safeSupplierName.toLowerCase().includes(safeSearchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOrderCreated = () => {
    setShowForm(false);
    fetchPurchaseOrders(); // Refresh the list
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton for metrics */}
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
      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricsCard
            title="Total Orders"
            value={metrics.totalOrders.toString()}
            icon={ShoppingCart}
            trend="+12% from last month"
            color="blue"
          />
          <MetricsCard
            title="Pending Approval"
            value={metrics.pendingApproval.toString()}
            icon={Clock}
            trend={metrics.pendingApproval > 0 ? "Requires attention" : "All caught up"}
            color={metrics.pendingApproval > 0 ? "orange" : "green"}
          />
          <MetricsCard
            title="Total Value"
            value={`$${metrics.totalValue.toLocaleString()}`}
            icon={DollarSign}
            trend="+8% from last month"
            color="green"
          />
          <MetricsCard
            title="Auto Approved"
            value={metrics.autoApproved.toString()}
            icon={CheckCircle}
            trend="Under $75 threshold"
            color="green"
          />
        </div>
      )}

      {/* Actions Bar */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <SearchInput
              placeholder="Search purchase orders..."
              value={searchTerm}
              onChange={setSearchTerm}
              className="w-full sm:w-64"
            />
            
            <div className="flex items-center space-x-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              >
                <option value="all">All Status</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="auto_approved">Auto Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Purchase Order
            </Button>
          </div>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-colors duration-200">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Purchase Orders ({filteredOrders.length})
          </h3>
        </div>
        
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No purchase orders found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Get started by creating your first purchase order'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Purchase Order
              </Button>
            )}
          </div>
        ) : (
          <PurchaseOrderTable 
            orders={filteredOrders}
            organizationId={organizationId}
            onRefresh={fetchPurchaseOrders}
          />
        )}
      </div>

      {/* Create Purchase Order Modal */}
      {showForm && (
        <PurchaseOrderForm
          organizationId={organizationId}
          onClose={() => setShowForm(false)}
          onSuccess={handleOrderCreated}
        />
      )}
    </div>
  );
}