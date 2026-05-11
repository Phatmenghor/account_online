"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CustomDatePicker } from "@/components/shared/common/custom-date-picker";

interface DateRangeFilterProps {
  onFilterChange: (startDate: string | null, endDate: string | null) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  onFilterChange,
}) => {
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const handleApply = () => {
    onFilterChange(startDate, endDate);
  };

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    onFilterChange(null, null);
  };

  return (
    <div className="flex flex-wrap gap-4 items-end">
      {/* Start Date */}
      <div className="flex flex-col">
        <Label>Start Date</Label>
        <CustomDatePicker
          value={startDate || ""}
          onChange={(date) => setStartDate(date)}
          placeholder="Start Date"
        />
      </div>

      {/* End Date */}
      <div className="flex flex-col">
        <Label>End Date</Label>
        <CustomDatePicker
          value={endDate || ""}
          onChange={(date) => setEndDate(date)}
          placeholder="End Date"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <Button size="sm" onClick={handleApply}>
          Apply
        </Button>
        <Button size="sm" variant="outline" onClick={handleReset}>
          Reset
        </Button>
      </div>
    </div>
  );
};

export default DateRangeFilter;
