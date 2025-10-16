/**
 * LLM-Powered Schema Discovery Agent for Synapse
 * Automatically analyzes SQL database schema to discover entities and relationships
 *
 * Key Features:
 * - Analyzes table structures, foreign keys, indexes
 * - Proposes healthcare ontology (entities + relationships)
 * - Discovers non-obvious patterns
 * - Generates Neo4j schema DDL
 *
 * Based on research:
 * - LangChain schema inference
 * - LLM-driven knowledge graph construction
 * - Healthcare domain patterns
 */

import { ChatOpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "langchain/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

/**
 * Schema analysis output
 */
const DiscoveredEntity = z.object({
  name: z.string().describe("Entity name (e.g., 'Patient', 'CareEpisode')"),
  sourceTable: z.string().describe("SQL table name"),
  description: z.string().describe("What this entity represents in healthcare context"),
  keyProperties: z.array(z.string()).describe("Important properties/columns"),
  confidence: z.enum(["high", "medium", "low"]).describe("Confidence in this entity mapping"),
  reasoning: z.string().describe("Why this table represents this entity"),
});

const DiscoveredRelationship = z.object({
  name: z.string().describe("Relationship name (e.g., 'HAS_DIAGNOSIS', 'REFERRED_TO')"),
  sourceEntity: z.string().describe("Source entity name"),
  targetEntity: z.string().describe("Target entity name"),
  sqlBasis: z.string().describe("SQL basis (foreign key, junction table, or pattern)"),
  healthcareSemantics: z.string().describe("Healthcare meaning of this relationship"),
  cardinality: z.enum(["one-to-one", "one-to-many", "many-to-many"]).describe("Relationship cardinality"),
  properties: z.array(z.string()).describe("Properties on this relationship"),
  confidence: z.enum(["high", "medium", "low"]).describe("Confidence in this relationship"),
  reasoning: z.string().describe("Why this relationship exists"),
});

const SchemaDiscoveryResult = z.object({
  coreEntities: z.array(DiscoveredEntity).describe("Core healthcare entities (required)"),
  discoveredEntities: z.array(DiscoveredEntity).describe("Additional entities found through analysis"),
  explicitRelationships: z.array(DiscoveredRelationship).describe("Relationships from foreign keys"),
  inferredRelationships: z.array(DiscoveredRelationship).describe("Relationships inferred from patterns"),
  temporalPatterns: z.array(z.string()).describe("Temporal patterns found (e.g., timestamps, versioning)"),
  recommendations: z.array(z.string()).describe("Recommendations for graph schema"),
});

/**
 * SQL Table Metadata (from information_schema)
 */
export interface TableMetadata {
  tableName: string;
  schemaName: string;
  columns: Array<{
    name: string;
    dataType: string;
    isNullable: boolean;
    isPrimaryKey: boolean;
    isForeignKey: boolean;
    foreignKeyRef?: {
      table: string;
      column: string;
    };
  }>;
  indexes: Array<{
    name: string;
    columns: string[];
    isUnique: boolean;
  }>;
  rowCount?: number;
}

/**
 * Schema Discovery Agent
 * Uses LLM to analyze SQL schema and propose knowledge graph structure
 */
export class SchemaDiscoveryAgent {
  private llm: ChatOpenAI;
  private parser: StructuredOutputParser<typeof SchemaDiscoveryResult>;

  constructor() {
    this.llm = new ChatOpenAI({
      temperature: 0.3, // Slightly higher for creative pattern discovery
      modelName: "gpt-4o",
      azureOpenAIApiKey: process.env.AZURE_OPENAI_KEY,
      azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_INSTANCE_NAME || "arthur-health",
      azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o",
      azureOpenAIApiVersion: process.env.AZURE_OPENAI_VERSION || "2024-12-01-preview",
    });

    this.parser = StructuredOutputParser.fromZodSchema(SchemaDiscoveryResult);
  }

  /**
   * Analyze Synapse SQL schema and discover entities/relationships
   */
  async analyzeSchema(
    tables: TableMetadata[],
    options?: {
      focusAreas?: string[]; // e.g., ["gap detection", "care coordination"]
      minConfidence?: "high" | "medium" | "low";
    }
  ): Promise<z.infer<typeof SchemaDiscoveryResult>> {
    console.log(`🔍 Analyzing ${tables.length} tables from Synapse...`);

    const prompt = PromptTemplate.fromTemplate(`
You are a healthcare data architect and ontologist specializing in knowledge graph design for clinical care delivery.

Analyze the following SQL database schema from a healthcare organization's data warehouse (Microsoft Synapse).
Your task is to discover both OBVIOUS and NON-OBVIOUS entities and relationships that would be valuable in a knowledge graph for:
1. Identifying gaps in healthcare delivery
2. Optimizing care coordination
3. Detecting patterns that lead to better patient outcomes
4. Finding cost optimization opportunities

SQL DATABASE SCHEMA:
{schema}

HEALTHCARE DOMAIN KNOWLEDGE:
- FHIR (Fast Healthcare Interoperability Resources) is likely used
- Common healthcare entities: Patient, Practitioner, Encounter, Observation, Medication, Condition, Procedure
- Healthcare relationships often involve temporal aspects (care episodes, treatment timelines)
- Social determinants of health may be implicit in the data
- Quality measures and outcomes may be derivable from relationships

ANALYSIS REQUIREMENTS:

1. CORE ENTITIES (REQUIRED - These must be identified):
   - Patient/Person
   - Clinical Diagnoses/Conditions
   - Medications
   - Healthcare Providers
   - Facilities/Locations
   - Procedures/Interventions

2. DISCOVERED ENTITIES (Find additional entities that aren't obvious):
   - Care episodes or care journeys
   - Care teams or provider networks
   - Quality measures or outcome indicators
   - Cost centers or financial patterns
   - Social/behavioral health factors
   - Care coordination touchpoints
   - Referral networks
   - Coverage/authorization entities

3. EXPLICIT RELATIONSHIPS (from foreign keys):
   - Map each foreign key to a healthcare relationship
   - Explain the healthcare semantics (e.g., FK from prescriptions to medications = PRESCRIBED relationship)

4. INFERRED RELATIONSHIPS (from patterns, NOT explicit foreign keys):
   - Junction tables suggest many-to-many relationships
   - Timestamp patterns suggest temporal relationships (e.g., "before", "during", "after")
   - Common columns across tables suggest implicit relationships
   - Care delivery patterns (e.g., specialist visits after diagnosis)

5. TEMPORAL PATTERNS:
   - Identify columns that track time (created_at, modified_at, valid_from, valid_to)
   - Versioning columns
   - Event sequence patterns

6. FOCUS AREAS:
${options?.focusAreas ? `Pay special attention to patterns relevant to: ${options.focusAreas.join(", ")}` : "Look for any patterns that could reveal healthcare delivery gaps."}

{format_instructions}

CRITICAL:
- Don't just map tables 1:1 to entities. Some tables represent relationships, some represent entity properties.
- Look for implicit relationships (e.g., patients visiting same provider suggests care continuity)
- Identify junction tables that model many-to-many relationships
- Consider temporal relationships (sequence of care events)
- Think about healthcare workflows and care delivery processes
- Minimum confidence level: ${options?.minConfidence || "medium"}

OUTPUT REQUIREMENTS:
- Be comprehensive but precise
- Explain your reasoning for each entity/relationship
- Distinguish between explicit (FK-based) and inferred relationships
- Include healthcare semantics (what does this relationship mean clinically?)
- Suggest properties for each relationship
`);

    const formatInstructions = this.parser.getFormatInstructions();

    // Format schema for LLM
    const schemaDescription = this.formatSchemaForLLM(tables);

    const input = await prompt.format({
      schema: schemaDescription,
      format_instructions: formatInstructions,
    });

    try {
      console.log("🤖 LLM analyzing schema...");
      const response = await this.llm.call([{ role: "user", content: input }]);
      const result = await this.parser.parse(response.content as string);

      console.log("✅ Schema analysis complete!");
      console.log(`   - Core entities: ${result.coreEntities.length}`);
      console.log(`   - Discovered entities: ${result.discoveredEntities.length}`);
      console.log(`   - Explicit relationships: ${result.explicitRelationships.length}`);
      console.log(`   - Inferred relationships: ${result.inferredRelationships.length}`);
      console.log(`   - Temporal patterns: ${result.temporalPatterns.length}`);

      return result;
    } catch (error: any) {
      console.error("❌ Schema analysis failed:", error);
      throw new Error(`Failed to analyze schema: ${error.message}`);
    }
  }

  /**
   * Format SQL schema for LLM consumption
   */
  private formatSchemaForLLM(tables: TableMetadata[]): string {
    let formatted = "DATABASE SCHEMA:\n\n";

    for (const table of tables) {
      formatted += `TABLE: ${table.schemaName}.${table.tableName}\n`;
      if (table.rowCount) {
        formatted += `  Rows: ~${table.rowCount.toLocaleString()}\n`;
      }
      formatted += `  Columns:\n`;

      for (const col of table.columns) {
        let colDesc = `    - ${col.name} (${col.dataType})`;
        if (col.isPrimaryKey) colDesc += " [PRIMARY KEY]";
        if (col.isForeignKey && col.foreignKeyRef) {
          colDesc += ` [FK → ${col.foreignKeyRef.table}.${col.foreignKeyRef.column}]`;
        }
        if (!col.isNullable) colDesc += " NOT NULL";
        formatted += colDesc + "\n";
      }

      if (table.indexes.length > 0) {
        formatted += `  Indexes:\n`;
        for (const idx of table.indexes) {
          formatted += `    - ${idx.name} on (${idx.columns.join(", ")})${idx.isUnique ? " UNIQUE" : ""}\n`;
        }
      }

      formatted += "\n";
    }

    return formatted;
  }

  /**
   * Generate Neo4j schema DDL from discovery results
   */
  async generateNeo4jSchema(
    discovery: z.infer<typeof SchemaDiscoveryResult>
  ): Promise<string> {
    console.log("📝 Generating Neo4j schema DDL...");

    const prompt = PromptTemplate.fromTemplate(`
You are a Neo4j database architect. Generate complete Neo4j schema DDL based on the discovered entities and relationships.

DISCOVERED SCHEMA:
{discoveryResult}

Generate Cypher DDL that includes:

1. CONSTRAINTS for each entity:
   - Unique ID constraints
   - Unique business key constraints (e.g., patient MRN, provider NPI)

2. PROPERTY INDEXES for frequently queried properties:
   - Name fields
   - Date fields
   - Status/category fields

3. TEMPORAL PROPERTIES on ALL nodes and relationships:
   - createdAt (datetime)
   - lastModified (datetime)
   - validFrom (datetime)
   - validTo (datetime - for temporal invalidation)

4. COMMENTS explaining healthcare semantics

5. EXAMPLE QUERIES for common use cases

OUTPUT FORMAT:
\`\`\`cypher
// Entity Constraints
CREATE CONSTRAINT <name> IF NOT EXISTS...

// Property Indexes
CREATE INDEX <name> IF NOT EXISTS...

// Temporal Indexes
CREATE INDEX <name> IF NOT EXISTS...

// Example Queries
// Query 1: Find gaps in care...
\`\`\`

Be comprehensive and follow Neo4j best practices.
`);

    const input = await prompt.format({
      discoveryResult: JSON.stringify(discovery, null, 2),
    });

    try {
      const response = await this.llm.call([{ role: "user", content: input }]);
      const ddl = response.content as string;

      console.log("✅ Neo4j schema DDL generated");
      return ddl;
    } catch (error: any) {
      console.error("❌ Schema DDL generation failed:", error);
      throw new Error(`Failed to generate Neo4j schema: ${error.message}`);
    }
  }

  /**
   * Validate discovery results with human review
   */
  generateReviewReport(
    discovery: z.infer<typeof SchemaDiscoveryResult>
  ): string {
    let report = "# Schema Discovery Review Report\n\n";
    report += `Generated: ${new Date().toISOString()}\n\n`;

    // Core Entities
    report += "## Core Healthcare Entities (Required)\n\n";
    for (const entity of discovery.coreEntities) {
      report += `### ${entity.name}\n`;
      report += `- **Source Table**: ${entity.sourceTable}\n`;
      report += `- **Description**: ${entity.description}\n`;
      report += `- **Key Properties**: ${entity.keyProperties.join(", ")}\n`;
      report += `- **Confidence**: ${entity.confidence}\n`;
      report += `- **Reasoning**: ${entity.reasoning}\n\n`;
    }

    // Discovered Entities
    report += "## Discovered Entities (LLM Found)\n\n";
    for (const entity of discovery.discoveredEntities) {
      report += `### ${entity.name}\n`;
      report += `- **Source Table**: ${entity.sourceTable}\n`;
      report += `- **Description**: ${entity.description}\n`;
      report += `- **Key Properties**: ${entity.keyProperties.join(", ")}\n`;
      report += `- **Confidence**: ${entity.confidence}\n`;
      report += `- **Reasoning**: ${entity.reasoning}\n\n`;
    }

    // Explicit Relationships
    report += "## Explicit Relationships (From Foreign Keys)\n\n";
    for (const rel of discovery.explicitRelationships) {
      report += `### ${rel.name}\n`;
      report += `- **Pattern**: (${rel.sourceEntity})-[:${rel.name}]->(${rel.targetEntity})\n`;
      report += `- **SQL Basis**: ${rel.sqlBasis}\n`;
      report += `- **Healthcare Meaning**: ${rel.healthcareSemantics}\n`;
      report += `- **Cardinality**: ${rel.cardinality}\n`;
      report += `- **Properties**: ${rel.properties.join(", ")}\n`;
      report += `- **Confidence**: ${rel.confidence}\n`;
      report += `- **Reasoning**: ${rel.reasoning}\n\n`;
    }

    // Inferred Relationships
    report += "## Inferred Relationships (Pattern-Based)\n\n";
    for (const rel of discovery.inferredRelationships) {
      report += `### ${rel.name}\n`;
      report += `- **Pattern**: (${rel.sourceEntity})-[:${rel.name}]->(${rel.targetEntity})\n`;
      report += `- **SQL Basis**: ${rel.sqlBasis}\n`;
      report += `- **Healthcare Meaning**: ${rel.healthcareSemantics}\n`;
      report += `- **Cardinality**: ${rel.cardinality}\n`;
      report += `- **Properties**: ${rel.properties.join(", ")}\n`;
      report += `- **Confidence**: ${rel.confidence}\n`;
      report += `- **Reasoning**: ${rel.reasoning}\n\n`;
    }

    // Temporal Patterns
    report += "## Temporal Patterns Identified\n\n";
    for (const pattern of discovery.temporalPatterns) {
      report += `- ${pattern}\n`;
    }
    report += "\n";

    // Recommendations
    report += "## Recommendations\n\n";
    for (const rec of discovery.recommendations) {
      report += `- ${rec}\n`;
    }
    report += "\n";

    report += "---\n\n";
    report += "## Next Steps\n\n";
    report += "1. Review discovered entities and relationships\n";
    report += "2. Validate healthcare semantics with domain experts\n";
    report += "3. Approve or modify proposed schema\n";
    report += "4. Generate Neo4j DDL\n";
    report += "5. Implement ETL with hybrid extraction\n";

    return report;
  }
}

// Export singleton
export const schemaDiscoveryAgent = new SchemaDiscoveryAgent();
