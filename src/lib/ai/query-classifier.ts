/**
 * Query Complexity Classifier
 * Determines if a query should use fast path or full ReAct agent
 *
 * Fast Path Criteria:
 * - Simple aggregations (count, sum, average)
 * - Single table or simple joins
 * - Common business questions
 * - No complex logic required
 *
 * Full Agent Criteria:
 * - Multi-step reasoning needed
 * - Complex joins across 3+ tables
 * - Advanced analytics (correlations, predictions)
 * - Ambiguous questions requiring exploration
 */

export type QueryComplexity = 'simple' | 'moderate' | 'complex';

export interface QueryClassification {
  complexity: QueryComplexity;
  useFastPath: boolean;
  reason: string;
  estimatedTables: number;
  confidence: number;
}

/**
 * Pattern-based complexity classifier
 * Uses heuristics to quickly determine query complexity without LLM
 */
export function classifyQueryComplexity(question: string): QueryClassification {
  const lowerQuestion = question.toLowerCase();

  // Initialize scores
  let complexityScore = 0;
  let estimatedTables = 1;
  const reasons: string[] = [];

  // === SIMPLE PATTERNS (Fast Path Candidates) ===

  // Simple "show me" or "list" queries
  if (/^(show|list|display|get|find)\s+(me\s+)?(all\s+)?(the\s+)?/.test(lowerQuestion)) {
    complexityScore -= 1;
    reasons.push('Simple listing query');
  }

  // Direct "what is" questions
  if (/^what\s+(is|are)\s+(the|our|my)/.test(lowerQuestion)) {
    complexityScore -= 1;
    reasons.push('Direct fact query');
  }

  // Simple comparisons
  if (/^compare\s+\w+\s+(by|across|between)/.test(lowerQuestion)) {
    complexityScore += 0; // Neutral - could be simple or complex
    reasons.push('Comparison query');
  }

  // Top N queries (usually simple)
  if (/\b(top|bottom|best|worst)\s+\d+\b/.test(lowerQuestion)) {
    complexityScore -= 0.5;
    reasons.push('Top N query');
  }

  // === TABLE COMPLEXITY ESTIMATION ===

  // Count mentioned entities (proxies for table count)
  const entities = [
    'customer', 'shipment', 'carrier', 'route', 'partner', 'course',
    'claim', 'insurance', 'ticket', 'service', 'marketing', 'campaign',
    'session', 'nps', 'survey', 'tracking', 'event', 'performance'
  ];

  const mentionedEntities = entities.filter(entity =>
    lowerQuestion.includes(entity)
  );

  estimatedTables = Math.max(1, mentionedEntities.length);

  if (estimatedTables >= 3) {
    complexityScore += 2;
    reasons.push(`${estimatedTables} tables likely involved`);
  } else if (estimatedTables === 2) {
    complexityScore += 0.5;
    reasons.push('2 tables likely involved');
  }

  // === COMPLEXITY INDICATORS ===

  // Statistical/analytical terms
  const analyticalTerms = [
    'correlation', 'trend', 'pattern', 'predict', 'forecast',
    'regression', 'analysis', 'statistical', 'variance', 'deviation'
  ];

  if (analyticalTerms.some(term => lowerQuestion.includes(term))) {
    complexityScore += 2;
    reasons.push('Advanced analytics required');
  }

  // Time-series analysis
  if (/\b(trend|over time|monthly|quarterly|year[- ]over[- ]year|seasonality)\b/.test(lowerQuestion)) {
    complexityScore += 1;
    reasons.push('Time-series analysis');
  }

  // Multiple conditions/filters
  const conditionWords = ['and', 'or', 'but', 'except', 'excluding', 'where', 'if', 'when'];
  const conditionCount = conditionWords.filter(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    return (lowerQuestion.match(regex) || []).length > 0;
  }).length;

  if (conditionCount >= 3) {
    complexityScore += 1.5;
    reasons.push('Multiple conditions');
  }

  // Aggregation keywords (usually simpler)
  const simpleAggregations = ['total', 'sum', 'count', 'average', 'avg', 'max', 'min'];
  if (simpleAggregations.some(term => lowerQuestion.includes(term))) {
    complexityScore -= 0.5;
    reasons.push('Simple aggregation');
  }

  // === KNOWN SIMPLE PATTERNS (Quick Questions) ===

  const simplePatterns = [
    /what is (our|the) .* (lifetime value|ltv|clv)/,
    /compare .* (performance|rates?|metrics?)/,
    /show .* (top|highest|lowest) \d+/,
    /which .* have .* (highest|lowest|most|least)/,
    /what (percentage|percent|%) of/,
    /how many .* (are|were|have)/,
    /list .* by (date|amount|volume|revenue)/
  ];

  if (simplePatterns.some(pattern => pattern.test(lowerQuestion))) {
    complexityScore -= 1;
    reasons.push('Matches known simple pattern');
  }

  // === COMPLEX PATTERNS ===

  const complexPatterns = [
    /why|how come|what causes|what explains/,
    /recommend|suggest|should (i|we)/,
    /compare .* across .* considering .*/,
    /taking into account|factoring in|considering/,
    /breakdown .* by .* and .* and/
  ];

  if (complexPatterns.some(pattern => pattern.test(lowerQuestion))) {
    complexityScore += 2;
    reasons.push('Requires reasoning or recommendations');
  }

  // Question length (very long questions often complex)
  const wordCount = lowerQuestion.split(/\s+/).length;
  if (wordCount > 20) {
    complexityScore += 1;
    reasons.push('Long, detailed question');
  } else if (wordCount < 8) {
    complexityScore -= 0.5;
    reasons.push('Short, focused question');
  }

  // === DETERMINE CLASSIFICATION ===

  let complexity: QueryComplexity;
  let useFastPath: boolean;
  let confidence: number;

  if (complexityScore <= -1) {
    complexity = 'simple';
    useFastPath = true;
    confidence = 0.85;
  } else if (complexityScore <= 1) {
    complexity = 'moderate';
    useFastPath = estimatedTables <= 2; // Fast path if only 1-2 tables
    confidence = 0.70;
  } else {
    complexity = 'complex';
    useFastPath = false;
    confidence = 0.80;
  }

  // Override: always use fast path for these exact Quick Questions
  const knownQuickQuestions = [
    'customer lifetime value by acquisition channel',
    'compare carrier performance',
    'compare carrier on-time delivery performance',
    'profit margins by service tier',
    'conversion rates by customer segment',
    'routes with highest failure rates',
    'insurance coverage gap',
    'tracking delays',
    'revenue by month',
    'top customer service issues',
    'nps scores by customer segment',
    'customer acquisition cost',
    'top partner courses',
    'marketing campaigns highest roi',
    'monthly recurring revenue'
  ];

  const normalizedQuestion = lowerQuestion.replace(/[^\w\s]/g, '').trim();
  if (knownQuickQuestions.some(q => normalizedQuestion.includes(q))) {
    complexity = 'simple';
    useFastPath = true;
    confidence = 0.95;
    reasons.unshift('Matches predefined Quick Question');
  }

  return {
    complexity,
    useFastPath,
    reason: reasons.join('; '),
    estimatedTables,
    confidence
  };
}

/**
 * Check if a question should use the fast path
 * @param question User's natural language question
 * @returns true if fast path should be used
 */
export function shouldUseFastPath(question: string): boolean {
  const classification = classifyQueryComplexity(question);
  return classification.useFastPath;
}
