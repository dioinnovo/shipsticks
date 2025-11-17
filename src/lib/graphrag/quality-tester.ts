/**
 * Knowledge Graph Quality Testing Framework
 * Benchmarks LightRAG vs LangChain entity extraction and query quality
 */

import { documentExtractor } from "./document-entity-extractor";
import { text2cypher } from "./text2cypher";
import { neo4jClient } from "./neo4j-client";

/**
 * Ground truth for testing
 * Manually annotated gold standard
 */
export interface GroundTruthExample {
  id: string;
  text: string;
  expectedEntities: Array<{
    name: string;
    type: string;
    attributes?: Record<string, any>;
  }>;
  expectedRelationships: Array<{
    source: string;
    target: string;
    type: string;
  }>;
  testQueries: Array<{
    question: string;
    expectedAnswer: string;
    acceptableVariations?: string[];
  }>;
}

/**
 * Benchmark results
 */
export interface BenchmarkResults {
  system: "LangChain" | "LightRAG";
  entityMetrics: {
    precision: number; // % of extracted entities that are correct
    recall: number; // % of ground truth entities found
    f1Score: number; // Harmonic mean of precision and recall
    totalExtracted: number;
    correctEntities: number;
    missedEntities: number;
    incorrectEntities: number;
  };
  relationshipMetrics: {
    precision: number;
    recall: number;
    f1Score: number;
    totalExtracted: number;
    correctRelationships: number;
    missedRelationships: number;
    incorrectRelationships: number;
  };
  queryMetrics: {
    accuracy: number; // % of queries with correct answers
    averageLatency: number; // ms
    p95Latency: number; // ms
    correctAnswers: number;
    totalQueries: number;
  };
  costMetrics: {
    totalTokens: number;
    estimatedCost: number; // USD
    tokensPerDocument: number;
  };
  performanceMetrics: {
    totalDuration: number; // ms
    documentsPerSecond: number;
  };
  timestamp: string;
}

/**
 * Quality Tester for Knowledge Graphs
 */
export class KnowledgeGraphQualityTester {
  private groundTruth: GroundTruthExample[] = [];

  /**
   * Load ground truth examples
   */
  loadGroundTruth(examples: GroundTruthExample[]): void {
    this.groundTruth = examples;
    console.log(`📚 Loaded ${examples.length} ground truth examples`);
  }

  /**
   * Benchmark LangChain entity extraction
   */
  async benchmarkLangChain(): Promise<BenchmarkResults> {
    console.log("🧪 Benchmarking LangChain...");

    const startTime = Date.now();
    let totalTokens = 0;

    // Entity extraction metrics
    let totalExtracted = 0;
    let correctEntities = 0;
    let missedEntities = 0;
    let incorrectEntities = 0;

    // Relationship metrics
    let totalRelExtracted = 0;
    let correctRelationships = 0;
    let missedRelationships = 0;
    let incorrectRelationships = 0;

    // Query metrics
    let correctAnswers = 0;
    const queryLatencies: number[] = [];

    // Process each ground truth example
    for (const example of this.groundTruth) {
      // Extract entities
      const extracted = await documentExtractor.extractFromText(example.text);

      // Evaluate entities
      const entityEval = this.evaluateEntities(
        extracted.entities,
        example.expectedEntities
      );

      totalExtracted += extracted.entities.length;
      correctEntities += entityEval.correct;
      missedEntities += entityEval.missed;
      incorrectEntities += entityEval.incorrect;

      // Evaluate relationships
      const relEval = this.evaluateRelationships(
        extracted.relationships,
        example.expectedRelationships
      );

      totalRelExtracted += extracted.relationships.length;
      correctRelationships += relEval.correct;
      missedRelationships += relEval.missed;
      incorrectRelationships += relEval.incorrect;

      // Load into temporary graph for query testing
      await documentExtractor.loadIntoGraph(extracted);

      // Test queries
      for (const testQuery of example.testQueries) {
        const queryStart = Date.now();
        const result = await text2cypher.query(testQuery.question);
        const queryLatency = Date.now() - queryStart;

        queryLatencies.push(queryLatency);

        // Check if answer is correct
        if (this.isAnswerCorrect(result.answer, testQuery.expectedAnswer, testQuery.acceptableVariations)) {
          correctAnswers++;
        }
      }

      // Estimate tokens (rough approximation)
      totalTokens += Math.floor(example.text.length / 4) * 2; // Input + output
    }

    const totalDuration = Date.now() - startTime;

    // Calculate metrics
    const entityPrecision = totalExtracted > 0 ? correctEntities / totalExtracted : 0;
    const entityRecall =
      this.groundTruth.reduce((sum, ex) => sum + ex.expectedEntities.length, 0) > 0
        ? correctEntities / this.groundTruth.reduce((sum, ex) => sum + ex.expectedEntities.length, 0)
        : 0;
    const entityF1 =
      entityPrecision + entityRecall > 0
        ? (2 * entityPrecision * entityRecall) / (entityPrecision + entityRecall)
        : 0;

    const relPrecision = totalRelExtracted > 0 ? correctRelationships / totalRelExtracted : 0;
    const relRecall =
      this.groundTruth.reduce((sum, ex) => sum + ex.expectedRelationships.length, 0) > 0
        ? correctRelationships /
          this.groundTruth.reduce((sum, ex) => sum + ex.expectedRelationships.length, 0)
        : 0;
    const relF1 =
      relPrecision + relRecall > 0 ? (2 * relPrecision * relRecall) / (relPrecision + relRecall) : 0;

    const totalQueries = this.groundTruth.reduce((sum, ex) => sum + ex.testQueries.length, 0);
    const queryAccuracy = totalQueries > 0 ? correctAnswers / totalQueries : 0;

    const avgLatency = queryLatencies.reduce((sum, l) => sum + l, 0) / queryLatencies.length;
    const p95Latency = this.calculateP95(queryLatencies);

    // Cost estimation (Azure OpenAI GPT-4o: ~$5 per 1M input tokens, ~$15 per 1M output tokens)
    const estimatedCost = (totalTokens / 1000000) * 10; // Average of input/output

    console.log("✅ LangChain benchmark complete");

    return {
      system: "LangChain",
      entityMetrics: {
        precision: entityPrecision,
        recall: entityRecall,
        f1Score: entityF1,
        totalExtracted,
        correctEntities,
        missedEntities,
        incorrectEntities,
      },
      relationshipMetrics: {
        precision: relPrecision,
        recall: relRecall,
        f1Score: relF1,
        totalExtracted: totalRelExtracted,
        correctRelationships,
        missedRelationships,
        incorrectRelationships,
      },
      queryMetrics: {
        accuracy: queryAccuracy,
        averageLatency: avgLatency,
        p95Latency: p95Latency,
        correctAnswers,
        totalQueries,
      },
      costMetrics: {
        totalTokens,
        estimatedCost,
        tokensPerDocument: totalTokens / this.groundTruth.length,
      },
      performanceMetrics: {
        totalDuration,
        documentsPerSecond: (this.groundTruth.length / totalDuration) * 1000,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Benchmark LightRAG (placeholder for actual LightRAG integration)
   */
  async benchmarkLightRAG(): Promise<BenchmarkResults> {
    console.log("🧪 Benchmarking LightRAG...");
    console.warn("⚠️  LightRAG benchmark requires LightRAG Python service running");

    // This would call your LightRAG service
    // For now, returning mock results structure

    return {
      system: "LightRAG",
      entityMetrics: {
        precision: 0,
        recall: 0,
        f1Score: 0,
        totalExtracted: 0,
        correctEntities: 0,
        missedEntities: 0,
        incorrectEntities: 0,
      },
      relationshipMetrics: {
        precision: 0,
        recall: 0,
        f1Score: 0,
        totalExtracted: 0,
        correctRelationships: 0,
        missedRelationships: 0,
        incorrectRelationships: 0,
      },
      queryMetrics: {
        accuracy: 0,
        averageLatency: 0,
        p95Latency: 0,
        correctAnswers: 0,
        totalQueries: 0,
      },
      costMetrics: {
        totalTokens: 0,
        estimatedCost: 0,
        tokensPerDocument: 0,
      },
      performanceMetrics: {
        totalDuration: 0,
        documentsPerSecond: 0,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Compare both systems side-by-side
   */
  async compareSystems(): Promise<{
    langChain: BenchmarkResults;
    lightRAG: BenchmarkResults;
    comparison: {
      entityQualityWinner: string;
      relationshipQualityWinner: string;
      queryAccuracyWinner: string;
      speedWinner: string;
      costWinner: string;
      overallRecommendation: string;
    };
  }> {
    console.log("🏆 Starting head-to-head comparison...\n");

    const langChainResults = await this.benchmarkLangChain();
    const lightRAGResults = await this.benchmarkLightRAG();

    // Determine winners
    const entityQualityWinner =
      langChainResults.entityMetrics.f1Score > lightRAGResults.entityMetrics.f1Score
        ? "LangChain"
        : "LightRAG";

    const relationshipQualityWinner =
      langChainResults.relationshipMetrics.f1Score > lightRAGResults.relationshipMetrics.f1Score
        ? "LangChain"
        : "LightRAG";

    const queryAccuracyWinner =
      langChainResults.queryMetrics.accuracy > lightRAGResults.queryMetrics.accuracy
        ? "LangChain"
        : "LightRAG";

    const speedWinner =
      langChainResults.performanceMetrics.documentsPerSecond >
      lightRAGResults.performanceMetrics.documentsPerSecond
        ? "LangChain"
        : "LightRAG";

    const costWinner =
      langChainResults.costMetrics.estimatedCost < lightRAGResults.costMetrics.estimatedCost
        ? "LangChain"
        : "LightRAG";

    // Calculate overall score
    const langChainScore =
      (langChainResults.entityMetrics.f1Score +
        langChainResults.relationshipMetrics.f1Score +
        langChainResults.queryMetrics.accuracy) /
      3;

    const lightRAGScore =
      (lightRAGResults.entityMetrics.f1Score +
        lightRAGResults.relationshipMetrics.f1Score +
        lightRAGResults.queryMetrics.accuracy) /
      3;

    const overallRecommendation = langChainScore > lightRAGScore ? "LangChain" : "LightRAG";

    return {
      langChain: langChainResults,
      lightRAG: lightRAGResults,
      comparison: {
        entityQualityWinner,
        relationshipQualityWinner,
        queryAccuracyWinner,
        speedWinner,
        costWinner,
        overallRecommendation,
      },
    };
  }

  /**
   * Evaluate entity extraction accuracy
   */
  private evaluateEntities(
    extracted: Array<{ name: string; type: string }>,
    expected: Array<{ name: string; type: string }>
  ): {
    correct: number;
    missed: number;
    incorrect: number;
  } {
    let correct = 0;
    let incorrect = 0;

    const expectedSet = new Set(expected.map((e) => `${e.name}|${e.type}`));
    const extractedSet = new Set(extracted.map((e) => `${e.name}|${e.type}`));

    // Count correct extractions
    for (const e of extractedSet) {
      if (expectedSet.has(e)) {
        correct++;
      } else {
        incorrect++;
      }
    }

    // Count missed entities
    const missed = expected.length - correct;

    return { correct, missed, incorrect };
  }

  /**
   * Evaluate relationship extraction accuracy
   */
  private evaluateRelationships(
    extracted: Array<{ source: string; target: string; type: string }>,
    expected: Array<{ source: string; target: string; type: string }>
  ): {
    correct: number;
    missed: number;
    incorrect: number;
  } {
    let correct = 0;
    let incorrect = 0;

    const expectedSet = new Set(expected.map((r) => `${r.source}|${r.type}|${r.target}`));
    const extractedSet = new Set(extracted.map((r) => `${r.source}|${r.type}|${r.target}`));

    for (const r of extractedSet) {
      if (expectedSet.has(r)) {
        correct++;
      } else {
        incorrect++;
      }
    }

    const missed = expected.length - correct;

    return { correct, missed, incorrect };
  }

  /**
   * Check if answer matches expected (fuzzy matching)
   */
  private isAnswerCorrect(
    actual: string,
    expected: string,
    variations?: string[]
  ): boolean {
    const actualLower = actual.toLowerCase().trim();
    const expectedLower = expected.toLowerCase().trim();

    // Exact match
    if (actualLower.includes(expectedLower)) return true;

    // Check variations
    if (variations) {
      for (const variation of variations) {
        if (actualLower.includes(variation.toLowerCase())) return true;
      }
    }

    return false;
  }

  /**
   * Calculate P95 latency
   */
  private calculateP95(latencies: number[]): number {
    if (latencies.length === 0) return 0;

    const sorted = [...latencies].sort((a, b) => a - b);
    const index = Math.floor(sorted.length * 0.95);
    return sorted[index];
  }

  /**
   * Generate detailed report
   */
  generateReport(results: BenchmarkResults): string {
    return `
# ${results.system} Knowledge Graph Quality Report

**Generated**: ${new Date(results.timestamp).toLocaleString()}

## Entity Extraction Quality

- **Precision**: ${(results.entityMetrics.precision * 100).toFixed(1)}%
- **Recall**: ${(results.entityMetrics.recall * 100).toFixed(1)}%
- **F1 Score**: ${(results.entityMetrics.f1Score * 100).toFixed(1)}%

Breakdown:
- Correctly extracted: ${results.entityMetrics.correctEntities}
- Missed entities: ${results.entityMetrics.missedEntities}
- Incorrect extractions: ${results.entityMetrics.incorrectEntities}

## Relationship Extraction Quality

- **Precision**: ${(results.relationshipMetrics.precision * 100).toFixed(1)}%
- **Recall**: ${(results.relationshipMetrics.recall * 100).toFixed(1)}%
- **F1 Score**: ${(results.relationshipMetrics.f1Score * 100).toFixed(1)}%

Breakdown:
- Correctly extracted: ${results.relationshipMetrics.correctRelationships}
- Missed relationships: ${results.relationshipMetrics.missedRelationships}
- Incorrect extractions: ${results.relationshipMetrics.incorrectRelationships}

## Query Performance

- **Accuracy**: ${(results.queryMetrics.accuracy * 100).toFixed(1)}%
- **Average Latency**: ${results.queryMetrics.averageLatency.toFixed(0)}ms
- **P95 Latency**: ${results.queryMetrics.p95Latency.toFixed(0)}ms
- **Correct Answers**: ${results.queryMetrics.correctAnswers}/${results.queryMetrics.totalQueries}

## Cost Analysis

- **Total Tokens**: ${results.costMetrics.totalTokens.toLocaleString()}
- **Estimated Cost**: $${results.costMetrics.estimatedCost.toFixed(4)}
- **Tokens per Document**: ${results.costMetrics.tokensPerDocument.toFixed(0)}

## Performance

- **Total Duration**: ${(results.performanceMetrics.totalDuration / 1000).toFixed(2)}s
- **Documents per Second**: ${results.performanceMetrics.documentsPerSecond.toFixed(2)}

---

## Interpretation

${this.interpretResults(results)}
`;
  }

  /**
   * Interpret results and provide recommendations
   */
  private interpretResults(results: BenchmarkResults): string {
    const f1Score = results.entityMetrics.f1Score;
    const accuracy = results.queryMetrics.accuracy;

    let interpretation = "";

    if (f1Score > 0.9 && accuracy > 0.9) {
      interpretation = "**Excellent**: The system achieves high quality entity extraction and query accuracy suitable for production use.";
    } else if (f1Score > 0.7 && accuracy > 0.7) {
      interpretation = "**Good**: The system performs well but may benefit from fine-tuning prompts or adding domain-specific examples.";
    } else if (f1Score > 0.5 && accuracy > 0.5) {
      interpretation = "**Moderate**: The system shows promise but requires improvement in entity extraction or query handling before production use.";
    } else {
      interpretation = "**Needs Improvement**: The system requires significant tuning or may not be suitable for this use case. Consider alternative approaches.";
    }

    return interpretation;
  }
}

// Export singleton instance
export const qualityTester = new KnowledgeGraphQualityTester();
