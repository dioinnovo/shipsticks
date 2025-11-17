/**
 * Mock Shipment Data for Ship Sticks Demo
 * This file contains mock golf equipment shipment data for logistics demonstrations
 */

export interface ShipmentData {
  // Shipment Information
  shipmentNumber: string;
  trackingNumber: string;
  status: string;

  // Customer Information
  customerName: string;
  customerEmail: string;
  customerPhone: string;

  // Origin Information
  originAddress: string;
  originCity: string;
  originState: string;
  originZip: string;

  // Destination Information
  destinationCourse: string;
  destinationAddress: string;
  destinationCity: string;
  destinationState: string;
  destinationZip: string;

  // Shipping Details
  carrier: string;
  serviceLevel: string;
  estimatedDelivery: string;
  actualDelivery?: string;

  // Equipment Details
  equipmentType: string;
  numberOfClubs?: number;
  estimatedValue: number;
  weight: number;

  // Pricing
  basePrice: number;
  insuranceFee: number;
  totalPrice: number;
  discountApplied?: number;

  // Performance Metrics
  deliveredOnTime?: boolean;
  customerRating?: number;
  currentLocation?: string;
}

export const mockShipments: Record<string, ShipmentData> = {
  "ss-2024-10145": {
    shipmentNumber: "SS-2024-10145",
    trackingNumber: "1Z9876543210",
    status: "In Transit",

    customerName: "John Miller",
    customerEmail: "john.miller@email.com",
    customerPhone: "555-234-5678",

    originAddress: "1234 Oak Street",
    originCity: "Dallas",
    originState: "TX",
    originZip: "75201",

    destinationCourse: "Pebble Beach Golf Links",
    destinationAddress: "1700 17-Mile Drive",
    destinationCity: "Pebble Beach",
    destinationState: "CA",
    destinationZip: "93953",

    carrier: "FedEx",
    serviceLevel: "Express",
    estimatedDelivery: "October 18, 2024",

    equipmentType: "Golf Bag",
    numberOfClubs: 14,
    estimatedValue: 2500,
    weight: 32,

    basePrice: 89.99,
    insuranceFee: 15,
    totalPrice: 104.99,
    discountApplied: 0,

    currentLocation: "Memphis, TN Distribution Center"
  },

  "ss-2024-10289": {
    shipmentNumber: "SS-2024-10289",
    trackingNumber: "1Z1234567890",
    status: "Delivered",

    customerName: "Sarah Johnson",
    customerEmail: "sarah.j@email.com",
    customerPhone: "555-876-5432",

    originAddress: "5678 Maple Avenue",
    originCity: "Chicago",
    originState: "IL",
    originZip: "60601",

    destinationCourse: "Augusta National Golf Club",
    destinationAddress: "2604 Washington Road",
    destinationCity: "Augusta",
    destinationState: "GA",
    destinationZip: "30904",

    carrier: "Ship Sticks White Glove",
    serviceLevel: "White Glove",
    estimatedDelivery: "October 12, 2024",
    actualDelivery: "October 12, 2024",

    equipmentType: "Golf Bag with Cart",
    numberOfClubs: 14,
    estimatedValue: 4200,
    weight: 45,

    basePrice: 199.99,
    insuranceFee: 20,
    totalPrice: 219.99,

    deliveredOnTime: true,
    customerRating: 5
  },

  "ss-2024-10421": {
    shipmentNumber: "SS-2024-10421",
    trackingNumber: "1Z5555432100",
    status: "Out for Delivery",

    customerName: "Michael Chen",
    customerEmail: "m.chen@email.com",
    customerPhone: "555-432-1098",

    originAddress: "9012 Pine Road",
    originCity: "Seattle",
    originState: "WA",
    originZip: "98101",

    destinationCourse: "Bandon Dunes Golf Resort",
    destinationAddress: "57744 Round Lake Drive",
    destinationCity: "Bandon",
    originState: "OR",
    destinationZip: "97411",

    carrier: "UPS",
    serviceLevel: "Standard",
    estimatedDelivery: "October 17, 2024",

    equipmentType: "Travel Case",
    numberOfClubs: 12,
    estimatedValue: 1800,
    weight: 28,

    basePrice: 79.99,
    insuranceFee: 10,
    totalPrice: 89.99,

    currentLocation: "Portland, OR"
  },

  "ss-2024-10567": {
    shipmentNumber: "SS-2024-10567",
    trackingNumber: "1Z7777654321",
    status: "Delivered",

    customerName: "Jennifer Williams",
    customerEmail: "jwilliams@email.com",
    customerPhone: "555-789-4321",

    originAddress: "3456 Elm Street",
    originCity: "Miami",
    originState: "FL",
    originZip: "33101",

    destinationCourse: "Kiawah Island Golf Resort",
    destinationAddress: "1 Sanctuary Beach Drive",
    destinationCity: "Kiawah Island",
    destinationState: "SC",
    destinationZip: "29455",

    carrier: "DHL",
    serviceLevel: "Overnight",
    estimatedDelivery: "October 10, 2024",
    actualDelivery: "October 10, 2024",

    equipmentType: "Golf Bag",
    numberOfClubs: 14,
    estimatedValue: 3100,
    weight: 35,

    basePrice: 149.99,
    insuranceFee: 15,
    totalPrice: 164.99,

    deliveredOnTime: true,
    customerRating: 5
  },

  "ss-2024-10892": {
    shipmentNumber: "SS-2024-10892",
    trackingNumber: "1Z9998887776",
    status: "Pending Pickup",

    customerName: "David Martinez",
    customerEmail: "david.m@email.com",
    customerPhone: "555-321-6789",

    originAddress: "7890 Cedar Lane",
    originCity: "Denver",
    originState: "CO",
    originZip: "80201",

    destinationCourse: "TPC Scottsdale",
    destinationAddress: "17020 N Hayden Road",
    destinationCity: "Scottsdale",
    destinationState: "AZ",
    destinationZip: "85255",

    carrier: "FedEx",
    serviceLevel: "Express",
    estimatedDelivery: "October 20, 2024",

    equipmentType: "Push Cart",
    estimatedValue: 450,
    weight: 18,

    basePrice: 69.99,
    insuranceFee: 10,
    totalPrice: 79.99,
    discountApplied: 8.00
  }
}

// Helper function to get shipment by number (case-insensitive)
export function getShipmentData(shipmentNumber: string): ShipmentData | null {
  const normalizedNumber = shipmentNumber.toLowerCase().trim()
  return mockShipments[normalizedNumber] || null
}

// Function to generate comprehensive shipment summary
export function generateShipmentSummary(shipment: ShipmentData): string {
  const deliveryStatus = shipment.deliveredOnTime ? "✅ On-Time" : shipment.actualDelivery ? "⚠️ Delayed" : "🚚 In Progress"

  return `
## Ship Sticks Shipment Summary

### Shipment Information
**Shipment Number:** ${shipment.shipmentNumber}
**Tracking Number:** ${shipment.trackingNumber}
**Status:** ${shipment.status}
**Carrier:** ${shipment.carrier} (${shipment.serviceLevel})

### Customer Information
**Name:** ${shipment.customerName}
**Email:** ${shipment.customerEmail}
**Phone:** ${shipment.customerPhone}

### Route Details
**Origin:** ${shipment.originCity}, ${shipment.originState} ${shipment.originZip}
**Destination:** ${shipment.destinationCourse}
**Location:** ${shipment.destinationCity}, ${shipment.destinationState} ${shipment.destinationZip}
${shipment.currentLocation ? `**Current Location:** ${shipment.currentLocation}` : ''}

### Equipment Details
**Type:** ${shipment.equipmentType}
${shipment.numberOfClubs ? `**Number of Clubs:** ${shipment.numberOfClubs}` : ''}
**Estimated Value:** $${shipment.estimatedValue.toLocaleString()}
**Weight:** ${shipment.weight} lbs

### Pricing Breakdown
**Base Shipping:** $${shipment.basePrice}
**Insurance Fee:** $${shipment.insuranceFee}
${shipment.discountApplied ? `**Discount Applied:** -$${shipment.discountApplied}` : ''}
**Total Price:** $${shipment.totalPrice}

### Delivery Information
**Estimated Delivery:** ${shipment.estimatedDelivery}
${shipment.actualDelivery ? `**Actual Delivery:** ${shipment.actualDelivery}` : ''}
**Status:** ${deliveryStatus}
${shipment.customerRating ? `**Customer Rating:** ${'⭐'.repeat(shipment.customerRating)} (${shipment.customerRating}/5)` : ''}

### Next Steps
${shipment.status === "Delivered" ?
  `✅ Your equipment has been delivered to ${shipment.destinationCourse}. Please check in at the pro shop.` :
  shipment.status === "Out for Delivery" ?
  `📦 Your equipment is out for delivery today. Expected arrival: ${shipment.estimatedDelivery}` :
  shipment.status === "In Transit" ?
  `🚚 Your shipment is on its way. Current location: ${shipment.currentLocation || 'In transit'}` :
  `📋 Pickup scheduled for your equipment. Please ensure it's packaged and ready.`
}

This summary was generated on ${new Date().toLocaleDateString()}.
`
}
