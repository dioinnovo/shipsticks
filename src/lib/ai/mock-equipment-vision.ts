import { GOLF_EQUIPMENT_TYPES, GOLF_EQUIPMENT_BRANDS } from '@/lib/constants/shipment-categories'

export interface EquipmentAnalysisResult {
  success: boolean
  equipmentDetected: DetectedEquipment[]
  totalValue: {
    min: number
    max: number
    estimated: number
  }
  brandIdentified: string | null
  brandTier: 'premium' | 'standard' | 'budget' | 'unknown'
  confidence: number
  processingTime: number
}

export interface DetectedEquipment {
  type: string
  brand?: string
  condition: 'new' | 'excellent' | 'good' | 'fair'
  estimatedValue: {
    min: number
    max: number
  }
  confidence: number
}

/**
 * Mock Computer Vision Service for Golf Equipment Analysis
 *
 * Simulates analyzing uploaded photos to identify golf club types,
 * brands, condition, and estimated values for insurance calculation.
 */
export class MockEquipmentVisionService {
  /**
   * Analyze golf equipment photo and return mock identification results
   */
  static async analyzeEquipment(
    imageFile: File,
    photoCategory?: string,
    photoCount: number = 1
  ): Promise<EquipmentAnalysisResult> {
    const startTime = Date.now()

    // Simulate processing delay (1.5-2.5 seconds for realism)
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))

    // Generate mock results based on photo category and count
    const mockResults = this.generateMockResults(photoCategory, photoCount)
    const processingTime = Date.now() - startTime

    return {
      ...mockResults,
      processingTime
    }
  }

  /**
   * Generate mock equipment detection results
   */
  private static generateMockResults(photoCategory?: string, photoCount: number = 1): Omit<EquipmentAnalysisResult, 'processingTime'> {
    const results: Omit<EquipmentAnalysisResult, 'processingTime'> = {
      success: true,
      equipmentDetected: [],
      totalValue: { min: 0, max: 0, estimated: 0 },
      brandIdentified: null,
      brandTier: 'unknown',
      confidence: 0
    }

    // For individual photos (1-2 photos), show simplified detection (3 clubs)
    // For full bag photos or multiple photos, show full detection
    const isIndividualPhoto = photoCount <= 2

    // Mock detection based on photo category
    switch (photoCategory) {
      case 'Full Bag Overview':
        results.equipmentDetected = isIndividualPhoto
          ? this.mockIndividualIronsDetection()
          : this.mockFullSetDetection()
        results.brandIdentified = isIndividualPhoto ? 'Titleist T350 & T250' : 'Titleist T350'
        results.brandTier = 'premium'
        results.confidence = 94
        break

      case 'Driver & Woods':
        results.equipmentDetected = this.mockDriverWoodsDetection()
        results.brandIdentified = 'TaylorMade'
        results.brandTier = 'premium'
        results.confidence = 96
        break

      case 'Irons Set':
        results.equipmentDetected = isIndividualPhoto
          ? this.mockIndividualIronsDetection()
          : this.mockIronsDetection()
        results.brandIdentified = isIndividualPhoto ? 'Titleist T350 & T250' : 'Callaway'
        results.brandTier = 'premium'
        results.confidence = 92
        break

      case 'Wedges':
        results.equipmentDetected = this.mockWedgesDetection()
        results.brandIdentified = 'Cleveland'
        results.brandTier = 'standard'
        results.confidence = 89
        break

      case 'Putter':
        results.equipmentDetected = this.mockPutterDetection()
        results.brandIdentified = 'Scotty Cameron'
        results.brandTier = 'premium'
        results.confidence = 97
        break

      case 'Bag & Accessories':
        results.equipmentDetected = this.mockBagAccessoriesDetection()
        results.brandIdentified = 'Titleist'
        results.brandTier = 'premium'
        results.confidence = 88
        break

      default:
        // Generic detection for unknown category
        results.equipmentDetected = isIndividualPhoto
          ? this.mockIndividualIronsDetection()
          : this.mockGenericDetection()
        results.brandIdentified = isIndividualPhoto ? 'Titleist T350 & T250' : 'Ping'
        results.brandTier = 'premium'
        results.confidence = 85
    }

    // Calculate total value
    results.totalValue = this.calculateTotalValue(results.equipmentDetected)

    return results
  }

  /**
   * Mock individual irons detection (3 clubs) - for demo with T350 and T250
   */
  private static mockIndividualIronsDetection(): DetectedEquipment[] {
    return [
      { type: 'T350 7-Iron', brand: 'Titleist T350', condition: 'excellent', estimatedValue: { min: 180, max: 220 }, confidence: 97 },
      { type: 'T250 8-Iron', brand: 'Titleist T250', condition: 'excellent', estimatedValue: { min: 200, max: 250 }, confidence: 96 },
      { type: 'T350 9-Iron', brand: 'Titleist T350', condition: 'excellent', estimatedValue: { min: 180, max: 220 }, confidence: 97 }
    ]
  }

  /**
   * Mock full set detection (14 clubs)
   */
  private static mockFullSetDetection(): DetectedEquipment[] {
    return [
      { type: 'Driver', brand: 'Titleist TSR3', condition: 'excellent', estimatedValue: { min: 500, max: 650 }, confidence: 95 },
      { type: '3-Wood', brand: 'Titleist TSR2', condition: 'excellent', estimatedValue: { min: 280, max: 380 }, confidence: 93 },
      { type: '4-Hybrid', brand: 'Titleist TSR2', condition: 'good', estimatedValue: { min: 180, max: 230 }, confidence: 90 },
      { type: 'T350 4-Iron', brand: 'Titleist T350', condition: 'excellent', estimatedValue: { min: 150, max: 190 }, confidence: 96 },
      { type: 'T350 5-Iron', brand: 'Titleist T350', condition: 'excellent', estimatedValue: { min: 150, max: 190 }, confidence: 96 },
      { type: 'T350 6-Iron', brand: 'Titleist T350', condition: 'excellent', estimatedValue: { min: 150, max: 190 }, confidence: 96 },
      { type: 'T350 7-Iron', brand: 'Titleist T350', condition: 'excellent', estimatedValue: { min: 150, max: 190 }, confidence: 96 },
      { type: 'T350 8-Iron', brand: 'Titleist T350', condition: 'excellent', estimatedValue: { min: 150, max: 190 }, confidence: 96 },
      { type: 'T350 9-Iron', brand: 'Titleist T350', condition: 'excellent', estimatedValue: { min: 150, max: 190 }, confidence: 96 },
      { type: 'T350 PW', brand: 'Titleist T350', condition: 'excellent', estimatedValue: { min: 150, max: 190 }, confidence: 96 },
      { type: 'Vokey SM10 50°', brand: 'Titleist Vokey', condition: 'excellent', estimatedValue: { min: 140, max: 170 }, confidence: 94 },
      { type: 'Vokey SM10 54°', brand: 'Titleist Vokey', condition: 'excellent', estimatedValue: { min: 140, max: 170 }, confidence: 94 },
      { type: 'Putter', brand: 'Scotty Cameron', condition: 'excellent', estimatedValue: { min: 350, max: 450 }, confidence: 97 },
      { type: 'Players 4 StaDry Stand Bag', brand: 'Titleist', condition: 'excellent', estimatedValue: { min: 250, max: 350 }, confidence: 92 }
    ]
  }

  /**
   * Mock driver and woods detection
   */
  private static mockDriverWoodsDetection(): DetectedEquipment[] {
    return [
      { type: 'Driver', brand: 'TaylorMade', condition: 'excellent', estimatedValue: { min: 450, max: 600 }, confidence: 96 },
      { type: '3-Wood', brand: 'TaylorMade', condition: 'excellent', estimatedValue: { min: 280, max: 380 }, confidence: 94 },
      { type: '5-Wood', brand: 'TaylorMade', condition: 'good', estimatedValue: { min: 200, max: 280 }, confidence: 91 }
    ]
  }

  /**
   * Mock irons detection
   */
  private static mockIronsDetection(): DetectedEquipment[] {
    return [
      { type: '4-Iron', brand: 'Callaway', condition: 'excellent', estimatedValue: { min: 140, max: 180 }, confidence: 93 },
      { type: '5-Iron', brand: 'Callaway', condition: 'excellent', estimatedValue: { min: 140, max: 180 }, confidence: 93 },
      { type: '6-Iron', brand: 'Callaway', condition: 'excellent', estimatedValue: { min: 140, max: 180 }, confidence: 93 },
      { type: '7-Iron', brand: 'Callaway', condition: 'excellent', estimatedValue: { min: 140, max: 180 }, confidence: 93 },
      { type: '8-Iron', brand: 'Callaway', condition: 'excellent', estimatedValue: { min: 140, max: 180 }, confidence: 93 },
      { type: '9-Iron', brand: 'Callaway', condition: 'excellent', estimatedValue: { min: 140, max: 180 }, confidence: 93 },
      { type: 'Pitching Wedge', brand: 'Callaway', condition: 'excellent', estimatedValue: { min: 140, max: 180 }, confidence: 93 }
    ]
  }

  /**
   * Mock wedges detection
   */
  private static mockWedgesDetection(): DetectedEquipment[] {
    return [
      { type: 'Gap Wedge', brand: 'Cleveland', condition: 'good', estimatedValue: { min: 90, max: 120 }, confidence: 89 },
      { type: 'Sand Wedge', brand: 'Cleveland', condition: 'good', estimatedValue: { min: 90, max: 120 }, confidence: 89 },
      { type: 'Lob Wedge', brand: 'Cleveland', condition: 'good', estimatedValue: { min: 90, max: 120 }, confidence: 89 }
    ]
  }

  /**
   * Mock putter detection
   */
  private static mockPutterDetection(): DetectedEquipment[] {
    return [
      { type: 'Putter', brand: 'Scotty Cameron', condition: 'excellent', estimatedValue: { min: 380, max: 480 }, confidence: 97 }
    ]
  }

  /**
   * Mock bag and accessories detection
   */
  private static mockBagAccessoriesDetection(): DetectedEquipment[] {
    return [
      { type: 'Golf Bag', brand: 'Titleist', condition: 'excellent', estimatedValue: { min: 220, max: 320 }, confidence: 90 },
      { type: 'Push Cart', brand: 'Titleist', condition: 'good', estimatedValue: { min: 150, max: 200 }, confidence: 85 },
      { type: 'Range Finder', brand: 'Bushnell', condition: 'excellent', estimatedValue: { min: 250, max: 350 }, confidence: 92 }
    ]
  }

  /**
   * Mock generic detection for uncategorized photos
   */
  private static mockGenericDetection(): DetectedEquipment[] {
    return [
      { type: 'Driver', brand: 'Ping', condition: 'good', estimatedValue: { min: 300, max: 400 }, confidence: 85 },
      { type: 'Putter', brand: 'Ping', condition: 'good', estimatedValue: { min: 180, max: 250 }, confidence: 82 }
    ]
  }

  /**
   * Calculate total value from detected equipment
   */
  private static calculateTotalValue(equipment: DetectedEquipment[]) {
    const min = equipment.reduce((sum, item) => sum + item.estimatedValue.min, 0)
    const max = equipment.reduce((sum, item) => sum + item.estimatedValue.max, 0)
    const estimated = Math.round((min + max) / 2)

    return { min, max, estimated }
  }

  /**
   * Generate human-readable summary of detected equipment
   */
  static generateSummary(result: EquipmentAnalysisResult): string {
    const count = result.equipmentDetected.length
    const types = [...new Set(result.equipmentDetected.map(e => e.type))].join(', ')
    const brand = result.brandIdentified || 'Mixed brands'
    const value = `$${result.totalValue.estimated.toLocaleString()}`

    return `Detected ${count} items (${types}). Brand: ${brand}. Estimated value: ${value}`
  }

  /**
   * Format equipment list for display
   */
  static formatEquipmentList(equipment: DetectedEquipment[]): string {
    return equipment.map(item => {
      const value = `$${item.estimatedValue.min}-$${item.estimatedValue.max}`
      return `${item.type} (${item.brand || 'Unknown'}) - ${value}`
    }).join('\n')
  }
}
