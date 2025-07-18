/**
 * Menu Item Metadata Modal Component
 * Allows editing of rich metadata for menu items
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MenuManagementService, 
  MENU_METADATA_TYPES,
  NutritionalInfo,
  AllergenInfo,
  PreparationDetails,
  AvailabilityRules,
  PricingTiers,
  ChefNotes,
  SupplierInfo
} from '@/lib/services/menuManagementService';
import {
  Heart,
  AlertTriangle,
  ChefHat,
  Calendar,
  DollarSign,
  Truck,
  Plus,
  Trash2,
  Save,
  Loader2,
  X
} from 'lucide-react';

interface MenuItemMetadataModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  menuItem?: any;
  metadataType: string;
  menuService: MenuManagementService;
}

export default function MenuItemMetadataModal({
  open,
  onClose,
  onSave,
  menuItem,
  metadataType,
  menuService
}: MenuItemMetadataModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (open && menuItem) {
      loadExistingMetadata();
    }
  }, [open, menuItem, metadataType]);

  const loadExistingMetadata = async () => {
    try {
      const result = await menuService.getMenuItemMetadata(menuItem.id, metadataType);
      if (result.success && result.data[metadataType]) {
        setFormData(result.data[metadataType]);
      } else {
        setFormData(getDefaultFormData());
      }
    } catch (error) {
      console.error('Error loading metadata:', error);
      setFormData(getDefaultFormData());
    }
  };

  const getDefaultFormData = () => {
    switch (metadataType) {
      case MENU_METADATA_TYPES.NUTRITIONAL_INFO:
        return {
          calories: 0,
          protein: 0,
          carbohydrates: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0,
          saturated_fat: 0,
          trans_fat: 0,
          cholesterol: 0,
          serving_size: ''
        };
      case MENU_METADATA_TYPES.ALLERGEN_INFO:
        return {
          contains_dairy: false,
          contains_eggs: false,
          contains_fish: false,
          contains_shellfish: false,
          contains_tree_nuts: false,
          contains_peanuts: false,
          contains_wheat: false,
          contains_soy: false,
          contains_sesame: false,
          contains_gluten: false,
          contains_alcohol: false,
          may_contain: [],
          allergen_free_certifications: [],
          preparation_warnings: []
        };
      case MENU_METADATA_TYPES.PREPARATION_DETAILS:
        return {
          cooking_methods: [],
          equipment_required: [],
          skill_level: 'intermediate',
          prep_time_minutes: 0,
          cook_time_minutes: 0,
          total_time_minutes: 0,
          special_instructions: [],
          quality_checkpoints: [],
          plating_instructions: '',
          garnish_requirements: []
        };
      case MENU_METADATA_TYPES.AVAILABILITY_RULES:
        return {
          available_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          available_times: { all_day: true },
          seasonal_availability: { available_months: [1,2,3,4,5,6,7,8,9,10,11,12] },
          special_occasions: [],
          weather_dependent: false,
          inventory_dependent: false
        };
      case MENU_METADATA_TYPES.PRICING_TIERS:
        return {
          regular_price: 0,
          bulk_order_discounts: [],
          seasonal_pricing: []
        };
      case MENU_METADATA_TYPES.CHEF_NOTES:
        return {
          created_by: 'Current User',
          created_at: new Date().toISOString(),
          recipe_secrets: [],
          ingredient_substitutions: {},
          cooking_tips: [],
          presentation_notes: '',
          improvement_suggestions: []
        };
      case MENU_METADATA_TYPES.SUPPLIER_INFO:
        return {
          primary_suppliers: [],
          backup_suppliers: [],
          sourcing_requirements: [],
          organic_certifications: [],
          local_sourcing_percentage: 0,
          sustainability_score: 0
        };
      default:
        return {};
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      await menuService.updateMenuItemMetadata(menuItem.id, metadataType, formData);
      
      onSave();
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save metadata');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (path: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const addArrayItem = (arrayPath: string, defaultValue: any = '') => {
    const currentArray = getNestedValue(formData, arrayPath) || [];
    updateFormData(arrayPath, [...currentArray, defaultValue]);
  };

  const removeArrayItem = (arrayPath: string, index: number) => {
    const currentArray = getNestedValue(formData, arrayPath) || [];
    const newArray = currentArray.filter((_, i) => i !== index);
    updateFormData(arrayPath, newArray);
  };

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const renderNutritionalForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="calories">Calories</Label>
          <Input
            id="calories"
            type="number"
            value={formData.calories || ''}
            onChange={(e) => updateFormData('calories', parseInt(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label htmlFor="serving_size">Serving Size</Label>
          <Input
            id="serving_size"
            value={formData.serving_size || ''}
            onChange={(e) => updateFormData('serving_size', e.target.value)}
            placeholder="e.g., 1 cup, 100g"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { key: 'protein', label: 'Protein (g)' },
          { key: 'carbohydrates', label: 'Carbs (g)' },
          { key: 'fat', label: 'Fat (g)' },
          { key: 'fiber', label: 'Fiber (g)' },
          { key: 'sugar', label: 'Sugar (g)' },
          { key: 'sodium', label: 'Sodium (mg)' },
          { key: 'saturated_fat', label: 'Saturated Fat (g)' },
          { key: 'cholesterol', label: 'Cholesterol (mg)' }
        ].map(field => (
          <div key={field.key}>
            <Label htmlFor={field.key}>{field.label}</Label>
            <Input
              id={field.key}
              type="number"
              step="0.1"
              value={formData[field.key] || ''}
              onChange={(e) => updateFormData(field.key, parseFloat(e.target.value) || 0)}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderAllergenForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { key: 'contains_dairy', label: 'Contains Dairy' },
          { key: 'contains_eggs', label: 'Contains Eggs' },
          { key: 'contains_fish', label: 'Contains Fish' },
          { key: 'contains_shellfish', label: 'Contains Shellfish' },
          { key: 'contains_tree_nuts', label: 'Contains Tree Nuts' },
          { key: 'contains_peanuts', label: 'Contains Peanuts' },
          { key: 'contains_wheat', label: 'Contains Wheat' },
          { key: 'contains_soy', label: 'Contains Soy' },
          { key: 'contains_sesame', label: 'Contains Sesame' },
          { key: 'contains_gluten', label: 'Contains Gluten' },
          { key: 'contains_alcohol', label: 'Contains Alcohol' }
        ].map(allergen => (
          <div key={allergen.key} className="flex items-center space-x-2">
            <Switch
              checked={formData[allergen.key] || false}
              onCheckedChange={(checked) => updateFormData(allergen.key, checked)}
            />
            <Label>{allergen.label}</Label>
          </div>
        ))}
      </div>
      
      <div>
        <Label>May Contain (Cross-contamination warnings)</Label>
        <div className="space-y-2">
          {(formData.may_contain || []).map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                value={item}
                onChange={(e) => {
                  const newArray = [...(formData.may_contain || [])];
                  newArray[index] = e.target.value;
                  updateFormData('may_contain', newArray);
                }}
                placeholder="e.g., nuts, dairy"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeArrayItem('may_contain', index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => addArrayItem('may_contain')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Warning
          </Button>
        </div>
      </div>
    </div>
  );

  const renderPreparationForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="prep_time">Prep Time (minutes)</Label>
          <Input
            id="prep_time"
            type="number"
            value={formData.prep_time_minutes || ''}
            onChange={(e) => updateFormData('prep_time_minutes', parseInt(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label htmlFor="cook_time">Cook Time (minutes)</Label>
          <Input
            id="cook_time"
            type="number"
            value={formData.cook_time_minutes || ''}
            onChange={(e) => updateFormData('cook_time_minutes', parseInt(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label htmlFor="total_time">Total Time (minutes)</Label>
          <Input
            id="total_time"
            type="number"
            value={formData.total_time_minutes || ''}
            onChange={(e) => updateFormData('total_time_minutes', parseInt(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label htmlFor="skill_level">Skill Level</Label>
          <select
            id="skill_level"
            value={formData.skill_level || 'intermediate'}
            onChange={(e) => updateFormData('skill_level', e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
        </div>
      </div>
      
      <div>
        <Label>Cooking Methods</Label>
        <div className="space-y-2">
          {(formData.cooking_methods || []).map((method, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                value={method}
                onChange={(e) => {
                  const newArray = [...(formData.cooking_methods || [])];
                  newArray[index] = e.target.value;
                  updateFormData('cooking_methods', newArray);
                }}
                placeholder="e.g., grilled, sautéed, steamed"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeArrayItem('cooking_methods', index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => addArrayItem('cooking_methods')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Method
          </Button>
        </div>
      </div>
      
      <div>
        <Label>Equipment Required</Label>
        <div className="space-y-2">
          {(formData.equipment_required || []).map((equipment, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                value={equipment}
                onChange={(e) => {
                  const newArray = [...(formData.equipment_required || [])];
                  newArray[index] = e.target.value;
                  updateFormData('equipment_required', newArray);
                }}
                placeholder="e.g., grill, wok, steamer"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeArrayItem('equipment_required', index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => addArrayItem('equipment_required')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Equipment
          </Button>
        </div>
      </div>
      
      <div>
        <Label htmlFor="plating_instructions">Plating Instructions</Label>
        <Textarea
          id="plating_instructions"
          value={formData.plating_instructions || ''}
          onChange={(e) => updateFormData('plating_instructions', e.target.value)}
          placeholder="Describe how to plate and present this dish..."
        />
      </div>
    </div>
  );

  const renderAvailabilityForm = () => (
    <div className="space-y-4">
      <div>
        <Label>Available Days</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
            <div key={day} className="flex items-center space-x-2">
              <Switch
                checked={(formData.available_days || []).includes(day)}
                onCheckedChange={(checked) => {
                  const currentDays = formData.available_days || [];
                  if (checked) {
                    updateFormData('available_days', [...currentDays, day]);
                  } else {
                    updateFormData('available_days', currentDays.filter(d => d !== day));
                  }
                }}
              />
              <Label className="capitalize">{day}</Label>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <Label>Available Times</Label>
        <div className="space-y-3 mt-2">
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.available_times?.all_day || false}
              onCheckedChange={(checked) => {
                if (checked) {
                  updateFormData('available_times', { all_day: true });
                } else {
                  updateFormData('available_times', {});
                }
              }}
            />
            <Label>Available All Day</Label>
          </div>
          
          {!formData.available_times?.all_day && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['breakfast', 'lunch', 'dinner'].map(meal => (
                <div key={meal} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={!!formData.available_times?.[meal]}
                      onCheckedChange={(checked) => {
                        const currentTimes = formData.available_times || {};
                        if (checked) {
                          updateFormData(`available_times.${meal}`, { start: '09:00', end: '17:00' });
                        } else {
                          const newTimes = { ...currentTimes };
                          delete newTimes[meal];
                          updateFormData('available_times', newTimes);
                        }
                      }}
                    />
                    <Label className="capitalize">{meal}</Label>
                  </div>
                  
                  {formData.available_times?.[meal] && (
                    <div className="flex space-x-2">
                      <Input
                        type="time"
                        value={formData.available_times[meal]?.start || '09:00'}
                        onChange={(e) => updateFormData(`available_times.${meal}.start`, e.target.value)}
                      />
                      <Input
                        type="time"
                        value={formData.available_times[meal]?.end || '17:00'}
                        onChange={(e) => updateFormData(`available_times.${meal}.end`, e.target.value)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPricingForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="regular_price">Regular Price</Label>
          <Input
            id="regular_price"
            type="number"
            step="0.01"
            value={formData.regular_price || ''}
            onChange={(e) => updateFormData('regular_price', parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label htmlFor="happy_hour_price">Happy Hour Price</Label>
          <Input
            id="happy_hour_price"
            type="number"
            step="0.01"
            value={formData.happy_hour_price || ''}
            onChange={(e) => updateFormData('happy_hour_price', parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label htmlFor="lunch_special_price">Lunch Special Price</Label>
          <Input
            id="lunch_special_price"
            type="number"
            step="0.01"
            value={formData.lunch_special_price || ''}
            onChange={(e) => updateFormData('lunch_special_price', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>
      
      <div>
        <Label>Bulk Order Discounts</Label>
        <div className="space-y-2">
          {(formData.bulk_order_discounts || []).map((discount, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                type="number"
                value={discount.quantity_threshold || ''}
                onChange={(e) => {
                  const newArray = [...(formData.bulk_order_discounts || [])];
                  newArray[index] = { ...newArray[index], quantity_threshold: parseInt(e.target.value) || 0 };
                  updateFormData('bulk_order_discounts', newArray);
                }}
                placeholder="Quantity"
              />
              <Input
                type="number"
                step="0.1"
                value={discount.discount_percentage || ''}
                onChange={(e) => {
                  const newArray = [...(formData.bulk_order_discounts || [])];
                  newArray[index] = { ...newArray[index], discount_percentage: parseFloat(e.target.value) || 0 };
                  updateFormData('bulk_order_discounts', newArray);
                }}
                placeholder="Discount %"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeArrayItem('bulk_order_discounts', index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => addArrayItem('bulk_order_discounts', { quantity_threshold: 0, discount_percentage: 0 })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Discount
          </Button>
        </div>
      </div>
    </div>
  );

  const renderChefNotesForm = () => (
    <div className="space-y-4">
      <div>
        <Label>Recipe Secrets</Label>
        <div className="space-y-2">
          {(formData.recipe_secrets || []).map((secret, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                value={secret}
                onChange={(e) => {
                  const newArray = [...(formData.recipe_secrets || [])];
                  newArray[index] = e.target.value;
                  updateFormData('recipe_secrets', newArray);
                }}
                placeholder="Share a recipe secret..."
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeArrayItem('recipe_secrets', index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => addArrayItem('recipe_secrets')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Secret
          </Button>
        </div>
      </div>
      
      <div>
        <Label>Cooking Tips</Label>
        <div className="space-y-2">
          {(formData.cooking_tips || []).map((tip, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                value={tip}
                onChange={(e) => {
                  const newArray = [...(formData.cooking_tips || [])];
                  newArray[index] = e.target.value;
                  updateFormData('cooking_tips', newArray);
                }}
                placeholder="Share a cooking tip..."
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeArrayItem('cooking_tips', index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => addArrayItem('cooking_tips')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Tip
          </Button>
        </div>
      </div>
      
      <div>
        <Label htmlFor="presentation_notes">Presentation Notes</Label>
        <Textarea
          id="presentation_notes"
          value={formData.presentation_notes || ''}
          onChange={(e) => updateFormData('presentation_notes', e.target.value)}
          placeholder="Notes on how to present this dish..."
        />
      </div>
    </div>
  );

  const getModalTitle = () => {
    switch (metadataType) {
      case MENU_METADATA_TYPES.NUTRITIONAL_INFO:
        return 'Nutritional Information';
      case MENU_METADATA_TYPES.ALLERGEN_INFO:
        return 'Allergen Information';
      case MENU_METADATA_TYPES.PREPARATION_DETAILS:
        return 'Preparation Details';
      case MENU_METADATA_TYPES.AVAILABILITY_RULES:
        return 'Availability Rules';
      case MENU_METADATA_TYPES.PRICING_TIERS:
        return 'Pricing Tiers';
      case MENU_METADATA_TYPES.CHEF_NOTES:
        return 'Chef Notes';
      case MENU_METADATA_TYPES.SUPPLIER_INFO:
        return 'Supplier Information';
      default:
        return 'Edit Metadata';
    }
  };

  const renderFormContent = () => {
    switch (metadataType) {
      case MENU_METADATA_TYPES.NUTRITIONAL_INFO:
        return renderNutritionalForm();
      case MENU_METADATA_TYPES.ALLERGEN_INFO:
        return renderAllergenForm();
      case MENU_METADATA_TYPES.PREPARATION_DETAILS:
        return renderPreparationForm();
      case MENU_METADATA_TYPES.AVAILABILITY_RULES:
        return renderAvailabilityForm();
      case MENU_METADATA_TYPES.PRICING_TIERS:
        return renderPricingForm();
      case MENU_METADATA_TYPES.CHEF_NOTES:
        return renderChefNotesForm();
      default:
        return <div>Form not implemented for this metadata type</div>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {getModalTitle()} - {menuItem?.entity_name || menuItem?.name}
          </DialogTitle>
        </DialogHeader>
        
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          {renderFormContent()}
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
                <Save className="w-4 h-4 mr-2" />
                Save Metadata
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}