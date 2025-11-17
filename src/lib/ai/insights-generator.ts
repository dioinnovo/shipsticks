import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

/**
 * Response mode types for insights generation
 * - quick: Concise 3-5 sentence summary
 * - pro: Comprehensive 200+ word analysis with sections
 */
export type ResponseMode = "quick" | "pro";

/**
 * Initialize Azure OpenAI chat model for insights generation
 * Higher temperature (0.3) for more creative business analysis
 */
const azureApiKey = process.env.AZURE_OPENAI_KEY;
const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
const azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT;
const azureVersion = process.env.AZURE_OPENAI_VERSION;

const insightsLLM = new ChatOpenAI({
  model: azureDeployment || "gpt-4o-mini",
  temperature: 0.3, // Higher temperature for creative analysis
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
 * System prompt for the insights generator
 * Defines the AI's role as a business analyst for Ship Sticks
 */
const INSIGHTS_SYSTEM_PROMPT = `You are a business analyst for Ship Sticks, a golf club shipping company.
Your role is to analyze SQL query results and provide clear, actionable business insights with specific numbers and recommendations.
Use markdown formatting for emphasis (**bold** for key metrics, bullet points for lists).
Focus on practical business impact and next steps that executives can act on immediately.`;

/**
 * Generate business insights from SQL query results
 * Uses a second LLM to analyze data and provide business context
 *
 * @param question Original user question
 * @param sqlQuery SQL query that was executed
 * @param queryResults Results from the database (columns and rows)
 * @param responseMode "quick" for concise or "pro" for comprehensive analysis
 * @returns Markdown-formatted business insights
 */
export async function generateInsights(
  question: string,
  sqlQuery: string,
  queryResults: { columns: string[]; rows: any[][] },
  responseMode: ResponseMode = "quick"
): Promise<string> {
  const { columns, rows } = queryResults;

  // Handle empty results
  if (rows.length === 0) {
    return `No data found matching your query. This could mean:
- No records match the specified criteria
- The time period selected has no activity
- The filters are too restrictive

**Suggestion:** Try adjusting your question with:
- A broader date range
- Different filter criteria
- Checking if the data exists in the database`;
  }

  // Build context for the LLM based on response mode
  let dataContext: string;

  if (responseMode === "quick") {
    // Quick mode: concise, one paragraph response
    dataContext = `
User Question: ${question}

SQL Query Executed:
${sqlQuery}

Results (${rows.length} rows):
Columns: ${columns.join(', ')}
Data:
${rows.slice(0, 10).map((row, idx) =>
  `Row ${idx + 1}: ${columns.map((col, i) => `${col}=${row[i]}`).join(', ')}`
).join('\n')}
${rows.length > 10 ? `\n... (${rows.length - 10} more rows)` : ''}

Instructions:
Provide a BRIEF, concise answer in ONE PARAGRAPH MAXIMUM (3-5 sentences). Focus on:
- The single most important finding from the data
- One key number or metric (use **bold** markdown)
- One actionable insight or recommendation

Use markdown formatting (bold for key numbers like **$125,450** or **23.5%**).
Be direct, business-focused, and speak like an executive summarizing data.`;
  } else {
    // Pro mode: comprehensive analysis
    dataContext = `
User Question: ${question}

SQL Query Executed:
${sqlQuery}

Results (${rows.length} rows):
Columns: ${columns.join(', ')}
Data:
${rows.slice(0, 50).map((row, idx) =>
  `Row ${idx + 1}: ${columns.map((col, i) => `${col}=${row[i]}`).join(', ')}`
).join('\n')}
${rows.length > 50 ? `\n... (${rows.length - 50} more rows)` : ''}

Instructions:
You MUST provide a COMPREHENSIVE BUSINESS ANALYSIS with the following MANDATORY structure and requirements.

MANDATORY STRUCTURE (You must include ALL four sections):

**📊 Key Findings**
- Identify 3-5 major patterns or trends in the data
- Include specific numbers, percentages, and comparisons (use **bold** for metrics)
- Highlight both positive and negative findings
- Compare segments, categories, or time periods

**💰 Financial Impact**
- Quantify the business impact in dollars, revenue, or cost terms
- Calculate margins, profitability, or efficiency metrics where applicable
- Compare performance across segments/categories if relevant
- Show year-over-year or month-over-month trends if applicable

**⚠️ Risk Areas & Opportunities**
- Identify 2-3 problem areas that need immediate attention
- Quantify the risk or opportunity cost with specific numbers
- Highlight underperforming segments or missed opportunities
- Show the gap between actual and potential performance

**🎯 Actionable Recommendations**
- Provide 3-5 SPECIFIC, actionable next steps
- Each recommendation must be concrete (not vague like "improve performance")
- Include expected impact or success metrics for each recommendation
- Prioritize recommendations by potential business impact

MINIMUM REQUIREMENTS:
- Total response length: 200+ words (this is NON-NEGOTIABLE)
- Include at least 5 specific numbers or metrics with context
- Provide at least 3 concrete, actionable recommendations
- Use bullet points and markdown formatting (**bold**, headers)
- Include percentages, dollar amounts, or comparative metrics

EXAMPLE OF EXPECTED DEPTH:
For a question like "Which routes have the highest failure rates?"

**📊 Key Findings**
The analysis reveals that **3 routes account for 45% of all failures** despite representing only 18% of total volume. The Austin-Phoenix route shows the highest failure rate at **22.3%** (89 failed out of 399 total shipments), followed by Denver-Miami at **18.7%** (52/278) and Seattle-Atlanta at **16.4%** (41/250). In contrast, our best-performing routes like Chicago-New York maintain failure rates below **3.2%**.

**💰 Financial Impact**
These high-failure routes are costing the business approximately **$47,500 per quarter** in:
- Customer refunds and compensation: **$28,000**
- Re-shipping costs: **$14,200**
- Customer service overhead: **$5,300**

If failure rates were reduced to the company average of 8%, we would save **$23,750 quarterly** or **$95,000 annually**.

**⚠️ Risk Areas & Opportunities**
The Austin-Phoenix route's 22% failure rate is **7x higher** than our best routes, indicating systemic issues with either the carrier (CarrierCo handles 85% of this route) or routing logistics. Additionally, **38% of failures** occur during the final-mile delivery phase, suggesting carrier partner performance issues rather than packaging problems.

**🎯 Actionable Recommendations**
1. **Immediately renegotiate or switch carriers for Austin-Phoenix route** - CarrierCo's performance is unacceptable. Test alternative carriers for 30-day trial (expected 50% failure reduction = **$6K monthly savings**)
2. **Implement enhanced packaging requirements for high-failure routes** - Add fragile handling labels and double-boxing for Denver-Miami and Seattle-Atlanta (estimated cost: **$2/shipment**, potential savings: **$8K/quarter**)
3. **Adjust pricing on high-risk routes** - Add 15% risk premium to Austin-Phoenix pricing to offset failure costs while maintaining margins (expected **$12K additional quarterly revenue**)
4. **Create carrier performance scorecard** - Track failure rates by carrier and route weekly, with automatic carrier switches when failure rates exceed 10% for 2 consecutive weeks

This is the MINIMUM expected depth for Pro mode. Provide similar comprehensive analysis for the current question.`;
  }

  try {
    console.log(`🧠 Generating ${responseMode.toUpperCase()} insights...`);

    const response = await insightsLLM.invoke([
      new SystemMessage(INSIGHTS_SYSTEM_PROMPT),
      new HumanMessage(dataContext),
    ]);

    const content = response.content as string;
    return content.trim() || `Found ${rows.length} result${rows.length !== 1 ? 's' : ''}. See the table below for details.`;
  } catch (error: any) {
    console.error('❌ Error generating insights:', error);
    // Fallback to basic response if insights generation fails
    return `## Analysis Results

Found **${rows.length}** result${rows.length !== 1 ? 's' : ''} for your query.

The complete data is shown in the table below. ${
  responseMode === 'pro'
    ? 'You can download the results as Excel for further analysis.'
    : 'Switch to Pro mode for detailed business insights.'
}`;
  }
}

/**
 * Generate insights for error cases
 * Provides helpful guidance when SQL queries fail
 *
 * @param question Original user question
 * @param sqlQuery SQL query that failed (if available)
 * @param error Error message from the agent
 * @returns User-friendly error explanation with suggestions
 */
export async function generateErrorInsights(
  question: string,
  sqlQuery: string | null,
  error: string
): Promise<string> {
  // Provide context-aware error messages
  if (error.includes('syntax error') || error.includes('SQL Error')) {
    return `## ⚠️ Query Error

I generated a SQL query, but there was a syntax error:

\`\`\`
${error.substring(0, 200)}
\`\`\`

**This could be due to:**
- Incorrect table or column names
- Invalid SQL syntax
- Missing JOIN conditions

**What to try:**
- Rephrase your question to be more specific
- Ask about different data (e.g., "show me customers" instead of "analyze customer behavior")
- Specify a date range or filter (e.g., "last 30 days", "for FedEx carrier")`;
  }

  if (error.includes('does not exist') || error.includes('relation')) {
    return `## ⚠️ Table or Column Not Found

The query referenced a table or column that doesn't exist in the Ship Sticks database.

**Available data areas:**
- **Shipments** - Delivery tracking, routes, carriers, pricing
- **Customers** - Profiles, lifetime value, acquisition channels
- **Partners** - Golf course partnerships and performance
- **Claims** - Insurance claims and payouts
- **Routes** - Route performance and failure rates
- **Marketing** - Campaign performance and ROI
- **Support** - Customer service tickets and NPS scores

**Try asking about:** "Show me top 10 routes by volume" or "Customer lifetime value by channel"`;
  }

  if (error.includes('permission denied') || error.includes('read-only')) {
    return `## ⚠️ Permission Denied

This database is read-only. Only SELECT queries are allowed for data analysis.

**What you can do:**
- Query and analyze any Ship Sticks data
- Generate reports and insights
- Export data to Excel

**What's not allowed:**
- Modifying data (INSERT, UPDATE, DELETE)
- Creating or altering tables
- Administrative operations`;
  }

  if (error.includes('DATABASE_URL')) {
    return `## ⚠️ Database Connection Error

The SQL analytics database is not configured. Please contact your administrator.

**What's needed:**
- PostgreSQL database connection (DATABASE_URL)
- Ship Sticks analytics data restored

In the meantime, I can still help with:
- Shipment tracking questions
- Route optimization
- General Ship Sticks information`;
  }

  // Generic error message
  return `## ⚠️ Something Went Wrong

I encountered an error while processing your question:

\`\`\`
${error.substring(0, 200)}
\`\`\`

**Please try:**
- Rephrasing your question
- Being more specific about what data you need
- Asking about a different topic
- Using simpler criteria or filters

**Examples of questions I can answer:**
- "Show me top customers by revenue"
- "What's the average delivery time by carrier?"
- "Which routes have the highest failure rates?"
- "Customer lifetime value by acquisition channel"`;
}
