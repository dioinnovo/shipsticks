export interface ShippingRoute {
  id: string
  name: string
  origin: {
    city: string
    state?: string
    country: string
    region: string
  }
  destination: {
    courseId: string
    courseName: string
    city: string
    state?: string
    country: string
    region: string
  }
  distance: number // miles
  popularityRank: number
  annualVolume: number
  pricing: {
    standard: { base: number; perLb: number }
    express: { base: number; perLb: number }
    overnight: { base: number; perLb: number }
    whiteGlove: { base: number; perLb: number }
  }
  transit: {
    standardDays: number
    expressDays: number
    overnightDays: number
  }
  seasonality: {
    peak: string[] // months
    shoulder: string[]
    offPeak: string[]
    priceMultipliers: {
      peak: number
      shoulder: number
      offPeak: number
    }
  }
  hubs: string[] // intermediate hubs used
  optimization: {
    preferredCarrier: string
    alternateRoutes: number
    weatherRisk: 'low' | 'medium' | 'high'
    customsRequired: boolean
  }
  performance: {
    onTimeRate: number // percentage
    avgRating: number // out of 5
    damageRate: number // percentage
  }
}

export const SHIPPING_ROUTES: ShippingRoute[] = [
  // Top 20 Most Popular Routes
  {
    id: 'route-001',
    name: 'California Coast to Pebble Beach',
    origin: {
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      region: 'Northern California'
    },
    destination: {
      courseId: 'pebble-beach',
      courseName: 'Pebble Beach Golf Links',
      city: 'Pebble Beach',
      state: 'CA',
      country: 'USA',
      region: 'Monterey Peninsula'
    },
    distance: 120,
    popularityRank: 1,
    annualVolume: 4500,
    pricing: {
      standard: { base: 69, perLb: 0.50 },
      express: { base: 129, perLb: 0.75 },
      overnight: { base: 219, perLb: 1.00 },
      whiteGlove: { base: 349, perLb: 1.50 }
    },
    transit: {
      standardDays: 2,
      expressDays: 1,
      overnightDays: 1
    },
    seasonality: {
      peak: ['May', 'June', 'July', 'August', 'September'],
      shoulder: ['April', 'October'],
      offPeak: ['November', 'December', 'January', 'February', 'March'],
      priceMultipliers: {
        peak: 1.25,
        shoulder: 1.10,
        offPeak: 0.95
      }
    },
    hubs: ['San Jose Regional Hub'],
    optimization: {
      preferredCarrier: 'FedEx Ground',
      alternateRoutes: 2,
      weatherRisk: 'low',
      customsRequired: false
    },
    performance: {
      onTimeRate: 98.5,
      avgRating: 4.9,
      damageRate: 0.1
    }
  },
  {
    id: 'route-002',
    name: 'Phoenix to Scottsdale Golf Corridor',
    origin: {
      city: 'Phoenix',
      state: 'AZ',
      country: 'USA',
      region: 'Arizona'
    },
    destination: {
      courseId: 'tpc-scottsdale',
      courseName: 'TPC Scottsdale',
      city: 'Scottsdale',
      state: 'AZ',
      country: 'USA',
      region: 'Arizona'
    },
    distance: 15,
    popularityRank: 2,
    annualVolume: 5800,
    pricing: {
      standard: { base: 49, perLb: 0.30 },
      express: { base: 79, perLb: 0.50 },
      overnight: { base: 149, perLb: 0.75 },
      whiteGlove: { base: 229, perLb: 1.00 }
    },
    transit: {
      standardDays: 1,
      expressDays: 1,
      overnightDays: 1
    },
    seasonality: {
      peak: ['January', 'February', 'March', 'April'],
      shoulder: ['November', 'December'],
      offPeak: ['May', 'June', 'July', 'August', 'September', 'October'],
      priceMultipliers: {
        peak: 1.35,
        shoulder: 1.15,
        offPeak: 0.90
      }
    },
    hubs: ['Phoenix Metro Hub'],
    optimization: {
      preferredCarrier: 'Local Courier',
      alternateRoutes: 3,
      weatherRisk: 'low',
      customsRequired: false
    },
    performance: {
      onTimeRate: 99.2,
      avgRating: 4.8,
      damageRate: 0.05
    }
  },
  {
    id: 'route-003',
    name: 'NYC to Carolinas Championship Trail',
    origin: {
      city: 'New York',
      state: 'NY',
      country: 'USA',
      region: 'Northeast'
    },
    destination: {
      courseId: 'pinehurst-no-2',
      courseName: 'Pinehurst No. 2',
      city: 'Pinehurst',
      state: 'NC',
      country: 'USA',
      region: 'Southeast'
    },
    distance: 520,
    popularityRank: 3,
    annualVolume: 5200,
    pricing: {
      standard: { base: 79, perLb: 0.60 },
      express: { base: 139, perLb: 0.85 },
      overnight: { base: 229, perLb: 1.20 },
      whiteGlove: { base: 399, perLb: 1.75 }
    },
    transit: {
      standardDays: 3,
      expressDays: 2,
      overnightDays: 1
    },
    seasonality: {
      peak: ['March', 'April', 'May', 'September', 'October'],
      shoulder: ['February', 'June', 'November'],
      offPeak: ['December', 'January', 'July', 'August'],
      priceMultipliers: {
        peak: 1.20,
        shoulder: 1.05,
        offPeak: 0.95
      }
    },
    hubs: ['Philadelphia Hub', 'Richmond Hub'],
    optimization: {
      preferredCarrier: 'UPS Ground',
      alternateRoutes: 2,
      weatherRisk: 'medium',
      customsRequired: false
    },
    performance: {
      onTimeRate: 96.8,
      avgRating: 4.7,
      damageRate: 0.2
    }
  },
  {
    id: 'route-004',
    name: 'Los Angeles to Hawaii Resort Corridor',
    origin: {
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      region: 'Southern California'
    },
    destination: {
      courseId: 'kapalua-plantation',
      courseName: 'Kapalua Plantation Course',
      city: 'Lahaina',
      state: 'HI',
      country: 'USA',
      region: 'Hawaii'
    },
    distance: 2558,
    popularityRank: 4,
    annualVolume: 4200,
    pricing: {
      standard: { base: 149, perLb: 1.20 },
      express: { base: 229, perLb: 1.75 },
      overnight: { base: 349, perLb: 2.50 },
      whiteGlove: { base: 499, perLb: 3.00 }
    },
    transit: {
      standardDays: 5,
      expressDays: 3,
      overnightDays: 2
    },
    seasonality: {
      peak: ['December', 'January', 'February', 'June', 'July', 'August'],
      shoulder: ['March', 'April', 'May', 'September', 'November'],
      offPeak: ['October'],
      priceMultipliers: {
        peak: 1.40,
        shoulder: 1.15,
        offPeak: 1.00
      }
    },
    hubs: ['LAX Air Cargo', 'Honolulu International', 'Kahului Airport'],
    optimization: {
      preferredCarrier: 'FedEx Air',
      alternateRoutes: 1,
      weatherRisk: 'medium',
      customsRequired: false
    },
    performance: {
      onTimeRate: 94.5,
      avgRating: 4.6,
      damageRate: 0.3
    }
  },
  {
    id: 'route-005',
    name: 'Chicago to Wisconsin Golf Resorts',
    origin: {
      city: 'Chicago',
      state: 'IL',
      country: 'USA',
      region: 'Midwest'
    },
    destination: {
      courseId: 'whistling-straits',
      courseName: 'Whistling Straits',
      city: 'Kohler',
      state: 'WI',
      country: 'USA',
      region: 'Wisconsin'
    },
    distance: 140,
    popularityRank: 5,
    annualVolume: 3400,
    pricing: {
      standard: { base: 69, perLb: 0.55 },
      express: { base: 129, perLb: 0.80 },
      overnight: { base: 209, perLb: 1.10 },
      whiteGlove: { base: 329, perLb: 1.60 }
    },
    transit: {
      standardDays: 2,
      expressDays: 1,
      overnightDays: 1
    },
    seasonality: {
      peak: ['May', 'June', 'July', 'August', 'September'],
      shoulder: ['April', 'October'],
      offPeak: ['November', 'December', 'January', 'February', 'March'],
      priceMultipliers: {
        peak: 1.25,
        shoulder: 1.10,
        offPeak: 0.90
      }
    },
    hubs: ['Milwaukee Regional Hub'],
    optimization: {
      preferredCarrier: 'UPS Ground',
      alternateRoutes: 2,
      weatherRisk: 'high',
      customsRequired: false
    },
    performance: {
      onTimeRate: 95.2,
      avgRating: 4.5,
      damageRate: 0.2
    }
  },
  {
    id: 'route-006',
    name: 'Atlanta to Kiawah Island',
    origin: {
      city: 'Atlanta',
      state: 'GA',
      country: 'USA',
      region: 'Southeast'
    },
    destination: {
      courseId: 'kiawah-ocean',
      courseName: 'Kiawah Island Golf Resort - Ocean Course',
      city: 'Kiawah Island',
      state: 'SC',
      country: 'USA',
      region: 'Southeast'
    },
    distance: 285,
    popularityRank: 6,
    annualVolume: 4100,
    pricing: {
      standard: { base: 69, perLb: 0.50 },
      express: { base: 129, perLb: 0.75 },
      overnight: { base: 219, perLb: 1.05 },
      whiteGlove: { base: 349, perLb: 1.55 }
    },
    transit: {
      standardDays: 2,
      expressDays: 1,
      overnightDays: 1
    },
    seasonality: {
      peak: ['March', 'April', 'May', 'September', 'October', 'November'],
      shoulder: ['February', 'June'],
      offPeak: ['December', 'January', 'July', 'August'],
      priceMultipliers: {
        peak: 1.30,
        shoulder: 1.10,
        offPeak: 0.95
      }
    },
    hubs: ['Columbia SC Hub', 'Charleston Distribution'],
    optimization: {
      preferredCarrier: 'FedEx Ground',
      alternateRoutes: 2,
      weatherRisk: 'medium',
      customsRequired: false
    },
    performance: {
      onTimeRate: 97.1,
      avgRating: 4.8,
      damageRate: 0.15
    }
  },
  {
    id: 'route-007',
    name: 'London to St. Andrews',
    origin: {
      city: 'London',
      country: 'United Kingdom',
      region: 'England'
    },
    destination: {
      courseId: 'st-andrews',
      courseName: 'Old Course at St Andrews',
      city: 'St Andrews',
      country: 'Scotland',
      region: 'Scotland'
    },
    distance: 415,
    popularityRank: 7,
    annualVolume: 3800,
    pricing: {
      standard: { base: 199, perLb: 1.50 },
      express: { base: 299, perLb: 2.25 },
      overnight: { base: 499, perLb: 3.50 },
      whiteGlove: { base: 699, perLb: 4.50 }
    },
    transit: {
      standardDays: 3,
      expressDays: 2,
      overnightDays: 1
    },
    seasonality: {
      peak: ['May', 'June', 'July', 'August', 'September'],
      shoulder: ['April', 'October'],
      offPeak: ['November', 'December', 'January', 'February', 'March'],
      priceMultipliers: {
        peak: 1.45,
        shoulder: 1.20,
        offPeak: 1.00
      }
    },
    hubs: ['Heathrow Cargo', 'Edinburgh Airport'],
    optimization: {
      preferredCarrier: 'DHL Express',
      alternateRoutes: 1,
      weatherRisk: 'high',
      customsRequired: false
    },
    performance: {
      onTimeRate: 92.3,
      avgRating: 4.7,
      damageRate: 0.25
    }
  },
  {
    id: 'route-008',
    name: 'Florida to TPC Sawgrass',
    origin: {
      city: 'Miami',
      state: 'FL',
      country: 'USA',
      region: 'South Florida'
    },
    destination: {
      courseId: 'tpc-sawgrass',
      courseName: 'TPC Sawgrass - Stadium Course',
      city: 'Ponte Vedra Beach',
      state: 'FL',
      country: 'USA',
      region: 'Northeast Florida'
    },
    distance: 340,
    popularityRank: 8,
    annualVolume: 6200,
    pricing: {
      standard: { base: 59, perLb: 0.45 },
      express: { base: 109, perLb: 0.65 },
      overnight: { base: 189, perLb: 0.95 },
      whiteGlove: { base: 299, perLb: 1.40 }
    },
    transit: {
      standardDays: 2,
      expressDays: 1,
      overnightDays: 1
    },
    seasonality: {
      peak: ['February', 'March', 'April', 'May'],
      shoulder: ['January', 'June', 'November', 'December'],
      offPeak: ['July', 'August', 'September', 'October'],
      priceMultipliers: {
        peak: 1.35,
        shoulder: 1.10,
        offPeak: 0.90
      }
    },
    hubs: ['Orlando Hub', 'Jacksonville Distribution'],
    optimization: {
      preferredCarrier: 'FedEx Ground',
      alternateRoutes: 2,
      weatherRisk: 'medium',
      customsRequired: false
    },
    performance: {
      onTimeRate: 97.8,
      avgRating: 4.7,
      damageRate: 0.1
    }
  },
  {
    id: 'route-009',
    name: 'Seattle to Bandon Dunes',
    origin: {
      city: 'Seattle',
      state: 'WA',
      country: 'USA',
      region: 'Pacific Northwest'
    },
    destination: {
      courseId: 'bandon-dunes',
      courseName: 'Bandon Dunes Golf Resort',
      city: 'Bandon',
      state: 'OR',
      country: 'USA',
      region: 'Oregon Coast'
    },
    distance: 420,
    popularityRank: 9,
    annualVolume: 3900,
    pricing: {
      standard: { base: 99, perLb: 0.75 },
      express: { base: 169, perLb: 1.10 },
      overnight: { base: 269, perLb: 1.60 },
      whiteGlove: { base: 429, perLb: 2.20 }
    },
    transit: {
      standardDays: 3,
      expressDays: 2,
      overnightDays: 1
    },
    seasonality: {
      peak: ['May', 'June', 'July', 'August', 'September', 'October'],
      shoulder: ['April', 'November'],
      offPeak: ['December', 'January', 'February', 'March'],
      priceMultipliers: {
        peak: 1.30,
        shoulder: 1.12,
        offPeak: 0.95
      }
    },
    hubs: ['Portland Regional Hub', 'Coos Bay Distribution'],
    optimization: {
      preferredCarrier: 'UPS Ground',
      alternateRoutes: 1,
      weatherRisk: 'high',
      customsRequired: false
    },
    performance: {
      onTimeRate: 93.5,
      avgRating: 4.6,
      damageRate: 0.3
    }
  },
  {
    id: 'route-010',
    name: 'Myrtle Beach Golf Circuit',
    origin: {
      city: 'Charlotte',
      state: 'NC',
      country: 'USA',
      region: 'North Carolina'
    },
    destination: {
      courseId: 'caledonia',
      courseName: 'Caledonia Golf & Fish Club',
      city: 'Pawleys Island',
      state: 'SC',
      country: 'USA',
      region: 'Myrtle Beach Area'
    },
    distance: 180,
    popularityRank: 10,
    annualVolume: 4100,
    pricing: {
      standard: { base: 59, perLb: 0.40 },
      express: { base: 99, perLb: 0.60 },
      overnight: { base: 169, perLb: 0.90 },
      whiteGlove: { base: 269, perLb: 1.30 }
    },
    transit: {
      standardDays: 2,
      expressDays: 1,
      overnightDays: 1
    },
    seasonality: {
      peak: ['March', 'April', 'May', 'September', 'October'],
      shoulder: ['February', 'June', 'November'],
      offPeak: ['December', 'January', 'July', 'August'],
      priceMultipliers: {
        peak: 1.25,
        shoulder: 1.08,
        offPeak: 0.92
      }
    },
    hubs: ['Myrtle Beach Distribution'],
    optimization: {
      preferredCarrier: 'Regional Courier',
      alternateRoutes: 2,
      weatherRisk: 'medium',
      customsRequired: false
    },
    performance: {
      onTimeRate: 98.1,
      avgRating: 4.8,
      damageRate: 0.1
    }
  },
  {
    id: 'route-011',
    name: 'Dallas to Las Vegas Golf',
    origin: {
      city: 'Dallas',
      state: 'TX',
      country: 'USA',
      region: 'Texas'
    },
    destination: {
      courseId: 'shadow-creek',
      courseName: 'Shadow Creek',
      city: 'North Las Vegas',
      state: 'NV',
      country: 'USA',
      region: 'Las Vegas'
    },
    distance: 1050,
    popularityRank: 11,
    annualVolume: 1500,
    pricing: {
      standard: { base: 99, perLb: 0.80 },
      express: { base: 169, perLb: 1.15 },
      overnight: { base: 279, perLb: 1.70 },
      whiteGlove: { base: 449, perLb: 2.40 }
    },
    transit: {
      standardDays: 4,
      expressDays: 2,
      overnightDays: 1
    },
    seasonality: {
      peak: ['October', 'November', 'December', 'January', 'February', 'March', 'April'],
      shoulder: ['September', 'May'],
      offPeak: ['June', 'July', 'August'],
      priceMultipliers: {
        peak: 1.30,
        shoulder: 1.10,
        offPeak: 0.85
      }
    },
    hubs: ['Albuquerque Hub', 'Las Vegas Distribution'],
    optimization: {
      preferredCarrier: 'FedEx Ground',
      alternateRoutes: 1,
      weatherRisk: 'low',
      customsRequired: false
    },
    performance: {
      onTimeRate: 95.7,
      avgRating: 4.5,
      damageRate: 0.2
    }
  },
  {
    id: 'route-012',
    name: 'International - USA to Cabo',
    origin: {
      city: 'San Diego',
      state: 'CA',
      country: 'USA',
      region: 'Southern California'
    },
    destination: {
      courseId: 'cabo-del-sol',
      courseName: 'Cabo del Sol Ocean Course',
      city: 'Cabo San Lucas',
      country: 'Mexico',
      region: 'Baja California'
    },
    distance: 1100,
    popularityRank: 12,
    annualVolume: 3600,
    pricing: {
      standard: { base: 129, perLb: 1.00 },
      express: { base: 199, perLb: 1.50 },
      overnight: { base: 299, perLb: 2.20 },
      whiteGlove: { base: 449, perLb: 3.00 }
    },
    transit: {
      standardDays: 4,
      expressDays: 2,
      overnightDays: 1
    },
    seasonality: {
      peak: ['November', 'December', 'January', 'February', 'March', 'April'],
      shoulder: ['October', 'May'],
      offPeak: ['June', 'July', 'August', 'September'],
      priceMultipliers: {
        peak: 1.50,
        shoulder: 1.20,
        offPeak: 1.00
      }
    },
    hubs: ['Tijuana Border', 'Cabo San Lucas Airport'],
    optimization: {
      preferredCarrier: 'DHL Express',
      alternateRoutes: 1,
      weatherRisk: 'low',
      customsRequired: true
    },
    performance: {
      onTimeRate: 91.2,
      avgRating: 4.4,
      damageRate: 0.4
    }
  },
  {
    id: 'route-013',
    name: 'Boston to Florida Golf Coast',
    origin: {
      city: 'Boston',
      state: 'MA',
      country: 'USA',
      region: 'New England'
    },
    destination: {
      courseId: 'streamsong-red',
      courseName: 'Streamsong Resort - Red Course',
      city: 'Bowling Green',
      state: 'FL',
      country: 'USA',
      region: 'Central Florida'
    },
    distance: 1280,
    popularityRank: 13,
    annualVolume: 2700,
    pricing: {
      standard: { base: 79, perLb: 0.65 },
      express: { base: 139, perLb: 0.95 },
      overnight: { base: 229, perLb: 1.40 },
      whiteGlove: { base: 379, perLb: 2.00 }
    },
    transit: {
      standardDays: 4,
      expressDays: 2,
      overnightDays: 1
    },
    seasonality: {
      peak: ['January', 'February', 'March', 'April'],
      shoulder: ['December', 'May'],
      offPeak: ['June', 'July', 'August', 'September', 'October', 'November'],
      priceMultipliers: {
        peak: 1.40,
        shoulder: 1.15,
        offPeak: 0.95
      }
    },
    hubs: ['Richmond Hub', 'Jacksonville Hub', 'Tampa Distribution'],
    optimization: {
      preferredCarrier: 'UPS Ground',
      alternateRoutes: 2,
      weatherRisk: 'medium',
      customsRequired: false
    },
    performance: {
      onTimeRate: 94.8,
      avgRating: 4.6,
      damageRate: 0.25
    }
  },
  {
    id: 'route-014',
    name: 'International - USA to Caribbean',
    origin: {
      city: 'Miami',
      state: 'FL',
      country: 'USA',
      region: 'South Florida'
    },
    destination: {
      courseId: 'casa-de-campo',
      courseName: 'Casa de Campo - Teeth of the Dog',
      city: 'La Romana',
      country: 'Dominican Republic',
      region: 'Caribbean'
    },
    distance: 850,
    popularityRank: 14,
    annualVolume: 2900,
    pricing: {
      standard: { base: 149, perLb: 1.20 },
      express: { base: 229, perLb: 1.80 },
      overnight: { base: 329, perLb: 2.60 },
      whiteGlove: { base: 499, perLb: 3.50 }
    },
    transit: {
      standardDays: 4,
      expressDays: 3,
      overnightDays: 2
    },
    seasonality: {
      peak: ['December', 'January', 'February', 'March'],
      shoulder: ['November', 'April'],
      offPeak: ['May', 'June', 'July', 'August', 'September', 'October'],
      priceMultipliers: {
        peak: 1.55,
        shoulder: 1.25,
        offPeak: 1.05
      }
    },
    hubs: ['Miami International', 'La Romana Airport'],
    optimization: {
      preferredCarrier: 'FedEx International',
      alternateRoutes: 1,
      weatherRisk: 'medium',
      customsRequired: true
    },
    performance: {
      onTimeRate: 89.5,
      avgRating: 4.3,
      damageRate: 0.5
    }
  },
  {
    id: 'route-015',
    name: 'LA to Torrey Pines',
    origin: {
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      region: 'Southern California'
    },
    destination: {
      courseId: 'torrey-pines',
      courseName: 'Torrey Pines Golf Course',
      city: 'La Jolla',
      state: 'CA',
      country: 'USA',
      region: 'San Diego'
    },
    distance: 120,
    popularityRank: 15,
    annualVolume: 2800,
    pricing: {
      standard: { base: 69, perLb: 0.50 },
      express: { base: 119, perLb: 0.70 },
      overnight: { base: 199, perLb: 1.00 },
      whiteGlove: { base: 319, perLb: 1.50 }
    },
    transit: {
      standardDays: 1,
      expressDays: 1,
      overnightDays: 1
    },
    seasonality: {
      peak: ['January', 'February', 'June'],
      shoulder: ['March', 'April', 'May', 'December'],
      offPeak: ['July', 'August', 'September', 'October', 'November'],
      priceMultipliers: {
        peak: 1.30,
        shoulder: 1.10,
        offPeak: 0.95
      }
    },
    hubs: ['San Diego Hub'],
    optimization: {
      preferredCarrier: 'Local Courier',
      alternateRoutes: 2,
      weatherRisk: 'low',
      customsRequired: false
    },
    performance: {
      onTimeRate: 98.9,
      avgRating: 4.9,
      damageRate: 0.05
    }
  }
]

// Utility Functions
export function getRouteById(id: string): ShippingRoute | undefined {
  return SHIPPING_ROUTES.find(route => route.id === id)
}

export function getRoutesByDestination(courseId: string): ShippingRoute[] {
  return SHIPPING_ROUTES.filter(route => route.destination.courseId === courseId)
}

export function getRoutesByOriginCity(city: string): ShippingRoute[] {
  return SHIPPING_ROUTES.filter(route =>
    route.origin.city.toLowerCase() === city.toLowerCase()
  )
}

export function getTopRoutesByVolume(limit: number = 10): ShippingRoute[] {
  return [...SHIPPING_ROUTES]
    .sort((a, b) => b.annualVolume - a.annualVolume)
    .slice(0, limit)
}

export function getRoutesByPopularity(limit: number = 10): ShippingRoute[] {
  return [...SHIPPING_ROUTES]
    .sort((a, b) => a.popularityRank - b.popularityRank)
    .slice(0, limit)
}

export function getInternationalRoutes(): ShippingRoute[] {
  return SHIPPING_ROUTES.filter(route => route.optimization.customsRequired)
}

export function getDomesticRoutes(): ShippingRoute[] {
  return SHIPPING_ROUTES.filter(route => !route.optimization.customsRequired)
}

export function getRoutesByWeatherRisk(risk: 'low' | 'medium' | 'high'): ShippingRoute[] {
  return SHIPPING_ROUTES.filter(route => route.optimization.weatherRisk === risk)
}

export function calculateShippingCost(
  routeId: string,
  serviceLevel: 'standard' | 'express' | 'overnight' | 'whiteGlove',
  weight: number,
  currentMonth: string
): { baseCost: number; weightCost: number; seasonalMultiplier: number; total: number } | null {
  const route = getRouteById(routeId)
  if (!route) return null

  const pricing = route.pricing[serviceLevel]
  const baseCost = pricing.base
  const weightCost = pricing.perLb * weight

  let seasonalMultiplier = 1.0
  if (route.seasonality.peak.includes(currentMonth)) {
    seasonalMultiplier = route.seasonality.priceMultipliers.peak
  } else if (route.seasonality.shoulder.includes(currentMonth)) {
    seasonalMultiplier = route.seasonality.priceMultipliers.shoulder
  } else if (route.seasonality.offPeak.includes(currentMonth)) {
    seasonalMultiplier = route.seasonality.priceMultipliers.offPeak
  }

  const subtotal = baseCost + weightCost
  const total = Math.round(subtotal * seasonalMultiplier)

  return {
    baseCost,
    weightCost,
    seasonalMultiplier,
    total
  }
}

export function getAverageOnTimeRate(): number {
  const total = SHIPPING_ROUTES.reduce((sum, route) => sum + route.performance.onTimeRate, 0)
  return total / SHIPPING_ROUTES.length
}

export function getRoutesByPerformance(minOnTimeRate: number = 95): ShippingRoute[] {
  return SHIPPING_ROUTES.filter(route => route.performance.onTimeRate >= minOnTimeRate)
}

export function searchRoutes(query: string): ShippingRoute[] {
  const lowercaseQuery = query.toLowerCase()
  return SHIPPING_ROUTES.filter(route =>
    route.name.toLowerCase().includes(lowercaseQuery) ||
    route.origin.city.toLowerCase().includes(lowercaseQuery) ||
    route.destination.city.toLowerCase().includes(lowercaseQuery) ||
    route.destination.courseName.toLowerCase().includes(lowercaseQuery)
  )
}

export function getCurrentSeasonType(month: string, routeId: string): 'peak' | 'shoulder' | 'offPeak' | null {
  const route = getRouteById(routeId)
  if (!route) return null

  if (route.seasonality.peak.includes(month)) return 'peak'
  if (route.seasonality.shoulder.includes(month)) return 'shoulder'
  if (route.seasonality.offPeak.includes(month)) return 'offPeak'

  return null
}
