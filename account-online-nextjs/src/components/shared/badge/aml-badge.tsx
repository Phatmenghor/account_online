// components/shared/badge/status-badge.tsx
"use client";

import React from "react";

interface StatusBadgeProps {
  status?: string;
}

const AmlStatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusColorMap: Record<string, string> = {
    APPROVE: "bg-green-100 text-green-800",
    REJECT: "bg-red-100 text-red-800",
    PENDING: "bg-yellow-100 text-yellow-800",
  };

  const badgeClass = status
    ? statusColorMap[status.toUpperCase()] || "bg-gray-100 text-gray-800"
    : "bg-gray-100 text-gray-800";

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${badgeClass}`}
    >
      {status || "-"}
    </span>
  );
};

export default AmlStatusBadge;
