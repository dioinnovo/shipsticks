import { MapPin, Calendar, Package, Mic } from 'lucide-react'

export interface ShipmentStep {
  id: string
  name: string
  category: string
  icon: any
  description: string
  status?: 'not_started' | 'in_progress' | 'completed' | 'skipped'
  photoCount?: number
  notesCount?: number
  completionPercentage?: number
  previewImage?: string
}

/**
 * Ship Sticks Multi-Step Shipment Form Categories
 *
 * These define the 4 steps in the shipment creation process:
 * 1. Origin/Destination - Where the shipment is coming from and going to
 * 2. Dates & Scheduling - When to pick up and deliver
 * 3. Equipment Documentation - Photos of golf equipment with AI analysis
 * 4. Special Instructions - Voice notes for handling instructions
 */
export const SHIPMENT_STEPS: ShipmentStep[] = [
  {
    id: 'shipment-addresses',
    name: 'Origin & Destination',
    category: 'Shipment Details',
    icon: MapPin,
    description: 'Enter pickup and delivery addresses',
    status: 'not_started',
    completionPercentage: 0
  },
  {
    id: 'shipment-dates',
    name: 'Dates & Scheduling',
    category: 'Shipment Details',
    icon: Calendar,
    description: 'Select pickup and delivery dates',
    status: 'not_started',
    completionPercentage: 0
  },
  {
    id: 'equipment-documentation',
    name: 'Equipment Photos',
    category: 'Documentation',
    icon: Package,
    description: 'Upload photos of golf equipment for AI analysis',
    status: 'not_started',
    photoCount: 0,
    completionPercentage: 0
  },
  {
    id: 'special-instructions',
    name: 'Special Instructions',
    category: 'Documentation',
    icon: Mic,
    description: 'Record voice notes for special handling (optional)',
    status: 'not_started',
    notesCount: 0,
    completionPercentage: 0
  }
]

/**
 * Equipment photo categories for categorizing uploaded photos
 */
export const EQUIPMENT_PHOTO_CATEGORIES = [
  'Full Bag Overview',
  'Driver & Woods',
  'Irons Set',
  'Wedges',
  'Putter',
  'Bag & Accessories',
  'Damage Documentation'
]

/**
 * Common golf equipment types for AI identification
 */
export const GOLF_EQUIPMENT_TYPES = [
  'Driver',
  '3-Wood',
  '5-Wood',
  '3-Hybrid',
  '4-Hybrid',
  '5-Hybrid',
  '3-Iron',
  '4-Iron',
  '5-Iron',
  '6-Iron',
  '7-Iron',
  '8-Iron',
  '9-Iron',
  'Pitching Wedge',
  'Gap Wedge',
  'Sand Wedge',
  'Lob Wedge',
  'Putter',
  'Golf Bag',
  'Push Cart',
  'Range Finder',
  'GPS Watch'
]

/**
 * Common golf equipment brands for value estimation
 */
export const GOLF_EQUIPMENT_BRANDS = {
  premium: ['Titleist', 'TaylorMade', 'Callaway', 'Ping', 'Mizuno', 'Scotty Cameron'],
  standard: ['Cleveland', 'Cobra', 'Wilson', 'Srixon', 'Adams'],
  budget: ['Top Flite', 'Dunlop', 'RAM', 'Spalding']
}
