# Databricks notebook source
# MAGIC %md
# MAGIC # Arthur Health - Patient-Medication Relationships ETL
# MAGIC
# MAGIC **Purpose**: Create PRESCRIBED relationships between Patient and Medication nodes
# MAGIC
# MAGIC **Source**: `healthcare_fhir.prescriptions` table in Synapse
# MAGIC
# MAGIC **Target**: Patient-[:PRESCRIBED]->Medication relationships in Neo4j
# MAGIC
# MAGIC **Features**:
# MAGIC - Creates relationships with rich properties (dosage, frequency, adherence)
# MAGIC - Identifies medication adherence issues for gap detection
# MAGIC - Tracks prior authorization status

# COMMAND ----------

# MAGIC %md
# MAGIC ## 1. Configuration

# COMMAND ----------

from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import *
import json
from datetime import datetime

# Neo4j connection configuration
NEO4J_URI = "neo4j+s://xxxxxxxx.databases.neo4j.io"
NEO4J_USERNAME = "neo4j"
NEO4J_PASSWORD = dbutils.secrets.get(scope="arthur-health", key="neo4j-password")
NEO4J_DATABASE = "neo4j"

# Synapse SQL configuration
SYNAPSE_SERVER = "arthur-health-synapse.sql.azuresynapse.net"
SYNAPSE_DATABASE = "healthcare_fhir"
SYNAPSE_USER = dbutils.secrets.get(scope="arthur-health", key="synapse-user")
SYNAPSE_PASSWORD = dbutils.secrets.get(scope="arthur-health", key="synapse-password")

# ETL configuration
INCREMENTAL_MODE = True
LAST_RUN_TIMESTAMP = "2025-01-01 00:00:00"

print("✅ Configuration loaded")

# COMMAND ----------

# MAGIC %md
# MAGIC ## 2. Extract Prescription Data from Synapse

# COMMAND ----------

jdbc_url = f"jdbc:sqlserver://{SYNAPSE_SERVER}:1433;database={SYNAPSE_DATABASE};encrypt=true;trustServerCertificate=false;hostNameInCertificate=*.sql.azuresynapse.net;loginTimeout=30;"

if INCREMENTAL_MODE:
    sql_query = f"""
    (
        SELECT
            prescription_id,
            patient_id,
            medication_id,
            prescribing_provider_id,
            prescribed_date,
            start_date,
            end_date,
            dosage,
            frequency,
            duration_days,
            refills_allowed,
            refills_remaining,
            last_refill_date,
            next_refill_due_date,
            pharmacy_id,
            adherence_score,
            missed_doses_30days,
            days_supply,
            quantity,
            prior_auth_status,
            prior_auth_expiry_date,
            denial_reason,
            cost_patient,
            cost_insurance,
            status,
            discontinuation_reason,
            prescribing_reason,
            last_modified,
            created_at
        FROM healthcare_fhir.prescriptions
        WHERE last_modified > '{LAST_RUN_TIMESTAMP}'
        OR created_at > '{LAST_RUN_TIMESTAMP}'
    ) AS prescriptions_incremental
    """
else:
    sql_query = """
    (
        SELECT
            prescription_id,
            patient_id,
            medication_id,
            prescribing_provider_id,
            prescribed_date,
            start_date,
            end_date,
            dosage,
            frequency,
            duration_days,
            refills_allowed,
            refills_remaining,
            last_refill_date,
            next_refill_due_date,
            pharmacy_id,
            adherence_score,
            missed_doses_30days,
            days_supply,
            quantity,
            prior_auth_status,
            prior_auth_expiry_date,
            denial_reason,
            cost_patient,
            cost_insurance,
            status,
            discontinuation_reason,
            prescribing_reason,
            last_modified,
            created_at
        FROM healthcare_fhir.prescriptions
    ) AS prescriptions_full
    """

prescriptions_df = spark.read \
    .format("jdbc") \
    .option("url", jdbc_url) \
    .option("dbtable", sql_query) \
    .option("user", SYNAPSE_USER) \
    .option("password", SYNAPSE_PASSWORD) \
    .option("driver", "com.microsoft.sqlserver.jdbc.SQLServerDriver") \
    .load()

print(f"✅ Extracted {prescriptions_df.count()} prescriptions from Synapse")
prescriptions_df.printSchema()
prescriptions_df.show(5, truncate=False)

# COMMAND ----------

# MAGIC %md
# MAGIC ## 3. Data Transformation - Prepare Relationships

# COMMAND ----------

# Transform to Neo4j relationship format
# Neo4j Spark Connector expects: source.id, target.id, rel.property1, rel.property2...

prescriptions_neo4j = prescriptions_df.select(
    # Source and target nodes
    col("patient_id").alias("source.id"),  # Patient node
    col("medication_id").alias("target.id"),  # Medication node

    # Relationship properties
    col("prescription_id").alias("rel.prescriptionId"),
    col("prescribing_provider_id").alias("rel.prescribingProviderId"),
    col("prescribed_date").alias("rel.prescribedDate"),
    col("start_date").alias("rel.startDate"),
    col("end_date").alias("rel.endDate"),
    col("dosage").alias("rel.dosage"),
    col("frequency").alias("rel.frequency"),
    col("duration_days").alias("rel.durationDays"),

    # Refill tracking
    col("refills_allowed").alias("rel.refillsAllowed"),
    col("refills_remaining").alias("rel.refillsRemaining"),
    col("last_refill_date").alias("rel.lastRefillDate"),
    col("next_refill_due_date").alias("rel.nextRefillDueDate"),
    col("pharmacy_id").alias("rel.pharmacyId"),

    # Adherence metrics (critical for gap detection!)
    col("adherence_score").alias("rel.adherenceScore"),
    col("missed_doses_30days").alias("rel.missedDoses30Days"),
    col("days_supply").alias("rel.daysSupply"),
    col("quantity").alias("rel.quantity"),

    # Prior authorization (critical for gap detection!)
    col("prior_auth_status").alias("rel.priorAuthStatus"),
    col("prior_auth_expiry_date").alias("rel.priorAuthExpiryDate"),
    col("denial_reason").alias("rel.denialReason"),

    # Cost information
    col("cost_patient").alias("rel.costPatient"),
    col("cost_insurance").alias("rel.costInsurance"),

    # Status
    col("status").alias("rel.status"),
    col("discontinuation_reason").alias("rel.discontinuationReason"),
    col("prescribing_reason").alias("rel.prescribingReason"),

    # Metadata
    lit(datetime.now().isoformat()).alias("rel.extractedAt"),
    lit("synapse_etl").alias("rel.extractionSource"),
    col("last_modified").alias("rel.lastModified")
)

print(f"✅ Transformed {prescriptions_neo4j.count()} prescription relationships")
prescriptions_neo4j.printSchema()

# COMMAND ----------

# MAGIC %md
# MAGIC ## 4. Load into Neo4j - Create PRESCRIBED Relationships

# COMMAND ----------

neo4j_options = {
    "url": NEO4J_URI,
    "authentication.type": "basic",
    "authentication.basic.username": NEO4J_USERNAME,
    "authentication.basic.password": NEO4J_PASSWORD,
    "database": NEO4J_DATABASE
}

# Write relationships to Neo4j
# NOTE: This requires both Patient and Medication nodes to already exist in Neo4j
prescriptions_neo4j.write \
    .format("org.neo4j.spark.DataSource") \
    .mode("Overwrite") \
    .options(**neo4j_options) \
    .option("relationship", "PRESCRIBED") \
    .option("relationship.save.strategy", "keys") \
    .option("relationship.source.labels", ":Patient") \
    .option("relationship.source.save.mode", "Match") \
    .option("relationship.source.node.keys", "source.id:id") \
    .option("relationship.target.labels", ":Medication") \
    .option("relationship.target.save.mode", "Match") \
    .option("relationship.target.node.keys", "target.id:id") \
    .save()

print(f"✅ Created {prescriptions_neo4j.count()} PRESCRIBED relationships in Neo4j")

# COMMAND ----------

# MAGIC %md
# MAGIC ## 5. Verification - Check Relationships in Neo4j

# COMMAND ----------

verification_query = """
MATCH (p:Patient)-[r:PRESCRIBED]->(m:Medication)
RETURN count(r) as total_prescriptions,
       count(DISTINCT p.id) as patients_with_prescriptions,
       count(DISTINCT m.id) as unique_medications_prescribed,
       avg(r.adherenceScore) as avg_adherence_score,
       sum(CASE WHEN r.adherenceScore < 80 THEN 1 ELSE 0 END) as low_adherence_count,
       sum(CASE WHEN r.priorAuthStatus = 'expired' THEN 1 ELSE 0 END) as expired_pa_count,
       sum(CASE WHEN r.priorAuthStatus = 'denied' THEN 1 ELSE 0 END) as denied_pa_count
"""

verification_df = spark.read \
    .format("org.neo4j.spark.DataSource") \
    .options(**neo4j_options) \
    .option("query", verification_query) \
    .load()

print("📊 Neo4j PRESCRIBED Relationships Verification:")
verification_df.show(truncate=False)

# COMMAND ----------

# MAGIC %md
# MAGIC ## 6. Gap Detection Analysis - Identify Medication Issues

# COMMAND ----------

# Identify gap patterns that will be useful for healthcare delivery optimization

gaps_query = """
// 1. Medication Non-Adherence Gaps
MATCH (p:Patient)-[r:PRESCRIBED]->(m:Medication)
WHERE r.adherenceScore < 80
RETURN 'medication_non_adherence' as gap_type,
       count(*) as gap_count,
       avg(r.adherenceScore) as avg_adherence_score

UNION ALL

// 2. Expired Prior Authorization Gaps
MATCH (p:Patient)-[r:PRESCRIBED]->(m:Medication)
WHERE r.priorAuthStatus = 'expired'
  AND date(r.priorAuthExpiryDate) < date()
RETURN 'expired_prior_auth' as gap_type,
       count(*) as gap_count,
       avg(duration.between(date(r.priorAuthExpiryDate), date()).days) as avg_days_expired

UNION ALL

// 3. Missing Refills (Past Due)
MATCH (p:Patient)-[r:PRESCRIBED]->(m:Medication)
WHERE r.status = 'active'
  AND date(r.nextRefillDueDate) < date()
  AND r.refillsRemaining > 0
RETURN 'overdue_refills' as gap_type,
       count(*) as gap_count,
       avg(duration.between(date(r.nextRefillDueDate), date()).days) as avg_days_overdue

UNION ALL

// 4. High-Cost Medications Without Prior Auth
MATCH (p:Patient)-[r:PRESCRIBED]->(m:Medication)
WHERE m.requiresPriorAuth = true
  AND (r.priorAuthStatus IS NULL OR r.priorAuthStatus = 'pending')
  AND r.costPatient > 200
RETURN 'high_cost_no_pa' as gap_type,
       count(*) as gap_count,
       avg(r.costPatient) as avg_patient_cost
"""

gaps_df = spark.read \
    .format("org.neo4j.spark.DataSource") \
    .options(**neo4j_options) \
    .option("query", gaps_query) \
    .load()

print("🔍 Healthcare Delivery Gaps Detected:")
gaps_df.show(truncate=False)

# COMMAND ----------

# MAGIC %md
# MAGIC ## 7. Data Quality Checks

# COMMAND ----------

quality_checks = prescriptions_neo4j.select(
    count("*").alias("total_prescriptions"),
    sum(when(col("rel.adherenceScore") < 80, 1).otherwise(0)).alias("low_adherence_prescriptions"),
    sum(when(col("rel.priorAuthStatus") == "expired", 1).otherwise(0)).alias("expired_pa_prescriptions"),
    sum(when(col("rel.priorAuthStatus") == "denied", 1).otherwise(0)).alias("denied_pa_prescriptions"),
    sum(when(col("rel.status") == "active", 1).otherwise(0)).alias("active_prescriptions"),
    sum(when(col("rel.status") == "discontinued", 1).otherwise(0)).alias("discontinued_prescriptions"),
    avg("rel.adherenceScore").alias("avg_adherence_score"),
    avg("rel.costPatient").alias("avg_patient_cost"),
    avg("rel.costInsurance").alias("avg_insurance_cost")
)

print("📊 Prescription Data Quality Report:")
quality_checks.show(truncate=False)

# COMMAND ----------

# MAGIC %md
# MAGIC ## 8. ETL Metadata Logging

# COMMAND ----------

etl_metadata = {
    "pipeline_name": "patient_medication_relationships_etl",
    "run_timestamp": datetime.now().isoformat(),
    "incremental_mode": INCREMENTAL_MODE,
    "last_run_timestamp": LAST_RUN_TIMESTAMP,
    "records_extracted": prescriptions_df.count(),
    "relationships_created": prescriptions_neo4j.count(),
    "source_system": "synapse_fhir",
    "target_system": "neo4j_auradb",
    "relationship_type": "PRESCRIBED",
    "status": "success"
}

print("📝 ETL Metadata:")
print(json.dumps(etl_metadata, indent=2))

# COMMAND ----------

print("✅ Patient-Medication Relationships ETL completed successfully!")
print(f"   - Extracted: {etl_metadata['records_extracted']} prescriptions")
print(f"   - Created: {etl_metadata['relationships_created']} PRESCRIBED relationships")
print(f"   - Relationship Type: {etl_metadata['relationship_type']}")
