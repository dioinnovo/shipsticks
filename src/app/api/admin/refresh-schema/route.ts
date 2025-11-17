import { NextRequest, NextResponse } from 'next/server';
import { refreshSchemaCache, getSchemaCacheStatus } from '@/lib/ai/langchain-config';

/**
 * POST /api/admin/refresh-schema
 * Refresh the SQL agent schema cache
 *
 * Use this endpoint after:
 * - Database migrations
 * - Adding/removing tables
 * - Changing table schemas
 * - Redeploying the application
 *
 * Authentication: In production, this should be protected by API key or admin auth
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check here
    // const apiKey = request.headers.get('x-api-key');
    // if (apiKey !== process.env.ADMIN_API_KEY) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    console.log('\n🔄 Admin: Schema cache refresh requested');

    // Get current cache status before refresh
    const statusBefore = getSchemaCacheStatus();

    // Refresh the cache
    const success = await refreshSchemaCache();

    // Get new cache status
    const statusAfter = getSchemaCacheStatus();

    if (success && statusAfter) {
      return NextResponse.json({
        success: true,
        message: 'Schema cache refreshed successfully',
        cache: {
          tables: statusAfter.tableNames.length,
          sizeKB: (statusAfter.fullSchema.length / 1024).toFixed(1),
          lastUpdated: statusAfter.lastUpdated,
          previousUpdate: statusBefore?.lastUpdated || null
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to refresh schema cache. Check server logs for details.',
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ Admin API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error',
    }, { status: 500 });
  }
}

/**
 * GET /api/admin/refresh-schema
 * Get current schema cache status
 */
export async function GET(request: NextRequest) {
  try {
    const status = getSchemaCacheStatus();

    if (status) {
      return NextResponse.json({
        cached: true,
        tables: status.tableNames.length,
        tableList: status.tableNames,
        sizeKB: (status.fullSchema.length / 1024).toFixed(1),
        lastUpdated: status.lastUpdated,
      });
    } else {
      return NextResponse.json({
        cached: false,
        message: 'Schema cache not initialized. The SQL agent will query the database directly for schema information.',
      });
    }

  } catch (error: any) {
    console.error('❌ Admin API Error:', error);
    return NextResponse.json({
      error: error.message || 'Internal server error',
    }, { status: 500 });
  }
}
