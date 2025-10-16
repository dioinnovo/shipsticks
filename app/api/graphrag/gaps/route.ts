/**
 * Healthcare Gap Detection API Endpoint
 * Identifies gaps in healthcare delivery
 */

import { NextRequest, NextResponse } from 'next/server';
import { gapDetector } from '@/lib/graphrag/gap-detector';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get('patientId');
  const priority = searchParams.get('priority');
  const gapType = searchParams.get('gapType');

  try {
    console.log('🔍 Detecting healthcare gaps...');

    let result;

    if (patientId) {
      // Get gaps for specific patient
      const gaps = await gapDetector.getGapsForPatient(patientId);
      result = {
        totalGaps: gaps.length,
        gaps,
        generatedAt: new Date().toISOString(),
      };
    } else if (priority) {
      // Get gaps by priority
      const gaps = await gapDetector.getGapsByPriority(
        priority as 'Critical' | 'High' | 'Moderate' | 'Low'
      );
      result = {
        totalGaps: gaps.length,
        gaps,
        generatedAt: new Date().toISOString(),
      };
    } else if (gapType) {
      // Get gaps by type
      const gaps = await gapDetector.getGapsByType(gapType);
      result = {
        totalGaps: gaps.length,
        gaps,
        generatedAt: new Date().toISOString(),
      };
    } else {
      // Get all gaps
      result = await gapDetector.detectAllGaps();
    }

    console.log(`✅ Found ${result.totalGaps} gaps`);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('❌ Gap detection failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gap detection failed',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { gapType } = await request.json();

    if (!gapType) {
      return NextResponse.json(
        { success: false, error: 'gapType is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Detecting gaps of type: ${gapType}`);

    const gaps = await gapDetector.getGapsByType(gapType);

    return NextResponse.json({
      success: true,
      totalGaps: gaps.length,
      gaps,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Gap detection failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gap detection failed',
      },
      { status: 500 }
    );
  }
}
