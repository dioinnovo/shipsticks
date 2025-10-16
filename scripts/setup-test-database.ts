/**
 * Setup Local Test Database for GraphRAG Testing
 * Creates FHIR-compatible healthcare schema for local testing before Synapse connection
 *
 * Usage:
 *   # PostgreSQL (recommended - closest to Synapse):
 *   docker run --name arthur-test-db -e POSTGRES_PASSWORD=test -p 5432:5432 -d postgres
 *   export TEST_DATABASE_URL="postgresql://postgres:test@localhost:5432/arthur_health_test"
 *   npx tsx scripts/setup-test-database.ts
 *
 *   # SQLite (faster setup):
 *   export TEST_DATABASE_URL="file:./test-data/healthcare.db"
 *   npx tsx scripts/setup-test-database.ts
 */

import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

const DATABASE_URL = process.env.TEST_DATABASE_URL || 'file:./test-data/healthcare.db';
const isPostgres = DATABASE_URL.startsWith('postgresql://');
const isSQLite = DATABASE_URL.startsWith('file:');

/**
 * FHIR-compatible healthcare database schema
 * Designed to match expected Synapse structure
 */
const HEALTHCARE_SCHEMA = `
-- ============================================
-- FHIR-COMPATIBLE HEALTHCARE DATABASE SCHEMA
-- ============================================

-- Patients table (FHIR Patient resource)
CREATE TABLE IF NOT EXISTS patients (
  id VARCHAR(50) PRIMARY KEY,
  mrn VARCHAR(50) UNIQUE NOT NULL,
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  dateOfBirth DATE,
  gender VARCHAR(20),
  insurancePlanId VARCHAR(50),
  riskScore DECIMAL(5,2),
  primaryCareProviderId VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Diagnoses table (FHIR Condition resource)
CREATE TABLE IF NOT EXISTS diagnoses (
  id VARCHAR(50) PRIMARY KEY,
  patientId VARCHAR(50) NOT NULL,
  icd10Code VARCHAR(20) NOT NULL,
  diagnosisName VARCHAR(200),
  diagnosisDate DATE,
  status VARCHAR(50) DEFAULT 'active',
  severity VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patientId) REFERENCES patients(id)
);

-- Medications table (FHIR MedicationStatement resource)
CREATE TABLE IF NOT EXISTS medications (
  id VARCHAR(50) PRIMARY KEY,
  patientId VARCHAR(50) NOT NULL,
  medicationName VARCHAR(200) NOT NULL,
  rxNormCode VARCHAR(50),
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  startDate DATE,
  endDate DATE,
  adherenceScore DECIMAL(3,2),
  tier VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patientId) REFERENCES patients(id)
);

-- Providers table (FHIR Practitioner resource)
CREATE TABLE IF NOT EXISTS providers (
  id VARCHAR(50) PRIMARY KEY,
  npi VARCHAR(20) UNIQUE,
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  specialty VARCHAR(100),
  facilityId VARCHAR(50),
  phoneNumber VARCHAR(20),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Facilities table (FHIR Location resource)
CREATE TABLE IF NOT EXISTS facilities (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  facilityType VARCHAR(100),
  address VARCHAR(500),
  phoneNumber VARCHAR(20),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Encounters table (FHIR Encounter resource)
CREATE TABLE IF NOT EXISTS encounters (
  id VARCHAR(50) PRIMARY KEY,
  patientId VARCHAR(50) NOT NULL,
  providerId VARCHAR(50),
  facilityId VARCHAR(50),
  encounterDate DATE NOT NULL,
  encounterType VARCHAR(100),
  reasonForVisit TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patientId) REFERENCES patients(id),
  FOREIGN KEY (providerId) REFERENCES providers(id),
  FOREIGN KEY (facilityId) REFERENCES facilities(id)
);

-- Procedures table (FHIR Procedure resource)
CREATE TABLE IF NOT EXISTS procedures (
  id VARCHAR(50) PRIMARY KEY,
  patientId VARCHAR(50) NOT NULL,
  providerId VARCHAR(50),
  cptCode VARCHAR(20),
  procedureName VARCHAR(200),
  procedureDate DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'completed',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patientId) REFERENCES patients(id),
  FOREIGN KEY (providerId) REFERENCES providers(id)
);

-- Claims table (FHIR Claim resource)
CREATE TABLE IF NOT EXISTS claims (
  id VARCHAR(50) PRIMARY KEY,
  claimNumber VARCHAR(50) UNIQUE NOT NULL,
  patientId VARCHAR(50) NOT NULL,
  providerId VARCHAR(50),
  claimDate DATE NOT NULL,
  serviceDate DATE,
  billedAmount DECIMAL(10,2),
  allowedAmount DECIMAL(10,2),
  paidAmount DECIMAL(10,2),
  patientResponsibility DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'submitted',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patientId) REFERENCES patients(id),
  FOREIGN KEY (providerId) REFERENCES providers(id)
);

-- Prior Authorizations table (Custom - common in healthcare)
CREATE TABLE IF NOT EXISTS prior_authorizations (
  id VARCHAR(50) PRIMARY KEY,
  authNumber VARCHAR(50) UNIQUE NOT NULL,
  patientId VARCHAR(50) NOT NULL,
  providerId VARCHAR(50),
  requestDate DATE NOT NULL,
  approvalDate DATE,
  expirationDate DATE,
  status VARCHAR(50) DEFAULT 'pending',
  reasonForAuth TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patientId) REFERENCES patients(id),
  FOREIGN KEY (providerId) REFERENCES providers(id)
);

-- Care Programs table (FHIR CarePlan resource)
CREATE TABLE IF NOT EXISTS care_programs (
  id VARCHAR(50) PRIMARY KEY,
  programName VARCHAR(200) NOT NULL,
  programType VARCHAR(100),
  description TEXT,
  enrollmentDate DATE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patient Care Program Enrollment (junction table)
CREATE TABLE IF NOT EXISTS patient_care_programs (
  id VARCHAR(50) PRIMARY KEY,
  patientId VARCHAR(50) NOT NULL,
  careProgramId VARCHAR(50) NOT NULL,
  enrollmentDate DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patientId) REFERENCES patients(id),
  FOREIGN KEY (careProgramId) REFERENCES care_programs(id)
);

-- Lab Results table (FHIR Observation resource)
CREATE TABLE IF NOT EXISTS lab_results (
  id VARCHAR(50) PRIMARY KEY,
  patientId VARCHAR(50) NOT NULL,
  loincCode VARCHAR(20),
  testName VARCHAR(200) NOT NULL,
  resultValue VARCHAR(100),
  resultUnit VARCHAR(50),
  referenceRange VARCHAR(100),
  testDate DATE NOT NULL,
  abnormalFlag VARCHAR(20),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patientId) REFERENCES patients(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_diagnoses_patient ON diagnoses(patientId);
CREATE INDEX IF NOT EXISTS idx_diagnoses_icd10 ON diagnoses(icd10Code);
CREATE INDEX IF NOT EXISTS idx_medications_patient ON medications(patientId);
CREATE INDEX IF NOT EXISTS idx_encounters_patient ON encounters(patientId);
CREATE INDEX IF NOT EXISTS idx_encounters_date ON encounters(encounterDate);
CREATE INDEX IF NOT EXISTS idx_procedures_patient ON procedures(patientId);
CREATE INDEX IF NOT EXISTS idx_claims_patient ON claims(patientId);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_prior_auth_patient ON prior_authorizations(patientId);
CREATE INDEX IF NOT EXISTS idx_prior_auth_status ON prior_authorizations(status);
CREATE INDEX IF NOT EXISTS idx_lab_results_patient ON lab_results(patientId);
`;

/**
 * Setup PostgreSQL database
 */
async function setupPostgreSQL() {
  console.log('📊 Setting up PostgreSQL test database...');

  // Parse connection string
  const url = new URL(DATABASE_URL);
  const config = {
    host: url.hostname,
    port: parseInt(url.port) || 5432,
    database: url.pathname.slice(1),
    user: url.username,
    password: url.password,
  };

  let client: Client | null = null;

  try {
    // Connect to postgres database first to create our test database
    const tempClient = new Client({
      ...config,
      database: 'postgres',
    });

    await tempClient.connect();
    console.log('   ✅ Connected to PostgreSQL server');

    // Create database if it doesn't exist
    try {
      await tempClient.query(`CREATE DATABASE ${config.database}`);
      console.log(`   ✅ Created database: ${config.database}`);
    } catch (error: any) {
      if (error.code === '42P04') {
        console.log(`   ⚠️  Database ${config.database} already exists`);
      } else {
        throw error;
      }
    }

    await tempClient.end();

    // Connect to our test database
    client = new Client(config);
    await client.connect();
    console.log(`   ✅ Connected to database: ${config.database}`);

    // Execute schema
    await client.query(HEALTHCARE_SCHEMA);
    console.log('   ✅ Healthcare schema created');

    // Verify tables
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log(`   ✅ Created ${result.rows.length} tables:`);
    for (const row of result.rows) {
      console.log(`      - ${row.table_name}`);
    }

    return true;
  } catch (error: any) {
    console.error('   ❌ PostgreSQL setup failed:', error.message);
    throw error;
  } finally {
    if (client) {
      await client.end();
    }
  }
}

/**
 * Setup SQLite database
 */
async function setupSQLite() {
  console.log('📊 Setting up SQLite test database...');

  // Extract file path from URL
  const dbPath = DATABASE_URL.replace('file:', '');
  const dbDir = path.dirname(dbPath);

  // Create directory if it doesn't exist
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log(`   ✅ Created directory: ${dbDir}`);
  }

  try {
    const db: Database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    console.log(`   ✅ Connected to SQLite: ${dbPath}`);

    // SQLite needs some schema adjustments
    const sqliteSchema = HEALTHCARE_SCHEMA
      .replace(/VARCHAR\(\d+\)/g, 'TEXT')
      .replace(/DECIMAL\(\d+,\d+\)/g, 'REAL')
      .replace(/TIMESTAMP/g, 'TEXT')
      .replace(/DATE/g, 'TEXT');

    // Execute schema (SQLite needs statements executed separately)
    const statements = sqliteSchema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      try {
        await db.exec(statement);
      } catch (error: any) {
        // Ignore "table already exists" errors
        if (!error.message.includes('already exists')) {
          throw error;
        }
      }
    }

    console.log('   ✅ Healthcare schema created');

    // Verify tables
    const result = await db.all(`
      SELECT name
      FROM sqlite_master
      WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `);

    console.log(`   ✅ Created ${result.length} tables:`);
    for (const row of result) {
      console.log(`      - ${row.name}`);
    }

    await db.close();
    return true;
  } catch (error: any) {
    console.error('   ❌ SQLite setup failed:', error.message);
    throw error;
  }
}

/**
 * Main setup function
 */
async function setup() {
  console.log('🏥 Arthur Health - Test Database Setup\n');
  console.log('='.repeat(60));
  console.log(`\n📍 Database URL: ${DATABASE_URL}`);
  console.log(`📍 Type: ${isPostgres ? 'PostgreSQL' : isSQLite ? 'SQLite' : 'Unknown'}\n`);

  try {
    if (isPostgres) {
      await setupPostgreSQL();
    } else if (isSQLite) {
      await setupSQLite();
    } else {
      throw new Error('Unsupported database URL format. Use postgresql:// or file:');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ TEST DATABASE SETUP COMPLETE!\n');
    console.log('📋 Next Steps:');
    console.log('   1. Run: npx tsx scripts/seed-healthcare-data.ts');
    console.log('   2. Run: npx tsx scripts/discover-schema.ts (with TEST_DATABASE_URL)');
    console.log('   3. Verify schema discovery results');
    console.log('   4. Test hybrid extraction');

    console.log('\n💡 Tips:');
    console.log('   - Set TEST_DATABASE_URL env variable for different databases');
    console.log('   - Use PostgreSQL for closest match to Synapse SQL');
    console.log('   - Use SQLite for quick prototyping');

  } catch (error: any) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\nStack trace:', error.stack);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check database connection string');
    console.error('   2. Ensure database server is running');
    console.error('   3. Verify credentials and permissions');
    process.exit(1);
  }
}

// Run setup
setup();
