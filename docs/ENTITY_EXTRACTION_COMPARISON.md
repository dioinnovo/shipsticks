# Entity Extraction & Knowledge Graph Building: LightRAG vs LangChain

## Critical Distinction

**Your observation is correct and very important!** Let me clarify the difference:

### LightRAG Approach (Document-First)
```
Unstructured Documents → LLM Extracts Entities/Relationships → Graph
```
- ✅ **Automatic entity extraction** from text
- ✅ Builds graph **from documents**
- ✅ Good for: Clinical notes, research papers, unstructured data
- ❌ Assumes documents are the source of truth

### LangChain Approach (Database-First - as I implemented)
```
Structured Database (Synapse) → ETL → Graph → Text2Cypher Queries
```
- ✅ Uses **existing structured data** from Synapse
- ✅ Graph built from **database tables**
- ✅ Good for: EMR systems, transactional databases
- ❌ Doesn't extract from unstructured text (in my implementation)

**The key insight**: LangChain CAN do entity extraction, but I implemented it for querying **existing graphs**, not building them from documents.

---

## The Complete Picture: Both Can Do Both!

### What I Implemented (Database → Graph → Query)

```typescript
// Current implementation: ETL from Synapse
Synapse SQL Tables → Azure Data Factory → Neo4j Graph → LangChain Text2Cypher

// Patient table in Synapse
SELECT patient_id, first_name, last_name, diagnosis_code
FROM patients;

// Becomes nodes in Neo4j
CREATE (p:Patient {id: 'PAT-001', firstName: 'John', lastName: 'Smith'})
CREATE (d:Diagnosis {icd10Code: 'E11.9', name: 'Type 2 Diabetes'})
CREATE (p)-[:HAS_DIAGNOSIS]->(d)

// Then query with natural language
"Show me diabetic patients" → LangChain generates Cypher → Results
```

### What LightRAG Does (Documents → Graph → Query)

```typescript
// LightRAG: Extract from unstructured text
const document = `
  Patient John Smith, age 48, presented with elevated blood glucose.
  Diagnosed with Type 2 Diabetes (ICD-10: E11.9). Prescribed Metformin 500mg.
  Follow-up scheduled with Dr. Jane Doe, endocrinologist.
`;

// LightRAG automatically extracts:
Entities: [Patient, Diagnosis, Medication, Provider]
Relationships: [HAS_DIAGNOSIS, PRESCRIBED, SCHEDULED_WITH]

// Builds graph automatically
(John Smith:Patient)-[:HAS_DIAGNOSIS]->(Type 2 Diabetes:Diagnosis)
(John Smith:Patient)-[:PRESCRIBED]->(Metformin:Medication)
(John Smith:Patient)-[:SCHEDULED_WITH]->(Dr. Jane Doe:Provider)

// Then query with natural language
"Show me John's medications" → Hybrid search → Results
```

---

## What You Actually Need for Arthur Health

### Option 1: Structured Data (Synapse) - Current Implementation ✅

**Use when**:
- ✅ Data already in Synapse tables (patients, diagnoses, claims)
- ✅ Well-structured with IDs and foreign keys
- ✅ Need SQL-level guarantees and transactions

**Implementation**: My current code (ETL → Neo4j → Text2Cypher)

### Option 2: Unstructured Documents (Clinical Notes)

**Use when**:
- ✅ Processing clinical notes, discharge summaries, doctor narratives
- ✅ Have PDFs, Word docs, or free-text fields
- ✅ Need to extract insights from unstructured content

**Implementation**: Need to add entity extraction (I'll show you below)

### Option 3: Hybrid (Best for Healthcare!)

**Use both**:
- 📊 Structured data from Synapse → Base graph
- 📄 Clinical notes → Entity extraction → Enrich graph
- 🎯 Combined knowledge for comprehensive care insights

**This is what I'll implement below!**

---

## Adding Entity Extraction to LangChain

Let me show you how to add document-based entity extraction to your current LangChain implementation:

### Architecture with Entity Extraction

```
┌──────────────────────────────────────────────────────────┐
│                 Data Sources                              │
│  ┌────────────────────┐  ┌──────────────────────────┐   │
│  │ Synapse Tables     │  │ Clinical Notes (Text)    │   │
│  │ (Structured)       │  │ (Unstructured)           │   │
│  └─────────┬──────────┘  └──────────┬───────────────┘   │
└────────────┼──────────────────────────┼───────────────────┘
             │                          │
             ↓                          ↓
    ┌─────────────────┐      ┌──────────────────────┐
    │ ETL Pipeline    │      │ LangChain Entity     │
    │ (My Code)       │      │ Extraction           │
    │                 │      │ (New Code Below)     │
    └────────┬────────┘      └─────────┬────────────┘
             │                          │
             └──────────┬───────────────┘
                        ↓
               ┌────────────────────────┐
               │   Neo4j Knowledge      │
               │   Graph (Unified)      │
               └────────┬───────────────┘
                        ↓
               ┌────────────────────────┐
               │ LangChain Text2Cypher  │
               │ + Hybrid Search        │
               └────────────────────────┘
```

### Implementation Code

```typescript
// lib/graphrag/document-entity-extractor.ts
import { ChatOpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "langchain/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { neo4jClient } from "./neo4j-client";

/**
 * Entity extraction schemas
 */
const ExtractedEntity = z.object({
  name: z.string().describe("Entity name (e.g., 'John Smith', 'Metformin')"),
  type: z.enum([
    "Patient",
    "Diagnosis",
    "Medication",
    "Provider",
    "Facility",
    "Procedure",
  ]).describe("Entity type"),
  attributes: z.record(z.string()).describe("Additional attributes"),
});

const ExtractedRelationship = z.object({
  source: z.string().describe("Source entity name"),
  target: z.string().describe("Target entity name"),
  type: z.string().describe("Relationship type (e.g., HAS_DIAGNOSIS, PRESCRIBED)"),
  attributes: z.record(z.string()).optional(),
});

const ExtractedKnowledge = z.object({
  entities: z.array(ExtractedEntity),
  relationships: z.array(ExtractedRelationship),
});

/**
 * Document-based Entity Extractor for Healthcare
 */
export class DocumentEntityExtractor {
  private llm: ChatOpenAI;
  private parser: StructuredOutputParser<typeof ExtractedKnowledge>;

  constructor() {
    this.llm = new ChatOpenAI({
      temperature: 0,
      modelName: "gpt-4o",
      azureOpenAIApiKey: process.env.AZURE_OPENAI_KEY,
      azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_INSTANCE_NAME,
      azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT,
    });

    this.parser = StructuredOutputParser.fromZodSchema(ExtractedKnowledge);
  }

  /**
   * Extract entities and relationships from clinical text
   */
  async extractFromText(clinicalText: string): Promise<z.infer<typeof ExtractedKnowledge>> {
    const prompt = PromptTemplate.fromTemplate(`
You are a medical information extraction system. Extract all relevant healthcare entities and relationships from the following clinical text.

ENTITY TYPES TO EXTRACT:
- Patient: Patient names, MRNs, demographic info
- Diagnosis: Medical conditions with ICD-10 codes if mentioned
- Medication: Drug names (generic/brand), dosages, frequencies
- Provider: Doctors, nurses, specialists with credentials
- Facility: Hospitals, clinics, departments
- Procedure: Medical procedures, tests, interventions

RELATIONSHIP TYPES:
- HAS_DIAGNOSIS: Patient diagnosed with condition
- PRESCRIBED: Patient prescribed medication
- PERFORMED: Provider performed procedure
- VISITED: Patient visited provider/facility
- REFERRED_TO: Referred to specialist
- ORDERED: Provider ordered test/procedure

CLINICAL TEXT:
{text}

{format_instructions}

IMPORTANT:
- Extract ALL entities mentioned
- Use medical terminology (ICD-10, RxNorm when possible)
- Include temporal information in attributes (dates, durations)
- Be precise with names and codes

EXTRACTED ENTITIES AND RELATIONSHIPS:
`);

    const formatInstructions = this.parser.getFormatInstructions();
    const input = await prompt.format({
      text: clinicalText,
      format_instructions: formatInstructions,
    });

    const response = await this.llm.call([{ role: "user", content: input }]);
    const parsed = await this.parser.parse(response.content as string);

    return parsed;
  }

  /**
   * Load extracted entities into Neo4j graph
   */
  async loadIntoGraph(extracted: z.infer<typeof ExtractedKnowledge>): Promise<void> {
    console.log(`📊 Loading ${extracted.entities.length} entities and ${extracted.relationships.length} relationships...`);

    // Load entities
    for (const entity of extracted.entities) {
      await this.upsertEntity(entity);
    }

    // Load relationships
    for (const relationship of extracted.relationships) {
      await this.upsertRelationship(relationship);
    }

    console.log("✅ Knowledge loaded into graph");
  }

  /**
   * Upsert entity into Neo4j
   */
  private async upsertEntity(entity: z.infer<typeof ExtractedEntity>): Promise<void> {
    const query = `
      MERGE (e:${entity.type} {name: $name})
      SET e += $attributes
      SET e.extractedAt = datetime()
      SET e.extractionSource = 'document'
      RETURN e
    `;

    await neo4jClient.query(query, {
      name: entity.name,
      attributes: entity.attributes,
    });
  }

  /**
   * Upsert relationship into Neo4j
   */
  private async upsertRelationship(
    relationship: z.infer<typeof ExtractedRelationship>
  ): Promise<void> {
    // Use dynamic relationship type (Cypher doesn't support parameterized relationship types in MERGE)
    const query = `
      MATCH (source {name: $sourceName})
      MATCH (target {name: $targetName})
      CALL apoc.merge.relationship(
        source,
        $relType,
        {},
        $attributes,
        target
      ) YIELD rel
      SET rel.extractedAt = datetime()
      RETURN rel
    `;

    try {
      await neo4jClient.query(query, {
        sourceName: relationship.source,
        targetName: relationship.target,
        relType: relationship.type,
        attributes: relationship.attributes || {},
      });
    } catch (error) {
      console.warn(`⚠️  Failed to create relationship ${relationship.type}:`, error);
      // Fallback: Create generic RELATED_TO relationship
      await this.createGenericRelationship(relationship);
    }
  }

  /**
   * Fallback: Create generic relationship if dynamic creation fails
   */
  private async createGenericRelationship(
    relationship: z.infer<typeof ExtractedRelationship>
  ): Promise<void> {
    const query = `
      MATCH (source {name: $sourceName})
      MATCH (target {name: $targetName})
      MERGE (source)-[r:RELATED_TO]->(target)
      SET r.relationshipType = $relType
      SET r += $attributes
      SET r.extractedAt = datetime()
      RETURN r
    `;

    await neo4jClient.query(query, {
      sourceName: relationship.source,
      targetName: relationship.target,
      relType: relationship.type,
      attributes: relationship.attributes || {},
    });
  }

  /**
   * Process a batch of clinical documents
   */
  async processBatch(documents: string[]): Promise<{
    totalEntities: number;
    totalRelationships: number;
    processed: number;
  }> {
    let totalEntities = 0;
    let totalRelationships = 0;

    for (let i = 0; i < documents.length; i++) {
      console.log(`Processing document ${i + 1}/${documents.length}...`);

      const extracted = await this.extractFromText(documents[i]);
      await this.loadIntoGraph(extracted);

      totalEntities += extracted.entities.length;
      totalRelationships += extracted.relationships.length;
    }

    return {
      totalEntities,
      totalRelationships,
      processed: documents.length,
    };
  }
}

// Export singleton
export const documentExtractor = new DocumentEntityExtractor();
```

### Usage Example

```typescript
// Example: Process clinical notes
const clinicalNote = `
Progress Note - January 15, 2025

Patient: John Smith (MRN: 12345)
Age: 58, Male

Chief Complaint: Follow-up for Type 2 Diabetes Mellitus

History of Present Illness:
Patient presents for routine diabetes management. Last HbA1c was 8.2%
three months ago. Currently on Metformin 1000mg twice daily. Reports
good medication adherence but struggles with dietary compliance.

Assessment:
1. Type 2 Diabetes Mellitus (ICD-10: E11.9) - Suboptimal control
2. Hypertension (ICD-10: I10) - Well controlled

Plan:
1. Increase Metformin to 1500mg twice daily
2. Add Jardiance 10mg once daily
3. Refer to registered dietitian for nutrition counseling
4. Recheck HbA1c in 3 months
5. Schedule follow-up with endocrinologist Dr. Sarah Johnson

Provider: Dr. Michael Chen, MD (Internal Medicine)
`;

// Extract entities and load into graph
const extracted = await documentExtractor.extractFromText(clinicalNote);
console.log('Extracted:', extracted);

// Load into Neo4j
await documentExtractor.loadIntoGraph(extracted);

// Now you can query with Text2Cypher
const result = await text2cypher.query(
  "What medications is John Smith currently taking?"
);
console.log(result.answer);
```

---

## Now Let's Compare: LightRAG vs LangChain Quality

I'll create a comprehensive benchmarking framework to test both systems.

### Benchmark Dimensions

1. **Entity Extraction Accuracy**: How many entities correctly identified?
2. **Relationship Accuracy**: How many relationships correctly identified?
3. **Query Accuracy**: Do queries return correct results?
4. **Query Latency**: How fast are responses?
5. **Scalability**: Performance with large datasets
6. **Cost**: LLM API costs

Let me create the testing framework...
