'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  TrendingUp, Download, Eye, Search, Filter, Calendar, CheckCircle,
  AlertCircle, Clock, Users, DollarSign, Activity, Heart,
  Award, Target, BarChart3, PieChart, LineChart, ArrowUp,
  ArrowDown, Shield, Star, Brain
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'

interface PerformanceMetric {
  id: string
  name: string
  value: number
  target: number
  trend: 'up' | 'down' | 'stable'
  trendValue: number
  category: 'quality' | 'financial' | 'operational' | 'patient'
  lastUpdated: Date
  description: string
}

interface QualityReport {
  id: string
  measureName: string
  measureType: 'HEDIS' | 'CMS Stars' | 'CAHPS' | 'ACO'
  performance: number
  benchmark: number
  gap: number
  patientsEligible: number
  patientsCompliant: number
  status: 'exceeds' | 'meets' | 'below'
  impactOnReimbursement: number
}

interface CareGap {
  id: string
  patientName: string
  mrn: string
  gapType: string
  condition: string
  missedService: string
  daysOverdue: number
  priority: 'High' | 'Medium' | 'Low'
  estimatedCost: number
  actionRequired: string
}

interface TreatmentAlert {
  id: string
  patientName: string
  mrn: string
  treatment: string
  adherenceRate: number
  missedDoses: number
  riskLevel: 'Critical' | 'High' | 'Medium'
  lastContact: string
  intervention: string
}

export default function HealthcareAnalyticsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'quality' | 'financial' | 'operational' | 'patient'>('all')
  const [selectedTimeframe, setSelectedTimeframe] = useState<'month' | 'quarter' | 'year'>('quarter')

  const performanceMetrics: PerformanceMetric[] = [
    {
      id: '1',
      name: 'HEDIS Composite Score',
      value: 87.5,
      target: 85,
      trend: 'up',
      trendValue: 3.2,
      category: 'quality',
      lastUpdated: new Date(),
      description: 'Overall Healthcare Effectiveness Data and Information Set performance'
    },
    {
      id: '2',
      name: 'Total Cost of Care PMPM',
      value: 385,
      target: 410,
      trend: 'down',
      trendValue: -6.1,
      category: 'financial',
      lastUpdated: new Date(),
      description: 'Per Member Per Month cost across all lines of business'
    },
    {
      id: '3',
      name: '30-Day Readmission Rate',
      value: 12.3,
      target: 15,
      trend: 'down',
      trendValue: -2.7,
      category: 'operational',
      lastUpdated: new Date(),
      description: 'Percentage of patients readmitted within 30 days of discharge'
    },
    {
      id: '4',
      name: 'Patient Satisfaction (CAHPS)',
      value: 4.6,
      target: 4.5,
      trend: 'up',
      trendValue: 0.2,
      category: 'patient',
      lastUpdated: new Date(),
      description: 'Consumer Assessment of Healthcare Providers and Systems score'
    },
    {
      id: '5',
      name: 'CMS Star Rating',
      value: 4.5,
      target: 4.0,
      trend: 'stable',
      trendValue: 0,
      category: 'quality',
      lastUpdated: new Date(),
      description: 'Centers for Medicare & Medicaid Services quality rating'
    },
    {
      id: '6',
      name: 'ED Utilization Rate',
      value: 245,
      target: 280,
      trend: 'down',
      trendValue: -12.5,
      category: 'operational',
      lastUpdated: new Date(),
      description: 'Emergency Department visits per 1,000 members'
    }
  ]

  const qualityReports: QualityReport[] = [
    {
      id: '1',
      measureName: 'Diabetes Care - HbA1c Control',
      measureType: 'HEDIS',
      performance: 82,
      benchmark: 78,
      gap: 4,
      patientsEligible: 450,
      patientsCompliant: 369,
      status: 'exceeds',
      impactOnReimbursement: 125000
    },
    {
      id: '2',
      measureName: 'Medication Adherence - Statins',
      measureType: 'CMS Stars',
      performance: 88,
      benchmark: 85,
      gap: 3,
      patientsEligible: 680,
      patientsCompliant: 598,
      status: 'exceeds',
      impactOnReimbursement: 95000
    },
    {
      id: '3',
      measureName: 'Breast Cancer Screening',
      measureType: 'HEDIS',
      performance: 71,
      benchmark: 75,
      gap: -4,
      patientsEligible: 320,
      patientsCompliant: 227,
      status: 'below',
      impactOnReimbursement: -45000
    },
    {
      id: '4',
      measureName: 'Care Coordination Rating',
      measureType: 'CAHPS',
      performance: 92,
      benchmark: 88,
      gap: 4,
      patientsEligible: 1200,
      patientsCompliant: 1104,
      status: 'exceeds',
      impactOnReimbursement: 180000
    }
  ]

  const careGaps: CareGap[] = [
    {
      id: '1',
      patientName: 'Margaret Thompson',
      mrn: 'MRN-784512',
      gapType: 'Preventive Care',
      condition: 'Type 2 Diabetes',
      missedService: 'Annual Diabetic Eye Exam',
      daysOverdue: 45,
      priority: 'High',
      estimatedCost: 2400,
      actionRequired: 'Schedule ophthalmology appointment'
    },
    {
      id: '2',
      patientName: 'Robert Johnson',
      mrn: 'MRN-892341',
      gapType: 'Follow-up Care',
      condition: 'Post-Hip Replacement',
      missedService: 'Physical Therapy Sessions',
      daysOverdue: 12,
      priority: 'High',
      estimatedCost: 1800,
      actionRequired: 'Coordinate PT restart with provider'
    },
    {
      id: '3',
      patientName: 'Eleanor Martinez',
      mrn: 'MRN-567823',
      gapType: 'Medication Management',
      condition: 'Chronic Heart Failure',
      missedService: 'Cardiology Follow-up',
      daysOverdue: 30,
      priority: 'High',
      estimatedCost: 5200,
      actionRequired: 'Schedule urgent cardiology consult'
    },
    {
      id: '4',
      patientName: 'David Kim',
      mrn: 'MRN-234156',
      gapType: 'Preventive Care',
      condition: 'Hypertension',
      missedService: 'Blood Pressure Monitoring',
      daysOverdue: 60,
      priority: 'Medium',
      estimatedCost: 800,
      actionRequired: 'Initiate remote monitoring program'
    },
    {
      id: '5',
      patientName: 'Sarah Williams',
      mrn: 'MRN-456789',
      gapType: 'Screening',
      condition: 'Age 50+',
      missedService: 'Colonoscopy Screening',
      daysOverdue: 90,
      priority: 'High',
      estimatedCost: 3200,
      actionRequired: 'Order screening and obtain authorization'
    }
  ]

  const treatmentAlerts: TreatmentAlert[] = [
    {
      id: '1',
      patientName: 'Margaret Thompson',
      mrn: 'MRN-784512',
      treatment: 'Insulin Therapy',
      adherenceRate: 65,
      missedDoses: 12,
      riskLevel: 'High',
      lastContact: '5 days ago',
      intervention: 'Diabetes educator consultation needed'
    },
    {
      id: '2',
      patientName: 'David Kim',
      mrn: 'MRN-234156',
      treatment: 'Antidepressant Medication',
      adherenceRate: 58,
      missedDoses: 18,
      riskLevel: 'Critical',
      lastContact: '10 days ago',
      intervention: 'Immediate psychiatric follow-up required'
    },
    {
      id: '3',
      patientName: 'Eleanor Martinez',
      mrn: 'MRN-567823',
      treatment: 'Heart Failure Medications',
      adherenceRate: 72,
      missedDoses: 8,
      riskLevel: 'High',
      lastContact: '3 days ago',
      intervention: 'Medication management program enrollment'
    },
    {
      id: '4',
      patientName: 'Robert Johnson',
      mrn: 'MRN-892341',
      treatment: 'Pain Management Protocol',
      adherenceRate: 85,
      missedDoses: 4,
      riskLevel: 'Medium',
      lastContact: '2 days ago',
      intervention: 'Continue current monitoring'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeds':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
      case 'meets':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
      case 'below':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
    }
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable', isPositive: boolean) => {
    if (trend === 'up') return <ArrowUp className={`w-4 h-4 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
    if (trend === 'down') return <ArrowDown className={`w-4 h-4 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
    return <span className="w-4 h-4 text-gray-400">—</span>
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Calculate aggregate statistics
  const stats = {
    totalCareGaps: 287,
    highPriorityGaps: 89,
    patientsAtRisk: 156,
    treatmentAlertsActive: 42,
    averageAdherence: 78,
    interventionsNeeded: 287
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <PageHeader
        title="Care Gaps & Actionable Insights"
        description="Identify service delivery gaps and patient intervention opportunities"
        action={
          <button className="h-12 px-6 bg-arthur-blue text-white rounded-full hover:bg-arthur-blue-dark flex items-center justify-center gap-2 transition-colors">
            <Download size={20} />
            <span>Export Report</span>
          </button>
        }
      />

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="text-red-600" size={20} />
            <span className="text-xs text-red-600 font-semibold">Urgent</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalCareGaps}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Care Gaps</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <Target className="text-orange-600" size={20} />
            <span className="text-xs text-orange-600 font-semibold">Action Needed</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.highPriorityGaps}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">High Priority Gaps</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="text-red-600" size={20} />
            <span className="text-xs text-red-600 font-semibold">At Risk</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.patientsAtRisk}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Patients At Risk</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <Activity className="text-amber-600" size={20} />
            <span className="text-xs text-amber-600 font-semibold">Monitor</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.treatmentAlertsActive}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Treatment Alerts</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <Heart className="text-blue-600" size={20} />
            <span className="text-xs text-blue-600 font-semibold">Adherence</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.averageAdherence}%</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Avg Treatment Adherence</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="text-green-600" size={20} />
            <span className="text-xs text-green-600 font-semibold">Required</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.interventionsNeeded}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Interventions Needed</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search metrics, reports, or measures..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-arthur-blue/20 text-gray-900 dark:text-gray-100"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Categories</option>
            <option value="quality">Quality Measures</option>
            <option value="financial">Financial Performance</option>
            <option value="operational">Operational Metrics</option>
            <option value="patient">Patient Experience</option>
          </select>

          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className="px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
          >
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Critical Care Gaps - Patient Focus */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-red-600" size={24} />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Critical Care Gaps - Immediate Action Required</h2>
            </div>
            <span className="text-sm font-semibold text-red-600">{careGaps.filter(g => g.priority === 'High').length} High Priority</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Gap Type / Condition
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Missed Service
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Days Overdue
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Potential Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Action Required
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {careGaps.map(gap => (
                <tr key={gap.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{gap.patientName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{gap.mrn}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{gap.gapType}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{gap.condition}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 dark:text-gray-100">{gap.missedService}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                      gap.daysOverdue > 60 ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300' :
                      gap.daysOverdue > 30 ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300' :
                      'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                    }`}>
                      {gap.daysOverdue}d
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                      gap.priority === 'High' ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300' :
                      gap.priority === 'Medium' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300' :
                      'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                    }`}>
                      {gap.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                      ${gap.estimatedCost.toLocaleString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 dark:text-gray-100">{gap.actionRequired}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Treatment Adherence Alerts */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="text-amber-600" size={24} />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Treatment Adherence Alerts - Patient Interventions Needed</h2>
            </div>
            <span className="text-sm font-semibold text-amber-600">{treatmentAlerts.filter(a => a.riskLevel === 'Critical' || a.riskLevel === 'High').length} High Risk</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Treatment
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Adherence Rate
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Missed Doses
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Intervention
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {treatmentAlerts.map(alert => (
                <tr key={alert.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{alert.patientName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{alert.mrn}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 dark:text-gray-100">{alert.treatment}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <p className={`text-lg font-bold ${
                        alert.adherenceRate >= 80 ? 'text-green-600' :
                        alert.adherenceRate >= 65 ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {alert.adherenceRate}%
                      </p>
                      <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                        <div
                          className={`h-2 rounded-full ${
                            alert.adherenceRate >= 80 ? 'bg-green-500' :
                            alert.adherenceRate >= 65 ? 'bg-orange-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${alert.adherenceRate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                      {alert.missedDoses}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                      alert.riskLevel === 'Critical' ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300' :
                      alert.riskLevel === 'High' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300' :
                      'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                    }`}>
                      {alert.riskLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{alert.lastContact}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 dark:text-gray-100">{alert.intervention}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quality Measures Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Quality Measure Performance</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Measure
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Compliance
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Gap to Goal
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Financial Impact
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {qualityReports.map(report => (
                <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{report.measureName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Benchmark: {report.benchmark}%</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-1 bg-arthur-blue/10 text-arthur-blue rounded text-xs font-medium">
                      {report.measureType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{report.performance}%</p>
                      <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                        <div
                          className={`h-2 rounded-full ${
                            report.status === 'exceeds' ? 'bg-green-500' :
                            report.status === 'meets' ? 'bg-blue-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${report.performance}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {report.patientsCompliant}/{report.patientsEligible}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">patients</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(report.status)}`}>
                      {report.gap > 0 ? '+' : ''}{report.gap}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className={`text-sm font-semibold ${
                      report.impactOnReimbursement > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {report.impactOnReimbursement > 0 ? '+' : ''}{formatCurrency(report.impactOnReimbursement)}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="bg-gradient-to-r from-arthur-blue to-blue-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Brain size={24} />
          <h2 className="text-xl font-bold">Arthur AI Actionable Insights</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <AlertCircle size={18} />
              Urgent Patient Intervention
            </h3>
            <p className="text-sm opacity-90">5 diabetic patients overdue for eye exams by 45+ days. Risk of vision complications. Schedule ophthalmology appointments this week to prevent $12K in preventable care costs.</p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Heart size={18} />
              Medication Adherence Gap
            </h3>
            <p className="text-sm opacity-90">12 patients below 70% adherence on critical medications. Deploy medication therapy management program to prevent readmissions. Estimated cost avoidance: $48K.</p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Target size={18} />
              Preventive Care Opportunity
            </h3>
            <p className="text-sm opacity-90">93 eligible patients missing preventive screenings. Closing these gaps prevents disease progression and generates $45K in quality incentives. Prioritize colonoscopy and mammogram outreach.</p>
          </div>
        </div>
      </div>
    </div>
  )
}