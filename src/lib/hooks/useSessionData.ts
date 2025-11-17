'use client'

import { useState, useEffect, useCallback } from 'react'
import { inspectionMediaData } from '@/lib/inspection-media'

export interface MediaFile {
  id: string
  type: 'photo' | 'audio' | 'document'
  url: string
  thumbnail?: string
  title: string
  description?: string
  timestamp: string
  category: string
  tags?: string[]
  transcript?: string
  duration?: number
}

export interface AssessmentArea {
  id: string
  name: string
  category: string
  status: 'completed' | 'skipped' | 'in_progress' | 'not_started'
  photoCount: number
  notesCount: number
  findings: string
  clinicalObservations: string
  recommendedActions: string
  estimatedCost: number
  priority: 'high' | 'medium' | 'low'
  previewImage?: string
  media: MediaFile[]
}

export interface SessionData {
  id: string
  patient: {
    name: string
    mrn: string
    dob?: string
    policyNumber?: string
  }
  areas: AssessmentArea[]
  createdAt: string
  updatedAt: string
  completionPercentage: number
}

// Default assessment categories for a new care session
const DEFAULT_ASSESSMENT_AREAS: Omit<AssessmentArea, 'media'>[] = [
  // Clinical Assessment
  { id: 'vitals-measurements', name: 'Vital Signs & Measurements', category: 'Clinical Assessment', status: 'not_started', photoCount: 0, notesCount: 0, findings: '', clinicalObservations: '', recommendedActions: '', estimatedCost: 0, priority: 'low' },
  { id: 'medication-review', name: 'Medication Review & Reconciliation', category: 'Clinical Assessment', status: 'not_started', photoCount: 0, notesCount: 0, findings: '', clinicalObservations: '', recommendedActions: '', estimatedCost: 0, priority: 'low' },
  { id: 'symptom-assessment', name: 'Symptom Assessment', category: 'Clinical Assessment', status: 'not_started', photoCount: 0, notesCount: 0, findings: '', clinicalObservations: '', recommendedActions: '', estimatedCost: 0, priority: 'low' },

  // Care Planning
  { id: 'care-plan-review', name: 'Care Plan Review', category: 'Care Planning', status: 'not_started', photoCount: 0, notesCount: 0, findings: '', clinicalObservations: '', recommendedActions: '', estimatedCost: 0, priority: 'low' },
  { id: 'patient-education', name: 'Patient Education & Engagement', category: 'Care Planning', status: 'not_started', photoCount: 0, notesCount: 0, findings: '', clinicalObservations: '', recommendedActions: '', estimatedCost: 0, priority: 'low' },
  { id: 'sdoh-assessment', name: 'Social Determinants of Health', category: 'Care Planning', status: 'not_started', photoCount: 0, notesCount: 0, findings: '', clinicalObservations: '', recommendedActions: '', estimatedCost: 0, priority: 'low' },

  // Coordination
  { id: 'followup-coordination', name: 'Follow-up Coordination', category: 'Coordination', status: 'not_started', photoCount: 0, notesCount: 0, findings: '', clinicalObservations: '', recommendedActions: '', estimatedCost: 0, priority: 'low' },
  { id: 'care-team-communication', name: 'Care Team Communication', category: 'Coordination', status: 'not_started', photoCount: 0, notesCount: 0, findings: '', clinicalObservations: '', recommendedActions: '', estimatedCost: 0, priority: 'low' }
]

export function useSessionData(sessionId: string) {
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load shipment data
  useEffect(() => {
    if (!sessionId) {
      setError('No shipment ID provided')
      setLoading(false)
      return
    }

    try {
      // Special handling for demo session CS-001 (Margaret Thompson)
      if (sessionId === 'CS-001') {
        // Create demo areas with some completed, some in progress
        const demoAreas: AssessmentArea[] = DEFAULT_ASSESSMENT_AREAS.map((area, index) => {
          let status: 'completed' | 'in_progress' | 'not_started' | 'skipped' = 'not_started'
          let media: MediaFile[] = []
          let findings = ''
          let clinicalObservations = ''
          let recommendedActions = ''
          let photoCount = 0
          let notesCount = 0
          let previewImage = ''

          // First 5 areas completed with demo data
          if (index < 5) {
            status = 'completed'

            // Different demo content for each completed area
            if (area.id === 'vitals-measurements') {
              findings = 'Patient vitals stable. BP: 128/82 mmHg, HR: 72 bpm, RR: 16/min, Temp: 98.6°F, O2 Sat: 98% on room air.'
              clinicalObservations = 'Blood pressure slightly elevated compared to baseline (120/78). Patient reports good medication adherence. No orthostatic symptoms.'
              recommendedActions = 'Continue current antihypertensive regimen. Schedule BP monitoring in 2 weeks. Patient to maintain daily BP log.'
              photoCount = 2
              notesCount = 1
              previewImage = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=400&fit=crop'
              media = [
                {
                  id: 'photo-1',
                  type: 'photo',
                  url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop',
                  title: 'Blood Pressure Reading',
                  timestamp: '2024-03-15T10:35:00Z',
                  category: 'Vital Signs'
                },
                {
                  id: 'photo-2',
                  type: 'photo',
                  url: 'https://images.unsplash.com/photo-1615461066159-fea0960485d5?w=800&h=600&fit=crop',
                  title: 'Pulse Oximeter Reading',
                  timestamp: '2024-03-15T10:36:00Z',
                  category: 'Vital Signs'
                },
                {
                  id: 'audio-1',
                  type: 'audio',
                  url: '#',
                  title: 'Clinical Notes - Vital Signs',
                  timestamp: '2024-03-15T10:37:00Z',
                  category: 'Voice Notes',
                  transcript: 'Care coordinator notes: Patient reports feeling well today. Blood pressure 128 over 82, heart rate 72, respiratory rate 16. Oxygen saturation 98% on room air. Temperature 98.6. Patient denies chest pain, shortness of breath, or dizziness. Medication adherence confirmed via pill count.',
                  duration: 28
                }
              ]
            } else if (area.id === 'medication-review') {
              findings = 'All medications reconciled. Patient taking Metformin 1000mg BID, Lisinopril 10mg daily, Atorvastatin 20mg nightly as prescribed.'
              clinicalObservations = 'Good medication adherence. No reported side effects. Patient understands dosing schedule. Adequate supply until next refill date.'
              recommendedActions = 'Continue current regimen. Refill due in 3 weeks. Consider A1C recheck in 6 weeks.'
              photoCount = 3
              notesCount = 1
              previewImage = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop'
              media = [
                {
                  id: 'photo-3',
                  type: 'photo',
                  url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=600&fit=crop',
                  title: 'Metformin 1000mg Bottle',
                  timestamp: '2024-03-15T10:40:00Z',
                  category: 'Medication'
                },
                {
                  id: 'photo-4',
                  type: 'photo',
                  url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&h=600&fit=crop',
                  title: 'Lisinopril 10mg Bottle',
                  timestamp: '2024-03-15T10:41:00Z',
                  category: 'Medication'
                },
                {
                  id: 'photo-5',
                  type: 'photo',
                  url: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=800&h=600&fit=crop',
                  title: 'Atorvastatin 20mg Bottle',
                  timestamp: '2024-03-15T10:42:00Z',
                  category: 'Medication'
                },
                {
                  id: 'audio-2',
                  type: 'audio',
                  url: '#',
                  title: 'Medication Reconciliation Notes',
                  timestamp: '2024-03-15T10:43:00Z',
                  category: 'Voice Notes',
                  transcript: 'Medication reconciliation complete. Patient has Metformin 1000 milligrams twice daily, Lisinopril 10 milligrams once daily in the morning, and Atorvastatin 20 milligrams at bedtime. All medications verified with pill bottles. Patient demonstrates good understanding of medication schedule. No side effects reported. Next refill due March 30th.',
                  duration: 35
                }
              ]
            } else if (area.id === 'symptom-assessment') {
              findings = 'Patient reports improved mobility and reduced knee pain since last visit. Pain level 2/10 on movement, down from 5/10.'
              clinicalObservations = 'ROM in bilateral knees improved. Patient ambulating without assistive device. Mild crepitus on flexion. No signs of acute inflammation.'
              recommendedActions = 'Continue physical therapy twice weekly. May increase walking distance gradually. Follow up in 4 weeks or sooner if pain worsens.'
              photoCount = 1
              notesCount = 1
              previewImage = 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=400&h=400&fit=crop'
              media = [
                {
                  id: 'photo-6',
                  type: 'photo',
                  url: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&h=600&fit=crop',
                  title: 'Knee Joint Assessment',
                  timestamp: '2024-03-15T10:45:00Z',
                  category: 'Clinical Overview'
                },
                {
                  id: 'audio-3',
                  type: 'audio',
                  url: '#',
                  title: 'Symptom Assessment Notes',
                  timestamp: '2024-03-15T10:46:00Z',
                  category: 'Voice Notes',
                  transcript: 'Patient reports significant improvement in knee pain. Current pain level 2 out of 10 with movement, down from 5 out of 10 at last visit. Patient able to ambulate independently without walker or cane. Range of motion improved bilaterally. Mild crepitus noted on knee flexion but no acute swelling or warmth. Patient very pleased with progress from physical therapy.',
                  duration: 32
                }
              ]
            } else if (area.id === 'care-plan-review') {
              findings = 'Care plan reviewed with patient. Goals: maintain A1C <7.0%, BP <130/80, increase physical activity to 30 min daily.'
              clinicalObservations = 'Patient engaged in care planning process. Demonstrates good understanding of treatment goals. Agrees with activity progression plan.'
              recommendedActions = 'Continue current diabetes and hypertension management. Add structured exercise program. Follow up with endocrinology in 6 weeks. Schedule nutritionist consultation.'
              photoCount = 2
              notesCount = 1
              previewImage = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=400&fit=crop'
              media = [
                {
                  id: 'photo-7',
                  type: 'photo',
                  url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop',
                  title: 'Care Plan Documentation',
                  timestamp: '2024-03-15T11:00:00Z',
                  category: 'Care Plan'
                },
                {
                  id: 'photo-8',
                  type: 'photo',
                  url: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&h=600&fit=crop',
                  title: 'Patient Goals Worksheet',
                  timestamp: '2024-03-15T11:02:00Z',
                  category: 'Patient Education'
                },
                {
                  id: 'audio-4',
                  type: 'audio',
                  url: '#',
                  title: 'Care Plan Review Discussion',
                  timestamp: '2024-03-15T11:05:00Z',
                  category: 'Voice Notes',
                  transcript: 'Care plan review completed with patient Margaret Thompson. Discussed treatment goals including maintaining A1C below 7.0%, blood pressure below 130 over 80, and increasing physical activity to 30 minutes daily. Patient is motivated and engaged. Agrees with progressive exercise plan starting with 15 minute walks three times per week. Endocrinology follow-up scheduled for 6 weeks. Patient to see nutritionist for diabetes meal planning.',
                  duration: 42
                }
              ]
            } else if (area.id === 'patient-education') {
              findings = 'Diabetes self-management education completed. Patient demonstrates correct glucose monitoring technique and insulin administration.'
              clinicalObservations = 'Patient shows excellent understanding of hypoglycemia symptoms and treatment. Correctly identifies carb counting principles. Motivated for lifestyle modifications.'
              recommendedActions = 'Provide written diabetes resources. Enroll in diabetes support group. Schedule follow-up education session in 4 weeks to reinforce concepts.'
              photoCount = 3
              notesCount = 1
              previewImage = 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=400&h=400&fit=crop'
              media = [
                {
                  id: 'photo-9',
                  type: 'photo',
                  url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&h=600&fit=crop',
                  title: 'Glucose Meter Demonstration',
                  timestamp: '2024-03-15T11:15:00Z',
                  category: 'Patient Education'
                },
                {
                  id: 'photo-10',
                  type: 'photo',
                  url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=600&fit=crop',
                  title: 'Education Materials Provided',
                  timestamp: '2024-03-15T11:18:00Z',
                  category: 'Patient Education'
                },
                {
                  id: 'photo-11',
                  type: 'photo',
                  url: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&h=600&fit=crop',
                  title: 'Carb Counting Reference Guide',
                  timestamp: '2024-03-15T11:20:00Z',
                  category: 'Patient Education'
                },
                {
                  id: 'audio-5',
                  type: 'audio',
                  url: '#',
                  title: 'Patient Education Session Notes',
                  timestamp: '2024-03-15T11:22:00Z',
                  category: 'Voice Notes',
                  transcript: 'Diabetes self-management education session completed. Patient demonstrated excellent glucose monitoring technique with proper handwashing and meter use. Shows good understanding of target blood sugar ranges. Correctly identified signs and symptoms of hypoglycemia including shakiness, sweating, and confusion. Treatment with 15 grams fast-acting carbs reviewed. Patient practiced carb counting with sample meals. Very engaged and asking appropriate questions. Provided written materials and enrolled in diabetes support group starting next month.',
                  duration: 48
                }
              ]
            }
          }
          // 6th area in progress
          else if (index === 5) {
            status = 'in_progress'
          }

          return {
            ...area,
            status,
            findings,
            clinicalObservations,
            recommendedActions,
            photoCount,
            notesCount,
            previewImage,
            media
          }
        })

        const completedCount = demoAreas.filter(a => a.status === 'completed' || a.status === 'skipped').length
        const completionPercentage = Math.round((completedCount / demoAreas.length) * 100)

        const demoData: SessionData = {
          id: sessionId,
          patient: {
            name: 'Margaret Thompson',
            mrn: 'MRN-784512',
            dob: '1965-04-15',
            policyNumber: 'BC-2024-89456'
          },
          areas: demoAreas,
          createdAt: '2024-03-15T10:30:00Z',
          updatedAt: new Date().toISOString(),
          completionPercentage
        }

        setSessionData(demoData)
        // Don't save demo data to localStorage to keep it fresh
      } else {
        // Try to load from localStorage for non-demo sessions
        const stored = localStorage.getItem(`session-${sessionId}-data`)
        if (stored) {
          const data = JSON.parse(stored)
          setSessionData(data)
        } else {
          // Check if there's basic session info
          const basicInfo = localStorage.getItem(`session-${sessionId}`)
          if (basicInfo) {
            // Initialize with default areas
            const basic = JSON.parse(basicInfo)
            const newData: SessionData = {
              id: sessionId,
              patient: {
                name: basic.patientName || '',
                mrn: basic.mrn || '',
                dob: basic.dob,
                policyNumber: basic.policyNumber
              },
              areas: DEFAULT_ASSESSMENT_AREAS.map(area => ({ ...area, media: [] })),
              createdAt: basic.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              completionPercentage: 0
            }
            setSessionData(newData)
            // Save the initialized data
            localStorage.setItem(`session-${sessionId}-data`, JSON.stringify(newData))
          } else {
            setError(`No shipment found with ID: ${sessionId}`)
          }
        }
      }
    } catch (err) {
      console.error('Error loading shipment data:', err)
      setError('Failed to load shipment data')
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  // Save care session data
  const saveSessionData = useCallback((data: SessionData) => {
    try {
      // Calculate completion percentage
      const totalAreas = data.areas.length
      const completedAreas = data.areas.filter(a => a.status === 'completed' || a.status === 'skipped').length
      data.completionPercentage = Math.round((completedAreas / totalAreas) * 100)
      data.updatedAt = new Date().toISOString()

      localStorage.setItem(`session-${sessionId}-data`, JSON.stringify(data))
      setSessionData(data)
      return true
    } catch (err) {
      console.error('Error saving shipment data:', err)
      setError('Failed to save shipment data')
      return false
    }
  }, [sessionId])

  // Update a specific assessment area
  const updateArea = useCallback((areaId: string, updates: Partial<AssessmentArea>) => {
    if (!sessionData) return false

    const updatedData = {
      ...sessionData,
      areas: sessionData.areas.map(area =>
        area.id === areaId ? { ...area, ...updates } : area
      )
    }

    return saveSessionData(updatedData)
  }, [sessionData, saveSessionData])

  // Mark area as completed
  const markAreaCompleted = useCallback((areaId: string) => {
    return updateArea(areaId, { status: 'completed' })
  }, [updateArea])

  // Mark area as skipped
  const markAreaSkipped = useCallback((areaId: string) => {
    return updateArea(areaId, { status: 'skipped' })
  }, [updateArea])

  // Mark area as in progress
  const markAreaInProgress = useCallback((areaId: string) => {
    return updateArea(areaId, { status: 'in_progress' })
  }, [updateArea])

  // Add media to an area
  const addMediaToArea = useCallback((areaId: string, media: MediaFile) => {
    if (!sessionData) return false

    const area = sessionData.areas.find(a => a.id === areaId)
    if (!area) return false

    const updatedMedia = [...(area.media || []), media]
    const photoCount = updatedMedia.filter(m => m.type === 'photo').length
    const notesCount = updatedMedia.filter(m => m.type === 'audio').length

    return updateArea(areaId, {
      media: updatedMedia,
      photoCount,
      notesCount
    })
  }, [sessionData, updateArea])

  // Get care session progress
  const getProgress = useCallback(() => {
    if (!sessionData) return { percentage: 0, completed: 0, total: 0 }

    const total = sessionData.areas.length
    const completed = sessionData.areas.filter(a =>
      a.status === 'completed' || a.status === 'skipped'
    ).length

    return {
      percentage: sessionData.completionPercentage,
      completed,
      total
    }
  }, [sessionData])

  return {
    sessionData,
    loading,
    error,
    saveSessionData,
    updateArea,
    markAreaCompleted,
    markAreaSkipped,
    markAreaInProgress,
    addMediaToArea,
    getProgress
  }
}
