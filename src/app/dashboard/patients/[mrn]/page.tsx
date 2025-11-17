'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  User, FileText, History, Users as UsersIcon, FolderOpen,
  ChevronLeft, Shield, Calendar, DollarSign, Activity,
  TrendingUp, AlertCircle, Phone, Mail, MapPin, CheckCircle2
} from 'lucide-react'
import { getPatientData } from '@/lib/ai/mock-patient-data'

type TabType = 'overview' | 'claims' | 'history' | 'team' | 'documents'

export default function PatientDetailPage({ params }: { params: { mrn: string } }) {
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  // Get patient data
  const patient = getPatientData('Margaret Thompson') // In real app, would search by params.mrn

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">Patient not found</p>
        </div>
      </div>
    )
  }

  // Calculate deductible progress
  const deductibleProgress = Math.round(
    ((patient.deductibles.individual.inNetwork - patient.deductibles.individual.remaining) /
      patient.deductibles.individual.inNetwork) * 100
  )

  // Sample active claims for this patient
  const activeClaims = [
    {
      id: 'CLM-2024-001',
      requestType: 'Prior Authorization',
      condition: 'Type 2 Diabetes - Insulin Pump',
      status: 'Coverage Review',
      priority: 'High',
      requestedTreatment: 'Continuous Glucose Monitor + Insulin Pump',
      coverageStatus: 'Partial Coverage',
      coverageGap: '$2,400 out-of-pocket',
      aiRecommendation: 'Alternative CGM covered at 100%',
      estimatedSavings: 2400,
      nextAction: 'Submit alternative device authorization',
      aiConfidence: 94,
      daysOpen: 3,
      lastActivity: '2 hours ago'
    }
  ]

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'claims', label: 'Active Claims', icon: FileText, badge: activeClaims.length },
    { id: 'history', label: 'Claims History', icon: History },
    { id: 'team', label: 'Care Team', icon: UsersIcon },
    { id: 'documents', label: 'Documents', icon: FolderOpen },
  ]

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/dashboard/claims"
        className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-arthur-blue transition-colors"
      >
        <ChevronLeft size={16} />
        Back to Patients
      </Link>

      {/* Patient Header */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-arthur-blue/10 dark:bg-arthur-blue/20 flex items-center justify-center flex-shrink-0">
            <User className="w-10 h-10 text-arthur-blue" />
          </div>

          {/* Patient Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{patient.patientName}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">{patient.mrn}</span>
                  <span>•</span>
                  <span>{patient.age} years, {patient.gender}</span>
                  <span>•</span>
                  <span>DOB: {patient.dateOfBirth}</span>
                </div>
              </div>
              <button className="px-4 py-2 bg-arthur-blue text-white rounded-lg hover:bg-arthur-blue-dark transition-colors text-sm font-medium">
                New Authorization Request
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-arthur-blue" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Insurance</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{patient.carrier}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{patient.planType}</p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Deductible</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{deductibleProgress}% Met</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">${patient.deductibles.individual.remaining} remaining</p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Conditions</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{patient.currentConditions.length} Active</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Chronic care mgmt</p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Active Claims</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{activeClaims.length} Pending</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">1 needs attention</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700 px-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-arthur-blue text-arthur-blue font-medium'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="px-2 py-0.5 bg-arthur-blue text-white text-xs rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Demographics */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Patient Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Primary Care Provider</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{patient.primaryCareProvider}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Policy Number</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{patient.policyNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Group Number</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{patient.groupNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Coverage Period</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {patient.effectiveDates.start} - {patient.effectiveDates.end}
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Conditions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Current Conditions</h3>
                <div className="flex flex-wrap gap-2">
                  {patient.currentConditions.map((condition, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm rounded-lg border border-blue-200 dark:border-blue-800"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              </div>

              {/* Current Medications */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Current Medications</h3>
                <div className="space-y-3">
                  {patient.currentMedications.map((med, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{med.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {med.dosage} • {med.frequency}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded">
                        {med.coveredTier}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coverage Gaps */}
              {patient.coverageGaps && patient.coverageGaps.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    Coverage Gaps
                  </h3>
                  <div className="space-y-2">
                    {patient.coverageGaps.map((gap, idx) => (
                      <div key={idx} className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                        <p className="text-sm text-orange-700 dark:text-orange-300">{gap}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Optimization Opportunities */}
              {patient.optimizationOpportunities && patient.optimizationOpportunities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Cost Optimization Opportunities
                  </h3>
                  <div className="space-y-2">
                    {patient.optimizationOpportunities.map((opp, idx) => (
                      <div key={idx} className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-sm text-green-700 dark:text-green-300">{opp}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'claims' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Active Authorization Requests</h3>
              {activeClaims.map((claim) => (
                <Link
                  key={claim.id}
                  href={`/dashboard/claims/${claim.id}`}
                  className="block border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-arthur-blue transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{claim.condition}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{claim.requestType}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      claim.priority === 'High' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                    }`}>
                      {claim.priority} Priority
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{claim.coverageStatus}</span>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">AI Recommendation</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{claim.aiRecommendation}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Claims History</h3>
              {patient.recentClaims.map((claim, idx) => (
                <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{claim.service}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{claim.provider}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">
                      {claim.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Date</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{claim.date}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Billed</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">${claim.billedAmount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Insurance Paid</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">${claim.paidByInsurance}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Your Cost</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">${claim.patientResponsibility}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Care Team</h3>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-arthur-blue" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{patient.primaryCareProvider}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Primary Care Physician</p>
                    <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Phone size={14} />
                        (555) 123-4567
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail size={14} />
                        office@provider.com
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Documents & Records</h3>
              <div className="text-center py-12">
                <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No documents uploaded yet</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
