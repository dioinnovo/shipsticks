'use client'

import { useState } from 'react'
import { Users, Plus, Search, Filter, TrendingUp, AlertCircle, Activity, BarChart3 } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import PatientCard from '../_components/patient/PatientCard'
import { aggregatePatientData, getPatientStatistics, type Claim } from '@/lib/utils/patient-aggregation'

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState({
    riskLevel: 'all',
    coverageStatus: 'all',
    carrier: 'all'
  })

  // Sample customer shipment data (active shipments aggregated by customer)
  const activeClaims: Claim[] = [
    {
      id: 'SS-2024-001',
      patientName: 'Tom Bradley',
      mrn: 'CUST-784512',
      requestType: 'White Glove Service',
      condition: 'Professional Golfer - Tournament Equipment',
      status: 'In Transit',
      priority: 'High',
      policyCarrier: 'FedEx Priority',
      policyNumber: 'SS-2024-M845',
      requestedTreatment: 'Masters Tournament Delivery - Augusta',
      coverageStatus: 'Express Delivery',
      coverageGap: '$50 saved with AI routing',
      aiRecommendation: 'Alternative route via Atlanta hub - 8 hours faster',
      estimatedSavings: 50,
      nextAction: 'Arrival at Augusta Pro Shop tomorrow 2 PM',
      aiConfidence: 98,
      daysOpen: 2,
      lastActivity: '1 hour ago'
    },
    {
      id: 'SS-2024-002',
      patientName: 'Sarah Martinez',
      mrn: 'CUST-329847',
      requestType: 'Resort Package',
      condition: 'Weekend Golfer - Pebble Beach Trip',
      status: 'Delivered',
      priority: 'Medium',
      policyCarrier: 'Local Courier',
      policyNumber: 'SS-2024-PB392',
      requestedTreatment: 'Same-Day Pebble Beach Delivery',
      coverageStatus: 'Same-Day Service',
      coverageGap: '$60 saved with local carrier',
      aiRecommendation: 'Local courier 32% cheaper than FedEx, same ETA',
      estimatedSavings: 60,
      nextAction: 'Request review and testimonial',
      aiConfidence: 97,
      daysOpen: 1,
      lastActivity: '3 hours ago'
    },
    {
      id: 'SS-2024-003',
      patientName: 'David Thompson',
      mrn: 'CUST-567234',
      requestType: 'International Shipping',
      condition: 'Golf Pilgrimage - St. Andrews Old Course',
      status: 'Customs Cleared',
      priority: 'High',
      policyCarrier: 'DHL International Express',
      policyNumber: 'SS-2024-KI441',
      requestedTreatment: 'Direct Hotel Delivery - Scotland',
      coverageStatus: 'Customs Cleared',
      coverageGap: '$100 saved with bulk discount',
      aiRecommendation: 'Cleared UK customs 2 hours ahead of schedule',
      estimatedSavings: 100,
      nextAction: 'Coordinate with Rusacks St Andrews for delivery',
      aiConfidence: 96,
      daysOpen: 6,
      lastActivity: '2 hours ago'
    }
  ]

  // Aggregate patients from claims
  const patientsWithClaims = aggregatePatientData(activeClaims)

  // Filter patients
  const filteredPatients = patientsWithClaims.filter(patient => {
    const matchesSearch = searchQuery === '' ||
      patient.patientInfo.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.patientInfo.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.patientInfo.currentConditions.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
      patient.patientInfo.carrier.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRiskLevel = activeFilters.riskLevel === 'all' || patient.riskLevel === activeFilters.riskLevel
    const matchesCoverageStatus = activeFilters.coverageStatus === 'all' ||
      (activeFilters.coverageStatus === 'issues' && patient.coverageIssuesCount > 0) ||
      (activeFilters.coverageStatus === 'clean' && patient.coverageIssuesCount === 0)
    const matchesCarrier = activeFilters.carrier === 'all' || patient.patientInfo.carrier === activeFilters.carrier

    return matchesSearch && matchesRiskLevel && matchesCoverageStatus && matchesCarrier
  })

  // Get statistics
  const stats = getPatientStatistics(patientsWithClaims)

  return (
    <div className="space-y-4">
      {/* Header */}
      <PageHeader
        title="Customer Hub"
        description="Comprehensive customer overview with shipment tracking and delivery analytics"
        action={
          <button
            className="h-12 px-6 bg-arthur-blue text-white rounded-full hover:bg-arthur-blue-dark flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto transition-colors"
          >
            <Plus size={20} />
            <span className="font-medium">New Customer</span>
          </button>
        }
      />

      {/* KPI Cards - Customer Focused */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Customers</p>
            <Users className="text-arthur-blue" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalPatients}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">With active shipments</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Delivery Issues</p>
            <AlertCircle className="text-orange-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-orange-600">
            {stats.patientsWithCoverageIssues}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Shipments need attention</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Priority Shipments</p>
            <Activity className="text-red-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-red-600">
            {stats.highRiskPatients}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Require close monitoring</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Shipments/Customer</p>
            <BarChart3 className="text-emerald-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-emerald-600">
            {stats.avgClaimsPerPatient}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Active deliveries</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 sm:p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search by customer name, ID, destination, or shipping carrier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-arthur-blue focus:border-arthur-blue transition-all"
            />
          </div>

          {/* Filter Options */}
          <div className="flex flex-wrap gap-3">
            {/* Priority Level Filter */}
            <select
              value={activeFilters.riskLevel}
              onChange={(e) => setActiveFilters({...activeFilters, riskLevel: e.target.value})}
              className="px-4 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-arthur-blue focus:border-arthur-blue text-sm transition-all"
            >
              <option value="all">All Priority Levels</option>
              <option value="Critical">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Standard</option>
            </select>

            {/* Delivery Status Filter */}
            <select
              value={activeFilters.coverageStatus}
              onChange={(e) => setActiveFilters({...activeFilters, coverageStatus: e.target.value})}
              className="px-4 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-arthur-blue focus:border-arthur-blue text-sm transition-all"
            >
              <option value="all">All Delivery Status</option>
              <option value="issues">Has Delivery Issues</option>
              <option value="clean">On Schedule</option>
            </select>

            {/* Carrier Filter */}
            <select
              value={activeFilters.carrier}
              onChange={(e) => setActiveFilters({...activeFilters, carrier: e.target.value})}
              className="px-4 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-arthur-blue focus:border-arthur-blue text-sm transition-all"
            >
              <option value="all">All Carriers</option>
              <option value="FedEx Priority">FedEx Priority</option>
              <option value="Local Courier">Local Courier</option>
              <option value="DHL International Express">DHL International</option>
              <option value="UPS Ground">UPS Ground</option>
            </select>

            {/* Clear Filters Button */}
            {(searchQuery || activeFilters.riskLevel !== 'all' || activeFilters.coverageStatus !== 'all' || activeFilters.carrier !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setActiveFilters({ riskLevel: 'all', coverageStatus: 'all', carrier: 'all' })
                }}
                className="px-4 py-2 text-sm text-arthur-blue hover:bg-arthur-blue/10 rounded-lg transition-colors flex items-center gap-2"
              >
                <Filter size={16} />
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Customers</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">{filteredPatients.length} customers</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => (
            <PatientCard key={patient.patientInfo.mrn} patient={patient} />
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">No customers found</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* AI Insights Panel */}
      <div className="bg-gradient-to-br from-arthur-blue to-blue-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={24} />
          <h2 className="text-xl font-bold">Ship Sticks AI Customer Insights</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={18} />
              <h3 className="font-semibold">Priority Shipment Alert</h3>
            </div>
            <p className="text-sm text-white/90">{stats.highRiskPatients} priority shipments require immediate attention. Tournament deliveries and time-sensitive routes detected with potential weather delays.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={18} />
              <h3 className="font-semibold">Route Optimization</h3>
            </div>
            <p className="text-sm text-white/90">{stats.patientsWithCoverageIssues} shipments have delivery concerns. AI-recommended alternative routes available with faster delivery times and lower costs.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 size={18} />
              <h3 className="font-semibold">Customer Experience Opportunity</h3>
            </div>
            <p className="text-sm text-white/90">Avg {stats.avgClaimsPerPatient} active shipments per customer. Implement multi-shipment tracking dashboard to improve customer satisfaction by 35%.</p>
          </div>
        </div>
      </div>

    </div>
  )
}
