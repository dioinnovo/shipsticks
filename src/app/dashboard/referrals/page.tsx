'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users, Plus, Calendar, Clock, MapPin, User, CheckCircle,
  AlertCircle, FileText, TrendingUp, Search, Filter, Download,
  Stethoscope, Brain, Activity, Heart, ChevronRight, Eye,
  AlertTriangle, ArrowRight, UserCheck, Timer
} from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/page-header'

interface Partner {
  id: string
  courseId: string
  courseName: string
  location: string
  region: string // Geographic region
  partnershipType: 'premier' | 'standard' | 'trial' | 'preferred' | 'exclusive'
  courseType: string
  contactPerson: string
  contactFacility: string
  deliveryNotes: string
  specialInstructions?: string
  serviceFeatures: string[]
  status: 'pending' | 'active' | 'onboarding' | 'partnership-review' | 'inactive' | 'paused'
  priority: 'low' | 'medium' | 'high' | 'critical'
  partnershipStartDate: string
  lastDeliveryDate?: string
  totalDeliveries?: number
  preferredCarrier?: string
  deliveryZone?: string
  performanceMetrics: {
    deliverySuccess: number
    avgDeliveryTime: string
    customerSatisfaction: number
    monthlyVolume: number
  }
  logistics?: {
    storageAvailable?: boolean
    proShopAccess?: boolean
    signatureRequired?: boolean
    performanceScore?: number
  }
  timeline?: {
    created: string
    activated?: string
    lastDelivery?: string
    lastReview?: string
  }
}

export default function PartnerManagementPage() {
  const router = useRouter()
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('all')

  // Mock data for demo
  useEffect(() => {
    const mockPartners: Partner[] = [
      {
        id: 'PRT-2024-001',
        courseId: 'COURSE-12847',
        courseName: 'Pebble Beach Golf Links',
        location: 'Pebble Beach, CA',
        region: 'West Coast',
        partnershipType: 'premier',
        courseType: 'Championship Resort',
        contactPerson: 'Michael Stevens',
        contactFacility: 'Pebble Beach Pro Shop',
        deliveryNotes: 'Direct delivery to pro shop, climate-controlled storage available',
        specialInstructions: 'High-value equipment requires signature and photo confirmation',
        serviceFeatures: ['Climate Storage', 'Club Cleaning', 'Same-Day Delivery', '24/7 Access'],
        status: 'active',
        priority: 'high',
        partnershipStartDate: '2023-01-15',
        lastDeliveryDate: '2024-10-18',
        totalDeliveries: 847,
        preferredCarrier: 'Local Courier',
        deliveryZone: 'Zone A - Priority',
        performanceMetrics: {
          deliverySuccess: 98,
          avgDeliveryTime: '4.2 hours',
          customerSatisfaction: 97,
          monthlyVolume: 65
        },
        logistics: {
          storageAvailable: true,
          proShopAccess: true,
          signatureRequired: true,
          performanceScore: 96
        }
      },
      {
        id: 'PRT-2024-002',
        courseId: 'COURSE-98234',
        courseName: 'Augusta National Golf Club',
        location: 'Augusta, GA',
        region: 'Southeast',
        partnershipType: 'exclusive',
        courseType: 'Private Championship',
        contactPerson: 'Jennifer Park',
        contactFacility: 'Tournament Operations',
        deliveryNotes: 'Tournament deliveries require 48-hour advance notice and security clearance',
        serviceFeatures: ['White Glove', 'Security Clearance', 'Tournament Priority', 'Climate Storage'],
        status: 'active',
        priority: 'critical',
        partnershipStartDate: '2022-03-01',
        lastDeliveryDate: '2024-10-15',
        totalDeliveries: 342,
        preferredCarrier: 'FedEx Priority',
        deliveryZone: 'Zone S - Special Events',
        performanceMetrics: {
          deliverySuccess: 100,
          avgDeliveryTime: '24 hours',
          customerSatisfaction: 99,
          monthlyVolume: 28
        },
        logistics: {
          storageAvailable: true,
          proShopAccess: true,
          signatureRequired: true,
          performanceScore: 99
        }
      },
      {
        id: 'PRT-2024-003',
        courseId: 'COURSE-45678',
        courseName: 'TPC Scottsdale',
        location: 'Scottsdale, AZ',
        region: 'Southwest',
        partnershipType: 'preferred',
        courseType: 'TPC Tournament Course',
        contactPerson: 'Lisa Wong',
        contactFacility: 'Stadium Course Pro Shop',
        deliveryNotes: 'Seasonal storage partner for snowbird customers',
        serviceFeatures: ['30-Day Storage', 'Group Discounts', 'Event Coordination'],
        status: 'onboarding',
        priority: 'high',
        partnershipStartDate: '2024-09-01',
        totalDeliveries: 45,
        preferredCarrier: 'UPS Ground',
        deliveryZone: 'Zone B - Standard',
        performanceMetrics: {
          deliverySuccess: 94,
          avgDeliveryTime: '3.1 days',
          customerSatisfaction: 92,
          monthlyVolume: 15
        },
        logistics: {
          storageAvailable: true,
          proShopAccess: true,
          signatureRequired: false,
          performanceScore: 88
        }
      },
      {
        id: 'PRT-2024-004',
        courseId: 'COURSE-67890',
        courseName: 'St. Andrews Old Course',
        location: 'St Andrews, Scotland',
        region: 'International',
        partnershipType: 'premier',
        courseType: 'Historic Links Course',
        contactPerson: 'David McGregor',
        contactFacility: 'Links Trust Operations',
        deliveryNotes: 'International customs coordination, direct hotel delivery preferred',
        serviceFeatures: ['Customs Support', 'Hotel Delivery', 'Caddie Coordination'],
        status: 'pending',
        priority: 'medium',
        partnershipStartDate: '2024-10-01',
        deliveryZone: 'Zone I - International',
        performanceMetrics: {
          deliverySuccess: 0,
          avgDeliveryTime: 'N/A',
          customerSatisfaction: 0,
          monthlyVolume: 0
        },
        logistics: {
          storageAvailable: false,
          proShopAccess: true,
          signatureRequired: true,
          performanceScore: 0
        }
      },
      {
        id: 'PRT-2024-005',
        courseId: 'COURSE-34567',
        courseName: 'Bandon Dunes Golf Resort',
        location: 'Bandon, OR',
        region: 'Pacific Northwest',
        partnershipType: 'exclusive',
        courseType: 'Destination Resort',
        contactPerson: 'Rachel Stevens',
        contactFacility: 'Resort Concierge',
        deliveryNotes: 'Multi-course resort with 5 championship courses, centralized receiving',
        serviceFeatures: ['Resort Concierge', 'Multi-Course Access', 'Weather Protection', 'Storage'],
        status: 'active',
        priority: 'high',
        partnershipStartDate: '2023-06-15',
        lastDeliveryDate: '2024-10-17',
        totalDeliveries: 623,
        preferredCarrier: 'FedEx Priority',
        deliveryZone: 'Zone A - Priority',
        performanceMetrics: {
          deliverySuccess: 99,
          avgDeliveryTime: '2.8 days',
          customerSatisfaction: 98,
          monthlyVolume: 52
        },
        logistics: {
          storageAvailable: true,
          proShopAccess: true,
          signatureRequired: true,
          performanceScore: 97
        }
      }
    ]

    setTimeout(() => {
      setPartners(mockPartners)
      setLoading(false)
    }, 500)
  }, [])

  // Statistics
  const stats = {
    total: partners.length,
    pending: partners.filter(r => r.status === 'pending').length,
    urgent: partners.filter(r => r.priority === 'high' || r.priority === 'critical').length,
    active: partners.filter(r => r.status === 'active').length,
    avgDeliverySuccess: '97%',
    avgSatisfaction: '96%'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'onboarding': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'partnership-review': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'pending': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'high': return <AlertCircle className="w-4 h-4 text-orange-600" />
      case 'medium': return <Clock className="w-4 h-4 text-yellow-600" />
      default: return <Timer className="w-4 h-4 text-gray-400" />
    }
  }

  const getPartnershipIcon = (partnershipType: string) => {
    switch (partnershipType) {
      case 'exclusive': return <Heart className="w-5 h-5" />
      case 'premier': return <Activity className="w-5 h-5" />
      case 'preferred': return <Users className="w-5 h-5" />
      case 'standard': return <MapPin className="w-5 h-5" />
      default: return <MapPin className="w-5 h-5" />
    }
  }

  // Filter partners
  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.location.includes(searchTerm) ||
                         partner.id.includes(searchTerm)
    const matchesFilter = filter === 'all' || partner.status === filter
    const matchesRegion = selectedRegion === 'all' || partner.region === selectedRegion
    return matchesSearch && matchesFilter && matchesRegion
  })

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title="Partner Network"
        description="Golf course partnerships and delivery network management"
        action={
          <button
            onClick={() => router.push('/dashboard/referrals/new')}
            className="h-12 px-6 bg-arthur-blue text-white rounded-full hover:bg-arthur-blue-dark flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto transition-colors"
          >
            <Plus size={20} />
            <span className="font-medium">New Partner</span>
          </button>
        }
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-arthur-blue/10 rounded-lg">
              <Users className="w-5 h-5 text-arthur-blue" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Partners</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Pending Setup</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.urgent}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">High Priority</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Active Partners</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.avgDeliverySuccess}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Delivery Success</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-arthur-care/10 rounded-lg">
              <Heart className="w-5 h-5 text-arthur-care" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.avgSatisfaction}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Satisfaction</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by course name, location, or partner ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <select
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="onboarding">Onboarding</option>
            <option value="active">Active</option>
            <option value="partnership-review">Review</option>
            <option value="paused">Paused</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            <option value="all">All Regions</option>
            <option value="West Coast">West Coast</option>
            <option value="Southeast">Southeast</option>
            <option value="Southwest">Southwest</option>
            <option value="Pacific Northwest">Pacific Northwest</option>
            <option value="International">International</option>
          </select>

          <button className="px-4 py-2 bg-arthur-blue text-white rounded-lg hover:bg-arthur-blue-hover flex items-center gap-2">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Partners List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-arthur-blue"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Partner ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Golf Course</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Partnership</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Contact Person</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Started</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPartners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-4">
                      {getPriorityIcon(partner.priority)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{partner.id}</div>
                      <div className="text-xs text-gray-500">{partner.partnershipType}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{partner.courseName}</div>
                      <div className="text-xs text-gray-500">{partner.location}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="text-arthur-blue">{getPartnershipIcon(partner.partnershipType)}</div>
                        <span className="text-sm">{partner.courseType}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">{partner.contactPerson}</div>
                      <div className="text-xs text-gray-500">{partner.contactFacility}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(partner.status)}`}>
                        {partner.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {partner.partnershipStartDate}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/referrals/${partner.id}`}
                          className="text-arthur-blue hover:text-arthur-blue-hover"
                        >
                          <Eye size={18} />
                        </Link>
                        {partner.status === 'pending' && (
                          <button className="text-green-600 hover:text-green-700">
                            <UserCheck size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}