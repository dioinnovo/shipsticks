# Hybrid GraphRAG MVP Implementation Guide
## Testing LLM-Driven Schema Discovery Architecture

**Date**: January 13, 2025
**Status**: 🚧 In Progress
**Purpose**: Validate hybrid GraphRAG architecture with real data before production deployment

---

## 🎯 MVP Objectives

### Primary Goal
**Validate that LLM can autonomously discover entities, relationships, and patterns from SQL database metadata and create a functional knowledge graph for natural language querying.**

### What We're Testing (Architecture Pattern - Industry Agnostic)
1. ✅ **Schema Discovery**: Can LLM analyze SQL metadata (tables, FKs, indexes) and discover meaningful entities/relationships?
2. ✅ **Hybrid Extraction**: Can we combine structured SQL data + unstructured text extraction?
3. ✅ **Knowledge Graph Loading**: Does discovered schema load correctly into Neo4j?
4. ✅ **Text2Cypher Queries**: Can users ask natural language questions and get accurate answers?
5. ✅ **Pattern Detection**: Can system identify gaps/patterns in the data (e.g., missing relationships, anomalies)?
6. ✅ **Incremental Updates**: Can we add new data without rebuilding entire graph?

### What We're NOT Testing (Healthcare-Specific)
- ❌ Specific healthcare gap detection algorithms
- ❌ Clinical decision support accuracy
- ❌ HIPAA compliance workflows
- ❌ Production-scale performance (100 patients vs millions)

---

## 📊 Test Dataset: MIMIC-IV FHIR Demo

**Source**: [PhysioNet MIMIC-IV FHIR Demo v2.1.0](https://physionet.org/content/mimic-iv-fhir-demo/2.1.0/)

**Why This Dataset**:
- ✅ Real de-identified clinical data (100 patients)
- ✅ FHIR R4 compliant (industry standard)
- ✅ Rich relational structure (perfect for FK discovery)
- ✅ Multiple entity types (patients, conditions, medications, procedures)
- ✅ Temporal data (encounters over time)
- ✅ Open access (no licensing barriers)

**Data Characteristics**:
- **Patients**: 100
- **File Format**: FHIR NDJSON (gzip compressed)
- **Total Size**: 49.5 MB uncompressed
- **Resources**: 30 FHIR resource types
- **Relationships**: Patient → Conditions, Medications, Encounters, Procedures, Observations

---

## 🗺️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 1: DATA PREPARATION                     │
│                                                                  │
│  MIMIC-IV FHIR Files (NDJSON.gz)                                │
│           ↓                                                      │
│  FHIR Parser & Transformer                                      │
│           ↓                                                      │
│  PostgreSQL Database                                            │
│  (Relational schema with foreign keys)                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│               PHASE 2: SCHEMA DISCOVERY (LLM-DRIVEN)             │
│                                                                  │
│  SQL Metadata Reader                                            │
│  - Reads INFORMATION_SCHEMA                                     │
│  - Extracts tables, columns, foreign keys, indexes             │
│           ↓                                                      │
│  LLM Schema Discovery Agent (GPT-4o)                           │
│  - Analyzes SQL structure                                       │
│  - Discovers entities (Patient, Condition, Medication)          │
│  - Maps FKs → relationships                                     │
│  - Infers implicit patterns                                     │
│           ↓                                                      │
│  Discovered Healthcare Ontology                                 │
│  - Core entities                                                │
│  - Explicit relationships (from FKs)                            │
│  - Inferred relationships (from patterns)                       │
│  - Temporal properties                                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│               PHASE 3: KNOWLEDGE GRAPH CONSTRUCTION              │
│                                                                  │
│  Discovered Schema DDL                                          │
│           ↓                                                      │
│  Neo4j Graph Database                                           │
│  - Create constraints and indexes                               │
│  - Load entities as nodes                                       │
│  - Create relationships from discovered schema                  │
│  - Add temporal properties                                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                PHASE 4: VALIDATION & TESTING                     │
│                                                                  │
│  Text2Cypher (LangChain + GPT-4o)                              │
│  - Natural language queries                                     │
│  - Cypher generation                                            │
│  - Result formatting                                            │
│           ↓                                                      │
│  Pattern Detection                                              │
│  - Identify missing relationships                               │
│  - Detect temporal gaps                                         │
│  - Find anomalies in data                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ Implementation Checklist

### Pre-requisites Setup
- [ ] **Docker installed** (for PostgreSQL and Neo4j)
- [ ] **Node.js 20+** with TypeScript support
- [ ] **MIMIC-IV FHIR data downloaded** to `~/Downloads/mimic-iv-clinical-database-demo-on-fhir-2.1.0`
- [ ] **Azure OpenAI API key** configured (or OpenAI API key)
- [ ] **Git repository** cloned and dependencies installed

### Phase 1: Data Preparation (SQL Database Setup)

#### Step 1.1: Start PostgreSQL Database
**Purpose**: Create local test database to store MIMIC-IV data in relational format

**Commands**:
```bash
# Start PostgreSQL container
docker run --name mimic-postgres \
  -e POSTGRES_PASSWORD=test \
  -e POSTGRES_DB=mimic_fhir \
  -p 5432:5432 \
  -d postgres:16

# Verify connection
docker exec -it mimic-postgres psql -U postgres -d mimic_fhir -c "SELECT version();"
```

**Validation**:
- [ ] PostgreSQL container running
- [ ] Database `mimic_fhir` created
- [ ] Can connect via psql

---

#### Step 1.2: Copy MIMIC Data to Project
**Purpose**: Organize data within project structure for easy access

**Commands**:
```bash
# Create data directory
mkdir -p /Users/diodelahoz/Projects/arthur_health/data

# Copy MIMIC dataset
cp -r ~/Downloads/mimic-iv-clinical-database-demo-on-fhir-2.1.0 \
   /Users/diodelahoz/Projects/arthur_health/data/mimic-iv-fhir

# Verify files
ls -lh /Users/diodelahoz/Projects/arthur_health/data/mimic-iv-fhir/fhir/
```

**Validation**:
- [ ] Data copied to project
- [ ] 30 FHIR NDJSON.gz files present
- [ ] Files readable and valid gzip format

---

#### Step 1.3: Create FHIR Parser Library
**Purpose**: Parse FHIR NDJSON files and extract relevant data for SQL

**Files to Create**:
1. `lib/fhir/fhir-types.ts` - TypeScript interfaces for FHIR resources
2. `lib/fhir/fhir-parser.ts` - Parser functions for each FHIR resource type
3. `lib/fhir/fhir-decompressor.ts` - Utility to read gzip NDJSON files

**Key Functions**:
```typescript
// Parse Patient resource
function parsePatient(fhirPatient: FHIRPatient): Patient {
  return {
    id: fhirPatient.id,
    identifier: fhirPatient.identifier[0].value,
    familyName: fhirPatient.name[0].family,
    gender: fhirPatient.gender,
    birthDate: fhirPatient.birthDate,
    // ... extract other fields
  };
}

// Parse Condition resource
function parseCondition(fhirCondition: FHIRCondition): Condition {
  return {
    id: fhirCondition.id,
    patientId: extractReference(fhirCondition.subject.reference),
    encounterId: extractReference(fhirCondition.encounter?.reference),
    code: fhirCondition.code.coding[0].code,
    display: fhirCondition.code.coding[0].display,
    // ... extract other fields
  };
}
```

**Validation**:
- [ ] Can decompress NDJSON.gz files
- [ ] Can parse Patient resources correctly
- [ ] Can parse Condition resources correctly
- [ ] Can parse Medication resources correctly
- [ ] Can extract FHIR references (Patient/xxx → xxx)

---

#### Step 1.4: Design SQL Schema
**Purpose**: Create relational schema that mirrors FHIR structure with proper foreign keys

**File**: `sql/mimic-schema.sql`

**Schema Design Principles**:
1. **One table per FHIR resource type** (patients, conditions, medications, etc.)
2. **Foreign keys for FHIR references** (Condition.patient_id → Patient.id)
3. **Preserve FHIR identifiers** (both FHIR id and original MIMIC ID)
4. **Temporal columns** (createdAt, updatedAt for incremental updates)
5. **Indexes on FK columns** (for performance and schema discovery)

**Example Schema**:
```sql
-- Patients table (FHIR Patient resource)
CREATE TABLE patients (
  id VARCHAR(50) PRIMARY KEY,
  mimic_identifier VARCHAR(50) UNIQUE,
  family_name VARCHAR(100),
  gender VARCHAR(20),
  birth_date DATE,
  race VARCHAR(50),
  ethnicity VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conditions table (FHIR Condition resource)
CREATE TABLE conditions (
  id VARCHAR(50) PRIMARY KEY,
  patient_id VARCHAR(50) NOT NULL,
  encounter_id VARCHAR(50),
  icd9_code VARCHAR(20),
  display_name VARCHAR(500),
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Medications table (FHIR Medication resource)
CREATE TABLE medications (
  id VARCHAR(50) PRIMARY KEY,
  ndc_code VARCHAR(50),
  medication_name VARCHAR(200),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medication Administrations (junction table)
CREATE TABLE medication_administrations (
  id VARCHAR(50) PRIMARY KEY,
  patient_id VARCHAR(50) NOT NULL,
  medication_id VARCHAR(50) NOT NULL,
  encounter_id VARCHAR(50),
  administration_datetime TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (medication_id) REFERENCES medications(id)
);

-- Encounters table
CREATE TABLE encounters (
  id VARCHAR(50) PRIMARY KEY,
  patient_id VARCHAR(50) NOT NULL,
  encounter_type VARCHAR(100),
  encounter_period_start TIMESTAMP,
  encounter_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Procedures table
CREATE TABLE procedures (
  id VARCHAR(50) PRIMARY KEY,
  patient_id VARCHAR(50) NOT NULL,
  encounter_id VARCHAR(50),
  procedure_code VARCHAR(50),
  procedure_display VARCHAR(500),
  performed_datetime TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Observations table (labs, vitals, etc.)
CREATE TABLE observations (
  id VARCHAR(50) PRIMARY KEY,
  patient_id VARCHAR(50) NOT NULL,
  encounter_id VARCHAR(50),
  observation_type VARCHAR(100),
  code VARCHAR(50),
  value_quantity DECIMAL(10,2),
  value_unit VARCHAR(50),
  effective_datetime TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Indexes for performance and FK discovery
CREATE INDEX idx_conditions_patient ON conditions(patient_id);
CREATE INDEX idx_med_admin_patient ON medication_administrations(patient_id);
CREATE INDEX idx_med_admin_medication ON medication_administrations(medication_id);
CREATE INDEX idx_encounters_patient ON encounters(patient_id);
CREATE INDEX idx_procedures_patient ON procedures(patient_id);
CREATE INDEX idx_observations_patient ON observations(patient_id);
```

**Validation**:
- [ ] Schema SQL file created
- [ ] All FHIR resources mapped to tables
- [ ] Foreign keys properly defined
- [ ] Indexes created on FK columns

---

#### Step 1.5: Build FHIR-to-SQL Loader
**Purpose**: Parse FHIR files and load into PostgreSQL

**File**: `scripts/mimic-fhir-to-sql.ts`

**Process Flow**:
1. Read each FHIR NDJSON.gz file
2. Decompress and parse line by line
3. Transform FHIR resource → SQL record
4. Insert into PostgreSQL with proper FK references
5. Handle dependencies (load patients before conditions)

**Loading Order** (respects foreign keys):
1. Patients (no dependencies)
2. Medications (no dependencies)
3. Encounters (depends on Patients)
4. Conditions (depends on Patients, Encounters)
5. Medication Administrations (depends on Patients, Medications, Encounters)
6. Procedures (depends on Patients, Encounters)
7. Observations (depends on Patients, Encounters)

**Validation**:
- [ ] Script runs without errors
- [ ] All 100 patients loaded
- [ ] Conditions linked to patients via FK
- [ ] Medications loaded
- [ ] Encounters loaded
- [ ] Foreign key constraints satisfied

---

#### Step 1.6: Verify SQL Database
**Purpose**: Ensure data loaded correctly with proper relationships

**Validation Queries**:
```sql
-- Check patient count
SELECT COUNT(*) FROM patients;  -- Expected: 100

-- Check conditions count
SELECT COUNT(*) FROM conditions;

-- Check FK integrity (should return all conditions)
SELECT c.*
FROM conditions c
INNER JOIN patients p ON c.patient_id = p.id;

-- Verify foreign keys exist in schema
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

**Expected Results**:
- [ ] 100 patients
- [ ] Multiple conditions per patient
- [ ] All FKs resolve correctly
- [ ] No orphaned records

---

### Phase 2: Schema Discovery (LLM-Driven)

#### Step 2.1: Configure Schema Discovery Agent
**Purpose**: Set up LLM to analyze SQL database metadata

**Environment Variables**:
```bash
export TEST_DATABASE_URL="postgresql://postgres:test@localhost:5432/mimic_fhir"
export AZURE_OPENAI_KEY="your-key"
export AZURE_OPENAI_DEPLOYMENT="gpt-4o"
export AZURE_OPENAI_INSTANCE_NAME="arthur-health"
```

**Files Used**:
- `lib/graphrag/synapse-schema-reader.ts` (modified for PostgreSQL)
- `lib/graphrag/schema-discovery-agent.ts` (LLM analyzer)
- `scripts/discover-schema.ts` (execution script)

**Validation**:
- [ ] Can connect to PostgreSQL
- [ ] Can read INFORMATION_SCHEMA
- [ ] LLM API key works

---

#### Step 2.2: Modify Schema Reader for PostgreSQL
**Purpose**: Adapt Synapse schema reader to work with PostgreSQL

**File**: `lib/graphrag/synapse-schema-reader.ts`

**Changes Needed**:
1. Use `pg` library instead of `tedious`
2. Adjust metadata queries for PostgreSQL syntax
3. Keep same output interface

**PostgreSQL Metadata Queries**:
```sql
-- Get all tables
SELECT table_name, table_schema
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';

-- Get columns for a table
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'patients';

-- Get foreign keys
SELECT
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table,
  ccu.column_name AS foreign_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'conditions';
```

**Validation**:
- [ ] Can read all tables
- [ ] Can read columns with data types
- [ ] Can extract foreign keys
- [ ] Can identify primary keys
- [ ] Can get row counts

---

#### Step 2.3: Run Schema Discovery
**Purpose**: Let LLM analyze SQL metadata and discover entities/relationships

**Command**:
```bash
npx tsx scripts/discover-schema.ts
```

**What the LLM Should Discover**:

**Core Entities** (from table analysis):
- Patient (from `patients` table)
- Condition (from `conditions` table)
- Medication (from `medications` table)
- Encounter (from `encounters` table)
- Procedure (from `procedures` table)
- Observation (from `observations` table)

**Explicit Relationships** (from foreign keys):
- (Patient)-[:HAS_CONDITION]->(Condition) - FK: conditions.patient_id → patients.id
- (Patient)-[:HAD_ENCOUNTER]->(Encounter) - FK: encounters.patient_id → patients.id
- (Patient)-[:RECEIVED_MEDICATION]->(Medication) - FK: medication_administrations.patient_id
- (Patient)-[:HAD_PROCEDURE]->(Procedure) - FK: procedures.patient_id → patients.id
- (Patient)-[:HAS_OBSERVATION]->(Observation) - FK: observations.patient_id → patients.id

**Inferred Relationships** (from patterns):
- (Condition)-[:DIAGNOSED_DURING]->(Encounter) - FK: conditions.encounter_id
- (Medication)-[:ADMINISTERED_DURING]->(Encounter) - FK: medication_administrations.encounter_id
- (Procedure)-[:PERFORMED_DURING]->(Encounter) - FK: procedures.encounter_id

**Temporal Patterns**:
- All tables have `created_at` timestamp
- Encounters have `encounter_period_start` and `encounter_period_end`
- Observations have `effective_datetime`

**Output Files**:
- [ ] `schema-discovery/schema-discovery-report-TIMESTAMP.md` (human review)
- [ ] `schema-discovery/neo4j-discovered-schema-TIMESTAMP.cypher` (DDL)
- [ ] `schema-discovery/schema-discovery-TIMESTAMP.json` (programmatic)

**Validation**:
- [ ] LLM discovered ≥6 core entities
- [ ] All foreign keys mapped to relationships
- [ ] Temporal patterns identified
- [ ] Neo4j DDL generated

---

#### Step 2.4: Review Discovery Results
**Purpose**: Human validation of LLM's discovered schema

**Review Checklist**:
- [ ] Are entity names meaningful? (Patient vs patients)
- [ ] Are relationships semantically correct?
- [ ] Are temporal properties identified?
- [ ] Are there any missed entities?
- [ ] Are there any spurious relationships?
- [ ] Does the Neo4j DDL look correct?

**Expected Quality Metrics**:
- **Precision**: >90% (few false positives)
- **Recall**: >85% (few missed entities/relationships)
- **Semantic Accuracy**: Relationships make domain sense

**If Issues Found**:
- Adjust LLM prompt in `schema-discovery-agent.ts`
- Provide more healthcare context
- Re-run discovery

---

### Phase 3: Knowledge Graph Construction

#### Step 3.1: Start Neo4j Database
**Purpose**: Create graph database to load discovered schema

**Commands**:
```bash
# Start Neo4j container
docker run --name mimic-neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password \
  -e NEO4J_PLUGINS='["apoc"]' \
  -d neo4j:5.15

# Wait for startup (30 seconds)
sleep 30

# Verify connection
docker exec -it mimic-neo4j cypher-shell -u neo4j -p password "RETURN 'Connected' as status;"
```

**Validation**:
- [ ] Neo4j container running
- [ ] Can access browser at http://localhost:7474
- [ ] Can connect via cypher-shell
- [ ] APOC plugin installed (for dynamic relationships)

---

#### Step 3.2: Execute Discovered Schema DDL
**Purpose**: Create constraints and indexes in Neo4j based on discovered schema

**Commands**:
```bash
# Apply discovered schema
docker exec -i mimic-neo4j cypher-shell -u neo4j -p password < \
  schema-discovery/neo4j-discovered-schema-TIMESTAMP.cypher
```

**Expected DDL** (example):
```cypher
-- Constraints
CREATE CONSTRAINT patient_id IF NOT EXISTS FOR (p:Patient) REQUIRE p.id IS UNIQUE;
CREATE CONSTRAINT condition_id IF NOT EXISTS FOR (c:Condition) REQUIRE c.id IS UNIQUE;
CREATE CONSTRAINT medication_id IF NOT EXISTS FOR (m:Medication) REQUIRE m.id IS UNIQUE;

-- Indexes
CREATE INDEX patient_identifier IF NOT EXISTS FOR (p:Patient) ON (p.mimic_identifier);
CREATE INDEX condition_code IF NOT EXISTS FOR (c:Condition) ON (c.icd9_code);
CREATE INDEX medication_name IF NOT EXISTS FOR (m:Medication) ON (m.medication_name);

-- Temporal indexes
CREATE INDEX patient_created IF NOT EXISTS FOR (p:Patient) ON (p.createdAt);
CREATE INDEX encounter_period IF NOT EXISTS FOR (e:Encounter) ON (e.encounter_period_start);
```

**Validation**:
- [ ] All constraints created
- [ ] All indexes created
- [ ] No errors in DDL execution

---

#### Step 3.3: Load Data from SQL to Neo4j
**Purpose**: Transform relational data into graph nodes and relationships

**File**: `scripts/load-mimic-to-neo4j.ts`

**Loading Process**:
1. Query PostgreSQL for entities
2. Create nodes in Neo4j
3. Query PostgreSQL for relationships (via FKs)
4. Create relationships in Neo4j

**Example Cypher**:
```cypher
// Create Patient nodes
MERGE (p:Patient {id: $id})
SET p.mimic_identifier = $mimic_identifier,
    p.familyName = $family_name,
    p.gender = $gender,
    p.birthDate = date($birth_date),
    p.createdAt = datetime($created_at);

// Create Condition nodes and relationships
MATCH (p:Patient {id: $patient_id})
MERGE (c:Condition {id: $condition_id})
SET c.icd9_code = $icd9_code,
    c.display = $display_name,
    c.category = $category
MERGE (p)-[:HAS_CONDITION]->(c);
```

**Validation**:
- [ ] All patients loaded as nodes
- [ ] All conditions loaded as nodes
- [ ] Relationships created correctly
- [ ] No orphaned nodes
- [ ] FK relationships preserved in graph

---

#### Step 3.4: Verify Graph Structure
**Purpose**: Ensure graph matches expected schema

**Verification Queries**:
```cypher
// Count nodes by type
MATCH (n) RETURN labels(n) AS type, count(*) AS count;

// Verify Patient nodes
MATCH (p:Patient) RETURN count(p);  // Expected: 100

// Verify relationships
MATCH (p:Patient)-[r]->()
RETURN type(r) AS relationship, count(*) AS count
ORDER BY count DESC;

// Check for orphaned nodes
MATCH (n)
WHERE NOT (n)--()
RETURN labels(n), count(n);  // Expected: 0 (or only Medication nodes)

// Sample patient with all connections
MATCH (p:Patient {mimic_identifier: '10007795'})
OPTIONAL MATCH (p)-[r1:HAS_CONDITION]->(c:Condition)
OPTIONAL MATCH (p)-[r2:RECEIVED_MEDICATION]->(m:Medication)
OPTIONAL MATCH (p)-[r3:HAD_ENCOUNTER]->(e:Encounter)
RETURN p, collect(DISTINCT c) as conditions,
       collect(DISTINCT m) as medications,
       collect(DISTINCT e) as encounters;
```

**Expected Results**:
- [ ] 100 Patient nodes
- [ ] Multiple Condition nodes
- [ ] Multiple Medication nodes
- [ ] Multiple Encounter nodes
- [ ] HAS_CONDITION relationships exist
- [ ] RECEIVED_MEDICATION relationships exist
- [ ] HAD_ENCOUNTER relationships exist

---

### Phase 4: Validation & Testing

#### Step 4.1: Test Text2Cypher Queries
**Purpose**: Verify natural language queries work correctly

**Configure Text2Cypher**:
```bash
export NEO4J_URI="bolt://localhost:7687"
export NEO4J_USERNAME="neo4j"
export NEO4J_PASSWORD="password"
```

**Test Queries**:
```bash
# Query 1: Simple entity count
curl -X POST http://localhost:3000/api/graphrag/query \
  -H "Content-Type: application/json" \
  -d '{"question": "How many patients are in the database?"}'

# Query 2: Relationship traversal
curl -X POST http://localhost:3000/api/graphrag/query \
  -H "Content-Type: application/json" \
  -d '{"question": "Which patients have diabetes?"}'

# Query 3: Complex pattern
curl -X POST http://localhost:3000/api/graphrag/query \
  -H "Content-Type: application/json" \
  -d '{"question": "Show me patients with multiple chronic conditions"}'

# Query 4: Temporal query
curl -X POST http://localhost:3000/api/graphrag/query \
  -H "Content-Type: application/json" \
  -d '{"question": "Which patients had encounters in the last 30 days?"}'
```

**Expected Results**:
- [ ] LLM generates valid Cypher
- [ ] Queries execute without errors
- [ ] Results are accurate
- [ ] Natural language answers are coherent

**Validation Metrics**:
- **Query Success Rate**: >90%
- **Average Response Time**: <3 seconds
- **Cypher Syntax Accuracy**: 100%

---

#### Step 4.2: Test Pattern Detection (Gap Detection)
**Purpose**: Identify missing relationships or anomalies in data

**Example Pattern Queries**:
```cypher
// Pattern 1: Patients with conditions but no medications
MATCH (p:Patient)-[:HAS_CONDITION]->(c:Condition)
WHERE NOT (p)-[:RECEIVED_MEDICATION]->()
RETURN p.mimic_identifier, c.display
LIMIT 10;

// Pattern 2: Patients with multiple encounters but no procedures
MATCH (p:Patient)-[:HAD_ENCOUNTER]->(e:Encounter)
WITH p, count(e) as encounter_count
WHERE encounter_count > 3
  AND NOT (p)-[:HAD_PROCEDURE]->()
RETURN p.mimic_identifier, encounter_count;

// Pattern 3: Temporal gaps (encounters without observations)
MATCH (e:Encounter)<-[:HAD_ENCOUNTER]-(p:Patient)
WHERE NOT (p)-[:HAS_OBSERVATION]->(:Observation)
      -[:OBSERVED_DURING]->(e)
RETURN p.mimic_identifier, e.encounter_period_start
LIMIT 10;

// Pattern 4: Orphaned medications (not administered)
MATCH (m:Medication)
WHERE NOT (m)<-[:RECEIVED_MEDICATION]-()
RETURN m.medication_name, m.ndc_code;
```

**Validation**:
- [ ] Patterns execute correctly
- [ ] Results are meaningful
- [ ] Can identify data quality issues
- [ ] Gap detection API works

---

#### Step 4.3: Benchmark Performance
**Purpose**: Measure system performance with real data

**Metrics to Collect**:
1. **Schema Discovery Time**: How long to analyze SQL → discover schema
2. **Graph Loading Time**: How long to load 100 patients + relationships
3. **Query Response Time**: Average time for Text2Cypher queries
4. **LLM API Cost**: Token usage for discovery + queries
5. **Graph Size**: Node count, relationship count, storage size

**Benchmark Script**:
```typescript
// scripts/benchmark-mvp.ts
const metrics = {
  schemaDiscoveryTime: 0,
  graphLoadingTime: 0,
  queryResponseTimes: [],
  llmTokensUsed: 0,
  graphSize: { nodes: 0, relationships: 0 }
};

// Run comprehensive benchmark
// Output results to benchmark-reports/mvp-TIMESTAMP.json
```

**Expected Performance** (100 patients):
- Schema Discovery: <2 minutes
- Graph Loading: <5 minutes
- Query Response: <3 seconds average
- Total LLM Cost: <$1

**Validation**:
- [ ] Benchmark completes successfully
- [ ] Performance metrics collected
- [ ] Results documented in report

---

#### Step 4.4: Document Findings
**Purpose**: Create comprehensive report of MVP results

**Report Structure**:
```markdown
# MVP Validation Report - MIMIC-IV FHIR

## Executive Summary
- ✅ Schema discovery successful
- ✅ Knowledge graph constructed
- ✅ Text2Cypher working
- ✅ Pattern detection functional

## Test Results

### Schema Discovery
- Entities discovered: 6 (Patient, Condition, Medication, Encounter, Procedure, Observation)
- Relationships discovered: 8
- Foreign keys mapped: 100%
- Temporal patterns identified: Yes

### Knowledge Graph
- Nodes created: [count]
- Relationships created: [count]
- Constraints: [count]
- Indexes: [count]

### Query Performance
- Queries tested: 10
- Success rate: 95%
- Average response time: 2.3s
- LLM cost: $0.45

### Patterns Detected
- Missing medication links: 5 patients
- Temporal gaps: 3 encounters
- Data quality issues: 2 found

## Architecture Validation

✅ **Validated**:
1. LLM can discover entities from SQL metadata
2. Foreign keys successfully map to relationships
3. Hybrid extraction pattern works
4. Text2Cypher generates accurate queries
5. Pattern detection identifies gaps

## Lessons Learned
[Document issues encountered and solutions]

## Recommendations for Production
[Scale-up considerations for Synapse deployment]
```

**Validation**:
- [ ] Report completed
- [ ] All metrics documented
- [ ] Screenshots included
- [ ] Lessons learned captured

---

## 📊 Success Criteria

### Must Pass (MVP Validation)
- [x] ✅ PostgreSQL database populated with MIMIC-IV data
- [ ] ✅ LLM discovers ≥5 entities from SQL metadata
- [ ] ✅ All foreign keys mapped to graph relationships
- [ ] ✅ Neo4j graph created with discovered schema
- [ ] ✅ Text2Cypher answers ≥8/10 test queries correctly
- [ ] ✅ Can identify ≥3 patterns/gaps in the data
- [ ] ✅ Complete documentation created

### Nice to Have (Bonus)
- [ ] Hybrid extraction tested (if clinical notes available)
- [ ] Incremental update tested (add new patient → graph updates)
- [ ] Performance optimized (query response <2s)
- [ ] Cost analysis completed

---

## 🚫 Known Limitations (MVP Scope)

**What This MVP Does NOT Validate**:
1. ❌ Production-scale performance (millions of records)
2. ❌ Real-time CDC from Synapse
3. ❌ HIPAA compliance workflows
4. ❌ High-availability deployment
5. ❌ Security hardening
6. ❌ Healthcare-specific gap algorithms
7. ❌ Multi-tenant architecture

**These will be addressed in production implementation.**

---

## 🔄 Reusability for Other Industries

### Architecture Pattern Applies To:
- ✅ **E-commerce**: Products, Orders, Customers, Inventory
- ✅ **Finance**: Accounts, Transactions, Customers, Portfolios
- ✅ **Manufacturing**: Products, Parts, Suppliers, Orders
- ✅ **Real Estate**: Properties, Agents, Clients, Transactions
- ✅ **Education**: Students, Courses, Instructors, Grades

### Steps Remain the Same:
1. Load domain data into SQL database
2. LLM discovers domain entities/relationships from SQL metadata
3. Create knowledge graph in Neo4j
4. Query graph with natural language
5. Detect domain-specific patterns

**Only domain-specific parts change**:
- SQL schema structure
- Entity/relationship semantics
- Pattern detection queries
- Use case examples

---

## 📝 Next Steps After MVP

### If MVP Successful:
1. **Scale Testing**: Test with larger MIMIC dataset (if available)
2. **Synapse Integration**: Adapt to read from Azure Synapse
3. **Production Deployment**: Azure infrastructure setup
4. **Security Hardening**: HIPAA compliance, encryption, audit logs
5. **Performance Optimization**: Caching, query optimization
6. **Team Training**: Handoff documentation

### If MVP Identifies Issues:
1. **Schema Discovery Issues**: Adjust LLM prompts, add domain context
2. **Query Accuracy Issues**: Improve Text2Cypher prompts, add examples
3. **Performance Issues**: Optimize Cypher queries, add indexes
4. **Pattern Detection Issues**: Refine gap detection algorithms

---

## 📚 Related Documentation

- `HYBRID_ARCHITECTURE_SUMMARY.md` - Architecture overview
- `TEXT2CYPHER_IMPROVEMENTS.md` - LangChain best practices
- `GRAPHRAG_SUMMARY.md` - GraphRAG implementation guide
- `IMPLEMENTATION_STATUS.md` - Current implementation status

---

## 🎯 Final Checklist Before Production

- [ ] MVP validation complete
- [ ] All success criteria met
- [ ] Documentation updated
- [ ] Lessons learned captured
- [ ] Architecture validated on real data
- [ ] Performance benchmarks documented
- [ ] Reusability confirmed for other domains
- [ ] Team trained on implementation process
- [ ] Production roadmap defined

---

**Last Updated**: January 13, 2025
**Status**: 🚧 Ready to Execute Phase 1
**Next Action**: Start PostgreSQL and create FHIR parser
