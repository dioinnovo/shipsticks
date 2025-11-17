import {
  Activity,
  Pill,
  Stethoscope,
  ClipboardList,
  BookOpen,
  Heart,
  UserCheck,
  MessageCircle,
  LucideIcon
} from 'lucide-react'

export interface CareAssessmentIcon {
  id: string
  name: string
  category: string
  icon: LucideIcon
  color: string
  bgColor: string
}

// Care Assessment Icons - Medical/Healthcare focused
export const CARE_ASSESSMENT_ICONS: CareAssessmentIcon[] = [
  // Clinical Assessment
  {
    id: 'vitals-measurements',
    name: 'Vital Signs & Measurements',
    category: 'Clinical Assessment',
    icon: Activity,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    id: 'medication-review',
    name: 'Medication Review & Reconciliation',
    category: 'Clinical Assessment',
    icon: Pill,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    id: 'symptom-assessment',
    name: 'Symptom Assessment',
    category: 'Clinical Assessment',
    icon: Stethoscope,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },

  // Care Planning
  {
    id: 'care-plan-review',
    name: 'Care Plan Review',
    category: 'Care Planning',
    icon: ClipboardList,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  {
    id: 'patient-education',
    name: 'Patient Education & Engagement',
    category: 'Care Planning',
    icon: BookOpen,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  {
    id: 'sdoh-assessment',
    name: 'Social Determinants of Health',
    category: 'Care Planning',
    icon: Heart,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },

  // Coordination
  {
    id: 'followup-coordination',
    name: 'Follow-up Coordination',
    category: 'Coordination',
    icon: UserCheck,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  {
    id: 'care-team-communication',
    name: 'Care Team Communication',
    category: 'Coordination',
    icon: MessageCircle,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
]

/**
 * Get icon information for a care assessment by ID
 */
export function getCareAssessmentIcon(assessmentId: string): CareAssessmentIcon | undefined {
  return CARE_ASSESSMENT_ICONS.find(icon => icon.id === assessmentId)
}

/**
 * Get category color classes for care assessments
 */
export function getCategoryColor(category: string): { color: string; bgColor: string } {
  switch (category) {
    case 'Clinical Assessment':
      return { color: 'text-blue-600', bgColor: 'bg-blue-100' }
    case 'Care Planning':
      return { color: 'text-green-600', bgColor: 'bg-green-100' }
    case 'Coordination':
      return { color: 'text-purple-600', bgColor: 'bg-purple-100' }
    default:
      return { color: 'text-gray-600', bgColor: 'bg-gray-100' }
  }
}

/**
 * Get status information for visual display
 */
export function getStatusInfo(status?: string) {
  switch (status) {
    case 'completed':
      return {
        icon: Activity,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        badgeVariant: 'default' as const
      }
    case 'in_progress':
      return {
        icon: Activity,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        badgeVariant: 'secondary' as const
      }
    case 'skipped':
      return {
        icon: Activity,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        badgeVariant: 'outline' as const
      }
    default:
      return {
        icon: Activity,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        badgeVariant: 'outline' as const
      }
  }
}
