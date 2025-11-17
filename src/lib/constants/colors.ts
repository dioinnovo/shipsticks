// Ship Sticks Brand Colors
export const SHIPSTICKS_PRIMARY = '#5fd063' // Primary Green - main CTAs and headers
export const SHIPSTICKS_PRIMARY_HOVER = '#4fab55' // Darker Green for hover states and active navigation
export const SHIPSTICKS_SECONDARY = '#7FE083' // Light Green - secondary elements
export const SHIPSTICKS_TERTIARY = '#E6F9E7' // Very Light Green - backgrounds

// Legacy Arthur Health Brand Colors (deprecated - use Ship Sticks colors above)
export const ARTHUR_PRIMARY = '#5fd063' // Mapped to Ship Sticks Primary Green
export const ARTHUR_PRIMARY_HOVER = '#4fab55' // Mapped to Ship Sticks Accent Green
export const ARTHUR_SECONDARY = '#7FE083' // Mapped to Ship Sticks Secondary
export const ARTHUR_TERTIARY = '#E6F9E7' // Mapped to Ship Sticks Tertiary

// UI Foundation Colors (Primary Usage)
export const ARTHUR_UI_PRIMARY = '#5fd063' // Primary Green - main buttons, headers
export const ARTHUR_UI_SECONDARY = '#4fab55' // Accent Green - interactive states, active navigation
export const ARTHUR_TEXT_PRIMARY = '#2B2B2B' // Dark Gray Text
export const ARTHUR_TEXT_SECONDARY = '#707070' // Gray Text
export const ARTHUR_BACKGROUND = '#F5F5F5' // Light Gray Background
export const ARTHUR_SURFACE = '#FFFFFF' // White for cards
export const ARTHUR_BORDER = '#E0E0E0' // Light Gray borders

// Gray Scale for UI Foundation
export const ARTHUR_GRAY_900 = '#1A1A1A' // Darkest
export const ARTHUR_GRAY_800 = '#2B2B2B'
export const ARTHUR_GRAY_700 = '#404040'
export const ARTHUR_GRAY_600 = '#525252'
export const ARTHUR_GRAY_500 = '#707070'
export const ARTHUR_GRAY_400 = '#A0A0A0'
export const ARTHUR_GRAY_300 = '#D0D0D0'
export const ARTHUR_GRAY_200 = '#E0E0E0'
export const ARTHUR_GRAY_100 = '#F5F5F5'
export const ARTHUR_GRAY_50 = '#F9FAFB' // Lightest

// Ship Sticks Semantic Colors
export const ARTHUR_SUCCESS = '#5fd063' // Green for successful deliveries
export const ARTHUR_WARNING = '#F59E0B' // Amber for shipping alerts
export const ARTHUR_ERROR = '#DC2626' // Red for delivery issues
export const ARTHUR_INFO = '#5fd063' // Green for information
export const ARTHUR_CARE = '#4fab55' // Accent green for quality service
export const ARTHUR_RISK = '#FF9800' // Orange for priority indicators

// Exported color object for easier access
export const ARTHUR_COLORS = {
  // Brand Colors
  brand: {
    primary: ARTHUR_PRIMARY,
    primaryHover: ARTHUR_PRIMARY_HOVER,
    secondary: ARTHUR_SECONDARY,
    tertiary: ARTHUR_TERTIARY
  },
  // UI Foundation
  ui: {
    primary: ARTHUR_UI_PRIMARY,
    secondary: ARTHUR_UI_SECONDARY,
    textPrimary: ARTHUR_TEXT_PRIMARY,
    textSecondary: ARTHUR_TEXT_SECONDARY,
    background: ARTHUR_BACKGROUND,
    surface: ARTHUR_SURFACE,
    border: ARTHUR_BORDER
  },
  // Gray Scale
  gray: {
    900: ARTHUR_GRAY_900,
    800: ARTHUR_GRAY_800,
    700: ARTHUR_GRAY_700,
    600: ARTHUR_GRAY_600,
    500: ARTHUR_GRAY_500,
    400: ARTHUR_GRAY_400,
    300: ARTHUR_GRAY_300,
    200: ARTHUR_GRAY_200,
    100: ARTHUR_GRAY_100,
    50: ARTHUR_GRAY_50
  },
  // Healthcare Semantic
  semantic: {
    success: ARTHUR_SUCCESS,
    warning: ARTHUR_WARNING,
    error: ARTHUR_ERROR,
    info: ARTHUR_INFO,
    care: ARTHUR_CARE,
    risk: ARTHUR_RISK
  }
}

// Legacy exports for compatibility
export const SCC_BRAND_RED = ARTHUR_PRIMARY
export const SCC_BRAND_RED_HOVER = ARTHUR_PRIMARY_HOVER
export const SCC_UI_PRIMARY = ARTHUR_UI_PRIMARY
export const SCC_SECONDARY = ARTHUR_UI_SECONDARY
export const SCC_TEXT_PRIMARY = ARTHUR_TEXT_PRIMARY
export const SCC_TEXT_SECONDARY = ARTHUR_TEXT_SECONDARY
export const SCC_BACKGROUND = ARTHUR_BACKGROUND
export const SCC_SURFACE = ARTHUR_SURFACE
export const SCC_BORDER = ARTHUR_BORDER
export const SCC_GRAY_900 = ARTHUR_GRAY_900
export const SCC_GRAY_800 = ARTHUR_GRAY_800
export const SCC_GRAY_700 = ARTHUR_GRAY_700
export const SCC_GRAY_600 = ARTHUR_GRAY_600
export const SCC_GRAY_500 = ARTHUR_GRAY_500
export const SCC_GRAY_400 = ARTHUR_GRAY_400
export const SCC_GRAY_300 = ARTHUR_GRAY_300
export const SCC_GRAY_200 = ARTHUR_GRAY_200
export const SCC_GRAY_100 = ARTHUR_GRAY_100
export const SCC_GRAY_50 = ARTHUR_GRAY_50
export const SCC_SUCCESS = ARTHUR_SUCCESS
export const SCC_WARNING = ARTHUR_WARNING
export const SCC_ERROR = ARTHUR_ERROR
export const SCC_INFO = ARTHUR_INFO
export const SCC_COLORS = ARTHUR_COLORS