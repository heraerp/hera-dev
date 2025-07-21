/**
 * HERA Universal ERP - Universal Client Form Component
 * Advanced client form with metadata and dynamic fields support
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Building2, 
  User, 
  MapPin, 
  Phone, 
  Mail,
  Globe,
  Calendar,
  DollarSign,
  Tag,
  Settings
} from 'lucide-react'
import { Card } from '@/components/ui/revolutionary-card'
import { Button } from '@/components/ui/revolutionary-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import motionConfig from '@/lib/motion'
import type { UniversalClient } from '@/lib/services/universal-client-service'

interface UniversalClientFormProps {
  mode: 'create' | 'edit'
  client?: UniversalClient | null
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

interface FormData {
  client_name: string
  client_code: string
  client_type: string
  metadata: Record<string, any>
  dynamic_fields: Record<string, any>
}

interface DynamicField {
  id: string
  name: string
  value: any
  type: 'text' | 'number' | 'email' | 'phone' | 'url' | 'date' | 'boolean'
}

const CLIENT_TYPES = [
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'small_business', label: 'Small Business' },
  { value: 'startup', label: 'Startup' },
  { value: 'nonprofit', label: 'Non-Profit' },
  { value: 'government', label: 'Government' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'retail', label: 'Retail' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'service', label: 'Service' },
  { value: 'legal', label: 'Legal' },
  { value: 'other', label: 'Other' }
]

const METADATA_CATEGORIES = [
  { value: 'contact', label: 'Contact Information', icon: Phone },
  { value: 'business', label: 'Business Details', icon: Building2 },
  { value: 'financial', label: 'Financial Information', icon: DollarSign },
  { value: 'compliance', label: 'Compliance & Legal', icon: Settings },
  { value: 'custom', label: 'Custom Fields', icon: Tag }
]

export function UniversalClientForm({ 
  mode, 
  client, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: UniversalClientFormProps) {
  const [formData, setFormData] = useState<FormData>({
    client_name: '',
    client_code: '',
    client_type: 'enterprise',
    metadata: {},
    dynamic_fields: {}
  })
  
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([])
  const [activeTab, setActiveTab] = useState('basic')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize form data from client
  useEffect(() => {
    if (client && mode === 'edit') {
      setFormData({
        client_name: client.client_name || '',
        client_code: client.client_code || '',
        client_type: client.client_type || 'enterprise',
        metadata: client.metadata?.reduce((acc, meta) => {
          acc[meta.metadata_key] = meta.metadata_value
          return acc
        }, {} as Record<string, any>) || {},
        dynamic_fields: client.dynamic_data?.reduce((acc, field) => {
          acc[field.field_name] = field.field_value
          return acc
        }, {} as Record<string, any>) || {}
      })
      
      // Convert dynamic data to dynamic fields
      const fields = client.dynamic_data?.map(field => ({
        id: field.id,
        name: field.field_name,
        value: field.field_value,
        type: field.field_type as any
      })) || []
      
      setDynamicFields(fields)
    }
  }, [client, mode])

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleMetadataChange = (category: string, key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [`${category}_${key}`]: value
      }
    }))
  }

  const addDynamicField = () => {
    const newField: DynamicField = {
      id: `field_${Date.now()}`,
      name: '',
      value: '',
      type: 'text'
    }
    setDynamicFields(prev => [...prev, newField])
  }

  const updateDynamicField = (id: string, updates: Partial<DynamicField>) => {
    setDynamicFields(prev => prev.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ))
    
    // Update form data
    const field = dynamicFields.find(f => f.id === id)
    if (field && updates.name && updates.value !== undefined) {
      setFormData(prev => ({
        ...prev,
        dynamic_fields: {
          ...prev.dynamic_fields,
          [updates.name]: updates.value
        }
      }))
    }
  }

  const removeDynamicField = (id: string) => {
    setDynamicFields(prev => prev.filter(field => field.id !== id))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.client_name.trim()) {
      newErrors.client_name = 'Client name is required'
    }
    
    if (!formData.client_code.trim()) {
      newErrors.client_code = 'Client code is required'
    }
    
    if (!formData.client_type) {
      newErrors.client_type = 'Client type is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={motionConfig.spring.swift}
    >
      <Card variant="glass" className="max-w-4xl mx-auto">
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                <Building2 className="w-6 h-6 text-primary" />
                {mode === 'create' ? 'Create New Client' : 'Edit Client'}
              </h2>
              <p className="text-muted-foreground mt-1">
                {mode === 'create' 
                  ? 'Add a new client with complete business information'
                  : 'Update client information and metadata'
                }
              </p>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              leftIcon={<X className="w-4 h-4" />}
            >
              Cancel
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
              <TabsTrigger value="dynamic">Dynamic Fields</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="client_name">Client Name *</Label>
                  <Input
                    id="client_name"
                    placeholder="Enter client name"
                    value={formData.client_name}
                    onChange={(e) => handleInputChange('client_name', e.target.value)}
                    className={cn(errors.client_name && 'border-red-500')}
                  />
                  {errors.client_name && (
                    <p className="text-sm text-red-500">{errors.client_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client_code">Client Code *</Label>
                  <Input
                    id="client_code"
                    placeholder="Enter client code"
                    value={formData.client_code}
                    onChange={(e) => handleInputChange('client_code', e.target.value.toUpperCase())}
                    className={cn(errors.client_code && 'border-red-500')}
                  />
                  {errors.client_code && (
                    <p className="text-sm text-red-500">{errors.client_code}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="client_type">Client Type *</Label>
                  <Select
                    value={formData.client_type}
                    onValueChange={(value) => handleInputChange('client_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select client type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLIENT_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.client_type && (
                    <p className="text-sm text-red-500">{errors.client_type}</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="metadata" className="space-y-6 mt-6">
              <div className="space-y-6">
                {METADATA_CATEGORIES.map(category => (
                  <Card key={category.value} variant="outline" className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <category.icon className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold">{category.label}</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {category.value === 'contact' && (
                        <>
                          <div className="space-y-2">
                            <Label>Primary Contact</Label>
                            <Input
                              placeholder="Contact person name"
                              value={formData.metadata.contact_primary_contact || ''}
                              onChange={(e) => handleMetadataChange('contact', 'primary_contact', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                              type="email"
                              placeholder="contact@client.com"
                              value={formData.metadata.contact_email || ''}
                              onChange={(e) => handleMetadataChange('contact', 'email', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input
                              type="tel"
                              placeholder="+1 (555) 123-4567"
                              value={formData.metadata.contact_phone || ''}
                              onChange={(e) => handleMetadataChange('contact', 'phone', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Address</Label>
                            <Textarea
                              placeholder="Business address"
                              value={formData.metadata.contact_address || ''}
                              onChange={(e) => handleMetadataChange('contact', 'address', e.target.value)}
                            />
                          </div>
                        </>
                      )}
                      
                      {category.value === 'business' && (
                        <>
                          <div className="space-y-2">
                            <Label>Industry</Label>
                            <Input
                              placeholder="Industry sector"
                              value={formData.metadata.business_industry || ''}
                              onChange={(e) => handleMetadataChange('business', 'industry', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Website</Label>
                            <Input
                              type="url"
                              placeholder="https://client.com"
                              value={formData.metadata.business_website || ''}
                              onChange={(e) => handleMetadataChange('business', 'website', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Founded</Label>
                            <Input
                              type="date"
                              value={formData.metadata.business_founded || ''}
                              onChange={(e) => handleMetadataChange('business', 'founded', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Employees</Label>
                            <Input
                              type="number"
                              placeholder="Number of employees"
                              value={formData.metadata.business_employees || ''}
                              onChange={(e) => handleMetadataChange('business', 'employees', parseInt(e.target.value))}
                            />
                          </div>
                        </>
                      )}
                      
                      {category.value === 'financial' && (
                        <>
                          <div className="space-y-2">
                            <Label>Annual Revenue</Label>
                            <Input
                              type="number"
                              placeholder="Annual revenue"
                              value={formData.metadata.financial_revenue || ''}
                              onChange={(e) => handleMetadataChange('financial', 'revenue', parseFloat(e.target.value))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Currency</Label>
                            <Select
                              value={formData.metadata.financial_currency || 'USD'}
                              onValueChange={(value) => handleMetadataChange('financial', 'currency', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="EUR">EUR</SelectItem>
                                <SelectItem value="GBP">GBP</SelectItem>
                                <SelectItem value="CAD">CAD</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Credit Limit</Label>
                            <Input
                              type="number"
                              placeholder="Credit limit"
                              value={formData.metadata.financial_credit_limit || ''}
                              onChange={(e) => handleMetadataChange('financial', 'credit_limit', parseFloat(e.target.value))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Payment Terms</Label>
                            <Input
                              placeholder="e.g., Net 30"
                              value={formData.metadata.financial_payment_terms || ''}
                              onChange={(e) => handleMetadataChange('financial', 'payment_terms', e.target.value)}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="dynamic" className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Dynamic Fields</h3>
                  <p className="text-sm text-muted-foreground">
                    Add custom fields specific to this client
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addDynamicField}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add Field
                </Button>
              </div>

              <div className="space-y-4">
                {dynamicFields.map(field => (
                  <Card key={field.id} variant="outline" className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div className="space-y-2">
                        <Label>Field Name</Label>
                        <Input
                          placeholder="Field name"
                          value={field.name}
                          onChange={(e) => updateDynamicField(field.id, { name: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Field Type</Label>
                        <Select
                          value={field.type}
                          onValueChange={(value) => updateDynamicField(field.id, { type: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="phone">Phone</SelectItem>
                            <SelectItem value="url">URL</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="boolean">Boolean</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Value</Label>
                        {field.type === 'boolean' ? (
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={field.value === 'true'}
                              onCheckedChange={(checked) => 
                                updateDynamicField(field.id, { value: checked ? 'true' : 'false' })
                              }
                            />
                            <Label>{field.value === 'true' ? 'Yes' : 'No'}</Label>
                          </div>
                        ) : (
                          <Input
                            type={field.type === 'number' ? 'number' : 
                                  field.type === 'email' ? 'email' : 
                                  field.type === 'date' ? 'date' : 'text'}
                            placeholder="Field value"
                            value={field.value}
                            onChange={(e) => updateDynamicField(field.id, { value: e.target.value })}
                          />
                        )}
                      </div>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDynamicField(field.id)}
                        leftIcon={<Trash2 className="w-4 h-4" />}
                      >
                        Remove
                      </Button>
                    </div>
                  </Card>
                ))}
                
                {dynamicFields.length === 0 && (
                  <Card variant="outline" className="p-8 text-center">
                    <p className="text-muted-foreground">
                      No dynamic fields added yet. Click "Add Field" to create custom fields.
                    </p>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-6 mt-6">
              <Card variant="outline" className="p-6">
                <h3 className="font-semibold mb-4">Client Preview</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                    <span className="font-medium">Client Name:</span>
                    <span>{formData.client_name || 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                    <span className="font-medium">Client Code:</span>
                    <span>{formData.client_code || 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                    <span className="font-medium">Client Type:</span>
                    <Badge variant="secondary">
                      {CLIENT_TYPES.find(t => t.value === formData.client_type)?.label || formData.client_type}
                    </Badge>
                  </div>
                  
                  {Object.keys(formData.metadata).length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Metadata:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {Object.entries(formData.metadata).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between p-2 bg-background/30 rounded">
                            <span className="text-sm">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span>
                            <span className="text-sm">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {dynamicFields.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Dynamic Fields:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {dynamicFields.map(field => (
                          <div key={field.id} className="flex items-center justify-between p-2 bg-background/30 rounded">
                            <span className="text-sm">{field.name}:</span>
                            <span className="text-sm">{String(field.value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              leftIcon={<Save className="w-4 h-4" />}
            >
              {isLoading ? 'Saving...' : mode === 'create' ? 'Create Client' : 'Update Client'}
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  )
}

export default UniversalClientForm