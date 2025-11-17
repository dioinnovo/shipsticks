/**
 * Healthcare Terminology Mapping
 * Maps property insurance terms to healthcare equivalents
 */

export const HEALTHCARE_TERMINOLOGY = {
  // Core Entities
  property: 'patient',
  properties: 'patients',
  claim: 'case',
  claims: 'cases',
  inspection: 'assessment',
  inspections: 'assessments',
  contractor: 'provider',
  contractors: 'providers',

  // Process Terms
  inspect: 'assess',
  inspecting: 'assessing',
  inspected: 'assessed',
  damage: 'condition',
  damages: 'conditions',
  repair: 'treatment',
  repairs: 'treatments',
  settlement: 'outcome',
  settlements: 'outcomes',

  // Areas/Locations
  'inspection area': 'clinical pathway',
  'inspection areas': 'clinical pathways',
  'property area': 'care domain',
  'property areas': 'care domains',
  roof: 'cardiology',
  siding: 'orthopedics',
  foundation: 'primary care',
  plumbing: 'nephrology',
  electrical: 'neurology',
  hvac: 'pulmonology',
  interior: 'internal medicine',
  exterior: 'specialist care',

  // Documents
  'inspection report': 'clinical summary',
  'damage report': 'assessment report',
  'repair estimate': 'treatment plan',
  'property photos': 'medical imaging',
  'claim documents': 'medical records',

  // Status Terms
  'pending inspection': 'awaiting assessment',
  'inspection scheduled': 'appointment scheduled',
  'inspection complete': 'assessment complete',
  'claim submitted': 'case created',
  'claim approved': 'authorization approved',
  'claim denied': 'authorization denied',
  'in progress': 'in treatment',
  'completed': 'discharged',

  // Financial Terms
  'claim value': 'episode cost',
  'settlement amount': 'reimbursement',
  'deductible': 'copayment',
  'coverage limit': 'benefit maximum',
  'repair cost': 'treatment cost',

  // Roles
  inspector: 'clinician',
  adjuster: 'care coordinator',
  'property owner': 'patient',
  'insurance carrier': 'health plan',

  // Actions
  'schedule inspection': 'schedule appointment',
  'submit claim': 'create referral',
  'approve claim': 'authorize care',
  'generate report': 'create care summary',
  'upload photos': 'upload medical records',
  'add contractor': 'add provider',
  'review damage': 'review diagnosis',

  // Metrics
  'claims processed': 'cases managed',
  'average settlement': 'average savings',
  'inspection time': 'coordination time',
  'success rate': 'quality score',
  'client satisfaction': 'patient satisfaction',
} as const;

// Function to translate terms
export function translateTerm(term: string): string {
  const lowerTerm = term.toLowerCase();

  // Check exact matches first
  if (HEALTHCARE_TERMINOLOGY[lowerTerm as keyof typeof HEALTHCARE_TERMINOLOGY]) {
    return HEALTHCARE_TERMINOLOGY[lowerTerm as keyof typeof HEALTHCARE_TERMINOLOGY];
  }

  // Check if term contains any mapped phrases
  for (const [insurance, healthcare] of Object.entries(HEALTHCARE_TERMINOLOGY)) {
    if (lowerTerm.includes(insurance)) {
      return term.toLowerCase().replace(insurance, healthcare);
    }
  }

  return term;
}

// Healthcare-specific terms
export const HEALTHCARE_METRICS = {
  activePatients: 'Active Patients',
  careValueDelivered: 'Care Value Delivered',
  avgCostSavings: 'Average Cost Savings',
  qualityScore: 'Quality Score (HEDIS)',
  patientSatisfaction: 'Patient Satisfaction (CAHPS)',
  careGapsClosed: 'Care Gaps Closed',
  readmissionRate: '30-Day Readmission Rate',
  edVisitsAvoided: 'ED Visits Avoided',
  medicationAdherence: 'Medication Adherence Rate',
  preventiveCareCompliance: 'Preventive Care Compliance',
  networkUtilization: 'Network Utilization Rate',
  referralResponseTime: 'Referral Response Time',
  starRating: 'CMS Star Rating',
  riskScore: 'HCC Risk Score',
  costPerEpisode: 'Cost Per Episode',
};

// Clinical Pathways (replacing inspection areas)
export const CLINICAL_PATHWAYS = [
  {
    id: 'diabetes-management',
    name: 'Diabetes Management',
    icon: 'Activity',
    description: 'Comprehensive diabetes care protocol',
    assessmentPoints: [
      'HbA1c Control',
      'Blood Pressure Management',
      'Lipid Management',
      'Kidney Function',
      'Eye Exam',
      'Foot Care'
    ]
  },
  {
    id: 'heart-failure',
    name: 'Heart Failure Protocol',
    icon: 'Heart',
    description: 'CHF management and monitoring',
    assessmentPoints: [
      'Ejection Fraction',
      'Fluid Status',
      'Medication Optimization',
      'Daily Weights',
      'Symptom Monitoring',
      'Dietary Compliance'
    ]
  },
  {
    id: 'post-surgical',
    name: 'Post-Surgical Care',
    icon: 'Stethoscope',
    description: 'Post-operative recovery pathway',
    assessmentPoints: [
      'Wound Assessment',
      'Pain Management',
      'Mobility Progress',
      'Medication Reconciliation',
      'Follow-up Scheduling',
      'Complication Screening'
    ]
  },
  {
    id: 'copd-management',
    name: 'COPD Management',
    icon: 'Wind',
    description: 'Chronic respiratory care',
    assessmentPoints: [
      'Pulmonary Function',
      'Oxygen Saturation',
      'Inhaler Technique',
      'Exacerbation Prevention',
      'Smoking Cessation',
      'Pulmonary Rehab'
    ]
  },
  {
    id: 'behavioral-health',
    name: 'Behavioral Health',
    icon: 'Brain',
    description: 'Mental health integration',
    assessmentPoints: [
      'Depression Screening',
      'Anxiety Assessment',
      'Medication Compliance',
      'Therapy Attendance',
      'Crisis Prevention',
      'Social Support'
    ]
  },
  {
    id: 'preventive-care',
    name: 'Preventive Care',
    icon: 'Shield',
    description: 'Preventive screening protocols',
    assessmentPoints: [
      'Cancer Screenings',
      'Immunizations',
      'Health Risk Assessment',
      'Wellness Visit',
      'Lifestyle Counseling',
      'Preventive Labs'
    ]
  }
];

// Referral Types (replacing claim types)
export const REFERRAL_TYPES = {
  routine: 'Routine Referral',
  urgent: 'Urgent Referral',
  emergent: 'Emergent Referral',
  followUp: 'Follow-up Visit',
  consultation: 'Specialist Consultation',
  diagnostic: 'Diagnostic Testing',
  therapeutic: 'Therapeutic Services',
  behavioral: 'Behavioral Health',
  postAcute: 'Post-Acute Care',
  preventive: 'Preventive Services'
};

// Care Team Roles
export const CARE_TEAM_ROLES = {
  pcp: 'Primary Care Physician',
  specialist: 'Specialist',
  careCoordinator: 'Care Coordinator',
  caseManager: 'Case Manager',
  nurse: 'Registered Nurse',
  socialWorker: 'Social Worker',
  pharmacist: 'Clinical Pharmacist',
  nutritionist: 'Nutritionist',
  therapist: 'Therapist',
  homeHealth: 'Home Health Provider'
};

// Patient Status
export const PATIENT_STATUS = {
  new: 'New Patient',
  active: 'Active Care',
  monitoring: 'Monitoring',
  stable: 'Stable',
  highrisk: 'High Risk',
  transitioning: 'Care Transition',
  discharged: 'Discharged',
  followup: 'Follow-up Needed'
};