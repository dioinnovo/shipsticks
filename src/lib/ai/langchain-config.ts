import { DataSource } from "typeorm";
import "reflect-metadata";

/**
 * TypeORM DataSource for LangChain SQL Agent
 * Provides database connection for Ship Sticks analytics database
 */
let dataSource: DataSource | null = null;

/**
 * Schema Cache
 * Stores table names and schemas to avoid repeated database queries
 * Cache is loaded on server startup and persists for the process lifetime
 */
interface SchemaCache {
  tableNames: string[];
  fullSchema: string;
  lastUpdated: Date;
}

let schemaCache: SchemaCache | null = null;

/**
 * Get or create the LangChain TypeORM DataSource singleton
 * @returns Initialized TypeORM DataSource
 */
export async function getLangChainDataSource(): Promise<DataSource> {
  if (dataSource && dataSource.isInitialized) {
    return dataSource;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set. Please configure your PostgreSQL connection.");
  }

  console.log("🔌 Initializing LangChain TypeORM DataSource...");

  dataSource = new DataSource({
    type: "postgres",
    url: databaseUrl,
    synchronize: false, // Don't auto-sync schema (we use backup restore)
    logging: false, // Set to true for SQL query debugging
    // Connection pooling configuration
    extra: {
      max: 10, // Maximum pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    },
  });

  await dataSource.initialize();
  console.log("✅ LangChain TypeORM DataSource initialized successfully");

  return dataSource;
}

/**
 * Execute raw SQL queries safely
 * @param query SQL query string
 * @returns Query results as array of objects
 */
export async function executeQuery(query: string): Promise<any[]> {
  const ds = await getLangChainDataSource();
  const result = await ds.query(query);
  return result;
}

/**
 * Get all table names from the Ship Sticks database
 * @returns Array of table names
 */
export async function getTableNames(): Promise<string[]> {
  const ds = await getLangChainDataSource();
  const result = await ds.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);
  return result.map((row: any) => row.table_name);
}

/**
 * Get detailed schema information for specific tables
 * @param tableNames Array of table names to get schemas for
 * @returns Formatted schema string with columns, foreign keys, and samples
 */
export async function getTableSchema(tableNames: string[]): Promise<string> {
  const ds = await getLangChainDataSource();

  const schemas: string[] = [];

  for (const tableName of tableNames) {
    // Get column information
    const columns = await ds.query(`
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);

    // Get foreign key relationships
    const fks = await ds.query(`
      SELECT
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = $1
    `, [tableName]);

    // Build schema string
    let schemaStr = `\nTable: ${tableName}\n`;
    schemaStr += `Columns:\n`;

    for (const col of columns) {
      schemaStr += `  - ${col.column_name} (${col.data_type})`;
      if (col.is_nullable === 'NO') schemaStr += ' NOT NULL';
      if (col.column_default) schemaStr += ` DEFAULT ${col.column_default}`;
      schemaStr += '\n';
    }

    if (fks.length > 0) {
      schemaStr += `Foreign Keys:\n`;
      for (const fk of fks) {
        schemaStr += `  - ${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}\n`;
      }
    }

    // Get sample rows for context
    try {
      const sampleRows = await ds.query(`SELECT * FROM "${tableName}" LIMIT 3`);
      if (sampleRows.length > 0) {
        schemaStr += `Sample rows: ${sampleRows.length}\n`;
        schemaStr += `  ${JSON.stringify(sampleRows[0])}\n`;
      }
    } catch (error) {
      // Skip sample rows if query fails (e.g., permissions)
      console.warn(`Could not fetch sample rows for ${tableName}`);
    }

    schemas.push(schemaStr);
  }

  return schemas.join('\n');
}

/**
 * Initialize schema cache on server startup
 * Caches all table names and schemas to eliminate repeated lookups
 * @returns True if cache was successfully initialized
 */
export async function initializeSchemaCache(): Promise<boolean> {
  try {
    console.log("📦 Initializing schema cache...");

    // Get all table names
    const tables = await getTableNames();

    // Get full schema for all tables
    const fullSchema = await getTableSchema(tables);

    // Store in cache
    schemaCache = {
      tableNames: tables,
      fullSchema,
      lastUpdated: new Date()
    };

    console.log(`✅ Schema cache initialized: ${tables.length} tables, ${(fullSchema.length / 1024).toFixed(1)}KB`);
    return true;
  } catch (error: any) {
    console.error("❌ Failed to initialize schema cache:", error.message);
    return false;
  }
}

/**
 * Get cached table names
 * If cache is empty, falls back to database query
 * @returns Array of table names
 */
export async function getCachedTableNames(): Promise<string[]> {
  if (schemaCache) {
    console.log("✨ Using cached table names");
    return schemaCache.tableNames;
  }

  console.log("⚠️  Schema cache not initialized, querying database");
  return await getTableNames();
}

/**
 * Get cached schema for specific tables
 * If cache is empty, falls back to database query
 * @param tableNames Array of table names (if empty, returns full schema)
 * @returns Formatted schema string
 */
export async function getCachedSchema(tableNames?: string[]): Promise<string> {
  // Initialize cache if not already loaded
  if (!schemaCache) {
    console.log("⚠️  Schema cache not found, initializing now...");
    await initializeSchemaCache();
  }

  if (schemaCache) {
    // If specific tables requested, filter the full schema
    if (tableNames && tableNames.length > 0) {
      // For now, return full schema (we could optimize this further)
      console.log(`✨ Using cached schema for ${tableNames.length} tables`);
      return schemaCache.fullSchema;
    }

    // Return full schema
    console.log("✨ Using full cached schema");
    return schemaCache.fullSchema;
  }

  // Fallback if initialization failed
  console.log("❌ Schema cache initialization failed, querying database directly");
  return await getTableSchema(tableNames || []);
}

/**
 * Refresh the schema cache
 * Call this after schema changes (migrations, new tables, etc.)
 * @returns True if refresh was successful
 */
export async function refreshSchemaCache(): Promise<boolean> {
  console.log("🔄 Refreshing schema cache...");
  schemaCache = null; // Clear existing cache
  return await initializeSchemaCache();
}

/**
 * Get schema cache status
 * @returns Cache metadata or null if not initialized
 */
export function getSchemaCacheStatus(): SchemaCache | null {
  return schemaCache;
}

/**
 * Close the database connection
 * Call this on server shutdown
 */
export async function closeLangChainDataSource(): Promise<void> {
  if (dataSource && dataSource.isInitialized) {
    await dataSource.destroy();
    dataSource = null;
    schemaCache = null; // Clear cache on shutdown
    console.log("🔌 LangChain TypeORM DataSource closed");
  }
}
