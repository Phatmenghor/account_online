"use client";

import { Clock, Info } from "lucide-react";
import React from "react";
import { AmlStatusEnum } from "@/constants/AppResource/filter/status";

interface AmlConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  status: AmlStatusEnum; // only PENDING expected
  onConfirm: () => Promise<void> | void;
  title?: string;
  description?: string;
  amlDetails?: {
    id: string;
    name: string;
    riskScore: number;
    flaggedDate: string;
    source?: string;
    country?: string;
  };
}

const AmlConfirmDialog = ({
  isOpen,
  onClose,
  status,
  onConfirm,
  title,
  description,
  amlDetails,
}: AmlConfirmDialogProps) => {
  if (!isOpen) return null;

  // Only Pending dialog
  const dialogProps = {
    variant: "warning" as const,
    confirmLabel: "Mark as Pending",
    confirmButtonIcon: <Clock className="w-4 h-4" />,
    icon: <Info className="w-6 h-6 text-yellow-500" />,
    defaultTitle: "Pending AML Alert",
    defaultDescription: "This AML alert is currently pending. Confirm action?",
  };

  const getButtonColor = () => "bg-yellow-500 hover:bg-yellow-600 text-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          {dialogProps.icon}
          <h2 className="text-xl font-semibold">{title || dialogProps.defaultTitle}</h2>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-6">{description || dialogProps.defaultDescription}</p>

        {/* AML Details Section */}
        {amlDetails && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6 space-y-2">
            <DetailRow label="AML ID" value={amlDetails.id} />
            <DetailRow label="Name" value={amlDetails.name} />
            <DetailRow label="Risk Score" value={amlDetails.riskScore} />
            <DetailRow label="Flagged Date" value={amlDetails.flaggedDate} />
            {amlDetails.source && <DetailRow label="Source" value={amlDetails.source} />}
            {amlDetails.country && <DetailRow label="Country" value={amlDetails.country} />}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg flex items-center justify-center gap-1 ${getButtonColor()} transition-colors`}
          >
            {dialogProps.confirmButtonIcon}
            {dialogProps.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper component for detail rows
const DetailRow = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex justify-between text-gray-700">
    <span className="font-medium">{label}:</span>
    <span>{value}</span>
  </div>
);

export default AmlConfirmDialog;
