/**
 * Text2Cypher Integration for Arthur Health
 * Converts natural language questions into Cypher queries using LangChain
 */

import { GraphCypherQAChain } from "langchain/chains/graph_qa/cypher";
import { ChatOpenAI } from "@langchain/openai";
import { ArthurNeo4jClient } from "./neo4j-client";
import { PromptTemplate } from "@langchain/core/prompts";

/**
 * Healthcare-specific Text2Cypher prompt template
 * Provides context about healthcare graph schema and best practices
 *
 * NOTE: GraphCypherQAChain automatically injects {schema} from the graph
 * We provide additional healthcare-specific guidance
 */
const HEALTHCARE_CYPHER_PROMPT = `You are an expert healthcare data analyst converting natural language questions into Cypher queries for a Neo4j graph database containing patient care data.

GRAPH SCHEMA:
{schema}

HEALTHCARE DOMAIN KNOWLEDGE:
The graph contains patient healthcare data with the following structure:

Node Types:
- Patient: Demographic and risk information (id, mrn, firstName, lastName, dateOfBirth, gender, insuranceId, riskScore, lastVisit)
- Diagnosis: Medical conditions with ICD-10 codes (id, name, icd10Code, category, severity, chronicCondition)
- Medication: Prescribed drugs with RxNorm codes (id, brandName, genericName, rxNormCode, dosage, frequency, category)
- Provider: Healthcare professionals (id, npi, firstName, lastName, specialty, facilityName, acceptsNewPatients)
- Claim: Insurance claims (id, claimNumber, serviceDate, amount, status, priorAuthRequired)
- PriorAuthorization: Prior auth tracking (id, status, requestDate, approvalDate, validUntil, procedureCode)
- CareProgram: Care management programs (id, name, type, enrollmentDate, active)

Relationship Types:
- (Patient)-[:HAS_DIAGNOSIS {diagnosedDate, diagnosedBy, active, lastReviewed}]->(Diagnosis)
- (Patient)-[:PRESCRIBED {prescribedDate, prescribedBy, dosage, refillsRemaining, lastFilled, adherenceScore}]->(Medication)
- (Patient)-[:VISITED {visitDate, visitType, chiefComplaint, outcome, nextVisitScheduled}]->(Provider)
- (Patient)-[:HAS_CLAIM {submittedDate, processedDate}]->(Claim)
- (Claim)-[:PROVIDED_BY {serviceDate, procedureCode}]->(Provider)
- (Patient)-[:REQUIRES_PA {requestedDate, urgency}]->(PriorAuthorization)
- (Patient)-[:ENROLLED_IN {enrollmentDate, completionDate, status}]->(CareProgram)

IMPORTANT QUERY GUIDELINES:
1. Use datetime() function for current time comparisons
2. Use duration() for time intervals (e.g., duration('P6M') for 6 months)
3. Always include WHERE clauses to filter inactive or outdated records
4. Use EXISTS for checking relationships, NOT EXISTS for missing relationships
5. Include error handling for NULL values
6. Return meaningful column names (use AS aliases)
7. Order results by priority fields (e.g., riskScore, amount)
8. Limit results to avoid excessive data (use LIMIT)
9. Use COLLECT() for aggregating related data
10. Convert dates to readable format when returning

COMMON PATTERNS:

Finding gaps in care:
MATCH (p:Patient)-[:HAS_DIAGNOSIS]->(d:Diagnosis)
WHERE NOT EXISTS {{
  MATCH (p)-[v:VISITED]->(pr:Provider)
  WHERE pr.specialty = 'Relevant Specialty'
  AND v.visitDate > datetime() - duration('P6M')
}}
RETURN p, d

Checking medication adherence:
MATCH (p:Patient)-[pr:PRESCRIBED]->(m:Medication)
WHERE pr.adherenceScore < 0.70
RETURN p.id, p.firstName, p.lastName, m.brandName, pr.adherenceScore

Identifying high-risk patients:
MATCH (p:Patient)
WHERE p.riskScore > 75
RETURN p
ORDER BY p.riskScore DESC

USER QUESTION:
{question}

INSTRUCTIONS:
1. Analyze the question to understand what healthcare insight is needed
2. Generate a valid Cypher query that answers the question
3. Include appropriate WHERE clauses for filtering
4. Use meaningful aliases in RETURN clause
5. Add LIMIT if returning many results
6. Ensure the query handles NULL values safely

Generate ONLY the Cypher query. Do not include explanations or markdown formatting.

CYPHER QUERY:`;

/**
 * Healthcare Text2Cypher Service
 */
export class HealthcareText2Cypher {
  private chain: GraphCypherQAChain | null = null;
  private neo4j: ArthurNeo4jClient;
  private llm: ChatOpenAI | null = null;

  constructor() {
    this.neo4j = ArthurNeo4jClient.getInstance();
  }

  /**
   * Initialize the Text2Cypher chain with LangChain
   * Follows best practices from LangChain documentation
   */
  async initialize(): Promise<GraphCypherQAChain> {
    if (this.chain) return this.chain;

    console.log("🔄 Initializing Healthcare Text2Cypher...");

    // Step 1: Initialize Neo4j connection
    const graph = await this.neo4j.initialize();

    // Step 2: Refresh schema from Neo4j (CRITICAL - Best Practice)
    // This ensures the LLM has up-to-date schema information
    console.log("🔄 Refreshing Neo4j schema...");
    await this.neo4j.refreshSchema();

    // Verify schema is available
    const schema = await this.neo4j.getSchema();
    if (!schema || schema.trim().length === 0) {
      console.warn("⚠️  WARNING: Neo4j schema is empty. Ensure data is loaded.");
      console.warn("   The LLM may not generate accurate Cypher queries without schema information.");
    } else {
      console.log("✅ Schema loaded successfully");
      // Log first 200 chars of schema for verification
      console.log("📊 Schema preview:", schema.substring(0, 200) + "...");
    }

    // Step 3: Initialize LLM (Azure OpenAI)
    this.llm = new ChatOpenAI({
      temperature: 0, // Use 0 for deterministic Cypher generation
      modelName: "gpt-4o",
      azureOpenAIApiKey: process.env.AZURE_OPENAI_KEY,
      azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_INSTANCE_NAME || "arthur-health",
      azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o",
      azureOpenAIApiVersion: process.env.AZURE_OPENAI_VERSION || "2024-12-01-preview",
    });

    // Step 4: Create custom healthcare prompt template
    // GraphCypherQAChain will automatically inject {schema} from the graph
    const cypherPrompt = PromptTemplate.fromTemplate(HEALTHCARE_CYPHER_PROMPT);

    // Step 5: Create Text2Cypher chain with best practice configuration
    this.chain = GraphCypherQAChain.fromLLM({
      llm: this.llm,
      graph: graph,
      cypherPrompt: cypherPrompt,

      // Result handling
      returnDirect: false, // Let LLM format the final answer in natural language
      topK: 10, // Limit results to prevent overwhelming the LLM (Best Practice)

      // Debugging (only in development)
      returnIntermediateSteps: process.env.NODE_ENV === 'development', // Show generated Cypher
      verbose: process.env.NODE_ENV === 'development', // Log execution steps
    });

    console.log("✅ Healthcare Text2Cypher initialized successfully");
    console.log("   - Schema: Loaded");
    console.log("   - LLM: Azure OpenAI GPT-4o");
    console.log("   - Top K: 10 results");
    console.log("   - Debug mode:", process.env.NODE_ENV === 'development' ? "ON" : "OFF");

    return this.chain;
  }

  /**
   * Query the healthcare graph using natural language
   * Returns formatted natural language response
   */
  async query(question: string): Promise<{
    answer: string;
    cypherQuery?: string;
    results?: any[];
  }> {
    const chain = await this.initialize();

    try {
      console.log("🔍 Processing question:", question);

      const startTime = Date.now();
      const response = await chain.call({ query: question });
      const duration = Date.now() - startTime;

      console.log(`✅ Query completed in ${duration}ms`);

      return {
        answer: response.text,
        cypherQuery: response.intermediateSteps?.[0]?.query,
        results: response.intermediateSteps?.[0]?.context,
      };
    } catch (error: any) {
      console.error("❌ Text2Cypher query failed:", error);

      // Provide helpful error messages
      if (error.message?.includes('syntax error')) {
        throw new Error(
          "Failed to generate valid Cypher query. Please try rephrasing your question."
        );
      } else if (error.message?.includes('connection')) {
        throw new Error(
          "Unable to connect to the healthcare graph database. Please check the connection."
        );
      } else {
        throw new Error(`Query processing failed: ${error.message}`);
      }
    }
  }

  /**
   * Generate Cypher query only (without execution)
   * Useful for debugging and validation
   */
  async generateCypherOnly(question: string): Promise<string> {
    if (!this.llm) {
      await this.initialize();
    }

    const schema = await this.neo4j.getSchema();

    const prompt = HEALTHCARE_CYPHER_PROMPT
      .replace('{schema}', schema)
      .replace('{question}', question);

    const response = await this.llm!.call([
      { role: 'user', content: prompt }
    ]);

    return response.content as string;
  }

  /**
   * Validate a Cypher query syntax
   */
  async validateCypher(cypherQuery: string): Promise<{
    valid: boolean;
    error?: string;
  }> {
    try {
      // Attempt to explain the query (doesn't execute it)
      await this.neo4j.query(`EXPLAIN ${cypherQuery}`);
      return { valid: true };
    } catch (error: any) {
      return {
        valid: false,
        error: error.message,
      };
    }
  }

  /**
   * Execute a custom Cypher query directly
   * Use with caution - for advanced users only
   */
  async executeCypher<T = any>(
    cypherQuery: string,
    params?: Record<string, any>
  ): Promise<T[]> {
    try {
      return await this.neo4j.query<T>(cypherQuery, params);
    } catch (error: any) {
      throw new Error(`Cypher execution failed: ${error.message}`);
    }
  }

  /**
   * Validate that the schema is loaded and not empty
   * Should be called before executing queries
   */
  async validateSchema(): Promise<{
    valid: boolean;
    error?: string;
    schema?: string;
  }> {
    try {
      const schema = await this.neo4j.getSchema();

      if (!schema || schema.trim().length === 0) {
        return {
          valid: false,
          error: "Neo4j schema is empty. Database may not have any data or constraints/indexes.",
          schema: schema,
        };
      }

      // Check if schema contains expected healthcare entities
      const hasNodes = schema.includes("Node properties") || schema.includes("Node labels");
      const hasRelationships = schema.includes("Relationship properties") || schema.includes("Relationship types");

      if (!hasNodes || !hasRelationships) {
        return {
          valid: false,
          error: "Schema is incomplete. Missing node or relationship information.",
          schema: schema,
        };
      }

      return {
        valid: true,
        schema: schema,
      };
    } catch (error: any) {
      return {
        valid: false,
        error: `Schema validation failed: ${error.message}`,
      };
    }
  }

  /**
   * Get current configuration and status
   * Useful for debugging and monitoring
   */
  async getStatus(): Promise<{
    initialized: boolean;
    schemaLoaded: boolean;
    schemaValid: boolean;
    llmConfigured: boolean;
    topK: number;
  }> {
    const schemaValidation = await this.validateSchema();

    return {
      initialized: this.chain !== null,
      schemaLoaded: schemaValidation.schema !== undefined && schemaValidation.schema.length > 0,
      schemaValid: schemaValidation.valid,
      llmConfigured: this.llm !== null,
      topK: 10, // hardcoded in initialize()
    };
  }

  /**
   * Reinitialize the chain (useful after schema changes)
   */
  async reinitialize(): Promise<void> {
    console.log("🔄 Reinitializing Text2Cypher chain...");
    this.chain = null;
    this.llm = null;
    await this.initialize();
    console.log("✅ Reinitialization complete");
  }
}

/**
 * Pre-defined healthcare queries for common use cases
 * Can be used directly or as examples for Text2Cypher
 */
export const HEALTHCARE_QUERIES = {
  // Gap Detection Queries
  missingSpecialistVisits: `
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
  `,

  medicationNonAdherence: `
    MATCH (p:Patient)-[pr:PRESCRIBED]->(m:Medication)
    WHERE pr.adherenceScore < 0.70
    RETURN
      p.id AS patientId,
      p.firstName + ' ' + p.lastName AS patientName,
      m.brandName AS medication,
      pr.adherenceScore AS adherenceScore
    ORDER BY pr.adherenceScore ASC
    LIMIT 100
  `,

  expiredPriorAuths: `
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
  `,

  highCostWithoutCareManagement: `
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
  `,

  // Analytics Queries
  patientRiskDistribution: `
    MATCH (p:Patient)
    WITH
      CASE
        WHEN p.riskScore >= 80 THEN 'Critical'
        WHEN p.riskScore >= 60 THEN 'High'
        WHEN p.riskScore >= 40 THEN 'Moderate'
        ELSE 'Low'
      END AS riskCategory,
      count(p) AS patientCount
    RETURN riskCategory, patientCount
    ORDER BY patientCount DESC
  `,

  topDiagnoses: `
    MATCH (p:Patient)-[:HAS_DIAGNOSIS]->(d:Diagnosis)
    WITH d.name AS diagnosis, count(p) AS patientCount
    RETURN diagnosis, patientCount
    ORDER BY patientCount DESC
    LIMIT 20
  `,

  providerUtilization: `
    MATCH (pr:Provider)<-[v:VISITED]-(p:Patient)
    WITH
      pr.firstName + ' ' + pr.lastName AS providerName,
      pr.specialty AS specialty,
      count(v) AS visitCount,
      avg(duration.inDays(v.visitDate, datetime()).days) AS avgDaysSinceLastVisit
    RETURN providerName, specialty, visitCount, avgDaysSinceLastVisit
    ORDER BY visitCount DESC
    LIMIT 20
  `,
};

// Export singleton instance
export const text2cypher = new HealthcareText2Cypher();
