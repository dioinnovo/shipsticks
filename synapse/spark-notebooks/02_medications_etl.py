# Databricks notebook source
# MAGIC %md
# MAGIC # Arthur Health - Medications ETL to Neo4j
# MAGIC
# MAGIC **Purpose**: Extract medication data from Synapse SQL and load into Neo4j Knowledge Graph
# MAGIC
# MAGIC **Source**: `healthcare_fhir.medications` table in Synapse
# MAGIC
# MAGIC **Target**: Medication nodes in Neo4j with text embeddings for instructions
# MAGIC
# MAGIC **Features**:
# MAGIC - Reads FHIR-compliant medication data (RxNorm codes)
# MAGIC - Generates text embeddings for medication instructions and side effects
# MAGIC - Writes Medication nodes to Neo4j
# MAGIC - Handles generic/brand name mappings

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
NEO4J_URI = "neo4j+s://xxxxxxxx.databases.neo4j.io"
NEO4J_USERNAME = "neo4j"
NEO4J_PASSWORD = dbutils.secrets.get(scope="arthur-health", key="neo4j-password")
NEO4J_DATABASE = "neo4j"

# Azure OpenAI configuration
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
INCREMENTAL_MODE = True
LAST_RUN_TIMESTAMP = "2025-01-01 00:00:00"

print("✅ Configuration loaded")

# COMMAND ----------

# MAGIC %md
# MAGIC ## 2. Extract from Synapse SQL

# COMMAND ----------

jdbc_url = f"jdbc:sqlserver://{SYNAPSE_SERVER}:1433;database={SYNAPSE_DATABASE};encrypt=true;trustServerCertificate=false;hostNameInCertificate=*.sql.azuresynapse.net;loginTimeout=30;"

if INCREMENTAL_MODE:
    sql_query = f"""
    (
        SELECT
            medication_id,
            rxnorm_code,
            generic_name,
            brand_name,
            drug_class,
            dosage_form,
            strength,
            instructions,
            side_effects,
            contraindications,
            interactions,
            requires_prior_auth,
            formulary_tier,
            estimated_cost_30day,
            estimated_cost_90day,
            therapeutic_category,
            controlled_substance_schedule,
            pregnancy_category,
            fda_approved_date,
            last_modified,
            created_at
        FROM healthcare_fhir.medications
        WHERE last_modified > '{LAST_RUN_TIMESTAMP}'
        OR created_at > '{LAST_RUN_TIMESTAMP}'
    ) AS medications_incremental
    """
else:
    sql_query = """
    (
        SELECT
            medication_id,
            rxnorm_code,
            generic_name,
            brand_name,
            drug_class,
            dosage_form,
            strength,
            instructions,
            side_effects,
            contraindications,
            interactions,
            requires_prior_auth,
            formulary_tier,
            estimated_cost_30day,
            estimated_cost_90day,
            therapeutic_category,
            controlled_substance_schedule,
            pregnancy_category,
            fda_approved_date,
            last_modified,
            created_at
        FROM healthcare_fhir.medications
    ) AS medications_full
    """

medications_df = spark.read \
    .format("jdbc") \
    .option("url", jdbc_url) \
    .option("dbtable", sql_query) \
    .option("user", SYNAPSE_USER) \
    .option("password", SYNAPSE_PASSWORD) \
    .option("driver", "com.microsoft.sqlserver.jdbc.SQLServerDriver") \
    .load()

print(f"✅ Extracted {medications_df.count()} medications from Synapse")
medications_df.printSchema()
medications_df.show(5, truncate=False)

# COMMAND ----------

# MAGIC %md
# MAGIC ## 3. Text Vectorization - Generate Embeddings for Instructions

# COMMAND ----------

def generate_embedding(text):
    """Generate text embedding using Azure OpenAI"""
    if not text or text.strip() == "":
        return [0.0] * 1536

    url = f"{AZURE_OPENAI_ENDPOINT}openai/deployments/{AZURE_OPENAI_DEPLOYMENT}/embeddings?api-version={AZURE_OPENAI_API_VERSION}"

    headers = {
        "Content-Type": "application/json",
        "api-key": AZURE_OPENAI_KEY
    }

    payload = {
        "input": text[:8000],
        "encoding_format": "float"
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        embedding = response.json()["data"][0]["embedding"]
        return embedding
    except Exception as e:
        print(f"⚠️ Embedding generation failed: {str(e)}")
        return [0.0] * 1536

generate_embedding_udf = udf(generate_embedding, ArrayType(FloatType()))

# Generate embeddings for instructions (for semantic search of medication guidance)
print("🔄 Generating embeddings for medication instructions...")

medications_with_embeddings = medications_df.withColumn(
    "instructions_embedding",
    generate_embedding_udf(col("instructions"))
)

# Also embed side effects for semantic search
medications_with_embeddings = medications_with_embeddings.withColumn(
    "side_effects_embedding",
    generate_embedding_udf(col("side_effects"))
)

print(f"✅ Generated embeddings for {medications_with_embeddings.count()} medications")

# COMMAND ----------

# MAGIC %md
# MAGIC ## 4. Data Transformation - Prepare for Neo4j

# COMMAND ----------

medications_neo4j = medications_with_embeddings.select(
    # Primary identifiers
    col("medication_id").alias("id"),
    col("rxnorm_code").alias("rxNormCode"),

    # Drug information
    col("generic_name").alias("genericName"),
    col("brand_name").alias("brandName"),
    col("drug_class").alias("drugClass"),
    col("dosage_form").alias("dosageForm"),
    col("strength"),

    # Clinical guidance (text fields)
    col("instructions"),
    col("side_effects").alias("sideEffects"),
    col("contraindications"),
    col("interactions"),

    # Embeddings for hybrid search
    col("instructions_embedding").alias("instructionsEmbedding"),
    col("side_effects_embedding").alias("sideEffectsEmbedding"),

    # Prior authorization and cost
    col("requires_prior_auth").alias("requiresPriorAuth"),
    col("formulary_tier").alias("formularyTier"),
    col("estimated_cost_30day").alias("estimatedCost30Day"),
    col("estimated_cost_90day").alias("estimatedCost90Day"),

    # Classification
    col("therapeutic_category").alias("therapeuticCategory"),
    col("controlled_substance_schedule").alias("controlledSubstanceSchedule"),
    col("pregnancy_category").alias("pregnancyCategory"),
    col("fda_approved_date").alias("fdaApprovedDate"),

    # Metadata
    lit(datetime.now().isoformat()).alias("extractedAt"),
    lit("synapse_etl").alias("extractionSource"),
    col("last_modified").alias("lastModified"),
    col("created_at").alias("createdAt")
)

print(f"✅ Transformed {medications_neo4j.count()} medications for Neo4j")
medications_neo4j.printSchema()

# COMMAND ----------

# MAGIC %md
# MAGIC ## 5. Load into Neo4j - Write Medication Nodes

# COMMAND ----------

neo4j_options = {
    "url": NEO4J_URI,
    "authentication.type": "basic",
    "authentication.basic.username": NEO4J_USERNAME,
    "authentication.basic.password": NEO4J_PASSWORD,
    "database": NEO4J_DATABASE
}

medications_neo4j.write \
    .format("org.neo4j.spark.DataSource") \
    .mode("Overwrite") \
    .options(**neo4j_options) \
    .option("labels", ":Medication") \
    .option("node.keys", "id,rxNormCode") \
    .save()

print(f"✅ Loaded {medications_neo4j.count()} Medication nodes into Neo4j")

# COMMAND ----------

# MAGIC %md
# MAGIC ## 6. Verification

# COMMAND ----------

verification_query = """
MATCH (m:Medication)
RETURN count(m) as medication_count,
       count(m.instructionsEmbedding) as meds_with_embeddings,
       count(m.requiresPriorAuth) as meds_requiring_pa,
       avg(m.estimatedCost30Day) as avg_cost_30day
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

quality_checks = medications_neo4j.select(
    count("*").alias("total_medications"),
    sum(when(col("instructions").isNull() | (col("instructions") == ""), 1).otherwise(0)).alias("missing_instructions"),
    sum(when(col("requiresPriorAuth") == True, 1).otherwise(0)).alias("requires_pa_count"),
    sum(when(size(col("instructionsEmbedding")) != 1536, 1).otherwise(0)).alias("invalid_embeddings"),
    avg("estimatedCost30Day").alias("avg_cost_30day"),
    max("estimatedCost30Day").alias("max_cost_30day")
)

print("📊 Data Quality Report:")
quality_checks.show(truncate=False)

# COMMAND ----------

# MAGIC %md
# MAGIC ## 8. ETL Metadata Logging

# COMMAND ----------

etl_metadata = {
    "pipeline_name": "medications_etl",
    "run_timestamp": datetime.now().isoformat(),
    "incremental_mode": INCREMENTAL_MODE,
    "last_run_timestamp": LAST_RUN_TIMESTAMP,
    "records_extracted": medications_df.count(),
    "records_loaded": medications_neo4j.count(),
    "embeddings_generated": medications_with_embeddings.filter(size(col("instructions_embedding")) == 1536).count(),
    "source_system": "synapse_fhir",
    "target_system": "neo4j_auradb",
    "status": "success"
}

print("📝 ETL Metadata:")
print(json.dumps(etl_metadata, indent=2))

# COMMAND ----------

print("✅ Medications ETL pipeline completed successfully!")
print(f"   - Extracted: {etl_metadata['records_extracted']} medications")
print(f"   - Loaded: {etl_metadata['records_loaded']} medications")
print(f"   - Embeddings: {etl_metadata['embeddings_generated']} generated")
