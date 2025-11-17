import { NextRequest, NextResponse } from 'next/server';
import { runSqlAgent } from '@/lib/ai/sql-agent';
import { runFastSqlAgent } from '@/lib/ai/sql-agent-fast';
import { classifyQueryComplexity } from '@/lib/ai/query-classifier';
import { generateInsights, generateErrorInsights, type ResponseMode } from '@/lib/ai/insights-generator';
import { generateChartData, isChartable } from '@/lib/ai/chart-generator';

/**
 * POST /api/sql-agent
 * Execute natural language SQL queries with the LangChain SQL agent
 *
 * Request Body:
 * {
 *   question: string              // User's natural language question
 *   responseMode: "quick" | "pro" // Analysis depth (default: "quick")
 * }
 *
 * Response:
 * {
 *   success: boolean
 *   response: string              // Markdown-formatted insights
 *   sqlQuery: string | null       // Generated SQL query
 *   queryResults: {...} | null    // Query results with columns and rows
 *   chartData: {...} | null       // Chart.js-compatible chart data
 *   error: string | null          // Error message if any
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { question, responseMode = "quick" } = body;

    // Validate input
    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Question is required and must be a string',
          response: 'Please provide a valid question about Ship Sticks data.',
        },
        { status: 400 }
      );
    }

    // Validate response mode
    if (responseMode !== 'quick' && responseMode !== 'pro') {
      return NextResponse.json(
        {
          success: false,
          error: 'Response mode must be "quick" or "pro"',
          response: 'Invalid response mode specified.',
        },
        { status: 400 }
      );
    }

    console.log(`\n🎯 SQL Agent API Request:`);
    console.log(`   Question: ${question}`);
    console.log(`   Mode: ${responseMode.toUpperCase()}`);

    // Step 1: Classify query complexity to determine routing
    const classification = classifyQueryComplexity(question);
    console.log(`   Complexity: ${classification.complexity.toUpperCase()} (confidence: ${(classification.confidence * 100).toFixed(0)}%)`);
    console.log(`   Reason: ${classification.reason}`);
    console.log(`   Using Fast Path: ${classification.useFastPath ? 'YES ⚡' : 'NO (full agent)'}`);

    // Step 2: Route to appropriate agent
    let sqlQuery: string | null = null;
    let queryResults: { columns: string[]; rows: any[][] } | null = null;
    let agentError: string | null = null;
    let agentTrace: any[] | undefined = undefined;
    let executionTimeMs: number | undefined = undefined;

    if (classification.useFastPath) {
      // Fast Path: Single LLM call for simple queries
      const fastResult = await runFastSqlAgent(question);
      sqlQuery = fastResult.sqlQuery;
      queryResults = fastResult.queryResults;
      agentError = fastResult.error;
      executionTimeMs = fastResult.executionTimeMs;
    } else {
      // Full Agent: ReAct pattern for complex queries
      const fullResult = await runSqlAgent(question);
      sqlQuery = fullResult.sqlQuery;
      queryResults = fullResult.queryResults;
      agentError = fullResult.error;
      agentTrace = fullResult.agentTrace;
    }

    // Step 3: Generate chart data if we have results
    let chartData: any = null;
    if (queryResults && queryResults.rows.length > 0) {
      if (isChartable(queryResults.columns, queryResults.rows)) {
        chartData = generateChartData(queryResults.columns, queryResults.rows);
        console.log(`   📊 Chart: ${chartData ? chartData.type : 'none'}`);
      } else {
        console.log('   📊 Chart: Data not suitable for visualization');
      }
    }

    // Step 4: Generate business insights
    let response: string;
    if (queryResults && !agentError) {
      // Success - generate insights from results
      response = await generateInsights(
        question,
        sqlQuery || "",
        queryResults,
        responseMode as ResponseMode
      );
      console.log(`   ✅ Insights: ${responseMode} mode (${response.length} chars)`);
    } else if (agentError) {
      // Error - generate helpful error message
      response = await generateErrorInsights(
        question,
        sqlQuery,
        agentError
      );
      console.log(`   ❌ Error insights generated`);
    } else {
      // Unexpected state - no results and no error
      response = "I encountered an issue processing your question. Please try rephrasing it or asking about different data.";
      console.log(`   ⚠️  Unexpected state: No results and no error`);
    }

    // Step 5: Return the complete response with performance metadata
    return NextResponse.json({
      success: !agentError,
      response,
      sqlQuery,
      queryResults,
      chartData,
      error: agentError,
      // Performance and routing metadata
      metadata: {
        complexity: classification.complexity,
        usedFastPath: classification.useFastPath,
        confidence: classification.confidence,
        executionTimeMs: executionTimeMs,
        reason: classification.reason
      },
      // Include trace for debugging (optional, can be removed in production)
      // agentTrace,
    });

  } catch (error: any) {
    console.error('❌ SQL Agent API Error:', error);

    // Check if it's a database connection error
    if (error.message?.includes('DATABASE_URL')) {
      return NextResponse.json({
        success: false,
        response: `## ⚠️ Database Not Configured

The SQL analytics feature requires a PostgreSQL database connection. Please contact your administrator to set up the Ship Sticks analytics database.

**What I can still help with:**
- Shipment tracking and status updates
- Route optimization suggestions
- General Ship Sticks information
- Partner golf course details`,
        error: 'Database not configured',
        sqlQuery: null,
        queryResults: null,
        chartData: null,
      });
    }

    // Generic error response
    return NextResponse.json({
      success: false,
      response: `## ⚠️ Unexpected Error

I encountered an unexpected error while processing your question:

\`\`\`
${error.message}
\`\`\`

**Please try:**
- Refreshing the page
- Rephrasing your question
- Asking about different data
- Contacting support if the issue persists`,
      error: error.message || 'Internal server error',
      sqlQuery: null,
      queryResults: null,
      chartData: null,
    }, { status: 500 });
  }
}

/**
 * GET /api/sql-agent
 * Health check endpoint to verify SQL agent is configured correctly
 */
export async function GET(request: NextRequest) {
  try {
    // Check if database and Azure OpenAI are configured
    const databaseUrl = process.env.DATABASE_URL;
    const azureApiKey = process.env.AZURE_OPENAI_KEY;
    const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;

    const status = {
      database: !!databaseUrl && databaseUrl.includes('postgresql'),
      azureOpenAI: !!azureApiKey && !!azureEndpoint,
      ready: !!databaseUrl && databaseUrl.includes('postgresql') && !!azureApiKey && !!azureEndpoint,
    };

    return NextResponse.json({
      status: 'SQL Agent API',
      version: '1.0.0',
      configuration: status,
      message: status.ready
        ? 'SQL Agent is ready to process queries'
        : 'SQL Agent is not fully configured. Need PostgreSQL DATABASE_URL and Azure OpenAI credentials.',
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
    }, { status: 500 });
  }
}
