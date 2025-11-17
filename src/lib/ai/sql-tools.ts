import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { executeQuery, getTableNames, getTableSchema, getCachedTableNames, getCachedSchema } from "./langchain-config";

/**
 * SQL Safety Validation Patterns
 * Prevents destructive operations on the Ship Sticks database
 */
const DENY_RE = /\b(INSERT|UPDATE|DELETE|ALTER|DROP|CREATE|REPLACE|TRUNCATE|GRANT|REVOKE)\b/i;
const HAS_LIMIT_RE = /\bLIMIT\b\s+\d+/i;

/**
 * Sanitize and validate SQL queries for safety
 * - Blocks destructive operations (INSERT, UPDATE, DELETE, etc.)
 * - Enforces read-only SELECT queries
 * - Automatically adds LIMIT 100 if missing
 * - Removes SQL injection attempts
 *
 * @param query Raw SQL query string
 * @returns Sanitized, safe SQL query
 * @throws Error if query is invalid or dangerous
 */
export function sanitizeSqlQuery(query: string): string {
  let sanitized = query.trim();

  // Remove markdown code blocks if present
  sanitized = sanitized.replace(/```sql\n?/g, "").replace(/```\n?/g, "").trim();

  // Block multiple statements (allow one optional trailing semicolon)
  const semicolons = sanitized.split(';').filter(s => s.trim()).length;
  if (semicolons > 1) {
    throw new Error("Multiple SQL statements are not allowed. Please provide a single query.");
  }

  // Remove trailing semicolons
  sanitized = sanitized.replace(/;+\s*$/g, "").trim();

  // Enforce read-only queries
  if (!sanitized.toLowerCase().startsWith("select") &&
      !sanitized.toLowerCase().startsWith("with")) {
    throw new Error("Only SELECT and WITH queries are allowed. This is a read-only database.");
  }

  // Check for destructive operations
  if (DENY_RE.test(sanitized)) {
    throw new Error("DML/DDL operations detected. Only read-only SELECT queries are permitted.");
  }

  // Add LIMIT if not present to prevent runaway queries
  if (!HAS_LIMIT_RE.test(sanitized)) {
    sanitized += " LIMIT 100";
  }

  return sanitized;
}

/**
 * Tool 1: List all available tables in the Ship Sticks database
 * This should be the FIRST tool the agent calls to understand available data
 * Now uses cached table names for faster performance
 */
export const listTablesTool = tool(
  async () => {
    try {
      const tables = await getCachedTableNames();
      // Filter out internal conversation tables used by the assistant
      const filteredTables = tables.filter(t =>
        !['conversations', 'messages'].includes(t)
      );

      return `Available tables in Ship Sticks database: ${filteredTables.join(', ')}

Ship Sticks Business Data:
- customers: Customer profiles and acquisition data
- shipments: Golf equipment shipments with pricing and status
- tracking_events: Real-time shipment tracking updates
- partner_courses: Golf course partnerships worldwide
- routes: Shipping route performance and metrics
- insurance_claims: Claims processing and payouts
- customer_service_tickets: Support tickets and resolution
- marketing_campaigns: Campaign performance and ROI
- customer_sessions: Web behavior and conversion funnels
- nps_surveys: Customer satisfaction scores
- daily_metrics: Aggregated daily KPIs
- customer_lifetime_stats: Long-term customer value
- route_performance_monthly: Time-series route analytics
- partner_performance: Monthly partner metrics
- carrier_performance: Carrier reliability by route

Total: ${filteredTables.length} tables with 65,000+ records`;
    } catch (error: any) {
      return `Error listing tables: ${error.message}`;
    }
  },
  {
    name: "sql_db_list_tables",
    description: "List all available tables in the Ship Sticks database. Use this FIRST to see what data is available before generating queries. Returns table names with brief descriptions.",
    schema: z.object({}),
  }
);

/**
 * Tool 2: Get detailed schema for specific tables
 * Call this AFTER listing tables to understand structure before writing queries
 * Now uses cached schema for faster performance
 */
export const getSchemaTool = tool(
  async ({ tables }: { tables: string }) => {
    try {
      const tableList = tables.split(',').map(t => t.trim()).filter(t => t);

      if (tableList.length === 0) {
        return "Error: No tables specified. Please provide comma-separated table names (e.g., 'shipments, customers').";
      }

      const schema = await getCachedSchema(tableList);
      return schema;
    } catch (error: any) {
      return `Error fetching schema: ${error.message}`;
    }
  },
  {
    name: "sql_db_schema",
    description: "Get detailed schema information for specific tables including columns, data types, foreign keys, and sample data. Input should be comma-separated table names (e.g., 'shipments, customers'). Use this BEFORE writing queries to understand table structure.",
    schema: z.object({
      tables: z.string().describe("Comma-separated list of table names to get schemas for"),
    }),
  }
);

/**
 * Tool 3: Validate SQL query before execution
 * Call this to check query syntax and safety before executing
 */
export const queryCheckerTool = tool(
  async ({ query }: { query: string }) => {
    try {
      // Try to sanitize - this will throw if invalid
      const sanitized = sanitizeSqlQuery(query);

      // Basic validation checks
      const issues: string[] = [];

      // Check for common mistakes
      if (sanitized.includes('*') && sanitized.includes('GROUP BY')) {
        issues.push("Warning: Using SELECT * with GROUP BY may cause issues. Specify exact columns.");
      }

      if (!sanitized.toUpperCase().includes('FROM')) {
        issues.push("Error: Query must include a FROM clause.");
      }

      // Check for potential cartesian products
      if (sanitized.toUpperCase().includes('JOIN') &&
          !sanitized.toUpperCase().includes('ON')) {
        issues.push("Warning: JOIN without ON clause may create a cartesian product.");
      }

      if (issues.length > 0) {
        return `Query validation found issues:\n${issues.join('\n')}\n\nQuery:\n${sanitized}`;
      }

      return `✓ Query looks good:\n${sanitized}\n\nThis query is safe to execute.`;
    } catch (error: any) {
      return `✗ Query validation failed: ${error.message}`;
    }
  },
  {
    name: "sql_db_query_checker",
    description: "Validate a SQL query for correctness and safety before execution. Use this tool to double-check your query and catch common mistakes. Always call this BEFORE sql_db_query.",
    schema: z.object({
      query: z.string().describe("The SQL query to validate"),
    }),
  }
);

/**
 * Tool 4: Execute SQL query against the database
 * This is the FINAL tool - only call after listing tables, getting schema, and validating
 */
export const executeSqlTool = tool(
  async ({ query }: { query: string }) => {
    try {
      // Validate and sanitize the query
      const sanitized = sanitizeSqlQuery(query);

      console.log('🔍 Executing SQL query:', sanitized);

      // Execute the query
      const results = await executeQuery(sanitized);

      if (!results || results.length === 0) {
        return "Query executed successfully but returned no results. This could mean:\n- No data matches the criteria\n- The filters are too restrictive\n- The date range has no activity\n\nConsider adjusting your query parameters.";
      }

      // Format results for LLM analysis
      const columns = Object.keys(results[0]);
      const rowCount = results.length;

      // Return structured data for insights generation
      let output = `Query executed successfully. Found ${rowCount} row(s).\n\n`;
      output += `Columns: ${columns.join(', ')}\n\n`;
      output += `Results:\n`;
      output += JSON.stringify(results, null, 2);

      return output;
    } catch (error: any) {
      return `SQL Error: ${error.message}\n\nPlease check your query syntax and try again. Common issues:\n- Table or column names may be incorrect (check schema with sql_db_schema)\n- JOIN conditions might be wrong\n- Aggregation without GROUP BY\n- Invalid date/number formats\n- Missing quotes around string values`;
    }
  },
  {
    name: "sql_db_query",
    description: "Execute a SQL query against the Ship Sticks database. Only SELECT queries are allowed. The query will be automatically limited to 100 rows if no LIMIT is specified. Always use sql_db_query_checker before executing to validate the query. This is the FINAL step after listing tables and getting schemas.",
    schema: z.object({
      query: z.string().describe("A valid PostgreSQL SELECT query to execute"),
    }),
  }
);

/**
 * Export all SQL tools for the LangChain agent
 * Tools will be called in order: list tables → get schema → validate → execute
 */
export const sqlTools = [
  listTablesTool,
  getSchemaTool,
  queryCheckerTool,
  executeSqlTool,
];
