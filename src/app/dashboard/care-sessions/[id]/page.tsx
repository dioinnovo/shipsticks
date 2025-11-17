'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Package, MapPin, Calendar, DollarSign, TrendingUp, Clock, CheckCircle, Truck, User, Phone, Mail, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'

export default function ShipmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const shipmentId = params.id as string

  // Mock shipment data - in production this would come from an API
  const shipmentData: any = {
    'SS-001': {
      id: 'SS-001',
      trackingNumber: 'SS-2024-M845',
      customerName: 'Tom Bradley',
      customerEmail: 'tom.bradley@email.com',
      customerPhone: '(555) 123-4567',
      status: 'In Transit',
      priority: 'High',
      shipmentType: 'Tournament Delivery - White Glove',
      origin: 'Ponte Vedra Beach, FL',
      destination: 'Augusta National Golf Club, Augusta, GA',
      shipDate: '2024-10-14',
      estimatedDelivery: '2024-10-16 2:00 PM',
      carrier: 'FedEx Priority',
      trackingUrl: '#',
      progress: 75,
      milestones: [
        { status: 'completed', label: 'Pickup Confirmed', time: '2024-10-14 10:00 AM', location: 'Ponte Vedra Beach, FL' },
        { status: 'completed', label: 'In Transit to Hub', time: '2024-10-14 3:00 PM', location: 'Jacksonville, FL' },
        { status: 'completed', label: 'Arrived at Hub', time: '2024-10-15 8:00 AM', location: 'Atlanta, GA' },
        { status: 'active', label: 'Out for Delivery', time: '2024-10-16 9:00 AM', location: 'Augusta, GA' },
        { status: 'pending', label: 'Delivered to Pro Shop', time: 'Estimated 2:00 PM', location: 'Augusta National' }
      ],
      equipment: {
        items: 'Titleist T350 Iron Set (4-PW) + TSR Woods + Vokey Wedges',
        bagType: 'Professional Tour Bag',
        weight: '52 lbs',
        dimensions: '52" x 15" x 12"',
        value: '$8,500',
        insurance: '$8,500 Full Coverage'
      },
      pricing: {
        baseRate: '$299',
        whiteGlove: '$50',
        insurance: '$45',
        tracking: '$5',
        total: '$399',
        saved: '$50'
      },
      notes: {
        customer: 'Professional golfer shipping equipment for Masters qualifying. Clubs must arrive 48 hours before tee time. Custom fitted Titleist T350 irons and TSR3 driver - handle with extreme care.',
        handling: 'White-glove pickup completed. Equipment inspected and photographed. All 14 clubs accounted for including T350 iron set (4-PW), TSR woods, and Vokey wedges. Tour bag in excellent condition. GPS tracker activated.'
      }
    },
    'SS-002': {
      id: 'SS-002',
      trackingNumber: 'SS-2024-PB392',
      customerName: 'Sarah Martinez',
      customerEmail: 'sarah.martinez@email.com',
      customerPhone: '(555) 234-5678',
      status: 'Active',
      priority: 'Medium',
      shipmentType: 'Resort Package - Express',
      origin: 'San Francisco, CA',
      destination: 'Pebble Beach Golf Links, Pebble Beach, CA',
      shipDate: '2024-10-15',
      estimatedDelivery: '2024-10-15 6:00 PM',
      carrier: 'Local Courier Express',
      trackingUrl: '#',
      progress: 45,
      milestones: [
        { status: 'completed', label: 'Pickup Confirmed', time: '2024-10-15 10:00 AM', location: 'San Francisco, CA' },
        { status: 'active', label: 'In Transit', time: '2024-10-15 12:00 PM', location: 'En route to Pebble Beach' },
        { status: 'pending', label: 'Delivery to Pro Shop', time: 'Estimated 6:00 PM', location: 'Pebble Beach Golf Links' }
      ],
      equipment: {
        items: '12 Callaway Clubs',
        bagType: 'Cart Bag with Push Cart',
        weight: '45 lbs',
        dimensions: '48" x 14" x 11"',
        value: '$2,800',
        insurance: '$2,800 Full Coverage'
      },
      pricing: {
        baseRate: '$89',
        express: '$40',
        insurance: '$28',
        total: '$129',
        saved: '$60'
      },
      notes: {
        customer: 'Weekend getaway to Pebble Beach. First time using Ship Sticks. Would like complimentary club cleaning if available.',
        handling: 'Same-day pickup completed. Customer very friendly. Push cart disassembled and secured. Pro shop notified of arrival.'
      }
    },
    'SS-003': {
      id: 'SS-003',
      trackingNumber: 'SS-2024-KI441',
      customerName: 'David Thompson',
      customerEmail: 'david.thompson@email.com',
      customerPhone: '(555) 345-6789',
      status: 'Active',
      priority: 'High',
      shipmentType: 'International - Customs Cleared',
      origin: 'New York, NY',
      destination: 'Old Course at St Andrews, Scotland',
      shipDate: '2024-10-10',
      estimatedDelivery: '2024-10-17',
      carrier: 'DHL International Express',
      trackingUrl: '#',
      progress: 85,
      milestones: [
        { status: 'completed', label: 'Pickup Confirmed', time: '2024-10-10 9:00 AM', location: 'New York, NY' },
        { status: 'completed', label: 'International Flight', time: '2024-10-11 6:00 PM', location: 'JFK Airport' },
        { status: 'completed', label: 'Arrived Heathrow', time: '2024-10-12 8:00 AM', location: 'London, UK' },
        { status: 'completed', label: 'Customs Cleared', time: '2024-10-13 2:00 PM', location: 'Heathrow Customs' },
        { status: 'active', label: 'In Transit to Scotland', time: '2024-10-15 10:00 AM', location: 'Edinburgh' },
        { status: 'pending', label: 'Hotel Delivery', time: 'Estimated Oct 17', location: 'Rusacks St Andrews' }
      ],
      equipment: {
        items: '13 Custom Mizuno Irons',
        bagType: 'International Travel Case',
        weight: '50 lbs',
        dimensions: '50" x 14" x 12"',
        value: '$5,200',
        insurance: '$5,200 International Coverage'
      },
      pricing: {
        baseRate: '$399',
        international: '$100',
        customs: '$85',
        insurance: '$52',
        total: '$499',
        saved: '$100'
      },
      notes: {
        customer: 'Once-in-lifetime trip to St. Andrews Old Course. All customs paperwork completed online. Need delivery directly to hotel.',
        handling: 'International shipment processed. All customs declarations filed. Links caddie master coordinated for hotel delivery.'
      }
    },
    'SS-004': {
      id: 'SS-004',
      trackingNumber: 'SS-2024-SC128',
      customerName: 'Michael Chen',
      customerEmail: 'michael.chen@email.com',
      customerPhone: '(555) 456-7890',
      status: 'Scheduled',
      priority: 'Low',
      shipmentType: 'Seasonal Snowbird - Standard',
      origin: 'Minneapolis, MN',
      destination: 'TPC Scottsdale, Scottsdale, AZ',
      shipDate: '2024-10-18',
      estimatedDelivery: '2024-10-22',
      carrier: 'UPS Ground',
      trackingUrl: '#',
      progress: 5,
      milestones: [
        { status: 'pending', label: 'Pickup Scheduled', time: '2024-10-18 10:00 AM', location: 'Minneapolis, MN' },
        { status: 'pending', label: 'In Transit', time: 'TBD', location: 'En route' },
        { status: 'pending', label: 'Arrive at Facility', time: 'Estimated Oct 21', location: 'Scottsdale, AZ' },
        { status: 'pending', label: '30-Day Storage', time: 'Available until Nov 21', location: 'TPC Scottsdale' }
      ],
      equipment: {
        items: '11 TaylorMade Clubs',
        bagType: 'Cart Bag',
        weight: '42 lbs',
        dimensions: '46" x 13" x 11"',
        value: '$2,200',
        insurance: '$2,200 Full Coverage'
      },
      pricing: {
        baseRate: '$149',
        seasonalDiscount: '-$60',
        storage30Days: '$0',
        insurance: '$22',
        total: '$89',
        saved: '$60'
      },
      notes: {
        customer: 'Annual winter migration from Minneapolis. Regular customer, 3rd year. Flexible on delivery dates.',
        handling: 'Pickup scheduled for Oct 18. Customer utilizing off-season discount. 30-day complimentary storage included.'
      }
    }
  }

  const shipment = shipmentData[shipmentId]

  if (!shipment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Shipment Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Shipment ID: {shipmentId}</p>
          <button
            onClick={() => router.push('/dashboard/care-sessions')}
            className="px-6 py-3 bg-arthur-blue text-white rounded-lg hover:bg-arthur-blue-dark transition-colors"
          >
            Back to Shipments
          </button>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in transit': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
      case 'scheduled': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
      case 'delivered': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard/care-sessions')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <PageHeader
          title={`Shipment ${shipment.trackingNumber}`}
          description={`${shipment.customerName} • ${shipment.shipmentType}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Shipment Status</h2>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(shipment.status)}`}>
                {shipment.status}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Delivery Progress</span>
                <span className="text-sm font-bold text-arthur-blue">{shipment.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-arthur-blue h-3 rounded-full transition-all"
                  style={{ width: `${shipment.progress}%` }}
                />
              </div>
            </div>

            {/* Route Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Origin</span>
                </div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{shipment.origin}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={16} className="text-green-600" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Destination</span>
                </div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{shipment.destination}</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Tracking Timeline</h3>
              {shipment.milestones.map((milestone: any, index: number) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      milestone.status === 'completed' ? 'bg-green-100 text-green-600' :
                      milestone.status === 'active' ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {milestone.status === 'completed' ? <CheckCircle size={16} /> :
                       milestone.status === 'active' ? <Truck size={16} /> :
                       <Clock size={16} />}
                    </div>
                    {index < shipment.milestones.length - 1 && (
                      <div className={`w-0.5 h-12 ${
                        milestone.status === 'completed' ? 'bg-green-200' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{milestone.label}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{milestone.time}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">{milestone.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Equipment Details */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Equipment Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Items</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{shipment.equipment.items}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Bag Type</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{shipment.equipment.bagType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Weight</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{shipment.equipment.weight}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Dimensions</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{shipment.equipment.dimensions}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Declared Value</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{shipment.equipment.value}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Insurance</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{shipment.equipment.insurance}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Shipment Notes</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Customer Instructions</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{shipment.notes.customer}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Handling Notes</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{shipment.notes.handling}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Customer Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User size={16} className="text-gray-500" />
                <span className="text-sm text-gray-900 dark:text-gray-100">{shipment.customerName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-gray-500" />
                <span className="text-sm text-gray-900 dark:text-gray-100">{shipment.customerEmail}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-gray-500" />
                <span className="text-sm text-gray-900 dark:text-gray-100">{shipment.customerPhone}</span>
              </div>
            </div>
          </div>

          {/* Shipping Details */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Shipping Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Carrier</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{shipment.carrier}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ship Date</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{shipment.shipDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Estimated Delivery</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{shipment.estimatedDelivery}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Priority</p>
                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                  shipment.priority === 'High' ? 'bg-red-100 text-red-700' :
                  shipment.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {shipment.priority}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Pricing Breakdown</h3>
            <div className="space-y-2 text-sm">
              {Object.entries(shipment.pricing).map(([key, value]: [string, any]) => {
                if (key === 'total' || key === 'saved') return null
                return (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{value}</span>
                  </div>
                )
              })}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span className="text-gray-900 dark:text-gray-100">Total</span>
                  <span className="text-arthur-blue">{shipment.pricing.total}</span>
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 mt-2">
                <p className="text-sm text-green-700 dark:text-green-400 text-center font-semibold">
                  You saved {shipment.pricing.saved}!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
