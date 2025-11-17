/**
 * Document-based Entity Extractor for Healthcare
 * Extracts entities and relationships from unstructured clinical text
 * Similar to LightRAG's approach but using LangChain
 */

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
  attributes: z.record(z.string()).describe("Additional attributes like MRN, ICD-10 codes, dosages"),
});

const ExtractedRelationship = z.object({
  source: z.string().describe("Source entity name"),
  target: z.string().describe("Target entity name"),
  type: z.string().describe("Relationship type (e.g., HAS_DIAGNOSIS, PRESCRIBED)"),
  attributes: z.record(z.string()).optional().describe("Relationship properties like dates, quantities"),
});

const ExtractedKnowledge = z.object({
  entities: z.array(ExtractedEntity).describe("All entities found in the text"),
  relationships: z.array(ExtractedRelationship).describe("All relationships between entities"),
  summary: z.string().optional().describe("Brief summary of the clinical note"),
});

/**
 * Document-based Entity Extractor for Healthcare
 * Comparable to LightRAG's entity extraction but using LangChain
 */
export class DocumentEntityExtractor {
  private llm: ChatOpenAI;
  private parser: StructuredOutputParser<typeof ExtractedKnowledge>;

  constructor() {
    this.llm = new ChatOpenAI({
      temperature: 0, // Deterministic for entity extraction
      modelName: "gpt-4o",
      azureOpenAIApiKey: process.env.AZURE_OPENAI_KEY,
      azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_INSTANCE_NAME || "arthur-health",
      azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o",
      azureOpenAIApiVersion: process.env.AZURE_OPENAI_VERSION || "2024-12-01-preview",
    });

    this.parser = StructuredOutputParser.fromZodSchema(ExtractedKnowledge);
  }

  /**
   * Extract entities and relationships from clinical text
   * This is the LangChain equivalent of LightRAG's entity extraction
   */
  async extractFromText(
    clinicalText: string,
    options?: {
      includeConfidence?: boolean;
      entityTypes?: string[];
    }
  ): Promise<z.infer<typeof ExtractedKnowledge>> {
    const prompt = PromptTemplate.fromTemplate(`
You are a medical information extraction system specialized in clinical text analysis.
Extract ALL relevant healthcare entities and relationships from the following clinical text.

ENTITY TYPES TO EXTRACT:
- Patient: Patient names, MRNs, demographic information
- Diagnosis: Medical conditions with ICD-10 codes when mentioned
- Medication: Drug names (generic/brand), dosages, frequencies, RxNorm codes
- Provider: Doctors, nurses, specialists with credentials and NPIs
- Facility: Hospitals, clinics, departments, locations
- Procedure: Medical procedures, tests, interventions with CPT codes

RELATIONSHIP TYPES:
- HAS_DIAGNOSIS: Patient has a medical condition
- PRESCRIBED: Medication prescribed to patient
- PERFORMED: Provider performed a procedure
- VISITED: Patient visited provider or facility
- REFERRED_TO: Patient referred to specialist
- ORDERED: Provider ordered test or procedure
- TREATS: Medication treats diagnosis
- WORKS_AT: Provider works at facility

EXTRACTION GUIDELINES:
1. Extract ALL entities mentioned, even if incomplete
2. Use standard medical coding (ICD-10, CPT, RxNorm, NPI) when available
3. Include temporal information (dates, durations) as attributes
4. Preserve relationships between entities accurately
5. Use exact names and codes from the text
6. If information is uncertain, still extract but note it in attributes

CLINICAL TEXT:
{text}

{format_instructions}

OUTPUT REQUIREMENTS:
- Be comprehensive - extract every entity mentioned
- Be precise - use medical terminology
- Be structured - follow the schema exactly
- Include confidence scores in attributes if uncertain

EXTRACTED KNOWLEDGE:
`);

    const formatInstructions = this.parser.getFormatInstructions();
    const input = await prompt.format({
      text: clinicalText,
      format_instructions: formatInstructions,
    });

    try {
      const response = await this.llm.call([{ role: "user", content: input }]);
      const parsed = await this.parser.parse(response.content as string);

      console.log(`✅ Extracted ${parsed.entities.length} entities and ${parsed.relationships.length} relationships`);

      return parsed;
    } catch (error: any) {
      console.error("❌ Entity extraction failed:", error);
      throw new Error(`Failed to extract entities: ${error.message}`);
    }
  }

  /**
   * Load extracted entities and relationships into Neo4j graph
   */
  async loadIntoGraph(
    extracted: z.infer<typeof ExtractedKnowledge>,
    options?: {
      sourceDocument?: string;
      skipDuplicates?: boolean;
    }
  ): Promise<{
    entitiesCreated: number;
    relationshipsCreated: number;
    errors: string[];
  }> {
    console.log(`📊 Loading knowledge into graph...`);

    const errors: string[] = [];
    let entitiesCreated = 0;
    let relationshipsCreated = 0;

    // Load entities
    for (const entity of extracted.entities) {
      try {
        await this.upsertEntity(entity, options?.sourceDocument);
        entitiesCreated++;
      } catch (error: any) {
        errors.push(`Entity ${entity.name}: ${error.message}`);
      }
    }

    // Load relationships
    for (const relationship of extracted.relationships) {
      try {
        await this.upsertRelationship(relationship);
        relationshipsCreated++;
      } catch (error: any) {
        errors.push(`Relationship ${relationship.source}->${relationship.target}: ${error.message}`);
      }
    }

    console.log(`✅ Loaded ${entitiesCreated} entities and ${relationshipsCreated} relationships`);
    if (errors.length > 0) {
      console.warn(`⚠️  ${errors.length} errors occurred`);
    }

    return { entitiesCreated, relationshipsCreated, errors };
  }

  /**
   * Upsert entity into Neo4j
   */
  private async upsertEntity(
    entity: z.infer<typeof ExtractedEntity>,
    sourceDocument?: string
  ): Promise<void> {
    // Validate entity type matches our schema
    const validTypes = ["Patient", "Diagnosis", "Medication", "Provider", "Facility", "Procedure"];
    if (!validTypes.includes(entity.type)) {
      throw new Error(`Invalid entity type: ${entity.type}`);
    }

    const query = `
      MERGE (e:${entity.type} {name: $name})
      SET e += $attributes
      SET e.extractedAt = datetime()
      SET e.extractionSource = 'document'
      ${sourceDocument ? "SET e.sourceDocument = $sourceDocument" : ""}
      SET e.lastUpdated = datetime()
      RETURN e
    `;

    await neo4jClient.query(query, {
      name: entity.name,
      attributes: entity.attributes,
      ...(sourceDocument && { sourceDocument }),
    });
  }

  /**
   * Upsert relationship into Neo4j
   * Note: Neo4j doesn't support parameterized relationship types in MERGE,
   * so we use APOC if available, or fallback to generic RELATED_TO
   */
  private async upsertRelationship(
    relationship: z.infer<typeof ExtractedRelationship>
  ): Promise<void> {
    // Check if APOC is available (for dynamic relationship types)
    try {
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
        SET rel.extractionSource = 'document'
        RETURN rel
      `;

      await neo4jClient.query(query, {
        sourceName: relationship.source,
        targetName: relationship.target,
        relType: relationship.type,
        attributes: relationship.attributes || {},
      });
    } catch (error) {
      // APOC not available or query failed - use predefined relationship types
      await this.createTypedRelationship(relationship);
    }
  }

  /**
   * Create relationship with predefined types
   * Maps extracted relationship types to our schema
   */
  private async createTypedRelationship(
    relationship: z.infer<typeof ExtractedRelationship>
  ): Promise<void> {
    // Map extracted types to schema types
    const typeMapping: Record<string, string> = {
      HAS_DIAGNOSIS: "HAS_DIAGNOSIS",
      PRESCRIBED: "PRESCRIBED",
      VISITED: "VISITED",
      PERFORMED: "PERFORMED",
      REFERRED_TO: "REFERRED_TO",
      ORDERED: "ORDERED",
      TREATS: "TREATS",
      WORKS_AT: "WORKS_AT",
      REQUIRES_PA: "REQUIRES_PA",
      ENROLLED_IN: "ENROLLED_IN",
    };

    const mappedType = typeMapping[relationship.type] || "RELATED_TO";

    const query = `
      MATCH (source {name: $sourceName})
      MATCH (target {name: $targetName})
      MERGE (source)-[r:${mappedType}]->(target)
      SET r += $attributes
      SET r.extractedAt = datetime()
      SET r.extractionSource = 'document'
      SET r.originalType = $originalType
      RETURN r
    `;

    await neo4jClient.query(query, {
      sourceName: relationship.source,
      targetName: relationship.target,
      attributes: relationship.attributes || {},
      originalType: relationship.type,
    });
  }

  /**
   * Process a batch of clinical documents
   * Useful for bulk ingestion of clinical notes
   */
  async processBatch(
    documents: Array<{ id: string; text: string }>,
    options?: {
      parallel?: number;
      onProgress?: (completed: number, total: number) => void;
    }
  ): Promise<{
    totalEntities: number;
    totalRelationships: number;
    totalDocuments: number;
    errors: Array<{ documentId: string; error: string }>;
  }> {
    const parallel = options?.parallel || 1;
    const errors: Array<{ documentId: string; error: string }> = [];

    let totalEntities = 0;
    let totalRelationships = 0;
    let completed = 0;

    console.log(`📚 Processing ${documents.length} documents (parallelism: ${parallel})...`);

    // Process in batches for parallel execution
    for (let i = 0; i < documents.length; i += parallel) {
      const batch = documents.slice(i, i + parallel);

      const results = await Promise.allSettled(
        batch.map(async (doc) => {
          const extracted = await this.extractFromText(doc.text);
          const loaded = await this.loadIntoGraph(extracted, {
            sourceDocument: doc.id,
          });

          return {
            documentId: doc.id,
            ...loaded,
          };
        })
      );

      // Process results
      for (const result of results) {
        completed++;

        if (result.status === "fulfilled") {
          totalEntities += result.value.entitiesCreated;
          totalRelationships += result.value.relationshipsCreated;

          if (result.value.errors.length > 0) {
            errors.push({
              documentId: result.value.documentId,
              error: result.value.errors.join("; "),
            });
          }
        } else {
          errors.push({
            documentId: batch[results.indexOf(result)].id,
            error: result.reason.message,
          });
        }

        // Report progress
        if (options?.onProgress) {
          options.onProgress(completed, documents.length);
        }
      }

      // Add small delay to avoid rate limiting
      if (i + parallel < documents.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    console.log(`✅ Batch processing complete!`);
    console.log(`   - Documents: ${documents.length}`);
    console.log(`   - Entities: ${totalEntities}`);
    console.log(`   - Relationships: ${totalRelationships}`);
    console.log(`   - Errors: ${errors.length}`);

    return {
      totalEntities,
      totalRelationships,
      totalDocuments: documents.length,
      errors,
    };
  }

  /**
   * Extract and merge with existing graph data
   * Useful for enriching structured data with unstructured insights
   */
  async enrichExistingGraph(
    patientId: string,
    clinicalText: string
  ): Promise<{
    entitiesLinked: number;
    newInsights: string[];
  }> {
    // Extract from text
    const extracted = await this.extractFromText(clinicalText);

    // Link to existing patient node
    const linkQuery = `
      MATCH (p:Patient {id: $patientId})
      MATCH (e)
      WHERE e.name IN $entityNames
        AND e.extractionSource = 'document'
      MERGE (p)-[r:MENTIONED_IN_NOTE]->(e)
      SET r.noteDate = datetime()
      RETURN count(r) as linked
    `;

    const entityNames = extracted.entities.map((e) => e.name);
    const result = await neo4jClient.query<{ linked: number }>(linkQuery, {
      patientId,
      entityNames,
    });

    // Identify new insights (entities not previously in graph)
    const newInsights = extracted.entities
      .filter((e) => !e.attributes.existingInGraph)
      .map((e) => `${e.type}: ${e.name}`);

    return {
      entitiesLinked: result[0]?.linked || 0,
      newInsights,
    };
  }
}

// Export singleton instance
export const documentExtractor = new DocumentEntityExtractor();
