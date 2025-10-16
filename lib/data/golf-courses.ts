export interface GolfCourse {
  id: string
  name: string
  location: string
  city: string
  state?: string
  country: string
  partnerStatus: 'premium' | 'standard' | 'basic' | 'non-partner'
  partnerTier: number // 1-3, 1 being highest
  annualShipments: number
  avgDeliveryDays: number
  priceRange: {
    standard: number
    express: number
    overnight: number
  }
  amenities: string[]
  courseType: 'resort' | 'private' | 'public' | 'semi-private'
  rating: number // out of 5
  latitude: number
  longitude: number
}

export const GOLF_COURSES: GolfCourse[] = [
  // Top-Tier Championship Courses
  {
    id: 'pebble-beach',
    name: 'Pebble Beach Golf Links',
    location: 'Pebble Beach, CA',
    city: 'Pebble Beach',
    state: 'CA',
    country: 'USA',
    partnerStatus: 'premium',
    partnerTier: 1,
    annualShipments: 4500,
    avgDeliveryDays: 2,
    priceRange: { standard: 89, express: 149, overnight: 249 },
    amenities: ['Pro Shop Storage', 'Club Cleaning', 'Same-Day Delivery', 'Concierge Service'],
    courseType: 'resort',
    rating: 5,
    latitude: 36.5674,
    longitude: -121.9500
  },
  {
    id: 'augusta-national',
    name: 'Augusta National Golf Club',
    location: 'Augusta, GA',
    city: 'Augusta',
    state: 'GA',
    country: 'USA',
    partnerStatus: 'premium',
    partnerTier: 1,
    annualShipments: 1200,
    avgDeliveryDays: 2,
    priceRange: { standard: 79, express: 139, overnight: 229 },
    amenities: ['Masters Tournament Delivery', 'VIP Handling', 'Climate Controlled Storage'],
    courseType: 'private',
    rating: 5,
    latitude: 33.5025,
    longitude: -82.0200
  },
  {
    id: 'st-andrews',
    name: 'Old Course at St Andrews',
    location: 'St Andrews, Scotland',
    city: 'St Andrews',
    country: 'Scotland',
    partnerStatus: 'premium',
    partnerTier: 1,
    annualShipments: 3800,
    avgDeliveryDays: 5,
    priceRange: { standard: 199, express: 299, overnight: 499 },
    amenities: ['International Customs Handling', 'Links Storage', 'Heritage Service'],
    courseType: 'public',
    rating: 5,
    latitude: 56.3398,
    longitude: -2.8008
  },
  {
    id: 'pinehurst-no-2',
    name: 'Pinehurst No. 2',
    location: 'Pinehurst, NC',
    city: 'Pinehurst',
    state: 'NC',
    country: 'USA',
    partnerStatus: 'premium',
    partnerTier: 1,
    annualShipments: 5200,
    avgDeliveryDays: 2,
    priceRange: { standard: 79, express: 139, overnight: 229 },
    amenities: ['Resort Delivery', 'Multi-Course Access', 'Tournament Support'],
    courseType: 'resort',
    rating: 5,
    latitude: 35.1881,
    longitude: -79.4689
  },
  {
    id: 'whistling-straits',
    name: 'Whistling Straits',
    location: 'Kohler, WI',
    city: 'Kohler',
    state: 'WI',
    country: 'USA',
    partnerStatus: 'premium',
    partnerTier: 1,
    annualShipments: 3400,
    avgDeliveryDays: 3,
    priceRange: { standard: 89, express: 149, overnight: 249 },
    amenities: ['Lakeside Storage', 'PGA Championship Logistics', 'Weather Protection'],
    courseType: 'resort',
    rating: 5,
    latitude: 43.7611,
    longitude: -87.7347
  },

  // Major Championship Venues
  {
    id: 'kiawah-ocean',
    name: 'Kiawah Island Golf Resort - Ocean Course',
    location: 'Kiawah Island, SC',
    city: 'Kiawah Island',
    state: 'SC',
    country: 'USA',
    partnerStatus: 'premium',
    partnerTier: 1,
    annualShipments: 4100,
    avgDeliveryDays: 2,
    priceRange: { standard: 79, express: 139, overnight: 229 },
    amenities: ['Resort Delivery', 'Beach Climate Control', 'Multi-Course Package'],
    courseType: 'resort',
    rating: 5,
    latitude: 32.6099,
    longitude: -80.0871
  },
  {
    id: 'torrey-pines',
    name: 'Torrey Pines Golf Course',
    location: 'La Jolla, CA',
    city: 'La Jolla',
    state: 'CA',
    country: 'USA',
    partnerStatus: 'standard',
    partnerTier: 2,
    annualShipments: 2800,
    avgDeliveryDays: 2,
    priceRange: { standard: 89, express: 149, overnight: 249 },
    amenities: ['Municipal Pro Shop', 'Ocean View Storage', 'Farmers Insurance Open Support'],
    courseType: 'public',
    rating: 4.8,
    latitude: 32.8937,
    longitude: -117.2517
  },
  {
    id: 'bethpage-black',
    name: 'Bethpage Black Course',
    location: 'Farmingdale, NY',
    city: 'Farmingdale',
    state: 'NY',
    country: 'USA',
    partnerStatus: 'standard',
    partnerTier: 2,
    annualShipments: 3200,
    avgDeliveryDays: 1,
    priceRange: { standard: 69, express: 129, overnight: 219 },
    amenities: ['Public Course Access', 'NYC Metropolitan Area', 'U.S. Open Venue'],
    courseType: 'public',
    rating: 4.7,
    latitude: 40.7445,
    longitude: -73.4527
  },
  {
    id: 'chambers-bay',
    name: 'Chambers Bay',
    location: 'University Place, WA',
    city: 'University Place',
    state: 'WA',
    country: 'USA',
    partnerStatus: 'standard',
    partnerTier: 2,
    annualShipments: 2100,
    avgDeliveryDays: 3,
    priceRange: { standard: 99, express: 169, overnight: 269 },
    amenities: ['Links Style', 'Pacific Northwest Hub', 'Walking Only'],
    courseType: 'public',
    rating: 4.6,
    latitude: 47.2107,
    longitude: -122.5749
  },

  // Premium Resort Destinations
  {
    id: 'bandon-dunes',
    name: 'Bandon Dunes Golf Resort',
    location: 'Bandon, OR',
    city: 'Bandon',
    state: 'OR',
    country: 'USA',
    partnerStatus: 'premium',
    partnerTier: 1,
    annualShipments: 3900,
    avgDeliveryDays: 3,
    priceRange: { standard: 99, express: 169, overnight: 269 },
    amenities: ['Multi-Course Resort', 'Links Golf', 'Remote Location Service', 'Caddie Program'],
    courseType: 'resort',
    rating: 5,
    latitude: 43.1165,
    longitude: -124.4079
  },
  {
    id: 'streamsong-red',
    name: 'Streamsong Resort - Red Course',
    location: 'Bowling Green, FL',
    city: 'Bowling Green',
    state: 'FL',
    country: 'USA',
    partnerStatus: 'premium',
    partnerTier: 1,
    annualShipments: 2700,
    avgDeliveryDays: 2,
    priceRange: { standard: 79, express: 139, overnight: 229 },
    amenities: ['Isolated Resort', 'Three Championship Courses', 'Climate Control'],
    courseType: 'resort',
    rating: 4.9,
    latitude: 27.5433,
    longitude: -81.7542
  },
  {
    id: 'kapalua-plantation',
    name: 'Kapalua Plantation Course',
    location: 'Lahaina, HI',
    city: 'Lahaina',
    state: 'HI',
    country: 'USA',
    partnerStatus: 'premium',
    partnerTier: 1,
    annualShipments: 4200,
    avgDeliveryDays: 4,
    priceRange: { standard: 149, express: 229, overnight: 349 },
    amenities: ['Hawaii Service', 'PGA Tour Venue', 'Resort Concierge', 'Island Delivery'],
    courseType: 'resort',
    rating: 4.9,
    latitude: 20.9994,
    longitude: -156.6605
  },
  {
    id: 'wailea-gold',
    name: 'Wailea Golf Club - Gold Course',
    location: 'Wailea, HI',
    city: 'Wailea',
    state: 'HI',
    country: 'USA',
    partnerStatus: 'standard',
    partnerTier: 2,
    annualShipments: 3100,
    avgDeliveryDays: 4,
    priceRange: { standard: 149, express: 229, overnight: 349 },
    amenities: ['Maui Destination', 'Multi-Resort Access', 'Ocean Views'],
    courseType: 'resort',
    rating: 4.7,
    latitude: 20.6894,
    longitude: -156.4431
  },

  // International Destinations
  {
    id: 'royal-county-down',
    name: 'Royal County Down',
    location: 'Newcastle, Northern Ireland',
    city: 'Newcastle',
    country: 'Northern Ireland',
    partnerStatus: 'premium',
    partnerTier: 1,
    annualShipments: 1800,
    avgDeliveryDays: 6,
    priceRange: { standard: 229, express: 329, overnight: 529 },
    amenities: ['UK Customs Expertise', 'Links Golf', 'Heritage Course'],
    courseType: 'private',
    rating: 5,
    latitude: 54.2297,
    longitude: -5.8867
  },
  {
    id: 'royal-melbourne',
    name: 'Royal Melbourne Golf Club',
    location: 'Black Rock, Victoria',
    city: 'Black Rock',
    country: 'Australia',
    partnerStatus: 'premium',
    partnerTier: 1,
    annualShipments: 900,
    avgDeliveryDays: 8,
    priceRange: { standard: 349, express: 499, overnight: 699 },
    amenities: ['Australia Service', 'Sandbelt Golf', 'International Customs'],
    courseType: 'private',
    rating: 5,
    latitude: -37.9833,
    longitude: 145.0167
  },
  {
    id: 'cabo-del-sol',
    name: 'Cabo del Sol Ocean Course',
    location: 'Cabo San Lucas, Mexico',
    city: 'Cabo San Lucas',
    country: 'Mexico',
    partnerStatus: 'standard',
    partnerTier: 2,
    annualShipments: 3600,
    avgDeliveryDays: 3,
    priceRange: { standard: 129, express: 199, overnight: 299 },
    amenities: ['Mexico Service', 'Resort Delivery', 'Beach Climate Control'],
    courseType: 'resort',
    rating: 4.6,
    latitude: 22.8905,
    longitude: -109.9167
  },
  {
    id: 'carnoustie',
    name: 'Carnoustie Golf Links',
    location: 'Carnoustie, Scotland',
    city: 'Carnoustie',
    country: 'Scotland',
    partnerStatus: 'premium',
    partnerTier: 1,
    annualShipments: 2400,
    avgDeliveryDays: 5,
    priceRange: { standard: 199, express: 299, overnight: 499 },
    amenities: ['Open Championship Venue', 'Links Golf', 'Scottish Heritage'],
    courseType: 'public',
    rating: 4.9,
    latitude: 56.5000,
    longitude: -2.7167
  },

  // Scottsdale/Arizona Golf Corridor
  {
    id: 'tpc-scottsdale',
    name: 'TPC Scottsdale - Stadium Course',
    location: 'Scottsdale, AZ',
    city: 'Scottsdale',
    state: 'AZ',
    country: 'USA',
    partnerStatus: 'premium',
    partnerTier: 1,
    annualShipments: 5800,
    avgDeliveryDays: 2,
    priceRange: { standard: 79, express: 139, overnight: 229 },
    amenities: ['Phoenix Open Venue', '16th Hole Experience', 'Desert Golf Hub'],
    courseType: 'resort',
    rating: 4.8,
    latitude: 33.6056,
    longitude: -111.9181
  },
  {
    id: 'troon-north',
    name: 'Troon North Golf Club',
    location: 'Scottsdale, AZ',
    city: 'Scottsdale',
    state: 'AZ',
    country: 'USA',
    partnerStatus: 'standard',
    partnerTier: 2,
    annualShipments: 2900,
    avgDeliveryDays: 2,
    priceRange: { standard: 79, express: 139, overnight: 229 },
    amenities: ['Desert Golf', 'Pinnacle/Monument Courses', 'High-End Private'],
    courseType: 'semi-private',
    rating: 4.7,
    latitude: 33.6842,
    longitude: -111.8764
  },
  {
    id: 'grayhawk',
    name: 'Grayhawk Golf Club',
    location: 'Scottsdale, AZ',
    city: 'Scottsdale',
    state: 'AZ',
    country: 'USA',
    partnerStatus: 'standard',
    partnerTier: 2,
    annualShipments: 3300,
    avgDeliveryDays: 2,
    priceRange: { standard: 69, express: 129, overnight: 219 },
    amenities: ['Talon/Raptor Courses', 'Public Access', 'Arizona Hub'],
    courseType: 'public',
    rating: 4.5,
    latitude: 33.6689,
    longitude: -111.9028
  },

  // Myrtle Beach Golf Corridor
  {
    id: 'caledonia',
    name: 'Caledonia Golf & Fish Club',
    location: 'Pawleys Island, SC',
    city: 'Pawleys Island',
    state: 'SC',
    country: 'USA',
    partnerStatus: 'standard',
    partnerTier: 2,
    annualShipments: 4100,
    avgDeliveryDays: 2,
    priceRange: { standard: 59, express: 109, overnight: 189 },
    amenities: ['Myrtle Beach Hub', 'Buddy Package Deals', 'Group Golf'],
    courseType: 'public',
    rating: 4.8,
    latitude: 33.4304,
    longitude: -79.1289
  },
  {
    id: 'tpc-myrtle-beach',
    name: 'TPC Myrtle Beach',
    location: 'Murrells Inlet, SC',
    city: 'Murrells Inlet',
    state: 'SC',
    country: 'USA',
    partnerStatus: 'standard',
    partnerTier: 2,
    annualShipments: 3700,
    avgDeliveryDays: 2,
    priceRange: { standard: 59, express: 109, overnight: 189 },
    amenities: ['TPC Network', 'High Volume Destination', 'Multi-Course Packages'],
    courseType: 'public',
    rating: 4.6,
    latitude: 33.5504,
    longitude: -79.0431
  },

  // Florida Golf Destinations
  {
    id: 'seminole',
    name: 'Seminole Golf Club',
    location: 'Juno Beach, FL',
    city: 'Juno Beach',
    state: 'FL',
    country: 'USA',
    partnerStatus: 'premium',
    partnerTier: 1,
    annualShipments: 800,
    avgDeliveryDays: 2,
    priceRange: { standard: 89, express: 149, overnight: 249 },
    amenities: ['Exclusive Private', 'Historic Course', 'VIP Service'],
    courseType: 'private',
    rating: 5,
    latitude: 26.8894,
    longitude: -80.0531
  },
  {
    id: 'tpc-sawgrass',
    name: 'TPC Sawgrass - Stadium Course',
    location: 'Ponte Vedra Beach, FL',
    city: 'Ponte Vedra Beach',
    state: 'FL',
    country: 'USA',
    partnerStatus: 'premium',
    partnerTier: 1,
    annualShipments: 6200,
    avgDeliveryDays: 2,
    priceRange: { standard: 79, express: 139, overnight: 229 },
    amenities: ['17th Island Green', 'Players Championship', 'World Golf Village'],
    courseType: 'resort',
    rating: 4.9,
    latitude: 30.1978,
    longitude: -81.3953
  },
  {
    id: 'doral-blue-monster',
    name: 'Trump National Doral - Blue Monster',
    location: 'Doral, FL',
    city: 'Doral',
    state: 'FL',
    country: 'USA',
    partnerStatus: 'standard',
    partnerTier: 2,
    annualShipments: 2500,
    avgDeliveryDays: 2,
    priceRange: { standard: 79, express: 139, overnight: 229 },
    amenities: ['Miami Hub', 'Resort Complex', 'International Access'],
    courseType: 'resort',
    rating: 4.5,
    latitude: 25.8123,
    longitude: -80.3378
  },

  // California Coastal Golf
  {
    id: 'cypress-point',
    name: 'Cypress Point Club',
    location: 'Pebble Beach, CA',
    city: 'Pebble Beach',
    state: 'CA',
    country: 'USA',
    partnerStatus: 'premium',
    partnerTier: 1,
    annualShipments: 600,
    avgDeliveryDays: 2,
    priceRange: { standard: 99, express: 169, overnight: 279 },
    amenities: ['Ultra-Exclusive', 'Monterey Peninsula', 'Historic Course'],
    courseType: 'private',
    rating: 5,
    latitude: 36.5833,
    longitude: -121.9667
  },
  {
    id: 'spyglass-hill',
    name: 'Spyglass Hill Golf Course',
    location: 'Pebble Beach, CA',
    city: 'Pebble Beach',
    state: 'CA',
    country: 'USA',
    partnerStatus: 'premium',
    partnerTier: 1,
    annualShipments: 3800,
    avgDeliveryDays: 2,
    priceRange: { standard: 89, express: 149, overnight: 249 },
    amenities: ['Pebble Beach Resorts', 'Monterey Peninsula', 'AT&T Pro-Am'],
    courseType: 'resort',
    rating: 4.8,
    latitude: 36.5833,
    longitude: -121.9500
  },
  {
    id: 'riviera',
    name: 'Riviera Country Club',
    location: 'Pacific Palisades, CA',
    city: 'Pacific Palisades',
    state: 'CA',
    country: 'USA',
    partnerStatus: 'standard',
    partnerTier: 2,
    annualShipments: 1200,
    avgDeliveryDays: 1,
    priceRange: { standard: 89, express: 149, overnight: 249 },
    amenities: ['LA Hub', 'Genesis Invitational', 'Private Club'],
    courseType: 'private',
    rating: 4.9,
    latitude: 34.0456,
    longitude: -118.5244
  },

  // Additional Championship Courses
  {
    id: 'oakmont',
    name: 'Oakmont Country Club',
    location: 'Oakmont, PA',
    city: 'Oakmont',
    state: 'PA',
    country: 'USA',
    partnerStatus: 'premium',
    partnerTier: 1,
    annualShipments: 950,
    avgDeliveryDays: 2,
    priceRange: { standard: 79, express: 139, overnight: 229 },
    amenities: ['U.S. Open Venue', 'Church Pews Bunker', 'Private Club'],
    courseType: 'private',
    rating: 5,
    latitude: 40.5214,
    longitude: -79.8431
  },
  {
    id: 'shinnecock-hills',
    name: 'Shinnecock Hills Golf Club',
    location: 'Southampton, NY',
    city: 'Southampton',
    state: 'NY',
    country: 'USA',
    partnerStatus: 'premium',
    partnerTier: 1,
    annualShipments: 850,
    avgDeliveryDays: 1,
    priceRange: { standard: 89, express: 149, overnight: 249 },
    amenities: ['Hamptons Service', 'U.S. Open Venue', 'Links Style'],
    courseType: 'private',
    rating: 5,
    latitude: 40.8928,
    longitude: -72.4531
  },
  {
    id: 'winged-foot',
    name: 'Winged Foot Golf Club - West Course',
    location: 'Mamaroneck, NY',
    city: 'Mamaroneck',
    state: 'NY',
    country: 'USA',
    partnerStatus: 'standard',
    partnerTier: 2,
    annualShipments: 1100,
    avgDeliveryDays: 1,
    priceRange: { standard: 89, express: 149, overnight: 249 },
    amenities: ['NYC Metro', 'Major Championship Venue', 'A.W. Tillinghast Design'],
    courseType: 'private',
    rating: 4.9,
    latitude: 40.9486,
    longitude: -73.7444
  },
  {
    id: 'merion',
    name: 'Merion Golf Club - East Course',
    location: 'Ardmore, PA',
    city: 'Ardmore',
    state: 'PA',
    country: 'USA',
    partnerStatus: 'premium',
    partnerTier: 1,
    annualShipments: 800,
    avgDeliveryDays: 2,
    priceRange: { standard: 79, express: 139, overnight: 229 },
    amenities: ['Philadelphia Hub', 'Wicker Baskets', 'Historic Venue'],
    courseType: 'private',
    rating: 5,
    latitude: 40.0053,
    longitude: -75.2906
  },

  // Las Vegas Golf
  {
    id: 'shadow-creek',
    name: 'Shadow Creek',
    location: 'North Las Vegas, NV',
    city: 'North Las Vegas',
    state: 'NV',
    country: 'USA',
    partnerStatus: 'premium',
    partnerTier: 1,
    annualShipments: 1500,
    avgDeliveryDays: 2,
    priceRange: { standard: 99, express: 169, overnight: 279 },
    amenities: ['Ultra-Luxury', 'MGM Resorts', 'Desert Oasis'],
    courseType: 'resort',
    rating: 4.9,
    latitude: 36.2867,
    longitude: -115.1108
  },
  {
    id: 'cascata',
    name: 'Cascata Golf Club',
    location: 'Boulder City, NV',
    city: 'Boulder City',
    state: 'NV',
    country: 'USA',
    partnerStatus: 'standard',
    partnerTier: 2,
    annualShipments: 1200,
    avgDeliveryDays: 2,
    priceRange: { standard: 99, express: 169, overnight: 279 },
    amenities: ['Las Vegas Luxury', 'Dramatic Desert', 'High-End Service'],
    courseType: 'private',
    rating: 4.7,
    latitude: 35.9886,
    longitude: -114.8847
  },

  // Additional International Destinations
  {
    id: 'royal-portrush',
    name: 'Royal Portrush Golf Club',
    location: 'Portrush, Northern Ireland',
    city: 'Portrush',
    country: 'Northern Ireland',
    partnerStatus: 'premium',
    partnerTier: 1,
    annualShipments: 1600,
    avgDeliveryDays: 6,
    priceRange: { standard: 229, express: 329, overnight: 529 },
    amenities: ['Open Championship', 'Dunluce Links', 'Irish Sea Views'],
    courseType: 'private',
    rating: 5,
    latitude: 55.2044,
    longitude: -6.6547
  },
  {
    id: 'valderrama',
    name: 'Valderrama Golf Club',
    location: 'Sotogrande, Spain',
    city: 'Sotogrande',
    country: 'Spain',
    partnerStatus: 'standard',
    partnerTier: 2,
    annualShipments: 1800,
    avgDeliveryDays: 7,
    priceRange: { standard: 249, express: 349, overnight: 549 },
    amenities: ['European Service', 'Ryder Cup Venue', 'Mediterranean Climate'],
    courseType: 'private',
    rating: 4.8,
    latitude: 36.2964,
    longitude: -5.3164
  },
  {
    id: 'casa-de-campo',
    name: 'Casa de Campo - Teeth of the Dog',
    location: 'La Romana, Dominican Republic',
    city: 'La Romana',
    country: 'Dominican Republic',
    partnerStatus: 'standard',
    partnerTier: 2,
    annualShipments: 2900,
    avgDeliveryDays: 3,
    priceRange: { standard: 149, express: 229, overnight: 329 },
    amenities: ['Caribbean Service', 'Beach Golf', 'Resort Complex'],
    courseType: 'resort',
    rating: 4.7,
    latitude: 18.4239,
    longitude: -68.9297
  },

  // Pacific Northwest
  {
    id: 'pumpkin-ridge',
    name: 'Pumpkin Ridge Golf Club',
    location: 'North Plains, OR',
    city: 'North Plains',
    state: 'OR',
    country: 'USA',
    partnerStatus: 'standard',
    partnerTier: 2,
    annualShipments: 1600,
    avgDeliveryDays: 3,
    priceRange: { standard: 79, express: 139, overnight: 229 },
    amenities: ['Portland Hub', 'Major Championship Venue', 'Ghost Creek/Witch Hollow'],
    courseType: 'semi-private',
    rating: 4.6,
    latitude: 45.6511,
    longitude: -122.9972
  },
  {
    id: 'sahalee',
    name: 'Sahalee Country Club',
    location: 'Sammamish, WA',
    city: 'Sammamish',
    state: 'WA',
    country: 'USA',
    partnerStatus: 'standard',
    partnerTier: 2,
    annualShipments: 1400,
    avgDeliveryDays: 3,
    priceRange: { standard: 79, express: 139, overnight: 229 },
    amenities: ['Seattle Hub', 'PGA Championship Venue', 'Forest Golf'],
    courseType: 'private',
    rating: 4.7,
    latitude: 47.6167,
    longitude: -122.0500
  }
]

// Utility functions for course data
export function getCourseById(id: string): GolfCourse | undefined {
  return GOLF_COURSES.find(course => course.id === id)
}

export function getCoursesByLocation(country: string, state?: string): GolfCourse[] {
  return GOLF_COURSES.filter(course => {
    if (state) {
      return course.country === country && course.state === state
    }
    return course.country === country
  })
}

export function getCoursesByPartnerTier(tier: 1 | 2 | 3): GolfCourse[] {
  return GOLF_COURSES.filter(course => course.partnerTier === tier)
}

export function getPremiumPartners(): GolfCourse[] {
  return GOLF_COURSES.filter(course => course.partnerStatus === 'premium')
}

export function getTopDestinationsByVolume(limit: number = 10): GolfCourse[] {
  return [...GOLF_COURSES]
    .sort((a, b) => b.annualShipments - a.annualShipments)
    .slice(0, limit)
}

export function getCoursesByType(type: GolfCourse['courseType']): GolfCourse[] {
  return GOLF_COURSES.filter(course => course.courseType === type)
}

export function searchCourses(query: string): GolfCourse[] {
  const lowercaseQuery = query.toLowerCase()
  return GOLF_COURSES.filter(course =>
    course.name.toLowerCase().includes(lowercaseQuery) ||
    course.city.toLowerCase().includes(lowercaseQuery) ||
    course.location.toLowerCase().includes(lowercaseQuery)
  )
}

export function getCoursesInRadius(
  centerLat: number,
  centerLon: number,
  radiusMiles: number
): GolfCourse[] {
  const EARTH_RADIUS_MILES = 3959

  return GOLF_COURSES.filter(course => {
    const dLat = (course.latitude - centerLat) * Math.PI / 180
    const dLon = (course.longitude - centerLon) * Math.PI / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(centerLat * Math.PI / 180) *
      Math.cos(course.latitude * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = EARTH_RADIUS_MILES * c

    return distance <= radiusMiles
  })
}
