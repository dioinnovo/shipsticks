'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AIProcessingOverlay } from '@/components/ui/ai-processing-overlay'
import {
  inspectionMediaData,
  inspectionSummary,
  getTotalEstimatedDamage
} from '@/lib/inspection-media'

export default function CompleteCareSessionPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string
  const [isProcessing, setIsProcessing] = useState(true)

  const handleProcessingComplete = useCallback(() => {
    // Generate a unique report ID
    const reportId = `RPT-${Date.now()}`

    // Store care session data in sessionStorage for the report page
    const reportData = {
      sessionId,
      reportId,
      status: 'pending_approval',
      generatedAt: new Date().toISOString(),
      sessionData: inspectionMediaData,
      summary: inspectionSummary,
      totalCareScore: 92,
      patient: {
        name: 'Margaret Thompson',
        mrn: 'MRN-784512',
        dob: '1952-04-15',
        conditions: ['CHF', 'Diabetes Type 2', 'Hypertension'],
        primaryCareProvider: 'Dr. Sarah Chen',
        insurancePlan: 'BlueCross Medicare Advantage'
      },
      metadata: {
        careCoordinator: 'Sarah Chen, RN',
        completedDate: new Date().toISOString(),
        timeSpent: '1h 45m',
        photosCount: inspectionMediaData.reduce((acc, area) =>
          acc + area.media.filter(m => m.type === 'photo').length, 0
        ),
        voiceNotesCount: inspectionMediaData.reduce((acc, area) =>
          acc + area.media.filter(m => m.type === 'audio').length, 0
        )
      }
    }

    // Store in sessionStorage
    sessionStorage.setItem(`report_${reportId}`, JSON.stringify(reportData))

    // Also add to reports list
    const existingReports = JSON.parse(sessionStorage.getItem('care_session_reports') || '[]')
    existingReports.unshift({
      id: reportId,
      sessionId,
      sessionNumber: `CS-2024-${Math.floor(Math.random() * 1000)}`,
      patient: reportData.patient,
      completedDate: new Date().toISOString(),
      sessionType: 'Follow-up Visit',
      status: 'in_review',
      careCoordinator: {
        name: 'Sarah Chen, RN',
        rating: 4.9
      },
      careOutcomes: {
        qualityScore: reportData.totalCareScore,
        goalsAchieved: 0,
        improvementAreas: 0
      },
      confidenceScore: 94,
      timeToComplete: reportData.metadata.timeSpent
    })
    sessionStorage.setItem('care_session_reports', JSON.stringify(existingReports))

    // Navigate to the review page for approval workflow
    router.push(`/dashboard/care-sessions/${sessionId}/review`)
  }, [router, sessionId])

  useEffect(() => {
    // Start processing immediately when page loads
    setIsProcessing(true)
  }, [])

  return (
    <AIProcessingOverlay
      isVisible={isProcessing}
      onComplete={handleProcessingComplete}
    />
  )
}