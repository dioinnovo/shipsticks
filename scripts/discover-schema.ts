/**
 * Schema Discovery Script
 * Uses LLM to analyze Synapse SQL schema and discover entities/relationships
 *
 * Usage:
 *   npx tsx scripts/discover-schema.ts
 *
 * Output:
 *   - Console log of discovered entities/relationships
 *   - schema-discovery-report.md (human review)
 *   - neo4j-discovered-schema.cypher (Neo4j DDL)
 */

import { synapseSchemaReader } from '../lib/graphrag/synapse-schema-reader';
import { schemaDiscoveryAgent } from '../lib/graphrag/schema-discovery-agent';
import * as fs from 'fs';
import * as path from 'path';

async function discoverSchema() {
  console.log('🔬 Arthur Health - Schema Discovery\n');
  console.log('='​.repeat(60));

  try {
    // Step 1: Test Synapse connection
    console.log('\n📡 Step 1: Testing Synapse connection...');
    const connected = await synapseSchemaReader.testConnection();

    if (!connected) {
      console.error('\n❌ Cannot connect to Synapse. Please check:');
      console.error('   1. SYNAPSE_SERVER environment variable');
      console.error('   2. SYNAPSE_DATABASE environment variable');
      console.error('   3. SYNAPSE_USER environment variable');
      console.error('   4. SYNAPSE_PASSWORD environment variable');
      console.error('   5. Network connectivity to Synapse');
      process.exit(1);
    }

    // Step 2: Read Synapse schema
    console.log('\n📊 Step 2: Reading Synapse schema metadata...');
    const tables = await synapseSchemaReader.readAllTables(['dbo', 'healthcare_fhir']);

    if (tables.length === 0) {
      console.error('\n❌ No tables found in Synapse. Please check:');
      console.error('   1. Database contains tables');
      console.error('   2. User has READ permissions');
      console.error('   3. Schema names are correct (dbo, healthcare_fhir)');
      process.exit(1);
    }

    console.log(`\n   Analyzed ${tables.length} tables:`);
    for (const table of tables) {
      const fkCount = table.columns.filter(c => c.isForeignKey).length;
      console.log(`   - ${table.schemaName}.${table.tableName} (${table.columns.length} columns, ${fkCount} FKs, ~${(table.rowCount || 0).toLocaleString()} rows)`);
    }

    // Step 3: LLM analyzes schema
    console.log('\n🤖 Step 3: LLM analyzing schema for entities and relationships...');
    console.log('   (This may take 30-60 seconds)\n');

    const discovery = await schemaDiscoveryAgent.analyzeSchema(tables, {
      focusAreas: [
        'gap detection in healthcare delivery',
        'care coordination opportunities',
        'cost optimization patterns',
        'quality measure derivation',
      ],
      minConfidence: 'medium',
    });

    // Step 4: Display results
    console.log('\n' + '='​.repeat(60));
    console.log('📋 DISCOVERY RESULTS');
    console.log('='​.repeat(60));

    console.log('\n🎯 Core Healthcare Entities (Required):');
    for (const entity of discovery.coreEntities) {
      console.log(`   ${entity.confidence === 'high' ? '✅' : entity.confidence === 'medium' ? '⚠️' : '❓'} ${entity.name}`);
      console.log(`      Source: ${entity.sourceTable}`);
      console.log(`      Confidence: ${entity.confidence}`);
    }

    console.log('\n💡 Discovered Entities (LLM Found):');
    for (const entity of discovery.discoveredEntities) {
      console.log(`   ${entity.confidence === 'high' ? '✅' : entity.confidence === 'medium' ? '⚠️' : '❓'} ${entity.name}`);
      console.log(`      Source: ${entity.sourceTable}`);
      console.log(`      Description: ${entity.description}`);
      console.log(`      Confidence: ${entity.confidence}`);
    }

    console.log('\n🔗 Explicit Relationships (From Foreign Keys):');
    for (const rel of discovery.explicitRelationships) {
      console.log(`   ${rel.confidence === 'high' ? '✅' : rel.confidence === 'medium' ? '⚠️' : '❓'} ${rel.name}`);
      console.log(`      Pattern: (${rel.sourceEntity})-[:${rel.name}]->(${rel.targetEntity})`);
      console.log(`      Meaning: ${rel.healthcareSemantics}`);
      console.log(`      Confidence: ${rel.confidence}`);
    }

    console.log('\n🔍 Inferred Relationships (Pattern-Based):');
    for (const rel of discovery.inferredRelationships) {
      console.log(`   ${rel.confidence === 'high' ? '✅' : rel.confidence === 'medium' ? '⚠️' : '❓'} ${rel.name}`);
      console.log(`      Pattern: (${rel.sourceEntity})-[:${rel.name}]->(${rel.targetEntity})`);
      console.log(`      Meaning: ${rel.healthcareSemantics}`);
      console.log(`      Basis: ${rel.sqlBasis}`);
      console.log(`      Confidence: ${rel.confidence}`);
    }

    console.log('\n⏱️  Temporal Patterns Identified:');
    for (const pattern of discovery.temporalPatterns) {
      console.log(`   - ${pattern}`);
    }

    console.log('\n💭 Recommendations:');
    for (const rec of discovery.recommendations) {
      console.log(`   - ${rec}`);
    }

    // Step 5: Generate human review report
    console.log('\n📝 Step 5: Generating human review report...');
    const reviewReport = schemaDiscoveryAgent.generateReviewReport(discovery);

    const reportsDir = path.join(process.cwd(), 'schema-discovery');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const reportPath = path.join(reportsDir, `schema-discovery-report-${timestamp}.md`);

    fs.writeFileSync(reportPath, reviewReport);
    console.log(`   ✅ Review report saved: ${reportPath}`);

    // Step 6: Generate Neo4j schema DDL
    console.log('\n🏗️  Step 6: Generating Neo4j schema DDL...');
    const neo4jDDL = await schemaDiscoveryAgent.generateNeo4jSchema(discovery);

    const ddlPath = path.join(reportsDir, `neo4j-discovered-schema-${timestamp}.cypher`);
    fs.writeFileSync(ddlPath, neo4jDDL);
    console.log(`   ✅ Neo4j DDL saved: ${ddlPath}`);

    // Step 7: Save JSON for programmatic use
    const jsonPath = path.join(reportsDir, `schema-discovery-${timestamp}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(discovery, null, 2));
    console.log(`   ✅ JSON saved: ${jsonPath}`);

    // Final summary
    console.log('\n' + '='​.repeat(60));
    console.log('✅ SCHEMA DISCOVERY COMPLETE!');
    console.log('='​.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`   - Core entities: ${discovery.coreEntities.length}`);
    console.log(`   - Discovered entities: ${discovery.discoveredEntities.length}`);
    console.log(`   - Explicit relationships: ${discovery.explicitRelationships.length}`);
    console.log(`   - Inferred relationships: ${discovery.inferredRelationships.length}`);
    console.log(`   - Temporal patterns: ${discovery.temporalPatterns.length}`);

    console.log('\n📁 Output files:');
    console.log(`   - Review report: ${reportPath}`);
    console.log(`   - Neo4j DDL: ${ddlPath}`);
    console.log(`   - JSON data: ${jsonPath}`);

    console.log('\n🎯 Next Steps:');
    console.log('   1. Review the markdown report for accuracy');
    console.log('   2. Validate healthcare semantics with domain experts');
    console.log('   3. Approve or modify discovered entities/relationships');
    console.log('   4. Run Neo4j DDL to create schema');
    console.log('   5. Proceed with hybrid ETL implementation');

    console.log('\n💡 Tip: Open the review report in your editor to see detailed analysis!');

  } catch (error: any) {
    console.error('\n❌ Schema discovery failed:', error.message);
    console.error('\nStack trace:', error.stack);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check Synapse connection settings');
    console.error('   2. Verify Azure OpenAI API key is configured');
    console.error('   3. Ensure FHIR tables exist in Synapse');
    console.error('   4. Check network connectivity');
    process.exit(1);
  }
}

// Run discovery
discoverSchema();
