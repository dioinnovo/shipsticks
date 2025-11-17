'use client'

import { useState } from 'react'
import {
  Globe, Server, Database, Shield, Activity, CheckCircle,
  AlertCircle, Clock, ArrowRight, ArrowLeft, RefreshCw,
  Lock, Zap, FileText, Users, Building2, Heart,
  Stethoscope, Pill, Calendar, TrendingUp, Cloud
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'

interface Integration {
  id: string
  name: string
  type: 'ehr' | 'hie' | 'pharmacy' | 'lab' | 'imaging' | 'payer' | 'device'
  status: 'connected' | 'pending' | 'error' | 'disabled'
  description: string
  vendor?: string
  lastSync?: Date
  recordsSync?: number
  dataFlow: 'bidirectional' | 'inbound' | 'outbound'
  compliance: string[]
  features: string[]
}

interface DataFlow {
  source: string
  destination: string
  volume: number
  type: string
  frequency: string
}

export default function IntegrationsPage() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'ehr' | 'hie' | 'pharmacy' | 'lab' | 'payer'>('all')

  const integrations: Integration[] = [
    {
      id: '1',
      name: 'Epic MyChart',
      type: 'ehr',
      status: 'connected',
      description: 'Real-time patient data synchronization with Epic EHR',
      vendor: 'Epic Systems',
      lastSync: new Date(),
      recordsSync: 12847,
      dataFlow: 'bidirectional',
      compliance: ['HIPAA', 'HL7 FHIR', 'SMART on FHIR'],
      features: ['Patient Demographics', 'Clinical Notes', 'Lab Results', 'Medications', 'Allergies']
    },
    {
      id: '2',
      name: 'Cerner PowerChart',
      type: 'ehr',
      status: 'connected',
      description: 'Integration with Cerner Millennium platform',
      vendor: 'Oracle Cerner',
      lastSync: new Date(),
      recordsSync: 8934,
      dataFlow: 'bidirectional',
      compliance: ['HIPAA', 'HL7 v2.5', 'CDA'],
      features: ['ADT Feeds', 'Clinical Documentation', 'CPOE', 'Results Review']
    },
    {
      id: '3',
      name: 'Florida HIE',
      type: 'hie',
      status: 'connected',
      description: 'Statewide health information exchange connectivity',
      vendor: 'Florida Health Connect',
      lastSync: new Date(),
      recordsSync: 45623,
      dataFlow: 'inbound',
      compliance: ['HIPAA', 'Direct Protocol', 'IHE XDS.b'],
      features: ['Patient Matching', 'Document Query', 'Admission Alerts', 'Care Summaries']
    },
    {
      id: '4',
      name: 'Surescripts',
      type: 'pharmacy',
      status: 'connected',
      description: 'E-prescribing and medication history network',
      vendor: 'Surescripts LLC',
      lastSync: new Date(),
      recordsSync: 3421,
      dataFlow: 'bidirectional',
      compliance: ['NCPDP SCRIPT', 'DEA EPCS'],
      features: ['E-Prescribing', 'Medication History', 'Prior Auth', 'Real-Time Benefits']
    },
    {
      id: '5',
      name: 'Quest Diagnostics',
      type: 'lab',
      status: 'connected',
      description: 'Laboratory results and order management',
      vendor: 'Quest Diagnostics',
      lastSync: new Date(),
      recordsSync: 7812,
      dataFlow: 'bidirectional',
      compliance: ['CLIA', 'HL7 ORU', 'LOINC'],
      features: ['Lab Orders', 'Result Delivery', 'Critical Values', 'Trending']
    },
    {
      id: '6',
      name: 'Humana Claims API',
      type: 'payer',
      status: 'pending',
      description: 'Claims processing and eligibility verification',
      vendor: 'Humana Inc.',
      dataFlow: 'bidirectional',
      compliance: ['X12 EDI', 'CAQH CORE'],
      features: ['Eligibility Check', 'Prior Auth', 'Claims Status', 'Remittance']
    },
    {
      id: '7',
      name: 'Athenahealth',
      type: 'ehr',
      status: 'error',
      description: 'Cloud-based EHR and practice management',
      vendor: 'Athenahealth',
      lastSync: new Date(Date.now() - 86400000),
      recordsSync: 0,
      dataFlow: 'bidirectional',
      compliance: ['HIPAA', 'REST API', 'OAuth 2.0'],
      features: ['Appointments', 'Clinical Data', 'Billing', 'Patient Portal']
    }
  ]

  const dataFlows: DataFlow[] = [
    { source: 'Epic MyChart', destination: 'Care Coordination', volume: 2847, type: 'Clinical Data', frequency: 'Real-time' },
    { source: 'Florida HIE', destination: 'Arthur', volume: 8923, type: 'Care Summaries', frequency: 'Daily' },
    { source: 'Quest Labs', destination: 'Clinical Pathways', volume: 1247, type: 'Lab Results', frequency: 'Hourly' },
    { source: 'Surescripts', destination: 'Medication Management', volume: 634, type: 'Rx Data', frequency: 'Real-time' }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'error': return 'bg-red-100 text-red-700'
      case 'disabled': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ehr': return FileText
      case 'hie': return Globe
      case 'pharmacy': return Pill
      case 'lab': return Activity
      case 'imaging': return Heart
      case 'payer': return Building2
      case 'device': return Stethoscope
      default: return Server
    }
  }

  const filteredIntegrations = integrations.filter(integration =>
    selectedCategory === 'all' || integration.type === selectedCategory
  )

  // Calculate statistics
  const stats = {
    totalIntegrations: integrations.length,
    connectedSystems: integrations.filter(i => i.status === 'connected').length,
    totalRecords: integrations.reduce((acc, i) => acc + (i.recordsSync || 0), 0),
    dataPoints: 2.4 // millions
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Healthcare Integrations"
        description="EHR, HIE, and clinical system connectivity"
        action={
          <button className="h-12 px-6 bg-arthur-blue text-white rounded-full hover:bg-arthur-blue-dark flex items-center justify-center gap-2 transition-colors">
            <Cloud size={20} />
            <span>Add Integration</span>
          </button>
        }
      />

      {/* Integration Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <Server className="text-arthur-blue" size={20} />
            <span className="text-xs text-green-600 font-semibold">Active</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalIntegrations}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Integrations</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="text-green-600" size={20} />
            <span className="text-xs text-green-600 font-semibold">86%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.connectedSystems}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Connected Systems</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <Database className="text-purple-600" size={20} />
            <span className="text-xs text-green-600 font-semibold">+12K/day</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{(stats.totalRecords / 1000).toFixed(0)}K</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Records Synced</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <Zap className="text-amber-600" size={20} />
            <span className="text-xs text-green-600 font-semibold">Real-time</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.dataPoints}M</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Data Points/Month</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'ehr', 'hie', 'pharmacy', 'lab', 'payer'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-arthur-blue text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category === 'all' ? 'All Systems' :
               category === 'ehr' ? 'EHR Systems' :
               category === 'hie' ? 'Health Information Exchange' :
               category === 'pharmacy' ? 'Pharmacy Networks' :
               category === 'lab' ? 'Laboratory' :
               'Payer Systems'}
            </button>
          ))}
        </div>
      </div>

      {/* Active Integrations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredIntegrations.map((integration) => {
          const Icon = getTypeIcon(integration.type)

          return (
            <div key={integration.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-arthur-blue/10 rounded-lg flex items-center justify-center">
                    <Icon className="text-arthur-blue" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{integration.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{integration.vendor}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(integration.status)}`}>
                  {integration.status === 'connected' && <CheckCircle size={12} className="inline mr-1" />}
                  {integration.status === 'error' && <AlertCircle size={12} className="inline mr-1" />}
                  {integration.status === 'pending' && <Clock size={12} className="inline mr-1" />}
                  {integration.status}
                </span>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{integration.description}</p>

              {/* Data Flow Indicator */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-gray-500 dark:text-gray-400">Data Flow:</span>
                <div className="flex items-center gap-1">
                  {integration.dataFlow === 'bidirectional' ? (
                    <>
                      <ArrowLeft size={14} className="text-arthur-blue" />
                      <ArrowRight size={14} className="text-arthur-blue" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Bidirectional</span>
                    </>
                  ) : integration.dataFlow === 'inbound' ? (
                    <>
                      <ArrowLeft size={14} className="text-arthur-blue" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Inbound</span>
                    </>
                  ) : (
                    <>
                      <ArrowRight size={14} className="text-arthur-blue" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Outbound</span>
                    </>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Supported Features:</p>
                <div className="flex flex-wrap gap-1">
                  {integration.features.map((feature, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Compliance Standards */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Compliance:</p>
                <div className="flex flex-wrap gap-1">
                  {integration.compliance.map((standard, idx) => (
                    <span key={idx} className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs rounded flex items-center gap-1">
                      <Shield size={10} />
                      {standard}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sync Status */}
              {integration.status === 'connected' && integration.lastSync && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500 dark:text-gray-400">
                        Last sync: {integration.lastSync.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {integration.recordsSync?.toLocaleString()} records
                      </span>
                    </div>
                    <button className="flex items-center gap-1 text-arthur-blue hover:text-arthur-blue-dark">
                      <RefreshCw size={12} />
                      Sync Now
                    </button>
                  </div>
                </div>
              )}

              {integration.status === 'error' && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-red-600">Connection failed - Authentication error</span>
                    <button className="text-xs text-arthur-blue hover:text-arthur-blue-dark font-medium">
                      Reconnect
                    </button>
                  </div>
                </div>
              )}

              {integration.status === 'pending' && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-amber-600">Awaiting vendor approval</span>
                    <button className="text-xs text-arthur-blue hover:text-arthur-blue-dark font-medium">
                      Check Status
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Real-time Data Flow */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-arthur-blue" />
          Real-time Data Flow
        </h2>

        <div className="space-y-3">
          {dataFlows.map((flow, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{flow.source}</div>
                <ArrowRight className="text-arthur-blue" size={16} />
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{flow.destination}</div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span>{flow.type}</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{flow.volume.toLocaleString()} records</span>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded">
                  {flow.frequency}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integration Security */}
      <div className="bg-gradient-to-r from-arthur-blue to-blue-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={24} />
          <h2 className="text-xl font-bold">Integration Security & Compliance</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <h3 className="font-semibold mb-2">HIPAA Compliant</h3>
            <p className="text-sm opacity-90">All integrations meet HIPAA security requirements with end-to-end encryption.</p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <h3 className="font-semibold mb-2">SOC 2 Type II</h3>
            <p className="text-sm opacity-90">Annual security audits ensure data protection and system reliability.</p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <h3 className="font-semibold mb-2">HITRUST Certified</h3>
            <p className="text-sm opacity-90">Comprehensive security framework for healthcare information protection.</p>
          </div>
        </div>
      </div>
    </div>
  )
}