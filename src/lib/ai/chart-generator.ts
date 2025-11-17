/**
 * Chart Generator for SQL Analytics
 * Automatically detects appropriate chart type and formats data for Chart.js
 */

import { getFriendlyColumnName } from "@/lib/columnMapping";

export interface ChartData {
  type: "bar" | "line" | "pie";
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
  }>;
  title?: string;
}

/**
 * Determine the best chart type based on data characteristics
 * - Date/time columns → Line chart (for trends over time)
 * - Few rows (<10) with 2 columns → Pie chart (for proportions)
 * - Default → Bar chart (for comparisons)
 *
 * @param columns Column names from SQL query
 * @param rows Data rows from SQL query
 * @returns Recommended chart type
 */
export function determineChartType(
  columns: string[],
  rows: any[][]
): "bar" | "line" | "pie" | null {
  // Need at least 2 columns and some data for a chart
  if (rows.length === 0 || columns.length < 2) {
    return null;
  }

  // Check if we have a date/time column → use line chart for time-series
  const hasDateColumn = columns.some(col => {
    const colLower = col.toLowerCase();
    return (
      colLower.includes('date') ||
      colLower.includes('month') ||
      colLower.includes('year') ||
      colLower.includes('week') ||
      colLower.includes('day') ||
      colLower.includes('time') ||
      colLower.includes('period')
    );
  });

  if (hasDateColumn) {
    return "line";
  }

  // If we have only a few rows (< 10) and exactly 2 columns, use pie chart
  // Good for showing proportions/percentages
  if (rows.length < 10 && columns.length === 2) {
    return "pie";
  }

  // Default to bar chart for comparisons
  return "bar";
}

/**
 * Detect the metric type of a column based on its name
 */
function getMetricType(columnName: string): 'currency' | 'percentage' | 'count' | 'other' {
  const lowerName = columnName.toLowerCase();

  // Currency indicators
  const currencyKeywords = [
    'revenue', 'price', 'cost', 'amount', 'value', 'fee',
    'margin', 'profit', 'spend', 'ltv', 'cac', 'payout'
  ];
  if (currencyKeywords.some(keyword => lowerName.includes(keyword))) {
    return 'currency';
  }

  // Percentage indicators
  if (lowerName.includes('rate') || lowerName.includes('pct') || lowerName.includes('percent')) {
    return 'percentage';
  }

  // Count indicators
  const countKeywords = [
    'count', 'total', 'number', 'shipments', 'customers',
    'volume', 'quantity', 'claims', 'tickets', 'sessions'
  ];
  if (countKeywords.some(keyword => lowerName.includes(keyword))) {
    return 'count';
  }

  return 'other';
}

/**
 * Identify which columns contain numeric data
 */
function getNumericColumnIndices(columns: string[], rows: any[][]): number[] {
  const numericIndices: number[] = [];

  // Check each column (starting from index 1, since index 0 is labels)
  for (let colIdx = 1; colIdx < columns.length; colIdx++) {
    // Check if at least one row has a numeric value in this column
    const hasNumericData = rows.some(row => {
      const value = row[colIdx];
      if (typeof value === 'number') return true;
      if (typeof value === 'string') {
        const cleaned = value.replace(/[$,€£¥]/g, '').trim();
        return !isNaN(parseFloat(cleaned));
      }
      return false;
    });

    if (hasNumericData) {
      numericIndices.push(colIdx);
    }
  }

  return numericIndices;
}

/**
 * Select the primary metric column when multiple metrics exist
 * Prefers the first numeric column, but filters out incompatible secondary metrics
 */
function selectPrimaryMetrics(columns: string[], rows: any[][]): number[] {
  // First, identify which columns are actually numeric
  const numericIndices = getNumericColumnIndices(columns, rows);

  if (numericIndices.length === 0) {
    console.log('⚠️  No numeric columns found for charting');
    return [];
  }

  if (numericIndices.length === 1) {
    // Only one numeric column, use it
    return numericIndices;
  }

  // Get metric types for numeric columns only
  const metricTypes = numericIndices.map(idx => getMetricType(columns[idx]));
  const primaryType = metricTypes[0];

  // If all numeric metrics are the same type, include all of them
  if (metricTypes.every(type => type === primaryType)) {
    return numericIndices;
  }

  // Mixed metric types detected - only use the primary (first numeric) metric
  console.log('⚠️  Mixed metric types detected. Using primary metric only:', columns[numericIndices[0]]);
  return [numericIndices[0]];
}

/**
 * Generate Chart.js-compatible data structure from SQL results
 * Assumes first column is labels, remaining columns are datasets
 *
 * @param columns Column names from SQL query
 * @param rows Data rows from SQL query
 * @returns Chart.js data structure or null if data cannot be charted
 */
export function generateChartData(
  columns: string[],
  rows: any[][]
): ChartData | null {
  // Validate we have chartable data
  if (rows.length === 0 || columns.length < 2) {
    console.log('⚠️  Not enough data for chart generation');
    return null;
  }

  const chartType = determineChartType(columns, rows);
  if (!chartType) {
    return null;
  }

  // Determine which column to use for labels
  // Prefer a string/name column over numeric IDs for better readability
  let labelColumnIndex = 0;

  // Check if there's a non-numeric column that would make better labels
  if (columns.length > 2) {
    // Look for a string column (like course_name, customer_name, etc.)
    for (let i = 1; i < columns.length; i++) {
      const hasStringData = rows.some(row => {
        const value = row[i];
        return typeof value === 'string' && isNaN(parseFloat(value));
      });

      if (hasStringData) {
        // Found a string column, use it for labels
        labelColumnIndex = i;
        break;
      }
    }
  }

  // Extract labels from the selected column
  const labels = rows.map(row => {
    const value = row[labelColumnIndex];
    // Format dates nicely if detected
    if (value instanceof Date) {
      return value.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    // Convert to string and truncate if too long
    const str = String(value);
    return str.length > 30 ? str.substring(0, 27) + '...' : str;
  });

  // Select which metric columns to include (filter out incompatible mixed metrics)
  const metricColumnIndices = selectPrimaryMetrics(columns, rows);

  // If no numeric columns found, cannot create chart
  if (metricColumnIndices.length === 0) {
    console.log('⚠️  No numeric data columns available for charting');
    return null;
  }

  // Remaining columns become datasets (y-values or pie values)
  const datasets = metricColumnIndices.map((colIdx) => {
    const colName = columns[colIdx];
    const data = rows.map(row => {
      const value = row[colIdx];
      // Convert to number, handling various formats
      if (typeof value === 'number') {
        return value;
      }
      if (typeof value === 'string') {
        // Remove currency symbols, commas, and parse
        const cleaned = value.replace(/[$,€£¥]/g, '').trim();
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    });

    return {
      label: getFriendlyColumnName(colName),
      data,
    };
  });

  // Generate a meaningful title based on metrics being displayed
  const displayedMetrics = metricColumnIndices.map(idx => getFriendlyColumnName(columns[idx]));
  const labelColumnName = getFriendlyColumnName(columns[labelColumnIndex]);
  const title = displayedMetrics.length === 1
    ? `${displayedMetrics[0]} by ${labelColumnName}`
    : `${displayedMetrics.join(', ')} by ${labelColumnName}`;

  return {
    type: chartType,
    labels,
    datasets,
    title,
  };
}

/**
 * Check if query results are suitable for chart visualization
 * @param columns Column names
 * @param rows Data rows
 * @returns true if data can be charted
 */
export function isChartable(columns: string[], rows: any[][]): boolean {
  // Need at least 2 columns
  if (columns.length < 2) {
    return false;
  }

  // Need at least 1 row of data
  if (rows.length === 0) {
    return false;
  }

  // Need at least one numeric column (for y-values)
  const hasNumericData = rows.some(row =>
    row.slice(1).some(cell => typeof cell === 'number' || !isNaN(parseFloat(String(cell))))
  );

  return hasNumericData;
}

/**
 * Format a column name to be more human-readable
 * Converts snake_case to Title Case and handles common abbreviations
 *
 * @param columnName Raw column name from database
 * @returns Formatted column name
 */
export function formatColumnName(columnName: string): string {
  // Handle common abbreviations
  const abbreviations: Record<string, string> = {
    'ltv': 'Lifetime Value',
    'nps': 'Net Promoter Score',
    'roi': 'Return on Investment',
    'avg': 'Average',
    'min': 'Minimum',
    'max': 'Maximum',
    'count': 'Count',
    'sum': 'Sum',
    'id': 'ID',
  };

  // Split on underscores and capitalize
  const words = columnName
    .toLowerCase()
    .split('_')
    .map(word => {
      // Check if it's a known abbreviation
      if (abbreviations[word]) {
        return abbreviations[word];
      }
      // Capitalize first letter
      return word.charAt(0).toUpperCase() + word.slice(1);
    });

  return words.join(' ');
}

/**
 * Get friendly column names for all columns
 * @param columns Array of column names
 * @returns Array of formatted column names
 */
export function getFriendlyColumnNames(columns: string[]): string[] {
  return columns.map(formatColumnName);
}
