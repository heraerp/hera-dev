'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Camera, Upload, Check, X, RefreshCw, MapPin, Clock } from 'lucide-react'

interface CapturedReceipt {
  id: string
  image: string
  timestamp: Date
  location?: string
  vendor?: string
  amount?: string
  confidence?: number
}

interface MobileReceiptCaptureProps {
  onReceiptCaptured: (receipt: CapturedReceipt) => void
  className?: string
}

export default function MobileReceiptCapture({ 
  onReceiptCaptured, 
  className = '' 
}: MobileReceiptCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [location, setLocation] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Get user location for market tracking
  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In real app, reverse geocode to get market name
          setLocation(`Market Location: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`)
        },
        () => setLocation('Location unavailable')
      )
    }
  }, [])

  // Start camera for receipt capture
  const startCamera = useCallback(async () => {
    try {
      setIsCapturing(true)
      getCurrentLocation()
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      setIsCapturing(false)
    }
  }, [getCurrentLocation])

  // Capture photo from camera
  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0)
        
        const imageData = canvas.toDataURL('image/jpeg', 0.9)
        setCapturedImage(imageData)
        
        // Stop camera
        const stream = video.srcObject as MediaStream
        stream?.getTracks().forEach(track => track.stop())
        setIsCapturing(false)
      }
    }
  }, [])

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string)
        getCurrentLocation()
      }
      reader.readAsDataURL(file)
    }
  }, [getCurrentLocation])

  // Process captured receipt with AI
  const processReceipt = useCallback(async () => {
    if (!capturedImage) return
    
    setProcessing(true)
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock AI extraction results
    const receipt: CapturedReceipt = {
      id: `receipt-${Date.now()}`,
      image: capturedImage,
      timestamp: new Date(),
      location,
      vendor: 'Fresh Fish Market',
      amount: '$45.80',
      confidence: 0.87
    }
    
    setProcessing(false)
    onReceiptCaptured(receipt)
    
    // Reset for next capture
    setCapturedImage(null)
    setLocation('')
  }, [capturedImage, location, onReceiptCaptured])

  // Cancel capture
  const cancelCapture = useCallback(() => {
    setCapturedImage(null)
    setLocation('')
    
    if (isCapturing && videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream
      stream?.getTracks().forEach(track => track.stop())
      setIsCapturing(false)
    }
  }, [isCapturing])

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Market Receipt Capture
          </h3>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Camera View */}
        {isCapturing && (
          <div className="relative mb-4">
            <video
              ref={videoRef}
              className="w-full rounded-lg"
              autoPlay
              playsInline
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <button
                onClick={capturePhoto}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg"
              >
                <Camera className="w-6 h-6" />
              </button>
            </div>
            <button
              onClick={cancelCapture}
              className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full p-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Captured Image Preview */}
        {capturedImage && (
          <div className="mb-4">
            <img
              src={capturedImage}
              alt="Captured receipt"
              className="w-full rounded-lg border"
            />
            
            {location && (
              <div className="mt-2 flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-1" />
                {location}
              </div>
            )}
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={processReceipt}
                disabled={processing}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg flex items-center justify-center"
              >
                {processing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Process Receipt
                  </>
                )}
              </button>
              
              <button
                onClick={cancelCapture}
                disabled={processing}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Capture Options */}
        {!isCapturing && !capturedImage && (
          <div className="space-y-4">
            <button
              onClick={startCamera}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center"
            >
              <Camera className="w-5 h-5 mr-2" />
              Take Photo
            </button>
            
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg flex items-center justify-center"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload Photo
              </button>
            </div>
            
            <div className="text-center text-sm text-gray-500">
              <p>Capture receipts from fish markets, meat vendors,</p>
              <p>produce stands, and other cash purchases</p>
            </div>
          </div>
        )}

        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}