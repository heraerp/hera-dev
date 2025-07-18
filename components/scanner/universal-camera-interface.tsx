/**
 * HERA Universal ERP - Universal Camera Interface
 * Revolutionary mobile-first scanning interface
 * World's most advanced ERP camera component
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  ScanLine, 
  Zap, 
  Target, 
  CheckCircle, 
  AlertTriangle, 
  RotateCcw, 
  Flash, 
  FlashOff,
  SwitchCamera,
  Settings,
  FileText,
  Package,
  Receipt,
  CreditCard,
  Building2,
  X,
  Download,
  Upload
} from 'lucide-react';
import { universalCameraService, CapturedPhoto, DocumentType, CameraOptions } from '@/lib/camera/universal-camera-service';
import { aiProcessingPipeline } from '@/lib/ai/document-processing-pipeline';
import { digitalAccountantSystem } from '@/lib/scanner/digital-accountant-system';
import { barcodeScanningEngine } from '@/lib/scanner/barcode-scanning-engine';
import { Button } from '@/components/ui/revolutionary-button';
import { Card } from '@/components/ui/revolutionary-card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import motionConfig from '@/lib/motion';

// ==================== INTERFACE TYPES ====================

interface UniversalCameraInterfaceProps {
  mode: 'document' | 'barcode' | 'receipt' | 'invoice' | 'asset' | 'business_card';
  onCapture?: (photo: CapturedPhoto) => void;
  onProcessed?: (result: any) => void;
  onError?: (error: Error) => void;
  autoProcess?: boolean;
  showPreview?: boolean;
  allowModeSwitch?: boolean;
  enableAI?: boolean;
  className?: string;
}

interface ScanningState {
  status: 'idle' | 'initializing' | 'ready' | 'scanning' | 'processing' | 'success' | 'error';
  progress: number;
  message: string;
  confidence: number;
  detectedType?: DocumentType;
  result?: any;
  error?: string;
}

interface CameraState {
  isInitialized: boolean;
  isActive: boolean;
  facingMode: 'user' | 'environment';
  flashMode: 'auto' | 'on' | 'off';
  resolution: 'low' | 'medium' | 'high' | 'ultra';
  capabilities?: MediaTrackCapabilities;
  error?: string;
}

interface UIState {
  showSettings: boolean;
  showGuides: boolean;
  showStats: boolean;
  isFullscreen: boolean;
  showPreview: boolean;
  previewImage?: CapturedPhoto;
}

// ==================== MAIN COMPONENT ====================

export function UniversalCameraInterface({
  mode = 'document',
  onCapture,
  onProcessed,
  onError,
  autoProcess = true,
  showPreview = true,
  allowModeSwitch = true,
  enableAI = true,
  className = ''
}: UniversalCameraInterfaceProps) {
  // ==================== STATE MANAGEMENT ====================
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [scanningState, setScanningState] = useState<ScanningState>({
    status: 'idle',
    progress: 0,
    message: 'Ready to scan',
    confidence: 0
  });
  
  const [cameraState, setCameraState] = useState<CameraState>({
    isInitialized: false,
    isActive: false,
    facingMode: 'environment',
    flashMode: 'auto',
    resolution: 'high'
  });
  
  const [uiState, setUIState] = useState<UIState>({
    showSettings: false,
    showGuides: true,
    showStats: false,
    isFullscreen: false,
    showPreview: false
  });

  // ==================== CAMERA INITIALIZATION ====================

  const initializeCamera = useCallback(async () => {
    try {
      setScanningState(prev => ({ 
        ...prev, 
        status: 'initializing', 
        message: 'Initializing camera...' 
      }));

      const options: Partial<CameraOptions> = {
        facingMode: cameraState.facingMode,
        resolution: cameraState.resolution,
        flashMode: cameraState.flashMode,
        scanMode: mode,
        enableMLProcessing: enableAI
      };

      const stream = await universalCameraService.initializeCamera(options);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      streamRef.current = stream;
      
      setCameraState(prev => ({
        ...prev,
        isInitialized: true,
        isActive: true,
        capabilities: stream.getVideoTracks()[0]?.getCapabilities()
      }));

      setScanningState(prev => ({
        ...prev,
        status: 'ready',
        message: getModeMessage(mode)
      }));

    } catch (error) {
      console.error('❌ HERA: Camera initialization failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Camera access failed';
      
      setCameraState(prev => ({ ...prev, error: errorMessage }));
      setScanningState(prev => ({
        ...prev,
        status: 'error',
        message: errorMessage,
        error: errorMessage
      }));
      
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [cameraState.facingMode, cameraState.resolution, cameraState.flashMode, mode, enableAI, onError]);

  // ==================== PHOTO CAPTURE ====================

  const capturePhoto = useCallback(async () => {
    try {
      setScanningState(prev => ({
        ...prev,
        status: 'scanning',
        progress: 20,
        message: 'Capturing image...'
      }));

      const photo = await universalCameraService.capturePhoto('auto_enhance');
      
      setScanningState(prev => ({
        ...prev,
        progress: 40,
        message: 'Processing image...'
      }));

      onCapture?.(photo);

      if (showPreview) {
        setUIState(prev => ({
          ...prev,
          showPreview: true,
          previewImage: photo
        }));
      }

      if (autoProcess && enableAI) {
        await processPhoto(photo);
      } else {
        setScanningState(prev => ({
          ...prev,
          status: 'success',
          progress: 100,
          message: 'Photo captured successfully'
        }));
      }

    } catch (error) {
      console.error('❌ HERA: Photo capture failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Photo capture failed';
      
      setScanningState(prev => ({
        ...prev,
        status: 'error',
        message: errorMessage,
        error: errorMessage
      }));
      
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [onCapture, showPreview, autoProcess, enableAI, onError]);

  // ==================== AI PROCESSING ====================

  const processPhoto = useCallback(async (photo: CapturedPhoto) => {
    try {
      setScanningState(prev => ({
        ...prev,
        status: 'processing',
        progress: 60,
        message: 'AI is analyzing...'
      }));

      let result: any;

      switch (mode) {
        case 'document':
          result = await aiProcessingPipeline.classifyDocument(photo);
          setScanningState(prev => ({
            ...prev,
            detectedType: result.documentType,
            confidence: result.confidence
          }));
          break;

        case 'invoice':
          result = await digitalAccountantSystem.processInvoice(photo);
          break;

        case 'receipt':
          // Would need employee context
          result = await digitalAccountantSystem.processReceipt(photo, 'current_user');
          break;

        case 'barcode':
          result = await barcodeScanningEngine.scanBarcode(photo);
          break;

        case 'business_card':
          result = await digitalAccountantSystem.processBusinessCard(photo);
          break;

        case 'asset':
          result = await processAssetPhoto(photo);
          break;

        default:
          result = await aiProcessingPipeline.classifyDocument(photo);
      }

      setScanningState(prev => ({
        ...prev,
        status: 'success',
        progress: 100,
        message: getSuccessMessage(mode, result),
        result,
        confidence: result.confidence || result.match_confidence || 0.9
      }));

      onProcessed?.(result);

    } catch (error) {
      console.error('❌ HERA: Photo processing failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Processing failed';
      
      setScanningState(prev => ({
        ...prev,
        status: 'error',
        message: errorMessage,
        error: errorMessage
      }));
      
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [mode, onProcessed, onError]);

  // ==================== CAMERA CONTROLS ====================

  const switchCamera = useCallback(async () => {
    try {
      const newFacingMode = cameraState.facingMode === 'user' ? 'environment' : 'user';
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      setCameraState(prev => ({
        ...prev,
        facingMode: newFacingMode,
        isInitialized: false
      }));

      // Reinitialize with new facing mode
      setTimeout(() => initializeCamera(), 100);

    } catch (error) {
      console.error('❌ HERA: Camera switch failed:', error);
    }
  }, [cameraState.facingMode, initializeCamera]);

  const toggleFlash = useCallback(() => {
    const flashModes: Array<'auto' | 'on' | 'off'> = ['auto', 'on', 'off'];
    const currentIndex = flashModes.indexOf(cameraState.flashMode);
    const nextFlashMode = flashModes[(currentIndex + 1) % flashModes.length];
    
    setCameraState(prev => ({ ...prev, flashMode: nextFlashMode }));
    
    // Apply flash setting to camera
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack && 'torch' in videoTrack.getCapabilities()) {
        videoTrack.applyConstraints({
          torch: nextFlashMode === 'on'
        }).catch(console.warn);
      }
    }
  }, [cameraState.flashMode]);

  // ==================== LIFECYCLE EFFECTS ====================

  useEffect(() => {
    initializeCamera();
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [initializeCamera]);

  useEffect(() => {
    // Reset scanning state when mode changes
    setScanningState(prev => ({
      ...prev,
      status: 'ready',
      message: getModeMessage(mode),
      progress: 0,
      confidence: 0,
      detectedType: undefined,
      result: undefined,
      error: undefined
    }));
  }, [mode]);

  // ==================== RENDER METHODS ====================

  const renderScanningOverlay = () => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* Scanning Frame */}
      <motion.div
        className="relative w-80 h-80 border-2 border-primary rounded-2xl"
        animate={{
          scale: scanningState.status === 'scanning' ? [1, 1.05, 1] : 1,
          borderColor: getScanningColor()
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Corner guides */}
        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />

        {/* Scanning line animation */}
        <AnimatePresence>
          {scanningState.status === 'scanning' && (
            <motion.div
              className="absolute inset-x-0 h-0.5 bg-primary shadow-lg"
              initial={{ top: '0%' }}
              animate={{ top: '100%' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </AnimatePresence>

        {/* Success overlay */}
        <AnimatePresence>
          {scanningState.status === 'success' && (
            <motion.div
              className="absolute inset-0 bg-green-500/20 rounded-2xl flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <CheckCircle className="w-16 h-16 text-green-500" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error overlay */}
        <AnimatePresence>
          {scanningState.status === 'error' && (
            <motion.div
              className="absolute inset-0 bg-red-500/20 rounded-2xl flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <AlertTriangle className="w-16 h-16 text-red-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Mode indicator */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <Badge variant="secondary" className="bg-black/50 text-white">
          {getModeIcon(mode)}
          <span className="ml-2">{getModeTitle(mode)}</span>
        </Badge>
      </div>

      {/* Detection results */}
      <AnimatePresence>
        {(scanningState.detectedType || scanningState.confidence > 0) && (
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card variant="glass" className="p-4 bg-black/50 text-white">
              {scanningState.detectedType && (
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4" />
                  <span className="text-sm">Detected: {scanningState.detectedType}</span>
                </div>
              )}
              {scanningState.confidence > 0 && (
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm">Confidence: {Math.round(scanningState.confidence * 100)}%</span>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderControls = () => (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
      {/* Flash control */}
      <Button
        variant="outline"
        size="lg"
        onClick={toggleFlash}
        className="w-12 h-12 rounded-full bg-black/50 border-white/20 text-white hover:bg-white/20"
      >
        {cameraState.flashMode === 'off' ? <FlashOff className="w-5 h-5" /> : <Flash className="w-5 h-5" />}
      </Button>

      {/* Capture button */}
      <Button
        variant="gradient"
        size="lg"
        onClick={capturePhoto}
        disabled={scanningState.status !== 'ready'}
        className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-accent relative overflow-hidden"
        hapticFeedback={true}
        particleEffect={true}
      >
        <AnimatePresence mode="wait">
          {scanningState.status === 'ready' ? (
            <motion.div
              key="camera"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Camera className="w-8 h-8" />
            </motion.div>
          ) : scanningState.status === 'scanning' || scanningState.status === 'processing' ? (
            <motion.div
              key="loading"
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              exit={{ scale: 0 }}
              transition={{ rotate: { duration: 1, repeat: Infinity, ease: 'linear' } }}
            >
              <ScanLine className="w-8 h-8" />
            </motion.div>
          ) : (
            <motion.div
              key="check"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <CheckCircle className="w-8 h-8" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      {/* Camera switch */}
      <Button
        variant="outline"
        size="lg"
        onClick={switchCamera}
        className="w-12 h-12 rounded-full bg-black/50 border-white/20 text-white hover:bg-white/20"
      >
        <SwitchCamera className="w-5 h-5" />
      </Button>
    </div>
  );

  const renderStatusBar = () => (
    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <motion.div
          className={`w-3 h-3 rounded-full ${getStatusColor()}`}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="text-white text-sm font-medium">{scanningState.message}</span>
      </div>

      <div className="flex items-center gap-2">
        {scanningState.progress > 0 && scanningState.progress < 100 && (
          <div className="w-20">
            <Progress value={scanningState.progress} className="h-1" />
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setUIState(prev => ({ ...prev, showSettings: !prev.showSettings }))}
          className="text-white hover:bg-white/20"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  const renderPreview = () => (
    <AnimatePresence>
      {uiState.showPreview && uiState.previewImage && (
        <motion.div
          className="absolute inset-0 bg-black/90 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="relative max-w-lg w-full p-4">
            <div className="relative">
              <img
                src={uiState.previewImage.dataUrl}
                alt="Captured"
                className="w-full h-auto rounded-lg"
              />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUIState(prev => ({ ...prev, showPreview: false }))}
                className="absolute top-2 right-2 text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="mt-4 flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => setUIState(prev => ({ ...prev, showPreview: false }))}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake
              </Button>
              
              <Button
                variant="gradient"
                onClick={() => {
                  if (uiState.previewImage && autoProcess && enableAI) {
                    processPhoto(uiState.previewImage);
                  }
                  setUIState(prev => ({ ...prev, showPreview: false }));
                }}
              >
                <Upload className="w-4 h-4 mr-2" />
                Process
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ==================== MAIN RENDER ====================

  return (
    <div className={`relative w-full h-full bg-black rounded-2xl overflow-hidden ${className}`}>
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
        style={{ transform: cameraState.facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
      />

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera initialization overlay */}
      <AnimatePresence>
        {!cameraState.isInitialized && (
          <motion.div
            className="absolute inset-0 bg-black flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center text-white">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-lg font-medium">Initializing Camera...</p>
              <p className="text-sm text-gray-400 mt-2">Please allow camera access</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main UI overlays */}
      {cameraState.isInitialized && (
        <>
          {renderStatusBar()}
          {renderScanningOverlay()}
          {renderControls()}
        </>
      )}

      {/* Error state */}
      <AnimatePresence>
        {cameraState.error && (
          <motion.div
            className="absolute inset-0 bg-red-900/90 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center text-white p-8">
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-400" />
              <h3 className="text-xl font-bold mb-2">Camera Error</h3>
              <p className="text-red-200 mb-4">{cameraState.error}</p>
              <Button
                variant="outline"
                onClick={() => {
                  setCameraState(prev => ({ ...prev, error: undefined }));
                  initializeCamera();
                }}
                className="border-red-400 text-red-400 hover:bg-red-400/20"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview modal */}
      {renderPreview()}
    </div>
  );
}

// ==================== HELPER FUNCTIONS ====================

function getModeIcon(mode: string) {
  switch (mode) {
    case 'invoice': return <FileText className="w-4 h-4" />;
    case 'receipt': return <Receipt className="w-4 h-4" />;
    case 'barcode': return <Package className="w-4 h-4" />;
    case 'business_card': return <CreditCard className="w-4 h-4" />;
    case 'asset': return <Building2 className="w-4 h-4" />;
    default: return <FileText className="w-4 h-4" />;
  }
}

function getModeTitle(mode: string): string {
  switch (mode) {
    case 'invoice': return 'Invoice Scanner';
    case 'receipt': return 'Receipt Scanner';
    case 'barcode': return 'Barcode Scanner';
    case 'business_card': return 'Business Card';
    case 'asset': return 'Asset Documentation';
    default: return 'Document Scanner';
  }
}

function getModeMessage(mode: string): string {
  switch (mode) {
    case 'invoice': return 'Position invoice within frame';
    case 'receipt': return 'Align receipt in the frame';
    case 'barcode': return 'Point camera at barcode';
    case 'business_card': return 'Place business card in frame';
    case 'asset': return 'Capture asset photo';
    default: return 'Position document in frame';
  }
}

function getSuccessMessage(mode: string, result: any): string {
  switch (mode) {
    case 'invoice': 
      return result.vendor ? `Invoice from ${result.vendor.vendor_name}` : 'Invoice processed';
    case 'receipt':
      return result.merchant ? `Receipt from ${result.merchant.name}` : 'Receipt processed';
    case 'barcode':
      return result.product ? `Product: ${result.product.name}` : 'Barcode scanned';
    case 'business_card':
      return result.contact ? `Contact: ${result.contact.name}` : 'Business card scanned';
    default:
      return 'Document processed successfully';
  }
}

function getScanningColor(): string {
  // This would be dynamic based on scanning state
  return '#3B82F6'; // Primary blue
}

function getStatusColor(): string {
  return 'bg-green-500'; // Online indicator
}

// Placeholder for asset processing
async function processAssetPhoto(photo: CapturedPhoto): Promise<any> {
  // Asset photo processing implementation
  return {
    asset_id: 'asset_' + Date.now(),
    confidence: 0.9
  };
}

export default UniversalCameraInterface;