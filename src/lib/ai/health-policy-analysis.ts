import { mockPatients } from './mock-patient-data'

export function generateHealthPolicyAnalysis(patientName: string): string {
  // Find patient data or use default
  const patientKey = Object.keys(mockPatients).find(
    key => mockPatients[key].patientName.toLowerCase() === patientName.toLowerCase()
  )

  const patient = patientKey ? mockPatients[patientKey] : mockPatients['margaret thompson']
  const actualPatientName = patientKey ? patient.patientName : patientName

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return `# Comprehensive Healthcare Policy Analysis

**Patient:** ${actualPatientName}
**MRN:** ${patient.mrn}
**Date of Review:** ${currentDate}
**Insurance Carrier:** ${patient.carrier}
**Plan Type:** ${patient.planType}
**Member ID:** ${patient.subscriberId}
**Group Number:** ${patient.groupNumber}

---

## Executive Summary

This comprehensive analysis of ${actualPatientName}'s healthcare policy with ${patient.carrier} reveals critical coverage details, benefit utilization, and optimization opportunities. The ${patient.planType} plan provides comprehensive medical coverage with specific focus on managing chronic conditions and preventive care benefits.

### Key Findings
- **Coverage Status:** Active and in good standing
- **Deductible Progress:** $${patient.deductibles.individual.inNetwork - patient.deductibles.individual.remaining} met of $${patient.deductibles.individual.inNetwork} individual deductible
- **Out-of-Pocket Maximum:** $${patient.coverageLimits?.outOfPocketMax?.individual || '6,500'} individual / $${patient.coverageLimits?.outOfPocketMax?.family || '13,000'} family
- **Network Utilization:** Primarily in-network providers utilized
- **Prior Authorization Requirements:** ${patient.priorAuthRequired?.length || 3} procedures require authorization

---

## 1. Coverage Overview

### Plan Details
- **Plan Name:** ${patient.planType}
- **Coverage Type:** ${patient.relationshipToSubscriber === 'Self' ? 'Individual' : 'Family'}
- **Effective Date:** ${patient.effectiveDates.start}
- **Renewal Date:** January 1, 2025
- **Premium:** $450/month

### Coverage Levels
| Service Category | In-Network | Out-of-Network |
|-----------------|------------|----------------|
| Preventive Care | 100% covered | 70% after deductible |
| Primary Care | $${patient.copays.primaryCare} copay | 30% coinsurance |
| Specialist | $${patient.copays.specialist} copay | 40% coinsurance |
| Emergency Room | $${patient.copays.emergencyRoom} copay | $${patient.copays.emergencyRoom} copay |
| Urgent Care | $${patient.copays.urgentCare} copay | 30% coinsurance |

---

## 2. Deductible Analysis

### Individual Deductible
- **In-Network:** $${patient.deductibles.individual.inNetwork - patient.deductibles.individual.remaining} / $${patient.deductibles.individual.inNetwork}
- **Out-of-Network:** $0 / $${patient.deductibles.individual.outOfNetwork || '4000'}
- **Remaining:** $${patient.deductibles.individual.remaining}

### Family Deductible
- **In-Network:** $${patient.deductibles.family.inNetwork - patient.deductibles.family.remaining} / $${patient.deductibles.family.inNetwork}
- **Out-of-Network:** $0 / $${patient.deductibles.family.outOfNetwork || '8000'}
- **Remaining:** $${patient.deductibles.family.remaining}

**Projected Year-End Status:** Based on current utilization patterns, individual deductible expected to be met by Q3 2024.

---

## 3. Medical Services Coverage

### Covered Services
- Primary Care Visits
- Specialist Consultations
- Emergency Services
- Hospital Stays
- Diagnostic Tests
- Preventive Care

### Current Medical Conditions
${patient.currentConditions.map(condition => `- ${condition}`).join('\n')}

### Treatment Coverage Analysis
Based on current conditions, the following treatments are covered:
- Specialist consultations: Covered with $${patient.copays.specialist} copay
- Diagnostic testing: Covered after deductible (${patient.coinsurance.inNetwork}% coinsurance in-network)
- Ongoing therapy: Physical therapy covered up to 60 visits/year
- Durable medical equipment: ${100 - patient.coinsurance.inNetwork}% covered after deductible

---

## 4. Prescription Drug Coverage

### Formulary Tiers
| Tier | Description | Your Cost |
|------|-------------|-----------|
| Tier 1 | Generic | $${patient.copays.genericDrugs} |
| Tier 2 | Preferred Brand | $${patient.copays.brandDrugs} |
| Tier 3 | Non-Preferred Brand | $${patient.copays.brandDrugs + 20} |
| Tier 4 | Specialty | $${patient.copays.specialtyDrugs} |

### Current Medications
${patient.currentMedications.map(med => {
  return `- **${med.name}** (${med.dosage}, ${med.frequency}): ${med.coveredTier}`
}).join('\n')}

### Mail Order Benefits
- 90-day supply available with cost savings
- Free home delivery
- Automatic refill options available

---

## 5. Preventive Care Benefits

### Fully Covered Services (No Cost)
- Annual physical examination
- Routine blood work and lab tests
- Cancer screenings (age-appropriate)
- Immunizations (CDC recommended)
- Well-woman visits
- Preventive medications (aspirin, statins when indicated)

### Utilization This Year
- Last Physical: March 15, 2024
- Screenings Completed: 2 of 4 recommended
- Immunizations Current: Yes

---

## 6. Mental Health & Behavioral Coverage

### Coverage Details
- **Outpatient Therapy:** $30 copay per session
- **Inpatient Treatment:** Covered at ${100 - patient.coinsurance.inNetwork}% after deductible
- **Substance Abuse Treatment:** Covered same as medical benefits
- **Virtual Therapy:** $30 copay via telehealth

### Annual Limits
- Outpatient visits: Unlimited
- Inpatient days: 60 days per year
- Partial hospitalization: Covered as needed

---

## 7. Specialist & Referral Requirements

### Referral Policy
- **PCP Referral Required:** ${patient.networkType === 'HMO' ? 'Yes' : 'No'}
- **Self-Referral Allowed:** OB/GYN, Behavioral Health, Urgent Care
- **Prior Authorization Required:** See section below

### In-Network Specialists
Based on your conditions, recommended specialists in your network:
- Endocrinologist: Dr. Sarah Johnson - 2.5 miles
- Cardiologist: Dr. Michael Chen - 3.1 miles
- Rheumatologist: Dr. Emily Davis - 4.2 miles

---

## 8. Prior Authorization Requirements

### Procedures Requiring Authorization
${patient.priorAuthRequired.map(proc => `- ${proc}`).join('\n')}

### Authorization Process
1. Provider submits request electronically
2. Review completed within 72 hours (standard) or 24 hours (urgent)
3. Valid for 90 days from approval
4. Appeals available if denied

---

## 9. Out-of-Pocket Analysis

### Current Status
- **Individual Out-of-Pocket:** $${patient.deductibles.individual.inNetwork - patient.deductibles.individual.remaining} used / $${patient.coverageLimits?.outOfPocketMax?.individual || '6,500'} maximum
- **Family Out-of-Pocket:** $${patient.deductibles.family.inNetwork - patient.deductibles.family.remaining} used / $${patient.coverageLimits?.outOfPocketMax?.family || '13,000'} maximum

### Projected Annual Costs
| Category | YTD Actual | Projected Annual |
|----------|------------|------------------|
| Premiums | $${450 * 9} | $${450 * 12} |
| Deductibles | $${patient.deductibles.individual.inNetwork - patient.deductibles.individual.remaining} | $${patient.deductibles.individual.inNetwork} |
| Copays/Coinsurance | $${Math.max(0, (patient.deductibles.individual.inNetwork - patient.deductibles.individual.remaining) * 0.3).toFixed(0)} | $${Math.min(2500, (patient.deductibles.individual.inNetwork - patient.deductibles.individual.remaining) * 1.3).toFixed(0)} |
| **Total** | **$${450 * 9 + (patient.deductibles.individual.inNetwork - patient.deductibles.individual.remaining)}** | **$${450 * 12 + Math.min(patient.coverageLimits?.outOfPocketMax?.individual || 6500, patient.deductibles.individual.inNetwork + 2500)}** |

---

## 10. Network Optimization Opportunities

### Cost-Saving Recommendations

1. **Generic Substitutions Available**
   - Switching eligible medications could save ~$145/month

2. **Preventive Care Utilization**
   - Schedule remaining preventive screenings (no cost)
   - Complete annual wellness visit if not done

3. **Telemedicine Options**
   - Use virtual visits for routine follow-ups ($10 vs $${patient.copays.primaryCare})
   - 24/7 nurse hotline available at no cost

4. **Mail Order Pharmacy**
   - 90-day supplies save approximately 20% on maintenance medications

5. **In-Network Provider Selection**
   - Ensure all specialists are in-network to minimize costs
   - Use in-network labs and imaging centers

---

## 11. Appeals & Grievances

### Your Rights
- Appeal any coverage denial within 180 days
- External review available for medical necessity denials
- Expedited appeals for urgent situations (72-hour decision)

### Recent Claims History
- **Claims Submitted:** ${patient.recentClaims?.length || 3}
- **Claims Approved:** ${patient.recentClaims?.filter(c => c.status === 'Processed').length || 3}
- **Claims Pending:** ${patient.recentClaims?.filter(c => c.status === 'Pending').length || 0}
- **Claims Denied:** ${patient.recentClaims?.filter(c => c.status === 'Denied').length || 0}

---

## 12. Additional Benefits

### Value-Added Services
- **Gym Membership:** Discounted rates at participating facilities
- **Vision Discount:** 20% off frames and lenses at network providers
- **Alternative Medicine:** Acupuncture/Chiropractic with $${patient.copays.specialist} copay
- **Travel Coverage:** Emergency care covered worldwide
- **Health Rewards:** Earn points for healthy activities

### Digital Health Tools
- Mobile app for claims and benefits
- Find a doctor tool with ratings
- Cost estimator for procedures
- Prescription price checker
- Health assessment tools

---

## Recommendations

### Immediate Actions
1. Schedule remaining preventive screenings before year-end
2. Review generic alternatives for brand medications
3. Ensure all providers are in-network for 2025
4. Consider HSA contributions if eligible

### Coverage Optimization
1. Maximize preventive care benefits (no cost)
2. Use telemedicine for routine consultations
3. Coordinate care through PCP for referrals
4. Submit flexible spending account claims before deadline

### For Next Plan Year
1. Evaluate if current plan still meets needs
2. Consider supplemental coverage for gaps
3. Review provider network changes
4. Calculate optimal deductible level based on expected utilization

---

## Contact Information

### Member Services
- **Phone:** 1-800-${patient.carrier === 'United Healthcare' ? '555-8700' : patient.carrier === 'Blue Cross Blue Shield' ? '555-2583' : '555-4500'}
- **Online:** www.${patient.carrier.toLowerCase().replace(/\s+/g, '')}.com
- **Mobile App:** Available on iOS and Android

### Important Numbers
- **24/7 Nurse Line:** 1-800-555-6873
- **Prescription Benefits:** 1-800-555-7824
- **Mental Health Services:** 1-800-555-9455
- **Prior Authorization:** 1-800-555-2901

---

*This analysis is based on policy documents and coverage details as of ${currentDate}. Coverage details may change. Always verify current benefits with your insurance carrier before receiving services.*

**Report Generated by Arthur Health Intelligence Platform**
*Powered by Advanced Healthcare Analytics & AI*`
}