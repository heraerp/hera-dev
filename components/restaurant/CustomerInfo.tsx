'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  MapPin, 
  Utensils, 
  AlertTriangle,
  Heart,
  Leaf,
  Zap,
  Users,
  Clock,
  Phone,
  Mail
} from 'lucide-react';

interface CustomerInfo {
  name: string;
  dietary_preferences: string[];
  allergies: string[];
  table_number: number;
  special_requests: string;
  phone?: string;
  email?: string;
}

interface CustomerInfoProps {
  customerInfo: CustomerInfo;
  onUpdateCustomerInfo: (info: CustomerInfo) => void;
  tableNumber: number;
}

const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: 'Vegetarian', icon: Leaf, color: 'bg-green-100 text-green-800' },
  { id: 'vegan', label: 'Vegan', icon: Leaf, color: 'bg-green-100 text-green-800' },
  { id: 'gluten_free', label: 'Gluten Free', icon: Heart, color: 'bg-blue-100 text-blue-800' },
  { id: 'keto', label: 'Keto', icon: Zap, color: 'bg-purple-100 text-purple-800' },
  { id: 'dairy_free', label: 'Dairy Free', icon: Heart, color: 'bg-blue-100 text-blue-800' },
  { id: 'nut_free', label: 'Nut Free', icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-800' },
  { id: 'low_sodium', label: 'Low Sodium', icon: Heart, color: 'bg-blue-100 text-blue-800' },
  { id: 'pescatarian', label: 'Pescatarian', icon: Utensils, color: 'bg-teal-100 text-teal-800' }
];

const COMMON_ALLERGIES = [
  'Peanuts', 'Tree Nuts', 'Dairy', 'Eggs', 'Soy', 'Wheat/Gluten', 
  'Fish', 'Shellfish', 'Sesame', 'Mustard'
];

export const CustomerInfo: React.FC<CustomerInfoProps> = ({
  customerInfo,
  onUpdateCustomerInfo,
  tableNumber
}) => {
  const handleInputChange = (field: keyof CustomerInfo, value: any) => {
    onUpdateCustomerInfo({
      ...customerInfo,
      [field]: value
    });
  };

  const handleDietaryPreferenceChange = (preference: string, checked: boolean) => {
    const updatedPreferences = checked
      ? [...customerInfo.dietary_preferences, preference]
      : customerInfo.dietary_preferences.filter(p => p !== preference);
    
    handleInputChange('dietary_preferences', updatedPreferences);
  };

  const handleAllergyChange = (allergy: string, checked: boolean) => {
    const updatedAllergies = checked
      ? [...customerInfo.allergies, allergy]
      : customerInfo.allergies.filter(a => a !== allergy);
    
    handleInputChange('allergies', updatedAllergies);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Customer Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">
            Complete customer details to ensure the best dining experience and accommodate any dietary needs or allergies.
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer_name">Customer Name</Label>
              <Input
                id="customer_name"
                placeholder="Enter customer name"
                value={customerInfo.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="table_number">Table Number</Label>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <Input
                  id="table_number"
                  type="number"
                  value={customerInfo.table_number}
                  onChange={(e) => handleInputChange('table_number', parseInt(e.target.value) || tableNumber)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer_phone">Phone (Optional)</Label>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <Input
                  id="customer_phone"
                  placeholder="(555) 123-4567"
                  value={customerInfo.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="customer_email">Email (Optional)</Label>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <Input
                  id="customer_email"
                  type="email"
                  placeholder="customer@example.com"
                  value={customerInfo.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dietary Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Utensils className="w-5 h-5" />
            <span>Dietary Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {DIETARY_OPTIONS.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={option.id}
                  checked={customerInfo.dietary_preferences.includes(option.id)}
                  onCheckedChange={(checked) => handleDietaryPreferenceChange(option.id, checked as boolean)}
                />
                <Label
                  htmlFor={option.id}
                  className="flex items-center space-x-1 text-sm cursor-pointer"
                >
                  <option.icon className="w-3 h-3" />
                  <span>{option.label}</span>
                </Label>
              </div>
            ))}
          </div>

          {/* Selected Preferences Display */}
          {customerInfo.dietary_preferences.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Selected Preferences:</Label>
              <div className="flex flex-wrap gap-2">
                {customerInfo.dietary_preferences.map((pref) => {
                  const option = DIETARY_OPTIONS.find(opt => opt.id === pref);
                  return option ? (
                    <Badge key={pref} variant="outline" className={option.color}>
                      <option.icon className="w-3 h-3 mr-1" />
                      {option.label}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Allergies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span>Allergies & Food Restrictions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {COMMON_ALLERGIES.map((allergy) => (
              <div key={allergy} className="flex items-center space-x-2">
                <Checkbox
                  id={allergy}
                  checked={customerInfo.allergies.includes(allergy)}
                  onCheckedChange={(checked) => handleAllergyChange(allergy, checked as boolean)}
                />
                <Label
                  htmlFor={allergy}
                  className="text-sm cursor-pointer"
                >
                  {allergy}
                </Label>
              </div>
            ))}
          </div>

          {/* Selected Allergies Display */}
          {customerInfo.allergies.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">⚠️ Allergies to Avoid:</Label>
              <div className="flex flex-wrap gap-2">
                {customerInfo.allergies.map((allergy) => (
                  <Badge key={allergy} variant="outline" className="bg-red-50 text-red-700 border-red-300">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {allergy}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Special Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Special Requests</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="special_requests">Additional Notes</Label>
            <Textarea
              id="special_requests"
              placeholder="Any special requests, seating preferences, celebration notes, etc."
              value={customerInfo.special_requests}
              onChange={(e) => handleInputChange('special_requests', e.target.value)}
              rows={4}
              className="mt-2"
            />
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <div className="font-medium">ChefHat Notes</div>
                <div>
                  Special requests and dietary information will be shared with the kitchen team 
                  to ensure your meal is prepared according to your preferences and restrictions.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      {(customerInfo.name || customerInfo.dietary_preferences.length > 0 || customerInfo.allergies.length > 0) && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Customer Profile Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {customerInfo.name && (
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-green-600" />
                  <span><strong>Name:</strong> {customerInfo.name}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-green-600" />
                <span><strong>Table:</strong> {customerInfo.table_number}</span>
              </div>
              
              {customerInfo.dietary_preferences.length > 0 && (
                <div className="flex items-start space-x-2">
                  <Utensils className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>
                    <strong>Dietary:</strong> {customerInfo.dietary_preferences.join(', ')}
                  </span>
                </div>
              )}
              
              {customerInfo.allergies.length > 0 && (
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                  <span>
                    <strong>Allergies:</strong> {customerInfo.allergies.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};