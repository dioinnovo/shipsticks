# MVP Testing Safety & Isolation Plan
## Ensuring Zero Impact on Existing ArthurPro/LightRAG Implementation

**Date**: January 13, 2025
**Priority**: 🔴 CRITICAL - Must Not Break Production
**Status**: Pre-Implementation Safety Checklist

---

## 🎯 Primary Objective

**Test the hybrid GraphRAG architecture (MIMIC-IV → SQL → Schema Discovery → Neo4j → Text2Cypher) in a completely isolated environment that CANNOT affect the existing ArthurPro POC using LightRAG.**

---

## 🚨 Current Production State Analysis

### Existing LightRAG Implementation
**Route**: `/api/assistant/knowledge-graph` (LINE 14-60)
- **Purpose**: ArthurPro POC knowledge graph queries
- **Technology**: LightRAG (Python) running on `localhost:9621`
- **Status**: Active with fallback to mock data
- **Used By**: Production ArthurPro interface
- **Critical**: ❌ **DO NOT MODIFY THIS FILE**

### Existing GraphRAG Routes (Already Created, Safe)
**Route**: `/api/graphrag/query` and `/api/graphrag/gaps`
- **Purpose**: New architecture (Text2Cypher + Neo4j)
- **Technology**: LangChain + Neo4j
- **Status**: Created but NOT connected to production
- **Used By**: ❌ Nothing yet
- **Safe**: ✅ **Can modify freely - isolated from ArthurPro**

---

## ✅ Isolation Strategy

### 1. Separate Databases (NO COLLISION)

#### Production ArthurPro Data
```
LightRAG Python Service
├── localhost:9621
├── Own vector store
├── Own graph structure
└── workspace: 'hospital_treatment_kb'
```

#### MVP Test Environment (Isolated)
```
PostgreSQL (MIMIC Data)
├── localhost:5432
├── Database: mimic_fhir
└── Container: mimic-postgres

Neo4j (Test Graph)
├── localhost:7687 (bolt)
├── localhost:7474 (browser)
├── Database: neo4j
└── Container: mimic-neo4j
```

**✅ ZERO OVERLAP** - Different ports, different containers, different data

---

### 2. Separate API Routes (NO COLLISION)

#### Production Routes (DO NOT TOUCH)
```typescript
/api/assistant/knowledge-graph  ❌ ArthurPro POC (LightRAG)
/api/assistant/unified          ❌ Main assistant
/api/assistant/chat             ❌ Production chat
/api/orchestrate/*              ❌ Production orchestration
```

#### MVP Test Routes (SAFE TO USE)
```typescript
/api/graphrag/query             ✅ MVP Text2Cypher (isolated)
/api/graphrag/gaps              ✅ MVP gap detection (isolated)
/api/graphrag/test              ✅ NEW - MVP testing endpoint
```

#### NEW Isolated Testing Route (To Be Created)
```typescript
/api/mvp/query                  ✅ Dedicated MVP endpoint
/api/mvp/health                 ✅ MVP health check
/api/mvp/schema                 ✅ MVP schema info
```

**✅ ZERO OVERLAP** - Different route prefixes

---

### 3. Separate Environment Variables (NO COLLISION)

#### Production Environment (DO NOT MODIFY)
```bash
# .env.local (existing)
AZURE_OPENAI_API_KEY=...        # Used by ArthurPro
OPENAI_API_KEY=...              # Used by production
ANTHROPIC_API_KEY=...           # Used by production
```

#### MVP Test Environment (NEW VARIABLES)
```bash
# .env.local (ADD these without removing existing)

# MVP PostgreSQL (MIMIC Data)
MVP_DATABASE_URL="postgresql://postgres:test@localhost:5432/mimic_fhir"

# MVP Neo4j (Test Graph)
MVP_NEO4J_URI="bolt://localhost:7687"
MVP_NEO4J_USERNAME="neo4j"
MVP_NEO4J_PASSWORD="mvp_password"

# MVP LLM (Can share Azure OpenAI or use separate key)
MVP_AZURE_OPENAI_KEY="${AZURE_OPENAI_API_KEY}"  # Reuse if desired
MVP_AZURE_OPENAI_DEPLOYMENT="gpt-4o"
```

**✅ ZERO OVERLAP** - Prefixed with `MVP_*`

---

### 4. Separate Docker Containers (NO COLLISION)

#### Production (May Exist - Don't Know)
```bash
# Existing containers (if any)
# We won't touch these
```

#### MVP Test Containers (NEW)
```bash
# PostgreSQL for MIMIC data
docker run --name mimic-postgres-mvp \
  -e POSTGRES_PASSWORD=test \
  -e POSTGRES_DB=mimic_fhir \
  -p 5432:5432 \
  -d postgres:16

# Neo4j for test graph
docker run --name mimic-neo4j-mvp \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/mvp_password \
  -e NEO4J_PLUGINS='["apoc"]' \
  -d neo4j:5.15
```

**Port Check Before Starting**:
```bash
# Check if ports are in use
lsof -i :5432  # PostgreSQL port
lsof -i :7687  # Neo4j bolt port
lsof -i :7474  # Neo4j HTTP port

# If any are in use, use different ports:
# PostgreSQL: 5433
# Neo4j Bolt: 7688
# Neo4j HTTP: 7475
```

**✅ ZERO OVERLAP** - Separate containers with unique names

---

### 5. Separate Code Modules (NO COLLISION)

#### Production Code (DO NOT MODIFY)
```
❌ app/api/assistant/knowledge-graph/route.ts  (LightRAG)
❌ app/api/assistant/unified/route.ts          (Production)
❌ lib/lightrag/*                              (If exists)
```

#### MVP Code (SAFE TO CREATE/MODIFY)
```
✅ lib/fhir/*                                   (NEW - FHIR parsing)
✅ lib/graphrag/*                               (Existing - isolated)
✅ scripts/mimic-*                              (NEW - MVP scripts)
✅ sql/mimic-schema.sql                         (NEW - MVP schema)
✅ app/api/mvp/*                                (NEW - MVP routes)
✅ app/api/graphrag/*                           (Existing - safe)
```

**✅ ZERO OVERLAP** - Separate directories

---

## 🔒 Safety Checklist Before Starting

### Pre-Flight Checks
- [ ] **Verify production is running**: Test `/api/assistant/knowledge-graph` still works
- [ ] **Check port availability**: Ensure 5432, 7474, 7687 are free
- [ ] **Backup .env.local**: `cp .env.local .env.local.backup`
- [ ] **Create Git branch**: `git checkout -b mvp-testing`
- [ ] **Document current state**: Take screenshots of working ArthurPro

### During Implementation
- [ ] **Never edit existing API routes** (`/api/assistant/*`, `/api/orchestrate/*`)
- [ ] **Only use MVP-prefixed env vars**
- [ ] **Only create NEW files** (no modifications to production code)
- [ ] **Test production after each step** (ensure `/api/assistant/knowledge-graph` still works)

### Post-Implementation
- [ ] **Production still works**: Test ArthurPro POC functions
- [ ] **MVP isolated**: Test MVP routes separately
- [ ] **Can toggle between systems**: Switch is clean
- [ ] **Rollback ready**: Can revert changes if needed

---

## 🔄 Safe Testing Workflow

### Step 1: Verify Production Baseline
```bash
# Test ArthurPro POC still works
curl -X POST http://localhost:3000/api/assistant/knowledge-graph \
  -H "Content-Type: application/json" \
  -d '{"query": "test query"}'

# Expected: Response (either from LightRAG or mock fallback)
# If this fails, STOP - don't proceed with MVP
```

### Step 2: Start MVP Containers
```bash
# Start PostgreSQL (MVP)
docker run --name mimic-postgres-mvp \
  -e POSTGRES_PASSWORD=test \
  -e POSTGRES_DB=mimic_fhir \
  -p 5432:5432 \
  -d postgres:16

# Start Neo4j (MVP)
docker run --name mimic-neo4j-mvp \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/mvp_password \
  -e NEO4J_PLUGINS='["apoc"]' \
  -d neo4j:5.15

# Test containers running
docker ps | grep mvp
```

### Step 3: Verify Production Still Works
```bash
# Test ArthurPro POC AGAIN
curl -X POST http://localhost:3000/api/assistant/knowledge-graph \
  -H "Content-Type: application/json" \
  -d '{"query": "test query"}'

# Expected: Still works (containers don't affect it)
```

### Step 4: Add MVP Environment Variables
```bash
# Edit .env.local - ADD these lines (don't remove existing)
echo "" >> .env.local
echo "# MVP Testing Environment (Isolated)" >> .env.local
echo "MVP_DATABASE_URL=\"postgresql://postgres:test@localhost:5432/mimic_fhir\"" >> .env.local
echo "MVP_NEO4J_URI=\"bolt://localhost:7687\"" >> .env.local
echo "MVP_NEO4J_USERNAME=\"neo4j\"" >> .env.local
echo "MVP_NEO4J_PASSWORD=\"mvp_password\"" >> .env.local
```

### Step 5: Create MVP Code (NEW Files Only)
```bash
# Create NEW directories
mkdir -p lib/fhir
mkdir -p app/api/mvp
mkdir -p sql

# Create NEW files (don't touch existing production files)
touch lib/fhir/fhir-parser.ts
touch app/api/mvp/query/route.ts
touch sql/mimic-schema.sql
touch scripts/mimic-fhir-to-sql.ts
```

### Step 6: Verify Production STILL Works
```bash
# Restart Next.js dev server
npm run dev

# Test ArthurPro POC AGAIN
curl -X POST http://localhost:3000/api/assistant/knowledge-graph \
  -H "Content-Type: application/json" \
  -d '{"query": "test query"}'

# Expected: Still works (new files don't affect it)
```

### Step 7: Test MVP Routes (Isolated)
```bash
# Test NEW MVP endpoint
curl -X POST http://localhost:3000/api/mvp/query \
  -H "Content-Type: application/json" \
  -d '{"question": "test mvp"}'

# Expected: MVP-specific response (isolated from production)
```

---

## 🚦 Rollback Strategy

### If Something Breaks Production

#### Immediate Rollback (< 1 minute)
```bash
# 1. Stop Docker containers
docker stop mimic-postgres-mvp mimic-neo4j-mvp

# 2. Restore original .env.local
cp .env.local.backup .env.local

# 3. Restart Next.js
npm run dev

# 4. Verify production works
curl -X POST http://localhost:3000/api/assistant/knowledge-graph \
  -H "Content-Type: application/json" \
  -d '{"query": "test query"}'
```

#### Full Rollback (< 5 minutes)
```bash
# 1. Git revert to before MVP changes
git checkout main
git branch -D mvp-testing

# 2. Remove Docker containers
docker rm -f mimic-postgres-mvp mimic-neo4j-mvp

# 3. Clean environment
cp .env.local.backup .env.local

# 4. Restart
npm run dev
```

---

## 🔀 Safe Switch Strategy (When MVP Ready)

### Phase 1: Side-by-Side (Both Systems Running)
```typescript
// Frontend can choose which system to use
const useNewGraphRAG = process.env.NEXT_PUBLIC_USE_MVP_GRAPHRAG === 'true';

if (useNewGraphRAG) {
  // Call /api/mvp/query (new system)
  response = await fetch('/api/mvp/query', { ... });
} else {
  // Call /api/assistant/knowledge-graph (LightRAG)
  response = await fetch('/api/assistant/knowledge-graph', { ... });
}
```

### Phase 2: Feature Flag (Safe Toggle)
```bash
# .env.local
NEXT_PUBLIC_USE_MVP_GRAPHRAG=false  # Production (LightRAG)
NEXT_PUBLIC_USE_MVP_GRAPHRAG=true   # MVP Testing (New)
```

### Phase 3: Route Swap (When Validated)
```typescript
// Only AFTER MVP fully validated and approved
// Rename routes:
// OLD: /api/assistant/knowledge-graph → /api/assistant/knowledge-graph-legacy
// NEW: /api/mvp/query → /api/assistant/knowledge-graph

// This way, frontend code doesn't change
// But backend switches to new system
```

---

## 📊 Continuous Monitoring During MVP Testing

### Health Check Script
```bash
#!/bin/bash
# scripts/check-production-health.sh

echo "🏥 Checking ArthurPro Production Health..."

# Test LightRAG endpoint
response=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST http://localhost:3000/api/assistant/knowledge-graph \
  -H "Content-Type: application/json" \
  -d '{"query": "health check"}')

if [ $response -eq 200 ]; then
  echo "✅ Production ArthurPro: HEALTHY"
else
  echo "❌ Production ArthurPro: FAILING (HTTP $response)"
  echo "🚨 STOP MVP TESTING - Production is down!"
  exit 1
fi

# Test MVP endpoint (if exists)
mvp_response=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST http://localhost:3000/api/mvp/query \
  -H "Content-Type: application/json" \
  -d '{"question": "health check"}' 2>/dev/null)

if [ $mvp_response -eq 200 ]; then
  echo "✅ MVP System: HEALTHY"
elif [ $mvp_response -eq 000 ]; then
  echo "⚠️  MVP System: NOT YET DEPLOYED (expected)"
else
  echo "⚠️  MVP System: ERROR (HTTP $mvp_response)"
fi

echo ""
echo "📊 Summary:"
echo "  Production: OK"
echo "  MVP: $([ $mvp_response -eq 200 ] && echo 'OK' || echo 'Pending')"
```

Run this script **after every MVP implementation step**:
```bash
chmod +x scripts/check-production-health.sh
./scripts/check-production-health.sh
```

---

## 🎯 Success Criteria for Safe Testing

### MVP is Successfully Isolated When:
- [ ] ✅ ArthurPro POC (`/api/assistant/knowledge-graph`) still works
- [ ] ✅ MVP routes (`/api/mvp/*`) work independently
- [ ] ✅ Can run MVP tests without affecting production
- [ ] ✅ Can stop MVP containers and production is unaffected
- [ ] ✅ Can toggle between systems with environment variable
- [ ] ✅ Can rollback in <1 minute if needed

### Production is Safe When:
- [ ] ✅ All existing API routes respond correctly
- [ ] ✅ LightRAG (if running) is unaffected
- [ ] ✅ No shared databases or containers
- [ ] ✅ No environment variable conflicts
- [ ] ✅ Can deploy MVP to production without breaking changes

---

## 📝 Implementation Order (Safe Steps)

### Safe Order of Operations:
1. ✅ **Create safety documentation** (this file) - DONE
2. ✅ **Backup .env.local** - Risk: ZERO
3. ✅ **Create Git branch** - Risk: ZERO
4. ✅ **Start MVP Docker containers** - Risk: ZERO (isolated)
5. ✅ **Add MVP environment variables** - Risk: ZERO (prefixed)
6. ✅ **Create NEW files only** - Risk: ZERO (no existing file edits)
7. ✅ **Test MVP routes** - Risk: ZERO (isolated endpoints)
8. ✅ **Load MIMIC data** - Risk: ZERO (separate database)
9. ✅ **Test schema discovery** - Risk: ZERO (isolated process)
10. ✅ **Test Neo4j loading** - Risk: ZERO (separate container)
11. ✅ **Test Text2Cypher** - Risk: ZERO (isolated API)
12. ✅ **Compare results** - Risk: ZERO (observation only)
13. ⚠️  **Consider switch** - Risk: MEDIUM (requires approval)

---

## 🚨 RED FLAGS - Stop Immediately If:

### During Implementation
- ❌ Production endpoint returns errors
- ❌ Need to modify existing `/api/assistant/*` files
- ❌ Port conflicts with existing services
- ❌ Environment variables break production
- ❌ Can't rollback cleanly

### If Any Red Flag Occurs:
1. **STOP** all MVP work immediately
2. **ROLLBACK** using rollback strategy above
3. **VERIFY** production works
4. **ANALYZE** what went wrong
5. **REVISE** safety plan
6. **RETRY** with better isolation

---

## ✅ Final Safety Checklist

Before proceeding with MVP implementation:

### Environment Safety
- [ ] Backed up `.env.local`
- [ ] Created Git branch `mvp-testing`
- [ ] Documented current production state
- [ ] Verified ports 5432, 7474, 7687 available

### Code Safety
- [ ] Will NOT modify `/api/assistant/knowledge-graph/route.ts`
- [ ] Will NOT modify `/api/assistant/unified/route.ts`
- [ ] Will NOT modify existing production routes
- [ ] Will ONLY create NEW files with MVP prefix

### Testing Safety
- [ ] Can test production independently
- [ ] Can test MVP independently
- [ ] Can rollback in <1 minute
- [ ] Have monitoring script ready

### Approval Safety
- [ ] Team aware of MVP testing
- [ ] Rollback plan communicated
- [ ] Production backup exists
- [ ] Feature flag strategy defined

---

## 📚 Related Documentation

- `MVP_IMPLEMENTATION_GUIDE.md` - Step-by-step implementation
- `HYBRID_ARCHITECTURE_SUMMARY.md` - Architecture overview
- `IMPLEMENTATION_STATUS.md` - Current system status

---

**Last Updated**: January 13, 2025
**Status**: ✅ Ready for Safe Implementation
**Risk Level**: 🟢 LOW (with proper isolation)
**Rollback Time**: < 1 minute

---

**REMEMBER**: We're testing an architecture pattern, not replacing production. Both systems can coexist safely. When MVP is validated, we switch - not before.
