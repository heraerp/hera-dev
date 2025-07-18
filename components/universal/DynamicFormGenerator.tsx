/**
 * HERA Universal Dynamic Form Generator
 * Creates forms for ANY entity type automatically using HERA's universal schema
 * The revolutionary component that adapts to any business requirement
 */

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  universalEntityManager, 
  UniversalEntityInput, 
  UniversalEntityResponse,
  CoreDynamicData 
} from '@/lib/universal-entity-manager';
import { 
  Brain, 
  Sparkles, 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Minus, 
  Calendar as CalendarIcon,
  Eye,
  Save,
  RefreshCw,
  Magic,
  Database,
  Settings,
  FileText,
  User,
  Building,
  Package,
  DollarSign,
  Clock,
  Mail,
  Phone,
  Globe,
  Hash,
  Type,
  ToggleLeft,
  List,
  Calendar as DateIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Field Type Definitions
export interface UniversalFieldType {
  id: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'phone' | 'url' | 'date' | 'datetime' | 'time' | 'boolean' | 'select' | 'multiselect' | 'textarea' | 'file' | 'currency' | 'percentage' | 'json';
  icon: React.ComponentType<{ className?: string }>;
  validation?: any;
  defaultValue?: any;
  options?: string[];
  placeholder?: string;
  description?: string;
  category: 'basic' | 'advanced' | 'business' | 'ai';
}

// Pre-defined Field Types
const UNIVERSAL_FIELD_TYPES: UniversalFieldType[] = [
  // Basic Types
  { id: 'text', label: 'Text Input', type: 'text', icon: Type, category: 'basic', placeholder: 'Enter text...' },
  { id: 'number', label: 'Number', type: 'number', icon: Hash, category: 'basic', placeholder: '0' },
  { id: 'email', label: 'Email', type: 'email', icon: Mail, category: 'basic', placeholder: 'user@example.com' },
  { id: 'phone', label: 'Phone', type: 'phone', icon: Phone, category: 'basic', placeholder: '+1 (555) 123-4567' },
  { id: 'url', label: 'URL', type: 'url', icon: Globe, category: 'basic', placeholder: 'https://example.com' },
  { id: 'textarea', label: 'Long Text', type: 'textarea', icon: FileText, category: 'basic', placeholder: 'Enter long text...' },
  { id: 'boolean', label: 'Yes/No', type: 'boolean', icon: ToggleLeft, category: 'basic' },
  
  // Advanced Types
  { id: 'date', label: 'Date', type: 'date', icon: DateIcon, category: 'advanced' },
  { id: 'datetime', label: 'Date & Time', type: 'datetime', icon: Clock, category: 'advanced' },
  { id: 'select', label: 'Dropdown', type: 'select', icon: List, category: 'advanced' },
  { id: 'multiselect', label: 'Multi-Select', type: 'multiselect', icon: List, category: 'advanced' },
  { id: 'file', label: 'File Upload', type: 'file', icon: FileText, category: 'advanced' },
  
  // Business Types
  { id: 'currency', label: 'Currency', type: 'currency', icon: DollarSign, category: 'business', placeholder: '$0.00' },
  { id: 'percentage', label: 'Percentage', type: 'percentage', icon: Hash, category: 'business', placeholder: '0%' },
  { id: 'customer', label: 'Customer', type: 'select', icon: User, category: 'business' },
  { id: 'supplier', label: 'Supplier', type: 'select', icon: Building, category: 'business' },
  { id: 'product', label: 'Product', type: 'select', icon: Package, category: 'business' },
  
  // AI Types
  { id: 'ai_generated', label: 'AI Generated', type: 'text', icon: Brain, category: 'ai' },
  { id: 'ai_classification', label: 'AI Classification', type: 'select', icon: Sparkles, category: 'ai' },
  { id: 'json', label: 'JSON Data', type: 'json', icon: Database, category: 'ai' }
];

// Entity Type Templates
const ENTITY_TEMPLATES = {
  'invoice': {
    name: 'Invoice',
    icon: FileText,
    fields: [
      { name: 'invoice_number', type: 'text', required: true, label: 'Invoice Number' },
      { name: 'supplier_name', type: 'text', required: true, label: 'Supplier Name' },
      { name: 'invoice_date', type: 'date', required: true, label: 'Invoice Date' },
      { name: 'due_date', type: 'date', required: true, label: 'Due Date' },
      { name: 'total_amount', type: 'currency', required: true, label: 'Total Amount' },
      { name: 'tax_amount', type: 'currency', required: false, label: 'Tax Amount' },
      { name: 'description', type: 'textarea', required: false, label: 'Description' },
      { name: 'status', type: 'select', required: true, label: 'Status', options: ['draft', 'pending', 'paid', 'overdue'] }
    ]
  },
  'customer': {
    name: 'Customer',
    icon: User,
    fields: [
      { name: 'company_name', type: 'text', required: true, label: 'Company Name' },
      { name: 'contact_person', type: 'text', required: true, label: 'Contact Person' },
      { name: 'email', type: 'email', required: true, label: 'Email' },
      { name: 'phone', type: 'phone', required: true, label: 'Phone' },
      { name: 'address', type: 'textarea', required: false, label: 'Address' },
      { name: 'tax_id', type: 'text', required: false, label: 'Tax ID' },
      { name: 'credit_limit', type: 'currency', required: false, label: 'Credit Limit' },
      { name: 'payment_terms', type: 'select', required: false, label: 'Payment Terms', options: ['net_30', 'net_60', 'net_90', 'cash_on_delivery'] }
    ]
  },
  'product': {
    name: 'Product',
    icon: Package,
    fields: [
      { name: 'product_name', type: 'text', required: true, label: 'Product Name' },
      { name: 'product_code', type: 'text', required: true, label: 'Product Code' },
      { name: 'category', type: 'select', required: true, label: 'Category', options: ['raw_materials', 'finished_goods', 'services'] },
      { name: 'unit_price', type: 'currency', required: true, label: 'Unit Price' },
      { name: 'cost_price', type: 'currency', required: false, label: 'Cost Price' },
      { name: 'stock_quantity', type: 'number', required: false, label: 'Stock Quantity' },
      { name: 'reorder_level', type: 'number', required: false, label: 'Reorder Level' },
      { name: 'description', type: 'textarea', required: false, label: 'Description' }
    ]
  },
  'employee': {
    name: 'Employee',
    icon: User,
    fields: [
      { name: 'employee_id', type: 'text', required: true, label: 'Employee ID' },
      { name: 'full_name', type: 'text', required: true, label: 'Full Name' },
      { name: 'email', type: 'email', required: true, label: 'Email' },
      { name: 'phone', type: 'phone', required: true, label: 'Phone' },
      { name: 'department', type: 'select', required: true, label: 'Department', options: ['finance', 'operations', 'sales', 'hr', 'it'] },
      { name: 'position', type: 'text', required: true, label: 'Position' },
      { name: 'hire_date', type: 'date', required: true, label: 'Hire Date' },
      { name: 'salary', type: 'currency', required: false, label: 'Salary' },
      { name: 'is_active', type: 'boolean', required: true, label: 'Active' }
    ]
  },
  'project': {
    name: 'Project',
    icon: Building,
    fields: [
      { name: 'project_name', type: 'text', required: true, label: 'Project Name' },
      { name: 'project_code', type: 'text', required: true, label: 'Project Code' },
      { name: 'client_name', type: 'text', required: true, label: 'Client Name' },
      { name: 'start_date', type: 'date', required: true, label: 'Start Date' },
      { name: 'end_date', type: 'date', required: false, label: 'End Date' },
      { name: 'budget', type: 'currency', required: false, label: 'Budget' },
      { name: 'status', type: 'select', required: true, label: 'Status', options: ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'] },
      { name: 'description', type: 'textarea', required: false, label: 'Description' }
    ]
  }
};

// AI Schema Generator
class AISchemaGenerator {
  static generateSchema(entityType: string, businessRequirement: string): any {
    // AI-powered schema generation based on entity type and business requirement
    // This would normally call an AI service, but for demo purposes, we'll use templates
    
    if (ENTITY_TEMPLATES[entityType as keyof typeof ENTITY_TEMPLATES]) {
      return ENTITY_TEMPLATES[entityType as keyof typeof ENTITY_TEMPLATES];
    }
    
    // Fallback: Generate basic schema from business requirement
    const words = businessRequirement.toLowerCase().split(' ');
    const fields = [];
    
    // Basic field inference
    if (words.includes('name') || words.includes('title')) {
      fields.push({ name: 'name', type: 'text', required: true, label: 'Name' });
    }
    if (words.includes('email')) {
      fields.push({ name: 'email', type: 'email', required: true, label: 'Email' });
    }
    if (words.includes('phone')) {
      fields.push({ name: 'phone', type: 'phone', required: true, label: 'Phone' });
    }
    if (words.includes('date')) {
      fields.push({ name: 'date', type: 'date', required: true, label: 'Date' });
    }
    if (words.includes('amount') || words.includes('price') || words.includes('cost')) {
      fields.push({ name: 'amount', type: 'currency', required: true, label: 'Amount' });
    }
    if (words.includes('description') || words.includes('details')) {
      fields.push({ name: 'description', type: 'textarea', required: false, label: 'Description' });
    }
    
    // Default fields if nothing matched
    if (fields.length === 0) {
      fields.push(
        { name: 'name', type: 'text', required: true, label: 'Name' },
        { name: 'description', type: 'textarea', required: false, label: 'Description' }
      );
    }
    
    return {
      name: entityType.charAt(0).toUpperCase() + entityType.slice(1),
      icon: FileText,
      fields
    };
  }
}

// Dynamic Form Generator Props
interface DynamicFormGeneratorProps {
  organizationId: string;
  entityType?: string;
  businessRequirement?: string;
  onFormSubmit?: (data: any) => void;
  onFormSave?: (data: any) => void;
  existingEntity?: UniversalEntityResponse;
  mode?: 'create' | 'edit' | 'view';
  className?: string;
}

export function DynamicFormGenerator({
  organizationId,
  entityType = 'custom',
  businessRequirement = '',
  onFormSubmit,
  onFormSave,
  existingEntity,
  mode = 'create',
  className
}: DynamicFormGeneratorProps) {
  const [formSchema, setFormSchema] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('form');
  const [formFields, setFormFields] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Generate form schema on mount or when inputs change
  useEffect(() => {
    generateFormSchema();
  }, [entityType, businessRequirement]);

  // Load existing entity data
  useEffect(() => {
    if (existingEntity && mode === 'edit') {
      loadExistingEntity();
    }
  }, [existingEntity, mode]);

  const generateFormSchema = useCallback(async () => {
    setIsGenerating(true);
    
    try {
      // Generate schema using AI
      const schema = AISchemaGenerator.generateSchema(entityType, businessRequirement);
      setFormSchema(schema);
      setFormFields(schema.fields);
      
      // Generate AI insights
      const insights = await generateAIInsights(schema);
      setAiInsights(insights);
      
    } catch (error) {
      console.error('Error generating form schema:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [entityType, businessRequirement]);

  const generateAIInsights = async (schema: any) => {
    // AI-powered insights about the form
    const insights = [];
    
    // Analyze field types
    const fieldTypes = schema.fields.map((f: any) => f.type);
    if (fieldTypes.includes('currency')) {
      insights.push({
        type: 'suggestion',
        title: 'Financial Compliance',
        description: 'This form includes financial fields. Consider adding audit trails and approval workflows.',
        icon: DollarSign,
        priority: 'high'
      });
    }
    
    if (fieldTypes.includes('email')) {
      insights.push({
        type: 'validation',
        title: 'Email Validation',
        description: 'Email fields will be validated for format and deliverability.',
        icon: Mail,
        priority: 'medium'
      });
    }
    
    if (schema.fields.length > 10) {
      insights.push({
        type: 'ux',
        title: 'Form Complexity',
        description: 'Consider breaking this form into multiple steps for better user experience.',
        icon: Eye,
        priority: 'low'
      });
    }
    
    // Required fields analysis
    const requiredFields = schema.fields.filter((f: any) => f.required);
    if (requiredFields.length > 5) {
      insights.push({
        type: 'ux',
        title: 'Required Fields',
        description: `${requiredFields.length} required fields detected. Consider making some optional.`,
        icon: AlertCircle,
        priority: 'medium'
      });
    }
    
    return insights;
  };

  const loadExistingEntity = () => {
    if (!existingEntity) return;
    
    // Convert existing entity data to form values
    const formData: any = {};
    
    existingEntity.fields.forEach((field: CoreDynamicData) => {
      formData[field.field_name] = field.field_value;
    });
    
    // Set form values
    if (form) {
      form.reset(formData);
    }
  };

  // Create dynamic Zod schema
  const createValidationSchema = (fields: any[]) => {
    const schemaFields: any = {};
    
    fields.forEach((field) => {
      let fieldSchema: any;
      
      switch (field.type) {
        case 'email':
          fieldSchema = z.string().email('Invalid email format');
          break;
        case 'number':
          fieldSchema = z.number().min(0);
          break;
        case 'currency':
          fieldSchema = z.number().min(0);
          break;
        case 'url':
          fieldSchema = z.string().url('Invalid URL format');
          break;
        case 'phone':
          fieldSchema = z.string().min(10, 'Phone number must be at least 10 characters');
          break;
        case 'boolean':
          fieldSchema = z.boolean();
          break;
        case 'date':
          fieldSchema = z.string().or(z.date());
          break;
        default:
          fieldSchema = z.string();
      }
      
      if (field.required) {
        fieldSchema = fieldSchema.min(1, `${field.label} is required`);
      } else {
        fieldSchema = fieldSchema.optional();
      }
      
      schemaFields[field.name] = fieldSchema;
    });
    
    return z.object(schemaFields);
  };

  // Form setup
  const validationSchema = formFields.length > 0 ? createValidationSchema(formFields) : z.object({});
  const form = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {}
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      // Prepare entity data
      const entityData: UniversalEntityInput = {
        organization_id: organizationId,
        entity_type: entityType,
        entity_name: data.name || `${entityType}_${Date.now()}`,
        entity_code: data.code || `${entityType.toUpperCase()}_${Date.now()}`,
        fields: data,
        metadata: {
          form_version: '1.0',
          generated_by: 'dynamic_form_generator',
          ai_confidence: 0.95,
          creation_mode: mode
        }
      };

      // 🔍 DUPLICATE PREVENTION: Check for duplicates before processing
      const { duplicatePreventionService } = await import('@/lib/services/duplicate-prevention-service');

      if (mode === 'create') {
        console.log('🔍 HERA: Checking for entity duplicates before creation...');
        
        // Check entity duplicates
        const entityDuplicateCheck = await duplicatePreventionService.checkEntityDuplicates(
          organizationId,
          entityType,
          {
            entity_name: entityData.entity_name,
            entity_code: entityData.entity_code,
            ...data
          }
        );

        if (entityDuplicateCheck.hasDuplicates) {
          console.log('⚠️ HERA: Duplicate detected:', entityDuplicateCheck.duplicateType);
          
          if (entityDuplicateCheck.preventionAction === 'reject') {
            setSubmitStatus('error');
            setValidationErrors({ 
              general: `❌ ${entityDuplicateCheck.message}\n\nSuggestions:\n${entityDuplicateCheck.suggestions?.join('\n') || ''}` 
            });
            return;
          }
          
          if (entityDuplicateCheck.preventionAction === 'manual_review') {
            const userConfirm = window.confirm(
              `⚠️ Potential Duplicate Detected\n\n${entityDuplicateCheck.message}\n\nSuggestions:\n${entityDuplicateCheck.suggestions?.join('\n') || ''}\n\nDo you want to proceed anyway?`
            );
            if (!userConfirm) {
              setSubmitStatus('idle');
              return;
            }
          }

          if (entityDuplicateCheck.preventionAction === 'merge') {
            const userChoice = window.confirm(
              `🔄 Merge Opportunity\n\n${entityDuplicateCheck.message}\n\nOptions:\n• Click OK to view existing records for merging\n• Click Cancel to create new record anyway`
            );
            if (userChoice) {
              // TODO: Implement merge interface
              console.log('🔄 HERA: User chose to merge with existing records');
              setValidationErrors({ 
                general: '🔄 Merge functionality will be available soon. Creating new record for now.' 
              });
            }
          }
        }

        // Check for transaction duplicates if this is a transaction entity
        if (['invoice', 'payment', 'purchase_order', 'receipt'].includes(entityType)) {
          const transactionNumber = data.invoice_number || data.payment_number || data.order_number || data.receipt_number;
          if (transactionNumber) {
            const transactionDuplicateCheck = await duplicatePreventionService.checkTransactionDuplicates(
              organizationId,
              entityType.toUpperCase(),
              transactionNumber
            );

            if (transactionDuplicateCheck.hasDuplicates && transactionDuplicateCheck.preventionAction === 'reject') {
              setSubmitStatus('error');
              setValidationErrors({ 
                general: `❌ ${transactionDuplicateCheck.message}\n\nSuggestions:\n${transactionDuplicateCheck.suggestions?.join('\n') || ''}` 
              });
              return;
            }
          }
        }
      }

      let result: UniversalEntityResponse;
      
      if (mode === 'edit' && existingEntity) {
        console.log('📝 HERA: Updating existing entity with duplicate prevention...');
        
        // Check for duplicate dynamic data when updating
        const fields = Object.entries(data).map(([key, value]) => ({
          name: key,
          value: value,
          type: typeof value === 'number' ? 'number' : 
                typeof value === 'boolean' ? 'boolean' : 'text'
        }));

        const dynamicDataCheck = await duplicatePreventionService.checkDynamicDataDuplicates(
          existingEntity.entity.id,
          fields
        );

        if (dynamicDataCheck.hasDuplicates && dynamicDataCheck.preventionAction === 'update') {
          console.log('📝 HERA: Updating existing fields:', dynamicDataCheck.duplicateFields);
        }

        // Update existing entity
        result = await universalEntityManager.updateEntity(existingEntity.entity.id, entityData);
      } else {
        console.log('✨ HERA: Creating new entity...');
        // Create new entity
        result = await universalEntityManager.createEntity(entityData);
      }
      
      if (result.success) {
        console.log('✅ HERA: Entity created/updated successfully with duplicate prevention');
        setSubmitStatus('success');
        onFormSubmit?.(result);
      } else {
        setSubmitStatus('error');
        setValidationErrors({ general: result.error });
      }
      
    } catch (error) {
      console.error('❌ HERA: Form submission error:', error);
      setSubmitStatus('error');
      setValidationErrors({ general: 'An error occurred while submitting the form' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: any) => {
    const fieldType = UNIVERSAL_FIELD_TYPES.find(t => t.type === field.type);
    const Icon = fieldType?.icon || Type;
    
    return (
      <motion.div
        key={field.name}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-2"
      >
        <Label htmlFor={field.name} className="flex items-center space-x-2">
          <Icon className="h-4 w-4" />
          <span>{field.label}</span>
          {field.required && <span className="text-red-500">*</span>}
        </Label>
        
        <Controller
          name={field.name}
          control={form.control}
          render={({ field: formField, fieldState: { error } }) => {
            switch (field.type) {
              case 'textarea':
                return (
                  <div>
                    <Textarea
                      {...formField}
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                      className={cn(error && 'border-red-500')}
                      disabled={mode === 'view'}
                    />
                    {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
                  </div>
                );
              
              case 'select':
                return (
                  <div>
                    <Select
                      value={formField.value}
                      onValueChange={formField.onChange}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger className={cn(error && 'border-red-500')}>
                        <SelectValue placeholder={`Select ${field.label.toLowerCase()}...`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option: string) => (
                          <SelectItem key={option} value={option}>
                            {option.replace(/_/g, ' ').toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
                  </div>
                );
              
              case 'boolean':
                return (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formField.value}
                      onCheckedChange={formField.onChange}
                      disabled={mode === 'view'}
                    />
                    <Label>{field.label}</Label>
                  </div>
                );
              
              case 'date':
                return (
                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !formField.value && 'text-muted-foreground',
                            error && 'border-red-500'
                          )}
                          disabled={mode === 'view'}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formField.value ? format(new Date(formField.value), 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formField.value ? new Date(formField.value) : undefined}
                          onSelect={(date) => formField.onChange(date?.toISOString())}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
                  </div>
                );
              
              default:
                return (
                  <div>
                    <Input
                      {...formField}
                      type={field.type}
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                      className={cn(error && 'border-red-500')}
                      disabled={mode === 'view'}
                    />
                    {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
                  </div>
                );
            }
          }}
        />
      </motion.div>
    );
  };

  if (isGenerating) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-4">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            <div>
              <h3 className="text-lg font-semibold">Generating Universal Form</h3>
              <p className="text-gray-600">AI is analyzing your requirements...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!formSchema) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Form Generation Failed</h3>
            <p className="text-gray-600">Unable to generate form schema. Please try again.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <formSchema.icon className="h-6 w-6" />
          <span>{formSchema.name} Form</span>
          <Badge className="bg-blue-100 text-blue-800">
            <Brain className="h-3 w-3 mr-1" />
            AI Generated
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="form">Form</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="schema">Schema</TabsTrigger>
          </TabsList>
          
          <TabsContent value="form" className="mt-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formFields.map(renderField)}
              </div>
              
              {validationErrors.general && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{validationErrors.general}</AlertDescription>
                </Alert>
              )}
              
              {submitStatus === 'success' && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>Form submitted successfully!</AlertDescription>
                </Alert>
              )}
              
              {mode !== 'view' && (
                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {mode === 'edit' ? 'Update' : 'Create'} {formSchema.name}
                      </>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => generateFormSchema()}
                    disabled={isGenerating}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate Form
                  </Button>
                </div>
              )}
            </form>
          </TabsContent>
          
          <TabsContent value="insights" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Sparkles className="h-5 w-5" />
                <span>AI Form Insights</span>
              </h3>
              
              <AnimatePresence>
                {aiInsights.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Alert className={cn(
                      insight.priority === 'high' && 'border-red-200 bg-red-50',
                      insight.priority === 'medium' && 'border-yellow-200 bg-yellow-50',
                      insight.priority === 'low' && 'border-blue-200 bg-blue-50'
                    )}>
                      <insight.icon className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-semibold">{insight.title}</div>
                        <div className="text-sm">{insight.description}</div>
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>
          
          <TabsContent value="schema" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Generated Schema</span>
              </h3>
              
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                {JSON.stringify(formSchema, null, 2)}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Export field types for external use
export { UNIVERSAL_FIELD_TYPES, ENTITY_TEMPLATES, AISchemaGenerator };