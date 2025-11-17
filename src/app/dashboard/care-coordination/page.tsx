'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, Filter, Users, Activity, AlertCircle, TrendingUp,
  Heart, Brain, Shield, Calendar, ChevronRight, Plus
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'

interface Patient {
  id: string
  name: string
  mrn: string
  dob: string
  riskLevel: 'High' | 'Medium' | 'Low'
  activeConditions: string[]
  careManager: string
  lastVisit: string
  nextAppointment: string
  activeSessions: number
  status: 'active' | 'monitoring' | 'stable'
}

export default function CareCoordinationPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRisk, setFilterRisk] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const patients: Patient[] = [
    {
      id: 'PT-2024-001',
      name: 'Margaret Thompson',
      mrn: 'MRN-784512',
      dob: '1965-04-15',
      riskLevel: 'High',
      activeConditions: ['Type 2 Diabetes', 'Hypertension', 'Hyperlipidemia'],
      careManager: 'Sarah Chen, RN',
      lastVisit: '2024-02-15',
      nextAppointment: '2024-03-15',
      activeSessions: 1,
      status: 'active'
    },
    {
      id: 'PT-2024-002',
      name: 'James Mitchell',
      mrn: 'MRN-784513',
      dob: '1972-08-22',
      riskLevel: 'Medium',
      activeConditions: ['Post-Surgical Recovery', 'CHF'],
      careManager: 'Michael Davis, RN',
      lastVisit: '2024-02-20',
      nextAppointment: '2024-03-10',
      activeSessions: 1,
      status: 'monitoring'
    },
    {
      id: 'PT-2024-003',
      name: 'Robert Chen',
      mrn: 'MRN-784514',
      dob: '1958-12-03',
      riskLevel: 'Low',
      activeConditions: ['Chronic Wound Care'],
      careManager: 'Jennifer Park, MSW',
      lastVisit: '2024-03-01',
      nextAppointment: '2024-03-20',
      activeSessions: 1,
      status: 'stable'
    }
  ]

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'High': return 'bg-red-100 text-red-700'
      case 'Medium': return 'bg-yellow-100 text-yellow-700'
      case 'Low': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-blue-100 text-blue-700'
      case 'monitoring': return 'bg-amber-100 text-amber-700'
      case 'stable': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredPatients = patients.filter(patient => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.mrn.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRisk = filterRisk === 'all' || patient.riskLevel === filterRisk
    const matchesStatus = filterStatus === 'all' || patient.status === filterStatus
    return matchesSearch && matchesRisk && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Care Coordination"
        description="Patient management and care coordination hub"
        action={
          <button
            className="h-12 px-6 bg-arthur-blue text-white rounded-full hover:bg-arthur-blue-dark flex items-center justify-center gap-2 w-full sm:w-auto transition-colors font-medium"
          >
            <Plus size={20} />
            <span>Add Patient</span>
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
              placeholder="Search by patient name or MRN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-arthur-blue/30 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Risk Levels</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Status</option>
              <option value="active">Active Care</option>
              <option value="monitoring">Monitoring</option>
              <option value="stable">Stable</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredPatients.map((patient) => (
          <div
            key={patient.id}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => router.push(`/dashboard/claims/${patient.id}`)}
          >
            <div className="flex items-start justify-between">
              {/* Patient Info */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-arthur-blue/10 rounded-full flex items-center justify-center">
                  <Users className="text-arthur-blue" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{patient.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{patient.mrn}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">DOB: {patient.dob}</p>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex flex-col items-end gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(patient.riskLevel)}`}>
                  {patient.riskLevel} Risk
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(patient.status)}`}>
                  {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Conditions */}
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Active Conditions</p>
              <div className="flex flex-wrap gap-2">
                {patient.activeConditions.map((condition, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md text-xs"
                  >
                    {condition}
                  </span>
                ))}
              </div>
            </div>

            {/* Care Details */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Care Manager</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{patient.careManager}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Last Visit</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{patient.lastVisit}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Next Appointment</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{patient.nextAppointment}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Active Sessions</p>
                <p className="text-sm font-medium text-arthur-blue">{patient.activeSessions}</p>
              </div>
            </div>

            {/* Action */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button className="w-full flex items-center justify-center gap-2 text-arthur-blue hover:text-arthur-blue-dark font-medium text-sm">
                View Patient Details
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredPatients.length === 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <AlertCircle className="text-gray-400 mx-auto mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No patients found</h3>
          <p className="text-gray-600 dark:text-gray-400">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  )
}
