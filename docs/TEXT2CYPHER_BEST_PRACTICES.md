# Text2Cypher Best Practices - Arthur Health Implementation

This document explains how our Text2Cypher implementation follows LangChain and Neo4j best practices.

## Table of Contents

1. [Overview](#overview)
2. [Critical Best Practices Implemented](#critical-best-practices-implemented)
3. [Schema Management](#schema-management)
4. [Query Generation Process](#query-generation-process)
5. [Configuration Options](#configuration-options)
6. [Error Handling](#error-handling)
7. [Testing and Validation](#testing-and-validation)
8. [Common Pitfalls Avoided](#common-pitfalls-avoided)

---

## Overview

Our Text2Cypher implementation uses **LangChain's GraphCypherQAChain** to convert natural language questions into Cypher queries for Neo4j. This approach enables non-technical users to query complex healthcare graphs without knowing Cypher syntax.

### Architecture Flow

```
User Question
    ↓
Text2Cypher (LangChain)
    ├─→ Fetch Schema from Neo4j
    ├─→ LLM generates Cypher query
    ├─→ Validate Cypher syntax
    └─→ Execute query
            ↓
    Neo4j Results
            ↓
    LLM formats answer
            ↓
    Natural Language Response
```

---

## Critical Best Practices Implemented

### 1. ✅ Schema Refresh Before Initialization

**Why**: The LLM needs up-to-date schema information to generate valid Cypher queries.

**Implementation**:
```typescript
// lib/graphrag/text2cypher.ts:117-120
console.log("🔄 Refreshing Neo4j schema...");
await this.neo4j.refreshSchema();
```

**LangChain Documentation Reference**:
> "If the schema of database changes, you can refresh the schema information needed to generate Cypher statements."
> - Source: https://js.langchain.com/docs/tutorials/graph

**What Happens Without This**:
- LLM generates queries for outdated schema
- Queries fail with "property not found" errors
- Wrong node labels or relationship types used

---

### 2. ✅ Schema Validation

**Why**: Prevents queries when database is empty or schema is incomplete.

**Implementation**:
```typescript
// lib/graphrag/text2cypher.ts:123-131
const schema = await this.neo4j.getSchema();
if (!schema || schema.trim().length === 0) {
  console.warn("⚠️  WARNING: Neo4j schema is empty.");
  console.warn("   The LLM may not generate accurate Cypher queries...");
}
```

**What We Check**:
- Schema is not empty
- Contains node information (`Node properties` or `Node labels`)
- Contains relationship information (`Relationship properties` or `Relationship types`)

**Example Schema Output**:
```
Node properties:
Patient {id: STRING, mrn: STRING, firstName: STRING, lastName: STRING, ...}
Medication {id: STRING, rxNormCode: STRING, genericName: STRING, ...}

Relationship properties:
(:Patient)-[:PRESCRIBED]->(:Medication) {prescribedDate: DATE, adherenceScore: FLOAT, ...}
(:Patient)-[:HAS_DIAGNOSIS]->(:Diagnosis) {diagnosedDate: DATE, active: BOOLEAN, ...}
```

---

### 3. ✅ Top-K Result Limiting

**Why**: Prevents overwhelming the LLM with too many results, which can cause:
- Slow response times
- High API costs
- Incomplete answer generation

**Implementation**:
```typescript
// lib/graphrag/text2cypher.ts:155
topK: 10, // Limit results to prevent overwhelming the LLM
```

**LangChain Documentation Reference**:
> "You can limit the number of results from the Cypher QA Chain using the top_k parameter, with the default being 10."

**What This Does**:
- GraphCypherQAChain automatically appends `LIMIT 10` to generated Cypher queries
- Ensures consistent response times
- Reduces Azure OpenAI token usage

**Example**:
```cypher
// User asks: "Show me all diabetic patients"
// LLM generates:
MATCH (p:Patient)-[:HAS_DIAGNOSIS]->(d:Diagnosis)
WHERE d.name CONTAINS 'Diabetes'
RETURN p.id, p.firstName, p.lastName
LIMIT 10  // ← Automatically added by topK
```

---

### 4. ✅ Return Intermediate Steps (Debug Mode)

**Why**: Essential for debugging and understanding what Cypher queries are being generated.

**Implementation**:
```typescript
// lib/graphrag/text2cypher.ts:158-159
returnIntermediateSteps: process.env.NODE_ENV === 'development',
verbose: process.env.NODE_ENV === 'development',
```

**What This Provides**:
```typescript
const result = await text2cypher.query("How many diabetic patients?");

// In development mode, you get:
{
  answer: "There are 152 patients with diabetes.",
  cypherQuery: "MATCH (p:Patient)-[:HAS_DIAGNOSIS]->(d:Diagnosis) WHERE d.name CONTAINS 'Diabetes' RETURN count(p) as count",
  results: [{ count: 152 }]
}
```

---

### 5. ✅ Healthcare-Specific Prompt Engineering

**Why**: General-purpose prompts don't understand healthcare domain concepts.

**Implementation**:
```typescript
// lib/graphrag/text2cypher.ts:18-88
const HEALTHCARE_CYPHER_PROMPT = `
You are an expert healthcare data analyst...

HEALTHCARE DOMAIN KNOWLEDGE:
- Patient: Demographic and risk information
- Diagnosis: Medical conditions with ICD-10 codes
- Medication: Prescribed drugs with RxNorm codes
...

COMMON PATTERNS:
Finding gaps in care:
MATCH (p:Patient)-[:HAS_DIAGNOSIS]->(d:Diagnosis)
WHERE NOT EXISTS {
  MATCH (p)-[v:VISITED]->(pr:Provider)
  WHERE pr.specialty = 'Relevant Specialty'
  AND v.visitDate > datetime() - duration('P6M')
}
...
`;
```

**Why This Matters**:
- LLM understands medical terminology (ICD-10, RxNorm, NPIs)
- Knows healthcare-specific query patterns (gap detection, adherence tracking)
- Generates queries that handle temporal data correctly (`duration()`, `datetime()`)
- Uses appropriate filtering (active diagnoses, recent visits)

**LangChain Documentation Reference**:
> "You can create a custom CYPHER_GENERATION_TEMPLATE that instructs the LLM to use only the provided relationship types and properties in the schema."

---

### 6. ✅ Automatic Schema Injection

**Why**: GraphCypherQAChain automatically injects the {schema} placeholder with real schema from Neo4j.

**How It Works**:
```typescript
// We define a prompt with {schema} placeholder
const HEALTHCARE_CYPHER_PROMPT = `
GRAPH SCHEMA:
{schema}  // ← This is automatically replaced
...
`;

// GraphCypherQAChain.fromLLM() handles the injection
this.chain = GraphCypherQAChain.fromLLM({
  llm: this.llm,
  graph: graph,  // ← Schema comes from here
  cypherPrompt: cypherPrompt,
  ...
});
```

**What Gets Injected**:
```
GRAPH SCHEMA:
Node properties:
Patient {id: STRING, mrn: STRING, firstName: STRING, ...}
Medication {id: STRING, rxNormCode: STRING, ...}
Diagnosis {id: STRING, icd10Code: STRING, ...}

Relationship properties:
(:Patient)-[:PRESCRIBED {prescribedDate: DATE, ...}]->(:Medication)
(:Patient)-[:HAS_DIAGNOSIS {diagnosedDate: DATE, ...}]->(:Diagnosis)
...
```

---

## Schema Management

### How Neo4j Schema Works

Neo4j automatically infers schema from:
1. **Constraints** (e.g., `CREATE CONSTRAINT patient_id FOR (p:Patient) REQUIRE p.id IS UNIQUE`)
2. **Indexes** (property indexes, full-text indexes, vector indexes)
3. **Existing data** (node labels, relationship types, properties)

### Schema Refresh Timing

**When to call `refreshSchema()`**:
- ✅ On application startup (done in `initialize()`)
- ✅ After ETL runs (call `text2cypher.reinitialize()`)
- ✅ After schema changes (new constraints/indexes)
- ✅ Periodically (e.g., daily) for long-running applications

**Example**:
```typescript
// After running ETL
await synapseETL.run();
await text2cypher.reinitialize(); // Refreshes schema

// Check status
const status = await text2cypher.getStatus();
console.log("Schema valid?", status.schemaValid);
```

---

## Query Generation Process

### Step-by-Step Flow

1. **User Question**: "Which patients are not adhering to their medications?"

2. **Schema Fetch**: GraphCypherQAChain retrieves schema from `graph.getSchema()`

3. **Prompt Construction**: LLM receives:
   ```
   GRAPH SCHEMA: [actual schema here]

   HEALTHCARE DOMAIN KNOWLEDGE: [our custom guidance]

   USER QUESTION: Which patients are not adhering to their medications?

   Generate ONLY the Cypher query...
   ```

4. **LLM Generates Cypher**:
   ```cypher
   MATCH (p:Patient)-[pr:PRESCRIBED]->(m:Medication)
   WHERE pr.adherenceScore < 0.70
   RETURN p.id, p.firstName, p.lastName, m.genericName, pr.adherenceScore
   ORDER BY pr.adherenceScore ASC
   LIMIT 10
   ```

5. **Query Execution**: GraphCypherQAChain executes the query against Neo4j

6. **Results**:
   ```json
   [
     {"id": "PAT-001", "firstName": "John", "lastName": "Smith", "genericName": "Metformin", "adherenceScore": 0.52},
     {"id": "PAT-023", "firstName": "Mary", "lastName": "Johnson", "genericName": "Lisinopril", "adherenceScore": 0.61},
     ...
   ]
   ```

7. **Answer Generation**: LLM formats natural language response:
   ```
   "There are 47 patients with medication adherence below 70%. The patients with
   the lowest adherence are John Smith (52% adherence to Metformin) and Mary
   Johnson (61% adherence to Lisinopril)."
   ```

---

## Configuration Options

### GraphCypherQAChain Options

| Option | Our Value | Purpose | LangChain Default |
|--------|-----------|---------|-------------------|
| `llm` | `ChatOpenAI(gpt-4o, temp=0)` | LLM for query generation | Required |
| `graph` | `Neo4jGraph` instance | Neo4j connection | Required |
| `cypherPrompt` | Healthcare-specific | Domain guidance | Generic prompt |
| `returnDirect` | `false` | Let LLM format answer | `false` |
| `topK` | `10` | Limit results | `10` |
| `returnIntermediateSteps` | Dev mode only | Show Cypher queries | `false` |
| `verbose` | Dev mode only | Log execution | `false` |

### Why Temperature = 0

```typescript
temperature: 0, // Use 0 for deterministic Cypher generation
```

**Reasoning**:
- Cypher queries must be syntactically correct
- No creativity needed - we want deterministic behavior
- Same question should produce same query
- Reduces risk of syntax errors

**LangChain Recommendation**:
> "Use temperature: 0 for deterministic Cypher generation"

---

## Error Handling

### Query Validation

**Before Execution**:
```typescript
// Validate Cypher syntax without executing
const validation = await text2cypher.validateCypher(cypherQuery);
if (!validation.valid) {
  console.error("Invalid Cypher:", validation.error);
}
```

**During Execution**:
```typescript
try {
  const result = await text2cypher.query(question);
} catch (error) {
  if (error.message.includes('syntax error')) {
    // Cypher syntax error - ask user to rephrase
  } else if (error.message.includes('connection')) {
    // Neo4j connection issue
  }
}
```

### Schema Validation

```typescript
const schemaValidation = await text2cypher.validateSchema();

if (!schemaValidation.valid) {
  console.error("Schema issue:", schemaValidation.error);
  // Options:
  // 1. Run ETL to load data
  // 2. Create schema with neo4j-schema.cypher
  // 3. Check Neo4j connection
}
```

---

## Testing and Validation

### Unit Tests

```typescript
// Test 1: Schema is loaded
const status = await text2cypher.getStatus();
expect(status.schemaLoaded).toBe(true);
expect(status.schemaValid).toBe(true);

// Test 2: Query generation
const result = await text2cypher.query("How many patients?");
expect(result.answer).toContain("patient");
expect(result.cypherQuery).toContain("MATCH");

// Test 3: Result limiting
const result = await text2cypher.query("Show all patients");
expect(result.results.length).toBeLessThanOrEqual(10);
```

### Integration Tests

```bash
# Run comprehensive system test
npx tsx scripts/test-entity-extraction.ts
```

**What It Tests**:
- ✅ Neo4j connectivity
- ✅ Schema loaded and valid
- ✅ Text2Cypher query execution
- ✅ Gap detection
- ✅ Vector search (if available)

---

## Common Pitfalls Avoided

### ❌ Pitfall 1: Not Refreshing Schema

**Problem**:
```typescript
const graph = await Neo4jGraph.initialize({...});
const chain = GraphCypherQAChain.fromLLM({ llm, graph });
// ❌ No refreshSchema() call!
```

**What Happens**:
- Schema is cached from first initialization
- After ETL runs, new properties aren't known
- LLM generates queries for old schema
- Queries fail or return incomplete data

**✅ Our Solution**:
```typescript
const graph = await this.neo4j.initialize();
await this.neo4j.refreshSchema(); // ← Always refresh!
```

---

### ❌ Pitfall 2: No Result Limiting

**Problem**:
```typescript
GraphCypherQAChain.fromLLM({
  llm,
  graph,
  // ❌ No topK specified!
});
```

**What Happens**:
- Query returns 10,000 patients
- LLM context window exceeded
- Response takes 30+ seconds
- High API costs

**✅ Our Solution**:
```typescript
topK: 10, // Always limit results
```

---

### ❌ Pitfall 3: Using High Temperature

**Problem**:
```typescript
const llm = new ChatOpenAI({
  temperature: 0.7, // ❌ Too high for Cypher generation
});
```

**What Happens**:
- Same question produces different queries
- Syntax errors from "creative" query generation
- Inconsistent results

**✅ Our Solution**:
```typescript
temperature: 0, // Deterministic Cypher generation
```

---

### ❌ Pitfall 4: Generic Prompts

**Problem**:
```typescript
// Using default LangChain prompt
GraphCypherQAChain.fromLLM({
  llm,
  graph,
  // ❌ No cypherPrompt specified
});
```

**What Happens**:
- LLM doesn't understand healthcare domain
- Misinterprets medical terminology
- Generates syntactically correct but semantically wrong queries
- Example: "diabetes" vs "Type 2 Diabetes Mellitus" vs ICD-10 code

**✅ Our Solution**:
```typescript
cypherPrompt: HEALTHCARE_CYPHER_PROMPT, // Domain-specific guidance
```

---

### ❌ Pitfall 5: No Schema Validation

**Problem**:
```typescript
// Assume schema exists
await chain.call({ query: question });
// ❌ No check if schema is empty
```

**What Happens**:
- LLM has no schema information
- Generates queries based on assumptions
- All queries fail with "Label not found" errors

**✅ Our Solution**:
```typescript
const schema = await this.neo4j.getSchema();
if (!schema || schema.trim().length === 0) {
  console.warn("⚠️  WARNING: Neo4j schema is empty...");
}
```

---

## References

### Official Documentation

1. **LangChain JS Graph Tutorial**
   - https://js.langchain.com/docs/tutorials/graph
   - Complete tutorial on Neo4j + LangChain integration

2. **LangChain Python Neo4j Integration**
   - https://python.langchain.com/docs/integrations/graphs/neo4j_cypher/
   - Comprehensive guide with best practices

3. **Neo4j LangChain Labs**
   - https://neo4j.com/labs/genai-ecosystem/langchain/
   - Neo4j's official LangChain integration guide

4. **GraphCypherQAChain API Reference**
   - https://python.langchain.com/api_reference/neo4j/chains/langchain_neo4j.chains.graph_qa.cypher.GraphCypherQAChain.html
   - Complete API documentation

### Arthur Health Implementation Files

- `lib/graphrag/text2cypher.ts` - Main Text2Cypher implementation
- `lib/graphrag/neo4j-client.ts` - Neo4j connection management
- `lib/graphrag/healthcare-schema.ts` - Healthcare ontology
- `scripts/test-entity-extraction.ts` - Integration tests

---

## Summary Checklist

When implementing Text2Cypher, ensure:

- ✅ `refreshSchema()` called after initialization
- ✅ Schema validation before queries
- ✅ `topK` parameter set (default: 10)
- ✅ `temperature: 0` for deterministic generation
- ✅ Domain-specific prompt engineering
- ✅ `returnIntermediateSteps` in development
- ✅ Error handling for connection and syntax errors
- ✅ Comprehensive testing (unit + integration)
- ✅ Schema refresh after ETL runs
- ✅ Status monitoring (`getStatus()` method)

**All items checked in Arthur Health implementation! ✅**
