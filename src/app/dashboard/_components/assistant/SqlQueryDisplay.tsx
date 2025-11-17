"use client";

import { useState } from "react";
import { ChevronRight, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SqlQueryDisplayProps {
  query: string;
}

export function SqlQueryDisplay({ query }: SqlQueryDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full overflow-hidden rounded-lg border border-border bg-card">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left hover-elevate sm:px-4 sm:py-3"
        data-testid="button-toggle-sql"
      >
        <ChevronRight
          className={`h-3.5 w-3.5 transition-transform sm:h-4 sm:w-4 ${isExpanded ? "rotate-90" : ""}`}
        />
        <span className="text-xs font-medium sm:text-sm">Generated SQL Query</span>
      </button>

      {isExpanded && (
        <div className="relative border-t border-border">
          <div className="absolute right-2 top-2 z-10">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCopy}
              className="h-7 w-7 sm:h-8 sm:w-8"
              data-testid="button-copy-sql"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-chart-2 sm:h-4 sm:w-4" />
              ) : (
                <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              )}
            </Button>
          </div>
          <pre className="overflow-x-auto bg-muted p-3 text-xs sm:p-4 sm:text-sm">
            <code className="font-mono text-foreground" data-testid="text-sql-query">
              {query}
            </code>
          </pre>
        </div>
      )}
    </div>
  );
}
