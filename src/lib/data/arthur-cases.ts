// Arthur Health Case Studies Data
// Real-world care coordination success stories demonstrating value-based care outcomes

export interface ArthurCase {
  id: string;
  patientProfile: string;
  careType: string;
  location: {
    city: string;
    state: string;
  };
  condition: {
    type: string;
    diagnosis: string;
    complexity?: string;
    startDate: string;
  };
  outcomes: {
    baselineCost: number;
    optimizedCost: number;
    savingsPercentage: number;
    timeline: string;
    qualityScore: number;
  };
  status: 'Successfully Completed' | 'In Progress' | 'Active Monitoring';
  description: string;
  highlights: string[];
  metrics?: {
    hospitalReadmissions?: string;
    adherence?: number;
    qualityImprovement?: number;
  };
}

export const ARTHUR_CASES: ArthurCase[] = [
  {
    id: 'complex-diabetes',
    patientProfile: 'High-Risk Diabetes Patient',
    careType: 'Chronic Disease Management',
    location: {
      city: 'Houston',
      state: 'TX'
    },
    condition: {
      type: 'Type 2 Diabetes with Complications',
      diagnosis: 'Uncontrolled T2DM, A1C 10.2%',
      complexity: 'Multiple Comorbidities',
      startDate: '2024-01-15'
    },
    outcomes: {
      baselineCost: 28500,
      optimizedCost: 12400,
      savingsPercentage: 56,
      timeline: '6 months',
      qualityScore: 94
    },
    status: 'Successfully Completed',
    description: 'Patient with uncontrolled diabetes and multiple ER visits. Arthur AI identified gaps in care, coordinated specialist referrals, and implemented medication management program. A1C reduced to 7.1%, zero ER visits in 6 months.',
    highlights: [
      '56% cost reduction achieved',
      'A1C improved from 10.2% to 7.1%',
      'Zero hospital readmissions',
      'Medication adherence 95%+'
    ],
    metrics: {
      hospitalReadmissions: '0 in 6 months',
      adherence: 95,
      qualityImprovement: 87
    }
  },
  {
    id: 'chf-management',
    patientProfile: 'Congestive Heart Failure Patient',
    careType: 'High-Touch Care Coordination',
    location: {
      city: 'Miami',
      state: 'FL'
    },
    condition: {
      type: 'CHF NYHA Class III',
      diagnosis: 'Chronic Heart Failure',
      complexity: 'High Readmission Risk',
      startDate: '2024-02-01'
    },
    outcomes: {
      baselineCost: 45000,
      optimizedCost: 18200,
      savingsPercentage: 60,
      timeline: '8 months',
      qualityScore: 96
    },
    status: 'Active Monitoring',
    description: 'High-utilizer patient with 4 hospital admissions in prior 6 months. Arthur CareNexus implemented remote monitoring, medication optimization, and proactive care team coordination. Reduced readmissions by 100%, improved quality of life scores.',
    highlights: [
      '60% monthly cost reduction',
      '100% reduction in readmissions',
      'Remote monitoring implemented',
      'NYHA Class improved to II'
    ],
    metrics: {
      hospitalReadmissions: '0 vs 4 baseline',
      adherence: 98,
      qualityImprovement: 92
    }
  },
  {
    id: 'post-surgical',
    patientProfile: 'Post-Acute Care Patient',
    careType: 'Transition Care Management',
    location: {
      city: 'Phoenix',
      state: 'AZ'
    },
    condition: {
      type: 'Total Hip Replacement Recovery',
      diagnosis: 'Post-surgical rehabilitation',
      complexity: 'Complex discharge planning',
      startDate: '2024-03-10'
    },
    outcomes: {
      baselineCost: 32000,
      optimizedCost: 19500,
      savingsPercentage: 39,
      timeline: '90-day episode',
      qualityScore: 98
    },
    status: 'Successfully Completed',
    description: 'Post-surgical patient requiring coordinated home health, PT/OT, and DME setup. Arthur platform streamlined discharge planning, coordinated all providers, and monitored recovery remotely. Patient exceeded recovery milestones, zero complications.',
    highlights: [
      'Seamless care transitions',
      'Zero post-discharge complications',
      'Exceeded recovery milestones',
      '39% cost savings vs baseline'
    ],
    metrics: {
      hospitalReadmissions: '0 readmissions',
      adherence: 92,
      qualityImprovement: 96
    }
  },
  {
    id: 'behavioral-health',
    patientProfile: 'Behavioral Health Crisis Patient',
    careType: 'Integrated Care Coordination',
    location: {
      city: 'Seattle',
      state: 'WA'
    },
    condition: {
      type: 'Depression with Substance Use',
      diagnosis: 'Major Depressive Disorder',
      complexity: 'High Utilizer',
      startDate: '2024-02-20'
    },
    outcomes: {
      baselineCost: 52000,
      optimizedCost: 21800,
      savingsPercentage: 58,
      timeline: '6 months ongoing',
      qualityScore: 89
    },
    status: 'In Progress',
    description: 'High-cost patient with frequent ER visits and hospitalizations for behavioral health crises. Arthur AI connected patient with integrated care team including psychiatry, therapy, peer support, and housing assistance. Stabilized with outpatient management.',
    highlights: [
      '58% cost reduction',
      'Connected to community resources',
      'Stable housing secured',
      'Weekly therapy adherence 100%'
    ],
    metrics: {
      hospitalReadmissions: '1 vs 6 baseline',
      adherence: 87,
      qualityImprovement: 84
    }
  }
];

// Statistics for dashboard based on Arthur Health's care coordination outcomes
export const ARTHUR_STATISTICS = {
  totalCostSavings: 125000000, // $125M+ in healthcare cost savings
  patientsServed: 15000,
  averageSavings: 48, // 48% average cost reduction
  qualityScore: 94, // Average quality score
  activePatients: 1247,
  carePathways: 12,
  providerNetwork: ['Primary Care', 'Specialists', 'Home Health', 'Behavioral Health', 'Post-Acute']
};

// Helper functions for data access
export function getCaseById(id: string): ArthurCase | undefined {
  return ARTHUR_CASES.find(arthurCase => arthurCase.id === id);
}

export function getCasesByStatus(status: ArthurCase['status']): ArthurCase[] {
  return ARTHUR_CASES.filter(arthurCase => arthurCase.status === status);
}

export function getCasesByState(state: string): ArthurCase[] {
  return ARTHUR_CASES.filter(arthurCase => arthurCase.location.state === state);
}

export function getCompletedCases(): ArthurCase[] {
  return ARTHUR_CASES.filter(arthurCase => arthurCase.status === 'Successfully Completed');
}

export function getActiveCases(): ArthurCase[] {
  return ARTHUR_CASES.filter(arthurCase => arthurCase.status === 'In Progress' || arthurCase.status === 'Active Monitoring');
}

// Format currency for display
export function formatCurrency(amount: number | null): string {
  if (amount === null) return 'TBD';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Calculate cost savings
export function calculateSavings(baseline: number, optimized: number): string {
  const savings = baseline - optimized;
  return formatCurrency(savings);
}

// Calculate savings percentage
export function calculateSavingsPercentage(baseline: number, optimized: number): string {
  const percentage = ((baseline - optimized) / baseline) * 100;
  return `${Math.round(percentage)}%`;
}
