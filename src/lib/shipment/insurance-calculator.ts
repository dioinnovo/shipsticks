import { EquipmentAnalysisResult } from '@/lib/ai/mock-equipment-vision'

export interface InsuranceTier {
  id: string
  name: string
  coverage: number
  cost: number
  recommended: boolean
  features: string[]
  description: string
}

export interface InsuranceRecommendation {
  recommendedTier: InsuranceTier
  allTiers: InsuranceTier[]
  equipmentValue: number
  savingsVsReplacement: number
  riskAnalysis: string
}

/**
 * Insurance Calculator for Ship Sticks Golf Equipment Shipments
 *
 * Calculates recommended insurance coverage based on equipment value
 * detected through computer vision analysis.
 */
export class InsuranceCalculator {
  /**
   * Calculate insurance recommendation based on equipment analysis
   */
  static calculateInsurance(equipmentAnalysis: EquipmentAnalysisResult): InsuranceRecommendation {
    const equipmentValue = equipmentAnalysis.totalValue.estimated
    const allTiers = this.generateInsuranceTiers(equipmentValue)
    const recommendedTier = this.getRecommendedTier(allTiers, equipmentValue)
    const savingsVsReplacement = equipmentValue - recommendedTier.cost
    const riskAnalysis = this.generateRiskAnalysis(equipmentValue, equipmentAnalysis.brandTier)

    return {
      recommendedTier,
      allTiers,
      equipmentValue,
      savingsVsReplacement,
      riskAnalysis
    }
  }

  /**
   * Generate insurance tiers based on equipment value
   */
  private static generateInsuranceTiers(equipmentValue: number): InsuranceTier[] {
    // Define tier thresholds as percentages of equipment value
    const basicCoverage = Math.round(equipmentValue * 0.25)
    const standardCoverage = Math.round(equipmentValue * 0.50)
    const premiumCoverage = equipmentValue
    const eliteCoverage = Math.round(equipmentValue * 1.25) // Includes extras

    return [
      {
        id: 'basic',
        name: 'Basic Coverage',
        coverage: basicCoverage,
        cost: this.calculateInsuranceCost(basicCoverage),
        recommended: equipmentValue < 1000,
        features: [
          'Loss coverage',
          'Standard handling',
          '5-7 day claims processing'
        ],
        description: 'Minimal protection for budget equipment'
      },
      {
        id: 'standard',
        name: 'Standard Coverage',
        coverage: standardCoverage,
        cost: this.calculateInsuranceCost(standardCoverage),
        recommended: equipmentValue >= 1000 && equipmentValue < 3000,
        features: [
          'Loss & damage coverage',
          'Priority handling',
          '3-5 day claims processing',
          'Temperature-controlled transport'
        ],
        description: 'Recommended for mid-range equipment'
      },
      {
        id: 'premium',
        name: 'Premium Coverage',
        coverage: premiumCoverage,
        cost: this.calculateInsuranceCost(premiumCoverage),
        recommended: equipmentValue >= 3000 && equipmentValue < 5000,
        features: [
          'Full replacement value',
          'White-glove handling',
          '24-48 hour claims processing',
          'Climate-controlled transport',
          'GPS tracking',
          'Photo documentation'
        ],
        description: 'Full protection for tournament-grade equipment'
      },
      {
        id: 'elite',
        name: 'Elite Coverage',
        coverage: eliteCoverage,
        cost: this.calculateInsuranceCost(eliteCoverage),
        recommended: equipmentValue >= 5000,
        features: [
          'Full replacement value + 25%',
          'Concierge white-glove service',
          'Instant claims processing',
          'Dedicated climate-controlled transport',
          'Real-time GPS tracking',
          'Professional photo/video documentation',
          'Custom crating available',
          'Direct-to-pro-shop delivery',
          'Club cleaning & inspection included'
        ],
        description: 'Ultimate protection for professional & custom equipment'
      }
    ]
  }

  /**
   * Calculate insurance cost based on coverage amount
   * Formula: Base rate of 1% of coverage + flat fee
   */
  private static calculateInsuranceCost(coverageAmount: number): number {
    const baseRate = 0.01 // 1% of coverage
    const flatFee = 10 // $10 base fee
    const cost = Math.round((coverageAmount * baseRate) + flatFee)

    // Apply minimum cost
    return Math.max(cost, 15)
  }

  /**
   * Get the recommended tier based on equipment value
   */
  private static getRecommendedTier(tiers: InsuranceTier[], equipmentValue: number): InsuranceTier {
    const recommendedTier = tiers.find(tier => tier.recommended)
    return recommendedTier || tiers[1] // Default to Standard if no recommendation
  }

  /**
   * Generate risk analysis based on equipment value and brand tier
   */
  private static generateRiskAnalysis(equipmentValue: number, brandTier: string): string {
    if (equipmentValue >= 5000) {
      return `Your ${brandTier} equipment valued at $${equipmentValue.toLocaleString()} represents a significant investment. Elite coverage ensures complete protection and peace of mind during transit.`
    } else if (equipmentValue >= 3000) {
      return `Premium equipment worth $${equipmentValue.toLocaleString()} deserves premium protection. Full replacement coverage protects your investment if the unexpected happens.`
    } else if (equipmentValue >= 1000) {
      return `Your equipment is valued at $${equipmentValue.toLocaleString()}. Standard coverage provides solid protection at an affordable price.`
    } else {
      return `Basic coverage provides essential protection for equipment valued at $${equipmentValue.toLocaleString()}.`
    }
  }

  /**
   * Format insurance recommendation for display
   */
  static formatRecommendation(recommendation: InsuranceRecommendation): string {
    const tier = recommendation.recommendedTier
    return `${tier.name}: $${tier.coverage.toLocaleString()} coverage for just $${tier.cost}`
  }

  /**
   * Calculate potential savings by choosing insurance
   */
  static calculateSavings(recommendation: InsuranceRecommendation): {
    protectionCost: number
    replacementCost: number
    savings: number
    roi: number
  } {
    const protectionCost = recommendation.recommendedTier.cost
    const replacementCost = recommendation.equipmentValue
    const savings = replacementCost - protectionCost
    const roi = Math.round((savings / protectionCost) * 100)

    return {
      protectionCost,
      replacementCost,
      savings,
      roi
    }
  }

  /**
   * Get insurance tier by ID
   */
  static getTierById(tiers: InsuranceTier[], tierId: string): InsuranceTier | undefined {
    return tiers.find(tier => tier.id === tierId)
  }

  /**
   * Check if upgrade is recommended based on equipment type
   */
  static shouldRecommendUpgrade(equipmentValue: number, hasCustomClubs: boolean): boolean {
    // Always recommend premium or higher for custom/fitted clubs
    if (hasCustomClubs && equipmentValue >= 2000) {
      return true
    }

    // Recommend premium for high-value equipment
    if (equipmentValue >= 4000) {
      return true
    }

    return false
  }

  /**
   * Generate warning message if under-insured
   */
  static generateUnderInsuredWarning(selectedCoverage: number, equipmentValue: number): string | null {
    const coverageRatio = selectedCoverage / equipmentValue

    if (coverageRatio < 0.5) {
      const gap = equipmentValue - selectedCoverage
      return `⚠️ Warning: You're under-insured by $${gap.toLocaleString()}. If your equipment is lost or damaged, you'll only receive $${selectedCoverage.toLocaleString()} instead of the full $${equipmentValue.toLocaleString()} replacement cost.`
    }

    if (coverageRatio < 0.75) {
      return `Consider upgrading your coverage to better protect your investment. Current coverage is only ${Math.round(coverageRatio * 100)}% of equipment value.`
    }

    return null
  }
}
