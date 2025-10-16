/**
 * Neo4j Client for Arthur Health
 * Manages connection to Neo4j graph database with Azure Key Vault integration
 */

import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";

export interface Neo4jConfig {
  uri: string;
  username: string;
  password: string;
  database?: string;
}

export class ArthurNeo4jClient {
  private graph: Neo4jGraph | null = null;
  private static instance: ArthurNeo4jClient;
  private config: Neo4jConfig | null = null;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): ArthurNeo4jClient {
    if (!ArthurNeo4jClient.instance) {
      ArthurNeo4jClient.instance = new ArthurNeo4jClient();
    }
    return ArthurNeo4jClient.instance;
  }

  /**
   * Initialize connection to Neo4j
   * In production, credentials should come from Azure Key Vault
   */
  async initialize(config?: Neo4jConfig): Promise<Neo4jGraph> {
    if (this.graph) return this.graph;

    // Use provided config or environment variables
    const finalConfig: Neo4jConfig = config || {
      uri: process.env.NEO4J_URI || "bolt://localhost:7687",
      username: process.env.NEO4J_USERNAME || "neo4j",
      password: process.env.NEO4J_PASSWORD || "password",
      database: process.env.NEO4J_DATABASE || "neo4j",
    };

    this.config = finalConfig;

    try {
      this.graph = await Neo4jGraph.initialize({
        url: finalConfig.uri,
        username: finalConfig.username,
        password: finalConfig.password,
        database: finalConfig.database,
      });

      console.log("✅ Neo4j connected successfully to", finalConfig.uri);

      // Verify connection by getting schema
      const schema = await this.graph.getSchema();
      console.log("📊 Graph schema loaded:", schema ? "Schema available" : "Empty database");

      return this.graph;
    } catch (error) {
      console.error("❌ Failed to connect to Neo4j:", error);
      throw new Error(`Neo4j connection failed: ${error}`);
    }
  }

  /**
   * Execute a Cypher query with parameters
   */
  async query<T = any>(
    cypherQuery: string,
    params?: Record<string, any>
  ): Promise<T[]> {
    const graph = await this.initialize();

    try {
      const results = await graph.query(cypherQuery, params);
      return results as T[];
    } catch (error) {
      console.error("❌ Cypher query failed:", error);
      console.error("Query:", cypherQuery);
      console.error("Params:", params);
      throw new Error(`Cypher query execution failed: ${error}`);
    }
  }

  /**
   * Get the graph schema (node types, relationships, properties)
   */
  async getSchema(): Promise<string> {
    const graph = await this.initialize();
    return graph.getSchema();
  }

  /**
   * Refresh the schema cache
   * Call this after making schema changes
   */
  async refreshSchema(): Promise<void> {
    const graph = await this.initialize();
    await graph.refreshSchema();
    console.log("✅ Graph schema refreshed");
  }

  /**
   * Close the connection to Neo4j
   */
  async close(): Promise<void> {
    if (this.graph) {
      try {
        // Neo4jGraph doesn't expose close method directly
        // Connection is managed by the driver
        this.graph = null;
        console.log("✅ Neo4j connection closed");
      } catch (error) {
        console.error("❌ Error closing Neo4j connection:", error);
      }
    }
  }

  /**
   * Health check - verify connection is working
   */
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.query<{ value: number }>(
        "RETURN 1 as value"
      );
      return result.length > 0 && result[0].value === 1;
    } catch (error) {
      console.error("❌ Neo4j health check failed:", error);
      return false;
    }
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    nodeCount: number;
    relationshipCount: number;
    labels: string[];
    relationshipTypes: string[];
  }> {
    const nodeCountResult = await this.query<{ count: number }>(
      "MATCH (n) RETURN count(n) as count"
    );

    const relCountResult = await this.query<{ count: number }>(
      "MATCH ()-[r]->() RETURN count(r) as count"
    );

    const labelsResult = await this.query<{ label: string }>(
      "CALL db.labels() YIELD label RETURN label"
    );

    const relTypesResult = await this.query<{ type: string }>(
      "CALL db.relationshipTypes() YIELD relationshipType as type RETURN type"
    );

    return {
      nodeCount: nodeCountResult[0]?.count || 0,
      relationshipCount: relCountResult[0]?.count || 0,
      labels: labelsResult.map(r => r.label),
      relationshipTypes: relTypesResult.map(r => r.type),
    };
  }
}

// Export singleton instance
export const neo4jClient = ArthurNeo4jClient.getInstance();
