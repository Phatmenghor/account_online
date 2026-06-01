"use client";

import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface CustomDateTimePickerProps {
  value?: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  disabled?: boolean;
  className?: string;
  error?: boolean;
}

const MONTHS = [
  { value: "01", label: "មករា" },
  { value: "02", label: "កុម្ភៈ" },
  { value: "03", label: "មីនា" },
  { value: "04", label: "មេសា" },
  { value: "05", label: "ឧសភា" },
  { value: "06", label: "មិថុនា" },
  { value: "07", label: "កក្កដា" },
  { value: "08", label: "សីហា" },
  { value: "09", label: "កញ្ញា" },
  { value: "10", label: "តុលា" },
  { value: "11", label: "វិច្ឆិកា" },
  { value: "12", label: "ធ្នូ" },
];

function getDaysInMonth(month: string, year: string): number {
  const m = parseInt(month);
  const y = parseInt(year);
  if (!m || !y) return 31;
  return new Date(y, m, 0).getDate();
}

export function CustomDateTimePicker({
  value,
  onChange,
  disabled = false,
  className,
  error = false,
}: CustomDateTimePickerProps) {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  useEffect(() => {
    if (value) {
      const parts = value.split("-");
      if (parts.length === 3) {
        setYear(parts[0]);
        setMonth(parts[1]);
        setDay(String(parseInt(parts[2])).padStart(2, "0"));
      }
    } else {
      setDay("");
      setMonth("");
      setYear("");
    }
  }, [value]);

  const emitChange = (d: string, m: string, y: string) => {
    if (d && m && y && y.length === 4) {
      onChange(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
    }
  };

  const handleDayChange = (d: string) => {
    setDay(d);
    emitChange(d, month, year);
  };

  const handleMonthChange = (m: string) => {
    setMonth(m);
    const maxDay = getDaysInMonth(m, year);
    const clampedDay = day && parseInt(day) > maxDay ? String(maxDay).padStart(2, "0") : day;
    if (clampedDay !== day) setDay(clampedDay);
    emitChange(clampedDay || day, m, year);
  };

  const handleYearChange = (y: string) => {
    setYear(y);
    emitChange(day, month, y);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));
  const daysInMonth = getDaysInMonth(month, year);
  const days = Array.from({ length: daysInMonth }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );

  const triggerClass = (extra?: string) =>
    cn("h-10 text-sm", error && "border-red-500", extra);

  return (
    <div className={cn("flex gap-2", className)}>
      {/* Day */}
      <Select value={day} onValueChange={handleDayChange} disabled={disabled}>
        <SelectTrigger className={triggerClass("flex-1")}>
          <SelectValue placeholder="ថ្ងៃ" />
        </SelectTrigger>
        <SelectContent className="max-h-52">
          {days.map((d) => (
            <SelectItem key={d} value={d}>
              {parseInt(d)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Month */}
      <Select value={month} onValueChange={handleMonthChange} disabled={disabled}>
        <SelectTrigger className={triggerClass("flex-[1.6]")}>
          <SelectValue placeholder="ខែ" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Year */}
      <Select value={year} onValueChange={handleYearChange} disabled={disabled}>
        <SelectTrigger className={triggerClass("flex-[1.4]")}>
          <SelectValue placeholder="ឆ្នាំ" />
        </SelectTrigger>
        <SelectContent className="max-h-52">
          {years.map((y) => (
            <SelectItem key={y} value={y}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
