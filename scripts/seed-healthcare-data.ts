/**
 * Seed Healthcare Test Database
 * Converts mock patient data from TypeScript to SQL and populates test database
 *
 * Usage:
 *   export TEST_DATABASE_URL="postgresql://postgres:test@localhost:5432/arthur_health_test"
 *   npx tsx scripts/seed-healthcare-data.ts
 */

import { Client } from 'pg';
import * as sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { mockPatients } from '../lib/ai/mock-patient-data';

const DATABASE_URL = process.env.TEST_DATABASE_URL || 'file:./test-data/healthcare.db';
const is_postgres = DATABASE_URL.startsWith('postgresql://');
const is_sqlite = DATABASE_URL.startsWith('file:');

interface SeedStats {
  patients: number;
  diagnoses: number;
  medications: number;
  providers: number;
  facilities: number;
  encounters: number;
  claims: number;
  priorAuths: number;
  carePrograms: number;
  labResults: number;
}

/**
 * Seed data extractor
 * Converts mock patient data to database records
 */
class DataSeeder {
  private stats: SeedStats = {
    patients: 0,
    diagnoses: 0,
    medications: 0,
    providers: 0,
    facilities: 0,
    encounters: 0,
    claims: 0,
    priorAuths: 0,
    carePrograms: 0,
    labResults: 0,
  };

  /**
   * Generate INSERT statements for PostgreSQL
   */
  async seedPostgreSQL() {
    console.log('📊 Seeding PostgreSQL database...\n');

    const url = new URL(DATABASE_URL);
    const config = {
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      database: url.pathname.slice(1),
      user: url.username,
      password: url.password,
    };

    const client = new Client(config);

    try {
      await client.connect();
      console.log('   ✅ Connected to PostgreSQL\n');

      // Clear existing data
      console.log('🗑️  Clearing existing data...');
      await client.query('TRUNCATE patients, diagnoses, medications, providers, facilities, encounters, claims, prior_authorizations, care_programs, patient_care_programs, lab_results CASCADE');
      console.log('   ✅ Tables cleared\n');

      // Seed data
      await this.seedProviders(client);
      await this.seedFacilities(client);
      await this.seedPatients(client);
      await this.seedCarePrograms(client);

      await client.end();
      return this.stats;
    } catch (error) {
      await client.end();
      throw error;
    }
  }

  /**
   * Generate INSERT statements for SQLite
   */
  async seedSQLite() {
    console.log('📊 Seeding SQLite database...\n');

    const dbPath = DATABASE_URL.replace('file:', '');
    const db: Database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    try {
      console.log(`   ✅ Connected to SQLite: ${dbPath}\n`);

      // Clear existing data
      console.log('🗑️  Clearing existing data...');
      const tables = ['patient_care_programs', 'lab_results', 'prior_authorizations', 'claims', 'encounters', 'procedures', 'medications', 'diagnoses', 'patients', 'providers', 'facilities', 'care_programs'];
      for (const table of tables) {
        await db.run(`DELETE FROM ${table}`);
      }
      console.log('   ✅ Tables cleared\n');

      // Seed data
      await this.seedProviders(db);
      await this.seedFacilities(db);
      await this.seedPatients(db);
      await this.seedCarePrograms(db);

      await db.close();
      return this.stats;
    } catch (error) {
      await db.close();
      throw error;
    }
  }

  /**
   * Seed providers
   */
  private async seedProviders(db: any) {
    console.log('👨‍⚕️ Seeding providers...');

    const providers = [
      { id: 'PROV-001', npi: '1234567890', firstName: 'Sarah', lastName: 'Mitchell', specialty: 'Internal Medicine' },
      { id: 'PROV-002', npi: '1234567891', firstName: 'Michael', lastName: 'Johnson', specialty: 'Internal Medicine' },
      { id: 'PROV-003', npi: '1234567892', firstName: 'Jennifer', lastName: 'Park', specialty: 'Obstetrics' },
      { id: 'PROV-004', npi: '1234567893', firstName: 'Robert', lastName: 'Lee', specialty: 'Cardiology' },
      { id: 'PROV-005', npi: '1234567894', firstName: 'Emily', lastName: 'Chen', specialty: 'Endocrinology' },
      { id: 'PROV-006', npi: '1234567895', firstName: 'David', lastName: 'Martinez', specialty: 'Psychiatry' },
    ];

    for (const provider of providers) {
      const query = `
        INSERT INTO providers (id, npi, firstName, lastName, specialty, facilityId, phoneNumber)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      const values = [
        provider.id,
        provider.npi,
        provider.firstName,
        provider.lastName,
        provider.specialty,
        'FAC-001',
        '555-0100'
      ];

      if (is_postgres) {
        await db.query(query, values);
      } else {
        await db.run(query.replace(/\$(\d+)/g, '?'), values);
      }

      this.stats.providers++;
    }

    console.log(`   ✅ Created ${this.stats.providers} providers\n`);
  }

  /**
   * Seed facilities
   */
  private async seedFacilities(db: any) {
    console.log('🏥 Seeding facilities...');

    const facilities = [
      { id: 'FAC-001', name: 'Regional Medical Center', facilityType: 'Hospital', address: '123 Healthcare Ave, Medical City, ST 12345' },
      { id: 'FAC-002', name: 'Community Health Clinic', facilityType: 'Clinic', address: '456 Wellness St, Medical City, ST 12345' },
    ];

    for (const facility of facilities) {
      const query = `
        INSERT INTO facilities (id, name, facilityType, address, phoneNumber)
        VALUES ($1, $2, $3, $4, $5)
      `;
      const values = [facility.id, facility.name, facility.facilityType, facility.address, '555-0200'];

      if (is_postgres) {
        await db.query(query, values);
      } else {
        await db.run(query.replace(/\$(\d+)/g, '?'), values);
      }

      this.stats.facilities++;
    }

    console.log(`   ✅ Created ${this.stats.facilities} facilities\n`);
  }

  /**
   * Seed patients (from mock data)
   */
  private async seedPatients(db: any) {
    console.log('👥 Seeding patients...');

    const patientMappings = [
      { mock: mockPatients['margaret thompson'], id: 'PAT-001' },
      { mock: mockPatients['robert chen'], id: 'PAT-002' },
      { mock: mockPatients['emily rodriguez'], id: 'PAT-003' },
    ];

    for (const { mock: patient, id } of patientMappings) {
      // Insert patient
      const patientQuery = `
        INSERT INTO patients (id, mrn, firstName, lastName, dateOfBirth, gender, insurancePlanId, riskScore, primaryCareProviderId)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `;

      const nameParts = patient.patientName.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');

      const patientValues = [
        id,
        patient.mrn,
        firstName,
        lastName,
        patient.dateOfBirth,
        patient.gender,
        patient.policyNumber,
        patient.riskFactors ? 0.75 : 0.25,
        'PROV-001'
      ];

      if (is_postgres) {
        await db.query(patientQuery, patientValues);
      } else {
        await db.run(patientQuery.replace(/\$(\d+)/g, '?'), patientValues);
      }

      this.stats.patients++;

      // Insert diagnoses
      for (const condition of patient.currentConditions) {
        const diagnosisQuery = `
          INSERT INTO diagnoses (id, patientId, icd10Code, diagnosisName, diagnosisDate, status)
          VALUES ($1, $2, $3, $4, $5, $6)
        `;

        const icd10Mapping: Record<string, string> = {
          'Congestive Heart Failure': 'I50.9',
          'Type 2 Diabetes': 'E11.9',
          'Hypertension': 'I10',
          'Chronic Kidney Disease Stage 3': 'N18.3',
          'Obesity': 'E66.9',
          'Type 1 Diabetes': 'E10.9',
          'Hypothyroidism': 'E03.9',
          'Mild Depression': 'F32.0',
          'Pregnancy': 'Z34.90',
          'Gestational Diabetes': 'O24.419',
          'Iron Deficiency Anemia': 'D50.9',
        };

        const diagnosisValues = [
          `DX-${id}-${this.stats.diagnoses}`,
          id,
          icd10Mapping[condition] || 'R69',
          condition,
          '2024-01-01',
          'active'
        ];

        if (is_postgres) {
          await db.query(diagnosisQuery, diagnosisValues);
        } else {
          await db.run(diagnosisQuery.replace(/\$(\d+)/g, '?'), diagnosisValues);
        }

        this.stats.diagnoses++;
      }

      // Insert medications
      for (const med of patient.currentMedications) {
        const medQuery = `
          INSERT INTO medications (id, patientId, medicationName, dosage, frequency, startDate, adherenceScore, tier)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;

        const medValues = [
          `MED-${id}-${this.stats.medications}`,
          id,
          med.name,
          med.dosage,
          med.frequency,
          '2024-01-01',
          0.85,
          med.coveredTier
        ];

        if (is_postgres) {
          await db.query(medQuery, medValues);
        } else {
          await db.run(medQuery.replace(/\$(\d+)/g, '?'), medValues);
        }

        this.stats.medications++;
      }

      // Insert encounters
      for (const claim of patient.recentClaims) {
        const encounterQuery = `
          INSERT INTO encounters (id, patientId, providerId, facilityId, encounterDate, encounterType, reasonForVisit)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;

        const encounterValues = [
          `ENC-${id}-${this.stats.encounters}`,
          id,
          'PROV-001',
          'FAC-001',
          claim.date,
          'outpatient',
          claim.service
        ];

        if (is_postgres) {
          await db.query(encounterQuery, encounterValues);
        } else {
          await db.run(encounterQuery.replace(/\$(\d+)/g, '?'), encounterValues);
        }

        this.stats.encounters++;

        // Insert claim
        const claimQuery = `
          INSERT INTO claims (id, claimNumber, patientId, providerId, claimDate, serviceDate, billedAmount, allowedAmount, paidAmount, patientResponsibility, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `;

        const claimValues = [
          `CLM-${id}-${this.stats.claims}`,
          `CLAIM-${id}-${this.stats.claims}`,
          id,
          'PROV-001',
          claim.date,
          claim.date,
          claim.billedAmount,
          claim.allowedAmount,
          claim.paidByInsurance,
          claim.patientResponsibility,
          claim.status.toLowerCase()
        ];

        if (is_postgres) {
          await db.query(claimQuery, claimValues);
        } else {
          await db.run(claimQuery.replace(/\$(\d+)/g, '?'), claimValues);
        }

        this.stats.claims++;
      }
    }

    console.log(`   ✅ Created ${this.stats.patients} patients`);
    console.log(`   ✅ Created ${this.stats.diagnoses} diagnoses`);
    console.log(`   ✅ Created ${this.stats.medications} medications`);
    console.log(`   ✅ Created ${this.stats.encounters} encounters`);
    console.log(`   ✅ Created ${this.stats.claims} claims\n`);
  }

  /**
   * Seed care programs
   */
  private async seedCarePrograms(db: any) {
    console.log('🏥 Seeding care programs...');

    const programs = [
      { id: 'CP-001', name: 'Diabetes Management Program', type: 'Disease Management' },
      { id: 'CP-002', name: 'Chronic Care Management', type: 'Care Coordination' },
      { id: 'CP-003', name: 'Maternity Care Program', type: 'Preventive Care' },
    ];

    for (const program of programs) {
      const query = `
        INSERT INTO care_programs (id, programName, programType, description, enrollmentDate)
        VALUES ($1, $2, $3, $4, $5)
      `;
      const values = [
        program.id,
        program.name,
        program.type,
        `Comprehensive ${program.type} program`,
        '2024-01-01'
      ];

      if (is_postgres) {
        await db.query(query, values);
      } else {
        await db.run(query.replace(/\$(\d+)/g, '?'), values);
      }

      this.stats.carePrograms++;
    }

    console.log(`   ✅ Created ${this.stats.carePrograms} care programs\n`);
  }
}

/**
 * Main seeding function
 */
async function seed() {
  console.log('🌱 Arthur Health - Test Database Seeding\n');
  console.log('='.repeat(60));
  console.log(`\n📍 Database URL: ${DATABASE_URL}`);
  console.log(`📍 Type: ${is_postgres ? 'PostgreSQL' : is_sqlite ? 'SQLite' : 'Unknown'}\n`);

  const seeder = new DataSeeder();

  try {
    let stats: SeedStats;

    if (is_postgres) {
      stats = await seeder.seedPostgreSQL();
    } else if (is_sqlite) {
      stats = await seeder.seedSQLite();
    } else {
      throw new Error('Unsupported database URL format');
    }

    console.log('='.repeat(60));
    console.log('✅ DATABASE SEEDING COMPLETE!\n');
    console.log('📊 Summary:');
    console.log(`   - Patients: ${stats.patients}`);
    console.log(`   - Providers: ${stats.providers}`);
    console.log(`   - Facilities: ${stats.facilities}`);
    console.log(`   - Diagnoses: ${stats.diagnoses}`);
    console.log(`   - Medications: ${stats.medications}`);
    console.log(`   - Encounters: ${stats.encounters}`);
    console.log(`   - Claims: ${stats.claims}`);
    console.log(`   - Care Programs: ${stats.carePrograms}`);

    console.log('\n📋 Next Steps:');
    console.log('   1. Run schema discovery: npx tsx scripts/discover-schema.ts');
    console.log('   2. Review discovered entities and relationships');
    console.log('   3. Validate against expected healthcare ontology');

  } catch (error: any) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error('\nStack trace:', error.stack);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Ensure database setup completed successfully');
    console.error('   2. Check TEST_DATABASE_URL is correct');
    console.error('   3. Verify database server is running');
    process.exit(1);
  }
}

// Run seeding
seed();
