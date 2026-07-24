"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  error?: boolean;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

export function CustomDatePicker({
  value,
  onChange,
  disabled = false,
  placeholder = "Select date",
  className,
  error = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  // confirmed date (from value prop)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  // pending date — highlighted in calendar but not yet applied
  const [pendingDate, setPendingDate] = useState<Date | null>(null);
  const [viewDate, setViewDate] = useState<Date>(new Date());

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
        setViewDate(date);
      } else {
        setSelectedDate(null);
        setViewDate(new Date());
      }
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  // When popover opens, start pending from current confirmed date
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setPendingDate(selectedDate);
      if (selectedDate) setViewDate(selectedDate);
    }
    setIsOpen(open);
  };

  const formatDate = (date: Date): string =>
    date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const formatDateForForm = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Clicking a day only sets pending — does NOT fire onChange or close
  const handleDateSelect = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    setPendingDate(newDate);
  };

  // Apply confirms pending date
  const handleApply = () => {
    if (!pendingDate) return;
    setSelectedDate(pendingDate);
    onChange(formatDateForForm(pendingDate));
    setIsOpen(false);
  };

  const handleMonthChange = (month: string) => {
    const monthIndex = MONTHS.indexOf(month);
    setViewDate(new Date(viewDate.getFullYear(), monthIndex, 1));
  };

  const handleYearChange = (year: string) => {
    setViewDate(new Date(parseInt(year), viewDate.getMonth(), 1));
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    setViewDate(newDate);
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setPendingDate(today);
    setViewDate(today);
    onChange(formatDateForForm(today));
    setIsOpen(false);
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedDate(null);
    setPendingDate(null);
    onChange("");
  };

  const generateCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const start = new Date(firstDay);
    start.setDate(start.getDate() - firstDay.getDay());

    const days: any[] = [];
    const cur = new Date(start);
    for (let i = 0; i < 35; i++) {
      days.push({
        date: new Date(cur),
        day: cur.getDate(),
        isCurrentMonth: cur.getMonth() === month,
        isPending: pendingDate ? cur.toDateString() === pendingDate.toDateString() : false,
        isConfirmed: selectedDate ? cur.toDateString() === selectedDate.toDateString() : false,
        isToday: cur.toDateString() === new Date().toDateString(),
      });
      cur.setDate(cur.getDate() + 1);
    }
    return days;
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years: string[] = [];
    for (let i = currentYear - 50; i <= currentYear + 50; i++) {
      years.push(i.toString());
    }
    return years;
  };

  const calendarDays = generateCalendarDays();
  const yearOptions = generateYearOptions();

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-9 px-3 text-sm relative",
            !selectedDate && "text-muted-foreground",
            error && "border-red-500 focus:border-red-500",
            !error && "focus:border-green-500",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          disabled={disabled}
        >
          <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4" />
          <span className="flex-1 ml-6">
            {selectedDate ? formatDate(selectedDate) : placeholder}
          </span>
          {selectedDate && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={clearSelection}
              onKeyDown={(e) => e.key === "Enter" && clearSelection(e as unknown as React.MouseEvent)}
              className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-6 p-0 flex items-center justify-center rounded hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <X className="h-3 w-3" />
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-72 p-0" align="start">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth("prev")}
              className="h-6 w-6 p-0 hover:bg-accent"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>

            <div className="flex gap-1">
              <Select value={MONTHS[viewDate.getMonth()]} onValueChange={handleMonthChange}>
                <SelectTrigger className="h-8 text-sm w-auto min-w-[60px] border-0 bg-transparent hover:bg-accent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month) => (
                    <SelectItem key={month} value={month}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={viewDate.getFullYear().toString()} onValueChange={handleYearChange}>
                <SelectTrigger className="h-8 text-sm w-auto min-w-[80px] border-0 bg-transparent hover:bg-accent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth("next")}
              className="h-6 w-6 p-0 hover:bg-accent"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-6 w-6 p-0 opacity-50 hover:opacity-100 hover:bg-accent"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="p-3">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((day, index) => (
              <div
                key={`${day}-${index}`}
                className="h-8 w-8 flex items-center justify-center text-xs font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((dayObj, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => handleDateSelect(dayObj.day)}
                disabled={!dayObj.isCurrentMonth}
                className={cn(
                  "h-8 w-8 p-0 text-xs font-normal transition-all hover:bg-accent hover:text-accent-foreground",
                  !dayObj.isCurrentMonth &&
                    "text-muted-foreground/30 hover:text-muted-foreground/30 hover:bg-transparent cursor-not-allowed",
                  // Pending (selected but not yet applied) — solid primary
                  dayObj.isPending &&
                    "bg-primary text-primary-foreground hover:bg-primary/90 font-medium ring-2 ring-primary/40",
                  // Confirmed but not pending (previous confirmed, browsing away)
                  dayObj.isConfirmed && !dayObj.isPending &&
                    "ring-1 ring-primary/50 text-primary font-medium",
                  // Today marker
                  dayObj.isToday && !dayObj.isPending &&
                    "bg-accent text-accent-foreground font-semibold ring-1 ring-border"
                )}
              >
                {dayObj.day}
              </Button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-muted/30 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="flex-1 h-8 text-xs hover:bg-accent"
          >
            Today
          </Button>
          <Button
            size="sm"
            onClick={handleApply}
            disabled={!pendingDate}
            className="flex-1 h-8 text-xs"
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Re-export so DateTimePickerField can import CustomDateTimePicker from this file
export { CustomDateTimePicker } from "./custom-datetime-picker";
