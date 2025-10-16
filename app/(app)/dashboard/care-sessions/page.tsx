'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, Search, Filter, Clock, CheckCircle, AlertCircle,
  Activity, Heart, Brain, Shield, Stethoscope, Wind,
  TrendingUp, Users, Calendar, ChevronRight, Target, Mic,
  FileText, Pill, CalendarCheck, Thermometer, Droplet
} from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/page-header'
import { CLINICAL_PATHWAYS } from '@/lib/constants/healthcare-terminology'

interface Shipment {
  id: string
  customerName: string
  trackingNumber: string
  shipmentType: string
  status: 'active' | 'scheduled' | 'completed' | 'in-transit'
  shipDate: string
  nextMilestone: string
  progress: number
  coordinator: string
  priority: string
  outcomes: {
    onTimeDelivery: number
    serviceScore: number
    costSavings: number
  }
  customerNote?: string
  handlingNotes?: string
  packageDetails?: {
    weight?: string
    dimensions?: string
    carrier?: string
    insurance?: number
    temperature?: number
  }
  itemCount?: number
  deliveryWindowScheduled?: number
}

export default function ShipmentsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPathway, setFilterPathway] = useState('all')

  const activeShipments: Shipment[] = [
    {
      id: 'CS-001',
      patientName: 'Margaret Thompson',
      mrn: 'MRN-784512',
      sessionType: 'Diabetes Management Check-in',
      status: 'active',
      startDate: '2024-02-15',
      nextMilestone: 'Endocrinology Follow-up',
      progress: 72,
      careManager: 'Sarah Chen, RN',
      riskScore: 'High',
      outcomes: {
        adherence: 88,
        qualityScore: 92,
        costSavings: 24500
      },
      voiceNote: 'Patient reports consistent BG monitoring 4x daily. A1C down from 9.2% to 7.8%. Experiencing some dawn phenomenon - coordinating with endocrinologist for basal insulin adjustment. Diet adherence excellent, walking 30 min daily. No hypoglycemic episodes this month.',
      clinicalNotes: 'Follow-up visit completed. Patient demonstrates good understanding of carb counting and insulin dosing. Foot exam WNL, no neuropathy signs. Retinal screening scheduled next week. Continue current medication regimen, increase metformin to 1000mg BID.',
      vitalSigns: {
        bloodPressure: '128/82',
        heartRate: 76,
        temperature: 98.4,
        weight: 182,
        oxygenSaturation: 98
      },
      medicationCount: 6,
      appointmentsScheduled: 3
    },
    {
      id: 'CS-002',
      patientName: 'James Mitchell',
      mrn: 'MRN-784513',
      sessionType: 'Post-Discharge Follow-up',
      status: 'active',
      startDate: '2024-02-20',
      nextMilestone: 'Home Health Coordination',
      progress: 45,
      careManager: 'Michael Davis, RN',
      riskScore: 'Medium',
      outcomes: {
        adherence: 75,
        qualityScore: 85,
        costSavings: 15200
      },
      voiceNote: 'Post-op day 14 from total hip replacement. Patient ambulating well with walker, pain controlled with oral meds. Incision healing appropriately, no signs of infection. PT 3x weekly going well. Family support strong, spouse assisting with ADLs.',
      clinicalNotes: 'Home visit conducted. Surgical site clean, dry, intact. ROM improving, able to perform prescribed exercises independently. Discussed fall prevention strategies. DME setup complete including raised toilet seat, shower chair. Next wound check in 1 week.',
      vitalSigns: {
        bloodPressure: '132/78',
        heartRate: 68,
        temperature: 98.6,
        weight: 195,
        oxygenSaturation: 97
      },
      medicationCount: 4,
      appointmentsScheduled: 5
    },
    {
      id: 'CS-003',
      patientName: 'Robert Chen',
      mrn: 'MRN-784514',
      sessionType: 'Chronic Care Management',
      status: 'monitoring',
      startDate: '2024-03-01',
      nextMilestone: 'Wound Check',
      progress: 90,
      careManager: 'Jennifer Park, MSW',
      riskScore: 'Low',
      outcomes: {
        adherence: 95,
        qualityScore: 98,
        costSavings: 32000
      },
      voiceNote: 'Venous stasis ulcer showing excellent healing progress. Wound size decreased from 3.2cm to 0.8cm diameter. Patient compliant with compression therapy and leg elevation. No signs of infection. Teaching reinforced re: proper wound care technique. Ready to transition to monthly monitoring.',
      clinicalNotes: 'Wound assessment completed. Granulation tissue present, minimal drainage. Periwound skin intact. Patient verbalizes understanding of warning signs. Photos documented in EHR. Continue current wound care regimen with weekly dressing changes. Nutrition consult completed, protein intake optimized.',
      vitalSigns: {
        bloodPressure: '118/72',
        heartRate: 72,
        temperature: 98.2,
        weight: 178,
        oxygenSaturation: 99
      },
      medicationCount: 5,
      appointmentsScheduled: 2
    },
    {
      id: 'CS-004',
      patientName: 'James Wilson',
      mrn: 'MRN-784515',
      sessionType: 'Diabetes Management',
      status: 'scheduled',
      startDate: '2024-03-25',
      nextMilestone: 'Initial Assessment',
      progress: 0,
      careManager: 'Lisa Wong, RN',
      riskScore: 'High',
      outcomes: {
        adherence: 0,
        qualityScore: 0,
        costSavings: 0
      },
      voiceNote: 'New patient enrollment for comprehensive diabetes management. Recent A1C 10.2%, on oral agents only. History of poor adherence due to cost barriers and health literacy. Social work consult for medication assistance programs. Will need extensive education on self-monitoring and diet.',
      clinicalNotes: 'Initial intake assessment scheduled. Chart review shows uncontrolled T2DM with multiple gaps in care. No retinal exam in 3 years, foot exam overdue. Will coordinate comprehensive workup including labs, referrals. Patient expressed motivation for improved control after recent hospitalization.',
      vitalSigns: {
        bloodPressure: '142/88',
        heartRate: 82,
        temperature: 98.6,
        weight: 225,
        oxygenSaturation: 96
      },
      medicationCount: 3,
      appointmentsScheduled: 4
    }
  ]

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'scheduled': return 'bg-blue-100 text-blue-700'
      case 'completed': return 'bg-gray-100 text-gray-700'
      case 'monitoring': return 'bg-amber-100 text-amber-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getPathwayIcon = (pathwayType: string) => {
    if (!pathwayType) return Activity
    if (pathwayType.includes('Heart') || pathwayType.includes('CHF')) return Heart
    if (pathwayType.includes('COPD') || pathwayType.includes('Pulmonary')) return Wind
    if (pathwayType.includes('Diabetes')) return Activity
    if (pathwayType.includes('Behavioral') || pathwayType.includes('Mental')) return Brain
    if (pathwayType.includes('Preventive')) return Shield
    if (pathwayType.includes('Post-Surgical')) return Stethoscope
    return Activity
  }

  const filteredShipments = activeShipments.filter(shipment => {
    const matchesSearch =
      shipment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.shipmentType.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || shipment.status === filterStatus
    const matchesSession = filterPathway === 'all' || shipment.shipmentType === filterPathway
    return matchesSearch && matchesStatus && matchesSession
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Shipment Management"
        description="Active shipments and delivery tracking"
        action={
          <button
            className="h-12 px-6 bg-arthur-blue text-white rounded-full hover:bg-arthur-blue-dark flex items-center justify-center gap-2 w-full sm:w-auto transition-colors font-medium"
          >
            <Plus size={20} />
            <span>New Shipment</span>
          </button>
        }
      />

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-4">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by customer name, tracking number, or shipment type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-arthur-blue/30 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="monitoring">Monitoring</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={filterPathway}
              onChange={(e) => setFilterPathway(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Pathways</option>
              {CLINICAL_PATHWAYS.map(pathway => (
                <option key={pathway.id} value={pathway.name}>{pathway.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Active Shipments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredShipments.map((shipment) => {
          const Icon = getPathwayIcon(shipment.shipmentType)
          return (
            <div
              key={session.id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => router.push(`/dashboard/care-sessions/${session.id}/areas`)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-arthur-blue/10 rounded-lg flex items-center justify-center">
                    <Icon className="text-arthur-blue" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100">{session.patientName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{session.mrn}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(session.status)}`}>
                    {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    session.riskScore === 'High' ? 'bg-red-100 text-red-700' :
                    session.riskScore === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {session.riskScore} Risk
                  </span>
                </div>
              </div>

              {/* Session Info */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-arthur-blue mb-1">{session.sessionType}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    Started {session.startDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    {session.careManager}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Session Progress</span>
                  <span className="text-xs font-bold text-arthur-blue">{session.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-arthur-blue h-2 rounded-full transition-all"
                    style={{ width: `${session.progress}%` }}
                  />
                </div>
              </div>

              {/* Next Milestone */}
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Next Milestone</p>
                    <p className="text-sm font-semibold text-arthur-blue">{session.nextMilestone}</p>
                  </div>
                  <Target className="text-arthur-blue" size={20} />
                </div>
              </div>

              {/* Outcomes Metrics */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Adherence</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{session.outcomes.adherence}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Quality</p>
                  <p className="text-lg font-bold text-green-600">{session.outcomes.qualityScore}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Treatment Cost</p>
                  <p className="text-lg font-bold text-blue-600">${(session.outcomes.costSavings / 1000).toFixed(0)}k</p>
                </div>
              </div>

              {/* Voice Note */}
              {session.voiceNote && (
                <div className="mb-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Mic className="text-arthur-blue flex-shrink-0 mt-0.5" size={14} />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Voice Note</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">{session.voiceNote}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Clinical Notes */}
              {session.clinicalNotes && (
                <div className="mb-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <FileText className="text-purple-600 flex-shrink-0 mt-0.5" size={14} />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Clinical Notes</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">{session.clinicalNotes}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Vital Signs & Quick Stats */}
              {session.vitalSigns && (
                <div className="mb-3 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    <Thermometer size={14} className="text-green-600" />
                    Latest Vitals
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {session.vitalSigns.bloodPressure && (
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">BP</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{session.vitalSigns.bloodPressure}</p>
                      </div>
                    )}
                    {session.vitalSigns.heartRate && (
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">HR</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{session.vitalSigns.heartRate} bpm</p>
                      </div>
                    )}
                    {session.vitalSigns.oxygenSaturation && (
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">SpO2</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{session.vitalSigns.oxygenSaturation}%</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Medications & Appointments */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {session.medicationCount !== undefined && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <Pill size={12} className="text-orange-500" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">Medications</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{session.medicationCount} active</p>
                  </div>
                )}
                {session.appointmentsScheduled !== undefined && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <CalendarCheck size={12} className="text-blue-500" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">Appointments</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{session.appointmentsScheduled} scheduled</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-arthur-blue to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={24} />
          <h2 className="text-xl font-bold">Travel AI Shipping Insights</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <h3 className="font-semibold mb-2">Route Optimization</h3>
            <p className="text-sm opacity-90">12 shipments could benefit from consolidated routing to save $2,400 in delivery costs this week.</p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <h3 className="font-semibold mb-2">Weather Alert</h3>
            <p className="text-sm opacity-90">3 shipments may experience delays due to forecasted weather. Proactive customer notifications recommended.</p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <h3 className="font-semibold mb-2">Partner Opportunity</h3>
            <p className="text-sm opacity-90">5 new golf resorts requesting partnership. Projected $85K annual revenue opportunity.</p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredShipments.length === 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <AlertCircle className="text-gray-400 mx-auto mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No shipments found</h3>
          <p className="text-gray-600 dark:text-gray-400">Try adjusting your search criteria or create a new shipment</p>
        </div>
      )}
    </div>
  )
}