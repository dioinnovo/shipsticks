# Arthur Health - Synapse Spark ETL to Neo4j

This directory contains Apache Spark notebooks for extracting data from Microsoft Synapse SQL pools and loading it into Neo4j Knowledge Graph using the Neo4j Spark Connector.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   Microsoft Synapse                          │
│                                                              │
│  ┌───────────────┐         ┌─────────────────────────────┐ │
│  │  SQL Pools    │         │    Apache Spark Pools       │ │
│  │  (FHIR Data)  │────────>│    (ETL Notebooks)          │ │
│  │               │         │    - Neo4j Connector        │ │
│  └───────────────┘         │    - Azure OpenAI Client    │ │
│                            └──────────────┬──────────────┘ │
└──────────────────────────────────────────┼─────────────────┘
                                            │
                                            ↓
                           ┌────────────────────────────────┐
                           │      Neo4j AuraDB              │
                           │   Knowledge Graph              │
                           │   - Patient nodes              │
                           │   - Medication nodes           │
                           │   - PRESCRIBED relationships   │
                           │   - Text embeddings            │
                           └────────────────────────────────┘
```

## Directory Structure

```
synapse/
├── spark-notebooks/
│   ├── 00_master_orchestration.py       # Master pipeline orchestrator
│   ├── 01_patients_etl.py               # Extract patients with embeddings
│   ├── 02_medications_etl.py            # Extract medications with embeddings
│   ├── 03_patient_medication_relationships.py  # Create PRESCRIBED relationships
│   ├── 04_diagnoses_etl.py              # TODO: Extract diagnoses
│   ├── 05_providers_etl.py              # TODO: Extract providers
│   ├── 06_facilities_etl.py             # TODO: Extract facilities
│   └── 07_care_programs_etl.py          # TODO: Extract care programs
├── pipelines/
│   └── synapse-pipeline.json            # Synapse Pipeline definition
└── README.md                             # This file
```

## Prerequisites

### 1. Infrastructure Setup

- **Neo4j AuraDB Enterprise** instance running (3-node cluster recommended)
- **Microsoft Synapse Workspace** with:
  - SQL pool containing FHIR healthcare data
  - Apache Spark pool (version 3.3+)
- **Azure OpenAI** instance with `text-embedding-3-small` deployment
- **Azure Key Vault** for storing secrets

### 2. Neo4j Schema Creation

Before running ETL, create the Neo4j schema:

```bash
# Connect to Neo4j using cypher-shell
cypher-shell -a neo4j+s://your-instance.databases.neo4j.io \
             -u neo4j \
             -p your-password \
             -f ../lib/graphrag/neo4j-schema.cypher
```

Or run from Neo4j Browser:
```cypher
// Paste contents of lib/graphrag/neo4j-schema.cypher
```

This creates:
- 7 node type constraints
- 15+ property indexes
- 5 vector indexes for embeddings
- 7 full-text indexes for keyword search

### 3. Synapse Spark Pool Configuration

#### Install Neo4j Spark Connector

Add the following Maven package to your Spark pool:

```
org.neo4j:neo4j-connector-apache-spark_2.12:5.3.10_for_spark_3
```

**Steps**:
1. Open Synapse Studio
2. Navigate to **Manage** > **Apache Spark pools**
3. Select your Spark pool
4. Click **Packages**
5. Add Maven package: `org.neo4j:neo4j-connector-apache-spark_2.12:5.3.10_for_spark_3`
6. Apply and restart pool

#### Configure Spark Pool Size

Recommended configuration for production:
- **Node size**: Medium (8 cores, 64 GB memory)
- **Number of nodes**: 3-10 (autoscale)
- **Session timeout**: 30 minutes
- **Dynamic allocation**: Enabled

### 4. Azure Key Vault Secrets

Store the following secrets in Azure Key Vault:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `neo4j-password` | Neo4j AuraDB password | `yourNeo4jPassword123` |
| `azure-openai-key` | Azure OpenAI API key | `abc123...xyz` |
| `synapse-user` | Synapse SQL user | `sqladmin` |
| `synapse-password` | Synapse SQL password | `yourSynapsePassword456` |

**Link Key Vault to Synapse**:
1. Open Synapse Studio
2. Navigate to **Manage** > **Linked services**
3. Create new **Azure Key Vault** linked service
4. Name it `arthur-health` (notebooks reference this scope)
5. Test connection and save

### 5. Azure OpenAI Setup

Ensure you have deployed the `text-embedding-3-small` model:

```bash
# Azure CLI
az cognitiveservices account deployment create \
  --name arthur-health \
  --resource-group arthur-health-rg \
  --deployment-name text-embedding-3-small \
  --model-name text-embedding-3-small \
  --model-version "1" \
  --model-format OpenAI \
  --sku-capacity 120 \
  --sku-name "Standard"
```

## ETL Notebook Configuration

Each notebook requires configuration updates before first run.

### Update Connection Strings

In each notebook, update the following variables:

```python
# Neo4j connection
NEO4J_URI = "neo4j+s://xxxxx.databases.neo4j.io"  # Replace with your AuraDB URI

# Azure OpenAI
AZURE_OPENAI_ENDPOINT = "https://arthur-health.openai.azure.com/"  # Replace with your endpoint

# Synapse SQL
SYNAPSE_SERVER = "arthur-health-synapse.sql.azuresynapse.net"  # Replace with your server
```

### Incremental vs Full Refresh

Each notebook supports two modes:

**Incremental Mode** (default):
```python
INCREMENTAL_MODE = True
LAST_RUN_TIMESTAMP = "2025-01-01 00:00:00"  # Update after each successful run
```

**Full Refresh Mode**:
```python
INCREMENTAL_MODE = False
```

## Running the ETL Pipeline

### Option 1: Manual Execution (Development)

#### Run Individual Notebooks

1. Open Synapse Studio
2. Navigate to **Develop** > **Notebooks**
3. Import notebooks from `synapse/spark-notebooks/`
4. Attach to your Spark pool
5. Run cells sequentially

**Execution order**:
```
1. 01_patients_etl.py          → Creates Patient nodes
2. 02_medications_etl.py       → Creates Medication nodes
3. 03_patient_medication_relationships.py  → Creates PRESCRIBED relationships
```

#### Run Master Orchestrator

The master orchestrator runs all notebooks in the correct dependency order:

```python
# Open 00_master_orchestration.py
# Update configuration:
INCREMENTAL_MODE = True
LAST_SUCCESSFUL_RUN = "2025-01-01 00:00:00"

# Run all cells
```

### Option 2: Automated Execution (Production)

#### Using Synapse Pipeline

1. **Create Pipeline**:
   - Open Synapse Studio
   - Navigate to **Integrate** > **Pipelines**
   - Click **New Pipeline**
   - Name it `arthur-health-neo4j-etl`

2. **Add Notebook Activities**:
   - Drag **Notebook** activity onto canvas
   - Configure:
     - Name: `Master Orchestration`
     - Notebook: `00_master_orchestration`
     - Spark pool: Select your pool
     - Parameters:
       ```json
       {
         "INCREMENTAL_MODE": "True",
         "LAST_SUCCESSFUL_RUN": "@pipeline().parameters.lastRunTimestamp"
       }
       ```

3. **Add Schedule Trigger**:
   - Click **Add trigger** > **New/Edit**
   - Type: **Schedule**
   - Recurrence: **Daily at 2:00 AM UTC**
   - Start date: Today
   - Time zone: UTC

4. **Save and Publish**

#### Using Azure Data Factory

Alternatively, use Azure Data Factory for more advanced orchestration:

```json
// See synapse/pipelines/synapse-pipeline.json for complete definition
{
  "name": "arthur-health-neo4j-etl",
  "properties": {
    "activities": [
      {
        "name": "Master ETL Orchestration",
        "type": "SynapseNotebook",
        "dependsOn": [],
        "policy": {
          "timeout": "1:00:00",
          "retry": 2
        },
        "userProperties": [],
        "typeProperties": {
          "notebook": {
            "referenceName": "00_master_orchestration",
            "type": "NotebookReference"
          },
          "sparkPool": {
            "referenceName": "arthurHealthSparkPool",
            "type": "BigDataPoolReference"
          }
        }
      }
    ]
  }
}
```

## Monitoring and Logging

### Synapse Monitoring

1. **Monitor Pipeline Runs**:
   - Navigate to **Monitor** > **Pipeline runs**
   - View status, duration, and errors

2. **Monitor Spark Applications**:
   - Navigate to **Monitor** > **Apache Spark applications**
   - View detailed Spark logs and metrics

### ETL Run Logs

Each ETL run logs metadata to:
- **Console output**: Available in Synapse notebook execution
- **Synapse SQL table** (optional): `healthcare_fhir.etl_run_log`

Create logging table:
```sql
CREATE TABLE healthcare_fhir.etl_run_log (
    run_id VARCHAR(50) PRIMARY KEY,
    pipeline_name VARCHAR(100),
    start_time DATETIME2,
    end_time DATETIME2,
    duration_seconds INT,
    status VARCHAR(20),
    incremental_mode BIT,
    stages_executed INT,
    notebooks_executed INT,
    notebooks_succeeded INT,
    notebooks_failed INT,
    metadata_json NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE()
);
```

### Neo4j Monitoring

Verify data in Neo4j:

```cypher
// Check node counts
MATCH (n)
RETURN labels(n)[0] as node_type, count(*) as count
ORDER BY count DESC;

// Check relationship counts
MATCH ()-[r]->()
RETURN type(r) as relationship_type, count(*) as count
ORDER BY count DESC;

// Check embeddings
MATCH (p:Patient)
WHERE p.policyTextEmbedding IS NOT NULL
RETURN count(*) as patients_with_embeddings;

// Check extraction timestamps
MATCH (n)
RETURN labels(n)[0] as node_type,
       max(n.extractedAt) as last_extraction,
       min(n.extractedAt) as first_extraction;
```

## Performance Optimization

### 1. Embedding Generation

Embedding generation is the slowest part of the ETL. Optimize by:

**Batch Processing**:
```python
# Process in batches to avoid rate limits
BATCH_SIZE = 100

# Use threading for parallel API calls (within rate limits)
from concurrent.futures import ThreadPoolExecutor

def generate_embeddings_batch(texts):
    with ThreadPoolExecutor(max_workers=10) as executor:
        embeddings = list(executor.map(generate_embedding, texts))
    return embeddings
```

**Caching**:
```python
# Skip embedding generation if text hasn't changed
patients_with_embeddings = patients_df.withColumn(
    "policy_text_embedding",
    when(
        col("policy_text_hash") == col("previous_hash"),
        col("previous_embedding")
    ).otherwise(
        generate_embedding_udf(col("policy_text"))
    )
)
```

### 2. Neo4j Write Performance

**Use Batch Writes**:
```python
# Write in batches of 10,000 records
patients_neo4j.write \
    .format("org.neo4j.spark.DataSource") \
    .option("batch.size", "10000") \
    .option("batch.rows", "10000") \
    .save()
```

**Partition Data**:
```python
# Partition by patient ID for parallel writes
patients_neo4j.repartition(10, "id").write \
    .format("org.neo4j.spark.DataSource") \
    .save()
```

### 3. Synapse SQL Performance

**Use Column Statistics**:
```sql
-- Update statistics on source tables
UPDATE STATISTICS healthcare_fhir.patients;
UPDATE STATISTICS healthcare_fhir.medications;
UPDATE STATISTICS healthcare_fhir.prescriptions;
```

**Add Indexes**:
```sql
-- Index frequently filtered columns
CREATE INDEX idx_patients_last_modified ON healthcare_fhir.patients(last_modified);
CREATE INDEX idx_prescriptions_patient_id ON healthcare_fhir.prescriptions(patient_id);
```

## Cost Estimation

### Synapse Spark Pool Costs

**Assumption**: Medium nodes (8 cores), 3 hours/day, 30 days/month

| Component | Unit Cost | Usage | Monthly Cost |
|-----------|-----------|-------|--------------|
| Spark pool (medium) | $0.304/hour | 90 hours | $27.36 |
| Azure OpenAI (embeddings) | $0.0001/1K tokens | 50M tokens | $5.00 |
| Data transfer | $0.087/GB | 100 GB | $8.70 |
| **Total** | | | **~$41/month** |

### Neo4j AuraDB Costs

| Tier | Nodes | Memory | Storage | Monthly Cost |
|------|-------|--------|---------|--------------|
| Professional | 3 | 8 GB | 32 GB | $65 |
| Enterprise | 3 | 16 GB | 64 GB | $145 |

**Recommended**: Start with Professional tier, scale to Enterprise for production.

## Troubleshooting

### Common Issues

#### 1. "Neo4j connector not found"

**Error**:
```
java.lang.ClassNotFoundException: org.neo4j.spark.DataSource
```

**Solution**:
- Ensure Neo4j Spark Connector is installed in Spark pool
- Restart Spark pool after adding package
- Verify package name: `org.neo4j:neo4j-connector-apache-spark_2.12:5.3.10_for_spark_3`

#### 2. "Authentication failed" (Neo4j)

**Error**:
```
org.neo4j.driver.exceptions.AuthenticationException: The client is unauthorized
```

**Solution**:
- Verify `NEO4J_USERNAME` and `NEO4J_PASSWORD` are correct
- Check Key Vault secret `neo4j-password` is accessible
- Ensure Synapse has permission to access Key Vault

#### 3. "Rate limit exceeded" (Azure OpenAI)

**Error**:
```
openai.error.RateLimitError: Rate limit reached for text-embedding-3-small
```

**Solution**:
- Increase Azure OpenAI deployment capacity (TPM)
- Add retry logic with exponential backoff
- Process embeddings in smaller batches
- Consider caching embeddings for unchanged text

#### 4. "Relationship nodes not found"

**Error**:
```
Cannot create relationship: source or target node not found
```

**Solution**:
- Ensure entity notebooks (patients, medications) run BEFORE relationship notebooks
- Verify node `id` values match between source data and Neo4j
- Check `Match` mode is used correctly in relationship creation

## Next Steps

1. **Complete Entity Notebooks**:
   - Create `04_diagnoses_etl.py`
   - Create `05_providers_etl.py`
   - Create `06_facilities_etl.py`
   - Create `07_care_programs_etl.py`

2. **Complete Relationship Notebooks**:
   - `patient_diagnosis_relationships.py`
   - `patient_provider_relationships.py`
   - `provider_facility_relationships.py`
   - `patient_care_program_relationships.py`

3. **Implement CDC (Change Data Capture)**:
   - Set up Azure Event Hubs
   - Create Spark Streaming job for real-time updates
   - See `docs/AZURE_SYNAPSE_INTEGRATION.md` for CDC architecture

4. **Add Data Quality Validation**:
   - Create validation notebook
   - Check for orphaned relationships
   - Verify embedding dimensions
   - Monitor extraction timestamps

5. **Production Hardening**:
   - Add comprehensive error handling
   - Implement retry logic
   - Set up alerting (Azure Monitor)
   - Configure backup/disaster recovery

## Support

For issues or questions:
- **Internal**: Contact Arthur Health Data Engineering team
- **Neo4j**: https://support.neo4j.com
- **Synapse**: https://docs.microsoft.com/azure/synapse-analytics/

## References

- [Neo4j Spark Connector Documentation](https://neo4j.com/docs/spark/current/)
- [Azure Synapse Spark Documentation](https://docs.microsoft.com/azure/synapse-analytics/spark/)
- [Azure OpenAI Embeddings](https://learn.microsoft.com/azure/ai-services/openai/how-to/embeddings)
- [FHIR Resources](https://www.hl7.org/fhir/)
