/**
 * Column name mapping for user-friendly display names
 * Maps database column names to human-readable labels
 */

export const COLUMN_NAME_MAPPING: Record<string, string> = {
  // Customer fields
  customer_id: "Customer ID",
  email: "Email",
  first_name: "First Name",
  last_name: "Last Name",
  phone: "Phone",
  acquisition_channel: "Acquisition Channel",
  acquisition_date: "Acquisition Date",
  customer_segment: "Customer Segment",
  lifetime_value: "Lifetime Value",
  
  // Shipment fields
  shipment_id: "Shipment ID",
  tracking_number: "Tracking Number",
  origin_city: "Origin",
  origin_state: "Origin State",
  origin_zip: "Origin ZIP",
  destination_city: "Destination",
  destination_state: "Destination State",
  destination_zip: "Destination ZIP",
  partner_course_id: "Partner Course ID",
  service_level: "Service Level",
  carrier: "Carrier",
  status: "Status",
  scheduled_pickup_date: "Scheduled Pickup",
  actual_pickup_date: "Actual Pickup",
  scheduled_delivery_date: "Scheduled Delivery",
  actual_delivery_date: "Actual Delivery",
  base_price: "Base Price",
  insurance_price: "Insurance Price",
  total_price: "Total Price",
  carrier_cost: "Carrier Cost",
  gross_margin: "Gross Margin",
  weight_lbs: "Weight (lbs)",
  package_type: "Package Type",
  equipment_value: "Equipment Value",
  insurance_coverage: "Insurance Coverage",
  was_upgraded: "Upgraded",
  upgrade_cost: "Upgrade Cost",
  
  // Partner course fields
  course_id: "Course ID",
  course_name: "Course Name",
  partnership_type: "Partnership Type",
  city: "City",
  state: "State",
  country: "Country",
  partnership_start_date: "Partnership Start",
  exclusivity_agreement: "Exclusive",
  exclusivity_end_date: "Exclusivity End",
  commission_rate: "Commission Rate",
  avg_customer_rating: "Avg Rating",
  is_top_400: "Top 400 Course",
  
  // Tracking event fields
  event_id: "Event ID",
  event_type: "Event Type",
  event_timestamp: "Event Time",
  location_city: "Location",
  location_state: "Location State",
  location_facility: "Facility",
  carrier_status_code: "Status Code",
  exception_reason: "Exception Reason",
  
  // Insurance claim fields
  claim_id: "Claim ID",
  claim_date: "Claim Date",
  claim_amount: "Claim Amount",
  claim_status: "Claim Status",
  claim_type: "Claim Type",
  denial_reason: "Denial Reason",
  resolution_date: "Resolution Date",
  payout_amount: "Payout Amount",
  days_to_resolution: "Days to Resolve",
  
  // Customer service fields
  ticket_id: "Ticket ID",
  ticket_type: "Ticket Type",
  priority: "Priority",
  resolved_at: "Resolved At",
  resolution_time_minutes: "Resolution Time (min)",
  agent_id: "Agent ID",
  customer_satisfaction_score: "Satisfaction Score",
  
  // Route fields
  route_id: "Route ID",
  distance_miles: "Distance (mi)",
  typical_transit_days: "Typical Transit Days",
  failure_rate_pct: "Failure Rate %",
  damage_rate_pct: "Damage Rate %",
  damage_rate: "Damage Rate",
  is_high_volume: "High Volume",
  avg_margin: "Avg Margin",
  
  // Marketing campaign fields
  campaign_id: "Campaign ID",
  campaign_name: "Campaign Name",
  campaign_type: "Campaign Type",
  promo_code: "Promo Code",
  start_date: "Start Date",
  end_date: "End Date",
  total_spend: "Total Spend",
  conversions: "Conversions",
  revenue_generated: "Revenue Generated",
  roi: "ROI",
  
  // Session fields
  session_id: "Session ID",
  session_date: "Session Date",
  source: "Source",
  quotes_generated: "Quotes Generated",
  booking_completed: "Booking Completed",
  cart_value: "Cart Value",
  abandonment_stage: "Abandonment Stage",
  
  // NPS survey fields
  survey_id: "Survey ID",
  survey_date: "Survey Date",
  nps_score: "NPS Score",
  likelihood_to_recommend: "Likelihood to Recommend",
  service_rating: "Service Rating",
  comments: "Comments",
  
  // Daily metrics fields
  metric_date: "Date",
  total_shipments: "Total Shipments",
  successful_deliveries: "Successful Deliveries",
  failed_deliveries: "Failed Deliveries",
  delivery_success_rate: "Success Rate",
  revenue: "Revenue",
  avg_delivery_days: "Avg Delivery Days",
  new_customers: "New Customers",
  repeat_customers: "Repeat Customers",
  
  // Customer lifetime stats
  first_shipment_date: "First Shipment",
  last_shipment_date: "Last Shipment",
  // total_shipments: already defined in daily metrics
  total_revenue: "Total Revenue",
  avg_shipment_value: "Avg Shipment Value",
  // failed_deliveries: already defined in daily metrics
  // insurance_claims: already defined elsewhere
  is_churned: "Churned",
  churn_date: "Churn Date",
  predicted_ltv: "Predicted LTV",
  
  // Performance metrics
  month_year: "Month",
  shipment_count: "Shipment Count",
  on_time_pct: "On-Time %",
  on_time_rate: "On-Time Rate",
  avg_transit_days: "Avg Transit Days",
  capacity_utilization_pct: "Capacity Utilization %",
  avg_customer_satisfaction: "Avg Satisfaction",
  repeat_customer_pct: "Repeat Customer %",
  complaints: "Complaints",
  avg_cost: "Avg Cost",
  service_failures: "Service Failures",
  shipments: "Shipments",
  
  // Common aggregations and calculated fields
  count: "Count",
  avg_cost_impact: "Avg Cost Impact",
  failure_rate: "Failure Rate",
  avg_days: "Avg Days",
  total: "Total",
  average: "Average",
  sum: "Sum",
  min: "Minimum",
  max: "Maximum",
  route: "Route",
  
  // Timestamp fields
  created_at: "Created",
  updated_at: "Updated",
};

/**
 * Convert a database column name to a user-friendly display name
 */
export function getFriendlyColumnName(columnName: string): string {
  // Try exact match first
  if (COLUMN_NAME_MAPPING[columnName]) {
    return COLUMN_NAME_MAPPING[columnName];
  }
  
  // Try lowercase match
  const lowerMatch = COLUMN_NAME_MAPPING[columnName.toLowerCase()];
  if (lowerMatch) {
    return lowerMatch;
  }
  
  // Fallback: convert snake_case to Title Case
  return columnName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Convert an array of column names to friendly names
 */
export function getFriendlyColumnNames(columns: string[]): string[] {
  return columns.map(getFriendlyColumnName);
}
