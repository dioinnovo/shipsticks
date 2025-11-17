# Graphiti Knowledge Graph Framework - Comprehensive Research Report

**Date:** October 13, 2025
**Framework:** Graphiti by Zep AI
**Repository:** https://github.com/getzep/graphiti
**Documentation:** https://help.getzep.com/graphiti/

---

## Executive Summary

Graphiti is a temporal knowledge graph framework developed by Zep AI designed for building real-time, context-aware memory systems for AI agents. Unlike traditional RAG approaches that rely on static embeddings and batch processing, Graphiti maintains a dynamic, incrementally-updated knowledge graph that preserves temporal relationships and historical context. The framework achieves state-of-the-art performance in agent memory benchmarks while maintaining sub-second query latency.

**Key Differentiator:** Graphiti's bi-temporal model tracks both when events occurred and when they were ingested, enabling point-in-time queries and historical reasoning that traditional vector databases cannot support.

---

## 1. Core Architecture

### 1.1 Three-Tier Hierarchical Structure

Graphiti's knowledge graph comprises three interconnected subgraphs:

#### **Episode Subgraph**
- Contains raw input data (unstructured text, structured JSON, or conversational messages)
- Preserves full context of each data ingestion event
- Acts as the ground truth for entity and relationship extraction

#### **Semantic Entity Subgraph**
- Extracted entities (people, places, things, concepts) from episodes
- Relationships between entities with temporal validity intervals
- One-to-one correspondence with real-world counterparts
- Supports custom entity types via Pydantic models

#### **Community Subgraph**
- High-level clusters of interconnected entities
- Enables efficient navigation and reasoning over large graphs
- Supports hierarchical organization of knowledge

### 1.2 Bi-Temporal Data Model

Graphiti implements a sophisticated temporal tracking system:

**Chronological Timeline:** When events actually occurred in the real world
- Supports absolute timestamps: "Alan Turing was born on June 23, 1912"
- Supports relative timestamps: "I started my new job two weeks ago"

**Transactional Timeline:** When facts were ingested into the system
- Tracks when information became known to the agent
- Enables audit trails and version control

**Temporal Edge Invalidation:**
- When new information contradicts existing facts, old edges are invalidated (not deleted)
- Maintains complete history for reasoning and audit purposes
- Preserves data lineage and evolution of knowledge

### 1.3 Entity Extraction and Resolution Pipeline

1. **Entity Extraction Phase**
   - LLM-based extraction from episodes using context (last n messages)
   - Automatic classification against custom entity types
   - Named entity recognition enhanced by conversational context

2. **Entity Resolution Phase**
   - Hybrid search to find potential duplicate entities
   - Combines semantic similarity and graph structure
   - Constrains resolution to relevant entity pairs to reduce computational complexity
   - Prevents false positives by limiting search space

3. **Graph Integration Phase**
   - Uses predefined Cypher queries (not LLM-generated) to ensure schema consistency
   - Reduces hallucination risk
   - Maintains graph integrity and performance

4. **Edge Deduplication**
   - Similar to entity resolution but operates on relationships
   - Constrained to edges between same entity pairs
   - Significantly reduces computational complexity

### 1.4 Incremental Update Architecture

Unlike GraphRAG which requires full graph recomputation, Graphiti:
- Processes episodes in real-time as they arrive
- Instantly updates entities, relationships, and communities
- Uses union operations to merge new knowledge with existing graph
- Reduces update time by ~50% compared to batch approaches

---

## 2. Graph Database Support

### 2.1 Supported Backends

**Neo4j** (Primary)
- Version: 5.26+
- Production-ready with full feature support
- Best ecosystem and tooling
- Recommended for most use cases

**FalkorDB**
- Version: 1.1.2+
- 496x faster performance at P99 latency vs Neo4j
- 6x better memory efficiency
- Optimized for multi-agent environments
- Sub-10ms query response times

**Amazon Neptune**
- Requires Amazon OpenSearch Serverless for full-text search
- Supports both Neptune Database Cluster and Neptune Analytics Graph
- Cloud-native, fully managed

**Kuzu**
- Version: 0.11.2+
- Embedded graph database
- Good for development and testing

### 2.2 Database Configuration

```python
# Custom database configuration (v0.17.0+)
from graphiti_core import Graphiti
from graphiti_core.drivers import Neo4jDriver

driver = Neo4jDriver(
    uri="bolt://localhost:7687",
    user="neo4j",
    password="your_password",
    database="custom_db_name"
)

graphiti = Graphiti(graph_driver=driver)
```

---

## 3. Query Processing and Retrieval

### 3.1 Hybrid Search Architecture

Graphiti achieves **sub-300ms P95 latency** by combining three complementary search methods:

**1. Semantic Search**
- Vector embeddings for conceptual similarity
- Default: OpenAI embeddings
- Supports: Voyage AI, Sentence Transformers, custom embedders

**2. Keyword Search (BM25)**
- Full-text search for exact term matching
- Lexical precision for factual queries

**3. Graph Traversal**
- Direct navigation via relationships
- Breadth-first search for connected facts
- Near-constant time access to nodes/edges

### 3.2 Query Pipeline

**Search typically completes in <100ms**, with latency primarily from embedding API calls.

```
User Query → Query Understanding (LLM) → Hybrid Search →
Subgraph Retrieval → Context Assembly → Response
```

**Key Innovation:** No LLM calls during retrieval phase
- Traditional approaches use LLM summarization at query time (slow)
- Graphiti pre-structures knowledge for direct retrieval (fast)
- Search latency independent of graph size

### 3.3 Query Language Support

**Cypher Query Language**
- Standard graph query language (used by Neo4j)
- Declarative syntax similar to SQL
- OpenCypher standard for portability

**Natural Language Queries**
- LLM-based query understanding
- Translates natural language to structured graph queries
- Preserves semantic intent

**API-Based Queries**
- Python SDK for programmatic access
- FastAPI REST endpoints for language-agnostic integration
- Supports filtering by temporal ranges

---

## 4. LLM Integration and Extensibility

### 4.1 Supported LLM Providers

**OpenAI** (Default)
- GPT-4, GPT-4o, GPT-4 Turbo
- Structured output support for reliable extraction

**Anthropic**
- Claude 3.5 Sonnet, Claude 3 Opus
- Excellent for entity extraction and reasoning

**Google**
- Gemini 1.5 Pro, Gemini 1.5 Flash
- Structured output support

**Azure OpenAI**
- Enterprise deployment
- Data residency compliance

**Groq**
- Ultra-fast inference
- Cost-effective for high-volume workloads

### 4.2 LLM Usage Points

Graphiti uses LLMs at specific pipeline stages:

1. **Entity Extraction** - Identify entities from text
2. **Relationship Extraction** - Determine entity connections
3. **Entity Resolution** - Match entities to existing nodes
4. **Fact Validation** - Verify extracted information
5. **Query Understanding** - Interpret natural language queries
6. **Temporal Extraction** - Parse dates and time references

**Critical Limitation:** Works best with LLMs supporting **Structured Output** (OpenAI, Gemini). Other models may produce incorrect schemas and cause ingestion failures.

### 4.3 Custom Entity Types

```python
from pydantic import BaseModel, Field
from typing import Literal

class MedicalCondition(BaseModel):
    """Custom entity for healthcare applications"""
    entity_type: Literal["medical_condition"] = "medical_condition"
    name: str = Field(description="Name of the medical condition")
    severity: str = Field(description="Severity level: mild, moderate, severe")
    icd10_code: str = Field(description="ICD-10 diagnosis code")
    onset_date: str = Field(description="When condition was first diagnosed")

# Register with Graphiti
graphiti = Graphiti(
    uri="bolt://localhost:7687",
    user="neo4j",
    password="password",
    entity_types=[MedicalCondition]
)
```

---

## 5. Performance Characteristics

### 5.1 Benchmark Results

**Deep Memory Retrieval (DMR) Benchmark:**
- 94.8% accuracy with GPT-4 Turbo
- 98.2% accuracy with GPT-4o Mini
- State-of-the-art for agent memory systems

**LongMemEval Benchmark:**
- 15.2-18.5% accuracy improvement over baselines
- 90% reduction in response latency vs. traditional approaches
- Superior performance on multi-hop reasoning tasks

**Query Performance:**
- P95 latency: 300ms (Graphiti + Neo4j)
- P99 latency: Sub-10ms (Graphiti + FalkorDB)
- Search results: <100ms (limited by embedding API)
- Graph traversal: Near-constant time regardless of graph size

### 5.2 Scalability

**Graph Size:**
- Handles very large-scale knowledge graphs
- Retrieval latency independent of total graph size
- Uses hybrid search to retrieve relevant subgraphs only

**Concurrency:**
- Default: 10 concurrent operations (SEMAPHORE_LIMIT=10)
- Configurable up to LLM provider rate limits
- Designed for high-throughput ingestion pipelines
- Parallel processing for episode ingestion

**Memory Efficiency:**
- FalkorDB: 6x more memory efficient than Neo4j
- Episode-based chunking prevents memory bloat
- Incremental updates avoid full graph recomputation

### 5.3 Processing Speed

**Episode Ingestion:**
- Real-time processing with immediate graph updates
- Limited primarily by LLM provider rate limits
- Can be optimized by increasing SEMAPHORE_LIMIT
- No batch recomputation required

**Incremental Updates:**
- 50% faster than full recomputation approaches
- Union-based graph merging
- Maintains consistency across updates

---

## 6. Production Deployment

### 6.1 Architecture Options

**Option 1: Direct Integration (NOT RECOMMENDED)**
```python
# This will cause event loop conflicts in production
from graphiti_core import Graphiti
graphiti = Graphiti(...)  # Crashes with async frameworks
```

**Option 2: Microservice Architecture (RECOMMENDED)**
```
Application ←→ Graphiti API Service ←→ Graphiti Core ←→ Graph DB
(Main Event Loop)  (REST/gRPC)     (Isolated Process)
```

### 6.2 Critical Production Issues

**Event Loop Conflicts (CRITICAL):**
- **Problem:** When integrating graphiti-core directly into async frameworks, applications crash with:
  - `RuntimeError: Future attached to a different loop`
  - `RuntimeError: Event loop is closed`
- **Root Cause:** Fundamental architectural issue with graphiti-core's async resource management
- **Solution:** Deploy Graphiti as a separate microservice with its own event loop
- **Impact:** Requires process isolation, cannot be used as a direct library dependency in async applications

**LLM Rate Limiting:**
- Default concurrency (10) is conservative to avoid 429 errors
- Performance may be slow without tuning SEMAPHORE_LIMIT
- Requires monitoring and adjustment based on LLM provider

**Limited Observability:**
- Minimal built-in monitoring and metrics
- No included tools for graph visualization
- Limited error messages for debugging
- Requires custom instrumentation for production monitoring

**Documentation Gaps:**
- HTTP API poorly documented as of October 2024
- Some concepts lack clear explanations
- Missing endpoint documentation

### 6.3 FastAPI REST Service

Graphiti provides a FastAPI-based REST service:

**Features:**
- Stateless HTTP interface to Graphiti functionality
- Endpoints for graph operations, search, ingestion, management
- Pydantic Settings for configuration
- Environment variable support
- Docker deployment ready

**Deployment:**
```bash
# Docker Compose deployment
docker-compose up -d

# Environment variables
OPENAI_API_KEY=your_key
NEO4J_URI=bolt://neo4j:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
SEMAPHORE_LIMIT=20  # Adjust based on LLM provider
```

**Known Issues:**
- HTTP API documentation incomplete (as of Oct 2024)
- Event loop conflicts require subprocess isolation
- Authentication/authorization not built-in

### 6.4 Multi-Tenant Support

**Group IDs:**
- Organize data across different contexts/users
- Enables multi-tenant deployments
- Isolates knowledge graphs per tenant
- Supported in MCP server implementation

### 6.5 Monitoring and Operations

**Recommended Monitoring:**
- Custom metrics for episode ingestion rate
- LLM API call counts and latency
- Graph database query performance
- Entity extraction success/failure rates
- Memory and CPU usage

**Logging:**
- Configure custom logging for production visibility
- Track LLM provider errors (429, 500)
- Monitor entity resolution conflicts
- Audit temporal edge invalidations

---

## 7. Integration Patterns

### 7.1 Model Context Protocol (MCP) Integration

Graphiti provides an MCP server for integration with Claude, Cursor, and other MCP clients:

**Features:**
- Persistent memory across conversations
- Contextual awareness for AI assistants
- Episode management (add, retrieve, delete)
- Entity and relationship search
- Semantic and hybrid search capabilities

**Setup for Claude Desktop:**
```json
{
  "mcpServers": {
    "graphiti": {
      "command": "python",
      "args": ["-m", "graphiti_mcp"],
      "env": {
        "OPENAI_API_KEY": "your_key",
        "NEO4J_URI": "bolt://localhost:7687",
        "NEO4J_USER": "neo4j",
        "NEO4J_PASSWORD": "password"
      }
    }
  }
}
```

**Supported Clients:**
- Claude Desktop (all plans)
- Cursor IDE
- Any MCP-compatible client

### 7.2 Python SDK Integration

```python
import asyncio
from graphiti_core import Graphiti
from datetime import datetime

async def main():
    # Initialize Graphiti
    graphiti = Graphiti(
        uri="bolt://localhost:7687",
        user="neo4j",
        password="password"
    )

    # Add an episode (data event)
    await graphiti.add_episode(
        name="patient_visit",
        episode_body="Patient John Smith presented with acute chest pain. "
                    "Diagnosed with angina. Prescribed nitroglycerin.",
        source_description="EMR System",
        reference_time=datetime.now()
    )

    # Build communities (for better search)
    await graphiti.build_communities()

    # Search the knowledge graph
    results = await graphiti.search(
        query="What medications was John Smith prescribed?",
        num_results=5
    )

    for result in results:
        print(f"Fact: {result.fact}")
        print(f"Valid from: {result.valid_at}")
        print(f"Entities: {result.entities}")

asyncio.run(main())
```

### 7.3 Microsoft Synapse Integration

While Graphiti doesn't have direct Synapse integration, several approaches are viable:

**Approach 1: ETL from Synapse to Neo4j**
- Use Azure Data Factory to extract data from Synapse
- Transform to graph-friendly format
- Load into Neo4j via Cypher or Neo4j ETL tools
- Graphiti ingests from Neo4j

**Approach 2: Dual-Write Pattern**
- Write operational data to Synapse (SQL)
- Stream changes to Graphiti via Change Data Capture (CDC)
- Azure Event Hubs or Kafka for streaming
- Maintain eventual consistency

**Approach 3: Batch Sync with CData**
- CData Sync for automated Neo4j ↔ Synapse replication
- Schedule periodic syncs (hourly, daily)
- Good for analytics use cases
- May have latency for real-time needs

**Approach 4: Reverse ETL**
- Extract knowledge graph insights from Neo4j
- Load back to Synapse for BI/reporting
- Tools: Skyvia, Airbyte, custom scripts
- Enables SQL-based analytics on graph data

**Example Architecture for Healthcare:**
```
Azure Synapse (EHR Data)
    ↓ (Azure Data Factory)
Azure Event Hubs (CDC Stream)
    ↓ (Consumer)
Graphiti API Service
    ↓
Neo4j (Knowledge Graph)
    ↓ (Reverse ETL)
Azure Synapse (Analytics Views)
```

---

## 8. Healthcare Analytics Suitability

### 8.1 Pros for Healthcare Applications

**1. Temporal Reasoning**
- Critical for tracking patient history, medication changes, condition progression
- Supports "point-in-time" queries: "What medications was patient on 3 months ago?"
- Maintains complete audit trail for compliance (HIPAA, regulatory)

**2. Complex Relationship Modeling**
- Patient-provider-facility-insurance relationships
- Drug interactions and contraindications
- Care pathways and clinical protocols
- Referral networks and care coordination

**3. Incremental Updates**
- Real-time ingestion of new clinical data
- No batch recomputation for emergency situations
- Supports dynamic care team changes

**4. Multi-Modal Data Integration**
- Unstructured: Clinical notes, physician narratives, discharge summaries
- Structured: Lab results, vital signs, billing codes
- External: Insurance policies, drug formularies, clinical guidelines

**5. Custom Entity Types**
- Define domain-specific entities: Diagnoses (ICD-10), Procedures (CPT), Medications (RxNorm)
- Enforce healthcare ontologies (SNOMED, LOINC)
- Maintain semantic consistency across data sources

**6. Sub-Second Query Latency**
- Critical for clinical decision support at point of care
- Enables real-time drug interaction checks
- Supports conversational AI assistants for clinicians

**7. Explainable Reasoning**
- Graph structure shows reasoning path
- Temporal provenance explains how knowledge evolved
- Critical for clinician trust and regulatory compliance

### 8.2 Cons for Healthcare Applications

**1. HIPAA Compliance Challenges**
- No built-in PHI (Protected Health Information) encryption
- Limited access control features
- No native audit logging for HIPAA requirements
- Requires custom security layer

**2. LLM Data Privacy Concerns**
- Entity extraction sends data to third-party LLM providers (OpenAI, Anthropic)
- Potential PHI exposure unless using Azure OpenAI with BAA
- May require on-premise LLM deployment

**3. Production Stability Issues**
- Event loop conflicts require workarounds
- Limited observability makes debugging difficult
- Under active development (potential breaking changes)

**4. Limited Enterprise Features**
- No built-in authentication/authorization
- No role-based access control (RBAC)
- No data encryption at rest (depends on database)
- No built-in disaster recovery

**5. Custom Healthcare Ontology Required**
- Generic entity types insufficient for clinical use
- Must define: Diagnosis, Procedure, Medication, Lab Test, etc.
- Integration with UMLS, SNOMED CT requires custom work

**6. Scalability for Large Health Systems**
- Enterprise hospitals may have millions of patients
- Unknown performance at scale (25K weekly downloads suggests smaller deployments)
- May require FalkorDB for multi-tenant performance

**7. Data Governance Challenges**
- Graph structure complexity makes data governance difficult
- Hard to enforce data retention policies
- Difficult to anonymize/de-identify graph data

### 8.3 Healthcare Use Case Fit

**Excellent Fit:**
- Care coordination platforms (track referrals, specialists, care plans)
- Clinical decision support (drug interactions, contraindications)
- Patient timeline reconstruction (medical history, progression)
- AI assistant for clinicians (conversational queries over patient data)

**Moderate Fit:**
- Population health analytics (need strong aggregation layer)
- Insurance policy analysis (Arthur Health use case - good fit)
- Clinical research (need strong privacy controls)

**Poor Fit:**
- Real-time ICU monitoring (latency from LLM calls)
- Billing and claims processing (relational DBs better)
- High-volume transactional systems (OLTP use cases)

---

## 9. Comparison: Graphiti vs. LightRAG

| Dimension | Graphiti | LightRAG |
|-----------|----------|----------|
| **Architecture** | Three-tier hierarchical graph (Episodes, Entities, Communities) | Dual-level retrieval (Vector + Graph) |
| **Temporal Model** | Bi-temporal (occurrence + ingestion time) | Limited temporal support |
| **Update Model** | Real-time incremental | Incremental with union operations |
| **Query Latency** | 300ms P95 (hybrid search) | 20-30ms faster than GraphRAG |
| **Graph Database** | Neo4j, FalkorDB, Neptune, Kuzu | Typically Neo4j |
| **LLM Integration** | OpenAI, Anthropic, Gemini, Azure, Groq | OpenAI (primarily) |
| **Edge Invalidation** | Temporal invalidation (preserves history) | Overwrites (loses history) |
| **Community Detection** | Hierarchical clustering | Multi-hop subgraph merging |
| **Production Readiness** | Event loop issues, needs microservice | More stable direct integration |
| **Observability** | Limited built-in metrics | Better logging and debugging |
| **Use Case Focus** | Agent memory, conversational AI | Document QA, knowledge retrieval |
| **Cost Efficiency** | Moderate (multiple LLM calls) | High (optimized for fewer LLM calls) |
| **Best For** | Dynamic, evolving knowledge over time | Fast retrieval from static documents |

**Key Differentiator:**
Graphiti excels at **temporal reasoning** and **historical context**, while LightRAG optimizes for **speed** and **cost efficiency** in static document scenarios.

**When to Choose Graphiti:**
- Need to track how knowledge evolves over time
- Building conversational agents with long-term memory
- Require point-in-time historical queries
- Complex multi-entity relationships

**When to Choose LightRAG:**
- Primarily static document corpus
- Need fastest possible query response
- Cost-sensitive deployments
- Don't need historical versioning

---

## 10. Code Examples

### 10.1 Basic Setup and Episode Ingestion

```python
import asyncio
from graphiti_core import Graphiti
from datetime import datetime

async def basic_usage():
    # Initialize Graphiti with Neo4j
    graphiti = Graphiti(
        uri="bolt://localhost:7687",
        user="neo4j",
        password="your_password"
    )

    # Add multiple episodes
    episodes = [
        {
            "name": "patient_diagnosis",
            "episode_body": "Sarah Johnson, 45, presented with type 2 diabetes. "
                          "HbA1c level 8.2%. Started on metformin 500mg twice daily.",
            "source_description": "EMR Clinical Notes",
            "reference_time": datetime(2025, 1, 15, 10, 30)
        },
        {
            "name": "medication_adjustment",
            "episode_body": "Sarah Johnson's metformin increased to 1000mg twice daily "
                          "due to inadequate glucose control. HbA1c still 7.8%.",
            "source_description": "EMR Clinical Notes",
            "reference_time": datetime(2025, 3, 20, 14, 15)
        },
        {
            "name": "specialist_referral",
            "episode_body": "Referred Sarah Johnson to endocrinologist Dr. Mike Chen "
                          "at City Medical Center for diabetes management optimization.",
            "source_description": "Referral System",
            "reference_time": datetime(2025, 4, 5, 9, 0)
        }
    ]

    for episode in episodes:
        await graphiti.add_episode(**episode)
        print(f"Ingested: {episode['name']}")

    # Build communities for better search performance
    print("Building communities...")
    await graphiti.build_communities()
    print("Knowledge graph ready!")

asyncio.run(basic_usage())
```

### 10.2 Custom Healthcare Entities

```python
from pydantic import BaseModel, Field
from typing import Literal, Optional
from graphiti_core import Graphiti

# Define custom healthcare entity types
class Patient(BaseModel):
    entity_type: Literal["patient"] = "patient"
    name: str = Field(description="Patient name")
    mrn: str = Field(description="Medical record number")
    date_of_birth: str = Field(description="Date of birth")

class Diagnosis(BaseModel):
    entity_type: Literal["diagnosis"] = "diagnosis"
    name: str = Field(description="Diagnosis name")
    icd10_code: str = Field(description="ICD-10 code")
    severity: str = Field(description="Severity: mild, moderate, severe")

class Medication(BaseModel):
    entity_type: Literal["medication"] = "medication"
    name: str = Field(description="Generic medication name")
    rxnorm_code: str = Field(description="RxNorm code")
    dosage: str = Field(description="Dosage and frequency")

class Provider(BaseModel):
    entity_type: Literal["provider"] = "provider"
    name: str = Field(description="Provider name")
    specialty: str = Field(description="Medical specialty")
    npi: str = Field(description="National Provider Identifier")

class Facility(BaseModel):
    entity_type: Literal["facility"] = "facility"
    name: str = Field(description="Facility name")
    facility_type: str = Field(description="Type: hospital, clinic, etc.")

async def setup_healthcare_graphiti():
    graphiti = Graphiti(
        uri="bolt://localhost:7687",
        user="neo4j",
        password="your_password",
        entity_types=[Patient, Diagnosis, Medication, Provider, Facility]
    )
    return graphiti
```

### 10.3 Temporal Queries

```python
async def temporal_query_examples(graphiti):
    # Query 1: What medications was patient on at specific date?
    results = await graphiti.search(
        query="What medications was Sarah Johnson prescribed on March 1, 2025?",
        num_results=10
    )

    print("Medications on March 1, 2025:")
    for result in results:
        if result.valid_at and result.valid_at <= datetime(2025, 3, 1):
            print(f"  - {result.fact} (valid from {result.valid_at})")

    # Query 2: How has treatment changed over time?
    results = await graphiti.search(
        query="Show me the history of Sarah Johnson's diabetes treatment",
        num_results=20
    )

    print("\nTreatment Timeline:")
    sorted_results = sorted(results, key=lambda x: x.valid_at or datetime.min)
    for result in sorted_results:
        print(f"  {result.valid_at}: {result.fact}")

    # Query 3: Who are all the providers Sarah has seen?
    results = await graphiti.search(
        query="List all healthcare providers who have treated Sarah Johnson",
        num_results=15
    )

    print("\nCare Team:")
    for result in results:
        print(f"  - {result.fact}")
```

### 10.4 Care Coordination Use Case

```python
async def care_coordination_example():
    graphiti = await setup_healthcare_graphiti()

    # Simulate care coordination workflow
    episodes = [
        # Initial PCP visit
        {
            "name": "pcp_visit",
            "episode_body": "Dr. Lisa Martinez (PCP) at Primary Care Clinic saw "
                          "patient Robert Davis for chest pain. EKG showed abnormalities. "
                          "Referred to cardiologist Dr. James Lee at Heart Center.",
            "source": "Primary Care EMR",
            "time": datetime(2025, 5, 10, 10, 0)
        },
        # Cardiologist visit
        {
            "name": "cardiology_visit",
            "episode_body": "Dr. James Lee (Cardiologist) evaluated Robert Davis. "
                          "Ordered cardiac stress test and echocardiogram. "
                          "Preliminary diagnosis: stable angina.",
            "source": "Cardiology EMR",
            "time": datetime(2025, 5, 17, 14, 30)
        },
        # Test results
        {
            "name": "test_results",
            "episode_body": "Robert Davis stress test showed 70% blockage in LAD. "
                          "Dr. Lee recommended cardiac catheterization. "
                          "Referred to interventional cardiologist Dr. Susan Park.",
            "source": "Cardiology Lab",
            "time": datetime(2025, 5, 24, 9, 15)
        },
        # Intervention
        {
            "name": "procedure",
            "episode_body": "Dr. Susan Park performed cardiac catheterization with "
                          "stent placement in LAD for Robert Davis at Hospital Cath Lab. "
                          "Procedure successful. Patient discharged with clopidogrel, "
                          "aspirin, and atorvastatin.",
            "source": "Hospital EMR",
            "time": datetime(2025, 6, 2, 8, 0)
        },
        # Follow-up
        {
            "name": "followup",
            "episode_body": "Robert Davis follow-up with Dr. James Lee. "
                          "No chest pain. Tolerating medications well. "
                          "Cardiac rehab referral sent to Wellness Center.",
            "source": "Cardiology EMR",
            "time": datetime(2025, 6, 16, 11, 0)
        }
    ]

    for ep in episodes:
        await graphiti.add_episode(
            name=ep["name"],
            episode_body=ep["episode_body"],
            source_description=ep["source"],
            reference_time=ep["time"]
        )

    await graphiti.build_communities()

    # Query the care coordination graph
    queries = [
        "Map out Robert Davis's complete cardiac care pathway",
        "Which providers were involved in Robert's cardiac care?",
        "What facilities did Robert Davis visit for his heart condition?",
        "What is the timeline of Robert's cardiac treatment?",
        "What medications was Robert prescribed after his stent?",
    ]

    for query in queries:
        print(f"\nQuery: {query}")
        results = await graphiti.search(query, num_results=10)
        for result in results:
            print(f"  - {result.fact}")
```

### 10.5 Insurance Policy Analysis (Arthur Health Use Case)

```python
class InsurancePolicy(BaseModel):
    entity_type: Literal["insurance_policy"] = "insurance_policy"
    policy_number: str
    payer_name: str
    policy_type: str  # HMO, PPO, Medicare, etc.

class CoverageRule(BaseModel):
    entity_type: Literal["coverage_rule"] = "coverage_rule"
    service_name: str
    requires_prior_auth: bool
    copay_amount: Optional[str]
    coverage_percentage: Optional[str]

class PriorAuthRequirement(BaseModel):
    entity_type: Literal["prior_auth"] = "prior_auth"
    procedure_name: str
    cpt_code: str
    approval_criteria: str

async def policy_analysis_example():
    graphiti = Graphiti(
        uri="bolt://localhost:7687",
        user="neo4j",
        password="password",
        entity_types=[Patient, InsurancePolicy, CoverageRule, PriorAuthRequirement]
    )

    # Ingest policy document
    await graphiti.add_episode(
        name="policy_ingestion",
        episode_body="""
        Patient Emily Wong has Blue Cross Blue Shield PPO policy #BC123456.
        MRI scans require prior authorization. Pre-auth must demonstrate
        6 weeks of failed conservative treatment. In-network copay $200.
        Out-of-network coverage 60% after deductible.

        Physical therapy covered up to 30 visits per year, no prior auth needed.
        Copay $40 per visit. Specialist visits require PCP referral.
        """,
        source_description="Insurance Policy Document",
        reference_time=datetime.now()
    )

    await graphiti.build_communities()

    # Arthur AI-style queries
    queries = [
        "Does Emily Wong's insurance require prior auth for MRI?",
        "What are the prior authorization requirements for MRI?",
        "How many physical therapy visits are covered per year?",
        "What is the copay for specialist visits?",
        "Can Emily see a specialist without a referral?",
    ]

    print("Arthur AI Policy Analysis:")
    for query in queries:
        print(f"\nQ: {query}")
        results = await graphiti.search(query, num_results=3)
        if results:
            print(f"A: {results[0].fact}")
```

### 10.6 Production Microservice Pattern (Recommended)

```python
# graphiti_service.py - Separate microservice
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from graphiti_core import Graphiti
import asyncio
from datetime import datetime
from typing import Optional, List

app = FastAPI(title="Graphiti Knowledge Graph Service")

# Global Graphiti instance with its own event loop
graphiti = None

@app.on_event("startup")
async def startup():
    global graphiti
    graphiti = Graphiti(
        uri="bolt://neo4j:7687",
        user="neo4j",
        password="password"
    )

class EpisodeRequest(BaseModel):
    name: str
    body: str
    source: str
    reference_time: Optional[datetime] = None

class SearchRequest(BaseModel):
    query: str
    num_results: int = 10
    group_id: Optional[str] = None

@app.post("/episodes")
async def add_episode(request: EpisodeRequest):
    try:
        await graphiti.add_episode(
            name=request.name,
            episode_body=request.body,
            source_description=request.source,
            reference_time=request.reference_time or datetime.now()
        )
        return {"status": "success", "message": "Episode ingested"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search")
async def search_graph(request: SearchRequest):
    try:
        results = await graphiti.search(
            query=request.query,
            num_results=request.num_results,
            group_id=request.group_id
        )
        return {
            "results": [
                {
                    "fact": r.fact,
                    "entities": r.entities,
                    "valid_at": r.valid_at,
                    "score": r.score
                }
                for r in results
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/communities/build")
async def build_communities():
    try:
        await graphiti.build_communities()
        return {"status": "success", "message": "Communities built"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Docker Compose deployment
# docker-compose.yml:
"""
version: '3.8'
services:
  neo4j:
    image: neo4j:5.26
    environment:
      NEO4J_AUTH: neo4j/your_password
    ports:
      - "7687:7687"
      - "7474:7474"
    volumes:
      - neo4j_data:/data

  graphiti-service:
    build: .
    environment:
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    ports:
      - "8000:8000"
    depends_on:
      - neo4j

volumes:
  neo4j_data:
"""
```

### 10.7 Client Application (Uses Microservice)

```python
# main_application.py - Your main async application
import httpx
from fastapi import FastAPI

app = FastAPI()

# This runs in its own event loop, no conflicts!
GRAPHITI_SERVICE_URL = "http://graphiti-service:8000"

@app.post("/patient/admit")
async def admit_patient(patient_data: dict):
    async with httpx.AsyncClient() as client:
        # Send episode to Graphiti service
        response = await client.post(
            f"{GRAPHITI_SERVICE_URL}/episodes",
            json={
                "name": "patient_admission",
                "body": f"Patient {patient_data['name']} admitted with {patient_data['condition']}",
                "source": "Hospital EMR"
            }
        )
        return response.json()

@app.get("/patient/history")
async def get_patient_history(patient_id: str):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{GRAPHITI_SERVICE_URL}/search",
            json={
                "query": f"Show complete medical history for patient {patient_id}",
                "num_results": 50
            }
        )
        return response.json()
```

---

## 11. Installation and Setup

### 11.1 Prerequisites

```bash
# Python 3.10+
python --version

# Neo4j 5.26+ (or FalkorDB 1.1.2+)
# Install via Neo4j Desktop or Docker:
docker run -d \
  --name neo4j \
  -p 7687:7687 \
  -p 7474:7474 \
  -e NEO4J_AUTH=neo4j/your_password \
  neo4j:5.26
```

### 11.2 Installation

```bash
# Basic installation
pip install graphiti-core

# With specific database support
pip install graphiti-core[neo4j]
pip install graphiti-core[falkordb]
pip install graphiti-core[neptune]
pip install graphiti-core[kuzu]

# With specific LLM provider
pip install graphiti-core[anthropic]
pip install graphiti-core[google-genai]
pip install graphiti-core[groq]

# All features
pip install graphiti-core[all]

# Development
pip install graphiti-core[dev]
```

### 11.3 Environment Variables

```bash
# .env file
OPENAI_API_KEY=sk-...
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password
SEMAPHORE_LIMIT=10  # Increase for higher throughput
```

### 11.4 Verify Installation

```python
import asyncio
from graphiti_core import Graphiti

async def test():
    graphiti = Graphiti(
        uri="bolt://localhost:7687",
        user="neo4j",
        password="your_password"
    )
    await graphiti.add_episode(
        name="test",
        episode_body="This is a test episode.",
        source_description="Setup verification"
    )
    results = await graphiti.search("test episode")
    print(f"Success! Found {len(results)} results")

asyncio.run(test())
```

---

## 12. Scalability Assessment

### 12.1 Horizontal Scalability

**Graph Database Layer:**
- Neo4j Cluster Edition for high availability
- FalkorDB for extreme performance (496x faster P99)
- Amazon Neptune fully managed, auto-scaling

**Application Layer:**
- Graphiti API service can be horizontally scaled
- Stateless design enables load balancing
- Multiple instances can share same graph database

**LLM Provider Layer:**
- OpenAI, Anthropic scale automatically
- Azure OpenAI for enterprise throughput
- Self-hosted models (Groq) for cost optimization

### 12.2 Vertical Scalability

**Memory:**
- Graphiti's hybrid search retrieves subgraphs, not entire graph
- FalkorDB: 6x more memory efficient than Neo4j
- Episode-based chunking prevents unbounded growth

**CPU:**
- Parallel episode processing (configurable concurrency)
- Entity extraction CPU-bound (LLM inference)
- Graph queries benefit from more CPU cores

**Disk:**
- Neo4j stores graph on disk, paginated access
- SSD strongly recommended for low latency
- Compression available for large deployments

### 12.3 Enterprise Scale Readiness

**Current Evidence:**
- 25,000 weekly downloads (suggests smaller deployments)
- Active development (may have breaking changes)
- Limited production case studies

**Estimated Capacity:**
- **Small deployment:** <1M entities, <10M relationships
- **Medium deployment:** 1M-10M entities, 10M-100M relationships
- **Large deployment:** >10M entities, >100M relationships (FalkorDB recommended)

**Bottlenecks:**
- LLM provider rate limits (most critical)
- Graph database write throughput
- Network latency for remote LLMs

**Recommendations for Enterprise:**
- Start with FalkorDB for best performance
- Use Azure OpenAI with provisioned throughput
- Deploy Graphiti as microservice cluster
- Implement custom monitoring and alerting
- Plan for data sharding by tenant/group_id

---

## 13. Microsoft Synapse Integration Feasibility

### 13.1 Technical Feasibility: **HIGH**

While Graphiti doesn't offer native Synapse integration, multiple viable patterns exist:

**Architecture Pattern 1: Synapse → Graphiti (Recommended)**
```
Azure Synapse (Source of Truth)
    ↓ Azure Data Factory (ETL)
Azure Event Hubs (CDC Stream)
    ↓ Consumer Service
Graphiti API (Microservice)
    ↓
Neo4j / FalkorDB (Knowledge Graph)
```

**Benefits:**
- Synapse remains operational data warehouse
- Graphiti provides AI-powered knowledge layer
- Near real-time sync via CDC
- Separation of concerns (OLAP vs. Graph)

**Architecture Pattern 2: Bi-Directional Sync**
```
Azure Synapse ←→ Sync Service ←→ Neo4j/Graphiti
```

**Benefits:**
- Graph insights available in Synapse for BI tools
- SQL analysts can query graph data
- Best of both worlds (relational + graph)

### 13.2 Implementation Approaches

**Approach 1: Azure Data Factory ETL**
```python
# Pseudo-code for ADF integration
# 1. Extract from Synapse
SELECT patient_id, diagnosis, medication, provider
FROM clinical_data
WHERE modified_date > @last_sync

# 2. Transform to episode format
# Python script in ADF Data Flow

# 3. Load to Graphiti via REST API
import requests

for row in synapse_data:
    requests.post(
        "http://graphiti-service/episodes",
        json={
            "name": f"clinical_event_{row['id']}",
            "body": format_episode(row),
            "source": "Azure Synapse"
        }
    )
```

**Approach 2: Change Data Capture (CDC)**
```python
# Azure Event Hubs consumer
from azure.eventhub import EventHubConsumerClient
import httpx

async def on_event(partition_context, event):
    data = json.loads(event.body_as_str())

    # Send to Graphiti
    async with httpx.AsyncClient() as client:
        await client.post(
            "http://graphiti-service/episodes",
            json={
                "name": f"synapse_change_{data['id']}",
                "body": data['description'],
                "source": "Synapse CDC"
            }
        )

    await partition_context.update_checkpoint(event)

consumer = EventHubConsumerClient(...)
consumer.receive(on_event)
```

**Approach 3: CData Sync (Commercial)**
```
# Configure CData Sync
Source: Azure Synapse
Destination: Neo4j
Schedule: Incremental every 5 minutes

# CData handles:
- Schema mapping
- Change detection
- Error handling
- Monitoring
```

**Approach 4: Reverse ETL (Graphiti → Synapse)**
```sql
-- Create view in Synapse for graph insights
CREATE EXTERNAL TABLE patient_knowledge_graph (
    patient_id VARCHAR(50),
    entity_type VARCHAR(100),
    relationship VARCHAR(100),
    related_entity VARCHAR(100),
    valid_from DATETIME,
    valid_to DATETIME
)
WITH (
    LOCATION = '/graphiti_export/',
    DATA_SOURCE = azure_storage,
    FILE_FORMAT = parquet_format
);

-- Populated by scheduled exports from Neo4j
```

### 13.3 Reference Architecture for Arthur Health

```
┌─────────────────────────────────────────────────────────┐
│                    Azure Synapse                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Insurance Policies | Claims | Provider Networks │   │
│  └───────────────┬──────────────────────────────────┘   │
└──────────────────┼──────────────────────────────────────┘
                   │
                   ↓ (Azure Data Factory - Scheduled ETL)
┌─────────────────────────────────────────────────────────┐
│              Azure Event Hubs (Optional CDC)            │
└───────────────┬─────────────────────────────────────────┘
                │
                ↓ (Consumer Service)
┌─────────────────────────────────────────────────────────┐
│          Graphiti API Microservice Cluster              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Service 1│  │ Service 2│  │ Service N│              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
└───────┼─────────────┼─────────────┼─────────────────────┘
        │             │             │
        └─────────────┴─────────────┘
                      │
┌─────────────────────▼─────────────────────────────────┐
│              Neo4j / FalkorDB Cluster                 │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Policy Entities | Coverage Rules | Prior Auths │  │
│  └─────────────────────────────────────────────────┘  │
└───────────────┬───────────────────────────────────────┘
                │
                ↓ (Reverse ETL - Nightly)
┌───────────────▼───────────────────────────────────────┐
│       Azure Synapse Analytics Views                   │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Policy Graph Insights | Prior Auth Analytics   │  │
│  └─────────────────────────────────────────────────┘  │
└───────────────┬───────────────────────────────────────┘
                │
                ↓ (Power BI / Arthur AI Dashboard)
┌───────────────▼───────────────────────────────────────┐
│          Arthur AI Assistant Interface                │
└───────────────────────────────────────────────────────┘
```

### 13.4 Integration Effort Estimate

**Phase 1: POC (2-3 weeks)**
- [ ] Set up Neo4j and Graphiti locally
- [ ] Define custom entity types (Policy, Coverage, PriorAuth)
- [ ] Manual data export from Synapse
- [ ] Ingest sample policies into Graphiti
- [ ] Test queries via Python SDK
- [ ] Validate performance and accuracy

**Phase 2: MVP Integration (4-6 weeks)**
- [ ] Deploy Graphiti as microservice (Docker/K8s)
- [ ] Implement Azure Data Factory ETL pipeline
- [ ] Schedule incremental sync (daily/hourly)
- [ ] Build REST API wrapper for Arthur AI frontend
- [ ] Add monitoring and logging
- [ ] Security: Authentication, authorization, PHI encryption

**Phase 3: Production (6-8 weeks)**
- [ ] Migrate to FalkorDB for better performance
- [ ] Implement CDC via Azure Event Hubs
- [ ] Add reverse ETL for BI reporting
- [ ] Scale to multi-tenant architecture
- [ ] HIPAA compliance audit
- [ ] Performance testing and optimization
- [ ] Disaster recovery and backup

**Total Estimated Effort:** 12-17 weeks (3-4 months)

**Estimated Cost:**
- Development: 500-700 hours ($75K-$105K at $150/hr)
- Infrastructure: $2K-$5K/month (Azure services + Neo4j)
- LLM API Costs: $500-$2K/month (depends on volume)

### 13.5 Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Event loop conflicts in production | High | Deploy as separate microservice |
| LLM rate limiting affects throughput | Medium | Use Azure OpenAI provisioned throughput |
| PHI exposure to third-party LLMs | High | Use Azure OpenAI with BAA + VNet |
| Limited production observability | Medium | Build custom monitoring with DataDog/New Relic |
| Schema evolution breaks entity extraction | Medium | Version control entity types, test thoroughly |
| Synapse → Graphiti sync latency | Low | Implement CDC for near real-time sync |

---

## 14. Final Recommendations

### 14.1 For Healthcare Analytics

**✅ RECOMMEND if:**
- Building AI assistant for policy analysis (Arthur Health use case)
- Need temporal reasoning and historical queries
- Care coordination and referral management
- Complex relationship modeling (patients, providers, facilities)
- Sub-second query latency required

**⚠️ CAUTION if:**
- Large enterprise deployment (>10M patients) - use FalkorDB
- Need strong HIPAA compliance features - custom security layer required
- Limited DevOps resources - event loop issues require microservice pattern
- Real-time ICU monitoring - LLM latency may be too high

**❌ DO NOT USE if:**
- Simple CRUD operations - relational DB better
- Batch analytics only - Synapse alone sufficient
- Cannot use cloud LLM providers - self-hosted models may not work well

### 14.2 For Microsoft Synapse Integration

**Feasibility Score: 8/10**

**Integration is HIGHLY VIABLE:**
- Multiple proven patterns (ADF ETL, CDC, Reverse ETL)
- Neo4j has mature Azure integrations
- Event Hubs enables near real-time sync
- CData provides commercial off-the-shelf solution

**Best Approach:**
1. **Short-term:** ADF scheduled ETL (daily/hourly)
2. **Long-term:** CDC via Event Hubs for real-time updates
3. **Reporting:** Reverse ETL to Synapse for Power BI integration

### 14.3 Graphiti vs. LightRAG Decision

**Choose Graphiti if:**
- Temporal reasoning is critical (medication changes, care progression)
- Building conversational agent with long-term memory
- Need audit trail and historical context
- Knowledge evolves dynamically over time

**Choose LightRAG if:**
- Primary use case is document Q&A over static corpus
- Need fastest possible query response times
- Cost-sensitive deployment (fewer LLM calls)
- Don't require historical versioning

**For Arthur Health:** Graphiti is the better fit due to temporal policy tracking and care coordination requirements.

---

## 15. Additional Resources

### 15.1 Official Documentation
- **GitHub Repository:** https://github.com/getzep/graphiti
- **Documentation:** https://help.getzep.com/graphiti/
- **Research Paper:** [Zep: A Temporal Knowledge Graph Architecture for Agent Memory](https://arxiv.org/html/2501.13956v1)
- **Blog:** https://blog.getzep.com/
- **Neo4j Article:** [Graphiti: Knowledge Graph Memory for an Agentic World](https://neo4j.com/blog/developer/graphiti-knowledge-graph-memory/)

### 15.2 Community and Support
- **GitHub Issues:** https://github.com/getzep/graphiti/issues
- **Discord:** (Check repository for invite link)
- **PyPI:** https://pypi.org/project/graphiti-core/

### 15.3 Related Technologies
- **Neo4j:** https://neo4j.com/
- **FalkorDB:** https://www.falkordb.com/
- **LightRAG:** https://github.com/HKUDS/LightRAG
- **Model Context Protocol (MCP):** https://docs.anthropic.com/en/docs/mcp

### 15.4 Healthcare Knowledge Graphs
- [EHR-based Medical Knowledge Graphs: A Literature Study](https://www.sciencedirect.com/science/article/pii/S1532046423001247)
- [Learning Health Knowledge Graphs from EMR](https://www.nature.com/articles/s41598-017-05778-z)
- [Knowledge Graphs for Healthcare: Resources and Promises](https://arxiv.org/html/2306.04802v4)

---

## 16. Conclusion

Graphiti represents a significant advancement in knowledge graph technology for AI agents, particularly excelling in temporal reasoning and dynamic knowledge evolution. For the Arthur Health Intelligence Platform, Graphiti offers compelling capabilities for insurance policy analysis, care coordination, and provider network optimization.

**Key Strengths:**
- State-of-the-art agent memory with temporal awareness
- Sub-second query latency for real-time decision support
- Flexible architecture supporting multiple graph databases
- Strong LLM ecosystem integration
- Active development and growing community

**Key Limitations:**
- Production stability issues (event loop conflicts)
- Limited enterprise features (security, monitoring)
- HIPAA compliance requires custom implementation
- Relatively new technology with limited large-scale deployments

**Integration with Microsoft Synapse:**
- **Highly feasible** via Azure Data Factory, Event Hubs, and reverse ETL patterns
- Estimated 3-4 month implementation timeline
- Requires microservice architecture to avoid event loop conflicts
- Best deployed on Azure with FalkorDB for optimal performance

**Final Verdict:** Graphiti is a strong candidate for Arthur Health's knowledge graph requirements, particularly for policy analysis and care coordination use cases. The temporal reasoning capabilities align well with healthcare's need for historical context and audit trails. However, production deployment requires careful architecture planning (microservice pattern) and custom security implementation for HIPAA compliance.

**Recommended Next Steps:**
1. Build POC with sample insurance policies
2. Evaluate query accuracy and performance
3. Design microservice architecture
4. Implement Synapse integration prototype
5. Conduct security and compliance review
6. Pilot with limited production workload

---

**Report Prepared By:** Claude (Anthropic)
**Research Methodology:** Web search, documentation analysis, technical paper review
**Last Updated:** October 13, 2025
**Version:** 1.0
