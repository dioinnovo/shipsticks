"use client";

import { getFriendlyColumnName } from "@/lib/columnMapping";

interface DataTableDisplayProps {
  columns: string[];
  rows: any[][];
}

export function DataTableDisplay({ columns, rows }: DataTableDisplayProps) {
  // Check if a column name suggests it contains currency/monetary values
  const isCurrencyColumn = (columnName: string): boolean => {
    const currencyKeywords = [
      'revenue', 'price', 'cost', 'amount', 'value', 'fee',
      'margin', 'profit', 'spend', 'total_price', 'base_price',
      'carrier_cost', 'gross_margin', 'equipment_value', 'ltv',
      'cart_value', 'payout', 'deductible'
    ];
    const lowerColumnName = columnName.toLowerCase();
    return currencyKeywords.some(keyword => lowerColumnName.includes(keyword));
  };

  const formatValue = (value: any, columnIndex: number): string => {
    if (value === null || value === undefined) return "-";

    if (typeof value === "number") {
      const columnName = columns[columnIndex];

      // Check if this is a currency column
      if (isCurrencyColumn(columnName)) {
        // Format as currency with 2 decimal places
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(value);
      }

      // Check if it's a percentage (contains 'rate', 'pct', 'percent')
      if (columnName.toLowerCase().includes('rate') ||
          columnName.toLowerCase().includes('pct') ||
          columnName.toLowerCase().includes('percent')) {
        return value.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) + '%';
      }

      // Check if it's likely a count/integer (shipments, count, volume, etc.)
      if (Number.isInteger(value)) {
        return value.toLocaleString('en-US');
      }

      // Default: format with 2 decimal places
      return value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }

    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
  };

  return (
    <div className="w-full rounded-lg border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/50 px-3 py-2 sm:px-4">
        <h3 className="text-xs font-medium sm:text-sm">Query Results</h3>
        <p className="text-xs text-muted-foreground">
          {rows.length} {rows.length === 1 ? "result" : "results"}
        </p>
      </div>
      <div className="relative max-h-96 overflow-x-auto overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        {/* Scroll indicator for mobile */}
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-card to-transparent opacity-100 sm:opacity-0" />
        <table className="w-full text-xs sm:text-sm" data-testid="table-results">
            <thead>
              <tr className="border-b-2 border-border">
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="whitespace-nowrap px-3 py-2 text-left font-semibold uppercase tracking-wide sm:px-4 sm:py-3"
                    data-testid={`header-${column}`}
                  >
                    {getFriendlyColumnName(column)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-border last:border-b-0 hover:bg-muted/30"
                  data-testid={`row-${rowIndex}`}
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3"
                      data-testid={`cell-${rowIndex}-${cellIndex}`}
                    >
                      {formatValue(cell, cellIndex)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
      </div>
    </div>
  );
}
