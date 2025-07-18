/**
 * Bulk Upload Dialog Component
 * Handles Excel file upload and processing for ingredients and recipes
 */

'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  FileText,
  Users,
  Clock
} from 'lucide-react';
import { ExcelTemplateService } from '@/lib/services/excelTemplateService';
import type { IngredientTemplate, RecipeTemplate, RecipeIngredientTemplate } from '@/lib/services/excelTemplateService';

interface BulkUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  onUploadComplete: () => void;
}

interface UploadResult {
  success: number;
  failed: number;
  errors: string[];
  createdIds: string[];
}

export default function BulkUploadDialog({ isOpen, onClose, organizationId, onUploadComplete }: BulkUploadDialogProps) {
  const [activeTab, setActiveTab] = useState<'ingredients' | 'recipes'>('ingredients');
  const [uploadState, setUploadState] = useState<'idle' | 'parsing' | 'preview' | 'uploading' | 'complete'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parseResult, setParseResult] = useState<{
    ingredients?: IngredientTemplate[];
    recipes?: RecipeTemplate[];
    recipeIngredients?: RecipeIngredientTemplate[];
  } | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // Reset state when dialog opens/closes
  const handleClose = () => {
    setUploadState('idle');
    setUploadProgress(0);
    setParseResult(null);
    setUploadResult(null);
    setError(null);
    setSelectedItems([]);
    onClose();
  };

  // Handle file drop for ingredients
  const onDropIngredients = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadState('parsing');
    setError(null);
    setUploadProgress(25);

    try {
      const result = await ExcelTemplateService.parseIngredientsFromExcel(file);
      
      if (result.success && result.data) {
        setParseResult({ ingredients: result.data });
        setSelectedItems(result.data.map((_, index) => index)); // Select all by default
        setUploadState('preview');
        setUploadProgress(50);
        console.log('✅ Parsed ingredients:', result.data.length);
      } else {
        setError(result.error || 'Failed to parse Excel file');
        setUploadState('idle');
        setUploadProgress(0);
      }
    } catch (error) {
      setError('Failed to process file');
      setUploadState('idle');
      setUploadProgress(0);
    }
  }, []);

  // Handle file drop for recipes
  const onDropRecipes = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadState('parsing');
    setError(null);
    setUploadProgress(25);

    try {
      const result = await ExcelTemplateService.parseRecipesFromExcel(file);
      
      if (result.success && result.data) {
        setParseResult({ 
          recipes: result.data.recipes,
          recipeIngredients: result.data.ingredients
        });
        setSelectedItems(result.data.recipes.map((_, index) => index)); // Select all by default
        setUploadState('preview');
        setUploadProgress(50);
        console.log('✅ Parsed recipes:', result.data.recipes.length, 'and ingredients:', result.data.ingredients.length);
      } else {
        setError(result.error || 'Failed to parse Excel file');
        setUploadState('idle');
        setUploadProgress(0);
      }
    } catch (error) {
      setError('Failed to process file');
      setUploadState('idle');
      setUploadProgress(0);
    }
  }, []);

  // Dropzone configurations
  const ingredientsDropzone = useDropzone({
    onDrop: onDropIngredients,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    disabled: uploadState !== 'idle'
  });

  const recipesDropzone = useDropzone({
    onDrop: onDropRecipes,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    disabled: uploadState !== 'idle'
  });

  // Handle upload confirmation
  const handleUpload = async () => {
    if (!parseResult || !organizationId) return;

    setUploadState('uploading');
    setUploadProgress(75);

    try {
      let response;
      
      if (activeTab === 'ingredients' && parseResult.ingredients) {
        const selectedIngredients = selectedItems.map(index => parseResult.ingredients![index]);
        response = await fetch('/api/bulk-upload/ingredients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            organizationId,
            ingredients: selectedIngredients
          })
        });
      } else if (activeTab === 'recipes' && parseResult.recipes && parseResult.recipeIngredients) {
        const selectedRecipes = selectedItems.map(index => parseResult.recipes![index]);
        const selectedRecipeNames = selectedRecipes.map(recipe => recipe.name);
        const filteredRecipeIngredients = parseResult.recipeIngredients.filter(
          ingredient => selectedRecipeNames.includes(ingredient.recipe_name)
        );
        response = await fetch('/api/bulk-upload/recipes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            organizationId,
            recipes: selectedRecipes,
            recipeIngredients: filteredRecipeIngredients
          })
        });
      }

      if (!response || !response.ok) {
        const errorData = await response?.json();
        throw new Error(errorData?.error || 'Upload failed');
      }

      const result = await response.json();
      setUploadResult(result.results);
      setUploadState('complete');
      setUploadProgress(100);
      
      // Refresh the parent component
      onUploadComplete();
      
    } catch (error) {
      setError(error.message || 'Upload failed');
      setUploadState('idle');
      setUploadProgress(0);
    }
  };

  // Download template functions
  const downloadIngredientTemplate = () => {
    ExcelTemplateService.generateIngredientTemplate();
  };

  const downloadRecipeTemplate = () => {
    ExcelTemplateService.generateRecipeTemplate();
  };

  const downloadComprehensiveTemplate = () => {
    ExcelTemplateService.generateComprehensiveTemplate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Upload from Excel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          {uploadState !== 'idle' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {uploadState === 'parsing' && 'Parsing Excel file...'}
                  {uploadState === 'preview' && 'Ready to upload - Review and select items'}
                  {uploadState === 'uploading' && 'Uploading data...'}
                  {uploadState === 'complete' && 'Upload complete!'}
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {/* Upload Complete Results */}
          {uploadState === 'complete' && uploadResult && (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Upload completed: {uploadResult.success} items created successfully
                  {uploadResult.failed > 0 && `, ${uploadResult.failed} failed`}
                </AlertDescription>
              </Alert>
              
              {uploadResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-700">Errors:</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {uploadResult.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Main Content */}
          {uploadState === 'idle' && (
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'ingredients' | 'recipes')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                <TabsTrigger value="recipes">Recipes</TabsTrigger>
              </TabsList>

              {/* Ingredients Tab */}
              <TabsContent value="ingredients" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5" />
                      Upload Ingredients
                    </CardTitle>
                    <CardDescription>
                      Upload multiple ingredients at once using an Excel file
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Template Download */}
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={downloadIngredientTemplate}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download Template
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={downloadComprehensiveTemplate}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download Full Template
                      </Button>
                    </div>

                    {/* Upload Zone */}
                    <div
                      {...ingredientsDropzone.getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        ingredientsDropzone.isDragActive
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input {...ingredientsDropzone.getInputProps()} />
                      <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium mb-2">
                        {ingredientsDropzone.isDragActive
                          ? 'Drop the Excel file here...'
                          : 'Drag & drop an Excel file here, or click to select'}
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Supports .xlsx and .xls files
                      </p>
                      <Button variant="outline">
                        Choose File
                      </Button>
                    </div>

                    {/* Template Instructions */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Template Instructions:</h4>
                      <ul className="text-sm space-y-1 text-gray-700">
                        <li>• <strong>Required:</strong> name, unit, cost_per_unit, supplier, category</li>
                        <li>• <strong>Optional:</strong> stock_level, min_stock_level, max_stock_level, supplier_sku, storage_location, expiry_days, notes</li>
                        <li>• Cost should be a number (e.g., 2.50)</li>
                        <li>• Stock levels should be numbers</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Recipes Tab */}
              <TabsContent value="recipes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Upload Recipes
                    </CardTitle>
                    <CardDescription>
                      Upload multiple recipes at once using an Excel file with two sheets
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Template Download */}
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={downloadRecipeTemplate}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download Template
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={downloadComprehensiveTemplate}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download Full Template
                      </Button>
                    </div>

                    {/* Upload Zone */}
                    <div
                      {...recipesDropzone.getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        recipesDropzone.isDragActive
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input {...recipesDropzone.getInputProps()} />
                      <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium mb-2">
                        {recipesDropzone.isDragActive
                          ? 'Drop the Excel file here...'
                          : 'Drag & drop an Excel file here, or click to select'}
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Supports .xlsx and .xls files with "Recipes" and "Recipe Ingredients" sheets
                      </p>
                      <Button variant="outline">
                        Choose File
                      </Button>
                    </div>

                    {/* Template Instructions */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Template Instructions:</h4>
                      <div className="text-sm space-y-2 text-gray-700">
                        <div>
                          <strong>Recipes Sheet:</strong>
                          <ul className="ml-4 mt-1 space-y-1">
                            <li>• <strong>Required:</strong> name, category, serving_size, prep_time_minutes, cook_time_minutes</li>
                            <li>• <strong>Optional:</strong> description, difficulty_level, instructions, notes, allergen_info, dietary_info, equipment_needed</li>
                            <li>• Instructions: separate steps with | (pipe)</li>
                            <li>• Lists: separate items with commas</li>
                          </ul>
                        </div>
                        <div>
                          <strong>Recipe Ingredients Sheet:</strong>
                          <ul className="ml-4 mt-1 space-y-1">
                            <li>• <strong>Required:</strong> recipe_name, ingredient_name, quantity, unit</li>
                            <li>• <strong>Optional:</strong> preparation_notes, is_optional, substitutes</li>
                            <li>• recipe_name must match exactly with Recipes sheet</li>
                            <li>• ingredient_name must exist in your ingredient inventory</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {/* Preview Table */}
          {parseResult && uploadState === 'preview' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Review and Select Items
                </CardTitle>
                <CardDescription>
                  Select the items you want to upload. You can deselect any items you don't want to include.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Selection Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const totalItems = activeTab === 'ingredients' 
                            ? parseResult.ingredients?.length || 0
                            : parseResult.recipes?.length || 0;
                          setSelectedItems(Array.from({ length: totalItems }, (_, i) => i));
                        }}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedItems([])}
                      >
                        Select None
                      </Button>
                    </div>
                    <Badge variant="secondary">
                      {selectedItems.length} of {activeTab === 'ingredients' 
                        ? parseResult.ingredients?.length || 0
                        : parseResult.recipes?.length || 0} selected
                    </Badge>
                  </div>

                  {/* Ingredients Table */}
                  {parseResult.ingredients && activeTab === 'ingredients' && (
                    <ScrollArea className="h-96 w-full border rounded">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">
                              <input
                                type="checkbox"
                                checked={selectedItems.length === parseResult.ingredients.length}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedItems(parseResult.ingredients!.map((_, i) => i));
                                  } else {
                                    setSelectedItems([]);
                                  }
                                }}
                              />
                            </TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead>Cost/Unit</TableHead>
                            <TableHead>Supplier</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Stock</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {parseResult.ingredients.map((ingredient, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <input
                                  type="checkbox"
                                  checked={selectedItems.includes(index)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedItems([...selectedItems, index]);
                                    } else {
                                      setSelectedItems(selectedItems.filter(i => i !== index));
                                    }
                                  }}
                                />
                              </TableCell>
                              <TableCell className="font-medium">{ingredient.name}</TableCell>
                              <TableCell>{ingredient.unit}</TableCell>
                              <TableCell>${ingredient.cost_per_unit}</TableCell>
                              <TableCell>{ingredient.supplier}</TableCell>
                              <TableCell>{ingredient.category}</TableCell>
                              <TableCell>{ingredient.stock_level || 0}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  )}

                  {/* Recipes Table */}
                  {parseResult.recipes && activeTab === 'recipes' && (
                    <ScrollArea className="h-96 w-full border rounded">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">
                              <input
                                type="checkbox"
                                checked={selectedItems.length === parseResult.recipes.length}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedItems(parseResult.recipes!.map((_, i) => i));
                                  } else {
                                    setSelectedItems([]);
                                  }
                                }}
                              />
                            </TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Servings</TableHead>
                            <TableHead>Prep Time</TableHead>
                            <TableHead>Cook Time</TableHead>
                            <TableHead>Difficulty</TableHead>
                            <TableHead>Ingredients</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {parseResult.recipes.map((recipe, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <input
                                  type="checkbox"
                                  checked={selectedItems.includes(index)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedItems([...selectedItems, index]);
                                    } else {
                                      setSelectedItems(selectedItems.filter(i => i !== index));
                                    }
                                  }}
                                />
                              </TableCell>
                              <TableCell className="font-medium">{recipe.name}</TableCell>
                              <TableCell>{recipe.category}</TableCell>
                              <TableCell>{recipe.serving_size}</TableCell>
                              <TableCell>{recipe.prep_time_minutes}m</TableCell>
                              <TableCell>{recipe.cook_time_minutes}m</TableCell>
                              <TableCell>
                                <Badge variant="outline">{recipe.difficulty_level}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">
                                  {parseResult.recipeIngredients?.filter(
                                    ing => ing.recipe_name === recipe.name
                                  ).length || 0}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {uploadState === 'complete' ? 'Close' : 'Cancel'}
          </Button>
          
          {uploadState === 'preview' && (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setUploadState('idle');
                  setParseResult(null);
                  setSelectedItems([]);
                  setUploadProgress(0);
                }}
              >
                Back to Upload
              </Button>
              <Button 
                onClick={handleUpload} 
                className="flex items-center gap-2"
                disabled={selectedItems.length === 0}
              >
                <Upload className="h-4 w-4" />
                Upload {selectedItems.length} Item{selectedItems.length !== 1 ? 's' : ''}
              </Button>
            </div>
          )}
          
          {uploadState === 'uploading' && (
            <Button disabled className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}