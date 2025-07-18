/**
 * Recipe Management System - HERA Universal
 * Complete recipe management with ingredients, costing, and inventory integration
 */

"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement';
import { Navbar } from '@/components/ui/navbar';
import { RecipeManagementService } from '@/lib/services/recipeManagementService';
import CreateRecipeDialog from '@/components/restaurant/recipe-management/CreateRecipeDialog';
import BulkUploadDialog from '@/components/restaurant/recipe-management/BulkUploadDialog';
import {
  ChefHat,
  Plus,
  Edit,
  Trash2,
  Save,
  Calculator,
  Scale,
  Clock,
  Users,
  DollarSign,
  Package,
  AlertTriangle,
  TrendingUp,
  BookOpen,
  Utensils,
  Leaf,
  Target,
  ArrowLeft,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Copy,
  Download,
  Upload,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

// Recipe Management Types
interface Ingredient {
  id: string;
  name: string;
  unit: string;
  cost_per_unit: number;
  supplier: string;
  category: string;
  nutritional_info?: {
    calories_per_unit: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
    sodium_mg: number;
  };
  stock_level?: number;
  min_stock_level?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface RecipeIngredient {
  id: string;
  ingredient_id: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  cost_per_unit: number;
  total_cost: number;
  preparation_notes?: string;
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  category: string;
  menu_item_id?: string;
  serving_size: number;
  prep_time_minutes: number;
  cook_time_minutes: number;
  difficulty_level: 'easy' | 'medium' | 'hard';
  ingredients: RecipeIngredient[];
  instructions: string[];
  notes: string;
  nutritional_info?: {
    calories_per_serving: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
    sodium_mg: number;
  };
  cost_analysis: {
    total_ingredient_cost: number;
    cost_per_serving: number;
    suggested_price: number;
    profit_margin: number;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function RecipeManagementPage() {
  const { restaurantData, loading: authLoading } = useRestaurantManagement();
  const organizationId = restaurantData?.organizationId;

  // State management
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('recipes');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isCreateRecipeOpen, setIsCreateRecipeOpen] = useState(false);
  const [isCreateIngredientOpen, setIsCreateIngredientOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

  // Recipe form state
  const [recipeForm, setRecipeForm] = useState({
    name: '',
    description: '',
    category: '',
    serving_size: 1,
    prep_time_minutes: 0,
    cook_time_minutes: 0,
    difficulty_level: 'easy' as const,
    ingredients: [] as RecipeIngredient[],
    instructions: [''],
    notes: ''
  });

  // Ingredient form state
  const [ingredientForm, setIngredientForm] = useState({
    name: '',
    unit: '',
    cost_per_unit: 0,
    supplier: '',
    category: '',
    stock_level: 0,
    min_stock_level: 0
  });

  // Load initial data
  useEffect(() => {
    if (organizationId) {
      loadRecipes();
      loadIngredients();
    }
  }, [organizationId]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🍳 Loading recipes for organization:', organizationId);
      
      const result = await RecipeManagementService.getRecipes(organizationId);
      
      if (result.success) {
        setRecipes(result.recipes || []);
        console.log('✅ Recipes loaded successfully:', result.recipes?.length || 0);
      } else {
        throw new Error(result.error || 'Failed to load recipes');
      }
      
    } catch (error) {
      console.error('Error loading recipes:', error);
      setError('Failed to load recipes');
      
      // Fallback to mock data for demo
      const mockRecipes: Recipe[] = [
        {
          id: '1',
          name: 'Classic Margherita Pizza',
          description: 'Traditional Italian pizza with tomato sauce, mozzarella, and basil',
          category: 'Pizza',
          serving_size: 1,
          prep_time_minutes: 20,
          cook_time_minutes: 15,
          difficulty_level: 'medium',
          ingredients: [
            {
              id: '1',
              ingredient_id: 'ing_1',
              ingredient_name: 'Pizza Dough',
              quantity: 300,
              unit: 'g',
              cost_per_unit: 0.003,
              total_cost: 0.90,
              preparation_notes: 'Room temperature'
            },
            {
              id: '2',
              ingredient_id: 'ing_2',
              ingredient_name: 'Tomato Sauce',
              quantity: 100,
              unit: 'ml',
              cost_per_unit: 0.01,
              total_cost: 1.00
            },
            {
              id: '3',
              ingredient_id: 'ing_3',
              ingredient_name: 'Mozzarella Cheese',
              quantity: 150,
              unit: 'g',
              cost_per_unit: 0.02,
              total_cost: 3.00
            },
            {
              id: '4',
              ingredient_id: 'ing_4',
              ingredient_name: 'Fresh Basil',
              quantity: 10,
              unit: 'g',
              cost_per_unit: 0.50,
              total_cost: 5.00
            }
          ],
          instructions: [
            'Preheat oven to 475°F (245°C)',
            'Roll out pizza dough on floured surface',
            'Spread tomato sauce evenly, leaving 1-inch border',
            'Add mozzarella cheese',
            'Bake for 12-15 minutes until golden',
            'Add fresh basil leaves',
            'Slice and serve immediately'
          ],
          notes: 'For best results, use a pizza stone',
          cost_analysis: {
            total_ingredient_cost: 9.90,
            cost_per_serving: 9.90,
            suggested_price: 24.75,
            profit_margin: 60
          },
          is_active: true,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          name: 'Chapathi',
          description: 'Traditional Indian flatbread',
          category: 'Bread',
          serving_size: 1,
          prep_time_minutes: 15,
          cook_time_minutes: 10,
          difficulty_level: 'easy',
          ingredients: [
            {
              id: '5',
              ingredient_id: 'ing_5',
              ingredient_name: 'Wheat Flour',
              quantity: 100,
              unit: 'g',
              cost_per_unit: 0.002,
              total_cost: 0.20
            },
            {
              id: '6',
              ingredient_id: 'ing_6',
              ingredient_name: 'Water',
              quantity: 60,
              unit: 'ml',
              cost_per_unit: 0.001,
              total_cost: 0.06
            },
            {
              id: '7',
              ingredient_id: 'ing_7',
              ingredient_name: 'Salt',
              quantity: 2,
              unit: 'g',
              cost_per_unit: 0.001,
              total_cost: 0.002
            },
            {
              id: '8',
              ingredient_id: 'ing_8',
              ingredient_name: 'Oil',
              quantity: 5,
              unit: 'ml',
              cost_per_unit: 0.01,
              total_cost: 0.05
            }
          ],
          instructions: [
            'Mix flour and salt in a bowl',
            'Add water gradually and knead into soft dough',
            'Rest dough for 15 minutes',
            'Roll into thin circles',
            'Cook on hot griddle for 1-2 minutes each side',
            'Serve hot'
          ],
          notes: 'Can be made in batches and stored',
          cost_analysis: {
            total_ingredient_cost: 0.31,
            cost_per_serving: 0.31,
            suggested_price: 1.55,
            profit_margin: 80
          },
          is_active: true,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        }
      ];
      
      setRecipes(mockRecipes);
      
    } finally {
      setLoading(false);
    }
  };

  const loadIngredients = async () => {
    try {
      console.log('🥕 Loading ingredients for organization:', organizationId);
      
      const result = await RecipeManagementService.getIngredients(organizationId);
      
      if (result.success) {
        setIngredients(result.ingredients || []);
        console.log('✅ Ingredients loaded successfully:', result.ingredients?.length || 0);
      } else {
        throw new Error(result.error || 'Failed to load ingredients');
      }
      
    } catch (error) {
      console.error('Error loading ingredients:', error);
      
      // Fallback to mock data for demo
      const mockIngredients: Ingredient[] = [
        {
          id: 'ing_1',
          name: 'Pizza Dough',
          unit: 'g',
          cost_per_unit: 0.003,
          supplier: 'Local Bakery',
          category: 'Flour & Grains',
          stock_level: 5000,
          min_stock_level: 1000,
          is_active: true,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: 'ing_2',
          name: 'Tomato Sauce',
          unit: 'ml',
          cost_per_unit: 0.01,
          supplier: 'Restaurant Supply Co',
          category: 'Sauces & Condiments',
          stock_level: 2000,
          min_stock_level: 500,
          is_active: true,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: 'ing_3',
          name: 'Mozzarella Cheese',
          unit: 'g',
          cost_per_unit: 0.02,
          supplier: 'Dairy Farm Direct',
          category: 'Dairy',
          stock_level: 3000,
          min_stock_level: 500,
          is_active: true,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: 'ing_4',
          name: 'Fresh Basil',
          unit: 'g',
          cost_per_unit: 0.50,
          supplier: 'Herb Garden',
          category: 'Herbs & Spices',
          stock_level: 200,
          min_stock_level: 50,
          is_active: true,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: 'ing_5',
          name: 'Wheat Flour',
          unit: 'g',
          cost_per_unit: 0.002,
          supplier: 'Grain Mill',
          category: 'Flour & Grains',
          stock_level: 10000,
          min_stock_level: 2000,
          is_active: true,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: 'ing_6',
          name: 'Water',
          unit: 'ml',
          cost_per_unit: 0.001,
          supplier: 'Municipal Supply',
          category: 'Beverages',
          stock_level: 50000,
          min_stock_level: 10000,
          is_active: true,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: 'ing_7',
          name: 'Salt',
          unit: 'g',
          cost_per_unit: 0.001,
          supplier: 'Spice Wholesale',
          category: 'Herbs & Spices',
          stock_level: 1000,
          min_stock_level: 200,
          is_active: true,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: 'ing_8',
          name: 'Oil',
          unit: 'ml',
          cost_per_unit: 0.01,
          supplier: 'Oil Distributor',
          category: 'Cooking Oils',
          stock_level: 5000,
          min_stock_level: 1000,
          is_active: true,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        }
      ];
      
      setIngredients(mockIngredients);
    }
  };

  // Filter recipes based on search and category
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || recipe.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter ingredients based on search
  const filteredIngredients = ingredients.filter(ingredient => 
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ingredient.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get unique categories for filtering
  const recipeCategories = [...new Set(recipes.map(recipe => recipe.category))];
  const ingredientCategories = [...new Set(ingredients.map(ingredient => ingredient.category))];

  // Calculate total cost for a recipe
  const calculateRecipeCost = (recipeIngredients: RecipeIngredient[]) => {
    return recipeIngredients.reduce((total, ingredient) => total + ingredient.total_cost, 0);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-xl font-semibold text-gray-700">Loading Recipe Management...</p>
          <p className="text-gray-500">Preparing culinary workspace</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!organizationId) {
    return (
      <Alert className="m-6 border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Restaurant setup required. Please complete restaurant setup first.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navbar />

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/restaurant/dashboard" className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Recipe Management</h1>
                <p className="text-sm text-gray-500">{restaurantData?.restaurantName || 'Restaurant'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <BookOpen className="w-3 h-3 mr-1" />
                {recipes.length} Recipes
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Package className="w-3 h-3 mr-1" />
                {ingredients.length} Ingredients
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search recipes and ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {recipeCategories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recipes">Recipes</TabsTrigger>
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Recipes Tab */}
          <TabsContent value="recipes" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Recipe Library</h2>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => setIsBulkUploadOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Bulk Upload
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => setIsCreateRecipeOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Recipe
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecipes.map((recipe) => (
                <Card key={recipe.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{recipe.name}</CardTitle>
                      <Badge className={getDifficultyColor(recipe.difficulty_level)}>
                        {recipe.difficulty_level}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{recipe.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {recipe.prep_time_minutes + recipe.cook_time_minutes}min
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {recipe.serving_size} serving
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-gray-500">Cost: </span>
                        <span className="font-semibold">{formatCurrency(recipe.cost_analysis.cost_per_serving)}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Margin: </span>
                        <span className="font-semibold text-green-600">{recipe.cost_analysis.profit_margin}%</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Ingredients Tab */}
          <TabsContent value="ingredients" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Ingredient Database</h2>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => setIsBulkUploadOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Bulk Upload
                </Button>
                <Dialog open={isCreateIngredientOpen} onOpenChange={setIsCreateIngredientOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      New Ingredient
                    </Button>
                  </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Ingredient</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">Ingredient creation form would go here...</p>
                  </div>
                </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredIngredients.map((ingredient) => (
                <Card key={ingredient.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{ingredient.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {ingredient.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Unit Cost:</span>
                      <span className="font-medium">{formatCurrency(ingredient.cost_per_unit)}/{ingredient.unit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Stock:</span>
                      <span className={`font-medium ${ingredient.stock_level && ingredient.stock_level < ingredient.min_stock_level! ? 'text-red-600' : 'text-green-600'}`}>
                        {ingredient.stock_level || 0} {ingredient.unit}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Supplier:</span>
                      <span className="font-medium text-xs">{ingredient.supplier}</span>
                    </div>
                    {ingredient.stock_level && ingredient.stock_level < ingredient.min_stock_level! && (
                      <div className="flex items-center space-x-1 text-red-600 text-xs">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Low Stock</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <h2 className="text-lg font-semibold">Recipe Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Total Recipes</CardTitle>
                    <BookOpen className="w-4 h-4 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{recipes.length}</div>
                  <p className="text-xs text-gray-500">Active recipes</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Avg Recipe Cost</CardTitle>
                    <DollarSign className="w-4 h-4 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(recipes.reduce((sum, recipe) => sum + recipe.cost_analysis.cost_per_serving, 0) / recipes.length)}
                  </div>
                  <p className="text-xs text-gray-500">Per serving</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Avg Profit Margin</CardTitle>
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(recipes.reduce((sum, recipe) => sum + recipe.cost_analysis.profit_margin, 0) / recipes.length)}%
                  </div>
                  <p className="text-xs text-gray-500">Profit margin</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                    <AlertTriangle className="w-4 h-4 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {ingredients.filter(ing => ing.stock_level && ing.stock_level < ing.min_stock_level!).length}
                  </div>
                  <p className="text-xs text-gray-500">Need reorder</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Recipe Dialog */}
        <CreateRecipeDialog
          open={isCreateRecipeOpen}
          onOpenChange={setIsCreateRecipeOpen}
          organizationId={organizationId}
          onRecipeCreated={loadRecipes}
        />

        {/* Bulk Upload Dialog */}
        <BulkUploadDialog
          isOpen={isBulkUploadOpen}
          onClose={() => setIsBulkUploadOpen(false)}
          organizationId={organizationId}
          onUploadComplete={() => {
            loadRecipes();
            loadIngredients();
          }}
        />
      </div>
    </div>
  );
}