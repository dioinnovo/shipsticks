# Ship Sticks POC - Implementation Document
**Created:** 2025-10-16
**Status:** In Progress (35% Complete)
**Target:** 2-hour demo sprint

---

## 📊 **PROGRESS AUDIT**

### ✅ **COMPLETED (35%)**
- [x] Brand colors updated to Ship Sticks green (#5fd063)
- [x] Logo files downloaded and integrated
- [x] Sidebar navigation rebranded
- [x] Dashboard KPIs converted to shipping metrics
- [x] CLAUDE.md documentation updated
- [x] Git repository configured to github.com/dioinnovo/shipsticks
- [x] Tailwind config updated with Ship Sticks colors
- [x] Care-sessions page partially converted to shipments

### 🔴 **CRITICAL GAPS (65% Remaining)**
1. **AI Chat Interface** - Still 100% healthcare-focused (Arthur AI, patients, medical conditions)
2. **Demo Page** - Shows diabetes/CHF management instead of golf shipments
3. **Smart Booking Form** - Component doesn't exist yet
4. **Golf Demo Data** - No golf courses, routes, or shipment data files
5. **Computer Vision Simulation** - Not implemented for golf equipment
6. **Text-to-SQL Analytics** - Not golf-specific

---

## 📋 **EPIC BREAKDOWN**

### **EPIC 1: Golf Concierge AI Agent** ⚡ **HIGH PRIORITY**
**File:** `components/mobile-chat-interface.tsx` (1,202 lines)

**Current State:** Healthcare-focused AI assistant
- References "Arthur", "patients", "medical conditions", "policy reviews"
- Uses healthcare terminology throughout
- Patient selector modal instead of shipment context

**Target State:** Golf travel logistics assistant

#### Story 1.1: Update System Prompt & Welcome Message
**Lines:** 551-558
```typescript
// CURRENT:
<h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
  Hi! I'm Arthur
</h1>
<p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-sm px-4 sm:px-0">
  I analyze healthcare policies comprehensively...
</p>

// TARGET:
<h1>Hi! I'm your Ship Sticks Travel Assistant</h1>
<p>I help golfers ship their clubs worldwide, track shipments, and plan golf travel...</p>
```

#### Story 1.2: Replace Patient Context with Shipment Context
**Lines:** 32, 119-122, 560-591
- Remove: `PatientSelectorModal` references
- Create: Shipment tracking number input or golf trip planner
- Update state management for shipment data

#### Story 1.3: Update Quick Questions
**Lines:** 163-182 (arthurProQuestions), 670-784 (Quick questions)
```typescript
// REMOVE:
"Which treatment combinations are underutilized?"
"Find fastest specialist for this patient"
"Comprehensive policy review"

// ADD:
"When should I ship my clubs to Pebble Beach?"
"What's my shipment tracking status?"
"Get a quote for golf bag to St. Andrews"
"What golf courses are in your partner network?"
```

#### Story 1.4: Update Model Options
**Lines:** 157-160
```typescript
// CURRENT:
{ value: 'quick', label: 'Arthur Quick', description: 'Care coordination & referral management' }
{ value: 'arthur-pro', label: 'Arthur Pro', description: 'Advanced analytics - Knowledge graph insights' }

// TARGET:
{ value: 'quick', label: 'Ship Sticks Quick', description: 'Shipment tracking & quotes' }
{ value: 'pro', label: 'Ship Sticks Pro', description: 'Route optimization & analytics' }
```

---

### **EPIC 2: Smart Shipment Booking Form** ⚡ **HIGH PRIORITY**
**New File:** `components/booking/ShipmentBookingWizard.tsx`

**Purpose:** Replace healthcare forms with golf shipment booking flow

#### Story 2.1: Step 1 - Origin & Destination
```typescript
interface Step1Data {
  pickupLocation: {
    address: string
    type: 'home' | 'office' | 'hotel' | 'pro-shop'
  }
  destination: {
    golfCourse: string // Autocomplete from TOP_GOLF_COURSES
    address: string
    arrivalDate: Date
    teeTime?: string
  }
}
```

#### Story 2.2: Step 2 - Equipment Details
```typescript
interface Step2Data {
  equipmentType: 'golf-bag' | 'travel-case' | 'push-cart' | 'pull-cart' | 'ski'
  numberOfClubs: number // Validate 1-14
  specialItems: string[] // Rangefinder, shoes, rain gear
  estimatedValue: number // For insurance calculation
}
```

#### Story 2.3: Step 3 - Computer Vision Simulation
```typescript
interface VisionAnalysisResult {
  detected: string // "TaylorMade Stand Bag with 14 clubs"
  condition: 'Excellent' | 'Good' | 'Fair'
  recommendations: string[]
  suggestedInsurance: number
}

// Simulate 2-3 second "AI analyzing..." then show results
```

#### Story 2.4: Step 4 - Service Selection
```typescript
const SERVICE_TIERS = [
  { id: 'standard', name: 'Standard', days: '5-7', price: 89, description: 'Perfect for planned trips' },
  { id: 'express', name: 'Express', days: '2-3', price: 149, description: 'Recommended for your timeline' },
  { id: 'overnight', name: 'Overnight', days: '1', price: 249, description: 'Guaranteed next-day delivery' },
  { id: 'white-glove', name: 'White Glove VIP', days: 'Same day', price: 399, description: 'Door-to-course concierge' }
]
```

---

### **EPIC 3: Demo Page Transformation** ⚡ **HIGH PRIORITY**
**File:** `app/(marketing)/demo/page.tsx` (1,083 lines)

**Current State:** Healthcare claims (diabetes, CHF management)
**Target State:** Golf shipment intelligence demo

#### Story 3.1: Replace Healthcare Cases with Golf Shipments
**Lines:** 30-81 (claimTypes definition)
```typescript
// CURRENT:
const claimTypes = {
  'complex-diabetes': { ... },
  'chf-management': { ... }
}

// TARGET:
const shipmentTypes = {
  'pebble-beach-express': {
    icon: Plane,
    title: 'John Smith - Express to Pebble Beach',
    trackingNumber: 'SS-2024-PB001',
    date: '2024-03-15',
    route: 'New York → San Francisco → Pebble Beach',
    equipment: [
      { type: 'Callaway Driver', status: 'Packed', confidence: 98 },
      { type: 'Golf Bag - 14 clubs', status: 'Insured', confidence: 100 },
      { type: 'Rain Gear', status: 'Included', confidence: 95 }
    ],
    estimate: '$149',
    deliveryDate: '3 days',
    location: 'Pebble Beach, CA',
    images: [
      { id: 1, name: 'golf_bag_01.jpg', status: 'pending' },
      { id: 2, name: 'clubs_closeup_02.jpg', status: 'pending' }
    ]
  },
  'st-andrews-international': { ... }
}
```

#### Story 3.2: Update Tab Labels
**Lines:** 157-161
```typescript
// CURRENT:
const tabs = [
  { id: 'claims-intelligence', label: 'Claims Intelligence', icon: Brain },
  { id: 'estimation', label: 'AI Estimates', icon: DollarSign },
  { id: 'coverage-analysis', label: 'Coverage Analysis', icon: Shield },
]

// TARGET:
const tabs = [
  { id: 'shipment-intelligence', label: 'Shipment Intelligence', icon: Brain },
  { id: 'smart-pricing', label: 'Smart Pricing', icon: DollarSign },
  { id: 'route-optimization', label: 'Route Optimization', icon: TrendingUp },
]
```

#### Story 3.3: Computer Vision Demo for Golf Equipment
**Lines:** 85-138 (processImages function)
```typescript
// After processing, show:
{
  classification: 'STANDARD GOLF BAG',
  equipmentType: 'Full Set - 14 Clubs',
  condition: 'EXCELLENT',
  estimatedValue: '$2,500',
  recommendedInsurance: '$3,000 coverage',
  packingRecommendations: [
    'Add bubble wrap to driver head',
    'Secure iron covers',
    'Remove loose items from pockets'
  ]
}
```

#### Story 3.4: Results Display Updates
**Lines:** 370-506 (Analysis results section)
- Phase 1: "Instant Classification" → Show shipment eligibility
- Phase 2: "Equipment Assessment" → Show detected golf clubs
- Phase 3: "Shipping Options" → Show Standard/Express/Overnight options

---

### **EPIC 4: Golf Demo Data Creation** 🔧 **MEDIUM PRIORITY**
**New Files to Create:**

#### Story 4.1: Golf Courses Data
**File:** `lib/data/golf-courses.ts`
```typescript
export interface GolfCourse {
  id: number
  name: string
  location: string
  city: string
  state: string
  country: string
  tier: 'premium' | 'standard' | 'exclusive'
  partnerStatus: 'partner' | 'non-partner'
  averageShipments: number
}

export const TOP_GOLF_COURSES: GolfCourse[] = [
  {
    id: 1,
    name: "Pebble Beach Golf Links",
    location: "Pebble Beach, CA",
    city: "Pebble Beach",
    state: "California",
    country: "USA",
    tier: "premium",
    partnerStatus: "partner",
    averageShipments: 450
  },
  {
    id: 2,
    name: "St. Andrews Old Course",
    location: "St. Andrews, Scotland",
    city: "St. Andrews",
    state: "Fife",
    country: "Scotland",
    tier: "exclusive",
    partnerStatus: "partner",
    averageShipments: 680
  },
  // ... 98 more courses
]
```

#### Story 4.2: Shipping Routes Data
**File:** `lib/data/shipping-routes.ts`
```typescript
export interface ShippingRoute {
  id: string
  origin: string
  destination: string
  avgDeliveryDays: number
  popularSeason: string
  volume: 'high' | 'medium' | 'low'
  pricing: {
    standard: number
    express: number
    overnight: number
  }
}

export const POPULAR_ROUTES: ShippingRoute[] = [
  {
    id: 'ny-pebble',
    origin: 'New York, NY',
    destination: 'Pebble Beach, CA',
    avgDeliveryDays: 3,
    popularSeason: 'Summer',
    volume: 'high',
    pricing: { standard: 89, express: 149, overnight: 249 }
  },
  // ... more routes
]
```

#### Story 4.3: Sample Shipments
**File:** `lib/data/sample-shipments.ts`
```typescript
export interface Shipment {
  id: string
  trackingNumber: string
  customerName: string
  equipment: string
  origin: string
  destination: string
  golfCourse: string
  status: 'pending' | 'in-transit' | 'delivered' | 'delayed'
  shippingDate: string
  deliveryDate: string
  estimatedArrival?: string
  serviceLevel: 'standard' | 'express' | 'overnight' | 'vip'
  cost: number
}

export const DEMO_SHIPMENTS: Shipment[] = [
  {
    id: '1',
    trackingNumber: 'SS-2024-1001',
    customerName: 'John Smith',
    equipment: 'Callaway Full Set - 14 Clubs',
    origin: 'New York, NY',
    destination: 'Pebble Beach, CA',
    golfCourse: 'Pebble Beach Golf Links',
    status: 'in-transit',
    shippingDate: '2024-03-15',
    deliveryDate: '2024-03-18',
    serviceLevel: 'express',
    cost: 149
  },
  // ... 49 more shipments
]
```

---

### **EPIC 5: Text-to-SQL for Golf Logistics** 🔧 **MEDIUM PRIORITY**
**Location:** Needs investigation - check existing SQL components

#### Story 5.1: Golf-Specific Query Templates
```sql
-- Sample queries to pre-populate:
1. "Show me shipments to top golf destinations this month"
   SELECT destination, COUNT(*) as shipment_count
   FROM shipments
   WHERE MONTH(created_at) = CURRENT_MONTH
   GROUP BY destination
   ORDER BY shipment_count DESC
   LIMIT 10;

2. "What's the average delivery time to Pebble Beach?"
   SELECT AVG(DATEDIFF(delivery_date, ship_date)) as avg_days
   FROM shipments
   WHERE golf_course = 'Pebble Beach Golf Links';

3. "Which routes have the highest damage claims?"
   SELECT route, COUNT(*) as claim_count
   FROM claims
   JOIN shipments ON claims.shipment_id = shipments.id
   GROUP BY route
   ORDER BY claim_count DESC;

4. "Show revenue by golf resort partnerships"
   SELECT golf_course, SUM(price) as total_revenue
   FROM shipments
   WHERE partnership_tier = 'partner'
   GROUP BY golf_course
   ORDER BY total_revenue DESC;
```

#### Story 5.2: Database Schema Documentation
```sql
-- Golf Logistics Schema
CREATE TABLE shipments (
  id VARCHAR(50) PRIMARY KEY,
  customer_id VARCHAR(50),
  origin VARCHAR(255),
  destination VARCHAR(255),
  golf_course VARCHAR(255),
  status VARCHAR(50),
  created_at TIMESTAMP,
  delivery_date DATE,
  price DECIMAL(10,2)
);

CREATE TABLE customers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255),
  tier VARCHAR(50), -- 'standard', 'vip', 'platinum'
  lifetime_value DECIMAL(10,2),
  preferred_courses TEXT
);

CREATE TABLE golf_courses (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  location VARCHAR(255),
  partnership_tier VARCHAR(50),
  shipping_volume INT
);

CREATE TABLE claims (
  id VARCHAR(50) PRIMARY KEY,
  shipment_id VARCHAR(50),
  type VARCHAR(100),
  amount DECIMAL(10,2),
  resolution_status VARCHAR(50)
);

CREATE TABLE pricing_history (
  id INT PRIMARY KEY,
  route VARCHAR(255),
  price DECIMAL(10,2),
  season VARCHAR(50),
  demand_level VARCHAR(50)
);
```

---

### **EPIC 6: Predictive Analytics Display** 🎨 **LOW PRIORITY**
**New Component:** `components/analytics/ShipmentIntelligence.tsx`

#### Story 6.1: Delivery Time Prediction Card
```typescript
interface DeliveryPrediction {
  estimatedArrival: string // "March 20, 2024 2:00 PM"
  hoursBeforeTeeTime: number
  confidence: number // 0-100
  historicalAccuracy: string // "98% on-time to this destination"
}

// Display: "Your clubs will arrive 24 hours before tee time"
```

#### Story 6.2: Weather Impact Widget
```typescript
interface WeatherImpact {
  destination: string
  forecast: {
    date: string
    condition: string
    temperature: number
    precipitation: number
  }[]
  delayRisk: 'low' | 'medium' | 'high'
  message: string // "Clear skies expected - no delays anticipated"
}
```

#### Story 6.3: Route Optimization Display
```typescript
interface RouteOptimization {
  originalRoute: string[]
  optimizedRoute: string[]
  timeSaved: number // hours
  costSavings: number // dollars
  hubsUsed: string[]
}

// Display: "Saved 12 hours via Memphis hub routing"
```

---

### **EPIC 7: Color Scheme Decision** 🎨 **LOW PRIORITY**

**Current Situation:**
- **Ship Sticks Website:** Primary green #5fd063 (currently implemented)
- **PRD Specification:** Golf green #2E7D32, Gold #FFC107, Blue #1976D2

**Options:**
1. **Keep Website Colors** (Current): Maintains brand consistency with shipsticks.com
2. **Use PRD Colors**: More traditional "golf" aesthetic

**Recommendation:** Keep website colors for brand consistency

**If Change Needed:**
- Update: `tailwind.config.ts` lines 65-95
- Find/replace: `#5fd063` → `#2E7D32`
- Add gold accents: `#FFC107` for premium features

---

### **EPIC 8: Remaining Page Updates** 🔧 **MEDIUM PRIORITY**

#### Story 8.1: Update Claims/Customers Page
**File:** `app/(app)/dashboard/claims/page.tsx`
- Convert patient records table to customer orders
- Replace MRN numbers with order/tracking numbers
- Update filters from medical conditions to equipment types

#### Story 8.2: Update Referrals/Partners Page
**File:** `app/(app)/dashboard/referrals/page.tsx`
- Convert provider network to golf course partners
- Replace specialist types with golf course categories
- Update metrics from referral volume to partnership shipping volume

#### Story 8.3: Landing Page Review
**File:** `app/(marketing)/page.tsx`
- Currently redirects to dashboard
- May not need changes if staying as redirect
- If expanded: Add Ship Sticks hero section, value props

#### Story 8.4: Final Terminology Audit
**Search and Replace:**
- "patient" → "customer" or "golfer"
- "medical" / "healthcare" → "shipping" or "travel"
- "Arthur" → "Ship Sticks"
- "policy" / "insurance" → "shipment" or "delivery"
- "treatment" → "service"
- "diagnosis" → "assessment"

---

## 🎯 **RECOMMENDED EXECUTION ORDER**

### **Phase 1: Demo-Ready (2 hours)** ⚡
**Goal:** Client-facing demo functionality

1. **EPIC 4: Golf Demo Data** (30 min)
   - Create golf courses data file
   - Create sample shipments data
   - Create shipping routes data

2. **EPIC 3: Demo Page Transformation** (45 min)
   - Replace healthcare cases with golf shipments
   - Update tab labels and content
   - Implement golf equipment vision simulation

3. **EPIC 1: Golf Concierge AI** (45 min)
   - Update welcome message
   - Replace quick questions
   - Update model options
   - Replace patient context

### **Phase 2: Full Experience (Next 2 hours)** ⚠️
**Goal:** Complete interactive experience

4. **EPIC 2: Smart Booking Form** (60 min)
   - Build 4-step wizard
   - Implement computer vision simulation
   - Add service tier selection

5. **EPIC 8: Remaining Pages** (30 min)
   - Update customers page
   - Update partners page
   - Final terminology audit

6. **EPIC 6: Predictive Analytics** (30 min)
   - Delivery prediction cards
   - Weather widget
   - Route optimization display

### **Phase 3: Polish (If time permits)** 🔨
7. **EPIC 5: Text-to-SQL** (optional)
8. **EPIC 7: Color refinement** (optional)

---

## 📝 **ACCEPTANCE CRITERIA**

### **Minimum Viable Demo (MVP):**
- [ ] Demo page shows golf shipments (not diabetes/CHF)
- [ ] AI assistant discusses golf travel (not medical care)
- [ ] Computer vision analyzes golf bags (not property damage)
- [ ] All visible UI text is Ship Sticks branded
- [ ] Dashboard shows shipping metrics
- [ ] No healthcare terminology in user-facing content

### **Complete Success:**
- [ ] Smart booking form functional end-to-end
- [ ] Weather and routing predictions displayed
- [ ] All dashboard pages converted
- [ ] Text-to-SQL with golf queries working
- [ ] Zero healthcare references in entire codebase

### **Demo Flow Script:**
1. **Open Dashboard** → Show shipping metrics
2. **Navigate to Demo Page** → Upload golf bag photo
3. **Show AI Analysis** → Equipment detected, insurance recommended
4. **Select Shipping Option** → Express to Pebble Beach
5. **Open AI Assistant** → Ask "When should I ship my clubs?"
6. **Show Response** → AI provides golf-specific travel advice

---

## 🚀 **QUICK REFERENCE**

### **Key Files to Modify:**
1. `components/mobile-chat-interface.tsx` (1,202 lines) - AI Assistant
2. `app/(marketing)/demo/page.tsx` (1,083 lines) - Demo showcase
3. `app/(app)/dashboard/claims/page.tsx` - Customers page
4. `app/(app)/dashboard/referrals/page.tsx` - Partners page

### **Files to Create:**
1. `lib/data/golf-courses.ts` - Golf course database
2. `lib/data/shipping-routes.ts` - Route information
3. `lib/data/sample-shipments.ts` - Demo shipment data
4. `components/booking/ShipmentBookingWizard.tsx` - Booking form
5. `components/analytics/ShipmentIntelligence.tsx` - Predictive analytics

### **Search Terms for Audit:**
```bash
# Find remaining healthcare references:
grep -r "patient" app/ components/ --include="*.tsx" --include="*.ts"
grep -r "Arthur" app/ components/ --include="*.tsx" --include="*.ts"
grep -r "medical\|healthcare" app/ components/ --include="*.tsx" --include="*.ts"
grep -r "policy" app/ components/ --include="*.tsx" --include="*.ts"
```

---

**Document Version:** 1.0
**Last Updated:** 2025-10-16
**Next Review:** After Phase 1 completion
