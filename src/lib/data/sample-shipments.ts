import { GOLF_COURSES } from './golf-courses'

export type ShipmentStatus =
  | 'pending'
  | 'picked-up'
  | 'in-transit'
  | 'out-for-delivery'
  | 'delivered'
  | 'delayed'
  | 'exception'

export type ServiceLevel =
  | 'standard'
  | 'express'
  | 'overnight'
  | 'white-glove'

export type EquipmentType =
  | 'golf-bag'
  | 'travel-case'
  | 'tour-bag'
  | 'stand-bag'
  | 'cart-bag'
  | 'push-cart'
  | 'golf-shoes'
  | 'multiple-items'

export interface Shipment {
  id: string
  trackingNumber: string
  customer: {
    id: string
    name: string
    email: string
    phone: string
    tier: 'standard' | 'premium' | 'vip'
  }
  origin: {
    address: string
    city: string
    state: string
    country: string
    zipCode: string
  }
  destination: {
    courseId: string
    courseName: string
    address: string
    city: string
    state?: string
    country: string
    zipCode: string
    specialInstructions?: string
  }
  equipment: {
    type: EquipmentType
    description: string
    quantity: number
    estimatedValue: number
    weight: number // in lbs
    specialHandling?: string[]
  }
  service: {
    level: ServiceLevel
    price: number
    insurance: number
    totalCost: number
  }
  timeline: {
    createdAt: Date
    pickupDate: Date
    estimatedDelivery: Date
    actualDelivery?: Date
    teeTime?: Date
  }
  status: ShipmentStatus
  tracking: {
    currentLocation: string
    lastUpdate: Date
    updates: TrackingUpdate[]
  }
  aiInsights?: {
    onTimeConfidence: number // 0-100
    weatherImpact: 'none' | 'low' | 'medium' | 'high'
    routeOptimization: string
    deliveryWindow: string
  }
}

export interface TrackingUpdate {
  timestamp: Date
  location: string
  status: string
  description: string
}

// Generate realistic demo shipments
export const SAMPLE_SHIPMENTS: Shipment[] = [
  // High-priority active shipments
  {
    id: 'ship-001',
    trackingNumber: 'SS-2024-1847',
    customer: {
      id: 'cust-001',
      name: 'James Morrison',
      email: 'j.morrison@email.com',
      phone: '+1-555-0123',
      tier: 'vip'
    },
    origin: {
      address: '245 Oak Street',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      zipCode: '94102'
    },
    destination: {
      courseId: 'pebble-beach',
      courseName: 'Pebble Beach Golf Links',
      address: '1700 17-Mile Drive',
      city: 'Pebble Beach',
      state: 'CA',
      country: 'USA',
      zipCode: '93953',
      specialInstructions: 'Deliver to Pro Shop, hold for guest arrival'
    },
    equipment: {
      type: 'tour-bag',
      description: 'Titleist Staff Tour Bag - T350 Irons (4-PW), TSR Woods, Vokey Wedges',
      quantity: 1,
      estimatedValue: 4500,
      weight: 48,
      specialHandling: ['Fragile - Custom Fitted Clubs', 'Climate Controlled']
    },
    service: {
      level: 'express',
      price: 149,
      insurance: 45,
      totalCost: 194
    },
    timeline: {
      createdAt: new Date('2024-10-14T08:30:00'),
      pickupDate: new Date('2024-10-14T14:00:00'),
      estimatedDelivery: new Date('2024-10-16T10:00:00'),
      teeTime: new Date('2024-10-17T08:00:00')
    },
    status: 'in-transit',
    tracking: {
      currentLocation: 'San Jose Distribution Center',
      lastUpdate: new Date('2024-10-15T22:15:00'),
      updates: [
        {
          timestamp: new Date('2024-10-14T14:15:00'),
          location: 'San Francisco, CA',
          status: 'picked-up',
          description: 'Package picked up from residence'
        },
        {
          timestamp: new Date('2024-10-14T18:30:00'),
          location: 'San Francisco Hub',
          status: 'in-transit',
          description: 'Departed facility'
        },
        {
          timestamp: new Date('2024-10-15T22:15:00'),
          location: 'San Jose Distribution Center',
          status: 'in-transit',
          description: 'Arrived at distribution center'
        }
      ]
    },
    aiInsights: {
      onTimeConfidence: 95,
      weatherImpact: 'none',
      routeOptimization: 'Express routing via Highway 1',
      deliveryWindow: '24 hours before tee time - OPTIMAL'
    }
  },
  {
    id: 'ship-002',
    trackingNumber: 'SS-2024-1848',
    customer: {
      id: 'cust-002',
      name: 'Sarah Chen',
      email: 's.chen@email.com',
      phone: '+1-555-0245',
      tier: 'premium'
    },
    origin: {
      address: '890 Maple Avenue',
      city: 'Chicago',
      state: 'IL',
      country: 'USA',
      zipCode: '60614'
    },
    destination: {
      courseId: 'whistling-straits',
      courseName: 'Whistling Straits',
      address: 'N8501 Lakeshore Road',
      city: 'Kohler',
      state: 'WI',
      country: 'USA',
      zipCode: '53044'
    },
    equipment: {
      type: 'cart-bag',
      description: 'Callaway Org 14 Cart Bag',
      quantity: 1,
      estimatedValue: 2200,
      weight: 42,
      specialHandling: ['Water Resistant']
    },
    service: {
      level: 'standard',
      price: 89,
      insurance: 22,
      totalCost: 111
    },
    timeline: {
      createdAt: new Date('2024-10-13T10:15:00'),
      pickupDate: new Date('2024-10-14T09:00:00'),
      estimatedDelivery: new Date('2024-10-18T15:00:00'),
      teeTime: new Date('2024-10-19T13:30:00')
    },
    status: 'out-for-delivery',
    tracking: {
      currentLocation: 'Kohler, WI - Out for Delivery',
      lastUpdate: new Date('2024-10-16T07:00:00'),
      updates: [
        {
          timestamp: new Date('2024-10-14T09:15:00'),
          location: 'Chicago, IL',
          status: 'picked-up',
          description: 'Package picked up'
        },
        {
          timestamp: new Date('2024-10-15T14:20:00'),
          location: 'Milwaukee, WI Hub',
          status: 'in-transit',
          description: 'Arrived at regional hub'
        },
        {
          timestamp: new Date('2024-10-16T07:00:00'),
          location: 'Kohler, WI',
          status: 'out-for-delivery',
          description: 'Out for delivery to resort'
        }
      ]
    },
    aiInsights: {
      onTimeConfidence: 98,
      weatherImpact: 'low',
      routeOptimization: 'Standard ground route via I-94',
      deliveryWindow: '36 hours before tee time - EXCELLENT'
    }
  },
  {
    id: 'ship-003',
    trackingNumber: 'SS-2024-1849',
    customer: {
      id: 'cust-003',
      name: 'Michael Thompson',
      email: 'm.thompson@email.com',
      phone: '+44-20-5550-0189',
      tier: 'vip'
    },
    origin: {
      address: '42 Kensington Gardens',
      city: 'London',
      state: '',
      country: 'United Kingdom',
      zipCode: 'W2 4BG'
    },
    destination: {
      courseId: 'st-andrews',
      courseName: 'Old Course at St Andrews',
      address: 'Pilmour House',
      city: 'St Andrews',
      country: 'Scotland',
      zipCode: 'KY16 9SF'
    },
    equipment: {
      type: 'travel-case',
      description: 'Club Glove Last Bag Pro with Ping i525 irons',
      quantity: 1,
      estimatedValue: 5200,
      weight: 52,
      specialHandling: ['International Customs', 'Signature Required', 'Premium Insurance']
    },
    service: {
      level: 'white-glove',
      price: 499,
      insurance: 52,
      totalCost: 551
    },
    timeline: {
      createdAt: new Date('2024-10-08T11:00:00'),
      pickupDate: new Date('2024-10-09T10:00:00'),
      estimatedDelivery: new Date('2024-10-15T14:00:00'),
      teeTime: new Date('2024-10-16T09:00:00')
    },
    status: 'in-transit',
    tracking: {
      currentLocation: 'Edinburgh Airport - Customs Clearance',
      lastUpdate: new Date('2024-10-15T09:30:00'),
      updates: [
        {
          timestamp: new Date('2024-10-09T10:30:00'),
          location: 'London, UK',
          status: 'picked-up',
          description: 'White-glove pickup from residence'
        },
        {
          timestamp: new Date('2024-10-10T08:00:00'),
          location: 'Heathrow International Hub',
          status: 'in-transit',
          description: 'Departed for Scotland'
        },
        {
          timestamp: new Date('2024-10-15T09:30:00'),
          location: 'Edinburgh Airport',
          status: 'in-transit',
          description: 'Customs clearance in progress'
        }
      ]
    },
    aiInsights: {
      onTimeConfidence: 90,
      weatherImpact: 'medium',
      routeOptimization: 'Direct route via Edinburgh',
      deliveryWindow: '21 hours before tee time - ON TRACK'
    }
  },
  {
    id: 'ship-004',
    trackingNumber: 'SS-2024-1850',
    customer: {
      id: 'cust-004',
      name: 'Robert Kim',
      email: 'r.kim@email.com',
      phone: '+1-555-0367',
      tier: 'premium'
    },
    origin: {
      address: '1523 Desert View Drive',
      city: 'Phoenix',
      state: 'AZ',
      country: 'USA',
      zipCode: '85016'
    },
    destination: {
      courseId: 'tpc-scottsdale',
      courseName: 'TPC Scottsdale - Stadium Course',
      address: '17020 N Hayden Road',
      city: 'Scottsdale',
      state: 'AZ',
      country: 'USA',
      zipCode: '85255'
    },
    equipment: {
      type: 'stand-bag',
      description: 'Sun Mountain C-130 Stand Bag',
      quantity: 1,
      estimatedValue: 1800,
      weight: 35,
      specialHandling: []
    },
    service: {
      level: 'express',
      price: 79,
      insurance: 18,
      totalCost: 97
    },
    timeline: {
      createdAt: new Date('2024-10-15T14:20:00'),
      pickupDate: new Date('2024-10-16T08:00:00'),
      estimatedDelivery: new Date('2024-10-17T12:00:00'),
      teeTime: new Date('2024-10-18T07:30:00')
    },
    status: 'pending',
    tracking: {
      currentLocation: 'Phoenix, AZ - Pickup Scheduled',
      lastUpdate: new Date('2024-10-15T14:20:00'),
      updates: [
        {
          timestamp: new Date('2024-10-15T14:20:00'),
          location: 'Online',
          status: 'pending',
          description: 'Shipment created - pickup scheduled for tomorrow'
        }
      ]
    },
    aiInsights: {
      onTimeConfidence: 99,
      weatherImpact: 'none',
      routeOptimization: 'Same-day local delivery available',
      deliveryWindow: '43 hours before tee time - EARLY'
    }
  },
  {
    id: 'ship-005',
    trackingNumber: 'SS-2024-1843',
    customer: {
      id: 'cust-005',
      name: 'Emily Rodriguez',
      email: 'e.rodriguez@email.com',
      phone: '+1-555-0891',
      tier: 'standard'
    },
    origin: {
      address: '728 Beach Boulevard',
      city: 'Jacksonville',
      state: 'FL',
      country: 'USA',
      zipCode: '32250'
    },
    destination: {
      courseId: 'tpc-sawgrass',
      courseName: 'TPC Sawgrass - Stadium Course',
      address: '110 Championship Way',
      city: 'Ponte Vedra Beach',
      state: 'FL',
      country: 'USA',
      zipCode: '32082'
    },
    equipment: {
      type: 'golf-bag',
      description: 'TaylorMade FlexTech Stand Bag',
      quantity: 1,
      estimatedValue: 1500,
      weight: 38,
      specialHandling: []
    },
    service: {
      level: 'standard',
      price: 59,
      insurance: 15,
      totalCost: 74
    },
    timeline: {
      createdAt: new Date('2024-10-12T16:45:00'),
      pickupDate: new Date('2024-10-13T11:00:00'),
      estimatedDelivery: new Date('2024-10-15T10:00:00'),
      actualDelivery: new Date('2024-10-15T09:45:00'),
      teeTime: new Date('2024-10-16T14:00:00')
    },
    status: 'delivered',
    tracking: {
      currentLocation: 'TPC Sawgrass Pro Shop',
      lastUpdate: new Date('2024-10-15T09:45:00'),
      updates: [
        {
          timestamp: new Date('2024-10-13T11:15:00'),
          location: 'Jacksonville, FL',
          status: 'picked-up',
          description: 'Package picked up'
        },
        {
          timestamp: new Date('2024-10-14T16:30:00'),
          location: 'Ponte Vedra Beach, FL',
          status: 'out-for-delivery',
          description: 'Out for delivery'
        },
        {
          timestamp: new Date('2024-10-15T09:45:00'),
          location: 'TPC Sawgrass Pro Shop',
          status: 'delivered',
          description: 'Delivered and signed for by Pro Shop staff'
        }
      ]
    },
    aiInsights: {
      onTimeConfidence: 100,
      weatherImpact: 'none',
      routeOptimization: 'Local route - 30 minutes',
      deliveryWindow: 'Delivered 28 hours early - EXCELLENT'
    }
  },
  {
    id: 'ship-006',
    trackingNumber: 'SS-2024-1851',
    customer: {
      id: 'cust-006',
      name: 'David Park',
      email: 'd.park@email.com',
      phone: '+1-555-0423',
      tier: 'vip'
    },
    origin: {
      address: '356 Wilshire Boulevard',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      zipCode: '90036'
    },
    destination: {
      courseId: 'kapalua-plantation',
      courseName: 'Kapalua Plantation Course',
      address: '2000 Plantation Club Drive',
      city: 'Lahaina',
      state: 'HI',
      country: 'USA',
      zipCode: '96761'
    },
    equipment: {
      type: 'multiple-items',
      description: 'Tour bag + push cart + golf shoes',
      quantity: 3,
      estimatedValue: 3800,
      weight: 65,
      specialHandling: ['Hawaii Service', 'Multiple Packages', 'Resort Coordination']
    },
    service: {
      level: 'white-glove',
      price: 349,
      insurance: 38,
      totalCost: 387
    },
    timeline: {
      createdAt: new Date('2024-10-11T09:00:00'),
      pickupDate: new Date('2024-10-12T13:00:00'),
      estimatedDelivery: new Date('2024-10-17T16:00:00'),
      teeTime: new Date('2024-10-18T10:30:00')
    },
    status: 'in-transit',
    tracking: {
      currentLocation: 'Honolulu International Airport',
      lastUpdate: new Date('2024-10-16T06:30:00'),
      updates: [
        {
          timestamp: new Date('2024-10-12T13:30:00'),
          location: 'Los Angeles, CA',
          status: 'picked-up',
          description: 'White-glove pickup completed'
        },
        {
          timestamp: new Date('2024-10-13T22:00:00'),
          location: 'LAX Air Cargo',
          status: 'in-transit',
          description: 'Departed for Hawaii'
        },
        {
          timestamp: new Date('2024-10-16T06:30:00'),
          location: 'Honolulu International Airport',
          status: 'in-transit',
          description: 'Arrived in Hawaii - preparing for Maui transfer'
        }
      ]
    },
    aiInsights: {
      onTimeConfidence: 92,
      weatherImpact: 'low',
      routeOptimization: 'Island hopper service via HNL',
      deliveryWindow: '18 hours before tee time - ON SCHEDULE'
    }
  },
  {
    id: 'ship-007',
    trackingNumber: 'SS-2024-1852',
    customer: {
      id: 'cust-007',
      name: 'Jennifer Walsh',
      email: 'j.walsh@email.com',
      phone: '+1-555-0534',
      tier: 'premium'
    },
    origin: {
      address: '1892 Highland Avenue',
      city: 'Atlanta',
      state: 'GA',
      country: 'USA',
      zipCode: '30306'
    },
    destination: {
      courseId: 'kiawah-ocean',
      courseName: 'Kiawah Island Golf Resort - Ocean Course',
      address: '1000 Ocean Course Drive',
      city: 'Kiawah Island',
      state: 'SC',
      country: 'USA',
      zipCode: '29455'
    },
    equipment: {
      type: 'cart-bag',
      description: 'Ping Pioneer Cart Bag with Mizuno irons',
      quantity: 1,
      estimatedValue: 2900,
      weight: 45,
      specialHandling: ['Beach Climate Control']
    },
    service: {
      level: 'express',
      price: 139,
      insurance: 29,
      totalCost: 168
    },
    timeline: {
      createdAt: new Date('2024-10-14T07:30:00'),
      pickupDate: new Date('2024-10-14T15:00:00'),
      estimatedDelivery: new Date('2024-10-16T14:00:00'),
      teeTime: new Date('2024-10-17T08:00:00')
    },
    status: 'in-transit',
    tracking: {
      currentLocation: 'Charleston, SC Hub',
      lastUpdate: new Date('2024-10-16T04:15:00'),
      updates: [
        {
          timestamp: new Date('2024-10-14T15:20:00'),
          location: 'Atlanta, GA',
          status: 'picked-up',
          description: 'Package picked up from residence'
        },
        {
          timestamp: new Date('2024-10-15T10:45:00'),
          location: 'Columbia, SC',
          status: 'in-transit',
          description: 'In transit to coast'
        },
        {
          timestamp: new Date('2024-10-16T04:15:00'),
          location: 'Charleston, SC Hub',
          status: 'in-transit',
          description: 'At final hub - delivery scheduled for today'
        }
      ]
    },
    aiInsights: {
      onTimeConfidence: 96,
      weatherImpact: 'none',
      routeOptimization: 'I-26 corridor to coastal delivery',
      deliveryWindow: '18 hours before tee time - OPTIMAL'
    }
  },
  {
    id: 'ship-008',
    trackingNumber: 'SS-2024-1845',
    customer: {
      id: 'cust-008',
      name: 'Thomas Anderson',
      email: 't.anderson@email.com',
      phone: '+1-555-0645',
      tier: 'standard'
    },
    origin: {
      address: '567 Main Street',
      city: 'Boston',
      state: 'MA',
      country: 'USA',
      zipCode: '02108'
    },
    destination: {
      courseId: 'pinehurst-no-2',
      courseName: 'Pinehurst No. 2',
      address: '1 Carolina Vista Drive',
      city: 'Pinehurst',
      state: 'NC',
      country: 'USA',
      zipCode: '28374'
    },
    equipment: {
      type: 'stand-bag',
      description: 'Titleist Players 4 StaDry Stand Bag with T350 Irons',
      quantity: 1,
      estimatedValue: 2100,
      weight: 40,
      specialHandling: []
    },
    service: {
      level: 'standard',
      price: 79,
      insurance: 21,
      totalCost: 100
    },
    timeline: {
      createdAt: new Date('2024-10-10T12:00:00'),
      pickupDate: new Date('2024-10-11T10:00:00'),
      estimatedDelivery: new Date('2024-10-14T15:00:00'),
      actualDelivery: new Date('2024-10-14T14:30:00'),
      teeTime: new Date('2024-10-15T11:00:00')
    },
    status: 'delivered',
    tracking: {
      currentLocation: 'Pinehurst Resort Pro Shop',
      lastUpdate: new Date('2024-10-14T14:30:00'),
      updates: [
        {
          timestamp: new Date('2024-10-11T10:15:00'),
          location: 'Boston, MA',
          status: 'picked-up',
          description: 'Package picked up'
        },
        {
          timestamp: new Date('2024-10-12T18:20:00'),
          location: 'Richmond, VA Hub',
          status: 'in-transit',
          description: 'In transit'
        },
        {
          timestamp: new Date('2024-10-14T08:00:00'),
          location: 'Pinehurst, NC',
          status: 'out-for-delivery',
          description: 'Out for delivery to resort'
        },
        {
          timestamp: new Date('2024-10-14T14:30:00'),
          location: 'Pinehurst Resort Pro Shop',
          status: 'delivered',
          description: 'Delivered - signed for by resort staff'
        }
      ]
    },
    aiInsights: {
      onTimeConfidence: 100,
      weatherImpact: 'none',
      routeOptimization: 'I-95 corridor - standard ground',
      deliveryWindow: 'Delivered 20 hours early - EXCELLENT'
    }
  },
  {
    id: 'ship-009',
    trackingNumber: 'SS-2024-1853',
    customer: {
      id: 'cust-009',
      name: 'Lisa Martinez',
      email: 'l.martinez@email.com',
      phone: '+1-555-0756',
      tier: 'premium'
    },
    origin: {
      address: '2341 Lake Shore Drive',
      city: 'Seattle',
      state: 'WA',
      country: 'USA',
      zipCode: '98101'
    },
    destination: {
      courseId: 'bandon-dunes',
      courseName: 'Bandon Dunes Golf Resort',
      address: '57744 Round Lake Drive',
      city: 'Bandon',
      state: 'OR',
      country: 'USA',
      zipCode: '97411'
    },
    equipment: {
      type: 'travel-case',
      description: 'Sun Mountain ClubGlider Meridian',
      quantity: 1,
      estimatedValue: 3200,
      weight: 50,
      specialHandling: ['Remote Location', 'Weather Protection']
    },
    service: {
      level: 'express',
      price: 169,
      insurance: 32,
      totalCost: 201
    },
    timeline: {
      createdAt: new Date('2024-10-15T08:00:00'),
      pickupDate: new Date('2024-10-15T16:00:00'),
      estimatedDelivery: new Date('2024-10-18T12:00:00'),
      teeTime: new Date('2024-10-19T09:00:00')
    },
    status: 'picked-up',
    tracking: {
      currentLocation: 'Seattle Distribution Center',
      lastUpdate: new Date('2024-10-15T19:30:00'),
      updates: [
        {
          timestamp: new Date('2024-10-15T16:15:00'),
          location: 'Seattle, WA',
          status: 'picked-up',
          description: 'Package picked up from residence'
        },
        {
          timestamp: new Date('2024-10-15T19:30:00'),
          location: 'Seattle Distribution Center',
          status: 'picked-up',
          description: 'Processing at facility'
        }
      ]
    },
    aiInsights: {
      onTimeConfidence: 88,
      weatherImpact: 'medium',
      routeOptimization: 'Coastal route - weather monitored',
      deliveryWindow: '21 hours before tee time - ON TRACK'
    }
  },
  {
    id: 'ship-010',
    trackingNumber: 'SS-2024-1854',
    customer: {
      id: 'cust-010',
      name: 'Kevin O\'Brien',
      email: 'k.obrien@email.com',
      phone: '+1-555-0867',
      tier: 'vip'
    },
    origin: {
      address: '789 Park Avenue',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      zipCode: '10021'
    },
    destination: {
      courseId: 'augusta-national',
      courseName: 'Augusta National Golf Club',
      address: '2604 Washington Road',
      city: 'Augusta',
      state: 'GA',
      country: 'USA',
      zipCode: '30904',
      specialInstructions: 'VIP Member - Deliver to Members Clubhouse'
    },
    equipment: {
      type: 'tour-bag',
      description: 'Scotty Cameron custom tour bag',
      quantity: 1,
      estimatedValue: 8500,
      weight: 55,
      specialHandling: ['Ultra-Premium', 'White Glove', 'Climate Controlled', 'Signature Required']
    },
    service: {
      level: 'white-glove',
      price: 399,
      insurance: 85,
      totalCost: 484
    },
    timeline: {
      createdAt: new Date('2024-10-16T06:00:00'),
      pickupDate: new Date('2024-10-16T10:00:00'),
      estimatedDelivery: new Date('2024-10-17T15:00:00'),
      teeTime: new Date('2024-10-18T07:30:00')
    },
    status: 'pending',
    tracking: {
      currentLocation: 'New York, NY - Pickup Scheduled',
      lastUpdate: new Date('2024-10-16T06:00:00'),
      updates: [
        {
          timestamp: new Date('2024-10-16T06:00:00'),
          location: 'Online',
          status: 'pending',
          description: 'White-glove pickup scheduled for this morning'
        }
      ]
    },
    aiInsights: {
      onTimeConfidence: 97,
      weatherImpact: 'none',
      routeOptimization: 'Direct overnight service',
      deliveryWindow: '16 hours before tee time - PREMIUM'
    }
  }
]

// Add 40 more varied shipments to reach 50 total
const additionalShipments: Shipment[] = [
  // ... (continuing with varied status, destinations, and scenarios)
]

// Utility functions
export function getShipmentById(id: string): Shipment | undefined {
  return SAMPLE_SHIPMENTS.find(shipment => shipment.id === id)
}

export function getShipmentByTrackingNumber(trackingNumber: string): Shipment | undefined {
  return SAMPLE_SHIPMENTS.find(shipment => shipment.trackingNumber === trackingNumber)
}

export function getShipmentsByStatus(status: ShipmentStatus): Shipment[] {
  return SAMPLE_SHIPMENTS.filter(shipment => shipment.status === status)
}

export function getShipmentsByCustomer(customerId: string): Shipment[] {
  return SAMPLE_SHIPMENTS.filter(shipment => shipment.customer.id === customerId)
}

export function getActiveShipments(): Shipment[] {
  return SAMPLE_SHIPMENTS.filter(shipment =>
    ['picked-up', 'in-transit', 'out-for-delivery'].includes(shipment.status)
  )
}

export function getUpcomingDeliveries(days: number = 7): Shipment[] {
  const now = new Date()
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

  return SAMPLE_SHIPMENTS.filter(shipment => {
    const deliveryDate = shipment.timeline.actualDelivery || shipment.timeline.estimatedDelivery
    return deliveryDate >= now && deliveryDate <= futureDate
  })
}

export function getShipmentsByDestination(courseId: string): Shipment[] {
  return SAMPLE_SHIPMENTS.filter(shipment => shipment.destination.courseId === courseId)
}

export function getHighValueShipments(minValue: number = 5000): Shipment[] {
  return SAMPLE_SHIPMENTS.filter(shipment => shipment.equipment.estimatedValue >= minValue)
}

export function getVIPShipments(): Shipment[] {
  return SAMPLE_SHIPMENTS.filter(shipment => shipment.customer.tier === 'vip')
}

export function getShipmentsWithDelays(): Shipment[] {
  return SAMPLE_SHIPMENTS.filter(shipment => shipment.status === 'delayed' || shipment.status === 'exception')
}

export function getOnTimeDeliveryRate(): number {
  const delivered = SAMPLE_SHIPMENTS.filter(s => s.status === 'delivered')
  if (delivered.length === 0) return 0

  const onTime = delivered.filter(s => {
    if (!s.timeline.actualDelivery) return false
    return s.timeline.actualDelivery <= s.timeline.estimatedDelivery
  })

  return (onTime.length / delivered.length) * 100
}

export function getAverageDeliveryTime(courseId?: string): number {
  let shipments = SAMPLE_SHIPMENTS.filter(s => s.status === 'delivered' && s.timeline.actualDelivery)

  if (courseId) {
    shipments = shipments.filter(s => s.destination.courseId === courseId)
  }

  if (shipments.length === 0) return 0

  const totalHours = shipments.reduce((sum, shipment) => {
    const pickup = shipment.timeline.pickupDate.getTime()
    const delivery = shipment.timeline.actualDelivery!.getTime()
    return sum + (delivery - pickup) / (1000 * 60 * 60) // convert to hours
  }, 0)

  return totalHours / shipments.length / 24 // convert to days
}

export function getTotalShippingRevenue(): number {
  return SAMPLE_SHIPMENTS.reduce((sum, shipment) => sum + shipment.service.totalCost, 0)
}

export function getServiceLevelDistribution(): Record<ServiceLevel, number> {
  return SAMPLE_SHIPMENTS.reduce((acc, shipment) => {
    acc[shipment.service.level] = (acc[shipment.service.level] || 0) + 1
    return acc
  }, {} as Record<ServiceLevel, number>)
}
