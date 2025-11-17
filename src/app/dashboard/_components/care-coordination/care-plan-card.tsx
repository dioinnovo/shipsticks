import { FileText, CheckCircle, DollarSign, AlertCircle, Calendar, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

interface CarePlanCardProps {
  reportId: string
  sessionId: string
  generatedDate: string
  qualityScore: number
  careGapsIdentified: number
  annualSavings: number
  completedAssessments: number
  status: string
  onClick: () => void
}

export function CarePlanCard({
  reportId,
  generatedDate,
  qualityScore,
  careGapsIdentified,
  annualSavings,
  completedAssessments,
  status,
  onClick
}: CarePlanCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-700 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all cursor-pointer"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-arthur-blue/10 rounded-lg">
            <FileText className="text-arthur-blue" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{reportId}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
              <Calendar size={14} />
              <span>{formatDate(generatedDate)}</span>
            </div>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
          {status === 'approved' ? 'Approved' : 'Pending'}
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Quality Score */}
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="text-purple-600" size={14} />
            <span className="text-xs text-gray-600 dark:text-gray-400">Quality Score</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">{qualityScore}%</p>
        </div>

        {/* Assessments */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="text-blue-600" size={14} />
            <span className="text-xs text-gray-600 dark:text-gray-400">Assessments</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{completedAssessments}</p>
        </div>

        {/* Care Gaps */}
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="text-amber-600" size={14} />
            <span className="text-xs text-gray-600 dark:text-gray-400">Care Gaps</span>
          </div>
          <p className="text-2xl font-bold text-amber-600">{careGapsIdentified}</p>
        </div>

        {/* Savings */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="text-green-600" size={14} />
            <span className="text-xs text-gray-600 dark:text-gray-400">Annual Savings</span>
          </div>
          <p className="text-lg font-bold text-green-600">${annualSavings.toLocaleString()}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full text-center text-sm font-medium text-arthur-blue hover:text-arthur-blue-dark transition-colors">
          View Full Report →
        </button>
      </div>
    </motion.div>
  )
}
