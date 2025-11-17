/**
 * Mock Patient and Healthcare Policy Data for Demo
 * This file contains mock patient and insurance policy data for healthcare demonstrations
 */

export interface PatientPolicyData {
  // Patient Information
  patientName: string;
  mrn: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  primaryCareProvider: string;

  // Insurance Information
  policyNumber: string;
  carrier: string;
  planType: string;
  groupNumber: string;
  subscriberId: string;
  relationshipToSubscriber: string;

  // Coverage Dates
  effectiveDates: {
    start: string;
    end: string;
  };

  // Coverage Details
  coverageLimits: {
    annualMaximum: number;
    outOfPocketMax: {
      individual: number;
      family: number;
    };
    lifetimeMaximum: string;
  };

  // Deductibles
  deductibles: {
    individual: {
      inNetwork: number;
      outOfNetwork: number;
      remaining: number;
    };
    family: {
      inNetwork: number;
      outOfNetwork: number;
      remaining: number;
    };
  };

  // Co-insurance and Co-pays
  coinsurance: {
    inNetwork: number; // percentage patient pays
    outOfNetwork: number;
  };

  copays: {
    primaryCare: number;
    specialist: number;
    urgentCare: number;
    emergencyRoom: number;
    genericDrugs: number;
    brandDrugs: number;
    specialtyDrugs: number;
  };

  // Benefits
  benefits: {
    preventiveCare: string;
    hospitalization: string;
    surgery: string;
    emergencyServices: string;
    mentalHealth: string;
    substanceAbuse: string;
    rehabilitation: string;
    dmeEquipment: string;
    homeHealthcare: string;
    skilledNursing: string;
    hospiceCare: string;
  };

  // Prior Authorization Requirements
  priorAuthRequired: string[];

  // Network Information
  networkType: string;
  networkTier: string;

  // Exclusions
  exclusions: string[];

  // Current Medical Conditions
  currentConditions: string[];

  // Current Medications
  currentMedications: {
    name: string;
    dosage: string;
    frequency: string;
    coveredTier: string;
  }[];

  // Recent Claims
  recentClaims: {
    date: string;
    provider: string;
    service: string;
    billedAmount: number;
    allowedAmount: number;
    paidByInsurance: number;
    patientResponsibility: number;
    status: string;
  }[];

  // Coverage Gaps and Opportunities
  coverageGaps?: string[];
  optimizationOpportunities?: string[];

  // Risk Factors
  riskFactors?: string[];
}

export const mockPatients: Record<string, PatientPolicyData> = {
  "margaret thompson": {
    patientName: "Margaret Thompson",
    mrn: "MRN-784512",
    dateOfBirth: "1951-03-15",
    age: 72,
    gender: "Female",
    primaryCareProvider: "Dr. Sarah Mitchell, MD",

    policyNumber: "BCA-2024-98745632",
    carrier: "Blue Cross Blue Shield",
    planType: "Medicare Advantage PPO",
    groupNumber: "MA-PPO-2024",
    subscriberId: "A987654321",
    relationshipToSubscriber: "Self",

    effectiveDates: {
      start: "January 1, 2024",
      end: "December 31, 2024"
    },

    coverageLimits: {
      annualMaximum: 0, // No annual maximum for Medicare Advantage
      outOfPocketMax: {
        individual: 7550,
        family: 7550
      },
      lifetimeMaximum: "Unlimited"
    },

    deductibles: {
      individual: {
        inNetwork: 500,
        outOfNetwork: 1500,
        remaining: 125
      },
      family: {
        inNetwork: 500,
        outOfNetwork: 1500,
        remaining: 125
      }
    },

    coinsurance: {
      inNetwork: 20,
      outOfNetwork: 40
    },

    copays: {
      primaryCare: 15,
      specialist: 45,
      urgentCare: 40,
      emergencyRoom: 150,
      genericDrugs: 10,
      brandDrugs: 45,
      specialtyDrugs: 150
    },

    benefits: {
      preventiveCare: "100% covered in-network, no deductible",
      hospitalization: "20% coinsurance after deductible",
      surgery: "20% coinsurance after deductible",
      emergencyServices: "$150 copay, waived if admitted",
      mentalHealth: "20% coinsurance after deductible",
      substanceAbuse: "20% coinsurance after deductible",
      rehabilitation: "20% coinsurance, 100 days per year",
      dmeEquipment: "20% coinsurance after deductible",
      homeHealthcare: "20% coinsurance, prior auth required",
      skilledNursing: "Days 1-20: $0, Days 21-100: $196/day",
      hospiceCare: "Covered under Medicare Part A"
    },

    priorAuthRequired: [
      "MRI/CT/PET scans",
      "Inpatient hospital stays",
      "Skilled nursing facility",
      "Home health services",
      "DME over $500",
      "Specialty medications",
      "Physical therapy beyond 20 visits",
      "Non-emergency ambulance transport"
    ],

    networkType: "PPO",
    networkTier: "Preferred",

    exclusions: [
      "Cosmetic surgery",
      "Experimental treatments",
      "Long-term care",
      "Dental care (except injury)",
      "Routine eye exams and glasses",
      "Hearing aids"
    ],

    currentConditions: [
      "Congestive Heart Failure (CHF)",
      "Type 2 Diabetes",
      "Hypertension",
      "Chronic Kidney Disease Stage 3",
      "Obesity"
    ],

    currentMedications: [
      { name: "Metformin", dosage: "1000mg", frequency: "Twice daily", coveredTier: "Tier 1 - Generic" },
      { name: "Lisinopril", dosage: "10mg", frequency: "Once daily", coveredTier: "Tier 1 - Generic" },
      { name: "Furosemide", dosage: "40mg", frequency: "Once daily", coveredTier: "Tier 1 - Generic" },
      { name: "Carvedilol", dosage: "25mg", frequency: "Twice daily", coveredTier: "Tier 1 - Generic" },
      { name: "Jardiance", dosage: "10mg", frequency: "Once daily", coveredTier: "Tier 3 - Brand" }
    ],

    recentClaims: [
      {
        date: "2024-10-15",
        provider: "Cardiac Associates",
        service: "Cardiology Consultation",
        billedAmount: 450,
        allowedAmount: 285,
        paidByInsurance: 228,
        patientResponsibility: 57,
        status: "Processed"
      },
      {
        date: "2024-10-01",
        provider: "Regional Medical Center",
        service: "Echocardiogram",
        billedAmount: 1200,
        allowedAmount: 850,
        paidByInsurance: 680,
        patientResponsibility: 170,
        status: "Processed"
      },
      {
        date: "2024-09-20",
        provider: "Lab Corp",
        service: "HbA1c, Lipid Panel, BMP",
        billedAmount: 320,
        allowedAmount: 180,
        paidByInsurance: 144,
        patientResponsibility: 36,
        status: "Processed"
      }
    ],

    coverageGaps: [
      "No coverage for continuous glucose monitoring devices",
      "Limited coverage for cardiac rehabilitation programs",
      "High copay for Jardiance (SGLT2 inhibitor) - consider prior auth for lower tier",
      "No coverage for weight management programs",
      "Limited mental health provider network"
    ],

    optimizationOpportunities: [
      "Eligible for $0 copay generic medications through mail-order pharmacy",
      "Qualify for chronic care management program with reduced copays",
      "Prior auth available for Jardiance to reduce to Tier 2 copay",
      "Silver Sneakers gym membership benefit not utilized",
      "Preventive care benefits underutilized - annual wellness visit available"
    ],

    riskFactors: [
      "Multiple chronic conditions requiring coordination",
      "High readmission risk (68% per predictive model)",
      "Polypharmacy concerns with 5+ medications",
      "Limited family support system",
      "Sedentary lifestyle"
    ]
  },

  "robert chen": {
    patientName: "Robert Chen",
    mrn: "MRN-329847",
    dateOfBirth: "1985-07-22",
    age: 39,
    gender: "Male",
    primaryCareProvider: "Dr. Michael Johnson, MD",

    policyNumber: "UHC-EPO-456789",
    carrier: "UnitedHealthcare",
    planType: "EPO - Exclusive Provider Organization",
    groupNumber: "GRP-TECH-2024",
    subscriberId: "U123456789",
    relationshipToSubscriber: "Self",

    effectiveDates: {
      start: "January 1, 2024",
      end: "December 31, 2024"
    },

    coverageLimits: {
      annualMaximum: 0,
      outOfPocketMax: {
        individual: 3000,
        family: 6000
      },
      lifetimeMaximum: "Unlimited"
    },

    deductibles: {
      individual: {
        inNetwork: 1000,
        outOfNetwork: 0, // EPO has no out-of-network coverage
        remaining: 600
      },
      family: {
        inNetwork: 2000,
        outOfNetwork: 0,
        remaining: 1400
      }
    },

    coinsurance: {
      inNetwork: 20,
      outOfNetwork: 0 // No coverage
    },

    copays: {
      primaryCare: 25,
      specialist: 50,
      urgentCare: 75,
      emergencyRoom: 250,
      genericDrugs: 10,
      brandDrugs: 35,
      specialtyDrugs: 100
    },

    benefits: {
      preventiveCare: "100% covered in-network",
      hospitalization: "20% coinsurance after deductible",
      surgery: "20% coinsurance after deductible",
      emergencyServices: "$250 copay plus 20% coinsurance",
      mentalHealth: "$25 copay for therapy, 20% coinsurance inpatient",
      substanceAbuse: "Same as mental health",
      rehabilitation: "20% coinsurance, 60 visits combined PT/OT/ST",
      dmeEquipment: "20% coinsurance after deductible",
      homeHealthcare: "20% coinsurance, 100 visits per year",
      skilledNursing: "20% coinsurance, 120 days per year",
      hospiceCare: "20% coinsurance"
    },

    priorAuthRequired: [
      "Advanced imaging (MRI, CT, PET)",
      "Genetic testing",
      "Sleep studies",
      "Bariatric surgery",
      "Spine surgery",
      "Joint replacement",
      "Specialty medications"
    ],

    networkType: "EPO",
    networkTier: "Standard",

    exclusions: [
      "Out-of-network services (except emergency)",
      "Cosmetic procedures",
      "Infertility treatments beyond diagnosis",
      "Weight loss programs",
      "Acupuncture"
    ],

    currentConditions: [
      "Type 1 Diabetes",
      "Hypothyroidism",
      "Mild Depression"
    ],

    currentMedications: [
      { name: "Insulin Humalog", dosage: "Per sliding scale", frequency: "With meals", coveredTier: "Tier 2 - Preferred Brand" },
      { name: "Insulin Lantus", dosage: "28 units", frequency: "Once daily", coveredTier: "Tier 3 - Non-Preferred Brand" },
      { name: "Levothyroxine", dosage: "125mcg", frequency: "Once daily", coveredTier: "Tier 1 - Generic" },
      { name: "Sertraline", dosage: "50mg", frequency: "Once daily", coveredTier: "Tier 1 - Generic" }
    ],

    recentClaims: [
      {
        date: "2024-10-10",
        provider: "Endocrine Associates",
        service: "Diabetes Management Visit",
        billedAmount: 350,
        allowedAmount: 225,
        paidByInsurance: 175,
        patientResponsibility: 50,
        status: "Processed"
      },
      {
        date: "2024-09-15",
        provider: "Quest Diagnostics",
        service: "HbA1c, TSH, Comprehensive Panel",
        billedAmount: 280,
        allowedAmount: 140,
        paidByInsurance: 0,
        patientResponsibility: 140,
        status: "Applied to Deductible"
      }
    ],

    coverageGaps: [
      "No coverage for continuous glucose monitoring without prior auth",
      "Limited mental health provider network",
      "No out-of-network coverage for specialists",
      "Insulin Lantus on non-preferred tier"
    ],

    optimizationOpportunities: [
      "Switch to biosimilar insulin (Semglee) for lower copay",
      "Eligible for diabetes management program with CGM coverage",
      "Telemedicine mental health visits have lower copay ($10)",
      "Preventive dental and vision exams available through employer"
    ]
  },

  "emily rodriguez": {
    patientName: "Emily Rodriguez",
    mrn: "MRN-567234",
    dateOfBirth: "1992-11-30",
    age: 31,
    gender: "Female",
    primaryCareProvider: "Dr. Jennifer Park, MD",

    policyNumber: "AET-HMO-789456",
    carrier: "Aetna",
    planType: "HMO - Health Maintenance Organization",
    groupNumber: "HMO-HLTH-2024",
    subscriberId: "W987654321",
    relationshipToSubscriber: "Spouse",

    effectiveDates: {
      start: "January 1, 2024",
      end: "December 31, 2024"
    },

    coverageLimits: {
      annualMaximum: 0,
      outOfPocketMax: {
        individual: 2500,
        family: 5000
      },
      lifetimeMaximum: "Unlimited"
    },

    deductibles: {
      individual: {
        inNetwork: 500,
        outOfNetwork: 0, // HMO has no out-of-network coverage
        remaining: 500
      },
      family: {
        inNetwork: 1000,
        outOfNetwork: 0,
        remaining: 1000
      }
    },

    coinsurance: {
      inNetwork: 10,
      outOfNetwork: 0
    },

    copays: {
      primaryCare: 20,
      specialist: 40,
      urgentCare: 50,
      emergencyRoom: 200,
      genericDrugs: 5,
      brandDrugs: 25,
      specialtyDrugs: 75
    },

    benefits: {
      preventiveCare: "100% covered including prenatal care",
      hospitalization: "10% coinsurance after deductible",
      surgery: "10% coinsurance after deductible",
      emergencyServices: "$200 copay plus 10% coinsurance",
      mentalHealth: "$20 copay outpatient, 10% coinsurance inpatient",
      substanceAbuse: "Same as mental health",
      rehabilitation: "$40 copay per visit, 30 visits per year",
      dmeEquipment: "10% coinsurance after deductible",
      homeHealthcare: "10% coinsurance, 60 visits per year",
      skilledNursing: "10% coinsurance, 100 days per year",
      hospiceCare: "Covered 100%"
    },

    priorAuthRequired: [
      "All specialist referrals",
      "Hospital admissions",
      "Advanced imaging",
      "Physical therapy beyond 12 visits",
      "Specialty medications",
      "Fertility treatments"
    ],

    networkType: "HMO",
    networkTier: "Standard",

    exclusions: [
      "Out-of-network care (except emergency)",
      "Cosmetic surgery",
      "Alternative medicine",
      "Weight loss surgery without medical necessity"
    ],

    currentConditions: [
      "Pregnancy (28 weeks)",
      "Gestational Diabetes",
      "Iron Deficiency Anemia"
    ],

    currentMedications: [
      { name: "Prenatal Vitamins", dosage: "1 tablet", frequency: "Once daily", coveredTier: "Tier 1 - Generic" },
      { name: "Ferrous Sulfate", dosage: "325mg", frequency: "Twice daily", coveredTier: "Tier 1 - Generic" },
      { name: "Insulin (Novolin N)", dosage: "As directed", frequency: "Twice daily", coveredTier: "Tier 2 - Preferred Brand" }
    ],

    recentClaims: [
      {
        date: "2024-10-18",
        provider: "Women's Health Center",
        service: "Prenatal Visit",
        billedAmount: 250,
        allowedAmount: 180,
        paidByInsurance: 180,
        patientResponsibility: 0,
        status: "Processed"
      },
      {
        date: "2024-10-05",
        provider: "Regional Medical Imaging",
        service: "Obstetric Ultrasound",
        billedAmount: 450,
        allowedAmount: 320,
        paidByInsurance: 320,
        patientResponsibility: 0,
        status: "Processed"
      }
    ],

    coverageGaps: [
      "Limited coverage for lactation consultants",
      "No coverage for birthing classes",
      "Breast pump coverage requires specific DME vendors",
      "Limited postpartum mental health support"
    ],

    optimizationOpportunities: [
      "Eligible for maternity care coordination program",
      "Free breast pump available through DME benefit",
      "Postpartum care covered 100% for 12 weeks",
      "Newborn care covered from birth if added within 30 days",
      "Diabetes supplies covered 100% during pregnancy"
    ]
  }
}

// Helper function to get patient by name (case-insensitive)
export function getPatientData(name: string): PatientPolicyData | null {
  const normalizedName = name.toLowerCase().trim()
  return mockPatients[normalizedName] || null
}

// Function to generate comprehensive policy analysis
export function generatePolicyAnalysis(patient: PatientPolicyData): string {
  const deductibleProgress = ((patient.deductibles.individual.inNetwork - patient.deductibles.individual.remaining) / patient.deductibles.individual.inNetwork * 100).toFixed(0)

  return `
## Comprehensive Healthcare Policy Analysis

### Patient Information
**Name:** ${patient.patientName}
**MRN:** ${patient.mrn}
**Age:** ${patient.age} years
**Primary Care Provider:** ${patient.primaryCareProvider}

### Insurance Coverage Summary
**Carrier:** ${patient.carrier}
**Plan Type:** ${patient.planType}
**Policy Number:** ${patient.policyNumber}
**Group Number:** ${patient.groupNumber}
**Coverage Period:** ${patient.effectiveDates.start} - ${patient.effectiveDates.end}

### Financial Summary
**Deductible Status:**
- Individual: $${patient.deductibles.individual.remaining} remaining of $${patient.deductibles.individual.inNetwork} (${deductibleProgress}% met)
- Out-of-Pocket Maximum: $${patient.coverageLimits.outOfPocketMax.individual}

**Cost-Sharing:**
- In-Network Coinsurance: ${patient.coinsurance.inNetwork}%
- Primary Care Copay: $${patient.copays.primaryCare}
- Specialist Copay: $${patient.copays.specialist}

### Current Medical Profile
**Active Conditions:**
${patient.currentConditions.map(c => `- ${c}`).join('\n')}

**Current Medications:**
${patient.currentMedications.map(m => `- ${m.name} (${m.dosage}) - ${m.coveredTier}`).join('\n')}

### Prior Authorization Requirements
${patient.priorAuthRequired.slice(0, 5).map(r => `- ${r}`).join('\n')}

### Coverage Gaps Identified
${patient.coverageGaps?.map(g => `⚠️ ${g}`).join('\n')}

### Cost Optimization Opportunities
${patient.optimizationOpportunities?.map(o => `✅ ${o}`).join('\n')}

### Recent Claims Activity
${patient.recentClaims.slice(0, 3).map(c =>
  `- ${c.date}: ${c.service} - Patient responsibility: $${c.patientResponsibility}`
).join('\n')}

### Recommendations
1. **Immediate Actions:**
   - Review prior authorization requirements for upcoming procedures
   - Consider generic alternatives for Tier 3 medications
   - Utilize preventive care benefits (100% covered)

2. **Cost Savings Opportunities:**
   - Switch to mail-order pharmacy for maintenance medications
   - Explore patient assistance programs for specialty drugs
   - Use in-network providers to minimize out-of-pocket costs

3. **Care Coordination:**
   - Ensure all specialists have current insurance information
   - Coordinate care through PCP for HMO referrals
   - Document medical necessity for prior authorizations

This analysis is based on current policy information as of ${new Date().toLocaleDateString()}.
`
}