'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Shield, AlertCircle, CheckCircle2, DollarSign, Clock, FileText, User, MapPin, Phone, Mail, ChevronRight, TrendingUp, Calendar, Upload, Eye, Download } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'

export default function AuthorizationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const claimId = params.id as string
  const [activeTab, setActiveTab] = useState<'overview' | 'documentation'>('overview')

  // Mock authorization data - aligned with Arthur Health business model
  const authDetails = {
    id: claimId,
    patientName: 'Margaret Thompson',
    mrn: 'MRN-784512',
    requestType: 'Prior Authorization',
    condition: 'Type 2 Diabetes - Insulin Pump',
    status: 'Coverage Review',
    priority: 'High',
    policyCarrier: 'UnitedHealthcare Medicare Advantage',
    policyNumber: 'UHC-MA-784512',
    requestedTreatment: 'Continuous Glucose Monitor + Insulin Pump System (Dexcom G7 + Tandem t:slim X2)',
    coverageStatus: 'Partial Coverage',
    coverageGap: '$2,400 out-of-pocket annually',
    aiRecommendation: 'Alternative CGM (FreeStyle Libre 3) covered at 100% with same clinical efficacy. Estimated annual savings: $2,400',
    estimatedSavings: 2400,
    nextAction: 'Submit alternative device prior authorization',
    aiConfidence: 94,
    daysOpen: 3,
    submittedDate: '2024-09-27',
    targetDecisionDate: '2024-10-12',
    
    patient: {
      name: 'Margaret Thompson',
      mrn: 'MRN-784512',
      dob: '1952-04-15',
      age: 72,
      phone: '(555) 123-4567',
      email: 'mthompson@email.com',
      primaryCareProvider: 'Dr. Sarah Chen, MD',
      referringProvider: 'Dr. James Park, Endocrinology',
    },
    
    policy: {
      carrier: 'UnitedHealthcare Medicare Advantage',
      policyNumber: 'UHC-MA-784512',
      planType: 'Medicare Advantage HMO',
      deductible: '$0',
      outOfPocketMax: '$5,500',
      currentOOPSpent: '$1,240',
    },
    
    clinical: {
      diagnosis: 'Type 2 Diabetes Mellitus with complications',
      icd10Codes: ['E11.9', 'E11.65'],
      requestReason: 'Patient requires CGM and insulin pump for improved glycemic control. Current HbA1c 8.9%, target <7.0%.',
      medicalNecessity: 'High - Multiple daily injections insufficient',
    },
    
    aiAnalysis: {
      policyFindings: [
        'Dexcom G7 CGM requires prior auth with 50% coinsurance',
        'FreeStyle Libre 3 CGM covered at 100% (preferred device)',
        'Tandem pump covered at 80% with same integration capability',
      ],
      providerMatches: [
        {
          name: 'Boston Diabetes Center',
          distance: '2.1 mi',
          rating: 4.8,
          inNetwork: true,
        },
      ],
    },
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-arthur-blue transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="text-sm font-medium">Back to Requests</span>
      </button>

      <PageHeader
        title={`Authorization: ${authDetails.id}`}
        description={`${authDetails.requestType} for ${authDetails.patientName}`}
      />

      {/* Status Banner */}
      <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <AlertCircle className="text-orange-600" size={24} />
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">
                {authDetails.coverageStatus}: {authDetails.coverageGap}
              </h3>
              <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Arthur AI Recommendation:</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{authDetails.aiRecommendation}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 ml-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Potential Savings</p>
            <p className="text-3xl font-bold text-green-600">${authDetails.estimatedSavings.toLocaleString()}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">annually</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-1 p-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-arthur-blue text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('documentation')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'documentation'
                  ? 'bg-arthur-blue text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Documentation
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'overview' && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Details */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Shield className="text-arthur-blue" size={24} />
              Authorization Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Request Type</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{authDetails.requestType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Priority</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                  {authDetails.priority}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Submitted</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{authDetails.submittedDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Target Decision</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{authDetails.targetDecisionDate}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Requested Treatment</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{authDetails.requestedTreatment}</p>
              </div>
            </div>
          </div>

          {/* Clinical Info */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <FileText className="text-arthur-blue" size={24} />
              Clinical Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Diagnosis</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{authDetails.clinical.diagnosis}</p>
                <div className="flex gap-2 mt-2">
                  {authDetails.clinical.icd10Codes.map((code) => (
                    <span key={code} className="text-xs bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full font-mono">
                      {code}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Request Reason</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{authDetails.clinical.requestReason}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Medical Necessity</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{authDetails.clinical.medicalNecessity}</p>
              </div>
            </div>
          </div>

          {/* AI Policy Analysis */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <TrendingUp className="text-arthur-blue" size={24} />
              Arthur AI Policy Analysis
            </h2>
            
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-green-600" />
                Policy Review Complete
              </h3>
              <ul className="space-y-2">
                {authDetails.aiAnalysis.policyFindings.map((finding, i) => (
                  <li key={i} className="text-sm text-gray-700 dark:text-gray-300 pl-4 border-l-2 border-blue-300 dark:border-blue-700">
                    {finding}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">In-Network Providers</h3>
              {authDetails.aiAnalysis.providerMatches.map((provider, i) => (
                <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">{provider.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{provider.distance} away • ⭐ {provider.rating}</p>
                    </div>
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-xs font-semibold">
                      In-Network
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Patient Info */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <User className="text-arthur-blue" size={20} />
              Patient
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Name</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{authDetails.patient.name}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">MRN</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{authDetails.patient.mrn}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">DOB</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{authDetails.patient.dob} (Age {authDetails.patient.age})</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Contact</p>
                <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2 mt-1">
                  <Phone size={14} /> {authDetails.patient.phone}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Referring Provider</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{authDetails.patient.referringProvider}</p>
              </div>
            </div>
          </div>

          {/* Policy Info */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Shield className="text-arthur-blue" size={20} />
              Insurance
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Carrier</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{authDetails.policy.carrier}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Policy #</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{authDetails.policy.policyNumber}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Plan Type</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{authDetails.policy.planType}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">OOP Max</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{authDetails.policy.outOfPocketMax}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">OOP Spent</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{authDetails.policy.currentOOPSpent}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-arthur-blue to-blue-600 rounded-xl p-6 text-white">
            <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg p-3 text-left transition-all flex items-center justify-between group">
                <span className="text-sm font-medium">Contact Patient</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg p-3 text-left transition-all flex items-center justify-between group">
                <span className="text-sm font-medium">Submit Revised Request</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg p-3 text-left transition-all flex items-center justify-between group">
                <span className="text-sm font-medium">Download Documents</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      {activeTab === 'documentation' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Documentation Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Required Documents Checklist */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                <FileText className="text-arthur-blue" size={24} />
                Patient Knowledge Base Documents
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Complete documentation helps Arthur AI build a comprehensive patient profile and identify optimal care pathways. Documents marked as collected are used to enhance AI recommendations.
              </p>

              <div className="space-y-3">
                {[
                  {
                    name: 'Insurance Policy Document',
                    required: true,
                    status: 'collected',
                    context: `UnitedHealthcare Medicare Advantage - ${authDetails.policy.policyNumber}`,
                    relevance: 'Critical for coverage analysis and prior authorization decisions'
                  },
                  {
                    name: 'Medical History Records',
                    required: true,
                    status: 'collected',
                    context: 'Complete diagnosis history including ICD-10 codes',
                    relevance: 'Essential for medical necessity validation'
                  },
                  {
                    name: 'Current Treatment Plan',
                    required: true,
                    status: 'collected',
                    context: authDetails.requestedTreatment,
                    relevance: 'Validates requested treatment appropriateness'
                  },
                  {
                    name: 'Lab Results & Clinical Data',
                    required: true,
                    status: 'collected',
                    context: 'HbA1c 8.9%, glucose monitoring logs',
                    relevance: 'Supports medical necessity criteria'
                  },
                  {
                    name: 'Physician Notes & Referrals',
                    required: true,
                    status: 'collected',
                    context: authDetails.patient.referringProvider,
                    relevance: 'Documents clinical decision-making process'
                  },
                  {
                    name: 'Prior Authorization Forms',
                    required: true,
                    status: 'pending',
                    context: 'Pending submission for alternative CGM device',
                    relevance: 'Required for claims processing'
                  },
                  {
                    name: 'Medication List',
                    required: false,
                    status: 'collected',
                    context: 'Current diabetes medications and dosages',
                    relevance: 'Helps identify drug interactions and coverage'
                  },
                  {
                    name: 'Provider Network Verification',
                    required: false,
                    status: 'collected',
                    context: 'In-network provider confirmation',
                    relevance: 'Ensures maximum coverage benefits'
                  },
                  {
                    name: 'Patient Consent Forms',
                    required: true,
                    status: 'collected',
                    context: 'HIPAA authorization and data sharing consent',
                    relevance: 'Legal requirement for care coordination'
                  },
                  {
                    name: 'Financial Assistance Applications',
                    required: false,
                    status: 'not-collected',
                    context: 'Potential coverage gap assistance programs',
                    relevance: 'Could reduce patient out-of-pocket costs'
                  }
                ].map((doc, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={doc.status === 'collected'}
                          readOnly
                          className="w-5 h-5 text-green-600 rounded mt-1 focus:ring-2 focus:ring-green-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{doc.name}</h3>
                            {doc.required && (
                              <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 px-2 py-0.5 rounded-full">Required</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{doc.context}</p>
                          <div className="flex items-start gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-500 font-medium">Relevance:</span>
                            <p className="text-xs text-gray-600 dark:text-gray-400 italic">{doc.relevance}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 ml-3">
                        {doc.status === 'collected' && (
                          <>
                            <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-3 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                              <CheckCircle2 size={14} />
                              Collected
                            </span>
                            <div className="flex gap-1">
                              <button className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-arthur-blue hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition">
                                <Eye size={16} />
                              </button>
                              <button className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-arthur-blue hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition">
                                <Download size={16} />
                              </button>
                            </div>
                          </>
                        )}
                        {doc.status === 'pending' && (
                          <>
                            <span className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 px-3 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                              <Clock size={14} />
                              Pending
                            </span>
                            <button className="p-1.5 text-arthur-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition">
                              <Upload size={16} />
                            </button>
                          </>
                        )}
                        {doc.status === 'not-collected' && (
                          <>
                            <span className="text-xs bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400 px-3 py-1 rounded-full whitespace-nowrap">
                              Not Collected
                            </span>
                            <button className="text-xs bg-arthur-blue text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition whitespace-nowrap">
                              Request
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="text-arthur-blue mt-0.5" size={20} />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Knowledge Base Status</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      8 of 10 documents collected. Arthur AI has sufficient context to provide optimal care recommendations.
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                      Collecting the remaining 2 documents will enhance coverage gap analysis and identify additional cost savings opportunities.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Patient Context */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-arthur-blue to-blue-600 rounded-xl p-6 text-white">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <User size={20} />
                Patient Context
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-white/70 mb-1">Patient</p>
                  <p className="font-semibold">{authDetails.patient.name}</p>
                </div>
                <div>
                  <p className="text-white/70 mb-1">MRN</p>
                  <p className="font-semibold">{authDetails.patient.mrn}</p>
                </div>
                <div>
                  <p className="text-white/70 mb-1">Primary Diagnosis</p>
                  <p className="font-semibold">{authDetails.clinical.diagnosis}</p>
                </div>
                <div>
                  <p className="text-white/70 mb-1">Insurance</p>
                  <p className="font-semibold">{authDetails.policy.carrier}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <TrendingUp className="text-arthur-blue" size={20} />
                AI Insights
              </h2>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-green-900 dark:text-green-100 font-medium mb-1">Complete Documentation</p>
                  <p className="text-green-700 dark:text-green-300 text-xs">All required documents for this authorization request are collected</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-blue-900 dark:text-blue-100 font-medium mb-1">Optimization Opportunity</p>
                  <p className="text-blue-700 dark:text-blue-300 text-xs">Financial assistance application could reduce patient costs by up to $2,400</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button className="w-full bg-arthur-blue hover:bg-blue-600 text-white rounded-lg p-3 text-sm font-medium transition-all flex items-center justify-center gap-2">
                  <Upload size={16} />
                  Upload Document
                </button>
                <button className="w-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg p-3 text-sm font-medium transition-all flex items-center justify-center gap-2">
                  <Download size={16} />
                  Download All
                </button>
                <button className="w-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg p-3 text-sm font-medium transition-all flex items-center justify-center gap-2">
                  <Mail size={16} />
                  Request Missing Docs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
