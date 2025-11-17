// Ship Sticks Shipment Intelligence Demo Data
// Real-world golf equipment shipping scenarios demonstrating AI-powered logistics

export interface ShipmentCase {
  id: string
  golferProfile: string
  shipmentType: string
  location: {
    origin: string
    destination: string
    courseName: string
  }
  equipment: {
    type: string
    description: string
    value: number
    startDate: string
  }
  outcomes: {
    standardCost: number
    optimizedCost: number
    savingsPercentage: number
    deliveryTime: string
    serviceScore: number
  }
  status: 'Delivered' | 'In Transit' | 'Processing'
  description: string
  highlights: string[]
  metrics?: {
    onTimeDelivery?: string
    damageRate?: number
    customerSatisfaction?: number
  }
}

export const SHIPMENT_CASES: ShipmentCase[] = [
  {
    id: 'masters-tournament',
    golferProfile: 'PGA Tour Professional',
    shipmentType: 'Premium Tournament Delivery',
    location: {
      origin: 'Ponte Vedra Beach, FL',
      destination: 'Augusta, GA',
      courseName: 'Augusta National Golf Club'
    },
    equipment: {
      type: 'Custom Tour Bag with Titleist T350 Iron Set & TSR Woods',
      description: 'White-glove tournament delivery with climate control',
      value: 8500,
      startDate: '2024-04-05'
    },
    outcomes: {
      standardCost: 399,
      optimizedCost: 349,
      savingsPercentage: 13,
      deliveryTime: '24 hours',
      serviceScore: 99
    },
    status: 'Delivered',
    description: 'Professional golfer shipping equipment to Masters Tournament. Ship Sticks AI optimized routing through Atlanta hub, guaranteed arrival 48 hours before tee time, and provided real-time GPS tracking with signature delivery to tournament officials.',
    highlights: [
      'Delivered 48 hours early',
      'Zero damage - pristine condition',
      '24/7 white-glove handling',
      'Real-time GPS tracking'
    ],
    metrics: {
      onTimeDelivery: 'Delivered 2 days early',
      damageRate: 0,
      customerSatisfaction: 100
    }
  },
  {
    id: 'pebble-beach-vacation',
    golferProfile: 'Luxury Golf Traveler',
    shipmentType: 'Resort Package Delivery',
    location: {
      origin: 'San Francisco, CA',
      destination: 'Pebble Beach, CA',
      courseName: 'Pebble Beach Golf Links'
    },
    equipment: {
      type: 'Complete Golf Travel Package',
      description: 'Callaway tour bag + push cart + golf shoes',
      value: 3800,
      startDate: '2024-09-15'
    },
    outcomes: {
      standardCost: 189,
      optimizedCost: 129,
      savingsPercentage: 32,
      deliveryTime: 'Same day',
      serviceScore: 97
    },
    status: 'Delivered',
    description: 'Weekend golfer traveling to Pebble Beach. Ship Sticks AI identified same-day delivery option via local courier, saved customer $60, and coordinated direct delivery to resort pro shop with complimentary club cleaning service.',
    highlights: [
      '32% cost savings vs standard',
      'Same-day delivery completed',
      'Complimentary club cleaning',
      'Delivered to pro shop storage'
    ],
    metrics: {
      onTimeDelivery: 'Same day - 6 hours',
      damageRate: 0,
      customerSatisfaction: 98
    }
  },
  {
    id: 'st-andrews-international',
    golferProfile: 'International Golf Pilgrim',
    shipmentType: 'International Customs Clearance',
    location: {
      origin: 'New York, NY',
      destination: 'St Andrews, Scotland',
      courseName: 'Old Course at St Andrews'
    },
    equipment: {
      type: 'Custom Fitted Clubs + Travel Case',
      description: 'International shipment with full customs handling',
      value: 5200,
      startDate: '2024-07-20'
    },
    outcomes: {
      standardCost: 599,
      optimizedCost: 499,
      savingsPercentage: 17,
      deliveryTime: '5 days',
      serviceScore: 95
    },
    status: 'Delivered',
    description: 'Once-in-a-lifetime trip to St Andrews Old Course. Ship Sticks AI handled all UK customs paperwork, provided door-to-links service, coordinated with Old Course caddie master, and ensured clubs arrived 72 hours before tee time despite weather delays.',
    highlights: [
      'Seamless customs clearance',
      'Weather delay mitigation',
      'Direct links delivery',
      'Caddie master coordination'
    ],
    metrics: {
      onTimeDelivery: '3 days before tee time',
      damageRate: 0,
      customerSatisfaction: 96
    }
  },
  {
    id: 'scottsdale-snowbird',
    golferProfile: 'Winter Golf Seasonal',
    shipmentType: 'Seasonal Storage & Delivery',
    location: {
      origin: 'Minneapolis, MN',
      destination: 'Scottsdale, AZ',
      courseName: 'TPC Scottsdale - Stadium Course'
    },
    equipment: {
      type: 'TaylorMade Cart Bag',
      description: 'Winter season golf package',
      value: 2200,
      startDate: '2024-11-01'
    },
    outcomes: {
      standardCost: 149,
      optimizedCost: 89,
      savingsPercentage: 40,
      deliveryTime: '3 days',
      serviceScore: 96
    },
    status: 'In Transit',
    description: 'Snowbird golfer relocating to Arizona for winter season. Ship Sticks AI identified off-peak pricing window, optimized route via Denver hub, and provided complimentary 30-day storage at Scottsdale partner facility. Customer saved $60 and gained flexible pickup.',
    highlights: [
      '40% off-season savings',
      '30-day complimentary storage',
      'Flexible pickup scheduling',
      'Partner facility coordination'
    ],
    metrics: {
      onTimeDelivery: 'Tracking on schedule',
      damageRate: 0,
      customerSatisfaction: 94
    }
  },
  {
    id: 'hawaii-destination',
    golferProfile: 'Destination Wedding Guest',
    shipmentType: 'Multi-Island Coordination',
    location: {
      origin: 'Los Angeles, CA',
      destination: 'Maui, HI',
      courseName: 'Kapalua Plantation Course'
    },
    equipment: {
      type: 'Tour Bag + Push Cart + Golf Shoes',
      description: 'Hawaii multi-package coordination',
      value: 3600,
      startDate: '2024-12-10'
    },
    outcomes: {
      standardCost: 449,
      optimizedCost: 349,
      savingsPercentage: 22,
      deliveryTime: '4 days',
      serviceScore: 98
    },
    status: 'Processing',
    description: 'Wedding guest combining business trip with golf at Kapalua. Ship Sticks AI coordinated multiple packages (clubs, shoes, cart) into single shipment, arranged Honolulu-to-Maui inter-island transfer, and provided resort concierge delivery with weather impact monitoring.',
    highlights: [
      '22% multi-package discount',
      'Inter-island coordination',
      'Weather impact monitoring',
      'Resort concierge delivery'
    ],
    metrics: {
      onTimeDelivery: 'Scheduled for 5 days before',
      damageRate: 0,
      customerSatisfaction: 97
    }
  },
  {
    id: 'myrtle-beach-buddy-trip',
    golferProfile: 'Golf Buddy Group (4 golfers)',
    shipmentType: 'Bulk Group Shipment',
    location: {
      origin: 'Charlotte, NC',
      destination: 'Myrtle Beach, SC',
      courseName: 'Caledonia Golf & Fish Club'
    },
    equipment: {
      type: '4 Golf Bags - Group Package',
      description: 'Buddy trip group coordination',
      value: 6800,
      startDate: '2024-10-18'
    },
    outcomes: {
      standardCost: 316,
      optimizedCost: 199,
      savingsPercentage: 37,
      deliveryTime: '2 days',
      serviceScore: 97
    },
    status: 'Delivered',
    description: 'Four friends on annual Myrtle Beach golf trip. Ship Sticks AI identified group discount eligibility, consolidated shipping to single truck, coordinated multi-course delivery (Caledonia, TPC Myrtle Beach, Dunes Club), and saved group $117 total.',
    highlights: [
      '37% group discount applied',
      'Single consolidated shipment',
      'Multi-course delivery',
      'Group saved $117 total'
    ],
    metrics: {
      onTimeDelivery: 'All 4 bags on time',
      damageRate: 0,
      customerSatisfaction: 99
    }
  }
]

// Statistics for dashboard based on Ship Sticks AI logistics performance
export const SHIPSTICKS_STATISTICS = {
  totalCostSavings: 12500000, // $12.5M+ in shipping cost savings
  shipmentsDelivered: 125000,
  averageSavings: 28, // 28% average cost reduction
  serviceScore: 97, // Average service quality score
  activeShipments: 1247,
  shippingRoutes: 450,
  partnerCourses: ['Championship Courses', 'Resort Partners', 'Private Clubs', 'Public Courses', 'International Links']
}

// Helper functions for data access
export function getCaseById(id: string): ShipmentCase | undefined {
  return SHIPMENT_CASES.find(shipmentCase => shipmentCase.id === id)
}

export function getCasesByStatus(status: ShipmentCase['status']): ShipmentCase[] {
  return SHIPMENT_CASES.filter(shipmentCase => shipmentCase.status === status)
}

export function getCasesByDestination(courseName: string): ShipmentCase[] {
  return SHIPMENT_CASES.filter(shipmentCase =>
    shipmentCase.location.courseName.toLowerCase().includes(courseName.toLowerCase())
  )
}

export function getDeliveredCases(): ShipmentCase[] {
  return SHIPMENT_CASES.filter(shipmentCase => shipmentCase.status === 'Delivered')
}

export function getActiveCases(): ShipmentCase[] {
  return SHIPMENT_CASES.filter(shipmentCase =>
    shipmentCase.status === 'In Transit' || shipmentCase.status === 'Processing'
  )
}

// Format currency for display
export function formatCurrency(amount: number | null): string {
  if (amount === null) return 'TBD'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Calculate cost savings
export function calculateSavings(standard: number, optimized: number): string {
  const savings = standard - optimized
  return formatCurrency(savings)
}

// Calculate savings percentage
export function calculateSavingsPercentage(standard: number, optimized: number): string {
  const percentage = ((standard - optimized) / standard) * 100
  return `${Math.round(percentage)}%`
}

// Get high-value shipments
export function getHighValueShipments(minValue: number = 5000): ShipmentCase[] {
  return SHIPMENT_CASES.filter(shipmentCase => shipmentCase.equipment.value >= minValue)
}

// Get international shipments
export function getInternationalShipments(): ShipmentCase[] {
  return SHIPMENT_CASES.filter(shipmentCase =>
    !shipmentCase.location.destination.includes('USA') &&
    !shipmentCase.location.destination.includes(', CA') &&
    !shipmentCase.location.destination.includes(', FL') &&
    !shipmentCase.location.destination.includes(', AZ')
  )
}

// Calculate average delivery time
export function getAverageDeliveryTime(): string {
  const deliveredCases = getDeliveredCases()
  // This is simplified - in reality would parse actual delivery times
  return '2.5 days'
}

// Get customer satisfaction rate
export function getAverageSatisfaction(): number {
  const casesWithMetrics = SHIPMENT_CASES.filter(c => c.metrics?.customerSatisfaction)
  if (casesWithMetrics.length === 0) return 0

  const total = casesWithMetrics.reduce((sum, c) => sum + (c.metrics?.customerSatisfaction || 0), 0)
  return Math.round(total / casesWithMetrics.length)
}
