'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  X, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  FileText,
  Sparkles,
  AlertCircle,
  Check,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/revolutionary-button';
import { Card } from '@/components/ui/revolutionary-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import motionConfig from '@/lib/motion';
import { useClientManagement } from '@/hooks/useClientManagement';

interface ClientFormProps {
  mode: 'create' | 'edit';
  clientId?: string | null;
  onSubmit: (clientData: any) => Promise<void>;
  onCancel: () => void;
}

interface ClientFormData {
  client_name: string;
  client_code: string;
  client_type: string;
  is_active: boolean;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  website: string;
  notes: string;
}

const CLIENT_TYPES = [
  { value: 'restaurant', label: 'Restaurant', icon: '🍕' },
  { value: 'retail', label: 'Retail', icon: '🛍️' },
  { value: 'technology', label: 'Technology', icon: '💻' },
  { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { value: 'finance', label: 'Finance', icon: '🏦' },
  { value: 'legal', label: 'Legal', icon: '⚖️' },
  { value: 'consulting', label: 'Consulting', icon: '💼' },
  { value: 'manufacturing', label: 'Manufacturing', icon: '🏭' },
  { value: 'service', label: 'Service', icon: '🔧' },
  { value: 'other', label: 'Other', icon: '📋' }
];

export const ClientForm: React.FC<ClientFormProps> = ({
  mode,
  clientId,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<ClientFormData>({
    client_name: '',
    client_code: '',
    client_type: '',
    is_active: true,
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    industry: '',
    website: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<{
    client_code?: string;
    industry?: string;
  }>({});

  const { 
    getClientById, 
    generateClientCode, 
    validateClientData 
  } = useClientManagement();

  // Load existing client data for edit mode
  useEffect(() => {
    const loadClientData = async () => {
      if (mode === 'edit' && clientId) {
        const client = await getClientById(clientId);
        if (client) {
          setFormData({
            client_name: client.client_name,
            client_code: client.client_code,
            client_type: client.client_type,
            is_active: client.is_active,
            contact_person: client.contact_person || '',
            email: client.email || '',
            phone: client.phone || '',
            address: client.address || '',
            industry: client.industry || '',
            website: client.website || '',
            notes: client.notes || ''
          });
        }
      }
    };

    loadClientData();
  }, [mode, clientId, getClientById]);

  // Auto-generate client code when name changes
  useEffect(() => {
    if (mode === 'create' && formData.client_name && formData.client_type) {
      const suggestedCode = generateClientCode(formData.client_name, formData.client_type);
      setAiSuggestions(prev => ({ ...prev, client_code: suggestedCode }));
    }
  }, [formData.client_name, formData.client_type, generateClientCode, mode]);

  // AI-powered industry suggestion
  useEffect(() => {
    if (formData.client_name && formData.client_type) {
      // Mock AI industry suggestion based on name and type
      const industrySuggestion = getIndustrySuggestion(formData.client_name, formData.client_type);
      if (industrySuggestion) {
        setAiSuggestions(prev => ({ ...prev, industry: industrySuggestion }));
      }
    }
  }, [formData.client_name, formData.client_type]);

  const handleInputChange = (field: keyof ClientFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSuggestionApply = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setAiSuggestions(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validationErrors = validateClientData(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      await onSubmit(formData);
    } catch (error) {
      setErrors(['Failed to save client. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={motionConfig.spring.swift}
    >
      <Card variant="glass" className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                transition={motionConfig.spring.swift}
              >
                <Building2 className="w-5 h-5 text-primary" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {mode === 'create' ? 'Add New Client' : 'Edit Client'}
                </h2>
                <p className="text-muted-foreground">
                  {mode === 'create' 
                    ? 'Create a new client record with AI-powered suggestions' 
                    : 'Update client information and preferences'}
                </p>
              </div>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Error Display */}
          {errors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800 mb-1">Please fix the following errors:</h4>
                  <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* Basic Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Basic Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Client Name */}
              <div className="space-y-2">
                <Label htmlFor="client_name">Client Name *</Label>
                <Input
                  id="client_name"
                  value={formData.client_name}
                  onChange={(e) => handleInputChange('client_name', e.target.value)}
                  placeholder="Enter client name"
                  required
                />
              </div>

              {/* Client Type */}
              <div className="space-y-2">
                <Label htmlFor="client_type">Client Type *</Label>
                <Select value={formData.client_type} onValueChange={(value) => handleInputChange('client_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLIENT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <span>{type.icon}</span>
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Client Code */}
              <div className="space-y-2">
                <Label htmlFor="client_code">Client Code *</Label>
                <div className="relative">
                  <Input
                    id="client_code"
                    value={formData.client_code}
                    onChange={(e) => handleInputChange('client_code', e.target.value)}
                    placeholder="Enter unique client code"
                    className="font-mono"
                    required
                  />
                  {aiSuggestions.client_code && aiSuggestions.client_code !== formData.client_code && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full mt-1 left-0 right-0 z-10"
                    >
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-blue-700">AI Suggestion:</span>
                            <code className="text-sm font-mono bg-blue-100 px-2 py-1 rounded">
                              {aiSuggestions.client_code}
                            </code>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSuggestionApply('client_code', aiSuggestions.client_code!)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <div className="relative">
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    placeholder="Enter industry"
                  />
                  {aiSuggestions.industry && aiSuggestions.industry !== formData.industry && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full mt-1 left-0 right-0 z-10"
                    >
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-blue-700">AI Suggestion:</span>
                            <span className="text-sm bg-blue-100 px-2 py-1 rounded">
                              {aiSuggestions.industry}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSuggestionApply('industry', aiSuggestions.industry!)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-3">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
              <Label htmlFor="is_active" className="flex items-center gap-2">
                Active Client
                <Badge variant={formData.is_active ? "default" : "secondary"}>
                  {formData.is_active ? "Active" : "Inactive"}
                </Badge>
              </Label>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Contact Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Person */}
              <div className="space-y-2">
                <Label htmlFor="contact_person">Contact Person</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => handleInputChange('contact_person', e.target.value)}
                  placeholder="Primary contact name"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contact@client.com"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://client.com"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Full business address"
                rows={3}
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Additional Information</h3>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes about this client..."
                rows={4}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isSubmitting}
              leftIcon={
                isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )
              }
              interaction="magnetic"
            >
              {isSubmitting 
                ? 'Saving...' 
                : mode === 'create' 
                  ? 'Create Client' 
                  : 'Update Client'
              }
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
};

// AI-powered industry suggestion helper
function getIndustrySuggestion(clientName: string, clientType: string): string | null {
  const name = clientName.toLowerCase();
  
  // Simple keyword-based suggestions (in production, this would use actual AI)
  const keywords = {
    'food': 'Food & Beverage',
    'restaurant': 'Food & Beverage',
    'cafe': 'Food & Beverage',
    'pizza': 'Food & Beverage',
    'bakery': 'Food & Beverage',
    'tech': 'Technology',
    'software': 'Technology',
    'digital': 'Technology',
    'solutions': 'Technology',
    'health': 'Healthcare',
    'medical': 'Healthcare',
    'clinic': 'Healthcare',
    'legal': 'Legal Services',
    'law': 'Legal Services',
    'fashion': 'Retail & Fashion',
    'store': 'Retail',
    'market': 'Retail',
    'consulting': 'Professional Services',
    'advisors': 'Financial Services',
    'financial': 'Financial Services',
    'manufacturing': 'Manufacturing',
    'academy': 'Education',
    'school': 'Education',
    'clean': 'Cleaning Services'
  };

  for (const [keyword, industry] of Object.entries(keywords)) {
    if (name.includes(keyword)) {
      return industry;
    }
  }

  // Fallback based on client type
  const typeMap: { [key: string]: string } = {
    'restaurant': 'Food & Beverage',
    'retail': 'Retail',
    'technology': 'Technology',
    'healthcare': 'Healthcare',
    'finance': 'Financial Services',
    'legal': 'Legal Services',
    'consulting': 'Professional Services',
    'manufacturing': 'Manufacturing',
    'service': 'Professional Services'
  };

  return typeMap[clientType] || null;
}