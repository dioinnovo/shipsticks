/**
 * Arthur Health - Neo4j Knowledge Graph Schema
 * Complete schema definition for healthcare entities following FHIR standard
 *
 * Run this file to create all constraints, indexes, and vector indexes
 * Usage: cypher-shell -u neo4j -p password -f neo4j-schema.cypher
 */

// ==============================================================================
// CONSTRAINTS - Ensure data integrity with unique IDs
// ==============================================================================

// Patient constraints
CREATE CONSTRAINT patient_id IF NOT EXISTS
FOR (p:Patient) REQUIRE p.id IS UNIQUE;

CREATE CONSTRAINT patient_mrn IF NOT EXISTS
FOR (p:Patient) REQUIRE p.mrn IS UNIQUE;

// Diagnosis constraints
CREATE CONSTRAINT diagnosis_id IF NOT EXISTS
FOR (d:Diagnosis) REQUIRE d.id IS UNIQUE;

CREATE CONSTRAINT diagnosis_icd10 IF NOT EXISTS
FOR (d:Diagnosis) REQUIRE d.icd10Code IS UNIQUE;

// Medication constraints
CREATE CONSTRAINT medication_id IF NOT EXISTS
FOR (m:Medication) REQUIRE m.id IS UNIQUE;

CREATE CONSTRAINT medication_rxnorm IF NOT EXISTS
FOR (m:Medication) REQUIRE m.rxNormCode IS UNIQUE;

// Provider constraints
CREATE CONSTRAINT provider_id IF NOT EXISTS
FOR (pr:Provider) REQUIRE pr.id IS UNIQUE;

CREATE CONSTRAINT provider_npi IF NOT EXISTS
FOR (pr:Provider) REQUIRE pr.npiNumber IS UNIQUE;

// Facility constraints
CREATE CONSTRAINT facility_id IF NOT EXISTS
FOR (f:Facility) REQUIRE f.id IS UNIQUE;

// Procedure constraints
CREATE CONSTRAINT procedure_id IF NOT EXISTS
FOR (proc:Procedure) REQUIRE proc.id IS UNIQUE;

CREATE CONSTRAINT procedure_cpt IF NOT EXISTS
FOR (proc:Procedure) REQUIRE proc.cptCode IS UNIQUE;

// CareProgram constraints
CREATE CONSTRAINT care_program_id IF NOT EXISTS
FOR (cp:CareProgram) REQUIRE cp.id IS UNIQUE;

// ==============================================================================
// PROPERTY INDEXES - Optimize common query patterns
// ==============================================================================

// Patient indexes
CREATE INDEX patient_last_name IF NOT EXISTS
FOR (p:Patient) ON (p.lastName);

CREATE INDEX patient_dob IF NOT EXISTS
FOR (p:Patient) ON (p.dateOfBirth);

CREATE INDEX patient_insurance IF NOT EXISTS
FOR (p:Patient) ON (p.insuranceProvider);

// Diagnosis indexes
CREATE INDEX diagnosis_name IF NOT EXISTS
FOR (d:Diagnosis) ON (d.name);

CREATE INDEX diagnosis_category IF NOT EXISTS
FOR (d:Diagnosis) ON (d.category);

// Medication indexes
CREATE INDEX medication_name IF NOT EXISTS
FOR (m:Medication) ON (m.genericName);

CREATE INDEX medication_brand IF NOT EXISTS
FOR (m:Medication) ON (m.brandName);

// Provider indexes
CREATE INDEX provider_specialty IF NOT EXISTS
FOR (pr:Provider) ON (pr.specialty);

CREATE INDEX provider_network IF NOT EXISTS
FOR (pr:Provider) ON (pr.networkTier);

// Facility indexes
CREATE INDEX facility_type IF NOT EXISTS
FOR (f:Facility) ON (f.facilityType);

CREATE INDEX facility_network IF NOT EXISTS
FOR (f:Facility) ON (f.networkStatus);

// Procedure indexes
CREATE INDEX procedure_name IF NOT EXISTS
FOR (proc:Procedure) ON (proc.name);

// CareProgram indexes
CREATE INDEX care_program_name IF NOT EXISTS
FOR (cp:CareProgram) ON (cp.programName);

CREATE INDEX care_program_status IF NOT EXISTS
FOR (cp:CareProgram) ON (cp.enrollmentStatus);

// Relationship property indexes
CREATE INDEX has_diagnosis_date IF NOT EXISTS
FOR ()-[r:HAS_DIAGNOSIS]-() ON (r.diagnosedDate);

CREATE INDEX prescribed_date IF NOT EXISTS
FOR ()-[r:PRESCRIBED]-() ON (r.prescribedDate);

CREATE INDEX visited_date IF NOT EXISTS
FOR ()-[r:VISITED]-() ON (r.visitDate);

// ==============================================================================
// VECTOR INDEXES - Enable semantic search on text fields
// ==============================================================================

// Patient policy documents (text-embedding-3-small = 1536 dimensions)
CREATE VECTOR INDEX patient_policy_vector IF NOT EXISTS
FOR (p:Patient) ON (p.policyTextEmbedding)
OPTIONS {
  indexConfig: {
    `vector.dimensions`: 1536,
    `vector.similarity_function`: 'cosine'
  }
};

// Clinical notes on diagnoses
CREATE VECTOR INDEX diagnosis_notes_vector IF NOT EXISTS
FOR (d:Diagnosis) ON (d.notesEmbedding)
OPTIONS {
  indexConfig: {
    `vector.dimensions`: 1536,
    `vector.similarity_function`: 'cosine'
  }
};

// Medication instructions/narratives
CREATE VECTOR INDEX medication_instructions_vector IF NOT EXISTS
FOR (m:Medication) ON (m.instructionsEmbedding)
OPTIONS {
  indexConfig: {
    `vector.dimensions`: 1536,
    `vector.similarity_function`: 'cosine'
  }
};

// Procedure notes
CREATE VECTOR INDEX procedure_notes_vector IF NOT EXISTS
FOR (proc:Procedure) ON (proc.notesEmbedding)
OPTIONS {
  indexConfig: {
    `vector.dimensions`: 1536,
    `vector.similarity_function`: 'cosine'
  }
};

// CareProgram descriptions
CREATE VECTOR INDEX care_program_description_vector IF NOT EXISTS
FOR (cp:CareProgram) ON (cp.descriptionEmbedding)
OPTIONS {
  indexConfig: {
    `vector.dimensions`: 1536,
    `vector.similarity_function`: 'cosine'
  }
};

// ==============================================================================
// FULL-TEXT INDEXES - Enable keyword search on text fields
// ==============================================================================

// Patient full-text search (policies, narratives)
CREATE FULLTEXT INDEX patient_text_search IF NOT EXISTS
FOR (p:Patient) ON EACH [p.policyText, p.clinicalNarrative, p.firstName, p.lastName];

// Diagnosis full-text search
CREATE FULLTEXT INDEX diagnosis_text_search IF NOT EXISTS
FOR (d:Diagnosis) ON EACH [d.name, d.description, d.notes];

// Medication full-text search
CREATE FULLTEXT INDEX medication_text_search IF NOT EXISTS
FOR (m:Medication) ON EACH [m.genericName, m.brandName, m.instructions, m.sideEffects];

// Provider full-text search
CREATE FULLTEXT INDEX provider_text_search IF NOT EXISTS
FOR (pr:Provider) ON EACH [pr.firstName, pr.lastName, pr.specialty, pr.credentials];

// Facility full-text search
CREATE FULLTEXT INDEX facility_text_search IF NOT EXISTS
FOR (f:Facility) ON EACH [f.name, f.address, f.facilityType];

// Procedure full-text search
CREATE FULLTEXT INDEX procedure_text_search IF NOT EXISTS
FOR (proc:Procedure) ON EACH [proc.name, proc.description, proc.notes];

// CareProgram full-text search
CREATE FULLTEXT INDEX care_program_text_search IF NOT EXISTS
FOR (cp:CareProgram) ON EACH [cp.programName, cp.description, cp.eligibilityCriteria];

// ==============================================================================
// COMPOSITE INDEXES - Optimize complex queries
// ==============================================================================

// Patient risk stratification queries
CREATE INDEX patient_risk_composite IF NOT EXISTS
FOR (p:Patient) ON (p.riskScore, p.lastVisitDate);

// Medication adherence queries
CREATE INDEX medication_adherence_composite IF NOT EXISTS
FOR ()-[r:PRESCRIBED]-() ON (r.adherenceScore, r.lastRefillDate);

// Provider performance queries
CREATE INDEX provider_performance_composite IF NOT EXISTS
FOR (pr:Provider) ON (pr.qualityScore, pr.avgAppointmentWaitTime);

// Care program effectiveness queries
CREATE INDEX care_program_effectiveness_composite IF NOT EXISTS
FOR (cp:CareProgram) ON (cp.outcomeScore, cp.enrollmentCount);

// ==============================================================================
// SCHEMA VALIDATION QUERIES
// ==============================================================================

// To verify all constraints are created:
// SHOW CONSTRAINTS;

// To verify all indexes are created:
// SHOW INDEXES;

// To check vector index status:
// SHOW INDEXES YIELD name, type, state WHERE type = "VECTOR";

// To check full-text index status:
// SHOW INDEXES YIELD name, type, state WHERE type = "FULLTEXT";

// ==============================================================================
// SAMPLE DATA FOR TESTING (Optional - comment out for production)
// ==============================================================================

/*
// Create sample patient
CREATE (p:Patient {
  id: 'PAT-001',
  mrn: 'MRN-12345',
  firstName: 'John',
  lastName: 'Smith',
  dateOfBirth: date('1965-03-15'),
  insuranceProvider: 'Blue Cross Blue Shield',
  planType: 'PPO',
  riskScore: 72.5,
  lastVisitDate: date('2025-01-10'),
  policyText: 'Patient has comprehensive PPO coverage with diabetes management benefits...',
  extractedAt: datetime(),
  extractionSource: 'synapse_etl'
});

// Create sample diagnosis
CREATE (d:Diagnosis {
  id: 'DX-001',
  icd10Code: 'E11.9',
  name: 'Type 2 Diabetes Mellitus',
  category: 'Endocrine',
  severity: 'Moderate',
  description: 'Type 2 diabetes without complications',
  extractedAt: datetime()
});

// Create sample medication
CREATE (m:Medication {
  id: 'MED-001',
  rxNormCode: 'RX-860975',
  genericName: 'Metformin',
  brandName: 'Glucophage',
  dosage: '1000mg',
  frequency: 'Twice daily',
  instructions: 'Take with meals to reduce gastrointestinal side effects',
  extractedAt: datetime()
});

// Create sample provider
CREATE (pr:Provider {
  id: 'PRV-001',
  npiNumber: 'NPI-1234567890',
  firstName: 'Sarah',
  lastName: 'Johnson',
  credentials: 'MD, FACP',
  specialty: 'Endocrinology',
  networkTier: 'Tier 1',
  qualityScore: 94.2,
  extractedAt: datetime()
});

// Create relationships
MATCH (p:Patient {id: 'PAT-001'}), (d:Diagnosis {id: 'DX-001'})
CREATE (p)-[:HAS_DIAGNOSIS {
  diagnosedDate: date('2020-06-15'),
  diagnosedBy: 'Dr. Sarah Johnson',
  active: true,
  lastReviewed: date('2025-01-10'),
  extractedAt: datetime()
}]->(d);

MATCH (p:Patient {id: 'PAT-001'}), (m:Medication {id: 'MED-001'})
CREATE (p)-[:PRESCRIBED {
  prescribedDate: date('2020-06-15'),
  dosage: '1000mg',
  frequency: 'Twice daily',
  adherenceScore: 85.0,
  lastRefillDate: date('2024-12-20'),
  extractedAt: datetime()
}]->(m);

MATCH (p:Patient {id: 'PAT-001'}), (pr:Provider {id: 'PRV-001'})
CREATE (p)-[:VISITED {
  visitDate: date('2025-01-10'),
  visitType: 'Follow-up',
  duration: 30,
  extractedAt: datetime()
}]->(pr);
*/

// ==============================================================================
// CLEANUP (Use only when resetting database)
// ==============================================================================

/*
// Drop all constraints
DROP CONSTRAINT patient_id IF EXISTS;
DROP CONSTRAINT patient_mrn IF EXISTS;
DROP CONSTRAINT diagnosis_id IF EXISTS;
DROP CONSTRAINT diagnosis_icd10 IF EXISTS;
DROP CONSTRAINT medication_id IF EXISTS;
DROP CONSTRAINT medication_rxnorm IF EXISTS;
DROP CONSTRAINT provider_id IF EXISTS;
DROP CONSTRAINT provider_npi IF EXISTS;
DROP CONSTRAINT facility_id IF EXISTS;
DROP CONSTRAINT procedure_id IF EXISTS;
DROP CONSTRAINT procedure_cpt IF EXISTS;
DROP CONSTRAINT care_program_id IF EXISTS;

// Drop all indexes
DROP INDEX patient_last_name IF EXISTS;
DROP INDEX patient_dob IF EXISTS;
DROP INDEX patient_insurance IF EXISTS;
DROP INDEX diagnosis_name IF EXISTS;
DROP INDEX diagnosis_category IF EXISTS;
DROP INDEX medication_name IF EXISTS;
DROP INDEX medication_brand IF EXISTS;
DROP INDEX provider_specialty IF EXISTS;
DROP INDEX provider_network IF EXISTS;
DROP INDEX facility_type IF EXISTS;
DROP INDEX facility_network IF EXISTS;
DROP INDEX procedure_name IF EXISTS;
DROP INDEX care_program_name IF EXISTS;
DROP INDEX care_program_status IF EXISTS;

// Delete all data
MATCH (n) DETACH DELETE n;
*/
