# GraphRAG Implementation Guide for Arthur Health
**Recommended Solution: LangChain + Neo4j + Microsoft Synapse Integration**

## Executive Summary

This guide provides a complete implementation plan for integrating a production-ready GraphRAG system with Arthur Health's Microsoft Synapse database. The solution uses LangChain's Text2Cypher capabilities with Neo4j to enable natural language queries that identify gaps in healthcare delivery.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Why LangChain + Neo4j](#why-langchain--neo4j)
3. [How Natural Language Queries Work](#how-natural-language-queries-work)
4. [Synapse Integration Strategy](#synapse-integration-strategy)
5. [Healthcare Ontology Design](#healthcare-ontology-design)
6. [Implementation Roadmap](#implementation-roadmap)
7. [Code Examples](#code-examples)
8. [Production Deployment](#production-deployment)
9. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Microsoft Synapse Analytics                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Patients | Claims | Providers | Medications | Diagnoses │   │
│  └───────────────────────┬──────────────────────────────────┘   │
└────────────────────────┼─────────────────────────────────────────┘
                         │
                         ↓ (Azure Data Factory - Scheduled ETL)
┌────────────────────────────────────────────────────────────────┐
│              Azure Event Hubs (CDC Real-time Stream)           │
└───────────────────────┬────────────────────────────────────────┘
                        │
                        ↓ (Event Consumer Service)
┌────────────────────────────────────────────────────────────────┐
│         LangChain Graph Data Transformer & Validator           │
│  • Schema mapping                                              │
│  • Data validation                                             │
│  • Entity resolution                                           │
│  • Relationship inference                                      │
└───────────────────────┬────────────────────────────────────────┘
                        │
                        ↓ (Cypher Upsert Operations)
┌────────────────────────────────────────────────────────────────┐
│                    Neo4j Graph Database                        │
│                   (Azure Managed Instance)                     │
│  ┌──────────────────────────────────────────────────────┐     │
│  │ Healthcare Knowledge Graph                           │     │
│  │ • Patients → Diagnoses → Medications                 │     │
│  │ • Providers → Treatments → Outcomes                  │     │
│  │ • Claims → Coverage → Prior Authorizations           │     │
│  └──────────────────────────────────────────────────────┘     │
└───────────────────────┬────────────────────────────────────────┘
                        │
                        ↓ (Natural Language Query)
┌────────────────────────────────────────────────────────────────┐
│        Arthur AI Agent with LangChain Text2Cypher              │
│  ┌──────────────────────────────────────────────────────┐     │
│  │ 1. User asks: "Show patients with diabetes who       │     │
│  │    haven't seen an endocrinologist in 6 months"      │     │
│  │ 2. LLM converts to Cypher query                      │     │
│  │ 3. Execute on Neo4j                                  │     │
│  │ 4. Return structured results                         │     │
│  └──────────────────────────────────────────────────────┘     │
└───────────────────────┬────────────────────────────────────────┘
                        │
                        ↓ (Gap Analysis & Recommendations)
┌────────────────────────────────────────────────────────────────┐
│              Healthcare Gap Detection Engine                   │
│  • Care coordination gaps                                      │
│  • Medication adherence issues                                 │
│  • Missing preventive care                                     │
│  • Prior authorization bottlenecks                             │
│  • Cost optimization opportunities                             │
└────────────────────────────────────────────────────────────────┘
```

---

## Why LangChain + Neo4j

### Comparison with Alternatives

| Feature | LangChain+Neo4j | LightRAG | Graphiti | Current Mock |
|---------|-----------------|----------|----------|--------------|
| **NL to Graph Query** | ✅ Native Text2Cypher | ❌ Vector-only | ❌ LLM-based extraction | ❌ No graph |
| **Synapse Integration** | ✅ Azure native | ⚠️ Manual ETL | ⚠️ Manual ETL | N/A |
| **Real-time CDC** | ✅ Event Hubs | ✅ Incremental | ✅ Real-time | N/A |
| **Production Ready** | ✅ Battle-tested | ⚠️ New (2024) | ⚠️ Event loop issues | ❌ Mock only |
| **HIPAA Compliance** | ✅ Azure BAA | ⚠️ Requires work | ⚠️ Limited | N/A |
| **Learning Curve** | ✅ Low (existing) | Medium | High | N/A |
| **Healthcare Cases** | ✅ Extensive | ✅ Good | ✅ Good | N/A |
| **Your Codebase Fit** | ✅ Already using! | ❌ New framework | ❌ New framework | N/A |

### Key Advantages

1. **Native Text-to-Cypher Translation**
   - LangChain's `GraphCypherQAChain` automatically converts natural language to Cypher
   - No need to manually write graph queries
   - Example: "Show high-risk diabetic patients" → Cypher query generation

2. **Microsoft Azure Ecosystem Integration**
   - Neo4j available as Azure Managed Service
   - Azure Data Factory for ETL
   - Azure Event Hubs for real-time CDC
   - Azure OpenAI for LLM (HIPAA-compliant with BAA)

3. **Your Team Already Uses LangChain**
   - 20 files in codebase use `@langchain/anthropic`, `@langchain/openai`, `@langchain/langgraph`
   - Existing orchestrator can be extended
   - Minimal new technology adoption

4. **Production-Proven for Healthcare**
   - 1M+ weekly NPM downloads
   - Used by major health systems
   - Mature error handling and retry logic
   - Extensive documentation

---

## How Natural Language Queries Work

### The Text2Cypher Pipeline

```typescript
// User asks natural language question
const userQuestion = `
  Identify patients with Type 2 Diabetes who:
  1. Haven't visited an endocrinologist in the last 6 months
  2. Have HbA1c > 8.0
  3. Are not on insulin therapy
`;

// LangChain Text2Cypher Process:

// Step 1: Schema Retrieval
const graphSchema = await neo4jGraph.getSchema();
// Returns: Node types (Patient, Diagnosis, Provider, Medication)
//          Relationship types (HAS_DIAGNOSIS, PRESCRIBED, VISITED)

// Step 2: LLM Prompt Construction
const prompt = `
Given the graph schema:
${graphSchema}

Convert this question to Cypher:
${userQuestion}

Output only valid Cypher query.
`;

// Step 3: LLM Generates Cypher
const cypherQuery = `
MATCH (p:Patient)-[:HAS_DIAGNOSIS]->(d:Diagnosis {name: 'Type 2 Diabetes'})
WHERE NOT EXISTS {
  MATCH (p)-[:VISITED]->(prov:Provider {specialty: 'Endocrinology'})
  WHERE prov.lastVisit > datetime() - duration('P6M')
}
AND p.hba1c > 8.0
AND NOT EXISTS {
  MATCH (p)-[:PRESCRIBED]->(m:Medication)
  WHERE m.genericName CONTAINS 'insulin'
}
RETURN p.id, p.name, p.hba1c, p.lastVisit
`;

// Step 4: Execute Query
const results = await neo4jGraph.query(cypherQuery);

// Step 5: LLM Formats Response
const answer = `
Found 47 high-risk diabetic patients requiring intervention:

**Immediate Action Required:**
- 23 patients with HbA1c > 9.0 (Critical)
- 15 patients with last visit > 12 months (Very High Risk)
- 9 patients with recent ER visits (Acute Need)

**Recommended Actions:**
1. Schedule urgent endocrinologist appointments
2. Review and adjust medication regimens
3. Implement remote glucose monitoring
4. Enroll in diabetes management program

**Estimated Cost Impact:**
- Potential savings: $312,000 annually
- ROI: 4.2x through reduced ER visits and complications
`;
```

### Real Example in Code

```typescript
import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";
import { GraphCypherQAChain } from "langchain/chains/graph_qa/cypher";
import { ChatOpenAI } from "@langchain/openai";

// Initialize components
const graph = await Neo4jGraph.initialize({
  url: process.env.NEO4J_URI!,
  username: process.env.NEO4J_USERNAME!,
  password: process.env.NEO4J_PASSWORD!,
});

const model = new ChatOpenAI({
  temperature: 0,
  modelName: "gpt-4",
  azureOpenAIApiKey: process.env.AZURE_OPENAI_KEY,
  azureOpenAIApiInstanceName: "arthur-health",
  azureOpenAIApiDeploymentName: "gpt-4o",
});

const chain = GraphCypherQAChain.fromLLM({
  llm: model,
  graph: graph,
  returnDirect: false, // Let LLM format the answer
  verbose: true, // Log generated Cypher for debugging
});

// Execute natural language query
const response = await chain.call({
  query: "Show me patients with gaps in preventive care screenings"
});

console.log(response.text);
// Output: Formatted natural language response with actionable insights
```

---

## Synapse Integration Strategy

### Option 1: Scheduled ETL (Batch Processing)

**Best for: Initial data load, historical analysis**

```typescript
// Azure Data Factory Pipeline Configuration
{
  "name": "SynapseToNeo4j-DailySync",
  "activities": [
    {
      "name": "ExtractPatients",
      "type": "Copy",
      "inputs": [{
        "referenceName": "SynapsePatients",
        "type": "DatasetReference"
      }],
      "outputs": [{
        "referenceName": "AzureBlobPatients",
        "type": "DatasetReference"
      }],
      "typeProperties": {
        "source": {
          "type": "SqlDWSource",
          "sqlReaderQuery": `
            SELECT
              patient_id,
              first_name,
              last_name,
              date_of_birth,
              mrn,
              insurance_id,
              last_modified
            FROM healthcare.patients
            WHERE last_modified >= DATEADD(day, -1, GETDATE())
          `
        }
      }
    },
    {
      "name": "TransformToGraph",
      "type": "AzureFunction",
      "linkedServiceName": "ArthurHealthFunctions",
      "typeProperties": {
        "functionName": "TransformToNeo4jGraph",
        "method": "POST"
      }
    }
  ],
  "triggers": [{
    "name": "DailyTrigger",
    "type": "ScheduleTrigger",
    "typeProperties": {
      "recurrence": {
        "frequency": "Day",
        "interval": 1,
        "startTime": "2025-01-01T02:00:00Z"
      }
    }
  }]
}
```

### Option 2: Real-time CDC (Recommended for Production)

**Best for: Real-time gap detection, immediate interventions**

```typescript
// Event Hub Consumer for Real-time Updates
import { EventHubConsumerClient } from "@azure/event-hubs";
import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";

const consumerClient = new EventHubConsumerClient(
  "$Default",
  process.env.EVENTHUB_CONNECTION_STRING!,
  "synapse-cdc-hub"
);

const neo4jGraph = await Neo4jGraph.initialize({
  url: process.env.NEO4J_URI!,
  username: process.env.NEO4J_USERNAME!,
  password: process.env.NEO4J_PASSWORD!,
});

// Process CDC events
const subscription = consumerClient.subscribe({
  processEvents: async (events, context) => {
    for (const event of events) {
      const change = event.body as SynapseChange;

      switch (change.table) {
        case 'patients':
          await upsertPatientNode(neo4jGraph, change);
          break;
        case 'diagnoses':
          await upsertDiagnosisRelationship(neo4jGraph, change);
          break;
        case 'medications':
          await upsertMedicationRelationship(neo4jGraph, change);
          break;
      }

      // Update checkpoint
      await context.updateCheckpoint(event);
    }
  },
  processError: async (err, context) => {
    console.error(`Error from partition ${context.partitionId}:`, err);
  }
});

// Helper functions
async function upsertPatientNode(
  graph: Neo4jGraph,
  change: SynapseChange
) {
  const cypherQuery = `
    MERGE (p:Patient {id: $patientId})
    SET
      p.mrn = $mrn,
      p.firstName = $firstName,
      p.lastName = $lastName,
      p.dateOfBirth = datetime($dateOfBirth),
      p.lastUpdated = datetime()
    RETURN p
  `;

  await graph.query(cypherQuery, {
    patientId: change.data.patient_id,
    mrn: change.data.mrn,
    firstName: change.data.first_name,
    lastName: change.data.last_name,
    dateOfBirth: change.data.date_of_birth,
  });
}
```

### Data Flow Architecture

```
Microsoft Synapse
    │
    ├─→ Azure Data Factory (Daily Batch)
    │       ↓
    │   Transform Function
    │       ↓
    │   Neo4j Bulk Import
    │
    └─→ Change Data Capture (SQL CDC)
            ↓
        Azure Event Hubs
            ↓
        Event Consumer Service
            ↓
        Real-time Neo4j Updates
```

---

## Healthcare Ontology Design

### Core Node Types

```cypher
// Patient Node
CREATE CONSTRAINT patient_id IF NOT EXISTS
FOR (p:Patient) REQUIRE p.id IS UNIQUE;

CREATE (p:Patient {
  id: "PAT-001",
  mrn: "MRN123456",
  firstName: "John",
  lastName: "Smith",
  dateOfBirth: date("1975-06-15"),
  gender: "M",
  insuranceId: "INS-ABC123",
  riskScore: 75.5,
  lastVisit: datetime("2025-01-10T09:30:00"),
  createdAt: datetime(),
  updatedAt: datetime()
});

// Diagnosis Node
CREATE CONSTRAINT diagnosis_code IF NOT EXISTS
FOR (d:Diagnosis) REQUIRE d.icd10Code IS UNIQUE;

CREATE (d:Diagnosis {
  id: "DIAG-001",
  name: "Type 2 Diabetes Mellitus",
  icd10Code: "E11.9",
  category: "Endocrine",
  severity: "Moderate",
  chronicCondition: true
});

// Medication Node
CREATE CONSTRAINT medication_code IF NOT EXISTS
FOR (m:Medication) REQUIRE m.rxNormCode IS UNIQUE;

CREATE (m:Medication {
  id: "MED-001",
  brandName: "Metformin",
  genericName: "metformin hydrochloride",
  rxNormCode: "861004",
  dosage: "500mg",
  frequency: "twice daily",
  category: "Antidiabetic"
});

// Provider Node
CREATE CONSTRAINT provider_npi IF NOT EXISTS
FOR (pr:Provider) REQUIRE pr.npi IS UNIQUE;

CREATE (pr:Provider {
  id: "PROV-001",
  npi: "1234567890",
  firstName: "Jane",
  lastName: "Doe",
  specialty: "Endocrinology",
  facilityName: "City Medical Center",
  acceptsNewPatients: true
});

// Claim Node
CREATE (c:Claim {
  id: "CLM-001",
  claimNumber: "CLM-2025-001",
  serviceDate: date("2025-01-05"),
  amount: 450.00,
  status: "Approved",
  priorAuthRequired: false
});

// Prior Authorization Node
CREATE (pa:PriorAuthorization {
  id: "PA-001",
  status: "Approved",
  requestDate: date("2024-12-20"),
  approvalDate: date("2024-12-22"),
  validUntil: date("2025-06-22"),
  procedureCode: "99213"
});
```

### Core Relationships

```cypher
// Patient has Diagnosis
MATCH (p:Patient {id: "PAT-001"})
MATCH (d:Diagnosis {icd10Code: "E11.9"})
CREATE (p)-[:HAS_DIAGNOSIS {
  diagnosedDate: date("2020-03-15"),
  diagnosedBy: "PROV-002",
  active: true,
  lastReviewed: datetime("2025-01-10T09:30:00")
}]->(d);

// Patient prescribed Medication
MATCH (p:Patient {id: "PAT-001"})
MATCH (m:Medication {id: "MED-001"})
MATCH (pr:Provider {id: "PROV-001"})
CREATE (p)-[:PRESCRIBED {
  prescribedDate: date("2024-06-10"),
  prescribedBy: pr.id,
  dosage: "500mg twice daily",
  refillsRemaining: 5,
  lastFilled: date("2024-12-15"),
  adherenceScore: 0.85
}]->(m);

// Patient visited Provider
MATCH (p:Patient {id: "PAT-001"})
MATCH (pr:Provider {id: "PROV-001"})
CREATE (p)-[:VISITED {
  visitDate: datetime("2025-01-10T09:30:00"),
  visitType: "Follow-up",
  chiefComplaint: "Routine diabetes management",
  outcome: "Stable",
  nextVisitScheduled: date("2025-04-10")
}]->(pr);

// Claim for Service
MATCH (p:Patient {id: "PAT-001"})
MATCH (c:Claim {id: "CLM-001"})
MATCH (pr:Provider {id: "PROV-001"})
CREATE (p)-[:HAS_CLAIM]->(c)
CREATE (c)-[:PROVIDED_BY]->(pr);

// Prior Authorization for Procedure
MATCH (p:Patient {id: "PAT-001"})
MATCH (pa:PriorAuthorization {id: "PA-001"})
CREATE (p)-[:REQUIRES_PA]->(pa);
```

### Gap Detection Queries

```cypher
// Gap 1: Diabetic patients without endocrinologist visit in 6 months
MATCH (p:Patient)-[:HAS_DIAGNOSIS]->(d:Diagnosis)
WHERE d.name CONTAINS 'Diabetes'
AND NOT EXISTS {
  MATCH (p)-[v:VISITED]->(pr:Provider)
  WHERE pr.specialty = 'Endocrinology'
  AND v.visitDate > datetime() - duration('P6M')
}
RETURN
  p.id,
  p.firstName,
  p.lastName,
  p.lastVisit,
  'Missing endocrinologist visit' AS gap,
  'High' AS priority
ORDER BY p.riskScore DESC;

// Gap 2: Patients on medications with low adherence
MATCH (p:Patient)-[pr:PRESCRIBED]->(m:Medication)
WHERE pr.adherenceScore < 0.70
RETURN
  p.id,
  p.firstName,
  p.lastName,
  m.brandName,
  pr.adherenceScore,
  'Medication non-adherence' AS gap,
  CASE
    WHEN pr.adherenceScore < 0.50 THEN 'Critical'
    WHEN pr.adherenceScore < 0.70 THEN 'High'
    ELSE 'Moderate'
  END AS priority;

// Gap 3: Prior authorization expired without renewal
MATCH (p:Patient)-[:REQUIRES_PA]->(pa:PriorAuthorization)
WHERE pa.validUntil < date()
AND pa.status = 'Approved'
RETURN
  p.id,
  p.firstName,
  p.lastName,
  pa.procedureCode,
  pa.validUntil,
  'Expired prior authorization' AS gap,
  'High' AS priority;

// Gap 4: High-cost patients without care coordination
MATCH (p:Patient)-[:HAS_CLAIM]->(c:Claim)
WITH p, SUM(c.amount) AS totalCost
WHERE totalCost > 10000
AND NOT EXISTS {
  MATCH (p)-[:ENROLLED_IN]->(:CareProgram)
}
RETURN
  p.id,
  p.firstName,
  p.lastName,
  totalCost,
  'High-cost patient without care management' AS gap,
  'Critical' AS priority
ORDER BY totalCost DESC;
```

---

## Implementation Roadmap

### Phase 1: Infrastructure Setup (Week 1-2)

**Tasks:**
- [ ] Provision Neo4j on Azure (Enterprise tier for HIPAA)
- [ ] Configure Azure Data Factory
- [ ] Set up Azure Event Hubs for CDC
- [ ] Create Azure Key Vault for secrets
- [ ] Configure VNet and private endpoints
- [ ] Enable Azure AD authentication

**Deliverables:**
- Neo4j instance running with healthcare schema
- ADF pipelines configured but not running
- Event Hubs ready for CDC stream
- All credentials secured in Key Vault

### Phase 2: Schema & Data Migration (Week 3-4)

**Tasks:**
- [ ] Design complete healthcare ontology
- [ ] Create Cypher scripts for schema
- [ ] Build initial ETL from Synapse to Neo4j
- [ ] Validate data integrity
- [ ] Create indexes and constraints
- [ ] Optimize query performance

**Deliverables:**
- Complete Neo4j schema with constraints
- Initial data load (historical 2 years)
- Performance benchmarks documented
- Data quality validation report

### Phase 3: LangChain Integration (Week 5-7)

**Tasks:**
- [ ] Install LangChain dependencies
- [ ] Implement `GraphCypherQAChain`
- [ ] Create healthcare-specific prompt templates
- [ ] Build query validation layer
- [ ] Add error handling and retries
- [ ] Test natural language queries

**Code Structure:**
```
lib/
  graphrag/
    neo4j-client.ts       # Neo4j connection management
    text2cypher.ts        # LangChain Text2Cypher wrapper
    healthcare-schema.ts  # Schema definitions
    query-validator.ts    # Validate generated Cypher
    gap-detector.ts       # Healthcare gap detection logic
```

**Deliverables:**
- Working Text2Cypher pipeline
- 50+ validated healthcare queries
- Error handling for invalid queries
- Performance metrics (latency < 2s)

### Phase 4: Real-time CDC (Week 8-9)

**Tasks:**
- [ ] Enable CDC on Synapse tables
- [ ] Configure Event Hubs consumers
- [ ] Build graph update service
- [ ] Implement conflict resolution
- [ ] Add monitoring and alerts
- [ ] Test with high-volume data

**Deliverables:**
- Real-time graph updates (< 5s latency)
- CDC pipeline handling 1000+ events/sec
- Comprehensive error handling
- Monitoring dashboard

### Phase 5: Arthur AI Integration (Week 10-11)

**Tasks:**
- [ ] Integrate with existing orchestrator
- [ ] Add graph queries to AI agent tools
- [ ] Build gap analysis workflows
- [ ] Create recommendation engine
- [ ] Add explainability layer
- [ ] UI components for gap visualization

**Deliverables:**
- Arthur AI agent using graph queries
- Gap detection dashboard
- Automated recommendations
- Explainable AI trace logs

### Phase 6: Production Hardening (Week 12)

**Tasks:**
- [ ] Load testing (10K concurrent users)
- [ ] HIPAA compliance audit
- [ ] Penetration testing
- [ ] Disaster recovery plan
- [ ] Runbook documentation
- [ ] Team training

**Deliverables:**
- Production-ready system
- HIPAA compliance report
- Complete documentation
- Trained operations team

---

## Code Examples

### 1. Neo4j Client Setup

```typescript
// lib/graphrag/neo4j-client.ts
import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";
import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";

export class ArthurNeo4jClient {
  private graph: Neo4jGraph | null = null;
  private static instance: ArthurNeo4jClient;

  private constructor() {}

  static getInstance(): ArthurNeo4jClient {
    if (!ArthurNeo4jClient.instance) {
      ArthurNeo4jClient.instance = new ArthurNeo4jClient();
    }
    return ArthurNeo4jClient.instance;
  }

  async initialize() {
    if (this.graph) return this.graph;

    // Get credentials from Azure Key Vault
    const credential = new DefaultAzureCredential();
    const vaultUrl = process.env.AZURE_KEYVAULT_URL!;
    const secretClient = new SecretClient(vaultUrl, credential);

    const neo4jUri = await secretClient.getSecret("neo4j-uri");
    const neo4jUser = await secretClient.getSecret("neo4j-username");
    const neo4jPassword = await secretClient.getSecret("neo4j-password");

    this.graph = await Neo4jGraph.initialize({
      url: neo4jUri.value!,
      username: neo4jUser.value!,
      password: neo4jPassword.value!,
      database: "arthur-health",
    });

    console.log("✅ Neo4j connected successfully");
    return this.graph;
  }

  async query(cypherQuery: string, params?: Record<string, any>) {
    const graph = await this.initialize();
    return graph.query(cypherQuery, params);
  }

  async getSchema() {
    const graph = await this.initialize();
    return graph.getSchema();
  }

  async close() {
    if (this.graph) {
      await this.graph.close();
      this.graph = null;
    }
  }
}
```

### 2. Text2Cypher Integration

```typescript
// lib/graphrag/text2cypher.ts
import { GraphCypherQAChain } from "langchain/chains/graph_qa/cypher";
import { ChatOpenAI } from "@langchain/openai";
import { ArthurNeo4jClient } from "./neo4j-client";
import { PromptTemplate } from "@langchain/core/prompts";

export class HealthcareText2Cypher {
  private chain: GraphCypherQAChain | null = null;

  async initialize() {
    const neo4jClient = ArthurNeo4jClient.getInstance();
    const graph = await neo4jClient.initialize();

    const llm = new ChatOpenAI({
      temperature: 0,
      modelName: "gpt-4o",
      azureOpenAIApiKey: process.env.AZURE_OPENAI_KEY,
      azureOpenAIApiInstanceName: "arthur-health",
      azureOpenAIApiDeploymentName: "gpt-4o",
    });

    // Custom prompt for healthcare domain
    const cypherPrompt = PromptTemplate.fromTemplate(`
You are a healthcare data analyst converting natural language questions into Cypher queries for a Neo4j graph database.

Graph Schema:
{schema}

Healthcare Context:
- Patient: Contains demographic and risk information
- Diagnosis: ICD-10 coded conditions
- Medication: RxNorm coded drugs with adherence tracking
- Provider: Healthcare professionals with specialties
- Claim: Insurance claims with amounts and status
- PriorAuthorization: Prior auth tracking

Common Relationships:
- (Patient)-[:HAS_DIAGNOSIS]->(Diagnosis)
- (Patient)-[:PRESCRIBED]->(Medication)
- (Patient)-[:VISITED]->(Provider)
- (Patient)-[:HAS_CLAIM]->(Claim)

Question: {question}

Generate a valid Cypher query. Use proper WHERE clauses and RETURN statements.
IMPORTANT: Always include error handling for missing data.

Cypher Query:
`);

    this.chain = GraphCypherQAChain.fromLLM({
      llm: llm,
      graph: graph,
      cypherPrompt: cypherPrompt,
      returnDirect: false,
      verbose: process.env.NODE_ENV === 'development',
    });

    return this.chain;
  }

  async query(question: string): Promise<string> {
    const chain = await this.initialize();

    try {
      const response = await chain.call({ query: question });
      return response.text;
    } catch (error) {
      console.error("Text2Cypher query failed:", error);
      throw new Error(`Failed to process healthcare query: ${error}`);
    }
  }
}
```

### 3. Healthcare Gap Detector

```typescript
// lib/graphrag/gap-detector.ts
import { ArthurNeo4jClient } from "./neo4j-client";

export interface HealthcareGap {
  patientId: string;
  patientName: string;
  gapType: string;
  priority: 'Critical' | 'High' | 'Moderate' | 'Low';
  description: string;
  recommendedAction: string;
  estimatedCostImpact?: number;
}

export class HealthcareGapDetector {
  private neo4j: ArthurNeo4jClient;

  constructor() {
    this.neo4j = ArthurNeo4jClient.getInstance();
  }

  async detectAllGaps(): Promise<HealthcareGap[]> {
    const gaps: HealthcareGap[] = [];

    // Run all gap detection queries in parallel
    const [
      missingSpecialistVisits,
      medicationNonAdherence,
      expiredPriorAuths,
      highCostWithoutCoordination,
    ] = await Promise.all([
      this.detectMissingSpecialistVisits(),
      this.detectMedicationNonAdherence(),
      this.detectExpiredPriorAuthorizations(),
      this.detectHighCostWithoutCoordination(),
    ]);

    gaps.push(
      ...missingSpecialistVisits,
      ...medicationNonAdherence,
      ...expiredPriorAuths,
      ...highCostWithoutCoordination
    );

    return gaps;
  }

  async detectMissingSpecialistVisits(): Promise<HealthcareGap[]> {
    const query = `
      MATCH (p:Patient)-[:HAS_DIAGNOSIS]->(d:Diagnosis)
      WHERE d.name CONTAINS 'Diabetes'
      AND NOT EXISTS {
        MATCH (p)-[v:VISITED]->(pr:Provider)
        WHERE pr.specialty = 'Endocrinology'
        AND v.visitDate > datetime() - duration('P6M')
      }
      RETURN
        p.id AS patientId,
        p.firstName + ' ' + p.lastName AS patientName,
        p.riskScore AS riskScore,
        p.lastVisit AS lastVisit
      ORDER BY p.riskScore DESC
      LIMIT 100
    `;

    const results = await this.neo4j.query(query);

    return results.map((row: any) => ({
      patientId: row.patientId,
      patientName: row.patientName,
      gapType: 'Missing Specialist Care',
      priority: row.riskScore > 80 ? 'Critical' : 'High',
      description: `Diabetic patient has not seen endocrinologist in 6+ months (Risk Score: ${row.riskScore})`,
      recommendedAction: 'Schedule urgent endocrinologist appointment within 2 weeks',
      estimatedCostImpact: 2500, // Avg cost of ER visit prevented
    }));
  }

  async detectMedicationNonAdherence(): Promise<HealthcareGap[]> {
    const query = `
      MATCH (p:Patient)-[pr:PRESCRIBED]->(m:Medication)
      WHERE pr.adherenceScore < 0.70
      RETURN
        p.id AS patientId,
        p.firstName + ' ' + p.lastName AS patientName,
        m.brandName AS medication,
        pr.adherenceScore AS adherenceScore
      ORDER BY pr.adherenceScore ASC
      LIMIT 100
    `;

    const results = await this.neo4j.query(query);

    return results.map((row: any) => ({
      patientId: row.patientId,
      patientName: row.patientName,
      gapType: 'Medication Non-Adherence',
      priority: row.adherenceScore < 0.5 ? 'Critical' : 'High',
      description: `Patient adherence to ${row.medication} is only ${(row.adherenceScore * 100).toFixed(0)}%`,
      recommendedAction: 'Implement medication reminder system and counseling',
      estimatedCostImpact: 1800,
    }));
  }

  async detectExpiredPriorAuthorizations(): Promise<HealthcareGap[]> {
    const query = `
      MATCH (p:Patient)-[:REQUIRES_PA]->(pa:PriorAuthorization)
      WHERE pa.validUntil < date()
      AND pa.status = 'Approved'
      RETURN
        p.id AS patientId,
        p.firstName + ' ' + p.lastName AS patientName,
        pa.procedureCode AS procedureCode,
        pa.validUntil AS expiredDate
      ORDER BY pa.validUntil ASC
      LIMIT 100
    `;

    const results = await this.neo4j.query(query);

    return results.map((row: any) => ({
      patientId: row.patientId,
      patientName: row.patientName,
      gapType: 'Expired Prior Authorization',
      priority: 'High',
      description: `Prior authorization for ${row.procedureCode} expired on ${row.expiredDate}`,
      recommendedAction: 'Submit renewal request immediately to prevent service interruption',
      estimatedCostImpact: 0, // Prevents denial, no cost increase
    }));
  }

  async detectHighCostWithoutCoordination(): Promise<HealthcareGap[]> {
    const query = `
      MATCH (p:Patient)-[:HAS_CLAIM]->(c:Claim)
      WITH p, SUM(c.amount) AS totalCost
      WHERE totalCost > 10000
      AND NOT EXISTS {
        MATCH (p)-[:ENROLLED_IN]->(:CareProgram)
      }
      RETURN
        p.id AS patientId,
        p.firstName + ' ' + p.lastName AS patientName,
        totalCost
      ORDER BY totalCost DESC
      LIMIT 100
    `;

    const results = await this.neo4j.query(query);

    return results.map((row: any) => ({
      patientId: row.patientId,
      patientName: row.patientName,
      gapType: 'High-Cost Without Care Management',
      priority: 'Critical',
      description: `Patient has $${row.totalCost.toLocaleString()} in claims but no care coordination`,
      recommendedAction: 'Enroll in intensive care management program immediately',
      estimatedCostImpact: row.totalCost * 0.25, // 25% reduction typical
    }));
  }
}
```

### 4. API Endpoint Integration

```typescript
// app/api/graphrag/gaps/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { HealthcareGapDetector } from '@/lib/graphrag/gap-detector';
import { HealthcareText2Cypher } from '@/lib/graphrag/text2cypher';

export async function GET(request: NextRequest) {
  try {
    const detector = new HealthcareGapDetector();
    const gaps = await detector.detectAllGaps();

    return NextResponse.json({
      success: true,
      count: gaps.length,
      gaps: gaps,
      totalEstimatedSavings: gaps.reduce(
        (sum, gap) => sum + (gap.estimatedCostImpact || 0),
        0
      ),
    });
  } catch (error) {
    console.error('Gap detection failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to detect healthcare gaps' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();

    if (!question) {
      return NextResponse.json(
        { success: false, error: 'Question required' },
        { status: 400 }
      );
    }

    const text2cypher = new HealthcareText2Cypher();
    const answer = await text2cypher.query(question);

    return NextResponse.json({
      success: true,
      question: question,
      answer: answer,
    });
  } catch (error) {
    console.error('Text2Cypher query failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process query' },
      { status: 500 }
    );
  }
}
```

---

## Production Deployment

### Azure Infrastructure Setup

```yaml
# azure-infrastructure.yml (Azure Bicep template)
resource neo4jInstance 'Microsoft.Compute/virtualMachines@2023-03-01' = {
  name: 'arthur-health-neo4j'
  location: resourceGroup().location
  properties: {
    hardwareProfile: {
      vmSize: 'Standard_E4s_v3' // 4 vCPU, 32GB RAM
    }
    osProfile: {
      computerName: 'neo4j-vm'
      adminUsername: 'azureuser'
      linuxConfiguration: {
        disablePasswordAuthentication: true
        ssh: {
          publicKeys: [
            {
              path: '/home/azureuser/.ssh/authorized_keys'
              keyData: loadTextContent('~/.ssh/id_rsa.pub')
            }
          ]
        }
      }
    }
    storageProfile: {
      imageReference: {
        publisher: 'Canonical'
        offer: 'UbuntuServer'
        sku: '20.04-LTS'
        version: 'latest'
      }
      osDisk: {
        name: 'neo4j-os-disk'
        caching: 'ReadWrite'
        createOption: 'FromImage'
        managedDisk: {
          storageAccountType: 'Premium_LRS'
        }
      }
      dataDisks: [
        {
          name: 'neo4j-data-disk'
          diskSizeGB: 512
          lun: 0
          createOption: 'Empty'
          managedDisk: {
            storageAccountType: 'Premium_LRS'
          }
        }
      ]
    }
  }
}

resource eventHub 'Microsoft.EventHub/namespaces@2021-11-01' = {
  name: 'arthur-health-eventhub'
  location: resourceGroup().location
  sku: {
    name: 'Standard'
    tier: 'Standard'
    capacity: 2
  }
  properties: {
    isAutoInflateEnabled: true
    maximumThroughputUnits: 10
  }
}

resource dataFactory 'Microsoft.DataFactory/factories@2018-06-01' = {
  name: 'arthur-health-adf'
  location: resourceGroup().location
  identity: {
    type: 'SystemAssigned'
  }
}
```

### Docker Compose for Local Development

```yaml
# docker-compose.yml
version: '3.8'

services:
  neo4j:
    image: neo4j:5.15-enterprise
    container_name: arthur-neo4j
    ports:
      - "7474:7474"  # HTTP
      - "7687:7687"  # Bolt
    environment:
      - NEO4J_AUTH=neo4j/arthur-health-secure-password
      - NEO4J_dbms_memory_heap_max__size=4G
      - NEO4J_dbms_memory_pagecache_size=2G
      - NEO4J_ACCEPT_LICENSE_AGREEMENT=yes
    volumes:
      - ./neo4j/data:/data
      - ./neo4j/logs:/logs
      - ./neo4j/plugins:/plugins
    networks:
      - arthur-network

  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: arthur-health-app
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - NEO4J_URI=bolt://neo4j:7687
      - NEO4J_USERNAME=neo4j
      - NEO4J_PASSWORD=arthur-health-secure-password
      - AZURE_OPENAI_KEY=${AZURE_OPENAI_KEY}
    depends_on:
      - neo4j
    networks:
      - arthur-network

networks:
  arthur-network:
    driver: bridge
```

### Environment Variables

```bash
# .env.production
# Neo4j Configuration
NEO4J_URI=bolt://arthur-health-neo4j.azure.com:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=${KEYVAULT_SECRET:neo4j-password}
NEO4J_DATABASE=arthur-health

# Azure Configuration
AZURE_OPENAI_KEY=${KEYVAULT_SECRET:azure-openai-key}
AZURE_OPENAI_ENDPOINT=https://arthur-health.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_KEYVAULT_URL=https://arthur-health-kv.vault.azure.net/

# Event Hub Configuration
EVENTHUB_CONNECTION_STRING=${KEYVAULT_SECRET:eventhub-connection}
EVENTHUB_NAME=synapse-cdc-hub

# Synapse Configuration
SYNAPSE_ENDPOINT=https://arthur-health-synapse.sql.azuresynapse.net
SYNAPSE_DATABASE=healthcare_db
SYNAPSE_USERNAME=${KEYVAULT_SECRET:synapse-username}
SYNAPSE_PASSWORD=${KEYVAULT_SECRET:synapse-password}

# Application
NODE_ENV=production
LOG_LEVEL=info
```

---

## Monitoring & Maintenance

### Key Metrics to Monitor

```typescript
// lib/monitoring/graphrag-metrics.ts
import { AzureMonitorMetricPublisher } from '@azure/monitor-opentelemetry-exporter';

export class GraphRAGMetrics {
  private publisher: AzureMonitorMetricPublisher;

  constructor() {
    this.publisher = new AzureMonitorMetricPublisher({
      connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING!,
    });
  }

  async trackQueryLatency(duration: number, success: boolean) {
    await this.publisher.track({
      name: 'graphrag.query.latency',
      value: duration,
      timestamp: new Date(),
      properties: {
        success: success.toString(),
      },
    });
  }

  async trackGapsDetected(count: number, priority: string) {
    await this.publisher.track({
      name: 'graphrag.gaps.detected',
      value: count,
      timestamp: new Date(),
      properties: {
        priority: priority,
      },
    });
  }

  async trackSynapseSync(recordsProcessed: number, duration: number) {
    await this.publisher.track({
      name: 'graphrag.synapse.sync',
      value: recordsProcessed,
      timestamp: new Date(),
      properties: {
        duration: duration.toString(),
      },
    });
  }
}
```

### Alerts Configuration

```yaml
# Azure Monitor Alerts
alerts:
  - name: High Query Latency
    condition: graphrag.query.latency > 5000ms
    severity: Warning
    action: Send notification to #arthur-health-ops

  - name: Neo4j Connection Failed
    condition: neo4j.connection.status = 'Failed'
    severity: Critical
    action: Page on-call engineer

  - name: Synapse CDC Lag
    condition: graphrag.synapse.lag > 300s
    severity: Warning
    action: Send notification to #data-engineering

  - name: High Gap Detection Rate
    condition: graphrag.gaps.detected > 1000 per hour
    severity: Info
    action: Log for analysis
```

### Maintenance Checklist

**Daily:**
- [ ] Monitor query latency (target: < 2s)
- [ ] Check CDC lag (target: < 5s)
- [ ] Review error logs
- [ ] Verify gap detection runs

**Weekly:**
- [ ] Analyze query patterns
- [ ] Review and optimize slow Cypher queries
- [ ] Check Neo4j memory and disk usage
- [ ] Validate data consistency between Synapse and Neo4j

**Monthly:**
- [ ] Review and update healthcare ontology
- [ ] Analyze cost optimization opportunities
- [ ] Update LLM prompts based on user feedback
- [ ] Conduct security audit
- [ ] Review and optimize indexes

---

## Next Steps

1. **Review this guide** with your team and stakeholders
2. **Provision Azure infrastructure** (Neo4j, Event Hubs, Data Factory)
3. **Set up development environment** using Docker Compose
4. **Implement Phase 1** (Infrastructure Setup)
5. **Schedule weekly check-ins** to track progress

---

## Support Resources

- **LangChain Documentation**: https://python.langchain.com/docs/integrations/graphs/neo4j_cypher
- **Neo4j Documentation**: https://neo4j.com/docs/
- **Azure Data Factory**: https://learn.microsoft.com/en-us/azure/data-factory/
- **Azure Event Hubs**: https://learn.microsoft.com/en-us/azure/event-hubs/

---

**Document Version**: 1.0
**Last Updated**: January 2025
**Author**: Arthur Health Technical Team
**Review Date**: Monthly
