/**
 * Healthcare Gap Detector for Arthur Health
 * Identifies gaps in healthcare delivery using Neo4j graph queries
 */

import { ArthurNeo4jClient } from "./neo4j-client";
import { HEALTHCARE_QUERIES } from "./text2cypher";

export interface HealthcareGap {
  patientId: string;
  patientName: string;
  gapType: string;
  priority: 'Critical' | 'High' | 'Moderate' | 'Low';
  description: string;
  recommendedAction: string;
  estimatedCostImpact?: number;
  dueDate?: string;
  metadata?: Record<string, any>;
}

export interface GapDetectionResult {
  totalGaps: number;
  gapsByPriority: Record<string, number>;
  gapsByType: Record<string, number>;
  totalEstimatedSavings: number;
  gaps: HealthcareGap[];
  generatedAt: string;
}

/**
 * Healthcare Gap Detection Engine
 */
export class HealthcareGapDetector {
  private neo4j: ArthurNeo4jClient;

  constructor() {
    this.neo4j = ArthurNeo4jClient.getInstance();
  }

  /**
   * Detect all types of healthcare gaps
   * Returns comprehensive gap analysis
   */
  async detectAllGaps(): Promise<GapDetectionResult> {
    console.log("🔍 Starting comprehensive gap detection...");

    const startTime = Date.now();

    // Run all gap detection queries in parallel for performance
    const [
      missingSpecialistVisits,
      medicationNonAdherence,
      expiredPriorAuths,
      highCostWithoutCoordination,
      missingPreventiveCare,
      riskStratificationGaps,
    ] = await Promise.all([
      this.detectMissingSpecialistVisits(),
      this.detectMedicationNonAdherence(),
      this.detectExpiredPriorAuthorizations(),
      this.detectHighCostWithoutCoordination(),
      this.detectMissingPreventiveCare(),
      this.detectRiskStratificationGaps(),
    ]);

    // Combine all gaps
    const allGaps = [
      ...missingSpecialistVisits,
      ...medicationNonAdherence,
      ...expiredPriorAuths,
      ...highCostWithoutCoordination,
      ...missingPreventiveCare,
      ...riskStratificationGaps,
    ];

    // Calculate statistics
    const gapsByPriority = this.countByField(allGaps, 'priority');
    const gapsByType = this.countByField(allGaps, 'gapType');
    const totalEstimatedSavings = allGaps.reduce(
      (sum, gap) => sum + (gap.estimatedCostImpact || 0),
      0
    );

    const duration = Date.now() - startTime;
    console.log(`✅ Gap detection completed in ${duration}ms`);
    console.log(`📊 Found ${allGaps.length} gaps across 6 categories`);

    return {
      totalGaps: allGaps.length,
      gapsByPriority,
      gapsByType,
      totalEstimatedSavings,
      gaps: allGaps,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Gap 1: Missing Specialist Visits
   * Identifies patients with chronic conditions who haven't seen specialists
   */
  async detectMissingSpecialistVisits(): Promise<HealthcareGap[]> {
    const results = await this.neo4j.query<{
      patientId: string;
      patientName: string;
      riskScore: number;
      lastVisit: string;
    }>(HEALTHCARE_QUERIES.missingSpecialistVisits);

    return results.map((row) => ({
      patientId: row.patientId,
      patientName: row.patientName,
      gapType: 'Missing Specialist Care',
      priority: row.riskScore > 80 ? 'Critical' : row.riskScore > 60 ? 'High' : 'Moderate',
      description: `Diabetic patient has not seen endocrinologist in 6+ months (Risk Score: ${row.riskScore})`,
      recommendedAction: 'Schedule urgent endocrinologist appointment within 2 weeks',
      estimatedCostImpact: 2500, // Avg cost of complications prevented
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
      metadata: {
        riskScore: row.riskScore,
        lastVisit: row.lastVisit,
        specialty: 'Endocrinology',
      },
    }));
  }

  /**
   * Gap 2: Medication Non-Adherence
   * Finds patients with poor medication adherence
   */
  async detectMedicationNonAdherence(): Promise<HealthcareGap[]> {
    const results = await this.neo4j.query<{
      patientId: string;
      patientName: string;
      medication: string;
      adherenceScore: number;
    }>(HEALTHCARE_QUERIES.medicationNonAdherence);

    return results.map((row) => ({
      patientId: row.patientId,
      patientName: row.patientName,
      gapType: 'Medication Non-Adherence',
      priority: row.adherenceScore < 0.5 ? 'Critical' : 'High',
      description: `Patient adherence to ${row.medication} is only ${(row.adherenceScore * 100).toFixed(0)}%`,
      recommendedAction: 'Implement medication reminder system and counseling',
      estimatedCostImpact: 1800, // Cost of ER visit prevented
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      metadata: {
        medication: row.medication,
        adherenceScore: row.adherenceScore,
      },
    }));
  }

  /**
   * Gap 3: Expired Prior Authorizations
   * Identifies expired prior authorizations that need renewal
   */
  async detectExpiredPriorAuthorizations(): Promise<HealthcareGap[]> {
    const results = await this.neo4j.query<{
      patientId: string;
      patientName: string;
      procedureCode: string;
      expiredDate: string;
    }>(HEALTHCARE_QUERIES.expiredPriorAuths);

    return results.map((row) => ({
      patientId: row.patientId,
      patientName: row.patientName,
      gapType: 'Expired Prior Authorization',
      priority: 'High',
      description: `Prior authorization for ${row.procedureCode} expired on ${row.expiredDate}`,
      recommendedAction: 'Submit renewal request immediately to prevent service interruption',
      estimatedCostImpact: 0, // Prevents denial, no cost increase
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
      metadata: {
        procedureCode: row.procedureCode,
        expiredDate: row.expiredDate,
      },
    }));
  }

  /**
   * Gap 4: High Cost Without Care Coordination
   * Finds high-cost patients not enrolled in care management
   */
  async detectHighCostWithoutCoordination(): Promise<HealthcareGap[]> {
    const results = await this.neo4j.query<{
      patientId: string;
      patientName: string;
      totalCost: number;
    }>(HEALTHCARE_QUERIES.highCostWithoutCareManagement);

    return results.map((row) => ({
      patientId: row.patientId,
      patientName: row.patientName,
      gapType: 'High-Cost Without Care Management',
      priority: 'Critical',
      description: `Patient has $${row.totalCost.toLocaleString()} in claims but no care coordination`,
      recommendedAction: 'Enroll in intensive care management program immediately',
      estimatedCostImpact: row.totalCost * 0.25, // 25% reduction typical
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days
      metadata: {
        totalCost: row.totalCost,
      },
    }));
  }

  /**
   * Gap 5: Missing Preventive Care
   * Identifies patients overdue for preventive screenings
   */
  async detectMissingPreventiveCare(): Promise<HealthcareGap[]> {
    const query = `
      MATCH (p:Patient)
      WHERE p.dateOfBirth < date(datetime() - duration('P50Y'))
      AND NOT EXISTS {
        MATCH (p)-[:HAS_CLAIM]->(c:Claim)
        WHERE c.procedureCode IN ['99387', '99397', 'G0438', 'G0439']
        AND c.serviceDate > date(datetime() - duration('P1Y'))
      }
      RETURN
        p.id AS patientId,
        p.firstName + ' ' + p.lastName AS patientName,
        date(p.dateOfBirth) AS dateOfBirth,
        p.insuranceId AS insuranceId
      LIMIT 100
    `;

    const results = await this.neo4j.query<{
      patientId: string;
      patientName: string;
      dateOfBirth: string;
      insuranceId: string;
    }>(query);

    return results.map((row) => ({
      patientId: row.patientId,
      patientName: row.patientName,
      gapType: 'Missing Preventive Care',
      priority: 'Moderate',
      description: `Patient overdue for annual wellness visit and preventive screening`,
      recommendedAction: 'Schedule annual wellness visit and age-appropriate screenings',
      estimatedCostImpact: 5000, // Cost of early disease detection value
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      metadata: {
        dateOfBirth: row.dateOfBirth,
        insuranceId: row.insuranceId,
      },
    }));
  }

  /**
   * Gap 6: Risk Stratification Gaps
   * Finds high-risk patients without recent assessment
   */
  async detectRiskStratificationGaps(): Promise<HealthcareGap[]> {
    const query = `
      MATCH (p:Patient)
      WHERE p.riskScore > 75
      AND (
        p.lastVisit IS NULL OR
        p.lastVisit < datetime() - duration('P3M')
      )
      RETURN
        p.id AS patientId,
        p.firstName + ' ' + p.lastName AS patientName,
        p.riskScore AS riskScore,
        p.lastVisit AS lastVisit
      ORDER BY p.riskScore DESC
      LIMIT 100
    `;

    const results = await this.neo4j.query<{
      patientId: string;
      patientName: string;
      riskScore: number;
      lastVisit: string | null;
    }>(query);

    return results.map((row) => ({
      patientId: row.patientId,
      patientName: row.patientName,
      gapType: 'High-Risk Without Recent Assessment',
      priority: 'Critical',
      description: `High-risk patient (${row.riskScore}) has not been assessed in 3+ months`,
      recommendedAction: 'Conduct comprehensive health assessment and update care plan',
      estimatedCostImpact: 3500, // Cost of preventable hospitalization
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      metadata: {
        riskScore: row.riskScore,
        lastVisit: row.lastVisit,
      },
    }));
  }

  /**
   * Get gaps for a specific patient
   */
  async getGapsForPatient(patientId: string): Promise<HealthcareGap[]> {
    const allGaps = await this.detectAllGaps();
    return allGaps.gaps.filter(gap => gap.patientId === patientId);
  }

  /**
   * Get gaps by priority level
   */
  async getGapsByPriority(
    priority: 'Critical' | 'High' | 'Moderate' | 'Low'
  ): Promise<HealthcareGap[]> {
    const allGaps = await this.detectAllGaps();
    return allGaps.gaps.filter(gap => gap.priority === priority);
  }

  /**
   * Get gaps by type
   */
  async getGapsByType(gapType: string): Promise<HealthcareGap[]> {
    const allGaps = await this.detectAllGaps();
    return allGaps.gaps.filter(gap => gap.gapType === gapType);
  }

  /**
   * Helper: Count occurrences by field
   */
  private countByField(
    gaps: HealthcareGap[],
    field: keyof HealthcareGap
  ): Record<string, number> {
    return gaps.reduce((acc, gap) => {
      const key = String(gap[field]);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}

// Export singleton instance
export const gapDetector = new HealthcareGapDetector();
