import { BrandConfig } from '../types/brand'
import { SHIPSTICKS_PRIMARY, SHIPSTICKS_PRIMARY_HOVER, SHIPSTICKS_SECONDARY, ARTHUR_SUCCESS } from './colors'

export const SHIPSTICKS_BRAND: BrandConfig = {
  name: 'Ship Sticks',
  logo: '/shipsticks-logo-blue.png',
  colors: {
    primary: SHIPSTICKS_PRIMARY, // #5fd063 - Primary green for CTAs and key elements
    secondary: SHIPSTICKS_SECONDARY, // #7FE083 - Light green for secondary elements
    accent: SHIPSTICKS_PRIMARY_HOVER, // #4fab55 - Darker green for interactive states (hover, active, navigation)
    success: ARTHUR_SUCCESS // #5fd063 - Green for positive outcomes
  },
  ai: {
    name: 'Sticks',
    persona: 'Sticks is your intelligent Ship Sticks AI assistant specializing in worldwide golf equipment shipping, travel logistics, partner course network, and shipment optimization. Leverages real-time tracking and route optimization to deliver exceptional service for golfers worldwide.'
  }
}

// Legacy Arthur Health brand (deprecated - use SHIPSTICKS_BRAND)
export const ARTHUR_BRAND: BrandConfig = SHIPSTICKS_BRAND

// Legacy compatibility export
export const SCC_BRAND = ARTHUR_BRAND