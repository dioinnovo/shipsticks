/**
 * Patient Aggregation Utility
 * Groups claims by patient and calculates patient-level metrics
 */

import { PatientPolicyData, getPatientData } from '@/lib/ai/mock-patient-data'

export interface Claim {
  id: string
  patientName: string
  mrn: string
  requestType: string
  condition: string
  status: string
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  policyCarrier: string
  policyNumber: string
  requestedTreatment: string
  coverageStatus: string
  coverageGap: string
  aiRecommendation: string
  estimatedSavings: number
  nextAction: string
  aiConfidence: number
  daysOpen: number
  lastActivity: string
}

export type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low'

export interface PatientWithClaims {
  // Patient Info
  patientInfo: PatientPolicyData

  // Aggregated Claims Data
  activeClaims: Claim[]
  totalActiveClaims: number
  highPriorityClaims: number
  criticalClaims: number
  coverageIssuesCount: number

  // Calculated Metrics
  riskLevel: RiskLevel
  lastActivity: Date
  estimatedTotalCost: number
  avgAiConfidence: number

  // Status Indicators
  hasUrgentClaims: boolean
  hasCoverageGaps: boolean
  needsAttention: boolean

  // Deductible Progress
  deductibleProgress: number
}

/**
 * Calculate risk level based on patient conditions and claims
 */
function calculateRiskLevel(
  patient: PatientPolicyData,
  claims: Claim[]
): RiskLevel {
  // Critical if has critical claims
  if (claims.some(c => c.priority === 'Critical')) return 'Critical'

  // Critical if has 4+ chronic conditions
  if (patient.currentConditions.length >= 4) return 'Critical'

  // High if has high priority claims
  if (claims.some(c => c.priority === 'High')) return 'High'

  // High if has 3+ chronic conditions
  if (patient.currentConditions.length >= 3) return 'High'

  // High if has coverage gaps
  if (patient.coverageGaps && patient.coverageGaps.length > 2) return 'High'

  // Medium if has multiple conditions or claims
  if (patient.currentConditions.length >= 2 || claims.length >= 2) return 'Medium'

  return 'Low'
}

/**
 * Parse activity string to Date
 */
function parseActivityDate(activityStr: string): Date {
  const now = new Date()

  if (activityStr.includes('hour')) {
    const hours = parseInt(activityStr)
    return new Date(now.getTime() - hours * 60 * 60 * 1000)
  }

  if (activityStr.includes('min')) {
    const mins = parseInt(activityStr)
    return new Date(now.getTime() - mins * 60 * 1000)
  }

  if (activityStr.toLowerCase().includes('today')) {
    return now
  }

  if (activityStr.includes('day')) {
    const days = parseInt(activityStr)
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  }

  return now
}

/**
 * Group claims by patient and merge with patient data
 */
export function aggregatePatientData(claims: Claim[]): PatientWithClaims[] {
  // Group claims by patient name
  const claimsByPatient = claims.reduce((acc, claim) => {
    const patientName = claim.patientName.toLowerCase()
    if (!acc[patientName]) {
      acc[patientName] = []
    }
    acc[patientName].push(claim)
    return acc
  }, {} as Record<string, Claim[]>)

  // Build PatientWithClaims objects
  const patientsWithClaims: PatientWithClaims[] = []

  for (const [patientName, patientClaims] of Object.entries(claimsByPatient)) {
    const patientInfo = getPatientData(patientName)

    // Skip if no patient data found
    if (!patientInfo) continue

    // Calculate metrics
    const highPriorityClaims = patientClaims.filter(c => c.priority === 'High').length
    const criticalClaims = patientClaims.filter(c => c.priority === 'Critical').length
    const coverageIssuesCount = patientClaims.filter(c => c.coverageStatus !== 'Fully Covered').length
    const estimatedTotalCost = patientClaims.reduce((sum, c) => sum + c.estimatedSavings, 0)
    const avgAiConfidence = Math.round(
      patientClaims.reduce((sum, c) => sum + c.aiConfidence, 0) / patientClaims.length
    )

    // Get most recent activity
    const activityDates = patientClaims.map(c => parseActivityDate(c.lastActivity))
    const lastActivity = new Date(Math.max(...activityDates.map(d => d.getTime())))

    // Calculate deductible progress
    const deductibleProgress = Math.round(
      ((patientInfo.deductibles.individual.inNetwork - patientInfo.deductibles.individual.remaining) /
        patientInfo.deductibles.individual.inNetwork) * 100
    )

    // Determine risk level
    const riskLevel = calculateRiskLevel(patientInfo, patientClaims)

    patientsWithClaims.push({
      patientInfo,
      activeClaims: patientClaims,
      totalActiveClaims: patientClaims.length,
      highPriorityClaims,
      criticalClaims,
      coverageIssuesCount,
      riskLevel,
      lastActivity,
      estimatedTotalCost,
      avgAiConfidence,
      hasUrgentClaims: criticalClaims > 0 || highPriorityClaims > 0,
      hasCoverageGaps: (patientInfo.coverageGaps?.length || 0) > 0,
      needsAttention: criticalClaims > 0 || coverageIssuesCount > 0,
      deductibleProgress
    })
  }

  // Sort by risk level and last activity
  return patientsWithClaims.sort((a, b) => {
    const riskOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 }
    const riskDiff = riskOrder[a.riskLevel] - riskOrder[b.riskLevel]

    if (riskDiff !== 0) return riskDiff

    return b.lastActivity.getTime() - a.lastActivity.getTime()
  })
}

/**
 * Get patient statistics for KPIs
 */
export function getPatientStatistics(patients: PatientWithClaims[]) {
  return {
    totalPatients: patients.length,
    patientsWithCoverageIssues: patients.filter(p => p.coverageIssuesCount > 0).length,
    highRiskPatients: patients.filter(p => p.riskLevel === 'Critical' || p.riskLevel === 'High').length,
    avgClaimsPerPatient: patients.length > 0
      ? (patients.reduce((sum, p) => sum + p.totalActiveClaims, 0) / patients.length).toFixed(1)
      : '0',
    totalActiveClaims: patients.reduce((sum, p) => sum + p.totalActiveClaims, 0),
    totalEstimatedCosts: patients.reduce((sum, p) => sum + p.estimatedTotalCost, 0)
  }
}
