/**
 * GraphRAG Quality Benchmark Script
 * Run this to compare LightRAG vs LangChain entity extraction and query quality
 *
 * Usage:
 *   npx tsx scripts/benchmark-graphrag.ts
 */

import { qualityTester, GroundTruthExample } from '../lib/graphrag/quality-tester';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Ground truth test cases for healthcare
 * Manually annotated gold standard examples
 */
const groundTruthExamples: GroundTruthExample[] = [
  {
    id: 'clinical-note-001',
    text: `
Progress Note - January 15, 2025

Patient: John Smith (MRN: 12345)
Age: 58, Male

Chief Complaint: Follow-up for Type 2 Diabetes Mellitus

History of Present Illness:
Patient presents for routine diabetes management. Last HbA1c was 8.2%
three months ago. Currently on Metformin 1000mg twice daily. Reports
good medication adherence but struggles with dietary compliance.

Assessment:
1. Type 2 Diabetes Mellitus (ICD-10: E11.9) - Suboptimal control
2. Hypertension (ICD-10: I10) - Well controlled

Plan:
1. Increase Metformin to 1500mg twice daily
2. Add Jardiance 10mg once daily
3. Refer to registered dietitian for nutrition counseling
4. Recheck HbA1c in 3 months
5. Schedule follow-up with endocrinologist Dr. Sarah Johnson

Provider: Dr. Michael Chen, MD (Internal Medicine)
    `,
    expectedEntities: [
      { name: 'John Smith', type: 'Patient' },
      { name: 'Type 2 Diabetes Mellitus', type: 'Diagnosis' },
      { name: 'Hypertension', type: 'Diagnosis' },
      { name: 'Metformin', type: 'Medication' },
      { name: 'Jardiance', type: 'Medication' },
      { name: 'Dr. Michael Chen', type: 'Provider' },
      { name: 'Dr. Sarah Johnson', type: 'Provider' },
    ],
    expectedRelationships: [
      { source: 'John Smith', target: 'Type 2 Diabetes Mellitus', type: 'HAS_DIAGNOSIS' },
      { source: 'John Smith', target: 'Hypertension', type: 'HAS_DIAGNOSIS' },
      { source: 'John Smith', target: 'Metformin', type: 'PRESCRIBED' },
      { source: 'John Smith', target: 'Jardiance', type: 'PRESCRIBED' },
      { source: 'John Smith', target: 'Dr. Michael Chen', type: 'VISITED' },
      { source: 'John Smith', target: 'Dr. Sarah Johnson', type: 'REFERRED_TO' },
    ],
    testQueries: [
      {
        question: 'What medications is John Smith currently taking?',
        expectedAnswer: 'Metformin',
        acceptableVariations: ['metformin 1500mg', 'jardiance'],
      },
      {
        question: 'What diagnoses does John Smith have?',
        expectedAnswer: 'Type 2 Diabetes',
        acceptableVariations: ['diabetes', 'hypertension'],
      },
      {
        question: 'Who is John Smith\'s provider?',
        expectedAnswer: 'Dr. Michael Chen',
        acceptableVariations: ['michael chen', 'dr. chen'],
      },
    ],
  },

  {
    id: 'clinical-note-002',
    text: `
Emergency Department Note - January 20, 2025

Patient: Mary Johnson (MRN: 67890)
Age: 72, Female

Chief Complaint: Acute Chest Pain

History:
72-year-old female with history of coronary artery disease (ICD-10: I25.10)
presents with sudden onset chest pain radiating to left arm. Started 2 hours ago.
Patient is on Aspirin 81mg daily, Atorvastatin 40mg daily, and Lisinopril 10mg daily.

Physical Exam:
BP: 150/95, HR: 98, RR: 20, O2 Sat: 96% on room air
Heart: Regular rhythm, no murmurs

EKG: ST-segment elevation in leads II, III, aVF

Assessment:
Acute ST-Elevation Myocardial Infarction (STEMI) (ICD-10: I21.09)

Plan:
1. Immediate cardiac catheterization
2. Loading dose Clopidogrel 600mg
3. Heparin bolus and infusion
4. Transfer to cardiac cath lab
5. Consult Dr. Robert Lee (Interventional Cardiology)

Provider: Dr. Emily Davis, MD (Emergency Medicine)
    `,
    expectedEntities: [
      { name: 'Mary Johnson', type: 'Patient' },
      { name: 'Coronary Artery Disease', type: 'Diagnosis' },
      { name: 'ST-Elevation Myocardial Infarction', type: 'Diagnosis' },
      { name: 'Aspirin', type: 'Medication' },
      { name: 'Atorvastatin', type: 'Medication' },
      { name: 'Lisinopril', type: 'Medication' },
      { name: 'Clopidogrel', type: 'Medication' },
      { name: 'Dr. Emily Davis', type: 'Provider' },
      { name: 'Dr. Robert Lee', type: 'Provider' },
    ],
    expectedRelationships: [
      { source: 'Mary Johnson', target: 'Coronary Artery Disease', type: 'HAS_DIAGNOSIS' },
      { source: 'Mary Johnson', target: 'ST-Elevation Myocardial Infarction', type: 'HAS_DIAGNOSIS' },
      { source: 'Mary Johnson', target: 'Aspirin', type: 'PRESCRIBED' },
      { source: 'Mary Johnson', target: 'Atorvastatin', type: 'PRESCRIBED' },
      { source: 'Mary Johnson', target: 'Lisinopril', type: 'PRESCRIBED' },
      { source: 'Mary Johnson', target: 'Clopidogrel', type: 'PRESCRIBED' },
      { source: 'Mary Johnson', target: 'Dr. Emily Davis', type: 'VISITED' },
      { source: 'Mary Johnson', target: 'Dr. Robert Lee', type: 'REFERRED_TO' },
    ],
    testQueries: [
      {
        question: 'What is Mary Johnson\'s cardiac diagnosis?',
        expectedAnswer: 'STEMI',
        acceptableVariations: ['myocardial infarction', 'heart attack', 'coronary artery disease'],
      },
      {
        question: 'Which medications is Mary Johnson taking for her heart?',
        expectedAnswer: 'Aspirin',
        acceptableVariations: ['atorvastatin', 'lisinopril', 'clopidogrel'],
      },
    ],
  },

  {
    id: 'clinical-note-003',
    text: `
Discharge Summary - January 25, 2025

Patient: Robert Wilson (MRN: 11223)
Age: 45, Male

Admission Date: January 22, 2025
Discharge Date: January 25, 2025

Admitting Diagnosis: Pneumonia (ICD-10: J18.9)

Hospital Course:
45-year-old male admitted with community-acquired pneumonia. Started on
Ceftriaxone 2g IV daily and Azithromycin 500mg PO daily. Blood cultures
negative. Chest X-ray showed right lower lobe infiltrate. Patient improved
with antibiotic therapy.

Discharge Diagnoses:
1. Community-Acquired Pneumonia (ICD-10: J18.9) - Resolved
2. Type 1 Diabetes Mellitus (ICD-10: E10.9) - Stable on insulin

Discharge Medications:
1. Amoxicillin 500mg PO three times daily x 5 days
2. Insulin Glargine 20 units subcutaneous at bedtime
3. Insulin Aspart sliding scale with meals

Follow-up:
1. Primary care physician Dr. Amanda White in 1 week
2. Pulmonology clinic in 6 weeks

Attending Physician: Dr. Steven Martinez, MD (Hospitalist)
    `,
    expectedEntities: [
      { name: 'Robert Wilson', type: 'Patient' },
      { name: 'Pneumonia', type: 'Diagnosis' },
      { name: 'Type 1 Diabetes Mellitus', type: 'Diagnosis' },
      { name: 'Ceftriaxone', type: 'Medication' },
      { name: 'Azithromycin', type: 'Medication' },
      { name: 'Amoxicillin', type: 'Medication' },
      { name: 'Insulin Glargine', type: 'Medication' },
      { name: 'Insulin Aspart', type: 'Medication' },
      { name: 'Dr. Steven Martinez', type: 'Provider' },
      { name: 'Dr. Amanda White', type: 'Provider' },
    ],
    expectedRelationships: [
      { source: 'Robert Wilson', target: 'Pneumonia', type: 'HAS_DIAGNOSIS' },
      { source: 'Robert Wilson', target: 'Type 1 Diabetes Mellitus', type: 'HAS_DIAGNOSIS' },
      { source: 'Robert Wilson', target: 'Ceftriaxone', type: 'PRESCRIBED' },
      { source: 'Robert Wilson', target: 'Azithromycin', type: 'PRESCRIBED' },
      { source: 'Robert Wilson', target: 'Amoxicillin', type: 'PRESCRIBED' },
      { source: 'Robert Wilson', target: 'Insulin Glargine', type: 'PRESCRIBED' },
      { source: 'Robert Wilson', target: 'Dr. Steven Martinez', type: 'VISITED' },
      { source: 'Robert Wilson', target: 'Dr. Amanda White', type: 'REFERRED_TO' },
    ],
    testQueries: [
      {
        question: 'What was Robert Wilson admitted for?',
        expectedAnswer: 'pneumonia',
        acceptableVariations: ['community-acquired pneumonia', 'lung infection'],
      },
      {
        question: 'What discharge medications was Robert Wilson given?',
        expectedAnswer: 'Amoxicillin',
        acceptableVariations: ['insulin', 'insulin glargine'],
      },
    ],
  },
];

/**
 * Main benchmark execution
 */
async function runBenchmark() {
  console.log('🏆 GraphRAG Quality Benchmark\n');
  console.log('='.repeat(60));
  console.log('Comparing LightRAG vs LangChain\n');

  // Load ground truth
  qualityTester.loadGroundTruth(groundTruthExamples);

  try {
    // Run comparison
    console.log('Starting benchmark (this may take 2-5 minutes)...\n');
    const comparison = await qualityTester.compareSystems();

    // Display results
    console.log('\n' + '='.repeat(60));
    console.log('📊 BENCHMARK RESULTS');
    console.log('='.repeat(60) + '\n');

    // LangChain results
    console.log('🔷 LANGCHAIN RESULTS\n');
    displayResults(comparison.langChain);

    // LightRAG results (if available)
    console.log('\n' + '='.repeat(60) + '\n');
    console.log('🔶 LIGHTRAG RESULTS\n');
    displayResults(comparison.lightRAG);

    // Comparison
    console.log('\n' + '='.repeat(60));
    console.log('🏆 HEAD-TO-HEAD COMPARISON');
    console.log('='.repeat(60) + '\n');
    displayComparison(comparison.comparison);

    // Save detailed reports
    const reportsDir = path.join(process.cwd(), 'benchmark-reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];

    const langchainReport = qualityTester.generateReport(comparison.langChain);
    fs.writeFileSync(
      path.join(reportsDir, `langchain-${timestamp}.md`),
      langchainReport
    );

    const lightragReport = qualityTester.generateReport(comparison.lightRAG);
    fs.writeFileSync(
      path.join(reportsDir, `lightrag-${timestamp}.md`),
      lightragReport
    );

    // Save comparison JSON
    fs.writeFileSync(
      path.join(reportsDir, `comparison-${timestamp}.json`),
      JSON.stringify(comparison, null, 2)
    );

    console.log(`\n✅ Detailed reports saved to: ${reportsDir}`);
    console.log(`   - langchain-${timestamp}.md`);
    console.log(`   - lightrag-${timestamp}.md`);
    console.log(`   - comparison-${timestamp}.json`);

  } catch (error: any) {
    console.error('\n❌ Benchmark failed:', error.message);
    console.error('\nDetails:', error.stack);
    process.exit(1);
  }
}

/**
 * Display results in a formatted way
 */
function displayResults(results: any) {
  console.log(`📈 Entity Extraction:`);
  console.log(`   Precision:  ${(results.entityMetrics.precision * 100).toFixed(1)}%`);
  console.log(`   Recall:     ${(results.entityMetrics.recall * 100).toFixed(1)}%`);
  console.log(`   F1 Score:   ${(results.entityMetrics.f1Score * 100).toFixed(1)}%`);
  console.log(`   Extracted:  ${results.entityMetrics.totalExtracted} (${results.entityMetrics.correctEntities} correct)`);

  console.log(`\n🔗 Relationship Extraction:`);
  console.log(`   Precision:  ${(results.relationshipMetrics.precision * 100).toFixed(1)}%`);
  console.log(`   Recall:     ${(results.relationshipMetrics.recall * 100).toFixed(1)}%`);
  console.log(`   F1 Score:   ${(results.relationshipMetrics.f1Score * 100).toFixed(1)}%`);
  console.log(`   Extracted:  ${results.relationshipMetrics.totalExtracted} (${results.relationshipMetrics.correctRelationships} correct)`);

  console.log(`\n❓ Query Accuracy:`);
  console.log(`   Accuracy:   ${(results.queryMetrics.accuracy * 100).toFixed(1)}%`);
  console.log(`   Avg Latency: ${results.queryMetrics.averageLatency.toFixed(0)}ms`);
  console.log(`   P95 Latency: ${results.queryMetrics.p95Latency.toFixed(0)}ms`);
  console.log(`   Correct:    ${results.queryMetrics.correctAnswers}/${results.queryMetrics.totalQueries}`);

  console.log(`\n💰 Cost:`);
  console.log(`   Total Tokens: ${results.costMetrics.totalTokens.toLocaleString()}`);
  console.log(`   Est. Cost:    $${results.costMetrics.estimatedCost.toFixed(4)}`);
  console.log(`   Per Document: ${results.costMetrics.tokensPerDocument.toFixed(0)} tokens`);

  console.log(`\n⚡ Performance:`);
  console.log(`   Duration:   ${(results.performanceMetrics.totalDuration / 1000).toFixed(2)}s`);
  console.log(`   Throughput: ${results.performanceMetrics.documentsPerSecond.toFixed(2)} docs/sec`);
}

/**
 * Display head-to-head comparison
 */
function displayComparison(comparison: any) {
  console.log(`Entity Quality:         ${comparison.entityQualityWinner} 🏆`);
  console.log(`Relationship Quality:   ${comparison.relationshipQualityWinner} 🏆`);
  console.log(`Query Accuracy:         ${comparison.queryAccuracyWinner} 🏆`);
  console.log(`Speed:                  ${comparison.speedWinner} 🏆`);
  console.log(`Cost Efficiency:        ${comparison.costWinner} 🏆`);
  console.log(`\n🎯 Overall Recommendation: ${comparison.overallRecommendation} 🏆`);
}

// Run the benchmark
runBenchmark();
