'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, User, Phone, Mail, MapPin, Calendar, Users,
  FileText, Camera, History, Shield, CheckCircle, Clock, AlertTriangle,
  DollarSign, Download, Edit, Save, X, Plus, Upload, Eye, Send,
  TrendingUp, AlertCircle, FileSearch, Briefcase, Star, CalendarCheck,
  Activity, Check, Target, Zap, Brain, Calculator, ChevronDown,
  Heart, Stethoscope, Pill, Home, UserCheck, MessageSquare
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { SectionHeader } from '@/components/ui/section-header'
import { CarePlanCard } from '../../_components/care-coordination/care-plan-card'

interface CareTeamMember {
  role: string
  name: string
  specialty?: string
  phone: string
  lastContact?: string
}

interface CareGoal {
  id: string
  description: string
  target: string
  current: string
  status: 'on-track' | 'at-risk' | 'achieved'
  dueDate: string
}

interface Intervention {
  id: string
  type: string
  description: string
  frequency: string
  provider: string
  status: 'scheduled' | 'in-progress' | 'completed'
  nextDate?: string
}

export default function CareCoordinationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [carePlans, setCarePlans] = useState<any[]>([])

  // Mock patient data
  const patient = {
    id: params.id,
    caseId: 'CASE-2024-001',
    status: 'Active Care',
    riskLevel: 'High',
    enrollmentDate: '2024-01-15',
    lastAssessment: '2024-03-18',
    nextReview: '2024-04-15',

    // Patient Demographics
    demographics: {
      name: 'James Mitchell',
      mrn: 'MRN-45678',
      dateOfBirth: '1965-03-15',
      age: 59,
      gender: 'Male',
      phone: '(305) 555-0123',
      email: 'jmitchell@email.com',
      address: '1234 Oak Street, Atlanta, GA 30309',
      preferredLanguage: 'English',
      emergencyContact: {
        name: 'Sarah Mitchell',
        relationship: 'Spouse',
        phone: '(305) 555-0124'
      }
    },

    // Clinical Summary
    clinical: {
      primaryDiagnosis: 'Type 2 Diabetes with Complications',
      icd10Codes: ['E11.65', 'E11.9', 'I10', 'N18.3'],
      hccScore: 3.245,
      comorbidities: [
        'Hypertension - Uncontrolled',
        'Chronic Kidney Disease Stage 3',
        'Obesity (BMI 32.5)',
        'Dyslipidemia'
      ],
      medications: [
        { name: 'Metformin', dose: '1000mg', frequency: 'BID', adherence: 85 },
        { name: 'Lisinopril', dose: '20mg', frequency: 'QD', adherence: 92 },
        { name: 'Atorvastatin', dose: '40mg', frequency: 'QD', adherence: 88 },
        { name: 'Insulin Glargine', dose: '25 units', frequency: 'QHS', adherence: 78 }
      ],
      allergies: ['Penicillin - Rash', 'Sulfa - Anaphylaxis'],
      vitalSigns: {
        bp: '156/92',
        pulse: 78,
        temp: '98.6°F',
        weight: '210 lbs',
        bmi: 32.5,
        lastUpdated: '2024-03-18'
      },
      labResults: {
        a1c: { value: 11.2, date: '2024-03-10', trend: 'worsening' },
        creatinine: { value: 1.8, date: '2024-03-10', trend: 'stable' },
        ldl: { value: 145, date: '2024-03-10', trend: 'improving' },
        egfr: { value: 42, date: '2024-03-10', trend: 'stable' }
      }
    },

    // Care Team
    careTeam: [
      { role: 'Primary Care Physician', name: 'Dr. Sarah Chen', phone: '(404) 555-0100', lastContact: '2024-03-15' },
      { role: 'Care Coordinator', name: 'Maria Rodriguez, RN', phone: '(404) 555-0101', lastContact: 'Today' },
      { role: 'Endocrinologist', name: 'Dr. David Kim', specialty: 'Diabetes Management', phone: '(404) 555-0102', lastContact: '2024-03-01' },
      { role: 'Nephrologist', name: 'Dr. Jennifer Lee', specialty: 'Kidney Disease', phone: '(404) 555-0103', lastContact: '2024-02-15' },
      { role: 'Clinical Pharmacist', name: 'John Davis, PharmD', phone: '(404) 555-0104', lastContact: '2024-03-10' },
      { role: 'Dietitian', name: 'Lisa Brown, RD', phone: '(404) 555-0105', lastContact: '2024-03-05' },
      { role: 'Social Worker', name: 'Linda Thompson, LCSW', phone: '(404) 555-0106', lastContact: '2024-02-28' }
    ],

    // Care Goals
    careGoals: [
      { id: '1', description: 'Reduce HbA1c', target: '< 7.0%', current: '11.2%', status: 'at-risk', dueDate: '2024-06-30' },
      { id: '2', description: 'Blood Pressure Control', target: '< 130/80', current: '156/92', status: 'at-risk', dueDate: '2024-04-30' },
      { id: '3', description: 'Weight Loss', target: '5% reduction', current: '0%', status: 'at-risk', dueDate: '2024-06-30' },
      { id: '4', description: 'Medication Adherence', target: '> 90%', current: '85%', status: 'on-track', dueDate: '2024-04-30' },
      { id: '5', description: 'Prevent Hospitalization', target: '0 admits', current: '0 admits', status: 'on-track', dueDate: '2024-12-31' }
    ],

    // Active Interventions
    interventions: [
      { id: '1', type: 'Monitoring', description: 'Daily glucose monitoring via CGM', frequency: 'Daily', provider: 'Self/RN', status: 'in-progress' },
      { id: '2', type: 'Education', description: 'Diabetes self-management education', frequency: 'Weekly', provider: 'RN/CDE', status: 'scheduled', nextDate: '2024-03-25' },
      { id: '3', type: 'Counseling', description: 'Nutritional counseling', frequency: 'Bi-weekly', provider: 'Dietitian', status: 'scheduled', nextDate: '2024-03-28' },
      { id: '4', type: 'Medication', description: 'Medication therapy management', frequency: 'Monthly', provider: 'Pharmacist', status: 'completed' },
      { id: '5', type: 'Behavioral', description: 'Depression screening and support', frequency: 'Monthly', provider: 'LCSW', status: 'scheduled', nextDate: '2024-04-15' }
    ],

    // Insurance Information
    insurance: {
      plan: 'Medicare Advantage',
      planName: 'HealthFirst Plus',
      memberId: 'MA123456789',
      groupNumber: 'GRP-001',
      effectiveDate: '2023-01-01',
      copay: '$20',
      deductible: '$500',
      deductibleMet: '$350',
      outOfPocketMax: '$3,500',
      outOfPocketCurrent: '$1,250',
      priorAuthRequired: ['Specialist visits', 'Advanced imaging', 'DME'],
      caseManager: 'Susan White, RN',
      caseManagerPhone: '1-800-555-0100'
    },

    // Cost & Utilization
    utilization: {
      currentYearCost: 45000,
      projectedAnnualCost: 125000,
      costSavingsYTD: 12000,
      edVisits: { ytd: 2, lastYear: 5 },
      hospitalizations: { ytd: 0, lastYear: 2 },
      specialistVisits: { ytd: 8, lastYear: 12 },
      rxCost: { monthly: 450, annual: 5400 },
      qualityMetrics: {
        hedisGaps: 2,
        starRating: 3.5,
        patientSatisfaction: 4.2
      }
    },

    // Recent Activity
    recentActivity: [
      { date: '2024-03-18', type: 'Care Call', description: 'Weekly check-in completed', outcome: 'Stable, adherent to medications' },
      { date: '2024-03-15', type: 'PCP Visit', description: 'Routine follow-up', outcome: 'Medication adjustment, labs ordered' },
      { date: '2024-03-10', type: 'Lab Results', description: 'Quarterly labs completed', outcome: 'A1c worsened to 11.2%' },
      { date: '2024-03-05', type: 'Pharmacy', description: 'Medication refill', outcome: 'All medications refilled, 90-day supply' },
      { date: '2024-02-28', type: 'ED Visit', description: 'Hyperglycemia episode', outcome: 'Treated and released, no admission' }
    ]
  }

  // Load approved care plans for this patient from localStorage
  useEffect(() => {
    const loadPatientCarePlans = () => {
      const allPlans: any[] = []

      // Check if we're in the browser
      if (typeof window === 'undefined') return []

      // Iterate through localStorage to find care plans for this patient
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('care-plan-')) {
          try {
            const planData = localStorage.getItem(key)
            if (planData) {
              const plan = JSON.parse(planData)
              // Filter by patient MRN and approved status
              if (plan.patient?.mrn === patient.demographics.mrn && plan.status === 'approved') {
                allPlans.push({
                  reportId: plan.reportId,
                  sessionId: plan.careSession?.id || key.replace('care-plan-', ''),
                  generatedDate: plan.generatedDate,
                  qualityScore: plan.careSession?.qualityScore || 0,
                  careGapsIdentified: plan.careGaps?.length || 0,
                  annualSavings: plan.costOptimization?.annualSavings || 0,
                  completedAssessments: plan.careSession?.completedAssessments || 0,
                  status: plan.status
                })
              }
            }
          } catch (error) {
            console.error('Error parsing care plan:', error)
          }
        }
      }

      // Sort by date (most recent first)
      return allPlans.sort((a, b) =>
        new Date(b.generatedDate).getTime() - new Date(a.generatedDate).getTime()
      )
    }

    setCarePlans(loadPatientCarePlans())
  }, [patient.demographics.mrn])

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'clinical', label: 'Clinical', icon: Stethoscope },
    { id: 'care-goals', label: 'Care Goals', icon: Target },
    { id: 'care-plans', label: 'Care Plans', icon: Shield },
    { id: 'team', label: 'Care Team', icon: Users },
    { id: 'timeline', label: 'Timeline', icon: History },
    { id: 'documents', label: 'Documents', icon: FileSearch },
    { id: 'costs', label: 'Cost & Quality', icon: TrendingUp }
  ]

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active Care': return 'bg-green-100 text-green-800'
      case 'High': return 'bg-red-100 text-red-800'
      case 'on-track': return 'bg-green-100 text-green-800'
      case 'at-risk': return 'bg-yellow-100 text-yellow-800'
      case 'achieved': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskColor = (level: string) => {
    switch(level) {
      case 'High': return 'text-red-600 bg-red-50'
      case 'Medium': return 'text-yellow-600 bg-yellow-50'
      case 'Low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            onClick={() => router.push('/dashboard/claims')}
            variant="ghost"
            className="text-gray-600 hover:text-gray-900 dark:text-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back to Shipments</span>
          </Button>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(patient.status)}`}>
              {patient.status}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(patient.riskLevel)}`}>
              {patient.riskLevel} Risk
            </span>
          </div>
        </div>

        {/* Patient Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-arthur-blue/10 flex items-center justify-center">
              <User className="w-8 h-8 text-arthur-blue" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {patient.demographics.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                <span>MRN: {patient.demographics.mrn}</span>
                <span>•</span>
                <span>DOB: {patient.demographics.dateOfBirth} (Age {patient.demographics.age})</span>
                <span>•</span>
                <span>Case #{patient.caseId}</span>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="inline w-4 h-4 mr-1" />
                  {patient.demographics.phone}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="inline w-4 h-4 mr-1" />
                  {patient.demographics.email}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowMessageModal(true)}
              className="bg-arthur-blue hover:bg-arthur-blue-hover text-white"
            >
              <MessageSquare className="w-4 h-4" />
              Message Team
            </Button>
            <Button variant="secondary">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">HCC Score</p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{patient.clinical.hccScore}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">HbA1c</p>
            <p className="text-xl font-bold text-red-600">{patient.clinical.labResults.a1c.value}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">BP</p>
            <p className="text-xl font-bold text-yellow-600">{patient.clinical.vitalSigns.bp}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">ED Visits (YTD)</p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{patient.utilization.edVisits.ytd}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Cost Savings</p>
            <p className="text-xl font-bold text-green-600">${(patient.utilization.costSavingsYTD / 1000).toFixed(1)}k</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'border-arthur-blue text-arthur-blue'
                      : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400'
                    }
                  `}
                >
                  <Icon size={16} />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Primary Diagnosis & Comorbidities */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Clinical Summary</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-900">Primary Diagnosis</span>
                  </div>
                  <p className="text-red-800">{patient.clinical.primaryDiagnosis}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {patient.clinical.icd10Codes.map((code) => (
                      <span key={code} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                        {code}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Comorbidities</h4>
                    <ul className="space-y-2">
                      {patient.clinical.comorbidities.map((condition, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-gray-400 mt-0.5" />
                          <span>{condition}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Active Medications</h4>
                    <ul className="space-y-2">
                      {patient.clinical.medications.map((med, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Pill className="w-4 h-4 text-arthur-blue mt-0.5" />
                          <div>
                            <span className="font-medium">{med.name}</span>
                            <span className="text-gray-600"> - {med.dose} {med.frequency}</span>
                            <span className={`ml-2 text-xs ${med.adherence >= 90 ? 'text-green-600' : 'text-yellow-600'}`}>
                              ({med.adherence}% adherence)
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
                <div className="space-y-3">
                  {patient.recentActivity.map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-arthur-blue mt-2"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{activity.type}</span>
                          <span className="text-xs text-gray-500">{activity.date}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{activity.description}</p>
                        {activity.outcome && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                            <span className="font-medium">Outcome:</span> {activity.outcome}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'care-goals' && (
            <div className="space-y-6">
              {/* Care Goals */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Care Goals</h3>
                <div className="space-y-3">
                  {patient.careGoals.map((goal) => (
                    <div key={goal.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{goal.description}</h4>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="text-gray-600">Target: <span className="font-medium text-gray-900">{goal.target}</span></span>
                            <span className="text-gray-600">Current: <span className="font-medium text-gray-900">{goal.current}</span></span>
                            <span className="text-gray-600">Due: {goal.dueDate}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                          {goal.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Interventions */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Active Interventions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {patient.interventions.map((intervention) => (
                    <div key={intervention.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-1 bg-arthur-blue/10 text-arthur-blue rounded text-xs font-medium">
                          {intervention.type}
                        </span>
                        <span className={`text-xs ${intervention.status === 'completed' ? 'text-green-600' : 'text-gray-600'}`}>
                          {intervention.status}
                        </span>
                      </div>
                      <h4 className="font-medium text-sm mb-1">{intervention.description}</h4>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>Frequency: {intervention.frequency}</p>
                        <p>Provider: {intervention.provider}</p>
                        {intervention.nextDate && <p>Next: {intervention.nextDate}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'care-plans' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Approved Care Plans</h3>
                <Button
                  onClick={() => router.push('/dashboard/care-sessions/new')}
                  className="bg-arthur-blue hover:bg-arthur-blue-hover text-white"
                >
                  <Plus size={16} />
                  New Care Session
                </Button>
              </div>

              {carePlans.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {carePlans.map((plan) => (
                    <CarePlanCard
                      key={plan.reportId}
                      reportId={plan.reportId}
                      sessionId={plan.sessionId}
                      generatedDate={plan.generatedDate}
                      qualityScore={plan.qualityScore}
                      careGapsIdentified={plan.careGapsIdentified}
                      annualSavings={plan.annualSavings}
                      completedAssessments={plan.completedAssessments}
                      status={plan.status}
                      onClick={() => router.push(`/dashboard/care-sessions/${plan.sessionId}/report`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                    <Shield className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No Approved Care Plans Yet
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4 max-w-md">
                    Care plans will appear here once care coordination sessions are completed and approved.
                  </p>
                  <Button
                    onClick={() => router.push('/dashboard/care-sessions/new')}
                    className="bg-arthur-blue hover:bg-arthur-blue-hover text-white"
                  >
                    <Plus size={16} />
                    Start New Care Session
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-3">Care Team Members</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {patient.careTeam.map((member, idx) => (
                  <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm text-gray-600">{member.role}</p>
                        {member.specialty && (
                          <p className="text-xs text-gray-500">{member.specialty}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <a href={`tel:${member.phone}`} className="text-sm text-arthur-blue hover:underline">
                            {member.phone}
                          </a>
                        </div>
                        {member.lastContact && (
                          <p className="text-xs text-gray-500 mt-1">Last contact: {member.lastContact}</p>
                        )}
                      </div>
                      <button className="text-arthur-blue hover:text-arthur-blue-hover">
                        <MessageSquare size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'costs' && (
            <div className="space-y-6">
              {/* Cost Summary */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Cost & Utilization</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-xs text-gray-600 dark:text-gray-400">YTD Cost</p>
                    <p className="text-xl font-bold">${(patient.utilization.currentYearCost / 1000).toFixed(1)}k</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Projected Annual</p>
                    <p className="text-xl font-bold">${(patient.utilization.projectedAnnualCost / 1000).toFixed(0)}k</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Savings YTD</p>
                    <p className="text-xl font-bold text-green-600">${(patient.utilization.costSavingsYTD / 1000).toFixed(1)}k</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Rx Cost/Month</p>
                    <p className="text-xl font-bold">${patient.utilization.rxCost.monthly}</p>
                  </div>
                </div>
              </div>

              {/* Quality Metrics */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Quality Metrics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">HEDIS Gap Closure</span>
                      <span className="text-2xl font-bold">{patient.utilization.qualityMetrics.hedisGaps}</span>
                    </div>
                    <p className="text-xs text-gray-600">Open care gaps</p>
                  </div>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Star Rating</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i < Math.floor(patient.utilization.qualityMetrics.starRating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">{patient.utilization.qualityMetrics.starRating}/5.0</p>
                  </div>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Patient Satisfaction</span>
                      <span className="text-2xl font-bold">{patient.utilization.qualityMetrics.patientSatisfaction}</span>
                    </div>
                    <p className="text-xs text-gray-600">CAHPS Score</p>
                  </div>
                </div>
              </div>

              {/* Utilization Comparison */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Utilization Trends</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm font-medium">ED Visits</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">YTD: {patient.utilization.edVisits.ytd}</span>
                      <span className="text-sm text-gray-500">Last Year: {patient.utilization.edVisits.lastYear}</span>
                      <span className="text-xs text-green-600">↓ {patient.utilization.edVisits.lastYear - patient.utilization.edVisits.ytd}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm font-medium">Hospitalizations</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">YTD: {patient.utilization.hospitalizations.ytd}</span>
                      <span className="text-sm text-gray-500">Last Year: {patient.utilization.hospitalizations.lastYear}</span>
                      <span className="text-xs text-green-600">↓ {patient.utilization.hospitalizations.lastYear - patient.utilization.hospitalizations.ytd}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm font-medium">Specialist Visits</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">YTD: {patient.utilization.specialistVisits.ytd}</span>
                      <span className="text-sm text-gray-500">Last Year: {patient.utilization.specialistVisits.lastYear}</span>
                      <span className="text-xs text-green-600">↓ {patient.utilization.specialistVisits.lastYear - patient.utilization.specialistVisits.ytd}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}