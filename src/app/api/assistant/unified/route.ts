/**
 * Unified Assistant API
 * Handles both Qlik and Azure providers using AI SDK v5
 */

import { NextRequest, NextResponse } from 'next/server';
import { streamText, generateText, CoreMessage, CoreUserMessage, CoreAssistantMessage, CoreSystemMessage } from 'ai';
import { getProvider, resetProviderState } from '@/lib/ai/providers/registry';
import { ModelType } from '@/lib/ai/providers/types';
import { QlikWrapper } from '@/lib/ai/providers/qlik-wrapper';
import { z } from 'zod';
import { buildScottyClaimsPrompt } from '@/lib/ai/prompts/scotty-claims-prompt';
import {
  getQuickQuestionSuggestions,
  expandQuickQuestion,
  isQuickQuestion,
  CONTEXT_GATHERING_PROMPTS
} from '@/lib/ai/prompts/qlik-quick-prompts';
import { qlikContextManager } from '@/lib/ai/utils/qlik-context-manager';
import { mockPolicies } from '@/lib/ai/mock-policy-data';
import {
  getPatientData,
  generatePolicyAnalysis as generateHealthcarePolicyAnalysis,
  mockPatients
} from '@/lib/ai/mock-patient-data';
import { generateHealthcarePolicyPDF } from '@/lib/utils/healthcare-pdf-generator';
import { generateHealthPolicyAnalysis } from '@/lib/ai/health-policy-analysis';

/**
 * Detect if a message is asking for SQL/analytics data
 * Returns the detected response mode ('quick' or 'pro') or null if not an SQL question
 *
 * Matches queries about: customers, shipments, carriers, routes, partner courses
 */
function detectSqlQuestion(message: string): 'quick' | 'pro' | null {
  const msgLower = message.toLowerCase();

  // SQL keywords that indicate data queries
  const sqlKeywords = [
    'show', 'show me', 'what are', 'what is', 'how many', 'top', 'bottom', 'list', 'count',
    'average', 'sum', 'total', 'calculate', 'breakdown', 'comparison', 'compare',
    'analyze', 'identify', 'which', 'what percentage', 'get', 'find', 'display'
  ];

  // Ship Sticks business entities (tables with data)
  const businessEntities = [
    // Customers
    'customer', 'customers', 'lifetime value', 'ltv', 'acquisition', 'channel', 'channels', 'segment', 'segments',
    // Shipments & Routes
    'shipment', 'shipments', 'route', 'routes', 'delivery', 'deliveries', 'tracking', 'delay', 'delays',
    // Carriers & Performance
    'carrier', 'carriers', 'fedex', 'ups', 'dhl', 'usps', 'performance', 'on-time', 'success rate',
    // Financial Metrics
    'revenue', 'profit', 'margin', 'margins', 'cost', 'price', 'pricing', 'roi', 'financial',
    // Partners & Destinations
    'partner', 'partners', 'course', 'courses', 'golf', 'destination', 'destinations',
    // Operations & Quality
    'failure', 'failures', 'damage', 'claim', 'claims', 'insurance', 'coverage',
    // Marketing & Sales
    'campaign', 'campaigns', 'marketing', 'conversion', 'conversions', 'quote', 'quotes', 'booking', 'bookings',
    // Customer Service
    'service', 'ticket', 'tickets', 'nps', 'satisfaction', 'rating', 'ratings', 'issue', 'issues',
    // Time-based metrics
    'monthly', 'seasonal', 'trend', 'trends', 'pattern', 'patterns', 'recurring', 'membership', 'memberships'
  ];

  // Check for SQL keywords + business entities
  const hasSqlKeyword = sqlKeywords.some(keyword => msgLower.includes(keyword));
  const hasBusinessEntity = businessEntities.some(entity => msgLower.includes(entity));

  // MUST have both a SQL keyword AND a business entity
  if (!hasSqlKeyword || !hasBusinessEntity) {
    return null; // Not an SQL question
  }

  // Determine if it's a complex question (pro mode) or simple (quick mode)
  const complexIndicators = [
    'comprehensive', 'detailed', 'in-depth', 'analysis', 'breakdown',
    'compare', 'comparison', 'trend', 'over time', 'by month', 'by quarter', 'by year',
    'why', 'estimate', 'impact', 'gap', 'cost impact', 'annual cost',
    'detailed breakdown', 'show me a detailed', 'resolution time'
  ];

  const isComplex = complexIndicators.some(indicator => msgLower.includes(indicator));

  return isComplex ? 'pro' : 'quick';
}

// Request validation schema
const RequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })),
  model: z.enum(['quick', 'scotty-pro', 'arthur-pro']).default('scotty-pro'),
  stream: z.boolean().default(true),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(8000).optional(),
  generateTitle: z.boolean().optional(),
  resetThread: z.boolean().optional(),
  conversationId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validatedData = RequestSchema.parse(body);
    const { messages, model, stream, temperature, maxTokens, generateTitle, resetThread, conversationId } = validatedData;

    // Route Arthur Pro queries to knowledge graph
    if (model === 'arthur-pro') {
      console.log('Routing Arthur Pro query to knowledge graph');
      const lastMessage = messages[messages.length - 1]?.content || '';

      // Extract patient context if present
      let patientContext = '';
      const patientMatch = lastMessage.match(/For patient ([^:]+):/);
      if (patientMatch) {
        patientContext = patientMatch[1];
      }

      try {
        // Call knowledge graph API - LightRAG server on port 9621
        const kgUrl = `http://localhost:9621/query`;
        console.log('Calling knowledge graph at:', kgUrl);
        const kgResponse = await fetch(kgUrl, {
          method: 'POST',
          headers: {
            'X-API-Key': 'hospital-rag-secure-key-2024',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: lastMessage,
            mode: 'hybrid',
            workspace: 'hospital_treatment_kb',
            patientContext: patientContext
          })
        });

        if (kgResponse.ok) {
          const kgData = await kgResponse.json();
          return NextResponse.json({
            response: kgData.response,
            sources: kgData.sources,
            metrics: kgData.metrics,
            isKnowledgeGraph: true
          });
        } else {
          const errorText = await kgResponse.text();
          console.error('Knowledge graph returned error:', kgResponse.status, errorText);
        }
      } catch (kgError) {
        console.error('Knowledge graph query failed, falling back:', kgError);
        // Continue with regular processing if knowledge graph fails
      }
    }

    // Check if this is a comprehensive policy review request or policy upload
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
    const previousMessage = messages[messages.length - 2]?.content?.toLowerCase() || '';

    // Check if user uploaded a policy document
    if (lastMessage.includes("i've uploaded") && (lastMessage.includes('policy document') || lastMessage.includes('policy'))) {
      // Extract filename from the message
      const filenameMatch = lastMessage.match(/: ([^]+)$/);
      const filename = filenameMatch ? filenameMatch[1] : 'policy document';

      // Generate professional response for policy upload
      const uploadResponse = `Perfect! I've received the policy document **"${filename}"** and I'm ready to perform a comprehensive analysis.

I've recently added this policy to our system and can now provide you with:

**📊 Comprehensive Coverage Analysis**
• Complete review of all policy provisions and endorsements
• Identification of hidden coverage opportunities
• Analysis of exclusions and limitations
• Deductible optimization strategies

**💰 Maximum Recovery Potential**
• Line-by-line coverage breakdown
• Additional living expenses calculations
• Business interruption coverage analysis
• Ordinance and law coverage implications

**📈 Strategic Recommendations**
• Priority action items for claim filing
• Documentation requirements checklist
• Timeline and deadline management
• Negotiation leverage points

**Would you like me to create a comprehensive report** that includes all coverage opportunities, strategic recommendations, and maximum settlement calculations for this policy?

This analysis typically uncovers 30-40% more coverage than standard reviews.`;

      return NextResponse.json({
        response: uploadResponse,
        suggestions: [
          'Create comprehensive report',
          'Analyze coverage limits',
          'Review exclusions',
          'Calculate maximum recovery'
        ],
        sources: [{
          name: filename,
          snippet: 'Policy document uploaded and ready for analysis',
          metadata: {
            page: 1,
            section: 'Document Upload',
            confidence: 100
          }
        }],
        provider: model === 'quick' ? 'qlik' : 'azure'
      });
    }

    // Check if user wants to create a comprehensive report after upload
    if ((lastMessage.includes('create comprehensive report') ||
         lastMessage.includes('yes') ||
         lastMessage.includes('comprehensive report')) &&
        previousMessage.includes('would you like me to create')) {

      // Generate a sample comprehensive analysis
      const analysisResponse = `## Comprehensive Policy Analysis Report

**Generated:** ${new Date().toLocaleDateString()}
**Status:** ✅ Complete Analysis Available

### Executive Summary

I've completed a thorough analysis of your client's policy and identified **significant coverage opportunities** that were not immediately apparent. Based on my review, there's potential for **$287,500 in additional recoverable damages** beyond the initial assessment.

### Key Findings

**1. Overlooked Coverage Provisions**
• **Ordinance & Law Coverage**: $150,000 available for code upgrades
• **Business Interruption**: 12 months coverage at $15,000/month
• **Additional Living Expenses**: $75,000 limit (currently unclaimed)
• **Debris Removal**: Separate 25% additional coverage above policy limits

**2. Hidden Endorsements Discovered**
• **Extended Replacement Cost**: Additional 25% above dwelling limit
• **Guaranteed Replacement Cost**: No cap on rebuilding costs
• **Inflation Guard**: Automatic 4% annual increase applied
• **Backup of Sewers**: $50,000 coverage for water damage

**3. Deductible Optimization**
• Hurricane deductible can be waived due to "continuous damage" clause
• Standard deductible applies instead: Saves $18,500
• Multiple peril provision allows single deductible application

### Strategic Recommendations

**Immediate Actions:**
1. ✅ File supplemental claim for overlooked provisions
2. ✅ Document all business interruption losses retroactively
3. ✅ Request advance on ALE immediately (30% available)
4. ✅ Invoke appraisal clause if initial offer is below analysis

**Documentation Required:**
• Pre-loss financial statements (3 years)
• Detailed repair estimates with code upgrades
• Temporary living expense receipts
• Business income projections

### Settlement Calculation

| Coverage Type | Initial Offer | Our Analysis | Additional |
|--------------|--------------|--------------|------------|
| Dwelling | $450,000 | $562,500 | +$112,500 |
| Contents | $125,000 | $156,250 | +$31,250 |
| ALE | $0 | $75,000 | +$75,000 |
| Business Int. | $0 | $180,000 | +$180,000 |
| **Total** | **$575,000** | **$973,750** | **+$398,750** |

### Next Steps

1. **Schedule Strategy Call**: Review findings with your team
2. **Prepare Documentation**: Gather all supporting evidence
3. **Submit Supplemental**: File within 10 business days
4. **Negotiate Settlement**: Use analysis as leverage

### Compliance Notes

✅ All provisions verified against state regulations
✅ Timeline compliant with policy requirements
✅ Documentation meets carrier standards
✅ Analysis includes recent case law precedents

---

**Download this report** for your records and share with your client. This comprehensive analysis provides the ammunition needed to maximize the settlement and ensure no coverage is left on the table.`;

      return NextResponse.json({
        response: analysisResponse,
        suggestions: [
          'Download full report',
          'Review specific provisions',
          'Calculate exact settlement',
          'Prepare appeal documentation'
        ],
        sources: [{
          name: 'Policy Analysis Complete',
          snippet: 'Comprehensive coverage review with all opportunities identified',
          metadata: {
            page: 1,
            section: 'Full Analysis',
            confidence: 100
          }
        }],
        provider: model === 'quick' ? 'qlik' : 'azure',
        downloadable: true,
        downloadContent: analysisResponse,
        downloadFilename: `Policy_Analysis_Report_${new Date().toISOString().split('T')[0]}.pdf`
      });
    }

    // Check if user is asking for comprehensive policy review (with or without patient name)
    if (lastMessage.toLowerCase().includes('perform comprehensive policy review') ||
        lastMessage.toLowerCase().includes('comprehensive policy review')) {

      // Check if this message already includes a patient name
      const patientMatch = lastMessage.match(/For patient ([^:]+):/i);
      if (patientMatch) {
        // Patient context provided with the request - generate report immediately
        const patientName = patientMatch[1].trim();
        const analysis = generateHealthPolicyAnalysis(patientName);

        return NextResponse.json({
          response: analysis,
          suggestions: [
            'Review prior authorization requirements',
            'Check medication formulary tiers',
            'Analyze out-of-pocket costs',
            'Explore cost-saving opportunities'
          ],
          sources: [{
            name: `Healthcare Policy Analysis`,
            snippet: 'Comprehensive healthcare policy analysis completed',
            metadata: {
              page: 1,
              section: 'Full Policy Review',
              confidence: 100
            }
          }],
          title: `${patientName} Healthcare Policy Analysis`,
          provider: model === 'quick' ? 'qlik' : 'azure',
          downloadable: true,
          downloadContent: analysis,
          downloadFilename: `${patientName.replace(/\s+/g, '_')}_Healthcare_Analysis_${new Date().toISOString().split('T')[0]}.pdf`
        });
      }

      // No patient name provided - ask for it
      return NextResponse.json({
        response: `I'll perform a comprehensive healthcare policy review to identify all coverage opportunities, gaps, and cost optimization strategies.\n\n**Please provide the patient's name** to retrieve their complete policy analysis.\n\nI have healthcare policies on file for:\n• Margaret Thompson (Medicare Advantage)\n• Robert Chen (EPO Plan)\n• Emily Rodriguez (HMO Plan)\n\nAlternatively, you can upload any insurance card or policy document for analysis.`,
        suggestions: [
          'Margaret Thompson',
          'Robert Chen',
          'Emily Rodriguez',
          'Upload insurance card'
        ],
        needsContext: true,
        provider: model === 'quick' ? 'qlik' : 'azure'
      });
    }

    // Check if user selected "Perform comprehensive policy review" and then provided a name (LEGACY - for backward compatibility)
    if ((previousMessage.includes('perform comprehensive policy review') ||
         previousMessage.includes('comprehensive policy review')) &&
        lastMessage && !lastMessage.toLowerCase().includes('comprehensive')) {
      // Check for patient names
      const patientData = getPatientData(lastMessage.trim());

      if (patientData) {
        // Generate comprehensive healthcare policy analysis using the new detailed function
        const analysis = generateHealthPolicyAnalysis(patientData.patientName);

        return NextResponse.json({
          response: analysis,
          suggestions: [
            'Review prior authorization requirements',
            'Check medication formulary tiers',
            'Analyze out-of-pocket costs',
            'Explore cost-saving opportunities'
          ],
          sources: [{
            name: `Healthcare Policy - ${patientData.policyNumber}`,
            snippet: 'Comprehensive healthcare policy analysis completed',
            metadata: {
              page: 1,
              section: 'Full Policy Review',
              confidence: 100
            }
          }],
          title: `${patientData.patientName} Healthcare Policy Analysis`,
          provider: model === 'quick' ? 'qlik' : 'azure',
          downloadable: true,
          downloadContent: analysis, // Pass the analysis markdown for PDF generation
          downloadFilename: `${patientData.patientName.replace(/\s+/g, '_')}_Healthcare_Analysis_${new Date().toISOString().split('T')[0]}.pdf`
        });
      } else if (lastMessage.toLowerCase().includes('thompson') ||
                 lastMessage.toLowerCase().includes('chen') ||
                 lastMessage.toLowerCase().includes('rodriguez')) {
        // Partial match - suggest the correct full name
        const suggestions = [];
        if (lastMessage.toLowerCase().includes('thompson')) suggestions.push('Margaret Thompson');
        if (lastMessage.toLowerCase().includes('chen')) suggestions.push('Robert Chen');
        if (lastMessage.toLowerCase().includes('rodriguez')) suggestions.push('Emily Rodriguez');

        return NextResponse.json({
          response: `I found a partial match. Please provide the complete patient name for accurate policy retrieval:\n\n${suggestions.map(s => `• ${s}`).join('\n')}\n\nPlease enter the full name exactly as shown above.`,
          suggestions: [
            ...suggestions,
            'Upload insurance card',
            'Try another patient name'
          ],
          provider: model === 'quick' ? 'qlik' : 'azure'
        });
      } else if (lastMessage.trim().length > 0) {
        // Custom patient name provided - generate report with default/generic data
        const patientName = lastMessage.trim();
        const analysis = generateHealthPolicyAnalysis(patientName);

        return NextResponse.json({
          response: analysis,
          suggestions: [
            'Review prior authorization requirements',
            'Check medication formulary tiers',
            'Analyze out-of-pocket costs',
            'Explore cost-saving opportunities'
          ],
          sources: [{
            name: `Healthcare Policy Analysis`,
            snippet: 'Comprehensive healthcare policy analysis completed',
            metadata: {
              page: 1,
              section: 'Full Policy Review',
              confidence: 100
            }
          }],
          title: `${patientName} Healthcare Policy Analysis`,
          provider: model === 'quick' ? 'qlik' : 'azure',
          downloadable: true,
          downloadContent: analysis,
          downloadFilename: `${patientName.replace(/\s+/g, '_')}_Healthcare_Analysis_${new Date().toISOString().split('T')[0]}.pdf`
        });
      }
    }

    // Check if this is an SQL/analytics question
    const sqlMode = detectSqlQuestion(lastMessage);

    if (sqlMode) {
      // Map the model selection to responseMode
      // 'quick' model → 'quick' response mode
      // 'arthur-pro' model → 'pro' response mode (comprehensive analysis)
      // 'scotty-pro' model → auto-detect based on query complexity
      let responseMode: 'quick' | 'pro';

      if (model === 'quick') {
        responseMode = 'quick';
        console.log(`SQL question detected, using QUICK mode (user selected quick model)`);
      } else if (model === 'arthur-pro') {
        responseMode = 'pro';
        console.log(`SQL question detected, using PRO mode (user selected arthur-pro model)`);
      } else {
        // scotty-pro: use auto-detected complexity
        responseMode = sqlMode;
        console.log(`SQL question detected, auto-detected ${sqlMode.toUpperCase()} mode`);
      }

      try {
        // Call the SQL agent API
        const sqlAgentUrl = `${request.nextUrl.origin}/api/sql-agent`;
        const sqlResponse = await fetch(sqlAgentUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: lastMessage,
            responseMode,
          }),
        });

        if (!sqlResponse.ok) {
          throw new Error(`SQL agent returned ${sqlResponse.status}`);
        }

        const sqlData = await sqlResponse.json();

        // Format response for the assistant UI
        return NextResponse.json({
          response: sqlData.response,
          suggestions: generateSqlSuggestions(sqlData.sqlQuery, sqlData.queryResults),
          provider: 'sql-agent',
          sqlQuery: sqlData.sqlQuery,
          queryResults: sqlData.queryResults,
          chartData: sqlData.chartData,
          sources: sqlData.queryResults ? [{
            name: 'Ship Sticks Database',
            snippet: `Query returned ${sqlData.queryResults.rows.length} results`,
            metadata: {
              tables: extractTablesFromSql(sqlData.sqlQuery || ''),
              rows: sqlData.queryResults.rows.length,
              confidence: 100
            }
          }] : [],
        });
      } catch (sqlError) {
        console.error('SQL agent routing error:', sqlError);
        // Fall through to normal assistant handling if SQL agent fails
      }
    }

    // Handle Qlik separately since it doesn't use AI SDK provider interface
    if (model === 'quick') {
      // Demo mode - return mock response
      if (!process.env.QLIK_API_KEY || process.env.QLIK_API_KEY === 'your-qlik-api-key') {
        const lastMessage = messages[messages.length - 1]?.content || '';

        // Import varied response generator
        const { getArthurQuickResponse, getArthurQuickSuggestions } = await import('@/lib/ai/arthur-quick-responses');

        // Extract patient name if present
        const patientMatch = lastMessage.match(/For patient ([^:]+):/);
        const patientName = patientMatch ? patientMatch[1].trim() : undefined;

        // Get varied, contextual response
        const demoResponse = getArthurQuickResponse(lastMessage, patientName);
        const suggestions = getArthurQuickSuggestions(demoResponse, patientName);

        // Add sources if it's a comprehensive review or detailed response
        const sources = demoResponse.includes('Comprehensive') || demoResponse.includes('Analysis') ? [
          {
            name: `${patientName || 'Healthcare'} Policy Document`,
            snippet: 'Coverage details verified against current policy terms',
            metadata: {
              page: Math.floor(Math.random() * 50) + 1,
              section: 'Benefits Summary',
              confidence: 95 + Math.floor(Math.random() * 5)
            }
          }
        ] : [];

        // Check if response includes downloadable content
        const isDownloadable = demoResponse.includes('Comprehensive Policy Review') && patientName;

        return NextResponse.json({
          response: demoResponse,
          sources,
          suggestions,
          provider: 'qlik',
          ...(isDownloadable && patientName && {
            downloadable: true,
            downloadContent: getPatientData(patientName),
            downloadFilename: `${patientName.replace(/\s+/g, '_')}_Policy_Analysis.pdf`
          })
        });
      }

      return handleQlikRequest(messages, stream, generateTitle, resetThread, conversationId);
    }

    // Reset thread if requested (useful for new conversations)
    if (resetThread) {
      resetProviderState('azure');
    }

    // Get the Azure provider
    const provider = getProvider(model as ModelType);

    // Convert messages to CoreMessage format
    const coreMessages: CoreMessage[] = messages.map(msg => {
      switch (msg.role) {
        case 'system':
          return { role: 'system', content: msg.content } as CoreSystemMessage;
        case 'user':
          return { role: 'user', content: msg.content } as CoreUserMessage;
        case 'assistant':
          return { role: 'assistant', content: msg.content } as CoreAssistantMessage;
        default:
          return { role: 'user', content: msg.content } as CoreUserMessage;
      }
    });

    // Add system prompt for Scotty Pro (Azure) - policy analysis expertise
    if (model === 'scotty-pro' && !messages.some(m => m.role === 'system')) {
      const systemPrompt = buildScottyClaimsPrompt('');
      coreMessages.unshift({
        role: 'system',
        content: systemPrompt,
      } as CoreSystemMessage);
    }

    // Configure common options
    const commonOptions = {
      model: provider,
      messages: coreMessages,
      temperature: temperature ?? (model === 'scotty-pro' ? 0.5 : 0.7),
    };

    // Handle streaming response
    if (stream && process.env.AI_STREAM_ENABLED === 'true') {
      const result = await streamText(commonOptions);

      // Convert to Response with proper streaming headers
      return result.toTextStreamResponse({
        headers: {
          'X-Provider': 'azure',
        },
      });
    }

    // Handle non-streaming response
    const result = await generateText(commonOptions);

    // Generate suggestions based on the model and response
    const suggestions = generateSuggestions(model as ModelType, result.text, messages);

    // Generate title if requested
    let title: string | undefined;
    if (generateTitle && messages.length > 0) {
      try {
        const titleResult = await generateText({
          model: provider,
          messages: [
            {
              role: 'system',
              content: 'Generate a brief title (max 30 chars) summarizing this conversation. Output only the title, no quotes or punctuation.',
            } as CoreSystemMessage,
            ...coreMessages.slice(-3), // Last 3 messages for context
          ],
          temperature: 0.5,
        });

        title = titleResult.text.trim().substring(0, 30);
      } catch (error) {
        console.error('Failed to generate title:', error);
      }
    }

    return NextResponse.json({
      response: result.text,
      suggestions,
      title,
      usage: result.usage,
      finishReason: result.finishReason,
      provider: 'azure',
    }, {
      headers: {
        'X-Provider': 'azure',
      },
    });

  } catch (error) {
    console.error('Unified API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider');

  try {
    const { checkProvidersHealth } = await import('@/lib/ai/providers/registry');
    const health = await checkProvidersHealth();

    if (provider && (provider === 'qlik' || provider === 'azure')) {
      return NextResponse.json(health[provider]);
    }

    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      { error: 'Health check failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Generate contextual suggestions for SQL query results
 */
function generateSqlSuggestions(sqlQuery: string | null, queryResults: any): string[] {
  if (!queryResults || !queryResults.rows || queryResults.rows.length === 0) {
    return [
      'Show me the top customers by revenue',
      'What are the most profitable routes?',
      'Analyze shipment failure rates by carrier',
      'Customer acquisition channel performance'
    ];
  }

  // Extract what was queried to suggest related questions
  const suggestions: string[] = [];
  const queryLower = sqlQuery?.toLowerCase() || '';

  if (queryLower.includes('customer')) {
    suggestions.push(
      'Show customer lifetime value by channel',
      'Analyze customer retention trends',
      'Top customers by shipment volume'
    );
  }

  if (queryLower.includes('route') || queryLower.includes('shipment')) {
    suggestions.push(
      'Show route failure rates',
      'Analyze delivery times by carrier',
      'Revenue breakdown by route'
    );
  }

  if (queryLower.includes('revenue') || queryLower.includes('margin')) {
    suggestions.push(
      'Show profit margins by carrier',
      'Analyze revenue trends over time',
      'Top revenue-generating customers'
    );
  }

  if (queryLower.includes('channel') || queryLower.includes('campaign')) {
    suggestions.push(
      'Marketing ROI by channel',
      'Campaign performance analysis',
      'Customer acquisition cost breakdown'
    );
  }

  // Default suggestions if no specific ones matched
  if (suggestions.length === 0) {
    return [
      'Show me more details',
      'Analyze this data by month',
      'Compare with previous period',
      'Break down by category'
    ];
  }

  return suggestions.slice(0, 4);
}

/**
 * Extract table names from SQL query for metadata
 */
function extractTablesFromSql(sql: string): string[] {
  const fromMatch = sql.match(/FROM\s+(\w+)/gi);
  const joinMatch = sql.match(/JOIN\s+(\w+)/gi);

  const tables = new Set<string>();

  if (fromMatch) {
    fromMatch.forEach(match => {
      const table = match.replace(/FROM\s+/i, '').trim();
      tables.add(table);
    });
  }

  if (joinMatch) {
    joinMatch.forEach(match => {
      const table = match.replace(/JOIN\s+/i, '').trim();
      tables.add(table);
    });
  }

  return Array.from(tables);
}

/**
 * Generate contextual suggestions based on the model and conversation
 */
function generateSuggestions(model: ModelType, response: string, messages: any[]): string[] {
  const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
  const responseLower = response.toLowerCase();

  if (model === 'quick') {
    // Check if we have context (insured name) established
    const hasContext = messages.some(m =>
      m.content.toLowerCase().includes('policy of') ||
      m.content.toLowerCase().includes('insured:') ||
      m.content.toLowerCase().includes('policyholder:')
    );

    if (!hasContext) {
      // Initial suggestions to establish context
      return [
        'Perform comprehensive policy review',
        'Analyze coverage limits and deductibles',
        'Review exclusions and endorsements',
        'Check claim-specific provisions',
      ];
    }

    // Context-aware comprehensive suggestions
    if (responseLower.includes('policy') || responseLower.includes('coverage')) {
      return getQuickQuestionSuggestions().slice(0, 4);
    }

    if (responseLower.includes('claim') || responseLower.includes('appraisal')) {
      return [
        'Check claim-specific provisions',
        'Analyze water, wind, and mold coverage',
        'Review exclusions and endorsements',
        'Verify compliance requirements',
      ];
    }

    if (responseLower.includes('water') || responseLower.includes('wind') || responseLower.includes('mold')) {
      return [
        'Analyze water, wind, and mold coverage',
        'Review exclusions and endorsements',
        'Check claim-specific provisions',
        'Perform comprehensive policy review',
      ];
    }

    // Default comprehensive suggestions
    return getQuickQuestionSuggestions().slice(0, 4);
  }

  // Scotty Pro suggestions (expert analysis)
  if (model === 'scotty-pro') {
    if (!messages.some(m => m.content.toLowerCase().includes('policy'))) {
      return [
        'Upload my insurance policy',
        'Perform comprehensive policy review',
        'Find coverage opportunities',
        'Check compliance requirements',
      ];
    }

    if (responseLower.includes('coverage') || responseLower.includes('analysis')) {
      return [
        'Perform 13-point policy review',
        'Identify hidden coverages',
        'Calculate maximum settlement',
        'Review exclusions and endorsements',
      ];
    }

    if (responseLower.includes('settlement') || responseLower.includes('maximize')) {
      return [
        'Generate settlement strategy',
        'Identify bad faith indicators',
        'Review appraisal provisions',
        'Calculate code upgrade benefits',
      ];
    }

    // Default Scotty Pro suggestions
    return [
      'Analyze coverage gaps',
      'Review deductibles',
      'Check state requirements',
      'Generate documentation checklist',
    ];
  }

  return [];
}

/**
 * Handle Qlik requests separately since it doesn't use AI SDK provider interface
 */
async function handleQlikRequest(
  messages: any[],
  stream?: boolean,
  generateTitle?: boolean,
  resetThread?: boolean,
  conversationId?: string
) {
  try {
    // Initialize Qlik wrapper
    const qlikWrapper = new QlikWrapper({
      tenantUrl: process.env.QLIK_TENANT_URL || '',
      apiKey: process.env.QLIK_API_KEY || '',
      assistantId: process.env.QLIK_ASSISTANT_ID || '',
      knowledgeBaseId: process.env.QLIK_KNOWLEDGE_BASE_ID,
    });

    if (resetThread) {
      qlikWrapper.resetThread();
      if (conversationId) {
        qlikContextManager.clearContext(conversationId);
      }
    }

    // Get conversation ID for context management
    const convId = conversationId || 'default';
    const context = qlikContextManager.getContext(convId);

    // Get the last user message
    const lastUserMessage = messages
      .filter(m => m.role === 'user')
      .pop()?.content || '';

    if (!lastUserMessage) {
      return NextResponse.json(
        { error: 'No user message found' },
        { status: 400 }
      );
    }

    // Check if this is a quick question that needs expansion
    const quickQuestionId = isQuickQuestion(lastUserMessage);

    // Handle context gathering if needed
    if (!context.insuredName && !context.contextConfirmed) {
      // Try to extract insured name from the message
      const extractedName = qlikContextManager.extractInsuredFromMessage(lastUserMessage);

      if (extractedName) {
        // Found insured name, confirm and proceed
        qlikContextManager.setInsuredName(convId, extractedName);

        // If this was just providing the name, ask what they want to know
        if (lastUserMessage.toLowerCase().trim() === extractedName.toLowerCase()) {
          return NextResponse.json({
            response: qlikContextManager.getContextConfirmationMessage(extractedName),
            suggestions: getQuickQuestionSuggestions().slice(0, 4),
            provider: 'qlik',
            needsContext: false,
          });
        }
      } else if (quickQuestionId) {
        // Quick question clicked but no context, ask for it
        return NextResponse.json({
          response: CONTEXT_GATHERING_PROMPTS.initial,
          suggestions: [],
          provider: 'qlik',
          needsContext: true,
          pendingQuestion: lastUserMessage,
        });
      }
    }

    // Prepare the message for Qlik
    let messageToSend = lastUserMessage;

    // If this is a quick question and we have context, expand it
    if (quickQuestionId && context.insuredName) {
      messageToSend = expandQuickQuestion(quickQuestionId, context.insuredName);
      console.log('Expanded quick question:', {
        original: lastUserMessage,
        expanded: messageToSend.substring(0, 200) + '...'
      });
    } else if (context.insuredName && !lastUserMessage.includes(context.insuredName)) {
      // Add context to regular questions if not already included
      messageToSend = `For the policy of ${context.insuredName}: ${lastUserMessage}`;
    }

    // Track the question
    qlikContextManager.trackQuestion(convId, lastUserMessage);

    // Handle streaming if requested
    if (stream && process.env.AI_STREAM_ENABLED === 'true') {
      const encoder = new TextEncoder();
      const stream = new TransformStream();
      const writer = stream.writable.getWriter();

      // Start streaming in background
      (async () => {
        try {
          for await (const chunk of qlikWrapper.streamMessage(messageToSend)) {
            await writer.write(
              encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`)
            );
          }
          await writer.write(encoder.encode('data: [DONE]\n\n'));
        } catch (error) {
          console.error('Qlik streaming error:', error);
        } finally {
          await writer.close();
        }
      })();

      return new Response(stream.readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-Provider': 'qlik',
        },
      });
    }

    // Non-streaming response
    const result = await qlikWrapper.sendMessage(messageToSend);

    // Generate title if requested
    let title: string | undefined;
    if (generateTitle && messages.length === 1) {
      // Simple title generation from first message
      title = lastUserMessage.substring(0, 30);
      if (lastUserMessage.length > 30) {
        title += '...';
      }
    }

    return NextResponse.json({
      response: result.response,
      suggestions: result.suggestions || generateSuggestions('quick', result.response, messages),
      title,
      provider: 'qlik',
      sources: result.sources,
    }, {
      headers: {
        'X-Provider': 'qlik',
      },
    });

  } catch (error) {
    console.error('Qlik request error:', error);

    // Fallback to Azure if enabled
    if (process.env.AI_PROVIDER_FALLBACK === 'true') {
      console.log('Falling back to Azure provider');

      try {
        const provider = getProvider('scotty-pro');
        const coreMessages = messages.map(msg => ({
          role: msg.role,
          content: msg.content
        } as CoreMessage));

        const result = await generateText({
          model: provider,
          messages: coreMessages,
        });

        return NextResponse.json({
          response: result.text,
          suggestions: generateSuggestions('scotty-pro', result.text, messages),
          provider: 'azure-fallback',
        });
      } catch (fallbackError) {
        console.error('Fallback to Azure also failed:', fallbackError);
      }
    }

    return NextResponse.json(
      { error: 'Failed to process request', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}