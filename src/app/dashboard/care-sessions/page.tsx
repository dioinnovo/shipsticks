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
      id: 'SS-001',
      customerName: 'Tom Bradley',
      trackingNumber: 'SS-2024-M845',
      shipmentType: 'Tournament Delivery - White Glove',
      status: 'in-transit',
      shipDate: '2024-10-14',
      nextMilestone: 'Arrival at Augusta Pro Shop',
      progress: 75,
      coordinator: 'Mike Stevens, Logistics',
      priority: 'High',
      outcomes: {
        onTimeDelivery: 98,
        serviceScore: 96,
        costSavings: 12500
      },
      customerNote: 'Professional golfer shipping equipment for Masters qualifying. Clubs must arrive 48 hours before tee time. Custom fitted Titleist T350 irons and TSR3 driver - handle with extreme care. Temperature-controlled transport required.',
      handlingNotes: 'White-glove pickup completed from Ponte Vedra residence. Equipment inspected and photographed. All 14 clubs accounted for including T350 iron set (4-PW), TSR3 driver, TSR2 fairway woods, and Vokey SM10 wedges. Tour bag in excellent condition. GPS tracker activated. Estimated delivery Oct 16 at 2 PM.',
      packageDetails: {
        weight: '52 lbs',
        dimensions: '52x15x12 inches',
        carrier: 'FedEx Priority',
        insurance: 8500,
        temperature: 68
      },
      itemCount: 14,
      deliveryWindowScheduled: 48
    },
    {
      id: 'SS-002',
      customerName: 'Sarah Martinez',
      trackingNumber: 'SS-2024-PB392',
      shipmentType: 'Resort Package - Express',
      status: 'active',
      shipDate: '2024-10-15',
      nextMilestone: 'Pro Shop Coordination',
      progress: 45,
      coordinator: 'Jennifer Park, Customer Success',
      priority: 'Medium',
      outcomes: {
        onTimeDelivery: 95,
        serviceScore: 92,
        costSavings: 8900
      },
      customerNote: 'Weekend getaway to Pebble Beach with spouse. First time using Ship Sticks. Callaway cart bag with 12 clubs plus push cart. Would like complimentary club cleaning if available.',
      handlingNotes: 'Same-day pickup from San Francisco residence. Customer very friendly, excited about trip. Push cart disassembled and secured properly. Pro shop notified of arrival. Customer opted for text notifications.',
      packageDetails: {
        weight: '45 lbs',
        dimensions: '48x14x11 inches',
        carrier: 'Local Courier',
        insurance: 2800,
        temperature: 72
      },
      itemCount: 12,
      deliveryWindowScheduled: 24
    },
    {
      id: 'SS-003',
      customerName: 'David Thompson',
      trackingNumber: 'SS-2024-KI441',
      shipmentType: 'International - Customs Cleared',
      status: 'active',
      shipDate: '2024-10-10',
      nextMilestone: 'Final UK Customs Clearance',
      progress: 85,
      coordinator: 'Rachel Chen, International',
      priority: 'High',
      outcomes: {
        onTimeDelivery: 94,
        serviceScore: 97,
        costSavings: 15200
      },
      customerNote: 'Once-in-lifetime trip to St. Andrews Old Course. Custom fitted Mizuno irons. All customs paperwork completed online. Need delivery directly to hotel - Rusacks St Andrews.',
      handlingNotes: 'International shipment processed through Heathrow. All customs declarations filed. Equipment value declared at $5,200. Links caddie master coordinated for hotel delivery. Customer very engaged, sending daily check-ins.',
      packageDetails: {
        weight: '50 lbs',
        dimensions: '50x14x12 inches',
        carrier: 'DHL International Express',
        insurance: 5200,
        temperature: 65
      },
      itemCount: 13,
      deliveryWindowScheduled: 72
    },
    {
      id: 'SS-004',
      customerName: 'Michael Chen',
      trackingNumber: 'SS-2024-SC128',
      shipmentType: 'Seasonal Snowbird - Standard',
      status: 'scheduled',
      shipDate: '2024-10-18',
      nextMilestone: 'Pickup Confirmation',
      progress: 5,
      coordinator: 'Lisa Wong, Seasonal',
      priority: 'Low',
      outcomes: {
        onTimeDelivery: 0,
        serviceScore: 0,
        costSavings: 0
      },
      customerNote: 'Annual winter migration from Minneapolis to Scottsdale. Regular customer, 3rd year using Ship Sticks. TaylorMade cart bag, clubs in good condition. Flexible on delivery dates.',
      handlingNotes: 'Pickup scheduled for Oct 18. Customer utilizing off-season discount (40% savings). Has requested 30-day complimentary storage at Scottsdale facility. Will coordinate with TPC Scottsdale for eventual delivery.',
      packageDetails: {
        weight: '42 lbs',
        dimensions: '46x13x11 inches',
        carrier: 'UPS Ground',
        insurance: 2200,
        temperature: 70
      },
      itemCount: 11,
      deliveryWindowScheduled: 96
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
      (shipment.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (shipment.trackingNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (shipment.shipmentType?.toLowerCase() || '').includes(searchTerm.toLowerCase())
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
            onClick={() => router.push('/dashboard/shipments/new')}
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
              key={shipment.id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => router.push(`/dashboard/care-sessions/${shipment.id}`)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-arthur-blue/10 rounded-lg flex items-center justify-center">
                    <Icon className="text-arthur-blue" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100">{shipment.customerName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{shipment.trackingNumber}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(shipment.status)}`}>
                    {shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    shipment.priority === 'High' ? 'bg-red-100 text-red-700' :
                    shipment.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {shipment.priority} Priority
                  </span>
                </div>
              </div>

              {/* Shipment Info */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-arthur-blue mb-1">{shipment.shipmentType}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    Shipped {shipment.shipDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    {shipment.coordinator}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Shipment Progress</span>
                  <span className="text-xs font-bold text-arthur-blue">{shipment.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-arthur-blue h-2 rounded-full transition-all"
                    style={{ width: `${shipment.progress}%` }}
                  />
                </div>
              </div>

              {/* Next Milestone */}
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Next Milestone</p>
                    <p className="text-sm font-semibold text-arthur-blue">{shipment.nextMilestone}</p>
                  </div>
                  <Target className="text-arthur-blue" size={20} />
                </div>
              </div>

              {/* Outcomes Metrics */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">On-Time</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{shipment.outcomes.onTimeDelivery}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Service</p>
                  <p className="text-lg font-bold text-green-600">{shipment.outcomes.serviceScore}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Cost Savings</p>
                  <p className="text-lg font-bold text-blue-600">${(shipment.outcomes.costSavings / 1000).toFixed(0)}k</p>
                </div>
              </div>

              {/* Customer Note */}
              {shipment.customerNote && (
                <div className="mb-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Mic className="text-arthur-blue flex-shrink-0 mt-0.5" size={14} />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Customer Note</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">{shipment.customerNote}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Handling Notes */}
              {shipment.handlingNotes && (
                <div className="mb-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <FileText className="text-purple-600 flex-shrink-0 mt-0.5" size={14} />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Handling Notes</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">{shipment.handlingNotes}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Package Details */}
              {shipment.packageDetails && (
                <div className="mb-3 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    <Thermometer size={14} className="text-green-600" />
                    Package Details
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {shipment.packageDetails.weight && (
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Weight</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{shipment.packageDetails.weight}</p>
                      </div>
                    )}
                    {shipment.packageDetails.carrier && (
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Carrier</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{shipment.packageDetails.carrier.split(' ')[0]}</p>
                      </div>
                    )}
                    {shipment.packageDetails.temperature && (
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Temp</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{shipment.packageDetails.temperature}°F</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Items & Delivery Window */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {shipment.itemCount !== undefined && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <Pill size={12} className="text-orange-500" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">Items</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{shipment.itemCount} clubs</p>
                  </div>
                )}
                {shipment.deliveryWindowScheduled !== undefined && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <CalendarCheck size={12} className="text-blue-500" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">Delivery Window</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{shipment.deliveryWindowScheduled}h window</p>
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