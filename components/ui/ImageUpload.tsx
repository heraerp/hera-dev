'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

/**
 * ImageUpload Component
 * 
 * Reusable image upload component with preview, validation, and progress
 * Following the same design patterns as other HERA components
 */

interface ImageUploadProps {
  value?: string; // Current image URL
  onChange: (imageUrl: string, imageName: string) => void;
  onRemove: () => void;
  organizationId: string;
  disabled?: boolean;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  placeholder?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onRemove,
  organizationId,
  disabled = false,
  maxSize = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  placeholder = 'Upload menu item image'
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type. Allowed: ${acceptedTypes.join(', ')}`;
    }

    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File too large. Maximum size: ${maxSize}MB`;
    }

    return null;
  };

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      setError(null);

      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      // Create form data
      const formData = new FormData();
      formData.append('image', file);

      // Upload to API
      const response = await fetch(`/api/menu/upload-image?organizationId=${organizationId}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      
      // Call onChange with the new image URL and name
      onChange(result.data.imageUrl, result.data.imageName);
      
      console.log('✅ Image uploaded:', result.data);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleRemove = async () => {
    if (value) {
      // For Supabase Storage, we need to extract the full path from the URL
      // URL format: https://[project].supabase.co/storage/v1/object/public/menu-images/[orgId]/menu-[timestamp]-[random].[ext]
      const urlParts = value.split('/');
      const bucketIndex = urlParts.findIndex(part => part === 'menu-images');
      
      if (bucketIndex !== -1 && bucketIndex + 2 < urlParts.length) {
        // Extract the path after the bucket name: orgId/filename
        const filename = urlParts.slice(bucketIndex + 1).join('/');
        
        try {
          await fetch(`/api/menu/upload-image?filename=${encodeURIComponent(filename)}&organizationId=${organizationId}`, {
            method: 'DELETE',
          });
          console.log('✅ Image deleted from cloud storage');
        } catch (err) {
          console.error('Error deleting image from cloud storage:', err);
        }
      } else {
        console.warn('Could not extract filename from image URL:', value);
      }
    }
    onRemove();
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      {/* Current Image Preview */}
      {value && (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Menu item"
            className="w-32 h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
          />
          <Button
            type="button"
            onClick={handleRemove}
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
            disabled={disabled || uploading}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Upload Area */}
      {!value && (
        <div
          onClick={triggerFileSelect}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {uploading ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                <ImageIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {placeholder}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Drag & drop or click to select
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Max {maxSize}MB • JPEG, PNG, WebP
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Replace Button for existing image */}
      {value && !uploading && (
        <Button
          type="button"
          onClick={triggerFileSelect}
          variant="outline"
          size="sm"
          disabled={disabled}
          className="w-full"
        >
          <Upload className="mr-2 h-4 w-4" />
          Replace Image
        </Button>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />
    </div>
  );
};