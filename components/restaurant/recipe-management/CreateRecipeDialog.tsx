/**
 * Create Recipe Dialog Component
 * Comprehensive form for creating new recipes with ingredients and cost analysis
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Trash2, 
  Calculator, 
  Clock, 
  Users, 
  ChefHat,
  AlertTriangle,
  Save,
  X,
  Search,
  DollarSign,
  Loader2
} from 'lucide-react';
import { RecipeManagementService, type RecipeCreateInput, type Ingredient } from '@/lib/services/recipeManagementService';

interface CreateRecipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  onRecipeCreated: () => void;
}

interface RecipeIngredientInput {
  ingredient_id: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  cost_per_unit: number;
  preparation_notes?: string;
  is_optional?: boolean;
  substitutes?: string[];
}

export default function CreateRecipeDialog({ 
  open, 
  onOpenChange, 
  organizationId, 
  onRecipeCreated 
}: CreateRecipeDialogProps) {
  // Form state
  const [formData, setFormData] = useState<RecipeCreateInput>({
    name: '',
    description: '',
    category: '',
    serving_size: 1,
    prep_time_minutes: 0,
    cook_time_minutes: 0,
    difficulty_level: 'easy',
    ingredients: [],
    instructions: [''],
    notes: '',
    allergen_info: [],
    dietary_info: [],
    equipment_needed: []
  });

  // Available ingredients
  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);
  const [ingredientSearch, setIngredientSearch] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showIngredientSearch, setShowIngredientSearch] = useState(false);

  // Recipe categories
  const categories = [
    'Appetizers', 'Soups', 'Salads', 'Main Courses', 'Desserts', 
    'Beverages', 'Sides', 'Sauces', 'Bread', 'Pizza', 'Pasta'
  ];

  // Difficulty levels
  const difficultyLevels = [
    { value: 'easy', label: 'Easy', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'hard', label: 'Hard', color: 'bg-red-100 text-red-800' }
  ];

  // Common allergens
  const allergens = [
    'Gluten', 'Dairy', 'Eggs', 'Nuts', 'Peanuts', 'Shellfish', 'Fish', 'Soy', 'Sesame'
  ];

  // Dietary information
  const dietaryInfo = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Paleo', 'Low-Carb', 'High-Protein'
  ];

  // Load available ingredients
  useEffect(() => {
    if (organizationId) {
      loadIngredients();
    }
  }, [organizationId]);

  const loadIngredients = async () => {
    try {
      const result = await RecipeManagementService.getIngredients(organizationId);
      if (result.success) {
        setAvailableIngredients(result.ingredients || []);
      }
    } catch (error) {
      console.error('Error loading ingredients:', error);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!formData.name || !formData.description || !formData.category) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.ingredients.length === 0) {
        throw new Error('Please add at least one ingredient');
      }

      if (formData.instructions.filter(inst => inst.trim()).length === 0) {
        throw new Error('Please add at least one instruction');
      }

      // Create recipe
      const result = await RecipeManagementService.createRecipe(organizationId, formData);
      
      if (result.success) {
        onRecipeCreated();
        onOpenChange(false);
        resetForm();
      } else {
        throw new Error(result.error || 'Failed to create recipe');
      }

    } catch (error) {
      console.error('Error creating recipe:', error);
      setError(error.message || 'Failed to create recipe');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      serving_size: 1,
      prep_time_minutes: 0,
      cook_time_minutes: 0,
      difficulty_level: 'easy',
      ingredients: [],
      instructions: [''],
      notes: '',
      allergen_info: [],
      dietary_info: [],
      equipment_needed: []
    });
    setCurrentStep(1);
    setError(null);
  };

  // Add ingredient to recipe
  const addIngredient = (ingredient: Ingredient) => {
    const newIngredient: RecipeIngredientInput = {
      ingredient_id: ingredient.id,
      ingredient_name: ingredient.name,
      quantity: 1,
      unit: ingredient.unit,
      cost_per_unit: ingredient.cost_per_unit,
      preparation_notes: '',
      is_optional: false,
      substitutes: []
    };

    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, newIngredient]
    }));
    setShowIngredientSearch(false);
    setIngredientSearch('');
  };

  // Remove ingredient from recipe
  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  // Update ingredient quantity
  const updateIngredientQuantity = (index: number, quantity: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => 
        i === index ? { ...ing, quantity } : ing
      )
    }));
  };

  // Update ingredient notes
  const updateIngredientNotes = (index: number, notes: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => 
        i === index ? { ...ing, preparation_notes: notes } : ing
      )
    }));
  };

  // Add instruction
  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  // Update instruction
  const updateInstruction = (index: number, instruction: string) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) => 
        i === index ? instruction : inst
      )
    }));
  };

  // Remove instruction
  const removeInstruction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  // Toggle allergen
  const toggleAllergen = (allergen: string) => {
    setFormData(prev => ({
      ...prev,
      allergen_info: prev.allergen_info?.includes(allergen)
        ? prev.allergen_info.filter(a => a !== allergen)
        : [...(prev.allergen_info || []), allergen]
    }));
  };

  // Toggle dietary info
  const toggleDietaryInfo = (diet: string) => {
    setFormData(prev => ({
      ...prev,
      dietary_info: prev.dietary_info?.includes(diet)
        ? prev.dietary_info.filter(d => d !== diet)
        : [...(prev.dietary_info || []), diet]
    }));
  };

  // Calculate total cost
  const calculateTotalCost = () => {
    return formData.ingredients.reduce((total, ing) => 
      total + (ing.quantity * ing.cost_per_unit), 0
    );
  };

  // Calculate cost per serving
  const calculateCostPerServing = () => {
    return calculateTotalCost() / formData.serving_size;
  };

  // Filter ingredients based on search
  const filteredIngredients = availableIngredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(ingredientSearch.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ChefHat className="w-5 h-5 mr-2" />
            Create New Recipe
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Step 1: Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Recipe Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter recipe name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the recipe..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="serving_size">Serving Size</Label>
                  <Input
                    id="serving_size"
                    type="number"
                    min="1"
                    value={formData.serving_size}
                    onChange={(e) => setFormData(prev => ({ ...prev, serving_size: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="prep_time">Prep Time (minutes)</Label>
                  <Input
                    id="prep_time"
                    type="number"
                    min="0"
                    value={formData.prep_time_minutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, prep_time_minutes: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="cook_time">Cook Time (minutes)</Label>
                  <Input
                    id="cook_time"
                    type="number"
                    min="0"
                    value={formData.cook_time_minutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, cook_time_minutes: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <Label>Difficulty Level</Label>
                <div className="flex gap-2 mt-2">
                  {difficultyLevels.map(level => (
                    <Button
                      key={level.value}
                      variant={formData.difficulty_level === level.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, difficulty_level: level.value as any }))}
                    >
                      {level.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Ingredients */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Ingredients</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowIngredientSearch(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Ingredient
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.ingredients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No ingredients added yet. Click "Add Ingredient" to start.
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{ingredient.ingredient_name}</div>
                        <div className="text-sm text-gray-500">{ingredient.unit}</div>
                      </div>
                      <div className="w-24">
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          value={ingredient.quantity}
                          onChange={(e) => updateIngredientQuantity(index, parseFloat(e.target.value))}
                          className="text-center"
                        />
                      </div>
                      <div className="w-32">
                        <Input
                          placeholder="Prep notes"
                          value={ingredient.preparation_notes || ''}
                          onChange={(e) => updateIngredientNotes(index, e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div className="w-20 text-right">
                        <span className="text-sm font-medium">
                          ${(ingredient.quantity * ingredient.cost_per_unit).toFixed(2)}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeIngredient(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Ingredient Search Modal */}
              {showIngredientSearch && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Add Ingredient</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowIngredientSearch(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search ingredients..."
                        value={ingredientSearch}
                        onChange={(e) => setIngredientSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {filteredIngredients.map(ingredient => (
                        <div
                          key={ingredient.id}
                          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                          onClick={() => addIngredient(ingredient)}
                        >
                          <div>
                            <div className="font-medium">{ingredient.name}</div>
                            <div className="text-sm text-gray-500">
                              ${ingredient.cost_per_unit.toFixed(3)}/{ingredient.unit}
                            </div>
                          </div>
                          <Plus className="w-4 h-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Cost Summary */}
              {formData.ingredients.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span>Total Ingredient Cost:</span>
                    <span className="font-medium">${calculateTotalCost().toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Cost per Serving:</span>
                    <span className="font-medium">${calculateCostPerServing().toFixed(2)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 3: Instructions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Instructions</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={addInstruction}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Step
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <Textarea
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      placeholder={`Step ${index + 1}...`}
                      rows={2}
                    />
                  </div>
                  {formData.instructions.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeInstruction(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Step 4: Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Allergen Information</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {allergens.map(allergen => (
                    <Button
                      key={allergen}
                      variant={formData.allergen_info?.includes(allergen) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleAllergen(allergen)}
                    >
                      {allergen}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Dietary Information</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {dietaryInfo.map(diet => (
                    <Button
                      key={diet}
                      variant={formData.dietary_info?.includes(diet) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleDietaryInfo(diet)}
                    >
                      {diet}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Chef Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes, tips, or variations..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {formData.prep_time_minutes + formData.cook_time_minutes} min total
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {formData.serving_size} servings
            </div>
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              ${calculateCostPerServing().toFixed(2)} per serving
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Recipe
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}