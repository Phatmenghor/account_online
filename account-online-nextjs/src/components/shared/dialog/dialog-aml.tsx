"use client";

import { AmlStatusEnum } from "@/constants/AppResource/display-list/enum/status";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";

interface AmlConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  status: AmlStatusEnum;
  onConfirm: (comment?: string) => Promise<void> | void;
  title?: string;
  description?: string;
  isLoading: boolean;
  amlDetails?: {
    id: string;
    name: string;
    riskScore: number;
    flaggedDate: string;
    source?: string;
    country?: string;
  };
}

type DialogVariant = "info" | "danger" | "warning";

interface DialogProps {
  variant: DialogVariant;
  confirmLabel: string;
  confirmButtonIcon: React.ReactNode;
  icon: React.ReactNode;
  defaultTitle: string;
  defaultDescription: string;
}

const AmlConfirmDialog = ({
  isOpen,
  onClose,
  status,
  onConfirm,
  title,
  isLoading,
  description,
  amlDetails,
}: AmlConfirmDialogProps) => {
  const [comment, setComment] = useState("");

  // Reset comment when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setComment("");
    }
  }, [isOpen]);

  const getDialogProps = (): DialogProps => {
    switch (status) {
      case AmlStatusEnum.APPROVE:
        return {
          variant: "info",
          confirmLabel: "Approve",
          confirmButtonIcon: <CheckCircle className="h-4 w-4 mr-1" />,
          icon: <CheckCircle className="h-14 w-14 text-orange-500" />,
          defaultTitle: "Approve AML Record",
          defaultDescription:
            "You are about to approve this AML record. This action cannot be undone.",
        };
      case AmlStatusEnum.REJECT:
        return {
          variant: "danger",
          confirmLabel: "Reject",
          confirmButtonIcon: <XCircle className="h-4 w-4 mr-1" />,
          icon: <XCircle className="h-14 w-14 text-red-500" />,
          defaultTitle: "Reject AML Record",
          defaultDescription:
            "You are about to reject this AML record. This action cannot be undone.",
        };
      default:
        return {
          variant: "warning",
          confirmLabel: "Mark as Pending",
          confirmButtonIcon: <Clock className="h-4 w-4 mr-1" />,
          icon: <Clock className="h-14 w-14 text-yellow-500" />,
          defaultTitle: "Set AML to Pending",
          defaultDescription:
            "You are about to mark this AML record as pending.",
        };
    }
  };

  const dialogProps = getDialogProps();

  const getButtonColor = () => {
    switch (dialogProps.variant) {
      case "info":
        return "bg-orange-500 hover:bg-orange-600 text-white";
      case "danger":
        return "bg-red-500 hover:bg-red-600 text-white";
      case "warning":
        return "bg-yellow-500 hover:bg-yellow-600 text-white";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case AmlStatusEnum.APPROVE:
        return (
          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
            Approved
          </span>
        );
      case AmlStatusEnum.REJECT:
        return (
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
            Rejected
          </span>
        );
      default:
        return (
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
            Pending
          </span>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Dialog Box */}
          <motion.div
            className="bg-white rounded-2xl shadow-xl max-w-[520px] w-full p-6 relative"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", stiffness: 180, damping: 18 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                {dialogProps.icon}
                <h2 className="text-xl font-semibold">
                  {title || dialogProps.defaultTitle}
                </h2>
              </div>
              {getStatusBadge()}
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-6">
              {description || dialogProps.defaultDescription}
            </p>

            {/* Details Section */}
            {amlDetails && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6 space-y-2">
                <DetailRow label="AML ID" value={amlDetails.id} />
                <DetailRow label="Name" value={amlDetails.name} />
                <DetailRow label="Risk Score" value={amlDetails.riskScore} />
                <DetailRow
                  label="Flagged Date"
                  value={amlDetails.flaggedDate}
                />
                {amlDetails.source && (
                  <DetailRow label="Source" value={amlDetails.source} />
                )}
                {amlDetails.country && (
                  <DetailRow label="Country" value={amlDetails.country} />
                )}
              </div>
            )}

            {/* Comment Section (New) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment (Optional)
              </label>
              <Textarea
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full resize-none"
                rows={3}
                disabled={isLoading}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors ${isLoading && "opacity-50 cursor-not-allowed"
                  }`}
              >
                Cancel
              </button>

              <button
                onClick={() => onConfirm(comment)}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg flex items-center justify-center gap-2 ${getButtonColor()} transition-colors ${isLoading && "opacity-70 cursor-not-allowed"
                  }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {dialogProps.confirmButtonIcon}
                    {dialogProps.confirmLabel}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="flex justify-between text-gray-700">
    <span className="font-medium">{label}:</span>
    <span>{value}</span>
  </div>
);

export default AmlConfirmDialog;
