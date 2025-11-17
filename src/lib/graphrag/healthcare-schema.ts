/**
 * Healthcare Graph Ontology Schema for Arthur Health
 * Defines node types, relationships, and constraints for the Neo4j graph
 */

import { ArthurNeo4jClient } from "./neo4j-client";

/**
 * Complete healthcare ontology schema as Cypher statements
 */
export const HEALTHCARE_SCHEMA_CYPHER = `
// ============================================
// CONSTRAINTS (Uniqueness & Existence)
// ============================================

// Patient constraints
CREATE CONSTRAINT patient_id IF NOT EXISTS
FOR (p:Patient) REQUIRE p.id IS UNIQUE;

CREATE CONSTRAINT patient_mrn IF NOT EXISTS
FOR (p:Patient) REQUIRE p.mrn IS UNIQUE;

// Diagnosis constraints
CREATE CONSTRAINT diagnosis_code IF NOT EXISTS
FOR (d:Diagnosis) REQUIRE d.icd10Code IS UNIQUE;

// Medication constraints
CREATE CONSTRAINT medication_code IF NOT EXISTS
FOR (m:Medication) REQUIRE m.rxNormCode IS UNIQUE;

// Provider constraints
CREATE CONSTRAINT provider_npi IF NOT EXISTS
FOR (pr:Provider) REQUIRE pr.npi IS UNIQUE;

// Claim constraints
CREATE CONSTRAINT claim_number IF NOT EXISTS
FOR (c:Claim) REQUIRE c.claimNumber IS UNIQUE;

// Prior Authorization constraints
CREATE CONSTRAINT pa_id IF NOT EXISTS
FOR (pa:PriorAuthorization) REQUIRE pa.id IS UNIQUE;

// Care Program constraints
CREATE CONSTRAINT program_id IF NOT EXISTS
FOR (cp:CareProgram) REQUIRE cp.id IS UNIQUE;

// ============================================
// INDEXES (Performance Optimization)
// ============================================

// Patient indexes
CREATE INDEX patient_last_name IF NOT EXISTS
FOR (p:Patient) ON (p.lastName);

CREATE INDEX patient_risk_score IF NOT EXISTS
FOR (p:Patient) ON (p.riskScore);

CREATE INDEX patient_insurance IF NOT EXISTS
FOR (p:Patient) ON (p.insuranceId);

// Diagnosis indexes
CREATE INDEX diagnosis_category IF NOT EXISTS
FOR (d:Diagnosis) ON (d.category);

CREATE INDEX diagnosis_chronic IF NOT EXISTS
FOR (d:Diagnosis) ON (d.chronicCondition);

// Medication indexes
CREATE INDEX medication_generic IF NOT EXISTS
FOR (m:Medication) ON (m.genericName);

CREATE INDEX medication_category IF NOT EXISTS
FOR (m:Medication) ON (m.category);

// Provider indexes
CREATE INDEX provider_specialty IF NOT EXISTS
FOR (pr:Provider) ON (pr.specialty);

CREATE INDEX provider_facility IF NOT EXISTS
FOR (pr:Provider) ON (pr.facilityName);

// Claim indexes
CREATE INDEX claim_status IF NOT EXISTS
FOR (c:Claim) ON (c.status);

CREATE INDEX claim_service_date IF NOT EXISTS
FOR (c:Claim) ON (c.serviceDate);

// Prior Authorization indexes
CREATE INDEX pa_status IF NOT EXISTS
FOR (pa:PriorAuthorization) ON (pa.status);

CREATE INDEX pa_expiry IF NOT EXISTS
FOR (pa:PriorAuthorization) ON (pa.validUntil);
`;

/**
 * Node type definitions with properties
 */
export interface PatientNode {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO date string
  gender: string;
  insuranceId: string;
  riskScore: number;
  lastVisit?: string; // ISO datetime string
  createdAt: string;
  updatedAt: string;
}

export interface DiagnosisNode {
  id: string;
  name: string;
  icd10Code: string;
  category: string;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Critical';
  chronicCondition: boolean;
}

export interface MedicationNode {
  id: string;
  brandName: string;
  genericName: string;
  rxNormCode: string;
  dosage: string;
  frequency: string;
  category: string;
}

export interface ProviderNode {
  id: string;
  npi: string;
  firstName: string;
  lastName: string;
  specialty: string;
  facilityName: string;
  acceptsNewPatients: boolean;
}

export interface ClaimNode {
  id: string;
  claimNumber: string;
  serviceDate: string; // ISO date string
  amount: number;
  status: 'Submitted' | 'Pending' | 'Approved' | 'Denied' | 'Appealed';
  priorAuthRequired: boolean;
  denialReason?: string;
}

export interface PriorAuthorizationNode {
  id: string;
  status: 'Pending' | 'Approved' | 'Denied' | 'Expired';
  requestDate: string;
  approvalDate?: string;
  validUntil: string;
  procedureCode: string;
  notes?: string;
}

export interface CareProgramNode {
  id: string;
  name: string;
  type: 'Diabetes Management' | 'Cardiac Care' | 'Behavioral Health' | 'Chronic Care' | 'Preventive Care';
  enrollmentDate: string;
  active: boolean;
}

/**
 * Relationship definitions
 */
export interface HasDiagnosisRelationship {
  diagnosedDate: string;
  diagnosedBy: string; // Provider ID
  active: boolean;
  lastReviewed: string;
}

export interface PrescribedRelationship {
  prescribedDate: string;
  prescribedBy: string; // Provider ID
  dosage: string;
  refillsRemaining: number;
  lastFilled: string;
  adherenceScore: number; // 0.0 to 1.0
}

export interface VisitedRelationship {
  visitDate: string;
  visitType: 'Initial' | 'Follow-up' | 'Emergency' | 'Routine';
  chiefComplaint: string;
  outcome: string;
  nextVisitScheduled?: string;
}

export interface HasClaimRelationship {
  submittedDate: string;
  processedDate?: string;
}

export interface ProvidedByRelationship {
  serviceDate: string;
  procedureCode?: string;
}

export interface RequiresPARelationship {
  requestedDate: string;
  urgency: 'Routine' | 'Urgent' | 'Emergency';
}

export interface EnrolledInRelationship {
  enrollmentDate: string;
  completionDate?: string;
  status: 'Active' | 'Completed' | 'Dropped';
}

/**
 * Healthcare Schema Manager
 */
export class HealthcareSchemaManager {
  private neo4j: ArthurNeo4jClient;

  constructor() {
    this.neo4j = ArthurNeo4jClient.getInstance();
  }

  /**
   * Initialize the complete healthcare schema
   * Creates all constraints and indexes
   */
  async initializeSchema(): Promise<void> {
    console.log("🏗️  Initializing healthcare schema...");

    try {
      // Split schema into individual statements
      const statements = HEALTHCARE_SCHEMA_CYPHER
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('//'));

      // Execute each statement
      for (const statement of statements) {
        if (statement.trim().length === 0) continue;

        try {
          await this.neo4j.query(statement);
          console.log("✅ Executed:", statement.substring(0, 60) + "...");
        } catch (error: any) {
          // Ignore "already exists" errors
          if (error.message?.includes('already exists') ||
              error.message?.includes('AlreadyExists')) {
            console.log("⏩ Skipped (already exists):", statement.substring(0, 60) + "...");
          } else {
            console.error("❌ Failed:", statement.substring(0, 60) + "...");
            throw error;
          }
        }
      }

      console.log("✅ Healthcare schema initialized successfully");

      // Refresh schema cache
      await this.neo4j.refreshSchema();

    } catch (error) {
      console.error("❌ Schema initialization failed:", error);
      throw new Error(`Failed to initialize healthcare schema: ${error}`);
    }
  }

  /**
   * Get schema statistics
   */
  async getSchemaStats(): Promise<{
    constraints: number;
    indexes: number;
    nodeLabels: string[];
    relationshipTypes: string[];
  }> {
    const constraints = await this.neo4j.query<{ name: string }>(
      "SHOW CONSTRAINTS YIELD name RETURN name"
    );

    const indexes = await this.neo4j.query<{ name: string }>(
      "SHOW INDEXES YIELD name RETURN name"
    );

    const labels = await this.neo4j.query<{ label: string }>(
      "CALL db.labels() YIELD label RETURN label"
    );

    const relTypes = await this.neo4j.query<{ type: string }>(
      "CALL db.relationshipTypes() YIELD relationshipType as type RETURN type"
    );

    return {
      constraints: constraints.length,
      indexes: indexes.length,
      nodeLabels: labels.map(l => l.label),
      relationshipTypes: relTypes.map(r => r.type),
    };
  }

  /**
   * Drop all constraints and indexes (use with caution!)
   */
  async dropSchema(): Promise<void> {
    console.warn("⚠️  Dropping all constraints and indexes...");

    // Drop constraints
    const constraints = await this.neo4j.query<{ name: string }>(
      "SHOW CONSTRAINTS YIELD name RETURN name"
    );

    for (const constraint of constraints) {
      await this.neo4j.query(`DROP CONSTRAINT ${constraint.name} IF EXISTS`);
    }

    // Drop indexes
    const indexes = await this.neo4j.query<{ name: string }>(
      "SHOW INDEXES YIELD name WHERE name STARTS WITH 'index_' RETURN name"
    );

    for (const index of indexes) {
      await this.neo4j.query(`DROP INDEX ${index.name} IF EXISTS`);
    }

    console.log("✅ Schema dropped successfully");
  }
}

// Export singleton instance
export const healthcareSchema = new HealthcareSchemaManager();
