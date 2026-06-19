"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type DatePickerProps = {
  label?: string;
  date?: Date;
  onChange: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
};

export function DatePicker({
  label,
  date,
  onChange,
  disabled,
}: DatePickerProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-600">{label}</label>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal px-4 rounded-lg border border-gray-200 hover:bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-3 h-5 w-5 text-gray-400" />
            {date ? (
              <span className="text-gray-900 font-medium">
                {format(date, "yyyy-MM-dd")}
              </span>
            ) : (
              <span className="text-gray-500">Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[280px] h-[320px] p-0 shadow-lg border border-gray-200 rounded-lg bg-white"
          align="start"
          sideOffset={4}
        >
          <div className="p-3 h-full flex flex-col">
            <Calendar
              mode="single"
              selected={date}
              onSelect={onChange}
              disabled={disabled}
              initialFocus
              fixedWeeks
              showOutsideDays
              className="rounded-md w-full h-full flex flex-col"
              classNames={{
                months: "flex flex-col space-y-4 w-full h-full",
                month: "space-y-3 w-full h-full flex flex-col",
                caption:
                  "flex justify-center pt-1 relative items-center text-sm font-medium text-gray-900 h-10 flex-shrink-0",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                  "inline-flex items-center justify-center rounded-md w-7 h-7 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse mt-3 flex-1",
                head_row: "flex w-full",
                head_cell:
                  "text-gray-500 rounded-md flex-1 font-normal text-xs text-center py-2 h-8 flex items-center justify-center",
                row: "flex w-full flex-1",
                cell: cn(
                  "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-orange-50 flex-1 flex items-center justify-center"
                ),
                day: cn(
                  "inline-flex items-center justify-center rounded-md w-8 h-8 text-sm font-normal transition-all hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 aria-selected:opacity-100"
                ),
                day_selected:
                  "bg-orange-500 text-white hover:bg-orange-600 hover:text-white focus:bg-orange-600 focus:text-white font-medium",
                day_today: "bg-orange-100 text-orange-700 font-medium",
                day_outside:
                  "text-gray-400 opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                day_disabled: "text-gray-300 opacity-50",
                day_range_middle:
                  "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
              }}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
