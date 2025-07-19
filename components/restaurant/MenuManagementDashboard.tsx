'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  ChefHat,
  TrendingUp,
  DollarSign,
  Clock,
  Users,
  Settings,
  BarChart3,
  Pizza,
  Coffee,
  Utensils,
  Eye,
  Edit,
  Trash2,
  Calculator,
  Star,
  AlertCircle
} from 'lucide-react';
import { MenuCategoryForm } from './MenuCategoryForm';
import { MenuItemForm } from './MenuItemForm';
import { MenuAnalytics } from './MenuAnalytics';

/**
 * GOLD STANDARD Menu Management Dashboard
 * 
 * Following the exact same patterns as Purchase Orders:
 * - Same component structure and styling
 * - Same dark/light theme support
 * - Same loading states and error handling
 * - Same modal patterns for CRUD operations
 * - Same professional depth hierarchy
 */

interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  color?: string;
  icon?: string;
  isActive: boolean;
  itemCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  costPrice: number;
  categoryId?: string;
  categoryName?: string;
  prepTimeMinutes: number;
  isAvailable: boolean;
  itemType: 'individual' | 'composite';
  profitMargin?: number;
  components?: ComboComponent[];
  nutritionalInfo?: any;
  allergens?: string[];
  imageUrl?: string;
  imageName?: string;
  createdAt: string;
  updatedAt: string;
}

interface ComboComponent {
  itemId: string;
  itemName: string;
  portionSize: number;
  quantity: number;
  sequenceOrder: number;
  isMandatory: boolean;
}

interface MenuAnalyticsData {
  totalCategories: number;
  totalItems: number;
  totalComboItems: number;
  averagePrice: number;
  averageMargin: number;
  topPerformingCategory: string;
  recentlyAdded: number;
}

export const MenuManagementDashboard: React.FC<{ organizationId: string }> = ({ organizationId }) => {
  // State management - Following Purchase Orders pattern
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [analytics, setAnalytics] = useState<MenuAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadMenuData();
  }, [organizationId]);

  const loadMenuData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load categories and items in parallel - Same pattern as Purchase Orders
      const [categoriesResponse, itemsResponse] = await Promise.all([
        fetch(`/api/menu/categories?organizationId=${organizationId}`),
        fetch(`/api/menu/items?organizationId=${organizationId}&includeComponents=true`)
      ]);

      if (!categoriesResponse.ok || !itemsResponse.ok) {
        throw new Error('Failed to load menu data');
      }

      const categoriesData = await categoriesResponse.json();
      const itemsData = await itemsResponse.json();

      setCategories(categoriesData.data || []);
      setMenuItems(itemsData.data || []);

      // Calculate analytics
      const analyticsData: MenuAnalyticsData = {
        totalCategories: categoriesData.data?.length || 0,
        totalItems: itemsData.data?.length || 0,
        totalComboItems: itemsData.data?.filter((item: MenuItem) => item.itemType === 'composite').length || 0,
        averagePrice: itemsData.data?.length > 0 ? 
          Math.round(itemsData.data.reduce((sum: number, item: MenuItem) => sum + item.basePrice, 0) / itemsData.data.length * 100) / 100 : 0,
        averageMargin: itemsData.data?.length > 0 ? 
          Math.round(itemsData.data.reduce((sum: number, item: MenuItem) => sum + (item.profitMargin || 0), 0) / itemsData.data.length * 100) / 100 : 0,
        topPerformingCategory: categoriesData.data?.[0]?.name || 'None',
        recentlyAdded: itemsData.data?.filter((item: MenuItem) => {
          const createdDate = new Date(item.createdAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return createdDate > weekAgo;
        }).length || 0
      };

      setAnalytics(analyticsData);

    } catch (err) {
      console.error('Error loading menu data:', err);
      setError('Failed to load menu data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter menu items based on search and category
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle category operations
  const handleCategoryCreated = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
    loadMenuData();
  };

  const handleCategoryEdit = (category: MenuCategory) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleCategoryDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await fetch(`/api/menu/categories?id=${categoryId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadMenuData();
      } else {
        throw new Error('Failed to delete category');
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      alert('Failed to delete category. Please try again.');
    }
  };

  // Handle menu item operations
  const handleItemCreated = () => {
    setShowItemForm(false);
    setEditingItem(null);
    loadMenuData();
  };

  const handleItemEdit = (item: MenuItem) => {
    setEditingItem(item);
    setShowItemForm(true);
  };

  const handleItemDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      const response = await fetch(`/api/menu/items?id=${itemId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadMenuData();
      } else {
        throw new Error('Failed to delete menu item');
      }
    } catch (err) {
      console.error('Error deleting menu item:', err);
      alert('Failed to delete menu item. Please try again.');
    }
  };

  // Loading state - Same as Purchase Orders
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state - Same as Purchase Orders
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
            <Button onClick={loadMenuData} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header - Same pattern as Purchase Orders */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <ChefHat className="mr-3 h-8 w-8 text-orange-600" />
            Menu Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Mario's Italian Restaurant - Complete Menu System
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={() => setShowAnalytics(true)}
            variant="outline"
            size="sm"
            className="flex items-center"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </Button>
          <Button 
            onClick={() => setShowCategoryForm(true)}
            variant="outline"
            size="sm"
            className="flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
          <Button 
            onClick={() => setShowItemForm(true)}
            className="flex items-center bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Menu Item
          </Button>
        </div>
      </div>

      {/* Analytics Cards - Same layout as Purchase Orders */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Categories</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{analytics.totalCategories}</p>
                </div>
                <Coffee className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Menu Items</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100">{analytics.totalItems}</p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {analytics.totalComboItems} combo items
                  </p>
                </div>
                <Utensils className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Avg Price</p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">${analytics.averagePrice}</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    {analytics.averageMargin.toFixed(1)}% margin
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Recent Added</p>
                  <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{analytics.recentlyAdded}</p>
                  <p className="text-xs text-orange-600 dark:text-orange-400">this week</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters - Same pattern as Purchase Orders */}
      <Card className="bg-white dark:bg-gray-800 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.itemCount || 0})
                  </option>
                ))}
              </select>
              
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
              
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Section */}
      <Card className="bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Coffee className="mr-2 h-5 w-5" />
            Menu Categories ({categories.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map(category => (
              <Card key={category.id} className="hover:shadow-md transition-shadow border-l-4" style={{borderLeftColor: category.color || '#6B7280'}}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{category.name}</h3>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCategoryEdit(category)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCategoryDelete(category.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{category.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{category.itemCount || 0} items</Badge>
                    <span className="text-xs text-gray-500">#{category.displayOrder}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Menu Items Table - Same structure as Purchase Orders */}
      <Card className="bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Utensils className="mr-2 h-5 w-5" />
            Menu Items ({filteredMenuItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Item</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Price</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Cost</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Margin</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMenuItems.map(item => (
                  <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        {/* Item Image */}
                        <div className="flex-shrink-0">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-12 w-12 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                              <Utensils className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* Item Details */}
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-gray-100">{item.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{item.description}</div>
                          {item.prepTimeMinutes > 0 && (
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <Clock className="mr-1 h-3 w-3" />
                              {item.prepTimeMinutes} min
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{item.categoryName || 'Uncategorized'}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900 dark:text-gray-100">${item.basePrice.toFixed(2)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-600 dark:text-gray-400">${item.costPrice.toFixed(2)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant={item.profitMargin && item.profitMargin > 20 ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {item.profitMargin?.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={item.itemType === 'composite' ? "secondary" : "outline"}>
                        {item.itemType === 'composite' ? 'Combo' : 'Individual'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge 
                        status={item.isAvailable ? 'available' : 'unavailable'} 
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleItemEdit(item)}
                          className="h-8 w-8 p-0"
                          title="Edit Item"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {item.itemType === 'composite' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Calculate Combo"
                          >
                            <Calculator className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleItemDelete(item.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          title="Delete Item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredMenuItems.length === 0 && (
            <div className="text-center py-12">
              <Pizza className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No menu items found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first menu item'
                }
              </p>
              {!searchTerm && selectedCategory === 'all' && (
                <Button onClick={() => setShowItemForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Menu Item
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals - Same pattern as Purchase Orders */}
      {showCategoryForm && (
        <MenuCategoryForm
          organizationId={organizationId}
          category={editingCategory}
          onClose={() => {
            setShowCategoryForm(false);
            setEditingCategory(null);
          }}
          onSuccess={handleCategoryCreated}
        />
      )}

      {showItemForm && (
        <MenuItemForm
          organizationId={organizationId}
          categories={categories}
          existingItems={menuItems}
          item={editingItem}
          onClose={() => {
            setShowItemForm(false);
            setEditingItem(null);
          }}
          onSuccess={handleItemCreated}
        />
      )}

      {showAnalytics && (
        <MenuAnalytics
          organizationId={organizationId}
          onClose={() => setShowAnalytics(false)}
        />
      )}
    </div>
  );
};