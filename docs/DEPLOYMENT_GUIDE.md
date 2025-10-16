# Arthur Health GraphRAG - Complete Deployment Guide

This guide walks through the complete deployment of the Arthur Health GraphRAG system from infrastructure setup to production operation.

## Table of Contents

1. [Overview](#overview)
2. [Phase 1: Infrastructure Setup](#phase-1-infrastructure-setup)
3. [Phase 2: Neo4j Configuration](#phase-2-neo4j-configuration)
4. [Phase 3: Synapse Setup](#phase-3-synapse-setup)
5. [Phase 4: ETL Deployment](#phase-4-etl-deployment)
6. [Phase 5: LangChain Query Layer](#phase-5-langchain-query-layer)
7. [Phase 6: Production Validation](#phase-6-production-validation)
8. [Phase 7: Monitoring & Operations](#phase-7-monitoring--operations)

---

## Overview

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Production Architecture                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐         ┌──────────────────────────────┐    │
│  │  Microsoft       │         │   Apache Spark (Synapse)     │    │
│  │  Synapse SQL     │────────>│   - Neo4j Connector          │    │
│  │  (FHIR Data)     │  Daily  │   - Azure OpenAI Client      │    │
│  │                  │  Batch  │   - ETL Notebooks            │    │
│  └──────────────────┘         └────────────┬─────────────────┘    │
│                                             │                       │
│                                             ↓                       │
│                               ┌───────────────────────────┐        │
│                               │   Neo4j AuraDB            │        │
│  ┌──────────────────┐         │   Knowledge Graph         │        │
│  │  Azure Event     │────────>│   - Patient nodes         │        │
│  │  Hubs (CDC)      │ Real-   │   - Medication nodes      │        │
│  │                  │ time    │   - PRESCRIBED rels       │        │
│  └──────────────────┘         │   - Text embeddings       │        │
│                               └────────────┬──────────────┘        │
│                                             │                       │
│                                             ↓                       │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │              Next.js Application (Arthur Health)             │  │
│  │  ┌───────────────────────┐   ┌──────────────────────────┐  │  │
│  │  │  LangChain Query      │   │  Query Router            │  │  │
│  │  │  - Text2Cypher        │   │  - Synapse SQL (simple)  │  │  │
│  │  │  - Hybrid Search      │   │  - Neo4j (complex)       │  │  │
│  │  │  - Gap Detection      │   │  - Decision layer        │  │  │
│  │  └───────────────────────┘   └──────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Graph Database**: Neo4j AuraDB Enterprise (3-node cluster)
- **Data Warehouse**: Microsoft Synapse Analytics
- **ETL**: Apache Spark with Neo4j Connector
- **Embeddings**: Azure OpenAI text-embedding-3-small
- **Query Layer**: LangChain + GraphCypherQAChain
- **Application**: Next.js 15.5.2 + React 18.2
- **Infrastructure**: Azure Cloud (HIPAA-compliant)

---

## Phase 1: Infrastructure Setup

### Prerequisites

- Azure subscription with billing enabled
- Owner or Contributor role on subscription
- Azure CLI installed
- Git repository access

### 1.1 Create Resource Group

```bash
# Set variables
SUBSCRIPTION_ID="your-subscription-id"
RESOURCE_GROUP="arthur-health-prod"
LOCATION="eastus"

# Login to Azure
az login
az account set --subscription $SUBSCRIPTION_ID

# Create resource group
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION \
  --tags Environment=Production Project=ArthurHealth
```

### 1.2 Deploy Neo4j AuraDB

**Option A: Neo4j Aura Console (Recommended)**

1. Visit https://console.neo4j.io/
2. Sign in or create account
3. Click **Create Database**
4. Configure:
   - **Name**: `arthur-health-prod`
   - **Region**: `East US` (match Azure region)
   - **Tier**: `Professional` (3 nodes, 8GB memory each)
   - **Storage**: 64GB
5. Click **Create** and save credentials securely
6. Note the connection URI: `neo4j+s://xxxxx.databases.neo4j.io`

**Option B: Azure Marketplace**

```bash
# Deploy Neo4j from Azure Marketplace
# Follow instructions at: https://azuremarketplace.microsoft.com/marketplace/apps/neo4j.neo4j-ee
```

**Cost**: ~$65/month (Professional tier)

### 1.3 Deploy Synapse Workspace

```bash
# Create Synapse workspace
az synapse workspace create \
  --name arthur-health-synapse \
  --resource-group $RESOURCE_GROUP \
  --storage-account arthurhealth$RANDOM \
  --file-system synapsedata \
  --sql-admin-login-user sqladmin \
  --sql-admin-login-password "YourStrongPassword123!" \
  --location $LOCATION \
  --managed-virtual-network true \
  --allowed-aad-tenant-ids-for-linking "" \
  --prevent-data-exfiltration true  # HIPAA requirement

# Create Apache Spark pool
az synapse spark pool create \
  --name arthurHealthSparkPool \
  --workspace-name arthur-health-synapse \
  --resource-group $RESOURCE_GROUP \
  --spark-version 3.3 \
  --node-count 3 \
  --node-size Medium \
  --enable-auto-scale true \
  --min-node-count 3 \
  --max-node-count 10 \
  --enable-auto-pause true \
  --delay 15
```

**Cost**: ~$27/month (3 hours/day runtime)

### 1.4 Deploy Azure OpenAI

```bash
# Create Azure OpenAI service
az cognitiveservices account create \
  --name arthur-health-openai \
  --resource-group $RESOURCE_GROUP \
  --kind OpenAI \
  --sku S0 \
  --location eastus \
  --yes

# Deploy text-embedding-3-small model
az cognitiveservices account deployment create \
  --name arthur-health-openai \
  --resource-group $RESOURCE_GROUP \
  --deployment-name text-embedding-3-small \
  --model-name text-embedding-3-small \
  --model-version "1" \
  --model-format OpenAI \
  --sku-capacity 120 \
  --sku-name "Standard"

# Get endpoint and key
OPENAI_ENDPOINT=$(az cognitiveservices account show \
  --name arthur-health-openai \
  --resource-group $RESOURCE_GROUP \
  --query properties.endpoint -o tsv)

OPENAI_KEY=$(az cognitiveservices account keys list \
  --name arthur-health-openai \
  --resource-group $RESOURCE_GROUP \
  --query key1 -o tsv)

echo "Azure OpenAI Endpoint: $OPENAI_ENDPOINT"
echo "Azure OpenAI Key: $OPENAI_KEY"
```

**Cost**: ~$5/month (50M embedding tokens)

### 1.5 Create Azure Key Vault

```bash
# Create Key Vault
az keyvault create \
  --name arthur-health-kv \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --enable-rbac-authorization true

# Add secrets
az keyvault secret set \
  --vault-name arthur-health-kv \
  --name neo4j-password \
  --value "your-neo4j-password"

az keyvault secret set \
  --vault-name arthur-health-kv \
  --name azure-openai-key \
  --value "$OPENAI_KEY"

az keyvault secret set \
  --vault-name arthur-health-kv \
  --name synapse-user \
  --value "sqladmin"

az keyvault secret set \
  --vault-name arthur-health-kv \
  --name synapse-password \
  --value "YourStrongPassword123!"

# Grant Synapse access to Key Vault
SYNAPSE_IDENTITY=$(az synapse workspace show \
  --name arthur-health-synapse \
  --resource-group $RESOURCE_GROUP \
  --query identity.principalId -o tsv)

az keyvault set-policy \
  --name arthur-health-kv \
  --object-id $SYNAPSE_IDENTITY \
  --secret-permissions get list
```

---

## Phase 2: Neo4j Configuration

### 2.1 Connect to Neo4j

```bash
# Install cypher-shell
brew install cypher-shell  # macOS
# or
apt-get install cypher-shell  # Linux

# Connect to Neo4j
cypher-shell -a neo4j+s://xxxxx.databases.neo4j.io \
             -u neo4j \
             -p your-password \
             -d neo4j
```

### 2.2 Create Schema

```bash
# Run schema creation script
cypher-shell -a neo4j+s://xxxxx.databases.neo4j.io \
             -u neo4j \
             -p your-password \
             -d neo4j \
             -f lib/graphrag/neo4j-schema.cypher
```

This creates:
- ✅ 7 node type constraints (Patient, Medication, Diagnosis, Provider, Facility, Procedure, CareProgram)
- ✅ 15+ property indexes
- ✅ 5 vector indexes (1536-dimensional embeddings)
- ✅ 7 full-text indexes

### 2.3 Verify Schema

```cypher
// Check constraints
SHOW CONSTRAINTS;

// Check indexes
SHOW INDEXES;

// Verify vector indexes
SHOW INDEXES YIELD name, type, state
WHERE type = "VECTOR";

// Should show:
// - patient_policy_vector
// - diagnosis_notes_vector
// - medication_instructions_vector
// - procedure_notes_vector
// - care_program_description_vector
```

---

## Phase 3: Synapse Setup

### 3.1 Configure Spark Pool

1. Open Synapse Studio: https://web.azuresynapse.net
2. Navigate to **Manage** > **Apache Spark pools**
3. Select `arthurHealthSparkPool`
4. Click **Packages**

#### Install Neo4j Spark Connector

Add Maven package:
```
org.neo4j:neo4j-connector-apache-spark_2.12:5.3.10_for_spark_3
```

5. Click **Apply**
6. Wait for pool to restart (~5 minutes)

#### Install Additional Python Packages

Add requirements.txt:
```
openai==1.10.0
requests==2.31.0
azure-identity==1.15.0
```

### 3.2 Link Key Vault

1. Navigate to **Manage** > **Linked services**
2. Click **New**
3. Select **Azure Key Vault**
4. Configure:
   - **Name**: `arthur-health` (matches notebook scope)
   - **Account selection method**: From Azure subscription
   - **Subscription**: Select your subscription
   - **Key vault name**: `arthur-health-kv`
5. Click **Test connection**
6. Click **Create**

### 3.3 Import ETL Notebooks

1. Navigate to **Develop** > **Notebooks**
2. Click **Import**
3. Select all notebooks from `synapse/spark-notebooks/`:
   - `00_master_orchestration.py`
   - `01_patients_etl.py`
   - `02_medications_etl.py`
   - `03_patient_medication_relationships.py`
4. For each notebook:
   - Click on notebook
   - Update connection strings:
     ```python
     NEO4J_URI = "neo4j+s://xxxxx.databases.neo4j.io"
     AZURE_OPENAI_ENDPOINT = "https://arthur-health-openai.openai.azure.com/"
     SYNAPSE_SERVER = "arthur-health-synapse.sql.azuresynapse.net"
     ```
   - Attach to `arthurHealthSparkPool`
   - Click **Publish**

---

## Phase 4: ETL Deployment

### 4.1 First ETL Run (Full Refresh)

#### Step 1: Run Patients ETL

1. Open `01_patients_etl.py`
2. Set configuration:
   ```python
   INCREMENTAL_MODE = False  # Full refresh for first run
   ```
3. Click **Run all**
4. Monitor execution (~30 minutes for 10K patients)
5. Verify results:
   ```cypher
   MATCH (p:Patient)
   RETURN count(p) as patient_count,
          count(p.policyTextEmbedding) as with_embeddings;
   ```

#### Step 2: Run Medications ETL

1. Open `02_medications_etl.py`
2. Set configuration:
   ```python
   INCREMENTAL_MODE = False
   ```
3. Click **Run all**
4. Monitor execution (~20 minutes for 5K medications)
5. Verify results:
   ```cypher
   MATCH (m:Medication)
   RETURN count(m) as medication_count,
          count(m.instructionsEmbedding) as with_embeddings;
   ```

#### Step 3: Run Relationship ETL

1. Open `03_patient_medication_relationships.py`
2. Set configuration:
   ```python
   INCREMENTAL_MODE = False
   ```
3. Click **Run all**
4. Monitor execution (~15 minutes for 20K prescriptions)
5. Verify results:
   ```cypher
   MATCH (p:Patient)-[r:PRESCRIBED]->(m:Medication)
   RETURN count(r) as prescription_count,
          avg(r.adherenceScore) as avg_adherence;
   ```

### 4.2 Schedule Automated ETL

#### Create Synapse Pipeline

1. Navigate to **Integrate** > **Pipelines**
2. Click **New pipeline**
3. Name: `arthur-health-neo4j-daily-etl`
4. Drag **Notebook** activity onto canvas
5. Configure:
   - **Name**: `Master Orchestration`
   - **Notebook**: `00_master_orchestration`
   - **Spark pool**: `arthurHealthSparkPool`
   - **Parameters**:
     ```json
     {
       "INCREMENTAL_MODE": "True",
       "LAST_SUCCESSFUL_RUN": "@pipeline().parameters.lastRunTimestamp"
     }
     ```
6. Click **Publish**

#### Add Schedule Trigger

1. Click **Add trigger** > **New/Edit**
2. Click **New**
3. Configure:
   - **Name**: `Daily 2AM UTC`
   - **Type**: **Schedule**
   - **Start date**: Today
   - **Recurrence**: Every 1 Day
   - **At these times**: 02:00
   - **Time zone**: UTC
4. Click **OK**
5. Click **Publish**

---

## Phase 5: LangChain Query Layer

### 5.1 Install Dependencies

```bash
# Navigate to project root
cd /Users/diodelahoz/Projects/arthur_health

# Install LangChain Neo4j dependencies
npm install @langchain/community neo4j-driver langchain
```

### 5.2 Configure Environment Variables

Create `.env.local`:

```bash
# Neo4j Connection
NEO4J_URI=neo4j+s://xxxxx.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-neo4j-password
NEO4J_DATABASE=neo4j

# Azure OpenAI
AZURE_OPENAI_KEY=your-azure-openai-key
AZURE_OPENAI_INSTANCE_NAME=arthur-health-openai
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_VERSION=2024-12-01-preview

# Synapse SQL (for query router)
SYNAPSE_CONNECTION_STRING=Server=arthur-health-synapse.sql.azuresynapse.net;Database=healthcare_fhir;User Id=sqladmin;Password=YourStrongPassword123!;
```

### 5.3 Initialize Neo4j Client

The Neo4j client is already implemented in `lib/graphrag/neo4j-client.ts`. Test connection:

```typescript
// Test connection
import { neo4jClient } from '@/lib/graphrag/neo4j-client';

await neo4jClient.initialize();
const stats = await neo4jClient.getStats();
console.log('Neo4j Stats:', stats);
```

### 5.4 Test Text2Cypher

```typescript
// Test natural language query
import { text2cypher } from '@/lib/graphrag/text2cypher';

const result = await text2cypher.query(
  "How many patients are currently prescribed Metformin?"
);

console.log('Answer:', result.answer);
console.log('Cypher:', result.cypherQuery);
```

### 5.5 Test Gap Detection

```typescript
// Test gap detection
import { gapDetector } from '@/lib/graphrag/gap-detector';

const gaps = await gapDetector.detectAllGaps();
console.log('Gaps Found:', gaps.totalGaps);
console.log('Details:', gaps.gaps);
```

---

## Phase 6: Production Validation

### 6.1 Data Quality Checks

Run validation queries in Neo4j Browser:

```cypher
// 1. Check for orphaned nodes
MATCH (n)
WHERE NOT (n)--()
RETURN labels(n)[0] as node_type, count(*) as orphaned_count;
// Expected: 0 orphaned nodes

// 2. Verify embeddings
MATCH (p:Patient)
RETURN count(*) as total_patients,
       count(p.policyTextEmbedding) as with_embeddings,
       sum(CASE WHEN size(p.policyTextEmbedding) = 1536 THEN 1 ELSE 0 END) as valid_embeddings;
// Expected: with_embeddings = valid_embeddings

// 3. Check relationship properties
MATCH (p:Patient)-[r:PRESCRIBED]->(m:Medication)
WHERE r.adherenceScore IS NULL OR r.priorAuthStatus IS NULL
RETURN count(*) as missing_properties;
// Expected: 0

// 4. Verify extraction timestamps
MATCH (n)
RETURN labels(n)[0] as node_type,
       max(n.extractedAt) as last_extraction,
       count(*) as count
ORDER BY last_extraction DESC;
// Expected: All timestamps within last 24 hours
```

### 6.2 Query Performance Tests

```cypher
// 1. Simple patient lookup (should be <50ms)
PROFILE
MATCH (p:Patient {id: 'PAT-001'})
RETURN p;

// 2. Medication adherence query (should be <200ms)
PROFILE
MATCH (p:Patient)-[r:PRESCRIBED]->(m:Medication)
WHERE r.adherenceScore < 80
RETURN p.id, m.genericName, r.adherenceScore
LIMIT 100;

// 3. Complex multi-hop traversal (should be <500ms)
PROFILE
MATCH (p:Patient)-[:HAS_DIAGNOSIS]->(d:Diagnosis),
      (p)-[:PRESCRIBED]->(m:Medication)-[:TREATS]->(d)
WHERE d.category = 'Endocrine'
RETURN p.id, d.name, collect(m.genericName) as medications
LIMIT 50;
```

### 6.3 Hybrid Search Test

```typescript
// Test vector search
import { neo4jClient } from '@/lib/graphrag/neo4j-client';

const query = `
  CALL db.index.vector.queryNodes(
    'patient_policy_vector',
    10,
    $embedding
  ) YIELD node, score
  RETURN node.id as patientId,
         node.policyText as policy,
         score
  LIMIT 5
`;

// Get embedding for search query
const searchText = "diabetes management coverage";
// ... generate embedding via Azure OpenAI ...

const results = await neo4jClient.query(query, { embedding: searchEmbedding });
console.log('Vector Search Results:', results);
```

---

## Phase 7: Monitoring & Operations

### 7.1 Set Up Monitoring

#### Azure Monitor

```bash
# Enable diagnostic logging for Synapse
az monitor diagnostic-settings create \
  --name SynapseLogging \
  --resource /subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Synapse/workspaces/arthur-health-synapse \
  --logs '[{"category": "SQLSecurityAuditEvents", "enabled": true}, {"category": "SQLInsights", "enabled": true}]' \
  --metrics '[{"category": "AllMetrics", "enabled": true}]' \
  --workspace /subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.OperationalInsights/workspaces/arthur-health-logs
```

#### Neo4j Monitoring

1. Log into Neo4j Aura Console
2. Navigate to **Monitoring**
3. Set up alerts for:
   - High memory usage (>80%)
   - Query latency spikes (>1s)
   - Connection failures
   - Storage capacity (>80%)

### 7.2 Create Alerting Rules

```bash
# Create action group
az monitor action-group create \
  --name ArthurHealthAlerts \
  --resource-group $RESOURCE_GROUP \
  --short-name AH-Alerts \
  --email-receiver name=data-eng email=data-eng@arthurhealth.com

# Create ETL failure alert
az monitor metrics alert create \
  --name ETL-Pipeline-Failure \
  --resource-group $RESOURCE_GROUP \
  --scopes /subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Synapse/workspaces/arthur-health-synapse \
  --condition "total ActivityFailedRuns > 0" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action ArthurHealthAlerts
```

### 7.3 Operational Runbooks

#### Daily Operations

**Morning Health Check** (9:00 AM):
```cypher
// 1. Verify ETL ran successfully
MATCH (n)
WHERE n.extractedAt >= datetime() - duration('P1D')
RETURN labels(n)[0] as node_type, count(*) as count;

// 2. Check for new gaps
MATCH (p:Patient)-[r:PRESCRIBED]->(m:Medication)
WHERE r.adherenceScore < 80
  AND date(r.lastRefillDate) < date() - duration('P7D')
RETURN count(*) as urgent_adherence_gaps;
```

**Weekly Review** (Monday 10:00 AM):
```bash
# Run comprehensive health check
npm run graphrag:health-check

# Generate weekly report
npm run graphrag:weekly-report
```

#### Incident Response

**ETL Failure**:
1. Check Synapse Pipeline run history
2. Review Spark application logs
3. Verify Neo4j connectivity
4. Check Azure OpenAI quota
5. Re-run failed notebook manually
6. If successful, update `LAST_SUCCESSFUL_RUN` timestamp

**Query Performance Degradation**:
1. Check Neo4j memory usage
2. Review slow query log
3. Run `CALL db.indexes()` to verify index health
4. Consider scaling Neo4j instance
5. Optimize problematic queries

---

## Success Criteria

### Phase 1-4: ETL Pipeline
- ✅ All ETL notebooks execute successfully
- ✅ 100% of patients have embeddings generated
- ✅ No orphaned nodes or relationships
- ✅ Extraction timestamps within expected window
- ✅ Data quality checks pass

### Phase 5: Query Layer
- ✅ Text2Cypher generates valid Cypher queries
- ✅ Query latency <500ms for 95th percentile
- ✅ Gap detection identifies known gaps
- ✅ Hybrid search returns relevant results

### Phase 6: Production
- ✅ Daily ETL runs successfully for 7 consecutive days
- ✅ No data quality issues reported
- ✅ Monitoring and alerting functional
- ✅ HIPAA compliance audit passed

---

## Cost Summary

| Component | Configuration | Monthly Cost |
|-----------|--------------|--------------|
| Neo4j AuraDB Professional | 3 nodes, 8GB each | $65 |
| Synapse Spark Pool | Medium, 3 hours/day | $27 |
| Azure OpenAI | text-embedding-3-small, 50M tokens | $5 |
| Synapse SQL Pool | On-demand | $10 |
| Storage | 100GB | $5 |
| Data Transfer | 100GB | $9 |
| **Total** | | **~$121/month** |

### Cost Optimization Tips

1. **Use Auto-Pause**: Enable auto-pause on Spark pools (15-minute idle timeout)
2. **Right-Size Embeddings**: Only embed text columns that need semantic search
3. **Batch Processing**: Generate embeddings in batches to maximize throughput
4. **Incremental ETL**: Use incremental mode to minimize data processing
5. **Query Caching**: Implement caching layer for frequent queries

---

## Next Steps

After successful deployment:

1. **Expand Entity Coverage**: Add remaining entity notebooks (diagnoses, providers, facilities, care programs)
2. **Implement CDC**: Set up real-time sync via Azure Event Hubs
3. **Add Advanced Analytics**: Implement Neo4j Graph Data Science algorithms
4. **Build Dashboards**: Create Power BI dashboards for gap visualization
5. **HIPAA Audit**: Complete HIPAA compliance audit and remediation

## Support

- **Technical Issues**: data-eng@arthurhealth.com
- **Neo4j Support**: https://support.neo4j.com
- **Azure Support**: https://azure.microsoft.com/support/
