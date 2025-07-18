/**
 * Enhanced Inventory Management System
 * Complete ingredient inventory with stock tracking, suppliers, and real-time alerts
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp,
  Search, 
  Filter,
  Plus,
  Minus,
  Upload,
  Download,
  Calendar,
  DollarSign,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  RefreshCw,
  FileText,
  Users,
  Settings,
  Activity,
  MapPin,
  ThermometerSun,
  ShoppingCart,
  BarChart3,
  TrendingDownIcon,
  Eye
} from 'lucide-react';
import { UniversalBulkUpload } from '@/components/ui/universal-bulk-upload';
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement';
import InventoryManagementService, { 
  InventoryItem, 
  InventoryAlert, 
  StockAdjustment 
} from '@/lib/services/inventoryManagementService';

interface InventorySummary {
  total_items: number;
  total_value: number;
  low_stock_items: number;
  out_of_stock_items: number;
  expiring_items: number;
  categories: { name: string; count: number; value: number }[];
  top_suppliers: { name: string; items: number; value: number }[];
}

export default function InventoryManagementPage() {
  const { restaurantData, loading, error } = useRestaurantManagement();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);
  const [inventorySummary, setInventorySummary] = useState<InventorySummary | null>(null);
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove' | 'adjust'>('add');

  // Get organization ID
  const organizationId = restaurantData?.organizationId;

  // Fetch inventory data
  const fetchInventoryData = async () => {
    if (!organizationId) return;

    setIsLoading(true);
    try {
      const [itemsResult, alertsResult, summaryResult, adjustmentsResult] = await Promise.all([
        InventoryManagementService.getInventoryItems(organizationId),
        InventoryManagementService.getInventoryAlerts(organizationId),
        InventoryManagementService.getInventorySummary(organizationId),
        InventoryManagementService.getStockAdjustments(organizationId)
      ]);

      if (itemsResult.success) setInventoryItems(itemsResult.data || []);
      if (alertsResult.success) setInventoryAlerts(alertsResult.data || []);
      if (summaryResult.success) setInventorySummary(summaryResult.data || null);
      if (adjustmentsResult.success) setStockAdjustments(adjustmentsResult.data || []);

    } catch (error) {
      console.error('Error fetching inventory data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, [organizationId]);

  // Handle bulk upload complete
  const handleBulkUploadComplete = () => {
    fetchInventoryData();
    setShowBulkUpload(false);
  };

  // Handle stock adjustment
  const handleStockAdjustment = async () => {
    if (!selectedItem || !organizationId || adjustmentQuantity === 0) return;

    try {
      const stockChange = adjustmentType === 'remove' ? -Math.abs(adjustmentQuantity) : Math.abs(adjustmentQuantity);
      
      const result = await InventoryManagementService.updateStock(
        organizationId,
        selectedItem.id,
        {
          quantity_change: stockChange,
          adjustment_type: 'manual',
          reason: adjustmentReason || `Manual ${adjustmentType}`,
          notes: `${adjustmentType === 'add' ? 'Added' : 'Removed'} ${Math.abs(adjustmentQuantity)} ${selectedItem.unit}`
        }
      );

      if (result.success) {
        await fetchInventoryData();
        setShowAdjustmentModal(false);
        setSelectedItem(null);
        setAdjustmentQuantity(0);
        setAdjustmentReason('');
        setAdjustmentType('add');
      }
    } catch (error) {
      console.error('Error adjusting stock:', error);
    }
  };

  // Filter inventory items
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique categories
  const categories = Array.from(new Set(inventoryItems.map(item => item.category)));

  // Get status badge color
  const getStatusBadge = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in_stock':
        return <Badge className="bg-green-100 text-green-800 border-green-200">In Stock</Badge>;
      case 'low_stock':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Low Stock</Badge>;
      case 'out_of_stock':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Out of Stock</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Expired</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  // Get alert severity icon
  const getAlertIcon = (severity: InventoryAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  // Get alert severity class
  const getAlertClass = (severity: InventoryAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'border-red-200 bg-red-50';
      case 'high':
        return 'border-orange-200 bg-orange-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!restaurantData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">No Restaurant Found</h2>
          <p className="text-gray-600">Please set up your restaurant first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              Inventory Management
            </h1>
            <p className="text-gray-600 mt-1">Complete ingredient inventory with real-time tracking</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowBulkUpload(true)}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Bulk Upload
            </Button>
            <Button 
              variant="outline" 
              onClick={fetchInventoryData}
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Ingredient
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-white/80 backdrop-blur border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventorySummary?.total_items || 0}</div>
              <p className="text-xs text-muted-foreground">
                Ingredients in inventory
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${inventorySummary?.total_value?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                Current inventory value
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <TrendingDown className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {inventorySummary?.low_stock_items || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Items below minimum
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {inventorySummary?.out_of_stock_items || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Items unavailable
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {inventorySummary?.expiring_items || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Items expiring within 7 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {inventoryAlerts.length > 0 && (
          <Card className="bg-white/80 backdrop-blur border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Inventory Alerts ({inventoryAlerts.length})
              </CardTitle>
              <CardDescription>
                Items requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {inventoryAlerts.slice(0, 5).map((alert) => (
                  <Alert key={alert.id} className={getAlertClass(alert.severity)}>
                    <div className="flex items-center gap-3">
                      {getAlertIcon(alert.severity)}
                      <div className="flex-1">
                        <AlertDescription>
                          {alert.message}
                        </AlertDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recent Adjustments */}
              <Card className="bg-white/80 backdrop-blur border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Recent Adjustments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stockAdjustments.slice(0, 5).map((adjustment) => (
                      <div key={adjustment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            adjustment.quantity_change > 0 ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <div>
                            <p className="font-medium text-sm">
                              {inventoryItems.find(i => i.id === adjustment.inventory_id)?.name || 'Unknown'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {adjustment.adjustment_type} • {adjustment.reason}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium text-sm ${
                            adjustment.quantity_change > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {adjustment.quantity_change > 0 ? '+' : ''}{adjustment.quantity_change}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(adjustment.adjusted_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white/80 backdrop-blur border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-purple-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setShowBulkUpload(true)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Bulk Upload Ingredients
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('adjustments')}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Review Adjustments
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('analytics')}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-4">
            {/* Filters */}
            <Card className="bg-white/80 backdrop-blur border-gray-200">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search ingredients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <select 
                      value={selectedCategory} 
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 border rounded-md bg-white"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>

                    <select 
                      value={selectedStatus} 
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="px-3 py-2 border rounded-md bg-white"
                    >
                      <option value="all">All Status</option>
                      <option value="in_stock">In Stock</option>
                      <option value="low_stock">Low Stock</option>
                      <option value="out_of_stock">Out of Stock</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inventory Table */}
            <Card className="bg-white/80 backdrop-blur border-gray-200">
              <CardHeader>
                <CardTitle>Inventory Items ({filteredItems.length})</CardTitle>
                <CardDescription>
                  Current stock levels and ingredient information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ingredient</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Min Level</TableHead>
                        <TableHead>Unit Cost</TableHead>
                        <TableHead>Total Value</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {item.storage_location}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <div className={`font-medium ${
                                item.current_stock <= item.min_stock_level 
                                  ? 'text-red-600' 
                                  : 'text-green-600'
                              }`}>
                                {item.current_stock}
                              </div>
                              <div className="text-xs text-gray-500">{item.unit}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <div className="font-medium">{item.min_stock_level}</div>
                              <div className="text-xs text-gray-500">{item.unit}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <div className="font-medium">${item.cost_per_unit}</div>
                              <div className="text-xs text-gray-500">per {item.unit}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">${item.total_value.toFixed(2)}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{item.supplier_name}</div>
                              {item.supplier_sku && (
                                <div className="text-gray-500">SKU: {item.supplier_sku}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(item.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setAdjustmentType('add');
                                  setShowAdjustmentModal(true);
                                }}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setAdjustmentType('remove');
                                  setShowAdjustmentModal(true);
                                }}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stock Adjustments Tab */}
          <TabsContent value="adjustments" className="space-y-4">
            <Card className="bg-white/80 backdrop-blur border-gray-200">
              <CardHeader>
                <CardTitle>Stock Adjustment History</CardTitle>
                <CardDescription>
                  Complete history of all stock level changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Ingredient</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Change</TableHead>
                        <TableHead>Previous</TableHead>
                        <TableHead>New</TableHead>
                        <TableHead>Cost Impact</TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stockAdjustments.map((adjustment) => (
                        <TableRow key={adjustment.id}>
                          <TableCell>
                            {new Date(adjustment.adjusted_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {inventoryItems.find(i => i.id === adjustment.inventory_id)?.name || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{adjustment.adjustment_type}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className={`font-medium ${
                              adjustment.quantity_change > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {adjustment.quantity_change > 0 ? '+' : ''}{adjustment.quantity_change}
                            </span>
                          </TableCell>
                          <TableCell>{adjustment.previous_stock}</TableCell>
                          <TableCell>{adjustment.new_stock}</TableCell>
                          <TableCell>
                            <span className={`font-medium ${
                              adjustment.total_cost > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              ${Math.abs(adjustment.total_cost).toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>{adjustment.reason}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Categories */}
              <Card className="bg-white/80 backdrop-blur border-gray-200">
                <CardHeader>
                  <CardTitle>Inventory by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {inventorySummary?.categories.map((category) => (
                      <div key={category.name} className="flex justify-between items-center p-2 border rounded">
                        <span className="font-medium">{category.name}</span>
                        <div className="text-right">
                          <div className="font-medium">${category.value.toFixed(2)}</div>
                          <div className="text-sm text-gray-500">{category.count} items</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Suppliers */}
              <Card className="bg-white/80 backdrop-blur border-gray-200">
                <CardHeader>
                  <CardTitle>Top Suppliers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {inventorySummary?.top_suppliers.map((supplier) => (
                      <div key={supplier.name} className="flex justify-between items-center p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{supplier.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${supplier.value.toFixed(2)}</div>
                          <div className="text-sm text-gray-500">{supplier.items} items</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Stock Adjustment Modal */}
        {showAdjustmentModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {adjustmentType === 'add' ? 'Add Stock' : 'Remove Stock'}: {selectedItem.name}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Current Stock</label>
                  <div className="text-lg font-medium">
                    {selectedItem.current_stock} {selectedItem.unit}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {adjustmentType === 'add' ? 'Add' : 'Remove'} Quantity
                  </label>
                  <Input
                    type="number"
                    value={adjustmentQuantity}
                    onChange={(e) => setAdjustmentQuantity(Number(e.target.value))}
                    placeholder="Enter quantity"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Reason</label>
                  <Input
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    placeholder="Reason for adjustment"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAdjustmentModal(false);
                      setSelectedItem(null);
                      setAdjustmentQuantity(0);
                      setAdjustmentReason('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleStockAdjustment}
                    disabled={adjustmentQuantity <= 0}
                  >
                    {adjustmentType === 'add' ? 'Add' : 'Remove'} Stock
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Universal Bulk Upload Dialog */}
        {showBulkUpload && organizationId && (
          <UniversalBulkUpload
            isOpen={showBulkUpload}
            onClose={() => setShowBulkUpload(false)}
            organizationId={organizationId}
            onUploadComplete={handleBulkUploadComplete}
            entityTypes={['ingredients', 'suppliers']}
            defaultEntityType="ingredients"
            title="Bulk Upload Inventory"
            description="Upload ingredients and suppliers from Excel files"
          />
        )}
      </div>
    </div>
  );
}