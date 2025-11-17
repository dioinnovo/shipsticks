'use client'

import Link from 'next/link'
import { User, Activity, FileText, AlertCircle, TrendingUp, ChevronRight, Clock, Shield } from 'lucide-react'
import { PatientWithClaims } from '@/lib/utils/patient-aggregation'

interface PatientCardProps {
  patient: PatientWithClaims
}

export default function PatientCard({ patient }: PatientCardProps) {
  const { patientInfo, totalActiveClaims, highPriorityClaims, criticalClaims, riskLevel, deductibleProgress, lastActivity, hasUrgentClaims, coverageIssuesCount } = patient

  // Format last activity
  const formatLastActivity = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    return `${diffDays}d ago`
  }

  // Get risk level styling
  const getRiskLevelStyle = () => {
    switch (riskLevel) {
      case 'Critical':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700'
      case 'High':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700'
      case 'Medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700'
      default:
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700'
    }
  }

  return (
    <Link
      href={`/dashboard/patients/${patientInfo.mrn}`}
      className="block border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:border-arthur-blue hover:shadow-lg transition-all cursor-pointer group bg-white dark:bg-gray-900"
    >
      {/* Patient Header */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-3">
          {/* Patient Avatar & Name */}
          <div className="flex items-start gap-3 flex-1">
            <div className="w-12 h-12 rounded-full bg-arthur-blue/10 dark:bg-arthur-blue/20 flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-arthur-blue" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">{patientInfo.patientName}</h3>
              <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                <span className="font-medium">{patientInfo.mrn}</span>
                <span>•</span>
                <span>{patientInfo.age} years</span>
                <span>•</span>
                <span>{patientInfo.gender}</span>
              </div>
            </div>
          </div>

          {/* Risk Level Badge */}
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getRiskLevelStyle()}`}>
            {riskLevel} Risk
          </span>
        </div>

        {/* Primary Care Provider */}
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <span className="font-medium">PCP:</span> {patientInfo.primaryCareProvider}
        </p>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-4">
        {/* Insurance Overview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Insurance Coverage</span>
            <Shield className="w-4 h-4 text-arthur-blue" />
          </div>
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600 dark:text-gray-400">{patientInfo.carrier}</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{patientInfo.planType}</span>
            </div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-gray-600 dark:text-gray-400">Deductible Progress</span>
              <span className="font-semibold text-arthur-blue">{deductibleProgress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-arthur-blue transition-all duration-300"
                style={{ width: `${deductibleProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Current Conditions */}
        <div>
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Current Conditions</p>
          <div className="flex flex-wrap gap-1.5">
            {patientInfo.currentConditions.slice(0, 3).map((condition, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full border border-blue-200 dark:border-blue-800"
              >
                {condition}
              </span>
            ))}
            {patientInfo.currentConditions.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                +{patientInfo.currentConditions.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Active Claims Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-arthur-blue" />
              <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">Active Authorizations</span>
            </div>
            <span className="text-lg font-bold text-arthur-blue">{totalActiveClaims}</span>
          </div>

          {hasUrgentClaims && (
            <div className="flex items-center gap-2 mt-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800">
              <AlertCircle className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
              <span className="text-xs text-orange-700 dark:text-orange-300">
                {criticalClaims > 0 && `${criticalClaims} Critical`}
                {criticalClaims > 0 && highPriorityClaims > 0 && ', '}
                {highPriorityClaims > 0 && `${highPriorityClaims} High Priority`}
              </span>
            </div>
          )}

          {coverageIssuesCount > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
              <span className="text-xs text-red-700 dark:text-red-300">
                {coverageIssuesCount} coverage {coverageIssuesCount === 1 ? 'issue' : 'issues'}
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Last activity: {formatLastActivity(lastActivity)}</span>
          </div>
          <div className="flex items-center gap-1 text-arthur-blue group-hover:translate-x-1 transition-transform">
            <span className="text-xs font-medium">View Details</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  )
}
