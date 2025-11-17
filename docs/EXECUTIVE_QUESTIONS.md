# Executive Demo Questions - Ship Sticks SQL Agent

## Overview
15 high-impact business questions that demonstrate the SQL agent's value to leadership. Each question maps to specific database tables and delivers actionable insights with measurable ROI.

---

## 💰 Revenue Optimization ($50K-200K Annual Impact)

### 1. Customer Lifetime Value by Acquisition Channel
**Question:** "What is our customer lifetime value by acquisition channel?"

**Database Tables:**
- `customers` (customer_id, acquisition_channel, lifetime_value, customer_segment)

**Expected Columns:** `acquisition_channel`, `avg_lifetime_value`, `customer_count`, `total_revenue`

**Quick Mode Response (3-5 sentences):**
> Our organic search channel delivers the highest customer lifetime value at **$2,450 per customer** (45 customers), followed by partner referrals at **$2,180** (38 customers). In contrast, paid social generates only **$680 LTV** (120 customers) despite high volume, suggesting we're attracting price-sensitive customers through that channel.

**Pro Mode Response (200+ words with 4 sections):**
- 📊 Key Findings: Breakdown of all channels with LTV, customer count, conversion rates
- 💰 Financial Impact: Revenue per channel, cost per acquisition, net margin analysis
- ⚠️ Risk Areas: Underperforming channels costing $30K annually
- 🎯 Recommendations: Shift 30% of paid social budget to organic/SEO ($40K-60K impact)

**ROI:** 20% improvement = $30K-60K annual savings

---

### 2. Carrier Performance by Success Rate and Profit Margin
**Question:** "Compare carrier performance by success rate and profit margin"

**Database Tables:**
- `shipments` (carrier, status, deliveredOnTime, basePrice, totalPrice)
- `carrier_performance` (carrier, success_rate, avg_margin, route)

**Expected Columns:** `carrier_name`, `success_rate`, `profit_margin`, `shipment_volume`, `revenue`

**Quick Mode:**
> FedEx Express leads with **95.2% on-time delivery** and **24.3% profit margins** (450 shipments), while Budget Carrier shows **87.1% success** but only **16.8% margins** (380 shipments). UPS Ground delivers **92.5% success** at **22.1% margins** (520 shipments).

**Pro Mode:**
- Comprehensive breakdown by carrier, service level, route
- Cost-benefit analysis showing $45K-75K opportunity
- Specific recommendations for volume shifting

**ROI:** 3-5% margin improvement = $45K-75K annually

---

### 3. Profit Margins Across Service Tiers
**Question:** "Compare our profit margins across different service tiers"

**Database Tables:**
- `shipments` (serviceLevel, basePrice, totalPrice, cost)

**Expected Columns:** `service_tier`, `avg_margin`, `shipment_count`, `total_revenue`, `avg_price`

**Quick Mode:**
> Premium White Glove service averages **28.4% margins** at $450/shipment (125 shipments), while Standard service delivers **18.2% margins** at $185/shipment (1,240 shipments). Express tier hits **22.7% margins** at $285/shipment (380 shipments).

**Pro Mode:**
- Detailed tier analysis with upsell opportunities
- Calculate impact of converting 25% of Standard to Premium
- Customer segment analysis showing which segments prefer premium

**ROI:** $40K-60K margin improvement through strategic upselling

---

### 4. Conversion Rates from Quote to Booking by Segment
**Question:** "Show me conversion rates from quote to booking by customer segment"

**Database Tables:**
- `customer_sessions` (customer_id, quotes_generated, bookings_made, customer_segment)

**Expected Columns:** `customer_segment`, `quotes`, `bookings`, `conversion_rate`, `avg_quote_value`

**Quick Mode:**
> Corporate customers convert at **45.2%** (245 quotes → 111 bookings), while individual golfers convert at **22.8%** (1,450 quotes → 331 bookings). Country club members show **38.7%** conversion (420 quotes → 162 bookings).

**Pro Mode:**
- Segment-by-segment breakdown with behavioral patterns
- Personalized follow-up strategies for each segment
- Revenue impact of improving conversion by 10% per segment

**ROI:** 10% conversion improvement = $75K-125K additional revenue

---

## 📉 Cost Reduction & Operational Efficiency ($30K-80K Annual Impact)

### 5. Routes with Highest Failure Rates and Cost Impact
**Question:** "Which routes have the highest failure rates and what is the cost impact?"

**Database Tables:**
- `routes` (route_id, origin, destination, failure_rate, shipment_count)
- `shipments` (route_id, status, refund_amount, reshipment_cost)

**Expected Columns:** `route_name`, `failure_rate`, `failed_shipments`, `cost_impact`, `shipment_volume`

**Quick Mode:**
> Austin-Phoenix route shows **22.3% failure rate** (89 failed / 399 total), costing approximately **$15,500 quarterly** in refunds and re-shipments. Denver-Miami follows at **18.7%** ($12,200 cost) and Seattle-Atlanta at **16.4%** ($9,800 cost).

**Pro Mode:**
- Root cause analysis by carrier, season, weather patterns
- Specific carrier switch recommendations
- Pricing adjustment strategies for high-risk routes
- Expected savings from improvements

**ROI:** 15-25% failure reduction = $7.5K-12.5K quarterly savings

---

### 6. Insurance Coverage Gap by Route
**Question:** "Show me the insurance coverage gap by route and estimate potential losses"

**Database Tables:**
- `shipments` (route, estimatedValue, insuranceFee, insurance_coverage)
- `insurance_claims` (route, claim_amount, coverage_amount, denied_amount)

**Expected Columns:** `route`, `uninsured_value`, `claim_frequency`, `potential_loss`, `premium_gap`

**Quick Mode:**
> High-value routes to Pebble Beach and St. Andrews show **$45K in uninsured exposure** (28 shipments with equipment valued over $5K but only $2K coverage). Estimated quarterly risk: **$18K** based on 2.3% damage rate.

**Pro Mode:**
- Route-by-route risk exposure analysis
- Customer insurance adoption rates
- Premium pricing recommendations to close gap
- Historical claim payouts vs coverage

**ROI:** Prevent one $40K claim = $40K saved + customer retention

---

### 7. Tracking Delays by Carrier
**Question:** "What percentage of shipments have tracking delays and which carriers are responsible?"

**Database Tables:**
- `tracking_events` (shipment_id, carrier, event_type, delay_minutes)
- `shipments` (carrier, status, estimated_delivery, actual_delivery)

**Expected Columns:** `carrier`, `delay_percentage`, `avg_delay_hours`, `delayed_count`, `total_shipments`

**Quick Mode:**
> Budget Carrier shows **28.4% delayed shipments** (avg 18 hours late), costing approximately **$12K quarterly** in customer service and compensations. FedEx delays only **5.2%** of shipments, while UPS shows **8.7%** delays.

**Pro Mode:**
- Carrier performance scorecards with trends
- Cost breakdown: support time, compensations, customer churn
- Specific volume shift recommendations
- Expected improvement impact

**ROI:** 40% delay reduction = $14K-20K annual savings

---

### 8. Seasonal Revenue Patterns
**Question:** "Analyze our revenue by month and identify seasonal patterns"

**Database Tables:**
- `daily_metrics` (metric_date, revenue, shipments, margins)
- `shipments` (createdAt, totalPrice, destination)

**Expected Columns:** `month`, `revenue`, `shipment_count`, `avg_price`, `margin`

**Quick Mode:**
> Peak season (March-May) generates **$185K/month** (1,850 shipments), while off-season (July-September) drops to **$78K/month** (720 shipments) - a **40% revenue variance**. Winter months (Nov-Feb) average **$115K/month**.

**Pro Mode:**
- Month-by-month breakdown with year-over-year trends
- Destination analysis (Pebble Beach peaks in April, Scotland in July)
- Dynamic pricing strategies for demand smoothing
- Staffing and capacity optimization recommendations

**ROI:** 12% revenue smoothing + 15% cost reduction = $25K-45K annually

---

## 👥 Customer Experience & Retention ($40K-100K Annual Impact)

### 9. Top Customer Service Issues and Resolution Times
**Question:** "What are the top customer service issues and their resolution times?"

**Database Tables:**
- `customer_service_tickets` (ticket_id, type, priority, resolution_time_hours, satisfaction_score)

**Expected Columns:** `issue_type`, `ticket_count`, `avg_resolution_hours`, `sla_compliance`, `satisfaction`

**Quick Mode:**
> "Where's my shipment?" queries account for **35% of tickets** (240 tickets) with **48-hour avg resolution** vs 24-hour SLA. Damage claims average **72 hours** (18% of tickets), while pricing questions resolve in **6 hours** (22% of tickets).

**Pro Mode:**
- Issue-by-issue breakdown with severity levels
- SLA compliance analysis showing 30% miss rate
- Cost per ticket type calculation
- Automation opportunities (chatbot for tracking = 40% reduction)
- Staffing recommendations based on volume patterns

**ROI:** 25% support cost reduction + 10% churn prevention = $35K-70K annually

---

### 10. NPS Scores by Customer Segment and Service Tier
**Question:** "Show me NPS scores by customer segment and service tier"

**Database Tables:**
- `nps_surveys` (customer_id, nps_score, customer_segment, service_tier, likelihood_to_recommend)

**Expected Columns:** `segment`, `service_tier`, `avg_nps`, `promoters`, `detractors`, `survey_count`

**Quick Mode:**
> Premium White Glove customers score **NPS 72** (65% promoters, 8% detractors), while Standard service shows **NPS 38** (32% promoters, 28% detractors). Corporate segment averages **NPS 58** vs individual golfers at **NPS 42**.

**Pro Mode:**
- Segment-by-segment NPS breakdown with trends
- Service tier impact analysis
- Detractor feedback themes and root causes
- Targeted improvement initiatives by segment
- Churn risk quantification for low-NPS segments

**ROI:** 5% churn reduction on high-LTV customers = $30K-50K annually

---

### 11. Customer Acquisition Cost vs Lifetime Value Trends
**Question:** "Analyze customer acquisition cost vs lifetime value trends"

**Database Tables:**
- `marketing_campaigns` (campaign_id, spend, conversions)
- `customers` (customer_id, acquisition_channel, lifetime_value, acquisition_date)

**Expected Columns:** `time_period`, `avg_cac`, `avg_ltv`, `ltv_cac_ratio`, `customer_count`

**Quick Mode:**
> CAC has increased from **$45** (Q1 2024) to **$78** (Q4 2024), while LTV remains flat at **$850** - reducing our LTV:CAC ratio from **18.9x to 10.9x**. Marketing efficiency declining despite stable retention rates.

**Pro Mode:**
- Quarterly trend analysis with channel breakdowns
- Root cause analysis (competition, ad costs, conversion rates)
- Channel reallocation recommendations
- Retention program impact on LTV
- Forecasted improvements from optimization

**ROI:** Restore CAC to $55 + 15% LTV increase = $40K-80K annually

---

## 📊 Strategic Planning & Partnerships ($60K-150K Annual Impact)

### 12. Top 10 Partner Courses by Volume and Revenue
**Question:** "Identify our top 10 partner courses by volume and revenue"

**Database Tables:**
- `partner_courses` (course_id, course_name, partnership_type, commission_rate)
- `shipments` (destination_course_id, totalPrice, count)

**Expected Columns:** `course_name`, `shipment_volume`, `total_revenue`, `avg_margin`, `partnership_tier`

**Quick Mode:**
> Pebble Beach leads with **450 shipments** generating **$185K revenue** at **18.2% margins**, followed by Pinehurst (**385 shipments, $145K**) and St. Andrews (**280 shipments, $165K**). Top 10 courses drive **60% of volume** but only **45% of margins**.

**Pro Mode:**
- Complete partner ranking with financial analysis
- Commission rate vs volume analysis
- Renegotiation opportunities (3% rate reduction = $20K)
- Emerging partner identification
- Strategic expansion recommendations

**ROI:** 3% commission improvement = $20K-35K annually

---

### 13. Marketing Campaign ROI Analysis
**Question:** "Which marketing campaigns had the highest ROI and why?"

**Database Tables:**
- `marketing_campaigns` (campaign_id, name, type, spend, conversions, revenue, roi)

**Expected Columns:** `campaign_name`, `spend`, `revenue`, `roi`, `conversions`, `avg_customer_value`

**Quick Mode:**
> "Spring Golf Getaway" email campaign achieved **450% ROI** ($15K spend → $67.5K revenue, 85 conversions), while "Social Media Blast" lost money at **-20% ROI** ($25K spend → $20K revenue, 45 conversions). SEO content marketing shows **380% ROI** ($8K spend → $30.4K).

**Pro Mode:**
- Campaign-by-campaign performance breakdown
- Channel mix optimization (kill underperformers, 2x winners)
- Customer segment targeting analysis
- Attribution model showing multi-touch journeys
- Budget reallocation recommendations

**ROI:** 35% marketing efficiency gain = $45K-70K annually

---

### 14. Monthly Recurring Revenue from Premium Memberships
**Question:** "Analyze our monthly recurring revenue from premium memberships"

**Database Tables:**
- `customers` (customer_id, membership_tier, monthly_fee, subscription_start, subscription_status)
- `subscriptions` (customer_id, mrr, churn_date)

**Expected Columns:** `month`, `mrr`, `new_mrr`, `churned_mrr`, `net_mrr_growth`, `churn_rate`

**Quick Mode:**
> Current MRR is **$12,450** from 95 premium members ($131/member avg), but experiencing **8.2% monthly churn** - losing approximately **$1,020/month**. New subscriptions average **$1,850/month** (14 new members), yielding **+$830 net growth**.

**Pro Mode:**
- Monthly trend analysis with cohort retention curves
- Churn reasons and at-risk member identification
- Retention program effectiveness (target 4% churn)
- LTV impact of reducing churn by 50%
- Member benefit optimization recommendations

**ROI:** Reduce churn to 4% = $30K-50K LTV improvement

---

### 15. Multi-Dimensional Route Failure Analysis
**Question:** "Which routes have the highest failure rates and why? Show me a detailed breakdown by carrier, time of year, and estimated annual cost"

**Database Tables:**
- `routes` (route_id, origin, destination, failure_rate)
- `shipments` (route_id, carrier, created_at, status, refund_amount)
- `tracking_events` (shipment_id, event_type, weather_condition)

**Expected Columns:** `route`, `carrier`, `month`, `failure_rate`, `failure_count`, `cost`, `weather_impact`

**Quick Mode:**
> Austin-Phoenix via Budget Carrier fails **31.5%** in summer (July-Aug) vs **15.2%** in spring, costing **$28K annually**. Root cause: inadequate climate control during 100°F+ temps. FedEx on same route: only **8.7%** failure rate.

**Pro Mode (Complex Multi-Dimensional Analysis):**
- 📊 Key Findings:
  - Route × Carrier matrix showing performance variations
  - Seasonal impact analysis (summer heat, winter storms)
  - Equipment type vulnerability (leather bags vs synthetic)
  - Final-mile vs transit failure breakdown

- 💰 Financial Impact:
  - Annual cost: $85K across all problem routes
  - By carrier: Budget Carrier ($45K), Regional Shipper ($28K), Others ($12K)
  - By season: Summer ($38K), Winter ($32K), Spring/Fall ($15K)
  - Lost customer lifetime value: $45K (12 churned customers)

- ⚠️ Risk Areas:
  - Budget Carrier summer failures 7x higher than FedEx
  - High-value equipment ($5K+) shows 2.5x damage rate
  - 3 specific routes account for 68% of total failure costs

- 🎯 Recommendations:
  1. Switch Austin-Phoenix to FedEx for summer months → Save $15K/year
  2. Require climate-controlled shipping for high-value equipment → Reduce damage 60%
  3. Adjust pricing +15% on high-risk routes → $12K additional revenue
  4. Implement carrier performance auto-switching (>10% failure = switch) → $20K savings

**ROI:** Reduce failures from 15% to 8% = $35K-50K annual savings + customer retention

---

## Database Schema Reference

### Core Tables Used:
- **customers**: customer_id, acquisition_channel, lifetime_value, customer_segment, subscription_tier
- **shipments**: shipment_id, customer_id, carrier, route_id, service_level, status, pricing, dates, insurance
- **routes**: route_id, origin, destination, distance, failure_rate, avg_delivery_days
- **partner_courses**: course_id, course_name, partnership_type, commission_rate, volume
- **marketing_campaigns**: campaign_id, name, spend, conversions, revenue, roi
- **customer_service_tickets**: ticket_id, type, priority, resolution_time, satisfaction_score
- **nps_surveys**: customer_id, nps_score, segment, service_tier, likelihood_to_recommend
- **insurance_claims**: claim_id, shipment_id, claim_amount, status, coverage_amount
- **tracking_events**: event_id, shipment_id, carrier, delay_minutes, weather_condition
- **daily_metrics**: metric_date, revenue, shipments, deliveries, success_rate, nps

---

## Testing Instructions

### 1. Test Quick Mode (Concise Responses)
```
1. Select "Ship Sticks Quick" from dropdown
2. Ask: "What is our customer lifetime value by acquisition channel?"
3. Expected: 3-5 sentence response with key numbers in bold
4. Verify console: "using QUICK mode"
```

### 2. Test Pro Mode (Comprehensive Analysis)
```
1. Select "Ship Sticks Pro" from dropdown
2. Ask: "What is our customer lifetime value by acquisition channel?"
3. Expected: 200+ word response with 4 sections:
   - 📊 Key Findings
   - 💰 Financial Impact
   - ⚠️ Risk Areas & Opportunities
   - 🎯 Actionable Recommendations
4. Verify console: "using PRO mode"
```

### 3. Test SQL Detection
All 15 questions above should be automatically detected as SQL queries and routed to the SQL agent, regardless of whether they're typed manually or clicked from quick questions.

---

## Success Criteria

✅ All 15 executive questions properly detected as SQL queries
✅ Quick mode returns concise 3-5 sentence responses
✅ Pro mode returns comprehensive 200+ word analysis with 4 sections
✅ Dropdown selection controls response depth (not just auto-detection)
✅ Quick questions updated to show executive-level queries
✅ Both SQLAnalyticsChat and MobileChatInterface use new questions
✅ Console logs confirm correct mode routing

## Expected Business Impact

If all 15 questions can be answered effectively:

**Total Potential Annual Impact: $310K - $780K**

- Revenue Optimization: $50K-200K
- Cost Reduction: $30K-80K
- Customer Retention: $40K-100K
- Strategic Planning: $60K-150K
- Operational Efficiency: $30K-80K
- Risk Mitigation: $100K-170K

This demonstrates clear, measurable ROI that will make leadership want to implement the SQL agent immediately.
