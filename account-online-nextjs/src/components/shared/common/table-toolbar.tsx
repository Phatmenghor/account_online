import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TableToolbarProps {
  searchQuery?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchPlaceholder?: string;
  searchAriaLabel?: string;
  disabled?: boolean;
  leftFilters?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function TableToolbar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search...",
  searchAriaLabel = "search-input",
  disabled = false,
  leftFilters,
  actions,
  className,
}: TableToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4",
        className
      )}
    >
      {/* Left side: Search input alone on the left */}
      {onSearchChange !== undefined && (
        <div className="relative w-full sm:w-[300px] md:w-[360px] shrink-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            aria-label={searchAriaLabel}
            type="search"
            placeholder={searchPlaceholder}
            value={searchQuery ?? ""}
            onChange={onSearchChange}
            className="pl-8 w-full text-xs h-9 focus-visible:ring-emerald-500"
            disabled={disabled}
          />
        </div>
      )}

      {/* Right side: All filters + Action buttons aligned to the right near Add/New */}
      {(leftFilters || actions) && (
        <div className="flex flex-wrap items-center justify-end gap-2.5 shrink-0 ml-auto w-full sm:w-auto">
          {leftFilters}
          {actions}
        </div>
      )}
    </div>
  );
}
