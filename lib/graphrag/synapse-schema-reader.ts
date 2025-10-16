/**
 * Synapse Schema Reader
 * Reads table metadata from Microsoft Synapse SQL pool using INFORMATION_SCHEMA
 *
 * Extracts:
 * - Table structures
 * - Column definitions
 * - Primary keys
 * - Foreign keys
 * - Indexes
 * - Row counts
 */

import { Connection, Request, TYPES } from "tedious";
import { TableMetadata } from "./schema-discovery-agent";

export interface SynapseConfig {
  server: string;
  database: string;
  user: string;
  password: string;
  port?: number;
  options?: {
    encrypt?: boolean;
    trustServerCertificate?: boolean;
  };
}

export class SynapseSchemaReader {
  private config: SynapseConfig;

  constructor(config?: SynapseConfig) {
    this.config = config || {
      server: process.env.SYNAPSE_SERVER || "arthur-health-synapse.sql.azuresynapse.net",
      database: process.env.SYNAPSE_DATABASE || "healthcare_fhir",
      user: process.env.SYNAPSE_USER || "sqladmin",
      password: process.env.SYNAPSE_PASSWORD || "",
      port: 1433,
      options: {
        encrypt: true,
        trustServerCertificate: false,
      },
    };
  }

  /**
   * Read all table metadata from Synapse
   */
  async readAllTables(schemaFilter: string[] = ["dbo", "healthcare_fhir"]): Promise<TableMetadata[]> {
    console.log(`📊 Reading schema from Synapse: ${this.config.server}/${this.config.database}`);

    const connection = await this.connect();

    try {
      // Get all tables
      const tables = await this.getTables(connection, schemaFilter);
      console.log(`   Found ${tables.length} tables`);

      // Get detailed metadata for each table
      const tableMetadata: TableMetadata[] = [];

      for (const table of tables) {
        console.log(`   Analyzing ${table.schemaName}.${table.tableName}...`);

        const metadata: TableMetadata = {
          tableName: table.tableName,
          schemaName: table.schemaName,
          columns: await this.getColumns(connection, table.schemaName, table.tableName),
          indexes: await this.getIndexes(connection, table.schemaName, table.tableName),
          rowCount: await this.getRowCount(connection, table.schemaName, table.tableName),
        };

        // Enrich with foreign key information
        await this.enrichWithForeignKeys(connection, metadata);

        tableMetadata.push(metadata);
      }

      console.log(`✅ Schema analysis complete`);
      return tableMetadata;
    } finally {
      await this.disconnect(connection);
    }
  }

  /**
   * Connect to Synapse
   */
  private async connect(): Promise<Connection> {
    return new Promise((resolve, reject) => {
      const connection = new Connection({
        server: this.config.server,
        authentication: {
          type: "default",
          options: {
            userName: this.config.user,
            password: this.config.password,
          },
        },
        options: {
          database: this.config.database,
          port: this.config.port || 1433,
          encrypt: this.config.options?.encrypt !== false,
          trustServerCertificate: this.config.options?.trustServerCertificate || false,
          rowCollectionOnRequestCompletion: true,
        },
      });

      connection.on("connect", (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(connection);
        }
      });

      connection.connect();
    });
  }

  /**
   * Disconnect from Synapse
   */
  private async disconnect(connection: Connection): Promise<void> {
    connection.close();
  }

  /**
   * Get all tables in schema
   */
  private async getTables(
    connection: Connection,
    schemaFilter: string[]
  ): Promise<Array<{ schemaName: string; tableName: string }>> {
    const query = `
      SELECT
        TABLE_SCHEMA as schemaName,
        TABLE_NAME as tableName
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE'
        AND TABLE_SCHEMA IN (${schemaFilter.map((s) => `'${s}'`).join(", ")})
      ORDER BY TABLE_SCHEMA, TABLE_NAME
    `;

    return this.executeQuery<{ schemaName: string; tableName: string }>(connection, query);
  }

  /**
   * Get columns for a table
   */
  private async getColumns(
    connection: Connection,
    schemaName: string,
    tableName: string
  ): Promise<TableMetadata["columns"]> {
    const query = `
      SELECT
        c.COLUMN_NAME as name,
        c.DATA_TYPE as dataType,
        c.IS_NULLABLE as isNullable,
        CASE WHEN pk.COLUMN_NAME IS NOT NULL THEN 1 ELSE 0 END as isPrimaryKey
      FROM INFORMATION_SCHEMA.COLUMNS c
      LEFT JOIN (
        SELECT ku.COLUMN_NAME
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
        JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku
          ON tc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME
          AND tc.TABLE_SCHEMA = ku.TABLE_SCHEMA
          AND tc.TABLE_NAME = ku.TABLE_NAME
        WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
          AND tc.TABLE_SCHEMA = '${schemaName}'
          AND tc.TABLE_NAME = '${tableName}'
      ) pk ON c.COLUMN_NAME = pk.COLUMN_NAME
      WHERE c.TABLE_SCHEMA = '${schemaName}'
        AND c.TABLE_NAME = '${tableName}'
      ORDER BY c.ORDINAL_POSITION
    `;

    const rows = await this.executeQuery<{
      name: string;
      dataType: string;
      isNullable: string;
      isPrimaryKey: number;
    }>(connection, query);

    return rows.map((row) => ({
      name: row.name,
      dataType: row.dataType,
      isNullable: row.isNullable === "YES",
      isPrimaryKey: row.isPrimaryKey === 1,
      isForeignKey: false, // Will be enriched later
    }));
  }

  /**
   * Get indexes for a table
   */
  private async getIndexes(
    connection: Connection,
    schemaName: string,
    tableName: string
  ): Promise<TableMetadata["indexes"]> {
    const query = `
      SELECT
        i.name as indexName,
        COL_NAME(ic.object_id, ic.column_id) as columnName,
        i.is_unique as isUnique
      FROM sys.indexes i
      INNER JOIN sys.index_columns ic
        ON i.object_id = ic.object_id
        AND i.index_id = ic.index_id
      WHERE i.object_id = OBJECT_ID('${schemaName}.${tableName}')
        AND i.type > 0
      ORDER BY i.name, ic.key_ordinal
    `;

    const rows = await this.executeQuery<{
      indexName: string;
      columnName: string;
      isUnique: boolean;
    }>(connection, query);

    // Group by index name
    const indexMap = new Map<string, TableMetadata["indexes"][0]>();

    for (const row of rows) {
      if (!indexMap.has(row.indexName)) {
        indexMap.set(row.indexName, {
          name: row.indexName,
          columns: [],
          isUnique: row.isUnique,
        });
      }
      indexMap.get(row.indexName)!.columns.push(row.columnName);
    }

    return Array.from(indexMap.values());
  }

  /**
   * Get approximate row count
   */
  private async getRowCount(
    connection: Connection,
    schemaName: string,
    tableName: string
  ): Promise<number> {
    try {
      const query = `
        SELECT SUM(row_count) as rowCount
        FROM sys.dm_pdw_nodes_db_partition_stats
        WHERE object_id = OBJECT_ID('${schemaName}.${tableName}')
          AND index_id < 2
      `;

      const rows = await this.executeQuery<{ rowCount: number }>(connection, query);
      return rows[0]?.rowCount || 0;
    } catch (error) {
      // Fallback to regular SQL Server query
      try {
        const query = `
          SELECT COUNT_BIG(*) as rowCount
          FROM ${schemaName}.${tableName}
        `;
        const rows = await this.executeQuery<{ rowCount: number }>(connection, query);
        return rows[0]?.rowCount || 0;
      } catch {
        return 0;
      }
    }
  }

  /**
   * Enrich columns with foreign key information
   */
  private async enrichWithForeignKeys(
    connection: Connection,
    metadata: TableMetadata
  ): Promise<void> {
    const query = `
      SELECT
        fk.name as constraintName,
        COL_NAME(fkc.parent_object_id, fkc.parent_column_id) as columnName,
        OBJECT_SCHEMA_NAME(fkc.referenced_object_id) as refSchemaName,
        OBJECT_NAME(fkc.referenced_object_id) as refTableName,
        COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) as refColumnName
      FROM sys.foreign_keys fk
      INNER JOIN sys.foreign_key_columns fkc
        ON fk.object_id = fkc.constraint_object_id
      WHERE fk.parent_object_id = OBJECT_ID('${metadata.schemaName}.${metadata.tableName}')
    `;

    const foreignKeys = await this.executeQuery<{
      constraintName: string;
      columnName: string;
      refSchemaName: string;
      refTableName: string;
      refColumnName: string;
    }>(connection, query);

    // Update column metadata
    for (const fk of foreignKeys) {
      const column = metadata.columns.find((c) => c.name === fk.columnName);
      if (column) {
        column.isForeignKey = true;
        column.foreignKeyRef = {
          table: `${fk.refSchemaName}.${fk.refTableName}`,
          column: fk.refColumnName,
        };
      }
    }
  }

  /**
   * Execute a query and return results
   */
  private async executeQuery<T>(connection: Connection, query: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const results: T[] = [];

      const request = new Request(query, (err, rowCount, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });

      request.on("row", (columns) => {
        const row: any = {};
        columns.forEach((column) => {
          row[column.metadata.colName] = column.value;
        });
        results.push(row as T);
      });

      connection.execSql(request);
    });
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const connection = await this.connect();
      await this.disconnect(connection);
      console.log("✅ Synapse connection successful");
      return true;
    } catch (error: any) {
      console.error("❌ Synapse connection failed:", error.message);
      return false;
    }
  }
}

// Export singleton
export const synapseSchemaReader = new SynapseSchemaReader();
