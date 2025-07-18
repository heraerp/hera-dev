/**
 * Universal Bulk Upload Component
 * Reusable bulk upload interface for all entity types
 */

'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  Info
} from 'lucide-react';
import UniversalBulkUploadService, { UniversalEntityConfig } from '@/lib/services/universalBulkUploadService';

interface UniversalBulkUploadProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  onUploadComplete: () => void;
  entityTypes: string[]; // Array of entity types to support
  defaultEntityType?: string;
  title?: string;
  description?: string;
}

interface UploadResult {
  success: number;
  failed: number;
  errors: string[];
  createdIds: string[];
}

export default function UniversalBulkUpload({ 
  isOpen, 
  onClose, 
  organizationId, 
  onUploadComplete,
  entityTypes,
  defaultEntityType,
  title = "Universal Bulk Upload",
  description = "Upload multiple items from Excel files"
}: UniversalBulkUploadProps) {
  const [activeEntityType, setActiveEntityType] = useState<string>(defaultEntityType || entityTypes[0]);
  const [uploadState, setUploadState] = useState<'idle' | 'parsing' | 'preview' | 'uploading' | 'complete'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parseResult, setParseResult] = useState<any[] | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // Get current entity configuration
  const entityConfig = UniversalBulkUploadService.getEntityConfig(activeEntityType);

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

  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!entityConfig) return;

    const file = acceptedFiles[0];
    if (!file) return;

    setUploadState('parsing');
    setError(null);
    setUploadProgress(25);

    try {
      console.log(`🚀 Parsing ${entityConfig.entityLabel} from Excel file...`);
      const result = await UniversalBulkUploadService.parseExcelFile(file, activeEntityType);
      
      if (result.success && result.data) {
        setParseResult(result.data);
        setSelectedItems(result.data.map((_, index) => index)); // Select all by default
        setUploadState('preview');
        setUploadProgress(50);
        console.log(`✅ Parsed ${result.data.length} ${entityConfig.entityLabel.toLowerCase()}`);
      } else {
        // Enhanced error message with formatting tips
        let errorMessage = result.error || 'Failed to parse Excel file';
        
        // Add helpful tips for common issues
        if (errorMessage.includes('date')) {
          errorMessage += '\n\nTip: Use YYYY-MM-DD format for dates or leave empty for optional fields.';
        }
        if (errorMessage.includes('number')) {
          errorMessage += '\n\nTip: Use decimal format for numbers (e.g., 2.50, 100.00).';
        }
        if (errorMessage.includes('required')) {
          errorMessage += '\n\nTip: Ensure all required fields are filled. Check the template requirements above.';
        }
        
        setError(errorMessage);
        setUploadState('idle');
        setUploadProgress(0);
      }
    } catch (error) {
      setError(`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}\n\nTip: Ensure the file is a valid Excel (.xlsx or .xls) file.`);
      setUploadState('idle');
      setUploadProgress(0);
    }
  }, [activeEntityType, entityConfig]);

  // Dropzone configuration
  const dropzone = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    disabled: uploadState !== 'idle'
  });

  // Handle upload confirmation
  const handleUpload = async () => {
    if (!parseResult || !organizationId || !entityConfig) return;

    setUploadState('uploading');
    setUploadProgress(75);

    try {
      const selectedData = selectedItems.map(index => parseResult[index]);
      console.log(`📤 Uploading ${selectedData.length} ${entityConfig.entityLabel.toLowerCase()}...`);
      
      const result = await UniversalBulkUploadService.uploadData(
        selectedData,
        activeEntityType,
        organizationId
      );

      if (result.success && result.results) {
        setUploadResult(result.results);
        setUploadState('complete');
        setUploadProgress(100);
        onUploadComplete();
        console.log(`✅ Upload complete: ${result.results.success} created, ${result.results.failed} failed`);
      } else {
        setError(result.error || 'Upload failed');
        setUploadState('idle');
        setUploadProgress(0);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed');
      setUploadState('idle');
      setUploadProgress(0);
    }
  };

  // Download template
  const downloadTemplate = () => {
    if (!entityConfig) return;
    UniversalBulkUploadService.generateExcelTemplate(activeEntityType);
  };

  // Render table headers based on entity configuration
  const renderTableHeaders = () => {
    if (!entityConfig) return null;

    return (
      <TableRow>
        <TableHead className="w-12">
          <input
            type="checkbox"
            checked={selectedItems.length === parseResult?.length}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedItems(parseResult?.map((_, i) => i) || []);
              } else {
                setSelectedItems([]);
              }
            }}
          />
        </TableHead>
        {entityConfig.fields.slice(0, 6).map(field => (
          <TableHead key={field.key}>{field.label}</TableHead>
        ))}
        {entityConfig.fields.length > 6 && <TableHead>...</TableHead>}
      </TableRow>
    );
  };

  // Render table rows
  const renderTableRows = () => {
    if (!parseResult || !entityConfig) return null;

    return parseResult.map((item, index) => (
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
        {entityConfig.fields.slice(0, 6).map(field => (
          <TableCell key={field.key} className={field.required ? 'font-medium' : ''}>
            {field.type === 'array' 
              ? Array.isArray(item[field.key]) 
                ? item[field.key].join(', ')
                : item[field.key]
              : field.type === 'boolean'
              ? item[field.key] ? 'Yes' : 'No'
              : field.type === 'number'
              ? typeof item[field.key] === 'number' 
                ? item[field.key].toLocaleString()
                : item[field.key]
              : field.type === 'date'
              ? item[field.key] === null || item[field.key] === '' || item[field.key] === undefined
                ? <span className="text-gray-400 italic">Empty</span>
                : <span className="text-blue-600">{item[field.key]}</span>
              : String(item[field.key] || '')
            }
          </TableCell>
        ))}
        {entityConfig.fields.length > 6 && (
          <TableCell>
            <Badge variant="outline">
              +{entityConfig.fields.length - 6} more
            </Badge>
          </TableCell>
        )}
      </TableRow>
    ));
  };

  if (!entityConfig) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              Invalid entity type: {activeEntityType}
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {title}
          </DialogTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
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
              <AlertDescription className="text-red-700">
                <div className="whitespace-pre-line">{error}</div>
              </AlertDescription>
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
                  <ScrollArea className="max-h-32 w-full">
                    <div className="space-y-1">
                      {uploadResult.errors.map((error, index) => (
                        <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          {error}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}

          {/* Main Content */}
          {uploadState === 'idle' && (
            <div className="space-y-4">
              {/* Entity Type Selection */}
              {entityTypes.length > 1 && (
                <Tabs value={activeEntityType} onValueChange={setActiveEntityType}>
                  <TabsList className="grid w-full grid-cols-3">
                    {entityTypes.map(type => {
                      const config = UniversalBulkUploadService.getEntityConfig(type);
                      return (
                        <TabsTrigger key={type} value={type}>
                          {config?.entityLabel || type}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </Tabs>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5" />
                    Upload {entityConfig.entityLabel}
                  </CardTitle>
                  <CardDescription>
                    Upload multiple {entityConfig.entityLabel.toLowerCase()} at once using an Excel file
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Template Download */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={downloadTemplate}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download Template
                    </Button>
                  </div>

                  {/* Upload Zone */}
                  <div
                    {...dropzone.getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dropzone.isDragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input {...dropzone.getInputProps()} />
                    <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium mb-2">
                      {dropzone.isDragActive
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

                  {/* Field Requirements */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Template Requirements:
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Required Fields:</strong>
                        <ul className="mt-1 space-y-1 text-gray-700">
                          {entityConfig.fields.filter(f => f.required).map(field => (
                            <li key={field.key}>• {field.label}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong>Optional Fields:</strong>
                        <ul className="mt-1 space-y-1 text-gray-700">
                          {entityConfig.fields.filter(f => !f.required).slice(0, 5).map(field => (
                            <li key={field.key}>• {field.label}</li>
                          ))}
                          {entityConfig.fields.filter(f => !f.required).length > 5 && (
                            <li>• +{entityConfig.fields.filter(f => !f.required).length - 5} more...</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Format Guidelines */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-4 w-4" />
                      Format Guidelines:
                    </h4>
                    <div className="grid grid-cols-1 gap-2 text-sm text-green-700">
                      <div><strong>Numbers:</strong> Use decimal format (e.g., 2.50, 100.00)</div>
                      <div><strong>Dates:</strong> YYYY-MM-DD format (e.g., 2024-01-15) or leave empty if not applicable</div>
                      <div><strong>Yes/No:</strong> Use true/false, yes/no, or 1/0</div>
                      <div><strong>Lists:</strong> Separate multiple values with commas (e.g., item1, item2, item3)</div>
                      <div><strong>Empty Fields:</strong> Leave optional fields empty if not applicable</div>
                    </div>
                  </div>

                  {/* Date Handling Info */}
                  {entityConfig.fields.some(f => f.type === 'date') && (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-yellow-800">
                        <AlertCircle className="h-4 w-4" />
                        Date Field Notes:
                      </h4>
                      <div className="text-sm text-yellow-700 space-y-1">
                        <div>• Supports multiple date formats: YYYY-MM-DD, MM/DD/YYYY, MM-DD-YYYY</div>
                        <div>• Excel date formats are automatically converted</div>
                        <div>• Leave date fields empty if not applicable</div>
                        <div>• Invalid dates will be highlighted during validation</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
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
                        onClick={() => setSelectedItems(parseResult.map((_, i) => i))}
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
                      {selectedItems.length} of {parseResult.length} selected
                    </Badge>
                  </div>

                  {/* Data Table */}
                  <ScrollArea className="h-96 w-full border rounded">
                    <Table>
                      <TableHeader>
                        {renderTableHeaders()}
                      </TableHeader>
                      <TableBody>
                        {renderTableRows()}
                      </TableBody>
                    </Table>
                  </ScrollArea>
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

export { UniversalBulkUpload };