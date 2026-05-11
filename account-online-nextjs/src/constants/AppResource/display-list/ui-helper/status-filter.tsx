"use client";

import { CustomSelect } from "@/components/shared/select/custom-select";
import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction } from "react";
import { Status } from "../enum/status";

interface filterProps {
  statusFilter: string;
  setStatusFilter: Dispatch<SetStateAction<string>>;
}
export default function StatusFilter({
  statusFilter,
  setStatusFilter,
}: filterProps) {
  const t = useTranslations("common.status");

  const STATUS_FILTER = [
    { value: Status.ACTIVE, label: t("active") },
    { value: Status.DELETE, label: t("delete") },
  ];

  return (
    <CustomSelect
      options={STATUS_FILTER}
      value={statusFilter}
      placeholder={t("active")}
      onValueChange={(value) => setStatusFilter(value as Status)}
    />
  );
}
