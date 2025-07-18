/**
 * Combo Modal Component - Create and edit combo offers
 * Built on HERA Universal Architecture with 5-table design
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MenuManagementService, 
  MenuItem,
  MENU_ENTITY_TYPES
} from '@/lib/services/menuManagementService';
import UniversalCrudService from '@/lib/services/universalCrudService';
import {
  ShoppingCart,
  Plus,
  Minus,
  DollarSign,
  Percent,
  AlertTriangle,
  CheckCircle,
  Loader2,
  X,
  Package,
  Image as ImageIcon,
  Calculator,
  TrendingUp,
  Info
} from 'lucide-react';

interface ComboComponent {
  item_id: string;
  item?: MenuItem;
  quantity: number;
  role: 'main' | 'side' | 'beverage' | 'dessert';
  customizable: boolean;
  individual_price?: number;
  total_price?: number;
}

interface ComboModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  combo?: any;
  mode: 'create' | 'edit';
  menuService: MenuManagementService;
}

export default function ComboModal({
  open,
  onClose,
  onSave,
  combo,
  mode,
  menuService
}: ComboModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  
  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(15);
  const [isActive, setIsActive] = useState(true);
  const [components, setComponents] = useState<ComboComponent[]>([]);
  
  // Pricing calculations
  const [individualTotal, setIndividualTotal] = useState(0);
  const [comboPrice, setComboPrice] = useState(0);
  const [savings, setSavings] = useState(0);

  // Load menu items for selection
  useEffect(() => {
    if (open) {
      loadMenuItems();
      if (mode === 'edit' && combo) {
        loadComboData();
      } else {
        resetForm();
      }
    }
  }, [open, mode, combo]);

  // Recalculate pricing when components or discount changes
  useEffect(() => {
    calculatePricing();
  }, [components, discountPercentage]);

  const loadMenuItems = async () => {
    try {
      const result = await menuService.getMenuItems(undefined, false);
      if (result.success && result.data) {
        setMenuItems(result.data);
      }
    } catch (error) {
      console.error('Failed to load menu items:', error);
    }
  };

  const loadComboData = async () => {
    if (!combo) return;
    
    setName(combo.entity_name || combo.name || '');
    setDescription(combo.description || '');
    setImageUrl(combo.image_url || '');
    setDiscountPercentage(combo.discount_percentage || combo.savings_percentage || 15);
    setIsActive(combo.is_active ?? true);
    
    // Load components if available
    if (combo.analysis?.components) {
      const loadedComponents: ComboComponent[] = combo.analysis.components.map((comp: any) => ({
        item_id: comp.id || '',
        quantity: comp.quantity || 1,
        role: comp.role || 'component',
        customizable: comp.customizable ?? true,
        individual_price: comp.individual_price,
        total_price: comp.individual_price * (comp.quantity || 1)
      }));
      
      // Load full item data
      const componentsWithItems = await Promise.all(
        loadedComponents.map(async (comp) => {
          const item = menuItems.find(i => i.id === comp.item_id);
          return { ...comp, item };
        })
      );
      
      setComponents(componentsWithItems);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setImageUrl('');
    setDiscountPercentage(15);
    setIsActive(true);
    setComponents([]);
    setError(null);
  };

  const calculatePricing = () => {
    const total = components.reduce((sum, comp) => {
      const price = comp.item?.base_price || 0;
      return sum + (price * comp.quantity);
    }, 0);
    
    setIndividualTotal(total);
    
    const discountedPrice = total * (1 - discountPercentage / 100);
    setComboPrice(Math.round(discountedPrice * 100) / 100);
    
    const savingsAmount = total - discountedPrice;
    setSavings(Math.round(savingsAmount * 100) / 100);
  };

  const addComponent = () => {
    setComponents([...components, {
      item_id: '',
      quantity: 1,
      role: 'component',
      customizable: true
    }]);
  };

  const removeComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  const updateComponent = (index: number, updates: Partial<ComboComponent>) => {
    const newComponents = [...components];
    newComponents[index] = { ...newComponents[index], ...updates };
    
    // Update item reference if item_id changed
    if (updates.item_id) {
      const item = menuItems.find(i => i.id === updates.item_id);
      newComponents[index].item = item;
    }
    
    setComponents(newComponents);
  };

  const validateForm = () => {
    if (!name.trim()) {
      setError('Combo name is required');
      return false;
    }
    
    if (components.length < 2) {
      setError('A combo must have at least 2 components');
      return false;
    }
    
    if (components.some(c => !c.item_id)) {
      setError('All components must have an item selected');
      return false;
    }
    
    if (discountPercentage < 0 || discountPercentage > 100) {
      setError('Discount percentage must be between 0 and 100');
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const comboData = {
        name: name.trim(),
        description: description.trim(),
        components: components.map(comp => ({
          item_id: comp.item_id,
          quantity: comp.quantity,
          role: comp.role,
          customizable: comp.customizable
        })),
        discount_percentage: discountPercentage,
        image_url: imageUrl,
        is_active: isActive
      };
      
      if (mode === 'create') {
        const result = await menuService.createComboMeal(comboData);
        if (!result.success) {
          throw new Error(result.error || 'Failed to create combo');
        }
      } else if (combo?.id) {
        // Update existing combo
        const updateResult = await UniversalCrudService.updateEntity(
          menuService.organizationId,
          combo.id,
          {
            name: comboData.name,
            description: comboData.description,
            combo_price: comboPrice,
            individual_total: individualTotal,
            savings: savings,
            discount_percentage: discountPercentage,
            image_url: comboData.image_url,
            is_active: comboData.is_active
          }
        );
        
        if (!updateResult.success) {
          throw new Error('Failed to update combo');
        }
        
        // TODO: Update component relationships
      }
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Save combo error:', error);
      setError(error instanceof Error ? error.message : 'Failed to save combo');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'main': return 'bg-orange-100 text-orange-800';
      case 'side': return 'bg-blue-100 text-blue-800';
      case 'beverage': return 'bg-green-100 text-green-800';
      case 'dessert': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-orange-600" />
            <span>{mode === 'create' ? 'Create New Combo' : 'Edit Combo'}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Combo Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Burger Combo Meal"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what's included in this combo..."
                className="mt-1"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <div className="flex items-center space-x-2 mt-1">
                <ImageIcon className="w-4 h-4 text-gray-400" />
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          
          {/* Components Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Package className="w-4 h-4" />
                  <span>Combo Components</span>
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addComponent}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {components.map((component, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="flex-1 grid grid-cols-12 gap-3 items-center">
                      {/* Item Selection */}
                      <div className="col-span-5">
                        <select
                          value={component.item_id}
                          onChange={(e) => updateComponent(index, { item_id: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="">Select an item...</option>
                          {menuItems.map(item => (
                            <option key={item.id} value={item.id}>
                              {item.entity_name || item.name} - {formatCurrency(item.base_price)}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Quantity */}
                      <div className="col-span-2 flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateComponent(index, { 
                            quantity: Math.max(1, component.quantity - 1) 
                          })}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center">{component.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateComponent(index, { 
                            quantity: component.quantity + 1 
                          })}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      {/* Role */}
                      <div className="col-span-3">
                        <select
                          value={component.role}
                          onChange={(e) => updateComponent(index, { 
                            role: e.target.value as ComboComponent['role'] 
                          })}
                          className="w-full px-2 py-1 border rounded text-sm"
                        >
                          <option value="main">Main Item</option>
                          <option value="side">Side</option>
                          <option value="beverage">Beverage</option>
                          <option value="dessert">Dessert</option>
                        </select>
                      </div>
                      
                      {/* Customizable */}
                      <div className="col-span-1 flex items-center">
                        <Switch
                          checked={component.customizable}
                          onCheckedChange={(checked) => updateComponent(index, { customizable: checked })}
                        />
                      </div>
                      
                      {/* Remove */}
                      <div className="col-span-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeComponent(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {components.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No components added yet</p>
                    <p className="text-sm">Click "Add Item" to start building your combo</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Pricing Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="w-4 h-4" />
                <span>Pricing & Discount</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Discount Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Discount Percentage</Label>
                    <div className="flex items-center space-x-2">
                      <Percent className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold text-lg">{discountPercentage}%</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                  </div>
                </div>
                
                {/* Pricing Summary */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Individual Total</div>
                    <div className="text-xl font-semibold">{formatCurrency(individualTotal)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Combo Price</div>
                    <div className="text-xl font-semibold text-green-600">{formatCurrency(comboPrice)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Customer Saves</div>
                    <div className="text-xl font-semibold text-red-600">{formatCurrency(savings)}</div>
                  </div>
                </div>
                
                {savings > 0 && (
                  <Alert className="border-green-200 bg-green-50">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Customers save {formatCurrency(savings)} ({discountPercentage}% off) with this combo!
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Active Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Info className="w-5 h-5 text-gray-600" />
              <div>
                <Label>Active Status</Label>
                <p className="text-sm text-gray-600">
                  {isActive ? 'This combo is available for ordering' : 'This combo is hidden from customers'}
                </p>
              </div>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                {mode === 'create' ? 'Create Combo' : 'Update Combo'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}