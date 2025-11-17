import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { sqlTools } from "./sql-tools";

/**
 * Ship Sticks Database Schema Context
 * Comprehensive guide for the SQL agent to understand the database structure
 */
const DATABASE_SCHEMA_CONTEXT = `
You are a SQL expert for Ship Sticks, a golf club shipping company. You have access to a PostgreSQL database with the following tables:

CORE BUSINESS TABLES:
1. customers - Customer profiles (customer_id, email, name, acquisition_channel, lifetime_value, customer_segment)
2. shipments - Shipment tracking and financials (shipment_id, customer_id, tracking_number, origin/destination, carrier, status, dates, pricing, margins, insurance)
3. partner_courses - Golf course partnerships (course_id, course_name, partnership_type, location, commission_rate, ratings)
4. tracking_events - Carrier tracking updates (event_id, shipment_id, event_type, timestamp, location, status_code)
5. insurance_claims - Claims processing (claim_id, shipment_id, claim_amount, status, resolution_date, payout)
6. customer_service_tickets - Support tickets (ticket_id, customer_id, type, priority, resolution_time, satisfaction_score)
7. routes - Route performance (route_id, origin/destination, distance, failure_rate, damage_rate, avg_margin)
8. marketing_campaigns - Marketing ROI (campaign_id, name, type, spend, conversions, revenue, roi)
9. customer_sessions - Web behavior (session_id, customer_id, source, quotes, cart_value, abandonment_stage)
10. nps_surveys - Customer satisfaction (survey_id, nps_score, likelihood_to_recommend, comments)
11. daily_metrics - Daily KPIs (metric_date, shipments, deliveries, success_rate, revenue, margins, nps)

ANALYTICS TABLES:
12. customer_lifetime_stats - Customer behavior aggregations
13. route_performance_monthly - Monthly route analytics
14. partner_performance - Monthly partner metrics
15. carrier_performance - Carrier reliability by route

KEY RELATIONSHIPS:
- shipments.customer_id → customers.customer_id
- shipments.partner_course_id → partner_courses.course_id
- tracking_events.shipment_id → shipments.shipment_id
- insurance_claims.shipment_id → shipments.shipment_id

IMPORTANT WORKFLOW - FOLLOW THESE STEPS IN ORDER:
1. ALWAYS start by calling sql_db_list_tables to see available tables
2. THEN call sql_db_schema for the relevant tables you'll query
3. Generate a SQL query based on the schema information
4. ALWAYS call sql_db_query_checker to validate your query before executing
5. Execute the query with sql_db_query
6. If query fails, analyze the error, fix it, and try again (max 2 retries)
7. Return ONLY the query results in JSON format - do NOT provide business analysis or insights

QUERY BEST PRACTICES:
- Use proper JOIN conditions when combining tables
- Always use LIMIT to prevent large result sets (default 100 will be added if missing)
- For date calculations: Use (date1 - date2) for days between dates
- For percentages: Multiply by 100.0 for proper decimal calculation
- Group by actual column names, not aliases
- Use descriptive column aliases for clarity (e.g., SELECT customer_id as customer, SUM(revenue) as total_revenue)
- Use CAST or :: for type conversions
- For date filtering: Use DATE() function or proper timestamp comparison

COLUMN NAMING CONVENTIONS:
- Use snake_case for all identifiers (customer_id, not customerId)
- Common columns: *_id (primary keys), *_at (timestamps), *_date (dates)
- Status columns usually use lowercase strings ('delivered', 'in_transit', etc.)

REMEMBER: You are the SQL specialist. Your job is to:
1. Understand the question
2. Find the right tables using sql_db_list_tables
3. Get schema details using sql_db_schema
4. Generate accurate SQL using best practices
5. Validate with sql_db_query_checker
6. Execute with sql_db_query
7. Return clean data in JSON format

Another AI will analyze the results and provide business insights. You ONLY generate and execute SQL.
`;

/**
 * Initialize Azure OpenAI chat model for SQL generation
 * Uses GPT-4 with low temperature for precise SQL
 */
const azureApiKey = process.env.AZURE_OPENAI_KEY;
const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
const azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT;
const azureVersion = process.env.AZURE_OPENAI_VERSION;

if (!azureApiKey || !azureEndpoint) {
  console.warn("⚠️  Azure OpenAI credentials not found. SQL Agent will not function.");
}

const llm = new ChatOpenAI({
  model: azureDeployment || "gpt-4o-mini",
  temperature: 0.1, // Low temperature for precise SQL generation
  configuration: {
    baseURL: `${azureEndpoint}/openai/deployments/${azureDeployment}`,
    defaultHeaders: {
      "api-key": azureApiKey,
    },
    defaultQuery: {
      "api-version": azureVersion || "2024-12-01-preview",
    },
  },
  azureOpenAIApiKey: azureApiKey,
  azureOpenAIApiInstanceName: azureEndpoint?.split('.')[0]?.split('//')[1] || "",
  azureOpenAIApiDeploymentName: azureDeployment,
  azureOpenAIApiVersion: azureVersion || "2024-12-01-preview",
});

/**
 * Create the SQL agent with ReAct pattern
 * The agent will reason about which tools to use and in what order
 */
export const sqlAgent = createReactAgent({
  llm,
  tools: sqlTools,
  messageModifier: new SystemMessage(DATABASE_SCHEMA_CONTEXT),
});

/**
 * Run the SQL agent with a user question
 * @param question User's natural language question about Ship Sticks data
 * @returns Object containing SQL query, results, error (if any), and execution trace
 */
export async function runSqlAgent(question: string): Promise<{
  sqlQuery: string | null;
  queryResults: { columns: string[]; rows: any[][] } | null;
  error: string | null;
  agentTrace: any[];
}> {
  const agentTrace: any[] = [];
  let sqlQuery: string | null = null;
  let queryResults: { columns: string[]; rows: any[][] } | null = null;
  let error: string | null = null;

  try {
    console.log('\n🤖 Starting SQL Agent for question:', question);

    const stream = await sqlAgent.stream(
      {
        messages: [new HumanMessage(question)],
      },
      {
        streamMode: "values", // Get full state after each step
        configurable: { thread_id: `sql_agent_${Date.now()}` },
      }
    );

    // Collect all messages and tool calls from the agent
    for await (const chunk of stream) {
      agentTrace.push(chunk);

      // Extract from the messages array in the chunk
      if (chunk.messages && Array.isArray(chunk.messages)) {
        const lastMessage = chunk.messages[chunk.messages.length - 1];

        // Check if this is an AI message with tool calls
        if (lastMessage._getType && lastMessage._getType() === 'ai' && 'tool_calls' in lastMessage) {
          const aiMsg = lastMessage as AIMessage;
          if (aiMsg.tool_calls && aiMsg.tool_calls.length > 0) {
            for (const toolCall of aiMsg.tool_calls) {
              // Extract SQL query when sql_db_query is called
              if (toolCall.name === 'sql_db_query') {
                sqlQuery = (toolCall.args as any).query || null;
                console.log('📝 SQL Query extracted:', sqlQuery);
              }
            }
          }
        }

        // Check for tool response with query results
        if (lastMessage._getType && lastMessage._getType() === 'tool') {
          const content = lastMessage.content as string;

          // Parse results if query was executed successfully
          if (content.includes('Query executed successfully')) {
            console.log('✅ Query executed successfully, parsing results...');
            try {
              // Extract JSON results from the content
              const jsonMatch = content.match(/Results:\n([\s\S]+)/);
              if (jsonMatch) {
                const results = JSON.parse(jsonMatch[1]);

                if (Array.isArray(results) && results.length > 0) {
                  const columns = Object.keys(results[0]);
                  const rows = results.map((row: any) =>
                    columns.map(col => row[col])
                  );
                  queryResults = { columns, rows };
                  console.log(`✅ Parsed ${rows.length} rows with ${columns.length} columns`);
                } else if (Array.isArray(results) && results.length === 0) {
                  // Empty results array
                  queryResults = { columns: [], rows: [] };
                  console.log('⚠️  Query returned no results');
                }
              }
            } catch (parseError) {
              console.error('❌ Error parsing query results:', parseError);
              error = "Failed to parse query results. The query may have returned invalid data.";
            }
          }

          // Check for SQL errors
          if (content.startsWith('SQL Error:')) {
            error = content;
            console.log('❌ SQL Error detected:', error.substring(0, 100));
          }
        }
      }
    }

    console.log('\n📊 Agent execution complete:');
    console.log('- SQL Query:', sqlQuery ? 'Found' : 'Not found');
    console.log('- Results:', queryResults ? `${queryResults.rows.length} rows` : 'Not found');
    console.log('- Error:', error || 'None');

    // If we didn't get results but have a query, it might have failed
    if (sqlQuery && !queryResults && !error) {
      error = "Query was generated but execution did not return results. Check database connection and query validity.";
    }

  } catch (agentError: any) {
    error = `Agent error: ${agentError.message}`;
    console.error('❌ SQL Agent error:', agentError);
  }

  return {
    sqlQuery,
    queryResults,
    error,
    agentTrace,
  };
}

/**
 * Initialize the SQL agent and database connection
 * Call this on server startup to verify connectivity
 */
export async function initializeSqlAgent() {
  try {
    const { getLangChainDataSource, initializeSchemaCache } = await import('./langchain-config');
    await getLangChainDataSource();
    console.log('✅ SQL Agent database connected');

    // Initialize schema cache to speed up all queries
    const cacheInitialized = await initializeSchemaCache();
    if (cacheInitialized) {
      console.log('✅ SQL Agent schema cache ready');
    } else {
      console.warn('⚠️  SQL Agent running without schema cache (slower performance)');
    }

    console.log('✅ SQL Agent fully initialized');
    return true;
  } catch (error: any) {
    console.error('❌ Failed to initialize SQL Agent:', error.message);
    console.error('💡 Make sure DATABASE_URL is set in .env.local');
    return false;
  }
}
