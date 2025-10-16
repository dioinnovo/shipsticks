# Azure Synapse to Neo4j Integration Guide

## Overview

This guide provides complete Azure Data Factory (ADF) pipeline templates and Event Hub configurations for integrating Microsoft Synapse with Neo4j for Arthur Health's GraphRAG system.

---

## Architecture Options

### Option 1: Scheduled ETL (Initial Data Load + Daily Sync)
- **Best for**: Historical data migration, batch processing
- **Latency**: Hours (configurable schedule)
- **Complexity**: Low
- **Cost**: $ (Data Factory only)

### Option 2: Real-time CDC (Recommended for Production)
- **Best for**: Real-time gap detection, immediate updates
- **Latency**: Seconds (< 5s typical)
- **Complexity**: Medium
- **Cost**: $$ (Data Factory + Event Hubs + Consumer App)

---

## Option 1: Azure Data Factory ETL Pipeline

### ADF Pipeline JSON

```json
{
  "name": "Synapse-to-Neo4j-Healthcare-ETL",
  "properties": {
    "description": "Extract patient data from Synapse and load into Neo4j",
    "activities": [
      {
        "name": "Extract-Patients",
        "type": "Copy",
        "dependsOn": [],
        "policy": {
          "timeout": "7.00:00:00",
          "retry": 3,
          "retryIntervalInSeconds": 30
        },
        "typeProperties": {
          "source": {
            "type": "SqlDWSource",
            "sqlReaderQuery": "SELECT patient_id, mrn, first_name, last_name, date_of_birth, gender, insurance_id, risk_score, last_visit, created_at, updated_at FROM healthcare.patients WHERE updated_at >= DATEADD(day, -1, GETDATE())"
          },
          "sink": {
            "type": "JsonSink",
            "storeSettings": {
              "type": "AzureBlobStorageWriteSettings"
            },
            "formatSettings": {
              "type": "JsonWriteSettings"
            }
          }
        },
        "inputs": [
          {
            "referenceName": "SynapseHealthcareSource",
            "type": "DatasetReference"
          }
        ],
        "outputs": [
          {
            "referenceName": "BlobPatientsSink",
            "type": "DatasetReference"
          }
        ]
      },
      {
        "name": "Transform-and-Load-Neo4j",
        "type": "AzureFunction",
        "dependsOn": [
          {
            "activity": "Extract-Patients",
            "dependencyConditions": ["Succeeded"]
          }
        ],
        "typeProperties": {
          "functionName": "TransformAndLoadNeo4j",
          "method": "POST",
          "body": {
            "blobPath": "@activity('Extract-Patients').output.files",
            "entityType": "Patient"
          }
        },
        "linkedServiceName": {
          "referenceName": "ArthurHealthFunctions",
          "type": "LinkedServiceReference"
        }
      },
      {
        "name": "Extract-Diagnoses",
        "type": "Copy",
        "dependsOn": [
          {
            "activity": "Transform-and-Load-Neo4j",
            "dependencyConditions": ["Succeeded"]
          }
        ],
        "typeProperties": {
          "source": {
            "type": "SqlDWSource",
            "sqlReaderQuery": "SELECT pd.patient_id, d.diagnosis_id, d.icd10_code, d.diagnosis_name, d.category, d.severity, pd.diagnosed_date, pd.diagnosed_by, pd.active FROM healthcare.patient_diagnoses pd JOIN healthcare.diagnoses d ON pd.diagnosis_id = d.diagnosis_id WHERE pd.updated_at >= DATEADD(day, -1, GETDATE())"
          },
          "sink": {
            "type": "JsonSink",
            "storeSettings": {
              "type": "AzureBlobStorageWriteSettings"
            }
          }
        },
        "inputs": [
          {
            "referenceName": "SynapseHealthcareSource",
            "type": "DatasetReference"
          }
        ],
        "outputs": [
          {
            "referenceName": "BlobDiagnosesSink",
            "type": "DatasetReference"
          }
        ]
      },
      {
        "name": "Load-Diagnoses-Neo4j",
        "type": "AzureFunction",
        "dependsOn": [
          {
            "activity": "Extract-Diagnoses",
            "dependencyConditions": ["Succeeded"]
          }
        ],
        "typeProperties": {
          "functionName": "TransformAndLoadNeo4j",
          "method": "POST",
          "body": {
            "blobPath": "@activity('Extract-Diagnoses').output.files",
            "entityType": "Diagnosis"
          }
        }
      }
    ],
    "triggers": [
      {
        "name": "DailyETLTrigger",
        "properties": {
          "type": "ScheduleTrigger",
          "typeProperties": {
            "recurrence": {
              "frequency": "Day",
              "interval": 1,
              "startTime": "2025-01-01T02:00:00Z",
              "timeZone": "UTC"
            }
          }
        }
      }
    ]
  }
}
```

### Azure Function: Transform and Load

```typescript
// functions/transform-and-load-neo4j/index.ts
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { BlobServiceClient } from "@azure/storage-blob";
import { ArthurNeo4jClient } from "./neo4j-client";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const { blobPath, entityType } = req.body;

  try {
    // Download data from blob
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING!
    );
    const containerClient = blobServiceClient.getContainerClient("healthcare-etl");
    const blobClient = containerClient.getBlobClient(blobPath);
    const downloadResponse = await blobClient.download();
    const data = JSON.parse(await streamToString(downloadResponse.readableStreamBody!));

    // Initialize Neo4j
    const neo4j = ArthurNeo4jClient.getInstance();
    await neo4j.initialize();

    // Transform and load based on entity type
    switch (entityType) {
      case "Patient":
        await loadPatients(neo4j, data);
        break;
      case "Diagnosis":
        await loadDiagnoses(neo4j, data);
        break;
      case "Medication":
        await loadMedications(neo4j, data);
        break;
      default:
        throw new Error(`Unknown entity type: ${entityType}`);
    }

    context.res = {
      status: 200,
      body: {
        success: true,
        recordsProcessed: data.length,
        entityType,
      },
    };
  } catch (error: any) {
    context.log.error("ETL failed:", error);
    context.res = {
      status: 500,
      body: {
        success: false,
        error: error.message,
      },
    };
  }
};

async function loadPatients(neo4j: ArthurNeo4jClient, patients: any[]) {
  const query = `
    UNWIND $batch AS row
    MERGE (p:Patient {id: row.patient_id})
    SET
      p.mrn = row.mrn,
      p.firstName = row.first_name,
      p.lastName = row.last_name,
      p.dateOfBirth = date(row.date_of_birth),
      p.gender = row.gender,
      p.insuranceId = row.insurance_id,
      p.riskScore = toFloat(row.risk_score),
      p.lastVisit = datetime(row.last_visit),
      p.updatedAt = datetime()
    RETURN count(p) as processed
  `;

  // Process in batches of 1000
  const batchSize = 1000;
  for (let i = 0; i < patients.length; i += batchSize) {
    const batch = patients.slice(i, i + batchSize);
    await neo4j.query(query, { batch });
  }
}

async function loadDiagnoses(neo4j: ArthurNeo4jClient, diagnoses: any[]) {
  const query = `
    UNWIND $batch AS row
    MERGE (d:Diagnosis {icd10Code: row.icd10_code})
    SET
      d.id = row.diagnosis_id,
      d.name = row.diagnosis_name,
      d.category = row.category,
      d.severity = row.severity,
      d.chronicCondition = CASE WHEN row.chronic = 1 THEN true ELSE false END
    WITH d, row
    MATCH (p:Patient {id: row.patient_id})
    MERGE (p)-[r:HAS_DIAGNOSIS]->(d)
    SET
      r.diagnosedDate = date(row.diagnosed_date),
      r.diagnosedBy = row.diagnosed_by,
      r.active = CASE WHEN row.active = 1 THEN true ELSE false END,
      r.lastReviewed = datetime()
    RETURN count(r) as processed
  `;

  const batchSize = 1000;
  for (let i = 0; i < diagnoses.length; i += batchSize) {
    const batch = diagnoses.slice(i, i + batchSize);
    await neo4j.query(query, { batch });
  }
}

async function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf-8");
}

export default httpTrigger;
```

---

## Option 2: Real-time CDC with Event Hubs

### Enable CDC on Synapse

```sql
-- Enable CDC on Synapse database
USE healthcare_db;
GO

-- Enable CDC for the database
EXEC sys.sp_cdc_enable_db;
GO

-- Enable CDC on patients table
EXEC sys.sp_cdc_enable_table
  @source_schema = N'healthcare',
  @source_name = N'patients',
  @role_name = NULL,
  @supports_net_changes = 1;
GO

-- Enable CDC on diagnoses table
EXEC sys.sp_cdc_enable_table
  @source_schema = N'healthcare',
  @source_name = N'patient_diagnoses',
  @role_name = NULL,
  @supports_net_changes = 1;
GO

-- Enable CDC on medications table
EXEC sys.sp_cdc_enable_table
  @source_schema = N'healthcare',
  @source_name = N'patient_medications',
  @role_name = NULL,
  @supports_net_changes = 1;
GO
```

### Azure Data Factory CDC Pipeline

```json
{
  "name": "Synapse-CDC-to-EventHub",
  "properties": {
    "activities": [
      {
        "name": "Capture-CDC-Changes",
        "type": "Copy",
        "typeProperties": {
          "source": {
            "type": "SqlDWSource",
            "sqlReaderQuery": "SELECT * FROM cdc.fn_cdc_get_net_changes_healthcare_patients(@from_lsn, @to_lsn, 'all')",
            "queryTimeout": "02:00:00"
          },
          "sink": {
            "type": "EventHubSink"
          }
        },
        "inputs": [
          {
            "referenceName": "SynapseCDCSource",
            "type": "DatasetReference"
          }
        ],
        "outputs": [
          {
            "referenceName": "EventHubHealthcareCDC",
            "type": "DatasetReference"
          }
        ]
      }
    ],
    "triggers": [
      {
        "name": "CDC-Continuous-Trigger",
        "type": "TumblingWindowTrigger",
        "typeProperties": {
          "frequency": "Minute",
          "interval": 5,
          "startTime": "2025-01-01T00:00:00Z",
          "maxConcurrency": 1
        }
      }
    ]
  }
}
```

### Event Hub Consumer (Node.js/TypeScript)

```typescript
// services/eventhub-consumer.ts
import { EventHubConsumerClient, ReceivedEventData } from "@azure/event-hubs";
import { neo4jClient } from "@/lib/graphrag/neo4j-client";

interface SynapseChange {
  __$operation: number; // 1=Delete, 2=Insert, 3=BeforeUpdate, 4=AfterUpdate
  __$update_mask: string;
  patient_id?: string;
  mrn?: string;
  first_name?: string;
  last_name?: string;
  // ... other fields
}

export class EventHubCDCConsumer {
  private client: EventHubConsumerClient;

  constructor() {
    this.client = new EventHubConsumerClient(
      "$Default",
      process.env.EVENTHUB_CONNECTION_STRING!,
      "synapse-healthcare-cdc"
    );
  }

  async start() {
    console.log("🚀 Starting Event Hub CDC consumer...");

    const subscription = this.client.subscribe({
      processEvents: async (events: ReceivedEventData[], context) => {
        console.log(`📨 Received ${events.length} CDC events`);

        for (const event of events) {
          await this.processCDCEvent(event.body as SynapseChange);
        }

        // Update checkpoint after processing batch
        await context.updateCheckpoint(events[events.length - 1]);
      },

      processError: async (err, context) => {
        console.error(`❌ Error from partition ${context.partitionId}:`, err);
        // Implement retry logic or dead-letter queue here
      },
    });

    console.log("✅ Event Hub consumer started successfully");
  }

  private async processCDCEvent(change: SynapseChange) {
    try {
      const operation = change.__$operation;

      switch (operation) {
        case 2: // Insert
          await this.handleInsert(change);
          break;
        case 4: // Update
          await this.handleUpdate(change);
          break;
        case 1: // Delete
          await this.handleDelete(change);
          break;
        default:
          console.warn(`Unknown CDC operation: ${operation}`);
      }
    } catch (error) {
      console.error("❌ Failed to process CDC event:", error);
      // Implement error handling (retry, DLQ, etc.)
    }
  }

  private async handleInsert(change: SynapseChange) {
    if (change.patient_id) {
      const query = `
        MERGE (p:Patient {id: $patientId})
        SET
          p.mrn = $mrn,
          p.firstName = $firstName,
          p.lastName = $lastName,
          p.dateOfBirth = date($dateOfBirth),
          p.gender = $gender,
          p.insuranceId = $insuranceId,
          p.createdAt = datetime(),
          p.updatedAt = datetime()
        RETURN p
      `;

      await neo4jClient.query(query, {
        patientId: change.patient_id,
        mrn: change.mrn,
        firstName: change.first_name,
        lastName: change.last_name,
        dateOfBirth: change.date_of_birth,
        gender: change.gender,
        insuranceId: change.insurance_id,
      });

      console.log(`✅ Inserted patient: ${change.patient_id}`);
    }
  }

  private async handleUpdate(change: SynapseChange) {
    if (change.patient_id) {
      const query = `
        MATCH (p:Patient {id: $patientId})
        SET
          p.mrn = $mrn,
          p.firstName = $firstName,
          p.lastName = $lastName,
          p.updatedAt = datetime()
        RETURN p
      `;

      await neo4jClient.query(query, {
        patientId: change.patient_id,
        mrn: change.mrn,
        firstName: change.first_name,
        lastName: change.last_name,
      });

      console.log(`✅ Updated patient: ${change.patient_id}`);
    }
  }

  private async handleDelete(change: SynapseChange) {
    if (change.patient_id) {
      const query = `
        MATCH (p:Patient {id: $patientId})
        DETACH DELETE p
      `;

      await neo4jClient.query(query, {
        patientId: change.patient_id,
      });

      console.log(`✅ Deleted patient: ${change.patient_id}`);
    }
  }

  async stop() {
    await this.client.close();
    console.log("👋 Event Hub consumer stopped");
  }
}

// Export singleton
export const cdcConsumer = new EventHubCDCConsumer();
```

---

## Deployment Instructions

### Prerequisites

1. **Azure Resources**:
   - Azure Synapse Analytics workspace
   - Azure Data Factory
   - Azure Event Hubs namespace (for CDC)
   - Azure Storage Account (for ETL staging)
   - Neo4j instance (Azure VM or managed)
   - Azure Functions (for transformation)

2. **Permissions**:
   - Synapse: `db_owner` role
   - Data Factory: Contributor access
   - Event Hubs: Send/Listen permissions
   - Neo4j: Admin access

### Step-by-Step Deployment

```bash
# 1. Deploy Neo4j on Azure
az vm create \
  --resource-group arthur-health-rg \
  --name neo4j-vm \
  --image neo4j:neo4j-enterprise:neo4j-enterprise:latest \
  --size Standard_E4s_v3 \
  --admin-username azureuser \
  --generate-ssh-keys

# 2. Create Event Hubs namespace
az eventhubs namespace create \
  --name arthur-health-eh \
  --resource-group arthur-health-rg \
  --location eastus \
  --sku Standard

# 3. Create Event Hub
az eventhubs eventhub create \
  --name synapse-healthcare-cdc \
  --namespace-name arthur-health-eh \
  --resource-group arthur-health-rg \
  --partition-count 4

# 4. Deploy Azure Function
cd functions/transform-and-load-neo4j
func azure functionapp publish arthur-health-functions

# 5. Import ADF pipeline
az datafactory pipeline create \
  --resource-group arthur-health-rg \
  --factory-name arthur-health-adf \
  --name Synapse-to-Neo4j-Healthcare-ETL \
  --pipeline @pipeline.json

# 6. Enable CDC on Synapse
sqlcmd -S arthur-health-synapse.sql.azuresynapse.net \
  -d healthcare_db \
  -U sqladmin \
  -P $SYNAPSE_PASSWORD \
  -i enable-cdc.sql
```

### Environment Variables

```bash
# .env
NEO4J_URI=bolt://neo4j-vm.eastus.cloudapp.azure.com:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=<secure-password>

EVENTHUB_CONNECTION_STRING=<connection-string>
EVENTHUB_NAME=synapse-healthcare-cdc

SYNAPSE_ENDPOINT=arthur-health-synapse.sql.azuresynapse.net
SYNAPSE_DATABASE=healthcare_db
SYNAPSE_USERNAME=sqladmin
SYNAPSE_PASSWORD=<secure-password>

AZURE_STORAGE_CONNECTION_STRING=<storage-connection-string>
```

---

## Monitoring and Maintenance

### Azure Monitor Alerts

```json
{
  "alerts": [
    {
      "name": "CDC Lag Alert",
      "condition": "EventHubLag > 300 seconds",
      "severity": "Warning",
      "action": "Send email to ops team"
    },
    {
      "name": "ETL Failure Alert",
      "condition": "ADF Pipeline Failed",
      "severity": "Critical",
      "action": "Page on-call engineer"
    },
    {
      "name": "Neo4j Connection Alert",
      "condition": "Neo4j Health Check Failed",
      "severity": "Critical",
      "action": "Page on-call engineer"
    }
  ]
}
```

### Performance Optimization

1. **Batch Size Tuning**:
   - Start with 1000 records per batch
   - Monitor memory usage and adjust

2. **Parallel Processing**:
   - Use multiple Event Hub partitions
   - Scale consumer instances horizontally

3. **Indexing**:
   - Ensure all Neo4j constraints are created
   - Add indexes on frequently queried properties

4. **CDC Cleanup**:
   ```sql
   -- Cleanup old CDC data (run weekly)
   EXEC sys.sp_cdc_cleanup_change_table
     @capture_instance = 'healthcare_patients',
     @low_water_mark = <lsn_value>,
     @threshold = 5000;
   ```

---

## Cost Estimation

### Monthly Costs (Production)

| Service | Configuration | Cost |
|---------|--------------|------|
| Neo4j VM | Standard_E4s_v3 (4 vCPU, 32GB) | ~$400 |
| Event Hubs | Standard tier, 4 partitions | ~$150 |
| Data Factory | 100 activities/day | ~$50 |
| Azure Functions | Consumption plan | ~$20 |
| Storage | 100GB blob storage | ~$3 |
| **Total** | | **~$623/month** |

Add Azure OpenAI costs for Text2Cypher (~$500-1000/month).

---

## Troubleshooting

### Common Issues

**Issue**: CDC not capturing changes
- **Solution**: Verify CDC is enabled on tables, check CDC agent is running

**Issue**: Event Hub consumer lag increasing
- **Solution**: Scale out consumer instances, increase partition count

**Issue**: Neo4j connection timeouts
- **Solution**: Check VM network security group, verify bolt port 7687 is open

**Issue**: Duplicate nodes in Neo4j
- **Solution**: Ensure MERGE is used instead of CREATE, check constraints

---

## Next Steps

1. ✅ Review and customize ADF pipelines for your Synapse schema
2. ✅ Deploy Azure infrastructure using provided scripts
3. ✅ Test with small dataset first (< 1000 records)
4. ✅ Monitor performance and optimize batch sizes
5. ✅ Implement error handling and retry logic
6. ✅ Set up comprehensive monitoring and alerts

---

**Document Version**: 1.0
**Last Updated**: January 2025
**Review Date**: Quarterly
