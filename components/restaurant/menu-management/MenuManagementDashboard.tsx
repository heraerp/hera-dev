/**
 * Menu Management Dashboard - Toyota Production System Implementation
 * Standardized Work + Jidoka + Just-in-Time + Poka-yoke
 */

"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useOrganizationContext } from '@/components/restaurant/organization-guard';
import MenuCategoryModal from './MenuCategoryModal';
import MenuItemModal from './MenuItemModal';
import MenuItemMetadataDisplay from './MenuItemMetadataDisplay';
import MenuItemMetadataModal from './MenuItemMetadataModal';
import ComboModal from './ComboModal';
import { UniversalBulkUpload } from '@/components/ui/universal-bulk-upload';
import { 
  MenuManagementService, 
  MenuCategory, 
  MenuItem, 
  MenuModifierGroup, 
  MenuModifier,
  MENU_ENTITY_TYPES,
  MENU_METADATA_TYPES
} from '@/lib/services/menuManagementService';
import UniversalCrudService from '@/lib/services/universalCrudService';
import {
  ChefHat,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  DollarSign,
  Clock,
  Star,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Image,
  Tag,
  Utensils,
  Grid3x3,
  List,
  Filter,
  Search,
  Settings,
  Save,
  X,
  ArrowUp,
  ArrowDown,
  Coffee,
  Pizza,
  Salad,
  Soup,
  Dessert,
  Wine,
  Sandwich,
  ShoppingCart,
  FileSpreadsheet,
  Upload
} from 'lucide-react';

interface MenuManagementDashboardProps {
  organizationId: string;
}

export default function MenuManagementDashboard({ organizationId }: MenuManagementDashboardProps) {
  const [menuService, setMenuService] = useState<MenuManagementService | null>(null);
  const [activeTab, setActiveTab] = useState<'categories' | 'items' | 'combos' | 'modifiers' | 'pricing'>('categories');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [combos, setCombos] = useState<any[]>([]);
  const [modifierGroups, setModifierGroups] = useState<MenuModifierGroup[]>([]);
  const [modifiers, setModifiers] = useState<MenuModifier[]>([]);
  
  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showInactive, setShowInactive] = useState(false);
  
  // Modal states
  const [categoryModal, setCategoryModal] = useState<{
    open: boolean;
    category?: MenuCategory;
    mode: 'create' | 'edit';
  }>({ open: false, mode: 'create' });
  
  const [itemModal, setItemModal] = useState<{
    open: boolean;
    item?: MenuItem;
    mode: 'create' | 'edit';
  }>({ open: false, mode: 'create' });
  
  const [modifierModal, setModifierModal] = useState<{
    open: boolean;
    group?: MenuModifierGroup;
    mode: 'create' | 'edit';
  }>({ open: false, mode: 'create' });

  const [comboModal, setComboModal] = useState<{
    open: boolean;
    combo?: any;
    mode: 'create' | 'edit';
  }>({ open: false, mode: 'create' });

  const [metadataModal, setMetadataModal] = useState<{
    open: boolean;
    item?: MenuItem;
    metadataType: string;
  }>({ open: false, metadataType: '' });

  const [selectedItemForDetails, setSelectedItemForDetails] = useState<MenuItem | null>(null);
  
  // Bulk upload modal states
  const [bulkUploadModal, setBulkUploadModal] = useState(false);
  const [categoriesBulkUploadModal, setCategoriesBulkUploadModal] = useState(false);

  // Initialize menu service
  useEffect(() => {
    if (organizationId) {
      console.log('🔧 Initializing Menu Management Service...');
      const service = MenuManagementService.getInstance(organizationId);
      setMenuService(service);
      loadMenuData(service);
    }
  }, [organizationId]);

  const loadMenuData = async (service: MenuManagementService) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📋 Loading menu data...');
      
      // Load all menu data in parallel - using enhanced methods with metadata
      const [categoriesResult, itemsResult, combosResult, modifierGroupsResult] = await Promise.all([
        service.getCategories(showInactive),
        service.getMenuItemsWithMetadata(undefined, showInactive),
        service.getCombos(showInactive),
        service.getModifierGroups(showInactive)
      ]);

      if (categoriesResult.success && categoriesResult.data) {
        setCategories(categoriesResult.data);
        console.log('✅ Categories loaded successfully');
        console.log('📊 Categories updated:', categoriesResult.data.length, 'categories');
      }

      if (itemsResult.success && itemsResult.data) {
        setMenuItems(itemsResult.data);
        console.log('✅ Menu items with metadata loaded successfully');
      }

      if (combosResult.success && combosResult.data) {
        setCombos(combosResult.data);
        console.log('✅ Combos loaded successfully');
      }

      if (modifierGroupsResult.success && modifierGroupsResult.data) {
        setModifierGroups(modifierGroupsResult.data);
        console.log('✅ Modifier groups loaded successfully');
      }

    } catch (error) {
      console.error('❌ Menu data loading failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to load menu data');
    } finally {
      setLoading(false);
    }
  };

  // Filter menu items based on search and category
  const filteredMenuItems = menuItems.filter(item => {
    const itemName = item.entity_name || item.name || '';
    const itemDescription = item.description || '';
    const matchesSearch = itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         itemDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
    const matchesActive = showInactive || item.is_active;
    return matchesSearch && matchesCategory && matchesActive;
  });

  // Icon mapping for categories
  const iconMapping: Record<string, any> = {
    coffee: Coffee,
    pizza: Pizza,
    salad: Salad,
    soup: Soup,
    dessert: Dessert,
    wine: Wine,
    sandwich: Sandwich,
    utensils: Utensils,
    chefhat: ChefHat,
    star: Star
  };

  // Get category icon with fallback logic
  const getCategoryIcon = (category: MenuCategory) => {
    // First, check if category has a specific icon set
    if (category.icon && iconMapping[category.icon.toLowerCase()]) {
      return iconMapping[category.icon.toLowerCase()];
    }
    
    // Otherwise, use name-based matching
    if (!category.entity_name && !category.name) return Utensils;
    
    const name = (category.entity_name || category.name || '').toLowerCase();
    
    // Check for keywords in name
    if (name.includes('coffee') || name.includes('tea') || name.includes('drink')) return Coffee;
    if (name.includes('pizza')) return Pizza;
    if (name.includes('salad')) return Salad;
    if (name.includes('soup')) return Soup;
    if (name.includes('dessert') || name.includes('sweet') || name.includes('cake')) return Dessert;
    if (name.includes('sandwich') || name.includes('bread') || name.includes('bakery')) return Sandwich;
    if (name.includes('pasta') || name.includes('noodle') || name.includes('main')) return Utensils;
    if (name.includes('whiskey') || name.includes('beer') || name.includes('beverage') || name.includes('wine') || name.includes('alcohol')) return Wine;
    if (name.includes('special') || name.includes('featured')) return Star;
    if (name.includes('chef')) return ChefHat;
    
    // Default fallback
    return Utensils;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get dietary restriction badges
  const getDietaryBadges = (item: MenuItem) => {
    const badges = [];
    if (item.is_vegetarian) badges.push({ label: 'Vegetarian', color: 'bg-green-100 text-green-800' });
    if (item.is_vegan) badges.push({ label: 'Vegan', color: 'bg-emerald-100 text-emerald-800' });
    if (item.is_gluten_free) badges.push({ label: 'Gluten-Free', color: 'bg-blue-100 text-blue-800' });
    if (item.spice_level) badges.push({ 
      label: `${item.spice_level} Spice`, 
      color: 'bg-red-100 text-red-800' 
    });
    return badges;
  };

  // Render combos tab
  const renderCombosTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Combo Offers</h2>
          <p className="text-gray-600">Create and manage combo meal offers with automatic pricing</p>
        </div>
        <Button 
          onClick={() => setComboModal({ open: true, mode: 'create' })}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Combo
        </Button>
      </div>

      {/* Combos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {combos.map((combo) => (
          <motion.div
            key={combo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Combo Header */}
            <div className="p-4 bg-gradient-to-r from-orange-500 to-red-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">{combo.entity_name || combo.name}</h3>
                  <p className="text-sm opacity-90">{combo.description}</p>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  Combo
                </Badge>
              </div>
            </div>

            {/* Pricing Information */}
            <div className="p-4 bg-gray-50">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(combo.combo_price || combo.analysis?.pricing_analysis?.combo_price || 0)}
                  </div>
                  <div className="text-xs text-gray-600">Combo Price</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-red-600">
                    {formatCurrency(combo.savings || combo.analysis?.pricing_analysis?.savings || 0)}
                  </div>
                  <div className="text-xs text-gray-600">You Save</div>
                </div>
              </div>
              
              {combo.savings_percentage && (
                <div className="mt-2 text-center">
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    {combo.savings_percentage}% OFF
                  </Badge>
                </div>
              )}
            </div>

            {/* Components */}
            <div className="p-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Includes:</div>
              {combo.analysis?.components ? (
                <div className="space-y-1">
                  {combo.analysis.components.map((component, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                      <span>{component.quantity}x {component.item}</span>
                      <span className="ml-auto text-gray-500">
                        {formatCurrency(component.individual_price)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">Loading components...</div>
              )}
            </div>

            {/* Actions */}
            <div className="p-4 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant={combo.is_active ? "default" : "secondary"}>
                  {combo.is_active ? 'Active' : 'Inactive'}
                </Badge>
                {combo.analysis?.business_intelligence?.value_proposition && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    {combo.analysis.business_intelligence.value_proposition}
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setComboModal({ 
                    open: true, 
                    combo, 
                    mode: 'edit' 
                  })}
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleComboAvailability(combo.id!, !combo.is_active)}
                >
                  {combo.is_active ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {combos.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">No combo offers yet</p>
          <p className="text-gray-400 text-sm">Create your first combo to boost sales</p>
        </div>
      )}
    </div>
  );

  // Render categories tab
  const renderCategoriesTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Menu Categories</h2>
          <p className="text-gray-600">Organize your menu with categories and subcategories</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setCategoriesBulkUploadModal(true)}
            className="flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Bulk Upload</span>
          </Button>
          <Button 
            onClick={() => setCategoryModal({ open: true, mode: 'create' })}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const IconComponent = getCategoryIcon(category);
          const itemCount = menuItems.filter(item => item.category_id === category.id).length;
          
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{category.entity_name || category.name}</h3>
                    <p className="text-sm text-gray-500">{itemCount} items</p>
                  </div>
                </div>
                <Badge variant={category.is_active ? "default" : "secondary"}>
                  {category.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              {category.description && (
                <p className="text-sm text-gray-600 mb-4">{category.description}</p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Order: {category.display_order}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCategoryModal({ 
                      open: true, 
                      category, 
                      mode: 'edit' 
                    })}
                  >
                    <Edit3 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirm(`Delete category "${category.name}"?`)) {
                        handleDeleteCategory(category.id!);
                      }
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <Grid3x3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">No categories yet</p>
          <p className="text-gray-400 text-sm">Create your first menu category to get started</p>
        </div>
      )}
    </div>
  );

  // Render menu items tab
  const renderMenuItemsTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Menu Items</h2>
          <p className="text-gray-600">Manage your menu items with pricing and descriptions</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3x3 className="w-4 h-4" />}
          </Button>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setBulkUploadModal(true)}
            className="flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Bulk Upload</span>
          </Button>
          <Button 
            onClick={() => setItemModal({ open: true, mode: 'create' })}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.entity_name || category.name}
            </option>
          ))}
        </select>
        
        <div className="flex items-center space-x-2">
          <Switch 
            checked={showInactive}
            onCheckedChange={setShowInactive}
          />
          <Label>Show Inactive</Label>
        </div>
      </div>

      {/* Menu Items */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMenuItems.map((item) => {
            const category = categories.find(c => c.id === item.category_id);
            const dietaryBadges = getDietaryBadges(item);
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Item Image */}
                <div className="h-48 bg-gray-100 flex items-center justify-center">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.entity_name || item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                
                {/* Item Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.entity_name || item.name}</h3>
                      <p className="text-sm text-gray-500">{category?.entity_name || category?.name}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {item.is_featured && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      )}
                      <Badge variant={item.is_active ? "default" : "secondary"}>
                        {item.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                  
                  {/* Dietary Badges */}
                  {dietaryBadges.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {dietaryBadges.map((badge) => (
                        <Badge key={badge.label} className={`text-xs ${badge.color}`}>
                          {badge.label}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {/* Price and Timing */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-green-600">
                        {formatCurrency(item.base_price)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{item.preparation_time}m</span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setItemModal({ 
                          open: true, 
                          item, 
                          mode: 'edit' 
                        })}
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleItemAvailability(item.id!, !item.is_active)}
                      >
                        {item.is_active ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedItemForDetails(item)}
                        title="View details"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                    <span className="text-xs text-gray-500">#{item.display_order}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredMenuItems.map((item) => {
            const category = categories.find(c => c.id === item.category_id);
            const dietaryBadges = getDietaryBadges(item);
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.entity_name || item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Image className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{item.entity_name || item.name}</h3>
                        {item.is_featured && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                        <Badge variant={item.is_active ? "default" : "secondary"}>
                          {item.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">{category?.entity_name || category?.name}</p>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      
                      {/* Dietary Badges */}
                      {dietaryBadges.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {dietaryBadges.map((badge) => (
                            <Badge key={badge.label} className={`text-xs ${badge.color}`}>
                              {badge.label}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(item.base_price)}
                      </p>
                      <p className="text-sm text-gray-500">{item.preparation_time}m prep</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setItemModal({ 
                          open: true, 
                          item, 
                          mode: 'edit' 
                        })}
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleItemAvailability(item.id!, !item.is_active)}
                      >
                        {item.is_active ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedItemForDetails(item)}
                        title="View details"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {filteredMenuItems.length === 0 && (
        <div className="text-center py-12">
          <Utensils className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">No menu items found</p>
          <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );

  // Handle category deletion
  const handleDeleteCategory = async (categoryId: string) => {
    if (!menuService) return;
    
    try {
      console.log('🗑️ Attempting to delete category:', categoryId);
      const result = await menuService.deleteCategory(categoryId);
      console.log('✅ Delete result:', result);
      
      // Show success message
      setError(null);
      console.log('✅ Category deleted successfully, refreshing data...');
      
      // Reload data
      await loadMenuData(menuService);
    } catch (error) {
      console.error('❌ Delete category error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete category';
      setError(errorMessage);
      
      // Show alert to user
      alert(`Failed to delete category: ${errorMessage}`);
    }
  };

  // Handle item availability toggle
  const toggleItemAvailability = async (itemId: string, available: boolean) => {
    if (!menuService) return;
    
    try {
      await menuService.toggleMenuItemAvailability(itemId, available);
      await loadMenuData(menuService);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update item availability');
    }
  };

  // Handle combo availability toggle
  const toggleComboAvailability = async (comboId: string, available: boolean) => {
    if (!menuService) return;
    
    try {
      await UniversalCrudService.updateEntity(
        menuService.organizationId,
        comboId,
        { is_active: available }
      );
      await loadMenuData(menuService);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update combo availability');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading menu management...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            Menu Management
          </h1>
          <p className="text-gray-600 mt-1">Organize and manage your restaurant menu</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            {categories.length} Categories
          </Badge>
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            <Utensils className="w-4 h-4 mr-1" />
            {menuItems.length} Items
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => loadMenuData(menuService!)}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { key: 'categories', label: 'Categories', icon: Grid3x3 },
          { key: 'items', label: 'Menu Items', icon: Utensils },
          { key: 'combos', label: 'Combo Offers', icon: ShoppingCart },
          { key: 'modifiers', label: 'Modifiers', icon: Settings },
          { key: 'pricing', label: 'Pricing Rules', icon: DollarSign }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'categories' && renderCategoriesTab()}
        {activeTab === 'items' && renderMenuItemsTab()}
        {activeTab === 'combos' && renderCombosTab()}
        {activeTab === 'modifiers' && (
          <div className="text-center py-12">
            <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">Modifier Management</p>
            <p className="text-gray-400 text-sm">Coming soon...</p>
          </div>
        )}
        {activeTab === 'pricing' && (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">Pricing Rules</p>
            <p className="text-gray-400 text-sm">Coming soon...</p>
          </div>
        )}
      </AnimatePresence>

      {/* Modals */}
      {menuService && (
        <>
          {/* Category Modal */}
          <MenuCategoryModal
            open={categoryModal.open}
            onClose={() => setCategoryModal({ open: false, mode: 'create' })}
            onSave={() => loadMenuData(menuService)}
            category={categoryModal.category}
            mode={categoryModal.mode}
            menuService={menuService}
          />

          {/* Item Modal */}
          <MenuItemModal
            open={itemModal.open}
            onClose={() => setItemModal({ open: false, mode: 'create' })}
            onSave={() => loadMenuData(menuService)}
            item={itemModal.item}
            mode={itemModal.mode}
            menuService={menuService}
            categories={categories}
          />

          {/* Combo Modal */}
          <ComboModal
            open={comboModal.open}
            onClose={() => setComboModal({ open: false, mode: 'create' })}
            onSave={() => loadMenuData(menuService)}
            combo={comboModal.combo}
            mode={comboModal.mode}
            menuService={menuService}
          />

          {/* Bulk Upload Modal */}
          <UniversalBulkUpload
            isOpen={bulkUploadModal}
            onClose={() => setBulkUploadModal(false)}
            organizationId={organizationId}
            onUploadComplete={() => loadMenuData(menuService)}
            entityTypes={['menu_items']}
            defaultEntityType="menu_items"
            title="Menu Items Bulk Upload"
            description="Upload multiple menu items at once using an Excel file"
          />

          {/* Categories Bulk Upload Modal */}
          <UniversalBulkUpload
            isOpen={categoriesBulkUploadModal}
            onClose={() => setCategoriesBulkUploadModal(false)}
            organizationId={organizationId}
            onUploadComplete={() => loadMenuData(menuService)}
            entityTypes={['menu_categories']}
            defaultEntityType="menu_categories"
            title="Menu Categories Bulk Upload"
            description="Upload multiple menu categories at once using an Excel file"
          />

          {/* Metadata Modal */}
          <MenuItemMetadataModal
            open={metadataModal.open}
            onClose={() => setMetadataModal({ open: false, metadataType: '' })}
            onSave={() => loadMenuData(menuService)}
            menuItem={metadataModal.item}
            metadataType={metadataModal.metadataType}
            menuService={menuService}
          />

          {/* Item Details Modal */}
          {selectedItemForDetails && (
            <Dialog open={!!selectedItemForDetails} onOpenChange={() => setSelectedItemForDetails(null)}>
              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <ChefHat className="w-5 h-5" />
                    <span>{selectedItemForDetails.entity_name || selectedItemForDetails.name}</span>
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Basic Item Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Basic Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Price:</span>
                          <span className="font-semibold">{formatCurrency(selectedItemForDetails.base_price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Prep Time:</span>
                          <span className="font-semibold">{selectedItemForDetails.preparation_time}m</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge variant={selectedItemForDetails.is_active ? "default" : "secondary"}>
                            {selectedItemForDetails.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Featured:</span>
                          <Badge variant={selectedItemForDetails.is_featured ? "default" : "outline"}>
                            {selectedItemForDetails.is_featured ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Dietary Information</h3>
                      <div className="flex flex-wrap gap-2">
                        {getDietaryBadges(selectedItemForDetails).map((badge) => (
                          <Badge key={badge.label} className={`text-xs ${badge.color}`}>
                            {badge.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Rich Metadata Display */}
                  <MenuItemMetadataDisplay
                    menuItem={selectedItemForDetails}
                    expanded={true}
                    onEdit={(metadataType) => {
                      setMetadataModal({
                        open: true,
                        item: selectedItemForDetails,
                        metadataType
                      });
                      setSelectedItemForDetails(null);
                    }}
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}
        </>
      )}
    </div>
  );
}