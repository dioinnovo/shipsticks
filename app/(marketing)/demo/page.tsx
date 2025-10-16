'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, TrendingUp, Download, CheckCircle, Camera, DollarSign, Clock, ArrowRight, Brain, Zap, Shield, Eye, FileCheck, AlertCircle, Users, Home, Building2, FileImage, X, AlertTriangle, Banknote, UserCheck, Heart, Plane, PackageCheck } from 'lucide-react'
import { SHIPMENT_CASES, SHIPSTICKS_STATISTICS, formatCurrency } from '@/lib/data/shipment-cases'
import Link from 'next/link'
import Image from 'next/image'

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState('shipment-intelligence')
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [confidenceScore, setConfidenceScore] = useState<number>(0)
  const [uploadedFiles, setUploadedFiles] = useState<Array<{id: number, name: string, type: string, status: string}>>([])
  const [selectedClaim, setSelectedClaim] = useState<string>('masters-tournament')
  const [analysisPhase, setAnalysisPhase] = useState<number>(0) // 0: none, 1: classification, 2: damage assessment, 3: settlement
  const [showClaimForm, setShowClaimForm] = useState(false)
  const [submittedClaim, setSubmittedClaim] = useState<any>(null)
  const [formData, setFormData] = useState({
    golferName: '',
    golferEmail: '',
    golferPhone: '',
    originAddress: '',
    destinationCourse: '',
    equipmentDescription: ''
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get real Ship Sticks shipment cases for demo
  const mastersTournament = SHIPMENT_CASES.find(c => c.id === 'masters-tournament')!
  const pebbleBeachVacation = SHIPMENT_CASES.find(c => c.id === 'pebble-beach-vacation')!

  const shipmentTypes = {
    'masters-tournament': {
      icon: PackageCheck,
      title: `${mastersTournament.golferProfile} - ${mastersTournament.shipmentType}`,
      trackingNumber: 'SS-2024-M001',
      date: new Date(mastersTournament.equipment.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      deliveryFeatures: [
        { type: `White-Glove Tournament Service`, priority: 'Premium', confidence: 99 },
        { type: 'Climate-Controlled Transport', priority: 'Critical', confidence: 98 },
        { type: 'GPS Real-Time Tracking', priority: 'High', confidence: 97 },
        { type: 'Tournament Official Coordination', priority: 'High', confidence: 96 },
        { type: 'Signature Delivery Required', priority: 'Critical', confidence: 99 },
      ],
      estimate: formatCurrency(mastersTournament.outcomes.standardCost),
      finalCost: formatCurrency(mastersTournament.outcomes.optimizedCost),
      aiResult: `${mastersTournament.outcomes.savingsPercentage}% cost savings + early delivery`,
      route: `${mastersTournament.location.origin} → ${mastersTournament.location.destination}`,
      images: [
        { id: 1, name: 'tour_bag_photo_01.jpg', status: 'pending' },
        { id: 2, name: 'equipment_closeup_02.jpg', status: 'pending' },
        { id: 3, name: 'travel_case_03.jpg', status: 'pending' },
        { id: 4, name: 'club_inventory_04.jpg', status: 'pending' },
      ]
    },
    'pebble-beach-vacation': {
      icon: Plane,
      title: `${pebbleBeachVacation.golferProfile} - ${pebbleBeachVacation.shipmentType}`,
      trackingNumber: 'SS-2024-PB001',
      date: new Date(pebbleBeachVacation.equipment.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      deliveryFeatures: [
        { type: `Same-Day Express Delivery`, priority: 'Express', confidence: 97 },
        { type: 'Multi-Package Coordination', priority: 'High', confidence: 95 },
        { type: 'Pro Shop Direct Delivery`, priority: 'Standard', confidence: 98 },
        { type: 'Complimentary Club Cleaning', priority: 'Premium', confidence: 96 },
        { type: 'Resort Concierge Service`, priority: 'High', confidence: 94 },
      ],
      estimate: formatCurrency(pebbleBeachVacation.outcomes.standardCost),
      finalCost: formatCurrency(pebbleBeachVacation.outcomes.optimizedCost),
      aiResult: `${pebbleBeachVacation.outcomes.savingsPercentage}% cost savings + same-day`,
      route: `${pebbleBeachVacation.location.origin} → ${pebbleBeachVacation.location.destination}`,
      images: [
        { id: 1, name: 'golf_bag_inspection_01.jpg', status: 'pending' },
        { id: 2, name: 'push_cart_photo_02.jpg', status: 'pending' },
        { id: 3, name: 'shoes_accessories_03.jpg', status: 'pending' },
        { id: 4, name: 'packing_verification_04.jpg', status: 'pending' },
      ]
    }
  }

  const currentClaim = shipmentTypes[selectedClaim as keyof typeof shipmentTypes] || shipmentTypes['masters-tournament']

  const processImages = async () => {
    setIsProcessing(true)
    setAnalysisPhase(0)
    
    // If we have form data, submit to API
    if (showClaimForm && formData.insuredName) {
      try {
        const response = await fetch('/api/claims/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: selectedClaim,
            propertyAddress: formData.propertyAddress,
            propertyType: selectedClaim === 'commercial' ? 'Commercial Building' : 'Commercial Property',
            policyNumber: formData.policyNumber,
            damageType: currentClaim.damages[0]?.type || 'Wind Damage',
            damageDescription: formData.damageDescription,
            severity: currentClaim.damages[0]?.severity || 'Moderate',
            insuredName: formData.insuredName,
            insuredEmail: formData.insuredEmail,
            insuredPhone: formData.insuredPhone,
            images: uploadedFiles.map(f => ({
              url: `/uploads/${f.name}`,
              filename: f.name
            }))
          })
        })
        
        const result = await response.json()
        if (result.success) {
          setSubmittedClaim(result.data)
          console.log('Claim submitted:', result.data)
        }
      } catch (error) {
        console.error('Error submitting claim:', error)
      }
    }
    
    const imagesToProcess = uploadedFiles.length > 0 ? uploadedFiles : currentClaim.images
    
    // Simulate image processing
    for (let i = 0; i < imagesToProcess.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300))
      setSelectedImage(i + 1)
      setConfidenceScore(85 + Math.random() * 10)
    }
    
    // Progressive disclosure of results
    setTimeout(() => setAnalysisPhase(1), 1000) // Classification
    setTimeout(() => setAnalysisPhase(2), 2500) // Damage Assessment
    setTimeout(() => setAnalysisPhase(3), 4000) // Settlement Options
    
    setIsProcessing(false)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newFiles = Array.from(files).map((file, index) => ({
        id: uploadedFiles.length + index + 1,
        name: file.name,
        type: file.type,
        status: 'pending'
      }))
      setUploadedFiles([...uploadedFiles, ...newFiles])
    }
  }

  const removeFile = (id: number) => {
    setUploadedFiles(uploadedFiles.filter(file => file.id !== id))
  }

  const tabs = [
    { id: 'claims-intelligence', label: 'Claims Intelligence', icon: Brain },
    { id: 'estimation', label: 'AI Estimates', icon: DollarSign },
    { id: 'coverage-analysis', label: 'Coverage Analysis', icon: Shield },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white dark:bg-gray-900/80 backdrop-blur-md z-50 border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/arthur-logo-blue.png"
                alt="Arthur Health"
                width={150}
                height={40}
                className="w-auto object-contain"
              />
              <span className="text-xl font-bold text-arthur-gray-dark">Your AI Care Coordination Assistant</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="text-gray-700 dark:text-gray-300 hover:text-arthur-blue transition"
              >
                Back to Overview
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-20 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-arthur-gray-dark mb-4">
              Arthur AI Care Coordination in Action
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Experience how Arthur AI enhances care coordination with intelligent patient assessment,
              cost optimization, and care pathway recommendations
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-arthur-blue text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Claims Intelligence Tab - Initial Assessment & Triage */}
              {activeTab === 'claims-intelligence' && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
                  <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl font-bold text-arthur-gray-dark mb-4">
                      Comprehensive Claims Intelligence
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                      Upload photos for instant AI-powered classification, detailed damage assessment, 
                      and settlement recommendations - all in one seamless workflow.
                    </p>

                    {/* Property Type Selector - At the top for better workflow */}
                    <div className="mb-6 flex gap-4">
                      <button
                        onClick={() => setSelectedClaim('complex-diabetes')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
                          selectedClaim === 'complex-diabetes'
                            ? 'bg-arthur-blue text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Users size={20} />
                        Diabetes Management
                      </button>
                      <button
                        onClick={() => setSelectedClaim('chf-management')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
                          selectedClaim === 'chf-management'
                            ? 'bg-arthur-blue text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Heart size={20} />
                        CHF Care Coordination
                      </button>
                    </div>

                    {/* Claim Info Banner */}
                    {selectedClaim && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <currentClaim.icon className="text-blue-600" size={24} />
                            <div>
                              <p className="font-semibold text-blue-900">{currentClaim.title}</p>
                              <p className="text-sm text-blue-700">Claim #{currentClaim.claimNumber} • {currentClaim.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Preliminary Estimate</p>
                            <p className="text-xl font-bold text-arthur-blue">{currentClaim.estimate}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left: Upload Section */}
                      <div>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
                          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Upload Claim Photos</h3>
                          
                          {/* Upload Section */}
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 hover:border-arthur-blue transition flex flex-col items-center gap-3"
                          >
                            <Camera className="text-gray-400" size={48} />
                            <div className="text-center">
                              <p className="text-gray-700 dark:text-gray-300 font-medium">Upload Claim Photos</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Drag and drop or click to browse</p>
                            </div>
                          </button>
                        </div>

                        {/* Uploaded Files Display */}
                        {uploadedFiles.length > 0 && (
                          <div className="mb-6">
                            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Uploaded Files</h4>
                            <div className="space-y-2">
                              {uploadedFiles.map((file) => (
                                <div key={file.id} className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 rounded-lg p-3">
                                  <div className="flex items-center gap-2">
                                    <FileImage className="text-gray-500 dark:text-gray-400" size={20} />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                                  </div>
                                  <button
                                    onClick={() => removeFile(file.id)}
                                    className="text-gray-400 hover:text-red-500 transition"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Use Sample Images Option */}
                        {uploadedFiles.length === 0 && (
                          <div className="text-center mb-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Or use sample {selectedClaim} property images</p>
                          </div>
                        )}

                        <button
                          onClick={processImages}
                          disabled={isProcessing}
                          className="w-full mt-6 bg-arthur-blue text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                              Classifying Claim...
                            </>
                          ) : (
                            <>
                              <Brain size={20} />
                              Analyze Claim
                            </>
                          )}
                        </button>
                      </div>

                      {/* Right: Progressive AI Analysis Results */}
                      <div>
                        <h3 className="text-xl font-bold text-arthur-gray-dark mb-4">
                          AI Analysis Results
                        </h3>

                        {selectedImage && analysisPhase > 0 ? (
                          <div className="space-y-4">
                            {/* Phase 1: Quick Classification */}
                            {analysisPhase >= 1 && (
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-green-50 border border-green-200 rounded-lg p-6"
                              >
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="font-semibold text-green-900">Instant Classification</h4>
                                  <CheckCircle className="text-green-500" size={24} />
                                </div>
                                
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-700 dark:text-gray-300">Classification:</span>
                                    <span className="font-bold text-green-700">REPAIRABLE</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-700 dark:text-gray-300">Settlement Type:</span>
                                    <span className="font-bold text-blue-700">CASH ELIGIBLE</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-700 dark:text-gray-300">Severity:</span>
                                    <span className="font-bold text-arthur-blue-dark">MODERATE</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-700 dark:text-gray-300">Confidence:</span>
                                    <span className="font-bold text-green-700">{confidenceScore.toFixed(1)}%</span>
                                  </div>
                                </div>
                              </motion.div>
                            )}

                            {/* Phase 2: Detailed Damage Assessment */}
                            {analysisPhase >= 2 && (
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-gray-900 border border-gray-200 rounded-lg p-6"
                              >
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Detected Damages</h4>
                                <div className="space-y-2">
                                  {currentClaim.damages.map((damage, index) => (
                                    <motion.div
                                      key={index}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.1 }}
                                      className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                                    >
                                      <div>
                                        <p className="font-medium text-gray-800 dark:text-gray-200">{damage.type}</p>
                                        <p className={`text-sm ${
                                          damage.severity === 'Major' ? 'text-red-600' :
                                          damage.severity === 'Moderate' ? 'text-arthur-blue' :
                                          damage.severity === 'Minor' ? 'text-yellow-600' :
                                          damage.severity === 'Replace' ? 'text-purple-600' :
                                          'text-blue-600'
                                        }`}>
                                          {damage.severity}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{damage.confidence}%</span>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">confidence</p>
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              </motion.div>
                            )}

                            {/* Phase 3: Settlement & Actions */}
                            {analysisPhase >= 3 && (
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                              >
                                {/* Cash Settlement Offer */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                  <Banknote className="text-blue-600 mb-3" size={32} />
                                  <h4 className="font-semibold text-blue-900 mb-2">
                                    Instant Cash Settlement Available
                                  </h4>
                                  <p className="text-2xl font-bold text-blue-700 mb-3">
                                    {currentClaim.estimate}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Customer can accept immediate payment or proceed with detailed estimate
                                  </p>
                                  <div className="grid grid-cols-2 gap-3">
                                    <button className="bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                                      Offer Settlement
                                    </button>
                                    <button 
                                      onClick={() => setActiveTab('estimation')}
                                      className="bg-white dark:bg-gray-900 text-blue-600 py-2 rounded-lg text-sm font-medium border border-blue-300 hover:bg-blue-50 transition"
                                    >
                                      Detailed Estimate
                                    </button>
                                  </div>
                                </div>

                                {/* Personalized Next Steps */}
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                                  <UserCheck className="text-purple-600 mb-3" size={32} />
                                  <h4 className="font-semibold text-purple-900 mb-3">
                                    Recommended Actions
                                  </h4>
                                  <div className="space-y-2">
                                    {[
                                      'Send SMS with settlement offer',
                                      'Schedule professional inspection',
                                      'Assign to specialized adjuster',
                                      'Initiate temporary housing if needed'
                                    ].map((step, index) => (
                                      <div key={index} className="flex items-center gap-2">
                                        <CheckCircle className="text-purple-500" size={16} />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{step}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 text-center">
                            <Brain className="mx-auto mb-4 text-gray-400" size={48} />
                            <p className="text-gray-600 dark:text-gray-400">
                              Upload photos or use sample images to see comprehensive AI analysis
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Panel - Navigate to other tabs */}
                    {selectedImage && analysisPhase >= 3 && (
                      <div className="mt-8 bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Additional Analysis Options</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <button
                            onClick={() => setActiveTab('estimation')}
                            className="flex items-center justify-center gap-3 p-4 bg-white dark:bg-gray-900 border-2 border-gray-200 rounded-lg hover:border-arthur-blue transition"
                          >
                            <DollarSign className="text-arthur-blue" size={24} />
                            <div className="text-left">
                              <p className="font-medium text-gray-900 dark:text-gray-100">Generate Detailed Estimate</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Create line-item breakdown</p>
                            </div>
                          </button>
                          <button
                            onClick={() => setActiveTab('coverage-analysis')}
                            className="flex items-center justify-center gap-3 p-4 bg-white dark:bg-gray-900 border-2 border-gray-200 rounded-lg hover:border-arthur-blue transition"
                          >
                            <Shield className="text-green-600" size={24} />
                            <div className="text-left">
                              <p className="font-medium text-gray-900 dark:text-gray-100">Maximize Coverage</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Find overlooked benefits</p>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Old AI Assessment Tab - Now consolidated into Claims Intelligence */}
              {false && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
                  {/* Patient Case Selector */}
                  <div className="mb-6 flex gap-4">
                    <button
                      onClick={() => setSelectedClaim('complex-diabetes')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                        selectedClaim === 'complex-diabetes'
                          ? 'bg-arthur-blue text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Users size={20} />
                      Diabetes Management
                    </button>
                    <button
                      onClick={() => setSelectedClaim('chf-management')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                        selectedClaim === 'chf-management'
                          ? 'bg-arthur-blue text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Heart size={20} />
                      CHF Care Coordination
                    </button>
                  </div>

                  {/* Claim Info Banner */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <currentClaim.icon className="text-blue-600" size={24} />
                        <div>
                          <p className="font-semibold text-blue-900">{currentClaim.title}</p>
                          <p className="text-sm text-blue-700">Claim #{currentClaim.claimNumber} • {currentClaim.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Preliminary Estimate</p>
                        <p className="text-xl font-bold text-arthur-blue">{currentClaim.estimate}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Image Upload and Processing */}
                    <div>
                      <h2 className="text-2xl font-bold text-arthur-gray-dark mb-4">
                        Visual Damage Detection
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Upload claim photos or use sample images to see AI-powered damage analysis in action.
                      </p>

                      {/* Upload Section */}
                      <div className="mb-6">
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-arthur-blue transition flex flex-col items-center gap-2"
                        >
                          <Upload className="text-gray-400" size={32} />
                          <span className="text-gray-600 dark:text-gray-400 font-medium">Upload Claim Photos</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">or drag and drop</span>
                        </button>
                      </div>

                      {/* Uploaded Files */}
                      {uploadedFiles.length > 0 && (
                        <div className="mb-6">
                          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Uploaded Files</h3>
                          <div className="space-y-2">
                            {uploadedFiles.map((file) => (
                              <div key={file.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                  <FileImage className="text-gray-500 dark:text-gray-400" size={20} />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                                </div>
                                <button
                                  onClick={() => removeFile(file.id)}
                                  className="text-gray-400 hover:text-red-500 transition"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Sample Images Grid */}
                      <div className="mb-6">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                          {uploadedFiles.length === 0 ? 'Sample Claim Images' : 'Or Use Sample Images'}
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          {currentClaim.images.map((image) => (
                            <div
                              key={image.id}
                              className={`relative bg-gray-100 rounded-lg p-4 border-2 transition ${
                                selectedImage === image.id ? 'border-arthur-blue' : 'border-gray-200'
                              }`}
                            >
                              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded mb-2 flex items-center justify-center">
                                <Camera className="text-gray-400" size={32} />
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300">{image.name}</p>
                              {selectedImage !== null && selectedImage >= image.id && (
                                <div className="absolute top-2 right-2">
                                  <CheckCircle className="text-green-500" size={24} />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={processImages}
                        disabled={isProcessing}
                        className="w-full bg-arthur-blue text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                            Processing Images...
                          </>
                        ) : (
                          <>
                            <Brain size={20} />
                            Analyze with AI
                          </>
                        )}
                      </button>
                    </div>

                    {/* Right: Results */}
                    <div>
                      <h3 className="text-xl font-bold text-arthur-gray-dark mb-4">
                        AI Analysis Results
                      </h3>

                      {selectedImage ? (
                        <div className="space-y-4">
                          {/* Confidence Score */}
                          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-700 dark:text-gray-300">Confidence Score</span>
                              <span className="text-2xl font-bold text-green-600">
                                {confidenceScore.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${confidenceScore}%` }}
                                className="bg-green-500 h-2 rounded-full"
                              />
                            </div>
                          </div>

                          {/* Detected Damages */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-700 dark:text-gray-300">Detected Damages:</h4>
                            {currentClaim.damages.map((damage, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white dark:bg-gray-900 border border-gray-200 rounded-lg p-3"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium text-gray-800 dark:text-gray-200">{damage.type}</p>
                                    <p className={`text-sm ${
                                      damage.severity === 'Major' ? 'text-red-600' :
                                      damage.severity === 'Moderate' ? 'text-arthur-blue' :
                                      damage.severity === 'Minor' ? 'text-yellow-600' :
                                      damage.severity === 'Replace' ? 'text-purple-600' :
                                      'text-blue-600'
                                    }`}>
                                      {damage.severity}
                                    </p>
                                  </div>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {damage.confidence}% confidence
                                  </span>
                                </div>
                              </motion.div>
                            ))}
                          </div>

                          {/* Action Items */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                              <div>
                                <p className="font-semibold text-blue-900">Recommended Actions</p>
                                <ul className="text-sm text-blue-800 mt-2 space-y-1">
                                  {selectedClaim === 'auto' ? (
                                    <>
                                      <li>• Schedule vehicle inspection</li>
                                      <li>• Obtain repair shop estimates</li>
                                      <li>• Check for hidden damage</li>
                                    </>
                                  ) : (
                                    <>
                                      <li>• Schedule professional inspection</li>
                                      <li>• Document damage extent</li>
                                      <li>• Obtain contractor estimates</li>
                                    </>
                                  )}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 text-center">
                          <Brain className="mx-auto mb-4 text-gray-400" size={48} />
                          <p className="text-gray-600 dark:text-gray-400">
                            Click "Analyze with AI" to see damage detection in action
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Coverage Analysis Tab */}
              {activeTab === 'coverage-analysis' && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
                  <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-arthur-gray-dark mb-4">
                      Automated Policy Coverage Matching
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                      Our AI instantly matches detected damage with relevant policy provisions, 
                      ensuring no coverage is overlooked.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Policy Document */}
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-800 dark:text-gray-200">Policy Document</h3>
                          <FileText className="text-gray-400" size={24} />
                        </div>
                        <div className="space-y-2">
                          <div className="bg-white dark:bg-gray-900 rounded p-3 text-sm">
                            <p className="font-medium">Policy #: HO-2024-78432</p>
                            <p className="text-gray-600 dark:text-gray-400">Commercial Property Comprehensive</p>
                          </div>
                          <div className="bg-white dark:bg-gray-900 rounded p-3 text-sm">
                            <p className="font-medium">Coverage Limit: $450,000</p>
                            <p className="text-gray-600 dark:text-gray-400">Deductible: $2,500</p>
                          </div>
                        </div>
                      </div>

                      {/* Coverage Matches */}
                      <div className="bg-green-50 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-800 dark:text-gray-200">Coverage Matches</h3>
                          <CheckCircle className="text-green-500" size={24} />
                        </div>
                        <div className="space-y-2">
                          {[
                            { coverage: 'Building Protection', status: 'Covered', page: 'p.12' },
                            { coverage: 'Other Structures', status: 'Covered', page: 'p.15' },
                            { coverage: 'Extra Expense Coverage', status: 'May Apply', page: 'p.23' },
                            { coverage: 'Ordinance or Law', status: 'Available', page: 'p.31' },
                          ].map((item, index) => (
                            <div key={index} className="bg-white dark:bg-gray-900 rounded p-3 flex justify-between items-center">
                              <div>
                                <p className="font-medium text-sm">{item.coverage}</p>
                                <p className={`text-xs ${
                                  item.status === 'Covered' ? 'text-green-600' :
                                  item.status === 'May Apply' ? 'text-yellow-600' :
                                  'text-blue-600'
                                }`}>
                                  {item.status}
                                </p>
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{item.page}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Compliance Check */}
                    <div className="mt-8 bg-blue-50 rounded-lg p-6">
                      <h3 className="font-semibold text-blue-900 mb-3">Compliance & Documentation</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { label: 'State Regulations', status: 'Compliant', icon: Shield },
                          { label: 'Documentation', status: 'Complete', icon: FileCheck },
                          { label: 'Time Limits', status: 'Within Limits', icon: Clock },
                        ].map((item, index) => (
                          <div key={index} className="bg-white dark:bg-gray-900 rounded-lg p-4 flex items-center gap-3">
                            <item.icon className="text-blue-600" size={24} />
                            <div>
                              <p className="font-medium text-sm">{item.label}</p>
                              <p className="text-xs text-green-600">{item.status}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cost Estimation Tab */}
              {activeTab === 'estimation' && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold text-arthur-gray-dark mb-4">
                    Intelligent Cost Estimation
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Generate accurate repair estimates with industry-standard pricing and local market data.
                  </p>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Estimate Summary */}
                    <div className="lg:col-span-2">
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Repair Estimate Breakdown</h3>
                        <div className="space-y-3">
                          {[
                            { item: 'Roof Repair', code: 'RFG 240', quantity: '25 SQ', unit: '$285/SQ', total: '$7,125' },
                            { item: 'Gutter Replacement', code: 'GTR 110', quantity: '120 LF', unit: '$12/LF', total: '$1,440' },
                            { item: 'Interior Water Damage', code: 'WTR 320', quantity: '200 SF', unit: '$8/SF', total: '$1,600' },
                            { item: 'Painting & Finishing', code: 'PNT 450', quantity: '300 SF', unit: '$4/SF', total: '$1,200' },
                            { item: 'Debris Removal', code: 'DBR 100', quantity: '1 Load', unit: '$450', total: '$450' },
                          ].map((line, index) => (
                            <div key={index} className="bg-white dark:bg-gray-900 rounded-lg p-3">
                              <div className="grid grid-cols-5 gap-2 text-sm">
                                <div>
                                  <p className="font-medium">{line.item}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{line.code}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-gray-600 dark:text-gray-400">{line.quantity}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-gray-600 dark:text-gray-400">{line.unit}</p>
                                </div>
                                <div className="text-right col-span-2">
                                  <p className="font-semibold">{line.total}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 pt-6 border-t">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                              <span className="font-medium">$11,815</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Overhead & Profit (20%)</span>
                              <span className="font-medium">$2,363</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Tax (7%)</span>
                              <span className="font-medium">$992</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold pt-2 border-t">
                              <span>Total Estimate</span>
                              <span className="text-arthur-blue">$15,170</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Data */}
                    <div>
                      <div className="bg-blue-50 rounded-lg p-6 mb-6">
                        <h3 className="font-semibold text-blue-900 mb-3">Pricing Data Source</h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="text-green-500" size={20} />
                            <span className="text-sm">Industry Pricing</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="text-green-500" size={20} />
                            <span className="text-sm">Local Market Rates</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="text-green-500" size={20} />
                            <span className="text-sm">Updated Daily</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Export Options</h3>
                        <div className="space-y-2">
                          <button className="w-full bg-white dark:bg-gray-900 border border-gray-300 rounded-lg py-2 px-4 text-sm hover:bg-gray-50 transition flex items-center justify-center gap-2">
                            <Download size={16} />
                            Export Estimate
                          </button>
                          <button className="w-full bg-white dark:bg-gray-900 border border-gray-300 rounded-lg py-2 px-4 text-sm hover:bg-gray-50 transition flex items-center justify-center gap-2">
                            <FileText size={16} />
                            Generate PDF Report
                          </button>
                          <button className="w-full bg-white dark:bg-gray-900 border border-gray-300 rounded-lg py-2 px-4 text-sm hover:bg-gray-50 transition flex items-center justify-center gap-2">
                            <Eye size={16} />
                            Share with Adjuster
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Arthur Health Cost Savings Results */}
                  <div className="mt-8 bg-gradient-to-r from-arthur-blue to-blue-600 text-white rounded-xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <h4 className="text-lg font-semibold mb-2">Baseline Monthly Cost</h4>
                        <p className="text-3xl font-bold">{currentClaim.estimate}</p>
                        <p className="text-sm opacity-90">Before care coordination</p>
                      </div>
                      <div className="text-center border-l border-r border-white/20 md:border-l-0 md:border-r-0">
                        <h4 className="text-lg font-semibold mb-2">Optimized Cost</h4>
                        <p className="text-3xl font-bold">{currentClaim.finalSettlement}</p>
                        <p className="text-sm opacity-90">{currentClaim.location}</p>
                      </div>
                      <div className="text-center">
                        <h4 className="text-lg font-semibold mb-2">Arthur AI Result</h4>
                        <p className="text-3xl font-bold">{currentClaim.sccResult}</p>
                        <p className="text-sm opacity-90">Cost savings achieved</p>
                      </div>
                    </div>

                    <div className="mt-6 text-center">
                      <p className="text-lg font-medium">
                        Based on real Arthur Health care coordination success: <span className="font-bold">{currentClaim.title.split(' - ')[0]}</span>
                      </p>
                      <p className="text-sm opacity-90 mt-2">
                        Part of Arthur Health's $125M+ in healthcare cost savings delivered
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Removed Workflow Tab - now integrated into other tabs */}
              {false && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold text-arthur-gray-dark mb-4">
                    Automated Claims Workflow
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Streamline your entire claims process with intelligent automation and real-time tracking.
                  </p>

                  {/* Workflow Steps */}
                  <div className="relative">
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                    {[
                      { step: 1, title: 'Claim Initiated', time: '2 min ago', status: 'completed', description: 'Customer submits photos via mobile app' },
                      { step: 2, title: 'AI Analysis', time: '1 min ago', status: 'completed', description: 'Damage detected and classified automatically' },
                      { step: 3, title: 'Coverage Review', time: '30 sec ago', status: 'completed', description: 'Policy provisions matched with damage' },
                      { step: 4, title: 'Estimate Generated', time: 'Just now', status: 'active', description: 'Cost estimate created with market pricing' },
                      { step: 5, title: 'Adjuster Review', time: 'Pending', status: 'pending', description: 'Awaiting adjuster approval' },
                      { step: 6, title: 'Settlement', time: 'Pending', status: 'pending', description: 'Payment processing' },
                    ].map((item, index) => (
                      <div key={index} className="relative flex items-start gap-6 mb-8">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center z-10 ${
                          item.status === 'completed' ? 'bg-green-500' :
                          item.status === 'active' ? 'bg-arthur-blue' :
                          'bg-gray-300'
                        }`}>
                          {item.status === 'completed' ? (
                            <CheckCircle className="text-white" size={24} />
                          ) : item.status === 'active' ? (
                            <div className="animate-pulse">
                              <Zap className="text-white" size={24} />
                            </div>
                          ) : (
                            <span className="text-white font-bold">{item.step}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-1">
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200">{item.title}</h3>
                            <span className={`text-sm ${
                              item.status === 'completed' ? 'text-green-600' :
                              item.status === 'active' ? 'text-arthur-blue' :
                              'text-gray-500'
                            }`}>
                              {item.time}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Automation Benefits */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    {[
                      { metric: '85%', label: 'Reduction in Processing Time', icon: Clock },
                      { metric: '60%', label: 'Fewer Manual Touchpoints', icon: Users },
                      { metric: '99.9%', label: 'Accuracy Rate', icon: CheckCircle },
                    ].map((benefit, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 text-center">
                        <benefit.icon className="mx-auto mb-3 text-arthur-blue" size={32} />
                        <div className="text-3xl font-bold text-arthur-gray-dark mb-2">{benefit.metric}</div>
                        <p className="text-gray-600 dark:text-gray-400">{benefit.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </main>
  )
}