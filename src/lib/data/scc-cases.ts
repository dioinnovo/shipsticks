// Real SCC Case Studies Data
// Based on actual client victories from strategicclaimconsultants.com/client-results/

export interface SCCCase {
  id: string;
  clientName: string;
  propertyType: string;
  location: {
    city: string;
    state: string;
  };
  damage: {
    type: string;
    event: string; // e.g., "Hurricane Michael"
    category?: string; // e.g., "Category 5"
    date: string;
  };
  settlement: {
    initialOffer: number | null;
    finalSettlement: number | null;
    increase: number; // percentage increase
    timeline: string;
  };
  status: 'Successfully Settled' | 'In Negotiation' | 'Active';
  description: string;
  highlights: string[];
  image?: string;
}

export const SCC_CASES: SCCCase[] = [
  {
    id: 'shrimp-boat',
    clientName: 'The Shrimp Boat',
    propertyType: 'Restaurant/Hospitality',
    location: {
      city: 'Panama City Beach',
      state: 'FL'
    },
    damage: {
      type: 'Hurricane/Wind/Water',
      event: 'Hurricane Michael',
      category: 'Category 5',
      date: '2018-10-10'
    },
    settlement: {
      initialOffer: 275000,
      finalSettlement: 1945000,
      increase: 607, // 607% increase
      timeline: '9 months to rebuild'
    },
    status: 'Successfully Settled',
    description: 'Coastal restaurant devastated by Category 5 hurricane. Insurance initially denied coverage claiming flood damage exclusion. SCC proved wind-driven rain was primary cause.',
    highlights: [
      'Complete structural loss',
      'Initial coverage denial overturned',
      'Full rebuild funded',
      'Business interruption recovered'
    ],
    image: '/images/cases/shrimp-boat.jpg'
  },
  {
    id: 'cinnamon-shore',
    clientName: 'Cinnamon Shore',
    propertyType: 'Resort/Mixed-Use Development',
    location: {
      city: 'Port Aransas',
      state: 'TX'
    },
    damage: {
      type: 'Hurricane/Flood/Wind',
      event: 'Hurricane Harvey',
      date: '2017-08-25'
    },
    settlement: {
      initialOffer: 144000,
      finalSettlement: 9700000,
      increase: 6636, // 67x increase
      timeline: '12 months to rebuild'
    },
    status: 'Successfully Settled',
    description: 'Luxury coastal resort community with extensive property damage. Initial offer was 1.5% of actual damages. SCC secured 67x increase in settlement.',
    highlights: [
      '67x settlement increase',
      'Multiple building recovery',
      'Full amenity restoration',
      'Largest resort settlement in region'
    ],
    image: '/images/cases/cinnamon-shore.jpg'
  },
  {
    id: 'lands-end',
    clientName: "Land's End",
    propertyType: 'Residential Tower/Condominium',
    location: {
      city: 'Orange Beach',
      state: 'AL'
    },
    damage: {
      type: 'Hurricane/Wind/Water',
      event: 'Hurricane Sally',
      date: '2020-09-16'
    },
    settlement: {
      initialOffer: 1234000,
      finalSettlement: 15700000,
      increase: 1172, // 12.7x increase
      timeline: 'Complex multi-phase'
    },
    status: 'Successfully Settled',
    description: 'High-rise condominium with multiple layers of structural damage. Catastrophic damage to roof, exterior, and water intrusion throughout.',
    highlights: [
      'Largest condo settlement in region',
      'Complex structural repairs',
      'Multiple insurance layers navigated',
      'Full restoration achieved'
    ],
    image: '/images/cases/lands-end.jpg'
  },
  {
    id: 'ocean-towers',
    clientName: 'Ocean Towers',
    propertyType: 'Commercial Tower',
    location: {
      city: 'Panama City Beach',
      state: 'FL'
    },
    damage: {
      type: 'Hurricane/Structural',
      event: 'Hurricane Michael',
      category: 'Category 5',
      date: '2018-10-10'
    },
    settlement: {
      initialOffer: null, // Under review
      finalSettlement: null, // TBD
      increase: 0, // TBD
      timeline: 'Active negotiation'
    },
    status: 'In Negotiation',
    description: 'Commercial high-rise with extensive facade and structural damage. Initial offer under review, expecting significant increase based on SCC assessment.',
    highlights: [
      'Active large-loss claim',
      'Structural engineering disputes',
      'Code upgrade requirements',
      'Multi-million dollar exposure'
    ],
    image: '/images/cases/ocean-towers.jpg'
  }
];

// Statistics for dashboard based on SCC's actual track record
export const SCC_STATISTICS = {
  totalRecovered: 2000000000, // $2+ billion
  yearsExperience: 300,
  averageIncrease: 2000, // 20x average
  successRate: 98,
  activeClaims: 47,
  catClaimsHandled: 500,
  states: ['FL', 'TX', 'LA', 'AL', 'MS', 'GA', 'SC', 'NC']
};

// Helper functions for data access
export function getCaseById(id: string): SCCCase | undefined {
  return SCC_CASES.find(sccCase => sccCase.id === id);
}

export function getCasesByStatus(status: SCCCase['status']): SCCCase[] {
  return SCC_CASES.filter(sccCase => sccCase.status === status);
}

export function getCasesByState(state: string): SCCCase[] {
  return SCC_CASES.filter(sccCase => sccCase.location.state === state);
}

export function getSettledCases(): SCCCase[] {
  return SCC_CASES.filter(sccCase => sccCase.status === 'Successfully Settled');
}

export function getActiveCases(): SCCCase[] {
  return SCC_CASES.filter(sccCase => sccCase.status === 'In Negotiation' || sccCase.status === 'Active');
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

// Calculate percentage increase
export function calculateIncrease(initial: number | null, final: number | null): string {
  if (!initial || !final) return 'TBD';
  const increase = ((final - initial) / initial) * 100;
  return `${Math.round(increase)}%`;
}