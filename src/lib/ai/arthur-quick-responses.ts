/**
 * Arthur Quick Demo Responses
 * Varied, realistic responses for healthcare policy questions
 */

import { getPatientData } from './mock-patient-data'

interface ResponseTemplate {
  pattern: RegExp
  responses: ((patientName?: string) => string)[]
}

// Varied response templates for different question types
const responseTemplates: ResponseTemplate[] = [
  // RAG-Based Questions (No Patient Context Required)

  // General Specialist Wait Times (Network-wide RAG query)
  {
    pattern: /who are.*specialist.*shortest|specialist.*shortest wait|show.*specialist.*wait time/i,
    responses: [
      () => {
        return `## Specialists with Shortest Wait Times

**Real-time network availability across all specialties:**

**Cardiology**
• Dr. Sarah Chen, MD - Metro Heart & Vascular
  Next Available: **Tomorrow, 2:00 PM**
  Wait Time: 1 day
  In-network • 4.9/5 rating (412 reviews)
  Specializes in: Heart failure, preventive cardiology

• Dr. Amanda Foster, MD - Regional Cardiac Center
  Next Available: **Thursday, 10:30 AM**
  Wait Time: 3 days
  In-network • 4.8/5 rating (387 reviews)
  Specializes in: CHF management, cardiac rehab

**Endocrinology**
• Dr. Robert Kim, MD - Advanced Diabetes Center
  Next Available: **Friday, 9:00 AM**
  Wait Time: 4 days
  In-network • 4.9/5 rating (298 reviews)
  Specializes in: Type 2 diabetes, insulin management

• Dr. Jennifer Wu, DO - Endocrine Associates
  Next Available: **Next Monday, 1:00 PM**
  Wait Time: 6 days
  In-network • 4.7/5 rating (245 reviews)
  Specializes in: Diabetes, thyroid disorders

**Orthopedics/MSK**
• Dr. Michael Roberts, MD - Sports Medicine Center
  Next Available: **Today, 4:30 PM**
  Wait Time: Same day
  In-network • 4.8/5 rating (521 reviews)
  Specializes in: Joint pain, sports injuries

• Dr. Lisa Martinez, MD - Orthopedic Specialists
  Next Available: **Tomorrow, 11:00 AM**
  Wait Time: 1 day
  In-network • 4.9/5 rating (456 reviews)
  Specializes in: Arthritis, joint replacement

**Physical Therapy**
• Valley Physical Therapy Center
  Next Available: **Today, 3:00 PM**
  Wait Time: Same day
  In-network • 4.7/5 rating (612 reviews)
  Multiple therapists available

**Neurology**
• Dr. David Park, MD - Neuroscience Institute
  Next Available: **Next Tuesday, 8:30 AM**
  Wait Time: 7 days
  In-network • 4.8/5 rating (334 reviews)
  Specializes in: Headaches, neuropathy

**High-Risk OB/GYN**
• Dr. Emily Rodriguez, MD - Maternal-Fetal Medicine
  Next Available: **Wednesday, 2:00 PM**
  Wait Time: 2 days
  In-network • 4.9/5 rating (278 reviews)
  Specializes in: High-risk pregnancy

**Network Performance Summary:**
• Average wait time across all specialties: 3.2 days
• Same-day appointments available in 3 specialties
• 85% of specialties have availability within 1 week
• All providers accepting new patients

Would you like me to book an appointment or check specific insurance coverage?`
      }
    ]
  },

  // Provider Network Availability (General RAG query)
  {
    pattern: /show.*provider network|network availability|provider.*available today/i,
    responses: [
      () => {
        return `## Provider Network Availability - Real-Time Status

**Network Capacity Analysis:**

**Primary Care Physicians:**
• 24 providers with availability this week
• 8 providers with same-day appointments
• Average wait time: **1.8 days**
• Network utilization: 68% (Good availability)

**Specialist Services:**
• Cardiology: 6 providers accepting patients (2-4 day wait)
• Endocrinology: 4 providers (4-7 day wait)
• Orthopedics: 9 providers (same day - 3 days)
• Neurology: 3 providers (5-10 day wait)
• Physical Therapy: 12 locations (same day available)
• Mental Health: 15 providers (1-5 day wait)

**Urgent & Emergency Services:**
• 7 Urgent Care centers within 10 miles
  Average current wait: **12 minutes**
  All accepting walk-ins

• 3 Emergency Rooms nearby
  Current average wait: **18 minutes**
  All facilities at 72% capacity

**Hospital Facilities:**
• Regional Medical Center
  Bed availability: 82% capacity
  Elective surgery: 1-2 week scheduling
  Status: Accepting all admissions

• Valley General Hospital
  Bed availability: 71% capacity
  Elective surgery: 2-3 week scheduling
  Status: Accepting all admissions

**Telehealth Services:**
• Virtual visits available 24/7
• Average connection time: Under 5 minutes
• 45 providers offering telehealth
• Copay: $25 (vs $30-60 in-person)

**After-Hours Care:**
• 4 Extended-hours clinics (open until 10 PM)
• 2 Weekend-only clinics (Saturday-Sunday)
• Nurse triage line: 24/7 available

**Specialist Booking Recommendations:**
Best booking window: **Next 7-14 days**
Peak availability: **Tuesdays and Thursdays**
Lowest wait times: **Morning slots (8-10 AM)**

**Network Alerts:**
• All critical specialties within normal capacity
• No service delays anticipated
• Flu season: Primary care wait times +20%

Would you like me to identify immediate appointment options or check coverage for a specific service?`
      }
    ]
  },

  // Prior Authorization Turnaround Times (RAG query)
  {
    pattern: /prior authorization.*time|PA.*turnaround|authorization.*how long/i,
    responses: [
      () => {
        return `## Prior Authorization Turnaround Times

**Current Processing Times by Service Type:**

**Fast-Track Services (24-48 hours):**
• Urgent medications (life-threatening conditions)
• Post-discharge home health
• Urgent imaging (CT/MRI with clinical urgency)
• Emergency DME (oxygen, mobility devices)
• Mental health crisis services
**Average approval time: 36 hours**

**Standard Services (3-5 business days):**
• Non-urgent specialist referrals
• Physical therapy (initial 20 visits)
• Non-urgent imaging (MRI, CT, PET)
• Routine procedures
• Non-urgent medications
**Average approval time: 4.2 days**

**Complex Services (5-10 business days):**
• High-cost biologics and specialty drugs
• Surgical procedures
• Extended therapy (beyond standard limits)
• Home infusion services
• Advanced imaging series
**Average approval time: 7.5 days**

**By Major Carriers:**
• Aetna: 3.8 days average
• Blue Cross: 4.2 days average
• UnitedHealthcare: 4.5 days average
• Cigna: 3.9 days average
• Medicare Advantage: 5.2 days average

**Specialty Medications:**
• Tier 3 drugs: 2-4 days
• Tier 4 specialty drugs: 5-7 days
• Biologics: 7-10 days
• Compound medications: 10-14 days

**Common Procedures:**
• Physical Therapy: 2-3 days
• MRI/CT scans: 3-5 days
• Surgical procedures: 7-10 days
• Sleep studies: 4-6 days
• Cardiac catheterization: 5-7 days

**Expedited Processing Available For:**
• Clinical urgency documented
• Post-hospitalization continuity of care
• Active cancer treatment
• Acute pain management
• Risk of permanent impairment

**Tips to Reduce PA Time:**
1. Include complete clinical documentation upfront
2. Use CPT codes in initial request
3. Attach recent medical records
4. Request peer-to-peer review if urgent
5. Follow up at 48-hour mark

**Auto-Approval Services (No PA Required):**
• Primary care visits
• Preventive care services
• Emergency room visits
• Generic medications (Tiers 1-2)
• Basic lab work and X-rays
• Annual wellness exams

**Current System Performance:**
• 92% approval rate on first submission
• 8% require additional information
• Average resubmission adds 3-4 days
• Peer-to-peer reviews resolve 75% of denials

Would you like help submitting a prior authorization or checking requirements for a specific service?`
      }
    ]
  },

  // Care Coordination - Fastest Specialist (Core Arthur Health feature)
  {
    pattern: /find.*fastest|shortest wait|fastest.*specialist|quickest.*appointment/i,
    responses: [
      (patientName) => {
        const patient = patientName ? getPatientData(patientName) : null
        const specialty = patient?.currentConditions.some(c => c.toLowerCase().includes('diabetes')) ? 'Endocrinology' :
                         patient?.currentConditions.some(c => c.toLowerCase().includes('heart')) ? 'Cardiology' :
                         patient?.currentConditions.some(c => c.toLowerCase().includes('pregnancy')) ? 'High-Risk OB/GYN' : 'Specialist'

        return `## Care Coordination: Fastest Specialist Access

**Analyzing provider network for ${patientName || 'patient'}...**

**${specialty} - Shortest Wait Times:**

**Dr. Sarah Chen, MD** - Metro Health Center
   Next Available: Tomorrow, 2:30 PM
   Distance: 2.3 miles from patient
   Accepts ${patient?.carrier || 'insurance'}
   In-network copay: $${patient?.copays?.specialist || 60}
   Patient rating: 4.9/5 (342 reviews)

**Dr. Michael Torres, MD** - Valley Medical Group
   Next Available: Friday, 9:00 AM
   Distance: 4.1 miles from patient
   Accepts ${patient?.carrier || 'insurance'}
   Evening appointments available
   Patient rating: 4.8/5 (289 reviews)

**Care Pathway Optimization:**
1. Book appointment with Dr. Chen for fastest access
2. Request medical records transfer (automated)
3. Prior authorization submitted: ${patient?.priorAuthRequired?.length || 0} services
4. Follow-up coordination scheduled

**Alternative Options:**
Telehealth consultation available today
Virtual visit copay: $25

Would you like me to initiate the referral process?`
      }
    ]
  },

  // Care Pathway Optimization
  {
    pattern: /optimize.*pathway|care pathway|coordinate.*care|multi-specialty/i,
    responses: [
      (patientName) => {
        const patient = patientName ? getPatientData(patientName) : null

        return `## Optimized Care Pathway for ${patientName || 'Patient'}

**Current Conditions:** ${patient?.currentConditions.join(', ') || 'Multiple chronic conditions'}

**Recommended Care Team Coordination:**

**Primary Care Physician** (Care Coordinator)
   Dr. Jennifer Williams - Family Medicine
   Next check-in: 2 weeks
   Role: Overall care coordination & referrals

${patient?.currentConditions.some(c => c.toLowerCase().includes('diabetes')) ?
`**Endocrinologist** (Diabetes Management)
   Dr. Robert Kim - Diabetes Center
   Frequency: Quarterly visits
   Next appointment: 3 weeks
   Services: A1C monitoring, insulin adjustment

**Certified Diabetes Educator**
   Sarah Martinez, RN, CDE
   Monthly sessions available
   Focus: Self-management & nutrition` : ''}

${patient?.currentConditions.some(c => c.toLowerCase().includes('heart')) ?
`**Cardiologist** (Heart Condition)
   Dr. Amanda Foster - CHF Specialist
   Frequency: Every 6 months
   Next appointment: Available this week
   Services: Echo, stress test, medication management

**Cardiac Rehabilitation**
   Valley Cardiac Rehab Center
   36 sessions approved by insurance
   Start date: Next Monday` : ''}

**Care Coordination Actions:**
1. Schedule all specialists within 30-day window
2. Synchronize appointment dates for patient convenience
3. Automated medical record sharing across team
4. Monthly care team case conference
5. Patient navigation support assigned

**Insurance Coverage Verified:**
All recommended services covered under current plan
Total estimated copays: $${(patient?.copays?.specialist || 60) * 2 + (patient?.copays?.primaryCare || 30)}

**Care Gaps Identified:**
None - Patient on optimal care pathway

Next step: Would you like me to book these coordinated appointments?`
      }
    ]
  },

  // Total Care Cost Estimation
  {
    pattern: /estimate.*total.*cost|total care cost|cost estimate|care.*cost|treatment cost/i,
    responses: [
      (patientName) => {
        const patient = patientName ? getPatientData(patientName) : null

        if (!patient) {
          return `I need patient information to estimate total care costs. Please provide the patient name or Member ID.`
        }

        // Calculate estimated costs based on patient conditions
        const primaryCareVisits = 4 // Quarterly
        const specialistVisitsPerYear = patient.currentConditions.length * 3 // 3 visits per condition per year
        const labsAndImaging = patient.currentConditions.length * 2 // Labs every 6 months per condition

        const primaryCareCost = primaryCareVisits * (patient.copays?.primaryCare || 30)
        const specialistCost = specialistVisitsPerYear * (patient.copays?.specialist || 60)
        const labCost = labsAndImaging * 150 // Average lab cost after insurance
        const medicationCost = patient.currentConditions.length * 75 * 12 // Avg $75/month per condition

        // Condition-specific costs
        let conditionSpecificCost = 0
        let conditionBreakdown = []

        if (patient.currentConditions.some(c => c.toLowerCase().includes('diabetes'))) {
          conditionSpecificCost += 2400 // CGM, supplies
          conditionBreakdown.push(`**Diabetes Management:**
   Continuous glucose monitoring: $150/month
   Testing supplies: $50/month
   Nutrition counseling (12 sessions): $360/year
   Annual diabetic eye exam: $150
   Annual foot exam: $100
   **Subtotal: $2,760/year**`)
        }

        if (patient.currentConditions.some(c => c.toLowerCase().includes('heart') || c.toLowerCase().includes('chf'))) {
          conditionSpecificCost += 3200
          conditionBreakdown.push(`**Heart Condition Management:**
   Echocardiogram (2x/year): $800
   Cardiac stress test (annual): $600
   Cardiac rehab (36 sessions): $1,080
   Remote monitoring device: $20/month = $240/year
   **Subtotal: $3,320/year**`)
        }

        if (patient.currentConditions.some(c => c.toLowerCase().includes('pregnancy'))) {
          conditionSpecificCost += 4500
          conditionBreakdown.push(`**Maternity Care:**
   Prenatal visits (12-14): $420
   Ultrasounds & genetic testing: $800
   Delivery & hospital (3 days): $2,500 (after insurance)
   Postpartum care: $180
   Breast pump & supplies: $300
   **Subtotal: $4,200/year**`)
        }

        if (patient.currentConditions.some(c => c.toLowerCase().includes('kidney'))) {
          conditionSpecificCost += 8500
          conditionBreakdown.push(`**Kidney Disease Management:**
   Nephrology visits (monthly): $720
   Dialysis treatments (if needed): $6,000/year (after insurance)
   Specialized medications: $1,200/year
   Monthly lab monitoring: $600
   **Subtotal: $8,520/year**`)
        }

        const totalEstimatedCost = primaryCareCost + specialistCost + labCost + medicationCost + conditionSpecificCost

        return `## Total Care Cost Estimation - ${patient.patientName}

**Annual Care Cost Breakdown:**

**Basic Care Services:**
• Primary care visits (${primaryCareVisits}x): $${primaryCareCost}
• Specialist visits (${specialistVisitsPerYear}x): $${specialistCost}
• Labs & diagnostic tests: $${labCost}
• Prescription medications: $${medicationCost}

${conditionBreakdown.length > 0 ? `**Condition-Specific Costs:**
${conditionBreakdown.join('\n\n')}` : ''}

**Insurance Information:**
• Plan: ${patient.carrier} - ${patient.planType}
• Deductible status: $${(patient.deductibles?.individual?.inNetwork || 3000) - (patient.deductibles?.individual?.remaining || 1500)} of $${patient.deductibles?.individual?.inNetwork || 3000} met
• Out-of-pocket max: $${patient.coverageLimits?.outOfPocketMax?.individual || 5000}

**Total Estimated Annual Cost: $${totalEstimatedCost.toLocaleString()}**

**Cost Optimization Opportunities:**
${totalEstimatedCost > 8000 ?
`• High annual costs detected - Consider care coordination program
• Sync specialist visits to minimize copays
• Use mail-order pharmacy for 90-day supplies (save 20%)
• Telehealth for follow-ups where appropriate ($25 vs $${patient.copays?.specialist || 60})
• Estimated potential savings: $${Math.floor(totalEstimatedCost * 0.15).toLocaleString()}/year` :
`• Use in-network providers exclusively
• Generic medications when available
• Preventive care visits (100% covered)
• Consider HSA contributions for tax savings`}

**Monthly Budget Planning:**
Average monthly cost: $${Math.floor(totalEstimatedCost / 12).toLocaleString()}
Recommended FSA contribution: $${Math.min(totalEstimatedCost, 3050).toLocaleString()}

**Important Notes:**
• Costs shown are estimates based on typical utilization
• Actual costs may vary based on treatment needs
• Does not include emergency care or hospitalizations
• Prior authorizations may affect final costs

Would you like me to break down costs by quarter or identify specific cost-saving opportunities?`
      }
    ]
  },

  // Referral Status Check
  {
    pattern: /referral status|check referral|referral.*wait/i,
    responses: [
      (patientName) => {
        const patient = patientName ? getPatientData(patientName) : null

        return `## Referral Status Dashboard - ${patientName || 'Patient'}

**Active Referrals:**

**Endocrinology Referral**
   Status: Approved
   Referral date: ${new Date(Date.now() - 5*24*60*60*1000).toLocaleDateString()}
   Valid until: ${new Date(Date.now() + 85*24*60*60*1000).toLocaleDateString()}
   Visits remaining: 3
   Action needed: Book appointment within 90 days

**Cardiology Referral**
   Status: Appointment Scheduled
   Scheduled for: ${new Date(Date.now() + 12*24*60*60*1000).toLocaleDateString()} at 10:30 AM
   Provider: Dr. Michael Roberts - Heart & Vascular
   Location: Regional Medical Center
   Wait time: 12 days (below network average of 18 days)

**Physical Therapy**
   Status: In Progress
   Sessions used: 15 of 20 approved
   Remaining sessions: 5
   Authorization expires: ${new Date(Date.now() + 45*24*60*60*1000).toLocaleDateString()}
   Action needed: Request extension if needed

**Pending Prior Authorizations:**
MRI - Lumbar spine: Submitted ${new Date(Date.now() - 2*24*60*60*1000).toLocaleDateString()}
   Expected approval: 1-3 business days
   Status: Under review

**Care Coordination Notes:**
All referrals within optimal timeframes
No bottlenecks detected
Patient navigation support available

Would you like help scheduling any pending appointments?`
      }
    ]
  },

  // Provider Network Availability
  {
    pattern: /network availability|provider.*available|facility.*capacity/i,
    responses: [
      (patientName) => {
        const patient = patientName ? getPatientData(patientName) : null

        return `## Provider Network Availability Analysis

**Real-time Network Capacity for ${patient?.carrier || 'Insurance Plan'}:**

**Primary Care Physicians:**
12 providers with appointments within 48 hours
Average wait time: 1.2 days
Network utilization: 73% (Good availability)

**Specialists - ${patient?.currentConditions[0] || 'General'} Care:**
8 providers accepting new patients
Shortest wait: 2 days (Dr. Sarah Chen)
Longest wait: 21 days (Dr. Robert Park)
Recommended: Book within 1 week for best selection

**Hospital Facilities:**
Regional Medical Center
   Bed availability: 87% capacity
   ER wait time: 22 minutes (current)
   Admissions: Accepting

Valley General Hospital
   Bed availability: 65% capacity
   Elective surgery: 2-week scheduling
   Preferred facility for ${patient?.carrier || 'your plan'}

**Urgent Care Centers:**
5 locations within 5 miles
All accepting walk-ins
Average wait: Under 15 minutes
Coverage: $${patient?.copays?.urgentCare || 75} copay

**Care Coordination Recommendation:**
Current network capacity is excellent
Best booking window: Next 7-14 days
No service delays anticipated

Would you like me to identify specific providers with immediate availability?`
      }
    ]
  },

  // In-Network Providers
  {
    pattern: /find.*network.*provider|in-network|network provider|provider.*network/i,
    responses: [
      (patientName) => {
        const patient = patientName ? getPatientData(patientName) : null
        const carrier = patient?.carrier || 'Your Insurance'

        return `## In-Network Providers for ${patientName || 'Patient'}

**${carrier} Network - ${patient?.planType || 'Your Plan'}**

Based on ${patient?.currentConditions.join(', ') || 'your medical needs'}:

**Primary Care Physicians:**
Dr. Michael Chen, MD
   Internal Medicine
   2.1 miles - Next available: Tomorrow
   4.9/5 (312 reviews)

Dr. Sarah Johnson, DO
   Family Medicine
   3.5 miles - Same-day appointments
   4.8/5 (287 reviews)

**Specialists You May Need:**
${patient?.currentConditions.some(c => c.toLowerCase().includes('diabetes')) ?
`**Endocrinology:**
   Dr. Robert Kim - Diabetes Center
   4.2 miles • New patients: 1 week
   Specializes in Type 2 management

 **Ophthalmology:**
   Valley Eye Associates
   3.8 miles • Diabetic eye exams
   Direct scheduling available` :
patient?.currentConditions.some(c => c.toLowerCase().includes('heart')) ?
` **Cardiology:**
   Heart & Vascular Institute
   2.8 miles • Echo & stress tests on-site
   Dr. Amanda Foster - CHF specialist

**Cardiac Rehab:**
   Regional Wellness Center
   3.2 miles • Insurance pre-approved` :
` **Orthopedics:**
   Sports Medicine Associates
   5.1 miles • MRI on-site

 **Neurology:**
   Neurological Care Center
   4.7 miles • EEG/EMG available`}

**Urgent Care Centers:**
${carrier} Urgent Care - 1.5 miles
   Open until 10pm • No appointment needed

QuickCare Clinic - 2.3 miles
   24/7 • Lower copay with your plan

**Pharmacies (Preferred Network):**
CVS Pharmacy - 0.8 miles
   24-hour • Mail order available

Walgreens - 1.2 miles
   Drive-thru • Specialty medications

**How to Verify Coverage:**
1. Call provider directly with Member ID
2. Use ${carrier} app to confirm
3. Ask about copay at scheduling

**Tip:** Book through the patient portal for automatic insurance verification and lower copays!`
      },
      (patientName) => {
        const patient = patientName ? getPatientData(patientName) : null

        return `## Network Provider Directory

**Searching providers near you for ${patientName || 'Patient'}**

**Filter Applied:** ${patient?.carrier || 'All'} Network Only
**Location:** Within 10 miles

**Best Matches for Your Conditions:**
${patient?.currentConditions.map(condition => {
  if (condition.toLowerCase().includes('diabetes')) {
    return `
 **Diabetes Care Team:**
• Endocrinologist: 3 in-network (2.5-5 miles)
• Diabetes educators: 8 available
• Podiatrist (diabetic care): 4 providers
• Nutritionists: 12 covered sessions/year`
  }
  if (condition.toLowerCase().includes('pregnancy')) {
    return `
 **Maternity Care Providers:**
• OB/GYN: 6 practices accepting patients
• Maternal-fetal medicine: 2 specialists
• Birthing centers: 3 in-network
• Lactation consultants: Covered`
  }
  return `
 **${condition} Specialists:**
• Multiple providers available
• Average wait: 5-7 days
• Telehealth options available`
}).join('\n')}

**Top-Rated Providers (Your Network):**
 (4.9) Premier Medical Group
- Multi-specialty practice
- Same-day sick visits
- Patient portal with messaging

 (4.8) ${patient?.carrier || 'Network'} Health Center
- All specialties under one roof
- Integrated pharmacy
- Lab & imaging on-site

**Schedule Appointments:**
Mobile App: Direct booking
 Online: Portal scheduling
 Concierge: 1-800-DOCTORS

*All listed providers confirmed in-network as of ${new Date().toLocaleDateString()}*`
      }
    ]
  },
  // Prior Authorization
  {
    pattern: /prior authorization|pre-?auth/i,
    responses: [
      (patientName) => {
        const patient = patientName ? getPatientData(patientName) : null
        const carrier = patient?.carrier || 'your insurance carrier'

        return `## Prior Authorization Requirements Analysis

I've reviewed the prior authorization requirements for ${patientName || 'this policy'}:

**Medications Requiring Prior Auth:**
${patient?.currentConditions.some(c => c.toLowerCase().includes('diabetes')) ?
`• Continuous Glucose Monitors (CGMs) - Required for all brands
• Insulin pumps and supplies - Required, typically approved for 1 year
• GLP-1 agonists (Ozempic, Wegovy) - Required with documented medical necessity
• Insulin analogs over $200/month - Automatic PA triggered` :
`• Specialty medications (biologics, immunotherapy)
• Branded drugs when generic exists
• Medications exceeding $500/month
• Compound medications`}

**Procedures & Services:**
• MRI/CT/PET scans - Required for non-emergency
• Physical therapy beyond 20 visits
• Specialist consultations for out-of-network
• Durable medical equipment over $500
${patient?.currentConditions.some(c => c.toLowerCase().includes('heart')) ?
`• Cardiac catheterization - Required with clinical documentation
• Echocardiograms - Not required for initial, required for follow-ups` : ''}

**Expedited Review Available For:**
 Urgent medical conditions
 Continuation of current therapy
 Hospital discharge medications

**Average Approval Times:**
• Standard: 3-5 business days
• Expedited: 24-48 hours
• Urgent: Same day for ${carrier}

**Pro Tip:** Submit PA requests with CPT codes and clinical notes to reduce denial rates by 40%.`
      },
      (patientName) => {
        const patient = patientName ? getPatientData(patientName) : null

        return `## Prior Authorization Status Update

**Current PA Requirements for ${patientName || 'Patient'}:**

${patient?.currentConditions.some(c => c.toLowerCase().includes('pregnancy')) ?
`**Maternity & Prenatal Services:**
• Genetic testing: PA required after 35 years
• High-risk pregnancy monitoring: Pre-approved
• NICU admission: Automatic approval
• Breast pumps: Covered, no PA needed

**Already Pre-Approved:**
 All routine prenatal visits
 Delivery and hospital stay (3 days vaginal, 5 days C-section)
 Postpartum care (6 weeks)
 Lactation consultation (6 sessions)` :
`**Common Services - No PA Required:**
• Primary care visits
• Preventive care services
• Emergency room visits
• Generic medications (Tier 1-2)
• Basic lab work and X-rays`}

**Pending Authorizations:**
${patient ?
`• ${patient.currentConditions[0]} management program - In review (2 days remaining)
• Specialist referral - Approved through ${new Date(Date.now() + 90*24*60*60*1000).toLocaleDateString()}` :
`• None currently on file`}

**Quick Actions:**
 PA Hotline: 1-800-XXX-XXXX (24/7)
Mobile App: Submit PA with photo of prescription
 Provider Portal: Electronic PA submission

*Note: Your provider can request "peer-to-peer" review if initially denied.*`
      }
    ]
  },

  // Comprehensive Policy Review
  {
    pattern: /comprehensive.*review|policy review/i,
    responses: [
      (patientName) => {
        const patient = patientName ? getPatientData(patientName) : null
        if (!patient) {
          return `I need patient information to perform a comprehensive policy review. Please provide:
• Patient name or Member ID
• Current insurance plan
• Specific conditions or treatments to analyze

I can then provide detailed coverage analysis, identify gaps, and suggest optimization strategies.`
        }

        return `## Comprehensive Policy Review - ${patient.patientName}

**Plan:** ${patient.carrier} - ${patient.planType}
**Policy #:** ${patient.policyNumber}
**Effective:** ${patient.effectiveDates}

### Coverage Summary

**Medical Benefits:**
• **Deductible:** $${patient.deductibles.individual.inNetwork} individual / $${patient.deductibles.family.inNetwork} family
• **Out-of-Pocket Max:** $${patient.coverageLimits?.outOfPocketMax?.individual || 5000} individual / $${patient.coverageLimits?.outOfPocketMax?.family || 10000} family
• **Coinsurance:** ${patient.coinsurance?.inNetwork || 20}% after deductible
• **Copays:** PCP $${patient.copays.primaryCare} / Specialist $${patient.copays.specialist}

### Coverage Analysis for Current Conditions

${patient.currentConditions.map(condition => {
  if (condition.toLowerCase().includes('diabetes')) {
    return `**Diabetes Type 2 Management:**
 Endocrinologist visits - Covered (referral required)
 A1C testing - Covered quarterly
 Diabetic supplies - Covered at 80% after deductible
 CGM devices - Prior auth required
 Nutrition counseling - 12 visits/year covered
 Diabetic shoes - 1 pair/year with prescription`
  }
  if (condition.toLowerCase().includes('heart')) {
    return `**Heart Condition Management:**
 Cardiology visits - Covered with referral
 Cardiac rehabilitation - 36 sessions/year
 Home BP monitoring - Device covered annually
 Medications - Most cardiac drugs in Tier 2-3
 Advanced imaging - Prior auth for CT/MRI
 Emergency cardiac care - Covered at any facility`
  }
  if (condition.toLowerCase().includes('pregnancy')) {
    return `**Maternity Coverage:**
 Prenatal care - 100% covered
 Delivery & hospital - Covered after deductible
 High-risk pregnancy - Additional monitoring covered
 Genetic testing - Covered with medical necessity
 Breast pump - Free through DME benefit
 Newborn care - Covered from birth`
  }
  return `**${condition}:**
 Specialist care - Covered with referral
 Diagnostic testing - Covered per medical necessity
 Treatment options - Varies by specific protocol`
}).join('\n\n')}

### Identified Opportunities

1. **Deductible Optimization:**
   • In-Network: $${patient.deductibles.individual.inNetwork}
   • Remaining: $${patient.deductibles.individual.remaining}
   • Strategy: Schedule planned procedures before year-end

2. **Preventive Care Benefits (No Cost):**
   • Annual wellness exam - Due in 2 months
   • Screening colonoscopy - Eligible now
   • Flu/COVID vaccines - Available anytime

3. **Cost Savings Available:**
   • Switch to mail-order pharmacy: Save 20-30%
   • Use telehealth for follow-ups: $10 vs $${patient.copays.specialist}
   • Generic alternatives: Available for 3 current meds

### Recommended Actions

1.  Schedule preventive screenings before deductible resets
2.  Request prior authorizations for Q1 procedures now
3.  Enroll in disease management programs (no cost)
4.  Review formulary for medication optimization
5.  Activate HSA contributions if eligible

**Estimated Annual Savings: $${Math.floor(Math.random() * 2000 + 1500)}**

Would you like me to help with any specific authorizations or provide details on any coverage area?`
      }
    ]
  },

  // Specialist Referrals
  {
    pattern: /specialist|referral/i,
    responses: [
      (patientName) => {
        const patient = patientName ? getPatientData(patientName) : null
        const planType = patient?.planType || 'your plan'

        return `## Specialist Referral Process - ${planType}

**Referral Requirements:**
${planType.includes('HMO') ?
` **Referral REQUIRED** for all specialists
• Must be initiated by Primary Care Physician
• Valid for 90 days or 3 visits (whichever comes first)
• Can be extended by PCP if ongoing care needed` :
planType.includes('PPO') ?
` **Referral NOT required** for in-network specialists
• Direct access to any specialist in network
• Higher copay for out-of-network without referral
• Some services may still need prior authorization` :
` **Referral recommended** but not required
• Better coverage with PCP referral
• Ensures care coordination
• May expedite prior authorizations`}

**In-Network Specialists Near You:**
${patient?.currentConditions.some(c => c.toLowerCase().includes('diabetes')) ?
`• **Endocrinology:** Dr. Sarah Chen - 2.3 miles
  Next available: Tuesday (3 days)
• **Ophthalmology:** Valley Eye Center - 4.1 miles
  Diabetic eye exams, next opening: 1 week
• **Podiatry:** Foot Health Specialists - 3.5 miles
  Diabetic foot care certified` :
`• **Cardiology:** Heart & Vascular Institute
• **Orthopedics:** Regional Ortho Group
• **Neurology:** Neurological Associates`}

**Fast-Track Specialties (No referral needed):**
• OB/GYN - Direct access for women's health
• Dermatology - Skin cancer screenings
• Mental Health - Behavioral health services
• Urgent Care - Immediate needs

**Copay Structure:**
• In-network specialist: $${patient?.copays.specialist || 60}
• Out-of-network: 40% after deductible
• Second opinions: Covered same as initial consultation

**Tip:** Book through the patient portal for faster scheduling and automatic referral processing.`
      },
      (patientName) => {
        const patient = patientName ? getPatientData(patientName) : null

        return `## Specialist Network Access

**Current Referrals on File:**
${patient ?
`• Endocrinology - Active until ${new Date(Date.now() + 60*24*60*60*1000).toLocaleDateString()}
• Cardiology - 2 visits remaining
• Physical Therapy - 15 of 20 visits used` :
`No active referrals found. Contact PCP to initiate.`}

**Top-Rated Specialists in Network:**
 (4.8) Dr. Michael Roberts - Cardiology
- Accepting new patients
- Specializes in: ${patient?.currentConditions.find(c => c.toLowerCase().includes('heart')) ? 'CHF management' : 'Preventive cardiology'}
- Wait time: 5-7 days
- Telehealth available

 (4.9) Dr. Jennifer Wu - Endocrinology
- Limited availability
- Specializes in: Diabetes, Thyroid disorders
- Wait time: 2-3 weeks
- Evening appointments available

**Virtual Specialist Consultations:**
 Immediate availability for:
• Dermatology (photo consults)
• Mental health counseling
• Nutrition counseling
• Sleep medicine consultation

Cost: $25 vs $${patient?.copays.specialist || 60} in-person

**How to Get a Referral:**
1. Message PCP through patient portal
2. Call PCP office: Available 8am-5pm
3. During visit: Ask for multiple referrals if needed
4. Emergency: ER can provide specialist referral

*Processing time: Same day for urgent, 24-48 hours standard*`
      }
    ]
  },

  // Medication Formulary
  {
    pattern: /formulary|medication|drug|prescription/i,
    responses: [
      (patientName) => {
        const patient = patientName ? getPatientData(patientName) : null

        return `## Prescription Drug Formulary Analysis

**Your Plan's Tier Structure:**
• **Tier 1 - Generic:** $${patient?.copays?.genericDrugs || 10} copay
• **Tier 2 - Preferred Brand:** $${patient?.copays?.brandDrugs || 35} copay
• **Tier 3 - Non-Preferred:** $${(patient?.copays?.brandDrugs || 35) + 20} copay
• **Tier 4 - Specialty:** $${patient?.copays?.specialtyDrugs || 100} copay

${patient?.currentConditions.some(c => c.toLowerCase().includes('diabetes')) ?
`**Diabetes Medications Coverage:**
 **Metformin** (Generic) - Tier 1: $10
 **Jardiance** - Tier 2: $35 (PA may apply)
 **Ozempic** - Tier 3: $70 (Prior auth required)
 **Insulin Glargine** - Tier 2: $35
 **Humalog** - Tier 2: $35 (generic available)

**Cost-Saving Alternatives:**
• Switch Jardiance → Generic empagliflozin: Save $25/month
• Use insulin biosimilars: Save 15-30%
• 90-day mail order: Pay for 2.5 months, get 3 months` :
`**Common Medications:**
• Statins - Most generics in Tier 1
• Blood pressure meds - Wide generic selection
• Pain management - Tier varies by medication
• Antibiotics - Most in Tier 1`}

**Pharmacy Benefits:**
 **Preferred Pharmacies** (Lower copays):
• CVS Pharmacy - 2 locations within 5 miles
• Walgreens - 3 locations nearby
• ${patient?.carrier || 'Plan'} Mail Order - Best prices

**Mail Order Savings:**
• 90-day supply for price of 60 days
• Free shipping
• Auto-refill available
• No lines or waiting

**Prior Authorization Fast-Track:**
 Continuation of therapy: Usually auto-approved
 Step therapy satisfied: Document previous trials
 Medical necessity: Include diagnosis codes

**Annual Rx Deductible:**
None - Copays apply immediately

Would you like me to check coverage for specific medications or find therapeutic alternatives?`
      },
      (patientName) => {
        const patient = patientName ? getPatientData(patientName) : null

        return `## Medication Cost Optimization Report

**Current Prescription Analysis:**
Based on typical medications for ${patient?.currentConditions.join(', ') || 'your conditions'}:

**Potential Savings Identified:**
${patient?.currentConditions.some(c => c.toLowerCase().includes('hypertension')) ?
`1. **Blood Pressure Medications:**
   Current: Lisinopril brand ($45/month)
   Switch to: Generic lisinopril ($4/month)
   Annual Savings: $492

2. **Beta Blocker:**
   Current: Lopressor ($38/month)
   Switch to: Generic metoprolol ($7/month)
   Annual Savings: $372` :
`1. **Cholesterol Management:**
   Current: Lipitor ($125/month)
   Switch to: Generic atorvastatin ($9/month)
   Annual Savings: $1,392`}

**Specialty Drug Programs:**
${patient?.currentConditions.some(c => c.toLowerCase().includes('diabetes')) ?
` Enrolled: Diabetes management program
• Free glucose meter and strips
• Nutrition counseling included
• Medication therapy management
• Estimated value: $1,200/year` :
` Not enrolled in any specialty programs
Available programs based on your conditions:
• Chronic care management
• Medication therapy review
• Disease-specific support`}

**Patient Assistance Programs:**
Several manufacturers offer copay cards:
• Most specialty drugs: $0-10 copay
• Brand medications: Up to $100/month off
• Income-based programs available

**Smart Refill Strategies:**
 **Refill Optimization:**
• Sync all medications to same refill date
• Use 90-day supplies when possible
• Set auto-refill for maintenance meds
• Stack refills before deductible reset

**Total Potential Annual Savings: $${Math.floor(Math.random() * 2000 + 1800)}**

 Pharmacy Help Line: 1-800-RX-HELP (24/7)
 Check coverage: Online formulary tool
Mobile app: Price medications before filling`
      }
    ]
  },

  // Preventive Care
  {
    pattern: /preventive|wellness|screening|vaccine/i,
    responses: [
      (patientName) => {
        const patient = patientName ? getPatientData(patientName) : null
        const age = patient?.age || 45

        return `## Preventive Care Benefits - 100% Covered

**No-Cost Preventive Services for ${patientName || 'You'}:**

**Annual Screenings Due:**
${age >= 50 ?
` Colonoscopy screening - Due this year
 Mammogram (women) - Annual
 Prostate screening (men) - Discuss with PCP
 Bone density scan - Every 2 years` :
age >= 40 ?
` Mammogram (women 40+) - Annual
 Cholesterol screening - Every 5 years
 Diabetes screening - Every 3 years
 Blood pressure check - Annual` :
` Annual wellness exam
 Cholesterol check - Every 5 years
 Depression screening - Annual
 STI screening - As recommended`}

**Immunizations Covered:**
• Flu vaccine - Annual (available now)
• COVID-19 vaccine & boosters
• Tdap (tetanus) - Every 10 years
• Shingles vaccine (50+)
• Pneumonia vaccine (65+ or high risk)
${patient?.currentConditions.some(c => c.toLowerCase().includes('pregnancy')) ?
`• Tdap during pregnancy
• Flu vaccine (pregnancy-safe)` : ''}

**Wellness Programs (No Cost):**
**Digital Health Tools:**
• Fitness tracking app premium
• Mental health app subscription
• Nutrition planning tool
• Sleep improvement program

 **Fitness Benefits:**
• Gym membership discount: $25/month
• Virtual fitness classes: Unlimited
• Personal training: 2 free sessions
• Yoga/Pilates classes online

**Health Assessments:**
• Biometric screening at workplace
• Health risk assessment: Earn $50 reward
• Tobacco cessation: Free coaching + aids
• Weight management program enrollment

**Schedule Your Screenings:**
 Wellness Concierge: 1-800-PREVENT
 Online booking: 24/7 availability
 Nearby centers: 15+ locations

 **Best Practice:** Schedule all annual screenings in your birth month for easy tracking!`
      }
    ]
  },

  // Telehealth
  {
    pattern: /telemedicine|telehealth|virtual|online.*visit/i,
    responses: [
      (patientName) => {
        const patient = patientName ? getPatientData(patientName) : null
        const telehealthCopay = 25

        return `## Telehealth Benefits Overview

**Virtual Care Options Available 24/7:**

** Video Visits - $${telehealthCopay} copay**
Available for:
• Primary care consultations
• Mental health counseling
• Specialist follow-ups
• Prescription refills
• Lab result reviews
${patient?.currentConditions.some(c => c.toLowerCase().includes('diabetes')) ?
`• Diabetes management check-ins
• Nutrition counseling sessions
• Endocrinology consultations` : ''}

**On-Demand Care (No appointment needed):**
• Average wait: 10 minutes
• Available conditions:
  - Cold, flu, allergies
  - Skin conditions
  - UTIs
  - Minor injuries
  - Mental health support

**Specialist Telehealth:**
 Dermatology - Photo consultations
 Psychiatry - Full service available
 Cardiology - Follow-ups only
 Endocrinology - Diabetes management
 Neurology - Initial consult in-person required

**Cost Comparison:**
• Telehealth visit: $${telehealthCopay}
• Urgent care: $${patient?.copays.urgentCare || 75}
• Emergency room: $${patient?.copays.emergencyRoom || 300}
• In-person PCP: $${patient?.copays.primaryCare || 30}

**How to Access:**
1. Mobile app: "${patient?.carrier || 'Health'} Virtual Care"
2.  Patient portal video link
3.  Phone consultations available
4.  Chat with nurse 24/7 (free)

**Prescriptions:**
 E-prescriptions sent directly to pharmacy
 Controlled substances: Restrictions apply
 Refills: Most medications eligible

**Tech Requirements:**
• Smartphone, tablet, or computer
• Internet connection (3G minimum)
• Camera for video visits
• Microphone and speakers

**Pro Tip:** Use telehealth for follow-ups to save time and money. Most insurance plans count telehealth toward deductibles!`
      }
    ]
  },

  // Out-of-pocket costs
  {
    pattern: /out.of.pocket|deductible|copay|cost|maximum/i,
    responses: [
      (patientName) => {
        const patient = patientName ? getPatientData(patientName) : null
        if (!patient) {
          return `I need patient information to calculate specific out-of-pocket costs. Please provide the patient name or policy details.`
        }

        const outOfPocketMax = patient.coverageLimits?.outOfPocketMax?.individual || 5000
        const deductibleUsed = (patient.deductibles?.individual?.inNetwork || 1000) - (patient.deductibles?.individual?.remaining || 500)
        const outOfPocketUsed = deductibleUsed + Math.floor(Math.random() * 1000) // Add some random copays
        const remaining = outOfPocketMax - outOfPocketUsed
        const percentUsed = Math.round((outOfPocketUsed / outOfPocketMax) * 100)

        return `## Out-of-Pocket Cost Analysis - ${patient.patientName}

**Current Year Status:**
Progress: $${outOfPocketUsed} / $${outOfPocketMax} (${percentUsed}% used)
${generateProgressBar(percentUsed)}

**Breakdown:**
• **Deductible:** $${deductibleUsed} / $${patient.deductibles?.individual?.inNetwork || 1000} 
• **Copays YTD:** $${Math.floor(outOfPocketUsed * 0.3)}
• **Coinsurance YTD:** $${Math.floor(outOfPocketUsed * 0.7 - deductibleUsed)}
• **Remaining to Max:** $${remaining}

**Monthly Spending Trend:**
Average: $${Math.floor(outOfPocketUsed / ((new Date().getMonth() + 1)))} / month
${percentUsed > 75 ? ' Approaching out-of-pocket maximum' : ' Within expected range'}

**Cost Structure After Deductible:**
• Office visits: $${patient.copays.specialist} copay
• Labs/X-rays: 80% coinsurance
• Hospital: 80% up to OOP max
• Medications: Copays don't count toward deductible

**Optimization Strategies:**
${remaining < 1000 ?
`**Near OOP Maximum - Strategic Timing:**
• Schedule elective procedures now
• Stock up on supplies/medications
• Complete all specialist consultations
• Everything FREE after $${remaining} more!` :
`**Cost Reduction Tips:**
• Use in-network providers: Save up to 60%
• Generic medications when available
• Telehealth for follow-ups: Save $${patient.copays.specialist - 25}
• Preventive care: Always $0`}

**FSA/HSA Eligible Expenses:**
• All deductibles and copays
• Prescription medications
• Medical supplies and equipment
• Vision and dental care

**Year-End Planning:**
${new Date().getMonth() >= 9 ?
` Q4 Considerations:
• ${remaining > 2000 ? 'Defer elective procedures to next year' : 'Complete procedures before deductible resets'}
• FSA deadline: ${new Date().getFullYear()}-12-31
• Submit all claims by year-end` :
`• Track spending for tax deductions
• Consider FSA enrollment for next year`}

Need help estimating costs for a specific procedure?`
      }
    ]
  },

  // Emergency vs Urgent Care
  {
    pattern: /emergency|urgent care|ER/i,
    responses: [
      (patientName) => {
        const patient = patientName ? getPatientData(patientName) : null

        return `## Emergency vs Urgent Care Coverage Guide

**When to Use Each Service:**

** Emergency Room - $${patient?.copays.emergencyRoom || 300} copay**
Go for life-threatening conditions:
• Chest pain, difficulty breathing
• Severe bleeding or trauma
• Stroke symptoms
• Severe allergic reactions
• Compound fractures
 Copay waived if admitted

**Urgent Care - $${patient?.copays.urgentCare || 75} copay**
Best for non-life-threatening:
• Fever, flu, colds
• Minor cuts needing stitches
• Sprains and strains
• UTIs, ear infections
• Mild allergic reactions

** Telehealth - $${25} copay**
Start here when possible:
• Medical advice
• Prescription refills
• Follow-up care
• Mental health support

**Nearest In-Network Facilities:**
 **Emergency Rooms:**
• Regional Medical Center - 2.1 miles (Level 1 Trauma)
• St. Mary's Hospital - 3.5 miles
• Community General - 4.8 miles

 **Urgent Care Centers:**
• QuickCare Clinic - 1.2 miles (Open til 10pm)
• ${patient?.carrier || 'Plan'} Urgent Care - 2.0 miles (Open 24/7)
• MinuteClinic - 0.8 miles (In CVS, til 8pm)

**Cost Comparison Example:**
Treating a minor burn:
• ER visit: $${patient?.copays.emergencyRoom || 300} + potential facility fees
• Urgent care: $${patient?.copays.urgentCare || 75}
• Telehealth consult: $25
Savings: Up to $${(patient?.copays.emergencyRoom || 300) - 25}

**After-Hours Options:**
 24/7 Nurse Line: 1-800-NURSE-RN (Free)
 Chat with doctor: Via mobile app
 If unsure, call 911

**Important Coverage Notes:**
 Emergency care covered at ANY hospital
 No prior auth needed for emergencies
 Out-of-network ER covered at in-network rate
 Follow-up care must be in-network`
      }
    ]
  }
]

// Helper function to generate progress bar
function generateProgressBar(percentage: number): string {
  const filled = Math.floor(percentage / 10)
  const empty = 10 - filled
  return '[' + '='.repeat(filled) + '-'.repeat(empty) + ']'
}

/**
 * Get a varied, contextual response for Arthur Quick
 */
export function getArthurQuickResponse(message: string, patientName?: string): string {
  // Extract patient name from message if present
  let extractedPatient = patientName
  const patientMatch = message.match(/For patient ([^:]+):/i)
  if (patientMatch) {
    extractedPatient = patientMatch[1].trim()
  }

  // Find matching template
  for (const template of responseTemplates) {
    if (template.pattern.test(message)) {
      // Select a random response variant
      const responses = template.responses
      const randomIndex = Math.floor(Math.random() * responses.length)
      return responses[randomIndex](extractedPatient)
    }
  }

  // Default response if no pattern matches
  return getGenericResponse(message, extractedPatient)
}

/**
 * Generic response for unmatched queries
 */
function getGenericResponse(message: string, patientName?: string): string {
  const patient = patientName ? getPatientData(patientName) : null

  if (!patient) {
    return `I can help you with that healthcare policy question. To provide specific coverage details and personalized recommendations, please provide:

• Patient name or Member ID
• Specific insurance plan
• What you'd like to know about coverage

I can analyze:
• Prior authorization requirements
• Coverage limits and exclusions
• In-network providers
• Medication formulary
• Cost estimates
• Preventive care benefits

What specific aspect would you like me to review?`
  }

  return `## Healthcare Policy Information

**Patient:** ${patient.patientName}
**Plan:** ${patient.carrier} - ${patient.planType}

Based on your question about "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}":

**Coverage Details:**
• This service is typically covered under your plan
• Prior authorization may be required depending on specific circumstances
• Your estimated cost would be subject to deductible and coinsurance

**Current Benefits Status:**
• Deductible: $${((patient.deductibles?.individual?.inNetwork || 3000) - (patient.deductibles?.individual?.remaining || 1500))} / $${patient.deductibles?.individual?.inNetwork || 3000}
• Out-of-pocket: $1200 / $5000

**Next Steps:**
1. Verify specific coverage with member services
2. Obtain prior authorization if required
3. Use in-network providers for best coverage

Would you like me to provide more specific information about:
• Prior authorization process
• Network providers
• Cost estimates
• Alternative treatment options

Please let me know how I can assist further with your healthcare coverage questions.`
}

/**
 * Get contextual suggestions based on the response
 */
export function getArthurQuickSuggestions(response: string, patientName?: string): string[] {
  const responseLower = response.toLowerCase()

  // RAG Question: Specialists with shortest wait times
  if (responseLower.includes('specialists with shortest wait') ||
      (responseLower.includes('cardiology') && responseLower.includes('endocrinology') && responseLower.includes('orthopedics'))) {
    return [
      'Book cardiology appointment',
      'Compare specialist ratings',
      'Check insurance coverage for specialist',
      'View specialist credentials'
    ]
  }

  // RAG Question: Provider network availability
  if (responseLower.includes('provider network availability') ||
      (responseLower.includes('network capacity') && responseLower.includes('primary care physicians'))) {
    return [
      'Find urgent care nearby',
      'Check telehealth options',
      'View after-hours availability',
      'Schedule same-day appointment'
    ]
  }

  // RAG Question: Prior authorization turnaround times
  if (responseLower.includes('prior authorization turnaround') ||
      (responseLower.includes('fast-track services') && responseLower.includes('processing times'))) {
    return [
      'Submit prior authorization request',
      'Check authorization status',
      'Find pre-approved alternatives',
      'Expedite urgent authorization'
    ]
  }

  // Care Coordination - Fastest Specialist
  if (responseLower.includes('fastest') || responseLower.includes('shortest wait') || responseLower.includes('next available')) {
    return [
      'Initiate referral process',
      'Check provider credentials',
      'Review insurance coverage',
      'Schedule telehealth alternative'
    ]
  }

  // Care Pathway Optimization
  if (responseLower.includes('care pathway') || responseLower.includes('care team') || responseLower.includes('coordination')) {
    return [
      'Book coordinated appointments',
      'Review medical records sharing',
      'Estimate total care costs',
      'Check care gaps'
    ]
  }

  // Referral Status
  if (responseLower.includes('referral status') || responseLower.includes('referral') || responseLower.includes('pending')) {
    return [
      'Expedite pending referrals',
      'Find alternative specialists',
      'Request authorization extension',
      'Check appointment availability'
    ]
  }

  // Network Availability
  if (responseLower.includes('network') || responseLower.includes('availability') || responseLower.includes('capacity')) {
    return [
      'Book immediate appointment',
      'Find alternative facilities',
      'Check telehealth options',
      'Review provider ratings'
    ]
  }

  // Prior auth related
  if (responseLower.includes('prior auth') || responseLower.includes('authorization')) {
    return [
      'Submit authorization request',
      'Check approval timeline',
      'Find pre-approved alternatives',
      'Appeal if denied'
    ]
  }

  // Policy Coverage
  if (responseLower.includes('policy') || responseLower.includes('coverage') || responseLower.includes('benefits')) {
    return [
      'Verify specific service coverage',
      'Check prior auth requirements',
      'Review out-of-pocket costs',
      'Find covered alternatives'
    ]
  }

  // Cost related
  if (responseLower.includes('deductible') || responseLower.includes('cost') || responseLower.includes('out-of-pocket')) {
    return [
      'Calculate total care costs',
      'Review payment options',
      'Check financial assistance',
      'Find lower-cost alternatives'
    ]
  }

  // Medication related
  if (responseLower.includes('medication') || responseLower.includes('prescription') || responseLower.includes('formulary')) {
    return [
      'Check formulary coverage',
      'Find generic alternatives',
      'Submit prior authorization',
      'Review patient assistance programs'
    ]
  }

  // Default suggestions - care coordination focused
  const patient = patientName ? getPatientData(patientName) : null
  if (patient) {
    return [
      'Find fastest specialist',
      'Optimize care pathway',
      'Check referral status',
      'Review policy coverage'
    ]
  }

  return [
    'Find available specialists',
    'Coordinate care team',
    'Check network capacity',
    'Review coverage options'
  ]
}