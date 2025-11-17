import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { executeQuery, getCachedSchema } from "./langchain-config";
import { sanitizeSqlQuery } from "./sql-tools";

/**
 * Fast Path SQL Agent
 * Single LLM call to generate and execute SQL queries
 * Bypasses the ReAct agent pattern for simple queries
 *
 * Performance: ~10-15 seconds vs 90+ seconds for full agent
 * Use Case: Simple aggregations, comparisons, top N queries
 */

/**
 * Generate system prompt dynamically with cached schema
 * This ensures we always use the actual database schema
 */
async function getFastSqlSystemPrompt(): Promise<string> {
  // Get the cached schema from the database
  const schemaContext = await getCachedSchema();

  return `You are a SQL expert for Ship Sticks, a golf club shipping company.

DATABASE SCHEMA:
${schemaContext}

YOUR TASK:
You are a SQL generation specialist. Generate a single, optimized PostgreSQL query to answer the user's question.

RESPONSE FORMAT:
Return ONLY the SQL query, nothing else. No explanations, no markdown, no additional text.
The query should be ready to execute directly.

REQUIREMENTS:
1. Generate valid PostgreSQL SQL
2. Use only tables and columns from the schema above
3. Include appropriate WHERE clauses for filtering
4. Use proper JOIN syntax when needed
5. Order results logically (usually by the main metric DESC)
6. Limit results to 100 rows maximum
7. Use descriptive column aliases for clarity

SQL BEST PRACTICES:
- Always use LIMIT 100 (will be added automatically if missing)
- Use proper JOIN conditions when combining tables
- For percentages: multiply by 100.0 for decimal calculation
- Group by actual column names, not aliases
- Use CAST or :: for type conversions
- For date filtering: Use DATE() or proper timestamp comparison

Now generate the SQL query for the user's question:`;
}

/**
 * Initialize Azure OpenAI for fast SQL generation
 * Uses same model as full agent for consistency
 */
const azureApiKey = process.env.AZURE_OPENAI_KEY;
const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
const azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT;
const azureVersion = process.env.AZURE_OPENAI_VERSION;

const fastLLM = new ChatOpenAI({
  model: azureDeployment || "gpt-4o-mini",
  temperature: 0.1, // Low temperature for precise SQL
  configuration: {
    baseURL: `${azureEndpoint}/openai/deployments/${azureDeployment}`,
    defaultHeaders: {
      "api-key": azureApiKey,
    },
    defaultQuery: {
      "api-version": azureVersion || "2024-12-01-preview",
    },
  },
});

/**
 * Run the fast SQL agent
 * Single LLM call to generate SQL, then execute it
 *
 * @param question User's natural language question
 * @returns SQL query, results, and any errors
 */
export async function runFastSqlAgent(question: string): Promise<{
  sqlQuery: string | null;
  queryResults: { columns: string[]; rows: any[][] } | null;
  error: string | null;
  executionTimeMs: number;
}> {
  const startTime = Date.now();
  let sqlQuery: string | null = null;
  let queryResults: { columns: string[]; rows: any[][] } | null = null;
  let error: string | null = null;

  try {
    console.log('\n⚡ Fast SQL Agent starting for question:', question);

    // Get the dynamic system prompt with cached schema
    const systemPrompt = await getFastSqlSystemPrompt();

    // Single LLM call to generate SQL
    const response = await fastLLM.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(question)
    ]);

    sqlQuery = (response.content as string).trim();

    // Clean up the SQL (remove markdown if present)
    sqlQuery = sqlQuery
      .replace(/```sql\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^SQL:\s*/i, '')
      .trim();

    console.log('📝 Generated SQL:', sqlQuery);

    // Sanitize and validate the query
    try {
      sqlQuery = sanitizeSqlQuery(sqlQuery);
    } catch (sanitizeError: any) {
      error = `Query validation failed: ${sanitizeError.message}`;
      console.error('❌ Sanitization error:', error);
      return { sqlQuery, queryResults, error, executionTimeMs: Date.now() - startTime };
    }

    // Execute the query
    console.log('🔍 Executing query...');
    const results = await executeQuery(sqlQuery);

    if (!results || results.length === 0) {
      queryResults = { columns: [], rows: [] };
      console.log('⚠️  Query returned no results');
    } else {
      const columns = Object.keys(results[0]);
      const rows = results.map((row: any) => columns.map(col => row[col]));
      queryResults = { columns, rows };
      console.log(`✅ Query returned ${rows.length} rows with ${columns.length} columns`);
    }

  } catch (agentError: any) {
    error = `Fast agent error: ${agentError.message}`;
    console.error('❌ Fast SQL Agent error:', agentError);
  }

  const executionTimeMs = Date.now() - startTime;
  console.log(`⏱️  Fast agent completed in ${executionTimeMs}ms (${(executionTimeMs / 1000).toFixed(1)}s)`);

  return {
    sqlQuery,
    queryResults,
    error,
    executionTimeMs
  };
}
