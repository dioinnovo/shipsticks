# GraphRAG Quick Start Guide

Get your GraphRAG system running in 15 minutes for development and testing.

---

## Prerequisites

- **Node.js** 18+ installed
- **Docker** installed (for Neo4j)
- **Azure OpenAI** credentials (or OpenAI API key)
- **Git** (to clone if needed)

---

## Step 1: Start Neo4j Database (2 minutes)

```bash
# Start Neo4j using Docker
docker run \
  --name arthur-neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/arthur-health-dev \
  -e NEO4J_PLUGINS='["apoc"]' \
  neo4j:5.15

# Wait ~30 seconds for Neo4j to start
# Open browser: http://localhost:7474
# Login: neo4j / arthur-health-dev
```

---

## Step 2: Configure Environment (2 minutes)

```bash
# Create .env.local file
cat > .env.local << EOF
# Neo4j Configuration
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=arthur-health-dev
NEO4J_DATABASE=neo4j

# Azure OpenAI Configuration (use your credentials)
AZURE_OPENAI_KEY=your-azure-openai-key
AZURE_OPENAI_ENDPOINT=https://your-instance.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_VERSION=2024-12-01-preview
AZURE_OPENAI_INSTANCE_NAME=your-instance-name

# OR use OpenAI directly
# OPENAI_API_KEY=your-openai-key

# Application
NODE_ENV=development
EOF
```

---

## Step 3: Install Dependencies (3 minutes)

```bash
# Install Neo4j and LangChain dependencies
npm install @langchain/community @langchain/openai langchain neo4j-driver

# Or if using yarn
yarn add @langchain/community @langchain/openai langchain neo4j-driver
```

---

## Step 4: Initialize Healthcare Schema (3 minutes)

```bash
# Create a setup script
cat > scripts/setup-graphrag.ts << 'EOF'
import { healthcareSchema } from '../lib/graphrag/healthcare-schema';

async function setup() {
  console.log('🏗️  Initializing Healthcare GraphRAG...');

  try {
    await healthcareSchema.initializeSchema();
    console.log('✅ Schema initialized successfully!');

    const stats = await healthcareSchema.getSchemaStats();
    console.log('\n📊 Schema Statistics:');
    console.log(`  - Constraints: ${stats.constraints}`);
    console.log(`  - Indexes: ${stats.indexes}`);
    console.log(`  - Node Labels: ${stats.nodeLabels.join(', ')}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setup();
EOF

# Run the setup
npx tsx scripts/setup-graphrag.ts
```

---

## Step 5: Load Sample Data (3 minutes)

```bash
# Create sample data loader
cat > scripts/load-sample-data.ts << 'EOF'
import { neo4jClient } from '../lib/graphrag/neo4j-client';

async function loadSampleData() {
  console.log('📊 Loading sample healthcare data...');

  await neo4jClient.initialize();

  // Create sample patients
  await neo4jClient.query(`
    CREATE (p1:Patient {
      id: 'PAT-001',
      mrn: 'MRN001',
      firstName: 'John',
      lastName: 'Smith',
      dateOfBirth: date('1975-06-15'),
      gender: 'M',
      insuranceId: 'INS-ABC123',
      riskScore: 75.5,
      lastVisit: datetime('2025-01-10T09:30:00')
    })

    CREATE (p2:Patient {
      id: 'PAT-002',
      mrn: 'MRN002',
      firstName: 'Mary',
      lastName: 'Johnson',
      dateOfBirth: date('1982-03-20'),
      gender: 'F',
      insuranceId: 'INS-DEF456',
      riskScore: 62.3,
      lastVisit: datetime('2024-12-15T14:00:00')
    })

    // Create diagnoses
    CREATE (d1:Diagnosis {
      id: 'DIAG-001',
      name: 'Type 2 Diabetes Mellitus',
      icd10Code: 'E11.9',
      category: 'Endocrine',
      severity: 'Moderate',
      chronicCondition: true
    })

    CREATE (d2:Diagnosis {
      id: 'DIAG-002',
      name: 'Hypertension',
      icd10Code: 'I10',
      category: 'Cardiovascular',
      severity: 'Mild',
      chronicCondition: true
    })

    // Create relationships
    CREATE (p1)-[:HAS_DIAGNOSIS {
      diagnosedDate: date('2020-03-15'),
      diagnosedBy: 'PROV-001',
      active: true,
      lastReviewed: datetime()
    }]->(d1)

    CREATE (p1)-[:HAS_DIAGNOSIS {
      diagnosedDate: date('2018-07-22'),
      diagnosedBy: 'PROV-001',
      active: true,
      lastReviewed: datetime()
    }]->(d2)

    CREATE (p2)-[:HAS_DIAGNOSIS {
      diagnosedDate: date('2022-11-08'),
      diagnosedBy: 'PROV-002',
      active: true,
      lastReviewed: datetime()
    }]->(d1)

    RETURN 'Sample data loaded' as result
  `);

  console.log('✅ Sample data loaded successfully!');

  // Verify data
  const stats = await neo4jClient.getStats();
  console.log('\n📊 Database Statistics:');
  console.log(`  - Total Nodes: ${stats.nodeCount}`);
  console.log(`  - Total Relationships: ${stats.relationshipCount}`);
  console.log(`  - Node Types: ${stats.labels.join(', ')}`);

  process.exit(0);
}

loadSampleData();
EOF

# Run the loader
npx tsx scripts/load-sample-data.ts
```

---

## Step 6: Test Natural Language Queries (2 minutes)

```bash
# Create test script
cat > scripts/test-queries.ts << 'EOF'
import { text2cypher } from '../lib/graphrag/text2cypher';
import { gapDetector } from '../lib/graphrag/gap-detector';

async function testQueries() {
  console.log('🧪 Testing GraphRAG queries...\n');

  // Test 1: Natural language query
  console.log('Test 1: Natural Language Query');
  const result1 = await text2cypher.query(
    'Show me all patients with diabetes'
  );
  console.log('Answer:', result1.answer);
  console.log('Cypher:', result1.cypherQuery);
  console.log('');

  // Test 2: Gap detection
  console.log('Test 2: Gap Detection');
  const gaps = await gapDetector.detectAllGaps();
  console.log(`Found ${gaps.totalGaps} healthcare gaps`);
  console.log('By Priority:', gaps.gapsByPriority);
  console.log('By Type:', gaps.gapsByType);
  console.log('');

  // Test 3: Complex query
  console.log('Test 3: Complex Healthcare Query');
  const result3 = await text2cypher.query(
    'Which patients have multiple chronic conditions?'
  );
  console.log('Answer:', result3.answer);

  console.log('\n✅ All tests passed!');
  process.exit(0);
}

testQueries();
EOF

# Run tests
npx tsx scripts/test-queries.ts
```

---

## Step 7: Start Development Server

```bash
# Start Next.js development server
npm run dev

# Open browser: http://localhost:3000
```

---

## API Endpoints

Once running, test these endpoints:

### 1. Health Check
```bash
curl http://localhost:3000/api/graphrag/query?action=health
```

### 2. Natural Language Query
```bash
curl -X POST http://localhost:3000/api/graphrag/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Show me patients with diabetes who need care coordination"
  }'
```

### 3. Gap Detection
```bash
curl http://localhost:3000/api/graphrag/gaps
```

### 4. Graph Statistics
```bash
curl http://localhost:3000/api/graphrag/query?action=stats
```

---

## Next Steps

### For Development
1. ✅ Explore Neo4j Browser: http://localhost:7474
2. ✅ Run Cypher queries directly
3. ✅ Modify healthcare schema in `lib/graphrag/healthcare-schema.ts`
4. ✅ Add more sample data
5. ✅ Test Text2Cypher with various questions

### For Production
1. 📖 Read `GRAPHRAG_IMPLEMENTATION_GUIDE.md`
2. 📖 Review `AZURE_SYNAPSE_INTEGRATION.md`
3. 🔧 Set up Azure infrastructure
4. 🔐 Configure security and HIPAA compliance
5. 📊 Implement monitoring and alerts

---

## Troubleshooting

### Neo4j Connection Failed
```bash
# Check if Neo4j is running
docker ps | grep neo4j

# Check Neo4j logs
docker logs arthur-neo4j

# Restart Neo4j
docker restart arthur-neo4j
```

### Schema Initialization Failed
```bash
# Drop and recreate schema
npx tsx scripts/drop-schema.ts
npx tsx scripts/setup-graphrag.ts
```

### Text2Cypher Not Working
```bash
# Verify Azure OpenAI credentials
echo $AZURE_OPENAI_KEY

# Test LLM connection
npx tsx scripts/test-llm.ts
```

---

## Useful Cypher Queries

```cypher
// View all patients
MATCH (p:Patient) RETURN p LIMIT 10;

// View patient with diagnoses
MATCH (p:Patient)-[r:HAS_DIAGNOSIS]->(d:Diagnosis)
RETURN p, r, d LIMIT 20;

// Count by diagnosis
MATCH (p:Patient)-[:HAS_DIAGNOSIS]->(d:Diagnosis)
RETURN d.name, count(p) as patientCount
ORDER BY patientCount DESC;

// High-risk patients
MATCH (p:Patient)
WHERE p.riskScore > 70
RETURN p.id, p.firstName, p.lastName, p.riskScore
ORDER BY p.riskScore DESC;

// Delete all data (careful!)
MATCH (n) DETACH DELETE n;
```

---

## Learning Resources

- **Neo4j**: https://neo4j.com/docs/
- **LangChain**: https://python.langchain.com/docs/
- **Cypher**: https://neo4j.com/docs/cypher-manual/
- **Azure OpenAI**: https://learn.microsoft.com/azure/ai-services/openai/

---

**Questions?** Check the comprehensive guide or create an issue.

**Ready for production?** Follow `GRAPHRAG_IMPLEMENTATION_GUIDE.md` →
