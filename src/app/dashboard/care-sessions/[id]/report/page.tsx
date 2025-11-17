'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Download, Send, Share2, FileText,
  CheckCircle, AlertTriangle, TrendingUp, DollarSign,
  Calendar, MapPin, User, Building2, Home, Camera,
  Brain, Lightbulb, History, Target, Star, Award,
  Globe, Shield, AlertCircle, UserCheck
} from 'lucide-react'
import Link from 'next/link'
import { generateCareSessionPDF, downloadHTMLReport, CareSessionReportData } from '@/lib/pdf/simple-report-generator'

interface ReportData {
  metadata: {
    reportId: string
    generatedDate: string
    assessmentCoordinator: string
    patient: {
      name: string
      type: 'medicare' | 'medicaid' | 'commercial' | 'dual-eligible'
      dateOfBirth: string
      medicalRecordNumber: string
      insuranceId: string
    }
    sessionInfo: {
      sessionDate: string
      conditions: string[]
      initialRiskScore: number
    }
  }
  executiveSummary: {
    totalValueOpportunity: number
    criticalFindings: number
    clinicalRecommendations: string[]
    timelineEstimate: string
    confidenceScore: number
  }
  assessmentAreas: Array<{
    area: string
    category: string
    status: 'critical' | 'needs-attention' | 'stable' | 'completed'
    dataPointsCollected: number
    clinicalDescription: string
    estimatedCareValue: number
    priority: 'high' | 'medium' | 'low'
    recommendations: string[]
    clinicalFindings?: Record<string, string>
    medications?: Record<string, string>
    labResults?: Record<string, string>
    symptomsReported?: string[]
    vitalSigns?: Record<string, string | number>
    riskFactors?: string[]
    comorbidities?: Record<string, string>
  }>
  aiInsights: {
    unreportedConditionsEstimate: number
    qualityImprovementOpportunities: number
    historicalOutcomes: number
    populationComparison: string
    confidenceMetrics: {
      conditionPrediction: number
      costAccuracy: number
      timelineReliability: number
      riskAssessment: number
    }
    historicalData: {
      similarCases: number
      averageOutcome: number
      timeToStabilization: string
      readmissionRate: string
      payerBehavior: string
    }
    predictiveAnalysis: {
      additionalConditionRisk: string
      costTrendFactor: string
      specialistAvailability: string
      providerCapacity: string
    }
    riskAssessment: string[]
    socialDeterminants: {
      housingStability: string
      foodSecurity: string
      transportationAccess: string
      socialSupport: string
      educationLevel: string
    }
    payerIntelligence: {
      insuranceProfile: {
        name: string
        authorizationHistory: string
        coveragePatterns: string
        preferredProviders: string
        timelineExpectations: string
      }
      strategicConsiderations: string[]
    }
  }
  financialSummary: {
    currentCareValue: number
    historicalOutcomeValue: number
    potentialQualityBonus: number
    totalValueOpportunity: number
    breakdown: Array<{
      category: string
      amount: number
      description: string
    }>
    detailedCostAnalysis: {
      professionalServices: {
        primaryCare: { visits: number, rate: number, total: number }
        specialists: { visits: number, rate: number, total: number }
        ancillaryServices: { sessions: number, rate: number, total: number }
      }
      medicationCosts: {
        chronicMedications: { count: number, monthly: number, total: number }
        acuteMedications: { count: number, monthly: number, total: number }
        biologics: { count: number, monthly: number, total: number }
        dme: { items: number, average: number, total: number }
      }
      diagnosticCosts: {
        laboratory: number
        imaging: number
        specializedTesting: number
        monitoring: number
      }
      qualityReserve: {
        percentage: number
        amount: number
        justification: string
      }
    }
    marketComparatives: {
      regionalAverages: {
        perMemberPerMonth: number
        episodeDurationWeeks: number
        qualityGrade: string
      }
      providerComparisons: Array<{
        name: string
        estimatedCareValue: number
        timeline: string
      }>
    }
  }
}

export default function CareSessionReportPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  const [isSending, setIsSending] = useState(false)
  const [reportSent, setReportSent] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isApproved, setIsApproved] = useState<boolean | null>(null)
  const [storedReportData, setStoredReportData] = useState<any>(null)
  const [careSessionId, setCareSessionId] = useState<string | null>(null)

  // Check if report is approved on mount and load data
  useEffect(() => {
    // First check localStorage for care plan data (saved from review page)
    const localReportData = localStorage.getItem(`care-plan-${sessionId}`)
    if (localReportData) {
      const parsedData = JSON.parse(localReportData)

      // If care plan exists, it means it was approved
      if (parsedData.status === 'approved') {
        setIsApproved(true)
        setStoredReportData(parsedData)
        if (parsedData.careSessionId) {
          setCareSessionId(parsedData.careSessionId)
        }
        return // Exit early, we have our data
      }
    }

    // Fallback: Check sessionStorage for old care session reports
    const reports = JSON.parse(sessionStorage.getItem('care_session_reports') || '[]')
    const report = reports.find((r: any) => r.sessionId === sessionId)

    if (report) {
      if (report.status === 'approved' || report.status === 'sent') {
        setIsApproved(true)
        const fullReportKey = Object.keys(sessionStorage).find(key =>
          key.startsWith('report_') && sessionStorage.getItem(key)?.includes(sessionId)
        )
        if (fullReportKey) {
          const fullReport = JSON.parse(sessionStorage.getItem(fullReportKey) || '{}')
          if (fullReport.status === 'approved' || fullReport.status === 'sent') {
            setStoredReportData(fullReport)
            if (fullReport.careSessionId) {
              setCareSessionId(fullReport.careSessionId)
            }
          }
        }
      } else if (report.status === 'pending_approval' || report.status === 'in_review') {
        setIsApproved(false)
      } else {
        setIsApproved(true)
      }
    } else {
      // Default to approved for demo purposes
      setIsApproved(true)
    }

    // Fallback: load from care session data
    if (!careSessionId) {
      const sessionData = localStorage.getItem(`care-session-${sessionId}-data`)
      if (sessionData) {
        const parsedSession = JSON.parse(sessionData)
        if (parsedSession.careSessionId) {
          setCareSessionId(parsedSession.careSessionId)
        }
      }
    }
  }, [sessionId])

  // Check if stored data is care plan (healthcare) vs inspection report (property)
  const isCareplanData = storedReportData && storedReportData.patient && !storedReportData.metadata

  // For healthcare care sessions (CS-001), use healthcare data as default
  const isHealthcareSession = sessionId.startsWith('CS-')

  // Comprehensive AI-Enhanced Report Data - Generated by Arthur Health Intelligence Platform
  const reportData: ReportData = (storedReportData && !isCareplanData) ? storedReportData : {
    metadata: {
      reportId: `CPR-${sessionId}`,
      generatedDate: new Date().toISOString(),
      assessmentCoordinator: 'Arthur Health Care Coordinator',
      patient: {
        name: 'Margaret Thompson',
        type: 'medicare',
        dateOfBirth: '1962-03-15',
        medicalRecordNumber: 'MRN-784512',
        insuranceId: 'MCR-9876543210'
      },
      sessionInfo: {
        sessionDate: new Date().toISOString(),
        conditions: ['Type 2 Diabetes Mellitus', 'Hypertension', 'Hyperlipidemia'],
        initialRiskScore: 68
      }
    },
    executiveSummary: {
      totalValueOpportunity: 127500,
      criticalFindings: 4,
      clinicalRecommendations: [
        'Immediate A1C control - target below 7.0%',
        'Blood pressure medication adjustment required',
        'Initiate statin therapy for cholesterol management',
        'Schedule comprehensive diabetic foot examination'
      ],
      timelineEstimate: '90-day care plan with monthly follow-ups',
      confidenceScore: 92
    },
    assessmentAreas: [
      {
        area: 'Vitals & Measurements',
        category: 'Clinical Assessment',
        status: 'completed',
        dataPointsCollected: 8,
        clinicalDescription: 'Comprehensive vital signs assessment reveals elevated blood pressure at 158/94 mmHg (Stage 2 Hypertension) and BMI of 32.4 (Obese Class I). Patient reports medication adherence challenges with current 3x daily dosing schedule. Blood glucose trending shows afternoon spikes averaging 220 mg/dL. Weight increased 8 lbs since last quarterly visit.',
        estimatedCareValue: 12500,
        priority: 'high',
        clinicalFindings: {
          bloodPressure: '158/94 mmHg (target: <130/80)',
          bloodGlucose: 'Fasting 145 mg/dL, Post-prandial 220 mg/dL',
          a1c: '8.2% (target: <7.0%)',
          bmi: '32.4 (Obese Class I)',
          lipidPanel: 'LDL 142 mg/dL (target: <100)'
        },
        recommendations: [
          'Initiate combination antihypertensive therapy - ACE inhibitor + thiazide diuretic',
          'Transition to long-acting diabetes medication for simplified dosing',
          'Weekly BP monitoring with home monitoring device',
          'Endocrinology consult for A1C optimization',
          'Nutrition referral for medical nutrition therapy'
        ]
      },
      {
        area: 'Medication Review',
        category: 'Clinical Assessment',
        status: 'completed',
        dataPointsCollected: 12,
        clinicalDescription: 'Polypharmacy identified with 9 active medications and adherence barriers due to complex regimen. Patient reports missed doses 3-4 times weekly, primarily afternoon metformin. Statin therapy suboptimal - taking 20mg vs prescribed 40mg due to cost concerns. No documentation of medication reconciliation in past 6 months.',
        estimatedCareValue: 18000,
        priority: 'high',
        clinicalFindings: {
          medicationCount: '9 active prescriptions',
          adherenceRate: '68% (target: >80%)',
          potentialInteractions: '2 moderate drug-drug interactions identified',
          costBarrier: '$340/month out-of-pocket costs',
          duplicateTherapy: 'No duplications identified'
        },
        recommendations: [
          'Consolidate to long-acting formulations - reduce from TID to QD dosing',
          'Switch to generic alternatives - reduce OOP cost by estimated $180/month',
          'Implement pill organizer and medication synchronization program',
          'Pharmacist consultation for medication therapy management',
          'Prior authorization for GLP-1 agonist to address A1C and weight'
        ]
      },
      {
        area: 'Symptom Assessment',
        category: 'Clinical Assessment',
        status: 'completed',
        dataPointsCollected: 6,
        clinicalDescription: 'Patient reports worsening fatigue, nocturia (3-4x nightly), and intermittent lower extremity edema. Denies chest pain but endorses dyspnea on exertion after one flight of stairs. PHQ-9 score of 11 indicates moderate depression, likely related to chronic disease burden. Sleep quality poor due to nocturia and restless legs.',
        estimatedCareValue: 15000,
        priority: 'high',
        clinicalFindings: {
          phq9Score: '11 (Moderate depression)',
          nocturiaFrequency: '3-4 episodes per night',
          functionalCapacity: 'NYHA Class II - dyspnea with moderate exertion',
          sleepQuality: 'PSQI score 14 (poor sleep)',
          peripheralEdema: '1+ bilateral lower extremities'
        },
        recommendations: [
          'Cardiology referral for dyspnea evaluation - r/o heart failure',
          'Optimize diuretic timing to reduce nocturia',
          'Mental health referral for depression management',
          'Sleep study consideration if symptoms persist',
          'Patient education on symptom recognition and when to seek care'
        ]
      },
      {
        area: 'Care Plan Review',
        category: 'Clinical Assessment',
        status: 'completed',
        dataPointsCollected: 10,
        clinicalDescription: 'Current care plan lacks coordination between multiple specialists. Last PCP visit 4 months ago, endocrinology 8 months ago, cardiology 6 months ago - no documentation of inter-provider communication. Overdue for diabetic foot exam, retinal screening, and annual wellness visit. No advance care planning documented.',
        estimatedCareValue: 28000,
        priority: 'high',
        clinicalFindings: {
          careGaps: '4 major preventive care gaps identified',
          specialistVisits: '3 specialists, no care coordination notes',
          complianceWithGuidelines: '52% adherence to diabetes quality measures',
          erVisits: '2 visits in past 6 months (hyperglycemia, HTN urgency)',
          hospitalization: '1 admission in past year (DKA)'
        },
        recommendations: [
          'Implement comprehensive care coordination with care manager assignment',
          'Schedule overdue preventive screenings within 30 days',
          'Establish regular interdisciplinary team huddles',
          'Create patient-centered medical home structure',
          'Develop shared care plan with patient goals and preferences'
        ]
      },
      {
        area: 'Patient Education',
        category: 'Clinical Assessment',
        status: 'completed',
        dataPointsCollected: 5,
        clinicalDescription: 'Significant knowledge gaps identified in diabetes self-management. Patient unable to demonstrate proper glucose monitoring technique and unaware of target ranges. No carbohydrate counting knowledge. Believes "natural remedies" can replace medications. Limited health literacy - reads at 6th grade level per assessment.',
        estimatedCareValue: 14000,
        priority: 'medium',
        clinicalFindings: {
          healthLiteracy: '6th grade reading level (REALM score)',
          diabetesKnowledge: 'DKT score 9/15 (60% - needs improvement)',
          selfManagementSkills: 'Unable to adjust insulin based on readings',
          nutritionalKnowledge: 'No understanding of carb counting or portions',
          medicationUnderstanding: 'Cannot name medications or purposes'
        },
        recommendations: [
          'Enroll in diabetes self-management education (DSME) program',
          'Provide teach-back method education at 6th grade literacy level',
          'Connect with certified diabetes educator for ongoing support',
          'Implement shared decision-making tools for medication choices',
          'Provide culturally appropriate educational materials in preferred format'
        ]
      }
    ],
    aiInsights: {
      unreportedConditionsEstimate: 24500,
      qualityImprovementOpportunities: 18000,
      historicalOutcomes: 32000,
      populationComparison: 'Comparative analysis of 342 similar Medicare Advantage patients with Type 2 Diabetes shows average annual cost savings of 38% through optimized care coordination and preventive interventions',
      confidenceMetrics: {
        conditionPrediction: 91.8,
        costAccuracy: 89.4,
        timelineReliability: 92.1,
        riskAssessment: 93.7
      },
      historicalData: {
        similarCases: 342,
        averageOutcome: 127500,
        timeToStabilization: '90-day care plan with ongoing monitoring',
        readmissionRate: '3% appeal rate for denied services',
        payerBehavior: 'Medicare Advantage plan historically approves 82% of specialist referrals within 48 hours'
      },
      predictiveAnalysis: {
        additionalConditionRisk: 'HIGH - 84% probability of identifying additional uncoded chronic conditions through comprehensive assessment',
        costTrendFactor: '8% anticipated cost increase without intervention over 12-month period',
        specialistAvailability: 'Good access to specialist network and durable medical equipment',
        providerCapacity: 'Care coordination team capacity available for immediate enrollment'
      },
      riskAssessment: [
        'CRITICAL: Hospital readmission risk - 76% probability within 90 days without care coordination intervention',
        'HIGH: Medication non-adherence - current 68% adherence rate below 80% threshold',
        'HIGH: A1C progression risk - uncontrolled diabetes trending toward insulin requirement',
        'MODERATE: Fall risk - nocturia and peripheral edema increase fall probability',
        'HIGH: Depression untreated - PHQ-9 score of 11 affecting self-care behaviors',
        'MODERATE: Cardiovascular event risk - uncontrolled HTN and hyperlipidemia'
      ],
      socialDeterminants: {
        housingStability: 'Lives alone in owned home, limited family support',
        foodSecurity: 'Fixed income limits fresh produce access',
        transportationAccess: 'Relies on daughter for medical appointments',
        socialSupport: '6th grade reading level limits self-management resources',
        educationLevel: 'No smartphone for telehealth or monitoring apps'
      },
      payerIntelligence: {
        insuranceProfile: {
          name: 'Medicare Advantage - UnitedHealthcare',
          authorizationHistory: 'Strong preventive care focus with quality bonus incentives',
          coveragePatterns: 'Approves 94% of evidence-based specialist referrals',
          preferredProviders: 'Network includes 47 endocrinologists and 12 certified diabetes educators',
          timelineExpectations: 'Average prior authorization turnaround: 2.3 business days'
        },
        strategicConsiderations: [
          'Submit prior authorization for GLP-1 agonist with clinical justification for A1C >8%',
          'Document all ICD-10 codes for full risk adjustment and quality metrics',
          'Leverage telehealth benefits for medication management and monitoring',
          'Coordinate specialty referrals to maintain continuity and prevent duplicative testing',
          'Utilize chronic care management (CCM) billing codes for care coordination services'
        ]
      }
    },
    financialSummary: {
      currentCareValue: 87500,
      historicalOutcomeValue: 32000,
      potentialQualityBonus: 42500,
      totalValueOpportunity: 162000,
      breakdown: [
        { category: 'Medication Optimization & Adherence', amount: 28000, description: 'Transition to long-acting formulations, generic substitutions, medication synchronization, adherence monitoring, elimination of $180/month OOP costs' },
        { category: 'Preventive Care & Screening', amount: 18000, description: 'Diabetic foot exams, retinal screening, annual wellness visit, cardiovascular risk assessment, cancer screenings per USPSTF guidelines' },
        { category: 'Care Coordination Services', amount: 24500, description: 'Care manager assignment, interdisciplinary team huddles, specialist coordination, transitional care management, chronic care management (CCM) billing' },
        { category: 'Chronic Disease Management', amount: 32000, description: 'Diabetes self-management education (DSME), medical nutrition therapy, endocrinology consultation, A1C optimization interventions, weight management program' },
        { category: 'Uncoded Condition Documentation', amount: 24500, description: 'Additional ICD-10 billing opportunities - depression (F33.1), obesity (E66.01), neuropathy screening, comprehensive metabolic panel abnormalities' },
        { category: 'Preventable Cost Avoidance', amount: 32000, description: 'Hospital readmission prevention, ER visit reduction, medication-related adverse event prevention, diabetic complication avoidance' },
        { category: 'Quality Measure Improvement', amount: 18000, description: 'HEDIS measure compliance (HbA1c control, BP control, statin therapy), Star Ratings bonus opportunities, pay-for-performance incentives' },
        { category: 'Social Determinants Intervention', amount: 14000, description: 'Transportation assistance, medication cost assistance programs, home safety assessment, nutrition support programs, community resource connection' }
      ],
      detailedCostAnalysis: {
        professionalServices: {
          primaryCare: { visits: 12, rate: 250, total: 3000 },
          specialists: { visits: 8, rate: 350, total: 2800 },
          ancillaryServices: { sessions: 24, rate: 150, total: 3600 }
        },
        medicationCosts: {
          chronicMedications: { count: 9, monthly: 160, total: 1920 },
          acuteMedications: { count: 2, monthly: 45, total: 540 },
          biologics: { count: 0, monthly: 0, total: 0 },
          dme: { items: 3, average: 125, total: 375 }
        },
        diagnosticCosts: {
          laboratory: 850,
          imaging: 1200,
          specializedTesting: 650,
          monitoring: 450
        },
        qualityReserve: {
          percentage: 12,
          amount: 19440,
          justification: 'Additional care needs may emerge during 90-day care plan implementation and patient engagement'
        }
      },
      marketComparatives: {
        regionalAverages: {
          perMemberPerMonth: 1420,
          episodeDurationWeeks: 12,
          qualityGrade: 'Comprehensive care coordination with evidence-based interventions'
        },
        providerComparisons: [
          { name: 'Primary Care Medical Home', estimatedCareValue: 127500, timeline: '90-day care cycle' },
          { name: 'ACO Care Coordination', estimatedCareValue: 145000, timeline: '6-month program' },
          { name: 'Integrated Care Management', estimatedCareValue: 118000, timeline: '90-day intensive phase' }
        ]
      }
    }
  }

  const handleSendReport = async () => {
    setIsSending(true)
    // Mock sending process
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsSending(false)
    setReportSent(true)
  }

  const handleDownloadPDF = async () => {
    setIsDownloading(true)

    try {
      // Prepare data for PDF generation
      const pdfData: CareSessionReportData = {
        metadata: {
          reportId: reportData.metadata.reportId,
          sessionNumber: `CS-${sessionId}`,
          generatedDate: reportData.metadata.generatedDate,
          coordinator: reportData.metadata.assessmentCoordinator,
          patient: {
            name: reportData.metadata.patient.name,
            city: 'Miami',
            state: 'FL',
            zipCode: '33101',
            type: reportData.metadata.patient.type,
            dateOfBirth: reportData.metadata.patient.dateOfBirth,
            medicalRecordNumber: reportData.metadata.patient.medicalRecordNumber,
            insuranceId: reportData.metadata.patient.insuranceId
          },
          sessionInfo: reportData.metadata.sessionInfo
        },
        executiveSummary: reportData.executiveSummary,
        assessmentAreas: reportData.assessmentAreas.map(area => ({
          ...area,
          photoCount: area.dataPointsCollected || 0,
          clinicalDescription: area.clinicalDescription,
          estimatedValue: area.estimatedCareValue || 0,
          findings: area.clinicalDescription,
          assessmentNotes: area.clinicalDescription,
          documents: [] // Would include assessment documents in production
        })),
        aiInsights: {
          ...reportData.aiInsights,
          historicalRecovery: reportData.aiInsights.historicalOutcomes || 0,
          marketComparison: reportData.aiInsights.populationComparison || 'N/A',
          riskAssessment: []
        },
        financialSummary: {
          subtotal: reportData.financialSummary.currentCareValue,
          unreportedConditions: reportData.aiInsights.unreportedConditionsEstimate,
          qualityImprovements: reportData.aiInsights.qualityImprovementOpportunities,
          contingency: Math.round(reportData.financialSummary.currentCareValue * 0.1),
          total: reportData.financialSummary.totalValueOpportunity,
          payerEstimate: reportData.metadata.sessionInfo.initialRiskScore,
          valueGap: reportData.financialSummary.totalValueOpportunity - reportData.metadata.sessionInfo.initialRiskScore
        }
      }

      // Generate PDF
      await generateCareSessionPDF(pdfData)
      setIsDownloading(false)
    } catch (error) {
      console.error('Error generating PDF:', error)
      setIsDownloading(false)
    }
  }

  const getStatusBadge = (status: string, priority: string) => {
    const baseClasses = 'px-3 py-1 rounded-full text-xs font-medium'

    if (status === 'critical' || status === 'needs-attention') {
      return priority === 'high'
        ? `${baseClasses} bg-red-100 text-red-800`
        : `${baseClasses} bg-amber-100 text-amber-800`
    }
    return `${baseClasses} bg-green-100 text-green-800`
  }

  // Show loading state while checking approval status
  if (isApproved === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-scc-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading report...</p>
        </div>
      </div>
    )
  }


  // Render healthcare-specific report for care plan data
  if (isCareplanData && storedReportData) {
    const carePlanData = storedReportData
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 print:bg-white">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 print:border-b-2 print:border-black">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
            <div className="mb-4 print:hidden">
              <Link
                href="/dashboard/care-sessions"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-300"
              >
                <ArrowLeft size={20} />
                Back to Shipments
              </Link>
            </div>

            <div className="text-center py-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 print:text-black">
                Comprehensive Care Plan Summary
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 print:text-gray-700">
                Generated by Arthur Health Intelligence Platform
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 print:text-gray-600">
                Report ID: {carePlanData.reportId} • Generated: {new Date(carePlanData.generatedDate).toLocaleDateString()}
              </p>
            </div>

            {/* Download Button at bottom of header */}
            <div className="flex justify-center mt-6 print:hidden">
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="px-6 py-3 bg-arthur-blue text-white rounded-lg hover:bg-arthur-blue-dark flex items-center gap-2 disabled:opacity-50 font-medium shadow-sm"
              >
                <Download size={18} />
                {isDownloading ? 'Generating PDF...' : 'Download PDF'}
              </button>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 print:py-4">
          {/* Patient Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 print:shadow-none print:border print:border-gray-300">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 print:text-black flex items-center gap-2">
              <User size={24} className="text-arthur-blue" />
              Patient Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 print:text-gray-700">Patient Name</label>
                <p className="text-lg font-semibold mt-1">{carePlanData.patient.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 print:text-gray-700">Medical Record Number</label>
                <p className="text-lg font-semibold mt-1">{carePlanData.patient.mrn}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 print:text-gray-700">Date of Birth</label>
                <p className="text-lg font-semibold mt-1">{carePlanData.patient.dob}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 print:text-gray-700">Age / Gender</label>
                <p className="text-lg font-semibold mt-1">{carePlanData.patient.age} years / {carePlanData.patient.gender}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 print:text-gray-700 block mb-3">Primary Diagnoses</label>
              <div className="flex flex-wrap gap-2">
                {carePlanData.patient.primaryDiagnoses?.map((diagnosis: string, idx: number) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium print:border print:border-blue-300">
                    {diagnosis}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 print:text-gray-700">Care Pathway</label>
              <p className="text-lg font-semibold mt-1 text-arthur-blue">{carePlanData.patient.carePathway}</p>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="bg-gradient-to-br from-arthur-blue/10 to-arthur-blue/5 dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 print:shadow-none print:border print:border-gray-300 print:bg-white">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 print:text-black flex items-center gap-2">
              <Star size={24} className="text-arthur-blue" />
              Executive Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 print:border print:border-gray-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="text-green-600" size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{carePlanData.careSession.completedAssessments}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Completed Assessments</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 print:border print:border-gray-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Star className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{carePlanData.careSession.qualityScore}%</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Quality Score</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 print:border print:border-gray-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <AlertCircle className="text-amber-600" size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{carePlanData.careGaps?.length || 0}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Care Gaps Identified</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 print:border print:border-gray-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <DollarSign className="text-emerald-600" size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">${carePlanData.costOptimization?.annualSavings?.toLocaleString() || 0}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Annual Savings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Assessment Areas */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 print:shadow-none print:border print:border-gray-300">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 print:text-black flex items-center gap-2">
              <FileText size={24} className="text-arthur-blue" />
              Assessment Areas
            </h2>
            <div className="space-y-4">
              {carePlanData.assessmentAreas?.map((area: any, idx: number) => (
                <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 print:break-inside-avoid">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{area.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{area.category}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {area.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Clinical Observations</label>
                      <p className="text-gray-900 dark:text-gray-100 mt-1">{area.findings}</p>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Camera size={16} />
                        {area.dataPointsCollected} data points
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText size={16} />
                        {area.recommendations?.length || 0} recommendations
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Care Gaps */}
          {carePlanData.careGaps && carePlanData.careGaps.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 print:shadow-none print:border print:border-gray-300 print:break-inside-avoid">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 print:text-black flex items-center gap-2">
                <AlertCircle size={24} className="text-amber-600" />
                Identified Care Gaps
              </h2>
              <div className="space-y-4">
                {carePlanData.careGaps.map((gap: any, idx: number) => (
                  <div key={idx} className={`border border-l-4 p-4 rounded border-gray-200 dark:border-gray-700 ${
                    gap.priority === 'High' ? 'border-l-red-500' :
                    gap.priority === 'Medium' ? 'border-l-amber-500' :
                    'border-l-blue-500'
                  } print:break-inside-avoid`}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{gap.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        gap.priority === 'High' ? 'bg-red-600 text-white' :
                        gap.priority === 'Medium' ? 'bg-amber-600 text-white' :
                        'bg-blue-600 text-white'
                      }`}>
                        {gap.priority} Priority
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{gap.description}</p>
                    <div className="text-sm text-gray-600">
                      <strong>Due:</strong> {gap.dueDate} • <strong>Action:</strong> {gap.actionable}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Referral Recommendations */}
          {carePlanData.referrals && carePlanData.referrals.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 print:shadow-none print:border print:border-gray-300 print:break-inside-avoid">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 print:text-black flex items-center gap-2">
                <UserCheck size={24} className="text-purple-600" />
                Specialist Referral Recommendations
              </h2>
              <div className="space-y-4">
                {carePlanData.referrals.map((referral: any, idx: number) => (
                  <div key={idx} className="border border-purple-200 bg-purple-50 rounded-lg p-4 print:break-inside-avoid">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{referral.specialty}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        referral.urgency === 'Urgent' ? 'bg-red-600 text-white' :
                        referral.urgency === 'Routine' ? 'bg-blue-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {referral.urgency}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{referral.reason}</p>
                    <div className="text-sm text-gray-600">
                      <strong>Timeline:</strong> {referral.timeframe}
                      {referral.preAuthRequired && <span className="ml-2 text-amber-600">• Pre-Auth Required</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cost Optimization */}
          {carePlanData.costOptimization && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 print:shadow-none print:border print:border-gray-300 print:break-inside-avoid">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 print:text-black flex items-center gap-2">
                <DollarSign size={24} className="text-emerald-600" />
                Cost Optimization Opportunities
              </h2>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Monthly Savings</p>
                    <p className="text-3xl font-bold text-emerald-600">${carePlanData.costOptimization.monthlySavings?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Annual Savings</p>
                    <p className="text-3xl font-bold text-emerald-600">${carePlanData.costOptimization.annualSavings?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {carePlanData.costOptimization.recommendations?.map((rec: any, idx: number) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 print:break-inside-avoid">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{rec.category}</h3>
                      <span className="text-emerald-600 font-bold">${rec.savings}/mo saved</span>
                    </div>
                    <p className="text-gray-700">{rec.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk Stratification */}
          {carePlanData.riskScores && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 print:shadow-none print:border print:border-gray-300 print:break-inside-avoid">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 print:text-black flex items-center gap-2">
                <TrendingUp size={24} className="text-red-600" />
                Risk Stratification
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">Readmission Risk</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div className="bg-amber-500 h-3 rounded-full" style={{ width: `${carePlanData.riskScores.readmissionRisk}%` }} />
                    </div>
                    <span className="text-lg font-bold text-amber-600">{carePlanData.riskScores.readmissionRisk}%</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">Decompensation Risk</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div className="bg-red-500 h-3 rounded-full" style={{ width: `${carePlanData.riskScores.decompensationRisk}%` }} />
                    </div>
                    <span className="text-lg font-bold text-red-600">{carePlanData.riskScores.decompensationRisk}%</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">Medication Adherence</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div className="bg-green-500 h-3 rounded-full" style={{ width: `${carePlanData.riskScores.medicationAdherence}%` }} />
                    </div>
                    <span className="text-lg font-bold text-green-600">{carePlanData.riskScores.medicationAdherence}%</span>
                  </div>
                </div>
              </div>
              {carePlanData.riskScores.socialRiskFactors && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Social Risk Factors</h4>
                  <ul className="space-y-1">
                    {carePlanData.riskScores.socialRiskFactors.map((factor: string, idx: number) => (
                      <li key={idx} className="text-gray-700 flex items-start gap-2">
                        <span className="text-red-600 mt-1">•</span>
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8 pt-6 border-t border-gray-200 print:text-gray-600">
            <p>This report was generated by Arthur Health Intelligence Platform</p>
            <p className="mt-1">Report ID: {carePlanData.reportId} • Generated: {new Date(carePlanData.generatedDate).toLocaleString()}</p>
            {carePlanData.aiEnhanced && (
              <p className="mt-2 flex items-center justify-center gap-2 text-arthur-blue">
                <Brain size={16} />
                AI-Enhanced Report
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Show not approved message if report is not approved
  if (isApproved === false) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 text-center">
          <AlertCircle size={64} className="text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Report Pending Approval</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This care session report is currently under review and has not been approved yet.
            Please complete the approval process to view the final report.
          </p>
          <Link
            href={`/dashboard/care-sessions/${sessionId}/review`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-scc-red text-white rounded-lg hover:bg-scc-red-dark transition-colors"
          >
            <ArrowLeft size={20} />
            Go to Review Page
          </Link>
        </div>
      </div>
    )
  }

  // Show the approved report
  return (
    <div className="min-h-screen">
      {/* Header - Non-printable */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-col gap-3">
            {/* Back Navigation */}
            <Link
              href={careSessionId ? `/dashboard/care-sessions/${careSessionId}` : `/dashboard/care-sessions/${sessionId}/review`}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-100 transition-colors w-fit"
            >
              <ArrowLeft size={20} />
              <span>{careSessionId ? 'Back to Care Session' : 'Back to Review'}</span>
            </Link>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg transform transition-all duration-200 text-sm sm:text-base w-full sm:w-auto ${
                  isDownloading
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-black border border-black text-white hover:bg-gray-800 hover:shadow-sm hover:scale-[1.02] cursor-pointer'
                }`}
              >
                <Download size={18} className={isDownloading ? 'animate-pulse' : ''} />
                <span>{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
              </button>
              <button
                onClick={handleSendReport}
                disabled={isSending || reportSent}
                className={`px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto ${
                  reportSent
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer disabled:opacity-50'
                }`}
              >
                {isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Sending...</span>
                  </>
                ) : reportSent ? (
                  <>
                    <CheckCircle size={18} />
                    <span>Sent</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Send to Client</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="max-w-7xl mx-auto py-3 sm:py-8 print:py-0">
        {/* Professional Cover Page - Print Only */}
        <div className="hidden print:block print:page-break-after">
          <div className="relative h-[400px] mb-8">
            {/* Healthcare Image with Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-arthur-blue/40 via-arthur-blue/20 to-transparent">
              <img
                src="https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=1200"
                alt="Healthcare"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Patient Name Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h1 className="text-4xl font-bold mb-2">Patient: {reportData?.metadata?.patient?.name || 'Margaret Thompson'}</h1>
              <p className="text-xl opacity-90">MRN: {reportData?.metadata?.patient?.medicalRecordNumber || 'MRN-784512'}</p>
            </div>
          </div>

          {/* Report Title and Details */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">COMPREHENSIVE CARE SESSION REPORT</h2>
            <div className="w-24 h-1 bg-arthur-blue mx-auto mb-8"></div>

            {/* Report Metadata Grid */}
            <div className="grid grid-cols-2 gap-8 max-w-3xl mx-auto mb-12">
              <div className="text-left">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 text-lg">PATIENT DETAILS</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Report Number:</span>
                    <span className="font-medium">{reportData?.metadata?.reportId || `CPR-${sessionId}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Assessment Date:</span>
                    <span className="font-medium">{new Date(reportData?.metadata?.generatedDate).toLocaleDateString() || new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Insurance Type:</span>
                    <span className="font-medium capitalize">{reportData.metadata.patient.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Date of Birth:</span>
                    <span className="font-medium">{reportData.metadata.patient.dateOfBirth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Insurance ID:</span>
                    <span className="font-medium">{reportData.metadata.patient.insuranceId}</span>
                  </div>
                </div>
              </div>

              <div className="text-left">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 text-lg">ASSESSMENT INFORMATION</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Care Coordinator:</span>
                    <span className="font-medium">{reportData.metadata.assessmentCoordinator}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">NPI #:</span>
                    <span className="font-medium">1234567890</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Platform:</span>
                    <span className="font-medium">Arthur Health Platform</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                    <span className="font-medium">(305) 555-0100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Email:</span>
                    <span className="font-medium">care@arthurhealth.com</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Session Information */}
            <div className="border-t border-gray-300 dark:border-gray-600 pt-8 mb-12">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 text-lg">SESSION INFORMATION</h3>
              <div className="max-w-2xl mx-auto">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Patient Name:</span>
                    <span className="font-medium">{reportData.metadata.patient.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">MRN:</span>
                    <span className="font-medium">{reportData.metadata.patient.medicalRecordNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Assessment Date:</span>
                    <span className="font-medium">{new Date(reportData.metadata.sessionInfo.sessionDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Primary Conditions:</span>
                    <span className="font-medium">{reportData.metadata.sessionInfo.conditions.join(', ')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Assessment Areas */}
            <div className="border-t border-gray-300 dark:border-gray-600 pt-8">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 text-lg">ASSESSMENT AREAS COVERED</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">Clinical Assessment</div>
                  <div className="text-gray-600 dark:text-gray-400">Vitals, Medications, Symptoms</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">Care Coordination</div>
                  <div className="text-gray-600 dark:text-gray-400">Care Plan Review, Education</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">Quality Metrics</div>
                  <div className="text-gray-600 dark:text-gray-400">HEDIS, Risk Scores, Gaps</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-8 left-0 right-0 text-center text-xs text-gray-500 dark:text-gray-400">
              <p>This report is prepared for the exclusive use of {reportData.metadata.patient.name}</p>
              <p className="mt-1">© 2024 Arthur Health Platform - AI-Enhanced Care Coordination Services</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl border border-gray-200 print:border-0 print:rounded-none print:shadow-none print:page-break-before">
          {/* Report Header */}
          <div className="p-3 sm:p-6 lg:p-8 print:p-4 border-b border-gray-200 dark:border-gray-700 print:border-gray-400 print:break-inside-avoid">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-6 print:mb-3">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2 print:mb-1 print:text-center print:uppercase">
                  Care Session Assessment Report
                </h1>
                <p className="text-sm sm:text-base print:hidden text-gray-600 dark:text-gray-400">
                  Comprehensive damage assessment with AI-enhanced analysis
                </p>
              </div>
              <div className="text-left sm:text-right flex-shrink-0 print:text-center">
                <div className="flex items-center gap-2 justify-start sm:justify-end mb-2 print:hidden">
                  <span className="px-3 py-1 bg-scc-red/10 text-scc-red text-xs rounded-full flex items-center gap-1">
                    <Brain size={12} />
                    AI Enhanced
                  </span>
                </div>
                <div className="text-xl sm:text-2xl print:text-lg font-bold text-gray-900 dark:text-gray-100 print:mb-1">
                  Report #{reportData?.metadata?.reportId || `RPT-${sessionId}`}
                </div>
                <div className="text-sm print:text-xs text-gray-600 dark:text-gray-400">
                  Date: {reportData.metadata.generatedDate}
                </div>
              </div>
            </div>

            {/* Property Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-4 sm:gap-6 print:gap-3 print:break-inside-avoid">
              <div className="print:border print:border-gray-300 dark:border-gray-600 print:p-2 print:rounded">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 print:mb-2 print:text-xs print:uppercase">Property Information</h3>
                <div className="space-y-2 print:space-y-1 text-sm print:text-[11px]">
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="break-words">{reportData.metadata.patient.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home size={16} className="text-gray-400 flex-shrink-0" />
                    <span>
                      {reportData.metadata.patient.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400 flex-shrink-0" />
                    <span className="break-words">MRN: {reportData.metadata.patient.medicalRecordNumber}</span>
                  </div>
                </div>
              </div>

              <div className="print:border print:border-gray-300 dark:border-gray-600 print:p-2 print:rounded">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 print:mb-2 print:text-xs print:uppercase">Claim Information</h3>
                <div className="space-y-2 print:space-y-1 text-sm print:text-[11px]">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Insurance ID:</span> {reportData.metadata.patient.insuranceId}
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Assessment Date:</span> {new Date(reportData.metadata.sessionInfo.sessionDate).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Conditions:</span> {reportData.metadata.sessionInfo.conditions.join(', ')}
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Coordinator:</span> {reportData.metadata.assessmentCoordinator}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Executive Summary - Optimized for Print */}
          <div className="p-3 sm:p-6 lg:p-8 print:p-4 border-b border-gray-200 dark:border-gray-700 print:border-gray-400 print:break-inside-avoid print:page-break-inside-avoid">
            <h2 className="text-lg sm:text-2xl print:text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-6 print:mb-3 print:text-center">EXECUTIVE SUMMARY</h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 print:grid-cols-4 gap-2 sm:gap-4 lg:gap-6 print:gap-2 mb-3 sm:mb-6 print:mb-3">
              <div className="bg-gray-50 rounded-lg sm:rounded-xl print:rounded p-2 sm:p-4 print:p-2 print:bg-white dark:bg-gray-900 print:border print:border-gray-400">
                <div className="text-[10px] sm:text-xs print:text-[10px] text-gray-600 dark:text-gray-400 print:text-center print:uppercase print:font-medium mb-1">Total Care Gap Value</div>
                <div className="text-lg sm:text-2xl lg:text-3xl print:text-base font-bold text-gray-900 dark:text-gray-100 print:text-center">
                  ${reportData.executiveSummary.totalValueOpportunity.toLocaleString()}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg sm:rounded-xl print:rounded p-2 sm:p-4 print:p-2 print:bg-white dark:bg-gray-900 print:border print:border-gray-400">
                <div className="text-[10px] sm:text-xs print:text-[10px] text-gray-600 dark:text-gray-400 print:text-center print:uppercase print:font-medium mb-1">Critical Care Gaps</div>
                <div className="text-lg sm:text-2xl lg:text-3xl print:text-base font-bold text-red-600 print:text-gray-900 dark:text-gray-100 print:text-center">
                  {reportData.executiveSummary.criticalFindings}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg sm:rounded-xl print:rounded p-2 sm:p-4 print:p-2 print:bg-white dark:bg-gray-900 print:border print:border-gray-400">
                <div className="text-[10px] sm:text-xs print:text-[10px] text-gray-600 dark:text-gray-400 print:text-center print:uppercase print:font-medium mb-1">Assessment Confidence</div>
                <div className="text-lg sm:text-2xl lg:text-3xl print:text-base font-bold text-green-600 print:text-gray-900 dark:text-gray-100 print:text-center">
                  {reportData.executiveSummary.confidenceScore}%
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg sm:rounded-xl print:rounded p-2 sm:p-4 print:p-2 print:bg-white dark:bg-gray-900 print:border print:border-gray-400">
                <div className="text-[10px] sm:text-xs print:text-[10px] text-gray-600 dark:text-gray-400 print:text-center print:uppercase print:font-medium mb-1">Care Plan Timeline</div>
                <div className="text-lg sm:text-2xl lg:text-3xl print:text-base font-bold text-gray-900 dark:text-gray-100 print:text-center">
                  {reportData.executiveSummary.timelineEstimate.split(' ')[0]}
                </div>
              </div>
            </div>

            {/* Estimated Care Value Banner - Formal Style */}
            <div className="bg-gray-50 border border-gray-300 rounded-xl p-4 sm:p-6 mb-6 print:mb-4 print:border-2 print:border-gray-400 print:bg-white dark:bg-gray-900">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 text-sm sm:text-base print:text-sm print:uppercase print:text-center">
                ESTIMATED CARE VALUE
              </h3>
              <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
                <div className="text-center">
                  <div className="text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium mb-1 print:text-[10px] print:uppercase print:font-bold">
                    IMMEDIATE
                  </div>
                  <div className="text-sm sm:text-lg md:text-xl lg:text-3xl font-bold text-red-600 print:text-gray-900 dark:text-gray-100 print:text-base">
                    ${(reportData.executiveSummary.totalValueOpportunity * 0.25).toLocaleString()}
                  </div>
                  <div className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mt-1 print:hidden">
                    0-30 days
                  </div>
                </div>
                <div className="text-center border-x border-gray-300 dark:border-gray-600 print:border-gray-400">
                  <div className="text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium mb-1 print:text-[10px] print:uppercase print:font-bold">
                    SHORT-TERM
                  </div>
                  <div className="text-sm sm:text-lg md:text-xl lg:text-3xl font-bold text-blue-600 print:text-gray-900 dark:text-gray-100 print:text-base">
                    ${(reportData.executiveSummary.totalValueOpportunity * 0.45).toLocaleString()}
                  </div>
                  <div className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mt-1 print:hidden">
                    1-3 months
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium mb-1 print:text-[10px] print:uppercase print:font-bold">
                    LONG-TERM
                  </div>
                  <div className="text-sm sm:text-lg md:text-xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 print:text-base">
                    ${(reportData.executiveSummary.totalValueOpportunity * 0.30).toLocaleString()}
                  </div>
                  <div className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mt-1 print:hidden">
                    3+ months
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-300 dark:border-gray-600 print:border-gray-400">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium print:text-[10px] print:uppercase print:font-bold">
                    TOTAL ESTIMATED CARE VALUE
                  </span>
                  <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 print:text-base">
                    ${reportData.executiveSummary.totalValueOpportunity.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Critical Findings Identified - Better Visual Hierarchy */}
            <div className="bg-gray-50 dark:bg-gray-900 border-l-4 border-red-500 rounded-lg p-4 sm:p-6 mb-6 print:mb-4">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="text-red-600" size={24} />
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  <span className="text-red-600">{reportData.executiveSummary.criticalFindings}</span> Critical Care Gaps Identified
                </h3>
              </div>

              <div className="space-y-3">
                {/* Vitals & Measurements */}
                <div className="border-l-2 border-gray-300 dark:border-gray-600 pl-4">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-700 dark:text-gray-300 font-semibold">Vitals & Blood Pressure:</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <span className="text-red-600 font-medium">Stage 2 Hypertension</span> at 158/94 mmHg (target: &lt;130/80).
                    Blood glucose shows <span className="text-red-600 font-medium">uncontrolled diabetes</span> with A1C of 8.2%.
                    BMI of 32.4 indicates obesity requiring intervention.
                  </p>
                </div>

                {/* Medication Adherence */}
                <div className="border-l-2 border-gray-300 dark:border-gray-600 pl-4">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-700 dark:text-gray-300 font-semibold">Medication Adherence:</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Patient shows <span className="text-blue-600 font-medium">68% adherence rate</span> below 80% threshold.
                    Polypharmacy with 9 active medications creates <span className="text-blue-600 font-medium">complexity burden</span>.
                    Cost barriers affecting statin therapy compliance.
                  </p>
                </div>

                {/* Symptom Assessment */}
                <div className="border-l-2 border-gray-300 dark:border-gray-600 pl-4">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-700 dark:text-gray-300 font-semibold">Clinical Symptoms:</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <span className="text-blue-600 font-medium">Moderate depression</span> with PHQ-9 score of 11.
                    Nocturia 3-4 times nightly affecting sleep quality. Dyspnea on exertion requires <span className="text-blue-600 font-medium">cardiology evaluation</span>.
                  </p>
                </div>

                {/* Care Coordination */}
                <div className="border-l-2 border-gray-300 dark:border-gray-600 pl-4">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-700 dark:text-gray-300 font-semibold">Care Coordination:</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Lack of coordination between 3 specialists <span className="text-red-600 font-medium">creating care gaps</span>.
                    Overdue preventive screenings. Patient had <span className="text-red-600 font-medium">2 ER visits in 6 months</span> for preventable conditions.
                  </p>
                </div>

                {/* Patient Education */}
                <div className="border-l-2 border-gray-300 dark:border-gray-600 pl-4">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-700 dark:text-gray-300 font-semibold">Patient Education & Self-Management:</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Significant knowledge gaps in <span className="text-blue-600 font-medium">diabetes self-management</span>.
                    6th grade health literacy level. Unable to demonstrate proper glucose monitoring technique.
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Immediate Actions Required:</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                    <CheckCircle size={14} />
                    Medication therapy management
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-blue-700 text-xs font-medium">
                    <CheckCircle size={14} />
                    Schedule specialist referrals
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                    <CheckCircle size={14} />
                    Enroll in care coordination program
                  </span>
                </div>
              </div>
            </div>

            <div className="print:break-inside-avoid">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 print:mb-2 print:text-sm print:uppercase">Priority Clinical Recommendations</h3>
              <ul className="space-y-2 print:space-y-1">
                {reportData.executiveSummary.clinicalRecommendations.slice(0, 4).map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 print:text-xs">
                    <span className="text-gray-700 dark:text-gray-300 mt-0.5 flex-shrink-0 print:font-medium">•</span>
                    <AlertTriangle className="text-amber-500 mt-0.5 flex-shrink-0 hidden print:hidden" size={16} />
                    <span className="text-gray-700 dark:text-gray-300 print:text-xs print:leading-tight">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Area Findings */}
          <div className="p-3 sm:p-6 lg:p-8 border-b border-gray-200 dark:border-gray-700 print:border-black">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-6">Detailed Area Findings</h2>
            
            <div className="space-y-3 sm:space-y-6">
              {(reportData?.assessmentAreas || []).map((area, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-900 rounded-lg sm:rounded-xl p-3 sm:p-6 print:bg-transparent print:border">
                  {/* Mobile-optimized header with prominent repair cost */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3 sm:mb-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">{area.area}</h3>
                        {/* Status Badge - Moved to top right on mobile */}
                        <span className={`${getStatusBadge(area.status, area.priority)} text-xs sm:text-sm inline-block sm:hidden uppercase`}>
                          {area.priority}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{area.category}</p>
                      {/* Status Badge - Desktop position */}
                      <span className={`${getStatusBadge(area.status, area.priority)} text-xs sm:text-sm hidden sm:inline-block mt-2 uppercase`}>
                        {area.priority}
                      </span>
                    </div>
                    {/* Repair Estimate - Now separate and prominent */}
                    <div className="bg-scc-red text-white px-3 py-1.5 rounded-lg w-full sm:w-auto">
                      <span className="text-xs font-medium">Repair Estimate:</span>
                      <span className="text-base sm:text-lg font-bold ml-1 block sm:inline">
                        ${area.estimatedCareValue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs sm:text-base text-gray-700 dark:text-gray-300 mb-3 sm:mb-4">{area.clinicalDescription}</p>
                  
                  {/* Technical Findings */}
                  {area.clinicalFindings && (
                    <div className="bg-blue-50 rounded-lg p-2 sm:p-4 mb-3 sm:mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2 text-sm sm:text-base">
                        <Brain size={16} className="text-blue-600" />
                        Technical Analysis
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                        {Object.entries(area.clinicalFindings).map(([key, value]) => (
                          <div key={key} className="flex flex-col sm:flex-row sm:justify-between gap-1">
                            <span className="text-gray-600 dark:text-gray-400 capitalize font-medium sm:font-normal">{key.replace(/([A-Z])/g, ' $1')}:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100 break-words">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Medications */}
                  {area.medications && (
                    <div className="bg-green-50 rounded-lg p-2 sm:p-4 mb-3 sm:mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2 text-sm sm:text-base">
                        <Building2 size={16} className="text-green-600" />
                        Current Medications
                      </h4>
                      <div className="grid grid-cols-1 gap-2 text-xs sm:text-sm">
                        {Object.entries(area.medications).map(([key, value]) => (
                          <div key={key} className="flex flex-col sm:block">
                            <span className="text-gray-600 dark:text-gray-400 capitalize font-medium">{key}:</span>
                            <span className="text-gray-900 dark:text-gray-100 sm:ml-2 break-words">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Risk Factors */}
                  {area.riskFactors && area.riskFactors.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 sm:p-4 mb-3 sm:mb-4">
                      <h4 className="font-medium text-amber-800 mb-3 flex items-center gap-2">
                        <AlertTriangle size={16} className="text-amber-600" />
                        Risk Factors
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        {area.riskFactors.map((risk, idx) => (
                          <div key={idx} className="text-amber-800">
                            • {risk}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Symptoms Reported */}
                  {area.symptomsReported && area.symptomsReported.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-4 mb-3 sm:mb-4">
                      <h4 className="font-medium text-red-800 mb-3 flex items-center gap-2">
                        <AlertTriangle size={16} className="text-red-600" />
                        Symptoms Reported
                      </h4>
                      <ul className="space-y-2 text-sm">
                        {area.symptomsReported.map((symptom, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-red-700">{symptom}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Lab Results */}
                  {area.labResults && Object.keys(area.labResults).length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 sm:p-4 mb-3 sm:mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Lab Results</h4>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        {Object.entries(area.labResults).map(([key, value], idx) => (
                          <div key={idx} className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400 capitalize">{key}:</span>
                            <span className="text-gray-900 dark:text-gray-100 font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Documentation</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Camera size={16} />
                        <span>{area.dataPointsCollected} data points collected</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Priority Recommendations</h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {area.recommendations.map((rec, recIdx) => (
                          <li key={recIdx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-scc-red rounded-full mt-2 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="p-3 sm:p-6 lg:p-8 border-b border-gray-200 dark:border-gray-700 print:border-black">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-6">AI-Enhanced Analysis</h2>
            
            <div className="space-y-3 sm:space-y-6">
              <div className="bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-6 print:bg-transparent print:border">
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="text-blue-600" size={24} />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Undetected Conditions Assessment</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      AI analysis of clinical patterns and patient characteristics suggests additional unreported chronic conditions.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Population Comparison:</strong> {reportData.aiInsights.populationComparison}
                    </p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      ${reportData.aiInsights.unreportedConditionsEstimate.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Estimated Unreported Conditions Value</div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 rounded-lg sm:rounded-xl p-3 sm:p-6 print:bg-transparent print:border">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="text-amber-600" size={24} />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Risk Assessment</h3>
                </div>
                <ul className="space-y-2">
                  {reportData.aiInsights.riskAssessment.map((risk, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* AI Intelligence & Predictive Analytics */}
          <div className="p-3 sm:p-6 lg:p-8 border-b border-gray-200 dark:border-gray-700 print:border-black">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6 flex items-center gap-3">
              <Brain className="text-blue-600" size={28} />
              AI Intelligence & Predictive Analytics
            </h2>

            {/* Confidence Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {reportData.aiInsights.confidenceMetrics.conditionPrediction}%
                </div>
                <div className="text-sm text-blue-700">Condition Prediction</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {reportData.aiInsights.confidenceMetrics.costAccuracy}%
                </div>
                <div className="text-sm text-green-700">Cost Accuracy</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {reportData.aiInsights.confidenceMetrics.timelineReliability}%
                </div>
                <div className="text-sm text-purple-700">Timeline Reliability</div>
              </div>
              <div className="bg-red-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {reportData.aiInsights.confidenceMetrics.riskAssessment}%
                </div>
                <div className="text-sm text-red-700">Risk Assessment</div>
              </div>
            </div>

            {/* Historical Data Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <History size={20} className="text-gray-600 dark:text-gray-400" />
                  Historical Care Session Data
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Similar Cases Analyzed:</span>
                    <span className="font-semibold">{reportData.aiInsights.historicalData.similarCases}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Average Outcome Value:</span>
                    <span className="font-semibold text-green-600">
                      ${reportData.aiInsights.historicalData.averageOutcome.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Time to Stabilization:</span>
                    <span className="font-semibold">{reportData.aiInsights.historicalData.timeToStabilization}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Service Appeal Rate:</span>
                    <span className="font-semibold text-red-600">{reportData.aiInsights.historicalData.readmissionRate}</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <TrendingUp size={20} className="text-amber-600" />
                  Predictive Analysis
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Additional Condition Risk:</span>
                    <div className="text-amber-700">{reportData.aiInsights.predictiveAnalysis.additionalConditionRisk}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Cost Trend Factor:</span>
                    <div className="text-amber-700">{reportData.aiInsights.predictiveAnalysis.costTrendFactor}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Specialist Availability:</span>
                    <div className="text-amber-700">{reportData.aiInsights.predictiveAnalysis.specialistAvailability}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Provider Capacity:</span>
                    <div className="text-amber-700">{reportData.aiInsights.predictiveAnalysis.providerCapacity}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Environmental & Risk Assessment */}
          <div className="p-3 sm:p-6 lg:p-8 border-b border-gray-200 dark:border-gray-700 print:border-black">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6 flex items-center gap-3">
              <Globe size={28} className="text-green-600" />
              Environmental & Risk Assessment
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Environmental Factors */}
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Social Determinants of Health</h3>
                <div className="space-y-3 text-sm">
                  {Object.entries(reportData.aiInsights.socialDeterminants).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="font-medium text-green-700">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comprehensive Risk Matrix */}
              <div className="bg-red-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Comprehensive Risk Matrix</h3>
                <div className="space-y-3">
                  {reportData.aiInsights.riskAssessment.map((risk, idx) => {
                    const riskLevel = risk.includes('CRITICAL') ? 'critical' : risk.includes('HIGH') ? 'high' : 'moderate'
                    const colorClass = riskLevel === 'critical' ? 'text-red-800' : riskLevel === 'high' ? 'text-scc-red-dark' : 'text-yellow-700'
                    const bgClass = riskLevel === 'critical' ? 'bg-red-100' : riskLevel === 'high' ? 'bg-red-100' : 'bg-yellow-100'
                    
                    return (
                      <div key={idx} className={`${bgClass} rounded-lg p-3`}>
                        <div className={`text-xs font-bold ${colorClass} mb-1`}>
                          {risk.split(':')[0]}
                        </div>
                        <div className={`text-sm ${colorClass}`}>
                          {risk.split(':')[1]}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Claims Intelligence & Strategy */}
          <div className="p-3 sm:p-6 lg:p-8 border-b border-gray-200 dark:border-gray-700 print:border-black">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6 flex items-center gap-3">
              <Target size={28} className="text-purple-600" />
              Claims Intelligence & Strategy
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Carrier Intelligence */}
              <div className="bg-purple-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Shield size={20} className="text-purple-600" />
                  Payer Intelligence Profile
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-purple-700 font-medium">Insurance Plan:</span>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{reportData.aiInsights.payerIntelligence.insuranceProfile.name}</div>
                  </div>
                  <div>
                    <span className="text-purple-700 font-medium">Authorization History:</span>
                    <div className="text-sm text-gray-700 dark:text-gray-300">{reportData.aiInsights.payerIntelligence.insuranceProfile.authorizationHistory}</div>
                  </div>
                  <div>
                    <span className="text-purple-700 font-medium">Coverage Patterns:</span>
                    <div className="text-sm text-gray-700 dark:text-gray-300">{reportData.aiInsights.payerIntelligence.insuranceProfile.coveragePatterns}</div>
                  </div>
                  <div>
                    <span className="text-purple-700 font-medium">Timeline Expectations:</span>
                    <div className="text-sm text-gray-700 dark:text-gray-300">{reportData.aiInsights.payerIntelligence.insuranceProfile.timelineExpectations}</div>
                  </div>
                </div>
              </div>

              {/* Strategic Recommendations */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Lightbulb size={20} className="text-blue-600" />
                  Strategic Considerations
                </h3>
                <div className="space-y-3">
                  {reportData.aiInsights.payerIntelligence?.strategicConsiderations?.map((strategy, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                        {idx + 1}
                      </div>
                      <div className="text-sm text-blue-800">{strategy}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quality Assurance Metrics */}
          <div className="p-3 sm:p-6 lg:p-8 border-b border-gray-200 dark:border-gray-700 print:border-black">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6 flex items-center gap-3">
              <Award size={28} className="text-green-600" />
              Quality Assurance & Compliance Metrics
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
                <div className="text-sm font-medium text-green-700">HIPAA Compliance Review</div>
                <div className="text-xs text-green-600">Protected Health Information Security</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">NCQA</div>
                <div className="text-sm font-medium text-blue-700">Accredited Standards</div>
                <div className="text-xs text-blue-600">Care Coordination Certification</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">5-Star</div>
                <div className="text-sm font-medium text-purple-700">Quality Rating</div>
                <div className="text-xs text-purple-600">CMS Star Ratings Program</div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Assessment Methodology</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Technology Utilized</h4>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Electronic Health Records (Epic Systems)</li>
                    <li>• Clinical decision support tools</li>
                    <li>• Patient engagement platforms</li>
                    <li>• Care coordination software (Arthur Health)</li>
                    <li>• Telehealth infrastructure</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Standards Compliance</h4>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• HEDIS Quality Measures</li>
                    <li>• CMS Star Ratings Methodology</li>
                    <li>• NCQA Care Coordination Standards</li>
                    <li>• AMA Clinical Guidelines</li>
                    <li>• HIPAA Privacy & Security Rules</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Comprehensive Financial Analysis */}
          <div className="p-3 sm:p-6 lg:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6 flex items-center gap-3">
              <DollarSign className="text-green-600" size={28} />
              Comprehensive Financial Analysis
            </h2>
            
            {/* Executive Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  ${reportData.financialSummary.currentCareValue.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Current Claim Value</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  +${reportData.financialSummary.historicalOutcomeValue.toLocaleString()}
                </div>
                <div className="text-sm text-green-700">Historical Recovery</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  +${reportData.financialSummary.potentialQualityBonus.toLocaleString()}
                </div>
                <div className="text-sm text-blue-700">Supplemental Potential</div>
              </div>
              <div className="bg-scc-red text-white rounded-xl p-4">
                <div className="text-2xl font-bold mb-1">
                  ${reportData.financialSummary.totalValueOpportunity.toLocaleString()}
                </div>
                <div className="text-sm opacity-90">Total Recovery</div>
              </div>
            </div>

            {/* Detailed Cost Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Labor Cost Analysis */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <User className="text-blue-600" size={20} />
                  Professional Services Analysis
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">Primary Care Visits</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {reportData.financialSummary.detailedCostAnalysis.professionalServices.primaryCare.visits} visits @ ${reportData.financialSummary.detailedCostAnalysis.professionalServices.primaryCare.rate}/visit
                      </div>
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      ${reportData.financialSummary.detailedCostAnalysis.professionalServices.primaryCare.total.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">Specialist Visits</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {reportData.financialSummary.detailedCostAnalysis.professionalServices.specialists.visits} visits @ ${reportData.financialSummary.detailedCostAnalysis.professionalServices.specialists.rate}/visit
                      </div>
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      ${reportData.financialSummary.detailedCostAnalysis.professionalServices.specialists.total.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">Ancillary Services</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {reportData.financialSummary.detailedCostAnalysis.professionalServices.ancillaryServices.sessions} sessions @ ${reportData.financialSummary.detailedCostAnalysis.professionalServices.ancillaryServices.rate}/session
                      </div>
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      ${reportData.financialSummary.detailedCostAnalysis.professionalServices.ancillaryServices.total.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Medication Cost Analysis */}
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Building2 className="text-green-600" size={20} />
                  Medication Cost Analysis
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">Chronic Medications</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {reportData.financialSummary.detailedCostAnalysis.medicationCosts.chronicMedications.count} medications @ ${reportData.financialSummary.detailedCostAnalysis.medicationCosts.chronicMedications.monthly}/month
                      </div>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      ${reportData.financialSummary.detailedCostAnalysis.medicationCosts.chronicMedications.total.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">Acute Medications</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {reportData.financialSummary.detailedCostAnalysis.medicationCosts.acuteMedications.count} medications @ ${reportData.financialSummary.detailedCostAnalysis.medicationCosts.acuteMedications.monthly}/month
                      </div>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      ${reportData.financialSummary.detailedCostAnalysis.medicationCosts.acuteMedications.total.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">DME & Supplies</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {reportData.financialSummary.detailedCostAnalysis.medicationCosts.dme.items} items @ ${reportData.financialSummary.detailedCostAnalysis.medicationCosts.dme.average}/item
                      </div>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      ${reportData.financialSummary.detailedCostAnalysis.medicationCosts.dme.total.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnostic Costs & Quality Reserve */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-purple-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Diagnostic Costs</h3>
                <div className="space-y-2">
                  {Object.entries(reportData.financialSummary.detailedCostAnalysis.diagnosticCosts).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="font-semibold text-purple-600">${value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quality Reserve</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Reserve Percentage:</span>
                    <span className="font-semibold text-amber-600">{reportData.financialSummary.detailedCostAnalysis.qualityReserve.percentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Reserve Amount:</span>
                    <span className="font-semibold text-amber-600">${reportData.financialSummary.detailedCostAnalysis.qualityReserve.amount.toLocaleString()}</span>
                  </div>
                  <div className="mt-3 text-sm text-amber-700">
                    <strong>Justification:</strong> {reportData.financialSummary.detailedCostAnalysis.qualityReserve.justification}
                  </div>
                </div>
              </div>
            </div>

            {/* Market Analysis & Provider Comparisons */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <TrendingUp className="text-gray-600 dark:text-gray-400" size={20} />
                  Regional Market Analysis
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Per Member Per Month:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">${reportData.financialSummary.marketComparatives.regionalAverages.perMemberPerMonth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Episode Duration:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{reportData.financialSummary.marketComparatives.regionalAverages.episodeDurationWeeks} weeks</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Quality Standard:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{reportData.financialSummary.marketComparatives.regionalAverages.qualityGrade}</span>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Provider Comparisons</h3>
                <div className="space-y-3">
                  {(reportData.financialSummary.marketComparatives.providerComparisons || []).map((provider, idx) => (
                    <div key={idx} className="border border-indigo-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{provider.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Timeline: {provider.timeline}</div>
                        </div>
                        <div className="text-lg font-bold text-indigo-600">
                          ${provider.estimatedCareValue.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Comprehensive Cost Breakdown by Category</h3>
              <div className="space-y-4">
                {reportData.financialSummary.breakdown.map((item, idx) => (
                  <div key={idx} className="border-l-4 border-blue-600 pl-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-gray-100 text-base">{item.category}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</div>
                      </div>
                      <div className="text-xl font-bold text-blue-600 flex-shrink-0">
                        ${item.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Total Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center bg-blue-600 text-white rounded-lg p-4">
                  <span className="text-lg font-semibold">Total Care Value Opportunity</span>
                  <span className="text-2xl font-bold">
                    ${reportData.financialSummary.totalValueOpportunity.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Undetected Conditions Intelligence */}
          <div className="p-3 sm:p-6 lg:p-8 border-b border-gray-200 dark:border-gray-700 print:border-black">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">Undetected Conditions Analysis & Discovery</h2>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-amber-600 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-amber-800 mb-2">Critical Discovery: $24,500 in Unreported Chronic Conditions</h3>
                    <p className="text-amber-700 text-sm">AI analysis and comprehensive assessment revealed significant unreported conditions not documented in previous care encounters. This represents additional quality improvement and reimbursement opportunities.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Detailed Undetected Conditions Breakdown</h3>
                  <div className="space-y-4">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Undiagnosed Depression</h4>
                        <span className="text-lg font-bold text-blue-600">$3,200</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Moderate depressive symptoms uncaptured in claims</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400"><strong>Evidence:</strong> PHQ-9 score of 12 during session, no prior depression diagnosis in history</p>
                    </div>

                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Chronic Kidney Disease Stage 3</h4>
                        <span className="text-lg font-bold text-blue-600">$8,400</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Reduced kidney function requiring monitoring</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400"><strong>Evidence:</strong> eGFR 42 ml/min, albumin/creatinine ratio elevated at 180 mg/g</p>
                    </div>

                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Uncontrolled Hypertension</h4>
                        <span className="text-lg font-bold text-blue-600">$5,800</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Stage 2 hypertension not reflected in risk score</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400"><strong>Evidence:</strong> BP readings averaging 168/94 over 3 sessions, no diagnosis code submitted</p>
                    </div>

                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Diabetic Neuropathy</h4>
                        <span className="text-lg font-bold text-blue-600">$7,100</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Peripheral neuropathy with sensory deficits</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400"><strong>Evidence:</strong> Monofilament test shows reduced sensation in 6 of 10 sites bilaterally</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Detection Methods & Technology</h3>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Clinical Assessment Tools</h4>
                      <p className="text-sm text-blue-800">Standardized screening instruments (PHQ-9, GAD-7, AUDIT-C) identified previously undetected mental health and substance use conditions.</p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 mb-2">Laboratory Analysis</h4>
                      <p className="text-sm text-green-800">Comprehensive metabolic panel and HbA1c testing revealed kidney dysfunction and diabetes complications not reflected in claims.</p>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-medium text-purple-900 mb-2">Physical Examination</h4>
                      <p className="text-sm text-purple-800">Detailed neurological and vascular assessment identified diabetic neuropathy and peripheral artery disease.</p>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h4 className="font-medium text-amber-900 mb-2">AI Pattern Recognition</h4>
                      <p className="text-sm text-amber-800">Machine learning algorithms identified clinical patterns consistent with 247 similar patients, predicting additional conditions with 91% accuracy.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Market Intelligence & Comparable Analysis */}
            <div className="p-3 sm:p-6 lg:p-8 border-b border-gray-200 dark:border-gray-700 print:border-black">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">Market Intelligence & Settlement Analysis</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-green-50 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">$315,000</div>
                  <div className="text-sm text-green-700">Average Settlement</div>
                  <div className="text-xs text-green-600 mt-1">Based on 127 similar claims</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">$385,000</div>
                  <div className="text-sm text-blue-700">Top Quartile Settlement</div>
                  <div className="text-xs text-blue-600 mt-1">Achievable with proper strategy</div>
                </div>
                <div className="bg-scc-red/10 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-scc-red mb-2">89%</div>
                  <div className="text-sm text-scc-red">Success Rate</div>
                  <div className="text-xs text-scc-red mt-1">Appeals result in additional payment</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Comparable Patient Analysis</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div>
                        <div className="font-medium">Patient MRN-2847 (Diabetes + HTN)</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Similar clinical profile, age 68, Medicare Advantage</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">$28,400</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">HCC uplift 2023</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div>
                        <div className="font-medium">Patient MRN-3621 (CKD + CHF)</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Chronic kidney disease + heart failure, age 72, Medicare</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">$31,200</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Settled 2023</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div>
                        <div className="font-medium">567 Bay Road (Hurricane + Flood)</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Combined perils, 2007 construction</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">$425,000</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Settled 2024</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Key Population Health Insights</h4>
                    <ul className="space-y-1 text-sm text-blue-800">
                      <li>• Patients with documented behavioral health conditions average 23% higher HCC scores</li>
                      <li>• Chronic kidney disease coding increases RAF scores by avg. 0.28 points</li>
                      <li>• Laboratory evidence improves condition capture success by 34%</li>
                      <li>• Previous assessment gaps add avg. 18% to current quality performance</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Negotiation Leverage Points</h3>
                  <div className="space-y-4">
                    <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-green-900">Code Violation Requirements</h4>
                        <span className="text-lg font-bold text-green-600">$15,000</span>
                      </div>
                      <p className="text-sm text-green-800">New clinical guidelines require comprehensive diabetes and hypertension management</p>
                    </div>
                    
                    <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-red-900">Health Safety Mandate</h4>
                        <span className="text-lg font-bold text-red-600">$25,000</span>
                      </div>
                      <p className="text-sm text-red-800">State requires professional mold remediation for detected levels</p>
                    </div>

                    <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-blue-900">Ordinance & Law Coverage</h4>
                        <span className="text-lg font-bold text-blue-600">$18,000</span>
                      </div>
                      <p className="text-sm text-blue-800">Policy includes coverage for code compliance upgrades</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-scc-red/10 border border-scc-red/30 rounded-lg">
                    <h4 className="font-medium text-scc-red mb-2">Strategic Recommendation</h4>
                    <p className="text-sm text-gray-800 mb-2">Open negotiations at <strong>$465,000</strong> with documentation supporting all leverage points.</p>
                    <p className="text-xs text-scc-red-dark">Settlement floor: $385,000 | Optimal range: $415,000-$445,000</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Historical Claims Recovery */}
            <div className="p-3 sm:p-6 lg:p-8 border-b border-gray-200 dark:border-gray-700 print:border-black">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">Historical Claims Recovery Analysis</h2>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <History className="text-yellow-600 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-yellow-800 mb-2">Opportunity: $39,500 in Historical Underpayments</h3>
                    <p className="text-yellow-700 text-sm">Analysis of previous claims reveals systematic underpayments. Florida allows reopening of claims up to 3 years post-settlement for additional review.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Previous Claims Analysis</h3>
                  
                  {/* Mobile-optimized card view for small screens */}
                  <div className="block sm:hidden space-y-4">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">2022-09-28</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Annual Wellness Visit</div>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Reopenable</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Original:</span>
                          <span className="font-medium">$45,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Current:</span>
                          <span className="font-medium text-blue-600">$68,000</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                          <span className="text-gray-600 dark:text-gray-400">Underpayment:</span>
                          <span className="font-bold text-red-600">$23,000</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">2021-07-15</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Chronic Care Visit</div>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Reopenable</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Original:</span>
                          <span className="font-medium">$8,500</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Current:</span>
                          <span className="font-medium text-blue-600">$15,000</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                          <span className="text-gray-600 dark:text-gray-400">Underpayment:</span>
                          <span className="font-bold text-red-600">$6,500</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">2020-03-10</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Preventive Care Visit</div>
                        </div>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Time Sensitive</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Original:</span>
                          <span className="font-medium">$12,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Current:</span>
                          <span className="font-medium text-blue-600">$22,000</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                          <span className="text-gray-600 dark:text-gray-400">Underpayment:</span>
                          <span className="font-bold text-red-600">$10,000</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Desktop table view - hidden on mobile */}
                  <div className="hidden sm:block overflow-x-auto -mx-4 sm:mx-0">
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Date</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Type</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Original Payout</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Current Value</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Underpayment</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white dark:bg-gray-900">
                          <tr>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">2022-09-28</td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Annual Wellness Visit</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100 whitespace-nowrap">$45,000</td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-blue-600 whitespace-nowrap">$68,000</td>
                            <td className="px-4 py-3 text-sm text-right font-bold text-red-600 whitespace-nowrap">$23,000</td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Reopenable</span>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">2021-07-15</td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Chronic Care Visit</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100 whitespace-nowrap">$8,500</td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-blue-600 whitespace-nowrap">$15,000</td>
                            <td className="px-4 py-3 text-sm text-right font-bold text-red-600 whitespace-nowrap">$6,500</td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Reopenable</span>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">2020-03-10</td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Preventive Care Visit</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100 whitespace-nowrap">$12,000</td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-blue-600 whitespace-nowrap">$22,000</td>
                            <td className="px-4 py-3 text-sm text-right font-bold text-red-600 whitespace-nowrap">$10,000</td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Time Sensitive</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-green-900 mb-3">Care Optimization Strategy</h4>
                    <ul className="space-y-2 text-sm text-green-800">
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Submit updated diagnosis codes for newly identified chronic conditions within billing cycle</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Present population health data showing systematic gaps in risk-adjusted coding</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Leverage clinical findings to justify HCC recapture and quality measure improvement</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Coordinate timing with current claim for maximum negotiation leverage</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-blue-900 mb-3">Timeline & Actions</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <div className="font-medium text-blue-900">Week 1-2: Documentation Gathering</div>
                          <div className="text-sm text-blue-700">Collect all previous claim files, photos, and settlements</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <div className="font-medium text-blue-900">Week 3-4: Market Analysis</div>
                          <div className="text-sm text-blue-700">Complete comparative analysis and valuation reports</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <div className="font-medium text-blue-900">Week 5-6: Filing & Negotiation</div>
                          <div className="text-sm text-blue-700">Submit supplemental claims and begin negotiations</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700 print:border-black">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <div>
                  Report generated by SCC Intelligence Platform
                </div>
                <div>
                  Confidence Score: {reportData.executiveSummary.confidenceScore}% • Page 1 of 1
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}