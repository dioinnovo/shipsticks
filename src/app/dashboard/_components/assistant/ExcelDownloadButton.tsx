"use client";

import { useState } from "react";
import { Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import { getFriendlyColumnNames } from "@/lib/columnMapping";

interface ExcelDownloadButtonProps {
  columns: string[];
  rows: any[][];
}

export function ExcelDownloadButton({ columns, rows }: ExcelDownloadButtonProps) {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    // Create worksheet data with friendly column headers
    const friendlyColumns = getFriendlyColumnNames(columns);
    const wsData = [friendlyColumns, ...rows];

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Auto-size columns based on friendly names
    const colWidths = friendlyColumns.map((col, i) => {
      const maxLength = Math.max(
        col.length,
        ...rows.map((row) => String(row[i] || "").length)
      );
      return { wch: Math.min(maxLength + 2, 50) };
    });
    ws["!cols"] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Query Results");

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    const filename = `ship-sticks-data-${timestamp}.xlsx`;

    // Download
    XLSX.writeFile(wb, filename);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <Button
      onClick={handleDownload}
      variant="outline"
      className="w-full gap-2 sm:w-auto"
      data-testid="button-download-excel"
    >
      {downloaded ? (
        <>
          <Check className="h-4 w-4" />
          <span className="text-sm">Downloaded</span>
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          <span className="text-sm">Download Excel</span>
        </>
      )}
    </Button>
  );
}
