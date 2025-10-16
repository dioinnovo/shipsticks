# AI Agent Context Index
## Essential Documents for Understanding Arthur Health MVP Implementation

**Date**: January 13, 2025
**Purpose**: Provide AI agents with complete context of project status and next steps
**Last Updated**: January 13, 2025

---

## 📚 Document Reading Order (Chronological Understanding)

### Phase 1: Understanding the Project
Read these documents in order to understand what Arthur Health is building:

#### 1. **Project Overview & Architecture**
```
File: CLAUDE.md
Purpose: High-level overview of Arthur Health platform
Key Info:
- Next.js 15.5.2 healthcare platform
- AI-powered policy analysis and care coordination
- Current tech stack and structure
- Development commands
Status: Current production state
```

#### 2. **Current Architecture**
```
File: docs/ARCHITECTURE.md
Purpose: System architecture overview
Key Info:
- Component relationships
- Data flow
- Integration points
Status: Production architecture
```

---

### Phase 2: Understanding GraphRAG Context

#### 3. **GraphRAG Research & Decision**
```
File: GRAPHITI_RESEARCH_REPORT.md
Purpose: Research on different GraphRAG approaches
Key Info:
- LightRAG vs Graphiti vs LangChain comparison
- Why hybrid approach was chosen
- Technical trade-offs
Context: Background research that led to current decisions
```

#### 4. **Current GraphRAG Implementation Status**
```
File: docs/IMPLEMENTATION_STATUS.md
Purpose: What's been implemented so far
Key Info:
- LangChain chosen over LightRAG/Graphiti
- Text2Cypher implementation complete
- Gap detection framework ready
- Synapse integration pending
Status: Pre-MVP state (before MIMIC-IV testing)
```

#### 5. **Text2Cypher Improvements**
```
File: docs/TEXT2CYPHER_IMPROVEMENTS.md
Purpose: LangChain best practices applied
Key Info:
- Schema refresh requirements
- topK parameter for result limiting
- Validation methods added
- Performance optimizations
Status: Complete and validated
```

---

### Phase 3: Understanding the Architecture Pivot

#### 6. **CRITICAL: Hybrid Architecture Summary**
```
File: docs/HYBRID_ARCHITECTURE_SUMMARY.md
Purpose: ⚠️ ARCHITECTURAL REDESIGN - Must read!
Key Info:
- Original approach flaws identified
- Why rigid schemas don't work
- LLM-driven schema discovery approach
- Hybrid extraction strategy (structured + unstructured)
- Temporal graph patterns (Graphiti-inspired)
- Incremental updates without recomputation
Critical Sections:
- Lines 8-24: Critical issues in original approach
- Lines 27-91: New hybrid architecture diagram
- Lines 95-151: Key improvements explained
- Lines 256-275: Implementation files created
Status: ✅ CURRENT ARCHITECTURE (supersedes previous approaches)
```

**Why This Document is Critical:**
- Explains the fundamental shift from predefined schemas to LLM discovery
- Details how foreign keys become relationships automatically
- Shows how to avoid full graph recomputation
- This is the architecture we're now implementing with MIMIC-IV

---

### Phase 4: Understanding MVP Testing Strategy

#### 7. **MVP Implementation Guide** (PRIMARY REFERENCE)
```
File: docs/MVP_IMPLEMENTATION_GUIDE.md
Purpose: 📋 Complete step-by-step MVP checklist
Key Info:
- MVP objectives (testing architecture, not healthcare specifics)
- MIMIC-IV FHIR dataset details (100 patients, 49.5 MB)
- Phase 1: Data Preparation (SQL setup)
- Phase 2: Schema Discovery (LLM-driven)
- Phase 3: Knowledge Graph Construction
- Phase 4: Validation & Testing
- Step-by-step checklist with validation criteria
- Success criteria and metrics
- Reusability for other industries
Critical Sections:
- Lines 9-19: MVP objectives (what we're testing)
- Lines 21-36: Test dataset details
- Lines 95-599: Complete implementation checklist
- Lines 601-648: Success criteria
Status: 🚧 READY TO EXECUTE - Current implementation plan
```

**Why This Document is Primary:**
- Complete checklist format with validation steps
- Detailed commands and queries for each phase
- Industry-agnostic architecture pattern
- Reference document during implementation

#### 8. **Safety & Isolation Plan** (CRITICAL FOR EXECUTION)
```
File: docs/MVP_SAFETY_ISOLATION_PLAN.md
Purpose: 🔒 Ensure MVP doesn't break production ArthurPro
Key Info:
- Existing LightRAG implementation analysis
- Complete isolation strategy (databases, routes, env vars)
- Safety guarantees (what will NOT be modified)
- Rollback strategy (<1 minute)
- Continuous monitoring during testing
- Safe switch strategy when MVP ready
Critical Sections:
- Lines 11-20: Current production state (LightRAG)
- Lines 22-76: Isolation strategy details
- Lines 242-286: Rollback strategy
- Lines 288-328: Safe switch strategy
- Lines 413-441: Safety checklist
Status: 🔴 MUST READ before making any changes
```

**Why This Document is Critical:**
- Prevents breaking existing ArthurPro POC
- Defines what files CANNOT be touched
- Provides rollback if something goes wrong
- Essential for safe testing

---

### Phase 5: Supporting Technical Documentation

#### 9. **GraphRAG Summary**
```
File: docs/GRAPHRAG_SUMMARY.md
Purpose: Overview of GraphRAG implementation
Key Info:
- Natural language to Cypher conversion
- Healthcare ontology (7 node types, 7 relationships)
- Synapse integration options (ETL vs real-time CDC)
- Quick start guide
- Cost estimation
Status: Reference for GraphRAG features
```

#### 10. **Entity Extraction Comparison**
```
File: docs/ENTITY_EXTRACTION_COMPARISON.md
Purpose: Comparison of extraction approaches
Key Info:
- Document-based vs structured data extraction
- LightRAG vs LangChain comparison
- When to use each approach
Status: Background context
```

---

## 🎯 Quick Reference: What Each Document Tells You

### Project State Documents
| Document | Answers | Priority |
|----------|---------|----------|
| `CLAUDE.md` | What is Arthur Health? | 🔵 High |
| `docs/ARCHITECTURE.md` | How is it currently built? | 🔵 High |
| `docs/IMPLEMENTATION_STATUS.md` | What's been implemented? | 🔵 High |

### Architecture Decision Documents
| Document | Answers | Priority |
|----------|---------|----------|
| `GRAPHITI_RESEARCH_REPORT.md` | Why not use X technology? | 🟡 Medium |
| `docs/HYBRID_ARCHITECTURE_SUMMARY.md` | Why did architecture change? | 🔴 **CRITICAL** |
| `docs/TEXT2CYPHER_IMPROVEMENTS.md` | What best practices were applied? | 🟡 Medium |

### Implementation Plan Documents
| Document | Answers | Priority |
|----------|---------|----------|
| `docs/MVP_IMPLEMENTATION_GUIDE.md` | What are we building? How? | 🔴 **PRIMARY** |
| `docs/MVP_SAFETY_ISOLATION_PLAN.md` | How to not break production? | 🔴 **CRITICAL** |
| `docs/GRAPHRAG_SUMMARY.md` | What GraphRAG features exist? | 🟡 Medium |

---

## 📖 Reading Path for Different Scenarios

### Scenario 1: "New AI Agent - Understand Everything"
**Full Context Path** (read in order):
1. `CLAUDE.md` (10 min) - What is this project?
2. `docs/HYBRID_ARCHITECTURE_SUMMARY.md` (20 min) - Why hybrid approach?
3. `docs/MVP_IMPLEMENTATION_GUIDE.md` (30 min) - What are we building?
4. `docs/MVP_SAFETY_ISOLATION_PLAN.md` (15 min) - How to do it safely?
5. `docs/IMPLEMENTATION_STATUS.md` (10 min) - Current state?

**Total Time**: ~85 minutes for complete context

---

### Scenario 2: "Resume Implementation - Quick Context"
**Essential Context Path** (read in order):
1. `docs/MVP_SAFETY_ISOLATION_PLAN.md` (5 min) - ⚠️ Safety rules
2. `docs/MVP_IMPLEMENTATION_GUIDE.md` (10 min) - ✅ Find current checklist position
3. `docs/HYBRID_ARCHITECTURE_SUMMARY.md` (5 min) - 🔄 Review architecture diagram

**Total Time**: ~20 minutes to resume work

---

### Scenario 3: "Debug Issue - Understand Architecture"
**Architecture Focus Path**:
1. `docs/HYBRID_ARCHITECTURE_SUMMARY.md` (15 min) - Architecture details
2. `docs/TEXT2CYPHER_IMPROVEMENTS.md` (5 min) - Text2Cypher specifics
3. `docs/IMPLEMENTATION_STATUS.md` (5 min) - What's implemented?

**Total Time**: ~25 minutes for technical deep dive

---

### Scenario 4: "Validate Safety - Prevent Breaking Production"
**Safety Focus Path**:
1. `docs/MVP_SAFETY_ISOLATION_PLAN.md` (10 min) - 🔒 ALL safety rules
2. `docs/MVP_IMPLEMENTATION_GUIDE.md` - Section: "Phase 1, Step 1.1" (5 min) - What to do
3. Check production health script in safety doc

**Total Time**: ~15 minutes before making changes

---

## 🎯 Context Summary for AI Agents

### Current Project State (As of January 13, 2025)

#### Where We Are:
- ✅ Arthur Health platform exists (production)
- ✅ ArthurPro POC using LightRAG (localhost:9621)
- ✅ GraphRAG code written (Text2Cypher, gap detection)
- ✅ Hybrid architecture designed (LLM-driven schema discovery)
- ✅ MIMIC-IV FHIR dataset available (100 patients)
- ⏸️  **NOT YET IMPLEMENTED**: MVP testing with real data

#### What We're Building:
**MVP Objective**: Validate hybrid GraphRAG architecture with real MIMIC-IV data
- Test LLM can discover entities from SQL metadata
- Test foreign keys → relationships mapping
- Test knowledge graph construction
- Test natural language queries work
- Test pattern detection works
- **NOT** replacing production yet - testing in isolation

#### How We're Building It (Safely):
- Isolated PostgreSQL container (MIMIC data)
- Isolated Neo4j container (test graph)
- Isolated API routes (`/api/mvp/*`)
- Isolated environment variables (`MVP_*`)
- Production ArthurPro untouched
- Can rollback in <1 minute

#### Next Steps:
Following `docs/MVP_IMPLEMENTATION_GUIDE.md` checklist:
- Phase 1, Step 1.1: Start PostgreSQL container
- Then: Create FHIR parser, load MIMIC data
- Then: Run schema discovery
- Then: Build knowledge graph
- Then: Test and validate

---

## 📝 Document Maintenance

### When to Update These Documents:

#### Update `AI_AGENT_CONTEXT_INDEX.md` (this file) when:
- New critical documents created
- Document purposes change
- Reading order needs adjustment

#### Update `MVP_IMPLEMENTATION_GUIDE.md` when:
- Complete a phase (check off boxes)
- Encounter issues (add to troubleshooting)
- Learn lessons (add to recommendations)

#### Update `MVP_SAFETY_ISOLATION_PLAN.md` when:
- Discover new safety concerns
- Production state changes
- Rollback procedures change

---

## 🚀 Quick Start Commands for AI Agents

### Get Complete Context:
```bash
# Read essential documents
cat CLAUDE.md
cat docs/HYBRID_ARCHITECTURE_SUMMARY.md
cat docs/MVP_IMPLEMENTATION_GUIDE.md
cat docs/MVP_SAFETY_ISOLATION_PLAN.md
```

### Find Current Status:
```bash
# Check implementation guide for current phase
grep -n "\[ \]" docs/MVP_IMPLEMENTATION_GUIDE.md | head -5

# Check what's running
docker ps | grep mvp

# Check environment variables
grep "MVP_" .env.local
```

### Verify Production Safety:
```bash
# Test production endpoint
curl -X POST http://localhost:3000/api/assistant/knowledge-graph \
  -H "Content-Type: application/json" \
  -d '{"query": "test"}'

# Expected: Response (production works)
```

---

## 🎯 Success Indicators

### An AI Agent Has Sufficient Context When It Can Answer:

#### Architecture Questions:
- ✅ Why did we choose hybrid architecture over rigid schemas?
- ✅ How does LLM discover entities from SQL metadata?
- ✅ What's the difference between explicit and inferred relationships?
- ✅ How do we avoid full graph recomputation?

#### Implementation Questions:
- ✅ What's the next step in MVP implementation?
- ✅ Which files can I modify safely?
- ✅ How do I test without breaking production?
- ✅ What's the rollback strategy if something breaks?

#### Project Questions:
- ✅ What is ArthurPro POC and where does it run?
- ✅ What dataset are we using for MVP testing?
- ✅ What are we testing vs. what are we NOT testing?
- ✅ When do we switch from LightRAG to new system?

---

## 📚 Optional Deep Dive Documents

### For Deeper Technical Understanding:
- `docs/GRAPHRAG_IMPLEMENTATION_GUIDE.md` - Original implementation details
- `docs/AZURE_SYNAPSE_INTEGRATION.md` - Synapse ETL details (post-MVP)
- `docs/TEXT2CYPHER_BEST_PRACTICES.md` - LangChain best practices

### For Background Research:
- `docs/ENTITY_EXTRACTION_COMPARISON.md` - Extraction approaches
- `GRAPHITI_RESEARCH_REPORT.md` - Why not Graphiti

**Note**: These are NOT required for MVP implementation but provide additional context.

---

## 🎯 TL;DR - Minimum Context to Start

### Absolute Minimum (15 minutes):
1. **Read**: `docs/MVP_SAFETY_ISOLATION_PLAN.md` (🔒 Safety rules)
2. **Read**: `docs/MVP_IMPLEMENTATION_GUIDE.md` - Phase 1 checklist
3. **Understand**: We're testing with MIMIC-IV data in isolated environment
4. **Rule**: Don't touch `/api/assistant/knowledge-graph` (production)

### You're Ready When:
- ✅ Know what MVP is testing (architecture validation)
- ✅ Know what to NOT touch (production routes)
- ✅ Know next step (Phase 1, Step 1.1: Start PostgreSQL)
- ✅ Know rollback strategy (stop containers, restore .env.local)

---

**Last Updated**: January 13, 2025
**Status**: ✅ Complete Context Index
**Purpose**: AI Agent Onboarding & Context Retrieval

---

## 📋 Context Checklist for AI Agents

Before starting work, verify you understand:
- [ ] What Arthur Health platform is
- [ ] Why hybrid architecture was chosen (not rigid schemas)
- [ ] What MIMIC-IV dataset contains (100 patients, FHIR format)
- [ ] What MVP tests (architecture, not healthcare specifics)
- [ ] What production systems exist (ArthurPro + LightRAG)
- [ ] What files CANNOT be modified (production routes)
- [ ] What the next step is (from implementation guide)
- [ ] How to rollback if needed (safety plan)

**If you can check all boxes, you have sufficient context to proceed safely.**
