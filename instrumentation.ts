/**
 * Next.js Instrumentation Hook
 * Called once when the server starts (Node.js runtime only)
 *
 * This initializes the SQL Agent:
 * - Establishes TypeORM connection to PostgreSQL
 * - Loads schema cache for all 15 tables
 * - Enables fast path optimization
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initializeSqlAgent } = await import('./src/lib/ai/sql-agent');

    try {
      console.log('🚀 Server starting - Initializing SQL Agent...');
      await initializeSqlAgent();
      console.log('✅ SQL Agent ready for queries');
    } catch (error) {
      console.error('❌ Failed to initialize SQL Agent:', error);
      console.error('💡 SQL queries will not work until this is resolved');
    }
  }
}
