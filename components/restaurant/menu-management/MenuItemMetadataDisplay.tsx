/**
 * Menu Item Metadata Display Component
 * Displays rich metadata for menu items including nutritional info, allergens, preparation details, etc.
 */

"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MenuItem, 
  MenuItemMetadata, 
  NutritionalInfo, 
  AllergenInfo, 
  PreparationDetails,
  AvailabilityRules,
  PricingTiers,
  ChefNotes,
  SupplierInfo
} from '@/lib/services/menuManagementService';
import {
  Utensils,
  Clock,
  AlertTriangle,
  Heart,
  Thermometer,
  Users,
  DollarSign,
  Truck,
  ChefHat,
  Calendar,
  Shield,
  Info,
  Star,
  Zap,
  Leaf,
  Award,
  Scale,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface MenuItemMetadataDisplayProps {
  menuItem: MenuItem;
  expanded?: boolean;
  onEdit?: (metadataType: string) => void;
}

export default function MenuItemMetadataDisplay({ 
  menuItem, 
  expanded = false, 
  onEdit 
}: MenuItemMetadataDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [activeTab, setActiveTab] = useState('nutritional');
  
  const metadata = menuItem.metadata;
  
  if (!metadata || Object.keys(metadata).length === 0) {
    return (
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="text-center text-gray-500">
            <Info className="w-8 h-8 mx-auto mb-2" />
            <p>No metadata available</p>
            <p className="text-sm">Add rich information about this menu item</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderNutritionalInfo = (nutritional: NutritionalInfo) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">{nutritional.calories}</p>
          <p className="text-sm text-gray-600">Calories</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">{nutritional.protein}g</p>
          <p className="text-sm text-gray-600">Protein</p>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <p className="text-2xl font-bold text-orange-600">{nutritional.carbohydrates}g</p>
          <p className="text-sm text-gray-600">Carbs</p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <p className="text-2xl font-bold text-purple-600">{nutritional.fat}g</p>
          <p className="text-sm text-gray-600">Fat</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
        <div className="flex justify-between">
          <span>Fiber:</span>
          <span className="font-semibold">{nutritional.fiber}g</span>
        </div>
        <div className="flex justify-between">
          <span>Sugar:</span>
          <span className="font-semibold">{nutritional.sugar}g</span>
        </div>
        <div className="flex justify-between">
          <span>Sodium:</span>
          <span className="font-semibold">{nutritional.sodium}mg</span>
        </div>
        {nutritional.saturated_fat && (
          <div className="flex justify-between">
            <span>Saturated Fat:</span>
            <span className="font-semibold">{nutritional.saturated_fat}g</span>
          </div>
        )}
        {nutritional.cholesterol && (
          <div className="flex justify-between">
            <span>Cholesterol:</span>
            <span className="font-semibold">{nutritional.cholesterol}mg</span>
          </div>
        )}
        {nutritional.serving_size && (
          <div className="flex justify-between">
            <span>Serving Size:</span>
            <span className="font-semibold">{nutritional.serving_size}</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderAllergenInfo = (allergen: AllergenInfo) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { key: 'contains_dairy', label: 'Dairy', icon: '🥛' },
          { key: 'contains_eggs', label: 'Eggs', icon: '🥚' },
          { key: 'contains_fish', label: 'Fish', icon: '🐟' },
          { key: 'contains_shellfish', label: 'Shellfish', icon: '🦐' },
          { key: 'contains_tree_nuts', label: 'Tree Nuts', icon: '🌰' },
          { key: 'contains_peanuts', label: 'Peanuts', icon: '🥜' },
          { key: 'contains_wheat', label: 'Wheat', icon: '🌾' },
          { key: 'contains_soy', label: 'Soy', icon: '🫘' },
          { key: 'contains_sesame', label: 'Sesame', icon: '🌱' },
          { key: 'contains_gluten', label: 'Gluten', icon: '🍞' },
          { key: 'contains_alcohol', label: 'Alcohol', icon: '🍷' }
        ].map((allergen_item) => (
          <div 
            key={allergen_item.key}
            className={`p-3 rounded-lg border ${
              allergen[allergen_item.key as keyof AllergenInfo] 
                ? 'bg-red-50 border-red-200' 
                : 'bg-green-50 border-green-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">{allergen_item.icon}</span>
              <span className="text-sm font-medium">{allergen_item.label}</span>
            </div>
            <div className="mt-1">
              <Badge 
                variant={allergen[allergen_item.key as keyof AllergenInfo] ? "destructive" : "secondary"}
                className="text-xs"
              >
                {allergen[allergen_item.key as keyof AllergenInfo] ? 'Contains' : 'Safe'}
              </Badge>
            </div>
          </div>
        ))}
      </div>
      
      {allergen.may_contain && allergen.may_contain.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <strong>May contain:</strong> {allergen.may_contain.join(', ')}
          </AlertDescription>
        </Alert>
      )}
      
      {allergen.allergen_free_certifications && allergen.allergen_free_certifications.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Certifications:</h4>
          <div className="flex flex-wrap gap-2">
            {allergen.allergen_free_certifications.map((cert, index) => (
              <Badge key={index} variant="outline" className="bg-green-50">
                <Award className="w-3 h-3 mr-1" />
                {cert}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderPreparationDetails = (prep: PreparationDetails) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <Clock className="w-6 h-6 mx-auto text-blue-600 mb-1" />
          <p className="text-lg font-bold text-blue-600">{prep.prep_time_minutes}m</p>
          <p className="text-sm text-gray-600">Prep Time</p>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <Thermometer className="w-6 h-6 mx-auto text-orange-600 mb-1" />
          <p className="text-lg font-bold text-orange-600">{prep.cook_time_minutes}m</p>
          <p className="text-sm text-gray-600">Cook Time</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <Zap className="w-6 h-6 mx-auto text-green-600 mb-1" />
          <p className="text-lg font-bold text-green-600">{prep.total_time_minutes}m</p>
          <p className="text-sm text-gray-600">Total Time</p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <Star className="w-6 h-6 mx-auto text-purple-600 mb-1" />
          <p className="text-lg font-bold text-purple-600 capitalize">{prep.skill_level}</p>
          <p className="text-sm text-gray-600">Skill Level</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold mb-2 flex items-center">
            <Utensils className="w-4 h-4 mr-2" />
            Cooking Methods
          </h4>
          <div className="flex flex-wrap gap-2">
            {prep.cooking_methods.map((method, index) => (
              <Badge key={index} variant="outline" className="bg-blue-50">
                {method}
              </Badge>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2 flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Equipment Required
          </h4>
          <div className="flex flex-wrap gap-2">
            {prep.equipment_required.map((equipment, index) => (
              <Badge key={index} variant="outline" className="bg-gray-50">
                {equipment}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      
      {prep.special_instructions && prep.special_instructions.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Special Instructions:</h4>
          <ul className="space-y-1">
            {prep.special_instructions.map((instruction, index) => (
              <li key={index} className="text-sm bg-yellow-50 p-2 rounded">
                • {instruction}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderAvailabilityRules = (availability: AvailabilityRules) => (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold mb-2 flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          Available Days
        </h4>
        <div className="flex flex-wrap gap-2">
          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
            <Badge 
              key={day}
              variant={availability.available_days.includes(day) ? "default" : "outline"}
              className={availability.available_days.includes(day) ? "bg-green-500" : ""}
            >
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </Badge>
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="font-semibold mb-2 flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          Available Times
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {availability.available_times.breakfast && (
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="font-semibold text-yellow-800">Breakfast</p>
              <p className="text-sm text-yellow-600">
                {availability.available_times.breakfast.start} - {availability.available_times.breakfast.end}
              </p>
            </div>
          )}
          {availability.available_times.lunch && (
            <div className="p-3 bg-orange-50 rounded-lg">
              <p className="font-semibold text-orange-800">Lunch</p>
              <p className="text-sm text-orange-600">
                {availability.available_times.lunch.start} - {availability.available_times.lunch.end}
              </p>
            </div>
          )}
          {availability.available_times.dinner && (
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="font-semibold text-purple-800">Dinner</p>
              <p className="text-sm text-purple-600">
                {availability.available_times.dinner.start} - {availability.available_times.dinner.end}
              </p>
            </div>
          )}
          {availability.available_times.all_day && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="font-semibold text-blue-800">All Day</p>
              <p className="text-sm text-blue-600">Available 24/7</p>
            </div>
          )}
        </div>
      </div>
      
      {availability.maximum_daily_quantity && (
        <Alert className="border-orange-200 bg-orange-50">
          <Shield className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <strong>Limited quantity:</strong> Maximum {availability.maximum_daily_quantity} per day
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  const renderPricingTiers = (pricing: PricingTiers) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Regular Price</h4>
          <p className="text-2xl font-bold text-blue-600">${pricing.regular_price}</p>
        </div>
        
        {pricing.happy_hour_price && (
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Happy Hour</h4>
            <p className="text-2xl font-bold text-green-600">${pricing.happy_hour_price}</p>
          </div>
        )}
        
        {pricing.lunch_special_price && (
          <div className="p-4 bg-orange-50 rounded-lg">
            <h4 className="font-semibold text-orange-800 mb-2">Lunch Special</h4>
            <p className="text-2xl font-bold text-orange-600">${pricing.lunch_special_price}</p>
          </div>
        )}
        
        {pricing.member_discount_percentage && (
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-2">Member Discount</h4>
            <p className="text-2xl font-bold text-purple-600">{pricing.member_discount_percentage}% off</p>
          </div>
        )}
      </div>
      
      {pricing.bulk_order_discounts && pricing.bulk_order_discounts.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Bulk Order Discounts:</h4>
          <div className="space-y-2">
            {pricing.bulk_order_discounts.map((discount, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg flex justify-between">
                <span>Order {discount.quantity_threshold}+ items</span>
                <span className="font-semibold text-green-600">{discount.discount_percentage}% off</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderSupplierInfo = (supplier: SupplierInfo) => (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold mb-3 flex items-center">
          <Truck className="w-4 h-4 mr-2" />
          Primary Suppliers
        </h4>
        <div className="space-y-3">
          {supplier.primary_suppliers.map((supplier_item, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-semibold">{supplier_item.supplier_name}</h5>
                <div className="flex space-x-2">
                  <Badge variant="outline">Quality: {supplier_item.quality_rating}/5</Badge>
                  <Badge variant="outline">Cost: {supplier_item.cost_rating}/5</Badge>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{supplier_item.contact_info}</p>
              <div className="flex flex-wrap gap-1">
                {supplier_item.ingredient_categories.map((category, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {supplier.local_sourcing_percentage && (
        <div className="p-4 bg-green-50 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2 flex items-center">
            <Leaf className="w-4 h-4 mr-2" />
            Local Sourcing
          </h4>
          <p className="text-2xl font-bold text-green-600">{supplier.local_sourcing_percentage}%</p>
        </div>
      )}
    </div>
  );

  const renderChefNotes = (notes: ChefNotes) => (
    <div className="space-y-4">
      <div className="p-4 bg-yellow-50 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
          <ChefHat className="w-4 h-4 mr-2" />
          Chef Notes
        </h4>
        <p className="text-sm text-gray-600">By {notes.created_by} • {new Date(notes.created_at).toLocaleDateString()}</p>
      </div>
      
      {notes.recipe_secrets && notes.recipe_secrets.length > 0 && (
        <div>
          <h5 className="font-semibold mb-2">Recipe Secrets:</h5>
          <ul className="space-y-1">
            {notes.recipe_secrets.map((secret, index) => (
              <li key={index} className="text-sm bg-blue-50 p-2 rounded">
                💡 {secret}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {notes.cooking_tips && notes.cooking_tips.length > 0 && (
        <div>
          <h5 className="font-semibold mb-2">Cooking Tips:</h5>
          <ul className="space-y-1">
            {notes.cooking_tips.map((tip, index) => (
              <li key={index} className="text-sm bg-green-50 p-2 rounded">
                🔥 {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const metadataTabsData = [
    {
      key: 'nutritional',
      label: 'Nutrition',
      icon: Heart,
      content: metadata.nutritional_info ? renderNutritionalInfo(metadata.nutritional_info) : null
    },
    {
      key: 'allergens',
      label: 'Allergens',
      icon: AlertTriangle,
      content: metadata.allergen_info ? renderAllergenInfo(metadata.allergen_info) : null
    },
    {
      key: 'preparation',
      label: 'Preparation',
      icon: ChefHat,
      content: metadata.preparation_details ? renderPreparationDetails(metadata.preparation_details) : null
    },
    {
      key: 'availability',
      label: 'Availability',
      icon: Calendar,
      content: metadata.availability_rules ? renderAvailabilityRules(metadata.availability_rules) : null
    },
    {
      key: 'pricing',
      label: 'Pricing',
      icon: DollarSign,
      content: metadata.pricing_tiers ? renderPricingTiers(metadata.pricing_tiers) : null
    },
    {
      key: 'suppliers',
      label: 'Suppliers',
      icon: Truck,
      content: metadata.supplier_info ? renderSupplierInfo(metadata.supplier_info) : null
    },
    {
      key: 'chef_notes',
      label: 'Chef Notes',
      icon: ChefHat,
      content: metadata.chef_notes ? renderChefNotes(metadata.chef_notes) : null
    }
  ].filter(tab => tab.content !== null);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Info className="w-5 h-5 mr-2" />
            Menu Item Details
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
              {metadataTabsData.map((tab) => (
                <TabsTrigger key={tab.key} value={tab.key} className="flex items-center space-x-1">
                  <tab.icon className="w-3 h-3" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {metadataTabsData.map((tab) => (
              <TabsContent key={tab.key} value={tab.key} className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center">
                      <tab.icon className="w-5 h-5 mr-2" />
                      {tab.label}
                    </h3>
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(tab.key)}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                  <Separator />
                  {tab.content}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
}