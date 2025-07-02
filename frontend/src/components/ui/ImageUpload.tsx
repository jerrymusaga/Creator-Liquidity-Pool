// components/ui/ImageUpload.tsx
'use client'
import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, X, Image as ImageIcon, Loader2, 
  Check, AlertCircle, Eye, RotateCcw 
} from 'lucide-react'
import { Button } from './Button'
import { uploadImageToIPFS, IPFSUploadResult } from '@/lib/ipfs'
import { isValidImageFile, formatFileSize, PINATA_CONFIG } from '@/config/pinata'
import toast from 'react-hot-toast'

interface ImageUploadProps {
  onImageUploaded?: (result: IPFSUploadResult) => void
  onImageRemoved?: () => void
  defaultImage?: string
  className?: string
  maxWidth?: number
  maxHeight?: number
  required?: boolean
  disabled?: boolean
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUploaded,
  onImageRemoved,
  defaultImage,
  className = '',
  maxWidth = 400,
  maxHeight = 400,
  required = false,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>(defaultImage || '')
  const [uploadedResult, setUploadedResult] = useState<IPFSUploadResult | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string>('')
  const [isDragOver, setIsDragOver] = useState(false)

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    setError('')
    
    // Validate file
    if (!isValidImageFile(file)) {
      const errorMsg = `Invalid file. Must be ${PINATA_CONFIG.allowedImageTypes.join(', ')} and under ${formatFileSize(PINATA_CONFIG.maxFileSize)}`
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    setSelectedFile(file)
    
    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    
    // Auto-upload if desired
    handleUpload(file)
  }, [])

  // Handle file upload to IPFS
  const handleUpload = async (file: File) => {
    if (!file || isUploading || disabled) return

    setIsUploading(true)
    setUploadProgress(0)
    setError('')

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const result = await uploadImageToIPFS(file)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      setUploadedResult(result)
      onImageUploaded?.(result)
      
      toast.success('Image uploaded to IPFS successfully!', {
        duration: 3000,
        icon: '📸',
      })
    } catch (error: any) {
      console.error('Upload failed:', error)
      setError(error.message)
      toast.error(`Upload failed: ${error.message}`)
      
      // Reset preview on error
      setPreviewUrl(defaultImage || '')
      setSelectedFile(null)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  // Handle file input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    
    if (imageFile) {
      handleFileSelect(imageFile)
    } else {
      toast.error('Please drop an image file')
    }
  }, [handleFileSelect])

  // Remove image
  const handleRemove = () => {
    setSelectedFile(null)
    setPreviewUrl(defaultImage || '')
    setUploadedResult(null)
    setError('')
    onImageRemoved?.()
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    
    toast.success('Image removed')
  }

  // Retry upload
  const handleRetry = () => {
    if (selectedFile) {
      handleUpload(selectedFile)
    }
  }

  // Open file dialog
  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        onClick={openFileDialog}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl transition-all cursor-pointer
          ${isDragOver ? 'border-vibe-purple bg-vibe-purple/10' : 'border-gray-600 hover:border-gray-500'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${error ? 'border-red-500' : ''}
          ${previewUrl ? 'border-solid border-gray-600' : ''}
        `}
        style={{ maxWidth, minHeight: previewUrl ? 'auto' : '200px' }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={PINATA_CONFIG.allowedImageTypes.join(',')}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        {/* Preview or Upload Prompt */}
        <AnimatePresence mode="wait">
          {previewUrl ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative group"
            >
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-auto rounded-xl max-h-96 object-contain"
                style={{ maxHeight }}
              />
              
              {/* Overlay Controls */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center space-x-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove()
                  }}
                  size="sm"
                  variant="outline"
                  className="bg-black/70 border-white/20"
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove
                </Button>
                
                {uploadedResult && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(uploadedResult.url, '_blank')
                    }}
                    size="sm"
                    variant="outline"
                    className="bg-black/70 border-white/20"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View on IPFS
                  </Button>
                )}
              </div>

              {/* Upload Status Badge */}
              <div className="absolute top-2 right-2">
                {isUploading ? (
                  <div className="bg-black/70 rounded-full px-3 py-1 flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-vibe-purple" />
                    <span className="text-sm text-white">{uploadProgress}%</span>
                  </div>
                ) : uploadedResult ? (
                  <div className="bg-green-500/80 rounded-full p-2">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                ) : error ? (
                  <div className="bg-red-500/80 rounded-full p-2">
                    <AlertCircle className="w-4 h-4 text-white" />
                  </div>
                ) : null}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 px-6 text-center"
            >
              <div className="mb-4">
                {isUploading ? (
                  <Loader2 className="w-12 h-12 text-vibe-purple animate-spin" />
                ) : (
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                )}
              </div>
              
              <h3 className="text-lg font-medium text-white mb-2">
                {isUploading ? 'Uploading to IPFS...' : 'Upload Creator Coin Image'}
              </h3>
              
              <p className="text-gray-400 text-sm mb-4">
                {isUploading 
                  ? `Progress: ${uploadProgress}%` 
                  : `Drag and drop an image or click to browse`
                }
              </p>
              
              <div className="text-xs text-gray-500">
                <p>Supported: {PINATA_CONFIG.allowedImageTypes.join(', ')}</p>
                <p>Max size: {formatFileSize(PINATA_CONFIG.maxFileSize)}</p>
              </div>
              
              {!isUploading && (
                <Button size="sm" className="mt-4" disabled={disabled}>
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Image
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
          
          {selectedFile && (
            <Button
              onClick={handleRetry}
              size="sm"
              variant="outline"
              className="border-red-500/20 text-red-400 hover:bg-red-500/10"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          )}
        </motion.div>
      )}

      {/* Success Message with IPFS Info */}
      {uploadedResult && !error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/20 rounded-lg p-3"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Check className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">Successfully uploaded to IPFS!</span>
          </div>
          
          <div className="text-xs text-gray-400 space-y-1">
            <p><strong>IPFS Hash:</strong> {uploadedResult.hash}</p>
            <p><strong>Size:</strong> {formatFileSize(uploadedResult.size)}</p>
            <p><strong>URI:</strong> {uploadedResult.uri}</p>
          </div>
        </motion.div>
      )}

      {/* File Info */}
      {selectedFile && (
        <div className="text-xs text-gray-400 bg-gray-800 rounded-lg p-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-medium">Name:</span> {selectedFile.name}
            </div>
            <div>
              <span className="font-medium">Size:</span> {formatFileSize(selectedFile.size)}
            </div>
            <div>
              <span className="font-medium">Type:</span> {selectedFile.type}
            </div>
            <div>
              <span className="font-medium">Status:</span> 
              <span className={`ml-1 ${
                uploadedResult ? 'text-green-400' : 
                isUploading ? 'text-vibe-purple' : 
                error ? 'text-red-400' : 'text-gray-400'
              }`}>
                {uploadedResult ? 'Uploaded' : 
                 isUploading ? 'Uploading...' : 
                 error ? 'Failed' : 'Ready'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}