"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { AmlStatusEnum } from "@/constants/AppResource/display-list/enum/status";

interface AmlStatusFilterProps {
  selectedStatus?: AmlStatusEnum;
  onChange: (status: AmlStatusEnum) => void;
}

const statusList: { label: string; value: AmlStatusEnum }[] = [
  { label: "All", value: AmlStatusEnum.ALL },
  { label: "Approved", value: AmlStatusEnum.APPROVE },
  { label: "Rejected", value: AmlStatusEnum.REJECT },
  { label: "Pending", value: AmlStatusEnum.PENDING },
];

export default function AmlStatusFilter({
  selectedStatus = AmlStatusEnum.ALL,
  onChange,
}: AmlStatusFilterProps) {
  const [status, setStatus] = useState<AmlStatusEnum>(selectedStatus);

  useEffect(() => {
    setStatus(selectedStatus);
  }, [selectedStatus]);

  const handleChange = (value: string) => {
    const selected = value as AmlStatusEnum;
    setStatus(selected);
    onChange(selected);
  };

  return (
    <Select value={status} onValueChange={handleChange}>
      <SelectTrigger className="w-[150px] text-sm h-9">
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        {statusList.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
