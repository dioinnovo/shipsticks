'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { CareAssessmentCarousel } from '@/components/ui/care-assessment-carousel'
import { useSessionData } from '@/lib/hooks/useSessionData'
import { Activity, Pill, Stethoscope, ClipboardList, BookOpen, Heart, UserCheck, MessageCircle } from 'lucide-react'

// Icon mapping for healthcare assessment categories
const CATEGORY_ICONS: Record<string, any> = {
  'vitals-measurements': Activity,
  'medication-review': Pill,
  'symptom-assessment': Stethoscope,
  'care-plan-review': ClipboardList,
  'patient-education': BookOpen,
  'sdoh-assessment': Heart,
  'followup-coordination': UserCheck,
  'care-team-communication': MessageCircle
}

export default function CareSessionAreasPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = params.id as string
  const [currentIndex, setCurrentIndex] = useState(0)

  // Use the centralized inspection data hook
  const {
    sessionData,
    loading,
    error,
    markAreaCompleted,
    markAreaSkipped,
    markAreaInProgress
  } = useSessionData(sessionId)

  // Set initial index based on area query parameter
  useEffect(() => {
    const areaParam = searchParams.get('area')
    if (areaParam && sessionData?.areas) {
      const areaIndex = sessionData.areas.findIndex(area => area.id === areaParam)
      if (areaIndex !== -1) {
        setCurrentIndex(areaIndex)
      }
    }
  }, [searchParams, sessionData])

  const handleAreaSelect = (area: any, index: number) => {
    if (area && area.id) {
      // Only mark as in progress if it's not already completed or skipped
      if (area.status === 'not_started') {
        markAreaInProgress(area.id)
      }
      router.push(`/dashboard/care-sessions/${sessionId}/assessment/${area.id}`)
    }
  }

  const handleComplete = () => {
    if (!sessionData) return

    const currentArea = sessionData.areas[currentIndex]
    markAreaCompleted(currentArea.id)

    // Navigate to next area if available
    const nextIndex = currentIndex + 1
    if (nextIndex < sessionData.areas.length) {
      setCurrentIndex(nextIndex)
      const nextArea = sessionData.areas[nextIndex]
      router.push(`/dashboard/care-sessions/${sessionId}/assessment/${nextArea.id}`)
    } else {
      // All areas done, go to review
      router.push(`/dashboard/care-sessions/${sessionId}/review`)
    }
  }

  const handleSkip = () => {
    if (!sessionData) return

    const currentArea = sessionData.areas[currentIndex]
    markAreaSkipped(currentArea.id)

    // Navigate to next area if available
    const nextIndex = currentIndex + 1
    if (nextIndex < sessionData.areas.length) {
      setCurrentIndex(nextIndex)
      const nextArea = sessionData.areas[nextIndex]
      router.push(`/dashboard/care-sessions/${sessionId}/assessment/${nextArea.id}`)
    } else {
      // All areas done, go to review
      router.push(`/dashboard/care-sessions/${sessionId}/review`)
    }
  }

  const handleConfirmInspection = () => {
    router.push(`/dashboard/care-sessions/${sessionId}/review`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-arthur-blue mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading shipment details...</p>
        </div>
      </div>
    )
  }

  if (error || !sessionData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Failed to load shipment data'}</p>
          <button
            onClick={() => router.push('/dashboard/care-sessions')}
            className="px-4 py-2 bg-arthur-blue text-white rounded-lg hover:bg-arthur-blue-dark"
          >
            Back to Shipments
          </button>
        </div>
      </div>
    )
  }

  // Add icon info to each area
  const enhancedAreas = sessionData.areas.map(area => ({
    ...area,
    icon: CATEGORY_ICONS[area.id] || Activity
  }))

  return (
    <CareAssessmentCarousel
      areas={enhancedAreas}
      currentAreaIndex={currentIndex}
      onAreaComplete={handleComplete}
      onAreaSkip={handleSkip}
      onAreaSelect={handleAreaSelect}
      sessionId={sessionId}
    />
  )
}