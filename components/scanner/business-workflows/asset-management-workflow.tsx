/**
 * HERA Universal ERP - Asset Management Workflow
 * Complete asset lifecycle management with mobile documentation
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Camera, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Edit3, 
  Save, 
  ArrowRight,
  Zap,
  QrCode,
  Wrench,
  FileText,
  Tag,
  Truck,
  Trash2,
  RotateCcw,
  Upload,
  Plus,
  Minus
} from 'lucide-react';
import { UniversalCameraInterface } from '../universal-camera-interface';
import { Button } from '@/components/ui/revolutionary-button';
import { Card } from '@/components/ui/revolutionary-card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ==================== TYPES ====================

interface Asset {
  id: string;
  asset_number: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  barcode?: string;
  qr_code?: string;
  location: {
    building: string;
    floor?: string;
    room?: string;
    department?: string;
    coordinates?: { lat: number; lng: number };
  };
  financial: {
    purchase_date: string;
    purchase_price: number;
    current_value: number;
    depreciation_method: 'straight_line' | 'declining_balance' | 'none';
    useful_life_years: number;
    salvage_value: number;
  };
  maintenance: {
    last_service_date?: string;
    next_service_date?: string;
    maintenance_schedule?: 'monthly' | 'quarterly' | 'annually' | 'as_needed';
    warranty_expiry?: string;
  };
  status: 'active' | 'maintenance' | 'disposed' | 'missing' | 'damaged';
  assigned_to?: string;
  photos: string[];
  documents: string[];
  created_by: string;
  created_at: string;
  last_updated: string;
}

interface AssetOperation {
  type: 'register' | 'update' | 'maintenance' | 'transfer' | 'dispose' | 'audit';
  asset_id?: string;
  photos: string[];
  notes: string;
  performed_by: string;
  timestamp: string;
}

interface AssetManagementWorkflowProps {
  operationType: 'register' | 'update' | 'maintenance' | 'transfer' | 'dispose' | 'audit';
  assetId?: string;
  employeeId: string;
  onComplete?: (operation: AssetOperation) => void;
  onError?: (error: Error) => void;
  enableLocationTracking?: boolean;
  className?: string;
}

// ==================== ASSET CATEGORIES ====================

const ASSET_CATEGORIES = [
  {
    id: 'computer_equipment',
    name: 'Computer Equipment',
    subcategories: ['Desktop Computers', 'Laptops', 'Servers', 'Network Equipment', 'Printers']
  },
  {
    id: 'furniture',
    name: 'Furniture',
    subcategories: ['Desks', 'Chairs', 'Tables', 'Cabinets', 'Storage']
  },
  {
    id: 'vehicles',
    name: 'Vehicles',
    subcategories: ['Cars', 'Trucks', 'Forklifts', 'Motorcycles', 'Trailers']
  },
  {
    id: 'machinery',
    name: 'Machinery',
    subcategories: ['Production Equipment', 'Tools', 'HVAC', 'Generators', 'Pumps']
  },
  {
    id: 'office_equipment',
    name: 'Office Equipment',
    subcategories: ['Phones', 'Copiers', 'Projectors', 'Audio/Video', 'Security Systems']
  }
];

// ==================== MAIN COMPONENT ====================

export function AssetManagementWorkflow({
  operationType,
  assetId,
  employeeId,
  onComplete,
  onError,
  enableLocationTracking = true,
  className = ''
}: AssetManagementWorkflowProps) {
  const [currentStep, setCurrentStep] = useState<'scan' | 'photos' | 'details' | 'location' | 'financial' | 'review' | 'complete'>('scan');
  const [asset, setAsset] = useState<Partial<Asset> | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [scanResult, setScanResult] = useState<any>(null);

  // ==================== SCANNING HANDLERS ====================

  const handleAssetScan = useCallback((result: any) => {
    console.log('🏢 HERA: Asset scanned:', result);
    
    setScanResult(result);
    
    if (operationType === 'register') {
      // For new asset registration, start with photos
      setCurrentStep('photos');
    } else if (assetId || result.asset_id) {
      // For existing asset operations, load asset data
      const existingAsset = mockLoadAsset(assetId || result.asset_id);
      setAsset(existingAsset);
      setCurrentStep('photos');
    } else {
      // Asset not found, proceed with registration
      setCurrentStep('photos');
    }
  }, [operationType, assetId]);

  const handleScanError = useCallback((error: Error) => {
    console.error('❌ HERA: Asset scan failed:', error);
    onError?.(error);
  }, [onError]);

  const handlePhotoCapture = useCallback((photo: any) => {
    console.log('📷 HERA: Asset photo captured:', photo);
    setCapturedPhotos(prev => [...prev, photo.dataUrl]);
  }, []);

  // ==================== WORKFLOW HANDLERS ====================

  const proceedToDetails = useCallback(() => {
    if (operationType === 'register') {
      setCurrentStep('details');
    } else {
      setCurrentStep('review');
    }
  }, [operationType]);

  const handleDetailsComplete = useCallback(() => {
    if (enableLocationTracking) {
      setCurrentStep('location');
    } else {
      setCurrentStep('financial');
    }
  }, [enableLocationTracking]);

  const handleLocationComplete = useCallback(() => {
    if (operationType === 'register') {
      setCurrentStep('financial');
    } else {
      setCurrentStep('review');
    }
  }, [operationType]);

  const handleFinancialComplete = useCallback(() => {
    setCurrentStep('review');
  }, []);

  const handleOperationComplete = useCallback(() => {
    const operation: AssetOperation = {
      type: operationType,
      asset_id: asset?.id || `ASSET-${Date.now()}`,
      photos: capturedPhotos,
      notes: notes,
      performed_by: employeeId,
      timestamp: new Date().toISOString()
    };

    setCurrentStep('complete');
    onComplete?.(operation);
  }, [asset, capturedPhotos, notes, employeeId, operationType, onComplete]);

  // ==================== UTILITY FUNCTIONS ====================

  const getOperationTitle = (opType: string): string => {
    switch (opType) {
      case 'register': return 'Register New Asset';
      case 'update': return 'Update Asset';
      case 'maintenance': return 'Asset Maintenance';
      case 'transfer': return 'Transfer Asset';
      case 'dispose': return 'Dispose Asset';
      case 'audit': return 'Asset Audit';
      default: return 'Asset Operation';
    }
  };

  const getOperationIcon = (opType: string) => {
    switch (opType) {
      case 'register': return <Plus className="w-5 h-5" />;
      case 'update': return <Edit3 className="w-5 h-5" />;
      case 'maintenance': return <Wrench className="w-5 h-5" />;
      case 'transfer': return <Truck className="w-5 h-5" />;
      case 'dispose': return <Trash2 className="w-5 h-5" />;
      case 'audit': return <CheckCircle className="w-5 h-5" />;
      default: return <Building2 className="w-5 h-5" />;
    }
  };

  const mockLoadAsset = (id: string): Asset => {
    return {
      id: id,
      asset_number: 'AST-001',
      name: 'Dell OptiPlex 7090',
      description: 'Desktop computer for office use',
      category: 'computer_equipment',
      subcategory: 'Desktop Computers',
      brand: 'Dell',
      model: 'OptiPlex 7090',
      serial_number: 'DL123456789',
      barcode: '987654321098',
      location: {
        building: 'Main Office',
        floor: '2nd Floor',
        room: 'Room 205',
        department: 'IT Department'
      },
      financial: {
        purchase_date: '2023-01-15',
        purchase_price: 1200.00,
        current_value: 960.00,
        depreciation_method: 'straight_line',
        useful_life_years: 5,
        salvage_value: 100.00
      },
      maintenance: {
        last_service_date: '2024-01-01',
        next_service_date: '2024-07-01',
        maintenance_schedule: 'quarterly'
      },
      status: 'active',
      assigned_to: 'john.doe@company.com',
      photos: [],
      documents: [],
      created_by: employeeId,
      created_at: '2023-01-15T10:00:00Z',
      last_updated: new Date().toISOString()
    };
  };

  // ==================== RENDER METHODS ====================

  const renderScanningStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          {getOperationIcon(operationType)}
          <h2 className="text-2xl font-bold">{getOperationTitle(operationType)}</h2>
        </div>
        <p className="text-muted-foreground">
          {operationType === 'register' 
            ? 'Scan asset barcode/QR code or capture photo to start registration'
            : 'Scan existing asset barcode/QR code'
          }
        </p>
      </div>
      
      <div className="h-96 rounded-2xl overflow-hidden">
        <UniversalCameraInterface
          mode="asset"
          onProcessed={handleAssetScan}
          onError={handleScanError}
          autoProcess={true}
          enableAI={true}
        />
      </div>

      {operationType === 'register' && (
        <div className="text-center">
          <Button variant="outline" onClick={() => setCurrentStep('photos')}>
            Skip Scan - Register Manually
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );

  const renderPhotosStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Capture Photos</h2>
        <p className="text-muted-foreground">Take photos of the asset for documentation</p>
      </div>

      {capturedPhotos.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Captured Photos ({capturedPhotos.length})</h3>
          <div className="grid grid-cols-3 gap-2">
            {capturedPhotos.map((photo, index) => (
              <div key={index} className="relative">
                <img 
                  src={photo} 
                  alt={`Asset photo ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 w-6 h-6 p-0"
                  onClick={() => setCapturedPhotos(prev => prev.filter((_, i) => i !== index))}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="h-80 rounded-2xl overflow-hidden">
        <UniversalCameraInterface
          mode="asset"
          onCapture={handlePhotoCapture}
          onError={handleScanError}
          autoProcess={false}
          showPreview={true}
        />
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep('scan')}>
          Back to Scan
        </Button>
        <Button 
          onClick={proceedToDetails}
          disabled={capturedPhotos.length === 0}
        >
          Continue ({capturedPhotos.length} photos)
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Asset Details</h2>
        <p className="text-muted-foreground">Enter basic information about the asset</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Basic Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Asset Name *</label>
              <Input
                placeholder="Enter asset name"
                value={asset?.name || ''}
                onChange={(e) => setAsset(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                placeholder="Describe the asset..."
                value={asset?.description || ''}
                onChange={(e) => setAsset(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <Select
                value={asset?.category || ''}
                onValueChange={(value) => setAsset(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {ASSET_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {asset?.category && (
              <div>
                <label className="block text-sm font-medium mb-2">Subcategory</label>
                <Select
                  value={asset?.subcategory || ''}
                  onValueChange={(value) => setAsset(prev => ({ ...prev, subcategory: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSET_CATEGORIES.find(cat => cat.id === asset.category)?.subcategories.map((sub) => (
                      <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Identification</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Asset Number</label>
              <Input
                placeholder="Auto-generated"
                value={asset?.asset_number || `AST-${Date.now()}`}
                onChange={(e) => setAsset(prev => ({ ...prev, asset_number: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Brand</label>
              <Input
                placeholder="Enter brand"
                value={asset?.brand || ''}
                onChange={(e) => setAsset(prev => ({ ...prev, brand: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Model</label>
              <Input
                placeholder="Enter model"
                value={asset?.model || ''}
                onChange={(e) => setAsset(prev => ({ ...prev, model: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Serial Number</label>
              <Input
                placeholder="Enter serial number"
                value={asset?.serial_number || ''}
                onChange={(e) => setAsset(prev => ({ ...prev, serial_number: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Barcode</label>
              <Input
                placeholder="Scan or enter barcode"
                value={asset?.barcode || scanResult?.barcode || ''}
                onChange={(e) => setAsset(prev => ({ ...prev, barcode: e.target.value }))}
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => setCurrentStep('photos')}>
          Back
        </Button>
        <Button 
          onClick={handleDetailsComplete}
          disabled={!asset?.name || !asset?.category}
        >
          Continue to Location
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderLocationStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Asset Location</h2>
        <p className="text-muted-foreground">Specify where this asset is located</p>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Location Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Building *</label>
            <Select
              value={asset?.location?.building || ''}
              onValueChange={(value) => setAsset(prev => ({ 
                ...prev, 
                location: { ...prev?.location, building: value } 
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select building" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main_office">Main Office</SelectItem>
                <SelectItem value="warehouse_a">Warehouse A</SelectItem>
                <SelectItem value="warehouse_b">Warehouse B</SelectItem>
                <SelectItem value="retail_store">Retail Store</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Floor</label>
            <Input
              placeholder="e.g., 2nd Floor"
              value={asset?.location?.floor || ''}
              onChange={(e) => setAsset(prev => ({ 
                ...prev, 
                location: { ...prev?.location, floor: e.target.value } 
              }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Room/Area</label>
            <Input
              placeholder="e.g., Room 205"
              value={asset?.location?.room || ''}
              onChange={(e) => setAsset(prev => ({ 
                ...prev, 
                location: { ...prev?.location, room: e.target.value } 
              }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Department</label>
            <Select
              value={asset?.location?.department || ''}
              onValueChange={(value) => setAsset(prev => ({ 
                ...prev, 
                location: { ...prev?.location, department: value } 
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="it">IT Department</SelectItem>
                <SelectItem value="hr">Human Resources</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {enableLocationTracking && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">GPS Coordinates</h4>
                <p className="text-sm text-muted-foreground">Automatically captured when available</p>
              </div>
              <Button variant="outline" size="sm">
                <MapPin className="w-4 h-4 mr-1" />
                Get Current Location
              </Button>
            </div>
          </div>
        )}
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => setCurrentStep('details')}>
          Back
        </Button>
        <Button 
          onClick={handleLocationComplete}
          disabled={!asset?.location?.building}
        >
          Continue to Financial
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderFinancialStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Financial Information</h2>
        <p className="text-muted-foreground">Enter purchase and depreciation details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Purchase Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Purchase Date *</label>
              <Input
                type="date"
                value={asset?.financial?.purchase_date || ''}
                onChange={(e) => setAsset(prev => ({ 
                  ...prev, 
                  financial: { ...prev?.financial, purchase_date: e.target.value } 
                }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Purchase Price *</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={asset?.financial?.purchase_price || ''}
                onChange={(e) => setAsset(prev => ({ 
                  ...prev, 
                  financial: { ...prev?.financial, purchase_price: parseFloat(e.target.value) || 0 } 
                }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Current Value</label>
              <Input
                type="number"
                step="0.01"
                placeholder="Auto-calculated"
                value={asset?.financial?.current_value || ''}
                onChange={(e) => setAsset(prev => ({ 
                  ...prev, 
                  financial: { ...prev?.financial, current_value: parseFloat(e.target.value) || 0 } 
                }))}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Depreciation</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Depreciation Method</label>
              <Select
                value={asset?.financial?.depreciation_method || 'straight_line'}
                onValueChange={(value: any) => setAsset(prev => ({ 
                  ...prev, 
                  financial: { ...prev?.financial, depreciation_method: value } 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="straight_line">Straight Line</SelectItem>
                  <SelectItem value="declining_balance">Declining Balance</SelectItem>
                  <SelectItem value="none">No Depreciation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Useful Life (Years)</label>
              <Input
                type="number"
                placeholder="5"
                value={asset?.financial?.useful_life_years || ''}
                onChange={(e) => setAsset(prev => ({ 
                  ...prev, 
                  financial: { ...prev?.financial, useful_life_years: parseInt(e.target.value) || 0 } 
                }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Salvage Value</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={asset?.financial?.salvage_value || ''}
                onChange={(e) => setAsset(prev => ({ 
                  ...prev, 
                  financial: { ...prev?.financial, salvage_value: parseFloat(e.target.value) || 0 } 
                }))}
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => setCurrentStep('location')}>
          Back
        </Button>
        <Button 
          onClick={handleFinancialComplete}
          disabled={!asset?.financial?.purchase_date || !asset?.financial?.purchase_price}
        >
          Continue to Review
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Review Asset</h2>
        <p className="text-muted-foreground">Verify all information before completing</p>
      </div>

      {asset && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Asset Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="font-medium">{asset.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Asset Number</label>
                <p className="font-medium">{asset.asset_number}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Category</label>
                <p className="font-medium">
                  {ASSET_CATEGORIES.find(cat => cat.id === asset.category)?.name}
                  {asset.subcategory && ` - ${asset.subcategory}`}
                </p>
              </div>
              {asset.brand && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Brand & Model</label>
                  <p className="font-medium">{asset.brand} {asset.model}</p>
                </div>
              )}
              {asset.serial_number && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Serial Number</label>
                  <p className="font-medium">{asset.serial_number}</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Location & Financial</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <p className="font-medium">
                  {asset.location?.building}
                  {asset.location?.floor && `, ${asset.location.floor}`}
                  {asset.location?.room && `, ${asset.location.room}`}
                </p>
              </div>
              {asset.location?.department && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Department</label>
                  <p className="font-medium">{asset.location.department}</p>
                </div>
              )}
              {asset.financial?.purchase_price && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Purchase Price</label>
                  <p className="font-medium">${asset.financial.purchase_price.toFixed(2)}</p>
                </div>
              )}
              {asset.financial?.purchase_date && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Purchase Date</label>
                  <p className="font-medium">{new Date(asset.financial.purchase_date).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {capturedPhotos.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Photos ({capturedPhotos.length})</h3>
          <div className="grid grid-cols-4 gap-2">
            {capturedPhotos.map((photo, index) => (
              <img 
                key={index}
                src={photo} 
                alt={`Asset photo ${index + 1}`}
                className="w-full h-20 object-cover rounded-lg"
              />
            ))}
          </div>
        </Card>
      )}

      <Card className="p-4">
        <label className="block text-sm font-medium mb-2">Operation Notes</label>
        <Textarea
          placeholder="Add any additional notes about this operation..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => setCurrentStep(operationType === 'register' ? 'financial' : 'photos')}>
          Back
        </Button>
        <Button onClick={handleOperationComplete}>
          <Save className="w-4 h-4 mr-2" />
          Complete {getOperationTitle(operationType)}
        </Button>
      </div>
    </div>
  );

  const renderCompletionStep = () => (
    <motion.div
      className="text-center space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-3xl font-bold text-green-700 mb-2">
          {getOperationTitle(operationType)} Complete!
        </h2>
        <p className="text-muted-foreground">
          Asset operation has been completed successfully
        </p>
      </div>

      {asset && (
        <Card className="p-6 max-w-md mx-auto">
          <div className="space-y-2">
            <p><strong>Asset:</strong> {asset.name}</p>
            <p><strong>Asset Number:</strong> {asset.asset_number}</p>
            <p><strong>Operation:</strong> {getOperationTitle(operationType)}</p>
            <p><strong>Photos:</strong> {capturedPhotos.length} captured</p>
            <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
          </div>
        </Card>
      )}

      <Button onClick={() => window.location.reload()}>
        Start New Operation
      </Button>
    </motion.div>
  );

  // ==================== MAIN RENDER ====================

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 'scan' && renderScanningStep()}
          {currentStep === 'photos' && renderPhotosStep()}
          {currentStep === 'details' && renderDetailsStep()}
          {currentStep === 'location' && renderLocationStep()}
          {currentStep === 'financial' && renderFinancialStep()}
          {currentStep === 'review' && renderReviewStep()}
          {currentStep === 'complete' && renderCompletionStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default AssetManagementWorkflow;