'use client'

import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  FileText, 
  Image, 
  File,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

interface DocumentUploaderProps {
  onDrop: (files: File[]) => void
  isUploading?: boolean
  uploadProgress?: number
  maxFiles?: number
  maxSize?: number
  acceptedTypes?: string[]
}

export default function DocumentUploader({
  onDrop,
  isUploading = false,
  uploadProgress = 0,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
}: DocumentUploaderProps) {
  
  const onDropAccepted = useCallback((acceptedFiles: File[]) => {
    onDrop(acceptedFiles)
  }, [onDrop])

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    acceptedFiles,
    rejectedFiles
  } = useDropzone({
    onDrop: onDropAccepted,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles,
    maxSize,
    disabled: isUploading
  })

  const getFileIcon = (file: File) => {
    if (file.type.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />
    if (file.type.includes('image')) return <Image className="h-8 w-8 text-blue-500" />
    if (file.type.includes('excel') || file.type.includes('spreadsheet')) return <File className="h-8 w-8 text-green-500" />
    return <File className="h-8 w-8 text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getDragStyle = () => {
    if (isDragReject) return 'border-red-300 bg-red-50'
    if (isDragAccept) return 'border-green-300 bg-green-50'
    if (isDragActive) return 'border-blue-300 bg-blue-50'
    return 'border-gray-300 bg-gray-50'
  }

  return (
    <div className="space-y-4">
      {/* Main Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${getDragStyle()}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400 hover:bg-blue-50'}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-blue-100 rounded-full">
              <Upload className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isDragActive ? 'Drop files here' : 'Upload Documents'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {isDragActive 
                ? 'Release to upload your files'
                : 'Drag and drop files here, or click to select files'
              }
            </p>
          </div>
          
          <div className="text-xs text-gray-500">
            <p>Supports: PDF, JPG, PNG, Excel files</p>
            <p>Max file size: {formatFileSize(maxSize)} • Max files: {maxFiles}</p>
          </div>
          
          {!isDragActive && (
            <Button variant="outline" disabled={isUploading}>
              <Upload className="h-4 w-4 mr-2" />
              Choose Files
            </Button>
          )}
        </div>
        
        {/* Upload Progress */}
        {isUploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-gray-900">Uploading files...</p>
              {uploadProgress > 0 && (
                <div className="w-48 mx-auto">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-gray-600 mt-1">{uploadProgress}% complete</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* File Preview */}
      {acceptedFiles && acceptedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Ready to Upload ({acceptedFiles.length} files)
          </h4>
          <div className="space-y-2">
            {acceptedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                {getFileIcon(file)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-600">{formatFileSize(file.size)}</p>
                </div>
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejected Files */}
      {rejectedFiles && rejectedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            Rejected Files ({rejectedFiles.length})
          </h4>
          <div className="space-y-2">
            {rejectedFiles.map((fileRejection, index) => (
              <div key={index} className="flex items-center gap-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                {getFileIcon(fileRejection.file)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{fileRejection.file.name}</p>
                  <p className="text-xs text-gray-600">{formatFileSize(fileRejection.file.size)}</p>
                  <div className="text-xs text-red-600 mt-1">
                    {fileRejection.errors.map(error => (
                      <div key={error.code}>{error.message}</div>
                    ))}
                  </div>
                </div>
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Processing Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <Upload className="h-4 w-4" />
          AI Processing Pipeline
        </h4>
        <div className="text-xs text-blue-800 space-y-1">
          <p>• Document classification and type detection</p>
          <p>• Intelligent text extraction and data recognition</p>
          <p>• Vendor and amount identification</p>
          <p>• Automatic relationship detection with existing transactions</p>
          <p>• Confidence scoring and quality assessment</p>
        </div>
      </div>
    </div>
  )
}