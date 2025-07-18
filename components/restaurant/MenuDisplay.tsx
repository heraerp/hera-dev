'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Clock, 
  Star, 
  Filter,
  Leaf,
  Flame,
  Zap,
  Award,
  TrendingUp,
  Heart,
  ChefHat,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import Image from 'next/image';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image_url?: string;
  preparation_time: number;
  dietary_options: string[];
  allergens: string[];
  spice_level: number;
  popularity_score?: number;
  ai_recommended?: boolean;
  ingredients: string[];
  availability: boolean;
}

interface MenuDisplayProps {
  menuItems: MenuItem[];
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddItem: (item: MenuItem, quantity?: number) => void;
  isLoading: boolean;
  popularItems: MenuItem[];
}

export const MenuDisplay: React.FC<MenuDisplayProps> = ({
  menuItems,
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  onAddItem,
  isLoading,
  popularItems
}) => {
  const [quantities, setQuantities] = useState<{ [itemId: string]: number }>({});

  const getQuantity = (itemId: string) => quantities[itemId] || 1;
  const setQuantity = (itemId: string, quantity: number) => {
    setQuantities(prev => ({ ...prev, [itemId]: Math.max(1, quantity) }));
  };

  const getDietaryBadges = (dietaryOptions: string[]) => {
    const badges = [];
    if (dietaryOptions.includes('vegetarian')) {
      badges.push({ label: 'Vegetarian', icon: Leaf, color: 'bg-green-100 text-green-800' });
    }
    if (dietaryOptions.includes('vegan')) {
      badges.push({ label: 'Vegan', icon: Leaf, color: 'bg-green-100 text-green-800' });
    }
    if (dietaryOptions.includes('gluten_free')) {
      badges.push({ label: 'Gluten Free', icon: Heart, color: 'bg-blue-100 text-blue-800' });
    }
    if (dietaryOptions.includes('keto')) {
      badges.push({ label: 'Keto', icon: Zap, color: 'bg-purple-100 text-purple-800' });
    }
    return badges;
  };

  const getSpiceLevel = (level: number) => {
    const flames = [];
    for (let i = 0; i < level; i++) {
      flames.push(<Flame key={i} className="w-3 h-3 text-red-500" />);
    }
    return flames;
  };

  const MenuItem: React.FC<{ item: MenuItem }> = ({ item }) => (
    <Card className={`group hover:shadow-lg transition-all duration-200 ${
      !item.availability ? 'opacity-60' : ''
    } ${item.ai_recommended ? 'ring-2 ring-blue-200 bg-blue-50' : ''}`}>
      <CardContent className="p-4">
        {/* Item Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                {item.name}
              </h3>
              {item.ai_recommended && (
                <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">
                  <Zap className="w-3 h-3 mr-1" />
                  AI Pick
                </Badge>
              )}
              {item.popularity_score && item.popularity_score > 0.8 && (
                <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Popular
                </Badge>
              )}
            </div>
            
            {item.description && (
              <p className="text-sm text-gray-600 mb-2">{item.description}</p>
            )}
            
            {/* Ingredients */}
            <p className="text-xs text-gray-500 mb-2">
              {item.ingredients.slice(0, 4).join(', ')}
              {item.ingredients.length > 4 && '...'}
            </p>
          </div>
          
          {/* Item Image */}
          {item.image_url && (
            <div className="ml-4">
              <div className="w-16 h-16 relative rounded-lg overflow-hidden">
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-200"
                />
              </div>
            </div>
          )}
        </div>

        {/* Dietary Badges */}
        <div className="flex flex-wrap gap-1 mb-3">
          {getDietaryBadges(item.dietary_options).map((badge, index) => (
            <Badge key={index} variant="outline" className={badge.color}>
              <badge.icon className="w-3 h-3 mr-1" />
              {badge.label}
            </Badge>
          ))}
        </div>

        {/* Item Details */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <span className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{item.preparation_time} min</span>
            </span>
            
            {item.spice_level > 0 && (
              <span className="flex items-center space-x-1">
                {getSpiceLevel(item.spice_level)}
              </span>
            )}
            
            {item.allergens.length > 0 && (
              <span className="flex items-center space-x-1">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span className="text-xs">{item.allergens.join(', ')}</span>
              </span>
            )}
          </div>
        </div>

        {/* Price and Add Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">
              ${item.price.toFixed(2)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Quantity Selector */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(item.id, getQuantity(item.id) - 1)}
                className="h-8 w-8 p-0"
              >
                -
              </Button>
              <span className="px-2 text-sm font-medium w-8 text-center">
                {getQuantity(item.id)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(item.id, getQuantity(item.id) + 1)}
                className="h-8 w-8 p-0"
              >
                +
              </Button>
            </div>
            
            {/* Add to Cart Button */}
            <Button
              onClick={() => onAddItem(item, getQuantity(item.id))}
              disabled={!item.availability}
              size="sm"
              className="min-w-[80px]"
            >
              {!item.availability ? (
                'Sold Out'
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
          <span className="ml-2 text-gray-600">Loading menu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCategoryChange('all')}
          >
            All Items
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => onCategoryChange(category)}
              className="capitalize"
            >
              {category.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Popular Items Section */}
      {popularItems.length > 0 && selectedCategory === 'all' && !searchQuery && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">Most Popular</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularItems.slice(0, 3).map((item) => (
              <MenuItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div className="space-y-4">
        {selectedCategory !== 'all' && (
          <div className="flex items-center space-x-2">
            <ChefHat className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900 capitalize">
              {selectedCategory.replace('_', ' ')}
            </h2>
            <Badge variant="outline">{menuItems.length} items</Badge>
          </div>
        )}

        {menuItems.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">
              {searchQuery 
                ? `No menu items match "${searchQuery}"`
                : 'No items available in this category'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item) => (
              <MenuItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};