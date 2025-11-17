'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, FileText, Download, Edit3, CheckCircle,
  AlertTriangle, Camera, Mic, Brain, TrendingUp, DollarSign,
  Calendar, User, Heart, Activity, Star,
  Lightbulb, Target, Sparkles, Check, Pill, Stethoscope,
  UserCheck, Clock, AlertCircle, TrendingDown
} from 'lucide-react'
import Link from 'next/link'

// Assessment Area Card Component
function AssessmentAreaCard({
  area,
  aiEnhanced,
  sessionData,
  setCareSessionData,
  getStatusIcon
}: {
  area: any
  aiEnhanced: boolean
  sessionData: any
  setCareSessionData: any
  getStatusIcon: (status: string) => JSX.Element
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedArea, setEditedArea] = useState(area)

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg">
      {/* Clickable Header */}
      <div
        className="p-6 cursor-pointer transition-colors hover:bg-gray-100 dark:bg-gray-800"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{area.name}</h3>
              {getStatusIcon(area.status)}
              {aiEnhanced && (
                <span className="px-2 py-1 bg-arthur-blue/10 text-arthur-blue text-xs rounded-full flex items-center gap-1">
                  <Sparkles size={12} />
                  AI Enhanced
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{area.category} • {area.status}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Camera size={16} />
                {area.photoCount}
              </span>
              <span className="flex items-center gap-1">
                <Mic size={16} />
                {area.audioCount}
              </span>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        className="border-t border-gray-200 dark:border-gray-700"
      >
        <div className="p-6 bg-white dark:bg-gray-900">
          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsEditing(true)
              }}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
                isEditing
                  ? 'bg-arthur-blue text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Edit3 size={16} />
              Edit Information
            </button>
            {isEditing && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // Save edited data
                  const updatedData = { ...sessionData }
                  const areaIndex = updatedData.areas.findIndex((a: any) => a.id === area.id)
                  if (areaIndex !== -1) {
                    updatedData.areas[areaIndex] = editedArea
                    setCareSessionData(updatedData)
                  }
                  setIsEditing(false)
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <CheckCircle size={16} />
                Save Changes
              </button>
            )}
          </div>

          {/* Detailed Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Clinical Observations Section */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                  <FileText size={16} className="text-gray-500 dark:text-gray-400" />
                  Clinical Observations
                </h4>
                {isEditing ? (
                  <textarea
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-arthur-blue"
                    rows={3}
                    value={editedArea.findings}
                    onChange={(e) => setEditedArea({ ...editedArea, findings: e.target.value })}
                  />
                ) : (
                  <p className="text-sm text-gray-700 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">{area.findings}</p>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-gray-500 dark:text-gray-400" />
                  Care Coordinator Notes
                </h4>
                {isEditing ? (
                  <textarea
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-arthur-blue"
                    rows={3}
                    value={editedArea.coordinatorNotes}
                    onChange={(e) => setEditedArea({ ...editedArea, coordinatorNotes: e.target.value })}
                  />
                ) : (
                  <p className="text-sm text-gray-700 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">{area.coordinatorNotes}</p>
                )}
              </div>
            </div>

            {/* Key Insights and Media */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                  <Lightbulb size={16} className="text-gray-500 dark:text-gray-400" />
                  Key Clinical Insights
                </h4>
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                  {isEditing ? (
                    <div className="space-y-2">
                      {editedArea.keyInsights.map((insight: string, idx: number) => (
                        <input
                          key={idx}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-arthur-blue"
                          value={insight}
                          onChange={(e) => {
                            const newInsights = [...editedArea.keyInsights]
                            newInsights[idx] = e.target.value
                            setEditedArea({ ...editedArea, keyInsights: newInsights })
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      {area.keyInsights.map((insight: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-arthur-blue mt-0.5">•</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                  <Camera size={16} className="text-gray-500 dark:text-gray-400" />
                  Documentation
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <Camera className="mx-auto text-blue-600 mb-1" size={24} />
                    <p className="text-2xl font-bold text-blue-900">{area.photoCount}</p>
                    <p className="text-xs text-blue-700">Photos</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                    <Mic className="mx-auto text-green-600 mb-1" size={24} />
                    <p className="text-2xl font-bold text-green-900">{area.audioCount}</p>
                    <p className="text-xs text-green-700">Voice Notes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Care Plan Preview Section */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <FileText size={16} />
              Care Plan Summary Preview
            </h4>
            <p className="text-sm text-blue-800">
              This information will be included in the final care plan summary. Review carefully before approving.
            </p>
            <div className="mt-3 p-3 bg-white dark:bg-gray-900 rounded border border-blue-300">
              <p className="text-xs font-mono text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Assessment:</span> {area.name} ({area.category})<br/>
                <span className="font-semibold">Status:</span> {area.status}<br/>
                <span className="font-semibold">Documentation:</span> {area.photoCount} photos, {area.audioCount} audio recordings<br/>
                <span className="font-semibold">Findings:</span> {area.findings.substring(0, 100)}...
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

interface CareSessionSummary {
  patientDetails: {
    name: string
    mrn: string
    dob: string
    age: number
    gender: string
    primaryDiagnoses: string[]
    carePathway: string
  }
  areas: Array<{
    id: string
    name: string
    category: string
    status: 'completed' | 'skipped' | 'incomplete'
    photoCount: number
    audioCount: number
    findings: string
    coordinatorNotes: string
    keyInsights: string[]
  }>
  clinicalMetrics: {
    totalPhotos: number
    totalAudioNotes: number
    completedAssessments: number
    skippedAssessments: number
    criticalFindings: number
    careGapsIdentified: number
    qualityScore: number
  }
  aiRecommendations: Array<{
    type: 'critical' | 'care_gap' | 'referral' | 'cost_optimization'
    title: string
    description: string
    potentialImpact?: string
    confidence: number
  }>
  careGaps: Array<{
    category: string
    title: string
    description: string
    priority: 'High' | 'Medium' | 'Low'
    dueDate: string
    actionable: string
  }>
  referralRecommendations: Array<{
    specialty: string
    reason: string
    urgency: 'Urgent' | 'Routine' | 'Follow-up'
    timeframe: string
    preAuthRequired: boolean
  }>
  costOptimization: Array<{
    category: string
    currentCost: number
    optimizedCost: number
    savings: number
    recommendation: string
  }>
  riskStratification: {
    readmissionRisk: number
    decompensationRisk: number
    medicationAdherence: number
    socialRiskFactors: string[]
  }
}

export default function CareSessionReviewPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [isAIEnhancing, setIsAIEnhancing] = useState(false)
  const [aiEnhancementComplete, setAIEnhancementComplete] = useState(false)
  const [aiEnhancementProgress, setAIEnhancementProgress] = useState(0)
  const [selectedTab, setSelectedTab] = useState('summary')
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [sessionData, setCareSessionData] = useState<CareSessionSummary | null>(null)

  // Load care session data from localStorage and set up auto-save
  useEffect(() => {
    // Load saved data from localStorage
    const savedData = localStorage.getItem(`care-session-${sessionId}-review`)
    if (savedData) {
      setCareSessionData(JSON.parse(savedData))
    } else {
      // Use default data if no saved data exists
      setCareSessionData(defaultCareSessionSummary)
    }
  }, [sessionId])

  // Auto-save functionality
  useEffect(() => {
    if (sessionData) {
      const saveTimer = setTimeout(() => {
        setAutoSaveStatus('saving')
        localStorage.setItem(`care-session-${sessionId}-review`, JSON.stringify(sessionData))
        setTimeout(() => {
          setAutoSaveStatus('saved')
          setTimeout(() => setAutoSaveStatus('idle'), 2000)
        }, 500)
      }, 1000)

      return () => clearTimeout(saveTimer)
    }
  }, [sessionData, sessionId])

  // Default demo data - Margaret Thompson, Type 2 Diabetes patient
  const defaultCareSessionSummary: CareSessionSummary = {
    patientDetails: {
      name: 'Margaret Thompson',
      mrn: 'MRN-784512',
      dob: '1962-03-15',
      age: 62,
      gender: 'Female',
      primaryDiagnoses: ['Type 2 Diabetes Mellitus', 'Hypertension', 'Hyperlipidemia'],
      carePathway: 'Diabetes Management & Education'
    },
    areas: [
      {
        id: 'vitals-measurements',
        name: 'Vital Signs & Measurements',
        category: 'Clinical Assessment',
        status: 'completed',
        photoCount: 4,
        audioCount: 2,
        findings: 'BP 142/88 mmHg, HR 78 bpm, Weight 182 lbs, BMI 29.4, O2 Sat 98%. Blood glucose fasting 148 mg/dL.',
        coordinatorNotes: 'Blood pressure slightly elevated despite current medication regimen. Patient reports consistent medication adherence. May need dosage adjustment.',
        keyInsights: ['BP trending upward over last 3 visits', 'BMI decreased by 0.8 from baseline', 'Fasting glucose improved from 165 mg/dL']
      },
      {
        id: 'medication-review',
        name: 'Medication Review & Reconciliation',
        category: 'Clinical Assessment',
        status: 'completed',
        photoCount: 3,
        audioCount: 1,
        findings: 'Currently taking Metformin 1000mg BID, Lisinopril 20mg QD, Atorvastatin 40mg QD. All medications reconciled with pharmacy records.',
        coordinatorNotes: 'Patient demonstrates good understanding of medication regimen. Using pill organizer effectively. Noted cost concerns about Atorvastatin.',
        keyInsights: ['100% medication adherence per pharmacy records', 'Patient eligible for generic cost savings program', 'Consider mail-order pharmacy for additional savings']
      },
      {
        id: 'symptom-assessment',
        name: 'Symptom Assessment',
        category: 'Clinical Assessment',
        status: 'completed',
        photoCount: 0,
        audioCount: 3,
        findings: 'Reports occasional tingling in feet, more noticeable at night. Denies chest pain, SOB, vision changes. Energy levels improved.',
        coordinatorNotes: 'Peripheral neuropathy symptoms warrant diabetic neuropathy screening. Patient unaware this requires specialist evaluation.',
        keyInsights: ['Early diabetic neuropathy symptoms present', 'Podiatry referral indicated', 'Patient education needed on neuropathy management']
      },
      {
        id: 'care-plan-review',
        name: 'Care Plan Review',
        category: 'Care Planning',
        status: 'completed',
        photoCount: 2,
        audioCount: 2,
        findings: 'HbA1c goal <7.0%, current 8.2%. Diet modifications in progress, walking 30 min daily 5x/week. Home glucose monitoring 2x daily.',
        coordinatorNotes: 'Patient making excellent lifestyle changes but A1C still above target. May benefit from continuous glucose monitor and diabetes education class.',
        keyInsights: ['A1C improved from 9.1% baseline', 'Exercise routine well-established', 'CGM could provide better glycemic insights']
      }
    ],
    clinicalMetrics: {
      totalPhotos: 9,
      totalAudioNotes: 8,
      completedAssessments: 4,
      skippedAssessments: 0,
      criticalFindings: 1,
      careGapsIdentified: 3,
      qualityScore: 87
    },
    aiRecommendations: [
      {
        type: 'critical',
        title: 'Diabetic Neuropathy Screening Overdue',
        description: 'Patient exhibits peripheral neuropathy symptoms (tingling in feet) but has not had specialist evaluation in 18 months. Guidelines recommend annual screening.',
        potentialImpact: 'Early intervention can prevent progression and improve quality of life',
        confidence: 95
      },
      {
        type: 'care_gap',
        title: 'Missing Diabetic Retinal Screening',
        description: 'Annual diabetic retinal exam not completed. Last ophthalmology visit was 16 months ago.',
        potentialImpact: 'Detect diabetic retinopathy before vision loss occurs',
        confidence: 100
      },
      {
        type: 'referral',
        title: 'Certified Diabetes Educator Referral Recommended',
        description: 'Patient would benefit from structured diabetes self-management education to achieve HbA1c target.',
        potentialImpact: 'Studies show 1-2% A1C reduction with DSME programs',
        confidence: 88
      },
      {
        type: 'cost_optimization',
        title: 'Medication Cost Reduction Opportunity',
        description: 'Patient eligible for manufacturer savings program and mail-order pharmacy discount. Combined savings of $140/month.',
        potentialImpact: 'Annual savings: $1,680',
        confidence: 92
      }
    ],
    careGaps: [
      {
        category: 'Preventive Care',
        title: 'Annual Diabetic Eye Exam Overdue',
        description: 'Last dilated eye exam was 16 months ago. ADA guidelines recommend annual screening for diabetic retinopathy.',
        priority: 'High',
        dueDate: 'Within 30 days',
        actionable: 'Schedule ophthalmology appointment with Dr. Sarah Chen'
      },
      {
        category: 'Specialist Consultation',
        title: 'Podiatry Evaluation for Neuropathy Symptoms',
        description: 'Patient reports tingling in feet, consistent with early diabetic neuropathy. Requires comprehensive foot exam and monofilament testing.',
        priority: 'High',
        dueDate: 'Within 2 weeks',
        actionable: 'Refer to Podiatry - Dr. Michael Rodriguez, Urgent'
      },
      {
        category: 'Disease Management',
        title: 'Diabetes Self-Management Education',
        description: 'HbA1c 8.2% above target despite lifestyle modifications. DSME program can provide intensive education and support.',
        priority: 'Medium',
        dueDate: 'Within 60 days',
        actionable: 'Enroll in Arthur Health DSME Program - Next session starts May 15th'
      }
    ],
    referralRecommendations: [
      {
        specialty: 'Endocrinology',
        reason: 'HbA1c 8.2% despite lifestyle modifications and current medication regimen. Consider insulin therapy or GLP-1 agonist.',
        urgency: 'Routine',
        timeframe: 'Within 8 weeks',
        preAuthRequired: true
      },
      {
        specialty: 'Podiatry',
        reason: 'Peripheral neuropathy symptoms, comprehensive diabetic foot exam needed including monofilament testing and vascular assessment.',
        urgency: 'Urgent',
        timeframe: 'Within 2 weeks',
        preAuthRequired: false
      },
      {
        specialty: 'Ophthalmology',
        reason: 'Overdue annual diabetic retinal screening. Last exam 16 months ago.',
        urgency: 'Routine',
        timeframe: 'Within 4 weeks',
        preAuthRequired: false
      }
    ],
    costOptimization: [
      {
        category: 'Medication Costs',
        currentCost: 285,
        optimizedCost: 145,
        savings: 140,
        recommendation: 'Switch to mail-order pharmacy (90-day supply) and enroll in manufacturer savings program for Atorvastatin'
      },
      {
        category: 'Preventive Care',
        currentCost: 0,
        optimizedCost: 0,
        savings: 1200,
        recommendation: 'Complete preventive screenings now to avoid costly complications (estimated $1,200 annual savings in avoided ER visits/hospitalizations)'
      },
      {
        category: 'Diabetes Management',
        currentCost: 85,
        optimizedCost: 45,
        savings: 40,
        recommendation: 'Patient eligible for discounted CGM through insurance. Reduces test strip costs and improves glycemic control.'
      }
    ],
    riskStratification: {
      readmissionRisk: 32,
      decompensationRisk: 38,
      medicationAdherence: 92,
      socialRiskFactors: ['Transportation barriers to specialist appointments', 'High cost of copays affecting medication adherence']
    }
  }

  const handleApproveAndGenerate = async () => {
    setIsGeneratingReport(true)

    // Generate care plan summary data
    const carePlanData = {
      reportId: `CPR-${sessionId}`,
      generatedDate: new Date().toISOString(),
      status: 'approved',
      patient: careSessionSummary.patientDetails,
      careSession: {
        id: sessionId,
        completedAssessments: careSessionSummary.clinicalMetrics.completedAssessments,
        totalPhotos: careSessionSummary.clinicalMetrics.totalPhotos,
        totalAudioNotes: careSessionSummary.clinicalMetrics.totalAudioNotes,
        qualityScore: careSessionSummary.clinicalMetrics.qualityScore
      },
      assessmentAreas: careSessionSummary.areas,
      careGaps: careSessionSummary.careGaps,
      referrals: careSessionSummary.referralRecommendations,
      costOptimization: {
        monthlySavings: careSessionSummary.costOptimization.reduce((sum, opt) => sum + opt.savings, 0),
        annualSavings: careSessionSummary.costOptimization.reduce((sum, opt) => sum + opt.savings, 0) * 12,
        recommendations: careSessionSummary.costOptimization
      },
      riskScores: careSessionSummary.riskStratification,
      aiEnhanced: aiEnhancementComplete
    }

    // Save report data to localStorage
    localStorage.setItem(`care-plan-${sessionId}`, JSON.stringify(carePlanData))

    // Mock processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsGeneratingReport(false)

    // Navigate to report page
    router.push(`/dashboard/care-sessions/${sessionId}/report`)
  }

  const handleAIEnhancement = async () => {
    setIsAIEnhancing(true)
    setAIEnhancementProgress(0)

    // Simulate AI enhancement process with multiple steps
    const enhancementSteps = [
      { label: 'Analyzing patient clinical history', duration: 1200 },
      { label: 'Cross-referencing HEDIS quality measures', duration: 1000 },
      { label: 'Checking care gap closure opportunities', duration: 1200 },
      { label: 'Reviewing evidence-based guidelines', duration: 900 },
      { label: 'Identifying cost optimization opportunities', duration: 1100 },
      { label: 'Calculating risk stratification scores', duration: 1000 },
      { label: 'Generating specialist referral recommendations', duration: 1000 }
    ]

    for (let i = 0; i < enhancementSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, enhancementSteps[i].duration))
      setAIEnhancementProgress(((i + 1) / enhancementSteps.length) * 100)
    }

    setIsAIEnhancing(false)
    setAIEnhancementComplete(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={16} />
      case 'skipped':
        return <div className="w-4 h-4 rounded-full bg-gray-300" />
      default:
        return <AlertTriangle className="text-amber-500" size={16} />
    }
  }

  const tabs = [
    { id: 'summary', label: 'Clinical Summary', icon: Activity },
    { id: 'care-gaps', label: 'Care Gaps', icon: AlertCircle },
    { id: 'referrals', label: 'Referrals', icon: UserCheck },
    { id: 'cost-optimization', label: 'Cost Optimization', icon: DollarSign }
  ]

  // Use sessionData if available, otherwise use default
  const careSessionSummary = sessionData || defaultCareSessionSummary

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex flex-col gap-2">
            {/* Back Navigation */}
            <Link
              href={`/dashboard/care-sessions`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-100 cursor-pointer w-fit"
            >
              <ArrowLeft size={20} />
              Back to Shipments
            </Link>

            {/* Title Section */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
                    Care Session Review
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {careSessionSummary.patientDetails.name} • MRN: {careSessionSummary.patientDetails.mrn}
                  </p>
                </div>
                {autoSaveStatus !== 'idle' && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    {autoSaveStatus === 'saving' ? (
                      <>
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={12} className="text-green-500" />
                        Saved
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons Row - Below Title */}
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href={`/dashboard/care-sessions/${sessionId}/areas`}
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900 dark:text-gray-100 cursor-pointer"
                >
                  <Edit3 size={18} />
                  Edit
                </Link>

                {/* AI Enhancement Button */}
                <button
                  onClick={handleAIEnhancement}
                  disabled={isAIEnhancing || aiEnhancementComplete}
                  className={`px-6 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                    aiEnhancementComplete
                      ? 'bg-green-600 text-white'
                      : 'bg-arthur-blue text-white hover:bg-arthur-blue-dark'
                  }`}
                >
                  {isAIEnhancing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Analyzing...
                    </>
                  ) : aiEnhancementComplete ? (
                    <>
                      <CheckCircle size={18} />
                      AI Enhanced
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Enhance with AI
                    </>
                  )}
                </button>

                {/* Approve Button - Primary Action */}
                <button
                  onClick={handleApproveAndGenerate}
                  disabled={isGeneratingReport}
                  className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none font-medium"
                >
                  {isGeneratingReport ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Approve
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          {/* Assessment Quality Score */}
          <div className="bg-white dark:bg-gray-900 rounded-xl md:rounded-2xl border border-gray-200 p-4 md:p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-50 rounded-bl-full opacity-50" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-purple-100 rounded-lg">
                  <Star className="text-purple-600" size={16} />
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Quality Score</span>
              </div>
              <p className="text-3xl font-bold text-purple-600">
                {careSessionSummary.clinicalMetrics.qualityScore}%
              </p>
            </div>
          </div>

          {/* Assessments Complete */}
          <div className="bg-white dark:bg-gray-900 rounded-xl md:rounded-2xl border border-gray-200 p-4 md:p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-bl-full opacity-50" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-green-100 rounded-lg">
                  <CheckCircle className="text-green-600" size={16} />
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Completed</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {careSessionSummary.clinicalMetrics.completedAssessments}
              </p>
            </div>
          </div>

          {/* Care Gaps Identified */}
          <div className="bg-white dark:bg-gray-900 rounded-xl md:rounded-2xl border border-gray-200 p-4 md:p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-50 rounded-bl-full opacity-50" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-amber-100 rounded-lg">
                  <AlertCircle className="text-amber-600" size={16} />
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Care Gaps</span>
              </div>
              <p className="text-3xl font-bold text-amber-600">
                {careSessionSummary.clinicalMetrics.careGapsIdentified}
              </p>
            </div>
          </div>

          {/* Potential Cost Savings */}
          <div className="bg-white dark:bg-gray-900 rounded-xl md:rounded-2xl border border-gray-200 p-4 md:p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-bl-full opacity-50" />
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-emerald-100 rounded-lg">
                  <DollarSign className="text-emerald-600" size={16} />
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Annual Savings</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-emerald-600">
                ${(careSessionSummary.costOptimization.reduce((sum, opt) => sum + opt.savings, 0) * 12).toLocaleString()}
              </p>
              <div className="text-xs text-gray-400 mt-2">
                Cost optimization opportunities
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-900 rounded-xl md:rounded-2xl border border-gray-200">
          {/* Tab Headers */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-3 md:px-6 py-3 md:py-4">
            <nav className="flex space-x-4 md:space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center gap-1 md:gap-2 py-2 px-1 border-b-2 font-medium text-xs md:text-sm transition-colors cursor-pointer relative whitespace-nowrap ${
                    selectedTab === tab.id
                      ? 'border-arthur-blue text-arthur-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Action Buttons - Mobile Only */}
          <div className="block md:hidden border-b border-gray-200 dark:border-gray-700 px-3 py-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Link
                href={`/dashboard/care-sessions/${sessionId}/areas`}
                className="flex items-center justify-center gap-2 py-2 px-2 bg-gray-100 dark:bg-gray-800 text-gray-700 hover:text-gray-900 rounded-lg cursor-pointer text-sm"
              >
                <Edit3 size={16} />
                Edit
              </Link>

              <button
                onClick={handleAIEnhancement}
                disabled={isAIEnhancing || aiEnhancementComplete}
                className={`py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm ${
                  aiEnhancementComplete
                    ? 'bg-green-600 text-white'
                    : 'bg-arthur-blue text-white hover:bg-arthur-blue-dark'
                }`}
              >
                {isAIEnhancing ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                ) : aiEnhancementComplete ? (
                  <>
                    <CheckCircle size={16} />
                    Enhanced
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Enhance
                  </>
                )}
              </button>
            </div>

            <button
              onClick={handleApproveAndGenerate}
              disabled={isGeneratingReport}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm font-medium"
            >
              {isGeneratingReport ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                  Approving
                </>
              ) : (
                <>
                  <Check size={16} />
                  Approve
                </>
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-3 md:p-6">
            {selectedTab === 'summary' && (
              <div className="space-y-4 md:space-y-6">
                {/* Patient Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Patient Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="text-gray-400" size={18} />
                        <span className="text-gray-900 dark:text-gray-100">{careSessionSummary.patientDetails.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="text-gray-400" size={18} />
                        <span className="text-gray-900 dark:text-gray-100">
                          {careSessionSummary.patientDetails.age} years • DOB: {careSessionSummary.patientDetails.dob}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Heart className="text-gray-400" size={18} />
                        <span className="text-gray-900 dark:text-gray-100">{careSessionSummary.patientDetails.carePathway}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Primary Diagnoses</h3>
                    <div className="flex flex-wrap gap-2">
                      {careSessionSummary.patientDetails.primaryDiagnoses.map((diagnosis) => (
                        <span
                          key={diagnosis}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg text-sm"
                        >
                          {diagnosis}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Risk Stratification */}
                <div className="bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <TrendingUp className="text-red-600" size={20} />
                    Risk Stratification
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Readmission Risk</div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${careSessionSummary.riskStratification.readmissionRisk}%` }} />
                        </div>
                        <span className="text-lg font-bold text-amber-600">{careSessionSummary.riskStratification.readmissionRisk}%</span>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Decompensation Risk</div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{ width: `${careSessionSummary.riskStratification.decompensationRisk}%` }} />
                        </div>
                        <span className="text-lg font-bold text-red-600">{careSessionSummary.riskStratification.decompensationRisk}%</span>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Medication Adherence</div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${careSessionSummary.riskStratification.medicationAdherence}%` }} />
                        </div>
                        <span className="text-lg font-bold text-green-600">{careSessionSummary.riskStratification.medicationAdherence}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-900 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Social Risk Factors</h4>
                    <ul className="space-y-1">
                      {careSessionSummary.riskStratification.socialRiskFactors.map((factor, idx) => (
                        <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-red-600 mt-0.5">•</span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Assessment Areas */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Assessment Areas</h3>
                  <div className="space-y-4">
                    {careSessionSummary.areas.map((area) => (
                      <AssessmentAreaCard
                        key={area.id}
                        area={area}
                        aiEnhanced={aiEnhancementComplete}
                        sessionData={sessionData}
                        setCareSessionData={setCareSessionData}
                        getStatusIcon={getStatusIcon}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'care-gaps' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Identified Care Gaps</h3>

                {careSessionSummary.careGaps.map((gap, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-6 rounded-xl ${
                      gap.priority === 'High' ? 'bg-red-50 border border-red-200' :
                      gap.priority === 'Medium' ? 'bg-amber-50 border border-amber-200' :
                      'bg-blue-50 border border-blue-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${
                        gap.priority === 'High' ? 'bg-red-100' :
                        gap.priority === 'Medium' ? 'bg-amber-100' :
                        'bg-blue-100'
                      }`}>
                        <AlertCircle className={`${
                          gap.priority === 'High' ? 'text-red-600' :
                          gap.priority === 'Medium' ? 'text-amber-600' :
                          'text-blue-600'
                        }`} size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{gap.title}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{gap.category}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            gap.priority === 'High' ? 'bg-red-600 text-white' :
                            gap.priority === 'Medium' ? 'bg-amber-600 text-white' :
                            'bg-blue-600 text-white'
                          }`}>
                            {gap.priority} Priority
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-3">{gap.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Clock size={14} />
                            <span>Due: {gap.dueDate}</span>
                          </div>
                        </div>
                        <div className="mt-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Recommended Action:</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{gap.actionable}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {selectedTab === 'referrals' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Specialist Referral Recommendations</h3>

                {careSessionSummary.referralRecommendations.map((referral, idx) => (
                  <div key={idx} className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <UserCheck className="text-purple-600" size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{referral.specialty}</h4>
                          <div className="flex items-center gap-2">
                            {referral.preAuthRequired && (
                              <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                                Pre-Auth Required
                              </span>
                            )}
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              referral.urgency === 'Urgent' ? 'bg-red-600 text-white' :
                              referral.urgency === 'Routine' ? 'bg-blue-600 text-white' :
                              'bg-gray-600 text-white'
                            }`}>
                              {referral.urgency}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-3">{referral.reason}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Clock size={14} />
                          <span>Schedule: {referral.timeframe}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedTab === 'cost-optimization' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Cost Optimization Opportunities</h3>

                {careSessionSummary.costOptimization.map((opt, idx) => (
                  <div key={idx} className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <DollarSign className="text-green-600" size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{opt.category}</h4>
                          <div className="text-right">
                            <div className="text-sm text-gray-600 dark:text-gray-400 line-through">
                              ${opt.currentCost}/month
                            </div>
                            <div className="text-lg font-bold text-green-600">
                              ${opt.optimizedCost}/month
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-3">{opt.recommendation}</p>
                        <div className="bg-white dark:bg-gray-900 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Monthly Savings</div>
                              <div className="text-xl font-bold text-green-600">${opt.savings}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500 dark:text-gray-400">Annual Savings</div>
                              <div className="text-xl font-bold text-green-600">${opt.savings * 12}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="text-emerald-600" size={24} />
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Total Cost Optimization</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Monthly Savings</div>
                      <div className="text-2xl font-bold text-emerald-600">
                        ${careSessionSummary.costOptimization.reduce((sum, opt) => sum + opt.savings, 0)}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Annual Savings</div>
                      <div className="text-2xl font-bold text-emerald-600">
                        ${careSessionSummary.costOptimization.reduce((sum, opt) => sum + opt.savings, 0) * 12}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Enhancement Modal */}
      {isAIEnhancing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mb-6">
                <Brain className="mx-auto text-arthur-blue animate-pulse" size={48} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">AI Enhancement in Progress</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Analyzing care session data with clinical guidelines, quality measures, and cost optimization algorithms.
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
                <div
                  className="bg-arthur-blue h-3 rounded-full transition-all duration-500"
                  style={{ width: `${aiEnhancementProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round(aiEnhancementProgress)}% complete
              </p>

              {/* Current Step */}
              <div className="mt-4 p-3 bg-arthur-blue/10 rounded-lg">
                <p className="text-sm text-arthur-blue font-medium">
                  {aiEnhancementProgress < 15 ? 'Analyzing patient clinical history' :
                   aiEnhancementProgress < 30 ? 'Cross-referencing HEDIS quality measures' :
                   aiEnhancementProgress < 45 ? 'Checking care gap closure opportunities' :
                   aiEnhancementProgress < 60 ? 'Reviewing evidence-based guidelines' :
                   aiEnhancementProgress < 75 ? 'Identifying cost optimization opportunities' :
                   aiEnhancementProgress < 90 ? 'Calculating risk stratification scores' :
                   'Generating specialist referral recommendations'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhancement Success Banner */}
      {aiEnhancementComplete && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-xl shadow-lg z-40 max-w-sm">
          <div className="flex items-center gap-3">
            <CheckCircle size={24} />
            <div>
              <h4 className="font-semibold">Care Session Enhanced!</h4>
              <p className="text-sm text-green-100">
                Identified {careSessionSummary.clinicalMetrics.careGapsIdentified} care gaps and ${careSessionSummary.costOptimization.reduce((sum, opt) => sum + opt.savings, 0) * 12} in annual savings.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
