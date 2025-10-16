# Ship Sticks AI-Powered Golf Logistics POC - Product Requirements Document

## Executive Summary
**Project Name:** Ship Sticks AI Transformation POC  
**Timeline:** 2-hour development sprint  
**Platform:** Existing NextJS application with Claude Code integration  
**Objective:** Demonstrate AI-powered logistics capabilities tailored for Ship Sticks' golf equipment transportation service

## 1. Business Context

### Company Overview
Ship Sticks is the premier white-glove golf equipment transportation service, serving golfers worldwide by shipping their clubs and gear to destinations hassle-free. Based on our research, their key value propositions include:
- Door-to-door golf club shipping
- $1,000+ guaranteed protection
- Real-time tracking
- White-glove concierge service
- Partnerships with major golf resorts and clubs

### Key Business Drivers for AI Implementation
1. **Operational Efficiency:** Reduce logistics costs by 30-40% through AI-optimized routing
2. **Customer Experience:** Enhance personalization and reduce response time from hours to seconds
3. **Competitive Moat:** First-to-market with AI-powered golf logistics platform
4. **Revenue Growth:** Increase customer lifetime value through predictive analytics and upselling

## 2. POC Feature Set

### 2.1 AI-Powered Shipment Analytics Dashboard (Text-to-SQL)

**Feature Name:** Ship Sticks Intelligence Hub  
**Implementation:** Modify existing text-to-SQL functionality

**Demo Queries to Showcase:**
```sql
-- Most valuable for Ship Sticks decision-making:
1. "Show me shipments to top golf destinations this month"
2. "What's the average delivery time to Pebble Beach?"
3. "Which routes have the highest damage claims?"
4. "Show revenue by golf resort partnerships"
5. "What's our busiest shipping corridor?"
```

**Database Schema to Simulate:**
```sql
Tables:
- shipments (id, customer_id, origin, destination, golf_course, status, created_at)
- customers (id, name, tier, lifetime_value, preferred_courses)
- golf_courses (id, name, location, partnership_tier, shipping_volume)
- claims (id, shipment_id, type, amount, resolution_status)
- pricing_history (id, route, price, season, demand_level)
```

**Claude Code Instructions:**
```markdown
1. Update the existing SQL query interface labels to reference:
   - "Golf Equipment Shipments" instead of generic data
   - "Resort Partners" instead of clients
   - "Club Protection Claims" instead of issues
2. Pre-populate sample queries specific to golf logistics
3. Update response formatting to show golf-specific metrics
```

### 2.2 Golf Concierge AI Agent

**Feature Name:** Ship Sticks AI Concierge  
**Implementation:** Customize existing AI chat agent

**Key Personas & Use Cases:**
1. **Traveling Golfer:**
   - "I'm playing at St. Andrews next month. When should I ship my clubs?"
   - "What's the weather forecast for my clubs' arrival at Whistling Straits?"
   - "Can you arrange pickup from my home and delivery to Kiawah Island?"

2. **Golf Resort Partner:**
   - "How many sets are arriving for our tournament this week?"
   - "Can we set up a bulk shipping discount for our members?"

3. **Insurance & Claims:**
   - "My driver was damaged. How do I file a claim?"
   - "What's covered under the $1,000 protection?"

**Claude Code Instructions:**
```markdown
1. Update chat agent system prompt to include:
   - Ship Sticks brand voice (professional, golf-knowledgeable, service-oriented)
   - Golf terminology and course knowledge
   - Shipping logistics expertise
   - Weather integration for golf destinations
2. Add golf-specific response templates
3. Include partnership benefits and VIP tier recognition
```

### 2.3 Smart Shipment Request Form

**Feature Name:** AI-Enhanced Booking Flow  
**Implementation:** Enhance existing multi-step form

**Step 1: Origin & Destination**
```markdown
Fields to update:
- Origin: "Pickup Location" with golf club storage tips
- Destination: Dropdown of partner golf resorts + custom entry
- Dates: Smart suggestions based on tee times and travel dates
```

**Step 2: Equipment Details**
```markdown
Fields to update:
- Equipment Type: Golf Bag, Travel Case, Push Cart, etc.
- Number of Clubs: AI validates against typical set composition
- Special Items: Rangefinder, Golf Shoes, Rain Gear
- Estimated Value: For insurance calculation
```

**Step 3: Computer Vision Simulation (Image Upload)**
```markdown
When image is uploaded:
1. Display: "AI analyzing your golf equipment..."
2. Generate simulated response:
   - Equipment Detected: "TaylorMade Stand Bag with 14 clubs"
   - Condition Assessment: "Excellent - No visible damage"
   - Packing Recommendations: "Add bubble wrap to driver head"
   - Insurance Suggestion: "Based on equipment value: $2,500 coverage recommended"
```

**Step 4: Service Selection**
```markdown
AI-Powered Recommendations:
- Standard (5-7 days): $89 - "Perfect for planned trips"
- Express (2-3 days): $149 - "Recommended for your timeline"
- Overnight: $249 - "Guaranteed next-day delivery"
- White Glove VIP: $399 - "Door-to-course concierge service"
```

**Claude Code Instructions:**
```markdown
1. Update all form labels and placeholders to be golf-specific
2. Add golf course autocomplete using a predefined list of top 100 courses
3. Implement smart date validation (no shipping on tournament blackout dates)
4. Create the computer vision simulation logic
5. Add dynamic pricing display based on route and timing
6. Include weather alerts for destination
```

### 2.4 Predictive Analytics Display

**Feature Name:** Shipment Intelligence  
**Implementation:** Add to existing dashboard

**Key Metrics to Display:**
```markdown
1. Delivery Time Prediction: "Your clubs will arrive 24 hours before tee time"
2. Weather Impact: "Clear skies expected - no delays anticipated"
3. Route Optimization: "Saved 12 hours via Memphis hub routing"
4. Damage Risk Score: "Low risk - professional handling at all touchpoints"
5. Price Optimization: "Book now - prices increase 20% during Masters week"
```

## 3. Technical Implementation Guide for Claude Code

### 3.1 File Structure Updates
```markdown
/components
  /ShipSticks
    - Logo.jsx (update with Ship Sticks branding)
    - NavigationBar.jsx (golf-themed navigation)
    - MetricsCards.jsx (golf logistics KPIs)
    
/data
  - golfCourses.json (top 100 golf destinations)
  - shippingRoutes.json (popular corridors)
  - sampleShipments.json (demo data)
  - partnerResorts.json (partnership tiers)
```

### 3.2 Quick Branding Updates
```javascript
// Color Scheme
const shipSticksTheme = {
  primary: '#2E7D32', // Golf green
  secondary: '#FFC107', // Premium gold
  accent: '#1976D2', // Trust blue
  background: '#FAFAFA',
  text: '#212121'
}

// Copy Updates
const brandCopy = {
  hero: "AI-Powered Golf Logistics Excellence",
  tagline: "Your Clubs, Delivered With Intelligence",
  cta: "Ship Smarter with AI"
}
```

### 3.3 Demo Data Generation
```javascript
// Generate realistic golf shipment data
const generateDemoShipments = () => {
  const destinations = [
    'Pebble Beach Golf Links',
    'Augusta National',
    'St. Andrews',
    'Pinehurst Resort',
    'Whistling Straits'
  ];
  
  const statuses = [
    'In Transit - On Schedule',
    'Delivered to Pro Shop',
    'Out for Delivery',
    'Processing at Hub'
  ];
  
  // Generate 50 sample shipments
  return Array.from({length: 50}, (_, i) => ({
    id: `SS-2024-${1000 + i}`,
    customer: `Golfer ${i}`,
    destination: destinations[i % 5],
    status: statuses[i % 4],
    deliveryDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
    value: 1500 + Math.random() * 3500
  }));
};
```

## 4. Demo Flow Script

### Opening (30 seconds)
"Welcome to Ship Sticks' AI-powered logistics platform - transforming how golfers ship their equipment worldwide."

### Act 1: Intelligence Dashboard (45 seconds)
1. Show text-to-SQL: "Which destinations are trending this month?"
2. Display visual dashboard with golf course heat map
3. Query: "What's our on-time delivery rate to championship courses?"
4. Show 98.5% success rate with AI optimization

### Act 2: AI Concierge Demo (45 seconds)
1. Customer asks: "I'm playing the Old Course next week. When should I ship?"
2. AI responds with personalized recommendation including weather check
3. Customer: "Can you handle my oversized tour bag?"
4. AI provides specific handling instructions and insurance options

### Act 3: Smart Booking with Vision AI (45 seconds)
1. Start multi-step booking form
2. Select "Pebble Beach" as destination
3. Upload image of golf bag
4. Show AI analysis: "Callaway Cart Bag detected - 14 clubs identified"
5. Display smart recommendations for shipping options
6. Complete booking with one click

### Closing (15 seconds)
"Ship Sticks + AI: Reducing shipping times by 30%, claims by 50%, and delivering peace of mind to every golfer."

## 5. High-Impact Talking Points

### ROI Metrics
- **30% reduction** in shipping costs through AI route optimization
- **50% decrease** in damage claims via predictive handling
- **80% faster** customer service response times
- **25% increase** in customer lifetime value through personalization

### Competitive Advantages
1. **First-Mover:** Only AI-powered golf logistics platform
2. **Network Effects:** Partner resort integrations create moat
3. **Data Advantage:** Largest golf shipping dataset for ML training
4. **Brand Trust:** AI enhances existing white-glove reputation

### Media-Worthy Angles
- "Ship Sticks Launches Golf's First AI Concierge"
- "How AI is Revolutionizing Golf Travel"
- "The End of Lost Golf Clubs: AI Tracking Guarantees Delivery"

## 6. Claude Code Implementation Checklist

```markdown
[ ] Update NextJS app logo and branding colors
[ ] Modify navigation menu with golf-specific terms
[ ] Update SQL schema and sample queries for golf logistics
[ ] Customize AI agent system prompt for golf expertise
[ ] Enhance multi-step form with golf-specific fields
[ ] Implement computer vision simulation logic
[ ] Add weather API integration mock
[ ] Create golf course autocomplete functionality
[ ] Generate and load demo shipment data
[ ] Update all UI text to Ship Sticks terminology
[ ] Add golf course imagery and icons
[ ] Implement predictive analytics displays
[ ] Test complete demo flow
[ ] Prepare fallback responses for edge cases
```

## 7. Post-Demo Next Steps

### Immediate Wins (Week 1)
- Deploy AI chat agent on Ship Sticks website
- Implement basic text-to-SQL for internal dashboards
- Begin collecting training data for computer vision

### Phase 2 (Month 1)
- Full integration with shipping partners' APIs
- Launch predictive pricing engine
- Deploy route optimization algorithms

### Phase 3 (Quarter 1)
- Complete computer vision system for equipment verification
- Launch B2B portal for resort partners
- Implement dynamic insurance pricing

## 8. Risk Mitigation

### Demo Risks
- **Technical Issues:** Have static screenshots as backup
- **Data Questions:** Prepare canned responses for complex queries
- **Integration Concerns:** Emphasize API-first architecture
- **ROI Skepticism:** Show competitor shipping costs comparison

## Appendix: Quick Reference for Claude Code

### Essential Commands
```bash
# Update branding
npm run update-theme --company="Ship Sticks"

# Load demo data
npm run seed-demo --industry="golf-logistics"

# Test AI responses
npm run test-agent --persona="golf-concierge"

# Build for demo
npm run build-demo --time-limit="2h"
```

### Key Files to Modify
1. `/app/layout.tsx` - Brand colors and fonts
2. `/components/ChatAgent.tsx` - AI concierge interface
3. `/components/SqlQuery.tsx` - Analytics dashboard
4. `/components/MultiStepForm.tsx` - Booking flow
5. `/lib/constants.ts` - All text strings and labels
6. `/public/` - Logo and golf imagery

---

**Success Criteria:** By the end of the 2-hour sprint, Ship Sticks executives should see a compelling vision of their AI-powered future that demonstrates immediate value and long-term transformation potential.
