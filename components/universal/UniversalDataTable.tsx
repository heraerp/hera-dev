/**
 * HERA Universal Data Table
 * Displays data from ANY entity type in a beautiful, interactive table
 * Works with the Dynamic Form Generator for complete CRUD operations
 */

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  universalEntityManager, 
  UniversalSearchOptions, 
  UniversalEntityResponse,
  CoreDynamicData 
} from '@/lib/universal-entity-manager';
import { DynamicFormGenerator } from './DynamicFormGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
  Trash2,
  RefreshCw,
  Download,
  Upload,
  MoreHorizontal,
  SortAsc,
  SortDesc,
  Calendar,
  DollarSign,
  Hash,
  Type,
  Mail,
  Phone,
  Globe,
  FileText,
  User,
  Building,
  Package,
  Brain,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Column Configuration
interface ColumnConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'currency' | 'boolean' | 'email' | 'phone' | 'url' | 'select';
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

// Universal Data Table Props
interface UniversalDataTableProps {
  organizationId: string;
  entityType: string;
  title?: string;
  description?: string;
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  paginated?: boolean;
  editable?: boolean;
  deletable?: boolean;
  exportable?: boolean;
  onRowClick?: (row: any) => void;
  onRowEdit?: (row: any) => void;
  onRowDelete?: (row: any) => void;
  className?: string;
  pageSize?: number;
  columns?: ColumnConfig[];
  actions?: {
    create?: boolean;
    edit?: boolean;
    delete?: boolean;
    view?: boolean;
    custom?: Array<{
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      onClick: (row: any) => void;
      variant?: 'default' | 'destructive' | 'outline' | 'secondary';
    }>;
  };
}

// Field type icons mapping
const FIELD_TYPE_ICONS = {
  text: Type,
  number: Hash,
  date: Calendar,
  currency: DollarSign,
  boolean: CheckCircle,
  email: Mail,
  phone: Phone,
  url: Globe,
  select: FileText,
  textarea: FileText,
  file: FileText,
  user: User,
  building: Building,
  package: Package,
  ai_generated: Brain,
  ai_classification: Sparkles
};

// Data formatting utilities
const formatCellValue = (value: any, type: string) => {
  if (value === null || value === undefined || value === '') {
    return <span className="text-gray-400">—</span>;
  }

  switch (type) {
    case 'currency':
      return (
        <span className="font-medium text-green-600">
          ${parseFloat(value).toFixed(2)}
        </span>
      );
    
    case 'date':
      return (
        <span className="text-gray-600">
          {format(new Date(value), 'MMM dd, yyyy')}
        </span>
      );
    
    case 'boolean':
      return (
        <Badge className={value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
          {value ? 'Yes' : 'No'}
        </Badge>
      );
    
    case 'email':
      return (
        <a href={`mailto:${value}`} className="text-blue-600 hover:underline">
          {value}
        </a>
      );
    
    case 'phone':
      return (
        <a href={`tel:${value}`} className="text-blue-600 hover:underline">
          {value}
        </a>
      );
    
    case 'url':
      return (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          {value}
        </a>
      );
    
    case 'select':
      return (
        <Badge variant="outline">
          {value.replace(/_/g, ' ').toUpperCase()}
        </Badge>
      );
    
    default:
      return String(value);
  }
};

export function UniversalDataTable({
  organizationId,
  entityType,
  title,
  description,
  searchable = true,
  filterable = true,
  sortable = true,
  paginated = true,
  editable = true,
  deletable = true,
  exportable = true,
  onRowClick,
  onRowEdit,
  onRowDelete,
  className,
  pageSize = 10,
  columns: customColumns,
  actions = { create: true, edit: true, delete: true, view: true }
}: UniversalDataTableProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingEntity, setEditingEntity] = useState<any>(null);
  const [columns, setColumns] = useState<ColumnConfig[]>([]);
  const [filters, setFilters] = useState<Record<string, any>>({});

  // Load data on mount and when search/sort/pagination changes
  useEffect(() => {
    loadData();
  }, [organizationId, entityType, searchQuery, sortBy, sortOrder, currentPage]);

  // Generate columns from first data row
  useEffect(() => {
    if (data.length > 0 && !customColumns) {
      generateColumns();
    } else if (customColumns) {
      setColumns(customColumns);
    }
  }, [data, customColumns]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const searchOptions: UniversalSearchOptions = {
        organization_id: organizationId,
        entity_type: entityType,
        search_query: searchQuery || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
        filters: Object.keys(filters).length > 0 ? filters : undefined
      };

      const result = await universalEntityManager.searchEntities(searchOptions);
      
      if (result.success) {
        // Transform data for table display
        const transformedData = result.entities.map(entity => {
          const row: any = {
            id: entity.id,
            entity_name: entity.entity_name,
            entity_code: entity.entity_code,
            created_at: entity.created_at,
            updated_at: entity.updated_at,
            is_active: entity.is_active
          };

          // Add dynamic fields
          if (entity.core_dynamic_data) {
            entity.core_dynamic_data.forEach((field: CoreDynamicData) => {
              row[field.field_name] = field.field_value;
            });
          }

          return row;
        });

        setData(transformedData);
        setTotalItems(result.total);
      } else {
        setError(result.error || 'Failed to load data');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const generateColumns = () => {
    if (data.length === 0) return;

    const firstRow = data[0];
    const generatedColumns: ColumnConfig[] = [];

    // Add entity columns
    generatedColumns.push({
      key: 'entity_name',
      label: 'Name',
      type: 'text',
      sortable: true,
      filterable: true,
      width: '200px'
    });

    generatedColumns.push({
      key: 'entity_code',
      label: 'Code',
      type: 'text',
      sortable: true,
      filterable: true,
      width: '150px'
    });

    // Add dynamic field columns
    Object.keys(firstRow).forEach(key => {
      if (!['id', 'entity_name', 'entity_code', 'created_at', 'updated_at', 'is_active'].includes(key)) {
        const value = firstRow[key];
        let type: ColumnConfig['type'] = 'text';

        // Infer type from value
        if (typeof value === 'number') {
          type = 'number';
        } else if (typeof value === 'boolean') {
          type = 'boolean';
        } else if (typeof value === 'string') {
          if (value.includes('@')) type = 'email';
          else if (value.match(/^\d{4}-\d{2}-\d{2}/)) type = 'date';
          else if (value.match(/^\$\d/)) type = 'currency';
          else if (value.match(/^https?:\/\//)) type = 'url';
          else if (value.match(/^[\d\s\-\+\(\)]+$/)) type = 'phone';
        }

        generatedColumns.push({
          key,
          label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          type,
          sortable: true,
          filterable: true,
          width: '150px'
        });
      }
    });

    // Add timestamp columns
    generatedColumns.push({
      key: 'created_at',
      label: 'Created',
      type: 'date',
      sortable: true,
      width: '150px'
    });

    setColumns(generatedColumns);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleEdit = (row: any) => {
    setEditingEntity(row);
    setShowEditDialog(true);
    onRowEdit?.(row);
  };

  const handleDelete = async (row: any) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const result = await universalEntityManager.deleteEntity(row.id);
        if (result.success) {
          loadData(); // Refresh data
        } else {
          alert('Failed to delete item');
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item');
      }
    }
    onRowDelete?.(row);
  };

  const handleFormSubmit = (data: any) => {
    setShowCreateDialog(false);
    setShowEditDialog(false);
    setEditingEntity(null);
    loadData(); // Refresh data
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  const renderTableHeader = () => (
    <TableHeader>
      <TableRow>
        {columns.map(column => (
          <TableHead 
            key={column.key} 
            className={cn(
              column.sortable && 'cursor-pointer hover:bg-gray-50',
              column.width && `w-[${column.width}]`
            )}
            onClick={() => column.sortable && handleSort(column.key)}
          >
            <div className="flex items-center space-x-2">
              <span>{column.label}</span>
              {column.sortable && (
                <div className="flex flex-col">
                  <SortAsc className={cn(
                    'h-3 w-3',
                    sortBy === column.key && sortOrder === 'asc' ? 'text-blue-600' : 'text-gray-400'
                  )} />
                  <SortDesc className={cn(
                    'h-3 w-3',
                    sortBy === column.key && sortOrder === 'desc' ? 'text-blue-600' : 'text-gray-400'
                  )} />
                </div>
              )}
            </div>
          </TableHead>
        ))}
        {(actions.edit || actions.delete || actions.view || actions.custom) && (
          <TableHead className="w-[100px]">Actions</TableHead>
        )}
      </TableRow>
    </TableHeader>
  );

  const renderTableRow = (row: any, index: number) => (
    <motion.tr
      key={row.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        'cursor-pointer hover:bg-gray-50',
        selectedRows.has(row.id) && 'bg-blue-50'
      )}
      onClick={() => onRowClick?.(row)}
    >
      {columns.map(column => {
        const value = row[column.key];
        const Icon = FIELD_TYPE_ICONS[column.type] || Type;
        
        return (
          <TableCell key={column.key} className={column.width && `w-[${column.width}]`}>
            <div className="flex items-center space-x-2">
              <Icon className="h-4 w-4 text-gray-400" />
              <span>{column.render ? column.render(value, row) : formatCellValue(value, column.type)}</span>
            </div>
          </TableCell>
        );
      })}
      
      {(actions.edit || actions.delete || actions.view || actions.custom) && (
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {actions.view && (
                <DropdownMenuItem onClick={() => onRowClick?.(row)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
              )}
              {actions.edit && (
                <DropdownMenuItem onClick={() => handleEdit(row)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {actions.delete && (
                <DropdownMenuItem 
                  onClick={() => handleDelete(row)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
              {actions.custom?.map((action, index) => (
                <DropdownMenuItem 
                  key={index} 
                  onClick={() => action.onClick(row)}
                  className={action.variant === 'destructive' ? 'text-red-600' : ''}
                >
                  <action.icon className="mr-2 h-4 w-4" />
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      )}
    </motion.tr>
  );

  const renderPagination = () => (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="flex items-center space-x-2">
        <Label className="text-sm text-gray-600">
          Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
        </Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center space-x-1">
          <Input
            type="number"
            value={currentPage}
            onChange={(e) => setCurrentPage(parseInt(e.target.value) || 1)}
            className="w-12 h-8 text-center"
            min={1}
            max={totalPages}
          />
          <span className="text-sm text-gray-600">of {totalPages}</span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-4">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            <div>
              <h3 className="text-lg font-semibold">Loading Data</h3>
              <p className="text-gray-600">Fetching {entityType} data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-3">
              <Database className="h-6 w-6" />
              <span>{title || `${entityType.replace(/_/g, ' ').toUpperCase()} Data`}</span>
              <Badge className="bg-blue-100 text-blue-800">
                <Brain className="h-3 w-3 mr-1" />
                Universal
              </Badge>
            </CardTitle>
            {description && (
              <p className="text-gray-600 mt-1">{description}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {actions.create && (
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New {entityType.replace(/_/g, ' ')}</DialogTitle>
                  </DialogHeader>
                  <DynamicFormGenerator
                    organizationId={organizationId}
                    entityType={entityType}
                    onFormSubmit={handleFormSubmit}
                    mode="create"
                  />
                </DialogContent>
              </Dialog>
            )}
            
            <Button
              variant="outline"
              onClick={loadData}
              disabled={loading}
            >
              <RefreshCw className={cn('mr-2 h-4 w-4', loading && 'animate-spin')} />
              Refresh
            </Button>
            
            {exportable && (
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            )}
          </div>
        </div>
        
        {/* Search and Filter Bar */}
        {(searchable || filterable) && (
          <div className="flex items-center space-x-4 mt-4">
            {searchable && (
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={`Search ${entityType.replace(/_/g, ' ')}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
            
            {filterable && (
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-12">
            <Database className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Data Found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? 'No results match your search.' : `No ${entityType.replace(/_/g, ' ')} records found.`}
            </p>
            {actions.create && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create First {entityType.replace(/_/g, ' ')}
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                {renderTableHeader()}
                <TableBody>
                  {data.map((row, index) => renderTableRow(row, index))}
                </TableBody>
              </Table>
            </div>
            
            {paginated && renderPagination()}
          </>
        )}
      </CardContent>
      
      {/* Edit Dialog */}
      {showEditDialog && editingEntity && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit {entityType.replace(/_/g, ' ')}</DialogTitle>
            </DialogHeader>
            <DynamicFormGenerator
              organizationId={organizationId}
              entityType={entityType}
              onFormSubmit={handleFormSubmit}
              mode="edit"
              existingEntity={{
                entity: editingEntity,
                fields: [],
                metadata: [],
                success: true
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}