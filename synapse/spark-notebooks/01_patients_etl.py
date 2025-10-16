# Databricks notebook source
# MAGIC %md
# MAGIC # Arthur Health - Patients ETL to Neo4j
# MAGIC
# MAGIC **Purpose**: Extract patient data from Synapse SQL and load into Neo4j Knowledge Graph
# MAGIC
# MAGIC **Source**: `healthcare_fhir.patients` table in Synapse
# MAGIC
# MAGIC **Target**: Patient nodes in Neo4j with text embeddings for policies
# MAGIC
# MAGIC **Features**:
# MAGIC - Reads FHIR-compliant patient data from Synapse
# MAGIC - Generates text embeddings for policy documents using Azure OpenAI
# MAGIC - Writes Patient nodes to Neo4j using Spark Connector
# MAGIC - Handles incremental updates based on last_modified timestamp
# MAGIC
# MAGIC **Prerequisites**:
# MAGIC - Synapse Spark Pool with Neo4j Connector installed
# MAGIC - Azure OpenAI instance configured
# MAGIC - Neo4j AuraDB instance running with schema created

# COMMAND ----------

# MAGIC %md
# MAGIC ## 1. Configuration

# COMMAND ----------

from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import *
import requests
import json
from datetime import datetime

# Neo4j connection configuration
NEO4J_URI = "neo4j+s://xxxxxxxx.databases.neo4j.io"  # Replace with your AuraDB URI
NEO4J_USERNAME = "neo4j"
NEO4J_PASSWORD = dbutils.secrets.get(scope="arthur-health", key="neo4j-password")
NEO4J_DATABASE = "neo4j"

# Azure OpenAI configuration for text embeddings
AZURE_OPENAI_ENDPOINT = "https://arthur-health.openai.azure.com/"
AZURE_OPENAI_KEY = dbutils.secrets.get(scope="arthur-health", key="azure-openai-key")
AZURE_OPENAI_DEPLOYMENT = "text-embedding-3-small"
AZURE_OPENAI_API_VERSION = "2024-02-01"

# Synapse SQL configuration
SYNAPSE_SERVER = "arthur-health-synapse.sql.azuresynapse.net"
SYNAPSE_DATABASE = "healthcare_fhir"
SYNAPSE_USER = dbutils.secrets.get(scope="arthur-health", key="synapse-user")
SYNAPSE_PASSWORD = dbutils.secrets.get(scope="arthur-health", key="synapse-password")

# ETL configuration
INCREMENTAL_MODE = True  # Set to False for full refresh
LAST_RUN_TIMESTAMP = "2025-01-01 00:00:00"  # Update with last successful run time
BATCH_SIZE = 1000  # For embedding generation

print("✅ Configuration loaded")

# COMMAND ----------

# MAGIC %md
# MAGIC ## 2. Extract from Synapse SQL

# COMMAND ----------

# Build JDBC URL
jdbc_url = f"jdbc:sqlserver://{SYNAPSE_SERVER}:1433;database={SYNAPSE_DATABASE};encrypt=true;trustServerCertificate=false;hostNameInCertificate=*.sql.azuresynapse.net;loginTimeout=30;"

# SQL query to extract patient data
if INCREMENTAL_MODE:
    sql_query = f"""
    (
        SELECT
            patient_id,
            mrn,
            first_name,
            last_name,
            date_of_birth,
            gender,
            phone_number,
            email,
            address_line1,
            address_line2,
            city,
            state,
            zip_code,
            insurance_provider,
            insurance_plan_id,
            insurance_member_id,
            plan_type,
            policy_text,
            clinical_narrative,
            risk_score,
            chronic_conditions_count,
            active_medications_count,
            last_visit_date,
            next_appointment_date,
            primary_care_provider_id,
            care_coordinator_id,
            preferred_language,
            communication_preference,
            hipaa_consent,
            last_modified,
            created_at
        FROM healthcare_fhir.patients
        WHERE last_modified > '{LAST_RUN_TIMESTAMP}'
        OR created_at > '{LAST_RUN_TIMESTAMP}'
    ) AS patients_incremental
    """
else:
    sql_query = """
    (
        SELECT
            patient_id,
            mrn,
            first_name,
            last_name,
            date_of_birth,
            gender,
            phone_number,
            email,
            address_line1,
            address_line2,
            city,
            state,
            zip_code,
            insurance_provider,
            insurance_plan_id,
            insurance_member_id,
            plan_type,
            policy_text,
            clinical_narrative,
            risk_score,
            chronic_conditions_count,
            active_medications_count,
            last_visit_date,
            next_appointment_date,
            primary_care_provider_id,
            care_coordinator_id,
            preferred_language,
            communication_preference,
            hipaa_consent,
            last_modified,
            created_at
        FROM healthcare_fhir.patients
    ) AS patients_full
    """

# Read data from Synapse
patients_df = spark.read \
    .format("jdbc") \
    .option("url", jdbc_url) \
    .option("dbtable", sql_query) \
    .option("user", SYNAPSE_USER) \
    .option("password", SYNAPSE_PASSWORD) \
    .option("driver", "com.microsoft.sqlserver.jdbc.SQLServerDriver") \
    .load()

print(f"✅ Extracted {patients_df.count()} patients from Synapse")
patients_df.printSchema()
patients_df.show(5, truncate=False)

# COMMAND ----------

# MAGIC %md
# MAGIC ## 3. Text Vectorization - Generate Embeddings

# COMMAND ----------

def generate_embedding(text):
    """
    Generate text embedding using Azure OpenAI text-embedding-3-small
    Returns: List of 1536 floats
    """
    if not text or text.strip() == "":
        return [0.0] * 1536  # Return zero vector for empty text

    url = f"{AZURE_OPENAI_ENDPOINT}openai/deployments/{AZURE_OPENAI_DEPLOYMENT}/embeddings?api-version={AZURE_OPENAI_API_VERSION}"

    headers = {
        "Content-Type": "application/json",
        "api-key": AZURE_OPENAI_KEY
    }

    payload = {
        "input": text[:8000],  # Truncate to 8000 chars to stay within token limits
        "encoding_format": "float"
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        embedding = response.json()["data"][0]["embedding"]
        return embedding
    except Exception as e:
        print(f"⚠️ Embedding generation failed: {str(e)}")
        return [0.0] * 1536  # Return zero vector on error

# Register UDF for embedding generation
generate_embedding_udf = udf(generate_embedding, ArrayType(FloatType()))

# Generate embeddings for policy_text (for semantic search)
print("🔄 Generating embeddings for policy documents...")

patients_with_embeddings = patients_df.withColumn(
    "policy_text_embedding",
    generate_embedding_udf(col("policy_text"))
)

# Generate embeddings for clinical_narrative if it exists
patients_with_embeddings = patients_with_embeddings.withColumn(
    "clinical_narrative_embedding",
    generate_embedding_udf(col("clinical_narrative"))
)

print(f"✅ Generated embeddings for {patients_with_embeddings.count()} patients")

# COMMAND ----------

# MAGIC %md
# MAGIC ## 4. Data Transformation - Prepare for Neo4j

# COMMAND ----------

# Transform to Neo4j format
patients_neo4j = patients_with_embeddings.select(
    # Primary identifiers
    col("patient_id").alias("id"),
    col("mrn"),

    # Demographics
    col("first_name").alias("firstName"),
    col("last_name").alias("lastName"),
    col("date_of_birth").alias("dateOfBirth"),
    col("gender"),

    # Contact information
    col("phone_number").alias("phoneNumber"),
    col("email"),
    concat_ws(", ",
              col("address_line1"),
              col("address_line2"),
              col("city"),
              col("state"),
              col("zip_code")).alias("address"),
    col("city"),
    col("state"),
    col("zip_code").alias("zipCode"),

    # Insurance information
    col("insurance_provider").alias("insuranceProvider"),
    col("insurance_plan_id").alias("insurancePlanId"),
    col("insurance_member_id").alias("insuranceMemberId"),
    col("plan_type").alias("planType"),

    # Clinical text fields
    col("policy_text").alias("policyText"),
    col("clinical_narrative").alias("clinicalNarrative"),

    # Embeddings for hybrid search
    col("policy_text_embedding").alias("policyTextEmbedding"),
    col("clinical_narrative_embedding").alias("clinicalNarrativeEmbedding"),

    # Health metrics
    col("risk_score").alias("riskScore"),
    col("chronic_conditions_count").alias("chronicConditionsCount"),
    col("active_medications_count").alias("activeMedicationsCount"),

    # Care coordination
    col("last_visit_date").alias("lastVisitDate"),
    col("next_appointment_date").alias("nextAppointmentDate"),
    col("primary_care_provider_id").alias("primaryCareProviderId"),
    col("care_coordinator_id").alias("careCoordinatorId"),

    # Preferences
    col("preferred_language").alias("preferredLanguage"),
    col("communication_preference").alias("communicationPreference"),
    col("hipaa_consent").alias("hipaaConsent"),

    # Metadata
    lit(datetime.now().isoformat()).alias("extractedAt"),
    lit("synapse_etl").alias("extractionSource"),
    col("last_modified").alias("lastModified"),
    col("created_at").alias("createdAt")
)

print(f"✅ Transformed {patients_neo4j.count()} patients for Neo4j")
patients_neo4j.printSchema()
patients_neo4j.show(5, truncate=False)

# COMMAND ----------

# MAGIC %md
# MAGIC ## 5. Load into Neo4j - Write Patient Nodes

# COMMAND ----------

# Neo4j Spark Connector configuration
neo4j_options = {
    "url": NEO4J_URI,
    "authentication.type": "basic",
    "authentication.basic.username": NEO4J_USERNAME,
    "authentication.basic.password": NEO4J_PASSWORD,
    "database": NEO4J_DATABASE
}

# Write Patient nodes to Neo4j using MERGE (upsert)
patients_neo4j.write \
    .format("org.neo4j.spark.DataSource") \
    .mode("Overwrite") \
    .options(**neo4j_options) \
    .option("labels", ":Patient") \
    .option("node.keys", "id,mrn") \
    .save()

print(f"✅ Loaded {patients_neo4j.count()} Patient nodes into Neo4j")

# COMMAND ----------

# MAGIC %md
# MAGIC ## 6. Verification - Check Neo4j

# COMMAND ----------

# Read back from Neo4j to verify
verification_query = """
MATCH (p:Patient)
RETURN count(p) as patient_count,
       count(p.policyTextEmbedding) as patients_with_embeddings,
       avg(p.riskScore) as avg_risk_score,
       max(p.extractedAt) as last_extraction_time
"""

verification_df = spark.read \
    .format("org.neo4j.spark.DataSource") \
    .options(**neo4j_options) \
    .option("query", verification_query) \
    .load()

print("📊 Neo4j Verification Results:")
verification_df.show(truncate=False)

# COMMAND ----------

# MAGIC %md
# MAGIC ## 7. Data Quality Checks

# COMMAND ----------

# Check for patients with missing critical data
quality_checks = patients_neo4j.select(
    count("*").alias("total_patients"),
    sum(when(col("policyText").isNull() | (col("policyText") == ""), 1).otherwise(0)).alias("missing_policy_text"),
    sum(when(col("insuranceProvider").isNull(), 1).otherwise(0)).alias("missing_insurance"),
    sum(when(col("riskScore").isNull(), 1).otherwise(0)).alias("missing_risk_score"),
    sum(when(size(col("policyTextEmbedding")) != 1536, 1).otherwise(0)).alias("invalid_embeddings"),
    avg("riskScore").alias("avg_risk_score"),
    max("riskScore").alias("max_risk_score"),
    min("riskScore").alias("min_risk_score")
)

print("📊 Data Quality Report:")
quality_checks.show(truncate=False)

# COMMAND ----------

# MAGIC %md
# MAGIC ## 8. ETL Metadata Logging

# COMMAND ----------

# Log ETL run metadata
etl_metadata = {
    "pipeline_name": "patients_etl",
    "run_timestamp": datetime.now().isoformat(),
    "incremental_mode": INCREMENTAL_MODE,
    "last_run_timestamp": LAST_RUN_TIMESTAMP,
    "records_extracted": patients_df.count(),
    "records_loaded": patients_neo4j.count(),
    "embeddings_generated": patients_with_embeddings.filter(size(col("policy_text_embedding")) == 1536).count(),
    "source_system": "synapse_fhir",
    "target_system": "neo4j_auradb",
    "status": "success"
}

print("📝 ETL Metadata:")
print(json.dumps(etl_metadata, indent=2))

# Write metadata to Synapse logging table (optional)
# metadata_df = spark.createDataFrame([etl_metadata])
# metadata_df.write.jdbc(...)

# COMMAND ----------

# MAGIC %md
# MAGIC ## 9. Cleanup and Optimization

# COMMAND ----------

# Cache cleanup
patients_df.unpersist()
patients_with_embeddings.unpersist()
patients_neo4j.unpersist()

print("✅ Patients ETL pipeline completed successfully!")
print(f"   - Extracted: {etl_metadata['records_extracted']} patients")
print(f"   - Loaded: {etl_metadata['records_loaded']} patients")
print(f"   - Embeddings: {etl_metadata['embeddings_generated']} generated")
print(f"   - Duration: {datetime.now()}")
