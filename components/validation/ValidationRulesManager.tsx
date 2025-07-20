'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Hash,
  Calendar,
  Type,
  Settings
} from 'lucide-react';

interface ValidationRule {
  id: string;
  name: string;
  code: string;
  targetEntityType: string;
  targetFieldName: string;
  validationType: 'numeric_range' | 'regex_pattern' | 'date_rule' | 'custom';
  minValue?: number;
  maxValue?: number;
  regexPattern?: string;
  ruleExpression?: string;
  errorMessage: string;
  isActive: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

interface ValidationRulesManagerProps {
  organizationId: string;
}

export function ValidationRulesManager({ organizationId }: ValidationRulesManagerProps) {
  const [rules, setRules] = useState<ValidationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<ValidationRule | null>(null);
  const [summary, setSummary] = useState<any>({});

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    targetEntityType: '',
    targetFieldName: '',
    validationType: 'numeric_range' as const,
    minValue: '',
    maxValue: '',
    regexPattern: '',
    ruleExpression: '',
    errorMessage: '',
    isActive: true
  });

  // Entity types for dropdown
  const entityTypes = [
    'menu_item', 'restaurant_table', 'employee', 'customer', 'supplier',
    'inventory_item', 'purchase_order', 'invoice', 'order', 'payment'
  ];

  // Common field names by entity type
  const commonFields: Record<string, string[]> = {
    menu_item: ['name', 'price', 'cost_price', 'preparation_time', 'calories'],
    restaurant_table: ['table_number', 'seat_capacity', 'section'],
    employee: ['name', 'email', 'phone', 'hire_date', 'salary'],
    customer: ['name', 'email', 'phone', 'birth_date'],
    supplier: ['name', 'email', 'phone', 'credit_limit'],
    inventory_item: ['name', 'quantity', 'unit_price', 'reorder_level'],
    purchase_order: ['total_amount', 'delivery_date'],
    invoice: ['amount', 'due_date'],
    order: ['total_amount', 'order_date'],
    payment: ['amount', 'payment_date']
  };

  // Pre-defined regex patterns
  const regexPatterns = {
    email: '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$',
    phone: '^[\\+]?[0-9]?[0-9\\s\\-\\(\\)\\.]{7,15}$',
    url: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$',
    zipcode: '^\\d{5}(-\\d{4})?$',
    credit_card: '^\\d{13,19}$'
  };

  // Date rule expressions
  const dateRules = {
    no_future_dates: 'Date cannot be in the future',
    no_past_dates: 'Date cannot be in the past',
    within_year: 'Date must be within current year',
    business_days_only: 'Must be a business day (Mon-Fri)'
  };

  useEffect(() => {
    fetchRules();
  }, [organizationId]);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/validation-rules?organizationId=${organizationId}`);
      const data = await response.json();
      
      if (data.data) {
        setRules(data.data);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching validation rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async () => {
    try {
      const payload = {
        organizationId,
        name: formData.name,
        targetEntityType: formData.targetEntityType,
        targetFieldName: formData.targetFieldName,
        validationType: formData.validationType,
        errorMessage: formData.errorMessage,
        isActive: formData.isActive,
        ...(formData.validationType === 'numeric_range' && {
          minValue: formData.minValue ? parseFloat(formData.minValue) : undefined,
          maxValue: formData.maxValue ? parseFloat(formData.maxValue) : undefined
        }),
        ...(formData.validationType === 'regex_pattern' && {
          regexPattern: formData.regexPattern
        }),
        ...(formData.validationType === 'date_rule' && {
          ruleExpression: formData.ruleExpression
        })
      };

      const response = await fetch('/api/validation-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setShowCreateDialog(false);
        resetForm();
        fetchRules();
      }
    } catch (error) {
      console.error('Error creating validation rule:', error);
    }
  };

  const handleUpdateRule = async () => {
    if (!editingRule) return;

    try {
      const payload = {
        id: editingRule.id,
        name: formData.name,
        targetEntityType: formData.targetEntityType,
        targetFieldName: formData.targetFieldName,
        errorMessage: formData.errorMessage,
        isActive: formData.isActive,
        ...(formData.validationType === 'numeric_range' && {
          minValue: formData.minValue ? parseFloat(formData.minValue) : undefined,
          maxValue: formData.maxValue ? parseFloat(formData.maxValue) : undefined
        }),
        ...(formData.validationType === 'regex_pattern' && {
          regexPattern: formData.regexPattern
        }),
        ...(formData.validationType === 'date_rule' && {
          ruleExpression: formData.ruleExpression
        })
      };

      const response = await fetch('/api/validation-rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setEditingRule(null);
        resetForm();
        fetchRules();
      }
    } catch (error) {
      console.error('Error updating validation rule:', error);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this validation rule?')) return;

    try {
      const response = await fetch(`/api/validation-rules?id=${ruleId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchRules();
      }
    } catch (error) {
      console.error('Error deleting validation rule:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      targetEntityType: '',
      targetFieldName: '',
      validationType: 'numeric_range',
      minValue: '',
      maxValue: '',
      regexPattern: '',
      ruleExpression: '',
      errorMessage: '',
      isActive: true
    });
  };

  const openEditDialog = (rule: ValidationRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      targetEntityType: rule.targetEntityType,
      targetFieldName: rule.targetFieldName,
      validationType: rule.validationType,
      minValue: rule.minValue?.toString() || '',
      maxValue: rule.maxValue?.toString() || '',
      regexPattern: rule.regexPattern || '',
      ruleExpression: rule.ruleExpression || '',
      errorMessage: rule.errorMessage,
      isActive: rule.isActive
    });
  };

  const getValidationTypeIcon = (type: string) => {
    switch (type) {
      case 'numeric_range': return <Hash className="w-4 h-4" />;
      case 'regex_pattern': return <Type className="w-4 h-4" />;
      case 'date_rule': return <Calendar className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getValidationTypeColor = (type: string) => {
    switch (type) {
      case 'numeric_range': return 'bg-blue-100 text-blue-800';
      case 'regex_pattern': return 'bg-purple-100 text-purple-800';
      case 'date_rule': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.targetEntityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.targetFieldName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || rule.validationType === filterType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && rule.isActive) ||
                         (filterStatus === 'inactive' && !rule.isActive);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const renderFormFields = () => {
    switch (formData.validationType) {
      case 'numeric_range':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minValue">Minimum Value</Label>
              <Input
                id="minValue"
                type="number"
                placeholder="e.g., 0.01"
                value={formData.minValue}
                onChange={(e) => setFormData({ ...formData, minValue: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="maxValue">Maximum Value</Label>
              <Input
                id="maxValue"
                type="number"
                placeholder="e.g., 999.99"
                value={formData.maxValue}
                onChange={(e) => setFormData({ ...formData, maxValue: e.target.value })}
              />
            </div>
          </div>
        );
      
      case 'regex_pattern':
        return (
          <div>
            <Label htmlFor="regexPattern">Regular Expression Pattern</Label>
            <div className="space-y-2">
              <Input
                id="regexPattern"
                placeholder="Enter regex pattern or select preset"
                value={formData.regexPattern}
                onChange={(e) => setFormData({ ...formData, regexPattern: e.target.value })}
              />
              <div className="flex flex-wrap gap-2">
                {Object.entries(regexPatterns).map(([key, pattern]) => (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, regexPattern: pattern })}
                  >
                    {key}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'date_rule':
        return (
          <div>
            <Label htmlFor="ruleExpression">Date Rule</Label>
            <Select
              value={formData.ruleExpression}
              onValueChange={(value) => setFormData({ ...formData, ruleExpression: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select date rule" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(dateRules).map(([key, description]) => (
                  <SelectItem key={key} value={key}>
                    {description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Validation Rules Manager</h2>
          <p className="text-gray-600">Configure field validation rules for your organization</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Create Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Validation Rule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Rule Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Menu Item Price Validation"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targetEntityType">Entity Type</Label>
                  <Select
                    value={formData.targetEntityType}
                    onValueChange={(value) => setFormData({ ...formData, targetEntityType: value, targetFieldName: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select entity type" />
                    </SelectTrigger>
                    <SelectContent>
                      {entityTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="targetFieldName">Field Name</Label>
                  <Select
                    value={formData.targetFieldName}
                    onValueChange={(value) => setFormData({ ...formData, targetFieldName: value })}
                    disabled={!formData.targetEntityType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {(commonFields[formData.targetEntityType] || []).map(field => (
                        <SelectItem key={field} value={field}>
                          {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="validationType">Validation Type</Label>
                <Select
                  value={formData.validationType}
                  onValueChange={(value: any) => setFormData({ ...formData, validationType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="numeric_range">Numeric Range</SelectItem>
                    <SelectItem value="regex_pattern">Regex Pattern</SelectItem>
                    <SelectItem value="date_rule">Date Rule</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {renderFormFields()}
              
              <div>
                <Label htmlFor="errorMessage">Error Message</Label>
                <Textarea
                  id="errorMessage"
                  placeholder="Message to show when validation fails"
                  value={formData.errorMessage}
                  onChange={(e) => setFormData({ ...formData, errorMessage: e.target.value })}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRule}>
                  Create Rule
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Rules</p>
                <p className="text-2xl font-bold">{summary.total_rules || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Active Rules</p>
                <p className="text-2xl font-bold">{summary.active_rules || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Hash className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Numeric Rules</p>
                <p className="text-2xl font-bold">{summary.numeric_rules || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Type className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Pattern Rules</p>
                <p className="text-2xl font-bold">{summary.regex_rules || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search rules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="numeric_range">Numeric Range</SelectItem>
                <SelectItem value="regex_pattern">Regex Pattern</SelectItem>
                <SelectItem value="date_rule">Date Rule</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rules List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading validation rules...</p>
            </CardContent>
          </Card>
        ) : filteredRules.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Validation Rules Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                  ? 'No rules match your current filters.'
                  : 'Get started by creating your first validation rule.'}
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Rule
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredRules.map((rule) => (
            <Card key={rule.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{rule.name}</h3>
                      <Badge variant={rule.isActive ? "default" : "secondary"}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge className={getValidationTypeColor(rule.validationType)}>
                        {getValidationTypeIcon(rule.validationType)}
                        <span className="ml-1">
                          {rule.validationType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">Entity Type:</span> {rule.targetEntityType}
                      </div>
                      <div>
                        <span className="font-medium">Field Name:</span> {rule.targetFieldName}
                      </div>
                      <div>
                        <span className="font-medium">Code:</span> {rule.code}
                      </div>
                    </div>
                    
                    {/* Validation Details */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Validation Details:</p>
                      {rule.validationType === 'numeric_range' && (
                        <p className="text-sm text-gray-600">
                          Range: {rule.minValue ?? 'No min'} - {rule.maxValue ?? 'No max'}
                        </p>
                      )}
                      {rule.validationType === 'regex_pattern' && (
                        <p className="text-sm text-gray-600 font-mono">
                          Pattern: {rule.regexPattern}
                        </p>
                      )}
                      {rule.validationType === 'date_rule' && (
                        <p className="text-sm text-gray-600">
                          Rule: {rule.ruleExpression}
                        </p>
                      )}
                    </div>
                    
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-red-700 mb-1">Error Message:</p>
                      <p className="text-sm text-red-600">{rule.errorMessage}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(rule)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Validation Rule</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          {/* Same form fields as create dialog */}
                          <div>
                            <Label htmlFor="edit-name">Rule Name</Label>
                            <Input
                              id="edit-name"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Entity Type</Label>
                              <Input value={formData.targetEntityType} disabled />
                            </div>
                            <div>
                              <Label>Field Name</Label>
                              <Input value={formData.targetFieldName} disabled />
                            </div>
                          </div>
                          
                          {renderFormFields()}
                          
                          <div>
                            <Label htmlFor="edit-errorMessage">Error Message</Label>
                            <Textarea
                              id="edit-errorMessage"
                              value={formData.errorMessage}
                              onChange={(e) => setFormData({ ...formData, errorMessage: e.target.value })}
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="edit-isActive"
                              checked={formData.isActive}
                              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                            />
                            <Label htmlFor="edit-isActive">Active</Label>
                          </div>
                          
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setEditingRule(null)}>
                              Cancel
                            </Button>
                            <Button onClick={handleUpdateRule}>
                              Update Rule
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteRule(rule.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}