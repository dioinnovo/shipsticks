'use client'

import React, { useState, useRef } from 'react'
import { Camera, Upload, X, Check, Brain, Package, Sparkles, TrendingUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { EQUIPMENT_PHOTO_CATEGORIES } from '@/lib/constants/shipment-categories'
import { MockEquipmentVisionService, EquipmentAnalysisResult } from '@/lib/ai/mock-equipment-vision'
import { InsuranceCalculator, InsuranceRecommendation } from '@/lib/shipment/insurance-calculator'

export interface EquipmentPhoto {
  id: string
  file: File
  url: string
  category: string
  timestamp: Date
  analysis?: EquipmentAnalysisResult
}

export interface EquipmentData {
  photos: EquipmentPhoto[]
  aiAnalysis: EquipmentAnalysisResult | null
  insuranceRecommendation: InsuranceRecommendation | null
}

interface EquipmentStepProps {
  data: EquipmentData
  onChange: (data: EquipmentData) => void
  onComplete: () => void
}

export function EquipmentStep({ data, onChange, onComplete }: EquipmentStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedCategory, setSelectedCategory] = useState(EQUIPMENT_PHOTO_CATEGORIES[0])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [expandedPhotoId, setExpandedPhotoId] = useState<string | null>(null)

  const handleFileUpload = async (files: FileList) => {
    const newPhotos: EquipmentPhoto[] = []

    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        const photo: EquipmentPhoto = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          file,
          url: URL.createObjectURL(file),
          category: selectedCategory,
          timestamp: new Date()
        }
        newPhotos.push(photo)
      }
    }

    if (newPhotos.length > 0) {
      const updatedPhotos = [...data.photos, ...newPhotos]
      onChange({ ...data, photos: updatedPhotos })
    }
  }

  const analyzeEquipment = async (photo: EquipmentPhoto, allPhotos: EquipmentPhoto[]) => {
    setIsAnalyzing(true)

    try {
      // Use mock computer vision service - pass number of photos for smarter detection
      const analysis = await MockEquipmentVisionService.analyzeEquipment(
        photo.file,
        photo.category,
        allPhotos.length
      )

      // Update photo with analysis
      const updatedPhotos = allPhotos.map(p =>
        p.id === photo.id ? { ...p, analysis } : p
      )

      // Calculate insurance recommendation
      const insurance = InsuranceCalculator.calculateInsurance(analysis)

      onChange({
        ...data,
        photos: updatedPhotos,
        aiAnalysis: analysis,
        insuranceRecommendation: insurance
      })
    } catch (error) {
      console.error('Error analyzing equipment:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleAnalyze = () => {
    if (data.photos.length > 0) {
      // Analyze the most recent photo
      const latestPhoto = data.photos[data.photos.length - 1]
      analyzeEquipment(latestPhoto, data.photos)
    }
  }

  const removePhoto = (photoId: string) => {
    const updatedPhotos = data.photos.filter(p => p.id !== photoId)
    onChange({ ...data, photos: updatedPhotos })

    // If we removed the analyzed photo, clear analysis
    if (data.photos.find(p => p.id === photoId)?.analysis) {
      onChange({
        ...data,
        photos: updatedPhotos,
        aiAnalysis: null,
        insuranceRecommendation: null
      })
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    handleFileUpload(files)
  }

  const hasMinimumPhotos = data.photos.length >= 1
  const hasAnalysis = data.aiAnalysis !== null

  return (
    <div className="space-y-6">
      {/* Photo Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Camera className="text-green-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Equipment Photos</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Upload photos of your golf equipment</p>
            </div>
          </div>

          {/* Category Selector */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-arthur-blue/30"
          >
            {EQUIPMENT_PHOTO_CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-arthur-blue transition-colors cursor-pointer bg-gray-50 dark:bg-gray-800/50"
        >
          <Camera className="mx-auto mb-3 text-gray-400" size={48} />
          <p className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">
            Upload {selectedCategory} Photos
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Drag and drop photos here or click to browse
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            JPG, PNG up to 10MB each • Multiple photos recommended
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          className="hidden"
        />

        {/* Photo Grid */}
        {data.photos.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              Uploaded Photos ({data.photos.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <div
                    className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-arthur-blue transition-colors"
                    onClick={() => setExpandedPhotoId(photo.id)}
                  >
                    <img
                      src={photo.url}
                      alt={photo.category}
                      className="w-full h-full object-cover"
                    />
                    {photo.analysis && (
                      <div className="absolute top-2 right-2 p-1 bg-green-500 rounded-full">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removePhoto(photo.id)
                    }}
                    className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                  <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 text-center truncate">
                    {photo.category}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analyze Button */}
        {data.photos.length > 0 && !hasAnalysis && !isAnalyzing && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleAnalyze}
            className="mt-6 w-full py-4 px-6 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700 transition-all flex items-center justify-center gap-3 shadow-lg"
          >
            <Brain size={24} />
            <span>Analyze Equipment with AI</span>
            <Sparkles size={20} />
          </motion.button>
        )}
      </motion.div>

      {/* AI Analysis Overlay */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl p-6 text-white"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg animate-pulse">
                <Brain className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">AI Vision Analyzing Equipment...</h3>
                <p className="text-sm text-white/90">
                  Identifying club types, brands, and estimating values
                </p>
              </div>
              <Sparkles className="w-6 h-6 animate-spin" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Analysis Results */}
      {hasAnalysis && data.aiAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">AI Equipment Analysis</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Analysis completed in {data.aiAnalysis.processingTime}ms • {data.aiAnalysis.confidence}% confidence
              </p>
            </div>
          </div>

          {/* Equipment Detected */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Package size={18} className="text-blue-600" />
              Detected Equipment ({data.aiAnalysis.equipmentDetected.length} items)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {data.aiAnalysis.equipmentDetected.slice(0, 6).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                  <span className="font-medium">{item.type}</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    ${item.estimatedValue.min}-${item.estimatedValue.max}
                  </span>
                </div>
              ))}
            </div>
            {data.aiAnalysis.equipmentDetected.length > 6 && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                +{data.aiAnalysis.equipmentDetected.length - 6} more items
              </p>
            )}
          </div>

          {/* Total Value */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Equipment Value</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  ${data.aiAnalysis.totalValue.estimated.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Range: ${data.aiAnalysis.totalValue.min.toLocaleString()} - ${data.aiAnalysis.totalValue.max.toLocaleString()}
                </div>
              </div>
              {data.aiAnalysis.brandIdentified && (
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Primary Brand</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {data.aiAnalysis.brandIdentified}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {data.aiAnalysis.brandTier} tier
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Insurance Recommendation */}
      {data.insuranceRecommendation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border border-green-200 dark:border-green-800 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Insurance Recommendation</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Based on your equipment value</p>
            </div>
          </div>

          {/* Recommended Tier */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-2 border-green-500 mb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-semibold rounded">
                    RECOMMENDED
                  </span>
                  <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
                    {data.insuranceRecommendation.recommendedTier.name}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {data.insuranceRecommendation.recommendedTier.description}
                </p>
                <div className="space-y-1">
                  {data.insuranceRecommendation.recommendedTier.features.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <Check size={14} className="text-green-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">Coverage</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  ${data.insuranceRecommendation.recommendedTier.coverage.toLocaleString()}
                </div>
                <div className="text-lg font-semibold text-green-600 mt-1">
                  ${data.insuranceRecommendation.recommendedTier.cost}
                </div>
              </div>
            </div>
          </div>

          {/* Risk Analysis */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Risk Analysis:</strong> {data.insuranceRecommendation.riskAnalysis}
            </p>
          </div>
        </motion.div>
      )}

      {/* Continue Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={onComplete}
        disabled={!hasMinimumPhotos}
        className={`w-full py-4 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
          hasMinimumPhotos
            ? 'bg-arthur-blue text-white hover:bg-arthur-blue-dark cursor-pointer shadow-lg'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        {hasMinimumPhotos ? (
          <>
            <Check size={20} />
            <span>Continue to Special Instructions</span>
          </>
        ) : (
          <span>Upload at least 1 photo to continue</span>
        )}
      </motion.button>
    </div>
  )
}
