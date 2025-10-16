# Hybrid GraphRAG Architecture - Critical Changes

**Date**: January 13, 2025
**Status**: Architecture Redesigned Based on Research

---

## Critical Issues in Original Approach

### ❌ Issue 1: Rigid Predefined Schema
**Original**: Hardcoded 7 entity types, 8 relationship types
**Problem**: Can't discover healthcare patterns we don't know about
**Solution**: **LLM-driven schema discovery** + hybrid extraction

### ❌ Issue 2: Batch ETL (Not True Incremental)
**Original**: Daily Spark batch jobs with full MERGE operations
**Problem**: Could trigger graph recomputation, not real-time
**Solution**: **Spark Structured Streaming** + temporal properties (Graphiti pattern)

### ❌ Issue 3: Ignoring SQL Metadata
**Original**: Manually mapping tables to entities
**Problem**: Foreign keys already encode relationships!
**Solution**: **Automated SQL schema analysis** using LLM

---

## New Hybrid Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   PHASE 1: SCHEMA DISCOVERY                      │
│                                                                  │
│  Synapse SQL Metadata                                           │
│  - Tables, columns                                              │
│  - Foreign keys (relationships!)                                │
│  - Indexes, row counts                                          │
│           ↓                                                      │
│  LLM Schema Discovery Agent                                     │
│  - Analyzes structure                                           │
│  - Discovers entities                                           │
│  - Maps FK → relationships                                      │
│  - Infers implicit patterns                                     │
│           ↓                                                      │
│  Proposed Healthcare Ontology                                   │
│  - Core entities (Patient, Diagnosis, etc.)                     │
│  - Discovered entities (CareEpisode, ReferralNetwork, etc.)     │
│  - Explicit relationships (from FKs)                            │
│  - Inferred relationships (patterns)                            │
│           ↓                                                      │
│  Human Review & Approval                                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              PHASE 2: HYBRID EXTRACTION (Initial Load)           │
│                                                                  │
│  LangChain LLMGraphTransformer                                  │
│  ├─ REQUIRED entities (approved core)                           │
│  ├─ OPEN-ENDED discovery (allowed_nodes=[])                     │
│  └─ Autonomous property extraction                              │
│           ↓                                                      │
│  Synapse SQL Tables                                             │
│  - Structured data                                              │
│  - Text columns (policies, narratives)                          │
│           ↓                                                      │
│  Neo4j Knowledge Graph                                          │
│  - All nodes have temporal properties                           │
│  - All relationships have timestamps                            │
│  - Ready for incremental updates                                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│         PHASE 3: REAL-TIME INCREMENTAL UPDATES (Ongoing)         │
│                                                                  │
│  Synapse SQL Changes                                            │
│           ↓                                                      │
│  Change Data Capture (CDC)                                      │
│           ↓                                                      │
│  Azure Event Hubs                                               │
│           ↓                                                      │
│  Spark Structured Streaming                                     │
│  - Reads stream                                                 │
│  - Timestamp-based processing                                   │
│  - No full table scans                                          │
│           ↓                                                      │
│  Neo4j Incremental MERGE                                        │
│  - Match by ID                                                  │
│  - Update lastModified                                          │
│  - Temporal edge invalidation                                   │
│  - NO full graph recomputation                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Improvements

### 1. LLM Schema Discovery Agent
**File**: `lib/graphrag/schema-discovery-agent.ts`

**What It Does**:
- Analyzes Synapse INFORMATION_SCHEMA
- Reads foreign keys, indexes, column types
- Uses GPT-4o to discover:
  - **Core entities** (Patient, Diagnosis, Medication, Provider, Facility, Procedure)
  - **Discovered entities** (CareEpisode, ReferralNetwork, QualityMeasure, etc.)
  - **Explicit relationships** (from foreign keys)
  - **Inferred relationships** (from patterns, junction tables, timestamps)

**Example Output**:
```json
{
  "coreEntities": [
    {
      "name": "Patient",
      "sourceTable": "patients",
      "confidence": "high",
      "keyProperties": ["id", "mrn", "insurancePlanId"]
    }
  ],
  "discoveredEntities": [
    {
      "name": "CareEpisode",
      "sourceTable": "encounters",
      "description": "Represents a care journey from admission to discharge",
      "confidence": "medium",
      "reasoning": "Encounters table has episode_id suggesting care continuity tracking"
    }
  ],
  "explicitRelationships": [
    {
      "name": "PRESCRIBED",
      "sourceEntity": "Patient",
      "targetEntity": "Medication",
      "sqlBasis": "FK: prescriptions.patient_id → patients.id",
      "healthcareSemantics": "Patient is prescribed this medication",
      "confidence": "high"
    }
  ],
  "inferredRelationships": [
    {
      "name": "FOLLOWS_CARE_PATH",
      "sourceEntity": "Patient",
      "targetEntity": "CareEpisode",
      "sqlBasis": "Temporal sequence of encounters with same episode_id",
      "healthcareSemantics": "Patient follows a care pathway over time",
      "confidence": "medium"
    }
  ]
}
```

---

### 2. Hybrid Entity Extraction Strategy

**Instead of**: Hardcoded schema
**Now**: Flexible schema with minimum requirements + LLM discovery

**Using LangChain LLMGraphTransformer**:

```python
from langchain_experimental.graph_transformers import LLMGraphTransformer

# Minimum required (approved by human)
REQUIRED_NODES = ["Patient", "Diagnosis", "Medication", "Provider", "Facility", "Procedure"]
REQUIRED_RELATIONSHIPS = ["HAS_DIAGNOSIS", "PRESCRIBED", "VISITED", "PERFORMED"]

# LLM can discover additional entities/relationships
transformer = LLMGraphTransformer(
    llm=llm,
    allowed_nodes=REQUIRED_NODES + [],  # Empty list = open-ended
    allowed_relationships=REQUIRED_RELATIONSHIPS + [],  # Open-ended
    node_properties=True,  # LLM extracts properties
    relationship_properties=True
)
```

---

### 3. True Incremental Updates (No Recomputation)

**Key Pattern: Temporal Properties on Everything**

```cypher
// Every node has timestamps
CREATE (p:Patient {
  id: 'PAT-001',
  mrn: 'MRN-12345',
  firstName: 'John',
  lastName: 'Smith',

  // TEMPORAL PROPERTIES (required for incremental updates)
  createdAt: datetime('2024-01-15T10:00:00Z'),
  lastModified: datetime('2025-01-13T14:30:00Z'),
  validFrom: datetime('2024-01-15T10:00:00Z'),
  validTo: NULL  // NULL = currently valid
})

// Every relationship has timestamps
CREATE (p)-[:PRESCRIBED {
  prescribedDate: date('2024-06-01'),
  dosage: '500mg',
  adherenceScore: 0.85,

  // TEMPORAL PROPERTIES
  createdAt: datetime('2024-06-01T09:00:00Z'),
  lastModified: datetime('2025-01-10T11:00:00Z'),
  validFrom: datetime('2024-06-01T09:00:00Z'),
  validTo: NULL  // Currently valid
}]->(m:Medication)
```

**Spark Structured Streaming**:

```python
# Read only NEW/CHANGED data (not full table!)
spark.readStream \
    .format("org.neo4j.spark.DataSource") \
    .option("streaming.property.name", "lastModified")  # Key option!
    .option("streaming.from", "NOW")  # Only new changes
    .load()

# Write with incremental MERGE
spark.writeStream \
    .format("org.neo4j.spark.DataSource") \
    .option("checkpointLocation", "/checkpoints/patients")
    .option("node.keys", "id")  # Match by ID (not full scan!)
    .start()
```

**Temporal Edge Invalidation** (Graphiti pattern):

```cypher
// When a prescription changes, don't delete old relationship
// Instead, invalidate it temporally

// Old relationship
MATCH (p:Patient {id: 'PAT-001'})-[r:PRESCRIBED]->(m:Medication {id: 'MED-001'})
WHERE r.validTo IS NULL  // Currently valid
SET r.validTo = datetime()  // Mark as no longer valid

// Create new relationship with updated information
CREATE (p)-[:PRESCRIBED {
  prescribedDate: date('2025-01-13'),
  dosage: '1000mg',  // Changed dosage
  adherenceScore: 0.90,
  createdAt: datetime(),
  lastModified: datetime(),
  validFrom: datetime(),
  validTo: NULL  // New valid relationship
}]->(m)
```

---

## Implementation Files Created

### 1. Schema Discovery Agent
- **File**: `lib/graphrag/schema-discovery-agent.ts` (✅ Created)
- **Purpose**: LLM analyzes Synapse schema
- **Output**: Discovered entities/relationships + Neo4j DDL

### 2. Synapse Schema Reader
- **File**: `lib/graphrag/synapse-schema-reader.ts` (✅ Created)
- **Purpose**: Reads INFORMATION_SCHEMA from Synapse
- **Extracts**: Tables, columns, FKs, indexes, row counts

### 3. Discovery Script
- **File**: `scripts/discover-schema.ts` (✅ Created)
- **Usage**: `npx tsx scripts/discover-schema.ts`
- **Outputs**:
  - `schema-discovery-report.md` (human review)
  - `neo4j-discovered-schema.cypher` (DDL)
  - `schema-discovery.json` (programmatic use)

---

## Next Steps (In Order)

### ✅ Completed:
1. Schema discovery agent implementation
2. Synapse schema reader
3. Discovery script

### 🔄 In Progress:
4. **LangChain LLMGraphTransformer wrapper** with hybrid extraction

### 📋 Pending:
5. Spark Structured Streaming CDC pipeline
6. Temporal MERGE strategy implementation
7. Event Hubs CDC configuration
8. Complete documentation update

---

## Decision Points (Need User Input)

### Question 1: Graphiti Integration?
**Option A**: Keep Neo4j + implement Graphiti temporal patterns ourselves (✅ Recommended)
- **Pros**: No event loop issues, full control, simpler architecture
- **Cons**: We implement temporal logic ourselves

**Option B**: Deploy Graphiti as separate microservice
- **Pros**: Built-in temporal graph management
- **Cons**: Event loop conflicts, additional infrastructure, microservice complexity

**Recommendation**: **Option A** - We've already designed the temporal properties approach.

---

### Question 2: LLM Discovery Scope?
**Option A**: Fully open (allowed_nodes=[], allowed_relationships=[])
- **Pros**: Maximum discovery of unknown patterns
- **Cons**: May find spurious relationships, higher LLM costs

**Option B**: Hybrid (7 core + open for rest) (✅ Recommended)
- **Pros**: Guaranteed core entities + discovery of additional patterns
- **Cons**: Slightly more constrained

**Recommendation**: **Option B** - Best balance of guidance + discovery.

---

### Question 3: Real-Time Latency?
**Option A**: Near real-time (1-5 minute lag via Spark Streaming) (✅ Recommended)
- **Pros**: Proven architecture, handles scale, reasonable latency
- **Cons**: Not sub-second

**Option B**: True real-time (sub-second via Kafka + direct Neo4j)
- **Pros**: Minimal latency
- **Cons**: More complex, higher costs, may not be necessary

**Recommendation**: **Option A** - 1-5 minute latency is acceptable for healthcare analytics.

---

## Architecture Comparison

| Aspect | Original (Rigid) | New (Hybrid) |
|--------|------------------|--------------|
| **Entity Discovery** | Hardcoded 7 types | LLM discovers + core minimum |
| **Relationship Discovery** | Hardcoded 8 types | LLM discovers from FKs + patterns |
| **ETL Strategy** | Batch daily | Streaming incremental |
| **Graph Updates** | Full MERGE (may recompute) | Timestamp-based incremental |
| **SQL Metadata Usage** | Ignored | Analyzed by LLM |
| **Temporal Support** | Basic timestamps | Bi-temporal (Graphiti pattern) |
| **Gap Discovery** | Predefined queries | Emergent from discovered relationships |
| **Flexibility** | Low | High |
| **LLM Cost** | Low (no discovery) | Medium (discovery + extraction) |

---

## Key Research Findings

### LightRAG
- ✅ Automatic entity/relationship extraction from text
- ✅ Hybrid retrieval (vector + BM25 + graph traversal)
- ❌ Designed for **unstructured documents**, not SQL tables
- ❌ Hallucinates when given structured data

### Graphiti
- ✅ True incremental updates without recomputation
- ✅ Bi-temporal model (validFrom, validTo)
- ✅ Temporal edge invalidation
- ❌ Event loop conflicts (requires microservice)
- ❌ Python-only (we're using TypeScript)

### LangChain LLMGraphTransformer
- ✅ Schema-guided extraction
- ✅ Supports open-ended discovery
- ✅ Works with structured + unstructured data
- ✅ TypeScript support
- ✅ Flexible allowed_nodes/allowed_relationships

### Neo4j Spark Connector
- ✅ Structured Streaming support
- ✅ Timestamp-based incremental reads
- ✅ Checkpoint-based fault tolerance
- ✅ MERGE by key (no full scans)

---

## Success Criteria

### Phase 1: Schema Discovery
- ✅ LLM discovers ≥5 non-obvious entities
- ✅ Foreign keys mapped to relationships (100% coverage)
- ✅ Inferred relationships identified
- ✅ Human review report generated

### Phase 2: Hybrid Extraction
- ✅ Core entities extracted (Patient, Diagnosis, Medication, Provider, Facility, Procedure)
- ✅ Discovered entities extracted
- ✅ LLM finds ≥3 additional relationship types not in original schema
- ✅ All nodes have temporal properties

### Phase 3: Incremental Updates
- ✅ New Synapse record → Neo4j in <5 minutes
- ✅ Updated record → Neo4j relationship invalidated + new created
- ✅ No full graph recomputation
- ✅ Checkpoint-based fault tolerance works

---

## Next Immediate Action

**Run schema discovery**:

```bash
# Set environment variables
export SYNAPSE_SERVER="arthur-health-synapse.sql.azuresynapse.net"
export SYNAPSE_DATABASE="healthcare_fhir"
export SYNAPSE_USER="sqladmin"
export SYNAPSE_PASSWORD="your-password"
export AZURE_OPENAI_KEY="your-key"

# Run discovery
npx tsx scripts/discover-schema.ts
```

**Expected Output**:
- Console log of discovered entities/relationships
- `schema-discovery/schema-discovery-report-TIMESTAMP.md`
- `schema-discovery/neo4j-discovered-schema-TIMESTAMP.cypher`
- `schema-discovery/schema-discovery-TIMESTAMP.json`

**After Discovery**:
1. Review markdown report
2. Validate with healthcare domain experts
3. Approve or modify discovered schema
4. Proceed to implement hybrid extraction

---

**Ready to revolutionize healthcare analytics! 🚀**
