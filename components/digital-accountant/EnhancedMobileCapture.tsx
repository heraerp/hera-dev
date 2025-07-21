/**
 * HERA Enhanced Mobile Capture - Revolutionary Receipt Processing
 * 
 * Advanced AI-powered receipt capture with:
 * - Real-time AI preview and feedback
 * - Voice command integration
 * - Intelligent auto-capture
 * - Seamless workflow integration
 * - Mobile-first design
 */

'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Upload, Check, X, RefreshCw, MapPin, Clock, AlertCircle,
  Mic, MicOff, Volume2, Eye, Zap, Brain, Target, Sparkles,
  DollarSign, Tag, Calendar, User, ArrowRight, CheckCircle2
} from 'lucide-react';
import { useCashMarketAPI } from '@/hooks/useCashMarketAPI';

interface EnhancedCaptureProps {
  onReceiptCaptured: (receipt: any) => void;
  onTransactionCreated?: (transaction: any) => void;
  className?: string;
  mode?: 'capture' | 'voice' | 'smart';
}

interface AIPreview {
  confidence: number;
  vendor?: string;
  amount?: number;
  category?: string;
  suggestions: string[];
  readyToCapture: boolean;
}

export default function EnhancedMobileCapture({ 
  onReceiptCaptured,
  onTransactionCreated,
  className = '',
  mode = 'capture'
}: EnhancedCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [aiPreview, setAiPreview] = useState<AIPreview | null>(null);
  const [location, setLocation] = useState<string>('');
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);
  const [processingResult, setProcessingResult] = useState<any>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  
  const { receipts, transactions, loading, error, clearError } = useCashMarketAPI();

  // Enhanced location with business context
  const getCurrentLocation = useCallback(async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // In production: Reverse geocode to get business name/area
          const contextualLocation = await getBusinessContext(latitude, longitude);
          setLocation(contextualLocation || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          
          // Get smart suggestions based on location
          getLocationBasedSuggestions(latitude, longitude);
        },
        () => setLocation('Location unavailable')
      );
    }
  }, []);

  // Mock business context (replace with real geocoding)
  const getBusinessContext = async (lat: number, lng: number): Promise<string> => {
    // Mock different business districts
    return Math.random() > 0.5 ? 'Financial District' : 'Market Square';
  };

  // Get suggestions based on location and time
  const getLocationBasedSuggestions = useCallback((lat: number, lng: number) => {
    const hour = new Date().getHours();
    const suggestions: string[] = [];
    
    if (hour >= 6 && hour <= 10) {
      suggestions.push('🌅 Morning coffee or breakfast');
    } else if (hour >= 11 && hour <= 14) {
      suggestions.push('🍽️ Business lunch');
    } else if (hour >= 15 && hour <= 18) {
      suggestions.push('☕ Afternoon coffee meeting');
    }
    
    // Mock location-based suggestions
    suggestions.push('🐟 Fresh seafood from market', '🥕 Organic produce', '🥩 Premium meats');
    
    setSmartSuggestions(suggestions);
  }, []);

  // Voice recognition setup
  const setupVoiceRecognition = useCallback(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceText(transcript);
        
        // Parse voice command for amount and description
        parseVoiceCommand(transcript);
      };
      
      recognitionRef.current.onend = () => {
        setVoiceMode(false);
      };
    }
  }, []);

  // Parse voice commands like "Post $15 coffee expense"
  const parseVoiceCommand = useCallback(async (text: string) => {
    const amountMatch = text.match(/\$?(\d+(?:\.\d{2})?)/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : null;
    
    // Extract category/description
    const description = text.replace(/post|add|expense|\$\d+(\.\d{2})?/gi, '').trim();
    
    if (amount && description) {
      // Create transaction directly from voice
      try {
        const result = await transactions.create({
          vendorId: 'voice-entry',
          amount,
          description,
          category: 'voice-expense',
          submittedBy: 'Voice Assistant',
          aiConfidence: 0.8,
          notes: `Voice entry: "${text}"`
        });
        
        if (result.data) {
          setProcessingResult({
            voice: true,
            amount,
            description,
            transactionId: result.data.id
          });
          onTransactionCreated?.(result.data);
        }
      } catch (error) {
        console.error('Voice transaction creation failed:', error);
        setUploadError('Failed to create voice transaction');
      }
    }
  }, [transactions, onTransactionCreated]);

  // Start voice mode
  const startVoiceCapture = useCallback(() => {
    if (!recognitionRef.current) {
      setupVoiceRecognition();
    }
    
    setVoiceMode(true);
    setVoiceText('');
    recognitionRef.current?.start();
  }, [setupVoiceRecognition]);

  // Enhanced camera with AI preview
  const startSmartCamera = useCallback(async () => {
    try {
      setIsCapturing(true);
      getCurrentLocation();
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        // Start real-time AI analysis
        startAIPreview();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setIsCapturing(false);
    }
  }, [getCurrentLocation]);

  // Real-time AI preview (mock implementation)
  const startAIPreview = useCallback(() => {
    const interval = setInterval(() => {
      // Mock AI analysis of camera feed
      const mockPreview: AIPreview = {
        confidence: Math.random() * 100,
        vendor: Math.random() > 0.7 ? 'Mario\'s Coffee Shop' : undefined,
        amount: Math.random() > 0.6 ? Math.round(Math.random() * 100) : undefined,
        category: Math.random() > 0.5 ? 'Food & Beverage' : 'Office Supplies',
        suggestions: ['Center the receipt', 'Move closer', 'Good lighting detected'],
        readyToCapture: Math.random() > 0.3
      };
      
      setAiPreview(mockPreview);
    }, 1000);

    // Cleanup on unmount or capture end
    return () => clearInterval(interval);
  }, []);

  // Smart auto-capture when conditions are perfect
  const autoCapture = useCallback(() => {
    if (aiPreview?.readyToCapture && aiPreview.confidence > 85) {
      capturePhoto();
    }
  }, [aiPreview]);

  // Enhanced photo capture
  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageData);
        setAiPreview(null);
        
        // Stop camera and cleanup
        const stream = video.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
        setIsCapturing(false);
        
        // Immediate processing for better UX
        processReceiptImmediate(imageData);
      }
    }
  }, []);

  // Immediate processing with real-time feedback
  const processReceiptImmediate = useCallback(async (imageData: string) => {
    setProcessing(true);
    setUploadError(null);
    
    try {
      // Create receipt record
      const receiptResponse = await receipts.create({
        filename: `receipt_${Date.now()}.jpg`,
        imageUrl: imageData,
        uploadedBy: 'Enhanced Mobile Capture',
        processingStatus: 'processing',
        notes: `Smart capture at ${location} on ${new Date().toLocaleString()}`
      });
      
      if (receiptResponse.data) {
        // Process with enhanced AI
        const processResponse = await receipts.process(receiptResponse.data.id);
        
        if (processResponse.data) {
          const result = processResponse.data;
          setProcessingResult(result);
          
          // Enhanced receipt object with AI insights
          const enhancedReceipt = {
            id: receiptResponse.data.id,
            image: imageData,
            timestamp: new Date(),
            location,
            vendor: result.aiResults?.vendor || 'Unknown Vendor',
            amount: result.aiResults?.amount ? `$${result.aiResults.amount}` : 'Unknown',
            confidence: result.confidence || 0,
            category: result.aiResults?.category,
            autoPosted: result.confidence > 0.9,
            needsReview: result.confidence < 0.7
          };
          
          onReceiptCaptured(enhancedReceipt);
          
          // Auto-create transaction if high confidence
          if (result.confidence > 0.9 && result.aiResults?.amount) {
            const transactionResult = await transactions.create({
              vendorId: result.aiResults?.vendorId || 'auto-detected',
              receiptId: receiptResponse.data.id,
              amount: result.aiResults.amount,
              description: result.aiResults?.description || 'Auto-processed expense',
              category: result.aiResults?.category || 'expense',
              submittedBy: 'AI Assistant',
              aiConfidence: result.confidence,
              receiptImageUrl: imageData
            });
            
            if (transactionResult.data) {
              onTransactionCreated?.(transactionResult.data);
            }
          }
        }
      }
    } catch (error) {
      console.error('Enhanced processing failed:', error);
      setUploadError('Processing failed - please try again');
    } finally {
      setProcessing(false);
    }
  }, [location, receipts, transactions, onReceiptCaptured, onTransactionCreated]);

  // Cancel capture
  const cancelCapture = useCallback(() => {
    setCapturedImage(null);
    setLocation('');
    setUploadError(null);
    setProcessingResult(null);
    setAiPreview(null);
    setVoiceText('');
    setVoiceMode(false);
    clearError();
    
    if (isCapturing && videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      setIsCapturing(false);
    }
  }, [isCapturing, clearError]);

  useEffect(() => {
    getCurrentLocation();
    setupVoiceRecognition();
  }, [getCurrentLocation, setupVoiceRecognition]);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Smart Receipt Capture</h3>
            <p className="text-sm opacity-90">AI-powered instant processing</p>
          </div>
          <div className="flex items-center space-x-2">
            {aiPreview && (
              <div className="flex items-center bg-white/20 rounded-full px-3 py-1">
                <Brain className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">{Math.round(aiPreview.confidence)}%</span>
              </div>
            )}
            <div className="flex items-center text-sm">
              <Clock className="w-4 h-4 mr-1" />
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Voice Mode Interface */}
        <AnimatePresence>
          {voiceMode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Mic className="w-5 h-5 text-green-600 mr-2 animate-pulse" />
                  <span className="font-medium text-green-800 dark:text-green-200">Listening...</span>
                </div>
                <button
                  onClick={() => setVoiceMode(false)}
                  className="text-green-600 hover:text-green-800 dark:text-green-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-green-700 dark:text-green-300 text-sm mb-2">
                Say something like: "Post $15 coffee expense" or "Add $50 lunch with client"
              </p>
              {voiceText && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border">
                  <p className="text-gray-900 dark:text-gray-100">{voiceText}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Camera View with AI Overlay */}
        {isCapturing && (
          <div className="relative mb-6 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full rounded-lg"
              autoPlay
              playsInline
            />
            
            {/* AI Preview Overlay */}
            {aiPreview && (
              <div className="absolute top-4 left-4 right-4">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black/70 backdrop-blur-sm text-white rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-2" />
                      <span className="font-medium">AI Preview</span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      aiPreview.confidence > 80 ? 'bg-green-500' : 
                      aiPreview.confidence > 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}>
                      {Math.round(aiPreview.confidence)}%
                    </div>
                  </div>
                  
                  {aiPreview.vendor && (
                    <p className="text-sm">📍 {aiPreview.vendor}</p>
                  )}
                  {aiPreview.amount && (
                    <p className="text-sm">💰 ${aiPreview.amount}</p>
                  )}
                  
                  <div className="mt-2">
                    {aiPreview.suggestions.map((suggestion, index) => (
                      <p key={index} className="text-xs opacity-80">• {suggestion}</p>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}

            {/* Capture Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
              <button
                onClick={capturePhoto}
                className={`rounded-full p-4 shadow-lg transition-all ${
                  aiPreview?.readyToCapture 
                    ? 'bg-green-600 hover:bg-green-700 animate-pulse' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                <Camera className="w-6 h-6" />
              </button>
              
              {aiPreview?.readyToCapture && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={autoCapture}
                  className="bg-green-500 hover:bg-green-600 text-white rounded-full p-3 shadow-lg"
                  title="Auto-capture (AI ready)"
                >
                  <Zap className="w-5 h-5" />
                </motion.button>
              )}
            </div>

            <button
              onClick={cancelCapture}
              className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full p-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Processing Result Display */}
        {processingResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
          >
            <div className="flex items-center mb-3">
              <CheckCircle2 className="w-6 h-6 text-green-600 mr-2" />
              <span className="font-semibold text-green-800 dark:text-green-200">
                {processingResult.voice ? 'Voice Command Processed!' : 'Receipt Processed Successfully!'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              {processingResult.aiResults?.vendor && (
                <div className="flex items-center">
                  <Tag className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-gray-600 dark:text-gray-300">Vendor:</span>
                  <span className="ml-2 font-medium">{processingResult.aiResults.vendor}</span>
                </div>
              )}
              
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-gray-600 dark:text-gray-300">Amount:</span>
                <span className="ml-2 font-medium">
                  ${processingResult.aiResults?.amount || processingResult.amount || '0.00'}
                </span>
              </div>
              
              {processingResult.confidence && (
                <div className="flex items-center">
                  <Brain className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-gray-600 dark:text-gray-300">Confidence:</span>
                  <span className="ml-2 font-medium">{Math.round(processingResult.confidence * 100)}%</span>
                </div>
              )}
              
              <div className="flex items-center">
                <CheckCircle2 className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-gray-600 dark:text-gray-300">Status:</span>
                <span className="ml-2 font-medium">
                  {processingResult.autoCreatedTransaction ? 'Auto-Posted' : 'Needs Review'}
                </span>
              </div>
            </div>

            {processingResult.autoCreatedTransaction && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center">
                  <Sparkles className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-blue-800 dark:text-blue-200 font-medium">
                    Transaction Auto-Created!
                  </span>
                </div>
                <p className="text-blue-600 dark:text-blue-300 text-sm mt-1">
                  #{processingResult.autoCreatedTransaction.number}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Action Buttons */}
        {!isCapturing && !processingResult && (
          <div className="space-y-4">
            {/* Smart Suggestions */}
            {smartSuggestions.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quick Suggestions:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {smartSuggestions.slice(0, 3).map((suggestion, index) => (
                    <button
                      key={index}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Primary Actions */}
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={startSmartCamera}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 px-6 rounded-lg flex items-center justify-center text-lg font-medium shadow-lg"
              >
                <Camera className="w-6 h-6 mr-3" />
                Smart Camera Capture
                <Sparkles className="w-5 h-5 ml-2" />
              </button>
              
              <button
                onClick={startVoiceCapture}
                disabled={voiceMode}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-lg flex items-center justify-center text-lg font-medium shadow-lg"
              >
                {voiceMode ? (
                  <MicOff className="w-6 h-6 mr-3" />
                ) : (
                  <Mic className="w-6 h-6 mr-3" />
                )}
                Voice Command Entry
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg flex items-center justify-center font-medium"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload Photo
              </button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const imageData = e.target?.result as string;
                    setCapturedImage(imageData);
                    processReceiptImmediate(imageData);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="hidden"
            />
          </div>
        )}

        {/* Error Display */}
        {uploadError && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-red-800 dark:text-red-200 font-medium">Processing Error</p>
                <p className="text-red-600 dark:text-red-400 text-sm">{uploadError}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}