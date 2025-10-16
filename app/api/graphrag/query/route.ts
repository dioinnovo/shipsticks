/**
 * GraphRAG Query API Endpoint
 * Handles natural language queries using Text2Cypher
 */

import { NextRequest, NextResponse } from 'next/server';
import { text2cypher } from '@/lib/graphrag/text2cypher';
import { gapDetector } from '@/lib/graphrag/gap-detector';

export async function POST(request: NextRequest) {
  try {
    const { question, patientId } = await request.json();

    if (!question) {
      return NextResponse.json(
        { success: false, error: 'Question is required' },
        { status: 400 }
      );
    }

    console.log('📊 GraphRAG Query:', question);

    // If patient-specific query, add context
    const enhancedQuestion = patientId
      ? `For patient ID ${patientId}: ${question}`
      : question;

    // Query using Text2Cypher
    const result = await text2cypher.query(enhancedQuestion);

    return NextResponse.json({
      success: true,
      question: question,
      answer: result.answer,
      cypherQuery: result.cypherQuery,
      metadata: {
        processingTime: Date.now(),
        modelUsed: 'gpt-4o',
        graphDatabase: 'neo4j',
      },
    });
  } catch (error: any) {
    console.error('❌ GraphRAG query failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process query',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'health':
        // Health check endpoint
        const { neo4jClient } = await import('@/lib/graphrag/neo4j-client');
        const isHealthy = await neo4jClient.healthCheck();
        return NextResponse.json({
          success: true,
          healthy: isHealthy,
          timestamp: new Date().toISOString(),
        });

      case 'stats':
        // Get graph statistics
        const { neo4jClient: statsClient } = await import('@/lib/graphrag/neo4j-client');
        const stats = await statsClient.getStats();
        return NextResponse.json({
          success: true,
          stats,
        });

      case 'schema':
        // Get schema information
        const { neo4jClient: schemaClient } = await import('@/lib/graphrag/neo4j-client');
        const schema = await schemaClient.getSchema();
        return NextResponse.json({
          success: true,
          schema,
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('❌ GraphRAG GET request failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Request failed',
      },
      { status: 500 }
    );
  }
}
