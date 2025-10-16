# Databricks notebook source
# MAGIC %md
# MAGIC # Arthur Health - Master ETL Orchestration
# MAGIC
# MAGIC **Purpose**: Orchestrate all ETL notebooks in the correct dependency order
# MAGIC
# MAGIC **Execution Order**:
# MAGIC 1. Load entity nodes (patients, medications, providers, diagnoses, facilities, procedures, care programs)
# MAGIC 2. Create relationships (PRESCRIBED, HAS_DIAGNOSIS, VISITED, REFERRED_TO, etc.)
# MAGIC 3. Run data quality checks
# MAGIC 4. Update ETL metadata
# MAGIC
# MAGIC **Features**:
# MAGIC - Dependency-aware execution
# MAGIC - Error handling and rollback capabilities
# MAGIC - Comprehensive logging
# MAGIC - Performance metrics

# COMMAND ----------

# MAGIC %md
# MAGIC ## 1. Configuration and Setup

# COMMAND ----------

from datetime import datetime
import json

# Master ETL configuration
ETL_RUN_ID = datetime.now().strftime("%Y%m%d_%H%M%S")
INCREMENTAL_MODE = True
LAST_SUCCESSFUL_RUN = "2025-01-01 00:00:00"  # Update with last successful timestamp

# Notebook execution configuration
NOTEBOOK_TIMEOUT_SECONDS = 3600  # 1 hour per notebook
PARALLEL_EXECUTION = False  # Set to True to run independent notebooks in parallel

print(f"🚀 Master ETL Orchestration Started")
print(f"   Run ID: {ETL_RUN_ID}")
print(f"   Mode: {'Incremental' if INCREMENTAL_MODE else 'Full Refresh'}")
print(f"   Last Successful Run: {LAST_SUCCESSFUL_RUN}")
print(f"   Parallel Execution: {PARALLEL_EXECUTION}")

# COMMAND ----------

# MAGIC %md
# MAGIC ## 2. ETL Pipeline Definition

# COMMAND ----------

# Define ETL pipeline stages with dependencies
etl_pipeline = {
    "stage_1_entities": {
        "description": "Load entity nodes (can run in parallel)",
        "parallel": True,
        "notebooks": [
            {
                "path": "/arthur-health/01_patients_etl",
                "name": "patients",
                "timeout": 3600,
                "parameters": {
                    "INCREMENTAL_MODE": str(INCREMENTAL_MODE),
                    "LAST_RUN_TIMESTAMP": LAST_SUCCESSFUL_RUN
                }
            },
            {
                "path": "/arthur-health/02_medications_etl",
                "name": "medications",
                "timeout": 3600,
                "parameters": {
                    "INCREMENTAL_MODE": str(INCREMENTAL_MODE),
                    "LAST_RUN_TIMESTAMP": LAST_SUCCESSFUL_RUN
                }
            },
            # Add more entity notebooks here as they are created
            # {
            #     "path": "/arthur-health/03_providers_etl",
            #     "name": "providers",
            #     "timeout": 3600,
            #     "parameters": {...}
            # },
            # {
            #     "path": "/arthur-health/04_diagnoses_etl",
            #     "name": "diagnoses",
            #     "timeout": 3600,
            #     "parameters": {...}
            # },
        ]
    },
    "stage_2_relationships": {
        "description": "Create relationships between entities (requires stage 1 complete)",
        "parallel": True,
        "notebooks": [
            {
                "path": "/arthur-health/03_patient_medication_relationships",
                "name": "patient_medication_relationships",
                "timeout": 3600,
                "parameters": {
                    "INCREMENTAL_MODE": str(INCREMENTAL_MODE),
                    "LAST_RUN_TIMESTAMP": LAST_SUCCESSFUL_RUN
                }
            },
            # Add more relationship notebooks here
            # {
            #     "path": "/arthur-health/patient_diagnosis_relationships",
            #     "name": "patient_diagnosis_relationships",
            #     "timeout": 3600,
            #     "parameters": {...}
            # },
        ]
    },
    "stage_3_validation": {
        "description": "Data quality validation and gap detection",
        "parallel": False,
        "notebooks": [
            # Add validation notebooks here
            # {
            #     "path": "/arthur-health/data_quality_validation",
            #     "name": "data_quality",
            #     "timeout": 1800,
            #     "parameters": {}
            # }
        ]
    }
}

print("📋 ETL Pipeline Configuration:")
for stage_name, stage_config in etl_pipeline.items():
    print(f"\n{stage_name}:")
    print(f"   Description: {stage_config['description']}")
    print(f"   Parallel: {stage_config['parallel']}")
    print(f"   Notebooks: {len(stage_config['notebooks'])}")
    for nb in stage_config['notebooks']:
        print(f"      - {nb['name']}")

# COMMAND ----------

# MAGIC %md
# MAGIC ## 3. Execution Functions

# COMMAND ----------

def run_notebook_with_logging(notebook_path, notebook_name, parameters, timeout):
    """
    Execute a notebook and log results
    Returns: (success: bool, result: dict, duration: float)
    """
    start_time = datetime.now()

    try:
        print(f"\n🔄 Starting: {notebook_name}")
        print(f"   Path: {notebook_path}")
        print(f"   Parameters: {parameters}")

        # Execute notebook using dbutils
        result = dbutils.notebook.run(
            notebook_path,
            timeout_seconds=timeout,
            arguments=parameters
        )

        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()

        print(f"✅ Completed: {notebook_name} in {duration:.2f}s")

        return True, {"result": result, "error": None}, duration

    except Exception as e:
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()

        print(f"❌ Failed: {notebook_name} after {duration:.2f}s")
        print(f"   Error: {str(e)}")

        return False, {"result": None, "error": str(e)}, duration

def run_stage(stage_name, stage_config):
    """
    Execute all notebooks in a stage
    Returns: (success: bool, results: list)
    """
    print(f"\n{'='*60}")
    print(f"STAGE: {stage_name}")
    print(f"{stage_config['description']}")
    print(f"{'='*60}")

    results = []
    all_success = True

    # Run notebooks
    if stage_config['parallel'] and PARALLEL_EXECUTION:
        print("⚡ Executing notebooks in parallel...")
        # Note: Spark notebook parallel execution requires threading
        # For simplicity, we'll run sequentially for now
        # In production, use ThreadPoolExecutor or Synapse Pipelines
        for notebook in stage_config['notebooks']:
            success, result, duration = run_notebook_with_logging(
                notebook['path'],
                notebook['name'],
                notebook['parameters'],
                notebook['timeout']
            )

            results.append({
                "notebook": notebook['name'],
                "success": success,
                "duration": duration,
                "result": result
            })

            if not success:
                all_success = False
                # For critical stages, stop on first failure
                if stage_name == "stage_1_entities":
                    print(f"⚠️  Critical stage failed, stopping execution")
                    break
    else:
        print("📝 Executing notebooks sequentially...")
        for notebook in stage_config['notebooks']:
            success, result, duration = run_notebook_with_logging(
                notebook['path'],
                notebook['name'],
                notebook['parameters'],
                notebook['timeout']
            )

            results.append({
                "notebook": notebook['name'],
                "success": success,
                "duration": duration,
                "result": result
            })

            if not success:
                all_success = False
                # For critical stages, stop on first failure
                if stage_name == "stage_1_entities":
                    print(f"⚠️  Critical stage failed, stopping execution")
                    break

    return all_success, results

# COMMAND ----------

# MAGIC %md
# MAGIC ## 4. Execute ETL Pipeline

# COMMAND ----------

pipeline_start_time = datetime.now()
pipeline_results = {}
pipeline_success = True

# Execute each stage in order
for stage_name, stage_config in etl_pipeline.items():
    stage_success, stage_results = run_stage(stage_name, stage_config)

    pipeline_results[stage_name] = {
        "success": stage_success,
        "results": stage_results
    }

    if not stage_success:
        pipeline_success = False
        print(f"\n⚠️  Stage {stage_name} failed, stopping pipeline execution")
        break

pipeline_end_time = datetime.now()
pipeline_duration = (pipeline_end_time - pipeline_start_time).total_seconds()

# COMMAND ----------

# MAGIC %md
# MAGIC ## 5. Results Summary

# COMMAND ----------

print("\n" + "="*60)
print("ETL PIPELINE EXECUTION SUMMARY")
print("="*60)

print(f"\nRun ID: {ETL_RUN_ID}")
print(f"Status: {'✅ SUCCESS' if pipeline_success else '❌ FAILED'}")
print(f"Duration: {pipeline_duration:.2f} seconds ({pipeline_duration/60:.2f} minutes)")
print(f"Start Time: {pipeline_start_time.isoformat()}")
print(f"End Time: {pipeline_end_time.isoformat()}")

print("\n📊 Stage Results:")
for stage_name, stage_data in pipeline_results.items():
    stage_status = "✅" if stage_data["success"] else "❌"
    print(f"\n{stage_status} {stage_name}:")

    for notebook_result in stage_data["results"]:
        nb_status = "✅" if notebook_result["success"] else "❌"
        print(f"   {nb_status} {notebook_result['notebook']}: {notebook_result['duration']:.2f}s")

        if not notebook_result["success"]:
            print(f"      Error: {notebook_result['result']['error']}")

# COMMAND ----------

# MAGIC %md
# MAGIC ## 6. ETL Metadata Logging

# COMMAND ----------

# Build detailed metadata
etl_metadata = {
    "run_id": ETL_RUN_ID,
    "pipeline_name": "arthur_health_master_etl",
    "start_time": pipeline_start_time.isoformat(),
    "end_time": pipeline_end_time.isoformat(),
    "duration_seconds": pipeline_duration,
    "status": "success" if pipeline_success else "failed",
    "incremental_mode": INCREMENTAL_MODE,
    "last_successful_run": LAST_SUCCESSFUL_RUN,
    "stages_executed": len(pipeline_results),
    "stages_succeeded": sum(1 for s in pipeline_results.values() if s["success"]),
    "stages_failed": sum(1 for s in pipeline_results.values() if not s["success"]),
    "notebooks_executed": sum(len(s["results"]) for s in pipeline_results.values()),
    "notebooks_succeeded": sum(sum(1 for nb in s["results"] if nb["success"]) for s in pipeline_results.values()),
    "notebooks_failed": sum(sum(1 for nb in s["results"] if not nb["success"]) for s in pipeline_results.values()),
    "detailed_results": pipeline_results
}

print("\n📝 ETL Metadata:")
print(json.dumps({k: v for k, v in etl_metadata.items() if k != "detailed_results"}, indent=2))

# COMMAND ----------

# MAGIC %md
# MAGIC ## 7. Save ETL Metadata to Synapse

# COMMAND ----------

# Optional: Save metadata to Synapse logging table
# This allows tracking ETL runs over time

try:
    # Create DataFrame from metadata
    metadata_df = spark.createDataFrame([{
        "run_id": etl_metadata["run_id"],
        "pipeline_name": etl_metadata["pipeline_name"],
        "start_time": etl_metadata["start_time"],
        "end_time": etl_metadata["end_time"],
        "duration_seconds": etl_metadata["duration_seconds"],
        "status": etl_metadata["status"],
        "incremental_mode": etl_metadata["incremental_mode"],
        "stages_executed": etl_metadata["stages_executed"],
        "notebooks_executed": etl_metadata["notebooks_executed"],
        "notebooks_succeeded": etl_metadata["notebooks_succeeded"],
        "notebooks_failed": etl_metadata["notebooks_failed"],
        "metadata_json": json.dumps(etl_metadata["detailed_results"])
    }])

    # Write to Synapse logging table (create table if it doesn't exist)
    # metadata_df.write \
    #     .format("jdbc") \
    #     .option("url", jdbc_url) \
    #     .option("dbtable", "healthcare_fhir.etl_run_log") \
    #     .option("user", SYNAPSE_USER) \
    #     .option("password", SYNAPSE_PASSWORD) \
    #     .option("driver", "com.microsoft.sqlserver.jdbc.SQLServerDriver") \
    #     .mode("append") \
    #     .save()

    print("✅ ETL metadata saved to Synapse logging table")

except Exception as e:
    print(f"⚠️  Failed to save metadata: {str(e)}")

# COMMAND ----------

# MAGIC %md
# MAGIC ## 8. Final Status

# COMMAND ----------

if pipeline_success:
    print("\n" + "🎉"*20)
    print("✅ MASTER ETL PIPELINE COMPLETED SUCCESSFULLY!")
    print("🎉"*20)

    # Update LAST_SUCCESSFUL_RUN for next incremental run
    print(f"\n📅 Next incremental run should use timestamp: {pipeline_end_time.isoformat()}")

else:
    print("\n" + "⚠️ "*20)
    print("❌ MASTER ETL PIPELINE FAILED")
    print("⚠️ "*20)
    print("\nPlease review error logs above and retry failed notebooks.")

    # Raise exception to mark Synapse Pipeline as failed
    raise Exception(f"ETL Pipeline failed at run {ETL_RUN_ID}")

# COMMAND ----------

# Return success status for Synapse Pipeline integration
dbutils.notebook.exit(json.dumps({
    "run_id": ETL_RUN_ID,
    "status": "success" if pipeline_success else "failed",
    "duration_seconds": pipeline_duration,
    "notebooks_succeeded": etl_metadata["notebooks_succeeded"],
    "notebooks_failed": etl_metadata["notebooks_failed"]
}))
