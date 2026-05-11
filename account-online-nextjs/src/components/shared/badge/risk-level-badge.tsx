// components/shared/badge/risk-badge.tsx
"use client";

import React from "react";

interface RiskBadgeProps {
  riskLevel?: string; // accept any string
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ riskLevel }) => {
  const riskColorMap: Record<string, string> = {
    High: "bg-red-100 text-red-800",
    Low: "bg-green-100 text-green-800",
  };

  // use color from map or default gray if not found
  const badgeClass = riskLevel
    ? riskColorMap[riskLevel] || "bg-gray-100 text-gray-800"
    : "bg-gray-100 text-gray-800";

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${badgeClass}`}
    >
      {riskLevel || "-"}
    </span>
  );
};

export default RiskBadge;
