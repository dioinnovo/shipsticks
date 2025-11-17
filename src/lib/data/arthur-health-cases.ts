/**
 * Arthur Health Demo Cases
 * Real-world healthcare case studies for value-based care demonstration
 */

export interface HealthcareCase {
  id: string
  patientId: string
  patientName: string // anonymized
  caseType: 'chronic' | 'acute' | 'preventive' | 'transition' | 'complex'
  primaryDiagnosis: string
  secondaryDiagnoses: string[]
  location: {
    facility: string
    city: string
    state: string
  }
  riskScore: number // 1-100
  careTeam: {
    primaryPhysician: string
    careCoordinator: string
    specialists: string[]
  }
  timeline: {
    admissionDate?: string
    assessmentDate: string
    interventionDate: string
    lastFollowUp: string
    nextScheduled: string
  }
  outcomes: {
    initialProjectedCost: number
    actualCost: number
    costSavings: number
    qualityScore: number // 1-100
    patientSatisfaction: number // 1-100
    readmissionPrevented: boolean
    clinicalImprovement: string
  }
  interventions: string[]
  status: 'active' | 'monitoring' | 'resolved' | 'escalated'
  insurancePlan: 'Medicare' | 'Medicaid' | 'Commercial' | 'Medicare Advantage'
  metrics: {
    hedisCompliance: number // percentage
    starRating: number // 1-5
    lengthOfStay?: number // days
    edVisitsAvoided: number
  }
}

export const ARTHUR_HEALTH_CASES: HealthcareCase[] = [
  {
    id: 'AH-2024-001',
    patientId: 'P-12847',
    patientName: 'James M.',
    caseType: 'chronic',
    primaryDiagnosis: 'Type 2 Diabetes with Complications',
    secondaryDiagnoses: ['Hypertension', 'Chronic Kidney Disease Stage 3', 'Obesity'],
    location: {
      facility: 'Meridian Health Partners',
      city: 'Atlanta',
      state: 'GA'
    },
    riskScore: 78,
    careTeam: {
      primaryPhysician: 'Dr. Sarah Chen',
      careCoordinator: 'Maria Rodriguez, RN',
      specialists: ['Endocrinologist', 'Nephrologist', 'Dietitian']
    },
    timeline: {
      assessmentDate: '2024-01-15',
      interventionDate: '2024-01-20',
      lastFollowUp: '2024-03-10',
      nextScheduled: '2024-03-25'
    },
    outcomes: {
      initialProjectedCost: 125000,
      actualCost: 68000,
      costSavings: 57000,
      qualityScore: 92,
      patientSatisfaction: 94,
      readmissionPrevented: true,
      clinicalImprovement: 'A1C reduced from 11.2% to 7.1%, BP controlled'
    },
    interventions: [
      'Intensive diabetes management program',
      'Remote patient monitoring implementation',
      'Weekly care coordinator check-ins',
      'Medication therapy management',
      'Nutritional counseling'
    ],
    status: 'active',
    insurancePlan: 'Medicare Advantage',
    metrics: {
      hedisCompliance: 96,
      starRating: 4.5,
      edVisitsAvoided: 6
    }
  },
  {
    id: 'AH-2024-002',
    patientId: 'P-98234',
    patientName: 'Margaret K.',
    caseType: 'transition',
    primaryDiagnosis: 'Hip Replacement - Post-Surgical Care',
    secondaryDiagnoses: ['Osteoarthritis', 'Fall Risk', 'Mild Cognitive Impairment'],
    location: {
      facility: 'Valley Medical Center',
      city: 'Phoenix',
      state: 'AZ'
    },
    riskScore: 65,
    careTeam: {
      primaryPhysician: 'Dr. Robert Wilson',
      careCoordinator: 'Jennifer Lee, RN',
      specialists: ['Orthopedic Surgeon', 'Physical Therapist', 'Occupational Therapist']
    },
    timeline: {
      admissionDate: '2024-02-01',
      assessmentDate: '2024-02-03',
      interventionDate: '2024-02-04',
      lastFollowUp: '2024-03-15',
      nextScheduled: '2024-04-01'
    },
    outcomes: {
      initialProjectedCost: 85000,
      actualCost: 52000,
      costSavings: 33000,
      qualityScore: 95,
      patientSatisfaction: 98,
      readmissionPrevented: true,
      clinicalImprovement: 'Full mobility restored, zero complications'
    },
    interventions: [
      'Comprehensive discharge planning',
      'Home health coordination',
      'PT/OT scheduling and monitoring',
      'Fall prevention assessment',
      'Medication reconciliation'
    ],
    status: 'monitoring',
    insurancePlan: 'Medicare',
    metrics: {
      hedisCompliance: 100,
      starRating: 5,
      lengthOfStay: 2,
      edVisitsAvoided: 2
    }
  },
  {
    id: 'AH-2024-003',
    patientId: 'P-45678',
    patientName: 'Robert D.',
    caseType: 'complex',
    primaryDiagnosis: 'Congestive Heart Failure',
    secondaryDiagnoses: ['COPD', 'Atrial Fibrillation', 'Depression', 'Type 2 Diabetes'],
    location: {
      facility: 'Northside Integrated Care',
      city: 'Chicago',
      state: 'IL'
    },
    riskScore: 89,
    careTeam: {
      primaryPhysician: 'Dr. Michael Thompson',
      careCoordinator: 'Patricia Brown, RN',
      specialists: ['Cardiologist', 'Pulmonologist', 'Psychiatrist', 'Social Worker']
    },
    timeline: {
      admissionDate: '2024-01-10',
      assessmentDate: '2024-01-11',
      interventionDate: '2024-01-12',
      lastFollowUp: '2024-03-18',
      nextScheduled: '2024-03-22'
    },
    outcomes: {
      initialProjectedCost: 180000,
      actualCost: 95000,
      costSavings: 85000,
      qualityScore: 88,
      patientSatisfaction: 90,
      readmissionPrevented: true,
      clinicalImprovement: 'NYHA Class improved from IV to II, 50% reduction in symptoms'
    },
    interventions: [
      'Daily telemonitoring for weight and vitals',
      'Heart failure clinic enrollment',
      'Palliative care consultation',
      'Behavioral health integration',
      'Complex care management program',
      'Social determinants of health assessment'
    ],
    status: 'active',
    insurancePlan: 'Medicare',
    metrics: {
      hedisCompliance: 94,
      starRating: 4,
      lengthOfStay: 5,
      edVisitsAvoided: 8
    }
  },
  {
    id: 'AH-2024-004',
    patientId: 'P-67890',
    patientName: 'Lisa T.',
    caseType: 'preventive',
    primaryDiagnosis: 'Pre-Diabetes with Multiple Risk Factors',
    secondaryDiagnoses: ['Obesity BMI 35', 'Dyslipidemia', 'Family History of Diabetes'],
    location: {
      facility: 'Community Health Alliance',
      city: 'Portland',
      state: 'OR'
    },
    riskScore: 72,
    careTeam: {
      primaryPhysician: 'Dr. Emily Johnson',
      careCoordinator: 'David Kim, RN',
      specialists: ['Dietitian', 'Exercise Physiologist', 'Health Coach']
    },
    timeline: {
      assessmentDate: '2024-02-15',
      interventionDate: '2024-02-20',
      lastFollowUp: '2024-03-12',
      nextScheduled: '2024-04-15'
    },
    outcomes: {
      initialProjectedCost: 45000,
      actualCost: 12000,
      costSavings: 33000,
      qualityScore: 96,
      patientSatisfaction: 97,
      readmissionPrevented: false, // N/A for preventive
      clinicalImprovement: 'Weight loss 18 lbs, A1C from 6.2% to 5.6%'
    },
    interventions: [
      'Diabetes Prevention Program enrollment',
      'Weekly group lifestyle coaching',
      'Fitness tracker and app integration',
      'Nutritional meal planning',
      'Stress management workshops'
    ],
    status: 'active',
    insurancePlan: 'Commercial',
    metrics: {
      hedisCompliance: 100,
      starRating: 5,
      edVisitsAvoided: 2
    }
  },
  {
    id: 'AH-2024-005',
    patientId: 'P-34567',
    patientName: 'William S.',
    caseType: 'acute',
    primaryDiagnosis: 'Acute Myocardial Infarction',
    secondaryDiagnoses: ['Hypertension', 'Hyperlipidemia', 'Tobacco Use'],
    location: {
      facility: 'St. Mary\'s Medical Center',
      city: 'Miami',
      state: 'FL'
    },
    riskScore: 82,
    careTeam: {
      primaryPhysician: 'Dr. James Martinez',
      careCoordinator: 'Susan White, RN',
      specialists: ['Interventional Cardiologist', 'Cardiac Rehab Specialist', 'Pharmacist']
    },
    timeline: {
      admissionDate: '2024-03-01',
      assessmentDate: '2024-03-02',
      interventionDate: '2024-03-02',
      lastFollowUp: '2024-03-20',
      nextScheduled: '2024-03-27'
    },
    outcomes: {
      initialProjectedCost: 150000,
      actualCost: 78000,
      costSavings: 72000,
      qualityScore: 91,
      patientSatisfaction: 93,
      readmissionPrevented: true,
      clinicalImprovement: 'EF improved from 35% to 50%, smoking cessation achieved'
    },
    interventions: [
      'Rapid PCI intervention',
      'Cardiac rehabilitation program',
      'Smoking cessation program',
      'Medication optimization',
      'Remote cardiac monitoring',
      'Secondary prevention education'
    ],
    status: 'monitoring',
    insurancePlan: 'Commercial',
    metrics: {
      hedisCompliance: 98,
      starRating: 4.5,
      lengthOfStay: 3,
      edVisitsAvoided: 3
    }
  },
  {
    id: 'AH-2024-006',
    patientId: 'P-78901',
    patientName: 'Anna M.',
    caseType: 'chronic',
    primaryDiagnosis: 'Chronic Obstructive Pulmonary Disease (COPD)',
    secondaryDiagnoses: ['Anxiety Disorder', 'Osteoporosis', 'Malnutrition'],
    location: {
      facility: 'Riverside Health Network',
      city: 'Denver',
      state: 'CO'
    },
    riskScore: 76,
    careTeam: {
      primaryPhysician: 'Dr. Linda Anderson',
      careCoordinator: 'Thomas Garcia, RN',
      specialists: ['Pulmonologist', 'Respiratory Therapist', 'Nutritionist', 'Mental Health Counselor']
    },
    timeline: {
      assessmentDate: '2024-01-25',
      interventionDate: '2024-01-30',
      lastFollowUp: '2024-03-14',
      nextScheduled: '2024-03-28'
    },
    outcomes: {
      initialProjectedCost: 95000,
      actualCost: 48000,
      costSavings: 47000,
      qualityScore: 89,
      patientSatisfaction: 91,
      readmissionPrevented: true,
      clinicalImprovement: 'FEV1 improved 15%, zero exacerbations in 60 days'
    },
    interventions: [
      'Pulmonary rehabilitation program',
      'Home oxygen therapy management',
      'Inhaler technique training',
      'Anxiety management therapy',
      'Nutritional supplementation',
      'Flu and pneumonia vaccination'
    ],
    status: 'active',
    insurancePlan: 'Medicare Advantage',
    metrics: {
      hedisCompliance: 93,
      starRating: 4,
      edVisitsAvoided: 5
    }
  }
];

// Helper function to get case by ID
export function getHealthcaseById(id: string): HealthcareCase | undefined {
  return ARTHUR_HEALTH_CASES.find(c => c.id === id);
}

// Helper function to get cases by type
export function getHealthcasesByType(type: HealthcareCase['caseType']): HealthcareCase[] {
  return ARTHUR_HEALTH_CASES.filter(c => c.caseType === type);
}

// Helper function to get active cases
export function getActiveHealthcases(): HealthcareCase[] {
  return ARTHUR_HEALTH_CASES.filter(c => c.status === 'active');
}

// Calculate total cost savings
export function getTotalCostSavings(): number {
  return ARTHUR_HEALTH_CASES.reduce((total, c) => total + c.outcomes.costSavings, 0);
}

// Calculate average quality score
export function getAverageQualityScore(): number {
  const total = ARTHUR_HEALTH_CASES.reduce((sum, c) => sum + c.outcomes.qualityScore, 0);
  return Math.round(total / ARTHUR_HEALTH_CASES.length);
}