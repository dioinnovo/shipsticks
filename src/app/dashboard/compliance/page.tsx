'use client'

import { useState } from 'react'
import {
  Shield, Lock, FileCheck, AlertTriangle, CheckCircle,
  Clock, TrendingUp, Users, FileText, Download,
  Eye, Calendar, Award, AlertCircle, Info,
  Activity, BookOpen, Briefcase, Database, Key
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'

interface ComplianceMetric {
  id: string
  category: 'hipaa' | 'quality' | 'regulatory' | 'operational' | 'financial'
  name: string
  status: 'compliant' | 'at-risk' | 'non-compliant' | 'pending'
  score: number
  target: number
  lastAudit: Date
  nextAudit: Date
  description: string
  requirements: string[]
}

interface AuditItem {
  id: string
  title: string
  type: 'scheduled' | 'completed' | 'in-progress'
  auditor: string
  date: Date
  findings: number
  criticalFindings: number
  status: string
}

interface TrainingModule {
  id: string
  title: string
  category: string
  completionRate: number
  dueDate: Date
  mandatory: boolean
  duration: string
}

export default function CompliancePage() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'hipaa' | 'quality' | 'regulatory'>('all')

  const complianceMetrics: ComplianceMetric[] = [
    {
      id: '1',
      category: 'hipaa',
      name: 'HIPAA Privacy Rule Compliance',
      status: 'compliant',
      score: 98,
      target: 95,
      lastAudit: new Date('2024-01-15'),
      nextAudit: new Date('2024-04-15'),
      description: 'Protected health information handling and patient privacy',
      requirements: ['Access Controls', 'Audit Logs', 'Encryption', 'Training', 'BAA Management']
    },
    {
      id: '2',
      category: 'hipaa',
      name: 'HIPAA Security Rule',
      status: 'compliant',
      score: 96,
      target: 95,
      lastAudit: new Date('2024-01-15'),
      nextAudit: new Date('2024-04-15'),
      description: 'Technical and physical safeguards for ePHI',
      requirements: ['Risk Assessment', 'Access Management', 'Transmission Security', 'Device Controls']
    },
    {
      id: '3',
      category: 'quality',
      name: 'NCQA HEDIS Measures',
      status: 'at-risk',
      score: 82,
      target: 85,
      lastAudit: new Date('2024-02-01'),
      nextAudit: new Date('2024-05-01'),
      description: 'Healthcare effectiveness data and information set compliance',
      requirements: ['Data Accuracy', 'Measure Reporting', 'Documentation', 'Validation']
    },
    {
      id: '4',
      category: 'regulatory',
      name: 'CMS Conditions of Participation',
      status: 'compliant',
      score: 94,
      target: 90,
      lastAudit: new Date('2023-12-01'),
      nextAudit: new Date('2024-06-01'),
      description: 'Medicare and Medicaid program requirements',
      requirements: ['Patient Rights', 'Quality Assessment', 'Medical Records', 'Infection Control']
    },
    {
      id: '5',
      category: 'operational',
      name: 'Information Blocking Compliance',
      status: 'compliant',
      score: 100,
      target: 100,
      lastAudit: new Date('2024-01-20'),
      nextAudit: new Date('2024-07-20'),
      description: '21st Century Cures Act information sharing requirements',
      requirements: ['API Access', 'Data Export', 'Patient Access', 'No Barriers']
    },
    {
      id: '6',
      category: 'financial',
      name: 'Fraud, Waste & Abuse Prevention',
      status: 'compliant',
      score: 91,
      target: 90,
      lastAudit: new Date('2024-02-10'),
      nextAudit: new Date('2024-05-10'),
      description: 'FWA program effectiveness and monitoring',
      requirements: ['Training', 'Monitoring', 'Reporting', 'Investigation', 'Corrective Action']
    }
  ]

  const upcomingAudits: AuditItem[] = [
    {
      id: '1',
      title: 'Q2 HIPAA Security Risk Assessment',
      type: 'scheduled',
      auditor: 'Deloitte & Touche',
      date: new Date('2024-04-15'),
      findings: 0,
      criticalFindings: 0,
      status: 'Scheduled'
    },
    {
      id: '2',
      title: 'Annual HITRUST Certification',
      type: 'in-progress',
      auditor: 'Coalfire Systems',
      date: new Date('2024-03-28'),
      findings: 3,
      criticalFindings: 0,
      status: 'In Progress'
    },
    {
      id: '3',
      title: 'Q1 Quality Measure Validation',
      type: 'completed',
      auditor: 'Internal Audit Team',
      date: new Date('2024-03-01'),
      findings: 8,
      criticalFindings: 1,
      status: 'Completed'
    }
  ]

  const trainingModules: TrainingModule[] = [
    {
      id: '1',
      title: 'Annual HIPAA Privacy Training',
      category: 'Compliance',
      completionRate: 87,
      dueDate: new Date('2024-04-30'),
      mandatory: true,
      duration: '45 min'
    },
    {
      id: '2',
      title: 'Fraud, Waste & Abuse Prevention',
      category: 'Compliance',
      completionRate: 92,
      dueDate: new Date('2024-05-15'),
      mandatory: true,
      duration: '30 min'
    },
    {
      id: '3',
      title: 'Information Security Awareness',
      category: 'Security',
      completionRate: 78,
      dueDate: new Date('2024-04-15'),
      mandatory: true,
      duration: '60 min'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-700'
      case 'at-risk': return 'bg-yellow-100 text-yellow-700'
      case 'non-compliant': return 'bg-red-100 text-red-700'
      case 'pending': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return CheckCircle
      case 'at-risk': return AlertTriangle
      case 'non-compliant': return AlertCircle
      case 'pending': return Clock
      default: return Info
    }
  }

  const filteredMetrics = complianceMetrics.filter(metric =>
    selectedCategory === 'all' || metric.category === selectedCategory
  )

  // Calculate overall compliance score
  const overallScore = Math.round(
    complianceMetrics.reduce((acc, m) => acc + m.score, 0) / complianceMetrics.length
  )

  const stats = {
    overallCompliance: overallScore,
    compliantAreas: complianceMetrics.filter(m => m.status === 'compliant').length,
    atRiskAreas: complianceMetrics.filter(m => m.status === 'at-risk').length,
    pendingAudits: upcomingAudits.filter(a => a.type === 'scheduled').length,
    trainingCompletion: Math.round(trainingModules.reduce((acc, t) => acc + t.completionRate, 0) / trainingModules.length)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Healthcare Compliance Dashboard"
        description="Regulatory compliance monitoring and audit management"
        action={
          <button className="h-12 px-6 bg-arthur-blue text-white rounded-full hover:bg-arthur-blue-dark flex items-center justify-center gap-2 transition-colors">
            <Download size={20} />
            <span>Compliance Report</span>
          </button>
        }
      />

      {/* Compliance Score Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <Shield className="text-arthur-blue" size={20} />
            <span className={`text-xs font-semibold ${
              stats.overallCompliance >= 90 ? 'text-green-600' :
              stats.overallCompliance >= 80 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {stats.overallCompliance >= 90 ? 'Excellent' :
               stats.overallCompliance >= 80 ? 'Good' :
               'Needs Attention'}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.overallCompliance}%</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Overall Compliance</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="text-green-600" size={20} />
            <span className="text-xs text-green-600 font-semibold">Compliant</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.compliantAreas}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Compliant Areas</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="text-yellow-600" size={20} />
            <span className="text-xs text-yellow-600 font-semibold">Monitor</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.atRiskAreas}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">At-Risk Areas</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="text-purple-600" size={20} />
            <span className="text-xs text-purple-600 font-semibold">Upcoming</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.pendingAudits}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pending Audits</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="text-blue-600" size={20} />
            <span className="text-xs text-blue-600 font-semibold">Training</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.trainingCompletion}%</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Training Complete</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <div className="flex gap-2">
          {['all', 'hipaa', 'quality', 'regulatory'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-arthur-blue text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'All Categories' :
               category === 'hipaa' ? 'HIPAA' :
               category === 'quality' ? 'Quality Measures' :
               'Regulatory'}
            </button>
          ))}
        </div>
      </div>

      {/* Compliance Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredMetrics.map((metric) => {
          const Icon = getStatusIcon(metric.status)

          return (
            <div key={metric.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{metric.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{metric.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(metric.status)}`}>
                  <Icon size={12} />
                  {metric.status.replace('-', ' ')}
                </span>
              </div>

              {/* Compliance Score */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Compliance Score</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{metric.score}% / {metric.target}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      metric.score >= metric.target ? 'bg-green-500' :
                      metric.score >= metric.target * 0.9 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${metric.score}%` }}
                  />
                </div>
              </div>

              {/* Requirements */}
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Key Requirements:</p>
                <div className="flex flex-wrap gap-1">
                  {metric.requirements.map((req, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded">
                      {req}
                    </span>
                  ))}
                </div>
              </div>

              {/* Audit Schedule */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500 dark:text-gray-400">
                      Last audit: {metric.lastAudit.toLocaleDateString()}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      Next audit: {metric.nextAudit.toLocaleDateString()}
                    </span>
                  </div>
                  <button className="text-arthur-blue hover:text-arthur-blue-dark font-medium">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Audit Schedule */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Calendar size={20} className="text-arthur-blue" />
            Audit Schedule & Results
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Audit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Auditor
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Findings
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {upcomingAudits.map((audit) => (
                <tr key={audit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{audit.title}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{audit.auditor}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-sm text-gray-900 dark:text-gray-100">{audit.date.toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {audit.type === 'completed' ? (
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm text-gray-900 dark:text-gray-100">{audit.findings} findings</span>
                        {audit.criticalFindings > 0 && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                            {audit.criticalFindings} critical
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      audit.type === 'completed' ? 'bg-green-100 text-green-700' :
                      audit.type === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {audit.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-arthur-blue hover:text-arthur-blue-dark text-sm font-medium">
                      {audit.type === 'completed' ? 'View Report' : 'View Details'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Training Compliance */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <BookOpen size={20} className="text-arthur-blue" />
          Compliance Training Status
        </h2>

        <div className="space-y-3">
          {trainingModules.map((module) => (
            <div key={module.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{module.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>{module.category}</span>
                    <span>•</span>
                    <span>{module.duration}</span>
                    <span>•</span>
                    <span>Due: {module.dueDate.toLocaleDateString()}</span>
                  </div>
                </div>
                {module.mandatory && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded font-semibold">
                    Mandatory
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1 mr-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Completion</span>
                    <span className="text-xs font-bold text-gray-900 dark:text-gray-100">{module.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        module.completionRate === 100 ? 'bg-green-500' :
                        module.completionRate >= 80 ? 'bg-blue-500' :
                        'bg-amber-500'
                      }`}
                      style={{ width: `${module.completionRate}%` }}
                    />
                  </div>
                </div>
                <button className="text-arthur-blue hover:text-arthur-blue-dark text-sm font-medium">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Resources */}
      <div className="bg-gradient-to-r from-arthur-blue to-blue-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={24} />
          <h2 className="text-xl font-bold">Compliance Resources & Support</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <FileText size={16} />
              Policy Library
            </h3>
            <p className="text-sm opacity-90">Access to 200+ compliance policies, procedures, and documentation templates.</p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Briefcase size={16} />
              Compliance Hotline
            </h3>
            <p className="text-sm opacity-90">24/7 support for compliance questions, incident reporting, and guidance.</p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Key size={16} />
              Access Management
            </h3>
            <p className="text-sm opacity-90">Role-based access controls and audit logging for all PHI access.</p>
          </div>
        </div>
      </div>
    </div>
  )
}